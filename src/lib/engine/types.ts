import type { GlossaryTermId } from "@/content/glossary-terms"; // type only: erased at compile time, never a bundle edge

/**
 * The growth engine's data contract — engine spec §4.1-§4.2.
 *
 * Written first, alone, so that the pure engine (P1), storage (P2), content
 * (P3), the collection screens (P4), the visuals (P5) and the deck (P6) can
 * be built in parallel against the same shapes. **Any change here is a PR
 * on this contract, never a local edit in a consumer**: seven chunks read
 * these types, and a field renamed in one of them is a field the six others
 * read as `undefined`.
 *
 * Browser-safe and content-free: no value import from `content/`, no
 * `node:` module. The type import above are erased by the compiler,
 * which is what lets `lib/engine` name a glossary term without shipping the
 * glossary (`engine-boundary.test.ts` walks value imports only).
 *
 * **Units, once for every module.** A rate is always carried in PERCENT
 * (0-100), never as a fraction: that is the unit the user types a shortcut
 * in, the unit targets are entered in, and the unit the glossary writes its
 * references in (« 20 % et 40 % »). A ratio that is not a share (the viral
 * coefficient K, LTV:CAC) is carried as a plain number (0.15, 3). Money is
 * in the engine's currency, never converted. Durations keep their own unit.
 */

export const ENGINE_STORAGE_KEY = "tdg.engine.v1";
export const ENGINE_SCHEMA_VERSION = 1 as const;

/** v1: a single profile. The union exists so v1.1 migrates nothing. */
export type EngineProfile = "selfserve"; // v1.1: | "sales-led" | "consumer-app"   v2: | "marketplace"
export type Currency = "EUR" | "USD" | "GBP" | "CHF";
/** "YYYY-MM", validated by `YEAR_MONTH_PATTERN`. */
export type YearMonth = string;
export const YEAR_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export type MetricId =
  | "acq.signup-rate"
  | "acq.top-channel-share"
  | "acq.cac"
  | "act.event"
  | "act.rate"
  | "act.ttv"
  | "ret.d30"
  | "ret.logo-churn"
  | "ret.churn-cause"
  | "ref.mechanism"
  | "ref.referred-share"
  | "ref.k-factor"
  | "rev.paid-conversion"
  | "rev.arpa"
  | "rev.gross-margin";
/** The three computed figures (§5.7): never entered, always derived. */
export type DerivedId = "rev.ltv" | "rev.cac-payback" | "rev.ltv-cac";

export type ToolId =
  | "ga4"
  | "mixpanel"
  | "amplitude"
  | "posthog"
  | "stripe"
  | "chargebee"
  | "chartmogul"
  | "hubspot"
  | "salesforce"
  | "google-ads"
  | "meta-ads"
  | "linkedin-ads"
  | "app-store-connect"
  | "play-console"
  | "product-db"
  | "spreadsheet";
export type RoleId = "finance" | "data" | "product" | "marketing" | "revops" | "support";
/** Who or what a number came from. A role, never a person's name. */
export type SourceRef = { kind: "tool"; tool: ToolId } | { kind: "person"; role: RoleId } | { kind: "other" };

/**
 * No default other than "todo": a number nobody has looked at is in
 * progress, never missing (the `/admin/audit` 1.3a rule — otherwise coverage
 * becomes an opinion).
 */
export type MetricStatus =
  | "todo" // not looked at yet
  | "requested" // asked of a role, waiting
  | "measured" // sourced value
  | "estimated" // range + basis, BOTH mandatory
  | "conflicting" // two readings that disagree: reads as a range
  | "missing" // not findable: cause + repair cost MANDATORY
  | "not-applicable"; // leaves the denominator, closed reason MANDATORY

export type MissingCause = "not-tracked" | "not-computed" | "no-access" | "no-definition";
/** The audit's T1-T4 cost scale, in words (a meeting … a quarter), never in codes. */
export type RepairScale = "meeting" | "afternoon" | "sprint" | "quarter";
export type EstimateBasis = "team-hunch" | "old-number" | "sample" | "other";
export type Effort = "self-5min" | "self-1h" | "ask" | "build";

/** The unit is carried by the catalogue shape; a rate is stored as counts or as a 0-100 percent. */
export type MetricValue =
  | { kind: "ratio"; numerator: number; denominator: number }
  | { kind: "rate"; percent: number } // shortcut: confidence "approximate"
  | { kind: "amount"; amount: number } // ARPA/CAC shortcut: confidence "approximate"
  | { kind: "duration"; value: number; unit: "hours" | "days"; statistic: "median" | "mean" }
  | { kind: "text"; text: string } // ≤ TEXT_LIMITS.value (event, cause)
  | { kind: "choice"; choice: string }; // id from the metric's closed list in the catalogue

