import { describe, expect, it } from "vitest";
import { deriveEngine } from "@/lib/engine/derive";
import { EXAMPLE_CONSUMER_WHATIF } from "@/lib/engine/example";
import { consumerState, consumerUsageOnlyState, estimated, exampleState, withEntry } from "@/lib/engine/__tests__/fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "@/lib/engine/__tests__/props";
import type { AppMonetization } from "@/lib/engine/app-model";
import { metricsOfStageIn } from "@/lib/engine/catalog-shape";
import { diagnose } from "@/lib/engine/diagnose";
import { leverAlone } from "@/lib/engine/scenario";
import { leverAloneOf, scenarioOf } from "@/lib/engine/scenario-of";
import { mergeStrings } from "@/lib/engine/strings";
import type { EngineState, LeverId } from "@/lib/engine/types";
import { numberPosition } from "../BoardNumbers";
import { leverMoneyView, moneyView } from "../money-view";
import { candidateValuesOf, listStages } from "../number-list";
import { KPI_INPUTS, appKpiInputs, appMissingPhrase, gainText, kpiRows, leverGains, scenarioFor, selfServeKpiInputs } from "../scenario-view";
import type { EngineView } from "../view";
import { leverSumView, moneyAssumptions, whatIfFigureGroups } from "../whatif-figures";

/**
 * What an app's board says (§21.6.4, A22 APP-8), on the example of §21.9.1 whose figures are §21.9.2's: revenue 39 300 €
 * (28 800 € of subscriptions, 10 500 € of purchases and ads), an install costs 1,50 € and brings back 2,18 € over 36
 * months and 1,43 € over 12 (a ratio of 0,95), paid back in 13,01 months; with J30 and the commission at 15 %: revenue in
 * 12 months 49 391,72 € (+6 713,89 €), 8,20 months. The app without subscriptions loses (0,59 € for 1,50 €).
 *
 * The figures printed are those two-significant-digit roundings, so the test reads them as the board prints them.
 */
const N = "\u00a0";
const SECOND = { fr: { P: FR, ctx: CTX_FR }, en: { P: EN, ctx: CTX_EN } } as const;

function inputOf(state: EngineState, locale: "fr" | "en" = "fr") {
  const { P, ctx } = SECOND[locale];
  const app = state.setup.type === "consumer-app";
  const strings = app ? mergeStrings(P.strings, P.typeStrings["consumer-app"]) : P.strings;
  const catalog = app ? P.typeCatalogs["consumer-app"] : { metrics: P.metrics, derived: P.derived };
  return { state, derived: deriveEngine(state, ctx, null, P.bridges, strings.units), ctx, strings, metrics: catalog.metrics, derivedCopy: catalog.derived };
}
const withWhatIf = (state: EngineState, whatIf: Partial<Record<LeverId, number>>): EngineState => ({ ...state, whatIf });
/** The month's actives not known: no count typed, and no per-active figure typed as counts (they would carry it). */
const withoutActives = (state: EngineState): EngineState => {
  let copy = structuredClone(state);
  const snapshot = copy.snapshots[copy.snapshots.length - 1]!;
  snapshot.base = { ...snapshot.base, appActives: undefined };
  copy = withEntry(copy, "app.rev.purchases-per-active", estimated(0.2, 0.4));
  copy = withEntry(copy, "app.rev.ads-per-active", estimated(0.3, 0.5));
  return withEntry(copy, "app.ret.active-retention", estimated(85, 95));
};
const subscriptionsOnly: AppMonetization = { subscriptions: true, purchases: false, ads: false };

