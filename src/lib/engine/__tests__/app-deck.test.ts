import { describe, expect, it } from "vitest";
import { appWhatIf } from "../app";
import { buildDeck, chainLine, pelotonTitle, renderTitle } from "../deck";
import { deriveEngine } from "../derive";
import { appUnitMoney } from "../deck-unit";
import { scenarioOf } from "../scenario-of";
import { EXAMPLE_CONSUMER_WHATIF } from "../example";
import { impactHeadline } from "../impact";
import { chainTemplate, subjectOf, worthOf } from "../phrases";
import { mergeStrings } from "../strings";
import type { DeckModel, DeckSlide, EngineState, Impact, ImpactLine, LeverId, MetricId, SelfServeCandidateId } from "../types";
import { consumerState, consumerUsageOnlyState, exampleState, withEntry } from "./fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "./props";

/**
 * An app's slides (engine spec §21.7, A22 APP-9), on the example of §21.9 whose figures are §21.9.2's: the chain of the
 * leak with its two streams, the peloton of two columns, the unit economics per install with its curve, the what-ifs.
 *
 * The figures printed are two-significant-digit roundings of the model's, so the tests read them as the slide prints
 * them: « ~830 € » is the 828 € of J30 12 → 15 %, 576 € of subscriptions and 252 € of purchases and ads.
 */
const N = " ";
const SECOND = { fr: { P: FR, ctx: CTX_FR }, en: { P: EN, ctx: CTX_EN } } as const;

function inputOf(state: EngineState, locale: "fr" | "en" = "fr") {
  const { P, ctx } = SECOND[locale];
  const strings = mergeStrings(P.strings, P.typeStrings["consumer-app"]);
  const catalog = P.typeCatalogs["consumer-app"];
  return { state, derived: deriveEngine(state, ctx, null, P.bridges, strings.units), ctx, strings, metrics: catalog.metrics, derivedCopy: catalog.derived, bridges: P.bridges };
}

function deckOf(state: EngineState, locale: "fr" | "en" = "fr"): DeckModel {
  const i = inputOf(state, locale);
  return buildDeck(i.state, i.derived, i.strings, i.metrics, i.ctx, { derived: i.derivedCopy, bridges: i.bridges });
}
const slideOf = (deck: DeckModel, id: string): DeckSlide => deck.slides.find((s) => s.id === id)!;
const rowsOf = (slide: DeckSlide, row: string) => slide.lines.filter((l) => l.row === row);

/** The chain of one candidate's what-if, as the slide prints it: the sentences, in their order. */
function chainOf(state: EngineState, id: SelfServeCandidateId, target: number, locale: "fr" | "en" = "fr") {
  const i = inputOf(state, locale);
  const impact = appWhatIf(state, id, target, i.ctx, i.strings.units);
  return {
    impact,
    keys: impact?.lines.map((l) => l.key) ?? [],
    texts: impact?.lines.map((l) => chainLine(l, impact, subjectOf(id, i.strings, i.metrics), "CIBLE", i.strings, locale).text) ?? [],
  };
}

/**
 * One stage behind alone: the example's day-30 retention below its 15 % target, the subscriber conversion at its own
 * (3 %), so the diagnosis names day-30 retention instead of the two tying (`shared`, §21.9.2).
 */
function withTargets(state: EngineState, targets: Partial<Record<MetricId, number>>): EngineState {
  const alone = structuredClone(state);
  alone.snapshots[alone.snapshots.length - 1]!.targets = targets;
  return alone;
}
const d30Alone = (state = consumerState()) => withTargets(state, { "ret.d30": 15, "rev.paid-conversion": 3 });

