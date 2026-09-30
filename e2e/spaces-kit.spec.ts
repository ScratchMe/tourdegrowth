import type { Page } from "@playwright/test";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";

/**
 * Design I + B, the spaces' half (retained by Antoine on 2026-09-28): the
 * landing's race in three cards, the engine in its ultramarine with its
 * stopwatch, the game hub's night poster, and the name signing off at the
 * foot of every page.
 *
 * Measured on the rendered page: each is a claim about what the reader sees
 * (a colour, a world, a drawing hidden from screen readers, a card that
 * stays in its column) that the markup alone cannot make.
 */

const WIDTHS = [
  { width: 1280, locale: "en" },
  { width: 390, locale: "fr" },
] as const;

/** The ultramarine of `--space-engine-accent`, as the browser computes it. */
const ULTRAMARINE = "rgb(29, 63, 143)";
/** `--night-0`, the night world's page. */
const NIGHT = "rgb(20, 17, 13)";

const GAME_OPEN = process.env.GAME_ENABLED === "true";

async function noSidewaysScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "the page scrolls sideways").toBeLessThanOrEqual(0);
}

test.describe("the landing's strip: the race in three cards", () => {
  for (const { width, locale } of WIDTHS) {
    test(`names the three legs in order, each as open as the band says, at ${width}px (${locale})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}`);
      const strip = page.getByTestId("space-strip");

      // The band's own name for the race — never « étape », the AARRR stage's word.
      const heading = strip.getByRole("heading", { level: 2 });
      await expect(heading).toHaveText(locale === "fr" ? "Le Tour en trois parties" : "The Tour in three parts");
      await expect(strip.getByRole("heading", { level: 3 })).toHaveText(
        locale === "fr" ? ["Le diagnostic", "Le moteur", "Le côté obscur"] : ["The check-up", "The engine", "The dark side"],
      );

      const cards = await strip.locator("li").evaluateAll((els) =>
        els.map((el) => {
          const box = el.getBoundingClientRect();
          return {
            space: el.getAttribute("data-space"),
            state: el.getAttribute("data-state"),
            world: el.getAttribute("data-world"),
            border: getComputedStyle(el).borderTopStyle,
            when: el.querySelector('[class*="when"]')!.textContent,
            chipHidden: el.querySelector('[class*="chip"]')!.getAttribute("aria-hidden"),
            top: box.top,
            bottom: box.bottom,
            right: box.right,
          };
        }),
      );
      expect(cards.map((c) => c.space)).toEqual(["tour", "engine", "game"]);

      // The strip and the band read the same flags: a leg is open on one
      // exactly when it is open on the other.
      const band = await page
        .getByTestId("space-band")
        .locator("[data-stop]")
        .evaluateAll((els) => els.map((el) => el.getAttribute("data-state")));
      expect(band[0]).toBe("current");
      for (const [i, card] of cards.entries()) {
        expect(card.state, `${card.space}: the strip and the band disagree`).toBe(i === 0 || band[i] === "open" ? "open" : "soon");
      }

      const soon = locale === "fr" ? "bientôt" : "soon";
      const when = locale === "fr" ? ["Maintenant", "Ensuite", "Pour finir"] : ["Now", "Next", "Last"];
      for (const [i, card] of cards.entries()) {
        // A closed leg is a word AND a dashed edge, never one without the other.
        expect(card.when).toBe(card.state === "open" ? when[i] : soon);
        expect(card.border).toBe(card.state === "open" ? "solid" : "dashed");
        expect(card.chipHidden).toBe("true");
      }
      expect(cards[0]!.state, "the Tour is always open").toBe("open");
      // The game's card is set in the game's world.
      expect(cards.map((c) => c.world)).toEqual([null, null, "night"]);
      const gameGround = await strip.locator('[data-space="game"]').evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(gameGround).toBe(NIGHT);

      // Since C15 (2026-09-29) an open card is a door — one link each, its name; a closed one has none.
      await expect(strip.locator("a")).toHaveCount(cards.filter((c) => c.state === "open").length);
      for (const card of cards) {
        await expect(strip.locator(`[data-space="${card.space}"] a`)).toHaveCount(card.state === "open" ? 1 : 0);
      }

      // Three in a row on a wide screen, one column on a phone.
      if (width >= 1000) {
        expect(new Set(cards.map((c) => Math.round(c.top))).size).toBe(1);
      } else {
        for (let i = 1; i < cards.length; i++) expect(cards[i]!.top).toBeGreaterThan(cards[i - 1]!.bottom);
      }
      await noSidewaysScroll(page);
    });
  }
});

