import { ALL_METRIC_SHAPES, shapeOf } from "./catalog-shape";
import { windowsOf } from "./series";
import { knownSharedCount, SHARED_COUNT_IDS } from "./shared-counts";
import { MAX_MONTHS, type EngineState, type MetricEntry, type MetricId, type SharedCount, type Snapshot, type YearMonth } from "./types";

/**
 * merge.ts — « Fusionner dans {nom} » at the import (engine spec §19.7, C32
 * Q13, A14 T5).
 *
 * Two copies of ONE engine, kept on two devices, come back together month by
 * month (`referenceMonth`). Pure: the import screen shows `changes` before
 * anything is written (« Jamais rien de silencieux »), then writes `state`.
 *
 * Refused, with its reason, when the two engines would not measure the same
 * thing: another type, other motions, another currency, or other windows for
 * a ticked motion — a window is part of a number's definition. Also refused
 * when the months together exceed `MAX_MONTHS`: a merge never drops a month.
 *
 * The rules, per month:
 * - a month on one side only is added, as it is;
 * - a month on both sides, number by number: an empty side (absent, « à
 *   faire », or only « demandé ») takes the other; two equal readings stay;
 *   two different ones, the more recent `updatedAt` wins, the device's on a
 *   tie;
 * - the file's targets only fill the targets the device has not set; a
 *   shared count and the open pipeline, likewise, only fill what is absent —
 *   neither carries a date to say which is newer — and a shared count only
 *   when no number of the merged month carries it already;
 * - a month that the merge puts before another is closed on the day the
 *   following month was started (`closedAt` is « the day the next month
 *   started », §19.2.3), with the setup's windows — the two engines share them.
 *
 * Everything else is the device's: the setup, the deck, « Et si », the Tour
 * link, the id. The file adds numbers; it never re-sets the engine.
 */

export type MergeRefusal = "type" | "motions" | "currency" | "windows" | "months";

export type MergeChange =
  /** A month only the file held, added with its numbers. */
  | { kind: "month-added"; month: YearMonth; numbers: number }
  /** A number the device had not filled, taken from the file — a value, or only a request. */
  | { kind: "filled"; month: YearMonth; id: MetricId; after: MetricEntry }
  /** A number both held, different: the file's was more recent. */
  | { kind: "replaced"; month: YearMonth; id: MetricId; before: MetricEntry; after: MetricEntry }
  /** A target the device had not set, taken from the file. */
  | { kind: "target-filled"; month: YearMonth; id: MetricId; after: number }
  /** A shared count the device had not typed, taken from the file. */
  | { kind: "count-filled"; month: YearMonth; count: SharedCount; after: number }
  /** The open pipeline the device had not typed, taken from the file. */
  | { kind: "pipeline-filled"; month: YearMonth; after: number }
  /** A month the merge puts before a later one: closed on the day that one started. */
  | { kind: "closed"; month: YearMonth; closedAt: string };

export type MergeResult = { kind: "refused"; reason: MergeRefusal } | { kind: "ok"; state: EngineState; changes: MergeChange[] };

/** Why the two engines cannot be merged, or null when they can. What the import screen greys the choice with. */
export function mergeRefusal(into: EngineState, from: EngineState): MergeRefusal | null {
  const a = into.setup;
  const b = from.setup;
  if (a.type !== b.type) return "type";
  if (a.motions.plg !== b.motions.plg || a.motions.slg !== b.motions.slg) return "motions";
  if (a.currency !== b.currency) return "currency";
  // Only the windows a ticked motion reads: an unticked motion's are kept, never used (§18.1.2).
  if (a.motions.plg && (a.activationWindowDays !== b.activationWindowDays || a.paidWindowDays !== b.paidWindowDays)) return "windows";
  if (a.motions.slg && (a.qualificationWindowDays !== b.qualificationWindowDays || a.goLiveWindowDays !== b.goLiveWindowDays)) return "windows";
  const months = new Set([...into.snapshots, ...from.snapshots].map((s) => s.referenceMonth));
  if (months.size > MAX_MONTHS) return "months";
  return null;
}

/** The file's months merged into the device's engine, with every change it makes, or the reason it cannot be. */
export function mergeEngines(into: EngineState, from: EngineState): MergeResult {
  const refusal = mergeRefusal(into, from);
  if (refusal) return { kind: "refused", reason: refusal };

  const changes: MergeChange[] = [];
  const theirs = new Map(from.snapshots.map((s) => [s.referenceMonth, s]));
  const ours = new Map(into.snapshots.map((s) => [s.referenceMonth, s]));
  const months = [...new Set([...ours.keys(), ...theirs.keys()])].sort();

  const merged: Snapshot[] = months.map((month) => {
    const mine = ours.get(month);
    const other = theirs.get(month);
    if (mine && other) return mergeMonth(mine, other, changes);
    if (mine) return mine;
    const added = structuredClone(other!);
    changes.push({ kind: "month-added", month, numbers: Object.values(added.metrics).filter(hasReading).length });
    return added;
  });

  // Every month but the last is closed (§19.1.6). One the merge put before a later one closes on the day that one started.
  const windows = windowsOf(into.setup);
  const snapshots = merged.map((snapshot, i) => {
    const next = merged[i + 1];
    if (!next) {
      const { closedAt: _closedAt, windows: _windows, ...open } = snapshot;
      return open;
    }
    if (snapshot.closedAt !== undefined) return snapshot;
    changes.push({ kind: "closed", month: snapshot.referenceMonth, closedAt: next.createdAt });
    return { ...snapshot, closedAt: next.createdAt, windows: snapshot.windows ?? windows };
  });

  return { kind: "ok", state: { ...into, snapshots }, changes };
}

