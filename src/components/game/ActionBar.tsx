import { Button } from "@/components/core/Button";
import styles from "./ActionBar.module.css";

export interface ActionBarProps {
  /** « 1 / 2 », the same string as the hand's counter. */
  count: string;
  /**
   * The clicks pill, abbreviated: « 5 clics pour résilier ». `alert` when the
   * path is past what the law expects — the island decides (`clicksOverLaw`),
   * the text already says it, the colour only repeats it.
   */
  clicks: { text: string; alert: boolean };
  runLabel: string;
  /** Exactly two cards ticked and the call closed. */
  canRun: boolean;
  onRun: () => void;
}

/**
 * The quarter's one action — game plan §2.6, §2.8.
 *
 * Desktop: a block under the hand, the primary button full width. Phone: a bar stuck to the bottom of the screen with the
 * counter, the clicks pill and the button, because twelve cards in one
 * column push all three out of view exactly while the player is choosing
 * (plan R3). `position: sticky` rather than `fixed`: the bar lives in the
 * flow right after the hand, so once the page is scrolled to the end of the
 * hand it sits in its own place under the last card and can never cover it.
 * The other side of that: a sticky box only sticks inside its parent, so the
 * bar must be a direct sibling of the `Hand`, in the same column. Wrapped in
 * its own `<div>` it has nowhere to slide and stays at the bottom of the page
 * (measured: the first preview did exactly that).
 *
 * The island renders it only in the `hand` phase (plan §3.5): it is not
 * hidden by CSS during the call, the report or December — it is absent.
 *
 * No hint of its own. It used to carry « Trois mois vont passer… » under the
 * button on a desktop — where the hand's header already says it once two
 * cards are ticked, and where, with fewer, it contradicted the header
 * (« Choisis-en deux » above, « trois mois vont passer » below a disabled
 * button). The hand's hint is the one sentence about what happens next, at
 * every width.
 */
export function ActionBar({ count, clicks, runLabel, canRun, onRun }: ActionBarProps) {
  return (
    <div className={styles.bar} data-testid="game-actionbar">
      <div className={styles.status}>
        <span className={styles.count}>{count}</span>
        <span className={[styles.pill, clicks.alert ? styles.alert : ""].filter(Boolean).join(" ")}>
          {clicks.text}
        </span>
      </div>
      <Button fullWidth disabled={!canRun} onClick={onRun} data-testid="game-run" className={styles.run}>
        {runLabel}
      </Button>
    </div>
  );
}
