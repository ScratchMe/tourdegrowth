import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import type { EngineState } from "../src/lib/engine/types";
import { exampleState, filmState, hybridState, noMarginState, salesAssistedState } from "../src/lib/engine/__tests__/fixtures";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";
import { writeEngineSeed } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The money on the board (design system extension 09, A20.d T2): right
 * after the diagnosis, before the peloton; the loss as an ink tag, never
 * red; « ? » where the margin is missing; the « ? » of « cash tied up »; in
 * both languages, at 1280 and 390.
 */
const M = ENGINE_COPY.money;
const T = ENGINE_COPY.terms;

async function open(page: Page, state: EngineState, locale: "en" | "fr"): Promise<void> {
  await page.clock.setFixedTime(new Date(2026, 8, 24, 12));
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await writeEngineSeed(page, state);
  await page.reload();
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

for (const [locale, width] of [
  ["fr", 1280],
  ["fr", 390],
  ["en", 1280],
  ["en", 390],
] as const) {
  test(`${locale} ${width}: the film's SaaS — the loss, said once, in ink; the cash; the money before the peloton`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 1280 ? 900 : 844 });
    await open(page, filmState(), locale);
    const money = page.getByTestId("engine-money-plg");
    await expect(money).toBeVisible();
    await expect(money.getByRole("heading", { level: 2 })).toHaveText(locale === "fr" ? "L'argent · août 2026" : "The money · August 2026");
    await expect(page.getByTestId("engine-money-plg-figure-arr")).toContainText(locale === "fr" ? "576 000 €" : "€576,000");
    const tag = page.getByTestId("engine-money-plg-tag");
    await expect(tag).toHaveText(M.tagLoss[locale]);
    // Ink, never the leak's red: the tag's background is the inverse surface, not the alert.
    const [bg, ink] = await tag.evaluate((el) => [getComputedStyle(el).backgroundColor, getComputedStyle(document.documentElement).getPropertyValue("--ink-0").trim()]);
    expect(bg).toBe(hexToRgb(ink));
    await expect(page.getByTestId("engine-money-plg-finding")).toContainText(locale === "fr" ? "tu perds ~400 € sur chacun" : "you lose ~€400 on each one");
    await expect(page.getByTestId("engine-money-bars")).toBeVisible();
    await expect(page.getByTestId("engine-money-plg-cash")).toContainText(M.lineLoss[locale]);
    // No warning with a certain loss.
    await expect(page.getByTestId("engine-money-warning")).toHaveCount(0);
    // C54: right after the diagnosis, before the peloton.
    const order = await page.evaluate(() => {
      const top = (id: string) => document.querySelector(`[data-testid="${id}"]`)!.getBoundingClientRect().top;
      return [top("engine-money-plg"), top("engine-board-peloton")];
    });
    expect(order[0]).toBeLessThan(order[1]!);
    // The page never scrolls sideways.
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test("the §6.0 example has its money in ranges (C50): an estimated margin, healthy, neither loss nor warning", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await open(page, exampleState(), "en");
  await expect(page.getByTestId("engine-money-plg-tag")).toHaveCount(0);
  await expect(page.getByTestId("engine-money-plg-finding")).toHaveText("Each new customer costs €500 and brings back ~€3,000–€3,500 of margin: ~€2,500–€3,000 more than it costs.");
  await expect(page.getByTestId("engine-money-warning")).toHaveCount(0);
});

test("the ARR's « ? » says it is the MRR × 12, extrapolated, not revenue in the bank (bon à tirer nº10)", async ({ page }) => {
  for (const locale of ["fr", "en"] as const) {
    await page.setViewportSize({ width: locale === "fr" ? 390 : 1280, height: 900 });
    await open(page, exampleState(), locale);
    const figure = page.getByTestId("engine-money-plg-figure-arr");
    await expect(figure).toContainText(M.arr[locale]);
    const term = figure.getByTestId("engine-term-arr");
    await expect(term).toHaveAttribute("aria-label", T.label[locale].replace("{term}", T.arr.term[locale]));
    await term.click();
    await expect(page.getByRole("dialog")).toContainText(T.arr.definition[locale]);
    // Read as body text, not in the label's capitals.
    expect(await page.getByRole("dialog").evaluate((el) => getComputedStyle(el).textTransform)).toBe("none");
    // The MRR, the typed fact, has none.
    await expect(page.getByTestId("engine-money-plg-figure-mrr").getByTestId(/^engine-term-/)).toHaveCount(0);
  }
});

test("without a margin: « ? », what is missing, and the « ? » of « cash tied up » teaches the word", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  // The example as it was before C50 gave it a margin.
  await open(page, noMarginState(), "en");
  await expect(page.getByTestId("engine-money-plg-tag")).toHaveCount(0);
  await expect(page.getByTestId("engine-money-plg-finding")).toHaveText("We can't tell yet what a new customer brings back. Missing: gross margin.");
  await expect(page.getByTestId("engine-money-plg-fact-tied")).toContainText("?");
  const term = page.getByTestId("engine-term-cashTied");
  await expect(term).toHaveAttribute("aria-label", T.label.en.replace("{term}", T.cashTied.term.en));
  await term.click();
  await expect(page.getByRole("dialog")).toContainText(T.cashTied.definition.en);
});

test("the sales-assisted engine has its own block; the hybrid, the engine it shows, without MRR and ARR of its own", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, salesAssistedState(), "fr");
  await expect(page.getByTestId("engine-money-slg")).toBeVisible();
  await expect(page.getByTestId("engine-money-plg")).toHaveCount(0);
  await open(page, hybridState(), "fr");
  // « Moteur affiché » (A18 T5): one engine's board at a time, self-serve by default.
  await expect(page.getByTestId("engine-money-plg")).toBeVisible();
  await expect(page.getByTestId("engine-money-slg")).toHaveCount(0);
  await page.getByTestId("engine-motion-selector").getByRole("button", { name: ENGINE_COPY.hybrid.motionName.slg.fr }).click();
  await expect(page.getByTestId("engine-money-slg")).toBeVisible();
  await expect(page.getByTestId("engine-money-plg")).toHaveCount(0);
  // The total band says the sum (A20.d T3): no figure of either engine's own.
  await expect(page.locator('[data-testid^="engine-money-"][data-testid*="-figure-"]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}
