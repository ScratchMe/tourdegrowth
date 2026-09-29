import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Design audit A1.7 (2026-09-29): the loading screen's message kept a 6px
 * corner, the button step of the scale before design I rounded it to 12. A
 * corner is a step of tokens/shape.css — tag, button, panel, card, round —
 * and a literal is how a step gets left behind when the scale moves.
 *
 * What stays a literal: the corner of a small mark, 3px or less (a chart
 * bar, a swatch, a focus outline's softening) — under the scale's first
 * step, where a token would only rename the number.
 *
 * Non-vacuity (2026-09-29): the 6px put back fails the second test on that
 * line alone.
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

describe("every corner reads the radius scale (design audit A1.7)", () => {
  const corners: { where: string; value: string }[] = [];
  for (const file of SHEETS) {
    const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    for (const m of css.matchAll(/(?<![-\w])border(?:-[a-z]+)*-radius\s*:\s*([^;}]+)/g)) {
      corners.push({ where: `${relative(process.cwd(), file)}: ${m[0].trim()}`, value: m[1]!.trim() });
    }
  }

  it("scans the real stylesheets", () => {
    expect(corners.length).toBeGreaterThan(100);
  });

  it("writes no corner larger than a small mark's", () => {
    const offending = corners.filter(({ value }) => {
      const bare = value.replace(/var\([^()]*\)/g, " ").replace(/calc\([^;]*\)/g, " ");
      return [...bare.matchAll(/(?<![\w.-])(\d*\.?\d+)px\b/g)].some((m) => Number(m[1]) > 3);
    });
    expect(offending.map(({ where }) => where)).toEqual([]);
  });
});
