import { unstable_cache } from "next/cache";
import { getGlobalStats, getSegmentStats } from "./repository";
import { segmentId, type SegmentAnswers } from "./segment";

/**
 * "Average of every Tour: 58/100" on the result page — REVIEW.md R-20.
 *
 * Two guards, both deliberate:
 *
 *  - **A minimum sample.** The aggregate counter starts from the day it
 *    ships, so on day one an "average" would be one or two people. Below the
 *    threshold nothing is shown at all — a benchmark that isn't one is worse
 *    than no benchmark, on a screen whose whole promise is a score you can
 *    re-explain in ten seconds (CLAUDE.md).
 *  - **A cache.** This value moves by fractions of a point per submission,
 *    and the result page is the most-viewed page of a shared link. Reading
 *    the aggregate on every view would give back the read reduction R-14 was
 *    for. One read an hour is plenty for a number that changes this slowly.
 */
const MIN_SUBMISSIONS_FOR_BENCHMARK = 30;
const ONE_HOUR_SECONDS = 3600;

async function computeBenchmark(): Promise<number | null> {
  const stats = await getGlobalStats();
  if (!stats || stats.count < MIN_SUBMISSIONS_FOR_BENCHMARK) return null;
  return Math.round(stats.scoreSum / stats.count);
}

/**
 * The rounded average, or `null` when there isn't enough data — or when
 * Firestore is unreachable. A benchmark is a nice-to-have next to someone's
 * actual result: it must never be the reason their result page fails.
 */
export function getBenchmarkAverage(): Promise<number | null> {
  return unstable_cache(
    async () => {
      try {
        return await computeBenchmark();
      } catch (err) {
        console.error("benchmark unavailable (the result page renders without it):", err);
        return null;
      }
    },
    ["benchmark-average"],
    { revalidate: ONE_HOUR_SECONDS },
  )();
}

export const BENCHMARK_MIN_SUBMISSIONS = MIN_SUBMISSIONS_FOR_BENCHMARK;

/**
 * The benchmark a given submission should be shown — REVIEW-02.md R2-26.
 *
 * A cascade, not a switch: the segment average when that segment has reached
 * the same minimum sample, otherwise the global one, otherwise nothing.
 * Twelve segments split the same traffic twelve ways, so for a long while
 * most of them will not qualify — falling back rather than hiding keeps the
 * line on the page while the data catches up.
 *
 * `scope` is what the copy branches on; the caller builds the segment's
 * label from `content/segments.ts`, since that needs a locale and this
 * does not.
 */
export interface Benchmark {
  score: number;
  scope: "segment" | "global";
}

async function computeSegmentBenchmark(segment: string): Promise<number | null> {
  const stats = await getSegmentStats(segment);
  if (!stats || stats.count < MIN_SUBMISSIONS_FOR_BENCHMARK) return null;
  return Math.round(stats.scoreSum / stats.count);
}

export async function getBenchmarkFor(segment: SegmentAnswers | null): Promise<Benchmark | null> {
  const id = segmentId(segment);
  if (id) {
    const scoped = await unstable_cache(
      async () => {
        try {
          return await computeSegmentBenchmark(id);
        } catch (err) {
          console.error("segment benchmark unavailable (falling back to the global average):", err);
          return null;
        }
      },
      ["benchmark-segment", id],
      { revalidate: ONE_HOUR_SECONDS },
    )();
    if (scoped !== null) return { score: scoped, scope: "segment" };
  }

  const global = await getBenchmarkAverage();
  return global === null ? null : { score: global, scope: "global" };
}
