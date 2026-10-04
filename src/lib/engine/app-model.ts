import { add, div, mul, point, scale } from "./interval";
import { LTV_CAP_MONTHS } from "./catalog-shape";
import { lossCheck, type LossCheck, type PaybackLimit, type PaybackWarning } from "./money";
import { flowGain, keptGain, pathFromNextMonth } from "./stream";
import { addBoth, sumPaths } from "./total";
import type { Interval } from "./types";

/**
 * app-model.ts — the money of a consumer app (engine spec §21, A22; Antoine's
 * answers C56, C59 and C92 of 2026-10-04).
 *
 * An app earns in up to three ways, ticked in its setup: subscriptions,
 * in-app purchases, ads. They make two streams:
 *
 * - the subscriptions are the self-serve MRR, untouched: its base kept at
 *   the NRR, each month's new subscribers' MRR on top (`mrrPath`);
 * - purchases and ads are earned on the month's actives: actives × what one
 *   active brings. The actives are kept at their monthly retention, and the
 *   installs still there at day 30 join them each month — the same loop as
 *   the MRR (`stream.ts#pathFromNextMonth`).
 *
 * The month's revenue is the two added, and only when every ticked stream is
 * known: one stream is never passed off as the whole (S9).
 *
 * The stores' commission is a number of its own (C59). It is taken on what
 * the stores bill — subscriptions and purchases — never on ads; the gross
 * margin is typed « net of the commission », so a store-billed euro leaves
 * (100 − commission) × margin ÷ 100 % of margin, and an ad euro leaves the
 * margin.
 *
 * The unit economics read per install (C92): what an install costs against
 * what it brings back, month by month — its share of a subscriber, decaying
 * with the subscribers' churn, and its share of an active, decaying with the
 * actives' retention — over twelve months, and over the engine's 36-month
 * cap for the loss and the payback.
 *
 * Nothing here reads the state: every function takes plain intervals, and
 * the wiring (§21) says where each comes from.
 */

export type AppStream = "subscriptions" | "purchases" | "ads";

/** What the app earns from, ticked in its setup. At least one. */
export type AppMonetization = Readonly<Record<AppStream, boolean>>;

/** The streams in their fixed order. */
export const APP_STREAMS: readonly AppStream[] = ["subscriptions", "purchases", "ads"];

/** Purchases or ads ticked: the app has a usage stream. */
export function hasUsageStream(m: AppMonetization): boolean {
  return m.purchases || m.ads;
}

/** New actives a month: the month's installs × day-30 retention ÷ 100 — the installs still there at day 30 join the actives. */
export function newActivesPerMonth(installs: Interval | null, d30Percent: Interval | null): Interval | null {
  return installs && d30Percent ? mul(installs, scale(d30Percent, 1 / 100)) : null;
}

/**
 * What one active brings a month from the ticked usage streams: purchases
 * per active + ads per active. null when neither is ticked, or a ticked one
 * is unknown; an unticked one counts 0.
 */
export function revenuePerActive(m: AppMonetization, purchases: Interval | null, ads: Interval | null): Interval | null {
  if (!hasUsageStream(m)) return null;
  const p = m.purchases ? purchases : point(0);
  const d = m.ads ? ads : point(0);
  return p && d ? add(p, d) : null;
}

/**
 * The usage stream month by month, 13 points: `[0]` = the actives × what one
 * active brings today; from the next month, what one active brings may be a
 * what-if's (`perActiveFromNextMonth`), on every active — like the
 * marketplace's money levers (C69). Kept at the actives' retention, the new
 * actives × what one brings on top.
 */
export function usagePath(
  actives: Interval | null,
  newActives: Interval | null,
  activeRetention: Interval | null,
  perActiveToday: Interval | null,
  perActiveFromNextMonth: Interval | null = perActiveToday,
): Interval[] | null {
  if (!actives || !newActives || !perActiveToday || !perActiveFromNextMonth) return null;
  return pathFromNextMonth(mul(actives, perActiveToday), mul(actives, perActiveFromNextMonth), mul(newActives, perActiveFromNextMonth), activeRetention);
}

