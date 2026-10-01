import { evolutionApartText, evolutionPrinted } from "@/lib/engine/deck-series";
import { formatMonth, joinList } from "@/lib/engine/format";
import { subjectOf } from "@/lib/engine/phrases";
import type { MetricId, Motion } from "@/lib/engine/types";
import { fill } from "./text";
import type { EngineView } from "./view";

/**
 * The monthly series in the board's words (engine spec §19.2.5, A14 T2).
 * The numbers come from `derived.series` (lib/engine/series.ts) and are
 * printed by the SAME functions as the slide « Ce qui a bougé »
 * (`deck-series.ts`): a change reads one way on the screen and on the slide.
 * Only the sentence around it is the board's own, in « tu ».
 */

/**
 * A number's change since the month before, for its row: « +3 points depuis
 * juillet 2026 », « stable depuis juillet 2026 », or why the two months don't
 * compare (« estimé en juillet 2026 », « définition changée »). `null` with one
 * month, for a number that is no number, and when the reason is about this
 * month — the row's status tag already says it.
 */
export function rowDelta(id: MetricId, view: EngineView): string | null {
  const { derived, state, strings, ctx } = view;
  const series = derived.series;
  if (!series) return null;
  const row = series.motions.flatMap((m) => m.rows).find((r) => r.metric === id);
  if (!row) return null;
  const month = formatMonth(series.previousMonth, ctx.locale);
  const printed = evolutionPrinted(row, state, strings, ctx);
  if (printed) {
    if (printed.stable) return fill(strings.series.stable, { month });
    return fill(row.towardTarget ? strings.series.deltaToward : strings.series.delta, { change: printed.change, month });
  }
  // A reason about THIS month (« estimé en août ») would repeat the status tag beside it: only the month before's, or a changed definition.
  if (!row.comparison.comparable && "month" in row.comparison && row.comparison.month === "now") return null;
  return evolutionApartText(row, series, strings, ctx);
}

/** « En juillet 2026, la fuite était l'activation. » — only when this month names another leak (§19.2.5). */
export function previousLeakLine(view: EngineView, motion: Motion): string | null {
  const { derived, strings, metrics, ctx } = view;
  const own = derived.series?.motions.find((m) => m.motion === motion);
  if (!derived.series || !own || !own.leakChanged) return null;
  const month = formatMonth(derived.series.previousMonth, ctx.locale);
  const stages = own.previousLeak.map((id) => subjectOf(id, strings, metrics));
  return stages.length === 1
    ? fill(strings.series.previousLeak, { month, stage: stages[0]! })
    : fill(strings.series.previousLeakShared, { month, list: joinList(stages, strings.grammar) });
}
