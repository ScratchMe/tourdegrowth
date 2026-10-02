// StageScore — design system extension 05. Replaces PillarChip.
// Plain React, no JSX, so the board can run this very file without a build.
import React from "react";

const h = React.createElement;

const shareOf = (score, total) => {
  const value = Number(score) / total;
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
};

/**
 * One stage's score, as a row of the score sheet: "18/20 Acquisition ?".
 * A value, not an action — read it, don't press it. The only thing to touch
 * is the "?" passed as `children` (a GlossaryTerm), or, on the landing, the
 * stage name when `href` makes it a link.
 *
 * Always inside a `StageScores` list (it renders an <li>).
 */
export const StageScore = ({
  stage,
  score,
  total = 20,
  tone = "neutral",
  href,
  linkLabel,
  id,
  children,
}) => {
  const share = shareOf(score, total);
  const name = href
    ? h(
        "a",
        { className: "StageScore_link", href, "aria-label": linkLabel },
        stage,
      )
    : stage;

  return h(
    "li",
    {
      id,
      className: ["StageScore_row", tone === "alert" && "StageScore_alert"].filter(Boolean).join(" "),
    },
    h(
      "span",
      { className: "StageScore_score" },
      h("span", { className: "StageScore_figure" }, String(score)),
      `/${total}`,
    ),
    " ",
    h(
      "span",
      { className: "StageScore_meter", "aria-hidden": "true" },
      h("span", { className: "StageScore_fill", style: { "--score-share": `${share * 100}%` } }),
    ),
    " ",
    h("span", { className: "StageScore_name" }, name, children ?? null),
  );
};
