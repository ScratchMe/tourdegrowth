import { describe, expect, it } from "vitest";
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
} from "./color-math";

/**
 * DS v3 PR-12 — every contrast the night world states, measured on the CSS
 * that ships (colors.css + world-night.css), the way token-contrast.test.ts
 * does it for paper: the ratio, rounded to two places, is exactly the one
 * written down (critique §5.3–§5.5 and the comments in world-night.css), AND
 * it clears the bar its role needs. A documented number cannot silently
 * become false, and a value nudged by one unit fails even if it still passes.
 *
 * The environment is the one a node inside `data-world="night"` sees: both
 * palettes, the derived layer, and the night's rebinding on top — so the
 * derived selection state (§5.4) is measured as it actually resolves there,
 * not as a copy of what it should be.
 *
 * Pairs name SEMANTIC tokens wherever one exists (the night page is
 * --surface-page, not --night-0): that is what components read, and it is
 * what makes the "every rebound token is measured" check below possible.
 */

const paper = parseBlocks("colors.css");
const night = parseBlocks("world-night.css");
const NIGHT_BLOCK = declsOf(night, '[data-world="night"]');

const ENV = new Map<string, string>([
  ...declsOf(paper, ":root"),
  ...declsOf(night, ":root"),
  ...declsOf(paper, ":root,[data-world]"),
  ...NIGHT_BLOCK,
]);
const literal = makeResolver(ENV);

/** A token (or literal), optionally painted at an opacity, composed on `bg`. */
function contrast(fg: string, bg: string, alpha = 1): number {
  const ground = compose(parseColor(literal(bg)));
  const f = parseColor(literal(fg));
  return ratio({ ...f, a: f.a * alpha }, ground);
}

type Pair = { fg: string; bg: string; stated: number; role: Role; why: string; alpha?: number; bar?: number };

const N0 = "surface-page";
const N1 = "surface-card";
const N2 = "surface-sunken";
const on3 = (fg: string, s: [number, number, number], role: Role, why: string): Pair[] =>
  [N0, N1, N2].map((bg, i) => ({ fg, bg, stated: s[i] ?? NaN, role, why }));

