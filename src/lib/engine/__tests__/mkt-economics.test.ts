import { describe, expect, it } from "vitest";
import {
  mktActiveBuyersStart,
  mktGmvToday,
  mktNetRevenueToday,
  mktNewBuyersPerMonth,
  mktNewPaidSellers,
  mktPaidSellerCac,
  mktPaidSellersStart,
  mktRevenuePerBuyer,
  mktSellerMrrToday,
  mktSellerSignups,
  mktUnitEconomics,
} from "../mkt-economics";
import { sideEconomics } from "../mkt-model";
import { arrOf } from "../money";
import type { EngineState, Interval, MetricId } from "../types";
import { knownIn } from "../values";
import { estimated, marketplaceNoSubscriptionsState, marketplaceState, measured, missing, ratio, withEntry } from "./fixtures";
import { CTX_FR } from "./props";

/**
 * A marketplace's base quantities and the unit economics of each side (engine spec §22.5.1 and §22.5.3, A23 MKT-2),
 * on the example of §22.10.1: a second-hand furniture marketplace, 600 new buyers a month, an active buyer orders 0,3
 * times a month for 65 € at a 12 % take rate, 4 % of the buyers leave a month, a net revenue of 32 853,60 €, a 55 to
 * 65 % margin estimated, a buyer costs 30 €; 400 seller sign-ups, 30 % sell, 15 % subscribe, 900 paid sellers pay 29 €
 * (an MRR of 26 100 €), 3 % of them leave a month, an 85 % margin, an active seller costs 100 €. Every figure of
 * §22.10.2 below is also computed, without any engine code, by `docs/engine/reference/mkt-example.mjs`; the model's
 * own figures are pinned by `mkt-model.test.ts`, and these tests pin what the WIRING does with them: which number of
 * the state feeds which formula, what a fallback does, what an unknown does.
 *
 * Non-vacuity, measured on 2026-10-22 (each sabotage applied alone, this file and `mkt-funnel.test.ts` run, then
 * restored and its sha compared; the count is the tests that fall):
 * - the cost of a paid seller without the first sale (100 ÷ 15 % instead of 100 × 30/15): « a paid seller costs 200 € »,
 *   the 150 € of a conversion at 20 %, the paid seller's payback and LTV:CAC, the missing-first-sale case and the
 *   unknown-cost case fall (5);
 * - the typed shared net revenue ignored (always a × the buyers): « the typed shared net revenue wins » falls (1) — the
 *   example's own figures are equal both ways, which is why that test types a different one;
 * - the typed cost's denominator ignored for the new buyers: « the cost's denominator wins » falls (1), for the same reason;
 * - the confidence of a computed figure always « solid »: the buyer's approximate figures and the young cohort's fall (2);
 * - the box of the subscriptions ignored (the supply always counted): « every quantity of the subscriptions is null »,
 *   « a box that is not a boolean » and the uncomputable supply fall (3);
 * - an unknown take rate read as 0 for a: the two uncomputable cases of a fall (2).
 *
 * One branch no test reaches, and none can: the subscription × its own denominator in `mktSellerMrrToday` (see its
 * comment) — the coverage report shows it as the only branch of the two new modules left uncovered.
 */

const r2 = (v: number) => Math.round(v * 100) / 100;
const r3 = (v: number) => Math.round(v * 1_000) / 1_000;
const stripe = { kind: "tool", tool: "stripe" } as const;

/** An interval that is a single value (everything in the example is measured): its value, or the failure. */
function only(i: Interval | null | undefined): number {
  expect(i, "a known figure").toBeTruthy();
  expect(i!.hi).toBeCloseTo(i!.lo, 9);
  return i!.lo;
}

function known(state: EngineState, id: MetricId): Interval {
  const k = knownIn(state, id, CTX_FR);
  if (k.kind !== "known") throw new Error(`${id} is not known`);
  return k.value;
}

/** The state with a shared count of the base removed (a person who typed the rates and not the counts). */
function withoutBase(state: EngineState, ...counts: (keyof NonNullable<EngineState["snapshots"][number]["base"]>)[]): EngineState {
  for (const count of counts) delete state.snapshots[0]!.base![count];
  return state;
}

