import type { FunnelColumn, FunnelRate, SideFunnelProps } from "@/components/engine/SideFunnel";
import { MKT_DERIVED_SHAPES } from "@/lib/engine/catalog-shape";
import { periodOf } from "@/lib/engine/cohort";
import { comparatorOf, impactTarget, mktCandidates } from "@/lib/engine/diagnose";
import { sourceLabel } from "@/lib/engine/deck";
import {
  approxRounding,
  fillTemplate,
  formatApproxMoneyInterval,
  formatCountInterval,
  formatInterval,
  formatPercent,
  pairPrecision,
  roundSignificant,
} from "@/lib/engine/format";
import { div, mul, point, scale, sub } from "@/lib/engine/interval";
import { buildMktScenario, mktLeverAlone, mktSidePaths, mktTotalPaths, type MktScenario } from "@/lib/engine/mkt-scenario";
import { streamSum, mktTotalTitle } from "@/lib/engine/mkt-titles";
import { positionLabel, isSingular, subjectOf, type AnyDiagnosis } from "@/lib/engine/phrases";
import { mktSetup } from "@/lib/engine/setup-type";
import { keptPercentOfChurn } from "@/lib/engine/stream";
import type { EngineStrings, ResolvedDerived, ResolvedMetric } from "@/lib/engine/strings";
import type {
  CandidateId,
  DerivedValue,
  EngineCalcContext,
  EngineDerived,
  EngineState,
  Interval,
  LeverId,
  MetricId,
  MktCandidateId,
  MktSide,
  MktTotal,
  MotionDerived,
  YearMonth,
} from "@/lib/engine/types";
import { entryOf, knownIn } from "@/lib/engine/values";
import { cardLever, titleKey } from "./BoardLever";
import { namedStages } from "./number-list";
export { sideOfMetric } from "./number-list";
import { figureGroupsOf, type FigureGroup, type FigureRow } from "./whatif-figures";
import { gainText, kpiRows, leverGains, leverRows, roundedMoney, type KpiView } from "./scenario-view";
import { factMoney, leverMoneyView, moneyOfKpis, MKT_MRR12_INPUTS, type MoneyView } from "./money-view";
import { columnGrid, columnNumeral, fill, monthLabel, numeralText, signupsGrid } from "./visual-model";
import { titleText } from "./Verdict";
import type { EngineTermId } from "./EngineTerm";

/**
 * A marketplace board's view models (engine spec §22.6.2, A23 MKT-7b) — pure, so the rules that keep it honest are tested
 * rather than eyeballed. The board is the hybrid's, read for two SIDES instead of two engines (C70): the total band above
 * the selector sums the two streams; under it, one side at a time — its money, its « Et si » card and panel, its funnel,
 * the « À côté » lines of its diagnosis — each read from its OWN scenario (`buildMktScenario`) with its own strings, and
 * never against the other side's.
 *
 * Everything here returns text already formatted and ids; the components place it. A side's functions take the strings
 * of that side (`marketplaceStrings(…, side)`, §22.8.1); the total's, the neutral set.
 */

export interface MktViewInput {
  state: EngineState;
  derived: EngineDerived;
  ctx: EngineCalcContext;
  strings: EngineStrings;
  metrics: ResolvedMetric[];
  derivedCopy?: ResolvedDerived[];
}

type MktDerived = Extract<MotionDerived, { motion: "mkt" }>;

/** The marketplace's motion of a derived engine: a marketplace always has it (`deriveEngine`). */
export function mktMotion(derived: EngineDerived): MktDerived {
  const motion = derived.motions.find((m): m is MktDerived => m.motion === "mkt");
  if (!motion) throw new Error("a marketplace derives its motion");
  return motion;
}

const mid = (i: Interval) => (i.lo + i.hi) / 2;
const tuple = (i: Interval): [number, number] => [i.lo, i.hi];
/** U+2212 for a minus, as every change in the engine. */
const signed = (text: string, d: number) => `${d > 0 ? "+" : "−"}${text}`;

// --- The total band ---------------------------------------------------------------------

export interface MktTotalView {
  eyebrow: string;
  /** The band's title, without its accent marks (`mkt-titles.ts#mktTotalTitle`): the deck's first. */
  title: string;
  /** The two streams in the order of the sum, commissions then subscriptions: never by their values. */
  engines: { id: MktSide; label: string; value: string; missing: boolean }[];
  total: { label: string; value: string; missing: boolean };
  /** What adds up: the total annualised, the new revenue of a month, and in twelve months — with the what-ifs of both sides once one moved. */
  totals: { key: string; label: string; value: string }[];
  /** Once a what-if moved on either side: today's pace, said once (`mkt.total.todayLine`). The band is the one place the two sides' what-ifs meet. */
  line: string | null;
}

