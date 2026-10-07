import type { Locator, Page } from "@playwright/test";
import { expect, test, trackedEvents } from "./helpers";
import {
  REVENUE_PATH,
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
import { PATH_A, PATH_C, PATH_D, playPath, type Path } from "../src/lib/game/__tests__/paths-revenue";
import { GAME_LEVELS_BY_PILLAR, nextLevelFor } from "../src/lib/game/levels";
import { GAME_SAVE_KEYS } from "../src/lib/game/storage-keys";
import type { LevelSlug } from "../src/lib/game/types";
import { LEVEL_TEASERS } from "../src/content/game/hub";

/**
 * Level 5, « Comment vous gagnez de l'argent » (Gainix), played through the
 * interface — `CHANTIERS.md` A24 REV-4, on the model of level 2's
 * (`game-level2.spec.ts`) and of level 4's (`game-referral.spec.ts`), in both
 * languages, at 1 280 and 390 px.
 *
 * The reference years are written out as the spec tabulates them
 * (`docs/game/revenue.md` §20.6 and §20.7), not recomputed from the engine: the
 * unit tests pin the engine to those tables (`revenue.test.ts`), this file pins
 * the SCREEN — the revenue per active user in euros to the cent, with no « % »
 * and no « pt », the users and the monthly revenue beside it, Gainix's phone,
 * and the pill that says what the end of the trial will charge.
 *
 * Reduced motion everywhere: the months run at once and nothing waits on a
 * timer. The game must be open for this run, as in CI.
 *
 * What does NOT carry over from level 2 (`docs/game/construire-un-niveau.md`
 * §21.3 T4): « never fine » is level 2's rule about its own authority. Here the
 * inspection ends in two procedures, a criminal settlement AND an administrative
 * fine, so the December of the fined year says « settlement » **and** « fine »
 * (§20.12). The authority is level 1's, the DGCCRF: the third quarter's report
 * reads « An inspection by the DGCCRF », and the first two never read « An
 * inspection » (as level 1's spec does). The rule that replaces level 2's « never
 * a % » is « the figure carries no % and no pt »: it watches the figures of the
 * metric (the tile, the timeline, the first figure of each report, December's
 * cell and curve), not the effect lines of a report, which say « +{pct} % ».
 *
 * What this file writes down that the spec leaves to the unit tests: the
 * inspection's stamp (« Inspection · €375,000 ») is read on the news screen,
 * where it lands; the pill's coral is read as the class that paints it
 * (`__over` on the pill, `__alert` in the action bar), because the spec says
 * « en alerte » and the markup says it only there; and « the short form fits on
 * one line at 390 px » (§20.7: « si la capture la montre sur deux lignes,
 * s'arrêter ») is measured as the number of lines the text takes.
 *
 * Non-vacuity, measured (`TESTING.md` §1.1): each change below was made in the
 * production code (or in the level's copy or model), the site rebuilt (the
 * build's exit code read before the tests'), this file run on its own with no
 * retry, and the change undone (`git status` then showed only this file). The
 * count is how many of the 14 specs fell:
 * - `trialCharge` never `silent`: 2 (path C, P17); `ADDON_EUR` 2.99 to 3.99: 3
 *   (P5, path C, P17); the pill's `alert` always false: 3 (P5, path C, P17);
 * - the island's `announce` never saying the sentence: 2 (P5, path C); saying it
 *   on every tick: 0, and none can fall: the sentence is a pure function of the
 *   cards in production, so a tick the island should have kept silent about
 *   would read the same words as the announcement before it (`TESTING.md` §1.2,
 *   a guard no spec can see). P5 still reads what is said when the charge moves;
 * - `fitPhoneView`: `roundpacks` adding no euro line: 1 (path A); `pricing` not
 *   personalising the plans: 1 (P5); `lootbox` drawing no chest: 1 (path C); the
 *   silent renewal drawn plain: 1 (path C);
 * - the model: the fine 375 000 to 300 000: 1 (path C); the display kind `money`
 *   to `count`: 7 (both P1, the three years, December in English, « keeps its
 *   own year »); the curve's graduation step 2 to 3: 2 (path A, December in
 *   English);
 * - December ignoring the collection: 1 (C75, with the ending on the device); the
 *   save key shared with the retention's: 1 (« keeps its own year »);
 *   `gameEndingDetail` naming another level: 3 (the three years);
 * - the copy: « (%) » added to the tile's unit line: 2 (both P1); to December's
 *   cell: 3 (path A, path C, December in English); the inspection's stamp saying
 *   « Sanction »: 1 (path C); the English pill sentence lengthened: 3 (P1 in
 *   English, path C, and P17 on its line count, two lines instead of one); a
 *   « +5 % » on a card's name: 1 (P1 in French, on P2).
 * Not tried: the 390 px overflow count, axe, and the « no % / no pt » negatives
 * on the timeline and on the curve's frame (the curve's graduations and dashed
 * line are read as exact words, which is stricter).
 */
test.skip(process.env.GAME_ENABLED !== "true", "GAME_ENABLED is not \"true\" for this run — the level page is closed.");
test.use({ contextOptions: { reducedMotion: "reduce" } });

/**
 * One reference year, as §20.6 tabulates it. The French figures carry their
 * U+00A0 before « € » and inside digit groups, as the page prints them: the
 * escape is written out, never the invisible character.
 */
interface Fixture {
  path: Path;
  moods: readonly [string, string, string, string];
  orders: readonly [null, string, string, string];
  /** The revenue per user on the dashboard at the end of each quarter, in the run's language. */
  metric: readonly [string, string, string, string];
  patience: readonly [string, string, string, string];
}

const A: Fixture = {
  path: PATH_A,
  moods: ["firm", "angry", "angry", "firm"],
  orders: [null, "addon", "trial", "lootbox"],
  metric: ["4,20\u00a0€", "4,32\u00a0€", "5,31\u00a0€", "6,01\u00a0€"],
  patience: ["51", "42", "46", "73"],
};

const C: Fixture = {
  path: PATH_C,
  moods: ["firm", "calm", "firm", "angry"],
  orders: [null, "trial", "renewal", "addon"],
  metric: ["€4.62", "€4.82", "€4.64", "€1.93"],
  patience: ["67", "79", "45", "0"],
};

/** What §20.12 forbids next to the figure: a « % » or a « pt ». « sept. » is not a « pt ». */
const UNIT = /%|\bpts?\b/;

/** The figure a tile shows — its value span, not the tile, which also prints targets and deltas. */
function tileValue(page: Page, testId: string) {
  return page.getByTestId(testId).locator("[class*='__value']").first();
}

/** The first figure of a quarter's report — the revenue per user, with its label, its target and its verdict in words. */
function firstFigure(page: Page, q: number) {
  return page.getByTestId(`game-report-${q}`).locator("[class*='__figures'] > div").first();
}

/** December's curve: its graduations (not the invisible copies that size their column) and its dashed line's label. */
function chartTicks(page: Page) {
  return page.getByTestId("game-chart-metric").locator("[class$='__tick']");
}
function chartReference(page: Page) {
  return page.getByTestId("game-chart-metric").locator("[class*='__referenceLabel']");
}

/** The pill, as the desk draws it beside the phone. */
function charge(page: Page) {
  return page.getByTestId("game-charge");
}

/** The pill in the action bar: coral (`__alert`, which keeps `__pill`) when it flags a problem, the plain `__pill` otherwise. */
function barAlert(page: Page) {
  return page.getByTestId("game-actionbar").locator("[class*='__alert']");
}
function barPill(page: Page) {
  return page.getByTestId("game-actionbar").locator("[class*='__pill']:not([class*='__alert'])");
}

/** The pill as the desk draws it: its sentence and its two flags, in one assertion each. */
async function expectCharge(page: Page, text: string, flags: { silent: boolean; addon: boolean }) {
  await expect(charge(page)).toHaveText(text);
  await expect(charge(page)).toHaveAttribute("data-silent", String(flags.silent));
  await expect(charge(page)).toHaveAttribute("data-addon", String(flags.addon));
  if (flags.silent || flags.addon) await expect(charge(page)).toHaveClass(/__over\b/);
  else await expect(charge(page)).not.toHaveClass(/__over\b/);
}

/** How many lines a text takes: the distinct tops of the rectangles its range covers. */
async function lineCount(target: Locator): Promise<number> {
  return target.evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    return new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size;
  });
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

