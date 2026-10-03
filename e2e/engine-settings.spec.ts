import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { exampleState, hybridState, salesAssistedState } from "../src/lib/engine/__tests__/fixtures";
import type { EngineState } from "@/lib/engine/types";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";
import { storedEngineEntry, writeEngineSeed } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The settings receive the targets and the shared counts (A18 T3.d, the
 * return 07's « Cibles » and « Nombres partagés »): the start's « Cibles »
 * and the step-by-step's base, which left with T3.b, in one place. Typed
 * there, they are written with the rest of the card on « Enregistrer les
 * réglages », and « Annuler » drops them. A shared count changed is written
 * into every number that carries it. Read from the device's storage.
 *
 * Non-vacuity, measured on 2026-10-03: with the workbench's save writing
 * `withSetup` instead of `settled`, the first test fails on the stored
 * target, and the second still passes (nothing is saved there).
 */

type Stored = {
  state: {
    snapshots: { base?: Record<string, number>; targets: Record<string, number>; metrics: Record<string, { value?: { numerator?: number; denominator?: number } }> }[];
  };
};

const stored = (page: Page) => storedEngineEntry<Stored>(page);
const last = async (page: Page) => {
  const snapshots = (await stored(page))?.state.snapshots ?? [];
  return snapshots[snapshots.length - 1]!;
};

async function openSettings(page: Page, state: EngineState, locale: "en" | "fr" = "en"): Promise<void> {
  await page.clock.setFixedTime(new Date(2026, 8, 24, 12));
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await writeEngineSeed(page, state);
  await page.reload();
  await expect(page.getByTestId("engine-board")).toBeVisible();
  await page.getByTestId("engine-bar-settings").click();
  await expect(page.getByTestId("engine-settings")).toBeVisible();
}

test("the targets and the shared counts: typed in the settings, saved with them, dropped by « Cancel »", async ({ page }) => {
  const example = exampleState();
  const exampleTarget = example.snapshots[0]!.targets["act.rate"];
  await openSettings(page, example);
  const targets = page.getByTestId("engine-settings-targets");
  const shared = page.getByTestId("engine-settings-shared");
  await expect(targets.getByRole("heading", { name: ENGINE_COPY.settings.targets.en })).toBeVisible();
  // The boxes open on what the engine holds: the example team's activation target, the cohort's 800 sign-ups.
  await expect(page.getByTestId("engine-settings-target-act-rate")).toHaveValue(String(exampleTarget));
  const cohort = page.getByTestId("engine-settings-shared-cohortSignups");
  await expect(cohort).toHaveValue("800");
  // Each count says which numbers use it, mid-sentence.
  await expect(shared).toContainText(`${ENGINE_COPY.settings.sharedHint.en.split("{list}")[0]}activation rate, `);
  // Self-serve alone: no motion headings, and never sales-assisted's counts nor an MRR.
  await expect(targets.locator("h4")).toHaveCount(0);
  await expect(shared.locator("input")).toHaveCount(2);
  const axe = await new AxeBuilder({ page }).include('[data-testid="engine-settings"]').analyze();
  expect(axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);

  // « Cancel » drops what was typed.
  await page.getByTestId("engine-settings-target-acq-signup-rate").fill("4");
  await cohort.fill("820");
  await page.getByTestId("engine-settings-cancel").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
  expect((await last(page)).targets["acq.signup-rate"]).toBeUndefined();
  expect((await last(page)).base?.cohortSignups ?? 800).toBe(800);

  // Saved: the new target, the activation target taken away, and the count written into the numbers that carry it.
  await page.getByTestId("engine-bar-settings").click();
  await page.getByTestId("engine-settings-target-acq-signup-rate").fill("4");
  await page.getByTestId("engine-settings-target-act-rate").fill("");
  await page.getByTestId("engine-settings-shared-cohortSignups").fill("820");
  await page.getByTestId("engine-settings-save").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
  const after = await last(page);
  expect(after.targets["acq.signup-rate"]).toBe(4);
  expect(after.targets["act.rate"]).toBeUndefined();
  expect(after.base?.cohortSignups).toBe(820);
  expect(after.metrics["act.rate"]?.value?.denominator).toBe(820);
  expect(after.metrics["ref.referred-share"]?.value?.denominator).toBe(820);
});

test("a count erased or at zero, or a target it cannot read, stops the save, its box focused; nothing is written", async ({ page }) => {
  await openSettings(page, exampleState());
  const before = JSON.stringify(await last(page));
  const cohort = page.getByTestId("engine-settings-shared-cohortSignups");
  await cohort.fill("0");
  await page.getByTestId("engine-settings-save").click();
  await expect(cohort).toBeFocused();
  await expect(page.getByTestId("engine-settings")).toContainText(ENGINE_COPY.settings.wholeCount.en);
  await cohort.fill("");
  await page.getByTestId("engine-settings-save").click();
  await expect(cohort).toBeFocused();
  await cohort.fill("800");

  const target = page.getByTestId("engine-settings-target-ret-d30");
  await target.fill("abc");
  await page.getByTestId("engine-settings-save").click();
  await expect(target).toBeFocused();
  await expect(page.getByTestId("engine-settings")).toBeVisible();
  expect(JSON.stringify(await last(page))).toBe(before);
});

test("the hybrid, in French: one group of targets per motion, and sales-assisted's counts after self-serve's", async ({ page }) => {
  await openSettings(page, hybridState(), "fr");
  const targets = page.getByTestId("engine-settings-targets");
  await expect(targets.getByRole("heading", { name: ENGINE_COPY.settings.targets.fr })).toBeVisible();
  await expect(targets.locator("h4")).toHaveText([ENGINE_COPY.hybrid.motionName.plg.fr, ENGINE_COPY.hybrid.motionName.slg.fr]);
  const shared = page.getByTestId("engine-settings-shared");
  await expect(shared.getByRole("heading", { name: ENGINE_COPY.settings.shared.fr })).toBeVisible();
  await expect(shared.locator("input")).toHaveCount(5);
  // The opportunities created feed the link too, which only the hybrid has.
  await expect(page.getByTestId("engine-settings-shared-slgOppsCreated")).toHaveValue("130");
  await expect(shared).toContainText(ENGINE_COPY.settings.sharedHint.fr.split("{list}")[0]!);
  // Every label filled: sales-assisted's say their months (`{period}`), the hints their numbers (`{list}`).
  await expect(page.getByTestId("engine-settings")).not.toContainText("{");
});

test("sales-assisted alone: the opportunities created are not shared — one number carries them without the link", async ({ page }) => {
  await openSettings(page, salesAssistedState());
  const shared = page.getByTestId("engine-settings-shared");
  await expect(shared.locator("input")).toHaveCount(2);
  await expect(page.getByTestId("engine-settings-shared-slgOppsCreated")).toHaveCount(0);
  await expect(page.getByTestId("engine-settings-shared-slgDealsWon")).toHaveValue("18");
  await expect(page.getByTestId("engine-settings")).not.toContainText("{");
});
