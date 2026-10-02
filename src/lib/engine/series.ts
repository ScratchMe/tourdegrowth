import { CANDIDATE_IDS, METRIC_SHAPES, SLG_CANDIDATE_IDS, SLG_METRIC_SHAPES, shapeOf, type MetricShape } from "./catalog-shape";
import { defaultReferenceMonth, nextMonth, windowDaysOf } from "./cohort";
import { comparatorOf, diagnose } from "./diagnose";
import { MAX_MONTHS } from "./types";
import type {
  CandidateId,
  Comparator,
  Comparison,
  Delta,
  EngineCalcContext,
  EngineSetup,
  EngineState,
  MetricEntry,
  MetricId,
  Motion,
  MotionSeries,
  Series,
  SeriesRow,
  Snapshot,
  SnapshotWindows,
  YearMonth,
} from "./types";
import { currentSnapshot, readingValue } from "./values";

/**
 * series.ts — the monthly series (engine spec §19.2, A14 T1).
 *
 * A month is a snapshot; the last one is the month being filled, every one
 * before it is CLOSED (`closedAt`, `windows`, §19.2.3). This module never
 * reads today's date: a closed month's « today » is the day it was closed, the
 * open month's is the one the caller injects, like everywhere in the engine.
 * So a month closed in August and read again in November keeps the periods
 * and the confidence it was seen with.
 *
 * Everything here is a number or a reason. The words — « +6 pts », « estimé
 * en août » — are the deck's and the board's (deck.ts, phrases), from these.
 */

// --- A month as it was seen ----------------------------------------------------

/**
 * The calendar day an ISO instant fell on, as a local date — the form every
 * `ctx.today` takes (cohort.ts header): `closedAt` is written by the reader's
 * own clock, so its local day is the day they saw.
 */
