import type { Page } from "@playwright/test";
import { badgeToken } from "../src/lib/og/badge";
import { SAMPLE_RESULT } from "../src/lib/submissions/sample";
import { expect, test, trackedEvents } from "./helpers";

/**
 * The growth loop, wave 3 of GROWTH-PLAN.md (CHANTIERS.md A3, 2026-09-29):
 * the README badge's address, the native share that carries the picture,
 * and the canonical roast example. All on `/r/sample`, the one result page
 * the suite can render (a real one needs Firestore); the owner's badge block
 * is held by `r/[id]/__tests__/badge-snippet.test.ts`.
 *
 * Non-vacuity (2026-09-29): against the build of `main` before A3, the four
 * tests that carry it fail (the badge's two, the share with the file, the
 * roast example); the two that pass there guard what stays — the link share
 * where no file is taken, and the neutral sample under any other tone.
 */

const IMMUTABLE = /immutable/;

test.describe("the README badge (A3.1)", () => {
  test("its current address is an SVG picture, immutable, that says the total and nothing more", async ({ request }) => {
    const res = await request.get(`/r/sample/badge/${badgeToken(SAMPLE_RESULT.total)}.svg`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/^image\/svg\+xml/);
    expect(res.headers()["cache-control"]).toMatch(IMMUTABLE);
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
    // The site-wide CSP (next.config.mjs) is what this answer carries: framing refused.
    expect(res.headers()["content-security-policy"]).toBe("frame-ancestors 'none'");
    const svg = await res.text();
    expect(svg).toContain(`>${SAMPLE_RESULT.total}/100<`);
    expect(svg).not.toMatch(/<script|href=/i);
  });

  test("an older address still answers with the current badge, cached briefly; anything else is a 404", async ({ request }) => {
    const older = await request.get("/r/sample/badge/000000000000.svg");
    expect(older.status()).toBe(200);
    expect(older.headers()["cache-control"]).not.toMatch(IMMUTABLE);
    expect(older.headers()["cache-control"]).toMatch(/s-maxage=3600/);
    for (const path of ["/r/sample/badge/badge.svg", `/r/sample/badge/${badgeToken(74)}.png`, `/r/not-an-id/badge/${badgeToken(74)}.svg`]) {
      expect((await request.get(path)).status(), path).toBe(404);
    }
  });
});

/** Stubs the share sheet: `canShare` answers `files`, `share` records what it was handed. */
async function stubShareSheet(page: Page, takesFiles: boolean) {
  await page.addInitScript((files) => {
    const w = window as unknown as { __shared?: unknown[] };
    w.__shared = [];
    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value: (data: { files?: File[] }) => (data.files ? files : true),
    });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data: { files?: File[]; url?: string; text?: string }) => {
        w.__shared!.push({
          files: (data.files ?? []).map((f) => ({ name: f.name, type: f.type, size: f.size })),
          url: data.url ?? null,
          text: data.text ?? null,
        });
      },
    });
  }, takesFiles);
}

async function shareFromSample(page: Page, path = "/r/sample") {
  await page.goto(path);
  // The file is fetched when the share block comes near the screen (ResultView, A3.2).
  const image = page.waitForResponse((r) => /\/r\/sample\/share\/[a-f0-9]{12}\.png$/.test(r.url()));
  await page.getByTestId("share-card").scrollIntoViewIfNeeded();
  await image;
  await page.waitForLoadState("networkidle");
  await page.getByTestId("share-button").click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __shared: unknown[] }).__shared.length)).toBe(1);
  return page.evaluate(() => (window as unknown as { __shared: { files: { name: string; type: string; size: number }[]; url: string | null; text: string | null }[] }).__shared[0]!);
}

test.describe("the native share carries the picture (A3.2)", () => {
  test("where the platform takes a file: the share image itself, the link in the text, counted as `image`", async ({ page }) => {
    await stubShareSheet(page, true);
    const shared = await shareFromSample(page);
    expect(shared.files).toHaveLength(1);
    expect(shared.files[0]!.name).toBe(`tour-de-growth-${SAMPLE_RESULT.total}.png`);
    expect(shared.files[0]!.type).toBe("image/png");
    expect(shared.files[0]!.size).toBeGreaterThan(10_000);
    expect(shared.text).toContain("/r/sample");
    expect(await trackedEvents(page)).toContain("share/neutral/image");
  });

  test("where it does not: the link, as before, counted as `native`", async ({ page }) => {
    await stubShareSheet(page, false);
    const shared = await shareFromSample(page);
    expect(shared.files).toEqual([]);
    expect(shared.url).toContain("/r/sample");
    const events = await trackedEvents(page);
    expect(events).toContain("share/neutral/native");
    expect(events).not.toContain("share/neutral/image");
  });
});

test.describe("the canonical roast example (A3.3)", () => {
  test("`/r/sample?tone=roast` opens on the roast verdict, with a roast card of its own, in the page and in og:image", async ({ page, request }) => {
    await page.goto("/r/sample");
    const neutralOg = await page.locator('meta[property="og:image"]').getAttribute("content");
    const neutralCard = await page.getByTestId("share-card").locator("img").getAttribute("src");

    await page.goto("/r/sample?tone=roast");
    const roastOg = await page.locator('meta[property="og:image"]').getAttribute("content");
    const roastCard = await page.getByTestId("share-card").locator("img").getAttribute("src");
    expect(roastOg).not.toBe(neutralOg);
    expect(roastCard).not.toBe(neutralCard);

    // Both addresses are current tokens: immutable PNGs, not the brief fallback.
    for (const url of [roastOg!, roastCard!]) {
      const res = await request.get(new URL(url, page.url()).pathname);
      expect(res.status(), url).toBe(200);
      expect(res.headers()["content-type"]).toBe("image/png");
      expect(res.headers()["cache-control"], url).toMatch(IMMUTABLE);
    }

    // The page opens on the roast verdict: sharing from it is a roast share.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "canShare", { configurable: true, value: () => false });
      Object.defineProperty(navigator, "share", { configurable: true, value: async () => undefined });
    });
    await page.reload();
    await page.getByTestId("share-button").click();
    await expect.poll(() => trackedEvents(page)).toContain("share/roast/native");
  });

  test("any other tone is the neutral sample", async ({ page }) => {
    await page.goto("/r/sample");
    const neutralOg = await page.locator('meta[property="og:image"]').getAttribute("content");
    await page.goto("/r/sample?tone=nope");
    expect(await page.locator('meta[property="og:image"]').getAttribute("content")).toBe(neutralOg);
  });
});
