import type { MetricShape } from "@/lib/engine/catalog-shape";
import type { EngineStrings } from "@/lib/engine/strings";
import { CAUSE_KEY, STATUS_KEY } from "@/lib/engine/strings";
import type { Currency, EngineCalcContext, Interval, Known } from "@/lib/engine/types";
import { formatInterval, formatMoney, formatNumber } from "./engine-api";
import { fill } from "./text";

/**
 * How a known value reads on the collection screens — every number through
 * the engine's formatter (`format.ts`, via the barrel), never `toFixed` here.
 *
 * Money is formatted per bound with the currency, because `formatInterval`'s
 * contract has no currency to give it; everything else goes through
 * `formatInterval` so the board and the slides cannot print one value two
 * ways. A single approximate value carries the copy's "~" (`units.approx`);
 * a range already says it is uncertain and gets none.
 */
export function displayInterval(
  value: Interval,
  confidence: "solid" | "approximate",
  shape: MetricShape,
  currency: Currency,
  ctx: EngineCalcContext,
  strings: EngineStrings,
): string {
  let body: string;
  if (shape.unit === "money") {
    const lo = formatMoney(value.lo, currency, ctx.locale);
    const hi = formatMoney(value.hi, currency, ctx.locale);
    body = lo === hi ? lo : fill(strings.units.range, { lo, hi });
  } else if (shape.unit === "duration") {
    // valueInterval carries a duration in days (hours are divided by 24).
    const n = formatNumber(Number(value.lo.toPrecision(2)), ctx.locale);
    body = value.lo === 1 ? strings.units.daysOne : fill(strings.units.days, { n });
  } else {
    body = formatInterval(value, shape.unit === "percent" ? "percent" : "ratio", ctx, strings.units);
  }
  const single = value.lo === value.hi;
  return confidence === "approximate" && single ? fill(strings.units.approx, { n: body }) : body;
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
