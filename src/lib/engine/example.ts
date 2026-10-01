import type { EngineState, MetricEntry, MetricId, MetricValue, Motion, SharedCount, SourceRef, ToolId } from "./types";

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
    "rev.gross-margin": { status: "missing", missing: { cause: "no-access", repair: "meeting", ownerRole: "finance" }, updatedAt: at },
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
 * A fresh copy each call: callers may change it (the example's own slide
 * choices live in memory only). `motions` shows the example in the motions
 * ticked at setup (§18.9): self-serve alone is exactly §6.0, untouched.
 */
export function exampleEngine(words: ExampleWords, motions: Record<Motion, boolean> = { plg: true, slg: false }): EngineState {
  const hybrid = motions.plg && motions.slg;
  const metrics = {
    ...(motions.plg ? exampleMetrics(words) : {}),
    ...(motions.slg ? exampleSlgMetrics(words) : {}),
    ...(hybrid ? exampleLinkMetrics(words) : {}),
  };
  const targets = { ...(motions.plg ? EXAMPLE_TARGETS : {}), ...(motions.slg ? EXAMPLE_SLG_TARGETS : {}) };
  return structuredClone({
    schemaVersion: 2,
    id: "00000000-0000-4000-8000-000000000060",
    createdAt: "2026-09-24T08:00:00.000Z",
    updatedAt: "2026-09-24T09:00:00.000Z",
    setup: {
      type: "b2b-saas",
      motions: { ...motions },
      currency: "EUR",
      activationWindowDays: 7,
      paidWindowDays: 30,
      qualificationWindowDays: 30,
      goLiveWindowDays: 90,
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
        ...(motions.slg ? { base: { ...EXAMPLE_SLG_BASE } } : {}),
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
