import { describe, expect, it } from "vitest";
import { METRIC_SHAPES, REMIND_AFTER_DAYS } from "@/lib/engine/catalog-shape";
import type { MetricEntry, MetricId, Snapshot } from "@/lib/engine/types";
import { cheapestTodo, collectPlan } from "../collect";

/**
 * The collect plan (spec §7 E4) and the resume's "Continue" (E6): pure and
 * deterministic, so the same engine always shows the same plan — and the
 * tab's count always equals the coverage's "in progress".
 */
const NOW = new Date("2026-09-24T10:00:00.000Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();

function snapshot(metrics: Partial<Record<MetricId, MetricEntry>> = {}): Snapshot {
  return { id: "s", referenceMonth: "2026-08", cohortMonth: "2026-07", createdAt: daysAgo(10), metrics, targets: {} };
}

describe("collectPlan", () => {
  it("an empty engine puts every number somewhere, once: the count is fifteen", () => {
    const plan = collectPlan(snapshot(), NOW);
    expect(plan.count).toBe(METRIC_SHAPES.length);
    const listed = [...plan.self.flatMap((g) => g.ids), ...plan.ask.flatMap((g) => [...g.toAsk, ...g.requested])];
    expect(new Set(listed).size).toBe(METRIC_SHAPES.length);
  });

  it("'to do yourself' holds no 'ask' effort and starts with the five-minute ones", () => {
    const plan = collectPlan(snapshot(), NOW);
    expect(plan.self.map((g) => g.effort)).toEqual(["self-5min", "self-1h"]);
    for (const g of plan.self) for (const id of g.ids) expect(METRIC_SHAPES.find((s) => s.id === id)?.effort).toBe(g.effort);
    for (const g of plan.ask) for (const id of g.toAsk) expect(METRIC_SHAPES.find((s) => s.id === id)?.effort).toBe("ask");
  });

  it("a found or missing number leaves the plan; a requested one moves under the role it was asked of", () => {
    const plan = collectPlan(
      snapshot({
        "act.rate": { status: "measured", value: { kind: "rate", percent: 20 }, updatedAt: daysAgo(1) },
        "ret.d30": { status: "missing", missing: { cause: "not-tracked", repair: "sprint" }, updatedAt: daysAgo(1) },
        "acq.signup-rate": { status: "requested", request: { role: "revops", requestedAt: daysAgo(1) }, updatedAt: daysAgo(1) },
      }),
      NOW,
    );
    expect(plan.count).toBe(METRIC_SHAPES.length - 2);
    const revops = plan.ask.find((g) => g.role === "revops");
    expect(revops?.requested).toEqual(["acq.signup-rate"]);
    expect(revops?.stale).toEqual([]);
  });

  it(`a request older than ${REMIND_AFTER_DAYS} days is stale and its group comes first — and a reminder restarts the clock`, () => {
    const plan = collectPlan(
      snapshot({
        "ref.k-factor": { status: "requested", request: { role: "support", requestedAt: daysAgo(REMIND_AFTER_DAYS + 1) }, updatedAt: daysAgo(6) },
      }),
      NOW,
    );
    expect(plan.ask[0]?.role).toBe("support");
    expect(plan.ask[0]?.stale).toEqual(["ref.k-factor"]);

    const reminded = collectPlan(
      snapshot({
        "ref.k-factor": {
          status: "requested",
          request: { role: "support", requestedAt: daysAgo(20), remindedAt: daysAgo(1) },
          updatedAt: daysAgo(1),
        },
      }),
      NOW,
    );
    expect(reminded.ask.find((g) => g.role === "support")?.stale).toEqual([]);
  });
});

describe("cheapestTodo", () => {
  it("is the first five-minute number still to fill, then the one-hour ones", () => {
    const first = cheapestTodo(snapshot());
    expect(METRIC_SHAPES.find((s) => s.id === first)?.effort).toBe("self-5min");

    const fiveMinute = METRIC_SHAPES.filter((s) => s.effort === "self-5min").map((s) => s.id);
    const done = Object.fromEntries(fiveMinute.map((id) => [id, { status: "missing", missing: { cause: "not-tracked", repair: "meeting" }, updatedAt: NOW.toISOString() }]));
    expect(METRIC_SHAPES.find((s) => s.id === cheapestTodo(snapshot(done)))?.effort).toBe("self-1h");
  });

  it("is null when nothing is left to fill", () => {
    const all = Object.fromEntries(METRIC_SHAPES.map((s) => [s.id, { status: "not-applicable", naReason: "x", updatedAt: NOW.toISOString() }]));
    expect(cheapestTodo(snapshot(all))).toBeNull();
  });
});
