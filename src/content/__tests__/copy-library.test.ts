import { describe, expect, it } from "vitest";
import { PILLARS } from "@/lib/scoring/pillars";
import { QUESTIONS as SCORING_QUESTIONS } from "@/lib/scoring/questions";
import { PILLAR_VERDICTS, QUESTIONS, scoreBand, SUMMARY_HEADLINES } from "../copy-library";

const TONES = ["neutral", "roast"] as const;
const BANDS = ["weak", "developing", "strong"] as const;

describe("copy-library QUESTIONS", () => {
  it("has exactly 15 questions, 3 per pillar", () => {
    expect(QUESTIONS).toHaveLength(15);
    for (const pillar of PILLARS) {
      expect(QUESTIONS.filter((q) => q.pillar === pillar)).toHaveLength(3);
    }
  });

  it("matches the ids/pillars the scoring engine derives from it", () => {
    expect(QUESTIONS.map((q) => q.id)).toEqual(SCORING_QUESTIONS.map((q) => q.id));
    expect(QUESTIONS.map((q) => q.pillar)).toEqual(SCORING_QUESTIONS.map((q) => q.pillar));
  });

  it("gives every question exactly 3 options, points {20,7,0} each exactly once", () => {
    for (const q of QUESTIONS) {
      expect(q.options, q.id).toHaveLength(3);
      expect(q.options.map((o) => o.points).sort((a, b) => a - b)).toEqual([0, 7, 20]);
    }
  });

  it("has a non-empty EN and FR string for every question and every option", () => {
    for (const q of QUESTIONS) {
      expect(q.question.en.trim().length).toBeGreaterThan(0);
      expect(q.question.fr.trim().length).toBeGreaterThan(0);
      for (const option of q.options) {
        expect(option.label.en.trim().length).toBeGreaterThan(0);
        expect(option.label.fr.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe("scoreBand", () => {
  it("bands 0-9 as weak, 10-15 as developing, 16-20 as strong", () => {
    expect(scoreBand(0)).toBe("weak");
    expect(scoreBand(9)).toBe("weak");
    expect(scoreBand(10)).toBe("developing");
    expect(scoreBand(15)).toBe("developing");
    expect(scoreBand(16)).toBe("strong");
    expect(scoreBand(20)).toBe("strong");
  });
});

describe("PILLAR_VERDICTS", () => {
  it("has a non-empty EN and FR sentence for every pillar x band x tone (60 total)", () => {
    for (const pillar of PILLARS) {
      for (const band of BANDS) {
        for (const tone of TONES) {
          const entry = PILLAR_VERDICTS[pillar][band][tone];
          expect(entry.en.trim().length, `${pillar}/${band}/${tone}/en`).toBeGreaterThan(0);
          expect(entry.fr.trim().length, `${pillar}/${band}/${tone}/fr`).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("SUMMARY_HEADLINES", () => {
  const BANDS = ["solid", "mixed", "floor"] as const;

  it("has a non-empty EN and FR line for every pillar x band x tone (60 total)", () => {
    let n = 0;
    for (const pillar of PILLARS) {
      for (const band of BANDS) {
        for (const tone of TONES) {
          const entry = SUMMARY_HEADLINES[pillar][band][tone];
          expect(entry.en.trim().length, `${pillar}/${band}/${tone}/en`).toBeGreaterThan(0);
          expect(entry.fr.trim().length, `${pillar}/${band}/${tone}/fr`).toBeGreaterThan(0);
          n += 2;
        }
      }
    }
    expect(n).toBe(60);
  });

  /* Rule 1 of the library's own contract, held mechanically because it is the
     one that was broken in BOTH directions: the label above counts the
     bottleneck group, and it reads "One stage holding you back" on 43,2 % of
     `mixed` boards — so a line asserting plurality is exactly as wrong as one
     asserting singularity. A line may name its own stage; it may never count
     the stages that are behind, nor rank them. */
  it("never counts or ranks the stages that are behind", () => {
    const COUNTING =
      /\b(?:une? seule?|deux|trois|quatre|cinq|plusieurs|toutes les étapes|la plus basse|la dernière|derni[èe]re|one stage|two|three|four|five|several|the lowest|the last|last place)\b/i;
    for (const pillar of PILLARS) {
      for (const band of BANDS) {
        for (const tone of TONES) {
          for (const locale of ["fr", "en"] as const) {
            const line = SUMMARY_HEADLINES[pillar][band][tone][locale];
            expect(COUNTING.test(line), `${pillar}/${band}/${tone}/${locale}: « ${line} »`).toBe(false);
          }
        }
      }
    }
  });

  /* Two bands resolving to the same words means one of them is not saying
     what its band is for — and it is invisible without this, since each is
     only ever seen one at a time. Two agents independently wrote the same
     English opening sentence while this library was being drafted. */
  it("says something different in every slot", () => {
    const seen = new Map<string, string>();
    for (const pillar of PILLARS) {
      for (const band of BANDS) {
        for (const tone of TONES) {
          for (const locale of ["fr", "en"] as const) {
            const line = SUMMARY_HEADLINES[pillar][band][tone][locale];
            const where = `${pillar}/${band}/${tone}/${locale}`;
            expect(seen.get(`${locale}:${line}`), `${where} repeats ${seen.get(`${locale}:${line}`)}`).toBeUndefined();
            seen.set(`${locale}:${line}`, where);
          }
        }
      }
    }
  });
});
