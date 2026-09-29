import type { Page } from "@playwright/test";
import { expect, test } from "./helpers";

/**
 * Design I + B, the fidelity pass (2026-09-29): what the first build of the
 * kit got wrong against the mockup, measured on the page rather than read
 * from the stylesheets.
 *
 * - The sticky header is glazed with the RAISED paper, a step lighter than
 *   the page it floats over. The first build used the page's own paper, and
 *   the header read as part of the ground (seen by Antoine). A token test
 *   reads the rule; this reads the pixels, so a cascade that beats the rule
 *   fails here too.
 * - The landing's two calls to action sit side by side at 1280, each label
 *   on one line: the larger button of the kit first broke both labels in
 *   two in French.
 */

test.use({ viewport: { width: 1280, height: 900 } });

/** Mean colour of a 16 × 6 patch of the visible window, decoded by the browser itself. */
async function patch(page: Page, x: number, y: number): Promise<number[]> {
  const png = (await page.screenshot()).toString("base64");
  return page.evaluate(
    async ([data, px, py]: [string, number, number]) => {
      const image = new Image();
      image.src = `data:image/png;base64,${data}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(image, 0, 0);
      // Averaged: the paper grain is per-pixel noise.
      const d = ctx.getImageData(px - 8, py, 16, 6).data;
      const sum = [0, 0, 0];
      for (let i = 0; i < d.length; i += 4) for (let c = 0; c < 3; c++) sum[c]! += d[i + c]!;
      return sum.map((v) => v / (d.length / 4));
    },
    [png, x, y] as [string, number, number],
  );
}

for (const path of ["/fr", "/en/glossary", "/quiz", "/r/sample"]) {
  test(`the header is lighter than the page under it on ${path}`, async ({ page }) => {
    await page.goto(path);
    const header = await page.locator("header[data-site-header]").boundingBox();
    expect(header).not.toBeNull();
    // The right gutter: nothing but glass in the header's first rows, and
    // nothing but ground below the header.
    const x = (await page.evaluate(() => document.documentElement.clientWidth)) - 24;
    const glass = await patch(page, x, 6);
    const ground = await patch(page, x, Math.round(header!.height) + 300);
    for (let c = 0; c < 3; c++) {
      expect(glass[c]! - ground[c]!, `channel ${c}: glass ${glass.map(Math.round)} vs ground ${ground.map(Math.round)}`).toBeGreaterThan(10);
    }
  });
}

for (const locale of ["fr", "en"] as const) {
  test(`the landing's two calls to action sit side by side, one line each (${locale})`, async ({ page }) => {
    await page.goto(`/${locale}`);
    const buttons = page.getByTestId("landing-cta-row").locator(":scope > *");
    await expect(buttons).toHaveCount(2);
    const [primary, secondary] = [await buttons.nth(0).boundingBox(), await buttons.nth(1).boundingBox()];
    expect(primary && secondary).toBeTruthy();
    expect(Math.abs(primary!.y - secondary!.y)).toBeLessThan(1);
    // One line of 17px type in 17px padding and a 2px edge: 55px. Two lines would be ~72.
    for (const box of [primary!, secondary!]) expect(box.height).toBeLessThan(60);
  });
}
