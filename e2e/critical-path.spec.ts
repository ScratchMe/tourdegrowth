import {
  answerAllQuestions,
  expect,
  QUESTION_COUNT,
  readStoredAnswers,
  stubSubmissions,
  test,
  trackedEvents,
} from "./helpers";

/**
 * The one flow the whole product exists to complete: landing → 15 questions →
 * tone → a result page. REVIEW.md R-07.
 */
test.describe("critical path", () => {
  test("landing CTA leads into the questionnaire", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Start your Tour/i }).first().click();
    await page.waitForURL("**/quiz");
    await expect(page.getByTestId("answer-option").first()).toBeVisible();
  });

  test("answering all 15 questions reaches the tone selector, then a result page", async ({ page }) => {
    const calls = await stubSubmissions(page);
    await page.goto("/quiz");

    await answerAllQuestions(page);

    // SPEC.md §4 / DESIGN-BRIEF.md "State": answers are persisted as they go,
    // which is what makes the error-retry promise possible at all.
    expect(Object.keys(await readStoredAnswers(page))).toHaveLength(QUESTION_COUNT);

    // SPEC.md §6bis: neutral is the default, chosen for the user, not by them.
    await page.getByTestId("get-score-cta").click();
    await page.waitForURL("**/r/**");

    expect(calls).toHaveLength(1);
    expect(calls[0]?.tone).toBe("neutral");
    expect(Object.keys(calls[0]?.answers ?? {})).toHaveLength(QUESTION_COUNT);
    await expect(page.getByText(/Overall Growth Score/i).first()).toBeVisible();
  });

  test("the roast tone is opt-in and travels with the submission", async ({ page }) => {
    const calls = await stubSubmissions(page);
    await page.goto("/quiz");
    await answerAllQuestions(page);

    await page.getByTestId("tone-option").nth(1).click();
    await page.getByTestId("get-score-cta").click();
    await page.waitForURL("**/r/**");

    expect(calls[0]?.tone).toBe("roast");
  });

  test("Back keeps the previous answer selected", async ({ page }) => {
    await page.goto("/quiz");
    await page.getByTestId("answer-option").nth(1).click();
    await page.getByTestId("back-button").click();

    await expect(page.getByTestId("answer-option").nth(1)).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("answer-option").first()).toHaveAttribute("aria-pressed", "false");
  });

  test("a partially answered run resumes where it left off, never at question 1", async ({ page }) => {
    await page.goto("/quiz");
    await page.getByTestId("answer-option").first().click();
    await page.getByTestId("answer-option").first().click();

    await page.reload();

    // Two answered → resume at question 3, with Back available.
    await expect(page.locator("header")).toContainText("Q 3 / 15");
    await expect(page.getByTestId("back-button")).toBeVisible();
  });
});

/** REVIEW.md R-10 — the share button is the growth loop's only manual step. */
test.describe("sharing", () => {
  test("copies a clean link and says so, on a browser with no share sheet", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    // Desktop Chrome has no navigator.share; make that explicit rather than
    // relying on the device profile staying that way.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    });

    await page.goto("/r/sample?lang=fr");
    await page.getByTestId("share-button").click();

    // The label is the only confirmation on desktop.
    await expect(page.getByTestId("share-button")).toHaveText(/Lien copié/i);

    // `?lang=` is the reader's own choice and must not travel with the link.
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain("/r/sample");
    expect(copied).not.toContain("lang=");
  });

  test("a cancelled native share is not counted as a share", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: () => Promise.reject(Object.assign(new Error("cancelled"), { name: "AbortError" })),
      });
    });

    await page.goto("/r/sample");
    await page.getByTestId("share-button").click();
    await page.waitForTimeout(300);

    expect(await trackedEvents(page)).toEqual([]);
    // And it must not silently fall back to writing the clipboard either.
    await expect(page.getByTestId("share-button")).not.toHaveText(/copied|copié/i);
  });
});

/**
 * REVIEW.md R-12 — CLAUDE.md calls it non-negotiable that a shared score be
 * re-explainable in ten seconds. That was true of the code and invisible in
 * the product.
 */
test.describe("score breakdown", () => {
  /**
   * Only the visitor half is coverable here: the breakdown needs a real
   * submission's per-pillar raw points, and `/r/sample` is the one result
   * page that renders without Firestore — deliberately fixed display data
   * with no answers behind it (SPEC.md §12), so it carries no breakdown by
   * design. The owner-side rendering was verified in a browser separately;
   * see the CLAUDE.md entry for R-12.
   */
  test("someone else's shared result never shows the breakdown", async ({ page }) => {
    const calls = await stubSubmissions(page);
    await page.goto("/quiz");
    await answerAllQuestions(page);
    await page.getByTestId("get-score-cta").click();
    await page.waitForURL("**/r/**");
    expect(calls).toHaveLength(1);

    await page.evaluate(() => window.localStorage.clear()); // now just a visitor
    await page.reload();
    await expect(page.getByTestId("score-breakdown")).toHaveCount(0);
  });

  test("the answers never appear in the shared page's own payload", async ({ page }) => {
    const response = await page.goto("/r/sample");
    const html = (await response?.text()) ?? "";

    // The breakdown's question/option text is public content and may appear;
    // what must never be there is a stored answer map keyed by question id.
    expect(html).not.toContain("tdg.results.v1");
    expect(html).not.toMatch(/"acq-1"\s*:\s*\d/);
  });
});
