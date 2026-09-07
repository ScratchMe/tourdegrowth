import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { FieldValue } from "firebase-admin/firestore";
import { QUESTIONS } from "@/content/copy-library";
import { DEEP_MODE_QUESTIONS } from "@/content/deep-mode-questions";
import { getDb } from "@/lib/firebase/admin";
import { segmentId, type SegmentAnswers } from "@/lib/submissions/segment";
import type { Submission } from "@/lib/submissions/types";

/**
 * The end-to-end checks that need real Firestore and real Gemini — the ones
 * no sandbox can run, and that were sitting on Antoine's list as manual work.
 *
 * Runs against the DEPLOYED site over HTTP, and uses the Admin SDK only to
 * assert on what the app actually wrote and to clean up afterwards. That way
 * what is being verified is production, not a local rebuild of it.
 *
 * It creates a real submission and a real Deep dive, then deletes both —
 * including undoing BOTH benchmark increments (`stats/global` and the
 * per-segment one), so a verification run never skews a number shown to real
 * users. Forgetting the second would be worse than the first: twelve segments
 * split the same traffic twelve ways, so one stray test score weighs far more
 * in a segment average than in the global one.
 */
const SITE = (process.env.VERIFY_SITE_URL ?? "https://www.tourdegrowth.com").replace(/\/$/, "");

/** Every question answered "middle option", so the score is neither 0 nor 100. */
const ANSWERS = Object.fromEntries(QUESTIONS.map((q) => [q.id, 1]));
const CONTEXT_ANSWERS = Object.fromEntries(DEEP_MODE_QUESTIONS.map((q) => [q.id, 0]));
/**
 * A nonsense token inside otherwise realistic context. Gemini has every
 * reason to reuse the *subject matter* in the advice it writes — that is the
 * whole point of the field — and no reason at all to reproduce this. So it is
 * the canary: if the raw stored field ever rides along in the public page's
 * payload, this shows up in the HTML and the check below fails.
 */
const LEAK_CANARY = "TDG-CANARY-7F3A91";
const FREE_CONTEXT = `We sell a scheduling tool to independent physiotherapists; onboarding is where people drop. Internal ref ${LEAK_CANARY}.`;

/**
 * A fully-answered segment (REVIEW-02.md R2-26) — the only shape that
 * produces an aggregate id at all, and therefore the only one that exercises
 * the `stats/<segment>` write this probe exists to check.
 */
const SEGMENT: SegmentAnswers = { stage: "first-customers", model: "b2b" };
const SEGMENT_ID = segmentId(SEGMENT)!;

let created: { id: string; ownerToken: string; total: number } | undefined;
/** Counter values read BEFORE anything is created, so the increments can be proven rather than merely observed to be non-zero. */
const before: Record<string, number> = {};

async function statsCount(docId: string): Promise<number> {
  const doc = await getDb().collection("stats").doc(docId).get();
  return (doc.data()?.count as number | undefined) ?? 0;
}

function report(label: string, value: unknown) {
  console.log(`\n  ── ${label}\n     ${typeof value === "string" ? value : JSON.stringify(value)}`);
}

async function readSubmission(id: string): Promise<Submission> {
  const doc = await getDb().collection("submissions").doc(id).get();
  expect(doc.exists, `submission ${id} should exist in Firestore`).toBe(true);
  return doc.data() as Submission;
}

/** The page as a reader with this Accept-Language would get it — no cookie, no `?lang=`. */
async function fetchResultPage(id: string, acceptLanguage: string): Promise<string> {
  const res = await fetch(`${SITE}/r/${id}`, { headers: { "accept-language": acceptLanguage } });
  expect(res.status, `GET /r/${id} (${acceptLanguage})`).toBe(200);
  return res.text();
}

