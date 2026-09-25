import type { Pillar } from "@/lib/scoring/pillars";
import type { GlossaryTermId } from "@/content/glossary-terms"; // type only: erased at compile time
import type {
  CandidateId,
  DerivedId,
  Effort,
  MetricId,
  MetricValue,
  RepairScale,
  RoleId,
  ToolId,
} from "./types";

/**
 * The SHAPE of the growth engine's catalogue — engine spec §5.
 *
 * Everything the browser needs to compute, and nothing it needs to read:
 * stage, unit, bounds, the numeric references, effort, sources, default
 * role, the Tour bridge, the closed-list ids. The PROSE (names, formulas,
 * "where to find it", traps, caveats) lives on the server in
 * `content/engine-catalog.ts` and reaches the island already resolved, as
 * props — the same split as `glossary-terms.ts` / `glossary.ts`
 * (REVIEW-02.md R2-14). A test pins that both files carry exactly the same
 * ids, so neither can gain a metric the other doesn't know.
 *
 * **References are numbers copied from approved copy, never invented.** Each
 * `benchmark` restates an order of magnitude already written, reviewed and
 * signed off in `content/glossary-deep.ts` (bons à tirer nº1-5); the content
 * tests check that `lo` and `hi`, formatted in each language, appear in the
 * text of the linked term. Only two of them `designates` (decision D8,
 * confirmed 2026-09-24): activation 20-40 % and SMB logo churn 1-2 %/month.
 * Every other one is context — shown, never used to name a bottleneck.
 */

/**
 * The month the recipes (formulas, "where to find it", traps) were last
 * checked against the tools they name. The static page prints it as
 * « Recettes relues en {month} », so it is a claim about the past, never a
 * release date: it moves only when someone re-reads the recipes.
 */
export const ENGINE_CATALOG_VERSION = "2026-09";

export interface Benchmark {
  term: GlossaryTermId;
  /** Display unit of the metric (percent for rates, plain number for K, months, ratio). */
  lo: number;
  hi: number;
  direction: "higher" | "lower";
  /** May name a bottleneck on a slide. Two in v1 — adding one is a product decision. */
  designates: boolean;
}

export interface MetricShape {
  id: MetricId;
  stage: Pillar;
  /** The ★ of its stage: the number that carries the peloton column or the stage row. One per stage. */
  primary: boolean;
  /** Accepted value kinds, the first being the one the sheet offers by default. */
  valueKinds: readonly MetricValue["kind"][];
  unit: "percent" | "money" | "ratio" | "duration" | "text" | "choice";
  /** numerator ≤ denominator — a violation blocks the save (sanity `num-gt-den`). */
  bounded: boolean;
  /** Which month the number belongs to: the flows' reference month, the followed cohort, or neither. */
  flow: "month" | "cohort" | "none";
  /** The window that is part of the definition (setup's activation or payment window, or a fixed 30 days). */
  window?: "activation" | "paid" | 30;
  effort: Effort;
  defaultRole: RoleId;
  sources: readonly ToolId[];
  glossary: GlossaryTermId;
  /** A Tour question that LITERALLY asks whether this number is measured (§6.11). */
  tourQuestionId?: string;
  benchmark?: Benchmark;
  defaultRepair: RepairScale;
  /** act.rate depends on act.event: a missing event is one finding, not two. */
  dependsOn?: MetricId;
  /** Closed-list ids; their labels live in the catalogue prose. */
  variants?: readonly string[];
  naReasons?: readonly string[];
  choices?: readonly string[];
}

/** The three computed figures (§5.7). Never entered; an unknown input makes them uncomputable, never 0. */
export interface DerivedShape {
  id: DerivedId;
  stage: Pillar;
  inputs: readonly MetricId[];
  glossary: GlossaryTermId;
  tourQuestionId?: string;
  benchmark?: Benchmark;
}

