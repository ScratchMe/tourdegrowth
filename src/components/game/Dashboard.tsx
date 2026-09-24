import { BulletChart } from "@/components/viz/BulletChart";
import { StatTile, type StatTileDelta } from "@/components/viz/StatTile";
import styles from "./Dashboard.module.css";

export interface DashboardTile {
  label: string;
  /** Already formatted by `lib/game/format.ts` — the same string the report and the timeline print. */
  value: string;
  sub?: string;
  /** After a quarter: the change, with its sign AND a word (StatTile's contract). */
  delta?: StatTileDelta;
}

export interface DashboardChurnTile extends DashboardTile {
  /** The mini bullet under the hero figure: this month's churn against the target, in the same unit. */
  bullet: {
    value: number;
    target: number;
    domain: readonly [number, number];
    /** Value and target in words — nothing drawn is read. */
    ariaLabel: string;
  };
}

export interface DashboardPatienceTile extends DashboardTile {
  /** 0 to 100. */
  bar: number;
  /** Under the low line: the bar turns bad AND `sub` says it in words (« à bout »). */
  low: boolean;
}

/**
 * Trust and the regulator's radar. Before December the tile is `hidden` and
 * this type gives it no place to put a number: the dashboard of a growth
 * team shows the figure, not its cost — the brief's thesis (§4) — and a value
 * blurred in CSS but present in the DOM would hide nothing from anyone who
 * opens devtools (plan §2.7, X28).
 */
export type DashboardSecretTile =
  | {
      hidden: true;
      label: string;
      /** « pas sur ton dashboard », sharp under the blurred decoy. */
      hiddenLabel: string;
      /** « Masquée jusqu'en décembre », for screen readers. */
      hiddenNote: string;
    }
  | {
      hidden: false;
      label: string;
      value: string;
      /** « révélée en décembre ». */
      sub: string;
      /** 0 to 100. */
      bar: number;
      /** Plays the unblur once, in December. */
      revealing?: boolean;
    };

export interface DashboardProps {
  /** « Ton dashboard ». */
  label: string;
  churn: DashboardChurnTile;
  subs: DashboardTile;
  mrr: DashboardTile;
  patience: DashboardPatienceTile;
  trust: DashboardSecretTile;
  radar: DashboardSecretTile;
  /**
   * While the three months scroll by, the tiles change every 600 ms: `busy`
   * tells assistive technology to hold its announcements until they settle,
   * instead of reading three dashboards in a row.
   */
  busy?: boolean;
}

function SecretTile({ tile, testId }: { tile: DashboardSecretTile; testId: string }) {
  if (tile.hidden) {
    return (
      <StatTile
        hidden
        size="compact"
        label={tile.label}
        hiddenLabel={tile.hiddenLabel}
        hiddenNote={tile.hiddenNote}
        className={styles.secret}
        data-testid={testId}
      />
    );
  }
  return (
    <StatTile
      size="compact"
      label={tile.label}
      value={tile.value}
      sub={tile.sub}
      bar={{ value: tile.bar, tone: "neutral" }}
      revealing={tile.revealing}
      className={styles.secret}
      data-testid={testId}
    />
  );
}

/**
 * Flixo's growth dashboard — GAME-BRIEF §5.3, game plan §2.6.
 *
 * Six tiles on the design system's `viz/StatTile`, never re-drawn here: churn
 * as the hero (the stencil « race bib », with a mini `BulletChart` against the
 * quarter's target), then subscribers, revenue, the CEO's patience, and the
 * two tiles the dashboard does not show — trust and the regulator's radar.
 *
 * The other five tiles are `compact` at every width. `StatTile` takes its
 * size as a prop and this system never switches a prop on a width read in
 * JavaScript, so one size has to hold at 1280 AND in a third of a 390px
 * screen, and only `compact` does (a « 1,30 M€ » at 20px overflows 114px).
 */
export function Dashboard({ label, churn, subs, mrr, patience, trust, radar, busy = false }: DashboardProps) {
  return (
    <section className={styles.dashboard} aria-labelledby="game-dashboard-title">
      <h2 id="game-dashboard-title" className={styles.title}>
        {label}
      </h2>
      <div className={styles.grid} aria-live="polite" aria-busy={busy || undefined}>
        <StatTile
          size="hero"
          label={churn.label}
          value={churn.value}
          sub={churn.sub}
          delta={churn.delta}
          className={styles.churn}
          data-testid="game-dash-churn"
        >
          <BulletChart
            value={churn.bullet.value}
            target={churn.bullet.target}
            domain={churn.bullet.domain}
            ariaLabel={churn.bullet.ariaLabel}
          />
        </StatTile>
        <StatTile
          size="compact"
          label={subs.label}
          value={subs.value}
          sub={subs.sub}
          delta={subs.delta}
          className={styles.tile}
          data-testid="game-dash-subs"
        />
        <StatTile
          size="compact"
          label={mrr.label}
          value={mrr.value}
          sub={mrr.sub}
          delta={mrr.delta}
          className={styles.tile}
          data-testid="game-dash-mrr"
        />
        <StatTile
          size="compact"
          label={patience.label}
          value={patience.value}
          sub={patience.sub}
          delta={patience.delta}
          bar={{ value: patience.bar, tone: patience.low ? "bad" : "good" }}
          className={styles.tile}
          data-testid="game-dash-patience"
        />
        <SecretTile tile={trust} testId="game-dash-trust" />
        <SecretTile tile={radar} testId="game-dash-radar" />
      </div>
    </section>
  );
}
