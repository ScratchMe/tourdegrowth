// AnswerSwitch — design system extension 07. The value first; the three other
// answers one tap away. Plain React, no JSX.
import React from "react";
import { Button } from "tour-de-growth";

const h = React.createElement;

/**
 * Q7. Today the four answers come first, as a 2 × 2 choice, and the value box
 * opens under "I have it". Here the value box IS the question — most numbers,
 * most months, are "I have it" — and "No figure to hand?" offers the other
 * three under it. Nothing is chosen for the person: a number with an empty
 * box and no alternative is "to do", as today.
 *
 *   answer = null      `value` (the boxes: FieldRow of NumberFields, or a
 *                      TextField for a number that is words) and, once
 *                      typed, `source`.
 *   answer = estimate | ask | cant
 *                      `editor` (range · role + request · triage) replaces
 *                      the boxes; "← I have the figure after all" brings
 *                      them back. What was typed is kept until the save.
 *
 * The three are toggle buttons (aria-pressed), not radios: picking one
 * swaps the editor; the answer is recorded when the sheet is saved.
 */
export const AnswerSwitch = ({
  legend,
  options,
  answer = null,
  onAnswer,
  value,
  source,
  editor,
  backLabel,
  onBack,
  legendId = "answer-legend",
}) =>
  h("div", { className: "AnswerSwitch_root" },
    answer
      ? h("div", { className: "AnswerSwitch_editor" },
          h(Button, { variant: "quiet", size: "sm", onClick: onBack, className: "AnswerSwitch_back" }, backLabel),
          editor)
      : h("div", { className: "AnswerSwitch_value" }, value, source ?? null),
    h("div", { className: "AnswerSwitch_others", role: "group", "aria-labelledby": legendId },
      h("span", { id: legendId, className: "AnswerSwitch_legend" }, legend),
      h("ul", { className: "AnswerSwitch_options" },
        options.map((o) =>
          h("li", { key: o.value },
            h("button", {
              type: "button",
              className: "AnswerSwitch_option",
              "aria-pressed": answer === o.value ? "true" : "false",
              onClick: onAnswer ? () => onAnswer(o.value) : undefined,
            }, o.label))))));
