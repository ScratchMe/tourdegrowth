import { describe, expect, it } from "vitest";
import { deriveEngine } from "../derive";
import type { EngineState, Finding, FindingKind, MetricEntry } from "../types";
import { CTX_FR, FR } from "./props";
import { estimated, exampleState, filmState, hybridState, measured, missing, ratio, salesAssistedState, tourResult, withEntry } from "./fixtures";
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

  it("in rank order: the break, the missing definition, the stage below its target, the uncomputable payback", () => {
    expect(findings).toEqual([
      { kind: "chain-break", motion: "plg", rank: 1, metrics: ["ret.d30"], values: {} },
      { kind: "no-definition", motion: "plg", rank: 2, metrics: ["ret.churn-cause"], values: {} },
      { kind: "below-comparator", motion: "plg", rank: 2, metrics: ["act.rate"], values: { value: "18 %", comparator: "20 %" } },
      { kind: "unit-econ-uncomputable", motion: "plg", rank: 3, metrics: ["rev.cac-payback", "rev.gross-margin"], values: {} },
    ]);
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
    expect(derive(hybridState()).findings).toEqual([
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
