import { tc } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { QUESTIONS } from "@/content/copy-library";
import { DEEP_MODE_QUESTIONS } from "@/content/deep-mode-questions";
import { buildDeepDivePrompt, type PromptAnswer } from "@/lib/gemini/prompt";
import { extractGeminiText } from "@/lib/gemini/response";
import type { Tone } from "@/lib/quiz/tone";
import { computeScore, type Answers, type PillarScore } from "@/lib/scoring/score";
import type { Pillar } from "@/lib/scoring/pillars";
import { buildQuickVerdict } from "@/lib/scoring/verdict";
import type { DeepDiveResult, DeepDiveVerdict, Submission } from "./types";
import { parseDeepDiveVerdict } from "./verdict";

export interface CreateSubmissionInput {
  answers: Answers;
  tone: Tone;
  locale: Locale;
  /** The submission id that referred this visitor here (`?ref=`), if any. */
  refId: string | null;
}

export interface CreateSubmissionDeps {
  saveSubmission: (submission: Submission) => Promise<void>;
  generateId: () => string;
  now: () => Date;
}

/**
 * Orchestrates one full Quick submission: score (deterministic, CLAUDE.md
 * non-negotiable) → verdict (deterministic, SPEC-ADDENDUM-01.md §0) →
 * persistence. No Gemini call at all — zero external calls between the last
 * question and the result, which is the whole point of the §0 migration.
 * Both tones' verdicts are computed (trivially, they're just lookups) so
 * the result page's tone switch stays a client-side swap.
 */
export async function createSubmissionFlow(input: CreateSubmissionInput, deps: CreateSubmissionDeps): Promise<Submission> {
  const { pillars, total, weakestPillar } = computeScore(input.answers);

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
    verdicts: {
      neutral: buildQuickVerdict("neutral", input.locale, pillars, weakestPillar),
      roast: buildQuickVerdict("roast", input.locale, pillars, weakestPillar),
    },
    deepDive: null,
  };

  await deps.saveSubmission(submission);
  return submission;
}

// ---------------------------------------------------------------------------
// Deep dive (SPEC-ADDENDUM-01.md §2) — the one place Gemini is still called.
// ---------------------------------------------------------------------------

/**
 * Deep dive answers are plain option-array indices, not the Quick
 * questionnaire's `AnswerIndex` (0|1|2) — several Deep dive questions have
 * more than 3 options (e.g. the 6-way acquisition-channel question), and
 * these indices carry no points at all (SPEC-ADDENDUM-01.md §2.3).
 */
export type DeepDiveAnswers = Record<string, number>;

export interface CompleteDeepDiveInput {
  submission: Submission;
  /** Selected option index (into DEEP_MODE_QUESTIONS[i].options) per question id. */
  contextAnswerIndices: DeepDiveAnswers;
  /** The locale to generate the Deep dive verdict in — normally the submission's own, but not forced to be. */
  locale: Locale;
}

export interface CompleteDeepDiveDeps {
  callGemini: (prompt: string) => Promise<{ data: unknown; modelUsed: string }>;
}

function resolveQuickPromptAnswers(answers: Answers, locale: Locale): PromptAnswer[] {
  return QUESTIONS.map((q) => {
    const selected = answers[q.id];
    const option = q.options[selected as 0 | 1 | 2];
    if (!option) throw new Error(`Missing or invalid Quick answer for question "${q.id}"`);
    return { pillar: q.pillar, question: tc(q.question, locale), answer: tc(option.label, locale) };
  });
}

function resolveContextPromptAnswers(contextAnswerIndices: DeepDiveAnswers, locale: Locale): PromptAnswer[] {
  return DEEP_MODE_QUESTIONS.map((q) => {
    const selected = contextAnswerIndices[q.id];
    const option = q.options[selected as number];
    if (!option) throw new Error(`Missing or invalid Deep dive answer for question "${q.id}"`);
    return { pillar: q.pillar, question: tc(q.question, locale), answer: tc(option.contextLabel, locale) };
  });
}

/** questionId -> the selected option's resolved contextLabel — the shape SPEC-ADDENDUM-01.md §2.7 stores on the submission. */
function resolveContextAnswerLabels(contextAnswerIndices: DeepDiveAnswers, locale: Locale): Record<string, string> {
  const result: Record<string, string> = {};
  for (const q of DEEP_MODE_QUESTIONS) {
    const selected = contextAnswerIndices[q.id];
    const option = q.options[selected as number];
    if (!option) throw new Error(`Missing or invalid Deep dive answer for question "${q.id}"`);
    result[q.id] = tc(option.contextLabel, locale);
  }
  return result;
}

async function getDeepDiveVerdictForTone(
  tone: Tone,
  locale: Locale,
  pillars: PillarScore[],
  total: number,
  weakestPillar: Pillar,
  quickAnswers: PromptAnswer[],
  contextAnswers: PromptAnswer[],
  callGemini: CompleteDeepDiveDeps["callGemini"],
): Promise<DeepDiveVerdict> {
  const prompt = buildDeepDivePrompt({ locale, tone, pillars, total, weakestPillar, quickAnswers, contextAnswers });
  const { data, modelUsed } = await callGemini(prompt);
  return parseDeepDiveVerdict(extractGeminiText(data), modelUsed);
}

/**
 * Completes the Deep dive for an already-existing Quick submission: 10
 * contextual answers in → a real Gemini call (repli multi-modèles, both
 * tones) → the enriched `DeepDiveResult` to persist alongside the
 * submission. Never touches `pillars`/`total`/`weakestPillar` — those stay
 * exactly what Quick mode already computed (SPEC-ADDENDUM-01.md §2.1).
 *
 * If Gemini fails after exhausting every fallback model on EITHER tone,
 * this throws and nothing is persisted — same fail-closed contract as the
 * original Quick-mode flow had.
 */
export async function completeDeepDiveFlow(
  input: CompleteDeepDiveInput,
  deps: CompleteDeepDiveDeps,
): Promise<DeepDiveResult> {
  const { submission, contextAnswerIndices, locale } = input;
  const { pillars, total, weakestPillar, answers } = submission;

  const quickAnswers = resolveQuickPromptAnswers(answers, locale);
  const contextAnswers = resolveContextPromptAnswers(contextAnswerIndices, locale);

  const forTone = (tone: Tone) =>
    getDeepDiveVerdictForTone(tone, locale, pillars, total, weakestPillar, quickAnswers, contextAnswers, deps.callGemini);

  const [neutral, roast] = await Promise.all([forTone("neutral"), forTone("roast")]);

  return {
    completed: true,
    contextAnswers: resolveContextAnswerLabels(contextAnswerIndices, locale),
    verdicts: { neutral, roast },
  };
}
