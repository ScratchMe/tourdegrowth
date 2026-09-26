import { fillTemplate, formatApproxMoneyInterval, formatCountInterval, formatDurationInterval, formatInterval, formatMoney } from "@/lib/engine/format";
import { unitInputsPhrase } from "@/lib/engine/phrases";
import { buildScenario, leverAlone, type LeverView, type Scenario, type ScenarioFunnel, type ScenarioKpis } from "@/lib/engine/scenario";
import type { EngineStrings, ResolvedMetric } from "@/lib/engine/strings";
import type { Currency, EngineCalcContext, EngineState, Interval, LeverId, MetricId } from "@/lib/engine/types";
import { knownIn } from "@/lib/engine/values";

/**
 * The view model of « Et si ? » cumulated (2026-09-26) — pure, so the rules
 * that keep the picture honest are tested rather than eyeballed:
 *
 * - the funnel is drawn in the peloton's grammar, dots on a 10-wide grid,
 *   one dot per 1 % of today's sign-ups: today's sign-ups fill the familiar
 *   100, and what the what-ifs ADD beyond today's reach grows the grid by
 *   rows, in red — so a better sign-up rate finally shows (Antoine: « le Et
 *   si du taux d'inscription ne bouge rien visuellement »);
 * - an estimate stays a hatched range, an unknown step is the unknown shape,
 *   never 0 dots;
 * - every number goes through `lib/engine/format.ts`, the same formatting
 *   the slides print.
 *
 * No copy lives here: words come in as `EngineStrings` slices.
 */

export type ScenarioDot = "filled" | "range" | "gained" | "gainedRange" | "lost" | "empty";

export interface ScenarioGrid {
  kind: "known" | "unknown";
  /** Row by row from the top left; a multiple of 10, at least 100. */
  dots: ScenarioDot[];
}

const count = (v: number) => Math.max(0, Math.round(v));

/**
 * One step of the funnel as dots, `unit` people per dot (today's sign-ups ÷
 * 100). Projected lo..hi is drawn solid then hatched; what lies beyond
 * today's highest reach is red; what today had and the projection loses is
 * outlined in red. Never fewer than 100 dots, so the columns compare.
 */
export function scenarioGrid(today: Interval | null, projected: Interval | null, unit: number): ScenarioGrid {
  if (!today || !projected || !(unit > 0)) return { kind: "unknown", dots: [] };
  const tLo = count(today.lo / unit);
  const tHi = Math.max(tLo, count(today.hi / unit));
  const pLo = count(projected.lo / unit);
  const pHi = Math.max(pLo, count(projected.hi / unit));
  const size = Math.max(100, Math.ceil(Math.max(tHi, pHi) / 10) * 10);
  const dots: ScenarioDot[] = Array.from({ length: size }, (_, i) => {
    if (i < pLo) return i < tHi ? "filled" : "gained";
    if (i < pHi) return i < tHi ? "range" : "gainedRange";
    if (i < tLo) return "lost";
    return "empty";
  });
  return { kind: "known", dots };
}

export type FunnelStepId = "visitors" | "signups" | "activated" | "d30" | "paying";

export interface FunnelStepView {
  id: FunnelStepId;
  label: string;
  /** The projected count, formatted — what the column's numeral says. "?" when unknown. */
  numeral: string;
  /** Today's count, formatted, for the line under the grid. */
  today: string;
  /** « +220 avec tes « Et si » », or null when the step did not move. */
  delta: string | null;
  deltaSign: "up" | "down" | null;
  /** Visitors have no grid: 26 000 dots would say nothing. */
  grid: ScenarioGrid | null;
  /** Sign-ups only: « dont recommandés 60 » — the referral lever's own step. */
  detail: string | null;
}

function same(a: Interval | null, b: Interval | null): boolean {
  return a === b || (a !== null && b !== null && Math.abs(a.lo - b.lo) < 1e-9 && Math.abs(a.hi - b.hi) < 1e-9);
}

