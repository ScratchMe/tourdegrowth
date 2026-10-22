import { MKT_DEMAND_LEVER_IDS, MKT_SUPPLY_LEVER_IDS } from "./catalog-shape";
import { div, mapBounds, mul, point, scale } from "./interval";
import { mktGmvToday, mktNetRevenueToday, mktNewBuyersPerMonth, mktNewPaidSellers, mktRevenuePerBuyer, mktSellerMrrToday } from "./mkt-economics";
import { demandPath, marketplaceRevenuePath, paidSellerCac, sellerPath, sideEconomics } from "./mkt-model";
import { acquisitionSpend, arrOf, cashTiedUp, paybackLimit, paybackWarning, type MoneyKpis } from "./money";
import { correlatedRatio, leverViews, type LeverView } from "./scenario";
import { mktSetup } from "./setup-type";
import type { EngineCalcContext, EngineState, Interval, LeverId, MetricId, MktDemandLeverId, MktSide } from "./types";
import { countsOf, currentSnapshot, entryOf, knownIn } from "./values";

/**
 * mkt-scenario.ts — « Et si ? », a marketplace, one scenario per side and the total (engine spec §22.5.4, A23 MKT-3;
 * Antoine's answers C64 to C70 and C93 of 2026-10-04).
 *
 * The same panel and the same sliders as self-serve (`scenario.ts`), on the marketplace's levers. Each side has its own
 * scenario, built apart (C70, §18.6.1's rule: no function sees the levers of both sides), and the total only adds the
 * two curves (`mkt-model.ts#marketplaceRevenuePath`). Every rule is printed with the result (`assumptions`):
 *
 * - The demand: N' = N × the sign-up, referral, first-order and fill-rate factors (the referred come on top of the others,
 *   through visitors who sign up at today's rate, so the visitors grow with them; the fill rate counts for the NEW
 *   buyers only, C68: a minimum); a' = a × the frequency, basket and take-rate factors, and those three apply to EVERY
 *   buyer from the next month (C69); the net revenue is kept at 1 − the buyers' churn, the new buyers' revenue on top
 *   (`demandPath`). The cost of a buyer falls with N' at the same spend.
 * - The supply, when the sellers pay a subscription: NS' = NS × the conversion factor; the price applies to EVERY paid
 *   seller from the next month (C69); the MRR of the subscriptions is kept at 1 − the paid sellers' churn, the new
 *   subscribers on top (`sellerPath`). What a paid seller costs falls when the conversion rises (D8): the cost of an
 *   active seller × the first sale ÷ the new conversion. Nothing else on the supply is priced (C67, D4).
 * - The total adds the two curves, point by point, today and with the what-ifs of both sides together.
 *
 * Intervals all the way, like `scenario.ts`: an estimate stays a range, and every function of the model is monotonic in
 * its inputs. `null` is « unknown », never 0.
 */

/** The ten rules a marketplace's what-if can print, in the order a reader meets them; only those that applied. */
export type MktScenarioAssumption =
  | "signup-same-visitors"
  | "referral-on-top" // the self-serve words
  | "fill-new-buyers-only" // C68
  | "new-buyer-spends-average"
  | "money-levers-all-buyers" // C69
  | "price-all-paid-sellers" // C69, the supply's price
  | "same-spend"
  | "active-twelve-months"
  | "supply-priced-by-subscriptions" // C67
  | "twelve-months";

const ASSUMPTION_ORDER: readonly MktScenarioAssumption[] = [
  "signup-same-visitors",
  "referral-on-top",
  "fill-new-buyers-only",
  "new-buyer-spends-average",
  "money-levers-all-buyers",
  "price-all-paid-sellers",
  "same-spend",
  "active-twelve-months",
  "supply-priced-by-subscriptions",
  "twelve-months",
];

