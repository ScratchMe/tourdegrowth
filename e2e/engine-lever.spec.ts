import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { exampleState, filmState, hybridState } from "../src/lib/engine/__tests__/fixtures";
import type { EngineState } from "../src/lib/engine/types";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";
import { storedEngineEntry, writeEngineSeed } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * « Et si ? » through one lever (design system extension 07, A18 T2.c): the
 * lever of the stage a team target names, two figures from the engine's own
 * calculation, the target written where the full panel writes it, « back to
 * today », and the full panel one tap away.
 */
const L = ENGINE_COPY.lever;

async function openState(page: Page, state: EngineState, locale: "en" | "fr" = "en"): Promise<void> {
  await page.clock.setFixedTime(new Date(2026, 8, 24, 12));
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await writeEngineSeed(page, state);
  await page.reload();
  await expect(page.getByTestId("engine-board")).toBeVisible();
}
const openExample = (page: Page, locale: "en" | "fr" = "en") => openState(page, exampleState(), locale);

test("the example: activation's lever; moved, the figures follow and the target is kept; back to today; the full panel", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openExample(page);
  const card = page.getByTestId("engine-lever");
  await expect(page.getByTestId("engine-lever-title")).toHaveText(L.untouched.en);
  await expect(card.locator("label")).toHaveText("Activation rate (today 18%)");
  const mrr = page.getByTestId("engine-lever-figure-mrr12").locator("dd").first();
  const before = await mrr.innerText();

  // The arrows move a native range: four steps up, from 18 % to 22 %.
  const slider = page.getByTestId("engine-lever-slider");
  await slider.focus();
  for (let i = 0; i < 4; i++) await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("engine-lever-title")).toHaveText("What if: Activation rate, 22% instead of 18%");
  await expect(mrr).not.toHaveText(before);
  // « today » under each figure once anything moved — at the precision the move needs to read, as in the panel.
  await expect(page.getByTestId("engine-lever-figure-mrr12")).toContainText(/today ~?€/);
  await expect(page.getByTestId("engine-lever-figure-arr12")).toContainText(/today ~?€/);
  await expect.poll(async () => (await storedEngineEntry(page))?.state.whatIf?.["act.rate"]).toBe(22);

  await page.getByTestId("engine-lever-reset").click();
  await expect(page.getByTestId("engine-lever-title")).toHaveText(L.untouched.en);
  await expect(mrr).toHaveText(before);
  await expect.poll(async () => (await storedEngineEntry(page))?.state.whatIf?.["act.rate"]).toBeUndefined();

  // The full panel, as it was: opened from the card, its levers all there.
  await page.getByTestId("engine-lever-all").click();
  await expect(page.getByTestId("engine-board-whatif")).toHaveAttribute("open", "");
  await expect(page.getByTestId("engine-whatif-panel")).toBeVisible();
});

for (const locale of ["en", "fr"] as const) {
  test(`${locale} at 390px: the card never pushes the page sideways`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openExample(page, locale);
    await page.getByTestId("engine-lever").scrollIntoViewIfNeeded();
    const [scroll, client] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    expect(scroll).toBe(client);
    // The slider's row is a 44px tap row at least.
    expect((await page.getByTestId("engine-lever-slider").boundingBox())!.height).toBeGreaterThanOrEqual(44);
  });
}

/**
 * Extension 09 (A20.d T3.a): the card moved up under the money, before the
 * peloton (C54), the MRR's curve, the MRR and the ARR in twelve months, the
 * one-customer line on the film's loss, and the hybrid's total line.
 */
for (const [locale, width] of [
  ["fr", 1280],
  ["fr", 390],
  ["en", 1280],
  ["en", 390],
] as const) {
  test(`${locale} ${width}: the film's card under the money, before the peloton, with its curve at its column's width`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 1280 ? 900 : 844 });
    await openState(page, filmState(), locale);
    const top = (id: string) => page.getByTestId(id).evaluate((el) => el.getBoundingClientRect().top);
    expect(await top("engine-money-plg")).toBeLessThan(await top("engine-lever"));
    expect(await top("engine-lever")).toBeLessThan(await top("engine-board-peloton"));
    const curve = page.getByTestId("engine-lever-curve");
    await expect(curve).toBeVisible();
    // Drawn at its column's real width; on a phone its keys go under the plot.
    const [svgWidth, boxWidth] = await curve.evaluate((el) => [Number(el.querySelector("svg")!.getAttribute("width")), Math.floor(el.clientWidth)]);
    expect(svgWidth).toBe(boxWidth);
    if (width === 390) await expect(curve).toHaveAttribute("data-compact", "true");
    else await expect(curve).not.toHaveAttribute("data-compact", "true");
    await expect(page.getByTestId("engine-lever-figure-arr12")).toContainText(L.arr12[locale]);
    await expect(page.getByTestId("engine-lever-worth")).toHaveCount(0);
    await expect(curve.locator("polyline")).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });

  test(`${locale} ${width}: churn 6 → 4 % (set in the full panel) ends the film's loss on the card, and draws the what-ifs' line`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 1280 ? 900 : 844 });
    await openState(page, { ...filmState(), whatIf: { "ret.logo-churn": 4 } }, locale);
    await expect(page.getByTestId("engine-lever-worth")).toContainText(locale === "fr" ? "plus de perte" : "no longer a loss");
    await expect(page.getByTestId("engine-lever-curve").locator("polyline")).toHaveCount(2);
    await expect(page.getByTestId("engine-lever-figure-arr12")).toContainText(locale === "fr" ? "aujourd'hui ~960" : "today ~€960");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test("the hybrid: once a lever moved, both engines' MRR in twelve months on the card", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openState(page, hybridState(), "fr");
  await expect(page.getByTestId("engine-lever-total")).toHaveCount(0);
  const slider = page.getByTestId("engine-lever-slider");
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("engine-lever-total")).toContainText("Les deux moteurs dans 12");
});
