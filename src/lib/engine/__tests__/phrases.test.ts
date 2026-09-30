import { describe, expect, it } from "vitest";
import { METRIC_SHAPES } from "../catalog-shape";
import { deriveEngine } from "../derive";
import { comparatorOf } from "../diagnose";
import { whatIf } from "../impact";
import {
  behindSentence,
  blindSentence,
  catalogueValues,
  chainTemplate,
  churnWithoutCommonAmount,
  eventPhrase,
  fillSegments,
  isAnswerMetric,
  isSingular,
  notEnoughBelowSentence,
  notEnoughBelowValues,
  numbered,
  positionLabel,
  sideKey,
  sideText,
  sourceInSentence,
  stagePhrase,
  stampText,
  statusQuestionOf,
  staticCatalogueValues,
  subjectOf,
  unitInputsPhrase,
  unpricedSentence,
  worthOf,
} from "../phrases";
import type { Comparator, EngineState, ImpactLine, Interval } from "../types";
import { CTX_EN, CTX_FR, EN, FR } from "./props";
import { exampleState, measured, ratio, withEntry, withTarget } from "./fixtures";

// lib/engine/phrases.ts — the words that go INTO the templates. Each rule is
// here once, by itself; sentences-guard.test.ts sweeps them together over
// every sentence the engine can produce.

const tool = { kind: "tool", tool: "stripe" } as const;
const NB = " ";
const diagnosisOf = (state: EngineState, locale: "fr" | "en" = "fr") => {
  const p = locale === "fr" ? FR : EN;
  return deriveEngine(state, locale === "fr" ? CTX_FR : CTX_EN, null, p.bridges, p.strings.units).diagnosis;
};

describe("grammatical number follows the count AS PRINTED", () => {
  it("French takes the singular under 2 — 0, 1, 1,5 and « 1 à 1,5 »", () => {
    for (const hi of [0, 1, 1.5, 1.99]) expect(isSingular({ lo: 0, hi }, "fr"), String(hi)).toBe(true);
    expect(isSingular({ lo: 1, hi: 2 }, "fr")).toBe(false);
    expect(isSingular({ lo: 12, hi: 12 }, "fr")).toBe(false);
  });

  it("English only for exactly 1 — « 0.7–1 paying customers », « 1.5 customers »", () => {
    expect(isSingular({ lo: 1, hi: 1 }, "en")).toBe(true);
    for (const i of [{ lo: 0, hi: 0 }, { lo: 0.7, hi: 1 }, { lo: 1.5, hi: 1.5 }, { lo: 1, hi: 2 }]) expect(isSingular(i, "en"), JSON.stringify(i)).toBe(false);
  });

  it("numbered picks the `One` sibling, and keeps the general key when there is no count", () => {
    expect(numbered("documented", { lo: 1, hi: 1 }, "fr")).toBe("documentedOne");
    expect(numbered("documented", { lo: 11, hi: 11 }, "fr")).toBe("documented");
    expect(numbered("documented", undefined, "fr")).toBe("documented");
  });
});

describe("a stage inside a sentence is a phrase with its article", () => {
  it("subjects, never the catalogue's label", () => {
    expect(subjectOf("act.rate", FR.strings, FR.metrics)).toBe("l'activation");
    expect(subjectOf("ret.logo-churn", FR.strings, FR.metrics)).toBe("le churn logo");
    expect(subjectOf("acq.signup-rate", EN.strings, EN.metrics)).toBe("the sign-up rate");
    // Not a candidate: the name, lower-cased so it can sit mid-sentence.
    expect(subjectOf("rev.arpa", FR.strings, FR.metrics)).toBe("ARPA mensuel");
    expect(subjectOf("act.ttv", FR.strings, FR.metrics)).toBe("time-to-value médian");
  });

  it("the three peloton columns use their feminine `unmeasured` phrase (the titles agree « mesurée(s) » with it)", () => {
    expect(stagePhrase("ret.d30", FR.strings, FR.metrics)).toBe("la rétention à J30");
    expect(stagePhrase("rev.paid-conversion", FR.strings, FR.metrics)).toBe("la conversion en payant");
    expect(stagePhrase("ref.referred-share", FR.strings, FR.metrics)).toBe("la part des inscrits recommandés");
  });

  it("the inputs of a computed figure carry their article after « Il manque »", () => {
    expect(unitInputsPhrase(["rev.gross-margin"], FR.strings, FR.metrics)).toBe("la marge brute");
    expect(unitInputsPhrase(["acq.cac", "rev.arpa"], FR.strings, FR.metrics)).toBe("le CAC et l'ARPA mensuel");
    expect(unitInputsPhrase(["acq.cac", "rev.arpa", "ret.logo-churn"], EN.strings, EN.metrics)).toBe("CAC, monthly ARPA and logo churn");
  });
});

