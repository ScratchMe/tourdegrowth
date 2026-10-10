import { approxRounding, fillTemplate, formatApproxMoneyInterval, formatDurationInterval, formatInterval, pairPrecision } from "@/lib/engine/format";
import type { LossCheck, MoneyKpis } from "@/lib/engine/money";
import { unitInputsPhrase } from "@/lib/engine/phrases";
import type { AppKpis } from "@/lib/engine/scenario";
import { isApp } from "@/lib/engine/setup-type";
import type { EngineStrings, ResolvedMetric } from "@/lib/engine/strings";
import type { EngineCalcContext, EngineState, Interval, LeverId, MetricId, Motion } from "@/lib/engine/types";
import { knownIn } from "@/lib/engine/values";
import {
  appMissingPhrase,
  gainText,
  kpiRows,
  leverGains,
  leverRows,
  roundedMoney,
  scenarioFor,
  selfServeKpiInputs,
  SLG_KPI_INPUTS,
  slgKpiRows,
  slgScenarioFor,
  type KpiView,
} from "./scenario-view";

/**
 * The full « Et si ? » panel's figures (design system extension 09, Q9,
 * A20.d T3.b) — three tables by meaning, today against the what-ifs, and the
 * compounding drawn. Pure, from the same scenario the card and the slides
 * read, so they can never disagree; no copy lives here.
 *
 * - a « ? » is never a 0, and its row says what is missing;
 * - a change says its sign and its sense in words (« mieux », « moins
 *   bien »), never a colour; a figure the what-ifs did not move is
 *   « stable »;
 * - the month's spend never moves (the same spend with the what-ifs): it is
 *   a fact, to the unit;
 * - months after payback below zero: « part ~5 mois avant », the loss in months;
 * - an app (§21.6.4): its own inputs, a « 12-month value » row (the ratio's numerator) and no « months after
 *   payback » nor cash row: an install has no counted lifetime and ties up no cash (D11).
 */

export interface FigureRow {
  id: string;
  label: string;
  today: string;
  /** Moved only. */
  whatif: string | null;
  /** Moved only. */
  change: string | null;
  missing: string | null;
}

export interface FigureGroup {
  id: "growth" | "customer" | "cash";
  title: string;
  rows: FigureRow[];
}

export interface LeverSumView {
  title: string;
  rows: { id: LeverId; label: string; value: string; amount: number }[];
  sum: { id: string; label: string; value: string; amount: number };
  together: { id: string; label: string; value: string; amount: number };
  extra: string | null;
}

type Input = { state: EngineState; ctx: EngineCalcContext; strings: EngineStrings; metrics: ResolvedMetric[] };
type Kpis = MoneyKpis & { cac: Interval | null; ltv: Interval | null; payback: Interval | null; app?: AppKpis };

const middle = (i: Interval) => (i.lo + i.hi) / 2;
const abs = (i: Interval): Interval => (i.hi <= 0 ? { lo: -i.hi, hi: -i.lo } : i);
/** U+2212 for a minus, as every change in the engine. */
const signed = (text: string, d: number) => `${d > 0 ? "+" : "−"}${text}`;

