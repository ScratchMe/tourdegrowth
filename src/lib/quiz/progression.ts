import type { StoredResult } from "./storage";

/**
 * Progression between two Tours — REVIEW-02.md R2-27.
 *
 * `SPEC.md` §5 lists a progression history as a fast-follow, and since R-01
 * and R-20 the data has been sitting on the device already: `tdg.results.v1`
 * keeps up to 20 dated results with their scores. Only the reading was
 * missing — and it is the one reason to come back in three months, which the
 * product otherwise does not have.
 *
 * Pure and separate from the components so the pair-picking is testable: it
 * is the part with the edge cases, not the rendering.
 */
export interface Progression {
  previousTotal: number;
  currentTotal: number;
  /** Signed, current minus previous. Zero is a real answer, not "no data". */
  delta: number;
}

/** Newest first, by the client clock; entries without a usable date keep their stored order. */
function byNewest(results: readonly StoredResult[]): StoredResult[] {
  return [...results].sort((a, b) => {
    const ta = Date.parse(a.createdAt);
    const tb = Date.parse(b.createdAt);
    if (!Number.isFinite(ta) || !Number.isFinite(tb)) return 0;
    return tb - ta;
  });
}

function scored(results: readonly StoredResult[]): (StoredResult & { total: number })[] {
  return byNewest(results).filter((r): r is StoredResult & { total: number } => typeof r.total === "number");
}

/**
 * The two most recent scored Tours, for the landing: "your previous Tour:
 * 58 → 66". `null` when fewer than two carry a score — entries written
 * before R-20 have none, so a device can hold several results and still have
 * nothing to compare.
 */
export function latestProgression(results: readonly StoredResult[]): Progression | null {
  const [current, previous] = scored(results);
  if (!current || !previous) return null;
  return { previousTotal: previous.total, currentTotal: current.total, delta: current.total - previous.total };
}

/**
 * The same reading anchored on a specific result, for its own page.
 *
 * Deliberately not "index 0 vs index 1": someone reopening an older result
 * must be compared with the Tour that preceded THAT one, not with their most
 * recent one — otherwise an old page would claim a progression that happened
 * after it. `null` when the anchor is unknown, unscored, or has nothing
 * before it.
 */
export function progressionFor(results: readonly StoredResult[], id: string): Progression | null {
  const list = scored(results);
  const index = list.findIndex((r) => r.id === id);
  if (index === -1) return null;
  const current = list[index];
  const previous = list[index + 1];
  if (!current || !previous) return null;
  return { previousTotal: previous.total, currentTotal: current.total, delta: current.total - previous.total };
}