describe("the demand's base quantities — the example of §22.10.1", () => {
  const state = marketplaceState();

  it("a, what an active buyer brings a month: 0,3 orders × 65 € × 12 % = 2,34 €", () => {
    expect(only(mktRevenuePerBuyer(state, CTX_FR))).toBeCloseTo(2.34, 9);
  });

  it("R, the month's net revenue: 32 853,60 €, and 394 243,20 € a year", () => {
    const r = mktNetRevenueToday(state, CTX_FR);
    expect(only(r)).toBeCloseTo(32_853.6, 6);
    expect(only(arrOf(r))).toBeCloseTo(394_243.2, 6);
  });

  it("the GMV of the month: 273 780 €, and 3 285 360 € a year", () => {
    const gmv = mktGmvToday(state, CTX_FR);
    expect(only(gmv)).toBeCloseTo(273_780, 6);
    expect(only(arrOf(gmv))).toBeCloseTo(3_285_360, 4);
  });

  it("N, the new buyers: 600 (the cost's denominator), and 3 000 sign-ups × 20 % say the same", () => {
    expect(only(mktNewBuyersPerMonth(state, CTX_FR))).toBe(600);
    expect(known(state, "mkt.buy.first-order").lo).toBe(20);
  });

  it("the active buyers on the 1st: 14 000, the churn's denominator", () => {
    expect(mktActiveBuyersStart(state)).toBe(14_000);
  });

  it("R is a × the active buyers at the month's end (14 040), the frequency's denominator", () => {
    expect(only(mktRevenuePerBuyer(state, CTX_FR)) * 14_040).toBeCloseTo(only(mktNetRevenueToday(state, CTX_FR)), 6);
  });
});

describe("the demand's fallbacks — a person who typed rates, not counts", () => {
  /** The take rate typed as a rate (12 %), the basket as an amount (65 €), the cost per buyer as an amount (30 €): none carries a count. */
  function rates(): EngineState {
    let state = marketplaceState();
    state = withEntry(state, "mkt.rev.take-rate", measured({ kind: "rate", percent: 12 }, stripe));
    state = withEntry(state, "mkt.rev.aov", measured({ kind: "amount", amount: 65 }, stripe));
    state = withEntry(state, "mkt.buy.cac", measured({ kind: "amount", amount: 30 }, stripe, { variant: "media-only" }));
    return state;
  }

  it("the typed shared net revenue wins over a × the buyers", () => {
    const state = marketplaceState();
    state.snapshots[0]!.base!.mktNetRevenue = 30_000;
    expect(only(mktNetRevenueToday(state, CTX_FR))).toBe(30_000);
  });

  it("without it, R is a × the frequency's denominator: 2,34 × 14 040", () => {
    const state = withoutBase(rates(), "mktNetRevenue", "mktGmv");
    expect(only(mktNetRevenueToday(state, CTX_FR))).toBeCloseTo(32_853.6, 6);
  });

  it("without a denominator behind the frequency, R is unknown: never 0", () => {
    const state = withEntry(withoutBase(rates(), "mktNetRevenue"), "mkt.rev.frequency", estimated(0.25, 0.35));
    expect(mktRevenuePerBuyer(state, CTX_FR), "a is known, as an interval").not.toBeNull();
    expect(mktNetRevenueToday(state, CTX_FR)).toBeNull();
  });

  it("the GMV without its count is R ÷ the take rate: 32 853,60 ÷ 12 %", () => {
    const state = withoutBase(rates(), "mktGmv");
    expect(only(mktGmvToday(state, CTX_FR))).toBeCloseTo(273_780, 4);
  });

  it("the GMV is unknown without a take rate or without R, and a take rate spanning 0 divides nothing", () => {
    const noTake = withEntry(withoutBase(rates(), "mktGmv"), "mkt.rev.take-rate", missing("not-tracked", "meeting"));
    expect(mktGmvToday(noTake, CTX_FR)).toBeNull();
    const spanning = withEntry(withoutBase(rates(), "mktGmv"), "mkt.rev.take-rate", estimated(-1, 2));
    expect(mktGmvToday(spanning, CTX_FR)).toBeNull();
  });

  it("the cost's denominator wins for the new buyers: 18 000 € ÷ 500 → 500, not 3 000 × 20 %", () => {
    const state = withEntry(marketplaceState(), "mkt.buy.cac", measured(ratio(18_000, 500), stripe, { variant: "media-only" }));
    expect(only(mktNewBuyersPerMonth(state, CTX_FR))).toBe(500);
  });

  it("without counts behind the cost, N is the sign-ups of the month × the first order: 3 000 × 20 % = 600", () => {
    expect(only(mktNewBuyersPerMonth(rates(), CTX_FR))).toBeCloseTo(600, 9);
  });

  it("a cost over 0 buyers counts for nothing, and N falls back on the sign-ups", () => {
    const state = withEntry(marketplaceState(), "mkt.buy.cac", measured(ratio(18_000, 0), stripe, { variant: "media-only" }));
    expect(only(mktNewBuyersPerMonth(state, CTX_FR))).toBeCloseTo(600, 9);
  });

  it("N is unknown without the sign-ups' counts or without the first order: never 0", () => {
    const noCounts = withEntry(rates(), "mkt.buy.signup-rate", measured({ kind: "rate", percent: 5 }, stripe));
    expect(mktNewBuyersPerMonth(noCounts, CTX_FR)).toBeNull();
    const noFirstOrder = withEntry(rates(), "mkt.buy.first-order", undefined);
    expect(mktNewBuyersPerMonth(noFirstOrder, CTX_FR)).toBeNull();
  });

  it("a is unknown as soon as one of its three numbers is, and so are R and the GMV when nothing is typed", () => {
    for (const id of ["mkt.rev.frequency", "mkt.rev.aov", "mkt.rev.take-rate"] as const) {
      const state = withEntry(marketplaceState(), id, undefined);
      expect(mktRevenuePerBuyer(state, CTX_FR), id).toBeNull();
    }
    const nothing = withEntry(withoutBase(rates(), "mktNetRevenue", "mktGmv"), "mkt.rev.take-rate", undefined);
    expect(mktNetRevenueToday(nothing, CTX_FR)).toBeNull();
    expect(mktGmvToday(nothing, CTX_FR)).toBeNull();
  });

  it("the active buyers on the 1st are unknown without counts, and a base of 0 is not one", () => {
    expect(mktActiveBuyersStart(withEntry(marketplaceState(), "mkt.buy.churn", measured({ kind: "rate", percent: 4 }, stripe)))).toBeNull();
    expect(mktActiveBuyersStart(withEntry(marketplaceState(), "mkt.buy.churn", measured(ratio(0, 0), stripe)))).toBeNull();
    expect(mktActiveBuyersStart(withEntry(marketplaceState(), "mkt.buy.churn", undefined))).toBeNull();
  });
});

