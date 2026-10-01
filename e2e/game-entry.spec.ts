import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { GAME_ENTRY_EYEBROW } from "@/content/game/entry";
import { ADMIN_PASSWORD, SKIP_ADMIN_REASON, expect, grantOwnerPreview, test, trackedEvents } from "./helpers";

/**
 * The game card on the result page — GAME-BRIEF.md 13.3 A, game plan G5b:
 * P23 (the sample's retention bottleneck shows the card), the closed game
 * (no card, nothing in the payload), the preview cookie, the placement on
 * each layout, the event, and an accessibility pass with the card on screen.
 *
 * P24 and P25 — a real result whose bottleneck is acquisition, and one with a
 * Deep dive — are pinned on the pure resolver (`r/[id]/__tests__/game-entry.test.ts`) and the
 * page is held to that resolver by `src/__tests__/game-entry-wiring.test.ts`
 * (orchestrator decision 3, 2026-09-24: no fixture route on the public page).
 * Since A7.11 a real result renders on the Firestore emulator too, and
 * `result-real.spec.ts` checks the card on a stored retention bottleneck.
 *
 * The flag has two states and a run sees one of them. CI builds and serves
 * the game OPEN (`GAME_ENABLED: "true"` at workflow level, like
 * game-flag.spec.ts), so the "closed" specs skip there with a message; a local
 * run without the variable exercises them. The preview specs hold in both.
 *
 * The preview is the owner's since 2026-09-25 (`lib/owner-preview.ts`): a
 * signed cookie minted by `POST /admin/preview` behind the admin password.
 * The public `?game=preview` these specs used to append is inert now — one
 * spec below pins exactly that.
 */
const GAME_OPEN = process.env.GAME_ENABLED === "true";

const TITLE = { en: "The dark side of retention", fr: "Le côté obscur de la rétention" } as const;
const EYEBROW = GAME_ENTRY_EYEBROW;

async function box(page: Page, testId: string) {
  const b = await page.getByTestId(testId).boundingBox();
  expect(b, `${testId} is not on the page`).not.toBeNull();
  return b!;
}

test.describe("closed game — no card, and no trace of one", () => {
  test.skip(GAME_OPEN, "GAME_ENABLED is \"true\" for this run — the closed state is covered by a run without it and by the resolver's unit tests.");

  test("/r/sample shows no card without the flag or the preview cookie", async ({ page, request }) => {
    await page.goto("/r/sample?lang=en");
    await expect(page.getByTestId("bottleneck")).toBeVisible();
    await expect(page.getByTestId("game-entry")).toHaveCount(0);

    // Not hidden: absent. A closed page must not carry the card's text in
    // its RSC payload either — that would announce a feature that 404s.
    for (const lang of ["en", "fr"] as const) {
      const html = await (await request.get(`/r/sample?lang=${lang}`)).text();
      expect(html.length, "the page did not render").toBeGreaterThan(5000);
      expect(html).not.toContain(TITLE[lang]);
      expect(html).not.toContain("/game/retention");
      // The card's own event detail. Not "game_entry_clicked" alone: the
      // footer's game link carries that name when the BUILD saw the flag
      // open (13.1 — build-time surfaces follow the build), which is a
      // different surface from this request-time card.
      expect(html).not.toContain("result/retention");
    }
  });

  test("?game=preview no longer opens anything: no card, no cookie", async ({ page, context }) => {
    // The parameter is written in this public repository; it used to open the
    // game for anyone who had read it.
    await page.goto("/r/sample?lang=en&game=preview");
    await expect(page.getByTestId("bottleneck")).toBeVisible();
    await expect(page.getByTestId("game-entry")).toHaveCount(0);
    expect((await context.cookies()).find((c) => c.name === "tdg_game_preview")).toBeUndefined();
  });

  test("closing the owner preview takes the card away", async ({ page, context }) => {
    test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
    await grantOwnerPreview(context.request, "game");
    await page.goto("/r/sample?lang=en");
    await expect(page.getByTestId("game-entry")).toBeVisible();
    const off = await context.request.post("/admin/preview?game=off", {
      headers: { authorization: `Basic ${Buffer.from(`admin:${ADMIN_PASSWORD}`).toString("base64")}` },
      maxRedirects: 0,
    });
    expect(off.status()).toBe(303);
    expect((await context.cookies()).find((c) => c.name === "tdg_game_preview")).toBeUndefined();
    await page.goto("/r/sample?lang=en");
    await expect(page.getByTestId("game-entry")).toHaveCount(0);
  });
});

