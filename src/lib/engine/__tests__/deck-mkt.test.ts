import { describe, expect, it } from "vitest";
import { buildDeck, deckMarkdown, renderTitle } from "../deck";
import { deriveEngine } from "../derive";
import { EXAMPLE_MKT_WHATIF } from "../example";
import { mktFunnelTitle, mktTotalTitle } from "../mkt-titles";
import { marketplaceStrings, type EngineStrings } from "../strings";
import type { DeckModel, DeckSlide, EngineState, MktSide } from "../types";
import { marketplaceNoSubscriptionsState, marketplaceState, measured, ratio, withEntry, withMonthBefore, withTarget } from "./fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "./props";

/**
 * A marketplace's deck (engine spec §22.12 MKT-8, C103; the slides of `design/ds-extension-10-return/`), on the example of §22.10:
 * its order — the total, the buyers' slides, the sellers', then the slides every type shares, never interleaved —, the side each
 * slide wears, the total as a ledger and the slides it cites, the leaks' amounts (~470, ~350, ~580 and ~130 €, C97), the sellers
 * who pay nothing (no total, a supply with its funnel), the unit economics without any reference (C73), and the independence of
 * the two sides (D2). The words themselves are `engine-copy*.test.ts`'s and the sweep's of `sentences-guard.test.ts`.
 *
 * Non-vacuity, measured at the end of MKT-8 (2026-10-28; each sabotage applied alone to the source, this file run, the source
 * restored; the count is the tests that fall): the order of the two sides swapped 3; the supply's slides tagged with the
 * demand's side 4; the total always present (even without the subscriptions) 2; the total's sides' slide numbers read before
 * the deck is numbered 3; the `One` form never picked 1; the supply's leak kept while it waits for its targets 1; the aside's
 * amount read from the chain instead of the ranking (« ~150 € » for a paid churn worth 130,50 €) 2; the dotted reference left on
 * the payback chart 2; the paid seller's cost tile noted with a variant instead of its computation 1; the side words ignored in
 * the Markdown's titles 1; a side's slide read with the neutral words 2; the demand's slides changing with a supply number 1.
 */

type Locale = "fr" | "en";
type Offering = "products" | "services";

function inputOf(state: EngineState, locale: Locale = "fr", offering: Offering = state.setup.offering ?? "products") {
  const p = locale === "fr" ? FR : EN;
  const ctx = locale === "fr" ? CTX_FR : CTX_EN;
  const forSide = (side: MktSide | null): EngineStrings => marketplaceStrings(p.strings, p.typeStrings.marketplace, offering, side);
  const catalog = p.typeCatalogs[offering === "services" ? "marketplace-services" : "marketplace"];
  const strings = forSide(null);
  const derived = deriveEngine(state, ctx, null, p.bridges, strings.units);
  return { state, derived, ctx, strings, forSide, metrics: catalog.metrics, derivedCopy: catalog.derived, bridges: p.bridges };
}

function deckOf(state: EngineState, locale: Locale = "fr", offering: Offering = state.setup.offering ?? "products"): DeckModel {
  const i = inputOf(state, locale, offering);
  return buildDeck(i.state, i.derived, i.strings, i.metrics, i.ctx, { derived: i.derivedCopy, bridges: i.bridges, stringsForSide: i.forSide });
}

const withWhatIfs = (state: EngineState = marketplaceState()): EngineState => ({ ...state, whatIf: { ...EXAMPLE_MKT_WHATIF } });
const asServices = (state: EngineState): EngineState => ({ ...state, setup: { ...state.setup, offering: "services" } });
const shown = (deck: DeckModel) => deck.slides.filter((s) => s.present);
const idsOf = (deck: DeckModel) => shown(deck).map((s) => s.id);
const slideOf = (deck: DeckModel, id: string): DeckSlide => {
  const slide = deck.slides.find((s) => s.id === id);
  if (!slide) throw new Error(`no slide ${id}`);
  return slide;
};
const rowsOf = (slide: DeckSlide, row: string) => slide.lines.filter((l) => l.row === row);
const nb = (text: string): string =>
  text
    .replace(/ ([:;!?»€%])/g, "\u00a0$1")
    .replace(/« /g, "«\u00a0")
    .replace(/(\d) (?=\d{3}\b)/g, "$1\u00a0")
    .replace(/(\d) (mois|jours|fois)\b/g, "$1\u00a0$2");
const text = (slide: DeckSlide) => [...slide.lines.flatMap((l) => Object.values(l)), ...slide.notes].join("\n");

