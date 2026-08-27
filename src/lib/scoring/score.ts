import { PILLARS, type Pillar } from "./pillars";
import { QUESTIONS } from "./questions";

/**
 * Fixed point scale per answer option (SPEC.md §6): index 0 = "not really",
 * … index 3 = "yes, and measured". Four options, never derived, never
 * weighted per-question — the whole point of a rule-based score is that
 * anyone can re-derive it from the 15 raw answers in a few seconds.
 *
 * Note: because 20 is not evenly divisible by 3 questions, a pillar's raw
 * points (sum of 3 answers, 0-60) scaled to /20 does not land on every
 * integer — e.g. a rounded pillar score of exactly 12 is mathematically
 * unreachable with this scale. That's expected; see score.test.ts for the
 * full reachable set. Any hard-coded sample result (SPEC.md §12 "Sample
 * result") is fixed display data, not something computeScore() has to
 * reproduce.
 */
export const ANSWER_POINTS = [0, 7, 13, 20] as const;
export type AnswerIndex = 0 | 1 | 2 | 3;

export type Answers = Record<string, AnswerIndex>;

export interface PillarScore {
  pillar: Pillar;
  /** Sum of the 3 raw answer points for this pillar, 0-60. */
  rawPoints: number;
  /** rawPoints scaled to /20 and rounded to the nearest integer — always an
   * integer per SPEC.md §6 ("jamais 07.5/20"). */
  score: number;
}

export interface ScoringResult {
  /** One entry per pillar, in canonical AARRR order. */
  pillars: PillarScore[];
  /** Sum of the already-rounded pillar scores, 0-100 — NOT a recomputed
   * average of raw points (SPEC.md §6: this is what keeps the displayed
   * total always adding up to what's shown per pillar). */
  total: number;
  /** The lowest-scoring pillar; ties broken by canonical AARRR order
   * (SPEC.md §6). */
  weakestPillar: Pillar;
}

function isAnswerIndex(value: unknown): value is AnswerIndex {
  return value === 0 || value === 1 || value === 2 || value === 3;
}

/**
 * Computes the deterministic, rule-based score for a completed
 * questionnaire. Pure function: same input always produces the same output.
 * Gemini (see CLAUDE.md) only ever comments on this result — it never feeds
 * back into it.
 *
 * Throws if any of the 15 questions is missing or has an invalid answer
 * index. That's an assertion, not a recoverable user-facing error: the
 * questionnaire UI must never call this before all 15 questions are
 * answered.
 */
export function computeScore(answers: Answers): ScoringResult {
  const pillars: PillarScore[] = PILLARS.map((pillar) => {
    const rawPoints = QUESTIONS.filter((q) => q.pillar === pillar).reduce((sum, question) => {
      const answer = answers[question.id];
      if (!isAnswerIndex(answer)) {
        throw new Error(`Missing or invalid answer for question "${question.id}"`);
      }
      return sum + ANSWER_POINTS[answer];
    }, 0);

    // Round THIS pillar to the nearest integer now, before it's summed into
    // the total below — rounding after summing would silently break the
    // "these 5 numbers add up to that total" guarantee SPEC.md §6 asks for.
    const score = Math.round(rawPoints / 3);

    return { pillar, rawPoints, score };
  });

  const total = pillars.reduce((sum, p) => sum + p.score, 0);

  return { pillars, total, weakestPillar: findWeakestPillar(pillars) };
}

/**
 * The lowest-scoring pillar. On a tie, the pillar that appears first in
 * canonical AARRR order wins — simple, deterministic, per SPEC.md §6.
 */
export function findWeakestPillar(pillars: readonly PillarScore[]): Pillar {
  const [first, ...rest] = pillars;
  if (!first) {
    throw new Error("findWeakestPillar requires at least one pillar score");
  }
  return rest.reduce((weakest, candidate) => (candidate.score < weakest.score ? candidate : weakest), first)
    .pillar;
}
