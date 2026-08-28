import { NextResponse } from "next/server";
import type { Locale } from "@/lib/i18n/locale";
import type { Tone } from "@/lib/quiz/tone";
import type { AnswerIndex, Answers } from "@/lib/scoring/score";
import { createSubmissionFlow } from "@/lib/submissions/create-submission";
import { saveSubmission } from "@/lib/submissions/repository";

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

function isAnswers(value: unknown): value is Answers {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(isAnswerIndex)
  );
}

function isTone(value: unknown): value is Tone {
  return value === "neutral" || value === "roast";
}

function isLocaleValue(value: unknown): value is Locale {
  return value === "en" || value === "fr";
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { answers, tone, locale, refId } = (body ?? {}) as Record<string, unknown>;

  if (!isAnswers(answers)) {
    return NextResponse.json({ error: "answers must be a map of questionId -> 0|1|2." }, { status: 400 });
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

  try {
    const submission = await createSubmissionFlow(
      { answers, tone, locale, refId: (refId as string | null | undefined) ?? null },
      {
        saveSubmission,
        generateId: () => crypto.randomUUID(),
        now: () => new Date(),
      },
    );

    return NextResponse.json(submission, { status: 201 });
  } catch (err) {
    console.error("createSubmissionFlow failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error while scoring the submission." },
      { status: 502 },
    );
  }
}
