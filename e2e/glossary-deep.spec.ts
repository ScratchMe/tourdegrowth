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

test("/en/glossary/retention quotes the retention question (lot 2)", async ({ page }) => {
  await page.goto("/en/glossary/retention");
  await expect(page.getByTestId("in-the-tour")).toContainText("Do you track a retention rate (D7/D30 or similar)?");
  expect(await page.getByTestId("faq").getByRole("heading", { level: 3 }).count()).toBeGreaterThanOrEqual(3);
});

test("/fr/glossary/viral-coefficient fits a phone (lot 2)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/fr/glossary/viral-coefficient");
  await page.getByTestId("faq").waitFor();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test("/en/glossary/revenue quotes the pricing question (lot 3)", async ({ page }) => {
  await page.goto("/en/glossary/revenue");
  await expect(page.getByTestId("in-the-tour")).toContainText("Has your pricing model been tested, not just chosen?");
  expect(await page.getByTestId("faq").getByRole("heading", { level: 3 }).count()).toBeGreaterThanOrEqual(3);
});

test("/fr/glossary/referral fits a phone (lot 3)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/fr/glossary/referral");
  await page.getByTestId("faq").waitFor();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test("/en/glossary/aarrr explains how the Tour itself is built from the framework (lot 4)", async ({ page }) => {
  await page.goto("/en/glossary/aarrr");
  const tour = page.getByTestId("in-the-tour");
  await expect(tour).toContainText("Do you have a primary acquisition channel that's identified and measured?");
  await expect(tour).toContainText(/fifteen questions/);
});

test("/fr/glossary/onboarding fits a phone (lot 4)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/fr/glossary/onboarding");
  await page.getByTestId("faq").waitFor();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test("a term without long-form content keeps the short page", async ({ page }) => {
  await page.goto("/en/glossary/growth-loop");
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
