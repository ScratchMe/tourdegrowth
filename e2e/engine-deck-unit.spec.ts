import type { Page } from "@playwright/test";
import type { EngineState } from "../src/lib/engine/types";
import { exampleState, filmState, hybridLossState, hybridNoMarginState, hybridState, measured as entry, noMarginState, ratio, salesAssistedState, withEntry } from "../src/lib/engine/__tests__/fixtures";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, readEachOnScreen, SKIP_ADMIN_REASON, test } from "./helpers";
import { engineSeed } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The unit-economics slide with the money (design system extension 09, Q12,
 * A20.d T4.c). The numbers are the pure model's (lib/engine/__tests__/
 * deck.test.ts) and the picture's geometry is tested in lib/viz; what only
 * the rendered deck can say is here — that a certain loss puts the slide at
 * nº 2, that the six tiles and the picture fit the 1920 × 1080 page above
 * its footer with nothing under 18px, that the loss stays ink, and that the
 * warning wears the advice's dashed edge — in both languages, on a desktop
 * and on a phone, where the slide is scaled whole.
 */

/** The film's SaaS with churn at 2 %: counted 36 months, a CAC of 2 900 € paid back in 32 — no loss, past the 30-month floor. */
const late = () => withEntry(withEntry(filmState(), "ret.logo-churn", entry(ratio(8, 400))), "acq.cac", entry({ kind: "amount", amount: 2_900 }));

