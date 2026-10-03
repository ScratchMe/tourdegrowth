import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/content/copy-library";
import { buildMirror, declaredLevel, latestTourWithAnswers, verdictOf } from "../bridge";
import { ENGINE_BRIDGES, SLG_ENGINE_BRIDGES } from "../catalog-shape";
import type { MetricEntry, MirrorVerdict, TrackingLevel } from "../types";
import { FR } from "./props";
import { exampleState, hybridState, noMarginState, salesAssistedState, tourResult, withEntry } from "./fixtures";

// Engine spec §13.1 "bridge". Non-vacuity, measured: giving todo/requested/
// not-applicable a verdict (found "unknown") fails "no verdict for what
// nobody has looked for" and the example's counts; taking the first result
// with answers instead of the most recent fails "latest with answers" only.

describe("the declared × found matrix (§6.11)", () => {
  const expected: Record<TrackingLevel, Record<TrackingLevel, MirrorVerdict>> = {
    tracked: { tracked: "coherent", approximate: "blind-spot-light", unknown: "blind-spot" },
    approximate: { tracked: "better", approximate: "coherent", unknown: "blind-spot-light" },
    unknown: { tracked: "better", approximate: "better", unknown: "known-gap" },
  };
  const levels: TrackingLevel[] = ["tracked", "approximate", "unknown"];
  for (const declared of levels) {
    for (const found of levels) {
      it(`declared ${declared} × found ${found} → ${expected[declared][found]}`, () => {
        expect(verdictOf(declared, found)).toBe(expected[declared][found]);
      });
    }
  }
  it("points → declared level", () => {
    expect([declaredLevel(20), declaredLevel(7), declaredLevel(0)]).toEqual(["tracked", "approximate", "unknown"]);
  });
});

describe("the eight bridges", () => {
  it("pinned: adding one is a decision", () => {
    expect(ENGINE_BRIDGES).toEqual([
      { questionId: "acq-1", metric: "acq.top-channel-share" },
      { questionId: "acq-3", metric: "acq.cac" },
      { questionId: "act-1", metric: "act.event" },
      { questionId: "act-2", metric: "act.rate" },
      { questionId: "ret-1", metric: "ret.d30" },
      { questionId: "ret-3", metric: "ret.churn-cause" },
      { questionId: "ref-3", metric: "ref.k-factor" },
      { questionId: "rev-2", metric: "rev.ltv" },
    ]);
  });

  it("every question exists in the Tour, with 20 / 7 / 0 points — self-serve's eight, then sales-assisted's six", () => {
    for (const { questionId } of [...ENGINE_BRIDGES, ...SLG_ENGINE_BRIDGES]) {
      const q = QUESTIONS.find((x) => x.id === questionId);
      expect(q, questionId).toBeDefined();
      expect(q!.options.map((o) => o.points)).toEqual([20, 7, 0]);
    }
    expect(FR.bridges.map((b) => b.metric)).toEqual([...ENGINE_BRIDGES, ...SLG_ENGINE_BRIDGES].map((b) => b.metric));
  });
});

describe("latestTourWithAnswers", () => {
  it("the most recent result that carries answers", () => {
    const old = tourResult({ "acq-1": 0 }, { id: "a", createdAt: "2026-08-01T00:00:00.000Z" });
    const recent = tourResult({ "acq-1": 1 }, { id: "b", createdAt: "2026-09-01T00:00:00.000Z" });
    const newestNoAnswers = tourResult({}, { id: "c", createdAt: "2026-09-10T00:00:00.000Z", answers: undefined });
    expect(latestTourWithAnswers([recent, old, newestNoAnswers])?.id).toBe("b");
    expect(latestTourWithAnswers([old, recent])?.id).toBe("b");
    expect(latestTourWithAnswers([newestNoAnswers])).toBeNull();
    expect(latestTourWithAnswers([])).toBeNull();
  });
});