describe("the order of a marketplace's deck (C103)", () => {
  it("with the subscriptions: the total, the buyers' four slides, the sellers' four, then the slides every type shares", () => {
    const ids = idsOf(deckOf(marketplaceState()));
    expect(ids.slice(0, 7)).toEqual(["mktTotal", "mktFunnelDemand", "mktLeakDemand", "mktUnitDemand", "mktFunnelSupply", "mktLeakSupply", "mktUnitSupply"]);
    // The numbers and sources, then the appendix: the shared slides, as every type has them.
    expect(ids.slice(7)).toEqual(["visibility", "annex", "annex:2", "annex:3"]);
  });

  it("with its « Et si » moved: each side's own slides, one per lever it moved and, from two, all of them together — before its unit economics", () => {
    const ids = idsOf(deckOf(withWhatIfs()));
    expect(ids.slice(0, 12)).toEqual([
      "mktTotal",
      "mktFunnelDemand",
      "mktLeakDemand",
      "whatif:mkt.buy.first-order",
      "whatif:mkt.liq.fill-rate",
      "whatif:mkt.rev.take-rate",
      "mktScenarioDemand",
      "mktUnitDemand",
      "mktFunnelSupply",
      "mktLeakSupply",
      // One lever moved on the supply: its own slide, and « together » would repeat it.
      "whatif:mkt.sell.paid-conversion",
      "mktUnitSupply",
    ]);
  });

  it("never interleaves the two sides: the slides of a side stay contiguous, whatever a person unticks", () => {
    for (const include of [{}, { mktLeakDemand: false }, { mktFunnelSupply: false, mktUnitDemand: false }, { mktFunnelDemand: false, mktFunnelSupply: false }] as const) {
      const state = withWhatIfs();
      state.deck.include = { ...include };
      const sides = shown(deckOf(state))
        .filter((s) => s.included)
        .map((s) => (s.side === "demand" ? "d" : s.side === "supply" ? "s" : "-"))
        .join("");
      // The total (if any), the buyers', the sellers', then the slides without a side: never an `s` before a `d`.
      expect(sides).toMatch(/^-?d*s*-*$/);
    }
  });

  it("the slides' sides are contiguous runs: the buyers' then the sellers'", () => {
    const sides = shown(deckOf(withWhatIfs()))
      .map((s) => (s.side === "demand" ? "d" : s.side === "supply" ? "s" : "-"))
      .join("");
    expect(sides).toMatch(/^-d+s+-+$/);
  });

  it("without the subscriptions: no total, and the sellers have their funnel alone (no leak while they lack targets, no money to say)", () => {
    const deck = deckOf(marketplaceNoSubscriptionsState());
    expect(deck.slides.some((s) => s.id === "mktTotal")).toBe(false);
    expect(idsOf(deck).slice(0, 4)).toEqual(["mktFunnelDemand", "mktLeakDemand", "mktUnitDemand", "mktFunnelSupply"]);
    expect(slideOf(deck, "mktLeakSupply").present).toBe(false);
    expect(slideOf(deck, "mktUnitSupply").present).toBe(false);
    // The sellers who pay nothing have no « Et si »: no money, no lever.
    const moved = deckOf(withWhatIfs(marketplaceNoSubscriptionsState()));
    expect(idsOf(moved).filter((id) => String(id).includes("sell") || id === "mktScenarioSupply")).toEqual([]);
  });

  it("the sellers' leak comes back once they have enough targets, subscriptions or not", () => {
    const state = withTarget(marketplaceNoSubscriptionsState(), "mkt.sell.churn", 2);
    const deck = deckOf(state);
    const leak = slideOf(deck, "mktLeakSupply");
    expect(leak.present).toBe(true);
    expect(leak.title.key).not.toBe("leakNotEnoughBelow");
  });

  it("« Ce qui a bougé » follows the sellers' slides, unticked, and says each side's leak once", () => {
    const state = withMonthBefore(marketplaceState(), (july) => void (july.metrics["mkt.buy.first-order"] = measured(ratio(580, 2_900), { kind: "tool", tool: "product-db" })));
    const deck = deckOf(state);
    const order = deck.slides.map((s) => s.id);
    const at = order.indexOf("evolution");
    expect(at).toBeGreaterThan(order.indexOf("mktUnitSupply"));
    expect(at).toBeLessThan(order.indexOf("visibility"));
    const evolution = slideOf(deck, "evolution");
    expect(evolution.included).toBe(false);
    expect(evolution.side).toBeUndefined();
    expect(evolution.motion).toBeUndefined();
    // Both sides' leaks are named in its title, each with its own diagnosis (the demand's, then the supply's).
    expect(renderTitle(evolution.title, inputOf(state).strings)).toMatch(/fuite.*fuite/s);
  });
});

