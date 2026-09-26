import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

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
    await grantOwnerPreview(context.request, "engine");
    const page = await context.newPage();
    const res = await page.goto(`/${locale}/aarrr-funnel-template`);
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

    // The FAQ: every question readable, every answer folded — and still in
    // the HTML, which is what a crawler reads (a closed <details> keeps it).
    const faq = page.getByTestId("engine-faq-item");
    const questions = await faq.count();
    expect(questions).toBeGreaterThanOrEqual(5);
    for (let i = 0; i < questions; i++) {
      await expect(faq.nth(i).locator("summary")).toBeVisible();
      await expect(faq.nth(i).locator("p")).toBeHidden();
    }
    expect(await faq.nth(0).locator("p").textContent()).toBeTruthy();
    await expect(page.locator("h1")).toHaveCount(1);
    await context.close();
  });
}

test("a FAQ question opens its answer, and the rest stay folded", async ({ page }) => {
  await page.goto("/en/aarrr-funnel-template");
  const faq = page.getByTestId("engine-faq-item");
  await faq.nth(1).locator("summary").click();
  await expect(faq.nth(1).locator("p")).toBeVisible();
  await expect(faq.nth(0).locator("p")).toBeHidden();
  await expect(faq.nth(2).locator("p")).toBeHidden();
});

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
  await page.goto("/fr/aarrr-funnel-template");
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
  await page.goto("/en/aarrr-funnel-template");
  const privacy = await page.getByTestId("engine-privacy").boundingBox();
  const cta = await page.getByTestId("engine-cta").boundingBox();
  expect(privacy && cta && privacy.y + privacy.height <= cta.y).toBe(true);
});

test("how long it takes comes before the tool; the fifteen cards are folded but in the HTML", async ({ page }) => {
  await page.goto("/fr/aarrr-funnel-template");
  const duration = await page.getByTestId("engine-duration").boundingBox();
  const tool = await page.locator("#engine").boundingBox();
  expect(duration && tool && duration.y + duration.height <= tool.y).toBe(true);
  // The split is counted from the catalogue's effort tags: 5 + 5 + 5 today.
  await expect(page.getByTestId("engine-duration")).toContainText("5 se lisent en cinq minutes, 5 demandent");
  const fold = page.getByTestId("engine-catalogue-toggle");
  await expect(fold).not.toHaveAttribute("open", /.*/);
  await expect(page.getByTestId("engine-stage-acquisition")).toBeHidden();
  await fold.locator("summary").click();
  await expect(page.getByTestId("engine-stage-acquisition")).toBeVisible();
});

test("the catalogue reads three sheets to a row at 1280 and one at 390", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/en/aarrr-funnel-template");
  await page.getByTestId("engine-catalogue-toggle").locator("summary").click();
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