/** Unticks the cards one by one, each one confirmed released. */
async function untick(page: Page, cards: readonly string[]) {
  for (const card of cards) {
    const button = page.getByTestId(`game-card-${card}`);
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "false");
  }
}

/** « Lancer » on two ticked cards: the news, then the quarter's report. */
async function run(page: Page, q: number) {
  await page.getByTestId("game-run").click();
  await skipNews(page);
  await expect(page.getByTestId(`game-report-${q}`)).toBeVisible({ timeout: 10_000 });
}

/**
 * « Lancer », then the news read card by card up to the clipping that is
 * stamped — the stamp only lands on the news screen — and the stamp's own
 * words returned; the news closed with Escape, the quarter's report under it.
 * A bounded walk: a card that never comes fails here rather than spinning.
 */
async function runAndReadStamp(page: Page, q: number): Promise<string> {
  await page.getByTestId("game-run").click();
  const news = page.getByTestId("game-news");
  await expect(news).toBeVisible({ timeout: 10_000 });
  const stamp = page.getByTestId("game-news-item").getByTestId("game-clipping-stamp");
  for (let i = 0; i < 12; i++) {
    if ((await stamp.count()) > 0) break;
    await page.getByTestId("game-news-next").click();
  }
  await expect(stamp).toHaveCount(1);
  await expect(stamp).toHaveAttribute("data-tone", "bad");
  const text = ((await stamp.textContent()) ?? "").replace(/\s+/g, " ").trim();
  await page.keyboard.press("Escape");
  await expect(news).toHaveCount(0);
  await expect(page.getByTestId(`game-report-${q}`)).toBeVisible({ timeout: 10_000 });
  return text;
}

