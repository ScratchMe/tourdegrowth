
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

import type { AppMonetization } from "./app-model";

/**
 * Several engines per device (engine spec §19.1.4, A14 T0): an index under
 * `ENGINE_INDEX_KEY`, and each engine under its own key, `ENGINE_ENTRY_PREFIX`
 * + its id — one engine that fails to write never takes the others with it.
 */
export const ENGINE_INDEX_KEY = "tdg.engines.v3";
export const ENGINE_ENTRY_PREFIX = "tdg.engine.v3.";
/** At most this many engines on a device (C32 Q12): « Nouveau moteur » is greyed beyond, with the reason. */
export const MAX_ENGINES = 10;
/** At most this many months in one engine (§19.1.6): three years of a monthly review. */
export const MAX_MONTHS = 36;
/**
 * The v2 store (one engine, `EngineStore` v2), read once, migrated, and kept
 * until the first `.json` export that follows the migration (§19.1.4) — the
 * same rule the v1 store has had since §18.3.4.
 */
export const LEGACY_STORAGE_KEY_V2 = "tdg.engine.v2";
/**
 * Read once, migrated, and kept until the first successful `.json` export
 * that follows the migration (engine spec §18.3.4): a v1 store is never the
 * copy we destroy first.
 */
export const LEGACY_STORAGE_KEY_V1 = "tdg.engine.v1";
export const ENGINE_SCHEMA_VERSION = 3 as const;

/**
 * Decision 3 (C4), then §21 (C56-C63, C92): the TYPE of business. The consumer
 * app sells self-serve: the self-serve engine carries its subscriptions, an
 * app layer its in-app purchases, ads and per-install economics (`app.ts`).
 * The marketplace comes later (shown, disabled).
 */
export type BusinessType = "b2b-saas" | "consumer-app"; // later: | "marketplace"
/** Self-serve (PLG) and sales-assisted (SLG). Both ticked is the hybrid: derived, never stored (§18.2, S1). */
export type Motion = "plg" | "slg";
/** The canonical order, the only one: screens, slides, lists. Never sorted by a value (§18.6.4). */
export const MOTIONS: readonly Motion[] = ["plg", "slg"];
export type Currency = "EUR" | "USD" | "GBP" | "CHF";
/** "YYYY-MM", validated by `YEAR_MONTH_PATTERN`. */
export type YearMonth = string;
export const YEAR_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

/** The self-serve catalogue: the seventeen v1 ids, unchanged, so a v1 file renames no key (§18.2, S5). */
export type PlgMetricId =
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
  | "rev.gross-margin"
  /** MRR movements (Antoine, 2026-09-26): the two that NRR and GRR need and logo churn cannot give. */
  | "rev.expansion"
  | "rev.contraction";
/**
 * The sales-assisted catalogue (§18.4): fourteen numbers, three at most per
 * stage (two in Referral), plus its own gross margin since C25 Q4 — one
 * margin per motion, « il faut qu'on ait la différence ».
 */
export type SlgMetricId =
  | "slg.acq.lead-to-opp"
  | "slg.acq.cac"
  | "slg.acq.cycle"
  | "slg.act.live-event"
  | "slg.act.go-live"
  | "slg.act.time-to-live"
  | "slg.ret.renewal"
  | "slg.ret.nrr"
  | "slg.ret.loss-cause"
  | "slg.ref.referred-share"
  | "slg.ref.referenceable"
  | "slg.rev.win-rate"
  | "slg.rev.acv"
  | "slg.rev.arpa"
  | "slg.rev.gross-margin";
/** The hybrid's link (§18.4.8): the share of sales-assisted opportunities that came from self-serve accounts. Optional. */
export type LinkMetricId = "link.pql-handoff";
/** The consumer app's own numbers (§21.4.1): two that replace self-serve ones (CAC, margin), four of its own. */
export type AppMetricId =
  | "app.acq.cpi"
  | "app.ret.active-retention"
  | "app.rev.purchases-per-active"
  | "app.rev.ads-per-active"
  | "app.rev.commission"
  | "app.rev.gross-margin";
export type MetricId = PlgMetricId | SlgMetricId | LinkMetricId | AppMetricId;
/**
 * The computed figures (§5.7): never entered, always derived. NRR and GRR
 * joined the three unit-economics figures on 2026-09-26, with the two MRR
 * movements they are computed from.
 */