export interface Reading {
  value: MetricValue;
  source: SourceRef;
}

export interface MetricEntry {
  status: MetricStatus;
  value?: MetricValue; // measured
  source?: SourceRef; // measured
  /** Closed list per metric (CAC: "media-only" | "plus-team" | "fully-loaded"). */
  variant?: string;
  /**
   * ≤ 40 chars — a free name that qualifies the value: the top channel's
   * name for `acq.top-channel-share` (« Recherche naturelle »). Added to the
   * spec's §4.1 shape, which listed the channel name in §5.2 but gave it no
   * field.
   */
  label?: string;
  /**
   * How a qualitative answer is known — `ret.churn-cause`'s « données ·
   * entretiens · intuition » (§5.4). Same gap as `label`: named by the
   * catalogue, absent from §4.1.
   */
  evidence?: "data" | "interviews" | "hunch";
  /** Cohort metrics; default = the snapshot's cohortMonth. */
  cohortMonth?: YearMonth;
  /** Display unit (%, currency, days). low ≤ high, refused otherwise. */
  estimate?: { low: number; high: number; basis: EstimateBasis };
  conflict?: { a: Reading; b: Reading };
  request?: { role: RoleId; requestedAt: string; remindedAt?: string };
  missing?: { cause: MissingCause; repair: RepairScale; repairComment?: string; ownerRole?: RoleId };
  /** Closed list per metric. */
  naReason?: string;
  /** ≤ 200 chars — "active = at least one project edited". May appear in the deck's appendix and in a copied request. */
  definitionNote?: string;
  /** ≤ 400 chars — NEVER on a slide, only in the .json. */
  note?: string;
  /** ISO, client clock. */
  updatedAt: string;
}

export interface Snapshot {
  id: string; // crypto.randomUUID()
  referenceMonth: YearMonth; // the flows
  cohortMonth: YearMonth; // the peloton's columns
  createdAt: string;
  /** Absent = "todo". */
  metrics: Partial<Record<MetricId, MetricEntry>>;
  /** Team targets, display unit (%, currency). They always designate (D8). */
  targets: Partial<Record<MetricId, number>>;
}

export interface EngineSetup {
  profile: EngineProfile;
  currency: Currency;
  activationWindowDays: 7 | 14 | 30; // default 7 — part of act.rate's definition
  paidWindowDays: 30 | 60 | 90; // default 30 — part of rev.paid-conversion's definition
  /** ≤ 60 chars — only ever on the slides, and only if `deck.showCompany`. */
  companyLabel?: string;
}

export type SlideId = "peloton" | "leak" | "visibility" | "unit-economics" | "mirror" | "ask" | "annex";
export const SLIDE_ORDER: readonly SlideId[] = ["peloton", "leak", "visibility", "unit-economics", "mirror", "ask", "annex"];

export interface EngineAsk {
  what: string; // ≤ 120
  cost?: { kind: "money"; amount: number } | { kind: "team"; weeks: number; people: number };
  horizon?: { year: number; quarter: 1 | 2 | 3 | 4 };
  successMetric?: MetricId;
  successTarget?: number;
  bullets: string[]; // ≤ 3 × 90
  /** ≤ 3 — prefilled with the missing numbers that are cheapest to repair. */
  measureFirst: MetricId[];
}

export interface EngineDeck {
  include: Partial<Record<SlideId, boolean>>; // defaults in §9.2
  showCompany: boolean; // default true when companyLabel is set
  showSiteCredit: boolean; // default true, removable (decision 2, 2026-09-24)
  ask: EngineAsk;
}

export interface EngineState {
  schemaVersion: typeof ENGINE_SCHEMA_VERSION;
  id: string;
  createdAt: string;
  updatedAt: string;
  /** Last .json download. The backup band stays up while absent or older than updatedAt. */
  lastExportedAt?: string;
  setup: EngineSetup;
  /** v1: exactly one. The array exists so the monthly series (v2) migrates nothing. */
  snapshots: Snapshot[];
  /** The Tour is READ, never copied (D13): only the result id lives here. */
  tourLink: { resultId: string; linkedAt: string } | null;
  deck: EngineDeck;
}

/** The value stored under ENGINE_STORAGE_KEY. */
export interface EngineStore {
  schemaVersion: 1;
  state: EngineState;
}

// ---------------------------------------------------------------------------
// §4.2 — derived types. Computed on every render by lib/engine, NEVER stored.
// ---------------------------------------------------------------------------

