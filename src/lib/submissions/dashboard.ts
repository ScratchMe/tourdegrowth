import { fetchFunnelStats, type FunnelWindow } from "@/lib/analytics/goatcounter-api";
import { computeGrowthStats, type GrowthStats } from "@/lib/submissions/growth-stats";

/**
 * Everything the growth dashboard shows, in one object — read by the HTML
 * page (`/admin/stats`) and by its JSON twin (`/admin/stats/json`), so the
 * two cannot compute a number differently.
 *
 * The JSON twin exists for one reader: `.github/workflows/stats.yml`, which
 * fetches it with the dashboard password kept in a GitHub secret and
 * encrypts it to a one-run key, so a Claude Code session can read the
 * dashboard without the password ever entering the conversation and
 * without the numbers ever appearing in clear in a public workflow log.
 */
export interface DashboardData {
  generatedAt: string;
  growth: GrowthStats;
  funnel: FunnelWindow[];
  /**
   * Conversion per share — REVIEW-02.md R2-01. Firestore knows who was
   * referred; only GoatCounter knows how many times a result was shared. The
   * all-time window is the one whose share count matches an all-time
   * referral count; null when GoatCounter is unavailable or nothing was
   * shared yet.
   */
  conversionPerShare: number | null;
}

export function conversionPerShare(growth: Pick<GrowthStats, "referredSubmissions">, funnel: FunnelWindow[]): number | null {
  const allTimeShares = funnel.find((w) => w.label === "All-time")?.stats?.shares ?? null;
  return allTimeShares !== null && allTimeShares > 0 ? growth.referredSubmissions / allTimeShares : null;
}

export async function loadDashboard(now: Date = new Date()): Promise<DashboardData> {
  const [growth, funnel] = await Promise.all([computeGrowthStats(), fetchFunnelStats()]);
  return { generatedAt: now.toISOString(), growth, funnel, conversionPerShare: conversionPerShare(growth, funnel) };
}
