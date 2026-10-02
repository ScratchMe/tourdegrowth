import type { Locator, Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { exampleState } from "../src/lib/engine/__tests__/fixtures";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";
import { activeEngineKey, writeEngineSeed, nextStep } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The board's stages as a horizontal menu with one panel of folded numbers
 * (Antoine, 2026-09-26: « c'est rude de devoir scroller autant sur chaque
 * chiffre… replier tous les chiffres, comme ça on peut bien voir le statut de
 * chaque et déplier en fonction »).
 *
 * Behaviour, not markup: what is folded on arrival, what a click unfolds and
 * nothing else, where the arrow keys take the focus, which tab and number
 * "Fill in" and "Continue" land on, and that the strip never pushes the page
 * sideways on a phone.
 */
const EXAMPLE_CLOCK = new Date(2026, 8, 24, 12);
const STAGES = ["acquisition", "activation", "retention", "referral", "revenue"] as const;

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
  await page.getByTestId("engine-setup-board").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

/** The panel's row toggles — buttons only (a row's value span shares no prefix with them). */
function toggles(page: Page): Locator {
  return page.getByTestId("engine-panel").locator('button[data-testid^="engine-metric-"]');
}

async function expandedStates(page: Page): Promise<Record<string, string | null>> {
  return toggles(page).evaluateAll((els) =>
    Object.fromEntries(els.map((el) => [el.getAttribute("data-testid")!, el.getAttribute("aria-expanded")])),
  );
}

async function noHorizontalScroll(page: Page): Promise<void> {
  const [scroll, client] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(scroll).toBe(client);
}

test.describe("the stage menu", () => {
  test("the example opens on the stage the diagnosis names, every number folded, the stamp on that tab only", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openExample(page);
    await expect(page.getByRole("tablist", { name: ENGINE_COPY.board.stagesLabel.en })).toBeVisible();
    await expect(page.getByRole("tab")).toHaveCount(5);

    const activation = page.getByTestId("engine-tab-activation");
    await expect(activation).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("engine-panel")).toHaveAttribute("data-stage", "activation");
    // The panel is the one the selected tab controls, and is named by it.
    const panelId = await page.getByTestId("engine-panel").getAttribute("id");
    await expect(activation).toHaveAttribute("aria-controls", panelId!);
    await expect(page.getByRole("tabpanel", { name: /Activation/ })).toBeVisible();

    // Folded on arrival — three rows, not one sheet open.
    expect(Object.values(await expandedStates(page))).toEqual(["false", "false", "false"]);
    await expect(page.locator('[data-testid^="engine-sheet-"]:visible')).toHaveCount(0);

    // The named stage says so in words, and only it (churn sits above its target but isn't named).
    await expect(page.getByText(ENGINE_COPY.board.tabNamed.en, { exact: true })).toHaveCount(1);
    await expect(activation).toContainText(ENGINE_COPY.board.tabNamed.en);
    await expect(page.locator('[role="tab"][data-named="true"]')).toHaveCount(1);
    // Each tab's count, as the coverage line counts (measured only).
    const found = (n: number) => ENGINE_COPY.board.tabFound.en.replace("{n}", String(n)).replace("{N}", "3");
    await expect(activation).toContainText(found(2));
    await expect(page.getByTestId("engine-tab-acquisition")).toContainText(found(3));
    // The old row's comparator, in the panel head, in the alert red for the named rate.
    await expect(page.getByTestId("engine-panel-positions")).toContainText(ENGINE_COPY.side.underTarget.en.replace(/^./, (c) => c.toUpperCase()));
  });

  test("a folded row says its value and status; a click unfolds exactly that number, and folds it back", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openExample(page);
    const rate = page.getByTestId("engine-metric-act-rate");
    // Folded, the row still reads: the value (18 %) and its status.
    await expect(rate).toContainText("18");
    await expect(rate).toContainText(ENGINE_COPY.status.measured.en);
    await expect(page.getByTestId("engine-metric-act-ttv")).toContainText(ENGINE_COPY.status.estimated.en);

    await page.getByTestId("engine-metric-act-event").click();
    expect(await expandedStates(page)).toEqual({
      "engine-metric-act-rate": "false",
      "engine-metric-act-event": "true",
      "engine-metric-act-ttv": "false",
    });
    await expect(page.locator('[data-testid^="engine-sheet-"]:visible')).toHaveCount(1);
    await expect(page.getByTestId("engine-sheet-act-event")).toBeVisible();
    // aria-controls names the body that appeared.
    const body = await page.getByTestId("engine-metric-act-event").getAttribute("aria-controls");
    await expect(page.locator(`#${body}`).getByTestId("engine-sheet-act-event")).toBeVisible();

    await page.getByTestId("engine-metric-act-event").click();
    await expect(page.locator('[data-testid^="engine-sheet-"]:visible')).toHaveCount(0);
  });

  test("the arrow keys move between tabs — one Tab stop, wrapping, Home and End", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openExample(page);
    const tab = (stage: string) => page.getByTestId(`engine-tab-${stage}`);
    // Roving tabindex: only the selected tab is in the Tab order.
    const tabbable = () =>
      page.getByRole("tab").evaluateAll((els) => els.filter((el) => el.getAttribute("tabindex") === "0").map((el) => el.id));
    expect(await tabbable()).toEqual(["engine-tab-activation"]);

    await tab("activation").focus();
    await page.keyboard.press("ArrowRight");
    await expect(tab("retention")).toBeFocused();
    await expect(tab("retention")).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("engine-panel")).toHaveAttribute("data-stage", "retention");
    expect(await tabbable()).toEqual(["engine-tab-retention"]);

    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(tab("acquisition")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(tab("revenue")).toBeFocused(); // wraps
    await page.keyboard.press("Home");
    await expect(tab("acquisition")).toBeFocused();
    await page.keyboard.press("End");
    await expect(tab("revenue")).toBeFocused();
    await expect(page.getByTestId("engine-panel")).toHaveAttribute("data-stage", "revenue");
    // A new stage opens folded too.
    expect(Object.values(await expandedStates(page)).every((v) => v === "false")).toBe(true);
  });

  test("\"Fill in\" from the collect list opens the right tab and number, open and focused", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await startEngine(page);
    // A fresh engine opens on acquisition; go elsewhere first, so landing on the right tab is proven.
    await page.getByTestId("engine-tab-retention").click();
    await page.getByTestId("engine-collect-disclosure").locator("summary").click();
    await page.getByTestId("engine-fill-rev-arpa").click();

    await expect(page.getByTestId("engine-tab-revenue")).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("engine-panel")).toHaveAttribute("data-stage", "revenue");
    const arpa = page.getByTestId("engine-metric-rev-arpa");
    await expect(arpa).toHaveAttribute("aria-expanded", "true");
    await expect(arpa).toBeFocused();
    await expect(page.getByTestId("engine-sheet-rev-arpa")).toBeVisible();
    // That number only — its neighbours stay folded.
    expect(Object.entries(await expandedStates(page)).filter(([, v]) => v === "true").map(([k]) => k)).toEqual(["engine-metric-rev-arpa"]);
  });

  test("the next step's « Next number » lands on the five-minute number, open, whatever tab was showing", async ({ page }) => {
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
    await page.getByTestId("engine-tab-referral").click();
    await page.getByTestId("engine-next-number").click();

    // The first five-minute number in the funnel's order is the sign-up rate.
    await expect(page.getByTestId("engine-panel")).toHaveAttribute("data-stage", "acquisition");
    const rate = page.getByTestId("engine-metric-acq-signup-rate");
    await expect(rate).toHaveAttribute("aria-expanded", "true");
    await expect(rate).toBeFocused();
    await expect(page.getByTestId("engine-sheet-acq-signup-rate")).toBeVisible();
  });
});

