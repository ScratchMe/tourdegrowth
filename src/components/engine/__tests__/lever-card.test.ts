import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LeverCard, type LeverCardProps } from "../LeverCard";

/**
 * « Et si ? » through one lever (design system extension 07, A18 T2.c): what
 * the card must say, pinned without a DOM — a native range named by its
 * label, its value in words, the two figures, the way to the full panel, and
 * « back to today » only once the lever moved.
 */
const html = (node: ReactNode) => renderToStaticMarkup(node as never);
const card = (props: Partial<LeverCardProps> = {}) =>
  html(
    createElement(LeverCard, {
      eyebrow: "Et si ?",
      title: "TITLE",
      lever: { id: "lever-act", label: "Taux d'activation (aujourd'hui 18 %)", min: 9, max: 54, step: 1, value: 18, valueText: "18 %", onChange: () => {} },
      figures: [
        { key: "mrr12", label: "MRR dans 12 mois", value: "~40 000 €" },
        { key: "arr12", label: "ARR dans 12 mois", value: "~480 000 €" },
      ],
      allLabel: "Vois les 8 leviers et ce que le calcul suppose →",
      resetLabel: "Remettre à aujourd'hui",
      "data-testid": "lever",
      ...props,
    }),
  );

describe("LeverCard", () => {
  it("is a native range, named by its label, its value said in words and printed beside it", () => {
    const markup = card();
    expect(markup).toMatch(/<label for="lever-act"[^>]*>Taux d/);
    expect(markup).toMatch(/<input id="lever-act" type="range"[^>]*aria-valuetext="18 %"/);
    expect(markup).toMatch(/<output for="lever-act"[^>]*>18 %<\/output>/);
  });

  it("titles itself with the move (or the invitation), and names its section by it", () => {
    expect(card()).toMatch(/<section[^>]*aria-labelledby="engine-lever-title"/);
    expect(card()).toMatch(/<p id="engine-lever-title"[^>]*>TITLE/);
  });

  it("shows two figures, with « today » under each only when given", () => {
    expect(card().match(/<dt/g)).toHaveLength(2);
    expect(card()).not.toContain("today ~");
    expect(card({ figures: [{ key: "mrr12", label: "MRR", value: "~44 000 €", today: "today ~40 000 €" }] })).toContain("today ~40 000 €");
  });

  it("an unknown figure says what is missing as a note, not as a numeral", () => {
    const markup = card({ figures: [{ key: "mrr12", label: "MRR dans 12 mois", value: "il manque l'ARPA", unknown: true }] });
    expect(markup).toMatch(/<dd class="[^"]*figureUnknown[^"]*">il manque/);
    expect(markup).not.toMatch(/figureValue[^"]*">il manque/);
  });

  it("offers « back to today » only once the lever moved; the full panel always", () => {
    expect(card()).not.toContain("Remettre à aujourd");
    expect(card({ moved: true })).toContain("Remettre à aujourd");
    expect(card()).toContain("Vois les 8 leviers");
  });

  it("extension 09: the curve before the figures, the MRR then the ARR in 12 months, each by its key", () => {
    const markup = card({ curve: createElement("figure", { "data-testid": "curve" }) });
    expect(markup.indexOf('data-testid="curve"')).toBeLessThan(markup.indexOf("<dl"));
    expect(markup.indexOf('data-testid="lever-figure-mrr12"')).toBeLessThan(markup.indexOf('data-testid="lever-figure-arr12"'));
    expect(card()).not.toContain("<figure");
  });

  it("extension 09: the one-customer line and the hybrid's total, after the figures, only when given", () => {
    expect(card()).not.toContain("lever-worth");
    expect(card()).not.toContain("lever-total");
    const markup = card({ worth: "Un nouveau client : plus de perte.", total: "Les deux moteurs dans 12 mois : ~320 000 €" });
    expect(markup.indexOf("</dl>")).toBeLessThan(markup.indexOf('data-testid="lever-worth"'));
    expect(markup.indexOf('data-testid="lever-worth"')).toBeLessThan(markup.indexOf('data-testid="lever-total"'));
  });

  it("has no primary button: the next step is the board's", () => {
    expect(card({ moved: true })).not.toMatch(/primary/i);
  });
});
