import type { Page } from "@playwright/test";
import { expect } from "./helpers";
import { RETENTION_LEVEL, type RetentionCardId } from "../src/lib/game/levels/retention";
import { GAME_SAVE_KEYS } from "../src/lib/game/storage-keys";
import type { GameState } from "../src/lib/game/types";

/**
 * Driving a year of « Le côté obscur » from a spec (game plan §4.2 G8b).
 *
 * The states come from `src/lib/game/__tests__/paths.ts`, PLAYED through the
 * reducer rather than written by hand, so a seeded save is always one the
 * game could have produced. These helpers import the engine with relative
 * paths only: Playwright does not resolve `@/`, which is why `lib/game` keeps
 * to relative imports (plan §3.1).
 */

export const LEVEL_PATH = { en: "/en/game/retention", fr: "/fr/game/retention" } as const;

/**
 * Puts a year on the device the way the island saves one — the same key and
 * envelope `lib/game/storage.ts` writes — then loads the level page, which
 * reads it after mount. A year with a quarter played opens on « Reprendre
 * l'année en cours ? »; one with nothing played resumes silently.
 */
export async function seedGame(page: Page, state: GameState, path: string = LEVEL_PATH.fr): Promise<void> {
  await page.goto(path);
  await page.evaluate(
    ([key, value]) => window.localStorage.setItem(key, value),
    [
      GAME_SAVE_KEYS.retention,
      JSON.stringify({ modelVersion: RETENTION_LEVEL.modelVersion, savedAt: new Date().toISOString(), state }),
    ] as const,
  );
  await page.reload();
}

/** « Quitter la visio »: the call hangs up and the hand opens. */
export async function hangUp(page: Page): Promise<void> {
  await page.getByTestId("game-hangup").click();
  await expect(page.getByTestId("game-call")).toHaveAttribute("data-state", "hungUp");
}

/** From a quarter's report to the next call: « Le DG t'appelle », then « Décrocher ». */
export async function pickUpCall(page: Page): Promise<void> {
  await page.getByTestId("game-report-next").click();
  await expect(page.getByTestId("game-call")).toHaveAttribute("data-state", "ringing");
  await page.getByTestId("game-pickup").click();
  await expect(page.getByTestId("game-call")).toHaveAttribute("data-state", "open");
}

/**
 * One quarter, from an open call: hang up, tick the two cards, « Lancer », and
 * wait for the quarter's report — through the three months when motion is
 * on, at once under reduced motion.
 */
export async function playQuarter(page: Page, picks: readonly [RetentionCardId, RetentionCardId]): Promise<void> {
  await hangUp(page);
  for (const card of picks) {
    const button = page.getByTestId(`game-card-${card}`);
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
  }
  const q = await page.getByTestId("game-desk").evaluate(() => document.querySelectorAll("[data-testid^='game-journal-']").length + 1);
  await page.getByTestId("game-run").click();
  await expect(page.getByTestId(`game-report-${q}`)).toBeVisible({ timeout: 10_000 });
}
