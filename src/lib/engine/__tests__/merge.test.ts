import { describe, expect, it } from "vitest";
import { mergeEngines, mergeRefusal, type MergeChange } from "../merge";
import { startNextMonth } from "../series";
import { SHARED_COUNTS } from "../shared-counts";
import { MAX_MONTHS, type EngineState, type SharedCount } from "../types";
import { validateEngine } from "../validate";
import { exampleState, hybridState, measured, ratio, withMonthBefore } from "./fixtures";

/**
 * « Fusionner dans {nom} » (engine spec §19.7, C32 Q13, A14 T5): two copies of
 * one engine come back together month by month, every change listed before
 * anything is written, and refused when the two would not measure the same
 * thing.
 */

const SEPT = new Date(2026, 9, 3);
const SEPT_ISO = "2026-10-03T09:00:00.000Z";

/** The device's engine, and the same engine on another device: a structured copy. */
function twoCopies(): { device: EngineState; file: EngineState } {
  const device = exampleState();
  return { device, file: structuredClone(device) };
}

function ok(result: ReturnType<typeof mergeEngines>): { state: EngineState; changes: MergeChange[] } {
  if (result.kind !== "ok") throw new Error(`refused: ${result.reason}`);
  return result;
}

describe("mergeEngines — months", () => {
  it("a month only the file holds is added; the device's open month takes the day the file closed it", () => {
    const { device, file } = twoCopies();
    const later = startNextMonth(file, SEPT, SEPT_ISO, () => "sept")!;
    later.snapshots[1]!.createdAt = "2026-10-05T09:00:00.000Z";
    const { state, changes } = ok(mergeEngines(device, later));
    expect(state.snapshots.map((s) => s.referenceMonth)).toEqual(["2026-08", "2026-09"]);
    expect(state.snapshots[0]).toMatchObject({ closedAt: SEPT_ISO, windows: { activationWindowDays: 7, paidWindowDays: 30 } });
    expect(state.snapshots[1]!.closedAt).toBeUndefined();
    expect(changes).toEqual([{ kind: "month-added", month: "2026-09", numbers: 0 }]);
    expect(validateEngine(state)).toEqual(validateEngine(device));
  });

  it("a month the merge puts before a later one is closed on the day that one started, with the setup's windows", () => {
    const { device, file } = twoCopies();
    const later = startNextMonth(file, SEPT, SEPT_ISO, () => "sept")!;
    // The file holds September alone: nothing on its side says when August closed.
    later.snapshots = [{ ...later.snapshots[1]!, createdAt: "2026-10-05T09:00:00.000Z" }];
    const { state, changes } = ok(mergeEngines(device, later));
    expect(state.snapshots[0]).toMatchObject({ closedAt: "2026-10-05T09:00:00.000Z", windows: { activationWindowDays: 7, paidWindowDays: 30 } });
    expect(changes).toEqual([
      { kind: "month-added", month: "2026-09", numbers: 0 },
      { kind: "closed", month: "2026-08", closedAt: "2026-10-05T09:00:00.000Z" },
    ]);
  });

  it("a month before the device's first is added before it, closed on the day the device's started", () => {
    const device = exampleState();
    const file = withMonthBefore(exampleState());
    // The file's July, open: the device only ever held August.
    const july = { ...file.snapshots[0]! };
    delete july.closedAt;
    delete july.windows;
    const { state, changes } = ok(mergeEngines(device, { ...file, snapshots: [july] }));
    expect(state.snapshots.map((s) => s.referenceMonth)).toEqual(["2026-07", "2026-08"]);
    expect(state.snapshots[0]!.closedAt).toBe(device.snapshots[0]!.createdAt);
    const added = changes.find((c) => c.kind === "month-added") as Extract<MergeChange, { kind: "month-added" }>;
    expect(added.month).toBe("2026-07");
    expect(added.numbers).toBeGreaterThan(10);
    expect(changes).toContainEqual({ kind: "closed", month: "2026-07", closedAt: device.snapshots[0]!.createdAt });
  });

  it("nothing on either side moves when the file is the device's own copy", () => {
    const { device, file } = twoCopies();
    const { state, changes } = ok(mergeEngines(device, file));
    expect(changes).toEqual([]);
    expect(state).toEqual(device);
  });
});

