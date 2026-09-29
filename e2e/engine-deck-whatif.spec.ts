import type { Page } from "@playwright/test";
import type { EngineState, LeverId } from "../src/lib/engine/types";
import { exampleState } from "../src/lib/engine/__tests__/fixtures";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The what-if slides (Antoine, 2026-09-26): one slide per lever moved, and
 * one for all of them together from two. The numbers are the pure model's
 * (lib/engine/__tests__/deck.test.ts); what only the rendered deck can say is
 * here — that a target moved on the board becomes a slide, that the slides
 * sit where the model puts them, that eight levers still fit a 1920 × 1080
 * page with nothing under 18px (A2.1, 2026-09-29), and that they print in
 * the three embedded families only.
 */

const STORAGE_KEY = "tdg.engine.v1";

/** Every lever the example knows, moved: the densest « together » slide the deck can print. */
const ALL_LEVERS: Record<LeverId, number> = {
  "acq.signup-rate": 4,
  "ref.referred-share": 10,
  "act.rate": 24,
  "rev.paid-conversion": 10,
  "ret.logo-churn": 1.5,
  "rev.contraction": 0.5,
  "rev.expansion": 5,
  "rev.arpa": 150,
};

async function openDeckWith(page: Page, locale: "fr" | "en", whatIf: EngineState["whatIf"]): Promise<void> {
  const state = { ...exampleState(), whatIf };
  await page.addInitScript(
    ([key, store]) => {
      if (sessionStorage.getItem("e2e-engine-seeded")) return;
      localStorage.setItem(key, JSON.stringify(store));
      sessionStorage.setItem("e2e-engine-seeded", "1");
    },
    [STORAGE_KEY, { schemaVersion: 1, state }] as const,
  );
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await page.getByTestId("engine-open-deck").click();
  await expect(page.getByTestId("engine-deck")).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

const thumbOrder = (page: Page) =>
  page.locator('[data-print="thumb"]').evaluateAll((els) => els.map((el) => el.getAttribute("data-testid")!.replace("deck-thumb-", "")));

for (const locale of ["fr", "en"] as const) {
  test.describe(`what-if slides (${locale})`, () => {
    test("two levers: one slide each after the leak, in lever order, then « together »", async ({ page }) => {
      // Typed in the reverse order: the deck follows the levers' order, not the typing.
      await openDeckWith(page, locale, { "ret.logo-churn": 1.5, "act.rate": 24 });
      expect(await thumbOrder(page)).toEqual([
        "peloton",
        "leak",
        "whatif:act.rate",
        "whatif:ret.logo-churn",
        "scenario",
        "visibility",
        "unit-economics",
        // No Tour linked, so no mirror slide to offer.
        "ask",
        // The appendix on its two pages (A2.1).
        "annex",
        "annex:2",
      ]);
      for (const id of ["whatif:act.rate", "whatif:ret.logo-churn", "scenario"]) {
        await expect(page.getByTestId(`deck-thumb-${id}`)).toHaveAttribute("data-included", "true");
      }
      // Each lever's slide carries its two tables; « together » names both levers.
      await expect(page.getByTestId("slide-kpis-whatif:act.rate")).toBeVisible();
      await expect(page.getByTestId("slide-funnel-whatif:act.rate")).toBeVisible();
      await expect(page.getByTestId("slide-scenario-levers").locator('[data-testid^="slide-lever-"]')).toHaveCount(2);
      await expect(page.getByTestId("slide-scenario-together")).toBeVisible();
    });

    test("a what-if slide can be left out, and gives up its number", async ({ page }) => {
      await openDeckWith(page, locale, { "act.rate": 24 });
      expect(await thumbOrder(page)).not.toContain("scenario");
      await page.getByTestId("deck-include-whatif:act.rate").uncheck();
      await expect(page.getByTestId("deck-thumb-whatif:act.rate")).toHaveAttribute("data-included", "false");
      await expect(page.getByTestId("slide-page-visibility")).toHaveText(/^3\//);
    });

    test("every lever moved: each body ends above its footer, and prints the brand's glyphs only", async ({ page }) => {
      await openDeckWith(page, locale, ALL_LEVERS);
      const ids = (await thumbOrder(page)).filter((id) => id.startsWith("whatif:") || id === "scenario");
      // Non-vacuity: the eight levers and « together », not an empty list that passes by being empty.
      expect(ids).toHaveLength(9);
      await expect(page.getByTestId("slide-scenario-levers").locator('[data-testid^="slide-lever-"]')).toHaveCount(8);

      const measured = await page.locator('[data-slide^="whatif:"], [data-slide="scenario"]').evaluateAll((slides) =>
        slides.map((slide) => {
          const box = slide.getBoundingClientRect();
          const scale = box.width / 1920;
          const y = (el: Element) => (el.getBoundingClientRect().bottom - box.top) / scale;
          const foot = slide.querySelector("footer")!;
          const footTop = (foot.getBoundingClientRect().top - box.top) / scale;
          const body = foot.previousElementSibling!;
          const deepest = Math.max(...[...body.querySelectorAll("*")].map(y));
          // The smallest size set on any element with text of its own (A2.1: nothing under 18px on a slide).
          const smallest = Math.min(
            ...[...slide.querySelectorAll("*")]
              .filter((el) => [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim()))
              .map((el) => parseFloat(getComputedStyle(el).fontSize)),
          );
          return { id: slide.getAttribute("data-slide")!, deepest: Math.round(deepest), footTop: Math.round(footTop), smallest, text: (slide as HTMLElement).innerText };
        }),
      );
      expect(measured).toHaveLength(9);
      const clashes = measured.filter((m) => m.deepest > m.footTop).map((m) => `${m.id}: body ends at ${m.deepest}, footer starts at ${m.footTop}`);
      expect(clashes).toEqual([]);
      // The assumptions footer, the table heads and the levers' moves were 15, 14 and 16px before A2.1.
      expect(measured.filter((m) => m.smallest < 18).map((m) => `${m.id}: ${m.smallest}px`)).toEqual([]);

      // Engine spec §10.4: printable Latin-1 plus – — ’ « » … € · × ÷ ±. A U+2212 minus or a typed « → » is outside it.
      const allowed = /^[\n\t -~ -ÿ–—’…€]*$/u;
      for (const { id, text } of measured) {
        expect(text, `${id} leaks a placeholder`).not.toMatch(/\{[a-zA-Z]+\}/);
        expect(text, `${id} prints accent marks`).not.toContain("**");
        expect(text, `${id} prints a missing value`).not.toMatch(/\bundefined\b|\bNaN\b|\bnull\b/);
        expect([...new Set([...text].filter((ch) => !allowed.test(ch)))], `${id} prints glyphs outside the three families`).toEqual([]);
      }
    });
  });
}

test("a target moved on the board's slider becomes a slide", async ({ page }) => {
  await page.addInitScript(
    ([key, store]) => {
      if (sessionStorage.getItem("e2e-engine-seeded")) return;
      localStorage.setItem(key, JSON.stringify(store));
      sessionStorage.setItem("e2e-engine-seeded", "1");
    },
    [STORAGE_KEY, { schemaVersion: 1, state: exampleState() }] as const,
  );
  await page.goto("/fr/aarrr-funnel-template");
  await expect(page.getByTestId("engine-board")).toBeVisible();
  await page.getByTestId("engine-board-whatif").locator(":scope > summary").click();
  await page.getByTestId("whatif-slider-act.rate").focus();
  for (let i = 0; i < 3; i += 1) await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("whatif-value-act.rate")).toHaveText(/^21\s?%$/);

  await page.getByTestId("engine-open-deck").click();
  await expect(page.getByTestId("engine-deck")).toBeVisible();
  const order = await thumbOrder(page);
  expect(order.filter((id) => id.startsWith("whatif:") || id === "scenario")).toEqual(["whatif:act.rate"]);
  await expect(page.getByTestId("deck-thumb-whatif:act.rate").locator("h3")).toContainText("21");
});