describe("appWhatIf: the example's chain, J30 from 12 to 15 % (§21.7.2)", () => {
  it("prints the seven sentences and the year, in French, with the subscriptions' and the actives' streams", () => {
    const { keys, texts } = chainOf(consumerState(), "ret.d30", 15);
    expect(keys).toEqual(["today", "if", "then", "times", "usage-then", "usage-times", "sum", "annual"]);
    expect(texts).toEqual([
      `12${N}%, soit 360 nouveaux abonnés par mois`,
      "la rétention à J30 atteint CIBLE",
      "360 × 15/12 = 450 (+90)",
      `6,40${N}€ par abonné, soit ~580${N}€ d'abonnements ajoutés chaque mois`,
      `Et 1${N}440 nouveaux actifs × 15/12 = 1${N}800 (+360)`,
      `0,70${N}€ par actif, soit ~250${N}€ de revenu des actifs ajouté chaque mois`,
      `Soit ~830${N}€ de revenu ajouté chaque mois.`,
      `Soit ~6${N}600${N}€ de revenu de plus au bout d'un an, départs compris.`,
    ]);
  });

  it("and in English", () => {
    const { texts } = chainOf(consumerState(), "ret.d30", 15, "en");
    expect(texts).toEqual([
      "12%, i.e. 360 new subscribers a month",
      "day-30 retention reaches CIBLE",
      "360 × 15/12 = 450 (+90)",
      "€6.40 per subscriber, i.e. ~€580 of subscriptions added every month",
      "And 1,440 new actives × 15/12 = 1,800 (+360)",
      "€0.70 per active, i.e. ~€250 of revenue from actives added every month",
      "That's ~€830 of revenue added every month.",
      "That's ~€6,600 more revenue after a year, departures included.",
    ]);
  });

  it("every number recomputes from the line above it, and the headline is the sum: ~830 €, not the subscriptions' ~580 €", () => {
    const { impact } = chainOf(consumerState(), "ret.d30", 15);
    expect(impact!.appChain).toBe("subscriptions");
    expect(impact!.kind).toBe("new-mrr");
    expect(impact!.mrrPerMonth).toEqual({ lo: 90 * 6.4 + 360 * 0.7, hi: 90 * 6.4 + 360 * 0.7 });
    expect(impactHeadline(impact!).amount).toBe(`~830${N}€`);
  });

  it("the referred share's second stream grows as the referred come on top: (100 – r)/(100 – t)", () => {
    const { texts } = chainOf(consumerState(), "ref.referred-share", 10);
    expect(texts[2]).toBe("360 × (100 – 5)/(100 – 10) = 380 (+20)");
    expect(texts[4]).toBe(`Et 1${N}440 nouveaux actifs × (100 – 5)/(100 – 10) = 1${N}520 (+80)`);
  });

  it("the conversion in subscribers and the subscribers' churn are the self-serve chain on the subscriptions alone: the actives don't move", () => {
    for (const [id, target] of [["rev.paid-conversion", 4], ["ret.logo-churn", 5]] as const) {
      const { keys, impact } = chainOf(consumerState(), id, target);
      expect(impact!.appChain).toBe("subscriptions");
      expect(keys).not.toContain("usage-then");
      expect(keys).not.toContain("sum");
      expect(keys[keys.length - 1]).toBe("annual");
    }
    expect(chainOf(consumerState(), "rev.paid-conversion", 4).texts.at(-1)).toBe(`Soit ~6${N}400${N}€ de revenu de plus au bout d'un an, départs compris.`);
  });
});

