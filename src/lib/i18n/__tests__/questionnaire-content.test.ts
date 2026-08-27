import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/lib/scoring/questions";
import { QUESTION_CONTENT } from "../questionnaire-content";

describe("QUESTION_CONTENT", () => {
  it("has exactly one entry per question in the scoring structure, no more, no less", () => {
    const contentIds = Object.keys(QUESTION_CONTENT).sort();
    const structureIds = QUESTIONS.map((q) => q.id).sort();
    expect(contentIds).toEqual(structureIds);
  });

  it("matches the pillar assigned in the scoring structure for every question", () => {
    for (const q of QUESTIONS) {
      expect(QUESTION_CONTENT[q.id]?.pillar).toBe(q.pillar);
    }
  });

  it("gives every question exactly 4 options covering each point index (0,1,2,3) exactly once", () => {
    for (const [id, content] of Object.entries(QUESTION_CONTENT)) {
      expect(content.options, id).toHaveLength(4);
      expect(content.options.map((o) => o.index).sort()).toEqual([0, 1, 2, 3]);
    }
  });

  it("has a non-empty EN and FR string for every question and every option", () => {
    for (const content of Object.values(QUESTION_CONTENT)) {
      expect(content.question.en.trim().length).toBeGreaterThan(0);
      expect(content.question.fr.trim().length).toBeGreaterThan(0);
      for (const option of content.options) {
        expect(option.label.en.trim().length).toBeGreaterThan(0);
        expect(option.label.fr.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
