import { describe, expect, it } from "vitest";
import { buildDeck, deckMarkdown, renderTitle } from "../deck";
import { deriveEngine } from "../derive";
import type { DeckModel, EngineState, SlideId, SlideTitleKey } from "../types";
import { CTX_EN, CTX_FR, EN, FR } from "./props";
import { EXAMPLE_EXPECTED, emptyState, exampleState, measured, missing, ratio, tourResult, withEntry, withTarget } from "./fixtures";

// Engine spec §13.1 "deck" — §9.2 presence and order, `visibility` first
// under two ★, one case that triggers each title template and one that
// doesn't, and the leak's title and body quoting the same formatted amount.
// Non-vacuity: recomputing the title amount from `mrrPerMonth` (exact 560)
// instead of reading the chain's line fails "title and body agree" only;
// dropping the two-★ rule fails "visibility leads" only; defaulting the
// mirror to included fails the §9.2 table only.

const tool = { kind: "tool", tool: "stripe" } as const;
const props = { fr: { ...FR, ctx: CTX_FR }, en: { ...EN, ctx: CTX_EN } };

function deck(state: EngineState, locale: "fr" | "en" = "fr", result: ReturnType<typeof tourResult> | null = null): DeckModel {
  const p = props[locale];
  const derived = deriveEngine(state, p.ctx, result, p.bridges, p.strings.units);
  return buildDeck(state, derived, p.strings, p.metrics, p.ctx);
}
const slide = (model: DeckModel, id: SlideId) => model.slides.find((s) => s.id === id)!;

/** §10.4 whitelist: printable Latin-1 (U+00A0 included) plus – — ’ « » … € · × ÷ ±. */
const ALLOWED = /^[ -~ -ÿ–—’«»…€·×÷±]*$/u;

describe("§9.2 — presence, default inclusion, order", () => {
  it("the §6.0 example", () => {
    const model = deck(exampleState());
    expect(model.slides.map((s) => [s.id, s.present, s.included, s.index])).toEqual([
      ["peloton", true, true, 1],
      ["leak", true, true, 2],
      ["visibility", true, true, 3],
      ["unit-economics", true, true, 4],
      ["mirror", false, false, null],
      ["ask", true, true, 5],
      ["annex", true, true, 6],
    ]);
    expect(model.dataPill).toEqual({ measured: 9, approximate: 2, missing: 3 });
  });

  it("the mirror exists once a Tour is linked, but is unchecked by default", () => {
    const result = tourResult({ "ret-1": 0 });
    const linked: EngineState = { ...exampleState(), tourLink: { resultId: result.id, linkedAt: "x" } };
    expect(slide(deck(linked, "fr", result), "mirror")).toMatchObject({ present: true, included: false, index: null });
    linked.deck.include.mirror = true;
    expect(slide(deck(linked, "fr", result), "mirror")).toMatchObject({ present: true, included: true, index: 5 });
  });

  it("under two ★ known, visibility leads and the leak is omitted", () => {
    let s = withEntry(exampleState(), "act.rate", undefined);
    s = withEntry(s, "ref.referred-share", undefined);
    s = withEntry(s, "rev.paid-conversion", undefined);
    const model = deck(s);
    expect(model.slides[0]!.id).toBe("visibility");
    expect(model.slides[0]!.index).toBe(1);
    expect(slide(model, "leak").present).toBe(false);
  });

  it("an excluded slide gives up its number; unit economics needs a CAC or a computable figure", () => {
    const s = exampleState();
    s.deck.include.leak = false;
    expect(deck(s).slides.filter((x) => x.included).map((x) => [x.id, x.index])).toEqual([
      ["peloton", 1],
      ["visibility", 2],
      ["unit-economics", 3],
      ["ask", 4],
      ["annex", 5],
    ]);
    expect(slide(deck(withEntry(exampleState(), "acq.cac", undefined)), "unit-economics").present).toBe(false);
  });
});

