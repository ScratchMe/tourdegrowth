import { derivedShapeOf } from "./catalog-shape";
import { div, mul, point, scale } from "./interval";
import { newPaidSellersPerMonth, paidSellerCac, revenuePerBuyer, sideEconomics } from "./mkt-model";
import { mktSetup } from "./setup-type";
import { knownSharedCount } from "./shared-counts";
import type { DerivedId, DerivedValue, EngineCalcContext, EngineState, Interval, Known, MetricId, MktSide, MktUnitEconomics } from "./types";
import { confidenceOfInputs, missingOf } from "./unit-economics";
import { countsOf, currentSnapshot, entryOf, knownIn } from "./values";

/**
 * mkt-economics.ts — a marketplace's base quantities and the unit economics of each side, read from the state (engine
 * spec §22.5.1 and §22.5.3, A23 MKT-2; answers C64, C66, C67, C70 and C93 of 2026-10-04).
 *
 * `mkt-model.ts` holds the formulas on plain intervals; this module is the wiring that hands them the person's
 * numbers: a, the revenue one active buyer brings a month; R, the month's net revenue; the GMV; N, the new buyers a
 * month; and on the supply side, NS, the new paid sellers, S, the sellers' subscription MRR, and what a paid seller
 * costs. Each is `null` when a number it needs is unknown, never 0, and each of the supply's is `null` too when the
 * sellers pay no subscription (D9): the numbers stay stored and read as nothing.
 *
 * The callers have checked the type, as `app.ts` does: nothing here asks `isMarketplace`. The setup's boxes are read
 * through `mktSetup`, which does not trust a stored value.
 */

type Knowns = Partial<Record<MetricId, Known>>;

function known(state: EngineState, id: MetricId, ctx: EngineCalcContext): Interval | null {
  const k = knownIn(state, id, ctx);
  return k.kind === "known" ? k.value : null;
}

/** Whether the sellers pay a subscription (D9): the setup's box, off by default. */
function sellersPay(state: EngineState): boolean {
  return mktSetup(state.setup).sellerSubscriptions;
}

/** The count behind a measured ratio's denominator when it is a base to count on: more than 0, as `readingValue` reads it. */
function baseOf(state: EngineState, id: MetricId): number | null {
  const denominator = countsOf(entryOf(currentSnapshot(state), id))?.denominator;
  return denominator !== undefined && denominator > 0 ? denominator : null;
}

// --- The demand ------------------------------------------------------------------

/** a: what one active buyer brings a month — `revenuePerBuyer` on the frequency, the basket and the take rate. */
export function mktRevenuePerBuyer(state: EngineState, ctx: EngineCalcContext): Interval | null {
  return revenuePerBuyer(known(state, "mkt.rev.frequency", ctx), known(state, "mkt.rev.aov", ctx), known(state, "mkt.rev.take-rate", ctx));
}

/**
 * R: the month's net revenue — the shared count when it is typed (the take rate's numerator, or the shared base), else
 * a × the active buyers at the month's end, which is the frequency's denominator.
 */
export function mktNetRevenueToday(state: EngineState, ctx: EngineCalcContext): Interval | null {
  const typed = knownSharedCount(currentSnapshot(state), "mktNetRevenue");
  if (typed) return point(typed.value);
  const a = mktRevenuePerBuyer(state, ctx);
  const buyers = baseOf(state, "mkt.rev.frequency");
  return a && buyers !== null ? scale(a, buyers) : null;
}

/** The GMV of the month — the shared count when it is typed, else R ÷ (take rate / 100). */
export function mktGmvToday(state: EngineState, ctx: EngineCalcContext): Interval | null {
  const typed = knownSharedCount(currentSnapshot(state), "mktGmv");
  if (typed) return point(typed.value);
  const revenue = mktNetRevenueToday(state, ctx);
  const take = known(state, "mkt.rev.take-rate", ctx);
  return revenue && take ? div(revenue, scale(take, 1 / 100)) : null;
}

/**
 * N: the new buyers in the month — the cost per buyer's denominator when it is typed as counts (and more than 0), else
 * the buyer sign-ups of the month (the sign-up rate's numerator) × the first order ÷ 100.
 */
