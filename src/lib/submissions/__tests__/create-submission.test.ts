import { describe, expect, it, vi } from "vitest";
import { QUESTIONS } from "@/lib/scoring/questions";
import type { AnswerIndex, Answers } from "@/lib/scoring/score";
import { createSubmissionFlow, type CreateSubmissionDeps } from "../create-submission";
import type { Submission } from "../types";

function fullAnswers(value: AnswerIndex): Answers {
  const answers: Answers = {};
  QUESTIONS.forEach((q) => {
    answers[q.id] = value;
  });
  return answers;
}

function geminiJson(overrides: Record<string, unknown> = {}) {
  const body = {
    headline: "Solid engine, one flat tyre.",
    strengths: ["Strong acquisition discipline.", "Revenue model is validated."],
    weaknesses: ["Retention isn't tracked.", "No re-engagement mechanism."],
    recommendation: "Set up a D7/D30 retention dashboard before anything else.",
    ...overrides,
  };
  return { candidates: [{ content: { parts: [{ text: JSON.stringify(body) }] } }] };
}

function fakeDeps(overrides: Partial<CreateSubmissionDeps> = {}): CreateSubmissionDeps & {
  saved: Submission[];
} {
  const saved: Submission[] = [];
  return {
    callGemini: vi.fn(async () => ({ data: geminiJson(), modelUsed: "gemini-3.7-flash" })),
    saveSubmission: vi.fn(async (s: Submission) => {
      saved.push(s);
    }),
    generateId: () => "sub_123",
    now: () => new Date("2026-08-27T12:00:00.000Z"),
    saved,
    ...overrides,
  };
}

const expectedVerdict = {
  headline: "Solid engine, one flat tyre.",
  strengths: ["Strong acquisition discipline.", "Revenue model is validated."],
  weaknesses: ["Retention isn't tracked.", "No re-engagement mechanism."],
  recommendation: "Set up a D7/D30 retention dashboard before anything else.",
  modelUsed: "gemini-3.7-flash",
};

describe("createSubmissionFlow", () => {
  it("computes the score, gets a verdict for BOTH tones, and saves the full submission", async () => {
    const deps = fakeDeps();

    const result = await createSubmissionFlow(
      { answers: fullAnswers(3), tone: "neutral", locale: "en", refId: null },
      deps,
    );

    expect(result.id).toBe("sub_123");
    expect(result.createdAt).toBe("2026-08-27T12:00:00.000Z");
    expect(result.total).toBe(100);
    expect(result.pillars).toHaveLength(5);
    expect(result.verdicts.neutral).toEqual(expectedVerdict);
    expect(result.verdicts.roast).toEqual(expectedVerdict);
    expect(deps.saved).toEqual([result]);
    // one Gemini call per tone, not one shared call
    expect(deps.callGemini).toHaveBeenCalledTimes(2);
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

  it("sends a prompt to Gemini containing the resolved question/answer text at the requested locale, for both tones", async () => {
    const deps = fakeDeps();
    await createSubmissionFlow({ answers: fullAnswers(3), tone: "neutral", locale: "fr", refId: null }, deps);

    const calls = (deps.callGemini as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls).toHaveLength(2);
    for (const call of calls) {
      const promptSent = call[0] as string;
      expect(promptSent).toContain("As-tu un canal d'acquisition principal identifié et mesuré ?");
      expect(promptSent).toContain("Oui, identifié et mesuré");
    }
  });

  it("never calls Gemini or saves anything when the answers are incomplete", async () => {
    const deps = fakeDeps();
    const incomplete: Answers = { "acquisition-1": 2 };

    await expect(
      createSubmissionFlow({ answers: incomplete, tone: "neutral", locale: "en", refId: null }, deps),
    ).rejects.toThrow();

    expect(deps.callGemini).not.toHaveBeenCalled();
    expect(deps.saveSubmission).not.toHaveBeenCalled();
  });

  it("propagates a Gemini failure and saves nothing (no partial submission)", async () => {
    const deps = fakeDeps({
      callGemini: vi.fn(async () => {
        throw new Error("All Gemini model candidates failed.");
      }),
    });

    await expect(
      createSubmissionFlow({ answers: fullAnswers(2), tone: "neutral", locale: "en", refId: null }, deps),
    ).rejects.toThrow(/All Gemini model candidates failed/);

    expect(deps.saveSubmission).not.toHaveBeenCalled();
  });

  it("propagates a malformed Gemini verdict and saves nothing", async () => {
    const deps = fakeDeps({
      callGemini: vi.fn(async () => ({ data: geminiJson({ recommendation: undefined }), modelUsed: "m" })),
    });

    await expect(
      createSubmissionFlow({ answers: fullAnswers(2), tone: "neutral", locale: "en", refId: null }, deps),
    ).rejects.toThrow(/recommendation/);

    expect(deps.saveSubmission).not.toHaveBeenCalled();
  });
});
