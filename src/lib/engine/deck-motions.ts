import { shapeOf } from "./catalog-shape";
import { periodRangeOf } from "./cohort";
import { capitalise, fillTemplate, formatInterval, formatMonthRange, formatPerHundredCount, joinList } from "./format";
import { mapBounds, point } from "./interval";
import { numbered, stagePhrase } from "./phrases";
import type { EngineStrings, ResolvedMetric } from "./strings";
import { buildScenario } from "./scenario";
import { buildSlgScenario } from "./slg-scenario";
import { formatSum } from "./total";
import type { DerivedValue, EngineCalcContext, EngineState, Interval, Motion, Relays, SlideTitle, TotalView } from "./types";
import { currentSnapshot, entryOf, knownIn } from "./values";

/**
 * deck-motions.ts — the words of what the sales-assisted motion and the
 * hybrid add to the board and the deck (engine spec §18.7, §18.8): the
 * relays' title, the total's title and its two blocks. The SAME functions
 * feed the board (S3) and the slides (S4), as `pelotonTitle` does for
 * self-serve: a screen and a slide cannot word one engine two ways.
 *
 * Nothing here compares the two motions (§18.6.4): a total is a sum, the
 * blocks come in the fixed order — self-serve, then sales-assisted — and no
 * function ranks, subtracts or sets one against the other.
 */

type Words = EngineStrings;

const RELAY_CLAUSES = {
  "slg.acq.lead-to-opp": ["clauseLeadToOpp", "q"],
  "slg.rev.win-rate": ["clauseWinRate", "w"],
  "slg.act.go-live": ["clauseGoLive", "g"],
} as const;

/** The first relay's base as a noun after « 100 »: « leads » or « MQL », by the lead-to-opportunity variant. */
export function leadBase(relays: Relays, strings: Words): string {
  return strings.findings.base[relays.leadNoun];
}

/**
 * The relays' verdict title (§18.8.2, `slg:peloton`) — the board's verdict in
 * sales-assisted alone, the slide's title in the deck. Each clause counts on
 * its relay's OWN base of 100, its verb agreeing with its own printed count;
 * the clauses are joined with « ; » and never multiplied into a chain.
 */
export function relaysTitle(state: EngineState, relays: Relays, strings: Words, metrics: ResolvedMetric[], ctx: EngineCalcContext): SlideTitle {
  const base = leadBase(relays, strings);
  const n = String(state.setup.goLiveWindowDays);
  const clauses = relays.columns.map((column) => {
    const known = knownIn(state, column.metric, ctx);
    if (known.kind !== "known") return null;
    // As printed: under half a person the count reads « moins de 1 », which French agrees in the singular.
    const printed = known.value.hi > 0 && known.value.hi < 0.5 ? point(0) : mapBounds(known.value, Math.round);
    const [key, slot] = RELAY_CLAUSES[column.metric];
    return fillTemplate(strings.relays[numbered(key, printed, ctx.locale)], { [slot]: formatPerHundredCount(known.value, ctx, strings.units), base, n });
  });
  if (relays.chain === "complete") return { key: "slgPelotonComplete", values: { r1: capitalise(clauses[0]!), r2: clauses[1]!, r3: clauses[2]! } };
  if (relays.chain === "empty") return { key: "slgPelotonEmpty", values: { base } };
  const known = clauses.filter((c): c is string => c !== null);
  const unknown = relays.columns.filter((_, i) => clauses[i] === null).map((c) => stagePhrase(c.metric, strings, metrics));
  const one = unknown.length === 1;
  const key = relays.chain === "gap" ? (one ? "slgPelotonGapOne" : "slgPelotonGap") : one ? "slgPelotonTailBreakOne" : "slgPelotonTailBreak";
  return { key, values: { clauses: capitalise(known.join(strings.relays.clauseJoin)), stages: joinList(unknown, strings.grammar) } };
}

/**
 * « Deux moteurs, un total » (§18.8.2): the MRR summed — the same three
 * strings as the body's first line, so the title and the body cannot
 * disagree — or which part is missing. Never the known part as a total (S9).
 */
export function totalTitle(total: TotalView, state: EngineState, strings: Words, ctx: EngineCalcContext): SlideTitle {
  const sum = formatSum(total.mrr, state.setup.currency, ctx, strings.units);
  if (sum) return { key: "total", values: { total: sum.total, plg: sum.plg, slg: sum.slg } };
  const plgKnown = total.mrr.plg.kind === "known";
  const slgKnown = total.mrr.slg.kind === "known";
  if (!plgKnown && !slgKnown) return { key: "totalUnknownBoth", values: {} };
  return { key: "totalUnknown", values: { motion: strings.hybrid.ofMotion[plgKnown ? "slg" : "plg"] } };
}

/** One motion's block of the total: its MRR and its new MRR a month, each "" when it isn't known. */
export interface TotalBlock {
  motion: Motion;
  mrr: string;
  newMrr: string;
}

