import { tc } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { QUESTION_CONTENT } from "@/lib/i18n/questionnaire-content";
import { buildGeminiPrompt, type PromptAnswer } from "@/lib/gemini/prompt";
import { extractGeminiText } from "@/lib/gemini/response";
import type { Tone } from "@/lib/quiz/tone";
import { computeScore, type Answers } from "@/lib/scoring/score";
import { QUESTIONS } from "@/lib/scoring/questions";
import type { Submission } from "./types";
import { parseVerdict } from "./verdict";

export interface CreateSubmissionInput {
  answers: Answers;
  tone: Tone;
  locale: Locale;
  /** The submission id that referred this visitor here (`?ref=`), if any. */
  refId: string | null;
}

export interface CreateSubmissionDeps {
  callGemini: (prompt: string) => Promise<{ data: unknown; modelUsed: string }>;
  saveSubmission: (submission: Submission) => Promise<void>;
  generateId: () => string;
  now: () => Date;
}

function buildPromptAnswers(answers: Answers, locale: Locale): PromptAnswer[] {
  return QUESTIONS.map((q) => {
    const content = QUESTION_CONTENT[q.id];
    if (!content) throw new Error(`No question content for "${q.id}"`);

    const selected = answers[q.id];
    const option = content.options.find((o) => o.index === selected);
    if (!option) throw new Error(`Missing or invalid answer for question "${q.id}"`);

    return { pillar: q.pillar, question: tc(content.question, locale), answer: tc(option.label, locale) };
  });
}

/**
 * Orchestrates one full submission: score (deterministic, CLAUDE.md
 * non-negotiable — computed once here and never touched again) → Gemini
 * synthesis → persistence. Deps are injected so this is testable without a
 * real Gemini key or Firestore project (see create-submission.test.ts).
 *
 * If Gemini fails after exhausting every fallback model, this throws and
 * nothing is saved — per DESIGN-BRIEF.md's interaction model, "Try again"
 * on the error screen (step 9) just re-invokes this whole flow with the
 * same stored answers, rather than resuming a half-saved submission.
 */
export async function createSubmissionFlow(input: CreateSubmissionInput, deps: CreateSubmissionDeps): Promise<Submission> {
  const { pillars, total, weakestPillar } = computeScore(input.answers);

  const prompt = buildGeminiPrompt({
    locale: input.locale,
    tone: input.tone,
    pillars,
    total,
    weakestPillar,
    answers: buildPromptAnswers(input.answers, input.locale),
  });

  const { data, modelUsed } = await deps.callGemini(prompt);
  const verdict = parseVerdict(extractGeminiText(data), modelUsed);

  const submission: Submission = {
    id: deps.generateId(),
    createdAt: deps.now().toISOString(),
    locale: input.locale,
    tone: input.tone,
    answers: input.answers,
    pillars,
    total,
    weakestPillar,
    refId: input.refId,
    verdict,
  };

  await deps.saveSubmission(submission);
  return submission;
}
