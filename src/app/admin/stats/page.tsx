import type { Metadata } from "next";
import { Card } from "@/components/core/Card";
import { MetaLabel } from "@/components/brand/MetaLabel";
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

/**
 * Internal-only dashboard, English-only on purpose (single operator, not a
 * user-facing surface — no `resolveRequestLocale()`/`tc()` needed here, the
 * one exception to the app's bilingual-everywhere rule). Reads the whole
 * `submissions` collection on every load via `computeGrowthStats()` — see
 * that file for why an in-memory aggregation is the right amount of
 * engineering at this volume.
 */
export default async function AdminStatsPage() {
  const stats = await computeGrowthStats();

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

      <section className={styles.grid}>
        <Card elevation="raised" tone="outlineAlert" className={styles.stat}>
          <MetaLabel size="xs">K-factor</MetaLabel>
          <p className={styles.number}>{stats.kFactor.toFixed(2)}</p>
          <p className={styles.detail}>SPEC.md §7 — referred submissions ÷ unique sharers</p>
        </Card>
        <Card elevation="raised" className={styles.stat}>
          <MetaLabel size="xs">Referred submissions</MetaLabel>
          <p className={styles.number}>{stats.referredSubmissions}</p>
        </Card>
        <Card elevation="raised" className={styles.stat}>
          <MetaLabel size="xs">Unique sharers</MetaLabel>
          <p className={styles.number}>{stats.uniqueSharers}</p>
        </Card>
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
