import { describe, expect, it } from "vitest";
import { buildDeck } from "@/lib/engine/deck";
import { deriveEngine } from "@/lib/engine/derive";
import { EXAMPLE_MKT_WHATIF } from "@/lib/engine/example";
import { marketplaceStrings, type EngineStrings } from "@/lib/engine/strings";
import type { DeckModel, DeckSlide, EngineState, LeverId, MktSide } from "@/lib/engine/types";
import { marketplaceNoSubscriptionsState, marketplaceState } from "@/lib/engine/__tests__/fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "@/lib/engine/__tests__/props";
import { mktFunnelView, mktLeverView, type MktViewInput } from "../../mkt-view";

/**
 * A marketplace's deck against the board (A23 MKT-8): the deck is built in `lib/engine`, which cannot import the island, so the
 * funnel's figures and the ring's sentence are written twice — once by `deck-mkt.ts` (the slide's rows, the text export), once by
 * `mkt-view.ts` (the screen, and the slide's drawing through `SlideSideFunnel`). This file is the one place that holds the two to
 * each other, on the example of §22.10 in both languages, with the offering's two vocabularies, and without the sellers'
 * subscriptions: what the slide's rows say is what the board says, to the word.
 *
 * Non-vacuity (2026-10-28, one sabotage at a time on `deck-mkt.ts`, restored after; counts measured, the tests that fall): a funnel
 * column's numeral replaced by a constant, 9 tests; the upstream line's month dropped, 8; a rate's value shifted by five points 4 (a rate
 * *rounded* to one decimal fell on none: the example's 3 % has no decimal — a sabotage that changes nothing is not one); the
 * fill line's sentence swapped between « recherches » and « demandes » 4; the ring's note built with the buyers' wording for the
 * sellers 4; the ring left out of the rows' curve 8.
 */

type Locale = "fr" | "en";
type Offering = "products" | "services";
const SIDES: readonly MktSide[] = ["demand", "supply"];
const CASES: readonly { locale: Locale; offering: Offering }[] = [
  { locale: "fr", offering: "products" },
  { locale: "fr", offering: "services" },
  { locale: "en", offering: "products" },
  { locale: "en", offering: "services" },
];

function inputOf(state: EngineState, locale: Locale, offering: Offering, side: MktSide | null): MktViewInput & { forSide: (s: MktSide | null) => EngineStrings; bridges: typeof FR.bridges } {
  const p = locale === "fr" ? FR : EN;
  const ctx = locale === "fr" ? CTX_FR : CTX_EN;
  const withOffering = { ...state, setup: { ...state.setup, offering } } as EngineState;
  const catalog = p.typeCatalogs[offering === "services" ? "marketplace-services" : "marketplace"];
  const forSide = (s: MktSide | null) => marketplaceStrings(p.strings, p.typeStrings.marketplace, offering, s);
  return {
    state: withOffering,
    derived: deriveEngine(withOffering, ctx, null, p.bridges, forSide(null).units),
    ctx,
    strings: forSide(side),
    metrics: catalog.metrics,
    derivedCopy: catalog.derived,
    forSide,
    bridges: p.bridges,
  };
}

function deckOf(input: ReturnType<typeof inputOf>): DeckModel {
  const neutral = input.forSide(null);
  return buildDeck(input.state, input.derived, neutral, input.metrics, input.ctx, { derived: input.derivedCopy, bridges: input.bridges, stringsForSide: input.forSide });
}

const slideOf = (deck: DeckModel, id: string): DeckSlide => {
  const slide = deck.slides.find((s) => s.id === id);
  if (!slide) throw new Error(`no slide ${id}`);
  return slide;
};
const rowsOf = (slide: DeckSlide, row: string) => slide.lines.filter((l) => l.row === row);
/** A model's text carries its stress marks (`**`) and its lines' segments; the board's props carry plain strings. */
const plain = (text: string | undefined) => (text ?? "").replace(/\*\*/g, "");
const asText = (node: unknown): string => (typeof node === "string" || typeof node === "number" ? String(node) : "");

const withMoreLevers = (): EngineState => ({
  ...marketplaceState(),
  whatIf: { ...EXAMPLE_MKT_WHATIF, "mkt.sell.arpa": 55, "mkt.sell.paid-churn": 2 },
});