/** The five steps, visitors first — the step Antoine found missing. */
export function funnelSteps(scenario: Scenario, ctx: EngineCalcContext, strings: EngineStrings): FunnelStepView[] {
  const w = strings.scenario;
  const t = scenario.today.funnel;
  const p = scenario.projected.funnel;
  const unit = t.signups ? (t.signups.lo + t.signups.hi) / 2 / 100 : 0;
  const people = (i: Interval | null) => (i ? formatCountInterval(i, ctx, strings.units) : "?");
  const step = (id: FunnelStepId, label: string, key: keyof Omit<ScenarioFunnel, "perHundred">, withGrid: boolean): FunnelStepView => {
    const today = t[key];
    const projected = p[key];
    const moved = !same(today, projected) && today !== null && projected !== null;
    const diff = moved ? { lo: projected!.lo - today!.lo, hi: projected!.hi - today!.hi } : null;
    const mid = diff ? (diff.lo + diff.hi) / 2 : 0;
    const shown = diff && Math.round(Math.abs(mid)) >= 1 ? diff : null;
    const magnitude = shown ? people({ lo: Math.min(Math.abs(shown.lo), Math.abs(shown.hi)), hi: Math.max(Math.abs(shown.lo), Math.abs(shown.hi)) }) : "";
    return {
      id,
      label,
      numeral: people(projected),
      today: people(today),
      delta: shown ? (mid > 0 ? w.gained : w.lost).replace("{n}", magnitude) : null,
      deltaSign: shown ? (mid > 0 ? "up" : "down") : null,
      grid: withGrid ? scenarioGrid(today, projected, unit) : null,
      detail: id === "signups" && p.referred ? `${w.referred} ${people(p.referred)}` : null,
    };
  };
  return [
    step("visitors", w.visitors, "visitors", false),
    step("signups", w.signups, "signups", true),
    step("activated", w.activated, "activated", true),
    step("d30", w.d30, "d30", true),
    step("paying", w.paying, "paying", true),
  ];
}

export type KpiId = "mrr12" | "newMrr" | "nrr" | "grr" | "cac" | "ltv" | "payback";

export interface KpiView {
  id: KpiId;
  label: string;
  today: string | null;
  projected: string | null;
  /** « +12 400 € » / « +1 pt » — null when the figure did not move or is unknown. */
  delta: string | null;
  /** Better for the business, not bigger: a lower CAC or payback is "better". */
  tone: "better" | "worse" | null;
  direction: "up" | "down" | null;
  /** What to enter for a figure unknown with the what-ifs: « il manque la marge brute ». */
  unknown: string;
}

/**
 * The numbers each growth figure is computed from. Only the ones not entered
 * are named, through `unitInputsPhrase` (« la marge brute et l'ARPA ») —
 * never the whole list, which would ask for what is already there.
 */
const KPI_INPUTS: Record<KpiId, readonly MetricId[]> = {
  mrr12: ["rev.arpa", "rev.paid-conversion", "ret.logo-churn"],
  newMrr: ["rev.arpa", "rev.paid-conversion"],
  nrr: ["ret.logo-churn", "rev.contraction", "rev.expansion"],
  grr: ["ret.logo-churn", "rev.contraction"],
  cac: ["acq.cac"],
  ltv: ["rev.arpa", "rev.gross-margin", "ret.logo-churn"],
  payback: ["acq.cac", "rev.arpa", "rev.gross-margin"],
};

const LOWER_IS_BETTER: readonly KpiId[] = ["cac", "payback"];

