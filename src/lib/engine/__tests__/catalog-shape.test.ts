import { describe, expect, it } from "vitest";
import type { AppMonetization } from "../app-model";
import type { MetricId } from "../types";
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
  METRIC_SHAPES,
  PELOTON_METRICS,
  REFERRAL_PRICING_CEILING,
  SLG_CANDIDATE_IDS,
  SLG_DERIVED_SHAPES,
  SLG_ENGINE_BRIDGES,
  SLG_LEVER_IDS,
  SLG_METRIC_SHAPES,
  SUBSCRIPTION_METRICS,
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

  it("never prices go-live (§18.5.2); prices D30 retention, and the referred shares up to a 50 % target (§19.3)", () => {
    expect([...UNPRICED_CANDIDATES]).toEqual(["slg.act.go-live"]);
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
    // A set, not a list: the seven scopes outside plg and slg are one link and six app numbers (§21).
    expect(new Set(ALL_METRIC_SHAPES.map((s) => s.scope).filter((scope) => scope !== "plg" && scope !== "slg"))).toEqual(new Set(["link", "app"]));
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
    for (const s of ALL_METRIC_SHAPES) expect(motionOfMetric(s.id), s.id).toBe(s.scope === "slg" || s.scope === "link" ? "slg" : "plg");
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
    expect(ALL_DERIVED_SHAPES.slice(-4)).toEqual(APP_DERIVED_SHAPES);
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
  it("UNIT_INPUT_IDS: the inputs « il manque » writes with an article — the SaaS's ten and the app's six, not `ret.d30` nor `rev.paid-conversion`", () => {
    const saas = [...DERIVED_SHAPES, ...SLG_DERIVED_SHAPES].flatMap((d) => d.inputs);
    expect([...UNIT_INPUT_IDS].sort()).toEqual([...new Set<string>([...saas, ...APP_IDS])].sort());
    expect(UNIT_INPUT_IDS.size).toBe(16);
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
