import { describe, expect, it } from "vitest";
import {
  INSTALL_VALUE_MONTHS,
  activeRetentionGain,
  appRankingGain,
  appRevenuePath,
  appRevenueToday,
  costPerInstall,
  installCumulative,
  installLossCheck,
  installMargins,
  installPayback,
  installPaybackInterval,
  installPaybackWarning,
  installValue,
  newActivesPerMonth,
  revenuePerActive,
  storeBilledMargin,
  usageFlowGain,
  usagePath,
  valueToCost,
  type AppMarginInputs,
  type AppMonetization,
} from "../app-model";
import { LTV_CAP_MONTHS } from "../catalog-shape";
import { point } from "../interval";
import { paybackLimit } from "../money";
import { mrrPath } from "../scenario";
import { flowGain, keptPercentOfChurn, pathFromNextMonth, relativeGap } from "../stream";
import type { Interval } from "../types";

/**
 * The consumer app's money (engine spec §21, A22; C56, C59, C92), before any
 * wiring: the model alone, on the example §21 cites. Every figure below was
 * computed a second time by an independent script (the loop and the sums
 * written out, no engine code), on 2026-10-04, and pinned here; §21 quotes
 * these tests, never a hand computation.
 *
 * The example: a meditation app, 12 000 installs a month, 12 % still active
 * at day 30, 3 % subscribe, 6,40 € a subscriber, 7 % churn, an MRR of
 * 28 800 € and an NRR of 93,5 %; 15 000 actives kept at 90 % a month,
 * 0,30 € of purchases and 0,40 € of ads per active; a 22 % commission, an
 * 80 % margin net of it; 18 000 € of acquisition a month.
 *
 * Non-vacuity, measured on 2026-10-04:
 * - the commission taken on ads too fails « an install's first month »
 *   (0,060864 € becomes 0,052416 €);
 * - the actives' decay started at month 0 instead of 1 (q^k for q^(k−1))
 *   fails the twelve-month value;
 * - the payback's crossing month taken whole (k instead of k − 1 + the
 *   fraction) fails « 13,01 months »;
 * - `appRankingGain` keeping the subscriptions alone when both streams are
 *   ticked fails day 30's 828 €.
 */

const ALL: AppMonetization = { subscriptions: true, purchases: true, ads: true };
const SUBSCRIPTIONS_ONLY: AppMonetization = { subscriptions: true, purchases: false, ads: false };
const USAGE_ONLY: AppMonetization = { subscriptions: false, purchases: true, ads: true };
const ADS_ONLY: AppMonetization = { subscriptions: false, purchases: false, ads: true };

const INSTALLS = point(12_000);
const D30 = point(12);
const CHURN = point(7);
const RETENTION = point(90);
const SPEND = point(18_000);

const INPUTS: AppMarginInputs = {
  paidConversion: point(3),
  arpa: point(6.4),
  d30: D30,
  purchasesPerActive: point(0.3),
  adsPerActive: point(0.4),
  commission: point(22),
  margin: point(80),
};

const mid = (i: Interval | null | undefined) => (i ? (i.lo + i.hi) / 2 : Number.NaN);

describe("stream.ts — the loop every stream shares", () => {
  it("with start = today, pathFromNextMonth is mrrPath, point for point", () => {
    const today = { lo: 28_000, hi: 29_600 };
    const kept = { lo: 92, hi: 95 };
    const a = pathFromNextMonth(today, today, point(2_304), kept);
    const b = mrrPath(today, point(2_304), kept);
    expect(a).toEqual(b);
  });

  it("keeps 100 − churn, the bounds swapped", () => {
    expect(keptPercentOfChurn({ lo: 3, hi: 5 })).toEqual({ lo: 95, hi: 97 });
  });

  it("relativeGap is t/r − 1, floored at 0, and null on a rate that can be 0", () => {
    expect(relativeGap(point(12), 15)!.lo).toBeCloseTo(0.25, 12);
    expect(relativeGap(point(20), 15)).toEqual({ lo: 0, hi: 0 });
    expect(relativeGap({ lo: 0, hi: 4 }, 5)).toBeNull();
  });
});

