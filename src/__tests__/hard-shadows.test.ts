import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Design audit S-6 (2026-09-29), the video call of the game.
 *
 * 1. « No blurred shadows » (.design-sync/conventions.md): every shadow of the
 *    system is a hard offset or a hard ring. The call was the one exception —
 *    a 90px red glow inside the picture when the CEO is angry. It is a ring
 *    the stamp's weight now, and this holds every stylesheet to the rule.
 * 2. A transition belongs to the element whose property changes. The call's
 *    `filter` transition sat on `.frame`, while the filter is set on the
 *    picture inside it: the frame's filter never changes, so a change of mood
 *    cut instead of fading, and nothing looked wrong in the code.
 *
 * Non-vacuity (2026-09-29): the old halo put back fails the first test on
 * VideoCall.module.css alone; the transition moved back onto `.frame` fails
 * the second.
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

/** Splits a shadow list on its top-level commas (not the ones inside rgba()). */
function layers(value: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of value) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(current);
      current = "";
    } else current += ch;
  }
  return [...out, current].map((s) => s.trim()).filter(Boolean);
}

/** A var() that holds a length, by the scale it belongs to; any other var() is a colour. */
const LENGTH_VAR = /^var\(--(border-width|space-|dist-|hit-|focus-)/;

/** The blur radius of one shadow layer: its third length, or 0 when it has two. */
function blurOf(layer: string): string {
  const tokens = layer.match(/var\([^()]*\)|rgba?\([^()]*\)|#[0-9a-f]+|[^\s]+/gi) ?? [];
  const lengths = tokens.filter((t) => /^-?(\d*\.?\d+)(px|rem|em)?$/.test(t) || LENGTH_VAR.test(t));
  return lengths[2] ?? "0";
}

describe("every shadow is hard: no blur radius (design audit S-6)", () => {
  const sheets = walk(SRC);

  it("scans the real stylesheets, tokens included", () => {
    expect(sheets.length).toBeGreaterThan(80);
    expect(sheets.some((f) => f.endsWith(join("tokens", "shape.css")))).toBe(true);
  });

  it("draws no shadow with a blur", () => {
    const blurred: string[] = [];
    let checked = 0;
    for (const file of sheets) {
      for (const m of strip(readFileSync(file, "utf8")).matchAll(/(?:box-shadow|--shadow-[a-z-]+)\s*:\s*([^;}]+)/g)) {
        for (const layer of layers(m[1]!)) {
          checked++;
          const blur = blurOf(layer);
          if (!/^0(px)?$/.test(blur)) blurred.push(`${relative(process.cwd(), file)}: ${layer}`);
        }
      }
    }
    // Non-vacuity: the hard shadows of the system and every ring are read.
    expect(checked).toBeGreaterThan(60);
    expect(blurred).toEqual([]);
  });
});

describe("the call fades the picture it changes (design audit S-6)", () => {
  const css = strip(readFileSync(join(SRC, "components", "game", "VideoCall.module.css"), "utf8"));
  // Innermost rules only (`sel { decls }`): enough for a sheet with @media and @keyframes.
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selector: m[1]!.trim().replace(/\s+/g, " "),
    body: m[2]!,
  }));

  it("puts the filter transition on the element whose filter changes, and only there", () => {
    const setsFilter = rules.filter((r) => /(^|[\s;])filter\s*:/.test(r.body));
    const transitionsFilter = rules.filter((r) => /transition\s*:[^;]*\bfilter\b/.test(r.body));
    // Non-vacuity: cold, ended and ringing each change the picture's filter.
    expect(setsFilter.length).toBeGreaterThanOrEqual(2);
    expect(transitionsFilter.map((r) => r.selector)).toEqual([".frame :where(svg)"]);
    for (const rule of setsFilter) {
      for (const selector of rule.selector.split(",")) {
        expect(selector.trim().endsWith(".frame :where(svg)"), selector).toBe(true);
      }
    }
  });
});
