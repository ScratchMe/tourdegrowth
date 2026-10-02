import { Card } from "@/components/core/Card";
import { MetaLabel } from "@/components/brand/MetaLabel";
import type { FunnelWindow } from "@/lib/analytics/goatcounter-api";
import { ENGINE_EXPORT_FORMATS, ENGINE_STAGES } from "@/lib/analytics/goatcounter";
import styles from "./page.module.css";

/** `n` as a share of `of`, or "—" when there is nothing to divide by. */
function share(n: number, of: number): string {
  return of > 0 ? `${Math.round((n / of) * 100)}%` : "—";
}

/**
 * The growth engine's block of /admin/stats — engine spec §11.6, on the
 * game's precedent (`GameSection`). English like the rest of this page.
 *
 * What it can say is deliberately narrow: how many sessions opened the
 * engine, with which motions (Q14), how far into the five stages they saved
 * something — self-serve's and sales-assisted's apart — how many started a
 * next month (the series in use, §19.12), and what left as a file. Never what anyone found — the page promises that nothing typed
 * leaves the browser, and these counts are the proof that the analytics keep
 * that promise too. Everything reads zero until the engine is opened.
 */
function EngineCard({ window }: { window: FunnelWindow }) {
  const engine = window.stats?.engine;
  if (!engine) {
    return (
      <Card elevation="panel" className={styles.breakdown}>
        <MetaLabel size="xs" wide>{window.label} — the engine</MetaLabel>
        <p className={styles.detail}>Unavailable — {window.error}</p>
      </Card>
    );
  }
  const exports = ENGINE_EXPORT_FORMATS.reduce((n, f) => n + engine.exported[f], 0);
  return (
    <Card elevation="panel" className={styles.breakdown}>
      <MetaLabel size="xs" wide>{window.label} — the engine</MetaLabel>
      <ul className={styles.list} data-testid="admin-engine-stages">
        <li>Opened — {engine.opened}</li>
        <li data-testid="admin-engine-entries">
          Entries — landing strip {engine.entries.home_strip}, space band {engine.entries.space_band}, result (owner){" "}
          {engine.entries.result_owner}, landing line {engine.entries.landing_resume}, compact header race{" "}
          {engine.entries.space_band_compact}
        </li>
        <li data-testid="admin-engine-setup">
          Set up — self-serve {engine.setup.plg}, sales-assisted {engine.setup.slg}, both {engine.setup.hybrid}
        </li>
        {ENGINE_STAGES.map((stage) => (
          <li key={stage}>
            First number saved in {stage} — {engine.stagesSaved[stage]} ({share(engine.stagesSaved[stage], engine.opened)} of
            openings); sales-assisted {engine.stagesSavedSlg[stage]}
          </li>
        ))}
      </ul>
      <ul className={styles.list}>
        <li data-testid="admin-engine-months">
          Next month started — {engine.monthStarted} ({share(engine.monthStarted, engine.opened)} of openings)
        </li>
        <li>Requests copied — {engine.requestsCopied}</li>
        <li>Linked to a Tour — {engine.tourLinked}</li>
        <li>
          Slides opened — {engine.deckOpened} ({share(engine.deckOpened, engine.opened)} of openings)
        </li>
        <li>
          Exports — {exports} ({ENGINE_EXPORT_FORMATS.map((f) => `${f} ${engine.exported[f]}`).join(", ")})
        </li>
      </ul>
    </Card>
  );
}

export function EngineSection({ windows }: { windows: FunnelWindow[] }) {
  return (
    <>
      <MetaLabel size="xs" wide className={styles.sectionLabel}>
        The growth engine (GoatCounter events)
      </MetaLabel>
      <section className={styles.breakdownRow} data-testid="admin-engine">
        {windows.map((window) => (
          <EngineCard key={window.label} window={window} />
        ))}
      </section>
    </>
  );
}
