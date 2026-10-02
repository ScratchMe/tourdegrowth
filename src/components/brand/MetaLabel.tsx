import type { HTMLAttributes, ReactNode } from "react";
import styles from "./MetaLabel.module.css";

export interface MetaLabelProps extends HTMLAttributes<HTMLDivElement> {
  size?: "md" | "sm" | "xs";
  tone?: "muted" | "ink" | "alert";
  /** Uppercase + tracking. Set false for anything read as a sentence. */
  uppercase?: boolean;
  /** Wider tracking (0.12em) for section eyebrows like "Strengths". */
  wide?: boolean;
  /**
   * The element: a `div` by default; `h2` / `h3` where the eyebrow IS the
   * section's title, so a screen reader can go from section to section — the
   * result's « Strengths » and « Where you're losing time » were `div`s, and
   * the page's only heading a hidden `h1` (A15.13). Looks the same either way.
   */
  as?: "div" | "h2" | "h3";
  children?: ReactNode;
}

/**
 * Mono meta line: eyebrows, counters, captions ("Overall Growth Score",
 * "Question 3 of 10", "Priority move"). Uppercase unless it's a sentence —
 * never use mono for a question or a verdict, those are Inter (see
 * QuestionCard / InsightCard).
 */
export function MetaLabel({
  size = "sm",
  tone = "muted",
  uppercase = true,
  wide = false,
  as: Element = "div",
  className,
  children,
  ...rest
}: MetaLabelProps) {
  const classes = [
    styles.label,
    styles[size],
    styles[tone],
    uppercase ? styles.uppercase : "",
    uppercase && wide ? styles.wide : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Element className={classes} {...rest}>
      {children}
    </Element>
  );
}
