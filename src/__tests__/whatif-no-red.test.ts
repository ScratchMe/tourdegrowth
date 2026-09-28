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
 */

const ROOT = process.cwd();
const COLORS = readFileSync(join(ROOT, "src/styles/tokens/colors.css"), "utf8");
const PANEL = readFileSync(join(ROOT, "src/app/[locale]/aarrr-funnel-template/_engine/WhatIfPanel.module.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

const INTERACTION = new Set(["--text-link", "--focus-ring-invert"]);
const RED_TOKENS = [...COLORS.matchAll(/(--[a-z0-9-]+)\s*:\s*var\(--paint-red[a-z-]*\)/g)]
  .map((m) => m[1] ?? "")
  .filter((token) => !INTERACTION.has(token));

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