export interface MktScenarioKpis extends MoneyKpis {
  /** R (demand) or S (supply): the side's revenue this month (the MRR's place). */
  mrr: Interval | null;
  /** N' × a' (demand) or NS' × price' (supply): the side's new revenue in a month. */
  newMrr: Interval | null;
  /** The side's revenue in twelve months: its path's last point. */
  mrr12: Interval | null;
  revenuePerUnit: Interval | null; // a, or the subscription price
  gmv: Interval | null; // demand only, today only
  cac: Interval | null; // a buyer's, or a paid seller's
  ltv: Interval | null;
  payback: Interval | null;
}
// MoneyKpis also demands, and this module fills: `mrrPath`, the side's 13 points (`demandPath` or `sellerPath`);
// `monthlyMargin`, `sideEconomics(…).monthlyMargin`, the payback graph's slope; `lifetime`, `afterPayback`, `loss` and
// `ltvCac`, from the same `SideEconomics`.

/** The month's funnel of one side, today and with the what-ifs (the panel's « Ton funnel du mois »). null = unknown. */
export interface MktScenarioFunnel {
  /** The month's visitors: the sign-up rate's denominator (demand; with the what-ifs, grown by the referred sign-ups' factor, as self-serve's are), the seller sign-up rate's (supply). */
  visitors: Interval | null;
  /** The month's sign-ups: the sign-up rate's numerator × fSignup × fRefSignups (demand), the seller sign-ups (supply). */
  signups: Interval | null;
  /** Demand only: the referred among them (signups × referred share / 100). null for the supply. */
  referred: Interval | null;
  /** N (new buyers) or NS (new paid sellers), and their projection N × fN, NS × fConv. */
  newUnits: Interval | null;
}

export interface MktScenario {
  side: MktSide;
  levers: LeverView[];
  moved: LeverId[];
  today: { funnel: MktScenarioFunnel; kpis: MktScenarioKpis };
  projected: { funnel: MktScenarioFunnel; kpis: MktScenarioKpis };
  assumptions: MktScenarioAssumption[];
}

function known(state: EngineState, id: MetricId, ctx: EngineCalcContext): Interval | null {
  const k = knownIn(state, id, ctx);
  return k.kind === "known" ? k.value : null;
}

const one = point(1);

/** The funnel and the money of a side whose figures are all unknown: what a supply without subscriptions shows. */
function nothing(): { funnel: MktScenarioFunnel; kpis: MktScenarioKpis } {
  return {
    funnel: { visitors: null, signups: null, referred: null, newUnits: null },
    kpis: {
      mrr: null,
      newMrr: null,
      mrr12: null,
      revenuePerUnit: null,
      gmv: null,
      cac: null,
      ltv: null,
      payback: null,
      arr: null,
      arr12: null,
      mrrPath: null,
      ltvCac: null,
      lifetime: null,
      monthlyMargin: null,
      afterPayback: null,
      loss: null,
      spend: null,
      cash: null,
      warning: null,
    },
  };
}

/** The target of a lever the person knows today, else null: `leverViews` already drops a target on an unknown lever. */
const targetOf = (levers: readonly LeverView[], id: LeverId): number | null => levers.find((l) => l.id === id)?.target ?? null;

/** The ratio between a lever's target and today's value (« × 13/12 »), or 1 when it didn't move. */
function ratioOf(levers: readonly LeverView[], id: LeverId, today: Interval | null): Interval {
  const target = targetOf(levers, id);
  return today && target !== null ? correlatedRatio(today, () => target) : one;
}

