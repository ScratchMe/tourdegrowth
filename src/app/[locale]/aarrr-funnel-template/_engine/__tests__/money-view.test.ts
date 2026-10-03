import { describe, expect, it } from "vitest";
import { deriveEngine } from "@/lib/engine/derive";
import type { EngineState, LeverId } from "@/lib/engine/types";
import { estimated, filmState, hybridState, measured, noMarginState, ratio, salesAssistedState, withEntry } from "@/lib/engine/__tests__/fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "@/lib/engine/__tests__/props";
import { leverMoneyView, moneyView } from "../money-view";

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
    const m = viewFr(noMarginState());
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

describe("« Et si ? »: the card's money (A20.d T3.a)", () => {
  const card = (state: EngineState, targets: Partial<Record<LeverId, number>>, lever: LeverId, motion: "plg" | "slg" = "plg", hybrid = false) =>
    leverMoneyView(
      { state, derived: deriveEngine(state, CTX_FR, null, FR.bridges, FR.strings.units), ctx: CTX_FR, strings: FR.strings, metrics: FR.metrics },
      motion,
      targets,
      lever,
      hybrid,
    );
  const nb = (s: string) => s.replace(/\^/g, N);

  it("untouched: today's pace alone, from the MRR to the MRR in twelve months; the ARR in twelve months; nothing on one customer", () => {
    const m = card(filmState(), {}, "ret.logo-churn");
    expect(m.curve!.today).toHaveLength(13);
    expect(m.curve!.today[0]).toEqual([48_000, 48_000]);
    expect(m.curve!.whatif).toBeNull();
    expect(m.curve!.start).toBe(nb("48^000^€ aujourd'hui"));
    expect(m.curve!.xLabels).toEqual(["août 2026", "février 2027", "août 2027"]);
    expect(m.curve!.summary).toBe(nb("Le MRR mois par mois, de 48^000^€ aujourd'hui à ~80^000^€ dans 12^mois au rythme actuel."));
    expect(m.arr12).toEqual({ label: nb("ARR dans 12^mois"), value: nb("~960^000^€"), today: null, unknown: false });
    expect(m.worth).toBeNull();
    expect(m.total).toBeNull();
  });

  it("churn 6 → 4 %, the film's: the what-ifs' line, « today » under the ARR, and the loss gone in the return's own words", () => {
    const m = card(filmState(), { "ret.logo-churn": 4 }, "ret.logo-churn");
    expect(m.curve!.whatif![12]![0]).toBeCloseTo(93_556, 0);
    expect(m.curve!.summary).toContain(nb("~94^000^€ avec tes «^Et si^»"));
    expect(m.arr12.value).toBe(nb("~1^100^000^€"));
    expect(m.arr12.today).toBe(nb("aujourd'hui ~960^000^€"));
    // The CAC didn't move: it prints as typed.
    expect(m.worth).toBe(nb("Un nouveau client^: plus de perte. Il rapporte ~2^300^€ pour 1^900^€^: ~350^€ de plus."));
  });

  it("expansion moves neither the LTV nor the CAC: still the loss — « this lever » when the card's alone moved, « your what-ifs » otherwise", () => {
    expect(card(filmState(), { "rev.expansion": 3 }, "rev.expansion").worth).toBe(
      nb("Un nouveau client^: toujours une perte de ~400^€. Ce levier ne change ni ce que rapporte un client ni ce qu'il coûte."),
    );
    expect(card(filmState(), { "rev.expansion": 3 }, "ret.logo-churn").worth).toContain("Tes «");
  });

  it("activation 18 → 20 %: the CAC falls (the same spend), the loss shrinks and says by how much; at 24 % it is gone, the CAC an estimate", () => {
    expect(card(filmState(), { "act.rate": 20 }, "act.rate").worth).toBe(nb("Un nouveau client^: toujours une perte, de ~210^€ au lieu de ~400^€."));
    expect(card(filmState(), { "act.rate": 24 }, "act.rate").worth).toBe(nb("Un nouveau client^: plus de perte. Il rapporte ~1^500^€ pour ~1^400^€^: ~75^€ de plus."));
  });

  it("no loss today (churn at 4 %: ~2 300 € for 1 900 €): no line, whatever moves", () => {
    const healthy = withEntry(filmState(), "ret.logo-churn", measured(ratio(16, 400)));
    expect(card(healthy, { "act.rate": 24 }, "act.rate").worth).toBeNull();
    expect(card(healthy, { "rev.expansion": 3 }, "rev.expansion").worth).toBeNull();
  });

  it("sales-assisted with annual contracts: a straight line, and why", () => {
    const m = card(salesAssistedState(), {}, "slg.ret.renewal" as LeverId, "slg");
    expect(m.curve!.today[0]).toEqual([180_000, 180_000]);
    expect(m.worth).toBe(nb("Les contrats annuels arrivent à renouvellement régulièrement dans l'année^: la base avance en ligne droite."));
  });

  it("sales-assisted with no renewal known: the calculation counts annual contracts, and says it assumes them", () => {
    const m = card(withEntry(salesAssistedState(), "slg.ret.renewal", undefined), {}, "slg.rev.win-rate" as LeverId, "slg");
    expect(m.curve).not.toBeNull();
    expect(m.worth).toBe(nb("Sans durée de contrat connue, le calcul compte des contrats annuels, renouvelés régulièrement dans l'année^: la base avance en ligne droite."));
  });

  it("the hybrid, once moved: both engines' MRR in twelve months — the sum, never per engine; nothing untouched", () => {
    expect(card(hybridState(), {}, "act.rate", "plg", true).total).toBeNull();
    const m = card(hybridState(), { "act.rate": 22 }, "act.rate", "plg", true);
    expect(m.total!.startsWith(nb("Les deux moteurs dans 12^mois^: ~"))).toBe(true);
    expect(m.total).toContain(nb(" de MRR avec tes «^Et si^» (aujourd'hui ~"));
    expect(card(hybridState(), { "act.rate": 22 }, "act.rate", "plg", false).total).toBeNull();
  });

  it("no ARPA: no curve, and the ARR in twelve months says what is missing, never 0", () => {
    const m = card(withEntry(filmState(), "rev.arpa", undefined), {}, "ret.logo-churn");
    expect(m.curve).toBeNull();
    expect(m.arr12.unknown).toBe(true);
    expect(m.arr12.value).toMatch(/il manque/);
  });
});
