import { expect, test } from "./helpers";

/**
 * REVIEW-02.md R2-05 — on every content page the wordmark and the EN|FR
 * switch sat glued together at the left edge, desktop and mobile alike.
 *
 * The three page modules had the header rule without `display: flex`, so
 * the two children just flowed. The landing, which had the flex rule, was
 * fine — which is exactly why the bug survived every landing screenshot.
 *
 * Measured rather than eyeballed: a real gap between the wordmark's right
 * edge and the switch's left edge, the two on one row, and the switch
 * pinned to the right of its container. Checked on all three page kinds
 * and both widths, because the fix is one shared component and a
 * regression would be a page that stopped using it.
 */
const PAGES: [name: string, path: string][] = [
  ["how-it-works", "/en/how-it-works"],
  ["glossary index", "/fr/glossary"],
  ["glossary term", "/en/glossary/cac"],
  ["terms", "/fr/terms"],
];
const WIDTHS = [390, 1280];

for (const [name, path] of PAGES) {
  for (const width of WIDTHS) {
    test(`the ${name} header keeps the wordmark left and the language switch right at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path);
      await page.locator("main").waitFor();

      const header = page.locator("header").first();
      const wordmark = header.getByRole("link", { name: "Tour de Growth" });
      const switcher = header.getByRole("group", { name: /language|langue/i });
      await expect(wordmark).toBeVisible();
      await expect(switcher).toBeVisible();

      const [w, s, h] = await Promise.all([wordmark.boundingBox(), switcher.boundingBox(), header.boundingBox()]);
      if (!w || !s || !h) throw new Error("header parts have no box");

      // Same row…
      expect(Math.abs(w.y + w.height / 2 - (s.y + s.height / 2))).toBeLessThan(10);
      // …with real space between them (before the fix they touched)…
      expect(s.x - (w.x + w.width)).toBeGreaterThanOrEqual(24);
      // …and the switch against the right edge of the content column, not
      // hanging off the wordmark. The column is at most the reading width,
      // centred, with 24px of side padding: the switch's right edge is the
      // column's right edge (`--width-reading` is 760px).
      const columnRight = h.x + h.width / 2 + Math.min(h.width, 760) / 2 - 24;
      expect(Math.abs(s.x + s.width - columnRight)).toBeLessThan(12);

      // And none of this pushes the page sideways.
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}
