import type { EngineState, MetricEntry, MetricId, MetricValue, SourceRef, ToolId } from "./types";

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
  };
}

/** A fresh copy each call: callers may change it (the example's own slide choices live in memory only). */
export function exampleEngine(words: ExampleWords): EngineState {
  return structuredClone({
    schemaVersion: 1,
    id: "00000000-0000-4000-8000-000000000060",
    createdAt: "2026-09-24T08:00:00.000Z",
    updatedAt: "2026-09-24T09:00:00.000Z",
    setup: {
      profile: "selfserve",
      currency: "EUR",
      activationWindowDays: 7,
      paidWindowDays: 30,
      ...(words.company ? { companyLabel: words.company } : {}),
    },
    snapshots: [
      {
        id: "00000000-0000-4000-8000-000000000061",
        referenceMonth: "2026-08",
        cohortMonth: "2026-07",
        createdAt: "2026-09-24T08:00:00.000Z",
        metrics: exampleMetrics(words),
        targets: {},
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
