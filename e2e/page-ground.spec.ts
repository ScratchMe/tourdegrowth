import type { Page } from "@playwright/test";
import { expect, test } from "./helpers";

/**
 * The page ground must be one continuous wash, not a tiled one.
 *
 * `--ground-lift` (tokens/shape.css) is two radial gradients painted on
 * `body`, and a background's positioning area is that element's own box.
 * `body { height: 100% }` made the box exactly one viewport tall while the
 * page scrolled well past it, so the gradients tiled — `background-repeat`
 * defaults to `repeat` — and left a hard horizontal seam at every multiple of
 * the viewport height.
 *
 * It was reported, not caught here: the seam sits at a fixed y while page
 * height varies with the copy, so the same screen showed the line at a
 * different distance from the footer in French than in English.
 */

const VIEWPORT_HEIGHT = 700;

/**
 * How much the ground changes across one row of pixels, in the outer gutter.
 *
 * Measured only at the rows where a tiled ground would seam — multiples of
 * the box height. Scanning the whole column instead would flag the dashed
 * rules under the header and above the footer, which cross the gutter too and
 * are meant to be there.
 */
async function colourStepsAtTileBoundaries(page: Page, x: number): Promise<{ y: number; step: number }[]> {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const png = (await page.screenshot({ fullPage: true })).toString("base64");

  const boundaries: number[] = [];
  for (let y = VIEWPORT_HEIGHT; y < height - 1; y += VIEWPORT_HEIGHT) boundaries.push(y);

  // Decoded by the browser itself rather than an image library: `sharp` is
  // only present here as a transitive dependency of Next, and CI should not
  // rest on that staying true.
  return page.evaluate(
    async ([data, column, rows]: [string, number, number[]]) => {
      const image = new Image();
      image.src = `data:image/png;base64,${data}`;
      await image.decode();

      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(image, -(column as number), 0);

      return (rows as number[]).map((y) => {
        // Compare a few rows above the boundary with a few below, so an
        // antialiased seam edge can't hide between two sampled rows.
        const at = (row: number) => {
          const px = ctx.getImageData(0, row, 1, 1).data;
          return [px[0]!, px[1]!, px[2]!] as const;
        };
        const before = at(Math.max(y - 3, 0));
        const after = at(Math.min(y + 3, image.naturalHeight - 1));
        const step =
          Math.abs(before[0] - after[0]) + Math.abs(before[1] - after[1]) + Math.abs(before[2] - after[2]);
        return { y, step };
      });
    },
    [png, x, boundaries] as [string, number, number[]],
  );
}

// A window shorter than every one of these pages, so a tiled ground would
// have to repeat at least once inside the shot.
test.use({ viewport: { width: 1280, height: VIEWPORT_HEIGHT } });

for (const path of ["/en", "/fr", "/en/glossary/viral-coefficient", "/r/sample"]) {
  test(`no seam in the page ground on ${path}`, async ({ page }) => {
    await page.goto(path);

    const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    expect(documentHeight, "the page must be taller than the window for this to prove anything").toBeGreaterThan(
      VIEWPORT_HEIGHT,
    );

    // Column 24: the outer gutter, left of every container, so nothing but
    // page ground is sampled.
    const steps = await colourStepsAtTileBoundaries(page, 24);
    expect(steps.length).toBeGreaterThan(0);

    for (const { y, step } of steps) {
      // The ground's own dithering measures ~3/255 between neighbouring rows;
      // the seam measured ~28 across this span. Ten sits between the two.
      expect(step, `colour step of ${step} across y=${y}, one window height down the page`).toBeLessThan(10);
    }
  });
}

test("the ground covers the whole page and never tiles", async ({ page }) => {
  await page.goto("/en");

  // The two properties that together make a seam impossible — asserted
  // directly, so a future edit that reinstates either one fails here with a
  // readable reason rather than only as a colour step.
  const ground = await page.evaluate(() => ({
    bodyHeight: Math.round(document.body.getBoundingClientRect().height),
    documentHeight: document.documentElement.scrollHeight,
    repeat: getComputedStyle(document.body).backgroundRepeat,
  }));

  expect(ground.bodyHeight).toBe(ground.documentHeight);
  expect(ground.repeat).toMatch(/^no-repeat(, no-repeat)*$/);
});
