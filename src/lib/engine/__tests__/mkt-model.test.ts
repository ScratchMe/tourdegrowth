import { describe, expect, it } from "vitest";
import { referralGain } from "../impact";
import { mul, point } from "../interval";
import {
  demandPath,
  marketplaceRevenuePath,
  marketplaceRevenueToday,
  newPaidSellersPerMonth,
  paidSellerCac,
  revenuePerBuyer,
  sellerPath,
  sideEconomics,
} from "../mkt-model";
import { correlatedRatio, mrrPath } from "../scenario";
import { flowGain, keptGain, keptPercentOfChurn, relativeGap } from "../stream";
import type { Interval } from "../types";

/**
 * The marketplace's money (engine spec §22, A23; C64, C66 to C70, C93),
 * before any wiring: the model alone, on the example §22 cites. Every figure
 * was computed a second time by an independent script on 2026-10-04 and
 * pinned here; the demand's figures are those of the reference model of the
 * first draft of §22, which this module reproduces to the cent.
 *
 * The example: a second-hand furniture marketplace. Demand: 600 new buyers a
 * month, an active buyer orders 0,3 times a month for 65 € at a 12 % take
 * rate, 4 % of the buyers leave a month, a net revenue of 32 853,60 €, a
 * 55 to 65 % margin, a buyer costs 30 €. Supply: 400 seller sign-ups a
 * month, 30 % sell, 15 % subscribe, 900 paid sellers pay 29 € (an MRR of
 * 26 100 €), 3 % of them leave a month, an 85 % margin, an active seller
 * costs 100 €.
 *
 * Non-vacuity, measured on 2026-10-04:
 * - the paid seller's cost without the first sale (100 ÷ 15 % instead of
 *   100 × 30/15) fails « a paid seller costs 200 € »;
 * - the demand's money ratio applied to the new buyers only (start = today)
 *   fails the what-if's 46 351,72 €;
 * - the total keeping the commissions alone when the sellers pay fails
 *   69 590,04 €;
 * - the sellers' price ratio applied to the new paid sellers only fails the
 *   price lever's next month (32 655 €).
 */

const mid = (i: Interval | null | undefined) => (i ? (i.lo + i.hi) / 2 : Number.NaN);

const R0 = point(32_853.6);
const NEW_BUYERS = point(600);
const BUYER_CHURN = point(4);
const A = revenuePerBuyer(point(0.3), point(65), point(12))!;

const SELLER_MRR = point(26_100);
const SELLER_SIGNUPS = point(400);
const PAID_CONVERSION = point(15);
const SELLER_PRICE = point(29);
const PAID_CHURN = point(3);
const NEW_PAID = newPaidSellersPerMonth(SELLER_SIGNUPS, PAID_CONVERSION)!;

describe("the demand: commissions on the buyers' orders (C66, C69)", () => {
  const today = demandPath(R0, mul(NEW_BUYERS, A), BUYER_CHURN);

  it("an active buyer brings 2,34 € a month: 0,3 × 65 € × 12 %", () => {
    expect(mid(A)).toBeCloseTo(2.34, 12);
  });

  it("the net revenue in twelve months: 33 723,61 €, the curve of the first draft", () => {
    expect(mid(today![12])).toBeCloseTo(33_723.61, 2);
    expect(today!.map((p) => Math.round(mid(p)))).toEqual([32_854, 32_943, 33_030, 33_113, 33_192, 33_268, 33_342, 33_412, 33_479, 33_544, 33_607, 33_666, 33_724]);
  });

  it("without a what-if, it is mrrPath at 100 − churn", () => {
    expect(today).toEqual(mrrPath(R0, mul(NEW_BUYERS, A), keptPercentOfChurn(BUYER_CHURN)));
  });

  it("fill rate 12 %, first order 25 %, take rate 13 %: 46 351,72 € in twelve months, +12 628,11 €", () => {
    const fN = (12 / 9) * (25 / 20);
    const fA = correlatedRatio(point(12), () => 13);
    const projectedA = { lo: A.lo * fA.lo, hi: A.hi * fA.hi };
    const projected = demandPath(R0, mul(point(600 * fN), projectedA), BUYER_CHURN, fA)!;
    expect(mid(projected[12])).toBeCloseTo(46_351.72, 2);
    expect(mid(projected[12]) - mid(today![12])).toBeCloseTo(12_628.11, 2);
  });

  it("a buyer: 1,287 to 1,521 € of margin a month, 25 months, an LTV of 32,18 to 38,03 €, paid back in 19,72 to 23,31 months, no loss", () => {
    const buyer = sideEconomics(A, { lo: 55, hi: 65 }, BUYER_CHURN, point(30));
    expect(buyer.monthlyMargin!.lo).toBeCloseTo(1.287, 12);
    expect(buyer.monthlyMargin!.hi).toBeCloseTo(1.521, 12);
    expect(mid(buyer.lifetime)).toBeCloseTo(25, 12);
    expect(buyer.ltv!.lo).toBeCloseTo(32.175, 9);
    expect(buyer.ltv!.hi).toBeCloseTo(38.025, 9);
    expect(buyer.payback!.lo).toBeCloseTo(19.7239, 4);
    expect(buyer.payback!.hi).toBeCloseTo(23.31, 4);
    expect(buyer.loss!.verdict).toBe("none");
  });

  it("the demand's ranking: the fill rate 468 €/month, the first order 351 € — the fill rate is clear", () => {
    const fill = flowGain(NEW_BUYERS, relativeGap(point(9), 12)!, A);
    const first = flowGain(NEW_BUYERS, relativeGap(point(20), 25)!, A);
    expect(mid(fill)).toBeCloseTo(468, 9);
    expect(mid(first)).toBeCloseTo(351, 9);
    expect(fill.lo > first.hi * 1.25).toBe(true);
  });

  it("the referred share and the buyers' churn price with the existing rules", () => {
    expect(mid(flowGain(NEW_BUYERS, referralGain(point(8), 10), A))).toBeCloseTo(600 * (2 / 90) * 2.34, 9);
    expect(mid(keptGain(point(14_000), BUYER_CHURN, 3, A, "lower"))).toBeCloseTo(140 * 2.34, 9);
  });
});