/** One part alone, when the sum cannot be printed: its own two significant digits, « ~ » unless it was typed. */
function partText(part: DerivedValue | null, state: EngineState, ctx: EngineCalcContext, strings: EngineStrings): string {
  if (!part || part.kind !== "known") return "";
  const amount = formatInterval(part.value, "money", ctx, strings.units, { currency: state.setup.currency });
  return part.confidence === "solid" ? amount : fillTemplate(strings.units.approx, { n: amount });
}

/** A row of the total × 12 (the band's annualised total): each known part scaled, an unknown one left as it is — the sum then refuses, as before (S9). */
function timesTwelve(row: MktTotal["now"]): MktTotal["now"] {
  const twelve = (v: DerivedValue): DerivedValue => (v.kind === "known" ? { ...v, value: scale(v.value, 12) } : v);
  return { demand: twelve(row.demand), supply: row.supply ? twelve(row.supply) : null, total: twelve(row.total) };
}

/**
 * The band's props (`TotalBand`, unchanged): the marketplace's headline (§22.6.2). The two streams, « Total par mois », then
 * what adds up — never a ratio, a share or a bar, and **never the cash tied up** (C96: each side keeps its own). null
 * without subscriptions: one stream is not a sum, the net revenue is the first figure of the demand's money.
 */
export function mktTotalView(input: MktViewInput): MktTotalView | null {
  const { state, derived, ctx, strings } = input;
  const total = mktMotion(derived).total;
  if (!total.now.supply) return null;
  const t = strings.mkt.total;
  const currency = state.setup.currency;
  const none = strings.slide.noNumber;

  const now = streamSum(total.now, state, ctx, strings);
  const annual = streamSum(timesTwelve(total.now), state, ctx, strings);
  const fresh = streamSum(total.newPerMonth, state, ctx, strings);
  const in12 = streamSum(total.in12Months, state, ctx, strings);

  // The what-ifs of both sides together, on the total's own curve (`mktTotalPaths`): the last point, said as every projection (« ~88 000 € »).
  const targets = state.whatIf ?? {};
  const moved = buildMktScenario(state, targets, ctx, "demand").moved.length + buildMktScenario(state, targets, ctx, "supply").moved.length > 0;
  const projected = moved ? mktTotalPaths(state, targets, ctx).projected?.[12] : undefined;
  const todayIn12 = in12?.total;
  const withWhatIfs = projected && todayIn12 ? formatApproxMoneyInterval(projected, currency, ctx, strings.units) : null;

  const totals = [
    annual ? { key: "arr", label: t.sumArr, value: annual.total } : null,
    fresh ? { key: "new", label: t.newLabel, value: fresh.total } : null,
    todayIn12 ? { key: "in12", label: withWhatIfs ? strings.mkt.total.in12Moved : t.in12Label, value: withWhatIfs ?? todayIn12 } : null,
  ].filter((x): x is { key: string; label: string; value: string } => x !== null);

  return {
    eyebrow: t.title,
    title: titleText(mktTotalTitle(derived, state, strings, ctx), strings),
    engines: [
      { id: "demand", label: t.demand, value: now?.demand || partText(total.now.demand, state, ctx, strings) || none, missing: !(now?.demand || partText(total.now.demand, state, ctx, strings)) },
      { id: "supply", label: t.supply, value: now?.supply || partText(total.now.supply, state, ctx, strings) || none, missing: !(now?.supply || partText(total.now.supply, state, ctx, strings)) },
    ],
    total: { label: t.sum, value: now?.total ?? none, missing: !now },
    totals,
    line: withWhatIfs && todayIn12 ? fillTemplate(t.todayLine, { today: todayIn12 }) : null,
  };
}

// --- A side's money ----------------------------------------------------------------------

/** What a side's money is computed from, per figure — the inputs of its computed figures (§22.4.2) and the two rows of the total. */
function sideInputs(side: MktSide) {
  const shape = (id: (typeof MKT_DERIVED_SHAPES)[number]["id"]) => MKT_DERIVED_SHAPES.find((s) => s.id === id)!.inputs;
  return side === "demand"
    ? { ltv: shape("mkt.rev.ltv"), cac: ["mkt.buy.cac"] as readonly MetricId[], payback: shape("mkt.rev.cac-payback") }
    : { ltv: shape("mkt.sell.ltv"), cac: ["mkt.sell.cac", "mkt.sell.first-sale", "mkt.sell.paid-conversion"] as readonly MetricId[], payback: shape("mkt.sell.cac-payback") };
}