describe("appKpiInputs: what each figure of an app reads, in the order « il manque » names it", () => {
  it("the three ways: the subscriptions' numbers, then day 30, the revenues per active, the actives' retention", () => {
    const k = appKpiInputs({ subscriptions: true, purchases: true, ads: true });
    expect(k.mrr12).toEqual(["rev.arpa", "rev.paid-conversion", "ret.logo-churn", "ret.d30", "app.rev.purchases-per-active", "app.rev.ads-per-active", "app.ret.active-retention"]);
    expect(k.newMrr).toEqual(["rev.arpa", "rev.paid-conversion", "ret.d30", "app.rev.purchases-per-active", "app.rev.ads-per-active"]);
    expect(k.cac).toEqual(["app.acq.cpi"]);
  });
  it("only what is ticked", () => {
    expect(appKpiInputs(subscriptionsOnly).mrr12).toEqual(["rev.arpa", "rev.paid-conversion", "ret.logo-churn"]);
    const ads = appKpiInputs({ subscriptions: false, purchases: false, ads: true });
    expect(ads.mrr12).toEqual(["ret.d30", "app.rev.ads-per-active", "app.ret.active-retention"]);
    expect(ads.newMrr).toEqual(["ret.d30", "app.rev.ads-per-active"]);
  });
  it("the value, the payback and the 12-month value read the model's own lists, and the SaaS reads its own", () => {
    const all = appKpiInputs({ subscriptions: true, purchases: true, ads: true });
    expect(all.ltv).toContain("app.rev.gross-margin");
    expect(all.payback).toContain("app.acq.cpi");
    expect(all.ltv).not.toContain("app.acq.cpi");
    expect(new Set(all.value12)).toEqual(new Set(all.ltv));
    expect(selfServeKpiInputs(exampleState().setup)).toBe(KPI_INPUTS);
    expect(selfServeKpiInputs(consumerState().setup).cac).toEqual(["app.acq.cpi"]);
  });
});

describe("appMissingPhrase", () => {
  const strings = inputOf(consumerState()).strings;
  const metrics = inputOf(consumerState()).metrics;
  it("names the inputs missing, then the actives (with their article), as one list", () => {
    expect(appMissingPhrase(["rev.arpa", "app.rev.ads-per-active"], true, strings, metrics)).toBe("le revenu mensuel par abonné, la publicité par actif et les actifs du mois");
    expect(appMissingPhrase([], true, strings, metrics)).toBe("les actifs du mois");
  });
  it("reads scenario.missingActives, in both languages; the shared count's line keeps its own label", () => {
    const en = inputOf(consumerState(), "en");
    expect(appMissingPhrase([], true, en.strings, en.metrics)).toBe("the month's actives");
    expect(strings.io.sharedCount.appActives).toBe("actifs du mois");
    expect(en.strings.io.sharedCount.appActives).toBe("actives in the month");
  });
  it("is null with nothing to ask for: never « il manque » on an empty list", () => {
    expect(appMissingPhrase([], false, strings, metrics)).toBeNull();
  });
});