/**
 * What a month both sides hold may take from the file: the catalogue's
 * numbers and the shared counts this version knows. A key it does not know —
 * a file from a later version, or one written by hand — is left out, never
 * written beside the device's numbers nor read by a screen that would not
 * know how to name it (the security review of A14 T5).
 */
const KNOWN_METRICS: ReadonlySet<string> = new Set(ALL_METRIC_SHAPES.map((s) => s.id));
const KNOWN_COUNTS: ReadonlySet<string> = new Set(SHARED_COUNT_IDS);

function mergeMonth(mine: Snapshot, other: Snapshot, changes: MergeChange[]): Snapshot {
  const month = mine.referenceMonth;
  const metrics = { ...mine.metrics };
  const ids = new Set(Object.keys(other.metrics).filter((id) => KNOWN_METRICS.has(id)) as MetricId[]);
  for (const id of [...ids].sort()) {
    const a = mine.metrics[id];
    const b = theirsIn(other, mine, id);
    if (!b) continue;
    if (!hasReading(a)) {
      // The device's side is empty: the file's entry, even a request only, when it says more or later.
      if (!a || hasReading(b) || newer(b, a)) {
        metrics[id] = b;
        changes.push({ kind: "filled", month, id, after: b });
      }
      continue;
    }
    if (!hasReading(b) || sameReading(a, b)) continue;
    if (newer(b, a)) {
      metrics[id] = b;
      changes.push({ kind: "replaced", month, id, before: a, after: b });
    }
  }

  const targets = { ...mine.targets };
  for (const [id, value] of Object.entries(other.targets) as [MetricId, number][]) {
    if (!KNOWN_METRICS.has(id) || typeof value !== "number" || !Number.isFinite(value) || targets[id] !== undefined) continue;
    targets[id] = value;
    changes.push({ kind: "target-filled", month, id, after: value });
  }

  // A shared count follows the numbers that carry it (shared-counts.ts): the file's fills it only when no number
  // of the merged month says it — else the count and its numbers would disagree.
  let out: Snapshot = { ...mine, metrics, targets };
  for (const [count, value] of Object.entries(other.base ?? {}) as [SharedCount, number][]) {
    if (!KNOWN_COUNTS.has(count) || typeof value !== "number" || !Number.isFinite(value) || knownSharedCount(out, count) !== null) continue;
    out = { ...out, base: { ...out.base, [count]: value } };
    changes.push({ kind: "count-filled", month, count, after: value });
  }

  if (out.pipelineOpen === undefined && typeof other.pipelineOpen === "number" && Number.isFinite(other.pipelineOpen)) {
    out.pipelineOpen = other.pipelineOpen;
    changes.push({ kind: "pipeline-filled", month, after: other.pipelineOpen });
  }
  // A month closed on one side only keeps the day it was closed: the other side had not started the next one yet.
  if (out.closedAt === undefined && other.closedAt !== undefined) {
    out.closedAt = other.closedAt;
    if (other.windows) out.windows = other.windows;
  }
  return out;
}

/**
 * The file's entry for a month both sides hold, read on the device's month:
 * a number of the followed cohort, when the two months follow different
 * cohorts, keeps its own cohort on the entry — never re-read on the device's.
 */
function theirsIn(other: Snapshot, mine: Snapshot, id: MetricId): MetricEntry | undefined {
  const entry = other.metrics[id];
  if (!entry || other.cohortMonth === mine.cohortMonth || entry.cohortMonth !== undefined || shapeOf(id).flow !== "cohort") return entry;
  return { ...entry, cohortMonth: other.cohortMonth };
}

/**
 * An entry that says something about the number: a value, an estimate, a
 * conflict, a cause, a reason. « À faire » and « demandé » are only on the
 * way to one — the empty side of §19.7.
 */
export function hasReading(entry: MetricEntry | undefined): entry is MetricEntry {
  return entry !== undefined && entry.status !== "todo" && entry.status !== "requested";
}

const newer = (a: MetricEntry, b: MetricEntry): boolean => Date.parse(a.updatedAt) > Date.parse(b.updatedAt);

/**
 * The same reading on both sides: what it says, not when or by whom. A note
 * or a source written differently is not a different value; a variant is —
 * it is part of the number's definition.
 */
function sameReading(a: MetricEntry, b: MetricEntry): boolean {
  return stable(readingOf(a)) === stable(readingOf(b));
}

function readingOf(e: MetricEntry): unknown {
  return [e.status, e.value, e.estimate, e.conflict, e.missing?.cause, e.naReason, e.variant, e.cohortMonth, e.label, e.evidence];
}

function stable(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) =>
    typeof v === "object" && v !== null && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([x], [y]) => (x < y ? -1 : x > y ? 1 : 0)))
      : v,
  );
}
