import type { StoredResult } from "@/lib/quiz/storage";
import { DERIVED_SHAPES } from "./catalog-shape";
import type { ResolvedBridge } from "./strings";
import type { BridgeRow, DerivedId, EngineState, MetricId, MetricStatus, Mirror, MirrorVerdict, TrackingLevel } from "./types";
import { currentSnapshot, statusOf } from "./values";

/**
 * bridge.ts — what the team DECLARED at the Tour against what it could
 * actually PULL (engine spec §6.11, D13).
 *
 * The Tour is read, never copied: the island passes the entries of
 * `tdg.results.v1` in, this module picks the most recent one that carries
 * answers, and the engine state keeps only its id. Eight bridges, and only
 * where the Tour question literally asks whether THIS number is measured —
 * "is your CAC known?" bridges to the CAC, not to anything the CAC implies.
 *
 * Declared comes from the answer's points (20 tracked · 7 approximate ·
 * 0 unknown); found comes from the status (measured · estimated or two
 * numbers · missing). A number still to do, requested or not applicable has
 * NO verdict — it hasn't been looked for, so it can't contradict anything.
 */

const DAY_ORDER = (r: StoredResult) => {
  const t = Date.parse(r.createdAt);
  return Number.isNaN(t) ? -Infinity : t;
};

/** The most recent Tour result that carries its 15 answers — older entries (before R-12) can't be mirrored. */
export function latestTourWithAnswers(results: StoredResult[]): StoredResult | null {
  const withAnswers = results.filter((r) => r.answers && Object.keys(r.answers).length > 0);
  if (withAnswers.length === 0) return null;
  return [...withAnswers].sort((a, b) => DAY_ORDER(b) - DAY_ORDER(a))[0] ?? null;
}

export function declaredLevel(points: number): TrackingLevel {
  if (points >= 20) return "tracked";
  return points > 0 ? "approximate" : "unknown";
}

function foundFromStatus(status: MetricStatus): TrackingLevel | null {
  if (status === "measured") return "tracked";
  if (status === "estimated" || status === "conflicting") return "approximate";
  if (status === "missing") return "unknown";
  return null; // todo, requested, not applicable: nobody has looked yet
}

/**
 * A computed figure is found as well as its WEAKEST input: one missing input
 * and it can't be pulled; one still to do and there is no verdict yet.
 */
function foundDerived(state: EngineState, id: DerivedId): TrackingLevel | null {
  const inputs = DERIVED_SHAPES.find((s) => s.id === id)?.inputs ?? [];
  const levels = inputs.map((input) => foundFromStatus(statusOf(currentSnapshot(state).metrics[input])));
  if (levels.includes("unknown")) return "unknown";
  if (levels.includes(null)) return null;
  return levels.every((l) => l === "tracked") ? "tracked" : "approximate";
}

/** The §6.11 matrix: declared (rows) × found (columns). */
const MATRIX: Record<TrackingLevel, Record<TrackingLevel, MirrorVerdict>> = {
  tracked: { tracked: "coherent", approximate: "blind-spot-light", unknown: "blind-spot" },
  approximate: { tracked: "better", approximate: "coherent", unknown: "blind-spot-light" },
  unknown: { tracked: "better", approximate: "better", unknown: "known-gap" },
};

export function verdictOf(declared: TrackingLevel, found: TrackingLevel | null): MirrorVerdict | null {
  return found === null ? null : MATRIX[declared][found];
}

function isDerived(id: MetricId | DerivedId): id is DerivedId {
  return DERIVED_SHAPES.some((s) => s.id === id);
}

export function buildMirror(state: EngineState, result: StoredResult, bridges: ResolvedBridge[]): Mirror {
  const counts: Record<MirrorVerdict, number> = { coherent: 0, "blind-spot": 0, "blind-spot-light": 0, better: 0, "known-gap": 0 };
  const rows: BridgeRow[] = [];
  for (const bridge of bridges) {
    const index = result.answers?.[bridge.questionId];
    const option = index === undefined ? undefined : bridge.options[index];
    if (!option) continue; // an unanswered question declares nothing
    const declared = declaredLevel(option.points);
    const found = isDerived(bridge.metric)
      ? foundDerived(state, bridge.metric)
      : foundFromStatus(statusOf(currentSnapshot(state).metrics[bridge.metric]));
    const verdict = verdictOf(declared, found);
    if (verdict) counts[verdict] += 1;
    rows.push({ questionId: bridge.questionId, metric: bridge.metric, declaredPoints: option.points, declared, found, verdict });
  }
  return { resultId: result.id, takenAt: result.createdAt, total: result.total ?? null, rows, counts };
}
