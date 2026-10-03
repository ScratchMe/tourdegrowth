"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./DefinitionPopover.module.css";

export interface DefinitionPopoverProps extends HTMLAttributes<HTMLDivElement> {
  term: string;
  definition: ReactNode;
  /**
   * `auto` — what GlossaryTerm opens: ONE panel, in the top layer, that CSS
   * places — under its trigger from 641px where anchor positioning exists
   * (the trigger carries `--glossary-definition`), a sheet docked to the
   * bottom of the screen everywhere else.
   * `anchored` / `docked` — the two shapes drawn where they stand, for a
   * page or a preview that shows one without opening anything.
   */
  placement?: "auto" | "anchored" | "docked";
  /** Accessible label for the ✕, e.g. "Close" / "Fermer" — shown wherever the panel is a sheet. */
  closeLabel?: string;
  /** Called on outside click, Escape, or the docked ✕ — the trigger's own re-click toggle is handled by the caller. */
  onClose?: () => void;
  /** The term's own page (`/glossary/<id>`), with its link text — REVIEW-02.md R2-13. Omit to render no link. */
  more?: { href: string; label: string };
}

/**
 * The definition itself, in a 4px-shadow panel (`--shadow-panel`) — smaller
 * than the 6px card shadow, to read as "secondary element, not a content block". Anchored
 * under the trigger on desktop; docked to the bottom of the viewport on
 * mobile, where an anchored popover always overflows a ~390px screen. Only
 * one popover is ever open at a time app-wide — the caller (glossary
 * open-id state) is responsible for that, this component just closes itself.
 *
 * `auto` is one element for both (audit du kit §6, CHANTIERS.md A4,
 * 2026-09-29). It used to be two, both rendered, CSS hiding one, each over
 * the page by its own `z-index`, three in all. It is now a `popover="manual"`
 * shown on mount: the top layer covers everything with no z-index, and the
 * shape is the stylesheet's alone. Manual, not `auto`: this component
 * already closes on Escape and on a press outside, and the trigger's own
 * click toggles it; a native light dismiss would close it on that press and
 * the click would open it again.
 *
 * On a phone the popover is the whole screen, transparent, and the sheet a
 * card inside it: a tap outside the sheet lands on the popover, so it never
 * reaches the page behind (a quiz answer, say) — the job of the old
 * transparent full-screen button. A popover's `::backdrop` cannot do it: it
 * takes no clicks (measured, Chromium 141). On a desktop the popover shrinks
 * to its card, under the trigger.
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
  // The drawn box: the card inside `auto`'s layer, the panel itself otherwise.
  const cardRef = useRef<HTMLDivElement>(null);

  // Into the top layer before the first paint. A browser without the Popover
  // API ignores the attribute and draws the panel where it stands, as a sheet.
  useLayoutEffect(() => {
    const panel = ref.current;
    if (placement !== "auto" || !panel || typeof panel.showPopover !== "function") return;
    panel.showPopover();
    return () => {
      if (panel.matches(":popover-open")) panel.hidePopover();
    };
  }, [placement]);

  /**
   * REVIEW.md R-19. The panel had `role="dialog"` but never took focus, so a
   * screen-reader user was told a dialog existed and left standing outside
   * it, and Escape only worked because the handler is on `document`. Focus
   * moves in on open and returns to whatever opened it on close — otherwise
   * closing drops focus to <body> and the reader loses their place mid-
   * question. Now on a phone too: there is one panel, so there is no longer
   * a mobile copy that would steal the focus from the desktop one.
   *
   * Not on `docked`, which is only ever drawn in place, never opened.
   *
   * The way back never scrolls (`preventScroll`, A18 T6): a press on another
   * « ? » closes this one on its pointerdown, and a focus that scrolled the
   * page back to this opener moved the other « ? » away before the press
   * ended — the click landed on nothing and no definition opened (measured on
   * the engine's number screen, two « ? » 400px apart). The focus still
   * returns; the page stays where the reader is.
   */
  useEffect(() => {
    if (docked) return;
    const opener = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => opener?.focus?.({ preventScroll: true });
  }, [docked]);

  useEffect(() => {
    if (!onClose) return;

    function handlePointerDown(event: PointerEvent) {
      const card = cardRef.current ?? ref.current;
      if (card && !card.contains(event.target as Node)) onClose?.();
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

  const content = (
    <>
      <div className={styles.topRow}>
        <div className={styles.term}>{term}</div>
        {placement !== "anchored" && onClose ? (
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
    </>
  );

  if (placement === "auto") {
    return (
      <div
        ref={ref}
        role="dialog"
        tabIndex={-1}
        aria-label={term}
        popover="manual"
        className={[styles.auto, className ?? ""].filter(Boolean).join(" ")}
        style={style}
        {...rest}
      >
        <div ref={cardRef} className={[styles.popover, styles.autoCard].join(" ")}>
          {content}
        </div>
      </div>
    );
  }

  const panel = (
    <div
      ref={ref}
      role="dialog"
      tabIndex={-1}
      aria-label={term}
      className={[styles.popover, styles[placement], className ?? ""].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    >
      {content}
    </div>
  );

  return docked ? <div className={styles.dockedWrap}>{panel}</div> : panel;
}
