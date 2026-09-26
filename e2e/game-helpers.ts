import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect } from "./helpers";
import { playPath, type Path } from "../src/lib/game/__tests__/paths";
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

/** « Raccrocher et choisir tes chantiers »: the call hangs up and the hand opens. */
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
  await pickAndRun(page, picks);
}

/** From the open hand: tick the two cards, « Lancer », and wait for the quarter's report. */
export async function pickAndRun(page: Page, picks: readonly [RetentionCardId, RetentionCardId]): Promise<void> {
  for (const card of picks) {
    const button = page.getByTestId(`game-card-${card}`);
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
  }
  const q = await page.getByTestId("game-desk").evaluate(() => document.querySelectorAll("[data-testid^='game-journal-']").length + 1);
  await page.getByTestId("game-run").click();
  await expect(page.getByTestId(`game-report-${q}`)).toBeVisible({ timeout: 10_000 });
}

/** « Reprendre » on the prompt a seeded year with a quarter played opens on. */
export async function acceptResume(page: Page): Promise<void> {
  await page.getByTestId("game-resume-accept").click();
  await expect(page.getByTestId("game-resume")).toHaveCount(0);
}

/**
 * A whole year from the open first call: each quarter played through the UI,
 * the next call picked up in between. `onQuarter` runs on each quarter's
 * report, before the phone rings — where a spec reads what the quarter did.
 */
export async function playYear(page: Page, path: Path, onQuarter?: (q: number) => Promise<void>): Promise<void> {
  for (const [i, picks] of path.entries()) {
    await playQuarter(page, picks);
    await onQuarter?.(i + 1);
    if (i < path.length - 1) await pickUpCall(page);
  }
}

/**
 * The year of `path` seeded up to its LAST quarter, resumed, and that
 * quarter's call picked up — so a spec plays the quarter that decides the
 * ending through the UI without spending most of its time on the ones before
 * it. The seeded state is played through the reducer (`paths.ts`), never
 * written by hand.
 */
export async function seedBeforeLastQuarter(page: Page, path: Path, locale: keyof typeof LEVEL_PATH): Promise<void> {
  await seedGame(page, playPath(path).at(-2)!, LEVEL_PATH[locale]);
  await acceptResume(page);
  await expect(page.getByTestId(`game-report-${path.length - 1}`)).toBeVisible();
  await pickUpCall(page);
}

/** From the last quarter's report to December: « Voir le bilan de l'année ». */
export async function openDecember(page: Page): Promise<void> {
  await page.getByTestId("game-report-next").click();
  await expect(page.getByTestId("game-desk")).toHaveAttribute("data-phase", "december");
  await expect(page.getByTestId("game-ending")).toBeVisible();
}

/** How far the page scrolls sideways — 0 is the only right answer, at every phase and width. */
export async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

/**
 * Every value `data-phase` took on the desk from the moment the page loads,
 * in order. An init script, so it is in place before the island mounts and
 * catches a phase that lasts a single render — which is what tells reduced
 * motion (no `running` at all) apart from a fast animation.
 */
export async function recordPhases(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as { __tdgPhases: string[] };
    w.__tdgPhases = [];
    new MutationObserver((records) => {
      for (const r of records) {
        const el = r.target as Element;
        if (el.getAttribute("data-testid") === "game-desk") w.__tdgPhases.push(el.getAttribute("data-phase") ?? "");
      }
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ["data-phase"] });
  });
}

export async function recordedPhases(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as unknown as { __tdgPhases?: string[] }).__tdgPhases ?? []);
}

export interface SpokenUtterance {
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
}

/**
 * A speech engine to listen with, whatever the machine has. CI's Chromium
 * exposes `speechSynthesis` but may have no voice installed, so what
 * « Écouter » does would depend on the runner; this stand-in records what it
 * was asked to say, with which settings (GAME-BRIEF P12).
 *
 * It lists no voices on purpose: `utterance.voice` only accepts a real
 * `SpeechSynthesisVoice`, which a page cannot construct, and assigning a
 * look-alike throws inside the hook's promise — silently. With none listed,
 * the hook waits out its bound and speaks with the language tag alone, which
 * is the part the contract is about.
 */
export async function stubSpeech(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const spoken: { lang: string; rate: number; pitch: number; volume: number }[] = [];
    (window as unknown as { __tdgSpoken: typeof spoken }).__tdgSpoken = spoken;
    const synth = {
      speaking: false,
      getVoices: () => [],
      speak: (u: SpeechSynthesisUtterance) => {
        spoken.push({ lang: u.lang, rate: u.rate, pitch: u.pitch, volume: u.volume });
      },
      cancel: () => {},
      pause: () => {},
      resume: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    };
    Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true });
  });
}

export async function spokenUtterances(page: Page): Promise<SpokenUtterance[]> {
  return page.evaluate(() => (window as unknown as { __tdgSpoken?: SpokenUtterance[] }).__tdgSpoken ?? []);
}

/**
 * axe, serious and critical only, on the page as it stands.
 *
 * Both grounds are gradients (the page's and the night band's): axe files
 * text over a gradient as "incomplete", never as a violation. Flattened to
 * their base colour, it measures them (accessibility.spec.ts explains).
 */
export async function axeSeriousOrCritical(page: Page): Promise<string[]> {
  await page.addStyleTag({ content: "body, [data-world] { background-image: none !important; }" });
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .flatMap((v) =>
      v.nodes
        // The logotype's red GROWTH, exempt under WCAG 1.4.3 and matched on its
        // own markup, never on its colour pair (accessibility.spec.ts).
        .filter((n) => !(v.id === "color-contrast" && /^<span[^>]*>GROWTH<\/span>$/.test(n.html.trim())))
        .map((n) => `${v.id} on ${n.target.join(" ")}`),
    );
}
