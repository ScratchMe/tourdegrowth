import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * DS v3 (M-7, L-10) — contrast as a property of the TOKENS, not only of the
 * pages that happen to render them. The axe pass (e2e/accessibility.spec.ts)
 * sees the screens that exist, at one width; a token pairing that no page
 * renders yet — a status color on a sunken ground, a chart series label —
 * is invisible to it until someone ships it. This file parses colors.css
 * (the CSS that actually ships, not a copy) and asserts every ratio the
 * design system states for the paper world, two ways at once:
 *
 *   1. the ratio, rounded to two places, is exactly the one written down
 *      (the comments in colors.css and the DS v3 critique quote them) — so a
 *      value nudged by one unit fails even if it still clears its bar, and a
 *      documented number cannot silently become false;
 *   2. it clears the bar its ROLE needs: 4.5 for text, 3 for large text and
 *      for non-text marks (WCAG 1.4.11), nothing for decoration.
 *
 * Pairs documented as NOT good enough for text (the road-paint red, two
 * chart series on the sunken ground) are asserted to stay under 4.5 as well:
 * the rule "no colored label on --paper-2" is only true while that is.
 *
 * Luminance is exact WCAG 2.x (sRGB, 0.04045 threshold — identical to the
 * older 0.03928 for 8-bit values). A translucent color is composed on the
 * ground it actually lands on, channel by channel, rounded to the 8-bit
 * value a browser paints, BEFORE it is measured.
 */

const COLORS_CSS = path.join(process.cwd(), "src/styles/tokens/colors.css");