describe("the two streams of the example", () => {
  const newActives = newActivesPerMonth(INSTALLS, D30)!;
  const perActive = revenuePerActive(ALL, point(0.3), point(0.4))!;
  const subscriptions = mrrPath(point(28_800), point(2_304), point(93.5));
  const usage = usagePath(point(15_000), newActives, RETENTION, perActive);

  it("1 440 new actives a month, 0,70 € an active, 10 500 € of purchases and ads this month", () => {
    expect(mid(newActives)).toBeCloseTo(1_440, 9);
    expect(mid(perActive)).toBeCloseTo(0.7, 12);
    expect(mid(usage![0])).toBeCloseTo(10_500, 9);
  });

  it("the usage stream in twelve months: 10 198,62 €, its curve as the script drew it", () => {
    expect(mid(usage![12])).toBeCloseTo(10_198.62, 2);
    expect(usage!.map((p) => Math.round(mid(p) * 100) / 100)).toEqual([
      10_500, 10_458, 10_420.2, 10_386.18, 10_355.56, 10_328.01, 10_303.21, 10_280.88, 10_260.8, 10_242.72, 10_226.44, 10_211.8, 10_198.62,
    ]);
  });

  it("the month's revenue is 39 300 €, and 42 677,83 € in twelve months — the two streams added", () => {
    expect(mid(appRevenueToday(ALL, point(28_800), usage![0]!))).toBeCloseTo(39_300, 9);
    const total = appRevenuePath(ALL, subscriptions, usage)!;
    expect(mid(total[12])).toBeCloseTo(42_677.83, 2);
    expect(total.map((p) => Math.round(mid(p)))).toEqual([39_300, 39_690, 40_056, 40_400, 40_722, 41_025, 41_309, 41_575, 41_825, 42_059, 42_279, 42_485, 42_678]);
  });

  it("only the ticked streams count, and a ticked unknown stream is never replaced by the other (S9)", () => {
    expect(appRevenuePath(SUBSCRIPTIONS_ONLY, subscriptions, null)).toBe(subscriptions);
    expect(appRevenuePath(USAGE_ONLY, null, usage)).toBe(usage);
    expect(appRevenuePath(ALL, subscriptions, null)).toBeNull();
    expect(appRevenuePath(ALL, null, usage)).toBeNull();
    expect(appRevenuePath({ subscriptions: false, purchases: false, ads: false }, subscriptions, usage)).toBeNull();
    expect(appRevenueToday(ALL, point(28_800), null)).toBeNull();
  });

  it("revenue per active: an unticked stream counts 0, a ticked unknown one makes it unknown", () => {
    expect(revenuePerActive(ADS_ONLY, null, point(0.4))).toEqual(point(0.4));
    expect(revenuePerActive(ALL, null, point(0.4))).toBeNull();
    expect(revenuePerActive(SUBSCRIPTIONS_ONLY, point(0.3), point(0.4))).toBeNull();
  });

  it("a revenue per active moved by a what-if applies to every active from the next month", () => {
    const moved = usagePath(point(15_000), newActives, RETENTION, perActive, point(0.8))!;
    expect(mid(moved[0])).toBeCloseTo(10_500, 9); // today stays today
    expect(mid(moved[1])).toBeCloseTo(11_952, 9); // 15 000 × 0,9 × 0,80 + 1 440 × 0,80
    expect(mid(moved[12]) - mid(usage![12])).toBeCloseTo(1_456.95, 2);
  });

  it("the actives' retention at 92 % adds 1 629,28 € to the month in twelve months", () => {
    const kept = usagePath(point(15_000), newActives, point(92), perActive)!;
    expect(mid(kept[12]) - mid(usage![12])).toBeCloseTo(1_629.28, 2);
  });
});

