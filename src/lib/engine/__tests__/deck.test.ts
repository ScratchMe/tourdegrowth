import { describe, expect, it } from "vitest";
import { buildDeck, deckMarkdown, renderTitle, slideGlyphs } from "../deck";
import { deriveEngine } from "../derive";
import { buildScenario } from "../scenario";
import type { DeckModel, EngineState, SlideId, SlideTitleKey } from "../types";
import { CTX_EN, CTX_FR, EN, FR } from "./props";
import { EXAMPLE_EXPECTED, FILM_LEVERS, emptyState, exampleState, filmState, hybridState, measured, missing, ratio, salesAssistedState, tourResult, withEntry, withTarget, noMarginState } from "./fixtures";

// Engine spec §13.1 "deck" — §9.2 presence and order, `visibility` first
// under two ★, one case that triggers each title template and one that
// doesn't, and the leak's title and body quoting the same formatted amount.
// Non-vacuity, measured: formatting the title amount from the ranking's
// exact 560 € instead of reading the chain's "× ARPA" line fails "title and
// body agree", the French title sentence and the text export (3 tests);
// dropping the two-★ rule fails "visibility leads" only; defaulting the
// mirror to included fails "unchecked by default" only.

const tool = { kind: "tool", tool: "stripe" } as const;
const props = { fr: { ...FR, ctx: CTX_FR }, en: { ...EN, ctx: CTX_EN } };

