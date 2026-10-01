import { describe, expect, it } from "vitest";
import { coverage } from "@/lib/engine/coverage";
import { diagnose } from "@/lib/engine/diagnose";
import type { EngineState, MetricEntry, Snapshot } from "@/lib/engine/types";
import { PILLARS } from "@/lib/scoring/pillars";
import { CTX_FR } from "@/lib/engine/__tests__/props";
import { emptyState, estimated, exampleState, hybridState, measured, missing, ratio, salesAssistedState, withEntry } from "@/lib/engine/__tests__/fixtures";
import { defaultStage, namedStages, stageForKey, stageTabs } from "../stage-tabs";

/**
 * The board's stage menu (Antoine, 2026-09-26), pure: what each tab says,
 * which one is red, and which one opens first.
 *
 * Non-vacuity, each measured on its own:
 * - counting "approximate" as found fails 3: the example's counts and two
 *   of the "adds up to the coverage line" cases (the empty engine has no
 *   estimate, so it passes either way — a companion, not a guarantee);
 * - reading only the ★ for the diagnosis (the old `defaultStage`) fails
 *   "churn named opens retention" only;
 * - dropping the clear/shared guard fails "a level diagnosis names nothing"
 *   only.
 */

const last = (state: EngineState): Snapshot => state.snapshots[state.snapshots.length - 1]!;
const at = "2026-09-20T10:00:00.000Z";
const notApplicable = (naReason: string): MetricEntry => ({ status: "not-applicable", naReason, updatedAt: at });

describe("stageTabs — the §6.0 example", () => {
  const state = exampleState();
  const tabs = stageTabs(last(state), diagnose(state, CTX_FR));

  it("one tab per stage, in AARRR order", () => {
    expect(tabs.map((t) => t.stage)).toEqual([...PILLARS]);
  });

  it("says what the old row's pills said: one mark per number, ★ first", () => {
    expect(Object.fromEntries(tabs.map((t) => [t.stage, t.marks.map((m) => m.kind)]))).toEqual({
      acquisition: ["found", "found", "found"],
      activation: ["found", "found", "approximate"],
      retention: ["missing", "found", "missing"],
      referral: ["found", "found", "inProgress"],
      // Expansion and contraction since the 17-number base (2026-09-26).
      revenue: ["approximate", "found", "missing", "found", "found"],
    });
    expect(tabs.find((t) => t.stage === "activation")!.marks[0]!.id).toBe("act.rate");
  });

  it("counts found as the coverage line does: measured only, an estimate is approximate", () => {
    expect(tabs.map((t) => [t.stage, t.found, t.applicable])).toEqual([
      ["acquisition", 3, 3],
      ["activation", 2, 3],
      ["retention", 1, 3],
      ["referral", 2, 3],
      ["revenue", 3, 5],
    ]);
  });

  it("marks the stage the diagnosis names, and only it — churn is below its reference but not named", () => {
    expect(tabs.filter((t) => t.named).map((t) => t.stage)).toEqual(["activation"]);
  });
});

describe("stageTabs — the five tabs add up to the coverage line above them", () => {
  const cases: [string, EngineState][] = [
    ["the example", exampleState()],
    ["an empty engine", emptyState()],
    [
      "numbers that don't apply",
      withEntry(withEntry(exampleState(), "ref.k-factor", notApplicable("no-invite-mechanism")), "ret.logo-churn", notApplicable("not-subscription")),
    ],
  ];
  for (const [name, state] of cases) {
    it(name, () => {
      const tabs = stageTabs(last(state), diagnose(state, CTX_FR));
      const line = coverage(last(state));
      expect(tabs.reduce((n, t) => n + t.found, 0)).toBe(line.found);
      expect(tabs.reduce((n, t) => n + t.applicable, 0)).toBe(line.denominator);
    });
  }

  it("a number that doesn't apply leaves its stage's denominator, and keeps its mark", () => {
    const state = withEntry(exampleState(), "ref.k-factor", notApplicable("no-invite-mechanism"));
    const referral = stageTabs(last(state), diagnose(state, CTX_FR)).find((t) => t.stage === "referral")!;
    expect(referral.applicable).toBe(2);
    expect(referral.marks.map((m) => m.kind)).toEqual(["found", "found", "notApplicable"]);
  });
});

describe("defaultStage — where the board opens when nobody chose", () => {
  it("on the stage the diagnosis names", () => {
    const state = exampleState();
    expect(defaultStage(last(state), diagnose(state, CTX_FR))).toBe("activation");
  });

  it("on retention when the diagnosis names churn — not retention's ★, and the old ★-only reading missed it", () => {
    const state = withEntry(exampleState(), "act.rate", estimated(15, 25));
    const d = diagnose(state, CTX_FR);
    expect(d.named).toEqual(["ret.logo-churn"]);
    expect(defaultStage(last(state), d)).toBe("retention");
  });

  it("with nothing named, on the first stage with a number still to fill", () => {
    const empty = emptyState();
    expect(defaultStage(last(empty), diagnose(empty, CTX_FR))).toBe("acquisition");
    let state = emptyState();
    for (const id of ["acq.signup-rate", "acq.top-channel-share", "acq.cac"] as const) state = withEntry(state, id, measured(ratio(10, 100)));
    const d = diagnose(state, CTX_FR);
    expect(d.named).toEqual([]);
    expect(defaultStage(last(state), d)).toBe("activation");
  });
});

