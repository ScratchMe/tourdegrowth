import { describe, expect, it } from "vitest";
import { deriveEngine } from "../derive";
import type { EngineState, Finding, FindingKind, MetricEntry } from "../types";
import { CTX_FR, FR } from "./props";
import { exampleState, measured, missing, ratio, tourResult, withEntry } from "./fixtures";

// Engine spec §13.1 "findings" — a table case → kinds, and stable ranks.
// Non-vacuity, measured: raising a chain-break for a column that is only
// "todo" fails "in progress is not a finding" only; dropping the event/rate
// merge fails "a missing event is one finding" only. Removing the final
// sort entirely passes EVERY test: findings are built in rank order, so the
// sort is a guard against a future block added out of place, and the
// explicit order below is what would catch that block.

const tool = { kind: "tool", tool: "stripe" } as const;
const derive = (state: EngineState, result = null as ReturnType<typeof tourResult> | null) =>
  deriveEngine(state, CTX_FR, result, FR.bridges, FR.strings.units);
const kinds = (fs: Finding[]): FindingKind[] => fs.map((f) => f.kind);

describe("findings — the §6.0 example", () => {
  const { findings } = derive(exampleState());

  it("in rank order: the break, the missing definition, the stage below its reference, the uncomputable payback", () => {
    expect(findings).toEqual([
      { kind: "chain-break", rank: 1, metrics: ["ret.d30"], values: {} },
      { kind: "no-definition", rank: 2, metrics: ["ret.churn-cause"], values: {} },
      { kind: "below-comparator", rank: 2, metrics: ["act.rate"], values: { value: "18 %", comparator: "20 à 40 %" } },
      { kind: "unit-econ-uncomputable", rank: 3, metrics: ["rev.cac-payback", "rev.gross-margin"], values: {} },
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
    expect(f).toEqual({ kind: "conflict", rank: 3, metrics: ["ret.logo-churn"], values: { a: "2,5 %", b: "3 %" } });
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
    expect(Object.keys(d).sort()).toEqual(["coverage", "diagnosis", "findings", "mirror", "peloton", "sanity", "unit"]);
    expect(d.coverage.found).toBe(9);
    expect(d.peloton.chain).toBe("gap");
    expect(d.diagnosis.state).toBe("clear");
    expect(d.sanity).toEqual([]);
  });
});