describe("appWhatIf: the other chains", () => {
  it("the actives' retention: the actives kept, at the revenue per active", () => {
    const { keys, texts, impact } = chainOf(consumerState(), "app.ret.active-retention", 92);
    expect(impact!.appChain).toBe("actives-retention");
    expect(impact!.kind).toBe("retained-mrr");
    expect(keys).toEqual(["today", "if", "then", "times", "annual"]);
    expect(texts[0]).toBe(`90${N}% des actifs gardés d'un mois sur l'autre, sur 15${N}000 actifs`);
    expect(texts[2]).toBe(`15${N}000 × (92${N}% – 90${N}%) = 300 actifs gardés de plus par mois`);
    expect(texts[3]).toBe(`0,70${N}€ par actif, soit ~210${N}€ de revenu des actifs préservé chaque mois`);
    expect(texts[4]).toBe(`Soit ~1${N}700${N}€ de revenu de plus au bout d'un an, départs compris.`);
  });

  it("a flow without subscriptions is counted on the new actives, which are the month's installs still there at day 30", () => {
    const { keys, texts, impact } = chainOf(consumerUsageOnlyState(), "ret.d30", 15);
    expect(impact!.appChain).toBe("actives-flow");
    expect(keys).toEqual(["today", "if", "then", "times", "annual"]);
    expect(texts).toEqual([
      `12${N}%, soit 1${N}440 nouveaux actifs par mois`,
      "la rétention à J30 atteint CIBLE",
      `1${N}440 × 15/12 = 1${N}800 (+360)`,
      `0,70${N}€ par actif, soit ~250${N}€ de revenu des actifs ajouté chaque mois`,
      `Soit ~1${N}800${N}€ de revenu de plus au bout d'un an, départs compris.`,
    ]);
  });

  it("a ticked stream whose gain is unknown leaves the money out of the subscriptions' chain, and prices nothing on the actives'", () => {
    // No revenue per active: the usage stream can't be priced.
    const noPerActive = withEntry(withEntry(consumerState(), "app.rev.purchases-per-active", undefined), "app.rev.ads-per-active", undefined);
    const subscriptions = chainOf(noPerActive, "ret.d30", 15).impact!;
    expect(subscriptions.kind).toBe("customers");
    expect(subscriptions.lines.map((l) => l.key)).toEqual(["today", "if", "then"]);
    expect(subscriptions.mrrPerMonth).toBeUndefined();
    expect(impactHeadline(subscriptions).amount).toBeUndefined();
    const usageOnly = withEntry(withEntry(consumerUsageOnlyState(), "app.rev.purchases-per-active", undefined), "app.rev.ads-per-active", undefined);
    expect(chainOf(usageOnly, "ret.d30", 15).impact).toBeNull();
    expect(chainOf(usageOnly, "app.ret.active-retention", 92).impact).toBeNull();
  });

  it("a target that is not an improvement prices nothing, as the self-serve chain", () => {
    expect(chainOf(consumerState(), "ret.d30", 10).impact).toBeNull();
    expect(chainOf(consumerState(), "app.ret.active-retention", 88).impact).toBeNull();
    // Past 50 %, the referred share isn't priced (§19.3.2).
    expect(chainOf(consumerState(), "ref.referred-share", 60).impact).toBeNull();
  });
});

