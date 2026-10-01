import { expect, seedOwnedResult, test } from "./helpers";

/**
 * REVIEW-02.md R2-09 — a real Deep dive takes about a minute (four
 * generations in parallel since it became bilingual, ~70 s measured in
 * production), and nothing told the person about to wait. Two places now do:
 * a line under the last screen's primary button, before the wait starts,
 * and a line under the wait's bar once its first seconds have passed and the
 * call is still going (5.2 s, the moment the three messages of the old
 * screen used to run out; A14.6 kept it).
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

test("once the first seconds of the wait have passed, the screen says this is expected", async ({ page }) => {
  await reachTheLastScreen(page);

  // A generation that takes longer than the first seconds — the case the
  // hint exists for. Fulfilled afterwards so the run still ends on the
  // result page, not on an error.
  await page.route("**/api/submissions/*/deep-dive", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 9_000));
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "sample" }) });
  });

  await page.getByTestId("submit-button").click();
  const hint = page.getByTestId("still-working-hint");
  // Not there in the first seconds…
  await expect(hint).toHaveCount(0);
  // …and there after 5.2 s, the call still going.
  await expect(hint).toBeVisible({ timeout: 8_000 });
  await expect(hint).toHaveText(/about a minute/i);

  await page.waitForURL(/\/r\/sample/, { timeout: 15_000 });
});

/*
 * A14.6 (2026-10-01, approved by Antoine): the wait is told by the clock.
 * The bar used to follow three messages on a 2.6 s timer — full at 5.2 s for
 * a wait of up to 70 s. Now it follows the time spent against the usual
 * minute, slows as it goes and never fills; only the answer ends the wait.
 * The clock is Playwright's, fast-forwarded: what matters is that the screen
 * follows `performance.now`, not that this spec waits two minutes.
 *
 * Non-vacuity (2026-10-01): with the old bar back (full from 5.2 s), exactly
 * this test falls, at ten seconds (0.54 and rising, against at most 0.4); the
 * two above pass.
 */
test("the wait is told by the clock: the bar follows the time spent and never fills, the time spent beside it", async ({ page }) => {
  await page.clock.install();
  await reachTheLastScreen(page);
  let answer!: () => void;
  const answered = new Promise<void>((resolve) => (answer = resolve));
  await page.route("**/api/submissions/*/deep-dive", async (route) => {
    await answered;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "sample" }) });
  });
  await page.getByTestId("submit-button").click();

  const fill = page.getByTestId("wait-fill");
  const clock = page.getByTestId("wait-clock");
  const share = () => fill.evaluate((el) => el.getBoundingClientRect().width / el.parentElement!.getBoundingClientRect().width);
  await expect(fill).toBeAttached();

  await page.clock.runFor(10_000);
  await expect(clock).toHaveText(/^0:1\d$/);
  await expect.poll(share).toBeGreaterThan(0.2);
  expect(await share()).toBeLessThan(0.4);

  await page.clock.runFor(50_000);
  await expect(clock).toHaveText(/^1:0\d$/);
  await expect.poll(share).toBeGreaterThan(0.8);
  expect(await share()).toBeLessThan(0.9);

  // Past the route's own ceiling: still not full, still waiting.
  await page.clock.runFor(60_000);
  await expect(clock).toHaveText(/^2:0\d$/);
  await expect.poll(share).toBeGreaterThan(0.95);
  expect(await share()).toBeLessThan(1);
  await expect(page.getByTestId("deep-dive-wait")).toBeVisible();

  answer();
  await page.waitForURL(/\/r\/sample/);
});
