import { isApp } from "@/lib/engine/setup-type";
import type { EngineStrings, ResolvedBridge, ResolvedDerived, ResolvedMetric } from "@/lib/engine/strings";
import type { BusinessType, EngineCalcContext, EngineDerived, EngineState, LeverId, MetricEntry, MetricId, RoleId } from "@/lib/engine/types";
import type { StoredResult } from "@/lib/quiz/storage";
import type { EngineWorkbenchProps } from "../EngineWorkbench";
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
  /** That Tour — the latest with answers on this device — so the board can offer to link it (C8, §8.5). */
  deviceTour: StoredResult | null;
}

/** Every write a screen can ask for. Each one stamps `updatedAt` and goes through the store's `commit`. */
export interface EngineActions {
  saveEntry: (id: MetricId, entry: MetricEntry) => CommitResult;
  setTarget: (id: MetricId, target: number | null) => void;
  /** Sales-assisted: the quarter's open pipeline, in ACV, for the month on screen (§19.4); `null` takes it off. */
  setPipelineOpen: (open: number | null) => void;
  /**
   * « Et si ? » (2026-09-26): the targets under test, the WHOLE map in one
   * write (a slider, a reset, « all back to today »). Kept in the state so the
   * deck prints one slide per lever and the file carries them.
   */
  setWhatIf: (targets: Partial<Record<LeverId, number>>) => void;
  markRequested: (ids: MetricId[], role: RoleId) => void;
  markReminded: (ids: MetricId[]) => void;
  /** Opens a number's sheet from anywhere — "also in Stripe", the collect list, the resume band. */
  openMetric: (id: MetricId) => void;
  /** Links the engine to a Tour result on this device, or unlinks it (`null`) — the Tour itself is never touched (C8, D13). */
  linkTour: (resultId: string | null) => void;
}

/**
 * The catalogue a type's screens read (§21.4.7): the SaaS's `metrics`, or a consumer app's own (the fifteen in its words,
 * then its six). The one place that chooses, so no screen asks which type it is showing (D4).
 */
export function metricsFor(p: Pick<EngineWorkbenchProps, "metrics" | "typeCatalogs">, type: BusinessType): ResolvedMetric[] {
  return isApp({ type }) ? p.typeCatalogs["consumer-app"].metrics : p.metrics;
}

/** Same, for the computed figures (what `EngineWorkbench` passes as `derivedCopy`). */
export function derivedFor(p: Pick<EngineWorkbenchProps, "derived" | "typeCatalogs">, type: BusinessType): ResolvedDerived[] {
  return isApp({ type }) ? p.typeCatalogs["consumer-app"].derived : p.derived;
}
