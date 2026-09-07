import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetRateLimitsForTests } from "@/lib/rate-limit";
import { DEEP_MODE_QUESTIONS } from "@/content/deep-mode-questions";
import { QUESTIONS } from "@/content/copy-library";
import { PILLARS } from "@/lib/scoring/pillars";
import { hashOwnerToken } from "@/lib/submissions/owner-token";
import type { Submission } from "@/lib/submissions/types";

const getSubmissionById = vi.fn();
const invalidateSubmission = vi.fn();
const saveDeepDive = vi.fn<(id: string, deepDive: unknown) => Promise<void>>(async () => {});
const callGeminiWithFallback = vi.fn();

vi.mock("@/lib/submissions/cached-repository", () => ({
  invalidateSubmission: (id: string) => invalidateSubmission(id),
}));

vi.mock("@/lib/submissions/repository", () => ({
  getSubmissionById: (id: string) => getSubmissionById(id),
  saveDeepDive: (id: string, deepDive: unknown) => saveDeepDive(id, deepDive),
}));

vi.mock("@/lib/gemini/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/gemini/client")>();
  return { ...actual, callGeminiWithFallback: (prompt: string) => callGeminiWithFallback(prompt) };
});

const { POST } = await import("../route");

const OWNER_TOKEN = "the-real-owner-token";
const FREE_CONTEXT = "We sell to accounting firms; trust is the blocker.";

function submission(overrides: Partial<Submission> = {}): Submission {
  return {
    id: "sub_1",
    createdAt: "2026-09-05T10:00:00.000Z",
    locale: "en",
    tone: "neutral",
    answers: Object.fromEntries(QUESTIONS.map((q) => [q.id, 1])) as Submission["answers"],
    pillars: PILLARS.map((pillar) => ({ pillar, rawPoints: 21, score: 7 })),
    total: 35,
    weakestPillar: "acquisition",
    refId: null,
    segment: null,
    ownerTokenHash: hashOwnerToken(OWNER_TOKEN),
    deepDive: null,
    ...overrides,
  };
}

function geminiResponse() {
  const body = {
    pillarRecommendations: Object.fromEntries(PILLARS.map((p) => [p, `Do something about ${p}.`])),
    priorityAction: "Instrument week-4 retention by cohort.",
  };
  return { data: { candidates: [{ content: { parts: [{ text: JSON.stringify(body) }] } }] }, modelUsed: "gemini-3.6-flash" };
}

