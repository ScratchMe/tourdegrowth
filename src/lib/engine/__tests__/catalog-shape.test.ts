import { describe, expect, it } from "vitest";
import type { AppMonetization } from "../app-model";
import { windowDaysOf } from "../cohort";
import type { MetricId } from "../types";
import { exampleState } from "./fixtures";
import { GLOSSARY_TERMS } from "@/content/glossary-terms";
import { QUESTIONS } from "@/content/copy-library";
import { ENGINE_CATALOG, ENGINE_DERIVED_CATALOG } from "@/content/engine-catalog";
import { PILLARS } from "@/lib/scoring/pillars";
import {
  ALL_DERIVED_SHAPES,
  ALL_METRIC_SHAPES,
  APP_DERIVED_SHAPES,
  APP_METRIC_SHAPES,
  APP_REPLACED,
  CANDIDATE_IDS,
  DERIVED_SHAPES,
  ENGINE_BRIDGES,
  LINK_METRIC_SHAPES,
  LOWER_IS_BETTER_CANDIDATES,
  METRIC_SHAPES,
  MKT_DEMAND_CANDIDATE_IDS,
  MKT_DEMAND_LEVER_IDS,
  MKT_DERIVED_SHAPES,
  MKT_ENGINE_BRIDGES,
  MKT_METRIC_SHAPES,
  MKT_SUPPLY_CANDIDATE_IDS,
  MKT_SUPPLY_LEVER_IDS,
  PELOTON_METRICS,
  REFERRAL_PRICING_CEILING,
  SLG_CANDIDATE_IDS,
  SLG_DERIVED_SHAPES,
  SLG_ENGINE_BRIDGES,
  SLG_LEVER_IDS,
  SLG_METRIC_SHAPES,
  SUBSCRIPTION_METRICS,
  TAKE_RATE_HIGH_PERCENT,
  UNIT_INPUT_IDS,
  UNPRICED_CANDIDATES,
  appShapeShown,
  candidatesOf,
  derivedShapeOf,
  derivedShapesOf,
  isPricedAt,
  metricsOfStage,
  metricsOfStageIn,
  motionOfMetric,
  motionShapes,
  shapeOf,
  shapesOf,
  type MetricShape,
  type SetupShapes,
} from "../catalog-shape";

// Engine spec §5 — the shape half of the catalogue. The prose half is
// checked against it in src/content/__tests__/engine-catalog.test.ts.
describe("METRIC_SHAPES", () => {
  it("has seventeen metrics — three per stage, five for Revenue since the MRR movements (2026-09-26) — one ★ per stage", () => {
    expect(METRIC_SHAPES).toHaveLength(17);
    expect(new Set(METRIC_SHAPES.map((s) => s.id)).size).toBe(17);
    for (const stage of PILLARS) {
      const ofStage = METRIC_SHAPES.filter((s) => s.stage === stage);
      expect(ofStage, stage).toHaveLength(stage === "revenue" ? 5 : 3);
      expect(ofStage.filter((s) => s.primary), stage).toHaveLength(1);
    }
  });

  it("links every metric to a glossary term that exists", () => {
    for (const s of [...METRIC_SHAPES, ...DERIVED_SHAPES]) {
      expect(GLOSSARY_TERMS[s.glossary], `${s.id} → ${s.glossary}`).toBeDefined();
      if (s.benchmark) expect(GLOSSARY_TERMS[s.benchmark.term], `${s.id} benchmark`).toBeDefined();
    }
  });

  it("keeps a reference to what it is — a range and a direction, nothing that could name a bottleneck (C1)", () => {
    // Decision 5, reversed 2026-09-29: no published reference names a stage. A flag that let one
    // do it again would be a product decision taken in a data file; the shape has no room for it.
    for (const s of [...METRIC_SHAPES, ...DERIVED_SHAPES]) {
      if (s.benchmark) expect(Object.keys(s.benchmark).sort(), s.id).toEqual(["direction", "hi", "lo", "term"]);
    }
  });

  it("writes every reference as an ordered range", () => {
    for (const s of [...METRIC_SHAPES, ...DERIVED_SHAPES]) {
      if (s.benchmark) expect(s.benchmark.lo, s.id).toBeLessThanOrEqual(s.benchmark.hi);
    }
  });

  it("offers a value kind for every metric, and counts only for a rate the island computes from counts", () => {
    for (const s of METRIC_SHAPES) {
      expect(s.valueKinds.length, s.id).toBeGreaterThan(0);
      if (s.unit === "percent") expect(s.valueKinds[0], `${s.id}: counts first (D6)`).toBe("ratio");
      if (s.bounded) expect(s.valueKinds, s.id).toContain("ratio");
    }
  });

  it("points dependencies and computed inputs at metrics that exist", () => {
    const ids = new Set<MetricId>(METRIC_SHAPES.map((s) => s.id));
    for (const s of METRIC_SHAPES) if (s.dependsOn) expect(ids.has(s.dependsOn), s.id).toBe(true);
    for (const d of DERIVED_SHAPES) for (const input of d.inputs) expect(ids.has(input), `${d.id} ← ${input}`).toBe(true);
  });
});

describe("candidates and the peloton", () => {
  it("names six candidates, all rates, churn the only lower-is-better one", () => {
    expect(CANDIDATE_IDS).toHaveLength(6);
    for (const id of CANDIDATE_IDS) expect(shapeOf(id).unit, id).toBe("percent");
    const lower = CANDIDATE_IDS.filter((id) => shapeOf(id).benchmark?.direction === "lower");
    expect(lower).toEqual(["ret.logo-churn"]);
  });

  it("never prices go-live (§18.5.2), nor the marketplace's four (§22.4.3); prices D30 retention, and the referred shares up to a 50 % target (§19.3)", () => {
    expect([...UNPRICED_CANDIDATES]).toEqual(["slg.act.go-live", "mkt.buy.repeat", "mkt.sell.first-sale", "mkt.sell.churn", "mkt.sell.signup-rate"]);
    expect(isPricedAt("slg.act.go-live", 10)).toBe(false);
    expect(isPricedAt("ret.d30", 99)).toBe(true);
    for (const id of ["ref.referred-share", "slg.ref.referred-share"] as const) {
      expect(isPricedAt(id, 50), id).toBe(true);
      expect(isPricedAt(id, 50.5), id).toBe(false);
    }
    expect(REFERRAL_PRICING_CEILING).toBe(50);
  });

  it("builds the peloton from the three cohort ★s that follow the same 100 sign-ups", () => {
    for (const id of PELOTON_METRICS) {
      const s = shapeOf(id);
      expect(s.primary, id).toBe(true);
      expect(s.flow, id).toBe("cohort");
    }
  });
});