describe("the supply: the sellers' subscriptions (C64, C93)", () => {
  const today = sellerPath(SELLER_MRR, mul(NEW_PAID, SELLER_PRICE), PAID_CHURN);

  it("60 new paid sellers a month (400 × 15 %), 1 740 € of new MRR", () => {
    expect(mid(NEW_PAID)).toBeCloseTo(60, 12);
    expect(mid(mul(NEW_PAID, SELLER_PRICE))).toBeCloseTo(1_740, 9);
  });

  it("the sellers' MRR in twelve months: 35 866,43 €", () => {
    expect(mid(today![12])).toBeCloseTo(35_866.43, 2);
    expect(today!.map((p) => Math.round(mid(p)))).toEqual([26_100, 27_057, 27_985, 28_886, 29_759, 30_606, 31_428, 32_225, 32_999, 33_749, 34_476, 35_182, 35_866]);
  });

  it("a paid seller costs 200 € (100 € × 30/15), brings 24,65 € a month for 33,3 months: an LTV of 821,67 €, paid back in 8,11 months, 4,11 times", () => {
    const cac = paidSellerCac(point(100), point(30), PAID_CONVERSION)!;
    expect(mid(cac)).toBeCloseTo(200, 9);
    const seller = sideEconomics(SELLER_PRICE, point(85), PAID_CHURN, cac);
    expect(mid(seller.monthlyMargin)).toBeCloseTo(24.65, 9);
    expect(mid(seller.lifetime)).toBeCloseTo(100 / 3, 9);
    expect(mid(seller.ltv)).toBeCloseTo(821.6667, 4);
    expect(mid(seller.payback)).toBeCloseTo(8.1136, 4);
    expect(mid(seller.ltvCac)).toBeCloseTo(4.1083, 4);
    expect(mid(seller.afterPayback)).toBeCloseTo(25.2197, 4);
    expect(seller.loss!.verdict).toBe("none");
  });

  it("the supply's ranking: the paid conversion at 20 % keeps 580 €/month coming, the paid churn at 2,5 % 130,50 € — the conversion is clear", () => {
    const conversion = flowGain(NEW_PAID, relativeGap(PAID_CONVERSION, 20)!, SELLER_PRICE);
    const churn = keptGain(point(900), PAID_CHURN, 2.5, SELLER_PRICE, "lower");
    expect(mid(conversion)).toBeCloseTo(580, 9);
    expect(mid(churn)).toBeCloseTo(130.5, 9);
    expect(conversion.lo > churn.hi * 1.25).toBe(true);
  });

  it("each supply lever alone, on the MRR in twelve months: conversion 20 % +5 919,05 €, paid churn 2,5 % +1 630,64 €, price 35 € +7 420,64 €", () => {
    const conversion = sellerPath(SELLER_MRR, mul(point(80), SELLER_PRICE), PAID_CHURN)!;
    const churn = sellerPath(SELLER_MRR, mul(NEW_PAID, SELLER_PRICE), point(2.5))!;
    const ratio = correlatedRatio(SELLER_PRICE, () => 35);
    const price = sellerPath(SELLER_MRR, mul(NEW_PAID, point(35)), PAID_CHURN, ratio)!;
    expect(mid(conversion[12]) - mid(today![12])).toBeCloseTo(5_919.05, 2);
    expect(mid(churn[12]) - mid(today![12])).toBeCloseTo(1_630.64, 2);
    expect(mid(price[1])).toBeCloseTo(32_655, 6); // 26 100 × 35/29 × 0,97 + 60 × 35: the price reaches every paid seller next month
    expect(mid(price[12]) - mid(today![12])).toBeCloseTo(7_420.64, 2);
  });

  it("a paid conversion that can be 0 has no paid seller's cost", () => {
    expect(paidSellerCac(point(100), point(30), { lo: 0, hi: 5 })).toBeNull();
  });
});

describe("the total: commissions + subscriptions, like the hybrid", () => {
  const demand = demandPath(R0, mul(NEW_BUYERS, A), BUYER_CHURN);
  const supply = sellerPath(SELLER_MRR, mul(NEW_PAID, SELLER_PRICE), PAID_CHURN);

  it("58 953,60 € this month, 69 590,04 € in twelve months", () => {
    expect(mid(marketplaceRevenueToday(true, R0, SELLER_MRR))).toBeCloseTo(58_953.6, 6);
    expect(mid(marketplaceRevenuePath(true, demand, supply)![12])).toBeCloseTo(69_590.04, 2);
  });

  it("sellers who pay nothing: the commissions alone; sellers who pay, an unknown MRR: no total (S9)", () => {
    expect(marketplaceRevenuePath(false, demand, null)).toBe(demand);
    expect(marketplaceRevenueToday(false, R0, null)).toBe(R0);
    expect(marketplaceRevenuePath(true, demand, null)).toBeNull();
    expect(marketplaceRevenueToday(true, R0, null)).toBeNull();
  });
});

