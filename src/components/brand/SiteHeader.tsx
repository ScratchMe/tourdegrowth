import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n/locale";
import { SpaceBand, type Space } from "./SpaceBand";
import styles from "./SiteHeader.module.css";

export interface SiteHeaderProps {
  locale: Locale;
  /** The header row: the wordmark first, then whatever this page puts on the right. */
  children: ReactNode;
  /**
   * The width the row aligns to — the page's own content column:
   * `wide` (the app shell, 1040px), `reading` (the prose column, 760px),
   * `narrow` (the quiz and the Deep dive, 720px).
   */
  width?: "wide" | "reading" | "narrow";
  /** The space this page belongs to — hangs the space band under the row. Omit on a page that belongs to none. */
  space?: Space;
  /** Passed to the band — see `SpaceBand`. `false` in the quiz and the Deep dive. */
  bandLinked?: boolean;
}

/**
 * The site header — design I + B, retained by Antoine on 2026-09-28.
 *
 * One component for the five headers that were the same rule pasted five
 * times (the landing, the content pages, the result, the quiz, the Deep
 * dive): wordmark left, the page's own controls right, one row. What changes
 * with this design is shared, so it lives here once:
 *
 *  - it sticks to the top of the window, on frosted paper — the row and its
 *    band stay in view while the page scrolls under them;
 *  - on a page that belongs to one of the three spaces, the space band
 *    hangs from it (`SpaceBand`) and is its bottom edge; without one, the
 *    dashed rule it always had.
 *
 * `--sticky-offset` (globals.css) is this header's height, for the few
 * things that stick under it and for anchors and focus to land clear of it.
 * Server-safe: rendered by Server and Client Components alike.
 */
export function SiteHeader({ locale, children, width = "wide", space, bandLinked }: SiteHeaderProps) {
  return (
    <header className={styles.header} data-site-header={space ? "band" : "plain"}>
      <div className={`${styles.row} ${styles[width]}`}>{children}</div>
      {space && <SpaceBand locale={locale} space={space} linked={bandLinked} width={width} />}
    </header>
  );
}
