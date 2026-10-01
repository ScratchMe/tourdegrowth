import { STOPWATCH } from "./stopwatch-geometry";
import styles from "./Stopwatch.module.css";

export interface StopwatchProps {
  className?: string;
  "data-testid"?: string;
}

/**
 * The engine's stopwatch — design I + B, retained by Antoine on 2026-09-28.
 *
 * The engine is the race's time trial (« Contre-la-montre », `SpaceBand`),
 * and this is its emblem drawn large beside the page's intro: the same
 * stopwatch the band's pictogram reduces to 34 × 22, in ink with the
 * engine's ultramarine on its bezel, its buttons and the time already run.
 *
 * An illustration and nothing else: hidden from assistive technology, never
 * a control, no word on it. The page decides where it stands and when it
 * leaves (the engine's intro drops it under 1100px, where it would push the
 * title into a narrow column). Every colour is a token — the face is a card,
 * the lines are the hard border, the accent is `--space-engine-accent` — so
 * it reads on paper and nowhere else. Its shapes are `stopwatch-geometry.ts`,
 * which the engine's share image draws too.
 */
export function Stopwatch({ className, "data-testid": testId }: StopwatchProps) {
  return (
    <svg
      className={[styles.svg, className ?? ""].filter(Boolean).join(" ")}
      viewBox={STOPWATCH.viewBox}
      aria-hidden="true"
      focusable="false"
      data-testid={testId}
    >
      <circle className={styles.shadow} {...STOPWATCH.shadow} />
      <rect className={styles.button} {...STOPWATCH.crown} />
      <rect className={styles.stem} {...STOPWATCH.stem} />
      <rect className={styles.button} {...STOPWATCH.lap} />
      <circle className={styles.face} {...STOPWATCH.face} />
      <circle className={styles.bezel} {...STOPWATCH.bezel} />
      <path className={styles.wedge} d={STOPWATCH.wedge} />
      <path className={styles.minor} d={STOPWATCH.minor} />
      <path className={styles.major} d={STOPWATCH.major} />
      <path className={styles.hand} d={STOPWATCH.hand} />
      <circle className={styles.hub} {...STOPWATCH.hub} />
    </svg>
  );
}