describe("mergeEngines — numbers in a month both hold", () => {
  it("an empty side takes the other: absent, « à faire » or only « demandé »", () => {
    const { device, file } = twoCopies();
    delete device.snapshots[0]!.metrics["acq.signup-rate"];
    device.snapshots[0]!.metrics["act.rate"] = { status: "todo", updatedAt: "2026-09-25T10:00:00.000Z" };
    const fileEntry = file.snapshots[0]!.metrics["ref.k-factor"]!;
    file.snapshots[0]!.metrics["ref.k-factor"] = measured(ratio(12, 400), { kind: "tool", tool: "product-db" }, { updatedAt: "2026-09-19T10:00:00.000Z" });
    const { state, changes } = ok(mergeEngines(device, file));
    const m = state.snapshots[0]!.metrics;
    expect(m["acq.signup-rate"]).toEqual(file.snapshots[0]!.metrics["acq.signup-rate"]);
    expect(m["act.rate"]).toEqual(file.snapshots[0]!.metrics["act.rate"]);
    // The device had only asked for K: the file's reading wins, though it is OLDER than the request.
    expect(fileEntry.status).toBe("requested");
    expect(m["ref.k-factor"]).toEqual(file.snapshots[0]!.metrics["ref.k-factor"]);
    expect(changes.filter((c) => c.kind === "filled").map((c) => (c as { id: string }).id).sort()).toEqual(["acq.signup-rate", "act.rate", "ref.k-factor"]);
  });

  it("two different readings: the more recent wins, listed with the one it replaces", () => {
    const { device, file } = twoCopies();
    const before = device.snapshots[0]!.metrics["acq.signup-rate"]!;
    const after = measured(ratio(500, 10_000), { kind: "tool", tool: "ga4" }, { updatedAt: "2026-09-30T10:00:00.000Z" });
    file.snapshots[0]!.metrics["acq.signup-rate"] = after;
    const { state, changes } = ok(mergeEngines(device, file));
    expect(state.snapshots[0]!.metrics["acq.signup-rate"]).toEqual(after);
    expect(changes).toEqual([{ kind: "replaced", month: "2026-08", id: "acq.signup-rate", before, after }]);
  });

  it("the device's reading stays when it is the more recent, or on a tie", () => {
    const { device, file } = twoCopies();
    const mine = device.snapshots[0]!.metrics["acq.signup-rate"]!;
    file.snapshots[0]!.metrics["acq.signup-rate"] = measured(ratio(500, 10_000), undefined, { updatedAt: "2026-09-01T10:00:00.000Z" });
    expect(ok(mergeEngines(device, file)).state.snapshots[0]!.metrics["acq.signup-rate"]).toEqual(mine);
    file.snapshots[0]!.metrics["acq.signup-rate"] = measured(ratio(500, 10_000), undefined, { updatedAt: mine.updatedAt });
    const tie = ok(mergeEngines(device, file));
    expect(tie.state.snapshots[0]!.metrics["acq.signup-rate"]).toEqual(mine);
    expect(tie.changes).toEqual([]);
  });

  it("two equal readings stay the device's, even written later, from another source or with another note", () => {
    const { device, file } = twoCopies();
    const mine = device.snapshots[0]!.metrics["acq.signup-rate"]!;
    file.snapshots[0]!.metrics["acq.signup-rate"] = { ...mine, source: { kind: "other" }, note: "relu", updatedAt: "2026-09-30T10:00:00.000Z" };
    const { state, changes } = ok(mergeEngines(device, file));
    expect(state.snapshots[0]!.metrics["acq.signup-rate"]).toEqual(mine);
    expect(changes).toEqual([]);
  });

  it("a variant is part of the reading: the same value under another variant is a different one", () => {
    const { device, file } = twoCopies();
    const mine = device.snapshots[0]!.metrics["acq.cac"]!;
    const theirs = { ...mine, variant: mine.variant === "fully-loaded" ? "media-only" : "fully-loaded", updatedAt: "2026-09-30T10:00:00.000Z" };
    file.snapshots[0]!.metrics["acq.cac"] = theirs;
    expect(ok(mergeEngines(device, file)).changes).toEqual([{ kind: "replaced", month: "2026-08", id: "acq.cac", before: mine, after: theirs }]);
  });

  it("a request on the file's side never replaces a reading", () => {
    const { device, file } = twoCopies();
    const mine = device.snapshots[0]!.metrics["acq.signup-rate"]!;
    file.snapshots[0]!.metrics["acq.signup-rate"] = { status: "requested", request: { role: "marketing", requestedAt: "2026-09-30T10:00:00.000Z" }, updatedAt: "2026-09-30T10:00:00.000Z" };
    expect(ok(mergeEngines(device, file)).state.snapshots[0]!.metrics["acq.signup-rate"]).toEqual(mine);
  });

  it("a cohort number from a month that followed another cohort keeps its own cohort", () => {
    const { device, file } = twoCopies();
    delete device.snapshots[0]!.metrics["act.rate"];
    file.snapshots[0]!.cohortMonth = "2026-06";
    const { state } = ok(mergeEngines(device, file));
    expect(state.snapshots[0]!.cohortMonth).toBe("2026-07");
    expect(state.snapshots[0]!.metrics["act.rate"]?.cohortMonth).toBe("2026-06");
    // A flow number has no cohort to keep.
    delete device.snapshots[0]!.metrics["acq.signup-rate"];
    expect(ok(mergeEngines(device, file)).state.snapshots[0]!.metrics["acq.signup-rate"]?.cohortMonth).toBeUndefined();
  });
});

