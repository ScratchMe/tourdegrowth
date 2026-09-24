import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { PRIMITIVES } from "@/styles/tokens/tokens";

/**
 * DS v3 (C-1) — components read the semantic layer, never the palette.
 *
 * A world (`data-world="night"`) works by rebinding the semantic tokens in
 * colors.css and nothing else. Every `var(--ink-0)` written in a component
 * is a place that rebinding cannot reach: measured on the phase-1 night
 * ground, an --ink-0 shadow is 1.03:1 — the signature shadow and the focus
 * ring simply vanish, on the one screen nobody would have tested in paper.
 * There were 31 such references before this test; there is no allow-list,
 * and there should not be one. A component that needs a color the semantic
 * layer does not name gets a new semantic token in colors.css (with its
 * contrast measured there), not an exception here.
 *
 * Comments are stripped before scanning: prose that NAMES a primitive to
 * explain a choice ("--paint-red-action, not --paint-red") is how this repo
 * documents its colors, and is not a use.
 */

const SRC = join(process.cwd(), "src");
const TOKENS_DIR = join(SRC, "styles", "tokens");

/** The primitive families. A new family must be added here, or the test below fails. */
const PRIMITIVE_REF = /--(?:paper|ink|paint-red|night)(?:-[a-z0-9]+)*\b/g;

/** The ink primitive written out by value — how LoadingScreen once copied the spray texture. */
const INK_LITERAL = /rgba\(\s*33\s*,\s*28\s*,\s*21\b/g;

function walk(dir: string, keep: (name: string) => boolean): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (full === TOKENS_DIR || name === "__tests__") return [];
    if (statSync(full).isDirectory()) return walk(full, keep);
    return keep(name) ? [full] : [];
  });
}

const stripComments = (source: string) => source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

function offences(files: string[], pattern: RegExp) {
  return files.flatMap((full) => {
    const source = stripComments(readFileSync(full, "utf8"));
    return [...source.matchAll(pattern)].map((m) => `${relative(process.cwd(), full)}: ${m[0]}`);
  });
}

const CSS_FILES = walk(SRC, (name) => name.endsWith(".css"));
/** Inline `style={{ … var(--ink-0) … }}` would be the same leak by another door. */
const SCRIPT_FILES = walk(SRC, (name) => /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name));

describe("no primitive color token outside src/styles/tokens (DS v3 C-1)", () => {
  it("scans the real stylesheets, not an empty set", () => {
    // Non-vacuity: a glob that silently matched nothing would pass below.
    expect(CSS_FILES.length).toBeGreaterThan(40);
    expect(CSS_FILES.some((f) => f.endsWith("Segmented.module.css"))).toBe(true);
    expect(CSS_FILES.some((f) => f.endsWith("globals.css"))).toBe(true);
  });

  it("every primitive in tokens.ts belongs to a family this test forbids", () => {
    const unguarded = Object.keys(PRIMITIVES).filter((name) => !`--${name}`.match(PRIMITIVE_REF));
    expect(unguarded).toEqual([]);
  });

  it("no stylesheet references --paper-*, --ink-*, --paint-red* or --night-*", () => {
    expect(offences(CSS_FILES, PRIMITIVE_REF)).toEqual([]);
  });

  it("no stylesheet copies the ink primitive as an rgba literal", () => {
    expect(offences(CSS_FILES, INK_LITERAL)).toEqual([]);
  });

  it("no component or page reads a primitive through an inline style", () => {
    expect(offences(SCRIPT_FILES, PRIMITIVE_REF)).toEqual([]);
  });
});
