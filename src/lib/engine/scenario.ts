import { LEVER_IDS, shapeOf } from "./catalog-shape";
import { div, mapBounds, mul, point, scale } from "./interval";
import { knownSharedCount } from "./shared-counts";
import type { EngineCalcContext, EngineState, Interval, LeverId, MetricId } from "./types";
import { lifetimeMonths, revenueRetention } from "./unit-economics";
import { countsOf, currentSnapshot, entryOf, knownIn } from "./values";

/**
 * scenario.ts — « Et si ? », cumulated (Antoine, 2026-09-26).
 *
 * The what-if used to test ONE stage against a target, "all else being
 * equal". It left three things unsaid that a growth lead reasons with every
 * day: that the levers add up, that they COMPOUND down the funnel (more
 * activated users means more still active at day 30 and more payers), and
 * what it all does to the numbers a leadership meeting asks about — MRR,
 * NRR, GRR, CAC, LTV. This module says them, in one pure pass: the state,
 * the targets being tested, and the month the engine reads, in; today and
 * the projection, side by side, out.
 *
 * **The rules, each printed with the result (`assumptions`)** — a projection
 * is only as honest as what it takes for granted:
 *
 * - Sign-up rate: the same visitors, more of them sign up.
 * - Referral share: referred sign-ups come ON TOP of the others (the
 *   non-referred stay what they are), and they arrive through visitors who
 *   sign up at today's rate — so visitors grow with them.
 * - Activation: the active at day 30 and the paying are among the
 *   activated, so both grow in the same proportion — never above the
 *   activated.
 * - Paid conversion: the new rate, then scaled by activation like above.
 * - ARPA: what NEW customers pay; the MRR already there keeps its price.
 * - Churn, contraction, expansion: the monthly revenue retention of the
 *   base. Churn is logo churn standing in for revenue churn (as in
 *   `unit-economics.ts`); a movement nobody entered counts as 0, and says so.
 * - CAC: the same spend buys the extra payers — so it falls with them.
 * - Twelve months: the base retained at NRR each month, plus that month's
 *   new MRR, itself retained from then on. No seasonality, no saturation.
 *
 * Intervals all the way: an estimate stays a range, and every function of
 * the model is monotonic in its inputs, so each bound is computed from the
 * bounds that push it the same way.
 */

export interface LeverView {
  id: LeverId;
  /** Today's value in the display unit (percent, the engine's currency for ARPA and ACV, opportunities for the link). null = not known: the lever can't move. */
  today: Interval | null;
  /** The target under test, or null when the lever hasn't been moved. */
  target: number | null;
  direction: "higher" | "lower";
  /** `count`: the link, a whole number of opportunities per quarter (C25 Q7). */
  unit: "percent" | "money" | "count";
  /** Where the slider may go — a range around today, never below 0, never past 100 for a share. */
  min: number;
  max: number;
  /** The slider's step, the same rule the domain rounds with — so min, max and every target land on it. */
  step: number;
}

/**
 * One month of the funnel, in people (or customers). null = unknown, never 0.
 * Without the month's sign-ups, the funnel is read on 100 of them
 * (`perHundred`): the shape still moves, and the money never uses it.
 */
export interface ScenarioFunnel {
  perHundred: boolean;
  visitors: Interval | null;
  signups: Interval | null;
  referred: Interval | null;
  activated: Interval | null;
  d30: Interval | null;
  /** New paying customers in the month. */
  paying: Interval | null;
}

/** The growth figures a leadership meeting asks about. Rates in percent, money in the engine's currency. */
export interface ScenarioKpis {
  /** MRR at the end of the month the engine reads. */
  mrr: Interval | null;
  /** New MRR the month's new customers bring. */
  newMrr: Interval | null;
  /** MRR twelve months on, at this month's pace. */
  mrr12: Interval | null;
  /** Monthly, in percent. */
  nrr: Interval | null;
  grr: Interval | null;
  cac: Interval | null;
  ltv: Interval | null;
  /** Months of gross margin to pay the CAC back. */
  payback: Interval | null;
}

export type ScenarioAssumption =
  | "signup-same-visitors"
  | "referral-on-top"
  | "activation-drives-downstream"
  | "arpa-new-customers"
  | "churn-as-revenue"
  | "expansion-unknown"
  | "contraction-unknown"
  | "same-spend"
  | "twelve-months";

export interface Scenario {
  levers: LeverView[];
  /** The levers with a target, in lever order. */
  moved: LeverId[];
  today: { funnel: ScenarioFunnel; kpis: ScenarioKpis };
  projected: { funnel: ScenarioFunnel; kpis: ScenarioKpis };
  /** The rules the projection relies on, in the order a reader meets them. Only those that applied. */
  assumptions: ScenarioAssumption[];
}

