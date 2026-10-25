import { REFERRAL_CANDIDATES, isPricedAt } from "./catalog-shape";
import {
  formatApproxMoneyInterval,
  formatCountInterval,
  formatInterval,
  roundDisplay,
  roundMoney,
  type UnitWords,
} from "./format";
import { referralGain, twelveMonthFactor } from "./impact";
import { mapBounds, mul, point } from "./interval";
import { mktActiveBuyersStart, mktNewBuyersPerMonth, mktNewPaidSellers, mktPaidSellersStart, mktRevenuePerBuyer } from "./mkt-economics";
import { buildMktFunnel } from "./mkt-funnel";
import { mktSetup } from "./setup-type";
import { flowGain, keptGain, relativeGap } from "./stream";
import type { EngineCalcContext, EngineState, Impact, ImpactLine, Interval, MetricId, MktCandidateId, MktSide, MktSupplyCandidateId } from "./types";
import { knownIn } from "./values";

/**
 * mkt-impact.ts — what closing one gap is worth to a marketplace's side (engine spec §22.5.5, A23 MKT-4; Antoine's
 * answers C64, C67, C68 and C93 of 2026-10-04).
 *
 * The two functions of `impact.ts` (`rankingImpact` for the exact, unrounded value `diagnose` ranks with; `whatIf` for
 * the displayed chain a reader recomputes), once for each side, on the side's own N, price and base (C70, §18.6.1's
 * rule: no function here sees the candidates of both sides):
 *
 * - the demand: the new buyers a month N, what one active buyer brings a (frequency × basket × take rate), the active
 *   buyers on the 1st; its churn is priced on that base. The second order is never priced (D4);
 * - the supply, priced by the sellers' subscriptions only (C67): the new paid sellers NS, the subscription's price, the
 *   paid sellers on the 1st. Converting one more seller and keeping a paid one are priced; the first sale, the active
 *   sellers' churn and the sellers' sign-up rate are named, without an amount.
 *
 * A step of the chain reads « all else being equal » exactly as the SaaS's does, and its lines are the SaaS's own
 * (`today`, `if`, `then`, `times`, `annual`, `less-than-one`): each side's overlay rewrites the words, not the shape.
 */

/**
 * The supply's candidates the sellers' subscriptions price (C67, D4) — the one list that says which of them has an amount.
 * It is priced as a flow (`NS × gap × price`) or, for the paid churn, on the paid sellers kept.
 */
export const SUPPLY_PRICED: readonly MktSupplyCandidateId[] = ["mkt.sell.paid-conversion", "mkt.sell.paid-churn"];

/** The supply's candidates priced on a base, not on a flow: the paid sellers' churn (the demand's is `mkt.buy.churn`). */
const PAID_CHURN: MktCandidateId = "mkt.sell.paid-churn";

/** The cohort rates: a small cohort shows them in whole percents. The month's flows (sign-up rates, the fill rate, the referred share, churns) are not a cohort. */
const COHORT_RATES: readonly MktCandidateId[] = ["mkt.buy.first-order", "mkt.buy.repeat", "mkt.sell.first-sale", "mkt.sell.paid-conversion"];

/** The side a candidate belongs to: every supply candidate is a `mkt.sell.*` number. */
function sideOf(candidate: MktCandidateId): MktSide {
  return candidate.startsWith("mkt.sell.") ? "supply" : "demand";
}

function knownValue(state: EngineState, id: MetricId, ctx: EngineCalcContext): Interval | null {
  const known = knownIn(state, id, ctx);
  return known.kind === "known" ? known.value : null;
}

const floorAtZero = (i: Interval): Interval => mapBounds(i, (v) => Math.max(0, v));

/**
 * Whether a side's candidate has an amount at this target: priced by `isPricedAt` (the unpriced list, the referred
 * share's ceiling), and for the supply listed in `SUPPLY_PRICED` and with sellers who pay a subscription (their numbers
 * stay stored and read as nothing otherwise, D9).
 */
