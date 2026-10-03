import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * « Et si » says no red, like the what-if slides (Antoine, 2026-09-28 —
 * design audit S-5). The panel painted a moved lever and the dots the
 * what-ifs add in the diagnosis red, while the slides of the same scenario
 * refused it: « a projected gain is neither a diagnosis nor advice »
 * (deck.module.css). Red keeps its three meanings — diagnosis, action, roast.
 *
 * The red tokens are read from colors.css (every semantic token bound to a
 * --paint-red primitive), so a new red token is covered without editing this.
 * Two are interaction conventions, not a meaning given to data, and stay
 * allowed: the link colour (a link is an action, one of red's three
 * meanings — the panel's « Back to today » links use it) and the focus ring.
 *
 * Non-vacuity, checked by sabotage on 2026-09-28: putting
 * `color: var(--text-alert)` back on the moved lever's value fails the test,
 * naming the token.
 *
 * What this cannot see: a colour that comes from a component the panel
 * renders. The growth tiles' changes were still green and red through
 * StatTile's `sentiment` — they are ink since the same day, and
 * e2e/engine-whatif.spec.ts reads the colour the browser paints.
 *
 * Design system extension 09 (A20.d T3): the money's projections are never
 * red either — the MRR's curve, the panel's three tables, the compounding
 * drawn, the loss's bars and the one customer's picture (PaybackChart, T4.c) —
 * the loss is arithmetic in ink, not the leak.
 * Their sheets are read too, and so are the engine's and the money's
 * tokens bound to a red one, layer under layer (tokens/engine.css, then
 * money.css): `--money-warning-edge`, the long-payback warning's dashed
 * edge, is advice, and only CashWarning reads it.
 */

const ROOT = process.cwd();
const COLORS = readFileSync(join(ROOT, "src/styles/tokens/colors.css"), "utf8");
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");
const PANEL = strip(readFileSync(join(ROOT, "src/app/[locale]/aarrr-funnel-template/_engine/WhatIfPanel.module.css"), "utf8"));
const MONEY_SHEETS = ["MrrCurve", "WhatIfFigures", "LeverSum", "WorthBars", "LeverCard", "PaybackChart"].map((name) => ({
  name,
  css: strip(readFileSync(join(ROOT, `src/components/engine/${name}.module.css`), "utf8")),
}));
const LAYERED = strip(["engine.css", "money.css"].map((f) => readFileSync(join(ROOT, `src/styles/tokens/${f}`), "utf8")).join("\n"));

const INTERACTION = new Set(["--text-link", "--focus-ring-invert"]);
const RED_TOKENS = [...COLORS.matchAll(/(--[a-z0-9-]+)\s*:\s*var\(--paint-red[a-z-]*\)/g)]
  .map((m) => m[1] ?? "")
  .filter((token) => !INTERACTION.has(token));
/** The engine's and the money's tokens bound to a red one, however many layers down (engine.css, then money.css). */
const LAYERED_RED = new Set<string>();
for (let grew = true; grew; ) {
  grew = false;
  for (const m of LAYERED.matchAll(/(--(?:engine|money)-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    const [token, value] = [m[1] ?? "", m[2] ?? ""];
    if (LAYERED_RED.has(token)) continue;
    if (/--paint-red/.test(value) || [...RED_TOKENS, ...LAYERED_RED].some((red) => new RegExp(`var\\(${red}\\b`).test(value))) {
      LAYERED_RED.add(token);
      grew = true;
    }
  }
}
const MONEY_RED = [...LAYERED_RED].filter((token) => token.startsWith("--money-"));

describe("the what-if panel paints nothing red (S-5)", () => {
  it("reads the red tokens from the palette, not an empty list", () => {
    expect(RED_TOKENS).toContain("--text-alert");
    expect(RED_TOKENS).toContain("--viz-highlight");
    expect(RED_TOKENS.length).toBeGreaterThan(8);
  });

  it("uses none of them, nor a red primitive", () => {
    const used = RED_TOKENS.filter((token) => new RegExp(`var\\(${token}\\b`).test(PANEL));
    expect(used).toEqual([]);
    expect(PANEL).not.toMatch(/--paint-red/);
  });
});

describe("the money's projections paint nothing red either (extension 09, A20.d T3)", () => {
  it("finds the warning's edge among the money's red tokens, and only it", () => {
    expect([...new Set(MONEY_RED)]).toEqual(["--money-warning-edge"]);
  });

  for (const { name, css } of MONEY_SHEETS) {
    it(`${name} uses no red token, no red money token, no red primitive`, () => {
      const used = [...RED_TOKENS, ...LAYERED_RED].filter((token) => new RegExp(`var\\(${token}\\b`).test(css));
      expect(used).toEqual([]);
      expect(css).not.toMatch(/--paint-red/);
    });
  }
});
