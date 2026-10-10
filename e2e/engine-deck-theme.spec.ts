import { readFile } from "node:fs/promises";
import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { consumerState, exampleState } from "../src/lib/engine/__tests__/fixtures";
import type { EngineState } from "../src/lib/engine/types";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";
import { engineSeed, storedEngineEntry } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * « Fond blanc » (engine spec §19.8, C32 Q14, A14 T6): the first spec to
 * read the colour a slide is PAINTED with, on screen and in its PNG — the
 * deck specs before it checked text and sizes, never a colour. Only the
 * ground changes: the paper's #e7e1d2 becomes pure white, without its lift.
 */

async function openDeck(page: Page, locale: "en" | "fr", state: EngineState = exampleState()): Promise<void> {
  await page.clock.setFixedTime(new Date(2026, 8, 24, 12));
  await page.addInitScript((items) => {
    if (sessionStorage.getItem("e2e-engine-seeded")) return;
    for (const [key, value] of items) localStorage.setItem(key, value);
    sessionStorage.setItem("e2e-engine-seeded", "1");
  }, engineSeed(state));
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await page.getByTestId("engine-open-deck").click();
  await expect(page.getByTestId("engine-deck")).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

/** The slide's own painted ground: its background colour and whether the paper's lift is drawn over it. */
function ground(page: Page, id: string): Promise<{ color: string; image: string; theme: string | null }> {
  return page.getByTestId(`slide-${id}`).evaluate((el) => {
    const style = getComputedStyle(el);
    return { color: style.backgroundColor, image: style.backgroundImage, theme: el.getAttribute("data-theme") };
  });
}

/** The colour of one pixel of a downloaded PNG, read by the browser itself (no image library in the repo). */
async function pngPixel(page: Page, path: string, x: number, y: number): Promise<[number, number, number]> {
  const base64 = (await readFile(path)).toString("base64");
  return page.evaluate(
    async ({ data, px, py }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${data}`;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const g = canvas.getContext("2d")!;
      g.drawImage(img, 0, 0);
      const [r, gr, b] = g.getImageData(px, py, 1, 1).data;
      return [r!, gr!, b!] as [number, number, number];
    },
    { data: base64, px: x, py: y },
  );
}

for (const locale of ["en", "fr"] as const) {
  test(`the paper by default, pure white once ticked — on screen, in the file and in the PNG (${locale})`, async ({ page }) => {
    await openDeck(page, locale);
    const paper = await ground(page, "peloton");
    expect(paper).toMatchObject({ color: "rgb(231, 225, 210)", theme: "paper" });
    expect(paper.image).not.toBe("none");

    // A chart's label halo is its ground's: the paper here, white below (A21.4 — it stayed paper, a beige box on white).
    const halo = () => page.getByTestId("slide-unit-economics").getByTestId("slide-payback-chart-time").evaluate((el) => getComputedStyle(el).stroke);
    expect(await halo()).toBe("rgb(231, 225, 210)");

    await page.getByLabel(ENGINE_COPY.deck.whiteTheme[locale]).check();
    await expect(page.getByTestId("deck-white-theme")).toBeChecked();
    const white = await ground(page, "peloton");
    expect(white).toEqual({ color: "rgb(255, 255, 255)", image: "none", theme: "white" });
    expect(await halo()).toBe("rgb(255, 255, 255)");
    // Every slide follows, the appendix and the ask included.
    for (const id of ["leak", "ask", "annex"]) expect((await ground(page, id)).color).toBe("rgb(255, 255, 255)");
    expect((await storedEngineEntry(page))?.state.deck.theme).toBe("white");

    // The PNG is the slide as painted: a corner pixel, away from any ink, is white.
    const download = page.waitForEvent("download");
    await page.getByTestId("deck-png-peloton").click();
    expect(await pngPixel(page, (await (await download).path())!, 8, 8)).toEqual([255, 255, 255]);

    // Unticked, the paper comes back — and so does its colour in the PNG.
    await page.getByTestId("deck-white-theme").uncheck();
    expect((await ground(page, "peloton")).color).toBe("rgb(231, 225, 210)");
    const again = page.waitForEvent("download");
    await page.getByTestId("deck-png-peloton").click();
    const [r, g, b] = await pngPixel(page, (await (await again).path())!, 8, 8);
    expect(r).toBeGreaterThan(220);
    expect(r).toBeLessThan(250);
    expect([g, b]).not.toEqual([255, 255]);
  });
}

/*
 * A chart in the PNG (A21.9): html-to-image copies an <svg> whole without walking it, so its lines and curves lost
 * their classes' strokes in the image — no cost line, no margin line, the MRR curve filled black. The export writes
 * each SVG child's computed style inline for its duration: the pixel under the cost line is ink, not the paper.
 */
test("the PNG keeps a chart's lines: under the unit economics' cost line, ink (A21.9)", async ({ page }) => {
  await openDeck(page, "fr");
  const slide = page.getByTestId("slide-unit-economics");
  const cost = slide.locator('[data-testid="slide-payback-chart"] svg line[class*="cost"]');
  await expect(cost).toHaveCount(1);
  // The cost line's middle, in the 1 920-pixel slide's own coordinates (the slide on screen is scaled down).
  const at = await slide.evaluate((el) => {
    const box = el.getBoundingClientRect();
    const line = el.querySelector('[data-testid="slide-payback-chart"] svg line[class*="cost"]')!.getBoundingClientRect();
    const k = 1920 / box.width;
    return { x: Math.round((line.left + line.width / 2 - box.left) * k), y: Math.round((line.top + line.height / 2 - box.top) * k) };
  });
  const download = page.waitForEvent("download");
  await page.getByTestId("deck-png-unit-economics").click();
  const [r, g, b] = await pngPixel(page, (await (await download).path())!, at.x, at.y);
  // Ink is dark; the paper around it is rgb(231, 225, 210).
  expect(Math.max(r, g, b)).toBeLessThan(120);
});

/*
 * The same for an app's picture of an install (A22 APP-9, §21.6.6): its curve is a path, which html-to-image would fill
 * black without the inlined styles — a black shape under the curve, not a line. Under the cost line, ink; under the
 * curve, well above the axis, the slide's paper. The app's engine opens with the owner's preview like the SaaS's, on
 * a build whose `ENGINE_TYPES` holds the app (the CI's).
 */
test("the PNG keeps an install's curve a line: ink under the cost line, the paper under the curve (A22 APP-9)", async ({ page }) => {
  await openDeck(page, "fr", consumerState());
  const slide = page.getByTestId("slide-unit-economics");
  const chart = slide.locator('[data-testid="slide-install-payback-chart"]');
  await expect(chart).toHaveCount(1);
  await expect(slide.locator('[data-testid="slide-payback-chart"]')).toHaveCount(0);
  // The cost line's middle, and a point a little above the axis, 3/4 along it — in the 1 920-pixel slide's own coordinates.
  const at = await slide.evaluate((el) => {
    const box = el.getBoundingClientRect();
    const k = 1920 / box.width;
    const rect = (selector: string) => el.querySelector(`[data-testid="slide-install-payback-chart"] svg ${selector}`)!.getBoundingClientRect();
    const cost = rect('line[class*="cost"]');
    const axis = rect('line[class*="axis"]');
    return {
      cost: { x: Math.round((cost.left + cost.width / 2 - box.left) * k), y: Math.round((cost.top + cost.height / 2 - box.top) * k) },
      under: { x: Math.round((axis.left + axis.width * 0.75 - box.left) * k), y: Math.round((axis.top - box.top) * k) - 40 },
    };
  });
  const download = page.waitForEvent("download");
  await page.getByTestId("deck-png-unit-economics").click();
  const file = (await (await download).path())!;
  const [r, g, b] = await pngPixel(page, file, at.cost.x, at.cost.y);
  expect(Math.max(r, g, b)).toBeLessThan(120);
  // Not filled black: the paper is rgb(231, 225, 210), the slide's lighter corner is lighter still.
  const [pr, pg, pb] = await pngPixel(page, file, at.under.x, at.under.y);
  expect(Math.min(pr, pg, pb)).toBeGreaterThan(190);
});

/*
 * The PDF is the browser's print of the deck (§10.2): no file to read a pixel
 * of, so the print sheet is read where it applies — under print media, each
 * slide keeps the ground it is painted with, and `print-color-adjust: exact`
 * stops the browser dropping it, as it drops backgrounds by default
 * (engine spec §19.13, A14 T7).
 */
test("printed for the PDF, a white slide stays white and a paper one keeps its paper", async ({ page }) => {
  await openDeck(page, "fr");
  await page.getByTestId("deck-white-theme").check();
  await page.emulateMedia({ media: "print" });
  const printed = (id: string) =>
    page.getByTestId(`slide-${id}`).evaluate((el) => {
      const style = getComputedStyle(el);
      return { color: style.backgroundColor, adjust: style.printColorAdjust };
    });
  for (const id of ["peloton", "leak", "annex"]) expect(await printed(id)).toEqual({ color: "rgb(255, 255, 255)", adjust: "exact" });
  await page.emulateMedia({ media: "screen" });
  await page.getByTestId("deck-white-theme").uncheck();
  await page.emulateMedia({ media: "print" });
  expect(await printed("peloton")).toEqual({ color: "rgb(231, 225, 210)", adjust: "exact" });
});