describe("each slide of a side wears its side, and the others none", () => {
  const deck = deckOf(withWhatIfs());

  it("has `side` and `motion: mkt` on every slide about a side, and neither on the total or on the common slides", () => {
    for (const slide of deck.slides) {
      const own = slide.id !== "mktTotal" && /^(mkt(Funnel|Leak|Scenario|Unit)|whatif:mkt\.)/.test(String(slide.id));
      if (own) {
        expect(slide.side, String(slide.id)).toBe(String(slide.id).includes("Supply") || String(slide.id).includes("mkt.sell.") ? "supply" : "demand");
        expect(slide.motion, String(slide.id)).toBe("mkt");
      } else {
        expect(slide.side, String(slide.id)).toBeUndefined();
        expect(slide.motion, String(slide.id)).toBeUndefined();
      }
    }
  });

  it("no slide without a side prints the figures of one side alone, but the total's", () => {
    // The common slides speak of the numbers of the engine, never of a side's money; the total sums both.
    for (const id of ["visibility", "annex"] as const) {
      const slide = slideOf(deck, id);
      expect(slide.lines.some((l) => l.row === "streams" || l.row === "sideFunnel" || l.row === "calc" || l.row === "aside")).toBe(false);
    }
    expect(rowsOf(slideOf(deck, "mktTotal"), "streams")).toHaveLength(3);
  });
});

describe("the total: a ledger of two streams (C103)", () => {
  it("the example, in the order of the sum: the commissions, the subscriptions, the total — this month, new, in 12 months", () => {
    const rows = rowsOf(slideOf(deckOf(marketplaceState()), "mktTotal"), "streams");
    const cells = rows.map((r) => [r.id, r.month, r.fresh, r.in12, r.in12Moved]);
    expect(cells).toEqual([
      ["demand", nb("32 853,60 €"), nb("~1 400 €"), nb("~34 000 €"), ""],
      ["supply", nb("26 100 €"), nb("~1 700 €"), nb("~36 000 €"), ""],
      ["total", nb("58 953,60 €"), nb("~3 100 €"), nb("~70 000 €"), ""],
    ]);
  });

  it("once a « Et si » moved on either side: the fourth column, the two sides' what-ifs added (~46 000 + ~42 000 = ~88 000 €)", () => {
    const rows = rowsOf(slideOf(deckOf(withWhatIfs()), "mktTotal"), "streams");
    expect(rows.map((r) => r.in12Moved)).toEqual([nb("~46 000 €"), nb("~42 000 €"), nb("~88 000 €")]);
    // A single side's what-if is enough: the column is the total's, and the other side keeps today's pace.
    const supplyOnly = deckOf({ ...marketplaceState(), whatIf: { "mkt.sell.paid-conversion": 20 } });
    expect(rowsOf(slideOf(supplyOnly, "mktTotal"), "streams").map((r) => r.in12Moved)).toEqual([nb("~34 000 €"), nb("~42 000 €"), nb("~76 000 €")]);
  });

  it("says where each stream is read on its own, from the deck as it is numbered: « slides 2 à 4 », « slides 5 à 7 »", () => {
    const rows = rowsOf(slideOf(deckOf(marketplaceState()), "mktTotal"), "streams");
    expect(rows.map((r) => r.side)).toEqual(["les acheteurs, slides 2 à 4", "les vendeurs, slides 5 à 7", ""]);
    const moved = rowsOf(slideOf(deckOf(withWhatIfs()), "mktTotal"), "streams");
    expect(moved.map((r) => r.side)).toEqual(["les acheteurs, slides 2 à 8", "les vendeurs, slides 9 à 12", ""]);
  });

  it("follows what a person unticks: a slide left out is no number, and a side with one slide says « slide 5 »", () => {
    const state = marketplaceState();
    state.deck.include = { mktLeakDemand: false, mktLeakSupply: false, mktUnitSupply: false };
    const rows = rowsOf(slideOf(deckOf(state), "mktTotal"), "streams");
    expect(rows.map((r) => r.side)).toEqual(["les acheteurs, slides 2 à 3", "les vendeurs, slide 4", ""]);
  });

  it("in English, and in « services » (the sellers are providers)", () => {
    expect(rowsOf(slideOf(deckOf(marketplaceState(), "en"), "mktTotal"), "streams").map((r) => r.side)).toEqual(["the buyers, slides 2–4", "the sellers, slides 5–7", ""]);
    expect(rowsOf(slideOf(deckOf(asServices(marketplaceState())), "mktTotal"), "streams").map((r) => r.side)).toEqual(["les clients, slides 2 à 4", "les prestataires, slides 5 à 7", ""]);
  });

  it("is the deck's first title, the board band's own sentence (`mktTotalTitle`), and carries the ledger's note and its footer", () => {
    const i = inputOf(marketplaceState());
    const slide = slideOf(deckOf(marketplaceState()), "mktTotal");
    expect(slide.title).toEqual(mktTotalTitle(i.derived, i.state, i.strings, i.ctx));
    expect(rowsOf(slide, "streams")[2]!.note).toBe(i.strings.mkt.total.note);
    expect(rowsOf(slide, "streams").slice(0, 2).map((r) => r.note)).toEqual(["", ""]);
    expect(rowsOf(slide, "footer")[0]!.text).toContain("Revenu net et MRR des abonnements à fin août 2026");
  });

  it("is a sum, never a comparison: no share, no ratio, no cash, no other figure than the three columns'", () => {
    const slide = slideOf(deckOf(withWhatIfs()), "mktTotal");
    expect(slide.lines.map((l) => l.row)).toEqual(["streams", "streams", "streams", "footer"]);
    expect(text(slide)).not.toMatch(/%|Trésorerie|payback/);
    expect(slide.curve).toBeUndefined();
  });
});

