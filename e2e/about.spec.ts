import { expect, test } from "./helpers";

/**
 * REVIEW-02.md R2-04 — `/about`: who built this, why these questions, the
 * exact scoring rule, where AI is and isn't, how to get in touch. Checked
 * in both languages, because the copy is new in both.
 */
for (const [locale, h1, contact] of [
  ["en", /about tour de growth/i, /message me on linkedin/i],
  ["fr", /à propos de tour de growth/i, /écris-moi sur linkedin/i],
] as const) {
  test(`/${locale}/about renders the page, all fifteen questions, and the contact links`, async ({ page }) => {
    await page.goto(`/${locale}/about`);
    await expect(page.getByRole("heading", { level: 1, name: h1 })).toBeVisible();
    // The fifteen questions come from the copy library, grouped by stage.
    await expect(page.locator("main ol li")).toHaveCount(15 + 5);
    const linkedin = page.getByRole("link", { name: contact });
    await expect(linkedin).toHaveAttribute("href", /linkedin\.com/);
    await expect(linkedin).toHaveAttribute("rel", "noopener");
    await expect(page.locator("footer").getByRole("link", { name: locale === "fr" ? "À propos" : "About" })).toBeVisible();
  });
}

test("the legacy unprefixed address redirects like the other content pages", async ({ request }) => {
  const res = await request.get("/about", { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  expect(res.headers().location).toMatch(/\/(en|fr)\/about$/);
});

test("the page declares itself as an AboutPage whose main entity is the author", async ({ page }) => {
  const html = await (await page.request.get("/en/about")).text();
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) =>
    JSON.parse(m[1]!),
  ) as Record<string, unknown>[];
  const about = blocks.find((b) => b["@type"] === "AboutPage") as Record<string, unknown>;
  expect(about).toBeDefined();
  const person = about.mainEntity as Record<string, unknown>;
  expect(person["@type"]).toBe("Person");
  expect(person.jobTitle).toMatch(/growth/i);
});
