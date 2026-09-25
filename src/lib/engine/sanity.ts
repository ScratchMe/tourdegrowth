import { CHURN_HIGH_PERCENT, MARGIN_ODD, METRIC_SHAPES, PELOTON_METRICS, RECONCILE_BAND, shapeOf } from "./catalog-shape";
import type { MetricShape } from "./catalog-shape";
import { periodOf } from "./cohort";
import { formatCountInterval, formatMonth, formatNumber, type UnitWords } from "./format";
import { mapBounds } from "./interval";
import type { EngineCalcContext, EngineState, Interval, MetricEntry, MetricId, MetricValue, SanityCheck } from "./types";
import { countsOf, currentSnapshot, entryOf, knownIn } from "./values";

/**
 * sanity.ts — "to check", never blocking (engine spec §6.9, D11).
 *
 * Only the impossible blocks: more numerator than denominator on a share
 * (`num-gt-den`) refuses the save. Everything else is shown on the board and
 * at the top of the slide screen — blocking the deck at 8 pm the night before
 * a leadership meeting is how a tool gets abandoned, and honesty is served by
 * saying it, not by refusing.
 *
 * Each check fires only when the WHOLE interval is past its threshold: an
 * estimate of 20-40 % churn is not "definitely an annual figure", and a
 * check that cries wolf on every wide estimate teaches people to ignore it.
 */

function readings(entry: MetricEntry): MetricValue[] {
  if (entry.status === "measured" && entry.value) return [entry.value];
  if (entry.status === "conflicting" && entry.conflict) return [entry.conflict.a.value, entry.conflict.b.value];
  return [];
}

/**
 * The one check that blocks a save: a share whose numerator exceeds its
 * denominator. It carries the two counts, formatted: its message quotes them
 * (« Le premier compte (900) dépasse le second (800) »), and an imported file
 * can put this check on the slide screen, where no input label sits beside it.
 */
export function blockingCheck(entry: MetricEntry, shape: MetricShape, locale: EngineCalcContext["locale"]): SanityCheck | null {
  if (!shape.bounded) return null;
  const broken = readings(entry).find((v) => v.kind === "ratio" && v.numerator > v.denominator);
  if (!broken || broken.kind !== "ratio") return null;
  return {
    id: "num-gt-den",
    blocking: true,
    metrics: [shape.id],
    values: { num: formatNumber(broken.numerator, locale), den: formatNumber(broken.denominator, locale) },
  };
}

function knownValue(state: EngineState, id: MetricId, ctx: EngineCalcContext): Interval | null {
  const k = knownIn(state, id, ctx);
  return k.kind === "known" ? k.value : null;
}

/**
 * The predicted new payers of the reference month: its sign-ups × the paid
 * conversion — against the billing's own count (the CAC's denominator).
 * Outside [0.67, 1.5] ENTIRELY, at least one definition isn't about the same
 * population. Returned for the finding that says the same thing.
 */
export function reconcile(state: EngineState, ctx: EngineCalcContext): { predicted: Interval; billed: number; ratio: Interval } | null {
  const snapshot = currentSnapshot(state);
  const signups = countsOf(entryOf(snapshot, "acq.signup-rate"))?.numerator;
  const billed = countsOf(entryOf(snapshot, "acq.cac"))?.denominator;
  const paid = knownValue(state, "rev.paid-conversion", ctx);
  if (signups === undefined || !billed || !paid) return null;
  const predicted = mapBounds(paid, (p) => (signups * p) / 100);
  return { predicted, billed, ratio: { lo: predicted.lo / billed, hi: predicted.hi / billed } };
}

export function sanityChecks(state: EngineState, ctx: EngineCalcContext, words: UnitWords): SanityCheck[] {
  const snapshot = currentSnapshot(state);
  const checks: SanityCheck[] = [];
  const add = (id: SanityCheck["id"], metrics: MetricId[], values: Record<string, string> = {}, count?: Interval) =>
    checks.push({ id, blocking: false, metrics, values, ...(count ? { count } : {}) });

  for (const shape of METRIC_SHAPES) {
    const entry = entryOf(snapshot, shape.id);
    const blocking = entry ? blockingCheck(entry, shape, ctx.locale) : null;
    if (blocking) checks.push(blocking); // an imported file can carry what the sheet would have refused
  }

  const activated = knownValue(state, "act.rate", ctx);
  const d30 = knownValue(state, "ret.d30", ctx);
  const paid = knownValue(state, "rev.paid-conversion", ctx);
  // The three columns count the same 100 sign-ups, so each one can only shrink from the last.
  if (activated && d30 && d30.lo > activated.hi) add("retained-gt-activated", ["ret.d30", "act.rate"]);
  if (d30 && paid && paid.lo > d30.hi) add("paid-gt-retained", ["rev.paid-conversion", "ret.d30"]);

  const churn = knownValue(state, "ret.logo-churn", ctx);
  if (churn && churn.lo > CHURN_HIGH_PERCENT) add("churn-high", ["ret.logo-churn"]);

  const margin = knownValue(state, "rev.gross-margin", ctx);
  if (margin && (margin.lo > MARGIN_ODD.hi || margin.hi < MARGIN_ODD.lo)) add("margin-odd", ["rev.gross-margin"]);

  // A mean time-to-value flatters itself as the stragglers give up: the statistic is on the value, or declared as the variant of an estimate.
  const ttv = entryOf(snapshot, "act.ttv");
  if (ttv && knownValue(state, "act.ttv", ctx) && (ttv.variant === "mean" || readings(ttv).some((v) => v.kind === "duration" && v.statistic === "mean"))) {
    add("ttv-mean", ["act.ttv"]);
  }

  const periods = PELOTON_METRICS.filter((id) => knownValue(state, id, ctx)).map((id) => periodOf(shapeOf(id), entryOf(snapshot, id), snapshot));
  if (new Set(periods).size > 1) add("cohort-mismatch", [...PELOTON_METRICS]);

  const r = reconcile(state, ctx);
  if (r && (r.ratio.hi < RECONCILE_BAND.lo || r.ratio.lo > RECONCILE_BAND.hi)) {
    // « ~1 nouveau payant », « ~12 nouveaux payants »: the noun follows the predicted count as printed (rounded).
    add(
      "reconcile-gap",
      ["acq.signup-rate", "rev.paid-conversion", "acq.cac"],
      {
        p: formatCountInterval(r.predicted, ctx, words),
        n: formatNumber(r.billed, ctx.locale),
        month: formatMonth(snapshot.referenceMonth, ctx.locale),
      },
      mapBounds(r.predicted, Math.round),
    );
  }
  return checks;
}
