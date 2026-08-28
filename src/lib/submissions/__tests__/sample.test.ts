import { describe, expect, it } from "vitest";
import { PILLARS } from "@/lib/scoring/pillars";
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
  it("returns a non-empty headline and a sentence for every pillar, for every tone/locale", () => {
    for (const tone of ["neutral", "roast"] as const) {
      for (const locale of ["en", "fr"] as const) {
        const verdict = getSampleVerdict(tone, locale);
        expect(verdict.headline.length).toBeGreaterThan(0);
        for (const pillar of PILLARS) {
          expect(verdict.pillarSentences[pillar]?.length, `${tone}/${locale}/${pillar}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("reads from the same copy library every real Quick result uses, keyed by the fixed sample scores' bands", () => {
    // retention=8 -> weak, acquisition=18 -> strong (see scoreBand in copy-library.ts).
    const roastEn = getSampleVerdict("roast", "en");
    expect(roastEn.pillarSentences.retention).toBe("Your retention decided to go home before the stage was even over.");
    expect(roastEn.pillarSentences.acquisition).toBe(
      "Your acquisition actually knows where it's going. Deserved yellow jersey on this stage.",
    );
  });

  it("switches language for every field", () => {
    const en = getSampleVerdict("neutral", "en");
    const fr = getSampleVerdict("neutral", "fr");
    expect(en.headline).not.toBe(fr.headline);
    expect(en.pillarSentences.retention).not.toBe(fr.pillarSentences.retention);
  });
});
