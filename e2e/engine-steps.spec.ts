import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The engine's second way in (Antoine, 2026-09-25): the step-by-step, the
 * shared base typed once, the filled-in example, and the settings that can
 * now be changed after the fact. Behaviour, read from the device's storage
 * and from what the next screen shows — never from the component's state.
 */
const STORAGE_KEY = "tdg.engine.v1";

type Stored = {
  state: {
    setup: { activationWindowDays: number };
    snapshots: { base?: Record<string, unknown>; targets: Record<string, number>; metrics: Record<string, { status: string; value?: unknown }> }[];
  };
};

async function stored(page: Page): Promise<Stored | null> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, STORAGE_KEY);
}

async function open(page: Page, locale: "en" | "fr" = "en"): Promise<void> {
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
}

test("« Start step by step » walks targets → base → one number per screen, and the base is typed once", async ({ page }) => {
  await open(page);
  await page.getByTestId("engine-setup-start").click();
  const steps = page.getByTestId("engine-steps");
  await expect(steps).toHaveAttribute("data-phase", "targets");
  await expect(page.locator("#engine-steps-title")).toHaveText(ENGINE_COPY.steps.targetsTitle.en);

  // A target, written on its way out of the field.
  await page.locator("#engine-step-target-act-rate").fill("25");
  await page.getByTestId("engine-steps-next").click();
  await expect(steps).toHaveAttribute("data-phase", "base");
  expect((await stored(page))?.state.snapshots[0]?.targets["act.rate"]).toBe(25);
  // A person moved: the focus follows the heading, never left on <body>.
  await expect(page.locator("#engine-steps-title")).toBeFocused();

  await page.locator("#engine-base-cohort").fill("800");
  await page.locator("#engine-base-month").fill("1000");
  await page.getByTestId("engine-steps-next").click();
  await expect(steps).toHaveAttribute("data-phase", "number");
  // Both counts, in the base — the two used to be two writes, and the second dropped the first.
  expect((await stored(page))?.state.snapshots[0]?.base).toEqual({ cohortSignups: 800, monthSignups: 1000 });

  // Skip, then back: a skipped number stays "to fill in".
  const number = page.getByTestId("engine-steps-number");
  const first = await number.getAttribute("data-metric");
  await page.getByTestId("engine-steps-skip").click();
  await expect(number).not.toHaveAttribute("data-metric", first!);
  await page.getByTestId("engine-steps-back").click();
  await expect(number).toHaveAttribute("data-metric", first!);
  expect((await stored(page))?.state.snapshots[0]?.metrics[first!]).toBeUndefined();

  // The board's activation sheet already carries the 800: typed once, reused.
  await page.getByTestId("engine-steps-board").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
  const row = page.getByTestId("engine-row-activation");
  if ((await row.getAttribute("aria-expanded")) !== "true") await row.click();
  const toggle = page.getByTestId("engine-metric-act-rate");
  if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
  const sheet = page.getByTestId("engine-sheet-act-rate");
  await sheet.getByRole("radio", { name: "I have it" }).check();
  await expect(sheet.locator("#engine-act-rate-den")).toHaveValue("800");

  // And the peloton says what its 100 are.
  await expect(page.getByTestId("peloton-same-hundred").first()).toContainText("800");

  // Back to the steps: it resumes on the first number nobody has touched, not at the targets.
  await page.getByTestId("engine-open-steps").click();
  await expect(steps).toHaveAttribute("data-phase", "number");
});

test("the example shows a filled-in funnel and its slides, and writes nothing on the device", async ({ page }) => {
  await open(page, "fr");
  await page.getByTestId("engine-setup-example").click();
  const example = page.getByTestId("engine-example");
  await expect(example).toBeVisible();
  await expect(example).toContainText(ENGINE_COPY.example.bannerTitle.fr);
  await expect(example.getByTestId("peloton-numeral-act.rate")).toHaveText("18");
  await page.getByTestId("engine-example-deck-open").click();
  await expect(page.getByTestId("engine-example-deck")).toBeVisible();
  await expect(page.getByTestId("engine-deck")).toBeVisible();
  expect(await stored(page)).toBeNull();
});

test("settings can be changed later; a new activation window sends that number back to « to fill in »", async ({ page }) => {
  await open(page);
  await page.getByTestId("engine-setup-board").click();
  const row = page.getByTestId("engine-row-activation");
  if ((await row.getAttribute("aria-expanded")) !== "true") await row.click();
  const toggle = page.getByTestId("engine-metric-act-rate");
  if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
  const sheet = page.getByTestId("engine-sheet-act-rate");
  await sheet.getByRole("radio", { name: "I have it" }).check();
  await sheet.locator("#engine-act-rate-num").fill("144");
  await sheet.locator("#engine-act-rate-den").fill("800");
  await sheet.locator("#engine-act-rate-source").selectOption({ label: "Amplitude" });
  await sheet.getByTestId("engine-save-act-rate").click();
  await expect(page.getByTestId("engine-coverage")).toContainText("1 of 15 numbers found");

  await page.getByTestId("engine-open-settings").click();
  const settings = page.getByTestId("engine-settings");
  await expect(settings).toBeVisible();
  await settings.getByRole("group", { name: ENGINE_COPY.setup.activationWindow.en }).getByRole("button", { name: "14 days" }).click();
  await expect(page.getByTestId("engine-settings-resets")).toContainText("14 days");
  await page.getByTestId("engine-settings-save").click();

  await expect(page.getByTestId("engine-board")).toBeVisible();
  await expect(page.getByTestId("engine-coverage")).toContainText("0 of 15 numbers found");
  const after = await stored(page);
  expect(after?.state.setup.activationWindowDays).toBe(14);
  expect(after?.state.snapshots[0]?.metrics["act.rate"]).toBeUndefined();
});

test("the company field says it is the product's or the company's name", async ({ page }) => {
  await open(page, "fr");
  await expect(page.getByLabel(ENGINE_COPY.setup.companyLabel.fr)).toBeVisible();
  expect(ENGINE_COPY.setup.companyLabel.fr).toMatch(/entreprise|SaaS/);
});
