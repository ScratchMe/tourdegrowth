import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test, trackedEvents } from "./helpers";

/**
 * The compact header — design system extension 08 (design/ds-extension-08-
 * return/, ported 2026-10-02). In a landscape window, once the page has
 * scrolled, the header folds into one line of 48px over its space's colour
 * slimmed to a stripe: 54px painted instead of 118, 50 instead of 74 without
 * a band. Its box never changes height; only layers inside it move.
 *
 * What only a browser can say is here: the painted height in both states and
 * both ways, that nothing under it moves, that the state does not feed back
 * into the scroll, the keyboard, what sticks under it, a phone held upright
 * (unchanged), without JavaScript (today's header), reduced motion
 * (instant), the targets and the contrast of the compact line, and that the
 * compact race's clicks count apart. The motion's values are the return's
 * MOTION.md and live in SiteHeader.module.css.
 *
 * Non-vacuity (2026-10-02): with `SiteHeaderCompactor` taken out of
 * SiteHeader, every test that expects a compact state fails on its first
 * painted height (118, never 54) and the no-script test still passes —
 * the line between them is the script. With the globals.css focus rule
 * removed, the keyboard test fails on the scroll position (the Tab into the
 * header scrolls the page back up).
 */

const header = (page: Page) => page.locator("header[data-site-header]");

/** The lowest point the header paints: its glass, its edge, and its band while the band is shown. */
function painted(page: Page): Promise<number> {
  return page.evaluate(() => {
    const hd = document.querySelector("header[data-site-header]")!;
    const glass = hd.querySelector("[data-header-glass]")!.getBoundingClientRect().bottom;
    const edge = hd.querySelector("[data-header-edge]")!.getBoundingClientRect().bottom;
    const band = hd.querySelector<HTMLElement>("[data-testid=space-band]");
    const shown = band?.checkVisibility({ visibilityProperty: true }) ? band.getBoundingClientRect().bottom : 0;
    return Math.round(Math.max(glass, edge, shown));
  });
}

function stickyOffset(page: Page): Promise<number> {
  return page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sticky-offset")));
}

/** Every finite animation and transition of the page, finished. */
async function settle(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() =>
            Promise.all(
              document
                .getAnimations()
                .filter((a) => a.effect?.getComputedTiming().endTime !== Infinity)
                .map((a) => a.finished.catch(() => undefined)),
            ).then(() => resolve()),
          ),
        ),
      ),
  );
}

async function scrollTo(page: Page, y: number): Promise<void> {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(y);
}

/** Lets a click be counted without leaving the page (as home-strip-doors.spec.ts does). */
async function holdNavigation(page: Page): Promise<void> {
  await page.evaluate(() => document.addEventListener("click", (e) => e.preventDefault(), { capture: true, once: true }));
}

