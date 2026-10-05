import type { Page } from "@playwright/test";
import { expect, test, trackedEvents } from "./helpers";
import {
  ACTIVATION_PATH,
  acceptResume,
  axeSeriousOrCritical,
  hangUp,
  horizontalOverflow,
  openDecember,
  pickAndRun,
  pickUpCall,
  playQuarter,
  seedGame,
  skipNews,
} from "./game-helpers";
import { PATH_A, PATH_C, PATH_D, playPath, type Path } from "../src/lib/game/__tests__/paths-activation";
import { GAME_LEVELS_BY_PILLAR, nextLevelFor } from "../src/lib/game/levels";
import { GAME_SAVE_KEYS } from "../src/lib/game/storage-keys";
import type { LevelSlug } from "../src/lib/game/types";
import { LEVEL_TEASERS } from "../src/content/game/hub";

/**
 * Level 3, « Comment ils comprennent ce que vous apportez » (Quandi), played
 * through the interface — `CHANTIERS.md` A24 ACT-4, on the model of level 2's
 * (`game-level2.spec.ts`), in both languages, at 1 280 and 390 px.
 *
 * The reference years are written out as the spec tabulates them
 * (`docs/game/activation.md` §18.6), not recomputed from the engine: the unit
 * tests pin the engine to those tables (`activation.test.ts`), this file pins
 * the SCREEN — the activation rate to the tenth of a point with its « % »,
 * never « clients », and the active users and the monthly revenue beside it.
 *
 * Reduced motion everywhere: the months run at once and nothing waits on a
 * timer. The game must be open for this run, as in CI.
 *
 * What does NOT carry over from level 2 (`docs/game/construire-un-niveau.md`
 * §21.3 T4): « never DGCCRF » and « never fine » are level 2's rules about its
 * own authority. Here the CNIL's administrative fine IS a fine, and the
 * complaints name the CNIL from the second quarter on, so no spec asserts the
 * absence of « CNIL » before December — the inspection is read in the third
 * quarter's report by « administrative fine », and in neither of the first
 * two. The rule that replaces level 2's « never a % » is « the rate shows with
 * its % and is never a count of « clients » »: it watches the figures of the
 * metric (the tile, December's cell, curve and ending), not the lines of a
 * report, which say « +{pct} % ».
 *
 * Non-vacuity, measured (`TESTING.md` §1.1): each change below was made in the
 * production code, the site rebuilt (the build's exit code read before the
 * tests'), this file run, and the change undone. The count is how many of the
 * 12 specs fell:
 * - `cookieRefusal` always `{ clicks: 1, alert: false }`: 2 (path C, P17);
 * - the banner ignoring `refuse`: 2 (P5, path C); the sign-up never asking for
 *   the number: 2 (P5, path C);
 * - the island's `announce` saying the cookie sentence on every tick: 1 (P5);
 * - the action bar's pill always the easy sentence: 2 (path C, P17); the
 *   pill's `data-alert` always false: 2 (path C, P17);
 * - December ignoring the collection: 1 (C75, with the ending on the device);
 *   the next level computed from another level: 2 (both C75 specs);
 * - the save key shared with the retention's, or with the acquisition's: 1
 *   each (« keeps its own year »);
 * - `gameEndingDetail` naming another level: 3 (the three years);
 * - the model: the CEO's T2 and T3 orders swapped: 1 (path A; path C passes,
 *   its three orders come out the same under both schedules); the monthly
 *   price 5 to 6: 3 (P1, A, C); `fireBelow` 25 to 5: 1 (path D).
 * Not tried: the 390 px overflow count, axe, P2's « nothing on a card says what
 * it pays », and the « never clients » negatives.
 */
test.skip(process.env.GAME_ENABLED !== "true", "GAME_ENABLED is not \"true\" for this run — the level page is closed.");
test.use({ contextOptions: { reducedMotion: "reduce" } });

/**
 * One reference year, as §18.6 tabulates it. The French figures carry their
 * U+00A0 before « % » and inside digit groups, as the page prints them: the
 * escape is written out, never the invisible character.
 */