async function openDeck(page: Page, locale: "fr" | "en", state: EngineState): Promise<void> {
  await page.addInitScript(
    (items) => {
      if (sessionStorage.getItem("e2e-engine-seeded")) return;
      for (const [key, value] of items) localStorage.setItem(key, value);
      sessionStorage.setItem("e2e-engine-seeded", "1");
    },
    engineSeed(state),
  );
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await page.getByTestId("engine-open-deck").click();
  await expect(page.getByTestId("engine-deck")).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

const thumbOrder = (page: Page) =>
  page.locator('[data-print="thumb"]').evaluateAll((els) => els.map((el) => el.getAttribute("data-testid")!.replace("deck-thumb-", "")));

/** The unit slide measured on its 1 920 canvas: the body's deepest box, the footer's top, the smallest type with text of its own. */
async function measure(page: Page) {
  const [m] = await readEachOnScreen(page, page.locator('[data-slide="unit-economics"]'), (slide) => {
    const box = slide.getBoundingClientRect();
    const scale = box.width / 1920;
    const foot = slide.querySelector("footer")!;
    const footTop = (foot.getBoundingClientRect().top - box.top) / scale;
    const body = foot.previousElementSibling!;
    const titleBottom = (slide.querySelector("h3")!.getBoundingClientRect().bottom - box.top) / scale;
    // The body's first box: a centred body taller than its room spills up under the title as well as down.
    const top = Math.min(...[...body.querySelectorAll("*")].filter((el) => !el.parentElement?.closest("svg")).map((el) => (el.getBoundingClientRect().top - box.top) / scale));
    // The <svg> as a whole, not its shapes: off screen a thumbnail leaves them unlaid (A20.d T4.b).
    const deepest = Math.max(...[...body.querySelectorAll("*")].filter((el) => !el.parentElement?.closest("svg")).map((el) => (el.getBoundingClientRect().bottom - box.top) / scale));
    const right = Math.max(...[...body.querySelectorAll("*")].filter((el) => !el.closest("svg") || el.tagName === "text").map((el) => (el.getBoundingClientRect().right - box.left) / scale));
    const smallest = Math.min(
      ...[...slide.querySelectorAll("*")]
        .filter((el) => [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim()))
        .map((el) => parseFloat(getComputedStyle(el).fontSize)),
    );
    return { deepest: Math.round(deepest), footTop: Math.round(footTop), top: Math.round(top), titleBottom: Math.round(titleBottom), right: Math.round(right), smallest, text: (slide as HTMLElement).innerText };
  });
  return m!;
}

for (const locale of ["fr", "en"] as const) {
  for (const width of [1280, 390] as const) {
    test.describe(`unit economics (${locale}, ${width})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width, height: width === 1280 ? 900 : 844 });
      });

      test("a certain loss: nº 2, titled by the loss in ink, the picture says it, everything above the footer", async ({ page }) => {
        await openDeck(page, locale, filmState());
        expect((await thumbOrder(page)).slice(0, 3)).toEqual(["peloton", "unit-economics", "leak"]);
        await expect(page.getByTestId("slide-page-unit-economics")).toHaveText(/^2\//);
        const slide = page.locator('[data-slide="unit-economics"]');
        await expect(slide.locator("h3").first()).toContainText(locale === "fr" ? "on perd ~400 € sur chacun" : "we lose ~€400 on each one");
        // Ink, never red (C53): the title carries no accent span.
        await expect(slide.locator('h3 [class*="accent"]')).toHaveCount(0);
        await expect(slide.locator('[data-testid^="slide-figure-"]')).toHaveCount(6);
        await expect(slide.getByTestId("slide-figure-after")).toContainText(locale === "fr" ? "–4 mois" : "–4 months");
        await expect(slide.getByTestId("slide-figure-cash")).toContainText(locale === "fr" ? "ne revient pas toute" : "does not all come back");
        const chart = slide.getByTestId("slide-payback-chart");
        await expect(chart).toHaveAttribute("data-story", "loss");
        await expect(chart.getByTestId("slide-payback-chart-short")).toHaveText(locale === "fr" ? "il manque ~400 €" : "~€400 short");
        await expect(slide.getByTestId("slide-unit-warning")).toHaveCount(0);
        await expect(slide.getByTestId("slide-unit-retention")).toBeVisible();

        const m = await measure(page);
        expect(m.deepest, "the body ends above the footer").toBeLessThanOrEqual(m.footTop);
        expect(m.right, "nothing runs past the slide's right margin").toBeLessThanOrEqual(1920 - 120 + 2);
        expect(m.smallest, "nothing under 18px").toBeGreaterThanOrEqual(18);
        expect(m.text).not.toMatch(/\{[a-zA-Z]+\}|\bundefined\b|\bNaN\b|\*\*/);
      });

      test("a payback of 30 months or more, no loss: the v1 title, the warning in the advice's dashed edge", async ({ page }) => {
        await openDeck(page, locale, late());
        expect((await thumbOrder(page)).indexOf("unit-economics")).toBe(3);
        const slide = page.locator('[data-slide="unit-economics"]');
        const warning = slide.getByTestId("slide-unit-warning");
        await expect(warning).toHaveText(
          locale === "fr" ? "Rembourser un client prend 32 mois : 30 mois ou plus. Nous gagnons de l'argent, mais tard." : "Paying back a customer takes 32 months: 30 months or more. We make money, but late.",
        );
        expect(await warning.evaluate((el) => getComputedStyle(el).borderLeftStyle)).toBe("dashed");
        await expect(slide.getByTestId("slide-payback-chart")).toHaveAttribute("data-story", "pays-back");
        await expect(slide.getByTestId("slide-payback-chart-after")).toHaveText(locale === "fr" ? "~4 mois de marge après" : "~4 months of margin after");
        const m = await measure(page);
        expect(m.deepest).toBeLessThanOrEqual(m.footTop);
        expect(m.right).toBeLessThanOrEqual(1920 - 120 + 2);
        expect(m.smallest).toBeGreaterThanOrEqual(18);
      });

      test("no margin: « ? » tiles that say what is missing, the « ? » box under a known cost", async ({ page }) => {
        // The example without the margin C50 gave it.
        await openDeck(page, locale, noMarginState());
        const slide = page.locator('[data-slide="unit-economics"]');
        await expect(slide.getByTestId("slide-figure-cash")).toContainText("?");
        await expect(slide.getByTestId("slide-payback-chart")).toHaveAttribute("data-story", "unknown");
        await expect(slide.getByTestId("slide-payback-chart-unknown")).toHaveText(locale === "fr" ? "il manque la marge brute" : "missing: gross margin");
        const m = await measure(page);
        expect(m.deepest).toBeLessThanOrEqual(m.footTop);
      });

      test("the built-in example (C50): its estimated margin gives its money in ranges — healthy, in its place, no warning", async ({ page }) => {
        await openDeck(page, locale, exampleState());
        expect((await thumbOrder(page)).indexOf("unit-economics")).toBeGreaterThan(1);
        const slide = page.locator('[data-slide="unit-economics"]');
        await expect(slide.getByTestId("slide-figure-payback")).toContainText(locale === "fr" ? "5 à 6 mois" : "5–6 months");
        await expect(slide.getByTestId("slide-figure-ltv")).toContainText(locale === "fr" ? "~3 000 € à 3 500 €" : "~€3,000–3,500");
        await expect(slide.getByTestId("slide-payback-chart")).toHaveAttribute("data-story", "pays-back");
        await expect(slide.getByTestId("slide-unit-warning")).toHaveCount(0);
        const m = await measure(page);
        expect(m.deepest).toBeLessThanOrEqual(m.footTop);
        expect(m.right).toBeLessThanOrEqual(1920 - 120 + 2);
        expect(m.smallest).toBeGreaterThanOrEqual(18);
        expect(m.text).not.toMatch(/\{[a-zA-Z]+\}|\bundefined\b|\bNaN\b|\*\*/);
      });
    });
  }

  test(`sales-assisted alone, a payback past 36 months (${locale}): nº 2, no thread off the plot, nothing past the margin`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openDeck(page, locale, withEntry(salesAssistedState(), "slg.rev.gross-margin", entry(ratio(10, 100))));
    expect((await thumbOrder(page)).slice(0, 3)).toEqual(["slg:peloton", "unit-economics", "slg:leak"]);
    const chart = page.locator('[data-slide="unit-economics"]').getByTestId("slide-payback-chart");
    await expect(chart).toHaveAttribute("data-story", "loss");
    await expect(chart.getByTestId("slide-payback-chart-pays-back")).toHaveText(locale === "fr" ? "rembourserait à 95 mois" : "would pay back at 95 months");
    const m = await measure(page);
    expect(m.deepest).toBeLessThanOrEqual(m.footTop);
    expect(m.right).toBeLessThanOrEqual(1920 - 120 + 2);
  });
}

/**
 * The hybrid, side by side (A20.d T4.d): each engine its column, its tiles
 * and its picture, never summed; a certain loss on either side titles the
 * slide in ink and moves it right after the total.
 */
for (const locale of ["fr", "en"] as const) {
  for (const width of [1280, 390] as const) {
    test.describe(`unit economics, the hybrid (${locale}, ${width})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width, height: width === 1280 ? 900 : 844 });
      });

      test("self-serve loses, sales-assisted pays back: nº 2 after the total, two columns, two pictures, everything in its room", async ({ page }) => {
        await openDeck(page, locale, hybridLossState());
        expect((await thumbOrder(page)).slice(0, 3)).toEqual(["total", "unit-economics", "peloton"]);
        const slide = page.locator('[data-slide="unit-economics"]');
        await expect(slide.locator("h3").first()).toHaveText(
          locale === "fr" ? "Libre-service : on perd ~400 € par nouveau client. Assisté : remboursé en 13 mois." : "Self-serve: we lose ~€400 on each new customer. Sales-assisted: paid back in 13 months.",
        );
        await expect(slide.locator('h3 [class*="accent"]')).toHaveCount(0);
        for (const motion of ["plg", "slg"] as const) await expect(slide.getByTestId(`slide-unit-${motion}`).locator('[data-testid^="slide-figure-"]')).toHaveCount(5);
        await expect(slide.getByTestId("slide-payback-chart-plg")).toHaveAttribute("data-story", "loss");
        await expect(slide.getByTestId("slide-payback-chart-slg")).toHaveAttribute("data-story", "pays-back");
        await expect(slide.getByTestId("slide-payback-chart-plg-time")).toHaveText(locale === "fr" ? "part vers 17 mois ; rembourserait à 21 mois" : "leaves at ~17 months; would pay back at 21 months");
        await expect(slide.getByTestId("slide-figure-plg-cash")).toContainText(locale === "fr" ? "ne revient pas toute" : "does not all come back");
        await expect(slide.getByTestId("slide-unit-note")).toContainText(locale === "fr" ? "12 % des contrats échus" : "12% of contracts up for renewal");
        const m = await measure(page);
        expect(m.top, "the body starts under the title").toBeGreaterThanOrEqual(m.titleBottom);
        expect(m.deepest, "the body ends above the footer").toBeLessThanOrEqual(m.footTop);
        expect(m.right).toBeLessThanOrEqual(1920 - 120 + 2);
        expect(m.smallest).toBeGreaterThanOrEqual(18);
        expect(m.text).not.toMatch(/\{[a-zA-Z]+\}|\bundefined\b|\bNaN\b|\*\*/);
      });

      test("the built-in example (C50): self-serve's column has its picture, sales-assisted says what is missing", async ({ page }) => {
        await openDeck(page, locale, hybridState());
        const slide = page.locator('[data-slide="unit-economics"]');
        await expect(slide.getByTestId("slide-payback-chart-plg")).toHaveAttribute("data-story", "pays-back");
        await expect(slide.getByTestId("slide-payback-chart-slg")).toHaveCount(0);
        await expect(slide.getByTestId("slide-figure-slg-cash")).toContainText("?");
        const m = await measure(page);
        expect(m.top).toBeGreaterThanOrEqual(m.titleBottom);
        expect(m.deepest).toBeLessThanOrEqual(m.footTop);
        expect(m.right).toBeLessThanOrEqual(1920 - 120 + 2);
        expect(m.smallest).toBeGreaterThanOrEqual(18);
      });

      test("no margin on either side: « ? » tiles that say what is missing, no « ? » box, the body under a three-line title", async ({ page }) => {
        await openDeck(page, locale, hybridNoMarginState());
        const slide = page.locator('[data-slide="unit-economics"]');
        await expect(slide.getByTestId("slide-figure-slg-cash")).toContainText("?");
        await expect(slide.locator('[data-testid^="slide-payback-chart"]')).toHaveCount(0);
        const m = await measure(page);
        expect(m.top).toBeGreaterThanOrEqual(m.titleBottom);
        expect(m.deepest).toBeLessThanOrEqual(m.footTop);
      });
    });
  }
}