test.describe("P1 — the first screen of level 5", () => {
  test("Gainix's year (fr): the call open, January's dashboard in euros, the subscription phone and its pill", async ({ page }) => {
    await page.goto(REVENUE_PATH.fr);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Une année chez Gainix");
    await expect(page.getByTestId("game-desk")).toHaveAttribute("data-phase", "call");
    await expect(page.getByTestId("game-call")).toHaveAttribute("data-mood", "firm");
    await expect(page.getByTestId("game-call")).toContainText("Fin mars, je veux voir 4,30\u00a0€.");
    // Euros to the cent, never a % or a pt, with the quarter's target under it.
    const metric = page.getByTestId("game-dash-metric");
    await expect(tileValue(page, "game-dash-metric")).toHaveText("4,00\u00a0€");
    await expect(metric).toContainText("Revenu par utilisateur");
    await expect(metric).toContainText("actif, par mois");
    await expect(metric).toContainText("objectif du trimestre\u00a0: 4,30\u00a0€");
    await expect(metric).not.toContainText(UNIT);
    await expect(page.getByTestId("game-dash-customers")).toContainText("Utilisateurs actifs");
    await expect(tileValue(page, "game-dash-customers")).toHaveText("200\u00a0000");
    await expect(tileValue(page, "game-dash-revenue")).toHaveText("0,80\u00a0M€");
    await expect(tileValue(page, "game-dash-patience")).toHaveText("55");
    for (const id of ["game-dash-trust", "game-dash-radar"]) {
      await expect(page.getByTestId(id)).toContainText("pas sur ton dashboard");
      await expect(page.getByTestId(id)).toHaveAttribute("data-state", "hidden");
    }
    // Gainix's phone: the plans screen, the shop and the account's renewal line, nothing in production yet.
    const phone = page.getByTestId("game-phone");
    await expect(phone).toContainText("Gainix");
    await expect(phone).toContainText("07:02");
    await expect(phone).toContainText("L'abonnement et la boutique tels que les utilisateurs les voient");
    for (const other of ["Flixo", "Pédalix", "Quandi", "Partix"]) await expect(phone).not.toContainText(other);
    await expect(phone.getByTestId("game-fit-offer")).toHaveText("Essai gratuit 7 jours, puis 7,99\u00a0€ par mois");
    await expect(phone.getByTestId("game-fit-plans")).toContainText("Les formules");
    await expect(phone.getByTestId("game-fit-plans")).toContainText("Mensuel\u00a0: 7,99\u00a0€ par mois");
    await expect(phone.getByTestId("game-fit-plans")).not.toContainText("Coach+");
    await expect(phone.getByTestId("game-fit-shop")).toContainText("Boutique de gemmes");
    await expect(phone.getByTestId("game-fit-shop")).toContainText("Tenue Marathon · 800 gemmes");
    await expect(phone.getByTestId("game-fit-shop")).toContainText("Packs\u00a0: 400 · 800 · 1\u00a0600 gemmes");
    await expect(phone.getByTestId("game-fit-renewal")).toHaveText("Abonnement annuel · prochaine échéance le 3 mars");
    await expect(phone.getByTestId("game-fit-renewal")).toHaveAttribute("data-style", "plain");
    for (const id of ["trialReminder", "programme", "coaching", "downgrade", "chest", "express", "checkoutQuestion"]) {
      await expect(phone.getByTestId(`game-fit-${id}`)).toHaveCount(0);
    }
    // The pill under it: the end of the trial charges the base price, with a reminder nobody has to write — nothing to flag.
    await expectCharge(page, "Prélevé à la fin de l'essai\u00a0: 7,99\u00a0€", { silent: false, addon: false });

    await expect(page.getByTestId("game-hand")).toHaveCount(0);
    await hangUp(page);
    const cards = page.locator("[data-testid^='game-card-']");
    expect(await cards.count()).toBeGreaterThan(4);
    for (const card of await cards.all()) await expect(card).toBeEnabled();
    // P2 — nothing on a card says what it pays.
    for (const text of await cards.allInnerTexts()) expect(text).not.toMatch(/%|[+−-]\s?\d/);
  });

  test("Gainix's year (en): the same screen, in English, with the English figures", async ({ page }) => {
    await page.goto(REVENUE_PATH.en);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("A year at Gainix");
    await expect(page.getByTestId("game-call")).toHaveAttribute("data-mood", "firm");
    await expect(page.getByTestId("game-call")).toContainText("By the end of March I want to see €4.30.");
    const metric = page.getByTestId("game-dash-metric");
    await expect(tileValue(page, "game-dash-metric")).toHaveText("€4.00");
    await expect(metric).toContainText("Revenue per user");
    await expect(metric).toContainText("active, per month");
    await expect(metric).toContainText("quarter target: €4.30");
    await expect(metric).not.toContainText(UNIT);
    await expect(page.getByTestId("game-dash-customers")).toContainText("Active users");
    await expect(tileValue(page, "game-dash-customers")).toHaveText("200,000");
    await expect(tileValue(page, "game-dash-revenue")).toHaveText("€0.80M");
    await expect(tileValue(page, "game-dash-patience")).toHaveText("55");
    const phone = page.getByTestId("game-phone");
    await expect(phone).toContainText("The subscription and the shop as users see them");
    await expect(phone.getByTestId("game-fit-offer")).toHaveText("7-day free trial, then €7.99 a month");
    await expect(phone.getByTestId("game-fit-plans")).toContainText("Monthly: €7.99 a month");
    await expect(phone.getByTestId("game-fit-shop")).toContainText("Packs: 400 · 800 · 1,600 gems");
    await expect(phone.getByTestId("game-fit-renewal")).toHaveText("Yearly subscription · next renewal on 3 March");
    await expectCharge(page, "Charged when the trial ends: €7.99", { silent: false, addon: false });
  });
});

