import { isPricedAt, MKT_DEMAND_LEVER_IDS, MKT_SUPPLY_LEVER_IDS, motionShapes, REFERRAL_CANDIDATES, REFERRAL_PRICING_CEILING, shapeOf } from "./catalog-shape";
import {
  annexSlides,
  buildAnnex,
  buildAsk,
  buildVisibility,
  chainLine,
  changeOf,
  changeRow,
  DEFAULT_INCLUDE,
  isPricedGain,
  metricOf,
  mirrorLines,
  slideCurve,
  slideGlyphs,
  slideLeverSum,
  sourceLabel,
  targetPhrase,
  toolsOf,
  whatIfPrinters,
  withDrawings,
  type BuiltSlide,
  type DeckProse,
  type Printers,
  type Row,
} from "./deck";
import { buildEvolutionSlide, seasonalNote } from "./deck-series";
import { unitMoney } from "./deck-unit";
import { comparatorOf, impactTarget } from "./diagnose";
import {
  capitalise,
  fillTemplate,
  formatApproxMoneyInterval,
  formatChange,
  formatCountInterval,
  formatDurationInterval,
  formatInterval,
  formatMonth,
  formatPerHundred,
  formatPerHundredCount,
  joinList,
  lowerFirst,
  roundSignificant,
} from "./format";
import { impactHeadline } from "./impact";
import { div, mapBounds, mul, point, scale, sub } from "./interval";
import { mktWhatIf } from "./mkt-impact";
import { buildMktScenario, mktLeverAlone, mktTotalPaths, type MktScenario, type MktScenarioKpis } from "./mkt-scenario";
import { mktFunnelTitle, mktTotalTitle, streamSum } from "./mkt-titles";
import { blindSentence, churnWithoutCommonAmount, fillSegments, isRetentionMetric, notEnoughBelowValues, numbered, sideText, subjectOf, unitInputsPhrase, worthOf } from "./phrases";
import { mktSetup } from "./setup-type";
import { keptPercentOfChurn } from "./stream";
import { STATUS_KEY, type EngineStrings, type ResolvedMetric } from "./strings";
import { includeKeyOf } from "./types";
import type {
  DeckModel,
  DeckSlide,
  Diagnosis,
  DerivedId,
  DerivedValue,
  EngineCalcContext,
  EngineDerived,
  EngineState,
  Impact,
  Interval,
  LeverId,
  MetricId,
  MktCandidateId,
  MktSide,
  MotionDerived,
  SlideId,
  SlideTitle,
} from "./types";
import { currentSnapshot, entryOf, knownIn, statusOf } from "./values";

/**
 * deck-mkt.ts — the deck of a marketplace (engine spec §22.12 MKT-8, C103; `design/ds-extension-10-return/`, question 10).
 *
 * The same contract as every slide (deck.ts header): each `lines` row says what it is in `row`, its words finished, `id` a
 * machine id. The order is the return's: when the sellers pay a subscription, the total of the two streams first — a ledger, a
 * sum, never two cards face to face — then the buyers' four slides (their funnel, their leak, their « Et si », their unit
 * economics), then the sellers' four, then the slides every type shares. A side's slides are never interleaved with the
 * other's, and each wears its side (`DeckSlide#side`): that is the one thing that tells a reader whose numbers they are.
 *
 * Nothing here compares the two sides (D2, D14): every slide reads ONE side's diagnosis, scenario and unit economics, in the
 * words of that side (`stringsForSide`, §22.8.1). The total is the only place both meet, and it ADDS. The titles a slide shares
 * with the board (the funnel's verdict, the total's) are the SAME functions' (`mkt-titles.ts`): a screen and a slide cannot word
 * one engine two ways.
 */

type Words = EngineStrings;
type MktMotion = Extract<MotionDerived, { motion: "mkt" }>;
type StringsForSide = (side: MktSide) => Words;

/** Everything a slide of the marketplace's deck reads, handed down once. */
interface Input {
  state: EngineState;
  derived: EngineDerived;
  /** The neutral set: the total, the common slides. */
  strings: Words;
  forSide: StringsForSide;
  metrics: ResolvedMetric[];
  ctx: EngineCalcContext;
  prose: DeckProse;
  motion: MktMotion;
}

type Entry = { id: SlideId; slide: BuiltSlide; byDefault: boolean };

function mktMotionOf(derived: EngineDerived): MktMotion {
  const motion = derived.motions.find((m): m is MktMotion => m.motion === "mkt");
  if (!motion) throw new Error("a marketplace derives its motion");
  return motion;
}

const LEVER_IDS: Record<MktSide, readonly LeverId[]> = { demand: MKT_DEMAND_LEVER_IDS, supply: MKT_SUPPLY_LEVER_IDS };
/** The levers that re-price the whole base from the next month (D6, C69): a marketplace's jump at month 1. */
const MONEY_LEVERS: Record<MktSide, readonly LeverId[]> = {
  demand: ["mkt.rev.frequency", "mkt.rev.aov", "mkt.rev.take-rate"],
  supply: ["mkt.sell.arpa"],
};

function valueOf(state: EngineState, id: MetricId, ctx: EngineCalcContext): Interval | null {
  const k = knownIn(state, id, ctx);
  return k.kind === "known" ? k.value : null;
}

// --- The total (C103) -------------------------------------------------------------------

/** One part alone, when the sum cannot be printed: its own two significant digits, « ~ » unless it was typed. */
function partText(part: DerivedValue | null, state: EngineState, ctx: EngineCalcContext, strings: Words): string {
  if (!part || part.kind !== "known") return "";
  const amount = formatInterval(part.value, "money", ctx, strings.units, { currency: state.setup.currency });
  return part.confidence === "solid" ? amount : fillTemplate(strings.units.approx, { n: amount });
}

/** A projection as a known part (a model's, never typed): what `streamSum` prints along with the rest of its row. */
const modelled = (value: Interval | null | undefined): DerivedValue => (value ? { kind: "known", value, confidence: "approximate" } : { kind: "uncomputable", missing: [] });

