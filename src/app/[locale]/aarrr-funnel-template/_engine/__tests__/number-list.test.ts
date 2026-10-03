import { describe, expect, it } from "vitest";
import { coverage } from "@/lib/engine/coverage";
import { diagnose } from "@/lib/engine/diagnose";
import type { EngineState, MetricEntry, Snapshot } from "@/lib/engine/types";
import { PILLARS } from "@/lib/scoring/pillars";
import { CTX_FR } from "@/lib/engine/__tests__/props";
import { emptyState, estimated, exampleState, hybridState, withEntry } from "@/lib/engine/__tests__/fixtures";
import { listProgress, listStages, namedStages } from "../number-list";

/**
 * « Tes chiffres » (A18 T2.b, C41), pure: what each stage says, which one is
 * red, and what remains. Ported from the stage tabs' tests, which it replaces.
 *
 * Non-vacuity, each measured on its own:
 * - counting an estimate as found fails the example's counts and two of the
 *   « adds up to the coverage line » cases;
 * - dropping the clear/shared guard fails « a level diagnosis names nothing »;
 * - counting an estimate, a request or « can't find » as still to do fails
 *   the example's « 1 to go ».
 */

const last = (state: EngineState): Snapshot => state.snapshots[state.snapshots.length - 1]!;
const at = "2026-09-20T10:00:00.000Z";
const notApplicable = (naReason: string): MetricEntry => ({ status: "not-applicable", naReason, updatedAt: at });

describe("listStages — the §6.0 example", () => {
  const state = exampleState();
  const stages = listStages(last(state), diagnose(state, CTX_FR));

  it("one stage per AARRR stage, in the funnel's order", () => {
    expect(stages.map((s) => s.stage)).toEqual([...PILLARS]);
  });

  it("one mark per number, ★ first, in the catalogue's order", () => {
    expect(Object.fromEntries(stages.map((s) => [s.stage, s.marks]))).toEqual({
      acquisition: ["found", "found", "found"],
      activation: ["found", "found", "est"],
      retention: ["cant", "found", "cant"],
      referral: ["found", "found", "asked"],
      // The margin, estimated since C50.
      revenue: ["est", "found", "est", "found", "found"],
    });
    expect(stages.find((s) => s.stage === "activation")!.rows[0]!.id).toBe("act.rate");
  });

  it("counts found as the coverage line does: measured only, an estimate is not found", () => {
    expect(stages.map((s) => [s.stage, s.found, s.applicable])).toEqual([
      ["acquisition", 3, 3],
      ["activation", 2, 3],
      ["retention", 1, 3],
      ["referral", 2, 3],
      ["revenue", 3, 5],
    ]);
  });

  it("holds back the stage the diagnosis names, and only it — churn is below its reference but not named", () => {
    expect(stages.filter((s) => s.holdsBack).map((s) => s.stage)).toEqual(["activation"]);
  });

  it("says what remains: the example has a request out and nothing to do, so « none to go »", () => {
    expect(listProgress(stages)).toEqual({ remaining: 0, found: 11, est: 3, asked: 1, cant: 2 });
  });

  it("a number still to do is the only thing « to go »", () => {
    const state = withEntry(exampleState(), "act.ttv", { status: "todo", updatedAt: at } as MetricEntry);
    expect(listProgress(listStages(last(state), diagnose(state, CTX_FR))).remaining).toBe(1);
  });
});

