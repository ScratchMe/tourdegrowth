import { shapeOf } from "./catalog-shape";
import type { MetricEntry, MetricId, SharedCount, Snapshot } from "./types";

/**
 * The counts several of the fifteen numbers are computed on — Antoine,
 * 2026-09-25: the sign-ups of the followed cohort were asked for FIVE times
 * (activation, day-30 retention, referred share, K, paid conversion), the
 * month's sign-ups twice. They are one population each, by definition: the
 * catalogue's count labels say « Inscrits en {cohort} » in all five places.
 *
 * Typed once, kept in `Snapshot.base`, and written into every entry that
 * carries it, so each entry stays complete on its own — an exported file, the
 * deck and the validator read the entries, never this module.
 *
 * Pure. Nothing here guesses: a count the person has not typed anywhere is
 * `null`, never a value borrowed from a neighbouring month.
 */
export interface SharedSlot {
  metric: MetricId;
  side: "numerator" | "denominator";
}

export const SHARED_COUNTS: Readonly<Record<SharedCount, readonly SharedSlot[]>> = {
  cohortSignups: [
    { metric: "act.rate", side: "denominator" },
    { metric: "ret.d30", side: "denominator" },
    { metric: "ref.referred-share", side: "denominator" },
    { metric: "ref.k-factor", side: "denominator" },
    { metric: "rev.paid-conversion", side: "denominator" },
  ],
  monthSignups: [
    { metric: "acq.signup-rate", side: "numerator" },
    { metric: "acq.top-channel-share", side: "denominator" },
  ],
};

export const SHARED_COUNT_IDS = Object.keys(SHARED_COUNTS) as SharedCount[];

/** Which shared count sits on this side of this number's counts, if any. */
export function sharedCountAt(metric: MetricId, side: SharedSlot["side"]): SharedCount | null {
  for (const count of SHARED_COUNT_IDS) {
    if (SHARED_COUNTS[count].some((slot) => slot.metric === metric && slot.side === side)) return count;
  }
  return null;
}

function countIn(entry: MetricEntry | undefined, side: SharedSlot["side"]): number | null {
  const value = entry?.value;
  return value?.kind === "ratio" ? value[side] : null;
}

/**
 * The count as the person last typed it: the base when it holds one, else
 * the first entry of the catalogue that carries it (a file from before the
 * base existed). `from` names where it was read.
 */
export function knownSharedCount(snapshot: Snapshot, count: SharedCount): { value: number; from: MetricId | "base" } | null {
  const inBase = snapshot.base?.[count];
  if (inBase !== undefined) return { value: inBase, from: "base" };
  for (const slot of SHARED_COUNTS[count]) {
    const n = countIn(snapshot.metrics[slot.metric], slot.side);
    if (n !== null) return { value: n, from: slot.metric };
  }
  return null;
}

/**
 * The snapshot with `count` set to `value` — in the base and in every entry
 * that carries it as counts. An entry the new count would make impossible (a
 * bounded number whose part would exceed its whole) is left as it was: it
 * then reads a different base, and the sheet says so, rather than a number
 * silently turning invalid. `except` is the entry being saved, already
 * written by the caller.
 */
export function withSharedCount(snapshot: Snapshot, count: SharedCount, value: number, except?: MetricId): Snapshot {
  const metrics = { ...snapshot.metrics };
  for (const slot of SHARED_COUNTS[count]) {
    if (slot.metric === except) continue;
    const entry = metrics[slot.metric];
    const current = entry?.value;
    if (!entry || current?.kind !== "ratio" || current[slot.side] === value) continue;
    const next = { ...current, [slot.side]: value };
    if (shapeOf(slot.metric).bounded && next.numerator > next.denominator) continue;
    metrics[slot.metric] = { ...entry, value: next };
  }
  return { ...snapshot, metrics, base: { ...snapshot.base, [count]: value } };
}

/**
 * After an entry is saved: every shared count it carries becomes the base's
 * and is written into the other entries. A no-op for a number that carries
 * none, or that was saved without counts (a rate, an estimate).
 */
export function propagateFrom(snapshot: Snapshot, metric: MetricId): Snapshot {
  let next = snapshot;
  for (const side of ["numerator", "denominator"] as const) {
    const count = sharedCountAt(metric, side);
    const n = countIn(snapshot.metrics[metric], side);
    if (count && n !== null) next = withSharedCount(next, count, n, metric);
  }
  return next;
}

/** The entries whose count differs from the base's — shown « on another base » rather than hidden. */
export function offBase(snapshot: Snapshot, count: SharedCount): MetricId[] {
  const base = snapshot.base?.[count];
  if (base === undefined) return [];
  return SHARED_COUNTS[count]
    .filter((slot) => {
      const n = countIn(snapshot.metrics[slot.metric], slot.side);
      return n !== null && n !== base;
    })
    .map((slot) => slot.metric);
}
