import type { Page } from "@playwright/test";
import { expect, test } from "./helpers";

/**
 * The page ground must be one continuous wash, not a tiled one.
 *
 * `--ground-lift` (tokens/shape.css) was two radial gradients painted on
 * `body`, and a background's positioning area is that element's own box.
 * `body { height: 100% }` made the box exactly one viewport tall while the
 * page scrolled well past it, so the gradients tiled — `background-repeat`
 * defaults to `repeat` — and left a hard horizontal seam at every multiple of
 * the viewport height.
 *
 * It was reported, not caught here: the seam sits at a fixed y while page
 * height varies with the copy, so the same screen showed the line at a
 * different distance from the footer in French than in English.
 *
 * A second, fainter seam survived that fix (ds-critique H-1, 2026-09-24): the
 * body's background is positioned on the root element's box, one window tall,
 * so the right-hand lift ended at y = window height. It sat on the RIGHT half
 * only, which this spec — sampling the left gutter alone — could not see.
 */

const VIEWPORT_HEIGHT = 700;

/**
 * How much the ground changes across one row of pixels, in an outer gutter,
 * AS A READER SCROLLING THE PAGE SEES IT.
 *
 * Measured only at the rows where a seam can sit — multiples of the window
 * height, where a tiled ground repeated and where the root element's box
 * ends. Scanning the whole column instead would flag the dashed rules under
 * the header and above the footer, which cross the gutter too and are meant
 * to be there.
 *
 * Why viewport shots after a scroll rather than one full-page shot: since the
 * ground is `background-attachment: fixed`, a full-page capture paints the
 * lift once relative to the FIRST window and nothing below it — a seam that
 * exists only in the screenshot, never on anyone's screen. Scrolling each
 * boundary to mid-window and shooting what is visible measures the page the
 * way it is actually looked at, which is also how the original seam was seen.
 */
async function colourStepsAtTileBoundaries(page: Page, x: number): Promise<{ y: number; step: number }[]> {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);

  const boundaries: number[] = [];
  for (let y = VIEWPORT_HEIGHT; y < height - 1; y += VIEWPORT_HEIGHT) boundaries.push(y);

  const steps: { y: number; step: number }[] = [];
  for (const y of boundaries) {
    // Aim the boundary at mid-window; near the bottom of the page the browser
    // clamps the scroll, so read back where it really landed.
    const scrollY = await page.evaluate((target) => {
      window.scrollTo(0, target);
      return window.scrollY;
    }, y - VIEWPORT_HEIGHT / 2);
    const row = y - scrollY;
    if (row < 3 || row > VIEWPORT_HEIGHT - 4) continue;

    const png = (await page.screenshot()).toString("base64");

    // Decoded by the browser itself rather than an image library: `sharp` is
    // only present here as a transitive dependency of Next, and CI should not
    // rest on that staying true.
    const step = await page.evaluate(
      async ([data, column, at]: [string, number, number]) => {
        const image = new Image();
        image.src = `data:image/png;base64,${data}`;
        await image.decode();

        // A 16-pixel-wide strip, averaged over five rows: the paper grain
        // (design I, 2026-09-28) is per-pixel noise of up to ~9/255 a
        // channel, so two single pixels differ by more than a seam's
        // threshold. A seam is a step of the MEAN; the noise averages out.
        const W = 16;
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(image, -(column - W / 2), 0);

        // Compare a few rows above the boundary with a few below, so an
        // antialiased seam edge can't hide between two sampled rows.
        const mean = (from: number) => {
          const d = ctx.getImageData(0, from, W, 5).data;
          const sum = [0, 0, 0];
          for (let i = 0; i < d.length; i += 4) for (let c = 0; c < 3; c++) sum[c]! += d[i + c]!;
          return sum.map((v) => v / (d.length / 4));
        };
        const before = mean(at - 7);
        const after = mean(at + 3);
        return Math.round(
          Math.abs(before[0]! - after[0]!) + Math.abs(before[1]! - after[1]!) + Math.abs(before[2]! - after[2]!),
        );
      },
      [png, x, row] as [string, number, number],
    );
    steps.push({ y, step });
  }
  return steps;
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

    // Both outer gutters, left and right of every container, so nothing but
    // page ground is sampled.
    //
    // The right one is not a duplicate. The body's background propagates to
    // the canvas and is positioned on the ROOT element's box, which is one
    // window tall (`html { height: 100% }`): below it the second lift — the
    // shadow at `88% 74%` — simply stops, ~7/255 per channel (21 summed, the
    // way this spec measures) on the right half of every page (ds-critique
    // H-1, 2026-09-24). At column 24 that lift has already faded to nothing,
    // so the left gutter alone never saw it: this spec passed with the seam
    // in production.
    const width = await page.evaluate(() => document.documentElement.clientWidth);
    for (const x of [24, width - 24]) {
      const steps = await colourStepsAtTileBoundaries(page, x);
      expect(steps.length).toBeGreaterThan(0);

      for (const { y, step } of steps) {
        // The ground's own dithering measures ~3/255 between neighbouring
        // rows; the tiled seam measured ~28 across this span. Ten sits
        // between the two.
        expect(step, `colour step of ${step} across y=${y} at x=${x}, one window height down`).toBeLessThan(10);
      }
    }
  });
}

test("the ground covers the whole page and never tiles", async ({ page }) => {
  await page.goto("/en");

  // The properties that together make a seam impossible — asserted
  // directly, so a future edit that reinstates either one fails here with a
  // readable reason rather than only as a colour step.
  const ground = await page.evaluate(() => {
    const cs = getComputedStyle(document.body);
    return {
      bodyHeight: Math.round(document.body.getBoundingClientRect().height),
      documentHeight: document.documentElement.scrollHeight,
      // Counted by their openings, not split on commas: the grain's data URI
      // holds commas and parentheses of its own.
      firstIsUrl: cs.backgroundImage.startsWith("url("),
      layers: (cs.backgroundImage.match(/url\("/g) ?? []).length + (cs.backgroundImage.match(/gradient\(/g) ?? []).length,
      size: cs.backgroundSize.split(", "),
      repeat: cs.backgroundRepeat.split(", "),
      attachment: cs.backgroundAttachment.split(", "),
    };
  });

  expect(ground.bodyHeight).toBe(ground.documentHeight);

  // The first layer is the paper grain (design I, 2026-09-28): a noise TILE,
  // which repeats and scrolls by design. Every layer after it is the lift,
  // which must neither tile nor scroll.
  expect(ground.firstIsUrl).toBe(true);
  const lift = ground.layers - 1;
  // One white wash since 2026-09-29 (it was two gradients before).
  expect(lift).toBeGreaterThanOrEqual(1);
  // The value of EACH layer, not the lists' lengths: a computed list always
  // has one value per layer, because a shorter declared list CYCLES — which
  // is the bug this pins. Written with two values for three layers, the
  // lift's second gradient took the grain's 160px size and its `repeat`
  // (computed: "repeat, no-repeat, repeat") and tiled the page in blotches
  // (2026-09-29). A length check passed on that page; these do not.
  expect(ground.repeat).toEqual(["repeat", ...Array(lift).fill("no-repeat")]);
  // Without `fixed` the lift is positioned on the one-window-tall root box
  // and ends at its bottom edge, tiled or not.
  expect(ground.attachment).toEqual(["scroll", ...Array(lift).fill("fixed")]);
  expect(ground.size.slice(1)).toEqual(Array(lift).fill("auto"));
});