function deck(state: EngineState, locale: "fr" | "en" = "fr", result: ReturnType<typeof tourResult> | null = null): DeckModel {
  const p = props[locale];
  const derived = deriveEngine(state, p.ctx, result, p.bridges, p.strings.units);
  return buildDeck(state, derived, p.strings, p.metrics, p.ctx, { derived: p.derived, bridges: p.bridges });
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
      // The appendix runs over two pages at 18px (A2.1, 2026-09-29).
      ["annex", true, true, 6],
      ["annex:2", true, true, 7],
    ]);
    // The margin estimated since C50 (A20.d T6): one approximate more, one missing less.
    expect(model.dataPill).toEqual({ measured: 11, approximate: 3, missing: 2 });
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

  /**
   * C9 (2026-09-29, ENGINE.md §9.3): a stage the model can't price keeps its
   * slide; a gain under one customer a month doesn't get one. Non-vacuity,
   * measured 2026-09-30: putting back the old omission (an unpriced stage
   * returns `absent`) fails the first test on `present`.
   */
  it("C9: a referred share past a 50 % target, named alone, gets its leak slide — value and target, no amount, the ceiling said", () => {
    // Activation past its target, churn under its own, the referred share at 6 % against the team's 60 %: the only stage behind.
    let s = withEntry(exampleState(), "act.rate", measured(ratio(200, 800), tool));
    s = withEntry(s, "ret.logo-churn", measured(ratio(6, 400), tool));
    s = withTarget(s, "ref.referred-share", 60);
    for (const locale of ["fr", "en"] as const) {
      const leak = slide(deck(s, locale), "leak");
      const strings = props[locale].strings;
      expect(leak.present, locale).toBe(true);
      expect(leak.title.key).toBe("leakClearUnpriced");
      const title = renderTitle(leak.title, strings);
      expect(title).toBe(
        locale === "fr"
          ? "**La part des inscrits recommandés freine le moteur**\u00a0: 6\u00a0%, pour 60\u00a0% (cible de l'équipe)."
          : "**The referred share of sign-ups is holding the engine back**: 6%, against 60% (team target).",
      );
      // No money anywhere on it, and no chain: the calculation card has nothing to show.
      expect(title).not.toMatch(/€|MRR/);
      expect(leak.lines.filter((l) => l.row === "calc")).toEqual([]);
      expect(leak.lines.find((l) => l.row === "footer")!.text).toBe(
        locale === "fr"
          ? "Sans montant\u00a0: au-delà d'une cible de 50\u00a0%, le moteur ne chiffre plus la part des recommandations"
          : "No amount: past a target of 50%, the engine no longer prices a referred share",
      );
      // The others still stand alongside, and the text export carries the same slide.
      expect(leak.lines.filter((l) => l.row === "aside")).toHaveLength(5);
      expect(deckMarkdown(deck(s, locale), strings)).toContain(`## 2. ${title}`);
    }
  });

  it("the referred share named alone, under 50 %: the chain the reader recomputes, (100 – r)/(100 – t) (§19.3.2)", () => {
    let s = withEntry(exampleState(), "act.rate", measured(ratio(200, 800), tool));
    s = withEntry(s, "ret.logo-churn", measured(ratio(6, 400), tool));
    s = withTarget(s, "ref.referred-share", 10);
    const fr = slide(deck(s, "fr"), "leak");
    expect(fr.title.key).toBe("leakClearMrrNew");
    expect(fr.lines.find((l) => l.row === "calc" && l.key === "then")!.text).toBe("42 × (100 – 6)/(100 – 10) = 44 (+2)");
    expect(fr.lines.find((l) => l.row === "footer")!.text).toContain(props.fr.strings.slide.plgLeakAssumption["ref.referred-share"]);
    expect(slide(deck(s, "en"), "leak").lines.find((l) => l.row === "calc" && l.key === "then")!.text).toBe("42 × (100 – 6)/(100 – 10) = 44 (+2)");
  });

  it("day-30 retention named alone has its chain and says its assumption (§19.3.1)", () => {
    let s = withEntry(exampleState(), "act.rate", measured(ratio(200, 800), tool));
    s = withEntry(s, "ret.logo-churn", measured(ratio(6, 400), tool));
    s = withTarget(withEntry(s, "ret.d30", measured(ratio(40, 800), tool)), "ret.d30", 20);
    for (const locale of ["fr", "en"] as const) {
      const leak = slide(deck(s, locale), "leak");
      const strings = props[locale].strings;
      expect(leak.title.key, locale).toBe("leakClearMrrNew");
      // 42 × 20/5 = 168 (+126), × 120 € = 15 120 €: the title quotes the chain's amount.
      expect(renderTitle(leak.title, strings)).toMatch(/15[\u00a0,]000/);
      expect(leak.lines.filter((l) => l.row === "calc").map((l) => l.key)).toEqual(["today", "if", "then", "times", "annual"]);
      expect(leak.lines.find((l) => l.row === "footer")!.text).toContain(strings.slide.plgLeakAssumption["ret.d30"]);
    }
  });

  it("C9: a gain under one customer a month keeps the leak slide out", () => {
    // Three new payers a month: closing activation's gap to 20 % is worth a third of a customer.
    const s = withEntry(withEntry(exampleState(), "rev.arpa", undefined), "acq.cac", measured(ratio(1_500, 3), tool));
    const model = deck(s);
    expect(deriveEngine(s, CTX_FR, null, FR.bridges, FR.strings.units).diagnosis).toMatchObject({ state: "clear", named: ["act.rate"] });
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
      ["annex:2", 6],
    ]);
    // GRR and NRR (2026-09-26) are figures of that slide too: without the CAC AND without the churn, it has nothing to show.
    expect(slide(deck(withEntry(exampleState(), "acq.cac", undefined)), "unit-economics").present).toBe(true);
    expect(slide(deck(withEntry(withEntry(exampleState(), "acq.cac", undefined), "ret.logo-churn", undefined)), "unit-economics").present).toBe(false);
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
  // No monthly volume (CAC and sign-ups as shortcuts); churn within its reference, so activation is named alone.
  const perHundred = withEntry(withEntry(withEntry(exampleState(), "acq.cac", measured({ kind: "amount", amount: 500 }, tool)), "acq.signup-rate", measured({ kind: "rate", percent: 3.2 })), "ret.logo-churn", measured(ratio(6, 400), tool));
  const noArpa = withEntry(exampleState(), "rev.arpa", undefined);
  // Churn named without ARPA: its chain counts customers KEPT. 400 × (2,5 % – 2 %) = 2; 400 × (2,3 % – 2 %) = 1.
  const kept = withEntry(within, "rev.arpa", undefined);
  const cases: [SlideTitleKey, SlideId, EngineState, EngineState][] = [
    ["pelotonComplete", "peloton", complete, exampleState()],
    ["pelotonGapOne", "peloton", exampleState(), complete],
    ["pelotonGap", "peloton", withEntry(withEntry(exampleState(), "act.rate", missing("not-tracked", "sprint")), "ret.d30", undefined), exampleState()],
    ["pelotonTailBreakOne", "peloton", withEntry(complete, "rev.paid-conversion", missing("not-computed", "sprint")), exampleState()],
    ["pelotonTailBreak", "peloton", withEntry(exampleState(), "rev.paid-conversion", missing("not-computed", "sprint")), exampleState()],
    ["pelotonEmpty", "peloton", emptyState(), exampleState()],
    ["leakClearMrrNew", "leak", exampleState(), within],
    ["leakClearMrrRetained", "leak", within, exampleState()],
    ["leakClearCustomers", "leak", noArpa, exampleState()],
    // Ten new payers a month: 10 × 20/18 = 11 (+1) — « 1 client payant », in both languages.
    ["leakClearCustomersOne", "leak", withEntry(noArpa, "acq.cac", measured(ratio(5_000, 10), tool)), noArpa],
    ["leakClearKept", "leak", kept, exampleState()],
    ["leakClearKeptOne", "leak", withEntry(kept, "ret.logo-churn", measured(ratio(9, 400), tool)), kept],
    // 6 à 9 × 40/18: « 7 à 11 payants ».
    ["leakClearPerHundred", "leak", withTarget(perHundred, "act.rate", 40), perHundred],
    // 6 à 9 × 20/18: « 0,7 à 1 payant » — French takes the singular under 2.
    ["leakClearPerHundredOne", "leak", perHundred, withTarget(perHundred, "act.rate", 40)],
    ["leakShared", "leak", withEntry(exampleState(), "ret.logo-churn", measured(ratio(12, 400), tool)), exampleState()],
    ["leakNotEnoughBelow", "leak", withEntry(exampleState(), "ret.logo-churn", undefined), exampleState()],
    ["leakLevel", "leak", withEntry(within, "ret.logo-churn", measured(ratio(6, 400), tool)), exampleState()],
    ["visibility", "visibility", exampleState(), allDocumented],
    ["visibilityOne", "visibility", withEntry(allDocumented, "rev.gross-margin", missing("no-access", "meeting")), exampleState()],
    ["visibilityAllDocumented", "visibility", allDocumented, exampleState()],
    ["unitEconomics", "unit-economics", withEntry(exampleState(), "rev.gross-margin", measured(ratio(80, 100), tool)), noMarginState()],
    ["unitEconomicsUnknown", "unit-economics", noMarginState(), withEntry(exampleState(), "rev.gross-margin", measured(ratio(80, 100), tool))],
    ["askMeasureFirst", "ask", exampleState(), allDocumented],
  ];
  for (const [key, id, yes, no] of cases) {
    it(key, () => {
      expect(slide(deck(yes), id).title.key).toBe(key);
      expect(slide(deck(no), id).title.key).not.toBe(key);
    });
  }

  it("ask: the team's ask when written — the goal built from the parts the team filled in", () => {
    const s = withTarget(exampleState(), "act.rate", 25);
    s.deck.ask = { what: "deux sprints produit", bullets: ["refaire l'onboarding"], measureFirst: ["ret.d30"], successMetric: "act.rate", successTarget: 25, horizon: { year: 2027, quarter: 1 } };
    const ask = slide(deck(s), "ask");
    expect(ask.title).toEqual({ key: "ask", values: { what: "deux sprints produit", goal: "taux d'activation de 18\u00a0% à 25\u00a0% d'ici T1\u00a02027" } });
    expect(renderTitle(ask.title, FR.strings)).toBe("Nous demandons **deux sprints produit** — objectif\u00a0: taux d'activation de 18\u00a0% à 25\u00a0% d'ici T1\u00a02027.");
    expect(ask.lines.map((l) => l.row)).toEqual(["bullet", "know", "measure"]);
    expect(slide(deck(exampleState()), "ask").title.key).not.toBe("ask");
    // Only the parts filled in: no metric, no « objectif : de  à  d'ici ».
    s.deck.ask = { ...s.deck.ask, successMetric: undefined, successTarget: undefined, horizon: undefined };
    expect(slide(deck(s), "ask").title).toEqual({ key: "askPlain", values: { what: "deux sprints produit" } });
  });

  it("ask: a slide that asks to measure first lists the number its title names", () => {
    const ask = slide(deck(exampleState()), "ask");
    expect(ask.title).toEqual({ key: "askMeasureFirst", values: { cost: "un sprint", metric: "rétention à J30" } });
    expect(ask.lines.filter((l) => l.row === "measure").map((l) => l.label)).toEqual(["Rétention à J30"]);
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
    // The assumption lives in the footer (§9.3), once — not also as a line of its own.
    expect(leak.lines.filter((l) => l.row === "assumption")).toEqual([]);
    expect(leak.lines.find((l) => l.row === "footer")!.text).toContain(FR.strings.slide.leakAssumption);
    // The stage mid-sentence, with its article, never capitalised: « pour la rétention », not « pour La rétention ».
    expect(leak.lines.find((l) => l.row === "blind")!.text).toBe("Sans chiffre pour la rétention à J30, l'étape qui freine vraiment peut s'y cacher.");
    expect(leak.lines.filter((l) => l.row === "aside")).toHaveLength(5);
    // Churn behind its target is ABOVE it — and priced from the same chain the title of its own slide would quote.
    expect(leak.lines.find((l) => l.row === "aside" && l.id === "ret.logo-churn")!.text).toBe("au-dessus de la cible · ~240\u00a0€ de MRR préservé par mois");
    expect(leak.notes).toContain("Pourquoi pas le churn logo\u00a0? — Au-dessus de la cible aussi, mais l'écart vaut ~240\u00a0€ de MRR préservé par mois, contre ~600\u00a0€ de MRR nouveau par mois.");
    // The team's target, in its own words — never a published range (C1).
    expect(renderTitle(leak.title, FR.strings)).toBe(
      "Ramener l'activation à 20 % (cible de l'équipe) vaudrait **~600 € de MRR nouveau** chaque mois.",
    );
    expect(leak.lines.find((l) => l.row === "footer")!.text).not.toMatch(/repère/);
  });

  it("visibility: 14 of 17 documented, the missing ones sorted from a meeting to a sprint", () => {
    // The margin estimated since C50 (A20.d T6): documented, one missing less.
    const v = slide(deck(exampleState()), "visibility");
    expect(v.title).toEqual({ key: "visibility", values: { documented: "14 chiffres sur 17", k: "3", repair: "entre une réunion et un sprint" } });
    expect(renderTitle(v.title, FR.strings)).toBe("On documente **14 chiffres sur 17**. Les 3 qui manquent se réparent entre une réunion et un sprint.");
    expect(v.lines.filter((l) => l.row === "missing").map((l) => l.repair)).toEqual(["une réunion", "un sprint", "un sprint"]);
  });

  it("unit economics: without a margin, the margin is named as missing", () => {
    const title = slide(deck(noMarginState()), "unit-economics").title;
    expect(title).toEqual({ key: "unitEconomicsUnknown", values: { input: "la marge brute" } });
    expect(renderTitle(title, FR.strings)).toBe("**On ne peut pas encore dire ce que rapporte un client.** Il manque la marge brute.");
    expect(renderTitle(slide(deck(noMarginState(), "en"), "unit-economics").title, EN.strings)).toBe("**We can't yet say what a customer is worth.** Missing: gross margin.");
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
          for (const [key, v] of Object.entries(line)) if (!["text", "formula", "metric", "number", "label"].includes(key) && !ALLOWED.test(v)) bad.push(`${key}: ${v}`);
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
    expect(titles.map((t) => t.slice(0, 5))).toEqual(["## 1.", "## 2.", "## 3.", "## 4.", "## 5.", "## 6.", "## 7."]);
    expect(titles[1]).toContain("**~600 € de MRR nouveau**");
    expect(md).toContain("Données\u00a0: mesurées 11 · approximatives 3 · introuvables 2");
    expect(md).toContain("> ");
    // A title-only slide is not followed by an empty body: never two blank lines in a row.
    expect(md).not.toContain("\n\n\n");
  });
});