export const METRIC_SHAPES: readonly MetricShape[] = [
  // --- Acquisition -----------------------------------------------------------
  {
    id: "acq.signup-rate",
    stage: "acquisition",
    primary: true,
    valueKinds: ["ratio", "rate"],
    unit: "percent",
    bounded: true,
    flow: "month",
    effort: "self-5min",
    defaultRole: "marketing",
    sources: ["ga4", "mixpanel", "amplitude", "product-db"],
    glossary: "acquisition",
    // Context only: 2-5 % is for cold paid traffic, and real traffic is a mix.
    benchmark: { term: "acquisition", lo: 2, hi: 5, direction: "higher", designates: false },
    defaultRepair: "afternoon",
  },
  {
    id: "acq.top-channel-share",
    stage: "acquisition",
    primary: false,
    valueKinds: ["ratio", "rate"],
    unit: "percent",
    bounded: true,
    flow: "month",
    effort: "self-1h",
    defaultRole: "marketing",
    sources: ["ga4", "hubspot", "salesforce"],
    glossary: "acquisition",
    tourQuestionId: "acq-1",
    defaultRepair: "afternoon",
  },
  {
    id: "acq.cac",
    stage: "acquisition",
    primary: false,
    valueKinds: ["ratio", "amount"],
    unit: "money",
    bounded: false,
    flow: "month",
    effort: "ask",
    defaultRole: "finance",
    sources: ["google-ads", "meta-ads", "linkedin-ads", "stripe", "chargebee"],
    glossary: "cac",
    tourQuestionId: "acq-3",
    defaultRepair: "meeting",
    variants: ["media-only", "plus-team", "fully-loaded"],
  },
  // --- Activation ------------------------------------------------------------
  {
    id: "act.event",
    stage: "activation",
    primary: false,
    valueKinds: ["text"],
    unit: "text",
    bounded: false,
    flow: "none",
    window: "activation",
    effort: "self-5min",
    defaultRole: "product",
    sources: [],
    glossary: "aha-moment",
    tourQuestionId: "act-1",
    defaultRepair: "meeting",
  },
  {
    id: "act.rate",
    stage: "activation",
    primary: true,
    valueKinds: ["ratio", "rate"],
    unit: "percent",
    bounded: true,
    flow: "cohort",
    window: "activation",
    effort: "self-1h",
    defaultRole: "data",
    sources: ["amplitude", "mixpanel", "ga4", "posthog"],
    glossary: "activation",
    tourQuestionId: "act-2",
    benchmark: { term: "activation", lo: 20, hi: 40, direction: "higher", designates: true },
    defaultRepair: "sprint",
    dependsOn: "act.event",
  },
  {
    id: "act.ttv",
    stage: "activation",
    primary: false,
    valueKinds: ["duration"],
    unit: "duration",
    bounded: false,
    flow: "cohort",
    window: "activation",
    effort: "self-1h",
    defaultRole: "data",
    sources: ["amplitude", "mixpanel", "posthog", "ga4"],
    glossary: "time-to-value",
    defaultRepair: "afternoon",
    variants: ["median", "mean"],
  },
  // --- Retention -------------------------------------------------------------
  {
    id: "ret.d30",
    stage: "retention",
    primary: true,
    valueKinds: ["ratio", "rate"],
    unit: "percent",
    bounded: true,
    flow: "cohort",
    window: 30,
    effort: "self-1h",
    defaultRole: "data",
    sources: ["amplitude", "mixpanel", "posthog", "ga4"],
    glossary: "retention",
    tourQuestionId: "ret-1",
    defaultRepair: "sprint",
  },
  {
    id: "ret.logo-churn",
    stage: "retention",
    primary: false,
    valueKinds: ["ratio", "rate"],
    unit: "percent",
    bounded: true,
    flow: "month",
    effort: "self-5min",
    defaultRole: "finance",
    sources: ["stripe", "chargebee", "chartmogul"],
    glossary: "churn",
    benchmark: { term: "churn", lo: 1, hi: 2, direction: "lower", designates: true },
    defaultRepair: "afternoon",
    naReasons: ["not-subscription"],
  },
  {
    id: "ret.churn-cause",
    stage: "retention",
    primary: false,
    valueKinds: ["text"],
    unit: "text",
    bounded: false,
    flow: "none",
    effort: "ask",
    defaultRole: "support",
    sources: ["hubspot", "salesforce"],
    glossary: "churn",
    tourQuestionId: "ret-3",
    defaultRepair: "meeting",
    // How the cause is known — stored in MetricEntry.evidence.
    choices: ["data", "interviews", "hunch"],
  },
  // --- Referral --------------------------------------------------------------
  {
    id: "ref.mechanism",
    stage: "referral",
    primary: false,
    valueKinds: ["choice"],
    unit: "choice",
    bounded: false,
    flow: "none",
    effort: "self-5min",
    defaultRole: "product",
    sources: [],
    glossary: "referral",
    defaultRepair: "meeting",
    choices: ["none", "communication", "product"],
  },
  {
    id: "ref.referred-share",
    stage: "referral",
    primary: true,
    valueKinds: ["ratio", "rate"],
    unit: "percent",
    bounded: true,
    flow: "cohort",
    effort: "self-1h",
    defaultRole: "marketing",
    sources: ["product-db", "hubspot"],
    glossary: "referral",
    defaultRepair: "sprint",
  },
  {
    id: "ref.k-factor",
    stage: "referral",
    primary: false,
    // K is not a share: invited sign-ups may exceed the cohort's size.
    valueKinds: ["ratio"],
    unit: "ratio",
    bounded: false,
    flow: "cohort",
    effort: "ask",
    defaultRole: "data",
    sources: ["mixpanel", "amplitude", "product-db"],
    glossary: "viral-coefficient",
    tourQuestionId: "ref-3",
    benchmark: { term: "viral-coefficient", lo: 0.15, hi: 0.5, direction: "higher", designates: false },
    defaultRepair: "sprint",
    naReasons: ["no-invite-mechanism"],
  },
  // --- Revenue ---------------------------------------------------------------
  {
    id: "rev.paid-conversion",
    stage: "revenue",
    primary: true,
    valueKinds: ["ratio", "rate"],
    unit: "percent",
    bounded: true,
    flow: "cohort",
    window: "paid",
    effort: "ask",
    defaultRole: "data",
    sources: ["product-db", "stripe", "chargebee", "hubspot", "salesforce"],
    glossary: "revenue",
    defaultRepair: "sprint",
    naReasons: ["no-free-tier"],
  },
  {
    id: "rev.arpa",
    stage: "revenue",
    primary: false,
    valueKinds: ["ratio", "amount"],
    unit: "money",
    bounded: false,
    flow: "month",
    effort: "self-5min",
    defaultRole: "finance",
    sources: ["stripe", "chargebee", "chartmogul"],
    glossary: "arpu",
    defaultRepair: "meeting",
  },
  {
    id: "rev.gross-margin",
    stage: "revenue",
    primary: false,
    valueKinds: ["ratio", "rate"],
    unit: "percent",
    bounded: true,
    flow: "month",
    effort: "ask",
    defaultRole: "finance",
    sources: ["spreadsheet"],
    glossary: "cac-payback",
    // 70-85 % lives in the terms of cac-payback's formula, not in its benchmark block.
    benchmark: { term: "cac-payback", lo: 70, hi: 85, direction: "higher", designates: false },
    defaultRepair: "meeting",
  },
];