export function calendarDay(iso: string): Date {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** The four windows of a setup — what a month keeps when it is closed. */
export function windowsOf(setup: EngineSetup): SnapshotWindows {
  return {
    activationWindowDays: setup.activationWindowDays,
    paidWindowDays: setup.paidWindowDays,
    qualificationWindowDays: setup.qualificationWindowDays,
    goLiveWindowDays: setup.goLiveWindowDays,
  };
}

/**
 * The engine as it stood at month `index` (§19.2.3): the months up to it, the
 * windows it was closed with, and the day it was closed on for « today ». The
 * open month is the state itself, read on `today`. Every derived module then
 * reads a past month with no change: they all take the LAST snapshot.
 */
export function monthView(state: EngineState, index: number, today: Date): { state: EngineState; today: Date } {
  const snapshot = state.snapshots[index];
  if (!snapshot) throw new Error(`No month at ${index}: the engine holds ${state.snapshots.length}.`);
  if (index === state.snapshots.length - 1) return { state, today };
  return {
    state: { ...state, setup: { ...state.setup, ...snapshot.windows }, snapshots: state.snapshots.slice(0, index + 1) },
    today: snapshot.closedAt ? calendarDay(snapshot.closedAt) : today,
  };
}

/**
 * A past month corrected (§19.2.4, « Corriger ce mois »): the screen edits
 * `monthView`'s state, whose last month is the one being corrected; this puts
 * it back in the series. Its months replace the engine's up to `index`, the
 * later months follow as they were — their changes recompute from it — and
 * the engine-level fields (setup, deck, « Et si », the Tour) stay the
 * engine's: a closed month's windows never become the setup's.
 */
export function withMonth(state: EngineState, index: number, edited: EngineState): EngineState {
  if (edited.snapshots.length !== index + 1) throw new Error(`A corrected month ${index} must hold ${index + 1} months, not ${edited.snapshots.length}.`);
  return { ...state, updatedAt: edited.updatedAt, snapshots: [...edited.snapshots, ...state.snapshots.slice(index + 1)] };
}

// --- Starting the next month -------------------------------------------------------

export type NextMonth =
  | { kind: "ready"; referenceMonth: YearMonth; cohortMonth: YearMonth }
  /** The flows' month is not over yet: « Démarrer septembre » waits for October. */
  | { kind: "not-yet" }
  /** `MAX_MONTHS` reached: the file is saved and a new engine started instead (§19.1.6). */
  | { kind: "full" };

/**
 * Which month comes next (§19.2.1): the last closed month, once it is after
 * the current month's flows. The followed cohort moves by as many months as
 * the flows, so the gap the team chose between them is kept.
 */
export function nextMonthOf(state: EngineState, today: Date): NextMonth {
  const last = currentSnapshot(state);
  const referenceMonth = defaultReferenceMonth(today);
  if (referenceMonth <= last.referenceMonth) return { kind: "not-yet" };
  if (state.snapshots.length >= MAX_MONTHS) return { kind: "full" };
  let cohortMonth = last.cohortMonth;
  for (let m = last.referenceMonth; m < referenceMonth; m = nextMonth(m)) cohortMonth = nextMonth(cohortMonth);
  return { kind: "ready", referenceMonth, cohortMonth };
}

/**
 * The engine with its next month started (§19.2.2, §19.2.3), or null when
 * `nextMonthOf` is not `ready`. The month that ends gets `closedAt` and the
 * windows it was read with; the new one starts with no number and the same
 * targets. Values, shared counts, requests and findings are the month's own
 * and never carried over: a definition, a source or a variant is offered
 * again by the sheet, from the month before, never copied into this one.
 */
export function startNextMonth(state: EngineState, today: Date, nowIso: string, id: () => string = () => globalThis.crypto.randomUUID()): EngineState | null {
  const next = nextMonthOf(state, today);
  if (next.kind !== "ready") return null;
  const last = currentSnapshot(state);
  const closed: Snapshot = { ...last, closedAt: nowIso, windows: windowsOf(state.setup) };
  const opened: Snapshot = {
    id: id(),
    referenceMonth: next.referenceMonth,
    cohortMonth: next.cohortMonth,
    createdAt: nowIso,
    metrics: {},
    targets: { ...last.targets },
  };
  return { ...state, updatedAt: nowIso, snapshots: [...state.snapshots.slice(0, -1), closed, opened] };
}

/**
 * What the sheet offers for a number in a new month (§19.2.2): the month
 * before's definition — its variant, its label, its definition note, its
 * sources — never its value. `null` when that month had nothing to offer.
 */
export function proposedFromBefore(
  state: EngineState,
  id: MetricId,
): Pick<MetricEntry, "variant" | "label" | "definitionNote" | "source" | "denominatorSource"> | null {
  const before = state.snapshots[state.snapshots.length - 2]?.metrics[id];
  if (!before) return null;
  const out: Pick<MetricEntry, "variant" | "label" | "definitionNote" | "source" | "denominatorSource"> = {};
  if (before.variant !== undefined) out.variant = before.variant;
  if (before.label !== undefined) out.label = before.label;
  if (before.definitionNote !== undefined) out.definitionNote = before.definitionNote;
  if (before.source !== undefined) out.source = before.source;
  if (before.denominatorSource !== undefined) out.denominatorSource = before.denominatorSource;
  return Object.keys(out).length ? out : null;
}

// --- Comparing two months -----------------------------------------------------------

/** One month of one number: its entry, and the setup it is read with (its windows). */
export interface MonthEntry {
  entry: MetricEntry | undefined;
  setup: EngineSetup;
}

function statusReason(entry: MetricEntry | undefined): "not-measured" | "estimated" | "conflicting" | null {
  if (entry?.status === "measured") return null;
  if (entry?.status === "estimated") return "estimated";
  if (entry?.status === "conflicting") return "conflicting";
  return "not-measured";
}

/**
 * Whether a number reads the same thing in both months (§19.2.5): both
 * measured, entered the same way, with the same variant, window and
 * definition note. `null` for a number that is no number — an event's name,
 * a churn cause: there is nothing to subtract.
 */
export function comparable(before: MonthEntry, now: MonthEntry, shape: MetricShape): Comparison | null {
  if (shape.unit === "text" || shape.unit === "choice") return null;
  const nowReason = statusReason(now.entry);
  if (nowReason) return { comparable: false, why: nowReason, month: "now" };
  const beforeReason = statusReason(before.entry);
  if (beforeReason) return { comparable: false, why: beforeReason, month: "before" };
  const a = before.entry!;
  const b = now.entry!;
  if (a.value?.kind !== b.value?.kind) return { comparable: false, why: "entered-differently" };
  if (a.variant !== b.variant || a.definitionNote !== b.definitionNote || windowDaysOf(shape, before.setup) !== windowDaysOf(shape, now.setup))
    return { comparable: false, why: "definition-changed" };
  const x = a.value ? readingValue(a.value, shape) : null;
  const y = b.value ? readingValue(b.value, shape) : null;
  if (x === null || y === null || !Number.isFinite(x) || !Number.isFinite(y)) return { comparable: false, why: "entered-differently" };
  return { comparable: true, before: x, now: y };
}

/** How far a number moved, in its own kind of difference (`Delta`, types.ts). */
export function delta(before: number, now: number, shape: MetricShape): Delta {
  const change = now - before;
  if (shape.unit === "percent") return { kind: "points", change };
  if (shape.unit === "money" || shape.unit === "duration") return { kind: "relative", change, percent: before === 0 ? null : (change / before) * 100 };
  return { kind: "value", change };
}

/**
 * « vers la cible » (§19.2.5): only with a team target, only when the month
 * before was behind it, and only when the number then moved the right way —
 * up for a rate where higher is better, down for churn. An activation that
 * falls from 25 % past a 20 % target got « closer » to 20 and is no progress.
 */
export function towardTarget(before: number, now: number, comparator: Comparator | undefined): boolean {
  if (!comparator) return false;
  const higher = comparator.direction === "higher";
  const behind = higher ? before < comparator.lo : before > comparator.hi;
  return behind && (higher ? now > before : now < before);
}

// --- The series of an engine --------------------------------------------------------

const SHAPES: Record<Motion, readonly MetricShape[]> = { plg: METRIC_SHAPES, slg: SLG_METRIC_SHAPES };
const CANDIDATES: ReadonlySet<string> = new Set<string>([...CANDIDATE_IDS, ...SLG_CANDIDATE_IDS]);
const isCandidate = (id: MetricId): id is CandidateId => CANDIDATES.has(id);

/** The stage(s) a diagnosis names, when it names one. */
function namedLeak(state: EngineState, ctx: EngineCalcContext, motion: Motion): CandidateId[] {
  const d = motion === "plg" ? diagnose(state, ctx) : diagnose(state, ctx, "slg");
  return d.state === "clear" || d.state === "shared" ? [...d.named] : [];
}

const sameSet = (a: readonly string[], b: readonly string[]): boolean => a.length === b.length && a.every((x) => b.includes(x));

/**
 * The last two months side by side (§19.2.5), or `null` with one month. Each
 * ticked motion compares its own numbers; the previous month is read as it
 * was seen (`monthView`), so its leak is the one the team was shown then.
 */
export function deriveSeries(state: EngineState, ctx: EngineCalcContext): Series | null {
  const n = state.snapshots.length;
  if (n < 2) return null;
  const now = currentSnapshot(state);
  const view = monthView(state, n - 2, ctx.today);
  const before = currentSnapshot(view.state);
  const beforeCtx: EngineCalcContext = { ...ctx, today: view.today };

  const motions: MotionSeries[] = [];
  for (const motion of ["plg", "slg"] as const) {
    if (!state.setup.motions[motion]) continue;
    const rows: SeriesRow[] = [];
    for (const shape of SHAPES[motion]) {
      const comparison = comparable({ entry: before.metrics[shape.id], setup: view.state.setup }, { entry: now.metrics[shape.id], setup: state.setup }, shape);
      if (!comparison) continue;
      if (!comparison.comparable) {
        rows.push({ metric: shape.id, comparison });
        continue;
      }
      // Only a candidate's target has a direction (diagnose.ts): another number's target says nothing of « toward ».
      const comparator = isCandidate(shape.id) ? comparatorOf(state, shape.id) : undefined;
      rows.push({
        metric: shape.id,
        comparison,
        delta: delta(comparison.before, comparison.now, shapeOf(shape.id)),
        towardTarget: towardTarget(comparison.before, comparison.now, comparator),
      });
    }
    const previousLeak = namedLeak(view.state, beforeCtx, motion);
    const leak = namedLeak(state, ctx, motion);
    motions.push({ motion, rows, previousLeak, leakChanged: previousLeak.length > 0 && !sameSet(previousLeak, leak) });
  }
  return { previousMonth: before.referenceMonth, month: now.referenceMonth, months: n, motions };
}
