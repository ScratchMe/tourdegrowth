import type { Page } from "@playwright/test";
import type { Locale } from "@/lib/i18n/locale";
import { SPACE_STRINGS } from "@/lib/i18n/space-strings";
import { tc } from "@/lib/i18n/translatable";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";

/**
 * The site header and its space band — design I + B, retained by Antoine on
 * 2026-09-28 (brand/SiteHeader, brand/SpaceBand).
 *
 * What is read here is what a reader meets, on the built site: which space
 * each page says it belongs to, what the race links to while a space is
 * closed (Antoine: the race stays whole, the closed legs greyed and marked
 * « bientôt », never a link), that the quiz's band has no exit, that the
 * header really sticks and really is frosted glass — the first build shipped
 * it WITHOUT the blur, because the compiler kept only the `-webkit-` form of
 * a property written twice, and nothing but the computed value says so.
 *
 * The expectations follow the build's flags the way CI sets them (the game
 * open, the engine closed): the band inlines them at build.
 */

const GAME_OPEN = process.env.GAME_ENABLED === "true";
const ENGINE_OPEN = process.env.ENGINE_ENABLED === "true";

const band = (page: Page) => page.getByTestId("space-band");

/**
 * `--sticky-offset` less the header's painted height, rounded up: 0 once the
 * header's script has measured it (compact-header.ts), positive while the
 * no-script stand-in (118, 74) is in force, never negative.
 */
function offsetGap(page: Page): Promise<number> {
  return page.evaluate(() => {
    const height = document.querySelector("header[data-site-header]")!.getBoundingClientRect().height;
    const offset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sticky-offset"));
    return offset - Math.ceil(height);
  });
}

/** Every kind of header: the band, the quiz's row (no 44px control in it), a reading page's plain one. */
const OFFSET_PAGES = ["/fr", "/r/sample", "/quiz", "/fr/glossary/cac"];
const stop = (page: Page, s: "tour" | "engine" | "game") => band(page).locator(`[data-stop="${s}"]`);

test.describe("the space band", () => {
  for (const [path, kicker] of [
    ["/fr", "1/3 · Plaine"],
    ["/en", "1/3 · Flat"],
  ] as const) {
    test(`${path} is the Tour's first leg`, async ({ page }) => {
      await page.goto(path);
      await expect(band(page)).toHaveAttribute("data-space", "tour");
      await expect(band(page)).toContainText(kicker);
      await expect(stop(page, "tour").locator('[aria-current="page"]')).toHaveCount(1);
    });
  }

  test("the band never says « étape » — the five AARRR steps own that word", async ({ page }) => {
    for (const path of ["/fr", "/en", "/r/sample"]) {
      await page.goto(path);
      await expect(band(page)).not.toContainText(/étape|stage/i);
    }
  });

  test("the race is whole: an open leg is a link, a closed one is « bientôt » and is not", async ({ page }) => {
    await page.goto("/fr");
    for (const [s, open, home] of [
      ["engine", ENGINE_OPEN, "/fr/aarrr-funnel-template"],
      ["game", GAME_OPEN, "/fr/game"],
    ] as const) {
      await expect(stop(page, s)).toHaveAttribute("data-state", open ? "open" : "soon");
      if (open) {
        await expect(stop(page, s).locator("a")).toHaveAttribute("href", home);
      } else {
        await expect(stop(page, s).locator("a")).toHaveCount(0);
        await expect(stop(page, s)).toContainText("bientôt");
      }
    }
  });

  test("the result wears the Tour's band too", async ({ page }) => {
    await page.goto("/r/sample");
    await expect(band(page)).toHaveAttribute("data-space", "tour");
  });

  test("the quiz's band is a map, not an exit: no link in it", async ({ page }) => {
    await page.goto("/quiz");
    await expect(band(page)).toHaveAttribute("data-space", "tour");
    await expect(band(page).locator("[data-stop]")).toHaveCount(3);
    await expect(band(page).locator("a")).toHaveCount(0);
  });

  test("a reading page belongs to no space: no band, the dashed rule", async ({ page }) => {
    await page.goto("/fr/glossary/cac");
    await expect(band(page)).toHaveCount(0);
    await expect(page.locator("header[data-site-header]")).toHaveAttribute("data-site-header", "plain");
  });

  test("the engine and the game wear their own legs", async ({ page, context }) => {
    test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
    await grantOwnerPreview(context.request, "engine", "game");

    await page.goto("/fr/aarrr-funnel-template");
    await expect(band(page)).toHaveAttribute("data-space", "engine");
    await expect(band(page)).toContainText("2/3 · Contre-la-montre");
    // The Tour is always open: from another space it is a way back.
    await expect(stop(page, "tour").locator("a")).toHaveAttribute("href", "/fr");

    await page.goto("/fr/game");
    await expect(band(page)).toHaveAttribute("data-space", "game");
    await expect(band(page)).toContainText("3/3 · Montagne");
  });
});

