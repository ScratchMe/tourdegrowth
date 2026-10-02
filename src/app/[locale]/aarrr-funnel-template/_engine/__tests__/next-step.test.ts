import { describe, expect, it } from "vitest";
import { METRIC_SHAPES, motionShapes, type MetricShape } from "@/lib/engine/catalog-shape";
import type { NextMonth } from "@/lib/engine/series";
import type { MetricEntry, MetricId, Snapshot } from "@/lib/engine/types";
import { collectPlan, type CollectTools } from "../collect";
import { nextSelfNumber, nextStepFor, type NextStepChoice, type NextStepFacts } from "../next-step";

/**
 * The board's one next step (A18 T0, `NextStep.prompt.md`): a fixed order,
 * the first match wins, the funnel's order within a rank. The board's states
 * in the return (`return`, `progress-middle`, `progress-end`, `return-found`,
 * `return-month`, `return-past`, `return-refused`) are each pinned below,
 * with the engine they show.
 */
const NOW = new Date("2026-09-24T10:00:00.000Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();
const NOT_YET: NextMonth = { kind: "not-yet" };
const SELF_SERVE = motionShapes({ plg: true, slg: false });
const HYBRID = motionShapes({ plg: true, slg: true });

const found: MetricEntry = { status: "measured", value: { kind: "rate", percent: 20 }, updatedAt: daysAgo(1) };
const asked = (role: "finance" | "data" | "support", days: number): MetricEntry => ({
  status: "requested",
  request: { role, requestedAt: daysAgo(days) },
  updatedAt: daysAgo(days),
});
const QUICK = SELF_SERVE.filter((s) => s.effort === "self-5min").map((s) => s.id);
const ASK = SELF_SERVE.filter((s) => s.effort === "ask").map((s) => s.id);
const LONG = SELF_SERVE.filter((s) => s.effort === "self-1h").map((s) => s.id);
const all = (ids: readonly MetricId[], entry: MetricEntry) => Object.fromEntries(ids.map((id) => [id, entry]));

function snapshot(metrics: Partial<Record<MetricId, MetricEntry>> = {}): Snapshot {
  return { id: "s", referenceMonth: "2026-08", cohortMonth: "2026-07", createdAt: daysAgo(10), metrics, targets: {} };
}

function step(
  metrics: Partial<Record<MetricId, MetricEntry>> = {},
  facts: Partial<Omit<NextStepFacts, "plan">> & { tools?: CollectTools } = {},
): NextStepChoice {
  const shapes = facts.shapes ?? SELF_SERVE;
  return nextStepFor({
    plan: collectPlan(snapshot(metrics), NOW, shapes, facts.tools),
    shapes,
    writeFailed: facts.writeFailed ?? false,
    viewingPast: facts.viewingPast ?? false,
    nextMonth: facts.nextMonth ?? NOT_YET,
  });
}

describe("nextStepFor: the order, first match wins", () => {
  it("a refused write takes over everything: a file is the only way left to keep the work (return-refused)", () => {
    expect(step({}, { writeFailed: true, viewingPast: true, nextMonth: { kind: "ready", referenceMonth: "2026-09", cohortMonth: "2026-08" } })).toEqual({
      kind: "save-file",
    });
  });

  it("a past month on screen comes back to the current one before anything else is offered (return-past)", () => {
    expect(step({}, { viewingPast: true, nextMonth: { kind: "ready", referenceMonth: "2026-09", cohortMonth: "2026-08" } })).toEqual({
      kind: "back-to-current",
    });
  });

  it("a month that can start comes before the numbers left in this one (return-month)", () => {
    expect(step({}, { nextMonth: { kind: "ready", referenceMonth: "2026-09", cohortMonth: "2026-08" } })).toEqual({
      kind: "start-month",
      referenceMonth: "2026-09",
    });
  });

  it("a month that is not over, or a file that is full, offers no month", () => {
    expect(step({}, { nextMonth: { kind: "not-yet" } }).kind).toBe("number");
    expect(step({}, { nextMonth: { kind: "full" } }).kind).toBe("number");
  });

  it("an empty engine starts with the first five-minute number, in the funnel's order", () => {
    expect(step()).toEqual({ kind: "number", id: "acq.signup-rate", effort: "self-5min" });
  });

  it("the five-minute numbers come before the requests, even with every request still to send", () => {
    // The first number is typed within two screens of arriving.
    expect(step(all(QUICK.slice(0, 4), found))).toEqual({ kind: "number", id: QUICK[4], effort: "self-5min" });
  });

  it("then the requests, all on one screen when there are several (progress-middle)", () => {
    expect(step(all(QUICK, found))).toEqual({
      kind: "ask-all",
      ids: ["acq.cac", "ret.churn-cause", "ref.k-factor", "rev.paid-conversion", "rev.gross-margin"],
    });
  });

  it("one request left: ask its role for that number (the return: « Ask Finance for the CAC »)", () => {
    // The brief's returning engine: every quick number found, Data asked for K twelve days ago, the CAC not asked yet.
    const answered = ASK.filter((id) => id !== "acq.cac" && id !== "ref.k-factor");
    const metrics = { ...all(QUICK, found), ...all(answered, found), "ref.k-factor": asked("data", 12) };
    expect(step(metrics)).toEqual({ kind: "ask-one", id: "acq.cac", role: "finance" });
  });

  it("the requests sent, the numbers of about an hour, in the funnel's order", () => {
    expect(step({ ...all(QUICK, found), ...all(ASK, asked("finance", 0)) })).toEqual({ kind: "number", id: LONG[0], effort: "self-1h" });
    expect(LONG[0]).toBe("acq.top-channel-share");
  });

  it("nothing left to type, requests out: the slides, with the requests that wait (progress-end)", () => {
    const metrics = { ...all(QUICK, found), ...all(LONG, found), ...all(ASK, found), "rev.gross-margin": asked("finance", 2), "ref.k-factor": asked("data", 9) };
    expect(step(metrics)).toEqual({ kind: "slides", waiting: ["ref.k-factor", "rev.gross-margin"] });
  });

  it("every number with an answer: the slides, nothing waiting (return-found)", () => {
    expect(step({ ...all(QUICK, found), ...all(LONG, found), ...all(ASK, found) })).toEqual({ kind: "slides", waiting: [] });
  });

  it("an answer that is not a value still counts as an answer: missing and not applicable leave the plan", () => {
    const missing: MetricEntry = { status: "missing", missing: { cause: "not-tracked", repair: "sprint" }, updatedAt: daysAgo(1) };
    const na: MetricEntry = { status: "not-applicable", naReason: "not-subscription", updatedAt: daysAgo(1) };
    expect(step({ ...all(QUICK, missing), ...all(LONG, na), ...all(ASK, found) })).toEqual({ kind: "slides", waiting: [] });
  });
});

describe("nextStepFor: the hybrid, one primary for both engines", () => {
  it("takes the two motions' numbers stage by stage, not one motion then the other", () => {
    expect(step({}, { shapes: HYBRID })).toEqual({ kind: "number", id: "acq.signup-rate", effort: "self-5min" });
    // Activation: self-serve's event, then sales-assisted's live event, before self-serve's retention.
    expect(step({ "acq.signup-rate": found }, { shapes: HYBRID })).toEqual({ kind: "number", id: "act.event", effort: "self-5min" });
    expect(step({ "acq.signup-rate": found, "act.event": found }, { shapes: HYBRID })).toEqual({
      kind: "number",
      id: "slg.act.live-event",
      effort: "self-5min",
    });
  });

  it("asks for both motions' numbers on one screen, in the funnel's order", () => {
    const quick = HYBRID.filter((s) => s.effort === "self-5min").map((s) => s.id);
    const choice = step(all(quick, found), { shapes: HYBRID });
    expect(choice.kind).toBe("ask-all");
    if (choice.kind !== "ask-all") return;
    expect(choice.ids.slice(0, 3)).toEqual(["acq.cac", "slg.acq.cac", "slg.act.go-live"]);
    expect(choice.ids).toHaveLength(HYBRID.filter((s) => s.effort === "ask").length);
  });
});

describe("nextStepFor reads the collect plan, so the next step and the lists agree", () => {
  it("with the team's tools ticked, a quick number none of them covers is a request, not a number to type", () => {
    const tools: CollectTools = { selected: ["stripe"], citedBy: (id) => (id === "rev.arpa" ? ["stripe"] : []) };
    // Only the ARPA is the team's to read: it is the one quick number left.
    expect(step({}, { tools })).toEqual({ kind: "number", id: "rev.arpa", effort: "self-5min" });
    // Found, every other number is someone else's: the requests, the uncovered quick ones among them.
    const choice = step({ "rev.arpa": found }, { tools });
    expect(choice.kind).toBe("ask-all");
    if (choice.kind === "ask-all") expect(choice.ids[0]).toBe("acq.signup-rate");
  });

  it("one uncovered number left to ask goes to its default role", () => {
    const tools: CollectTools = { selected: ["stripe"], citedBy: () => [] };
    const others = SELF_SERVE.map((s) => s.id).filter((id) => id !== "act.event");
    expect(step(all(others, found), { tools })).toEqual({ kind: "ask-one", id: "act.event", role: "product" });
  });

  it("a number built rather than read waits with the numbers of about an hour", () => {
    // No number of the catalogue is « build » today; the rank is fixed for the day one is.
    const shapes: MetricShape[] = METRIC_SHAPES.map((s) => (s.id === "acq.top-channel-share" ? { ...s, effort: "build" } : s));
    expect(step({ ...all(QUICK, found), ...all(ASK, found) }, { shapes })).toEqual({ kind: "number", id: "acq.top-channel-share", effort: "build" });
  });
});

describe("nextSelfNumber: « Taper d'abord le chiffre suivant » (A18 T2.a)", () => {
  const self = (metrics: Partial<Record<MetricId, MetricEntry>> = {}) => nextSelfNumber(collectPlan(snapshot(metrics), NOW, SELF_SERVE), SELF_SERVE);

  it("is the number rank 4 opens while a five-minute one is left", () => {
    const choice = step();
    expect(choice.kind).toBe("number");
    expect(self()).toEqual({ id: (choice as Extract<NextStepChoice, { kind: "number" }>).id, effort: "self-5min" });
  });

  it("beside the requests (rank 5), is the hour-long number rank 6 would open once they are sent", () => {
    const quickDone = all(QUICK, found);
    expect(step(quickDone).kind).toBe("ask-all");
    const after = step({ ...quickDone, ...all(ASK, asked("finance", 1)) });
    expect(after.kind).toBe("number");
    expect(self(quickDone)).toEqual({ id: (after as Extract<NextStepChoice, { kind: "number" }>).id, effort: "self-1h" });
    expect(LONG).toContain(self(quickDone)!.id);
  });

  it("is null once nothing is left to find alone", () => {
    expect(self({ ...all(QUICK, found), ...all(LONG, found), ...all(SELF_SERVE.filter((s) => s.effort === "build").map((s) => s.id), found) })).toBeNull();
  });
});