/** The growth numbers, today → with the what-ifs. A figure unknown today AND projected is still listed: its absence is information. */
export function kpiRows(
  scenario: Scenario,
  ctx: EngineCalcContext,
  strings: EngineStrings,
  currency: Currency,
  missing: { state: EngineState; metrics: ResolvedMetric[] },
): KpiView[] {
  const w = strings.scenario;
  const unknownText = (id: KpiId) => {
    const absent = KPI_INPUTS[id].filter((m) => knownIn(missing.state, m, ctx).kind !== "known");
    // Every input entered and still no figure (the month's sign-ups missing, say): the plain « inconnu ».
    return absent.length > 0 ? fillTemplate(w.kpiUnknown, { input: unitInputsPhrase(absent, strings, missing.metrics) }) : w.unknownStep;
  };
  const money = (i: Interval | null) => (i ? formatApproxMoneyInterval(i, currency, ctx, strings.units) : null);
  const percent = (i: Interval | null) => (i ? formatInterval(i, "percent", ctx, strings.units) : null);
  const months = (i: Interval | null) => (i ? formatDurationInterval(i, "months", ctx, strings.units) : null);
  const rows: { id: KpiId; label: string; pick: (k: ScenarioKpis) => Interval | null; show: (i: Interval | null) => string | null; delta: (d: number) => string }[] = [
    { id: "mrr12", label: w.kpiMrr12, pick: (k) => k.mrr12, show: money, delta: (d) => signed(formatMoney(Math.abs(d), currency, ctx.locale), d) },
    { id: "newMrr", label: w.kpiNewMrr, pick: (k) => k.newMrr, show: money, delta: (d) => signed(formatMoney(Math.abs(d), currency, ctx.locale), d) },
    { id: "nrr", label: w.kpiNrr, pick: (k) => k.nrr, show: percent, delta: (d) => signed(points(Math.abs(d), strings, ctx), d) },
    { id: "grr", label: w.kpiGrr, pick: (k) => k.grr, show: percent, delta: (d) => signed(points(Math.abs(d), strings, ctx), d) },
    { id: "cac", label: w.kpiCac, pick: (k) => k.cac, show: money, delta: (d) => signed(formatMoney(Math.abs(d), currency, ctx.locale), d) },
    { id: "ltv", label: w.kpiLtv, pick: (k) => k.ltv, show: money, delta: (d) => signed(formatMoney(Math.abs(d), currency, ctx.locale), d) },
    { id: "payback", label: w.kpiPayback, pick: (k) => k.payback, show: months, delta: (d) => signed(months({ lo: Math.abs(d), hi: Math.abs(d) }) ?? "", d) },
  ];
  return rows.map((row) => {
    const today = row.pick(scenario.today.kpis);
    const projected = row.pick(scenario.projected.kpis);
    const d = today && projected ? (projected.lo + projected.hi) / 2 - (today.lo + today.hi) / 2 : 0;
    const printedToday = row.show(today);
    const printedProjected = row.show(projected);
    // A change too small to print (the same text both sides) is no change.
    const moved = printedToday !== null && printedProjected !== null && printedToday !== printedProjected && d !== 0;
    const better = LOWER_IS_BETTER.includes(row.id) ? d < 0 : d > 0;
    return {
      id: row.id,
      label: row.label,
      today: printedToday,
      projected: printedProjected,
      delta: moved ? row.delta(d) : null,
      tone: moved ? (better ? "better" : "worse") : null,
      direction: moved ? (d > 0 ? "up" : "down") : null,
      unknown: unknownText(row.id),
    };
  });
}

/** U+2212 for a minus: StatTile.tsx asks for it, and a hyphen reads as a dash. */
function signed(text: string, d: number): string {
  return `${d > 0 ? "+" : "\u2212"}${text}`;
}

/** A difference of two percents is in points, never a percent of a percent. */
function points(d: number, strings: EngineStrings, ctx: EngineCalcContext): string {
  return strings.scenario.points.replace("{n}", formatInterval({ lo: d, hi: d }, "ratio", ctx, strings.units));
}

export interface LeverGain {
  id: LeverId;
  /** MRR in 12 months, this lever alone minus today. null when the MRR can't be projected. */
  gain: number | null;
}

/**
 * What each moved lever brings alone, and the total together — the line
 * that shows the compounding (the whole is worth more than the sum).
 */
export function leverGains(state: EngineState, scenario: Scenario, ctx: EngineCalcContext): { alone: LeverGain[]; together: number | null; sumAlone: number | null } {
  const mid = (i: Interval | null) => (i ? (i.lo + i.hi) / 2 : null);
  const base = mid(scenario.today.kpis.mrr12);
  const withTargets: EngineState = { ...state, whatIf: Object.fromEntries(scenario.levers.filter((l) => l.target !== null).map((l) => [l.id, l.target!])) };
  const alone = scenario.moved.map((id) => {
    const s = leverAlone(withTargets, id, ctx);
    const projected = s ? mid(s.projected.kpis.mrr12) : null;
    return { id, gain: base !== null && projected !== null ? projected - base : null };
  });
  const projected = mid(scenario.projected.kpis.mrr12);
  const together = base !== null && projected !== null ? projected - base : null;
  const sumAlone = alone.every((a) => a.gain !== null) ? alone.reduce((acc, a) => acc + (a.gain ?? 0), 0) : null;
  return { alone, together, sumAlone };
}