/** The rows of the « growth » and « one new unit » tables name what they are computed from when one is unknown. */
function sideKpiInputs(side: MktSide) {
  const inputs = sideInputs(side);
  return {
    mrr12: MKT_MRR12_INPUTS[side],
    newMrr: side === "demand" ? (["mkt.rev.frequency", "mkt.rev.aov", "mkt.rev.take-rate", "mkt.buy.cac"] as const) : (["mkt.sell.arpa", "mkt.sell.signup-rate", "mkt.sell.paid-conversion"] as const),
    cac: inputs.cac,
    ltv: inputs.ltv,
    payback: inputs.payback,
  };
}

/**
 * The props of one side's money (`MoneyBlock`, `WorthBars`, `CashWarning`), from the side's own scenario — the rules of
 * `money-view.ts#moneyOfKpis`, once. Demand: the net revenue annualised, with the « ? » of the net revenue (C101), and the
 * GMV with its own; without subscriptions the net revenue of the month comes first (there is no band); the note says what one
 * active buyer brings, said as the product that makes it, with the take rate's « ? ». Supply: the subscriptions' MRR
 * annualised; the note says how the cost of a paid seller is computed (it is never typed). Both: a floor of cash.
 */
export function mktMoneyView(input: MktViewInput, side: MktSide): MoneyView {
  const { state, ctx, strings } = input;
  const k = buildMktScenario(state, {}, ctx, side).today.kpis;
  const base = moneyOfKpis(input, k, { motion: "mkt", side, hybrid: false, app: false, inputs: sideInputs(side), marginId: side === "demand" ? "mkt.rev.gross-margin" : "mkt.sell.gross-margin" });
  const w = strings.money;
  const money = (i: Interval) => factMoney(i, state.setup.currency, ctx, strings);
  const percent = (i: Interval) => formatInterval(i, "percent", ctx, strings.units);
  const known = (id: MetricId): Interval | null => {
    const value = knownIn(state, id, ctx);
    return value.kind === "known" ? value.value : null;
  };

  type Figure = NonNullable<MoneyView["figures"]>[number];
  const figures: Figure[] = [];
  const noSubscriptions = !mktSetup(state.setup).sellerSubscriptions;
  if (side === "demand") {
    if (noSubscriptions && k.mrr) figures.push({ key: "mrr", label: w.mrr, value: money(k.mrr) });
    if (k.arr) figures.push({ key: "arr", label: w.arr, value: money(k.arr), term: "netRevenue" });
    if (k.gmv) figures.push({ key: "gmv", label: strings.mkt.money.gmv, value: money(k.gmv), term: "gmv" });
  } else if (k.arr) {
    figures.push({ key: "arr", label: w.arr, value: money(k.arr) });
  }

  let note: string | null = null;
  let noteTerm: EngineTermId | undefined;
  if (side === "demand") {
    const [per, freq, aov, take] = [k.revenuePerUnit, known("mkt.rev.frequency"), known("mkt.rev.aov"), known("mkt.rev.take-rate")];
    if (per && freq && aov && take) {
      const template = isSingular(freq, ctx.locale) ? strings.mkt.money.perBuyerNote : strings.mkt.money.perBuyerNoteMany;
      note = fillTemplate(template, { per: money(per), freq: formatInterval(freq, "ratio", ctx, strings.units), aov: money(aov), take: percent(take) });
      noteTerm = "takeRate";
    }
  } else {
    const [cpa, fs, conv] = [known("mkt.sell.cac"), known("mkt.sell.first-sale"), known("mkt.sell.paid-conversion")];
    if (cpa && fs && conv && k.cac) note = fillTemplate(strings.mkt.money.sellerCostExplained, { cpa: money(cpa), fs: percent(fs), conv: percent(conv), cost: money(k.cac) });
  }

  return {
    ...base,
    figures: figures.length > 0 ? figures : null,
    worth: { ...base.worth, note: [base.worth.note, note].filter(Boolean).join(" ") || null, ...(note && noteTerm ? { noteTerm } : {}) },
  };
}

// --- A side's « Et si » card ------------------------------------------------------------

export interface MktLeverView {
  eyebrow: string;
  title: string;
  /** The lever the card moves, and what its slider needs. */
  lever: { id: LeverId; elementId: string; label: string; min: number; max: number; step: number; position: number; valueText: string; today: Interval };
  /** Today's pace and, once anything moved, with the what-ifs: the side's own path (`mktSidePaths`). null: the revenue cannot be projected. */
  curve: {
    today: [number, number][];
    whatif: [number, number][] | null;
    keys: { today: string; whatif: string };
    start: string;
    xLabels: [string, string, string];
    summary: string;
    /** A money lever moved: it re-prices the whole base from next month, a steeper first segment — the ring and its sentence. */
    step: boolean;
    note: string | null;
  } | null;
  figures: { key: string; label: string; value: string; unknown: boolean; today: string | null }[];
  worth: string | null;
  allLabel: string;
  resetLabel: string;
  moved: boolean;
}