/**
 * The app's revenue month by month: the ticked streams added point by
 * point. null when nothing is ticked, or when a ticked stream is unknown —
 * never one stream passed off as the whole (S9).
 */
export function appRevenuePath(m: AppMonetization, subscriptions: Interval[] | null, usage: Interval[] | null): Interval[] | null {
  const usageTicked = hasUsageStream(m);
  if (m.subscriptions && usageTicked) return sumPaths(subscriptions, usage);
  if (m.subscriptions) return subscriptions;
  if (usageTicked) return usage;
  return null;
}

/** The month's revenue, the same rule: the ticked streams added, or null. */
export function appRevenueToday(m: AppMonetization, mrr: Interval | null, usage: Interval | null): Interval | null {
  const usageTicked = hasUsageStream(m);
  if (m.subscriptions && usageTicked) return addBoth(mrr, usage);
  if (m.subscriptions) return mrr;
  if (usageTicked) return usage;
  return null;
}

/**
 * The margin a store-billed euro leaves, in percent: (100 − commission) ×
 * margin ÷ 100 — the margin is typed net of the commission (C59). Each
 * bound from the bounds that push it the same way.
 */
export function storeBilledMargin(commissionPercent: Interval, marginPercent: Interval): Interval {
  return { lo: ((100 - commissionPercent.hi) * marginPercent.lo) / 100, hi: ((100 - commissionPercent.lo) * marginPercent.hi) / 100 };
}

export interface AppMarginInputs {
  /** Installs who subscribe, percent (the self-serve paid conversion, on installs). */
  paidConversion: Interval | null;
  /** Revenue per subscriber a month (the self-serve ARPA). */
  arpa: Interval | null;
  /** Installs still active at day 30, percent. */
  d30: Interval | null;
  purchasesPerActive: Interval | null;
  adsPerActive: Interval | null;
  /** The stores' average commission, percent (C59). */
  commission: Interval | null;
  /** The gross margin, net of the commission, percent. */
  margin: Interval | null;
}

/**
 * What an install brings in margin in its first month, per stream — the
 * starting point of the two decays:
 * - `subscription` = paid conversion ÷ 100 × ARPA × the store-billed margin ÷ 100;
 * - `usage` = day 30 ÷ 100 × (purchases × the store-billed margin + ads × the margin) ÷ 100.
 * An unticked stream is 0. null when a ticked stream lacks a number, or
 * nothing is ticked.
 */
export interface InstallMargins {
  subscription: Interval;
  usage: Interval;
}

export function installMargins(m: AppMonetization, i: AppMarginInputs): InstallMargins | null {
  if (!m.subscriptions && !hasUsageStream(m)) return null;
  if (!i.margin) return null;
  const storeBilled = m.subscriptions || m.purchases ? (i.commission ? storeBilledMargin(i.commission, i.margin) : null) : point(0);
  if (!storeBilled) return null;

  let subscription: Interval = point(0);
  if (m.subscriptions) {
    if (!i.paidConversion || !i.arpa) return null;
    subscription = mul(mul(scale(i.paidConversion, 1 / 100), i.arpa), scale(storeBilled, 1 / 100));
  }

  let usage: Interval = point(0);
  if (hasUsageStream(m)) {
    const purchases = m.purchases ? (i.purchasesPerActive ? mul(i.purchasesPerActive, scale(storeBilled, 1 / 100)) : null) : point(0);
    const ads = m.ads ? (i.adsPerActive ? mul(i.adsPerActive, scale(i.margin, 1 / 100)) : null) : point(0);
    if (!purchases || !ads || !i.d30) return null;
    usage = mul(scale(i.d30, 1 / 100), add(purchases, ads));
  }
  return { subscription, usage };
}

/** One bound of an install's margin: the two streams, each decaying at its own monthly keep rate. */
interface Decay {
  subscription: number;
  usage: number;
  /** Subscribers kept a month, 0 to 1: 1 − churn ÷ 100. */
  subscriberKept: number;
  /** Actives kept a month, 0 to 1: retention ÷ 100. */
  activeKept: number;
}

