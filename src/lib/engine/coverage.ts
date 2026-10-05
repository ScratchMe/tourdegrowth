import { METRIC_SHAPES, SLG_METRIC_SHAPES, shapesOf } from "./catalog-shape";
import type { MetricShape, SetupShapes } from "./catalog-shape";
import { isApp } from "./setup-type";
import type { Coverage, EngineSetup, Motion, Snapshot } from "./types";
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
 *
 * The link is never counted (§18.2.2, S10): it is optional, and counting it
 * as a hole would penalise the hybrid that has no PQL.
 */
export function coverage(snapshot: Snapshot, shapes: readonly MetricShape[] = METRIC_SHAPES): Coverage {
  const result: Coverage = { denominator: 0, found: 0, approximate: 0, missing: 0, inProgress: 0, requested: 0, todo: 0 };
  for (const shape of shapes) {
    if (shape.optional) continue;
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

/**
 * One motion's own numbers (§18.6.1, its column): 17 for self-serve, 15 for sales-assisted. With an app's `setup`,
 * self-serve counts what that app shows (`shapesOf`, §21.5.5); without it, or for a SaaS, today's list.
 */
export function motionCoverage(snapshot: Snapshot, motion: Motion, setup?: SetupShapes): Coverage {
  if (motion === "plg" && setup !== undefined && isApp(setup)) return coverage(snapshot, shapesOf(setup));
  return coverage(snapshot, motion === "plg" ? METRIC_SHAPES : SLG_METRIC_SHAPES);
}

/** The ticked motions together, the link left out — the board's chips, the common slides' footer, `visibility` (§18.9.2). */
export function setupCoverage(snapshot: Snapshot, setup: EngineSetup): Coverage {
  return coverage(snapshot, shapesOf(setup));
}
