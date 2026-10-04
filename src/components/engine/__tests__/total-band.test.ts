import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { TotalBand, type TotalBandProps } from "../TotalBand";

/**
 * TotalBand (design system extension 07, A18 T5): two engines, one total
 * (C4). A sum, never a comparison — pinned without a DOM: the order is the
 * one given, each label sits with its figure, and nothing but a rule sets
 * the total off.
 */
const html = (node: ReactNode) => renderToStaticMarkup(node as never);
const band = (props: Partial<TotalBandProps> = {}) =>
  html(
    createElement(TotalBand, {
      eyebrow: "Deux moteurs, un total",
      title: "Le MRR atteint 228 000 €",
      engines: [
        { id: "plg", label: "MRR libre-service", value: "48 000 €" },
        { id: "slg", label: "MRR assisté", value: "180 000 €" },
      ],
      total: { label: "MRR total", value: "228 000 €" },
      link: createElement("p", null, "31 des 130 opportunités assistées viennent du libre-service."),
      ...props,
    }),
  );
const css = readFileSync(join(__dirname, "..", "TotalBand.module.css"), "utf8");

describe("TotalBand", () => {
  it("is a section named by its heading, which takes the focus a person's move sends it", () => {
    expect(band()).toMatch(/<section[^>]*aria-labelledby="engine-total-title"/);
    expect(band()).toMatch(/<h2 id="engine-total-title"[^>]*tabindex="-1"/);
  });

  it("keeps the order it is given — self-serve, sales-assisted, then the total — whatever the values", () => {
    const markup = band({
      engines: [
        { id: "plg", label: "MRR libre-service", value: "1 €" },
        { id: "slg", label: "MRR assisté", value: "999 999 €" },
      ],
    });
    expect(markup.indexOf("MRR libre-service")).toBeLessThan(markup.indexOf("MRR assisté"));
    expect(markup.indexOf("MRR assisté")).toBeLessThan(markup.indexOf("MRR total"));
  });

  it("each figure is read with its label (a definition list), and no « + » nor « = » sits between them", () => {
    const markup = band();
    expect(markup.match(/<dt/g)).toHaveLength(3);
    expect(markup.match(/<dd/g)).toHaveLength(3);
    // The words a reader sees, tags left out (their attributes carry « = »).
    const sum = markup.slice(markup.indexOf("<dl"), markup.indexOf("</dl>")).replace(/<[^>]*>/g, " ");
    expect(sum).toContain("228 000 €");
    expect(sum).not.toMatch(/[+=]/);
  });

  it("sets the total off by a rule — beside it, or above it on a phone — and never draws a bar", () => {
    expect(css).toMatch(/\.total \{[^}]*border-left: var\(--border-solid\)/);
    expect(css).toMatch(/@media \(max-width: 760px\)[\s\S]*\.total \{[^}]*border-top: var\(--border-solid\)/);
    expect(band()).not.toMatch(/<svg|<progress|<meter/);
  });

  it("extension 09: one line of what else adds up, under the sum, before the link — only when given", () => {
    expect(band()).not.toContain("ARR total");
    const markup = band({
      totals: [
        { key: "arr", label: "ARR total", value: "2 736 000 €" },
        { key: "mrr12", label: "MRR dans 12 mois au rythme actuel", value: "~440 000 €" },
        { key: "cash", label: "Trésorerie immobilisée totale", value: "~1 700 000 €" },
      ],
      "data-testid": "band",
    });
    expect(markup.indexOf("MRR total")).toBeLessThan(markup.indexOf("ARR total"));
    expect(markup.indexOf("Trésorerie immobilisée totale")).toBeLessThan(markup.indexOf("opportunités assistées"));
    expect(markup.match(/data-testid="band-totals-/g)).toHaveLength(3);
    // Two by two on a phone, so the band grows by a row.
    expect(css).toMatch(/@media \(max-width: 760px\)[\s\S]*\.totals \{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  });

  it("a part with no figure is words: its value set in the text face, muted — never in the figures' face (A21.3)", () => {
    const markup = band({
      engines: [
        { id: "plg", label: "MRR libre-service", value: "48 000 €" },
        { id: "slg", label: "MRR assisté", value: "pas de chiffre", missing: true },
      ],
      total: { label: "MRR total", value: "pas de chiffre", missing: true },
    });
    expect(markup.match(/<dd class="[^"]*missing[^"]*"/g)).toHaveLength(2);
    expect(band()).not.toMatch(/missing/);
    expect(css).toMatch(/\.total \.value\.missing \{[^}]*font: var\(--body-md\)/);
  });

  it("says the link last, and only when there is one", () => {
    expect(band().indexOf("opportunités assistées")).toBeGreaterThan(band().indexOf("</dl>"));
    expect(band({ link: undefined })).not.toContain("opportunités");
  });
});
