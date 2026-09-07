import { expect, test } from "./helpers";

/**
 * REVIEW-02.md R2-28 — the public metrics page exists but stays closed until
 * `METRICS_PAGE_ENABLED` says otherwise (Antoine, 2026-09-07: build it, open
 * it when the numbers are worth reading).
 *
 * What this can check without credentials is the gate, which is the part that
 * matters while the page is closed: shut by default, and shut for anything
 * other than an exact "true". The rendered figures are covered by unit tests
 * on `toPublicMetrics`, since reaching them needs a real Firestore.
 */
test("the metrics page is closed while the flag is unset", async ({ request }) => {
  for (const path of ["/en/metrics", "/fr/metrics"]) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(404);
  }
});

test("its unprefixed address still redirects like every other content page", async ({ request }) => {
  const res = await request.get("/metrics", { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  expect(res.headers().location).toMatch(/\/(en|fr)\/metrics$/);
});

test("a closed page leaves the rest of the site alone", async ({ page }) => {
  await page.goto("/en/about");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // Nothing links to /metrics yet: discovery ships with the opening, so a
  // stray link here would be a promise the flag can't keep.
  await expect(page.locator('a[href$="/metrics"]')).toHaveCount(0);
});
