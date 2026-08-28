import { describe, expect, it } from "vitest";
import { buildDeepDivePrompt, type PromptAnswer } from "../prompt";
import type { PillarScore } from "@/lib/scoring/score";

const pillars: PillarScore[] = [
  { pillar: "acquisition", rawPoints: 47, score: 16 },
  { pillar: "activation", rawPoints: 14, score: 5 },
  { pillar: "retention", rawPoints: 7, score: 2 },
  { pillar: "referral", rawPoints: 47, score: 16 },
  { pillar: "revenue", rawPoints: 60, score: 20 },
];

const quickAnswers: PromptAnswer[] = [
  { pillar: "acquisition", question: "Do you have a primary acquisition channel?", answer: "Yes, clearly identified and tracked" },
];

const contextAnswers: PromptAnswer[] = [
  { pillar: "acquisition", question: "What's your primary acquisition channel today?", answer: "SEO / content" },
];

function baseInput(overrides: Partial<Parameters<typeof buildDeepDivePrompt>[0]> = {}) {
  return {
    locale: "en" as const,
    tone: "neutral" as const,
    pillars,
    total: 59,
    weakestPillar: "retention" as const,
    quickAnswers,
    contextAnswers,
    ...overrides,
  };
}

describe("buildDeepDivePrompt", () => {
  it("includes the anti-mockery guardrail for roast, in both locales", () => {
    const en = buildDeepDivePrompt(baseInput({ tone: "roast", locale: "en" }));
    const fr = buildDeepDivePrompt(baseInput({ tone: "roast", locale: "fr" }));

    expect(en).toMatch(/NEVER mock the person/i);
    expect(fr).toMatch(/ne te moque JAMAIS de la personne/i);
  });

  it("does not include the roast calibration/guardrail block for the neutral tone", () => {
    const en = buildDeepDivePrompt(baseInput({ tone: "neutral", locale: "en" }));
    expect(en).not.toMatch(/NEVER mock the person/i);
    expect(en).not.toMatch(/Franco-English/i);
  });

  it("instructs the model that scores are final and must not be altered", () => {
    const prompt = buildDeepDivePrompt(baseInput());
    expect(prompt).toMatch(/FINAL/);
    expect(prompt).toMatch(/never recompute/i);
  });

  it("includes every pillar score, the total, and the weakest pillar", () => {
    const prompt = buildDeepDivePrompt(baseInput());
    expect(prompt).toContain("acquisition: 16/20");
    expect(prompt).toContain("activation: 5/20");
    expect(prompt).toContain("retention: 2/20");
    expect(prompt).toContain("referral: 16/20");
    expect(prompt).toContain("revenue: 20/20");
    expect(prompt).toContain("Total: 59/100");
    expect(prompt).toContain("Weakest pillar: retention");
  });

  it("includes both the original Quick answers and the Deep dive context answers", () => {
    const prompt = buildDeepDivePrompt(baseInput());
    expect(prompt).toContain("Do you have a primary acquisition channel?");
    expect(prompt).toContain("Yes, clearly identified and tracked");
    expect(prompt).toContain("What's your primary acquisition channel today?");
    expect(prompt).toContain("SEO / content");
  });

  it("asks for a JSON-only response matching the pillarRecommendations/priorityAction schema", () => {
    const prompt = buildDeepDivePrompt(baseInput());
    expect(prompt).toMatch(/ONLY a valid JSON object/i);
    expect(prompt).toContain('"pillarRecommendations"');
    expect(prompt).toContain('"priorityAction"');
    expect(prompt).not.toContain('"headline"');
    expect(prompt).not.toContain('"strengths"');
  });

  it("switches every instructional block to French for locale fr", () => {
    const prompt = buildDeepDivePrompt(baseInput({ locale: "fr" }));
    expect(prompt).toMatch(/consultant growth senior/);
    expect(prompt).toMatch(/DÉFINITIFS/);
    expect(prompt).toMatch(/UNIQUEMENT avec un objet JSON valide/);
  });
});
