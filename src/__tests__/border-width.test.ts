import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Design audit S-17 (2026-09-29): the system draws its edges 2px, and the
 * game had 1, 3, 4 and 5px written by hand in a dozen places, beside some
 * fifty `2px solid` / `2px dashed` that did not read --border-width. Every
 * border and outline width now reads a token: --border-width (an edge),
 * --border-width-stamp (an inked mark over an edge),
 * --border-width-hairline (a line under the content) or --border-width-fine
 * (the space band's strokes) — tokens/shape.css says which is which. A new width is a new token, argued there, not a literal.
 *
 * Non-vacuity (2026-09-29): putting back the game's 4px boss edge fails the
 * second test on exactly that line; putting back one `2px solid` fails it on
 * that line too. The allowance below is checked both ways — a listed line
 * that disappears fails the third test, so the list cannot go stale.
 */

const SRC = join(process.cwd(), "src");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return name.endsWith(".css") ? [full] : [];
  });
}

const SHEETS = walk(SRC).filter((f) => !f.includes(join("styles", "tokens")));
const SHAPE = readFileSync(join(SRC, "styles", "tokens", "shape.css"), "utf8");

/**
 * Widths still written by hand, each with the reason it is not a token yet.
 * Keyed `file: declaration` so a second occurrence is not covered by the first.
 */
const NOT_YET_A_TOKEN: Record<string, string> = {
  "src/app/[locale]/aarrr-funnel-template/_engine/Peloton.module.css: outline: 1.5px dashed var(--viz-axis)":
    "the peloton's « unknown » swatch, drawn at the grid's own stroke — it takes the stroke of viz/DotGrid when A2.2 redraws the grid",
};

/** Border and outline declarations whose value can carry a width. */
const WIDTH_PROPERTY =
  /(?<![-\w])((?:border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-width)?)|outline(?:-width)?)\s*:\s*([^;}]+)/g;

function declarations(): { where: string; value: string }[] {
  const out: { where: string; value: string }[] = [];
  for (const file of SHEETS) {
    const source = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    for (const m of source.matchAll(WIDTH_PROPERTY)) {
      const property = m[1]!;
      const value = m[2]!.trim();
      out.push({ where: `${relative(process.cwd(), file)}: ${property}: ${value}`, value });
    }
  }
  return out;
}

/** A length written as a number, outside any var(): `1px`, `1.5px`, `0.2rem`. Zero is no width. */
function literalWidths(value: string): string[] {
  const bare = value.replace(/var\([^()]*(?:\([^()]*\))?[^()]*\)/g, " ");
  return [...bare.matchAll(/(?<![\w.-])(\d*\.?\d+)(px|rem|em)\b/g)].filter((m) => Number(m[1]) !== 0).map((m) => m[0]);
}

describe("every border width reads a token (design audit S-17)", () => {
  it("scans the real stylesheets", () => {
    expect(SHEETS.length).toBeGreaterThan(80);
    // The tokens exist, with the values the header of shape.css argues for.
    expect(SHAPE).toMatch(/--border-width:\s*2px;/);
    expect(SHAPE).toMatch(/--border-width-stamp:\s*3px;/);
    expect(SHAPE).toMatch(/--border-width-hairline:\s*1px;/);
    expect(SHAPE).toMatch(/--border-width-fine:\s*1\.5px;/);
    // And the three shorthands draw their edge at --border-width, not a copy of it.
    for (const name of ["border-solid", "border-dashed", "border-rule"]) {
      expect(SHAPE).toMatch(new RegExp(`--${name}:\\s*var\\(--border-width\\) (solid|dashed) `));
    }
  });

  it("writes no width of its own", () => {
    const all = declarations();
    // Non-vacuity: the sheets draw well over a hundred borders and outlines.
    expect(all.length).toBeGreaterThan(150);
    const offending = all
      .filter(({ where, value }) => literalWidths(value).length > 0 && !(where in NOT_YET_A_TOKEN))
      .map(({ where }) => where);
    expect(offending).toEqual([]);
  });

  it("the allowance lists only widths that are still there", () => {
    const present = new Set(declarations().map(({ where }) => where));
    expect(Object.keys(NOT_YET_A_TOKEN).filter((where) => !present.has(where))).toEqual([]);
  });
});
