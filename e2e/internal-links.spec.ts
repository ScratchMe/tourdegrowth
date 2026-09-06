import { expect, test } from "./helpers";

/**
 * REVIEW-02.md R2-13 — the glossary was linked from nowhere that had any
 * authority: `/how-it-works` explained the five pillars without linking a
 * single term page, the landing's five chips were not links, and the
 * definition popover on the quiz and the result page was a dead end.
 */
test("How it works links each pillar heading to its glossary page", async ({ page }) => {
  await page.goto("/en/how-it-works");
  for (const pillar of ["acquisition", "activation", "retention", "referral", "revenue"]) {
    const link = page.locator(`h2 a[href="/en/glossary/${pillar}"]`);
    await expect(link, pillar).toHaveCount(1);
  }
});

test("the landing's preview chips link to the pillar pages, in the page's own language", async ({ page }) => {
  await page.goto("/fr");
  for (const pillar of ["acquisition", "activation", "retention", "referral", "revenue"]) {
    await expect(page.locator(`a[href="/fr/glossary/${pillar}"]`), pillar).toHaveCount(1);
  }
});

test("the definition popover on a result page offers the term's own page", async ({ page }) => {
  await page.goto("/r/sample?lang=en");
  await page.locator("main").waitFor();

  // Open the Retention pillar's "?" and follow its way out.
  await page.getByRole("button", { name: /definition: retention/i }).click();
  const more = page.getByRole("dialog", { name: /retention/i }).getByRole("link", { name: /learn more/i }).first();
  await expect(more).toBeVisible();
  await expect(more).toHaveAttribute("href", "/en/glossary/retention");
});

test("every pillar's glossary page links the framework it belongs to", async ({ page }) => {
  await page.goto("/en/glossary/retention");
  await expect(page.getByRole("link", { name: "AARRR" })).toHaveAttribute("href", "/en/glossary/aarrr");
});
