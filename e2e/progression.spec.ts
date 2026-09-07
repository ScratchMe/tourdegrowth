import { expect, test } from "./helpers";

/**
 * REVIEW-02.md R2-27 — progression between two Tours. The data was already
 * on the device since R-01 and R-20; only the reading was missing, and it is
 * the one reason to come back in three months.
 *
 * Seeded through localStorage rather than by taking two real Tours: the
 * store is exactly what the feature reads, and two full runs would test the
 * questionnaire again rather than this.
 */
const TWO_TOURS = [
  { id: "22222222-2222-4222-8222-222222222222", ownerToken: "t2", createdAt: "2026-09-07T10:00:00.000Z", total: 66 },
  { id: "11111111-1111-4111-8111-111111111111", ownerToken: "t1", createdAt: "2026-09-01T10:00:00.000Z", total: 58 },
];

async function seed(page: import("@playwright/test").Page, results: unknown[]) {
  await page.goto("/en");
  await page.evaluate((r) => localStorage.setItem("tdg.results.v1", JSON.stringify(r)), results);
}

test("the landing shows the delta once there are two scored Tours", async ({ page }) => {
  await seed(page, TWO_TOURS);
  await page.goto("/en");
  await expect(page.getByTestId("last-result-link")).toBeVisible();
  await expect(page.getByTestId("progression")).toHaveText(/58\s*→\s*66,\s*\+8/);
});

test("a first-ever Tour gets the link but no delta", async ({ page }) => {
  await seed(page, [TWO_TOURS[0]]);
  await page.goto("/en");
  await expect(page.getByTestId("last-result-link")).toBeVisible();
  await expect(page.getByTestId("progression")).toHaveCount(0);
});

test("a drop is shown as a drop, in French too", async ({ page }) => {
  await seed(page, [
    { ...TWO_TOURS[0]!, total: 51 },
    { ...TWO_TOURS[1]!, total: 60 },
  ]);
  await page.goto("/fr");
  await expect(page.getByTestId("progression")).toHaveText(/Tour précédent : 60 → 51, -9/);
});

test("a visitor with no history sees nothing at all", async ({ page }) => {
  await page.goto("/en");
  await page.evaluate(() => localStorage.clear());
  await page.goto("/en");
  await expect(page.getByTestId("last-result-link")).toHaveCount(0);
  await expect(page.getByTestId("progression")).toHaveCount(0);
});

test("the sample result never shows a progression — it is nobody's Tour", async ({ page }) => {
  await seed(page, TWO_TOURS);
  await page.goto("/r/sample");
  await expect(page.getByRole("heading", { level: 1 }).or(page.locator("main"))).toBeVisible();
  await expect(page.getByTestId("result-progression")).toHaveCount(0);
});
