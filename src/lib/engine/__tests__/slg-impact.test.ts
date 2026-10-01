import { describe, expect, it } from "vitest";
import { fillTemplate, roundSignificant } from "../format";
import { impactHeadline } from "../impact";
import { slgChainTemplate, worthOf } from "../phrases";
import { contractsUpForRenewal, slgRankingImpact, slgWhatIf, wonPerQuarter } from "../slg-impact";
import type { EngineState, Impact } from "../types";
import { estimated, hybridState, measured, ratio, salesAssistedState, withEntry } from "./fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "./props";

// Engine spec §18.5.3 and §18.10.1 « slg-impact » (A7.3.c S1). Non-vacuity,
// measured on 2026-10-01:
// - building `then` from the EXACT rate instead of the displayed one fails
//   the recompute grid only (the example's rates print exactly);
// - a quarter a hair off « delta × the displayed ACV ÷ 12 » (× 1.0001) fails
//   the grid and the three chains of the example;
// - an annual line read on the exact month instead of the printed one fails
//   « annual = amount × 12 » on the grid only (2 666,67 × 12 ≠ 2 700 × 12);
// - ranking the renewal on W instead of D fails the ranking value here and
//   the example's impacts in diagnose-slg (18 × 4 % ≠ 25 × 4 %); the chain
//   reads D on its own and doesn't move.

const hubspot = { kind: "tool", tool: "hubspot" } as const;
/** French as printed: `^` marks U+00A0, the glyph the page prints before « % », « € », « : » and inside grouped numbers. */
const nb = (s: string) => s.replace(/\^/g, "\u00a0");
const lineOf = (impact: Impact, key: string) => impact.lines.find((l) => l.key === key)!;

/** The chain as the slide reads it: « {label} · {text} » — the same templates the deck will print (S4). */
function printed(impact: Impact, state: EngineState, p: typeof FR, locale: "fr" | "en", stage: string, target: string): string[] {
  const term = state.snapshots[0]!.metrics["slg.ret.renewal"]?.variant === "monthly" ? "monthly" : "annual";
  return impact.lines.map((line) => {
    const { label, template, values } = slgChainTemplate(line, impact, p.strings, locale, term);
    const text = fillTemplate(template, { ...line.values, ...values, stage, ...(line.key === "if" ? { target } : {}) });
    return label ? `${label} · ${text}` : text;
  });
}