describe("less than one active: the actives' chains never say « abonné » (§21.7.2, decided 2026-10-10)", () => {
  /** Three installs a month: the day-30 flow brings fewer than one new active. */
  const fewInstalls = () => {
    const state = consumerUsageOnlyState();
    state.snapshots[0]!.base = { ...state.snapshots[0]!.base, monthSignups: 3, cohortSignups: 3 };
    return state;
  };
  /** Five actives: 2 points of retention keep fewer than one. */
  const fewActives = () => {
    const state = consumerState();
    state.snapshots[0]!.base = { ...state.snapshots[0]!.base, appActives: 5 };
    return state;
  };
  const SUBSCRIBER = /abonn|subscriber/i;
  const cases = [
    { name: "flow", state: fewInstalls, id: "ret.d30", target: 15, chain: "actives-flow", leaf: "lessThanOneActive" },
    { name: "retention", state: fewActives, id: "app.ret.active-retention", target: 92, chain: "actives-retention", leaf: "lessThanOneActiveKept" },
  ] as const;
  const SAYS = {
    fr: { lessThanOneActive: "Moins d'un actif de plus par mois.", lessThanOneActiveKept: "Moins d'un actif gardé de plus par mois." },
    en: { lessThanOneActive: "Less than one more active a month.", lessThanOneActiveKept: "Less than one more active kept a month." },
  } as const;
  const WORTH = {
    fr: { lessThanOneActive: "moins d'un actif de plus par mois", lessThanOneActiveKept: "moins d'un actif gardé de plus par mois" },
    en: { lessThanOneActive: "less than one more active a month", lessThanOneActiveKept: "less than one more active kept a month" },
  } as const;

  for (const locale of ["fr", "en"] as const) {
    for (const c of cases) {
      it(`${c.name}, in ${locale}: the chain ends on the actives' sentence and worthOf says the same, no subscriber anywhere`, () => {
        const { impact, keys, texts } = chainOf(c.state(), c.id, c.target, locale);
        expect(impact!.appChain).toBe(c.chain);
        expect(keys.at(-1)).toBe("less-than-one");
        expect(texts.at(-1)).toBe(SAYS[locale][c.leaf]);
        for (const text of texts) expect(text).not.toMatch(SUBSCRIBER);
        const worth = worthOf(impact!, inputOf(c.state(), locale).strings, locale);
        expect(worth).toBe(WORTH[locale][c.leaf]);
        expect(worth).not.toMatch(SUBSCRIBER);
      });
    }

    it(`the four leaves, in ${locale}, name an active and never a subscriber`, () => {
      const { whatIf, worth } = inputOf(consumerState(), locale).strings;
      for (const text of [whatIf.lessThanOneActive, whatIf.lessThanOneActiveKept, worth.lessThanOneActive, worth.lessThanOneActiveKept]) {
        expect(text).toMatch(/actif|active/);
        expect(text).not.toMatch(SUBSCRIBER);
      }
    });
  }

  it("the subscriptions' chain and the SaaS keep `lessThanOne`, in the template and in the worth phrase", () => {
    const w = FR.strings.whatIf;
    const line: ImpactLine = { key: "less-than-one", values: {} };
    expect(chainTemplate(line, { metric: "ret.d30", kind: "customers", appChain: "subscriptions" }, w, "fr").template).toBe(w.lessThanOne);
    expect(chainTemplate(line, { metric: "ret.d30", kind: "customers" }, w, "fr").template).toBe(w.lessThanOne);
    expect(chainTemplate(line, { metric: "ret.d30", kind: "customers", appChain: "actives-flow" }, w, "fr").template).toBe(w.lessThanOneActive);
    expect(chainTemplate(line, { metric: "app.ret.active-retention", kind: "customers", appChain: "actives-retention" }, w, "fr").template).toBe(w.lessThanOneActiveKept);
    const small = (appChain?: Impact["appChain"]): Impact => ({ metric: "ret.d30", kind: "customers", from: { lo: 12, hi: 12 }, to: 15, lines: [line], ...(appChain ? { appChain } : {}) });
    expect(worthOf(small("subscriptions"), FR.strings, "fr")).toBe(FR.strings.worth.lessThanOne);
    expect(worthOf(small(), FR.strings, "fr")).toBe(FR.strings.worth.lessThanOne);
  });
});

describe("impactHeadline reads the sum first", () => {
  const line = (key: ImpactLine["key"], amount: string): ImpactLine => ({ key, values: { amount } });
  const impact = (lines: ImpactLine[]): Impact => ({ metric: "ret.d30", kind: "new-mrr", from: { lo: 12, hi: 12 }, to: 15, lines });

  it("the title says the total of both streams when there is one, else the first money line", () => {
    expect(impactHeadline(impact([line("times", "~580"), line("sum", "~830")])).amount).toBe("~830");
    expect(impactHeadline(impact([line("times", "~580")])).amount).toBe("~580");
  });
});

