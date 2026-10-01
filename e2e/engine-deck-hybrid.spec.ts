import type { Page } from "@playwright/test";
import { QUESTIONS } from "../src/content/copy-library";
import { ENGINE_COPY } from "../src/content/engine-copy";
import { hybridState, salesAssistedState, tourResult } from "../src/lib/engine/__tests__/fixtures";
import type { EngineState } from "../src/lib/engine/types";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, readEachOnScreen, SKIP_ADMIN_REASON, test } from "./helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The deck with sales-assisted ticked (engine spec §18.8, §18.10.3, A7.3.c
 * S4): the §18.9 hybrid with three levers moved and a linked Tour, then
 * sales-assisted alone. The same guards as the v1 deck (engine-deck.spec.ts)
 * — filled templates in the three families' glyphs, every body above its
 * footer, nothing under 18px, one 16:9 PDF page per included slide with only
 * the three families embedded — on every slide the two motions add, plus
 * what is the hybrid's own: the total first, the thumbnails under four
 * headings, the unit economics in two columns, self-serve first.
 */

const TOUR = tourResult(Object.fromEntries(QUESTIONS.map((q, i) => [q.id, (i % 3) as 0 | 1 | 2])));

function hybridStore(): { schemaVersion: 2; state: EngineState } {
  const state: EngineState = { ...hybridState(), whatIf: { "act.rate": 24, "slg.rev.win-rate": 30, "link.pql-handoff": 40 } };
  state.tourLink = { resultId: TOUR.id, linkedAt: "2026-09-24T09:00:00.000Z" };
  return { schemaVersion: 2, state };
}

