"use client";

import { Button } from "@/components/core/Button";
import { Select } from "@/components/core/Select";
import type { EngineStrings } from "@/lib/engine/strings";
import { MAX_MONTHS } from "@/lib/engine/types";
import { fill } from "./text";
import styles from "./Screens.module.css";

/** What the board needs to show the monthly series (engine spec §19.2, A14 T2). */
export interface SeriesControls {
  /** Every month of the engine, oldest first, by its index in `snapshots`. */
  months: { index: number; label: string }[];
  /** The month on screen. */
  shown: number;
  /** A past month being corrected: the board takes entries again, written back into that month. */
  correcting: boolean;
  /** The next month (§19.2.1): ready to start, or the engine full; absent before the flows' month is over. */
  next: { kind: "ready"; label: string } | { kind: "full" } | null;
  onPick: (index: number) => void;
  onCorrect: () => void;
  onDoneCorrecting: () => void;
  onStart: () => void;
}

/**
 * The month selector (§19.2.4) — « Mois : août ▾ » — once the engine holds
 * two months; with it, the band that says a past month is on screen, read
 * only or being corrected, and the way back to the month being filled.
 */
export function MonthBar({ series, strings }: { series: SeriesControls; strings: EngineStrings }) {
  const s = strings.series;
  const last = series.months.length - 1;
  const past = series.shown !== last;
  const shownLabel = series.months[series.shown]?.label ?? "";
  const lastLabel = series.months[last]?.label ?? "";
  if (series.months.length < 2) return null;
  return (
    <div className={styles.monthBar} data-testid="engine-month-bar">
      <Select
        label={s.monthLabel}
        size="sm"
        fit="content"
        value={String(series.shown)}
        onChange={(value) => value !== "" && series.onPick(Number(value))}
        // Newest first: the month being filled is the one most often wanted.
        options={[...series.months].reverse().map((m) => ({ value: String(m.index), label: m.label }))}
        data-testid="engine-month-select"
      />
      {past ? (
        <div className={styles.resume} data-testid="engine-month-past" data-correcting={series.correcting ? "true" : "false"}>
          <p className={styles.resumeText}>{fill(series.correcting ? s.correcting : s.viewing, { month: shownLabel })}</p>
          <div className={styles.resumeActions}>
            {series.correcting ? (
              <Button variant="secondary" onClick={series.onDoneCorrecting} data-testid="engine-month-done">
                {s.doneCorrecting}
              </Button>
            ) : (
              <Button variant="secondary" onClick={series.onCorrect} data-testid="engine-month-correct">
                {s.correct}
              </Button>
            )}
            <Button variant="quiet" onClick={() => series.onPick(last)} data-testid="engine-month-back">
              {fill(s.backTo, { month: lastLabel })}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** « Mois clos : septembre 2026. Ses chiffres peuvent commencer… » and its button (§19.2.1), or the engine's `MAX_MONTHS` reached. */
export function NextMonthBand({ next, onStart, strings }: { next: SeriesControls["next"]; onStart: () => void; strings: EngineStrings }) {
  if (!next) return null;
  const s = strings.series;
  if (next.kind === "full") {
    return (
      <div className={styles.resume} data-testid="engine-month-full">
        <p className={styles.resumeText}>{fill(s.full, { max: MAX_MONTHS })}</p>
      </div>
    );
  }
  return (
    <div className={styles.resume} data-testid="engine-month-next">
      <p className={styles.resumeText}>{fill(s.ready, { month: next.label })}</p>
      <div className={styles.resumeActions}>
        <Button onClick={onStart} data-testid="engine-month-start">
          {fill(s.start, { month: next.label })}
        </Button>
      </div>
    </div>
  );
}