describe("live production pipeline", () => {
  beforeAll(() => {
    for (const key of ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"]) {
      if (!process.env[key]) throw new Error(`${key} is not set — add it to the repository secrets.`);
    }
    console.log(`\n  Target: ${SITE}\n`);
  });

  beforeAll(async () => {
    before.global = await statsCount("global");
    before.segment = await statsCount(SEGMENT_ID);
  });

  afterAll(async () => {
    // Always, even when an assertion above failed: a half-verified run must
    // not leave test data in the collection real numbers are computed from.
    if (!created) return;
    const db = getDb();
    await db.collection("submissions").doc(created.id).delete();
    const undo = { count: FieldValue.increment(-1), scoreSum: FieldValue.increment(-created.total) };
    await db.collection("stats").doc("global").set(undo, { merge: true });
    await db.collection("stats").doc(SEGMENT_ID).set(undo, { merge: true });
    console.log(`\n  Cleaned up submission ${created.id} and undid both stats increments.\n`);
  });

  it("creates a submission and returns only id, owner token and score", async () => {
    const res = await fetch(`${SITE}/api/submissions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ answers: ANSWERS, tone: "neutral", locale: "en", refId: null, segment: SEGMENT }),
    });

    expect(res.status).toBe(201);
    const payload = (await res.json()) as { id: string; ownerToken: string; total: number };
    expect(Object.keys(payload).sort()).toEqual(["id", "ownerToken", "total"]);
    created = payload;
    report("submission created", `${payload.id} — ${payload.total}/100`);
  });

  it("stores the score but no verdict text — the language belongs to the render (R-09)", async () => {
    const submission = await readSubmission(created!.id);

    expect(submission.total).toBe(created!.total);
    expect(submission.ownerTokenHash).toBeTruthy();
    expect(submission).not.toHaveProperty("verdicts");
    expect(submission.deepDive).toBeNull();
  });

  it("renders a REAL result in the reader's language, not the author's (R-09)", async () => {
    // The gap the sample page could never cover: /r/sample has fixed data, so
    // until now this had only ever been proven against it.
    const [english, french] = await Promise.all([
      fetchResultPage(created!.id, "en-GB,en;q=0.9"),
      fetchResultPage(created!.id, "fr-FR,fr;q=0.9"),
    ]);

    expect(english).toContain('<html lang="en"');
    expect(french).toContain('<html lang="fr"');
    // Accented characters are the cheapest reliable signal that the verdict
    // text itself switched, not just the chrome.
    expect(french).toMatch(/[àâéèêîôùûç]/);
    expect(english).not.toBe(french);
  });

  it("serves a real OG image for that result", async () => {
    const page = await fetchResultPage(created!.id, "en");
    const declared = /property="og:image" content="([^"]+)"/.exec(page)?.[1];
    expect(declared, "the page must declare an og:image").toBeTruthy();

    const image = await fetch(declared!);
    expect(image.status).toBe(200);
    expect(image.headers.get("content-type")).toContain("image/png");
  });

  it("counts the submission in the global benchmark (R-20)", async () => {
    const stats = await getDb().collection("stats").doc("global").get();
    const data = stats.data();
    // Compared against the value read before this run rather than to zero: a
    // non-zero counter only proves that SOMETHING was once counted, which was
    // already true before this feature existed.
    expect(data?.count, "stats/global must have counted this submission").toBeGreaterThanOrEqual(before.global! + 1);
    report("stats/global", { count: data?.count, average: Math.round((data?.scoreSum ?? 0) / (data?.count || 1)) });
  });

  it("stores the segment and counts it in its own aggregate (R2-26)", async () => {
    // The half of R2-26 no offline test can reach: the field surviving the
    // round trip through Firestore, and the per-segment counter actually
    // being written by the fire-and-forget increment (which is deliberately
    // swallowed on failure, so a silent no-op would look exactly like
    // success from the API's side).
    const submission = await readSubmission(created!.id);
    expect(submission.segment).toEqual(SEGMENT);

    const count = await statsCount(SEGMENT_ID);
    expect(count, `stats/${SEGMENT_ID} must have counted this submission`).toBeGreaterThanOrEqual(before.segment! + 1);
    report(`stats/${SEGMENT_ID}`, { before: before.segment, after: count });
  });

  it("completes a Deep dive in BOTH languages, and shows the French for review", async () => {
    const started = Date.now();
    const res = await fetch(`${SITE}/api/submissions/${created!.id}/deep-dive`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contextAnswers: CONTEXT_ANSWERS,
        locale: "en",
        ownerToken: created!.ownerToken,
        freeContext: FREE_CONTEXT,
      }),
    });
    const elapsed = Math.round((Date.now() - started) / 1000);

    if (res.status === 502) {
      // The route deliberately hides the cause behind a short stable code
      // (R-04), so this probe cannot tell "Gemini is down" from "we broke the
      // Deep dive" on its own. Say that, rather than leaving a bare 502 to be
      // decoded — a run has already been red for the first reason.
      throw new Error(
        `Deep dive returned 502 DEEP_DIVE_FAILED after ${elapsed}s.\n` +
          `  The route hides the cause on purpose (REVIEW.md R-04). To tell which it is:\n` +
          `  - the "Gemini client against the real API" step in THIS run says whether the API is healthy;\n` +
          `  - Vercel's function logs carry the full error.\n` +
          `  An upstream outage here is not a regression; the user keeps their answers and can retry.`,
      );
    }
    expect(res.status, await res.text().catch(() => "")).toBe(200);
    report("deep dive latency", `${elapsed}s (four generations, in parallel)`);

    const submission = await readSubmission(created!.id);
    const deepDive = submission.deepDive;
    expect(deepDive?.completed).toBe(true);
    expect(deepDive?.locale).toBe("en");
    // The fix: both languages generated up front, because Gemini output can't
    // be re-resolved per reader the way the Quick copy-library lookup can.
    expect(Object.keys(deepDive?.localized ?? {}).sort()).toEqual(["en", "fr"]);

    // Printed, not asserted: only a human can judge whether the French reads
    // like the product. This is the whole point of running the probe here.
    report("EN priority action", deepDive!.localized!.en!.neutral.priorityAction);
    report("FR action prioritaire", deepDive!.localized!.fr!.neutral.priorityAction);
    report("FR roast, retention", deepDive!.localized!.fr!.roast.pillarRecommendations.retention);
    report("models used", {
      en: deepDive!.localized!.en!.neutral.modelUsed,
      fr: deepDive!.localized!.fr!.neutral.modelUsed,
    });
  });

  it("shows the French reader the French Deep dive, not the English one", async () => {
    const [english, french] = await Promise.all([
      fetchResultPage(created!.id, "en-GB,en;q=0.9"),
      fetchResultPage(created!.id, "fr-FR,fr;q=0.9"),
    ]);
    const submission = await readSubmission(created!.id);
    const fr = submission.deepDive!.localized!.fr!.neutral.priorityAction;
    const en = submission.deepDive!.localized!.en!.neutral.priorityAction;

    // The exact bug Antoine reported: the priority action stayed English on a
    // French page.
    expect(french).toContain(fr.slice(0, 40));
    expect(english).toContain(en.slice(0, 40));
  });

  it("keeps the free-text context off the public page (R-02)", async () => {
    const page = await fetchResultPage(created!.id, "en");

    // What R-02 actually guarantees: the STORED fields never enter the RSC
    // payload of a public page. Not "no word from the context ever appears" —
    // the first run of this probe asserted that, and failed, because Gemini
    // had written "physiotherapists" into its own recommendations. That is
    // the feature working, not a leak. Do not put that assertion back.
    expect(page, "the raw free-text field must not be in the payload").not.toContain(LEAK_CANARY);
    for (const key of ["freeContext", "contextAnswers", "modelUsed"]) {
      expect(page, `${key} must not cross to the client`).not.toContain(key);
    }
    // The Deep dive answers are keyed by question id; one appearing would mean
    // the whole answer map came along.
    expect(page).not.toContain(DEEP_MODE_QUESTIONS[0]!.id);
    // The model that answered is observability, never shown to a user.
    expect(page).not.toMatch(/gemini-\d/);
  });

  it("does put the founder's own context INTO the advice — which is the point", async () => {
    // The flip side of the check above, asserted so the two can't be confused
    // later: the free-text field exists to make the recommendations specific.
    // Worth knowing as a product fact, not a defect: whatever someone writes
    // there shapes text that lands on a page they may share.
    const submission = await readSubmission(created!.id);
    const advice = Object.values(submission.deepDive!.localized!.en!.neutral.pillarRecommendations).join(" ");
    expect(advice.toLowerCase()).toContain("physiotherapist");
  });
});