/** The scenario the panel shows for a map of targets — one entry point, so the panel and its tests read the same thing. */
export function scenarioFor(state: EngineState, targets: Partial<Record<LeverId, number>>, ctx: EngineCalcContext): Scenario {
  return buildScenario(state, targets, ctx);
}

export interface LeverRowView {
  id: LeverId;
  name: string;
  /** « aujourd'hui 18 % » — null for a lever not entered, which gets no slider. */
  today: string | null;
  /** Today's value alone, « 18 % », for the table of what each lever brings. */
  todayValue: string | null;
  min: number;
  max: number;
  step: number;
  /** Where the slider stands: the target, else today's middle on the step. */
  position: number;
  /** What the slider says: the target, or today's value as entered (« 6 à 9 % ») — its output and its `aria-valuetext`. */
  valueText: string;
  moved: boolean;
}

const middle = (i: Interval) => (i.lo + i.hi) / 2;
/** On the step, halves rounded up — 3.15 / 0.1 is 31.499… in floating point, and must still give 3.2. */
const onStep = (v: number, step: number) => Math.round(Math.round(v / step + 1e-9) * step * 1000) / 1000;

/** One lever's value in its own unit: « 24 % », « 150 € ». */
function leverText(lever: LeverView, v: Interval, ctx: EngineCalcContext, strings: EngineStrings, currency: Currency): string {
  return lever.unit === "money" ? formatInterval(v, "money", ctx, strings.units, { currency }) : formatInterval(v, "percent", ctx, strings.units);
}

/** The sliders, in lever order (the funnel's order, then the money). */
export function leverRows(scenario: Scenario, ctx: EngineCalcContext, strings: EngineStrings, currency: Currency, metrics: ResolvedMetric[]): LeverRowView[] {
  return scenario.levers.map((lever) => {
    const name = metrics.find((m) => m.id === lever.id)?.name ?? lever.id;
    if (!lever.today) return { id: lever.id, name, today: null, todayValue: null, min: 0, max: 0, step: 1, position: 0, valueText: "", moved: false };
    const todayText = leverText(lever, lever.today, ctx, strings, currency);
    const moved = lever.target !== null;
    return {
      id: lever.id,
      name,
      today: fillTemplate(strings.scenario.leverToday, { value: todayText }),
      todayValue: todayText,
      min: lever.min,
      max: lever.max,
      step: lever.step,
      position: moved ? lever.target! : onStep(middle(lever.today), lever.step),
      valueText: moved ? leverText(lever, { lo: lever.target!, hi: lever.target! }, ctx, strings, currency) : todayText,
      moved,
    };
  });
}

/**
 * The target a slider position means. Back on today's value — half a step
 * either side of it — is no target at all: « back to today » removes the
 * lever from the scenario rather than testing today against itself.
 */
export function targetAt(lever: Pick<LeverView, "today" | "step">, position: number): number | null {
  if (!lever.today) return null;
  const at = onStep(position, lever.step);
  return Math.abs(at - onStep(middle(lever.today), lever.step)) < lever.step / 2 ? null : at;
}

/** The map of targets after one slider moved: that lever set or removed, the others untouched. */
export function withTarget(targets: Partial<Record<LeverId, number>>, id: LeverId, target: number | null): Partial<Record<LeverId, number>> {
  const { [id]: _previous, ...rest } = targets;
  return target === null ? rest : { ...rest, [id]: target };
}

/** The shapes the grids use, for a legend that names only what is drawn. */
export function dotsInUse(steps: readonly FunnelStepView[]): Set<ScenarioDot> {
  return new Set(steps.flatMap((s) => (s.grid?.kind === "known" ? s.grid.dots : [])));
}

/** One step's grid as a sentence: « Activés : 197, contre 148 aujourd'hui ». */
export function gridAria(step: FunnelStepView, strings: EngineStrings): string {
  return fillTemplate(strings.scenario.gridAria, { label: step.label, value: step.numeral, today: step.today });
}

/** A gain on the MRR in twelve months, signed: « +12 000 € », « −300 € ». */
export function gainText(gain: number, currency: Currency, ctx: EngineCalcContext): string {
  return signed(formatMoney(Math.abs(Math.round(gain)), currency, ctx.locale), gain);
}

