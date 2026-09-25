import { describe, expect, it } from "vitest";
import { deriveEngine } from "../derive";
import { findingText, sanityText } from "../sentences";
import type { EngineState, Finding, FindingKind, MetricEntry, SanityCheck, SanityId } from "../types";
import { CTX_EN, CTX_FR, EN, FR } from "./props";
import { exampleState, measured, ratio, tourResult, withEntry, withTarget } from "./fixtures";

// lib/engine/sentences.ts — the finished sentence of a finding and of a
// sanity check. One case per kind and per id, read through the real copy,
// in both languages where the two differ in more than words.

const NB = " ";
const stripe = { kind: "tool", tool: "stripe" } as const;
const props = { fr: { ...FR, ctx: CTX_FR }, en: { ...EN, ctx: CTX_EN } };

function derived(state: EngineState, locale: "fr" | "en" = "fr", result: ReturnType<typeof tourResult> | null = null) {
  const p = props[locale];
  return deriveEngine(state, p.ctx, result, p.bridges, p.strings.units);
}
function sentence(state: EngineState, kind: FindingKind, locale: "fr" | "en" = "fr", result: ReturnType<typeof tourResult> | null = null, nth = 0): string {
  const p = props[locale];
  const found = derived(state, locale, result).findings.filter((f) => f.kind === kind);
  const finding = found[nth];
  if (!finding) throw new Error(`no ${kind} finding in this state`);
  return findingText(finding, state, p.strings, p.metrics, p.derived, locale);
}
function check(state: EngineState, id: SanityId, locale: "fr" | "en" = "fr"): string {
  const p = props[locale];
  const c = derived(state, locale).sanity.find((x) => x.id === id);
  if (!c) throw new Error(`no ${id} check in this state`);
  return sanityText(c, p.strings, locale);
}

describe("findingText — one sentence per kind", () => {
  it("chain-break: the column's own verb, and « atteignent la première valeur » when it is the EVENT that is missing", () => {
    expect(sentence(exampleState(), "chain-break")).toBe("Sur 100 inscrits, on ne sait pas dire combien sont encore là à J30.");
    // Nobody can count activations of an action nobody has named: the break is said once, with the rate's verb.
    const noEvent = withEntry(withEntry(exampleState(), "act.event", { status: "missing", missing: { cause: "not-tracked", repair: "meeting" }, updatedAt: "x" }), "act.rate", undefined);
    expect(sentence(noEvent, "chain-break", "en")).toBe("Out of 100 sign-ups, we can't say how many reach first value.");
  });

  it("no-definition, with the number's label opening the line", () => {
    expect(sentence(exampleState(), "no-definition")).toBe(
      `Cause principale de churn${NB}: pas de définition partagée. Tout chiffre qu'on en donnerait serait l'opinion de quelqu'un.`,
    );
  });

  it("below-comparator: a flow is « sous », churn — lower is better — is « au-dessus de »", () => {
    expect(sentence(exampleState(), "below-comparator")).toBe(`Taux d'activation${NB}: 18${NB}%, sous 20 à 40${NB}%.`);
    // Churn alone behind its reference: activation within, so churn is the one named.
    const churnNamed = withEntry(exampleState(), "act.rate", measured(ratio(200, 800), { kind: "tool", tool: "amplitude" }));
    expect(sentence(churnNamed, "below-comparator")).toBe(`Churn logo mensuel${NB}: 2,5${NB}%, au-dessus de 1 à 2${NB}%.`);
    expect(sentence(withTarget(churnNamed, "ret.logo-churn", 2), "below-comparator", "en")).toBe("Monthly logo churn: 2.5%, above 2%.");
  });

  it("conflict: each source named mid-sentence — « une autre source », never the label « Autre »", () => {
    const entry: MetricEntry = {
      status: "conflicting",
      conflict: { a: { value: ratio(144, 800), source: { kind: "tool", tool: "amplitude" } }, b: { value: ratio(160, 800), source: { kind: "other" } } },
      updatedAt: "x",
    };
    const s = withEntry(exampleState(), "act.rate", entry);
    expect(sentence(s, "conflict")).toBe(`Taux d'activation${NB}: 18${NB}% selon Amplitude, 20${NB}% selon une autre source.`);
    expect(sentence(s, "conflict", "en")).toBe("Activation rate: 18% according to Amplitude, 20% according to another source.");
  });

  it("unit economics: the missing inputs with their article after « Il manque »", () => {
    expect(sentence(exampleState(), "unit-econ-uncomputable")).toBe(
      "Impossible de dire en combien de mois un client rembourse son coût d'acquisition. Il manque la marge brute.",
    );
    expect(sentence(exampleState(), "unit-econ-uncomputable", "en")).toBe(
      "We can't say how many months a customer takes to pay back their acquisition cost. Missing: gross margin.",
    );
  });

  it("reconcile-gap: « nouveaux payants », and « nouveau payant » when the chain predicts one", () => {
    const fewBilled = withEntry(exampleState(), "acq.cac", measured(ratio(21_000, 10), { kind: "person", role: "finance" }));
    expect(sentence(fewBilled, "reconcile-gap")).toBe(
      `Ta chaîne prédit ~49 à 74 nouveaux payants en août 2026${NB}; ta facturation en compte 10. Au moins une définition ne porte pas sur la même population.`,
    );
    // Fifteen sign-ups × 6 à 9 % = 0,9 à 1,35: the count prints « 1 ».
    const oneSignupWave = withEntry(exampleState(), "acq.signup-rate", measured(ratio(15, 26_000)));
    expect(sentence(oneSignupWave, "reconcile-gap")).toMatch(/^Ta chaîne prédit ~1 nouveau payant en août 2026/);
    expect(sentence(oneSignupWave, "reconcile-gap", "en")).toMatch(/^Your chain predicts ~1 new paying customer in August 2026;/);
  });

  it("small-cohort", () => {
    expect(sentence(withEntry(exampleState(), "act.rate", measured(ratio(14, 80))), "small-cohort", "en")).toBe(
      "Fewer than 100 sign-ups in the cohort: each one weighs more than a percentage point.",
    );
  });

  it("the Tour bridge: a blind spot names a computed figure by its own name; hidden knowledge the number's", () => {
    const linked: EngineState = { ...exampleState(), tourLink: { resultId: tourResult({}).id, linkedAt: "x" } };
    // rev-2 at 20 points (declared tracked), the payback uncomputable; acq-3 at 0 points, the CAC found.
    const result = tourResult({ "rev-2": 0, "acq-3": 2, "ret-1": 0 });
    const blind = derived(linked, "fr", result).findings.filter((f) => f.kind === "blind-spot").map((f) => findingText(f, linked, FR.strings, FR.metrics, FR.derived, "fr"));
    expect(blind).toContain(`Rétention à J30${NB}: le Tour dit que ce chiffre est suivi, mais on n'a pas pu le sortir.`);
    expect(blind.some((t) => t.startsWith("CAC payback") || t.startsWith("LTV"))).toBe(true);
    expect(sentence(linked, "hidden-knowledge", "fr", result)).toBe(`CAC${NB}: ton Tour disait que ce chiffre n'était pas suivi, et tu l'as pourtant trouvé.`);
  });

  it("names a number it has no prose for loudly, rather than printing its id", () => {
    const f: Finding = { kind: "no-definition", rank: 2, metrics: ["rev.ltv"], values: {} };
    expect(() => findingText(f, exampleState(), FR.strings, FR.metrics, [], "fr")).toThrow(/rev\.ltv/);
  });
});

