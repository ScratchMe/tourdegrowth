import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SlideStreams, type SlideStreamsProps } from "../SlideStreams";

/**
 * SlideStreams (design system extension 10, A23 MKT-8): the marketplace's total slide as a ledger — « Deux flux, un total ». Pinned
 * without a DOM: the order is the sum's (the commissions, then the subscriptions) whatever their size, the table says each figure
 * with its row and its column, the total sits under its own rule and nothing in the sheet or the markup ranks the two streams
 * (no bar, no share, no « + », no « = ») — and the component writes no word of its own.
 *
 * Non-vacuity (2026-10-28, one sabotage at a time, restored after; counts measured): the streams drawn in the order of their
 * size drops 1 test; the total's row before the streams 3; a header cell without `scope="row"` on the streams 1; a `<progress>`
 * in the markup 2; a « = » before the total 2; the total's rule removed from the sheet 1; a column key shown in the markup 2.
 */
const html = (node: ReactNode) => renderToStaticMarkup(node as never);
const words = (markup: string) =>
  markup
    .replace(/<[^>]*>/g, "|")
    .split("|")
    .map((w) => w.trim())
    .filter(Boolean);

const COLUMNS = [
  { key: "month", label: "Ce mois-ci" },
  { key: "fresh", label: "Nouveau chaque mois" },
  { key: "in12", label: "Dans 12 mois au rythme actuel" },
] as const;

