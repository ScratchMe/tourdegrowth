import { describe, expect, it } from "vitest";
import { ABOUT } from "../about";
import { computeScore } from "@/lib/scoring/score";
import { QUESTIONS } from "../copy-library";

/**
 * REVIEW-02.md R2-04 — the About page explains the scoring rule in words and
 * with a worked example. Words drift; this pins the example to the engine so
 * the page can never describe arithmetic the code no longer does.
 */
describe("the About page's worked example matches the scoring engine", () => {
  it("20 + 7 + 7 on one stage rounds to 11/20, as the copy says", () => {
    // Every pillar at its worst except Acquisition at 20/7/7.
    const answers = Object.fromEntries(QUESTIONS.map((q) => [q.id, 2])) as Record<string, 0 | 1 | 2>;
    const [a1, a2, a3] = QUESTIONS.filter((q) => q.pillar === "acquisition").map((q) => q.id);
    answers[a1!] = 0; // 20 points
    answers[a2!] = 1; // 7 points
    answers[a3!] = 1; // 7 points
    const result = computeScore(answers);
    const acquisition = result.pillars.find((p) => p.pillar === "acquisition")!;
    expect(acquisition.rawPoints).toBe(34);
    expect(acquisition.score).toBe(11);
    for (const locale of ["fr", "en"] as const) {
      expect(ABOUT.scoringSection.example[locale]).toMatch(/34/);
      expect(ABOUT.scoringSection.example[locale]).toMatch(/11/);
    }
  });

  it("the three point values the copy names are the three the options carry", () => {
    const points = new Set(QUESTIONS.flatMap((q) => q.options.map((o) => o.points)));
    expect([...points].sort((a, b) => b - a)).toEqual([20, 7, 0]);
    for (const locale of ["fr", "en"] as const) {
      expect(ABOUT.scoringSection.rules[0]![locale]).toMatch(/20, 7/);
    }
  });
});
