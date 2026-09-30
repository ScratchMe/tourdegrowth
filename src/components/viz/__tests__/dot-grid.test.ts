import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DotGrid, DotLegend, type DotMark } from "../DotGrid";

/*
 * viz/DotGrid — design audit S-10 (CHANTIERS.md A2.2, 2026-09-29): the
 * funnel as dots was drawn three times outside the system (the peloton,
 * « Et si », the slides), at three sizes with three sets of strokes.
 *
 * Non-vacuity (2026-09-29): putting the slide's local grid back in
 * SlidePeloton.tsx (its `data-dot`-less spans do not count, its `DOT_CLASS`
 * map does) fails « only viz/DotGrid draws a dot » on that file; the
 * peloton's `repeat(10, …)` grid put back in Peloton.module.css fails
 * « only its stylesheet styles one ».
 */

const render = (props: Parameters<typeof DotGrid>[0]) => renderToStaticMarkup(createElement(DotGrid, props));
const count = (html: string, needle: string) => html.split(needle).length - 1;

describe("DotGrid markup", () => {
  it("draws one dot per mark, each named by data-dot, under one sentence", () => {
    const dots: DotMark[] = [...Array<DotMark>(18).fill("filled"), ...Array<DotMark>(3).fill("range"), ...Array<DotMark>(79).fill("empty")];
    const html = render({ grid: { kind: "known", dots }, label: "18 of 100 reach first value" });
    expect(html).toMatch(/^<div role="img" aria-label="18 of 100 reach first value"/);
    expect(count(html, "data-dot=")).toBe(100);
    expect(count(html, 'data-dot="filled"')).toBe(18);
    expect(count(html, 'data-dot="range"')).toBe(3);
    // The dots are for the eye: the sentence is the reading.
    expect(count(html, 'aria-hidden="true"')).toBe(100);
  });

  it("grows past 100 row by row: every mark it is given is drawn", () => {
    const dots: DotMark[] = [...Array<DotMark>(100).fill("filled"), ...Array<DotMark>(20).fill("gained")];
    expect(count(render({ grid: { kind: "known", dots }, label: "x" }), "data-dot=")).toBe(120);
  });

  it("an unknown grid is a panel with a « ? », never a single dot — zero is a measurement", () => {
    const html = render({ grid: { kind: "unknown", dots: [] }, label: "Day-30 retention — not measured" });
    expect(html).toContain('data-state="unknown"');
    expect(count(html, "data-dot=")).toBe(0);
    expect(html).toMatch(/aria-hidden="true">\?<\/span>/);
  });

  it("the highlight is the grid's, and only a known grid takes it", () => {
    const known = render({ grid: { kind: "known", dots: ["filled"] }, label: "x", highlighted: true });
    const unknown = render({ grid: { kind: "unknown", dots: [] }, label: "x", highlighted: true });
    expect(known).toMatch(/class="[^"]*highlighted/);
    expect(unknown).not.toMatch(/class="[^"]*highlighted/);
  });

  it("a slide grid takes the slide size", () => {
    expect(render({ grid: { kind: "known", dots: ["filled"] }, label: "x", medium: "slide" })).toMatch(/class="[^"]*slide/);
    expect(render({ grid: { kind: "known", dots: ["filled"] }, label: "x" })).toMatch(/class="[^"]*screen/);
  });
});

describe("DotLegend markup", () => {
  it("one entry per mark named, the unknown one drawn as the panel's swatch", () => {
    const html = renderToStaticMarkup(
      createElement(DotLegend, {
        "aria-hidden": true,
        items: [
          { mark: "filled", label: "measured" },
          { mark: "unknown", label: "not measured" },
        ],
      }),
    );
    expect(html).toMatch(/^<ul[^>]*aria-hidden="true"/);
    expect(count(html, "<li>")).toBe(2);
    expect(html).toMatch(/unknownSwatch[^"]*"[^>]*><\/span>not measured/);
  });
});

describe("one grid in the system (S-10)", () => {
  const SRC = join(process.cwd(), "src");
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const full = join(dir, name);
      return statSync(full).isDirectory() ? walk(full) : [full];
    });
  const files = walk(SRC).filter((f) => !f.includes("__tests__"));
  const HOME = join("components", "viz", "DotGrid");

  it("only viz/DotGrid draws a dot", () => {
    const drawn = files.filter((f) => /\.tsx$/.test(f) && /data-dot=|DOT_CLASS/.test(readFileSync(f, "utf8")));
    expect(drawn.map((f) => relative(process.cwd(), f))).toEqual(["src/components/viz/DotGrid.tsx"]);
  });

  it("only its stylesheet styles one, and the three views compose it", () => {
    // A grid of counts is ten to a row: no other sheet lays one out (the game's pagination dots are not counts).
    const styled = files.filter((f) => f.endsWith(".css") && !f.includes(HOME) && /repeat\(\s*10\s*,/.test(readFileSync(f, "utf8")));
    expect(styled.map((f) => relative(process.cwd(), f))).toEqual([]);
    const engine = join(SRC, "app", "[locale]", "aarrr-funnel-template", "_engine");
    for (const view of ["Peloton.tsx", "WhatIfPanel.tsx", join("deck", "SlidePeloton.tsx")]) {
      expect(readFileSync(join(engine, view), "utf8"), view).toMatch(/<DotGrid\b/);
    }
  });
});
