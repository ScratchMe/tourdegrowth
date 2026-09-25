import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import type { Page, Request } from "@playwright/test";
import { QUESTIONS } from "../src/content/copy-library";
import { exampleState, tourResult } from "../src/lib/engine/__tests__/fixtures";
import { expect, test } from "./helpers";

/**
 * The CODIR / COMEX deck — engine spec §9 (the slides), §10 (the exports),
 * §7 E5 (the screen). Every assertion is about what leaves the screen: the
 * PDF the browser really prints, the PNG html-to-image really encodes, the
 * text really put on the clipboard, and every request the page really sends
 * while doing it.
 *
 * Seeded with the §6.0 example from the engine's own fixtures (the data set
 * every engine test uses, so a number checked here is the one checked in the
 * unit tests), plus a linked Tour so the mirror slide exists. The company
 * label and the ask carry canaries — strings that exist nowhere else — so
 * "nothing the user typed leaves the browser" is checked on the bytes of
 * every request, not on a list of endpoints someone thought of.
 *
 * Structure, order and glyphs are asserted; sentences are not. The copy is
 * still "à relire" (convention 6) and a spec that pinned it would have to be
 * rewritten by whoever signs it off.
 */

const COMPANY_CANARY = "CANARY-CO-7Q3X";
const ASK_CANARY = "CANARY-ASK-9K2W";

/** Every answer given, so `tdg.results.v1` accepts it and the mirror has a verdict per bridge. */
const TOUR = tourResult(Object.fromEntries(QUESTIONS.map((q, i) => [q.id, (i % 3) as 0 | 1 | 2])));

function exampleStore() {
  const state = exampleState();
  state.setup.companyLabel = COMPANY_CANARY;
  state.deck.showCompany = true;
  state.tourLink = { resultId: TOUR.id, linkedAt: "2026-09-24T09:00:00.000Z" };
  return { schemaVersion: 1, state };
}

/** Seeds once per test: a reload must keep what the test changed, not re-seed over it. */
async function seed(page: Page) {
  await page.addInitScript(
    ([store, tour]) => {
      if (sessionStorage.getItem("e2e-engine-seeded")) return;
      localStorage.setItem("tdg.engine.v1", JSON.stringify(store));
      localStorage.setItem("tdg.results.v1", JSON.stringify([tour]));
      sessionStorage.setItem("e2e-engine-seeded", "1");
    },
    [exampleStore(), TOUR] as const,
  );
}

/**
 * Opens the slide screen. On the full island (P4) that is the board's
 * "prepare my slides" button; until then the island mounts the deck
 * directly. Either way the spec reaches the same DeckView — it never skips.
 */