/** The levers priced in the engine's currency: what new customers pay, what a new contract is worth. */
const MONEY_LEVERS: readonly LeverId[] = ["rev.arpa", "slg.rev.acv"];
const LOWER_IS_BETTER: readonly LeverId[] = ["ret.logo-churn", "rev.contraction"];

function known(state: EngineState, id: MetricId, ctx: EngineCalcContext): Interval | null {
  const k = knownIn(state, id, ctx);
  return k.kind === "known" ? k.value : null;
}

const clampHi = (i: Interval, cap: Interval | number): Interval => {
  const c = typeof cap === "number" ? { lo: cap, hi: cap } : cap;
  return { lo: Math.min(i.lo, c.lo), hi: Math.min(i.hi, c.hi) };
};
const nonNegative = (i: Interval): Interval => mapBounds(i, (v) => Math.max(0, v));
const round = (v: number, step: number) => Math.round(v / step) * step;

/** The slider's step: a tenth of a point under 10 %, a point above; 1 € under 100 € of ARPA (or ACV), 5 € above. */
function stepOf(id: LeverId, mid: number): number {
  if (MONEY_LEVERS.includes(id)) return mid >= 100 ? 5 : 1;
  return mid >= 10 ? 1 : 0.1;
}

/** Rounded to the step, without the float residue of 0.1 × 33 (= 3.3000000000000003). */
function snap(v: number, step: number): number {
  return Math.round(round(v, step) * 1000) / 1000;
}

/** The slider's domain: half of today to three times today, in steps a person can read; a share never past 100, churn down to 0. */
function domain(id: LeverId, today: Interval): { min: number; max: number; step: number } {
  const mid = (today.lo + today.hi) / 2;
  const step = stepOf(id, mid);
  if (MONEY_LEVERS.includes(id)) return { min: Math.max(step, snap(mid / 2, step)), max: Math.max(step * 2, snap(mid * 2, step)), step };
  const bounded = shapeOf(id).bounded;
  const ceiling = bounded ? 100 : 400;
  if (LOWER_IS_BETTER.includes(id)) return { min: 0, max: Math.min(ceiling, Math.max(1, snap(mid * 2, step))), step };
  if (id === "rev.expansion") return { min: 0, max: Math.min(ceiling, Math.max(5, snap(mid * 3, step))), step };
  return { min: Math.max(0, snap(mid / 2, step)), max: Math.min(ceiling, Math.max(step * 10, snap(mid * 3, step))), step };
}

/**
 * Every lever with its value today and the target under test. A target on an
 * unknown lever is ignored — there is nothing to move from. `ids` defaults to
 * self-serve's; sales-assisted passes its own rate and money levers
 * (`slg-scenario.ts`), and builds the link's itself.
 */
export function leverViews(
  state: EngineState,
  targets: Partial<Record<LeverId, number>>,
  ctx: EngineCalcContext,
  ids: readonly Exclude<LeverId, "link.pql-handoff">[] = LEVER_IDS,
): LeverView[] {
  return ids.map((id) => {
    const today = known(state, id, ctx);
    const unit = MONEY_LEVERS.includes(id) ? "money" : "percent";
    const direction = LOWER_IS_BETTER.includes(id) ? "lower" : "higher";
    if (!today) return { id, today: null, target: null, direction, unit, min: 0, max: 0, step: 1 };
    const { min, max, step } = domain(id, today);
    const raw = targets[id];
    const target = raw === undefined || !Number.isFinite(raw) ? null : Math.min(Math.max(raw, 0), unit === "percent" && shapeOf(id).bounded ? 100 : Infinity);
    return { id, today, target, direction, unit, min: Math.min(min, target ?? min), max: Math.max(max, target ?? max), step };
  });
}

/** The value a lever takes in the projection: its target, else today's. */
export function valueOf(levers: readonly LeverView[], id: LeverId, projected: boolean): Interval | null {
  const lever = levers.find((l) => l.id === id);
  if (!lever?.today) return null;
  return projected && lever.target !== null ? point(lever.target) : lever.today;
}

/** MRR at the end of the month: typed (ARPA's numerator, or the shared base), else ARPA × the paying customers. */
export function mrrToday(state: EngineState, ctx: EngineCalcContext): Interval | null {
  const snapshot = currentSnapshot(state);
  const typed = knownSharedCount(snapshot, "mrrEnd");
  if (typed) return point(typed.value);
  const arpa = known(state, "rev.arpa", ctx);
  const customers = countsOf(entryOf(snapshot, "ret.logo-churn"))?.denominator ?? countsOf(entryOf(snapshot, "rev.arpa"))?.denominator;
  return arpa && customers !== undefined ? scale(arpa, customers) : null;
}

