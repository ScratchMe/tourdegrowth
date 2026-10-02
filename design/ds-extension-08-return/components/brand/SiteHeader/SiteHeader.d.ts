import * as React from 'react';
import type { SpaceId } from '../SpaceBand/SpaceBand';

/**
 * SiteHeader — design system extension 08.
 * Today's sticky header, plus a compact state: in a landscape window, once
 * the page has scrolled, the row and the band become one line (48px) over
 * the band's colour slimmed to a stripe — 54px in all, 50px on a page with
 * no band. Full again at the very top, and while keyboard focus is inside.
 *
 * Without JavaScript, before hydration, or in a phone held upright, it is
 * today's header, pixel for pixel.
 */
export interface SiteHeaderProps {
  locale: 'en' | 'fr';
  /**
   * The wordmark first (WordmarkLink, or Wordmark where the page must not be
   * left — the quiz, the Deep dive), then the page's own controls, in
   * today's order. Mark a control `data-header-compact="leave"` for it to
   * leave the compact line (the landing's Glossary and How it works). The
   * others stay; a kept control followed by leaving ones closes up on the
   * right over the room they leave.
   */
  children: React.ReactNode;
  /** The page's column: today's three widths. Default "wide". */
  width?: 'wide' | 'reading' | 'narrow';
  /** The space the page belongs to: draws the band, and the compact race. Omit on a plain page. */
  space?: SpaceId;
  /** False on the quiz and the Deep dive: the race is a map, not a way out. Default true. */
  bandLinked?: boolean;
  /** Which legs are open, if not as built (board, tests). */
  open?: Partial<Record<SpaceId, boolean>>;
}

/** Server component: the markup is the same with or without the compact state. */
export declare const SiteHeader: React.FC<SiteHeaderProps>;

/**
 * The header's one client piece ("use client"). SiteHeader renders it; you
 * never do. It mounts an empty hidden marker and calls `attachCompactHeader`
 * on the enclosing <header>.
 */
export declare const SiteHeaderCompactor: React.FC;

/**
 * The behaviour, free of React (compactHeader.js): sets `data-compact`,
 * `data-compact-ready`, the compact measures on the header
 * (`--header-glass-scale`, `--header-row-shift`, `--header-edge-shift`), the
 * close-up on kept controls (`--header-close-up`, `data-header-close-up`)
 * and `--sticky-offset-compact` on <html>. Returns a cleanup function.
 */
export declare function attachCompactHeader(header: HTMLElement): () => void;
