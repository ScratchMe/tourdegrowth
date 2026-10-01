import styles from "./StampedPillar.module.css";

export interface StampedPillarProps {
  pillar: string;
  score: number;
  total?: number;
  /** e.g. "dead last" / "bon dernier" — localized by the caller. */
  suffix: string;
}

/**
 * The roast's stamp: in a roast, the weakest stage leaves the score sheet as
 * a stamp, "RETENTION · 8/20 · DEAD LAST", inked across its row of
 * `StageScores` in AARRR order (it renders an <li>). The second-lowest takes
 * `StageScore tone="alert"`.
 *
 * Redrawn by design system extension 05: an inked rubber stamp — red ink on
 * the wash, a 3px solid edge, soft corners, a degree askew. It used to be a
 * red-FILLED pill, the primary action's red, on the one screen where the
 * primary action counts most. Wash plus solid red edge is the system's
 * diagnosis, and that is what the stamp says. It keeps its exception: no
 * meter (a verdict, not a reading), capitals, the tilt. Roast only, never
 * more than one; do not rotate any other element to match.
 */
export function StampedPillar({ pillar, score, total = 20, suffix }: StampedPillarProps) {
  // The spaces between the parts are text nodes: the flex row ignores them,
  // a screen reader needs them ("Retention 8/20 dead last"); the dots are
  // hidden from it.
  return (
    <li className={styles.row}>
      <span className={styles.stamped}>
        <span>{pillar}</span> <span aria-hidden="true">·</span>{" "}
        <span className={styles.score}>
          {score}/{total}
        </span>{" "}
        <span aria-hidden="true">·</span> <span>{suffix}</span>
      </span>
    </li>
  );
}