export type PlgDerivedId = "rev.ltv" | "rev.cac-payback" | "rev.ltv-cac" | "rev.nrr" | "rev.grr";
/** Computed from the NEW contracts' ACV, not the book's ARPA: the CAC is spent on them (§18.4.7). */
export type SlgDerivedId = "slg.rev.ltv" | "slg.rev.cac-payback" | "slg.rev.ltv-cac";
/** The consumer app's computed figures (§21.4.2): per install. */
export type AppDerivedId = "app.rev.install-value" | "app.rev.install-ltv" | "app.rev.install-payback" | "app.rev.value-to-cost";
export type DerivedId = PlgDerivedId | SlgDerivedId | AppDerivedId;

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
  | "spreadsheet"
  /** Sales-assisted (§18.2): a third CRM, and the customer-success platforms (Gainsight, Vitally, Planhat…). */
  | "pipedrive"
  | "cs-platform"
  /** The three tools a consumer app reads (§21.6.5), at the end of the union. */
  | "revenuecat"
  | "appsflyer"
  | "adjust";
/** `sales` and `customer-success` since C25 Q9: go-live, renewals and references are theirs, not Support's. */
export type RoleId = "finance" | "data" | "product" | "marketing" | "revops" | "support" | "sales" | "customer-success";
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
/**
 * `company-wide` (C25 Q4, 2026-09-30): the company's single gross margin,
 * taken as an ESTIMATE of one motion's margin when finance has no split.
 * Accepted on the two gross margins only (validate.ts), and only ever
 * « approximate ».
 */
export type EstimateBasis = "team-hunch" | "old-number" | "sample" | "other" | "company-wide";
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
  /**
   * A rate in counts whose denominator comes from another tool than its
   * numerator (§19.5.3, C32 Q10). Absent = the same source as `source`.
   * Two different sources raise a non-blocking « à vérifier ».
   */
  denominatorSource?: SourceRef;
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
  /** Team targets, display unit (%, currency). The only comparator that names a stage (decision 5, C1). */
  targets: Partial<Record<MetricId, number>>;
  /**
   * The counts several numbers share, typed ONCE (Antoine, 2026-09-25: « si
   * on l'a déjà saisi une fois, on ne devrait pas avoir à le saisir de
   * nouveau »). Optional: a file from before has none, and every count it
   * needs is still in its entries. `lib/engine/shared-counts.ts` keeps this
   * and the entries that carry the same count in step.
   */
  base?: Partial<Record<SharedCount, number>>;
  /**
   * When the next month was started (§19.2.3): every computation on a closed
   * month takes this date for « today », so a month read later keeps the
   * periods and the confidence it was seen with. Absent on the last month.
   */
  closedAt?: string;
  /** The setup's windows when the month was closed: a number's definition at the time (§19.2.3, §19.2.5). */
  windows?: SnapshotWindows;
  /** Sales-assisted: the quarter's open pipeline, in ACV (§19.4, C32 Q8). Optional. */
  pipelineOpen?: number;
}

/** The four windows that are part of a number's definition (§19.2.3). */
export interface SnapshotWindows {
  activationWindowDays: EngineSetup["activationWindowDays"];
  paidWindowDays: EngineSetup["paidWindowDays"];
  qualificationWindowDays: EngineSetup["qualificationWindowDays"];
  goLiveWindowDays: EngineSetup["goLiveWindowDays"];
}

/**
 * A count more than one number is computed on (`lib/engine/shared-counts.ts`).
 * `mrrEnd` is the MRR at the end of the flows' month (ARPA's numerator, the
 * gross margin's revenue); `mrrStart` the MRR on its 1st (the base the two
 * MRR movements are measured on).
 */
export type SharedCount =
  | "cohortSignups"
  | "monthSignups"
  | "mrrEnd"
  | "mrrStart"
  /** Sales-assisted (§18.2, S6): opportunities created, new-customer deals won, both over the three months; customers at the flows' month end. */
  | "slgOppsCreated"
  | "slgDealsWon"
  | "slgCustomers"
  /** A consumer app (§21.2.4): the month's actives, the base of its two per-active revenues. */
  | "appActives";

/**
 * The levers « Et si ? » can move, together (Antoine, 2026-09-26: the
 * what-ifs cumulate and compound). Each is a number the engine already
 * collects; its target is kept in the number's display unit (percent for a
 * rate, the engine's currency for ARPA).
 */
export type PlgLeverId =
  | "acq.signup-rate"
  | "ref.referred-share"
  | "act.rate"
  | "ret.d30"
  | "rev.paid-conversion"
  | "ret.logo-churn"
  | "rev.expansion"
  | "rev.contraction"
  | "rev.arpa";
/**
 * The sales-assisted levers (§18.5.5), then the link (C25 Q7, 2026-09-30):
 * its target is a NUMBER of opportunities from self-serve per quarter, a
 * whole count, never a percent — and the link is never a candidate.
 */