/**
 * The total slide's rows (`SlideStreams`): the two streams in the order of the sum — the commissions, then the sellers'
 * subscriptions — and the total, each with its figures for this month, new a month, and in twelve months at today's pace; once a
 * « Et si » moved on either side, in twelve months with the what-ifs of both. The parts are rounded to one common unit, so the
 * reader redoes the addition on a calculator (`streamSum`). The lines that say where each stream is read on its own (« les
 * acheteurs, slides 2 à 5 ») are filled once the deck is numbered (`withSideLines`). No share, no ratio, no bar, and the cash tied
 * up is not here (C96): each side keeps its own.
 */
function totalLines({ state, strings, ctx, motion }: Input): Row[] {
  const t = strings.mkt.total;
  const none = strings.slide.noNumber;
  const total = motion.total;
  const now = streamSum(total.now, state, ctx, strings);
  const fresh = streamSum(total.newPerMonth, state, ctx, strings);
  const in12 = streamSum(total.in12Months, state, ctx, strings);

  // The what-ifs of both sides together, on the total's own path (`mktTotalPaths`): the very figure the board's band prints.
  const targets = state.whatIf ?? {};
  const demand = buildMktScenario(state, targets, ctx, "demand");
  const supply = buildMktScenario(state, targets, ctx, "supply");
  const moved = demand.moved.length + supply.moved.length > 0;
  const withWhatIfs = moved
    ? streamSum({ demand: modelled(demand.projected.kpis.mrr12), supply: modelled(supply.projected.kpis.mrr12), total: modelled(mktTotalPaths(state, targets, ctx).projected?.[12]) }, state, ctx, strings)
    : null;

  const row = (id: "demand" | "supply" | "total", label: string): Row => {
    const part = id === "total" ? null : total.now[id];
    const month = now?.[id] || partText(part, state, ctx, strings) || none;
    const newPerMonth = fresh?.[id] || none;
    const in12Months = in12?.[id] || none;
    const in12Moved = withWhatIfs ? withWhatIfs[id] : "";
    const text = [`${t.colMonth} ${month}`, `${t.newLabel} ${newPerMonth}`, `${t.in12Label} ${in12Months}`, ...(in12Moved ? [`${t.colIn12Moved} ${in12Moved}`] : [])].join(" · ");
    // The ledger's note is said once, on the total's row (the table's figcaption).
    return { row: "streams", id, label, side: "", month, fresh: newPerMonth, in12: in12Months, in12Moved, note: id === "total" ? t.note : "", text };
  };
  return [row("demand", t.demand), row("supply", t.supply), row("total", t.sum)];
}

/** « les acheteurs, slides 2 à 5 » / « les acheteurs, slide 2 »: where a stream is read on its own, from the slides the deck numbered. */
function sideLine(side: MktSide, numbers: number[], strings: Words): string {
  if (numbers.length === 0) return "";
  const t = strings.mkt.total;
  const from = Math.min(...numbers);
  const to = Math.max(...numbers);
  if (from === to) return fillTemplate(side === "demand" ? t.sideDemandOne : t.sideSupplyOne, { n: String(from) });
  return fillTemplate(side === "demand" ? t.sideDemand : t.sideSupply, { from: String(from), to: String(to) });
}

// --- A side's funnel (C103) -------------------------------------------------------------

/** The kind of request the liquidity's base counts (C99): « recherches », « demandes envoyées », or both when the entry says neither. */
function kindOf(variant: "requests" | "searches" | null, strings: Words): string {
  const f = strings.mkt.funnel;
  return variant === "requests" ? f.kindRequests : variant === "searches" ? f.kindSearches : f.kindEither;
}

/**
 * A side's funnel slide: the verdict as its title (`mktFunnelTitle`, the board's own), and the funnel as the text export says it.
 * The slide DRAWS the funnel from the funnel itself (`SideFunnel`); these rows are the words of the same leaves, in the
 * peloton's shape (`upstream`, `legendReferred`, one `column` per stage) plus what a side's funnel adds to its columns
 * (`sideFunnel`): the buyers' liquidity on its own base of 100, the sellers' two churns as monthly rates, the sellers' aside.
 */