// The slides' open issues, held in the model where the words are chosen.
// Non-vacuity, measured: making `know.current` depend on the `ask` title
// again fails the first test; reading the verdict counts' plural key
// unconditionally fails the second; dropping `lowerFirst` from the metric
// row's status (or the annex's basis source) fails the third; formatting
// the Tour footer with the score template whatever the total fails the
// fourth, and sentences-guard's "no undefined" with it.
describe("the model's words, where the slides used to assemble them", () => {
  it("ask: a measured success metric shows its current value under the « measure first » title too", () => {
    const s = exampleState();
    s.deck.ask = { what: "", bullets: [], measureFirst: [], successMetric: "act.rate", successTarget: 25 };
    const ask = slide(deck(s), "ask");
    expect(ask.title.key).toBe("askMeasureFirst");
    const know = ask.lines.find((l) => l.row === "know")!;
    expect(know.current).toBe("18 %");
    expect(know.target).toBe("25 %");
  });

  it("mirror: each count's label agrees with it, and a bridge's tag is singular", () => {
    const result = tourResult({ "ret-1": 0, "acq-1": 0, "act-1": 1 });
    const linked: EngineState = { ...exampleState(), tourLink: { resultId: result.id, linkedAt: "x" } };
    for (const locale of ["fr", "en"] as const) {
      const mirror = slide(deck(linked, locale, result), "mirror");
      const counts = mirror.lines.filter((l) => l.row === "verdictCount");
      const one = props[locale].strings.mirror;
      // Blind spots lead (§8.5); a verdict nobody reached is no line.
      expect(counts.map((l) => [l.id, l.value])).toEqual([
        ["blind-spot", "1"],
        ["better", "1"],
        ["coherent", "1"],
      ]);
      expect(counts.map((l) => l.label)).toEqual([one.blindSpotOne, one.betterOne, one.coherentOne]);
      const bridges = mirror.lines.filter((l) => l.row === "bridge");
      expect(bridges[0]).toMatchObject({ verdict: "blind-spot", tag: one.blindSpotOne });
    }
    // Two of a kind take the plural: the top channel missing too makes two declared-but-not-found.
    const two = tourResult({ "ret-1": 0, "acq-1": 0 });
    const both: EngineState = {
      ...withEntry(exampleState(), "acq.top-channel-share", missing("not-tracked", "sprint")),
      tourLink: { resultId: two.id, linkedAt: "x" },
    };
    for (const locale of ["fr", "en"] as const) {
      const counts = slide(deck(both, locale, two), "mirror").lines.filter((l) => l.row === "verdictCount");
      expect(counts[0]).toMatchObject({ id: "blind-spot", value: "2", label: props[locale].strings.mirror.blindSpot });
    }
  });

  it("a « · » line goes on in lower case: status, variant and a basis are not capitalised mid-line", () => {
    // A tool or a role keeps its capital (« Amplitude », « Finance »): those are names, not words the model capitalised.
    for (const locale of ["fr", "en"] as const) {
      const words = props[locale].strings;
      const lines = deck(exampleState(), locale).slides.flatMap((s) => s.lines);
      for (const l of lines.filter((x) => x.row === "metric")) expect(l.text!.split(" · ")[1], l.text).toMatch(/^\p{Ll}/u);
      expect(lines.find((l) => l.row === "cac")!.text).toBe(locale === "fr" ? "500 € · média seul" : "€500 · media only");
      const statuses = Object.values(words.status);
      const bases = Object.values(words.basis);
      for (const l of lines.filter((x) => x.row === "annex")) {
        const parts = l.text!.split(" · ");
        expect(parts.filter((p) => statuses.includes(p) || bases.includes(p) || p === words.source.other), l.text).toEqual([]);
      }
    }
  });

  it("the Tour footer never prints « /100 » without a score", () => {
    const result = tourResult({ "ret-1": 0 }, { total: undefined });
    const linked: EngineState = { ...exampleState(), tourLink: { resultId: result.id, linkedAt: "x" } };
    for (const locale of ["fr", "en"] as const) {
      const footer = slide(deck(linked, locale, result), "mirror").lines.find((l) => l.row === "tourFooter")!;
      expect(footer.text).not.toContain("/100");
      expect(footer.text).toContain(locale === "fr" ? "1er septembre 2026" : "September 1, 2026");
    }
  });
});

