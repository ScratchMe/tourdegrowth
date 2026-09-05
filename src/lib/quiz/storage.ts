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
  return Object.values(value).every((v) => v === 0 || v === 1 || v === 2);
}

/**
 * The `?ref=<id>` referral attribution (SPEC.md §7) — captured once,
 * wherever it first shows up (landing or quiz), then carried through the
 * whole questionnaire so it's still there when the submission is finally
 * created, however many questions later that is.
 */
const REF_STORAGE_KEY = "tdg.quiz.refId.v1";

export function loadRefId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(REF_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveRefId(refId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REF_STORAGE_KEY, refId);
  } catch {
    // ignore — attribution is a nice-to-have, never worth crashing over
  }
}

export function clearRefId(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(REF_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * The results this browser created, with the one-time owner token each was
 * issued (REVIEW.md R-01). This is the ONLY place ownership of a result
 * exists on the client: there are no accounts (SPEC.md §5), and the result
 * id alone proves nothing since it's the shareable link itself.
 *
 * Used to decide whether to offer the Deep dive at all (`isOwnResult`), and
 * to sign the Deep dive request (`findOwnerToken`).
 *
 * Known limit, accepted rather than worked around: clearing site data or
 * switching device loses the ability to Deep dive an already-created result.
 * That is the cost of having no accounts — the alternative is a bypass
 * anyone holding the link could use, which is exactly what R-01 fixes.
 */
const RESULTS_STORAGE_KEY = "tdg.results.v1";

/** Oldest entries beyond this are dropped — this list only ever grows one entry per completed Tour, but it should never grow without bound either. */
const MAX_STORED_RESULTS = 20;

export interface StoredResult {
  id: string;
  ownerToken: string;
  /** ISO 8601, client clock — only used to keep the most recent entries when trimming. */
  createdAt: string;
}

function isStoredResult(value: unknown): value is StoredResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === "string" && typeof v.ownerToken === "string" && typeof v.createdAt === "string";
}

export function loadStoredResults(): StoredResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RESULTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isStoredResult) : [];
  } catch {
    return [];
  }
}

/** Records a freshly created result. Re-recording the same id replaces its entry rather than duplicating it. */
export function rememberResult(result: StoredResult): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadStoredResults().filter((r) => r.id !== result.id);
    const next = [result, ...existing].slice(0, MAX_STORED_RESULTS);
    window.localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Same trade-off as the answers store: losing this degrades the
    // experience (no Deep dive offered on this result) but never breaks it.
  }
}

/** The owner token for a result created by this browser, or null for someone else's shared link. */
export function findOwnerToken(id: string): string | null {
  return loadStoredResults().find((r) => r.id === id)?.ownerToken ?? null;
}

/** Whether this browser created that result — drives whether the Deep dive is offered at all. */
export function isOwnResult(id: string): boolean {
  return findOwnerToken(id) !== null;
}
