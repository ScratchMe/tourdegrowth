import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase/admin";
import type { DeepDiveResult, Submission } from "./types";

const COLLECTION = "submissions";

export async function saveSubmission(submission: Submission): Promise<void> {
  await getDb().collection(COLLECTION).doc(submission.id).set(submission);
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
  const doc = await getDb().collection(COLLECTION).doc(id).get();
  return doc.exists ? (doc.data() as Submission) : null;
}

export type SaveDeepDiveOutcome = "saved" | "already-present";

/**
 * Persists the Deep dive result onto an already-existing submission
 * (SPEC-ADDENDUM-01.md §2.7) — the score/verdicts/answers written by
 * `saveSubmission` are never rewritten here, only the `deepDive` field.
 *
 * Check-and-set inside a transaction — REVIEW-02.md R2-21. The route tests
 * "already enriched?" before generating, but two requests can both pass that
 * test before either writes (a reload during the ~70 s generation and a
 * resubmit, or the Retry button): both generated, and the last write won
 * silently. The generation can't be un-spent from here, but the write can
 * refuse to overwrite: the loser learns the winner's result is already
 * there and the route sends it to the same page.
 */
export async function saveDeepDive(id: string, deepDive: DeepDiveResult): Promise<SaveDeepDiveOutcome> {
  const db = getDb();
  const ref = db.collection(COLLECTION).doc(id);
  return db.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    if ((snapshot.data() as Partial<Submission> | undefined)?.deepDive) return "already-present";
    tx.update(ref, { deepDive });
    return "saved";
  });
}

/**
 * Whether a submission id names a real submission — used to drop bogus
 * `?ref=` values before they ever reach Firestore and inflate the K-factor
 * (REVIEW.md R-03, see `referral.ts`).
 *
 * One document read per submission created, and only when the ref already
 * looks like a real id. At this volume that is cheaper than the alternative
 * (a K-factor nobody can trust); if reads ever matter, R-14's caching work
 * is where this would be revisited.
 */
export async function submissionExists(id: string): Promise<boolean> {
  const doc = await getDb().collection(COLLECTION).doc(id).get();
  return doc.exists;
}

/**
 * The running totals behind the "average of every Tour" benchmark on the
 * result page — REVIEW.md R-20.
 *
 * A single aggregate document, not a scan. `growth-stats.ts` computes the
 * same average by reading the whole collection, which is fine for a
 * dashboard one person opens; doing it on every view of a shared result
 * would undo exactly the read reduction R-14 just bought.
 *
 * Two consequences worth knowing rather than discovering:
 *
 *  - The counter starts at zero the day it ships, so it covers submissions
 *    created from then on — not the collection's whole history. That is why
 *    the benchmark stays hidden below a minimum sample (see `benchmark.ts`)
 *    instead of displaying an average of three people, and why this number
 *    can legitimately differ from the dashboard's.
 *  - `FieldValue.increment` is applied server-side by Firestore, so two
 *    submissions landing at the same moment both count. A read-modify-write
 *    here would silently lose one.
 */
const STATS_COLLECTION = "stats";
const GLOBAL_STATS_DOC = "global";

export interface GlobalStats {
  /** Submissions counted since this document started existing. */
  count: number;
  /** Sum of their `total` scores — the average is derived, never stored, so the two can't drift apart. */
  scoreSum: number;
}

export async function recordSubmissionInGlobalStats(total: number): Promise<void> {
  await getDb()
    .collection(STATS_COLLECTION)
    .doc(GLOBAL_STATS_DOC)
    .set({ count: FieldValue.increment(1), scoreSum: FieldValue.increment(total) }, { merge: true });
}

export async function getGlobalStats(): Promise<GlobalStats | null> {
  const doc = await getDb().collection(STATS_COLLECTION).doc(GLOBAL_STATS_DOC).get();
  const data = doc.data();
  if (!data || typeof data.count !== "number" || typeof data.scoreSum !== "number") return null;
  return { count: data.count, scoreSum: data.scoreSum };
}
