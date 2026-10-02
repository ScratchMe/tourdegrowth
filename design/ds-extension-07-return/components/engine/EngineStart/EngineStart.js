// EngineStart — design system extension 07. The first visit's only setup
// screen: one question, its defaults said in a sentence, one way in.
// Plain React, no JSX.
import React from "react";
import { Button, Card, Choices } from "tour-de-growth";

const h = React.createElement;

/**
 * Replaces "Before you start" (36 controls) with one question — how do you
 * sell — and a sentence that says every other default, with "Change" (opens
 * Settings). Nothing else is asked before the first number (Q4).
 *
 * The three ways in, by weight (Q5): start (primary), the example and import
 * (quiet). "See it all at once" is gone: the board IS all at once.
 */
export const EngineStart = ({
  title,
  legend,
  options,
  motion,
  onMotionChange,
  plan,
  defaults,
  defaultsTerm,
  changeLabel,
  onChange,
  startLabel,
  onStart,
  exampleLabel,
  onExample,
  importLabel,
  onImport,
  headingId = "engine-start-title",
}) =>
  h(Card, { elevation: "flat", tone: "paper", className: "EngineStart_root" },
    h("h2", { id: headingId, className: "EngineStart_title" }, title),
    h(Choices, { legend, options, value: motion, onChange: onMotionChange, size: "md", name: "engine-motion" }),
    h("p", { className: "EngineStart_plan" }, plan),
    h("p", { className: "EngineStart_defaults" },
      defaults, defaultsTerm ? h("span", { className: "EngineStart_term" }, " ", defaultsTerm) : null, " ",
      h(Button, { variant: "quiet", size: "sm", onClick: onChange }, changeLabel)),
    h("div", { className: "EngineStart_actions" },
      h(Button, { variant: "primary", size: "lg", onClick: onStart, className: "EngineStart_go" }, startLabel),
      h("div", { className: "EngineStart_ways" },
        h(Button, { variant: "quiet", onClick: onExample }, exampleLabel),
        h(Button, { variant: "quiet", onClick: onImport }, importLabel))));
