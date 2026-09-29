import { SpaceBand } from "tour-de-growth";

/*
 * The space band — « Un Tour, trois étapes » (the decision's words, never
 * the band's: it does not say « étape »). It hangs under the header of
 * every page that belongs to one of the three legs of the race, and says
 * which: the leg's pictogram, « 1/3 · Plaine », its name, and on the right
 * the whole race with this leg filled. Each leg wears its colour: ink for the
 * Tour (the red kept for its pictogram), ultramarine for the engine, ochre
 * for the game.
 *
 * It never says « étape »: the product already calls the five AARRR steps
 * that, right under it. A leg not open yet stays in the race, greyed, dashed,
 * « bientôt », never a link. `open` is passed here so the preview does not
 * depend on the build's flags.
 */

const ALL_OPEN = { engine: true, game: true } as const;

/** The Tour: the landing, the quiz, the result. Ink, the red pictogram. */
export const Tour = () => (
  <div style={{ width: 1040 }}>
    <SpaceBand locale="fr" space="tour" open={ALL_OPEN} />
  </div>
);

/** The engine: ultramarine. */
export const Engine = () => (
  <div style={{ width: 1040 }}>
    <SpaceBand locale="fr" space="engine" open={ALL_OPEN} />
  </div>
);

/** The game: ochre, ink type. */
export const Game = () => (
  <div style={{ width: 1040 }}>
    <SpaceBand locale="en" space="game" open={ALL_OPEN} />
  </div>
);

/** While the engine and the game are closed: the race stays whole, the two legs greyed and « bientôt ». */
export const NotOpenYet = () => (
  <div style={{ width: 1040 }}>
    <SpaceBand locale="fr" space="tour" open={{ engine: false, game: false }} />
  </div>
);

/** In the quiz's narrower column: the race keeps its pictograms and numbers, the words go to screen readers. */
export const Narrow = () => (
  <div style={{ width: 720 }}>
    <SpaceBand locale="en" space="tour" width="narrow" linked={false} open={{ engine: false, game: true }} />
  </div>
);

/** A phone: the name on top, its place under it, the race as three numbers. */
export const Phone = () => (
  <div style={{ width: 390 }}>
    <SpaceBand locale="fr" space="engine" open={{ engine: true, game: false }} />
  </div>
);
