import { describe, expect, it } from "vitest";
import { shapeOf } from "../catalog-shape";
import { blockingCheck, mktReconcile, reconcile, sanityChecks } from "../sanity";
import { sanityText } from "../sentences";
import type { EngineState, MetricEntry, SanityId } from "../types";
import { CTX_FR, FR } from "./props";
import { estimated, exampleState, hybridState, marketplaceNoSubscriptionsState, marketplaceState, measured, ratio, salesAssistedState, withEntry } from "./fixtures";

// Engine spec §13.1 "sanity" — one case that triggers and one that doesn't,
// per check. Non-vacuity, measured: firing on ANY overlap instead of the
// whole interval (`churn.hi > 30`) fails the churn test only, through its
// 20-40 % estimate — the measured 35 % triggers either way.

const tool = { kind: "tool", tool: "amplitude" } as const;
const ids = (state: EngineState): SanityId[] => sanityChecks(state, CTX_FR, FR.strings.units).map((c) => c.id);

describe("sanity checks", () => {
  it("the §6.0 example raises nothing", () => {
    expect(sanityChecks(exampleState(), CTX_FR, FR.strings.units)).toEqual([]);
  });

  it("num-gt-den blocks, on bounded shares only", () => {
    // The message quotes both counts (« Le premier compte ({num}) dépasse le second ({den}) »): the check carries them.
    expect(blockingCheck(measured(ratio(900, 800), tool), shapeOf("act.rate"), "fr")).toEqual({
      id: "num-gt-den",
      blocking: true,
      metrics: ["act.rate"],
      values: { num: "900", den: "800" },
    });
    expect(blockingCheck(measured(ratio(12_000, 8_000), tool), shapeOf("act.rate"), "fr")?.values).toEqual({ num: "12\u00a0000", den: "8\u00a0000" });
    expect(blockingCheck(measured(ratio(800, 800), tool), shapeOf("act.rate"), "fr")).toBeNull();
    expect(blockingCheck(measured(ratio(21_000, 42), tool), shapeOf("acq.cac"), "fr")).toBeNull();
    const conflict = { status: "conflicting", conflict: { a: { value: ratio(1, 10), source: tool }, b: { value: ratio(12, 10), source: tool } }, updatedAt: "x" } as const;
    // The reading that breaks the rule is the one quoted, not the first one.
    expect(blockingCheck(conflict, shapeOf("act.rate"), "en")?.values).toEqual({ num: "12", den: "10" });
    // An imported file can carry what the sheet would have refused: it shows.
    expect(ids(withEntry(exampleState(), "act.rate", measured(ratio(900, 800), tool)))).toContain("num-gt-den");
  });

  it("retained-gt-activated", () => {
    expect(ids(withEntry(exampleState(), "ret.d30", measured(ratio(200, 800), tool)))).toContain("retained-gt-activated");
    expect(ids(withEntry(exampleState(), "ret.d30", measured(ratio(100, 800), tool)))).not.toContain("retained-gt-activated");
  });

  it("paid-gt-retained", () => {
    expect(ids(withEntry(exampleState(), "ret.d30", measured(ratio(40, 800), tool)))).toContain("paid-gt-retained");
    expect(ids(withEntry(exampleState(), "ret.d30", measured(ratio(80, 800), tool)))).not.toContain("paid-gt-retained");
  });

  it("churn-high — the whole interval above 30 %", () => {
    expect(ids(withEntry(exampleState(), "ret.logo-churn", measured(ratio(140, 400), tool)))).toContain("churn-high");
    expect(ids(withEntry(exampleState(), "ret.logo-churn", estimated(20, 40)))).not.toContain("churn-high");
  });

  it("margin-odd — above 95 % or below 0", () => {
    expect(ids(withEntry(exampleState(), "rev.gross-margin", measured({ kind: "rate", percent: 98 }, tool)))).toContain("margin-odd");
    expect(ids(withEntry(exampleState(), "rev.gross-margin", estimated(-8, -2)))).toContain("margin-odd");
    expect(ids(withEntry(exampleState(), "rev.gross-margin", measured({ kind: "rate", percent: 80 }, tool)))).not.toContain("margin-odd");
  });

  it("ttv-mean — the statistic on a measured value, or the variant of an estimate", () => {
    const mean = measured({ kind: "duration", value: 2, unit: "days", statistic: "mean" }, tool);
    expect(ids(withEntry(exampleState(), "act.ttv", mean))).toContain("ttv-mean");
    expect(ids(withEntry(exampleState(), "act.ttv", estimated(1, 3, { variant: "mean" })))).toContain("ttv-mean");
    expect(ids(exampleState())).not.toContain("ttv-mean");
  });

  it("cohort-mismatch — peloton columns on different months", () => {
    expect(ids(withEntry(exampleState(), "act.rate", measured(ratio(144, 800), tool, { cohortMonth: "2026-06" })))).toContain("cohort-mismatch");
  });

  it("reconcile-gap: the example overlaps the band (no alert); a billing far off raises it with formatted values", () => {
    const r = reconcile(exampleState(), CTX_FR)!;
    expect(r.predicted.lo).toBeCloseTo(49.2, 9);
    expect(r.predicted.hi).toBeCloseTo(73.8, 9);
    expect(r.billed).toBe(42);
    const off = withEntry(exampleState(), "acq.cac", measured(ratio(21_000, 20), { kind: "person", role: "finance" }));
    const check = sanityChecks(off, CTX_FR, FR.strings.units).find((c) => c.id === "reconcile-gap")!;
    expect(check).toMatchObject({ blocking: false, values: { p: "49 à 74", n: "20", month: "août 2026" } });
  });
});

