import { describe, expect, it } from "vitest";
import { servicesWordsHeld } from "@/content/__tests__/mkt-words";
import { deriveEngine } from "@/lib/engine/derive";
import { EXAMPLE_MKT_WHATIF } from "@/lib/engine/example";
import { marketplaceStrings } from "@/lib/engine/strings";
import type { EngineCalcContext, EngineState, LeverId, MetricId, MktSide } from "@/lib/engine/types";
import { marketplaceNoSubscriptionsState, marketplaceState, withEntry } from "@/lib/engine/__tests__/fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "@/lib/engine/__tests__/props";
import { mktAsideLines, mktAssumptions, mktFunnelView, mktLeverSum, mktLeverView, mktMoneyView, mktTotalView, mktWhatIfGroups, sideOfMetric, type MktViewInput } from "../mkt-view";
import { candidateValuesOf, listStages, namedStages } from "../number-list";
import { diagnosisOf } from "../BoardNumbers";

/**
 * A marketplace board's view models (engine spec §22.6.2, A23 MKT-7b), on the example of §22.10.1 — the numbers asserted here
 * are the ones of §22.10.2 (the reference script `docs/engine/reference/mkt-example.mjs`), printed the way the screen prints
 * them: two significant digits and « ~ » for a projection, the cent for what was typed. What these tests pin is the WIRING:
 * which side's scenario feeds which figure, what the band sums and what it refuses to, that a part a side does not have
 * says so instead of printing a zero, and that nothing of one side reads the other's. The words themselves are
 * `engine-copy.test.ts`'s and the sweep's of `sentences-guard.test.ts`.
 *
 * Non-vacuity, measured at the end of MKT-7b (2026-10-28; each sabotage applied alone, this file run — `number-list.test.ts`
 * and `board-numbers.test.ts` with it for the list — and the file restored; the count is the tests that fall): the band's
 * two streams in the other order 2; the annualised total without its x 12 2; « moved » read from the buyers' what-ifs only 1;
 * a band without subscriptions 1; the buyers' GMV figure left out 2; the net revenue of the month not first without
 * subscriptions 1; the money of both sides read from the buyers' scenario 2; the net revenue's « ? » left out 1; the curve
 * of both sides read on the buyers 1; the sellers' price no money lever (no jump) 1; the jump without what the churn keeps 1;
 * the liquidity base kept on the sellers 2; the sellers' aside printed with subscriptions 1; the paid churn left out of the
 * sellers' rates 1; the named leak also listed under « À côté » 3; the aside's amount from the chain instead of the ranking's 2;
 * a stage nobody prices dropped for the sellers 1; the compounding read on the buyers 2; the panel's rows read on the buyers 1;
 * the list's candidates of both sides melted 1; a number of the sellers read on the buyers 1; the diagnosis of the side shown
 * ignored 1. **Two sabotages first measured 0**: the sellers' aside with subscriptions (no test asked for its absence) and the
 * list's diagnosis ignored (a test compared `diagnosisOf` to itself); both tests now name the stages (activation, revenue) and
 * the absence.
 */

const NB = " ";
/** The French typography the copy carries (U+00A0 before « : ; ! ? » € % », after « «, in thousands, before « mois » and « jours »): the expected sentences are written plainly. */
const nb = (text: string): string =>
  text
    .replace(/ ([:;!?»€%])/g, `${NB}$1`)
    .replace(/« /g, `«${NB}`)
    .replace(/(\d) (?=\d{3}(?!\d))/g, `$1${NB}`)
    .replace(/(\d) (mois|jours|fois)\b/g, `$1${NB}$2`);

type Offering = "products" | "services";

