import * as React from 'react';

/**
 * SpaceBand — design system extension 08.
 * The band is unchanged. Its race is now exported on its own, `SpaceRace`,
 * so the compact header can carry the race in its one line.
 */
export type SpaceId = 'tour' | 'engine' | 'game';

export declare const SPACES: readonly SpaceId[];

/** The three pictograms, 34 × 22 (space-pictos), unchanged. */
export declare const SPACE_PICTO: Record<SpaceId, React.ReactElement>;

export interface SpaceRaceProps {
  locale: 'en' | 'fr';
  /** The leg you are on: filled, never a link (`aria-current="page"`). */
  space: SpaceId;
  /** False on the quiz and the Deep dive: every pill a span. Default true. */
  linked?: boolean;
  /** Which legs are open, if not as built. A closed leg is greyed, dashed, « bientôt », never a link. */
  open?: Partial<Record<SpaceId, boolean>>;
  /**
   * "band" (default): today's race, on the band's colour.
   * "compact": the same three pills on the header's paper. The current leg
   * keeps its pictogram and short name in its space's colour; the others
   * show their number (their names stay for screen readers). Its links are
   * out of the Tab order (tabIndex -1): a keyboard user reaching the header
   * gets the full header, and the band's race, back. Clicks are tracked
   * with the source "space_band_compact".
   */
  variant?: 'band' | 'compact';
  hidden?: boolean;
}

export declare const SpaceRace: React.FC<SpaceRaceProps>;

export interface SpaceBandProps {
  locale: 'en' | 'fr';
  space: SpaceId;
  linked?: boolean;
  /** The page's column. Default "wide". */
  width?: 'wide' | 'reading' | 'narrow';
  open?: Partial<Record<SpaceId, boolean>>;
}

/** Unchanged: pictogram, place and kind, name, and the race. Server-safe, free of state. */
export declare const SpaceBand: React.FC<SpaceBandProps>;
