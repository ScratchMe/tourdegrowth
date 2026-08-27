import { describe, expect, it } from "vitest";
import { SAMPLE_RESULT, getSampleVerdict } from "../sample";

describe("SAMPLE_RESULT", () => {
  it("matches SPEC.md §6's worked example (18+12+8+16+20 = 74)", () => {
    const sum = SAMPLE_RESULT.pillars.reduce((s, p) => s + p.score, 0);
    expect(sum).toBe(SAMPLE_RESULT.total);
    expect(SAMPLE_RESULT.total).toBe(74);
  });

  it("flags retention as the weakest pillar", () => {
    expect(SAMPLE_RESULT.weakestPillar).toBe("retention");
  });
});

describe("getSampleVerdict", () => {
  it("returns bilingual, tone-specific fixed content, never empty", () => {
    for (const tone of ["neutral", "roast"] as const) {
      for (const locale of ["en", "fr"] as const) {
        const verdict = getSampleVerdict(tone, locale);
        expect(verdict.headline.length).toBeGreaterThan(0);
        expect(verdict.strengths).toHaveLength(2);
        expect(verdict.weaknesses).toHaveLength(2);
        expect(verdict.recommendation.length).toBeGreaterThan(0);
        expect(verdict.modelUsed).toBe("sample");
      }
    }
  });

  it("uses DESIGN-BRIEF.md's literal roast example lines", () => {
    const roast = getSampleVerdict("roast", "en");
    expect(roast.headline).toBe("Not bad for someone whose users leave before the second week.");
    expect(roast.weaknesses[0]).toBe(
      "Your retention took one look at your product and rode straight past the finish line.",
    );
  });

  it("switches language for every field", () => {
    const en = getSampleVerdict("neutral", "en");
    const fr = getSampleVerdict("neutral", "fr");
    expect(en.headline).not.toBe(fr.headline);
    expect(en.recommendation).not.toBe(fr.recommendation);
  });
});