/** One part alone, when the sum can't be printed: its own two significant digits, « ~ » unless it was typed. */
function partText(part: DerivedValue, state: EngineState, strings: Words, ctx: EngineCalcContext): string {
  if (part.kind !== "known") return "";
  const amount = formatInterval(part.value, "money", ctx, strings.units, { currency: state.setup.currency });
  return part.confidence === "solid" ? amount : fillTemplate(strings.units.approx, { n: amount });
}

/**
 * The two blocks of the band and of the slide, self-serve then
 * sales-assisted. When both parts of a row are known, each block prints the
 * part AS THE SUM PRINTS IT (one common unit): the reader adds the two
 * blocks and finds the title's total.
 */
export function totalBlocks(total: TotalView, state: EngineState, strings: Words, ctx: EngineCalcContext): TotalBlock[] {
  const currency = state.setup.currency;
  const mrr = formatSum(total.mrr, currency, ctx, strings.units);
  const newMrr = formatSum(total.newMrrPerMonth, currency, ctx, strings.units);
  return (["plg", "slg"] as const).map((motion) => ({
    motion,
    mrr: mrr ? mrr[motion] : partText(total.mrr[motion], state, strings, ctx),
    newMrr: newMrr ? newMrr[motion] : partText(total.newMrrPerMonth[motion], state, strings, ctx),
  }));
}

/** « Nouveau MRR du mois : a + b = c » and « Dans 12 mois, au rythme actuel : a + b = c », each only when both parts exist (S9, Q11). */
export function totalSums(total: TotalView, state: EngineState, strings: Words, ctx: EngineCalcContext): { key: "newMrr" | "mrr12"; text: string }[] {
  const currency = state.setup.currency;
  const rows: { key: "newMrr" | "mrr12"; text: string }[] = [];
  const newMrr = formatSum(total.newMrrPerMonth, currency, ctx, strings.units);
  if (newMrr) rows.push({ key: "newMrr", text: fillTemplate(strings.total.newMrrSum, { plg: newMrr.plg, slg: newMrr.slg, total: newMrr.total }) });
  const mrr12 = formatSum(total.mrrIn12Months, currency, ctx, strings.units);
  if (mrr12) rows.push({ key: "mrr12", text: fillTemplate(strings.total.mrr12Sum, { plg: mrr12.plg, slg: mrr12.slg, total: mrr12.total }) });
  return rows;
}

/**
 * The link's sentence (§18.6.3, the return 07's since A18.d): « {n}
 * opportunités sont venues du libre-service (juin à août 2026). » Counted when
 * the link was entered as counts; a share alone gives « ~n » of the
 * opportunities. null without the link or without the opportunities: a
 * share of nothing says nothing. A share of the pipeline, never an
 * attribution — `total.linkNote` goes with it wherever it is printed.
 */
export function linkSentence(total: TotalView, state: EngineState, strings: Words, ctx: EngineCalcContext): string | null {
  const { link } = total;
  const m = link.oppsCreated;
  if (m === null) return null;
  let n: string;
  let count: number;
  if (link.fromSelfServe !== null) {
    count = link.fromSelfServe;
    n = formatInterval(point(count), "ratio", ctx, strings.units);
  } else if (link.known.kind === "known") {
    count = Math.round(((link.known.value.lo + link.known.value.hi) / 2 / 100) * m);
    n = fillTemplate(strings.units.approx, { n: formatInterval(point(count), "ratio", ctx, strings.units) });
  } else {
    return null;
  }
  const snapshot = currentSnapshot(state);
  const range = periodRangeOf(shapeOf("link.pql-handoff"), entryOf(snapshot, "link.pql-handoff"), snapshot, state.setup, ctx.today);
  const period = range ? formatMonthRange(range, ctx.locale, strings.units) : "";
  const key = numbered("link", point(count), ctx.locale);
  return fillTemplate(strings.total[key], { n, period });
}

/**
 * The hybrid's one line in the full « Et si » panel of either engine (§18.5.5, A18 T5): the MRR in
 * twelve months, today and with the what-ifs of BOTH panels — a sum by the
 * rule of every sum here (`formatSum`), never a comparison. null when either
 * motion can't project its MRR (S9: a total exists only when its parts do).
 * `projected` is null when no lever of either panel moved.
 */
export function totalIn12(state: EngineState, strings: Words, ctx: EngineCalcContext): { today: string; projected: string | null } | null {
  const targets = state.whatIf ?? {};
  const plg = buildScenario(state, targets, ctx);
  const slg = buildSlgScenario(state, targets, ctx);
  const known = (value: Interval | null): DerivedValue => (value ? { kind: "known", value, confidence: "approximate" } : { kind: "uncomputable", missing: [] });
  const row = (a: Interval | null, b: Interval | null) => {
    const plgPart = known(a);
    const slgPart = known(b);
    return formatSum({ plg: plgPart, slg: slgPart, total: plgPart }, state.setup.currency, ctx, strings.units);
  };
  const today = row(plg.today.kpis.mrr12, slg.today.mrr12);
  if (!today) return null;
  const moved = plg.moved.length + slg.moved.length > 0;
  const projected = moved ? row(plg.projected.kpis.mrr12, slg.projected.mrr12) : null;
  return { today: today.total, projected: projected ? projected.total : null };
}
