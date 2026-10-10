import type { MotionRules } from "./diagnose";
import {
  activeRetentionGain,
  appRankingGain,
  hasUsageStream,
  installCumulative,
  installLossCheck,
  installMargins,
  installPayback,
  installPaybackInterval,
  installPaybackWarning,
  installValue,
  INSTALL_VALUE_MONTHS,
  appRevenuePath,
  appRevenueToday,
  newActivesPerMonth,
  revenuePerActive,
  usageFlowGain,
  usagePath,
  valueToCost,
  type AppMonetization,
} from "./app-model";
import { APP_LEVER_IDS, CANDIDATE_IDS, LEVER_IDS, LTV_CAP_MONTHS, REFERRAL_CANDIDATES, appShapeShown, derivedShapeOf, isPricedAt, shapesOf, type MetricShape } from "./catalog-shape";
import { formatApproxMoneyInterval, formatCountInterval, formatInterval, roundDisplay, roundMoney, type UnitWords } from "./format";
import { isFlow, rankingImpact, twelveMonthFactor, whatIf } from "./impact";
import { add, div, mapBounds, mul, point, scale } from "./interval";
import { acquisitionSpend, arrOf, paybackLimit } from "./money";
import { cohortIsSmall } from "./peloton";
import { buildScenario, leverViews, mrrToday, valueOf, type AppKpis, type Scenario, type ScenarioAssumption, type ScenarioFunnel, type ScenarioKpis } from "./scenario";
import type { PanelLeverId } from "./scenario-of"; // type only: scenario-of.ts imports this module
import { DEFAULT_APP_MONETIZATION, monetizationOf } from "./setup-type";
import { knownSharedCount } from "./shared-counts";
import { sumParts } from "./total";
import type {
  AppCandidateId,
  AppDerived,
  AppDerivedId,
  Confidence,
  DerivedValue,
  EngineCalcContext,
  EngineSetup,
  EngineState,
  Impact,
  ImpactLine,
  Interval,
  LeverId,
  MetricId,
  SelfServeCandidateId,
  SharedCount,
  UnitEconomics,
} from "./types";
import { unitEconomics } from "./unit-economics";
import { countsOf, currentSnapshot, entryOf, knownIn } from "./values";

/**
 * app.ts — a consumer app's model, wired to the engine (engine spec §21.5,
 * A22 APP-4; answers C56, C59 and C92 of 2026-10-04).
 *
 * The pure money of an app is `app-model.ts`; this module reads the state, says
 * which numbers feed it, and returns a `Scenario` of the shape the self-serve
 * engine already has (§21.1 D5), so the board, the « Et si » panel and the
 * slides read it unchanged. The subscriptions are the self-serve engine itself
 * (`buildScenario`: the funnel, the MRR, its curve, the NRR and the GRR);
 * purchases and ads are a second stream on the month's actives, and the two
 * are added.
 *
 * Reached through `scenario-of.ts` only, and only for an app: the SaaS never
 * touches this module, which is what keeps its goldens still.
 */

/**
 * The app's monetization, whatever `setup.type` says: callers have checked
 * it. The guarded read (`monetizationOf`), never `setup.monetization`, which a
 * file opened with its errors can leave malformed.
 */
function monetizationFor(setup: Pick<EngineSetup, "monetization">): AppMonetization {
  return monetizationOf({ type: "consumer-app", monetization: setup.monetization }) ?? DEFAULT_APP_MONETIZATION;
}

/** The numbers an app's scenario reads, each `null` when unknown — and when the monetization doesn't show it, unread (§21.5.5). */
export interface AppInputs {
  m: AppMonetization;
  /** The month's installs: the shared count monthSignups, as a point; null if not typed. */
  installs: Interval | null;
  d30: Interval | null; // ret.d30
  paid: Interval | null; // rev.paid-conversion — null when subscriptions are unticked
  arpa: Interval | null; // rev.arpa — idem
  churn: Interval | null; // ret.logo-churn — idem
  /** The month's actives: the shared count appActives, as a point; null if not typed (or no usage stream). */
  actives: Interval | null;
  activeRetention: Interval | null; // app.ret.active-retention — null when neither purchases nor ads
  purchases: Interval | null; // app.rev.purchases-per-active — null when unticked
  ads: Interval | null; // app.rev.ads-per-active — null when unticked
  commission: Interval | null; // app.rev.commission — null when neither subscriptions nor purchases
  margin: Interval | null; // app.rev.gross-margin
  cpi: Interval | null; // app.acq.cpi
}

