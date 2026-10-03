// WorthBars — design system extension 09. What one new customer costs, and
// what it brings back in margin over its life: two bars on one scale.
// Plain React, no JSX, so the board runs this very file without a build.
import React from "react";

const h = React.createElement;

const pct = (x, top) => `${Math.max(0, Math.min(100, (x / top) * 100))}%`;

/**
 * Q3. Two lengths in one unit, both ink: the CAC ("costs") and the LTV
 * ("brings back"). A dashed axis line carries the end of the cost across
 * both rows, so the eye reads at once whether the margin reaches it. The
 * gap is measured by a bracket and named in words ("~€400 short").
 *
 * - A range (an estimate upstream): the bar is solid to its low end and
 *   hatched to its high end — the system's hatch for an estimate.
 * - Unknown (no gross margin): the dashed, hatched "?" box across the
 *   track, the value "?", and what is missing. Never an empty bar: an
 *   empty bar reads as zero (constraint 3).
 *
 * The text of each row is real text (label, value); the bars are
 * decoration (`aria-hidden`), so a screen reader hears "Costs €1,900.
 * Brings back ~€1,500. ~€400 short."
 */
export const WorthBars = ({ cost, brings, gap, size = "screen", className }) => {
  const top = Math.max(cost.amount[1], brings.amount ? brings.amount[1] : cost.amount[1] * 1.25);
  const cEnd = cost.amount[1];
  const b = brings.amount;
  return h("dl", { className: ["WorthBars_root", size === "slide" ? "WorthBars_slide" : "", className].filter(Boolean).join(" ") },
    // The line where the cost ends, across both rows, behind the bars.
    h("div", { className: "WorthBars_guide", "aria-hidden": "true" },
      h("span", { className: "WorthBars_costLine", style: { left: pct(cEnd, top) } })),
    h("dt", { className: "WorthBars_label WorthBars_rowCost" }, cost.label),
    h("dd", { className: "WorthBars_track WorthBars_rowCost", "aria-hidden": "true" },
      h("span", { className: "WorthBars_bar", style: { width: pct(cost.amount[0], top) } }),
      cost.amount[1] > cost.amount[0]
        ? h("span", { className: "WorthBars_range", style: { left: pct(cost.amount[0], top), width: pct(cost.amount[1] - cost.amount[0], top) } })
        : null),
    h("dd", { className: "WorthBars_value WorthBars_rowCost" }, cost.value),
    h("dt", { className: "WorthBars_label WorthBars_rowBrings" }, brings.label),
    h("dd", { className: "WorthBars_track WorthBars_rowBrings", "aria-hidden": "true" },
      b
        ? [
            h("span", { key: "bar", className: "WorthBars_bar", style: { width: pct(b[0], top) } }),
            b[1] > b[0] ? h("span", { key: "range", className: "WorthBars_range", style: { left: pct(b[0], top), width: pct(b[1] - b[0], top) } }) : null,
            gap && gap.kind !== "maybe"
              ? h("span", {
                  key: "bracket",
                  className: "WorthBars_bracket",
                  style: { left: pct(Math.min(b[1], cEnd), top), width: pct(Math.abs(b[1] - cEnd), top) },
                })
              : null,
          ]
        : h("span", { className: "WorthBars_unknown" }, h("span", { className: "WorthBars_unknownMark" }, "?"))),
    h("dd", { className: "WorthBars_value WorthBars_rowBrings" }, brings.value),
    gap ? h("dd", { className: "WorthBars_gap" }, gap.label) : null,
    !b && brings.unknown ? h("dd", { className: "WorthBars_gap" }, brings.unknown) : null);
};
