import type { StoredResult } from "../../quiz/storage";
import { exampleEngine, exampleMetrics } from "../example";
import { previousMonth } from "../cohort";
import type { CandidateId, EngineState, LeverId, MetricEntry, MetricId, MetricValue, Snapshot, SourceRef, ToolId } from "../types";

/**
 * The engine spec's §6.0 example — ONE data set for every unit test and
 * every e2e spec of the growth engine, so a number checked in one place is
 * the number checked everywhere.
 *
 * RELATIVE imports only, and type-only at that: Playwright specs (P4-P7)
 * import this file directly, and neither the `@/` alias nor a content module
 * may follow it there. Everything is plain data plus small builders.
 *
 * Self-serve, reference month 2026-08, followed cohort 2026-07, EUR,
 * activation within 7 days, payment within 30 — "today" is 24 September
 * 2026, a LOCAL calendar date (`new Date(2026, 8, 24)`), the same day in
 * every time zone.
 */

export const EXAMPLE_TODAY = new Date(2026, 8, 24);
export const EXAMPLE_NOW_ISO = "2026-09-24T09:00:00.000Z";

const tool = (t: ToolId): SourceRef => ({ kind: "tool", tool: t });
const at = "2026-09-20T10:00:00.000Z";

export function ratio(numerator: number, denominator: number): MetricValue {
  return { kind: "ratio", numerator, denominator };
}

export function measured(value: MetricValue, source: SourceRef = tool("ga4"), extra: Partial<MetricEntry> = {}): MetricEntry {
  return { status: "measured", value, source, updatedAt: at, ...extra };
}

export function estimated(low: number, high: number, extra: Partial<MetricEntry> = {}): MetricEntry {
  return { status: "estimated", estimate: { low, high, basis: "old-number" }, updatedAt: at, ...extra };
}

export function missing(cause: NonNullable<MetricEntry["missing"]>["cause"], repair: NonNullable<MetricEntry["missing"]>["repair"], extra: Partial<MetricEntry> = {}): MetricEntry {
  return { status: "missing", missing: { cause, repair }, updatedAt: at, ...extra };
}

/** §6.0, entry by entry — the page's example (`lib/engine/example.ts`), in French. */
const EXAMPLE_WORDS = { event: "a créé un premier projet", channel: "Recherche naturelle" };
/** §18.9's words, for the hybrid: what « live » means, the reason for non-renewal, the PQL threshold. */
const HYBRID_WORDS = {
  ...EXAMPLE_WORDS,
  liveEvent: "premier rapport partagé avec l'équipe du client",
  lossCause: "départ du sponsor chez le client",
  pqlThreshold: "espace avec 3 membres actifs",
};
export const EXAMPLE_METRICS: Partial<Record<MetricId, MetricEntry>> = exampleMetrics(EXAMPLE_WORDS);

/** A fresh, deep-copied §6.0 state: tests mutate it freely. */
export function exampleState(): EngineState {
  return exampleEngine(EXAMPLE_WORDS);
}

/**
 * The §18.9 hybrid: self-serve is exactly §6.0, sales-assisted and the link
 * are new — flows June to August, leads May to July, new customers March to
 * May, its own targets (18 %, 32 %, 92 %) and its three counts (130, 18, 100).
 */
export function hybridState(): EngineState {
  return exampleEngine(HYBRID_WORDS, { plg: true, slg: true });
}

/** The §18.9 sales-assisted half on its own: no self-serve number, no link, no total. */
export function salesAssistedState(): EngineState {
  return exampleEngine(HYBRID_WORDS, { plg: false, slg: true });
}

/**
 * The SaaS of the film « Le moteur » (`marketing/motion/README.md`, engine
 * spec §20.10): the §6.0 example with a gross margin of 75 %, churn 6 %,
 * contraction 1 % and expansion 2 % a month, 6 % who pay, and a CAC of
 * 1 900 € typed as an amount — so the new payers are the 820 sign-ups × 6 %.
 * Its customer costs more than they bring in (LTV 1 500 €): the money of A20
 * in every state. Shared by `money.test.ts` and the brief 09 captures.
 */
export function filmState(): EngineState {
  let state = exampleState();
  const set = (id: MetricId, value: MetricValue) => {
    state = withEntry(state, id, measured(value));
  };
  set("rev.gross-margin", ratio(36_000, 48_000));
  set("ret.logo-churn", ratio(24, 400));
  set("rev.contraction", ratio(468, 46_800));
  set("rev.expansion", ratio(936, 46_800));
  set("rev.paid-conversion", ratio(48, 800));
  set("acq.cac", { kind: "amount", amount: 1_900 });
  return state;
}

/**
 * The §18.9 hybrid with the film's self-serve half (A20.d T4.d) — its margin,
 * churn, conversion and CAC, so each new self-serve customer is a loss — and a
 * sales-assisted margin of 75 %, so its customers pay back: the return of
 * brief 09's « slide-unit-both ».
 */