function buildFunnel({ state, motion, metrics, ctx }: Input, side: MktSide, strings: Words, footer: Row): BuiltSlide {
  const f = strings.mkt.funnel;
  const snapshot = currentSnapshot(state);
  const funnel = motion.funnel[side];
  const settings = mktSetup(state.setup);
  const lines: Row[] = [];

  // The upstream line: the visitors behind 100 sign-ups, two significant digits (« ~2 000 visiteurs… »). Unknown, the buyers' funnel
  // says so; the sellers' says nothing (without subscriptions their sign-up rate is not a number the setup shows), as the board does.
  const visitors = funnel.visitorsPerHundred;
  if (visitors) {
    lines.push({
      row: "upstream",
      text: fillSegments(side === "demand" ? f.upstream : f.sellerUpstream, {
        n: formatCountInterval(mapBounds(visitors, (v) => roundSignificant(v, 2)), ctx, strings.units),
        source: funnel.upstreamSource ? sourceLabel(funnel.upstreamSource, strings) : lowerFirst(strings.status.estimated),
        month: funnel.upstreamPeriod ? formatMonth(funnel.upstreamPeriod, ctx.locale) : "",
      }),
    });
  } else if (side === "demand") lines.push({ row: "upstream", text: strings.visual.upstreamUnknown });

  if (side === "demand") {
    const referred = knownIn(state, "mkt.buy.referred-share", ctx);
    if (referred.kind === "known") {
      lines.push({ row: "legendReferred", label: f.signups, text: fillTemplate(strings.peloton.slideReferred, { share: formatPerHundred(referred.value, ctx, strings.units) }) });
    }
  }

  const windows = {
    "mkt.buy.first-order": settings.firstOrderWindowDays,
    "mkt.buy.repeat": settings.repeatWindowDays,
    "mkt.sell.first-sale": settings.firstSaleWindowDays,
    "mkt.sell.paid-conversion": settings.firstSaleWindowDays,
  } as const;
  const labels = { "mkt.buy.first-order": f.first, "mkt.buy.repeat": f.repeat, "mkt.sell.first-sale": f.firstSale, "mkt.sell.paid-conversion": f.paid } as const;
  const notes: string[] = [];
  for (const c of funnel.columns) {
    const k = knownIn(state, c.metric, ctx);
    const status = statusOf(entryOf(snapshot, c.metric));
    // A measured column cites its tool; an estimate or two conflicting numbers say so instead (the peloton's rule).
    const where = c.source ? sourceLabel(c.source, strings) : k.kind === "known" ? lowerFirst(strings.status[STATUS_KEY[status]]) : "";
    const period = c.period ? formatMonth(c.period, ctx.locale) : "";
    lines.push({
      row: "column",
      id: c.metric,
      label: fillTemplate(labels[c.metric], { n: String(windows[c.metric]) }),
      // The numeral over the grid: "" when unknown, never « 0 »; « moins de 1 » under half a person.
      value: k.kind !== "known" ? "" : k.value.hi > 0 && k.value.hi < 0.5 ? strings.visual.lessThanOne : formatPerHundredCount(k.value, ctx, strings.units),
      source: [where, period].filter(Boolean).join(" · "),
      text: k.kind === "known" ? [formatPerHundred(k.value, ctx, strings.units), where, period].filter(Boolean).join(" · ") : strings.slide.noNumber,
    });
    // One note per measured column: where it comes from. The column's period IS its cohort month.
    if (c.source && c.period) {
      notes.push(fillTemplate(strings.notes.source, { metric: metricOf(metrics, c.metric).name, tool: sourceLabel(c.source, strings), cohort: formatMonth(c.period, ctx.locale) }));
    }
  }

  const fillOf = (): Interval | null => (motion.funnel.demand.fill.kind === "known" ? motion.funnel.demand.fill.value : null);
  if (side === "demand") {
    const fill = fillOf();
    const variant = motion.funnel.demand.fillVariant;
    lines.push({
      row: "sideFunnel",
      id: "mkt.liq.fill-rate",
      label: fillTemplate(f.liquidity, { kind: kindOf(variant, strings) }),
      value: !fill ? "" : fill.hi > 0 && fill.hi < 0.5 ? strings.visual.lessThanOne : formatPerHundredCount(fill, ctx, strings.units),
      text: fill ? fillTemplate(variant === "requests" ? f.fillRequests : f.fillSearches, { fill: formatInterval(fill, "percent", ctx, strings.units) }) : f.fillUnknown,
    });
  } else {
    const supply = motion.funnel.supply;
    const rate = (id: MktCandidateId, label: string, known: typeof supply.churn): Row => {
      const comparator = comparatorOf(state, id);
      const value = known.kind === "known" ? formatInterval(known.value, "percent", ctx, strings.units) : "";
      const target = comparator ? fillTemplate(f.rateTarget, { target: formatInterval(point(impactTarget(comparator)), "percent", ctx, strings.units) }) : "";
      return { row: "sideFunnel", id, label, value, text: [value || strings.slide.noNumber, target].filter(Boolean).join(" · ") };
    };
    lines.push(rate("mkt.sell.churn", f.churnLabel, supply.churn));
    if (supply.paidChurn) lines.push(rate("mkt.sell.paid-churn", f.paidChurnLabel, supply.paidChurn));
    // The sellers who pay nothing: where they show instead, said in one line (never a zero).
    const fill = fillOf();
    if (!settings.sellerSubscriptions && fill) {
      lines.push({ row: "sideFunnel", id: "aside", label: "", value: "", text: fillTemplate(f.liquidityAside, { fill: formatInterval(fill, "percent", ctx, strings.units), kind: kindOf(motion.funnel.demand.fillVariant, strings) }) });
    }
  }
  lines.push(footer);
  notes.push(seasonalNote(state, strings));
  return { present: true, title: mktFunnelTitle(funnel, side, state, strings, ctx), lines, notes, motion: "mkt", side };
}

// --- A side's leak (C102) ---------------------------------------------------------------

/** What closing a stage's gap is worth, as the ranking priced it (the exact amount a month, said as every projection: two significant digits and « ~ », C97). */
function rankedWorth(impact: Impact | undefined, state: EngineState, strings: Words, ctx: EngineCalcContext): string | null {
  const amount = impact?.mrrPerMonth ? formatApproxMoneyInterval(impact.mrrPerMonth, state.setup.currency, ctx, strings.units) : null;
  if (!impact || !amount) return null;
  return fillTemplate(impact.kind === "retained-mrr" ? strings.worth.retainedMrr : strings.worth.newMrr, { amount });
}

type SideDiagnosis = Diagnosis<MktCandidateId>;
interface Leak {
  present: boolean;
  title: SlideTitle;
  lines: Row[];
  notes: string[];
}

/**
 * A side's leak slide: `buildLeak`'s structure (the title, the chain's lines at the same ranks, the footer, the notes `whyNot`,
 * the « À côté » column) on the side's own diagnosis and chain (`mktWhatIf`), in the side's words. Differences, each one a rule
 * of the marketplace: a churn is the side's (`isRetentionMetric`, not `ret.logo-churn`); the footer's assumption is empty, a
 * marketplace has no `leakAssumption` of its own; a stage under its target in « À côté » is worth the amount the ranking
 * priced (C97: « ~130 € », not the chain's rounded count × the price) — and stays `tone: "below"` in the model, the slide
 * drawing it in ink (C102).
 */
