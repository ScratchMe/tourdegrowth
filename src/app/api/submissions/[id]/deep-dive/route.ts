import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { DEEP_MODE_QUESTIONS } from "@/content/deep-mode-questions";
import { FREE_CONTEXT_MAX_LENGTH } from "@/content/free-context";
import { callDeepDiveGemini } from "@/lib/gemini/deep-dive";
import type { Locale } from "@/lib/i18n/locale";
import { completeDeepDiveFlow, type DeepDiveAnswers } from "@/lib/submissions/create-submission";
import { verifyOwnerToken } from "@/lib/submissions/owner-token";
import { invalidateSubmission } from "@/lib/submissions/cached-repository";
import { getSubmissionById, saveDeepDive } from "@/lib/submissions/repository";

// The one Route Handler that still calls Gemini (SPEC-ADDENDUM-01.md §0/§2.4)
// — Quick submissions (POST /api/submissions) no longer do.

function isDeepDiveAnswers(value: unknown): value is DeepDiveAnswers {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length !== DEEP_MODE_QUESTIONS.length) return false;
  return DEEP_MODE_QUESTIONS.every((q) => {
    const selected = (value as Record<string, unknown>)[q.id];
    return typeof selected === "number" && Number.isInteger(selected) && selected >= 0 && selected < q.options.length;
  });
}

function isLocaleValue(value: unknown): value is Locale {
  return value === "en" || value === "fr";
}

/**
 * Vercel's default function timeout is shorter than this route reliably
 * needs: a real Deep dive was measured at ~41s (Gemini generations, each
 * able to retry across four models at 20s apiece). Declaring it means a slow
 * but successful generation is not cut off mid-flight — REVIEW.md R-15.
 */
export const maxDuration = 120;

/**
 * Tighter than the submission limit: each of these costs FOUR Gemini
 * generations — two tones x two languages, since a Deep dive replaces the
 * per-pillar sentences and Gemini output can't be re-resolved per reader the
 * way the Quick copy-library lookup can. Five an hour per IP is therefore 20
 * generations, not 10; kept at five because a false positive here means
 * refusing a real founder, and 20 is still nothing against the quota.
 */
const DEEP_DIVE_LIMIT = { limit: 5, windowSeconds: 3600 };

export async function POST(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const limit = rateLimit(clientKey(request, "deep-dive"), DEEP_DIVE_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { contextAnswers, locale, freeContext, ownerToken } = (body ?? {}) as Record<string, unknown>;

  if (!isDeepDiveAnswers(contextAnswers)) {
    return NextResponse.json(
      { error: `contextAnswers must map every one of the ${DEEP_MODE_QUESTIONS.length} Deep dive question ids to a valid option index.` },
      { status: 400 },
    );
  }
  if (!isLocaleValue(locale)) {
    return NextResponse.json({ error: 'locale must be "en" or "fr".' }, { status: 400 });
  }
  if (freeContext !== undefined && freeContext !== null && typeof freeContext !== "string") {
    return NextResponse.json({ error: "freeContext must be a string, null, or omitted." }, { status: 400 });
  }
  // SPEC-ADDENDUM-02.md §1.4, non-negotiable: truncate server-side even
  // though the textarea already enforces this client-side — never trust a
  // client-only limit for text that goes straight into a Gemini prompt.
  const truncatedFreeContext =
    typeof freeContext === "string" ? freeContext.slice(0, FREE_CONTEXT_MAX_LENGTH) : null;

  // REVIEW.md R-04: this read sat outside every try/catch, so a Firestore
  // outage surfaced as an unhandled throw (a bare framework 500) rather than
  // the app's own error contract.
  //
  // Deliberately the UNCACHED read (R-14): the "already completed?" check
  // below has to see current state, or two Deep dives launched at once could
  // both believe they are the first.
  let submission;
  try {
    submission = await getSubmissionById(id);
  } catch (err) {
    console.error("getSubmissionById failed:", err);
    return NextResponse.json({ error: "DEEP_DIVE_FAILED" }, { status: 502 });
  }

  if (!submission) {
    return NextResponse.json({ error: `No submission found for id "${id}".` }, { status: 404 });
  }

  // REVIEW.md R-01, the whole point of this route's gate: a result id is a
  // PUBLIC shareable link, so knowing it proves nothing. Only the browser
  // that created the submission holds the matching owner token. Without this
  // check any recipient of a shared link could fill someone else's result
  // with their own business context — and irreversibly, because of the
  // idempotent branch just below. Fails closed for pre-R-01 submissions
  // (no stored hash) — see owner-token.ts.
  if (!verifyOwnerToken(ownerToken, submission.ownerTokenHash)) {
    return NextResponse.json(
      { error: "Only the person who took this Tour can run its Deep dive." },
      { status: 403 },
    );
  }

  if (submission.deepDive) {
    // Idempotent: re-completing an already-enriched result is a no-op that
    // just sends the caller to the result page. (Returns the id only — the
    // full submission used to come back here, Deep dive free text included,
    // see REVIEW.md R-02.)
    return NextResponse.json({ id }, { status: 200 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not configured.");
    return NextResponse.json({ error: "Server is not configured to run the Deep dive yet." }, { status: 500 });
  }

  try {
    const deepDive = await completeDeepDiveFlow(
      { submission, contextAnswerIndices: contextAnswers, locale, freeContext: truncatedFreeContext },
      { callGemini: (prompt) => callDeepDiveGemini(prompt, apiKey) },
    );

    const outcome = await saveDeepDive(id, deepDive);
    if (outcome === "already-present") {
      // Lost a race with a concurrent completion (REVIEW-02.md R2-21): the
      // other request's Deep dive is the one on the document, and it is just
      // as valid. Nothing to invalidate here — the winner did.
      console.warn(`Deep dive for ${id} was completed concurrently; keeping the first write.`);
      return NextResponse.json({ id }, { status: 200 });
    }
    // The one moment a submission changes — drop the cached copy so the
    // result page shows the enriched version immediately (REVIEW.md R-14).
    invalidateSubmission(id);

    // The client only redirects to /r/<id> from here; the enriched result is
    // rendered server-side on that page, where `freeContext` is stripped
    // before it can reach the browser (REVIEW.md R-02).
    return NextResponse.json({ id }, { status: 200 });
  } catch (err) {
    // Same as the create route (REVIEW.md R-04): full detail to the logs, a
    // stable code to the browser. This path in particular used to forward
    // Gemini's raw response body — `parseDeepDiveVerdict` and
    // `extractGeminiText` both JSON.stringify what they got into their error
    // messages — straight onto the user's error screen.
    console.error("completeDeepDiveFlow failed:", err);
    return NextResponse.json({ error: "DEEP_DIVE_FAILED" }, { status: 502 });
  }
}