describe("the activation event is a noun phrase, the user's words quoted inside it", () => {
  it("named: « l'événement « … » », the user's own quotes not doubled", () => {
    const s = exampleState();
    expect(eventPhrase(s, FR.strings)).toBe(`l'événement «${NB}a créé un premier projet${NB}»`);
    expect(eventPhrase(s, EN.strings)).toBe('the "a créé un premier projet" event');
    const quoted = withEntry(s, "act.event", measured({ kind: "text", text: ` « Invited a teammate » ` }, { kind: "other" }));
    expect(eventPhrase(quoted, FR.strings)).toBe(`l'événement «${NB}Invited a teammate${NB}»`);
    const straight = withEntry(s, "act.event", measured({ kind: "text", text: '"created a project"' }, { kind: "other" }));
    expect(eventPhrase(straight, EN.strings)).toBe('the "created a project" event');
  });

  it("unnamed, or named with nothing but quotes: the generic phrase", () => {
    expect(eventPhrase(withEntry(exampleState(), "act.event", undefined), FR.strings)).toBe("l'événement d'activation");
    expect(eventPhrase(withEntry(exampleState(), "act.event", measured({ kind: "text", text: " «» " }, { kind: "other" })), EN.strings)).toBe("the activation event");
  });
});

describe("the catalogue's five placeholders", () => {
  it("one number of this state: « en juillet 2026 », the window, the event, the variant lower-cased", () => {
    const s = exampleState();
    expect(catalogueValues(s, "act.rate", FR.strings, FR.metrics, CTX_FR)).toEqual({
      month: "août 2026",
      cohort: "juillet 2026",
      n: "7",
      event: `l'événement «${NB}a créé un premier projet${NB}»`,
      variant: "",
    });
    expect(catalogueValues(s, "acq.cac", FR.strings, FR.metrics, CTX_FR).variant).toBe("média seul");
    expect(catalogueValues(s, "rev.paid-conversion", EN.strings, EN.metrics, CTX_EN).n).toBe("30");
  });

  it("the static page: bracketed slots, never a made-up month", () => {
    expect(staticCatalogueValues(FR.strings)).toEqual({ event: "l'événement d'activation", n: "n", cohort: "[mois de cohorte]", month: "[mois]", variant: "la variante choisie" });
  });

  it("a source mid-sentence: a tool, a role — or « une autre source », never the label « Autre »", () => {
    expect(sourceInSentence({ kind: "tool", tool: "stripe" }, FR.strings)).toBe("Stripe");
    expect(sourceInSentence({ kind: "person", role: "finance" }, FR.strings)).toBe("Finance");
    expect(sourceInSentence({ kind: "other" }, FR.strings)).toBe("une autre source");
    expect(sourceInSentence(undefined, EN.strings)).toBe("another source");
  });
});

