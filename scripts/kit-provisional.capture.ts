import { expect, test, type Page } from "@playwright/test";
import { readdirSync, renameSync } from "node:fs";
import sharp from "sharp";
import { hangUp, openDecember, pickAndRun, seedBeforeLastQuarter } from "../e2e/game-helpers";
import { exampleState } from "../src/lib/engine/__tests__/fixtures";
import { PATH_A } from "../src/lib/game/__tests__/paths";

/**
 * `marketing/assets/provisoire-*.png` — see `kit-capture.config.ts` for how
 * to run it. Same 2× and palette encoding as the Tour's captures
 * (`kit-screenshots.mjs`), and the same data the e2e specs use: the engine on
 * the §6.0 example, the game on path A. Every file name says `provisoire-`,
 * so none can be mistaken for the product as it will open.
 */
const OUT = "marketing/assets";
const SIZES = { desktop: { width: 1280, height: 900 }, mobile: { width: 390, height: 844 } } as const;
const LOCALES = ["en", "fr"] as const;

/** The example's "today" (24 September 2026), at noon — the engine specs' clock. */
const EXAMPLE_CLOCK = new Date(2026, 8, 24, 12);

async function shoot(page: Page, name: string): Promise<void> {
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/provisoire-${name}.png` });
}

for (const locale of LOCALES) {
  for (const [size, viewport] of Object.entries(SIZES)) {
    test(`engine board, §6.0 example (${locale}, ${size})`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.clock.setFixedTime(EXAMPLE_CLOCK);
      await page.goto(`/${locale}/aarrr-funnel-template`);
      await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
      await page.evaluate(
        (state) => window.localStorage.setItem("tdg.engine.v1", JSON.stringify({ schemaVersion: 1, state })),
        exampleState(),
      );
      await page.reload();
      const board = page.getByTestId("engine-board");
      await expect(board).toBeVisible();
      // The board, not the intro above it: the file is named after what it shows.
      await board.evaluate((el) => el.scrollIntoView({ block: "start" }));
      await shoot(page, `06-engine-board-${locale}-${size}`);
    });

    test(`game hub (${locale}, ${size})`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(`/${locale}/game`);
      await shoot(page, `07-game-hub-${locale}-${size}`);
    });
  }

  test(`game quarter and December (${locale}, desktop)`, async ({ page }) => {
    await page.setViewportSize(SIZES.desktop);
    // Path A up to its last quarter, played through the reducer, then the hand opened.
    await seedBeforeLastQuarter(page, PATH_A, locale);
    await hangUp(page);
    await page.getByTestId("game-desk").scrollIntoViewIfNeeded();
    await shoot(page, `08-game-quarter-${locale}-desktop`);
    await pickAndRun(page, PATH_A.at(-1)!);
    await openDecember(page);
    await page.getByTestId("game-ending").scrollIntoViewIfNeeded();
    await shoot(page, `09-game-december-${locale}-desktop`);
  });
}

test.afterAll(async () => {
  for (const f of readdirSync(OUT).filter((n) => n.startsWith("provisoire-") && n.endsWith(".png"))) {
    const p = `${OUT}/${f}`;
    await sharp(p).png({ palette: true, quality: 85, compressionLevel: 9, effort: 8 }).toFile(`${p}.tmp`);
    renameSync(`${p}.tmp`, p);
  }
});
