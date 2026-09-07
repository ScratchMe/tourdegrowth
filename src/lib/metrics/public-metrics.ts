import { unstable_cache } from "next/cache";
import { computeGrowthStats, type GrowthStats, type ScoreBandId } from "@/lib/submissions/growth-stats";

/**
 * The public metrics page — REVIEW-02.md R2-28. SPEC.md §1 says the project
 * exists to "démontrer par la preuve plutôt que par la description"; the most
 * direct proof is the tool's own AARRR, in the open.
 *
 * Two gates, deliberately separate, because they answer different questions.
 *
 *  - `isPublicMetricsEnabled()` — SHOULD this page exist at all? Antoine's
 *    call (2026-09-07): build it, keep it closed until the numbers are worth
 *    reading. Read per request (the page is dynamic), so flipping the Vercel
 *    env var opens or closes it without a deploy.
 *  - `MIN_SUBMISSIONS_TO_PUBLISH` — are the numbers meaningful YET? Below it
 *    the page still renders, and says plainly that it is too early. A ratio
 *    computed over nine Tours is noise presented as fact, and publishing it
 *    would cost exactly the credibility the page is meant to earn.
 */
export function isPublicMetricsEnabled(): boolean {
  return process.env.METRICS_PAGE_ENABLED === "true";
}

/** Below this many Tours, the page shows its own emptiness rather than ratios nobody should trust. */
export const MIN_SUBMISSIONS_TO_PUBLISH = 50;

export interface PublicMetrics {
  /** Whether there is enough data for the figures below to mean anything. */
  meaningful: boolean;
  tours: number;
  toursLast30Days: number;
  averageScore: number;
  scoreBands: Record<ScoreBandId, number>;
  deepDiveRate: number;
  /** REVIEW-02.md R2-01's definition: referred Tours ÷ all Tours. */
  kFactor: number;
  referredTours: number;
}

/**
 * What is fit to publish, out of everything the dashboard knows. Pure, so the
 * floor and the rounding are testable; and an allow-list rather than a
 * pass-through, so a field added to `GrowthStats` for the private dashboard
 * never becomes public by accident.
 *
 * Nothing here is per-person: every figure is a count or a ratio over the
 * whole collection. The locale and tone splits the dashboard shows are left
 * out — not because they are sensitive, but because they say nothing about
 * whether the product works, and a metrics page earns trust by being short.
 */
export function toPublicMetrics(stats: GrowthStats): PublicMetrics {
  return {
    meaningful: stats.totalSubmissions >= MIN_SUBMISSIONS_TO_PUBLISH,
    tours: stats.totalSubmissions,
    toursLast30Days: stats.last30Days,
    averageScore: Math.round(stats.averageScore),
    scoreBands: stats.scoreBands,
    deepDiveRate: stats.deepDiveCompletionRate,
    kFactor: stats.kFactor,
    referredTours: stats.referredSubmissions,
  };
}

/**
 * One Firestore scan per hour at most, whatever the traffic — the same
 * discipline R-14 put on result pages, and it matters more here: this read is
 * the WHOLE collection, not one document. The page itself is rendered per
 * request (it must read the env flag), so without this cache a link doing
 * numbers on social media would scan the collection once per visitor.
 */
export const getPublicMetrics = unstable_cache(
  async (): Promise<PublicMetrics> => toPublicMetrics(await computeGrowthStats()),
  ["public-metrics"],
  { revalidate: 3600, tags: ["public-metrics"] },
);
