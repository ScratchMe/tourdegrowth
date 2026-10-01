import type { Pillar } from "@/lib/scoring/pillars";
import type { GlossaryTermId } from "@/content/glossary-terms"; // type only: erased at compile time
import type {
  CandidateId,
  DerivedId,
  Effort,
  LeverId,
  LinkMetricId,
  MetricId,
  MetricValue,
  Motion,
  PlgCandidateId,
  PlgDerivedId,
  PlgLeverId,
  PlgMetricId,
  RepairScale,
  RoleId,
  SlgCandidateId,
  SlgDerivedId,
  SlgLeverId,
  SlgMetricId,
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
 * text of the linked term. **None of them names a bottleneck** (decision 5,
 * reversed by Antoine on 2026-09-29, `CHANTIERS.md` C1): a reference is
 * context — shown with its caveat, never compared against to name a stage.
 * Only the team's own target does that (`diagnose.ts#comparatorOf`). The two
 * that used to (activation 20-40 %, logo churn 1-2 %/month) lost the right
 * because neither holds for every company: 1-2 % is high-ticket B2B SaaS,
 * and the 20-40 % has no primary source.
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
}

export interface MetricShape<Id extends MetricId = MetricId> {
  id: Id;
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
  /**
   * The window that is part of the definition: the setup's activation or
   * payment window (self-serve), its qualification or go-live window
   * (sales-assisted, §18.1.1), or a fixed 30 days.
   */
  window?: "activation" | "paid" | "qualification" | "go-live" | 30;
  /**
   * Where the number lives (§18.2.1): a motion's own catalogue, or the
   * hybrid's link. No number is shared by both motions since C25 Q4 (one
   * gross margin per motion).
   */
  scope: "plg" | "slg" | "link";
  /**
   * Months the number covers: 1 for self-serve, 3 for all of sales-assisted
   * (C25 Q2: a month counts too few deals), 12 for the 12-month NRR.
   */
  span: 1 | 3 | 12;
  /** Out of coverage, never a finding, never a candidate: the link (§18.2.2, S10). */
  optional?: true;
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

/** The five computed figures (§5.7; NRR and GRR since 2026-09-26). Never entered; an unknown input makes them uncomputable, never 0. */
export interface DerivedShape<Id extends DerivedId = DerivedId> {
  id: Id;
  stage: Pillar;
  inputs: readonly MetricId[];
  glossary: GlossaryTermId;
  tourQuestionId?: string;
  benchmark?: Benchmark;
}

/**
 * The self-serve catalogue — the seventeen v1 numbers, in their v1 order.
 * Every v1 module reads this list; a module that learns the motions reads
 * `shapesOf(motions)` instead (§18.2.1), and the sales-assisted numbers
 * never leak into a self-serve board through it.
 */
export const METRIC_SHAPES: readonly MetricShape<PlgMetricId>[] = ([
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
    benchmark: { term: "acquisition", lo: 2, hi: 5, direction: "higher" },
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
    benchmark: { term: "activation", lo: 20, hi: 40, direction: "higher" },
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
    benchmark: { term: "churn", lo: 1, hi: 2, direction: "lower" },
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
    benchmark: { term: "viral-coefficient", lo: 0.15, hi: 0.5, direction: "higher" },
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
    benchmark: { term: "cac-payback", lo: 70, hi: 85, direction: "higher" },
    defaultRepair: "meeting",
  },
  // --- MRR movements (2026-09-26) -------------------------------------------
  // Asked for by Antoine so the engine can say NRR and GRR: logo churn counts
  // customers, never the revenue that grows or shrinks inside the ones who stay.
  {
    id: "rev.expansion",
    stage: "revenue",
    primary: false,
    valueKinds: ["ratio", "rate"],
    unit: "percent",
    // An upgrade wave can in principle exceed the base it grows: not bounded.
    bounded: false,
    flow: "month",
    effort: "self-1h",
    defaultRole: "finance",
    sources: ["stripe", "chargebee", "chartmogul"],
    glossary: "nrr-grr",
    defaultRepair: "afternoon",
    naReasons: ["not-subscription"],
  },
  {
    id: "rev.contraction",
    stage: "revenue",
    primary: false,
    valueKinds: ["ratio", "rate"],
    unit: "percent",
    // A downgrade can only lose what was there on the 1st.
    bounded: true,
    flow: "month",
    effort: "self-1h",
    defaultRole: "finance",
    sources: ["stripe", "chargebee", "chartmogul"],
    glossary: "nrr-grr",
    defaultRepair: "afternoon",
    naReasons: ["not-subscription"],
  },
] satisfies readonly Omit<MetricShape<PlgMetricId>, "scope" | "span">[]).map((shape) => ({ ...shape, scope: "plg" as const, span: 1 as const }));