/** What a screen of the board is handed, for one side's words (`marketplaceStrings(…, side)`) or the neutral set (`null`: the band, the list). */
function inputOf(state: EngineState, side: MktSide | null = null, locale: "fr" | "en" = "fr", offering: Offering = "products"): MktViewInput {
  const p = locale === "fr" ? FR : EN;
  const ctx: EngineCalcContext = locale === "fr" ? CTX_FR : CTX_EN;
  const catalog = p.typeCatalogs[offering === "services" ? "marketplace-services" : "marketplace"];
  const withOffering = { ...state, setup: { ...state.setup, offering } } as EngineState;
  return {
    state: withOffering,
    derived: deriveEngine(withOffering, ctx, null, p.bridges, p.strings.units),
    ctx,
    strings: marketplaceStrings(p.strings, p.typeStrings.marketplace, offering, side),
    metrics: catalog.metrics,
    derivedCopy: catalog.derived,
  };
}
const withWhatIf = (state: EngineState, whatIf: Partial<Record<LeverId, number>>): EngineState => ({ ...state, whatIf });
/** The state without some entries, and without the shared counts that would stand in for them (a count is also written in every entry that carries it). */
function without(state: EngineState, ids: readonly MetricId[], counts: readonly string[] = []): EngineState {
  let next = state;
  for (const id of ids) next = withEntry(next, id, undefined);
  next = structuredClone(next);
  const snapshot = next.snapshots[next.snapshots.length - 1]!;
  for (const key of counts) delete (snapshot.base as Record<string, number>)[key];
  return next;
}

/** The sentences and words a view holds, not its ids (« mkt.buy.first-order » is an identifier, not a word on screen). */
function textsOf(value: unknown): string[] {
  if (typeof value === "string") return /^(mkt|app|engine)[.-][\w.-]+$/.test(value) ? [] : [value];
  if (Array.isArray(value)) return value.flatMap(textsOf);
  if (value && typeof value === "object") return Object.values(value).flatMap(textsOf);
  return [];
}

const example = marketplaceState();
const noSubscriptions = marketplaceNoSubscriptionsState();
const BOTH_SIDES = EXAMPLE_MKT_WHATIF;

describe("the total band — the two streams, summed and never compared (§22.6.2)", () => {
  it("prints the commissions then the subscriptions, their sum, and what adds up: annualised, new each month, in twelve months", () => {
    const band = mktTotalView(inputOf(example))!;
    expect(band.engines.map((e) => e.id)).toEqual(["demand", "supply"]);
    expect(band.engines.map((e) => e.value)).toEqual([nb("32 853,60 €"), nb("26 100 €")]);
    expect(band.engines.some((e) => e.missing)).toBe(false);
    expect(band.total).toMatchObject({ value: nb("58 953,60 €"), missing: false });
    expect(band.totals.map((t) => [t.key, t.value])).toEqual([
      ["arr", nb("707 443,20 €")],
      ["new", nb("~3 100 €")],
      ["in12", nb("~70 000 €")],
    ]);
    expect(band.title).toContain(nb("58 953,60 €"));
    expect(band.line).toBeNull();
  });

  it("carries the cash of no side: nothing of it is in the band (C96)", () => {
    const band = mktTotalView(inputOf(example))!;
    const text = JSON.stringify(band);
    expect(text).not.toContain(nb("18 000"));
    expect(text).not.toContain(nb("12 000"));
    expect(Object.keys(band).sort()).toEqual(["engines", "eyebrow", "line", "title", "total", "totals"]);
  });

  it("joins the what-ifs of both sides in the one place they meet: the twelve months with them, and today's pace said once", () => {
    const band = mktTotalView(inputOf(withWhatIf(example, BOTH_SIDES)))!;
    const in12 = band.totals.find((t) => t.key === "in12")!;
    expect(in12.value).toBe(nb("~88 000 €"));
    expect(in12.label).toBe(inputOf(example).strings.mkt.total.in12Moved);
    expect(band.line).toContain(nb("~70 000 €"));
    // The streams and the month's total are today's, whatever moved.
    expect(band.total.value).toBe(nb("58 953,60 €"));
  });

  it("moves with one side alone: a lever of the sellers moves the band too, the buyers' stay as they are", () => {
    const supplyOnly = mktTotalView(inputOf(withWhatIf(example, { "mkt.sell.paid-conversion": 20 })))!;
    const in12 = supplyOnly.totals.find((t) => t.key === "in12")!;
    // 33 723,61 € of commissions (no lever on that side) + 41 785,48 € of subscriptions = 75 509,09 €.
    expect(in12.value).toBe(nb("~76 000 €"));
    expect(supplyOnly.line).not.toBeNull();
  });

  it("has no band when the sellers pay nothing: one stream is not a sum", () => {
    expect(mktTotalView(inputOf(noSubscriptions))).toBeNull();
  });

  it("refuses a total when a stream is not measured, and says which part it still has — never one stream passed off as the total (S9)", () => {
    const state = without(example, ["mkt.sell.arpa", "mkt.sell.gross-margin"], ["mktSellerMrrEnd"]);
    const band = mktTotalView(inputOf(state))!;
    expect(band.total.missing).toBe(true);
    expect(band.total.value).toBe(inputOf(state).strings.slide.noNumber);
    expect(band.engines[0]).toMatchObject({ id: "demand", missing: false });
    expect(band.engines[1]).toMatchObject({ id: "supply", missing: true, value: inputOf(state).strings.slide.noNumber });
    expect(band.totals).toEqual([]);
    expect(band.line).toBeNull();
  });

  it("says it in English too, the euro first", () => {
    const band = mktTotalView(inputOf(example, null, "en"))!;
    expect(band.engines.map((e) => e.value)).toEqual(["€32,853.60", "€26,100"]);
    expect(band.total.value).toBe("€58,953.60");
    expect(band.totals.map((t) => t.value)).toEqual(["€707,443.20", "~€3,100", "~€70,000"]);
  });
});

