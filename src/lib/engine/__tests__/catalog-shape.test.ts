import { describe, expect, it } from "vitest";
import { GLOSSARY_TERMS } from "@/content/glossary-terms";
import { QUESTIONS } from "@/content/copy-library";
import { ENGINE_CATALOG, ENGINE_DERIVED_CATALOG } from "@/content/engine-catalog";
import { PILLARS } from "@/lib/scoring/pillars";
import {
  CANDIDATE_IDS,
  DERIVED_SHAPES,
  ENGINE_BRIDGES,
  METRIC_SHAPES,
  PELOTON_METRICS,
  UNPRICED_CANDIDATES,
  derivedShapeOf,
  metricsOfStage,
  shapeOf,
} from "../catalog-shape";

// Engine spec §5 — the shape half of the catalogue. The prose half is
// checked against it in src/content/__tests__/engine-catalog.test.ts.
describe("METRIC_SHAPES", () => {
  it("has fifteen metrics, three per stage, one ★ per stage — the Tour's own grid", () => {
    expect(METRIC_SHAPES).toHaveLength(15);
    expect(new Set(METRIC_SHAPES.map((s) => s.id)).size).toBe(15);
    for (const stage of PILLARS) {
      const ofStage = METRIC_SHAPES.filter((s) => s.stage === stage);
      expect(ofStage, stage).toHaveLength(3);
      expect(ofStage.filter((s) => s.primary), stage).toHaveLength(1);
    }
  });

  it("links every metric to a glossary term that exists", () => {
    for (const s of [...METRIC_SHAPES, ...DERIVED_SHAPES]) {
      expect(GLOSSARY_TERMS[s.glossary], `${s.id} → ${s.glossary}`).toBeDefined();
      if (s.benchmark) expect(GLOSSARY_TERMS[s.benchmark.term], `${s.id} benchmark`).toBeDefined();
    }
  });

  it("lets exactly two references name a bottleneck (decision D8) — adding one is a product decision", () => {
    const designating = METRIC_SHAPES.filter((s) => s.benchmark?.designates).map((s) => s.id);
    expect(designating.sort()).toEqual(["act.rate", "ret.logo-churn"]);
    expect(DERIVED_SHAPES.some((s) => s.benchmark?.designates)).toBe(false);
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
    const ids = new Set(METRIC_SHAPES.map((s) => s.id));
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

  it("never prices D30 retention or the referred share in money (§6.6)", () => {
    expect([...UNPRICED_CANDIDATES].sort()).toEqual(["ref.referred-share", "ret.d30"]);
  });

  it("builds the peloton from the three cohort ★s that follow the same 100 sign-ups", () => {
    for (const id of PELOTON_METRICS) {
      const s = shapeOf(id);
      expect(s.primary, id).toBe(true);
      expect(s.flow, id).toBe("cohort");
    }
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
    expect(Object.keys(ENGINE_CATALOG).sort()).toEqual(METRIC_SHAPES.map((s) => s.id).sort());
    expect(Object.keys(ENGINE_DERIVED_CATALOG).sort()).toEqual(DERIVED_SHAPES.map((s) => s.id).sort());
  });

  it("labels exactly the closed-list ids the shape declares", () => {
    for (const shape of METRIC_SHAPES) {
      const prose = ENGINE_CATALOG[shape.id];
      expect(prose.variants?.map((v) => v.id), `${shape.id} variants`).toEqual(shape.variants);
      expect(prose.naReasons?.map((v) => v.id), `${shape.id} naReasons`).toEqual(shape.naReasons);
      expect(prose.choices?.map((v) => v.id), `${shape.id} choices`).toEqual(shape.choices);
    }
  });

  it("prints a caveat next to every reference, and never a 'no reference' reason next to one", () => {
    for (const shape of METRIC_SHAPES) {
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
    for (const shape of METRIC_SHAPES) {
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
