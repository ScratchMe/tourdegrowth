import type { Locator, Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";
import { storedEngineEntry, openNumber, backToBoard, expectLeft } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The team's tools (engine spec §19.5, C32 Q9-Q10, A14 T4): ticked in the
 * settings, offered first in a sheet, the collect list grouped by them, and
 * the « deux outils » check when a rate's two counts come from two tools.
 * The plans are the pure model's (collect.test.ts, sources.test.ts,
 * sanity.test.ts); what a browser says is here.
 */
const EXAMPLE_CLOCK = new Date(2026, 8, 24, 12);

async function startEngine(page: Page, locale: "en" | "fr" = "en"): Promise<void> {
  await page.clock.setFixedTime(EXAMPLE_CLOCK);
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await page.getByTestId("engine-start-go").click();
  await page.getByTestId("engine-targets-next").click();
  await page.getByTestId("engine-number-back").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

async function tickTools(page: Page, tools: string[]): Promise<void> {
  await page.getByTestId("engine-bar-settings").click();
  await page.getByTestId("engine-setup-tools").locator("summary").click();
  for (const tool of tools) await page.getByTestId(`engine-setup-tool-${tool}`).check();
  await page.getByTestId("engine-settings-save").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

async function openSheet(page: Page, _stage: string, metricDomId: string): Promise<Locator> {
  // The list shows every stage (A18 T2.b): the row is enough, the stage stays for the callers' reading.
  return openNumber(page, metricDomId);
}

test("tools ticked in the settings: stored in their families' order, and the collect list grouped by them", async ({ page }) => {
  await startEngine(page);
  await tickTools(page, ["stripe", "ga4"]);
  expect((await storedEngineEntry(page))?.state.setup.tools).toEqual(["ga4", "stripe"]);

  await page.getByTestId("engine-collect-disclosure").locator("summary").click();
  const self = page.getByTestId("engine-collect-self");
  await expect(self).toContainText(ENGINE_COPY.collect.byToolHint.en);
  await expect(self.getByTestId("engine-collect-tool-ga4")).toContainText("Sign-up rate");
  await expect(self.getByTestId("engine-collect-tool-stripe")).toBeVisible();
  // Each path is the sheet's, filled: never a raw {placeholder}.
  await expect(self).not.toContainText(/\{[a-z]+\}/);
});

test("a number none of the team's tools gives is to ask for, even one you could read yourself", async ({ page }) => {
  await startEngine(page);
  await tickTools(page, ["stripe"]);
  await page.getByTestId("engine-collect-disclosure").locator("summary").click();
  // Activation lives in product analytics, and the catalogue never cites Stripe for it.
  await expect(page.getByTestId("engine-collect-self")).not.toContainText("Activation rate");
  await expect(page.getByTestId("engine-collect-ask")).toContainText("Activation rate");
});

test("a sheet offers the team's tools first; a rate's two counts from two tools says « to check »", async ({ page }) => {
  await startEngine(page);
  await tickTools(page, ["mixpanel"]);
  const sheet = await openSheet(page, "activation", "act-rate");
  // The source is asked once a value is typed (A18 T1). The team's Mixpanel first, before the usual Amplitude.
  await sheet.locator("#engine-act-rate-num").fill("144");
  const first = await sheet.locator("#engine-act-rate-source option:not([value=''])").first().textContent();
  expect(first).toBe("Mixpanel");

  await sheet.locator("#engine-act-rate-den").fill("800");
  await sheet.locator("#engine-act-rate-source").selectOption({ label: "Mixpanel" });
  await sheet.getByTestId("engine-act-rate-split-source").check();
  await sheet.locator("#engine-act-rate-denominator-source").selectOption({ label: "GA4" });
  await expect(sheet.getByTestId("engine-act-rate-two-tools")).toContainText("Numerator (Mixpanel) and denominator (GA4) come from two tools");
  await sheet.getByTestId("engine-save-act-rate").click();
  await expectLeft(page, "act-rate");
  const entry = (await storedEngineEntry(page))?.state.snapshots[0]?.metrics["act.rate"];
  expect(entry).toMatchObject({ source: { kind: "tool", tool: "mixpanel" }, denominatorSource: { kind: "tool", tool: "ga4" } });

  // The deck's « to check » list says it too.
  await backToBoard(page);
  await page.getByTestId("engine-open-deck").click();
  await expect(page.getByTestId("deck-checks")).toContainText("Numerator (Mixpanel) and denominator (GA4)");
});

test("390px, French: the tools in the settings and the collect list by tool, nothing scrolls sideways", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startEngine(page, "fr");
  await tickTools(page, ["ga4", "stripe", "hubspot"]);
  await page.getByTestId("engine-collect-disclosure").locator("summary").click();
  await expect(page.getByTestId("engine-collect-tool-ga4")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
});
