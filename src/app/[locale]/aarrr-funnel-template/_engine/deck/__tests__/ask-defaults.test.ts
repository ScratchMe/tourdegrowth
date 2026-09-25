import { describe, expect, it } from "vitest";
import { CANDIDATE_IDS } from "@/lib/engine/catalog-shape";
import type { CandidateId, Diagnosis, EngineAsk, EngineDerived, EngineState, MetricEntry, MetricId } from "@/lib/engine/types";
import { askDefaults, horizonOptions, isPristineAsk, missingByRepairCost, suggestedSuccess } from "../ask-defaults";

/**
 * The ask form's defaults (engine spec §7 E5), on the §6.0 example: three
 * numbers are missing — day-30 retention (a sprint), churn cause (a meeting)
 * and gross margin (a meeting) — and the diagnosis, when it names a stage,
 * names activation against the 20-40 % reference.
 */
const AT = "2026-09-01T09:00:00.000Z";
const entry = (e: Omit<MetricEntry, "updatedAt">): MetricEntry => ({ ...e, updatedAt: AT });

const EMPTY_ASK: EngineAsk = { what: "", bullets: [], measureFirst: [] };

function exampleState(ask: EngineAsk = EMPTY_ASK): EngineState {
  const metrics: Partial<Record<MetricId, MetricEntry>> = {
    "act.rate": entry({ status: "measured", value: { kind: "ratio", numerator: 144, denominator: 800 } }),
    "ret.d30": entry({ status: "missing", missing: { cause: "not-tracked", repair: "sprint", ownerRole: "data" } }),
    "ret.churn-cause": entry({ status: "missing", missing: { cause: "no-definition", repair: "meeting" } }),
    "ref.k-factor": entry({ status: "requested", request: { role: "data", requestedAt: AT } }),
    "rev.gross-margin": entry({ status: "missing", missing: { cause: "no-access", repair: "meeting", ownerRole: "finance" } }),
  };
  return {
    schemaVersion: 1,
    id: "fixture",
    createdAt: AT,
    updatedAt: AT,
    setup: { profile: "selfserve", currency: "EUR", activationWindowDays: 7, paidWindowDays: 30 },
    snapshots: [{ id: "s1", referenceMonth: "2026-08", cohortMonth: "2026-07", createdAt: AT, metrics, targets: {} }],
    tourLink: null,
    deck: { include: {}, showCompany: false, showSiteCredit: true, ask },
  };
}

function positions(overrides: Partial<Diagnosis["positions"]> = {}): Diagnosis["positions"] {
  const base = Object.fromEntries(CANDIDATE_IDS.map((id) => [id, { position: "unknown" as const }])) as Diagnosis["positions"];
  return { ...base, ...overrides };
}

function derivedWith(diagnosis: Partial<Diagnosis>): EngineDerived {
  return {
    diagnosis: { state: "not-enough", named: [], basis: "none", belowUnpriced: [], blind: [], positions: positions(), ...diagnosis },
  } as EngineDerived;
}

const clearOn = (metric: CandidateId, comparator: Diagnosis["positions"][CandidateId]["comparator"]) =>
  derivedWith({ state: "clear", named: [metric], basis: "mrr", positions: positions({ [metric]: { position: "below", comparator } }) });

describe("missingByRepairCost", () => {
  it("orders the missing numbers quickest to repair first, catalogue order breaking the tie", () => {
    // Two meetings (churn cause comes before gross margin in the catalogue), then the sprint.
    expect(missingByRepairCost(exampleState())).toEqual(["ret.churn-cause", "rev.gross-margin", "ret.d30"]);
  });

  it("leaves out what is not missing — a requested number is in progress, not missing", () => {
    expect(missingByRepairCost(exampleState())).not.toContain("ref.k-factor");
  });
});

describe("isPristineAsk", () => {
  it("is true for an untouched ask, whitespace included", () => {
    expect(isPristineAsk(EMPTY_ASK)).toBe(true);
    expect(isPristineAsk({ ...EMPTY_ASK, what: "  ", bullets: [" ", ""] })).toBe(true);
  });

  it("is false as soon as the user wrote or chose anything", () => {
    expect(isPristineAsk({ ...EMPTY_ASK, what: "Un sprint" })).toBe(false);
    expect(isPristineAsk({ ...EMPTY_ASK, bullets: ["x"] })).toBe(false);
    expect(isPristineAsk({ ...EMPTY_ASK, measureFirst: ["ret.d30"] })).toBe(false);
    expect(isPristineAsk({ ...EMPTY_ASK, cost: { kind: "money", amount: 0 } })).toBe(false);
    expect(isPristineAsk({ ...EMPTY_ASK, horizon: { year: 2026, quarter: 4 } })).toBe(false);
    expect(isPristineAsk({ ...EMPTY_ASK, successMetric: "act.rate" })).toBe(false);
  });
});

describe("suggestedSuccess", () => {
  it("takes the low end of a 'higher is better' reference — the prudent bound the what-if starts from", () => {
    expect(suggestedSuccess(clearOn("act.rate", { kind: "reference", lo: 20, hi: 40, direction: "higher" }))).toEqual({
      successMetric: "act.rate",
      successTarget: 20,
    });
  });

  it("takes the high end of a 'lower is better' reference (churn): still the least ambitious bound", () => {
    expect(suggestedSuccess(clearOn("ret.logo-churn", { kind: "reference", lo: 1, hi: 2, direction: "lower" }))).toEqual({
      successMetric: "ret.logo-churn",
      successTarget: 2,
    });
  });

  it("takes the team's own target as it is", () => {
    expect(suggestedSuccess(clearOn("rev.paid-conversion", { kind: "target", lo: 12, hi: 12, direction: "higher" }))).toEqual({
      successMetric: "rev.paid-conversion",
      successTarget: 12,
    });
  });

  it("suggests nothing when the diagnosis names nothing — the tool doesn't pick a target on its own", () => {
    expect(suggestedSuccess(derivedWith({ state: "not-enough" }))).toEqual({});
    expect(suggestedSuccess(derivedWith({ state: "level" }))).toEqual({});
  });
});

describe("askDefaults", () => {
  it("fills only what the engine can justify: the metric, its target, and the three cheapest missing numbers", () => {
    const defaults = askDefaults(
      exampleState(),
      clearOn("act.rate", { kind: "reference", lo: 20, hi: 40, direction: "higher" }),
    );
    expect(defaults.successMetric).toBe("act.rate");
    expect(defaults.successTarget).toBe(20);
    expect(defaults.measureFirst).toEqual(["ret.churn-cause", "rev.gross-margin", "ret.d30"]);
    // Never the request itself, never a cost: those are the user's words.
    expect(defaults.what).toBe("");
    expect(defaults.cost).toBeUndefined();
    expect(defaults.bullets).toEqual([]);
  });
});

describe("horizonOptions", () => {
  it("starts at the quarter after the reference month — that month is closed — and offers eight", () => {
    const options = horizonOptions("2026-08");
    expect(options).toHaveLength(8);
    expect(options[0]).toEqual({ year: 2026, quarter: 3 });
    expect(options[7]).toEqual({ year: 2028, quarter: 2 });
  });

  it("rolls into the next year from December", () => {
    expect(horizonOptions("2026-12", 2)).toEqual([
      { year: 2027, quarter: 1 },
      { year: 2027, quarter: 2 },
    ]);
  });
});
