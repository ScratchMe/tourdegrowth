import type { Page } from "@playwright/test";
import { expect, test } from "./helpers";
import { LEVEL_PATH, hangUp, pickAndRun } from "./game-helpers";
import { PATH_A } from "../src/lib/game/__tests__/paths";

/**
 * Design audit 2026-09-27, S-1 — the brand's one motion actually plays.
 *
 * The stamp (score numeral) and the pulse (quiz progress segment) named
 * global keyframes from inside CSS Modules, whose scoping renamed the
 * reference to a keyframe that existed nowhere. A browser creates no
 * animation for an unknown name, so nothing moved, from the DS v2 migration
 * (#14) to 2026-09-28, and every spec stayed green: none of them asked.
 * src/__tests__/motion-keyframes.test.ts guards the source; this reads the
 * compiled result in the browser, which is where the bug lived.
 *
 * `document.getAnimations()` keeps an animation with `fill-mode: both` after
 * it ends, so the reading does not race the 260 ms stamp. Checked beforehand
 * in Chromium: an element whose `animation-name` has no matching @keyframes
 * returns zero animations, one whose name resolves returns one. So a return
 * of the bug empties the list, and these specs fail.
 *
 * Non-vacuity, checked by sabotage on 2026-09-28 (TESTING.md §1.1): a build
 * with ScoreDisplay back to `animation: tdg-stamp …` fails exactly the stamp
 * spec; the pulse spec (not sabotaged) and the reduced-motion one pass.
 */

async function animationNames(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    document.getAnimations().map((a) => (a as CSSAnimation).animationName ?? ""),
  );
}

test.describe("with motion allowed", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("the result's score numeral lands with the stamp", async ({ page }) => {
    await page.goto("/r/sample?lang=en");
    await expect.poll(() => animationNames(page)).toContainEqual(expect.stringMatching(/stamp$/));
  });

  test("the quiz's current progress segment pulses", async ({ page }) => {
    await page.goto("/quiz");
    await expect.poll(() => animationNames(page)).toContainEqual(expect.stringMatching(/pulse$/));
  });

  /*
   * Design audit S-6 (2026-09-29): the call's picture is dimmed while the
   * phone rings, greyed when the year is lost, and the `filter` transition
   * that should fade it sat on the frame around it — whose filter never
   * changes — so picking up cut from dark to lit. `transitionrun` is read
   * rather than getAnimations(): it is recorded when the transition starts,
   * so a slow runner cannot miss a 250ms fade that is already over.
   * Non-vacuity (2026-09-29): on the build before the fix, the same steps
   * record only the ring's `box-shadow`, never `filter`.
   */
  test("picking up the CEO's call fades the picture in, not a cut", async ({ page }) => {
    test.skip(process.env.GAME_ENABLED !== "true", "GAME_ENABLED is not \"true\" for this run — the level page is closed.");
    await page.goto(LEVEL_PATH.en);
    await hangUp(page);
    await pickAndRun(page, PATH_A[0]!);
    await page.getByTestId("game-report-next").click();
    const call = page.getByTestId("game-call");
    await expect(call).toHaveAttribute("data-state", "ringing");
    await call.evaluate((el) => {
      const runs: string[] = [];
      (window as unknown as { __runs: string[] }).__runs = runs;
      el.addEventListener("transitionrun", (e) => runs.push(`${(e.target as Element).tagName.toLowerCase()}:${(e as TransitionEvent).propertyName}`));
    });
    await page.getByTestId("game-pickup").click();
    await expect(call).toHaveAttribute("data-state", "open");
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __runs: string[] }).__runs))
      .toContain("svg:filter");
  });
});

test.describe("with reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("the stamp and the pulse stay off", async ({ page }) => {
    await page.goto("/r/sample?lang=en");
    await expect(page.locator("main")).toBeVisible();
    expect(await animationNames(page)).not.toContainEqual(expect.stringMatching(/(stamp|pulse)$/));
  });
});
