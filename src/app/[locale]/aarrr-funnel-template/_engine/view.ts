import type { EngineStrings, ResolvedBridge, ResolvedMetric } from "@/lib/engine/strings";
import type { EngineCalcContext, EngineDerived, EngineState, MetricEntry, MetricId, RoleId } from "@/lib/engine/types";
import type { StoredResult } from "@/lib/quiz/storage";
import type { CommitResult } from "./engine-store";

/**
 * What every collection screen reads, computed once per render by the
 * island and passed down whole. One object rather than seven props: a
 * screen that needed the engine's clock and forgot it would otherwise
 * compute "today" a second time, and two "todays" in one session is how a
 * cohort ends up mature on the board and immature in the sheet.
 */
export interface EngineView {
  state: EngineState;
  derived: EngineDerived;
  strings: EngineStrings;
  metrics: ResolvedMetric[];
  bridges: ResolvedBridge[];
  ctx: EngineCalcContext;
  /** The Tour result the engine is linked to, when it is still on this device (D13: read, never copied). */
  tourResult: StoredResult | null;
}

/** Every write a screen can ask for. Each one stamps `updatedAt` and goes through the store's `commit`. */
export interface EngineActions {
  saveEntry: (id: MetricId, entry: MetricEntry) => CommitResult;
  setTarget: (id: MetricId, target: number | null) => void;
  markRequested: (ids: MetricId[], role: RoleId) => void;
  markReminded: (ids: MetricId[]) => void;
  /** Opens a number's sheet from anywhere — "also in Stripe", the collect list, the resume band. */
  openMetric: (id: MetricId) => void;
}
