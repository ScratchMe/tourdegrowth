import { SMALL_COHORT_SIZE, shapeOf } from "./catalog-shape";
import { periodRangeOf } from "./cohort";
import { mapBounds, point } from "./interval";
import { chainOf } from "./peloton";
import type { EngineCalcContext, EngineState, MetricId, RelayColumn, Relays, SlgMetricId, Snapshot } from "./types";
import { countsOf, currentSnapshot, entryOf, knownIn } from "./values";

/**
 * relays.ts — the sales-assisted funnel, in three relays (engine spec
 * §18.5.1).
 *
 * The self-serve peloton counts every column on the SAME 100 sign-ups (D5).
 * Sales-assisted can't: the win rate is read on the quarter's closed
 * opportunities, not on a cohort of leads — following the same people would
 * mean going back a whole sales cycle. So each relay has ITS OWN base of 100,
 * in chronological order (a lead becomes an opportunity, an opportunity is
 * signed, a new customer goes live), and **there is no multiplicative
 * chain**: nothing here, nor in any template, prints « {x} customers per 100
 * leads ». An unknown relay is `null`, drawn dashed: never 0.
 */

/** The three relays, in reading order — chronological, not AARRR (§18.4.1). */
export const RELAY_METRICS = ["slg.acq.lead-to-opp", "slg.rev.win-rate", "slg.act.go-live"] as const satisfies readonly SlgMetricId[];

const BASE: Record<RelayColumn["metric"], RelayColumn["base"]> = {
  "slg.acq.lead-to-opp": "leads",
  "slg.rev.win-rate": "closed-opps",
  "slg.act.go-live": "new-customers",
};

/**
 * The sales-assisted numbers whose counts are counts of THINGS — leads,
 * opportunities, customers, contracts — where one more or less moves the rate
 * by 100 ÷ d points. The margin is bounded too, but its counts are amounts.
 * The link is left out: it makes no finding (§18.5.8).
 */
export const SLG_COUNTED: readonly SlgMetricId[] = [
  "slg.acq.lead-to-opp",
  "slg.act.go-live",
  "slg.ret.renewal",
  "slg.ref.referred-share",
  "slg.ref.referenceable",
  "slg.rev.win-rate",
];

/**
 * « Small samples », sales-assisted (§18.5.1): a counted number on fewer
 * than SMALL_COHORT_SIZE loses its decimals (§6.2), and one more or less
 * moves it by `points` = 100 ÷ d. null when it was not entered as counts, or
 * on 100 or more.
 */
export function smallSampleOf(snapshot: Snapshot, id: MetricId): { denominator: number; points: number } | null {
  if (!(SLG_COUNTED as readonly MetricId[]).includes(id)) return null;
  const counts = countsOf(entryOf(snapshot, id));
  if (!counts || !(counts.denominator > 0) || counts.denominator >= SMALL_COHORT_SIZE) return null;
  return { denominator: counts.denominator, points: 100 / counts.denominator };
}

/** Whether a sales-assisted rate prints without decimals (§18.5.1, the §6.2 rule on its own base). */
export function slgNoDecimals(snapshot: Snapshot, id: MetricId): boolean {
  return smallSampleOf(snapshot, id) !== null;
}

/** The counted ★ with the smallest base: the board says its « small samples » sentence (§18.5.1). */
export function smallestSample(snapshot: Snapshot): { metric: SlgMetricId; denominator: number; points: number } | null {
  let smallest: { metric: SlgMetricId; denominator: number; points: number } | null = null;
  for (const metric of SLG_COUNTED) {
    if (!shapeOf(metric).primary) continue;
    const sample = smallSampleOf(snapshot, metric);
    if (sample && (!smallest || sample.denominator < smallest.denominator)) smallest = { metric, ...sample };
  }
  return smallest;
}

export function buildRelays(state: EngineState, ctx: EngineCalcContext): Relays {
  const snapshot = currentSnapshot(state);

  const columns: RelayColumn[] = RELAY_METRICS.map((metric) => {
    const known = knownIn(state, metric, ctx);
    const entry = entryOf(snapshot, metric);
    const sampleSize = countsOf(entry)?.denominator ?? null;
    if (known.kind === "unknown") return { metric, base: BASE[metric], perHundred: null, confidence: "unknown", source: null, period: null, sampleSize };
    return {
      metric,
      base: BASE[metric],
      perHundred: mapBounds(known.value, Math.round),
      confidence: known.confidence,
      // A source is only a source for a single measured reading; an estimate or a conflict has none to cite.
      source: entry?.status === "measured" ? (entry.source ?? null) : null,
      period: periodRangeOf(shapeOf(metric), entry, snapshot, state.setup, ctx.today),
      sampleSize,
    };
  });

  const lead = entryOf(snapshot, "slg.acq.lead-to-opp");
  const leads = countsOf(lead)?.denominator;
  return {
    leadNoun: lead?.variant === "mql" ? "mql" : "leads",
    // The cohort covers three months: the upstream line is a month's worth.
    leadsPerMonth: leads !== undefined && leads > 0 ? point(leads / 3) : null,
    columns,
    chain: chainOf(columns.map((c) => c.perHundred !== null)),
  };
}
