import {
  CREATED_TOTAL,
  answerAllQuestions,
  expect,
  seedOwnedResult,
  stubDeepDive,
  stubSubmissions,
  test,
} from "./helpers";

/**
 * REVIEW.md R-20 — the three small product gaps, verified as behaviour.
 *
 * With no accounts (SPEC.md §5) a result is reachable only by its URL, and a
 * Deep dive that lost its answers to a reload asked for eleven screens twice.
 */

test.describe("the way back to your last result", () => {
  test("a first-time visitor is offered nothing", async ({ page }) => {
    await page.goto("/en");
    // The link is rendered after mount, so an immediate assertion could pass
    // simply by being early. Wait for the page to be interactive first.
    await expect(page.getByRole("link", { name: /Start your Tour/i }).first()).toBeVisible();
    await expect(page.getByTestId("last-result-link")).toHaveCount(0);
  });

  test("after a Tour, the landing offers that score back", async ({ page }) => {
    await stubSubmissions(page);
    await page.goto("/quiz");
    await answerAllQuestions(page);
    await page.getByTestId("get-score-cta").click();
    await page.waitForURL("**/r/**");

    await page.goto("/en");
    const link = page.getByTestId("last-result-link");
    await expect(link).toBeVisible();
    await expect(link).toContainText(String(CREATED_TOTAL));
    await expect(link).toHaveAttribute("href", "/r/sample");
  });

  test("an entry stored before the score was kept still links back", async ({ page }) => {
    await page.goto("/en");
    await page.evaluate(() => {
      window.localStorage.setItem(
        "tdg.results.v1",
        JSON.stringify([{ id: "sample", ownerToken: "tok", createdAt: "2026-09-05T10:00:00.000Z" }]),
      );
    });
    await page.reload();

    const link = page.getByTestId("last-result-link");
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/r/sample");
  });

  test("it follows the reader's language, like the rest of the page", async ({ page }) => {
    await page.goto("/fr");
    await seedOwnedResult(page);
    await page.reload();
    await expect(page.getByTestId("last-result-link")).toContainText(/Ton dernier score/i);
  });
});

test.describe("Deep dive progress survives a reload", () => {
  async function startOwnedDeepDive(page: import("@playwright/test").Page) {
    await page.goto("/r/sample");
    await seedOwnedResult(page);
    await page.goto("/deep-dive/sample");
    await expect(page.getByTestId("deep-dive-answer-option").first()).toBeVisible();
  }

  test("a reload resumes at the first unanswered question, not question 1", async ({ page }) => {
    await startOwnedDeepDive(page);

    for (let i = 0; i < 3; i += 1) {
      await page.getByTestId("deep-dive-answer-option").first().click();
    }
    await expect(page.getByRole("group")).toHaveAttribute("aria-label", /Question 4 of 10/);

    await page.reload();
    await expect(page.getByRole("group")).toHaveAttribute("aria-label", /Question 4 of 10/);
  });

  test("the answers themselves come back, not just the position", async ({ page }) => {
    await startOwnedDeepDive(page);

    // Pick the SECOND option so a restored selection is distinguishable from
    // a default.
    await page.getByTestId("deep-dive-answer-option").nth(1).click();
    await page.reload();

    await page.getByTestId("back-button").click();
    await expect(page.getByTestId("deep-dive-answer-option").nth(1)).toHaveAttribute("aria-pressed", "true");
  });

  test("the free-text context is not lost either — it is the most expensive thing to retype", async ({ page }) => {
    await startOwnedDeepDive(page);

    for (let i = 0; i < 10; i += 1) {
      await page.getByTestId("deep-dive-answer-option").first().click();
    }
    const textarea = page.getByTestId("free-context-textarea");
    await expect(textarea).toBeVisible();
    await textarea.fill("We sell to accounting firms and trust is the blocker.");

    await page.reload();

    await expect(page.getByTestId("free-context-textarea")).toHaveValue(
      "We sell to accounting firms and trust is the blocker.",
    );
  });
});

/**
 * The benchmark itself needs Firestore, which CI has no credentials for, so
 * what is pinned here is the rule that holds without it: the sample's numbers
 * are not real, and a real average printed beside them would blur the line
 * the "not your data" badge exists to draw.
 */
test("the sample result never shows a benchmark", async ({ page }) => {
  await page.goto("/r/sample");
  await expect(page.getByTestId("score-verdict").first()).toBeVisible();
  await expect(page.getByTestId("benchmark")).toHaveCount(0);
});

/**
 * What happens when the Deep dive generation fails.
 *
 * Not a hypothetical: a live verification run caught production returning
 * `DEEP_DIVE_FAILED` because Gemini was answering 503 on every model in the
 * fallback chain. No amount of client-side retry makes an upstream outage go
 * away — so what matters is that it costs the user a click, not the ten
 * questions they just answered.
 */
test.describe("when the Deep dive generation fails", () => {
  async function answerWholeDeepDive(page: import("@playwright/test").Page) {
    await page.goto("/r/sample");
    await seedOwnedResult(page);
    await page.goto("/deep-dive/sample");
    for (let i = 0; i < 10; i += 1) {
      await page.getByTestId("deep-dive-answer-option").first().click();
    }
    await page.getByTestId("free-context-textarea").fill("We sell to physiotherapists.");
  }

  test("retrying does not make them answer anything again", async ({ page }) => {
    await stubDeepDive(page, 502);
    await answerWholeDeepDive(page);
    await page.getByTestId("submit-button").click();

    // The failure is shown, with the short stable code (R-04) — not a stack.
    await expect(page.getByTestId("retry-button")).toBeVisible();
    await expect(page.getByTestId("deep-dive-answer-option")).toHaveCount(0);

    await page.unroute("**/api/submissions/*/deep-dive");
    const calls = await stubDeepDive(page, 200);
    await page.getByTestId("retry-button").click();
    await page.waitForURL("**/r/**");

    // The retry sent the SAME ten answers and the same free text, without the
    // user touching a single question again.
    expect(Object.keys(calls[0]?.contextAnswers as object)).toHaveLength(10);
    expect(calls[0]?.freeContext).toBe("We sell to physiotherapists.");
  });

  test("even a reload on the error screen keeps the ten answers", async ({ page }) => {
    // The harder promise: an outage that outlasts the tab. R-20 persists the
    // progress, so reloading lands back on the free-context screen with
    // everything still filled in — not on question 1.
    await stubDeepDive(page, 502);
    await answerWholeDeepDive(page);
    await page.getByTestId("submit-button").click();
    await expect(page.getByTestId("retry-button")).toBeVisible();

    await page.reload();

    await expect(page.getByTestId("free-context-textarea")).toHaveValue("We sell to physiotherapists.");
    const calls = await stubDeepDive(page, 200);
    await page.getByTestId("submit-button").click();
    await page.waitForURL("**/r/**");
    expect(Object.keys(calls[0]?.contextAnswers as object)).toHaveLength(10);
  });
});