/** The margin of month k (1 = the install's first month). */
function monthMargin(d: Decay, k: number): number {
  return d.subscription * Math.pow(d.subscriberKept, k - 1) + d.usage * Math.pow(d.activeKept, k - 1);
}

/**
 * The two decays, bound by bound: the low bound with every number at its
 * worst (most churn, least retention), the high with every number at its
 * best. null when a stream that brings something lacks its keep rate.
 */
function decays(margins: InstallMargins, subscriberChurn: Interval | null, activeRetention: Interval | null): { lo: Decay; hi: Decay } | null {
  const needsChurn = margins.subscription.hi > 0;
  const needsRetention = margins.usage.hi > 0;
  if ((needsChurn && !subscriberChurn) || (needsRetention && !activeRetention)) return null;
  const churn = subscriberChurn ?? point(0);
  const retention = activeRetention ?? point(0);
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  return {
    lo: { subscription: margins.subscription.lo, usage: margins.usage.lo, subscriberKept: clamp(1 - churn.hi / 100), activeKept: clamp(retention.lo / 100) },
    hi: { subscription: margins.subscription.hi, usage: margins.usage.hi, subscriberKept: clamp(1 - churn.lo / 100), activeKept: clamp(retention.hi / 100) },
  };
}

function valueOver(d: Decay, months: number): number {
  let total = 0;
  for (let k = 1; k <= months; k++) total += monthMargin(d, k);
  return total;
}

/**
 * The margin an install brings over its first `months` months: Σ, month by
 * month, its share of a subscriber kept at 1 − churn and its share of an
 * active kept at the actives' retention. 12 is the figure C92 compares to
 * the cost of an install; `LTV_CAP_MONTHS` (36) is the app's LTV, the
 * engine's cap, against which a loss is read.
 */
export function installValue(margins: InstallMargins | null, subscriberChurn: Interval | null, activeRetention: Interval | null, months: number): Interval | null {
  if (!margins) return null;
  const d = decays(margins, subscriberChurn, activeRetention);
  return d ? { lo: valueOver(d.lo, months), hi: valueOver(d.hi, months) } : null;
}

/** The months C92 compares an install's value over. */
export const INSTALL_VALUE_MONTHS = 12;

/**
 * The margin an install has brought after 0, 1, … 36 months: 37 points,
 * `[0]` = 0, `[12]` = the twelve-month value, `[36]` = the 36-month one. The
 * payback chart draws this curve — it bends as the subscribers leave and the
 * actives drift away — where self-serve draws a straight line (ARPA × margin
 * a month). `lo` with every number at its worst, `hi` at its best.
 */
export function installCumulative(
  margins: InstallMargins | null,
  subscriberChurn: Interval | null,
  activeRetention: Interval | null,
): { lo: number[]; hi: number[] } | null {
  if (!margins) return null;
  const d = decays(margins, subscriberChurn, activeRetention);
  if (!d) return null;
  const curve = (decay: Decay) => {
    const points = [0];
    for (let k = 1; k <= LTV_CAP_MONTHS; k++) points.push(points[k - 1]! + monthMargin(decay, k));
    return points;
  };
  return { lo: curve(d.lo), hi: curve(d.hi) };
}

/** The cost of an install: a month's acquisition spend ÷ the month's installs (blended: the organic ones count). */
export function costPerInstall(spend: Interval | null, installs: Interval | null): Interval | null {
  return spend && installs ? div(spend, installs) : null;
}

/**
 * The months an install takes to pay its cost back, its margin counted
 * month by month as it decays; the month it crosses is interpolated
 * linearly. `lo` from the best case (the cheapest install, every margin at
 * its best), `hi` from the worst. `hi` is null when the worst case is not
 * paid back within 36 months; the whole is null when even the best case
 * isn't — that is the loss, which `lossCheck` on the 36-month value says.
 */
export interface InstallPayback {
  lo: number;
  hi: number | null;
}

