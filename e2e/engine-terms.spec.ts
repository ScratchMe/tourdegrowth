import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { exampleState, hybridState } from "../src/lib/engine/__tests__/fixtures";
import type { EngineState } from "@/lib/engine/types";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";
import { openNumber, writeEngineSeed } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The words (A18 T6, C42): the five « ? » of the return 07 — « cohorte »,
 * « cible », « repère », « fenêtre », « nombre partagé » — each where its word
 * is first needed, one definition open at a time; and the renamed labels the
 * board and its screens print. Both languages.
 */

const T = ENGINE_COPY.terms;

async function seed(page: Page, state: EngineState, locale: "en" | "fr"): Promise<void> {
  await page.clock.setFixedTime(new Date(2026, 8, 24, 12));
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await writeEngineSeed(page, state);
  await page.reload();
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

for (const locale of ["fr", "en"] as const) {
  test(`${locale}: a cohort number's screen — « cohort » on its months, « reference » and « target » in How it compares, one open at a time`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await seed(page, exampleState(), locale);
    await openNumber(page, "act-rate");
    const cohort = page.getByTestId("engine-term-cohort");
    await expect(cohort).toHaveAttribute("aria-label", T.label[locale].replace("{term}", T.cohort.term[locale]));
    await cohort.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toHaveCount(1);
    await expect(dialog).toContainText(T.cohort.definition[locale]);
    await expect(cohort).toHaveAttribute("aria-expanded", "true");

    // Another « ? » closes the first: one definition at a time.
    await page.getByTestId("engine-term-target").click();
    await expect(page.getByRole("dialog")).toHaveCount(1);
    await expect(page.getByRole("dialog")).toContainText(T.target.definition[locale]);
    await expect(cohort).toHaveAttribute("aria-expanded", "false");
    const axe = await new AxeBuilder({ page }).include('[data-testid="engine-workbench"]').analyze();
    expect(axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await page.getByTestId("engine-term-reference").click();
    await expect(page.getByRole("dialog")).toContainText(T.reference.definition[locale]);
  });

  test(`${locale}: the settings — « window » under the activation window, « target » and « shared count » on their sections`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await seed(page, exampleState(), locale);
    await page.getByTestId("engine-bar-settings").click();
    const settings = page.getByTestId("engine-settings");
    await expect(settings).toContainText(ENGINE_COPY.settings.windowHint[locale]);
    for (const id of ["window", "target", "sharedCount"] as const) {
      await settings.getByTestId(`engine-term-${id}`).click();
      await expect(page.getByRole("dialog")).toContainText(T[id].definition[locale]);
      await page.keyboard.press("Escape");
    }
    // The flows' month, renamed (C42).
    await expect(settings.getByText(ENGINE_COPY.setup.referenceMonth[locale], { exact: true })).toBeVisible();
  });

  test(`${locale}: the renamed labels — the peloton's title, the Tour's section, the hybrid's link and its two engines`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await seed(page, hybridState(), locale);
    await expect(page.getByTestId("peloton-title")).toHaveText(ENGINE_COPY.board.pelotonTitle[locale]);
    await expect(page.getByTestId("engine-mirror")).toContainText(ENGINE_COPY.mirror.title[locale]);
    await expect(page.getByTestId("engine-two-segments")).toHaveText(ENGINE_COPY.hybrid.twoEngines[locale]);
    await page.getByTestId("engine-motion-selector").getByRole("button", { name: ENGINE_COPY.hybrid.motionName.slg[locale] }).click();
    await expect(page.getByTestId("engine-link-block").locator("summary")).toContainText(ENGINE_COPY.hybrid.linkBlock[locale]);
  });
}