async function openDeck(page: Page, locale: "fr" | "en") {
  await seed(page);
  await page.goto(`/${locale}/aarrr-funnel-template?engine=preview`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  const opener = page.getByTestId("engine-open-deck");
  const deck = page.getByTestId("engine-deck");
  await expect(opener.or(deck).first()).toBeVisible();
  if (await opener.isVisible()) await opener.click();
  await expect(deck).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

/** The slides the deck will print: present and checked. */
async function includedCount(page: Page): Promise<number> {
  return page.locator('[data-print="thumb"][data-included="true"]').count();
}

/** Parses the few things a Chromium PDF says in plain text: its pages, their size, its fonts. */
function readPdf(bytes: Buffer) {
  const text = bytes.toString("latin1");
  const pages = [...text.matchAll(/\/Type\s*\/Page(?![s\w])/g)].length;
  const boxes = [...text.matchAll(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/g)].map((b) => [Number(b[1]), Number(b[2])]);
  // `/BaseFont` AND `/FontName`: Chromium embeds a variable font (Inter) as a
  // Type3 font, which has no BaseFont — reading BaseFont alone would miss
  // exactly the fallback face this check exists to catch.
  const fonts = [
    ...new Set([...text.matchAll(/\/(?:BaseFont|FontName)\s*\/([^\s/<>[\]]+)/g)].map((f) => f[1]!.replace(/^[A-Z]{6}\+/, ""))),
  ];
  return { pages, boxes, fonts };
}

/** PNG width and height, from the IHDR chunk. */
function pngSize(bytes: Buffer): [number, number] {
  expect(bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(true);
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

for (const locale of ["fr", "en"] as const) {
  test.describe(`deck (${locale})`, () => {
    test("opens on the §6.0 example: the mirror slide is offered but unchecked, the credit is on", async ({ page }) => {
      await openDeck(page, locale);
      await expect(page.getByTestId("deck-thumb-mirror")).toHaveAttribute("data-included", "false");
      await expect(page.getByTestId("deck-include-mirror")).not.toBeChecked();
      await expect(page.getByTestId("deck-show-mirror")).not.toBeChecked();
      await expect(page.getByTestId("deck-show-credit")).toBeChecked();
      // §9.2: the slides in the model's order, the mirror offered among them.
      const order = await page.locator('[data-print="thumb"]').evaluateAll((els) => els.map((el) => el.getAttribute("data-testid")));
      expect(order).toEqual(
        ["peloton", "leak", "visibility", "unit-economics", "mirror", "ask", "annex"].map((id) => `deck-thumb-${id}`),
      );
      // Every included slide is numbered i/N, N counting only what will print; the excluded mirror has no number.
      const n = await includedCount(page);
      expect(n).toBe(6);
      await expect(page.getByTestId("slide-page-peloton")).toHaveText(`1/${n}`);
      await expect(page.getByTestId("slide-page-annex")).toHaveText(`${n}/${n}`);
      await expect(page.getByTestId("slide-page-mirror")).toHaveCount(0);
      // The title carries the number (§9.1): 18 of 100 reach first value, and the peloton says so in its column.
      await expect(page.getByTestId("slide-peloton").locator("h3")).toContainText("18");
      await expect(page.getByTestId("slide-numeral-act.rate")).toHaveText("18");
      // §6.0: day-30 retention is unmeasured — a "?", never a 0 — and activation is the named stage.
      await expect(page.getByTestId("slide-numeral-ret.d30")).toHaveText("?");
      await expect(page.getByTestId("slide-peloton").getByTestId("slide-stamp")).toHaveCount(1);
      await expect(page.locator('[data-column="act.rate"]').getByTestId("slide-stamp")).toBeVisible();
      // The company label is on the slides because showCompany is on.
      await expect(page.getByTestId("slide-peloton")).toContainText(COMPANY_CANARY);
      // A blank ask is prefilled once (§7 E5): the success target comes from
      // the comparator, and the three missing numbers are proposed as the
      // things to measure first. The target field shows it — a stale local
      // draft once hid a default that had reached the state.
      await expect(page.getByTestId("deck-ask-target")).toHaveValue("20");
      await expect(page.getByTestId("deck-ask-form").locator('input[type="checkbox"]:checked')).toHaveCount(3);
    });

    /**
     * What a slide may print, whatever the copy says: every template filled,
     * every accent mark consumed, no "undefined" or "NaN" from a value that
     * didn't arrive, and only the glyphs the three embedded families carry
     * (engine spec §10.4 — the same whitelist as `lib/engine/deck.test.ts`,
     * checked here on the RENDERED slide, where a component's own string
     * could slip one in). Arrows are drawn, so "→" must never reach the text.
     */
    test("every slide prints filled templates in the brand's glyphs only", async ({ page }) => {
      await openDeck(page, locale);
      await page.getByTestId("deck-include-mirror").check();
      const texts = await page.locator("[data-slide]").evaluateAll((els) =>
        els.map((el) => [el.getAttribute("data-slide"), (el as HTMLElement).innerText] as const),
      );
      expect(texts.map(([id]) => id)).toEqual(["peloton", "leak", "visibility", "unit-economics", "mirror", "ask", "annex"]);
      const allowed = /^[\n\t -~ -ÿ–—’«»…€·×÷±]*$/u;
      for (const [id, text] of texts) {
        expect(text.length, `${id} is empty`).toBeGreaterThan(80);
        expect(text, `${id} leaks a placeholder`).not.toMatch(/\{[a-zA-Z]+\}/);
        expect(text, `${id} prints accent marks`).not.toContain("**");
        expect(text, `${id} prints a missing value`).not.toMatch(/\bundefined\b|\bNaN\b|\bnull\b/);
        const outside = [...new Set([...text].filter((ch) => !allowed.test(ch)))];
        expect(outside, `${id} prints glyphs outside the three families`).toEqual([]);
      }
    });

    /**
     * A slide is a fixed 1920 × 1080 page with `overflow: hidden`: content
     * that doesn't fit runs under the footer on screen and is cut from the
     * PDF, without an error anywhere. Measured on the rendered slides — the
     * leak's list of other candidates, the visibility slide's last card and
     * the fifteen-row appendix all ran into the footer before their layouts
     * were tightened — so this is the check that keeps them tight.
     */
    test("every slide's body ends above its footer", async ({ page }) => {
      await openDeck(page, locale);
      await page.getByTestId("deck-include-mirror").check();
      const clashes = await page.locator("[data-slide]").evaluateAll((slides) =>
        slides.flatMap((slide) => {
          const box = slide.getBoundingClientRect();
          const scale = box.width / 1920;
          const y = (el: Element) => (el.getBoundingClientRect().bottom - box.top) / scale;
          const foot = slide.querySelector("footer")!;
          const footTop = (foot.getBoundingClientRect().top - box.top) / scale;
          const body = foot.previousElementSibling!;
          const deepest = Math.max(...[...body.querySelectorAll("*")].map(y));
          return deepest > footTop ? [`${slide.getAttribute("data-slide")}: body ends at ${Math.round(deepest)}, footer starts at ${Math.round(footTop)}`] : [];
        }),
      );
      expect(clashes).toEqual([]);
    });

    /**
     * The deck screen scanned by axe with a real engine in it: the page's own
     * accessibility pass (accessibility.spec.ts) opens the engine with no
     * stored numbers, so the slide screen — the ask form, the export panel,
     * seven scaled slides — never reaches it. Same scope and same flattened
     * ground as that pass.
     */
    test("the deck screen has no serious or critical accessibility violations", async ({ page }) => {
      await openDeck(page, locale);
      await page.addStyleTag({ content: "body { background-image: none !important; }" });
      const { violations } = await new AxeBuilder({ page })
        .include('[data-testid="engine-deck"]')
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const serious = violations
        .filter((v) => v.impact === "serious" || v.impact === "critical")
        .flatMap((v) => v.nodes.filter((n) => !/^<span[^>]*>GROWTH<\/span>$/.test(n.html.trim())).map((n) => `${v.id} on ${n.target.join(" ")}`));
      expect(serious).toEqual([]);
    });

    test("PDF: one 16:9 page per included slide, and only the three brand families embedded", async ({ page }) => {
      await page.addInitScript(() => {
        (window as unknown as { __printed: number }).__printed = 0;
        window.print = () => {
          (window as unknown as { __printed: number }).__printed += 1;
        };
      });
      await openDeck(page, locale);

      // Take the mirror in and the appendix out, so the page count can't be a coincidence.
      await page.getByTestId("deck-include-mirror").check();
      await page.getByTestId("deck-include-annex").uncheck();
      await expect(page.getByTestId("deck-thumb-annex")).toHaveAttribute("data-included", "false");
      const expected = await includedCount(page);

      await page.getByTestId("deck-pdf").click();
      await expect.poll(() => page.evaluate(() => (window as unknown as { __printed: number }).__printed)).toBe(1);

      // What window.print() would have printed: the same page, in print media.
      const pdf = readPdf(await page.pdf({ preferCSSPageSize: true, printBackground: true }));
      expect(pdf.pages).toBe(expected);
      expect(pdf.boxes.length).toBeGreaterThan(0);
      for (const [w, h] of pdf.boxes) {
        expect(w).toBeCloseTo(1440, 0); // 1920 CSS px = 1440 pt
        expect(h).toBeCloseTo(810, 0);
      }
      // Engine spec §10.4: the method that found LiberationSerif-Bold in the angles' slide.pdf.
      expect(pdf.fonts.length).toBeGreaterThan(0);
      for (const font of pdf.fonts) {
        expect(font, `unexpected font ${font}`).not.toMatch(/DejaVu|Liberation|Arial|Helvetica|Times|Noto|Symbol/i);
        expect(font, `unexpected font ${font}`).toMatch(/Stardos|Inter|Plex/i);
      }
      // Non-vacuity: all three families really are in there — the list can't pass by being short.
      for (const family of [/Stardos/i, /Inter/i, /Plex/i]) expect(pdf.fonts.some((f) => family.test(f))).toBe(true);
    });

    test("PNG: the slide at its real size, twice that in high definition, named after the slide and the month", async ({ page }) => {
      await openDeck(page, locale);
      const first = page.waitForEvent("download");
      await page.getByTestId("deck-png-peloton").click();
      const download = await first;
      expect(download.suggestedFilename()).toBe(`${locale === "fr" ? "moteur" : "engine"}-peloton-2026-08.png`);
      expect(pngSize(readFileSync((await download.path())!))).toEqual([1920, 1080]);

      await page.getByTestId("deck-hd").check();
      const second = page.waitForEvent("download");
      await page.getByTestId("deck-png-leak").click();
      expect(pngSize(readFileSync((await (await second).path())!))).toEqual([3840, 2160]);
    });

    /**
     * The copied text is Markdown (§10, `deckMarkdown`): a slide's accent
     * travels as **bold**, which is what a doc or a chat renders it as. So
     * the check is that every INCLUDED slide's title is there, in order, as a
     * numbered heading — and nothing excluded is — with its bold marks
     * paired and no template left unfilled.
     */
    test("copy the text: every included title as a numbered Markdown heading, in order", async ({ page, context }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await openDeck(page, locale);
      await page.getByTestId("deck-copy-text").click();
      await expect(page.getByTestId("deck-status")).not.toBeEmpty();
      const text = await page.evaluate(() => navigator.clipboard.readText());

      const headings = [...text.matchAll(/^## (\d+)\. (.+)$/gm)].map((m) => [Number(m[1]), m[2]!.replaceAll("**", "").trim()] as const);
      const included = await page.locator('[data-print="thumb"][data-included="true"] [data-slide] h3').allTextContents();
      expect(headings.map(([i]) => i)).toEqual(included.map((_, i) => i + 1));
      expect(headings.map(([, title]) => title)).toEqual(included.map((t) => t.trim()));
      // The mirror is offered but unchecked: its title must not travel.
      const mirror = (await page.getByTestId("slide-mirror").locator("h3").textContent())!.trim();
      expect(text.replaceAll("**", "")).not.toContain(mirror);
      expect((text.match(/\*\*/g) ?? []).length % 2).toBe(0);
      expect(text).not.toMatch(/\{[a-zA-Z]+\}/);
    });

    /**
     * The engine's promise (D16), end to end on the deck: two canaries typed
     * or stored, every export run, every request recorded. The export may
     * GET the page's own font files (html-to-image embeds them); it may not
     * send anything, and nothing it fetches may carry a canary.
     */
    test("nothing the user typed leaves the browser while exporting, and html-to-image loads on the first click only", async ({
      page,
      context,
    }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      const requests: Request[] = [];
      page.on("request", (r) => requests.push(r));
      const scripts = new Map<string, Promise<string>>();
      page.on("response", (r) => {
        if (r.request().resourceType() === "script") scripts.set(r.url(), r.text().catch(() => ""));
      });
      await page.addInitScript(() => {
        window.print = () => undefined;
      });

      await openDeck(page, locale);
      const what = page.getByTestId("deck-ask-what");
      await what.fill(ASK_CANARY);
      await what.blur();
      // Non-vacuity: the canary really is on a slide, and in the live preview.
      await expect(page.getByTestId("slide-ask").locator("h3")).toContainText(ASK_CANARY);
      await expect(page.getByTestId("deck-ask-preview")).toContainText(ASK_CANARY);

      // Before any export: no loaded script is html-to-image (its own error message survives minification, unlike our option names).
      const before = await Promise.all([...scripts.values()]);
      expect(before.some((body) => body.includes("Error inlining remote css file"))).toBe(false);
      const scriptsBefore = scripts.size;

      const download = page.waitForEvent("download");
      await page.getByTestId("deck-png-ask").click();
      await download;
      await page.getByTestId("deck-copy-text").click();
      await page.getByTestId("deck-pdf").click();
      await page.waitForTimeout(300);

      const after = await Promise.all([...scripts.values()]);
      expect(scripts.size).toBeGreaterThan(scriptsBefore);
      expect(after.some((body) => body.includes("Error inlining remote css file"))).toBe(true);

      for (const r of requests) {
        const carried = `${r.url()}\n${r.postData() ?? ""}`;
        expect(carried, r.url()).not.toContain(COMPANY_CANARY);
        expect(carried, r.url()).not.toContain(ASK_CANARY);
      }
      expect(requests.filter((r) => r.method() !== "GET").map((r) => `${r.method()} ${r.url()}`)).toEqual([]);
    });

    test("an excluded slide is still shown, framed as not in the deck, and numbering skips it", async ({ page }) => {
      await openDeck(page, locale);
      const before = await includedCount(page);
      await page.getByTestId("deck-include-visibility").uncheck();
      await expect(page.getByTestId("deck-thumb-visibility")).toHaveAttribute("data-included", "false");
      await expect(page.getByTestId("slide-visibility")).toBeVisible();
      expect(await includedCount(page)).toBe(before - 1);
      await expect(page.getByTestId("slide-page-annex")).toHaveText(`${before - 1}/${before - 1}`);
      await expect(page.getByTestId("slide-page-visibility")).toHaveCount(0);
    });

    test("removing the tourdegrowth.com credit removes it from every slide", async ({ page }) => {
      await openDeck(page, locale);
      await expect(page.getByTestId("slide-peloton")).toContainText("tourdegrowth.com");
      await page.getByTestId("deck-show-credit").uncheck();
      await expect(page.locator('[data-slide]:has-text("tourdegrowth.com")')).toHaveCount(0);
    });

    for (const width of [390, 1280]) {
      test(`the deck screen does not scroll sideways at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await openDeck(page, locale);
        const [scroll, client] = await page.evaluate(() => [
          document.documentElement.scrollWidth,
          document.documentElement.clientWidth,
        ]);
        expect(scroll).toBe(client);
      });
    }

    // "More reliable from a computer" is a phone warning (engine spec E5). On
    // a computer it would say the opposite of what the reader is doing.
    test("the PDF's phone warning shows on a phone and never on a computer", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await openDeck(page, locale);
      await expect(page.getByTestId("deck-pdf-hint")).toBeVisible();
      await page.setViewportSize({ width: 1280, height: 800 });
      await expect(page.getByTestId("deck-pdf-hint")).toBeHidden();
    });
  });
}