function monthsToRecover(cost: number, d: Decay): number | null {
  if (cost <= 0) return 0;
  let total = 0;
  for (let k = 1; k <= LTV_CAP_MONTHS; k++) {
    const margin = monthMargin(d, k);
    if (total + margin >= cost) return k - 1 + (cost - total) / margin;
    total += margin;
  }
  return null;
}

export function installPayback(
  cpi: Interval | null,
  margins: InstallMargins | null,
  subscriberChurn: Interval | null,
  activeRetention: Interval | null,
): InstallPayback | null {
  if (!cpi || !margins) return null;
  const d = decays(margins, subscriberChurn, activeRetention);
  if (!d) return null;
  const lo = monthsToRecover(cpi.lo, d.hi);
  if (lo === null) return null;
  return { lo, hi: monthsToRecover(cpi.hi, d.lo) };
}

/**
 * The payback as the engine's other paybacks are carried (`ScenarioKpis.payback`,
 * an interval of months): a worst case not paid back within 36 months reads
 * 36 — the cap, as the LTV's lifetime is — and the loss check on the 36-month
 * value says the rest (« maybe never »). null when even the best case isn't
 * paid back: that is the loss.
 */
export function installPaybackInterval(payback: InstallPayback | null): Interval | null {
  return payback ? { lo: payback.lo, hi: payback.hi ?? LTV_CAP_MONTHS } : null;
}

/** The app's loss check: the 36-month value of an install against its cost — `money.ts#lossCheck`, unchanged. */
export function installLossCheck(value36: Interval | null, cpi: Interval | null): LossCheck | null {
  return lossCheck(value36, cpi);
}

/**
 * The long-payback warning on an install (C49's rule, `money.ts#paybackWarning`):
 * past the runway, or from the 30-month floor. A worst case not paid back
 * within 36 months may be past any limit: it warns « maybe » when the best
 * case is under the limit. Never with a certain loss.
 */
export function installPaybackWarning(payback: InstallPayback | null, loss: LossCheck | null, limit: PaybackLimit): PaybackWarning | null {
  if (!payback || loss?.verdict === "loss") return null;
  const past = (v: number) => (limit.kind === "runway" ? v > limit.months : v >= limit.months);
  if (past(payback.lo)) return { verdict: "long", limit };
  if (payback.hi === null || past(payback.hi)) return { verdict: "maybe", limit };
  return null;
}

/** The value of twelve months ÷ the cost of an install: « an install brings back 0.95 times what it cost in a year ». */
export function valueToCost(value12: Interval | null, cpi: Interval | null): Interval | null {
  return value12 && cpi ? div(value12, cpi) : null;
}

/**
 * What closing a gap adds to the usage stream a month, for the diagnosis
 * (§21): the flows that bring installs to day 30 — installs, activation,
 * day 30, the referred share — grow the new actives by the same relative
 * gap as the new subscribers (the actives are assumed among the activated,
 * as the paying are, `impact.ts`), so their gain is the new actives × the
 * gap × what one active brings. The paid conversion and the subscribers'
 * churn don't touch the actives: 0.
 */
export function usageFlowGain(newActives: Interval, gap: Interval, perActive: Interval): Interval {
  return flowGain(newActives, gap, perActive);
}

/** The actives' retention, a candidate of its own: the actives × the gap in points ÷ 100 × what one active brings, kept a month. */
export function activeRetentionGain(actives: Interval, retention: Interval, target: number, perActive: Interval): Interval {
  return keptGain(actives, retention, target, perActive, "higher");
}

/**
 * A candidate's money for the app's ranking: its gain on the subscriptions
 * plus its gain on the usage stream, the ticked streams only. A ticked
 * stream it doesn't touch passes point(0), not null; null when a ticked
 * stream's gain is unknown — the ranking then falls back to the relative gap,
 * as self-serve does without ARPA.
 */
export function appRankingGain(m: AppMonetization, subscription: Interval | null, usage: Interval | null): Interval | null {
  const usageTicked = hasUsageStream(m);
  if (m.subscriptions && usageTicked) return addBoth(subscription, usage);
  if (m.subscriptions) return subscription;
  if (usageTicked) return usage;
  return null;
}

