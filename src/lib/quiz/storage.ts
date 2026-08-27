import type { Answers } from "@/lib/scoring/score";

/**
 * localStorage persistence for in-progress questionnaire answers
 * (DESIGN-BRIEF.md §State: "persisted locally, survives reload and error
 * retry" — SPEC.md §4's error-state promise depends on this).
 *
 * SSR-safe (no-ops when `window` doesn't exist) and defensive against
 * private-browsing/quota errors — a user's answers not persisting is a
 * degraded experience, never a crash.
 */
const STORAGE_KEY = "tdg.quiz.answers.v1";

export function loadStoredAnswers(): Answers {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return isAnswersShape(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function saveStoredAnswers(answers: Answers): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  } catch {
    // localStorage unavailable (private mode, quota) — the session still
    // works from in-memory React state, it just won't survive a reload.
  }
}

export function clearStoredAnswers(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

function isAnswersShape(value: unknown): value is Answers {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  return Object.values(value).every((v) => v === 0 || v === 1 || v === 2 || v === 3);
}
