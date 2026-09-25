import type { Page } from "@playwright/test";
import { expect, test, trackedEvents } from "./helpers";
import {
  LEVEL_PATH,
  acceptResume,
  openDecember,
  pickUpCall,
  playQuarter,
  seedBeforeLastQuarter,
  seedGame,
  spokenUtterances,
  stubSpeech,
  type SpokenUtterance,
} from "./game-helpers";
import { ENDING_PATHS, PATH_A, PATH_C, playPath } from "../src/lib/game/__tests__/paths";
import { GAME_COLLECTION_KEY } from "../src/lib/game/storage-keys";
import type { EndingId } from "../src/lib/game/types";

/**
 * How a year ends — GAME-BRIEF §5.11 and §7.2 P7-P9, P12, P14, P20, and the
 * catalogue's first-open event (plan §3.8).
 *
 * Each of the seven endings is reached through the interface: the year is
 * seeded up to its LAST quarter (states played through the reducer, never
 * written by hand — `paths.ts`), and that quarter, the one that decides the
 * ending, is played with clicks. Playing four quarters seven times over
 * would triple the suite's time to prove nothing the two full years of
 * game-level.spec.ts do not already prove.
 *
 * The game must be OPEN for this run (`GAME_ENABLED: "true"`, as in CI).
 *
 * Non-vacuity, measured: without the island's once-only guard on
 * `game_catalogue_open`, the catalogue spec fails on its second opening. P20
 * opens a single sheet and so passes either way — it guards the ORDER, not
 * the once-only rule.
 */
test.skip(process.env.GAME_ENABLED !== "true", "GAME_ENABLED is not \"true\" for this run — the level page is closed.");
test.use({ contextOptions: { reducedMotion: "reduce" } });

/** GAME-BRIEF §5.11, the endings table, in the language each case is played in. */
const ENDINGS: readonly {
  id: EndingId;
  locale: "en" | "fr";
  eyebrow: string;
  title: string;
  win: boolean;
  fired: boolean;
}[] = [
  { id: "applause", locale: "fr", eyebrow: "Décembre · applaudissements", title: "Tu as tenu. Et ça a marché.", win: true, fired: false },
  { id: "cleanMiss", locale: "en", eyebrow: "December · standing your ground", title: "Not 4% yet. But everything is clean.", win: true, fired: false },
  { id: "fine", locale: "fr", eyebrow: "Décembre · la révélation", title: "Voici ce que tu as fait.", win: false, fired: false },
  { id: "repentant", locale: "en", eyebrow: "December · the repentant", title: "You tried, then you cleaned up.", win: false, fired: false },
  { id: "labyrinth", locale: "fr", eyebrow: "Décembre · la révélation", title: "Le labyrinthe tient. Regarde ce qu'il coûte.", win: false, fired: false },
  { id: "firedClean", locale: "en", eyebrow: "Fired · but clean", title: "Fired. Without a single trick.", win: false, fired: true },
  { id: "firedDark", locale: "fr", eyebrow: "Licencié", title: "Viré, et pour rien.", win: false, fired: true },
];

async function storedEnding(page: Page): Promise<string | null> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return (JSON.parse(raw) as { endings?: { retention?: { id?: string } } }).endings?.retention?.id ?? null;
  }, GAME_COLLECTION_KEY);
}