/** A measured value is lo === hi. In percent for rates (see the header). */
export interface Interval {
  lo: number;
  hi: number;
}
export type Confidence = "solid" | "approximate" | "unknown";
export type Known =
  | { kind: "known"; value: Interval; confidence: Exclude<Confidence, "unknown"> }
  | { kind: "unknown"; why: "todo" | "requested" | MissingCause | "not-applicable" };

/** The six rates that can be named as the bottleneck (§6.6). */
export type CandidateId =
  | "acq.signup-rate"
  | "act.rate"
  | "ret.d30"
  | "rev.paid-conversion"
  | "ref.referred-share"
  | "ret.logo-churn";
export interface Comparator {
  kind: "target" | "reference";
  lo: number;
  hi: number;
  direction: "higher" | "lower";
  term?: GlossaryTermId;
}
export type Position = "below" | "maybe-below" | "within" | "above" | "no-comparator" | "unknown";

/**
 * One line of the "what if" chain (§6.7). `values` are numbers ALREADY
 * formatted by `format.ts`, so the screen, the slide and the text export
 * cannot print the same step two ways; each line recomputes from the
 * displayed numbers of the one before (tested).
 */
export interface ImpactLine {
  key: "today" | "if" | "then" | "times" | "annual" | "less-than-one";
  values: Record<string, string>;
}
export interface Impact {
  metric: CandidateId;
  kind: "new-mrr" | "retained-mrr" | "customers" | "per-hundred";
  from: Interval;
  to: number;
  customersPerMonth?: Interval; // extra paying customers (flows) or kept ones (churn)
  mrrPerMonth?: Interval;
  mrrAfter12Months?: Interval; // only when churn is known
  lines: ImpactLine[];
}

export type DiagnosisState = "clear" | "shared" | "level" | "not-enough";
export interface Diagnosis {
  state: DiagnosisState;
  /** clear: 1; shared: the WHOLE group, never capped at two; otherwise []. */
  named: CandidateId[];
  basis: "mrr" | "relative-gap" | "none";
  /** Below target, not priceable in money in v1 (D30 retention, referral). */
  belowUnpriced: CandidateId[];
  /** ★ or churn unknown: "the real bottleneck may hide there". */
  blind: MetricId[];
  positions: Record<CandidateId, { position: Position; comparator?: Comparator; impact?: Impact }>;
}

// ---------------------------------------------------------------------------
// Derived shapes the spec leaves to the modules (§6.4-§6.13), fixed here so
// that the screens (P4/P5) and the deck (P6) can be written against them
// while P1 is still computing them.
// ---------------------------------------------------------------------------

/** What every derived function receives besides the state: an injected clock and the page language. */
export interface EngineCalcContext {
  today: Date;
  locale: "en" | "fr";
}

/**
 * §6.4. `found + approximate + missing + inProgress === denominator`, for
 * every combination of statuses (tested). `requested` and `todo` split
 * `inProgress` for the coverage chips and the collect tab's count.
 */
export interface Coverage {
  denominator: number; // 15 − not-applicable
  found: number; // measured
  approximate: number; // estimated + conflicting
  missing: number;
  inProgress: number; // todo + requested
  requested: number;
  todo: number;
}

/** §6.5. Every column is counted on the SAME 100 sign-ups: there is no multiplicative chain. */
export interface PelotonColumn {
  metric: "act.rate" | "ret.d30" | "rev.paid-conversion";
  /** null = unknown, never 0. Rounded per bound. */
  perHundred: Interval | null;
  confidence: Confidence;
  /**
   * Where the column's number came from, and for which cohort — the screen
   * formats "Amplitude · juillet" itself (the spec's `sourceLabel`, split so
   * the pure module stays free of copy).
   */
  source: SourceRef | null;
  period: YearMonth | null;
}
export interface Peloton {
  visitorsPerHundred: Interval | null; // 100 ÷ acq.signup-rate
  referredPerHundred: Interval | null; // red dots in the sign-ups grid
  /** Source and month of the upstream line (acq.signup-rate). */
  upstreamSource: SourceRef | null;
  upstreamPeriod: YearMonth | null;
  columns: PelotonColumn[]; // always 3, act → ret → rev
  chain: "complete" | "gap" | "tail-break" | "empty";
  /** The cohort's size is under SMALL_COHORT_SIZE: rates lose their decimals. */
  smallCohort: boolean;
}

/** §5.7, §6.8. A computed figure with a missing input is "uncomputable — missing: …", never 0. */
export type DerivedValue =
  | { kind: "known"; value: Interval; confidence: Exclude<Confidence, "unknown"> }
  | { kind: "uncomputable"; missing: MetricId[] };
export interface UnitEconomics {
  /** Always written next to the CAC: "media-only" ≠ "fully-loaded". */
  cacVariant: string | null;
  ltv: DerivedValue; // months capped at LTV_CAP_MONTHS
  payback: DerivedValue; // months
  ltvCac: DerivedValue; // plain ratio
}