export type SlgLeverId = "slg.acq.lead-to-opp" | "slg.ref.referred-share" | "slg.rev.win-rate" | "slg.ret.renewal" | "slg.rev.acv" | "link.pql-handoff";
/** The consumer app's levers (§21.5.3), after the self-serve ones in panel order. */
export type AppLeverId = "app.ret.active-retention" | "app.rev.purchases-per-active" | "app.rev.ads-per-active" | "app.rev.commission";
export type LeverId = PlgLeverId | SlgLeverId | AppLeverId;

export interface EngineSetup {
  type: BusinessType;
  /** At least one true (validate.ts). Both true is the hybrid — derived, never stored. */
  motions: Record<Motion, boolean>;
  currency: Currency;
  activationWindowDays: 7 | 14 | 30; // PLG, default 7 — part of act.rate's definition
  paidWindowDays: 30 | 60 | 90; // PLG, default 30 — part of rev.paid-conversion's definition
  /** SLG, default 30 — part of slg.acq.lead-to-opp's definition. Kept while the motion is unticked (§18.2, S3). */
  qualificationWindowDays: 30 | 60 | 90;
  /** SLG, default 90 — part of slg.act.go-live's definition. */
  goLiveWindowDays: 30 | 60 | 90;
  /** ≤ 60 chars — only ever on the slides, and only if `deck.showCompany`. */
  companyLabel?: string;
  /**
   * The tools the team uses (§19.5, C32 Q9). Absent or empty = « not said »:
   * nothing changes from the engine without it. Never required.
   */
  tools?: ToolId[];
  /** Sales-assisted pipeline coverage (§19.4, C32 Q8): the quarter's target in ACV, and a team threshold (2.5 = « 2,5× »). */
  pipeline?: { quarterTarget?: number; threshold?: number };
  /**
   * The team's runway, in months (§20.8, C49): how long the cash lasts at
   * today's spending. Optional, never on a slide, never sent anywhere: the
   * engine only holds the CAC payback against it. Absent, the payback is held
   * against the 30-month floor (`money.ts#PAYBACK_FLOOR_MONTHS`).
   */
  runwayMonths?: number;
  /**
   * Consumer app only (C56, C92): what it earns from, at least one ticked.
   * Required when `type` is "consumer-app", absent otherwise (validate.ts).
   */
  monetization?: AppMonetization;
}

/**
 * What a v1 engine becomes, and what a new engine starts with (§18.1.1,
 * §18.3.1): self-serve ticked, sales-assisted not — the v1 behaviour — and
 * the two sales-assisted windows at their defaults, kept even unticked.
 */
export const SETUP_V2_DEFAULTS = {
  type: "b2b-saas",
  motions: { plg: true, slg: false },
  qualificationWindowDays: 30,
  goLiveWindowDays: 90,
} as const satisfies Pick<EngineSetup, "type" | "motions" | "qualificationWindowDays" | "goLiveWindowDays">;

/** A setup as a v1 build wrote it: read by the migration only (`migrate.ts`). */
export interface EngineSetupV1 {
  profile: "selfserve";
  currency: Currency;
  activationWindowDays: 7 | 14 | 30;
  paidWindowDays: 30 | 60 | 90;
  companyLabel?: string;
}

/**
 * The fixed slides, in `SLIDE_ORDER`, plus the what-if ones (2026-09-26):
 * one per lever the team moved (`whatif:<lever>`) and one that adds them all
 * up (`scenario`). Those have no fixed place in the list: `deck.ts` puts them
 * after `leak`, in lever order. The appendix may run over more than one page
 * (A2.1, 2026-09-29): its first page is `annex`, the next ones `annex:2`,
 * `annex:3`… (lib/engine/annex-pages.ts).
 */
export type FixedSlideId = "peloton" | "leak" | "visibility" | "unit-economics" | "mirror" | "ask" | "annex";
export type AnnexPageId = `annex:${number}`;
/**
 * `total` is the hybrid's alone (« deux moteurs, un total »). The
 * sales-assisted slides carry the `slg:` prefix; the self-serve ones keep
 * their v1 ids, so a v1 file's `deck.include` still means what it meant.
 */
export type SlgSlideId = "slg:peloton" | "slg:leak" | "slg:scenario";
/**
 * « Ce qui a bougé » (§19.2.6, A14 T1): one per motion, from the second
 * month only, unchecked by default (C32 Q5). Not a `FixedSlideId`: a
 * one-month engine — every v1 and v2 file — has no such slide at all.
 */
export type SeriesSlideId = "evolution" | "slg:evolution";
export type SlideId = FixedSlideId | "total" | SlgSlideId | SeriesSlideId | "scenario" | `whatif:${LeverId}` | AnnexPageId;

export const isAnnexPage = (id: SlideId): id is AnnexPageId => id.startsWith("annex:");