export function whatIfFigureGroups(input: Input, motion: Motion, targets: Partial<Record<LeverId, number>>): { moved: boolean; groups: FigureGroup[] } {
  const { state, ctx, strings, metrics } = input;
  const w = strings.scenario;
  const u = strings.units;
  const currency = state.setup.currency;
  const plg = motion === "plg" ? scenarioFor(state, targets, ctx) : null;
  const slg = motion === "slg" ? slgScenarioFor(state, targets, ctx) : null;
  const kpis: KpiView[] = plg ? kpiRows(plg, ctx, strings, currency, { state, metrics }) : slgKpiRows(slg!, ctx, strings, currency, { state, metrics });
  const t: Kpis = plg ? plg.today.kpis : slg!.today;
  const p: Kpis = plg ? plg.projected.kpis : slg!.projected;
  const moved = (plg ? plg.moved : slg!.moved).length > 0;
  const inputs: Partial<Record<string, readonly MetricId[]>> = plg ? selfServeKpiInputs(state.setup) : SLG_KPI_INPUTS;
  const app = plg !== null && isApp(state.setup);

  const missingFor = (ids: readonly MetricId[], revenue = true) => {
    const absent = [...new Set(ids)].filter((id) => knownIn(state, id, ctx).kind !== "known");
    if (app) {
      // An app also names its actives when a revenue figure lacks them; an empty list is never « il manque » (§21.6.4).
      const ask = appMissingPhrase(absent, revenue && t.app?.activesMissing === true, strings, metrics);
      return ask !== null ? fillTemplate(w.kpiUnknown, { input: ask }) : w.unknownStep;
    }
    return absent.length > 0 ? fillTemplate(w.kpiUnknown, { input: unitInputsPhrase(absent, strings, metrics) }) : w.unknownStep;
  };
  const sense = (better: boolean) => (better ? w.better : w.worse);

  // A row the scenario's own KPI rows already print (`kpiRows`, `slgKpiRows`).
  const fromKpi = (id: KpiView["id"]): FigureRow | null => {
    const k = kpis.find((x) => x.id === id);
    if (!k) return null;
    const known = k.today !== null && k.projected !== null;
    return {
      id,
      label: k.label,
      today: k.today ?? "?",
      whatif: moved ? (k.projected ?? "?") : null,
      change: moved ? (k.delta && k.tone ? `${k.delta} ·\u00a0${sense(k.tone === "better")}` : known ? w.stable : "?") : null,
      missing: k.today === null || (moved && k.projected === null) ? k.unknown : null,
    };
  };

  // A row the money adds: printed by `show`, its change by `delta` (null: no change to say).
  const row = (
    id: string,
    label: string,
    a: Interval | null,
    b: Interval | null,
    show: (i: Interval, extra: number) => string,
    delta: (d: number) => string,
    higherIsBetter: boolean,
    missing: readonly MetricId[],
    round?: (v: number, extra: number) => number,
    diff: (a: Interval, b: Interval) => number = (a, b) => middle(b) - middle(a),
    revenue = true,
  ): FigureRow => {
    const extra = moved && a && b && round ? pairPrecision(middle(a), middle(b), round) : 0;
    const today = a ? show(a, extra) : "?";
    const whatif = b ? show(b, extra) : "?";
    const d = a && b ? diff(a, b) : 0;
    const change = !moved ? null : !a || !b ? "?" : today === whatif || d === 0 ? w.stable : `${delta(d)} ·\u00a0${sense(higherIsBetter ? d > 0 : d < 0)}`;
    return { id, label, today, whatif: moved ? whatif : null, change, missing: !a || (moved && !b) ? missingFor(missing, revenue) : null };
  };

  const money = (i: Interval, extra: number) => formatApproxMoneyInterval(i, currency, ctx, u, extra);
  const moneyDelta = (d: number) => signed(roundedMoney(d, currency, ctx), d);
  const months = (i: Interval) => formatDurationInterval(i, "months", ctx, u);
  const monthsDelta = (d: number) => signed(months({ lo: Math.abs(d), hi: Math.abs(d) }), d);
  const ratio = (i: Interval) => fillTemplate(u.times, { n: formatInterval(i, "ratio", ctx, u) });
  const ratioDelta = (d: number) => signed(formatInterval({ lo: Math.abs(d), hi: Math.abs(d) }, "ratio", ctx, u), d);
  // What one new customer leaves: « il manque ~400 € », « ~350 € de plus », or the ranges overlap.
  const gapText = (loss: LossCheck | null, extra: number) => {
    if (!loss) return "?";
    if (loss.verdict === "maybe") return strings.money.overlap;
    return loss.verdict === "loss"
      ? fillTemplate(strings.money.short, { gap: money(abs(loss.gap), extra) })
      : fillTemplate(strings.money.more, { gap: money(loss.gap, extra) });
  };
  // Months after payback: below zero the customer leaves first, and by how many months — so two losses of different
  // sizes never print alike (and read « stable »), and the change adds up to what the two cells say (A21.2).
  const afterText = (i: Interval) =>
    i.hi < 0 ? fillTemplate(w.leavesFirst, { n: fillTemplate(u.approx, { n: months(abs(i)) }) }) : fillTemplate(u.approx, { n: months(i.lo < 0 ? { lo: 0, hi: i.hi } : i) });

  const ltvIds = inputs.ltv ?? [];
  const value12Ids = inputs.value12 ?? [];
  const cacIds = inputs.cac ?? [];
  const paybackIds = inputs.payback ?? [];
  const growth = [fromKpi("newMrr"), fromKpi("nrr"), plg ? fromKpi("grr") : fromKpi("won")].filter((r): r is FigureRow => r !== null);
  // Per new customer, each side in its own words: the loss, the margin, or the overlap. Its change is the gap's.
  const gapExtra = moved && t.loss && p.loss ? pairPrecision(middle(abs(t.loss.gap)), middle(abs(p.loss.gap)), approxRounding) : 0;
  const gapRow: FigureRow = {
    ...row("gap", w.rowGap, t.loss?.gap ?? null, p.loss?.gap ?? null, money, moneyDelta, true, [...ltvIds, ...cacIds], approxRounding),
    today: gapText(t.loss, gapExtra),
    whatif: moved ? gapText(p.loss, gapExtra) : null,
  };
  const customer = [
    fromKpi("cac"),
    // An app: what an install brings back in its first year, the ratio's numerator (§21.6.4).
    app ? row("value12", w.rowValue12, t.app?.value12 ?? null, p.app?.value12 ?? null, money, moneyDelta, true, value12Ids, approxRounding) : null,
    fromKpi("ltv"),
    row("ltvCac", w.rowLtvCac, t.ltvCac, p.ltvCac, ratio, ratioDelta, true, [...ltvIds, ...cacIds]),
    gapRow,
    fromKpi("payback"),
    // Whole months on each side before the difference: « part ~4 mois avant » then « ~9 mois » is +13, never the +14
    // of the raw middles (B15).
    app
      ? null
      : row("after", w.rowAfter, t.afterPayback, p.afterPayback, afterText, monthsDelta, true, [...ltvIds, ...paybackIds], undefined, (a, b) =>
          Math.round(middle(b)) - Math.round(middle(a)),
        ),
  ].filter((r): r is FigureRow => r !== null);
  const cash = [
    // A fact, to the unit: the month's spend never moves with the what-ifs.
    row("spend", w.rowSpend, t.spend, p.spend, (i) => formatInterval(i, "money", ctx, u, { currency }), moneyDelta, false, cacIds, undefined, undefined, false),
    // An app ties up no cash (D11): the group is the month's spend alone.
    app ? null : row("cash", w.rowCash, t.cash?.tiedUp ?? null, p.cash?.tiedUp ?? null, money, moneyDelta, false, paybackIds, approxRounding),
  ].filter((r): r is FigureRow => r !== null);
  return {
    moved,
    groups: [
      { id: "growth", title: w.figuresGrowth, rows: growth },
      { id: "customer", title: w.figuresCustomer, rows: customer },
      { id: "cash", title: w.figuresCash, rows: cash },
    ],
  };
}