describe("a side's funnel", () => {
  it("is titled by the board's own verdict, in the side's words", () => {
    for (const side of ["demand", "supply"] as const) {
      const state = marketplaceState();
      const i = inputOf(state);
      const motion = i.derived.motions.find((m) => m.motion === "mkt")!;
      if (motion.motion !== "mkt") throw new Error("mkt");
      const slide = slideOf(deckOf(state), side === "demand" ? "mktFunnelDemand" : "mktFunnelSupply");
      expect(slide.title).toEqual(mktFunnelTitle(motion.funnel[side], side, state, i.forSide(side), i.ctx));
    }
    const deck = deckOf(marketplaceState());
    expect(renderTitle(slideOf(deck, "mktFunnelDemand").title, inputOf(marketplaceState()).forSide("demand"))).toBe(nb("Sur 100 inscrits côté acheteurs, 20 passent une première commande et **5 en passent une deuxième**."));
    expect(renderTitle(slideOf(deck, "mktFunnelSupply").title, inputOf(marketplaceState()).forSide("supply"))).toBe(nb("Sur 100 vendeurs inscrits, 30 font une première vente et **15 s'abonnent**."));
  });

  it("writes the funnel as the export says it: the upstream line, one row per stage on the same 100, and what the funnel adds", () => {
    const demand = slideOf(deckOf(marketplaceState()), "mktFunnelDemand");
    expect(rowsOf(demand, "upstream")[0]!.text).toBe(nb("~2 000 visiteurs du mois pour 100 inscrits · GA4 · août 2026"));
    expect(rowsOf(demand, "column").map((r) => [r.id, r.value, r.label])).toEqual([
      ["mkt.buy.first-order", "20", nb("Première commande sous 30 jours")],
      ["mkt.buy.repeat", "5", nb("Deuxième commande sous 90 jours")],
    ]);
    // The liquidity is its own base of 100 searches, never a third column of the sign-ups.
    expect(rowsOf(demand, "sideFunnel").map((r) => [r.id, r.value, r.label])).toEqual([["mkt.liq.fill-rate", "9", nb("Liquidité · sur 100 recherches")]]);
    const supply = slideOf(deckOf(marketplaceState()), "mktFunnelSupply");
    expect(rowsOf(supply, "column").map((r) => [r.id, r.value])).toEqual([
      ["mkt.sell.first-sale", "30"],
      ["mkt.sell.paid-conversion", "15"],
    ]);
    // Two monthly RATES, never columns: the sellers' and the paid sellers' churn.
    expect(rowsOf(supply, "sideFunnel").map((r) => [r.id, r.value, r.text])).toEqual([
      ["mkt.sell.churn", nb("3 %"), nb("3 %")],
      ["mkt.sell.paid-churn", nb("3 %"), nb("3 % · cible 2,5 %")],
    ]);
  });

  it("without the subscriptions the sellers' funnel has one column, no upstream line, and points to the fill rate (never a zero)", () => {
    const supply = slideOf(deckOf(marketplaceNoSubscriptionsState()), "mktFunnelSupply");
    expect(rowsOf(supply, "column").map((r) => r.id)).toEqual(["mkt.sell.first-sale"]);
    expect(rowsOf(supply, "upstream")).toEqual([]);
    const aside = rowsOf(supply, "sideFunnel").find((r) => r.id === "aside")!;
    expect(aside.text).toBe(nb("Leur travail se lit dans le taux de service, côté demande : 9 % des recherches aboutissent à une commande."));
    expect(rowsOf(supply, "sideFunnel").map((r) => r.id)).toEqual(["mkt.sell.churn", "aside"]);
  });

  it("each side's slides cite the sign-ups of their side, in their own words", () => {
    const deck = deckOf(marketplaceState());
    expect(rowsOf(slideOf(deck, "mktFunnelDemand"), "footer")[0]!.text).toMatch(/^Inscrits en mai 2026/);
    expect(rowsOf(slideOf(deck, "mktFunnelSupply"), "footer")[0]!.text).toMatch(/^Vendeurs inscrits en mai 2026/);
    expect(rowsOf(slideOf(deck, "mktUnitSupply"), "footer")[0]!.text).toMatch(/^Vendeurs inscrits en mai 2026/);
    const services = deckOf(asServices(marketplaceState()));
    expect(rowsOf(slideOf(services, "mktFunnelSupply"), "footer")[0]!.text).toMatch(/^Prestataires inscrits en mai 2026/);
  });
});