/** The key a slide's « include » box reads and writes: the appendix's pages go in or out together, as `annex`. */
export const includeKeyOf = (id: SlideId): SlideId => (isAnnexPage(id) ? "annex" : id);
export const SLIDE_ORDER: readonly FixedSlideId[] = ["peloton", "leak", "visibility", "unit-economics", "mirror", "ask", "annex"];

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
  /** §19.8, C32 Q14: "white" for a company template. Absent = "paper", the slides as they have always been. */
  theme?: DeckTheme;
}

export type DeckTheme = "paper" | "white";
export const DECK_THEMES: readonly DeckTheme[] = ["paper", "white"];

export interface EngineState {
  schemaVersion: typeof ENGINE_SCHEMA_VERSION;
  id: string;
  createdAt: string;
  updatedAt: string;
  /** Last .json download. The backup band stays up while absent or older than updatedAt. */
  lastExportedAt?: string;
  setup: EngineSetup;
  /** One per month, oldest first, `referenceMonth` strictly increasing (§19.2, §19.1.6). The last is the current month. */
  snapshots: Snapshot[];
  /** The Tour is READ, never copied (D13): only the result id lives here. */
  tourLink: { resultId: string; linkedAt: string } | null;
  deck: EngineDeck;
  /**
   * « Et si ? » (2026-09-26): the target each lever is being tested at, in
   * the number's display unit. Absent lever = not moved. Optional: a file
   * from before has none. Never a team target — `Snapshot.targets` are the
   * ones that designate a bottleneck; this is a scenario being tried.
   */
  whatIf?: Partial<Record<LeverId, number>>;
}

/** The value stored under `ENGINE_ENTRY_PREFIX` + an engine's id. */
export interface EngineStore {
  schemaVersion: typeof ENGINE_SCHEMA_VERSION;
  state: EngineState;
}

