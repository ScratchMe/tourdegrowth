/**
 * Pillar score bands, out of 20 (after rounding — see SPEC.md §6).
 *
 * Pure scoring logic, so it lives with the scoring engine rather than in
 * `content/copy-library.ts`, where it used to be defined next to the verdicts
 * that are indexed by it. The move matters for the bundle: `bottleneck.ts`
 * only needs the thresholds, and importing them from the copy library made
 * every route that resolves a bottleneck (the admin dashboard included) carry
 * the whole library of questions and verdicts (content-fan-in.test.ts).
 * `copy-library.ts` re-exports both names, so its readers are unchanged.
 */
export type ScoreBand = "weak" | "developing" | "strong";

export function scoreBand(score: number): ScoreBand {
  if (score <= 9) return "weak";
  if (score <= 15) return "developing";
  return "strong";
}
