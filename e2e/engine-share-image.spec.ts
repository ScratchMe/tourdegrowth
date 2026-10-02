import type { APIResponse } from "@playwright/test";
import { engineShareText } from "@/lib/og/engine-share-text";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";

/**
 * The growth engine's share image — engine spec §19.11, design brief 06
 * (T6.2).
 *
 * The route answers a real 1200×630 PNG per language when the engine is open
 * to the request, and a 404 when it is closed and the request carries no
 * owner preview — the page's own rule, through the proxy (`isEnginePath`).
 * The page declares that image, and only that one: not the landing's, which
 * it wore until T6.2.
 *
 * CI builds the engine CLOSED, so there everything runs through the owner's
 * signed preview cookie, which needs `ADMIN_DASHBOARD_PASSWORD` on the
 * server (ci.yml sets it). A build with `ENGINE_ENABLED=true` runs the same
 * checks without the cookie, and the closed half skips with a message rather
 * than passing on nothing.
 */
const ENGINE_OPEN = process.env.ENGINE_ENABLED === "true";
const LOCALES = ["en", "fr"] as const;
const PAGE = (l: string) => `/${l}/aarrr-funnel-template`;
const IMAGE = (l: string) => `/${l}/aarrr-funnel-template/opengraph-image/${l}`;

/** The PNG's own header, read rather than trusted from the content type. */
async function pngSize(res: APIResponse): Promise<{ width: number; height: number }> {
  const bytes = await res.body();
  expect(bytes.subarray(1, 4).toString("latin1")).toBe("PNG");
  expect(bytes.subarray(12, 16).toString("latin1")).toBe("IHDR");
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

test.describe("the engine's share image, engine closed", () => {
  test.skip(ENGINE_OPEN, "ENGINE_ENABLED is \"true\" for this run — the closed state is pinned in proxy.test.ts.");

  for (const locale of LOCALES) {
    test(`404 without the owner's preview, or with a guessed cookie (${locale})`, async ({ playwright, baseURL }) => {
      const anonymous = await playwright.request.newContext({ baseURL });
      expect((await anonymous.get(IMAGE(locale))).status()).toBe(404);
      await anonymous.dispose();

      const guessed = await playwright.request.newContext({
        baseURL,
        extraHTTPHeaders: { cookie: "tdg_engine_preview=1" },
      });
      expect((await guessed.get(IMAGE(locale))).status()).toBe(404);
      await guessed.dispose();
    });
  }
});

test.describe("the engine's share image, open to the request", () => {
  // Anonymous on an open build; the owner's preview on a closed one.
  test.beforeEach(() => {
    test.skip(!ENGINE_OPEN && !ADMIN_PASSWORD, SKIP_ADMIN_REASON);
  });

  test("answers a 1200×630 PNG in each language, and the two are different pictures", async ({ playwright, baseURL }) => {
    const context = await playwright.request.newContext({ baseURL });
    if (!ENGINE_OPEN) await grantOwnerPreview(context, "engine");
    const bodies: Buffer[] = [];
    for (const locale of LOCALES) {
      const res = await context.get(IMAGE(locale));
      expect(res.status(), locale).toBe(200);
      expect(res.headers()["content-type"]).toBe("image/png");
      expect(await pngSize(res)).toEqual({ width: 1200, height: 630 });
      bodies.push(await res.body());
    }
    // If both answered the same bytes, the French preview would be the English one.
    expect(bodies[0]!.equals(bodies[1]!)).toBe(false);
    await context.dispose();
  });

  for (const locale of LOCALES) {
    test(`the page declares its own image, with its alt text, and it answers (${locale})`, async ({ browser, baseURL }) => {
      const context = await browser.newContext({ baseURL });
      if (!ENGINE_OPEN) await grantOwnerPreview(context.request, "engine");
      const page = await context.newPage();
      await page.goto(PAGE(locale));

      const og = page.locator('meta[property="og:image"]');
      // Exactly one: a config image next to the file one would mean the
      // landing's picture is declared too (lib/i18n/meta.ts, ownShareImage).
      await expect(og).toHaveCount(1);
      const declared = new URL((await og.getAttribute("content")) ?? "");
      expect(declared.pathname).toBe(IMAGE(locale));
      const twitter = await page.locator('meta[name="twitter:image"]').getAttribute("content");
      expect(new URL(twitter ?? "").pathname).toBe(IMAGE(locale));
      await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", engineShareText(locale).alt);

      // The address exactly as declared (path and cache-busting query), on this server.
      const res = await context.request.get(`${declared.pathname}${declared.search}`);
      expect(res.status()).toBe(200);
      expect(await pngSize(res)).toEqual({ width: 1200, height: 630 });
      await context.close();
    });
  }
});