describe("chainTemplate: the app's three chains (§21.7.2)", () => {
  const w = FR.strings.whatIf;
  const ofLine = (key: ImpactLine["key"], count?: number): ImpactLine => ({ key, values: {}, ...(count === undefined ? {} : { count: { lo: count, hi: count } }) });
  const template = (key: ImpactLine["key"], chain: Impact["appChain"], metric: Impact["metric"] = "ret.d30", count?: number) =>
    chainTemplate(ofLine(key, count), { metric, kind: "new-mrr", appChain: chain }, w, "fr").template;

  it("subscriptions: the self-serve sentences, then the second stream and the sum, and the app's year", () => {
    expect(template("today", "subscriptions", "ret.d30", 360)).toBe(w.todayFlow);
    expect(template("then", "subscriptions")).toBe(w.thenFlow);
    expect(template("then", "subscriptions", "ref.referred-share")).toBe(w.thenReferral);
    expect(template("times", "subscriptions")).toBe(w.timesFlow);
    expect(template("usage-then", "subscriptions")).toBe(w.usageThenFlow);
    expect(template("usage-then", "subscriptions", "ref.referred-share")).toBe(w.usageThenReferral);
    expect(template("usage-times", "subscriptions")).toBe(w.timesActivesFlow);
    expect(template("sum", "subscriptions")).toBe(w.sumApp);
    expect(template("annual", "subscriptions")).toBe(w.annualApp);
    // Churn keeps its own sentences on the subscriptions.
    expect(template("then", "subscriptions", "ret.logo-churn", 90)).toBe(w.thenChurn);
  });

  it("actives-flow: the new actives, and the singular agrees with the printed count", () => {
    expect(template("today", "actives-flow", "ret.d30", 1440)).toBe(w.todayActivesFlow);
    expect(template("today", "actives-flow", "ret.d30", 1)).toBe(w.todayActivesFlowOne);
    expect(template("then", "actives-flow")).toBe(w.thenFlow);
    expect(template("then", "actives-flow", "ref.referred-share")).toBe(w.thenReferral);
    expect(template("times", "actives-flow")).toBe(w.timesActivesFlow);
    expect(template("annual", "actives-flow")).toBe(w.annualApp);
  });

  it("actives-retention: the actives kept", () => {
    expect(template("today", "actives-retention", "app.ret.active-retention")).toBe(w.todayActives);
    expect(template("then", "actives-retention", "app.ret.active-retention", 300)).toBe(w.thenActives);
    expect(template("then", "actives-retention", "app.ret.active-retention", 1)).toBe(w.thenActivesOne);
    expect(template("times", "actives-retention", "app.ret.active-retention")).toBe(w.timesActives);
  });

  it("a line a chain has no sentence for throws, as `per-month` does for a self-serve chain; the SaaS has no second stream", () => {
    expect(() => template("usage-then", "actives-flow")).toThrow(/no usage-then/);
    expect(() => template("sum", "actives-retention")).toThrow(/no sum/);
    expect(() => template("usage-times", undefined)).toThrow(/no usage-times/);
    expect(() => template("sum", undefined)).toThrow(/no sum/);
    expect(() => template("per-month", "subscriptions")).toThrow(/per-month/);
  });

  it("the SaaS keeps its sentences: no `appChain`, no change", () => {
    expect(template("times", undefined)).toBe(w.timesFlow);
    expect(template("annual", undefined)).toBe(w.annual);
  });
});

describe("the peloton's title reads the columns the setup shows (§21.7.1)", () => {
  const titleOf = (state: EngineState, locale: "fr" | "en" = "fr") => {
    const i = inputOf(state, locale);
    return pelotonTitle(i.state, i.derived.peloton, i.strings, i.metrics, i.ctx);
  };

  it("three columns: the three clauses, as the SaaS", () => {
    const title = titleOf(consumerState());
    expect(title.key).toBe("pelotonComplete");
    expect(Object.keys(title.values).sort()).toEqual(["activated", "d30", "paid"]);
  });

  it("without subscriptions two: « Sur 100 installations, 35 atteignent la première valeur et 12 sont encore là à J30 »", () => {
    const state = consumerUsageOnlyState();
    const title = titleOf(state);
    expect(title.key).toBe("pelotonCompleteTwo");
    expect(Object.keys(title.values).sort()).toEqual(["activated", "d30"]);
    const i = inputOf(state);
    expect(renderTitle(title, i.strings)).toBe("Sur 100 installations, 35 atteignent la première valeur et **12 sont encore là à J30**.");
    const en = inputOf(state, "en");
    expect(renderTitle(titleOf(state, "en"), en.strings)).toBe("Out of 100 installs, 35 reach first value and **12 are still active at day 30**.");
  });

  it("without subscriptions an unmeasured stage is read on the same two columns: the hidden conversion never joins the unknown ones", () => {
    const state = withEntry(consumerUsageOnlyState(), "ret.d30", undefined);
    const title = titleOf(state);
    expect(["pelotonGap", "pelotonGapOne", "pelotonTailBreak", "pelotonTailBreakOne"]).toContain(title.key);
    expect(title.values.stages).not.toMatch(/abonn/);
    expect(title.values.stages).toMatch(/J30/);
  });
});