function buildLeak({ state, metrics, ctx }: Input, diagnosis: SideDiagnosis, strings: Words): Leak {
  const locale = ctx.locale;
  const absent: Leak = { present: false, title: { key: "leakLevel", values: {} }, lines: [], notes: [] };
  const subject = (id: MetricId) => subjectOf(id, strings, metrics);
  const positions = diagnosis.positions;
  const named = diagnosis.named;
  const impactOf = (id: MktCandidateId): Impact | null => {
    const comparator = positions[id]?.comparator;
    return comparator ? mktWhatIf(state, id, impactTarget(comparator), ctx, strings.units) : null;
  };

  const lines: Row[] = [];
  const notes: string[] = [];
  let title: SlideTitle;
  /** What closing the named gap is worth, for the notes that compare the others with it. */
  let top: string | null = null;

  const unpriced = (id: MktCandidateId) => {
    const comparator = positions[id]?.comparator;
    return comparator !== undefined && !isPricedAt(id, impactTarget(comparator));
  };
  if (diagnosis.state === "clear" && unpriced(named[0]!)) {
    // A stage the model can't price — the sellers' first sale, a referred share past a 50 % target — still gets its slide: its
    // title names the value and the target, never an amount; the footer says why there is none; no chain, so no card.
    const id = named[0]!;
    const comparator = positions[id]?.comparator;
    const known = knownIn(state, id, ctx);
    if (!comparator || known.kind !== "known") return absent;
    const target = targetPhrase(comparator, id, state, strings, ctx);
    const value = formatInterval(known.value, shapeOf(id).unit, ctx, strings.units);
    title = { key: "leakClearUnpriced", values: { stage: capitalise(subject(id)), value, target } };
    const ceiling = formatInterval(point(REFERRAL_PRICING_CEILING), "percent", ctx, strings.units);
    lines.push({ row: "footer", text: REFERRAL_CANDIDATES.includes(id) ? fillTemplate(strings.slide.leakFooterCeiling, { max: ceiling }) : strings.slide.leakFooterUnpriced });
    notes.push(fillTemplate(strings.notes.compared, { comparator: target }));
  } else if (diagnosis.state === "clear") {
    const id = named[0]!;
    const comparator = positions[id]?.comparator;
    const impact = impactOf(id);
    // A gain under one buyer (or seller) a month is not an argument for a committee: that slide stays out (C9).
    if (!comparator || !impact || impact.lines.some((l) => l.key === "less-than-one")) return absent;
    const stage = subject(id);
    const target = targetPhrase(comparator, id, state, strings, ctx);
    const head = impactHeadline(impact);
    if (head.amount) {
      title = { key: impact.kind === "retained-mrr" ? "leakClearMrrRetained" : "leakClearMrrNew", values: { stage, target, amount: head.amount } };
    } else if (head.n) {
      const base = isRetentionMetric(id) ? "leakClearKept" : "leakClearCustomers";
      title = { key: numbered(base, head.count, locale), values: { stage, target, n: head.n } };
    } else {
      return absent;
    }
    for (const line of impact.lines) lines.push(chainLine(line, impact, stage, target, strings, locale));
    // A marketplace's leak says no assumption of its own (§22.12 MKT-8, step 6): the footer keeps « toutes choses égales ».
    lines.push({ row: "footer", text: fillSegments(strings.slide.leakFooter, { assumption: "" }) });
    notes.push(fillTemplate(strings.notes.compared, { comparator: target }));
    top = worthOf(impact, strings, locale);
  } else if (diagnosis.state === "shared") {
    title = { key: "leakShared", values: { n: String(named.length), list: joinList(named.map(subject), strings.grammar) } };
  } else if (diagnosis.state === "level") {
    title = { key: "leakLevel", values: {} };
  } else {
    const values = notEnoughBelowValues(diagnosis, strings, metrics);
    if (!values) return absent;
    title = { key: "leakNotEnoughBelow", values };
  }

  // Alongside: every other candidate of the side, where it stands — on the right side of its comparator, and what it is worth.
  const r = strings.notes.ranking;
  for (const id of Object.keys(positions) as MktCandidateId[]) {
    if (diagnosis.state === "clear" && id === named[0]) continue;
    const at = positions[id];
    if (!at) continue;
    const { position, comparator } = at;
    const where = sideText(position, comparator, strings);
    let text: string;
    let ranking: string;
    let tone: "below" | "neutral" | "unknown" = "neutral";
    if (position === "unknown") {
      [text, ranking, tone] = [strings.slide.cannotExclude, r.unknown, "unknown"];
    } else if (!where) {
      [text, ranking] = [strings.slide.noComparator, r.noComparator];
    } else if (position === "below") {
      const worth = rankedWorth(at.impact, state, strings, ctx);
      tone = "below";
      text = `${where} · ${worth ?? strings.slide.unpricedShort}`;
      ranking =
        isRetentionMetric(id) && churnWithoutCommonAmount(diagnosis)
          ? fillTemplate(r.belowNoArpa, { side: where })
          : worth && top
            ? fillTemplate(r.belowWorth, { side: where, worth, top })
            : fillTemplate(r.belowUnpriced, { side: where });
    } else {
      [text, ranking] = [where, position === "maybe-below" ? fillTemplate(r.maybe, { side: where }) : where];
    }
    lines.push({ row: "aside", id, label: metricOf(metrics, id).name, text, tone });
    if (diagnosis.state === "clear") notes.push(fillTemplate(strings.notes.whyNot, { stage: subject(id), ranking: capitalise(ranking) }));
  }
  const blind = blindSentence(diagnosis.blind, strings, metrics);
  if (blind) lines.push({ row: "blind", text: blind });
  notes.push(seasonalNote(state, strings));
  return { present: true, title, lines, notes };
}

// --- A side's « Et si » (C103) ----------------------------------------------------------

/** The growth figures of a side's what-if table, in the order a leadership meeting reads them: the revenue in 12 months and what is new, then one new unit, then the cash. No NRR: a marketplace has none (§22.8.3, line 7). */
const KPI_IDS = ["mrr12", "newMrr", "cac", "ltv", "ltvCac", "payback", "cash"] as const;
type KpiId = (typeof KPI_IDS)[number];