describe("the growth figures of an app (kpiRows)", () => {
  const rows = (state: EngineState, locale: "fr" | "en" = "fr") => {
    const i = inputOf(state, locale);
    return kpiRows(scenarioFor(state, state.whatIf ?? {}, i.ctx), i.ctx, i.strings, "EUR", { state, metrics: i.metrics });
  };
  it("the example: seven figures, in the app's words", () => {
    const k = rows(consumerState());
    expect(k.map((r) => r.id)).toEqual(["mrr12", "newMrr", "nrr", "grr", "cac", "ltv", "payback"]);
    expect(k.find((r) => r.id === "cac")!.today).toBe(`~1,50${N}€`);
    expect(k.find((r) => r.id === "payback")!.today).toBe(`13${N}mois`);
    expect(k.find((r) => r.id === "mrr12")!.label).toBe(`Revenu dans 12${N}mois`);
  });
  it("without subscriptions an app has no NRR and no GRR row", () => {
    expect(rows(consumerUsageOnlyState()).map((r) => r.id)).toEqual(["mrr12", "newMrr", "cac", "ltv", "payback"]);
  });
  it("the revenue in 12 months, which lacks the actives, names them last; a payback that never comes says plain « inconnu »", () => {
    const k = rows(withoutActives(consumerState()));
    expect(k.find((r) => r.id === "mrr12")!.today).toBeNull();
    expect(k.find((r) => r.id === "mrr12")!.unknown).toBe("il manque les actifs du mois");
    expect(rows(withoutActives(consumerState()), "en").find((r) => r.id === "mrr12")!.unknown).toBe("missing: the month's actives");
    // The cost per install is no revenue: the actives are not asked for it.
    expect(k.find((r) => r.id === "cac")!.today).not.toBeNull();
    const usage = rows(consumerUsageOnlyState());
    expect(usage.find((r) => r.id === "payback")!.today).toBeNull();
    expect(usage.find((r) => r.id === "payback")!.unknown).toBe("inconnu");
  });
  it("the value, the payback and the new revenue, unknown for want of the margin, name the margin and never the actives (§21.6.4)", () => {
    const state = withEntry(withoutActives(consumerState()), "app.rev.gross-margin", undefined);
    for (const locale of ["fr", "en"] as const) {
      const k = rows(state, locale);
      const margin = locale === "fr" ? "la marge brute après commission" : "gross margin after commission";
      for (const id of ["ltv", "payback"] as const) {
        const row = k.find((r) => r.id === id)!;
        expect(row.today).toBeNull();
        expect(row.unknown).toContain(margin);
        expect(row.unknown).not.toContain(locale === "fr" ? "actifs" : "actives");
      }
      // The revenue in 12 months, on the same state, still names them, with their article and last.
      const mrr12 = k.find((r) => r.id === "mrr12")!;
      expect(mrr12.unknown.endsWith(locale === "fr" ? "les actifs du mois" : "the month's actives")).toBe(true);
    }
  });
  it("with J30 and the commission at 15 %: 8 months, not 13", () => {
    const k = rows(withWhatIf(consumerState(), EXAMPLE_CONSUMER_WHATIF));
    expect(k.find((r) => r.id === "payback")!.projected).toBe(`8${N}mois`);
    expect(k.find((r) => r.id === "mrr12")!.projected).toBe(`~49${N}000${N}€`);
  });
});

