import { expect, test, trackedEvents } from "./helpers";

/**
 * REVIEW-03.md C1 — the 30-day nudge on the landing.
 *
 * With no email and no account (SPEC.md §5) the device is the only channel
 * this product has, so this line is the whole of its "come back" mechanism.
 *
 * Dates here are RELATIVE to the moment the test runs, never fixed: a
 * literal like "2026-09-07" is fresh today and stale next month, so a spec
 * written that way starts asserting the opposite of what it was written for
 * without anyone touching it.
 */
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

const result = (days: number, total = 66) => ({
  id: "22222222-2222-4222-8222-222222222222",
  ownerToken: "t2",
  createdAt: daysAgo(days),
  total,
});

async function seed(page: import("@playwright/test").Page, results: unknown[], path = "/en") {
  await page.goto(path);
  await page.evaluate((r) => localStorage.setItem("tdg.results.v1", JSON.stringify(r)), results);
  await page.goto(path);
}

test("a Tour older than a month is nudged, counted in weeks", async ({ page }) => {
  await seed(page, [result(40)]);
  await expect(page.getByTestId("retake-nudge")).toHaveText(/Your last Tour was 5 weeks ago/);
});

test("a recent Tour gets the link back but no nudge", async ({ page }) => {
  await seed(page, [result(5)]);
  await expect(page.getByTestId("last-result-link")).toBeVisible();
  await expect(page.getByTestId("retake-nudge")).toHaveCount(0);
});

/* "52 semaines" reads worse than "12 mois", so past two months the unit changes. */
test("past two months it counts in months instead", async ({ page }) => {
  await seed(page, [result(100)]);
  await expect(page.getByTestId("retake-nudge")).toHaveText(/Your last Tour was 3 months ago/);
});

test("the nudge is translated, not just the landing around it", async ({ page }) => {
  await seed(page, [result(40)], "/fr");
  await expect(page.getByTestId("retake-nudge")).toHaveText(/Ton dernier Tour date de 5 semaines/);
  await expect(page.getByTestId("retake-nudge-link")).toHaveText("le refaire\u00a0?");
});

/* `retake_started` alone cannot say whether the nudge works — it counts every
   retake, nudged or not. This event is what separates the two. */
test("clicking the nudge reaches the quiz and is counted", async ({ page }) => {
  await seed(page, [result(40)]);

  // The landing and the quiz sit under different root layouts (R-24), so
  // this link is a full document load and `window.__tdgEvents` is gone by
  // the time the quiz renders. Hold the first click so the event can be
  // read from the document that fired it, then let the second one navigate.
  //
  // The nudge only renders after its effect has read the device, so wait
  // for the link before holding it. `querySelector` does not wait: under
  // load it found nothing, `?.` held nothing, the first click navigated and
  // the quiz's fresh event list read empty (seen 2026-09-29, 3 in 280 runs
  // at four workers). Throw rather than hold nothing silently.
  await expect(page.getByTestId("retake-nudge-link")).toBeVisible();
  await page.evaluate(() => {
    const link = document.querySelector('[data-testid="retake-nudge-link"]');
    if (!link) throw new Error("the nudge link is not in the page");
    link.addEventListener("click", (e) => e.preventDefault(), { once: true });
  });
  await page.getByTestId("retake-nudge-link").click();
  // Polled: the analytics script loads `afterInteractive`, and a click that
  // beats it is queued, then flushed when it arrives.
  await expect.poll(() => trackedEvents(page)).toContain("retake_nudge_clicked");

  await page.getByTestId("retake-nudge-link").click();
  await page.waitForURL(/\/quiz/);
  await expect(page.getByTestId("answer-option").first()).toBeVisible();
});

/* Someone who has never taken a Tour is most of this page's traffic: they
   must see none of this machinery. */
test("a newcomer sees no nudge at all", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByTestId("retake-nudge")).toHaveCount(0);
  await expect(page.getByTestId("last-result-link")).toHaveCount(0);
});
