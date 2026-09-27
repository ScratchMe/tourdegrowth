import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import type { EngineState } from "../src/lib/engine/types";
import { exampleState } from "../src/lib/engine/__tests__/fixtures";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * « Et si ? », cumulated (Antoine, 2026-09-26): every lever at once, a funnel
 * that starts at the visitors, grids that grow past 100 for what the
 * what-ifs add, the growth numbers moving with the sliders, and the targets
 * kept in the state so the deck can print them.
 *
 * Behaviour, not markup: the numbers themselves are the pure model's, tested
 * in scenario.test.ts and scenario-view.test.ts. What only a browser can say
 * is here — that a slider moves the screen, that the screen keeps what was
 * moved, and that it holds on a phone.
 */
const STORAGE_KEY = "tdg.engine.v1";
const EXAMPLE_CLOCK = new Date(2026, 8, 24, 12);
const W = ENGINE_COPY.scenario;

async function openWith(page: Page, state: EngineState, locale: "en" | "fr" = "en"): Promise<void> {
  await page.clock.setFixedTime(EXAMPLE_CLOCK);
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await page.evaluate(({ key, value }) => window.localStorage.setItem(key, JSON.stringify({ schemaVersion: 1, state: value })), {
    key: STORAGE_KEY,
    value: state,
  });
  await page.reload();
  await expect(page.getByTestId("engine-board")).toBeVisible();
  await page.getByTestId("engine-board-whatif").locator("summary").click();
  await expect(page.getByTestId("engine-whatif-panel").or(page.getByTestId("engine-whatif-none"))).toBeVisible();
}

async function nudge(page: Page, lever: string, key: "ArrowRight" | "ArrowLeft", times = 1): Promise<void> {
  await page.getByTestId(`whatif-slider-${lever}`).focus();
  for (let i = 0; i < times; i += 1) await page.keyboard.press(key);
}

async function storedWhatIf(page: Page): Promise<Record<string, number> | undefined> {
  return page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "{}").state?.whatIf, STORAGE_KEY);
}

test("a better sign-up rate finally shows: same visitors, and the sign-up grid grows past 100 in red", async ({ page }) => {
  await openWith(page, exampleState());
  const panel = page.getByTestId("engine-whatif-panel");
  const signups = panel.getByTestId("whatif-step-signups");
  await expect(signups.locator("[data-dot]")).toHaveCount(100);
  await expect(signups.locator('[data-dot="gained"]')).toHaveCount(0);

  await nudge(page, "acq.signup-rate", "ArrowRight", 5);
  // The visitors are the same people: no change claimed on them.
  await expect(panel.getByTestId("whatif-step-visitors")).not.toContainText("+");
  // What the what-ifs add beyond today's 100 is red, and the grid grew by whole rows.
  await expect(signups.locator('[data-dot="gained"]').first()).toBeVisible();
  const dots = await signups.locator("[data-dot]").count();
  expect(dots).toBeGreaterThan(100);
  expect(dots % 10).toBe(0);
  await expect(signups).toContainText("+");
  await expect(panel.getByTestId("whatif-legend")).toContainText(W.legendGained.en);
});

test("two levers: what each brings alone, the compounding sentence, and the resets", async ({ page }) => {
  await openWith(page, exampleState(), "fr");
  const panel = page.getByTestId("engine-whatif-panel");
  // One lever: no table — alone and together would be the same line.
  await nudge(page, "act.rate", "ArrowRight", 3);
  await expect(panel.getByTestId("whatif-alone")).toHaveCount(0);

  await nudge(page, "ret.logo-churn", "ArrowLeft", 5);
  const alone = panel.getByTestId("whatif-alone");
  await expect(alone.locator("tbody tr")).toHaveCount(2);
  // Activation and churn compound: more customers kept longer is worth more than the sum.
  await expect(panel.getByTestId("whatif-together")).toContainText(W.together.fr.split("{total}")[0]!.trim());
  await expect(panel.getByTestId("whatif-assumptions")).toBeVisible();

  // Back to today, one lever: its value is today's again, and the table goes.
  await panel.getByTestId("whatif-reset-act.rate").click();
  await expect(panel.getByTestId("whatif-value-act.rate")).toHaveText(/^18\s?%$/);
  await expect(panel.getByTestId("whatif-alone")).toHaveCount(0);
  expect(await storedWhatIf(page)).toEqual({ "ret.logo-churn": expect.any(Number) });

  // All back to today: the funnel is today's, and the file carries no empty scenario.
  await panel.getByTestId("whatif-reset-all").click();
  await expect(panel.getByTestId("engine-whatif-funnel-title")).toHaveText(W.funnelToday.fr);
  expect(await storedWhatIf(page)).toBeUndefined();
});

test("the targets are kept in the state: a reload finds them where they were left", async ({ page }) => {
  await openWith(page, exampleState());
  await nudge(page, "rev.arpa", "ArrowRight", 2);
  const moved = await page.getByTestId("whatif-value-rev.arpa").textContent();
  expect(await storedWhatIf(page)).toEqual({ "rev.arpa": 130 });

  await page.reload();
  await expect(page.getByTestId("engine-board")).toBeVisible();
  await page.getByTestId("engine-board-whatif").locator("summary").click();
  await expect(page.getByTestId("whatif-value-rev.arpa")).toHaveText(moved!);
  await expect(page.getByTestId("engine-whatif-funnel-title")).toHaveText(W.funnelIf.en);
});

test("a lever not entered gets no slider, and says which ones; with nothing entered there is nothing to move", async ({ page }) => {
  const onlyActivation = exampleState();
  const snapshot = onlyActivation.snapshots[0]!;
  for (const id of Object.keys(snapshot.metrics)) if (id !== "act.rate") delete snapshot.metrics[id as keyof typeof snapshot.metrics];
  await openWith(page, onlyActivation);
  const panel = page.getByTestId("engine-whatif-panel");
  await expect(panel.locator('[data-testid^="whatif-slider-"]')).toHaveCount(1);
  await expect(panel.getByTestId("whatif-slider-act.rate")).toBeVisible();
  await expect(panel.getByTestId("whatif-unknown-levers")).toContainText("ARPA");

  const empty = exampleState();
  empty.snapshots[0]!.metrics = {};
  await openWith(page, empty);
  await expect(page.getByTestId("engine-whatif-none")).toBeVisible();
});

for (const locale of ["en", "fr"] as const) {
  test(`${locale} at 390px: the panel, levers moved, scrolls only downward`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openWith(page, exampleState(), locale);
    await nudge(page, "acq.signup-rate", "ArrowRight", 5);
    await nudge(page, "act.rate", "ArrowRight", 3);
    await expect(page.getByTestId("whatif-alone")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
  });
}