const PAIRS: Pair[] = [
  // --- §5.3, the night palette on its three grounds ---
  ...on3("text-body", [16.38, 15.22, 13.37], "text", "body"),
  ...on3("text-muted", [8.28, 7.7, 6.76], "text", "labels, captions"),
  ...on3("border-hard", [3.99, 3.7, 3.25], "mark", "component edges, axes — ≥ 3 everywhere"),
  ...on3("border-divider", [1.51, 1.4, 1.23], "decorative", "dashed separators"),
  ...on3("surface-inverse", [10.13, 9.41, 8.26], "text", "amber: key figure, selection"),
  ...on3("state-good-text", [9.68, 9.0, 7.9], "text", "patience ≥ 35"),
  ...on3("state-bad-text", [6.66, 6.19, 5.44], "text", "red text AND patience < 35"),
  { fg: "text-on-inverse", bg: "surface-inverse", stated: 10.13, role: "text", why: "the night on amber" },

  // --- §5.3, the rebinding ---
  { fg: "text-link", bg: N1, stated: 9.41, role: "text", why: "links are amber at night" },
  { fg: "shadow-color", bg: N1, stated: 1.2, role: "decorative", why: "black hard shadow: the edge is --border-hard's job" },
  { fg: "focus-ring", bg: N1, stated: 15.22, role: "mark", why: "focus ring" },
  { fg: "accent-mark", bg: N1, stated: 3.76, role: "mark-only", why: "rule 1: a mark, FORBIDDEN as text" },

  // --- Rule 1: red text is --night-bad; the primary button does not change ---
  { fg: "text-alert", bg: N1, stated: 6.19, role: "text", why: "the red that may be text at night" },
  { fg: "action-primary-text", bg: "action-primary-bg", stated: 4.65, role: "text", why: "button label on its own fill" },
  { fg: "action-primary-bg", bg: N1, stated: 3.57, role: "mark", why: "the button's edge against the night" },

  // --- Rule 3: a hidden tile dims its value only ---
  { fg: "text-body", bg: N2, alpha: 0.5, stated: 4.47, role: "under", why: "text at 50% on --night-2: under AA (critique: 4.46, half-to-even)" },
  { fg: "text-muted", bg: N2, stated: 6.76, role: "text", why: "…so the 'not on your dashboard' label stays at full opacity" },

  // --- §5.4, the selection state, as the derived layer resolves it here ---
  { fg: "state-selected-text", bg: "state-selected-bg", stated: 10.13, role: "text", why: "a ticked action card" },

  // --- §5.5, data-viz ---
  ...on3("viz-ink", [16.38, 15.22, 13.37], "text", "default series"),
  ...on3("viz-highlight", [6.66, 6.19, 5.44], "text", "diagnosis mark — bright enough to be text here"),
  ...on3("viz-cat-1", [8.36, 7.77, 6.82], "text", "direct label"),
  ...on3("viz-cat-2", [8.66, 8.05, 7.07], "text", "direct label"),
  ...on3("viz-cat-3", [10.13, 9.41, 8.26], "text", "direct label"),
  ...on3("viz-cat-4", [7.78, 7.23, 6.35], "text", "direct label"),
  { fg: "viz-seq-1-text", bg: "viz-seq-1", stated: 10.98, role: "text", why: "cell label" },
  { fg: "viz-seq-2-text", bg: "viz-seq-2", stated: 7.46, role: "text", why: "cell label" },
  { fg: "viz-seq-3-text", bg: "viz-seq-3", stated: 5.4, role: "text", why: "cell label" },
  { fg: "viz-seq-4-text", bg: "viz-seq-4", stated: 6.31, role: "text", why: "cell label" },
  { fg: "viz-seq-5-text", bg: "viz-seq-5", stated: 10.13, role: "text", why: "cell label" },
  // The step it replaced: no label passed on it, with either ink.
  { fg: "text-body", bg: "#8a6a2c", stated: 4.37, role: "under", why: "rejected step 3, light label" },
  { fg: "surface-page", bg: "#8a6a2c", stated: 3.75, role: "under", why: "rejected step 3, dark label" },

  // --- Rebindings the §5.3 table leaves out, measured in world-night.css ---
  ...on3("text-faint", [5.55, 5.43, 5.09], "text", "credit line, night ink at 0.55"),
  { fg: "text-body", bg: "surface-alert", stated: 13.66, role: "text", why: "text on the night's red wash" },
  { fg: "text-alert", bg: "surface-alert", stated: 5.56, role: "text", why: "red text on the red wash" },
  { fg: "text-muted", bg: "surface-alert", stated: 6.91, role: "text", why: "a label on the red wash" },
  { fg: "border-alert", bg: "surface-alert", stated: 3.37, role: "mark", why: "an alert card's own edge" },
  ...on3("border-alert", [4.04, 3.76, 3.3], "mark", "red border"),
  ...on3("focus-ring-invert", [4.04, 3.76, 3.3], "mark", "red ring of option buttons"),
  { fg: "field-border-alert", bg: N1, stated: 3.76, role: "mark", why: "a field past its limit" },
  { fg: "border-soft", bg: N1, stated: 3.7, role: "mark", why: "dashed edge: same line as the hard one" },
  { fg: "text-inverse", bg: "surface-accent", stated: 4.65, role: "text", why: "small label on a red fill — unchanged from paper" },
  { fg: "text-link-hover", bg: N1, stated: 15.22, role: "text", why: "hovered link" },
  { fg: "action-secondary-text", bg: N1, stated: 15.22, role: "text", why: "secondary button label" },
  { fg: "state-warn-text", bg: N1, stated: 9.41, role: "text", why: "status warn" },
  { fg: "text-muted", bg: "surface-desk", stated: 8.28, role: "text", why: "the desk is the page at night" },
  { fg: "texture-ink", bg: N0, stated: 1.11, role: "decorative", why: "stencil spray" },
  { fg: "viz-grid", bg: N0, stated: 1.43, role: "decorative", why: "gridlines, subtle on purpose" },
  ...on3("viz-axis", [8.28, 7.7, 6.76], "text", "axis labels"),
  { fg: "viz-unknown", bg: N0, stated: 8.28, role: "text", why: "'not measured' dash" },
  { fg: "viz-highlight-text", bg: N1, stated: 6.19, role: "text", why: "the diagnosis label" },
  ...on3("viz-cat-5", [16.38, 15.22, 13.37], "text", "direct label"),
];

describe("every stated night-world contrast ratio holds", () => {
  it.each(PAIRS)("--$fg on $bg is $stated:1 ($why)", ({ fg, bg, stated, role, alpha, bar }) => {
    const value = contrast(fg, bg, alpha);
    expect(round2(value)).toBe(stated);
    expect(assertRole(value, role, bar)).toBeNull();
  });

  it("measures every token the night rebinds — a rebinding with no ratio is a pairing nobody checked", () => {
    const measured = new Set(PAIRS.flatMap((p) => [p.fg, p.bg]));
    const rebound = [...NIGHT_BLOCK.keys()].filter((n) => n !== "ground-lift");
    expect(rebound.length).toBeGreaterThan(45);
    for (const n of rebound) expect(measured.has(n), `--${n} has no stated ratio`).toBe(true);
  });

  it("keeps the faint ink quieter than the muted one on every ground (the paper hierarchy)", () => {
    for (const bg of [N0, N1, N2]) expect(contrast("text-faint", bg)).toBeLessThan(contrast("text-muted", bg));
  });
});

describe("the night sequential ramp", () => {
  const steps = [1, 2, 3, 4, 5].map((i) => `viz-seq-${i}`);
  const gaps = steps.slice(1).map((s, i) => contrast(steps[i] ?? "", s));

  it("neighbouring steps sit 1.38 to 2.08 apart, as documented", () => {
    expect(round2(Math.min(...gaps))).toBe(1.38);
    expect(round2(Math.max(...gaps))).toBe(2.08);
  });

  it("is under 3:1 between neighbours — cells keep their separating rule at night too", () => {
    for (const g of gaps) expect(g).toBeLessThan(3);
  });
});