/** New paying customers in the month: the CAC's measured denominator when there is one (§6.6), else the month's sign-ups × the paid conversion. */
function newPayers(state: EngineState, ctx: EngineCalcContext, signups: Interval | null, paid: Interval | null): Interval | null {
  const cac = countsOf(entryOf(currentSnapshot(state), "acq.cac"));
  if (cac && cac.denominator > 0) return point(cac.denominator);
  return signups && paid ? mul(signups, scale(paid, 1 / 100)) : null;
}

/** Σ over twelve months: the base retained at q each month, plus each month's new MRR retained from the month it arrived. */
function twelveMonths(mrr: number, newMrr: number, q: number): number {
  let total = mrr;
  for (let m = 0; m < 12; m++) total = total * q + newMrr;
  return total;
}

function projectMrr(mrr: Interval | null, newMrr: Interval | null, nrr: Interval | null): Interval | null {
  if (!mrr || !newMrr || !nrr) return null;
  return {
    lo: twelveMonths(mrr.lo, newMrr.lo, nrr.lo / 100),
    hi: twelveMonths(mrr.hi, newMrr.hi, nrr.hi / 100),
  };
}

/**
 * A ratio between two readings of the SAME uncertain number (a rate
 * estimated at 6 to 9 %, and that rate after a change): each bound of the
 * ratio comes from the same bound of today's value. Dividing the two
 * intervals instead would ignore that they move together, and turn an exact
 * « × 4/3 » into « × 0.9 to 2 ».
 */
export function correlatedRatio(today: Interval, after: (v: number) => number): Interval {
  const ratio = (v: number) => (v > 0 ? after(v) / v : 1);
  const a = ratio(today.lo);
  const b = ratio(today.hi);
  return { lo: Math.min(a, b), hi: Math.max(a, b) };
}

/**
 * Today and the projection, side by side. `targets` is the state's
 * `whatIf` (or any subset of it — a single lever gives its own slide).
 */