describe("a side's money — each side's own figures (§22.6.2, C101, C72)", () => {
  it("the buyers: the net revenue annualised and the GMV, each with its « ? », then what an active buyer brings", () => {
    const money = mktMoneyView(inputOf(example, "demand"), "demand");
    expect(money.motion).toBe("mkt");
    expect(money.figures).toEqual([
      { key: "arr", label: expect.stringContaining("Revenu net annualisé"), value: nb("394 243,20 €"), term: "netRevenue" },
      { key: "gmv", label: expect.stringContaining("GMV"), value: nb("273 780 €"), term: "gmv" },
    ]);
    expect(money.worth.note).toBe(nb("Un acheteur actif rapporte 2,34 € de revenu net par mois : 0,3 commande × 65 € × 12 % de commission."));
    expect(money.worth.noteTerm).toBe("takeRate");
  });

  it("the buyers: a customer who pays back — the margin, the months, and the cash as a floor (§22.10.2)", () => {
    const money = mktMoneyView(inputOf(example, "demand"), "demand");
    expect(money.worth.tag).toBeNull();
    expect(money.worth.bars?.cost.value).toBe(nb("30 €"));
    expect(money.worth.bars?.brings.value).toBe(nb("~32 € à 38 €"));
    expect(money.cash.spend.value).toBe(nb("18 000 €"));
    expect(money.cash.tied?.value).toBe(nb("~180 000 € à 210 000 €"));
    expect(money.cash.warning).toBeNull();
  });

  it("the buyers, with the sellers paying nothing: the net revenue of the month comes first — there is no band to say it", () => {
    const money = mktMoneyView(inputOf(noSubscriptions, "demand"), "demand");
    expect(money.figures?.map((f) => f.key)).toEqual(["mrr", "arr", "gmv"]);
    expect(money.figures?.[0]?.value).toBe(nb("32 853,60 €"));
  });

  it("the sellers: the subscriptions annualised, and how the cost of a paid seller is computed — it is never typed", () => {
    const money = mktMoneyView(inputOf(example, "supply"), "supply");
    expect(money.figures).toEqual([{ key: "arr", label: expect.stringContaining("ARR"), value: nb("313 200 €") }]);
    expect(money.worth.bars?.cost.value).toBe(nb("200 €"));
    expect(money.worth.note).toContain(nb("100 € par vendeur actif × 30 % de première vente ÷ 15 % de conversion en abonné = 200 €"));
    expect(money.cash.spend.value).toBe(nb("12 000 €"));
    expect(money.cash.tied?.value).toBe(nb("~49 000 €"));
  });

  it("neither side carries a figure of the other's", () => {
    const demand = JSON.stringify(mktMoneyView(inputOf(example, "demand"), "demand"));
    const supply = JSON.stringify(mktMoneyView(inputOf(example, "supply"), "supply"));
    expect(demand).not.toContain(nb("313 200"));
    expect(supply).not.toContain(nb("394 243,20"));
    expect(supply).not.toContain(nb("273 780"));
  });

  it("a net revenue not measured is a « ? », never a zero: the annualised figure and the note leave", () => {
    const state = without(example, ["mkt.rev.take-rate", "mkt.rev.gross-margin"], ["mktNetRevenue"]);
    const money = mktMoneyView(inputOf(state, "demand"), "demand");
    expect(money.figures?.some((f) => f.key === "arr")).toBeFalsy();
    expect(JSON.stringify(money)).not.toMatch(/(^|[^\d])0 €/);
  });
});

