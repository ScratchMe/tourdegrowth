import { SMALL_COHORT_SIZE, shapeOf } from "./catalog-shape";
import { periodOf } from "./cohort";
import { div, mapBounds, point } from "./interval";
import { chainOf } from "./peloton";
import { mktSetup } from "./setup-type";
import type { Confidence, EngineCalcContext, EngineState, Interval, Known, MetricId, Peloton, SourceRef, YearMonth } from "./types";
import { countsOf, currentSnapshot, entryOf, knownIn } from "./values";

/**
 * mkt-funnel.ts — a marketplace's two funnels, each side read as 100 sign-ups (engine spec §22.5.2, A23 MKT-2).
 *
 * The peloton's rule (`peloton.ts`, §6.5) on each side of the marketplace, never on both at once (D2, D14): the buyers'
 * sign-ups, of whom so many place a first order and so many a second; the sellers' sign-ups, of whom so many make a
 * first sale and, when the sellers pay a subscription, so many subscribe. Every column is counted on the SAME 100
 * sign-ups of its side, whole people per bound, and an unknown column is `null`: never 0.
 *
 * Pure, like the peloton: no copy, no format. The screens read these funnels from MKT-7b on.
 */

export interface MktFunnelColumn {
  metric: "mkt.buy.first-order" | "mkt.buy.repeat" | "mkt.sell.first-sale" | "mkt.sell.paid-conversion";
  /** null = unknown, never 0. Rounded per bound, like the peloton. */
  perHundred: Interval | null;
  confidence: Confidence;
  source: SourceRef | null;
  period: YearMonth | null;
}

export interface MktSideFunnel {
  /** 100 ÷ sign-up rate × 100: the visitors behind 100 sign-ups (the buyers', or the seller page's). */
  visitorsPerHundred: Interval | null;
  upstreamSource: SourceRef | null;
  upstreamPeriod: YearMonth | null;
  /** Demand: first order, then second order. Supply: first sale, then paid conversion (with subscriptions). Same 100 sign-ups. */
  columns: MktFunnelColumn[];
  chain: Peloton["chain"];
  /** The cohort under SMALL_COHORT_SIZE. */
  smallCohort: boolean;
}

export interface MktFunnel {
  demand: MktSideFunnel & {
    /** The referred share, rounded: the red dots of the sign-ups grid. */
    referredPerHundred: Interval | null;
    /** The fill rate as known, and which kind of request it counts. */
    fill: Known;
    fillVariant: "requests" | "searches" | null;
  };
  supply: MktSideFunnel & {
    /** The active sellers' churn, and the paid sellers' (with subscriptions). */
    churn: Known;
    paidChurn: Known | null;
  };
}

/** Whole people out of 100, per bound — what the grid draws. */
function perHundredOf(percent: Interval): Interval {
  return mapBounds(percent, Math.round);
}

function columnOf(state: EngineState, ctx: EngineCalcContext, metric: MktFunnelColumn["metric"]): MktFunnelColumn {
  const snapshot = currentSnapshot(state);
  const known = knownIn(state, metric, ctx);
  const entry = entryOf(snapshot, metric);
  if (known.kind === "unknown") return { metric, perHundred: null, confidence: "unknown", source: null, period: null };
  return {
    metric,
    perHundred: perHundredOf(known.value),
    confidence: known.confidence,
    // A source is only a source for a single measured reading; an estimate or a conflict has none to cite.
    source: entry?.status === "measured" ? (entry.source ?? null) : null,
    period: periodOf(shapeOf(metric), entry, snapshot),
  };
}

/**
 * The cohort's size is the denominator the person typed for the side's first step — the buyers' first order, the
 * sellers' first sale. Under SMALL_COHORT_SIZE each sign-up weighs more than a point and rates lose their decimals
 * (§6.2). `peloton.ts#cohortIsSmall` is the reference: it reads the SaaS's four cohort numbers, so this one reads the
 * marketplace's, one per side.
 */
function cohortUnder(state: EngineState, cohortSized: MetricId): boolean {
  const size = countsOf(entryOf(currentSnapshot(state), cohortSized))?.denominator;
  return size !== undefined && size < SMALL_COHORT_SIZE;
}

/**
 * One side's funnel. `signupRate` is the number the visitors behind the sign-ups are read from; `null` for the supply
 * of a marketplace whose sellers pay nothing, whose sign-up rate is not shown (D9).
 */
function sideFunnel(state: EngineState, ctx: EngineCalcContext, signupRate: "mkt.buy.signup-rate" | "mkt.sell.signup-rate" | null, metrics: MktFunnelColumn["metric"][], cohortSized: MetricId): MktSideFunnel {
  const snapshot = currentSnapshot(state);
  const signup = signupRate === null ? null : knownIn(state, signupRate, ctx);
  const signupEntry = signupRate === null ? undefined : entryOf(snapshot, signupRate);
  const columns = metrics.map((metric) => columnOf(state, ctx, metric));
  return {
    // 100 ÷ (sign-up rate / 100): how many visitors a month it takes to get these 100 sign-ups.
    visitorsPerHundred: signup?.kind === "known" ? div(point(10_000), signup.value) : null,
    upstreamSource: signupEntry?.status === "measured" ? (signupEntry.source ?? null) : null,
    upstreamPeriod: signup?.kind === "known" ? snapshot.referenceMonth : null,
    columns,
    chain: chainOf(columns.map((c) => c.perHundred !== null)),
    smallCohort: cohortUnder(state, cohortSized),
  };
}

export function buildMktFunnel(state: EngineState, ctx: EngineCalcContext): MktFunnel {
  const snapshot = currentSnapshot(state);
  const sellersPay = mktSetup(state.setup).sellerSubscriptions;

  const referred = knownIn(state, "mkt.buy.referred-share", ctx);
  const variant = entryOf(snapshot, "mkt.liq.fill-rate")?.variant;

  return {
    demand: {
      ...sideFunnel(state, ctx, "mkt.buy.signup-rate", ["mkt.buy.first-order", "mkt.buy.repeat"], "mkt.buy.first-order"),
      referredPerHundred: referred.kind === "known" ? perHundredOf(referred.value) : null,
      fill: knownIn(state, "mkt.liq.fill-rate", ctx),
      fillVariant: variant === "requests" || variant === "searches" ? variant : null,
    },
    supply: {
      ...sideFunnel(state, ctx, sellersPay ? "mkt.sell.signup-rate" : null, sellersPay ? ["mkt.sell.first-sale", "mkt.sell.paid-conversion"] : ["mkt.sell.first-sale"], "mkt.sell.first-sale"),
      churn: knownIn(state, "mkt.sell.churn", ctx),
      paidChurn: sellersPay ? knownIn(state, "mkt.sell.paid-churn", ctx) : null,
    },
  };
}
