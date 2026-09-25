import { ADMIN_PASSWORD, adminCredentials, expect, SKIP_ADMIN_REASON, test } from "./helpers";

/**
 * The game's routes, flag and discovery surfaces — GAME-BRIEF.md 9.3 and 13,
 * plan §4.2 (G4a): P26, P27, X17-X19.
 *
 * CI builds and serves the game OPEN (`GAME_ENABLED: "true"` at workflow
 * level, `ci.yml`), so these specs exercise the open state end to end. The
 * closed state is pinned where it can be pinned exactly — the unit tests of
 * the resolver, the proxy, the build flag and the pages' own metadata
 * (`game-metadata.test.ts`) — the same split the `/admin` gate uses.
 *
 * Without the variable the specs SKIP with a message rather than fail: a
 * local build made without it has no footer link and no sitemap entries by
 * design, and a red run for that reason would be as misleading as a green
 * one that proved nothing (R-11, R2-26).
 */
const GAME_OPEN = process.env.GAME_ENABLED === "true";
test.skip(!GAME_OPEN, "GAME_ENABLED is not \"true\" for this run — the game is closed at build and runtime.");

const PILLAR_ORDER = ["acquisition", "activation", "retention", "referral", "revenue"] as const;

test.describe("P26 — the owner preview", () => {
  test("?game=preview is inert now: it sets no cookie", async ({ page, context }) => {
    // The parameter is written in this public repository; since 2026-09-25
    // only /admin/preview, behind the admin password, mints the cookie.
    await page.goto("/fr/game?game=preview");
    expect((await context.cookies()).find((c) => c.name === "tdg_game_preview")).toBeUndefined();
  });

  test.describe("the switchboard at /admin/preview", () => {
    test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
    test.use({ httpCredentials: adminCredentials });

    test("says the game is open for everyone, and still sets and clears a signed cookie for a year", async ({ page, context }) => {
      await page.goto("/admin/preview");
      // This file runs with GAME_ENABLED="true" (the skip at the top).
      await expect(page.getByTestId("preview-state-game")).toHaveAttribute("data-state", "everyone");

      await page.getByTestId("preview-on-game").click();
      // The state reads "everyone" before and after, so wait on the cookie
      // itself rather than on the page.
      const cookie = async () => (await context.cookies()).find((c) => c.name === "tdg_game_preview");
      await expect.poll(cookie).toBeDefined();
      const set = await cookie();
      expect(set?.value).toMatch(/^[A-Za-z0-9_-]{43}$/);
      expect(set?.httpOnly).toBe(true);
      // A year, give or take the seconds the request took.
      expect(set!.expires - Date.now() / 1000).toBeGreaterThan(360 * 24 * 3600);

      await page.getByTestId("preview-off-game").click();
      await expect.poll(cookie).toBeUndefined();
    });
  });
});

test.describe("X17 — the locale-less addresses", () => {
  for (const path of ["/game", "/game/retention"]) {
    test(`${path} redirects to its localized form, query intact`, async ({ request }) => {
      const res = await request.get(`${path}?from=share`, {
        maxRedirects: 0,
        headers: { "accept-language": "fr-FR,fr;q=0.9" },
      });
      expect(res.status()).toBe(308);
      expect(res.headers().location).toMatch(new RegExp(`/fr${path}\\?from=share$`));
    });
  }
});

test.describe("P27 — discovery follows the flag at build", () => {
  test("the footer links to the game, in both languages", async ({ page }) => {
    for (const locale of ["en", "fr"] as const) {
      await page.goto(`/${locale}/how-it-works`);
      const link = page.getByTestId("footer-game-link");
      await expect(link).toHaveAttribute("href", `/${locale}/game`);
      await expect(link).toHaveText(locale === "fr" ? "Le jeu" : "The game");
    }
  });

  test("the sitemap lists the hub and the level, once per language", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const path of ["/en/game", "/fr/game", "/en/game/retention", "/fr/game/retention"]) {
      const matches = xml.match(new RegExp(`<loc>https://(www\\.)?tourdegrowth\\.com${path}</loc>`, "g"));
      expect(matches, path).toHaveLength(1);
    }
  });

  for (const path of ["/game", "/game/retention"]) {
    test(`${path} is indexable and declares its hreflang set`, async ({ page }) => {
      await page.goto(`/fr${path}`);
      await expect(page.locator("html")).toHaveAttribute("lang", "fr");
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/fr${path}$`));
      for (const lang of ["en", "fr", "x-default"]) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveCount(1);
      }
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    });
  }
});

test.describe("X19 — the hub", () => {
  test("lists the five zones in AARRR order, with one link in the list", async ({ page }) => {
    await page.goto("/en/game");
    const zones = page.getByTestId("game-hub-zones").locator("> li");
    await expect(zones).toHaveCount(5);
    const ids = await zones.evaluateAll((items) => items.map((li) => li.getAttribute("data-testid")));
    expect(ids).toEqual(PILLAR_ORDER.map((p) => `game-hub-zone-${p}`));

    // Only the enabled level is a link; the four others say "soon" in words.
    const links = page.getByTestId("game-hub-zones").getByRole("link");
    await expect(links).toHaveCount(1);
    await expect(links.first()).toHaveAttribute("href", "/en/game/retention?from=hub");
    for (const pillar of PILLAR_ORDER.filter((p) => p !== "retention")) {
      await expect(page.getByTestId(`game-hub-zone-${pillar}`)).toContainText(/Soon/i);
    }
  });

  test("names each zone by the Tour's pillar and the game's question, in French too", async ({ page }) => {
    await page.goto("/fr/game");
    await expect(page.getByTestId("game-hub-zone-retention").getByRole("heading")).toHaveText(
      "Retention — S'ils reviennent",
    );
  });

  test("playing fires the entry event from the hub", async ({ page }) => {
    await page.goto("/en/game");
    // The level lives under the same root layout, so a client navigation keeps
    // the recorded events — but hold it anyway so the assertion reads the
    // document that emitted the event.
    await page.evaluate(() =>
      document.addEventListener("click", (e) => e.preventDefault(), { capture: true, once: true }),
    );
    await page.getByTestId("game-hub-level-retention").click();
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __tdgEvents?: string[] }).__tdgEvents ?? []))
      .toContain("game_entry_clicked/hub");
  });

  test("the last ending reached on this device is shown on its zone", async ({ page }) => {
    await page.goto("/fr/game");
    await page.evaluate(() =>
      localStorage.setItem(
        "tdg.game.collection.v1",
        JSON.stringify({ patterns: {}, endings: { retention: { id: "labyrinth", at: "2026-09-20T10:00:00.000Z" } } }),
      ),
    );
    await page.reload();
    await expect(page.getByTestId("game-hub-last-ending-retention")).toContainText("20 septembre 2026");
  });
});

test.describe("the level page", () => {
  test("renders the intro, the zone nav and the year's first call", async ({ page }) => {
    await page.goto("/en/game/retention");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("A year at Flixo");
    await expect(page.getByTestId("game-zone-nav")).toBeVisible();
    await expect(page.getByTestId("game-call")).toHaveAttribute("data-state", "open");
  });

  test("the language switch carries resume=1", async ({ page }) => {
    await page.goto("/en/game/retention");
    const fr = page.getByRole("group", { name: "Language" }).getByRole("link", { name: "FR" });
    await expect(fr).toHaveAttribute("href", "/fr/game/retention?resume=1");
  });
});
