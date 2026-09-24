import type { EngineStrings } from "@/lib/engine/strings";
import type { Effort, MetricStatus, SanityId } from "@/lib/engine/types";

/**
 * Closed-union → copy-key maps the screens need beyond the ones P0 put in
 * `lib/engine/strings.ts`. Same rule as there: a value added to a union
 * without its label fails to compile, instead of rendering `undefined`.
 */
export const SANITY_KEY: Record<SanityId, keyof EngineStrings["sanity"]> = {
  "num-gt-den": "numGtDen",
  "retained-gt-activated": "retainedGtActivated",
  "paid-gt-retained": "paidGtRetained",
  "churn-high": "churnHigh",
  "margin-odd": "marginOdd",
  "ttv-mean": "ttvMean",
  "cohort-mismatch": "cohortMismatch",
  "reconcile-gap": "reconcileGap",
};

/** How a status reads in the coverage and the stage pills — the five visual states of §8.2. */
export type PillKind = "found" | "approximate" | "missing" | "inProgress" | "notApplicable";
export function pillOf(status: MetricStatus): PillKind {
  switch (status) {
    case "measured":
      return "found";
    case "estimated":
    case "conflicting":
      return "approximate";
    case "missing":
      return "missing";
    case "not-applicable":
      return "notApplicable";
    default:
      return "inProgress";
  }
}

/** "Seul, 5 min" first (E4): the cheapest to do alone, the one to start with. */
export const EFFORT_ORDER: readonly Effort[] = ["self-5min", "self-1h", "build", "ask"];
