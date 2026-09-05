import { expect, test } from "@playwright/test";
import { answerAllQuestions, QUESTION_COUNT, readStoredAnswers, stubSubmissions } from "./helpers";

/**
 * SPEC.md §4, written into the error screen's own copy: "retrying doesn't
 * restart the questionnaire". The screen says it, so it had better be true —
 * REVIEW.md R-07.
 */
test("a failed calculation keeps the answers and retries without restarting", async ({ page }) => {
  await stubSubmissions(page, 500);
  await page.goto("/quiz");
  await answerAllQuestions(page);
  await page.getByTestId("get-score-cta").click();

  await expect(page.getByTestId("retry-button")).toBeVisible();
  // R-04: a short stable code, never an internal message.
  await expect(page.getByText("SCORING_FAILED")).toBeVisible();
  expect(Object.keys(await readStoredAnswers(page))).toHaveLength(QUESTION_COUNT);

  // Retry against a route that now succeeds: the run must go straight to the
  // result, never back through question 1.
  await page.unroute("**/api/submissions");
  const calls = await stubSubmissions(page);
  await page.getByTestId("retry-button").click();
  await page.waitForURL("**/r/**");

  expect(Object.keys(calls[0]?.answers ?? {})).toHaveLength(QUESTION_COUNT);
});