describe("a side's « Et si » card — the lever of its leak, its own curve (D2, C54)", () => {
  it("the buyers: the lever of the leak is the fill rate, 9 % to 12 %, and the curve is the side's own, 13 points", () => {
    const view = mktLeverView(inputOf(withWhatIf(example, BOTH_SIDES), "demand"), "demand", BOTH_SIDES)!;
    expect(view.lever.id).toBe("mkt.liq.fill-rate");
    expect(view.lever.valueText).toBe(nb("12 %"));
    expect(view.moved).toBe(true);
    expect(view.curve!.today).toHaveLength(13);
    expect(view.curve!.today[0]![0]).toBeCloseTo(32_853.6, 1);
    expect(view.curve!.today[12]![0]).toBeCloseTo(33_723.61, 1);
    expect(view.curve!.whatif![12]![0]).toBeCloseTo(46_351.72, 1);
    expect(view.figures.map((f) => f.value)).toEqual([nb("~46 000 €"), nb("~560 000 €")]);
    expect(view.figures[0]!.today).toBe(nb("aujourd'hui ~34 000 €"));
  });

  it("the sellers: the lever of their leak is the conversion to a subscription; their curve starts at the subscriptions, not the commissions", () => {
    const view = mktLeverView(inputOf(withWhatIf(example, BOTH_SIDES), "supply"), "supply", BOTH_SIDES)!;
    expect(view.lever.id).toBe("mkt.sell.paid-conversion");
    expect(view.curve!.today[0]![0]).toBeCloseTo(26_100, 1);
    expect(view.curve!.today[12]![0]).toBeCloseTo(35_866.43, 1);
    expect(view.curve!.whatif![12]![0]).toBeCloseTo(41_785.48, 1);
    expect(view.figures.map((f) => f.value)).toEqual([nb("~42 000 €"), nb("~500 000 €")]);
  });

  it("draws no what-if curve while nothing moved, and no jump", () => {
    const view = mktLeverView(inputOf(example, "demand"), "demand", {})!;
    expect(view.moved).toBe(false);
    expect(view.curve!.whatif).toBeNull();
    expect(view.curve!.step).toBe(false);
    expect(view.curve!.note).toBeNull();
    expect(view.figures[0]!.today).toBeNull();
  });

  it("a money lever moved: the first month jumps, and the sentence says by how much — 2 628,29 € printed « ~2 600 € » (§22.8.5 k)", () => {
    const view = mktLeverView(inputOf(withWhatIf(example, BOTH_SIDES), "demand"), "demand", BOTH_SIDES)!;
    expect(view.curve!.step).toBe(true);
    expect(view.curve!.note).toContain(nb("~2 600 €"));
    expect(view.curve!.note).toContain(nb("13 %"));
    // 32 853,60 € × 96 % × (13/12 − 1), the formula of the spec written again.
    expect(32_853.6 * 0.96 * (13 / 12 - 1)).toBeCloseTo(2_628.29, 2);
  });

  it("a lever that does not move the money moves no jump: the sellers' conversion is a slope, not a step", () => {
    const view = mktLeverView(inputOf(withWhatIf(example, BOTH_SIDES), "supply"), "supply", BOTH_SIDES)!;
    expect(view.curve!.step).toBe(false);
    expect(view.curve!.note).toBeNull();
  });

  it("the sellers' price is a money lever for them: the step is announced on their curve only", () => {
    const targets = { "mkt.sell.arpa": 35 };
    const supply = mktLeverView(inputOf(withWhatIf(example, targets), "supply"), "supply", targets)!;
    expect(supply.curve!.step).toBe(true);
    expect(supply.curve!.note).not.toBeNull();
    const demand = mktLeverView(inputOf(withWhatIf(example, targets), "demand"), "demand", targets)!;
    expect(demand.curve!.step).toBe(false);
  });

  it("the sellers who pay nothing have no lever at all", () => {
    expect(mktLeverView(inputOf(noSubscriptions, "supply"), "supply", {})).toBeNull();
  });

  it("offers every lever of the side: eight for the buyers, three for the sellers — and says it", () => {
    expect(mktLeverView(inputOf(example, "demand"), "demand", {})!.allLabel).toContain("8");
    expect(mktLeverView(inputOf(example, "supply"), "supply", {})!.allLabel).toContain("3");
  });
});

