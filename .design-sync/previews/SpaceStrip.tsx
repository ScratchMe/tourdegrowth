import { SpaceStrip } from "tour-de-growth";

/*
 * The race in three cards — design I + B, retained by Antoine on 2026-09-28.
 * On the landing only, under the hero: what the three legs are, for a
 * visitor who has not started. Each card wears its space's colour along the
 * top and the band's sign (pictogram and number), says when it comes
 * (« Maintenant », « Ensuite », « Pour finir ») and what it gives.
 *
 * The heading is the band's « Le Tour en trois parties »: the three spaces
 * are never « étapes », the AARRR stage's word. An open card is a door
 * (C15, A7.9): ONE link, its name, stretched over the whole card — the
 * Tour's leads to the quiz, the others to their space. It stays secondary to
 * the hero's button: no red fill; a hover underlines the name and lifts the
 * card, and the focus ring goes round the whole card (neither shows in a
 * still). A leg not open yet has no link: dashed, and « bientôt », never a
 * colour alone. The game's card is set in the night. `open` is passed so the
 * preview does not depend on the build.
 *
 * The strip folds on its own width (a container query), not the window's:
 * three columns from 760px, so the two wide cards (up to 880px) hold them.
 */

/** Every leg open, three doors: the Tour lifted on its shadow, the engine in ultramarine, the game at night. */
export const AllOpen = () => (
  <div style={{ maxWidth: 880 }}>
    <SpaceStrip locale="fr" open={{ engine: true, game: true }} />
  </div>
);

/** Today in production: the engine and the game still closed, dashed and « soon », with no link; the Tour's card is the one door. */
export const NotOpenYet = () => (
  <div style={{ maxWidth: 880 }}>
    <SpaceStrip locale="en" open={{ engine: false, game: false }} />
  </div>
);

/** A phone: one column, the kind of leg (« Contre-la-montre ») beside the number. */
export const Phone = () => (
  <div style={{ width: 350 }}>
    <SpaceStrip locale="fr" open={{ engine: false, game: true }} />
  </div>
);
