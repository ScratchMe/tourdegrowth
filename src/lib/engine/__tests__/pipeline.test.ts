import { describe, expect, it } from "vitest";
import { formatNumber } from "../format";
import { coverageText, pipelineCoverage } from "../pipeline";
import { monthView } from "../series";
import type { EngineState } from "../types";
import { exampleState, hybridState, salesAssistedState, withMonthBefore } from "./fixtures";

/**
 * Pipeline coverage (engine spec §19.4, C32 Q8, A14 T3.2): the open pipeline
 * against the quarter's target, a leading indicator on the relays — never a
 * stage, never money, never a published reference.
 */

function withPipeline(state: EngineState, open: number | undefined, pipeline: EngineState["setup"]["pipeline"]): EngineState {
  const snapshots = [...state.snapshots];
  const last = { ...snapshots[snapshots.length - 1]! };
  if (open === undefined) delete last.pipelineOpen;
  else last.pipelineOpen = open;
  snapshots[snapshots.length - 1] = last;
  return { ...state, setup: { ...state.setup, ...(pipeline ? { pipeline } : {}) }, snapshots };
}

describe("pipelineCoverage", () => {
  it("open ÷ the quarter's target: 520 000 € against 200 000 € is 2,6×", () => {
    const c = pipelineCoverage(withPipeline(hybridState(), 520_000, { quarterTarget: 200_000 }))!;
    expect(c).toMatchObject({ open: 520_000, target: 200_000, threshold: null, below: false, previous: null });
    expect(c.ratio).toBeCloseTo(2.6, 9);
    expect(coverageText(c.ratio, (v) => formatNumber(v, "fr"), "{n}×")).toBe("2,6×");
    expect(coverageText(c.ratio, (v) => formatNumber(v, "en"), "{n}×")).toBe("2.6×");
  });

  it("« below » only against the team's own threshold, never without one", () => {
    expect(pipelineCoverage(withPipeline(hybridState(), 520_000, { quarterTarget: 200_000, threshold: 3 }))).toMatchObject({ threshold: 3, below: true });
    expect(pipelineCoverage(withPipeline(hybridState(), 600_000, { quarterTarget: 200_000, threshold: 3 }))).toMatchObject({ below: false });
    expect(pipelineCoverage(withPipeline(hybridState(), 100_000, { quarterTarget: 200_000 }))).toMatchObject({ threshold: null, below: false });
  });

  it("nothing without both numbers, nor outside sales-assisted", () => {
    expect(pipelineCoverage(withPipeline(hybridState(), 520_000, undefined))).toBeNull();
    expect(pipelineCoverage(withPipeline(hybridState(), undefined, { quarterTarget: 200_000 }))).toBeNull();
    expect(pipelineCoverage(withPipeline(salesAssistedState(), 520_000, { quarterTarget: 200_000 }))).not.toBeNull();
    expect(pipelineCoverage(withPipeline(exampleState(), 520_000, { quarterTarget: 200_000 }))).toBeNull();
  });

  it("the month before's coverage travels with it (§19.2), and a past month reads its own", () => {
    const july = withMonthBefore(hybridState(), (m) => void (m.pipelineOpen = 420_000));
    const state = withPipeline(july, 520_000, { quarterTarget: 200_000 });
    const c = pipelineCoverage(state)!;
    expect(c.previous?.month).toBe("2026-07");
    expect(c.previous?.ratio).toBeCloseTo(2.1, 9);
    // July read on its own: its own 2,1×, and no month before it.
    const past = pipelineCoverage(monthView(state, 0, new Date(2026, 8, 24)).state)!;
    expect(past.ratio).toBeCloseTo(2.1, 9);
    expect(past.previous).toBeNull();
  });
});