describe("an install's economics (C92)", () => {
  const margins = installMargins(ALL, INPUTS)!;
  const cpi = costPerInstall(SPEND, INSTALLS)!;
  const value12 = installValue(margins, CHURN, RETENTION, INSTALL_VALUE_MONTHS);
  const value36 = installValue(margins, CHURN, RETENTION, LTV_CAP_MONTHS);

  it("a store-billed euro leaves 62,4 % of margin: (100 − 22) × 80 ÷ 100", () => {
    expect(storeBilledMargin(point(22), point(80)).lo).toBeCloseTo(62.4, 12);
    expect(storeBilledMargin({ lo: 15, hi: 30 }, { lo: 75, hi: 85 })).toEqual({ lo: 52.5, hi: 72.25 });
  });

  it("an install's first month: 0,119808 € of subscription, 0,060864 € of purchases and ads (no commission on ads)", () => {
    expect(mid(margins.subscription)).toBeCloseTo(0.119808, 12);
    expect(mid(margins.usage)).toBeCloseTo(0.060864, 12);
  });

  it("an install costs 1,50 € and brings 1,4318 € in twelve months, 2,1809 € in 36: 0,95 times its cost in a year", () => {
    expect(mid(cpi)).toBe(1.5);
    expect(mid(value12)).toBeCloseTo(1.431839, 6);
    expect(mid(value36)).toBeCloseTo(2.180934, 6);
    expect(mid(valueToCost(value12, cpi))).toBeCloseTo(0.95456, 5);
  });

  it("the payback chart's curve: 37 points, 0 first, the twelve- and 36-month values at 12 and 36, always rising", () => {
    const curve = installCumulative(margins, CHURN, RETENTION)!;
    expect(curve.lo).toHaveLength(37);
    expect(curve.lo[0]).toBe(0);
    expect(curve.lo[12]).toBeCloseTo(value12!.lo, 12);
    expect(curve.hi[36]).toBeCloseTo(value36!.hi, 12);
    expect(curve.lo.every((v, k) => k === 0 || v > curve.lo[k - 1]!)).toBe(true);
    expect(installCumulative(margins, null, RETENTION)).toBeNull();
  });

  it("paid back in 13,01 months, no loss, no warning under the 30-month floor", () => {
    const payback = installPayback(cpi, margins, CHURN, RETENTION)!;
    expect(payback.lo).toBeCloseTo(13.0132, 4);
    expect(payback.hi).toBeCloseTo(13.0132, 4);
    const loss = installLossCheck(value36, cpi);
    expect(loss!.verdict).toBe("none");
    expect(installPaybackWarning(payback, loss, paybackLimit(undefined))).toBeNull();
    expect(installPaybackWarning(payback, loss, paybackLimit(12))).toEqual({ verdict: "long", limit: { kind: "runway", months: 12 } });
  });

  it("the commission at 15 % pays an install back within the year: 11,55 months, 1,5356 € in twelve months", () => {
    const at15 = installMargins(ALL, { ...INPUTS, commission: point(15) })!;
    expect(mid(installValue(at15, CHURN, RETENTION, 12))).toBeCloseTo(1.535609, 6);
    expect(installPayback(cpi, at15, CHURN, RETENTION)!.lo).toBeCloseTo(11.5464, 4);
  });

  it("an app on purchases and ads alone loses on every install: 0,59 € in 36 months for 1,50 €, no payback, no warning", () => {
    const usage = installMargins(USAGE_ONLY, INPUTS)!;
    expect(usage.subscription).toEqual(point(0));
    const v36 = installValue(usage, null, RETENTION, LTV_CAP_MONTHS);
    expect(mid(v36)).toBeCloseTo(0.594928, 6);
    expect(installPayback(cpi, usage, null, RETENTION)).toBeNull();
    const loss = installLossCheck(v36, cpi)!;
    expect(loss.verdict).toBe("loss");
    expect(installPaybackWarning(null, loss, paybackLimit(undefined))).toBeNull();
  });

  it("an estimated margin widens every figure the right way, and a worst case past 36 months is « maybe », never a loss", () => {
    const wide = installMargins(ALL, { ...INPUTS, margin: { lo: 40, hi: 80 } })!;
    expect(wide.subscription.lo).toBeLessThan(wide.subscription.hi);
    const payback = installPayback(point(2), wide, CHURN, RETENTION)!;
    expect(payback.lo).toBeGreaterThan(0);
    expect(payback.hi).toBeNull();
    expect(installPaybackInterval(payback)).toEqual({ lo: payback.lo, hi: LTV_CAP_MONTHS });
    expect(installPaybackInterval(null)).toBeNull();
    const loss = installLossCheck(installValue(wide, CHURN, RETENTION, LTV_CAP_MONTHS), point(2))!;
    expect(loss.verdict).toBe("maybe");
    expect(installPaybackWarning(payback, loss, paybackLimit(undefined))!.verdict).toBe("maybe");
  });

  it("a ticked stream without its number has no margin; a stream that brings something needs its keep rate", () => {
    expect(installMargins(ALL, { ...INPUTS, commission: null })).toBeNull();
    expect(installMargins(ADS_ONLY, { ...INPUTS, commission: null })).not.toBeNull(); // ads only: no commission
    expect(installMargins(ALL, { ...INPUTS, adsPerActive: null })).toBeNull();
    expect(installMargins({ subscriptions: false, purchases: false, ads: false }, INPUTS)).toBeNull();
    expect(installValue(margins, null, RETENTION, 12)).toBeNull();
    expect(installValue(margins, CHURN, null, 12)).toBeNull();
  });
});

