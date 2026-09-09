import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/content/copy-library";
import { LEVEL_MOVE, NEXT_MOVES } from "@/content/next-moves";
import { computeScore, type Answers, type AnswerIndex } from "../score";
import { resolveNextMove } from "../next-move";
import { PILLARS } from "../pillars";

/** The index of the option worth `points` on that question — never assumed positional. */
function optionIndex(questionId: string, points: number): AnswerIndex {
  const question = QUESTIONS.find((q) => q.id === questionId)!;
  return question.options.findIndex((o) => o.points === points) as AnswerIndex;
}

/** Every question at `points`, then whatever `overrides` says. */
function answersWith(points: number, overrides: Record<string, number> = {}): Answers {
  const answers = {} as Answers;
  for (const q of QUESTIONS) {
    answers[q.id] = optionIndex(q.id, overrides[q.id] ?? points);
  }
  return answers;
}

describe("resolveNextMove (REVIEW-03.md A2)", () => {
  it("answers the first unmet question of the bottleneck pillar, not just its name", () => {
    // Retention is the bottleneck; its first question is already at full
    // marks, so the action must address the SECOND, not restate the first.
    const answers = answersWith(20, { "ret-1": 20, "ret-2": 0, "ret-3": 0 });
    const { pillars } = computeScore(answers);

    expect(resolveNextMove("en", pillars, "retention", answers)).toBe(NEXT_MOVES["ret-2"]![0].en);
  });

  it("gives a different action for a partial answer than for none at all", () => {
    // Both are "Acquisition is your bottleneck". They are not the same move:
    // one has no channel, the other has one and doesn't measure it.
    const none = answersWith(20, { "acq-1": 0, "acq-2": 0, "acq-3": 0 });
    const partial = answersWith(20, { "acq-1": 7, "acq-2": 7, "acq-3": 7 });

    const noneMove = resolveNextMove("en", computeScore(none).pillars, "acquisition", none);
    const partialMove = resolveNextMove("en", computeScore(partial).pillars, "acquisition", partial);

    expect(noneMove).toBe(NEXT_MOVES["acq-1"]![0].en);
    expect(partialMove).toBe(NEXT_MOVES["acq-1"]![7].en);
    expect(noneMove).not.toBe(partialMove);
  });

  it("names no bottleneck when every stage is strong", () => {
    const answers = answersWith(20);
    const { pillars, weakestPillar } = computeScore(answers);

    expect(resolveNextMove("en", pillars, weakestPillar, answers)).toBe(LEVEL_MOVE.en);
  });

  it("still stands down when the weakest pillar is strong but not perfect", () => {
    // 20/20/7 rounds to 16 — the strong band, with a real gap inside it.
    // There is still no bottleneck to name, because nothing is behind.
    const answers = answersWith(20, { "ret-3": 7 });
    const { pillars, weakestPillar } = computeScore(answers);

    expect(weakestPillar).toBe("retention");
    expect(resolveNextMove("en", pillars, weakestPillar, answers)).toBe(LEVEL_MOVE.en);
  });

  it("resolves in the reader's language, not the author's", () => {
    // The same lesson as R-09: a shared result renders in the language of
    // whoever opens it.
    const answers = answersWith(20, { "rev-1": 0 });
    const { pillars } = computeScore(answers);

    expect(resolveNextMove("fr", pillars, "revenue", answers)).toBe(NEXT_MOVES["rev-1"]![0].fr);
    expect(resolveNextMove("en", pillars, "revenue", answers)).toBe(NEXT_MOVES["rev-1"]![0].en);
  });

  it("returns a real sentence for every pillar and every answer, never an empty string", () => {
    // The exhaustive sweep: whatever the bottleneck and whatever was
    // answered, something readable comes out.
    for (const pillar of PILLARS) {
      for (const points of [0, 7]) {
        const overrides: Record<string, number> = {};
        for (const q of QUESTIONS) if (q.pillar === pillar) overrides[q.id] = points;
        const answers = answersWith(20, overrides);
        const move = resolveNextMove("en", computeScore(answers).pillars, pillar, answers);
        expect(move.length, `${pillar}/${points}`).toBeGreaterThan(30);
      }
    }
  });

  it("falls back rather than throwing when an answer is missing", () => {
    // Defensive: a partial record should never 500 a result page someone
    // has just waited for.
    const answers = answersWith(20, { "ret-1": 0 });
    delete answers["ret-1"];
    const { pillars } = computeScore(answersWith(20, { "ret-1": 0 }));

    expect(() => resolveNextMove("en", pillars, "retention", answers)).not.toThrow();
  });
});
