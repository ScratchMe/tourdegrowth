import { describe, expect, it } from "vitest";
import { coverage } from "../coverage";
import { engineFileName, parseEngineFile, serializeEngine } from "../io";
import type { EngineState, Snapshot } from "../types";
import { currentSnapshot } from "../values";
import { fullState, toV1 } from "./storage-fixtures";

/**
 * The file is the engine's only durable copy (spec §4.3). What these tests
 * hold: an export reads back to the same state, two exports of the same state
 * are the same bytes, and reading never throws — a newer version is refused,
 * a half-filled file is opened WITH its warnings.
 *
 * Non-vacuity, measured (one test falls each, the other nine pass): dropping
 * the key-sorting replacer fails "two exports … byte-identical"; disabling the
 * newer-version branch fails "a newer schema version is refused…" (the file
 * then reads as `not-engine`); returning `state: null` on validation errors
 * fails "a half-filled file is opened…".
 *
 * The months' refusal (A25), measured the same way on 2026-10-05: without
 * `readableMonths`, the 16 tests of the refusal fall and its companion
 * ("everything else a month holds opens…") passes, as it must in both states.
 * Each piece of the check fails its own: the length 2, `referenceMonth` 5,
 * `cohortMonth` 3, `metrics` 3, `targets` 3, a list taken for an object 2,
 * and the type check before the pattern 1 (a list reads as its text in a
 * pattern, so only `referenceMonth: ["2026-08"]` sees it).
 */

/** The same state with its keys inserted in reverse order, deep. */
function reversedKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(reversedKeys);
  if (typeof value !== "object" || value === null) return value;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(value).reverse()) out[k] = reversedKeys((value as Record<string, unknown>)[k]);
  return out;
}

describe("serializeEngine / parseEngineFile", () => {
  it("round-trips a filled engine to an equal state with no warnings", () => {
    const state = fullState();
    const parsed = parseEngineFile(serializeEngine(state));
    expect(parsed).toEqual({ state, errors: [] });
  });

  it("two exports of the same state are byte-identical, whatever order its keys were written in", () => {
    const a = fullState();
    const b = reversedKeys(fullState()) as EngineState;
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b)); // the insertion orders really differ
    expect(serializeEngine(b)).toBe(serializeEngine(a));
  });

  it("keeps arrays in their order: the order of ask bullets is data", () => {
    const state = fullState();
    state.deck.ask.bullets = ["zeta", "alpha"];
    expect(parseEngineFile(serializeEngine(state)).state?.deck.ask.bullets).toEqual(["zeta", "alpha"]);
  });

  it("is indented and ends with a newline, so a folder of monthly files diffs line by line", () => {
    const text = serializeEngine(fullState());
    expect(text.endsWith("}\n")).toBe(true);
    expect(text.split("\n").length).toBeGreaterThan(50);
  });

  it("corrupt or truncated JSON is `unreadable`, never a throw", () => {
    const text = serializeEngine(fullState());
    for (const broken of [text.slice(0, text.length / 2), "", "not json at all"]) {
      const parsed = parseEngineFile(broken);
      expect(parsed.refusal).toBe("unreadable");
      expect(parsed.state).toBeNull();
      expect(parsed.errors).toHaveLength(1);
    }
  });

  it("a newer schema version is refused, not opened with errors", () => {
    const future = { ...JSON.parse(serializeEngine(fullState())), schemaVersion: 4 };
    const parsed = parseEngineFile(JSON.stringify(future));
    expect(parsed).toMatchObject({ state: null, refusal: "unknown-version" });
    // Even when the newer version moved its fields around, it still reads as "newer", not "wrong file".
    const moved = { schemaVersion: 4, id: "x", snapshots: [], somethingNew: {} };
    expect(parseEngineFile(JSON.stringify(moved)).refusal).toBe("unknown-version");
  });

  it("something that isn't an engine — an audit mission, an array, a number — is `not-engine`", () => {
    const mission = { schemaVersion: 1, id: "m-1", header: { company: "ACME" }, passes: [] };
    for (const other of [mission, [], 42, { schemaVersion: 1 }]) {
      expect(parseEngineFile(JSON.stringify(other))).toMatchObject({ state: null, refusal: "not-engine" });
    }
  });

  it("a half-filled file is opened WITH its warnings — the fourteen other numbers aren't lost for one estimate", () => {
    const state = fullState();
    delete (state.snapshots[0]!.metrics["acq.cac"]!.estimate as { basis?: string }).basis;
    const parsed = parseEngineFile(serializeEngine(state));
    expect(parsed.refusal).toBeUndefined();
    expect(parsed.state?.snapshots[0]?.metrics["acq.signup-rate"]).toEqual(fullState().snapshots[0]!.metrics["acq.signup-rate"]);
    expect(parsed.errors).toEqual(["snapshots[0].metrics.acq.cac.estimate.basis: missing or unknown"]);
  });
});

