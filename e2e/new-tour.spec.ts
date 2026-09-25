import type { Page } from "@playwright/test";
import { QUESTIONS } from "../src/content/copy-library";
import {
  QUESTION_COUNT,
  answerAllQuestions,
  expect,
  readStoredAnswers,
  stubSubmissions,
  test,
  trackedEvents,
} from "./helpers";

/**
 * "Start your Tour" after a Tour already submitted starts a new one — raised
 * by Antoine on 2026-09-25.
 *
 * Until then the in-progress answers were never cleared once the result was
 * created, so a returning visitor landed on the last screen with the previous
 * Tour's fifteen answers, one click from submitting them again, and the only
 * way to a fresh Tour went through the old result's "Take the Tour again".
 *
 * Both halves of the promise are pinned here: a submitted Tour never comes
 * back, and a Tour NOT yet submitted still does (SPEC.md §4 — a reload or a
 * failed submission must never cost the answers).
 */

/** Fifteen answers, all on the first option — what `answerAllQuestions` gives. */
const FIRST_OPTIONS = Object.fromEntries(QUESTIONS.map((q) => [q.id, 0]));
/** The same fifteen with one answer changed: a different Tour. */
const ONE_CHANGED = { ...FIRST_OPTIONS, [QUESTIONS[0]!.id]: 1 };

async function seed(page: Page, answers: Record<string, number>, resultAnswers: Record<string, number> | null) {
  await page.evaluate(
    ([inProgress, past]) => {
      window.localStorage.setItem("tdg.quiz.answers.v1", JSON.stringify(inProgress));
      window.localStorage.setItem(
        "tdg.results.v1",
        JSON.stringify([
          {
            id: "sample",
            ownerToken: "e2e-owner-token",
            createdAt: "2026-09-20T10:00:00.000Z",
            total: 74,
            ...(past ? { answers: past } : {}),
          },
        ]),
      );
    },
    [answers, resultAnswers] as const,
  );
}

test("after a result is created, the landing's CTA opens a new Tour at question 1", async ({ page }) => {
  await stubSubmissions(page);
  await page.goto("/quiz");
  await answerAllQuestions(page);
  await page.getByTestId("get-score-cta").click();
  await page.waitForURL("**/r/**");

  // The Tour is a result now; nothing of it is left "in progress".
  expect(await readStoredAnswers(page)).toEqual({});

  await page.goto("/en");
  await page.getByTestId("hero-cta").click();
  await page.waitForURL("**/quiz");
  await expect(page.locator("header")).toContainText("Q 1 / 15");
  await expect(page.getByTestId("answer-option").first()).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByTestId("segment-screen")).toHaveCount(0);
  await expect(page.getByTestId("back-button")).toHaveCount(0);
});

test("a browser that still holds a submitted Tour's answers from before the fix starts fresh, and it counts as a retake", async ({ page }) => {
  await page.goto("/en");
  await seed(page, FIRST_OPTIONS, FIRST_OPTIONS);

  await page.goto("/quiz");
  await expect(page.locator("header")).toContainText("Q 1 / 15");
  await expect(page.getByTestId("segment-screen")).toHaveCount(0);
  expect(await readStoredAnswers(page)).toEqual({});

  // Before, the fifteen stale answers meant the first answer was never the
  // first: neither `quiz_started` nor `retake_started` fired for this Tour.
  await page.getByTestId("answer-option").first().click();
  await expect.poll(() => trackedEvents(page)).toEqual(expect.arrayContaining(["quiz_started", "retake_started"]));
});

test("a complete Tour NOT yet submitted still resumes on its last screen (SPEC.md §4)", async ({ page }) => {
  await page.goto("/en");
  // A past result exists, but these answers differ from it by one: this is a
  // Tour whose submission has not happened yet (a reload, or a failure).
  await seed(page, ONE_CHANGED, FIRST_OPTIONS);

  await page.goto("/quiz");
  await expect(page.getByTestId("segment-screen")).toBeVisible();
  expect(Object.keys(await readStoredAnswers(page))).toHaveLength(QUESTION_COUNT);
});

test("a result stored before its answers were kept cannot be recognised, so those answers still resume", async ({ page }) => {
  // Results from before REVIEW.md R-12 carry no answers: nothing to compare
  // with, so nothing is thrown away on a guess.
  await page.goto("/en");
  await seed(page, FIRST_OPTIONS, null);

  await page.goto("/quiz");
  await expect(page.getByTestId("segment-screen")).toBeVisible();
  expect(Object.keys(await readStoredAnswers(page))).toHaveLength(QUESTION_COUNT);
});
