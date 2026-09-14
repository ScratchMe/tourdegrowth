import { expect, test } from "./helpers";

/**
 * French numbers must not break across two lines.
 *
 * Found by looking at a page, not by reading code: on `/fr/glossary/arpu` at
 * 390px, "5 000 payants" wrapped with the "5" alone at the end of a line. The
 * whole French corpus used plain spaces inside digit groups and before "%" —
 * 96 digit groups and 169 percent signs in `glossary-deep.ts` alone — so the
 * defect was latent everywhere a number happened to land near a line end, and
 * a screenshot of any single page was never going to prove its absence.
 *
 * The fix is U+00A0 and NOT U+202F (the narrow no-break space French
 * typography would prefer): this repo has already shipped an empty box once,
 * when U+2116 turned out to be missing from an OG font subset. U+00A0 is in
 * every font.
 *
 * These specs assert the RENDERED geometry rather than the source characters,
 * because that is the thing that was wrong: a source full of U+00A0 that some
 * future CSS re-broke would still pass a string check.
 */

const PAGES = [
  "/fr/glossary/arpu", // the page the defect was seen on
  "/fr/glossary/nrr-grr", // the densest numeric example in the glossary
  "/fr/glossary/cac-payback",
];

for (const path of PAGES) {
  for (const width of [390, 1280]) {
    test(`no French number splits across lines on ${path} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      const split = await page.evaluate(() => {
        const bad: string[] = [];
        const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const range = document.createRange();
        let node: Node | null;
        while ((node = walk.nextNode())) {
          const text = node.textContent ?? "";
          // Any digit group or percent sign, whichever space sits inside it.
          for (const m of text.matchAll(/\d[  ](?:\d{3}(?!\d)|%)/g)) {
            range.setStart(node, m.index);
            range.setEnd(node, m.index + m[0].length);
            // More than one client rect means the run was laid out on two lines.
            if (range.getClientRects().length > 1) bad.push(m[0]);
          }
        }
        return bad;
      });
      expect(split, `these ran over a line break: ${split.join(", ")}`).toEqual([]);
    });
  }
}
