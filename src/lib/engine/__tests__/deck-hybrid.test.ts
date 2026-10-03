import { describe, expect, it } from "vitest";
import { buildDeck, deckMarkdown, renderTitle } from "../deck";
import { deriveEngine } from "../derive";
import type { DeckModel, EngineState } from "../types";
import { CTX_EN, CTX_FR, EN, FR } from "./props";
import { QUESTIONS } from "../../../content/copy-library";
import { estimated, exampleState, hybridLossState, hybridState, measured, missing, ratio, salesAssistedState, tourResult, withEntry, withMonthBefore, withTarget } from "./fixtures";

/**
 * The deck with sales-assisted ticked (engine spec §18.8, A7.3.c S4): which
 * slides, in which order, in the three configurations; the slides only the
 * hybrid has; each new title on a case that triggers it and one that
 * doesn't; title = body; and the fixed order — the two motions' values never
 * reorder a slide, a block or a column (§18.6.4). Self-serve alone is the v1
 * deck to the character, which golden-v1.test.ts holds.
 *
 * Non-vacuity, measured on 2026-10-01: putting sales-assisted's slides before
 * self-serve's fails « the hybrid's order » ; sorting the total's blocks by
 * MRR fails « fixed order » ; letting a blind motion keep its leak fails
 * « a blind motion » ; dropping `byMotion` from the hybrid fails « each
 * motion's chrome » ; not counting the appendix's group headings fails
 * « the hybrid's order » (one page fewer). Proposing a stage when both
 * motions name one is ask-defaults.test.ts's.
 */

const P = { fr: { ...FR, ctx: CTX_FR }, en: { ...EN, ctx: CTX_EN } } as const;
const NB = " ";
const nb = (s: string) => s.replace(/\^/g, NB);

/** Every question answered: each bridge has a verdict, sales-assisted's computed figures included. */
const TOUR = tourResult(Object.fromEntries(QUESTIONS.map((q, i) => [q.id, (i % 3) as 0 | 1 | 2])));

function deckOf(state: EngineState, locale: "fr" | "en" = "fr"): DeckModel {
  const p = P[locale];
  const derived = deriveEngine(state, p.ctx, state.tourLink ? TOUR : null, p.bridges, p.strings.units);
  return buildDeck(state, derived, p.strings, p.metrics, p.ctx, { derived: p.derived, bridges: p.bridges });
}
const ids = (deck: DeckModel) => deck.slides.filter((s) => s.present).map((s) => s.id);
const slide = (deck: DeckModel, id: string) => deck.slides.find((s) => s.id === id)!;
const title = (deck: DeckModel, id: string, locale: "fr" | "en" = "fr") => renderTitle(slide(deck, id).title, P[locale].strings);
const moved = (state: EngineState): EngineState => ({ ...state, whatIf: { "act.rate": 24, "slg.rev.win-rate": 30, "link.pql-handoff": 40 } });

