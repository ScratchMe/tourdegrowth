import type { Page } from "@playwright/test";
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

test.describe("the sticky header", () => {
  test("stays at the top of the window while the page scrolls, and is frosted glass", async ({ page }) => {
    await page.goto("/fr");
    const header = page.locator("header[data-site-header]");
    await page.evaluate(() => window.scrollTo(0, 900));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);

    const box = await header.boundingBox();
    expect(box?.y).toBe(0);
    const look = await header.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { position: cs.position, blur: cs.backdropFilter };
    });
    expect(look.position).toBe("sticky");
    expect(look.blur).toContain("blur(14px)");
  });

  test("--sticky-offset covers the header it stands for", async ({ page }) => {
    for (const path of ["/fr", "/quiz", "/fr/glossary/cac"]) {
      await page.goto(path);
      const { height, offset } = await page.evaluate(() => ({
        height: document.querySelector("header[data-site-header]")!.getBoundingClientRect().height,
        offset: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sticky-offset")),
      }));
      expect(offset, path).toBeGreaterThanOrEqual(Math.floor(height));
    }
  });
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

  test("--sticky-offset covers the header at this width too", async ({ page }) => {
    for (const path of ["/fr", "/fr/glossary/cac"]) {
      await page.goto(path);
      const { height, offset } = await page.evaluate(() => ({
        height: document.querySelector("header[data-site-header]")!.getBoundingClientRect().height,
        offset: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sticky-offset")),
      }));
      expect(offset, path).toBeGreaterThanOrEqual(Math.floor(height));
    }
  });
});
