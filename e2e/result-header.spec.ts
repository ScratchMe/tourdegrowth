import type { Page } from "@playwright/test";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { expect, test } from "./helpers";
import { EMULATOR_HOST, REAL_RESULTS, SKIP_EMULATOR_REASON } from "./real-results";

/**
 * The result header in every state, at every width (2026-10-02).
 *
 * The header carries the result's two states beside the language switch: the
 * Deep dive tag and the roast badge. Only the sample, which has neither, was
 * ever measured on a phone (landing-mobile.spec.ts), and the states broke it:
 * a roast with a Deep dive scrolled sideways by 9px at 390 — inside the
 * contract — and by 79px at 320; a roast alone by 14px at 320; and the roast
 * badge broke over two lines from 390 down. Since then the states leave the
 * header for a line at the top of the page up to 760px (ResultView.tsx,
 * `stateTags`).
 *
 * Every state is measured, not only the one a bug was seen in: a bound holds
 * for all the variants or it is not a bound (CLAUDE.md, convention 11).
 */

const PHONE_WIDTHS = [320, 360, 375, 390, 430, 760] as const;
const WIDE_WIDTHS = [761, 1280] as const;

const VARIANTS = [
  { name: "the sample", path: "/r/sample", deep: false, roast: false, needsEmulator: false },
  { name: "a roast", path: `/r/${REAL_RESULTS.shared.id}`, deep: false, roast: true, needsEmulator: true },
  { name: "a Deep dive", path: `/r/${REAL_RESULTS.deep.id}`, deep: true, roast: false, needsEmulator: true },
  { name: "a roast with a Deep dive", path: `/r/${REAL_RESULTS.roastDeep.id}`, deep: true, roast: true, needsEmulator: true },
] as const;

/** Each state's text, in the order the page shows them. */
function expectedTags(variant: (typeof VARIANTS)[number], locale: Locale): string[] {
  return [
    ...(variant.deep ? [tc(UI_STRINGS.deepDive.badge, locale)] : []),
    ...(variant.roast ? [tc(UI_STRINGS.result.roastBadge, locale)] : []),
  ];
}

/**
 * The visible states inside `testId`, each with whether its text sits on one
 * line: its content box (border and padding taken off) is under two font
 * sizes high — one line of `--meta-*` is ~1.4 of it, two are ~2.8. Read off
 * `offsetHeight`, which the roast badge's tilt does not inflate.
 */
async function tagsIn(page: Page, testId: string) {
  return page.evaluate((id) => {
    const box = document.querySelector(`[data-testid="${id}"]`);
    if (!box) return [];
    return [...box.children]
      .filter((el): el is HTMLElement => el instanceof HTMLElement && el.getClientRects().length > 0)
      .map((el) => {
        const cs = getComputedStyle(el);
        const chrome = ["paddingTop", "paddingBottom", "borderTopWidth", "borderBottomWidth"]
          .map((key) => parseFloat(cs[key as "paddingTop"]))
          .reduce((a, b) => a + b, 0);
        return { text: (el.textContent ?? "").trim(), oneLine: el.offsetHeight - chrome < 2 * parseFloat(cs.fontSize) };
      });
  }, testId);
}

for (const variant of VARIANTS) {
  for (const locale of ["en", "fr"] as const) {
    test.describe(`${variant.name}, read in ${locale}`, () => {
      test.skip(variant.needsEmulator && !EMULATOR_HOST, SKIP_EMULATOR_REASON);

      test("on a phone: no sideways scroll, and the states on their own line at the top of the page", async ({ page }) => {
        await page.setViewportSize({ width: PHONE_WIDTHS[0], height: 800 });
        await page.goto(`${variant.path}?lang=${locale}`);
        await page.locator("main").waitFor();
        const expected = expectedTags(variant, locale);

        for (const width of PHONE_WIDTHS) {
          await page.setViewportSize({ width, height: 800 });
          const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
          expect(scrollWidth, `scrolls sideways at ${width}px`).toBe(width);

          expect(await tagsIn(page, "result-header-tags"), `a state left in the header at ${width}px`).toEqual([]);
          const tags = await tagsIn(page, "result-state-tags");
          expect(
            tags.map((tag) => tag.text),
            `the states at ${width}px`,
          ).toEqual(expected);
          for (const tag of tags) expect(tag.oneLine, `« ${tag.text} » breaks over two lines at ${width}px`).toBe(true);
        }
      });

      test("from 761px: the states stay in the header, which holds its row", async ({ page }) => {
        await page.setViewportSize({ width: WIDE_WIDTHS[0], height: 800 });
        await page.goto(`${variant.path}?lang=${locale}`);
        await page.locator("main").waitFor();
        const expected = expectedTags(variant, locale);

        for (const width of WIDE_WIDTHS) {
          await page.setViewportSize({ width, height: 800 });
          // The header's own row, not the document: /r/sample's two-column
          // grid is 8px too wide from 761 to 769px whatever the header holds
          // (CHANTIERS.md E, « Un contrat de largeur »).
          const row = await page.locator("header").first().evaluate((header) => {
            const el = header.firstElementChild as HTMLElement;
            return { scroll: el.scrollWidth, client: el.clientWidth };
          });
          expect(row.scroll, `the header row overflows at ${width}px`).toBeLessThanOrEqual(row.client);

          expect(await tagsIn(page, "result-state-tags"), `a state left in the page at ${width}px`).toEqual([]);
          const tags = await tagsIn(page, "result-header-tags");
          expect(
            tags.map((tag) => tag.text),
            `the states at ${width}px`,
          ).toEqual(expected);
          for (const tag of tags) expect(tag.oneLine, `« ${tag.text} » breaks over two lines at ${width}px`).toBe(true);
        }
      });
    });
  }
}