describe("which slides, in which order (§18.8.1)", () => {
  it("the hybrid: the total, self-serve's, sales-assisted's (the link last), then the shared ones", () => {
    expect(ids(deckOf(moved(hybridState())))).toEqual([
      "total",
      "peloton",
      "leak",
      "whatif:act.rate",
      "slg:peloton",
      "slg:leak",
      "whatif:slg.rev.win-rate",
      "whatif:link.pql-handoff",
      "slg:scenario",
      "visibility",
      "unit-economics",
      "ask",
      "annex",
      "annex:2",
      "annex:3",
      "annex:4",
      "annex:5",
    ]);
  });

  it("sales-assisted alone: the same order without the total or a self-serve slide — and no link lever", () => {
    const deck = deckOf(moved(salesAssistedState()));
    expect(ids(deck)).toEqual(["slg:peloton", "slg:leak", "whatif:slg.rev.win-rate", "visibility", "unit-economics", "ask", "annex", "annex:2"]);
    expect(deck.byMotion).toBeUndefined();
  });

  it("the mirror stays out by default, in the hybrid too (D13)", () => {
    const deck = deckOf(hybridState());
    expect(slide(deck, "mirror").included).toBe(false);
  });

  it("a Tour linked to the hybrid: one mirror row per question and motion, sales-assisted's computed figures named", () => {
    // Found by the e2e on 2026-10-01: the mirror looked a computed figure up among self-serve's alone and threw.
    const state = hybridState();
    state.tourLink = { resultId: TOUR.id, linkedAt: "2026-09-24T09:00:00.000Z" };
    const bridges = slide(deckOf(state), "mirror").lines.filter((l) => l.row === "bridge");
    expect(bridges.some((b) => b.motion === "slg" && b.id === "slg.rev.ltv" && b.label !== "")).toBe(true);
    expect(new Set(bridges.map((b) => b.motion))).toEqual(new Set(["plg", "slg"]));
  });

  it("a blind motion loses its leak, keeps its funnel; both blind, visibility comes right after the total", () => {
    // One sales-assisted ★ known — the win rate, below its target: its leak would say so, but under two ★ the
    // message is « we can't see that engine yet » (§18.8.1).
    let state = hybridState();
    for (const id of ["slg.acq.lead-to-opp", "slg.ret.renewal", "slg.ref.referred-share"] as const) state = withEntry(state, id, missing("not-tracked", "sprint"));
    const slgBlind = deckOf(state);
    expect(slide(slgBlind, "slg:leak").present).toBe(false);
    expect(ids(slgBlind)).toContain("slg:peloton");
    expect(ids(slgBlind).indexOf("visibility")).toBeGreaterThan(ids(slgBlind).indexOf("slg:peloton"));
    for (const id of ["act.rate", "ret.d30", "rev.paid-conversion", "acq.signup-rate", "ref.referred-share"] as const) state = withEntry(state, id, missing("not-tracked", "sprint"));
    const bothBlind = deckOf(state);
    expect(ids(bothBlind).slice(0, 2)).toEqual(["total", "visibility"]);
    expect(ids(bothBlind)).not.toContain("leak");
  });
});

describe("« deux moteurs, un total » on a slide", () => {
  it("title = body: the title's three amounts are the blocks' and the sum's own strings", () => {
    const deck = deckOf(hybridState());
    const total = slide(deck, "total");
    expect(title(deck, "total")).toBe(nb("Le MRR atteint **228^000^€**^: 48^000^€ en libre-service, 180^000^€ en assisté."));
    const blocks = total.lines.filter((l) => l.row === "totalBlock");
    expect(blocks.map((b) => [b.id, b.mrr])).toEqual([
      ["plg", total.title.values.plg],
      ["slg", total.title.values.slg],
    ]);
    // Each block names its stage and the slide it is on.
    expect(blocks.map((b) => b.stage)).toEqual(["L'activation (slide 3)", "Le taux de closing (slide 5)"]);
    expect(total.lines.find((l) => l.row === "link")!.text).toBe(nb("31 opportunités sont venues du libre-service (juin à août 2026)."));
    expect(total.notes.some((n) => n.includes("(slides 3 et 5)"))).toBe(true);
  });

  it("a slide excluded is no « (slide n) »; the lever's note cites the link's own slide", () => {
    const state = moved(hybridState());
    state.deck.include.leak = false;
    const deck = deckOf(state);
    const blocks = slide(deck, "total").lines.filter((l) => l.row === "totalBlock");
    expect(blocks[0]!.stage).toBe("L'activation");
    const k = slide(deck, "whatif:link.pql-handoff").index!;
    expect(slide(deck, "total").notes.some((n) => n.includes(`(slide ${k})`) && n.includes("40") && n.includes("31"))).toBe(true);
  });

  it("fixed order: sales-assisted's MRR below self-serve's moves nothing — no slide, no block, no column", () => {
    // 4 800 € of sales-assisted MRR against 48 000 € of self-serve: the order is the same as with 180 000 €.
    const small = withEntry(hybridState(), "slg.rev.arpa", measured(ratio(4_800, 100), { kind: "tool", tool: "stripe" }));
    const deck = deckOf(small);
    expect(ids(deck)).toEqual(ids(deckOf(hybridState())));
    expect(slide(deck, "total").lines.filter((l) => l.row === "totalBlock").map((b) => b.id)).toEqual(["plg", "slg"]);
    expect(slide(deck, "total").title.values).toEqual({ total: nb("52^800^€"), plg: nb("48^000^€"), slg: nb("4^800^€") });
  });

  it("no total slide without sales-assisted, and none in sales-assisted alone", () => {
    expect(ids(deckOf(exampleState()))).not.toContain("total");
    expect(ids(deckOf(salesAssistedState()))).not.toContain("total");
  });
});