async function openDeck(page: Page, locale: "fr" | "en", store: { schemaVersion: 2; state: EngineState }) {
  await page.clock.setFixedTime(new Date(2026, 8, 24, 12));
  await page.addInitScript(
    ([s, tour]) => {
      if (sessionStorage.getItem("e2e-engine-seeded")) return;
      localStorage.setItem("tdg.engine.v2", JSON.stringify(s));
      localStorage.setItem("tdg.results.v1", JSON.stringify([tour]));
      sessionStorage.setItem("e2e-engine-seeded", "1");
    },
    [store, TOUR] as const,
  );
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await page.getByTestId("engine-open-deck").click();
  await expect(page.getByTestId("engine-deck")).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

/** Parses the few things a Chromium PDF says in plain text: its pages and its fonts (engine-deck.spec.ts). */
function readPdf(bytes: Buffer) {
  const text = bytes.toString("latin1");
  const pages = [...text.matchAll(/\/Type\s*\/Page(?![s\w])/g)].length;
  const fonts = [...new Set([...text.matchAll(/\/(?:BaseFont|FontName)\s*\/([^\s/<>[\]]+)/g)].map((f) => f[1]!.replace(/^[A-Z]{6}\+/, "")))];
  return { pages, fonts };
}

for (const locale of ["fr", "en"] as const) {
  test.describe(`hybrid deck (${locale})`, () => {
    test("the total first, each motion's slides under its heading, the shared ones last", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await openDeck(page, locale, hybridStore());
      await expect(page.getByTestId("slide-total")).toBeVisible();
      const groups = await page.locator('[data-testid^="deck-group-"]').evaluateAll((els) => els.map((e) => e.getAttribute("data-testid")));
      expect(groups).toEqual(["deck-group-total", "deck-group-plg", "deck-group-slg", "deck-group-end"]);
      // The group's own heading, not the slide titles inside it.
      await expect(page.getByTestId("deck-group-plg").locator(":scope > h3")).toHaveText(ENGINE_COPY.hybrid.motionName.plg[locale]);
      await expect(page.getByTestId("deck-group-end").locator(":scope > h3")).toHaveText(ENGINE_COPY.deck.groupEnd[locale]);
      await expect(page.getByTestId("deck-group-slg").locator('[data-testid^="deck-thumb-"]')).toHaveCount(5);
      // A motion's slide wears its name in its kicker; a shared one doesn't.
      await expect(page.getByTestId("slide-slg:peloton").locator("header p").first()).toContainText(ENGINE_COPY.hybrid.motionAdjective.slg[locale]);
      await expect(page.getByTestId("slide-visibility").locator("header p").first()).not.toContainText(ENGINE_COPY.hybrid.motionAdjective.slg[locale]);
    });

    test("unit economics: two columns, self-serve then sales-assisted, whatever their values", async ({ page }) => {
      await openDeck(page, locale, hybridStore());
      const plg = await page.getByTestId("slide-unit-col-plg").boundingBox();
      const slg = await page.getByTestId("slide-unit-col-slg").boundingBox();
      expect(plg!.x).toBeLessThan(slg!.x);
      await expect(page.getByTestId("slide-unit-table").locator("tbody tr")).toHaveCount(5);
      const blocks = await page.locator('[data-testid^="slide-total-p"], [data-testid^="slide-total-s"]').evaluateAll((els) => els.map((e) => e.getAttribute("data-testid")));
      expect(blocks.filter((id) => id === "slide-total-plg" || id === "slide-total-slg")).toEqual(["slide-total-plg", "slide-total-slg"]);
    });

    test("every slide prints filled templates in the brand's glyphs only", async ({ page }) => {
      await openDeck(page, locale, hybridStore());
      await page.getByTestId("deck-include-mirror").check();
      const texts = await readEachOnScreen(page, page.locator("[data-slide]"), (el) => [el.getAttribute("data-slide"), (el as HTMLElement).innerText] as const);
      expect(texts.map(([id]) => id)).toContain("slg:scenario");
      const allowed = /^[\n\t -~ -ÿ–—’«»…€·×÷±]*$/u;
      for (const [id, text] of texts) {
        expect(text.length, `${id} is empty`).toBeGreaterThan(80);
        expect(text, `${id} leaks a placeholder`).not.toMatch(/\{[a-zA-Z]+\}/);
        expect(text, `${id} prints accent marks`).not.toContain("**");
        expect(text, `${id} prints a missing value`).not.toMatch(/\bundefined\b|\bNaN\b|\bnull\b/);
        expect([...new Set([...text].filter((ch) => !allowed.test(ch)))], `${id} prints glyphs outside the three families`).toEqual([]);
      }
    });

    test("every slide's body ends above its footer, and nothing is set under 18px", async ({ page }) => {
      await openDeck(page, locale, hybridStore());
      await page.getByTestId("deck-include-mirror").check();
      const clashes = await page.locator("[data-slide]").evaluateAll((slides) =>
        slides.flatMap((slide) => {
          const box = slide.getBoundingClientRect();
          const scale = box.width / 1920;
          const y = (el: Element) => (el.getBoundingClientRect().bottom - box.top) / scale;
          const foot = slide.querySelector("footer")!;
          const footTop = (foot.getBoundingClientRect().top - box.top) / scale;
          const deepest = Math.max(...[...foot.previousElementSibling!.querySelectorAll("*")].map(y));
          return deepest > footTop ? [`${slide.getAttribute("data-slide")}: body ends at ${Math.round(deepest)}, footer starts at ${Math.round(footTop)}`] : [];
        }),
      );
      expect(clashes).toEqual([]);
      const sizes = await page.locator("[data-slide]").evaluateAll((slides) =>
        slides.flatMap((slide) =>
          [...slide.querySelectorAll("*")]
            .filter((el) => [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim()))
            .map((el) => ({ where: `${slide.getAttribute("data-slide")}: ${el.textContent!.trim().slice(0, 30)}`, px: parseFloat(getComputedStyle(el).fontSize) })),
        ),
      );
      expect(sizes.length).toBeGreaterThan(300);
      expect(sizes.filter((s) => s.px < 18).map((s) => `${s.where} (${s.px}px)`)).toEqual([]);
    });

    test("PDF: one page per included slide, the total among them, only the three families embedded", async ({ page }) => {
      await page.addInitScript(() => {
        window.print = () => undefined;
      });
      await openDeck(page, locale, hybridStore());
      const expected = await page.locator('[data-print="thumb"][data-included="true"]').count();
      // The total, the relays, sales-assisted's leak and three what-ifs and the « together » are in: at least 17 pages.
      expect(expected).toBeGreaterThanOrEqual(17);
      const pdf = readPdf(await page.pdf({ preferCSSPageSize: true, printBackground: true }));
      expect(pdf.pages).toBe(expected);
      for (const font of pdf.fonts) expect(font, `unexpected font ${font}`).toMatch(/Stardos|Inter|Plex/i);
      for (const family of [/Stardos/i, /Inter/i, /Plex/i]) expect(pdf.fonts.some((f) => family.test(f))).toBe(true);
    });
  });

  test(`sales-assisted alone (${locale}): no total, no self-serve slide, no group heading`, async ({ page }) => {
    await openDeck(page, locale, { schemaVersion: 2, state: salesAssistedState() });
    const ids = await page.locator("[data-slide]").evaluateAll((els) => els.map((e) => e.getAttribute("data-slide")));
    expect(ids[0]).toBe("slg:peloton");
    expect(ids).not.toContain("total");
    for (const id of ["peloton", "leak", "scenario"]) expect(ids).not.toContain(id);
    await expect(page.locator('[data-testid^="deck-group-"]')).toHaveCount(0);
  });
}
