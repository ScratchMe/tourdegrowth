import { METRIC_SHAPES } from "./catalog-shape";
import type { Coverage, Snapshot } from "./types";
import { statusOf } from "./values";

/**
 * coverage.ts — how much of the engine is documented (engine spec §6.4).
 *
 * Every status lands in exactly one bucket, and only "not applicable"
 * leaves the denominator. The invariant
 * `found + approximate + missing + inProgress === denominator` is tested
 * over every combination of statuses: the audit instrument once lost half a
 * point between its counters and its denominator, and nobody saw it until a
 * test summed them. Always shown as a fraction, never as a percentage of
 * completion — "9 of 15" says what is behind it, "60 %" doesn't.
 */
export function coverage(snapshot: Snapshot): Coverage {
  const result: Coverage = { denominator: 0, found: 0, approximate: 0, missing: 0, inProgress: 0, requested: 0, todo: 0 };
  for (const shape of METRIC_SHAPES) {
    const status = statusOf(snapshot.metrics[shape.id]);
    if (status === "not-applicable") continue;
    result.denominator += 1;
    switch (status) {
      case "measured":
        result.found += 1;
        break;
      case "estimated":
      case "conflicting":
        result.approximate += 1;
        break;
      case "missing":
        result.missing += 1;
        break;
      case "requested":
        result.inProgress += 1;
        result.requested += 1;
        break;
      case "todo":
        result.inProgress += 1;
        result.todo += 1;
        break;
    }
  }
  return result;
}