describe("mergeEngines — targets, counts, pipeline", () => {
  it("the file's targets only fill the targets the device has not set", () => {
    const { device, file } = twoCopies();
    device.snapshots[0]!.targets = { "act.rate": 40 };
    file.snapshots[0]!.targets = { "act.rate": 50, "rev.paid-conversion": 12 };
    const { state, changes } = ok(mergeEngines(device, file));
    expect(state.snapshots[0]!.targets).toEqual({ "act.rate": 40, "rev.paid-conversion": 12 });
    expect(changes).toEqual([{ kind: "target-filled", month: "2026-08", id: "rev.paid-conversion", after: 12 }]);
  });

  it("a shared count and the open pipeline only fill what the device has not typed", () => {
    const device = hybridState();
    const file = structuredClone(device);
    const count = Object.keys(device.snapshots[0]!.base ?? {})[0] as SharedCount;
    expect(count).toBeDefined();
    const mine = device.snapshots[0]!.base![count]!;
    // The cohort's sign-ups typed on the other device, before any number that carries them.
    const cohortNumbers = SHARED_COUNTS.cohortSignups.map((slot) => slot.metric);
    for (const state of [device, file]) for (const id of cohortNumbers) delete state.snapshots[0]!.metrics[id];
    file.snapshots[0]!.base = { ...file.snapshots[0]!.base, [count]: mine + 7, cohortSignups: 812 };
    delete device.snapshots[0]!.base!.cohortSignups;
    file.snapshots[0]!.pipelineOpen = 420_000;
    const { state, changes } = ok(mergeEngines(device, file));
    expect(state.snapshots[0]!.base![count]).toBe(mine);
    expect(state.snapshots[0]!.base!.cohortSignups).toBe(812);
    expect(state.snapshots[0]!.pipelineOpen).toBe(420_000);
    expect(changes).toEqual(
      expect.arrayContaining([
        { kind: "count-filled", month: "2026-08", count: "cohortSignups", after: 812 },
        { kind: "pipeline-filled", month: "2026-08", after: 420_000 },
      ]),
    );
    device.snapshots[0]!.pipelineOpen = 500_000;
    expect(ok(mergeEngines(device, file)).state.snapshots[0]!.pipelineOpen).toBe(500_000);
  });

  it("a shared count the merged numbers already carry is theirs, never the file's base", () => {
    const device = exampleState();
    const file = structuredClone(device);
    delete device.snapshots[0]!.base;
    file.snapshots[0]!.base = { cohortSignups: 999 };
    const { state, changes } = ok(mergeEngines(device, file));
    // The example's activation carries the cohort's 800 sign-ups: a base of 999 would contradict it.
    expect(state.snapshots[0]!.base?.cohortSignups).toBeUndefined();
    expect(changes.some((c) => c.kind === "count-filled")).toBe(false);
  });
});