/** The levers that move the money of every unit from the next month (D6, C69): a marketplace's jump at month 1. */
const MONEY_LEVERS: Record<MktSide, readonly LeverId[]> = {
  demand: ["mkt.rev.frequency", "mkt.rev.aov", "mkt.rev.take-rate"],
  supply: ["mkt.sell.arpa"],
};

/**
 * The jump at month 1, in money (§22.8.5 k): the part of the projection's first month that comes from the money levers on
 * today's base alone, `revenue × kept ÷ 100 × (ratio − 1)` — `kept` the share the side's churn keeps, `ratio` what the money
 * levers do to what one unit brings (`fA` for the buyers, `fPrice` for the paid sellers). For the example's commission at
 * 13 %: 32 853,60 € × 96 % × (13/12 − 1) = 2 628,29 €. null when a figure of it is unknown.
 */
function stepOf(scenario: MktScenario): Interval | null {
  const today = scenario.today.kpis;
  const projected = scenario.projected.kpis;
  if (!today.mrr || !today.revenuePerUnit || !projected.revenuePerUnit) return null;
  const ratio = div(projected.revenuePerUnit, today.revenuePerUnit);
  if (!ratio) return null;
  // The churn the projected column keeps the base at: its own target when a lever moved it, else today's — as `demandPath` and `sellerPath` read it.
  const churn = scenario.side === "demand" ? "mkt.buy.churn" : "mkt.sell.paid-churn";
  const lever = scenario.levers.find((l) => l.id === churn);
  const churnNow = lever?.target !== null && lever?.target !== undefined ? point(lever.target) : lever?.today ?? null;
  if (!churnNow) return null;
  const kept = keptPercentOfChurn(churnNow);
  return mul(scale(mul(today.mrr, kept), 1 / 100), sub(ratio, point(1)));
}

/**
 * The props of one side's « Et si » card (`LeverCard`): the lever of the side's leak (else its first lever, `cardLever`), the
 * two figures in twelve months, « Vois les 8 leviers » (or 3), and, when a money lever moved, the jump at month 1 and its
 * sentence. **No total line**: the total is only in the band, the one place both sides' what-ifs are known together. null
 * when the side has no lever with a value (the sellers who pay nothing).
 */
export function mktLeverView(input: MktViewInput, side: MktSide, targets: Partial<Record<LeverId, number>>): MktLeverView | null {
  const { state, derived, ctx, strings, metrics } = input;
  const l = strings.lever;
  const currency = state.setup.currency;
  const scenario = buildMktScenario(state, targets, ctx, side);
  const diagnosis = mktMotion(derived).sides[side].diagnosis;
  const named: readonly MetricId[] = diagnosis.state === "clear" || diagnosis.state === "shared" ? diagnosis.named : [];
  const rows = leverRows(scenario, ctx, strings, currency, metrics);
  const chosen = cardLever(rows, named);
  if (!chosen) return null;
  const { row } = chosen;
  const lever = scenario.levers.find((x) => x.id === row.id)!;
  const stagesNamed = namedStages(diagnosis).size;
  const others = scenario.moved.some((id) => id !== row.id);
  const movedText = (template: string) => fillTemplate(template, { lever: row.name, from: row.todayValue ?? "", to: row.valueText });
  const key = titleKey({ moved: row.moved, others, byStage: chosen.byStage, stagesNamed, state: diagnosis.state });

  const money = leverMoneyView(input, "mkt", targets, row.id, false, side);
  const isMoved = scenario.moved.length > 0;
  const paths = mktSidePaths(state, targets, ctx, side);
  const curve =
    money.curve && paths.today
      ? {
          ...money.curve,
          today: paths.today.map(tuple),
          whatif: isMoved && paths.projected ? paths.projected.map(tuple) : null,
          ...jump(input, scenario, side),
        }
      : null;

  // « MRR dans 12 mois » of the side, with the what-ifs once moved: the pair prints a digit more when two would print the same.
  const [t12, p12] = [scenario.today.kpis.mrr12, scenario.projected.kpis.mrr12];
  const extra = t12 && p12 && isMoved ? pairPrecision(mid(t12), mid(p12), approxRounding) : 0;
  const printed = (i: Interval | null) => (i ? formatApproxMoneyInterval(i, currency, ctx, strings.units, extra) : null);
  const mrr12 = isMoved ? printed(p12) : printed(t12);
  const unknownMrr12 = fillTemplate(strings.scenario.kpiUnknown, {
    input: MKT_MRR12_INPUTS[side].filter((id) => knownIn(state, id, ctx).kind !== "known").map((id) => strings.unitInput[id as keyof EngineStrings["unitInput"]] ?? id).join(", "),
  });
  const known = rows.filter((r) => r.today !== null).length;
  const todayText = (value: string | null) => (isMoved && value ? fillTemplate(strings.scenario.leverToday, { value }) : null);

  return {
    eyebrow: strings.board.whatIfTitle,
    title: row.moved ? movedText(l[key]) : l[key],
    lever: {
      id: row.id,
      elementId: `engine-lever-${row.id.replace(/\./g, "-")}`,
      label: fillTemplate(l.label, { lever: row.name, today: row.today ?? "" }),
      min: row.min,
      max: row.max,
      step: row.step,
      position: row.position,
      valueText: row.valueText,
      today: lever.today!,
    },
    curve,
    figures: [
      { key: "mrr12", label: strings.scenario.kpiMrr12, value: mrr12 ?? unknownMrr12, unknown: mrr12 === null, today: todayText(printed(t12)) },
      { key: "arr12", label: money.arr12.label, value: money.arr12.value, unknown: money.arr12.unknown, today: money.arr12.today },
    ],
    worth: money.worth,
    allLabel: known > 1 ? fillTemplate(l.all, { n: known }) : l.allOne,
    resetLabel: strings.scenario.reset,
    moved: row.moved,
  };
}