/** Every `--name: value` in colors.css, all blocks (the paper world is :root). */
function parseTokens(): Map<string, string> {
  const css = readFileSync(COLORS_CSS, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const out = new Map<string, string>();
  for (const m of css.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) out.set(m[1] ?? "", (m[2] ?? "").trim());
  return out;
}
const TOKENS = parseTokens();

type Rgba = { r: number; g: number; b: number; a: number };

function literal(name: string, seen = new Set<string>()): string {
  if (seen.has(name)) throw new Error(`cycle through --${name}`);
  seen.add(name);
  const v = TOKENS.get(name);
  if (v === undefined) throw new Error(`colors.css has no --${name}`);
  const ref = /^var\(--([a-z0-9-]+)\)$/.exec(v)?.[1];
  return ref === undefined ? v : literal(ref, seen);
}

function parse(value: string): Rgba {
  const hex = /^#([0-9a-f]{6})$/i.exec(value)?.[1];
  if (hex) {
    const n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  const m = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/.exec(value);
  if (!m) throw new Error(`not a color: ${value}`);
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: Number(m[4]) };
}

/** A token name (or a literal) → an opaque color, composed on `ground` if translucent. */
function paint(color: string, ground?: Rgba): Rgba {
  const c = parse(color.startsWith("#") || color.startsWith("rgba") ? color : literal(color));
  if (c.a === 1) return c;
  if (!ground) throw new Error(`${color} is translucent: measure it on the ground it lands on`);
  const mix = (f: number, g: number) => Math.round(f * c.a + g * (1 - c.a));
  return { r: mix(c.r, ground.r), g: mix(c.g, ground.g), b: mix(c.b, ground.b), a: 1 };
}

function luminance({ r, g, b }: Rgba): number {
  const ch = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

function contrast(fg: string, bg: string): number {
  const ground = paint(bg);
  const [a, b] = [luminance(paint(fg, ground)), luminance(ground)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * - text: body-size text, 4.5.
 * - large: only as large text (≥ 24px, or ≥ 18.66px bold), 3 — and, being
 *   documented as such, it stays UNDER 4.5.
 * - mark: non-text (borders, focus, chart marks), 3.
 * - mark-only: a mark the system forbids as text — ≥ 3 and < 4.5.
 * - decorative: exempt; the stated value is still pinned.
 */
type Role = "text" | "large" | "mark" | "mark-only" | "decorative";
type Pair = { fg: string; bg: string; stated: number; role: Role; why: string };

const P0 = "paper-0";
const P1 = "paper-1";
const P2 = "paper-2";

const PAIRS: Pair[] = [
  // --- Existing ratios the colors.css comments quote (REVIEW.md R-22) ---
  { fg: "action-primary-text", bg: "action-primary-bg", stated: 4.65, role: "text", why: "primary button label (R-22)" },
  { fg: "paper-0", bg: "paint-red", stated: 4.42, role: "large", why: "why --paint-red-action exists" },
  { fg: "text-link", bg: P1, stated: 5.42, role: "text", why: "links on the page ground (H-4)" },
  { fg: "text-link", bg: P0, stated: 6.72, role: "text", why: "links on a card" },
  { fg: "text-link", bg: P2, stated: 4.89, role: "text", why: "links on a sunken block" },
  { fg: "text-faint", bg: "surface-card", stated: 5.5, role: "text", why: "credit line, ink at 0.67" },
  { fg: "text-faint", bg: P1, stated: 5.02, role: "text", why: "same ink, composed on the page ground" },

  // --- Critique §3/§4 ---
  { fg: "text-body", bg: P1, stated: 12.97, role: "text", why: "long-form body (M-3)" },
  { fg: "accent-mark", bg: P1, stated: 3.57, role: "large", why: "wordmark / H1 accent (M-7): large text only" },
  { fg: "focus-ring-invert", bg: P1, stated: 3.57, role: "mark", why: "red focus ring (§4)" },
  { fg: "focus-ring-invert", bg: P2, stated: 3.22, role: "mark", why: "red focus ring on an option button" },
  { fg: "text-muted", bg: "surface-desk", stated: 4.51, role: "text", why: "L-10: AA by 0.005 — see the guard below" },

  // --- §5.1 / §5.4: inverse and states ---
  { fg: "text-on-inverse", bg: "surface-inverse", stated: 16.06, role: "text", why: "ink chip, active segment" },
  { fg: "text-inverse", bg: "surface-accent", stated: 4.65, role: "text", why: "small label on a red fill: Tag red, stamped pillar, roast badge" },
  { fg: "state-selected-text", bg: "state-selected-bg", stated: 16.06, role: "text", why: "one selection language (H-5)" },
  { fg: "state-good-text", bg: P0, stated: 6.34, role: "text", why: "status good" },
  { fg: "state-good-text", bg: P1, stated: 5.12, role: "text", why: "status good" },
  { fg: "state-good-text", bg: P2, stated: 4.61, role: "text", why: "status good, on a sunken ground too since S-20" },
  { fg: "state-warn-text", bg: P0, stated: 6.57, role: "text", why: "status warn" },
  { fg: "state-warn-text", bg: P1, stated: 5.31, role: "text", why: "status warn" },
  { fg: "state-warn-text", bg: P2, stated: 4.78, role: "text", why: "status warn" },

  // --- §5.5 data-viz, paper ---
  { fg: "viz-ink", bg: P0, stated: 16.06, role: "text", why: "default series" },
  { fg: "viz-ink", bg: P1, stated: 12.97, role: "text", why: "default series" },
  { fg: "viz-ink", bg: P2, stated: 11.68, role: "text", why: "default series" },
  { fg: "viz-axis", bg: P0, stated: 7.2, role: "text", why: "axis labels" },
  { fg: "viz-axis", bg: P1, stated: 5.81, role: "text", why: "axis labels" },
  { fg: "viz-axis", bg: P2, stated: 5.23, role: "text", why: "axis labels" },
  { fg: "viz-grid", bg: P0, stated: 1.33, role: "decorative", why: "gridlines, subtle on purpose" },
  { fg: "viz-highlight", bg: P0, stated: 4.42, role: "mark-only", why: "diagnosis mark, never text" },
  { fg: "viz-highlight", bg: P1, stated: 3.57, role: "mark-only", why: "diagnosis mark, never text" },
  { fg: "viz-highlight", bg: P2, stated: 3.22, role: "mark-only", why: "diagnosis mark, never text" },
  { fg: "viz-highlight-text", bg: P0, stated: 6.72, role: "text", why: "its label" },
  { fg: "viz-highlight-text", bg: P1, stated: 5.42, role: "text", why: "its label" },
  { fg: "viz-highlight-text", bg: P2, stated: 4.89, role: "text", why: "its label" },
  { fg: "viz-unknown", bg: P0, stated: 7.2, role: "text", why: "'not measured' dash" },
];

describe("every stated paper-world contrast ratio holds", () => {
  it.each(PAIRS)("--$fg on --$bg is $stated:1 ($why)", ({ fg, bg, stated, role }) => {
    const ratio = contrast(fg, bg);
    expect(round2(ratio)).toBe(stated);
    if (role === "text") expect(ratio).toBeGreaterThanOrEqual(4.5);
    if (role === "mark") expect(ratio).toBeGreaterThanOrEqual(3);
    if (role === "large" || role === "mark-only") {
      expect(ratio).toBeGreaterThanOrEqual(3);
      expect(ratio).toBeLessThan(4.5);
    }
  });

  it("covers every data-viz token that can carry text or a mark", () => {
    // A new --viz-* color added without a ratio here is exactly the pairing
    // no page renders yet. (Grid, unknown and highlight are covered above.)
    const measured = new Set(PAIRS.flatMap((p) => [p.fg, p.bg]));
    const viz = [...TOKENS.keys()].filter((n) => n.startsWith("viz-"));
    // Six since the chart scales went (A2.2, 2026-09-29): ink, axis, grid, highlight and its text, unknown.
    expect(viz.length).toBeGreaterThanOrEqual(6);
    for (const n of viz) expect(measured.has(n), `--${n} has no stated ratio`).toBe(true);
  });
});

/*
 * Design audit L-10 / S-20 — text sits on the bare page ground too: a
 * credit line, December's « won » line, a status on the page. The ground is
 * not flat --paper-1: `--ground-lift` (shape.css) washes it. Until
 * 2026-09-29 it also darkened it, under a black halo at `88% 74%`, and every
 * text ink was measured at that halo's darkest point. The I + B mockup has
 * no halo, so the lift now only LIGHTENS — and this pins it: a darkening
 * layer brought back fails here, and asks for the inks to be re-measured
 * under it. On a ground that only lightens, flat --paper-1 is the floor.
 * (The grain's own darkest pixel is measured alone in
 * space-token-contrast.test.ts, and a glyph is never drawn on one noise
 * pixel.)
 */
describe("text on the page's bare ground still clears AA", () => {
  const shape = readFileSync(path.join(process.cwd(), "src/styles/tokens/shape.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const lift = /--ground-lift\s*:([^;]+);/.exec(shape)?.[1] ?? "";
  // Split on the commas that are not inside parentheses.
  const topLevel = (list: string) => {
    const parts: string[] = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < list.length; i++) {
      if (list[i] === "(") depth++;
      else if (list[i] === ")") depth--;
      else if (list[i] === "," && depth === 0) {
        parts.push(list.slice(start, i).trim());
        start = i + 1;
      }
    }
    return [...parts, list.slice(start).trim()];
  };
  // Every layer is a gradient; every argument of it that is not its geometry
  // (shape, size, `at` position) is a colour stop, with its position removed.
  const layers = topLevel(lift);
  const stops = layers.flatMap((layer) => {
    const args = /^[a-z-]*gradient\((.*)\)$/s.exec(layer)?.[1];
    if (args === undefined) throw new Error(`--ground-lift has a layer that is not a gradient: ${layer}`);
    return topLevel(args)
      .filter((arg) => !/(^|\s)at\s|^(circle|ellipse|closest-|farthest-)|^-?[\d.]+(px|%)(\s+-?[\d.]+(px|%))?$/.test(arg))
      .map((arg) => arg.replace(/(\s+-?[\d.]+(px|%))+$/, ""));
  });
  const FLOOR = P1;

  const GROUND_PAIRS: { fg: string; stated: number }[] = [
    { fg: "text-body", stated: 12.97 },
    { fg: "text-muted", stated: 5.81 },
    { fg: "text-faint", stated: 5.02 },
    { fg: "text-link", stated: 5.42 },
    { fg: "text-alert", stated: 5.42 },
    { fg: "state-good-text", stated: 5.12 },
    { fg: "state-bad-text", stated: 5.42 },
    { fg: "state-warn-text", stated: 5.31 },
    { fg: "viz-axis", stated: 5.81 },
    { fg: "viz-highlight-text", stated: 5.42 },
  ];

  it("reads the lift from shape.css, not a copy of it", () => {
    expect(lift).toMatch(/^\s*radial-gradient\(/);
    expect(stops.length).toBeGreaterThan(0);
  });

  it("only lightens: every colour stop, laid on the paper, is at least as light as it", () => {
    // A stop this cannot read fails here by name rather than passing unseen
    // (`black`, `hsl()`, `var(--ink-0)`…): measure it by hand, then teach the
    // parser. `transparent` is the one keyword that cannot darken anything.
    const paper = paint(P1);
    const darkening = stops.filter((stop) => {
      if (stop === "transparent") return false;
      if (!/^(#[0-9a-f]{6}|rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\))$/i.test(stop)) {
        throw new Error(`--ground-lift: a colour stop this test cannot read: ${stop}`);
      }
      return luminance(paint(stop, paper)) < luminance(paper);
    });
    expect(stops.length).toBeGreaterThan(0);
    expect(darkening).toEqual([]);
  });

  it.each(GROUND_PAIRS)("--$fg on the bare ground is $stated:1", ({ fg, stated }) => {
    const ratio = contrast(fg, FLOOR);
    expect(round2(ratio)).toBe(stated);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps the faint ink quieter than the muted one there too", () => {
    expect(contrast("text-faint", FLOOR)).toBeLessThan(contrast("text-muted", FLOOR));
  });
});

describe("L-10 — --surface-desk stays unused", () => {
  // --text-muted clears AA on it by 0.005 (4.505:1). Rather than nudge a
  // bundle color, the token is kept out of use: the first screen that wants
  // it has to measure its own text first, and this test is where it finds out.
  function* files(dir: string): Generator<string> {
    for (const entry of readdirSync(dir)) {
      const p = path.join(dir, entry);
      if (statSync(p).isDirectory()) yield* files(p);
      else if (/\.(css|tsx?)$/.test(entry)) yield p;
    }
  }

  it("no stylesheet or component outside src/styles/tokens reads it", () => {
    const src = path.join(process.cwd(), "src");
    const tokensDir = path.join(src, "styles", "tokens");
    const offenders: string[] = [];
    let scanned = 0;
    for (const f of files(src)) {
      // A test that names the token is not a reader: this file and the night's
      // measure it, dead-tokens.test.ts lists it as kept out of use on purpose.
      if (f.startsWith(tokensDir) || f.startsWith(path.join(src, "__tests__"))) continue;
      scanned++;
      if (readFileSync(f, "utf8").includes("--surface-desk")) offenders.push(path.relative(src, f));
    }
    expect(scanned).toBeGreaterThan(100);
    expect(offenders).toEqual([]);
  });
});
