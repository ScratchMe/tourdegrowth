import type { Page, Route } from "@playwright/test";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { expect, test, answerAllQuestions, QUESTION_COUNT, readStoredAnswers, stubSubmissions } from "./helpers";

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

/*
 * A14.4 (2026-10-01): the sentence says which failure it is, and the code
 * under it is a stable one (R-04), never what `fetch` or a route wrote.
 * Read from the dictionary, in both languages. The Deep dive's screen runs
 * the same module (`lib/quiz/request-failure.ts`), unit-tested on its own.
 *
 * Non-vacuity (2026-10-01): with `failureSentence` always answering the
 * generic sentence, exactly the limit and the connection tests fall, in both
 * languages (4); the route-sentence one and the retry above pass (3).
 */
for (const locale of ["en", "fr"] as const) {
  test.describe(`a failed calculation says which failure it is (${locale})`, () => {
    async function failWith(page: Page, answer: (route: Route) => Promise<void>): Promise<void> {
      await page.route("**/api/submissions", answer);
      await page.goto(`/quiz?lang=${locale}`);
      await answerAllQuestions(page);
      await page.getByTestId("get-score-cta").click();
      await expect(page.getByTestId("retry-button")).toBeVisible();
    }

    test("the hourly limit gives its real wait, not « in a moment »", async ({ page }) => {
      await failWith(page, (route) =>
        route.fulfill({ status: 429, headers: { "Retry-After": "1790" }, contentType: "application/json", body: JSON.stringify({ error: "RATE_LIMITED" }) }),
      );
      await expect(page.getByText(tc(UI_STRINGS.quiz.errorRateLimited, locale).replace("{m}", "30"))).toBeVisible();
      await expect(page.getByText(tc(UI_STRINGS.quiz.errorBody, locale))).toHaveCount(0);
      await expect(page.getByTestId("error-code")).toHaveText("RATE_LIMITED");
    });

    test("a dropped connection says so, with a code and not « Failed to fetch »", async ({ page }) => {
      await failWith(page, (route) => route.abort("internetdisconnected"));
      await expect(page.getByText(tc(UI_STRINGS.quiz.errorOffline, locale))).toBeVisible();
      await expect(page.getByTestId("error-code")).toHaveText("NETWORK");
    });

    test("a route's own sentence never reaches the screen", async ({ page }) => {
      const sentence = 'tone must be "neutral" or "roast".';
      await failWith(page, (route) =>
        route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ error: sentence }) }),
      );
      await expect(page.getByText(tc(UI_STRINGS.quiz.errorBody, locale))).toBeVisible();
      await expect(page.getByTestId("error-code")).toHaveText("HTTP_400");
      await expect(page.getByText(sentence)).toHaveCount(0);
    });
  });
}
