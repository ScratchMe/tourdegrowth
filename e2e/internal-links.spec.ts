import { expect, test } from "./helpers";
import { COMPARISON_ORDER, TERM_COMPARISONS } from "@/content/comparison-index";

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
  // `exact`: the page also links "AARRR vs RARRA" since SEO lot 3.
  await expect(page.getByRole("link", { name: "AARRR", exact: true })).toHaveAttribute("href", "/en/glossary/aarrr");
});

/**
 * SEO audit v1 §1.7 — the AARRR term page is the closest page to the
 * "AARRR vs X" cluster and the glossary page with the most inbound links, and
 * it pointed at none of them. It lists every comparison, read from the
 * cluster's own order so a new comparison is covered the day it ships.
 *
 * SEO lot 3 (2026-09-28, Antoine): the block is no longer AARRR's alone. The
 * three terms that are the other side of one comparison — and already draw
 * Search Console impressions — link that one (`TERM_COMPARISONS`). Every
 * other term still has no block: the map, not a habit, decides.
 *
 * Non-vacuity (2026-09-28): with the page reading the map for AARRR only,
 * this test failed on the first of the three new terms.
 */
test("the terms that draw impressions link their comparison pages, in both languages", async ({ page }) => {
  expect(TERM_COMPARISONS.aarrr).toEqual(COMPARISON_ORDER);
  for (const [term, slugs] of Object.entries(TERM_COMPARISONS)) {
    for (const locale of ["en", "fr"]) {
      await page.goto(`/${locale}/glossary/${term}`);
      const hrefs = await page
        .getByTestId("compared-with")
        .locator("a")
        .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
      expect(hrefs, `${locale}/${term}`).toEqual(slugs!.map((slug) => `/${locale}/${slug}`));
    }
  }
  await page.goto("/en/glossary/cac");
  await expect(page.getByTestId("compared-with")).toHaveCount(0);
});

/**
 * SEO lot 3 — the method page had three inbound pages (How it works, the
 * checklist, its own other language). The AARRR term page is where someone
 * who has just learned the framework asks how to apply it.
 */
test("the AARRR term page links to the diagnostic method, in the page's own language", async ({ page }) => {
  for (const locale of ["en", "fr"]) {
    await page.goto(`/${locale}/glossary/aarrr`);
    const hrefs = await page
      .getByTestId("apply-aarrr")
      .locator("a")
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    expect(hrefs, locale).toEqual([`/${locale}/startup-growth-diagnostic`]);
  }
  await page.goto("/en/glossary/retention");
  await expect(page.getByTestId("apply-aarrr")).toHaveCount(0);
});
