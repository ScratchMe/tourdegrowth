import { describe, expect, it } from "vitest";
import { AUDIT_CATALOG } from "@/content/audit-catalog";
import { QUESTIONS } from "@/content/copy-library";
import type { Answers } from "@/lib/scoring/score";
import { QUADRANTS, criterionVerdict, declaresMeasured, methodVsReality, practicePoints, tourScore, type Quadrant } from "../quadrants";
import { entry, mission, observation, pass } from "./fixtures";

const row = (id: string) => AUDIT_CATALOG.find((r) => r.id === id)!;

describe("the method axis reads the Tour answer the auditor recorded", () => {
  it("maps the answer index to its points, and nothing without an answer", () => {
    expect(practicePoints("acq-3", { "acq-3": 0 })).toBe(20);
    expect(practicePoints("acq-3", { "acq-3": 1 })).toBe(7);
    expect(practicePoints("acq-3", { "acq-3": 2 })).toBe(0);
    expect(practicePoints("acq-3", {})).toBeNull();
    expect(practicePoints("nope", { nope: 0 } as Partial<Answers>)).toBeNull();
  });

  it("only a 20-point answer declares « we measure this »", () => {
    expect(declaresMeasured("acq-3", { "acq-3": 0 })).toBe(true);
    expect(declaresMeasured("acq-3", { "acq-3": 1 })).toBe(false);
    expect(declaresMeasured(undefined, { "acq-3": 0 })).toBe(false);
  });
});

describe("criterionVerdict — a verdict only when everything needed is there", () => {
  it("respects betterWhen, and treats equality as good", () => {
    const higher = row("m12"); // activation rate, higher is better
    const lower = row("m09"); // CAC, lower is better
    const at = (value: number, target: number) => entry("m12", "measured", { observations: [observation(value)], criterion: { kind: "internal-trend", value: target } });
    expect(criterionVerdict(higher, at(0.35, 0.3))).toBe("good");
    expect(criterionVerdict(higher, at(0.25, 0.3))).toBe("bad");
    expect(criterionVerdict(higher, at(0.3, 0.3))).toBe("good");
    expect(criterionVerdict(lower, { ...at(500, 600), metricId: "m09" })).toBe("good");
    expect(criterionVerdict(lower, { ...at(700, 600), metricId: "m09" })).toBe("bad");
  });

  it("gives no verdict without a criterion value, a numeric value, or when a « better » is contextual", () => {
    expect(criterionVerdict(row("m12"), entry("m12", "measured"))).toBeNull();
    expect(criterionVerdict(row("m12"), entry("m12", "measured", { observations: [observation("beaucoup")], criterion: { kind: "internal-trend", value: 1 } }))).toBeNull();
    expect(criterionVerdict(row("m06"), entry("m06", "measured", { observations: [observation(90)], criterion: { kind: "internal-trend", value: 80 } }))).toBeNull();
    expect(row("m06").betterWhen).toBe("contextual");
  });

  it("reads the LATEST observation of the series, not the first", () => {
    const e = entry("m12", "measured", {
      observations: [observation(0.4, { id: "old", periodEnd: "2026-03-31" }), observation(0.2, { id: "new", periodEnd: "2026-08-31" })],
      criterion: { kind: "internal-trend", value: 0.3 },
    });
    expect(criterionVerdict(row("m12"), e)).toBe("bad");
  });
});

describe("methodVsReality — every quadrant is reachable, and blind-spot needs the declaration", () => {
  const m12 = row("m12");
  const measured = (value: number, target?: number) =>
    entry("m12", "measured", { observations: [observation(value)], ...(target !== undefined ? { criterion: { kind: "internal-trend" as const, value: target } } : {}) });

  it("reaches all eight states", () => {
    const seen = new Map<Quadrant, boolean>();
    const mark = (q: Quadrant) => seen.set(q, true);
    mark(methodVsReality(m12, measured(0.4, 0.3), {}));
    mark(methodVsReality(m12, measured(0.2, 0.3), {}));
    mark(methodVsReality(m12, measured(0.2), {}));
    mark(methodVsReality(m12, entry("m12", "absent"), { "act-2": 0 }));
    mark(methodVsReality(m12, entry("m12", "absent"), { "act-2": 1 }));
    mark(methodVsReality(m12, entry("m12", "not-accessible"), { "act-2": 0 }));
    mark(methodVsReality(m12, entry("m12", "not-applicable"), {}));
    mark(methodVsReality(m12, undefined, {}));
    expect([...seen.keys()].sort()).toEqual([...QUADRANTS].sort());
  });

  it("a blind spot is « we measure this » (20 points) with nothing to show — a 7 or a missing answer is a known gap", () => {
    expect(methodVsReality(m12, entry("m12", "absent"), { "act-2": 0 })).toBe("blind-spot");
    expect(methodVsReality(m12, entry("m12", "contested"), { "act-2": 0 })).toBe("blind-spot");
    expect(methodVsReality(m12, entry("m12", "absent"), { "act-2": 1 })).toBe("known-gap");
    expect(methodVsReality(m12, entry("m12", "absent"), {})).toBe("known-gap");
  });

  it("a row with no Tour question can never be a blind spot", () => {
    const m13 = row("m13");
    expect(m13.tourQuestionId).toBeUndefined();
    expect(methodVsReality(m13, entry("m13", "absent"), { "act-2": 0 })).toBe("known-gap");
  });

  it("not accessible is about my access, not their system", () => {
    expect(methodVsReality(m12, entry("m12", "not-accessible"), { "act-2": 0 })).toBe("unverifiable");
  });

  it("reported without a definition is documented for the quadrant, with the benchmark rule applied", () => {
    const e = entry("m12", "reported-without-definition", { observations: [observation(0.4)], criterion: { kind: "internal-trend", value: 0.3 } });
    expect(methodVsReality(m12, e, {})).toBe("measured-good");
  });
});

describe("tourScore — only once the auditor has all 15 answers", () => {
  it("is null while partial, then the deterministic score", () => {
    const m = mission();
    const partial = { ...pass(m), tourAnswers: { "acq-1": 0 } as Partial<Answers> };
    expect(tourScore(partial)).toBeNull();
    const full = Object.fromEntries(QUESTIONS.map((q) => [q.id, 1 as const])) as Answers;
    const result = tourScore({ ...pass(m), tourAnswers: full });
    expect(result?.total).toBe(35); // 5 pillars × round(21/3) = 7
  });
});
