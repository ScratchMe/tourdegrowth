import styles from "./DgMail.module.css";

export interface DgMailProps {
  /** « De : DG · Objet : les chiffres de la semaine ». */
  header: string;
  /** The mid-quarter message, already resolved in the page's language. */
  body: string;
}

/**
 * The CEO's mid-quarter email in the quarter report — game plan §2.6,
 * GAME-BRIEF §5.12 (« courriel du DG en italique »).
 *
 * Night world, unlike the press clippings: this is inside Flixo, the same
 * building as the dashboard. A mono header band says what it is before
 * anyone reads it; the body is italic, as the brief asks, and still at full
 * contrast — italic is the voice, not a way to quiet it.
 */
export function DgMail({ header, body }: DgMailProps) {
  return (
    <figure className={styles.mail}>
      <figcaption className={styles.header}>{header}</figcaption>
      <blockquote className={styles.body}>
        <p>{body}</p>
      </blockquote>
    </figure>
  );
}
