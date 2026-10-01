import { ShareRow } from "tour-de-growth";

/*
 * The last row of December: replay the year (secondary) and copy a link with
 * the result (quiet). Copying confirms in words ("Copied.") in a live
 * region; if the clipboard is unavailable, the text is printed so it can be
 * selected by hand. Those two outcomes follow a click — this canvas shows
 * the resting row.
 *
 * Every prop is what the island passes (`GameIsland.tsx`): the labels from
 * content/game/retention.ts (`share`), and `shareText(ctx, state, url)` from
 * `island-view.ts` on reference year A played to its end
 * (`endingState("applause")`, `PATH_A` in lib/game/__tests__/paths.ts — the
 * same year as `EndingHero` Applause), with the URL the page passes:
 * `origin + pathname`, so the production address in the page's language.
 * The text only shows if the clipboard refuses it; it is still the model's.
 */

const noop = () => {};
const box = { padding: 24, maxWidth: 720 } as const;

/** Reference year A, applause, in English. */
export const Resting = () => (
  <div style={box}>
    <ShareRow
      replayLabel="Replay the year"
      onReplay={noop}
      copyLabel="Copy a link with your result"
      copiedLabel="Copied."
      shareText="A year at Flixo: You held out. And it worked. Churn at 4.0%, trust at 83 / 100. Would you hold out? https://www.tourdegrowth.com/en/game/retention"
    />
  </div>
);

/** The same year in French: the decimal comma, U+00A0 before `:`, `%` and `?`. */
export const French = () => (
  <div style={box}>
    <ShareRow
      replayLabel="Rejouer l'année"
      onReplay={noop}
      copyLabel="Copier un lien avec ton résultat"
      copiedLabel="Copié."
      shareText="Une année chez Flixo : Tu as tenu. Et ça a marché. Résiliations à 4,0 %, confiance à 83 / 100. Et toi, tu tiendrais ? https://www.tourdegrowth.com/fr/game/retention"
    />
  </div>
);
