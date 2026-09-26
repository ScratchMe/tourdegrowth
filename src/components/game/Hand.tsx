import type { ReactNode, Ref } from "react";
import { ActionCard, type ActionCardState } from "./ActionCard";
import styles from "./Hand.module.css";

export interface HandCard {
  id: string;
  name: string;
  pitch: string;
  pressed: boolean;
  state: ActionCardState;
  /** The card the CEO asked for this quarter — it comes first in the list (GAME-BRIEF §5.6). */
  ordered: boolean;
  /** New in the hand this quarter because of an earlier choice (the data review after the survey). */
  unlocked?: boolean;
}

export interface HandProps {
  /** « Trimestre 1 · tes deux chantiers », already filled. The heading the island focuses in the `hand` phase. */
  title: string;
  headingRef?: Ref<HTMLHeadingElement>;
  /** « 1 / 2 », already filled. */
  count: string;
  /** Accessible name of the list of cards (« Tes actions du trimestre »). */
  label: string;
  /** What to do now: « Ton équipe produit peut livrer deux chantiers… »… */
  hint: string;
  /** In the hand's own order — the component never sorts (§5.6: never by effect). */
  cards: readonly HandCard[];
  orderLabel: string;
  /** « Débloqué par le questionnaire ». */
  unlockedLabel?: string;
  chosenLabel: string;
  /** « En production : … », or the empty sentence. */
  production: string;
  /**
   * Beside the title: the island's « Relire le message du DG » disclosure
   * once the call is over (plan §1.3). A slot, because the message and its
   * `game-reread` hook belong to the call, not to the hand.
   */
  headerAside?: ReactNode;
  onToggle: (id: string) => void;
}

/**
 * The quarter's hand — game plan §2.6: a header (title, counter, hint), the
 * cards (two columns from 761px, one below), and the « En production » line.
 *
 * Presentation only: which cards, in which state, is decided by the engine
 * (`handIds`) and the island. The counter and the hint are the hand's own
 * status; on a phone the sticky `ActionBar` repeats the counter so it stays
 * in view while the player scrolls through twelve cards.
 */
export function Hand({
  title,
  headingRef,
  count,
  label,
  hint,
  cards,
  orderLabel,
  unlockedLabel,
  chosenLabel,
  production,
  headerAside,
  onToggle,
}: HandProps) {
  const hintId = "game-hand-hint";

  return (
    <section className={styles.hand} data-testid="game-hand" aria-labelledby="game-hand-title">
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h2 id="game-hand-title" className={styles.title} ref={headingRef} tabIndex={-1}>
            {title}
          </h2>
          <span className={styles.count} data-testid="game-count">
            {count}
          </span>
        </div>
        {headerAside ? <div className={styles.aside}>{headerAside}</div> : null}
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      </header>

      <ul className={styles.cards} aria-label={label}>
        {cards.map((card) => (
          <li key={card.id} className={styles.item}>
            <ActionCard
              id={card.id}
              name={card.name}
              pitch={card.pitch}
              pressed={card.pressed}
              state={card.state}
              orderLabel={card.ordered ? orderLabel : undefined}
              unlockedLabel={card.unlocked ? unlockedLabel : undefined}
              chosenLabel={chosenLabel}
              describedBy={card.state === "locked" ? hintId : undefined}
              onToggle={() => onToggle(card.id)}
            />
          </li>
        ))}
      </ul>

      <p className={styles.production} data-testid="game-production">
        {production}
      </p>
    </section>
  );
}