describe("a side's funnel — each stage counted on the side's own 100 sign-ups (§22.6.2)", () => {
  it("the buyers: 100 sign-ups, 20 then 5, the 8 referred, 2 000 visitors; the liquidity on its own base of 100 searches", () => {
    const funnel = mktFunnelView(inputOf(example, "demand"), "demand");
    expect(funnel.columns.map((c) => [c.id, c.n])).toEqual([
      ["signups", "100"],
      ["mkt.buy.first-order", "20"],
      ["mkt.buy.repeat", "5"],
    ]);
    expect(funnel.columns[1]!.label).toBe(nb("Première commande sous 30 jours"));
    expect(funnel.columns[2]!.label).toBe(nb("Deuxième commande sous 90 jours"));
    expect(funnel.upstream).toContain(nb("~2 000 visiteurs"));
    expect(funnel.legend?.[0]).toMatchObject({ kind: "referred" });
    expect(funnel.legend?.[0]?.label).toContain("8");
    expect(funnel.base!.title).toBe(nb("Liquidité · sur 100 recherches"));
    expect(funnel.base!.term).toBe("liquidity");
    expect(funnel.base!.column.n).toBe("9");
    expect(funnel.rates).toBeUndefined();
  });

  it("the buyers: the stage that holds back is the fill rate's — one stamp on the screen, not on the stages beside it", () => {
    const funnel = mktFunnelView(inputOf(example, "demand"), "demand");
    expect(funnel.base!.column.holds).toBeTruthy();
    expect(funnel.columns.filter((c) => c.holds)).toEqual([]);
  });

  it("the sellers: 100 sign-ups, a first sale at 30 and subscribers at 15; the two churns are rates beside the funnel, never columns", () => {
    const funnel = mktFunnelView(inputOf(example, "supply"), "supply");
    expect(funnel.columns.map((c) => [c.id, c.n])).toEqual([
      ["signups", "100"],
      ["mkt.sell.first-sale", "30"],
      ["mkt.sell.paid-conversion", "15"],
    ]);
    expect(funnel.rates?.map((r) => [r.id, r.value])).toEqual([
      ["mkt.sell.churn", nb("3 %")],
      ["mkt.sell.paid-churn", nb("3 %")],
    ]);
    expect(funnel.base).toBeUndefined();
    // The sellers paying, their money is their own: the aside on where they show is for the sellers who earn nothing.
    expect(funnel.aside).toBeUndefined();
    expect(funnel.columns.find((c) => c.id === "mkt.sell.paid-conversion")!.holds).toBeTruthy();
    // The conversion is what holds the sellers back, not a rate: the paid churn is under its target but unpriced behind it.
    expect(funnel.upstream).toContain(nb("~2 000 visiteurs"));
  });

  it("the sellers who pay nothing: one column, one churn, and a sentence on where they show — the buyers' liquidity", () => {
    const funnel = mktFunnelView(inputOf(noSubscriptions, "supply"), "supply");
    expect(funnel.columns.map((c) => c.id)).toEqual(["signups", "mkt.sell.first-sale"]);
    expect(funnel.rates?.map((r) => r.id)).toEqual(["mkt.sell.churn"]);
    expect(funnel.aside).toContain(nb("9 %"));
  });

  it("the buyers' funnel is the same with or without the subscriptions (the side does not move)", () => {
    const [a, b] = [mktFunnelView(inputOf(example, "demand"), "demand"), mktFunnelView(inputOf(noSubscriptions, "demand"), "demand")];
    expect(b.columns.map((c) => [c.id, c.n])).toEqual(a.columns.map((c) => [c.id, c.n]));
  });

  it("names a stage it cannot see by a « ? », not by a zero or a missing column", () => {
    const state = without(example, ["mkt.buy.repeat"]);
    const funnel = mktFunnelView(inputOf(state, "demand"), "demand");
    const repeat = funnel.columns.find((c) => c.id === "mkt.buy.repeat")!;
    expect(repeat.n).not.toBe("0");
    expect(repeat.ariaLabel).toBeTruthy();
  });
});