test.describe("the space band on a desktop", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  /** The left edge and width of a box, rounded: where a column sits. */
  const column = async (page: Page, selector: string) =>
    page.locator(selector).first().evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { left: Math.round(r.left), width: Math.round(r.width) };
    });

  // Until 2026-10-02 the game's pages sat on the reading column: a band of
  // 760px, under the 900px its race needs to name the legs, so the game
  // never showed « Diagnostic » or « Moteur », at any window width, and its
  // header ran narrower than a level's desk and footer (Antoine).
  //
  // Sabotage (ProsePage as it was, rebuilt): the three tests fall, each on
  // its header row (760px from 260, against the Tour's 1040 from 120); with
  // the column assertions commented out, each on the first leg's name (1px).
  for (const [path, locale] of [
    ["/fr/game", "fr"],
    ["/fr/game/retention", "fr"],
    ["/en/game", "en"],
  ] as const satisfies readonly (readonly [string, Locale])[]) {
    test(`${path} wears the same header as the Tour, and its race names the three legs`, async ({ page }) => {
      test.skip(!GAME_OPEN, "the game is closed in this build: its pages are 404s");
      await page.goto(locale === "fr" ? "/fr" : "/en");
      const tour = await column(page, "[data-header-row]");

      await page.goto(path);
      await expect(band(page)).toHaveAttribute("data-space", "game");
      expect(await column(page, "[data-header-row]"), "the header row").toEqual(tour);
      expect(await column(page, '[data-testid="space-band"] > div'), "the band").toEqual(tour);
      // The footer closes the page on the header's column, not a narrower one.
      expect((await column(page, "footer > div")).left, "the footer").toBe(tour.left);

      for (const s of ["tour", "engine", "game"] as const) {
        const name = stop(page, s).getByText(tc(SPACE_STRINGS.short[s], locale), { exact: true });
        // Under 900px the name is clipped to 1px for screen readers: on screen means wider.
        expect((await name.boundingBox())?.width ?? 0, `${s}'s name`).toBeGreaterThan(20);
      }
    });
  }
});

test.describe("the sticky header", () => {
  test("stays at the top of the window while the page scrolls, and is frosted glass", async ({ page }) => {
    await page.goto("/fr");
    const header = page.locator("header[data-site-header]");
    await page.evaluate(() => window.scrollTo(0, 900));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);

    const box = await header.boundingBox();
    expect(box?.y).toBe(0);
    // The frosted paper is the header's glass layer since design system
    // extension 08 (the compact state shrinks it by a transform).
    const look = await header.evaluate((el) => {
      const glass = el.querySelector("[data-header-glass]")!;
      return { position: getComputedStyle(el).position, blur: getComputedStyle(glass).backdropFilter };
    });
    expect(look.position).toBe("sticky");
    expect(look.blur).toContain("blur(14px)");
  });

  // Measured since 2026-10-02: the stand-in left anchors and focus 25px
  // too low in the quiz, whose header is 93px, and 4px on every page of a
  // phone held upright (JOURNAL.md, « A19.1 »).
  test("--sticky-offset is the header's own height, measured", async ({ page }) => {
    for (const path of OFFSET_PAGES) {
      await page.goto(path);
      await expect.poll(() => offsetGap(page), path).toBe(0);
    }
  });
});

test.describe("the sticky header without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  for (const [width, height] of [[1280, 720], [390, 844], [320, 568]] as const) {
    test(`at ${width}px, --sticky-offset's stand-in still covers the header`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      for (const path of OFFSET_PAGES) {
        await page.goto(path);
        expect(await offsetGap(page), path).toBeGreaterThanOrEqual(0);
      }
    });
  }
});

test.describe("the space band on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const path of ["/fr", "/en", "/quiz", "/r/sample"]) {
    test(`${path}: the whole race fits, nothing scrolls sideways`, async ({ page }) => {
      await page.goto(path);
      await expect(band(page).locator("[data-stop]")).toHaveCount(3);
      for (const s of ["tour", "engine", "game"] as const) await expect(stop(page, s)).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    });
  }

  test("--sticky-offset is the header's own height at this width too", async ({ page }) => {
    for (const path of OFFSET_PAGES) {
      await page.goto(path);
      await expect.poll(() => offsetGap(page), path).toBe(0);
    }
  });

  test("and at 320px, the narrowest width the site holds", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    for (const path of OFFSET_PAGES) {
      await page.goto(path);
      await expect.poll(() => offsetGap(page), path).toBe(0);
    }
  });
});
