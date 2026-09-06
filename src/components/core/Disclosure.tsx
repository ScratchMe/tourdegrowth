"use client";

import type { ReactNode } from "react";
import styles from "./Disclosure.module.css";

export interface DisclosureProps {
  /** The always-visible row. A node rather than a string so a summary can carry its own layout (see ScoreBreakdown's pillar heads). */
  summary: ReactNode;
  children: ReactNode;
  /** `md` for a top-level row, `sm` when nested one level. */
  size?: "md" | "sm";
  /**
   * Draws the standard dashed rule above the summary, so a closed disclosure
   * reads as a quiet line on the page. Off when nesting — nested rows carry
   * their own dividers (Disclosure.prompt.md).
   */
  rule?: boolean;
  className?: string;
  "data-testid"?: string;
}

/**
 * Summary row + typographic marker + content — design system extension 01.
 *
 * A native `<details>`, so it works before hydration and the browser owns the
 * open state. The marker is a sunken mono chip carrying `+` / `−`: the chip is
 * the affordance, the glyph is the state. No icons, ever — this system ships
 * none (DESIGN-BRIEF.md "Assets").
 *
 * Closed by default, always. Never put a primary Button inside one: what is
 * hidden by default cannot be the screen's one action.
 */
export function Disclosure({
  summary,
  children,
  size = "md",
  rule = true,
  className,
  ...rest
}: DisclosureProps) {
  return (
    <details
      className={[styles.wrap, styles[size], rule ? styles.ruled : "", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <summary className={styles.summary}>
        <span className={styles.summaryText}>{summary}</span>
        <span className={styles.marker} aria-hidden="true" />
      </summary>
      <div className={styles.content}>{children}</div>
    </details>
  );
}
