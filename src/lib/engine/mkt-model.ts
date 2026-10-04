import { div, mapBounds, mul, point, scale } from "./interval";
import { afterPayback, lossCheck, type LossCheck } from "./money";
import { keptPercentOfChurn, pathFromNextMonth } from "./stream";
import { addBoth, sumPaths } from "./total";
import type { Interval } from "./types";
import { lifetimeMonths } from "./unit-economics";

/**
 * mkt-model.ts — the money of a marketplace (engine spec §22, A23; Antoine's
 * answers C64, C66 to C70 and C93 of 2026-10-04).
 *
 * A marketplace has two sides, and each earns in its own way:
 *
 * - the demand: the buyers' orders × the take rate. What one active buyer
 *   brings a month is a = frequency × basket × take rate ÷ 100; the net
 *   revenue is kept at 1 − the buyers' churn each month, and each month's new
 *   buyers × a come on top (C66). A take rate, a basket or a frequency moved
 *   by a what-if applies to every buyer from the next month (C69);
 * - the supply: the sellers' subscriptions (C64, C93), a self-serve MRR of
 *   its own — kept at 1 − the paid sellers' churn, each month's new paid
 *   sellers (the month's seller sign-ups × the paid conversion) × what a
 *   paid seller pays on top.
 *
 * Each side has its own margin (C93), its own unit economics — a buyer's
 * cost against what a buyer brings, a paid seller's cost against what a
 * paid seller brings — and its own diagnosis (C70). The total is the two
 * streams added, like the hybrid's, and only when both are known (S9). A
 * marketplace whose sellers pay nothing has the demand alone.
 *
 * The supply's other stages (the first sale, the active sellers' churn) are
 * never priced by the commissions — no seller-to-order elasticity is assumed
 * (C67): they are named, without an amount.
 *
 * Nothing here reads the state: every function takes plain intervals.
 */

/** a, what one active buyer brings a month: frequency × basket × take rate ÷ 100. null when one is unknown. */
export function revenuePerBuyer(frequency: Interval | null, basket: Interval | null, takeRatePercent: Interval | null): Interval | null {
  return frequency && basket && takeRatePercent ? mul(mul(frequency, basket), scale(takeRatePercent, 1 / 100)) : null;
}

/**
 * The demand's net revenue month by month, 13 points: `[0]` = today's; kept
 * at 1 − the buyers' churn, the new buyers' revenue on top. `moneyRatio`
 * (a what-if's take rate, basket or frequency over today's, by
 * `correlatedRatio`) applies to the whole base from the next month (C69);
 * pass the new buyers' revenue at the projected a too.
 */
export function demandPath(
  today: Interval | null,
  newRevenue: Interval | null,
  buyerChurn: Interval | null,
  moneyRatio: Interval = point(1),
): Interval[] | null {
  if (!today || !buyerChurn) return null;
  return pathFromNextMonth(today, mul(today, moneyRatio), newRevenue, keptPercentOfChurn(buyerChurn));
}

/** New paid sellers a month: the month's seller sign-ups × the paid conversion ÷ 100. */
export function newPaidSellersPerMonth(sellerSignups: Interval | null, paidConversionPercent: Interval | null): Interval | null {
  return sellerSignups && paidConversionPercent ? mul(sellerSignups, scale(paidConversionPercent, 1 / 100)) : null;
}

/**
 * The sellers' subscriptions month by month, 13 points: `[0]` = today's
 * MRR; kept at 1 − the paid sellers' churn, the new paid sellers × what one
 * pays on top. `priceRatio` (a what-if's price over today's) applies to every
 * paid seller from the next month, like the demand's money levers; pass the
 * new paid sellers' MRR at the projected price too.
 */
export function sellerPath(
  mrrToday: Interval | null,
  newMrr: Interval | null,
  paidChurn: Interval | null,
  priceRatio: Interval = point(1),
): Interval[] | null {
  if (!mrrToday || !paidChurn) return null;
  return pathFromNextMonth(mrrToday, mul(mrrToday, priceRatio), newMrr, keptPercentOfChurn(paidChurn));
}

/**
 * The marketplace's revenue month by month: the commissions and the
 * sellers' subscriptions added point by point, when the sellers pay one;
 * the commissions alone when they don't. null when a counted stream is
 * unknown — never one passed off as the whole (S9).
 */
export function marketplaceRevenuePath(sellerSubscriptions: boolean, demand: Interval[] | null, supply: Interval[] | null): Interval[] | null {
  return sellerSubscriptions ? sumPaths(demand, supply) : demand;
}

/** The month's revenue, the same rule. */
export function marketplaceRevenueToday(sellerSubscriptions: boolean, netRevenue: Interval | null, sellerMrr: Interval | null): Interval | null {
  return sellerSubscriptions ? addBoth(netRevenue, sellerMrr) : netRevenue;
}

/**
 * What a paid seller costs: a new active seller's cost × the first sale ÷
 * the paid conversion, the two on the same seller cohort. « An active seller
 * costs 100 €; of 100 sign-ups, 30 sell and 15 subscribe: a subscriber costs
 * 100 × 30/15 = 200 €. » null when the conversion can be 0.
 */
export function paidSellerCac(activeSellerCac: Interval | null, firstSalePercent: Interval | null, paidConversionPercent: Interval | null): Interval | null {
  if (!activeSellerCac || !firstSalePercent || !paidConversionPercent) return null;
  const perSignup = mul(activeSellerCac, firstSalePercent);
  return div(perSignup, paidConversionPercent);
}

/** One side's unit economics: a buyer, or a paid seller. Each figure null when an input is unknown. */
export interface SideEconomics {
  /** What one brings back a month: revenue a month × margin ÷ 100. */
  monthlyMargin: Interval | null;
  /** Months counted: 1 ÷ monthly churn, capped at 36 (`lifetimeMonths`). */
  lifetime: Interval | null;
  ltv: Interval | null;
  /** Months to pay the cost back: cost ÷ the monthly margin, floored at 0. */
  payback: Interval | null;
  ltvCac: Interval | null;
  loss: LossCheck | null;
  afterPayback: Interval | null;
}

/**
 * The self-serve formulas, with the side's own revenue a month (a for a
 * buyer, the subscription for a paid seller), its own margin (C93), its own
 * churn and its own cost.
 */
export function sideEconomics(revenuePerMonth: Interval | null, marginPercent: Interval | null, churnPercent: Interval | null, cac: Interval | null): SideEconomics {
  const monthlyMargin = revenuePerMonth && marginPercent ? mul(revenuePerMonth, scale(marginPercent, 1 / 100)) : null;
  const lifetime = churnPercent ? lifetimeMonths(churnPercent) : null;
  const ltv = monthlyMargin && lifetime ? mul(monthlyMargin, lifetime) : null;
  const quotient = cac && monthlyMargin ? div(cac, monthlyMargin) : null;
  const payback = quotient ? mapBounds(quotient, (v) => Math.max(0, v)) : null;
  return {
    monthlyMargin,
    lifetime,
    ltv,
    payback,
    ltvCac: ltv && cac ? div(ltv, cac) : null,
    loss: lossCheck(ltv, cac),
    afterPayback: afterPayback(lifetime, payback),
  };
}
