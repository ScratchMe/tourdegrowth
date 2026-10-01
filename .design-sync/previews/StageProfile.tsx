import { StageProfile } from "tour-de-growth";

/*
 * The route profile (« Profil du parcours », never « profil de l'étape »:
 * the climbs ARE the étapes) — design I + B, retained by Antoine on
 * 2026-09-28. The five AARRR stages as a road book draws the day's route:
 * one climb per stage, as
 * high as the points it is MISSING out of 20, so a stage at 20/20 is flat
 * road and the one that stalls is the highest climb. The stage the page
 * names is red and flagged « HC » (hors catégorie).
 *
 * It shows the shape; the score sheet under it (`StageScores`) gives the
 * numbers and is its table view, so the whole figure is aria-hidden. Never
 * render it without the sheet. `hot` follows the `Bottleneck` block's rule: the stages it
 * names, all of the tied ones on a shared bottleneck, none on a level board.
 *
 * All copy is the product's own, from `UI_STRINGS.profile` and
 * `UI_STRINGS.profileAbbr`; the abbreviations are set in capitals by the
 * stylesheet.
 */

const LABELS = ["Acq.", "Act.", "Ret.", "Ref.", "Rev."];
const stages = (scores: number[], hot: number[] = []) =>
  scores.map((score, i) => ({ abbr: LABELS[i]!, score, hot: hot.includes(i) }));

/** The sample result, 18 · 12 · 8 · 16 · 20: retention stalls, clear of the rest. */
export const Clear = () => (
  <div style={{ width: 400 }}>
    <StageProfile
      stages={stages([18, 12, 8, 16, 20], [2])}
      title="Route profile"
      legend="height = points missing out of 20"
      flag="HC"
    />
  </div>
);

/** A shared bottleneck: every tied stage is flagged, at the same weight. */
export const Shared = () => (
  <div style={{ width: 400 }}>
    <StageProfile
      stages={stages([7, 7, 9, 16, 20], [0, 1, 2])}
      title="Profil du parcours"
      legend="hauteur = points manquants sur 20"
      flag="HC"
    />
  </div>
);

/** A level board: every stage strong, nothing flagged — low hills, no red. */
export const Level = () => (
  <div style={{ width: 400 }}>
    <StageProfile
      stages={stages([16, 20, 16, 20, 16])}
      title="Route profile"
      legend="height = points missing out of 20"
      flag="HC"
    />
  </div>
);

/** A phone's column: the words wrap, the labels stay HTML and never scale with the width. */
export const Phone = () => (
  <div style={{ width: 342 }}>
    <StageProfile
      stages={stages([18, 12, 8, 16, 20], [2])}
      title="Profil du parcours"
      legend="hauteur = points manquants sur 20"
      flag="HC"
    />
  </div>
);
