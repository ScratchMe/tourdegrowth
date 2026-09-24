import {
  CANDIDATE_IDS,
  METRIC_SHAPES,
  PELOTON_METRICS,
  REMIND_AFTER_DAYS,
  SMALL_COHORT_SIZE,
  TEXT_LIMITS,
  shapeOf,
  type MetricShape,
} from "@/lib/engine/catalog-shape";
import type { EngineStrings, ResolvedBridge, ResolvedMetric } from "@/lib/engine/strings";
import {
  ENGINE_SCHEMA_VERSION,
  ENGINE_STORAGE_KEY,
  YEAR_MONTH_PATTERN,
  type CandidateId,
  type Comparator,
  type Confidence,
  type Coverage,
  type DeckModel,
  type Diagnosis,
  type EngineCalcContext,
  type EngineDerived,
  type EngineSetup,
  type EngineState,
  type Interval,
  type Known,
  type MetricEntry,
  type MetricId,
  type Peloton,
  type PelotonColumn,
  type Position,
  type RoleId,
  type SanityCheck,
  type Snapshot,
  type SlideTitle,
  type YearMonth,
} from "@/lib/engine/types";
import type { StoredResult } from "@/lib/quiz/storage";

/**
 * P7 — REPLACE THIS FILE'S BODY WITH RE-EXPORTS FROM `@/lib/engine/*`.
 *
 * The collection screens (P4) were built in parallel with the pure engine
 * (P1) and its storage (P2), against the signatures P0 froze in
 * `engine-contracts.md`. Every function the screens call from those two
 * chunks goes through THIS barrel and nowhere else, so wiring the real
 * modules is one file: each section below names the module it stands in for,
 * and each export keeps the contract's exact signature.
 *
 * What is here is a STAND-IN, deliberately thin: enough behaviour for the
 * screens to be exercised in a real browser (persistence, coverage, the live
 * rate, the copied request), none of the engine's judgement. In particular
 * `diagnose` does not price anything in money and `buildDeck` produces only
 * the peloton title — the real ones are P1's, and the e2e specs of P4 assert
 * only what the collection screens own (fractions, persistence, the request
 * message), never a diagnosis.
 */

// ---------------------------------------------------------------------------
// format.ts (P1)
// ---------------------------------------------------------------------------

/** Intl's French output uses U+202F (narrow no-break space), which Stardos Stencil and Plex Mono lack (§6.2). */
const toNbsp = (s: string) => s.replace(/\u202F/g, "\u00A0");

export function formatNumber(v: number, locale: "en" | "fr"): string {
  return toNbsp(new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", { maximumFractionDigits: 2 }).format(v));
}

/** Two significant digits; an integer from 10 %; two decimals under 1 % (§6.2). */
function percentDigits(v: number): number {
  const abs = Math.abs(v);
  if (abs >= 10) return Math.round(v);
  if (abs >= 1) return Number(v.toPrecision(2));
  return Math.round(v * 100) / 100;
}

export function formatPercent(v: number, locale: "en" | "fr"): string {
  const n = formatNumber(percentDigits(v), locale);
  return locale === "fr" ? `${n}\u00A0%` : `${n}%`;
}

export function formatMoney(v: number, currency: EngineSetup["currency"], locale: "en" | "fr"): string {
  return toNbsp(
    new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: Number.isInteger(v) ? 0 : 2,
    }).format(v),
  );
}

export function formatInterval(
  i: Interval,
  unit: MetricShape["unit"],
  ctx: EngineCalcContext,
  words: EngineStrings["units"],
): string {
  const one = (v: number) =>
    unit === "percent" ? formatNumber(percentDigits(v), ctx.locale) : formatNumber(Number(v.toPrecision(3)), ctx.locale);
  const body = one(i.lo) === one(i.hi) ? one(i.lo) : words.range.replace("{lo}", one(i.lo)).replace("{hi}", one(i.hi));
  if (unit !== "percent") return body;
  return ctx.locale === "fr" ? `${body}\u00A0%` : `${body}%`;
}