describe("a v1 file and the v2 setup (engine spec §18.3.2)", () => {
  it("a v1 file is migrated, then validated: same numbers, no warning, and the screen is told", () => {
    const parsed = parseEngineFile(JSON.stringify(toV1(fullState())));
    expect(parsed.refusal).toBeUndefined();
    expect(parsed.migratedFrom).toBe(1);
    expect(parsed.errors).toEqual([]);
    expect(parsed.state).toEqual(fullState());
  });

  it("a v1 file with a warning keeps its warning after the migration", () => {
    const state = fullState();
    delete (state.snapshots[0]!.metrics["acq.cac"]!.estimate as { basis?: string }).basis;
    const parsed = parseEngineFile(JSON.stringify(toV1(state)));
    expect(parsed.errors).toEqual(["snapshots[0].metrics.acq.cac.estimate.basis: missing or unknown"]);
    expect(parsed.migratedFrom).toBe(1);
  });

  it("a setup that says nothing of how the company sells is refused, not opened empty", () => {
    const noMotion = { ...fullState(), setup: { ...fullState().setup, motions: { plg: false, slg: false } } };
    // The consumer app opens since A22 APP-0 (below); the marketplace is the type no build knows yet.
    const unknownType = { ...fullState(), setup: { ...fullState().setup, type: "marketplace" } };
    const v1Other = { ...toV1(fullState()), setup: { ...(toV1(fullState()).setup as object), profile: "sales-led" } };
    for (const file of [noMotion, unknownType, v1Other]) {
      expect(parseEngineFile(JSON.stringify(file))).toMatchObject({ state: null, refusal: "unsupported-setup" });
    }
  });

  it("a consumer app opens with its monetization, and round-trips (§21.6.3, A22 APP-0)", () => {
    const app: EngineState = { ...fullState(), setup: { ...fullState().setup, type: "consumer-app", monetization: { subscriptions: true, purchases: true, ads: false } } };
    const parsed = parseEngineFile(serializeEngine(app));
    expect(parsed.refusal).toBeUndefined();
    expect(parsed.migratedFrom).toBeUndefined();
    expect(parsed).toEqual({ state: app, errors: [] });
  });

  it("a consumer app that also ticks the sales-assisted box is refused, whatever else is in the file", () => {
    const monetization = { subscriptions: true, purchases: false, ads: false };
    for (const motions of [{ plg: true, slg: true }, { plg: false, slg: true }]) {
      const app = { ...fullState(), setup: { ...fullState().setup, type: "consumer-app", monetization, motions } };
      expect(parseEngineFile(JSON.stringify(app)), JSON.stringify(motions)).toMatchObject({ state: null, refusal: "unsupported-setup" });
    }
  });

  it("a consumer app without its monetization is opened, not refused: the validator says what is missing", () => {
    const app = { ...fullState(), setup: { ...fullState().setup, type: "consumer-app" } };
    const parsed = parseEngineFile(JSON.stringify(app));
    expect(parsed.refusal).toBeUndefined();
    expect(parsed.state).not.toBeNull();
    expect(parsed.errors).toEqual(["setup.monetization: not three booleans, one at least true"]);
  });

  it("a sales-assisted engine opens without a word about migration", () => {
    const slg = { ...fullState(), setup: { ...fullState().setup, motions: { plg: false, slg: true } } };
    const parsed = parseEngineFile(serializeEngine(slg));
    expect(parsed.refusal).toBeUndefined();
    expect(parsed.migratedFrom).toBeUndefined();
    expect(parsed.errors).toEqual([]);
  });
});