describe("where a value sits is said physically, from the metric's direction", () => {
  // Only a team target is a comparator (C1): a point, lo === hi.
  const up: Comparator = { lo: 20, hi: 20, direction: "higher" };
  const down: Comparator = { lo: 2, hi: 2, direction: "lower" };

  it("higher-is-better: behind is under, ahead is over", () => {
    expect(sideKey("below", up)).toBe("underTarget");
    expect(sideKey("maybe-below", up)).toBe("maybeUnderTarget");
    expect(sideKey("above", up)).toBe("overTarget");
  });

  it("churn — lower is better: behind is OVER its target, ahead is under", () => {
    expect(sideKey("below", down)).toBe("overTarget");
    expect(sideKey("maybe-below", down)).toBe("maybeOverTarget");
    expect(sideKey("above", down)).toBe("underTarget");
  });

  it("at the target, and nothing to compare with", () => {
    expect(sideKey("within", down)).toBe("atTarget");
    expect(sideKey("within", up)).toBe("atTarget");
    expect(sideKey("below", undefined)).toBeNull();
    expect(sideKey("unknown", up)).toBeNull();
    expect(sideText("below", undefined, FR.strings)).toBeNull();
  });

  it("the words, mid-sentence and as a stamp — never « repère », which names nothing (C1)", () => {
    expect(sideText("below", down, FR.strings)).toBe("au-dessus de la cible");
    expect(stampText("below", down, FR.strings)).toBe("Au-dessus de la cible");
    expect(stampText("below", up, EN.strings)).toBe("Below the target");
    expect(stampText("unknown", up, EN.strings)).toBeNull();
    for (const text of Object.values(FR.strings.side)) expect(text).not.toMatch(/repère/);
    for (const text of Object.values(EN.strings.side)) expect(text).not.toMatch(/reference/);
  });

  /**
   * P7a open issue: the board's labels outside the diagnosis picked from
   * direction-blind strings, so churn behind its comparator read « Sous le
   * repère ». On the §6.0 example itself (churn 10/400 = 2,5 % against the
   * fictional team's 2 %), read through the real diagnosis rather than a
   * hand-built comparator. Non-vacuity, measured 2026-09-25: make
   * positionLabel return a direction-blind « Sous … » for "below" and this
   * test fails on its first churn assertion.
   */
  it("a position as a label: churn behind its target is ABOVE it, in both languages", () => {
    const derivedFr = deriveEngine(exampleState(), CTX_FR, null, FR.bridges, FR.strings.units);
    const churn = derivedFr.diagnosis.positions["ret.logo-churn"];
    expect(churn.position).toBe("below");
    expect(positionLabel(churn.position, churn.comparator, FR.strings)).toBe("Au-dessus de la cible");
    const derivedEn = deriveEngine(exampleState(), CTX_EN, null, EN.bridges, EN.strings.units);
    const churnEn = derivedEn.diagnosis.positions["ret.logo-churn"];
    expect(positionLabel(churnEn.position, churnEn.comparator, EN.strings)).toBe("Above the target");
    // A flow behind is still under, and the other positions take their own words.
    const act = derivedEn.diagnosis.positions["act.rate"];
    expect(positionLabel(act.position, act.comparator, EN.strings)).toBe("Below the target");
    expect(positionLabel("within", down, FR.strings)).toBe("À la cible");
    expect(positionLabel("above", down, FR.strings)).toBe("Sous la cible");
    expect(positionLabel("no-comparator", undefined, FR.strings)).toBe(FR.strings.diagnosis.noComparator);
    expect(positionLabel("unknown", down, FR.strings)).toBeNull();
  });

  it("the board's sentence under a named stage: churn « au-dessus de », a flow « sous »", () => {
    expect(behindSentence(down, `3${NB}%`, `2${NB}%`, FR.strings)).toBe(`3${NB}%, au-dessus de ta cible (2${NB}%)`);
    expect(behindSentence(down, "3%", "2%", EN.strings)).toBe("3%, above your target (2%)");
    expect(behindSentence(up, `18${NB}%`, `25${NB}%`, FR.strings)).toBe(`18${NB}%, sous ta cible (25${NB}%)`);
  });
});