describe("the app's ranking: the usage stream joins the flows", () => {
  const newSubscribers = point(360); // 12 000 × 3 %
  const newActives = newActivesPerMonth(INSTALLS, D30)!;
  const perActive = point(0.7);
  const arpa = point(6.4);

  it("day 30 at 15 % is worth 828 €/month (576 of subscriptions + 252 of usage); the paid conversion at 4 %, 768 € — neither clears the other by 25 %", () => {
    const d30Gap = relativeGap(D30, 15)!;
    const d30 = appRankingGain(ALL, flowGain(newSubscribers, d30Gap, arpa), usageFlowGain(newActives, d30Gap, perActive))!;
    const paidGap = relativeGap(point(3), 4)!;
    const paid = appRankingGain(ALL, flowGain(newSubscribers, paidGap, arpa), point(0))!;
    expect(mid(d30)).toBeCloseTo(828, 9);
    expect(mid(paid)).toBeCloseTo(768, 9);
    expect(d30.lo > paid.hi * 1.25).toBe(false);
    expect(paid.lo > d30.hi * 1.25).toBe(false);
  });

  it("subscriptions alone: the self-serve ranking, unchanged (768 € against 576 €, clear)", () => {
    const d30 = appRankingGain(SUBSCRIPTIONS_ONLY, flowGain(newSubscribers, relativeGap(D30, 15)!, arpa), null)!;
    const paid = appRankingGain(SUBSCRIPTIONS_ONLY, flowGain(newSubscribers, relativeGap(point(3), 4)!, arpa), null)!;
    expect(paid.lo > d30.hi * 1.25).toBe(true);
  });

  it("the actives' retention from 90 to 92 % keeps 210 €/month (15 000 × 2 % × 0,70 €); a target already met keeps nothing", () => {
    expect(mid(activeRetentionGain(point(15_000), RETENTION, 92, perActive))).toBeCloseTo(210, 9);
    expect(activeRetentionGain(point(15_000), RETENTION, 88, perActive)).toEqual(point(0));
  });

  it("a ticked stream whose gain is unknown leaves the money unknown", () => {
    expect(appRankingGain(ALL, point(576), null)).toBeNull();
    expect(appRankingGain(USAGE_ONLY, null, point(252))).toEqual(point(252));
  });
});
