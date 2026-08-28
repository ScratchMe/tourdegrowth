import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Disclaimer.module.css";

export interface DisclaimerProps extends HTMLAttributes<HTMLDivElement> {
  /** center under stacked mobile buttons, left under a desktop button row */
  align?: "left" | "center";
  children?: ReactNode;
}

/**
 * The honesty line — present on every screen that shows a score, per the
 * design system's non-negotiables. Sentence case, not uppercase (it's read,
 * not scanned). Always links to How it works; never soften it into
 * marketing copy or hide it behind a tooltip.
 */
export function Disclaimer({ align = "left", className, children, ...rest }: DisclaimerProps) {
  const classes = [styles.disclaimer, styles[align], className ?? ""].filter(Boolean).join(" ");
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
