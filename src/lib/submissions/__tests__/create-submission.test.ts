import { describe, expect, it, vi } from "vitest";
import { DEEP_MODE_QUESTIONS } from "@/content/deep-mode-questions";
import { QUESTIONS } from "@/lib/scoring/questions";
import type { AnswerIndex, Answers } from "@/lib/scoring/score";
import {
  completeDeepDiveFlow,
  createSubmissionFlow,
  type CompleteDeepDiveDeps,
  type CreateSubmissionDeps,
  type DeepDiveAnswers,
} from "../create-submission";
import { hashOwnerToken, verifyOwnerToken } from "../owner-token";
import type { Submission } from "../types";

function fullAnswers(value: AnswerIndex): Answers {
  const answers: Answers = {};
  QUESTIONS.forEach((q) => {
    answers[q.id] = value;
  });
  return answers;
}

function fullContextAnswers(value = 0): DeepDiveAnswers {
  const answers: DeepDiveAnswers = {};
  DEEP_MODE_QUESTIONS.forEach((q) => {
    answers[q.id] = value;
  });
  return answers;
}

function fakeDeps(overrides: Partial<CreateSubmissionDeps> = {}): CreateSubmissionDeps & { saved: Submission[] } {
  const saved: Submission[] = [];
  return {
    saveSubmission: vi.fn(async (s: Submission) => {
      saved.push(s);
    }),
    generateId: () => "sub_123",
    generateOwnerToken: () => "owner-token-abc",
    now: () => new Date("2026-08-27T12:00:00.000Z"),
    saved,
    ...overrides,
  };
}

describe("createSubmissionFlow (Quick mode — deterministic, no Gemini)", () => {
  it("computes the score and saves the submission", async () => {
    const deps = fakeDeps();

    const { submission } = await createSubmissionFlow(
      { answers: fullAnswers(0), tone: "neutral", locale: "en", refId: null },
      deps,
    );

    expect(submission.id).toBe("sub_123");
    expect(submission.createdAt).toBe("2026-08-27T12:00:00.000Z");
    expect(submission.total).toBe(100);
    expect(submission.pillars).toHaveLength(5);
    expect(submission.deepDive).toBeNull();

    expect(deps.saved).toEqual([submission]);
  });

  // REVIEW.md R-09: the verdict follows the reader, so it can no longer be
  // frozen into the document at the author's locale.
  it("stores no verdict text at all — it is derived per reader", async () => {
    const deps = fakeDeps();

    await createSubmissionFlow({ answers: fullAnswers(0), tone: "neutral", locale: "fr", refId: null }, deps);

    expect(deps.saved[0]).not.toHaveProperty("verdicts");
    // Nothing French should have made it into a document created by a French
    // author — the language belongs to the render, not to the record.
    expect(JSON.stringify(deps.saved[0])).not.toMatch(/[àâäéèêëïîôöùûüç]/i);
  });

  // REVIEW.md R-01.
  it("returns the owner token once and persists only its hash", async () => {
    const deps = fakeDeps();

    const { submission, ownerToken } = await createSubmissionFlow(
      { answers: fullAnswers(0), tone: "neutral", locale: "en", refId: null },
      deps,
    );

    expect(ownerToken).toBe("owner-token-abc");
    expect(submission.ownerTokenHash).toBe(hashOwnerToken("owner-token-abc"));
    // The secret itself must never be anywhere in what gets stored.
    expect(JSON.stringify(deps.saved[0])).not.toContain("owner-token-abc");
    expect(verifyOwnerToken(ownerToken, submission.ownerTokenHash)).toBe(true);
    expect(verifyOwnerToken("some-other-token", submission.ownerTokenHash)).toBe(false);
  });

  it("passes refId and the selected tone through untouched", async () => {
    const deps = fakeDeps();
    const { submission } = await createSubmissionFlow(
      { answers: fullAnswers(1), tone: "roast", locale: "fr", refId: "sub_referrer" },
      deps,
    );
    expect(submission.refId).toBe("sub_referrer");
    expect(submission.tone).toBe("roast");
    expect(submission.locale).toBe("fr");
  });

  it("never saves anything when the answers are incomplete", async () => {
    const deps = fakeDeps();
    const incomplete: Answers = { "acq-1": 1 };

    await expect(
      createSubmissionFlow({ answers: incomplete, tone: "neutral", locale: "en", refId: null }, deps),
    ).rejects.toThrow();

    expect(deps.saveSubmission).not.toHaveBeenCalled();
  });
});

function geminiJson(overrides: Record<string, unknown> = {}) {
  const body = {
    pillarRecommendations: {
      acquisition: "Specific acquisition recommendation.",
      activation: "Specific activation recommendation.",
      retention: "Specific retention recommendation.",
      referral: "Specific referral recommendation.",
      revenue: "Specific revenue recommendation.",
    },
    priorityAction: "Instrument week-4 retention by cohort this month.",
    ...overrides,
  };
  return { candidates: [{ content: { parts: [{ text: JSON.stringify(body) }] } }] };
}

