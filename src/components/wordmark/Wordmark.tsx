import styles from "./Wordmark.module.css";

/** "TOUR DE GROWTH" — Stardos Stencil, GROWTH in --red. DESIGN-BRIEF.md §Typography. */
export function Wordmark() {
  return (
    <span className={styles.wordmark}>
      TOUR DE <span className={styles.accent}>GROWTH</span>
    </span>
  );
}
