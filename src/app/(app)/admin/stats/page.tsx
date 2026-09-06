import type { Metadata } from "next";
import { Card } from "@/components/core/Card";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { fetchFunnelStats, type FunnelWindow } from "@/lib/analytics/goatcounter-api";
import { computeGrowthStats } from "@/lib/submissions/growth-stats";
import styles from "./page.module.css";

// Real submission volume/K-factor numbers — never cache this behind Next's
// data cache or a static render. proxy.ts already gates every request under
// /admin behind ADMIN_DASHBOARD_PASSWORD; this page has no auth logic of its
// own, it just trusts having been let through.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Tour de Growth",
  robots: { index: false, follow: false },
};

function pct(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

function FunnelCard({ window }: { window: FunnelWindow }) {
  return (
    <Card elevation="panel" className={styles.breakdown}>
      <MetaLabel size="xs" wide>{window.label}</MetaLabel>
      {window.stats ? (
        <>
          <p className={styles.number}>
            {window.stats.rate === null ? "—" : pct(window.stats.rate)}
          </p>
          <p className={styles.detail}>
            {window.stats.profileClicks} profile clicks / {window.stats.homeViews} homepage views
          </p>
        </>
      ) : (
        <p className={styles.detail}>Unavailable — {window.error}</p>
      )}
    </Card>
  );
}

/** `n` as a share of `of`, or "—" when there is nothing to divide by. */
function ratio(n: number, of: number): string {
  return of > 0 ? pct(n / of) : "—";
}

/**
 * Where people actually drop out — REVIEW.md R-11. Until this existed only
 * the two ends of the funnel were measured, so "how many finished" was
 * knowable and "where the rest left" was not.
 */
function FunnelBreakdown({ window }: { window: FunnelWindow }) {
  const stats = window.stats;

  return (
    <Card elevation="panel" className={styles.breakdown}>
      <MetaLabel size="xs" wide>{window.label} — drop-off</MetaLabel>
      {stats ? (
        <ul className={styles.list}>
          <li>Homepage views — {stats.homeViews}</li>
          <li>
            Quiz started — {stats.quizStarted} ({ratio(stats.quizStarted, stats.homeViews)} of views)
          </li>
          {stats.stagesCompleted.map((count, i) => (
            <li key={i}>
              Stage {i + 1} done — {count} ({ratio(count, stats.quizStarted)} of starts)
            </li>
          ))}
          <li>
            Tone chosen — {stats.toneSelected} ({ratio(stats.toneSelected, stats.quizStarted)} of starts)
          </li>
          <li>
            Result created — {stats.submissionsCompleted} (
            {ratio(stats.submissionsCompleted, stats.quizStarted)} of starts)
          </li>
          <li>
            Shared — {stats.shares} ({ratio(stats.shares, stats.submissionsCompleted)} of results)
          </li>
          <li>
            Visitor clicked into their own Tour — {stats.ownTourClicks} ({ratio(stats.ownTourClicks, stats.shares)} of
            shares)
          </li>
          <li>
            Deep dive started — {stats.deepDiveStarted} (
            {ratio(stats.deepDiveStarted, stats.submissionsCompleted)} of results)
          </li>
          <li>
            Deep dive completed — {stats.deepDiveCompleted} (
            {ratio(stats.deepDiveCompleted, stats.deepDiveStarted)} of starts)
          </li>
        </ul>
      ) : (
        <p className={styles.detail}>Unavailable — {window.error}</p>
      )}
    </Card>
  );
}

/**
 * Internal-only dashboard, English-only on purpose (single operator, not a
 * user-facing surface — no `resolveRequestLocale()`/`tc()` needed here, the
 * one exception to the app's bilingual-everywhere rule). Reads the whole
 * `submissions` collection on every load via `computeGrowthStats()` — see
 * that file for why an in-memory aggregation is the right amount of
 * engineering at this volume.
 */
export default async function AdminStatsPage() {
  const [stats, funnelWindows] = await Promise.all([computeGrowthStats(), fetchFunnelStats()]);
  // Conversion per share — REVIEW-02.md R2-01. Firestore knows who was
  // referred; only GoatCounter knows how many times a result was shared. The
  // all-time window is the one whose share count matches an all-time referral
  // count; null when GoatCounter is unavailable or nothing was shared yet.
  const allTimeShares = funnelWindows.find((w) => w.label === "All-time")?.stats?.shares ?? null;
  const conversionPerShare =
    allTimeShares !== null && allTimeShares > 0 ? stats.referredSubmissions / allTimeShares : null;

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Growth stats</h1>
      <p className={styles.subtitle}>Live from Firestore — reloads recompute everything, nothing is cached.</p>

      <section className={styles.grid}>
        <Card elevation="raised" className={styles.stat}>
          <MetaLabel size="xs">Total analyses</MetaLabel>
          <p className={styles.number}>{stats.totalSubmissions}</p>
        </Card>
        <Card elevation="raised" className={styles.stat}>
          <MetaLabel size="xs">Last 7 days</MetaLabel>
          <p className={styles.number}>{stats.last7Days}</p>
        </Card>
        <Card elevation="raised" className={styles.stat}>
          <MetaLabel size="xs">Last 30 days</MetaLabel>
          <p className={styles.number}>{stats.last30Days}</p>
        </Card>
        <Card elevation="raised" className={styles.stat}>
          <MetaLabel size="xs">Average score</MetaLabel>
          <p className={styles.number}>{stats.averageScore.toFixed(1)}</p>
        </Card>
      </section>

      <section className={styles.grid}>
        <Card elevation="raised" className={styles.stat}>
          <MetaLabel size="xs">Deep dive completion</MetaLabel>
          <p className={styles.number}>{pct(stats.deepDiveCompletionRate)}</p>
          <p className={styles.detail}>{stats.deepDiveCompleted} of {stats.totalSubmissions}</p>
        </Card>
        <Card elevation="raised" className={styles.stat}>
          <MetaLabel size="xs">Free context filled in</MetaLabel>
          <p className={styles.number}>{pct(stats.freeContextRate)}</p>
          <p className={styles.detail}>{stats.freeContextProvided} of {stats.deepDiveCompleted} Deep dives</p>
        </Card>
      </section>

      {/* REVIEW-02.md R2-01. The card used to divide by "unique sharers",
          which Firestore cannot see — it only sees the results whose link
          converted someone, so the ratio was ≥ 1 by construction whenever it
          was defined. Two honest numbers instead: K over all results, and
          how often a share turns into a result (GoatCounter share events). */}
      <section className={styles.grid}>
        <Card elevation="raised" tone="outlineAlert" className={styles.stat}>
          <MetaLabel size="xs">K-factor</MetaLabel>
          <p className={styles.number}>{stats.kFactor.toFixed(2)}</p>
          <p className={styles.detail}>
            {stats.referredSubmissions} referred ÷ {stats.totalSubmissions} results — new analyses per analysis
          </p>
        </Card>
        <Card elevation="raised" className={styles.stat}>
          <MetaLabel size="xs">Conversion per share</MetaLabel>
          <p className={styles.number}>{conversionPerShare === null ? "—" : pct(conversionPerShare)}</p>
          <p className={styles.detail}>
            {allTimeShares === null
              ? "share count unavailable (GoatCounter)"
              : `${stats.referredSubmissions} referred ÷ ${allTimeShares} share events (all-time)`}
          </p>
        </Card>
        <Card elevation="raised" className={styles.stat}>
          <MetaLabel size="xs">Referred submissions</MetaLabel>
          <p className={styles.number}>{stats.referredSubmissions}</p>
        </Card>
        <Card elevation="raised" className={styles.stat}>
          <MetaLabel size="xs">Converting results</MetaLabel>
          <p className={styles.number}>{stats.convertingResults}</p>
          <p className={styles.detail}>
            results whose link brought ≥ 1 analysis — {stats.referralsPerConvertingResult.toFixed(2)} each
          </p>
        </Card>
      </section>

      <MetaLabel size="xs" wide className={styles.sectionLabel}>
        Homepage → profile click (GoatCounter)
      </MetaLabel>
      <section className={styles.breakdownRow}>
        {funnelWindows.map((window) => (
          <FunnelCard key={window.label} window={window} />
        ))}
      </section>

      <MetaLabel size="xs" wide className={styles.sectionLabel}>
        Funnel (GoatCounter events)
      </MetaLabel>
      <section className={styles.breakdownRow}>
        {funnelWindows.map((window) => (
          <FunnelBreakdown key={window.label} window={window} />
        ))}
      </section>

      <section className={styles.breakdownRow}>
        <Card elevation="panel" className={styles.breakdown}>
          <MetaLabel size="xs" wide>By tone</MetaLabel>
          <ul className={styles.list}>
            <li>Neutral — {stats.byTone.neutral}</li>
            <li>Roast — {stats.byTone.roast}</li>
          </ul>
        </Card>
        <Card elevation="panel" className={styles.breakdown}>
          <MetaLabel size="xs" wide>By locale</MetaLabel>
          <ul className={styles.list}>
            <li>English — {stats.byLocale.en}</li>
            <li>French — {stats.byLocale.fr}</li>
          </ul>
        </Card>
      </section>
    </main>
  );
}