function fakeDeepDiveDeps(overrides: Partial<CompleteDeepDiveDeps> = {}): CompleteDeepDiveDeps {
  return {
    callGemini: vi.fn(async () => ({ data: geminiJson(), modelUsed: "gemini-3.7-flash" })),
    ...overrides,
  };
}

async function baseSubmission(): Promise<Submission> {
  const deps = fakeDeps();
  const { submission } = await createSubmissionFlow(
    { answers: fullAnswers(1), tone: "neutral", locale: "en", refId: null },
    deps,
  );
  return submission;
}

describe("completeDeepDiveFlow (Deep dive — still calls Gemini)", () => {
  it("calls Gemini once per tone and returns the enriched verdicts, never touching the score", async () => {
    const submission = await baseSubmission();
    const deps = fakeDeepDiveDeps();

    const result = await completeDeepDiveFlow(
      { submission, contextAnswerIndices: fullContextAnswers(), locale: "en" },
      deps,
    );

    expect(result.completed).toBe(true);
    expect(result.verdicts.neutral.priorityAction).toBe("Instrument week-4 retention by cohort this month.");
    expect(result.verdicts.roast.priorityAction).toBe("Instrument week-4 retention by cohort this month.");
    expect(deps.callGemini).toHaveBeenCalledTimes(2);
    expect(Object.keys(result.contextAnswers)).toHaveLength(DEEP_MODE_QUESTIONS.length);
  });

  it("sends a prompt containing both the original Quick answers and the Deep dive context answers", async () => {
    const submission = await baseSubmission();
    const deps = fakeDeepDiveDeps();

    await completeDeepDiveFlow({ submission, contextAnswerIndices: fullContextAnswers(), locale: "en" }, deps);

    const calls = (deps.callGemini as ReturnType<typeof vi.fn>).mock.calls;
    for (const call of calls) {
      const promptSent = call[0] as string;
      expect(promptSent).toContain("Do you have a primary acquisition channel");
      expect(promptSent).toContain("What's your primary acquisition channel today?");
    }
  });

  it("stores the free-text context on the result and forwards it into the Gemini prompt (SPEC-ADDENDUM-02.md §1)", async () => {
    const submission = await baseSubmission();
    const deps = fakeDeepDiveDeps();

    const result = await completeDeepDiveFlow(
      {
        submission,
        contextAnswerIndices: fullContextAnswers(),
        locale: "en",
        freeContext: "We sell to accounting firms, long sales cycle.",
      },
      deps,
    );

    expect(result.freeContext).toBe("We sell to accounting firms, long sales cycle.");
    const calls = (deps.callGemini as ReturnType<typeof vi.fn>).mock.calls;
    for (const call of calls) {
      expect(call[0] as string).toContain("We sell to accounting firms, long sales cycle.");
    }
  });

  it("stores null and sends no free-context block when freeContext is omitted, empty, or whitespace-only", async () => {
    const submission = await baseSubmission();

    for (const value of [undefined, null, "", "   "]) {
      const deps = fakeDeepDiveDeps();
      const result = await completeDeepDiveFlow(
        { submission, contextAnswerIndices: fullContextAnswers(), locale: "en", freeContext: value },
        deps,
      );
      expect(result.freeContext).toBeNull();
      const calls = (deps.callGemini as ReturnType<typeof vi.fn>).mock.calls;
      for (const call of calls) {
        expect(call[0] as string).not.toContain("User-provided business context");
      }
    }
  });

  it("truncates an over-long freeContext defensively, even if the API route's own truncation were bypassed", async () => {
    const submission = await baseSubmission();
    const deps = fakeDeepDiveDeps();
    const tooLong = "x".repeat(600);

    const result = await completeDeepDiveFlow(
      { submission, contextAnswerIndices: fullContextAnswers(), locale: "en", freeContext: tooLong },
      deps,
    );

    expect(result.freeContext).toHaveLength(500);
  });

  it("propagates a Gemini failure without persisting (persistence is the caller's job)", async () => {
    const submission = await baseSubmission();
    const deps = fakeDeepDiveDeps({
      callGemini: vi.fn(async () => {
        throw new Error("All Gemini model candidates failed.");
      }),
    });

    await expect(
      completeDeepDiveFlow({ submission, contextAnswerIndices: fullContextAnswers(), locale: "en" }, deps),
    ).rejects.toThrow(/All Gemini model candidates failed/);
  });

  it("propagates a malformed Gemini verdict", async () => {
    const submission = await baseSubmission();
    const deps = fakeDeepDiveDeps({
      callGemini: vi.fn(async () => ({ data: geminiJson({ priorityAction: undefined }), modelUsed: "m" })),
    });

    await expect(
      completeDeepDiveFlow({ submission, contextAnswerIndices: fullContextAnswers(), locale: "en" }, deps),
    ).rejects.toThrow(/priorityAction/);
  });
});