function kpiOf(k: MktScenarioKpis, id: KpiId): Interval | null {
  return id === "cash" ? (k.cash?.tiedUp ?? null) : k[id];
}

function kpiLabel(id: KpiId, strings: Words): string {
  const w = strings.scenario;
  const labels: Record<KpiId, string> = { mrr12: w.kpiMrr12, newMrr: w.kpiNewMrr, cac: w.kpiCac, ltv: w.kpiLtv, ltvCac: w.rowLtvCac, payback: w.kpiPayback, cash: w.rowCash };
  return labels[id];
}

/** The side's two tables and the footer for one scenario — a lever alone, or all of them. */
function scenarioLines({ state, ctx }: Input, s: MktScenario, rowTemplate: string, strings: Words): Row[] {
  const printers = whatIfPrinters(state, strings, ctx);
  const w = strings.scenario;
  const lines: Row[] = KPI_IDS.map((id) => changeRow("kpi", id, kpiLabel(id, strings), kpiOf(s.today.kpis, id), kpiOf(s.projected.kpis, id), printers.kpis[id], rowTemplate, strings));
  // The month's funnel, top to bottom: the visitors, the sign-ups, and the side's new units (a new buyer, a new paid seller).
  const newUnits = s.side === "demand" ? strings.mkt.funnel.newBuyers : strings.mkt.funnel.newPaidSellers;
  const steps: [string, string, Interval | null, Interval | null, Printers][] = [
    ["visitors", w.visitors, s.today.funnel.visitors, s.projected.funnel.visitors, printers.steps.visitors],
    ["signups", w.signups, s.today.funnel.signups, s.projected.funnel.signups, printers.steps.signups],
    ["newUnits", newUnits, s.today.funnel.newUnits, s.projected.funnel.newUnits, printers.steps.signups],
  ];
  for (const [id, label, today, after, print] of steps) lines.push(changeRow("funnelStep", id, label, today, after, print, rowTemplate, strings));
  // What the projection takes for granted, only what applied (mkt-scenario.ts), as the slide's footer: the six rules of the
  // marketplace's own are `mkt.assumption`, the four it shares with the SaaS are `scenario.assumption`.
  const own = strings.mkt.assumption as Record<string, string>;
  const shared = strings.scenario.assumption as Record<string, string>;
  if (s.assumptions.length) lines.push({ row: "footer", text: s.assumptions.map((a) => own[a] ?? shared[a]!).join(" ") });
  return lines;
}

/** What a side's money levers do to today's whole base at month 1: `revenue × kept ÷ 100 × (ratio − 1)`, `kept` the share the side's churn keeps (§22.8.5 k). null when a figure of it is unknown. */
function jumpOf(s: MktScenario): Interval | null {
  const today = s.today.kpis;
  const after = s.projected.kpis;
  if (!today.mrr || !today.revenuePerUnit || !after.revenuePerUnit) return null;
  const ratio = div(after.revenuePerUnit, today.revenuePerUnit);
  if (!ratio) return null;
  // The churn the projected column keeps the base at: its own target when a lever moved it, else today's — as `demandPath` and `sellerPath` read it.
  const lever = s.levers.find((l) => l.id === (s.side === "demand" ? "mkt.buy.churn" : "mkt.sell.paid-churn"));
  const churn = lever?.target !== null && lever?.target !== undefined ? point(lever.target) : (lever?.today ?? null);
  if (!churn) return null;
  return mul(scale(mul(today.mrr, keptPercentOfChurn(churn)), 1 / 100), sub(ratio, point(1)));
}

/** A what-if slide's curve with the ring at month 1 and its sentence, once a money lever moved (`mkt.curve.step*`). */
function curveOf(input: Input, s: MktScenario, strings: Words, whatifKey: string, to: (id: LeverId) => string) {
  const { state, ctx } = input;
  const curve = slideCurve(s.today.kpis, s.projected.kpis, whatifKey, state, strings, ctx);
  if (!curve) return null;
  const money = s.moved.filter((id) => MONEY_LEVERS[s.side].includes(id));
  if (money.length === 0) return curve;
  const step = jumpOf(s);
  const amount = step ? formatApproxMoneyInterval(step, state.setup.currency, ctx, strings.units) : null;
  if (!amount) return { ...curve, step: true };
  const c = strings.mkt.curve;
  const note =
    s.side === "supply"
      ? fillTemplate(c.stepSupply, { to: to(money[0]!), step: amount })
      : money.length > 1
        ? fillTemplate(c.stepMany, { n: String(money.length), step: amount })
        : fillTemplate(c.stepOne, { subject: strings.leverSubject[money[0]! as keyof Words["leverSubject"]], to: to(money[0]!), step: amount });
  return { ...curve, step: true, note };
}

interface MovedLever {
  id: LeverId;
  /** Today's value and the target, in the lever's own unit. */
  from: string;
  to: string;
  alone: MktScenario;
}

/** The side's levers the team moved, in lever order, each printing a visible move (« de 12 % à 12 % » moves nothing a reader can see). */
function movedLevers({ state, ctx }: Input, side: MktSide, strings: Words): MovedLever[] {
  return LEVER_IDS[side].flatMap((id) => {
    const alone = mktLeverAlone(state, id, ctx);
    const lever = alone?.levers.find((l) => l.id === id);
    if (!alone || !lever?.today || lever.target === null) return [];
    const print = (i: Interval) => formatInterval(i, lever.unit === "count" ? "ratio" : lever.unit, ctx, strings.units, { currency: state.setup.currency });
    const from = print(lever.today);
    const to = print(point(lever.target));
    return from === to ? [] : [{ id, from, to, alone }];
  });
}

