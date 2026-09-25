import { describe, expect, it } from "vitest";
import { NIGHT_PRIMITIVES, NIGHT_WORLD, PRIMITIVES, SEMANTIC, DERIVED, resolveNightColor } from "@/styles/tokens/tokens";
import { declsOf, parseBlocks } from "./color-math";

/**
 * DS v3 PR-12 — the night world is a REBINDING, and this test keeps it one.
 *
 * world-night.css may only rebind the semantic layer (plus --ground-lift, the
 * page ground that no color token reaches). Three ways that could quietly
 * stop being true, each one invisible on every page that exists today:
 *
 *   - a semantic token the night forgets: it inherits its PAPER value inside
 *     the night (the paper red wash under night text is 1.2:1) — so the set
 *     of rebound names must equal the paper set, both ways;
 *   - a rebinding that points at another semantic token: resolved once on
 *     the container, it would not follow a paper world nested inside;
 *   - a derived token redeclared here: it would freeze at the night value
 *     instead of re-resolving per world (colors.css header).
 *
 * And, as for the paper world (token-sources.test.ts), tokens.ts must carry
 * exactly the values the CSS ships, for Satori and anything drawn to an image.
 */

const blocks = parseBlocks("world-night.css");
const paper = parseBlocks("colors.css");
const NIGHT_SEL = '[data-world="night"]';
const refsOf = (value: string) => [...value.matchAll(/var\(--([a-z0-9-]+)\)/g)].map((m) => m[1] ?? "");

const nightBlock = declsOf(blocks, NIGHT_SEL);
const nightColors = new Map([...nightBlock].filter(([k]) => k !== "ground-lift"));
const paperSemantic = declsOf(paper, ':root,[data-world="paper"]');
const paperDerived = declsOf(paper, ":root,[data-world]");

describe("world-night.css is shaped as a world", () => {
  it("is the night palette, the rebinding, then the paper ground handed back — in that order", () => {
    expect(blocks.map((b) => b.selector)).toEqual([":root", NIGHT_SEL, ":root", '[data-world="paper"]']);
  });

  it("the palette block equals NIGHT_PRIMITIVES", () => {
    expect(Object.fromEntries(blocks[0]?.decls ?? [])).toEqual(NIGHT_PRIMITIVES);
  });

  it("the rebinding equals NIGHT_WORLD (colors), plus the ground", () => {
    expect(Object.fromEntries(nightColors)).toEqual(NIGHT_WORLD);
    expect(nightBlock.get("ground-lift")).toMatch(/^radial-gradient\(/);
  });

  it("rebinds EVERY semantic token of the paper world, and nothing the paper world does not have", () => {
    expect([...nightColors.keys()].sort()).toEqual([...paperSemantic.keys()].sort());
    // tokens.ts agrees (the `satisfies` in NIGHT_WORLD holds the same rule at compile time).
    expect(Object.keys(NIGHT_WORLD).sort()).toEqual(Object.keys(SEMANTIC).sort());
  });

  it("never redeclares a derived token — they re-resolve on [data-world] by themselves", () => {
    for (const name of paperDerived.keys()) expect(nightBlock.has(name), `--${name}`).toBe(false);
    expect(paperDerived.size).toBeGreaterThanOrEqual(4);
  });

  it("each rebinding is a literal or a primitive of either palette — never another semantic token", () => {
    const primitives = new Set([...Object.keys(PRIMITIVES), ...Object.keys(NIGHT_PRIMITIVES)]);
    for (const [name, value] of nightColors) {
      for (const ref of refsOf(value)) expect(primitives.has(ref), `--${name} → --${ref}`).toBe(true);
    }
  });

  it("names every night primitive in the family no-primitives.test.ts forbids to components", () => {
    for (const name of Object.keys(NIGHT_PRIMITIVES)) expect(name).toMatch(/^night-/);
  });

  it("hands the paper ground back to paper nested in the night, without copying its literal", () => {
    expect(Object.fromEntries(blocks[2]?.decls ?? [])).toEqual({ "ground-lift-paper": "var(--ground-lift)" });
    expect(Object.fromEntries(blocks[3]?.decls ?? [])).toEqual({ "ground-lift": "var(--ground-lift-paper)" });
  });
});

describe("resolveNightColor follows the night the way CSS does", () => {
  it("re-resolves the derived selection state against the night (§5.4)", () => {
    expect(resolveNightColor("state-selected-bg")).toBe("#f0b43c");
    expect(resolveNightColor("state-selected-text")).toBe("#14110d");
    expect(resolveNightColor("field-bg")).toBe("#1d1913");
  });

  it("still reaches the paper primitives the night paints with", () => {
    expect(resolveNightColor("action-primary-bg")).toBe(PRIMITIVES["paint-red-action"]);
    expect(resolveNightColor("accent-mark")).toBe(PRIMITIVES["paint-red"]);
  });

  it("resolves every token of the night to a literal color", () => {
    const names = [...Object.keys(NIGHT_PRIMITIVES), ...Object.keys(SEMANTIC), ...Object.keys(DERIVED)];
    for (const n of names) {
      expect(resolveNightColor(n as Parameters<typeof resolveNightColor>[0]), n).toMatch(
        /^(#[0-9a-f]{6}|rgba\(\d+, \d+, \d+, [\d.]+\))$/,
      );
    }
  });
});
