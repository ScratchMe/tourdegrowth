import { nextMonth } from "@/lib/engine/cohort";
import { totalIn12 } from "@/lib/engine/deck-motions";
import {
  approxRounding,
  fillTemplate,
  formatApproxMoneyInterval,
  formatDuration,
  formatDurationInterval,
  formatInterval,
  formatMonth,
  pairPrecision,
} from "@/lib/engine/format";
import { sub } from "@/lib/engine/interval";
import type { MoneyKpis } from "@/lib/engine/money";
import { unitInputsPhrase } from "@/lib/engine/phrases";
import { findingText } from "@/lib/engine/sentences";
import type { EngineStrings, ResolvedDerived, ResolvedMetric } from "@/lib/engine/strings";
import type { Currency, EngineCalcContext, EngineDerived, EngineState, Interval, LeverId, MetricId, Motion, YearMonth } from "@/lib/engine/types";
import { knownIn } from "@/lib/engine/values";
import { KPI_INPUTS, SLG_KPI_INPUTS, scenarioFor, slgScenarioFor } from "./scenario-view";

/**
 * The money on the board (design system extension 09, `MoneyBlock`, A20.d
 * T2) — the view model, pure, so the rules that keep it honest are tested
 * rather than eyeballed:
 *
 * - every figure is TODAY's, from the scenario the panel reads
 *   (`scenarioFor`, `slgScenarioFor`, no lever moved): the block, the card
 *   and the slides can never disagree;
 * - the loss is said once, as money, in the finding's own sentence
 *   (`findings()`'s `unit-econ-loss`, C48); its months are its figure, never
 *   a second piece of news; never red;
 * - an unknown is « ? » and says what is missing, never 0; nothing is
 *   computed on revenue;
 * - facts (the MRR, a typed CAC, the month's spend) print to the unit,
 *   estimates and projections at two significant digits with « ~ »;
 * - the warning (C49) comes from `money.ts#paybackWarning`, against the
 *   team's runway or the 30-month floor; never with a certain loss.
 *
 * No copy lives here: words come in as `EngineStrings`.
 */

type MoneyKpisWithBase = MoneyKpis & { mrr: Interval | null; cac: Interval | null; ltv: Interval | null; payback: Interval | null };

export interface MoneyBarsView {
  cost: { label: string; value: string; amount: Interval };
  brings: { label: string; value: string; amount: Interval | null; unknown?: string };
  gap?: { label: string; kind: "short" | "more" | "maybe" };
}

export interface MoneyView {
  motion: Motion;
  eyebrow: string;
  /** MRR then ARR — null in the hybrid, whose total band carries them. */
  figures: { key: "mrr" | "arr"; label: string; value: string }[] | null;
  worth: {
    title: string;
    tag: { label: string; maybe: boolean } | null;
    finding: string;
    bars: MoneyBarsView | null;
    months: string | null;
    /** The months after payback are said: their « ? » follows the sentence. */
    monthsTerm: boolean;
    note: string | null;
  };
  cash: {
    title: string;
    spend: { label: string; value: string | null; missing: string | null };
    tied: { label: string; value: string | null; missing: string | null };
    line: string;
    warning: { text: string; maybe: boolean } | null;
    assumptions: string | null;
  };
}

/** A fact to the unit; a range (an estimate) as one, at two significant digits. */
function factMoney(i: Interval, currency: Currency, ctx: EngineCalcContext, strings: EngineStrings): string {
  return i.lo === i.hi ? formatInterval(i, "money", ctx, strings.units, { currency }) : formatApproxMoneyInterval(i, currency, ctx, strings.units);
}

const abs = (i: Interval): Interval => (i.hi <= 0 ? { lo: -i.hi, hi: -i.lo } : i);

/**
 * The block for one motion. `hybrid`: no MRR and ARR of its own — the total
 * band says the sum (TotalBand, A20.d T3).
 */