describe("the diagnosis sentences", () => {
  it("blind: the list mid-sentence, never capitalised (« pour la rétention à J30 », not « pour La »)", () => {
    expect(blindSentence(["ret.d30"], FR.strings, FR.metrics)).toBe("Sans chiffre pour la rétention à J30, l'étape qui freine vraiment peut s'y cacher.");
    // « s'y » has no gender: the list mixes a masculine and a feminine subject.
    expect(blindSentence(["ret.d30", "ret.logo-churn"], FR.strings, FR.metrics)).toBe(
      "Sans chiffre pour la rétention à J30 et le churn logo, l'étape qui freine vraiment peut s'y cacher.",
    );
    expect(blindSentence(["ret.d30", "ret.logo-churn"], EN.strings, EN.metrics)).toBe(
      "With no number for day-30 retention and logo churn, the stage really holding the engine back may be hiding in one of them.",
    );
    expect(blindSentence([], FR.strings, FR.metrics)).toBeNull();
  });

  it("not enough targets: which stage, and WHERE it sits — « sous la cible »", () => {
    const noChurn = withEntry(exampleState(), "ret.logo-churn", undefined);
    expect(notEnoughBelowValues(diagnosisOf(noChurn), FR.strings, FR.metrics)).toEqual({ stage: "L'activation", side: "sous la cible" });
    expect(notEnoughBelowSentence(diagnosisOf(withTarget(noChurn, "act.rate", 25)), FR.strings, FR.metrics)).toBe(
      "L'activation est sous la cible. Sans cible sur les autres étapes, impossible de dire si c'est la plus grosse fuite.",
    );
    expect(notEnoughBelowSentence(diagnosisOf(exampleState()), FR.strings, FR.metrics)).toBeNull();
  });

  it("churn with no amount in common is said once — in `noArpa`, not also in the unpriced list", () => {
    const noArpa = diagnosisOf(withEntry(exampleState(), "rev.arpa", undefined));
    expect(churnWithoutCommonAmount(noArpa)).toBe(true);
    expect(unpricedSentence(noArpa, FR.strings, FR.metrics)).toBeNull();
    expect(churnWithoutCommonAmount(diagnosisOf(exampleState()))).toBe(false);
  });

  it("the unpriced ones after the colon, as labels", () => {
    // Referred share behind a team target: behind, and never priced in v1.
    const d = diagnosisOf(withTarget(exampleState(), "ref.referred-share", 10));
    expect(unpricedSentence(d, FR.strings, FR.metrics)).toBe(`Aussi en retard, sans montant calculable${NB}: Part des inscrits recommandés`);
  });
});

describe("what a gap is worth — read from the same chain the calculation prints", () => {
  const impactOf = (state: EngineState, id: "act.rate" | "ret.logo-churn", ctx = CTX_FR) =>
    whatIf(state, id, comparatorOf(state, id)!.lo, ctx, (ctx.locale === "fr" ? FR : EN).strings.units)!;

  it("an amount: new or retained MRR", () => {
    expect(worthOf(impactOf(exampleState(), "act.rate"), FR.strings, "fr")).toBe(`~600${NB}€ de MRR nouveau par mois`);
    expect(worthOf(impactOf(exampleState(), "ret.logo-churn"), FR.strings, "fr")).toBe(`~240${NB}€ de MRR préservé par mois`);
  });

  it("without ARPA: customers, and for churn customers KEPT, in the number printed", () => {
    const noArpa = withEntry(exampleState(), "rev.arpa", undefined);
    expect(worthOf(impactOf(noArpa, "act.rate"), FR.strings, "fr")).toBe("5 clients payants de plus par mois");
    expect(worthOf(impactOf(noArpa, "ret.logo-churn"), FR.strings, "fr")).toBe("2 clients gardés par mois");
    const tenPayers = withEntry(noArpa, "acq.cac", measured(ratio(5_000, 10), tool));
    expect(worthOf(impactOf(tenPayers, "act.rate"), FR.strings, "fr")).toBe("1 client payant de plus par mois");
  });

  it("per 100 sign-ups when there is no monthly volume — never « par mois »", () => {
    let s = withEntry(exampleState(), "acq.cac", measured({ kind: "amount", amount: 500 }, tool));
    s = withEntry(s, "acq.signup-rate", measured({ kind: "rate", percent: 3.2 }));
    expect(worthOf(impactOf(s, "act.rate"), FR.strings, "fr")).toBe("0,7 à 1 payant de plus pour 100 inscrits");
    expect(worthOf(impactOf(s, "act.rate", CTX_EN), EN.strings, "en")).toBe("0.7–1 more paying customers per 100 sign-ups");
  });

  it("less than one: its own phrase, no number", () => {
    // Three new payers a month: 3 × 20/18 = 3,3 — the gain rounds under one customer.
    const threePayers = withEntry(withEntry(exampleState(), "rev.arpa", undefined), "acq.cac", measured(ratio(1_500, 3), tool));
    const small = whatIf(threePayers, "act.rate", 20, CTX_FR, FR.strings.units)!;
    expect(small.lines.some((l) => l.key === "less-than-one")).toBe(true);
    expect(worthOf(small, FR.strings, "fr")).toBe("moins d'un client de plus par mois");
  });
});