describe("the §18.9.4 example, in both languages, to the character", () => {
  it("the win rate to 32 %: 18 × 32/24 = 24 (+6), 6 × 2 000 € = 12 000 € a quarter, ~4 000 € a month, ~48 000 € after a year", () => {
    const s = hybridState();
    const fr = slgWhatIf(s, "slg.rev.win-rate", 32, CTX_FR, FR.strings.units)!;
    expect(printed(fr, s, FR, "fr", FR.strings.subject["slg.rev.win-rate"], nb("32^% (cible de l'équipe)"))).toEqual(
      [
        "Aujourd'hui · 24^% de closing, soit 18 nouveaux clients sur 3^mois",
        "Si · le taux de closing atteint 32^% (cible de l'équipe)",
        "Alors · 18 × 32/24 = 24 (+6) sur 3^mois",
        "× ACV ÷ 12 · 6 × 2^000^€ = 12^000^€ de MRR nouveau par trimestre",
        "soit ~4^000^€ par mois",
        "Soit ~48^000^€ de MRR de plus au bout d'un an (contrats annuels^: aucun ne se renouvelle dans l'année).",
      ].map(nb),
    );
    const en = slgWhatIf(s, "slg.rev.win-rate", 32, CTX_EN, EN.strings.units)!;
    expect(printed(en, s, EN, "en", EN.strings.subject["slg.rev.win-rate"], "32% (team target)")).toEqual([
      "Today · 24% win rate, i.e. 18 new customers over 3 months",
      "If · the win rate reaches 32% (team target)",
      "Then · 18 × 32/24 = 24 (+6) over 3 months",
      "× ACV ÷ 12 · 6 × €2,000 = €12,000 of new MRR per quarter",
      "that is ~€4,000 a month",
      "That's ~€48,000 more MRR after a year (annual contracts: none comes up for renewal within the year).",
    ]);
    expect(fr).toMatchObject({ kind: "new-mrr", customersPerQuarter: { lo: 6, hi: 6 }, mrrPerQuarter: { lo: 12_000, hi: 12_000 }, mrrPerMonth: { lo: 4_000, hi: 4_000 } });
  });

  it("lead → opportunity to 18 %: 18 × 18/15 = 22 (+4), 8 000 € a quarter, ~2 700 € a month", () => {
    const s = hybridState();
    const fr = slgWhatIf(s, "slg.acq.lead-to-opp", 18, CTX_FR, FR.strings.units)!;
    expect(printed(fr, s, FR, "fr", FR.strings.subject["slg.acq.lead-to-opp"], nb("18^% (cible de l'équipe)")).slice(0, 5)).toEqual(
      [
        "Aujourd'hui · 15^% de passage en opportunité, soit 18 nouveaux clients sur 3^mois",
        "Si · le passage des leads en opportunités atteint 18^% (cible de l'équipe)",
        "Alors · 18 × 18/15 = 22 (+4) sur 3^mois",
        "× ACV ÷ 12 · 4 × 2^000^€ = 8^000^€ de MRR nouveau par trimestre",
        "soit ~2^700^€ par mois",
      ].map(nb),
    );
  });

  it("the renewal to 92 %: 25 × (92 % – 88 %) = 1 contract, 1 × 1 800 € = 1 800 € a quarter, ~600 € a month", () => {
    const s = hybridState();
    const fr = slgWhatIf(s, "slg.ret.renewal", 92, CTX_FR, FR.strings.units)!;
    expect(printed(fr, s, FR, "fr", FR.strings.subject["slg.ret.renewal"], nb("92^% (cible de l'équipe)")).slice(0, 5)).toEqual(
      [
        "Aujourd'hui · 88^% des contrats échus renouvelés, sur 25 contrats échus en 3^mois",
        "Si · le renouvellement des contrats atteint 92^% (cible de l'équipe)",
        "Alors · 25 × (92^% – 88^%) = 1 contrat gardé en plus sur 3^mois",
        "× ARPA assisté · 1 × 1^800^€ = 1^800^€ de MRR préservé par trimestre",
        "soit ~600^€ par mois",
      ].map(nb),
    );
    expect(fr.kind).toBe("retained-mrr");
  });

  it("title = body: the slide's title quotes the per-month line of the same object (§18.5.3)", () => {
    const fr = slgWhatIf(hybridState(), "slg.rev.win-rate", 32, CTX_FR, FR.strings.units)!;
    expect(impactHeadline(fr)).toEqual({ amount: lineOf(fr, "per-month").values.amount });
    expect(worthOf(fr, FR.strings, "fr")).toBe(nb("~4^000^€ de MRR nouveau par mois"));
  });
});

