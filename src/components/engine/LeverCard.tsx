"use client";

import type { CSSProperties, ReactNode } from "react";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Button } from "@/components/core/Button";
import styles from "./LeverCard.module.css";

export interface LeverCardProps {
  /** « Et si ? ». */
  eyebrow: ReactNode;
  /** Untouched: « Bouge le levier de l'étape qui freine, et vois ce qui suit. » Moved: the move in words. */
  title: ReactNode;
  lever: {
    /** The slider's element id. */
    id: string;
    /** « Taux d'activation, aujourd'hui 18 % ». */
    label: ReactNode;
    min: number;
    max: number;
    step: number;
    value: number;
    /** The value in words, for the slider and its output (« 22 % »). */
    valueText: string;
    onChange?: (value: number) => void;
  };
  /** Extension 09: `MrrCurve` — today's pace, and with the what-ifs once anything moved. */
  curve?: ReactNode;
  /**
   * « MRR dans 12 mois » and « ARR dans 12 mois » (extension 09; was: the MRR and the month's new paying
   * customers), from the engine's own calculation; `today` once anything moved.
   * `unknown`: the value is what is missing, in words (« il manque l'ARPA »), set as a note, not a numeral.
   */
  figures: { key: string; label: ReactNode; value: ReactNode; today?: ReactNode; unknown?: boolean }[];
  /** Extension 09: one line on one new customer with the what-ifs, when the board shows a loss — or, sales-assisted, why its line is straight. */
  worth?: ReactNode;
  /** Extension 09, the hybrid only: both engines' MRR in twelve months — a sum, never a comparison. */
  total?: ReactNode;
  /** « Les 8 leviers et ce que le calcul suppose → »: the full panel, unchanged. */
  allLabel: ReactNode;
  onAll?: () => void;
  /** « Remettre à aujourd'hui », once this lever moved. */
  resetLabel?: ReactNode;
  onReset?: () => void;
  moved?: boolean;
  headingId?: string;
  "data-testid"?: string;
}

/**
 * « Et si ? » through one lever — design system extension 07 (brief 07 Q17),
 * changed by extension 09 (Q8–Q10): the card carries the money's best moment,
 * move the lever and watch the ARR move — the MRR's curve, the MRR and the
 * ARR in twelve months, the one-customer line, the hybrid's total line.
 * The way in to the what-if: one lever, the stage a team target names (C1),
 * or with no target the first typed lever in the funnel's order; and the two
 * figures it moves most. The full panel — every lever moving together, the
 * calculation's assumptions printed — is one tap away.
 *
 * The figures come from the calculation the panel uses; nothing is saved
 * that the panel would not save. A native range: a 44px tap row, an 8px
 * track, a 28px thumb, ink to the value; its output prints the value, the
 * arrows move it. Not a card with a shadow: a ruled section of the board.
 */
export function LeverCard({
  eyebrow,
  title,
  lever,
  curve,
  figures,
  worth,
  total,
  allLabel,
  onAll,
  resetLabel,
  onReset,
  moved,
  headingId = "engine-lever-title",
  "data-testid": testId,
}: LeverCardProps) {
  const span = lever.max - lever.min;
  const fill = span > 0 ? ((lever.value - lever.min) / span) * 100 : 0;
  return (
    <section className={styles.root} aria-labelledby={headingId} data-testid={testId} data-moved={moved ? "true" : "false"}>
      <MetaLabel as="h2" size="sm" tone="muted" wide>
        {eyebrow}
      </MetaLabel>
      <p id={headingId} className={styles.title} data-testid={testId ? `${testId}-title` : undefined}>
        {title}
      </p>
      <div className={styles.lever}>
        <label htmlFor={lever.id} className={styles.label}>
          {lever.label}
        </label>
        <input
          id={lever.id}
          type="range"
          className={styles.slider}
          min={lever.min}
          max={lever.max}
          step={lever.step}
          value={lever.value}
          aria-valuetext={lever.valueText}
          style={{ "--lever-fill": `${fill}%` } as CSSProperties}
          onChange={lever.onChange ? (e) => lever.onChange!(Number(e.currentTarget.value)) : undefined}
          readOnly={!lever.onChange}
          data-testid={testId ? `${testId}-slider` : undefined}
        />
        <output htmlFor={lever.id} className={styles.output}>
          {lever.valueText}
        </output>
      </div>
      {curve ? <div className={styles.curve}>{curve}</div> : null}
      <dl className={styles.figures}>
        {figures.map((figure) => (
          <div key={figure.key} className={styles.figure} data-testid={testId ? `${testId}-figure-${figure.key}` : undefined}>
            <dt className={styles.figureLabel}>{figure.label}</dt>
            <dd className={figure.unknown ? styles.figureUnknown : styles.figureValue}>{figure.value}</dd>
            {figure.today ? <dd className={styles.figureToday}>{figure.today}</dd> : null}
          </div>
        ))}
      </dl>
      {worth ? (
        <p className={styles.worth} data-testid={testId ? `${testId}-worth` : undefined}>
          {worth}
        </p>
      ) : null}
      {total ? (
        <p className={styles.total} data-testid={testId ? `${testId}-total` : undefined}>
          {total}
        </p>
      ) : null}
      <div className={styles.actions}>
        <Button variant="quiet" onClick={onAll} data-testid={testId ? `${testId}-all` : undefined}>
          {allLabel}
        </Button>
        {moved && resetLabel ? (
          <Button variant="quiet" onClick={onReset} data-testid={testId ? `${testId}-reset` : undefined}>
            {resetLabel}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