describe("the leak slide of an app (§21.7.2)", () => {
  it("names one stage alone: the title is the sum of both streams, the card is the chain with its second stream", () => {
    const deck = deckOf(d30Alone());
    const leak = slideOf(deck, "leak");
    expect(leak.title.key).toBe("leakClearMrrNew");
    expect(leak.title.values.amount).toBe(`~830${N}€`);
    expect(renderTitle(leak.title, inputOf(consumerState()).strings)).toBe(
      `Ramener la rétention à J30 à 15${N}% (cible de l'équipe) vaudrait **~830${N}€ de revenu nouveau** chaque mois.`,
    );
    expect(rowsOf(leak, "calc").map((l) => l.key)).toEqual(["today", "if", "then", "times", "usage-then", "usage-times", "sum", "annual"]);
    // The money lines of the second stream carry no label: « × revenu par abonné » would be false for an active.
    expect(rowsOf(leak, "calc").map((l) => l.label)).toEqual(["Aujourd'hui", "Si", "Alors", "× revenu par abonné", "", "", "", ""]);
  });

  it("the other candidates sit alongside in the order their rules positioned them, the actives' retention last", () => {
    const deck = deckOf(d30Alone());
    const asides = rowsOf(slideOf(deck, "leak"), "aside").map((l) => l.id);
    expect(asides).toEqual(["acq.signup-rate", "act.rate", "rev.paid-conversion", "ref.referred-share", "ret.logo-churn", "app.ret.active-retention"]);
    // Without subscriptions there is no conversion and no churn to put alongside.
    const usage = withTargets(consumerUsageOnlyState(), { "ret.d30": 12, "app.ret.active-retention": 95 });
    expect(rowsOf(slideOf(deckOf(usage), "leak"), "aside").map((l) => l.id)).toEqual(["acq.signup-rate", "act.rate", "ret.d30", "ref.referred-share"]);
  });

  it("the actives' retention named alone is priced on the actives kept", () => {
    const alone = withTargets(consumerState(), { "app.ret.active-retention": 95, "ret.d30": 12 });
    const leak = slideOf(deckOf(alone), "leak");
    expect(leak.title.key).toBe("leakClearMrrRetained");
    expect(rowsOf(leak, "calc").map((l) => l.key)).toEqual(["today", "if", "then", "times", "annual"]);
  });
});

