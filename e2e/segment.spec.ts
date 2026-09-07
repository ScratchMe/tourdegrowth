import { answerQuestionsOnly, expect, stubSubmissions, test, trackedEvents } from "./helpers";

/**
 * REVIEW-02.md R2-26 — the two context questions behind a comparable
 * benchmark. What these specs protect is the part that could quietly cost
 * completions: the screen must never block anyone, and what it collects must
 * reach the API in the shape the server validates.
 */
test.describe("the context screen", () => {
  test("never blocks the score: Continue works without touching either question", async ({ page }) => {
    const calls = await stubSubmissions(page);
    await page.goto("/quiz");
    await answerQuestionsOnly(page);

    await page.getByTestId("segment-continue").click();
    await page.getByTestId("get-score-cta").click();
    await page.waitForURL("**/r/**");

    expect(calls).toHaveLength(1);
    // Declining both axes is a complete answer, and it is what the server
    // turns into "no segment" rather than a rejection.
    expect(calls[0]!.segment).toEqual({ stage: "unknown", model: "unknown" });
  });

  test("carries both answers to the API when they are given", async ({ page }) => {
    const calls = await stubSubmissions(page);
    await page.goto("/quiz");
    await answerQuestionsOnly(page);

    await page.getByTestId("segment-stage-option").nth(1).click(); // first customers
    await page.getByTestId("segment-model-option").first().click(); // B2B
    await page.getByTestId("segment-continue").click();
    await page.getByTestId("get-score-cta").click();
    await page.waitForURL("**/r/**");

    expect(calls[0]!.segment).toEqual({ stage: "first-customers", model: "b2b" });
  });

  test("reports how much was answered, so the screen can be judged on its cost", async ({ page }) => {
    await stubSubmissions(page);
    await page.goto("/quiz");
    await answerQuestionsOnly(page);

    await page.getByTestId("segment-model-option").nth(1).click(); // B2C only
    await page.getByTestId("segment-continue").click();

    expect(await trackedEvents(page)).toContain("segment_answered/model");
  });

  test("sits between the last question and the tone selector, not before either", async ({ page }) => {
    await stubSubmissions(page);
    await page.goto("/quiz");
    for (let i = 0; i < 14; i += 1) {
      await page.getByTestId("answer-option").first().click();
    }
    // One question still to go: the screen must not be there yet.
    await expect(page.getByTestId("segment-screen")).toHaveCount(0);

    await page.getByTestId("answer-option").first().click();
    await expect(page.getByTestId("segment-screen")).toBeVisible();
    await expect(page.getByTestId("get-score-cta")).toHaveCount(0);

    await page.getByTestId("segment-continue").click();
    await expect(page.getByTestId("get-score-cta")).toBeVisible();
    await expect(page.getByTestId("segment-screen")).toHaveCount(0);
  });

  test("is reachable and readable in French on a phone", async ({ page }) => {
    await stubSubmissions(page);
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/quiz?lang=fr");
    await answerQuestionsOnly(page);
    await expect(page.getByTestId("segment-screen")).toContainText("Deux questions");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });
});
