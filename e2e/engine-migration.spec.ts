import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { exampleState } from "../src/lib/engine/__tests__/fixtures";
import type { EngineState } from "../src/lib/engine/types";
import { ENGINE_KEYS, engineSeed, storedEngineEntry, openEngineMenu } from "./engine-helpers";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the owner's signed preview.
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * An older engine in a v3 build — engine spec §18.3 and §18.10.3 (A7.3.c S0),
 * then §19.1.3 and §19.13 (A14 T0).
 *
 * The unit tests hold the promise to the character (`golden-v1.test.ts`,
 * `golden-v2.test.ts`); this spec holds it in a real browser, through the real
 * storage: a device that ran the v1 or the v2 engine opens on the same board,
 * the first save writes the v3 index and entry and keeps the older copy, and
 * the first export lets it go. A v1 FILE is migrated on import, and the screen
 * says so; a v2 file opens as it is, since nothing the person sees changed.
 */
const V1_KEY = "tdg.engine.v1";
const V2_KEY = "tdg.engine.v2";
const ENTRY_KEY = `${ENGINE_KEYS.prefix}${exampleState().id}`;
const EXAMPLE_CLOCK = new Date(2026, 8, 24, 12);

/** The §6.0 example as a v1 build wrote it: schemaVersion 1 and `setup.profile`, nothing else different. */
function exampleV1(): Record<string, unknown> {
  const state = exampleState();
  const { type: _t, motions: _m, qualificationWindowDays: _q, goLiveWindowDays: _g, ...setup } = state.setup;
  return { ...state, schemaVersion: 1, setup: { profile: "selfserve", ...setup } };
}

/** The same example as a v2 build wrote it: only the version differs. */
function exampleV2(): Record<string, unknown> {
  return { ...exampleState(), schemaVersion: 2 };
}

async function seed(page: Page, items: [string, string][]): Promise<void> {
  await page.clock.setFixedTime(EXAMPLE_CLOCK);
  await page.goto("/en/aarrr-funnel-template");
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await page.evaluate((items) => {
    window.localStorage.clear();
    for (const [key, value] of items) window.localStorage.setItem(key, value);
  }, items);
  await page.reload();
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

/** Every key the engine holds: the v3 index (`tdg.engines.v3`), its entries and the older single keys. */
const keys = (page: Page) => page.evaluate(() => Object.keys(window.localStorage).filter((k) => k.startsWith("tdg.engine")).sort());

async function board(page: Page): Promise<{ verdict: string; coverage: string }> {
  return {
    verdict: (await page.getByTestId("engine-verdict").innerText()).trim(),
    coverage: (await page.getByTestId("engine-coverage").innerText()).trim(),
  };
}

for (const [version, key, older] of [
  [1, V1_KEY, exampleV1],
  [2, V2_KEY, exampleV2],
] as const) {
  test(`a v${version} device opens on the same board; v3 is written at the first save, v${version} kept until the first export`, async ({ page }) => {
    // The reference: the same example, as a v3 build stores it.
    await seed(page, engineSeed(exampleState()));
    const reference = await board(page);
    expect(reference.coverage).toContain("of 17 numbers found");

    await seed(page, [[key, JSON.stringify({ schemaVersion: version, state: older() })]]);
    expect(await board(page)).toEqual(reference);
    // Opening writes nothing: the device still holds its older copy only.
    expect(await keys(page)).toEqual([key]);

    // A first save — a number re-saved as it is — writes the v3 index and entry, and leaves the older copy in place.
    await page.getByTestId("engine-tab-activation").click();
    await page.getByTestId("engine-metric-act-rate").click();
    await page.getByTestId("engine-save-act-rate").click();
    await expect.poll(() => keys(page)).toEqual([key, ENTRY_KEY, ENGINE_KEYS.index]);
    const v3 = await storedEngineEntry(page);
    expect(v3?.schemaVersion).toBe(3);
    expect(v3?.state.schemaVersion).toBe(3);
    expect((v3?.state as EngineState).setup.motions).toEqual({ plg: true, slg: false });

    // The export: a file now holds everything the older copy held, and it goes.
    const download = page.waitForEvent("download");
    await openEngineMenu(page);
    await page.getByTestId("engine-save-json").click();
    await download;
    await expect.poll(() => keys(page)).toEqual([ENTRY_KEY, ENGINE_KEYS.index]);
    await page.reload();
    expect(await board(page)).toEqual(reference);
  });
}

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
  const stored = await storedEngineEntry(page);
  expect(stored?.state.schemaVersion).toBe(3);
  expect(stored?.state.setup).toEqual({ ...exampleState().setup });
  // The file itself is only read: what the person keeps on their disk stays a v1 file.
  expect(JSON.parse(text).schemaVersion).toBe(1);
});

test("a v2 file opens as it is: no note, the same setup, written as v3", async ({ page }) => {
  const file = { name: "tdg-engine-2026-08.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(exampleV2(), null, 2)) };
  await page.goto("/en/aarrr-funnel-template");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await page.getByTestId("engine-setup-import").click();
  await page.getByTestId("engine-import-file").setInputFiles(file);
  await expect(page.getByTestId("engine-import-open")).toBeVisible();
  await expect(page.getByTestId("engine-import-migrated")).toHaveCount(0);
  await page.getByTestId("engine-import-open").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
  const stored = await storedEngineEntry(page);
  expect(stored?.state).toEqual(exampleState());
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