test.describe("P5 — the phone and the pill follow the ticks", () => {
  test("an add-on ticked in advance and a personalised price change the plans and the pill; a reminder changes the phone, not the pill", async ({ page }) => {
    await page.goto(REVENUE_PATH.fr);
    await hangUp(page);
    const phone = page.getByTestId("game-phone");
    const plans = phone.getByTestId("game-fit-plans");
    const live = page.getByTestId("game-live");

    // Nothing ticked: the base plan, the base price, nothing to flag — in the page's pill and in the action bar's.
    await expect(plans).toContainText("Mensuel\u00a0: 7,99\u00a0€ par mois");
    await expectCharge(page, "Prélevé à la fin de l'essai\u00a0: 7,99\u00a0€", { silent: false, addon: false });
    await expect(barPill(page)).toHaveText("Prélevé à la fin de l'essai\u00a0: 7,99\u00a0€");
    await expect(barAlert(page)).toHaveCount(0);

    // `addon`: the option is ticked under the plan, 2,99 € more at the end of the trial, said in words and flagged.
    await tick(page, ["addon"]);
    await expect(plans).toContainText("☑ Coach+ · 2,99\u00a0€ par mois");
    await expectCharge(page, "Prélevé à la fin de l'essai\u00a0: 10,98\u00a0€ · dont une option cochée d'avance", { silent: false, addon: true });
    // The action bar keeps the short form, with no suffix, and paints it coral.
    await expect(barAlert(page)).toHaveText("Prélevé à la fin de l'essai\u00a0: 10,98\u00a0€");
    await expect(barPill(page)).toHaveCount(0);
    // The pill is silent in the island (plan E5): the island's one live region says the whole sentence.
    await expect(charge(page)).not.toHaveAttribute("aria-live", /.*/);
    await expect(live).toContainText("Prélevé à la fin de l'essai\u00a0: 10,98\u00a0€ · dont une option cochée d'avance");

    // `addon` + `pricing`: the monthly price is personalised, 8,49 €, and the charge follows: 11,48 €.
    await tick(page, ["pricing"]);
    await expect(plans).toContainText("Mensuel\u00a0: 8,49\u00a0€ par mois");
    await expect(plans).not.toContainText("7,99");
    await expect(plans).toContainText("☑ Coach+ · 2,99\u00a0€ par mois");
    await expectCharge(page, "Prélevé à la fin de l'essai\u00a0: 11,48\u00a0€ · dont une option cochée d'avance", { silent: false, addon: true });
    await expect(live).toContainText("11,48\u00a0€ · dont une option cochée d'avance");

    // Unticking both takes the screen and the pill back to what they were.
    await untick(page, ["pricing", "addon"]);
    await expect(plans).toContainText("Mensuel\u00a0: 7,99\u00a0€ par mois");
    await expect(plans).not.toContainText("Coach+");
    await expectCharge(page, "Prélevé à la fin de l'essai\u00a0: 7,99\u00a0€", { silent: false, addon: false });
    await expect(barAlert(page)).toHaveCount(0);
    await expect(barPill(page)).toHaveText("Prélevé à la fin de l'essai\u00a0: 7,99\u00a0€");

    // `trialmail`: the reminder shows on the phone, and the charge does not move — still the base price, nothing to flag.
    await tick(page, ["trialmail"]);
    await expect(phone.getByTestId("game-fit-trialReminder")).toHaveText("Rappel envoyé 3 jours avant la fin de l'essai");
    await expectCharge(page, "Prélevé à la fin de l'essai\u00a0: 7,99\u00a0€", { silent: false, addon: false });
  });
});


