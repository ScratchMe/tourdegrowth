import { expect, test } from "./helpers";

/**
 * REVIEW-02.md R2-11 — the long-form term pages. A term with deep content
 * renders the six sections and quotes the Tour question that measures it
 * from the copy library; a term without keeps the short page it had. Both
 * languages, because the copy is new in both.
 */
test("/en/glossary/cac renders the long-form sections and quotes the Tour question", async ({ page }) => {
  await page.goto("/en/glossary/cac");
  const main = page.locator("main");
  for (const label of [
    "The formula",
    "Worked example",
    "Orders of magnitude",
    "How to improve it",
    "In the Tour",
    "Questions people ask",
  ]) {
    await expect(main.getByRole("heading", { level: 2, name: label })).toBeVisible();
  }
  // The question comes from copy-library.ts, with its three answers and points.
  const tour = page.getByTestId("in-the-tour");
  await expect(tour).toContainText("Do you know your customer acquisition cost, even roughly?");
  await expect(tour).toContainText("20 pts");
  await expect(tour).toContainText("0 pts");
  // FAQ: three real questions, as h3.
  expect(await page.getByTestId("faq").getByRole("heading", { level: 3 }).count()).toBeGreaterThanOrEqual(3);
});

test("/fr/glossary/ltv renders the same sections in French", async ({ page }) => {
  await page.goto("/fr/glossary/ltv");
  const main = page.locator("main");
  await expect(main.getByRole("heading", { level: 2, name: "La formule" })).toBeVisible();
  await expect(main.getByRole("heading", { level: 2, name: "Exemple chiffré" })).toBeVisible();
  await expect(main.getByRole("heading", { level: 2, name: "Questions fréquentes" })).toBeVisible();
  await expect(page.getByTestId("in-the-tour")).toContainText("Connais-tu ta LTV, même grossièrement ?");
});

test("a term without long-form content keeps the short page", async ({ page }) => {
  await page.goto("/en/glossary/onboarding");
  await expect(page.locator("main").getByRole("heading", { level: 2, name: "In practice" })).toBeVisible();
  await expect(page.getByTestId("in-the-tour")).toHaveCount(0);
  await expect(page.getByTestId("faq")).toHaveCount(0);
});

test("the long page does not push a phone sideways", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/fr/glossary/churn");
  await page.getByTestId("faq").waitFor();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
