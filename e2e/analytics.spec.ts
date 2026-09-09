import { answerAllQuestions, expect, seedOwnedResult, stubSubmissions, test, trackedEvents } from "./helpers";

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
    // The context screen (REVIEW-02.md R2-26) sits between the last question
    // and the tone selector. Answering one axis and declining the other is
    // the interesting case: it must report "stage", not "both", since only
    // "both" can ever produce a segment average.
    await page.getByTestId("segment-stage-option").first().click();
    await page.getByTestId("segment-continue").click();
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
      "segment_answered/stage",
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

  /**
   * REVIEW-03.md A4 — the two return signals. This tool's own Retention is
   * the one thing a one-shot self-assessment has no natural reason to
   * produce, and nothing measured it: `quiz_started` counts a first Tour and
   * a fourth one identically.
   */
  test("a device that already holds a result counts a return and a retake", async ({ page }) => {
    await stubSubmissions(page);
    await page.goto("/en");
    await seedOwnedResult(page);

    await page.goto("/en");
    await expect(page.getByTestId("last-result-link")).toBeVisible();
    // Polled, never a fixed wait: this event is fired at mount, so it may be
    // queued until `count.js` finishes loading (see `trackEvent`).
    await expect.poll(() => trackedEvents(page)).toEqual(["landing_return"]);

    await page.goto("/quiz");
    await page.getByTestId("answer-option").first().click();
    // Alongside `quiz_started`, never instead of it: that path is the
    // denominator of every drop-off ratio on the dashboard.
    expect(await trackedEvents(page)).toEqual(["quiz_started", "retake_started"]);
  });

  test("a first-time device counts neither a return nor a retake", async ({ page }) => {
    await stubSubmissions(page);
    await page.goto("/en");
    await page.evaluate(() => localStorage.clear());

    await page.goto("/en");
    await expect(page.getByTestId("last-result-link")).toHaveCount(0);
    expect(await trackedEvents(page)).toEqual([]);

    await page.goto("/quiz");
    await page.getByTestId("answer-option").first().click();
    expect(await trackedEvents(page)).toEqual(["quiz_started"]);
  });

  test("a visitor redirected off a Deep dive URL never counts as a start", async ({ page }) => {
    await page.goto("/deep-dive/sample");
    await page.waitForURL("**/r/sample");

    expect(await trackedEvents(page)).toEqual([]);
  });
});