export function appInputs(state: EngineState, ctx: EngineCalcContext): AppInputs {
  const m = monetizationFor(state.setup);
  const snapshot = currentSnapshot(state);
  const read = (id: MetricId, shown: boolean): Interval | null => {
    if (!shown) return null;
    const k = knownIn(state, id, ctx);
    return k.kind === "known" ? k.value : null;
  };
  const count = (name: SharedCount, shown: boolean): Interval | null => {
    const n = shown ? knownSharedCount(snapshot, name) : null;
    return n ? point(n.value) : null;
  };
  return {
    m,
    installs: count("monthSignups", true),
    d30: read("ret.d30", true),
    paid: read("rev.paid-conversion", m.subscriptions),
    arpa: read("rev.arpa", m.subscriptions),
    churn: read("ret.logo-churn", m.subscriptions),
    actives: count("appActives", hasUsageStream(m)),
    activeRetention: read("app.ret.active-retention", appShapeShown("app.ret.active-retention", m)),
    purchases: read("app.rev.purchases-per-active", appShapeShown("app.rev.purchases-per-active", m)),
    ads: read("app.rev.ads-per-active", appShapeShown("app.rev.ads-per-active", m)),
    commission: read("app.rev.commission", appShapeShown("app.rev.commission", m)),
    margin: read("app.rev.gross-margin", true),
    cpi: read("app.acq.cpi", true),
  };
}

/**
 * The inputs a computed figure reads under this monetization (§21.4.2): the missing list names only these. In the
 * order of the figure's `inputs` (catalog-shape.ts), which holds the complete list: the margin always; with the
 * subscriptions, the paid conversion, the revenue per subscriber and their churn; with purchases or ads, day-30
 * retention and the actives' retention; each revenue per active with its own stream; the commission with
 * subscriptions or purchases (what the stores bill); the cost per install for the two figures that read it.
 */
export function appInputsOf(id: AppDerivedId, m: AppMonetization): MetricId[] {
  const usage = hasUsageStream(m);
  const read = new Set<MetricId>(["app.rev.gross-margin", "app.acq.cpi"]);
  if (m.subscriptions || m.purchases) read.add("app.rev.commission");
  if (m.subscriptions) for (const input of ["rev.paid-conversion", "rev.arpa", "ret.logo-churn"] as const) read.add(input);
  if (usage) for (const input of ["ret.d30", "app.ret.active-retention"] as const) read.add(input);
  if (m.purchases) read.add("app.rev.purchases-per-active");
  if (m.ads) read.add("app.rev.ads-per-active");
  return derivedShapeOf(id).inputs.filter((input) => read.has(input));
}

/**
 * The levers an app moves (§21.5.3), in panel order: the self-serve ones whose number it shows, then its own, when
 * its monetization shows them. Without subscriptions that is the four of the funnel (installs, referral, activation,
 * day 30), then whatever the usage streams call for.
 */
export function appLeverIds(setup: Pick<EngineSetup, "monetization">): readonly PanelLeverId[] {
  const shown = new Set<MetricId>(shownShapes(setup).map((s) => s.id));
  return [...LEVER_IDS, ...APP_LEVER_IDS].filter((id) => shown.has(id));
}

/** The numbers an app of this monetization shows: `shapesOf` on the app's own self-serve setup, with the guarded monetization. */
function shownShapes(setup: Pick<EngineSetup, "monetization">): MetricShape[] {
  return shapesOf({ type: "consumer-app", motions: { plg: true, slg: false }, monetization: monetizationFor(setup) });
}

/** A share of a whole, in percent: how the self-serve funnel's people become the rates an install's margin is built on. */
function percentOf(part: Interval | null, whole: Interval | null): Interval | null {
  const q = part && whole ? div(part, whole) : null;
  return q ? scale(q, 100) : null;
}

/**
 * Today and the projection of a consumer app, side by side (§21.5.3). `targets` is the state's `whatIf`, or any
 * subset of it. The scenario has the self-serve engine's shape — `mrr` is the month's revenue of the ticked streams,
 * `cac` the cost per install, `ltv` the value of an install over 36 months, `ltvCac` its value over 12 months ÷ its
 * cost — with the rest in `kpis.app`.
 */
