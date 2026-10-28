import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PaybackChart, type PaybackChartProps } from "../PaybackChart";

/**
 * PaybackChart on a marketplace side's slide (A23 MKT-8, `layout="side"`): where the cost's words stand. At the left, running from the
 * plot's start, when nothing strikes them through; at the right end, ending there, when the margin line crosses the cost line under
 * them — the paid seller's early payback. The default layout, the SaaS's and the app's, draws what it always drew.
 *
 * Non-vacuity (2026-10-28, one sabotage at a time, restored after; counts measured, the tests that fall): `costLabelAtEnd` always
 * false 1 test, always true 2; the crossing's gap left at 16 1; the layout not passed to the geometry 1.
 */
const html = (node: ReactNode) => renderToStaticMarkup(node as never);
const labels: PaybackChartProps["labels"] = {
  start: "0",
  end: "36 mois",
  reference: "12 mois",
  cost: "ce que coûte un nouveau vendeur abonné",
  unknown: "il manque la marge",
  leaves: "part vers 33 mois",
  paysBack: "remboursé : 8 mois",
  short: "il manque",
  after: "~25 mois de marge après",
  time: "remboursé à 8 mois, puis ~25 mois de marge",
};
const seller: PaybackChartProps = {
  story: "pays-back",
  monthlyMargin: [25, 25],
  cac: [200, 200],
  lifetime: [33, 33],
  payback: [8, 8],
  reference: null,
  width: 900,
  height: 240,
  labels,
  summary: "Un vendeur abonné.",
  id: "p",
};
const chart = (props: Partial<PaybackChartProps> = {}) => html(createElement(PaybackChart, { ...seller, ...props }));
/** The cost's words: the text element holding them, its anchor and its x. */
const costText = (markup: string) => {
  const m = markup.match(/<text x="([\d.]+)" y="[\d.]+" class="[^"]*" text-anchor="(start|end)">ce que coûte un nouveau vendeur abonné<\/text>/);
  return m ? { x: Number(m[1]), anchor: m[2] } : null;
};

describe("PaybackChart's side layout", () => {
  it("the default layout puts the cost's words at the left, running from the plot's start", () => {
    expect(costText(chart())).toEqual({ x: 8, anchor: "start" });
    expect(costText(chart({ layout: "default" }))).toEqual({ x: 8, anchor: "start" });
  });

  it("the side layout ends them at the plot's right end when the early payback's line would cross them", () => {
    expect(costText(chart({ layout: "side" }))).toEqual({ x: 900 - 16, anchor: "end" });
  });

  it("and keeps them at the left when the payback is late (the line crosses the cost line beyond them)", () => {
    const late = chart({ layout: "side", cac: [2900, 2900], monthlyMargin: [90, 90], lifetime: [36, 36], payback: [32.2, 32.2] });
    expect(costText(late)).toEqual({ x: 8, anchor: "start" });
  });

  it("the crossing's words are drawn at the left once the cost's have moved, and the bracket then says the months after", () => {
    // 8 months on a 900px chart: the crossing is too near the start for its label to fit, with or without the cost's words there.
    const markup = chart({ layout: "side" });
    expect(markup).toContain("remboursé à 8 mois, puis ~25 mois de marge");
    expect(markup).not.toContain("remboursé : 8 mois");
  });

  it("the crossing's words keep their distance from the cost's: a buyer's 22 months fit beside them by 16px, not by 72", () => {
    const buyer: Partial<PaybackChartProps> = {
      monthlyMargin: [30 / 22, 30 / 22],
      cac: [30, 30],
      lifetime: [25, 25],
      payback: [22, 22],
      labels: { ...labels, cost: "what a new buyer costs", paysBack: "paid back: 20–23 months", time: "paid back at 20–23 months, then ~2–5 months of margin", after: "~2–5 months of margin after" },
    };
    const shown = chart(buyer);
    expect(shown).toContain("paid back: 20–23 months");
    expect(shown).not.toContain("then ~2–5 months of margin");
    const side = chart({ ...buyer, layout: "side" });
    expect(side).not.toContain(">paid back: 20–23 months<");
    expect(side).toContain("paid back at 20–23 months, then ~2–5 months of margin");
  });

  it("the layout reaches the drawing: on the side's the scale is higher, the cost line lower on the plot, and the line ends on it with its dot", () => {
    const costY = (markup: string) => Number(markup.match(/<line [^>]*y1="([\d.]+)"[^>]*class="[^"]*_cost_/)?.[1] ?? markup.match(/<line [^>]*class="[^"]*_cost_[^"]*"[^>]*y1="([\d.]+)"/)?.[1]);
    expect(costY(chart({ layout: "side" }))).toBeGreaterThan(costY(chart()) + 5);
    const dots = (markup: string) => markup.match(/<circle [^>]*_dot_/g)?.length ?? 0;
    // The crossing's dot alone on the default (the line leaves by the top edge); the line's end as well on the side's.
    expect(dots(chart())).toBe(1);
    expect(dots(chart({ layout: "side" }))).toBe(2);
  });

  it("the picture of the default layout does not depend on the new prop: the same markup, byte for byte", () => {
    expect(chart({ layout: "default" })).toBe(chart());
  });
});
