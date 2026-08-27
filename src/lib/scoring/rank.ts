import type { Pillar } from "./pillars";

/** The minimum shape needed to rank — accepts the full `PillarScore` (score.ts) or the lighter `{pillar,score}` shape used for display-only data (ScoreCard, sample.ts). */
export interface Ranked {
  pillar: Pillar;
  score: number;
}

/**
 * Pillars sorted lowest-score-first. A stable sort on an array that starts
 * in canonical AARRR order means tied scores keep their canonical relative
 * order — so `rankPillarsAscending(p)[0]` always agrees with
 * `findWeakestPillar(p)` (see score.ts), and the same tie-break extends
 * naturally to "the 2 weakest" / "the 2 strongest" for the result page's
 * Strengths / Where you're losing time sections (DESIGN-BRIEF.md §02).
 */
export function rankPillarsAscending<T extends Ranked>(pillars: readonly T[]): T[] {
  return [...pillars].sort((a, b) => a.score - b.score);
}