describe("the chain's sentences", () => {
  const w = FR.strings.whatIf;
  const line = (key: ImpactLine["key"], count?: { lo: number; hi: number }): ImpactLine => ({ key, values: {}, ...(count ? { count } : {}) });

  it("churn counts customers kept; a flow with no volume reads per 100 sign-ups; the noun agrees", () => {
    expect(chainTemplate(line("today"), { metric: "ret.logo-churn", kind: "retained-mrr" }, w, "fr").template).toBe(w.todayChurn);
    expect(chainTemplate(line("then", { lo: 1, hi: 1 }), { metric: "ret.logo-churn", kind: "customers" }, w, "fr").template).toBe(w.thenChurnOne);
    expect(chainTemplate(line("today", { lo: 6, hi: 9 }), { metric: "act.rate", kind: "per-hundred" }, w, "fr").template).toBe(w.todayPerHundred);
    expect(chainTemplate(line("today", { lo: 1, hi: 1 }), { metric: "act.rate", kind: "new-mrr" }, w, "fr").template).toBe(w.todayFlowOne);
    expect(chainTemplate(line("annual"), { metric: "act.rate", kind: "new-mrr" }, w, "fr")).toEqual({ label: null, template: w.annual });
  });
});

describe("templates of « · »-separated segments", () => {
  it("drops a segment whose value is empty — separator included; keeps the others filled", () => {
    const t = "Inscrits en {cohort} · flux : {month} · sources : {tools}";
    expect(fillSegments(t, { cohort: "juillet 2026", month: "août 2026", tools: "" })).toBe("Inscrits en juillet 2026 · flux : août 2026");
    expect(fillSegments(t, { cohort: "juillet 2026", month: "août 2026", tools: "GA4" })).toBe("Inscrits en juillet 2026 · flux : août 2026 · sources : GA4");
    // A blank value is empty too, and a segment without placeholders always stays.
    expect(fillSegments("Toutes choses égales · {a} · {b}", { a: "  ", b: "x" })).toBe("Toutes choses égales · x");
  });
});

/**
 * Three of the fifteen are not numbers (Antoine, 2026-09-26: « Où en es-tu avec
 * ce chiffre ? » was asked of the activation event). The sheet's status
 * question, the step's eyebrow, the triage and the copied request all ask
 * `isAnswerMetric` before saying « chiffre ».
 */
describe("isAnswerMetric / statusQuestionOf — an answer is not « ce chiffre »", () => {
  const ANSWERS = ["act.event", "ret.churn-cause", "ref.mechanism"];

  it("names exactly the three metrics whose value is words or a choice", () => {
    expect(METRIC_SHAPES.filter((s) => isAnswerMetric(s.id)).map((s) => s.id)).toEqual(ANSWERS);
    // And it reads the shape, not a list: every one of them is text or choice, nothing else is.
    for (const s of METRIC_SHAPES) expect(isAnswerMetric(s.id), s.id).toBe(s.unit === "text" || s.unit === "choice");
  });

  it("an answer is asked where you are « on this point », a number where you are « with this number »", () => {
    for (const p of [FR, EN]) {
      for (const s of METRIC_SHAPES) {
        const question = statusQuestionOf(s.id, p.strings);
        if (ANSWERS.includes(s.id)) {
          expect(question, s.id).toBe(p.strings.sheet.statusQuestionAnswer);
          expect(question, s.id).not.toMatch(/chiffre|number/i);
        } else {
          expect(question, s.id).toBe(p.strings.sheet.statusQuestion);
        }
      }
    }
    // The two questions are different sentences in both languages — otherwise the choice above proves nothing.
    expect(FR.strings.sheet.statusQuestionAnswer).not.toBe(FR.strings.sheet.statusQuestion);
    expect(EN.strings.sheet.statusQuestionAnswer).not.toBe(EN.strings.sheet.statusQuestion);
  });

  it("the step-by-step eyebrow for an answer does not call it a number either", () => {
    expect(FR.strings.steps.answerOf).not.toMatch(/chiffre/i);
    expect(EN.strings.steps.answerOf).not.toMatch(/number/i);
  });
});

