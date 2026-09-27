import { describe, expect, it } from "vitest";
import { coverage } from "@/lib/engine/coverage";
import { diagnose } from "@/lib/engine/diagnose";
import type { EngineState, MetricEntry, Snapshot } from "@/lib/engine/types";
import { PILLARS } from "@/lib/scoring/pillars";
import { CTX_FR } from "@/lib/engine/__tests__/props";
import { emptyState, estimated, exampleState, measured, ratio, withEntry } from "@/lib/engine/__tests__/fixtures";
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
