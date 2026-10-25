import { describe, expect, it } from "vitest";
import { deriveEngine } from "../derive";
import type { EngineState, Finding, FindingKind, MetricEntry } from "../types";
import { CTX_FR, EN, FR } from "./props";
import {
  estimated,
  exampleState,
  filmState,
  hybridState,
  marketplaceNoSubscriptionsState,
  marketplaceState,
  measured,
  missing,
  ratio,
  salesAssistedState,
  tourResult,
  withEntry,
  hybridNoMarginState,
  noMarginState,
} from "./fixtures";
import { findingText } from "../sentences";

// Engine spec §13.1 "findings" — a table case → kinds, and stable ranks.
// Non-vacuity, measured: raising a chain-break for a column that is only
// "todo" fails "in progress is not a finding" only; dropping the event/rate
// merge fails "a missing event is one finding" only. Removing the final
// sort used to pass every test, findings being built in rank order; since
// the motions (A7.3.c S1), self-serve's are built before sales-assisted's,
// and the hybrid's order below fails without it — with the golden v1's
// linked Tour, whose mirror findings come last.

const tool = { kind: "tool", tool: "stripe" } as const;
const derive = (state: EngineState, result = null as ReturnType<typeof tourResult> | null) =>
  deriveEngine(state, CTX_FR, result, FR.bridges, FR.strings.units);
const kinds = (fs: Finding[]): FindingKind[] => fs.map((f) => f.kind);

describe("findings — the §6.0 example", () => {
  const { findings } = derive(exampleState());

  it("in rank order: the break, the missing definition, the stage below its target — the margin estimated since C50, the payback computes", () => {
    expect(findings).toEqual([
      { kind: "chain-break", motion: "plg", rank: 1, metrics: ["ret.d30"], values: {} },
      { kind: "no-definition", motion: "plg", rank: 2, metrics: ["ret.churn-cause"], values: {} },
      { kind: "below-comparator", motion: "plg", rank: 2, metrics: ["act.rate"], values: { value: "18 %", comparator: "20 %" } },
    ]);
  });

  it("without its margin, the uncomputable payback comes last (the example before C50)", () => {
    expect(derive(noMarginState()).findings.at(-1)).toEqual({ kind: "unit-econ-uncomputable", motion: "plg", rank: 3, metrics: ["rev.cac-payback", "rev.gross-margin"], values: {} });
  });

  it("ranks never decrease, and the list is the same on every call", () => {
    for (let i = 1; i < findings.length; i++) expect(findings[i]!.rank).toBeGreaterThanOrEqual(findings[i - 1]!.rank);
    expect(derive(exampleState()).findings).toEqual(findings);
  });
});