/** The value stored under `ENGINE_INDEX_KEY`: which engines the device holds, in order, and the one on screen. */
export interface EngineIndex {
  schemaVersion: typeof ENGINE_SCHEMA_VERSION;
  activeId: string;
  order: string[];
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
export type PlgCandidateId =
  | "acq.signup-rate"
  | "act.rate"
  | "ret.d30"
  | "rev.paid-conversion"
  | "ref.referred-share"
  | "ret.logo-churn";
/**
 * The five sales-assisted ★, all read « higher is better » (§18.5.2). Never
 * the link (C25 Q7): a target on it names no stage.
 */
export type SlgCandidateId = "slg.acq.lead-to-opp" | "slg.act.go-live" | "slg.ret.renewal" | "slg.ref.referred-share" | "slg.rev.win-rate";
/** Any stage a diagnosis may name — each diagnosis only ever positions its own motion's (§18.5.2). */
export type CandidateId = PlgCandidateId | SlgCandidateId;
/**
 * What may name a stage: the team's own target, and nothing else (decision 5,
 * reversed 2026-09-29, `CHANTIERS.md` C1 — a published reference is context,
 * never a comparator). A point, `lo === hi`, kept as an interval so
 * `diagnose.ts#positionOf` reads it like any value.
 */
export interface Comparator {
  lo: number;
  hi: number;
  direction: "higher" | "lower";
}
export type Position = "below" | "maybe-below" | "within" | "above" | "no-comparator" | "unknown";

/**
 * One line of the "what if" chain (§6.7). `values` are numbers ALREADY
 * formatted by `format.ts`, so the screen, the slide and the text export
 * cannot print the same step two ways; each line recomputes from the
 * displayed numbers of the one before (tested).
 */
export interface ImpactLine {
  /** `per-month`: sales-assisted only — its chain counts a quarter, then says what that is a month (§18.5.3). */
  key: "today" | "if" | "then" | "times" | "per-month" | "annual" | "less-than-one";
  values: Record<string, string>;
  /**
   * The count this line's noun agrees with, AS PRINTED (rounded like its
   * `values`): "42 nouveaux payants" / "1 nouveau payant". Set only where the
   * template counts something with a noun — the grammatical number follows
   * the printed number, so it is decided from the same rounding, not the raw one.
   */
  count?: Interval;
}
export interface Impact {
  metric: CandidateId;
  kind: "new-mrr" | "retained-mrr" | "customers" | "per-hundred";
  from: Interval;
  to: number;
  customersPerMonth?: Interval; // extra paying customers (flows) or kept ones (churn)
  mrrPerMonth?: Interval;
  mrrAfter12Months?: Interval; // only when churn is known
  /**
   * Sales-assisted (§18.5.3): its chains count over the three months — new
   * customers signed, contracts kept — and the money of that quarter, as
   * printed. `mrrPerMonth` is then that quarter ÷ 3.
   */
  customersPerQuarter?: Interval;
  mrrPerQuarter?: Interval;
  /**
   * Sales-assisted, read « pour 100 » on the relay's own base (no count of new
   * customers or of contracts up for renewal): which base, as a key of the
   * copy's `findings.base` — never a word.
   */
  perHundredBase?: "leads" | "mql" | "closedOpps" | "renewals" | "oppsCreated";
  lines: ImpactLine[];
}

export type DiagnosisState = "clear" | "shared" | "level" | "not-enough";
/**
 * One motion's diagnosis (§6.6, §18.5.2). Its positions carry ONLY that
 * motion's candidates, so no function can rank a self-serve stage against a
 * sales-assisted one (§18.6.4). The default, `PlgCandidateId`, is the v1
 * reading the screens were written against; the hybrid's screens (S3) read
 * either.
 */
export interface Diagnosis<C extends CandidateId = PlgCandidateId> {
  motion: Motion;
  state: DiagnosisState;
  /** clear: 1; shared: the WHOLE group, never capped at two; otherwise []. */
  named: C[];
  basis: "mrr" | "relative-gap" | "none";
  /** Below target, not priceable in money in v1 (D30 retention, referral; go-live and referred share in sales-assisted). */
  belowUnpriced: C[];
  /** ★ (or churn) unknown: "the real bottleneck may hide there". */
  blind: MetricId[];
  positions: Record<C, { position: Position; comparator?: Comparator; impact?: Impact }>;
}
export type SlgDiagnosis = Diagnosis<SlgCandidateId>;

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

/**
 * §18.5.1. The sales-assisted funnel: three relays, each on ITS OWN base of
 * 100 — the win rate is read on the quarter's closed opportunities, not on a
 * cohort of leads, so there is no common base and never a chain multiplied
 * through. In chronological order: lead → opportunity, closed → signed,
 * signed → live.
 */
export interface RelayColumn {
  metric: "slg.acq.lead-to-opp" | "slg.rev.win-rate" | "slg.act.go-live";
  base: "leads" | "closed-opps" | "new-customers";
  /** null = unknown, never 0. Rounded per bound. */
  perHundred: Interval | null;
  confidence: Confidence;
  source: SourceRef | null;
  /** The three months the number covers (C25 Q2). */
  period: { from: YearMonth; to: YearMonth } | null;
  /** The denominator entered as counts, for « small samples » (§18.5.1). */
  sampleSize: number | null;
}
export interface Relays {
  /** The lead-to-opportunity variant names the first base: « pour 100 leads » or « pour 100 MQL ». */
  leadNoun: "leads" | "mql";
  /** The cohort's leads ÷ 3: the upstream line, « ~160 MQL par mois ». */
  leadsPerMonth: Interval | null;
  columns: RelayColumn[]; // always 3, in chronological order
  chain: Peloton["chain"];
}

/**
 * The inputs of the computed figures (`UNIT_INPUT_IDS`, catalog-shape.ts), the
 * only numbers a sentence names after « il manque » / "missing:". The copy
 * carries one phrase per id (`unitInput`); a test pins the two sets equal.
 */
export type UnitInputId =
  | "acq.cac"
  | "rev.arpa"
  | "rev.gross-margin"
  | "ret.logo-churn"
  | "rev.expansion"
  | "rev.contraction"
  // Sales-assisted (§18.4.7): the CAC, the new contracts' ACV, its own margin (Q4), the renewal.
  | "slg.acq.cac"
  | "slg.rev.acv"
  | "slg.rev.gross-margin"
  | "slg.ret.renewal"
  // A consumer app (§21.4.5). Not `ret.d30` nor `rev.paid-conversion`, though its figures read them too: in the SaaS
  // « il manque » names them without an article, and must go on doing so.
  | "app.acq.cpi"
  | "app.rev.gross-margin"
  | "app.rev.commission"
  | "app.ret.active-retention"
  | "app.rev.purchases-per-active"
  | "app.rev.ads-per-active";

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
  /**
   * Monthly, in percent. GRR = 100 − revenue churned − contraction; NRR adds
   * expansion. The churned part is read from LOGO churn — the engine does not
   * ask for churned MRR — so both are always "approximate": they assume the
   * customers who left paid the average ARPA.
   */
  grr: DerivedValue;
  nrr: DerivedValue;
}

/**
 * §18.5.6. The sales-assisted computed figures, from the NEW contracts' ACV
 * (the CAC is spent on them) and the motion's own margin (C25 Q4). Never a
 * fallback on revenue, nor on self-serve's margin.
 */
