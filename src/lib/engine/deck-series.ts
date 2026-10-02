import { shapeOf } from "./catalog-shape";
import { type BuiltSlide, metricOf, type Row, whatIfPrinters } from "./deck";
import { fillTemplate, formatChange, formatInterval, formatMonth, pairPrecision, rateRounding } from "./format";
import { point } from "./interval";
import { type AnyDiagnosis, numbered, subjectOf } from "./phrases";
import type { EngineStrings, ResolvedMetric } from "./strings";
import type { EngineCalcContext, EngineState, Interval, MetricId, Motion, MotionSeries, Series, SeriesRow, SlideTitle } from "./types";

/**
 * deck-series.ts — the slides of the monthly series (engine spec §19.2.6,
 * A14 T1): « Ce qui a bougé », one per motion from the second month on, and
 * the speaker note that takes over from `notes.seasonal`.
 *
 * Every number here comes from `series.ts`; this module only words it. The
 * rows are in catalogue order — AARRR — and never sorted by how far a number
 * moved: the slide shows what changed, it doesn't rank it.
 */

type Words = EngineStrings;

/** At most this many numbers on the slide (§19.2.6); the title counts them all. */
export const EVOLUTION_ROWS = 6;

/**
 * « Et si c'est saisonnier ? » (§9.4) with one month; from the second, the
 * note says how many months are tracked and where the comparison is. A
 * one-month engine keeps today's note, to the character (the goldens).
 */
export function seasonalNote(state: EngineState, strings: Words): string {
  const n = state.snapshots.length;
  return n < 2 ? strings.notes.seasonal : fillTemplate(strings.notes.series, { n: String(n) });
}

/**
 * The two months of one number and their difference, as printed — or `null`
 * when it doesn't compare. The board's rows read it too (A14 T2): the slide
 * and the screen print one change one way.
 */
export function evolutionPrinted(row: SeriesRow, state: EngineState, strings: Words, ctx: EngineCalcContext): { before: string; now: string; change: string; stable: boolean } | null {
  if (!row.comparison.comparable || !row.delta) return null;
  const { before, now } = row.comparison;
  const shape = shapeOf(row.metric);
  const units = strings.units;
  const currency = state.setup.currency;
  const change = point(now - before);
  if (shape.unit === "percent") {
    // A rate prints like the what-if slides': the two values at a shared precision, the change in points.
    const rate = whatIfPrinters(state, strings, ctx).kpis.nrr;
    const extra = pairPrecision(before, now, rateRounding);
    const a = rate.today(point(before), extra);
    const b = rate.projected(point(now), extra);
    return { before: a, now: b, change: formatChange(change, rate.change, units), stable: a === b };
  }
  const unit = shape.unit === "money" ? "money" : shape.unit === "duration" ? "duration" : "ratio";
  const print = (i: Interval) => formatInterval(i, unit, ctx, units, { currency });
  const a = print(point(before));
  const b = print(point(now));
  let moved = formatChange(change, print, units);
  // Money and durations also say how far in percent of the month before (« +1 200 € · +8 % »), never from a zero.
  if (row.delta.kind === "relative" && row.delta.percent !== null)
    moved += ` · ${formatChange(point(row.delta.percent), (i) => formatInterval(i, "percent", ctx, units), units)}`;
  return { before: a, now: b, change: moved, stable: a === b };
}

/** Why a number doesn't compare, in words: « estimé en août », « définition changée ». The board's rows read it too. */
export function evolutionApartText(row: SeriesRow, series: Series, strings: Words, ctx: EngineCalcContext): string | null {
  const c = row.comparison;
  if (c.comparable) return null;
  const a = strings.slide.seriesApart;
  if (c.why === "definition-changed") return a.definitionChanged;
  if (c.why === "entered-differently") return a.enteredDifferently;
  // Nothing measured this month: the row has nothing to say yet, and the slide says nothing for it.
  if (c.month === "now" && c.why === "not-measured") return null;
  const month = formatMonth(c.month === "before" ? series.previousMonth : series.month, ctx.locale);
  const template = c.why === "not-measured" ? a.notMeasured : c.why === "estimated" ? a.estimated : a.conflicting;
  return fillTemplate(template, { month });
}

/** « ; l'activation reste la fuite » / « ; l'activation devient la fuite », or "" when this month names no single leak. */
function leakClause(motion: MotionSeries, diagnosis: AnyDiagnosis, strings: Words, metrics: ResolvedMetric[]): string {
  if (diagnosis.state !== "clear") return "";
  const id = diagnosis.named[0]!;
  const stays = motion.previousLeak.length === 1 && motion.previousLeak[0] === id;
  return fillTemplate(stays ? strings.slide.evolutionLeakStays : strings.slide.evolutionLeakBecomes, { stage: subjectOf(id, strings, metrics) });
}

/**
 * « Ce qui a bougé » for one motion (§19.2.6), or `null` while the engine
 * holds one month. Present from the second month; whether it is ticked is
 * the caller's (`byDefault: false`, C32 Q5). Its three readings:
 * - numbers moved: how many, and up to six of them;
 * - numbers compare but none moved: « Rien n'a bougé », and up to six of them;
 * - nothing compares: « août et septembre ne se comparent pas encore », and why.
 */
export function buildEvolutionSlide(
  state: EngineState,
  series: Series | undefined,
  motion: Motion,
  diagnosis: AnyDiagnosis,
  strings: Words,
  metrics: ResolvedMetric[],
  ctx: EngineCalcContext,
): BuiltSlide | null {
  const own = series?.motions.find((m) => m.motion === motion);
  if (!series || !own) return null;
  const name = (id: MetricId) => metricOf(metrics, id).name;
  const month = formatMonth(series.previousMonth, ctx.locale);
  const footer: Row = { row: "footer", text: strings.slide.evolutionFooter };
  const notes = [seasonalNote(state, strings)];

  const compared = own.rows.flatMap((row) => {
    const p = evolutionPrinted(row, state, strings, ctx);
    return p ? [{ row, ...p }] : [];
  });
  if (compared.length === 0) {
    const lines: Row[] = own.rows.flatMap((row) => {
      const text = evolutionApartText(row, series, strings, ctx);
      return text ? [{ row: "apart", id: row.metric, label: name(row.metric), text }] : [];
    });
    const title: SlideTitle = { key: "evolutionApart", values: { before: month, now: formatMonth(series.month, ctx.locale) } };
    return { present: true, title, lines: [...lines.slice(0, EVOLUTION_ROWS), footer], notes };
  }

  const moved = compared.filter((c) => !c.stable);
  const shown = (moved.length ? moved : compared).slice(0, EVOLUTION_ROWS);
  const lines: Row[] = shown.map(({ row, before, now, change, stable }) => {
    const template = stable ? strings.slide.evolutionRowStable : row.towardTarget ? strings.slide.evolutionRowToward : strings.slide.evolutionRow;
    return {
      row: "evolution",
      id: row.metric,
      label: name(row.metric),
      tone: stable ? "stable" : "moved",
      before,
      now,
      change: stable ? strings.slide.whatIfStable : change,
      toward: row.towardTarget ? "true" : "",
      text: fillTemplate(template, { before, now, change }),
    };
  });
  const leak = leakClause(own, diagnosis, strings, metrics);
  const n = moved.length;
  const title: SlideTitle =
    n === 0 ? { key: "evolutionStill", values: { month, leak } } : { key: numbered("evolution", point(n), ctx.locale), values: { n: String(n), month, leak } };
  return { present: true, title, lines: [...lines, footer], notes };
}