function buildDemand(state: EngineState, targets: Partial<Record<LeverId, number>>, ctx: EngineCalcContext): MktScenario {
  const levers = leverViews(state, targets, ctx, MKT_DEMAND_LEVER_IDS);
  const moved = levers.filter((l) => l.target !== null).map((l) => l.id);
  const snapshot = currentSnapshot(state);
  const assumptions = new Set<MktScenarioAssumption>();
  const t = (id: MktDemandLeverId) => targetOf(levers, id);
  const k = (id: MetricId) => known(state, id, ctx);

  // --- The lever factors, each one's own effect (§22.5.4) --------------------------------
  const signupRate = k("mkt.buy.signup-rate");
  const tSignup = t("mkt.buy.signup-rate");
  const fSignup = signupRate && tSignup !== null ? (div(point(tSignup), signupRate) ?? one) : one;
  if (tSignup !== null) assumptions.add("signup-same-visitors");

  // S' = S × (1 − r) ÷ (1 − t): the non-referred stay, the referred make up the new share.
  const referredShare = k("mkt.buy.referred-share");
  const tRef = t("mkt.buy.referred-share");
  const fRef = referredShare && tRef !== null ? correlatedRatio(mapBounds(referredShare, (x) => 1 - x / 100), () => 1 - Math.min(tRef, 99) / 100) : one;
  const fRefSignups = mapBounds(fRef, (f) => 1 / f);
  if (tRef !== null) assumptions.add("referral-on-top");

  const fFirst = ratioOf(levers, "mkt.buy.first-order", k("mkt.buy.first-order"));
  // The fill rate counts for the new buyers only (C68): a factor on N, never on a.
  const fFill = ratioOf(levers, "mkt.liq.fill-rate", k("mkt.liq.fill-rate"));
  if (t("mkt.liq.fill-rate") !== null) assumptions.add("fill-new-buyers-only");
  const fN = mul(mul(mul(fSignup, fRefSignups), fFirst), fFill);

  // Frequency, basket and take rate apply to every buyer from the next month (C69): a factor on a, and on the whole base.
  const fA = mul(mul(ratioOf(levers, "mkt.rev.frequency", k("mkt.rev.frequency")), ratioOf(levers, "mkt.rev.aov", k("mkt.rev.aov"))), ratioOf(levers, "mkt.rev.take-rate", k("mkt.rev.take-rate")));
  if (t("mkt.rev.frequency") !== null || t("mkt.rev.aov") !== null || t("mkt.rev.take-rate") !== null) assumptions.add("money-levers-all-buyers");

  const tChurn = t("mkt.buy.churn");
  const churnToday = k("mkt.buy.churn");
  const margin = k("mkt.rev.gross-margin");
  const cacToday = k("mkt.buy.cac");
  const revenueToday = mktNetRevenueToday(state, ctx);
  const newBuyers = mktNewBuyersPerMonth(state, ctx);
  const perBuyer = mktRevenuePerBuyer(state, ctx);
  const signups = countsOf(entryOf(snapshot, "mkt.buy.signup-rate"));
  const limit = paybackLimit(state.setup.runwayMonths);
  // A month of acquisition, at today's spend whatever the what-ifs (same spend, §20.6).
  const spend = acquisitionSpend(newBuyers, cacToday);
  const moves = fN.lo !== 1 || fN.hi !== 1;

  function column(projected: boolean): { funnel: MktScenarioFunnel; kpis: MktScenarioKpis } {
    const n = newBuyers && projected ? mul(newBuyers, fN) : newBuyers;
    const a = perBuyer && projected ? mul(perBuyer, fA) : perBuyer;
    const newMrr = n && a ? mul(n, a) : null;
    if (newMrr) assumptions.add("new-buyer-spends-average");
    const churn = projected && tChurn !== null ? point(tChurn) : churnToday;
    // One loop for the curve and the revenue in twelve months: its last point.
    const path = demandPath(revenueToday, newMrr, churn, projected ? fA : one);
    const mrr12 = path ? path[12]! : null;
    // Same spend, more new buyers: the cost of a buyer falls in the same proportion.
    const cac = projected && moves && cacToday ? div(cacToday, fN) : cacToday;
    if (projected && moves && cacToday) assumptions.add("same-spend");
    const economics = sideEconomics(a, margin, churn, cac);

    const shareNow = projected && tRef !== null ? point(tRef) : referredShare;
    const signupsNow = signups ? (projected ? mul(mul(point(signups.numerator), fSignup), fRefSignups) : point(signups.numerator)) : null;
    return {
      funnel: {
        // The referred arrive through visitors who sign up at today's rate: the visitors grow with them, like self-serve's (scenario.ts).
        visitors: signups ? mul(point(signups.denominator), projected ? fRefSignups : one) : null,
        signups: signupsNow,
        referred: signupsNow && shareNow ? mul(signupsNow, scale(shareNow, 1 / 100)) : null,
        newUnits: n,
      },
      kpis: {
        mrr: revenueToday,
        newMrr,
        mrr12,
        revenuePerUnit: a,
        gmv: projected ? null : mktGmvToday(state, ctx),
        cac,
        ltv: economics.ltv,
        payback: economics.payback,
        arr: arrOf(revenueToday),
        arr12: arrOf(mrr12),
        mrrPath: path,
        ltvCac: economics.ltvCac,
        lifetime: economics.lifetime,
        monthlyMargin: economics.monthlyMargin,
        afterPayback: economics.afterPayback,
        loss: economics.loss,
        spend,
        // A buyer's margin pays the cost back linearly and the buyers who leave stretch it: a floor (§22.5.3).
        cash: cashTiedUp(spend, economics.payback, false),
        // C49: against the team's runway, or the 30-month floor when it typed none.
        warning: paybackWarning(economics.payback, economics.loss, limit),
      },
    };
  }

  const result = { side: "demand" as const, levers, moved, today: column(false), projected: column(true) };
  assumptions.add("active-twelve-months");
  assumptions.add("twelve-months");
  return { ...result, assumptions: ASSUMPTION_ORDER.filter((a) => assumptions.has(a)) };
}

