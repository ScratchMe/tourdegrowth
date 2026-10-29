import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { exampleState } from "../src/lib/engine/__tests__/fixtures";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";
import { engineSeed } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The page for both visits (A18 T4, design system extension 07,
 * `EngineLanding`). One prerendered HTML; a returning reader — this device
 * holds an engine — is known before the first paint by an inline script that
 * only asks whether the storage key exists, and the page draws its short
 * version by CSS alone: the H1 at a section's size, the promise in one line,
 * then the tool, its place held by a dashed box until the board renders.
 *
 * « Before the first paint » is read with the island's JavaScript blocked: the
 * inline script runs, nothing else does, and the page is already short.
 */

const PATH = "/en/aarrr-funnel-template";

/** The engine on the device before the page's own scripts run. */
async function seed(page: Page): Promise<void> {
  await page.clock.setFixedTime(new Date(2026, 8, 24, 12));
  await page.addInitScript((items) => {
    for (const [key, value] of items) localStorage.setItem(key, value);
  }, engineSeed(exampleState()));
}

/** Every script of the build blocked: what the reader has before the island hydrates. */
async function withoutTheIsland(page: Page): Promise<void> {
  await page.route(/\/_next\/static\/.*\.js(\?.*)?$/, (route) => route.abort());
}

test("a first visit: the introduction, the promise as a card before the call to action, how long it takes under the tool", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(PATH);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await expect(page.locator("html")).not.toHaveAttribute("data-engine", /.*/);
  await expect(page.getByText(ENGINE_COPY.page.positioning.en)).toBeVisible();
  await expect(page.getByTestId("engine-privacy")).toBeVisible();
  await expect(page.getByTestId("engine-privacy-line")).toBeHidden();
  await expect(page.getByTestId("engine-cta")).toBeVisible();
  await expect(page.getByTestId("engine-reserve")).toBeHidden();
  // The page's one primary is the start card's: the hero's anchor is drawn secondary.
  await expect(page.getByTestId("engine-start-go")).toBeVisible();
  expect(await page.getByTestId("engine-cta").getAttribute("class")).not.toMatch(/primary/);
  const tool = (await page.locator("#engine").boundingBox())!;
  const duration = (await page.getByTestId("engine-duration").boundingBox())!;
  expect(duration.y).toBeGreaterThanOrEqual(tool.y + tool.height);
});

for (const [width, height] of [
  [1280, 900],
  [390, 844],
] as const) {
  test(`returning at ${width}px: short before the island runs — the H1, the promise in one line, the tool's place held`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await seed(page);
    await withoutTheIsland(page);
    await page.goto(PATH);
    await expect(page.locator("html")).toHaveAttribute("data-engine", "known");
    // Hidden, never removed: a search engine reads the first visit's page from the same HTML.
    await expect(page.getByText(ENGINE_COPY.page.positioning.en)).toBeHidden();
    await expect(page.getByText(ENGINE_COPY.page.positioning.en)).toHaveCount(1);
    await expect(page.getByTestId("engine-privacy")).toBeHidden();
    await expect(page.getByTestId("engine-cta")).toBeHidden();
    await expect(page.getByTestId("engine-stopwatch")).toBeHidden();
    await expect(page.getByTestId("engine-privacy-line")).toHaveText(ENGINE_COPY.page.promiseLine.en);
    const reserve = page.getByTestId("engine-reserve");
    await expect(reserve).toHaveText(ENGINE_COPY.page.reserve.en);
    // The tool starts high: the return measured 287px at 1280 and 288 at 390, against 1,267 and 1,849 before.
    const top = (await page.locator("#engine").boundingBox())!.y;
    expect(top).toBeLessThan(500);
    // The reserve holds the tool's place, within the first screen at 1280.
    const held = (await reserve.boundingBox())!;
    expect(held.height).toBeGreaterThanOrEqual(width < 761 ? 640 : 560);
  });
}

test("returning, the island read: the board takes the reserve's place, the H1 stays one, at a section's size", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await seed(page);
  await page.goto(PATH);
  await expect(page.getByTestId("engine-board")).toBeVisible();
  await expect(page.getByTestId("engine-reserve")).toBeHidden();
  await expect(page.locator("h1")).toHaveCount(1);
  const returning = await page.locator("h1").evaluate((h) => parseFloat(getComputedStyle(h).fontSize));
  await page.evaluate(() => document.documentElement.removeAttribute("data-engine"));
  const firstVisit = await page.locator("h1").evaluate((h) => parseFloat(getComputedStyle(h).fontSize));
  expect(returning).toBeLessThan(firstVisit);
});

test("what a search engine reads: the first visit's page, the script that reads no value", async ({ context }) => {
  // The context's own request: it carries the owner's preview, which opens the page while it ships closed.
  const html = await (await context.request.get(PATH)).text();
  for (const text of [ENGINE_COPY.page.title.en, ENGINE_COPY.page.positioning.en, ENGINE_COPY.page.privacyTitle.en]) {
    expect(html).toContain(text.replace(/'/g, "&#x27;"));
  }
  expect(html).toContain('setAttribute("data-engine","known")');
  // The engine's key, not a value: nothing in the HTML carries what someone typed.
  expect(html).toContain("tdg.engines.v3");
});

/**
 * Antoine, 2026-10-29: « encore lourd à lire », and rules of four widths on one page. Two things hold since.
 *
 * Starting an engine folds what presents it — the introduction above the tool, how long it takes, the catalogue,
 * the FAQ and the way to the Tour under it — and brings the tool back to the top of the screen, the person's place
 * having moved up under them. Non-vacuity, measured on 2026-10-29: against the build before the change, the
 * introduction and the four blocks stay visible and this spec fails on the first of them.
 */
test("starting an engine folds what presents it, and the tool comes back to the top of the screen", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(PATH);
  await page.getByTestId("engine-start-go").click();
  await expect(page.locator("#engine-targets-title")).toBeFocused();
  await expect(page.getByText(ENGINE_COPY.page.positioning.en)).toBeHidden();
  for (const id of ["engine-duration", "engine-catalogue", "engine-faq", "engine-tour-link"]) {
    await expect(page.getByTestId(id), id).toBeHidden();
  }
  await expect(page.getByTestId("engine-privacy-line")).toBeVisible();
  const top = (await page.locator("#engine").boundingBox())!.y;
  expect(top).toBeGreaterThanOrEqual(-1);
  expect(top).toBeLessThan(900);
});

/**
 * One column, one list width. The board broke out of the page's column by 40px on each side from a 960px
 * window, and the FAQ's rules stopped at 576px where « Tes chiffres » stops at 720. Non-vacuity, measured on
 * 2026-10-29: against the build before the change, the board's edges sit 40px outside the tool's and the FAQ
 * row measures 576px.
 */
test("the board keeps to the page's column, and the FAQ's rows to the engine's list width", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(PATH);
  const measure = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--engine-measure")));
  expect((await page.getByTestId("engine-faq-item").first().boundingBox())!.width).toBeCloseTo(measure, 0);
  const column = (await page.locator("#engine").boundingBox())!;
  for (const id of ["engine-duration", "engine-catalogue", "engine-faq"]) {
    const box = (await page.getByTestId(id).boundingBox())!;
    expect([box.x, box.width], id).toEqual([column.x, column.width]);
  }

  await seed(page);
  await page.goto(PATH);
  await expect(page.getByTestId("engine-board")).toBeVisible();
  const board = (await page.getByTestId("engine-board").boundingBox())!;
  const tool = (await page.locator("#engine").boundingBox())!;
  expect([board.x, board.width]).toEqual([tool.x, tool.width]);
});
