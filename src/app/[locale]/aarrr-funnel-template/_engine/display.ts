import type { MetricShape } from "@/lib/engine/catalog-shape";
import type { EngineStrings } from "@/lib/engine/strings";
import { CAUSE_KEY, STATUS_KEY } from "@/lib/engine/strings";
import type { Currency, EngineCalcContext, Interval, Known, MetricEntry } from "@/lib/engine/types";
import { confidenceOf, valueInterval } from "@/lib/engine/values";
import { fillTemplate, formatInterval } from "@/lib/engine/format";

/**
 * How a known value reads on the collection screens — every number through
 * the engine's own formatter (`lib/engine/format.ts`), never `toFixed` here,
 * so the board and the slides cannot print one value two ways.
 *
 * A duration is carried in days by `valueInterval` (hours are divided by 24),
 * which is the unit `formatInterval` prints a duration in. A single
 * approximate value carries the copy's "~" (`units.approx`); a range already
 * says it is uncertain and gets none.
 */
export function displayInterval(
  value: Interval,
  confidence: "solid" | "approximate",
  shape: MetricShape,
  currency: Currency,
  ctx: EngineCalcContext,
  strings: EngineStrings,
): string {
  const unit = shape.unit === "money" || shape.unit === "percent" || shape.unit === "duration" ? shape.unit : "ratio";
  const body = formatInterval(value, unit, ctx, strings.units, { currency });
  const single = value.lo === value.hi;
  return confidence === "approximate" && single ? fillTemplate(strings.units.approx, { n: body }) : body;
}

/** Why a number is not known, in the reader's words — the cause the row shows under a "?" (§8.2). */
export function unknownReason(known: Extract<Known, { kind: "unknown" }>, strings: EngineStrings): string {
  switch (known.why) {
    case "todo":
      return strings.board.toFill;
    case "requested":
      return strings.status[STATUS_KEY.requested];
    case "not-applicable":
      return strings.status[STATUS_KEY["not-applicable"]];
    default:
      return strings.cause[CAUSE_KEY[known.why]];
  }
}

/**
 * A stored entry in one short phrase, for a preview that lists what a write
 * would change (A14 T5: the pasted table, the merge): its value through the
 * engine's formatter when it has one, else its status — « Demandé »,
 * « Introuvable » — never an empty cell.
 */
export function entryText(entry: MetricEntry, shape: MetricShape, currency: Currency, ctx: EngineCalcContext, strings: EngineStrings): string {
  const value = valueInterval(entry, shape);
  const confidence = confidenceOf(entry);
  if (value && confidence !== "unknown") return displayInterval(value, confidence, shape, currency, ctx, strings);
  if (entry.value?.kind === "text") return entry.value.text;
  return strings.status[STATUS_KEY[entry.status]];
}
