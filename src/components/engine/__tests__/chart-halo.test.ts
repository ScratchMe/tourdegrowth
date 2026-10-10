import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The charts' label halo (A21.4): a stroke of the ground the chart is drawn on, so a label keeps its contrast where
 * it crosses a line. It was always the page's paper, and drew a beige box on a slide's white card and in the deck's
 * white theme. The charts read `--chart-halo`, the page's paper by default; the slide sets it where its ground differs.
 */
const read = (...p: string[]) => readFileSync(join(process.cwd(), ...p), "utf8");
const deck = read("src/app/[locale]/aarrr-funnel-template/_engine/deck/deck.module.css");

describe("the charts' halo follows their ground", () => {
  it.each(["MrrCurve", "PaybackChart", "InstallPaybackChart"])("%s strokes its labels with --chart-halo, the page's paper by default", (name) => {
    expect(read("src/components/engine", `${name}.module.css`)).toMatch(/\.halo \{[^}]*stroke: var\(--chart-halo, var\(--surface-page\)\);/);
  });

  it("the slide's curve card and the deck's white theme set it to their ground", () => {
    expect(deck).toMatch(/\.curveCard \{[^}]*background: var\(--surface-card\);[^}]*--chart-halo: var\(--surface-card\);/);
    expect(deck).toMatch(/\.slide\[data-theme="white"\] \{[^}]*background-color: var\(--surface-white\);[^}]*--chart-halo: var\(--surface-white\);/);
  });
});