describe("title templates — each one triggered, and not", () => {
  const complete = withEntry(exampleState(), "ret.d30", measured(ratio(80, 800), tool));
  const within = withEntry(exampleState(), "act.rate", measured(ratio(200, 800), tool));
  const allDocumented = (() => {
    let s = complete;
    s = withEntry(s, "ret.churn-cause", measured({ kind: "text", text: "prix" }, { kind: "other" }, { evidence: "data" }));
    s = withEntry(s, "ref.k-factor", measured(ratio(40, 800), tool));
    return withEntry(s, "rev.gross-margin", measured(ratio(80, 100), tool));
  })();
  const cases: [SlideTitleKey, SlideId, EngineState, EngineState][] = [
    ["pelotonComplete", "peloton", complete, exampleState()],
    ["pelotonGapOne", "peloton", exampleState(), complete],
    ["pelotonGap", "peloton", withEntry(withEntry(exampleState(), "act.rate", missing("not-tracked", "sprint")), "ret.d30", undefined), exampleState()],
    ["pelotonTailBreakOne", "peloton", withEntry(complete, "rev.paid-conversion", missing("not-computed", "sprint")), exampleState()],
    ["pelotonTailBreak", "peloton", withEntry(exampleState(), "rev.paid-conversion", missing("not-computed", "sprint")), exampleState()],
    ["pelotonEmpty", "peloton", emptyState(), exampleState()],
    ["leakClearMrrNew", "leak", exampleState(), within],
    ["leakClearMrrRetained", "leak", within, exampleState()],
    ["leakClearCustomers", "leak", withEntry(exampleState(), "rev.arpa", undefined), exampleState()],
    [
      "leakClearPerHundred",
      "leak",
      // No monthly volume (CAC and sign-ups as shortcuts); churn within its reference, so activation is named alone.
      withEntry(withEntry(withEntry(exampleState(), "acq.cac", measured({ kind: "amount", amount: 500 }, tool)), "acq.signup-rate", measured({ kind: "rate", percent: 3.2 })), "ret.logo-churn", measured(ratio(6, 400), tool)),
      exampleState(),
    ],
    ["leakShared", "leak", withEntry(exampleState(), "ret.logo-churn", measured(ratio(12, 400), tool)), exampleState()],
    ["leakNotEnoughBelow", "leak", withEntry(exampleState(), "ret.logo-churn", undefined), exampleState()],
    ["leakLevel", "leak", withEntry(within, "ret.logo-churn", measured(ratio(6, 400), tool)), exampleState()],
    ["visibility", "visibility", exampleState(), allDocumented],
    ["visibilityOne", "visibility", withEntry(allDocumented, "rev.gross-margin", missing("no-access", "meeting")), exampleState()],
    ["visibilityAllDocumented", "visibility", allDocumented, exampleState()],
    ["unitEconomics", "unit-economics", withEntry(exampleState(), "rev.gross-margin", measured(ratio(80, 100), tool)), exampleState()],
    ["unitEconomicsUnknown", "unit-economics", exampleState(), withEntry(exampleState(), "rev.gross-margin", measured(ratio(80, 100), tool))],
    ["askMeasureFirst", "ask", exampleState(), allDocumented],
  ];
  for (const [key, id, yes, no] of cases) {
    it(key, () => {
      expect(slide(deck(yes), id).title.key).toBe(key);
      expect(slide(deck(no), id).title.key).not.toBe(key);
    });
  }

  it("ask: the team's ask when written", () => {
    const s = withTarget(exampleState(), "act.rate", 25);
    s.deck.ask = { what: "deux sprints produit", bullets: ["refaire l'onboarding"], measureFirst: ["ret.d30"], successMetric: "act.rate", successTarget: 25, horizon: { year: 2027, quarter: 1 } };
    const ask = slide(deck(s), "ask");
    expect(ask.title).toEqual({ key: "ask", values: { what: "deux sprints produit", metric: "taux d'activation", current: "18 %", target: "25 %", horizon: "T1 2027" } });
    expect(ask.lines.map((l) => l.row)).toEqual(["bullet", "know", "measure"]);
    expect(slide(deck(exampleState()), "ask").title.key).not.toBe("ask");
  });

  it("mirror", () => {
    const result = tourResult({ "ret-1": 0, "acq-1": 0 });
    const linked: EngineState = { ...exampleState(), tourLink: { resultId: result.id, linkedAt: "x" } };
    expect(slide(deck(linked, "fr", result), "mirror").title).toEqual({ key: "mirror", values: { k: "2", m: "1" } });
  });
});

