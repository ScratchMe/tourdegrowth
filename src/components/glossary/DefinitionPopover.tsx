"use client";

import { useEffect, useRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./DefinitionPopover.module.css";

export interface DefinitionPopoverProps extends HTMLAttributes<HTMLDivElement> {
  term: string;
  definition: ReactNode;
  /** anchored = under the trigger, 280px max (desktop) · docked = full-width sheet at the bottom (mobile) */
  placement?: "anchored" | "docked";
  /** Accessible label for the close button, e.g. "Close" / "Fermer" (docked only). */
  closeLabel?: string;
  /** Called on outside click, Escape, or the docked ✕ — the trigger's own re-click toggle is handled by the caller. */
  onClose?: () => void;
  /** The term's own page (`/glossary/<id>`), with its link text — REVIEW-02.md R2-13. Omit to render no link. */
  more?: { href: string; label: string };
}

/**
 * The definition itself, in a 5px-shadow panel — smaller than the main 7px
 * card shadow, to read as "secondary element, not a content block". Anchored
 * under the trigger on desktop; docked to the bottom of the viewport on
 * mobile, where an anchored popover always overflows a ~390px screen. Only
 * one popover is ever open at a time app-wide — the caller (glossary
 * open-id state) is responsible for that, this component just closes itself.
 */
export function DefinitionPopover({
  term,
  definition,
  placement = "anchored",
  closeLabel = "Close",
  onClose,
  more,
  className,
  style,
  ...rest
}: DefinitionPopoverProps) {
  const docked = placement === "docked";
  const ref = useRef<HTMLDivElement>(null);

  /**
   * REVIEW.md R-19. The panel had `role="dialog"` but never took focus, so a
   * screen-reader user was told a dialog existed and left standing outside
   * it, and Escape only worked because the handler is on `document`. Focus
   * moves in on open and returns to whatever opened it on close — otherwise
   * closing drops focus to <body> and the reader loses their place mid-
   * question.
   *
   * Guarded on `docked`: both placements render at once and CSS picks one
   * per viewport (see GlossaryTerm), so focusing both would have the mobile
   * copy win on desktop.
   */
  useEffect(() => {
    if (docked) return;
    const opener = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => opener?.focus?.();
  }, [docked]);

  useEffect(() => {
    if (!onClose) return;

    function handlePointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose?.();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose?.();
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const panel = (
    <div
      ref={ref}
      role="dialog"
      tabIndex={-1}
      aria-label={term}
      className={[styles.popover, docked ? styles.docked : styles.anchored, className ?? ""].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    >
      <div className={styles.topRow}>
        <div className={styles.term}>{term}</div>
        {docked && onClose ? (
          <button type="button" aria-label={closeLabel} onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        ) : null}
      </div>
      <div className={styles.definition}>{definition}</div>
      {/* REVIEW-02.md R2-13. The popover was a dead end: two sentences and
          nowhere to go, on the two pages (`/quiz`, `/r/<id>`) where most
          readers meet a term for the first time — and `/r/<id>` is
          `noindex, follow`, so this is also the one link every shared
          result passes on to the glossary. A real anchor: a crawler reads
          the server-rendered popover markup only when it is open, so what
          this earns is mostly the reader, not the index. */}
      {more ? (
        <a href={more.href} className={styles.more}>
          {more.label}
        </a>
      ) : null}
    </div>
  );

  if (!docked) return panel;

  return (
    <>
      {/* Dims/blocks the rest of the page without a visible scrim — matches the anchored variant's plain outside-click close. */}
      <button type="button" aria-label={closeLabel} className={styles.backdrop} onClick={onClose} tabIndex={-1} />
      <div className={styles.dockedWrap}>{panel}</div>
    </>
  );
}
