import type { HTMLAttributes, ReactNode } from "react";
import styles from "./PriorityMove.module.css";

export interface PriorityMoveProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Eyebrow. "Next move" on the free result; "Priority move" once the Deep
   * dive has made it specific. Already translated.
   */
  label?: ReactNode;
  /** The stage the action belongs to, already translated. Omit in the level state. */
  pillar?: string;
  score?: number | string;
  total?: number;
  /**
   * Owner-only Deep dive offer: one line of body text and one secondary
   * Button, rendered under a dashed rule inside the same card. Visitors never
   * receive it — see R-01, the id in a shared link is not proof of ownership.
   */
  upgrade?: ReactNode;
  /** The action sentence, verbatim from the action library. */
  children: ReactNode;
}

/**
 * The single next action — dashed red on paper, because dashed red is advice
 * and solid red is diagnosis. Exactly one per result screen.
 *
 * Since design system extension 03 it carries the free, deterministic action
 * from `content/next-moves.ts` for **everyone**, owner and visitor alike, and
 * sits at the top of the right column (right after the score card on mobile):
 * the reader goes numeral → bottleneck → action, and the strengths and
 * weaknesses below are the evidence. Never after the CTAs.
 *
 * The rule inside the card is the upgrade seam, and it only appears for the
 * owner, with the `upgrade` slot. The Deep dive no longer unlocks this slot —
 * it sharpens what is already in it — so the empty dashed "locked" card is
 * retired. Do not add a second card, a locked state or a badge.
 *
 * No tone variants: an action that mocks you is not an action. The roast
 * voice lives in the verdict.
 */
export function PriorityMove({
  label = "Next move",
  pillar,
  score,
  total = 20,
  upgrade,
  className,
  children,
  ...rest
}: PriorityMoveProps) {
  return (
    <div className={[styles.card, className ?? ""].filter(Boolean).join(" ")} {...rest}>
      <div className={styles.eyebrow}>
        <span>{label}</span>
        {pillar ? (
          <span className={styles.stage}>
            {pillar} · {score}/{total}
          </span>
        ) : null}
      </div>
      <div className={styles.body}>{children}</div>
      {upgrade ? <div className={styles.upgrade}>{upgrade}</div> : null}
    </div>
  );
}