describe("the supply's subscriptions — the example of §22.10.1", () => {
  const state = marketplaceState();

  it("the month's seller sign-ups: 400, and NS, the new paid sellers: 400 × 15 % = 60", () => {
    expect(mktSellerSignups(state)).toBe(400);
    expect(only(mktNewPaidSellers(state, CTX_FR))).toBeCloseTo(60, 9);
  });

  it("S, the subscriptions' MRR: 26 100 €, and 313 200 € a year", () => {
    const s = mktSellerMrrToday(state, CTX_FR);
    expect(only(s)).toBe(26_100);
    expect(only(arrOf(s))).toBe(313_200);
  });

  it("the paid sellers on the 1st: 900, the paid churn's denominator", () => {
    expect(mktPaidSellersStart(state)).toBe(900);
  });

  it("a paid seller costs 200 €: an active seller's 100 € × 30 % sell ÷ 15 % subscribe (D8)", () => {
    expect(only(mktPaidSellerCac(state, CTX_FR))).toBeCloseTo(200, 9);
  });

  it("the cost of a paid seller drops when the conversion rises: 100 × 30 ÷ 20 = 150 €", () => {
    const better = withEntry(state, "mkt.sell.paid-conversion", measured(ratio(84, 420), stripe));
    expect(only(mktPaidSellerCac(better, CTX_FR))).toBeCloseTo(150, 9);
  });

  it("the typed shared MRR wins over the subscription × the paid sellers", () => {
    const typed = marketplaceState();
    typed.snapshots[0]!.base!.mktSellerMrrEnd = 27_000;
    expect(only(mktSellerMrrToday(typed, CTX_FR))).toBe(27_000);
  });

  it("without the shared count, the subscription's own numerator is the MRR (the count is typed once, in either place)", () => {
    expect(only(mktSellerMrrToday(withoutBase(marketplaceState(), "mktSellerMrrEnd"), CTX_FR))).toBe(26_100);
  });

  it("the MRR is typed in the margin's counts too (the shared count has two places): the subscription as an amount still has it", () => {
    const amount = withEntry(withoutBase(marketplaceState(), "mktSellerMrrEnd"), "mkt.sell.arpa", measured({ kind: "amount", amount: 29 }, stripe));
    expect(only(mktSellerMrrToday(amount, CTX_FR))).toBe(26_100);
  });

  it("a subscription typed as an amount, and a margin without counts, leave no MRR to read: unknown, never 0", () => {
    let state = withoutBase(marketplaceState(), "mktSellerMrrEnd");
    state = withEntry(state, "mkt.sell.arpa", measured({ kind: "amount", amount: 29 }, stripe));
    state = withEntry(state, "mkt.sell.gross-margin", estimated(80, 90));
    expect(mktSellerMrrToday(state, CTX_FR)).toBeNull();
  });

  it("an unknown conversion, sign-up count or cost makes NS and the cost unknown", () => {
    expect(mktNewPaidSellers(withEntry(state, "mkt.sell.paid-conversion", undefined), CTX_FR)).toBeNull();
    expect(mktNewPaidSellers(withEntry(state, "mkt.sell.signup-rate", measured({ kind: "rate", percent: 5 }, stripe)), CTX_FR)).toBeNull();
    expect(mktSellerSignups(withEntry(state, "mkt.sell.signup-rate", undefined))).toBeNull();
    expect(mktPaidSellerCac(withEntry(state, "mkt.sell.cac", undefined), CTX_FR)).toBeNull();
    expect(mktPaidSellerCac(withEntry(state, "mkt.sell.first-sale", undefined), CTX_FR)).toBeNull();
    expect(mktPaidSellerCac(withEntry(state, "mkt.sell.paid-conversion", measured(ratio(0, 420), stripe)), CTX_FR), "a conversion of 0 divides nothing").toBeNull();
  });
});