// --- Sales-assisted (§18.5.7; A7.3.c S1) — one case that triggers, one that doesn't.
// Non-vacuity, measured on 2026-10-01: firing `slg-cycle-long` on any overlap
// (`cycle.hi > 90`) fails its 60-120 day estimate case only; raising
// `cac-variants-differ` without both motions ticked fails « hybrid only ».

describe("sales-assisted checks", () => {
  const hubspot = { kind: "tool", tool: "hubspot" } as const;
  const slgIds = (state: EngineState) => sanityChecks(state, CTX_FR, FR.strings.units).filter((c) => c.motion === "slg").map((c) => c.id);
  const cycle = (value: number, statistic: "median" | "mean" = "median"): MetricEntry => measured({ kind: "duration", value, unit: "days", statistic }, hubspot);

  it("the §18.9 hybrid raises one check only, across the motions: the two CACs count different spend", () => {
    expect(sanityChecks(hybridState(), CTX_FR, FR.strings.units)).toEqual([
      { id: "cac-variants-differ", blocking: false, metrics: ["acq.cac", "slg.acq.cac"], values: { plg: "media-only", slg: "fully-loaded" } },
    ]);
  });

  it("cac-variants-differ: hybrid only, both CACs known, two different variants", () => {
    expect(ids(salesAssistedState())).not.toContain("cac-variants-differ");
    const same = withEntry(hybridState(), "slg.acq.cac", measured(ratio(342_000, 18), { kind: "person", role: "finance" }, { variant: "media-only" }));
    expect(ids(same)).not.toContain("cac-variants-differ");
    expect(ids(withEntry(hybridState(), "slg.acq.cac", undefined))).not.toContain("cac-variants-differ");
  });

  it("slg-cycle-long: past the three-month window, the WHOLE interval", () => {
    expect(slgIds(withEntry(hybridState(), "slg.acq.cycle", cycle(120)))).toContain("slg-cycle-long");
    expect(slgIds(withEntry(hybridState(), "slg.acq.cycle", cycle(90)))).not.toContain("slg-cycle-long");
    expect(slgIds(withEntry(hybridState(), "slg.acq.cycle", estimated(60, 120)))).not.toContain("slg-cycle-long");
  });

  it("slg-cycle-mean and slg-ttl-mean: a mean, on the value or as the estimate's variant", () => {
    expect(slgIds(withEntry(hybridState(), "slg.acq.cycle", cycle(64, "mean")))).toEqual(["slg-cycle-mean"]);
    expect(slgIds(withEntry(hybridState(), "slg.act.time-to-live", estimated(20, 40, { variant: "mean" })))).toEqual(["slg-ttl-mean"]);
    expect(slgIds(withEntry(hybridState(), "slg.act.time-to-live", estimated(20, 40, { variant: "median" })))).toEqual([]);
  });

  it("slg-acv-vs-arpa: a new contract worth less than half or more than twice the book's average, entirely", () => {
    const acv = (amount: number) => withEntry(hybridState(), "slg.rev.acv", measured({ kind: "amount", amount }, hubspot));
    const check = sanityChecks(acv(60_000), CTX_FR, FR.strings.units).find((c) => c.id === "slg-acv-vs-arpa")!;
    // 60 000 ÷ 12 = 5 000 € a month against an ARPA of 1 800 €: ~2.8 times.
    expect(check).toMatchObject({ motion: "slg", metrics: ["slg.rev.acv", "slg.rev.arpa"], values: { x: "2,8" } });
    expect(slgIds(acv(8_000))).toContain("slg-acv-vs-arpa");
    expect(slgIds(acv(24_000))).not.toContain("slg-acv-vs-arpa");
    expect(slgIds(acv(43_000))).not.toContain("slg-acv-vs-arpa");
  });

  it("num-gt-den reaches the sales-assisted shares and the link, tagged with their motion", () => {
    const broken = withEntry(hybridState(), "slg.rev.win-rate", measured(ratio(90, 75), hubspot));
    expect(sanityChecks(broken, CTX_FR, FR.strings.units).find((c) => c.id === "num-gt-den")).toMatchObject({ motion: "slg", metrics: ["slg.rev.win-rate"] });
    // The NRR is not bounded: 106 % is a value, not an error.
    expect(ids(withEntry(hybridState(), "slg.ret.nrr", measured(ratio(212_000, 200_000), hubspot)))).not.toContain("num-gt-den");
  });

  it("a motion unticked raises nothing: its numbers stay in the file, the checks ignore them", () => {
    const off = withEntry(exampleState(), "slg.acq.cycle", cycle(200, "mean"));
    expect(ids(off)).toEqual([]);
    const plgOff = { ...hybridState(), setup: { ...hybridState().setup, motions: { plg: false, slg: true } } };
    expect(sanityChecks(withEntry(plgOff, "ret.logo-churn", measured(ratio(140, 400), tool)), CTX_FR, FR.strings.units).map((c) => c.id)).toEqual([]);
  });
});