test.describe("a whole year of level 5 through the interface", () => {
  test.slow();

  test("path A (fr): three orders refused, December applauds, and the next level is one click away", async ({ page }) => {
    await page.goto(REVENUE_PATH.fr);
    const phone = page.getByTestId("game-phone");
    for (let q = 1; q <= 4; q++) {
      await expect(page.getByTestId("game-call")).toHaveAttribute("data-mood", A.moods[q - 1]!);
      await hangUp(page);
      await expectOrder(page, A.orders[q - 1]!, "Demandé par le DG");
      // P5 — each quarter's picks ticked one by one, the phone and the pill read before « Lancer ».
      await tick(page, A.path[q - 1]!);
      if (q === 1) {
        // `fullprice` puts the yearly total first; `checkout` adds the optional question and its three answers.
        await expect(phone.getByTestId("game-fit-offer")).toContainText("Annuel\u00a0: 59,99\u00a0€ par an, soit 5,00\u00a0€ par mois");
        await expect(phone.getByTestId("game-fit-offer")).toContainText("Essai gratuit 7 jours, puis 7,99\u00a0€ par mois");
        const question = phone.getByTestId("game-fit-checkoutQuestion");
        await expect(question).toContainText("Paiement interrompu\u00a0? Dis-nous ce qui t'a arrêté. Facultatif.");
        await expect(question).toContainText("Trop cher pour ce que c'est");
        await expect(question).toContainText("Essayer un programme d'abord");
        await expect(question).toContainText("Autre");
      }
      if (q === 2) {
        await expect(phone.getByTestId("game-fit-downgrade")).toHaveText("Tu t'entraînes moins ? Passe au plan Essentiel à 3,99\u00a0€");
        await expect(phone.getByTestId("game-fit-checkoutQuestion")).toHaveCount(0);
      }
      if (q === 3) {
        // `programs` sells coach programmes one by one; `roundpacks` keeps the round packs and adds the outfit's price in euros.
        await expect(phone.getByTestId("game-fit-coaching")).toHaveText("Programmes de coachs · 14,99\u00a0€ l'unité");
        await expect(phone.getByTestId("game-fit-shop")).toContainText("Packs\u00a0: 400 · 800 · 1\u00a0600 gemmes");
        await expect(phone.getByTestId("game-fit-shop")).toContainText("soit 7,99\u00a0€ la tenue");
      }
      if (q === 4) {
        await expect(phone.getByTestId("game-fit-trialReminder")).toHaveText("Rappel envoyé 3 jours avant la fin de l'essai");
      }
      // An honest year charges the base price at the end of the trial, with nothing to flag: the pill never moves.
      await expectCharge(page, "Prélevé à la fin de l'essai\u00a0: 7,99\u00a0€", { silent: false, addon: false });
      await run(page, q);
      await expect(tileValue(page, "game-dash-metric")).toHaveText(A.metric[q - 1]!);
      await expect(tileValue(page, "game-dash-patience")).toHaveText(A.patience[q - 1]!);
      await expect(page.getByTestId("game-dash-trust")).toHaveAttribute("data-state", "hidden");
      // The report's first figure is the same amount, to the cent, with no unit.
      await expect(firstFigure(page, q).locator("[class*='__figureValue']")).toHaveText(A.metric[q - 1]!);
      await expect(firstFigure(page, q)).not.toContainText(UNIT);
      await expectCharge(page, "Prélevé à la fin de l'essai\u00a0: 7,99\u00a0€", { silent: false, addon: false });
      if (q === 1) await expect(page.getByTestId("game-report-1")).toContainText("Pourquoi le revenu par utilisateur a bougé");
      if (q < 4) await pickUpCall(page);
    }
    // §20.6: the active users go from 200 000 to 211 455, the monthly revenue from 0,80 to 1,27 M€.
    await expect(tileValue(page, "game-dash-customers")).toHaveText("211\u00a0455");
    await expect(tileValue(page, "game-dash-revenue")).toHaveText("1,27\u00a0M€");
    // The timeline names each quarter's revenue per user, never with a unit.
    const timeline = page.getByTestId("game-timeline");
    for (const value of A.metric) await expect(timeline).toContainText(value);
    await expect(timeline).not.toContainText(UNIT);

    await openDecember(page);
    const ending = page.getByTestId("game-ending");
    await expect(ending).toHaveAttribute("data-win", "true");
    await expect(ending).toContainText("Revenu par utilisateur à 6,01\u00a0€ en décembre, 211\u00a0455 utilisateurs actifs");
    await expect(page.getByTestId("game-reveal-metric")).toContainText("Revenu par utilisateur en décembre");
    await expect(page.getByTestId("game-reveal-metric")).toContainText("6,01\u00a0€");
    await expect(page.getByTestId("game-reveal-metric")).not.toContainText(UNIT);
    await expect(page.getByTestId("game-reveal-trust")).toContainText("83 / 100");
    await expect(page.getByTestId("game-reveal-radar")).toContainText("0 / 100");
    await expect(page.getByTestId("game-dash-trust")).toHaveAttribute("data-state", "known");
    // December's curve is graduated in euros, 2 to 8, and its dashed line says the target: the exact words, so neither carries a unit.
    const curve = page.getByTestId("game-chart-metric").getByRole("img");
    await expect(curve).toHaveAttribute("aria-label", /\S/);
    await expect(page.getByTestId("game-chart-metric")).toContainText("Revenu par utilisateur, par mois");
    await expect(chartTicks(page)).toHaveText(["2\u00a0€", "4\u00a0€", "6\u00a0€", "8\u00a0€"]);
    await expect(chartReference(page)).toHaveText("objectif 6,00\u00a0€");
    await expect(page.getByTestId("game-chart-metric")).not.toContainText(UNIT);
    // An honest year used no trick.
    await expect(page.getByTestId("game-catalogue").locator("[data-group='used']")).toHaveCount(0);
    // C31, C75 — the block that closes December: see « the block that closes December » below.
    await expect(page.getByTestId("game-next-level")).toContainText("Niveau suivant");

    // P20 — the analytics of the year, in order, each event once, with the level's own slug.
    await expect
      .poll(() => trackedEvents(page))
      .toEqual([
        "game_started/revenue/direct",
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
        "game_ending/revenue/applause",
      ]);
  });

  test("path C (en): the add-on, the silent trial, the DGCCRF in Q3 — a settlement and a fine", async ({ page }) => {
    await page.goto(REVENUE_PATH.en);
    const phone = page.getByTestId("game-phone");
    const live = page.getByTestId("game-live");
    for (let q = 1; q <= 4; q++) {
      await expect(page.getByTestId("game-call")).toHaveAttribute("data-mood", C.moods[q - 1]!);
      await hangUp(page);
      await expectOrder(page, C.orders[q - 1]!, "Requested by the CEO");
      if (q === 4) {
        // The inspection took six tricks down: the phone is Gainix's original again and the end of the trial charges the base price.
        await expectCharge(page, "Charged when the trial ends: €7.99", { silent: false, addon: false });
        for (const id of ["chest", "express", "programme", "trialReminder"]) await expect(phone.getByTestId(`game-fit-${id}`)).toHaveCount(0);
        await expect(phone.getByTestId("game-fit-renewal")).toHaveAttribute("data-style", "plain");
      }
      // P5 — each quarter's picks ticked one by one, the phone and the pill read before « Run ».
      await tick(page, C.path[q - 1]!);
      if (q === 1) {
        // `addon` + `lootbox`: the option is ticked in advance, and the shop sells a chest at random.
        await expectCharge(page, "Charged when the trial ends: €10.98 · including an add-on ticked in advance", { silent: false, addon: true });
        await expect(phone.getByTestId("game-fit-plans")).toContainText("☑ Coach+ · €2.99 a month");
        await expect(phone.getByTestId("game-fit-chest")).toHaveText("Sprint chest · 300 gems · random contents");
      }
      if (q === 2) {
        // `trial` + `hiddensub` go in with the first quarter's two still in production: 59.99 + 2.99 = 62.98, with no reminder,
        // said in words and flagged. The pill itself stays silent; the island's one live region says the whole sentence.
        const sentence =
          "Charged when the trial ends: €62.98 · with no reminder before the charge · including an add-on ticked in advance";
        await expectCharge(page, sentence, { silent: true, addon: true });
        await expect(charge(page)).toContainText("€62.98");
        await expect(charge(page)).toContainText("with no reminder before the charge");
        await expect(charge(page)).toContainText("including an add-on ticked in advance");
        await expect(barAlert(page)).toHaveText("Charged when the trial ends: €62.98");
        await expect(charge(page)).not.toHaveAttribute("aria-live", /.*/);
        await expect(live).toContainText(sentence);
        await expect(phone.getByTestId("game-fit-offer")).toContainText("14 days free · card required");
        await expect(phone.getByTestId("game-fit-offer")).toContainText("then €59.99 a year");
        await expect(phone.getByTestId("game-fit-programme")).toContainText("8-week programme · €9.99");
        await expect(phone.getByTestId("game-fit-programme")).toContainText("then €9.99 a month, cancel at any time");
      }
      if (q === 3) {
        // `express` and `renewal` change the phone, not the pill: still 62.98, still silent.
        await expect(phone.getByTestId("game-fit-express")).toHaveText("One-tap buying: touching an outfit buys it");
        const renewal = phone.getByTestId("game-fit-renewal");
        await expect(renewal).toHaveAttribute("data-style", "silent");
        await expect(renewal).toHaveText("Renewed automatically on 3 March · €59.99 charged");
        await expectCharge(
          page,
          "Charged when the trial ends: €62.98 · with no reminder before the charge · including an add-on ticked in advance",
          { silent: true, addon: true },
        );
      }
      if (q === 4) {
        // `fullprice` + `trialmail`: the yearly total first, the reminder on the phone, and the base price: nothing to flag.
        await expect(phone.getByTestId("game-fit-offer")).toContainText("Yearly: €59.99 a year, that's €5.00 a month");
        await expect(phone.getByTestId("game-fit-trialReminder")).toHaveText("Reminder sent 3 days before the trial ends");
        await expectCharge(page, "Charged when the trial ends: €7.99", { silent: false, addon: false });
      }
      if (q === 3) {
        // The inspection lands in this quarter: its clipping is stamped with the two procedures' total on the news screen.
        expect(await runAndReadStamp(page, q)).toBe("Inspection · €375,000");
      } else {
        await run(page, q);
      }
      await expect(tileValue(page, "game-dash-metric")).toHaveText(C.metric[q - 1]!);
      await expect(tileValue(page, "game-dash-patience")).toHaveText(C.patience[q - 1]!);
      await expect(firstFigure(page, q)).not.toContainText(UNIT);
      // P8 — the first two reports never read « An inspection »; the third reads the inspection, its two procedures
      // (a criminal settlement, an administrative fine, 375,000 in all) and the 2,738 users who close their accounts.
      if (q < 3) await expect(page.getByTestId(`game-report-${q}`)).not.toContainText("An inspection");
      if (q === 3) {
        const report = page.getByTestId("game-report-3");
        await expect(report).toContainText("An inspection by the DGCCRF");
        await expect(report).toContainText("a criminal settlement");
        await expect(report).toContainText("an administrative fine, €375,000 in all");
        await expect(report).toContainText("2,738 users close their accounts");
        // Everything is taken down on the spot: the end of the trial charges the base price again.
        await expectCharge(page, "Charged when the trial ends: €7.99", { silent: false, addon: false });
      }
      if (q < 4) await pickUpCall(page);
    }
    // §20.6: 171,141 active users in December and a monthly revenue of 0.33 M€, under half of January's 0.80.
    await expect(tileValue(page, "game-dash-customers")).toHaveText("171,141");
    await expect(tileValue(page, "game-dash-revenue")).toHaveText("€0.33M");

    await openDecember(page);
    const ending = page.getByTestId("game-ending");
    await expect(ending).toHaveAttribute("data-win", "false");
    await expect(ending).toContainText("Here is what you did.");
    // Two procedures, so both words: level 2's « never a fine » does not carry over.
    await expect(ending).toContainText("settlement");
    await expect(ending).toContainText(/\bfine\b/);
    await expect(ending).toContainText("Revenue per user at €1.93 in December");
    await expect(page.getByTestId("game-reveal-metric")).toContainText("Revenue per user in December");
    await expect(page.getByTestId("game-reveal-metric")).toContainText("€1.93");
    await expect(page.getByTestId("game-reveal-metric")).not.toContainText(UNIT);
    await expect(page.getByTestId("game-reveal-trust")).toContainText("27 / 100");
    await expect(page.getByTestId("game-reveal-radar")).toContainText("1 / 100");
    const used = page.getByTestId("game-catalogue").locator("[data-group='used']");
    await expect(used.locator("[data-testid^='game-pattern-']")).toHaveCount(6);
    for (const id of ["addon", "lootbox", "trial", "hiddensub", "express", "renewal"]) {
      await expect(used.getByTestId(`game-pattern-${id}`)).toContainText("removed");
    }

    const events = await trackedEvents(page);
    expect(events).toContain("game_started/revenue/direct");
    expect(events.filter((e) => e.startsWith("game_ending/"))).toEqual(["game_ending/revenue/fine"]);
  });

  test("path D (fr): honest with nothing strong — fired in June", async ({ page }) => {
    await page.goto(REVENUE_PATH.fr);
    await playQuarter(page, PATH_D[0]!);
    await expect(tileValue(page, "game-dash-metric")).toHaveText("3,96\u00a0€");
    await expect(tileValue(page, "game-dash-patience")).toHaveText("41");
    // The first quarter's target is 4,30 €: missed by 0,34 €, said in words, in euros and with no unit.
    await expect(firstFigure(page, 1)).toContainText("manqué de 0,34\u00a0€");
    await expect(firstFigure(page, 1)).not.toContainText(UNIT);
    await pickUpCall(page);
    await playQuarter(page, PATH_D[1]!);
    await expect(tileValue(page, "game-dash-metric")).toHaveText("3,89\u00a0€");
    await expect(tileValue(page, "game-dash-patience")).toHaveText("16");
    await openDecember(page);
    await expect(page.getByTestId("game-ending")).toHaveAttribute("data-win", "false");
    await expect(page.getByTestId("game-reveal-trust")).toContainText("73 / 100");
    // P9 — where the hand stood, the year cut short says so; nothing left to run.
    await expect(page.getByTestId("game-year-closed")).toHaveAttribute("data-fired", "true");
    await expect(page.getByTestId("game-year-closed")).toContainText("Année interrompue");
    await expect(page.getByTestId("game-run")).toHaveCount(0);
    const events = await trackedEvents(page);
    expect(events.filter((e) => e.startsWith("game_ending/"))).toEqual(["game_ending/revenue/firedClean"]);
  });
});

