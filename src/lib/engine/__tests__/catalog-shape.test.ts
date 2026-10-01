import { describe, expect, it } from "vitest";
import type { MetricId } from "../types";
import { GLOSSARY_TERMS } from "@/content/glossary-terms";
import { QUESTIONS } from "@/content/copy-library";
import { ENGINE_CATALOG, ENGINE_DERIVED_CATALOG } from "@/content/engine-catalog";
import { PILLARS } from "@/lib/scoring/pillars";
import {
  ALL_DERIVED_SHAPES,
  ALL_METRIC_SHAPES,
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
  UNPRICED_CANDIDATES,
  candidatesOf,
  derivedShapeOf,
  isPricedAt,
  metricsOfStage,
  motionOfMetric,
  shapeOf,
  shapesOf,
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
    expect(ALL_METRIC_SHAPES.map((s) => s.scope).filter((scope) => scope !== "plg" && scope !== "slg")).toEqual(["link"]);
  });

  it("the link: optional, its own scope, never a candidate (C25 Q7)", () => {
    expect(LINK_METRIC_SHAPES.map((s) => [s.id, s.scope, s.optional])).toEqual([["link.pql-handoff", "link", true]]);
    expect((SLG_CANDIDATE_IDS as readonly string[]).includes("link.pql-handoff")).toBe(false);
    expect((SLG_LEVER_IDS as readonly string[]).at(-1)).toBe("link.pql-handoff");
  });

  it("shapesOf: 17 self-serve, 15 sales-assisted, 33 in the hybrid with the link — and no setup without a motion", () => {
    expect(shapesOf({ plg: true, slg: false }).map((s) => s.id)).toEqual(METRIC_SHAPES.map((s) => s.id));
    expect(shapesOf({ plg: false, slg: true })).toHaveLength(15);
    expect(shapesOf({ plg: true, slg: true })).toHaveLength(33);
    expect(shapesOf({ plg: true, slg: true }).at(-1)?.id).toBe("link.pql-handoff");
    expect(() => shapesOf({ plg: false, slg: false })).toThrow();
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
    for (const s of ALL_METRIC_SHAPES) expect(motionOfMetric(s.id), s.id).toBe(s.scope === "plg" ? "plg" : "slg");
    expect(motionOfMetric("rev.ltv")).toBe("plg");
    expect(motionOfMetric("slg.rev.ltv")).toBe("slg");
  });
});