describe("the ranking value: exact, per month, the identity of D9", () => {
  it("4 000, 2 400 and 600 € a month on the example — what the diagnosis ranks with", () => {
    const s = hybridState();
    expect(slgRankingImpact(s, "slg.rev.win-rate", 32, CTX_FR).mrr!.lo).toBeCloseTo(4_000, 9);
    expect(slgRankingImpact(s, "slg.acq.lead-to-opp", 18, CTX_FR).mrr!.lo).toBeCloseTo(2_400, 9);
    expect(slgRankingImpact(s, "slg.ret.renewal", 92, CTX_FR).mrr!.lo).toBeCloseTo(600, 9);
    expect(wonPerQuarter(s)).toEqual({ lo: 18, hi: 18 });
    expect(contractsUpForRenewal(s)).toBe(25);
  });

  it("the same W and the same ACV for both flows: ranking in money IS ranking by relative gap, on a grid", () => {
    let checked = 0;
    for (const lead of [4, 15, 31.5]) {
      for (const win of [9, 24, 47]) {
        for (const lift of [1.05, 1.3, 2]) {
          let s = withEntry(hybridState(), "slg.acq.lead-to-opp", measured({ kind: "rate", percent: lead }, hubspot, { cohortMonth: "2026-07" }));
          s = withEntry(s, "slg.rev.win-rate", measured({ kind: "rate", percent: win }, hubspot));
          const a = slgRankingImpact(s, "slg.acq.lead-to-opp", lead * lift, CTX_FR);
          const b = slgRankingImpact(s, "slg.rev.win-rate", win * 1.2, CTX_FR);
          expect(Math.sign(a.mrr!.lo - b.mrr!.lo)).toBe(Math.sign(a.gap!.lo - b.gap!.lo));
          checked++;
        }
      }
    }
    expect(checked).toBe(27);
  });

  it("never prices go-live nor the referred share, and a target already met is worth nothing", () => {
    const s = withEntry(hybridState(), "slg.act.go-live", measured(ratio(10, 15), hubspot));
    expect(slgRankingImpact(s, "slg.act.go-live", 90, CTX_FR)).toEqual({});
    expect(slgWhatIf(s, "slg.act.go-live", 90, CTX_FR, FR.strings.units)).toBeNull();
    expect(slgRankingImpact(s, "slg.ref.referred-share", 40, CTX_FR)).toEqual({});
    expect(slgRankingImpact(s, "slg.rev.win-rate", 20, CTX_FR).mrr).toEqual({ lo: 0, hi: 0 });
    expect(slgWhatIf(s, "slg.rev.win-rate", 24, CTX_FR, FR.strings.units)).toBeNull();
  });
});

