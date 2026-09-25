import { METRIC_SHAPES } from "@/lib/engine/catalog-shape";
import { isRequestStale } from "@/lib/engine/request";
import type { Effort, MetricId, RoleId, Snapshot } from "@/lib/engine/types";
import { EFFORT_ORDER } from "./keys";

/**
 * The collect list's two plans (spec §7 E4), computed from the snapshot
 * alone — pure and deterministic, so the same engine always shows the same
 * plan and the unit tests can pin it.
 *
 * - "To do yourself": the `todo` numbers you can find on your own, grouped
 *   by effort, the five-minute ones first (they are the ones to start with).
 * - "To ask for": the `todo` numbers that need someone else, plus every
 *   `requested` one, grouped by ROLE — one copied message per person, not
 *   one per number — with the groups holding a request older than
 *   REMIND_AFTER_DAYS first: those are the ones slowing everything down.
 */
export interface AskGroup {
  role: RoleId;
  /** Not asked yet: what the group's copy button asks for. */
  toAsk: MetricId[];
  /** Asked, still waiting. */
  requested: MetricId[];
  /** Asked long enough ago to follow up (the clock restarts at `remindedAt`). */
  stale: MetricId[];
}

export interface CollectPlan {
  self: { effort: Exclude<Effort, "ask">; ids: MetricId[] }[];
  ask: AskGroup[];
  /** todo + requested — the tab's count. */
  count: number;
}

export function collectPlan(snapshot: Snapshot, now: Date): CollectPlan {
  const self = new Map<Exclude<Effort, "ask">, MetricId[]>();
  const ask = new Map<RoleId, AskGroup>();
  const group = (role: RoleId) => {
    let g = ask.get(role);
    if (!g) {
      g = { role, toAsk: [], requested: [], stale: [] };
      ask.set(role, g);
    }
    return g;
  };

  for (const shape of METRIC_SHAPES) {
    const entry = snapshot.metrics[shape.id];
    const status = entry?.status ?? "todo";
    if (status === "requested") {
      const g = group(entry?.request?.role ?? shape.defaultRole);
      g.requested.push(shape.id);
      if (isRequestStale(entry, now)) g.stale.push(shape.id);
    } else if (status === "todo") {
      if (shape.effort === "ask") group(shape.defaultRole).toAsk.push(shape.id);
      else self.set(shape.effort, [...(self.get(shape.effort) ?? []), shape.id]);
    }
  }

  const selfGroups = EFFORT_ORDER.filter((e): e is Exclude<Effort, "ask"> => e !== "ask")
    .filter((effort) => self.has(effort))
    .map((effort) => ({ effort, ids: self.get(effort)! }));
  // Stale first, then by how much is waiting; the role order breaks ties so the list never reshuffles between renders.
  const roles = Object.freeze(["finance", "data", "product", "marketing", "revops", "support"] satisfies RoleId[]);
  const askGroups = [...ask.values()].sort(
    (a, b) =>
      Number(b.stale.length > 0) - Number(a.stale.length > 0) ||
      b.toAsk.length + b.requested.length - (a.toAsk.length + a.requested.length) ||
      roles.indexOf(a.role) - roles.indexOf(b.role),
  );
  const count = selfGroups.reduce((n, g) => n + g.ids.length, 0) + askGroups.reduce((n, g) => n + g.toAsk.length + g.requested.length, 0);
  return { self: selfGroups, ask: askGroups, count };
}

/** The cheapest number still to fill — where "Continue" takes a returning person (E6), never "the last screen visited". */
export function cheapestTodo(snapshot: Snapshot): MetricId | null {
  for (const effort of EFFORT_ORDER) {
    const shape = METRIC_SHAPES.find((s) => s.effort === effort && (snapshot.metrics[s.id]?.status ?? "todo") === "todo");
    if (shape) return shape.id;
  }
  return null;
}