describe("the sellers pay nothing (D9): the five numbers stay stored and read as nothing", () => {
  const state = marketplaceNoSubscriptionsState();

  it("every quantity of the subscriptions is null", () => {
    expect(mktSellerSignups(state)).toBeNull();
    expect(mktNewPaidSellers(state, CTX_FR)).toBeNull();
    expect(mktSellerMrrToday(state, CTX_FR)).toBeNull();
    expect(mktPaidSellersStart(state)).toBeNull();
    expect(mktPaidSellerCac(state, CTX_FR)).toBeNull();
    // They are stored, not erased: the same entries, read with the box ticked, give figures.
    expect(only(mktSellerMrrToday({ ...state, setup: { ...state.setup, sellerSubscriptions: true } }, CTX_FR))).toBe(26_100);
  });

  it("the demand does not move", () => {
    const paying = marketplaceState();
    expect(mktRevenuePerBuyer(state, CTX_FR)).toEqual(mktRevenuePerBuyer(paying, CTX_FR));
    expect(mktNetRevenueToday(state, CTX_FR)).toEqual(mktNetRevenueToday(paying, CTX_FR));
    expect(mktGmvToday(state, CTX_FR)).toEqual(mktGmvToday(paying, CTX_FR));
    expect(mktNewBuyersPerMonth(state, CTX_FR)).toEqual(mktNewBuyersPerMonth(paying, CTX_FR));
    expect(mktActiveBuyersStart(state)).toBe(mktActiveBuyersStart(paying));
    expect(mktUnitEconomics(state, CTX_FR, "demand")).toEqual(mktUnitEconomics(paying, CTX_FR, "demand"));
  });

  it("a box that is not a boolean reads as unticked", () => {
    const odd = { ...marketplaceState(), setup: { ...marketplaceState().setup, sellerSubscriptions: "yes" as unknown as boolean } };
    expect(mktSellerMrrToday(odd, CTX_FR)).toBeNull();
  });
});

