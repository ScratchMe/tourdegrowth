import styles from "./ActionCard.module.css";

/**
 * Why a card cannot be ticked right now — two different things, drawn
 * differently (game plan §2.6, R4):
 *
 * - `locked`: the CEO is still talking. The card is `disabled` but keeps its
 *   full contrast, because the player reads the hand WHILE he talks — the
 *   prototype dimmed the whole card to 50 % and its « Demandé par le DG »
 *   badge fell under AA.
 * - `unavailable`: two cards are already ticked. Muted text, quiet edge: this
 *   one is out of the round, not merely waiting.
 */
export type ActionCardState = "available" | "locked" | "unavailable";

export interface ActionCardProps {
  /** The card's id: `game-card-{id}` (GAME-BRIEF §7.2). */
  id: string;
  /** Meeting-room name and one mechanical sentence — never a number (GAME-BRIEF §4, §5.5). */
  name: string;
  pitch: string;
  pressed: boolean;
  state: ActionCardState;
  /** The CEO's badge (« Demandé par le DG »), only on the card he asked for. */
  orderLabel?: string;
  /**
   * « Débloqué par le questionnaire » — only on a card that joins the hand
   * because of something the player did (the data review, the quarter the
   * exit survey's answers come in). Outlined, never filled: it is news, not
   * a demand.
   */
  unlockedLabel?: string;
  /** The word that says the card is ticked (« Choisie ») — the state is never carried by colour alone. */
  chosenLabel: string;
  /** Id of the hand's hint, so a screen reader hears why a card is locked. */
  describedBy?: string;
  onToggle: () => void;
}

/**
 * One action of the hand — a toggle button (`aria-pressed`) with the
 * system's single selection language (DS v3 §5.4): ticked = the inverse fill
 * with its own text, which at night is amber with the night itself as ink
 * (10.13:1). "The same state component as the quiz answer, in another world"
 * (game plan §2.2).
 *
 * Nothing on the card says what it pays: no figure, no sign, no arrow. That
 * is the brief's §4 decision, and it is why the component takes a name and a
 * pitch and nothing numeric at all.
 */
export function ActionCard({
  id,
  name,
  pitch,
  pressed,
  state,
  orderLabel,
  unlockedLabel,
  chosenLabel,
  describedBy,
  onToggle,
}: ActionCardProps) {
  const classes = [styles.card, pressed ? styles.pressed : "", state !== "available" ? styles[state] : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      aria-pressed={pressed}
      disabled={state !== "available"}
      aria-describedby={describedBy}
      onClick={onToggle}
      data-testid={`game-card-${id}`}
      data-state={state}
    >
      {orderLabel || unlockedLabel || pressed ? (
        <span className={styles.top}>
          {orderLabel ? <span className={styles.order}>{orderLabel}</span> : null}
          {unlockedLabel ? <span className={styles.unlocked}>{unlockedLabel}</span> : null}
          {/* aria-pressed already says it; the word is for eyes, not read twice. */}
          {pressed ? (
            <span className={styles.chosen} aria-hidden="true">
              {chosenLabel}
            </span>
          ) : null}
        </span>
      ) : null}
      <span className={styles.name}>{name}</span>
      <span className={styles.pitch}>{pitch}</span>
    </button>
  );
}
