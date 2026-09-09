import { describe, expect, it } from "vitest";
import { QUESTIONS } from "../copy-library";
import { LEVEL_MOVE, NEXT_MOVES } from "../next-moves";

/**
 * `REVIEW-03.md` A2. Question ids are plain strings in this codebase, so the
 * type cannot enforce that this library covers the questionnaire. These
 * tests do — and they check more than a union type could: that every points
 * value keyed here actually exists on that question's options, so the
 * library cannot drift from the copy library it answers.
 */
describe("NEXT_MOVES", () => {
  it("covers exactly the fifteen questions — no gap, no orphan", () => {
    expect(Object.keys(NEXT_MOVES).sort()).toEqual(QUESTIONS.map((q) => q.id).sort());
  });

  it("answers every non-full option of every question, and only those", () => {
    for (const question of QUESTIONS) {
      const actionable = question.options
        .filter((o) => o.points !== 20)
        .map((o) => o.points)
        .sort();
      const keyed = Object.keys(NEXT_MOVES[question.id]!)
        .map(Number)
        .sort();
      // The 20-point answer must have no entry: there is nothing to fix.
      expect(keyed, `${question.id}`).toEqual(actionable);
    }
  });

  it("is written in both languages, everywhere", () => {
    for (const [id, byPoints] of Object.entries(NEXT_MOVES)) {
      for (const [points, move] of Object.entries(byPoints)) {
        expect(move.en.length, `${id}/${points} en`).toBeGreaterThan(30);
        expect(move.fr.length, `${id}/${points} fr`).toBeGreaterThan(30);
      }
    }
    expect(LEVEL_MOVE.en.length).toBeGreaterThan(30);
    expect(LEVEL_MOVE.fr.length).toBeGreaterThan(30);
  });

  it("keeps every action to one sentence — the house rule for this file", () => {
    // Not a style nicety: the result page has one slot for this, and a
    // paragraph would either overflow it or be truncated. A trailing
    // question mark or period is the only terminal punctuation allowed, and
    // there is at most one of them.
    for (const [id, byPoints] of Object.entries(NEXT_MOVES)) {
      for (const [points, move] of Object.entries(byPoints)) {
        for (const [locale, text] of Object.entries(move)) {
          // A boundary is terminal punctuation followed by a capital — an
          // embedded question ("... — why now? — and read ...") is not one.
          const sentences = text.split(/[.!?]+\s+(?=[A-ZÀ-Ý])/).filter(Boolean);
          expect(sentences.length, `${id}/${points} ${locale}: "${text}"`).toBe(1);
          expect(text.length, `${id}/${points} ${locale} too long`).toBeLessThan(160);
        }
      }
    }
  });

  it("never promises a number or a deadline", () => {
    // A fifteen-question quiz cannot know that something takes two weeks or
    // lifts activation by 20%. Anything that reads like a project plan
    // oversells what this product can see — so the copy may name a period
    // ("a month", "one cycle") but never a promised outcome in figures.
    for (const [id, byPoints] of Object.entries(NEXT_MOVES)) {
      for (const [points, move] of Object.entries(byPoints)) {
        for (const [locale, text] of Object.entries(move)) {
          expect(text, `${id}/${points} ${locale}`).not.toMatch(/\d+\s*%/);
          expect(text, `${id}/${points} ${locale}`).not.toMatch(/\bx\s?\d|\d+\s*(?:jours|semaines|days|weeks)\b/i);
        }
      }
    }
  });
});