describe("mktUnitEconomics — a buyer", () => {
  const state = marketplaceState();
  const buyer = mktUnitEconomics(state, CTX_FR, "demand");

  it("a buyer's margin, lifetime, LTV, payback and LTV:CAC are those of §22.10.2", () => {
    // The margin and the lifetime are not part of the figures the side carries (the money of A20 is MKT-3's), but they are
    // what the LTV and the payback are made of: read here from the same numbers the wiring hands the formulas.
    const economics = sideEconomics(mktRevenuePerBuyer(state, CTX_FR), known(state, "mkt.rev.gross-margin"), known(state, "mkt.buy.churn"), known(state, "mkt.buy.cac"));
    expect([r3(economics.monthlyMargin!.lo), r3(economics.monthlyMargin!.hi)]).toEqual([1.287, 1.521]);
    expect(economics.lifetime).toEqual({ lo: 25, hi: 25 });

    expect(buyer.ltv.kind).toBe("known");
    if (buyer.ltv.kind !== "known") return;
    expect([r2(buyer.ltv.value.lo), r2(buyer.ltv.value.hi)]).toEqual([32.17, 38.03]);
    expect(buyer.ltv.value.lo).toBeCloseTo(1.287 * 25, 9);
    expect(buyer.ltv.value.hi).toBeCloseTo(1.521 * 25, 9);

    expect(buyer.payback.kind).toBe("known");
    if (buyer.payback.kind !== "known") return;
    expect([r2(buyer.payback.value.lo), r2(buyer.payback.value.hi)]).toEqual([19.72, 23.31]);

    expect(buyer.ltvCac.kind).toBe("known");
    if (buyer.ltvCac.kind !== "known") return;
    expect([r2(buyer.ltvCac.value.lo), r2(buyer.ltvCac.value.hi)]).toEqual([1.07, 1.27]);
  });

  it("revenue a month is a (solid: three measured numbers), the three figures approximate (the margin is an estimate)", () => {
    expect(buyer.revenuePerMonth).toEqual({ kind: "known", value: { lo: expect.closeTo(2.34, 9), hi: expect.closeTo(2.34, 9) }, confidence: "solid" });
    expect(buyer.ltv).toMatchObject({ kind: "known", confidence: "approximate" });
    expect(buyer.payback).toMatchObject({ kind: "known", confidence: "approximate" });
    expect(buyer.ltvCac).toMatchObject({ kind: "known", confidence: "approximate" });
  });

  it("the cost's variant travels with the figures, and a buyer has no cost of its own to show (supply only)", () => {
    expect(buyer.cacVariant).toBe("media-only");
    expect(buyer.cac).toBeUndefined();
    const plus = withEntry(state, "mkt.buy.cac", measured(ratio(18_000, 600), stripe, { variant: "plus-team" }));
    expect(mktUnitEconomics(plus, CTX_FR, "demand").cacVariant).toBe("plus-team");
    expect(mktUnitEconomics(withEntry(state, "mkt.buy.cac", undefined), CTX_FR, "demand").cacVariant).toBeNull();
  });

  it("with a measured margin the buyer's figures turn solid", () => {
    const measuredMargin = withEntry(state, "mkt.rev.gross-margin", measured(ratio(60, 100), { kind: "tool", tool: "spreadsheet" }));
    const economics = mktUnitEconomics(measuredMargin, CTX_FR, "demand");
    expect(economics.ltv).toMatchObject({ kind: "known", confidence: "solid" });
    expect(economics.payback).toMatchObject({ kind: "known", confidence: "solid" });
    expect(economics.ltvCac).toMatchObject({ kind: "known", confidence: "solid" });
  });

  it("a missing take rate leaves a, the LTV, the payback and the LTV:CAC uncomputable, each naming it — never 0", () => {
    const economics = mktUnitEconomics(withEntry(state, "mkt.rev.take-rate", undefined), CTX_FR, "demand");
    expect(economics.revenuePerMonth).toEqual({ kind: "uncomputable", missing: ["mkt.rev.take-rate"] });
    expect(economics.ltv).toEqual({ kind: "uncomputable", missing: ["mkt.rev.take-rate"] });
    expect(economics.payback).toEqual({ kind: "uncomputable", missing: ["mkt.rev.take-rate"] });
    expect(economics.ltvCac).toEqual({ kind: "uncomputable", missing: ["mkt.rev.take-rate"] });
  });

  it("never a fallback on revenue: a missing margin leaves the three figures uncomputable and a known", () => {
    const economics = mktUnitEconomics(withEntry(state, "mkt.rev.gross-margin", missing("no-access", "meeting")), CTX_FR, "demand");
    expect(economics.revenuePerMonth.kind).toBe("known");
    expect(economics.ltv).toEqual({ kind: "uncomputable", missing: ["mkt.rev.gross-margin"] });
    expect(economics.payback).toEqual({ kind: "uncomputable", missing: ["mkt.rev.gross-margin"] });
    expect(economics.ltvCac).toEqual({ kind: "uncomputable", missing: ["mkt.rev.gross-margin"] });
  });

  it("a margin spanning 0 has no payback, and the figure names the margin", () => {
    const economics = mktUnitEconomics(withEntry(state, "mkt.rev.gross-margin", estimated(-5, 10)), CTX_FR, "demand");
    expect(economics.payback).toEqual({ kind: "uncomputable", missing: ["mkt.rev.gross-margin"] });
    expect(economics.ltv.kind).toBe("known");
  });

  it("a missing cost leaves the payback and the LTV:CAC uncomputable, and the LTV known", () => {
    const economics = mktUnitEconomics(withEntry(state, "mkt.buy.cac", undefined), CTX_FR, "demand");
    expect(economics.ltv.kind).toBe("known");
    expect(economics.payback).toEqual({ kind: "uncomputable", missing: ["mkt.buy.cac"] });
    expect(economics.ltvCac).toEqual({ kind: "uncomputable", missing: ["mkt.buy.cac"] });
  });

  it("a missing churn leaves the LTV and the LTV:CAC uncomputable, and the payback known", () => {
    const economics = mktUnitEconomics(withEntry(state, "mkt.buy.churn", undefined), CTX_FR, "demand");
    expect(economics.payback.kind).toBe("known");
    expect(economics.ltv).toEqual({ kind: "uncomputable", missing: ["mkt.buy.churn"] });
    expect(economics.ltvCac).toEqual({ kind: "uncomputable", missing: ["mkt.buy.churn"] });
  });
});

