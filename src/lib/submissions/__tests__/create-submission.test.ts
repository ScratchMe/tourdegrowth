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
      { answers: fullAnswers(0), tone: "neutral", locale: "en", refId: null, segment: null },
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

    await createSubmissionFlow({ answers: fullAnswers(0), tone: "neutral", locale: "fr", refId: null, segment: null }, deps);

    expect(deps.saved[0]).not.toHaveProperty("verdicts");
    // Nothing French should have made it into a document created by a French
    // author — the language belongs to the render, not to the record.
    expect(JSON.stringify(deps.saved[0])).not.toMatch(/[àâäéèêëïîôöùûüç]/i);
  });

  // REVIEW.md R-01.
  it("returns the owner token once and persists only its hash", async () => {
    const deps = fakeDeps();

    const { submission, ownerToken } = await createSubmissionFlow(
      { answers: fullAnswers(0), tone: "neutral", locale: "en", refId: null, segment: null },
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
      { answers: fullAnswers(1), tone: "roast", locale: "fr", refId: "sub_referrer", segment: null },
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
      createSubmissionFlow({ answers: incomplete, tone: "neutral", locale: "en", refId: null, segment: null }, deps),
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
    { answers: fullAnswers(1), tone: "neutral", locale: "en", refId: null, segment: null },
    deps,
  );
  return submission;
}

describe("completeDeepDiveFlow (Deep dive — still calls Gemini)", () => {
  it("generates every tone in every language, and never touches the score", async () => {
    const submission = await baseSubmission();
    const deps = fakeDeepDiveDeps();

    const result = await completeDeepDiveFlow(
      { submission, contextAnswerIndices: fullContextAnswers(), locale: "en" },
      deps,
    );

    expect(result.completed).toBe(true);
    expect(result.verdicts.neutral.priorityAction).toBe("Instrument week-4 retention by cohort this month.");
    expect(result.verdicts.roast.priorityAction).toBe("Instrument week-4 retention by cohort this month.");

    // 2 tones x 2 languages. Gemini output cannot be re-resolved per request
    // the way a copy-library lookup can, so a reader's language has to be
    // generated up front — exactly as both tones already were.
    expect(deps.callGemini).toHaveBeenCalledTimes(4);
    expect(result.locale).toBe("en");
    expect(Object.keys(result.localized ?? {}).sort()).toEqual(["en", "fr"]);
    // REVIEW-02.md R2-20: the resolved context answers are prompt material, not a stored field.
    expect(result).not.toHaveProperty("contextAnswers");
  });

  it("keeps the completion language when another one fails, rather than losing the whole Deep dive", async () => {
    const submission = await baseSubmission();
    const deps = fakeDeepDiveDeps();
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    // Only the French prompts fail. The author answered ten extra questions;
    // a flaky second generation must not cost them the result.
    (deps.callGemini as ReturnType<typeof vi.fn>).mockImplementation(async (prompt: string) => {
      if (prompt.includes("As-tu un canal d'acquisition principal")) throw new Error("Gemini unavailable");
      return { data: geminiJson(), modelUsed: "gemini-3.6-flash" };
    });

    const result = await completeDeepDiveFlow(
      { submission, contextAnswerIndices: fullContextAnswers(), locale: "en" },
      deps,
    );

    expect(result.verdicts.neutral.priorityAction).toBeTruthy();
    expect(Object.keys(result.localized ?? {})).toEqual(["en"]);
    expect(errors).toHaveBeenCalled();
    errors.mockRestore();
  });

  it("fails the whole thing when the COMPLETION language fails — the fail-closed contract is unchanged", async () => {
    const submission = await baseSubmission();
    const deps = fakeDeepDiveDeps();
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    (deps.callGemini as ReturnType<typeof vi.fn>).mockImplementation(async (prompt: string) => {
      if (prompt.includes("Do you have a primary acquisition channel")) throw new Error("Gemini unavailable");
      return { data: geminiJson(), modelUsed: "gemini-3.6-flash" };
    });

    await expect(
      completeDeepDiveFlow({ submission, contextAnswerIndices: fullContextAnswers(), locale: "en" }, deps),
    ).rejects.toThrow("Gemini unavailable");
    errors.mockRestore();
  });

  it("sends a prompt containing both the original Quick answers and the Deep dive context answers", async () => {
    const submission = await baseSubmission();
    const deps = fakeDeepDiveDeps();

    await completeDeepDiveFlow({ submission, contextAnswerIndices: fullContextAnswers(), locale: "en" }, deps);

    const prompts = (deps.callGemini as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0] as string);

    // Each prompt is resolved entirely in the language it generates — the
    // Quick questions, the chosen answers and the Deep dive context labels
    // together, never one language's questions under another's instructions.
    const english = prompts.filter((p) => p.includes("Do you have a primary acquisition channel"));
    const french = prompts.filter((p) => p.includes("As-tu un canal d'acquisition principal"));

    expect(english).toHaveLength(2);
    expect(french).toHaveLength(2);
    for (const prompt of english) expect(prompt).toContain("What's your primary acquisition channel today?");
    for (const prompt of french) expect(prompt).toContain("Quel est ton canal d'acquisition principal aujourd'hui ?");
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

    // REVIEW-02.md R2-20: what is kept is THAT it was provided, never the text.
    expect(result.freeContextProvided).toBe(true);
    expect(result).not.toHaveProperty("freeContext");
    const calls = (deps.callGemini as ReturnType<typeof vi.fn>).mock.calls;
    for (const call of calls) {
      expect(call[0] as string).toContain("We sell to accounting firms, long sales cycle.");
    }
  });

  it("records no context and sends no free-context block when freeContext is omitted, empty, or whitespace-only", async () => {
    const submission = await baseSubmission();

    for (const value of [undefined, null, "", "   "]) {
      const deps = fakeDeepDiveDeps();
      const result = await completeDeepDiveFlow(
        { submission, contextAnswerIndices: fullContextAnswers(), locale: "en", freeContext: value },
        deps,
      );
      expect(result.freeContextProvided).toBe(false);
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

    await completeDeepDiveFlow(
      { submission, contextAnswerIndices: fullContextAnswers(), locale: "en", freeContext: tooLong },
      deps,
    );

    // The text is no longer stored (R2-20), so the truncation shows in what
    // reaches the prompt: 500 characters, never 501.
    const prompt = (deps.callGemini as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
    expect(prompt).toContain("x".repeat(500));
    expect(prompt).not.toContain("x".repeat(501));
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