// Engine spec §10.4 prescribes the glyphs of the COPY; this is what a user's
// own words get. Non-vacuity, measured: returning the text unchanged fails
// every case but the plain one; dropping the Latin fold fails « Škoda »
// only; keeping every letter-less character fails the emoji case and the
// test of the model applying it.
describe("slideGlyphs — the user's words in the slide fonts", () => {
  /** §10.4: printable Latin-1 (U+00A0 included) plus – — ’ « » … € · × ÷ ±, and the two arrows SlideText draws. */
  const SLIDE = /^[ -~ -ÿ–—’«»…€·×÷±→←]*$/u;

  it("leaves ordinary words alone", () => {
    expect(slideGlyphs("Refaire l'onboarding · 2 sprints à 24 000 €")).toBe("Refaire l'onboarding · 2 sprints à 24 000 €");
  });

  it("drops emoji, pictographs and their joiners, and trims what they leave", () => {
    expect(slideGlyphs("🚀 Relancer l'onboarding 👩‍💻✨")).toBe("Relancer l'onboarding");
    expect(slideGlyphs("Acme ™ ®")).toBe("Acme ®");
  });

  it("turns typed look-alikes into the glyphs the fonts carry", () => {
    // A French keyboard's narrow no-break space (U+202F) before « : » and inside « » — absent from Stardos and Plex.
    expect(slideGlyphs("« a créé un projet » :")).toBe("« a créé un projet » :");
    expect(slideGlyphs("“quoted” ≥ 3 ≈ 5 • cœur")).toBe('"quoted" >= 3 ~ 5 · coeur');
    expect(slideGlyphs("été")).toBe("été");
  });

  it("folds a Latin accent the fonts lack, keeps a name in another script whole", () => {
    // « ó » is Latin-1 and stays; « Š » and « ź » fold; « Ł » has no decomposition, so it stays as typed.
    expect(slideGlyphs("Škoda Łódź")).toBe("Skoda Łódz");
    expect(slideGlyphs("株式会社 Growth")).toBe("株式会社 Growth");
  });

  it("the model applies it to every user-written field, so slide and text export agree", () => {
    let s = withEntry(exampleState(), "act.rate", measured(ratio(144, 800), undefined, { definitionNote: "🚀 un projet édité" }));
    // The activation event is the user's own name for it: it reaches the annex through the formula.
    s = withEntry(s, "act.event", measured({ kind: "text", text: "a créé un projet ✨" }, { kind: "other" }));
    s.setup.companyLabel = "Acme 🚀";
    s.deck.showCompany = true;
    s.deck.ask = { what: "deux sprints 🔥", bullets: ["💡 refaire l'onboarding"], measureFirst: [] };
    const model = deck(s);
    expect(model.kicker.company).toBe("Acme · ");
    const ask = slide(model, "ask");
    expect(ask.title.values.what).toBe("deux sprints");
    expect(ask.lines.find((l) => l.row === "bullet")!.text).toBe("refaire l'onboarding");
    const annex = slide(model, "annex").lines.find((l) => l.id === "act.rate")!;
    expect(annex.definition).toBe("un projet édité");
    expect(annex.formula).not.toContain("✨");
    for (const text of [deckMarkdown(model, FR.strings), JSON.stringify(model.slides.map((x) => x.lines))]) {
      const outside = [...new Set([...text.replace(/\\n|\n/g, " ")].filter((c) => !SLIDE.test(c)))];
      expect(outside).toEqual([]);
    }
  });
});