export function buildScenario(state: EngineState, targets: Partial<Record<LeverId, number>>, ctx: EngineCalcContext): Scenario {
  const levers = leverViews(state, targets, ctx);
  const moved = levers.filter((l) => l.target !== null).map((l) => l.id);
  const snapshot = currentSnapshot(state);
  const assumptions = new Set<ScenarioAssumption>();
  const today = (id: LeverId) => valueOf(levers, id, false);
  const target = (id: LeverId) => levers.find((l) => l.id === id && l.target !== null)?.target ?? null;

  // The month's real sign-ups feed the money; the funnel falls back on 100 to still show a shape.
  const monthSignups = (() => {
    const n = knownSharedCount(snapshot, "monthSignups");
    return n ? point(n.value) : null;
  })();
  const signupsToday = monthSignups ?? point(100);
  const d30Today = known(state, "ret.d30", ctx);
  const cacToday = known(state, "acq.cac", ctx);
  const margin = known(state, "rev.gross-margin", ctx);
  const mrr = mrrToday(state, ctx);
  const one = point(1);

  // --- The lever factors, each one's own effect ---------------------------------
  const signupRate = today("acq.signup-rate");
  const tSignup = target("acq.signup-rate");
  const fSignup = signupRate && tSignup !== null ? (div(point(tSignup), signupRate) ?? one) : one;
  if (signupRate && tSignup !== null) assumptions.add("signup-same-visitors");

  // S' = S × (1 − r) ÷ (1 − t): the non-referred stay, the referred make up the new share.
  const referredShare = today("ref.referred-share");
  const tRef = target("ref.referred-share");
  const fRef = referredShare && tRef !== null ? correlatedRatio(mapBounds(referredShare, (r) => 1 - r / 100), () => 1 - Math.min(tRef, 99) / 100) : one;
  const fRefSignups = mapBounds(fRef, (f) => 1 / f);
  if (referredShare && tRef !== null) assumptions.add("referral-on-top");

  const act = today("act.rate");
  const tAct = target("act.rate");
  const fAct = act && tAct !== null ? correlatedRatio(act, () => tAct) : one;
  if (act && tAct !== null) assumptions.add("activation-drives-downstream");
  const actAfter = act && tAct !== null ? point(tAct) : act;

  // The paid rate after: its target (or today's), carried by activation, never above the activated.
  const paid = today("rev.paid-conversion");
  const tPaid = target("rev.paid-conversion");
  const paidAfter = (v: number) => {
    const base = tPaid ?? v;
    const scaled = act && tAct !== null ? base * (tAct / ((act.lo + act.hi) / 2)) : base;
    return actAfter ? Math.min(scaled, actAfter.hi) : scaled;
  };
  // Without a paid rate, the payers still follow activation (they are among the activated).
  const fPaid = paid ? correlatedRatio(paid, paidAfter) : fAct;
  const fPayers = mul(mul(fSignup, fRefSignups), fPaid);

  // --- The funnel, in people per month --------------------------------------------
  function funnel(projected: boolean): ScenarioFunnel {
    const signups = signupsToday ? (projected ? mul(mul(signupsToday, fSignup), fRefSignups) : signupsToday) : null;
    const visitors = signupsToday && signupRate ? mul(div(scale(signupsToday, 100), signupRate)!, projected ? fRefSignups : one) : null;
    const shareNow = projected && tRef !== null ? point(tRef) : referredShare;
    const actNow = projected ? actAfter : act;
    const d30Rate = d30Today && projected && act && tAct !== null ? clampHi(mul(d30Today, fAct), point(tAct)) : d30Today;
    const paidRate = paid ? (projected ? mapBounds(paid, paidAfter) : paid) : null;
    const of = (rate: Interval | null) => (signups && rate ? mul(signups, scale(rate, 1 / 100)) : null);
    return { perHundred: monthSignups === null, visitors, signups, referred: of(shareNow), activated: of(actNow), d30: of(d30Rate), paying: of(paidRate) };
  }

  // --- The money --------------------------------------------------------------------
  function kpis(projected: boolean): ScenarioKpis {
    const payersToday = newPayers(state, ctx, monthSignups, paid);
    const payers = payersToday ? (projected ? mul(payersToday, fPayers) : payersToday) : null;
    const arpa = projected ? valueOf(levers, "rev.arpa", true) : today("rev.arpa");
    if (projected && target("rev.arpa") !== null) assumptions.add("arpa-new-customers");
    const newMrr = payers && arpa ? mul(payers, arpa) : null;

    const v = (id: LeverId) => valueOf(levers, id, projected);
    const churn = v("ret.logo-churn");
    const contraction = v("rev.contraction");
    const expansion = v("rev.expansion");
    const retention = churn ? revenueRetention(churn, contraction ?? point(0), expansion ?? point(0)) : null;
    if (retention) {
      assumptions.add("churn-as-revenue");
      if (!contraction) assumptions.add("contraction-unknown");
      if (!expansion) assumptions.add("expansion-unknown");
    }
    // The projection needs a monthly retention: a movement nobody entered counts as 0 — said in `assumptions`.
    const mrr12 = projectMrr(mrr, newMrr, retention?.nrr ?? null);
    if (mrr12) assumptions.add("twelve-months");

    // Same spend, more payers: the CAC falls in the same proportion.
    const moves = projected && (fPayers.lo !== 1 || fPayers.hi !== 1);
    const cac = cacToday && moves ? div(cacToday, fPayers) : cacToday;
    if (cacToday && moves) assumptions.add("same-spend");
    const monthlyMargin = arpa && margin ? mul(arpa, scale(margin, 1 / 100)) : null;
    const ltv = monthlyMargin && churn ? mul(monthlyMargin, lifetimeMonths(churn)) : null;
    const payback = cac && monthlyMargin ? div(cac, monthlyMargin) : null;
    return {
      mrr,
      newMrr,
      mrr12,
      grr: churn && contraction ? retention!.grr : null,
      nrr: churn && contraction && expansion ? retention!.nrr : null,
      cac,
      ltv,
      payback: payback && nonNegative(payback),
    };
  }

  const order: ScenarioAssumption[] = [
    "signup-same-visitors",
    "referral-on-top",
    "activation-drives-downstream",
    "arpa-new-customers",
    "same-spend",
    "churn-as-revenue",
    "contraction-unknown",
    "expansion-unknown",
    "twelve-months",
  ];
  const result = {
    levers,
    moved,
    today: { funnel: funnel(false), kpis: kpis(false) },
    projected: { funnel: funnel(true), kpis: kpis(true) },
  };
  return { ...result, assumptions: order.filter((a) => assumptions.has(a)) };
}

/** Each moved lever on its own: the projection with that one target only — what the deck prints one slide per lever for. */
export function leverAlone(state: EngineState, id: LeverId, ctx: EngineCalcContext): Scenario | null {
  const target = state.whatIf?.[id];
  if (target === undefined) return null;
  const scenario = buildScenario(state, { [id]: target }, ctx);
  return scenario.moved.includes(id) ? scenario : null;
}