export function buildAppScenario(state: EngineState, targets: Partial<Record<LeverId, number>>, ctx: EngineCalcContext): Scenario {
  const inputs = appInputs(state, ctx);
  const { m } = inputs;
  const usageTicked = hasUsageStream(m);
  const levers = leverViews(state, targets, ctx, appLeverIds(state.setup));
  const moved = levers.filter((l) => l.target !== null).map((l) => l.id);
  const isMoved = (...ids: LeverId[]) => ids.some((id) => moved.includes(id));

  // The self-serve engine carries the funnel and the subscriptions: it gets the targets of the levers the app shows.
  const shown = new Set(levers.map((l) => l.id));
  const plgTargets: Partial<Record<LeverId, number>> = {};
  for (const id of LEVER_IDS) {
    const target = targets[id];
    if (shown.has(id) && target !== undefined) plgTargets[id] = target;
  }
  const base = buildScenario(state, plgTargets, ctx);

  // Same spend: the funnel already moves the installs with the install rate and the referred share (and reads 100 on
  // 100 when the month's installs are missing: the ratio stays right).
  const signupsToday = base.today.funnel.signups;
  const signupsProjected = base.projected.funnel.signups;
  const fInstalls = signupsToday && signupsProjected ? div(signupsProjected, signupsToday) : null;
  const installsMove = fInstalls !== null && (fInstalls.lo !== 1 || fInstalls.hi !== 1);

  // What one active brings a month: today's, and the what-ifs' (applied to every active from the next month).
  const perToday = usageTicked ? revenuePerActive(m, inputs.purchases, inputs.ads) : null;
  const perProjected = usageTicked
    ? revenuePerActive(m, valueOf(levers, "app.rev.purchases-per-active", true), valueOf(levers, "app.rev.ads-per-active", true))
    : null;
  // A month of acquisition, at today's spend whatever the what-ifs.
  const spend = acquisitionSpend(inputs.installs, inputs.cpi);

  function column(projected: boolean): { funnel: ScenarioFunnel; kpis: ScenarioKpis } {
    const b = projected ? base.projected : base.today;
    const v = (id: LeverId) => valueOf(levers, id, projected);

    // The new actives are the month's installs still there at day 30 (D9): the funnel's own day-30 people.
    const newActives = b.funnel.perHundred ? null : b.funnel.d30;
    const per = projected ? perProjected : perToday;
    const retention = v("app.ret.active-retention");
    const usage = usageTicked ? usagePath(inputs.actives, newActives, retention, perToday, per) : null;

    const mrrPath = appRevenuePath(m, b.kpis.mrrPath, usage);
    // The month's revenue is the actives × what one brings: it needs no installs (the curve and the new revenue do),
    // as the SaaS's MRR needs no sign-ups. With the installs known this is `usage[0]`, bit for bit.
    const usageToday = inputs.actives && perToday ? mul(inputs.actives, perToday) : null;
    const mrr = appRevenueToday(m, base.today.kpis.mrr, usageToday);
    const newUsage = newActives && per ? mul(newActives, per) : null;
    const newMrr = appRevenueToday(m, b.kpis.newMrr, newUsage);
    const mrr12 = mrrPath?.[12] ?? null;

    // The cost of an install, at equal spend: the same money buys the extra installs.
    const cpi = projected && installsMove && fInstalls && inputs.cpi ? div(inputs.cpi, fInstalls) : inputs.cpi;

    // An install's economics (§21.5.3 point 8): the rates come from the funnel, already moved by the levers.
    const margins = installMargins(m, {
      paidConversion: percentOf(b.funnel.paying, b.funnel.signups),
      arpa: v("rev.arpa"),
      d30: percentOf(b.funnel.d30, b.funnel.signups),
      purchasesPerActive: v("app.rev.purchases-per-active"),
      adsPerActive: v("app.rev.ads-per-active"),
      commission: v("app.rev.commission"),
      margin: inputs.margin,
    });
    const churn = v("ret.logo-churn");
    const value12 = installValue(margins, churn, retention, INSTALL_VALUE_MONTHS);
    const ltv = installValue(margins, churn, retention, LTV_CAP_MONTHS);
    const pb = installPayback(cpi, margins, churn, retention);
    const loss = installLossCheck(ltv, cpi);

    const app: AppKpis = {
      subscriptionsPath: m.subscriptions ? b.kpis.mrrPath : null,
      usagePath: usage,
      newSubscriptions: m.subscriptions ? b.kpis.newMrr : null,
      newUsage,
      value12,
      curve: installCumulative(margins, churn, retention),
      paybackBeyondCap: pb?.hi === null,
      activesMissing: usageTicked && inputs.actives === null,
    };
    const kpis: ScenarioKpis = {
      mrr,
      newMrr,
      mrr12,
      nrr: m.subscriptions ? b.kpis.nrr : null,
      grr: m.subscriptions ? b.kpis.grr : null,
      cac: cpi,
      ltv,
      payback: installPaybackInterval(pb),
      arr: arrOf(mrr),
      arr12: arrOf(mrr12),
      mrrPath,
      ltvCac: valueToCost(value12, cpi),
      // D11: no cash tied up for an app, and no counted lifetime — an install's margin falls month by month.
      lifetime: null,
      monthlyMargin: margins ? add(margins.subscription, margins.usage) : null,
      afterPayback: null,
      loss,
      spend,
      cash: null,
      warning: installPaybackWarning(pb, loss, paybackLimit(state.setup.runwayMonths)),
      app,
    };
    return { funnel: b.funnel, kpis };
  }

  const today = column(false);
  const projected = column(true);

  // The self-serve rules that applied, minus the ones about customers an app doesn't have: without subscriptions only
  // the two about installs; with them, all but the CAC's (an app has a cost per install).
  const kept: ScenarioAssumption[] = m.subscriptions
    ? base.assumptions.filter((a) => a !== "same-spend")
    : base.assumptions.filter((a) => a === "signup-same-visitors" || a === "referral-on-top");
  const own: ScenarioAssumption[] = [];
  if (usageTicked && isMoved("acq.signup-rate", "ref.referred-share", "act.rate", "ret.d30")) own.push("actives-follow-d30");
  if (isMoved("app.rev.purchases-per-active", "app.rev.ads-per-active")) own.push("per-active-all-actives");
  if (isMoved("app.rev.commission")) own.push("commission-margin-only");
  if (inputs.cpi && installsMove) own.push("same-spend-installs");
  if (today.kpis.ltv || projected.kpis.ltv) own.push("install-months");
  if (today.kpis.app?.usagePath || projected.kpis.app?.usagePath) own.push("usage-twelve-months");

  return { levers, moved, today, projected, assumptions: [...kept, ...own] };
}