function request(body: Record<string, unknown>): Request {
  return new Request("https://tourdegrowth.com/api/submissions/sub_1/deep-dive", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  contextAnswers: Object.fromEntries(DEEP_MODE_QUESTIONS.map((q) => [q.id, 0])),
  locale: "en",
  freeContext: FREE_CONTEXT,
};

function call(body: Record<string, unknown>) {
  return POST(request(body), { params: Promise.resolve({ id: "sub_1" }) });
}

/**
 * REVIEW.md R-01/R-02 — the Deep dive route is the one place where knowing a
 * (public, shareable) result id used to be enough to write to someone else's
 * result, irreversibly.
 */
describe("POST /api/submissions/[id]/deep-dive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // The rate limiter is module-level state (REVIEW.md R-15) — without this
    // the suite would eventually rate-limit itself.
    resetRateLimitsForTests();
    process.env.GEMINI_API_KEY = "test-key";
    getSubmissionById.mockResolvedValue(submission());
    callGeminiWithFallback.mockResolvedValue(geminiResponse());
  });

  it("rejects a request with no owner token at all", async () => {
    const res = await call(validBody);

    expect(res.status).toBe(403);
    expect(callGeminiWithFallback).not.toHaveBeenCalled();
    expect(saveDeepDive).not.toHaveBeenCalled();
  });

  it("rejects the wrong owner token", async () => {
    const res = await call({ ...validBody, ownerToken: "a-token-from-another-result" });

    expect(res.status).toBe(403);
    expect(saveDeepDive).not.toHaveBeenCalled();
  });

  it("rejects a non-string owner token", async () => {
    expect((await call({ ...validBody, ownerToken: { not: "a string" } })).status).toBe(403);
    expect((await call({ ...validBody, ownerToken: 42 })).status).toBe(403);
    expect(saveDeepDive).not.toHaveBeenCalled();
  });

  it("fails closed on a submission created before owner tokens existed", async () => {
    getSubmissionById.mockResolvedValue(submission({ ownerTokenHash: null }));

    const res = await call({ ...validBody, ownerToken: OWNER_TOKEN });

    expect(res.status).toBe(403);
    expect(saveDeepDive).not.toHaveBeenCalled();
  });

  it("runs the Deep dive for the real owner", async () => {
    const res = await call({ ...validBody, ownerToken: OWNER_TOKEN });

    expect(res.status).toBe(200);
    // One call per tone AND per language: both tones so the tone switch stays
    // instant (SPEC-ADDENDUM-01.md §2), both languages so a reader gets the
    // Deep dive in theirs. Gemini output cannot be re-resolved per request the
    // way the Quick copy-library lookup can. (SPEC-ADDENDUM-01.md §2 — both tones generated at once).
    expect(callGeminiWithFallback).toHaveBeenCalledTimes(4);
    expect(saveDeepDive).toHaveBeenCalledWith("sub_1", expect.objectContaining({ completed: true }));
    // REVIEW.md R-14: the enriched result must not stay behind a cached copy.
    expect(invalidateSubmission).toHaveBeenCalledWith("sub_1");
  });

  it("returns only the id, never the submission or the free-text context", async () => {
    const res = await call({ ...validBody, ownerToken: OWNER_TOKEN });
    const payload = await res.json();

    expect(payload).toEqual({ id: "sub_1" });
    expect(JSON.stringify(payload)).not.toContain("accounting firms");
  });

  it("stays idempotent for the owner, without a second Gemini call or a rewrite", async () => {
    getSubmissionById.mockResolvedValue(
      submission({ deepDive: { completed: true, contextAnswers: {}, freeContext: FREE_CONTEXT, verdicts: {} } as never }),
    );

    const res = await call({ ...validBody, ownerToken: OWNER_TOKEN });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "sub_1" });
    expect(callGeminiWithFallback).not.toHaveBeenCalled();
    expect(saveDeepDive).not.toHaveBeenCalled();
    expect(invalidateSubmission).not.toHaveBeenCalled();
  });

  it("still 404s on an unknown id, ownership aside", async () => {
    getSubmissionById.mockResolvedValue(null);

    const res = await call({ ...validBody, ownerToken: OWNER_TOKEN });

    expect(res.status).toBe(404);
  });

  // REVIEW.md R-04.
  it("never forwards Gemini's raw response or any internal message to the browser", async () => {
    callGeminiWithFallback.mockRejectedValue(
      new Error('Unexpected Gemini response shape: {"promptFeedback":{"blockReason":"SAFETY"}}'),
    );

    const res = await call({ ...validBody, ownerToken: OWNER_TOKEN });
    const payload = await res.json();

    expect(res.status).toBe(502);
    expect(payload).toEqual({ error: "DEEP_DIVE_FAILED" });
    expect(JSON.stringify(payload)).not.toContain("blockReason");
    expect(saveDeepDive).not.toHaveBeenCalled();
  });

  it("turns a Firestore outage into the app's own error contract, not a bare 500", async () => {
    getSubmissionById.mockRejectedValue(new Error("7 PERMISSION_DENIED: Missing or insufficient permissions."));

    const res = await call({ ...validBody, ownerToken: OWNER_TOKEN });
    const payload = await res.json();

    expect(res.status).toBe(502);
    expect(payload).toEqual({ error: "DEEP_DIVE_FAILED" });
    expect(JSON.stringify(payload)).not.toContain("PERMISSION_DENIED");
  });

  // REVIEW.md R-15: each of these costs four Gemini generations (two tones x
  // two languages), so the budget is tighter than the submission one.
  it("refuses a caller who keeps hammering, before spending any Gemini call", async () => {
    for (let i = 0; i < 5; i += 1) await call({ ...validBody, ownerToken: OWNER_TOKEN });

    // Asserted as "the refused call spent nothing", not as a call-count
    // ceiling: the cost per Deep dive is a product decision that has already
    // changed once, and the property worth pinning is that the gate runs
    // BEFORE Gemini.
    const spentBefore = callGeminiWithFallback.mock.calls.length;
    const refused = await call({ ...validBody, ownerToken: OWNER_TOKEN });

    expect(refused.status).toBe(429);
    expect(Number(refused.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect(callGeminiWithFallback.mock.calls.length).toBe(spentBefore);
  });

  it("still validates the payload before anything else", async () => {
    const res = await call({ contextAnswers: { "deep-acq-1": 0 }, locale: "en", ownerToken: OWNER_TOKEN });

    expect(res.status).toBe(400);
    expect(getSubmissionById).not.toHaveBeenCalled();
  });
});