describe("a side's funnel slide says what the board's funnel says", () => {
  for (const { locale, offering } of CASES) {
    for (const side of SIDES) {
      it(`${side}, ${locale}, ${offering}: the columns' numerals and labels, the upstream line, the base's and the rates' figures`, () => {
        const input = inputOf(marketplaceState(), locale, offering, side);
        const slide = slideOf(deckOf(input), side === "demand" ? "mktFunnelDemand" : "mktFunnelSupply");
        const view = mktFunnelView(input, side, "slide");

        // The columns after the sign-ups: the same labels and numerals, in the same order.
        const rows = rowsOf(slide, "column");
        const stages = view.columns.slice(1);
        expect(rows.map((r) => r.id)).toEqual(stages.map((c) => c.id));
        expect(rows.map((r) => plain(r.label))).toEqual(stages.map((c) => asText(c.label)));
        expect(rows.map((r) => r.value)).toEqual(stages.map((c) => asText(c.n)));
        // Not vacuous: the stages exist and carry a figure.
        expect(stages.length).toBeGreaterThanOrEqual(side === "demand" ? 2 : 2);
        expect(rows.every((r) => r.value !== "")).toBe(true);

        // The upstream line, whole.
        expect(plain(rowsOf(slide, "upstream")[0]?.text)).toBe(asText(view.upstream));

        if (side === "demand") {
          const base = view.base!;
          const fill = rowsOf(slide, "sideFunnel")[0]!;
          expect(fill.id).toBe("mkt.liq.fill-rate");
          expect(plain(fill.label)).toBe(base.title);
          expect(fill.value).toBe(asText(base.column.n));
          expect(plain(fill.text)).toBe(base.line);
        } else {
          const rates = rowsOf(slide, "sideFunnel").filter((r) => r.id !== "aside");
          expect(rates.map((r) => r.id)).toEqual((view.rates ?? []).map((r) => r.id));
          expect(rates.map((r) => plain(r.label))).toEqual((view.rates ?? []).map((r) => asText(r.label)));
          expect(rates.map((r) => r.value)).toEqual((view.rates ?? []).map((r) => asText(r.value)));
          // The target a rate names is the rate's note, word for word.
          expect(rates.map((r) => plain(r.text))).toEqual((view.rates ?? []).map((r) => [asText(r.value), asText(r.note)].filter(Boolean).join(" · ")));
        }
      });
    }
  }

  it("the sellers who pay nothing: the funnel's aside is the board's, the base's line is not repeated", () => {
    for (const { locale, offering } of CASES) {
      const input = inputOf(marketplaceNoSubscriptionsState(), locale, offering, "supply");
      const slide = slideOf(deckOf(input), "mktFunnelSupply");
      const view = mktFunnelView(input, "supply", "slide");
      expect(asText(view.aside)).not.toBe("");
      expect(plain(rowsOf(slide, "sideFunnel").find((r) => r.id === "aside")?.text)).toBe(asText(view.aside));
    }
  });

  it("the slide's drawing and its rows read one funnel: the same ids and the same figures with the subscriptions off", () => {
    const input = inputOf(marketplaceNoSubscriptionsState(), "fr", "products", "demand");
    const slide = slideOf(deckOf(input), "mktFunnelDemand");
    const view = mktFunnelView(input, "demand", "slide");
    expect(rowsOf(slide, "column").map((r) => r.id)).toEqual(view.columns.slice(1).map((c) => c.id));
    expect(rowsOf(slide, "column").map((r) => r.value)).toEqual(view.columns.slice(1).map((c) => asText(c.n)));
  });
});

describe("a « Et si » slide's ring says what the board's curve says", () => {
  const LEVER_OF_NOTE: readonly { side: MktSide; id: LeverId }[] = [
    { side: "demand", id: "mkt.rev.take-rate" },
    { side: "supply", id: "mkt.sell.arpa" },
  ];
  for (const { locale, offering } of CASES) {
    for (const { side, id } of LEVER_OF_NOTE) {
      it(`${side}'s ${id}, ${locale}, ${offering}: the same sentence, the same ring`, () => {
        const state = withMoreLevers();
        const input = inputOf(state, locale, offering, side);
        const slide = slideOf(deckOf(input), `whatif:${id}`);
        const board = mktLeverView(input, side, { [id]: input.state.whatIf?.[id] as number })?.curve;
        expect(board?.note).toBeTruthy();
        expect(slide.curve?.step).toBe(true);
        expect(slide.curve?.note).toBe(board?.note);
      });
    }
  }

  it("a lever that does not re-price the base draws no ring and says nothing of one: the deck and the board agree on its absence", () => {
    const input = inputOf(marketplaceState(), "fr", "products", "demand");
    const state = { ...input.state, whatIf: { ...EXAMPLE_MKT_WHATIF } } as EngineState;
    const withLevers = { ...input, state, derived: input.derived };
    const slide = slideOf(deckOf(withLevers), "whatif:mkt.buy.first-order");
    const board = mktLeverView(withLevers, "demand", { "mkt.buy.first-order": 25 })?.curve;
    expect(board?.step).toBe(false);
    expect(board?.note).toBeNull();
    expect(slide.curve?.step).toBeFalsy();
    expect(slide.curve?.note).toBeUndefined();
  });
});
