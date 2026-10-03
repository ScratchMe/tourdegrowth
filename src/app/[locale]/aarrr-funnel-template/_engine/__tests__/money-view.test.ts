import { describe, expect, it } from "vitest";
import { deriveEngine } from "@/lib/engine/derive";
import type { EngineState } from "@/lib/engine/types";
import { estimated, exampleState, filmState, hybridState, measured, ratio, withEntry } from "@/lib/engine/__tests__/fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "@/lib/engine/__tests__/props";
import { moneyView } from "../money-view";

/**
 * The money on the board (design system extension 09, A20.d T2), its four
 * states and the warning, in both languages — the view model the block
 * prints, so its rules are tested rather than eyeballed.
 *
 * Non-vacuity, measured on 2026-10-03: printing the LTV as a fact (no « ~ »)
 * fails « the film's SaaS »; dropping the no-margin note fails « no margin »;
 * showing the healthy line on a maybe fails « churn estimated ».
 */
const N = " ";
const viewFr = (state: EngineState, motion: "plg" | "slg" = "plg", hybrid = false) =>
  moneyView({ state, derived: deriveEngine(state, CTX_FR, null, FR.bridges, FR.strings.units), ctx: CTX_FR, strings: FR.strings, metrics: FR.metrics }, motion, hybrid);
const viewEn = (state: EngineState, motion: "plg" | "slg" = "plg") =>
  moneyView({ state, derived: deriveEngine(state, CTX_EN, null, EN.bridges, EN.strings.units), ctx: CTX_EN, strings: EN.strings, metrics: EN.metrics }, motion);

describe("the money block — the film's SaaS, a certain loss", () => {
  const m = viewFr(filmState());

  it("the MRR and its ARR, facts to the unit", () => {
    expect(m.eyebrow).toBe("L'argent · août 2026");
    expect(m.figures).toEqual([
      { key: "mrr", label: "MRR", value: `48${N}000${N}€` },
      { key: "arr", label: "ARR, le MRR × 12", value: `576${N}000${N}€` },
    ]);
  });

  it("the loss, said once in the finding's own sentence, an ink tag, the bars and its months", () => {
    expect(m.worth.tag).toEqual({ label: "Perte", maybe: false });
    expect(m.worth.finding).toBe(`Chaque nouveau client coûte 1${N}900${N}€ et rapporte ~1${N}500${N}€ de marge${N}: tu perds ~400${N}€ sur chacun.`);
    expect(m.worth.bars?.gap).toEqual({ label: `il manque ~400${N}€`, kind: "short" });
    expect(m.worth.bars?.cost.value).toBe(`1${N}900${N}€`);
    expect(m.worth.bars?.brings.value).toBe(`~1${N}500${N}€`);
    expect(m.worth.months).toBe(`Un client reste ~17${N}mois${N}; rembourser son coût en prendrait 21${N}mois${N}: il part avant.`);
    expect(m.worth.monthsTerm).toBe(false);
  });

  it("the cash: the month's spend to the unit, what it ties up as an estimate, and it does not all come back; no warning with the loss", () => {
    expect(m.cash.spend.value).toBe(`93${N}480${N}€`);
    expect(m.cash.tied.value).toBe(`~990${N}000${N}€`);
    expect(m.cash.line).toBe(FR.strings.money.lineLoss);
    expect(m.cash.assumptions).toBe(FR.strings.money.assumePlg);
    expect(m.cash.warning).toBeNull();
  });

  it("in English, the euro before the figure", () => {
    const en = viewEn(filmState());
    expect(en.worth.finding).toBe("Each new customer costs €1,900 and brings back ~€1,500 of margin: you lose ~€400 on each one.");
    expect(en.worth.tag?.label).toBe("Loss");
  });
});

describe("the money block — the other states", () => {
  it("a healthy customer: no tag, « more », its months after payback with their « ? », and the cash comes back", () => {
    const m = viewFr(withEntry(filmState(), "ret.logo-churn", measured(ratio(8, 400)))); // churn 2 %: 36 months of life
    expect(m.worth.tag).toBeNull();
    expect(m.worth.finding).toBe(`Chaque nouveau client coûte 1${N}900${N}€ et rapporte ~3${N}200${N}€ de marge${N}: ~1${N}300${N}€ de plus que ce qu'il coûte.`);
    expect(m.worth.bars?.gap?.kind).toBe("more");
    expect(m.worth.monthsTerm).toBe(true);
    expect(m.cash.line).toBe(FR.strings.money.lineHealthy);
  });

  it("churn estimated at 4 to 6 %: « maybe », dashed, the ranges overlap, and where they come from", () => {
    const m = viewFr(withEntry(filmState(), "ret.logo-churn", estimated(4, 6)));
    expect(m.worth.tag).toEqual({ label: "Perte possible", maybe: true });
    expect(m.worth.bars?.gap).toEqual({ label: FR.strings.money.overlap, kind: "maybe" });
    expect(m.worth.note).toBe(FR.strings.money.maybeWhy);
    expect(m.cash.line).toBe(FR.strings.money.lineMaybe);
  });

  it("no margin (the §6.0 example): « ? », what is missing, why nothing is computed on revenue — and the spend still known", () => {
    const m = viewFr(exampleState());
    expect(m.worth.tag).toBeNull();
    expect(m.worth.finding).toBe(`On ne peut pas encore dire ce que rapporte un nouveau client${N}: il manque la marge brute.`);
    expect(m.worth.bars?.brings).toMatchObject({ value: "?", amount: null, unknown: "il manque la marge brute" });
    expect(m.worth.note).toBe(FR.strings.money.noMarginNote);
    expect(m.cash.tied).toEqual({ label: FR.strings.money.tied, value: null, missing: "il manque la marge brute" });
    expect(m.cash.spend.value).not.toBeNull();
    expect(m.cash.line).toBe(FR.strings.money.lineNone);
    expect(m.cash.assumptions).toBeNull();
  });

  it("the hybrid: no MRR and ARR of the engine's own, the total band says the sum", () => {
    expect(viewFr(hybridState(), "plg", true).figures).toBeNull();
  });
});

describe("the money block — the warning (C49)", () => {
  it("no runway: a payback of 33 months warns against the 30-month floor, and says where to type a runway", () => {
    let state = withEntry(filmState(), "acq.cac", measured({ kind: "amount", amount: 3_000 }));
    state = withEntry(state, "ret.logo-churn", measured(ratio(8, 400)));
    const m = viewFr(state);
    expect(m.cash.warning).toEqual({ text: `Rembourser un client prend 33${N}mois${N}: 30${N}mois ou plus. Tu gagnes de l'argent, mais tard. Saisis ton runway dans les Réglages pour y comparer ton payback.`, maybe: false });
  });

  it("a runway typed: longer than it warns, in its own words", () => {
    const base = withEntry(filmState(), "ret.logo-churn", measured(ratio(8, 400)));
    const state: EngineState = { ...base, setup: { ...base.setup, runwayMonths: 9 } };
    expect(viewFr(state).cash.warning?.text).toBe(
      `Rembourser un client prend 21${N}mois, plus que ton runway (9${N}mois)${N}: tu gagnes de l'argent, mais peut-être après la fin de ta trésorerie.`,
    );
    expect(viewEn(state).cash.warning?.text).toBe("Paying back a customer takes 21 months, longer than your runway (9 months): you make money, but maybe after your cash runs out.");
  });
});
