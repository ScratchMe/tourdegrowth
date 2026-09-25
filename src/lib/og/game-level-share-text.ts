import { RETENTION_INTRO } from "@/content/game/meta";
import { RETENTION_CONTENT } from "@/content/game/retention";
import { formatPct } from "@/lib/game/format";
import { RETENTION_LEVEL } from "@/lib/game/levels/retention";
import { tc } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

/**
 * Every string the level's share image draws, resolved in one language —
 * read by the image (`game-frame.tsx`) and by the font-coverage test
 * (`fonts.test.ts`), so the two can't drift.
 *
 * The tile labels are the game's own dashboard labels
 * (`RETENTION_CONTENT.dashboard`), not a second copy: the picture in a feed
 * must read like the screen the reader lands on. The churn figure is the
 * level's starting value, printed by the game's own formatter
 * (`formatPct`: « 6,0 % » with U+00A0, « 6.0% ») — the same number the
 * dashboard shows in January, never a figure typed into the image.
 *
 * The sentence is the third step of the level's paper intro ("two numbers are
 * not on it: they are waiting for you in December") — it is what the two
 * blocked tiles mean, so it is the one line that belongs under them.
 *
 * Uppercase is applied here rather than with `textTransform`, so the coverage
 * test sees the capitals Satori draws.
 */
export interface GameLevelTileText {
  label: string;
  /** Set on the one tile the dashboard shows; the two others are the hidden counters. */
  value?: string;
  unit?: string;
}

export interface GameLevelShareText {
  kicker: string;
  title: string;
  tiles: [GameLevelTileText, GameLevelTileText, GameLevelTileText];
  /** What a hidden tile says in place of its value. */
  hidden: string;
  sentence: string;
}

export function gameLevelShareText(locale: Locale): GameLevelShareText {
  const upper = (s: string) => s.toLocaleUpperCase(locale);
  const dashboard = RETENTION_CONTENT.dashboard;
  return {
    kicker: upper(tc(RETENTION_INTRO.eyebrow, locale)),
    title: upper(tc(RETENTION_INTRO.title, locale)),
    tiles: [
      {
        label: upper(tc(dashboard.churn, locale)),
        value: formatPct(locale, RETENTION_LEVEL.constants.churn0),
        unit: tc(dashboard.churnUnit, locale),
      },
      { label: upper(tc(dashboard.trust, locale)) },
      { label: upper(tc(dashboard.radar, locale)) },
    ],
    hidden: tc(dashboard.notOnDashboard, locale),
    sentence: tc(RETENTION_INTRO.steps[2]!.body, locale),
  };
}
