import type { Pillar } from "@/lib/scoring/pillars";

/**
 * The sample's fixed numbers, and nothing else — `sample.ts` says why they
 * are fixed (SPEC.md §12) and builds the verdicts from them.
 *
 * On their own so a route that only needs the total (the README badge,
 * CHANTIERS.md A3.1) does not pull the verdict library and the action
 * library into its function: `content-fan-in.test.ts` counts every route
 * that reaches them (2026-09-29).
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