export function mktNewBuyersPerMonth(state: EngineState, ctx: EngineCalcContext): Interval | null {
  const snapshot = currentSnapshot(state);
  const cost = countsOf(entryOf(snapshot, "mkt.buy.cac"));
  if (cost && cost.denominator > 0) return point(cost.denominator);
  const signups = countsOf(entryOf(snapshot, "mkt.buy.signup-rate"))?.numerator;
  const firstOrder = known(state, "mkt.buy.first-order", ctx);
  return signups !== undefined && firstOrder ? mul(point(signups), scale(firstOrder, 1 / 100)) : null;
}

/** The active buyers on the 1st of the month: the buyers' churn's denominator, or null. */
export function mktActiveBuyersStart(state: EngineState): number | null {
  return baseOf(state, "mkt.buy.churn");
}

// --- The supply's subscriptions (C64, C93) — null when the sellers pay nothing ----

/** The month's seller sign-ups: the sellers' sign-up rate's numerator, or null. */
export function mktSellerSignups(state: EngineState): number | null {
  if (!sellersPay(state)) return null;
  return countsOf(entryOf(currentSnapshot(state), "mkt.sell.signup-rate"))?.numerator ?? null;
}

/** NS: the new paid sellers a month — the month's seller sign-ups × the conversion to a paid seller. */
export function mktNewPaidSellers(state: EngineState, ctx: EngineCalcContext): Interval | null {
  const signups = mktSellerSignups(state);
  return signups === null ? null : newPaidSellersPerMonth(point(signups), known(state, "mkt.sell.paid-conversion", ctx));
}

/**
 * S: the sellers' subscription MRR — the shared count when it is typed, else the subscription × the paid sellers:
 * the paid churn's denominator, or the subscription's own, as `scenario.ts#mrrToday` reads the SaaS's customers
 * (the churn's denominator first, then ARPA's). The fallback serves a subscription typed as a value (29 €) with the
 * paid churn typed as counts (27 ÷ 900): no entry then carries the MRR itself.
 */
export function mktSellerMrrToday(state: EngineState, ctx: EngineCalcContext): Interval | null {
  if (!sellersPay(state)) return null;
  const typed = knownSharedCount(currentSnapshot(state), "mktSellerMrrEnd");
  if (typed) return point(typed.value);
  const subscription = known(state, "mkt.sell.arpa", ctx);
  const paid = baseOf(state, "mkt.sell.paid-churn") ?? baseOf(state, "mkt.sell.arpa");
  return subscription && paid !== null ? scale(subscription, paid) : null;
}

/** The paid sellers on the 1st of the month: the paid sellers' churn's denominator, or null. */
export function mktPaidSellersStart(state: EngineState): number | null {
  return sellersPay(state) ? baseOf(state, "mkt.sell.paid-churn") : null;
}

/** What a paid seller costs (D8): the cost of an active seller × the first sale ÷ the paid conversion, on the same cohort. */
export function mktPaidSellerCac(state: EngineState, ctx: EngineCalcContext): Interval | null {
  if (!sellersPay(state)) return null;
  return paidSellerCac(known(state, "mkt.sell.cac", ctx), known(state, "mkt.sell.first-sale", ctx), known(state, "mkt.sell.paid-conversion", ctx));
}

// --- The unit economics of a side ---------------------------------------------------

const knownsOf = (state: EngineState, ctx: EngineCalcContext, ids: readonly MetricId[]): Knowns => Object.fromEntries(ids.map((id) => [id, knownIn(state, id, ctx)]));

function valueIn(knowns: Knowns, id: MetricId): Interval | null {
  const k = knowns[id];
  return k?.kind === "known" ? k.value : null;
}

/** One of the three computed figures of a side: `solid` when every input of the figure is, `approximate` otherwise, else uncomputable and naming the inputs it lacks (`unit-economics.ts`' rules). */
function derivedFigure(id: DerivedId, value: Interval | null, knowns: Knowns): DerivedValue {
  return value ? { kind: "known", value, confidence: confidenceOfInputs(id, knowns) } : { kind: "uncomputable", missing: missingOf(id, knowns) };
}

