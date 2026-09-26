import type { EngineStrings, ResolvedBridge, ResolvedDerived, ResolvedMetric } from "@/lib/engine/strings";
import type { EngineCalcContext, EngineDerived, EngineState, MetricEntry, MetricId, RoleId, SharedCount } from "@/lib/engine/types";
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
  /** The three computed figures' prose (§5.7) — the mirror names a derived figure when a bridge points at one. */
  derivedCopy: ResolvedDerived[];
  bridges: ResolvedBridge[];
  ctx: EngineCalcContext;
  /** The Tour result the engine is linked to, when it is still on this device (D13: read, never copied). */
  tourResult: StoredResult | null;
  /**
   * A Tour with answers is on this device, linked or not. Without one the board invites to take
   * the Tour (§8.5); with one the person chose not to link, the board says nothing about it.
   */
  tourOnDevice: boolean;
}

/** Every write a screen can ask for. Each one stamps `updatedAt` and goes through the store's `commit`. */
export interface EngineActions {
  saveEntry: (id: MetricId, entry: MetricEntry) => CommitResult;
  setTarget: (id: MetricId, target: number | null) => void;
  /** A count several numbers share, typed once (shared-counts.ts): the base and every entry carrying it. */
  setBase: (count: SharedCount, value: number) => void;
  markRequested: (ids: MetricId[], role: RoleId) => void;
  markReminded: (ids: MetricId[]) => void;
  /** Opens a number's sheet from anywhere — "also in Stripe", the collect list, the resume band. */
  openMetric: (id: MetricId) => void;
}