test.describe("the seven endings, each decided by a quarter played through the UI", () => {
  for (const ending of ENDINGS) {
    test(`${ending.id} (${ending.locale})`, async ({ page }) => {
      const path = ENDING_PATHS[ending.id];
      await seedBeforeLastQuarter(page, path, ending.locale);
      await playQuarter(page, path.at(-1)!);
      // The last report is read BEFORE December: nothing of the reveal yet.
      await expect(page.getByTestId("game-dash-trust")).toHaveAttribute("data-state", "hidden");

      await openDecember(page);
      const hero = page.getByTestId("game-ending");
      await expect(hero).toContainText(ending.eyebrow);
      await expect(hero).toContainText(ending.title);
      await expect(hero).toHaveAttribute("data-win", String(ending.win));
      await expect(page.getByTestId("game-dash-trust")).toHaveAttribute("data-state", "known");
      // P9 — a fired PM gets the cold, finished call; the others the firm one.
      await expect(page.getByTestId("game-call")).toHaveAttribute("data-state", "ended");
      await expect(page.getByTestId("game-call")).toHaveAttribute("data-mood", ending.fired ? "cold" : "firm");
      await expect(page.getByTestId("game-hand")).toHaveCount(0);
      // The heading takes the focus (plan §3.5).
      await expect(hero.getByRole("heading", { level: 2 })).toBeFocused();

      const events = await trackedEvents(page);
      expect(events.filter((e) => e.startsWith("game_ending/"))).toEqual([`game_ending/${ending.id}`]);
      // The collection remembers the ending, for the hub (plan §3.7).
      await expect.poll(() => storedEnding(page)).toBe(ending.id);
    });
  }
});

test.describe("the catalogue", () => {
  test("the entries open by default are not counted; the player's first opening is, once", async ({ page }) => {
    await seedGame(page, playPath(PATH_C).at(-1)!, LEVEL_PATH.en);
    await acceptResume(page);
    const catalogue = page.getByTestId("game-catalogue");
    await expect(catalogue).toBeVisible();
    // The six tricks played are printed open — and that is not a reader's choice.
    await expect(catalogue.locator("[data-group='used'] [data-testid^='game-pattern-']")).toHaveCount(6);
    expect(await trackedEvents(page)).not.toContain("game_catalogue_open");

    const folded = catalogue.locator("[data-group='refused'] details, [data-group='unseen'] details");
    expect(await folded.count()).toBeGreaterThanOrEqual(2);
    await folded.nth(0).locator("summary").click();
    await expect(folded.nth(0)).toHaveAttribute("open", "");
    await expect.poll(async () => (await trackedEvents(page)).filter((e) => e === "game_catalogue_open")).toHaveLength(1);

    await folded.nth(1).locator("summary").click();
    await expect(folded.nth(1)).toHaveAttribute("open", "");
    // Closing and reopening the first, too: still one.
    await folded.nth(0).locator("summary").click();
    await folded.nth(0).locator("summary").click();
    await expect(folded.nth(0)).toHaveAttribute("open", "");
    expect((await trackedEvents(page)).filter((e) => e === "game_catalogue_open")).toHaveLength(1);
  });
});

test.describe("P14 — sharing the year", () => {
  test.describe("with the clipboard", () => {
    test.use({ permissions: ["clipboard-read", "clipboard-write"] });

    test("copies the year's line with the address of the page in its language, and says so", async ({ page, baseURL }) => {
      await seedGame(page, playPath(PATH_A).at(-1)!, LEVEL_PATH.en);
      await acceptResume(page);
      await page.getByTestId("game-share").click();
      await expect(page.getByTestId("game-copied")).toHaveText("Copied.");
      await expect(page.getByTestId("game-share-fallback")).toHaveCount(0);
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(copied).toContain("A year at Flixo: You held out. And it worked.");
      expect(copied).toContain("trust at 83");
      expect(copied).toContain("Would you hold out?");
      // The page's own address, in the current language, nothing appended.
      expect(copied.trim().endsWith(`${baseURL}${LEVEL_PATH.en}`)).toBe(true);
      await expect.poll(() => trackedEvents(page)).toContain("game_share");
    });
  });

  test.describe("when the clipboard refuses", () => {
    test("prints the line next to the button instead, and claims no copy", async ({ page }) => {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: { writeText: () => Promise.reject(new DOMException("denied", "NotAllowedError")) },
        });
      });
      await seedGame(page, playPath(PATH_A).at(-1)!, LEVEL_PATH.fr);
      await acceptResume(page);
      await page.getByTestId("game-share").click();
      const fallback = page.getByTestId("game-share-fallback");
      await expect(fallback).toBeVisible();
      await expect(fallback).toContainText("Une année chez Flixo : Tu as tenu. Et ça a marché.");
      await expect(page.getByTestId("game-copied")).toHaveText("");
      // The click is what is counted (`game_share`), whatever the clipboard did.
      await expect.poll(() => trackedEvents(page)).toContain("game_share");
    });
  });
});

