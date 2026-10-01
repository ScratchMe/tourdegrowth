import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { exampleState } from "../src/lib/engine/__tests__/fixtures";
import type { EngineState } from "../src/lib/engine/types";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the owner's signed preview.
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * A v1 engine in a v2 build — engine spec §18.3 and §18.10.3 (A7.3.c S0).
 *
 * The unit tests hold the promise to the character (`golden-v1.test.ts`); this
 * spec holds it in a real browser, through the real storage: a device that ran
 * the v1 engine opens on the same board, the first save writes the v2 store
 * and keeps the v1 one, and the first export lets v1 go. A v1 FILE is migrated
 * on import, and the screen says so.
 */
const V1_KEY = "tdg.engine.v1";
const V2_KEY = "tdg.engine.v2";
const EXAMPLE_CLOCK = new Date(2026, 8, 24, 12);

/** The §6.0 example as a v1 build wrote it: schemaVersion 1 and `setup.profile`, nothing else different. */
function exampleV1(): Record<string, unknown> {
  const state = exampleState();
  const { type: _t, motions: _m, qualificationWindowDays: _q, goLiveWindowDays: _g, ...setup } = state.setup;
  return { ...state, schemaVersion: 1, setup: { profile: "selfserve", ...setup } };
}

async function seed(page: Page, key: string, store: unknown): Promise<void> {
  await page.clock.setFixedTime(EXAMPLE_CLOCK);
  await page.goto("/en/aarrr-funnel-template");
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await page.evaluate(({ key, store }) => {
    window.localStorage.clear();
    window.localStorage.setItem(key, JSON.stringify(store));
  }, { key, store });
  await page.reload();
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

const keys = (page: Page) => page.evaluate(() => Object.keys(window.localStorage).filter((k) => k.startsWith("tdg.engine.")).sort());

async function board(page: Page): Promise<{ verdict: string; coverage: string }> {
  return {
    verdict: (await page.getByTestId("engine-verdict").innerText()).trim(),
    coverage: (await page.getByTestId("engine-coverage").innerText()).trim(),
  };
}

test("a v1 device opens on the same board; v2 is written at the first save, v1 kept until the first export", async ({ page }) => {
  // The reference: the same example, as a v2 build stores it.
  await seed(page, V2_KEY, { schemaVersion: 2, state: exampleState() });
  const reference = await board(page);
  expect(reference.coverage).toContain("of 17 numbers found");

  await seed(page, V1_KEY, { schemaVersion: 1, state: exampleV1() });
  expect(await board(page)).toEqual(reference);
  // Opening writes nothing: the device still holds its v1 copy only.
  expect(await keys(page)).toEqual([V1_KEY]);

  // A first save — a number re-saved as it is — writes v2 and leaves v1 in place.
  await page.getByTestId("engine-tab-activation").click();
  await page.getByTestId("engine-metric-act-rate").click();
  await page.getByTestId("engine-save-act-rate").click();
  await expect.poll(() => keys(page)).toEqual([V1_KEY, V2_KEY]);
  const v2 = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key)!), V2_KEY);
  expect(v2.schemaVersion).toBe(2);
  expect((v2.state as EngineState).setup.motions).toEqual({ plg: true, slg: false });

  // The export: a file now holds everything v1 held, and v1 goes.
  const download = page.waitForEvent("download");
  await page.getByTestId("engine-save-json").click();
  await download;
  await expect.poll(() => keys(page)).toEqual([V2_KEY]);
  await page.reload();
  expect(await board(page)).toEqual(reference);
});

test("a v1 file is migrated on import, and the screen says so — in both languages", async ({ page }) => {
  const text = JSON.stringify(exampleV1(), null, 2);
  const file = { name: "tdg-engine-2026-08.json", mimeType: "application/json", buffer: Buffer.from(text) };
  for (const locale of ["en", "fr"] as const) {
    await page.goto(`/${locale}/aarrr-funnel-template`);
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await expect(page.getByTestId("engine-setup")).toBeVisible();
    await page.getByTestId("engine-setup-import").click();
    await page.getByTestId("engine-import-file").setInputFiles(file);
    await expect(page.getByTestId("engine-import-migrated")).toHaveText(ENGINE_COPY.io.migrated[locale]);
    await expect(page.getByTestId("engine-import-open")).toBeVisible();
  }
  await page.getByTestId("engine-import-open").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
  const stored = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key)!), V2_KEY);
  expect(stored.state.schemaVersion).toBe(2);
  expect(stored.state.setup).toEqual({ ...exampleState().setup });
  // The file itself is only read: what the person keeps on their disk stays a v1 file.
  expect(JSON.parse(text).schemaVersion).toBe(1);
});

test("a file that says nothing of how the company sells is refused", async ({ page }) => {
  const state = exampleState();
  const file = { ...state, setup: { ...state.setup, motions: { plg: false, slg: false } } };
  await page.goto("/en/aarrr-funnel-template");
  await page.getByTestId("engine-setup-import").click();
  await page.getByTestId("engine-import-file").setInputFiles({ name: "x.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(file)) });
  await expect(page.getByTestId("engine-import-refused")).toHaveText(ENGINE_COPY.io.unsupportedSetup.en);
  await expect(page.getByTestId("engine-import-open")).toHaveCount(0);
});
