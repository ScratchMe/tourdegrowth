// NumberSheet — design system extension 07. One number's screen: one
// question, and its knowledge attached to what it explains.
// Plain React, no JSX.
import React from "react";
import { Button, Card, MetaLabel, Tag } from "tour-de-growth";

const h = React.createElement;

/**
 * The screen a number gets, in the first visit and every month after —
 * the step-by-step and the board share it (Q14). It fixes the ORDER; the
 * caller fills the slots (Q6):
 *
 *   header   position ("Acquisition · 1 of 3") · progress (EngineProgress sm)
 *   name     + effort (Tag neutral: an effort is not pending) + "Definition →"
 *   lede     the one-liner;  formula: one mono line
 *   tour     what was declared in the Tour (one line, when linked)
 *   trap     TrapNote — before the value, open
 *   where    WhereToFind — closed, its summary names the tools
 *   answer   AnswerSwitch — the value first; "No figure to hand?" after it
 *   compare  HowItCompares — reference, target, verdict: one object
 *   words    a closed Disclosure: "Your definition and a note"
 *   actions  "Save and continue →" (primary) · "← Your numbers" · "Skip"
 *
 * `onSubmit`: the sheet is a <form>; Enter in any box saves (constraint 14).
 * Focus goes to the heading (`headingId`, tabIndex −1) when a person moves
 * to this screen — never on first paint.
 */
export const NumberSheet = ({
  headingId = "number-title",
  position,
  progress,
  name,
  effort,
  definitionLabel,
  definitionHref,
  definition,
  formulaLabel,
  formula,
  tour,
  trap,
  where,
  answer,
  compare,
  words,
  actions,
  onSubmit,
  readOnly,
}) =>
  h(Card, { elevation: "flat", tone: "paper", className: "NumberSheet_root" },
    h("form", {
      className: "NumberSheet_form",
      "aria-labelledby": headingId,
      noValidate: true,
      onSubmit: (e) => { e.preventDefault(); onSubmit?.(); },
    },
      h("div", { className: "NumberSheet_header" },
        h(MetaLabel, { size: "sm", tone: "muted" }, position),
        progress ? h("div", { className: "NumberSheet_progress" }, progress) : null),
      h("div", { className: "NumberSheet_identity" },
        h("h2", { id: headingId, className: "NumberSheet_name", tabIndex: -1 }, name),
        h("div", { className: "NumberSheet_meta" },
          effort ? h(Tag, { tone: "neutral" }, effort) : null,
          definitionHref ? h(Button, { variant: "quiet", size: "sm", href: definitionHref }, definitionLabel) : null)),
      h("p", { className: "NumberSheet_lede" }, definition),
      formula
        ? h("p", { className: "NumberSheet_formula" },
            h("span", { className: "NumberSheet_formulaLabel" }, formulaLabel),
            h("code", { className: "NumberSheet_formulaText" }, formula))
        : null,
      tour ? h("p", { className: "NumberSheet_tour" }, tour) : null,
      trap ?? null,
      where ?? null,
      readOnly ? null : answer ?? null,
      compare ?? null,
      readOnly ? null : words ?? null,
      actions ? h("div", { className: "NumberSheet_actions" }, actions) : null));