describe("findings — case → kinds", () => {
  it("a number in progress (todo, requested) is collection, not a finding", () => {
    expect(kinds(derive(withEntry(exampleState(), "ret.d30", undefined)).findings)).not.toContain("chain-break");
  });

  it("a missing activation event is ONE finding, with the rate", () => {
    let s = withEntry(exampleState(), "act.event", missing("no-definition", "meeting"));
    s = withEntry(s, "act.rate", missing("no-definition", "meeting"));
    const fs = derive(s).findings;
    expect(fs.filter((f) => f.kind === "chain-break").map((f) => f.metrics)).toEqual([["act.event", "act.rate"], ["ret.d30"]]);
    expect(fs.filter((f) => f.kind === "no-definition").map((f) => f.metrics)).toEqual([["act.event"], ["ret.churn-cause"]]);
  });

  it("conflict — each reading formatted", () => {
    const conflict: MetricEntry = {
      status: "conflicting",
      conflict: { a: { value: ratio(10, 400), source: tool }, b: { value: ratio(12, 400), source: { kind: "person", role: "finance" } } },
      updatedAt: "2026-09-20T10:00:00.000Z",
    };
    const f = derive(withEntry(exampleState(), "ret.logo-churn", conflict)).findings.find((x) => x.kind === "conflict")!;
    expect(f).toEqual({ kind: "conflict", motion: "plg", rank: 3, metrics: ["ret.logo-churn"], values: { a: "2,5 %", b: "3 %" } });
  });

  it("reconcile-gap copies the sanity check; small-cohort flags a cohort under 100", () => {
    const off = withEntry(exampleState(), "acq.cac", measured(ratio(21_000, 20), tool));
    expect(derive(off).findings.find((f) => f.kind === "reconcile-gap")).toMatchObject({ rank: 3, values: { n: "20" } });
    const small = withEntry(exampleState(), "act.rate", measured(ratio(14, 80), tool));
    expect(kinds(derive(small).findings)).toContain("small-cohort");
  });

  it("shared: every named stage gets its below-comparator", () => {
    const churn3 = withEntry(exampleState(), "ret.logo-churn", measured(ratio(12, 400), tool));
    expect(derive(churn3).findings.filter((f) => f.kind === "below-comparator").map((f) => f.metrics)).toEqual([["act.rate"], ["ret.logo-churn"]]);
  });

  it("unit economics uncomputable only when an input was looked for and not found", () => {
    const todoMargin = withEntry(exampleState(), "rev.gross-margin", undefined);
    expect(kinds(derive(todoMargin).findings)).not.toContain("unit-econ-uncomputable");
  });

  it("blind spot and hidden knowledge come from the linked Tour", () => {
    // ret-1 declared tracked (20) but day 30 is missing; act-1 declared unknown (0) and the event is measured.
    const result = tourResult({ "ret-1": 0, "act-1": 2 });
    const linked: EngineState = { ...exampleState(), tourLink: { resultId: result.id, linkedAt: "2026-09-24T09:00:00.000Z" } };
    const fs = derive(linked, result).findings;
    expect(fs.find((f) => f.kind === "blind-spot")).toMatchObject({ rank: 2, metrics: ["ret.d30"] });
    expect(fs.find((f) => f.kind === "hidden-knowledge")).toMatchObject({ rank: 4, metrics: ["act.event"] });
    expect(fs[fs.length - 1]!.kind).toBe("hidden-knowledge");
  });
});

describe("deriveEngine", () => {
  it("builds the mirror only for the linked result", () => {
    const result = tourResult({ "acq-1": 0 });
    expect(derive(exampleState(), result).mirror).toBeNull(); // not linked
    const linked: EngineState = { ...exampleState(), tourLink: { resultId: result.id, linkedAt: "x" } };
    expect(derive(linked, result).mirror?.resultId).toBe(result.id);
    expect(derive(linked, { ...result, id: "another" }).mirror).toBeNull();
    expect(derive(linked, null).mirror).toBeNull();
  });

  it("composes every derived shape", () => {
    const d = derive(exampleState());
    expect(Object.keys(d).sort()).toEqual(["coverage", "diagnosis", "findings", "mirror", "motions", "peloton", "sanity", "total", "unit"]);
    // Self-serve alone: one motion, the very objects kept at the top for the v1 readers, and no total.
    expect(d.motions.map((m) => m.motion)).toEqual(["plg"]);
    expect(d.motions[0]).toMatchObject({ peloton: d.peloton, diagnosis: d.diagnosis, unit: d.unit });
    expect(d.total).toBeNull();
    expect(d.coverage.found).toBe(11);
    expect(d.peloton.chain).toBe("gap");
    expect(d.diagnosis.state).toBe("clear");
    expect(d.sanity).toEqual([]);
  });
});

// --- The hybrid (§18.5.8; A7.3.c S1) ---------------------------------------------
// Non-vacuity, measured on 2026-10-01: removing the final sort now fails the
// hybrid's order (self-serve's findings would all come before sales-assisted's
// rank-1 break); a finding for the link fails « no finding of the link »;
// dropping the live-event/go-live merge fails « one finding, on the definition ».

