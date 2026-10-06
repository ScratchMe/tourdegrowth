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
  for (const path of ["/game", "/game/acquisition", "/game/activation", "/game/retention", "/game/referral", "/game/revenue"]) {
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

  test("the sitemap lists the hub and the five levels, once per language", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const path of [
      "/en/game", "/fr/game", "/en/game/acquisition", "/fr/game/acquisition", "/en/game/activation", "/fr/game/activation",
      "/en/game/retention", "/fr/game/retention", "/en/game/referral", "/fr/game/referral", "/en/game/revenue", "/fr/game/revenue",
    ]) {
      const matches = xml.match(new RegExp(`<loc>https://(www\\.)?tourdegrowth\\.com${path}</loc>`, "g"));
      expect(matches, path).toHaveLength(1);
    }
  });

  for (const path of ["/game", "/game/acquisition", "/game/activation", "/game/retention", "/game/referral", "/game/revenue"]) {
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
  test("lists the five zones in AARRR order, with a link on each open level", async ({ page }) => {
    await page.goto("/en/game");
    const zones = page.getByTestId("game-hub-zones").locator("> li");
    await expect(zones).toHaveCount(5);
    const ids = await zones.evaluateAll((items) => items.map((li) => li.getAttribute("data-testid")));
    expect(ids).toEqual(PILLAR_ORDER.map((p) => `game-hub-zone-${p}`));

    // Only the enabled levels are links — acquisition since level 2 (A12.f),
    // activation since level 3 (A24, ACT-3), referral since level 4 (A24,
    // REF-3), revenue since level 5 (A24, REV-3), and retention: all five
    // zones are playable, so none says "soon" any more.
    const links = page.getByTestId("game-hub-zones").getByRole("link");
    await expect(links).toHaveCount(5);
    await expect(links.nth(0)).toHaveAttribute("href", "/en/game/acquisition?from=hub");
    await expect(links.nth(1)).toHaveAttribute("href", "/en/game/activation?from=hub");
    await expect(links.nth(2)).toHaveAttribute("href", "/en/game/retention?from=hub");
    await expect(links.nth(3)).toHaveAttribute("href", "/en/game/referral?from=hub");
    await expect(links.nth(4)).toHaveAttribute("href", "/en/game/revenue?from=hub");
    await expect(page.getByTestId("game-hub-zones")).not.toContainText(/Soon/i);
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

  test("each level names its own ending — a settlement at Pédalix, a fine at Quandi, at Flixo and at Partix, a settlement and a fine at Gainix", async ({ page }) => {
    await page.goto("/fr/game");
    await page.evaluate(() =>
      localStorage.setItem(
        "tdg.game.collection.v1",
        JSON.stringify({
          patterns: {},
          endings: {
            acquisition: { id: "fine", at: "2026-10-01T10:00:00.000Z" },
            activation: { id: "fine", at: "2026-10-05T10:00:00.000Z" },
            retention: { id: "fine", at: "2026-09-20T10:00:00.000Z" },
            referral: { id: "fine", at: "2026-10-05T11:00:00.000Z" },
            revenue: { id: "fine", at: "2026-10-06T10:00:00.000Z" },
          },
        }),
      ),
    );
    await page.reload();
    await expect(page.getByTestId("game-hub-last-ending-acquisition")).toContainText("le contrôle et la transaction");
    // The CNIL's administrative fine is a fine: level 3 keeps the hub's own wording (A24, ACT-3).
    await expect(page.getByTestId("game-hub-last-ending-activation")).toContainText("le contrôle et l'amende");
    await expect(page.getByTestId("game-hub-last-ending-retention")).toContainText("le contrôle et l'amende");
    // Same for the CNIL's fine at Partix: no ending label of its own (A24, REF-3).
    await expect(page.getByTestId("game-hub-last-ending-referral")).toContainText("le contrôle et l'amende");
    // Gainix's inspection ends in two procedures, a settlement and a fine: its own label (A24, REV-3).
    await expect(page.getByTestId("game-hub-last-ending-revenue")).toContainText("le contrôle, la transaction et l'amende");
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

  test("level 2 has the same page: Pédalix's intro, its first call, and its own glossary words", async ({ page }) => {
    await page.goto("/fr/game/acquisition");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Une année chez Pédalix");
    await expect(page.getByTestId("game-call")).toHaveAttribute("data-state", "open");
    await expect(page.locator('a[href="/fr/glossary/acquisition"]')).toHaveCount(1);
    await expect(page.locator('a[href="/fr/glossary/cac"]')).toHaveCount(1);
  });

  test("level 3 has the same page: Quandi's intro, its first call, and its own glossary words (A24, ACT-3)", async ({ page }) => {
    await page.goto("/fr/game/activation");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Une année chez Quandi");
    await expect(page.getByTestId("game-call")).toHaveAttribute("data-state", "open");
    await expect(page.locator('a[href="/fr/glossary/activation"]')).toHaveCount(1);
    await expect(page.locator('a[href="/fr/glossary/aha-moment"]')).toHaveCount(1);
  });

  test("level 4 has the same page: Partix's intro, its first call, and its own glossary words (A24, REF-3)", async ({ page }) => {
    await page.goto("/fr/game/referral");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Une année chez Partix");
    await expect(page.getByTestId("game-call")).toHaveAttribute("data-state", "open");
    await expect(page.locator('a[href="/fr/glossary/referral"]')).toHaveCount(1);
    await expect(page.locator('a[href="/fr/glossary/viral-coefficient"]')).toHaveCount(1);
  });

  test("level 5 has the same page: Gainix's intro, its first call, and its own glossary words (A24, REV-3)", async ({ page }) => {
    await page.goto("/fr/game/revenue");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Une année chez Gainix");
    await expect(page.getByTestId("game-call")).toHaveAttribute("data-state", "open");
    await expect(page.locator('a[href="/fr/glossary/revenue"]')).toHaveCount(1);
    await expect(page.locator('a[href="/fr/glossary/arpu"]')).toHaveCount(1);
  });

  test("the five open levels' zones link to each other, counted as the other-level door", async ({ page }) => {
    const levels = ["acquisition", "activation", "retention", "referral", "revenue"] as const;
    for (const from of levels) {
      await page.goto(`/en/game/${from}`);
      const nav = page.getByTestId("game-zone-nav");
      for (const to of levels.filter((level) => level !== from)) {
        await expect(nav.locator(`a[href="/en/game/${to}?from=other_level"]`)).toHaveCount(1);
      }
      // The zone being played leads back to the hub.
      await expect(page.getByTestId(`game-zone-${from}`).getByRole("link")).toHaveAttribute("href", "/en/game");
    }
  });
});