test.describe("the compact header, on a laptop (1280 × 720)", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  for (const [locale, current] of [
    ["fr", "Diagnostic"],
    ["en", "Check-up"],
  ] as const) {
    test(`${locale}: the landing's header folds into one line once the page scrolls, and unfolds at the top`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(header(page)).toHaveAttribute("data-compact", "false");
      expect(await painted(page)).toBe(118);
      expect(await stickyOffset(page)).toBe(118);
      const race = header(page).locator('[data-race="compact"]');
      await expect(race).toBeHidden();

      await scrollTo(page, 700);
      await expect(header(page)).toHaveAttribute("data-compact", "true");
      await settle(page);
      expect(await painted(page)).toBe(54);
      expect(await stickyOffset(page)).toBe(54);

      // Where you are: the race, this leg filled with its short name; the band folded away.
      await expect(race).toBeVisible();
      await expect(race.locator('[aria-current="page"]')).toContainText(current);
      await expect(race.locator("[data-stop]")).toHaveCount(3);
      await expect(page.getByTestId("space-band")).toBeHidden();
      // The page keeps its controls: the language switch and the primary (A15.15); the two quiet links leave.
      await expect(header(page).getByRole("group")).toBeVisible();
      await expect(header(page).locator('a[href="/quiz"]')).toBeVisible();
      for (const quiet of await header(page).locator('[data-header-compact="leave"]').all()) await expect(quiet).toBeHidden();
      // The compact race's links are out of the Tab order.
      for (const link of await race.locator("a").all()) await expect(link).toHaveAttribute("tabindex", "-1");

      await scrollTo(page, 0);
      await expect(header(page)).toHaveAttribute("data-compact", "false");
      await settle(page);
      expect(await painted(page)).toBe(118);
      await expect(page.getByTestId("space-band")).toBeVisible();
      await expect(race).toBeHidden();
    });
  }

  test("a page without a band keeps its dashed rule, under a 50px line", async ({ page }) => {
    await page.goto("/fr/glossary/cac");
    expect(await stickyOffset(page)).toBe(74);
    await scrollTo(page, 700);
    await expect(header(page)).toHaveAttribute("data-compact", "true");
    await settle(page);
    expect(await painted(page)).toBe(50);
    expect(await stickyOffset(page)).toBe(50);
    await expect(header(page).locator('[data-race="compact"]')).toHaveCount(0);
  });

  test("nothing under the header moves, and the state does not feed back into the scroll", async ({ page }) => {
    await page.goto("/fr");
    const before = await page.evaluate(() => ({
      box: document.querySelector("header[data-site-header]")!.getBoundingClientRect().height,
      page: document.documentElement.scrollHeight,
    }));
    // One pixel: the very threshold. A header that shortened the page would pull the scroll back across it.
    await scrollTo(page, 1);
    await expect(header(page)).toHaveAttribute("data-compact", "true");
    await settle(page);
    const after = await page.evaluate(() => ({
      box: document.querySelector("header[data-site-header]")!.getBoundingClientRect().height,
      page: document.documentElement.scrollHeight,
      y: window.scrollY,
    }));
    expect(after.box).toBe(before.box);
    expect(after.page).toBe(before.page);
    expect(after.y).toBe(1);
    await expect(header(page)).toHaveAttribute("data-compact", "true");
  });

  test("keyboard: a Tab into the compact header opens it full, and the page stays where it was", async ({ page }) => {
    await page.goto("/fr");
    await scrollTo(page, 800);
    await expect(header(page)).toHaveAttribute("data-compact", "true");
    await settle(page);
    // The skip link first, as always; then the wordmark, in the header.
    await page.keyboard.press("Tab");
    await expect(page.locator(".tdg-skip")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(header(page).locator("a").first()).toBeFocused();
    await expect(header(page)).toHaveAttribute("data-compact", "false");
    expect(await page.evaluate(() => Math.round(window.scrollY))).toBe(800);
    await settle(page);
    expect(await painted(page)).toBe(118);
  });

  test("nothing hidden in the compact header can take focus", async ({ page }) => {
    await page.goto("/fr");
    await scrollTo(page, 700);
    await settle(page);
    const focusableButHidden = await page.evaluate(() => {
      const hd = document.querySelector("header[data-site-header]")!;
      return [...hd.querySelectorAll<HTMLElement>("a[href], button")]
        .filter((el) => el.tabIndex >= 0 && !el.checkVisibility({ visibilityProperty: true, opacityProperty: true }))
        .filter((el) => {
          el.focus();
          const took = document.activeElement === el;
          el.blur();
          return took;
        })
        .map((el) => el.textContent?.trim());
    });
    expect(focusableButHidden).toEqual([]);
  });

  test("the language switch's two targets are 44 × 44 in the compact line (Segmented sm, extension 08)", async ({ page }) => {
    await page.goto("/fr");
    await scrollTo(page, 700);
    await settle(page);
    const extents = await page.evaluate(() => {
      const options = [...document.querySelectorAll<HTMLElement>('header[data-site-header] [role="group"] a')];
      return options.map((el) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const hits = (dx: number, dy: number) => {
          const hit = document.elementFromPoint(cx + dx, cy + dy);
          return hit === el || (hit !== null && el.contains(hit));
        };
        let w = 0;
        let h = 0;
        for (let d = -40; d <= 40; d += 0.5) {
          if (hits(d, 0)) w += 0.5;
          if (hits(0, d)) h += 0.5;
        }
        return { w, h };
      });
    });
    expect(extents).toHaveLength(2);
    for (const { w, h } of extents) {
      expect(w).toBeGreaterThanOrEqual(44);
      expect(h).toBeGreaterThanOrEqual(44);
    }
  });

  test("what sticks under the header follows it: the game level's side column", async ({ page }) => {
    await page.goto("/fr/game/retention");
    const sideTop = () =>
      page.evaluate(() => {
        const island = document.querySelector('[data-testid="game-island"]')!;
        const side = [...island.querySelectorAll<HTMLElement>("*")].find((el) => getComputedStyle(el).position === "sticky")!;
        return parseFloat(getComputedStyle(side).top);
      });
    // --sticky-offset + 22px: under the full header, then under the compact line.
    expect(await sideTop()).toBe(118 + 22);
    await scrollTo(page, 600);
    await settle(page);
    expect(await sideTop()).toBe(54 + 22);
  });

  test("the compact race's clicks count apart, as space_band_compact (Antoine, 2026-10-02)", async ({ page }) => {
    await page.goto("/fr");
    await scrollTo(page, 700);
    await settle(page);
    const pill = header(page).locator('[data-race="compact"] [data-stop="game"] a');
    await expect(pill).toHaveAttribute("href", "/fr/game");
    await holdNavigation(page);
    await pill.click();
    await expect.poll(() => trackedEvents(page)).toContain("game_entry_clicked/space_band_compact");
    expect(await trackedEvents(page)).not.toContain("game_entry_clicked/space_band");
  });

  for (const path of ["/fr", "/r/sample", "/fr/glossary/cac", "/en/game"]) {
    test(`${path}: the compact line has no serious accessibility violation`, async ({ page }) => {
      await page.goto(path);
      await scrollTo(page, 700);
      await expect(header(page)).toHaveAttribute("data-compact", "true");
      await settle(page);
      // The page ground is a gradient axe cannot measure over (accessibility.spec.ts says why).
      await page.addStyleTag({ content: "body, [data-world] { background-image: none !important; }" });
      const { violations } = await new AxeBuilder({ page })
        .include("header[data-site-header]")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const serious = violations
        .filter((v) => v.impact === "serious" || v.impact === "critical")
        .flatMap((v) => v.nodes.filter((n) => !/^<span[^>]*>GROWTH<\/span>$/.test(n.html.trim())).map((n) => `${v.id}: ${n.target.join(" ")}`));
      expect(serious).toEqual([]);
    });
  }
});