/** The ring at month 1 and its sentence, once a money lever moved (§22.8.5 k): `{subject}` is the lever's, `{to}` its new value. */
function jump(input: MktViewInput, scenario: MktScenario, side: MktSide): { step: boolean; note: string | null } {
  const { state, ctx, strings } = input;
  const money = scenario.moved.filter((id) => MONEY_LEVERS[side].includes(id));
  if (money.length === 0) return { step: false, note: null };
  const step = stepOf(scenario);
  const amount = step ? formatApproxMoneyInterval(step, state.setup.currency, ctx, strings.units) : null;
  if (!amount) return { step: true, note: null };
  const rows = leverRows(scenario, ctx, strings, state.setup.currency, input.metrics);
  const to = (id: LeverId) => rows.find((r) => r.id === id)?.valueText ?? "";
  if (side === "supply") return { step: true, note: fillTemplate(strings.mkt.curve.stepSupply, { to: to(money[0]!), step: amount }) };
  if (money.length > 1) return { step: true, note: fillTemplate(strings.mkt.curve.stepMany, { n: String(money.length), step: amount }) };
  const id = money[0]!;
  return { step: true, note: fillTemplate(strings.mkt.curve.stepOne, { subject: strings.leverSubject[id as keyof EngineStrings["leverSubject"]], to: to(id), step: amount }) };
}

// --- A side's funnel -----------------------------------------------------------------------

/** « recherches », « demandes envoyées » or both, by the fill rate's variant (C99): the word the liquidity's base counts. */
function kindOf(variant: "requests" | "searches" | null, strings: EngineStrings): string {
  const f = strings.mkt.funnel;
  return variant === "requests" ? f.kindRequests : variant === "searches" ? f.kindSearches : f.kindEither;
}

/** The nice count a funnel's upstream line prints: two significant digits (§6.2, « ~3 200 visiteurs »). */
function visitorsText(visitors: Interval, ctx: EngineCalcContext, strings: EngineStrings): string {
  return formatCountInterval(
    { lo: roundSignificant(visitors.lo, 2), hi: roundSignificant(visitors.hi, 2) },
    ctx,
    strings.units,
  );
}

export interface MktFunnelView extends Omit<SideFunnelProps, "title" | "base" | "headingId" | "className" | "data-testid"> {
  /** The screen's title (`mkt.funnel.title`); the slide's is its verdict. */
  title: string;
  /** The liquidity's base, demand only: its heading names the kind, its « ? » is the board's. */
  base?: { title: string; term: EngineTermId; column: FunnelColumn; line: string };
}

/**
 * The props of one side's funnel (`SideFunnel`, §22.6.2): the 100 sign-ups and each stage counted on the same 100 — the
 * buyers' first and second order, the sellers' first sale and, with subscriptions, their conversion — the upstream line, the
 * column the side's diagnosis names (`holds`, one at most), and what the side needs besides: the buyers' liquidity on its
 * own base of 100 searches (or requests), after a rule; the sellers' two churns as monthly RATES, never columns; the
 * sellers' aside on where they show when they earn nothing directly.
 */
