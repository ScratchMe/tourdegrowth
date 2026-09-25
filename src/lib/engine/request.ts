import { REMIND_AFTER_DAYS } from "./catalog-shape";
import { fillTemplate } from "./format";
import { catalogueValues } from "./phrases";
import type { EngineStrings, ResolvedMetric } from "./strings";
import type { EngineCalcContext, EngineState, MetricEntry, MetricId, RoleId, Snapshot } from "./types";
import { currentSnapshot, entryOf } from "./values";

/**
 * request.ts — the message a Head of Growth copies to finance, data or
 * product to ask for the numbers (engine spec §6.13).
 *
 * **No value the user entered is ever in it.** It says what to pull, for
 * which period and under which definition — the reader's own words
 * (`definitionNote`, the activation event's name) are the only user text it
 * may carry, because they ARE the definition. A count, an estimate, a
 * conflict, a private note: never. A copied message is the one artefact of
 * this tool that routinely lands in someone else's inbox.
 *
 * The follow-up clock restarts at `remindedAt`, not at `requestedAt` — the
 * same rule as lib/audit/tracking.ts, for the same reason: "asked ten days
 * ago, chased yesterday" and "asked ten days ago, never chased" are two
 * situations, and only the second calls for action.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function metricById(metrics: ResolvedMetric[], id: MetricId): ResolvedMetric {
  const metric = metrics.find((m) => m.id === id);
  if (!metric) throw new Error(`No resolved prose for engine metric ${id}`);
  return metric;
}

/**
 * `role` is part of the contract so the caller says who it is writing to;
 * the template deliberately doesn't name them ("Hi Finance —" reads like a
 * form letter). The metrics are listed in the order given.
 */
export function buildRequest(
  role: RoleId,
  metricIds: MetricId[],
  strings: EngineStrings,
  metrics: ResolvedMetric[],
  state: EngineState,
  ctx: EngineCalcContext,
): string {
  const snapshot = currentSnapshot(state);
  const items = metricIds.map((id) => {
    // The event's name is the activation's definition: the recipient can't count "activated" without it,
    // so {event} carries it — quoted and introduced (« l'événement « a créé un premier projet » »).
    const what = fillTemplate(metricById(metrics, id).request, catalogueValues(state, id, strings, metrics, ctx));
    const entry = entryOf(snapshot, id);
    const definition = entry?.definitionNote?.trim();
    return definition
      ? fillTemplate(strings.request.item, { what, definition })
      : fillTemplate(strings.request.itemNoDefinition, { what });
  });
  return fillTemplate(strings.request.message, { list: items.join("\n") });
}

/** Whole days between two instants; null when unreadable or in the future (a clock ahead invents no delay). */
function daysBetween(fromIso: string, now: Date): number | null {
  const from = Date.parse(fromIso);
  if (Number.isNaN(from)) return null;
  const days = Math.floor((now.getTime() - from) / DAY_MS);
  return days < 0 ? null : days;
}

/** A request unanswered for REMIND_AFTER_DAYS rises to "follow up". Pass the latest reminder when there is one. */
export function isStale(requestedAt: string, now: Date): boolean {
  const days = daysBetween(requestedAt, now);
  return days !== null && days >= REMIND_AFTER_DAYS;
}

/** When the follow-up clock started: the last reminder, else the request. */
export function requestClock(entry: MetricEntry | undefined): string | null {
  if (entry?.status !== "requested" || !entry.request) return null;
  return entry.request.remindedAt ?? entry.request.requestedAt;
}

/** Days since the clock started, for "asked {n} days ago" — null when there is no running request. */
export function daysSinceRequest(entry: MetricEntry | undefined, now: Date): number | null {
  const clock = requestClock(entry);
  return clock ? daysBetween(clock, now) : null;
}

export function isRequestStale(entry: MetricEntry | undefined, now: Date): boolean {
  const clock = requestClock(entry);
  return clock !== null && isStale(clock, now);
}

/**
 * The copied request marks its numbers "requested". A number already
 * requested of the same role keeps its original date — copying the message
 * again is not a new request; `markReminded` is the follow-up. Pure: returns
 * a new snapshot, the caller persists it.
 */
export function markRequested(snapshot: Snapshot, ids: MetricId[], role: RoleId, nowIso: string): Snapshot {
  const metrics = { ...snapshot.metrics };
  for (const id of ids) {
    const existing = metrics[id];
    const sameRequest = existing?.status === "requested" && existing.request?.role === role;
    metrics[id] = {
      ...existing,
      status: "requested",
      request: sameRequest && existing.request ? existing.request : { role, requestedAt: nowIso },
      updatedAt: nowIso,
    };
  }
  return { ...snapshot, metrics };
}

/** "Follow up": restarts the clock of each running request, leaving the original date as it was. */
export function markReminded(snapshot: Snapshot, ids: MetricId[], nowIso: string): Snapshot {
  const metrics = { ...snapshot.metrics };
  for (const id of ids) {
    const existing = metrics[id];
    if (existing?.status !== "requested" || !existing.request) continue;
    metrics[id] = { ...existing, request: { ...existing.request, remindedAt: nowIso }, updatedAt: nowIso };
  }
  return { ...snapshot, metrics };
}
