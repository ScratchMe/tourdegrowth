import {
  approxRounding,
  fillTemplate,
  formatApproxMoneyInterval,
  formatCountInterval,
  formatDurationInterval,
  formatInterval,
  formatMoney,
  joinList,
  pairPrecision,
  rateRounding,
  roundSignificant,
} from "@/lib/engine/format";
import { unitInputsPhrase } from "@/lib/engine/phrases";
import { buildScenario, leverAlone, type LeverView, type Scenario, type ScenarioFunnel, type ScenarioKpis } from "@/lib/engine/scenario";
import { buildSlgScenario, oppsCreated, oppsFromSelfServe, type SlgScenario, type SlgScenarioKpis } from "@/lib/engine/slg-scenario";
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
 *   rows, as ringed dots (ink, never red: audit S-5) — so a better sign-up rate finally shows (Antoine: « le Et
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
 * today's highest reach is `gained` (a ringed dot); what today had and the
 * projection loses is `lost` (struck through). Never fewer than 100 dots, so the columns compare.
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

export type KpiId = "mrr12" | "newMrr" | "nrr" | "grr" | "cac" | "ltv" | "payback" | "won";

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
const KPI_INPUTS: Record<Exclude<KpiId, "won">, readonly MetricId[]> = {
  mrr12: ["rev.arpa", "rev.paid-conversion", "ret.logo-churn"],
  newMrr: ["rev.arpa", "rev.paid-conversion"],
  nrr: ["ret.logo-churn", "rev.contraction", "rev.expansion"],
  grr: ["ret.logo-churn", "rev.contraction"],
  cac: ["acq.cac"],
  ltv: ["rev.arpa", "rev.gross-margin", "ret.logo-churn"],
  payback: ["acq.cac", "rev.arpa", "rev.gross-margin"],
};

/** Sales-assisted's (§18.5.5): the quarter's new contracts at their ACV, the base at the 12-month NRR. No GRR: nobody types one. */
const SLG_KPI_INPUTS: Record<Exclude<KpiId, "grr">, readonly MetricId[]> = {
  mrr12: ["slg.rev.arpa", "slg.rev.acv", "slg.ret.renewal"],
  newMrr: ["slg.rev.win-rate", "slg.rev.acv"],
  nrr: ["slg.ret.nrr"],
  cac: ["slg.acq.cac"],
  ltv: ["slg.rev.acv", "slg.rev.gross-margin", "slg.ret.renewal"],
  payback: ["slg.acq.cac", "slg.rev.acv", "slg.rev.gross-margin"],
  won: ["slg.rev.win-rate"],
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
    const absent = KPI_INPUTS[id as Exclude<KpiId, "won">].filter((m) => knownIn(missing.state, m, ctx).kind !== "known");
    // Every input entered and still no figure (the month's sign-ups missing, say): the plain « inconnu ».
    return absent.length > 0 ? fillTemplate(w.kpiUnknown, { input: unitInputsPhrase(absent, strings, missing.metrics) }) : w.unknownStep;
  };
  // `extra`: the digits a today → projected pair needs so its move reads (`pairPrecision`, 2026-09-28).
  const money = (i: Interval | null, extra = 0) => (i ? formatApproxMoneyInterval(i, currency, ctx, strings.units, extra) : null);
  const percent = (i: Interval | null, extra = 0) => (i ? formatInterval(i, "percent", ctx, strings.units, { extra }) : null);
  const months = (i: Interval | null) => (i ? formatDurationInterval(i, "months", ctx, strings.units) : null);
  type Row = {
    id: KpiId;
    label: string;
    pick: (k: ScenarioKpis) => Interval | null;
    show: (i: Interval | null, extra?: number) => string | null;
    /** The figure's own rounding, for `pairPrecision`; none (months) keeps the usual precision. */
    round?: (v: number, extra: number) => number;
    delta: (d: number) => string;
  };
  const moneyRow = { show: money, round: approxRounding, delta: (d: number) => signed(roundedMoney(d, currency, ctx), d) };
  const rateRow = { show: percent, round: rateRounding, delta: (d: number) => signed(points(Math.abs(d), strings, ctx), d) };
  const rows: Row[] = [
    { id: "mrr12", label: w.kpiMrr12, pick: (k) => k.mrr12, ...moneyRow },
    { id: "newMrr", label: w.kpiNewMrr, pick: (k) => k.newMrr, ...moneyRow },
    { id: "nrr", label: w.kpiNrr, pick: (k) => k.nrr, ...rateRow },
    { id: "grr", label: w.kpiGrr, pick: (k) => k.grr, ...rateRow },
    { id: "cac", label: w.kpiCac, pick: (k) => k.cac, ...moneyRow },
    { id: "ltv", label: w.kpiLtv, pick: (k) => k.ltv, ...moneyRow },
    { id: "payback", label: w.kpiPayback, pick: (k) => k.payback, show: months, delta: (d) => signed(months({ lo: Math.abs(d), hi: Math.abs(d) }) ?? "", d) },
  ];
  const mid = (i: Interval) => (i.lo + i.hi) / 2;
  return rows.map((row) => {
    const today = row.pick(scenario.today.kpis);
    const projected = row.pick(scenario.projected.kpis);
    const d = today && projected ? mid(projected) - mid(today) : 0;
    const extra = today && projected && row.round ? pairPrecision(mid(today), mid(projected), row.round) : 0;
    const printedToday = row.show(today, extra);
    const printedProjected = row.show(projected, extra);
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

/**
 * What a screen reader hears once a slider settles (design audit 2026-09-27,
 * S-4): the growth numbers that moved, in one sentence, read once. The seven
 * tiles used to sit in a live region of their own, re-read at every step of
 * every slider. Unmoved and unknown figures stay out — « LTV, missing the
 * gross margin » at each settle says nothing new. With nothing moved (every
 * lever back to today), the known figures as they are today. Empty when no
 * figure is known at all: an empty region announces nothing.
 */
export function kpiAnnouncement(kpis: readonly KpiView[], moved: boolean, strings: EngineStrings): string {
  const w = strings.scenario;
  const changed = kpis.filter((k) => k.projected !== null && k.delta !== null && k.tone !== null);
  const shown = changed.length > 0 ? changed : kpis.filter((k) => k.projected !== null);
  if (shown.length === 0) return "";
  const figures = shown.map((k) =>
    k.delta !== null && k.tone !== null
      ? fillTemplate(w.announceChanged, { label: k.label, value: k.projected ?? "", delta: k.delta, sense: k.tone === "better" ? w.better : w.worse })
      : fillTemplate(w.announceFigure, { label: k.label, value: k.projected ?? "" }),
  );
  return fillTemplate(w.announce, { title: w.kpisTitle, context: moved ? w.kpiIf : w.kpiToday, figures: joinList(figures, strings.grammar) });
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
  return signed(roundedMoney(gain, currency, ctx), gain);
}

/**
 * A projected amount of money, unsigned, at the precision the projection
 * has: two significant digits, as every projected figure beside it
 * (`formatApproxMoneyInterval`). « +29 916,28 € » under a tile that reads
 * « ~130 000 € » claimed a precision the model never had (2026-09-27).
 */
export function roundedMoney(amount: number, currency: Currency, ctx: EngineCalcContext): string {
  return formatMoney(roundSignificant(Math.abs(amount), 2), currency, ctx.locale);
}


// --- Sales-assisted (A7.3.c S3, engine spec §18.5.5) ----------------------------

/** The sales-assisted panel's scenario: the same targets map, its own levers (`slg-scenario.ts`). */
export function slgScenarioFor(state: EngineState, targets: Partial<Record<LeverId, number>>, ctx: EngineCalcContext): SlgScenario {
  return buildSlgScenario(state, targets, ctx);
}

/** A sales-assisted lever's value: a percent, money (the ACV), or whole opportunities (the link, C25 Q7). */
function slgLeverText(lever: LeverView, v: Interval, ctx: EngineCalcContext, strings: EngineStrings, currency: Currency): string {
  if (lever.unit === "count") return formatCountInterval(v, ctx, strings.units);
  return leverText(lever, v, ctx, strings, currency);
}

/**
 * Sales-assisted's sliders, in lever order: the three rates, the ACV, then
 * the link in the hybrid. The link's slider is named for what it moves —
 * « Opportunités venues du libre-service, par trimestre » — not its sheet's
 * name: the slider counts opportunities, the sheet a share.
 */
export function slgLeverRows(scenario: SlgScenario, ctx: EngineCalcContext, strings: EngineStrings, currency: Currency, metrics: ResolvedMetric[]): LeverRowView[] {
  return scenario.levers.map((lever) => {
    const name = lever.id === "link.pql-handoff" ? strings.scenario.linkSlider : (metrics.find((m) => m.id === lever.id)?.name ?? lever.id);
    if (!lever.today) return { id: lever.id, name, today: null, todayValue: null, min: 0, max: 0, step: 1, position: 0, valueText: "", moved: false };
    const todayText = slgLeverText(lever, lever.today, ctx, strings, currency);
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
      valueText: moved ? slgLeverText(lever, { lo: lever.target!, hi: lever.target! }, ctx, strings, currency) : todayText,
      moved,
    };
  });
}

/**
 * Sales-assisted's growth figures, today → with the what-ifs: the MRR in
 * twelve months, the new MRR a month, the 12-month NRR, the CAC, the LTV, the
 * payback, and the new customers a quarter. The same tile rules as
 * self-serve's (`kpiRows`): a change too small to print is no change, and a
 * figure unknown says which of ITS inputs is missing.
 */
export function slgKpiRows(
  scenario: SlgScenario,
  ctx: EngineCalcContext,
  strings: EngineStrings,
  currency: Currency,
  missing: { state: EngineState; metrics: ResolvedMetric[] },
): KpiView[] {
  const w = strings.scenario;
  const unknownText = (id: Exclude<KpiId, "grr">) => {
    const absent = SLG_KPI_INPUTS[id].filter((m) => knownIn(missing.state, m, ctx).kind !== "known");
    return absent.length > 0 ? fillTemplate(w.kpiUnknown, { input: unitInputsPhrase(absent, strings, missing.metrics) }) : w.unknownStep;
  };
  const money = (i: Interval | null, extra = 0) => (i ? formatApproxMoneyInterval(i, currency, ctx, strings.units, extra) : null);
  const percent = (i: Interval | null, extra = 0) => (i ? formatInterval(i, "percent", ctx, strings.units, { extra }) : null);
  const months = (i: Interval | null) => (i ? formatDurationInterval(i, "months", ctx, strings.units) : null);
  const customers = (i: Interval | null) => (i ? formatCountInterval(i, ctx, strings.units) : null);
  type Row = {
    id: Exclude<KpiId, "grr">;
    label: string;
    pick: (k: SlgScenarioKpis) => Interval | null;
    show: (i: Interval | null, extra?: number) => string | null;
    round?: (v: number, extra: number) => number;
    delta: (d: number) => string;
  };
  const moneyRow = { show: money, round: approxRounding, delta: (d: number) => signed(roundedMoney(d, currency, ctx), d) };
  const rows: Row[] = [
    { id: "mrr12", label: w.kpiMrr12, pick: (k) => k.mrr12, ...moneyRow },
    { id: "newMrr", label: w.kpiNewMrr, pick: (k) => k.newMrr, ...moneyRow },
    { id: "nrr", label: w.kpiNrr12, pick: (k) => k.nrr, show: percent, round: rateRounding, delta: (d) => signed(points(Math.abs(d), strings, ctx), d) },
    { id: "cac", label: w.kpiCac, pick: (k) => k.cac, ...moneyRow },
    { id: "ltv", label: w.kpiLtv, pick: (k) => k.ltv, ...moneyRow },
    { id: "payback", label: w.kpiPayback, pick: (k) => k.payback, show: months, delta: (d) => signed(months({ lo: Math.abs(d), hi: Math.abs(d) }) ?? "", d) },
    { id: "won", label: w.kpiWon, pick: (k) => k.won, show: customers, delta: (d) => signed(customers({ lo: Math.abs(d), hi: Math.abs(d) }) ?? "", d) },
  ];
  const mid = (i: Interval) => (i.lo + i.hi) / 2;
  return rows.map((row) => {
    const today = row.pick(scenario.today);
    const projected = row.pick(scenario.projected);
    const d = today && projected ? mid(projected) - mid(today) : 0;
    const extra = today && projected && row.round ? pairPrecision(mid(today), mid(projected), row.round) : 0;
    const printedToday = row.show(today, extra);
    const printedProjected = row.show(projected, extra);
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

/** One line of the quarter: today → with the what-ifs, both formatted, the second null when nothing moved it. */
export interface QuarterRowView {
  id: "opps" | "fromSelfServe" | "won";
  label: string;
  today: string;
  projected: string | null;
}

/**
 * Sales-assisted's quarter, where self-serve draws its month's funnel: the
 * opportunities created (and, in the hybrid, how many came from self-serve),
 * then the new customers. Only the link moves the opportunities — the others
 * don't change (§18.5.5) — and the new customers follow every lever.
 */
export function quarterRows(state: EngineState, scenario: SlgScenario, ctx: EngineCalcContext, strings: EngineStrings): QuarterRowView[] {
  const w = strings.scenario;
  const people = (i: Interval | null) => (i ? formatCountInterval(i, ctx, strings.units) : w.unknownStep);
  const o = oppsCreated(state);
  const l = oppsFromSelfServe(state, ctx);
  const link = scenario.levers.find((x) => x.id === "link.pql-handoff");
  const rows: QuarterRowView[] = [];
  if (o !== null) {
    const projectedO = link?.target !== null && link?.target !== undefined && l ? { lo: o + link.target - l.hi, hi: o + link.target - l.lo } : null;
    rows.push({ id: "opps", label: w.opps, today: people({ lo: o, hi: o }), projected: projectedO ? people(projectedO) : null });
    if (link && l) {
      rows.push({ id: "fromSelfServe", label: w.oppsFromSelfServe, today: people(l), projected: link.target !== null ? people({ lo: link.target, hi: link.target }) : null });
    }
  }
  const won = scenario.today.won;
  const projectedWon = scenario.projected.won;
  const printed = people(projectedWon);
  rows.push({ id: "won", label: w.won, today: people(won), projected: won && projectedWon && printed !== people(won) ? printed : null });
  return rows;
}