/** Each moved lever on its own: the projection with that one target only — what the deck prints one slide per lever for. */
export function appLeverAlone(state: EngineState, id: LeverId, ctx: EngineCalcContext): Scenario | null {
  const target = state.whatIf?.[id];
  if (target === undefined) return null;
  const scenario = buildAppScenario(state, { [id]: target }, ctx);
  return scenario.moved.includes(id) ? scenario : null;
}

// --- The diagnosis of an app (§21.5.4, APP-5) ------------------------------------

/** The actives' retention: the app's one candidate of its own, priced in money only, like churn. */
const ACTIVE_RETENTION: AppCandidateId = "app.ret.active-retention";

/**
 * The candidates an app's diagnosis positions, in order: the self-serve ones whose number it shows (without
 * subscriptions: no paid conversion and no churn), then the actives' retention when purchases or ads are ticked.
 */
export function appCandidates(setup: Pick<EngineSetup, "monetization">): SelfServeCandidateId[] {
  const shown = new Set<MetricId>(shownShapes(setup).map((s) => s.id));
  return [...CANDIDATE_IDS.filter((id) => shown.has(id)), ...(shown.has(ACTIVE_RETENTION) ? [ACTIVE_RETENTION] : [])];
}

/**
 * The self-serve rules, on an app's candidates (`diagnose.ts#diagnoseWith` is the one function that names a stage).
 * Churn and the actives' retention are priced on a base, so they rank only in money; the ★ the diagnosis watches
 * for blindness are the shown ones, then the churn (with subscriptions) and the actives' retention (when shown).
 */
export function appRules(setup: Pick<EngineSetup, "monetization">): MotionRules<SelfServeCandidateId> {
  const shapes = shownShapes(setup);
  const shown = new Set<MetricId>(shapes.map((s) => s.id));
  const blindWatch: MetricId[] = shapes.filter((s) => s.primary).map((s) => s.id);
  if (monetizationFor(setup).subscriptions) blindWatch.push("ret.logo-churn");
  if (shown.has(ACTIVE_RETENTION)) blindWatch.push(ACTIVE_RETENTION);
  return {
    motion: "plg",
    candidates: appCandidates(setup),
    price: appRankingImpact,
    // `isFlow` takes the SaaS's candidates only: the comparison narrows the id to them.
    isFlow: (id) => id !== ACTIVE_RETENTION && isFlow(id),
    retentions: ["ret.logo-churn", ACTIVE_RETENTION],
    blindWatch,
  };
}

/**
 * What closing a gap to `target` is worth a month on the app's two streams, exact and unrounded, for the ranking.
 * The subscriptions are the self-serve engine's own pricing (`rankingImpact`); the usage stream gains from the flows
 * that bring installs to day 30 (D9: installs, activation, day 30, the referred share) and from the actives' retention;
 * the paid conversion and the subscribers' churn don't touch the actives. A ticked stream whose gain is unknown leaves
 * the money unknown — the ranking then falls back to the relative gap, as self-serve does without ARPA.
 */
export function appRankingImpact(state: EngineState, id: SelfServeCandidateId, target: number, ctx: EngineCalcContext): { gap?: Interval; mrr?: Interval } {
  const inputs = appInputs(state, ctx);
  const { m } = inputs;
  const perActive = revenuePerActive(m, inputs.purchases, inputs.ads);
  if (id === ACTIVE_RETENTION) {
    if (inputs.activeRetention && inputs.actives && perActive) return { mrr: activeRetentionGain(inputs.actives, inputs.activeRetention, target, perActive) };
    return {};
  }
  const sub = rankingImpact(state, id, target, ctx);
  const subscriptionsPart = m.subscriptions ? (sub.mrr ?? null) : point(0);
  let usagePart: Interval | null;
  if (!hasUsageStream(m) || id === "rev.paid-conversion" || id === "ret.logo-churn") usagePart = point(0);
  else {
    const newActives = newActivesPerMonth(inputs.installs, inputs.d30);
    usagePart = sub.gap && newActives && perActive ? usageFlowGain(newActives, sub.gap, perActive) : null;
  }
  const money = appRankingGain(m, subscriptionsPart, usagePart);
  if (money) return { ...(sub.gap ? { gap: sub.gap } : {}), mrr: money };
  return sub.gap ? { gap: sub.gap } : {};
}

