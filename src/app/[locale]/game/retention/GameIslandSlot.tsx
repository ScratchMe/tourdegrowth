import styles from "./page.module.css";

export interface GameIslandSlotProps {
  title: string;
  body: string;
}

/**
 * PROVISIONAL (plan §4.2 G4a) — where the year will be played.
 *
 * The level page ships its shell before the game: the routes, the flag, the
 * SEO and the intro can be built, tested and reviewed while the engine and
 * the interface are written in parallel. This slot holds the island's place
 * in the layout, rendered on the server, and is replaced by `GameIsland` in
 * G8a — nothing imports it but this page.
 *
 * A dashed box, the system's "pending": it says in words that the office is
 * not open yet, rather than drawing a fake dashboard whose numbers would have
 * to be copied from the engine's constants (and kept in step with them).
 */
export function GameIslandSlot({ title, body }: GameIslandSlotProps) {
  return (
    <section className={styles.slot} data-testid="game-island-slot" aria-labelledby="game-island-slot-title">
      <h2 id="game-island-slot-title" className={styles.slotTitle}>
        {title}
      </h2>
      <p className={styles.slotBody}>{body}</p>
    </section>
  );
}
