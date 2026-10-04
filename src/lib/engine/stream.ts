import { mapBounds, mul } from "./interval";
import type { Interval } from "./types";

/**
 * stream.ts — a recurring revenue stream, whatever its unit (engine spec
 * §21 and §22, A22 and A23).
 *
 * The SaaS has one stream, the MRR: a base kept at the NRR each month, and
 * each month's new MRR on top (`scenario.ts#mrrPath`). The consumer app adds
 * a second one, its actives × what one active brings; the marketplace has its
 * buyers × what one buyer brings, and its paid sellers × their subscription.
 * All of them are the same loop and are priced by the same two rules, so
 * they live here once, and `app-model.ts` and `mkt-model.ts` only say which
 * numbers feed them.
 *
 * Pure, in intervals like the rest of the engine; `null` is « unknown »,
 * never 0.
 */

const floorAtZero = (i: Interval): Interval => mapBounds(i, (v) => Math.max(0, v));

/**
 * A stream month by month, 13 points: `[0]` is `today`, then twelve months
 * of « t ← t × kept ÷ 100 + newPerMonth », starting from `start`. `start` is
 * `today` when nothing changes; a lever that applies to the whole base from
 * the next month (a price, a revenue per active) passes today × its ratio.
 * Each bound from the bounds that push it the same way, like `mrrPath`: with
 * `start === today`, the two are the same curve (tested).
 */
export function pathFromNextMonth(
  today: Interval | null,
  start: Interval | null,
  newPerMonth: Interval | null,
  keptPercent: Interval | null,
): Interval[] | null {
  if (!today || !start || !newPerMonth || !keptPercent) return null;
  const twelve = (from: number, add: number, kept: number): number[] => {
    const path: number[] = [];
    let total = from;
    for (let m = 0; m < 12; m++) {
      total = total * (kept / 100) + add;
      path.push(total);
    }
    return path;
  };
  const lo = twelve(start.lo, newPerMonth.lo, keptPercent.lo);
  const hi = twelve(start.hi, newPerMonth.hi, keptPercent.hi);
  return [today, ...lo.map((v, m) => ({ lo: v, hi: hi[m]! }))];
}

/** The share kept each month when `churnPercent` leaves: 100 − churn, the bounds swapped. */
export function keptPercentOfChurn(churnPercent: Interval): Interval {
  return { lo: 100 - churnPercent.hi, hi: 100 - churnPercent.lo };
}

/**
 * The relative gap of a rate to its target, t/r − 1, floored at 0: a target
 * the rate already meets is worth nothing, never a loss. null when the rate
 * can be 0 (no « × t/r »). The same rule as `impact.ts#rankingImpact`.
 */
export function relativeGap(rate: Interval, target: number): Interval | null {
  if (rate.lo <= 0) return null;
  return floorAtZero({ lo: target / rate.hi - 1, hi: target / rate.lo - 1 });
}

/** What a flow's gap is worth a month: the new units a month × the gap × what one unit brings. */
export function flowGain(newPerMonth: Interval, gap: Interval, perUnit: Interval): Interval {
  return mul(mul(newPerMonth, gap), perUnit);
}

/**
 * What closing a retention gap keeps a month: the base × the gap in points ÷
 * 100 × what one unit brings, floored at 0. `lower`: a churn (« from 7 % to
 * 5 % »); `higher`: a retention (« from 90 % to 92 % »). The churn's rule is
 * `impact.ts#rankingImpact`'s.
 */
export function keptGain(base: Interval, today: Interval, target: number, perUnit: Interval, direction: "lower" | "higher"): Interval {
  const points = direction === "lower" ? { lo: today.lo - target, hi: today.hi - target } : { lo: target - today.hi, hi: target - today.lo };
  return mul(floorAtZero(mul(base, { lo: points.lo / 100, hi: points.hi / 100 })), perUnit);
}