describe("the sales-assisted catalogue and the link (engine spec §18.4, A7.3.c S0)", () => {
  // Non-vacuity, measured on 2026-09-30: giving the link `scope: "slg"` fails « no number is shared »,
  // « the link » and « shapesOf »; a second ★ in Acquisition (the cycle) fails « one ★ per stage » and
  // « the five candidates ».
  const stageOf = (stage: string) => SLG_METRIC_SHAPES.filter((s) => s.stage === stage);

  it("fifteen numbers, every id prefixed `slg.`, the scope and the three-month span of their motion", () => {
    expect(SLG_METRIC_SHAPES).toHaveLength(15);
    for (const s of SLG_METRIC_SHAPES) {
      expect(s.id.startsWith("slg."), s.id).toBe(true);
      expect(s.scope, s.id).toBe("slg");
      // C25 Q2: three months, fixed. The 12-month NRR is the one exception.
      expect(s.span, s.id).toBe(s.id === "slg.ret.nrr" ? 12 : 3);
    }
    for (const s of METRIC_SHAPES) expect([s.scope, s.span], s.id).toEqual(["plg", 1]);
  });

  it("three at most per stage besides the margin (two in Referral), and one ★ per stage", () => {
    for (const stage of PILLARS) {
      const own = stageOf(stage).filter((s) => s.id !== "slg.rev.gross-margin");
      expect(own.length, stage).toBeLessThanOrEqual(stage === "referral" ? 2 : 3);
      expect(stageOf(stage).filter((s) => s.primary).length, stage).toBe(1);
    }
  });

  it("no number is shared by both motions: one gross margin each (C25 Q4)", () => {
    expect(shapeOf("rev.gross-margin").scope).toBe("plg");
    expect(shapeOf("slg.rev.gross-margin").scope).toBe("slg");
    // A set, not a list: the scopes outside plg and slg are the link, the app's six (§21) and the marketplace's nineteen (§22).
    expect(new Set(ALL_METRIC_SHAPES.map((s) => s.scope).filter((scope) => scope !== "plg" && scope !== "slg"))).toEqual(new Set(["link", "app", "mkt"]));
  });

  it("the link: optional, its own scope, never a candidate (C25 Q7)", () => {
    expect(LINK_METRIC_SHAPES.map((s) => [s.id, s.scope, s.optional])).toEqual([["link.pql-handoff", "link", true]]);
    expect((SLG_CANDIDATE_IDS as readonly string[]).includes("link.pql-handoff")).toBe(false);
    expect((SLG_LEVER_IDS as readonly string[]).at(-1)).toBe("link.pql-handoff");
  });

  it("shapesOf: 17 self-serve, 15 sales-assisted, 33 in the hybrid with the link — and no setup without a motion", () => {
    const saas = (plg: boolean, slg: boolean) => ({ type: "b2b-saas" as const, motions: { plg, slg } });
    expect(shapesOf(saas(true, false)).map((s) => s.id)).toEqual(METRIC_SHAPES.map((s) => s.id));
    expect(shapesOf(saas(false, true))).toHaveLength(15);
    expect(shapesOf(saas(true, true))).toHaveLength(33);
    expect(shapesOf(saas(true, true)).at(-1)?.id).toBe("link.pql-handoff");
    expect(() => shapesOf(saas(false, false))).toThrow();
  });

  it("the five candidates are exactly the five ★, all rates read « higher is better »", () => {
    expect([...SLG_CANDIDATE_IDS].sort()).toEqual(SLG_METRIC_SHAPES.filter((s) => s.primary).map((s) => s.id).sort());
    for (const id of SLG_CANDIDATE_IDS) {
      expect(shapeOf(id).unit, id).toBe("percent");
      expect(shapeOf(id).benchmark, id).toBeUndefined();
    }
  });

  it("every glossary term exists, and dependencies and computed inputs point at numbers that exist", () => {
    const terms = new Set<string>(Object.keys(GLOSSARY_TERMS));
    for (const s of [...SLG_METRIC_SHAPES, ...LINK_METRIC_SHAPES, ...SLG_DERIVED_SHAPES]) expect(terms.has(s.glossary), `${s.id} → ${s.glossary}`).toBe(true);
    const ids = new Set<MetricId>(SLG_METRIC_SHAPES.map((s) => s.id));
    for (const s of SLG_METRIC_SHAPES) if (s.dependsOn) expect(ids.has(s.dependsOn), s.id).toBe(true);
    for (const d of SLG_DERIVED_SHAPES) for (const input of d.inputs) expect(ids.has(input), `${d.id} ← ${input}`).toBe(true);
    // The margin of the motion, never self-serve's (Q4).
    for (const d of SLG_DERIVED_SHAPES) expect(d.inputs.some((i) => i.startsWith("rev.")), d.id).toBe(false);
  });

  it("the windows: qualification for lead → opportunity, go-live for the three activation numbers", () => {
    expect(shapeOf("slg.acq.lead-to-opp").window).toBe("qualification");
    expect(stageOf("activation").map((s) => s.window)).toEqual(["go-live", "go-live", "go-live"]);
  });

  it("the six sales-assisted bridges (§18.4.9) — a seventh is a decision", () => {
    expect(SLG_ENGINE_BRIDGES).toEqual([
      { questionId: "acq-3", metric: "slg.acq.cac" },
      { questionId: "act-1", metric: "slg.act.live-event" },
      { questionId: "act-2", metric: "slg.act.go-live" },
      { questionId: "ret-1", metric: "slg.ret.renewal" },
      { questionId: "ret-3", metric: "slg.ret.loss-cause" },
      { questionId: "rev-2", metric: "slg.rev.ltv" },
    ]);
  });
});

describe("ENGINE_BRIDGES (§6.11)", () => {
  it("is the exact list of eight — a ninth bridge is a decision, not a side effect", () => {
    expect(ENGINE_BRIDGES).toEqual([
      { questionId: "acq-1", metric: "acq.top-channel-share" },
      { questionId: "acq-3", metric: "acq.cac" },
      { questionId: "act-1", metric: "act.event" },
      { questionId: "act-2", metric: "act.rate" },
      { questionId: "ret-1", metric: "ret.d30" },
      { questionId: "ret-3", metric: "ret.churn-cause" },
      { questionId: "ref-3", metric: "ref.k-factor" },
      { questionId: "rev-2", metric: "rev.ltv" },
    ]);
  });

  it("only names Tour questions that exist, each in the stage it measures", () => {
    for (const { questionId, metric } of ENGINE_BRIDGES) {
      const question = QUESTIONS.find((q) => q.id === questionId);
      expect(question, questionId).toBeDefined();
      const stage = metric.startsWith("rev.ltv") ? derivedShapeOf("rev.ltv").stage : shapeOf(metric as never).stage;
      expect(question!.pillar, `${questionId} → ${metric}`).toBe(stage);
    }
  });
});

/**
 * The contract between the two halves of the catalogue (§4.4): the shape
 * the browser computes with, and the prose the server resolves. A metric in
 * one and not the other is a sheet with no name or a name with no maths.
 * The finer content checks (placeholders, reference anti-drift, glyphs) are
 * the content PR's, in src/content/__tests__/.
 */
describe("shape ↔ prose", () => {
  it("has exactly the same ids on both sides, computed figures included", () => {
    expect(Object.keys(ENGINE_CATALOG).sort()).toEqual(ALL_METRIC_SHAPES.map((s) => s.id).sort());
    expect(Object.keys(ENGINE_DERIVED_CATALOG).sort()).toEqual(ALL_DERIVED_SHAPES.map((s) => s.id).sort());
  });

  it("labels exactly the closed-list ids the shape declares", () => {
    for (const shape of ALL_METRIC_SHAPES) {
      const prose = ENGINE_CATALOG[shape.id];
      expect(prose.variants?.map((v) => v.id), `${shape.id} variants`).toEqual(shape.variants);
      expect(prose.naReasons?.map((v) => v.id), `${shape.id} naReasons`).toEqual(shape.naReasons);
      expect(prose.choices?.map((v) => v.id), `${shape.id} choices`).toEqual(shape.choices);
    }
  });

  it("prints a caveat next to every reference, and never a 'no reference' reason next to one", () => {
    for (const shape of ALL_METRIC_SHAPES) {
      const prose = ENGINE_CATALOG[shape.id];
      if (shape.benchmark) {
        expect(prose.benchmarkCaveat, shape.id).toBeDefined();
        expect(prose.noReferenceReason, shape.id).toBeUndefined();
      } else {
        expect(prose.benchmarkCaveat, shape.id).toBeUndefined();
      }
    }
  });

  it("names the two counts of every metric entered as counts, and at most three places to look", () => {
    for (const shape of ALL_METRIC_SHAPES) {
      const prose = ENGINE_CATALOG[shape.id];
      if (shape.valueKinds.includes("ratio")) expect(prose.inputs, shape.id).toBeDefined();
      expect(prose.where.length, shape.id).toBeGreaterThan(0);
      expect(prose.where.length, shape.id).toBeLessThanOrEqual(3);
    }
  });
});