describe("the « À côté » lines — the other stages under their target, in ink (§22.6.2, C67, C97)", () => {
  it("the buyers: the first order, priced by the ranking itself — 351 € a month printed « ~350 € » — and not the leak", () => {
    const lines = mktAsideLines(inputOf(example, "demand"), "demand");
    expect(lines.map((l) => l.id)).toEqual(["mkt.buy.first-order"]);
    expect(lines[0]!.text).toBe(nb("À côté : la première commande, 20 % pour une cible de 25 %, vaudrait ~350 € de revenu net nouveau par mois."));
  });

  it("the sellers: the paid churn is priced (130,50 € a month, « ~130 € »); the first sale has no amount — the offer is priced by its subscriptions", () => {
    const lines = mktAsideLines(inputOf(example, "supply"), "supply");
    expect(lines.map((l) => l.id)).toEqual(["mkt.sell.first-sale", "mkt.sell.paid-churn"]);
    expect(lines[0]!.text).toContain("sans montant");
    expect(lines[1]!.text).toContain(nb("~130 €"));
    expect(lines[1]!.text).toContain(nb("préservé par mois"));
  });

  it("says no line of a stage that is on its target, and none of the stage the diagnosis names", () => {
    const state = withEntry(example, "mkt.sell.paid-churn", undefined);
    const lines = mktAsideLines(inputOf(state, "supply"), "supply");
    expect(lines.map((l) => l.id)).not.toContain("mkt.sell.paid-churn");
    expect(lines.map((l) => l.id)).not.toContain("mkt.sell.paid-conversion");
  });
});