/** The money's own rules, after the scenario's, for the figures the tables print. */
export function moneyAssumptions(input: Input, motion: Motion, targets: Partial<Record<LeverId, number>>): string[] {
  const { state, ctx, strings } = input;
  const w = strings.scenario;
  const t: Kpis = motion === "plg" ? scenarioFor(state, targets, ctx).today.kpis : slgScenarioFor(state, targets, ctx).today;
  const out: string[] = [];
  if (t.ltv) out.push(motion === "plg" ? (isApp(state.setup) ? w.assumeLtvApp : w.assumeLtv) : w.assumeLtvSlg);
  if (t.cash) out.push(motion === "plg" ? w.assumeCash : w.assumeCashSlg);
  return out;
}

/**
 * The compounding, drawn (`LeverSum`): with two levers or more, each one's
 * gain on the MRR in twelve months alone, the solo gains added up, the gain
 * together. null when a gain can't be computed: nothing to draw.
 */
export function leverSumView(input: Input, targets: Partial<Record<LeverId, number>>): LeverSumView | null {
  const { state, ctx, strings, metrics } = input;
  const w = strings.scenario;
  const currency = state.setup.currency;
  const scenario = scenarioFor(state, targets, ctx);
  if (scenario.moved.length < 2) return null;
  const gains = leverGains({ ...state, whatIf: targets }, scenario, ctx);
  if (gains.together === null || gains.sumAlone === null || gains.alone.some((g) => g.gain === null)) return null;
  const levers = leverRows(scenario, ctx, strings, currency, metrics);
  const rows = gains.alone.map((g) => {
    const lever = levers.find((l) => l.id === g.id)!;
    return {
      id: g.id,
      label: fillTemplate(w.aloneRow, { lever: lever.name, from: lever.todayValue ?? "", to: lever.valueText }),
      value: gainText(g.gain!, currency, ctx),
      amount: g.gain!,
    };
  });
  const extra = gains.together - gains.sumAlone;
  return {
    title: w.aloneTitle,
    rows,
    sum: { id: "sum", label: w.sumOneByOne, value: fillTemplate(strings.units.approx, { n: roundedMoney(gains.sumAlone, currency, ctx) }), amount: gains.sumAlone },
    together: { id: "together", label: w.sumTogether, value: gainText(gains.together, currency, ctx), amount: gains.together },
    extra: extra >= 1 ? fillTemplate(w.sumExtra, { extra: fillTemplate(strings.units.approx, { n: roundedMoney(extra, currency, ctx) }) }) : null,
  };
}