test.describe("December's curve in English", () => {
  test("a won year: graduated in euros, the dashed line says « target €6.00 », no unit on the amount", async ({ page }) => {
    await seedGame(page, playPath(PATH_A).at(-1)!, REVENUE_PATH.en, "revenue");
    await acceptResume(page);
    await expect(page.getByTestId("game-ending")).toBeVisible();
    await expect(page.getByTestId("game-ending")).toContainText("Revenue per user at €6.01 in December, 211,455 active users");
    await expect(page.getByTestId("game-reveal-metric")).toContainText("Revenue per user in December");
    await expect(page.getByTestId("game-reveal-metric")).toContainText("€6.01");
    await expect(page.getByTestId("game-reveal-metric")).not.toContainText(UNIT);
    await expect(page.getByTestId("game-chart-metric")).toContainText("Revenue per user, per month");
    await expect(chartTicks(page)).toHaveText(["€2", "€4", "€6", "€8"]);
    await expect(chartReference(page)).toHaveText("target €6.00");
    await expect(page.getByTestId("game-chart-metric")).not.toContainText(UNIT);
    await expect(tileValue(page, "game-dash-customers")).toHaveText("211,455");
    await expect(tileValue(page, "game-dash-revenue")).toHaveText("€1.27M");
  });
});