export function moneyView(
  input: { state: EngineState; derived: EngineDerived; ctx: EngineCalcContext; strings: EngineStrings; metrics: ResolvedMetric[]; derivedCopy?: ResolvedDerived[] },
  motion: Motion,
  hybrid = false,
): MoneyView {
  const { state, derived, ctx, strings, metrics } = input;
  const w = strings.money;
  const u = strings.units;
  const currency = state.setup.currency;
  const k: MoneyKpisWithBase = motion === "plg" ? scenarioFor(state, {}, ctx).today.kpis : slgScenarioFor(state, {}, ctx).today;
  const money = (i: Interval) => factMoney(i, currency, ctx, strings);
  const approx = (i: Interval) => formatApproxMoneyInterval(i, currency, ctx, u);
  const months = (i: Interval) => formatDurationInterval(i, "months", ctx, u);
  const approxMonths = (i: Interval) => fillTemplate(u.approx, { n: months(i) });

  const inputs = motion === "plg" ? KPI_INPUTS : SLG_KPI_INPUTS;
  const absent = (ids: readonly MetricId[]) => ids.filter((id) => knownIn(state, id, ctx).kind !== "known");
  const phrase = (ids: readonly MetricId[]) => unitInputsPhrase(ids, strings, metrics);
  const marginId: MetricId = motion === "plg" ? "rev.gross-margin" : "slg.rev.gross-margin";

  const snapshot = state.snapshots[state.snapshots.length - 1]!;
  const eyebrow = fillTemplate(w.eyebrow, { month: formatMonth(snapshot.referenceMonth, ctx.locale) });
  const figures =
    hybrid || !k.mrr
      ? null
      : [
          { key: "mrr" as const, label: w.mrr, value: money(k.mrr) },
          { key: "arr" as const, label: w.arr, value: money(k.arr ?? k.mrr) },
        ];

  // --- What one new customer is worth -----------------------------------------------
  const lossFinding = derived.findings.find((f) => f.motion === motion && (f.kind === "unit-econ-loss" || f.kind === "unit-econ-loss-maybe"));
  const verdict = k.loss?.verdict ?? null;
  let finding: string;
  let tag: MoneyView["worth"]["tag"] = null;
  let bars: MoneyBarsView | null = null;
  let note: string | null = null;
  const ltvMissing = absent(inputs.ltv);
  const cacMissing = absent(inputs.cac);
  const cost = k.cac ? { label: w.costs, value: money(k.cac), amount: k.cac } : null;
  if (!k.ltv) {
    finding = fillTemplate(w.noLtv, { input: phrase(ltvMissing.length > 0 ? ltvMissing : inputs.ltv) });
    if (cost) bars = { cost, brings: { label: w.brings, value: "?", amount: null, unknown: fillTemplate(w.missing, { input: phrase(ltvMissing) }) } };
    if (ltvMissing.includes(marginId)) note = w.noMarginNote;
  } else if (!k.cac || !k.loss) {
    finding = fillTemplate(w.noCac, { ltv: approx(k.ltv), input: phrase(cacMissing.length > 0 ? cacMissing : inputs.cac) });
  } else {
    const gap = sub(k.ltv, k.cac);
    const brings = { label: w.brings, value: approx(k.ltv), amount: k.ltv };
    if (verdict === "loss" || verdict === "maybe") {
      // The finding's own sentence: one source for the board, the slides and any export.
      finding = lossFinding ? findingText(lossFinding, state, strings, metrics, input.derivedCopy ?? [], ctx.locale) : "";
      tag = { label: verdict === "loss" ? w.tagLoss : w.tagMaybe, maybe: verdict === "maybe" };
      bars = {
        cost: cost!,
        brings,
        gap: verdict === "loss" ? { label: fillTemplate(w.short, { gap: approx(abs(gap)) }), kind: "short" } : { label: w.overlap, kind: "maybe" },
      };
      if (verdict === "maybe") note = w.maybeWhy;
    } else {
      finding = fillTemplate(w.healthy, { cac: money(k.cac), ltv: approx(k.ltv), gap: approx(gap) });
      bars = { cost: cost!, brings, gap: { label: fillTemplate(w.more, { gap: approx(gap) }), kind: "more" } };
    }
  }

  // The finding's figure in time: the lifetime against the payback (§20.5).
  let monthsText: string | null = null;
  let monthsTerm = false;
  if (k.lifetime && k.payback && verdict) {
    if (verdict === "loss") monthsText = fillTemplate(w.monthsLoss, { life: approxMonths(k.lifetime), payback: months(k.payback) });
    else if (verdict === "maybe") monthsText = fillTemplate(w.monthsMaybe, { life: approxMonths(k.lifetime), payback: months(k.payback) });
    else if (k.afterPayback) {
      monthsText = fillTemplate(w.monthsHealthy, { payback: months(k.payback), life: approxMonths(k.lifetime), after: approxMonths(k.afterPayback) });
      monthsTerm = true;
    }
  }
  if (motion === "slg" && verdict === "none") {
    const unit = derived.motions.find((m) => m.motion === "slg");
    if (unit?.motion === "slg" && unit.unit.renewalTerm === "annual") note = w.slgAnnual;
  }

  // --- Cash -------------------------------------------------------------------------
  const paybackMissing = absent(inputs.payback);
  const missingText = (ids: readonly MetricId[]) => (ids.length > 0 ? fillTemplate(w.missing, { input: phrase(ids) }) : null);
  const line = !k.cash ? w.lineNone : verdict === "loss" ? w.lineLoss : verdict === "maybe" ? w.lineMaybe : w.lineHealthy;
  const assumptions = !k.cash ? null : motion === "plg" ? (k.cash.floor ? w.assumePlg : w.assumePlgOutpaced) : k.cash.floor ? w.assumeSlg : w.assumeSlgOutpaced;
  let warning: MoneyView["cash"]["warning"] = null;
  if (k.warning && k.payback) {
    const runway = k.warning.limit.kind === "runway";
    const maybe = k.warning.verdict === "maybe";
    const template = runway ? (maybe ? w.warnRunwayMaybe : w.warnRunway) : maybe ? w.warnFloorMaybe : w.warnFloor;
    // The limit with its unit, in its grammatical number: « 24 mois », "1 month" (a runway can be typed since A20.d T5).
    warning = { text: fillTemplate(template, { payback: months(k.payback), n: formatDuration(k.warning.limit.months, "months", ctx, u) }), maybe };
  }

  return {
    motion,
    eyebrow,
    figures,
    worth: { title: w.worthTitle, tag, finding, bars, months: monthsText, monthsTerm, note },
    cash: {
      title: w.cashTitle,
      spend: { label: w.spend, value: k.spend ? money(k.spend) : null, missing: k.spend ? null : missingText(absent(inputs.cac)) },
      tied: { label: w.tied, value: k.cash ? approx(k.cash.tiedUp) : null, missing: k.cash ? null : missingText(paybackMissing) },
      line,
      warning,
      assumptions,
    },
  };
}