describe("a side's « Et si » panel — its own figures, its own sums (D2)", () => {
  it("the buyers: growth, one new buyer, the cash — today against the what-ifs, the new buyers 600 then 1 000", () => {
    const state = withWhatIf(example, BOTH_SIDES);
    const { moved, groups } = mktWhatIfGroups(inputOf(state, "demand"), "demand");
    expect(moved).toBe(true);
    expect(groups.map((g) => g.id)).toEqual(["growth", "customer", "cash"]);
    const growth = groups[0]!.rows;
    expect(growth.map((r) => r.id)).toEqual(["newMrr", "newUnits"]);
    expect(growth[1]).toMatchObject({ today: "600", whatif: nb("1 000") });
    expect(growth[0]).toMatchObject({ today: nb("~1 400 €"), whatif: nb("~2 500 €") });
    expect(groups[2]!.rows.find((r) => r.id === "spend")).toMatchObject({ today: nb("18 000 €"), whatif: nb("18 000 €"), change: "stable" });
  });

  it("the sellers: the new paid sellers 60 then 80, the cost of one 200 € then 150 € at the same spend", () => {
    const state = withWhatIf(example, BOTH_SIDES);
    const { groups } = mktWhatIfGroups(inputOf(state, "supply"), "supply");
    const growth = groups.find((g) => g.id === "growth")!.rows;
    expect(growth.find((r) => r.id === "newUnits")).toMatchObject({ today: "60", whatif: "80" });
    const customer = groups.find((g) => g.id === "customer")!.rows;
    expect(customer.find((r) => r.id === "cac")).toMatchObject({ today: nb("~200 €"), whatif: nb("~150 €") });
  });

  it("nothing moved: the panel says so, and no change is printed", () => {
    const { moved, groups } = mktWhatIfGroups(inputOf(example, "demand"), "demand");
    expect(moved).toBe(false);
    for (const row of groups.flatMap((g) => g.rows)) expect(row.whatif === row.today || row.whatif === null || row.whatif === undefined || row.change === "stable" || row.change === null).toBe(true);
  });

  it("the assumptions follow the levers moved, the side's own, ending on the LTV's and the cash's — in the side's words", () => {
    const state = withWhatIf(example, BOTH_SIDES);
    for (const side of ["demand", "supply"] as const) {
      const input = inputOf(state, side);
      const list = mktAssumptions(input, side);
      expect(list.slice(-2), side).toEqual([input.strings.scenario.assumeLtv, input.strings.scenario.assumeCash]);
      // Six rules for the buyers' example, three for the sellers' (§22.10.2), before the money's two.
      expect(list, side).toHaveLength((side === "demand" ? 6 : 3) + 2);
    }
    // The LTV's rule is said of a buyer for the buyers and of a paid seller for the sellers: never one sentence for both.
    expect(mktAssumptions(inputOf(state, "demand"), "demand").at(-2)).not.toBe(mktAssumptions(inputOf(state, "supply"), "supply").at(-2));
  });
});

describe("the compounding of a side's levers — the gains alone, added, together (§22.10.2)", () => {
  it("the buyers: 4 531,30 € + 3 398,47 € + 2 810,30 € = 10 740,07 € alone, 12 628,11 € together, +1 888,04 € for the compounding", () => {
    const sum = mktLeverSum(inputOf(withWhatIf(example, BOTH_SIDES), "demand"), "demand")!;
    expect(sum.rows.map((r) => r.id)).toEqual(["mkt.buy.first-order", "mkt.liq.fill-rate", "mkt.rev.take-rate"]);
    expect(sum.rows.map((r) => Math.round(r.amount * 100) / 100)).toEqual([3_398.47, 4_531.3, 2_810.3]);
    expect(Math.round(sum.sum.amount * 100) / 100).toBe(10_740.07);
    expect(Math.round(sum.together.amount * 100) / 100).toBe(12_628.11);
    expect(sum.extra).toContain(nb("~1 900 €"));
    expect(sum.together.value).toBe(nb("+13 000 €"));
  });

  it("the sellers: one lever moved is no compounding; two are — 5 919,05 € and 1 630,64 € alone", () => {
    expect(mktLeverSum(inputOf(withWhatIf(example, BOTH_SIDES), "supply"), "supply")).toBeNull();
    const targets = { "mkt.sell.paid-conversion": 20, "mkt.sell.paid-churn": 2.5 };
    const sum = mktLeverSum(inputOf(withWhatIf(example, targets), "supply"), "supply")!;
    expect(sum.rows.map((r) => Math.round(r.amount * 100) / 100)).toEqual([5_919.05, 1_630.64]);
  });

  it("never mixes the sides: the buyers' levers moved leave the sellers' compounding empty", () => {
    const targets = { "mkt.buy.first-order": 25, "mkt.liq.fill-rate": 12 };
    expect(mktLeverSum(inputOf(withWhatIf(example, targets), "supply"), "supply")).toBeNull();
    expect(mktLeverSum(inputOf(withWhatIf(example, targets), "demand"), "demand")).not.toBeNull();
  });
});