/**
 * The sales-assisted catalogue — engine spec §18.4, validated by Antoine on
 * 2026-09-30 (`CHANTIERS.md` C25). Stages keep the AARRR order of the tabs;
 * the funnel drawn in relays follows the calendar instead (signed, then live).
 *
 * - **Activation is the go-live** (Q1): the customer gets what they bought,
 *   after the signature — the after-sale is where sales-assisted dies quietly.
 * - **Everything reads over three months** (Q2), fixed: one month holds too
 *   few deals for a rate to mean anything.
 * - **Its own gross margin** (Q4): a single margin flatters the motion that
 *   sells onboarding.
 * - **No reference names a stage** (C1), and none is borrowed from the audit
 *   instrument (decision 6): the NRR's 110-130 % is the one reference, read
 *   word for word in the approved `nrr-grr` term, and it is context.
 *
 * Glossary links point at the nearest existing term until the four terms of
 * `CHANTIERS.md` A7.3.e exist (Q8); S2 links each number to its own.
 */
export const SLG_METRIC_SHAPES: readonly MetricShape<SlgMetricId>[] = ([
  // --- Acquisition -----------------------------------------------------------
  {
    id: "slg.acq.lead-to-opp",
    stage: "acquisition",
    primary: true,
    valueKinds: ["ratio", "rate"],
    unit: "percent",
    bounded: true,
    flow: "cohort",
    window: "qualification",
    effort: "self-1h",
    defaultRole: "revops",
    sources: ["hubspot", "salesforce", "pipedrive"],
    glossary: "acquisition",
    defaultRepair: "afternoon",
    // The relay's base is named after it: « pour 100 leads » or « pour 100 MQL ».
    variants: ["all-leads", "mql"],
  },
  {
    id: "slg.acq.cac",
    stage: "acquisition",
    primary: false,
    valueKinds: ["ratio", "amount"],
    unit: "money",
    bounded: false,
    flow: "month",
    effort: "ask",
    defaultRole: "finance",
    sources: ["hubspot", "salesforce", "pipedrive", "google-ads", "meta-ads", "linkedin-ads"],
    glossary: "cac",
    tourQuestionId: "acq-3",
    defaultRepair: "meeting",
    variants: ["media-only", "plus-team", "fully-loaded"],
  },
  {
    id: "slg.acq.cycle",
    stage: "acquisition",
    primary: false,
    valueKinds: ["duration"],
    unit: "duration",
    bounded: false,
    flow: "month",
    effort: "self-1h",
    defaultRole: "revops",
    sources: ["salesforce", "hubspot", "pipedrive"],
    glossary: "cac",
    defaultRepair: "afternoon",
    variants: ["median", "mean"],
  },
  // --- Activation: the go-live (Q1) -----------------------------------------
  {
    id: "slg.act.live-event",
    stage: "activation",
    primary: false,
    valueKinds: ["text"],
    unit: "text",
    bounded: false,
    flow: "none",
    window: "go-live",
    effort: "self-5min",
    defaultRole: "customer-success",
    sources: [],
    glossary: "aha-moment",
    tourQuestionId: "act-1",
    defaultRepair: "meeting",
  },
  {
    id: "slg.act.go-live",
    stage: "activation",
    primary: true,
    valueKinds: ["ratio", "rate"],
    unit: "percent",
    bounded: true,
    flow: "cohort",
    window: "go-live",
    effort: "ask",
    defaultRole: "customer-success",
    sources: ["cs-platform", "hubspot", "salesforce", "pipedrive", "spreadsheet"],
    glossary: "activation",
    tourQuestionId: "act-2",
    defaultRepair: "sprint",
    dependsOn: "slg.act.live-event",
  },
  {
    id: "slg.act.time-to-live",
    stage: "activation",
    primary: false,
    valueKinds: ["duration"],
    unit: "duration",
    bounded: false,
    flow: "cohort",
    window: "go-live",
    effort: "self-1h",
    defaultRole: "customer-success",
    sources: ["cs-platform", "hubspot", "salesforce", "pipedrive", "spreadsheet"],
    glossary: "time-to-value",
    defaultRepair: "afternoon",
    variants: ["median", "mean"],
  },
  // --- Retention: renewals ---------------------------------------------------
  {
    id: "slg.ret.renewal",
    stage: "retention",
    primary: true,
    valueKinds: ["ratio", "rate"],
    unit: "percent",
    bounded: true,
    flow: "month",
    effort: "self-1h",
    defaultRole: "customer-success",
    sources: ["salesforce", "hubspot", "pipedrive", "chargebee", "stripe"],
    glossary: "retention",
    tourQuestionId: "ret-1",
    defaultRepair: "afternoon",
    // Enters the lifetime (§18.5.6): an annual contract renews once a year.
    variants: ["annual", "monthly"],
    naReasons: ["no-renewal-yet"],
  },
  {
    id: "slg.ret.nrr",
    stage: "retention",
    primary: false,
    valueKinds: ["ratio", "rate"],
    unit: "percent",
    // Two amounts, and expansion can carry it past 100 %: not bounded (§18.3.3).
    bounded: false,
    flow: "month",
    effort: "ask",
    defaultRole: "finance",
    sources: ["chartmogul", "spreadsheet", "salesforce"],
    glossary: "nrr-grr",
    // « Considérée comme solide » in B2B SaaS — context only, and the NRR is never a candidate.
    benchmark: { term: "nrr-grr", lo: 110, hi: 130, direction: "higher" },
    defaultRepair: "afternoon",
  },
  {
    id: "slg.ret.loss-cause",
    stage: "retention",
    primary: false,
    valueKinds: ["text"],
    unit: "text",
    bounded: false,
    flow: "none",
    effort: "ask",
    defaultRole: "customer-success",
    sources: ["hubspot", "salesforce", "pipedrive"],
    glossary: "churn",
    tourQuestionId: "ret-3",
    defaultRepair: "meeting",
    choices: ["data", "interviews", "hunch"],
  },
  // --- Referral --------------------------------------------------------------
  {
    id: "slg.ref.referred-share",
    stage: "referral",
    primary: true,
    valueKinds: ["ratio", "rate"],
    unit: "percent",
    bounded: true,
    flow: "month",
    effort: "self-1h",
    defaultRole: "sales",
    sources: ["salesforce", "hubspot", "pipedrive"],
    glossary: "referral",
    defaultRepair: "afternoon",
    variants: ["customers", "customers-and-partners"],
  },
  {
    id: "slg.ref.referenceable",
    stage: "referral",
    primary: false,
    valueKinds: ["ratio", "rate"],
    unit: "percent",
    bounded: true,
    flow: "month",
    effort: "ask",
    defaultRole: "marketing",
    sources: ["spreadsheet", "hubspot", "salesforce", "pipedrive"],
    glossary: "referral",
    defaultRepair: "afternoon",
  },
  // --- Revenue ---------------------------------------------------------------
  {
    id: "slg.rev.win-rate",
    stage: "revenue",
    primary: true,
    valueKinds: ["ratio", "rate"],
    unit: "percent",
    bounded: true,
    flow: "month",
    effort: "self-5min",
    defaultRole: "revops",
    sources: ["salesforce", "hubspot", "pipedrive"],
    glossary: "revenue",
    defaultRepair: "meeting",
  },
  {
    id: "slg.rev.acv",
    stage: "revenue",
    primary: false,
    valueKinds: ["ratio", "amount"],
    unit: "money",
    bounded: false,
    flow: "month",
    effort: "self-5min",
    defaultRole: "finance",
    sources: ["hubspot", "salesforce", "pipedrive", "spreadsheet"],
    glossary: "arpu",
    defaultRepair: "meeting",
  },
  {
    id: "slg.rev.arpa",
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
    // C25 Q4: one margin per motion. `rev.gross-margin` stays self-serve's, unchanged.
    id: "slg.rev.gross-margin",
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
    defaultRepair: "meeting",
  },
] satisfies readonly Omit<MetricShape<SlgMetricId>, "scope" | "span">[]).map((shape) => ({
  ...shape,
  scope: "slg" as const,
  // The 12-month NRR is the one number that is not read over the three months.
  span: shape.id === "slg.ret.nrr" ? (12 as const) : (3 as const),
}));

