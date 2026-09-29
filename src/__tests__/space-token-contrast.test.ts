import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DERIVED, SEMANTIC } from "@/styles/tokens/tokens";
import {
  type Role,
  assertRole,
  compose,
  declsOf,
  makeResolver,
  parseBlocks,
  parseColor,
  ratio,
  round2,
  TOKENS_DIR,
} from "./color-math";

/**
 * The three spaces (design I + B, 2026-09-28) — every ratio spaces.css states
 * for its tokens, measured on the file as it ships, and the paper grain of
 * shape.css held to the bound its comment gives.
 *
 * The band's grounds carry text (the kicker, the name, the race's pills), so
 * every text colour on them is text, and the dashed pill of a space not open
 * yet is text too: « bientôt » greys the pill, never below AA. The Tour's red
 * pictogram is the one mark: 3.63 on the ink band, 4.42 on the filled pill.
 */

const paper = parseBlocks("colors.css");
const spaces = parseBlocks("spaces.css");
const SPACE_ROOT = declsOf(spaces, ":root");

const literal = makeResolver(
  new Map([
    ...declsOf(paper, ":root"),
    ...declsOf(paper, ':root,[data-world="paper"]'),
    ...declsOf(paper, ":root,[data-world]"),
    ...SPACE_ROOT,
  ]),
);

type Pair = { fg: string; bg: string; stated: number; role: Role; why: string };

const contrast = ({ fg, bg }: Pick<Pair, "fg" | "bg">) => ratio(parseColor(literal(fg)), parseColor(literal(bg)));

const PAIRS: Pair[] = [
  // --- 1 · the Tour: ink band ---
  { fg: "space-tour-text", bg: "space-tour-bg", stated: 16.06, role: "text", why: "the Tour band's text" },
  { fg: "space-tour-muted", bg: "space-tour-bg", stated: 6.08, role: "text", why: "a pill not open yet, « bientôt »" },
  { fg: "space-tour-mark", bg: "space-tour-bg", stated: 3.63, role: "mark-only", why: "the red pictogram: a mark, never text" },
  { fg: "space-tour-bg", bg: "space-tour-text", stated: 16.06, role: "text", why: "the filled pill: ink on paper" },
  { fg: "space-tour-mark", bg: "space-tour-text", stated: 4.42, role: "mark-only", why: "the red pictogram on the filled pill" },

  // --- 2 · the engine: ultramarine band ---
  { fg: "space-engine-text", bg: "space-engine-bg", stated: 9.23, role: "text", why: "the engine band's text" },
  { fg: "space-engine-muted", bg: "space-engine-bg", stated: 5.46, role: "text", why: "a pill not open yet" },
  { fg: "space-engine-bg", bg: "space-engine-text", stated: 9.23, role: "text", why: "the filled pill" },
  { fg: "space-engine-mark", bg: "space-engine-bg", stated: 9.23, role: "mark", why: "the stopwatch" },
  { fg: "space-engine-accent", bg: "paper-0", stated: 9.23, role: "text", why: "ultramarine labels on a card" },
  { fg: "space-engine-accent", bg: "paper-1", stated: 7.45, role: "text", why: "ultramarine labels on the page" },

  // --- 3 · the game: ochre band, ink text ---
  { fg: "space-game-text", bg: "space-game-bg", stated: 6.93, role: "text", why: "the game band's text" },
  { fg: "space-game-muted", bg: "space-game-bg", stated: 4.82, role: "text", why: "a pill not open yet" },
  { fg: "space-game-bg", bg: "space-game-text", stated: 6.93, role: "text", why: "the filled pill: ochre on ink" },
  { fg: "space-game-mark", bg: "space-game-bg", stated: 6.93, role: "mark", why: "the mountain" },
  { fg: "space-ochre", bg: "paper-1", stated: 1.87, role: "under", why: "why the game has no text accent on paper" },
];

