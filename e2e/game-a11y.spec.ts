import type { Page } from "@playwright/test";
import { expect, test } from "./helpers";
import {
  LEVEL_PATH,
  acceptResume,
  axeSeriousOrCritical,
  hangUp,
  playQuarter,
  seedGame,
} from "./game-helpers";
import { PATH_A, PATH_C, playPath } from "../src/lib/game/__tests__/paths";
import { MONTH_STEP_MS } from "../src/lib/game/ui-timing";

/**
 * The level without a mouse, and axe at every phase — GAME-BRIEF §9.7,
 * plan §3.5 and §6.2, P16 and P21.
 *
 * axe sees what is on screen. The level page's first paint is the only phase
 * a URL reaches, so accessibility.spec.ts can only scan that one; the others
 * — the hand, the months running, a report, the ringing phone, December —
 * are reached here by playing, then scanned where they stand.
 *
 * The keyboard spec asserts where the focus LANDS after each gesture, not
 * which attributes are set: a correct tabindex on every control says nothing
 * of a gesture that removes the focused button and drops the reader back on
 * <body> (R-19).
 *
 * The game must be OPEN for this run (`GAME_ENABLED: "true"`, as in CI).
 */
test.skip(process.env.GAME_ENABLED !== "true", "GAME_ENABLED is not \"true\" for this run — the level page is closed.");

const activeTestId = (page: Page) =>
  page.evaluate(() => document.activeElement?.closest("[data-testid]")?.getAttribute("data-testid") ?? null);

/**
 * Presses Tab until the element carrying `testId` has the focus. Bounded, and
 * it fails naming where the focus went instead — an unreachable control is
 * exactly what this is here to find.
 */
async function tabTo(page: Page, testId: string, max = 80): Promise<void> {
  const seen: (string | null)[] = [];
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab");
    const now = await page.evaluate(() => document.activeElement?.getAttribute("data-testid") ?? null);
    if (now === testId) return;
    seen.push(now);
  }
  throw new Error(`${testId} was never reached by Tab; focus went through ${seen.filter(Boolean).join(", ")}`);
}

test.describe("P16 — one quarter with the keyboard alone", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("Tab, Space, Enter: every gesture lands the focus where the plan says", async ({ page }) => {
    await page.goto(LEVEL_PATH.en);
    await expect(page.getByTestId("game-call")).toHaveAttribute("data-state", "open");
    // Nothing is focused on arrival (R-19: stealing focus on load is a defect).
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);

    await tabTo(page, "game-hangup");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("game-desk")).toHaveAttribute("data-phase", "hand");
    await expect(page.locator("#game-hand-title")).toBeFocused();

    for (const card of PATH_A[0]!) {
      await tabTo(page, `game-card-${card}`);
      // A tabbed card shows where the keyboard is (§9.7: focus visible).
      const ring = await page.getByTestId(`game-card-${card}`).evaluate((el) => {
        const cs = getComputedStyle(el);
        return { style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) };
      });
      expect(ring.style).not.toBe("none");
      expect(ring.width).toBeGreaterThan(0);
      await page.keyboard.press("Space");
      await expect(page.getByTestId(`game-card-${card}`)).toHaveAttribute("aria-pressed", "true");
      // The card's own state says what happened; the focus stays on it.
      await expect(page.getByTestId(`game-card-${card}`)).toBeFocused();
    }

    await tabTo(page, "game-run");
    await page.keyboard.press("Enter");
    const report = page.getByTestId("game-report-1");
    await expect(report).toBeVisible();
    await expect(report.locator("h2").first()).toBeFocused();

    await tabTo(page, "game-report-next");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("game-desk")).toHaveAttribute("data-phase", "ringing");
    // The ringing call is a region, focused so it is announced and in view.
    await expect(page.getByTestId("game-call")).toBeFocused();

    await tabTo(page, "game-pickup");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("game-call")).toHaveAttribute("data-state", "open");
    await expect(page.getByTestId("game-call")).toBeFocused();
    expect(await activeTestId(page)).toBe("game-call");
  });
});

/**
 * Holds every `MONTH_STEP_MS` timer the page schedules, so the months stop on
 * their first frame and a scan of `running` does not race the report. Only
 * that one delay: axe's own timers, and every other, run as usual.
 */
async function holdTheMonths(page: Page): Promise<void> {
  await page.addInitScript((step) => {
    const real = window.setTimeout.bind(window);
    window.setTimeout = ((fn: TimerHandler, delay?: number, ...args: unknown[]) =>
      delay === step ? 0 : real(fn, delay, ...args)) as typeof window.setTimeout;
  }, MONTH_STEP_MS);
}

test.describe("P21 — axe at every phase of the level", () => {
  for (const [name, viewport] of [
    ["desktop", { width: 1280, height: 900 }],
    ["phone", { width: 390, height: 844 }],
  ] as const) {
    test.describe(name, () => {
      test.use({ viewport, contextOptions: { reducedMotion: "reduce" } });

      test("the hub", async ({ page }) => {
        await page.goto("/fr/game");
        await expect(page.getByTestId("game-hub-zones")).toBeVisible();
        expect(await axeSeriousOrCritical(page)).toEqual([]);
      });

      test("the first screen, then the hand with two cards ticked", async ({ page }) => {
        await page.goto(LEVEL_PATH.fr);
        await expect(page.getByTestId("game-call")).toHaveAttribute("data-state", "open");
        expect(await axeSeriousOrCritical(page)).toEqual([]);
        await hangUp(page);
        for (const card of PATH_C[0]!) await page.getByTestId(`game-card-${card}`).click();
        await expect(page.getByTestId("game-actionbar")).toBeVisible();
        expect(await axeSeriousOrCritical(page)).toEqual([]);
      });

      test("a report, then the ringing phone", async ({ page }) => {
        await page.goto(LEVEL_PATH.en);
        await playQuarter(page, PATH_A[0]!);
        expect(await axeSeriousOrCritical(page)).toEqual([]);
        await page.getByTestId("game-report-next").click();
        await expect(page.getByTestId("game-desk")).toHaveAttribute("data-phase", "ringing");
        expect(await axeSeriousOrCritical(page)).toEqual([]);
      });

      test("December after a year of tricks (the red ending, the catalogue open)", async ({ page }) => {
        await seedGame(page, playPath(PATH_C).at(-1)!, LEVEL_PATH.fr);
        await acceptResume(page);
        await expect(page.getByTestId("game-ending")).toHaveAttribute("data-win", "false");
        await page.getByTestId("game-catalogue").locator("[data-group='refused'] details").first().locator("summary").click();
        expect(await axeSeriousOrCritical(page)).toEqual([]);
      });
    });

    test.describe(`${name}, with motion on`, () => {
      test.use({ viewport, contextOptions: { reducedMotion: "no-preference" } });

      test("the months running", async ({ page }) => {
        await holdTheMonths(page);
        await page.goto(LEVEL_PATH.en);
        await hangUp(page);
        for (const card of PATH_A[0]!) await page.getByTestId(`game-card-${card}`).click();
        await page.getByTestId("game-run").click();
        await expect(page.getByTestId("game-desk")).toHaveAttribute("data-phase", "running");
        expect(await axeSeriousOrCritical(page)).toEqual([]);
        // Still running: the scan saw the phase it was named for.
        await expect(page.getByTestId("game-desk")).toHaveAttribute("data-phase", "running");
      });
    });
  }
});
