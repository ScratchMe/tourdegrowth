import type { AppMonetization } from "./app-model";
import { ENGINE_SCHEMA_VERSION, type BusinessType, type EngineState, type LeverId, type MetricEntry, type MetricId, type MetricValue, type MktMetricId, type Motion, type SharedCount, type SourceRef, type ToolId } from "./types";

/**
 * The engine spec's §6.0 example — a fictional self-serve SaaS, reference
 * month 2026-08, followed cohort 2026-07, EUR, activation within 7 days,
 * payment within 30. ONE data set: the unit tests and e2e specs read it
 * through `__tests__/fixtures.ts`, and the page shows it as « Voir un
 * exemple rempli » (Antoine, 2026-09-25: « il faut qu'on montre un exemple
 * plausible de slides et funnel remplis »), so the example on screen is the
 * one every test checks.
 *
 * The only words in it — the activation event, the top channel's name, the
 * company — are passed in, in the reader's language; everything else is
 * numbers. RELATIVE imports only: Playwright specs reach this file through
 * the fixtures.
 */

const tool = (t: ToolId): SourceRef => ({ kind: "tool", tool: t });
const at = "2026-09-20T10:00:00.000Z";

function ratio(numerator: number, denominator: number): MetricValue {
  return { kind: "ratio", numerator, denominator };
}

function measured(value: MetricValue, source: SourceRef, extra: Partial<MetricEntry> = {}): MetricEntry {
  return { status: "measured", value, source, updatedAt: at, ...extra };
}

export interface ExampleWords {
  /** « a créé un premier projet » — the activation event, as a team would name it. */
  event: string;
  /** « Recherche naturelle » — the top channel. */
  channel: string;
  /** Printed on the slides when given. */
  company?: string;
  /** The hybrid's words (§18.9.1): what « live » means, the main reason for non-renewal, the PQL threshold. Only read when sales-assisted is shown. */
  liveEvent?: string;
  lossCause?: string;
  pqlThreshold?: string;
  /** « l'essai se termine avant la troisième séance » — the main reason subscribers leave. Only read by `exampleConsumerMetrics` (§21.9.1). */
  churnCause?: string;
}

export function exampleMetrics(words: ExampleWords): Partial<Record<MetricId, MetricEntry>> {
  return {
    "acq.signup-rate": measured(ratio(820, 26_000), tool("ga4")),
    "acq.top-channel-share": measured(ratio(410, 820), tool("ga4"), { label: words.channel }),
    "acq.cac": measured(ratio(21_000, 42), { kind: "person", role: "finance" }, { variant: "media-only" }),
    "act.event": measured({ kind: "text", text: words.event }, { kind: "other" }),
    "act.rate": measured(ratio(144, 800), tool("amplitude")),
    "act.ttv": { status: "estimated", estimate: { low: 1, high: 3, basis: "team-hunch" }, variant: "median", updatedAt: at },
    "ret.d30": { status: "missing", missing: { cause: "not-tracked", repair: "sprint", ownerRole: "data" }, updatedAt: at },
    "ret.logo-churn": measured(ratio(10, 400), tool("stripe")),
    "ret.churn-cause": { status: "missing", missing: { cause: "no-definition", repair: "meeting" }, updatedAt: at },
    "ref.mechanism": measured({ kind: "choice", choice: "product" }, { kind: "other" }),
    "ref.referred-share": measured(ratio(48, 800), tool("product-db")),
    "ref.k-factor": { status: "requested", request: { role: "data", requestedAt: "2026-09-20T09:00:00.000Z" }, updatedAt: at },
    "rev.paid-conversion": { status: "estimated", estimate: { low: 6, high: 9, basis: "old-number" }, updatedAt: at },
    "rev.arpa": measured(ratio(48_000, 400), tool("stripe")),
    // C50 (Antoine, 2026-10-03): an estimated margin, 70 to 80 %, so the example shows its money in ranges — healthy,
    // paid back in 5 to 6 months, LTV:CAC of 6 to 7, neither loss nor warning. It was missing until A20.d T6.
    "rev.gross-margin": { status: "estimated", estimate: { low: 70, high: 80, basis: "old-number" }, updatedAt: at },
    // MRR movements (2026-09-26), on the MRR of 1 August — 46 800 €, before the month's new customers took it to 48 000.
    "rev.expansion": measured(ratio(1_440, 46_800), tool("stripe")),
    "rev.contraction": measured(ratio(480, 46_800), tool("stripe")),
  };
}

