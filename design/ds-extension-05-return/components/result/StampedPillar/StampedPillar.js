// StampedPillar (proposed name: StageStamp) — extension 05's redraw.
// Plain React, no JSX, so the board can run this very file without a build.
import React from "react";

const h = React.createElement;

/**
 * The roast's stamp: the weakest stage, inked across its row of the score
 * sheet in place of its StageScore. "RETENTION · 8/20 · DEAD LAST".
 * A row of a `StageScores` list (it renders an <li>). Roast only; never for
 * anything else.
 */
export const StampedPillar = ({ pillar, score, total = 20, suffix }) =>
  h(
    "li",
    { className: "StampedPillar_row" },
    h(
      "span",
      { className: "StampedPillar_stamped" },
      // The spaces between the parts are text nodes: the layout ignores them
      // in a flex row, a screen reader needs them ("Retention 8/20 dead last").
      h("span", null, pillar),
      " ",
      h("span", { "aria-hidden": "true" }, "·"),
      " ",
      h("span", { className: "StampedPillar_score" }, `${score}/${total}`),
      " ",
      h("span", { "aria-hidden": "true" }, "·"),
      " ",
      h("span", null, suffix),
    ),
  );