describe("the money block of an app (moneyView)", () => {
  it("the example: the month's revenue and its annualised, the install worth, paid back in 13 months", () => {
    const m = moneyView(inputOf(consumerState()), "plg");
    expect(m.figures).toEqual([
      { key: "mrr", label: "Revenu du mois", value: `39${N}300${N}€` },
      { key: "arr", label: "Revenu annualisé, le revenu du mois × 12", value: `471${N}600${N}€` },
    ]);
    expect(m.worth.tag).toBeNull();
    expect(m.worth.finding).toBe(`Chaque installation coûte 1,50${N}€ et rapporte ~2,20${N}€ de marge en 36${N}mois${N}: ~0,68${N}€ de plus que ce qu'elle coûte.`);
    expect(m.worth.months).toBe(`Elle rembourse son coût en 13${N}mois, puis continue de rapporter, de moins en moins, à mesure que ses utilisateurs s'en vont.`);
    expect(m.worth.monthsTerm).toBe(false);
  });
  it("no cash tied up (D11): the spend alone, and the reason", () => {
    const m = moneyView(inputOf(consumerState()), "plg");
    expect(m.cash.tied).toBeNull();
    expect(m.cash.spend.value).toBe(`18${N}000${N}€`);
    expect(m.cash.line).toBe(FR.strings.money.lineApp);
    expect(m.cash.assumptions).toBeNull();
    expect(m.cash.warning).toBeNull();
  });
  it("a loss (the app without subscriptions): the finding says it once, no sentence on the time", () => {
    const m = moneyView(inputOf(consumerUsageOnlyState()), "plg");
    expect(m.worth.tag).toEqual({ label: "Perte", maybe: false });
    expect(m.worth.finding).toBe(`Chaque installation coûte 1,50${N}€ et rapporte ~0,59${N}€ de marge en 36${N}mois${N}: tu perds ~0,91${N}€ sur chacune.`);
    expect(m.worth.months).toBeNull();
    expect(m.cash.line).toBe(FR.strings.money.lineApp);
  });
  it("a worst case beyond 36 months: the second sentence follows the first, in one string", () => {
    const state = withEntry(consumerState(), "app.acq.cpi", estimated(1.5, 6));
    const m = moneyView(inputOf(state), "plg");
    expect(m.worth.tag?.maybe).toBe(true);
    expect(m.worth.months).toMatch(/^Elle rembourse son coût en .*, puis continue/);
    expect(m.worth.months).toContain(` ${FR.strings.money.monthsAppBeyond}`);
  });
  it("in English", () => {
    const m = moneyView(inputOf(consumerState(), "en"), "plg");
    expect(m.figures![0]!.value).toBe("€39,300");
    expect(m.worth.months).toBe("It pays back its cost in 13 months, then keeps bringing in, less and less, as its users leave.");
    expect(m.cash.line).toMatch(/^No cash tied up for an app/);
  });
  it("an app that lacks its actives does not name them where the value of an install is unknown: only the margin, and the note", () => {
    const state = withEntry(withoutActives(consumerState()), "app.rev.gross-margin", undefined);
    const m = moneyView(inputOf(state), "plg");
    expect(m.worth.finding).toBe(`On ne peut pas encore dire ce que rapporte une installation${N}: il manque la marge brute après commission.`);
    expect(m.worth.note).toBe(inputOf(state).strings.money.noMarginNote);
    expect(m.worth.note).toMatch(/^Sans elle, ni valeur d'une installation ni remboursement/);
    expect(m.worth.bars?.brings.unknown).toBe("il manque la marge brute après commission");
  });
  it("the SaaS's block is the one it was: its cash tied up, its lifetime", () => {
    const m = moneyView(inputOf(exampleState()), "plg");
    expect(m.cash.tied).not.toBeNull();
    expect(m.cash.line).not.toBe(FR.strings.money.lineApp);
  });
});

describe("the lever card's money for an app (leverMoneyView)", () => {
  const card = (state: EngineState, targets: Partial<Record<LeverId, number>> = {}, locale: "fr" | "en" = "fr") =>
    leverMoneyView(inputOf(withWhatIf(state, targets), locale), "plg", targets, "ret.d30");
  it("the curve and the annualised revenue in twelve months, today and with the what-ifs", () => {
    const c = card(consumerState());
    expect(c.curve?.start).toBe(`39${N}300${N}€ aujourd'hui`);
    expect(c.curve?.summary).toBe(`Le revenu mois par mois, de 39${N}300${N}€ aujourd'hui à ~43${N}000${N}€ dans 12${N}mois au rythme actuel.`);
    expect(c.arr12).toEqual({ label: `Revenu annualisé dans 12${N}mois`, value: `~510${N}000${N}€`, today: null, unknown: false });
    const moved = card(consumerState(), EXAMPLE_CONSUMER_WHATIF);
    expect(moved.arr12.value).toBe(`~590${N}000${N}€`);
    expect(moved.arr12.today).toBe(`aujourd'hui ~510${N}000${N}€`);
  });
  it("without the actives, the annualised revenue is unknown and asks for them", () => {
    expect(card(withoutActives(consumerState())).arr12).toMatchObject({ unknown: true, value: "il manque les actifs du mois" });
  });
  it("an install worth 0,59 € then 0,77 € is not « unchanged » (half a euro would say so)", () => {
    const c = card(consumerUsageOnlyState(), EXAMPLE_CONSUMER_WHATIF);
    expect(c.worth).toBe(`Une installation${N}: toujours une perte, de ~0,73${N}€ au lieu de ~0,91${N}€.`);
  });
  it("a lever that really changes neither the value nor the cost says so (a target equal to today's)", () => {
    const c = leverMoneyView(inputOf(withWhatIf(consumerUsageOnlyState(), { "app.rev.commission": 22 })), "plg", { "app.rev.commission": 22 }, "app.rev.commission");
    expect(c.worth).toBe(`Une installation${N}: toujours une perte de ~0,91${N}€. Ce levier ne change ni ce que rapporte une installation ni ce qu'elle coûte.`);
  });
});

describe("the « Et si » figures of an app (whatIfFigureGroups)", () => {
  const groups = (state: EngineState, targets: Partial<Record<LeverId, number>> = {}, locale: "fr" | "en" = "fr") =>
    whatIfFigureGroups(inputOf(withWhatIf(state, targets), locale), "plg", targets).groups;
  const ids = (state: EngineState, group: "growth" | "customer" | "cash") => groups(state).find((g) => g.id === group)!.rows.map((r) => r.id);

  it("the example: growth, one install with its 12-month value, and the spend alone", () => {
    expect(ids(consumerState(), "growth")).toEqual(["newMrr", "nrr", "grr"]);
    expect(ids(consumerState(), "customer")).toEqual(["cac", "value12", "ltv", "ltvCac", "gap", "payback"]);
    expect(ids(consumerState(), "cash")).toEqual(["spend"]);
  });
  it("without subscriptions no NRR and no GRR; the SaaS keeps its months after payback and its cash", () => {
    expect(ids(consumerUsageOnlyState(), "growth")).toEqual(["newMrr"]);
    expect(ids(exampleState(), "customer")).toContain("after");
    expect(ids(exampleState(), "cash")).toEqual(["spend", "cash"]);
  });
  it("with the what-ifs, today against with, and the ratio on the unrounded values", () => {
    const customer = groups(consumerState(), EXAMPLE_CONSUMER_WHATIF)[1]!;
    const row = (id: string) => customer.rows.find((r) => r.id === id)!;
    expect(row("value12")).toMatchObject({ label: `Valeur sur 12${N}mois`, today: `~1,40${N}€`, whatif: `~1,90${N}€` });
    expect(row("ltvCac")).toMatchObject({ label: `Valeur sur 12${N}mois ÷ coût`, today: expect.stringContaining("0,95") });
    expect(row("payback")).toMatchObject({ today: `13${N}mois`, whatif: `8${N}mois` });
  });
  it("a row that cannot be computed says what is missing, never the actives (§21.6.4), and not for the spend", () => {
    const g = groups(withoutActives(consumerState()));
    expect(g[0]!.rows.find((r) => r.id === "newMrr")!.today).not.toBe("?");
    const spend = g[2]!.rows[0]!;
    expect(spend.missing).toBeNull();
    const noCpi = groups(withEntry(withoutActives(consumerState()), "app.acq.cpi", undefined));
    expect(noCpi[2]!.rows[0]!.missing).toBe("il manque le coût par installation");
    // The 12-month value and the value of an install, unknown for want of the margin, ask for it alone.
    const noMargin = groups(withEntry(withoutActives(consumerState()), "app.rev.gross-margin", undefined));
    for (const id of ["value12", "ltv", "payback"]) {
      const missing = noMargin[1]!.rows.find((r) => r.id === id)!.missing;
      expect(missing).toContain("la marge brute après commission");
      expect(missing).not.toContain("actifs");
    }
  });
  it("the rule under the tables is the install's, never the cash's", () => {
    expect(moneyAssumptions(inputOf(consumerState()), "plg", {})).toEqual([FR.strings.scenario.assumeLtvApp]);
    expect(moneyAssumptions(inputOf(exampleState()), "plg", {})).not.toContain(FR.strings.scenario.assumeLtvApp);
  });
});

describe("a gain of nothing has no sign (D13)", () => {
  const i = inputOf(consumerState());
  it("« 0 € », never « −0 € »", () => {
    expect(gainText(0, "EUR", i.ctx)).toBe(`0${N}€`);
    expect(gainText(6713.89, "EUR", i.ctx)).toBe(`+6${N}700${N}€`);
    expect(gainText(-300, "EUR", i.ctx)).toBe(`−300${N}€`);
  });
  it("the commission alone brings no revenue, and the sum of the levers prints it as « 0 € »", () => {
    const state = withWhatIf(consumerState(), EXAMPLE_CONSUMER_WHATIF);
    const scenario = scenarioFor(state, EXAMPLE_CONSUMER_WHATIF, i.ctx);
    const gains = leverGains(state, scenario, i.ctx);
    expect(gains.alone.map((g) => [g.id, g.gain === null ? null : Math.round(g.gain * 100) / 100])).toEqual([
      ["ret.d30", 6713.89],
      ["app.rev.commission", 0],
    ]);
    const sum = leverSumView(inputOf(state), EXAMPLE_CONSUMER_WHATIF)!;
    expect(sum.rows.map((r) => r.value)).toEqual([`+6${N}700${N}€`, `0${N}€`]);
  });
});

describe("the seam: the board reads the app's scenario, and the SaaS reads its own", () => {
  const ctx = CTX_FR;
  it("an app's scenario carries the app's keys, a SaaS's does not", () => {
    expect(scenarioFor(consumerState(), {}, ctx).today.kpis.app).toBeDefined();
    const saas = scenarioFor(exampleState(), {}, ctx);
    expect("app" in saas.today.kpis).toBe(false);
    expect("app" in saas.projected.kpis).toBe(false);
  });
  it("is exactly `buildScenario` and `leverAlone` for a SaaS", () => {
    const state = withWhatIf(exampleState(), { "act.rate": 40 });
    expect(leverAloneOf(state, "act.rate", ctx)).toEqual(leverAlone(state, "act.rate", ctx));
    expect(scenarioOf(state, state.whatIf!, ctx).moved).toEqual(["act.rate"]);
  });
});

describe("the list of numbers and the diagnosis' values", () => {
  it("an app's stages list its own numbers — the cost per install, not the CAC", () => {
    const state = consumerState();
    const snapshot = state.snapshots[state.snapshots.length - 1]!;
    const d = diagnose(state, CTX_FR);
    const ids = (setup?: EngineState["setup"]) => listStages(snapshot, d, "plg", setup).flatMap((s) => s.rows.map((r) => r.id));
    expect(ids(state.setup)).toContain("app.acq.cpi");
    expect(ids(state.setup)).not.toContain("acq.cac");
    expect(ids(state.setup)).toContain("app.ret.active-retention");
    // Without the setup, the SaaS's list, as before.
    expect(ids()).toContain("acq.cac");
  });
  it("without subscriptions the list has no subscription number", () => {
    const state = consumerUsageOnlyState();
    const snapshot = state.snapshots[state.snapshots.length - 1]!;
    const ids = listStages(snapshot, diagnose(state, CTX_FR), "plg", state.setup).flatMap((s) => s.rows.map((r) => r.id));
    expect(ids).not.toContain("rev.paid-conversion");
    expect(ids).not.toContain("rev.arpa");
    expect(ids).toContain("app.rev.purchases-per-active");
  });
  it("a number's place in its stage is counted in the app's list", () => {
    const view = { ...inputOf(consumerState()), bridges: [], tourResult: null, tourOnDevice: false, deviceTour: null } as EngineView;
    expect(numberPosition("app.acq.cpi", view)).toMatch(/3 sur 3$/);
    expect(metricsOfStageIn("acquisition", "plg", consumerState().setup).map((s) => s.id)).toContain("app.acq.cpi");
  });
  it("the values the diagnosis prints include the actives' retention, and the SaaS's are unchanged", () => {
    const values = candidateValuesOf(consumerState(), CTX_FR);
    expect(values["app.ret.active-retention"]).toEqual({ lo: 90, hi: 90 });
    expect(values["ret.d30"]).toBeDefined();
    expect(Object.keys(candidateValuesOf(exampleState(), CTX_FR))).not.toContain("app.ret.active-retention");
  });
});
