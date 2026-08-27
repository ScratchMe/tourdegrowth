import { getDb } from "@/lib/firebase/admin";
import type { Submission } from "./types";

const COLLECTION = "submissions";

export async function saveSubmission(submission: Submission): Promise<void> {
  await getDb().collection(COLLECTION).doc(submission.id).set(submission);
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
  const doc = await getDb().collection(COLLECTION).doc(id).get();
  return doc.exists ? (doc.data() as Submission) : null;
}

/**
 * K-factor inputs (SPEC.md §7): how many submissions were attributed to a
 * given `ref` id (new analyses from that share), and how many distinct
 * sharers exist at all (unique submissions that have themselves been
 * referred-from at least once) — kept as two simple counts rather than a
 * relational aggregation, which is exactly as much as Firestore needs to do
 * here.
 */
export async function countSubmissionsReferredBy(refId: string): Promise<number> {
  const snapshot = await getDb().collection(COLLECTION).where("refId", "==", refId).count().get();
  return snapshot.data().count;
}
