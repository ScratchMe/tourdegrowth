import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { WhatIfFigures, type WhatIfFiguresProps } from "../WhatIfFigures";

/**
 * The panel's three tables (design system extension 09, Q9, A20.d T3.b),
 * pinned without a DOM: a caption per table, the figure named by a row
 * header, one value column untouched and three once moved, « today » folded
 * into the what-if cell when narrow, and what a « ? » is missing.
 */
const figures = (props: Partial<WhatIfFiguresProps> = {}) =>
  renderToStaticMarkup(
    createElement(WhatIfFigures, {
      groups: [
        { id: "customer", title: "Un nouveau client", rows: [{ id: "cac", label: "CAC", today: "~1 900 €", whatif: "~1 400 €", change: "−480 € · mieux" }] },
        { id: "cash", title: "Trésorerie", rows: [{ id: "cash", label: "Trésorerie immobilisée", today: "?", whatif: "?", change: "?", missing: "il manque la marge brute" }] },
      ],
      columns: { figure: "Chiffre", today: "Aujourd'hui", whatif: "Avec tes « Et si »", change: "Écart" },
      moved: true,
      todayLine: (v) => `aujourd'hui ${String(v)}`,
      "data-testid": "f",
      ...props,
    }),
  );
const css = readFileSync(join(__dirname, "..", "WhatIfFigures.module.css"), "utf8");

describe("WhatIfFigures", () => {
  it("one captioned table per group, each figure a row header", () => {
    const markup = figures();
    expect(markup.match(/<table/g)).toHaveLength(2);
    expect(markup).toMatch(/<caption[^>]*>Un nouveau client<\/caption>/);
    expect(markup).toMatch(/<th scope="row">CAC<\/th>/);
  });

  it("moved: today, with the what-ifs, the change; « today » again in the what-if cell for the narrow layout", () => {
    const markup = figures();
    expect(markup.match(/<th scope="col"/g)).toHaveLength(8);
    expect(markup).toContain("−480 € · mieux");
    expect(markup).toMatch(/~1 400 €<span class="[^"]*todayLine[^"]*">aujourd&#x27;hui ~1 900 €<\/span>/);
    expect(css).toMatch(/@container whatif-figures \(max-width: 520px\)[\s\S]*\.todayColumn \{\s*display: none;/);
  });

  it("untouched: one value column, no change, no fold", () => {
    const markup = figures({ moved: false });
    expect(markup.match(/<th scope="col"/g)).toHaveLength(4);
    expect(markup).not.toContain("−480");
    expect(markup).not.toContain("todayLine");
  });

  it("a « ? » says what is missing under the row's name — never a 0", () => {
    const markup = figures();
    expect(markup).toMatch(/Trésorerie immobilisée<span class="[^"]*missing[^"]*">il manque la marge brute<\/span>/);
    expect(markup).not.toMatch(/>0</);
  });

  it("the change is bold ink, never a colour", () => {
    expect(css).toMatch(/\.table \.change \{\s*font-weight: 700;\s*\}/);
    expect(css).not.toMatch(/alert|highlight|--paint-/);
  });
});
