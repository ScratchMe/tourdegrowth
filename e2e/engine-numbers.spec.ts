import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { exampleState } from "../src/lib/engine/__tests__/fixtures";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";
import { activeEngineKey, nextStep, writeEngineSeed } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * « Tes chiffres » (design system extension 07, C41, A18 T2.b): every number,
 * by stage, in one list, each row opening the number's own screen. It
 * replaced the stage tabs (2026-09-26), whose spec this was.
 *
 * Behaviour, not markup: every stage on screen, what a row says without
 * opening, the stage a team target names and only it, what remains, the
 * number's screen and the way back to its row, and that the list never
 * pushes the page sideways on a phone.
 */
const EXAMPLE_CLOCK = new Date(2026, 8, 24, 12);
const STAGES = ["acquisition", "activation", "retention", "referral", "revenue"] as const;
const L = ENGINE_COPY.list;

async function openEngine(page: Page, locale: "en" | "fr" = "en"): Promise<void> {
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
}

/** The §6.0 example on the device, as a returning person has it (engine-collect.spec.ts does the same). */
async function openExample(page: Page, locale: "en" | "fr" = "en"): Promise<void> {
  await page.clock.setFixedTime(EXAMPLE_CLOCK);
  await openEngine(page, locale);
  await writeEngineSeed(page, exampleState());
  await page.reload();
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

async function startEngine(page: Page, locale: "en" | "fr" = "en"): Promise<void> {
  await openEngine(page, locale);
  await page.getByTestId("engine-start-go").click();
  await page.getByTestId("engine-targets-next").click();
  await page.getByTestId("engine-number-back").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

async function noHorizontalScroll(page: Page): Promise<void> {
  const [scroll, client] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(scroll).toBe(client);
}

test.describe("the numbers list", () => {
  test("the example: every stage on screen, the one a target names holds back, and only it", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openExample(page);
    const list = page.getByTestId("engine-numbers");
    await expect(list.getByRole("heading", { level: 2, name: L.title.en })).toBeVisible();
    for (const stage of STAGES) await expect(page.getByTestId(`engine-numbers-${stage}`)).toBeVisible();
    // Seventeen rows, nothing unfolded in place.
    await expect(list.locator('[data-testid^="engine-metric-"][data-status]')).toHaveCount(17);
    await expect(page.locator('[data-testid^="engine-sheet-"]')).toHaveCount(0);

    // The named stage, in words and with the diagnosis edge, and only it (churn sits above its target but isn't named).
    const activation = page.getByTestId("engine-numbers-activation");
    await expect(activation).toHaveAttribute("data-holds", "true");
    await expect(activation).toContainText(L.holds.en);
    await expect(list.getByText(L.holds.en, { exact: true })).toHaveCount(1);
    await expect(list.locator('[data-holds="true"]')).toHaveCount(1);
    // Each stage's count, as the coverage line counts (measured only).
    await expect(activation).toContainText("2 of 3 found");
    await expect(page.getByTestId("engine-numbers-acquisition")).toContainText("3 of 3 found");

    // What remains, first: the example has a request out and nothing left to type.
    await expect(page.getByTestId("engine-progress-remaining")).toHaveText(L.noneToGo.en);
    await expect(page.getByTestId("engine-progress-counts")).toHaveText("11 found · 2 estimated · 1 asked · 3 can't be found");
  });

  test("a row says its value or its status; it opens the number's own screen, and « ← Your numbers » comes back to it", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openExample(page);
    const rate = page.getByTestId("engine-metric-act-rate");
    // A found number says its value, and no tag: the value is the status.
    await expect(page.getByTestId("engine-metric-act-rate-value")).toContainText("18");
    await expect(rate).not.toContainText(L.status.found.en);
    await expect(page.getByTestId("engine-metric-act-ttv")).toContainText(L.status.est.en);
    await expect(page.getByTestId("engine-metric-ref-k-factor")).toContainText(L.status.asked.en);

    await page.getByTestId("engine-metric-act-event").click();
    const screen = page.getByTestId("engine-number");
    await expect(screen).toHaveAttribute("data-metric", "act.event");
    await expect(page.getByTestId("engine-board")).toHaveCount(0);
    // Its heading takes the focus (a move between screens), with where it sits and what remains.
    await expect(page.locator("#engine-number-title")).toBeFocused();
    await expect(screen).toContainText("Activation · 2 of 3");
    await expect(page.getByTestId("engine-number-progress")).toHaveText(L.noneToGo.en);
    await expect(screen.getByTestId("engine-sheet-act-event")).toBeVisible();

    await page.getByTestId("engine-number-back").click();
    await expect(page.getByTestId("engine-board")).toBeVisible();
    await expect(page.getByTestId("engine-metric-act-event")).toBeFocused();
  });

  test("« Fill in » from the collect list opens that number's screen, its heading focused", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await startEngine(page);
    await page.getByTestId("engine-collect-disclosure").locator("summary").click();
    await page.getByTestId("engine-fill-rev-arpa").click();
    await expect(page.getByTestId("engine-number")).toHaveAttribute("data-metric", "rev.arpa");
    await expect(page.locator("#engine-number-title")).toBeFocused();
    await expect(page.getByTestId("engine-number")).toContainText(/^.*Revenue · \d of 5/);
  });

  test("the next step's « Go to the next number » opens the five-minute number's screen", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await startEngine(page);
    await page.evaluate((key) => {
      const store = JSON.parse(window.localStorage.getItem(key)!);
      store.state.updatedAt = new Date(Date.now() - 3 * 86_400_000).toISOString();
      window.localStorage.setItem(key, JSON.stringify(store));
    }, await activeEngineKey(page));
    await page.reload();
    // A return (A18 T2.a): the last visit, then the one primary.
    await expect(page.locator("#engine-next")).toHaveText("Last visit · 3 days ago");
    await expect(nextStep(page, "number")).toBeVisible();
    await page.getByTestId("engine-next-number").click();

    // The first five-minute number in the funnel's order is the sign-up rate.
    await expect(page.getByTestId("engine-number")).toHaveAttribute("data-metric", "acq.signup-rate");
    await expect(page.locator("#engine-number-title")).toBeFocused();
    await expect(page.getByTestId("engine-sheet-acq-signup-rate")).toBeVisible();
  });
});

test.describe("the numbers list on a phone", () => {
  for (const locale of ["en", "fr"] as const) {
    test(`${locale} at 390px: the list and a number's screen never push the page sideways`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await openExample(page, locale);
      await noHorizontalScroll(page);
      // Every row is a whole-row target, never under 48px.
      const heights = await page.locator('button[data-testid^="engine-metric-"]').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
      expect(heights.length).toBe(17);
      expect(Math.min(...heights)).toBeGreaterThanOrEqual(48);
      await page.getByTestId("engine-metric-rev-gross-margin").click();
      await expect(page.getByTestId("engine-number")).toBeVisible();
      await noHorizontalScroll(page);
    });
  }
});