// --- « Et si ? »: the card's money (design system extension 09, Q8–Q10, A20.d T3.a) -------

export interface LeverMoneyView {
  /** The MRR month by month, today's pace and — once anything moved — with the what-ifs. null: the MRR can't be projected. */
  curve: {
    today: [number, number][];
    whatif: [number, number][] | null;
    keys: { today: string; whatif: string };
    start: string;
    xLabels: [string, string, string];
    summary: string;
  } | null;
  /** « ARR dans 12 mois »: the value with the what-ifs (or today's), `today` once anything moved; `unknown` says what is missing. */
  arr12: { label: string; value: string; today: string | null; unknown: boolean };
  /** One line on one new customer, when the board shows a certain loss and the what-ifs moved; or sales-assisted's straight line. */
  worth: string | null;
  /** The hybrid, once anything moved: both engines' MRR in twelve months. */
  total: string | null;
}

const tuple = (i: Interval): [number, number] => [i.lo, i.hi];
const middle = (i: Interval) => (i.lo + i.hi) / 2;

function monthsAfter(month: YearMonth, n: number): YearMonth {
  let m = month;
  for (let i = 0; i < n; i += 1) m = nextMonth(m);
  return m;
}

/**
 * What the card carries beside its lever: the curve, the ARR in twelve
 * months, the one-customer line, the hybrid's total line. Read from the same
 * scenario as the panel (`scenarioFor`, `slgScenarioFor`, the same targets),
 * so the card, the panel and the slides can never disagree.
 *
 * The one-customer line speaks only when today's numbers say a certain loss
 * (C48: the board's finding) and a what-if moved: the loss gone (every
 * reading of the LTV covers every reading of the CAC), no longer certain,
 * smaller, or untouched — then because the levers moved change neither the
 * LTV nor the CAC (expansion, contraction). `cardLever`: the card's own
 * lever, so the line can say « this lever » when it alone moved.
 */