function mrrGain(s: MktScenario): Interval | null {
  const { mrr12: today } = s.today.kpis;
  const { mrr12: after } = s.projected.kpis;
  return today && after ? changeOf(today, after) : null;
}

/** A side's what-if slides, in the order they print: each lever it moved alone, then — two or more — all of them together. */
function buildWhatIfSlides(input: Input, side: MktSide, strings: Words): { id: SlideId; slide: BuiltSlide }[] {
  const { state, ctx } = input;
  const levers = movedLevers(input, side, strings);
  const { approxMoney, roundMoney } = whatIfPrinters(state, strings, ctx);
  const notes = [strings.notes.whatIf, seasonalNote(state, strings)];
  const toOf = (moved: readonly MovedLever[]) => (id: LeverId) => moved.find((l) => l.id === id)?.to ?? "";

  const slides = levers.map((lever): { id: SlideId; slide: BuiltSlide } => {
    const gain = mrrGain(lever.alone);
    const values = { stage: strings.leverSubject[lever.id as keyof Words["leverSubject"]], from: lever.from, to: lever.to };
    const title: SlideTitle = isPricedGain(gain) ? { key: "whatIfLever", values: { ...values, gain: approxMoney(gain) } } : { key: "whatIfLeverPlain", values };
    const curve = curveOf(input, lever.alone, strings, strings.slide.curveWhatifOne, toOf([lever]));
    return {
      id: `whatif:${lever.id}`,
      slide: { present: true, title, lines: scenarioLines(input, lever.alone, strings.slide.whatIfRowOne, strings), notes, ...(curve ? { curve } : {}), motion: "mkt", side },
    };
  });
  // One lever is already its own slide: « together » would repeat it.
  if (levers.length < 2) return slides;

  const targets: Partial<Record<LeverId, number>> = Object.fromEntries(levers.map((l) => [l.id, state.whatIf![l.id]!]));
  const all = buildMktScenario(state, targets, ctx, side);
  const gain = mrrGain(all);
  const n = String(levers.length);
  const leverRows: Row[] = levers.map((lever) => {
    const alone = mrrGain(lever.alone);
    const own = alone ? formatChange(alone, roundMoney, strings.units) : "";
    return {
      row: "lever",
      id: lever.id,
      label: capitalise(strings.leverSubject[lever.id as keyof Words["leverSubject"]]),
      from: lever.from,
      to: lever.to,
      gain: own,
      text: fillSegments(strings.slide.whatIfLeverRow, { from: lever.from, to: lever.to, gain: own }),
    };
  });
  // The sum of the levers taken alone against the whole: what the whole adds is the compounding.
  const together: Row[] = [];
  if (gain) {
    const sum = levers.map((l) => mrrGain(l.alone)!).reduce((acc, g) => ({ lo: acc.lo + g.lo, hi: acc.hi + g.hi }), { lo: 0, hi: 0 });
    const extra = changeOf(sum, gain);
    const total = formatChange(gain, roundMoney, strings.units);
    together.push({
      row: "together",
      text: gain.lo > 0 && extra.lo >= 1 ? fillTemplate(strings.scenario.together, { total, extra: approxMoney(extra) }) : fillTemplate(strings.scenario.togetherNoExtra, { total }),
    });
  }
  const curve = curveOf(input, all, strings, fillTemplate(strings.slide.curveWhatifAll, { n }), toOf(levers));
  slides.push({
    id: side === "demand" ? "mktScenarioDemand" : "mktScenarioSupply",
    slide: {
      present: true,
      title: isPricedGain(gain) ? { key: "scenario", values: { n, gain: approxMoney(gain) } } : { key: "scenarioPlain", values: { n } },
      lines: [...leverRows, ...together, ...scenarioLines(input, all, strings.slide.whatIfRowAll, strings)],
      notes,
      ...withDrawings(
        curve,
        slideLeverSum(
          levers.map((l) => ({ id: l.id, label: capitalise(strings.leverSubject[l.id as keyof Words["leverSubject"]]), from: l.from, to: l.to, gain: mrrGain(l.alone) })),
          gain,
          state,
          strings,
          ctx,
        ),
      ),
      motion: "mkt",
      side,
    },
  });
  return slides;
}

// --- A side's unit economics (C73) ------------------------------------------------------

/**
 * A side's unit-economics slide: one buyer (or one paid seller) on its own margin — the commissions' for a buyer, the
 * subscriptions' for a paid seller, never one for the other (D7) — from the same scenario as the board's money block, so the board
 * and the slide cannot disagree. `unitMoney` writes the months after payback, the cash tied up, the warning and what the cash
 * assumes; no reference situates the payback or the ratio (C73, D12): the chart is drawn without its dotted line and the ratio
 * carries no note. The paid seller's cost is never typed (D8): its tile says how it is computed, never « CAC ».
 */
