import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Design audit L-7: a stacking scale existed (tokens/spacing.css, --z-*) and
 * nothing read it — the glossary popover wrote 30, its sheet 40 and its
 * backdrop 39, the skip link 100, the game's action bar 1, each by hand, and
 * a new layer had to guess where it fitted. Every z-index now reads the
 * scale (a `calc()` from it is allowed: the backdrop is « one under the
 * popover »), so the order of the layers is written in one place.
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

describe("every z-index reads the stacking scale (L-7)", () => {
  it("scans the real stylesheets", () => {
    expect(SHEETS.length).toBeGreaterThan(80);
  });

  it("writes no layer number of its own", () => {
    const offending: string[] = [];
    let checked = 0;
    for (const file of SHEETS) {
      const source = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
      for (const m of source.matchAll(/z-index\s*:\s*([^;}]+)/g)) {
        checked++;
        const value = (m[1] ?? "").trim();
        if (!/^(var\(--z-[a-z]+\)|calc\(var\(--z-[a-z]+\)\s*[-+]\s*\d+\)|auto)$/.test(value)) {
          offending.push(`${relative(process.cwd(), file)}: z-index: ${value}`);
        }
      }
    }
    expect(checked).toBeGreaterThanOrEqual(6);
    expect(offending).toEqual([]);
  });
});
