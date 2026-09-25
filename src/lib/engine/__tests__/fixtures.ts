import type { StoredResult } from "../../quiz/storage";
import type { CandidateId, EngineState, MetricEntry, MetricId, MetricValue, SourceRef, ToolId } from "../types";

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

/** §6.0, entry by entry. */
export const EXAMPLE_METRICS: Partial<Record<MetricId, MetricEntry>> = {
  "acq.signup-rate": measured(ratio(820, 26_000), tool("ga4")),
  "acq.top-channel-share": measured(ratio(410, 820), tool("ga4"), { label: "Recherche naturelle" }),
  "acq.cac": measured(ratio(21_000, 42), { kind: "person", role: "finance" }, { variant: "media-only" }),
  "act.event": measured({ kind: "text", text: "a créé un premier projet" }, { kind: "other" }),
  "act.rate": measured(ratio(144, 800), tool("amplitude")),
  "act.ttv": { status: "estimated", estimate: { low: 1, high: 3, basis: "team-hunch" }, variant: "median", updatedAt: at },
  "ret.d30": missing("not-tracked", "sprint", { missing: { cause: "not-tracked", repair: "sprint", ownerRole: "data" } }),
  "ret.logo-churn": measured(ratio(10, 400), tool("stripe")),
  "ret.churn-cause": missing("no-definition", "meeting"),
  "ref.mechanism": measured({ kind: "choice", choice: "product" }, { kind: "other" }),
  "ref.referred-share": measured(ratio(48, 800), tool("product-db")),
  "ref.k-factor": { status: "requested", request: { role: "data", requestedAt: "2026-09-20T09:00:00.000Z" }, updatedAt: at },
  "rev.paid-conversion": estimated(6, 9),
  "rev.arpa": measured(ratio(48_000, 400), tool("stripe")),
  "rev.gross-margin": missing("no-access", "meeting", { missing: { cause: "no-access", repair: "meeting", ownerRole: "finance" } }),
};

/** A fresh, deep-copied §6.0 state: tests mutate it freely. */
export function exampleState(): EngineState {
  return structuredClone({
    schemaVersion: 1,
    id: "00000000-0000-4000-8000-000000000060",
    createdAt: "2026-09-24T08:00:00.000Z",
    updatedAt: "2026-09-24T09:00:00.000Z",
    setup: { profile: "selfserve", currency: "EUR", activationWindowDays: 7, paidWindowDays: 30 },
    snapshots: [
      {
        id: "00000000-0000-4000-8000-000000000061",
        referenceMonth: "2026-08",
        cohortMonth: "2026-07",
        createdAt: "2026-09-24T08:00:00.000Z",
        metrics: EXAMPLE_METRICS,
        targets: {},
      },
    ],
    tourLink: null,
    deck: {
      include: {},
      showCompany: false,
      showSiteCredit: true,
      ask: { what: "", bullets: [], measureFirst: [] },
    },
  } satisfies EngineState);
}

/** The state with one entry replaced (or removed with `undefined`). */
export function withEntry(state: EngineState, id: MetricId, entry: MetricEntry | undefined): EngineState {
  const next = structuredClone(state);
  const snapshot = next.snapshots[next.snapshots.length - 1]!;
  if (entry) snapshot.metrics[id] = entry;
  else delete snapshot.metrics[id];
  return next;
}

export function withTarget(state: EngineState, id: CandidateId, target: number): EngineState {
  const next = structuredClone(state);
  next.snapshots[next.snapshots.length - 1]!.targets[id] = target;
  return next;
}

/** An empty state (every number "todo"), same setup and months as the example. */
export function emptyState(): EngineState {
  const state = exampleState();
  state.snapshots[0]!.metrics = {};
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