describe("lookups", () => {
  it("orders a stage ★ first and refuses unknown ids", () => {
    expect(metricsOfStage("activation").map((s) => s.id)).toEqual(["act.rate", "act.event", "act.ttv"]);
    expect(() => shapeOf("nope" as never)).toThrow(/Unknown engine metric/);
    expect(() => derivedShapeOf("nope" as never)).toThrow(/Unknown engine derived/);
  });
});

describe("motions of the catalogue (A7.3.c S1)", () => {
  it("each motion's candidates, in canonical order; every number belongs to one motion, the link with sales-assisted", () => {
    expect(candidatesOf("plg")).toEqual(CANDIDATE_IDS);
    expect(candidatesOf("slg")).toEqual(SLG_CANDIDATE_IDS);
    for (const s of ALL_METRIC_SHAPES) expect(motionOfMetric(s.id), s.id).toBe(s.scope === "slg" || s.scope === "link" ? "slg" : s.scope === "mkt" ? "mkt" : "plg");
    expect(motionOfMetric("rev.ltv")).toBe("plg");
    expect(motionOfMetric("slg.rev.ltv")).toBe("slg");
  });
});

// --- The consumer app's numbers (engine spec §21.4, A22 APP-1) ------------------------------------------------------
//
// Non-vacuity, measured on 2026-10-05 (each sabotage applied alone, the engine's unit tests run, then put back):
//  - `appShapeShown` showing the commission with ads only: 3 tests fall — the « ads alone » count (15, not 14), the
//    `appShapeShown` table, and the app's count in coverage.test.ts. Subscriptions-and-ads and purchases-and-ads
//    keep their counts (the commission is shown there anyway): the table is what sees it.
//  - `shapesOf` keeping `acq.cac` and `rev.gross-margin` for an app: 13 (11 here, the seven counts included; 2 in coverage.test.ts).
//  - `shapesOf` keeping the five subscription numbers without subscriptions: 8 (6 here; 2 in coverage.test.ts).
//  - `UNIT_INPUT_IDS` built from `ALL_DERIVED_SHAPES` (the old `UNIT_INPUTS`): 2 — its test here, and the keys of
//    `unitInput` in engine-copy.test.ts.
//  - `metricsOfStageIn` ignoring the setup: 2 (the ★ test and the stage-panel test). `derivedShapesOf` giving an app
//    `rev.grr` and `rev.nrr` whatever its subscriptions: 1.
describe("the consumer app's numbers (engine spec §21.4, A22 APP-1)", () => {
  const M = (subscriptions: boolean, purchases: boolean, ads: boolean): AppMonetization => ({ subscriptions, purchases, ads });
  const appSetup = (monetization: AppMonetization): SetupShapes => ({ type: "consumer-app", motions: { plg: true, slg: false }, monetization });
  const ALL_THREE = M(true, true, true);
  const SUBSCRIPTIONS_ONLY = M(true, false, false);
  const USAGE_ONLY = M(false, true, true);
  const idsOf = (setup: SetupShapes) => shapesOf(setup).map((s) => s.id);
  const APP_IDS = APP_METRIC_SHAPES.map((s) => s.id);

  it("has the six numbers of §21.4.1, in the spec's order, each in the app's scope — never a ★, a reference or a Tour question (D14)", () => {
    expect(APP_IDS).toEqual([
      "app.acq.cpi",
      "app.ret.active-retention",
      "app.rev.purchases-per-active",
      "app.rev.ads-per-active",
      "app.rev.commission",
      "app.rev.gross-margin",
    ]);
    for (const s of APP_METRIC_SHAPES) {
      expect([s.scope, s.span, s.primary], s.id).toEqual(["app", 1, false]);
      expect(s.benchmark, s.id).toBeUndefined();
      expect(s.tourQuestionId, s.id).toBeUndefined();
      expect(s.window, s.id).toBeUndefined();
    }
  });

  it("writes the table of §21.4.1 line for line: stage, value kinds, unit, bounds, flow, effort, role, sources, term, variants, repair", () => {
    const CAC_VARIANTS = ["media-only", "plus-team", "fully-loaded"];
    const expected: Record<string, Partial<MetricShape>> = {
      "app.acq.cpi": { stage: "acquisition", valueKinds: ["ratio", "amount"], unit: "money", bounded: false, flow: "month", effort: "ask", defaultRole: "finance", sources: ["appsflyer", "adjust", "google-ads", "meta-ads"], glossary: "cac", variants: CAC_VARIANTS, defaultRepair: "meeting" },
      "app.ret.active-retention": { stage: "retention", valueKinds: ["ratio", "rate"], unit: "percent", bounded: true, flow: "month", effort: "self-1h", defaultRole: "data", sources: ["amplitude", "mixpanel", "ga4"], glossary: "retention", defaultRepair: "sprint" },
      "app.rev.purchases-per-active": { stage: "revenue", valueKinds: ["ratio"], unit: "money", bounded: false, flow: "month", effort: "self-1h", defaultRole: "finance", sources: ["revenuecat", "app-store-connect", "play-console"], glossary: "arpu", defaultRepair: "afternoon" },
      "app.rev.ads-per-active": { stage: "revenue", valueKinds: ["ratio"], unit: "money", bounded: false, flow: "month", effort: "ask", defaultRole: "finance", sources: ["spreadsheet"], glossary: "arpu", defaultRepair: "afternoon" },
      "app.rev.commission": { stage: "revenue", valueKinds: ["ratio", "rate"], unit: "percent", amounts: true, bounded: true, flow: "month", effort: "self-1h", defaultRole: "finance", sources: ["revenuecat", "app-store-connect", "play-console"], glossary: "cac-payback", defaultRepair: "meeting" },
      "app.rev.gross-margin": { stage: "revenue", valueKinds: ["ratio", "rate"], unit: "percent", amounts: true, bounded: true, flow: "month", effort: "ask", defaultRole: "finance", sources: ["spreadsheet"], glossary: "cac-payback", defaultRepair: "meeting" },
    };
    for (const s of APP_METRIC_SHAPES) {
      const want = expected[s.id]!;
      expect(s, s.id).toMatchObject(want);
      // `toMatchObject` does not see an extra key: the two flags that are absent in most lines are checked apart.
      expect(s.amounts, `${s.id}.amounts`).toBe(want.amounts);
      expect(s.variants, `${s.id}.variants`).toEqual(want.variants);
      expect(s.naReasons, `${s.id}.naReasons`).toBeUndefined();
    }
  });

  it("links every app number and figure to a glossary term that exists, and its inputs to numbers that exist", () => {
    for (const s of [...APP_METRIC_SHAPES, ...APP_DERIVED_SHAPES]) expect(GLOSSARY_TERMS[s.glossary], `${s.id} → ${s.glossary}`).toBeDefined();
    const known = new Set<MetricId>(ALL_METRIC_SHAPES.map((s) => s.id));
    for (const d of APP_DERIVED_SHAPES) for (const input of d.inputs) expect(known.has(input), `${d.id} ← ${input}`).toBe(true);
  });

  /** See the head of this block: the commission shown with ads only fails the « ads alone » case (14) of these seven, and the table test. */
  it.each([
    ["the three ways", ALL_THREE, 21],
    ["subscriptions alone", SUBSCRIPTIONS_ONLY, 18],
    ["purchases alone", M(false, true, false), 15],
    ["ads alone", M(false, false, true), 14],
    ["subscriptions and ads", M(true, false, true), 20],
    ["subscriptions and purchases", M(true, true, false), 20],
    ["purchases and ads", USAGE_ONLY, 16],
  ] as const)("shows %s: the count of §21.4.1", (_label, monetization, count) => {
    expect(shapesOf(appSetup(monetization))).toHaveLength(count);
  });

  it("shows an app number as soon as ONE ticked way calls for it (appShapeShown)", () => {
    // [subscriptions alone, purchases alone, ads alone] per number: the table of §21.4.1.
    const table: Record<(typeof APP_IDS)[number], [boolean, boolean, boolean]> = {
      "app.acq.cpi": [true, true, true],
      "app.rev.gross-margin": [true, true, true],
      "app.rev.commission": [true, true, false],
      "app.ret.active-retention": [false, true, true],
      "app.rev.purchases-per-active": [false, true, false],
      "app.rev.ads-per-active": [false, false, true],
    };
    for (const id of APP_IDS) {
      const [subscriptions, purchases, ads] = table[id];
      expect(appShapeShown(id, M(true, false, false)), `${id} · subscriptions`).toBe(subscriptions);
      expect(appShapeShown(id, M(false, true, false)), `${id} · purchases`).toBe(purchases);
      expect(appShapeShown(id, M(false, false, true)), `${id} · ads`).toBe(ads);
      expect(appShapeShown(id, ALL_THREE), `${id} · all three`).toBe(subscriptions || purchases || ads);
    }
  });

  /** Letting `acq.cac` and `rev.gross-margin` through fails this test and the seven counts above (each one more). */
  it("lists an app's numbers in the catalogue's order: the self-serve ones kept, then its own — and never the two it replaces, the sales-assisted ones or the link", () => {
    const kept = METRIC_SHAPES.map((s) => s.id).filter((id) => !(APP_REPLACED as readonly string[]).includes(id));
    expect(idsOf(appSetup(ALL_THREE))).toEqual([...kept, ...APP_IDS]);
    expect(APP_REPLACED).toEqual(["acq.cac", "rev.gross-margin"]);
    for (const setup of [appSetup(ALL_THREE), appSetup(SUBSCRIPTIONS_ONLY), appSetup(USAGE_ONLY)]) {
      const ids = idsOf(setup);
      expect(ids).not.toContain("acq.cac");
      expect(ids).not.toContain("rev.gross-margin");
      expect(ids.filter((id) => id.startsWith("slg.") || id.startsWith("link."))).toEqual([]);
    }
  });

  /** Keeping the five without subscriptions fails the three counts without subscriptions (15, 14, 16) and this one. */
  it("drops the five subscription numbers when subscriptions are unticked, and keeps them otherwise", () => {
    expect(SUBSCRIPTION_METRICS).toEqual(["ret.logo-churn", "rev.paid-conversion", "rev.arpa", "rev.expansion", "rev.contraction"]);
    for (const id of SUBSCRIPTION_METRICS) {
      expect(idsOf(appSetup(USAGE_ONLY)), id).not.toContain(id);
      expect(idsOf(appSetup(SUBSCRIPTIONS_ONLY)), id).toContain(id);
    }
    expect(idsOf(appSetup(USAGE_ONLY))).toEqual([
      "acq.signup-rate", "acq.top-channel-share", "act.event", "act.rate", "act.ttv", "ret.d30", "ret.churn-cause",
      "ref.mechanism", "ref.referred-share", "ref.k-factor",
      "app.acq.cpi", "app.ret.active-retention", "app.rev.purchases-per-active", "app.rev.ads-per-active", "app.rev.commission", "app.rev.gross-margin",
    ]);
  });

  it("gives a Revenue ★ to an app with subscriptions only; without them the stage has none (D12), and the other stages keep theirs", () => {
    const stars = (setup: SetupShapes, stage: Parameters<typeof metricsOfStageIn>[0]) => metricsOfStageIn(stage, "plg", setup).filter((s) => s.primary).map((s) => s.id);
    expect(stars(appSetup(SUBSCRIPTIONS_ONLY), "revenue")).toEqual(["rev.paid-conversion"]);
    expect(stars(appSetup(USAGE_ONLY), "revenue")).toEqual([]);
    for (const stage of ["acquisition", "activation", "retention", "referral"] as const) {
      expect(stars(appSetup(USAGE_ONLY), stage), stage).toEqual(METRIC_SHAPES.filter((s) => s.stage === stage && s.primary).map((s) => s.id));
    }
  });

  it("puts an app's own numbers in its stage panels, ★ first; with no setup, or for a SaaS, a panel is what it was", () => {
    expect(metricsOfStageIn("acquisition", "plg", appSetup(ALL_THREE)).map((s) => s.id)).toEqual(["acq.signup-rate", "acq.top-channel-share", "app.acq.cpi"]);
    expect(metricsOfStageIn("revenue", "plg", appSetup(USAGE_ONLY)).map((s) => s.id)).toEqual(["app.rev.purchases-per-active", "app.rev.ads-per-active", "app.rev.commission", "app.rev.gross-margin"]);
    for (const stage of PILLARS) {
      for (const motion of ["plg", "slg"] as const) {
        const today = metricsOfStageIn(stage, motion).map((s) => s.id);
        expect(metricsOfStageIn(stage, motion, { type: "b2b-saas", motions: { plg: true, slg: true } }).map((s) => s.id), `${stage} ${motion}`).toEqual(today);
      }
      expect(metricsOfStageIn(stage, "plg").map((s) => s.id), stage).toEqual(metricsOfStage(stage).map((s) => s.id));
    }
  });

  it("never adds an app number to a SaaS, whatever a stray monetization says; a SaaS's list is the one it always was", () => {
    for (const [plg, slg] of [[true, false], [false, true], [true, true]] as const) {
      const saas: SetupShapes = { type: "b2b-saas", motions: { plg, slg } };
      const stray: SetupShapes = { ...saas, monetization: ALL_THREE };
      expect(idsOf(stray)).toEqual(idsOf(saas));
      expect(shapesOf(saas).filter((s) => s.scope === "app")).toEqual([]);
    }
  });

  it("reads an app's monetization through monetizationOf: a missing or invalid one shows the subscriptions-only list (18)", () => {
    const noBoxes: SetupShapes = { type: "consumer-app", motions: { plg: true, slg: false } };
    expect(shapesOf(noBoxes)).toHaveLength(18);
    expect(shapesOf({ ...noBoxes, monetization: "x" as never })).toHaveLength(18);
    expect(shapesOf({ ...noBoxes, monetization: M(false, false, false) })).toHaveLength(18);
  });

  it("motionShapes is shapesOf with the link left out — for an app, the same list", () => {
    expect(motionShapes(appSetup(ALL_THREE))).toEqual(shapesOf(appSetup(ALL_THREE)));
    expect(motionShapes({ type: "b2b-saas", motions: { plg: true, slg: true } })).toHaveLength(32);
    expect(motionShapes({ type: "b2b-saas", motions: { plg: true, slg: false } })).toEqual(METRIC_SHAPES);
  });

  it("an app number is of the self-serve motion, like its figures", () => {
    for (const id of [...APP_IDS, ...APP_DERIVED_SHAPES.map((d) => d.id)]) expect(motionOfMetric(id), id).toBe("plg");
  });

  it("has four per-install figures, all in Revenue, with no reference and no Tour question (§21.4.2)", () => {
    expect(APP_DERIVED_SHAPES.map((d) => [d.id, d.stage, d.glossary])).toEqual([
      ["app.rev.install-value", "revenue", "ltv"],
      ["app.rev.install-ltv", "revenue", "ltv"],
      ["app.rev.install-payback", "revenue", "cac-payback"],
      ["app.rev.value-to-cost", "revenue", "ltv"],
    ]);
    for (const d of APP_DERIVED_SHAPES) {
      expect(d.benchmark, d.id).toBeUndefined();
      expect(d.tourQuestionId, d.id).toBeUndefined();
    }
    // The app's four sit right before the marketplace's six, which `ALL_DERIVED_SHAPES` takes in last (§22.2.3).
    expect(ALL_DERIVED_SHAPES.slice(-10, -6)).toEqual(APP_DERIVED_SHAPES);
    expect(derivedShapeOf("app.rev.value-to-cost").glossary).toBe("ltv");
  });

  it("lists as inputs the COMPLETE set the figures can read — the calculation reads only the ticked ones (§21.4.2)", () => {
    const value = ["app.rev.gross-margin", "app.rev.commission", "rev.paid-conversion", "rev.arpa", "ret.logo-churn", "ret.d30", "app.rev.purchases-per-active", "app.rev.ads-per-active", "app.ret.active-retention"];
    const [installValue, installLtv, payback, valueToCost] = APP_DERIVED_SHAPES;
    expect(installValue!.inputs).toEqual(value);
    expect(installLtv!.inputs).toEqual(value);
    expect(payback!.inputs).toEqual([...value, "app.acq.cpi"]);
    expect(valueToCost!.inputs).toEqual([...value, "app.acq.cpi"]);
  });

  /** Building the set from `ALL_DERIVED_SHAPES` adds `ret.d30` and `rev.paid-conversion`: fails here and in engine-copy.test.ts. */
  it("UNIT_INPUT_IDS: the inputs « il manque » writes with an article — the SaaS's ten, the app's six and the marketplace's twelve, not `ret.d30` nor `rev.paid-conversion`", () => {
    const saas = [...DERIVED_SHAPES, ...SLG_DERIVED_SHAPES].flatMap((d) => d.inputs);
    const market = MKT_DERIVED_SHAPES.flatMap((d) => d.inputs);
    expect([...UNIT_INPUT_IDS].sort()).toEqual([...new Set<string>([...saas, ...APP_IDS, ...market])].sort());
    expect(UNIT_INPUT_IDS.size).toBe(28);
    expect(UNIT_INPUT_IDS.has("ret.d30")).toBe(false);
    expect(UNIT_INPUT_IDS.has("rev.paid-conversion")).toBe(false);
    for (const id of ["acq.cac", "rev.arpa", "rev.gross-margin", "ret.logo-churn", "rev.expansion", "rev.contraction", "slg.acq.cac", "slg.rev.acv", "slg.rev.gross-margin", "slg.ret.renewal"] as const) {
      expect(UNIT_INPUT_IDS.has(id), id).toBe(true);
    }
    // Every app-only input the figures name has its phrase; `app.acq.cpi` is one of them.
    expect([...UNIT_INPUT_IDS].filter((id) => id.startsWith("app.")).sort()).toEqual([...APP_IDS].sort());
  });

  it("derivedShapesOf: a SaaS's figures as before; an app's grr and nrr with subscriptions, then its four", () => {
    const ids = (setup: SetupShapes) => derivedShapesOf(setup).map((d) => d.id);
    const saas = (plg: boolean, slg: boolean): SetupShapes => ({ type: "b2b-saas", motions: { plg, slg } });
    expect(ids(saas(true, false))).toEqual(["rev.ltv", "rev.cac-payback", "rev.ltv-cac", "rev.grr", "rev.nrr"]);
    expect(ids(saas(false, true))).toEqual(["slg.rev.ltv", "slg.rev.cac-payback", "slg.rev.ltv-cac"]);
    expect(ids(saas(true, true))).toEqual(["rev.ltv", "rev.cac-payback", "rev.ltv-cac", "rev.grr", "rev.nrr", "slg.rev.ltv", "slg.rev.cac-payback", "slg.rev.ltv-cac"]);
    const four = ["app.rev.install-value", "app.rev.install-ltv", "app.rev.install-payback", "app.rev.value-to-cost"];
    expect(ids(appSetup(SUBSCRIPTIONS_ONLY))).toEqual(["rev.grr", "rev.nrr", ...four]);
    expect(ids(appSetup(ALL_THREE))).toEqual(["rev.grr", "rev.nrr", ...four]);
    expect(ids(appSetup(USAGE_ONLY))).toEqual(four);
    // The three self-serve figures never show for an app (D2): they read the CAC and the margin it does not have.
    for (const id of ["rev.ltv", "rev.cac-payback", "rev.ltv-cac"]) expect(ids(appSetup(ALL_THREE))).not.toContain(id);
  });
});

