import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ANNEX_COLUMNS, ANNEX_PAGE_HEIGHT, annexPages, annexRowHeight, wrappedLines, type AnnexCells } from "../annex-pages";
import { buildDeck } from "../deck";
import { deriveEngine } from "../derive";
import type { DeckModel, EngineState, MetricId } from "../types";
import { TEXT_LIMITS, shapesOf } from "../catalog-shape";
import { CTX_EN, CTX_FR, EN, FR } from "./props";
import { emptyState, exampleState, missing } from "./fixtures";

/*
 * The appendix cut into pages at 18px (design audit S-8, CHANTIERS.md A2.1,
 * 2026-09-29). The estimate is checked here against the stylesheet and on its
 * own terms; e2e/engine-deck.spec.ts measures the rendered pages.
 *
 * Non-vacuity (2026-09-29): with the old single page (annexPages returning
 * `[rows]`), « the §6.0 example takes two pages » and « the worst case »
 * fail, and so do the deck's order tests in deck.test.ts (four of them);
 * a 37% formula column in the stylesheet fails « the widths are the
 * stylesheet's » alone.
 */

const props = { fr: { ...FR, ctx: CTX_FR }, en: { ...EN, ctx: CTX_EN } };
function deck(state: EngineState, locale: "fr" | "en"): DeckModel {
  const p = props[locale];
  const derived = deriveEngine(state, p.ctx, null, p.bridges, p.strings.units);
  return buildDeck(state, derived, p.strings, p.metrics, p.ctx, { derived: p.derived, bridges: p.bridges });
}
const annexSlides = (model: DeckModel) => model.slides.filter((s) => s.id === "annex" || s.id.startsWith("annex:"));
const rowsOf = (model: DeckModel) => annexSlides(model).map((s) => s.lines as unknown as AnnexCells[]);

/** A team's own definition at its limit, in words a team would write (not one long token). */
const LONG_DEFINITION = {
  fr: "Un compte est actif quand au moins deux personnes de l'équipe ont modifié un projet partagé dans les sept jours qui suivent l'inscription, hors comptes de test, démo et partenaires revendeurs.",
  en: "An account counts as active once at least two people on the team have edited a shared project within seven days of signing up, test accounts, demos and reseller partners excluded, as agreed today.",
};

function withDefinitions(state: EngineState, text: string): EngineState {
  const next = structuredClone(state);
  const metrics = next.snapshots[next.snapshots.length - 1]!.metrics;
  for (const id of props.fr.metrics.map((m) => m.id) as MetricId[]) {
    metrics[id] = { ...(metrics[id] ?? missing("not-tracked", "sprint")), definitionNote: text };
  }
  return next;
}