// --- The « Et si » chain of an app (§21.7.2, APP-9) ---------------------------------

const floorAtZero = (i: Interval): Interval => mapBounds(i, (v) => Math.max(0, v));

/**
 * The displayed chain of one candidate and one target for a consumer app: the self-serve `whatIf` (§6.7), built from the
 * numbers the reader sees, with the app's second stream where it has one. `null` when nothing can be priced, as `whatIf`.
 *
 * Three chains, which `Impact.appChain` names for `phrases.ts#chainTemplate`:
 * - `subscriptions`: the self-serve chain on the subscribers, unchanged (`whatIf`, its `annual` line printed with the
 *   app's words); a flow, with a usage stream ticked, adds the actives that day 30 brings, what they earn, and the sum
 *   (`usage-then`, `usage-times`, `sum`), then its own `annual` over both streams;
 * - `actives-flow`: a flow without subscriptions, counted on the new actives (the month's installs still there at day
 *   30, D9) and priced at the revenue per active;
 * - `actives-retention`: the actives' retention, the base being the month's actives, as churn is the paying base.
 *
 * A ticked stream whose gain can't be computed leaves the money out: the subscribers' chain keeps its customers
 * only; the two chains on the actives are `null` (their sentences would count subscribers).
 */
export function appWhatIf(state: EngineState, candidate: SelfServeCandidateId, target: number, ctx: EngineCalcContext, words: UnitWords): Impact | null {
  if (!isPricedAt(candidate, target)) return null;
  const inputs = appInputs(state, ctx);
  const { m } = inputs;
  const usageTicked = hasUsageStream(m);
  const perActive = usageTicked ? revenuePerActive(m, inputs.purchases, inputs.ads) : null;

  if (candidate === ACTIVE_RETENTION) return activeRetentionChain(state, target, ctx, words, inputs, perActive);

  if (!m.subscriptions) return activesFlowChain(state, candidate, target, ctx, words, inputs, perActive);

  const impact = whatIf(state, candidate, target, ctx, words);
  if (!impact) return null;
  const subscriptions: Impact = { ...impact, appChain: "subscriptions" };
  const flow = candidate !== "rev.paid-conversion" && candidate !== "ret.logo-churn";
  if (!usageTicked || !flow) return subscriptions;
  // The money of the subscriptions, on the way it was printed: if it isn't there (no ARPA, under one subscriber), the usage doesn't add to it.
  const subscriptionsMoney = subscriptions.mrrPerMonth;
  if (!subscriptionsMoney) return subscriptions;
  const usage = usageLines(state, candidate, target, ctx, words, inputs, perActive);
  if (!usage) {
    // The second stream is ticked and its gain unknown: the title can't say a revenue it only half knows, so the chain keeps its customers.
    const { mrrPerMonth: _month, mrrAfter12Months: _year, ...customers } = subscriptions;
    return { ...customers, kind: "customers", lines: subscriptions.lines.filter((l) => l.key !== "times" && l.key !== "annual") };
  }

  const currency = state.setup.currency;
  const total = add(subscriptionsMoney, usage.amount);
  const lines: ImpactLine[] = subscriptions.lines.filter((l) => l.key !== "annual");
  lines.push(...usage.lines, { key: "sum", values: { amount: formatApproxMoneyInterval(total, currency, ctx, words) } });
  const { mrrAfter12Months: _single, ...rest } = subscriptions;
  const churn = knownValueOf(state, "ret.logo-churn", ctx);
  const retention = inputs.activeRetention;
  // The year: each stream eroded by its own departures, from its own printed amount (the subscribers' churn, the actives' retention).
  if (!churn || !retention) return { ...rest, mrrPerMonth: total, lines };
  const year = add(scaleBy(subscriptionsMoney, twelveMonthFactor(roundDisplay(churn.hi))), scaleBy(usage.amount, twelveMonthFactor(roundDisplay(100 - retention.lo))));
  lines.push({ key: "annual", values: { amount: formatApproxMoneyInterval(year, currency, ctx, words) } });
  return { ...rest, mrrPerMonth: total, mrrAfter12Months: year, lines };
}

function knownValueOf(state: EngineState, id: MetricId, ctx: EngineCalcContext): Interval | null {
  const k = knownIn(state, id, ctx);
  return k.kind === "known" ? k.value : null;
}

const scaleBy = (i: Interval, k: number): Interval => ({ lo: i.lo * k, hi: i.hi * k });