/**
 * A figure that no computed figure of the catalogue is named after (a, what a paid seller costs): the same two rules
 * on the inputs it reads. When every input is known and the figure still is not (a divisor spanning 0), that input is
 * named, as `missingOf` does, so the sentence never ends on nothing.
 */
function ownFigure(value: Interval | null, inputs: readonly MetricId[], knowns: Knowns): DerivedValue {
  if (value) return { kind: "known", value, confidence: inputs.every((id) => knowns[id]?.kind === "known" && knowns[id].confidence === "solid") ? "solid" : "approximate" };
  const unknown = inputs.filter((id) => knowns[id]?.kind !== "known");
  if (unknown.length > 0) return { kind: "uncomputable", missing: unknown };
  return {
    kind: "uncomputable",
    missing: inputs.filter((id) => {
      const k = knowns[id];
      return k?.kind === "known" && k.value.lo <= 0 && k.value.hi >= 0;
    }),
  };
}

function demandEconomics(state: EngineState, ctx: EngineCalcContext): MktUnitEconomics {
  const knowns = knownsOf(state, ctx, derivedShapeOf("mkt.rev.ltv-cac").inputs);
  const a = mktRevenuePerBuyer(state, ctx);
  const economics = sideEconomics(a, valueIn(knowns, "mkt.rev.gross-margin"), valueIn(knowns, "mkt.buy.churn"), valueIn(knowns, "mkt.buy.cac"));
  return {
    cacVariant: entryOf(currentSnapshot(state), "mkt.buy.cac")?.variant ?? null,
    revenuePerMonth: ownFigure(a, ["mkt.rev.frequency", "mkt.rev.aov", "mkt.rev.take-rate"], knowns),
    ltv: derivedFigure("mkt.rev.ltv", economics.ltv, knowns),
    payback: derivedFigure("mkt.rev.cac-payback", economics.payback, knowns),
    ltvCac: derivedFigure("mkt.rev.ltv-cac", economics.ltvCac, knowns),
  };
}

function supplyEconomics(state: EngineState, ctx: EngineCalcContext): MktUnitEconomics {
  const cacVariant = entryOf(currentSnapshot(state), "mkt.sell.cac")?.variant ?? null;
  // The sellers pay nothing: the paid seller has no economics, and none is ever shown (D9).
  if (!sellersPay(state)) {
    const none = (): DerivedValue => ({ kind: "uncomputable", missing: [] });
    return { cacVariant, revenuePerMonth: none(), ltv: none(), payback: none(), ltvCac: none(), cac: none() };
  }
  const knowns = knownsOf(state, ctx, derivedShapeOf("mkt.sell.ltv-cac").inputs);
  const cost = mktPaidSellerCac(state, ctx);
  const subscription = valueIn(knowns, "mkt.sell.arpa");
  const economics = sideEconomics(subscription, valueIn(knowns, "mkt.sell.gross-margin"), valueIn(knowns, "mkt.sell.paid-churn"), cost);
  return {
    cacVariant,
    revenuePerMonth: ownFigure(subscription, ["mkt.sell.arpa"], knowns),
    ltv: derivedFigure("mkt.sell.ltv", economics.ltv, knowns),
    payback: derivedFigure("mkt.sell.cac-payback", economics.payback, knowns),
    ltvCac: derivedFigure("mkt.sell.ltv-cac", economics.ltvCac, knowns),
    cac: ownFigure(cost, ["mkt.sell.cac", "mkt.sell.first-sale", "mkt.sell.paid-conversion"], knowns),
  };
}

/**
 * What a customer of one side is worth (§22.5.3): `sideEconomics` of `mkt-model.ts` on the side's own revenue a
 * month, margin, churn and cost, each as a `DerivedValue`. The demand's revenue is a, its margin the commissions'
 * (D7); the supply's is the subscription, its margin the subscriptions' and its cost what a paid seller costs (D8).
 * The supply of a marketplace whose sellers pay nothing has none: every figure is uncomputable with nothing missing,
 * and none is ever shown.
 */
export function mktUnitEconomics(state: EngineState, ctx: EngineCalcContext, side: MktSide): MktUnitEconomics {
  return side === "demand" ? demandEconomics(state, ctx) : supplyEconomics(state, ctx);
}
