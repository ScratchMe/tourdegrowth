import type { Locator, Page } from "@playwright/test";
import { expect } from "./helpers";
import { ENGINE_ENTRY_PREFIX, ENGINE_INDEX_KEY, ENGINE_SCHEMA_VERSION, type EngineIndex, type EngineState, type EngineStore } from "../src/lib/engine/types";

/**
 * The engine's storage as a page holds it (engine spec §19.1.4, A14 T0): an
 * index under `tdg.engines.v3`, and one entry per engine under
 * `tdg.engine.v3.<id>`, each `{ schemaVersion, state }` — the shape the v2
 * store had under its single key.
 *
 * A `page.evaluate` or `addInitScript` body is sent to the browser as text
 * and can't import, so seeds are computed here and handed over as a list of
 * `[key, value]` items to write, and the keys travel as an argument.
 */

export const ENGINE_KEYS = { index: ENGINE_INDEX_KEY, prefix: ENGINE_ENTRY_PREFIX } as const;

/** The localStorage items of a device holding these engines, the first one on screen — as `storage.ts` writes them. */
export function engineSeed(...states: EngineState[]): [string, string][] {
  if (states.length === 0) throw new Error("engineSeed: no engine to seed");
  const index: EngineIndex = { schemaVersion: ENGINE_SCHEMA_VERSION, activeId: states[0]!.id, order: states.map((s) => s.id) };
  return [
    [ENGINE_INDEX_KEY, JSON.stringify(index)],
    ...states.map((state): [string, string] => [`${ENGINE_ENTRY_PREFIX}${state.id}`, JSON.stringify({ schemaVersion: ENGINE_SCHEMA_VERSION, state } satisfies EngineStore)]),
  ];
}

/** Writes the items of `engineSeed` now, on the page as it stands (reload after). */
export async function writeEngineSeed(page: Page, ...states: EngineState[]): Promise<void> {
  await page.evaluate((items) => {
    for (const [key, value] of items) window.localStorage.setItem(key, value);
  }, engineSeed(...states));
}

/** The storage key of the engine on screen, read from the index — for a test that rewrites its entry. Throws when the device holds none. */
export async function activeEngineKey(page: Page): Promise<string> {
  const key = await page.evaluate(({ index, prefix }) => {
    const raw = window.localStorage.getItem(index);
    return raw ? `${prefix}${(JSON.parse(raw) as { activeId: string }).activeId}` : null;
  }, ENGINE_KEYS);
  if (key === null) throw new Error("activeEngineKey: the device holds no engine");
  return key;
}

/** The stored entry of the engine on screen, `{ schemaVersion, state }`, or null. */
export function storedEngineEntry<T = EngineStore>(page: Page): Promise<T | null> {
  return page.evaluate(({ index, prefix }) => {
    const raw = window.localStorage.getItem(index);
    if (!raw) return null;
    const entry = window.localStorage.getItem(`${prefix}${(JSON.parse(raw) as { activeId: string }).activeId}`);
    return entry ? JSON.parse(entry) : null;
  }, ENGINE_KEYS);
}

/**
 * « Ta définition et une note » is folded on a number's screen (A18 T1, design
 * system extension 07): unfolds it so its two boxes can be typed in. Nothing
 * when it is already open — a second click would fold it again.
 */
export async function openWords(sheet: Locator): Promise<void> {
  const words = sheet.locator('details[data-testid^="engine-words-"]');
  if (!(await words.evaluate((d) => (d as HTMLDetailsElement).open))) await words.locator("summary").click();
}

/**
 * The engine bar's menu, « Moteur, mois et fichier » (A18 T2.a, design system
 * extension 07): the switcher, the month shown and its reminder, the file
 * actions. Closed on the board; opened here when it is not, so a spec can
 * reach what it holds. Nothing when it is open already — a second click would
 * fold it again.
 */