describe("findings — the §18.9 hybrid", () => {
  const nb = (s: string) => s.replace(/\^/g, " ");

  it("each motion's findings, tagged, in rank order: self-serve's before sales-assisted's within a kind", () => {
    // Without self-serve's margin (the hybrid before C50), so each kind shows both motions, self-serve first.
    expect(derive(hybridNoMarginState()).findings).toEqual([
      { kind: "chain-break", motion: "plg", rank: 1, metrics: ["ret.d30"], values: {} },
      { kind: "chain-break", motion: "slg", rank: 1, metrics: ["slg.act.go-live"], values: {} },
      { kind: "no-definition", motion: "plg", rank: 2, metrics: ["ret.churn-cause"], values: {} },
      { kind: "below-comparator", motion: "plg", rank: 2, metrics: ["act.rate"], values: { value: nb("18^%"), comparator: nb("20^%") } },
      { kind: "below-comparator", motion: "slg", rank: 2, metrics: ["slg.rev.win-rate"], values: { value: nb("24^%"), comparator: nb("32^%") } },
      { kind: "unit-econ-uncomputable", motion: "plg", rank: 3, metrics: ["rev.cac-payback", "rev.gross-margin"], values: {} },
      { kind: "unit-econ-uncomputable", motion: "slg", rank: 3, metrics: ["slg.rev.cac-payback", "slg.rev.gross-margin"], values: {} },
      { kind: "small-sample", motion: "slg", rank: 4, metrics: ["slg.ret.renewal"], values: { d: "25", p: "4" }, count: { lo: 4, hi: 4 } },
    ]);
  });

  it("go-live with its definition missing is ONE finding, on the definition", () => {
    let s = withEntry(hybridState(), "slg.act.live-event", missing("no-definition", "meeting"));
    s = withEntry(s, "slg.act.go-live", missing("no-definition", "meeting"));
    const fs = derive(s).findings.filter((f) => f.motion === "slg");
    expect(fs.filter((f) => f.kind === "chain-break").map((f) => f.metrics)).toEqual([["slg.act.live-event", "slg.act.go-live"]]);
    expect(fs.filter((f) => f.kind === "no-definition").map((f) => f.metrics)).toEqual([["slg.act.live-event"]]);
  });

  it("no finding of the link, whatever its state", () => {
    for (const entry of [missing("no-definition", "meeting"), missing("not-tracked", "sprint"), measured(ratio(3, 130), tool)]) {
      const fs = derive(withEntry(hybridState(), "link.pql-handoff", entry)).findings;
      expect(fs.flatMap((f) => f.metrics)).not.toContain("link.pql-handoff");
    }
  });

  it("a motion unticked makes no finding: its numbers stay, nobody reads them", () => {
    const plgOnly = { ...hybridState(), setup: { ...hybridState().setup, motions: { plg: true, slg: false } } };
    expect(derive(plgOnly).findings).toEqual(derive(exampleState()).findings);
    const slgOnly = derive(salesAssistedState()).findings;
    expect(slgOnly.every((f) => f.motion === "slg")).toBe(true);
    expect(slgOnly.map((f) => f.kind)).toEqual(["chain-break", "below-comparator", "unit-econ-uncomputable", "small-sample"]);
  });

  it("the mirror's findings carry the row's motion", () => {
    // act-1 declared unknown (0 points): the event is measured in self-serve, « live » defined in sales-assisted.
    const result = tourResult({ "act-1": 2 });
    const linked: EngineState = { ...hybridState(), tourLink: { resultId: result.id, linkedAt: "2026-09-24T09:00:00.000Z" } };
    const hidden = derive(linked, result).findings.filter((f) => f.kind === "hidden-knowledge");
    expect(hidden.map((f) => [f.motion, f.metrics])).toEqual([
      ["plg", ["act.event"]],
      ["slg", ["slg.act.live-event"]],
    ]);
  });
});

