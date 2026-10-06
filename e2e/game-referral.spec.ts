import type { Page } from "@playwright/test";
import { expect, test, trackedEvents } from "./helpers";
import {
  REFERRAL_PATH,
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
import { PATH_A, PATH_C, PATH_D, playPath, type Path } from "../src/lib/game/__tests__/paths-referral";
import { GAME_LEVELS_BY_PILLAR, nextLevelFor } from "../src/lib/game/levels";
import { GAME_SAVE_KEYS } from "../src/lib/game/storage-keys";
import type { LevelSlug } from "../src/lib/game/types";
import { LEVEL_TEASERS } from "../src/content/game/hub";

/**
 * Level 4, « S'ils vous recommandent » (Partix), played through the interface
 * — `CHANTIERS.md` A24 REF-4, on the model of level 2's (`game-level2.spec.ts`)
 * and of level 3's (`game-activation.spec.ts`), in both languages, at 1 280
 * and 390 px.
 *
 * The reference years are written out as the spec tabulates them
 * (`docs/game/referral.md` §19.6), not recomputed from the engine: the unit
 * tests pin the engine to those tables (`referral.test.ts`), this file pins the
 * SCREEN — the viral coefficient to the hundredth, a bare number with no « % »
 * and no « pt », and the users and the monthly revenue beside it.
 *
 * Reduced motion everywhere: the months run at once and nothing waits on a
 * timer. The game must be open for this run, as in CI.
 *
 * What does NOT carry over from level 2 (`docs/game/construire-un-niveau.md`
 * §21.3 T4): « never DGCCRF » and « never fine » are level 2's rules about its
 * own authority. Here the CNIL's administrative fine IS a fine, and the
 * complaints name the CNIL from the second quarter on (« complaints filed with
 * the CNIL »), so no spec asserts the absence of « CNIL » after the first
 * quarter: the inspection is read in the third quarter's report by « an
 * inspection by the CNIL », and the first quarter's report never names the
 * CNIL at all. The rule that replaces level 2's « never a % » is « the
 * coefficient carries no % and no pt »: it watches the figures of the metric
 * (the tile, the timeline, the first figure of each report, December's cell
 * and curve), not the effect lines of a report, which say « +{pct} % ».
 *
 * Non-vacuity, measured (`TESTING.md` §1.1): each change below was made in the
 * production code (or in the level's copy), the site rebuilt (the build's exit
 * code read before the tests'), this file run on its own with no retry, and the
 * change undone (`git status` then showed only this file). The count is how
 * many of the 14 specs fell:
 * - `MESSAGES_PER_CONTACT` 3 to 2: 2 (path C, P17); the pill's `alert` always
 *   false: 3 (P5, path C, P17);
 * - `fakeinvite` never personalising Léa's message in the phone view: 2 (P5,
 *   path C); `chosen` never reaching the invitation item: 2 (P5, path C);
 * - the island's `announce` saying the sentence on every tick: 1 (P5); never
 *   saying it: 2 (P5, path C);
 * - the action bar's pill always the « 0 message » sentence: 3 (P5, path C,
 *   P17); the pill without its « messages he didn't write » suffix: 2 (P5,
 *   path C);
 * - December ignoring the collection: 1 (C75, with the ending on the device);
 *   the next level computed from the acquisition instead: 1 (C75, no
 *   collection; the other one passes, because counted from the acquisition
 *   the first level not finished is the activation, the answer it expects);
 * - the save key shared with the retention's, the activation's or the
 *   acquisition's: 1 each (« keeps its own year »);
 * - `gameEndingDetail` naming another level: 3 (the three years);
 * - the model: the CEO's T2 and T3 orders swapped: 1 (path A; path C passes,
 *   its orders come out the same under both schedules); the fine 75 000 to
 *   80 000: 1 (path C); `fireBelow` 25 to 5: 1 (path D); the chart's graduation
 *   step 20 to 25: 2 (path A, December in English); the display kind `ratio`
 *   to `count`: 7 (both P1, the three years, December in English, « keeps its
 *   own year »);
 * - the copy: « en % » added to the tile's unit line: 2 (both P1); « (%) »
 *   added to December's cell: 3 (path A, path C, December in English); to the
 *   report's first figure: 3 (the three years).
 * Not tried: the 390 px overflow count, axe, P2's « nothing on a card says what
 * it pays », and the « no % / no pt » negatives on the timeline and on the
 * curve's frame (the curve's graduations and dashed line are read as exact
 * words, which is stricter).
 */
test.skip(process.env.GAME_ENABLED !== "true", "GAME_ENABLED is not \"true\" for this run — the level page is closed.");
test.use({ contextOptions: { reducedMotion: "reduce" } });

/**
 * One reference year, as §19.6 tabulates it. The French figures carry their
 * U+00A0 before « % » and inside digit groups, as the page prints them: the
 * escape is written out, never the invisible character.
 */
interface Fixture {
  path: Path;
  moods: readonly [string, string, string, string];
  orders: readonly [null, string, string, string];
  /** The viral coefficient on the dashboard at the end of each quarter, in the run's language. */
  metric: readonly [string, string, string, string];
  patience: readonly [string, string, string, string];
}

const A: Fixture = {
  path: PATH_A,
  moods: ["firm", "angry", "angry", "firm"],
  orders: [null, "contacts", "autoinvite", "bigshare"],
  metric: ["0,42", "0,43", "0,53", "0,60"],
  patience: ["51", "42", "46", "73"],
};

const C: Fixture = {
  path: PATH_C,
  moods: ["firm", "calm", "firm", "angry"],
  orders: [null, "autoinvite", "bonus", "contacts"],
  metric: ["0.46", "0.48", "0.46", "0.19"],
  patience: ["67", "79", "45", "0"],
};

/** What §19.12 forbids next to the coefficient: a « % » or a « pt ». « sept. » is not a « pt ». */
const UNIT = /%|\bpts?\b/;

/** The figure a tile shows — its value span, not the tile, which also prints targets and deltas. */
function tileValue(page: Page, testId: string) {
  return page.getByTestId(testId).locator("[class*='__value']").first();
}

/** The first figure of a quarter's report — the coefficient, with its label, its note and its verdict in words. */
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

test.describe("P1 — the first screen of level 4", () => {
  test("Partix's year (fr): the call open, January's dashboard in a coefficient, the invitation phone and its pill", async ({ page }) => {
    await page.goto(REFERRAL_PATH.fr);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Une année chez Partix");
    await expect(page.getByTestId("game-desk")).toHaveAttribute("data-phase", "call");
    await expect(page.getByTestId("game-call")).toHaveAttribute("data-mood", "firm");
    await expect(page.getByTestId("game-call")).toContainText("Fin mars, je veux voir 0,43.");
    // A bare coefficient to the hundredth, never a % or a pt, with the quarter's target under it.
    const metric = page.getByTestId("game-dash-metric");
    await expect(tileValue(page, "game-dash-metric")).toHaveText("0,40");
    await expect(metric).toContainText("Coefficient viral");
    await expect(metric).toContainText("par nouvel utilisateur");
    await expect(metric).toContainText("objectif du trimestre\u00a0: 0,43");
    await expect(metric).not.toContainText(UNIT);
    await expect(page.getByTestId("game-dash-customers")).toContainText("Utilisateurs");
    await expect(tileValue(page, "game-dash-customers")).toHaveText("1\u00a0000\u00a0000");
    await expect(tileValue(page, "game-dash-revenue")).toHaveText("0,20\u00a0M€");
    await expect(tileValue(page, "game-dash-patience")).toHaveText("55");
    for (const id of ["game-dash-trust", "game-dash-radar"]) {
      await expect(page.getByTestId(id)).toContainText("pas sur ton dashboard");
      await expect(page.getByTestId(id)).toHaveAttribute("data-state", "hidden");
    }
    // Partix's phone: Thomas's invitation screen and what Léa receives, nothing in production yet.
    const phone = page.getByTestId("game-phone");
    await expect(phone).toContainText("Partix");
    await expect(phone).toContainText("19:30");
    await expect(phone).toContainText("L'invitation telle que Thomas l'envoie et que Léa la reçoit");
    for (const other of ["Flixo", "Pédalix", "Quandi"]) await expect(phone).not.toContainText(other);
    await expect(phone.getByTestId("game-split-group")).toContainText("Week-end à Biarritz · 6 personnes · 1\u00a0284\u00a0€");
    await expect(phone.getByTestId("game-split-invite")).toContainText("Inviter des amis");
    await expect(phone.getByTestId("game-split-invite")).toContainText("Choisir dans tes contacts");
    await expect(phone.getByTestId("game-split-guestDivider")).toHaveText("Ce que reçoit Léa");
    const bubble = phone.getByTestId("game-split-guestMessage");
    await expect(bubble).toHaveAttribute("data-personalised", "false");
    await expect(bubble).toHaveText("Thomas t'invite dans le groupe «\u00a0Week-end à Biarritz\u00a0» sur Partix.");
    for (const id of ["continue", "bonus", "locked", "autoSent", "review", "recap", "guestShadow", "guestPage", "guestQuestion", "noBook"]) {
      await expect(phone.getByTestId(`game-split-${id}`)).toHaveCount(0);
    }
    // The pill under it: no message went out in anyone's name, so nothing to flag.
    const sent = page.getByTestId("game-sent");
    await expect(sent).toHaveText("0 message envoyé au nom de Thomas");
    await expect(sent).toHaveAttribute("data-alert", "false");

    await expect(page.getByTestId("game-hand")).toHaveCount(0);
    await hangUp(page);
    const cards = page.locator("[data-testid^='game-card-']");
    expect(await cards.count()).toBeGreaterThan(4);
    for (const card of await cards.all()) await expect(card).toBeEnabled();
    // P2 — nothing on a card says what it pays.
    for (const text of await cards.allInnerTexts()) expect(text).not.toMatch(/%|[+−-]\s?\d/);
  });

  test("Partix's year (en): the same screen, in English, with the English figures", async ({ page }) => {
    await page.goto(REFERRAL_PATH.en);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("A year at Partix");
    await expect(page.getByTestId("game-call")).toHaveAttribute("data-mood", "firm");
    const metric = page.getByTestId("game-dash-metric");
    await expect(tileValue(page, "game-dash-metric")).toHaveText("0.40");
    await expect(metric).toContainText("Viral coefficient");
    await expect(metric).toContainText("per new user");
    await expect(metric).toContainText("quarter target: 0.43");
    await expect(metric).not.toContainText(UNIT);
    await expect(page.getByTestId("game-dash-customers")).toContainText("Users");
    await expect(tileValue(page, "game-dash-customers")).toHaveText("1,000,000");
    await expect(tileValue(page, "game-dash-revenue")).toHaveText("€0.20M");
    await expect(tileValue(page, "game-dash-patience")).toHaveText("55");
    const phone = page.getByTestId("game-phone");
    await expect(phone).toContainText("The invitation as Thomas sends it and Léa receives it");
    await expect(phone.getByTestId("game-split-group")).toContainText("Weekend in Biarritz · 6 people · €1,284");
    await expect(phone.getByTestId("game-split-invite")).toContainText("Pick from your contacts");
    await expect(phone.getByTestId("game-split-guestMessage")).toHaveText(
      "Thomas is inviting you to the \"Weekend in Biarritz\" group on Partix.",
    );
    await expect(page.getByTestId("game-sent")).toHaveText("0 messages sent in Thomas's name");
    await expect(page.getByTestId("game-sent")).toHaveAttribute("data-alert", "false");
  });
});

test.describe("P5 — the phone and the pill follow the ticks", () => {
  test("a ticked address book and a picked list change the invitation screen, never the pill; a personalised message does", async ({ page }) => {
    await page.goto(REFERRAL_PATH.fr);
    await hangUp(page);
    const phone = page.getByTestId("game-phone");
    const invite = phone.getByTestId("game-split-invite");
    const bubble = phone.getByTestId("game-split-guestMessage");
    const sent = page.getByTestId("game-sent");
    const live = page.getByTestId("game-live");

    // Nothing ticked: the current invitation screen, a ready-made message, no message sent in anyone's name.
    await expect(invite).toContainText("Choisir dans tes contacts");
    await expect(sent).toHaveText("0 message envoyé au nom de Thomas");
    await expect(sent).toHaveAttribute("data-alert", "false");

    // `contacts`: every contact ticked in advance. The pill does not move: it counts messages, and none went out.
    await page.getByTestId("game-card-contacts").click();
    await expect(invite).toContainText("214 contacts sélectionnés");
    await expect(invite).not.toContainText("Choisir dans tes contacts");
    await expect(sent).toHaveText("0 message envoyé au nom de Thomas");
    await expect(sent).toHaveAttribute("data-alert", "false");

    // `contacts` + `chosen`: picked one by one, the message editable — the preselection is gone.
    await page.getByTestId("game-card-chosen").click();
    await expect(invite).toContainText("2 contacts choisis · message modifiable");
    await expect(invite).not.toContainText("214 contacts sélectionnés");
    await expect(sent).toHaveText("0 message envoyé au nom de Thomas");
    await expect(sent).toHaveAttribute("data-alert", "false");
    // Nothing the pill counts changed, so the island's one live region said nothing about it.
    await expect(live).not.toContainText("au nom de Thomas");

    // Unticking both takes the screen back to what it was.
    await untick(page, ["chosen", "contacts"]);
    await expect(invite).toContainText("Choisir dans tes contacts");
    await expect(invite).not.toContainText("contacts choisis");
    await expect(invite).not.toContainText("contacts sélectionnés");

    // `fakeinvite`: Léa's message is personalised, and 214 messages go out in Thomas's name — in words, and flagged.
    await page.getByTestId("game-card-fakeinvite").click();
    await expect(bubble).toHaveAttribute("data-personalised", "true");
    await expect(bubble).toHaveText("Thomas t'attend sur Partix\u00a0! 3 de tes amis y sont déjà.");
    await expect(sent).toHaveText("214 messages envoyés au nom de Thomas · des messages qu'il n'a pas écrits");
    await expect(sent).toHaveAttribute("data-alert", "true");
    await expect(page.getByTestId("game-actionbar")).toContainText("214 messages envoyés au nom de Thomas");
    // The pill is silent in the island (plan E5): the island's one live region says the whole sentence.
    await expect(sent).not.toHaveAttribute("aria-live", /.*/);
    await expect(live).toContainText("214 messages envoyés au nom de Thomas · des messages qu'il n'a pas écrits");

    // Unticking it brings the ready-made message back and the count to zero.
    await untick(page, ["fakeinvite"]);
    await expect(bubble).toHaveAttribute("data-personalised", "false");
    await expect(sent).toHaveText("0 message envoyé au nom de Thomas");
    await expect(sent).toHaveAttribute("data-alert", "false");
  });
});

test.describe("a whole year of level 4 through the interface", () => {
  test.slow();

  test("path A (fr): three orders refused, December applauds, and the next level is one click away", async ({ page }) => {
    await page.goto(REFERRAL_PATH.fr);
    for (let q = 1; q <= 4; q++) {
      await expect(page.getByTestId("game-call")).toHaveAttribute("data-mood", A.moods[q - 1]!);
      await hangUp(page);
      await expectOrder(page, A.orders[q - 1]!, "Demandé par le DG");
      await pickAndRun(page, A.path[q - 1]!);
      await expect(tileValue(page, "game-dash-metric")).toHaveText(A.metric[q - 1]!);
      await expect(tileValue(page, "game-dash-patience")).toHaveText(A.patience[q - 1]!);
      await expect(page.getByTestId("game-dash-trust")).toHaveAttribute("data-state", "hidden");
      // The report's first figure is the same coefficient, to the hundredth, with no unit.
      await expect(firstFigure(page, q).locator("[class*='__figureValue']")).toHaveText(A.metric[q - 1]!);
      await expect(firstFigure(page, q)).not.toContainText(UNIT);
      // An honest year sent no message in anyone's name: the pill never moves.
      await expect(page.getByTestId("game-sent")).toHaveText("0 message envoyé au nom de Thomas");
      await expect(page.getByTestId("game-sent")).toHaveAttribute("data-alert", "false");
      if (q === 1) await expect(page.getByTestId("game-report-1")).toContainText("Pourquoi le coefficient viral a bougé");
      if (q < 4) await pickUpCall(page);
    }
    // §19.6: the users go from 1 000 000 to 1 112 020, the monthly revenue from 0,20 to 0,22 M€.
    await expect(tileValue(page, "game-dash-customers")).toHaveText("1\u00a0112\u00a0020");
    await expect(tileValue(page, "game-dash-revenue")).toHaveText("0,22\u00a0M€");
    // The timeline names each quarter's coefficient, never with a unit.
    const timeline = page.getByTestId("game-timeline");
    for (const value of A.metric) await expect(timeline).toContainText(value);
    await expect(timeline).not.toContainText(UNIT);

    await openDecember(page);
    const ending = page.getByTestId("game-ending");
    await expect(ending).toHaveAttribute("data-win", "true");
    await expect(ending).toContainText("Coefficient viral à 0,60 en décembre, 1\u00a0112\u00a0020 utilisateurs");
    await expect(page.getByTestId("game-reveal-metric")).toContainText("Coefficient viral en décembre");
    await expect(page.getByTestId("game-reveal-metric")).toContainText("0,60");
    await expect(page.getByTestId("game-reveal-metric")).not.toContainText(UNIT);
    await expect(page.getByTestId("game-reveal-trust")).toContainText("83 / 100");
    await expect(page.getByTestId("game-reveal-radar")).toContainText("0 / 100");
    await expect(page.getByTestId("game-dash-trust")).toHaveAttribute("data-state", "known");
    // December's curve is graduated in hundredths, as the coefficient is, and its dashed line says the target:
    // the exact words, so neither carries a unit.
    const curve = page.getByTestId("game-chart-metric").getByRole("img");
    await expect(curve).toHaveAttribute("aria-label", /\S/);
    await expect(page.getByTestId("game-chart-metric")).toContainText("Coefficient viral par mois");
    await expect(chartTicks(page)).toHaveText(["0,2", "0,4", "0,6", "0,8"]);
    await expect(chartReference(page)).toHaveText("objectif 0,60");
    await expect(page.getByTestId("game-chart-metric")).not.toContainText(UNIT);
    // An honest year used no trick.
    await expect(page.getByTestId("game-catalogue").locator("[data-group='used']")).toHaveCount(0);
    // C31, C75 — the block that closes December: see « the block that closes December » below.
    await expect(page.getByTestId("game-next-level")).toContainText("Niveau suivant");

    // P20 — the analytics of the year, in order, each event once, with the level's own slug.
    await expect
      .poll(() => trackedEvents(page))
      .toEqual([
        "game_started/referral/direct",
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
        "game_ending/referral/applause",
      ]);
  });

  test("path C (en): the address book, the messages in Thomas's name, and the CNIL's administrative fine in Q3", async ({ page }) => {
    await page.goto(REFERRAL_PATH.en);
    const phone = page.getByTestId("game-phone");
    const sent = page.getByTestId("game-sent");
    for (let q = 1; q <= 4; q++) {
      await expect(page.getByTestId("game-call")).toHaveAttribute("data-mood", C.moods[q - 1]!);
      await hangUp(page);
      await expectOrder(page, C.orders[q - 1]!, "Requested by the CEO");
      // P5 — each quarter's picks ticked one by one, the phone and the pill read before « Run ».
      await tick(page, C.path[q - 1]!);
      if (q === 1) {
        // `contacts` + `bigshare`: every contact ticked, a big « Continue » and a grey « skip ». Nothing went out in anyone's name.
        await expect(phone.getByTestId("game-split-invite")).toContainText("214 contacts selected");
        const next = phone.getByTestId("game-split-continue");
        await expect(next).toContainText("Expense added · Restaurant · €186");
        await expect(next).toContainText("Continue");
        await expect(next).toContainText("inviting the group and 12 suggested contacts");
        await expect(next).toContainText("skip");
        await expect(sent).toHaveText("0 messages sent in Thomas's name");
        await expect(sent).toHaveAttribute("data-alert", "false");
      }
      if (q === 2) {
        // `autoinvite` + `fakeinvite` go in with the first quarter's two still in production: 642 + 214 = 856 messages,
        // said in words and flagged. The pill itself stays silent; the island's one live region says the whole sentence.
        await expect(sent).toHaveText("856 messages sent in Thomas's name · messages he didn't write");
        await expect(sent).toHaveAttribute("data-alert", "true");
        await expect(page.getByTestId("game-actionbar")).toContainText("856 messages sent in Thomas's name");
        await expect(sent).not.toHaveAttribute("aria-live", /.*/);
        await expect(page.getByTestId("game-live")).toContainText("856 messages sent in Thomas's name · messages he didn't write");
        await expect(phone.getByTestId("game-split-autoSent")).toContainText(
          "Invitations sent to your 214 contacts · 2 follow-ups scheduled",
        );
        await expect(phone.getByTestId("game-split-guestMessage")).toHaveAttribute("data-personalised", "true");
        await expect(phone.getByTestId("game-split-guestMessage")).toHaveText(
          "Thomas is waiting for you on Partix! 3 of your friends are already there.",
        );
      }
      if (q === 3) {
        // `shadow` and `bonus` change the phone, not the pill: still 856.
        await expect(phone.getByTestId("game-split-guestShadow")).toContainText("4 of your contacts use Partix. Join them.");
        const bonus = phone.getByTestId("game-split-bonus");
        await expect(bonus).toHaveAttribute("data-style", "loud");
        await expect(bonus).toContainText("€10 for you, €10 for your friend");
        await expect(bonus).toContainText("*see conditions");
        await expect(sent).toHaveText("856 messages sent in Thomas's name · messages he didn't write");
        await expect(sent).toHaveAttribute("data-alert", "true");
      }
      if (q === 4) {
        // The inspection removed six tricks: the phone is Partix's original again, and no message goes out in anyone's name.
        await expect(sent).toHaveText("0 messages sent in Thomas's name");
        await expect(sent).toHaveAttribute("data-alert", "false");
        for (const id of ["continue", "autoSent", "guestShadow"]) await expect(phone.getByTestId(`game-split-${id}`)).toHaveCount(0);
        // `fairbonus` + `chosen`: the offer says its conditions, the contacts are picked one by one.
        const bonus = phone.getByTestId("game-split-bonus");
        await expect(bonus).toHaveAttribute("data-style", "clear");
        await expect(bonus).toContainText("€5 each on their first shared expense");
        await expect(bonus).toContainText("Once per friend · paid within 48 hours");
        await expect(phone.getByTestId("game-split-invite")).toContainText("2 contacts picked · editable message");
        await expect(phone.getByTestId("game-split-guestMessage")).toHaveAttribute("data-personalised", "false");
      }
      if (q === 3) {
        // The inspection lands in this quarter: its clipping is stamped with the fine on the news screen.
        expect(await runAndReadStamp(page, q)).toBe("Fined · €75,000");
      } else {
        await run(page, q);
      }
      await expect(tileValue(page, "game-dash-metric")).toHaveText(C.metric[q - 1]!);
      await expect(tileValue(page, "game-dash-patience")).toHaveText(C.patience[q - 1]!);
      await expect(firstFigure(page, q)).not.toContainText(UNIT);
      // The first quarter's report never names the CNIL; the second's complaints do, without an inspection;
      // the third's report reads the inspection and its administrative fine, and 14,318 users who delete their accounts.
      if (q === 1) await expect(page.getByTestId("game-report-1")).not.toContainText("CNIL");
      if (q === 2) {
        await expect(page.getByTestId("game-report-2")).toContainText("complaints filed with the CNIL");
        await expect(page.getByTestId("game-report-2")).not.toContainText("inspection by the CNIL");
      }
      if (q === 3) {
        await expect(page.getByTestId("game-report-3")).toContainText("inspection by the CNIL");
        await expect(page.getByTestId("game-report-3")).toContainText("administrative fine of €75,000");
        await expect(page.getByTestId("game-report-3")).toContainText("14,318");
      }
      if (q < 4) await pickUpCall(page);
    }
    // §19.6: 881,732 users in December and a monthly revenue of 0.18 M€, under January's 0.20.
    await expect(tileValue(page, "game-dash-customers")).toHaveText("881,732");
    await expect(tileValue(page, "game-dash-revenue")).toHaveText("€0.18M");

    await openDecember(page);
    const ending = page.getByTestId("game-ending");
    await expect(ending).toHaveAttribute("data-win", "false");
    await expect(ending).toContainText("Here is what you did.");
    await expect(ending).toContainText(/\bfine\b/);
    await expect(ending).not.toContainText(/settlement/i);
    await expect(ending).toContainText("Viral coefficient at 0.19 in December");
    await expect(page.getByTestId("game-reveal-metric")).toContainText("Viral coefficient in December");
    await expect(page.getByTestId("game-reveal-metric")).toContainText("0.19");
    await expect(page.getByTestId("game-reveal-metric")).not.toContainText(UNIT);
    await expect(page.getByTestId("game-reveal-trust")).toContainText("27 / 100");
    await expect(page.getByTestId("game-reveal-radar")).toContainText("1 / 100");
    const used = page.getByTestId("game-catalogue").locator("[data-group='used']");
    await expect(used.locator("[data-testid^='game-pattern-']")).toHaveCount(6);
    for (const id of ["contacts", "bigshare", "fakeinvite", "autoinvite", "shadow", "bonus"]) {
      await expect(used.getByTestId(`game-pattern-${id}`)).toContainText("removed");
    }
    // No « settlement » anywhere on the level's December: the CNIL fined, it did not settle.
    await expect(page.getByTestId("game-desk")).not.toContainText(/settlement/i);

    const events = await trackedEvents(page);
    expect(events).toContain("game_started/referral/direct");
    expect(events.filter((e) => e.startsWith("game_ending/"))).toEqual(["game_ending/referral/fine"]);
  });

  test("path D (fr): honest with nothing strong — fired in June", async ({ page }) => {
    await page.goto(REFERRAL_PATH.fr);
    await playQuarter(page, PATH_D[0]!);
    await expect(tileValue(page, "game-dash-metric")).toHaveText("0,40");
    await expect(tileValue(page, "game-dash-patience")).toHaveText("41");
    // The first quarter's target is 0,43: missed by 0,03, said in words, in hundredths and with no unit.
    await expect(firstFigure(page, 1)).toContainText("manqué de 0,03");
    await expect(firstFigure(page, 1)).not.toContainText(UNIT);
    await pickUpCall(page);
    await playQuarter(page, PATH_D[1]!);
    await expect(tileValue(page, "game-dash-metric")).toHaveText("0,39");
    await expect(tileValue(page, "game-dash-patience")).toHaveText("16");
    await openDecember(page);
    await expect(page.getByTestId("game-ending")).toHaveAttribute("data-win", "false");
    await expect(page.getByTestId("game-reveal-trust")).toContainText("73 / 100");
    // P9 — where the hand stood, the year cut short says so; nothing left to run.
    await expect(page.getByTestId("game-year-closed")).toHaveAttribute("data-fired", "true");
    await expect(page.getByTestId("game-year-closed")).toContainText("Année interrompue");
    await expect(page.getByTestId("game-run")).toHaveCount(0);
    const events = await trackedEvents(page);
    expect(events.filter((e) => e.startsWith("game_ending/"))).toEqual(["game_ending/referral/firedClean"]);
  });
});

test.describe("December's curve in English", () => {
  test("a won year: graduated in hundredths, the dashed line says « target 0.60 », no unit on the coefficient", async ({ page }) => {
    await seedGame(page, playPath(PATH_A).at(-1)!, REFERRAL_PATH.en, "referral");
    await acceptResume(page);
    await expect(page.getByTestId("game-ending")).toBeVisible();
    await expect(page.getByTestId("game-ending")).toContainText("Viral coefficient at 0.60 in December");
    await expect(page.getByTestId("game-reveal-metric")).toContainText("Viral coefficient in December");
    await expect(page.getByTestId("game-reveal-metric")).toContainText("0.60");
    await expect(page.getByTestId("game-reveal-metric")).not.toContainText(UNIT);
    await expect(page.getByTestId("game-chart-metric")).toContainText("Viral coefficient per month");
    await expect(chartTicks(page)).toHaveText(["0.2", "0.4", "0.6", "0.8"]);
    await expect(chartReference(page)).toHaveText("target 0.60");
    await expect(page.getByTestId("game-chart-metric")).not.toContainText(UNIT);
    await expect(tileValue(page, "game-dash-customers")).toHaveText("1,112,020");
    await expect(tileValue(page, "game-dash-revenue")).toHaveText("€0.22M");
  });
});

test.describe("level 4 keeps its own year", () => {
  test("a quarter played and a reload: it asks, under its own key, and the other levels' saves are untouched", async ({ page }) => {
    await page.goto(REFERRAL_PATH.fr);
    await playQuarter(page, PATH_A[0]!);
    const keys = await page.evaluate(() => Object.keys(localStorage));
    expect(keys).toContain(GAME_SAVE_KEYS.referral);
    expect(keys).not.toContain(GAME_SAVE_KEYS.acquisition);
    expect(keys).not.toContain(GAME_SAVE_KEYS.activation);
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
 * levels were built, and each new one moves them (the five levels are open
 * today: with nothing finished the block leads to the revenue, which comes
 * right after the referral, and with that one finished it loops back to the
 * acquisition).
 */
test.describe("the block that closes December (C75)", () => {
  const unfinished = nextLevelFor<LevelSlug>("referral", new Set(), GAME_LEVELS_BY_PILLAR);
  const afterIt = unfinished ? nextLevelFor<LevelSlug>("referral", new Set([unfinished]), GAME_LEVELS_BY_PILLAR) : null;

  test("two Decembers lead to two different levels — otherwise the specs below prove nothing", () => {
    expect(unfinished).not.toBeNull();
    expect(afterIt).not.toBeNull();
    expect(afterIt).not.toBe(unfinished);
    expect(unfinished).not.toBe("referral");
    expect(afterIt).not.toBe("referral");
  });

  test("with no collection: the next open level in the order of the Tour", async ({ page }) => {
    await seedGame(page, playPath(PATH_A).at(-1)!, REFERRAL_PATH.fr, "referral");
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
    await seedGame(page, playPath(PATH_A).at(-1)!, REFERRAL_PATH.fr, "referral");
    await acceptResume(page);
    await expect(page.getByTestId("game-ending")).toBeVisible();
    const next = page.getByTestId("game-next-level");
    await expect(next).toContainText("Niveau suivant");
    await expect(page.getByTestId("game-next-level-link")).toHaveAttribute("href", `/fr/game/${afterIt}?from=other_level`);
    await expect(next).toContainText(LEVEL_TEASERS[afterIt!].fr);
  });
});

test.describe("P17 — level 4 on a phone, 390 wide", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("call, hand, report and December: never a sideways scroll; the phone and its pill in the action bar", async ({ page }) => {
    await page.goto(REFERRAL_PATH.en);
    expect(await horizontalOverflow(page)).toBe(0);
    await hangUp(page);
    expect(await horizontalOverflow(page)).toBe(0);
    await expect(page.getByTestId("game-actionbar")).toContainText("0 messages sent in Thomas's name");
    await pickAndRun(page, PATH_C[0]!);
    expect(await horizontalOverflow(page)).toBe(0);

    // The longest the pill gets: both messages ticked, 856 sent in Thomas's name, and the sentence that says so beside it.
    await pickUpCall(page);
    await hangUp(page);
    await tick(page, PATH_C[1]!);
    await expect(page.getByTestId("game-sent")).toHaveAttribute("data-alert", "true");
    await expect(page.getByTestId("game-actionbar")).toContainText("856 messages sent in Thomas's name");
    expect(await horizontalOverflow(page)).toBe(0);

    await seedGame(page, playPath(PATH_C).at(-1)!, REFERRAL_PATH.en, "referral");
    await acceptResume(page);
    await expect(page.getByTestId("game-ending")).toBeVisible();
    expect(await horizontalOverflow(page)).toBe(0);
  });
});

test.describe("P21 — level 4's December passes axe", () => {
  test("a settled year, in French", async ({ page }) => {
    await seedGame(page, playPath(PATH_C).at(-1)!, REFERRAL_PATH.fr, "referral");
    await acceptResume(page);
    await expect(page.getByTestId("game-ending")).toBeVisible();
    expect(await axeSeriousOrCritical(page)).toEqual([]);
  });

  test("a won year, in English", async ({ page }) => {
    await seedGame(page, playPath(PATH_A).at(-1)!, REFERRAL_PATH.en, "referral");
    await acceptResume(page);
    await expect(page.getByTestId("game-ending")).toBeVisible();
    expect(await axeSeriousOrCritical(page)).toEqual([]);
  });
});
