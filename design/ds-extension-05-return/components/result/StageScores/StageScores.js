// StageScores — design system extension 05.
// Plain React, no JSX, so the board can run this very file without a build.
import React from "react";

const h = React.createElement;

/**
 * The five stage scores as one score sheet: an ordered list, AARRR order,
 * one `StageScore` row per stage (or the roast's `StampedPillar` in the
 * weakest stage's place). The list is the grid; each row lines its score,
 * meter and name up with the others, so the five meters compare.
 *
 * `md` (default) is the result's size and shrinks below 760px by itself;
 * `sm` is the landing's preview at every width.
 */
export const StageScores = ({ size = "md", label, className, children }) =>
  h(
    "ol",
    {
      className: ["StageScores_list", size === "sm" ? "StageScores_sm" : "StageScores_md", className]
        .filter(Boolean)
        .join(" "),
      "aria-label": label,
    },
    children,
  );