/** §6.9. `num-gt-den` blocks the save; every other check is shown "to check", never blocking (D11). */
export type SanityId =
  | "num-gt-den"
  | "retained-gt-activated"
  | "paid-gt-retained"
  | "churn-high"
  | "margin-odd"
  | "ttv-mean"
  | "cohort-mismatch"
  | "reconcile-gap";
export interface SanityCheck {
  id: SanityId;
  blocking: boolean;
  metrics: MetricId[];
  /** Placeholders of the message template, already formatted. */
  values: Record<string, string>;
}

/** §6.10 — closed list, one rank, no model-generated text. */
export type FindingKind =
  | "chain-break"
  | "no-definition"
  | "blind-spot"
  | "below-comparator"
  | "conflict"
  | "unit-econ-uncomputable"
  | "reconcile-gap"
  | "small-cohort"
  | "hidden-knowledge";
export interface Finding {
  kind: FindingKind;
  rank: 1 | 2 | 3 | 4;
  metrics: (MetricId | DerivedId)[];
  /** Placeholders of `findings.*`, already formatted. The sentence never asserts a cause. */
  values: Record<string, string>;
}

/** §6.11 — the Tour bridge. Declared from the answer's points, found from the status. */
export type TrackingLevel = "tracked" | "approximate" | "unknown";
export type MirrorVerdict = "coherent" | "blind-spot" | "blind-spot-light" | "better" | "known-gap";
export interface BridgeRow {
  questionId: string;
  metric: MetricId | DerivedId;
  declaredPoints: number;
  declared: TrackingLevel;
  /** null: todo / requested / not-applicable — no verdict. */
  found: TrackingLevel | null;
  verdict: MirrorVerdict | null;
}
export interface Mirror {
  resultId: string;
  takenAt: string; // the Tour result's createdAt
  total: number | null; // its /100, when stored
  rows: BridgeRow[];
  counts: Record<MirrorVerdict, number>;
}

/**
 * §6.12 / §9. The deck is a MODEL: `deck.ts` picks the slides, their order,
 * the key of each title template and every number already formatted. Slide
 * components only place these strings (D10: data titles are not editable).
 * `title.key` indexes `EngineStrings["slideTitles"]`; the same templates
 * give the board its verdict title (§7 E2), so screen and slide cannot word
 * one diagnosis two ways.
 *
 * Grammatical number is a key, never string surgery: `…One` is the singular
 * form (one stage unmeasured, one number missing), the bare key the general
 * one — the same convention as `coverage.found` / `coverage.foundOne`.
 */
export type SlideTitleKey =
  | "pelotonComplete"
  | "pelotonGap"
  | "pelotonGapOne"
  | "pelotonTailBreak"
  | "pelotonTailBreakOne"
  | "pelotonEmpty"
  | "leakClearMrrNew"
  | "leakClearMrrRetained"
  | "leakClearCustomers"
  | "leakClearPerHundred"
  | "leakShared"
  | "leakNotEnoughBelow"
  | "leakLevel"
  | "visibility"
  | "visibilityOne"
  | "visibilityAllDocumented"
  | "unitEconomics"
  | "unitEconomicsUnknown"
  | "mirror"
  | "ask"
  | "askMeasureFirst"
  | "annex";
export interface SlideTitle {
  key: SlideTitleKey;
  /** Placeholders, already formatted; `**…**` in the template marks the red accent. */
  values: Record<string, string>;
}
export interface DeckSlide {
  id: SlideId;
  /** Shown in the export screen at all (§9.2 "present if"). */
  present: boolean;
  /** Checked "include" (user's choice, or the §9.2 default). */
  included: boolean;
  /** 1-based position among included slides; null when excluded. */
  index: number | null;
  title: SlideTitle;
  /** Slide-specific lines, already formatted (the calc lines of `leak`, the annex rows…). */
  lines: Record<string, string>[];
  /** Speaker notes (§9.4), already filled. */
  notes: string[];
}
export interface DeckModel {
  slides: DeckSlide[];
  /** Non-blocking checks shown above the thumbnails: "{n} things to check before presenting". */
  checks: SanityCheck[];
  dataPill: { measured: number; approximate: number; missing: number };
  kicker: Record<string, string>;
  footer: Record<string, string>;
}

/** Everything the board renders, computed in one pass from the state (P1 composes it). */
export interface EngineDerived {
  coverage: Coverage;
  peloton: Peloton;
  diagnosis: Diagnosis;
  unit: UnitEconomics;
  sanity: SanityCheck[];
  findings: Finding[];
  mirror: Mirror | null;
}