/**
 * The displayed numbers every chain of the app starts from, as `whatIf` computes them: the rate and the target rounded
 * as the reader sees them, the rate's printer, and the ratio the volume grows by.
 */
function flowFigures(state: EngineState, candidate: SelfServeCandidateId, target: number, ctx: EngineCalcContext, words: UnitWords, r: Interval) {
  const referral = REFERRAL_CANDIDATES.includes(candidate);
  // A small COHORT shows whole percents; the month's flows (installs, the referred share) aren't a cohort.
  const noDecimals = candidate !== "acq.signup-rate" && !referral && cohortIsSmall(currentSnapshot(state), state.setup);
  const pct = (i: Interval) => formatInterval(i, "percent", ctx, words, { noDecimals });
  const bare = (i: Interval) => formatInterval(i, "ratio", ctx, words);
  const rD = mapBounds(r, (v) => roundDisplay(v, { noDecimals }));
  const tD = roundDisplay(target, { noDecimals });
  /** What the volume becomes at the target, per bound from the displayed numbers: the fewest with the highest value today. */
  const grown = (v: Interval): Interval =>
    referral
      ? { lo: Math.round((v.lo * (100 - rD.hi)) / (100 - tD)), hi: Math.round((v.hi * (100 - rD.lo)) / (100 - tD)) }
      : { lo: Math.round((v.lo * tD) / rD.hi), hi: Math.round((v.hi * tD) / rD.lo) };
  return { referral, pct, bare, rD, tD, grown };
}

/** The new actives of the month (the installs still there at day 30, D9), as the reader sees them: the volume, its growth, and the gain. */
function newActivesFigures(state: EngineState, candidate: SelfServeCandidateId, target: number, ctx: EngineCalcContext, words: UnitWords, inputs: AppInputs) {
  const r = knownValueOf(state, candidate, ctx);
  const actives = newActivesPerMonth(inputs.installs, inputs.d30);
  if (!r || !actives) return null;
  const f = flowFigures(state, candidate, target, ctx, words, r);
  if (!(f.rD.lo > 0 || f.referral) || !(f.tD > f.rD.lo)) return null;
  const nD = mapBounds(actives, Math.round);
  const mD = f.grown(nD);
  const delta = floorAtZero({ lo: mD.lo - nD.lo, hi: mD.hi - nD.hi });
  return { r, f, nD, mD, delta };
}

/** The usage stream's two lines of a chain with subscriptions (`usage-then`, `usage-times`), and its monthly amount. */
function usageLines(
  state: EngineState,
  candidate: SelfServeCandidateId,
  target: number,
  ctx: EngineCalcContext,
  words: UnitWords,
  inputs: AppInputs,
  perActive: Interval | null,
): { lines: ImpactLine[]; amount: Interval } | null {
  const figures = newActivesFigures(state, candidate, target, ctx, words, inputs);
  if (!figures || !perActive || figures.delta.hi < 1) return null;
  const { f, nD, mD, delta } = figures;
  const perD = mapBounds(perActive, roundMoney);
  const amount = mul(delta, perD);
  const currency = state.setup.currency;
  return {
    amount,
    lines: [
      {
        key: "usage-then",
        values: { n: formatCountInterval(nD, ctx, words), target: f.bare(point(f.tD)), rate: f.bare(f.rD), m: formatCountInterval(mD, ctx, words), delta: formatCountInterval(delta, ctx, words) },
        count: delta,
      },
      {
        key: "usage-times",
        values: { perActive: formatInterval(perD, "money", ctx, words, { currency }), amount: formatApproxMoneyInterval(amount, currency, ctx, words) },
      },
    ],
  };
}

/** A flow without subscriptions: the new actives, then what they earn (`actives-flow`). `null` without the month's installs, day 30 or the revenue per active. */
function activesFlowChain(
  state: EngineState,
  candidate: SelfServeCandidateId,
  target: number,
  ctx: EngineCalcContext,
  words: UnitWords,
  inputs: AppInputs,
  perActive: Interval | null,
): Impact | null {
  const figures = newActivesFigures(state, candidate, target, ctx, words, inputs);
  if (!figures || !perActive) return null;
  const { r, f, nD, mD, delta } = figures;
  const currency = state.setup.currency;
  const lines: ImpactLine[] = [
    { key: "today", values: { rate: f.pct(f.rD), n: formatCountInterval(nD, ctx, words) }, count: nD },
    { key: "if", values: { target: f.pct(point(f.tD)) } },
    { key: "then", values: { n: formatCountInterval(nD, ctx, words), target: f.bare(point(f.tD)), rate: f.bare(f.rD), m: formatCountInterval(mD, ctx, words), delta: formatCountInterval(delta, ctx, words) }, count: delta },
  ];
  const base: Impact = { metric: candidate, kind: "new-mrr", from: r, to: target, customersPerMonth: delta, appChain: "actives-flow", lines };
  if (delta.hi < 1) {
    lines.push({ key: "less-than-one", values: {} });
    return { ...base, kind: "customers" };
  }
  const perD = mapBounds(perActive, roundMoney);
  const amount = mul(delta, perD);
  lines.push({ key: "times", values: { perActive: formatInterval(perD, "money", ctx, words, { currency }), amount: formatApproxMoneyInterval(amount, currency, ctx, words) } });
  const retention = inputs.activeRetention;
  if (!retention) return { ...base, mrrPerMonth: amount, lines };
  const annual = scaleBy(amount, twelveMonthFactor(roundDisplay(100 - retention.lo)));
  lines.push({ key: "annual", values: { amount: formatApproxMoneyInterval(annual, currency, ctx, words) } });
  return { ...base, mrrPerMonth: amount, mrrAfter12Months: annual, lines };
}

