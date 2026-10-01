import { readFile } from "node:fs/promises";
import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { exampleState, measured, ratio } from "../src/lib/engine/__tests__/fixtures";
import type { EngineIndex, EngineState } from "../src/lib/engine/types";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test, trackedEvents } from "./helpers";
import { ENGINE_KEYS, engineSeed, storedEngineEntry } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * Several engines on a device, the merge at the import, and « Saisie en
 * tableau » (engine spec §19.1.5, §19.6, §19.7, C32 Q11-Q13, A14 T5). The
 * rules are the pure modules' (merge.test.ts, csv.test.ts, storage.test.ts);
 * what a browser shows and keeps is here.
 */
const CLOCK = new Date(2026, 8, 24, 12);
const EXAMPLE_ID = exampleState().id;

async function open(page: Page, locale: "en" | "fr", ...states: EngineState[]): Promise<void> {
  await page.clock.setFixedTime(CLOCK);
  await page.addInitScript((items) => {
    if (sessionStorage.getItem("e2e-engine-seeded")) return;
    for (const [key, value] of items) localStorage.setItem(key, value);
    sessionStorage.setItem("e2e-engine-seeded", "1");
  }, engineSeed(...states));
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

function storedIndex(page: Page): Promise<EngineIndex | null> {
  return page.evaluate(({ index }) => {
    const raw = window.localStorage.getItem(index);
    return raw ? (JSON.parse(raw) as EngineIndex) : null;
  }, ENGINE_KEYS);
}

async function openSwitcher(page: Page): Promise<void> {
  const details = page.getByTestId("engine-switcher");
  if ((await details.getAttribute("open")) === null) await details.locator("summary").click();
}

test("a second engine: created from the switcher, switched to and back, deleted without touching the first", async ({ page }) => {
  await open(page, "en", exampleState());
  const before = await storedEngineEntry(page);
  await expect(page.getByTestId("engine-switcher").locator("summary")).toContainText("Engine: Unnamed engine, created");

  await openSwitcher(page);
  await page.getByTestId("engine-new").click();
  await expect(page.getByTestId("engine-setup")).toBeVisible();
  await page.getByLabel(ENGINE_COPY.setup.companyLabel.en).fill("Second Co");
  await page.getByTestId("engine-setup-board").click();
  await expect(page.getByTestId("engine-switcher").locator("summary")).toHaveText(/Engine: Second Co/);
  const index = (await storedIndex(page))!;
  expect(index.order).toHaveLength(2);
  expect(index.order[0]).toBe(EXAMPLE_ID);
  expect(index.activeId).not.toBe(EXAMPLE_ID);

  // Back to the first: its own board, as it was.
  await openSwitcher(page);
  await expect(page.getByTestId("engine-switcher-list").locator("li")).toHaveCount(2);
  await page.getByTestId(`engine-switch-${EXAMPLE_ID}`).click();
  await expect(page.getByTestId("engine-switcher").locator("summary")).toContainText("Unnamed engine");
  await expect(page.getByTestId("engine-coverage")).toContainText("11 of 17");
  expect((await storedIndex(page))!.activeId).toBe(EXAMPLE_ID);

  // Delete the second: the switcher offers its file first, and the first engine is untouched.
  // The board is remounted for each engine (the table's paste never follows), so the switcher opens again.
  await openSwitcher(page);
  await page.getByTestId(`engine-switch-${index.activeId}`).click();
  await openSwitcher(page);
  await page.getByTestId("engine-delete-open").click();
  await expect(page.locator("#engine-delete-title")).toHaveText('Delete "Second Co"?');
  const download = page.waitForEvent("download");
  await page.getByTestId("engine-delete-save").click();
  expect(JSON.parse(await readFile((await (await download).path())!, "utf8")).setup.companyLabel).toBe("Second Co");
  await expect(page.getByTestId("engine-delete-saved")).toBeVisible();
  await page.getByTestId("engine-delete-confirm").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
  expect(await storedIndex(page)).toEqual({ schemaVersion: 3, activeId: EXAMPLE_ID, order: [EXAMPLE_ID] });
  expect(await storedEngineEntry(page)).toEqual(before);

  // The last one deleted leaves the device empty: the setup.
  await openSwitcher(page);
  await page.getByTestId("engine-delete-open").click();
  await page.getByTestId("engine-delete-confirm").click();
  await expect(page.getByTestId("engine-setup")).toBeVisible();
  expect(await storedIndex(page)).toBeNull();
});

test("ten engines at most: « New engine » is greyed, with its reason", async ({ page }) => {
  const many = Array.from({ length: 10 }, (_, i) => ({ ...exampleState(), id: `00000000-0000-4000-8000-0000000001${String(i).padStart(2, "0")}` }));
  await open(page, "en", ...many);
  await openSwitcher(page);
  await expect(page.getByTestId("engine-new")).toBeDisabled();
  await expect(page.getByTestId("engine-switcher-full")).toHaveText(ENGINE_COPY.engines.full.en.replace("{max}", "10"));
});

test("an exported file re-imported is added beside the engine, under an id of its own", async ({ page }) => {
  await open(page, "en", exampleState());
  const download = page.waitForEvent("download");
  await page.getByTestId("engine-save-json").click();
  const path = (await (await download).path())!;
  await page.getByTestId("engine-import-open-screen").click();
  await page.getByTestId("engine-import-file").setInputFiles(path);
  // « Add as a new engine » is the default: the choice that loses nothing.
  await expect(page.getByRole("radio", { name: ENGINE_COPY.io.add.en })).toBeChecked();
  await expect(page.getByTestId("engine-import-open")).toHaveText(ENGINE_COPY.io.addApply.en);
  await page.getByTestId("engine-import-open").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
  const index = (await storedIndex(page))!;
  expect(index.order).toHaveLength(2);
  expect(index.order[0]).toBe(EXAMPLE_ID);
  expect(index.activeId).toBe(index.order[1]);
  expect(index.activeId).not.toBe(EXAMPLE_ID);
  expect((await storedEngineEntry(page))?.state.snapshots).toEqual(exampleState().snapshots);
});

test("the merge lists what it changes before writing it; it is refused, with its reason, for another currency", async ({ page }) => {
  await open(page, "en", exampleState());
  const file = exampleState();
  file.snapshots[0]!.metrics["acq.signup-rate"] = measured(ratio(900, 26_000), { kind: "tool", tool: "ga4" }, { updatedAt: "2026-09-30T10:00:00.000Z" });
  file.snapshots[0]!.targets["rev.paid-conversion"] = 12;
  await page.getByTestId("engine-import-open-screen").click();
  await page.getByTestId("engine-import-file").setInputFiles({ name: "laptop.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(file)) });
  await page.getByRole("radio", { name: /Merge into/ }).check();
  const preview = page.getByTestId("engine-import-merge");
  await expect(preview).toContainText("Sign-up rate: 3.2% → 3.5%, more recent in the file");
  await expect(preview).toContainText("Paid conversion, target: 12%");
  await expect(page.getByTestId("engine-import-open")).toHaveText(ENGINE_COPY.io.mergeApply.en);
  await page.getByTestId("engine-import-open").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
  const stored = (await storedEngineEntry(page))!.state;
  expect(stored.id).toBe(EXAMPLE_ID);
  expect(stored.snapshots[0]!.metrics["acq.signup-rate"]?.value).toEqual(ratio(900, 26_000));
  expect(stored.snapshots[0]!.targets["rev.paid-conversion"]).toBe(12);
  expect((await storedIndex(page))!.order).toEqual([EXAMPLE_ID]);

  // Another currency: the numbers would not mean the same, the choice says why.
  await page.getByTestId("engine-import-open-screen").click();
  await page.getByTestId("engine-import-file").setInputFiles({ name: "usd.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ ...file, setup: { ...file.setup, currency: "USD" } })) });
  await expect(page.getByRole("radio", { name: /Merge into/ })).toBeDisabled();
  await expect(page.getByTestId("engine-import-choices")).toContainText(ENGINE_COPY.io.mergeRefused.currency.en);
});

test("« Saisie en tableau », in French: the template downloads, a pasted table is previewed, then applied", async ({ page }) => {
  await open(page, "fr", exampleState());
  await page.getByTestId("engine-table").locator("summary").click();
  const download = page.waitForEvent("download");
  await page.getByTestId("engine-table-template").click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("tdg-modele-2026-08.csv");
  const csv = await readFile((await file.path())!, "utf8");
  expect(csv.startsWith("﻿id;chiffre;étape;numérateur;dénominateur;valeur;unité;source\r\n")).toBe(true);
  expect(csv).toContain("acq.signup-rate;Taux d'inscription;Acquisition;820;26000;;%;GA4\r\n");

  await page
    .getByTestId("engine-table-paste")
    .fill("id;chiffre;étape;numérateur;dénominateur;valeur;unité;source\nacq.top-channel-share;;;;;12,5;%;GA4\nref.k-factor;;;12;800;;;\nmade.up;Inventé;;1;2;;;\n");
  await page.getByTestId("engine-table-read").click();
  await expect(page.getByTestId("engine-table-row-2")).toContainText("Part du premier canal · Modifié");
  await expect(page.getByTestId("engine-table-row-3")).toContainText("Coefficient viral (K) · Nouveau");
  await expect(page.getByTestId("engine-table-row-4")).toContainText("Inventé · Refusé : chiffre inconnu");
  // Nothing is written before « Appliquer ».
  expect((await storedEngineEntry(page))?.state.snapshots[0]?.metrics["ref.k-factor"]?.status).toBe("requested");
  await expect(page.getByTestId("engine-table-apply")).toHaveText("Appliquer 2 chiffres");
  await page.getByTestId("engine-table-apply").click();
  await expect(page.getByTestId("engine-table-applied")).toHaveText(ENGINE_COPY.table.applied.fr);
  const metrics = (await storedEngineEntry(page))!.state.snapshots[0]!.metrics;
  expect(metrics["ref.k-factor"]).toMatchObject({ status: "measured", value: ratio(12, 800), source: { kind: "tool", tool: "spreadsheet" } });
  expect(metrics["acq.top-channel-share"]?.value).toEqual({ kind: "rate", percent: 12.5 });
  // A pasted number is a number saved (§19.12): its stage's first save counts, as from its sheet — never a value.
  await expect.poll(() => trackedEvents(page)).toContain("engine_stage_saved/referral");
});

test("a spreadsheet's tabs, in English, and « Cancel » writes nothing", async ({ page }) => {
  await open(page, "en", exampleState());
  await page.getByTestId("engine-table").locator("summary").click();
  // No header: the template's order, each row matched by its name.
  await page.getByTestId("engine-table-paste").fill("\tViral coefficient (K)\tReferral\t12\t800\n\tDay-30 retention\tRetention\t300\t790\n");
  await page.getByTestId("engine-table-read").click();
  await expect(page.getByTestId("engine-table-row-1")).toContainText("Viral coefficient (K) · New: 0.015");
  // 790 sign-ups where K said 800: the same cohort, so the later row is refused rather than K silently rewritten.
  await expect(page.getByTestId("engine-table-row-2")).toContainText("Day-30 retention · Refused: Viral coefficient (K) carries this count too");
  await page.getByTestId("engine-table-cancel").click();
  await expect(page.getByTestId("engine-table-preview")).toHaveCount(0);
  expect((await storedEngineEntry(page))?.state).toEqual(exampleState());
});

/*
 * The security review of A14 T5: the table's box kept the first engine's
 * paste, and « Appliquer » would have written it into the second. The board
 * is keyed by its engine now. Non-vacuity: without the key, the box still
 * holds the paste after the switch (recorded in the journal).
 */
test("a table pasted for one engine never follows to another", async ({ page }) => {
  const other = { ...exampleState(), id: "00000000-0000-4000-8000-000000000199" };
  await open(page, "en", exampleState(), other);
  await page.getByTestId("engine-table").locator("summary").click();
  await page.getByTestId("engine-table-paste").fill("ref.k-factor,,,12,800,,,\n");
  await page.getByTestId("engine-table-read").click();
  await expect(page.getByTestId("engine-table-preview")).toBeVisible();
  await openSwitcher(page);
  await page.getByTestId(`engine-switch-${other.id}`).click();
  await expect(page.getByTestId("engine-table-preview")).toHaveCount(0);
  await page.getByTestId("engine-table").locator("summary").click();
  await expect(page.getByTestId("engine-table-paste")).toHaveValue("");
});

/*
 * The security review of A14 T5: a file opened on the « illisible » screen
 * cleared the whole device, so one unreadable engine cost the nine others.
 */
test("a file opened over an unreadable engine keeps the engines the device can still read", async ({ page }) => {
  const other = { ...exampleState(), id: "00000000-0000-4000-8000-000000000199" };
  await open(page, "en", exampleState(), other);
  await page.evaluate(({ prefix, id }) => window.localStorage.setItem(`${prefix}${id}`, "{"), { prefix: ENGINE_KEYS.prefix, id: EXAMPLE_ID });
  await page.reload();
  await expect(page.getByTestId("engine-unreadable")).toBeVisible();
  await page.getByTestId("engine-unreadable").getByRole("button", { name: ENGINE_COPY.actions.import.en }).click();
  await page.getByTestId("engine-import-file").setInputFiles({ name: "x.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(exampleState())) });
  await page.getByTestId("engine-import-open").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
  const index = (await storedIndex(page))!;
  expect(index.order).toHaveLength(2);
  expect(index.order[0]).toBe(other.id);
  expect(index.activeId).not.toBe(EXAMPLE_ID);
  // The entry nobody could read is still on the device, never destroyed.
  expect(await page.evaluate(({ prefix, id }) => window.localStorage.getItem(`${prefix}${id}`), { prefix: ENGINE_KEYS.prefix, id: EXAMPLE_ID })).toBe("{");
});

test("erasing everything says how many engines go", async ({ page }) => {
  await open(page, "fr", exampleState(), { ...exampleState(), id: "00000000-0000-4000-8000-000000000199" });
  await page.getByTestId("engine-erase-open").click();
  await expect(page.getByTestId("engine-erase-body")).toContainText("Les 2 moteurs de cet appareil seront supprimés");
});

test("390px, French: the switcher, the import's choices and the table's preview, nothing scrolls sideways", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "fr", exampleState(), { ...exampleState(), id: "00000000-0000-4000-8000-000000000199" });
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await openSwitcher(page);
  await expect(page.getByTestId("engine-switcher-list").locator("li")).toHaveCount(2);
  expect(await overflow()).toBe(0);
  await page.getByTestId("engine-table").locator("summary").click();
  await page.getByTestId("engine-table-paste").fill("ref.k-factor;;;12;800;;;\nmade.up;Un chiffre inventé au nom très long pour voir;;1;2;;;\n");
  await page.getByTestId("engine-table-read").click();
  await expect(page.getByTestId("engine-table-preview")).toBeVisible();
  expect(await overflow()).toBe(0);
  await page.getByTestId("engine-import-open-screen").click();
  await page.getByTestId("engine-import-file").setInputFiles({ name: "x.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(exampleState())) });
  await expect(page.getByTestId("engine-import-choices")).toBeVisible();
  expect(await overflow()).toBe(0);
});