describe("findings — the loss (§20.4, C48, A20 T1)", () => {
  // Non-vacuity, measured on 2026-10-03: ranking the certain loss 2 fails « rank 1, before the stage below its
  // target »; raising a finding on a « none » verdict fails « no loss, no finding ».
  const loss = (fs: Finding[]) => fs.filter((f) => f.kind === "unit-econ-loss" || f.kind === "unit-econ-loss-maybe");

  it("the film's SaaS: a certain loss, rank 1, the CAC as typed and the LTV and the gap as estimates", () => {
    const fs = derive(filmState()).findings;
    expect(loss(fs)).toEqual([
      { kind: "unit-econ-loss", motion: "plg", rank: 1, metrics: ["rev.ltv", "acq.cac"], values: { cac: "1\u00a0900\u00a0€", ltv: "~1\u00a0500\u00a0€", gap: "~400\u00a0€" } },
    ]);
    // Rank 1 sorts it before the stage below its target, whatever the order it was built in.
    expect(fs.findIndex((f) => f.kind === "unit-econ-loss")).toBeLessThan(fs.findIndex((f) => f.kind === "below-comparator"));
  });

  it("its sentence: the money, said once, with no cause", () => {
    const state = filmState();
    const d = derive(state);
    const f = loss(d.findings)[0]!;
    expect(findingText(f, state, FR.strings, [], [], "fr")).toBe("Chaque nouveau client coûte 1\u00a0900\u00a0€ et rapporte ~1\u00a0500\u00a0€ de marge\u00a0: tu perds ~400\u00a0€ sur chacun.");
  });

  it("churn estimated at 4 to 6 %: the two ranges overlap, a loss only possible, rank 2", () => {
    const state = withEntry(filmState(), "ret.logo-churn", estimated(4, 6));
    const [f] = loss(derive(state).findings);
    expect(f).toMatchObject({ kind: "unit-econ-loss-maybe", rank: 2, metrics: ["rev.ltv", "acq.cac"] });
    expect(findingText(f!, state, FR.strings, [], [], "fr")).toMatch(/^Un nouveau client coûte 1\u00a0900\u00a0€ et rapporte ~1\u00a0500\u00a0€ à 2\u00a0300\u00a0€ de marge\u00a0: il ne rembourse peut-être pas/);
  });

  it("no loss, no finding: the film with a 2 % churn, the §6.0 example with no margin", () => {
    expect(loss(derive(withEntry(filmState(), "ret.logo-churn", measured(ratio(8, 400)))).findings)).toEqual([]);
    expect(loss(derive(exampleState()).findings)).toEqual([]);
  });
});

// --- A marketplace (§22.5.8; A23 MKT-4) — each finding says the side of its number (C70).
// Non-vacuity, measured on 2026-10-25: see the entry of A23 MKT-4 in `JOURNAL.md`.