/** The actives' retention: the actives kept by the change, at the revenue per active (`actives-retention`). `null` without the actives, their retention or the revenue per active. */
function activeRetentionChain(
  state: EngineState,
  target: number,
  ctx: EngineCalcContext,
  words: UnitWords,
  inputs: AppInputs,
  perActive: Interval | null,
): Impact | null {
  const r = inputs.activeRetention;
  const base = inputs.actives;
  if (!r || !base || !perActive) return null;
  const pct = (i: Interval) => formatInterval(i, "percent", ctx, words);
  const rD = mapBounds(r, (v) => roundDisplay(v));
  const tD = roundDisplay(target);
  if (!(tD > rD.lo) || tD > 100) return null;
  const currency = state.setup.currency;
  const baseText = formatCountInterval(base, ctx, words);
  const kept = mapBounds(floorAtZero({ lo: (base.lo * (tD - rD.hi)) / 100, hi: (base.hi * (tD - rD.lo)) / 100 }), Math.round);
  const lines: ImpactLine[] = [
    { key: "today", values: { retention: pct(rD), base: baseText } },
    { key: "if", values: { target: pct(point(tD)) } },
    { key: "then", values: { base: baseText, retention: pct(rD), target: pct(point(tD)), n: formatCountInterval(kept, ctx, words) }, count: kept },
  ];
  const impact: Impact = { metric: ACTIVE_RETENTION, kind: "retained-mrr", from: r, to: target, customersPerMonth: kept, appChain: "actives-retention", lines };
  if (kept.hi < 1) {
    lines.push({ key: "less-than-one", values: {} });
    return { ...impact, kind: "customers" };
  }
  const perD = mapBounds(perActive, roundMoney);
  const amount = mul(kept, perD);
  lines.push({ key: "times", values: { perActive: formatInterval(perD, "money", ctx, words, { currency }), amount: formatApproxMoneyInterval(amount, currency, ctx, words) } });
  const annual = scaleBy(amount, twelveMonthFactor(100 - tD));
  lines.push({ key: "annual", values: { amount: formatApproxMoneyInterval(annual, currency, ctx, words) } });
  return { ...impact, mrrPerMonth: amount, mrrAfter12Months: annual, lines };
}

// --- The derivation of an app (§21.5.5, APP-6) ------------------------------------

/**
 * One of the app's per-install figures: known when the scenario computed it — `solid` if every input it reads under
 * this monetization (`appInputsOf`) is known and solid, `approximate` otherwise — else uncomputable, naming the
 * inputs that are not known. A figure whose inputs are all known and that is still null (an install that never pays
 * its cost back) names nothing: it is a verdict, not a missing number.
 */
function installFigure(state: EngineState, ctx: EngineCalcContext, id: AppDerivedId, m: AppMonetization, value: Interval | null): DerivedValue {
  const inputs = appInputsOf(id, m);
  const knowns = inputs.map((input) => knownIn(state, input, ctx));
  if (value) return { kind: "known", value, confidence: knowns.every((k) => k.kind === "known" && k.confidence === "solid") ? "solid" : "approximate" };
  return { kind: "uncomputable", missing: inputs.filter((_, i) => knowns[i]!.kind !== "known") };
}

/**
 * What an app derives in place of `unitEconomics` (§21.5.5): the value of an install over 36 months (`ltv`), its
 * payback and its twelve-month value ÷ its cost (`ltvCac`), from `buildAppScenario(…).today.kpis` — called directly:
 * going through `scenarioOf` would make this module import `scenario-of.ts`, which imports it. `grr` and `nrr` are the
 * self-serve engine's own with subscriptions, and never shown without them (§21.6, §21.7). The cost per install's
 * variant travels with the result, as the CAC's does.
 */
