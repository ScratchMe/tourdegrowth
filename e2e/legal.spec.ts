import { expect, seedOwnedResult, test } from "./helpers";

/**
 * REVIEW-02.md R2-03 — `/privacy` and `/terms`: the two pages that say what
 * the product records, where it goes and who publishes it. Checked in both
 * languages because the copy is new in both; the checks are about what a
 * reader gets, not about which file rendered it.
 */
// Anchored: the prose itself mentions "the date of the last update", and an
// unanchored match would resolve to that paragraph too.
const PAGES = [
  ["en", "privacy", /privacy policy/i, /^last updated/i],
  ["fr", "privacy", /politique de confidentialité/i, /^dernière mise à jour/i],
  ["en", "terms", /terms of use/i, /^last updated/i],
  ["fr", "terms", /conditions d'utilisation/i, /^dernière mise à jour/i],
] as const;

for (const [locale, doc, h1, updated] of PAGES) {
  test(`/${locale}/${doc} renders the document with its date, its sections and a working contact link`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/${doc}`);
    await expect(page.getByRole("heading", { level: 1, name: h1 })).toBeVisible();
    await expect(page.getByText(updated)).toBeVisible();
    expect(await page.locator("main section h2").count()).toBeGreaterThanOrEqual(8);

    // The placeholder never leaks, and the address is a link people can use.
    await expect(page.locator("main")).not.toContainText("{email}");
    const mailto = page.locator('main a[href^="mailto:"]').first();
    await expect(mailto).toBeVisible();

    // Reachable from the footer of this and every other page.
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: locale === "fr" ? "Confidentialité" : "Privacy" })).toHaveAttribute(
      "href",
      `/${locale}/privacy`,
    );
    await expect(footer.getByRole("link", { name: locale === "fr" ? "Conditions" : "Terms" })).toHaveAttribute(
      "href",
      `/${locale}/terms`,
    );

    // And none of this pushes the page sideways on a phone.
    await page.setViewportSize({ width: 390, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });
}

test("the unprefixed addresses redirect like the other content pages", async ({ request }) => {
  for (const path of ["/privacy", "/terms"]) {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status(), path).toBe(308);
    expect(res.headers().location, path).toMatch(new RegExp(`/(en|fr)${path}$`));
  }
});

test("both pages are in the sitemap, once per language", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  // `SITE_URL` falls back to the bare domain when NEXT_PUBLIC_SITE_URL is not
  // set (local builds and CI); production has the www form.
  for (const path of ["/en/privacy", "/fr/privacy", "/en/terms", "/fr/terms"]) {
    expect(xml, path).toMatch(new RegExp(`<loc>https://(www\\.)?tourdegrowth\\.com${path}</loc>`));
  }
});

test("the free-text field of the Deep dive says where the text goes and links to the policy", async ({ page }) => {
  // localStorage belongs to an origin: load a page first, then seed.
  await page.goto("/fr");
  await seedOwnedResult(page);
  await page.goto("/deep-dive/sample?lang=fr");
  for (let i = 0; i < 10; i += 1) {
    await page.getByTestId("deep-dive-answer-option").first().click();
  }
  await expect(page.getByTestId("free-context-textarea")).toBeVisible();

  const notice = page.getByTestId("free-context-privacy");
  await expect(notice).toBeVisible();
  await expect(notice).toContainText(/Gemini/);
  const link = notice.getByRole("link");
  await expect(link).toHaveAttribute("href", "/fr/privacy");
  await expect(link).toHaveAttribute("target", "_blank");
});
