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
 * where the screen had a size of its own. The slides are the exception, with
 * their own scale to finish (S-8, CHANTIERS.md A2.1).
 *
 * A1.4 — nothing under 11px. The HC flag of the stage profile and the head of
 * the kilometre marker were 10px, written over tokens of 11.
 *
 * Non-vacuity (2026-09-29): a `font-size: 10px` put back on the marker's head
 * fails both the second test (a literal) and the fourth (under the floor);
 * a token set to 10px fails the fourth alone.
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

/** The slides keep their own literal scale until A2.1 completes --slide-*. */
const SLIDES = join("aarrr-funnel-template", "_engine", "deck");

const SHEETS = walk(SRC).filter((f) => !f.includes(join("styles", "tokens")) && !f.includes(SLIDES));
const TYPOGRAPHY = strip(readFileSync(join(SRC, "styles", "tokens", "typography.css"), "utf8"));

const NOT_ON_THE_SCALE: Record<string, string> = {
  "src/components/brand/SiteFooter.module.css: font: 700 100px var(--font-display)":
    "SVG text: 100 is in the viewBox's user units (SiteFooter.tsx lays the wordmark out in them), not a type size",
  "src/app/(app)/r/[id]/ResultView.module.css: font: 500 12px/1.4 var(--font-ui)":
    "the « built by » credit, Inter 12px under the scale's own 13.5px floor for Inter: a design question (CHANTIERS.md, C23)",
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
