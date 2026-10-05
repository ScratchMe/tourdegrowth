// Board stand-in for the synced LeverCard (components/engine/LeverCard, the live
// system, 2026-10-04): its markup and class names, so the live CSS draws
// it (system-snapshot.css). Unchanged by extension 10. Not ported.
import React from "react";
import { Button, MetaLabel } from "tour-de-growth";

const h = React.createElement;

/**
 * Return 07 (Q17): one lever — the stage a target names, or with no target
 * the first typed lever in funnel order — and the figures it moves most;
 * "See all 8 levers and what the calculation assumes →" opens the full
 * panel.
 *
 * Extension 09 (Q8–Q10): the card carries the money's best moment — move
 * the lever, watch the ARR move:
 *
 * - `curve`: the MRR month by month (MrrCurve), at today's pace and, once
 *   moved, with the what-ifs. Untouched, it is today's pace alone: that IS
 *   "the MRR in 12 months at the current pace";
 * - `figures`: the MRR in 12 months and the ARR in 12 months (was: MRR in
 *   12 months and new paying customers a month — those stay in the panel);
 *   once moved, each shows "today …";
 * - `worth`: one line, what one new customer is worth with this what-if,
 *   when the lever moves it (a lever that moves neither the LTV nor the CAC
 *   says so);
 * - `total` (hybrid only): both engines' MRR in 12 months, one line — a
 *   sum, never a comparison.
 *
 * Everything else is unchanged: the slider, "Back to today" once moved, a
 * ruled section of the board, not a raised card.
 */
export const LeverCard = ({
  eyebrow,
  title,
  lever,
  curve,
  figures,
  worth,
  total,
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
    curve ? h("div", { className: "LeverCard_curve" }, curve) : null,
    h("dl", { className: "LeverCard_figures" },
      figures.map((f) =>
        h("div", { key: f.key ?? f.label, className: "LeverCard_figure" },
          h("dt", { className: "LeverCard_figureLabel" }, f.label),
          h("dd", { className: "LeverCard_figureValue" }, f.value),
          f.today ? h("dd", { className: "LeverCard_figureToday" }, f.today) : null))),
    worth ? h("p", { className: "LeverCard_worth" }, worth) : null,
    total ? h("p", { className: "LeverCard_total" }, total) : null,
    h("div", { className: "LeverCard_actions" },
      h(Button, { variant: "quiet", onClick: onAll }, allLabel),
      moved && resetLabel ? h(Button, { variant: "quiet", onClick: onReset }, resetLabel) : null));