interface Fixture {
  path: Path;
  moods: readonly [string, string, string, string];
  orders: readonly [null, string, string, string];
  /** The activation rate on the dashboard at the end of each quarter, in the run's language. */
  metric: readonly [string, string, string, string];
  patience: readonly [string, string, string, string];
}

const A: Fixture = {
  path: PATH_A,
  moods: ["firm", "angry", "angry", "firm"],
  orders: [null, "bundle", "banner", "phone"],
  metric: ["31,5\u00a0%", "32,4\u00a0%", "39,8\u00a0%", "45,0\u00a0%"],
  patience: ["51", "42", "46", "73"],
};

const C: Fixture = {
  path: PATH_C,
  moods: ["firm", "calm", "firm", "angry"],
  orders: [null, "banner", "partners", "bundle"],
  metric: ["34.6%", "36.2%", "34.8%", "14.5%"],
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

/** Ticks the cards one by one, each one confirmed pressed — the phone and the pill follow every click. */
async function tick(page: Page, cards: readonly string[]) {
  for (const card of cards) {
    const button = page.getByTestId(`game-card-${card}`);
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
  }
}

/** « Lancer » on two ticked cards: the news, then the quarter's report. */
async function run(page: Page, q: number) {
  await page.getByTestId("game-run").click();
  await skipNews(page);
  await expect(page.getByTestId(`game-report-${q}`)).toBeVisible({ timeout: 10_000 });
}

test.describe("P1 — the first screen of level 3", () => {
  test("Quandi's year: the call open, January's dashboard in a rate, the planner's phone and its cookie pill", async ({ page }) => {
    await page.goto(ACTIVATION_PATH.fr);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Une année chez Quandi");
    await expect(page.getByTestId("game-desk")).toHaveAttribute("data-phase", "call");
    await expect(page.getByTestId("game-call")).toHaveAttribute("data-mood", "firm");
    // A rate to the tenth of a point, never a count of customers.
    await expect(tileValue(page, "game-dash-metric")).toHaveText("30,0\u00a0%");
    await expect(page.getByTestId("game-dash-metric")).toContainText("Activation");
    await expect(page.getByTestId("game-dash-metric")).toContainText("des inscrits, sous 7 jours");
    await expect(page.getByTestId("game-dash-metric")).not.toContainText("clients");
    await expect(page.getByTestId("game-dash-customers")).toContainText("Utilisateurs actifs");
    await expect(tileValue(page, "game-dash-customers")).toHaveText("60\u00a0000");
    await expect(tileValue(page, "game-dash-revenue")).toHaveText("0,30\u00a0M€");
    await expect(tileValue(page, "game-dash-patience")).toHaveText("55");
    for (const id of ["game-dash-trust", "game-dash-radar"]) {
      await expect(page.getByTestId(id)).toContainText("pas sur ton dashboard");
      await expect(page.getByTestId(id)).toHaveAttribute("data-state", "hidden");
    }
    // Quandi's phone: the first screen of an arrival, nothing in production yet.
    const phone = page.getByTestId("game-phone");
    await expect(phone).toContainText("Quandi");
    await expect(phone).toContainText("08:12");
    await expect(phone).toContainText("L'arrivée sur l'appli telle qu'un indépendant la voit");
    await expect(phone).not.toContainText("Flixo");
    await expect(phone).not.toContainText("Pédalix");
    const banner = phone.getByTestId("game-planner-banner");
    await expect(banner).toHaveAttribute("data-style", "plain");
    await expect(banner).toContainText("Cookies de mesure d'audience");
    await expect(banner).toContainText("Accepter");
    await expect(banner).toContainText("Continuer sans accepter");
    const signup = phone.getByTestId("game-planner-signup");
    await expect(signup).toHaveAttribute("data-phone", "none");
    await expect(signup).toContainText("E-mail · Mot de passe · Métier");
    await expect(phone.getByTestId("game-planner-home")).toContainText("Votre planning est vide.");
    for (const id of ["permissions", "demo", "analysis", "push", "welcome", "calls"]) {
      await expect(phone.getByTestId(`game-planner-${id}`)).toHaveCount(0);
    }
    // The pill under it: one click to refuse, so nothing to flag.
    const cookies = page.getByTestId("game-cookies");
    await expect(cookies).toHaveText("Refuser les cookies\u00a0: 1 clic");
    await expect(cookies).toHaveAttribute("data-clicks", "1");
    await expect(cookies).toHaveAttribute("data-alert", "false");

    await expect(page.getByTestId("game-hand")).toHaveCount(0);
    await hangUp(page);
    const cards = page.locator("[data-testid^='game-card-']");
    expect(await cards.count()).toBeGreaterThan(4);
    for (const card of await cards.all()) await expect(card).toBeEnabled();
    // P2 — nothing on a card says what it pays.
    for (const text of await cards.allInnerTexts()) expect(text).not.toMatch(/%|[+−-]\s?\d/);
  });
});

test.describe("P5 — the phone and the pill follow the ticks", () => {
  test("a permission sheet, an equal banner and a mandatory number show on the phone; refusing stays one click", async ({ page }) => {
    await page.goto(ACTIVATION_PATH.fr);
    await hangUp(page);
    const phone = page.getByTestId("game-phone");
    const banner = phone.getByTestId("game-planner-banner");
    const signup = phone.getByTestId("game-planner-signup");
    const permissions = phone.getByTestId("game-planner-permissions");
    const cookies = page.getByTestId("game-cookies");

    // `bundle`: one sheet asking for everything, one button.
    await page.getByTestId("game-card-bundle").click();
    await expect(permissions).toContainText(
      "Pour bien démarrer, Quandi a besoin de vos contacts, de votre agenda, de vos notifications et de votre position.",
    );
    await expect(permissions).toContainText("Autoriser");
    // Nothing about the cookies changed: the banner is the plain one, refusing is one click.
    await expect(banner).toHaveAttribute("data-style", "plain");
    await expect(cookies).toHaveText("Refuser les cookies\u00a0: 1 clic");

    // `refuse`: « Tout refuser » beside « Tout accepter », the same size — and the pill stays at one click.
    await page.getByTestId("game-card-refuse").click();
    await expect(banner).toHaveAttribute("data-style", "equal");
    await expect(banner).toContainText("Cookies de mesure d'audience");
    await expect(banner).toContainText("Tout refuser");
    await expect(banner).toContainText("Tout accepter");
    await expect(banner).toContainText("Personnaliser");
    await expect(banner).not.toContainText("Continuer sans accepter");
    await expect(cookies).toHaveText("Refuser les cookies\u00a0: 1 clic");
    await expect(cookies).toHaveAttribute("data-clicks", "1");
    await expect(cookies).toHaveAttribute("data-alert", "false");
    // The pill is silent in the island (plan E5), and the island's one live region says nothing
    // about the cookies: the number of clicks did not change.
    await expect(cookies).not.toHaveAttribute("aria-live", /.*/);
    await expect(page.getByTestId("game-live")).not.toContainText("Refuser les cookies");

    // Unticking `bundle` takes its sheet back; `phone` asks for the number at sign-up.
    await page.getByTestId("game-card-bundle").click();
    await expect(permissions).toHaveCount(0);
    await page.getByTestId("game-card-phone").click();
    await expect(signup).toHaveAttribute("data-phone", "required");
    await expect(signup).toContainText("Mobile (obligatoire) · pour sécuriser votre compte");
    await expect(signup).not.toContainText("E-mail · lien de connexion envoyé par e-mail");

    // Unticking `refuse` brings the plain banner back.
    await page.getByTestId("game-card-refuse").click();
    await expect(banner).toHaveAttribute("data-style", "plain");
    await expect(cookies).toHaveText("Refuser les cookies\u00a0: 1 clic");
  });
});

test.describe("a whole year of level 3 through the interface", () => {
  test.slow();

  test("path A (fr): three orders refused, December applauds, and the next level is one click away", async ({ page }) => {
    await page.goto(ACTIVATION_PATH.fr);
    for (let q = 1; q <= 4; q++) {
      await expect(page.getByTestId("game-call")).toHaveAttribute("data-mood", A.moods[q - 1]!);
      await hangUp(page);
      await expectOrder(page, A.orders[q - 1]!, "Demandé par le DG");
      await pickAndRun(page, A.path[q - 1]!);
      await expect(tileValue(page, "game-dash-metric")).toHaveText(A.metric[q - 1]!);
      await expect(tileValue(page, "game-dash-patience")).toHaveText(A.patience[q - 1]!);
      await expect(page.getByTestId("game-dash-trust")).toHaveAttribute("data-state", "hidden");
      if (q === 1) await expect(page.getByTestId("game-report-1")).toContainText("Pourquoi l'activation a bougé");
      if (q < 4) await pickUpCall(page);
    }
    // §18.6: the active users go from 60 000 to 71 887, the monthly revenue from 0,30 to 0,36 M€.
    await expect(tileValue(page, "game-dash-customers")).toHaveText("71\u00a0887");
    await expect(tileValue(page, "game-dash-revenue")).toHaveText("0,36\u00a0M€");

    await openDecember(page);
    const ending = page.getByTestId("game-ending");
    await expect(ending).toHaveAttribute("data-win", "true");
    await expect(ending).toContainText("Activation à 45,0\u00a0% en décembre, 71\u00a0887 utilisateurs actifs");
    await expect(page.getByTestId("game-reveal-metric")).toContainText("Activation en décembre");
    await expect(page.getByTestId("game-reveal-metric")).toContainText("45,0\u00a0%");
    await expect(page.getByTestId("game-reveal-trust")).toContainText("83 / 100");
    await expect(page.getByTestId("game-reveal-radar")).toContainText("0 / 100");
    await expect(page.getByTestId("game-dash-trust")).toHaveAttribute("data-state", "known");
    // December's curve is graduated in percent, as the rate is; its caption and name stay a sentence.
    const curve = page.getByTestId("game-chart-metric").getByRole("img");
    await expect(curve).toHaveAttribute("aria-label", /\S/);
    await expect(page.getByTestId("game-chart-metric")).toContainText("Activation par mois");
    for (const id of ["game-reveal-metric", "game-chart-metric", "game-ending"]) {
      await expect(page.getByTestId(id)).not.toContainText("clients");
    }
    // An honest year used no trick.
    await expect(page.getByTestId("game-catalogue").locator("[data-group='used']")).toHaveCount(0);
    // C31, C75 — the block that closes December: see « the block that closes December » below.
    await expect(page.getByTestId("game-next-level")).toContainText("Niveau suivant");

    // P20 — the analytics of the year, in order, each event once, with the level's own slug.
    await expect
      .poll(() => trackedEvents(page))
      .toEqual([
        "game_started/activation/direct",
        "game_hangup/1",
        "game_quarter/1",
        "game_hangup/2",
        "game_order/refused",
        "game_quarter/2",
        "game_hangup/3",
        "game_order/refused",
        "game_quarter/3",
        "game_hangup/4",
        "game_order/refused",
        "game_quarter/4",
        "game_ending/activation/applause",
      ]);
  });

  test("path C (en): permissions, a mandatory number, the banner, and the CNIL's administrative fine in Q3", async ({ page }) => {
    await page.goto(ACTIVATION_PATH.en);
    const phone = page.getByTestId("game-phone");
    const cookies = page.getByTestId("game-cookies");
    for (let q = 1; q <= 4; q++) {
      await expect(page.getByTestId("game-call")).toHaveAttribute("data-mood", C.moods[q - 1]!);
      await hangUp(page);
      await expectOrder(page, C.orders[q - 1]!, "Requested by the CEO");
      // P5 — each quarter's picks ticked one by one, the phone and the pill read before « Run ».
      await tick(page, C.path[q - 1]!);
      if (q === 1) {
        // `bundle` + `phone`: the sheet is on the phone, the number is required at sign-up, refusing is still one click.
        await expect(phone.getByTestId("game-planner-permissions")).toContainText("To get started, Quandi needs your contacts");
        const signup = phone.getByTestId("game-planner-signup");
        await expect(signup).toHaveAttribute("data-phone", "required");
        await expect(signup).toContainText("Mobile (required) · to secure your account");
        await expect(cookies).toHaveText("Refusing cookies: 1 click");
        await expect(cookies).toHaveAttribute("data-alert", "false");
      }
      if (q === 2) {
        // `banner` goes into production: a big « Accept all », a link to customise, and the refusal a screen further.
        // The pill says what the law says about it, in words, and flags it.
        const banner = phone.getByTestId("game-planner-banner");
        await expect(banner).toHaveAttribute("data-style", "nudged");
        await expect(banner).toContainText("We use cookies to improve your experience.");
        await expect(banner).toContainText("Accept all");
        await expect(banner).toContainText("Customise");
        await expect(banner).not.toContainText("Reject all");
        await expect(cookies).toHaveText("Refusing cookies: 3 clicks · refusing must be as easy as agreeing");
        await expect(cookies).toHaveAttribute("data-clicks", "3");
        await expect(cookies).toHaveAttribute("data-alert", "true");
        await expect(page.getByTestId("game-actionbar")).toContainText("Refusing cookies: 3 clicks");
        // The island's one live region says it, the whole sentence (the pill itself stays silent).
        await expect(page.getByTestId("game-live")).toContainText("Refusing cookies: 3 clicks · refusing must be as easy as agreeing");
        await expect(phone.getByTestId("game-planner-signup")).toContainText("☑ Receive our tips and offers");
      }
      if (q === 3) {
        await expect(phone.getByTestId("game-planner-push")).toContainText("You haven't opened our email yet. It has your schedule in it.");
        await expect(phone.getByTestId("game-planner-signup")).toContainText(
          "By creating my account, I agree that my details may be passed on to our partners.",
        );
        // Still the nudged banner, still three clicks: the inspection has not happened yet.
        await expect(cookies).toHaveAttribute("data-alert", "true");
      }
      if (q === 4) {
        // The inspection removed six tricks: the phone is Quandi's original again, and `refuse` makes the banner equal.
        const banner = phone.getByTestId("game-planner-banner");
        await expect(banner).toHaveAttribute("data-style", "equal");
        await expect(phone.getByTestId("game-planner-permissions")).toHaveCount(0);
        await expect(phone.getByTestId("game-planner-push")).toHaveCount(0);
        await expect(phone.getByTestId("game-planner-signup")).toHaveAttribute("data-phone", "none");
        await expect(cookies).toHaveText("Refusing cookies: 1 click");
        await expect(cookies).toHaveAttribute("data-alert", "false");
      }
      await run(page, q);
      await expect(tileValue(page, "game-dash-metric")).toHaveText(C.metric[q - 1]!);
      await expect(tileValue(page, "game-dash-patience")).toHaveText(C.patience[q - 1]!);
      // The inspection lands in the third quarter and is read as an administrative fine; the first two reports don't say it.
      // The complaints name the CNIL from the second quarter on: its name is never asserted absent.
      if (q === 3) await expect(page.getByTestId("game-report-3")).toContainText("administrative fine");
      if (q < 3) await expect(page.getByTestId(`game-report-${q}`)).not.toContainText("administrative fine");
      if (q < 4) await pickUpCall(page);
    }
    // §18.6: 50 090 active users in December and a monthly revenue of 0.25 M€, under January's 0.30.
    await expect(tileValue(page, "game-dash-customers")).toHaveText("50,090");
    await expect(tileValue(page, "game-dash-revenue")).toHaveText("€0.25M");

    await openDecember(page);
    const ending = page.getByTestId("game-ending");
    await expect(ending).toHaveAttribute("data-win", "false");
    await expect(ending).toContainText("Here is what you did.");
    await expect(ending).toContainText("the fine landed");
    await expect(ending).toContainText("Activation at 14.5% in December");
    await expect(page.getByTestId("game-reveal-metric")).toContainText("Activation in December");
    await expect(page.getByTestId("game-reveal-metric")).toContainText("14.5%");
    await expect(page.getByTestId("game-reveal-trust")).toContainText("27 / 100");
    await expect(page.getByTestId("game-reveal-radar")).toContainText("1 / 100");
    const used = page.getByTestId("game-catalogue").locator("[data-group='used']");
    await expect(used.locator("[data-testid^='game-pattern-']")).toHaveCount(6);
    for (const id of ["bundle", "phone", "prechecked", "banner", "pixels", "partners"]) {
      await expect(used.getByTestId(`game-pattern-${id}`)).toContainText("removed");
    }

    const events = await trackedEvents(page);
    expect(events).toContain("game_started/activation/direct");
    expect(events.filter((e) => e.startsWith("game_ending/"))).toEqual(["game_ending/activation/fine"]);
  });

  test("path D (fr): honest with nothing strong — fired in June", async ({ page }) => {
    await page.goto(ACTIVATION_PATH.fr);
    await playQuarter(page, PATH_D[0]!);
    await expect(tileValue(page, "game-dash-metric")).toHaveText("29,7\u00a0%");
    await expect(tileValue(page, "game-dash-patience")).toHaveText("40");
    await pickUpCall(page);
    await playQuarter(page, PATH_D[1]!);
    await expect(tileValue(page, "game-dash-metric")).toHaveText("29,2\u00a0%");
    await expect(tileValue(page, "game-dash-patience")).toHaveText("15");
    await openDecember(page);
    await expect(page.getByTestId("game-ending")).toHaveAttribute("data-win", "false");
    // P9 — where the hand stood, the year cut short says so; nothing left to run.
    await expect(page.getByTestId("game-year-closed")).toHaveAttribute("data-fired", "true");
    await expect(page.getByTestId("game-year-closed")).toContainText("Année interrompue");
    await expect(page.getByTestId("game-run")).toHaveCount(0);
    const events = await trackedEvents(page);
    expect(events.filter((e) => e.startsWith("game_ending/"))).toEqual(["game_ending/activation/firedClean"]);
  });
});

test.describe("level 3 keeps its own year", () => {
  test("a quarter played and a reload: it asks, under its own key, and the other levels' saves are untouched", async ({ page }) => {
    await page.goto(ACTIVATION_PATH.fr);
    await playQuarter(page, PATH_A[0]!);
    const keys = await page.evaluate(() => Object.keys(localStorage));
    expect(keys).toContain(GAME_SAVE_KEYS.activation);
    expect(keys).not.toContain(GAME_SAVE_KEYS.acquisition);
    expect(keys).not.toContain(GAME_SAVE_KEYS.retention);

    await page.reload();
    await expect(page.getByTestId("game-resume")).toBeVisible();
    await acceptResume(page);
    await expect(tileValue(page, "game-dash-metric")).toHaveText(A.metric[0]);
  });
});

/**
 * C75 — the block that closes December leads to the first open level the
 * player has not finished, in the order of the Tour from the next stage on,
 * looping. Both targets are computed here with `nextLevelFor` on the real
 * table, not written out: which levels are open depends on the order the
 * levels were built, and each new one moves them (acquisition, activation,
 * retention and referral are open today: with nothing finished the block
 * leads to the retention, with that one finished to the referral).
 */
test.describe("the block that closes December (C75)", () => {
  const unfinished = nextLevelFor<LevelSlug>("activation", new Set(), GAME_LEVELS_BY_PILLAR);
  const afterIt = unfinished ? nextLevelFor<LevelSlug>("activation", new Set([unfinished]), GAME_LEVELS_BY_PILLAR) : null;

  test("two Decembers lead to two different levels — otherwise the specs below prove nothing", () => {
    expect(unfinished).not.toBeNull();
    expect(afterIt).not.toBeNull();
    expect(afterIt).not.toBe(unfinished);
    expect(unfinished).not.toBe("activation");
    expect(afterIt).not.toBe("activation");
  });

  test("with no collection: the next open level in the order of the Tour", async ({ page }) => {
    await seedGame(page, playPath(PATH_A).at(-1)!, ACTIVATION_PATH.fr, "activation");
    await acceptResume(page);
    await expect(page.getByTestId("game-ending")).toBeVisible();
    const next = page.getByTestId("game-next-level");
    await expect(next).toContainText("Niveau suivant");
    await expect(next).toContainText("jouable");
    await expect(page.getByTestId("game-next-level-link")).toHaveAttribute("href", `/fr/game/${unfinished}?from=other_level`);
    await expect(next).toContainText(LEVEL_TEASERS[unfinished!].fr);
  });

  test("with that level's ending on the device: the one after it", async ({ page }) => {
    // Before the page loads, so the island reads it as it enters December.
    await page.addInitScript((slug) => {
      localStorage.setItem(
        "tdg.game.collection.v1",
        JSON.stringify({ patterns: {}, endings: { [slug]: { id: "applause", at: "2026-10-04T00:00:00.000Z" } } }),
      );
    }, unfinished!);
    await seedGame(page, playPath(PATH_A).at(-1)!, ACTIVATION_PATH.fr, "activation");
    await acceptResume(page);
    await expect(page.getByTestId("game-ending")).toBeVisible();
    const next = page.getByTestId("game-next-level");
    await expect(next).toContainText("Niveau suivant");
    await expect(page.getByTestId("game-next-level-link")).toHaveAttribute("href", `/fr/game/${afterIt}?from=other_level`);
    await expect(next).toContainText(LEVEL_TEASERS[afterIt!].fr);
  });
});

test.describe("P17 — level 3 on a phone, 390 wide", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("call, hand, report and December: never a sideways scroll; the phone and its cookie pill in the action bar", async ({ page }) => {
    await page.goto(ACTIVATION_PATH.en);
    expect(await horizontalOverflow(page)).toBe(0);
    await hangUp(page);
    expect(await horizontalOverflow(page)).toBe(0);
    await expect(page.getByTestId("game-actionbar")).toContainText("Refusing cookies: 1 click");
    await pickAndRun(page, PATH_C[0]!);
    expect(await horizontalOverflow(page)).toBe(0);

    // The longest the pill gets: the banner ticked, the refusal three clicks away, the law's sentence beside it.
    await pickUpCall(page);
    await hangUp(page);
    await page.getByTestId("game-card-banner").click();
    await expect(page.getByTestId("game-planner-banner")).toHaveAttribute("data-style", "nudged");
    await expect(page.getByTestId("game-actionbar")).toContainText("Refusing cookies: 3 clicks");
    await expect(page.getByTestId("game-cookies")).toHaveAttribute("data-alert", "true");
    expect(await horizontalOverflow(page)).toBe(0);

    await seedGame(page, playPath(PATH_C).at(-1)!, ACTIVATION_PATH.en, "activation");
    await acceptResume(page);
    await expect(page.getByTestId("game-ending")).toBeVisible();
    expect(await horizontalOverflow(page)).toBe(0);
  });
});

test.describe("P21 — level 3's December passes axe", () => {
  test("a settled year, in French", async ({ page }) => {
    await seedGame(page, playPath(PATH_C).at(-1)!, ACTIVATION_PATH.fr, "activation");
    await acceptResume(page);
    await expect(page.getByTestId("game-ending")).toBeVisible();
    expect(await axeSeriousOrCritical(page)).toEqual([]);
  });

  test("a won year, in English", async ({ page }) => {
    await seedGame(page, playPath(PATH_A).at(-1)!, ACTIVATION_PATH.en, "activation");
    await acceptResume(page);
    await expect(page.getByTestId("game-ending")).toBeVisible();
    expect(await axeSeriousOrCritical(page)).toEqual([]);
  });
});