// Non-vacuity, measured: pricing every gain (dropping `gain.lo >= 1`) fails
// "a loss… gets the plain title" only; slide-ing a target that prints as
// today's value fails "…is no slide" only; a U+2212 minus in the copy fails
// the fonts check only (it is not in the slide fonts, §10.4).
describe("the what-if slides (2026-09-26)", () => {
  const withWhatIf = (targets: EngineState["whatIf"], state = exampleState()): EngineState => ({ ...state, whatIf: targets });
  const ids = (model: DeckModel) => model.slides.map((s) => s.id);
  const row = (s: DeckModel["slides"][number], kind: string, id: string) => s.lines.find((l) => l.row === kind && l.id === id)!;

  it("one slide per lever moved, after the leak, in lever order; « scenario » only from two", () => {
    expect(ids(deck(exampleState())).some((id) => id.startsWith("whatif:") || id === "scenario")).toBe(false);
    expect(ids(deck(withWhatIf({ "act.rate": 24 })))).toEqual(["peloton", "leak", "whatif:act.rate", "visibility", "unit-economics", "mirror", "ask", "annex", "annex:2"]);
    // Typed in the reverse order: the deck still follows the levers' order.
    const two = deck(withWhatIf({ "ret.logo-churn": 1.5, "act.rate": 24 }));
    expect(ids(two).slice(1, 5)).toEqual(["leak", "whatif:act.rate", "whatif:ret.logo-churn", "scenario"]);
    expect(two.slides.filter((s) => s.id.startsWith("whatif:") || s.id === "scenario").every((s) => s.present && s.included)).toBe(true);
  });

  it("a target that prints as today's value, or on a number nobody entered, is no slide", () => {
    expect(ids(deck(withWhatIf({ "act.rate": 18 })))).not.toContain("whatif:act.rate");
    const noArpa = withEntry(exampleState(), "rev.arpa", undefined);
    expect(ids(deck(withWhatIf({ "rev.arpa": 150 }, noArpa)))).not.toContain("whatif:rev.arpa");
  });

  it("excluding one gives up its number", () => {
    const state = withWhatIf({ "act.rate": 24, "ret.logo-churn": 1.5 });
    state.deck.include["whatif:act.rate"] = false;
    const model = deck(state);
    expect(slide(model, "whatif:act.rate")).toMatchObject({ included: false, index: null });
    expect(slide(model, "whatif:ret.logo-churn").index).toBe(3);
  });

  it("a gain is priced in the title, and the title quotes the same amount the table's first row prints", () => {
    for (const locale of ["fr", "en"] as const) {
      const s = slide(deck(withWhatIf({ "act.rate": 24 }), locale), "whatif:act.rate");
      expect(s.title.key).toBe("whatIfLever");
      const mrr12 = row(s, "kpi", "mrr12");
      expect(mrr12.tone).toBe("moved");
      // The same amount; the change column drops the title's "~" (the "with" column beside it carries it).
      expect(s.title.values.gain).toMatch(/^~/);
      expect(mrr12.change).toBe(`+${s.title.values.gain!.slice(1)}`);
    }
  });

  it("a loss, or a gain nobody can price, gets the plain title — never « would gain » a negative", () => {
    expect(slide(deck(withWhatIf({ "act.rate": 12 })), "whatif:act.rate").title.key).toBe("whatIfLeverPlain");
    const both = deck(withWhatIf({ "act.rate": 12, "rev.arpa": 90 }));
    expect(slide(both, "scenario").title).toEqual({ key: "scenarioPlain", values: { n: "2" } });
  });

  it("a change never glues its sign to a tilde: « +1 200 », not « +~1 200 »", () => {
    const model = deck(withWhatIf({ "ref.referred-share": 10, "rev.paid-conversion": 10 }), "en");
    const changes = model.slides.filter((s) => s.id.startsWith("whatif:")).flatMap((s) => s.lines.map((l) => l.change ?? ""));
    expect(changes.filter(Boolean).length).toBeGreaterThan(5);
    expect(changes.filter((c) => /[+\u2013]~/.test(c))).toEqual([]);
  });

  it("activation moves what it feeds, and leaves the visitors and sign-ups alone", () => {
    const s = slide(deck(withWhatIf({ "act.rate": 24 })), "whatif:act.rate");
    expect(row(s, "funnelStep", "visitors").tone).toBe("stable");
    expect(row(s, "funnelStep", "signups").tone).toBe("stable");
    expect(row(s, "funnelStep", "activated").tone).toBe("moved");
    expect(row(s, "funnelStep", "paying").tone).toBe("moved");
    // Churn didn't move: the NRR says so, in a word.
    expect(row(s, "kpi", "nrr")).toMatchObject({ tone: "stable", change: FR.strings.slide.whatIfStable });
  });

  /**
   * The slide and the tile print the same pair (Antoine, 2026-09-28): this
   * scenario's table read « ~100 000 € | ~110 000 € | +3 000 € » and
   * « GRR 96 % | 96 % | –0,6 point », while the tile showed no change at all.
   */
  it("today → with the what-ifs: a digit more when the change is finer than the rounding, as on the tiles", () => {
    const s = slide(deck(withWhatIf({ "acq.signup-rate": 3.6, "ret.logo-churn": 3.1 })), "scenario");
    expect(row(s, "kpi", "mrr12")).toMatchObject({ tone: "moved", today: "~104\u00a0000\u00a0€", projected: "~107\u00a0000\u00a0€" });
    expect(row(s, "kpi", "nrr")).toMatchObject({ tone: "moved", today: "99,6\u00a0%", projected: "99,0\u00a0%" });
    expect(row(s, "kpi", "arr12")).toMatchObject({ today: "~1\u00a0250\u00a0000\u00a0€", projected: "~1\u00a0290\u00a0000\u00a0€" });
  });

  // Every lever across its slider's range. Non-vacuity, measured: without the visitors' `round`,
  // the referred share printed « ~26 000 | ~26 000 | –490 » and this fails on it.
  it("a row never says a change between two figures that print the same", () => {
    const moved: string[] = [];
    for (const lever of buildScenario(exampleState(), {}, CTX_FR).levers.filter((l) => l.today)) {
      for (let k = 0; k <= 8; k += 1) {
        const target = lever.min + ((lever.max - lever.min) * k) / 8;
        for (const s of deck(withWhatIf({ [lever.id]: target })).slides.filter((x) => x.id.startsWith("whatif:"))) {
          for (const line of s.lines.filter((l) => l.tone === "moved")) {
            expect(line.projected, `${lever.id}@${target} ${line.id}: ${line.today} → ${line.change}`).not.toBe(line.today);
            moved.push(`${lever.id}@${target} ${line.id}`);
          }
        }
      }
    }
    expect(moved.length).toBeGreaterThan(100);
  });

  it("a figure nobody can compute prints nothing, never 0: without a margin, no LTV", () => {
    const ltv = row(slide(deck(withWhatIf({ "act.rate": 24 }, noMarginState())), "whatif:act.rate"), "kpi", "ltv");
    expect(ltv).toMatchObject({ tone: "unknown", today: "", projected: "", change: "" });
  });

  it("together: one line per lever with its own gain, and the compounding said when the whole is worth more than the sum", () => {
    const s = slide(deck(withWhatIf({ "act.rate": 24, "ret.logo-churn": 1.5 })), "scenario");
    expect(s.title).toMatchObject({ key: "scenario", values: { n: "2" } });
    const levers = s.lines.filter((l) => l.row === "lever");
    expect(levers.map((l) => l.id)).toEqual(["act.rate", "ret.logo-churn"]);
    expect(levers.every((l) => l.gain?.startsWith("+"))).toBe(true);
    // More customers activated, each kept longer: the extra is what `together` names.
    const [before] = FR.strings.scenario.together.split("{total}");
    expect(s.lines.find((l) => l.row === "together")?.text?.startsWith(before!)).toBe(true);
  });

  it("every value the what-if slides inject prints in the slides' fonts", () => {
    const bad: string[] = [];
    for (const locale of ["fr", "en"] as const) {
      const model = deck(withWhatIf({ "acq.signup-rate": 4, "act.rate": 24, "ret.logo-churn": 1.5, "rev.arpa": 90 }), locale);
      for (const s of model.slides.filter((x) => x.id.startsWith("whatif:") || x.id === "scenario")) {
        for (const v of Object.values(s.title.values)) if (!ALLOWED.test(v)) bad.push(`${s.id} title: ${v}`);
        for (const line of s.lines) for (const [key, v] of Object.entries(line)) if (!ALLOWED.test(v)) bad.push(`${s.id} ${key}: ${v}`);
      }
    }
    expect(bad).toEqual([]);
  });
});