/** LTV counts at most this many months of margin: "most practitioners cap at three to five years; we take the low end". */
export const LTV_CAP_MONTHS = 36;

export const DERIVED_SHAPES: readonly DerivedShape[] = [
  {
    id: "rev.ltv",
    stage: "revenue",
    inputs: ["rev.arpa", "rev.gross-margin", "ret.logo-churn"],
    glossary: "ltv",
    tourQuestionId: "rev-2",
  },
  {
    id: "rev.cac-payback",
    stage: "revenue",
    inputs: ["acq.cac", "rev.arpa", "rev.gross-margin"],
    glossary: "cac-payback",
    // Under 12 months for SMB SaaS, 18-24 in enterprise sales: context, never a verdict.
    benchmark: { term: "cac-payback", lo: 12, hi: 24, direction: "lower", designates: false },
  },
  {
    id: "rev.ltv-cac",
    stage: "revenue",
    inputs: ["acq.cac", "rev.arpa", "rev.gross-margin", "ret.logo-churn"],
    glossary: "ltv",
    // "About 3:1 — a rule of thumb, not a law."
    benchmark: { term: "ltv", lo: 3, hi: 3, direction: "higher", designates: false },
  },
];

/** The rates that can be named as the bottleneck (§6.6), churn the only lower-is-better one. */
export const CANDIDATE_IDS: readonly CandidateId[] = [
  "acq.signup-rate",
  "act.rate",
  "ret.d30",
  "rev.paid-conversion",
  "ref.referred-share",
  "ret.logo-churn",
];