/**
 * The fictional team's own targets. Only a team target names the stage that
 * holds the engine back (decision 5, reversed 2026-09-29, `CHANTIERS.md` C1):
 * without them the example would name nothing. They are the values the two
 * published references used to lend it, so its diagnosis — activation, ~600 €
 * a month, `clear` against churn's ~240 € — is the one ENGINE.md §6.6 works
 * through. The example's banner says whose targets they are.
 */
export const EXAMPLE_TARGETS: Partial<Record<MetricId, number>> = { "act.rate": 20, "ret.logo-churn": 2 };

/**
 * The engine spec's §18.9 example — the same fictional company, now also
 * selling through a sales team (§18.9.1). Periods: flows June to August, the
 * leads of May to July (July is mature at 30 days), the new customers of
 * March to May (May is mature at 90 days). Fictional, targets included.
 */
export function exampleSlgMetrics(words: ExampleWords): Partial<Record<MetricId, MetricEntry>> {
  return {
    "slg.acq.lead-to-opp": measured(ratio(72, 480), tool("hubspot"), { variant: "mql", cohortMonth: "2026-07" }),
    "slg.acq.cac": measured(ratio(342_000, 18), { kind: "person", role: "finance" }, { variant: "fully-loaded" }),
    "slg.acq.cycle": measured({ kind: "duration", value: 64, unit: "days", statistic: "median" }, tool("hubspot")),
    "slg.act.live-event": measured({ kind: "text", text: words.liveEvent ?? "" }, { kind: "other" }),
    "slg.act.go-live": { status: "missing", missing: { cause: "not-tracked", repair: "sprint", ownerRole: "customer-success" }, updatedAt: at },
    "slg.ret.renewal": measured(ratio(22, 25), tool("hubspot"), { variant: "annual" }),
    "slg.ret.nrr": { status: "estimated", estimate: { low: 104, high: 108, basis: "old-number" }, updatedAt: at },
    "slg.ret.loss-cause": measured({ kind: "text", text: words.lossCause ?? "" }, { kind: "other" }, { evidence: "hunch" }),
    "slg.ref.referred-share": measured(ratio(26, 130), tool("hubspot"), { variant: "customers-and-partners" }),
    "slg.ref.referenceable": { status: "requested", request: { role: "marketing", requestedAt: "2026-09-21T09:00:00.000Z" }, updatedAt: at },
    "slg.rev.win-rate": measured(ratio(18, 75), tool("hubspot")),
    "slg.rev.acv": measured(ratio(432_000, 18), tool("hubspot")),
    "slg.rev.arpa": measured(ratio(180_000, 100), tool("stripe")),
    "slg.rev.gross-margin": { status: "missing", missing: { cause: "no-access", repair: "meeting", ownerRole: "finance" }, updatedAt: at },
  };
}

/** The link, the hybrid's only: 31 of the 130 opportunities came from self-serve accounts (§18.9.1). */
export function exampleLinkMetrics(words: ExampleWords): Partial<Record<MetricId, MetricEntry>> {
  return {
    "link.pql-handoff": measured(ratio(31, 130), tool("hubspot"), words.pqlThreshold ? { definitionNote: words.pqlThreshold } : {}),
  };
}

