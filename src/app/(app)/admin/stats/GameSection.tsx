import { Card } from "@/components/core/Card";
import { MetaLabel } from "@/components/brand/MetaLabel";
import type { FunnelWindow } from "@/lib/analytics/goatcounter-api";
import { GAME_ENDINGS } from "@/lib/game/events";
import type { GrowthStats } from "@/lib/submissions/growth-stats";
import { gamePass } from "./game";
import styles from "./page.module.css";

/** `n` as a share of `of`, or "—" when there is nothing to divide by. */
function share(n: number, of: number): string {
  return of > 0 ? `${Math.round((n / of) * 100)}%` : "—";
}

/**
 * The game's block of /admin/stats — GAME-BRIEF.md §13.5 and plan §3.8.
 * English like the rest of this page (single operator, not a product
 * surface). Everything reads zero until the game is opened; the 30-day
 * window is the one that says something in the first month after.
 */
function GameCard({ window, growth }: { window: FunnelWindow; growth: Pick<GrowthStats, "retentionBottleneckResults"> }) {
  const game = window.stats?.game;
  const pass = gamePass(window, growth);

  if (!game || !pass) {
    return (
      <Card elevation="panel" className={styles.breakdown}>
        <MetaLabel size="xs" wide>{window.label} — the game</MetaLabel>
        <p className={styles.detail}>Unavailable — {window.error}</p>
      </Card>
    );
  }

  const started = Object.values(game.started).reduce((a, b) => a + b, 0);

  return (
    <Card elevation="panel" className={styles.breakdown}>
      <MetaLabel size="xs" wide>{window.label} — the game</MetaLabel>

      <p className={styles.detail}>
        {/* §13.5 — the number the result card's placement rule turns on.
            Not a percentage: visitors of a shared result see the card too,
            so one result can produce several clicks. */}
        Result → game —{" "}
        <strong>{pass.clicksPerResult === null ? "—" : pass.clicksPerResult.toFixed(2)}</strong> clicks per
        retention-bottleneck result ({pass.resultClicks} clicks / {pass.retentionResults ?? "?"} results)
      </p>

      <ul className={styles.list} data-testid="admin-game-entries">
        <li>Entries — from a result: {game.entries["result/retention"]}</li>
        <li>Entries — from a result with a Deep dive: {game.entries["deep_dive/retention"]}</li>
        <li>Entries — footer: {game.entries.footer}</li>
        <li>Entries — hub: {game.entries.hub}</li>
      </ul>

      <ul className={styles.list}>
        <li>
          Years started — {started} (direct {game.started.direct}, result {game.started.result}, Deep dive{" "}
          {game.started.deep_dive}, hub {game.started.hub})
        </li>
        {game.quartersRun.map((count, i) => (
          <li key={i}>
            Quarter {i + 1} run — {count} ({share(count, started)} of years started), CEO hung up on {game.hangups[i]}
          </li>
        ))}
        <li>
          Orders — obeyed {game.orders.obeyed}, refused {game.orders.refused}
        </li>
        <li>
          Resume prompt — resumed {game.resume.resume}, restarted {game.resume.restart}
        </li>
      </ul>

      <ul className={styles.list}>
        {GAME_ENDINGS.map((id) => (
          <li key={id}>
            Ending {id} — {game.endings[id]}
          </li>
        ))}
      </ul>

      <p className={styles.detail}>
        Catalogue opened {game.catalogueOpened} · replays {game.replays} · shares {game.shares} · back to the Tour{" "}
        {game.tourLoops}
      </p>
    </Card>
  );
}

export function GameSection({ windows, growth }: { windows: FunnelWindow[]; growth: Pick<GrowthStats, "retentionBottleneckResults"> }) {
  return (
    <>
      <MetaLabel size="xs" wide className={styles.sectionLabel}>
        The game — Le côté obscur (GoatCounter events)
      </MetaLabel>
      <section className={styles.breakdownRow} data-testid="admin-game">
        {windows.map((window) => (
          <GameCard key={window.label} window={window} growth={growth} />
        ))}
      </section>
    </>
  );
}