describe("a side's leak (C97, C102)", () => {
  it("names the stage by the engine's rule and prints its amount with two significant digits and « ~ »: ~470 € of net revenue, ~580 € of subscription MRR", () => {
    const deck = deckOf(marketplaceState());
    const i = inputOf(marketplaceState());
    const demand = slideOf(deck, "mktLeakDemand");
    const supply = slideOf(deck, "mktLeakSupply");
    expect(renderTitle(demand.title, i.forSide("demand"))).toBe(nb("Ramener le taux de service à 12 % (cible de l'équipe) vaudrait **~470 € de revenu net nouveau** chaque mois."));
    expect(renderTitle(supply.title, i.forSide("supply"))).toBe(nb("Ramener la conversion en vendeur abonné à 20 % (cible de l'équipe) vaudrait **~580 € de nouveau MRR des abonnements** chaque mois."));
    // « À côté »: the other stages under their target, at the amount the ranking priced (C97: ~350 and ~130 €, not the chain's ~150).
    const aside = (slide: DeckSlide, id: string) => rowsOf(slide, "aside").find((r) => r.id === id)!;
    expect(aside(demand, "mkt.buy.first-order").text).toBe(nb("sous la cible · ~350 € de revenu net nouveau par mois"));
    expect(aside(supply, "mkt.sell.paid-churn").text).toBe(nb("au-dessus de la cible · ~130 € de MRR des abonnements préservé par mois"));
  });

  it("the chain is the engine's: today, if, then, × what one buyer brings, the year — and the title's amount is the chain's", () => {
    const calc = rowsOf(slideOf(deckOf(marketplaceState()), "mktLeakDemand"), "calc");
    expect(calc.map((r) => r.key)).toEqual(["today", "if", "then", "times", "annual"]);
    expect(calc[2]!.text).toBe("600 × 12/9 = 800 (+200)");
    expect(calc[3]!.text).toBe(nb("2,34 € par acheteur, soit ~470 € de revenu net ajouté chaque mois"));
  });

  it("keeps the one red out of « À côté »: the model still says `below`, the slide draws it in ink (a side's one red is its named stage)", () => {
    const aside = rowsOf(slideOf(deckOf(marketplaceState()), "mktLeakDemand"), "aside");
    expect(aside.find((r) => r.tone === "below")?.id).toBe("mkt.buy.first-order");
  });

  it("a stage the model cannot price (the sellers' first sale) is named without an amount, and says why in the footer", () => {
    // The conversion and the paid churn at their own value, the first sale far under its target: the one stage behind is the one no subscription prices.
    const state = withTarget(withTarget(withTarget(marketplaceState(), "mkt.sell.first-sale", 60), "mkt.sell.paid-conversion", 15), "mkt.sell.paid-churn", 3);
    const leak = slideOf(deckOf(state), "mktLeakSupply");
    expect(leak.title.key).toBe("leakClearUnpriced");
    expect(rowsOf(leak, "footer")[0]!.text).toBe(nb("Sans montant : le moteur ne relie pas ce chiffre au MRR des abonnements"));
  });

  it("in English", () => {
    const i = inputOf(marketplaceState(), "en");
    const supply = slideOf(deckOf(marketplaceState(), "en"), "mktLeakSupply");
    expect(renderTitle(supply.title, i.forSide("supply"))).toBe("Bringing seller subscription conversion to 20% (team target) would be worth **~€580 of new subscription MRR** every month.");
    expect(rowsOf(supply, "aside").find((r) => r.id === "mkt.sell.paid-churn")!.text).toBe("above the target · ~€130 of retained subscription MRR a month");
  });
});

