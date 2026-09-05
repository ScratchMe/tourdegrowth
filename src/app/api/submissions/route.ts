import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import type { Locale } from "@/lib/i18n/locale";
import type { Tone } from "@/lib/quiz/tone";
import { QUESTIONS } from "@/lib/scoring/questions";
import type { AnswerIndex, Answers } from "@/lib/scoring/score";
import { createSubmissionFlow } from "@/lib/submissions/create-submission";
import { generateOwnerToken } from "@/lib/submissions/owner-token";
import { resolveRefId } from "@/lib/submissions/referral";
import { recordSubmissionInGlobalStats, saveSubmission, submissionExists } from "@/lib/submissions/repository";

// Runs on Vercel as a Node.js Route Handler. Originally this is where the
// Gemini call + Firestore write happened (replacing the Supabase Edge
// Function the SPEC originally called for — see CLAUDE.md, moved off
// Supabase mid-build). SPEC-ADDENDUM-01.md §0 removed the Gemini call from
// this path entirely: Quick mode's verdict is now a deterministic lookup
// (see createSubmissionFlow), so this route is now just validation +
// scoring + a single Firestore write. The Gemini call now lives in
// `[id]/deep-dive/route.ts` instead.

function isAnswerIndex(value: unknown): value is AnswerIndex {
  return value === 0 || value === 1 || value === 2;
}

/** The 15 ids `computeScore` requires — the contract this route enforces. */
const QUESTION_IDS = new Set(QUESTIONS.map((q) => q.id));

/**
 * REVIEW.md R-04: the keys have to be EXACTLY the 15 question ids.
 *
 * The previous check only looked at the values, so two things got through.
 * Arbitrary keys were written verbatim into Firestore alongside the real
 * answers (whatever a caller felt like sending, stored forever on a document
 * we then read back and cast). And an INCOMPLETE set passed validation here
 * only to make `computeScore` throw further down — turning a plain client
 * mistake into a 502 carrying an internal message.
 *
 * Matching the count and checking every key belongs to the set is enough to
 * prove the two sets are equal: no missing id, no extra one.
 */
function isAnswers(value: unknown): value is Answers {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;

  const entries = Object.entries(value);
  if (entries.length !== QUESTION_IDS.size) return false;

  return entries.every(([id, answer]) => QUESTION_IDS.has(id) && isAnswerIndex(answer));
}

function isTone(value: unknown): value is Tone {
  return value === "neutral" || value === "roast";
}

function isLocaleValue(value: unknown): value is Locale {
  return value === "en" || value === "fr";
}

/**
 * REVIEW.md R-15. Generous on purpose: a false positive here means refusing
 * to score a real founder, which is far worse than serving a few extra
 * requests to someone curious. A shared laptop or an office NAT should never
 * come close.
 */
const SUBMISSION_LIMIT = { limit: 12, windowSeconds: 3600 };

export async function POST(request: Request): Promise<Response> {
  const limit = rateLimit(clientKey(request, "submissions"), SUBMISSION_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { answers, tone, locale, refId } = (body ?? {}) as Record<string, unknown>;

  if (!isAnswers(answers)) {
    return NextResponse.json(
      { error: `answers must map each of the ${QUESTION_IDS.size} question ids to 0, 1 or 2 — no more, no fewer.` },
      { status: 400 },
    );
  }
  if (!isTone(tone)) {
    return NextResponse.json({ error: 'tone must be "neutral" or "roast".' }, { status: 400 });
  }
  if (!isLocaleValue(locale)) {
    return NextResponse.json({ error: 'locale must be "en" or "fr".' }, { status: 400 });
  }
  if (refId !== undefined && refId !== null && typeof refId !== "string") {
    return NextResponse.json({ error: "refId must be a string or null." }, { status: 400 });
  }

  // REVIEW.md R-03: a ref only counts if it looks like an id we could have
  // issued AND names a real submission. Anything else is dropped rather than
  // rejected — attribution is best-effort, scoring someone is not.
  const attributedRefId = await resolveRefId(refId, submissionExists);

  try {
    const { submission, ownerToken } = await createSubmissionFlow(
      { answers, tone, locale, refId: attributedRefId },
      {
        saveSubmission,
        generateId: () => crypto.randomUUID(),
        generateOwnerToken,
        now: () => new Date(),
        recordInGlobalStats: recordSubmissionInGlobalStats,
      },
    );

    // Only what the creating browser actually needs (REVIEW.md R-02): the id
    // to redirect to, the one-time owner token to keep (R-01), and the score
    // itself so the landing can offer it back later (R-20 — public data, it
    // is the first thing on the result page). The full submission — answers
    // included — used to come back here for no reason.
    return NextResponse.json({ id: submission.id, ownerToken, total: submission.total }, { status: 201 });
  } catch (err) {
    // REVIEW.md R-04: the full error goes to the server logs, a short stable
    // code goes to the browser. `err.message` used to be forwarded straight
    // to the user — which, depending on what failed, meant a Firestore error
    // or another internal detail rendered on the error screen. The code is
    // still shown there in small mono under the brief's reassuring sentence,
    // so it stays useful for support without describing our internals.
    console.error("createSubmissionFlow failed:", err);
    return NextResponse.json({ error: "SCORING_FAILED" }, { status: 502 });
  }
}
