import type { CandidateId, EngineCalcContext, EngineState, MetricEntry, MetricId } from "./types";
import { currentSnapshot, knownIn } from "./values";

/**
 * « Et si », drawn on the whole funnel (Antoine, 2026-09-25: « de façon plus
 * visuelle sur le gros funnel plutôt qu'étape par étape au milieu de la
 * saisie »): the engine as it would read if ONE stage reached a tested
 * target, everything else equal.
 *
 * Only what the peloton can show moves. Activation and paid conversion are
 * two of its columns; the sign-up rate lives above the 100 and churn after
 * the cohort, so for those two the funnel is unchanged and the gain is read
 * in money (`whatIf`). One rule carried over from the money chain, and
 * printed with it: paying customers are among the activated (`whatIf.
 * assumptionActivation`), so raising activation raises the paid column in
 * the same proportion — never above the activated column.
 *
 * Pure: a new state, never a mutation. Values the person entered as counts
 * stay counts (same denominator), so a projected column keeps the look of a
 * measured one; an estimate stays an estimate, scaled.
 */
export const PROJECTED_ON_FUNNEL: readonly CandidateId[] = ["act.rate", "rev.paid-conversion"];

function scaledEntry(entry: MetricEntry, factor: number, cap: number | null): MetricEntry {
  const clamp = (percent: number) => (cap === null ? percent : Math.min(percent, cap));
  if (entry.status === "estimated" && entry.estimate) {
    return { ...entry, estimate: { ...entry.estimate, low: clamp(entry.estimate.low * factor), high: clamp(entry.estimate.high * factor) } };
  }
  const value = entry.value;
  if (value?.kind === "ratio") {
    const percent = clamp((value.numerator / value.denominator) * 100 * factor);
    return { ...entry, value: { ...value, numerator: Math.round((percent / 100) * value.denominator) } };
  }
  if (value?.kind === "rate") return { ...entry, value: { kind: "rate", percent: clamp(value.percent * factor) } };
  return entry;
}

function atTarget(entry: MetricEntry | undefined, target: number): MetricEntry {
  const base: MetricEntry = entry ?? { status: "measured", updatedAt: new Date(0).toISOString() };
  if (base.status === "measured" && base.value?.kind === "ratio") {
    return { ...base, value: { ...base.value, numerator: Math.round((target / 100) * base.value.denominator) } };
  }
  return { ...base, status: "measured", value: { kind: "rate", percent: target }, estimate: undefined };
}

/**
 * The state if `id` reached `target` (a percent). `null` when the stage has
 * no known value to start from, or does not show on the funnel.
 */
export function projectOnFunnel(state: EngineState, id: CandidateId, target: number, ctx: EngineCalcContext): EngineState | null {
  if (!PROJECTED_ON_FUNNEL.includes(id)) return null;
  const known = knownIn(state, id, ctx);
  if (known.kind !== "known") return null;
  const snapshot = currentSnapshot(state);
  const metrics: Partial<Record<MetricId, MetricEntry>> = { ...snapshot.metrics, [id]: atTarget(snapshot.metrics[id], target) };

  if (id === "act.rate") {
    const mid = (known.value.lo + known.value.hi) / 2;
    const paid = snapshot.metrics["rev.paid-conversion"];
    if (paid && mid > 0) metrics["rev.paid-conversion"] = scaledEntry(paid, target / mid, target);
  }

  return {
    ...state,
    snapshots: [...state.snapshots.slice(0, -1), { ...snapshot, metrics }],
  };
}
