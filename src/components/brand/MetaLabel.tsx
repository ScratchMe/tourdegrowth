import type { HTMLAttributes, ReactNode } from "react";
import styles from "./MetaLabel.module.css";

export interface MetaLabelProps extends HTMLAttributes<HTMLDivElement> {
  size?: "md" | "sm" | "xs";
  tone?: "muted" | "ink" | "alert";
  /** Uppercase + tracking. Set false for anything read as a sentence. */
  uppercase?: boolean;
  /** Wider tracking (0.12em) for section eyebrows like "Strengths". */
  wide?: boolean;
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
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
