import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MrrCurve, type MrrCurveProps } from "../MrrCurve";

/**
 * The MRR's curve (design system extension 09, Q8, A20.d T3.a), pinned
 * without a DOM: the drawing is decoration and the caption says it in
 * words; both lines ink, never the leak's red; a range hatched; the names at
 * the lines' ends.
 */
const pts = (from: number, to: number, spread = 0) =>
  Array.from({ length: 13 }, (_, i) => {
    const v = from + ((to - from) * i) / 12;
    return [v - spread, v + spread] as [number, number];
  });
const curve = (props: Partial<MrrCurveProps> = {}) =>
  renderToStaticMarkup(
    createElement(MrrCurve, {
      id: "c",
      today: pts(48_000, 80_000),
      keys: { today: "au rythme d'aujourd'hui", whatif: "avec tes « Et si »" },
      start: "48 000 € aujourd'hui",
      xLabels: ["août 2026", "février 2027", "août 2027"],
      summary: "Le MRR mois par mois, de 48 000 € aujourd'hui à ~80 000 € dans 12 mois au rythme actuel.",
      "data-testid": "curve",
      ...props,
    }),
  );

describe("MrrCurve", () => {
  it("is a figure: the SVG hidden from a screen reader, the curve said in words in its caption", () => {
    const markup = curve();
    expect(markup).toMatch(/<figure[^>]*data-testid="curve"/);
    expect(markup).toMatch(/<svg[^>]*aria-hidden="true"/);
    expect(markup).toMatch(/<figcaption class="tdg-visually-hidden">Le MRR mois par mois/);
  });

  it("untouched: today's line and its name alone; one figure on the curve, today's MRR; three months under the axis", () => {
    const markup = curve();
    expect(markup.match(/<polyline/g)).toHaveLength(1);
    expect(markup).toContain("au rythme d&#x27;aujourd&#x27;hui");
    expect(markup).not.toContain("avec tes");
    expect(markup).toContain("48 000 € aujourd&#x27;hui");
    expect(markup).toContain("février 2027");
  });

  it("moved: two lines, the room between them, both names", () => {
    const markup = curve({ whatif: pts(48_000, 94_000) });
    expect(markup.match(/<polyline/g)).toHaveLength(2);
    expect(markup).toMatch(/<polygon points="[^"]+" class="[^"]*gain/);
    expect(markup).toContain("avec tes « Et si »");
  });

  it("a range is hatched, edged by both paths", () => {
    const markup = curve({ today: pts(180_000, 335_000, 3_600) });
    expect(markup).toMatch(/<pattern id="c-hatch"/);
    expect(markup).toMatch(/<polygon points="[^"]+" class="[^"]*band[^"]*" fill="url\(#c-hatch\)"/);
    expect(markup.match(/<polyline/g)).toHaveLength(2);
    expect(markup).toMatch(/data-range="true"/);
  });

  it("drawn at the width it is given — a slide's — never compact there", () => {
    const markup = curve({ width: 1_520, height: 260 });
    expect(markup).toMatch(/<svg[^>]*width="1520" height="260" viewBox="0 0 1520 260"/);
    expect(markup).not.toContain("data-compact");
  });

  it("no red anywhere: the projection is not a diagnosis", () => {
    expect(curve({ whatif: pts(48_000, 94_000) })).not.toMatch(/alert|red|leak/i);
  });
});