export function leverMoneyView(
  input: { state: EngineState; derived: EngineDerived; ctx: EngineCalcContext; strings: EngineStrings; metrics: ResolvedMetric[] },
  motion: Motion,
  targets: Partial<Record<LeverId, number>>,
  cardLever: LeverId,
  hybrid = false,
): LeverMoneyView {
  const { state, derived, ctx, strings, metrics } = input;
  const l = strings.lever;
  const u = strings.units;
  const currency = state.setup.currency;
  const s = motion === "plg" ? scenarioFor(state, targets, ctx) : null;
  const g = motion === "slg" ? slgScenarioFor(state, targets, ctx) : null;
  const t: MoneyKpisWithBase & { mrr12: Interval | null } = s ? s.today.kpis : g!.today;
  const p: MoneyKpisWithBase & { mrr12: Interval | null } = s ? s.projected.kpis : g!.projected;
  const moved: readonly LeverId[] = s ? s.moved : g!.moved;
  const isMoved = moved.length > 0;
  const approx = (i: Interval, extra = 0) => formatApproxMoneyInterval(i, currency, ctx, u, extra);
  const money = (i: Interval) => factMoney(i, currency, ctx, strings);

  // The two figures of a pair gain a digit only when two would print the same (§6.2, `pairPrecision`).
  const pair = (a: Interval | null, b: Interval | null): [string | null, string | null] => {
    const extra = a && b && isMoved ? pairPrecision(middle(a), middle(b), approxRounding) : 0;
    return [a ? approx(a, extra) : null, b ? approx(b, extra) : null];
  };

  // --- The curve ---
  let curve: LeverMoneyView["curve"] = null;
  if (t.mrrPath && t.mrr && t.mrr12) {
    const ref = state.snapshots[state.snapshots.length - 1]!.referenceMonth;
    const whatifPath = isMoved && p.mrrPath ? p.mrrPath : null;
    const [today12, whatif12] = pair(t.mrr12, whatifPath ? p.mrr12 : null);
    curve = {
      today: t.mrrPath.map(tuple),
      whatif: whatifPath ? whatifPath.map(tuple) : null,
      keys: { today: l.curveToday, whatif: l.curveWhatif },
      start: fillTemplate(l.curveStart, { mrr: money(t.mrr) }),
      xLabels: [formatMonth(ref, ctx.locale), formatMonth(monthsAfter(ref, 6), ctx.locale), formatMonth(monthsAfter(ref, 12), ctx.locale)],
      summary: whatif12
        ? fillTemplate(l.curveSummaryWhatif, { start: money(t.mrr), today: today12 ?? "", whatif: whatif12 })
        : fillTemplate(l.curveSummary, { start: money(t.mrr), today: today12 ?? "" }),
    };
  }

  // --- The ARR in twelve months: the MRR in twelve months × 12, the same inputs, the same « il manque » ---
  const [arrToday, arrWhatif] = pair(t.arr12, isMoved ? p.arr12 : null);
  const value = isMoved ? arrWhatif : arrToday;
  const inputs = motion === "plg" ? KPI_INPUTS.mrr12 : SLG_KPI_INPUTS.mrr12;
  const absent = inputs.filter((id) => knownIn(state, id, ctx).kind !== "known");
  const unknown =
    absent.length > 0 ? fillTemplate(strings.scenario.kpiUnknown, { input: unitInputsPhrase(absent, strings, metrics) }) : strings.scenario.unknownStep;
  const arr12 = {
    label: l.arr12,
    value: value ?? unknown,
    today: isMoved && arrToday ? fillTemplate(strings.scenario.leverToday, { value: arrToday }) : null,
    unknown: value === null,
  };

  // --- One new customer ---
  let worth: string | null = null;
  if (isMoved && t.loss?.verdict === "loss" && p.loss && p.ltv && p.cac && t.ltv && t.cac) {
    const sameCac = Math.abs(middle(p.cac) - middle(t.cac)) < 0.5;
    const sameLtv = Math.abs(middle(p.ltv) - middle(t.ltv)) < 0.5;
    const cacText = sameCac ? money(p.cac) : approx(p.cac);
    const gap = (i: Interval) => approx(abs(i));
    if (p.loss.verdict === "none") worth = fillTemplate(l.worthOut, { ltv: approx(p.ltv), cac: cacText, gap: approx(p.loss.gap) });
    else if (p.loss.verdict === "maybe") worth = fillTemplate(l.worthMaybe, { ltv: approx(p.ltv), cac: cacText });
    else if (sameCac && sameLtv) worth = fillTemplate(moved.length === 1 && moved[0] === cardLever ? l.worthStill : l.worthStillMany, { gap: gap(p.loss.gap) });
    else {
      // Two amounts side by side: a digit more when two would print the same (`pairPrecision`).
      const [now, before] = pair(abs(p.loss.gap), abs(t.loss.gap));
      worth = fillTemplate(l.worthLess, { gap: now ?? "", before: before ?? "" });
    }
  }
  // Sales-assisted with annual contracts, or a term not known (counted as annual): its line is straight, and says why.
  if (!worth && motion === "slg" && curve) {
    const unit = derived.motions.find((m) => m.motion === "slg");
    if (unit?.motion === "slg" && unit.unit.renewalTerm === "annual") worth = l.curveStraight;
    else if (unit?.motion === "slg" && unit.unit.renewalTerm === null) worth = l.curveStraightAssumed;
  }

  // --- The hybrid's total, once anything moved ---
  let total: string | null = null;
  if (hybrid) {
    // The same targets as the card: in the app they are `state.whatIf`; a test may hand others.
    const line = totalIn12({ ...state, whatIf: targets }, strings, ctx);
    if (line?.projected) total = fillTemplate(l.totalBoth, { whatif: line.projected, today: line.today });
  }

  return { curve, arr12, worth, total };
}
