import { LTV_CAP_MONTHS, derivedShapeOf } from "./catalog-shape";
import { div, mapBounds, mul, scale } from "./interval";
import type { Confidence, DerivedId, DerivedValue, EngineCalcContext, EngineState, Interval, Known, MetricId, UnitEconomics } from "./types";
import { currentSnapshot, knownIn } from "./values";

/**
 * unit-economics.ts — what a customer is worth (engine spec §5.7, §6.8).
 *
 * The three computed figures, in intervals, and never 0: an input that
 * isn't known makes the figure "uncomputable — missing: …" with the inputs
 * named. **Never a fallback on revenue when the margin is missing**: the
 * glossary says it plainly — revenue pays nothing back, margin does, and the
 * revenue version is the flattering one (500 ÷ 120 = 4.2 months looks far
 * better than the truth). The CAC's variant always travels with the result,
 * because "media-only CAC" and "fully loaded CAC" are two different numbers
 * that print the same.
 */

type Knowns = Record<MetricId, Known>;

/**
 * The inputs to name in "can't be computed — missing: …". Usually the
 * unknown ones; when every input is known and the figure still can't be
 * computed, it is because a divisor spans 0 (a margin estimated at -5 to
 * 10 %) — that input is named, so the sentence never ends on nothing.
 */
function missingOf(id: DerivedId, knowns: Partial<Knowns>): MetricId[] {
  const inputs = derivedShapeOf(id).inputs;
  const unknown = inputs.filter((input) => knowns[input]?.kind !== "known");
  if (unknown.length > 0) return unknown;
  return inputs.filter((input) => {
    const k = knowns[input];
    return k?.kind === "known" && k.value.lo <= 0 && k.value.hi >= 0;
  });
}

function confidenceOfInputs(id: DerivedId, knowns: Partial<Knowns>): Exclude<Confidence, "unknown"> {
  return derivedShapeOf(id).inputs.every((input) => {
    const k = knowns[input];
    return k?.kind === "known" && k.confidence === "solid";
  })
    ? "solid"
    : "approximate";
}

function known(k: Known | undefined): Interval | null {
  return k?.kind === "known" ? k.value : null;
}

/** Months of margin a customer is counted for: 1 ÷ monthly churn, capped at 36 — "we take the low end" of three to five years. */
export function lifetimeMonths(churnPercent: Interval): Interval {
  const months = (c: number) => (c <= 0 ? LTV_CAP_MONTHS : Math.min(100 / c, LTV_CAP_MONTHS));
  // Higher churn, shorter life: the bounds swap.
  return { lo: months(churnPercent.hi), hi: months(churnPercent.lo) };
}

export function unitEconomics(state: EngineState, ctx: EngineCalcContext): UnitEconomics {
  const ids: MetricId[] = ["acq.cac", "rev.arpa", "rev.gross-margin", "ret.logo-churn"];
  const knowns = Object.fromEntries(ids.map((id) => [id, knownIn(state, id, ctx)])) as Partial<Knowns>;

  const cac = known(knowns["acq.cac"]);
  const arpa = known(knowns["rev.arpa"]);
  const margin = known(knowns["rev.gross-margin"]);
  const churn = known(knowns["ret.logo-churn"]);

  // Gross profit per customer per month: ARPA × margin — never ARPA alone.
  const monthlyMargin = arpa && margin ? mul(arpa, scale(margin, 1 / 100)) : null;

  const result = (id: DerivedId, value: Interval | null): DerivedValue =>
    value
      ? { kind: "known", value, confidence: confidenceOfInputs(id, knowns) }
      : { kind: "uncomputable", missing: missingOf(id, knowns) };

  const ltvValue = monthlyMargin && churn ? mul(monthlyMargin, lifetimeMonths(churn)) : null;
  // A margin that includes 0 has no payback at all: `div` says null, and the figure is uncomputable, not infinite.
  const paybackValue = cac && monthlyMargin ? div(cac, monthlyMargin) : null;
  const ltvCacValue = ltvValue && cac ? div(ltvValue, cac) : null;

  const entry = currentSnapshot(state).metrics["acq.cac"];
  return {
    cacVariant: entry?.variant ?? null,
    ltv: result("rev.ltv", ltvValue),
    payback: result("rev.cac-payback", paybackValue && mapBounds(paybackValue, (v) => Math.max(0, v))),
    ltvCac: result("rev.ltv-cac", ltvCacValue),
  };
}
