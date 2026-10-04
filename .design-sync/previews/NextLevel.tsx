import { NextLevel } from "tour-de-growth";

/*
 * The block that closes December on another level: an eyebrow, the level's
 * title with the dark patterns it covers, and a status word. The status is a
 * word, never only a greyed card. With an `href` the level is open: a solid
 * edge, and the title is the link to it — the first open level the player
 * has not finished (C31, C75). Without one, dashed: a level not built yet,
 * kept for the next ones.
 */

const box = { padding: 24, maxWidth: 720 } as const;

/** Level 1's December, since level 2 opened: its title links to Pédalix's year. */
export const Playable = () => (
  <div style={box}>
    <NextLevel
      eyebrow="Next level"
      title={'"How people find you": the countdown timer, the creeping price, the fake stock'}
      status="playable"
      href="/en/game/acquisition?from=other_level"
    />
  </div>
);

/** Level 2's December, in French: « Niveau suivant » leads to Flixo's year, the first level its player has not finished (C75). */
export const PlayableFrench = () => (
  <div style={box}>
    <NextLevel
      eyebrow="Niveau suivant"
      title="« S'ils reviennent » : la pause mise en avant, le bouton enterré, la résiliation par téléphone"
      status="jouable"
      href="/fr/game/retention?from=other_level"
    />
  </div>
);

/** A level not built yet: dashed, no link — what level 1 showed before 2026-10-01. */
export const ComingSoon = () => (
  <div style={box}>
    <NextLevel
      eyebrow="Next level"
      title={'"How people find you": the countdown timer, the creeping price, the fake stock'}
      status="coming soon"
    />
  </div>
);
