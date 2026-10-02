import type { Locator, Page } from "@playwright/test";
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
  const menu = page.getByTestId("engine-bar-menu");
  if (!(await menu.evaluate((d) => (d as HTMLDetailsElement).open))) await menu.locator(":scope > summary").click();
}

/** The board's next step (A18 T2.a) when it is that step (`nextStepFor`'s kind): « Démarre {mois} », a past month, the slides… */
export function nextStep(page: Page, kind: string): Locator {
  return page.locator(`[data-testid="engine-next"][data-step="${kind}"]`);
}
