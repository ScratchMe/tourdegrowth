import { expect, test } from "./helpers";
import { QUESTIONS } from "@/content/copy-library";
import { GLOSSARY, type GlossaryTermId } from "@/content/glossary";
import { GLOSSARY_DEEP } from "@/content/glossary-deep";

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
  await expect(page.getByTestId("in-the-tour")).toContainText("Connais-tu ta LTV, même grossièrement\u00a0?");
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

test("the last three terms have the long page too (lot 5)", async ({ page }) => {
  await page.goto("/en/glossary/upsell-cross-sell");
  await expect(page.getByTestId("in-the-tour")).toContainText("Do you have an expansion playbook (upsell/cross-sell)?");
  await page.goto("/fr/glossary/north-star-metric");
  await expect(page.getByTestId("in-the-tour")).toContainText("Sais-tu quel pourcentage d'utilisateurs atteint ce moment\u00a0?");
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/fr/glossary/growth-loop");
  await page.getByTestId("faq").waitFor();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test("the long page does not push a phone sideways", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/fr/glossary/churn");
  await page.getByTestId("faq").waitFor();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

/**
 * A7.3.e (2026-09-30) — the four sales-assisted terms, in both languages and
 * at both widths the brief fixes. Each page renders the six long-form
 * sections, quotes the Tour question it is tied to (read from the copy
 * library, so a reworded question cannot drift from the page), links the
 * neighbours its entry names, and does not push a phone sideways: the
 * longest title of the glossary, « Conversion lead → opportunité », is the
 * one most likely to.
 */
const SALES_TERMS: GlossaryTermId[] = ["win-rate", "sales-cycle", "acv", "lead-to-opportunity"];
const SECTION_LABELS = {
  en: ["The formula", "Worked example", "Orders of magnitude", "How to improve it", "In the Tour", "Questions people ask"],
  fr: ["La formule", "Exemple chiffré", "Ordres de grandeur", "Comment l'améliorer", "Dans le Tour", "Questions fréquentes"],
} as const;

for (const id of SALES_TERMS) {
  for (const locale of ["en", "fr"] as const) {
    for (const width of [390, 1280]) {
      test(`/${locale}/glossary/${id} renders, quotes its Tour question and fits at ${width}px (A7.3.e)`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/${locale}/glossary/${id}`);
        const main = page.locator("main");
        await expect(main.getByRole("heading", { level: 1 })).toHaveText(GLOSSARY[id].term[locale]);
        for (const label of SECTION_LABELS[locale]) {
          await expect(main.getByRole("heading", { level: 2, name: label, exact: true })).toBeVisible();
        }
        const question = QUESTIONS.find((q) => q.id === GLOSSARY_DEEP[id].inTheTour.questionId)!;
        await expect(page.getByTestId("in-the-tour")).toContainText(question.question[locale]);
        await expect(page.getByTestId("faq").getByRole("heading", { level: 3 })).toHaveCount(GLOSSARY_DEEP[id].faq.length);
        for (const related of GLOSSARY[id].related) {
          await expect(main.locator(`a[href="/${locale}/glossary/${related}"]`).first()).toBeVisible();
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      });
    }
  }
}

/**
 * The other half of the mesh (GROWTH-PLAN.md 2.4): the pages that existed
 * before lead to the new ones — through the swapped `related` links, read
 * from the entries themselves rather than listed again here.
 */
test("existing term pages link the four sales-assisted terms (A7.3.e)", async ({ page }) => {
  for (const id of SALES_TERMS) {
    const parents = (Object.keys(GLOSSARY) as GlossaryTermId[]).filter(
      (other) => !SALES_TERMS.includes(other) && GLOSSARY[other].related.includes(id),
    );
    expect(parents.length, id).toBeGreaterThanOrEqual(2);
    await page.goto(`/fr/glossary/${parents[0]}`);
    await expect(page.locator(`main a[href="/fr/glossary/${id}"]`)).toHaveText(GLOSSARY[id].term.fr);
  }
});