describe("sales-assisted's slides", () => {
  it("the relays: the title of §18.9, one row per relay on its own base, the footer that says so", () => {
    const deck = deckOf(hybridState());
    expect(title(deck, "slg:peloton")).toBe(
      nb("Sur 100 MQL, 15 deviennent une opportunité^; sur 100 opportunités conclues, 24 sont signées. **Au-delà, on ne sait pas les suivre^: on ne mesure pas la mise en production.**"),
    );
    const relays = slide(deck, "slg:peloton").lines.filter((l) => l.row === "relay");
    expect(relays.map((r) => [r.id, r.value, r.stamp !== ""])).toEqual([
      ["slg.acq.lead-to-opp", "15", false],
      ["slg.rev.win-rate", "24", true],
      ["slg.act.go-live", "", false],
    ]);
    expect(slide(deck, "slg:peloton").lines.find((l) => l.row === "footer")!.text).toBe("Chaque grille a sa propre base de 100 · HubSpot");
  });

  it("slg:leak: title = body — the title's amount is the chain's per-month line", () => {
    const leak = slide(deckOf(hybridState()), "slg:leak");
    expect(leak.title.key).toBe("leakClearMrrNew");
    expect(leak.title.values.amount).toBe(nb("~4^000^€"));
    expect(leak.lines.some((l) => l.row === "calc" && (l.text ?? "").includes(leak.title.values.amount!))).toBe(true);
    expect(leak.lines.find((l) => l.row === "footer")!.text).toBe("Toutes choses égales par ailleurs · le même nombre d'opportunités conclues");
  });

  it("slg:leak: the referred share of opportunities named — its chain, its assumption; past 50 %, the ceiling said (§19.3.2)", () => {
    // The win rate and lead → opportunity past lowered targets: the referred share (20 % → 30 %) is the leak, at ~2 000 € a month.
    const named = withTarget(withTarget(withTarget(hybridState(), "slg.rev.win-rate", 20), "slg.acq.lead-to-opp", 12), "slg.ref.referred-share", 30);
    const leak = slide(deckOf(named), "slg:leak");
    expect(leak.title.key).toBe("leakClearMrrNew");
    expect(leak.title.values.amount).toBe(nb("~2^000^€"));
    expect(leak.lines.find((l) => l.row === "calc" && l.key === "then")!.text).toBe(nb("18 × (100 – 20)/(100 – 30) = 21 (+3) sur 3^mois"));
    expect(leak.lines.find((l) => l.row === "footer")!.text).toBe(
      "Toutes choses égales par ailleurs · les opportunités recommandées s'ajoutent aux autres et se signent au même taux",
    );
    const past = slide(deckOf(withTarget(withTarget(named, "slg.ret.renewal", 85), "slg.ref.referred-share", 60)), "slg:leak");
    expect(past.title.key).toBe("leakClearUnpriced");
    expect(past.lines.find((l) => l.row === "footer")!.text).toBe(nb("Sans montant^: au-delà d'une cible de 50^%, le moteur ne chiffre plus la part des recommandations"));
  });

  it("slg:peloton: the pipeline coverage under the relays, against the team's threshold, with the month before's (§19.4)", () => {
    const s = withMonthBefore(hybridState(), (july) => void (july.pipelineOpen = 420_000));
    s.setup.pipeline = { quarterTarget: 200_000, threshold: 3 };
    s.snapshots[s.snapshots.length - 1]!.pipelineOpen = 520_000;
    const row = (locale: "fr" | "en") => slide(deckOf(s, locale), "slg:peloton").lines.find((l) => l.row === "coverage")!;
    expect(row("fr").text).toBe(nb("Couverture^: 2,6× l'objectif du trimestre, sous le seuil de l'équipe (3×)"));
    expect(row("en").text).toBe("Coverage: 2.6× the quarter's goal, below the team's threshold (3×)");
    // The month before's is a note: the slide keeps the line to the legend's one line.
    expect(slide(deckOf(s), "slg:peloton").notes).toContain(nb("Couverture en juillet 2026^: 2,1×."));
    // Without a threshold, it states the coverage and judges nothing; without a target, there is no line.
    delete s.setup.pipeline.threshold;
    expect(row("fr").text).toBe(nb("Couverture^: 2,6× l'objectif du trimestre"));
    s.setup.pipeline = {};
    expect(slide(deckOf(s), "slg:peloton").lines.some((l) => l.row === "coverage")).toBe(false);
  });

  it("without an ACV, the sales-assisted leak counts customers a quarter", () => {
    const leak = slide(deckOf(withEntry(hybridState(), "slg.rev.acv", undefined)), "slg:leak");
    expect(leak.title.key).toBe("slgLeakClearCustomers");
    expect(leak.title.values.n).toBe("6");
  });

  it("a sales-assisted what-if reads its quarter, the link moving only its own opportunities", () => {
    const deck = deckOf(moved(hybridState()));
    const link = slide(deck, "whatif:link.pql-handoff");
    const steps = link.lines.filter((l) => l.row === "funnelStep").map((l) => [l.id, l.today, l.projected]);
    expect(steps).toEqual([
      ["opps", "130", "139"],
      ["fromSelfServe", "31", "40"],
      ["won", "18", "19"],
    ]);
    expect(link.motion).toBe("slg");
  });
});