export interface SlgUnitEconomics {
  cacVariant: string | null;
  /** The renewal's variant: an annual contract renews once a year. null when the renewal isn't known. */
  renewalTerm: "annual" | "monthly" | null;
  /** min(the life the renewal implies, 36), in months. */
  lifetimeMonths: DerivedValue;
  ltv: DerivedValue;
  payback: DerivedValue; // months
  ltvCac: DerivedValue;
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
  | "reconcile-gap"
  // Sales-assisted (§18.5.7): triggers to re-read, never references.
  | "slg-cycle-long"
  | "slg-cycle-mean"
  | "slg-ttl-mean"
  | "slg-acv-vs-arpa"
  // The hybrid's one check across motions: the two CACs count different spend.
  | "cac-variants-differ"
  // A rate's two counts from two tools (§19.5.3, A14 T4): never blocking, said once.
  | "two-tools";
export interface SanityCheck {
  id: SanityId;
  /** The motion the check reads; absent for one that reads both (`cac-variants-differ`). */
  motion?: Motion;
  blocking: boolean;
  metrics: MetricId[];
  /** Placeholders of the message template, already formatted. */
  values: Record<string, string>;
  /** The count the message's noun agrees with, as printed (`reconcile-gap`: « ~1 nouveau payant »). */
  count?: Interval;
}

/** §6.10 — closed list, one rank, no model-generated text. */
export type FindingKind =
  | "chain-break"
  | "no-definition"
  | "blind-spot"
  | "below-comparator"
  | "conflict"
  | "unit-econ-uncomputable"
  /** §20.4, C48: every reading of the LTV under every reading of the CAC — each new customer costs more than it brings back. */
  | "unit-econ-loss"
  /** The same, the two ranges overlapping: a loss possible, not certain. */
  | "unit-econ-loss-maybe"
  | "reconcile-gap"
  | "small-cohort"
  /** Sales-assisted: a bounded number on fewer than 100 — one more or less moves it by p points (§18.5.1). */
  | "small-sample"
  | "hidden-knowledge";
export interface Finding {
  kind: FindingKind;
  /** The motion the finding is about (§18.5.8). Never the link: it makes no finding. */
  motion?: Motion;
  rank: 1 | 2 | 3 | 4;
  metrics: (MetricId | DerivedId)[];
  /** Placeholders of `findings.*`, already formatted. The sentence never asserts a cause. */
  values: Record<string, string>;
  /** The count the sentence's noun agrees with, as printed — see `SanityCheck.count`. */
  count?: Interval;
}

/** §6.11 — the Tour bridge. Declared from the answer's points, found from the status. */
export type TrackingLevel = "tracked" | "approximate" | "unknown";
export type MirrorVerdict = "coherent" | "blind-spot" | "blind-spot-light" | "better" | "known-gap";
export interface BridgeRow {
  questionId: string;
  /** In the hybrid, a question bridged in both motions gives one row per motion (§18.4.9). */
  motion: Motion;
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
  | "leakClearCustomersOne"
  /** Churn priced in customers, not money: its chain counts customers KEPT. */
  | "leakClearKept"
  | "leakClearKeptOne"
  | "leakClearPerHundred"
  | "leakClearPerHundredOne"
  /** A stage the model can't price (day-30 retention, referred share): named, with no amount (C9). */
  | "leakClearUnpriced"
  | "leakShared"
  | "leakNotEnoughBelow"
  | "leakLevel"
  | "visibility"
  | "visibilityOne"
  | "visibilityAllDocumented"
  | "unitEconomics"
  | "unitEconomicsUnknown"
  | "unitEconomicsLoss"
  | "mirror"
  | "ask"
  /** The team wrote what it asks for, but no success metric with a target: the ask alone, no half-empty goal. */
  | "askPlain"
  | "askMeasureFirst"
  /** « Définitions et sources (1/2) »: the appendix always runs over two pages or more at 18px (A2.1). */
  | "annex"
  /** « Et si » (2026-09-26): one lever, priced on the MRR in 12 months — or plain when it can't be. */
  | "whatIfLever"
  | "whatIfLeverPlain"
  /** All the levers under test, together. */
  | "scenario"
  | "scenarioPlain"
  /** « Deux moteurs, un total » (A7.3.c S2, §18.8.2): the MRR summed, or which part is missing. */
  | "total"
  | "totalUnknown"
  | "totalUnknownBoth"
  /** Sales-assisted's relays, each on its own base of 100: the peloton's four cases. */
  | "slgPelotonComplete"
  | "slgPelotonGap"
  | "slgPelotonGapOne"
  | "slgPelotonTailBreak"
  | "slgPelotonTailBreakOne"
  | "slgPelotonEmpty"
  /** A sales-assisted leak with no amount to print: customers or contracts a quarter, or per 100 of the relay. */
  | "slgLeakClearCustomers"
  | "slgLeakClearCustomersOne"
  | "slgLeakClearKept"
  | "slgLeakClearKeptOne"
  | "slgLeakClearPerHundred"
  /** The unit economics, the two motions side by side, never one against the other. */
  | "unitEconomicsBoth"
  | "unitEconomicsOneSidePlg"
  | "unitEconomicsOneSideSlg"
  | "unitEconomicsNoneMargins"
  | "unitEconomicsNoneDifferent"
  | "unitEconomicsSides"
  /** « Ce qui a bougé » (§19.2.6): how many numbers moved since the month before, and the leak; or why the two months don't compare. */
  | "evolution"
  | "evolutionOne"
  | "evolutionStill"
  | "evolutionApart";
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
  /**
   * The motion a slide is about (A7.3.c S4), set only when sales-assisted is
   * ticked: self-serve alone prints the v1 deck, whose slides have none. A
   * common slide (visibility, the ask, the appendix…) has none either.
   */
  motion?: Motion;
  /**
   * A what-if slide's curve (design system extension 09, Q11, A20.d T4.b):
   * the MRR month by month, today's pace and with the what-if(s). Drawn, not
   * printed: the text export says the slide's figures in its rows.
   */
  curve?: SlideCurve;
  /** The « together » slide's compounding, drawn (`LeverSum`): each lever alone, added up, together. */
  leverSum?: SlideLeverSum;
  /**
   * The unit-economics slide's picture (design system extension 09, Q12,
   * A20.d T4.c): one customer, month by month, the margin it brings back
   * against what it cost. Drawn, not printed: its figures are the rows'.
   */
  paybackChart?: SlidePaybackChart;
  /** The hybrid's unit economics (A20.d T4.d): each engine's picture, side by side, compact — never summed. */
  paybackCharts?: { plg?: SlidePaybackChart; slg?: SlidePaybackChart };
}
/** The curve a what-if slide draws: thirteen months, [low, high], today first. */
export interface SlideCurve {
  today: [number, number][];
  whatif: [number, number][] | null;
  /** « 48 000 € aujourd'hui »: the curve's one figure. */
  start: string;
  xLabels: [string, string, string];
  keys: { today: string; whatif: string };
  /** The curve in words, for a screen reader. */
  summary: string;
}
/**
 * One customer, month by month (`PaybackChart`): [low, high] each, from the
 * same scenario as the board's money block. Absent without a CAC: the cost
 * line is the picture's one certainty.
 */
export interface SlidePaybackChart {
  /** null: no margin, or no lifetime — the « ? » box under the cost line. */
  monthlyMargin: [number, number] | null;
  cac: [number, number];
  lifetime: [number, number] | null;
  payback: [number, number] | null;
  /**
   * What the picture tells: the customer leaves first (`loss`), pays back, or
   * « ? » (no margin or lifetime). Decided by the loss verdict, so the drawing
   * and the slide's words never disagree; a possible loss is drawn by its
   * middles, its labels saying « may ».
   */
  story: "unknown" | "loss" | "pays-back";
  /** The commonly cited payback reference, in months (12): a dotted line that situates, never judges. */
  reference: number | null;
  labels: {
    /** « 0 », « 36 mois »: the axis's two ends. */
    start: string;
    end: string;
    /** « 12 mois · repère couramment cité ». */
    reference: string;
    cost: string;
    /** No margin or lifetime: « il manque la marge brute ». */
    unknown: string;
    leaves: string;
    /** Loss: « rembourserait à 21 mois »; otherwise « remboursé : 11 mois ». */
    paysBack: string;
    /** Loss: « il manque ~400 € ». */
    short: string;
    /** Pays back: « ~22 mois de marge après ». */
    after: string;
    /** Compact (the hybrid's two columns): the time story on the axis row, « part vers 17 mois ; rembourserait à 21 mois ». */
    time: string;
  };
  /** The chart in words, for a screen reader. */
  summary: string;
}
export interface SlideLeverSumRow {
  id: string;
  label: string;
  value: string;
  /** The gain on the MRR in twelve months, the middle of its range: the bar's length. */
  amount: number;
}
export interface SlideLeverSum {
  rows: SlideLeverSumRow[];
  sum: SlideLeverSumRow;
  together: SlideLeverSumRow;
}
/** One motion's chrome in the hybrid: its kicker names it, its pill counts its numbers, its footer cites its months and tools. */
export interface DeckMotionChrome {
  kicker: string;
  dataPill: { measured: number; approximate: number; missing: number };
  footer: string;
}
export interface DeckModel {
  slides: DeckSlide[];
  /** Non-blocking checks shown above the thumbnails: "{n} things to check before presenting". */
  checks: SanityCheck[];
  /** The deck's pill: the ticked motions together (the link never counted). */
  dataPill: { measured: number; approximate: number; missing: number };
  kicker: Record<string, string>;
  footer: Record<string, string>;
  /** The hybrid only: each motion's slides wear their own kicker, pill and footer (§18.8.1). */
  byMotion?: Record<Motion, DeckMotionChrome>;
}

/** One ticked motion, read on its own (§18.6.1): its coverage, its funnel, its diagnosis, its unit economics. */
export type MotionDerived =
  | { motion: "plg"; coverage: Coverage; peloton: Peloton; diagnosis: Diagnosis<PlgCandidateId>; unit: UnitEconomics }
  | { motion: "slg"; coverage: Coverage; relays: Relays; diagnosis: SlgDiagnosis; unit: SlgUnitEconomics };

/**
 * « Un total » (§18.6.2), the hybrid only. A sum exists only when both of its
 * parts do (S9): with one unknown, the total is `uncomputable` and names it —
 * never the known part passed off as the total.
 */
export interface TotalView {
  mrr: Record<Motion | "total", DerivedValue>;
  newMrrPerMonth: Record<Motion | "total", DerivedValue>;
  /** At the current pace, without any what-if (C25 Q11). */
  mrrIn12Months: Record<Motion | "total", DerivedValue>;
  /** « {n} opportunités sont venues du libre-service » (A18.d) : the opportunities from self-serve accounts, not an attribution. */
  link: { known: Known; fromSelfServe: number | null; oppsCreated: number | null };
}

// --- The monthly series (§19.2, A14 T1): computed by series.ts, never stored. ---

/**
 * Why two months of a number don't compare (§19.2.5). `month` says which of
 * the two the status reason is about: the board writes « estimé en août », or
 * says nothing on the month being filled.
 */
export type Incomparable =
  /** Its variant, its window or its definition note changed. */
  | { why: "definition-changed" }
  /** Counts one month, a rate typed directly the other: two different readings. */
  | { why: "entered-differently" }
  | { why: "not-measured" | "estimated" | "conflicting"; month: "before" | "now" };

export type Comparison = { comparable: true; before: number; now: number } | ({ comparable: false } & Incomparable);

/**
 * How far a number moved (§19.2.5): a rate in points (« +6 pts »), money and
 * durations in value and in percent of the month before (« +1 200 € ·
 * +8 % », the percent `null` from a zero), a plain ratio in value. Signed:
 * the screen writes the sign and an arrow, never a colour.
 */
export type Delta = { kind: "points"; change: number } | { kind: "relative"; change: number; percent: number | null } | { kind: "value"; change: number };

export interface SeriesRow {
  metric: MetricId;
  comparison: Comparison;
  /** Comparable only. */
  delta?: Delta;
  towardTarget?: boolean;
}

export interface MotionSeries {
  motion: Motion;
  /** Every number of the motion that is a number, in catalogue order — AARRR, never sorted by how far it moved. */
  rows: SeriesRow[];
  /** The stage(s) the month before named, when it named one; `[]` otherwise. */
  previousLeak: CandidateId[];
  /** This month names another leak than the month before did (« En août, la fuite était Activation »). */
  leakChanged: boolean;
}

export interface Series {
  /** The month before the one being filled, and that one. */
  previousMonth: YearMonth;
  month: YearMonth;
  /** How many months the engine holds. */
  months: number;
  /** The ticked motions, in `MOTIONS` order. */
  motions: MotionSeries[];
}

/**
 * Everything the board renders, computed in one pass from the state.
 *
 * `motions` holds the ticked motions, in `MOTIONS` order — never sorted by a
 * value (§18.6.4). `coverage` is their union, the link left out. `peloton`,
 * `diagnosis` and `unit` are SELF-SERVE's, where every v1 screen and the
 * deck read them; they are the very objects of the `plg` entry of `motions`
 * when self-serve is ticked, and describe an empty self-serve otherwise.
 * The hybrid's screens (S3) and deck (S4) read `motions`, and these three go
 * when the last v1 reader does.
 */
export interface EngineDerived {
  coverage: Coverage;
  peloton: Peloton;
  diagnosis: Diagnosis<PlgCandidateId>;
  unit: UnitEconomics;
  motions: MotionDerived[];
  /** null outside the hybrid. */
  total: TotalView | null;
  sanity: SanityCheck[];
  findings: Finding[];
  mirror: Mirror | null;
  /** The last two months side by side (§19.2.5): absent while the engine holds one month, so a v1 or v2 file derives as it did. */
  series?: Series;
}

