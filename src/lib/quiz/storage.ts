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

/**
 * First-touch attribution (REVIEW.md R-03): the share that first brought
 * someone here is the one credited, so an already-stored ref is never
 * overwritten by a later one. That is the most faithful reading of SPEC.md
 * §7's "issu du parrainage de <id>" — the ref is cleared once a submission
 * actually uses it (`clearRefId`), so a second Tour starts from a clean
 * slate rather than inheriting the first one's credit.
 *
 * Switching to last-touch later is a one-line change here; the policy is
 * deliberately in one place rather than spread across the call sites.
 */
export function saveRefId(refId: string): void {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(REF_STORAGE_KEY)) return;
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
  /**
   * The 15 answers behind this result (REVIEW.md R-12), kept so the owner can
   * be shown how their score was calculated.
   *
   * Client-side ON PURPOSE: the answers say more about a business than the
   * score does ("no idea what our CAC is"), and `/r/<id>` is a public page.
   * Keeping them here rather than sending them from the server means they
   * never enter the RSC payload of a shared link at all — the same reasoning
   * as R-02, applied before the problem exists rather than after.
   *
   * Optional: entries written before R-12 don't have it, and a result with
   * no stored answers simply shows no breakdown.
   */
  answers?: Answers;
  /**
   * The score this result came out at (REVIEW.md R-20), so the landing can
   * offer "your last score: 74/100" without a network round trip — and
   * without needing the result id to already be in the URL.
   *
   * Optional for the same reason as `answers`: entries written before R-20
   * don't have it, and the landing then falls back to an unnumbered "see
   * your last result" link rather than showing nothing.
   */
  total?: number;
}

function isStoredResult(value: unknown): value is StoredResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== "string" || typeof v.ownerToken !== "string" || typeof v.createdAt !== "string") return false;
  // Both optional (pre-R-12 / pre-R-20 entries), but must be the right shape
  // when present.
  if (v.answers !== undefined && !isAnswersShape(v.answers)) return false;
  return v.total === undefined || (typeof v.total === "number" && Number.isFinite(v.total));
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

/** The full stored entry for a result this browser created, or null for someone else's link. */
export function findStoredResult(id: string): StoredResult | null {
  return loadStoredResults().find((r) => r.id === id) ?? null;
}

/**
 * Deep dive progress — REVIEW.md R-20.
 *
 * The Deep dive was deliberately NOT persisted when it shipped (see the note
 * at the top of `deep-dive/[id]/page.tsx`): a short optional flow, not the
 * "never lose your answers" promise SPEC.md §4 makes about the 15 core
 * questions. It grew since: 10 questions, then an 11th free-text screen, and
 * a generation that can take a minute. Losing all of that to a stray reload
 * is no longer a small cost.
 *
 * One entry, not a list: this is in-flight progress for a single Deep dive,
 * so a newer one simply replaces it. It is keyed by submission id and only
 * returned for a matching id, so progress from one result can never leak
 * into another's.
 *
 * Cleared as soon as the Deep dive succeeds — `freeContext` is a founder
 * describing their business in their own words, and there is no reason for
 * it to outlive the request it was written for.
 */
const DEEP_DIVE_STORAGE_KEY = "tdg.deepDive.v1";

export interface StoredDeepDiveProgress {
  submissionId: string;
  /** Question id → chosen option index. Partial while in progress. */
  answers: Record<string, number>;
  freeContext: string;
}

function isDeepDiveProgress(value: unknown): value is StoredDeepDiveProgress {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.submissionId !== "string" || typeof v.freeContext !== "string") return false;
  if (typeof v.answers !== "object" || v.answers === null || Array.isArray(v.answers)) return false;
  return Object.values(v.answers as Record<string, unknown>).every(
    (n) => typeof n === "number" && Number.isInteger(n) && n >= 0,
  );
}

export function loadDeepDiveProgress(submissionId: string): StoredDeepDiveProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEEP_DIVE_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isDeepDiveProgress(parsed)) return null;
    return parsed.submissionId === submissionId ? parsed : null;
  } catch {
    return null;
  }
}

export function saveDeepDiveProgress(progress: StoredDeepDiveProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEEP_DIVE_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Same trade-off as everywhere else in this file: not persisting is a
    // degraded experience, never a crash.
  }
}

export function clearDeepDiveProgress(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DEEP_DIVE_STORAGE_KEY);
  } catch {
    // ignore
  }
}