describe("listStages — the stages add up to the coverage line", () => {
  const cases: [string, EngineState][] = [
    ["the example", exampleState()],
    ["an empty engine", emptyState()],
    [
      "numbers that don't apply",
      withEntry(withEntry(exampleState(), "ref.k-factor", notApplicable("no-invite-mechanism")), "ret.logo-churn", notApplicable("not-subscription")),
    ],
  ];
  for (const [name, state] of cases) {
    it(name, () => {
      const stages = listStages(last(state), diagnose(state, CTX_FR));
      const line = coverage(last(state));
      expect(stages.reduce((n, s) => n + s.found, 0)).toBe(line.found);
      expect(stages.reduce((n, s) => n + s.applicable, 0)).toBe(line.denominator);
    });
  }

  it("a number that doesn't apply keeps its row, but leaves the marks and the counts", () => {
    const state = withEntry(exampleState(), "ref.k-factor", notApplicable("no-invite-mechanism"));
    const referral = listStages(last(state), diagnose(state, CTX_FR)).find((s) => s.stage === "referral")!;
    expect(referral.applicable).toBe(2);
    expect(referral.marks).toEqual(["found", "found"]);
    expect(referral.rows.map((r) => r.status)).toEqual(["found", "found", "na"]);
  });

  it("an empty engine: everything to go, nothing else", () => {
    const state = emptyState();
    expect(listProgress(listStages(last(state), diagnose(state, CTX_FR)))).toEqual({ remaining: 17, found: 0, est: 0, asked: 0, cant: 0 });
  });
});

describe("namedStages", () => {
  it("a level or not-enough diagnosis names nothing, whatever its list says", () => {
    const state = exampleState();
    const d = diagnose(state, CTX_FR);
    expect(namedStages({ ...d, state: "level" }).size).toBe(0);
    expect(namedStages({ ...d, state: "not-enough" }).size).toBe(0);
    expect([...namedStages(d)]).toEqual(["activation"]);
  });

  it("names retention when the diagnosis names churn — not retention's ★", () => {
    const state = withEntry(exampleState(), "act.rate", estimated(15, 25));
    const d = diagnose(state, CTX_FR);
    expect(d.named).toEqual(["ret.logo-churn"]);
    expect(listStages(last(state), d).filter((s) => s.holdsBack).map((s) => s.stage)).toEqual(["retention"]);
  });
});

/**
 * Non-vacuity, measured on 2026-10-01 for the tabs: reading self-serve's
 * numbers whatever the motion fails the first two cases.
 */
describe("per motion (A7.3.c S3) — the hybrid shows one engine's list at a time", () => {
  it("sales-assisted's list: its own numbers, ★ first, and its own diagnosis's stage", () => {
    const state = hybridState();
    const stages = listStages(last(state), diagnose(state, CTX_FR, "slg"), "slg");
    expect(Object.fromEntries(stages.map((s) => [s.stage, s.rows.map((r) => `${r.id}:${r.status}`)]))).toEqual({
      acquisition: ["slg.acq.lead-to-opp:found", "slg.acq.cac:found", "slg.acq.cycle:found"],
      activation: ["slg.act.go-live:cant", "slg.act.live-event:found", "slg.act.time-to-live:todo"],
      retention: ["slg.ret.renewal:found", "slg.ret.nrr:est", "slg.ret.loss-cause:found"],
      referral: ["slg.ref.referred-share:found", "slg.ref.referenceable:asked"],
      revenue: ["slg.rev.win-rate:found", "slg.rev.acv:found", "slg.rev.arpa:found", "slg.rev.gross-margin:cant"],
    });
    // The §18.9 example names the win rate: revenue is red, and only it.
    expect(stages.filter((s) => s.holdsBack).map((s) => s.stage)).toEqual(["revenue"]);
  });

  it("the link is in neither engine's stages: it is optional, and has its own group", () => {
    const state = hybridState();
    for (const motion of ["plg", "slg"] as const) {
      const ids = listStages(last(state), motion === "plg" ? diagnose(state, CTX_FR) : diagnose(state, CTX_FR, "slg"), motion).flatMap((s) => s.rows.map((r) => r.id));
      expect(ids).not.toContain("link.pql-handoff");
      expect(ids.every((id) => (motion === "slg" ? id.startsWith("slg.") : !id.startsWith("slg.")))).toBe(true);
    }
  });

  it("self-serve's list in the hybrid is the v1 list, to the mark", () => {
    const marks = (s: EngineState) => listStages(last(s), diagnose(s, CTX_FR)).map((x) => x.marks);
    expect(marks(hybridState())).toEqual(marks(exampleState()));
  });
});