describe("the appendix's pages (A2.1)", () => {
  it("the widths are the stylesheet's", () => {
    const css = readFileSync(join(process.cwd(), "src/app/[locale]/aarrr-funnel-template/_engine/deck/deck.module.css"), "utf8");
    const widths: number[] = [];
    for (const m of css.matchAll(/((?:\.annex thead th:nth-child\(\d\),?\s*)+)\{\s*width:\s*(\d+)%;/g)) {
      for (const n of m[1]!.matchAll(/nth-child\((\d)\)/g)) widths[Number(n[1]) - 1] = Number(m[2]) / 100;
    }
    expect(widths).toEqual(Object.values(ANNEX_COLUMNS));
    expect(Object.values(ANNEX_COLUMNS).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 5);
  });

  it("wraps at spaces, never at a no-break space, and breaks a word too long for its line", () => {
    expect(wrappedLines("", 100)).toBe(1); // an empty cell prints « — »
    expect(wrappedLines("solide", 100)).toBe(1);
    expect(wrappedLines("un deux trois quatre", 100)).toBe(3);
    // « 5 000 € » with no-break spaces is one word, 7 glyphs wide: it wraps whole.
    expect(wrappedLines("aaaa 5 000 €", 100)).toBe(2);
    expect(wrappedLines("a".repeat(25), 100)).toBe(3);
  });

  it("a definition makes its row taller, and a longer one taller still", () => {
    const row: AnnexCells = { label: "Taux d'activation", formula: "activés ÷ inscrits", definition: "", window: "7 jours", period: "août 2026", source: "GA4", status: "Mesuré", confidence: "solide" };
    const plain = annexRowHeight(row);
    const defined = annexRowHeight({ ...row, definition: "un projet édité" });
    const long = annexRowHeight({ ...row, definition: LONG_DEFINITION.fr });
    expect(plain).toBeCloseTo(17 + 18 * 1.35, 5);
    expect(defined).toBeGreaterThan(plain);
    expect(long).toBeGreaterThan(defined);
  });

  for (const locale of ["fr", "en"] as const) {
    describe(locale, () => {
      it("the §6.0 example takes two pages, evened out, every row once and in order", () => {
        const model = deck(exampleState(), locale);
        const pages = rowsOf(model);
        expect(pages).toHaveLength(2);
        expect(annexSlides(model).map((s) => [s.id, s.title.values])).toEqual([
          ["annex", { i: "1", n: "2" }],
          ["annex:2", { i: "2", n: "2" }],
        ]);
        const all = pages.flat();
        // The numbers this setup asks for (§18.2.1): the props carry every motion's.
        const asked = new Set(shapesOf(exampleState().setup.motions).map((s) => s.id));
        expect(all.map((r) => r.label)).toEqual(props[locale].metrics.filter((m) => asked.has(m.id)).map((m) => m.name));
        const heights = pages.map((p) => p.reduce((sum, r) => sum + annexRowHeight(r), 0));
        for (const h of heights) expect(h).toBeLessThanOrEqual(ANNEX_PAGE_HEIGHT);
        // Evened out: the two pages differ by less than the tallest row.
        expect(Math.abs(heights[0]! - heights[1]!)).toBeLessThanOrEqual(Math.max(...all.map(annexRowHeight)));
      });

      it("the worst case — every definition at its limit — fits every page, on more pages", () => {
        const definition = LONG_DEFINITION[locale];
        expect([...definition].length).toBeLessThanOrEqual(TEXT_LIMITS.definitionNote);
        expect([...definition].length).toBeGreaterThan(TEXT_LIMITS.definitionNote - 10);
        const model = deck(withDefinitions(exampleState(), definition), locale);
        const pages = rowsOf(model);
        expect(pages.length).toBeGreaterThan(2);
        expect(pages.flat().every((r) => r.definition === definition)).toBe(true);
        for (const page of pages) expect(page.reduce((sum, r) => sum + annexRowHeight(r), 0)).toBeLessThanOrEqual(ANNEX_PAGE_HEIGHT);
        expect(annexSlides(model).map((s) => s.index)).toEqual(pages.map((_, i) => 6 + i));
      });

      it("is never one page: the catalogue's rows, each at its shortest, run past one page", () => {
        // An empty engine: no definition, every number « to do ». The title's
        // « (1/1) » would need this to hold on one page — it never does.
        expect(rowsOf(deck(emptyState(), locale)).length).toBeGreaterThanOrEqual(2);
        const shortest: AnnexCells = { label: "x", formula: "x", definition: "", window: "", period: "", source: "", status: "x", confidence: "x" };
        expect(props[locale].metrics.length * annexRowHeight(shortest)).toBeGreaterThan(ANNEX_PAGE_HEIGHT);
      });
    });
  }

  it("its pages go in or out of the deck together, and give up their numbers together", () => {
    const state = exampleState();
    state.deck.include.annex = false;
    const model = deck(state, "fr");
    expect(annexSlides(model).map((s) => [s.id, s.included, s.index])).toEqual([
      ["annex", false, null],
      ["annex:2", false, null],
    ]);
  });

  it("an empty list is one empty page, and a row taller than a page gets a page of its own", () => {
    expect(annexPages([])).toEqual([[]]);
    const row = (label: string): AnnexCells => ({ label, formula: "f", definition: "", window: "", period: "", source: "", status: "", confidence: "" });
    const pages = annexPages([row("a"), row("b"), row("c")], 50);
    expect(pages.map((p) => p.map((r) => r.label))).toEqual([["a"], ["b"], ["c"]]);
  });
});
