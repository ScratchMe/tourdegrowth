import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";
import type { APIResponse } from "@playwright/test";

/**
 * The game's two share images — plan §4.2 (G4b), X20 and X21.
 *
 * X20: both image routes answer a real 1200×630 PNG when the game is open,
 * and a 404 when it is closed and the request carries no owner preview.
 * X21: the `og:image` (and `twitter:image`) each game page declares points to
 * an address that answers that PNG — the page's own image, not the landing's.
 *
 * CI builds and serves the game OPEN (`GAME_ENABLED: "true"`, ci.yml), so the
 * open half runs there; the closed half runs on a local server started
 * without the variable, and is pinned exactly in `proxy.test.ts` (the image
 * addresses are game paths, rewritten like the pages). Each half SKIPS with a
 * message under the other flag rather than passing on nothing — the lesson of
 * e2e/game-flag.spec.ts, R-11 and R2-26.
 */
const GAME_OPEN = process.env.GAME_ENABLED === "true";

const IMAGES = [
  { page: "/game", image: (l: string) => `/${l}/game/opengraph-image/${l}` },
  { page: "/game/retention", image: (l: string) => `/${l}/game/retention/opengraph-image/${l}` },
] as const;

/** The PNG's own header, read rather than trusted from the content type. */
async function pngSize(res: APIResponse): Promise<{ width: number; height: number }> {
  const bytes = await res.body();
  // PNG signature, then the IHDR chunk: width and height as big-endian uint32.
  expect(bytes.subarray(1, 4).toString("latin1")).toBe("PNG");
  expect(bytes.subarray(12, 16).toString("latin1")).toBe("IHDR");
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

test.describe("X20 — the image routes, game open", () => {
  test.skip(!GAME_OPEN, "GAME_ENABLED is not \"true\" for this run — the closed half below covers it.");

  for (const { page, image } of IMAGES) {
    for (const locale of ["en", "fr"] as const) {
      test(`${page} (${locale}) answers a 1200×630 PNG`, async ({ request }) => {
        const res = await request.get(image(locale));
        expect(res.status()).toBe(200);
        expect(res.headers()["content-type"]).toBe("image/png");
        expect(await pngSize(res)).toEqual({ width: 1200, height: 630 });
      });
    }
  }

  test("the two languages are two different pictures", async ({ request }) => {
    // One image per language (the `[locale]` segment): if both answered the
    // same bytes, the French preview would be the English one.
    for (const { image } of IMAGES) {
      const [en, fr] = await Promise.all([request.get(image("en")), request.get(image("fr"))]);
      // Both must be images first: two 404 pages differ too (their <html lang>),
      // which would let this pass on nothing — seen during the non-vacuity run.
      expect([en.status(), fr.status()]).toEqual([200, 200]);
      expect((await en.body()).equals(await fr.body())).toBe(false);
    }
  });
});

test.describe("X20 — the image routes, game closed", () => {
  test.skip(GAME_OPEN, "GAME_ENABLED is \"true\" for this run — the closed state is pinned in proxy.test.ts.");

  for (const { page, image } of IMAGES) {
    test(`${page}: 404 without the owner's preview (or with a guessed cookie), the PNG with it`, async ({ playwright, baseURL }) => {
      test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
      const anonymous = await playwright.request.newContext({ baseURL });
      expect((await anonymous.get(image("fr"))).status()).toBe(404);
      await anonymous.dispose();

      // "1" was the preview's value until 2026-09-25, written in this public
      // repository: it must open nothing now.
      const guessed = await playwright.request.newContext({
        baseURL,
        extraHTTPHeaders: { cookie: "tdg_game_preview=1" },
      });
      expect((await guessed.get(image("fr"))).status()).toBe(404);
      await guessed.dispose();

      const preview = await playwright.request.newContext({ baseURL });
      await grantOwnerPreview(preview, "game");
      const res = await preview.get(image("fr"));
      expect(res.status()).toBe(200);
      expect(await pngSize(res)).toEqual({ width: 1200, height: 630 });
      await preview.dispose();
    });
  }
});

test.describe("X21 — what each game page declares", () => {
  test.skip(!GAME_OPEN, "GAME_ENABLED is not \"true\" for this run — the pages themselves 404.");

  for (const { page, image } of IMAGES) {
    for (const locale of ["en", "fr"] as const) {
      test(`${page} (${locale}) declares its own image, and it answers`, async ({ page: browser, request }) => {
        await browser.goto(`/${locale}${page}`);
        const og = browser.locator('meta[property="og:image"]');
        // Exactly one: a config image next to the file one would mean the
        // landing's picture is declared too (lib/i18n/meta.ts, ownShareImage).
        await expect(og).toHaveCount(1);
        const declared = new URL((await og.getAttribute("content")) ?? "");
        expect(declared.pathname).toBe(image(locale));

        const twitter = await browser.locator('meta[name="twitter:image"]').getAttribute("content");
        expect(new URL(twitter ?? "").pathname).toBe(image(locale));

        // Request the address exactly as declared (path and cache-busting
        // query), against this server rather than the production host.
        const res = await request.get(`${declared.pathname}${declared.search}`);
        expect(res.status()).toBe(200);
        expect(await pngSize(res)).toEqual({ width: 1200, height: 630 });

        await expect(browser.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", /.+/);
      });
    }
  }
});
