import { expect, test } from "./helpers";

/**
 * The skip link (ds-critique L-9, 2026-09-24), checked as behaviour and not
 * as markup: it is the first thing Tab reaches, it becomes visible when it
 * does, and following it sends the NEXT Tab into the page's content instead
 * of back through the header.
 *
 * Its target is not focusable (no tabindex on `<main>`, which would draw a
 * focus ring around the whole page on arrival). What moves is the browser's
 * sequential focus navigation starting point — hence the assertion on where
 * the following Tab lands, which is what a keyboard reader actually gets.
 *
 * One page per kind of tree: the landing and a glossary term (content root
 * layout), the quiz and a result (app root layout), and the 404, which
 * renders its own shell. Measured, not assumed: with the link pointed at a
 * missing target, the first four fail on the last assertion and the 404
 * passes — its wordmark lives INSIDE `<main>`, so there is nothing to skip
 * and the next Tab lands there by construction. It stays for the rest (one
 * target, off-screen until focused, localized label).
 */
const PAGES: [path: string, label: string][] = [
  ["/en", "Skip to content"],
  ["/fr/glossary/cac", "Aller au contenu"],
  ["/quiz", "Skip to content"],
  ["/r/sample", "Skip to content"],
  ["/nonsense", "Skip to content"],
];

for (const [path, label] of PAGES) {
  test(`the skip link leads into the content on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.locator("main#main").waitFor();

    // Exactly one target: a second `main#main` would make the link ambiguous
    // and the page invalid.
    expect(await page.locator("#main").count()).toBe(1);

    const skip = page.locator("a.tdg-skip");
    await expect(skip).toHaveText(label);
    // Off-screen until focused — present for assistive tech, invisible to a mouse user.
    const hidden = await skip.boundingBox();
    expect(hidden!.y + hidden!.height).toBeLessThanOrEqual(0);

    await page.keyboard.press("Tab");
    await expect(skip).toBeFocused();
    const shown = await skip.boundingBox();
    expect(shown!.y).toBeGreaterThanOrEqual(0);

    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    const landedInMain = await page.evaluate(() => document.activeElement?.closest("main#main") !== null);
    expect(landedInMain, "the Tab after the skip link must land inside <main>").toBe(true);
  });
}
