import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as og from "@/lib/og/tokens";
import { COLOR_TOKENS, DERIVED, PRIMITIVES, SEMANTIC, resolveColor } from "@/styles/tokens/tokens";

/**
 * DS v3 (M-8) — one source of truth for colors, enforced rather than hoped
 * for. colors.css stays hand-written (it carries the reasoning next to each
 * value), `styles/tokens/tokens.ts` carries the same values as typed data for
 * everything CSS can't reach (Satori, images, slides), and this test fails
 * the moment the two disagree — in either direction, so a color added to one
 * side only is as red as a color changed on one side only.
 *
 * It also holds the one rule the three-block layout exists for (see the
 * colors.css header): a token built from another SEMANTIC token must be
 * declared on `[data-world]`, or a world that rebinds the semantic layer
 * would leave it frozen at its paper value. That failure is invisible on
 * every page that exists today, which is exactly why it is a test.
 */

const TOKENS_DIR = path.join(process.cwd(), "src/styles/tokens");

type Block = { selector: string; decls: Map<string, string> };

/** Blocks of a token file, comments stripped, whitespace normalised. */
function parseBlocks(file: string): Block[] {
  const css = readFileSync(path.join(TOKENS_DIR, file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks: Block[] = [];
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = (m[1] ?? "").replace(/\s+/g, "").trim();
    if (selector.startsWith("@") || !selector.includes(":root")) continue; // @keyframes etc.
    const decls = new Map<string, string>();
    for (const d of (m[2] ?? "").matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) {
      decls.set(d[1] ?? "", (d[2] ?? "").replace(/\s+/g, " ").trim());
    }
    blocks.push({ selector, decls });
  }
  return blocks;
}

const colorBlocks = parseBlocks("colors.css");
const blockFor = (selector: string) => {
  const b = colorBlocks.find((x) => x.selector === selector);
  if (!b) throw new Error(`colors.css has no block for ${selector}`);
  return Object.fromEntries(b.decls);
};

const refsOf = (value: string) => [...value.matchAll(/var\(--([a-z0-9-]+)\)/g)].map((m) => m[1] ?? "");
const PRIMITIVE_NAMES = new Set(Object.keys(PRIMITIVES));
const SEMANTIC_NAMES = new Set([...Object.keys(SEMANTIC), ...Object.keys(DERIVED)]);

describe("colors.css and tokens.ts hold the same values", () => {
  it("colors.css is exactly the three layer blocks, in order", () => {
    expect(colorBlocks.map((b) => b.selector)).toEqual([':root', ':root,[data-world="paper"]', ":root,[data-world]"]);
  });

  it("the PRIMITIVES block equals PRIMITIVES", () => {
    expect(blockFor(":root")).toEqual(PRIMITIVES);
  });

  it("the SEMANTIC block equals SEMANTIC", () => {
    expect(blockFor(':root,[data-world="paper"]')).toEqual(SEMANTIC);
  });

  it("the DERIVED block equals DERIVED", () => {
    expect(blockFor(":root,[data-world]")).toEqual(DERIVED);
  });

  it("no token name appears in two maps", () => {
    const all = [...Object.keys(PRIMITIVES), ...Object.keys(SEMANTIC), ...Object.keys(DERIVED)];
    expect(new Set(all).size).toBe(all.length);
  });

  it("every token resolves to a literal color", () => {
    for (const name of Object.keys(COLOR_TOKENS) as (keyof typeof COLOR_TOKENS)[]) {
      expect(resolveColor(name), name).toMatch(/^(#[0-9a-f]{6}|rgba\(\d+, \d+, \d+, [\d.]+\))$/);
    }
  });
});

describe("each layer only references the layer beneath it", () => {
  it("primitives are literals", () => {
    for (const [name, value] of Object.entries(PRIMITIVES)) expect(refsOf(value), name).toEqual([]);
  });

  it("semantic tokens are literals or references to primitives", () => {
    // A semantic token that pointed at another semantic token would be
    // resolved once on :root and never follow a world's rebinding.
    for (const [name, value] of Object.entries(SEMANTIC)) {
      for (const ref of refsOf(value)) expect(PRIMITIVE_NAMES.has(ref), `--${name} → --${ref}`).toBe(true);
    }
  });

  it("derived tokens are built from semantic tokens only", () => {
    for (const [name, value] of Object.entries(DERIVED)) {
      const refs = refsOf(value);
      expect(refs.length, name).toBeGreaterThan(0);
      for (const ref of refs) expect(SEMANTIC_NAMES.has(ref), `--${name} → --${ref}`).toBe(true);
    }
  });

  it("every shorthand in the other token files that reads a world-scoped token is redeclared per world", () => {
    const files = ["shape.css", "spacing.css", "typography.css", "motion.css"];
    const blocks = files.flatMap((file) => parseBlocks(file).map((b) => ({ file, ...b })));
    // World-scoped = the semantic layer, plus anything already declared on
    // [data-world] (so --state-hover-shadow, built on --shadow-hover, is
    // held to the same rule as --shadow-hover itself).
    const worldScoped = new Set(SEMANTIC_NAMES);
    for (const b of blocks) if (b.selector.includes("[data-world]")) for (const n of b.decls.keys()) worldScoped.add(n);

    let checked = 0;
    for (const { file, selector, decls } of blocks) {
      for (const [name, value] of decls) {
        if (!refsOf(value).some((r) => worldScoped.has(r))) continue;
        checked++;
        expect(selector, `${file}: --${name}`).toContain("[data-world]");
      }
    }
    // Borders, shadows, hover, spray and the unknown hatch: a scan that
    // finds fewer is looking at the wrong thing, not proving anything.
    expect(checked).toBeGreaterThanOrEqual(10);
  });

  it("shape.css carries no ink literal: shadows and texture read the semantic aliases", () => {
    const shape = readFileSync(path.join(TOKENS_DIR, "shape.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(shape).not.toMatch(/var\(--ink-[01]\)/);
    expect(shape).not.toMatch(/rgba\(\s*33,\s*28,\s*21/);
  });
});

describe("lib/og/tokens.ts reads the typed source", () => {
  const expected: Record<string, keyof typeof PRIMITIVES> = {
    OG_INK: "ink-0",
    OG_INK_SOFT: "ink-1",
    OG_STONE: "paper-1",
    OG_STONE_2: "paper-2",
    OG_RED: "paint-red",
    OG_RED_INK: "paint-red-deep",
    OG_RED_SOFT: "paint-red-wash",
    OG_PAINT_WHITE: "paper-0",
  };

  it("every OG color equals its primitive", () => {
    const colors = Object.entries(og).filter(([k]) => k !== "OG_SIZE");
    expect(colors.map(([k]) => k).sort()).toEqual(Object.keys(expected).sort());
    for (const [k, v] of colors) expect(v, k).toBe(PRIMITIVES[expected[k] as keyof typeof PRIMITIVES]);
  });

  it("writes no color literal of its own", () => {
    const src = readFileSync(path.join(process.cwd(), "src/lib/og/tokens.ts"), "utf8").replace(
      /\/\*[\s\S]*?\*\/|\/\/.*$/gm,
      "",
    );
    expect(src).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/);
  });
});
