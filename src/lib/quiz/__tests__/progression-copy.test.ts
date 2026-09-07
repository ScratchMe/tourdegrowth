import { describe, expect, it } from "vitest";
import { progressionSentence } from "../progression-copy";

const templates = {
  up: "Tour précédent : {prev} → {score}, +{delta}",
  down: "Tour précédent : {prev} → {score}, {delta}",
  flat: "Tour précédent : {prev} — même score",
};

describe("progressionSentence (REVIEW-02.md R2-27)", () => {
  it("puts the plus in the copy and the minus in the number", () => {
    expect(progressionSentence({ previousTotal: 58, currentTotal: 66, delta: 8 }, templates)).toBe(
      "Tour précédent : 58 → 66, +8",
    );
    expect(progressionSentence({ previousTotal: 60, currentTotal: 51, delta: -9 }, templates)).toBe(
      "Tour précédent : 60 → 51, -9",
    );
  });

  it("gives a flat result its own sentence rather than '+0'", () => {
    expect(progressionSentence({ previousTotal: 60, currentTotal: 60, delta: 0 }, templates)).toBe(
      "Tour précédent : 60 — même score",
    );
  });
});
