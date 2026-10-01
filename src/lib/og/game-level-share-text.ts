import { metricFormat } from "@/lib/game/format";
import type { LevelDefinition } from "@/lib/game/types";
import { tc, type Translatable } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

/**
 * Every string the level's share image draws, resolved in one language —
 * read by the image (`game-frame.tsx`) and by the font-coverage test
 * (`fonts.test.ts`), so the two can't drift.
 *
 * The tile labels are the game's own dashboard labels (the level's
 * `dashboard` copy), not a second copy: the picture in a feed must read like
 * the screen the reader lands on. The figure is the level's starting value,
 * printed by the level's own format (`metricFormat`: « 6,0 % » with U+00A0
 * at Flixo, « 2 000 » new customers at Pédalix) — the same number the
 * dashboard shows in January, never a figure typed into the image.
 *
 * The level arrives as a parameter, never imported here: each level's image
 * passes its own intro, dashboard and model, so one level's image does not
 * carry the other level's text into its function (content-fan-in.test.ts).
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

/** What a level brings to its image: its intro, its dashboard's labels, and its model's starting number. */
export interface GameLevelShareSource {
  intro: { eyebrow: Translatable; title: Translatable; steps: readonly { body: Translatable }[] };
  dashboard: {
    metric: Translatable;
    metricUnit: Translatable;
    trust: Translatable;
    radar: Translatable;
    notOnDashboard: Translatable;
  };
  level: Pick<LevelDefinition<string>, "constants" | "display">;
}

export function gameLevelShareText(locale: Locale, { intro, dashboard, level }: GameLevelShareSource): GameLevelShareText {
  const upper = (s: string) => s.toLocaleUpperCase(locale);
  return {
    kicker: upper(tc(intro.eyebrow, locale)),
    title: upper(tc(intro.title, locale)),
    tiles: [
      {
        label: upper(tc(dashboard.metric, locale)),
        value: metricFormat(level.display).value(locale, level.constants.metric0),
        unit: tc(dashboard.metricUnit, locale),
      },
      { label: upper(tc(dashboard.trust, locale)) },
      { label: upper(tc(dashboard.radar, locale)) },
    ],
    hidden: tc(dashboard.notOnDashboard, locale),
    sentence: tc(intro.steps[2]!.body, locale),
  };
}