describe("buildMirror on the §6.0 example", () => {
  // acq-1 20 pts · acq-3 20 · act-1 0 · act-2 20 · ret-1 20 · ret-3 7 · ref-3 0 · rev-2 20
  const answers = { "acq-1": 0, "acq-3": 0, "act-1": 2, "act-2": 0, "ret-1": 0, "ret-3": 1, "ref-3": 2, "rev-2": 0 } as const;
  const mirror = buildMirror(exampleState(), tourResult(answers), FR.bridges);
  const verdict = (q: string) => mirror.rows.find((r) => r.questionId === q)!;

  it("one verdict per looked-for number", () => {
    expect(verdict("acq-1")).toMatchObject({ declared: "tracked", found: "tracked", verdict: "coherent" });
    expect(verdict("act-1")).toMatchObject({ declaredPoints: 0, found: "tracked", verdict: "better" });
    expect(verdict("ret-1")).toMatchObject({ declared: "tracked", found: "unknown", verdict: "blind-spot" });
    expect(verdict("ret-3")).toMatchObject({ declared: "approximate", found: "unknown", verdict: "blind-spot-light" });
    // LTV is found as its weakest input: the margin is estimated (C50, 70 to 80 %), so approximate.
    expect(verdict("rev-2")).toMatchObject({ metric: "rev.ltv", found: "approximate", verdict: "blind-spot-light" });
    expect(mirror.counts).toEqual({ coherent: 3, "blind-spot": 1, "blind-spot-light": 2, better: 1, "known-gap": 0 });
    // Without the margin, the LTV is not found at all.
    const noMargin = buildMirror(noMarginState(), tourResult(answers), FR.bridges);
    expect(noMargin.rows.find((r) => r.questionId === "rev-2")).toMatchObject({ found: "unknown", verdict: "blind-spot" });
    expect(mirror).toMatchObject({ resultId: "11111111-1111-4111-8111-111111111111", total: 58, takenAt: "2026-09-01T10:00:00.000Z" });
  });

  it("no verdict for what nobody has looked for: todo, requested, not applicable", () => {
    expect(verdict("ref-3")).toMatchObject({ found: null, verdict: null }); // requested
    const na: MetricEntry = { status: "not-applicable", naReason: "no-invite-mechanism", updatedAt: "x" };
    const todo = buildMirror(withEntry(exampleState(), "act.rate", undefined), tourResult(answers), FR.bridges);
    expect(todo.rows.find((r) => r.questionId === "act-2")).toMatchObject({ found: null, verdict: null });
    const notApplicable = buildMirror(withEntry(exampleState(), "ref.k-factor", na), tourResult(answers), FR.bridges);
    expect(notApplicable.rows.find((r) => r.questionId === "ref-3")).toMatchObject({ found: null, verdict: null });
  });

  it("an unanswered question declares nothing", () => {
    expect(buildMirror(exampleState(), tourResult({ "acq-1": 0 }), FR.bridges).rows).toHaveLength(1);
  });
});

// --- The hybrid (§18.4.9; A7.3.c S1). Non-vacuity, measured on 2026-10-01: a
// mirror that keeps an unticked motion's rows fails « self-serve alone », four
// deck tests whose mirror slide counts rows, and the golden v1's linked Tour.

describe("the mirror in the hybrid: one row per (question, motion)", () => {
  // Every bridged question answered « Oui, et on le mesure » (20 points).
  const allTracked = tourResult(Object.fromEntries([...ENGINE_BRIDGES, ...SLG_ENGINE_BRIDGES].map((b) => [b.questionId, 0 as const])));

  it("a question bridged in both motions gives two rows, self-serve's first; the counts count rows", () => {
    const mirror = buildMirror(hybridState(), allTracked, FR.bridges);
    expect(mirror.rows.map((r) => [r.questionId, r.motion, r.metric])).toEqual([
      ["acq-1", "plg", "acq.top-channel-share"],
      ["acq-3", "plg", "acq.cac"],
      ["act-1", "plg", "act.event"],
      ["act-2", "plg", "act.rate"],
      ["ret-1", "plg", "ret.d30"],
      ["ret-3", "plg", "ret.churn-cause"],
      ["ref-3", "plg", "ref.k-factor"],
      ["rev-2", "plg", "rev.ltv"],
      ["acq-3", "slg", "slg.acq.cac"],
      ["act-1", "slg", "slg.act.live-event"],
      ["act-2", "slg", "slg.act.go-live"],
      ["ret-1", "slg", "slg.ret.renewal"],
      ["ret-3", "slg", "slg.ret.loss-cause"],
      ["rev-2", "slg", "slg.rev.ltv"],
    ]);
    const slg = mirror.rows.filter((r) => r.motion === "slg");
    // Measured, measured, missing, measured, measured (a hunch is still found), and the LTV's margin missing.
    expect(slg.map((r) => r.verdict)).toEqual(["coherent", "coherent", "blind-spot", "coherent", "coherent", "blind-spot"]);
    expect(Object.values(mirror.counts).reduce((a, b) => a + b, 0)).toBe(mirror.rows.filter((r) => r.verdict !== null).length);
  });

  it("self-serve alone keeps self-serve's rows only, as before", () => {
    const mirror = buildMirror(exampleState(), allTracked, FR.bridges);
    expect(mirror.rows.every((r) => r.motion === "plg")).toBe(true);
    expect(mirror.rows).toHaveLength(ENGINE_BRIDGES.length);
    expect(buildMirror(salesAssistedState(), allTracked, FR.bridges).rows.map((r) => r.motion)).toEqual(Array(6).fill("slg"));
  });
});
