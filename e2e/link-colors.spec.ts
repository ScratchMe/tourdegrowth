import { expect, test } from "./helpers";

/**
 * No link on a content page renders in the browser's default colours
 * (ds-critique H-4, 2026-09-24).
 *
 * Until `globals.css` gained a base `a` rule, any link without a class of its
 * own fell back to #0000EE — three prose links between the checklist, the
 * diagnostic method and How it works shipped that way. The accessibility
 * pass could not see it: browser blue on paper is 7.2:1, well over AA. It is
 * a brand defect, so it needs its own assertion.
 *
 * The page list is the live sitemap rather than a copy of it, so a content
 * page added later is covered the day it ships.
 *
 * About the purple: `getComputedStyle` never reports `:visited` colours (a
 * privacy rule since 2010), so rgb(85, 26, 139) cannot show up here even on a
 * visited link. It is listed because it is the other half of the default,
 * and the base rule sets one colour for every link state — so the blue check
 * is the one that proves the fix, and it proves both.
 */
const BROWSER_DEFAULTS = ["rgb(0, 0, 238)", "rgb(85, 26, 139)"];

async function contentPaths(request: import("@playwright/test").APIRequestContext): Promise<string[]> {
  const xml = await (await request.get("/sitemap.xml")).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname);
}

for (const locale of ["en", "fr"] as const) {
  test(`no link renders in browser-default colours on the ${locale} content pages`, async ({ page, request }) => {
    test.setTimeout(120_000);
    const paths = (await contentPaths(request)).filter((p) => p === `/${locale}` || p.startsWith(`/${locale}/`));
    // A floor, so a sitemap that stopped listing pages cannot pass by checking nothing.
    expect(paths.length).toBeGreaterThanOrEqual(30);

    const offenders: string[] = [];
    let linksChecked = 0;
    for (const path of paths) {
      await page.goto(path);
      const links = await page.evaluate(() =>
        [...document.querySelectorAll("a")].map((a) => ({
          text: (a.textContent ?? "").trim().slice(0, 50),
          color: getComputedStyle(a).color,
        })),
      );
      linksChecked += links.length;
      for (const link of links) {
        if (BROWSER_DEFAULTS.includes(link.color)) offenders.push(`${path}: "${link.text}" in ${link.color}`);
      }
    }

    expect(linksChecked).toBeGreaterThan(paths.length);
    expect(offenders).toEqual([]);
  });
}

test("a prose link on How it works wears the link token, and its hover", async ({ page }) => {
  await page.goto("/en/how-it-works");
  const link = page.locator("main p a").first();
  await expect(link).toBeVisible();
  // --text-link = --paint-red-deep (#a32e1f); --text-link-hover = --ink-0 (#211c15).
  await expect(link).toHaveCSS("color", "rgb(163, 46, 31)");
  await link.hover();
  await expect(link).toHaveCSS("color", "rgb(33, 28, 21)");
});
