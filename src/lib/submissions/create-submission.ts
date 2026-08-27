import { tc } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { QUESTION_CONTENT } from "@/lib/i18n/questionnaire-content";
import { buildGeminiPrompt, type PromptAnswer } from "@/lib/gemini/prompt";
import { extractGeminiText } from "@/lib/gemini/response";
import type { Tone } from "@/lib/quiz/tone";
import { computeScore, type Answers, type PillarScore } from "@/lib/scoring/score";
import { QUESTIONS } from "@/lib/scoring/questions";
import type { Pillar } from "@/lib/scoring/pillars";
import type { Submission, Verdict } from "./types";
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

async function getVerdictForTone(
  tone: Tone,
  locale: Locale,
  pillars: PillarScore[],
  total: number,
  weakestPillar: Pillar,
  promptAnswers: PromptAnswer[],
  callGemini: CreateSubmissionDeps["callGemini"],
): Promise<Verdict> {
  const prompt = buildGeminiPrompt({ locale, tone, pillars, total, weakestPillar, answers: promptAnswers });
  const { data, modelUsed } = await callGemini(prompt);
  return parseVerdict(extractGeminiText(data), modelUsed);
}

/**
 * Orchestrates one full submission: score (deterministic, CLAUDE.md
 * non-negotiable — computed once here and never touched again) → Gemini
 * synthesis, for BOTH tones → persistence. Deps are injected so this is
 * testable without a real Gemini key or Firestore project (see
 * create-submission.test.ts).
 *
 * Both tones' verdicts are generated now, not just the one the user picked
 * — DESIGN-BRIEF.md's result-page tone switch must "re-render... no
 * recalculation, no reload", which only works if the other tone's verdict
 * is already sitting in the document when the user toggles it. Two Gemini
 * Flash calls per submission is a deliberate, cheap trade-off for that.
 *
 * If Gemini fails after exhausting every fallback model on EITHER tone,
 * this throws and nothing is saved — per DESIGN-BRIEF.md's interaction
 * model, "Try again" on the error screen (step 9) just re-invokes this
 * whole flow with the same stored answers, rather than resuming a
 * half-saved submission.
 */
export async function createSubmissionFlow(input: CreateSubmissionInput, deps: CreateSubmissionDeps): Promise<Submission> {
  const { pillars, total, weakestPillar } = computeScore(input.answers);
  const promptAnswers = buildPromptAnswers(input.answers, input.locale);
  const forTone = (tone: Tone) =>
    getVerdictForTone(tone, input.locale, pillars, total, weakestPillar, promptAnswers, deps.callGemini);

  const [neutral, roast] = await Promise.all([forTone("neutral"), forTone("roast")]);

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
    verdicts: { neutral, roast },
  };

  await deps.saveSubmission(submission);
  return submission;
}
