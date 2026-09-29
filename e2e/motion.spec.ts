import type { Page } from "@playwright/test";
import { expect, test } from "./helpers";

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
});

test.describe("with reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("the stamp and the pulse stay off", async ({ page }) => {
    await page.goto("/r/sample?lang=en");
    await expect(page.locator("main")).toBeVisible();
    expect(await animationNames(page)).not.toContainEqual(expect.stringMatching(/(stamp|pulse)$/));
  });
});
