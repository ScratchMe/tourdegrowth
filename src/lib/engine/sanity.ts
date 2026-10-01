import {
  CHURN_HIGH_PERCENT,
  MARGIN_ODD,
  PELOTON_METRICS,
  RECONCILE_BAND,
  SLG_ACV_ARPA_BAND,
  SLG_CYCLE_LONG_DAYS,
  motionOfMetric,
  shapeOf,
  shapesOf,
} from "./catalog-shape";
import type { MetricShape } from "./catalog-shape";
import { periodOf } from "./cohort";
import { formatCountInterval, formatInterval, formatMonth, formatNumber, type UnitWords } from "./format";
import { mapBounds } from "./interval";
import type { EngineCalcContext, EngineState, Interval, MetricEntry, MetricId, MetricValue, Motion, SanityCheck } from "./types";
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

/** A duration whose statistic is the mean — on the value, or declared as the variant of an estimate. */
function isMeanDuration(entry: MetricEntry | undefined): boolean {
  return entry !== undefined && (entry.variant === "mean" || readings(entry).some((v) => v.kind === "duration" && v.statistic === "mean"));
}

/**
 * The checks of the ticked motions, each tagged with its motion — in
 * `MOTIONS` order, then the hybrid's one check across both. A motion
 * unticked keeps its numbers (§18.1.2) but raises nothing: the board, the
 * deck and these checks ignore it.
 */
export function sanityChecks(state: EngineState, ctx: EngineCalcContext, words: UnitWords): SanityCheck[] {
  const snapshot = currentSnapshot(state);
  const { motions } = state.setup;
  const checks: SanityCheck[] = [];
  const addFor =
    (motion: Motion | undefined) =>
    (id: SanityCheck["id"], metrics: MetricId[], values: Record<string, string> = {}, count?: Interval) =>
      checks.push({ id, ...(motion ? { motion } : {}), blocking: false, metrics, values, ...(count ? { count } : {}) });

  for (const shape of shapesOf(motions)) {
    const entry = entryOf(snapshot, shape.id);
    const blocking = entry ? blockingCheck(entry, shape, ctx.locale) : null;
    // An imported file can carry what the sheet would have refused.
    if (blocking) checks.push({ ...blocking, motion: motionOfMetric(shape.id) });
  }

  if (motions.plg) selfServeChecks(state, ctx, words, addFor("plg"));
  if (motions.slg) salesAssistedChecks(state, ctx, words, addFor("slg"));
  if (motions.plg && motions.slg) {
    // The two CACs measured on different spend: neither is wrong, but side by side they don't compare.
    const plg = entryOf(snapshot, "acq.cac");
    const slg = entryOf(snapshot, "slg.acq.cac");
    if (knownValue(state, "acq.cac", ctx) && knownValue(state, "slg.acq.cac", ctx) && plg?.variant && slg?.variant && plg.variant !== slg.variant) {
      // Variant ids, not labels: the sentence resolves them (`sentences.ts#sanityText`).
      addFor(undefined)("cac-variants-differ", ["acq.cac", "slg.acq.cac"], { plg: plg.variant, slg: slg.variant });
    }
  }
  return checks;
}

type Add = (id: SanityCheck["id"], metrics: MetricId[], values?: Record<string, string>, count?: Interval) => void;

function selfServeChecks(state: EngineState, ctx: EngineCalcContext, words: UnitWords, add: Add): void {
  const snapshot = currentSnapshot(state);
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
  if (knownValue(state, "act.ttv", ctx) && isMeanDuration(entryOf(snapshot, "act.ttv"))) add("ttv-mean", ["act.ttv"]);

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
}

/** §18.5.7. Triggers to re-read, never references: the thresholds appear on no slide as a norm. */
function salesAssistedChecks(state: EngineState, ctx: EngineCalcContext, words: UnitWords, add: Add): void {
  const snapshot = currentSnapshot(state);

  // Past the three-month window, the quarter's CAC divides its spend by customers of earlier spend.
  const cycle = knownValue(state, "slg.acq.cycle", ctx);
  if (cycle && cycle.lo > SLG_CYCLE_LONG_DAYS) add("slg-cycle-long", ["slg.acq.cycle", "slg.acq.cac"]);

  // A 400-day deal moves a mean by weeks: the same rule as the time-to-value.
  if (cycle && isMeanDuration(entryOf(snapshot, "slg.acq.cycle"))) add("slg-cycle-mean", ["slg.acq.cycle"]);
  if (knownValue(state, "slg.act.time-to-live", ctx) && isMeanDuration(entryOf(snapshot, "slg.act.time-to-live"))) {
    add("slg-ttl-mean", ["slg.act.time-to-live"]);
  }

  // A new contract worth half or twice the book's average, ENTIRELY: a price rise, a new segment, or two revenues.
  const acv = knownValue(state, "slg.rev.acv", ctx);
  const arpa = knownValue(state, "slg.rev.arpa", ctx);
  if (acv && arpa && arpa.lo > 0) {
    const ratio = { lo: acv.lo / 12 / arpa.hi, hi: acv.hi / 12 / arpa.lo };
    if (ratio.hi < SLG_ACV_ARPA_BAND.lo || ratio.lo > SLG_ACV_ARPA_BAND.hi) {
      add("slg-acv-vs-arpa", ["slg.rev.acv", "slg.rev.arpa"], { x: formatInterval(ratio, "ratio", ctx, words) });
    }
  }
}