describe("findings — a marketplace", () => {
  const NB = "\u00a0";
  const sideOf = (fs: Finding[]) => fs.map((f) => `${f.kind}:${f.side}:${f.metrics.join("+")}`);
  const words = FR.typeCatalogs.marketplace;
  const textOf = (f: Finding, state: EngineState) => findingText(f, state, FR.strings, words.metrics, words.derived, "fr");

  it("the example: one stage below its target on each side, in the demand-then-supply order, and nothing else", () => {
    const state = marketplaceState();
    expect(derive(state).findings).toEqual([
      { kind: "below-comparator", motion: "mkt", side: "demand", rank: 2, metrics: ["mkt.liq.fill-rate"], values: { value: `9${NB}%`, comparator: `12${NB}%` } },
      { kind: "below-comparator", motion: "mkt", side: "supply", rank: 2, metrics: ["mkt.sell.paid-conversion"], values: { value: `15${NB}%`, comparator: `20${NB}%` } },
    ]);
    // No loss, no missing figure, no alert: §22.10.2.
    expect(derive(marketplaceNoSubscriptionsState()).findings.map((f) => `${f.side}:${f.metrics}`)).toEqual(["demand:mkt.liq.fill-rate"]);
  });

  it("a column of a funnel that nobody could pull breaks the chain, said with its own verb, in both languages", () => {
    const cases: [string, Parameters<typeof missing>[0], string, string][] = [
      ["mkt.buy.first-order", "no-access", "Sur 100 inscrits, on ne sait pas dire combien passent une première commande.", "Out of 100 sign-ups, we can't say how many place a first order."],
      ["mkt.buy.repeat", "no-access", "Sur 100 inscrits, on ne sait pas dire combien en passent une deuxième.", "Out of 100 sign-ups, we can't say how many place a second one."],
      ["mkt.sell.first-sale", "no-access", "Sur 100 inscrits, on ne sait pas dire combien font une première vente.", "Out of 100 sign-ups, we can't say how many make a first sale."],
      ["mkt.sell.paid-conversion", "no-access", "Sur 100 inscrits, on ne sait pas dire combien s'abonnent.", "Out of 100 sign-ups, we can't say how many subscribe."],
    ];
    for (const [id, cause, fr, en] of cases) {
      const state = withEntry(marketplaceState(), id as never, missing(cause, "meeting"));
      const [f] = derive(state).findings.filter((x) => x.kind === "chain-break");
      expect(f, id).toMatchObject({ kind: "chain-break", motion: "mkt", side: id.startsWith("mkt.sell") ? "supply" : "demand", rank: 1, metrics: [id] });
      expect(textOf(f!, state), id).toBe(fr);
      expect(findingText(f!, state, EN.strings, words.metrics, words.derived, "en"), id).toBe(en);
    }
    // In progress is collection, not a finding; and the supply's subscription column is gone with the subscriptions.
    expect(kinds(derive(withEntry(marketplaceState(), "mkt.buy.repeat", undefined)).findings)).not.toContain("chain-break");
    expect(kinds(derive(withEntry(marketplaceNoSubscriptionsState(), "mkt.sell.paid-conversion", missing("no-access", "meeting"))).findings)).not.toContain("chain-break");
  });

  it("no shared definition, and two numbers that disagree, each on the side of its number — the fill rate on the demand's", () => {
    let state = withEntry(marketplaceState(), "mkt.sell.arpa", missing("no-definition", "meeting"));
    state = withEntry(state, "mkt.liq.fill-rate", missing("no-definition", "meeting"));
    expect(sideOf(derive(state).findings.filter((f) => f.kind === "no-definition"))).toEqual(["no-definition:demand:mkt.liq.fill-rate", "no-definition:supply:mkt.sell.arpa"]);
    const disagree: MetricEntry = {
      status: "conflicting",
      conflict: { a: { value: ratio(10, 100), source: tool }, b: { value: ratio(12, 100), source: { kind: "person", role: "finance" } } },
      updatedAt: "2026-09-20T10:00:00.000Z",
    };
    const both = withEntry(withEntry(marketplaceState(), "mkt.rev.take-rate", disagree), "mkt.sell.gross-margin", disagree);
    expect(sideOf(derive(both).findings.filter((f) => f.kind === "conflict"))).toEqual(["conflict:demand:mkt.rev.take-rate", "conflict:supply:mkt.sell.gross-margin"]);
  });

  it("names the stages each side's diagnosis named — the shared case gives every one a finding, a churn above its target is « above »", () => {
    // 5,5 % against a 4 % ceiling is worth 491,40 € a month, the fill rate's 468 €: within 25 %, both are named.
    const targeted = withEntry(marketplaceState(), "mkt.buy.churn", measured(ratio(770, 14_000), tool));
    targeted.snapshots[0]!.targets["mkt.buy.churn"] = 4;
    const f = derive(targeted).findings.filter((x) => x.kind === "below-comparator" && x.side === "demand");
    expect(f.map((x) => x.metrics[0])).toEqual(["mkt.buy.churn", "mkt.liq.fill-rate"]);
    expect(textOf(f[0]!, targeted)).toBe(`${words.metrics.find((m) => m.id === "mkt.buy.churn")!.name}${NB}: 5,5${NB}%, au-dessus de 4${NB}%.`);
  });

  it("an LTV that cannot be computed is a finding only when an input was looked for and not found, on the side that lacks it", () => {
    const demand = withEntry(marketplaceState(), "mkt.rev.gross-margin", missing("not-tracked", "meeting"));
    const [d] = derive(demand).findings.filter((f) => f.kind === "unit-econ-uncomputable");
    expect(d).toMatchObject({ motion: "mkt", side: "demand", rank: 3, metrics: ["mkt.rev.cac-payback", "mkt.rev.gross-margin"] });
    expect(textOf(d!, demand)).toBe("Impossible de dire en combien de mois un client rembourse son coût d'acquisition. Il manque la marge sur le revenu net.");
    const supply = withEntry(marketplaceState(), "mkt.sell.gross-margin", missing("not-tracked", "meeting"));
    expect(derive(supply).findings.filter((f) => f.kind === "unit-econ-uncomputable")).toMatchObject([{ side: "supply", metrics: ["mkt.sell.cac-payback", "mkt.sell.gross-margin"] }]);
    // Still to do, not looked for: collection, not a finding. And the supply's economics are not shown without the subscriptions.
    expect(kinds(derive(withEntry(marketplaceState(), "mkt.rev.gross-margin", undefined)).findings)).not.toContain("unit-econ-uncomputable");
    expect(kinds(derive(withEntry(marketplaceNoSubscriptionsState(), "mkt.sell.gross-margin", missing("not-tracked", "meeting"))).findings)).not.toContain("unit-econ-uncomputable");
  });

  it("a buyer who costs more than he brings back is a loss on the demand, the CAC as typed", () => {
    // 60 000 € for 600 new buyers: 100 € a buyer, against an LTV of 32 to 38 €.
    const state = withEntry(marketplaceState(), "mkt.buy.cac", measured(ratio(60_000, 600), tool, { variant: "media-only" }));
    const loss = derive(state).findings.filter((f) => f.kind === "unit-econ-loss" || f.kind === "unit-econ-loss-maybe");
    expect(loss).toMatchObject([{ kind: "unit-econ-loss", motion: "mkt", side: "demand", rank: 1, metrics: ["mkt.rev.ltv", "mkt.buy.cac"] }]);
    expect(loss[0]!.values.cac).toBe(`100${NB}€`);
    // Rank 1 sorts it before the stages below their target.
    const all = derive(state).findings;
    expect(all.findIndex((f) => f.kind === "unit-econ-loss")).toBeLessThan(all.findIndex((f) => f.kind === "below-comparator"));
  });

  it("a paid seller is set against what a PAID seller costs, 900 €, not the 450 € of an active one — the cost no one typed", () => {
    // 54 000 € for 120 new active sellers: 450 € each, an LTV of 821,67 € would not be a loss. A paid seller costs 450 × 30 ÷ 15 = 900 €.
    const state = withEntry(marketplaceState(), "mkt.sell.cac", measured(ratio(54_000, 120), tool, { variant: "media-only" }));
    const loss = derive(state).findings.filter((f) => f.kind === "unit-econ-loss" || f.kind === "unit-econ-loss-maybe");
    expect(loss).toMatchObject([{ kind: "unit-econ-loss", motion: "mkt", side: "supply", rank: 1, metrics: ["mkt.sell.ltv", "mkt.sell.cac"] }]);
    expect(loss[0]!.values.cac).toBe(`900${NB}€`);
    // The example's own: 100 € an active seller, 200 € a paid one, against 821,67 €: no loss.
    expect(kinds(derive(marketplaceState()).findings)).not.toContain("unit-econ-loss");
    // Without the subscriptions there is no paid seller, so no loss on the supply, whatever the cost typed.
    const none = withEntry(marketplaceNoSubscriptionsState(), "mkt.sell.cac", measured(ratio(54_000, 12), tool, { variant: "media-only" }));
    expect(derive(none).findings.filter((f) => f.side === "supply")).toEqual([]);
  });

  it("the chain and the buyer CAC's count don't describe the same population: the check's finding, on the demand", () => {
    const off = withEntry(marketplaceState(), "mkt.buy.cac", measured(ratio(18_000, 100), tool, { variant: "media-only" }));
    const [f] = derive(off).findings.filter((x) => x.kind === "reconcile-gap");
    expect(f).toMatchObject({ motion: "mkt", side: "demand", rank: 3, metrics: ["mkt.buy.signup-rate", "mkt.buy.first-order", "mkt.buy.cac"], values: { p: "600", n: "100", month: `août 2026` } });
    expect(f!.count).toEqual({ lo: 600, hi: 600 });
  });

  it("each sign-up weighs more than a point on a side's cohort under 100, said for that side", () => {
    const demand = withEntry(marketplaceState(), "mkt.buy.first-order", measured(ratio(14, 80), tool));
    expect(sideOf(derive(demand).findings.filter((f) => f.kind === "small-cohort"))).toEqual(["small-cohort:demand:"]);
    const supply = withEntry(marketplaceState(), "mkt.sell.first-sale", measured(ratio(24, 80), tool));
    expect(sideOf(derive(supply).findings.filter((f) => f.kind === "small-cohort"))).toEqual(["small-cohort:supply:"]);
    const both = withEntry(demand, "mkt.sell.first-sale", measured(ratio(24, 80), tool));
    expect(sideOf(derive(both).findings.filter((f) => f.kind === "small-cohort"))).toEqual(["small-cohort:demand:", "small-cohort:supply:"]);
  });

  it("the Tour's bridges of a marketplace are the buyers' side: a blind spot on the buyer CAC says demand", () => {
    // acq-3 declared tracked (20 points) but the buyer CAC is missing: the Tour said it was tracked, nobody could pull it.
    const result = tourResult({ "acq-3": 0 });
    const linked: EngineState = { ...withEntry(marketplaceState(), "mkt.buy.cac", missing("no-access", "meeting")), tourLink: { resultId: result.id, linkedAt: "2026-09-24T09:00:00.000Z" } };
    const blind = derive(linked, result).findings.filter((f) => f.kind === "blind-spot");
    expect(blind).toMatchObject([{ motion: "mkt", side: "demand", rank: 2, metrics: ["mkt.buy.cac"] }]);
  });

  it("ranks never decrease, the demand's findings come before the supply's within a kind, and a SaaS's carry no side", () => {
    const state = withEntry(withEntry(marketplaceState(), "mkt.buy.cac", measured(ratio(60_000, 600), tool, { variant: "media-only" })), "mkt.sell.cac", measured(ratio(54_000, 120), tool, { variant: "media-only" }));
    const fs = derive(state).findings;
    for (let i = 1; i < fs.length; i++) expect(fs[i]!.rank).toBeGreaterThanOrEqual(fs[i - 1]!.rank);
    expect(sideOf(fs).map((s) => s.split(":").slice(0, 2).join(":"))).toEqual(["unit-econ-loss:demand", "unit-econ-loss:supply", "below-comparator:demand", "below-comparator:supply"]);
    expect(derive(state).findings).toEqual(fs);
    for (const f of derive(exampleState()).findings) expect(f).not.toHaveProperty("side");
    for (const f of derive(hybridState()).findings) expect(f).not.toHaveProperty("side");
  });
});
