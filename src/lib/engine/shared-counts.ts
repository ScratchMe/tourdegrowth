import { shapeOf } from "./catalog-shape";
import type { MetricEntry, MetricId, SharedCount, Snapshot } from "./types";

/**
 * The counts several of the engine's numbers are computed on — Antoine,
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
    // §21: an app's installs of the month are its cost per install's base.
    { metric: "app.acq.cpi", side: "denominator" },
  ],
  // Antoine, 2026-09-26: « dans marge brute, pourquoi on ne reprend pas le MRR
  // donné au chiffre précédent ? » — the gross margin is read on the month's
  // recurring revenue, the same MRR ARPA divides.
  mrrEnd: [
    { metric: "rev.arpa", side: "numerator" },
    { metric: "rev.gross-margin", side: "denominator" },
  ],
  mrrStart: [
    { metric: "rev.expansion", side: "denominator" },
    { metric: "rev.contraction", side: "denominator" },
  ],
  // Sales-assisted (engine spec §18.2, S6), all three over the same three months
  // (C25 Q2). The opportunities created are the referred share's base and the
  // link's; the new-customer deals won are the win rate's numerator and the
  // count the ACV and the CAC divide by; the customers at the flows' month end
  // are the ARPA's base and the reference customers'.
  slgOppsCreated: [
    { metric: "slg.ref.referred-share", side: "denominator" },
    { metric: "link.pql-handoff", side: "denominator" },
  ],
  slgDealsWon: [
    { metric: "slg.rev.win-rate", side: "numerator" },
    { metric: "slg.rev.acv", side: "denominator" },
    { metric: "slg.acq.cac", side: "denominator" },
  ],
  slgCustomers: [
    { metric: "slg.rev.arpa", side: "denominator" },
    { metric: "slg.ref.referenceable", side: "denominator" },
  ],
  // §21: the month's actives, the two per-active revenues' base (C92).
  appActives: [
    { metric: "app.rev.purchases-per-active", side: "denominator" },
    { metric: "app.rev.ads-per-active", side: "denominator" },
  ],
};

/** Counts of people, deals or opportunities: whole numbers. The MRRs are amounts and may carry cents. */
export const WHOLE_SHARED_COUNTS: readonly SharedCount[] = ["cohortSignups", "monthSignups", "slgOppsCreated", "slgDealsWon", "slgCustomers", "appActives"];

export const SHARED_COUNT_IDS = Object.keys(SHARED_COUNTS) as SharedCount[];

/** Which shared count sits on this side of this number's counts, if any. */
export function sharedCountAt(metric: MetricId, side: SharedSlot["side"]): SharedCount | null {
  for (const count of SHARED_COUNT_IDS) {
    if (SHARED_COUNTS[count].some((slot) => slot.metric === metric && slot.side === side)) return count;
  }
  return null;
}

/**
 * The other numbers sharing `id`'s count on `side`, among the ones the view can name (§21.2.4): the places of its
 * group, `id` left out, kept when `named` has them, in `SHARED_COUNTS`' order. Empty for a side with no group. A
 * SaaS view names every place of its groups (the link included) but the app's: `monthSignups` carries
 * `app.acq.cpi`, which its props do not.
 */
export function sharedWith(id: MetricId, side: SharedSlot["side"], named: ReadonlySet<MetricId>): MetricId[] {
  const count = sharedCountAt(id, side);
  if (!count) return [];
  return SHARED_COUNTS[count].map((slot) => slot.metric).filter((m) => m !== id && named.has(m));
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

/**
 * The shared counts the Settings offer (A18 T3.d, the return's « Nombres
 * partagés »): the whole counts — people, deals, opportunities — of the
 * numbers the engine shows (`shown`, `shapesOf`: the link in the hybrid),
 * each with the shown numbers that carry it, in the catalogue's order. The
 * two MRRs stay on their numbers' screens: an amount in a currency is typed
 * with the figure it belongs to. A count only one shown number carries is
 * not shared: it is typed on that number's screen, whose own line says
 * nothing of others (sales-assisted alone: the opportunities created, whose
 * second number is the hybrid's link). One exception, an app's actives
 * (`appActives`, §21.6.2): with the purchases alone, or the ads alone, one
 * number carries them, and they are offered all the same, so the estimate of
 * its revenue per active has its actives to stand on (§21.4.1).
 */
export function settingsSharedCounts(shown: readonly MetricId[]): { count: SharedCount; slots: SharedSlot[] }[] {
  return WHOLE_SHARED_COUNTS.flatMap((count) => {
    const slots = SHARED_COUNTS[count].filter((slot) => shown.includes(slot.metric));
    return slots.length > 1 || (count === "appActives" && slots.length === 1) ? [{ count, slots }] : [];
  });
}

/**
 * What the Settings write on « Enregistrer les réglages » (A18 T3.d), in one
 * snapshot: each target typed (`null` takes it away, as on a number's
 * screen), then each shared count changed, into the base and every entry
 * that carries it (`withSharedCount`).
 */
export function withSettingsNumbers(
  snapshot: Snapshot,
  changes: { targets?: Partial<Record<MetricId, number | null>>; base?: Partial<Record<SharedCount, number>> },
): Snapshot {
  const targets = { ...snapshot.targets };
  for (const [id, target] of Object.entries(changes.targets ?? {}) as [MetricId, number | null][]) {
    if (target === null) delete targets[id];
    else targets[id] = target;
  }
  return (Object.entries(changes.base ?? {}) as [SharedCount, number][]).reduce(
    (acc, [count, value]) => withSharedCount(acc, count, value),
    { ...snapshot, targets },
  );
}