function buildSupply(state: EngineState, targets: Partial<Record<LeverId, number>>, ctx: EngineCalcContext): MktScenario {
  // The sellers pay nothing (D9): the supply has no money, no lever and no rule — the screen says why.
  if (!mktSetup(state.setup).sellerSubscriptions) return { side: "supply", levers: [], moved: [], today: nothing(), projected: nothing(), assumptions: [] };

  const levers = leverViews(state, targets, ctx, MKT_SUPPLY_LEVER_IDS);
  const moved = levers.filter((l) => l.target !== null).map((l) => l.id);
  const snapshot = currentSnapshot(state);
  const assumptions = new Set<MktScenarioAssumption>(["supply-priced-by-subscriptions", "twelve-months"]);
  const k = (id: MetricId) => known(state, id, ctx);

  const conversion = k("mkt.sell.paid-conversion");
  const tConversion = targetOf(levers, "mkt.sell.paid-conversion");
  const fConversion = ratioOf(levers, "mkt.sell.paid-conversion", conversion);
  const price = k("mkt.sell.arpa");
  const fPrice = ratioOf(levers, "mkt.sell.arpa", price);
  if (targetOf(levers, "mkt.sell.arpa") !== null) assumptions.add("price-all-paid-sellers");

  const tChurn = targetOf(levers, "mkt.sell.paid-churn");
  const churnToday = k("mkt.sell.paid-churn");
  const margin = k("mkt.sell.gross-margin");
  const activeSellerCac = k("mkt.sell.cac");
  const firstSale = k("mkt.sell.first-sale");
  const mrrToday = mktSellerMrrToday(state, ctx);
  const newPaid = mktNewPaidSellers(state, ctx);
  const signups = countsOf(entryOf(snapshot, "mkt.sell.signup-rate"));
  const limit = paybackLimit(state.setup.runwayMonths);
  // A month of acquisition, at today's cost of a paid seller whatever the what-ifs (same spend, §20.6).
  const costToday = paidSellerCac(activeSellerCac, firstSale, conversion);
  const spend = acquisitionSpend(newPaid, costToday);

  function column(projected: boolean): { funnel: MktScenarioFunnel; kpis: MktScenarioKpis } {
    const ns = newPaid && projected ? mul(newPaid, fConversion) : newPaid;
    const subscription = price && projected ? mul(price, fPrice) : price;
    const newMrr = ns && subscription ? mul(ns, subscription) : null;
    const churn = projected && tChurn !== null ? point(tChurn) : churnToday;
    const path = sellerPath(mrrToday, newMrr, churn, projected ? fPrice : one);
    const mrr12 = path ? path[12]! : null;
    // Same spend, a better conversion: a paid seller costs less (D8) — the cost of an active seller × first sale ÷ the new conversion.
    const conversionNow = projected && tConversion !== null ? point(tConversion) : conversion;
    const cac = paidSellerCac(activeSellerCac, firstSale, conversionNow);
    if (projected && tConversion !== null && costToday) assumptions.add("same-spend");
    const economics = sideEconomics(subscription, margin, churn, cac);
    return {
      funnel: {
        visitors: signups ? point(signups.denominator) : null,
        signups: signups ? point(signups.numerator) : null,
        referred: null,
        newUnits: ns,
      },
      kpis: {
        mrr: mrrToday,
        newMrr,
        mrr12,
        revenuePerUnit: subscription,
        gmv: null,
        cac,
        ltv: economics.ltv,
        payback: economics.payback,
        arr: arrOf(mrrToday),
        arr12: arrOf(mrr12),
        mrrPath: path,
        ltvCac: economics.ltvCac,
        lifetime: economics.lifetime,
        monthlyMargin: economics.monthlyMargin,
        afterPayback: economics.afterPayback,
        loss: economics.loss,
        spend,
        cash: cashTiedUp(spend, economics.payback, false),
        warning: paybackWarning(economics.payback, economics.loss, limit),
      },
    };
  }

  const result = { side: "supply" as const, levers, moved, today: column(false), projected: column(true) };
  return { ...result, assumptions: ASSUMPTION_ORDER.filter((a) => assumptions.has(a)) };
}