// --- The marketplace's numbers (engine spec §22.4, A23 MKT-1) -------------------------------------------------------
//
// Non-vacuity, measured on 2026-10-18 (each sabotage applied alone, the tests of `src/lib/engine`, `src/content`, `src/app`
// and `src/__tests__` run, then put back; the count is the tests that fall, over all those files):
//  - `shapesOf` keeping the five subscription numbers without the box: 4 — here « shapesOf », the ★ test and the stage
//    lists (3), and the Settings' counts in shared-counts.test.ts (1).
//  - the marketplace branch of `shapesOf` moved after the `throw` of the two unticked boxes: 5 (3 here, one in
//    engine-props.test.ts, one in shared-counts.test.ts) — the branch must be the first line.
//  - `mkt.sell.paid-conversion` without its `first-sale` window: 2 — the table and the windows test.
//  - `motionOfMetric` without its `mkt.` line: 15 tests — this file's motions test and this block's (2), but also the Tour's
//    mirror (bridge.test.ts 5, the app's, the hybrid deck's, four deck tests, the golden v1 and v2) and two files that no
//    longer load: a marketplace bridge read as the SaaS's would add its rows to theirs.
//  - `LOWER_IS_BETTER_CANDIDATES` without `mkt.sell.paid-churn`: 1; `UNPRICED_CANDIDATES` without `mkt.sell.first-sale`: 2
//    (the pricing test above and the shared rules).
//  - `mkt.rev.take-rate` no longer a ★: 3 (the table, the ★ test, the stage lists); the `sellerSubscription` flag off
//    `mkt.sell.ltv`: 1; the LTV:CAC without the churn among its inputs: 1; the marketplace left out of `UNIT_INPUT_IDS`: 2
//    (here and in engine-copy.test.ts); the « mkt » branch of `metricsOfStageIn` dropped: 1.
//  - **Not observable**: `shapesOf` of a SaaS without its `s.scope === "mkt"` clause falls nothing — `motions["mkt"]` is
//    `undefined`, so the filter drops the number anyway. The clause is the compiler's (`motions` is a
//    `Record<Motion, boolean>`), kept because indexing it with a scope that is not a motion would not compile.
describe("the marketplace's numbers (engine spec §22.4, A23 MKT-1)", () => {
  const market = (sellerSubscriptions?: boolean): SetupShapes => ({
    type: "marketplace",
    motions: { plg: false, slg: false },
    ...(sellerSubscriptions === undefined ? {} : { sellerSubscriptions }),
  });
  const WITH = market(true);
  const WITHOUT = market(false);
  const MKT_IDS = MKT_METRIC_SHAPES.map((s) => s.id);
  const SUBSCRIPTION_IDS = ["mkt.sell.signup-rate", "mkt.sell.paid-churn", "mkt.sell.paid-conversion", "mkt.sell.arpa", "mkt.sell.gross-margin"];

  it("has the nineteen numbers of §22.4.1, in the table's order, each of the marketplace's scope and one month long", () => {
    expect(MKT_IDS).toEqual([
      "mkt.buy.signup-rate",
      "mkt.buy.cac",
      "mkt.sell.cac",
      "mkt.sell.signup-rate",
      "mkt.buy.first-order",
      "mkt.sell.first-sale",
      "mkt.liq.fill-rate",
      "mkt.buy.repeat",
      "mkt.buy.churn",
      "mkt.sell.churn",
      "mkt.sell.paid-churn",
      "mkt.buy.referred-share",
      "mkt.rev.take-rate",
      "mkt.rev.aov",
      "mkt.rev.frequency",
      "mkt.rev.gross-margin",
      "mkt.sell.paid-conversion",
      "mkt.sell.arpa",
      "mkt.sell.gross-margin",
    ]);
    for (const s of MKT_METRIC_SHAPES) expect([s.scope, s.span], s.id).toEqual(["mkt", 1]);
    expect(ALL_METRIC_SHAPES.slice(-19)).toEqual(MKT_METRIC_SHAPES);
  });

  it("writes the table of §22.4.1 line for line: stage, ★, side, value kinds, unit, bounds, flow, window, effort, role, sources, term, Tour question, variants, repair, subscription", () => {
    const CAC_VARIANTS = ["media-only", "plus-team", "fully-loaded"];
    const rate = { valueKinds: ["ratio", "rate"], unit: "percent", bounded: true } as const;
    const amount = { valueKinds: ["ratio", "amount"], unit: "money", bounded: false } as const;
    const marginRate = { ...rate, amounts: true } as const;
    const expected: Record<string, Partial<MetricShape>> = {
      "mkt.buy.signup-rate": { stage: "acquisition", primary: true, side: "buy", ...rate, flow: "month", effort: "self-5min", defaultRole: "marketing", sources: ["ga4", "mixpanel", "amplitude", "product-db"], glossary: "acquisition", defaultRepair: "afternoon" },
      "mkt.buy.cac": { stage: "acquisition", primary: false, side: "buy", ...amount, flow: "month", effort: "ask", defaultRole: "finance", sources: ["google-ads", "meta-ads", "product-db"], glossary: "cac", tourQuestionId: "acq-3", variants: CAC_VARIANTS, defaultRepair: "meeting" },
      "mkt.sell.cac": { stage: "acquisition", primary: false, side: "sell", ...amount, flow: "month", effort: "ask", defaultRole: "finance", sources: ["hubspot", "spreadsheet", "linkedin-ads"], glossary: "cac", variants: CAC_VARIANTS, defaultRepair: "meeting" },
      "mkt.sell.signup-rate": { stage: "acquisition", primary: false, side: "sell", sellerSubscription: true, ...rate, flow: "month", effort: "self-5min", defaultRole: "marketing", sources: ["ga4", "mixpanel", "amplitude", "product-db"], glossary: "acquisition", defaultRepair: "afternoon" },
      "mkt.buy.first-order": { stage: "activation", primary: true, side: "buy", ...rate, flow: "cohort", window: "first-order", effort: "self-1h", defaultRole: "data", sources: ["product-db", "amplitude", "mixpanel"], glossary: "activation", tourQuestionId: "act-2", defaultRepair: "sprint" },
      "mkt.sell.first-sale": { stage: "activation", primary: true, side: "sell", ...rate, flow: "cohort", window: "first-sale", effort: "self-1h", defaultRole: "data", sources: ["product-db"], glossary: "activation", defaultRepair: "sprint" },
      "mkt.liq.fill-rate": { stage: "activation", primary: false, side: "match", ...rate, flow: "month", effort: "ask", defaultRole: "data", sources: ["product-db", "amplitude", "mixpanel"], glossary: "marketplace-liquidity", variants: ["requests", "searches"], defaultRepair: "sprint" },
      "mkt.buy.repeat": { stage: "retention", primary: true, side: "buy", ...rate, flow: "cohort", window: "repeat", effort: "self-1h", defaultRole: "data", sources: ["product-db", "amplitude"], glossary: "retention", tourQuestionId: "ret-1", defaultRepair: "sprint" },
      "mkt.buy.churn": { stage: "retention", primary: false, side: "buy", ...rate, flow: "month", effort: "ask", defaultRole: "data", sources: ["product-db"], glossary: "churn", defaultRepair: "afternoon" },
      "mkt.sell.churn": { stage: "retention", primary: true, side: "sell", ...rate, flow: "month", effort: "ask", defaultRole: "data", sources: ["product-db"], glossary: "churn", defaultRepair: "afternoon" },
      "mkt.sell.paid-churn": { stage: "retention", primary: false, side: "sell", sellerSubscription: true, ...rate, flow: "month", effort: "self-5min", defaultRole: "finance", sources: ["stripe", "product-db"], glossary: "churn", defaultRepair: "afternoon" },
      "mkt.buy.referred-share": { stage: "referral", primary: true, side: "buy", ...rate, flow: "cohort", effort: "self-1h", defaultRole: "marketing", sources: ["product-db", "hubspot"], glossary: "referral", defaultRepair: "sprint" },
      "mkt.rev.take-rate": { stage: "revenue", primary: true, side: "match", ...marginRate, flow: "month", effort: "self-5min", defaultRole: "finance", sources: ["stripe", "spreadsheet", "product-db"], glossary: "take-rate", defaultRepair: "meeting" },
      "mkt.rev.aov": { stage: "revenue", primary: false, side: "buy", ...amount, flow: "month", effort: "self-5min", defaultRole: "finance", sources: ["product-db", "stripe"], glossary: "arpu", defaultRepair: "meeting" },
      "mkt.rev.frequency": { stage: "revenue", primary: false, side: "buy", valueKinds: ["ratio"], unit: "ratio", bounded: false, flow: "month", effort: "self-1h", defaultRole: "data", sources: ["product-db"], glossary: "retention", defaultRepair: "afternoon" },
      "mkt.rev.gross-margin": { stage: "revenue", primary: false, side: "match", ...marginRate, flow: "month", effort: "ask", defaultRole: "finance", sources: ["spreadsheet"], glossary: "cac-payback", defaultRepair: "meeting" },
      "mkt.sell.paid-conversion": { stage: "revenue", primary: true, side: "sell", sellerSubscription: true, ...rate, flow: "cohort", window: "first-sale", effort: "self-1h", defaultRole: "data", sources: ["product-db", "stripe"], glossary: "revenue", defaultRepair: "sprint" },
      "mkt.sell.arpa": { stage: "revenue", primary: false, side: "sell", sellerSubscription: true, ...amount, flow: "month", effort: "self-5min", defaultRole: "finance", sources: ["stripe", "product-db"], glossary: "arpu", defaultRepair: "meeting" },
      "mkt.sell.gross-margin": { stage: "revenue", primary: false, side: "sell", sellerSubscription: true, ...marginRate, flow: "month", effort: "ask", defaultRole: "finance", sources: ["spreadsheet"], glossary: "cac-payback", defaultRepair: "meeting" },
    };
    expect(Object.keys(expected)).toEqual(MKT_IDS);
    for (const s of MKT_METRIC_SHAPES) {
      const want = expected[s.id]!;
      expect(s, s.id).toMatchObject(want);
      // `toMatchObject` does not see an extra key: the optional ones are compared apart.
      for (const key of ["amounts", "window", "tourQuestionId", "variants", "sellerSubscription"] as const) expect(s[key], `${s.id}.${key}`).toEqual(want[key]);
      // No reference (D12, C73), no dependency, nothing optional, no closed list but the variants.
      expect(s.benchmark, s.id).toBeUndefined();
      expect(s.dependsOn, s.id).toBeUndefined();
      expect(s.optional, s.id).toBeUndefined();
      expect(s.naReasons, s.id).toBeUndefined();
      expect(s.choices, s.id).toBeUndefined();
    }
  });

  it("links every number and figure to a glossary term that exists, and every input of a figure to a number of the marketplace", () => {
    for (const s of [...MKT_METRIC_SHAPES, ...MKT_DERIVED_SHAPES]) expect(GLOSSARY_TERMS[s.glossary], `${s.id} → ${s.glossary}`).toBeDefined();
    for (const d of MKT_DERIVED_SHAPES) for (const input of d.inputs) expect(MKT_IDS, `${d.id} ← ${input}`).toContain(input);
  });

  it("shapesOf: all nineteen with the sellers' subscriptions, fourteen without — the setting absent or invalid reads as without — and never a SaaS or app number", () => {
    expect(shapesOf(WITH).map((s) => s.id)).toEqual(MKT_IDS);
    expect(shapesOf(WITHOUT)).toHaveLength(14);
    expect(shapesOf(market())).toHaveLength(14);
    expect(shapesOf({ ...WITH, sellerSubscriptions: "yes" as never })).toHaveLength(14);
    expect(shapesOf(WITHOUT).map((s) => s.id)).toEqual(MKT_IDS.filter((id) => !SUBSCRIPTION_IDS.includes(id)));
    expect(MKT_METRIC_SHAPES.filter((s) => s.sellerSubscription).map((s) => s.id)).toEqual(MKT_IDS.filter((id) => SUBSCRIPTION_IDS.includes(id)));
    // Two unticked boxes are no error for a marketplace (the branch comes before the `throw`); a stray tick changes nothing.
    expect(() => shapesOf(WITH)).not.toThrow();
    expect(shapesOf({ ...WITH, motions: { plg: true, slg: true } })).toEqual(shapesOf(WITH));
    expect(motionShapes(WITH)).toEqual(shapesOf(WITH));
  });

  it("a SaaS and an app never show a marketplace number, whatever stray fields their setup carries", () => {
    for (const [plg, slg] of [[true, false], [false, true], [true, true]] as const) {
      const saas: SetupShapes = { type: "b2b-saas", motions: { plg, slg }, sellerSubscriptions: true };
      expect(shapesOf(saas).filter((s) => s.scope === "mkt")).toEqual([]);
      expect(derivedShapesOf(saas).filter((d) => d.id.startsWith("mkt."))).toEqual([]);
    }
    const app: SetupShapes = { type: "consumer-app", motions: { plg: true, slg: false }, monetization: { subscriptions: true, purchases: true, ads: true }, sellerSubscriptions: true };
    expect(shapesOf(app).filter((s) => s.scope === "mkt")).toEqual([]);
    expect(derivedShapesOf(app).filter((d) => d.id.startsWith("mkt."))).toEqual([]);
  });

  it("carries a ★ per stage on the demand side, and on the supply side the first sale, the sellers' churn, and with the subscriptions the conversion (C95)", () => {
    const stars = (setup: SetupShapes, sides: readonly string[]) => shapesOf(setup).filter((s) => s.primary && sides.includes(s.side ?? "")).map((s) => [s.stage, s.id]);
    const demand = [
      ["acquisition", "mkt.buy.signup-rate"],
      ["activation", "mkt.buy.first-order"],
      ["retention", "mkt.buy.repeat"],
      ["referral", "mkt.buy.referred-share"],
      ["revenue", "mkt.rev.take-rate"],
    ];
    expect(stars(WITH, ["buy", "match"])).toEqual(demand);
    expect(stars(WITHOUT, ["buy", "match"])).toEqual(demand);
    expect(stars(WITH, ["sell"])).toEqual([["activation", "mkt.sell.first-sale"], ["retention", "mkt.sell.churn"], ["revenue", "mkt.sell.paid-conversion"]]);
    expect(stars(WITHOUT, ["sell"])).toEqual([["activation", "mkt.sell.first-sale"], ["retention", "mkt.sell.churn"]]);
  });

  it("derivedShapesOf: a buyer's three, then a paid seller's three with the subscriptions — in Revenue, with no reference and a Tour question on the buyer's LTV only", () => {
    const ids = (setup: SetupShapes) => derivedShapesOf(setup).map((d) => d.id);
    const buyer = ["mkt.rev.ltv", "mkt.rev.cac-payback", "mkt.rev.ltv-cac"];
    const seller = ["mkt.sell.ltv", "mkt.sell.cac-payback", "mkt.sell.ltv-cac"];
    expect(ids(WITH)).toEqual([...buyer, ...seller]);
    expect(ids(WITHOUT)).toEqual(buyer);
    expect(ids(market())).toEqual(buyer);
    expect(MKT_DERIVED_SHAPES.map((d) => [d.id, d.stage, d.glossary, d.tourQuestionId, d.sellerSubscription])).toEqual([
      ["mkt.rev.ltv", "revenue", "ltv", "rev-2", undefined],
      ["mkt.rev.cac-payback", "revenue", "cac-payback", undefined, undefined],
      ["mkt.rev.ltv-cac", "revenue", "ltv", undefined, undefined],
      ["mkt.sell.ltv", "revenue", "ltv", undefined, true],
      ["mkt.sell.cac-payback", "revenue", "cac-payback", undefined, true],
      ["mkt.sell.ltv-cac", "revenue", "ltv", undefined, true],
    ]);
    for (const d of MKT_DERIVED_SHAPES) expect(d.benchmark, d.id).toBeUndefined();
    expect(ALL_DERIVED_SHAPES.slice(-6)).toEqual(MKT_DERIVED_SHAPES);
  });

  it("lists as inputs the complete set each figure reads (§22.4.2): the LTV's, the payback's, and both for the LTV:CAC", () => {
    const [ltv, payback, ltvCac, sellerLtv, sellerPayback, sellerLtvCac] = MKT_DERIVED_SHAPES.map((d) => [...d.inputs]);
    expect(ltv).toEqual(["mkt.rev.frequency", "mkt.rev.aov", "mkt.rev.take-rate", "mkt.rev.gross-margin", "mkt.buy.churn"]);
    expect(payback).toEqual(["mkt.buy.cac", "mkt.rev.frequency", "mkt.rev.aov", "mkt.rev.take-rate", "mkt.rev.gross-margin"]);
    expect([...new Set([...ltv!, ...payback!])].sort()).toEqual([...ltvCac!].sort());
    expect(ltvCac).toHaveLength(6);
    expect(sellerLtv).toEqual(["mkt.sell.arpa", "mkt.sell.gross-margin", "mkt.sell.paid-churn"]);
    expect(sellerPayback).toEqual(["mkt.sell.cac", "mkt.sell.first-sale", "mkt.sell.paid-conversion", "mkt.sell.arpa", "mkt.sell.gross-margin"]);
    expect([...new Set([...sellerLtv!, ...sellerPayback!])].sort()).toEqual([...sellerLtvCac!].sort());
    expect(sellerLtvCac).toHaveLength(6);
  });

  it("the lists of §22.4.3: each side's candidates and levers in canonical order, all rates the marketplace shows, never a number of both sides", () => {
    expect([...MKT_DEMAND_CANDIDATE_IDS]).toEqual(["mkt.buy.signup-rate", "mkt.buy.first-order", "mkt.liq.fill-rate", "mkt.buy.referred-share", "mkt.buy.repeat", "mkt.buy.churn"]);
    expect([...MKT_SUPPLY_CANDIDATE_IDS]).toEqual(["mkt.sell.signup-rate", "mkt.sell.first-sale", "mkt.sell.paid-conversion", "mkt.sell.churn", "mkt.sell.paid-churn"]);
    expect([...MKT_DEMAND_LEVER_IDS]).toEqual(["mkt.buy.signup-rate", "mkt.buy.referred-share", "mkt.buy.first-order", "mkt.liq.fill-rate", "mkt.buy.churn", "mkt.rev.frequency", "mkt.rev.aov", "mkt.rev.take-rate"]);
    expect([...MKT_SUPPLY_LEVER_IDS]).toEqual(["mkt.sell.paid-conversion", "mkt.sell.paid-churn", "mkt.sell.arpa"]);
    for (const id of [...MKT_DEMAND_CANDIDATE_IDS, ...MKT_SUPPLY_CANDIDATE_IDS]) {
      expect(MKT_IDS, id).toContain(id);
      expect(shapeOf(id).unit, id).toBe("percent");
    }
    for (const id of [...MKT_DEMAND_LEVER_IDS, ...MKT_SUPPLY_LEVER_IDS]) expect(MKT_IDS, id).toContain(id);
    // D2: no candidate sits in both lists, and no lever in both.
    expect(MKT_DEMAND_CANDIDATE_IDS.filter((id) => (MKT_SUPPLY_CANDIDATE_IDS as readonly string[]).includes(id))).toEqual([]);
    expect(MKT_DEMAND_LEVER_IDS.filter((id) => (MKT_SUPPLY_LEVER_IDS as readonly string[]).includes(id))).toEqual([]);
    // The supply's levers and subscription candidates are exactly the numbers the subscriptions' box adds.
    const subscriptionIds: MetricId[] = [...MKT_SUPPLY_LEVER_IDS, "mkt.sell.signup-rate", "mkt.sell.paid-conversion", "mkt.sell.paid-churn"];
    for (const id of subscriptionIds) expect(shapeOf(id).sellerSubscription, id).toBe(true);
  });

  it("the shared rules: lower-is-better churns (logo churn and the marketplace's three), unpriced candidates, the referral rule, the take-rate ceiling (§22.2.3)", () => {
    expect([...LOWER_IS_BETTER_CANDIDATES]).toEqual(["ret.logo-churn", "mkt.buy.churn", "mkt.sell.churn", "mkt.sell.paid-churn"]);
    expect([...UNPRICED_CANDIDATES].filter((id) => id.startsWith("mkt."))).toEqual(["mkt.buy.repeat", "mkt.sell.first-sale", "mkt.sell.churn", "mkt.sell.signup-rate"]);
    expect(TAKE_RATE_HIGH_PERCENT).toBe(50);
  });

  it("motionOfMetric: every number and figure of the marketplace is of the `mkt` motion, and the others' are as they were", () => {
    for (const id of [...MKT_IDS, ...MKT_DERIVED_SHAPES.map((d) => d.id)]) expect(motionOfMetric(id), id).toBe("mkt");
    expect(motionOfMetric("acq.cac")).toBe("plg");
    expect(motionOfMetric("app.acq.cpi")).toBe("plg");
    expect(motionOfMetric("slg.acq.cac")).toBe("slg");
    expect(motionOfMetric("link.pql-handoff")).toBe("slg");
  });

  it("the windows: first order for the first order, repeat for the second, first sale for the first sale and the subscription conversion — read by windowDaysOf", () => {
    expect(MKT_METRIC_SHAPES.filter((s) => s.window).map((s) => [s.id, s.window])).toEqual([
      ["mkt.buy.first-order", "first-order"],
      ["mkt.sell.first-sale", "first-sale"],
      ["mkt.buy.repeat", "repeat"],
      ["mkt.sell.paid-conversion", "first-sale"],
    ]);
    const setup = exampleState().setup;
    const own = { ...setup, type: "marketplace" as const, motions: { plg: false, slg: false } };
    expect(MKT_METRIC_SHAPES.filter((s) => s.window).map((s) => windowDaysOf(s, own))).toEqual([30, 60, 90, 60]);
    expect(windowDaysOf(shapeOf("mkt.buy.first-order"), { ...own, firstOrderWindowDays: 7 })).toBe(7);
    // The cohort numbers follow a cohort; the month's numbers a month (§22.4.1).
    for (const s of MKT_METRIC_SHAPES) expect(s.window !== undefined ? s.flow === "cohort" : true, s.id).toBe(true);
  });

  it("metricsOfStageIn(stage, \"mkt\", setup): the stage's numbers of both sides in the table's order, ★ first; without a setup, all nineteen", () => {
    const ids = (stage: Parameters<typeof metricsOfStageIn>[0], setup?: SetupShapes) => metricsOfStageIn(stage, "mkt", setup).map((s) => s.id);
    expect(ids("acquisition", WITH)).toEqual(["mkt.buy.signup-rate", "mkt.buy.cac", "mkt.sell.cac", "mkt.sell.signup-rate"]);
    expect(ids("acquisition", WITHOUT)).toEqual(["mkt.buy.signup-rate", "mkt.buy.cac", "mkt.sell.cac"]);
    expect(ids("activation", WITH)).toEqual(["mkt.buy.first-order", "mkt.sell.first-sale", "mkt.liq.fill-rate"]);
    expect(ids("retention", WITH)).toEqual(["mkt.buy.repeat", "mkt.sell.churn", "mkt.buy.churn", "mkt.sell.paid-churn"]);
    expect(ids("referral", WITHOUT)).toEqual(["mkt.buy.referred-share"]);
    expect(ids("revenue", WITH)).toEqual(["mkt.rev.take-rate", "mkt.sell.paid-conversion", "mkt.rev.aov", "mkt.rev.frequency", "mkt.rev.gross-margin", "mkt.sell.arpa", "mkt.sell.gross-margin"]);
    expect(PILLARS.flatMap((stage) => ids(stage)).sort()).toEqual([...MKT_IDS].sort());
    // The SaaS's two motions are asked as before.
    expect(metricsOfStageIn("revenue", "plg").map((s) => s.id)).toEqual(metricsOfStage("revenue").map((s) => s.id));
  });

  it("the four bridges (§22.4.3): the buyer's CAC, first order, second order and LTV — a fifth is a decision", () => {
    expect(MKT_ENGINE_BRIDGES).toEqual([
      { questionId: "acq-3", metric: "mkt.buy.cac" },
      { questionId: "act-2", metric: "mkt.buy.first-order" },
      { questionId: "ret-1", metric: "mkt.buy.repeat" },
      { questionId: "rev-2", metric: "mkt.rev.ltv" },
    ]);
    for (const { questionId, metric } of MKT_ENGINE_BRIDGES) {
      const question = QUESTIONS.find((q) => q.id === questionId);
      expect(question, questionId).toBeDefined();
      const stage = metric === "mkt.rev.ltv" ? derivedShapeOf(metric).stage : shapeOf(metric as MetricId).stage;
      expect(question!.pillar, `${questionId} → ${metric}`).toBe(stage);
    }
  });
});