function isPricedHere(state: EngineState, candidate: MktCandidateId, target: number): boolean {
  if (!isPricedAt(candidate, target)) return false;
  if (sideOf(candidate) === "demand") return true;
  return mktSetup(state.setup).sellerSubscriptions && SUPPLY_PRICED.includes(candidate as MktSupplyCandidateId);
}

/** What a side's new unit brings a month, its new units a month, and the units on its books on the 1st: the three that price a gap. */
function sideFigures(state: EngineState, side: MktSide, ctx: EngineCalcContext): { perUnit: Interval | null; newUnits: Interval | null; base: number | null; churnId: MetricId } {
  return side === "demand"
    ? { perUnit: mktRevenuePerBuyer(state, ctx), newUnits: mktNewBuyersPerMonth(state, ctx), base: mktActiveBuyersStart(state), churnId: "mkt.buy.churn" }
    : { perUnit: knownValue(state, "mkt.sell.arpa", ctx), newUnits: mktNewPaidSellers(state, ctx), base: mktPaidSellersStart(state), churnId: PAID_CHURN };
}

/**
 * The exact value `diagnose` ranks a candidate with, against target `t` (the copy of `impact.ts#rankingImpact`).
 * `gap` = t/r − 1 for a flow (or the referred share's gain), `mrr` = the money per month when the side's N (or its base)
 * and its price are known — net revenue for the demand, the subscriptions' MRR for the supply. Floored at 0, never a loss.
 * The field is called `mrr` because `MotionRules.price` says so.
 */
export function mktRankingImpact(state: EngineState, candidate: MktCandidateId, target: number, ctx: EngineCalcContext): { gap?: Interval; mrr?: Interval } {
  const r = knownValue(state, candidate, ctx);
  if (!r || !isPricedHere(state, candidate, target)) return {};
  const { perUnit, newUnits, base, churnId } = sideFigures(state, sideOf(candidate), ctx);

  if (candidate === churnId) {
    if (base === null || !perUnit) return {};
    return { mrr: keptGain(point(base), r, target, perUnit, "lower") };
  }

  // A share at 0 has a gain (the referred all come on top); a rate at 0 has no « × t/r ».
  const referral = REFERRAL_CANDIDATES.includes(candidate);
  const gap = referral ? referralGain(r, target) : relativeGap(r, target);
  if (!gap) return {};
  return newUnits && perUnit ? { gap, mrr: flowGain(newUnits, gap, perUnit) } : { gap };
}

/**
 * The displayed "what if" chain for one side's candidate and one target (the copy of `impact.ts#whatIf`): the same
 * function for the drawer's slider and the leak slide, built from the numbers the reader sees, each line recomputed from
 * the one above. `null` when nothing can be priced — an unpriced candidate, an unknown value, a target that is no
 * improvement, or no monthly volume to count on (a marketplace has no per-100 chain: its words are the SaaS's, and a
 * funnel on 100 sign-ups says no gain in euros).
 *
 * Churn counts the customers it keeps (`today` `{ churn, base }`, `if`, `then` `{ base, churn, target, n }`, `times`,
 * `annual`); a flow counts the new units a month (`today` `{ rate, n }`, `then` `{ n, target, rate, m, delta }`). The
 * `if` line carries `{target}` only; the stage's name and the target's wording are copy the consumer adds.
 */