/** The fictional sales team's targets (§18.9.1): lead → opportunity 18 %, win rate 32 %, renewal 92 %. */
export const EXAMPLE_SLG_TARGETS: Partial<Record<MetricId, number>> = { "slg.acq.lead-to-opp": 18, "slg.rev.win-rate": 32, "slg.ret.renewal": 92 };

/** The three sales-assisted counts, typed once (S6). */
export const EXAMPLE_SLG_BASE: Partial<Record<SharedCount, number>> = { slgOppsCreated: 130, slgDealsWon: 18, slgCustomers: 100 };

/**
 * The fictional consumer app's own targets (§21.9.1): day-30 retention 15 %, subscriber conversion 4 %, the actives'
 * retention 92 %. Only a team target names the stage that holds the engine back (C1), as for the SaaS above.
 */
export const EXAMPLE_CONSUMER_TARGETS: Partial<Record<MetricId, number>> = { "ret.d30": 15, "rev.paid-conversion": 4, "app.ret.active-retention": 92 };

/**
 * The consumer app example's « Et si » (§21.9.1): day-30 retention at 15 % and the stores' commission at 15 % (the
 * reduced-rate program). A constant, never put in the example's state: the tests and the golden apply it with
 * `{ ...consumerState(), whatIf: EXAMPLE_CONSUMER_WHATIF }`, or as the scenario's targets.
 */
export const EXAMPLE_CONSUMER_WHATIF: Partial<Record<LeverId, number>> = { "ret.d30": 15, "app.rev.commission": 15 };

/** The consumer app example's five shared counts (§21.9.1): the August installs, the July cohort, the two MRRs and the August actives. */
export const EXAMPLE_CONSUMER_BASE: Partial<Record<SharedCount, number>> = { monthSignups: 12_000, cohortSignups: 11_500, mrrEnd: 28_800, mrrStart: 28_400, appActives: 15_000 };

/**
 * The consumer app of §21.9.1 — a fictional guided-meditation app — entry by entry, whatever it earns from (a way of
 * earning unticked hides its numbers without erasing them, §21.1 D7). The words are the activation event, the top
 * channel and the main reason subscribers leave. The sources are the table's: a tool, "product" (`other`), "data" and
 * "finance" (a person of that role).
 */
export function exampleConsumerMetrics(words: ExampleWords): Partial<Record<MetricId, MetricEntry>> {
  const data: SourceRef = { kind: "person", role: "data" };
  const finance: SourceRef = { kind: "person", role: "finance" };
  return {
    "acq.signup-rate": measured(ratio(12_000, 40_000), tool("app-store-connect")),
    "acq.top-channel-share": measured(ratio(5_400, 12_000), tool("app-store-connect"), { label: words.channel }),
    "act.event": measured({ kind: "text", text: words.event }, { kind: "other" }),
    "act.rate": measured(ratio(4_025, 11_500), tool("amplitude")),
    "act.ttv": measured({ kind: "duration", value: 3, unit: "hours", statistic: "median" }, tool("amplitude"), { variant: "median" }),
    "ret.d30": measured(ratio(1_380, 11_500), tool("amplitude")),
    "ret.logo-churn": measured(ratio(315, 4_500), tool("revenuecat")),
    "ret.churn-cause": measured({ kind: "text", text: words.churnCause ?? "" }, data, { evidence: "data" }),
    "ref.mechanism": measured({ kind: "choice", choice: "product" }, { kind: "other" }),
    "ref.referred-share": measured(ratio(575, 11_500), tool("product-db")),
    "ref.k-factor": { status: "requested", request: { role: "data", requestedAt: "2026-09-20T09:00:00.000Z" }, updatedAt: at },
    "rev.paid-conversion": measured(ratio(345, 11_500), tool("revenuecat")),
    "rev.arpa": measured(ratio(28_800, 4_500), tool("revenuecat")),
    "rev.expansion": measured(ratio(284, 28_400), tool("revenuecat")),
    "rev.contraction": measured(ratio(142, 28_400), tool("revenuecat")),
    "app.acq.cpi": measured(ratio(18_000, 12_000), tool("appsflyer"), { variant: "media-only" }),
    "app.ret.active-retention": measured(ratio(13_500, 15_000), tool("amplitude")),
    "app.rev.purchases-per-active": measured(ratio(4_500, 15_000), tool("revenuecat")),
    "app.rev.ads-per-active": measured(ratio(6_000, 15_000), finance),
    "app.rev.commission": measured(ratio(7_326, 33_300), tool("revenuecat")),
    "app.rev.gross-margin": measured(ratio(25_579.2, 31_974), finance),
  };
}

