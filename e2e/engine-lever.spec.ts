import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { exampleState } from "../src/lib/engine/__tests__/fixtures";
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

async function openExample(page: Page, locale: "en" | "fr" = "en"): Promise<void> {
  await page.clock.setFixedTime(new Date(2026, 8, 24, 12));
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await writeEngineSeed(page, exampleState());
  await page.reload();
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

test("the example: activation's lever; moved, the figures follow and the target is kept; back to today; the full panel", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openExample(page);
  const card = page.getByTestId("engine-lever");
  await expect(page.getByTestId("engine-lever-title")).toHaveText(L.untouched.en);
  await expect(card.locator("label")).toHaveText("Activation rate, today 18%");
  const mrr = page.getByTestId("engine-lever-figure-0").locator("dd").first();
  const before = await mrr.innerText();

  // The arrows move a native range: four steps up, from 18 % to 22 %.
  const slider = page.getByTestId("engine-lever-slider");
  await slider.focus();
  for (let i = 0; i < 4; i++) await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("engine-lever-title")).toHaveText("What if: Activation rate, from 18% to 22%");
  await expect(mrr).not.toHaveText(before);
  // « today » under each figure once anything moved — at the precision the move needs to read, as in the panel.
  await expect(page.getByTestId("engine-lever-figure-0")).toContainText(/today ~?€/);
  await expect(page.getByTestId("engine-lever-figure-1")).toContainText("today ");
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
