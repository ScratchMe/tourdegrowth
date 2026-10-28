import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SideFunnel, type FunnelColumn, type SideFunnelProps } from "../SideFunnel";

/**
 * SideFunnel (design system extension 10, A23 MKT-7a): one side of a
 * marketplace as a funnel — the peloton's grammar for one side at a time
 * (C70). Pinned without a DOM: one grid per column and one for the second
 * base, at most one alert Tag (the side's one red), the monthly rates in a
 * list and never as grids, the card on a screen and none on a slide, and not
 * one word written by the component.
 *
 * Non-vacuity (2026-10-27, one sabotage at a time, restored after): `highlighted`
 * dropped 1 test; the Tag in the neutral tone 1; another column painted red 2;
 * a second alert Tag 3; a grid drawn in the rates 2; the card kept on a slide 1;
 * the base's section without its label 1; the base's grid dropped 5; a word
 * added before the upstream line 1; `ariaLabel` ignored 1; the phone's grid
 * slot lost in the CSS 1; the column head's height lost in the CSS 1. A23 MKT-8 (2026-10-28): the typed « → » kept on a slide 1.
 */
const html = (node: ReactNode) => renderToStaticMarkup(node as never);
const dots = (filled: number): FunnelColumn["grid"] => ({
  kind: "known",
  dots: Array.from({ length: 100 }, (_, i) => (i < filled ? ("filled" as const) : ("empty" as const))),
});
const column = (id: string, n: string, label: string, filled: number, more: Partial<FunnelColumn> = {}): FunnelColumn => ({ id, n, label, grid: dots(filled), ...more });

/** Demand: the 100, two stages on the same 100, and the fill rate on a base of its own. */
const demand = (props: Partial<SideFunnelProps> = {}): SideFunnelProps => ({
  title: "Pour 100 inscrits côté acheteurs",
  upstream: "~2 000 visiteurs par mois pour 100 inscrits",
  columns: [
    column("signups", "100", "Inscrits", 100, { source: "Amplitude · mai 2026" }),
    column("first", "20", "Première commande sous 30 jours", 20),
    column("second", "5", "Deuxième commande sous 90 jours", 5),
  ],
  base: {
    title: "Liquidité · sur 100 recherches",
    column: column("fill", "9", "Taux de service", 9, { holds: { label: "Sous la cible" } }),
    line: "Taux de service : 9 % des recherches aboutissent à une commande",
  },
  note: "Tes 3 000 inscrits sont ramenés à 100.",
  legend: [
    { kind: "filled", label: "Mesuré" },
    { kind: "unknown", label: "Pas mesuré" },
  ],
  "data-testid": "funnel",
  ...props,
});
/** Supply: the 100, two stages, and the monthly churns as rates. */
const supply = (props: Partial<SideFunnelProps> = {}): SideFunnelProps => ({
  title: "Pour 100 vendeurs inscrits",
  columns: [column("signups", "100", "Inscrits", 100), column("first", "30", "Première vente sous 60 jours", 30), column("paid", "15", "Abonnés sous 90 jours", 15, { holds: { label: "Sous la cible" } })],
  ratesTitle: "Chaque mois",
  rates: [
    { id: "active", label: "Vendeurs actifs qui partent", value: "3 %" },
    { id: "paid", label: "Vendeurs payants qui résilient", value: "3 %", note: "cible 2,5 %" },
  ],
  "data-testid": "funnel",
  ...props,
});
const funnel = (props: SideFunnelProps) => html(createElement(SideFunnel, props));
const grids = (markup: string) => markup.match(/role="img"/g)?.length ?? 0;
/** Alert Tags: the side's one red label. */
const alertTags = (markup: string) => markup.match(/<span class="[^"]*_alert_/g)?.length ?? 0;
/** Grids painted in the red of the diagnosis. */
const redGrids = (markup: string) => markup.match(/<div role="img"[^>]*class="[^"]*_highlighted_/g)?.length ?? 0;
const words = (markup: string) =>
  markup
    .replace(/<[^>]*>/g, "|")
    .split("|")
    .map((w) => w.trim())
    .filter(Boolean);
