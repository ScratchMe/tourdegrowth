import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/lib/scoring/questions";
import type { Answers } from "@/lib/scoring/score";
import {
  QUESTION_COUNT,
  firstUnansweredIndex,
  isComplete,
  minutesLeft,
  stageOfQuestion,
} from "../navigation";

describe("stageOfQuestion", () => {
  it("groups questions into 5 stages of 3", () => {
    expect(stageOfQuestion(0)).toBe(0);
    expect(stageOfQuestion(1)).toBe(0);
    expect(stageOfQuestion(2)).toBe(0);
    expect(stageOfQuestion(3)).toBe(1);
    expect(stageOfQuestion(5)).toBe(1);
    expect(stageOfQuestion(6)).toBe(2);
    expect(stageOfQuestion(11)).toBe(3);
    expect(stageOfQuestion(12)).toBe(4);
    expect(stageOfQuestion(14)).toBe(4);
  });
});

describe("firstUnansweredIndex", () => {
  it("returns 0 when nothing is answered", () => {
    expect(firstUnansweredIndex({})).toBe(0);
  });

  it("returns the index of the first gap", () => {
    const answers: Answers = { [QUESTIONS[0]!.id]: 2, [QUESTIONS[1]!.id]: 1 };
    expect(firstUnansweredIndex(answers)).toBe(2);
  });

  it("returns the last question index when everything is answered", () => {
    const answers: Answers = {};
    for (const q of QUESTIONS) answers[q.id] = 1;
    expect(firstUnansweredIndex(answers)).toBe(QUESTION_COUNT - 1);
  });
});

describe("isComplete", () => {
  it("is false until all 15 questions have an answer", () => {
    expect(isComplete({})).toBe(false);
    const partial: Answers = {};
    QUESTIONS.slice(0, QUESTION_COUNT - 1).forEach((q) => {
      partial[q.id] = 0;
    });
    expect(isComplete(partial)).toBe(false);
  });

  it("is true once every question has an answer", () => {
    const full: Answers = {};
    for (const q of QUESTIONS) full[q.id] = 3;
    expect(isComplete(full)).toBe(true);
  });
});

describe("minutesLeft", () => {
  it("matches the design mock: Q4 (index 3) shows 2 min left", () => {
    expect(minutesLeft(3)).toBe(2);
  });

  it("starts around the full 3 minutes on question 1", () => {
    expect(minutesLeft(0)).toBe(3);
  });

  it("never drops below 1 minute, even on the last question", () => {
    expect(minutesLeft(QUESTION_COUNT - 1)).toBe(1);
  });
});
