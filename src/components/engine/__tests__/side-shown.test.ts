import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SideShown, type SideShownProps } from "../SideShown";

/**
 * SideShown (design system extension 10, A23 MKT-7a): the marketplace's side
 * selector and the heading of the side it shows — one side at a time, never
 * both (C70). Pinned without a DOM: the two options in the order received
 * with the shown one selected, the heading and the note, no figure and no
 * colour on an option, and not one word written by the component.
 *
 * Non-vacuity (2026-10-27, one sabotage at a time, restored after): the options
 * reversed drops 2 tests (the order, the exact text); the shown side no longer
 * marked 1; the Segmented without the visible label 1; the heading id without
 * its suffix 1; a figure added to the note 1; the opening rule softened to a
 * dashed divider 1.
 */
const html = (node: ReactNode) => renderToStaticMarkup(node as never);
const SIDES: SideShownProps["sides"] = [
  { id: "demand", label: "Demande" },
  { id: "supply", label: "Offre" },
];
const selector = (props: Partial<SideShownProps> = {}) =>
  html(
    createElement(SideShown, {
      label: "Côté affiché",
      sides: SIDES,
      value: "demand",
      title: "La demande : les acheteurs",
      note: "Deux côtés, deux lectures.",
      "data-testid": "side-shown",
      ...props,
    }),
  );
/** The words a reader sees, in order: the tags between them dropped. */
const words = (markup: string) =>
  markup
    .replace(/<[^>]*>/g, "|")
    .split("|")
    .map((w) => w.trim())
    .filter(Boolean);
const css = readFileSync(join(__dirname, "..", "SideShown.module.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

describe("SideShown", () => {
  it("is a section named by the side's heading, which is an h2 under it", () => {
    const markup = selector();
    expect(markup).toMatch(/<section[^>]*aria-labelledby="side-shown-title"[^>]*data-testid="side-shown"/);
    expect(markup).toMatch(/<h2 id="side-shown-title"[^>]*>La demande : les acheteurs<\/h2>/);
    expect(selector({ headingId: "engine-side-title" })).toMatch(/<h2 id="engine-side-title-title"/);
  });

  it("gives the two options in the order received — demand, then supply — whichever is shown", () => {
    for (const value of ["demand", "supply"] as const) {
      const markup = selector({ value });
      expect(markup.indexOf("Demande")).toBeGreaterThan(-1);
      expect(markup.indexOf("Demande")).toBeLessThan(markup.indexOf("Offre"));
    }
    // The order is the one given, not a ranking: a different pair of labels keeps its own order.
    const markup = selector({ sides: [{ id: "demand", label: "ZZZ" }, { id: "supply", label: "AAA" }] });
    expect(markup.indexOf("ZZZ")).toBeLessThan(markup.indexOf("AAA"));
  });

  it("selects the side shown, and only it", () => {
    const demand = selector({ value: "demand" });
    expect(demand.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(demand).toMatch(/aria-pressed="true"[^>]*>Demande</);
    expect(demand).toMatch(/aria-pressed="false"[^>]*>Offre</);
    const supply = selector({ value: "supply" });
    expect(supply.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(supply).toMatch(/aria-pressed="true"[^>]*>Offre</);
  });

  it("names the group by its visible label: a fieldset, whose legend the Segmented points at", () => {
    const markup = selector();
    expect(markup).toMatch(/<fieldset[^>]*>/);
    expect(markup).toContain('id="side-shown-label"');
    expect(markup).toMatch(/role="group"[^>]*aria-labelledby="side-shown-label"/);
  });

  it("the note is a line under the heading, and only when given", () => {
    const markup = selector();
    expect(markup.indexOf("La demande : les acheteurs")).toBeLessThan(markup.indexOf("Deux côtés, deux lectures."));
    expect(selector({ note: undefined })).not.toContain("Deux côtés");
  });

  it("writes no word of its own, no figure, no mark: its text is exactly the props'", () => {
    const markup = selector();
    expect(words(markup)).toEqual(["Côté affiché", "Demande", "Offre", "La demande : les acheteurs", "Deux côtés, deux lectures."]);
    expect(words(markup).join(" ")).not.toMatch(/\d/);
    expect(markup).not.toMatch(/<svg|<img|<progress|<meter/);
    expect(words(selector({ note: undefined }))).toEqual(["Côté affiché", "Demande", "Offre", "La demande : les acheteurs"]);
  });

  it("opens the side's part with the hard rule, and takes no colour of its own", () => {
    expect(css).toMatch(/\.root \{[^}]*border-top: var\(--market-side-rule\)/);
    expect(css).not.toMatch(/alert|paint-red|highlight|accent|--viz-|diagnosis-edge|advice-edge|pending-edge/);
  });
});
