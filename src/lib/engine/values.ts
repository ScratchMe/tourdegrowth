import { shapeOf } from "./catalog-shape";
import type { MetricShape } from "./catalog-shape";
import { isImmature, periodOf, windowDaysOf } from "./cohort";
import { interval, point } from "./interval";
import type {
  Confidence,
  EngineCalcContext,
  EngineSetup,
  EngineState,
  Interval,
  Known,
  MetricEntry,
  MetricId,
  MetricStatus,
  MetricValue,
  Snapshot,
} from "./types";

/**
 * values.ts — from what the user entered to a number the engine may use
 * (engine spec §6.4).
 *
 * Confidence is DERIVED, never entered: nobody gets to call their own
 * number "solid". It is solid only when it was measured as counts (or as a
 * duration, a text, a choice), from a tool, on a mature cohort; a rate typed
 * as a shortcut, a figure someone passed on, an estimate, two readings that
 * disagree, or a cohort still filling up are all "approximate". And an
 * unknown stays unknown with its reason — it never becomes 0.
 */

/** v1 holds exactly one snapshot; the array is there for the monthly series (v2), and the latest is the one in use. */
export function currentSnapshot(state: EngineState): Snapshot {
  const snapshot = state.snapshots[state.snapshots.length - 1];
  if (!snapshot) throw new Error("An engine state always holds at least one snapshot (validateEngine refuses an empty one).");
  return snapshot;
}

export function entryOf(snapshot: Snapshot, id: MetricId): MetricEntry | undefined {
  return snapshot.metrics[id];
}

/** Absent means "todo": a number nobody has looked at is in progress, never missing. */
export function statusOf(entry: MetricEntry | undefined): MetricStatus {
  return entry?.status ?? "todo";
}

/** One reading in the metric's display unit: percent for a bounded rate, currency or plain number otherwise, days for a duration. */
export function readingValue(value: MetricValue, shape: MetricShape): number | null {
  switch (value.kind) {
    case "ratio":
      if (!(value.denominator > 0)) return null;
      // A bounded count pair is a share: carried in percent (types.ts header). Money and K are plain quotients.
      return shape.unit === "percent" ? (value.numerator / value.denominator) * 100 : value.numerator / value.denominator;
    case "rate":
      return value.percent;
    case "amount":
      return value.amount;
    case "duration":
      // Estimates of a duration are entered in days (§4.1 "unité d'affichage"): one unit to compare with.
      return value.unit === "hours" ? value.value / 24 : value.value;
    default:
      return null; // text and choice are definitions, not numbers
  }
}

/**
 * The entry as an interval in the display unit, or null when it is not a
 * number (a text, a choice, an unknown status, a malformed count).
 * measured → a point; estimated → [low, high]; conflicting → the span of
 * both readings, which is how two disagreeing numbers honestly read.
 */
export function valueInterval(entry: MetricEntry, shape: MetricShape): Interval | null {
  switch (entry.status) {
    case "measured": {
      const v = entry.value ? readingValue(entry.value, shape) : null;
      return v === null || !Number.isFinite(v) ? null : point(v);
    }
    case "estimated":
      return entry.estimate ? interval(entry.estimate.low, entry.estimate.high) : null;
    case "conflicting": {
      if (!entry.conflict) return null;
      const a = readingValue(entry.conflict.a.value, shape);
      const b = readingValue(entry.conflict.b.value, shape);
      if (a === null || b === null) return null;
      return interval(Math.min(a, b), Math.max(a, b));
    }
    default:
      return null;
  }
}

/** Entry-level confidence (§6.4). The cohort's maturity is added by `knownOf`, which knows the setup. */
export function confidenceOf(entry: MetricEntry): Confidence {
  switch (entry.status) {
    case "measured": {
      const kind = entry.value?.kind;
      if (kind === "text" || kind === "choice") {
        // A definition is not read off a tool — naming the activation event is a decision.
        // How a churn cause is known is the one thing that grades it: a hunch is approximate.
        return entry.evidence === "hunch" ? "approximate" : "solid";
      }
      if (kind === "rate" || kind === "amount") return "approximate"; // the shortcut: no counts behind it
      return entry.source?.kind === "tool" ? "solid" : "approximate";
    }
    case "estimated":
    case "conflicting":
      return "approximate";
    default:
      return "unknown";
  }
}

/**
 * A number the engine may compute with, or the reason it can't.
 *
 * `where` (additive to the P0 contract) brings the setup and snapshot so a
 * cohort number entered on a month more recent than its window's mature
 * cohort drops to "approximate" (§6.3); every caller inside lib/engine
 * passes it. Without it, only the entry is graded.
 */
export function knownOf(
  entry: MetricEntry | undefined,
  shape: MetricShape,
  ctx: EngineCalcContext,
  where?: { setup: EngineSetup; snapshot: Snapshot },
): Known {
  const status = statusOf(entry);
  if (status === "todo" || status === "requested") return { kind: "unknown", why: status };
  if (status === "not-applicable") return { kind: "unknown", why: "not-applicable" };
  if (status === "missing") return { kind: "unknown", why: entry?.missing?.cause ?? "not-tracked" };

  const value = entry ? valueInterval(entry, shape) : null;
  // A known status with no number behind it (a text, a malformed count) is not a known NUMBER.
  if (!entry || value === null) return { kind: "unknown", why: "todo" };

  let confidence = confidenceOf(entry) as Exclude<Confidence, "unknown">;
  if (where && shape.flow === "cohort") {
    const period = periodOf(shape, entry, where.snapshot);
    if (period && isImmature(period, windowDaysOf(shape, where.setup), ctx.today)) confidence = "approximate";
  }
  return { kind: "known", value, confidence };
}

/** `knownOf` for a metric of the state's current snapshot — the form every derived module uses. */
export function knownIn(state: EngineState, id: MetricId, ctx: EngineCalcContext): Known {
  const snapshot = currentSnapshot(state);
  return knownOf(entryOf(snapshot, id), shapeOf(id), ctx, { setup: state.setup, snapshot });
}

/** The counts behind a measured ratio, when the user entered counts — the volumes the money impact needs (D6). */
export function countsOf(entry: MetricEntry | undefined): { numerator: number; denominator: number } | null {
  if (entry?.status !== "measured" || entry.value?.kind !== "ratio") return null;
  return { numerator: entry.value.numerator, denominator: entry.value.denominator };
}
