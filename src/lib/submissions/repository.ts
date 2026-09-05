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

/**
 * Persists the Deep dive result onto an already-existing submission
 * (SPEC-ADDENDUM-01.md §2.7) — the score/verdicts/answers written by
 * `saveSubmission` are never rewritten here, only the `deepDive` field.
 */
export async function saveDeepDive(id: string, deepDive: DeepDiveResult): Promise<void> {
  await getDb().collection(COLLECTION).doc(id).update({ deepDive });
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
