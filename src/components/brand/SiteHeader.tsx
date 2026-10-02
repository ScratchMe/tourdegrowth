import { Children, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n/locale";
import { SpaceBand, SpaceRace, type Space } from "./SpaceBand";
import { SiteHeaderCompactor } from "./SiteHeaderCompactor";
import styles from "./SiteHeader.module.css";

export interface SiteHeaderProps {
  locale: Locale;
  /**
   * The header row: the wordmark first, then whatever this page puts on the
   * right, in that order. A control marked `data-header-compact="leave"`
   * leaves the compact line (the landing's two quiet links); everything else
   * stays, and a kept control followed by leaving ones closes up on the
   * right over their room. A control with a transition of its own (a
   * Button's hover) is wrapped in a `<span>` that carries the mark.
   */
  children: ReactNode;
  /**
   * The width the row aligns to — the page's own content column:
   * `wide` (the app shell, 1040px), `reading` (the prose column, 760px),
   * `narrow` (the quiz and the Deep dive, 720px).
   */
  width?: "wide" | "reading" | "narrow";
  /** The space this page belongs to — hangs the space band under the row, and draws the compact race. Omit on a page that belongs to none. */
  space?: Space;
  /** Passed to the band and the compact race — see `SpaceBand`. `false` in the quiz and the Deep dive. */
  bandLinked?: boolean;
}

/**
 * The site header — design I + B, retained by Antoine on 2026-09-28, and its
 * compact state, design system extension 08 (2026-10-02).
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
 * **The compact state** (Antoine: the header is pleasant on a phone held
 * upright, too tall on a desktop). In a landscape window, once the page has
 * scrolled, the header becomes one line of 48px — the wordmark, the race
 * (this leg filled in its space's colour), the page's own controls — over
 * the band's colour slimmed to a stripe: 54px painted instead of 118, 50px
 * instead of 74 without a band. The header's box never changes height: only
 * layers inside it move, by transform (the glass, the row, the band, the
 * edge), so nothing under it moves and the state cannot feed back into the
 * scroll. Full again at the very top, and while keyboard focus is inside.
 * A phone held upright, a page without JavaScript or before hydration: the
 * header as it was. The motion and every value are in
 * `design/ds-extension-08-return/MOTION.md`.
 *
 * `--sticky-offset` (globals.css) is this header's painted height, for the
 * few things that stick under it and for anchors and focus to land clear of
 * it; it follows the compact state. Server-safe: rendered by Server and
 * Client Components alike; its one client piece is `SiteHeaderCompactor`.
 */
export function SiteHeader({ locale, children, width = "wide", space, bandLinked }: SiteHeaderProps) {
  const [brand, ...rest] = Children.toArray(children);
  return (
    <header className={styles.header} data-site-header={space ? "band" : "plain"} data-space={space} data-compact="false">
      <div className={styles.bar}>
        <div className={styles.glass} data-header-glass="" aria-hidden="true" />
        <div className={`${styles.row} ${styles[width]}`} data-header-row="">
          <div className={styles.lead}>
            {brand}
            {space && <SpaceRace locale={locale} space={space} linked={bandLinked} variant="compact" className={styles.race} />}
          </div>
          {rest.length > 0 && <div className={styles.end}>{rest}</div>}
        </div>
      </div>
      {space && (
        <div className={styles.band}>
          <SpaceBand locale={locale} space={space} linked={bandLinked} width={width} />
        </div>
      )}
      <div className={styles.edge} data-header-edge="" aria-hidden="true" />
      <SiteHeaderCompactor />
    </header>
  );
}