const isColor = (v: string) => /^(#[0-9a-f]{6}|rgba\(|var\(--(paper|ink|paint-red|space)[a-z0-9-]*\)$)/i.test(v);

describe("every stated space-token contrast ratio holds", () => {
  it.each(PAIRS)("--$fg on --$bg is $stated:1 ($why)", (pair) => {
    const value = contrast(pair);
    expect(round2(value)).toBe(pair.stated);
    expect(assertRole(value, pair.role)).toBeNull();
  });

  it("measures every colour token of spaces.css", () => {
    const measured = new Set(PAIRS.flatMap((p) => [p.fg, p.bg]));
    const colors = [...SPACE_ROOT].filter(([, v]) => isColor(v)).map(([k]) => k);
    expect(colors.length).toBeGreaterThanOrEqual(15);
    // The two raw colours are measured through the tokens built on them.
    for (const n of colors.filter((c) => c !== "space-ultramarine")) {
      expect(measured.has(n), `--${n} has no stated ratio`).toBe(true);
    }
  });
});

describe("spaces.css stays out of the worlds", () => {
  const SEMANTIC_NAMES = new Set([...Object.keys(SEMANTIC), ...Object.keys(DERIVED)]);
  const refs = (v: string) => [...v.matchAll(/var\(--([a-z0-9-]+)\)/g)].map((m) => m[1] ?? "");

  it("is one :root block", () => {
    expect(spaces.map((b) => b.selector)).toEqual([":root"]);
  });

  it("never reads a semantic token — it would freeze at paper where it is declared", () => {
    for (const [name, value] of SPACE_ROOT) {
      for (const r of refs(value)) expect(SEMANTIC_NAMES.has(r), `--${name} → --${r}`).toBe(false);
    }
  });

  it("rebinds no token of the design system — it only adds names", () => {
    const files = ["colors.css", "world-night.css", "shape.css", "typography.css", "spacing.css", "motion.css", "game.css"];
    const dsNames = new Set(files.flatMap((f) => parseBlocks(f).flatMap((b) => [...b.decls.keys()])));
    for (const name of SPACE_ROOT.keys()) expect(dsNames.has(name), `--${name}`).toBe(false);
  });
});

/*
 * The paper grain (shape.css --ground-grain): fractal noise in the ink, whose
 * alpha is capped by the feColorMatrix's last row. At the tile's darkest pixel
 * the page ground is the ink at that alpha over --paper-1; every text token of
 * the paper world must still clear AA there. The design's mockup ran 9%, which
 * this test would reject: --state-good-text falls to 4.18 on the darkest grain.
 */
describe("the paper grain never takes paper-world text under AA", () => {
  // Read raw: the data URI holds a `;` (svg+xml;utf8) that the token parser would cut the value at.
  const shape = readFileSync(path.join(TOKENS_DIR, "shape.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const grain = /--ground-grain:\s*(url\("[^"]+"\));/.exec(shape)?.[1] ?? "";
  const matrix = /values='([^']+)'/.exec(grain)?.[1]?.trim().split(/\s+/).map(Number) ?? [];
  const alpha = matrix[18] ?? NaN;
  const ink = { r: Math.round((matrix[4] ?? 0) * 255), g: Math.round((matrix[9] ?? 0) * 255), b: Math.round((matrix[14] ?? 0) * 255) };

  const TEXT = ["text-body", "text-muted", "text-link", "text-faint", "state-good-text", "state-warn-text", "state-bad-text"];

  it("reads a real matrix: a 4×5 colour matrix whose alpha row scales the noise alone", () => {
    expect(matrix).toHaveLength(20);
    expect(matrix.slice(15, 18)).toEqual([0, 0, 0]);
    expect(matrix[19]).toBe(0);
    expect(alpha).toBe(0.045);
  });

  it.each(["paper-1", "paper-0"])("keeps every text token AA on the darkest grain over --%s", (ground) => {
    const darkest = compose({ ...ink, a: alpha }, parseColor(literal(ground)));
    for (const token of TEXT) {
      const value = ratio(parseColor(literal(token)), darkest);
      expect(value, `--${token} on the darkest grain over --${ground}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("the mockup's 9% would not have passed — the bound is a measurement, not a taste", () => {
    const darkest = compose({ ...ink, a: 0.09 }, parseColor(literal("paper-1")));
    expect(round2(ratio(parseColor(literal("state-good-text")), darkest))).toBe(4.18);
  });
});

/*
 * The sticky header's frosted glass (brand/SiteHeader): the page ground at
 * some opacity, over whatever scrolls under it. The worst ground is solid ink
 * — the game's night desk, a card's hard shadow — and the row carries muted
 * text (the quiet nav links) and red link text. Both must stay AA over it.
 */
describe("the sticky header's glass keeps its row AA over solid ink", () => {
  const css = readFileSync(path.join(process.cwd(), "src/components/brand/SiteHeader.module.css"), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );
  const pct = Number(/background:\s*color-mix\(in srgb, var\(--surface-page\) (\d+)%, transparent\)/.exec(css)?.[1]);

  it("reads the real opacity", () => {
    expect(pct).toBe(92);
  });

  it.each(["text-muted", "text-link", "text-body"])("--%s on the glass over ink", (token) => {
    const glass = compose({ ...parseColor(literal("paper-1")), a: pct / 100 }, parseColor(literal("ink-0")));
    expect(ratio(parseColor(literal(token)), glass)).toBeGreaterThanOrEqual(4.5);
  });

  it("the mockup's 74% would not have passed", () => {
    const glass = compose({ ...parseColor(literal("paper-1")), a: 0.74 }, parseColor(literal("ink-0")));
    expect(round2(ratio(parseColor(literal("text-link")), glass))).toBe(3.2);
  });
});