describe("the shared list of numbers — one flagged stage, the one the side shown names (C41, C103)", () => {
  const flagged = (state: EngineState, side: MktSide) => {
    const input = inputOf(state, null);
    const snapshot = state.snapshots[state.snapshots.length - 1]!;
    const stages = listStages(snapshot, diagnosisOf({ ...input, bridges: FR.bridges } as never, "mkt", side), "mkt", state.setup);
    return stages.filter((s) => s.holdsBack).map((s) => s.stage);
  };

  it("reads a number on its side: the sellers' for « mkt.sell.* », the buyers' for the rest — the fill rate and the take rate included", () => {
    expect(sideOfMetric("mkt.sell.paid-conversion")).toBe("supply");
    expect(sideOfMetric("mkt.sell.churn")).toBe("supply");
    expect(sideOfMetric("mkt.buy.first-order")).toBe("demand");
    expect(sideOfMetric("mkt.liq.fill-rate")).toBe("demand");
    expect(sideOfMetric("mkt.rev.take-rate")).toBe("demand");
  });

  it("flags the stage the buyers' diagnosis names when the buyers are shown (activation: the fill rate), the sellers' when the sellers are (revenue: the conversion) — one at a time, never both", () => {
    expect(flagged(example, "demand")).toEqual(["activation"]);
    expect(flagged(example, "supply")).toEqual(["revenue"]);
    const input = inputOf(example, null);
    expect([...namedStages(diagnosisOf({ ...input } as never, "mkt", "demand"))]).toEqual(["activation"]);
    expect([...namedStages(diagnosisOf({ ...input } as never, "mkt", "supply"))]).toEqual(["revenue"]);
  });

  it("reads the candidates of the side shown, none of the other's (D2)", () => {
    const demand = candidateValuesOf(example, CTX_FR, "demand");
    const supply = candidateValuesOf(example, CTX_FR, "supply");
    expect(Object.keys(demand).every((id) => !id.startsWith("mkt.sell."))).toBe(true);
    expect(Object.keys(supply).every((id) => id.startsWith("mkt.sell."))).toBe(true);
    expect(Object.keys(demand)).toContain("mkt.liq.fill-rate");
    expect(Object.keys(supply)).toContain("mkt.sell.paid-conversion");
  });
});

describe("a services marketplace says services — none of the words of « produits » on the board (§22.8.3, rule 5)", () => {
  /** A services marketplace: the same example, its setup reading « services ». */
  const services = (side: MktSide, locale: "fr" | "en" = "fr") => inputOf(example, side, locale, "services");

  it.each(["fr", "en"] as const)("holds no banned word in any view of either side (%s)", (locale) => {
    for (const side of ["demand", "supply"] as const) {
      const input = services(side, locale);
      const withIf = { ...input, state: withWhatIf(input.state, BOTH_SIDES) };
      const views = [
        mktMoneyView(input, side),
        mktLeverView(withIf, side, BOTH_SIDES),
        mktFunnelView(input, side),
        mktAsideLines(input, side),
        mktWhatIfGroups(withIf, side),
        mktAssumptions(withIf, side),
        mktLeverSum(withIf, side),
      ];
      const texts = textsOf(views);
      // The sweep reads sentences: a view that went silent would pass it for the wrong reason.
      expect(texts.length, `${side} ${locale}: what the sweep reads`).toBeGreaterThan(60);
      const held = texts.flatMap((text) => servicesWordsHeld(text, locale).map((word) => `${word} in « ${text} »`));
      expect(held, `${side} ${locale}`).toEqual([]);
    }
  });

  it("holds none in the band either", () => {
    for (const locale of ["fr", "en"] as const) {
      const band = mktTotalView(inputOf(example, null, locale, "services"))!;
      expect(textsOf(band).flatMap((text) => servicesWordsHeld(text, locale)), locale).toEqual([]);
    }
  });
});
