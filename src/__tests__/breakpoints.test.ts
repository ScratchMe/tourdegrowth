import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Design audit L-11 / S-18: 51 × `max-width: 760px` and 10 × `761`, then
 * 960 (×4, the engine), 560 (×2, the game) and a 519 container query, with no
 * constant written anywhere. The rule now, documented in
 * .design-sync/conventions.md (« Responsive »):
 *
 *  - a COMPONENT lays out on its own width, with a container query — it can
 *    be set in a 1 040px board, a 760px column or a phone, and only its own
 *    box knows which;
 *  - a VIEWPORT query is for what really depends on the window, and there
 *    are four, each for a reason listed below. A fifth is a decision, not a
 *    number to type: this test fails until it is added here with its reason.
 */
const VIEWPORT_BREAKPOINTS: Record<number, string> = {
  760: "the phone line: every component's mobile scale (DESIGN-BRIEF, 390 to 430)",
  761: "the same line, from above",
  640: "the glossary popover docks to the bottom of the WINDOW under it (a fixed sheet)",
  641: "the same line, from above",
  960: "a page breaks out of its reading column to the app width (the engine board, the audit tool)",
  1099: "the engine page drops its stopwatch, which would squeeze the title into a narrow column",
  1100: "the same line, from above",
};

const SRC = join(process.cwd(), "src");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return name.endsWith(".css") ? [full] : [];
  });
}

const SHEETS = walk(SRC);

describe("viewport breakpoints are a short, written list (L-11)", () => {
  it("scans the real stylesheets", () => {
    expect(SHEETS.length).toBeGreaterThan(80);
  });

  it("uses no viewport width that is not on the list", () => {
    const offending: string[] = [];
    let checked = 0;
    for (const file of SHEETS) {
      const source = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
      for (const m of source.matchAll(/@media[^{]*?\((?:min|max)-width:\s*(\d+)px\)/g)) {
        checked++;
        const px = Number(m[1]);
        if (!(px in VIEWPORT_BREAKPOINTS)) offending.push(`${relative(process.cwd(), file)}: @media … ${px}px`);
      }
    }
    expect(checked).toBeGreaterThan(50);
    expect(offending).toEqual([]);
  });

  it("the components that live in a container read their container, not the window", () => {
    // The five the audit found on a viewport width (S-18): each now has its
    // own container query, and no viewport rule of the old width.
    // The board keeps one viewport rule of its own, the breakout of the page
    // column (page layout, on the list above). What moved was its tab strip;
    // the tabs left with A18 T2.b, and the hybrid's columns read the same
    // container query. The collect hub's two columns left with A18 T3.c: the
    // requests are one screen (AskList), one card per role, a single column.
    // The total band's three blocks left with A18 T5 (TotalBand stacks on a phone by its own 760px rule, on the
    // list above): the container query now opens with the filled example's two columns.
    const expectations: [string, RegExp, RegExp][] = [
      ["app/[locale]/aarrr-funnel-template/_engine/Board.module.css", /@container board \(min-width: 860px\)\s*\{\s*\.motionColumns/, /@media[^{]*960px\)\s*\{\s*\.motionColumns/],
      ["app/[locale]/aarrr-funnel-template/_engine/WhatIfPanel.module.css", /@container whatif \(min-width: 860px\)/, /@media[^{]*960px\)/],
      ["components/game/RevealCells.module.css", /@container \(max-width: 520px\)/, /@media[^{]*560px\)/],
      ["components/game/PatternCatalogue.module.css", /@container \(max-width: 520px\)/, /@media[^{]*560px\)/],
    ];
    for (const [file, query, old] of expectations) {
      const source = readFileSync(join(SRC, file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
      expect(source, file).toMatch(query);
      expect(source, file).not.toMatch(old);
    }
  });
});