describe("a side's « Et si »", () => {
  const deck = deckOf(withWhatIfs());

  it("one lever alone: its gain on the side's revenue in 12 months, the month's funnel, and the rules that applied", () => {
    const slide = slideOf(deck, "whatif:mkt.liq.fill-rate");
    expect(renderTitle(slide.title, inputOf(marketplaceState()).forSide("demand"))).toBe(nb("Si le taux de service passait à 12 % (aujourd'hui : 9 %), le revenu net dans 12 mois gagnerait **~4 500 €**."));
    expect(rowsOf(slide, "kpi").map((r) => r.id)).toEqual(["mrr12", "newMrr", "cac", "ltv", "ltvCac", "payback", "cash"]);
    expect(rowsOf(slide, "funnelStep").map((r) => r.id)).toEqual(["visitors", "signups", "newUnits"]);
    expect(rowsOf(slide, "funnelStep").find((r) => r.id === "newUnits")).toMatchObject({ label: "Nouveaux acheteurs", today: "600", projected: "800" });
    // The fill rate counts for the new buyers only (C68): the rule is printed with the slide.
    expect(rowsOf(slide, "footer")[0]!.text).toContain("ne compte que pour les nouveaux acheteurs");
    expect(slide.curve?.step).toBeUndefined();
  });

  it("all the levers of a side together, with what each brings alone and the compounding — and nothing of the other side", () => {
    const slide = slideOf(deck, "mktScenarioDemand");
    expect(renderTitle(slide.title, inputOf(marketplaceState()).forSide("demand"))).toBe(nb("Avec les 3 « Et si » ensemble, le revenu net dans 12 mois gagnerait **~13 000 €**."));
    expect(rowsOf(slide, "lever").map((r) => r.id)).toEqual(["mkt.buy.first-order", "mkt.liq.fill-rate", "mkt.rev.take-rate"]);
    expect(slide.leverSum?.rows).toHaveLength(3);
    expect(rowsOf(slide, "together")).toHaveLength(1);
    expect(text(slide)).not.toMatch(/abonn|vendeur/i);
  });

  it("the sellers' what-if is the subscription's: the revenue in its words, a paid seller's cost computed, no other side's lever", () => {
    const slide = slideOf(deck, "whatif:mkt.sell.paid-conversion");
    expect(renderTitle(slide.title, inputOf(marketplaceState()).forSide("supply"))).toBe(nb("Si la conversion en vendeur abonné passait à 20 % (aujourd'hui : 15 %), le MRR des abonnements dans 12 mois gagnerait **~5 900 €**."));
    expect(rowsOf(slide, "kpi").find((r) => r.id === "cac")).toMatchObject({ label: "Coût d'un vendeur abonné", today: nb("200 €") });
    expect(rowsOf(slide, "funnelStep").find((r) => r.id === "newUnits")).toMatchObject({ label: "Nouveaux vendeurs abonnés", today: "60", projected: "80" });
  });

  it("a money lever re-prices the whole base at month 1: the curve carries the ring and its sentence (the commission to 13 % is ~2 600 €)", () => {
    const commission = slideOf(deck, "whatif:mkt.rev.take-rate").curve!;
    expect(commission.step).toBe(true);
    expect(commission.note).toBe(nb("Mois 1 : la commission passe à 13 % dès le mois prochain — ~2 600 € de revenu net en plus par mois sur les seuls acheteurs d'aujourd'hui."));
    // Together, the money lever is still the one the sentence names; the funnel levers add nothing to it.
    expect(slideOf(deck, "mktScenarioDemand").curve!.note).toBe(commission.note);
    // A lever that moves the funnel only (the fill rate) has no jump.
    expect(slideOf(deck, "whatif:mkt.liq.fill-rate").curve!.step).toBeUndefined();
    // The supply's price lever says it in the subscription's words.
    const price = deckOf({ ...marketplaceState(), whatIf: { "mkt.sell.arpa": 35 } });
    expect(slideOf(price, "whatif:mkt.sell.arpa").curve!.note).toBe(nb("Mois 1 : le prix de l'abonnement passe à 35 € dès le mois prochain — ~5 200 € de MRR des abonnements en plus par mois sur les seuls vendeurs abonnés d'aujourd'hui."));
  });

  it("a lever that prints the same value moves nothing a reader can see: no slide", () => {
    const state = { ...marketplaceState(), whatIf: { "mkt.liq.fill-rate": 9 } };
    expect(idsOf(deckOf(state)).filter((id) => String(id).startsWith("whatif:"))).toEqual([]);
  });
});

