import type { Page } from "@playwright/test";
import { expect, test, trackedEvents } from "./helpers";
import {
  LEVEL2_PATH,
  acceptResume,
  axeSeriousOrCritical,
  hangUp,
  horizontalOverflow,
  openDecember,
  pickAndRun,
  pickUpCall,
  playQuarter,
  seedGame,
} from "./game-helpers";
import { PATH_A, PATH_C, PATH_D, playPath, type Path } from "../src/lib/game/__tests__/paths-acquisition";
import { GAME_SAVE_KEYS } from "../src/lib/game/storage-keys";
import { LEVEL_TEASERS } from "../src/content/game/hub";

/**
 * Level 2, « Comment les gens vous trouvent » (Pédalix), played through the
 * interface — `CHANTIERS.md` A12.g, on the model of level 1's P1-P27
 * (`game-level.spec.ts`), in both languages, at 1 280 and 390 px.
 *
 * The reference years are written out as the spec tabulates them
 * (`docs/game/niveau-2.md` §17.6), not recomputed from the engine: the unit
 * tests pin the engine to those tables (`acquisition.test.ts`), this file
 * pins the SCREEN — new customers to the ten, never a « % » or a « pt ».
 *
 * Reduced motion everywhere: the months run at once and nothing waits on a
 * timer. The game must be open for this run, as in CI.
 */
test.skip(process.env.GAME_ENABLED !== "true", "GAME_ENABLED is not \"true\" for this run — the level page is closed.");
test.use({ contextOptions: { reducedMotion: "reduce" } });

/** One reference year, as §17.6 tabulates it. */
interface Fixture {
  path: Path;
  moods: readonly [string, string, string, string];
  orders: readonly [null, string, string, string];
  /** New customers a month on the dashboard at the end of each quarter, in the run's language. */
  metric: readonly [string, string, string, string];
  patience: readonly [string, string, string, string];
}

const A: Fixture = {
  path: PATH_A,
  moods: ["firm", "angry", "angry", "firm"],
  orders: [null, "stock", "anchor", "reviews"],
  metric: ["2 100", "2 160", "2 650", "3 000"],
  patience: ["51", "42", "46", "73"],
};

const C: Fixture = {
  path: PATH_C,
  moods: ["firm", "calm", "firm", "angry"],
  orders: [null, "anchor", "teaser", "stock"],
  metric: ["2,310", "2,410", "2,320", "970"],
  patience: ["67", "79", "45", "0"],
};

/** The figure a tile shows — its value span, not the tile, which also prints targets and deltas. */
function tileValue(page: Page, testId: string) {
  return page.getByTestId(testId).locator("[class*='__value']").first();
}

/** The card the CEO asks for heads the hand, with its badge; none in the first quarter. */
async function expectOrder(page: Page, order: string | null, badge: string) {
  if (order === null) {
    await expect(page.getByTestId("game-hand")).not.toContainText(badge);
    return;
  }
  const first = page.getByTestId("game-hand").locator("[data-testid^='game-card-']").first();
  await expect(first).toHaveAttribute("data-testid", `game-card-${order}`);
  await expect(first).toContainText(badge);
}

test.describe("P1 — the first screen of level 2", () => {
  test("Pédalix's year: the call open, January's dashboard in new customers, the shop's phone and its basket", async ({ page }) => {
    await page.goto(LEVEL2_PATH.fr);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Une année chez Pédalix");
    await expect(page.getByTestId("game-desk")).toHaveAttribute("data-phase", "call");
    await expect(page.getByTestId("game-call")).toHaveAttribute("data-mood", "firm");
    await expect(tileValue(page, "game-dash-metric")).toHaveText("2 000");
    await expect(tileValue(page, "game-dash-customers")).toHaveText("60 000");
    await expect(tileValue(page, "game-dash-patience")).toHaveText("55");
    // A count of customers, never a rate.
    await expect(page.getByTestId("game-dash-metric")).not.toContainText("%");
    for (const id of ["game-dash-trust", "game-dash-radar"]) {
      await expect(page.getByTestId(id)).toContainText("pas sur ton dashboard");
      await expect(page.getByTestId(id)).toHaveAttribute("data-state", "hidden");
    }
    // The shop's phone, not Flixo's cancellation screen.
    const phone = page.getByTestId("game-phone");
    await expect(phone).toContainText("Pédalix");
    await expect(phone).toContainText("Pédalix Ville 7");
    await expect(phone).not.toContainText("Flixo");
    const basket = page.getByTestId("game-basket").first();
    await expect(basket).toHaveText("+29 € au panier");
    await expect(basket).toHaveAttribute("data-fees", "false");

    await expect(page.getByTestId("game-hand")).toHaveCount(0);
    await hangUp(page);
    const cards = page.locator("[data-testid^='game-card-']");
    expect(await cards.count()).toBeGreaterThan(4);
    for (const card of await cards.all()) await expect(card).toBeEnabled();
    // P2 — nothing on a card says what it pays.
    for (const text of await cards.allInnerTexts()) expect(text).not.toMatch(/%|[+−-]\s?\d/);
  });
});