/**
 * The what-if slides of design system extension 09 (Q11, A20.d T4.b): the
 * table's rows, the curve each slide draws, and the compounding the
 * « together » slide draws — on the film's SaaS, whose figures the return
 * printed.
 */
describe("the what-if slides, extension 09 (A20.d T4.b)", () => {
  const film = (targets: EngineState["whatIf"]) => deck({ ...filmState(), whatIf: targets });
  const row = (s: DeckModel["slides"][number], kind: string, id: string) => s.lines.find((l) => l.row === kind && l.id === id)!;
  const N = "\u00a0";
  const nb = (t: string) => t.replace(/\^/g, N);

  it("one table: the MRR and the ARR in twelve months, the NRR, one new customer, the cash — no new MRR, no GRR", () => {
    const s = slide(film({ "ret.logo-churn": 4 }), "whatif:ret.logo-churn");
    expect(s.lines.filter((l) => l.row === "kpi").map((l) => l.id)).toEqual(["mrr12", "arr12", "nrr", "cac", "ltv", "ltvCac", "payback", "cash"]);
    expect(row(s, "kpi", "ltvCac")).toMatchObject({ today: nb("0,79^fois"), projected: nb("1,2^fois"), tone: "moved" });
    // Churn moves neither the payback nor the cash (§20.9).
    expect(row(s, "kpi", "cash")).toMatchObject({ tone: "stable", today: nb("~990^000^€") });
  });

  it("each lever's slide draws the MRR month by month, today's pace against this what-if", () => {
    const s = slide(film({ "ret.logo-churn": 4 }), "whatif:ret.logo-churn");
    expect(s.curve!.today).toHaveLength(13);
    expect(s.curve!.today[0]).toEqual([48_000, 48_000]);
    expect(s.curve!.whatif![12]![0]).toBeCloseTo(93_556, 0);
    expect(s.curve!.keys).toEqual({ today: "au rythme d'aujourd'hui", whatif: nb("avec cet «^Et si^»") });
    expect(s.curve!.start).toBe(nb("48^000^€ aujourd'hui"));
  });

  it("« together » draws the film's three levers: each alone, added up, together (the return's figures)", () => {
    const s = slide(film(FILM_LEVERS), "scenario");
    expect(s.curve!.keys.whatif).toBe(nb("avec les 3 «^Et si^»"));
    expect(s.leverSum!.rows.map((r) => r.value)).toEqual([nb("+18^000^€"), nb("+13^000^€"), nb("+6^400^€")]);
    expect(s.leverSum!.sum).toMatchObject({ label: "Chacun seul, additionnés", value: nb("~38^000^€") });
    expect(s.leverSum!.together).toMatchObject({ label: "Ensemble", value: nb("+42^000^€") });
    expect(s.leverSum!.together.amount).toBeGreaterThan(s.leverSum!.sum.amount);
  });

  it("no ARPA: no curve to draw, the table alone", () => {
    const s = slide(deck({ ...withEntry(filmState(), "rev.arpa", undefined), whatIf: { "act.rate": 24 } }), "whatif:act.rate");
    expect(s.curve).toBeUndefined();
  });

  it("sales-assisted: the same rows, its NRR over twelve months, its own curve", () => {
    const s = slide(deck({ ...hybridState(), whatIf: { "slg.rev.win-rate": 30 } }), "whatif:slg.rev.win-rate");
    expect(s.lines.filter((l) => l.row === "kpi").map((l) => l.id)).toEqual(["mrr12", "arr12", "nrr", "cac", "ltv", "ltvCac", "payback", "cash"]);
    expect(row(s, "kpi", "nrr").label).toBe(FR.strings.scenario.kpiNrr12);
    expect(s.curve!.today).toHaveLength(13);
  });
});