const css = readFileSync(join(__dirname, "..", "SideFunnel.module.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

describe("SideFunnel", () => {
  it("draws one grid per column and one for the second base, each a sentence for a screen reader", () => {
    const markup = funnel(demand());
    expect(grids(markup)).toBe(4);
    expect(markup.match(/<figure/g)).toHaveLength(4);
    expect(markup).toContain('aria-label="100 Inscrits"');
    expect(markup).toContain('aria-label="9 Taux de service"');
    // A sentence of the caller's wins over the figure and the label.
    const named = funnel(demand({ columns: [column("signups", "100", "Inscrits", 100, { ariaLabel: "Les 100 inscrits de mai" })] }));
    expect(named).toContain('aria-label="Les 100 inscrits de mai"');
    expect(named).not.toContain('aria-label="100 Inscrits"');
  });

  it("keeps the columns in the order given, the 100 first", () => {
    const markup = funnel(demand());
    expect(markup.indexOf("Inscrits")).toBeLessThan(markup.indexOf("Première commande"));
    expect(markup.indexOf("Première commande")).toBeLessThan(markup.indexOf("Deuxième commande"));
    expect(markup).toMatch(/style="--side-funnel-cols:3"/);
  });

  it("sets the second base apart: after the columns, under its own heading, with its own sentence", () => {
    const markup = funnel(demand());
    expect(markup).toMatch(/<section[^>]*aria-labelledby="side-funnel-base"/);
    expect(markup).toMatch(/<h3 id="side-funnel-base"[^>]*>Liquidité · sur 100 recherches<\/h3>/);
    expect(markup.indexOf("Deuxième commande")).toBeLessThan(markup.indexOf("side-funnel-base"));
    expect(markup.indexOf("Liquidité")).toBeLessThan(markup.indexOf("Taux de service"));
    expect(markup.indexOf("Taux de service")).toBeLessThan(markup.indexOf("aboutissent à une commande"));
    expect(funnel(demand({ base: undefined }))).not.toContain("side-funnel-base");
  });

  it("names the column the diagnosis holds with one alert Tag and red dots — and only that column", () => {
    const markup = funnel(demand());
    expect(alertTags(markup)).toBe(1);
    expect(redGrids(markup)).toBe(1);
    expect(markup.match(/data-holds="true"/g)).toHaveLength(1);
    expect(markup).toContain("Sous la cible");
    // The stage below its target that is not the named one stays ink.
    const none = funnel(demand({ base: { title: "Liquidité", column: column("fill", "9", "Taux de service", 9) } }));
    expect(alertTags(none)).toBe(0);
    expect(redGrids(none)).toBe(0);
    expect(none).not.toContain("Sous la cible");
  });

  it("the monthly rates are a list of lines — name, value, note — and never grids", () => {
    const markup = funnel(supply());
    const rates = markup.slice(markup.indexOf("<dl"), markup.indexOf("</dl>"));
    expect(rates.match(/<dt/g)).toHaveLength(2);
    expect(rates.match(/<dd/g)).toHaveLength(3);
    expect(rates).not.toMatch(/role="img"|data-dot|<figure/);
    expect(markup.indexOf("Chaque mois")).toBeLessThan(markup.indexOf("Vendeurs actifs qui partent"));
    expect(markup.indexOf("Vendeurs payants qui résilient")).toBeLessThan(markup.indexOf("cible 2,5 %"));
    // The rates come after the columns, whose grids are the three stages alone.
    expect(markup.indexOf("Abonnés sous 90 jours")).toBeLessThan(markup.indexOf("<dl"));
    expect(grids(markup)).toBe(3);
    expect(funnel(supply({ rates: undefined }))).not.toContain("<dl");
  });

  it("a rate the diagnosis names takes the diagnosis edge, not the red of the dots nor a Tag", () => {
    const markup = funnel(
      supply({
        columns: [column("signups", "100", "Inscrits", 100), column("first", "30", "Première vente", 30)],
        rates: [{ id: "paid", label: "Vendeurs payants qui résilient", value: "3 %", holds: true }],
      }),
    );
    expect(markup.match(/data-holds="true"/g)).toHaveLength(1);
    expect(markup).toMatch(/<div class="[^"]*_rateHolds_/);
    expect(alertTags(markup)).toBe(0);
    expect(redGrids(markup)).toBe(0);
    expect(css).toMatch(/\.rateHolds \{[^}]*border-left: var\(--engine-diagnosis-edge\)/);
  });

  it("a stage nobody measures is the hatched « ? » box, never an empty column", () => {
    const markup = funnel(supply({ columns: [column("signups", "100", "Inscrits", 100), { id: "first", n: "?", label: "Première vente", grid: { kind: "unknown", dots: [] } }] }));
    expect(markup).toContain('data-state="unknown"');
    expect(markup.match(/data-state="known"/g)).toHaveLength(1);
  });

  it("without subscriptions the side has an aside and no money: the aside sits after the columns", () => {
    const markup = funnel(supply({ columns: [column("signups", "100", "Inscrits", 100), column("first", "30", "Première vente", 30)], aside: "Leur travail se lit côté demande." }));
    expect(markup).toMatch(/<p class="[^"]*_aside_[^"]*">Leur travail se lit côté demande\.<\/p>/);
    expect(markup.indexOf("<dl")).toBeLessThan(markup.indexOf("Leur travail"));
    expect(funnel(supply())).not.toContain("_aside_");
  });

  it("the legend is DotGrid's: one entry per mark given, under the cohort line; none, none", () => {
    const markup = funnel(demand());
    expect(markup.match(/<li>/g)).toHaveLength(2);
    expect(markup.indexOf("Tes 3 000 inscrits")).toBeLessThan(markup.indexOf("Mesuré"));
    expect(markup).toMatch(/<ul class="[^"]*_legend_/);
    const bare = funnel(demand({ legend: undefined, note: undefined }));
    expect(bare).not.toMatch(/<ul|_foot_/);
  });

  it("a screen is the board's one raised card, titled by an h2 the section is named by", () => {
    const markup = funnel(demand());
    expect(markup).toMatch(/^<div class="[^"]*_raised_[^"]*"[^>]*data-testid="funnel"/);
    expect(markup).toMatch(/<section[^>]*aria-labelledby="side-funnel"/);
    expect(markup).toMatch(/<h2 id="side-funnel"[^>]*>Pour 100 inscrits côté acheteurs<\/h2>/);
    expect(markup.match(/_raised_/g)).toHaveLength(1);
  });

  it("a slide has no card and no heading — the slide is the frame — and names its section by the title", () => {
    const markup = funnel(demand({ medium: "slide" }));
    expect(markup).not.toMatch(/_raised_|<h2/);
    expect(markup).toMatch(/^<section class="[^"]*_slide_[^"]*"[^>]*aria-label="Pour 100 inscrits côté acheteurs"[^>]*data-testid="funnel"/);
    // The same columns, the base and the legend, on the slide's grids.
    expect(grids(markup)).toBe(4);
    expect(markup.match(/_slide_/g)?.length).toBeGreaterThanOrEqual(5);
    // The rates sit at the columns' right, where the slide has room; the legend shares the upstream line's row.
    expect(css).toMatch(/\.slide \.rates \{[^}]*grid-area: rates/);
    expect(css).toMatch(/\.slide \.foot \{[^}]*grid-area: up/);
  });

  it("a slide draws its upstream arrow and types none (engine spec §10.4): no « → », « ← » or « − » in its markup; a screen keeps the typed one", () => {
    const slide = funnel(demand({ medium: "slide" }));
    expect(slide).not.toMatch(/[→←−]/);
    // Drawn: one inline SVG, on the upstream line, hidden from a screen reader, in the text's colour.
    const arrow = slide.match(/<span class="[^"]*_arrow_[^"]*" aria-hidden="true"><svg [^>]*>.*?<\/svg><\/span>/);
    expect(arrow?.[0]).toMatch(/viewBox="0 0 24 12"/);
    expect(arrow?.[0]).toMatch(/stroke="currentColor"/);
    expect(slide.match(/<svg[^>]*viewBox="0 0 24 12"/g)).toHaveLength(1);
    // The upstream line's text is the props', the arrow is not a word.
    expect(words(slide)).toContain("~2 000 visiteurs par mois pour 100 inscrits");
    expect(words(slide)).not.toContain("→");
    expect(funnel(demand())).toContain("→");
    expect(css).toMatch(/\.arrowDrawn \{[^}]*width: 1em/);
  });

  it("on a phone each column is a row — the grid left, its words right — as the peloton's", () => {
    expect(css).toMatch(/@media \(max-width: 760px\)[\s\S]*\.inner \.col \{[^}]*grid-template-columns: var\(--market-funnel-grid-mobile\) minmax\(0, 1fr\)/);
    expect(css).toMatch(/@media \(max-width: 760px\)[\s\S]*\.inner \.col > \.grid \{[^}]*grid-area: grid/);
    // The phone rules are scoped to the card: a slide is a 1 920 canvas scaled whole, never reflowed.
    expect(css.slice(css.indexOf("@media (max-width: 760px)"), css.indexOf(".slide {"))).not.toMatch(/\.slide/);
  });

  it("every column's head has the same height, so the grids start on one line; a column never outgrows the peloton's", () => {
    expect(css).toMatch(/\.text \{[^}]*min-height: var\(--market-funnel-head\)/);
    expect(css).toMatch(/\.same \{[^}]*minmax\(0, var\(--market-funnel-col\)\)/);
    expect(css).toMatch(/\.slide \.text \{[^}]*min-height: var\(--market-slide-head\)/);
  });

  it("writes no word of its own: its text is the props', and the arrow", () => {
    const markup = funnel(demand());
    expect(words(markup)).toEqual([
      "Pour 100 inscrits côté acheteurs",
      "→",
      "~2 000 visiteurs par mois pour 100 inscrits",
      "100",
      "Inscrits",
      "Amplitude · mai 2026",
      "20",
      "Première commande sous 30 jours",
      "5",
      "Deuxième commande sous 90 jours",
      "Liquidité · sur 100 recherches",
      "9",
      "Taux de service",
      "Sous la cible",
      "Taux de service : 9 % des recherches aboutissent à une commande",
      "Tes 3 000 inscrits sont ramenés à 100.",
      "Mesuré",
      "Pas mesuré",
    ]);
  });

  it("computes no figure: a column's numeral is printed as it is given, whatever the dots say", () => {
    const markup = funnel(demand({ columns: [column("signups", "100", "Inscrits", 100), column("first", "6 à 9", "Première commande", 20)] }));
    expect(markup).toContain(">6 à 9<");
    expect(markup.match(/data-dot="filled"/g)?.length).toBeGreaterThan(20);
  });
});
