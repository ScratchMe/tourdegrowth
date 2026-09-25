import { GAME_HUB } from "@/content/game/hub";
import { GAME_LEVELS_BY_PILLAR } from "@/lib/game/levels";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { PILLARS, type Pillar } from "@/lib/scoring/pillars";

/**
 * Every string the hub's share image draws, resolved in one language — the
 * single list both the image (`game-frame.tsx`) and the font-coverage test
 * (`fonts.test.ts`) read, so the test checks what is drawn rather than a
 * copy of it that could drift.
 *
 * Kept apart from the level's list on purpose: this module reaches the hub's
 * copy only, and the level's 49 KB of text (`content/game/retention.ts`) must
 * not ride into the hub image's function for the sake of sharing a file
 * (content-fan-in.test.ts, VERCEL.md — weight is counted per route).
 *
 * No new copy: the kicker, the title, the zone questions and the two state
 * words are the hub page's own (plan §3.9 — "les cinq zones, une allumée").
 * Uppercase is applied HERE, not with `textTransform` in the frame, so the
 * coverage test sees the capitals Satori will actually draw (É, Ô…).
 */
export interface GameHubZoneText {
  pillar: Pillar;
  /** The Tour's pillar name — untranslated in both languages, like everywhere else. */
  name: string;
  question: string;
  /** "Jouable" / "Bientôt" — the state is carried by a word, never by colour alone (plan §6.2). */
  state: string;
  open: boolean;
}

export interface GameHubShareText {
  kicker: string;
  title: string;
  zonesLabel: string;
  zones: GameHubZoneText[];
}

export function gameHubShareText(locale: Locale): GameHubShareText {
  const upper = (s: string) => s.toLocaleUpperCase(locale);
  return {
    kicker: upper(tc(GAME_HUB.eyebrow, locale)),
    title: upper(tc(GAME_HUB.title, locale)),
    zonesLabel: upper(tc(GAME_HUB.zonesTitle, locale)),
    zones: PILLARS.map((pillar) => {
      const open = GAME_LEVELS_BY_PILLAR[pillar]?.enabled === true;
      return {
        pillar,
        name: upper(tc(UI_STRINGS.pillars[pillar], locale)),
        question: tc(GAME_HUB.zones[pillar].question, locale),
        state: upper(tc(open ? GAME_HUB.playable : GAME_HUB.soon, locale)),
        open,
      };
    }),
  };
}
