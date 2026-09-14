import { expect, test } from "./helpers";

/**
 * Every page carries exactly one `<h1>` — reported by Bing Webmaster Tools on
 * 2026-09-14 for `/quiz` and `/r/sample`, and true of `/deep-dive/[id]` too.
 *
 * The three app screens have no painted title: their first drawn element is a
 * question card or the score numeral, and the design puts nothing above it.
 * So they carry a visually-hidden one. What this spec holds is the pair of
 * properties that makes that legitimate rather than a trick:
 *
 * 1. It is in the SERVER-RENDERED HTML, not added after mount — a crawler
 *    does not run the questionnaire's effects. The check reads the raw
 *    document over HTTP rather than the DOM, because those are two different
 *    things on exactly these three routes.
 * 2. It is still in the accessibility tree. `display: none` and
 *    `visibility: hidden` would hide it from screen readers too, which would
 *    amount to not having one.
 */
const CONTENT = ["/en", "/fr", "/en/how-it-works", "/en/glossary", "/en/glossary/cac", "/en/about", "/fr/privacy", "/fr/terms"];
const APP = ["/quiz", "/r/sample", "/deep-dive/sample"];

test.describe("every page has exactly one h1", () => {
  for (const path of [...CONTENT, ...APP]) {
    test(`${path} — in the HTML the server sends`, async ({ request }) => {
      const html = await (await request.get(path)).text();
      expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
      // Non-empty: an `<h1></h1>` would satisfy a naive count and say
      // nothing. No length floor beyond that — `/en/glossary/cac` is titled
      // "CAC", three characters, and it is the right title for that page.
      const text = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1] ?? "";
      expect(text.replace(/<[^>]*>/g, "").trim()).not.toBe("");
    });
  }

  test("the app screens' heading follows the reader's language", async ({ request }) => {
    const en = await (await request.get("/quiz?lang=en")).text();
    const fr = await (await request.get("/quiz?lang=fr")).text();
    expect(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(en)?.[1]).toContain("The Tour");
    expect(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(fr)?.[1]).toContain("Le Tour");
  });

  test("the result heading carries the score, so the title is not generic", async ({ request }) => {
    const html = await (await request.get("/r/sample")).text();
    expect(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1]).toContain("74/100");
  });

  /**
   * The hidden heading must remain readable by assistive technology. A
   * `clip-path` box stays in the accessibility tree; `display: none` does
   * not. Asserted through the accessible name, which is what a screen reader
   * would announce — not through the CSS property, which could be right while
   * the outcome is wrong.
   */
  test("a visually-hidden heading is still exposed to assistive technology", async ({ page }) => {
    await page.goto("/quiz");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toHaveCount(1);
    await expect(heading).toHaveAccessibleName(/The Tour|Le Tour/);
    // Present but not painted: zero-ish box, and never `display: none`.
    const box = await heading.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height, display: getComputedStyle(el).display };
    });
    expect(box.display).not.toBe("none");
    expect(box.width).toBeLessThan(4);
    expect(box.height).toBeLessThan(4);
  });
});