describe("mktUnitEconomics — a paid seller", () => {
  const state = marketplaceState();
  const seller = mktUnitEconomics(state, CTX_FR, "supply");

  it("a paid seller's cost, margin, lifetime, LTV, payback and LTV:CAC are those of §22.10.2", () => {
    const cost = mktPaidSellerCac(state, CTX_FR);
    const economics = sideEconomics(known(state, "mkt.sell.arpa"), known(state, "mkt.sell.gross-margin"), known(state, "mkt.sell.paid-churn"), cost);
    expect(r2(only(economics.monthlyMargin))).toBe(24.65);
    expect(r2(only(economics.lifetime))).toBe(33.33);

    expect(seller.cac).toMatchObject({ kind: "known", confidence: "solid" });
    expect(only(seller.cac?.kind === "known" ? seller.cac.value : null)).toBeCloseTo(200, 9);
    expect(seller.ltv.kind).toBe("known");
    expect(seller.payback.kind).toBe("known");
    expect(seller.ltvCac.kind).toBe("known");
    if (seller.ltv.kind !== "known" || seller.payback.kind !== "known" || seller.ltvCac.kind !== "known") return;
    expect(r2(only(seller.ltv.value))).toBe(821.67);
    expect(r2(only(seller.payback.value))).toBe(8.11);
    expect(r2(only(seller.ltvCac.value))).toBe(4.11);
  });

  it("revenue a month is the subscription: 29 €, and every figure is solid (all measured, a mature cohort)", () => {
    expect(seller.revenuePerMonth).toMatchObject({ kind: "known", confidence: "solid" });
    expect(only(seller.revenuePerMonth.kind === "known" ? seller.revenuePerMonth.value : null)).toBe(29);
    for (const figure of [seller.ltv, seller.payback, seller.ltvCac]) expect(figure).toMatchObject({ kind: "known", confidence: "solid" });
    expect(seller.cacVariant).toBe("media-only");
  });

  it("the cost, the payback and the LTV:CAC turn approximate on a cohort still filling up, the LTV stays solid", () => {
    // July is not mature for the 60-day window of a first sale on 24 September: the conversion and the first sale are approximate.
    const young = structuredClone(state);
    young.snapshots[0]!.cohortMonth = "2026-07";
    const economics = mktUnitEconomics(young, CTX_FR, "supply");
    expect(economics.cac).toMatchObject({ kind: "known", confidence: "approximate" });
    expect(economics.payback).toMatchObject({ kind: "known", confidence: "approximate" });
    expect(economics.ltvCac).toMatchObject({ kind: "known", confidence: "approximate" });
    expect(economics.ltv).toMatchObject({ kind: "known", confidence: "solid" });
  });

  it("a missing subscription's margin leaves the LTV, the payback and the LTV:CAC uncomputable, and the cost known (it reads no margin)", () => {
    const economics = mktUnitEconomics(withEntry(state, "mkt.sell.gross-margin", undefined), CTX_FR, "supply");
    expect(economics.cac?.kind).toBe("known");
    expect(economics.revenuePerMonth.kind).toBe("known");
    expect(economics.ltv).toEqual({ kind: "uncomputable", missing: ["mkt.sell.gross-margin"] });
    expect(economics.payback).toEqual({ kind: "uncomputable", missing: ["mkt.sell.gross-margin"] });
    expect(economics.ltvCac).toEqual({ kind: "uncomputable", missing: ["mkt.sell.gross-margin"] });
  });

  it("a missing first sale leaves the cost uncomputable, naming it, and the payback and LTV:CAC with it", () => {
    const economics = mktUnitEconomics(withEntry(state, "mkt.sell.first-sale", missing("not-tracked", "sprint")), CTX_FR, "supply");
    expect(economics.cac).toEqual({ kind: "uncomputable", missing: ["mkt.sell.first-sale"] });
    expect(economics.payback).toEqual({ kind: "uncomputable", missing: ["mkt.sell.first-sale"] });
    expect(economics.ltvCac).toEqual({ kind: "uncomputable", missing: ["mkt.sell.first-sale"] });
    expect(economics.ltv.kind).toBe("known");
  });

  it("a conversion of 0 makes the cost uncomputable and names it: every input is known, one divides nothing", () => {
    const economics = mktUnitEconomics(withEntry(state, "mkt.sell.paid-conversion", measured(ratio(0, 420), stripe)), CTX_FR, "supply");
    expect(economics.cac).toEqual({ kind: "uncomputable", missing: ["mkt.sell.paid-conversion"] });
    expect(economics.payback).toEqual({ kind: "uncomputable", missing: ["mkt.sell.paid-conversion"] });
  });

  it("no cost typed, no variant: null on either side", () => {
    expect(mktUnitEconomics(withEntry(state, "mkt.sell.cac", undefined), CTX_FR, "supply").cacVariant).toBeNull();
  });

  it("the cost's variant is the active seller's cost's", () => {
    const loaded = withEntry(state, "mkt.sell.cac", measured(ratio(12_000, 120), { kind: "tool", tool: "spreadsheet" }, { variant: "fully-loaded" }));
    expect(mktUnitEconomics(loaded, CTX_FR, "supply").cacVariant).toBe("fully-loaded");
  });

  it("without subscriptions every figure is uncomputable with nothing missing: never shown", () => {
    const none = mktUnitEconomics(marketplaceNoSubscriptionsState(), CTX_FR, "supply");
    const nothing = { kind: "uncomputable", missing: [] };
    expect(none).toMatchObject({ revenuePerMonth: nothing, ltv: nothing, payback: nothing, ltvCac: nothing, cac: nothing });
  });

  it("the sides never read each other: moving a seller number moves no buyer figure, and the reverse", () => {
    const sellerMoved = withEntry(state, "mkt.sell.arpa", measured(ratio(31_500, 900), stripe));
    expect(mktUnitEconomics(sellerMoved, CTX_FR, "demand")).toEqual(mktUnitEconomics(state, CTX_FR, "demand"));
    expect(mktUnitEconomics(sellerMoved, CTX_FR, "supply")).not.toEqual(seller);
    const buyerMoved = withEntry(state, "mkt.rev.take-rate", measured(ratio(36_000, 273_780), stripe));
    expect(mktUnitEconomics(buyerMoved, CTX_FR, "supply")).toEqual(seller);
    expect(mktUnitEconomics(buyerMoved, CTX_FR, "demand")).not.toEqual(mktUnitEconomics(state, CTX_FR, "demand"));
  });
});