describe("a side's unit economics (C73, D7, D8)", () => {
  const deck = deckOf(marketplaceState());

  it("one buyer on the commissions' margin: its cost with its variant, the LTV's margin said as a range, the picture without a reference", () => {
    const slide = slideOf(deck, "mktUnitDemand");
    expect(renderTitle(slide.title, inputOf(marketplaceState()).forSide("demand"))).toBe(nb("Un acheteur rembourse son coût d'acquisition en **20 à 23 mois** et rapporte **1,1 à 1,3 fois** ce qu'il coûte."));
    expect(rowsOf(slide, "cac")[0]).toMatchObject({ label: "CAC acheteur", value: nb("30 €"), variant: "Média seul" });
    expect(rowsOf(slide, "ltv")[0]!.note).toBe(nb("marge estimée à 55 à 65 %"));
    expect(slide.paybackChart?.reference).toBeNull();
    expect(slide.paybackChart?.labels.reference).toBe("");
    // No benchmark anywhere on a marketplace's slide: the LTV:CAC is a bare ratio.
    expect(rowsOf(slide, "ltvCac")[0]!.note).toBe("");
    expect(text(slide)).not.toMatch(/repère|couramment|3 pour 1/);
  });

  it("one paid seller on the subscriptions' margin: a cost that is computed, never called a CAC, and a margin of its own", () => {
    const slide = slideOf(deck, "mktUnitSupply");
    const cost = rowsOf(slide, "cac")[0]!;
    expect(cost).toMatchObject({ label: "Coût d'un vendeur abonné", value: nb("200 €"), variant: nb("calculé : 100 € × 30 % ÷ 15 %") });
    expect(`${cost.label} ${cost.variant}`).not.toMatch(/CAC/);
    // The margin is 85 %, exact: no « marge estimée ».
    expect(rowsOf(slide, "ltv")[0]!.note).toBe("");
    expect(rowsOf(slide, "assume")[0]!.text).toContain("jamais celle des commissions");
    expect(slide.paybackChart?.reference).toBeNull();
  });

  it("the sellers who pay nothing have no unit economics to say, and no slide", () => {
    expect(slideOf(deckOf(marketplaceNoSubscriptionsState()), "mktUnitSupply").present).toBe(false);
  });

  it("a certain loss titles the slide in money (C48), on the side that loses", () => {
    const state = withEntry(marketplaceState(), "mkt.buy.cac", measured(ratio(60_000, 600), { kind: "tool", tool: "google-ads" }, { variant: "media-only" }));
    const slide = slideOf(deckOf(state), "mktUnitDemand");
    expect(slide.title.key).toBe("unitEconomicsLoss");
    expect(slideOf(deckOf(state), "mktUnitSupply").title.key).not.toBe("unitEconomicsLoss");
  });
});

describe("the two sides never see each other (D2, D14)", () => {
  const same = (a: DeckSlide, b: DeckSlide) => expect({ title: a.title, lines: a.lines, notes: a.notes, curve: a.curve }).toEqual({ title: b.title, lines: b.lines, notes: b.notes, curve: b.curve });
  const demandIds = (deck: DeckModel) => deck.slides.filter((s) => s.side === "demand").map((s) => s.id);
  const supplyIds = (deck: DeckModel) => deck.slides.filter((s) => s.side === "supply").map((s) => s.id);

  it("changing a seller number changes none of the buyers' slides — only the sellers' and the total", () => {
    const base = deckOf(withWhatIfs());
    const moved = deckOf(withEntry(withWhatIfs(), "mkt.sell.paid-conversion", measured(ratio(48, 240), { kind: "tool", tool: "stripe" })));
    expect(demandIds(moved)).toEqual(demandIds(base));
    for (const id of demandIds(base)) same(slideOf(base, String(id)), slideOf(moved, String(id)));
    expect(slideOf(base, "mktTotal").lines).not.toEqual(slideOf(moved, "mktTotal").lines);
  });

  it("and the other way round: a buyer number changes none of the sellers' slides", () => {
    const base = deckOf(withWhatIfs());
    const moved = deckOf(withEntry(withWhatIfs(), "mkt.buy.churn", measured(ratio(500, 14_000), { kind: "tool", tool: "product-db" })));
    expect(supplyIds(moved)).toEqual(supplyIds(base));
    for (const id of supplyIds(base)) same(slideOf(base, String(id)), slideOf(moved, String(id)));
  });

  it("no slide of a side names the other side's words, and no text sets them against each other", () => {
    const deck = deckOf(withWhatIfs());
    for (const slide of deck.slides.filter((s) => s.present && s.side === "demand")) expect(text(slide), String(slide.id)).not.toMatch(/vendeur|abonn/i);
    // The one sentence that names the other stream says what the margin is NOT (« jamais celle des commissions », §22.8.5 c).
    for (const slide of deck.slides.filter((s) => s.present && s.side === "supply")) expect(text(slide).replace("jamais celle des commissions", ""), String(slide.id)).not.toMatch(/acheteur|commission|revenu net/i);
  });
});

