import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Callout.module.css";

export interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * `caveat` — a dashed ink edge on the page ground: something the reader
   * should know before trusting what they read (the score is an estimate,
   * not an audit). `cta` — a plain paper panel that leads into the action
   * it carries. Required, like `Bottleneck.sharpness`: the two are not
   * interchangeable, and there is no neutral default between them.
   */
  tone: "caveat" | "cta";
  /** For `cta`: the button the sentence leads into, rendered under it. */
  action?: ReactNode;
  children: ReactNode;
}

/**
 * The aside of a prose page — ds-critique M-2, 2026-09-24.
 *
 * Four pages drew this as `Card` plus `border-color: var(--border-alert)
 * !important`: a fifth meaning for red, where the system allows three
 * (primary action, diagnosis, advice). On How it works it was a warning; on
 * the comparisons and the open-door pages it was a sales line — the same red
 * edge for opposite jobs. Neither is a diagnosis about the reader's business,
 * so neither is red.
 *
 * A `caveat` is ink and dashed — the system's "read this first" rule, calm
 * enough to sit above a primary button without competing with it. A `cta`
 * carries no red at all: the red button inside it is the one loud thing,
 * and a red frame around a red button is two.
 *
 * Never raised: the page already has its one raised element.
 */
export function Callout({ tone, action, className, children, ...rest }: CalloutProps) {
  return (
    <div className={[styles.callout, styles[tone], className ?? ""].filter(Boolean).join(" ")} {...rest}>
      <div className={styles.body}>{children}</div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
