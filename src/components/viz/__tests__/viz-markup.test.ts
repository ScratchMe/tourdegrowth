import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BulletChart, type BulletChartProps } from "../BulletChart";
import { ChartFrame, type ChartFrameProps } from "../ChartFrame";

/**
 * The markup rules of the viz primitives that a geometry test cannot see.
 *
 * The unit runner has no DOM (environment "node"), but `renderToStaticMarkup`
 * needs none: it turns a component into a string, CSS Modules included (Vite
 * hands back the hashed class map). That is enough to pin what the element
 * tree must be — which mark is drawn, where the caption sits — without a
 * browser. What the marks LOOK like is checked on screen, not here.
 */

const bullet = (props: Omit<BulletChartProps, "ariaLabel">) =>
  renderToStaticMarkup(createElement(BulletChart, { ariaLabel: "Churn 3 %, target 5 %", ...props }));

const frame = (props: Partial<ChartFrameProps>) =>
  renderToStaticMarkup(
    createElement(
      ChartFrame,
      { id: "churn", title: "Churn fell under target", ...props },
      createElement("svg", { "aria-hidden": "true" }),
    ),
  );

const DATA: ChartFrameProps["data"] = {
  label: "See the data",
  columns: [
    { key: "month", header: "Month" },
    { key: "churn", header: "Churn", numeric: true },
  ],
  rows: [{ id: "oct", cells: { month: "Oct", churn: "3 %" } }],
};

describe("BulletChart markup", () => {
  it("draws a value below the domain as a 'lower than this' mark, not as an empty track", () => {
    const below = bullet({ value: 3, target: 5, domain: [4, 6] });
    expect(below).toContain('data-overflow="low"');
    // No fill at all: a sliver of bar would claim a small value.
    expect(below).not.toMatch(/style="width:/);
  });

  it("draws a value exactly on the minimum as a (zero-width) bar, with no 'lower' mark", () => {
    const atMin = bullet({ value: 4, target: 5, domain: [4, 6] });
    expect(atMin).not.toContain('data-overflow="low"');
    expect(atMin).toContain('style="width:0%"');
  });

  it("draws no target tick for a target that is not a number — never left:NaN%", () => {
    const html = bullet({ value: 5, target: Number.NaN, domain: [4, 6] });
    expect(html).not.toContain("left:");
    expect(html).not.toContain("NaN");
  });
});

describe("ChartFrame markup", () => {
  it("captions the figure with its head, as the FIRST child, even with a source and a data table", () => {
    const html = frame({ source: "Flixo, monthly, 2026", data: DATA });
    expect(html).toMatch(/^<figure[^>]*><figcaption[^>]*>/);
    expect(html.match(/<figcaption/g)).toHaveLength(1);
    // The caption closes before anything else — chart, source, disclosure.
    expect(html.indexOf("</figcaption>")).toBeLessThan(html.indexOf("Flixo, monthly, 2026"));
    expect(html.indexOf("</figcaption>")).toBeLessThan(html.indexOf("<details"));
  });

  it("keeps the caption first when there is nothing to draw", () => {
    const html = frame({ source: "Flixo", state: { kind: "empty", message: "No month closed yet." } });
    expect(html).toMatch(/^<figure[^>]*><figcaption[^>]*>/);
    expect(html.match(/<figcaption/g)).toHaveLength(1);
  });
});