export function mktFunnelView(input: MktViewInput, side: MktSide, medium: "screen" | "slide" = "screen"): MktFunnelView {
  const { state, derived, ctx, strings } = input;
  const f = strings.mkt.funnel;
  const w = strings.peloton;
  const snapshot = state.snapshots[state.snapshots.length - 1]!;
  const motion = mktMotion(derived);
  const funnel = side === "demand" ? motion.funnel.demand : motion.funnel.supply;
  const diagnosis = motion.sides[side].diagnosis;
  const settings = mktSetup(state.setup);
  const named = new Set<string>(diagnosis.state === "clear" || diagnosis.state === "shared" ? diagnosis.named : []);
  const stampOf = (id: MktCandidateId): { label: string } | undefined => {
    if (!named.has(id)) return undefined;
    const at = diagnosis.positions[id];
    const label = at ? positionLabel(at.position, at.comparator, strings) : null;
    return label ? { label } : undefined;
  };
  const month = (m: YearMonth | null) => (m ? monthLabel(m, ctx.locale) : null);

  const windows: Record<string, number> = {
    "mkt.buy.first-order": settings.firstOrderWindowDays,
    "mkt.buy.repeat": settings.repeatWindowDays,
    "mkt.sell.first-sale": settings.firstSaleWindowDays,
    "mkt.sell.paid-conversion": settings.firstSaleWindowDays,
  };
  const labelOf: Record<string, string> = {
    "mkt.buy.first-order": f.first,
    "mkt.buy.repeat": f.repeat,
    "mkt.sell.first-sale": f.firstSale,
    "mkt.sell.paid-conversion": f.paid,
  };

  let anyRange = false;
  let anyUnknown = false;
  const columns: FunnelColumn[] = [
    {
      id: "signups",
      n: "100",
      label: side === "demand" ? f.signups : f.sellerSignups,
      grid: signupsGrid(side === "demand" ? (funnel as typeof motion.funnel.demand).referredPerHundred : null),
    },
    ...funnel.columns.map((col): FunnelColumn => {
      const numeral = columnNumeral(col.perHundred);
      const text = numeralText(numeral, strings.units, strings.visual.lessThanOne);
      const label = fillTemplate(labelOf[col.metric]!, { n: String(windows[col.metric]) });
      const unknown = numeral.kind === "unknown";
      const range = numeral.kind === "value" && numeral.lo !== numeral.hi;
      if (unknown) anyUnknown = true;
      if (range || (!unknown && col.confidence === "approximate")) anyRange = true;
      const where = col.source ? sourceLabel(col.source, strings) : null;
      const period = month(col.period);
      return {
        id: col.metric,
        n: text,
        label,
        grid: columnGrid(col.perHundred),
        holds: stampOf(col.metric),
        source: unknown ? w.legendUnknown : [where ?? w.legendRange, period].filter(Boolean).join(" · "),
        ariaLabel: unknown ? `${label} — ${w.legendUnknown}` : undefined,
      };
    }),
  ];

  const visitors = funnel.visitorsPerHundred;
  const upstream = visitors
    ? fillTemplate(side === "demand" ? f.upstream : f.sellerUpstream, {
        n: visitorsText(visitors, ctx, strings),
        source: funnel.upstreamSource ? sourceLabel(funnel.upstreamSource, strings) : strings.status.estimated.toLowerCase(),
        month: month(funnel.upstreamPeriod) ?? "",
      })
    : side === "demand"
      ? strings.visual.upstreamUnknown
      : undefined;

  const cohort = monthLabel(snapshot.cohortMonth, ctx.locale);
  const referred = side === "demand" ? (funnel as typeof motion.funnel.demand).referredPerHundred : null;
  const referredText = referred ? numeralText(columnNumeral(referred), strings.units, strings.visual.lessThanOne) : null;

  const view: MktFunnelView = {
    title: side === "demand" ? f.title : f.sellerTitle,
    upstream,
    columns,
    medium,
    legend: [
      ...(referredText ? [{ kind: "referred" as const, label: fillTemplate(f.legendReferred, { n: referredText }) }] : []),
      { kind: "filled", label: w.legendMeasured },
      ...(anyRange ? [{ kind: "range" as const, label: w.legendRange }] : []),
      ...(anyUnknown ? [{ kind: "unknown" as const, label: w.legendUnknown }] : []),
    ],
  };

  if (side === "demand") {
    const demand = funnel as typeof motion.funnel.demand;
    const kind = kindOf(demand.fillVariant, strings);
    const fillEntry = entryOf(snapshot, "mkt.liq.fill-rate");
    const value = demand.fill.kind === "known" ? columnNumeral({ lo: Math.round(demand.fill.value.lo), hi: Math.round(demand.fill.value.hi) }) : null;
    const fillPerHundred = demand.fill.kind === "known" ? demand.fill.value : null;
    const fillText = fillPerHundred ? formatInterval(fillPerHundred, "percent", ctx, strings.units) : null;
    view.base = {
      title: fillTemplate(f.liquidity, { kind }),
      term: "liquidity",
      column: {
        id: "mkt.liq.fill-rate",
        n: value ? numeralText(value, strings.units, strings.visual.lessThanOne) : "?",
        label: input.metrics.find((m) => m.id === "mkt.liq.fill-rate")?.name ?? "",
        grid: columnGrid(fillPerHundred),
        holds: stampOf("mkt.liq.fill-rate"),
        source:
          demand.fill.kind === "known"
            ? [fillEntry?.status === "measured" && fillEntry.source ? sourceLabel(fillEntry.source, strings) : w.legendRange, month(periodFill(snapshot, fillEntry))].filter(Boolean).join(" · ")
            : w.legendUnknown,
      },
      line: fillText ? fillTemplate(demand.fillVariant === "requests" ? f.fillRequests : f.fillSearches, { fill: fillText }) : f.fillUnknown,
    };
    view.note = [fillTemplate(f.sameHundred, { cohort }), demand.fill.kind === "known" ? fillTemplate(f.otherBase, { kind }) : null].filter(Boolean).join(" ");
  } else {
    const supply = funnel as typeof motion.funnel.supply;
    const rate = (id: MktCandidateId, label: string, known: typeof supply.churn): FunnelRate => {
      const comparator = comparatorOf(state, id);
      return {
        id,
        label,
        value: known.kind === "known" ? formatInterval(known.value, "percent", ctx, strings.units) : "?",
        note: comparator ? fillTemplate(f.rateTarget, { target: formatInterval(point(impactTarget(comparator)), "percent", ctx, strings.units) }) : undefined,
        holds: named.has(id) || undefined,
      };
    };
    view.rates = [rate("mkt.sell.churn", f.churnLabel, supply.churn), ...(supply.paidChurn ? [rate("mkt.sell.paid-churn", f.paidChurnLabel, supply.paidChurn)] : [])];
    view.ratesTitle = f.ratesTitle;
    view.note = fillTemplate(f.sellerSameHundred, { cohort });
    if (!settings.sellerSubscriptions) {
      const demand = motion.funnel.demand;
      const fillText = demand.fill.kind === "known" ? formatInterval(demand.fill.value, "percent", ctx, strings.units) : null;
      if (fillText) view.aside = fillTemplate(f.liquidityAside, { fill: fillText, kind: kindOf(demand.fillVariant, strings) });
    }
  }
  return view;
}

