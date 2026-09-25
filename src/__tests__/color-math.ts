import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Contrast arithmetic and token-file parsing for the night and game contrast
 * tests. Same method as token-contrast.test.ts (which predates this module
 * and keeps its own copy): exact WCAG 2.x luminance, and a translucent color
 * composed on the ground it actually lands on, channel by channel, rounded
 * to the 8-bit value a browser paints, BEFORE it is measured.
 *
 * Not a test file (no `.test.`), so vitest never runs it on its own.
 */

export const TOKENS_DIR = path.join(process.cwd(), "src/styles/tokens");

export type Block = { selector: string; decls: Map<string, string> };

/** Blocks of a token file, comments stripped, selectors whitespace-free. */
export function parseBlocks(file: string): Block[] {
  const css = readFileSync(path.join(TOKENS_DIR, file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks: Block[] = [];
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = (m[1] ?? "").replace(/\s+/g, "").trim();
    if (selector.startsWith("@")) continue;
    const decls = new Map<string, string>();
    for (const d of (m[2] ?? "").matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) {
      decls.set(d[1] ?? "", (d[2] ?? "").replace(/\s+/g, " ").trim());
    }
    blocks.push({ selector, decls });
  }
  return blocks;
}

/** Every declaration of the blocks whose selector is exactly `selector`, merged in order. */
export function declsOf(blocks: Block[], selector: string): Map<string, string> {
  const out = new Map<string, string>();
  let found = false;
  for (const b of blocks) {
    if (b.selector !== selector) continue;
    found = true;
    for (const [k, v] of b.decls) out.set(k, v);
  }
  if (!found) throw new Error(`no block for ${selector}`);
  return out;
}

export type Rgb = { r: number; g: number; b: number; a: number };

export function parseColor(value: string): Rgb {
  const hex = /^#([0-9a-f]{6})$/i.exec(value)?.[1];
  if (hex) {
    const n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  const m = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/.exec(value);
  if (!m) throw new Error(`not a color: ${value}`);
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: Number(m[4]) };
}

/** A resolver: token environment → `name` (or a literal) → its literal color. */
export function makeResolver(env: Map<string, string>) {
  return function literal(name: string, seen = new Set<string>()): string {
    if (name.startsWith("#") || name.startsWith("rgba")) return name;
    if (seen.has(name)) throw new Error(`cycle through --${name}`);
    seen.add(name);
    const v = env.get(name);
    if (v === undefined) throw new Error(`no --${name} in this environment`);
    const ref = /^var\(--([a-z0-9-]+)\)$/.exec(v)?.[1];
    return ref === undefined ? v : literal(ref, seen);
  };
}

/** Composes `color` on `ground` if translucent; a translucent color with no ground is an error. */
export function compose(color: Rgb, ground?: Rgb): Rgb {
  if (color.a === 1) return color;
  if (!ground) throw new Error("a translucent color must be measured on the ground it lands on");
  const mix = (f: number, g: number) => Math.round(f * color.a + g * (1 - color.a));
  return { r: mix(color.r, ground.r), g: mix(color.g, ground.g), b: mix(color.b, ground.b), a: 1 };
}

function luminance({ r, g, b }: Rgb): number {
  const ch = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

export function ratio(fg: Rgb, bg: Rgb): number {
  const ground = compose(bg);
  const [a, b] = [luminance(compose(fg, ground)), luminance(ground)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * - text: body-size text, 4.5.
 * - large: only as large text (≥ 24px, or ≥ 18.66px bold), 3 — documented as
 *   such, so it stays UNDER 4.5.
 * - mark: non-text (borders, focus, chart marks, face strokes), 3.
 * - mark-only: a mark the system forbids as text — ≥ 3 and < 4.5.
 * - under: a pairing documented as FAILING its bar (a rejected value, a
 *   dimmed value) — asserted to stay under `bar`, so the rule it motivates
 *   stays true.
 * - decorative: exempt; the stated value is still pinned.
 */
export type Role = "text" | "large" | "mark" | "mark-only" | "under" | "decorative";

export function assertRole(value: number, role: Role, bar = 4.5): string | null {
  if (role === "text" && value < 4.5) return `text needs 4.5, got ${value}`;
  if (role === "mark" && value < 3) return `mark needs 3, got ${value}`;
  if ((role === "large" || role === "mark-only") && (value < 3 || value >= 4.5)) {
    return `${role} must sit in [3, 4.5), got ${value}`;
  }
  if (role === "under" && value >= bar) return `documented as under ${bar}, got ${value}`;
  return null;
}
