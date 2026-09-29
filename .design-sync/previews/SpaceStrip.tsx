import { SpaceStrip } from "tour-de-growth";

/*
 * The race in three cards — design I + B, retained by Antoine on 2026-09-28.
 * On the landing only, under the hero: what the three legs are, for a
 * visitor who has not started. Each card wears its space's colour along the
 * top and the band's sign (pictogram and number), says when it comes
 * (« Maintenant », « Ensuite », « Pour finir ») and what it gives.
 *
 * The heading is the band's « Le Tour en trois parties »: the three spaces
 * are never « étapes », the AARRR stage's word. The cards are not links —
 * the hero's button and the band are the doors. A leg not open yet is dashed
 * and says « bientôt », never a colour alone. The game's card is set in the
 * night. `open` is passed so the preview does not depend on the build.
 */

/** Every leg open: the Tour lifted on its shadow, the engine in ultramarine, the game at night. */
export const AllOpen = () => (
  <div style={{ width: 992 }}>
    <SpaceStrip locale="fr" open={{ engine: true, game: true }} />
  </div>
);

/** Today in production: the engine and the game still closed, dashed and « soon ». */
export const NotOpenYet = () => (
  <div style={{ width: 992 }}>
    <SpaceStrip locale="en" open={{ engine: false, game: false }} />
  </div>
);

/** A phone: one column, the kind of stage (« Contre-la-montre ») beside the number. */
export const Phone = () => (
  <div style={{ width: 350 }}>
    <SpaceStrip locale="fr" open={{ engine: false, game: true }} />
  </div>
);
