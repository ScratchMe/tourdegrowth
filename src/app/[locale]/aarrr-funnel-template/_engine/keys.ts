import type { Effort, MetricStatus } from "@/lib/engine/types";

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
