import { answerAllQuestions, expect, stubSubmissions, test, trackedEvents } from "./helpers";

/**
 * REVIEW.md R-11 — before this, only the two ENDS of the funnel were
 * measured, so "how many finished" was knowable and "where the rest left"
 * was not.
 *
 * These assertions are only meaningful because the CI build sets
 * `NEXT_PUBLIC_GOATCOUNTER_CODE`, so the script tag is really rendered and
 * the fixture's stub really replaces it. Without that, `trackEvent` no-ops
 * and every expectation below would pass while proving nothing.
 */
test.describe("funnel instrumentation", () => {
  test("fires each step exactly once, in order, through a full run", async ({ page }) => {
    await stubSubmissions(page);
    await page.goto("/quiz");

    await page.getByTestId("answer-option").first().click();
    expect(await trackedEvents(page)).toEqual(["quiz_started"]);

    // Three answers per pillar: the third completes stage 1.
    await page.getByTestId("answer-option").first().click();
    await page.getByTestId("answer-option").first().click();
    expect(await trackedEvents(page)).toEqual(["quiz_started", "quiz_stage_completed/1"]);

    for (let i = 3; i < 15; i += 1) {
      await page.getByTestId("answer-option").first().click();
    }
    await page.getByTestId("tone-option").nth(1).click(); // roast
    await page.getByTestId("get-score-cta").click();
    await page.waitForURL("**/r/**");

    expect(await trackedEvents(page)).toEqual([
      "quiz_started",
      "quiz_stage_completed/1",
      "quiz_stage_completed/2",
      "quiz_stage_completed/3",
      "quiz_stage_completed/4",
      "quiz_stage_completed/5",
      "tone_selected/roast",
      "submission_completed/roast",
    ]);
  });

  test("changing an earlier answer does not re-count the start or the stage", async ({ page }) => {
    await page.goto("/quiz");

    await page.getByTestId("answer-option").first().click();
    await page.getByTestId("answer-option").first().click();
    await page.getByTestId("answer-option").first().click(); // stage 1 done

    await page.getByTestId("back-button").click();
    await page.getByTestId("answer-option").nth(1).click(); // re-answer question 3

    expect(await trackedEvents(page)).toEqual(["quiz_started", "quiz_stage_completed/1"]);
  });

  test("a retry after a failure is not a second tone choice", async ({ page }) => {
    await stubSubmissions(page, 500);
    await page.goto("/quiz");
    await answerAllQuestions(page);
    await page.getByTestId("get-score-cta").click();
    await expect(page.getByTestId("retry-button")).toBeVisible();

    await page.unroute("**/api/submissions");
    await stubSubmissions(page);
    await page.getByTestId("retry-button").click();
    await page.waitForURL("**/r/**");

    const events = await trackedEvents(page);
    expect(events.filter((e) => e.startsWith("tone_selected"))).toEqual(["tone_selected/neutral"]);
    expect(events.filter((e) => e.startsWith("submission_completed"))).toEqual(["submission_completed/neutral"]);
  });

  test("a visitor redirected off a Deep dive URL never counts as a start", async ({ page }) => {
    await page.goto("/deep-dive/sample");
    await page.waitForURL("**/r/sample");

    expect(await trackedEvents(page)).toEqual([]);
  });
});