// A20.d T4.c (design system extension 09, Q12): the unit economics with the money. Non-vacuity, measured: see the
// journal's entry for T4.c (dropping the move to nº 2, the loss title, and the warning's « nous » each fail here).
describe("A20.d T4.c — the unit economics with the money", () => {
  const unit = (model: DeckModel) => slide(model, "unit-economics");
  const row = (model: DeckModel, kind: string) => unit(model).lines.find((l) => l.row === kind);
  const order = (model: DeckModel) => model.slides.filter((s) => s.included).map((s) => s.id);
  /** The film's SaaS with churn at 2 %: counted 36 months, a CAC of 2 900 € paid back in 32 — no loss, past the floor. */
  const late = () => withEntry(withEntry(filmState(), "ret.logo-churn", measured(ratio(8, 400), tool)), "acq.cac", measured({ kind: "amount", amount: 2_900 }));

  it("a certain loss titles the slide in ink and moves it right after the funnel (C48, C53)", () => {
    const model = deck(filmState());
    expect(order(model).slice(0, 3)).toEqual(["peloton", "unit-economics", "leak"]);
    expect(unit(model).index).toBe(2);
    expect(unit(model).title).toEqual({ key: "unitEconomicsLoss", values: { cac: "1 900 €", ltv: "~1 500 €", gap: "~400 €" } });
    expect(renderTitle(unit(deck(filmState(), "en")).title, EN.strings)).toBe("Each new customer costs us €1,900 and brings back ~€1,500: **we lose ~€400 on each one**.");
    expect(deck(filmState(), "en").slides.find((s) => s.id === "unit-economics")!.title.values).toEqual({ cac: "€1,900", ltv: "~€1,500", gap: "~€400" });
  });

  it("the loss in months and in cash: the customer leaves first, the cash does not all come back, no warning", () => {
    const model = deck(filmState());
    expect(row(model, "after")).toMatchObject({ value: "–4 mois", note: "part ~4 mois avant d'avoir remboursé" });
    expect(row(model, "cash")).toMatchObject({ note: FR.strings.slide.unitNotAllBack });
    expect(row(model, "cash")!.value).toMatch(/^~/);
    // A customer who leaves before paying back is the loss, not a late return (§20.5) — even past a 12-month runway.
    expect(row(model, "warning")).toBeUndefined();
    const shortRunway = filmState();
    shortRunway.setup = { ...shortRunway.setup, runwayMonths: 12 };
    expect(row(deck(shortRunway), "warning")).toBeUndefined();
    expect(row(model, "assume")!.text).toBe(FR.strings.slide.unitAssume);
  });

  it("GRR and NRR are one line with their approximation, no longer two tiles", () => {
    const lines = unit(deck(filmState())).lines;
    expect(lines.map((l) => l.row)).not.toContain("grr");
    expect(lines.map((l) => l.row)).not.toContain("nrr");
    expect(row(deck(filmState(), "en"), "retention")!.text).toBe(
      "Monthly GRR 93% · NRR 95% — approximate: logo churn stands in for revenue churn, as if the customers who left paid the average ARPA.",
    );
  });

  it("the LTV:CAC prints the commonly cited 3:1 in context, from the catalogue — never as a verdict", () => {
    expect(row(deck(filmState()), "ltvCac")).toMatchObject({ value: "0,79\u00a0fois", note: "repère couramment cité : environ 3 pour 1" });
    expect(row(deck(filmState(), "en"), "ltvCac")!.text).toBe("0.79× · commonly cited reference: about 3:1");
  });

  it("the picture tells the loss: the margin line stops short of the cost, the bracket is the loss itself", () => {
    const chart = unit(deck(filmState())).paybackChart!;
    expect(chart).toMatchObject({ story: "loss", cac: [1900, 1900], monthlyMargin: [90, 90], reference: 12 });
    expect(chart.labels).toMatchObject({ short: "il manque ~400 €", paysBack: "rembourserait à 21 mois", leaves: "part vers 17 mois" });
    expect(chart.summary).toContain("à ~400 € des 1 900 € qu'il a coûté");
  });

  it("no certain loss: the v1 title, the slide in its place; a payback of 30 months or more warns in the slide's « nous » (C49)", () => {
    const model = deck(late());
    expect(unit(model).title.key).toBe("unitEconomics");
    expect(order(model).indexOf("unit-economics")).toBe(3);
    expect(row(model, "warning")!.text).toBe("Rembourser un client prend 32 mois : 30 mois ou plus. Nous gagnons de l'argent, mais tard.");
    expect(row(model, "after")).toMatchObject({ value: "~4 mois", note: "" });
    const chart = unit(model).paybackChart!;
    expect(chart.story).toBe("pays-back");
    // Counted to the cap, the customer doesn't « leave at 36 months ».
    expect(chart.labels).toMatchObject({ paysBack: "remboursé : 32 mois", after: "~4 mois de marge après", leaves: "compté jusqu'à 36 mois, le plafond" });
  });

  it("with a runway typed, the warning holds the payback against it", () => {
    const state = late();
    state.setup = { ...state.setup, runwayMonths: 24 };
    expect(row(deck(state, "en"), "warning")!.text).toBe(
      "Paying back a customer takes 32 months, longer than our runway (24 months): we make money, but maybe after our cash runs out.",
    );
  });

  it("no margin: every money tile is « ? » and says so, the picture is the « ? » box under a known cost", () => {
    const model = deck(noMarginState());
    expect(row(model, "after")).toMatchObject({ value: "", text: "il manque la marge brute" });
    expect(row(model, "cash")).toMatchObject({ value: "", text: "il manque la marge brute" });
    expect(row(model, "assume")).toBeUndefined();
    expect(unit(model).paybackChart).toMatchObject({ story: "unknown", monthlyMargin: null, cac: [500, 500], labels: { unknown: "il manque la marge brute", leaves: "", paysBack: "" } });
  });

  it("no CAC: no picture — its cost line is the one thing it can't do without", () => {
    expect(unit(deck(withEntry(filmState(), "acq.cac", undefined))).paybackChart).toBeUndefined();
  });

  it("sales-assisted alone: the same money, no GRR or NRR line, and a certain loss moves it to nº 2", () => {
    const state = withEntry(salesAssistedState(), "slg.rev.gross-margin", measured(ratio(10, 100), tool));
    const model = deck(state);
    expect(unit(model).title.key).toBe("unitEconomicsLoss");
    expect(order(model).slice(0, 3)).toEqual(["slg:peloton", "unit-economics", "slg:leak"]);
    expect(unit(model).lines.map((l) => l.row)).toEqual(expect.arrayContaining(["after", "cash", "assume"]));
    expect(row(model, "retention")).toBeUndefined();
    // Its 12-month NRR may exceed 100 %: expansion may outpace non-renewals, and the cash figure is no longer a floor.
    expect(row(model, "assume")!.text).toBe(FR.strings.slide.unitAssumeSlgOutpaced);
    expect(unit(model).paybackChart!.story).toBe("loss");
  });
});
