import { tc } from "@/lib/i18n/dictionary";
import { LOCALES, type Locale } from "@/lib/i18n/locale";
import { QUESTIONS } from "@/content/copy-library";
import { DEEP_MODE_QUESTIONS } from "@/content/deep-mode-questions";
import { FREE_CONTEXT_MAX_LENGTH } from "@/content/free-context";
import { buildDeepDivePrompt, type PromptAnswer } from "@/lib/gemini/prompt";
import { extractGeminiText } from "@/lib/gemini/response";
import type { Tone } from "@/lib/quiz/tone";
import { computeScore, type Answers, type PillarScore } from "@/lib/scoring/score";
import type { Pillar } from "@/lib/scoring/pillars";
import { hashOwnerToken } from "./owner-token";
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
  /** The one-time ownership secret for this submission (REVIEW.md R-01) — injected like `generateId` so tests stay deterministic. */
  generateOwnerToken: () => string;
  now: () => Date;
  /**
   * Adds this score to the running totals behind the result page's
   * benchmark (REVIEW.md R-20). Optional: it is bookkeeping, not part of
   * producing a result, and a caller that doesn't care (a test, a future
   * script) shouldn't have to stub it.
   */
  recordInGlobalStats?: (total: number) => Promise<void>;
}

export interface CreateSubmissionResult {
  submission: Submission;
  /**
   * The plaintext owner token, returned to the caller EXACTLY once — only
   * its hash is persisted. The API route passes it straight to the creating
   * browser, which keeps it in localStorage; it is never recoverable
   * afterwards, by anyone, including us.
   */
  ownerToken: string;
}

/**
 * Orchestrates one full Quick submission: score (deterministic, CLAUDE.md
 * non-negotiable) → verdict (deterministic, SPEC-ADDENDUM-01.md §0) →
 * persistence. No Gemini call at all — zero external calls between the last
 * question and the result, which is the whole point of the §0 migration.
 *
 * The Quick verdicts are NOT computed or stored here (REVIEW.md R-09): they
 * are a pure lookup over the copy library, so they are resolved per request
 * in the locale of whoever is reading the result — see
 * `view-model.ts#buildQuickVerdicts`. Storing them once, in the author's
 * locale, is exactly what made a shared result render half in the wrong
 * language.
 */
export async function createSubmissionFlow(
  input: CreateSubmissionInput,
  deps: CreateSubmissionDeps,
): Promise<CreateSubmissionResult> {
  const { pillars, total, weakestPillar } = computeScore(input.answers);

  const ownerToken = deps.generateOwnerToken();

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
    ownerTokenHash: hashOwnerToken(ownerToken),
    deepDive: null,
  };

  await deps.saveSubmission(submission);

  // Bookkeeping for the benchmark (REVIEW.md R-20), never a reason to fail.
  // The user's result exists and is saved by this point; a failed counter
  // increment would cost them a 502 for a Tour that actually completed. The
  // consequence of swallowing it is one submission missing from an average
  // of hundreds.
  if (deps.recordInGlobalStats) {
    try {
      await deps.recordInGlobalStats(total);
    } catch (err) {
      console.error("global stats increment failed (the submission itself is saved):", err);
    }
  }

  return { submission, ownerToken };
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
  /**
   * Optional free-text field (SPEC-ADDENDUM-02.md §1) — clamped to
   * `FREE_CONTEXT_MAX_LENGTH` again here regardless of what the caller
   * already did (the API route truncates too; a non-negotiable this
   * important is worth enforcing at more than one layer, never trusting a
   * single boundary alone).
   */
  freeContext?: string | null;
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
  freeContext: string | undefined,
  callGemini: CompleteDeepDiveDeps["callGemini"],
): Promise<DeepDiveVerdict> {
  const prompt = buildDeepDivePrompt({ locale, tone, pillars, total, weakestPillar, quickAnswers, contextAnswers, freeContext });
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

  const trimmedFreeContext = input.freeContext?.trim().slice(0, FREE_CONTEXT_MAX_LENGTH);
  const freeContextForPrompt = trimmedFreeContext ? trimmedFreeContext : undefined;

  // Every prompt input is resolved in the language being generated — the
  // questions, the chosen answers, the context labels. Only `freeContext` is
  // passed through untouched: those are the founder's own words, in whatever
  // language they chose to write them.
  const forTone = (tone: Tone, target: Locale) =>
    getDeepDiveVerdictForTone(
      tone,
      target,
      pillars,
      total,
      weakestPillar,
      resolveQuickPromptAnswers(answers, target),
      resolveContextPromptAnswers(contextAnswerIndices, target),
      freeContextForPrompt,
      deps.callGemini,
    );

  async function forLocale(target: Locale): Promise<{ neutral: DeepDiveVerdict; roast: DeepDiveVerdict }> {
    const [neutral, roast] = await Promise.all([forTone("neutral", target), forTone("roast", target)]);
    return { neutral, roast };
  }

  // The completion locale is required — failing it fails the request, the
  // same fail-closed contract this flow always had.
  //
  // Every OTHER language is best-effort, and that asymmetry is the point: a
  // reader arriving on a shared result deserves it in their own language
  // (R-09's principle, which the Deep dive escaped because it REPLACES the
  // Quick sentences), but nobody should lose the recommendation they answered
  // ten extra questions for because the second generation flaked. A missing
  // language simply falls back — see `view-model.ts#toDeepDiveView`.
  const others = LOCALES.filter((l) => l !== locale);
  const [primary, ...rest] = await Promise.all([
    forLocale(locale),
    ...others.map((l) => forLocale(l).catch((err: unknown) => {
      console.error(`Deep dive generation failed for locale "${l}" (the ${locale} one is kept):`, err);
      return null;
    })),
  ]);

  const localized: Partial<Record<Locale, { neutral: DeepDiveVerdict; roast: DeepDiveVerdict }>> = {
    [locale]: primary!,
  };
  others.forEach((l, i) => {
    const verdicts = rest[i];
    if (verdicts) localized[l] = verdicts;
  });

  return {
    completed: true,
    contextAnswers: resolveContextAnswerLabels(contextAnswerIndices, locale),
    freeContext: freeContextForPrompt ?? null,
    locale,
    // Still written in the generation locale, so anything reading the old
    // field keeps working exactly as before.
    verdicts: primary!,
    localized,
  };
}
