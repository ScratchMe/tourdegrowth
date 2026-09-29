import type { Page } from "@playwright/test";
import { expect, test } from "./helpers";

/**
 * Design I + B, the result's half (retained by Antoine on 2026-09-28): the
 * score as a kilometre marker beside the stage that stalls, the stage
 * profile over the pillar chips, and a meter on every chip.
 *
 * Measured on the rendered page, because each of these is a claim about
 * geometry that the markup cannot make: a marker "beside" the name, a name
 * that "fits", two bars that "compare".
 */

const WIDTHS = [
  { width: 1280, locale: "en" },
  { width: 390, locale: "fr" },
] as const;

/** Every meter's track and fill, in page pixels. */
async function meters(page: Page, scope: string) {
  return page.evaluate((scope) => {
    return [...document.querySelectorAll(`${scope} [data-testid="pillar-meter"]`)].map((track) => {
      const t = track.getBoundingClientRect();
      const f = track.firstElementChild!.getBoundingClientRect();
      const chip = track.parentElement!;
      const score = Number(chip.querySelector("b")!.textContent);
      return { score, track: t.width, fill: f.width, hidden: track.getAttribute("aria-hidden") };
    });
  }, scope);
}

for (const { width, locale } of WIDTHS) {
  test.describe(`the result at ${width}px (${locale})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/r/sample?lang=${locale}`);
      await page.getByTestId("bottleneck").waitFor();
    });

    test("stands the score on a marker beside the stage's name, and the name fits its column", async ({ page }) => {
      const block = page.getByTestId("bottleneck");
      const marker = block.locator('[data-variant="marker"]');
      await expect(marker).toHaveCount(1);
      // The marker carries the score and its label, in the reading order of
      // the card: score first, then the stage.
      await expect(marker).toContainText("74");
      await expect(marker).toContainText("/100");

      const geo = await block.evaluate((el) => {
        const m = el.querySelector('[data-variant="marker"]')!.getBoundingClientRect();
        const name = el.querySelector('[class*="pillar"]') as HTMLElement;
        const head = name.closest('[class*="head"]')!.getBoundingClientRect();
        const verdict = el.querySelector('[data-testid="score-verdict"]')!.getBoundingClientRect();
        return {
          markerRight: m.right,
          markerBottom: m.bottom,
          nameLeft: name.getBoundingClientRect().left,
          nameOverflow: name.scrollWidth - name.clientWidth,
          nameRight: name.getBoundingClientRect().right,
          headRight: head.right,
          verdictTop: verdict.top,
          verdictWidth: verdict.width,
          blockWidth: el.getBoundingClientRect().width,
        };
      });
      expect(geo.nameLeft, "the name stands beside the marker, not under it").toBeGreaterThan(geo.markerRight);
      expect(geo.nameOverflow).toBeLessThanOrEqual(0);
      expect(geo.nameRight).toBeLessThanOrEqual(geo.headRight + 0.5);
      // The verdict runs under both, the block's full width.
      expect(geo.verdictTop).toBeGreaterThan(geo.markerBottom);
      expect(geo.verdictWidth).toBeGreaterThan(geo.blockWidth * 0.9);
    });

    test("draws the profile over the chips, hidden from assistive technology, the named stage flagged", async ({ page }) => {
      const profile = page.getByTestId("stage-profile");
      await expect(profile).toBeVisible();
      // The chips are its table: a screen reader gets them, not the picture.
      await expect(profile).toHaveAttribute("aria-hidden", "true");

      // The sample is 18 · 12 · 8 · 16 · 20 and names retention alone.
      const flags = profile.locator('[data-hot="true"]');
      await expect(flags).toHaveCount(1);
      await expect(flags).toContainText("HC");
      await expect(flags).toContainText("−12");
      await expect(profile).toContainText(locale === "fr" ? "Profil du parcours" : "Route profile");
      await expect(profile).not.toContainText(/étape/i);

      // The flag stands over the retention column — the third of five — and
      // that column is the highest climb.
      const geo = await profile.evaluate((el) => {
        const plot = el.querySelector("svg")!.getBoundingClientRect();
        const flag = el.querySelector('[data-hot="true"]')!.getBoundingClientRect();
        const labels = [...el.querySelectorAll('[class*="labels"] > span')].map((s) => s.textContent);
        return { column: Math.floor(((flag.left + flag.width / 2 - plot.left) / plot.width) * 5), labels };
      });
      expect(geo.column).toBe(2);
      expect(geo.labels).toEqual(["Acq.", "Act.", "Ret.", "Ref.", "Rev."]);

      // Over the chips: it comes first in the pillar column.
      const top = (await profile.boundingBox())!.y;
      const firstChip = (await page.locator('[class*="pillarGrid"] [data-testid="pillar-meter"]').first().boundingBox())!.y;
      expect(top).toBeLessThan(firstChip);
    });

    test("gives every chip a meter on a track of the same length, so the bars compare", async ({ page }) => {
      const rows = await meters(page, '[class*="pillarGrid"]');
      expect(rows.length, "the pillar grid moved — this measures nothing now").toBe(5);
      const tracks = rows.map((r) => Math.round(r.track));
      expect(new Set(tracks).size, `tracks of different lengths: ${tracks.join(", ")}`).toBe(1);
      for (const r of rows) {
        expect(r.hidden).toBe("true");
        expect(r.fill / r.track).toBeCloseTo(r.score / 20, 1);
      }
    });
  });
}

test.describe("the landing's preview card", () => {
  for (const { width, locale } of WIDTHS) {
    test(`mirrors the marker and the meters at ${width}px (${locale})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}`);
      const card = page.getByTestId("preview-card");
      await expect(card.locator('[data-testid="preview-bottleneck"] [data-variant="marker"]')).toContainText("74");

      const rows = await meters(page, '[data-testid="preview-card"]');
      expect(rows.length).toBe(5);
      const tracks = rows.map((r) => Math.round(r.track));
      expect(new Set(tracks).size, `tracks of different lengths: ${tracks.join(", ")}`).toBe(1);
    });
  }
});