describe("mergeEngines — a key this version does not know", () => {
  it("a number, a target or a shared count the catalogue does not know is left out, never merged nor listed", () => {
    const { device, file } = twoCopies();
    (file.snapshots[0]!.metrics as Record<string, unknown>)["acq.from-the-future"] = { status: "measured", value: { kind: "rate", percent: 5 }, updatedAt: "2026-09-30T10:00:00.000Z" };
    (file.snapshots[0]!.targets as Record<string, unknown>)["acq.from-the-future"] = 9;
    (file.snapshots[0]! as { base?: Record<string, unknown> }).base = { futureCount: 4, cohortSignups: "=1+1" };
    const { state, changes } = ok(mergeEngines(device, file));
    expect(changes).toEqual([]);
    expect(state).toEqual(device);
  });
});

describe("mergeEngines — the engine stays the device's", () => {
  it("setup, deck, « Et si », the Tour link and the id are the device's", () => {
    const { device, file } = twoCopies();
    file.id = "another";
    file.setup = { ...file.setup, companyLabel: "Autre nom", tools: ["stripe"] };
    file.deck = { ...file.deck, showCompany: !device.deck.showCompany };
    file.whatIf = { "act.rate": 50 };
    file.tourLink = { resultId: "r1", linkedAt: SEPT_ISO };
    const { state } = ok(mergeEngines(device, file));
    expect(state.id).toBe(device.id);
    expect(state.setup).toEqual(device.setup);
    expect(state.deck).toEqual(device.deck);
    expect(state.whatIf).toEqual(device.whatIf);
    expect(state.tourLink).toEqual(device.tourLink);
  });

  it("never touches either engine it is given", () => {
    const { device, file } = twoCopies();
    file.snapshots[0]!.metrics["acq.signup-rate"] = measured(ratio(500, 10_000), undefined, { updatedAt: "2026-09-30T10:00:00.000Z" });
    const later = startNextMonth(file, SEPT, SEPT_ISO, () => "sept")!;
    const [d, f] = [structuredClone(device), structuredClone(later)];
    mergeEngines(device, later);
    expect(device).toEqual(d);
    expect(later).toEqual(f);
  });
});

describe("mergeRefusal — two engines that would not measure the same thing", () => {
  it("other motions, another currency, or a ticked motion's windows: refused, with the reason", () => {
    const { device, file } = twoCopies();
    expect(mergeRefusal(device, file)).toBeNull();
    expect(mergeRefusal(device, { ...file, setup: { ...file.setup, motions: { plg: true, slg: true } } })).toBe("motions");
    expect(mergeRefusal(device, { ...file, setup: { ...file.setup, currency: "USD" } })).toBe("currency");
    expect(mergeRefusal(device, { ...file, setup: { ...file.setup, activationWindowDays: 14 } })).toBe("windows");
    expect(mergeRefusal(device, { ...file, setup: { ...file.setup, paidWindowDays: 60 } })).toBe("windows");
    expect(mergeEngines(device, { ...file, setup: { ...file.setup, paidWindowDays: 60 } })).toEqual({ kind: "refused", reason: "windows" });
  });

  it("an unticked motion's windows are never read, so they never refuse", () => {
    const { device, file } = twoCopies();
    expect(device.setup.motions.slg).toBe(false);
    expect(mergeRefusal(device, { ...file, setup: { ...file.setup, goLiveWindowDays: 30, qualificationWindowDays: 90 } })).toBeNull();
    const hybrid = hybridState();
    expect(mergeRefusal(hybrid, { ...hybrid, setup: { ...hybrid.setup, goLiveWindowDays: 30 } })).toBe("windows");
  });

  it("more than MAX_MONTHS months together: refused rather than a month dropped", () => {
    const { device, file } = twoCopies();
    const months = (from: number, n: number) =>
      Array.from({ length: n }, (_, i) => {
        const index = from + i;
        return { ...structuredClone(device.snapshots[0]!), id: `m${index}`, referenceMonth: `${2020 + Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}` as const };
      });
    const mine = { ...device, snapshots: months(0, MAX_MONTHS) };
    expect(mergeRefusal(mine, { ...file, snapshots: months(0, MAX_MONTHS) })).toBeNull();
    expect(mergeRefusal(mine, { ...file, snapshots: months(1, MAX_MONTHS) })).toBe("months");
  });
});
