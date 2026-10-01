import { describe, expect, it } from "vitest";
import { METRIC_SHAPES, REMIND_AFTER_DAYS, SLG_METRIC_SHAPES, motionShapes } from "@/lib/engine/catalog-shape";
import type { MetricEntry, MetricId, Snapshot } from "@/lib/engine/types";
import { FR } from "@/lib/engine/__tests__/props";
import { cheapestTodo, collectPlan, type CollectTools } from "../collect";

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

/** Non-vacuity, measured on 2026-10-01: letting the link into `motionShapes` fails the first case. */
describe("with the setup's motions (A7.3.c S3)", () => {
  it("the hybrid owes both motions' numbers, and never the link: it is optional (§18.4.8)", () => {
    const shapes = motionShapes({ plg: true, slg: true });
    const plan = collectPlan(snapshot(), NOW, shapes);
    expect(plan.count).toBe(METRIC_SHAPES.length + SLG_METRIC_SHAPES.length);
    const listed = [...plan.self.flatMap((g) => g.ids), ...plan.ask.flatMap((g) => [...g.toAsk, ...g.requested])];
    expect(listed).not.toContain("link.pql-handoff");
    expect(listed.filter((id) => id.startsWith("slg."))).toHaveLength(SLG_METRIC_SHAPES.length);
  });

  it("sales-assisted alone owes only its own fifteen; self-serve's default is the v1 plan", () => {
    const slg = collectPlan(snapshot(), NOW, motionShapes({ plg: false, slg: true }));
    expect(slg.count).toBe(SLG_METRIC_SHAPES.length);
    expect(slg.self.flatMap((g) => g.ids).every((id) => id.startsWith("slg."))).toBe(true);
    expect(collectPlan(snapshot(), NOW, motionShapes({ plg: true, slg: false }))).toEqual(collectPlan(snapshot(), NOW));
  });

  it("« Continuer » goes to sales-assisted's cheapest number when self-serve's are all answered", () => {
    const all = Object.fromEntries(METRIC_SHAPES.map((s) => [s.id, { status: "not-applicable", naReason: "x", updatedAt: NOW.toISOString() }]));
    const next = cheapestTodo(snapshot(all), motionShapes({ plg: true, slg: true }));
    expect(next).not.toBeNull();
    expect(SLG_METRIC_SHAPES.find((s) => s.id === next)?.effort).toBe("self-5min");
    expect(cheapestTodo(snapshot(all))).toBeNull();
  });
});

/** The catalogue's `where`, in its order, as the workbench reads it (§19.5.2, A14 T4). */
const citedBy = (id: MetricId) => (FR.metrics.find((m) => m.id === id)?.where ?? []).flatMap((w) => (w.source.kind === "tool" ? [w.source.tool] : []));
const tools = (...selected: CollectTools["selected"]): CollectTools => ({ selected, citedBy });

describe("by the team's tools (§19.5.2, A14 T4)", () => {
  it("nothing ticked, nothing changes: by effort, and no `byTool`", () => {
    const plan = collectPlan(snapshot(), NOW, METRIC_SHAPES, tools());
    expect(plan).toEqual(collectPlan(snapshot(), NOW));
    expect("byTool" in plan).toBe(false);
  });

  it("each number under the first of the team's tools its `where` cites, the groups in the order given", () => {
    const plan = collectPlan(snapshot(), NOW, METRIC_SHAPES, tools("ga4", "stripe"));
    expect(plan.self).toEqual([]);
    expect(plan.byTool!.map((g) => g.tool)).toEqual(["ga4", "stripe"]);
    for (const g of plan.byTool!) for (const id of g.ids) expect(citedBy(id).find((t) => ["ga4", "stripe"].includes(t))).toBe(g.tool);
    // The sign-up rate is GA4's; the churn Stripe's.
    expect(plan.byTool!.find((g) => g.tool === "ga4")!.ids).toContain("acq.signup-rate");
    expect(plan.byTool!.find((g) => g.tool === "stripe")!.ids).toContain("ret.logo-churn");
  });

  it("cited by two of the team's tools, a number goes under the first its `where` cites — not the first ticked", () => {
    const shape = METRIC_SHAPES.find((s) => s.effort !== "ask" && citedBy(s.id).length >= 2)!;
    const [first, second] = citedBy(shape.id) as [CollectTools["selected"][number], CollectTools["selected"][number]];
    const plan = collectPlan(snapshot(), NOW, METRIC_SHAPES, tools(second, first));
    expect(plan.byTool!.find((g) => g.ids.includes(shape.id))!.tool).toBe(first);
  });

  it("a number none of the team's tools gives goes to « À demander », under its default role — and every number is still listed once", () => {
    const plan = collectPlan(snapshot(), NOW, METRIC_SHAPES, tools("stripe"));
    // Activation lives in product analytics: not Stripe.
    expect(plan.byTool!.flatMap((g) => g.ids)).not.toContain("act.rate");
    const role = METRIC_SHAPES.find((s) => s.id === "act.rate")!.defaultRole;
    expect(plan.ask.find((g) => g.role === role)!.toAsk).toContain("act.rate");
    const listed = [...plan.byTool!.flatMap((g) => g.ids), ...plan.ask.flatMap((g) => [...g.toAsk, ...g.requested])];
    expect(new Set(listed).size).toBe(METRIC_SHAPES.length);
    expect(plan.count).toBe(METRIC_SHAPES.length);
  });
});
