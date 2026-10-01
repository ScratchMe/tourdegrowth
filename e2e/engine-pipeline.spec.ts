import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { hybridState, salesAssistedState, withMonthBefore } from "../src/lib/engine/__tests__/fixtures";
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
 * Pipeline coverage (engine spec §19.4, C32 Q8, A14 T3.2): the open pipeline
 * typed under the relays, the quarter's target and the team's threshold in
 * the settings, « 2,6× l'objectif du trimestre » on the board and on the
 * relays' slide. The numbers are the pure model's (pipeline.test.ts); what a
 * browser says is here — that the box writes the month, that the settings
 * keep the target, and that it all fits a phone.
 */
const EXAMPLE_CLOCK = new Date(2026, 8, 24, 12);
const P = ENGINE_COPY.pipeline;

async function seed(page: Page, state: EngineState, locale: "en" | "fr" = "en"): Promise<void> {
  await page.clock.setFixedTime(EXAMPLE_CLOCK);
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await writeEngineSeed(page, state);
  await page.reload();
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

async function typeOpen(page: Page, value: string): Promise<void> {
  const box = page.getByTestId("engine-pipeline-open");
  await box.fill(value);
  await box.blur();
}

test("no target yet: the band says where to add it; set in the settings, the open pipeline reads as a coverage", async ({ page }) => {
  await seed(page, salesAssistedState());
  await expect(page.getByTestId("engine-pipeline-no-target")).toHaveText(P.noTarget.en);
  await expect(page.getByTestId("engine-pipeline-coverage")).toHaveCount(0);

  await page.getByTestId("engine-open-settings").click();
  await page.getByTestId("engine-setup-pipeline-target").fill("200000");
  await page.getByTestId("engine-setup-pipeline-threshold").fill("3");
  await page.getByTestId("engine-settings-save").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
  expect((await storedEngineEntry(page))?.state.setup.pipeline).toEqual({ quarterTarget: 200_000, threshold: 3 });

  await typeOpen(page, "520000");
  // 520 000 against 200 000: 2.6×, under the team's 3×.
  await expect(page.getByTestId("engine-pipeline-coverage")).toHaveText("Coverage: 2.6× the quarter's goal, below your 3× threshold");
  await expect(page.getByTestId("engine-pipeline")).toHaveAttribute("data-below", "true");
  const stored = await storedEngineEntry(page);
  expect(stored?.state.snapshots.at(-1)?.pipelineOpen).toBe(520_000);
});

test("the month before's coverage, and a past month read on its own shows its own without a box (§19.2)", async ({ page }) => {
  const state = withMonthBefore(hybridState(), (july) => void (july.pipelineOpen = 420_000));
  state.setup.pipeline = { quarterTarget: 200_000 };
  state.snapshots[state.snapshots.length - 1]!.pipelineOpen = 520_000;
  await seed(page, state, "fr");
  const band = page.getByTestId("engine-column-slg").getByTestId("engine-pipeline");
  await expect(band.getByTestId("engine-pipeline-coverage")).toHaveText("Couverture : 2,6× l'objectif du trimestre");
  await expect(band.getByTestId("engine-pipeline-previous")).toHaveText("En juillet 2026 : 2,1×");

  await page.getByTestId("engine-month-select").selectOption({ index: 1 });
  const past = page.getByTestId("engine-column-slg").getByTestId("engine-pipeline");
  await expect(past.getByTestId("engine-pipeline-coverage")).toHaveText("Couverture : 2,1× l'objectif du trimestre");
  await expect(past.getByTestId("engine-pipeline-open")).toHaveCount(0);
});

for (const locale of ["en", "fr"] as const) {
  test(`${locale}: on the relays' slide, the coverage sits on the legend's line — under the grids, above the footer, nothing under 18px`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1200 });
    const state = withMonthBefore(salesAssistedState(), (july) => void (july.pipelineOpen = 420_000));
    state.setup.pipeline = { quarterTarget: 200_000, threshold: 3 };
    state.snapshots[state.snapshots.length - 1]!.pipelineOpen = 520_000;
    await seed(page, state, locale);
    await page.getByTestId("engine-open-deck").click();
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const slide = page.getByTestId("deck-thumb-slg:peloton").locator("[data-slide]");
    await slide.scrollIntoViewIfNeeded();
    await expect(slide.getByTestId("slide-coverage")).toContainText(locale === "fr" ? "2,6×" : "2.6×");
    const m = await slide.evaluate((el) => {
      const box = el.getBoundingClientRect();
      const k = box.width / 1920;
      const y = (v: number) => Math.round((v - box.top) / k);
      const columns = [...el.querySelectorAll('[data-testid^="slide-relay-"] *')].map((c) => y(c.getBoundingClientRect().bottom));
      const coverage = el.querySelector('[data-testid="slide-coverage"]')!;
      const legendTop = Math.min(...[...coverage.parentElement!.children].map((c) => y(c.getBoundingClientRect().top)));
      const at = coverage.getBoundingClientRect();
      return {
        columnsBottom: Math.max(...columns),
        legendTop,
        coverageBottom: y(at.bottom),
        coverageRight: Math.round((at.right - box.left) / k),
        coverageHeight: Math.round(at.height / k),
        footerTop: y(el.querySelector("footer")!.getBoundingClientRect().top),
        // A transform scales the thumbnail, never the computed size.
        size: parseFloat(getComputedStyle(coverage).fontSize),
      };
    });
    const at = JSON.stringify(m);
    // Every column ends above the legend's line, which the coverage shares: no word of either under the other.
    expect(m.columnsBottom, at).toBeLessThanOrEqual(m.legendTop);
    expect(m.coverageBottom, at).toBeLessThanOrEqual(m.footerTop);
    // One line, inside the slide's 1 800px right edge, and nothing under 18px.
    expect(m.coverageHeight, at).toBeLessThan(40);
    expect(m.coverageRight, at).toBeLessThanOrEqual(1800);
    expect(m.size, at).toBeGreaterThanOrEqual(18);
  });

  test(`${locale} at 390px: the band and its box fit, nothing scrolls sideways`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const state = salesAssistedState();
    state.setup.pipeline = { quarterTarget: 200_000, threshold: 3 };
    state.snapshots[0]!.pipelineOpen = 520_000;
    await seed(page, state, locale);
    await expect(page.getByTestId("engine-pipeline-coverage")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
  });
}
