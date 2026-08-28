import { describe, expect, it } from "vitest";
import { PILLARS } from "../pillars";
import { QUESTIONS } from "../questions";
import { computeScore, findWeakestPillar, type AnswerIndex, type Answers, type PillarScore } from "../score";

/** Builds a full 15-answer Answers record from indices (0|1|2) in canonical question order. */
function answersFrom(indices: readonly AnswerIndex[]): Answers {
  if (indices.length !== QUESTIONS.length) {
    throw new Error(`Expected ${QUESTIONS.length} answers, got ${indices.length}`);
  }
  const answers: Answers = {};
  QUESTIONS.forEach((question, i) => {
    answers[question.id] = indices[i] as AnswerIndex;
  });
  return answers;
}

const fill = (value: AnswerIndex): AnswerIndex[] => Array(QUESTIONS.length).fill(value) as AnswerIndex[];

describe("computeScore", () => {
  it("scores a perfect run (every best option, index 0 = 20pts) as 100/100, 20/20 on every pillar", () => {
    const result = computeScore(answersFrom(fill(0)));
    expect(result.total).toBe(100);
    for (const p of result.pillars) expect(p.score).toBe(20);
  });

  it("scores a zero run (every worst option, index 2 = 0pts) as 0/100, 0/20 on every pillar", () => {
    const result = computeScore(answersFrom(fill(2)));
    expect(result.total).toBe(0);
    for (const p of result.pillars) expect(p.score).toBe(0);
  });

  it("always returns pillars in canonical AARRR order", () => {
    const result = computeScore(answersFrom(fill(1)));
    expect(result.pillars.map((p) => p.pillar)).toEqual([...PILLARS]);
  });

  it("scales raw points (/60) to a pillar score (/20)", () => {
    // acquisition: 7 + 20 + 20 = 47 raw -> 47/3 = 15.67 -> rounds to 16
    const answers = answersFrom(fill(2));
    answers["acq-1"] = 1;
    answers["acq-2"] = 0;
    answers["acq-3"] = 0;
    const result = computeScore(answers);
    const acquisition = result.pillars.find((p) => p.pillar === "acquisition");
    expect(acquisition).toEqual({ pillar: "acquisition", rawPoints: 47, score: 16 });
  });

  it("rounds each pillar BEFORE summing — the total is not a recomputed average of raw points", () => {
    // Every pillar answered 7+7+0=14 raw points -> each pillar rounds to 5 (14/3 = 4.67).
    // Correct total per SPEC.md §6: sum the 5 already-rounded 5s = 25.
    // The wrong approach (sum all raw points first, then scale/round once)
    // would give round(70/300*100) = 23 instead — a different number,
    // which is exactly the bug SPEC.md §6 rules out.
    const answers = answersFrom(PILLARS.flatMap(() => [1, 1, 2] as AnswerIndex[]));
    const result = computeScore(answers);

    for (const p of result.pillars) {
      expect(p.rawPoints).toBe(14);
      expect(p.score).toBe(5);
    }
    expect(result.total).toBe(25);

    const naiveWholeRunRounding = Math.round(
      (result.pillars.reduce((sum, p) => sum + p.rawPoints, 0) / (60 * PILLARS.length)) * 100,
    );
    expect(naiveWholeRunRounding).not.toBe(result.total);
  });

  it("every pillar score is always an integer (never e.g. 07.5/20), across every reachable raw-points sum", () => {
    const pointValues = [0, 7, 20];
    for (const a of pointValues) {
      for (const b of pointValues) {
        for (const c of pointValues) {
          const raw = a + b + c;
          expect(Number.isInteger(Math.round(raw / 3))).toBe(true);
        }
      }
    }
  });

  it("throws a descriptive error when an answer is missing", () => {
    const answers = answersFrom(fill(1));
    delete answers["acq-2"];
    expect(() => computeScore(answers)).toThrow(/acq-2/);
  });

  it("throws a descriptive error when an answer index is invalid", () => {
    const answers = answersFrom(fill(0)) as Record<string, number>;
    answers["rev-3"] = 4;
    expect(() => computeScore(answers as Answers)).toThrow(/rev-3/);
  });

  it("picks the weakest pillar using the canonical AARRR tie-break", () => {
    // acquisition weakest outright
    const weak = computeScore(
      answersFrom([
        ...([2, 2, 2] as AnswerIndex[]), // acquisition: 0 raw -> 0
        ...([0, 0, 0] as AnswerIndex[]), // activation: 60 raw -> 20
        ...([0, 0, 0] as AnswerIndex[]), // retention
        ...([0, 0, 0] as AnswerIndex[]), // referral
        ...([0, 0, 0] as AnswerIndex[]), // revenue
      ]),
    );
    expect(weak.weakestPillar).toBe("acquisition");

    // activation and retention tie for lowest -> canonical order picks activation
    const tie = computeScore(
      answersFrom([
        ...([0, 0, 0] as AnswerIndex[]), // acquisition: 20
        ...([2, 2, 2] as AnswerIndex[]), // activation: 0
        ...([2, 2, 2] as AnswerIndex[]), // retention: 0 (tied with activation)
        ...([0, 0, 0] as AnswerIndex[]), // referral
        ...([0, 0, 0] as AnswerIndex[]), // revenue
      ]),
    );
    expect(tie.weakestPillar).toBe("activation");
  });
});

describe("findWeakestPillar", () => {
  const score = (pillar: PillarScore["pillar"], value: number): PillarScore => ({
    pillar,
    rawPoints: value * 3,
    score: value,
  });

  it("picks the single lowest-scoring pillar regardless of position", () => {
    const pillars = [
      score("acquisition", 15),
      score("activation", 15),
      score("retention", 5),
      score("referral", 15),
      score("revenue", 15),
    ];
    expect(findWeakestPillar(pillars)).toBe("retention");
  });

  it("on a full tie, picks the first pillar in canonical AARRR order", () => {
    const allTied = PILLARS.map((pillar) => score(pillar, 10));
    expect(findWeakestPillar(allTied)).toBe("acquisition");
  });

  it("on a partial tie, still picks the canonically-earliest of the tied pillars", () => {
    const pillars = [
      score("acquisition", 15),
      score("activation", 8),
      score("retention", 8),
      score("referral", 15),
      score("revenue", 20),
    ];
    expect(findWeakestPillar(pillars)).toBe("activation");
  });

  it("throws on an empty list rather than silently returning undefined", () => {
    expect(() => findWeakestPillar([])).toThrow();
  });
});