describe("every displayed line recomputes from the one above (§18.5.3)", () => {
  /** "1,234" → 1234, "~€2,700" → 2700 (English display). */
  const num = (s: string) => Number(s.replace(/[~€,%]/g, ""));

  it("over a grid of W, win rates, targets and ACVs", () => {
    let checked = 0;
    for (const won of [2, 7, 18, 140]) {
      for (const rate of [6.4, 13.3, 24, 41]) {
        for (const lift of [1.1, 1.33, 2]) {
          for (const acv of [1_100, 24_000, 87_350]) {
            let s = withEntry(hybridState(), "slg.rev.win-rate", measured({ kind: "rate", percent: rate }, hubspot));
            s = withEntry(s, "slg.rev.acv", measured(ratio(acv * won, won), hubspot));
            s = { ...s, snapshots: [{ ...s.snapshots[0]!, base: { ...s.snapshots[0]!.base, slgDealsWon: won } }] };
            const impact = slgWhatIf(s, "slg.rev.win-rate", rate * lift, CTX_EN, EN.strings.units);
            if (!impact) continue;
            const then = lineOf(impact, "then").values;
            const [nD, tD, rD, mD, dD] = [then.n!, then.target!, then.rate!, then.m!, then.delta!].map(num) as [number, number, number, number, number];
            expect(mD).toBe(Math.round((nD * tD) / rD));
            expect(dD).toBe(Math.max(0, mD - nD));
            const times = impact.lines.find((l) => l.key === "times");
            if (dD < 1) {
              expect(times).toBeUndefined();
              expect(impact.lines.some((l) => l.key === "less-than-one")).toBe(true);
              expect(impactHeadline(impact).amount).toBeUndefined();
            } else {
              const quarter = num(times!.values.quarter!);
              expect(quarter).toBe(dD * num(times!.values.acvMonthly!));
              expect(num(times!.values.acvMonthly!)).toBe(Math.round(acv / 12));
              const amount = num(lineOf(impact, "per-month").values.amount!);
              expect(amount).toBe(roundSignificant(quarter / 3, 2));
              expect(num(lineOf(impact, "annual").values.amount!)).toBe(roundSignificant(amount * 12, 2));
            }
            checked++;
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(120);
  });
});

describe("edges", () => {
  it("less than one more customer: no amount, and the worth says so", () => {
    // Two deals a quarter (the base, typed once), 24 % → 25 %: 2 × 25/24 = 2 (+0).
    const s = { ...hybridState() };
    s.snapshots = [{ ...s.snapshots[0]!, base: { ...s.snapshots[0]!.base, slgDealsWon: 2 } }];
    const impact = slgWhatIf(s, "slg.rev.win-rate", 25, CTX_FR, FR.strings.units)!;
    expect(impact.lines.map((l) => l.key)).toEqual(["today", "if", "then", "less-than-one"]);
    expect(impact.mrrPerMonth).toBeUndefined();
    expect(worthOf(impact, FR.strings, "fr")).toBe("moins d'un client de plus par trimestre");
  });

  it("without the ACV: new customers a quarter, no money", () => {
    const impact = slgWhatIf(withEntry(hybridState(), "slg.rev.acv", undefined), "slg.rev.win-rate", 32, CTX_FR, FR.strings.units)!;
    expect(impact.kind).toBe("customers");
    expect(impact.lines.map((l) => l.key)).toEqual(["today", "if", "then"]);
    expect(worthOf(impact, FR.strings, "fr")).toBe("6 nouveaux clients de plus par trimestre");
  });

  it("without W: on the relay's own 100, never a chain through the funnel", () => {
    let s = withEntry(salesAssistedState(), "slg.rev.win-rate", measured({ kind: "rate", percent: 24 }, hubspot));
    s = withEntry(withEntry(s, "slg.rev.acv", measured({ kind: "amount", amount: 24_000 }, hubspot)), "slg.acq.cac", measured({ kind: "amount", amount: 19_000 }, hubspot));
    s = { ...s, snapshots: [{ ...s.snapshots[0]!, base: { slgOppsCreated: 130, slgCustomers: 100 } }] };
    const impact = slgWhatIf(s, "slg.rev.win-rate", 32, CTX_FR, FR.strings.units)!;
    expect(impact).toMatchObject({ kind: "per-hundred", perHundredBase: "closedOpps" });
    expect(lineOf(impact, "then").values).toMatchObject({ m: "32", delta: "8" });
    // Named: what is counted, and on which 100 (§18.5.3).
    expect(worthOf(impact, FR.strings, "fr")).toBe("8 signatures de plus pour 100 opportunités conclues");
    expect(printed(impact, s, FR, "fr", "", "").slice(2, 3)).toEqual(["Alors · 24 × 32/24 = 32 (+8) sur 100 opportunités conclues"]);
    const lead = slgWhatIf(s, "slg.acq.lead-to-opp", 18, CTX_EN, EN.strings.units)!;
    expect(lead.perHundredBase).toBe("mql");
    expect(worthOf(lead, EN.strings, "en")).toBe("3 more opportunities per 100 MQLs");
  });

  it("the renewal's « less than one » counts contracts kept, not customers", () => {
    const impact = slgWhatIf(hybridState(), "slg.ret.renewal", 89, CTX_FR, FR.strings.units)!;
    expect(impact.lines.map((l) => l.key)).toEqual(["today", "if", "then", "less-than-one"]);
    expect(worthOf(impact, FR.strings, "fr")).toBe("moins d'un contrat gardé de plus par trimestre");
    expect(printed(impact, hybridState(), EN, "en", "", "").at(-1)).toBe("Less than one more contract kept over 3 months.");
  });

  it("an estimated rate gives a range all the way down, each bound from the bound that pushes it", () => {
    const s = withEntry(hybridState(), "slg.rev.win-rate", estimated(20, 25));
    const impact = slgWhatIf(s, "slg.rev.win-rate", 32, CTX_FR, FR.strings.units)!;
    expect(impact.customersPerQuarter).toEqual({ lo: 5, hi: 11 });
  });

  it("monthly contracts: the year line keeps the new MRR month after month at the renewal rate", () => {
    const s = withEntry(hybridState(), "slg.ret.renewal", measured(ratio(22, 25), hubspot, { variant: "monthly" }));
    const impact = slgWhatIf(s, "slg.rev.win-rate", 32, CTX_FR, FR.strings.units)!;
    const q = 0.88;
    expect(impact.mrrAfter12Months!.lo).toBeCloseTo((4_000 * (1 - q ** 12)) / (1 - q), 6);
    expect(printed(impact, s, FR, "fr", "", "").at(-1)).toMatch(/renouvellements mensuels compris/);
  });
});
