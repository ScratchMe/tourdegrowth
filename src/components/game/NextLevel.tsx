import Link from "next/link";
import { Tag } from "@/components/core/Tag";
import styles from "./NextLevel.module.css";

export interface NextLevelProps {
  /** `nextLevel.eyebrow`: « Niveau suivant », or « L'autre niveau » from level 2. */
  eyebrow: string;
  /** `nextLevel.title` — the level and what it teaches. */
  title: string;
  /** `nextLevel.status`: « jouable », or « bientôt » for a level not built yet. */
  status: string;
  /**
   * The level's page, when it is open — the title becomes the link to it.
   * Absent, the block is a teaser of something not there yet.
   */
  href?: string;
}

/**
 * The block that closes December on another level — GAME-BRIEF §5.11 point
 * 7, §11.5, and C31 (2026-10-01): the two levels point at each other.
 *
 * With no `href`, dashed: in this system a dashed edge is something pending,
 * not yet there (the locked priority move, an empty chart), and there is no
 * button — a disabled button would be a control that does nothing. With an
 * `href`, the level exists: a solid edge and a solid tag, and its title is
 * the link.
 */
export function NextLevel({ eyebrow, title, status, href }: NextLevelProps) {
  return (
    <aside
      className={[styles.card, href ? styles.open : ""].filter(Boolean).join(" ")}
      aria-labelledby="game-next-level-title"
      data-testid="game-next-level"
    >
      <div className={styles.top}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        {/* Dashed is « not yet » in this system: the tag of an open level is solid, like its edge. */}
        <Tag tone={href ? "ink" : "outline"}>{status}</Tag>
      </div>
      <p id="game-next-level-title" className={styles.title}>
        {href ? (
          <Link href={href} className={styles.link} data-testid="game-next-level-link">
            {title}
          </Link>
        ) : (
          title
        )}
      </p>
    </aside>
  );
}