describe("chainTemplate — which sentence a line of the chain is printed with", () => {
  // Moved from the retired « Et si » drawer (visual-model.ts#whatIfTemplate, a pass-through), 2026-09-26.
  // Each template is its own key name, so the assertion names the mapping itself.
  const words = Object.fromEntries(
    [
      "today",
      "if",
      "then",
      "times",
      "todayFlow",
      "todayFlowOne",
      "todayPerHundred",
      "todayPerHundredOne",
      "ifFlow",
      "thenFlow",
      "timesFlow",
      "todayChurn",
      "thenChurn",
      "thenChurnOne",
      "timesChurn",
      "annual",
      "lessThanOne",
    ].map((k) => [k, k]),
  ) as unknown as typeof FR.strings.whatIf;
  const line = (key: ImpactLine["key"], count?: Interval): ImpactLine => ({ key, values: {}, ...(count ? { count } : {}) });
  const flow = { metric: "act.rate", kind: "new-mrr" } as const;
  const churn = { metric: "ret.logo-churn", kind: "retained-mrr" } as const;
  const many: Interval = { lo: 12, hi: 12 };

  it("a flow metric uses the flow sentences, with a label on every step", () => {
    expect(chainTemplate(line("today", many), flow, words, "en")).toEqual({ label: "today", template: "todayFlow" });
    expect(chainTemplate(line("if"), flow, words, "en")).toEqual({ label: "if", template: "ifFlow" });
    expect(chainTemplate(line("then"), flow, words, "en")).toEqual({ label: "then", template: "thenFlow" });
    expect(chainTemplate(line("times"), flow, words, "en")).toEqual({ label: "times", template: "timesFlow" });
  });

  it("churn has its own sentences (the chain counts customers kept, not added)", () => {
    expect(chainTemplate(line("today"), churn, words, "en").template).toBe("todayChurn");
    expect(chainTemplate(line("then", many), churn, words, "en").template).toBe("thenChurn");
    expect(chainTemplate(line("times"), churn, words, "en").template).toBe("timesChurn");
  });

  it("a chain with no monthly volume is read per 100 sign-ups — « par mois » would be false", () => {
    expect(chainTemplate(line("today", many), { metric: "act.rate", kind: "per-hundred" }, words, "fr").template).toBe(
      "todayPerHundred",
    );
  });

  it("a noun agrees with the count the line prints: French singular under 2, English only for exactly 1", () => {
    const oneAndAHalf: Interval = { lo: 1.5, hi: 1.5 };
    expect(chainTemplate(line("today", oneAndAHalf), flow, words, "fr").template).toBe("todayFlowOne");
    expect(chainTemplate(line("today", oneAndAHalf), flow, words, "en").template).toBe("todayFlow");
    expect(chainTemplate(line("then", { lo: 1, hi: 1 }), churn, words, "en").template).toBe("thenChurnOne");
  });

  it("the annual line and « less than one » conclude the chain: no step label", () => {
    expect(chainTemplate(line("annual"), churn, words, "en")).toEqual({ label: null, template: "annual" });
    expect(chainTemplate(line("less-than-one"), flow, words, "en")).toEqual({
      label: null,
      template: "lessThanOne",
    });
  });
});