describe("the vocabulary of « services »", () => {
  it("a side's slides say clients, providers, bookings — and not one word of products", () => {
    const state = asServices(withWhatIfs());
    const i = inputOf(state);
    const deck = deckOf(state);
    const banned = /acheteur|vendeur|commande|annonce|panier|\bvente|\bvend\b|achat/i;
    for (const slide of deck.slides.filter((s) => s.present && s.side)) {
      const where = String(slide.id);
      expect(renderTitle(slide.title, i.forSide(slide.side!)), where).not.toMatch(banned);
      expect(text(slide), where).not.toMatch(banned);
    }
    expect(renderTitle(slideOf(deck, "mktFunnelDemand").title, i.forSide("demand"))).toBe(nb("Sur 100 inscrits côté clients, 20 font une première réservation et **5 en font une deuxième**."));
  });
});

describe("the text export", () => {
  it("titles each side's slide with that side's words, as the screen does (`deckMarkdown` with `stringsForSide`)", () => {
    const i = inputOf(marketplaceState());
    const deck = deckOf(marketplaceState());
    const markdown = deckMarkdown(deck, i.strings, i.forSide);
    expect(markdown).toContain(nb("**~580 € de nouveau MRR des abonnements**"));
    expect(markdown).toContain(nb("**~470 € de revenu net nouveau**"));
    // Without the side words every slide would read the neutral set: the SaaS's words on the sellers' leak.
    expect(deckMarkdown(deck, i.strings)).not.toContain(nb("**~580 € de nouveau MRR des abonnements**"));
  });
});

describe("the slides' glyphs (§10.4)", () => {
  /** What the three slide fonts draw: printable Latin-1 plus – — ’ « » … € · × ÷ ± (the sweep's own set); never « → » (SlideText draws arrows) or the minus sign « − ». */
  const GLYPHS = /^[\n -~\u00a0-ÿ–—’…€·×÷±]*$/u;

  it("every word of every slide, in both languages and both vocabularies, is in the fonts' contract: no « → », no « − »", () => {
    for (const [locale, offering] of [["fr", "products"], ["en", "products"], ["fr", "services"], ["en", "services"]] as const) {
      for (const make of [() => withWhatIfs(), marketplaceNoSubscriptionsState]) {
        const base = make();
        const state = offering === "services" ? asServices(base) : base;
        const i = inputOf(state, locale, offering);
        const deck = deckOf(state, locale, offering);
        for (const slide of deck.slides.filter((s) => s.present)) {
          const words = [renderTitle(slide.title, slide.side ? i.forSide(slide.side) : i.strings), ...slide.lines.flatMap((l) => Object.values(l)), ...slide.notes, ...(slide.curve ? [slide.curve.start, slide.curve.summary, slide.curve.note ?? ""] : [])];
          for (const word of words) {
            expect(word, `${locale}/${offering}/${String(slide.id)}`).not.toMatch(/[→←−]/u);
            expect([...word].filter((c) => !GLYPHS.test(c)), `${locale}/${offering}/${String(slide.id)}: ${word.slice(0, 60)}`).toEqual([]);
          }
        }
      }
    }
  });

  it("no template is left unfilled on any slide", () => {
    const i = inputOf(withWhatIfs());
    const deck = deckOf(withWhatIfs());
    for (const slide of deck.slides.filter((s) => s.present)) {
      const words = [renderTitle(slide.title, slide.side ? i.forSide(slide.side) : i.strings), ...slide.lines.flatMap((l) => Object.values(l)), ...slide.notes];
      for (const word of words) expect(word, String(slide.id)).not.toMatch(/\{[a-zA-Z]+\}/);
    }
  });
});
