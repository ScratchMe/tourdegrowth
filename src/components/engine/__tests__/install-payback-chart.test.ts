import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { installChartGeometry, type InstallChartInput } from "@/lib/viz/install-payback-chart";
import { InstallPaybackChart, type InstallPaybackChartProps } from "../InstallPaybackChart";

/**
 * The consumer app's picture of an install (engine spec §21.6.6, A22 APP-9), pinned without a DOM: the drawing is
 * decoration and the caption says it in words; the cost line is ink; each story draws its own mark and says its own
 * words only — the payback's tick over a healthy install, the bracket of the gap over a loss.
 */
const ramp = (step: number) => Array.from({ length: 37 }, (_, k) => k * step);
const input = (over: Partial<InstallChartInput> = {}): InstallChartInput => ({
  curve: { lo: ramp(0.12), hi: ramp(0.12) },
  cost: [1.5, 1.5],
  payback: [12.5, 12.5],
  story: "pays-back",
  width: 900,
  height: 330,
  ...over,
});
const LABELS = { start: "0", end: "36 mois", cost: "ce que coûte une installation", paysBack: "remboursée : 13 mois", loss: "pas remboursée en 36 mois, il manque ~0,91 €" };
const chart = (g: InstallChartInput, props: Partial<InstallPaybackChartProps> = {}) =>
  renderToStaticMarkup(
    createElement(InstallPaybackChart, {
      geometry: installChartGeometry(g),
      labels: LABELS,
      summary: "Une installation, mois par mois.",
      id: "c",
      "data-testid": "chart",
      ...props,
    }),
  );

describe("InstallPaybackChart", () => {
  it("is a figure: the SVG hidden from a screen reader, the picture said in words in its caption", () => {
    const markup = chart(input());
    expect(markup).toMatch(/<figure[^>]*data-testid="chart"/);
    expect(markup).toMatch(/<svg[^>]*aria-hidden="true"/);
    expect(markup).toMatch(/<figcaption class="tdg-visually-hidden">Une installation, mois par mois\.<\/figcaption>/);
  });

  it("pays back: the curve, the cost line, the tick on it and its label; no gap", () => {
    const markup = chart(input());
    expect(markup).toMatch(/data-story="pays-back"/);
    expect(markup.match(/<path d="M [^"]+" class="[^"]*curve[^"]*"/g)).toHaveLength(1);
    expect(markup).toMatch(/class="[^"]*paybackTick[^"]*"/);
    expect(markup).toContain("remboursée : 13 mois");
    expect(markup).toContain('data-testid="chart-pays-back"');
    expect(markup).not.toContain("il manque");
    expect(markup).not.toMatch(/class="[^"]*bracket/);
    expect(markup).toContain("ce que coûte une installation");
  });

  it("a loss: the bracket of the gap at the curve's end and its words; no payback tick, no payback label", () => {
    const markup = chart(input({ story: "loss", payback: null, curve: { lo: ramp(0.01), hi: ramp(0.01) } }));
    expect(markup).toMatch(/data-story="loss"/);
    expect(markup).toMatch(/class="[^"]*bracket/);
    expect(markup).toContain("pas remboursée en 36 mois, il manque ~0,91 €");
    expect(markup).toContain('data-testid="chart-loss"');
    expect(markup).not.toMatch(/class="[^"]*paybackTick/);
    expect(markup).not.toContain("remboursée : 13 mois");
  });

  it("the axis names its two ends and ticks the months 0, 12, 24 and 36; no dotted 12-month reference (C1)", () => {
    const markup = chart(input());
    expect(markup).toContain(">0<");
    expect(markup).toContain(">36 mois<");
    expect(markup.match(/<line [^>]*class="[^"]*axis/g)).toHaveLength(1 + 4);
    expect(markup).not.toMatch(/reference/);
  });

  it("ranges are hatched: the cost's band and the curve's, under one pattern", () => {
    const markup = chart(input({ cost: [1.2, 1.8], curve: { lo: ramp(0.1), hi: ramp(0.14) } }));
    expect(markup).toMatch(/<pattern id="c-hatch"/);
    expect(markup).toMatch(/<rect [^>]*fill="url\(#c-hatch\)"/);
    expect(markup).toMatch(/<path d="M [^"]+ Z" fill="url\(#c-hatch\)" class="[^"]*curveBand/);
    // A fact is a line, never a band.
    expect(chart(input())).not.toContain("url(#c-hatch)");
  });

  it("a payback in a range draws the span of it on the cost line", () => {
    expect(chart(input({ payback: [10, 20] }))).toMatch(/class="[^"]*paybackRange/);
    expect(chart(input({ payback: [10, 10] }))).not.toMatch(/class="[^"]*paybackRange/);
  });

  it("a payback near the plot's end puts its label above the cost line, ending at the tick, so it never runs off the slide", () => {
    const early = chart(input({ payback: [5, 5] }));
    const late = chart(input({ payback: [30, 30] }));
    expect(early).toMatch(/text-anchor="start"[^>]*data-testid="chart-pays-back"/);
    expect(late).toMatch(/text-anchor="end"[^>]*data-testid="chart-pays-back"/);
  });

  it("`sm` leaves out the cost label (the tile above says it)", () => {
    expect(chart(input(), { size: "sm" })).not.toContain("ce que coûte une installation");
    expect(chart(input(), { size: "sm" })).toMatch(/data-size="sm"/);
  });
});