describe("namedStages", () => {
  it("a level or not-enough diagnosis names nothing, whatever its list says", () => {
    const state = exampleState();
    const d = diagnose(state, CTX_FR);
    expect(namedStages({ ...d, state: "level" }).size).toBe(0);
    expect(namedStages({ ...d, state: "not-enough" }).size).toBe(0);
    expect([...namedStages(d)]).toEqual(["activation"]);
  });
});

/**
 * Non-vacuity, measured on 2026-10-01: reading self-serve's numbers whatever
 * the motion fails the first two cases; looking for sales-assisted's first
 * number to fill among self-serve's fails the last.
 */
describe("per motion (A7.3.c S3) — the hybrid shows one motion's five tabs at a time", () => {
  it("sales-assisted's tabs: its own numbers, ★ first, and its own diagnosis's stage", () => {
    const state = hybridState();
    const tabs = stageTabs(last(state), diagnose(state, CTX_FR, "slg"), "slg");
    expect(Object.fromEntries(tabs.map((t) => [t.stage, t.marks.map((m) => `${m.id}:${m.kind}`)]))).toEqual({
      acquisition: ["slg.acq.lead-to-opp:found", "slg.acq.cac:found", "slg.acq.cycle:found"],
      activation: ["slg.act.go-live:missing", "slg.act.live-event:found", "slg.act.time-to-live:inProgress"],
      retention: ["slg.ret.renewal:found", "slg.ret.nrr:approximate", "slg.ret.loss-cause:found"],
      referral: ["slg.ref.referred-share:found", "slg.ref.referenceable:inProgress"],
      revenue: ["slg.rev.win-rate:found", "slg.rev.acv:found", "slg.rev.arpa:found", "slg.rev.gross-margin:missing"],
    });
    // The §18.9 example names the win rate: revenue is red, and only it.
    expect(tabs.filter((t) => t.named).map((t) => t.stage)).toEqual(["revenue"]);
    expect(defaultStage(last(state), diagnose(state, CTX_FR, "slg"), "slg")).toBe("revenue");
  });

  it("the link is in neither motion's tabs: it is optional, and its own block under sales-assisted acquisition", () => {
    const state = hybridState();
    for (const motion of ["plg", "slg"] as const) {
      const ids = stageTabs(last(state), motion === "plg" ? diagnose(state, CTX_FR) : diagnose(state, CTX_FR, "slg"), motion).flatMap((t) => t.marks.map((m) => m.id));
      expect(ids).not.toContain("link.pql-handoff");
      expect(ids.every((id) => (motion === "slg" ? id.startsWith("slg.") : !id.startsWith("slg.")))).toBe(true);
    }
  });

  it("self-serve's tabs in the hybrid are the v1 tabs, to the mark", () => {
    const hybrid = hybridState();
    const plgOnly = exampleState();
    const marks = (s: EngineState) => stageTabs(last(s), diagnose(s, CTX_FR)).map((t) => t.marks);
    expect(marks(hybrid)).toEqual(marks(plgOnly));
  });

  it("with nothing named, sales-assisted opens on its own first number still to fill", () => {
    const state = salesAssistedState();
    for (const id of ["slg.acq.lead-to-opp", "slg.rev.win-rate", "slg.acq.cac", "slg.acq.cycle"] as const) state.snapshots[0]!.metrics[id] = undefined;
    const d = diagnose(state, CTX_FR, "slg");
    expect(d.named).toEqual([]);
    expect(defaultStage(last(state), d, "slg")).toBe("acquisition");
    // Acquisition's three answered « on ne l'a pas » (not todo): the first still to fill is activation's.
    for (const id of ["slg.acq.lead-to-opp", "slg.acq.cac", "slg.acq.cycle"] as const) state.snapshots[0]!.metrics[id] = missing("not-tracked", "sprint");
    const after = diagnose(state, CTX_FR, "slg");
    expect(after.named).toEqual([]);
    expect(defaultStage(last(state), after, "slg")).toBe("activation");
  });
});

describe("stageForKey — the WAI-ARIA tabs keys", () => {
  it("Right and Left move and wrap around", () => {
    expect(stageForKey("acquisition", "ArrowRight")).toBe("activation");
    expect(stageForKey("revenue", "ArrowRight")).toBe("acquisition");
    expect(stageForKey("acquisition", "ArrowLeft")).toBe("revenue");
    expect(stageForKey("retention", "ArrowLeft")).toBe("activation");
  });

  it("Home and End go to the ends", () => {
    expect(stageForKey("retention", "Home")).toBe("acquisition");
    expect(stageForKey("retention", "End")).toBe("revenue");
  });

  it("any other key is not the tab list's, so Tab still leaves it", () => {
    for (const key of ["Tab", "Enter", " ", "ArrowDown", "ArrowUp", "a"]) expect(stageForKey("activation", key)).toBeNull();
  });
});