test.describe("the footer's name, signing off", () => {
  for (const { width, locale } of WIDTHS) {
    test(`spans the footer's column, hidden from assistive technology, its foot cut by the page's edge, at ${width}px (${locale})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}/how-it-works`);
      const mark = page.getByTestId("footer-wordmark");
      await expect(mark).toHaveAttribute("aria-hidden", "true");
      await expect(mark).toContainText("TOUR DE GROWTH");

      const geo = await mark.evaluate((svg) => {
        const footer = svg.closest("footer")!;
        const credit = footer.querySelector("p")!;
        const text = svg.querySelector("text")!;
        const box = svg.getBoundingClientRect();
        const ink = text.getBoundingClientRect();
        return {
          svgLeft: box.left,
          svgRight: box.right,
          svgBottom: box.bottom,
          baseline: Number(text.getAttribute("y")),
          drawingHeight: (svg as SVGSVGElement).viewBox.baseVal.height,
          inkWidth: ink.width,
          creditLeft: credit.getBoundingClientRect().left,
          footerBottom: footer.getBoundingClientRect().bottom,
          fill: getComputedStyle(text).fill,
        };
      });
      // The column the footer's links stand in, and nothing wider.
      expect(Math.abs(geo.svgLeft - geo.creditLeft)).toBeLessThanOrEqual(1);
      expect(geo.inkWidth).toBeGreaterThan((geo.svgRight - geo.svgLeft) * 0.95);
      // The last thing on the page, cropped: the letters stand on a baseline
      // under the drawing's bottom edge, so the page's edge cuts their foot.
      expect(Math.abs(geo.svgBottom - geo.footerBottom)).toBeLessThanOrEqual(1);
      expect(geo.baseline).toBeGreaterThan(geo.drawingHeight);
      // Faint: the text ink at a few percent, never a second logo. A mixed
      // colour computes as `color(srgb r g b / a)`, a plain one as `rgba(…, a)`.
      const alpha = Number(/(?:\/|,)\s*([\d.]+)\)$/.exec(geo.fill)?.[1] ?? 1);
      expect(alpha).toBeLessThan(0.1);
      await noSidewaysScroll(page);
    });
  }
});

test.describe("the engine in its colour", () => {
  test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
  test.beforeEach(async ({ context }) => {
    await grantOwnerPreview(context.request, "engine");
  });

  for (const { width, locale } of WIDTHS) {
    test(`wears the ultramarine, the stopwatch beside the intro on a wide screen only, at ${width}px (${locale})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}/aarrr-funnel-template`);
      const colours = await page.evaluate(() => {
        const color = (sel: string) => getComputedStyle(document.querySelector(sel)!).color;
        const privacy = getComputedStyle(document.querySelector('[data-testid="engine-privacy"]')!);
        return {
          eyebrow: color("main [class*='eyebrow']"),
          privacyEdge: privacy.borderTopColor,
          privacyStyle: privacy.borderTopStyle,
          durationRule: getComputedStyle(document.querySelector('[data-testid="engine-duration"] dl > div')!).borderTopColor,
          toolRule: getComputedStyle(document.querySelector("#engine")!).borderTopColor,
        };
      });
      expect(colours.eyebrow).toBe(ULTRAMARINE);
      expect(colours.privacyEdge).toBe(ULTRAMARINE);
      expect(colours.privacyStyle).toBe("solid");
      expect(colours.durationRule).toBe(ULTRAMARINE);
      expect(colours.toolRule).toBe(ULTRAMARINE);

      const watch = page.getByTestId("engine-stopwatch");
      await expect(watch).toHaveAttribute("aria-hidden", "true");
      if (width >= 1100) {
        await expect(watch).toBeVisible();
        // Beside the intro, never over a word of it.
        const overlap = await page.evaluate(() => {
          const w = document.querySelector('[data-testid="engine-stopwatch"]')!.getBoundingClientRect();
          const intro = document.querySelector("main h1")!.parentElement!;
          return [...intro.querySelectorAll("h1, p, h2, a")].some((el) => {
            const r = el.getBoundingClientRect();
            return r.right > w.left && r.left < w.right && r.bottom > w.top && r.top < w.bottom;
          });
        });
        expect(overlap, "the stopwatch covers the intro").toBe(false);
      } else {
        await expect(watch).toBeHidden();
      }
      await noSidewaysScroll(page);
    });
  }
});

test.describe("the game hub's night poster", () => {
  test.skip(!GAME_OPEN, 'GAME_ENABLED is not "true" for this run — the hub is the localized 404.');

  for (const { width, locale } of WIDTHS) {
    test(`sets the intro in the night, the playable zone flagged on the mountain, at ${width}px (${locale})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}/game`);
      const night = page.getByTestId("prose-night-intro");
      await expect(night).toHaveAttribute("data-world", "night");
      await expect(night.getByRole("heading", { level: 1 })).toHaveText(locale === "fr" ? "Le côté obscur" : "The dark side");
      expect(await night.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(NIGHT);
      // As wide as the screen, in the page's flow.
      const box = (await night.boundingBox())!;
      expect(Math.round(box.x)).toBe(0);
      expect(Math.round(box.width)).toBe(width);

      const mountain = night.getByTestId("game-hub-mountain");
      await expect(mountain).toHaveAttribute("aria-hidden", "true");
      await expect(mountain).toContainText(locale === "fr" ? "Profil de la montagne" : "Mountain profile");

      // The flag stands on the zone the list says is playable, carrying its
      // number; every other zone is a plain number.
      const zones = await page
        .getByTestId("game-hub-zones")
        .locator("li")
        .evaluateAll((els) => els.map((el) => el.querySelector("a") !== null));
      const flags = await mountain.locator('[data-open="true"]').allTextContents();
      expect(flags).toEqual(zones.flatMap((open, i) => (open ? [String(i + 1)] : [])));
      expect(flags.length, "no zone is playable — this measures nothing").toBeGreaterThan(0);

      // The list stays on paper, under the poster.
      const list = page.getByTestId("game-hub-zones");
      expect(await list.evaluate((el) => el.closest("[data-world]"))).toBeNull();
      await noSidewaysScroll(page);
    });
  }
});
