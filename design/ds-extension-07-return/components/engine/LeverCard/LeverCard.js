// LeverCard — design system extension 07. "What if?" through ONE lever: the
// one on the stage that holds you back. Plain React, no JSX.
import React from "react";
import { Button, MetaLabel } from "tour-de-growth";

const h = React.createElement;

/**
 * Q17. On the board, "What if?" is no longer a folded panel of eight
 * sliders: it is this card, one lever — the stage a target names, or, with
 * no target, the first typed lever in funnel order — and the two figures it
 * moves most. "All 8 levers and what the calculation assumes →" opens the
 * full panel (today's, unchanged: levers moving together, assumptions
 * printed). The figures come from the engine's own calculation.
 *
 * `moved`: the title says the move in words ("If activation rate went from
 * 18% to 22%") and "Back to today" appears. A lever not typed has no card.
 */
export const LeverCard = ({
  eyebrow,
  title,
  lever,
  figures,
  allLabel,
  onAll,
  resetLabel,
  onReset,
  moved,
  headingId = "lever-title",
}) =>
  h("section", { className: "LeverCard_root", "aria-labelledby": headingId },
    h(MetaLabel, { as: "h2", size: "sm", tone: "muted", wide: true }, eyebrow),
    h("p", { id: headingId, className: "LeverCard_title" }, title),
    h("div", { className: "LeverCard_lever" },
      h("label", { htmlFor: lever.id, className: "LeverCard_label" }, lever.label),
      h("input", {
        id: lever.id,
        type: "range",
        className: "LeverCard_slider",
        min: lever.min,
        max: lever.max,
        step: lever.step,
        value: lever.value,
        "aria-valuetext": lever.valueText,
        style: { "--lever-fill": `${((lever.value - lever.min) / (lever.max - lever.min)) * 100}%` },
        onInput: lever.onChange ? (e) => lever.onChange(Number(e.currentTarget.value)) : undefined,
      }),
      h("output", { htmlFor: lever.id, className: "LeverCard_output" }, lever.valueText)),
    h("dl", { className: "LeverCard_figures" },
      figures.map((f) =>
        h("div", { key: f.label, className: "LeverCard_figure" },
          h("dt", { className: "LeverCard_figureLabel" }, f.label),
          h("dd", { className: "LeverCard_figureValue" }, f.value),
          f.today ? h("dd", { className: "LeverCard_figureToday" }, f.today) : null))),
    h("div", { className: "LeverCard_actions" },
      h(Button, { variant: "quiet", onClick: onAll }, allLabel),
      moved && resetLabel ? h(Button, { variant: "quiet", onClick: onReset }, resetLabel) : null));
