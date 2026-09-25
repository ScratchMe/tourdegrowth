import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BulletChart, type BulletChartProps } from "../BulletChart";

/**
 * The markup rules of the viz primitives that a geometry test cannot see.
 *
 * The unit runner has no DOM (environment "node"), but `renderToStaticMarkup`
 * needs none: it turns a component into a string, CSS Modules included (Vite
 * hands back the hashed class map). That is enough to pin what the element
 * tree must be — which mark is drawn — without a
 * browser. What the marks LOOK like is checked on screen, not here.
 */

const bullet = (props: Omit<BulletChartProps, "ariaLabel">) =>
  renderToStaticMarkup(createElement(BulletChart, { ariaLabel: "Churn 3 %, target 5 %", ...props }));

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
