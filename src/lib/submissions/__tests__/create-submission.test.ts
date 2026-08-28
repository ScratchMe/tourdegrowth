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
    now: () => new Date("2026-08-27T12:00:00.000Z"),
    saved,
    ...overrides,
  };
}

describe("createSubmissionFlow (Quick mode — deterministic, no Gemini)", () => {
  it("computes the score, resolves both tones' verdicts from the copy library, and saves the submission", async () => {
    const deps = fakeDeps();

    const result = await createSubmissionFlow(
      { answers: fullAnswers(0), tone: "neutral", locale: "en", refId: null },
      deps,
    );

    expect(result.id).toBe("sub_123");
    expect(result.createdAt).toBe("2026-08-27T12:00:00.000Z");
    expect(result.total).toBe(100);
    expect(result.pillars).toHaveLength(5);
    expect(result.deepDive).toBeNull();

    // Every pillar answered "best" (index 0, 20pts) -> every pillar is "strong".
    expect(result.verdicts.neutral.pillarSentences.acquisition.length).toBeGreaterThan(0);
    expect(result.verdicts.roast.pillarSentences.acquisition.length).toBeGreaterThan(0);
    expect(result.verdicts.neutral.headline.length).toBeGreaterThan(0);

    expect(deps.saved).toEqual([result]);
  });

  it("passes refId and the selected tone through untouched", async () => {
    const deps = fakeDeps();
    const result = await createSubmissionFlow(
      { answers: fullAnswers(1), tone: "roast", locale: "fr", refId: "sub_referrer" },
      deps,
    );
    expect(result.refId).toBe("sub_referrer");
    expect(result.tone).toBe("roast");
    expect(result.locale).toBe("fr");
  });

  it("resolves the FR verdict in French", async () => {
    const deps = fakeDeps();
    const result = await createSubmissionFlow(
      { answers: fullAnswers(2), tone: "neutral", locale: "fr", refId: null },
      deps,
    );
    // Every pillar at its worst band (index 2, 0pts) -> "weak" band sentences, in French.
    expect(result.verdicts.neutral.pillarSentences.retention).toMatch(/[àâäéèêëïîôöùûüç]/i);
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
  return createSubmissionFlow({ answers: fullAnswers(1), tone: "neutral", locale: "en", refId: null }, deps);
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