/**
 * One side of a marketplace, today and with the what-ifs. `targets` is the state's `whatIf` (or a subset: one lever
 * alone gives its own slide); the other side's targets in it are ignored, as the SaaS's are.
 */
export function buildMktScenario(state: EngineState, targets: Partial<Record<LeverId, number>>, ctx: EngineCalcContext, side: MktSide): MktScenario {
  return side === "demand" ? buildDemand(state, targets, ctx) : buildSupply(state, targets, ctx);
}

/** One moved lever on its own, on its own side — what the deck prints one slide per lever for. null for a lever without a target, an unknown one, or one that is not the marketplace's. */
export function mktLeverAlone(state: EngineState, id: LeverId, ctx: EngineCalcContext): MktScenario | null {
  const target = state.whatIf?.[id];
  if (target === undefined) return null;
  const demandIds: readonly LeverId[] = MKT_DEMAND_LEVER_IDS;
  const supplyIds: readonly LeverId[] = MKT_SUPPLY_LEVER_IDS;
  const side: MktSide | null = demandIds.includes(id) ? "demand" : supplyIds.includes(id) ? "supply" : null;
  if (side === null) return null;
  const scenario = buildMktScenario(state, { [id]: target }, ctx, side);
  return scenario.moved.includes(id) ? scenario : null;
}

/**
 * The total (S9): the marketplace's revenue month by month — the commissions and, when the sellers pay a subscription,
 * their MRR — today and with the what-ifs of both sides together, 13 points each. null when a counted side is unknown,
 * never one passed off as the whole (`mkt-model.ts#marketplaceRevenuePath`).
 */
export function mktTotalPaths(state: EngineState, targets: Partial<Record<LeverId, number>>, ctx: EngineCalcContext): { today: Interval[] | null; projected: Interval[] | null } {
  const subscriptions = mktSetup(state.setup).sellerSubscriptions;
  const demand = buildDemand(state, targets, ctx);
  const supply = buildSupply(state, targets, ctx);
  return {
    today: marketplaceRevenuePath(subscriptions, demand.today.kpis.mrrPath, supply.today.kpis.mrrPath),
    projected: marketplaceRevenuePath(subscriptions, demand.projected.kpis.mrrPath, supply.projected.kpis.mrrPath),
  };
}
