import { expect, seedOwnedResult, test } from "./helpers";

/**
 * REVIEW-02.md R2-09 — a real Deep dive takes about a minute (four
 * generations in parallel since it became bilingual, ~70 s measured in
 * production), and nothing told the person about to wait. Two places now do:
 * a line under the last screen's primary button, before the wait starts,
 * and a line under the loading segments once the three messages have run
 * and the call is still going.
 */
async function reachTheLastScreen(page: import("@playwright/test").Page) {
  // localStorage belongs to an origin: load a page first, then seed.
  await page.goto("/en");
  await seedOwnedResult(page);
  await page.goto("/deep-dive/sample?lang=en");
  for (let i = 0; i < 10; i += 1) {
    await page.getByTestId("deep-dive-answer-option").first().click();
  }
  await expect(page.getByTestId("free-context-textarea")).toBeVisible();
}

test("the last Deep dive screen says the wait is about a minute, before it starts", async ({ page }) => {
  await reachTheLastScreen(page);
  const notice = page.getByTestId("wait-notice");
  await expect(notice).toBeVisible();
  await expect(notice).toHaveText(/about a minute/i);
});

test("once the three loading messages have run, the screen says this is expected", async ({ page }) => {
  await reachTheLastScreen(page);

  // A generation that takes longer than the three 2.6 s messages — the case
  // the hint exists for. Fulfilled afterwards so the run still ends on the
  // result page, not on an error.
  await page.route("**/api/submissions/*/deep-dive", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 9_000));
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "sample" }) });
  });

  await page.getByTestId("submit-button").click();
  const hint = page.getByTestId("still-working-hint");
  // Not there while the three messages are still cycling…
  await expect(hint).toHaveCount(0);
  // …and there once they are done (2 × 2.6 s) and the call is still going.
  await expect(hint).toBeVisible({ timeout: 8_000 });
  await expect(hint).toHaveText(/about a minute/i);

  await page.waitForURL(/\/r\/sample/, { timeout: 15_000 });
});