/**
 * The hybrid's link (§18.4.8, C25 Q7): optional, out of coverage, never a
 * finding nor a candidate — and a lever, counted in opportunities.
 */
export const LINK_METRIC_SHAPES: readonly MetricShape<LinkMetricId>[] = [
  {
    id: "link.pql-handoff",
    stage: "acquisition",
    primary: false,
    valueKinds: ["ratio", "rate"],
    unit: "percent",
    bounded: true,
    flow: "month",
    effort: "self-1h",
    defaultRole: "revops",
    sources: ["hubspot", "salesforce", "pipedrive", "product-db"],
    glossary: "pql",
    defaultRepair: "sprint",
    scope: "link",
    span: 3,
    optional: true,
  },
];

/** Every number the engine knows, in catalogue order: self-serve, sales-assisted, the link. */
export const ALL_METRIC_SHAPES: readonly MetricShape[] = [...METRIC_SHAPES, ...SLG_METRIC_SHAPES, ...LINK_METRIC_SHAPES];

/**
 * The numbers a setup shows, in catalogue order (§18.2.1): self-serve's if
 * ticked, sales-assisted's if ticked, the link only in the hybrid. Throws on
 * no motion — `validate.ts` refuses such a setup before anything asks.
 */
export function shapesOf(motions: Readonly<Record<Motion, boolean>>): MetricShape[] {
  if (!motions.plg && !motions.slg) throw new Error("A setup sells at least one way (motions all false)");
  return ALL_METRIC_SHAPES.filter((s) => (s.scope === "link" ? motions.plg && motions.slg : motions[s.scope]));
}