describe("unit economics, side by side (§18.8.2)", () => {
  it("no gross margin in either motion: the « neither margin » title; self-serve's column first", () => {
    const deck = deckOf(hybridState());
    const unit = slide(deck, "unit-economics");
    expect(unit.title.key).toBe("unitEconomicsNoneMargins");
    // Two columns since A20.d T4.d, self-serve first: each engine its five tiles, tagged with its engine.
    expect(unit.lines.filter((l) => l.motion).map((l) => `${l.motion}:${l.row}`)).toEqual([
      "plg:cac",
      "plg:ltv",
      "plg:ltvCac",
      "plg:payback",
      "plg:cash",
      "slg:cac",
      "slg:ltv",
      "slg:ltvCac",
      "slg:payback",
      "slg:cash",
    ]);
    // A figure that can't be computed says what is missing, in its column; never a « ? » in the text.
    expect(unit.lines.find((l) => l.motion === "plg" && l.row === "ltv")!.text).toBe("Libre-service · il manque la marge brute");
    // One note under both: self-serve's GRR and NRR, sales-assisted's renewal.
    expect(unit.lines.find((l) => l.row === "assume")!.text).toContain(nb("Assisté^: renouvellement 88^% par an."));
    // Two CACs on different spend: the footer says so, in words.
    expect(unit.lines.find((l) => l.row === "footer")!.text).toContain("média seul en libre-service, tout chargé en assisté");
  });

  it("a certain loss on one side (C48): each side says its own, in ink, and the slide moves right after the total", () => {
    const deck = deckOf(hybridLossState());
    const unit = slide(deck, "unit-economics");
    expect(title(deck, "unit-economics")).toBe(nb("Libre-service^: on perd ~400^€ par nouveau client. Assisté^: remboursé en 13^mois."));
    expect(title(deckOf(hybridLossState(), "en"), "unit-economics", "en")).toBe("Self-serve: we lose ~€400 on each new customer. Sales-assisted: paid back in 13 months.");
    expect(deck.slides.filter((s) => s.included).map((s) => s.id).slice(0, 3)).toEqual(["total", "unit-economics", "peloton"]);
    expect(unit.index).toBe(2);
    // Never summed: each engine its own picture, its own story.
    expect(unit.paybackCharts?.plg).toMatchObject({ story: "loss", labels: { time: nb("part vers 17^mois^; rembourserait à 21^mois"), short: nb("il manque ~400^€") } });
    expect(unit.paybackCharts?.slg).toMatchObject({ story: "pays-back", labels: { time: nb("remboursé à 13^mois, puis ~23^mois de marge") } });
    // The cash's note only when it reads without the chart: the loss's, not the floor.
    expect(unit.lines.find((l) => l.motion === "plg" && l.row === "cash")!.note).toBe("ne revient pas toute");
    expect(unit.lines.find((l) => l.motion === "slg" && l.row === "cash")!.note).toBe("");
  });

  it("no certain loss: the side-by-side titles of §18.6.4 and the slide's place", () => {
    const margin = (state: EngineState, id: "rev.gross-margin" | "slg.rev.gross-margin") => withEntry(state, id, measured(ratio(75, 100), { kind: "person", role: "finance" }));
    const deck = deckOf(margin(margin(hybridState(), "rev.gross-margin"), "slg.rev.gross-margin"));
    expect(slide(deck, "unit-economics").title.key).toBe("unitEconomicsBoth");
    expect(deck.slides.filter((s) => s.included).map((s) => s.id).indexOf("unit-economics")).toBeGreaterThan(2);
  });

  it("each case of the title: both paybacks, one side, the other, and two different inputs", () => {
    const margin = (state: EngineState, id: "rev.gross-margin" | "slg.rev.gross-margin") => withEntry(state, id, measured(ratio(75, 100), { kind: "person", role: "finance" }));
    const both = deckOf(margin(margin(hybridState(), "rev.gross-margin"), "slg.rev.gross-margin"));
    expect(slide(both, "unit-economics").title.key).toBe("unitEconomicsBoth");
    expect(slide(deckOf(margin(hybridState(), "rev.gross-margin")), "unit-economics").title.key).toBe("unitEconomicsOneSidePlg");
    expect(slide(deckOf(margin(hybridState(), "slg.rev.gross-margin")), "unit-economics").title.key).toBe("unitEconomicsOneSideSlg");
    const different = withEntry(margin(hybridState(), "slg.rev.gross-margin"), "slg.acq.cac", undefined);
    expect(slide(deckOf(different), "unit-economics").title.key).toBe("unitEconomicsNoneDifferent");
    // Self-serve first even when only sales-assisted can be said.
    expect(title(deckOf(margin(hybridState(), "slg.rev.gross-margin")), "unit-economics")).toMatch(/^Côté libre-service/);
  });

  it("a company-wide margin standing in is said in the footer (C25 Q4)", () => {
    const wide = withEntry(hybridState(), "slg.rev.gross-margin", estimated(70, 75, { estimate: { low: 70, high: 75, basis: "company-wide" } }));
    expect(slide(deckOf(wide), "unit-economics").lines.find((l) => l.row === "footer")!.text).toContain("marge globale reprise dans l'assisté");
  });
});

