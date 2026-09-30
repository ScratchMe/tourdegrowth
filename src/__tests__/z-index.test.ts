import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Design audit L-7: a stacking scale existed (tokens/spacing.css, --z-*) and
 * nothing read it — the glossary popover wrote 30, its sheet 40 and its
 * backdrop 39, the skip link 100, the game's action bar 1, each by hand, and
 * a new layer had to guess where it fitted. Every z-index now reads the
 * scale (a `calc()` from it is allowed), so the order of the layers is
 * written in one place.
 *
 * 2026-09-29 (CHANTIERS.md A4): the glossary popover moved to the top layer
 * and its three z-index went with it, `--z-popover` too. The scale keeps no
 * layer nothing reads. Non-vacuity: `--z-popover: 40` put back fails the
 * last test.
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
    // Five on 2026-09-29: the header, the skip link, the game's action bar,
    // the engine tabs' edge arrows, the news screen out of the top layer.
    expect(checked).toBeGreaterThanOrEqual(5);
    expect(offending).toEqual([]);
  });

  it("keeps no layer nothing reads", () => {
    const scale = readFileSync(join(SRC, "styles", "tokens", "spacing.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const layers = [...scale.matchAll(/(--z-[a-z]+)\s*:/g)].map((m) => m[1]!);
    expect(layers.length).toBeGreaterThanOrEqual(3);
    const read = SHEETS.map((f) => readFileSync(f, "utf8")).join("\n");
    expect(layers.filter((layer) => !read.includes(`var(${layer})`))).toEqual([]);
  });
});