function buildUnit(input: Input, side: MktSide, strings: Words, footer: Row): BuiltSlide {
  const { state, metrics, ctx, prose, motion } = input;
  const u = strings.units;
  const currency = state.setup.currency;
  const unit = motion.sides[side].unit;
  const kpis = buildMktScenario(state, {}, ctx, side).today.kpis;
  const money = unitMoney({ state, k: kpis, slg: false, unit: { ltv: unit.ltv, payback: unit.payback }, strings, metrics, ctx });
  // C73: no reference at all. `unitMoney` reads the SaaS's for the type it is given; the marketplace's picture has none.
  const chart = money.chart ? { ...money.chart, reference: null, labels: { ...money.chart.labels, reference: "" } } : null;

  let title: SlideTitle;
  if (unit.payback.kind === "known" && unit.ltvCac.kind === "known") {
    title = { key: "unitEconomics", values: { m: formatDurationInterval(unit.payback.value, "months", ctx, u), x: fillTemplate(u.times, { n: formatInterval(unit.ltvCac.value, "ratio", ctx, u) }) } };
  } else {
    const missing = [...new Set([...(unit.payback.kind === "uncomputable" ? unit.payback.missing : []), ...(unit.ltvCac.kind === "uncomputable" ? unit.ltvCac.missing : [])])];
    title = { key: "unitEconomicsUnknown", values: { input: unitInputsPhrase(missing, strings, metrics) } };
  }
  // A certain loss titles the slide (C48): the money first, the payback and the ratio in its tiles.
  if (money.lossTitle) title = money.lossTitle;

  const ids: Record<"ltv" | "payback" | "ltvCac", DerivedId> =
    side === "demand" ? { ltv: "mkt.rev.ltv", payback: "mkt.rev.cac-payback", ltvCac: "mkt.rev.ltv-cac" } : { ltv: "mkt.sell.ltv", payback: "mkt.sell.cac-payback", ltvCac: "mkt.sell.ltv-cac" };
  const margin = valueOf(state, side === "demand" ? "mkt.rev.gross-margin" : "mkt.sell.gross-margin", ctx);
  const approx = (d: DerivedValue) => (d.kind === "known" ? formatApproxMoneyInterval(d.value, currency, ctx, u) : "");
  const missingOf = (d: DerivedValue) => (d.kind === "uncomputable" ? d.missing : null);
  const figure = (row: string, id: DerivedId, value: string, missing: readonly MetricId[] | null, caveat = ""): Row => {
    const d = prose.derived?.find((x) => x.id === id);
    const note = !value && missing && d ? fillTemplate(d.uncomputable, { input: unitInputsPhrase(missing, strings, metrics) }) : value ? caveat : "";
    return { row, id, label: d?.name ?? "", value, note, text: [value, note].filter(Boolean).join(" · ") || strings.slide.noNumber };
  };

  // The cost tile. A buyer's is typed (`mkt.buy.cac`, with its variant); a paid seller's is computed from three numbers (D8), and says so.
  let cost: Row;
  if (side === "demand") {
    const cac = valueOf(state, "mkt.buy.cac", ctx);
    const variantId = currentSnapshot(state).metrics["mkt.buy.cac"]?.variant;
    const variant = metricOf(metrics, "mkt.buy.cac").variants?.find((v) => v.id === variantId)?.label ?? "";
    const value = cac ? formatInterval(cac, "money", ctx, u, { currency }) : "";
    cost = { row: "cac", id: "mkt.buy.cac", label: metricOf(metrics, "mkt.buy.cac").name, value, variant, text: value ? [value, lowerFirst(variant)].filter(Boolean).join(" · ") : strings.slide.noNumber };
  } else {
    const paid = unit.cac?.kind === "known" ? unit.cac.value : null;
    const [cpa, fs, conv] = [valueOf(state, "mkt.sell.cac", ctx), valueOf(state, "mkt.sell.first-sale", ctx), valueOf(state, "mkt.sell.paid-conversion", ctx)];
    const value = paid ? formatInterval(paid, "money", ctx, u, { currency }) : "";
    const how =
      paid && cpa && fs && conv
        ? fillTemplate(strings.mkt.slide.sellerCostTile, { cpa: formatInterval(cpa, "money", ctx, u, { currency }), fs: formatInterval(fs, "percent", ctx, u), conv: formatInterval(conv, "percent", ctx, u) })
        : "";
    cost = { row: "cac", id: "mkt.sell.cac", label: strings.scenario.kpiCac, value, variant: how, text: value ? [value, how].filter(Boolean).join(" · ") : strings.slide.noNumber };
  }

  const lines: Row[] = [
    cost,
    figure("payback", ids.payback, unit.payback.kind === "known" ? formatDurationInterval(unit.payback.value, "months", ctx, u) : "", missingOf(unit.payback)),
    // The margin is an estimate when it is a range: the LTV's tile says so.
    figure("ltv", ids.ltv, approx(unit.ltv), missingOf(unit.ltv), margin && margin.lo !== margin.hi ? fillTemplate(strings.mkt.slide.marginRange, { range: formatInterval(margin, "percent", ctx, u) }) : ""),
    figure("ltvCac", ids.ltvCac, unit.ltvCac.kind === "known" ? fillTemplate(u.times, { n: formatInterval(unit.ltvCac.value, "ratio", ctx, u) }) : "", missingOf(unit.ltvCac)),
    // The months after payback, the cash, the warning, what the cash assumes (A20.d T4.c). No GRR or NRR, no reference.
    ...money.rows,
  ];
  if (unit.ltv.kind === "known") lines.push({ row: "cap", text: strings.slide.unitCap });
  lines.push(footer);
  const present = cost.value !== "" || [unit.ltv, unit.payback, unit.ltvCac].some((d) => d.kind === "known");
  return { present, title, lines, notes: [], ...(chart ? { paybackChart: chart } : {}), motion: "mkt", side };
}

// --- The deck ---------------------------------------------------------------------------

/**
 * A marketplace's deck (§22.12 MKT-8): with the sellers' subscriptions, the total; then the buyers' slides (funnel, leak, « Et si »,
 * unit economics), then the sellers'; then « Ce qui a bougé » (from the second month, unticked), then the slides every type shares
 * (visibility, the Tour, the ask, the appendix). Never interleaved, never face to face. Without subscriptions there is no total —
 * one stream is not a sum — and the sellers have their funnel and, once they have targets, their leak: no money, no « Et si », no
 * unit economics (D9).
 *
 * `stringsForSide(side)` words what a slide of that side writes at construction (its rows, its notes); its title is resolved at
 * render by the same function (`SlideContext#stringsForSide`, `slideStrings`).
 */
