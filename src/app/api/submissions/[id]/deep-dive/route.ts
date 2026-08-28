import { NextResponse } from "next/server";
import { DEEP_MODE_QUESTIONS } from "@/content/deep-mode-questions";
import { FREE_CONTEXT_MAX_LENGTH } from "@/content/free-context";
import { callGeminiWithFallback } from "@/lib/gemini/client";
import type { Locale } from "@/lib/i18n/locale";
import { completeDeepDiveFlow, type DeepDiveAnswers } from "@/lib/submissions/create-submission";
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

export async function POST(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { contextAnswers, locale, freeContext } = (body ?? {}) as Record<string, unknown>;

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

  const submission = await getSubmissionById(id);
  if (!submission) {
    return NextResponse.json({ error: `No submission found for id "${id}".` }, { status: 404 });
  }
  if (submission.deepDive) {
    // Idempotent: re-completing an already-enriched result just returns what's there.
    return NextResponse.json(submission, { status: 200 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not configured.");
    return NextResponse.json({ error: "Server is not configured to run the Deep dive yet." }, { status: 500 });
  }

  try {
    const deepDive = await completeDeepDiveFlow(
      { submission, contextAnswerIndices: contextAnswers, locale, freeContext: truncatedFreeContext },
      { callGemini: (prompt) => callGeminiWithFallback(prompt, apiKey) },
    );

    await saveDeepDive(id, deepDive);

    return NextResponse.json({ ...submission, deepDive }, { status: 200 });
  } catch (err) {
    console.error("completeDeepDiveFlow failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error while running the Deep dive." },
      { status: 502 },
    );
  }
}