test.describe("P5 — the phone and the basket follow the ticks", () => {
  test("a pressure badge shows on the page; an announced delivery empties the basket's extra", async ({ page }) => {
    await page.goto(LEVEL2_PATH.fr);
    await hangUp(page);
    const phone = page.getByTestId("game-phone");
    const basket = page.getByTestId("game-basket").first();

    await page.getByTestId("game-card-stock").click();
    await expect(phone.getByTestId("game-shop-stock")).toHaveText("Plus que 3 en stock");
    // A pressure badge changes nothing in the basket.
    await expect(basket).toHaveText("+29 € au panier");

    await page.getByTestId("game-card-stock").click();
    await expect(phone.getByTestId("game-shop-stock")).toHaveCount(0);
    await page.getByTestId("game-card-delivery").click();
    await expect(phone).toContainText("Livré le mardi 14 · 29 €");
    await expect(basket).toHaveText("0 € de plus qu'annoncé");
    await expect(basket).toHaveAttribute("data-fees", "false");
  });
});

test.describe("a whole year of level 2 through the interface", () => {
  test.slow();

  test("path A (fr): three orders refused, December applauds, and the next level is one click away", async ({ page }) => {
    await page.goto(LEVEL2_PATH.fr);
    for (let q = 1; q <= 4; q++) {
      await expect(page.getByTestId("game-call")).toHaveAttribute("data-mood", A.moods[q - 1]!);
      await hangUp(page);
      await expectOrder(page, A.orders[q - 1]!, "Demandé par le DG");
      await pickAndRun(page, A.path[q - 1]!);
      await expect(tileValue(page, "game-dash-metric")).toHaveText(A.metric[q - 1]!);
      await expect(tileValue(page, "game-dash-patience")).toHaveText(A.patience[q - 1]!);
      await expect(page.getByTestId("game-dash-trust")).toHaveAttribute("data-state", "hidden");
      if (q < 4) await pickUpCall(page);
    }

    await openDecember(page);
    const ending = page.getByTestId("game-ending");
    await expect(ending).toHaveAttribute("data-win", "true");
    await expect(ending).toContainText("nouveaux clients en décembre");
    await expect(page.getByTestId("game-reveal-trust")).toContainText("83 / 100");
    await expect(page.getByTestId("game-reveal-radar")).toContainText("0 / 100");
    await expect(page.getByTestId("game-dash-trust")).toHaveAttribute("data-state", "known");
    // December's curve is graduated in customers, never in percent.
    const curve = page.getByTestId("game-chart-metric").getByRole("img");
    await expect(curve).toHaveAttribute("aria-label", /\S/);
    await expect(page.getByTestId("game-chart-metric")).not.toContainText("%");
    // An honest year used no trick.
    await expect(page.getByTestId("game-catalogue").locator("[data-group='used']")).toHaveCount(0);
    // C31, C75 — the block that closes December leads to the next open level
    // the player has not finished, « jouable »: activation since level 3 opened
    // (A24, ACT-3), written out here as `nextLevelFor` gives it on the table of
    // the five open levels (acquisition, activation, retention, referral, revenue).
    const next = page.getByTestId("game-next-level");
    await expect(next).toContainText("Niveau suivant");
    await expect(next).toContainText("jouable");
    await expect(page.getByTestId("game-next-level-link")).toHaveAttribute("href", "/fr/game/activation?from=other_level");
    await expect(next).toContainText(LEVEL_TEASERS.activation.fr);

    const events = await trackedEvents(page);
    expect(events).toContain("game_started/acquisition/direct");
    expect(events.filter((e) => e === "game_order/refused")).toHaveLength(3);
    expect(events.filter((e) => e.startsWith("game_ending/"))).toEqual(["game_ending/acquisition/applause"]);
  });

  test("path C (en): the basket's hidden fee, the DGCCRF in Q3, a settlement — never a fine", async ({ page }) => {
    await page.goto(LEVEL2_PATH.en);
    for (let q = 1; q <= 4; q++) {
      await expect(page.getByTestId("game-call")).toHaveAttribute("data-mood", C.moods[q - 1]!);
      await hangUp(page);
      await expectOrder(page, C.orders[q - 1]!, "Requested by the CEO");
      if (q === 3) {
        // P5 — a service fee left out of the price: the one basket the pill calls a problem, in words.
        for (const card of C.path[2]!) await page.getByTestId(`game-card-${card}`).click();
        const basket = page.getByTestId("game-basket").first();
        await expect(basket).toHaveAttribute("data-fees", "true");
        await expect(basket).toContainText("mandatory fees outside the displayed price");
        await expect(page.getByTestId("game-phone")).toContainText("Service fee €19");
        await page.getByTestId("game-run").click();
        await page.getByTestId("game-news-skip").click();
        await expect(page.getByTestId("game-report-3")).toBeVisible({ timeout: 10_000 });
      } else {
        await pickAndRun(page, C.path[q - 1]!);
      }
      await expect(tileValue(page, "game-dash-metric")).toHaveText(C.metric[q - 1]!);
      await expect(tileValue(page, "game-dash-patience")).toHaveText(C.patience[q - 1]!);
      if (q === 3) await expect(page.getByTestId("game-report-3")).toContainText("DGCCRF");
      if (q < 3) await expect(page.getByTestId(`game-report-${q}`)).not.toContainText("DGCCRF");
      if (q < 4) await pickUpCall(page);
    }

    await openDecember(page);
    const ending = page.getByTestId("game-ending");
    await expect(ending).toHaveAttribute("data-win", "false");
    await expect(ending).toContainText("Here is what you did.");
    await expect(ending).toContainText("settlement");
    await expect(ending).not.toContainText(/\bfine\b/i);
    const used = page.getByTestId("game-catalogue").locator("[data-group='used']");
    await expect(used.locator("[data-testid^='game-pattern-']")).toHaveCount(6);
    for (const id of ["stock", "reviews", "anchor", "countdown", "native", "teaser"]) {
      await expect(used.getByTestId(`game-pattern-${id}`)).toContainText("removed");
    }

    const events = await trackedEvents(page);
    expect(events.filter((e) => e.startsWith("game_ending/"))).toEqual(["game_ending/acquisition/fine"]);
  });

  test("path D (fr): honest with nothing strong — fired in June", async ({ page }) => {
    await page.goto(LEVEL2_PATH.fr);
    await playQuarter(page, PATH_D[0]!);
    await expect(tileValue(page, "game-dash-metric")).toHaveText("1 980");
    await pickUpCall(page);
    await playQuarter(page, PATH_D[1]!);
    await expect(tileValue(page, "game-dash-metric")).toHaveText("1 950");
    await openDecember(page);
    await expect(page.getByTestId("game-ending")).toHaveAttribute("data-win", "false");
    // P9 — where the hand stood, the year cut short says so; nothing left to run.
    await expect(page.getByTestId("game-year-closed")).toHaveAttribute("data-fired", "true");
    await expect(page.getByTestId("game-year-closed")).toContainText("Année interrompue");
    await expect(page.getByTestId("game-run")).toHaveCount(0);
    const events = await trackedEvents(page);
    expect(events.filter((e) => e.startsWith("game_ending/"))).toEqual(["game_ending/acquisition/firedClean"]);
  });
});