export function buildMarketplaceDeck(
  state: EngineState,
  derived: EngineDerived,
  strings: Words,
  stringsForSide: StringsForSide,
  metrics: ResolvedMetric[],
  ctx: EngineCalcContext,
  prose: DeckProse,
): DeckModel {
  const motion = mktMotionOf(derived);
  const input: Input = { state, derived, strings, forSide: stringsForSide, metrics, ctx, prose, motion };
  const snapshot = currentSnapshot(state);
  const sellersPay = mktSetup(state.setup).sellerSubscriptions;
  const month = formatMonth(snapshot.referenceMonth, ctx.locale);
  const cohort = formatMonth(snapshot.cohortMonth, ctx.locale);
  const tools = joinList(toolsOf(state, motionShapes(state.setup), strings), strings.grammar);
  /** A side's slides cite the sign-ups of its side, in its words: each carries its own footer (`slide.footer`, rewritten by the supply). */
  const footerOf = (side: MktSide): Row => ({ row: "footer", text: fillSegments(stringsForSide(side).slide.footer, { cohort, month, tools }) });

  // --- Each side's slides, in their order: the funnel, the leak, the what-ifs, the unit economics.
  const sideEntries = (side: MktSide): Entry[] => {
    const s = stringsForSide(side);
    const diagnosis = motion.sides[side].diagnosis;
    const leak = buildLeak(input, diagnosis, s);
    // The sellers wait for their targets: a side that cannot name what holds it back has no leak slide (C103).
    const leakPresent = leak.present && !(side === "supply" && diagnosis.state === "not-enough");
    const id = (demand: SlideId, supply: SlideId) => (side === "demand" ? demand : supply);
    return [
      { id: id("mktFunnelDemand", "mktFunnelSupply"), slide: buildFunnel(input, side, s, footerOf(side)), byDefault: true },
      { id: id("mktLeakDemand", "mktLeakSupply"), slide: { present: leakPresent, title: leak.title, lines: leak.lines, notes: leak.notes, motion: "mkt", side }, byDefault: true },
      // The sellers who pay nothing have no « Et si »: no money, no lever (`buildSupply`).
      ...buildWhatIfSlides(input, side, s).map((w) => ({ ...w, byDefault: true })),
      { id: id("mktUnitDemand", "mktUnitSupply"), slide: buildUnit(input, side, s, footerOf(side)), byDefault: true },
    ];
  };

  // --- The slides every type shares.
  const visibility = buildVisibility(state, derived, strings, metrics, ctx);
  const ask = buildAsk(state, derived, strings, metrics, ctx);
  const mirror = derived.mirror;
  const mirrorLinked = Boolean(state.tourLink && mirror && mirror.resultId === state.tourLink.resultId);
  const annexRows = buildAnnex(state, strings, metrics, ctx);
  const shared: Entry[] = [
    { id: "visibility", slide: { present: true, title: visibility.title, lines: visibility.lines, notes: [] }, byDefault: true },
    {
      id: "mirror",
      slide: {
        present: mirrorLinked,
        title: {
          key: "mirror",
          values: mirror
            ? {
                k: String(mirror.rows.filter((row) => row.declared === "tracked").length),
                m: String(mirror.rows.filter((row) => row.declared === "tracked" && (row.found === "tracked" || row.found === "approximate")).length),
              }
            : { k: "0", m: "0" },
        },
        lines: mirror ? mirrorLines(mirror, strings, metrics, ctx, prose) : [],
        notes: [],
      },
      byDefault: DEFAULT_INCLUDE.mirror,
    },
    { id: "ask", slide: { present: ask.present, title: ask.title, lines: ask.lines, notes: [] }, byDefault: true },
    ...annexSlides({ present: true, title: { key: "annex", values: { i: "1", n: "1" } }, lines: annexRows, notes: [] }, annexRows),
  ];

  // « Ce qui a bougé » (§19.2.6): after the sellers' slides, unticked until the team ticks it; it prints the two sides one after the other.
  const evolution = buildEvolutionSlide(state, derived.series, "mkt", { demand: motion.sides.demand.diagnosis, supply: motion.sides.supply.diagnosis }, strings, metrics, ctx);

  // The total, only when the sellers pay a subscription: one stream is not a sum, and a title that says it would be a hole.
  const totalEntry: Entry[] = sellersPay
    ? [
        {
          id: "mktTotal",
          slide: { present: true, title: mktTotalTitle(derived, state, strings, ctx), lines: [...totalLines(input), { row: "footer", text: fillSegments(strings.mkt.total.footer, { month, tools }) }], notes: [] },
          byDefault: true,
        },
      ]
    : [];
  const entries: Entry[] = [...totalEntry, ...sideEntries("demand"), ...sideEntries("supply"), ...(evolution ? [{ id: "evolution" as const, slide: evolution, byDefault: false }] : []), ...shared];

  let index = 0;
  const slides: DeckSlide[] = entries.map(({ id, slide, byDefault }) => {
    const included = slide.present && (state.deck.include[includeKeyOf(id)] ?? byDefault);
    return { id, ...slide, included, index: included ? ++index : null };
  });

  // The total cites the slides of each side in the deck as it is numbered (a slide a person unticked is no number).
  if (sellersPay) {
    const at = slides.findIndex((s) => s.id === "mktTotal");
    const numbersOf = (side: MktSide) => slides.flatMap((s) => (s.side === side && s.index !== null ? [s.index] : []));
    const lines = slides[at]!.lines.map((line) => (line.row === "streams" && (line.id === "demand" || line.id === "supply") ? { ...line, side: sideLine(line.id, numbersOf(line.id), strings) } : line));
    slides[at] = { ...slides[at]!, lines };
  }

  const label = state.deck.showCompany ? slideGlyphs(state.setup.companyLabel ?? "") : "";
  const company = label ? `${label} · ` : "";
  return {
    slides,
    checks: derived.sanity,
    dataPill: { measured: derived.coverage.found, approximate: derived.coverage.approximate, missing: derived.coverage.missing },
    kicker: { company, month },
    footer: {
      cohort,
      month,
      tools,
      credit: state.deck.showSiteCredit ? strings.slide.credit : "",
      // Finished: with no tool measured, « sources : » is dropped whole rather than left dangling.
      text: fillSegments(strings.slide.footer, { cohort, month, tools }),
    },
  };
}
