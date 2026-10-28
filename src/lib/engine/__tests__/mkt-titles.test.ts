import { describe, expect, it } from "vitest";
import { deriveEngine } from "../derive";
import { fillTemplate } from "../format";
import { mktFunnelTitle, mktTotalTitle, streamSum } from "../mkt-titles";
import { marketplaceStrings, type EngineStrings } from "../strings";
import { titleAccent } from "../title-accent";
import type { EngineCalcContext, EngineState, MetricId, MktSide, SlideTitle } from "../types";
import { marketplaceNoSubscriptionsState, marketplaceState, measured, ratio, withEntry } from "./fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "./props";

/**
 * The two sentences a marketplace's board and deck open with (engine spec §22.8.5 e, A23 MKT-7b), on the example of §22.10.1:
 * the total of the two streams, and each side's funnel verdict. These tests pin the WIRING — which key each shape of the
 * funnel picks, what fills each slot, how a count agrees with its verb, which stream a total says is missing; the words
 * themselves are `engine-copy.test.ts`'s (`TITLE_CONTRACT`) and the sweep's of `sentences-guard.test.ts`.
 *
 * Non-vacuity, measured at the end of MKT-7b (2026-10-28; each sabotage applied alone, this file and `engine-copy.test.ts`
 * run, the file restored; the count is the tests that fall): the funnel's `chain` ignored (always the complete form) 6;
 * the second column's clause read under the first's slot 4; `numbered` removed (the plural verb for « 1 ») 1; a total
 * built from the demand alone 3; the missing stream swapped for the other 2; the supply's one-column case read as a
 * complete pair 1; the sum's parts printed one by one instead of rounded to one common unit (`formatSum` bypassed) 3.
 * `sentences-guard.test.ts` alone sees two of them: the chain ignored 2 and the one-column case read as a pair 2.
 */

/** The French typography the copy carries (U+00A0 before « : ; ! ? » € % », after « «, in thousands): the expected sentences are written plainly, as the spec has them. */
const nb = (text: string): string => text.replace(/ ([:;!?»€%])/g, "\u00a0$1").replace(/« /g, "«\u00a0").replace(/(\d) (?=\d{3}\b)/g, "$1\u00a0");

const strings = (locale: "fr" | "en", offering: "products" | "services", side: MktSide | null): EngineStrings => {
  const p = locale === "fr" ? FR : EN;
  return marketplaceStrings(p.strings, p.typeStrings.marketplace, offering, side);
};

function derived(state: EngineState, ctx: EngineCalcContext = CTX_FR) {
  const p = ctx.locale === "fr" ? FR : EN;
  return deriveEngine(state, ctx, null, p.bridges, p.strings.units);
}
function mktOf(state: EngineState, ctx: EngineCalcContext = CTX_FR) {
  const m = derived(state, ctx).motions.find((x) => x.motion === "mkt");
  if (m?.motion !== "mkt") throw new Error("a marketplace derives its motion");
  return m;
}
/** A title as the screen prints it, accent marks left in. */
const rendered = (title: SlideTitle, s: EngineStrings) => fillTemplate(s.slideTitles[title.key], title.values);
const funnelTitle = (state: EngineState, side: MktSide, locale: "fr" | "en" = "fr", offering: "products" | "services" = "products") => {
  const ctx = locale === "fr" ? CTX_FR : CTX_EN;
  const s = strings(locale, offering, side);
  const title = mktFunnelTitle(mktOf(state, ctx).funnel[side], side, state, s, ctx);
  return { title, text: rendered(title, s) };
};
/** The state without some entries, and without the shared counts that would stand in for them (a count is also written in every entry that carries it, `shared-counts.ts`). */
function without(state: EngineState, ids: readonly MetricId[], counts: readonly string[] = []): EngineState {
  let next = state;
  for (const id of ids) next = withEntry(next, id, undefined);
  next = structuredClone(next);
  const snapshot = next.snapshots[next.snapshots.length - 1]!;
  for (const key of counts) delete (snapshot.base as Record<string, number>)[key];
  return next;
}

