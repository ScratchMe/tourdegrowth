import { getDb } from "@/lib/firebase/admin";
import { createSubmissionFlow } from "@/lib/submissions/create-submission";
import { saveDeepDive, saveSubmission } from "@/lib/submissions/repository";
import { EMULATOR_HOST, MALFORMED_ID, REAL_CREATED_AT, REAL_DEEP_DIVE, REAL_OWNER_TOKEN, REAL_RESULTS } from "./real-results";

/**
 * Writes the e2e's real results into the Firestore emulator before any spec
 * runs (CHANTIERS.md A7.11). Through `createSubmissionFlow` and the real
 * `saveSubmission`, never a hand-built document: see `real-results.ts`.
 *
 * Does nothing without `FIRESTORE_EMULATOR_HOST` — and refuses to run with
 * it pointing anywhere but this machine, so a misconfigured shell can never
 * write test documents into a real project. The benchmark counters are left
 * alone: the specs read the result, not the average.
 */
export default async function globalSetup(): Promise<void> {
  if (!EMULATOR_HOST) return;
  if (!/^(127\.0\.0\.1|localhost|\[::1\]):\d+$/.test(EMULATOR_HOST)) {
    throw new Error(`FIRESTORE_EMULATOR_HOST must be a local address, got "${EMULATOR_HOST}"`);
  }
  for (const result of Object.values(REAL_RESULTS)) {
    const { submission } = await createSubmissionFlow(
      { answers: result.answers, tone: result.tone, locale: result.locale, refId: null, segment: null },
      {
        saveSubmission,
        generateId: () => result.id,
        generateOwnerToken: () => REAL_OWNER_TOKEN,
        now: () => new Date(REAL_CREATED_AT),
      },
    );
    if (submission.total !== result.total) {
      throw new Error(`real-results.ts: ${result.id} scores ${submission.total}, the fixture says ${result.total}`);
    }
  }
  // A re-run against a live emulator finds it already there: "already-present" is fine.
  await saveDeepDive(REAL_RESULTS.deep.id, REAL_DEEP_DIVE);
  await saveDeepDive(REAL_RESULTS.roastDeep.id, REAL_DEEP_DIVE);
  // Straight into the collection on purpose: this document must NOT go through
  // the flow that would make it valid (`real-results.ts`, MALFORMED_ID).
  await getDb().collection("submissions").doc(MALFORMED_ID).set({ id: MALFORMED_ID, createdAt: REAL_CREATED_AT });
}
