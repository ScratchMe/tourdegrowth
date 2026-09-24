import { Tag } from "@/components/core/Tag";
import styles from "./NextLevel.module.css";

export interface NextLevelProps {
  /** `nextLevel.eyebrow`. */
  eyebrow: string;
  /** `nextLevel.title` — the next zone and what it will teach. */
  title: string;
  /** `nextLevel.status`, « bientôt ». */
  status: string;
}

/**
 * The teaser of the next level — GAME-BRIEF §5.11 point 7, §11.5.
 *
 * Dashed, not solid: in this system a dashed edge is something pending, not
 * yet there (the locked priority move, an empty chart). It is not a link and
 * has no button — there is nothing to open yet, and a disabled button would
 * be a control that does nothing. When the level ships, the hub links it.
 */
export function NextLevel({ eyebrow, title, status }: NextLevelProps) {
  return (
    <aside className={styles.card} aria-labelledby="game-next-level-title" data-testid="game-next-level">
      <div className={styles.top}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <Tag tone="outline">{status}</Tag>
      </div>
      <p id="game-next-level-title" className={styles.title}>
        {title}
      </p>
    </aside>
  );
}