/** The month a monthly flow of the snapshot is read on (`periodOf`): the fill rate is one. */
function periodFill(snapshot: EngineState["snapshots"][number], entry: ReturnType<typeof entryOf>): YearMonth | null {
  return periodOf({ flow: "month" } as Parameters<typeof periodOf>[0], entry, snapshot);
}

// --- The « À côté » lines of a side's diagnosis ---------------------------------------

export interface MktAsideLine {
  id: MktCandidateId;
  text: string;
}

/**
 * The lines under a side's named leak, one per OTHER stage under its target (§22.6.2), in ink — never red (one red per side):
 * « À côté : la première commande, 20 % pour une cible de 25 %, vaudrait ~350 € de revenu net nouveau par mois. » A stage of
 * the supply that no subscription prices is named without an amount (C67). A stage no amount prices on the demand (the
 * second order) gets no line here: the diagnosis's own « sans montant » note keeps saying it.
 */
export function mktAsideLines(input: MktViewInput, side: MktSide): MktAsideLine[] {
  const { state, derived, ctx, strings, metrics } = input;
  const diagnosis = mktMotion(derived).sides[side].diagnosis;
  const named = new Set<CandidateId>(diagnosis.state === "clear" || diagnosis.state === "shared" ? diagnosis.named : []);
  const lines: MktAsideLine[] = [];
  for (const id of mktCandidates(side, state.setup)) {
    const at = diagnosis.positions[id];
    if (named.has(id) || at?.position !== "below" || !at.comparator) continue;
    const known = knownIn(state, id, ctx);
    if (known.kind !== "known") continue;
    const values = {
      stage: subjectOf(id, strings, metrics),
      value: formatInterval(known.value, "percent", ctx, strings.units),
      target: formatPercent(at.comparator.lo, ctx.locale),
    };
    // What the ranking itself priced (`positions[id].impact`, the exact amount a month, MKT-4), said as every projection — two
    // significant digits and « ~ » (C97): « ~350 € », never the chain's rounded count × the price (« ~150 € » for a paid churn worth 130,50 €).
    const impact = at.impact;
    const amount = impact?.mrrPerMonth ? formatApproxMoneyInterval(impact.mrrPerMonth, state.setup.currency, ctx, strings.units) : null;
    if (impact && amount) {
      const worth = fillTemplate(impact.kind === "retained-mrr" ? strings.worth.retainedMrr : strings.worth.newMrr, { amount });
      lines.push({ id, text: fillTemplate(strings.mkt.diag.aside, { ...values, worth }) });
    } else if (side === "supply") lines.push({ id, text: fillTemplate(strings.mkt.diag.asideUnpriced, values) });
  }
  return lines;
}