const props = (over: Partial<SlideStreamsProps> = {}): SlideStreamsProps => ({
  caption: "Deux flux, un total",
  columns: COLUMNS,
  streams: [
    { id: "demand", label: "Commissions (revenu net)", side: "les acheteurs, slides 2 à 5", values: { month: "32 853,60 €", fresh: "~1 400 €", in12: "~34 000 €" } },
    { id: "supply", label: "Abonnements des vendeurs", side: "les vendeurs, slides 6 à 9", values: { month: "26 100 €", fresh: "~1 700 €", in12: "~36 000 €" } },
  ],
  total: { label: "Total par mois", values: { month: "58 953,60 €", fresh: "~3 100 €", in12: "~70 000 €" } },
  note: "Une somme, jamais une comparaison : chaque flux se lit sur les slides de son côté, contre ses propres cibles.",
  "data-testid": "streams",
  ...over,
});
const ledger = (over: Partial<SlideStreamsProps> = {}) => html(createElement(SlideStreams, props(over)));
const css = readFileSync(join(__dirname, "..", "SlideStreams.module.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

describe("SlideStreams", () => {
  it("is a figure around one table, named by its caption, its note under it", () => {
    const markup = ledger();
    expect(markup).toMatch(/^<figure[^>]*data-testid="streams"/);
    expect(markup).toMatch(/<caption[^>]*>Deux flux, un total<\/caption>/);
    expect(markup).toMatch(/<\/table><figcaption[^>]*>Une somme, jamais une comparaison/);
  });

  it("reads down in the sum's order: the commissions, the subscriptions, then the total — whatever their size", () => {
    const markup = ledger();
    expect(markup.indexOf('data-stream="demand"')).toBeLessThan(markup.indexOf('data-stream="supply"'));
    expect(markup.indexOf('data-stream="supply"')).toBeLessThan(markup.indexOf('data-stream="total"'));
    // The supply is the smaller of the two here and still second; swap the sizes and the order does not move.
    const swapped = ledger({
      streams: [
        { id: "demand", label: "Commissions (revenu net)", values: { month: "1 000 €", fresh: "~10 €", in12: "~1 000 €" } },
        { id: "supply", label: "Abonnements des vendeurs", values: { month: "90 000 €", fresh: "~900 €", in12: "~99 000 €" } },
      ],
    });
    expect(swapped.indexOf("Commissions")).toBeLessThan(swapped.indexOf("Abonnements"));
  });

  it("is a real table: a column header per column, a row header per row, the total in the foot", () => {
    const markup = ledger();
    expect(markup.match(/<th scope="col"/g)).toHaveLength(COLUMNS.length);
    expect(markup.match(/<th scope="row"/g)).toHaveLength(3);
    expect(markup).toMatch(/<tfoot><tr[^>]*data-stream="total"><th scope="row"/);
    // Under the header row's empty corner, one cell per column: figures are `<td>`, names are `<th scope="row">`.
    expect(markup.match(/<td/g)).toHaveLength(1 + 3 * COLUMNS.length);
  });

  it("puts each figure in its row and its column, as given, and says where a stream is read on its own", () => {
    const markup = ledger();
    expect(words(markup)).toEqual([
      "Deux flux, un total",
      "Ce mois-ci",
      "Nouveau chaque mois",
      "Dans 12 mois au rythme actuel",
      "Commissions (revenu net)",
      "les acheteurs, slides 2 à 5",
      "32 853,60 €",
      "~1 400 €",
      "~34 000 €",
      "Abonnements des vendeurs",
      "les vendeurs, slides 6 à 9",
      "26 100 €",
      "~1 700 €",
      "~36 000 €",
      "Total par mois",
      "58 953,60 €",
      "~3 100 €",
      "~70 000 €",
      "Une somme, jamais une comparaison : chaque flux se lit sur les slides de son côté, contre ses propres cibles.",
    ]);
  });

  it("draws a fourth column when it is given one, and only then", () => {
    const withMoved = html(
      createElement(SlideStreams, {
        ...props(),
        columns: [...COLUMNS, { key: "in12Moved", label: "Dans 12 mois, avec nos « Et si »" }],
        streams: [
          { id: "demand", label: "Commissions (revenu net)", values: { month: "a", fresh: "b", in12: "c", in12Moved: "~46 000 €" } },
          { id: "supply", label: "Abonnements des vendeurs", values: { month: "d", fresh: "e", in12: "f", in12Moved: "~42 000 €" } },
        ],
        total: { label: "Total par mois", values: { month: "g", fresh: "h", in12: "i", in12Moved: "~88 000 €" } },
      }),
    );
    expect(withMoved.match(/<th scope="col"/g)).toHaveLength(4);
    expect(withMoved).toContain("~88 000 €");
    expect(ledger().match(/<th scope="col"/g)).toHaveLength(3);
  });

  it("leaves out what it is not given: no caption, no note, no « where it is read »", () => {
    const markup = ledger({ caption: undefined, note: undefined, streams: props().streams.map((s) => ({ ...s, side: undefined })) as unknown as SlideStreamsProps["streams"] });
    expect(markup).not.toMatch(/<caption|<figcaption/);
    expect(words(markup)).not.toContain("les acheteurs, slides 2 à 5");
  });

  it("writes no word, no mark, no ranking of its own: no bar, no share, no « + », no « = », no glyph a sum would borrow", () => {
    const markup = ledger();
    expect(markup).not.toMatch(/<svg|<img|<progress|<meter|role="img"|aria-hidden/);
    expect(words(markup).join(" ")).not.toMatch(/[+=]|\d\s?%|\bpart\b/);
    // Every figure is exactly what it was given: the component adds and computes nothing.
    const given = new Set(["32 853,60 €", "~1 400 €", "~34 000 €", "26 100 €", "~1 700 €", "~36 000 €", "58 953,60 €", "~3 100 €", "~70 000 €", "les acheteurs, slides 2 à 5", "les vendeurs, slides 6 à 9", "Dans 12 mois au rythme actuel"]);
    expect(words(markup).filter((w) => /\d/.test(w)).every((w) => given.has(w))).toBe(true);
  });

  it("sets the total under its own rule, heavier, and every other figure in one face", () => {
    // The total's cells take the ledger's rule (`--market-ledger-rule`), its figures the extra-large step; no other row does.
    expect(css).toMatch(/\.total \.name,\s*\.total \.value \{[^}]*border-top: var\(--market-ledger-rule\)/);
    expect(css).toMatch(/\.total \.value \{[^}]*font: var\(--slide-label-xl\)/);
    expect(css).toMatch(/\.value \{[^}]*font: var\(--slide-label\)/);
    expect(css).not.toMatch(/--market-ledger-rule[\s\S]*--market-ledger-rule/);
    // A ledger ranks nothing: no bar, no fill, no share of the total in its sheet.
    expect(css).not.toMatch(/background(-color)?:|linear-gradient|--viz-|alert|paint-red|highlight/);
  });

  it("reads its tokens: the name column's width and the total's rule are the marketplace's, in the sheet and nowhere else", () => {
    expect(css).toMatch(/\.corner \{[^}]*width: var\(--market-ledger-name\)/);
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|\brgb\(|\bhsl\(/i);
  });
});
