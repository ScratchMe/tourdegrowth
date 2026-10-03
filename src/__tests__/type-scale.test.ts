import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Design audit A1.4 and A1.5 (2026-09-29).
 *
 * A1.5 — every font size reads the type scale (tokens/typography.css).
 * Fifteen sizes were written in pixels in components, beside the tokens they
 * shadowed. They now read a step of the scale: an existing one where the
 * literal sat within half a pixel of it, a step added and named by its use
 * where the screen had a size of its own. The « built by » credit became a
 * named step on 2026-09-29 (C23, below). The slides joined the same day
 * (S-8, CHANTIERS.md A2.1): their 23 literal sizes are --slide-* steps, and
 * none of those is under 18px (last describe).
 *
 * A1.4 — nothing under 11px. The HC flag of the stage profile and the head of
 * the kilometre marker were 10px, written over tokens of 11.
 *
 * Non-vacuity (2026-09-29): a `font-size: 10px` put back on the marker's head
 * fails both the second test (a literal) and the fourth (under the floor);
 * a token set to 10px fails the fourth alone. On the slides: the annex
 * header's `font-size: 15px` put back fails « writes no size of its own » and
 * « the slides read only slide steps », on that line; --slide-table back at
 * 17px fails « every slide step is 18px or more » alone, on that token.
 */

const SRC = join(process.cwd(), "src");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return name.endsWith(".css") ? [full] : [];
  });
}

const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

const SHEETS = walk(SRC).filter((f) => !f.includes(join("styles", "tokens")));
/**
 * The type scale: typography.css, and the engine's few steps of its own
 * (tokens/engine.css, A18 T0), held to the same floors as the rest.
 */
const TYPOGRAPHY = ["typography.css", "engine.css", "money.css"].map((f) => strip(readFileSync(join(SRC, "styles", "tokens", f), "utf8"))).join("\n");

const NOT_ON_THE_SCALE: Record<string, string> = {
  "src/components/brand/SiteFooter.module.css: font: 700 100px var(--font-display)":
    "SVG text: 100 is in the viewBox's user units (SiteFooter.tsx lays the wordmark out in them), not a type size",
};

function declarations(): { where: string; value: string }[] {
  const out: { where: string; value: string }[] = [];
  for (const file of SHEETS) {
    for (const m of strip(readFileSync(file, "utf8")).matchAll(/(?<![-\w])(font-size|font)\s*:\s*([^;}]+)/g)) {
      out.push({ where: `${relative(process.cwd(), file)}: ${m[1]}: ${m[2]!.trim()}`, value: m[2]!.trim() });
    }
  }
  return out;
}

const literal = (value: string) => /(?<![\w.-])\d*\.?\d+(px|rem|em)\b/.test(value.replace(/var\([^()]*\)/g, " "));

describe("every font size reads the type scale (design audit A1.5)", () => {
  it("scans the real stylesheets", () => {
    expect(SHEETS.length).toBeGreaterThan(80);
    expect(declarations().length).toBeGreaterThan(300);
  });

  it("writes no size of its own", () => {
    const offending = declarations()
      .filter(({ where, value }) => literal(value) && !(where in NOT_ON_THE_SCALE))
      .map(({ where }) => where);
    expect(offending).toEqual([]);
  });

  it("the allowance lists only sizes that are still there", () => {
    const present = new Set(declarations().map(({ where }) => where));
    expect(Object.keys(NOT_ON_THE_SCALE).filter((where) => !present.has(where))).toEqual([]);
  });
});

describe("Inter's reading floor, 13.5px, has exactly its two named exceptions (C23)", () => {
  /*
   * Antoine, 2026-09-29: the result's « built by » credit stays Inter 12px —
   * discreet, and on one line on a 390px phone, where 13.5px or mono would
   * wrap it — as a named step of the scale. The compact button's 13px label
   * was already under the floor. Anything else under it is a regression.
   * Non-vacuity (2026-09-29): --body-sm set to 13px fails this on that token.
   */
  it("lists every Inter step under 13.5px, and only the two decided", () => {
    const under: string[] = [];
    let inter = 0;
    for (const m of TYPOGRAPHY.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
      if (!m[2]!.includes("var(--font-ui)")) continue;
      inter++;
      const size = m[2]!.match(/(\d*\.?\d+)px/);
      if (size && Number(size[1]) < 13.5) under.push(m[1]!);
    }
    expect(inter).toBeGreaterThan(10);
    expect(under.sort()).toEqual(["--body-credit", "--label-button-sm"]);
  });
});

describe("nothing is set under 11px (design audit A1.4)", () => {
  it("no step of the scale, and no size left in a component, is under 11px", () => {
    const sizes: string[] = [];
    // The scale: every px length in a token that sets a size (the first
    // length of a `font` shorthand, or a --size-* token).
    for (const m of TYPOGRAPHY.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
      const [name, value] = [m[1]!, m[2]!];
      const first = value.match(/(\d*\.?\d+)px/);
      if (first && (name.startsWith("--size-") || /var\(--font-/.test(value))) sizes.push(`${name} ${first[1]}`);
    }
    // And whatever a component still writes by hand (the allowance above included).
    for (const { where, value } of declarations()) {
      const m = value.replace(/var\([^()]*\)/g, " ").match(/(\d*\.?\d+)px/);
      if (m) sizes.push(`${where} ${m[1]}`);
    }
    expect(sizes.length).toBeGreaterThan(30);
    expect(sizes.filter((s) => Number(s.split(" ").pop()) < 11)).toEqual([]);
  });
});

describe("nothing on a slide is under 18px (design audit S-8, A2.1)", () => {
  /*
   * A slide is 1920px wide and projected on a wall: the slides had 23 sizes
   * of their own, down to 14px. Every --slide-* step (and --size-slide-*) is
   * 18px or more, and the deck's sheet reads only those, the one wordmark
   * size included. e2e/engine-deck.spec.ts measures what a slide renders.
   */
  const DECK = readFileSync(join(SRC, "app", "[locale]", "aarrr-funnel-template", "_engine", "deck", "deck.module.css"), "utf8");

  it("every slide step is 18px or more", () => {
    const steps: [string, number][] = [];
    for (const m of TYPOGRAPHY.matchAll(/(--(?:size-)?slide-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
      const size = m[2]!.match(/(\d*\.?\d+)px/);
      if (size) steps.push([m[1]!, Number(size[1])]);
    }
    // Non-vacuity: the scale has its twenty-odd steps, not a handful.
    expect(steps.length).toBeGreaterThan(20);
    expect(steps.filter(([, px]) => px < 18).map(([name]) => name)).toEqual([]);
  });

  it("the slides read only slide steps", () => {
    // The slide rules end where the screen around them starts (deck.module.css says so in its header).
    const slides = strip(DECK.slice(0, DECK.indexOf("The screen around the slides")));
    const reads = [...slides.matchAll(/(?<![-\w])(?:font|font-size)\s*:\s*([^;}]+)/g)].map((m) => m[1]!.trim());
    expect(reads.length).toBeGreaterThan(40);
    expect(reads.filter((value) => !/^var\(--(?:size-)?slide-[a-z0-9-]+\)$/.test(value))).toEqual([]);
  });
});