describe("the unit-economics slide of an app (§21.7.3)", () => {
  it("five tiles in the order cost, 12-month value, 36-month value, ratio, payback; no months after payback, no cash", () => {
    const unit = slideOf(deckOf(consumerState()), "unit-economics");
    const kinds = unit.lines.map((l) => l.row);
    expect(kinds).toEqual(["cac", "value12", "ltv", "ltvCac", "payback", "retention", "assume", "cap"]);
    expect(kinds).not.toContain("after");
    expect(kinds).not.toContain("cash");
    const value = (row: string) => rowsOf(unit, row)[0]!.value;
    expect(value("cac")).toBe(`1,50${N}€`);
    expect(value("payback")).toBe(`13${N}mois`);
    expect(value("ltvCac")).toBe(`0,95${N}fois`);
    expect(rowsOf(unit, "value12")[0]!.label).toBe(`Valeur sur 12${N}mois`);
    expect(unit.title.key).toBe("unitEconomics");
  });

  it("carries the picture of an install, not a customer's: the curve, the cost, the payback, its words", () => {
    const unit = slideOf(deckOf(consumerState()), "unit-economics");
    expect(unit.paybackChart).toBeUndefined();
    const chart = unit.installChart!;
    expect(chart.story).toBe("pays-back");
    expect(chart.curve.lo).toHaveLength(37);
    expect(chart.cost).toEqual([1.5, 1.5]);
    expect(chart.payback![0]).toBeCloseTo(13.0132, 4);
    expect(chart.labels).toEqual({
      start: "0",
      end: `36${N}mois`,
      cost: "ce que coûte une installation",
      paysBack: `remboursée${N}: 13${N}mois`,
      loss: "",
    });
    expect(chart.summary).toBe(
      `Une installation, mois par mois${N}: sa marge baisse à mesure que ses utilisateurs s'en vont${N}; elle rembourse ses 1,50${N}€ à 13${N}mois.`,
    );
  });

  it("without subscriptions an install is a loss: the gap titles the slide, the picture says how short, there is no payback", () => {
    const unit = slideOf(deckOf(consumerUsageOnlyState()), "unit-economics");
    expect(unit.title.key).toBe("unitEconomicsLoss");
    const chart = unit.installChart!;
    expect(chart.story).toBe("loss");
    expect(chart.payback).toBeNull();
    expect(chart.labels.paysBack).toBe("");
    expect(chart.labels.loss).toBe(`pas remboursée en 36${N}mois, il manque ~0,91${N}€`);
    // No GRR/NRR line without subscriptions, and the payback tile says why it is empty rather than « il manque ».
    expect(rowsOf(unit, "retention")).toEqual([]);
    const payback = rowsOf(unit, "payback")[0]!;
    expect(payback.value).toBe("");
    expect(payback.note).toBe(chart.labels.loss);
  });

  it("a loss writes the picture's summary only when its sentence has its figures: no `{ltv}` or no `{gap}` leaves it out, never a hole", () => {
    const state = consumerUsageOnlyState();
    const i = inputOf(state);
    const derived = deriveEngine(state, i.ctx, null, i.bridges, i.strings.units);
    const today = scenarioOf(state, {}, i.ctx).today.kpis;
    const chartOf = (k: typeof today) => appUnitMoney({ state, k, unit: derived.unit, subscriptions: false, strings: i.strings, metrics: i.metrics, ctx: i.ctx }).chart!;
    const whole = chartOf(today);
    expect(whole.story).toBe("loss");
    expect(whole.summary).toContain(`en 36${N}mois, elle rapporte ~0,59${N}€, ~0,91${N}€ de moins que ses 1,50${N}€.`);
    for (const without of [{ ...today, ltv: null }, { ...today, loss: null }]) {
      const chart = chartOf(without);
      expect(chart.story).toBe("loss");
      expect("summary" in chart).toBe(false);
    }
  });

  it("in English", () => {
    const unit = slideOf(deckOf(consumerState(), "en"), "unit-economics");
    expect(unit.installChart!.labels).toMatchObject({ end: "36 months", cost: "what an install costs", paysBack: "paid back: 13 months" });
    expect(unit.installChart!.summary).toBe("One install, month by month: its margin falls as its users leave; it pays back its €1.50 at 13 months.");
  });

  it("the SaaS keeps its slide: six tiles' rows, no 12-month value, no picture of an install", () => {
    const state = exampleState();
    const derived = deriveEngine(state, CTX_FR, null, FR.bridges, FR.strings.units);
    const unit = slideOf(buildDeck(state, derived, FR.strings, FR.metrics, CTX_FR, { derived: FR.derived, bridges: FR.bridges }), "unit-economics");
    expect(unit.installChart).toBeUndefined();
    expect(unit.paybackChart).toBeDefined();
    expect(unit.lines.map((l) => l.row)).not.toContain("value12");
  });
});