describe("each motion's chrome, and the shared slides", () => {
  it("the hybrid: a motion's slide names it in its kicker, counts its own numbers, cites its own months", () => {
    const deck = deckOf(hybridState());
    expect(deck.byMotion!.plg.kicker).toBe("Moteur de growth · août 2026 · libre-service · données internes");
    expect(deck.byMotion!.slg.kicker).toBe("Moteur de growth · août 2026 · assisté · données internes");
    expect(deck.byMotion!.plg.dataPill).toEqual({ measured: 11, approximate: 2, missing: 3 });
    expect(deck.byMotion!.slg.dataPill).toEqual({ measured: 10, approximate: 1, missing: 2 });
    expect(deck.byMotion!.slg.footer).toBe(nb("Flux assistés de juin à août 2026 · leads de mai à juillet 2026 · sources^: HubSpot et Stripe"));
    // The deck's own pill and footer: both motions together, the link never counted.
    expect(deck.dataPill).toEqual({ measured: 21, approximate: 3, missing: 5 });
    expect(deck.footer.text).toMatch(/^Flux/);
    expect(slide(deck, "visibility").motion).toBeUndefined();
    expect(slide(deck, "peloton").motion).toBe("plg");
  });

  it("visibility counts the union and says each missing number's motion; the appendix groups by motion, the link last", () => {
    const deck = deckOf(hybridState());
    expect(title(deck, "visibility")).toBe(nb("On documente **24 chiffres sur 32**. Les 8 qui manquent se réparent entre une réunion et un sprint."));
    const missingRows = slide(deck, "visibility").lines.filter((l) => l.row === "missing");
    expect(missingRows.find((l) => l.id === "slg.act.go-live")!.text).toBe("assisté · aucune mesure · Customer Success · un sprint");
    const annex = deck.slides.filter((s) => s.id.startsWith("annex")).flatMap((s) => s.lines);
    expect([...new Set(annex.map((l) => l.group))]).toEqual(["plg", "slg", "link"]);
    expect(annex.find((l) => l.id === "slg.rev.win-rate")!.period).toBe("juin à août 2026");
  });

  it("the text export ends with each motion's sources, in English too", () => {
    const text = deckMarkdown(deckOf(hybridState(), "en"), EN.strings);
    expect(text).toContain("Sales-assisted flows from June to August 2026 · leads from May to July 2026 · sources: HubSpot and Stripe");
    expect(text).toContain("## 1. MRR stands at **€228,000**: €48,000 self-serve, €180,000 sales-assisted.");
  });
});