/** LTV counts at most this many months of margin: "most practitioners cap at three to five years; we take the low end". */
export const LTV_CAP_MONTHS = 36;

export const DERIVED_SHAPES: readonly DerivedShape<PlgDerivedId>[] = [
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
    benchmark: { term: "cac-payback", lo: 12, hi: 24, direction: "lower" },
  },
  {
    id: "rev.ltv-cac",
    stage: "revenue",
    inputs: ["acq.cac", "rev.arpa", "rev.gross-margin", "ret.logo-churn"],
    glossary: "ltv",
    // "About 3:1 — a rule of thumb, not a law."
    benchmark: { term: "ltv", lo: 3, hi: 3, direction: "higher" },
  },
  // Monthly, in percent. No reference: the glossary quotes NRR and GRR over a
  // year, and comparing a monthly figure with an annual range would mislead.
  {
    id: "rev.grr",
    stage: "revenue",
    inputs: ["ret.logo-churn", "rev.contraction"],
    glossary: "nrr-grr",
  },
  {
    id: "rev.nrr",
    stage: "revenue",
    inputs: ["ret.logo-churn", "rev.contraction", "rev.expansion"],
    glossary: "nrr-grr",
  },
];

/**
 * The three sales-assisted computed figures (§18.4.7): from the NEW contracts'
 * ACV — the CAC is spent on them — and the motion's own margin (Q4). Lifetime
 * capped at LTV_CAP_MONTHS like self-serve (Q6).
 */
export const SLG_DERIVED_SHAPES: readonly DerivedShape<SlgDerivedId>[] = [
  {
    id: "slg.rev.ltv",
    stage: "revenue",
    inputs: ["slg.rev.acv", "slg.rev.gross-margin", "slg.ret.renewal"],
    glossary: "ltv",
    tourQuestionId: "rev-2",
  },
  {
    id: "slg.rev.cac-payback",
    stage: "revenue",
    inputs: ["slg.acq.cac", "slg.rev.acv", "slg.rev.gross-margin"],
    glossary: "cac-payback",
    benchmark: { term: "cac-payback", lo: 12, hi: 24, direction: "lower" },
  },
  {
    id: "slg.rev.ltv-cac",
    stage: "revenue",
    inputs: ["slg.acq.cac", "slg.rev.acv", "slg.rev.gross-margin", "slg.ret.renewal"],
    glossary: "ltv",
    benchmark: { term: "ltv", lo: 3, hi: 3, direction: "higher" },
  },
];

export const ALL_DERIVED_SHAPES: readonly DerivedShape[] = [...DERIVED_SHAPES, ...SLG_DERIVED_SHAPES];

/** The self-serve rates that can be named as the bottleneck (§6.6), churn the only lower-is-better one. */
export const CANDIDATE_IDS: readonly PlgCandidateId[] = [
  "acq.signup-rate",
  "act.rate",
  "ret.d30",
  "rev.paid-conversion",
  "ref.referred-share",
  "ret.logo-churn",
];

/**
 * The levers « Et si ? » moves together (2026-09-26), in the order the panel
 * and the deck list them — down the funnel, then the money. Every one is a
 * number the engine already collects; see `lib/engine/scenario.ts` for how
 * each one moves the others.
 */
export const LEVER_IDS: readonly PlgLeverId[] = [
  "acq.signup-rate",
  "ref.referred-share",
  "act.rate",
  "rev.paid-conversion",
  "ret.logo-churn",
  "rev.contraction",
  "rev.expansion",
  "rev.arpa",
];

