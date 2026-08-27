import type { Pillar } from "./pillars";

/**
 * The landing page's "Sample B2B SaaS" score card and the full
 * `/r/sample` result page ("See a sample result") both show this exact,
 * fixed data — never computeScore() output.
 *
 * Per SPEC.md §12: "un résultat fixe codé en dur, jamais recalculé, toujours
 * étiqueté visuellement comme échantillon". It also happens to be the
 * worked example from SPEC.md §6 (18+12+8+16+20 = 74), which is why some of
 * these per-pillar values (8, 12) aren't reachable via computeScore() — see
 * the note in score.ts. That's expected: this is display data, not a real
 * questionnaire result.
 */
export const SAMPLE_RESULT: {
  total: number;
  pillars: { pillar: Pillar; score: number }[];
  weakestPillar: Pillar;
} = {
  total: 74,
  pillars: [
    { pillar: "acquisition", score: 18 },
    { pillar: "activation", score: 12 },
    { pillar: "retention", score: 8 },
    { pillar: "referral", score: 16 },
    { pillar: "revenue", score: 20 },
  ],
  weakestPillar: "retention",
};