export function appUnitEconomics(state: EngineState, ctx: EngineCalcContext): UnitEconomics {
  const m = monetizationFor(state.setup);
  const kpis = buildAppScenario(state, {}, ctx).today.kpis;
  const retention = m.subscriptions ? unitEconomics(state, ctx) : null;
  return {
    cacVariant: currentSnapshot(state).metrics["app.acq.cpi"]?.variant ?? null,
    ltv: installFigure(state, ctx, "app.rev.install-ltv", m, kpis.ltv),
    payback: installFigure(state, ctx, "app.rev.install-payback", m, kpis.payback),
    ltvCac: installFigure(state, ctx, "app.rev.value-to-cost", m, kpis.ltvCac),
    grr: retention?.grr ?? { kind: "uncomputable", missing: [] },
    nrr: retention?.nrr ?? { kind: "uncomputable", missing: [] },
  };
}

/**
 * A stream's share of the total: known, or uncomputable naming the inputs it lacks — the unknown ones first, else the
 * first one (`total.ts#part`, which is private to the hybrid).
 */
function streamPart(state: EngineState, ctx: EngineCalcContext, value: Interval | null, confidence: Exclude<Confidence, "unknown">, inputs: MetricId[]): DerivedValue {
  if (value) return { kind: "known", value, confidence };
  const unknown = inputs.filter((id) => knownIn(state, id, ctx).kind !== "known");
  return { kind: "uncomputable", missing: unknown.length > 0 ? unknown : inputs.slice(0, 1) };
}

/**
 * The app's two streams and their total, three ways (§21.5.5): this month, new a month, in twelve months. A part is
 * `null` when its stream is not ticked; a total exists only when every ticked part does (S9, `total.ts#sumParts`).
 * This month is each stream's revenue of the month — the first point of its curve when the curve exists, and still
 * known when it does not (the installs of the month missing: §21.5.3 point 5, decided on 2026-10-05).
 */
function appStreams(state: EngineState, ctx: EngineCalcContext, inputs: AppInputs, app: AppKpis): AppDerived["streams"] {
  const { m } = inputs;
  const snapshot = currentSnapshot(state);
  const usageTicked = hasUsageStream(m);

  // Typed as counts, the month's revenue is exact (« 28 800 € »); a rate or an estimate makes it a model's.
  const subscriptionsTyped = knownSharedCount(snapshot, "mrrEnd") !== null;
  const perActive = [m.purchases ? "app.rev.purchases-per-active" : null, m.ads ? "app.rev.ads-per-active" : null].filter((id): id is MetricId => id !== null);
  const usageTyped = knownSharedCount(snapshot, "appActives") !== null && perActive.every((id) => countsOf(entryOf(snapshot, id)) !== null);

  const per = usageTicked ? revenuePerActive(m, inputs.purchases, inputs.ads) : null;
  const usageToday = inputs.actives && per ? mul(inputs.actives, per) : null;

  const subscriptionInputs: MetricId[] = ["rev.arpa", "rev.paid-conversion", "ret.logo-churn"];
  const usageInputs: MetricId[] = [...perActive, "ret.d30", "app.ret.active-retention"];
  const part = (ticked: boolean, value: Interval | null, confidence: Exclude<Confidence, "unknown">, missing: MetricId[]) =>
    ticked ? streamPart(state, ctx, value, confidence, missing) : null;
  const sum = (subscriptions: DerivedValue | null, usage: DerivedValue | null): DerivedValue =>
    [subscriptions, usage].filter((p): p is DerivedValue => p !== null).reduce(sumParts);

  const now = {
    subscriptions: part(m.subscriptions, mrrToday(state, ctx), subscriptionsTyped ? "solid" : "approximate", subscriptionInputs.slice(0, 1)),
    usage: part(usageTicked, usageToday, usageTyped ? "solid" : "approximate", perActive),
  };
  const newPerMonth = {
    subscriptions: part(m.subscriptions, app.newSubscriptions, "approximate", subscriptionInputs.slice(0, 2)),
    usage: part(usageTicked, app.newUsage, "approximate", usageInputs.slice(0, perActive.length + 1)),
  };
  const in12Months = {
    subscriptions: part(m.subscriptions, app.subscriptionsPath?.[12] ?? null, "approximate", subscriptionInputs),
    usage: part(usageTicked, app.usagePath?.[12] ?? null, "approximate", usageInputs),
  };
  return {
    now: { ...now, total: sum(now.subscriptions, now.usage) },
    newPerMonth: { ...newPerMonth, total: sum(newPerMonth.subscriptions, newPerMonth.usage) },
    in12Months: { ...in12Months, total: sum(in12Months.subscriptions, in12Months.usage) },
  };
}

/** What only an app derives (§21.5.5): the twelve-month value of an install and the two streams. */
export function appDerived(state: EngineState, ctx: EngineCalcContext): AppDerived {
  const inputs = appInputs(state, ctx);
  const app = buildAppScenario(state, {}, ctx).today.kpis.app!;
  return {
    monetization: inputs.m,
    value12: installFigure(state, ctx, "app.rev.install-value", inputs.m, app.value12),
    streams: appStreams(state, ctx, inputs, app),
  };
}
