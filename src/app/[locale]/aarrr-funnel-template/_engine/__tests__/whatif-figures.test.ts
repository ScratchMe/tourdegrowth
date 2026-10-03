import { describe, expect, it } from "vitest";
import { FILM_LEVERS, filmState, noMarginState, salesAssistedState } from "@/lib/engine/__tests__/fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "@/lib/engine/__tests__/props";
import type { EngineState, LeverId } from "@/lib/engine/types";
import { leverSumView, moneyAssumptions, whatIfFigureGroups, type FigureRow } from "../whatif-figures";

/**
 * The full « Et si ? » panel's figures (design system extension 09, Q9,
 * A20.d T3.b): three tables by meaning, the compounding drawn, the money's
 * own assumptions — on the film's SaaS, whose numbers the return printed.
 */
const N = " ";
const nb = (s: string) => s.replace(/\^/g, N);
const fr = (state: EngineState) => ({ state, ctx: CTX_FR, strings: FR.strings, metrics: FR.metrics });
const groups = (state: EngineState, targets: Partial<Record<LeverId, number>> = {}, motion: "plg" | "slg" = "plg") => whatIfFigureGroups(fr(state), motion, targets);
const rowOf = (g: ReturnType<typeof groups>, id: string): FigureRow => g.groups.flatMap((x) => x.rows).find((r) => r.id === id)!;

describe("whatIfFigureGroups", () => {
  it("three tables by meaning, in the return's order; the MRR and the ARR in twelve months are the card's, not repeated", () => {
    const g = groups(filmState());
    expect(g.groups.map((x) => [x.id, x.title, x.rows.map((r) => r.id)])).toEqual([
      ["growth", "Croissance", ["newMrr", "nrr", "grr"]],
      ["customer", "Un nouveau client", ["cac", "ltv", "ltvCac", "gap", "payback", "after"]],
      ["cash", "Trésorerie", ["spend", "cash"]],
    ]);
    expect(g.groups.flatMap((x) => x.rows).some((r) => r.id === "mrr12" || r.id === "arr12")).toBe(false);
  });

  it("untouched: today's figures alone, the film's loss in its own words, and the customer who leaves before paying back", () => {
    const g = groups(filmState());
    expect(g.moved).toBe(false);
    expect(rowOf(g, "ltvCac").today).toBe(nb("0,79^fois"));
    expect(rowOf(g, "gap").today).toBe(nb("il manque ~400^€"));
    expect(rowOf(g, "after").today).toBe("part avant");
    expect(rowOf(g, "spend").today).toBe(nb("93^480^€"));
    expect(rowOf(g, "cash").today).toBe(nb("~990^000^€"));
    for (const r of g.groups.flatMap((x) => x.rows)) expect([r.whatif, r.change]).toEqual([null, null]);
  });

  it("the film's three what-ifs: each change signed and said in words; the spend never moves", () => {
    const g = groups(filmState(), FILM_LEVERS);
    expect(rowOf(g, "cac")).toMatchObject({ whatif: nb("~1^400^€"), change: nb("−480^€ ·^mieux") });
    expect(rowOf(g, "gap")).toMatchObject({ whatif: nb("~830^€ de plus"), change: nb("+1^200^€ ·^mieux") });
    expect(rowOf(g, "payback")).toMatchObject({ whatif: nb("16^mois"), change: nb("−5^mois ·^mieux") });
    expect(rowOf(g, "after").whatif).toBe(nb("~9^mois"));
    expect(rowOf(g, "spend")).toMatchObject({ whatif: nb("93^480^€"), change: "stable" });
    expect(rowOf(g, "cash")).toMatchObject({ whatif: nb("~740^000^€"), change: nb("−250^000^€ ·^mieux") });
  });

  it("churn 6 → 4 % moves neither the CAC, the payback nor the cash: « stable », never a made-up change", () => {
    const g = groups(filmState(), { "ret.logo-churn": 4 });
    for (const id of ["cac", "payback", "spend", "cash"]) expect(rowOf(g, id).change).toBe("stable");
    expect(rowOf(g, "gap").whatif).toBe(nb("~350^€ de plus"));
  });

  it("no margin (the §6.0 example): « ? » and what is missing on every row it stops, never 0; the spend still known", () => {
    const g = groups(noMarginState());
    for (const id of ["ltv", "ltvCac", "gap", "payback", "after", "cash"]) expect(rowOf(g, id)).toMatchObject({ today: "?", missing: "il manque la marge brute" });
    expect(rowOf(g, "spend")).toMatchObject({ today: nb("21^000^€"), missing: null });
  });

  it("sales-assisted: its quarter's new customers in growth, no GRR", () => {
    expect(groups(salesAssistedState(), {}, "slg").groups[0]!.rows.map((r) => r.id)).toEqual(["newMrr", "nrr", "won"]);
  });

  it("in English", () => {
    const g = whatIfFigureGroups({ state: filmState(), ctx: CTX_EN, strings: EN.strings, metrics: EN.metrics }, "plg", FILM_LEVERS);
    expect(g.groups.map((x) => x.title)).toEqual(["Growth", "One new customer", "Cash"]);
    expect(rowOf(g, "after").today).toBe("leaves first");
    expect(rowOf(g, "spend").change).toBe("unchanged");
  });
});

describe("leverSumView", () => {
  it("the film's three levers: each alone, the solo gains added up, together, and the compounding in words (the return's figures)", () => {
    const s = leverSumView(fr(filmState()), FILM_LEVERS)!;
    expect(s.rows.map((r) => [r.label, r.value])).toEqual([
      [nb("Taux d'activation^: 18^% → 24^%"), nb("+18^000^€")],
      [nb("Churn logo mensuel^: 6^% → 4^%"), nb("+13^000^€")],
      [nb("Expansion mensuelle^: 2^% → 3^%"), nb("+6^400^€")],
    ]);
    expect(s.sum).toMatchObject({ label: "Chacun seul, additionnés", value: nb("~38^000^€") });
    expect(s.together).toMatchObject({ label: "Ensemble", value: nb("+42^000^€") });
    expect(s.together.amount).toBeGreaterThan(s.sum.amount);
    expect(s.extra).toBe(nb("Ensemble, ils rapportent ~4^400^€ de plus que chacun seul, additionnés^: chaque levier agit sur ce que les autres ajoutent. C'est l'effet composé."));
  });

  it("one lever: nothing to add up, nothing drawn", () => {
    expect(leverSumView(fr(filmState()), { "act.rate": 24 })).toBeNull();
  });
});

describe("moneyAssumptions", () => {
  it("the LTV's and the cash's rules when the tables print them; none without a margin", () => {
    expect(moneyAssumptions(fr(filmState()), "plg", {})).toEqual([FR.strings.scenario.assumeLtv, FR.strings.scenario.assumeCash]);
    expect(moneyAssumptions(fr(noMarginState()), "plg", {})).toEqual([]);
  });
});
