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
import { APP_LEVER_IDS, CANDIDATE_IDS, LEVER_IDS, LTV_CAP_MONTHS, appShapeShown, derivedShapeOf, shapesOf, type MetricShape } from "./catalog-shape";
import { isFlow, rankingImpact } from "./impact";
import { add, div, mul, point, scale } from "./interval";
import { acquisitionSpend, arrOf, paybackLimit } from "./money";
import { buildScenario, leverViews, valueOf, type AppKpis, type Scenario, type ScenarioAssumption, type ScenarioFunnel, type ScenarioKpis } from "./scenario";
import type { PanelLeverId } from "./scenario-of"; // type only: scenario-of.ts imports this module
import { DEFAULT_APP_MONETIZATION, monetizationOf } from "./setup-type";
import { knownSharedCount } from "./shared-counts";
import type { AppCandidateId, AppDerivedId, EngineCalcContext, EngineSetup, EngineState, Interval, LeverId, MetricId, SelfServeCandidateId, SharedCount } from "./types";
import { currentSnapshot, knownIn } from "./values";

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