export function mktWhatIf(state: EngineState, candidate: MktCandidateId, target: number, ctx: EngineCalcContext, words: UnitWords): Impact | null {
  if (!isPricedHere(state, candidate, target)) return null;
  const r = knownValue(state, candidate, ctx);
  if (!r) return null;

  const side = sideOf(candidate);
  const { perUnit, newUnits, base, churnId } = sideFigures(state, side, ctx);
  const referral = REFERRAL_CANDIDATES.includes(candidate);
  // A small COHORT shows whole percents (the side's own, §22.5.2); the month's flows aren't a cohort.
  const noDecimals = COHORT_RATES.includes(candidate) && buildMktFunnel(state, ctx)[side].smallCohort;
  const pct = (i: Interval) => formatInterval(i, "percent", ctx, words, { noDecimals });
  const bare = (i: Interval) => formatInterval(i, "ratio", ctx, words); // a displayed rate without its sign, for "25/20"
  const currency = state.setup.currency;

  const rD = mapBounds(r, (v) => roundDisplay(v, { noDecimals }));
  const tD = roundDisplay(target, { noDecimals });
  const perUnitD = perUnit ? mapBounds(perUnit, roundMoney) : null;
  const churn = knownValue(state, churnId, ctx);

  const lines: ImpactLine[] = [];
  const priced = (units: Interval, decayChurnPercent: number | null): Pick<Impact, "mrrPerMonth" | "mrrAfter12Months"> => {
    if (units.hi < 1) {
      lines.push({ key: "less-than-one", values: {} });
      return {};
    }
    if (!perUnitD) return {};
    const amount = mul(units, perUnitD);
    lines.push({
      key: "times",
      values: { arpa: formatInterval(perUnitD, "money", ctx, words, { currency }), amount: formatApproxMoneyInterval(amount, currency, ctx, words) },
    });
    if (decayChurnPercent === null) return { mrrPerMonth: amount };
    // Decay with the churn that applies AFTER the change: today's for a flow, the target for churn itself.
    const annual = { lo: amount.lo * twelveMonthFactor(decayChurnPercent), hi: amount.hi * twelveMonthFactor(decayChurnPercent) };
    lines.push({ key: "annual", values: { amount: formatApproxMoneyInterval(annual, currency, ctx, words) } });
    return { mrrPerMonth: amount, mrrAfter12Months: annual };
  };

  if (candidate === churnId) {
    if (base === null || !(tD < rD.hi) || tD < 0) return null;
    const kept = mapBounds(floorAtZero({ lo: (base * (rD.lo - tD)) / 100, hi: (base * (rD.hi - tD)) / 100 }), Math.round);
    lines.push(
      { key: "today", values: { churn: pct(rD), base: formatCountInterval(point(base), ctx, words) } },
      { key: "if", values: { target: pct(point(tD)) } },
      {
        key: "then",
        values: { base: formatCountInterval(point(base), ctx, words), churn: pct(rD), target: pct(point(tD)), n: formatCountInterval(kept, ctx, words) },
        count: kept,
      },
    );
    const money = priced(kept, tD);
    return {
      metric: candidate,
      kind: perUnitD ? "retained-mrr" : "customers",
      from: r,
      to: target,
      customersPerMonth: kept,
      ...money,
      lines,
    };
  }

  if (!(rD.lo > 0 || referral) || !(tD > rD.lo) || !newUnits) return null;
  const nD = mapBounds(newUnits, Math.round);
  // What the volume becomes at the target, per bound from the displayed numbers: the fewest with the highest rate, the most with the lowest.
  const mD: Interval = referral
    ? { lo: Math.round((nD.lo * (100 - rD.hi)) / (100 - tD)), hi: Math.round((nD.hi * (100 - rD.lo)) / (100 - tD)) }
    : { lo: Math.round((nD.lo * tD) / rD.hi), hi: Math.round((nD.hi * tD) / rD.lo) };
  const delta = floorAtZero({ lo: mD.lo - nD.lo, hi: mD.hi - nD.hi });
  lines.push(
    { key: "today", values: { rate: pct(rD), n: formatCountInterval(nD, ctx, words) }, count: nD },
    { key: "if", values: { target: pct(point(tD)) } },
    {
      key: "then",
      values: {
        n: formatCountInterval(nD, ctx, words),
        target: bare(point(tD)),
        rate: bare(rD),
        m: formatCountInterval(mD, ctx, words),
        delta: formatCountInterval(delta, ctx, words),
      },
      count: delta,
    },
  );
  const money = priced(delta, churn ? roundDisplay(churn.hi) : null);
  return {
    metric: candidate,
    kind: perUnitD ? "new-mrr" : "customers",
    from: r,
    to: target,
    customersPerMonth: delta,
    ...money,
    lines,
  };
}
