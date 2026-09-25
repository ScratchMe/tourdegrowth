import { expect, test } from "./helpers";

/**
 * The growth engine's page body, E0 (engine spec §7): the part that reads
 * WITHOUT JavaScript and is what a search engine indexes — the fifteen
 * numbers with their formula and where to find them, the three computed
 * ones, the FAQ, and a way to the Tour.
 *
 * Asserted with JavaScript OFF: the island renders nothing useful before
 * hydration, so a page whose catalogue only appeared client-side would pass
 * a normal browser test and still be an empty page to a crawler.
 */

for (const locale of ["en", "fr"] as const) {
  test(`${locale}: the catalogue, the computed three and the FAQ are in the HTML, without JavaScript`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    const res = await page.goto(`/${locale}/aarrr-funnel-template?engine=preview`);
    expect(res?.status()).toBe(200);

    const catalogue = page.getByTestId("engine-catalogue");
    // Fifteen numbers across the five stages, three each…
    for (const stage of ["acquisition", "activation", "retention", "referral", "revenue"]) {
      await expect(page.getByTestId(`engine-stage-${stage}`).locator("article")).toHaveCount(3);
    }
    // …plus the three computed ones, never entered.
    await expect(page.getByTestId("engine-stage-computed").locator("article")).toHaveCount(3);
    await expect(catalogue.locator("article")).toHaveCount(18);

    // Every sheet prints a formula whose placeholders were filled: a raw
    // `{event}` on an indexed page would be a visible template leak.
    const formulas = await catalogue.locator("article dd").allInnerTexts();
    expect(formulas.join("\n")).not.toMatch(/\{[a-z]+\}/i);

    await expect(page.getByTestId("engine-faq").locator("h3").first()).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await context.close();
  });
}

test("the way to the Tour is one document load of /quiz — never a router fetch first", async ({ page }) => {
  // /quiz lives under the other root layout: a next/link would fetch its RSC
  // payload (prefetch, then again on click) before reloading anyway. Checking
  // the tag name proves nothing — next/link renders an <a> too (measured:
  // with `hard` removed, a tagName assertion still passed). So this reads the
  // requests the click really makes.
  const quiz: { type: string; rsc: string | undefined }[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname === "/quiz") quiz.push({ type: r.resourceType(), rsc: r.headers()["rsc"] });
  });
  await page.goto("/fr/aarrr-funnel-template?engine=preview");
  const link = page.getByTestId("engine-tour-link");
  await expect(link).toHaveAttribute("href", "/quiz");
  await link.scrollIntoViewIfNeeded();
  await link.hover();
  await link.click();
  await page.waitForURL(/\/quiz$/);
  await page.locator("main").waitFor();
  expect(quiz).toEqual([{ type: "document", rsc: undefined }]);
});

test("the privacy promise comes before the call to action", async ({ page }) => {
  await page.goto("/en/aarrr-funnel-template?engine=preview");
  const privacy = await page.getByTestId("engine-privacy").boundingBox();
  const cta = await page.getByTestId("engine-cta").boundingBox();
  expect(privacy && cta && privacy.y + privacy.height <= cta.y).toBe(true);
});

test("the catalogue reads three sheets to a row at 1280 and one at 390", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/en/aarrr-funnel-template?engine=preview");
  const tops = await page
    .getByTestId("engine-stage-acquisition")
    .locator("article")
    .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBe(1);

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileTops = await page
    .getByTestId("engine-stage-acquisition")
    .locator("article")
    .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
  expect(new Set(mobileTops).size).toBe(3);
});
