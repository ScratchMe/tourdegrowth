import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test, trackedEvents } from "./helpers";

/**
 * The game card on the result page — GAME-BRIEF.md 13.3 A, game plan G5b:
 * P23 (the sample's retention bottleneck shows the card), the closed game
 * (no card, nothing in the payload), the preview cookie, the placement on
 * each layout, the event, and an accessibility pass with the card on screen.
 *
 * P24 and P25 — a real result whose bottleneck is acquisition, and one with a
 * Deep dive — need a Firestore document, which CI does not have. They are
 * pinned on the pure resolver (`r/[id]/__tests__/game-entry.test.ts`) and the
 * page is held to that resolver by `src/__tests__/game-entry-wiring.test.ts`
 * (orchestrator decision 3, 2026-09-24: no fixture route on the public page).
 *
 * The flag has two states and a run sees one of them. CI builds and serves
 * the game OPEN (`GAME_ENABLED: "true"` at workflow level, like
 * game-flag.spec.ts), so the "closed" specs skip there with a message; a local
 * run without the variable exercises them. The preview specs hold in both.
 */
const GAME_OPEN = process.env.GAME_ENABLED === "true";

const TITLE = { en: "The dark side of retention", fr: "Le côté obscur de la rétention" } as const;

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

  test("?game=off clears the preview, and the card goes with it", async ({ page, context }) => {
    await page.goto("/r/sample?lang=en&game=preview");
    await expect(page.getByTestId("game-entry")).toBeVisible();
    await page.goto("/r/sample?lang=en&game=off");
    expect((await context.cookies()).find((c) => c.name === "tdg_game_preview")).toBeUndefined();
    await expect(page.getByTestId("game-entry")).toHaveCount(0);
  });
});

test.describe("the preview cookie opens the card for this browser", () => {
  test("?game=preview shows it on the same request, and the cookie keeps it", async ({ page, context }) => {
    // The proxy folds the parameter into the incoming Cookie header, so the
    // very request that sets the cookie already renders the card.
    await page.goto("/r/sample?lang=en&game=preview");
    await expect(page.getByTestId("game-entry")).toBeVisible();
    expect((await context.cookies()).find((c) => c.name === "tdg_game_preview")?.value).toBe("1");

    await page.goto("/r/sample?lang=fr");
    await expect(page.getByTestId("game-entry")).toBeVisible();
    await expect(page.getByTestId("game-entry").getByRole("heading", { level: 2 })).toHaveText(TITLE.fr);
  });
});

test.describe("P23 — the card on the sample's retention bottleneck", () => {
  // With the flag on, no cookie is needed; without it, the preview stands in.
  const suffix = GAME_OPEN ? "" : "&game=preview";

  for (const locale of ["en", "fr"] as const) {
    test(`links to the ${locale} level with from=result, as a bare anchor`, async ({ page }) => {
      await page.goto(`/r/sample?lang=${locale}${suffix}`);
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

  test("clicking fires game_entry_clicked/result/retention", async ({ page }) => {
    await page.goto(`/r/sample?lang=en${suffix}`);
    // The level lives under the other root layout, so the click is a full
    // document load; hold it once to read the event where it was emitted.
    await page.evaluate(() =>
      document.addEventListener("click", (e) => e.preventDefault(), { capture: true, once: true }),
    );
    await page.getByTestId("game-entry-cta").click();
    await expect.poll(() => trackedEvents(page)).toContain("game_entry_clicked/result/retention");
  });

  test("desktop: in the right column, after the evidence and before the CTA row", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`/r/sample?lang=en${suffix}`);
    const move = await box(page, "priority-move");
    const entry = await box(page, "game-entry");
    const cta = await box(page, "own-tour-cta");
    const share = await box(page, "share-card");
    // Same column as the action card, never the share block's.
    expect(Math.abs(entry.x - move.x)).toBeLessThan(2);
    expect(entry.x).toBeGreaterThan(share.x + share.width);
    expect(entry.y).toBeGreaterThan(move.y + move.height);
    expect(entry.y + entry.height).toBeLessThan(cta.y);
    // Wide enough for the band on one line, separator included — in the
    // longer language.
    await page.goto(`/r/sample?lang=fr${suffix}`);
    await expect(page.getByTestId("game-entry-band-sep")).toBeVisible();
    expect((await box(page, "game-entry-band")).height).toBeLessThanOrEqual(44);
  });

  test("phone: right after the share card, and nothing overflows", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/r/sample?lang=fr${suffix}`);
    const share = await box(page, "share-card");
    const entry = await box(page, "game-entry");
    const cta = await box(page, "own-tour-cta");
    expect(cta.y).toBeLessThan(share.y);
    expect(entry.y).toBeGreaterThan(share.y + share.height);
    // Directly after it: the layout's 22px rhythm, nothing in between.
    expect(entry.y - (share.y + share.height)).toBeLessThan(30);
    // The band stacks on a narrow card instead of wrapping, so the "·"
    // cannot be left dangling at the end of a line (seen in a capture).
    await expect(page.getByTestId("game-entry-band-sep")).toBeHidden();
    const { sw, cw } = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(sw).toBe(cw);
  });
});

test.describe("accessibility with the card on screen", () => {
  const suffix = GAME_OPEN ? "" : "&game=preview";

  for (const [name, viewport] of [
    ["desktop", { width: 1280, height: 900 }],
    ["phone", { width: 390, height: 844 }],
  ] as const) {
    test(`axe finds no serious or critical violation in the card (${name})`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(`/r/sample?lang=fr${suffix}`);
      await expect(page.getByTestId("game-entry")).toBeVisible();
      const results = await new AxeBuilder({ page }).include('[data-testid="game-entry"]').analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious, JSON.stringify(serious.map((v) => [v.id, v.nodes.map((n) => n.html)]), null, 2)).toEqual([]);
      // Non-vacuity: the scan actually looked at the card.
      expect(results.passes.length + results.violations.length).toBeGreaterThan(3);
    });
  }
});