describe("sanityText — one message per check", () => {
  it("num-gt-den quotes its two counts", () => {
    const c: SanityCheck = { id: "num-gt-den", blocking: true, metrics: ["act.rate"], values: { num: "900", den: "800" } };
    expect(sanityText(c, FR.strings, "fr")).toBe(`Le premier compte (900) dépasse le second (800)${NB}: l'un des deux n'est pas le bon.`);
    expect(check(withEntry(exampleState(), "act.rate", measured(ratio(900, 800))), "num-gt-den", "en")).toBe(
      "The first count (900) is larger than the second (800): one of the two isn't the right one.",
    );
  });

  it("the column order, churn, margin, the mean, the cohorts", () => {
    const d30Above = withEntry(exampleState(), "ret.d30", measured(ratio(200, 800)));
    expect(check(d30Above, "retained-gt-activated")).toMatch(/^Plus d'actifs à J30 que d'activés/);
    const paidAbove = withEntry(withEntry(exampleState(), "ret.d30", measured(ratio(40, 800))), "rev.paid-conversion", measured(ratio(80, 800)));
    expect(check(paidAbove, "paid-gt-retained", "en")).toMatch(/^More paying customers than users active at day 30/);
    expect(check(withEntry(exampleState(), "ret.logo-churn", measured(ratio(140, 400), stripe)), "churn-high")).toBe("C'est bien un churn mensuel, et pas annuel ?");
    expect(check(withEntry(exampleState(), "rev.gross-margin", measured(ratio(99, 100), stripe)), "margin-odd", "en")).toBe("Check what's counted in direct costs.");
    const mean: MetricEntry = { status: "estimated", estimate: { low: 1, high: 3, basis: "team-hunch" }, variant: "mean", updatedAt: "x" };
    expect(check(withEntry(exampleState(), "act.ttv", mean), "ttv-mean", "en")).toBe("An average drops when stragglers give up: use the median.");
    const otherCohort = withEntry(exampleState(), "act.rate", measured(ratio(144, 800), { kind: "tool", tool: "amplitude" }, { cohortMonth: "2026-06" }));
    expect(check(otherCohort, "cohort-mismatch")).toBe("Les colonnes du peloton ne portent pas sur la même cohorte.");
  });

  it("reconcile-gap agrees with the predicted count, as printed", () => {
    const one = withEntry(exampleState(), "acq.signup-rate", measured(ratio(15, 26_000)));
    expect(check(one, "reconcile-gap")).toMatch(/^Ta chaîne prédit ~1 nouveau payant /);
    const many = withEntry(exampleState(), "acq.cac", measured(ratio(21_000, 10), { kind: "person", role: "finance" }));
    expect(check(many, "reconcile-gap", "en")).toMatch(/^Your chain predicts ~49–74 new paying customers /);
  });
});