export async function openEngineMenu(page: Page): Promise<void> {
  // The bar is the board's: from a number's own screen (A18 T2.b), the way back first.
  await backToBoard(page);
  const menu = page.getByTestId("engine-bar-menu");
  if (!(await menu.evaluate((d) => (d as HTMLDetailsElement).open))) await menu.locator(":scope > summary").click();
}

/** The board's next step (A18 T2.a) when it is that step (`nextStepFor`'s kind): « Démarre {mois} », a past month, the slides… */
export function nextStep(page: Page, kind: string): Locator {
  return page.locator(`[data-testid="engine-next"][data-step="${kind}"]`);
}

/**
 * Back to the board from a number's own screen (A18 T2.b), by « ← Tes
 * chiffres ». Nothing when the board is already on screen.
 */
export async function backToBoard(page: Page): Promise<void> {
  const back = page.getByTestId("engine-number-back");
  if (await back.count()) await back.click();
  await page.getByTestId("engine-board").waitFor();
}

/**
 * A number's own screen (A18 T2.b, C41): its row in « Tes chiffres » opens it,
 * from the board — so from another number's screen, the way back first. The
 * stage tabs it replaced needed the stage too; the list shows every stage.
 * Returns the number's sheet.
 */
export async function openNumber(page: Page, metricDomId: string): Promise<Locator> {
  const sheet = page.getByTestId(`engine-sheet-${metricDomId}`);
  if (await sheet.count()) return sheet;
  await backToBoard(page);
  const row = page.getByTestId(`engine-metric-${metricDomId}`);
  // A row in a closed group (the hybrid's link, at the end of sales-assisted's list): the group opens first.
  const group = row.locator("xpath=ancestor::details[1]");
  if ((await group.count()) && !(await group.evaluate((d) => (d as HTMLDetailsElement).open))) await group.locator(":scope > summary").click();
  await row.click();
  await sheet.waitFor();
  return sheet;
}

/**
 * How many numbers are found, as « Tes chiffres » says it (A18 T2.b): the
 * counts after what remains (« 11 found · 2 estimated… »), on the board — the
 * way back first from a number's screen. 0: no « found » in the counts. The
 * single-engine board's coverage chips said it before (« 1 of 17 numbers
 * found »); the hybrid's columns keep theirs until T5.
 */
export async function expectFound(page: Page, n: number): Promise<void> {
  await backToBoard(page);
  const found = page.getByTestId("engine-progress-counts").filter({ hasText: /\d+ (found|trouvés?)/ });
  if (n === 0) await expect(found).toHaveCount(0);
  else await expect(page.getByTestId("engine-progress-counts")).toHaveText(new RegExp(`(^|· )${n} (found|trouvés?)( ·|$)`));
}

/**
 * A new engine from the start screen (A18 T3.a, design system extension 07):
 * the one question answered (`ss`, the default, is left as it is), « Commencer »,
 * the « Cibles » screen passed, the first number's screen left by « ← Tes
 * chiffres » — on the board, as the old setup's « Tout voir d'un coup » landed.
 */
export async function startEngine(page: Page, motion: "ss" | "sa" | "both" = "ss"): Promise<void> {
  await page.getByTestId("engine-start").waitFor();
  if (motion !== "ss") await page.locator(`#engine-start-motion-${motion}`).check();
  await page.getByTestId("engine-start-go").click();
  await page.getByTestId("engine-targets-next").click();
  await page.getByTestId("engine-number").waitFor();
  await backToBoard(page);
}

/**
 * A number's screen saved and left (A18 T3.b): « Enregistre et continue »
 * leads to the next step, so the sheet goes — that is how a spec knows the
 * save went through. A refused save keeps the sheet, its message under the
 * boxes; a past month corrected only saves, and says « Enregistré ».
 */
export async function expectLeft(page: Page, metricDomId: string): Promise<void> {
  await expect(page.getByTestId(`engine-sheet-${metricDomId}`)).toHaveCount(0);
}
