import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CashWarning, type CashWarningProps } from "../CashWarning";
import { MoneyBlock, type MoneyBlockProps } from "../MoneyBlock";
import { WorthBars } from "../WorthBars";

/**
 * The money on the board (design system extension 09, A20.d T2), pinned
 * without a DOM: a section named by its eyebrow, the loss as an ink tag (its
 * maybe dashed), never red; an unknown as the « ? » box, never 0; the bars
 * decoration, their text real; the warning one sentence on the advice edge.
 *
 * Non-vacuity, measured on 2026-10-03: printing a null fact as « 0 » fails
 * « an unknown is the ? box »; the loss on Tag's `alert` tone fails « never red ».
 */
const html = (node: ReactNode) => renderToStaticMarkup(node as never);
const block = (props: Partial<MoneyBlockProps> = {}) =>
  html(
    createElement(MoneyBlock, {
      eyebrow: "L'argent · août 2026",
      figures: [
        { key: "mrr", label: "MRR", value: "48 000 €" },
        { key: "arr", label: "ARR, le MRR × 12", value: "576 000 €" },
      ],
      worth: { title: "Ce que vaut un nouveau client", tag: { label: "Perte" }, finding: "FINDING" },
      cash: { title: "Trésorerie", facts: [{ key: "tied", label: "Immobilisé", value: null, missing: "il manque la marge brute" }] },
      "data-testid": "money",
      ...props,
    }),
  );

describe("MoneyBlock", () => {
  it("is a section named by its eyebrow, the MRR before the ARR", () => {
    const markup = block();
    expect(markup).toMatch(/<section[^>]*aria-labelledby="engine-money-title"/);
    expect(markup).toMatch(/<h2[^>]*id="engine-money-title"[^>]*>L&#x27;argent · août 2026<\/h2>/);
    expect(markup.indexOf("MRR</dt>")).toBeLessThan(markup.indexOf("ARR, le MRR × 12</dt>"));
  });

  it("names the loss with an ink tag, its maybe dashed — never red", () => {
    const loss = block();
    expect(loss).toMatch(/class="[^"]*ink[^"]*"[^>]*data-testid="money-tag">Perte</);
    expect(loss).not.toMatch(/data-testid="money-tag"[^>]*class="[^"]*alert/);
    const maybe = block({ worth: { title: "T", tag: { label: "Perte possible", maybe: true }, finding: "F" } });
    expect(maybe).toMatch(/class="[^"]*outline[^"]*"[^>]*data-testid="money-tag">Perte possible</);
    expect(block({ worth: { title: "T", finding: "F" } })).not.toContain("money-tag");
  });

  it("an unknown is the « ? » box and says what is missing, never 0", () => {
    const markup = block();
    expect(markup).toMatch(/data-testid="money-fact-tied"[\s\S]*>\?<\/span>[\s\S]*il manque la marge brute/);
    expect(markup).not.toMatch(/data-testid="money-fact-tied"[\s\S]*>0</);
  });

  it("no figures in the hybrid: the total band carries them", () => {
    expect(block({ figures: null })).not.toContain("money-figure-");
    expect(block()).toContain('data-testid="money-figure-arr"');
  });
});

describe("WorthBars", () => {
  const bars = (brings: Parameters<typeof WorthBars>[0]["brings"], gap?: Parameters<typeof WorthBars>[0]["gap"]) =>
    html(createElement(WorthBars, { cost: { label: "Coûte", value: "1 900 €", amount: { lo: 1900, hi: 1900 } }, brings, gap }));

  it("the text is real, the bars decoration; the gap is measured and named", () => {
    const markup = bars({ label: "Rapporte", value: "~1 500 €", amount: { lo: 1500, hi: 1500 } }, { label: "il manque ~400 €", kind: "short" });
    expect(markup).toMatch(/<dt[^>]*>Coûte<\/dt>/);
    expect(markup).toMatch(/<dd[^>]*aria-hidden="true"/);
    expect(markup).toContain("il manque ~400 €");
    expect(markup).toMatch(/class="[^"]*bracket/);
  });

  it("an unknown LTV is the hatched « ? » box and what is missing, never an empty bar; a maybe has no bracket", () => {
    const unknown = bars({ label: "Rapporte", value: "?", amount: null, unknown: "il manque la marge brute" });
    expect(unknown).toMatch(/class="[^"]*unknownMark[^"]*">\?</);
    expect(unknown).toContain("il manque la marge brute");
    const maybe = bars({ label: "Rapporte", value: "~1 500 à 2 300 €", amount: { lo: 1500, hi: 2250 } }, { label: "les deux peuvent se croiser", kind: "maybe" });
    expect(maybe).not.toMatch(/class="[^"]*bracket/);
    expect(maybe).toMatch(/class="[^"]*range/);
  });
});

describe("CashWarning", () => {
  it("one sentence, marked when it is only a maybe", () => {
    expect(html(createElement(CashWarning, {} as CashWarningProps, "Rembourser un client prend 33 mois"))).toMatch(/^<p class="[^"]*">Rembourser/);
    expect(html(createElement(CashWarning, { maybe: true } as CashWarningProps, "x"))).toContain('data-maybe="true"');
  });
});
