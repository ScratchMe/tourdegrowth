import { expect, test } from "./helpers";

/**
 * REVIEW.md R-21 — the landing scrolled sideways on a phone.
 *
 * The header is `flex-wrap: nowrap`; once the language switcher joined the
 * two nav links (R-13) it overflowed a 390px viewport in BOTH languages. The
 * fix hides the two links under 760px, as the header CTA already was — the
 * footer carries them everywhere.
 *
 * Measured, not eyeballed: `scrollWidth` versus the viewport is the one
 * number that says "this page scrolls sideways", and it is checked at four
 * widths that bracket real phones, in both languages, because the first
 * report of this bug was French-only (CLAUDE.md lesson 5).
 *
 * The computed-display assertions below name the cause the width ones only
 * imply: which header items are meant to be gone on a phone.
 *
 * What they do NOT prove is the two-class form of the hide rule in
 * `page.module.css`. Measured: with a single-class rule these specs still
 * pass, because today's stylesheet order happens to favour that file over
 * `Button.module.css`, which sets `display: inline-flex` with equal
 * specificity. The two-class form is insurance against that order changing
 * — design system extension 01 changed it once already — and no test here
 * can fail on it. Said plainly rather than implied.
 */
const WIDTHS = [320, 360, 390, 430];
const LANDINGS: [name: string, path: string][] = [
  ["FR", "/fr"],
  ["EN", "/en"],
];

for (const [name, path] of LANDINGS) {
  for (const width of WIDTHS) {
    test(`the ${name} landing does not scroll sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path);
      await page.locator("main").waitFor();

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBe(width);
    });
  }
}

test("on a phone the header drops its two nav links and its CTA, and the footer still carries the links", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/fr");
  await page.locator("main").waitFor();

  const header = page.locator("header");
  for (const label of [/comment ça marche/i, /glossaire/i, /démarre ton tour/i]) {
    await expect(header.getByRole("link", { name: label })).toBeHidden();
  }
  // The language switcher is what made the header overflow — and it is the
  // only thing here a visitor cannot reach any other way, so it stays.
  await expect(header.getByRole("group", { name: "Langue" })).toBeVisible();

  const footer = page.locator("footer");
  await expect(footer.getByRole("link", { name: /comment ça marche/i })).toBeVisible();
  await expect(footer.getByRole("link", { name: /glossaire/i })).toBeVisible();
});

test("every header item meant to be gone on a phone computes to display:none", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/fr");
  await page.locator("main").waitFor();

  const displays = await page.locator("header").evaluate((header) =>
    [...header.querySelectorAll("a")].map((a) => ({
      text: (a.textContent ?? "").trim(),
      display: getComputedStyle(a).display,
    })),
  );

  for (const label of ["Glossaire", "Comment ça marche", "Démarre ton Tour →"]) {
    const found = displays.find((d) => d.text === label);
    expect(found, `${label} is not in the header at all`).toBeTruthy();
    expect(found?.display, `${label} is still displayed on a phone`).toBe("none");
  }
});

test("on a laptop the header keeps its nav links and its CTA", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/en");
  await page.locator("main").waitFor();

  const header = page.locator("header");
  await expect(header.getByRole("link", { name: /how it works/i })).toBeVisible();
  await expect(header.getByRole("link", { name: /glossary/i })).toBeVisible();
  await expect(header.getByRole("link", { name: /start your tour/i })).toBeVisible();
});

/**
 * The other headers (result, questionnaire) carry nav links too, since the
 * post-launch nav additions. They were never measured — this pins them so a
 * future link cannot quietly reintroduce the same bug elsewhere.
 */
for (const [name, path] of [
  ["sample result", "/r/sample"],
  ["questionnaire", "/quiz"],
] as const) {
  test(`the ${name} does not scroll sideways at 390px`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto(path);
    await page.locator("main").waitFor();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBe(390);
  });
}