describe("mktTotalTitle — the two streams, summed (S9)", () => {
  const example = marketplaceState();

  it("the example: 58 953,60 € a month, 32 853,60 € of commissions and 26 100 € of subscriptions — exact, both counts typed", () => {
    const title = mktTotalTitle(derived(example), example, strings("fr", "products", null), CTX_FR);
    expect(title).toEqual({ key: "mktTotal", values: { total: nb("58 953,60 €"), demand: nb("32 853,60 €"), supply: nb("26 100 €") } });
    expect(rendered(title, strings("fr", "products", null))).toBe(nb("La place de marché rapporte **58 953,60 €** par mois : 32 853,60 € de commissions, 26 100 € d'abonnements des vendeurs."));
  });

  it("in English, with the sum read the same way", () => {
    const title = mktTotalTitle(derived(example, CTX_EN), example, strings("en", "products", null), CTX_EN);
    expect(rendered(title, strings("en", "products", null))).toBe("The marketplace brings in **€58,953.60** a month: €32,853.60 in commissions, €26,100 in seller subscriptions.");
  });

  it("in « services », the sellers are providers: « d'abonnements des prestataires »", () => {
    const title = mktTotalTitle(derived(example), example, strings("fr", "services", null), CTX_FR);
    expect(rendered(title, strings("fr", "services", null))).toBe(nb("La place de marché rapporte **58 953,60 €** par mois : 32 853,60 € de commissions, 26 100 € d'abonnements des prestataires."));
  });

  it("the new revenue of the month and the revenue in twelve months are models: « ~1 400 € » and « ~1 700 € », « ~3 100 € » (the band's two sums)", () => {
    const total = mktOf(example).total;
    expect(streamSum(total.newPerMonth, example, CTX_FR, strings("fr", "products", null))).toEqual({ demand: nb("~1 400 €"), supply: nb("~1 700 €"), total: nb("~3 100 €"), exact: false });
    expect(streamSum(total.in12Months, example, CTX_FR, strings("fr", "products", null))).toEqual({ demand: nb("~34 000 €"), supply: nb("~36 000 €"), total: nb("~70 000 €"), exact: false });
  });

  it("the supply not measured: « le MRR des abonnements n'est pas mesuré » — never the commissions passed off as the total", () => {
    const state = without(example, ["mkt.sell.arpa", "mkt.sell.gross-margin"], ["mktSellerMrrEnd"]);
    const title = mktTotalTitle(derived(state), state, strings("fr", "products", null), CTX_FR);
    expect(title).toEqual({ key: "mktTotalUnknown", values: { stream: "le MRR des abonnements" } });
    expect(rendered(title, strings("fr", "products", null))).toBe(nb("**On ne peut pas encore additionner les deux flux** : le MRR des abonnements n'est pas mesuré."));
  });

  it("the demand not measured: « le revenu net des commissions »", () => {
    const state = without(example, ["mkt.rev.take-rate", "mkt.rev.gross-margin"], ["mktNetRevenue"]);
    expect(mktTotalTitle(derived(state), state, strings("fr", "products", null), CTX_FR)).toEqual({ key: "mktTotalUnknown", values: { stream: "le revenu net des commissions" } });
  });

  it("neither stream measured: the title says so", () => {
    const state = without(example, ["mkt.rev.take-rate", "mkt.rev.gross-margin", "mkt.sell.arpa", "mkt.sell.gross-margin"], ["mktNetRevenue", "mktSellerMrrEnd"]);
    const title = mktTotalTitle(derived(state), state, strings("fr", "products", null), CTX_FR);
    expect(title).toEqual({ key: "mktTotalUnknownBoth", values: {} });
    expect(rendered(title, strings("en", "products", null))).toContain("neither is measured");
  });

  it("the sellers paying nothing: one stream is not a sum, there is no total to title", () => {
    const state = marketplaceNoSubscriptionsState();
    expect(() => mktTotalTitle(derived(state), state, strings("fr", "products", null), CTX_FR)).toThrow(/no total/);
    expect(streamSum(mktOf(state).total.now, state, CTX_FR, strings("fr", "products", null))).toBeNull();
  });

  it("the accent: the sum is a figure, in ink; two streams we cannot add up is what we cannot see, in red", () => {
    expect(titleAccent("mktTotal")).toBe("ink");
    expect(titleAccent("mktTotalUnknown")).toBe("red");
    expect(titleAccent("mktTotalUnknownBoth")).toBe("red");
  });
});