// --- A side's « Et si » panel ---------------------------------------------------------------

/**
 * The panel's three tables for one side (`WhatIfFigures`), from the side's own scenario — growth (the new revenue of a month
 * and the new units), one new unit (what it costs, brings back, the gap, the payback, the months after) and the cash — today
 * against the what-ifs. A « ? » is never a 0 and says what is missing; a change says its sign and its sense in words. The
 * revenue in twelve months is the card's, right above.
 */
export function mktWhatIfGroups(input: MktViewInput, side: MktSide): { moved: boolean; groups: FigureGroup[] } {
  const { state, ctx, strings, metrics } = input;
  const scenario = buildMktScenario(state, state.whatIf ?? {}, ctx, side);
  const own = { ids: ["mrr12", "newMrr", "cac", "ltv", "payback"] as const, inputs: sideKpiInputs(side) };
  const kpis: KpiView[] = kpiRows(scenario, ctx, strings, state.setup.currency, { state, metrics }, own);
  return figureGroupsOf(input, {
    kpis,
    t: scenario.today.kpis,
    p: scenario.projected.kpis,
    moved: scenario.moved.length > 0,
    inputs: { ...sideInputs(side), ...own.inputs },
    app: false,
    growth: (fromKpi, row) => [
      fromKpi("newMrr"),
      row(
        "newUnits",
        side === "demand" ? strings.mkt.funnel.newBuyers : strings.mkt.funnel.newPaidSellers,
        scenario.today.funnel.newUnits,
        scenario.projected.funnel.newUnits,
        (i) => formatCountInterval(i, ctx, strings.units),
        (d) => signed(formatCountInterval({ lo: Math.abs(d), hi: Math.abs(d) }, ctx, strings.units), d),
        true,
        side === "demand" ? ["mkt.buy.signup-rate", "mkt.buy.first-order", "mkt.liq.fill-rate"] : ["mkt.sell.signup-rate", "mkt.sell.paid-conversion"],
      ),
    ],
  });
}

/** The rules the side's figures rest on, in the order of the type, then the money's own (the LTV's and the cash's): what the panel's « ce que le calcul suppose » lists. */
export function mktAssumptions(input: MktViewInput, side: MktSide): string[] {
  const { state, ctx, strings } = input;
  const scenario = buildMktScenario(state, state.whatIf ?? {}, ctx, side);
  const w = strings.scenario;
  // The six rules of the marketplace's own are `mkt.assumption`; the four it shares with the SaaS read `scenario.assumption`, rewritten by the side's words.
  const own = strings.mkt.assumption as Record<string, string>;
  const shared = w.assumption as Record<string, string>;
  const texts = scenario.assumptions.map((id) => own[id] ?? shared[id]!);
  if (scenario.today.kpis.ltv) texts.push(w.assumeLtv);
  if (scenario.today.kpis.cash) texts.push(w.assumeCash);
  return texts;
}

export interface MktLeverSumView {
  title: string;
  rows: { id: LeverId; label: string; value: string; amount: number }[];
  sum: { id: string; label: string; value: string; amount: number };
  together: { id: string; label: string; value: string; amount: number };
  extra: string | null;
}

/**
 * The compounding of one side's levers, drawn (`LeverSum`): with two levers or more moved on this side, each one's gain on
 * the revenue in twelve months alone (`mktLeverAlone`), the solo gains added up, the gain together. null when a gain cannot be
 * computed. The other side's levers are never in it (D2): the compounding of both sides is the band's.
 */
export function mktLeverSum(input: MktViewInput, side: MktSide): MktLeverSumView | null {
  const { state, ctx, strings, metrics } = input;
  const w = strings.scenario;
  const currency = state.setup.currency;
  const scenario = buildMktScenario(state, state.whatIf ?? {}, ctx, side);
  if (scenario.moved.length < 2) return null;
  const gains = leverGains(state, scenario, ctx, mktLeverAlone);
  if (gains.together === null || gains.sumAlone === null || gains.alone.some((g) => g.gain === null)) return null;
  const levers = leverRows(scenario, ctx, strings, currency, metrics);
  const rows = gains.alone.map((g) => {
    const lever = levers.find((x) => x.id === g.id)!;
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

export type { AnyDiagnosis, FigureRow };