test.describe("the stage menu on a phone", () => {
  for (const locale of ["en", "fr"] as const) {
    test(`${locale} at 390px: five tabs never push the page sideways, and the one chosen from elsewhere is scrolled into view`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await startEngine(page, locale);
      await noHorizontalScroll(page);
      const strip = page.getByTestId("engine-tabs");
      // The strip scrolls INSIDE its own box: wider content than box, and the page still fits.
      const [scroll, client] = await strip.evaluate((el) => [el.scrollWidth, el.clientWidth]);
      expect(scroll).toBeGreaterThan(client);

      // Revenue starts off to the right; "Fill in" picks it from below the menu.
      await page.getByTestId("engine-collect-disclosure").locator("summary").click();
      await page.getByTestId("engine-fill-rev-arpa").click();
      await expect(page.getByTestId("engine-tab-revenue")).toHaveAttribute("aria-selected", "true");
      const box = await strip.boundingBox();
      const revenue = await page.getByTestId("engine-tab-revenue").boundingBox();
      if (!box || !revenue) throw new Error("strip or tab not rendered");
      expect(revenue.x).toBeGreaterThanOrEqual(box.x - 1);
      expect(revenue.x + revenue.width).toBeLessThanOrEqual(box.x + box.width + 1);
      await noHorizontalScroll(page);

      // Every tab name on one line, in both languages.
      for (const stage of STAGES) {
        const name = await page.getByTestId(`engine-tab-name-${stage}`).boundingBox();
        expect(name!.height, stage).toBeLessThan(28);
      }
    });
  }
});
