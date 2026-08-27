import { QUESTIONS } from "@/lib/scoring/questions";
import type { Answers } from "@/lib/scoring/score";

/** Pure derivations over the questionnaire's linear flow (DESIGN-BRIEF.md §05/State) — no React, fully unit-testable. */

export const QUESTION_COUNT = QUESTIONS.length; // 15
export const STAGE_COUNT = 5;
export const QUESTIONS_PER_STAGE = QUESTION_COUNT / STAGE_COUNT; // 3
export const ESTIMATED_MINUTES = 3;

/** 0-14 -> 0-4 ("Stage 2 of 5" for question index 3, 4, or 5). */
export function stageOfQuestion(questionIndex: number): number {
  return Math.floor(questionIndex / QUESTIONS_PER_STAGE);
}

/**
 * Where to resume: the first question with no recorded answer, or the last
 * question if every one of them already has an answer (e.g. reloading after
 * finishing, before the tone selector existed to take over — step 5).
 */
export function firstUnansweredIndex(answers: Answers): number {
  const index = QUESTIONS.findIndex((q) => answers[q.id] === undefined);
  return index === -1 ? QUESTIONS.length - 1 : index;
}

export function isComplete(answers: Answers): boolean {
  return QUESTIONS.every((q) => answers[q.id] !== undefined);
}

/**
 * Rough "time left" estimate shown next to `Q n/15` on desktop
 * (DESIGN-BRIEF.md §05). ~3 minutes for 15 questions, floored, minimum 1 —
 * matches the design mock's "Q 4/15 — 2 min left" (12 questions remaining:
 * floor(12 * 3/15) = 2).
 */
export function minutesLeft(currentQuestionIndex: number): number {
  const remaining = QUESTION_COUNT - currentQuestionIndex;
  return Math.max(1, Math.floor((remaining * ESTIMATED_MINUTES) / QUESTION_COUNT));
}
