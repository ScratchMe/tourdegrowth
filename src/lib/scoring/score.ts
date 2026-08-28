import { QUESTIONS } from "@/content/copy-library";
import { PILLARS, type Pillar } from "./pillars";

/**
 * Answer options and their point values now live directly on each question
 * in `content/copy-library.ts` (3 options per question, 20/7/0 points) —
 * the delivered content library from the product agent (SPEC.md §12).
 *
 * Real, signalled change from the previously-shipped engine: the original
 * build used a fixed `ANSWER_POINTS = [0, 7, 13, 20]` array with 4 options
 * per question, because SPEC.md §6's text said "4 valeurs par réponse" even
 * though the design mock only ever showed 3 buttons (documented at the
 * time as a deliberate arbitration in favor of the spec text). The
 * delivered copy-library.ts only ever has 3 options — the product agent's
 * actual final content supersedes that earlier call. Points are now read
 * per-option from the question itself rather than a separate universal
 * array, which is both more correct (no assumption that every question
 * shares one scale) and removes the now-obsolete 4-way index.
 *
 * The formula itself is unchanged: sum a pillar's 3 raw answer points, round
 * to the nearest integer, then sum the 5 already-rounded pillar scores for
 * the total (SPEC.md §6) — never a recomputed average of raw points.
 */
export type AnswerIndex = 0 | 1 | 2;

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
  return value === 0 || value === 1 || value === 2;
}

/**
 * Computes the deterministic, rule-based score for a completed
 * questionnaire. Pure function: same input always produces the same output.
 * Nothing — not Gemini, not the Deep dive — ever feeds back into this
 * (CLAUDE.md non-negotiable, reinforced by SPEC-ADDENDUM-01.md §2.1: "le
 * score chiffré ne change jamais entre Quick et Détaillé").
 *
 * Throws if any of the 15 questions is missing or has an invalid answer
 * index. That's an assertion, not a recoverable user-facing error: the
 * questionnaire UI must never call this before all 15 questions are
 * answered.
 */
export function computeScore(answers: Answers): ScoringResult {
  const pillars: PillarScore[] = PILLARS.map((pillar) => {
    const rawPoints = QUESTIONS.filter((q) => q.pillar === pillar).reduce((sum, question) => {
      const answerIndex = answers[question.id];
      if (!isAnswerIndex(answerIndex)) {
        throw new Error(`Missing or invalid answer for question "${question.id}"`);
      }
      const option = question.options[answerIndex];
      return sum + option.points;
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
