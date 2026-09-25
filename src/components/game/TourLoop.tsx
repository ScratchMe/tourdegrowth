import { Button } from "@/components/core/Button";
import styles from "./TourLoop.module.css";

export interface TourLoopProps {
  /** `tourLoop.question`, « Où en est ta croissance ? ». */
  question: string;
  /** `tourLoop.cta`, the landing's own button label. */
  cta: string;
  /**
   * A result id this device already knows, if any — the same `?ref=` every
   * other entry into the Tour carries (GAME-BRIEF §13.3 D). Absent, the link
   * carries nothing: a made-up referral would inflate the K-factor this
   * site reports.
   */
  refId?: string | null;
  onClick?: () => void;
}

/** `/quiz`, with the referral when one is known. Exported for the spec that checks it. */
export function tourLoopHref(refId?: string | null): string {
  return refId ? `/quiz?ref=${encodeURIComponent(refId)}` : "/quiz";
}

/**
 * The loop back to the Tour — GAME-BRIEF §11.5 and §13.3 D.
 *
 * For readers who arrived through the game: they have just seen what not to
 * do to retention, and the Tour tells them where their own growth stalls.
 * December's one primary action: replay and share are quieter on purpose.
 *
 * A bare `<a>` (`hard`): `/quiz` lives under the app routes' root layout,
 * the game under the content pages', and a `next/link` across root layouts
 * prefetches a dynamic route for a navigation that reloads the page anyway
 * (Button's `hard` explains the measure).
 */
export function TourLoop({ question, cta, refId, onClick }: TourLoopProps) {
  return (
    <section className={styles.loop} aria-labelledby="game-tour-loop-title" data-testid="game-tour-loop">
      <h2 id="game-tour-loop-title" className={styles.question}>
        {question}
      </h2>
      <Button href={tourLoopHref(refId)} hard onClick={onClick} data-testid="game-tour-loop-cta">
        {cta}
      </Button>
    </section>
  );
}