/**
 * The fictional marketplace's own targets (§22.10.1): the buyers' first order 25 % and the fill rate 12 %; the sellers'
 * first sale 40 %, the conversion to a paid seller 20 % and the paid sellers' churn 2,5 %. Only a team target names the
 * stage that holds a side back (C1), as for the SaaS above.
 */
export const EXAMPLE_MKT_TARGETS: Partial<Record<MetricId, number>> = {
  "mkt.buy.first-order": 25,
  "mkt.liq.fill-rate": 12,
  "mkt.sell.first-sale": 40,
  "mkt.sell.paid-conversion": 20,
  "mkt.sell.paid-churn": 2.5,
};

/**
 * The marketplace example's « Et si » (§22.10.1): the fill rate at 12 %, the first order at 25 % and the take rate at
 * 13 % (the buyers'); the conversion to a paid seller at 20 % (the sellers'). A constant, never put in the example's
 * state, like the app's. Keyed by the marketplace's ids: `LeverId` has widened to them since MKT-3 (§22.2.1), so the
 * type accepts this constant as it stands.
 */
export const EXAMPLE_MKT_WHATIF: Partial<Record<MktMetricId, number>> = {
  "mkt.liq.fill-rate": 12,
  "mkt.buy.first-order": 25,
  "mkt.rev.take-rate": 13,
  "mkt.sell.paid-conversion": 20,
};

/** The marketplace example's six shared counts (§22.10.1): the May buyers and sellers cohorts, August's orders, GMV and net revenue, and the sellers' subscription MRR. */
export const EXAMPLE_MKT_BASE: Partial<Record<SharedCount, number>> = {
  mktCohortSignups: 2_900,
  mktOrders: 4_212,
  mktGmv: 273_780,
  mktNetRevenue: 32_853.6,
  mktSellerCohortSignups: 420,
  mktSellerMrrEnd: 26_100,
};

/**
 * The fictional marketplace of §22.10.1 — second-hand furniture, both sides — entry by entry, whatever the sellers pay
 * (a subscription box left unticked hides its five numbers without erasing them, D9). Flows are August's, the buyers'
 * and sellers' cohorts May's (mature for the 90-day window on the example's 24 September). No word is typed in it: no
 * entry of the example has a free text, so it takes none.
 */
export function exampleMarketplaceMetrics(): Partial<Record<MetricId, MetricEntry>> {
  return {
    "mkt.buy.signup-rate": measured(ratio(3_000, 60_000), tool("ga4")),
    "mkt.buy.cac": measured(ratio(18_000, 600), tool("google-ads"), { variant: "media-only" }),
    "mkt.sell.cac": measured(ratio(12_000, 120), tool("spreadsheet"), { variant: "media-only" }),
    "mkt.sell.signup-rate": measured(ratio(400, 8_000), tool("ga4")),
    "mkt.buy.first-order": measured(ratio(580, 2_900), tool("product-db")),
    "mkt.sell.first-sale": measured(ratio(126, 420), tool("product-db")),
    "mkt.liq.fill-rate": measured(ratio(2_340, 26_000), tool("amplitude"), { variant: "searches" }),
    "mkt.buy.repeat": measured(ratio(145, 2_900), tool("product-db")),
    "mkt.buy.churn": measured(ratio(560, 14_000), tool("product-db")),
    "mkt.sell.churn": measured(ratio(96, 3_200), tool("product-db")),
    "mkt.sell.paid-churn": measured(ratio(27, 900), tool("stripe")),
    "mkt.buy.referred-share": measured(ratio(232, 2_900), tool("product-db")),
    "mkt.rev.take-rate": measured(ratio(32_853.6, 273_780), tool("stripe")),
    "mkt.rev.aov": measured(ratio(273_780, 4_212), tool("product-db")),
    "mkt.rev.frequency": measured(ratio(4_212, 14_040), tool("product-db")),
    "mkt.rev.gross-margin": { status: "estimated", estimate: { low: 55, high: 65, basis: "old-number" }, updatedAt: at },
    "mkt.sell.paid-conversion": measured(ratio(63, 420), tool("stripe")),
    "mkt.sell.arpa": measured(ratio(26_100, 900), tool("stripe")),
    "mkt.sell.gross-margin": measured(ratio(22_185, 26_100), tool("spreadsheet")),
  };
}