test.describe("the owner's preview opens the card for this browser", () => {
  test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);

  test("a signed, HttpOnly cookie — never the guessable \"1\" — and it carries across languages", async ({ page, context }) => {
    await grantOwnerPreview(context.request, "game");
    const cookie = (await context.cookies()).find((c) => c.name === "tdg_game_preview");
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.value).toMatch(/^[A-Za-z0-9_-]{43}$/);

    await page.goto("/r/sample?lang=en");
    await expect(page.getByTestId("game-entry")).toBeVisible();
    await page.goto("/r/sample?lang=fr");
    await expect(page.getByTestId("game-entry")).toBeVisible();
    await expect(page.getByTestId("game-entry").getByRole("heading", { level: 2 })).toHaveText(TITLE.fr);
  });
});

test.describe("P23 — the card on the sample's retention bottleneck", () => {
  // With the flag on, no cookie is needed; without it, the owner's preview
  // stands in.
  test.skip(!GAME_OPEN && !ADMIN_PASSWORD, SKIP_ADMIN_REASON);
  test.beforeEach(async ({ context }) => {
    if (!GAME_OPEN) await grantOwnerPreview(context.request, "game");
  });

  for (const locale of ["en", "fr"] as const) {
    test(`links to the ${locale} level with from=result, as a bare anchor`, async ({ page }) => {
      await page.goto(`/r/sample?lang=${locale}`);
      const card = page.getByTestId("game-entry");
      await expect(card).toBeVisible();
      await expect(card.getByRole("heading", { level: 2 })).toHaveText(TITLE[locale]);
      // The whole object of the game in the band: the churn, and the trust
      // that is missing from the dashboard.
      await expect(page.getByTestId("game-entry-band")).toContainText(locale === "fr" ? "6,0" : "6.0");
      const cta = page.getByTestId("game-entry-cta");
      await expect(cta).toHaveAttribute("href", `/${locale}/game/retention?from=result`);
      expect(await cta.evaluate((el) => el.tagName)).toBe("A");
      await expect(card).toHaveCount(1);
    });
  }

  /**
   * C33 (2026-10-01, decided by Antoine): « RÉSILIATIONS 6,0 % » is the
   * game's number, read under the reader's own, and nothing said so. The line
   * above the card does — outside the band, which keeps its one 44px line
   * (the desktop test below) and its two lines on a phone.
   */
  for (const [locale, width] of [["fr", 1280], ["en", 1280], ["fr", 390]] as const) {
    test(`says « in the game » right above the band (${locale}, ${width}px)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/r/sample?lang=${locale}`);
      const eyebrow = page.getByTestId("game-entry-eyebrow");
      await expect(eyebrow).toHaveText(EYEBROW[locale]);
      const above = await box(page, "game-entry-eyebrow");
      const band = await box(page, "game-entry-band");
      const card = await box(page, "game-entry");
      // On the line above the band, at the result's 10px section rhythm…
      expect(above.y + above.height).toBeLessThanOrEqual(band.y);
      expect(band.y - (above.y + above.height)).toBeLessThan(16);
      // …flush with the card's edge, as every section eyebrow is (the band
      // starts 2px further in, inside the card's border).
      expect(Math.abs(above.x - card.x)).toBeLessThan(1);
      // One line, even in French on a phone.
      expect(above.height).toBeLessThan(24);
    });
  }

  test("clicking fires game_entry_clicked/result/retention", async ({ page }) => {
    await page.goto(`/r/sample?lang=en`);
    // The level lives under the other root layout, so the click is a full
    // document load; hold it once to read the event where it was emitted.
    await page.evaluate(() =>
      document.addEventListener("click", (e) => e.preventDefault(), { capture: true, once: true }),
    );
    await page.getByTestId("game-entry-cta").click();
    await expect.poll(() => trackedEvents(page)).toContain("game_entry_clicked/result/retention");
  });

  /**
   * C10 (GAME-BRIEF §15.4, 2026-09-29): under the primary, on desktop as on
   * a phone. Above it, the card pushed a visitor's « Fais ton propre Tour »
   * 350px down. Non-vacuity, measured 2026-09-30: the old source order (the
   * card before the CTA row) fails the `cta.y` line.
   */
  test("desktop: in the right column, under the CTA row — the primary comes first", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`/r/sample?lang=en`);
    const move = await box(page, "priority-move");
    const entry = await box(page, "game-entry");
    const cta = await box(page, "own-tour-cta");
    const share = await box(page, "share-card");
    // Same column as the action card, never the share block's.
    expect(Math.abs(entry.x - move.x)).toBeLessThan(2);
    expect(entry.x).toBeGreaterThan(share.x + share.width);
    expect(entry.y).toBeGreaterThan(move.y + move.height);
    expect(cta.y + cta.height).toBeLessThan(entry.y);
    // Wide enough for the band on one line, separator included — in the
    // longer language.
    await page.goto(`/r/sample?lang=fr`);
    await expect(page.getByTestId("game-entry-band-sep")).toBeVisible();
    // …with the game's mountain in front of it (design I + B, 2026-09-29).
    await expect(page.getByTestId("game-entry-band-picto")).toBeVisible();
    expect((await box(page, "game-entry-band")).height).toBeLessThanOrEqual(44);
  });

  test("phone: right after the share card, and nothing overflows", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/r/sample?lang=fr`);
    const share = await box(page, "share-card");
    const entry = await box(page, "game-entry");
    const cta = await box(page, "own-tour-cta");
    // The primary first, then the share block, then the card (C10).
    expect(cta.y).toBeLessThan(share.y);
    expect(cta.y).toBeLessThan(entry.y);
    expect(entry.y).toBeGreaterThan(share.y + share.height);
    // Directly after it: the layout's 22px rhythm, then the card's own
    // eyebrow (C33) and the card — nothing else in between.
    const eyebrow = await box(page, "game-entry-eyebrow");
    expect(eyebrow.y - (share.y + share.height)).toBeLessThan(30);
    expect(entry.y - (eyebrow.y + eyebrow.height)).toBeLessThan(16);
    // The band stacks on a narrow card instead of wrapping, so the "·"
    // cannot be left dangling at the end of a line (seen in a capture).
    await expect(page.getByTestId("game-entry-band-sep")).toBeHidden();
    // Two lines, never three: at this width the mountain gives its place
    // back, or the longer item wraps and squeezes the empty cell (74px).
    await expect(page.getByTestId("game-entry-band-picto")).toBeHidden();
    expect((await box(page, "game-entry-band")).height).toBeLessThanOrEqual(56);
    const { sw, cw } = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(sw).toBe(cw);
  });

  test("a 360px Android phone: the French band still holds on two lines", async ({ page }) => {
    // Out of the 375-430 contract, but a common width. Before 2026-09-29 the
    // band went to three lines here (74px), « pas sur ton / dashboard » cut
    // in two — the non-vacuity of this test, measured on that build.
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(`/r/sample?lang=fr`);
    expect((await box(page, "game-entry-band")).height).toBeLessThanOrEqual(56);
    const { sw, cw } = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(sw).toBe(cw);
  });
});

test.describe("accessibility with the card on screen", () => {
  test.skip(!GAME_OPEN && !ADMIN_PASSWORD, SKIP_ADMIN_REASON);
  test.beforeEach(async ({ context }) => {
    if (!GAME_OPEN) await grantOwnerPreview(context.request, "game");
  });

  for (const [name, viewport] of [
    ["desktop", { width: 1280, height: 900 }],
    ["phone", { width: 390, height: 844 }],
  ] as const) {
    test(`axe finds no serious or critical violation in the card (${name})`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(`/r/sample?lang=fr`);
      await expect(page.getByTestId("game-entry")).toBeVisible();
      const results = await new AxeBuilder({ page }).include('[data-testid="game-entry"]').analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious, JSON.stringify(serious.map((v) => [v.id, v.nodes.map((n) => n.html)]), null, 2)).toEqual([]);
      // Non-vacuity: the scan actually looked at the card.
      expect(results.passes.length + results.violations.length).toBeGreaterThan(3);
    });
  }
});