/**
 * The sales-assisted levers (§18.5.5), then the link (C25 Q7) — its target is
 * a whole number of opportunities per quarter, never a percent.
 */
export const SLG_LEVER_IDS: readonly SlgLeverId[] = ["slg.acq.lead-to-opp", "slg.rev.win-rate", "slg.ret.renewal", "slg.rev.acv", "link.pql-handoff"];

/** Every lever a file may carry a what-if target for. */
export const ALL_LEVER_IDS: readonly LeverId[] = [...LEVER_IDS, ...SLG_LEVER_IDS];

/** The five sales-assisted ★ (§18.5.2). The link is none of them, even with a team target (C25 Q7). */
export const SLG_CANDIDATE_IDS: readonly SlgCandidateId[] = [
  "slg.acq.lead-to-opp",
  "slg.act.go-live",
  "slg.ret.renewal",
  "slg.ref.referred-share",
  "slg.rev.win-rate",
];

/**
 * Never priced in money in v1: pricing them would need a retention and a loop
 * model (§6.6) — and, in sales-assisted, a model tying go-live to renewal
 * (§18.5.2).
 */
export const UNPRICED_CANDIDATES: readonly CandidateId[] = ["ret.d30", "ref.referred-share", "slg.act.go-live", "slg.ref.referred-share"];

/** A motion's own candidates, in canonical order — the only ones its diagnosis positions. */
export function candidatesOf(motion: Motion): readonly CandidateId[] {
  return motion === "plg" ? CANDIDATE_IDS : SLG_CANDIDATE_IDS;
}

/** The motion a number belongs to; the link counts with sales-assisted, whose opportunities it counts. */
export function motionOfMetric(id: MetricId | DerivedId): Motion {
  return id.startsWith("slg.") || id.startsWith("link.") ? "slg" : "plg";
}

/** The three peloton columns, in reading order — every one counted on the same 100 sign-ups. */
export const PELOTON_METRICS = ["act.rate", "ret.d30", "rev.paid-conversion"] as const;

/**
 * The Tour bridge (§6.11): only where the Tour question literally asks
 * whether THIS number is measured. Eight, derived from the shapes so the
 * list cannot drift from them; adding one is a decision (a test pins it).
 */
export type EngineBridge = { questionId: string; metric: MetricId | DerivedId };

function bridgesOf(shapes: readonly (MetricShape | DerivedShape)[]): EngineBridge[] {
  return shapes.flatMap((s) => (s.tourQuestionId === undefined ? [] : [{ questionId: s.tourQuestionId, metric: s.id }]));
}

export const ENGINE_BRIDGES: readonly EngineBridge[] = bridgesOf([...METRIC_SHAPES, ...DERIVED_SHAPES]);

/**
 * The sales-assisted bridges (§18.4.9): six, by the same literal rule. No
 * `acq-1` (no « main channel » number) nor `ref-3` (no viral coefficient).
 * In the hybrid, a question bridged in both motions gives one line per motion.
 */
export const SLG_ENGINE_BRIDGES: readonly EngineBridge[] = bridgesOf([...SLG_METRIC_SHAPES, ...SLG_DERIVED_SHAPES]);

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
/** A median sales cycle past the three-month window: the quarter's CAC divides by customers of earlier spend (§18.5.7). */
export const SLG_CYCLE_LONG_DAYS = 90;
/** (ACV ÷ 12) ÷ sales-assisted ARPA outside this: a price rise, a new segment, or two definitions of revenue (§18.5.7). */
export const SLG_ACV_ARPA_BAND = { lo: 0.5, hi: 2 } as const;
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

/** Any number's shape, whichever catalogue it belongs to. */
export function shapeOf(id: MetricId): MetricShape {
  const shape = ALL_METRIC_SHAPES.find((s) => s.id === id);
  if (!shape) throw new Error(`Unknown engine metric: ${id}`);
  return shape;
}

export function derivedShapeOf(id: DerivedId): DerivedShape {
  const shape = ALL_DERIVED_SHAPES.find((s) => s.id === id);
  if (!shape) throw new Error(`Unknown engine derived metric: ${id}`);
  return shape;
}

/** The self-serve metrics of a stage, ★ first — the order of a stage drawer (§7 E3). Three per stage, five for Revenue since 2026-09-26. */
export function metricsOfStage(stage: Pillar): MetricShape<PlgMetricId>[] {
  return METRIC_SHAPES.filter((s) => s.stage === stage).sort((a, b) => Number(b.primary) - Number(a.primary));
}