/**
 * A fresh copy each call: callers may change it (the example's own slide
 * choices live in memory only). `motions` shows the example in the motions
 * ticked at setup (§18.9): self-serve alone is exactly §6.0, untouched.
 *
 * `type` "consumer-app" (§21.9.1) builds the app of `exampleConsumerMetrics` instead, earning from `monetization`
 * (the example's three ways when absent): it is self-serve only, and sales-assisted is refused.
 */
export function exampleEngine(
  words: ExampleWords,
  motions: Record<Motion, boolean> = { plg: true, slg: false },
  type: BusinessType = "b2b-saas",
  monetization?: AppMonetization,
): EngineState {
  const app = type === "consumer-app";
  if (app && motions.slg) throw new Error("The consumer app example has no sales-assisted motion");
  const hybrid = motions.plg && motions.slg;
  const metrics = app
    ? exampleConsumerMetrics(words)
    : {
        ...(motions.plg ? exampleMetrics(words) : {}),
        ...(motions.slg ? exampleSlgMetrics(words) : {}),
        ...(hybrid ? exampleLinkMetrics(words) : {}),
      };
  const targets = app ? { ...EXAMPLE_CONSUMER_TARGETS } : { ...(motions.plg ? EXAMPLE_TARGETS : {}), ...(motions.slg ? EXAMPLE_SLG_TARGETS : {}) };
  return structuredClone({
    schemaVersion: ENGINE_SCHEMA_VERSION,
    id: "00000000-0000-4000-8000-000000000060",
    createdAt: "2026-09-24T08:00:00.000Z",
    updatedAt: "2026-09-24T09:00:00.000Z",
    setup: {
      type,
      motions: { ...motions },
      currency: "EUR",
      activationWindowDays: 7,
      paidWindowDays: 30,
      qualificationWindowDays: 30,
      goLiveWindowDays: 90,
      ...(app ? { monetization: { ...(monetization ?? { subscriptions: true, purchases: true, ads: true }) } } : {}),
      ...(words.company ? { companyLabel: words.company } : {}),
    },
    snapshots: [
      {
        id: "00000000-0000-4000-8000-000000000061",
        referenceMonth: "2026-08",
        cohortMonth: "2026-07",
        createdAt: "2026-09-24T08:00:00.000Z",
        metrics,
        targets,
        ...(app ? { base: { ...EXAMPLE_CONSUMER_BASE } } : motions.slg ? { base: { ...EXAMPLE_SLG_BASE } } : {}),
      },
    ],
    tourLink: null,
    deck: {
      include: {},
      showCompany: Boolean(words.company),
      showSiteCredit: true,
      ask: { what: "", bullets: [], measureFirst: [] },
    },
  } satisfies EngineState);
}

/** The day the example was computed on — its cohort is mature on that day. */
export const EXAMPLE_TODAY_ISO = "2026-09-24T09:00:00.000Z";