describe("« deux outils » (§19.5.3, A14 T4)", () => {
  const twoTools = (state: EngineState) => sanityChecks(state, CTX_FR, FR.strings.units).filter((c) => c.id === "two-tools");

  it("a rate whose counts come from two tools is to check, never blocking, and says which", () => {
    const state = withEntry(exampleState(), "act.rate", measured(ratio(144, 800), { kind: "tool", tool: "amplitude" }, { denominatorSource: { kind: "tool", tool: "ga4" } }));
    const [check] = twoTools(state);
    expect(check).toMatchObject({ id: "two-tools", motion: "plg", blocking: false, metrics: ["act.rate"], values: { a: "amplitude", b: "ga4" } });
    expect(sanityText(check!, FR.strings, "fr")).toBe("Numérateur (Amplitude) et dénominateur (GA4) viennent de deux outils\u00a0: vérifie qu'ils comptent la même chose sur la même période.");
  });

  it("a tool's name loses its own parenthesis inside the sentence's", () => {
    const state = withEntry(exampleState(), "act.rate", measured(ratio(144, 800), { kind: "tool", tool: "cs-platform" }, { denominatorSource: { kind: "tool", tool: "hubspot" } }));
    const text = sanityText(twoTools(state)[0]!, FR.strings, "fr");
    expect(text).not.toMatch(/\([^)]*\(/);
    expect(text.startsWith("Numérateur (")).toBe(true);
  });

  it("nothing for one tool twice, a person, or no second source", () => {
    const same = withEntry(exampleState(), "act.rate", measured(ratio(144, 800), { kind: "tool", tool: "amplitude" }, { denominatorSource: { kind: "tool", tool: "amplitude" } }));
    const person = withEntry(exampleState(), "act.rate", measured(ratio(144, 800), { kind: "tool", tool: "amplitude" }, { denominatorSource: { kind: "person", role: "data" } }));
    for (const state of [exampleState(), same, person]) expect(twoTools(state)).toEqual([]);
  });
});

// --- A marketplace (§22.5.7; A23 MKT-4) — one case that triggers, one that doesn't, each check with its side.
// Non-vacuity, measured on 2026-10-25: see the entry of A23 MKT-4 in `JOURNAL.md`.

describe("a marketplace's checks", () => {
  const checksOf = (state: EngineState) => sanityChecks(state, CTX_FR, FR.strings.units);
  const of = (state: EngineState, id: SanityId) => checksOf(state).filter((c) => c.id === id);
  const sides = (state: EngineState, id: SanityId) => of(state, id).map((c) => `${c.side}:${c.metrics.join("+")}`);

  it("the example raises nothing, with the sellers' subscriptions or without: 3 000 × 20 % ÷ 600 = 1, inside the band", () => {
    expect(checksOf(marketplaceState())).toEqual([]);
    expect(checksOf(marketplaceNoSubscriptionsState())).toEqual([]);
    const r = mktReconcile(marketplaceState(), CTX_FR)!;
    expect(r.predicted).toEqual({ lo: 600, hi: 600 });
    expect(r.billed).toBe(600);
    expect(r.ratio).toEqual({ lo: 1, hi: 1 });
  });

  it("mkt-repeat-gt-first — the WHOLE second order above the first, on the demand", () => {
    // 870 of 2 900 is 30 %, past the first order's 20 %: two cohorts, or two windows.
    const [check] = of(withEntry(marketplaceState(), "mkt.buy.repeat", measured(ratio(870, 2_900), tool)), "mkt-repeat-gt-first");
    expect(check).toMatchObject({ id: "mkt-repeat-gt-first", motion: "mkt", side: "demand", blocking: false, metrics: ["mkt.buy.repeat", "mkt.buy.first-order"], values: {} });
    expect(sanityText(check!, FR.strings, "fr")).toBe("Plus de deuxièmes commandes que de premières\u00a0: les deux chiffres portent-ils sur la même cohorte et la même fenêtre\u00a0?");
    // Equal is no alert, and an estimate that overlaps the first order's 20 % is not "definitely" more.
    expect(of(withEntry(marketplaceState(), "mkt.buy.repeat", measured(ratio(580, 2_900), tool)), "mkt-repeat-gt-first")).toEqual([]);
    expect(of(withEntry(marketplaceState(), "mkt.buy.repeat", estimated(15, 25)), "mkt-repeat-gt-first")).toEqual([]);
  });

  it("churn-high — one check per churn, on its own side: the buyers' on the demand, the active and the paid sellers' on the supply", () => {
    let state = withEntry(marketplaceState(), "mkt.buy.churn", measured(ratio(5_600, 14_000), tool));
    expect(sides(state, "churn-high")).toEqual(["demand:mkt.buy.churn"]);
    state = withEntry(state, "mkt.sell.churn", measured(ratio(1_200, 3_200), tool));
    state = withEntry(state, "mkt.sell.paid-churn", measured(ratio(360, 900), tool));
    expect(sides(state, "churn-high")).toEqual(["demand:mkt.buy.churn", "supply:mkt.sell.churn", "supply:mkt.sell.paid-churn"]);
    for (const check of of(state, "churn-high")) expect(check).toMatchObject({ motion: "mkt", blocking: false });
    // The whole interval, as everywhere: a 20 to 40 % estimate is not « definitely an annual figure ».
    expect(of(withEntry(marketplaceState(), "mkt.buy.churn", estimated(20, 40)), "churn-high")).toEqual([]);
  });

  it("margin-odd — one check per stream's margin: the commissions' on the demand, the subscriptions' on the supply", () => {
    let state = withEntry(marketplaceState(), "mkt.rev.gross-margin", measured({ kind: "rate", percent: 98 }, tool));
    expect(sides(state, "margin-odd")).toEqual(["demand:mkt.rev.gross-margin"]);
    state = withEntry(state, "mkt.sell.gross-margin", measured({ kind: "rate", percent: 99 }, tool));
    expect(sides(state, "margin-odd")).toEqual(["demand:mkt.rev.gross-margin", "supply:mkt.sell.gross-margin"]);
    expect(of(withEntry(marketplaceState(), "mkt.rev.gross-margin", estimated(-8, -2)), "margin-odd")).toHaveLength(1);
    expect(of(withEntry(marketplaceState(), "mkt.rev.gross-margin", measured({ kind: "rate", percent: 80 }, tool)), "margin-odd")).toEqual([]);
  });

  it("mkt-take-high — a take rate whose WHOLE interval is past 50 %: the GMV counted without fees, or the net revenue counted gross", () => {
    // 164 268 € of 273 780 € is 60 %.
    const [check] = of(withEntry(marketplaceState(), "mkt.rev.take-rate", measured(ratio(164_268, 273_780), tool)), "mkt-take-high");
    expect(check).toMatchObject({ id: "mkt-take-high", motion: "mkt", side: "demand", blocking: false, metrics: ["mkt.rev.take-rate"] });
    expect(sanityText(check!, FR.strings, "fr")).toBe(
      "Une commission au-dessus de 50\u00a0%\u00a0: le GMV est-il compté sans les frais, ou le revenu net compté brut\u00a0?",
    );
    // Exactly 50 % is no alert, and neither is an estimate that straddles it.
    expect(of(withEntry(marketplaceState(), "mkt.rev.take-rate", measured(ratio(136_890, 273_780), tool)), "mkt-take-high")).toEqual([]);
    expect(of(withEntry(marketplaceState(), "mkt.rev.take-rate", estimated(40, 60)), "mkt-take-high")).toEqual([]);
  });

  it("cohort-mismatch — the columns of one funnel on different months, each funnel on its own", () => {
    const demand = withEntry(marketplaceState(), "mkt.buy.repeat", measured(ratio(145, 2_900), tool, { cohortMonth: "2026-04" }));
    expect(sides(demand, "cohort-mismatch")).toEqual(["demand:mkt.buy.first-order+mkt.buy.repeat"]);
    const supply = withEntry(marketplaceState(), "mkt.sell.paid-conversion", measured(ratio(63, 420), tool, { cohortMonth: "2026-04" }));
    expect(sides(supply, "cohort-mismatch")).toEqual(["supply:mkt.sell.first-sale+mkt.sell.paid-conversion"]);
    // The paid conversion is hidden without the subscriptions: the supply's funnel has one column, nothing to compare.
    const hidden = withEntry(marketplaceNoSubscriptionsState(), "mkt.sell.paid-conversion", measured(ratio(63, 420), tool, { cohortMonth: "2026-04" }));
    expect(of(hidden, "cohort-mismatch")).toEqual([]);
  });

  it("reconcile-gap — the buyer sign-ups × the first order against the buyer CAC's count, on the demand", () => {
    // 100 new buyers billed against the 600 the chain predicts.
    const off = withEntry(marketplaceState(), "mkt.buy.cac", measured(ratio(18_000, 100), tool, { variant: "media-only" }));
    const [check] = of(off, "reconcile-gap");
    expect(check).toMatchObject({
      motion: "mkt",
      side: "demand",
      blocking: false,
      metrics: ["mkt.buy.signup-rate", "mkt.buy.first-order", "mkt.buy.cac"],
      values: { p: "600", n: "100", month: "août 2026" },
      count: { lo: 600, hi: 600 },
    });
    expect(mktReconcile(off, CTX_FR)!.ratio.lo).toBeCloseTo(6, 9);
    // Without the CAC's count (an amount per buyer), or without the sign-ups' counts, there is nothing to reconcile.
    expect(mktReconcile(withEntry(marketplaceState(), "mkt.buy.cac", measured({ kind: "amount", amount: 30 }, tool)), CTX_FR)).toBeNull();
    expect(mktReconcile(withEntry(marketplaceState(), "mkt.buy.signup-rate", undefined), CTX_FR)).toBeNull();
  });

  it("num-gt-den and two-tools carry the side of their number: the sellers' on the supply, the `match` ones on the demand", () => {
    const broken = checksOf(withEntry(withEntry(withEntry(marketplaceState(), "mkt.buy.first-order", measured(ratio(3_000, 2_900), tool)), "mkt.sell.first-sale", measured(ratio(500, 420), tool)), "mkt.liq.fill-rate", measured(ratio(30_000, 26_000), tool)));
    expect(broken.filter((c) => c.id === "num-gt-den").map((c) => [c.metrics[0], c.motion, c.side, c.blocking])).toEqual([
      ["mkt.buy.first-order", "mkt", "demand", true],
      ["mkt.sell.first-sale", "mkt", "supply", true],
      ["mkt.liq.fill-rate", "mkt", "demand", true],
    ]);
    const two = checksOf(
      withEntry(
        withEntry(marketplaceState(), "mkt.sell.first-sale", measured(ratio(126, 420), tool, { denominatorSource: { kind: "tool", tool: "ga4" } })),
        "mkt.liq.fill-rate",
        measured(ratio(2_340, 26_000), tool, { denominatorSource: { kind: "tool", tool: "ga4" } }),
      ),
    );
    expect(two.filter((c) => c.id === "two-tools").map((c) => [c.metrics[0], c.motion, c.side])).toEqual([
      ["mkt.sell.first-sale", "mkt", "supply"],
      ["mkt.liq.fill-rate", "mkt", "demand"],
    ]);
  });

  it("reads nothing of the numbers the setup hides: without the subscriptions, the sellers' paid churn and margin raise nothing", () => {
    const hidden = withEntry(withEntry(marketplaceNoSubscriptionsState(), "mkt.sell.paid-churn", measured(ratio(360, 900), tool)), "mkt.sell.gross-margin", measured({ kind: "rate", percent: 99 }, tool));
    expect(checksOf(hidden)).toEqual([]);
    // The same numbers with the box ticked do raise them: they were stored, not erased.
    const shown = withEntry(withEntry(marketplaceState(), "mkt.sell.paid-churn", measured(ratio(360, 900), tool)), "mkt.sell.gross-margin", measured({ kind: "rate", percent: 99 }, tool));
    expect(checksOf(shown).map((c) => c.id)).toEqual(["churn-high", "margin-odd"]);
  });

  it("a SaaS raises none of the marketplace's checks and tags none of its own with a side", () => {
    const state = withEntry(withEntry(exampleState(), "ret.logo-churn", measured(ratio(140, 400), tool)), "rev.gross-margin", measured({ kind: "rate", percent: 98 }, tool));
    const checks = checksOf(state);
    expect(checks.map((c) => c.id)).toEqual(["churn-high", "margin-odd"]);
    for (const check of checks) expect(check).not.toHaveProperty("side");
    expect(checks.filter((c) => c.motion === "mkt")).toEqual([]);
  });
});