test.describe("the compact header, without its motion (reduced motion)", () => {
  test.use({ viewport: { width: 1280, height: 720 }, contextOptions: { reducedMotion: "reduce" } });

  test("compacts all the same, at once", async ({ page }) => {
    await page.goto("/fr");
    await scrollTo(page, 700);
    await expect(header(page)).toHaveAttribute("data-compact", "true");
    const duration = await page.locator("[data-header-glass]").evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(duration).toBe("0s");
    expect(await painted(page)).toBe(54);
  });
});

test.describe("the compact header, without JavaScript", () => {
  test.use({ viewport: { width: 1280, height: 720 }, javaScriptEnabled: false });

  test("is today's header, however far the page has scrolled", async ({ page }) => {
    await page.goto("/fr");
    await page.mouse.wheel(0, 700);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
    await expect(header(page)).toHaveAttribute("data-compact", "false");
    expect(await painted(page)).toBe(118);
    expect(await stickyOffset(page)).toBe(118);
    await expect(page.getByTestId("space-band")).toBeVisible();
  });
});

test.describe("a phone held upright keeps today's header (390 × 844)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const path of ["/fr", "/en", "/r/sample", "/fr/glossary/cac"]) {
    test(`${path}: scrolled, the header is as it was`, async ({ page }) => {
      await page.goto(path);
      const full = await painted(page);
      const offset = await stickyOffset(page);
      await scrollTo(page, 700);
      await settle(page);
      expect(await painted(page)).toBe(full);
      expect(await stickyOffset(page)).toBe(offset);
      await expect(header(page).locator('[data-race="compact"]')).toHaveCount(path.includes("glossary") ? 0 : 1);
      await expect(header(page).locator('[data-race="compact"]')).toBeHidden();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    });
  }
});

test.describe("a phone held sideways (844 × 390)", () => {
  test.use({ viewport: { width: 844, height: 390 } });

  for (const path of ["/fr", "/en", "/r/sample"]) {
    test(`${path}: one line, nothing scrolls sideways, the race keeps clear of the controls`, async ({ page }) => {
      await page.goto(path);
      await scrollTo(page, 700);
      await expect(header(page)).toHaveAttribute("data-compact", "true");
      await settle(page);
      expect(await painted(page)).toBe(54);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(844);
      const gap = await page.evaluate(() => {
        const hd = document.querySelector("header[data-site-header]")!;
        const race = hd.querySelector('[data-race="compact"]')!.getBoundingClientRect();
        const kept = [...hd.querySelectorAll<HTMLElement>('[data-header-row] a, [data-header-row] [role="group"]')]
          .filter((el) => !el.closest('[data-race]') && !el.closest("[data-header-compact]") && el.checkVisibility({ visibilityProperty: true }))
          .map((el) => el.getBoundingClientRect())
          .filter((r) => r.left > race.left);
        return Math.min(...kept.map((r) => r.left)) - race.right;
      });
      expect(gap).toBeGreaterThanOrEqual(16);
    });
  }
});