test.describe("level 5 keeps its own year", () => {
  test("a quarter played and a reload: it asks, under its own key, and the other levels' saves are untouched", async ({ page }) => {
    await page.goto(REVENUE_PATH.fr);
    await playQuarter(page, PATH_A[0]!);
    const keys = await page.evaluate(() => Object.keys(localStorage));
    expect(keys).toContain(GAME_SAVE_KEYS.revenue);
    expect(keys).not.toContain(GAME_SAVE_KEYS.acquisition);
    expect(keys).not.toContain(GAME_SAVE_KEYS.activation);
    expect(keys).not.toContain(GAME_SAVE_KEYS.retention);
    expect(keys).not.toContain(GAME_SAVE_KEYS.referral);

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
 * levels were built, and each new one moves them. The revenue is the last
 * stage of the Tour (the five levels are open today), so with nothing finished
 * the block loops back to the first one, the acquisition, and with that one
 * finished it goes on to the activation.
 */
test.describe("the block that closes December (C75)", () => {
  const unfinished = nextLevelFor<LevelSlug>("revenue", new Set(), GAME_LEVELS_BY_PILLAR);
  const afterIt = unfinished ? nextLevelFor<LevelSlug>("revenue", new Set([unfinished]), GAME_LEVELS_BY_PILLAR) : null;

  test("two Decembers lead to two different levels — otherwise the specs below prove nothing", () => {
    expect(unfinished).not.toBeNull();
    expect(afterIt).not.toBeNull();
    expect(afterIt).not.toBe(unfinished);
    expect(unfinished).not.toBe("revenue");
    expect(afterIt).not.toBe("revenue");
    // §20.12: the revenue is the last of the Tour, so with no collection it loops back to the acquisition.
    expect(unfinished).toBe("acquisition");
  });

  test("with no collection: the next open level in the order of the Tour — the acquisition, by looping", async ({ page }) => {
    await seedGame(page, playPath(PATH_A).at(-1)!, REVENUE_PATH.fr, "revenue");
    await acceptResume(page);
    await expect(page.getByTestId("game-ending")).toBeVisible();
    const next = page.getByTestId("game-next-level");
    await expect(next).toContainText("Niveau suivant");
    await expect(next).toContainText("jouable");
    await expect(page.getByTestId("game-next-level-link")).toHaveAttribute("href", `/fr/game/${unfinished}?from=other_level`);
    await expect(page.getByTestId("game-next-level-link")).toHaveAttribute("href", "/fr/game/acquisition?from=other_level");
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
    await seedGame(page, playPath(PATH_A).at(-1)!, REVENUE_PATH.fr, "revenue");
    await acceptResume(page);
    await expect(page.getByTestId("game-ending")).toBeVisible();
    const next = page.getByTestId("game-next-level");
    await expect(next).toContainText("Niveau suivant");
    await expect(page.getByTestId("game-next-level-link")).toHaveAttribute("href", `/fr/game/${afterIt}?from=other_level`);
    await expect(next).toContainText(LEVEL_TEASERS[afterIt!].fr);
  });
});

test.describe("P17 — level 5 on a phone, 390 wide", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("call, hand, report and December: never a sideways scroll; the phone and its pill in the action bar", async ({ page }) => {
    await page.goto(REVENUE_PATH.en);
    expect(await horizontalOverflow(page)).toBe(0);
    await hangUp(page);
    expect(await horizontalOverflow(page)).toBe(0);
    await expect(page.getByTestId("game-actionbar")).toContainText("Charged when the trial ends");
    await pickAndRun(page, PATH_C[0]!);
    expect(await horizontalOverflow(page)).toBe(0);

    // The longest the pill gets: the silent trial over the ticked add-on, 62.98 at the end of the trial, and the sentence
    // that says so beside it. The action bar keeps the short form, in capitals: on ONE line (§20.7).
    await pickUpCall(page);
    await hangUp(page);
    await tick(page, PATH_C[1]!);
    await expect(charge(page)).toHaveAttribute("data-silent", "true");
    await expect(page.getByTestId("game-actionbar")).toContainText("Charged when the trial ends");
    await expect(page.getByTestId("game-actionbar")).toContainText("€62.98");
    await expect(barAlert(page)).toHaveCount(1);
    expect(await lineCount(barAlert(page))).toBe(1);
    expect(await horizontalOverflow(page)).toBe(0);

    await seedGame(page, playPath(PATH_C).at(-1)!, REVENUE_PATH.en, "revenue");
    await acceptResume(page);
    await expect(page.getByTestId("game-ending")).toBeVisible();
    expect(await horizontalOverflow(page)).toBe(0);
  });
});

test.describe("P21 — level 5's December passes axe", () => {
  test("a fined year, in French", async ({ page }) => {
    await seedGame(page, playPath(PATH_C).at(-1)!, REVENUE_PATH.fr, "revenue");
    await acceptResume(page);
    await expect(page.getByTestId("game-ending")).toBeVisible();
    expect(await axeSeriousOrCritical(page)).toEqual([]);
  });

  test("a won year, in English", async ({ page }) => {
    await seedGame(page, playPath(PATH_A).at(-1)!, REVENUE_PATH.en, "revenue");
    await acceptResume(page);
    await expect(page.getByTestId("game-ending")).toBeVisible();
    expect(await axeSeriousOrCritical(page)).toEqual([]);
  });
});