test.describe("P20 — the analytics of path A, in order", () => {
  test.slow();

  test("from the first call to the replay, each event once, with its detail", async ({ page }) => {
    await stubSpeech(page);
    await page.goto(LEVEL_PATH.en);

    for (let q = 0; q < PATH_A.length; q++) {
      if (q === 0 || q === 1) {
        // P12 — « Listen » speaks the message in the page's language, with
        // the mood's settings (§5.10): firm on the first call, angry on the
        // second after a missed target. Hanging up silences him, so the
        // utterance is awaited first.
        await page.getByTestId("game-listen").click();
        await expect.poll(async () => (await spokenUtterances(page)).length).toBe(q + 1);
      }
      await playQuarter(page, PATH_A[q]!);
      if (q < PATH_A.length - 1) await pickUpCall(page);
    }
    await openDecember(page);
    await page.getByTestId("game-catalogue").locator("[data-group='refused'] details, [data-group='unseen'] details").first().locator("summary").click();
    await page.getByTestId("game-share").click();
    await page.getByTestId("game-replay").click();
    await expect(page.getByTestId("game-call")).toHaveAttribute("data-state", "open");

    await expect
      .poll(() => trackedEvents(page))
      .toEqual([
        "game_started/retention/direct",
        "game_voice/firm",
        "game_hangup/1",
        "game_quarter/1",
        "game_voice/angry",
        "game_hangup/2",
        "game_order/refused",
        "game_quarter/2",
        "game_hangup/3",
        "game_order/refused",
        "game_quarter/3",
        "game_hangup/4",
        "game_order/refused",
        "game_quarter/4",
        "game_ending/applause",
        "game_catalogue_open",
        "game_share",
        "game_replay",
      ]);

    const spoken = await spokenUtterances(page);
    expect(spoken).toHaveLength(2);
    // The engine stores rate and pitch as 32-bit floats: compared to 5 places.
    const [firm, angry] = spoken as [SpokenUtterance, SpokenUtterance];
    expect([firm.lang, angry.lang]).toEqual(["en-US", "en-US"]);
    expect(firm.rate).toBeCloseTo(1.02, 5);
    expect(firm.pitch).toBeCloseTo(0.78, 5);
    expect(angry.rate).toBeCloseTo(1.18, 5);
    expect(angry.pitch).toBeCloseTo(0.62, 5);
    expect(angry.volume).toBe(1);
  });
});

test.describe("P12 — the voice is an extra", () => {
  test("French is spoken as fr-FR", async ({ page }) => {
    await stubSpeech(page);
    await page.goto(LEVEL_PATH.fr);
    await page.getByTestId("game-listen").click();
    await expect.poll(() => spokenUtterances(page)).toHaveLength(1);
    expect((await spokenUtterances(page))[0]!.lang).toBe("fr-FR");
  });

  test("without speech synthesis, there is no « Écouter » at all", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as Record<string, unknown>;
      delete w.speechSynthesis;
      delete w.SpeechSynthesisUtterance;
    });
    await page.goto(LEVEL_PATH.fr);
    await expect(page.getByTestId("game-hangup")).toBeVisible();
    // Absent from the prerendered page AND after mount: poll a little past hydration.
    expect(await page.evaluate(() => "speechSynthesis" in window)).toBe(false);
    await expect(page.getByTestId("game-listen")).toHaveCount(0);
  });
});
