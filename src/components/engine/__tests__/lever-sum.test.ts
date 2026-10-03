import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LeverSum, type LeverSumProps } from "../LeverSum";

/**
 * The compounding drawn (design system extension 09, Q9, A20.d T3.b), on the
 * film's three levers: lengths on one scale, the solo bars end to end, the
 * bracket over the end of « together » — and the rows real text.
 */
const rows = [
  { id: "act", label: "Taux d'activation : 18 % → 24 %", value: "+18 000 €", amount: 18_000 },
  { id: "churn", label: "Churn logo mensuel : 6 % → 4 %", value: "+13 000 €", amount: 13_000 },
  { id: "exp", label: "Expansion mensuelle : 2 % → 3 %", value: "+6 400 €", amount: 6_400 },
];
const sum = (props: Partial<LeverSumProps> = {}) =>
  renderToStaticMarkup(
    createElement(LeverSum, {
      title: "Ce que chaque levier rapporte seul, sur le MRR dans 12 mois",
      rows,
      sum: { id: "sum", label: "Chacun seul, additionnés", value: "~37 400 €", amount: 37_400 },
      together: { id: "together", label: "Ensemble", value: "+42 000 €", amount: 42_000 },
      extra: "Ensemble, ils rapportent ~4 600 € de plus…",
      "data-testid": "s",
      ...props,
    }),
  );
const widths = (markup: string) => [...markup.matchAll(/style="left:([\d.]+)%;width:([\d.]+)%"/g)].map((m) => [Number(m[1]), Number(m[2])]);

describe("LeverSum", () => {
  it("a figure: a caption, a definition list of each lever, the sum and together, the bars hidden from a screen reader", () => {
    const markup = sum();
    expect(markup).toMatch(/<figcaption[^>]*>Ce que chaque levier/);
    expect(markup.match(/<dt/g)).toHaveLength(5);
    expect(markup.match(/aria-hidden="true"/g)).toHaveLength(5);
    expect(markup).toContain("Ensemble, ils rapportent");
  });

  it("one scale: together, the longest, runs the whole track; the solo bars run end to end on the « added up » row", () => {
    const w = widths(sum());
    // 3 solo bars, 3 segments, together, the bracket.
    expect(w).toHaveLength(8);
    const at = (i: number) => w[i]!;
    const [act, s1, s2, s3, together, bracket] = [at(0), at(3), at(4), at(5), at(6), at(7)];
    expect(together).toEqual([0, 100]);
    expect(act[1]).toBeCloseTo((18_000 / 42_000) * 100, 3);
    expect(s2[0]).toBeCloseTo(s1[0]! + s1[1]!, 3);
    expect(s3[0]).toBeCloseTo(s2[0]! + s2[1]!, 3);
    expect(bracket[0]).toBeCloseTo((37_400 / 42_000) * 100, 3);
    expect(bracket[1]).toBeCloseTo((4_600 / 42_000) * 100, 3);
  });

  it("no bracket when together brings no more than the sum", () => {
    expect(sum({ together: { id: "together", label: "Ensemble", value: "+37 400 €", amount: 37_400 } })).not.toContain("s-bracket");
  });

  it("a lever that loses MRR draws no bar, and says its sign", () => {
    const markup = sum({ rows: [...rows.slice(0, 2), { id: "neg", label: "Prix : 120 € → 100 €", value: "−2 000 €", amount: -2_000 }] });
    expect(markup).toContain("−2 000 €");
    expect(widths(markup)[2]).toEqual([0, 0]);
  });
});