describe("a month the screens cannot read is refused (A25)", () => {
  /** `fullState`'s file with its months replaced, as a file on disk would carry them. */
  const withMonths = (snapshots: unknown[], base: Record<string, unknown> = JSON.parse(serializeEngine(fullState()))): string => JSON.stringify({ ...base, snapshots });
  const month = (): Record<string, unknown> => JSON.parse(serializeEngine(fullState())).snapshots[0];
  const without = (key: string): Record<string, unknown> => {
    const m = month();
    delete m[key];
    return m;
  };
  /** The month before `month()`, closed when the next one started: a two-month file as the engine writes it. */
  const july = (): Record<string, unknown> => ({ ...month(), id: "july", referenceMonth: "2026-07", cohortMonth: "2026-06", closedAt: "2026-08-01T00:00:00.000Z" });
  const REFUSED = { state: null, errors: ["snapshots: no month, or a month the screens cannot read"], refusal: "not-engine" };

  it("no month at all is refused, where it used to open and then throw at every visit", () => {
    // Why (measured in a browser, 2026-10-05): the board's first read of an opened state is its current month.
    expect(() => currentSnapshot({ ...fullState(), snapshots: [] })).toThrow();
    expect(parseEngineFile(withMonths([]))).toEqual(REFUSED);
  });

  it("a month that is not an object, or empty, is refused: the import's own preview reads its numbers", () => {
    // Why: the preview counts the last month's numbers (`coverage`), which an empty month does not hold.
    expect(() => coverage({} as Snapshot)).toThrow();
    for (const broken of [{}, null, 1, "2026-08", []]) expect(parseEngineFile(withMonths([broken])), JSON.stringify(broken)).toEqual(REFUSED);
  });

  it.each<[string, unknown]>([
    ["without its metrics", without("metrics")],
    ["without its targets", without("targets")],
    ["with its metrics null", { ...month(), metrics: null }],
    // A list where the validator wants an object: what `validateEngine` already calls missing.
    ["with its metrics a list", { ...month(), metrics: [] }],
    ["with its targets a list", { ...month(), targets: [] }],
    ["without its month", without("referenceMonth")],
    ["with a month that is not YYYY-MM", { ...month(), referenceMonth: "août" }],
    ["with a thirteenth month", { ...month(), referenceMonth: "2026-13" }],
    ["with its month as a number", { ...month(), referenceMonth: 202608 }],
    // A list reads as its text in a pattern (`"2026-08"`), then has no `split`: only the type check refuses it.
    ["with its month as a list", { ...month(), referenceMonth: ["2026-08"] }],
    ["without its cohort month", without("cohortMonth")],
    ["with a cohort month that is not YYYY-MM", { ...month(), cohortMonth: "2026-13" }],
  ])("a month %s is refused", (_, broken) => {
    expect(parseEngineFile(withMonths([broken]))).toEqual(REFUSED);
  });

  it("one broken month refuses the file, wherever it sits: the series and the merge read every month", () => {
    expect(parseEngineFile(withMonths([{}, month()]))).toEqual(REFUSED);
    expect(parseEngineFile(withMonths([july(), without("targets")]))).toEqual(REFUSED);
    expect(parseEngineFile(withMonths([without("cohortMonth"), month()]))).toEqual(REFUSED);
    // The same file with both months whole opens, without a warning: the refusal is the broken month's.
    expect(parseEngineFile(withMonths([july(), month()]))).toMatchObject({ errors: [], state: { snapshots: [{ id: "july" }, {}] } });
  });

  it("an older file is refused the same way: its months have the same shape, and the check runs before the migration", () => {
    expect(parseEngineFile(withMonths([], toV1(fullState())))).toEqual(REFUSED);
    expect(parseEngineFile(withMonths([{}], toV1(fullState())))).toEqual(REFUSED);
    expect(parseEngineFile(withMonths([], { ...JSON.parse(serializeEngine(fullState())), schemaVersion: 2 }))).toEqual(REFUSED);
  });

  it("everything else a month holds opens WITH its warnings: the screens show it, so the file is not refused", () => {
    // Each of these opened and showed its board in a browser (2026-10-05): the validator speaks, nothing is lost.
    for (const months of [
      [without("id")],
      [without("createdAt")],
      [{ ...month(), closedAt: "x" }],
      [{ ...month(), windows: "x" }],
      [{ ...month(), pipelineOpen: "x" }],
      [{ ...month(), base: "x" }],
      [{ ...july(), closedAt: undefined }, month()],
      [july(), { ...month(), referenceMonth: "2026-07" }],
      [{ ...july(), referenceMonth: "2026-09" }, month()],
    ]) {
      const parsed = parseEngineFile(withMonths(months));
      expect(parsed.refusal, JSON.stringify(months).slice(0, 120)).toBeUndefined();
      expect(parsed.state).not.toBeNull();
      expect(parsed.errors.length).toBeGreaterThan(0);
    }
  });
});

describe("engineFileName", () => {
  const words = { fileName: "tdg-moteur-{month}.json" } as Parameters<typeof engineFileName>[1];

  it("names the file after the flows' month, so monthly saves sort in a folder", () => {
    expect(engineFileName(fullState(), words)).toBe("tdg-moteur-2026-08.json");
  });

  it("never puts arbitrary text in a file name: a malformed month falls back to the creation month", () => {
    const state = fullState();
    state.snapshots[0]!.referenceMonth = "../../etc";
    expect(engineFileName(state, words)).toBe("tdg-moteur-2026-09.json");
  });
});
