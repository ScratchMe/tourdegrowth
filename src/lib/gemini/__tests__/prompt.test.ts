import { describe, expect, it } from "vitest";
import { buildGeminiPrompt, type PromptAnswer } from "../prompt";
import type { PillarScore } from "@/lib/scoring/score";

const pillars: PillarScore[] = [
  { pillar: "acquisition", rawPoints: 53, score: 18 },
  { pillar: "activation", rawPoints: 34, score: 11 },
  { pillar: "retention", rawPoints: 13, score: 4 },
  { pillar: "referral", rawPoints: 47, score: 16 },
  { pillar: "revenue", rawPoints: 60, score: 20 },
];

const answers: PromptAnswer[] = [
  { pillar: "acquisition", question: "Do you have a primary acquisition channel?", answer: "Yes, identified and measured" },
];

function baseInput(overrides: Partial<Parameters<typeof buildGeminiPrompt>[0]> = {}) {
  return {
    locale: "en" as const,
    tone: "neutral" as const,
    pillars,
    total: 69,
    weakestPillar: "retention" as const,
    answers,
    ...overrides,
  };
}

describe("buildGeminiPrompt", () => {
  it("includes the anti-mockery guardrail for roast, in both locales", () => {
    const en = buildGeminiPrompt(baseInput({ tone: "roast", locale: "en" }));
    const fr = buildGeminiPrompt(baseInput({ tone: "roast", locale: "fr" }));

    expect(en).toMatch(/NEVER mock the person/i);
    expect(fr).toMatch(/ne te moque JAMAIS de la personne/i);
  });

  it("does not include the roast calibration/guardrail block for the neutral tone", () => {
    const en = buildGeminiPrompt(baseInput({ tone: "neutral", locale: "en" }));
    expect(en).not.toMatch(/NEVER mock the person/i);
    expect(en).not.toMatch(/Franco-English/i);
  });

  it("instructs the model that scores are final and must not be altered", () => {
    const prompt = buildGeminiPrompt(baseInput());
    expect(prompt).toMatch(/FINAL/);
    expect(prompt).toMatch(/never recompute/i);
  });

  it("includes every pillar score, the total, and the weakest pillar", () => {
    const prompt = buildGeminiPrompt(baseInput());
    expect(prompt).toContain("acquisition: 18/20");
    expect(prompt).toContain("activation: 11/20");
    expect(prompt).toContain("retention: 4/20");
    expect(prompt).toContain("referral: 16/20");
    expect(prompt).toContain("revenue: 20/20");
    expect(prompt).toContain("Total: 69/100");
    expect(prompt).toContain("Weakest pillar: retention");
  });

  it("includes the question/answer pairs given", () => {
    const prompt = buildGeminiPrompt(baseInput());
    expect(prompt).toContain("Do you have a primary acquisition channel?");
    expect(prompt).toContain("Yes, identified and measured");
  });

  it("asks for a JSON-only response matching the headline/strengths/weaknesses/recommendation schema", () => {
    const prompt = buildGeminiPrompt(baseInput());
    expect(prompt).toMatch(/ONLY a valid JSON object/i);
    expect(prompt).toContain('"headline"');
    expect(prompt).toContain('"strengths"');
    expect(prompt).toContain('"weaknesses"');
    expect(prompt).toContain('"recommendation"');
  });

  it("switches every instructional block to French for locale fr", () => {
    const prompt = buildGeminiPrompt(baseInput({ locale: "fr" }));
    expect(prompt).toMatch(/consultant growth senior/);
    expect(prompt).toMatch(/DÉFINITIFS/);
    expect(prompt).toMatch(/UNIQUEMENT avec un objet JSON valide/);
  });
});
