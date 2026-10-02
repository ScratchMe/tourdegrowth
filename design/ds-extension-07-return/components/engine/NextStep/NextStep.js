// NextStep — design system extension 07. "Since last time" and the one thing
// to do now: the first screen on return, and the board's primary action.
// Plain React, no JSX.
import React from "react";
import { Button, Card, MetaLabel } from "tour-de-growth";

const h = React.createElement;

const cx = (...c) => c.filter(Boolean).join(" ");

/**
 * Replaces the three dashed bands (next month, resume, backup) and the
 * coverage chips' role as a summary (Q3). One card, under the verdict, read
 * in this order — reason, action, the rest:
 *
 *   eyebrow   — "Since your last visit · 12 days ago" / "Where you are";
 *   lead      — why the primary is the primary, in one sentence ("4 numbers
 *               to go: 3 on your own, and 1 to ask Finance"). `leadTone`
 *               "advice" when the reason is a risk (storage refused);
 *   primary   — THE action, chosen by `nextStepFor` (see the .prompt.md):
 *               the screen's only primary button;
 *   secondary — at most one quiet alternative, beside it;
 *   lines     — what else changed or waits, one sentence each, under a
 *               rule. `tone`: "plain"; "pending" (a request out, a month
 *               ended: dashed edge, "not yet"); "advice" (backup missing,
 *               storage refused: dashed red edge, the system's advice). A
 *               line may carry one quiet `action` ("Follow up", "Save").
 *
 * Reason and action come first so that, at 390px, the verdict and the one
 * next action fit the first screen (brief: "the first screen says where you
 * are and what to do next").
 */
export const NextStep = ({ eyebrow, lead, leadTone, lines = [], primary, secondary, headingId = "engine-next" }) =>
  h(Card, { elevation: "flat", tone: "paper", className: "NextStep_root" },
    h(MetaLabel, { as: "h2", size: "sm", tone: "muted", id: headingId }, eyebrow),
    lead ? h("p", { className: cx("NextStep_lead", leadTone && `NextStep_${leadTone}`) }, lead) : null,
    h("div", { className: "NextStep_actions" },
      h(Button, { variant: "primary", size: "lg", href: primary.href, onClick: primary.onClick, className: "NextStep_primary" }, primary.label),
      secondary ? h("span", { className: "NextStep_secondary" }, secondary) : null),
    lines.length
      ? h("ul", { className: "NextStep_lines", "aria-label": eyebrow },
          lines.map((l, i) =>
            h("li", { key: i, className: cx("NextStep_line", l.tone && `NextStep_${l.tone}`) },
              h("span", { className: "NextStep_text" }, l.text),
              l.action ? h("span", { className: "NextStep_lineAction" }, l.action) : null)))
      : null);