/** Never priced in money in v1: pricing them would need a retention and a loop model (§6.6). */
export const UNPRICED_CANDIDATES: readonly CandidateId[] = ["ret.d30", "ref.referred-share"];

/** The three peloton columns, in reading order — every one counted on the same 100 sign-ups. */
export const PELOTON_METRICS = ["act.rate", "ret.d30", "rev.paid-conversion"] as const;

/**
 * The Tour bridge (§6.11): only where the Tour question literally asks
 * whether THIS number is measured. Eight, derived from the shapes so the
 * list cannot drift from them; adding one is a decision (a test pins it).
 */
export const ENGINE_BRIDGES: readonly { questionId: string; metric: MetricId | DerivedId }[] = [
  ...METRIC_SHAPES,
  ...DERIVED_SHAPES,
]
  .filter((s): s is (MetricShape | DerivedShape) & { tourQuestionId: string } => s.tourQuestionId !== undefined)
  .map((s) => ({ questionId: s.tourQuestionId, metric: s.id }));

// --- Rules shared by several modules, fixed here so no two can disagree ------

/** `clear` needs top.lo > second.hi × CLEAR_MARGIN — the analogue of the Tour's 4-point gap on 20 (§6.6, D9). */
export const CLEAR_MARGIN = 1.25;
/** A cohort under this size loses its decimals and gets the "small numbers" band (§6.2). */
export const SMALL_COHORT_SIZE = 100;
/** A request unanswered this long rises to "follow up"; the clock restarts at `remindedAt` (§6.13). */
export const REMIND_AFTER_DAYS = 5;
/** Predicted ÷ billed new payers outside this band raises `reconcile-gap` (§6.9). */
export const RECONCILE_BAND = { lo: 0.67, hi: 1.5 } as const;
/** A monthly churn above this is probably an annual figure (§6.9). */
export const CHURN_HIGH_PERCENT = 30;
/** A gross margin outside this is probably counting the wrong costs (§6.9). */
export const MARGIN_ODD = { lo: 0, hi: 95 } as const;
/** high ÷ low above this: "a range this wide says almost nothing" (§7 E3). */
export const WIDE_RANGE_FACTOR = 3;
/** Character limits, checked on save — the copy says them, the validator enforces them. */
export const TEXT_LIMITS = {
  value: 120,
  label: 40,
  definitionNote: 200,
  note: 400,
  companyLabel: 60,
  askWhat: 120,
  askBullet: 90,
  askBullets: 3,
  askMeasureFirst: 3,
  repairComment: 200,
} as const;

export function shapeOf(id: MetricId): MetricShape {
  const shape = METRIC_SHAPES.find((s) => s.id === id);
  if (!shape) throw new Error(`Unknown engine metric: ${id}`);
  return shape;
}

export function derivedShapeOf(id: DerivedId): DerivedShape {
  const shape = DERIVED_SHAPES.find((s) => s.id === id);
  if (!shape) throw new Error(`Unknown engine derived metric: ${id}`);
  return shape;
}

/** The three metrics of a stage, ★ first — the order of a stage drawer (§7 E3). */
export function metricsOfStage(stage: Pillar): MetricShape[] {
  return METRIC_SHAPES.filter((s) => s.stage === stage).sort((a, b) => Number(b.primary) - Number(a.primary));
}