test.describe("level 2 keeps its own year", () => {
  test("a quarter played and a reload: it asks, under its own key, and level 1's save is untouched", async ({ page }) => {
    await page.goto(LEVEL2_PATH.fr);
    await playQuarter(page, PATH_A[0]!);
    const keys = await page.evaluate(() => Object.keys(localStorage));
    expect(keys).toContain(GAME_SAVE_KEYS.acquisition);
    expect(keys).not.toContain(GAME_SAVE_KEYS.retention);

    await page.reload();
    await expect(page.getByTestId("game-resume")).toBeVisible();
    await acceptResume(page);
    await expect(tileValue(page, "game-dash-metric")).toHaveText(A.metric[0]);
  });
});

test.describe("P17 — level 2 on a phone, 390 wide", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("call, hand, report and December: never a sideways scroll; the phone and its basket in the action bar", async ({ page }) => {
    await page.goto(LEVEL2_PATH.en);
    expect(await horizontalOverflow(page)).toBe(0);
    await hangUp(page);
    expect(await horizontalOverflow(page)).toBe(0);
    await expect(page.getByTestId("game-actionbar")).toContainText("in the basket");
    await pickAndRun(page, PATH_C[0]!);
    expect(await horizontalOverflow(page)).toBe(0);

    await seedGame(page, playPath(PATH_C).at(-1)!, LEVEL2_PATH.en, "acquisition");
    await acceptResume(page);
    await expect(page.getByTestId("game-ending")).toBeVisible();
    expect(await horizontalOverflow(page)).toBe(0);
  });
});

test.describe("P21 — level 2's December passes axe", () => {
  test("a settled year, in French", async ({ page }) => {
    await seedGame(page, playPath(PATH_C).at(-1)!, LEVEL2_PATH.fr, "acquisition");
    await acceptResume(page);
    await expect(page.getByTestId("game-ending")).toBeVisible();
    expect(await axeSeriousOrCritical(page)).toEqual([]);
  });
});