// ---------------------------------------------------------------------------
// cohort.ts (P1)
// ---------------------------------------------------------------------------

export function isYearMonth(s: string): s is YearMonth {
  return YEAR_MONTH_PATTERN.test(s);
}

function ymParts(m: YearMonth): [number, number] {
  const [y, mo] = m.split("-").map(Number);
  return [y!, mo!];
}

function ym(year: number, month: number): YearMonth {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function previousMonth(m: YearMonth): YearMonth {
  const [y, mo] = ymParts(m);
  return mo === 1 ? ym(y - 1, 12) : ym(y, mo - 1);
}

export function nextMonth(m: YearMonth): YearMonth {
  const [y, mo] = ymParts(m);
  return mo === 12 ? ym(y + 1, 1) : ym(y, mo + 1);
}

/** The last month M such that the last day of M + windowDays ≤ today (§6.3). */
export function matureCohortMonth(windowDays: number, today: Date): YearMonth {
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  let m = previousMonth(ym(today.getFullYear(), today.getMonth() + 1));
  for (;;) {
    const [y, mo] = ymParts(m);
    const lastDay = Date.UTC(y, mo, 0); // day 0 of next month = last day of this one
    if (lastDay + windowDays * 86_400_000 <= todayUtc) return m;
    m = previousMonth(m);
  }
}

export function isImmature(period: YearMonth, windowDays: number, today: Date): boolean {
  return period > matureCohortMonth(windowDays, today);
}

// ---------------------------------------------------------------------------
// values.ts (P1)
// ---------------------------------------------------------------------------

export function entryOf(snapshot: Snapshot, id: MetricId): MetricEntry | undefined {
  return snapshot.metrics[id];
}

function readingInterval(value: MetricEntry["value"], shape: MetricShape): number | null {
  if (!value) return null;
  switch (value.kind) {
    case "ratio":
      if (value.denominator === 0) return null;
      return shape.unit === "percent" ? (value.numerator / value.denominator) * 100 : value.numerator / value.denominator;
    case "rate":
      return value.percent;
    case "amount":
      return value.amount;
    case "duration":
      return value.unit === "hours" ? value.value / 24 : value.value;
    default:
      return null;
  }
}

export function valueInterval(entry: MetricEntry, shape: MetricShape): Interval | null {
  if (entry.status === "measured") {
    const v = readingInterval(entry.value, shape);
    return v === null ? null : { lo: v, hi: v };
  }
  if (entry.status === "estimated" && entry.estimate) return { lo: entry.estimate.low, hi: entry.estimate.high };
  if (entry.status === "conflicting" && entry.conflict) {
    const a = readingInterval(entry.conflict.a.value, shape);
    const b = readingInterval(entry.conflict.b.value, shape);
    if (a === null || b === null) return null;
    return { lo: Math.min(a, b), hi: Math.max(a, b) };
  }
  return null;
}

export function confidenceOf(entry: MetricEntry): Confidence {
  if (entry.status === "measured") {
    const shortcut = entry.value?.kind === "rate" || entry.value?.kind === "amount";
    return shortcut || entry.source?.kind !== "tool" ? "approximate" : "solid";
  }
  if (entry.status === "estimated" || entry.status === "conflicting") return "approximate";
  return "unknown";
}

export function knownOf(entry: MetricEntry | undefined, shape: MetricShape, _ctx: EngineCalcContext): Known {
  if (!entry || entry.status === "todo") return { kind: "unknown", why: "todo" };
  if (entry.status === "requested") return { kind: "unknown", why: "requested" };
  if (entry.status === "not-applicable") return { kind: "unknown", why: "not-applicable" };
  if (entry.status === "missing") return { kind: "unknown", why: entry.missing?.cause ?? "not-tracked" };
  const value = valueInterval(entry, shape);
  const confidence = confidenceOf(entry);
  if (!value || confidence === "unknown") return { kind: "unknown", why: "todo" };
  return { kind: "known", value, confidence };
}

// ---------------------------------------------------------------------------
// coverage.ts (P1)
// ---------------------------------------------------------------------------

export function coverage(snapshot: Snapshot): Coverage {
  const c: Coverage = { denominator: 0, found: 0, approximate: 0, missing: 0, inProgress: 0, requested: 0, todo: 0 };
  for (const shape of METRIC_SHAPES) {
    const status = snapshot.metrics[shape.id]?.status ?? "todo";
    if (status === "not-applicable") continue;
    c.denominator += 1;
    if (status === "measured") c.found += 1;
    else if (status === "estimated" || status === "conflicting") c.approximate += 1;
    else if (status === "missing") c.missing += 1;
    else {
      c.inProgress += 1;
      if (status === "requested") c.requested += 1;
      else c.todo += 1;
    }
  }
  return c;
}

// ---------------------------------------------------------------------------
// peloton.ts, diagnose.ts, derive.ts, deck.ts (P1) — thin stand-ins
// ---------------------------------------------------------------------------

function snapshotOf(state: EngineState): Snapshot {
  const snap = state.snapshots[state.snapshots.length - 1];
  if (!snap) throw new Error("An engine state always has a snapshot");
  return snap;
}

export function buildPeloton(state: EngineState, ctx: EngineCalcContext): Peloton {
  const snap = snapshotOf(state);
  const columns: PelotonColumn[] = PELOTON_METRICS.map((id) => {
    const entry = snap.metrics[id];
    const known = knownOf(entry, shapeOf(id), ctx);
    return {
      metric: id,
      perHundred: known.kind === "known" ? { lo: Math.round(known.value.lo), hi: Math.round(known.value.hi) } : null,
      confidence: known.kind === "known" ? known.confidence : "unknown",
      source: entry?.source ?? null,
      period: snap.cohortMonth,
    };
  });
  const knownFlags = columns.map((c) => c.perHundred !== null);
  const lastKnown = knownFlags.lastIndexOf(true);
  const chain = knownFlags.every(Boolean)
    ? "complete"
    : lastKnown === -1
      ? "empty"
      : knownFlags.slice(0, lastKnown).some((k) => !k)
        ? "gap"
        : "tail-break";
  const signup = knownOf(snap.metrics["acq.signup-rate"], shapeOf("acq.signup-rate"), ctx);
  const referred = knownOf(snap.metrics["ref.referred-share"], shapeOf("ref.referred-share"), ctx);
  const act = snap.metrics["act.rate"]?.value;
  return {
    visitorsPerHundred:
      signup.kind === "known" && signup.value.lo > 0 ? { lo: 10_000 / signup.value.hi, hi: 10_000 / signup.value.lo } : null,
    referredPerHundred: referred.kind === "known" ? referred.value : null,
    upstreamSource: snap.metrics["acq.signup-rate"]?.source ?? null,
    upstreamPeriod: snap.referenceMonth,
    columns,
    chain,
    smallCohort: act?.kind === "ratio" && act.denominator < SMALL_COHORT_SIZE,
  };
}

export function comparatorOf(state: EngineState, id: CandidateId): Comparator | undefined {
  const shape = shapeOf(id);
  const direction = shape.benchmark?.direction ?? (id === "ret.logo-churn" ? "lower" : "higher");
  const target = snapshotOf(state).targets[id];
  if (target !== undefined) return { kind: "target", lo: target, hi: target, direction };
  if (shape.benchmark?.designates) {
    const b = shape.benchmark;
    return { kind: "reference", lo: b.lo, hi: b.hi, direction: b.direction, term: b.term };
  }
  return undefined;
}

function positionOf(value: Interval, c: Comparator): Position {
  if (c.direction === "higher") {
    if (value.hi < c.lo) return "below";
    if (value.lo < c.lo) return "maybe-below";
    if (value.lo <= c.hi) return "within";
    return "above";
  }
  if (value.lo > c.hi) return "below";
  if (value.hi > c.hi) return "maybe-below";
  if (value.hi >= c.lo) return "within";
  return "above";
}

export function diagnose(state: EngineState, ctx: EngineCalcContext): Diagnosis {
  const snap = snapshotOf(state);
  const positions = {} as Diagnosis["positions"];
  const comparable: CandidateId[] = [];
  const below: CandidateId[] = [];
  for (const id of CANDIDATE_IDS) {
    const known = knownOf(snap.metrics[id], shapeOf(id), ctx);
    const comparator = comparatorOf(state, id);
    if (known.kind !== "known") positions[id] = { position: "unknown", comparator };
    else if (!comparator) positions[id] = { position: "no-comparator" };
    else {
      const position = positionOf(known.value, comparator);
      positions[id] = { position, comparator };
      comparable.push(id);
      if (position === "below") below.push(id);
    }
  }
  const blind = CANDIDATE_IDS.filter((id) => positions[id]?.position === "unknown");
  const state_ = comparable.length < 2 ? "not-enough" : below.length === 0 ? "level" : below.length === 1 ? "clear" : "shared";
  return {
    state: state_,
    named: state_ === "clear" || state_ === "shared" ? below : [],
    basis: "none",
    belowUnpriced: [],
    blind,
    positions,
  };
}

/** Only the peloton slide's title — the one the board's verdict line reads (§7 E2). The rest is P1's. */
export function buildDeck(
  state: EngineState,
  derived: EngineDerived,
  strings: EngineStrings,
  _metrics: ResolvedMetric[],
  ctx: EngineCalcContext,
): DeckModel {
  void state;
  const p = derived.peloton;
  const fmt = (i: Interval) => formatInterval(i, "ratio", ctx, strings.units);
  const clauseKey = { "act.rate": "clauseActivated", "ret.d30": "clauseD30", "rev.paid-conversion": "clausePaid" } as const;
  const clauseVar = { "act.rate": "{a}", "ret.d30": "{r}", "rev.paid-conversion": "{p}" } as const;
  const stageKey = { "act.rate": "activated", "ret.d30": "d30", "rev.paid-conversion": "paid" } as const;
  const known = p.columns.filter((c) => c.perHundred);
  const unknown = p.columns.filter((c) => !c.perHundred);
  const clauses = known.map((c) => strings.peloton[clauseKey[c.metric]].replace(clauseVar[c.metric], fmt(c.perHundred!)));
  const joinList = (items: string[]) =>
    items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(strings.grammar.listSeparator)}${strings.grammar.and}${items.at(-1)}`;
  let title: SlideTitle;
  if (p.chain === "complete") {
    const [a, r, pp] = p.columns.map((c) => fmt(c.perHundred!));
    title = { key: "pelotonComplete", values: { a: a!, r: r!, p: pp! } };
  } else if (p.chain === "empty") {
    title = { key: "pelotonEmpty", values: {} };
  } else {
    const one = unknown.length === 1;
    const base = p.chain === "gap" ? "pelotonGap" : "pelotonTailBreak";
    title = {
      key: one ? (`${base}One` as const) : base,
      values: { clauses: joinList(clauses), stages: joinList(unknown.map((c) => strings.peloton.unmeasured[stageKey[c.metric]])) },
    };
  }
  const cov = derived.coverage;
  return {
    slides: [{ id: "peloton", present: true, included: true, index: 1, title, lines: [], notes: [] }],
    checks: derived.sanity.filter((s) => !s.blocking),
    dataPill: { measured: cov.found, approximate: cov.approximate, missing: cov.missing },
    kicker: {},
    footer: {},
  };
}

export function deriveEngine(
  state: EngineState,
  ctx: EngineCalcContext,
  _tourResult: StoredResult | null,
  _bridges: ResolvedBridge[],
): EngineDerived {
  return {
    coverage: coverage(snapshotOf(state)),
    peloton: buildPeloton(state, ctx),
    diagnosis: diagnose(state, ctx),
    unit: {
      cacVariant: null,
      ltv: { kind: "uncomputable", missing: [] },
      payback: { kind: "uncomputable", missing: [] },
      ltvCac: { kind: "uncomputable", missing: [] },
    },
    sanity: [],
    findings: [],
    mirror: null,
  };
}

// ---------------------------------------------------------------------------
// sanity.ts (P1) — only the one check that blocks a save
// ---------------------------------------------------------------------------

export function blockingCheck(entry: MetricEntry, shape: MetricShape): SanityCheck | null {
  const values = [entry.value, entry.conflict?.a.value, entry.conflict?.b.value];
  for (const v of values) {
    if (shape.bounded && v?.kind === "ratio" && v.numerator > v.denominator) {
      return { id: "num-gt-den", blocking: true, metrics: [shape.id], values: {} };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// bridge.ts (P1)
// ---------------------------------------------------------------------------

export function latestTourWithAnswers(results: StoredResult[]): StoredResult | null {
  return [...results].filter((r) => r.answers).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0] ?? null;
}

// ---------------------------------------------------------------------------
// request.ts (P1)
// ---------------------------------------------------------------------------

export function buildRequest(
  role: RoleId,
  metricIds: MetricId[],
  strings: EngineStrings,
  metrics: ResolvedMetric[],
  state: EngineState,
  ctx: EngineCalcContext,
): string {
  void role;
  void ctx;
  const snap = snapshotOf(state);
  const list = metricIds
    .map((id) => {
      const m = metrics.find((x) => x.id === id);
      if (!m) return "";
      const definition = snap.metrics[id]?.definitionNote;
      const what = m.request.replaceAll("{month}", snap.referenceMonth).replaceAll("{cohort}", snap.cohortMonth);
      return definition
        ? strings.request.item.replace("{what}", what).replace("{definition}", definition)
        : strings.request.itemNoDefinition.replace("{what}", what);
    })
    .join("\n");
  return strings.request.message.replace("{list}", list);
}

export function isStale(requestedAt: string, now: Date): boolean {
  const t = Date.parse(requestedAt);
  if (!Number.isFinite(t) || t > now.getTime()) return false;
  return now.getTime() - t >= REMIND_AFTER_DAYS * 86_400_000;
}

export function markRequested(snapshot: Snapshot, ids: MetricId[], role: RoleId, nowIso: string): Snapshot {
  const metrics = { ...snapshot.metrics };
  for (const id of ids) {
    const previous = metrics[id];
    metrics[id] = { ...(previous ?? {}), status: "requested", request: { role, requestedAt: nowIso }, updatedAt: nowIso };
  }
  return { ...snapshot, metrics };
}

// ---------------------------------------------------------------------------
// storage.ts (P2)
// ---------------------------------------------------------------------------

export type LoadResult = { kind: "empty" } | { kind: "ok"; state: EngineState } | { kind: "unreadable" };

export function loadEngine(): LoadResult {
  if (typeof window === "undefined") return { kind: "empty" };
  try {
    const raw = window.localStorage.getItem(ENGINE_STORAGE_KEY);
    if (raw === null) return { kind: "empty" };
    const parsed = JSON.parse(raw) as { schemaVersion?: unknown; state?: EngineState };
    if (parsed.schemaVersion !== ENGINE_SCHEMA_VERSION || !parsed.state) return { kind: "unreadable" };
    return { kind: "ok", state: parsed.state };
  } catch {
    return { kind: "unreadable" };
  }
}

export function saveEngine(state: EngineState): { ok: true } | { ok: false; error: "quota" | "unavailable" } {
  try {
    window.localStorage.setItem(ENGINE_STORAGE_KEY, JSON.stringify({ schemaVersion: ENGINE_SCHEMA_VERSION, state }));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof DOMException && err.name === "QuotaExceededError" ? "quota" : "unavailable" };
  }
}

export function clearEngine(): void {
  try {
    window.localStorage.removeItem(ENGINE_STORAGE_KEY);
  } catch {
    // Nothing to clear is the same outcome as clearing.
  }
}

export async function requestPersistence(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// io.ts (P2)
// ---------------------------------------------------------------------------

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value as object)
        .sort()
        .map((k) => [k, sortKeys((value as Record<string, unknown>)[k])]),
    );
  }
  return value;
}

export function serializeEngine(state: EngineState): string {
  return `${JSON.stringify(sortKeys({ schemaVersion: ENGINE_SCHEMA_VERSION, state }), null, 2)}\n`;
}

export function parseEngineFile(text: string): {
  state: EngineState | null;
  errors: string[];
  refusal?: "unknown-version" | "not-engine" | "unreadable";
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { state: null, errors: [], refusal: "unreadable" };
  }
  const store = parsed as { schemaVersion?: unknown; state?: EngineState };
  if (!store || typeof store !== "object" || !("state" in store) || typeof store.state !== "object") {
    return { state: null, errors: [], refusal: "not-engine" };
  }
  if (store.schemaVersion !== ENGINE_SCHEMA_VERSION) return { state: null, errors: [], refusal: "unknown-version" };
  return { state: store.state, errors: validateEngine(store.state) };
}

export function engineFileName(state: EngineState, words: EngineStrings["io"]): string {
  return words.fileName.replace("{month}", snapshotOf(state).referenceMonth);
}

// ---------------------------------------------------------------------------
// validate.ts (P2)
// ---------------------------------------------------------------------------

export function validateEntry(entry: MetricEntry, shape: MetricShape): string[] {
  const errors: string[] = [];
  if (entry.status === "measured" && !entry.value) errors.push(`${shape.id}: measured without a value`);
  if (entry.status === "estimated" && !entry.estimate) errors.push(`${shape.id}: estimated without a range`);
  if (entry.status === "missing" && !entry.missing) errors.push(`${shape.id}: missing without a cause`);
  if (entry.definitionNote && entry.definitionNote.length > TEXT_LIMITS.definitionNote) errors.push(`${shape.id}: definition too long`);
  if (entry.note && entry.note.length > TEXT_LIMITS.note) errors.push(`${shape.id}: note too long`);
  return errors;
}

export function validateEngine(state: EngineState): string[] {
  const snap = state.snapshots?.[0];
  if (!snap) return ["no snapshot"];
  return METRIC_SHAPES.flatMap((shape) => {
    const entry = snap.metrics?.[shape.id];
    return entry ? validateEntry(entry, shape) : [];
  });
}

export function defaultDeck(): EngineState["deck"] {
  return { include: {}, showCompany: true, showSiteCredit: true, ask: { what: "", bullets: [], measureFirst: [] } };
}

export function newEngineState(setup: EngineSetup, nowIso: string): EngineState {
  const today = new Date(nowIso);
  const cohortWindow = Math.max(30, setup.paidWindowDays);
  return {
    schemaVersion: ENGINE_SCHEMA_VERSION,
    id: crypto.randomUUID(),
    createdAt: nowIso,
    updatedAt: nowIso,
    setup,
    snapshots: [
      {
        id: crypto.randomUUID(),
        referenceMonth: previousMonth(ym(today.getFullYear(), today.getMonth() + 1)),
        cohortMonth: matureCohortMonth(cohortWindow, today),
        createdAt: nowIso,
        metrics: {},
        targets: {},
      },
    ],
    tourLink: null,
    deck: { ...defaultDeck(), showCompany: Boolean(setup.companyLabel) },
  };
}
