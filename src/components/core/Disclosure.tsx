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
  /** Open on first render, then the reader's (uncontrolled). Design system extension 07. */
  defaultOpen?: boolean;
  /** Controlled: the row is open while this is true. Pass `onOpenChange` with it. */
  open?: boolean;
  /**
   * Called from the native `toggle` event with the row's new state — on the
   * reader's click, and also when `open` itself opens or closes it, so the
   * value may be the one already held.
   */
  onOpenChange?: (open: boolean) => void;
  /** So another control can point at it (`aria-controls`) and scroll to it. */
  id?: string;
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
 *
 * Opened from elsewhere (design system extension 07: `defaultOpen`, `open`
 * and `onOpenChange`) only when the other control names what it opens — the
 * trap's « Écris ta définition » opens « Ta définition et une note ». Never
 * open one on first paint because it "might help": folded is the default.
 * It stays a native `<details>` either way: keyboard, find-in-page and what
 * a search engine reads of a closed row are unchanged.
 */
export function Disclosure({
  summary,
  children,
  size = "md",
  rule = true,
  className,
  defaultOpen,
  open,
  onOpenChange,
  id,
  ...rest
}: DisclosureProps) {
  return (
    <details
      className={[styles.wrap, styles[size], rule ? styles.ruled : "", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      // React writes `open` only when the prop changes: an uncontrolled row the reader closed stays closed on the next render.
      open={open ?? defaultOpen ?? false}
      onToggle={onOpenChange ? (e) => onOpenChange(e.currentTarget.open) : undefined}
      id={id}
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
