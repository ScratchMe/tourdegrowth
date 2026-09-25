import { ShareRow } from "tour-de-growth";

/*
 * The last row of December: replay the year (secondary) and copy a link with
 * the result (quiet). Copying confirms in words ("Copied.") in a live
 * region; if the clipboard is unavailable, the text is printed so it can be
 * selected by hand. Those two outcomes follow a click — this canvas shows
 * the resting row.
 */

const noop = () => {};
const box = { padding: 24, maxWidth: 720 } as const;

export const Resting = () => (
  <div style={box}>
    <ShareRow
      replayLabel="Replay the year"
      onReplay={noop}
      copyLabel="Copy a link with your result"
      copiedLabel="Copied."
      shareText="A year at Flixo: You held out. And it worked. Churn at 3.9%, trust at 71. Would you hold out? https://www.tourdegrowth.com/en/game/retention"
    />
  </div>
);

export const French = () => (
  <div style={box}>
    <ShareRow
      replayLabel="Rejouer l'année"
      onReplay={noop}
      copyLabel="Copier un lien avec ton résultat"
      copiedLabel="Copié."
      shareText="Une année chez Flixo : Tu as tenu. Et ça a marché. Résiliations à 3,9 %, confiance à 71. Et toi, tu tiendrais ? https://www.tourdegrowth.com/fr/game/retention"
    />
  </div>
);