export function hybridLossState(): EngineState {
  let state = hybridState();
  const set = (id: MetricId, value: MetricValue) => {
    state = withEntry(state, id, measured(value));
  };
  set("rev.gross-margin", ratio(36_000, 48_000));
  set("ret.logo-churn", ratio(24, 400));
  set("rev.contraction", ratio(468, 46_800));
  set("rev.expansion", ratio(936, 46_800));
  set("rev.paid-conversion", ratio(48, 800));
  set("acq.cac", { kind: "amount", amount: 1_900 });
  set("slg.rev.gross-margin", ratio(75, 100));
  return state;
}

/** The film's three levers: churn 6 → 4 %, expansion 2 → 3 %, activation 18 → 24 %. */
export const FILM_LEVERS: Partial<Record<LeverId, number>> = { "ret.logo-churn": 4, "rev.expansion": 3, "act.rate": 24 };

/** The state with one entry replaced (or removed with `undefined`). */
export function withEntry(state: EngineState, id: MetricId, entry: MetricEntry | undefined): EngineState {
  const next = structuredClone(state);
  const snapshot = next.snapshots[next.snapshots.length - 1]!;
  if (entry) snapshot.metrics[id] = entry;
  else delete snapshot.metrics[id];
  return next;
}

export function withTarget(state: EngineState, id: CandidateId | MetricId, target: number): EngineState {
  const next = structuredClone(state);
  next.snapshots[next.snapshots.length - 1]!.targets[id] = target;
  return next;
}

/** The state with no team target at all: what a reader who skipped « Tes cibles » has. */
export function withoutTargets(state: EngineState): EngineState {
  const next = structuredClone(state);
  next.snapshots[next.snapshots.length - 1]!.targets = {};
  return next;
}

/**
 * The engine with one more month BEFORE the one it holds (A14 T1, §19.2):
 * the current month's numbers copied a month earlier, that month closed on
 * the 3rd of the next with the setup's windows. The current month — the
 * example's August by default — stays exactly what it was, so every reading
 * of it is the one the other tests check. `change` rewrites the earlier
 * month: what moved since.
 */
export function withMonthBefore(state: EngineState, change: (before: Snapshot) => void = () => {}): EngineState {
  const next = structuredClone(state);
  const now = next.snapshots[next.snapshots.length - 1]!;
  const { activationWindowDays, paidWindowDays, qualificationWindowDays, goLiveWindowDays } = next.setup;
  const before: Snapshot = {
    ...structuredClone(now),
    id: `${now.id}-before`,
    referenceMonth: previousMonth(now.referenceMonth),
    cohortMonth: previousMonth(now.cohortMonth),
    closedAt: `${now.referenceMonth}-03T09:00:00.000Z`,
    windows: { activationWindowDays, paidWindowDays, qualificationWindowDays, goLiveWindowDays },
  };
  for (const entry of Object.values(before.metrics)) if (entry?.cohortMonth) entry.cohortMonth = previousMonth(entry.cohortMonth);
  change(before);
  next.snapshots = [...next.snapshots.slice(0, -1), before, now];
  return next;
}

/** An empty state (every number "todo", no target yet), same setup and months as the example. */
export function emptyState(): EngineState {
  const state = exampleState();
  state.snapshots[0]!.metrics = {};
  state.snapshots[0]!.targets = {};
  return state;
}

/**
 * A Tour result on the device (`tdg.results.v1`). Answer index → points:
 * 0 → 20, 1 → 7, 2 → 0 on every question (copy-library's option order).
 */
export function tourResult(answers: Record<string, 0 | 1 | 2>, extra: Partial<StoredResult> = {}): StoredResult {
  return { id: "11111111-1111-4111-8111-111111111111", ownerToken: "t", createdAt: "2026-09-01T10:00:00.000Z", total: 58, answers, ...extra };
}

/**
 * The §6.0 numbers as the reader sees them — for e2e specs that assert
 * what is on screen. U+00A0 is written out: that IS the glyph the page
 * prints in French (U+202F is normalised away, §6.2).
 */
export const EXAMPLE_EXPECTED = {
  coverage: { found: 9, approximate: 2, requested: 1, missing: 3, denominator: 15 },
  activatedPerHundred: "18",
  paidPerHundred: { fr: "6 à 9", en: "6–9" },
  visitorsPerHundred: { fr: "~3 200", en: "~3,200" },
  referredPerHundred: "6",
  leakAmount: { fr: "~600 €", en: "~€600" },
  leakChain: "42 × 20/18 = 47 (+5)",
  annualAmount: { fr: "~6 300 €", en: "~€6,300" },
  churnAmount: { fr: "~240 €", en: "~€240" },
  diagnosis: { state: "clear", named: ["act.rate"], blind: ["ret.d30"] },
} as const;