describe("mktFunnelTitle — a side's verdict, on its own 100 sign-ups (§22.8.5 e)", () => {
  const example = marketplaceState();

  it("the buyers: « Sur 100 inscrits côté acheteurs, 20 passent une première commande et 5 en passent une deuxième » (the leak is not here: red is the diagnosis's)", () => {
    const { title, text } = funnelTitle(example, "demand");
    expect(title).toEqual({ key: "mktFunnelComplete", values: { first: "20 passent une première commande", repeat: "5 en passent une deuxième" } });
    expect(text).toBe(nb("Sur 100 inscrits côté acheteurs, 20 passent une première commande et **5 en passent une deuxième**."));
  });

  it("the sellers, paying a subscription: 30 make a first sale and 15 subscribe", () => {
    const { title, text } = funnelTitle(example, "supply");
    expect(title).toEqual({ key: "mktSupplyFunnelComplete", values: { first: "30 font une première vente", paid: "15 s'abonnent" } });
    expect(text).toBe(nb("Sur 100 vendeurs inscrits, 30 font une première vente et **15 s'abonnent**."));
  });

  it("the sellers paying nothing have one column: the `One` form, the first sale alone", () => {
    const { title, text } = funnelTitle(marketplaceNoSubscriptionsState(), "supply");
    expect(title).toEqual({ key: "mktSupplyFunnelCompleteOne", values: { first: "30 font une première vente" } });
    expect(text).toBe(nb("Sur 100 vendeurs inscrits, **30 font une première vente**."));
  });

  it("in English, each clause agrees with its own count", () => {
    expect(funnelTitle(example, "demand", "en").text).toBe("Out of 100 buyer sign-ups, 20 place a first order and **5 place a second one**.");
    expect(funnelTitle(example, "supply", "en").text).toBe("Out of 100 seller sign-ups, 30 make a first sale and **15 subscribe**.");
  });

  it("in « services »: clients and providers, bookings — « 20 font une première réservation », « 30 reçoivent une première réservation »", () => {
    expect(funnelTitle(example, "demand", "fr", "services").text).toBe(nb("Sur 100 inscrits côté clients, 20 font une première réservation et **5 en font une deuxième**."));
    expect(funnelTitle(example, "supply", "fr", "services").text).toBe(nb("Sur 100 prestataires inscrits, 30 reçoivent une première réservation et **15 s'abonnent**."));
    expect(funnelTitle(example, "demand", "en", "services").text).toBe("Out of 100 client sign-ups, 20 make a first booking and **5 make a second one**.");
    expect(funnelTitle(example, "supply", "en", "services").text).toBe("Out of 100 provider sign-ups, 30 receive a first booking and **15 subscribe**.");
  });

  it("a count of one takes the singular verb, and fewer than one is said as it is, never 0", () => {
    // 29 of the 2 900 buyers of May place a first order: 1 in 100.
    const one = withEntry(example, "mkt.buy.first-order", measured(ratio(29, 2_900), { kind: "tool", tool: "product-db" }));
    expect(funnelTitle(one, "demand").text).toContain("1 passe une première commande");
    const under = withEntry(example, "mkt.buy.first-order", measured(ratio(10, 2_900), { kind: "tool", tool: "product-db" }));
    const { text } = funnelTitle(under, "demand");
    expect(text).toMatch(/moins de 1/);
    expect(text).not.toMatch(/\b0 passe/);
  });

  describe("what the funnel does not let us see", () => {
    it("a gap: the first order is not measured and the second is — « entre les deux, on ne voit rien »", () => {
      const state = without(example, ["mkt.buy.first-order"], ["mktCohortSignups"]);
      const { title, text } = funnelTitle(state, "demand");
      expect(title).toEqual({ key: "mktFunnelGapOne", values: { clauses: "5 en passent une deuxième", stages: "la première commande" } });
      expect(text).toBe(nb("Sur 100 inscrits côté acheteurs, 5 en passent une deuxième. **Entre les deux, on ne voit rien : la première commande n'est pas mesurée.**"));
    });

    it("a tail break: the second order is not measured — « au-delà, on ne sait pas les suivre »", () => {
      const state = without(example, ["mkt.buy.repeat"]);
      const { title, text } = funnelTitle(state, "demand");
      expect(title).toEqual({ key: "mktFunnelTailBreakOne", values: { clauses: "20 passent une première commande", stages: "la deuxième commande" } });
      expect(text).toContain(nb("**Au-delà, on ne sait pas les suivre : la deuxième commande n'est pas mesurée.**"));
    });

    it("nothing: neither order is measured", () => {
      const state = without(example, ["mkt.buy.first-order", "mkt.buy.repeat"]);
      const { title, text } = funnelTitle(state, "demand");
      expect(title).toEqual({ key: "mktFunnelEmpty", values: {} });
      expect(text).toBe(nb("**On ne sait pas encore suivre 100 inscrits jusqu'à leur première commande.**"));
    });

    it("the sellers: the same three cases with their own stages — the first sale, the conversion to a subscription", () => {
      expect(funnelTitle(without(example, ["mkt.sell.first-sale"]), "supply").title).toEqual({
        key: "mktSupplyFunnelGapOne",
        values: { clauses: "15 s'abonnent", stages: "la première vente" },
      });
      expect(funnelTitle(without(example, ["mkt.sell.paid-conversion"]), "supply").title).toEqual({
        key: "mktSupplyFunnelTailBreakOne",
        values: { clauses: "30 font une première vente", stages: "la conversion en abonné" },
      });
      expect(funnelTitle(without(example, ["mkt.sell.first-sale", "mkt.sell.paid-conversion"]), "supply").text).toBe(
        nb("**On ne sait pas encore suivre 100 vendeurs inscrits jusqu'à leur première vente.**"),
      );
    });

    it("the sellers paying nothing, their first sale not measured: nothing to follow", () => {
      const state = without(marketplaceNoSubscriptionsState(), ["mkt.sell.first-sale"]);
      expect(funnelTitle(state, "supply").title.key).toBe("mktSupplyFunnelEmpty");
    });

    it("in « services », the unmeasured stage is said in the services' words", () => {
      const state = without(example, ["mkt.sell.paid-conversion"]);
      expect(funnelTitle(state, "supply", "fr", "services").text).toBe(
        nb("Sur 100 prestataires inscrits, 30 reçoivent une première réservation. **Au-delà, on ne sait pas les suivre : la conversion en abonné n'est pas mesurée.**"),
      );
      expect(funnelTitle(without(example, ["mkt.buy.repeat"]), "demand", "fr", "services").text).toContain("la deuxième réservation n'est pas mesurée");
    });

    it("red is what we cannot see: the unmeasured cases, never the complete ones", () => {
      for (const key of ["mktFunnelGapOne", "mktFunnelTailBreakOne", "mktFunnelEmpty", "mktSupplyFunnelGapOne", "mktSupplyFunnelTailBreakOne", "mktSupplyFunnelEmpty"] as const) expect(titleAccent(key), key).toBe("red");
      for (const key of ["mktFunnelComplete", "mktSupplyFunnelComplete", "mktSupplyFunnelCompleteOne"] as const) expect(titleAccent(key), key).toBe("ink");
    });
  });

  it("reads one side only: the other side's numbers change nothing of it (D2)", () => {
    const before = funnelTitle(example, "demand").title;
    const other = without(example, ["mkt.sell.first-sale", "mkt.sell.paid-conversion", "mkt.sell.signup-rate"]);
    expect(funnelTitle(other, "demand").title).toEqual(before);
  });
});
