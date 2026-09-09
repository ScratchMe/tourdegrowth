import { expect, test } from "./helpers";

/**
 * REVIEW-03.md B1 and B3 — the landing now says what you leave with, and who
 * is behind the tool.
 *
 * These assert placement and reading order, not the presence of a class: B1
 * is only doing its job if it sits between the headline and the primary CTA
 * (the H1 poses the problem, this answers it before the button), and B3 is
 * only doing its job if it comes after the whole hero — the founder line must
 * never compete with that button.
 *
 * B3 is described as "below the fold" in REVIEW-03.md, and that is the
 * intent, but it is not asserted as an absolute y: on a short desktop window
 * the block is partly visible, and padding the page out to clear an
 * arbitrary line would be designing against a test. What is asserted is the
 * property that carries the intent — it comes after the hero, and after the
 * CTA.
 */
const WIDTHS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 900 },
];

for (const locale of ["en", "fr"] as const) {
  test(`the promise sits between the headline and the primary CTA (${locale})`, async ({ page }) => {
    await page.goto(`/${locale}`);

    const promise = page.getByTestId("landing-promise");
    await expect(promise).toBeVisible();

    const h1 = (await page.locator("h1").boundingBox())!;
    const p = (await promise.boundingBox())!;
    // The hero CTA, by testid: the header carries a button with the same
    // label, and matching by name alone picked that one — at y=26.
    const cta = (await page.getByTestId("hero-cta").boundingBox())!;

    expect(p.y).toBeGreaterThan(h1.y + h1.height);
    expect(p.y).toBeLessThan(cta.y);
  });

  test(`the founder line comes after the whole hero and links to About (${locale})`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`/${locale}`);

    const founder = page.getByTestId("landing-founder");
    const box = (await founder.boundingBox())!;
    const cta = (await page.getByTestId("hero-cta").boundingBox())!;
    const card = (await page.getByTestId("preview-card").boundingBox())!;

    // After the whole hero, both columns: someone about to start the Tour has
    // already left above, so this must not compete with the primary CTA.
    expect(box.y).toBeGreaterThan(cta.y + cta.height);
    expect(box.y).toBeGreaterThan(card.y + card.height);

    const link = founder.getByRole("link");
    await expect(link).toHaveAttribute("href", `/${locale}/about`);
    await link.click();
    await page.waitForURL(`**/${locale}/about`);
  });
}

for (const { name, width, height } of WIDTHS) {
  test(`neither line makes the landing scroll sideways in French (${name})`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/fr");
    await expect(page.getByTestId("landing-promise")).toBeVisible();
    const doc = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(doc.scroll).toBe(doc.client);
  });
}
