import { Card } from "@/components/core/Card";
import styles from "./Playbook.module.css";

export interface PlaybookItem {
  /** Stable key: the card id. */
  id: string;
  /** The card's meeting-room name, `cards[id].name`. */
  name: string;
  /**
   * Its hidden effects, each already filled (`playbook.trust`, `playbook.radar`
   * with U+2212 from the formatter): « confiance +4 », « radar −2 ».
   */
  effects: readonly string[];
}

export interface PlaybookProps {
  /** `playbook.eyebrow`. */
  eyebrow: string;
  /** `playbook.titleWin` on a winning ending, `playbook.titleLose` otherwise — the island picks. */
  title: string;
  /** `playbook.refused`, filled: « Ordres du DG refusés : 3 sur 3. » */
  refused: string;
  /** The honest cards played this year (`playbookCards`), in the order first played. May be empty. */
  items: readonly PlaybookItem[];
  /** `playbook.closing`. */
  closing: string;
}

/**
 * « Ce que tu as fait de propre » — GAME-BRIEF §5.11 point 4, plan §2.6.
 *
 * The honest alternatives, with the effect the dashboard never showed:
 * the other half of the reveal. A player fired in June with two honest
 * cards still gets this card — the list is short, the refused orders and the
 * closing sentence still say what the game was measuring. A flat paper card:
 * the stamped headline is December's one raised thing.
 */
export function Playbook({ eyebrow, title, refused, items, closing }: PlaybookProps) {
  return (
    <Card elevation="flat" className={styles.card} data-testid="game-playbook">
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 className={styles.title}>
        {title}
      </h2>
      <p className={styles.refused}>{refused}</p>
      {items.length ? (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.item} data-testid={`game-playbook-${item.id}`}>
              <span className={styles.name}>{item.name}</span>
              {item.effects.length ? (
                <>
                  {/* The separator the brief quotes (« Offre de pause · confiance +4, radar −2 »), silent to a screen reader. */}
                  <span aria-hidden="true"> · </span>
                  <span className={styles.effects}>{item.effects.join(", ")}</span>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      <p className={styles.closing}>{closing}</p>
    </Card>
  );
}
