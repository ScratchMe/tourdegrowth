import { readFileSync } from "node:fs";
import type { Page, Request } from "@playwright/test";
import { QUESTIONS } from "../src/content/copy-library";
import { expect, test } from "./helpers";

/**
 * The CODIR / COMEX deck — engine spec §9 (the slides), §10 (the exports),
 * §7 E5 (the screen). Every assertion is about what leaves the screen: the
 * PDF the browser really prints, the PNG html-to-image really encodes, the
 * text really put on the clipboard, and every request the page really sends
 * while doing it.
 *
 * Seeded with the §6.0 example (the one every engine test uses): three
 * numbers missing, day-30 retention among them, a Tour linked. The company
 * label and the ask carry canaries — strings that exist nowhere else — so
 * "nothing the user typed leaves the browser" is checked on the bytes of
 * every request, not on a list of endpoints someone thought of.
 *
 * Needs the island to mount the deck (P4, engine spec §7 E5): the specs look
 * for the board's "Prepare my slides" button and skip, saying so, until it
 * exists — a skip that names its reason, never a pass that proves nothing.
 */

const COMPANY_CANARY = "CANARY-CO-7Q3X";
const ASK_CANARY = "CANARY-ASK-9K2W";
const SKIP_REASON = "the island doesn't mount the deck yet (engine P4 wires DeckView behind `engine-open-deck`)";

const AT = "2026-09-01T09:00:00.000Z";
const m = (entry: Record<string, unknown>) => ({ ...entry, updatedAt: AT });

/** Engine spec §6.0, verbatim: self-serve, flows of August 2026, the July cohort, EUR. */
function exampleStore() {
  return {
    schemaVersion: 1,
    state: {
      schemaVersion: 1,
      id: "e2e-engine",
      createdAt: AT,
      updatedAt: AT,
      setup: { profile: "selfserve", currency: "EUR", activationWindowDays: 7, paidWindowDays: 30, companyLabel: COMPANY_CANARY },
      snapshots: [
        {
          id: "s1",
          referenceMonth: "2026-08",
          cohortMonth: "2026-07",
          createdAt: AT,
          targets: {},
          metrics: {
            "acq.signup-rate": m({ status: "measured", value: { kind: "ratio", numerator: 820, denominator: 26000 }, source: { kind: "tool", tool: "ga4" } }),
            "acq.top-channel-share": m({ status: "measured", value: { kind: "ratio", numerator: 410, denominator: 820 }, source: { kind: "tool", tool: "ga4" }, label: "Recherche naturelle" }),
            "acq.cac": m({ status: "measured", value: { kind: "ratio", numerator: 21000, denominator: 42 }, source: { kind: "person", role: "finance" }, variant: "media-only" }),
            "act.event": m({ status: "measured", value: { kind: "text", text: "a créé un premier projet" } }),
            "act.rate": m({ status: "measured", value: { kind: "ratio", numerator: 144, denominator: 800 }, source: { kind: "tool", tool: "amplitude" } }),
            "act.ttv": m({ status: "estimated", estimate: { low: 1, high: 3, basis: "team-hunch" } }),
            "ret.d30": m({ status: "missing", missing: { cause: "not-tracked", repair: "sprint", ownerRole: "data" } }),
            "ret.logo-churn": m({ status: "measured", value: { kind: "ratio", numerator: 10, denominator: 400 }, source: { kind: "tool", tool: "stripe" } }),
            "ret.churn-cause": m({ status: "missing", missing: { cause: "no-definition", repair: "meeting" } }),
            "ref.mechanism": m({ status: "measured", value: { kind: "choice", choice: "in-product" } }),
            "ref.referred-share": m({ status: "measured", value: { kind: "ratio", numerator: 48, denominator: 800 }, source: { kind: "tool", tool: "product-db" } }),
            "ref.k-factor": m({ status: "requested", request: { role: "data", requestedAt: AT } }),
            "rev.paid-conversion": m({ status: "estimated", estimate: { low: 6, high: 9, basis: "old-number" } }),
            "rev.arpa": m({ status: "measured", value: { kind: "ratio", numerator: 48000, denominator: 400 }, source: { kind: "tool", tool: "stripe" } }),
            "rev.gross-margin": m({ status: "missing", missing: { cause: "no-access", repair: "meeting", ownerRole: "finance" } }),
          },
        },
      ],
      tourLink: { resultId: "e2e-tour", linkedAt: AT },
      deck: { include: {}, showCompany: true, showSiteCredit: true, ask: { what: "", bullets: [], measureFirst: [] } },
    },
  };
}

/** The linked Tour, kept on the device like any other result (the engine READS it, D13). */
const TOUR = [
  {
    id: "e2e-tour",
    ownerToken: "e2e-owner-token",
    createdAt: AT,
    total: 58,
    answers: Object.fromEntries(QUESTIONS.map((q, i) => [q.id, i % 3])),
  },
];

/** Seeds once per test: a reload must keep what the test changed, not re-seed over it. */
async function seed(page: Page) {
  await page.addInitScript(
    ([store, tour]) => {
      if (sessionStorage.getItem("e2e-engine-seeded")) return;
      localStorage.setItem("tdg.engine.v1", JSON.stringify(store));
      localStorage.setItem("tdg.results.v1", JSON.stringify(tour));
      sessionStorage.setItem("e2e-engine-seeded", "1");
    },
    [exampleStore(), TOUR] as const,
  );
}

async function openDeck(page: Page, locale: "fr" | "en") {
  await seed(page);
  await page.goto(`/${locale}/aarrr-funnel-template?engine=preview`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  const open = page
    .getByTestId("engine-open-deck")
    .or(page.getByRole("button", { name: /Préparer mes slides|Prepare my slides/ }))
    .first();
  const present = await open
    .waitFor({ timeout: 5_000 })
    .then(() => true)
    .catch(() => false);
  test.skip(!present, SKIP_REASON);
  await open.click();
  await expect(page.getByTestId("engine-deck")).toBeVisible();
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
      // Every included slide is numbered i/N, N counting only what will print.
      const n = await includedCount(page);
      expect(n).toBeGreaterThanOrEqual(5);
      await expect(page.getByTestId("slide-annex").locator("footer")).toContainText(`${n}/${n}`);
      // The title carries the number (§9.1): 18 of 100 reach first value.
      await expect(page.getByTestId("slide-peloton").locator("h3")).toContainText("18");
      // The company label is on the slides because showCompany is on.
      await expect(page.getByTestId("slide-peloton")).toContainText(COMPANY_CANARY);
      // A blank ask is prefilled once (§7 E5): the success target comes from
      // the comparator, and the three missing numbers are proposed as the
      // things to measure first. The target field shows it — a stale local
      // draft once hid a default that had reached the state.
      await expect(page.getByTestId("deck-ask-target")).toHaveValue("20");
      await expect(page.getByTestId("deck-ask-form").locator('input[type="checkbox"]:checked')).toHaveCount(3);
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

    test("copy the text: every included title and its notes, without the accent marks", async ({ page, context }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await openDeck(page, locale);
      await page.getByTestId("deck-copy-text").click();
      await expect(page.getByTestId("deck-status")).not.toBeEmpty();
      const text = await page.evaluate(() => navigator.clipboard.readText());
      const title = (await page.getByTestId("slide-peloton").locator("h3").textContent())!.trim();
      expect(text).toContain(title);
      expect(text).not.toContain("**");
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
      await expect(page.getByTestId("slide-annex").locator("footer")).toContainText(`${before - 1}/${before - 1}`);
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
  });
}
