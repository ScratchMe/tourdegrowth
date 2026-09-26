import type { Page } from "@playwright/test";
import { expect, test } from "./helpers";
import {
  LEVEL_PATH,
  acceptResume,
  axeSeriousOrCritical,
  hangUp,
  horizontalOverflow,
  pickUpCall,
  readNews,
  seedGame,
} from "./game-helpers";
import { PATH_A, PATH_C, playPath } from "../src/lib/game/__tests__/paths";

/**
 * The quarter's news (Antoine, 2026-09-26): « un écran qui vient tout masquer
 * et qui vient livrer une par une les news du trimestre ». A modal screen
 * between the months and the report, one card at a time, the report kept
 * underneath for re-reading.
 *
 * The case it was asked for is the inspection: Antoine played a year where
 * the DGCCRF took his tricks down and could not tell why. Path C lands one in
 * the third quarter; what it took down (pdef, bury, call, cascade, social,
 * notice — read from the engine's log, then pinned here) and its fine
 * (106 000 €) are the words the card has to say.
 */
const GAME_OPEN = process.env.GAME_ENABLED === "true";
test.skip(!GAME_OPEN, "GAME_ENABLED is not \"true\" for this run — the level page is closed.");

test.use({ contextOptions: { reducedMotion: "reduce" } });

/** Path C seeded after its second quarter, the third call picked up, the third quarter's cards picked and run. */
async function runTheInspectionQuarter(page: Page, locale: keyof typeof LEVEL_PATH): Promise<void> {
  await seedGame(page, playPath(PATH_C)[2]!, LEVEL_PATH[locale]);
  await acceptResume(page);
  await expect(page.getByTestId("game-report-2")).toBeVisible();
  await pickUpCall(page);
  await hangUp(page);
  for (const card of PATH_C[2]!) await page.getByTestId(`game-card-${card}`).click();
  await page.getByTestId("game-run").click();
  await expect(page.getByTestId("game-news")).toBeVisible();
}

test("a quarter's news: one card at a time, in order, over the whole page", async ({ page }) => {
  await page.goto(LEVEL_PATH.fr);
  await hangUp(page);
  for (const card of PATH_A[0]!) await page.getByTestId(`game-card-${card}`).click();
  await page.getByTestId("game-run").click();

  const news = page.getByTestId("game-news");
  await expect(news).toBeVisible();
  // A real modal: the page behind cannot be clicked or tabbed into.
  expect(await news.evaluate((el) => (el as HTMLDialogElement).open && el.matches(":modal"))).toBe(true);
  await expect(page.getByTestId("game-news-count")).toContainText("1 sur");
  // The churn is the verdict, told in large, stamped with its status.
  const kinds = await readNews(page);
  expect(kinds[0]).toBe("mail");
  expect(kinds[1]).toBe("result");
  expect(kinds.at(-1)).toBe("boss");
  // Closed: the report is where it always was, and has the focus.
  await expect(page.getByTestId("game-report-1").locator("h2").first()).toBeFocused();
});

test("the result card says the quarter's churn in large, as the report does", async ({ page }) => {
  await page.goto(LEVEL_PATH.fr);
  await hangUp(page);
  for (const card of PATH_A[0]!) await page.getByTestId(`game-card-${card}`).click();
  await page.getByTestId("game-run").click();
  await page.getByTestId("game-news-next").click();
  await expect(page.getByTestId("game-news-item")).toHaveAttribute("data-kind", "result");
  const value = (await page.getByTestId("game-news-value").textContent()) ?? "";
  expect(value).toMatch(/\d/);
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("game-news")).toHaveCount(0);
  // The same figure, on the dashboard the report sits under.
  await expect(page.getByTestId("game-dash-churn")).toContainText(value.trim());
});

test("the inspection says why, names every trick it took down, and is stamped with its fine", async ({ page }) => {
  await runTheInspectionQuarter(page, "fr");
  const item = page.getByTestId("game-news-item");
  // Read up to the inspection's card — a bounded walk, so a card that never
  // comes fails here rather than spinning.
  for (let i = 0; i < 12; i++) {
    if (((await item.textContent()) ?? "").includes("Pourquoi ce contrôle")) break;
    await page.getByTestId("game-news-next").click();
  }
  const why = item.getByTestId("game-clipping-why");
  await expect(why).toContainText("Pourquoi ce contrôle");
  await expect(why).toContainText("radar DGCCRF");
  await expect(why).toContainText("tuile masquée");
  for (const name of ["Préavis contractuel", "Preuve sociale en sortie"]) await expect(why).toContainText(name);
  await expect(item.getByTestId("game-clipping-stamp")).toContainText("Amende");
  await expect(item.getByTestId("game-clipping-stamp")).toContainText("106");
  await expect(item.getByTestId("game-clipping-stamp")).toHaveAttribute("data-tone", "bad");

  // The report underneath says the same why, for re-reading.
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("game-news")).toHaveCount(0);
  const reportWhy = page.getByTestId("game-report-3").getByTestId("game-clipping-why");
  await expect(reportWhy).toContainText("Pourquoi ce contrôle");
  await expect(reportWhy).toContainText("Préavis contractuel");
});

test("Escape, or « Passer au bilan », goes straight to the report — and the live region says the quarter ended", async ({ page }) => {
  await page.goto(LEVEL_PATH.fr);
  await hangUp(page);
  for (const card of PATH_A[0]!) await page.getByTestId(`game-card-${card}`).click();
  await page.getByTestId("game-run").click();
  await expect(page.getByTestId("game-news-next")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("game-news")).toHaveCount(0);
  await expect(page.getByTestId("game-desk")).toHaveAttribute("data-phase", "report");
  await expect(page.getByTestId("game-report-1").locator("h2").first()).toBeFocused();
  await expect(page.getByTestId("game-live")).toContainText("Fin du trimestre 1");
});

test("a reload during the news lands on the report, never back on the news", async ({ page }) => {
  await page.goto(LEVEL_PATH.fr);
  await hangUp(page);
  for (const card of PATH_A[0]!) await page.getByTestId(`game-card-${card}`).click();
  await page.getByTestId("game-run").click();
  await expect(page.getByTestId("game-news")).toBeVisible();
  await page.reload();
  await acceptResume(page);
  await expect(page.getByTestId("game-news")).toHaveCount(0);
  await expect(page.getByTestId("game-report-1")).toBeVisible();
});

for (const [name, viewport] of [
  ["desktop", { width: 1280, height: 900 }],
  ["phone", { width: 390, height: 844 }],
] as const) {
  test.describe(name, () => {
    test.use({ viewport });

    test(`axe and no sideways scroll on every card of the inspection quarter (${name})`, async ({ page }) => {
      await runTheInspectionQuarter(page, "en");
      const total = Number(((await page.getByTestId("game-news-count").textContent()) ?? "").match(/(\d+)\D*$/)?.[1]);
      expect(total).toBeGreaterThan(2);
      for (let i = 0; i < total; i++) {
        const kind = await page.getByTestId("game-news-item").getAttribute("data-kind");
        expect(await axeSeriousOrCritical(page), `axe on card ${i + 1} (${kind})`).toEqual([]);
        expect(await horizontalOverflow(page), `sideways scroll on card ${i + 1} (${kind})`).toBe(0);
        // The one action is always on screen, whatever the card's length.
        await expect(page.getByTestId("game-news-next")).toBeInViewport();
        await page.getByTestId("game-news-next").click();
      }
      await expect(page.getByTestId("game-news")).toHaveCount(0);
    });
  });
}