describe("the §6.0 example, in words", () => {
  it("peloton: « 18 atteignent la première valeur et 6 à 9 paient », the rétention à J30 unmeasured", () => {
    const title = slide(deck(exampleState()), "peloton").title;
    expect(title).toEqual({ key: "pelotonGapOne", values: { clauses: "18 atteignent la première valeur et 6 à 9 paient", stages: "la rétention à J30" } });
    // The copy puts U+00A0 before « : » (French typography): spelled out here.
    expect(renderTitle(title, FR.strings)).toBe(
      "Sur 100 inscrits, 18 atteignent la première valeur et 6 à 9 paient. **Entre les deux, on ne voit rien : la rétention à J30 n'est pas mesurée.**",
    );
  });

  it("leak: title and body quote the SAME formatted amount, in both languages", () => {
    for (const locale of ["fr", "en"] as const) {
      const leak = slide(deck(exampleState(), locale), "leak");
      const strings = props[locale].strings;
      const title = renderTitle(leak.title, strings);
      expect(leak.title.key).toBe("leakClearMrrNew");
      expect(leak.title.values.amount).toBe(EXAMPLE_EXPECTED.leakAmount[locale]);
      expect(title).toContain(EXAMPLE_EXPECTED.leakAmount[locale]);
      const times = leak.lines.find((l) => l.key === "times")!;
      expect(times.text).toContain(leak.title.values.amount);
      expect(leak.lines.find((l) => l.key === "then")!.text).toBe(EXAMPLE_EXPECTED.leakChain);
    }
  });

  it("leak: the activation assumption is printed; blind day 30 is said; the others stand alongside", () => {
    const leak = slide(deck(exampleState()), "leak");
    expect(leak.lines.filter((l) => l.row === "assumption").map((l) => l.text)).toEqual([FR.strings.whatIf.assumptionActivation]);
    expect(leak.lines.find((l) => l.row === "blind")!.text).toContain("La rétention à J30");
    expect(leak.lines.filter((l) => l.row === "aside")).toHaveLength(5);
    expect(renderTitle(leak.title, FR.strings)).toBe(
      "Ramener l'activation à 20 % (bas de l'ordre de grandeur couramment cité) vaudrait **~600 € de MRR nouveau** chaque mois.",
    );
  });

  it("visibility: 11 of 15 documented, the missing ones sorted from a meeting to a sprint", () => {
    const v = slide(deck(exampleState()), "visibility");
    expect(v.title).toEqual({ key: "visibility", values: { n: "11", N: "15", k: "4", repair: "entre une réunion et un sprint" } });
    expect(v.lines.filter((l) => l.row === "missing").map((l) => l.repair)).toEqual(["une réunion", "une réunion", "un sprint", "un sprint"]);
  });

  it("unit economics: the margin is named as missing", () => {
    expect(slide(deck(exampleState()), "unit-economics").title).toEqual({ key: "unitEconomicsUnknown", values: { input: "marge brute" } });
  });
});

describe("what the deck never carries", () => {
  it("a private note never reaches the model or the text export; the credit follows its switch", () => {
    const s = withEntry(exampleState(), "act.rate", measured(ratio(144, 800), tool, { note: "SECRET-NOTE-42", definitionNote: "actif = un projet édité" }));
    const model = deck(s);
    expect(JSON.stringify(model)).not.toContain("SECRET-NOTE-42");
    expect(JSON.stringify(model)).toContain("actif = un projet édité");
    const md = deckMarkdown(model, FR.strings);
    expect(md).not.toContain("SECRET-NOTE-42");
    expect(md).toContain("tourdegrowth.com");
    s.deck.showSiteCredit = false;
    expect(deckMarkdown(deck(s), FR.strings)).not.toContain("tourdegrowth.com");
  });

  it("the company only when asked", () => {
    const s = exampleState();
    s.setup.companyLabel = "Acme";
    expect(deck(s).kicker.company).toBe("");
    s.deck.showCompany = true;
    expect(deck(s).kicker.company).toBe("Acme · ");
  });

  // Copy-sourced fields (sentences, formulas, metric names) are the content tests' to sweep (§13.1,
  // P3) — the FR name of rev.paid-conversion carries « → », reported. This checks what deck.ts computes.
  it("every value the deck injects prints in the slides' fonts", () => {
    const models = [deck(exampleState()), deck(exampleState(), "en"), deck(withEntry(exampleState(), "rev.gross-margin", measured(ratio(80, 100), tool)))];
    const bad: string[] = [];
    for (const model of models) {
      for (const s of model.slides) {
        for (const v of Object.values(s.title.values)) if (!ALLOWED.test(v)) bad.push(v);
        for (const line of s.lines) {
          for (const [key, v] of Object.entries(line)) if (!["text", "formula", "metric", "number"].includes(key) && !ALLOWED.test(v)) bad.push(`${key}: ${v}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });
});

describe("deckMarkdown", () => {
  it("the kicker, the data pill, each included title in order, lines and notes", () => {
    const md = deckMarkdown(deck(exampleState()), FR.strings);
    const titles = md.split("\n").filter((l) => l.startsWith("## "));
    expect(titles.map((t) => t.slice(0, 5))).toEqual(["## 1.", "## 2.", "## 3.", "## 4.", "## 5.", "## 6."]);
    expect(titles[1]).toContain("**~600 € de MRR nouveau**");
    expect(md).toContain("Données : 9 mesurées · 2 approximatives · 3 introuvables");
    expect(md).toContain("> ");
  });
});
