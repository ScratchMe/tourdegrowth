import { PELOTON_METRICS, SMALL_COHORT_SIZE, shapeOf } from "./catalog-shape";
import { periodOf } from "./cohort";
import { div, mapBounds, point } from "./interval";
import type { EngineCalcContext, EngineState, Interval, MetricId, Peloton, PelotonColumn, Snapshot } from "./types";
import { countsOf, currentSnapshot, entryOf, knownIn } from "./values";

/**
 * peloton.ts — the engine read as 100 sign-ups (engine spec §6.5, D5).
 *
 * Every column is counted on the SAME 100 sign-ups: activated, still active
 * at day 30, paying by day n. There is no multiplicative chain from
 * visitors to payers — that chain multiplied four rates measured on four
 * different bases, two of which no tool outputs. No scale to defend,
 * whole people instead of false decimals, and an unknown column is `null`,
 * drawn as a dashed red grid: never 0.
 */

export type PelotonMetric = (typeof PELOTON_METRICS)[number];

/** Whole people out of 100, per bound — what the grid draws. */
function perHundredOf(percent: Interval): Interval {
  return mapBounds(percent, Math.round);
}

/**
 * The shape of the unknowns along [sign-ups, activated, day 30, paid]. The
 * sign-ups column is 100 by definition, so it anchors the left: an unknown
 * column followed by a known one is a GAP (we see both sides of the hole),
 * unknowns only at the end are a TAIL-BREAK (we lose them), all three
 * unknown is EMPTY.
 */
export function chainOf(columnsKnown: readonly boolean[]): Peloton["chain"] {
  if (columnsKnown.every(Boolean)) return "complete";
  if (!columnsKnown.some(Boolean)) return "empty";
  const withSignups = [true, ...columnsKnown];
  const lastKnown = withSignups.lastIndexOf(true);
  return withSignups.slice(0, lastKnown).some((k) => !k) ? "gap" : "tail-break";
}

/** The cohort metrics whose counts give the cohort's size — the sign-ups every column divides by. */
const COHORT_SIZED: readonly MetricId[] = ["act.rate", "ret.d30", "rev.paid-conversion", "ref.referred-share"];

/** Any cohort count under SMALL_COHORT_SIZE: each sign-up then weighs more than a point, so rates lose their decimals (§6.2). */
export function cohortIsSmall(snapshot: Snapshot): boolean {
  return COHORT_SIZED.some((id) => {
    const size = countsOf(entryOf(snapshot, id))?.denominator;
    return size !== undefined && size < SMALL_COHORT_SIZE;
  });
}

export function buildPeloton(state: EngineState, ctx: EngineCalcContext): Peloton {
  const snapshot = currentSnapshot(state);

  const columns: PelotonColumn[] = PELOTON_METRICS.map((metric) => {
    const known = knownIn(state, metric, ctx);
    const entry = entryOf(snapshot, metric);
    if (known.kind === "unknown") return { metric, perHundred: null, confidence: "unknown", source: null, period: null };
    return {
      metric,
      perHundred: perHundredOf(known.value),
      confidence: known.confidence,
      // A source is only a source for a single measured reading; an estimate or a conflict has none to cite.
      source: entry?.status === "measured" ? (entry.source ?? null) : null,
      period: periodOf(shapeOf(metric), entry, snapshot),
    };
  });

  const signup = knownIn(state, "acq.signup-rate", ctx);
  const signupEntry = entryOf(snapshot, "acq.signup-rate");
  const referred = knownIn(state, "ref.referred-share", ctx);

  return {
    // 100 ÷ (sign-up rate / 100): how many visitors a month it takes to get these 100 sign-ups.
    visitorsPerHundred: signup.kind === "known" ? div(point(10_000), signup.value) : null,
    referredPerHundred: referred.kind === "known" ? perHundredOf(referred.value) : null,
    upstreamSource: signupEntry?.status === "measured" ? (signupEntry.source ?? null) : null,
    upstreamPeriod: signup.kind === "known" ? snapshot.referenceMonth : null,
    columns,
    chain: chainOf(columns.map((c) => c.perHundred !== null)),
    smallCohort: cohortIsSmall(snapshot),
  };
}