describe("an app's what-if slides (§21.7.4)", () => {
  const withWhatIf = (state: EngineState, whatIf: Partial<Record<LeverId, number>>): EngineState => ({ ...state, whatIf });

  it("one slide per lever moved, then the two together", () => {
    const deck = deckOf(withWhatIf(consumerState(), EXAMPLE_CONSUMER_WHATIF));
    expect(deck.slides.filter((s) => s.id.startsWith("whatif:") || s.id === "scenario").map((s) => s.id)).toEqual(["whatif:ret.d30", "whatif:app.rev.commission", "scenario"]);
  });

  it("the app's rows: the cost, the 12-month value, the 36-month value, the ratio and the payback; never the cash", () => {
    const deck = deckOf(withWhatIf(consumerState(), { "ret.d30": 15 }));
    const slide = slideOf(deck, "whatif:ret.d30");
    expect(rowsOf(slide, "kpi").map((l) => l.id)).toEqual(["mrr12", "arr12", "nrr", "cac", "value12", "ltv", "ltvCac", "payback"]);
    expect(rowsOf(slide, "funnelStep").map((l) => l.id)).toEqual(["visitors", "signups", "activated", "d30", "paying"]);
    expect(rowsOf(slide, "kpi").find((l) => l.id === "value12")!.label).toBe(`Valeur d'une installation sur 12${N}mois`);
  });

  it("without subscriptions: no NRR and no new subscribers", () => {
    const deck = deckOf(withWhatIf(consumerUsageOnlyState(), { "ret.d30": 15 }));
    const slide = slideOf(deck, "whatif:ret.d30");
    expect(rowsOf(slide, "kpi").map((l) => l.id)).toEqual(["mrr12", "arr12", "cac", "value12", "ltv", "ltvCac", "payback"]);
    expect(rowsOf(slide, "funnelStep").map((l) => l.id)).toEqual(["visitors", "signups", "activated", "d30"]);
  });

  it("the commission moves no revenue: its slide is titled on the payback, in both languages", () => {
    const state = withWhatIf(consumerState(), { "app.rev.commission": 15 });
    const slide = slideOf(deckOf(state), "whatif:app.rev.commission");
    expect(slide.title.key).toBe("whatIfLeverMargin");
    expect(renderTitle(slide.title, inputOf(state).strings)).toBe(
      `Si la commission des stores passait à 15${N}% (aujourd'hui${N}: 22${N}%), une installation se rembourserait en **12${N}mois** au lieu de 13${N}mois.`,
    );
    const en = slideOf(deckOf(state, "en"), "whatif:app.rev.commission");
    expect(renderTitle(en.title, inputOf(state, "en").strings)).toBe("If the store commission went to 15% (today: 22%), an install would pay back in **12 months** instead of 13 months.");
    expect(rowsOf(slide, "kpi").find((l) => l.id === "mrr12")!.tone).toBe("stable");
  });

  it("a lever that gains revenue keeps its priced title; a commission that doesn't move the payback at the precision printed asks the question", () => {
    const state = withWhatIf(consumerState(), { "ret.d30": 15 });
    expect(slideOf(deckOf(state), "whatif:ret.d30").title.key).toBe("whatIfLever");
    const tiny = withWhatIf(consumerState(), { "app.rev.commission": 20 });
    expect(slideOf(deckOf(tiny), "whatif:app.rev.commission").title.key).toBe("whatIfLeverPlain");
  });
});

describe("the deck's frame for an app", () => {
  it("cites the tools of the numbers the app shows, the app's own included (AppsFlyer, RevenueCat)", () => {
    const deck = deckOf(consumerState());
    expect(deck.footer.tools).toContain("AppsFlyer");
    expect(deck.footer.tools).toContain("RevenueCat");
  });
});
