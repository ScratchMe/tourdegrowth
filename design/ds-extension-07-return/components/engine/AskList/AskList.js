// AskList — design system extension 07. The numbers that come from someone
// else, grouped by who has them: one request each, copied in one go.
// Plain React, no JSX.
import React from "react";
import { Button, Card, MetaLabel } from "tour-de-growth";

const h = React.createElement;

/**
 * Today's "To go and get", promoted from the bottom of the board to a step
 * of the journey (Q11): after the quick numbers, before the long ones —
 * "send the requests today, fill in the rest while waiting". One card per
 * role; its request is the copy (stamped with its date when copied, as
 * today). A copied request shows its date on a dashed edge: pending.
 * "Do it yourself" is no longer here: it is the numbers list itself.
 */
export const AskList = ({ title, lead, groups, done, headingId = "asks-title" }) =>
  h("section", { className: "AskList_root", "aria-labelledby": headingId },
    h("h2", { id: headingId, className: "AskList_title" }, title),
    h("p", { className: "AskList_lead" }, lead),
    h("ul", { className: "AskList_groups" },
      groups.map((g) =>
        h("li", { key: g.role },
          h(Card, { elevation: "flat", tone: "paper", className: "AskList_card" },
            h(MetaLabel, { as: "h3", size: "sm", tone: "muted" }, g.role),
            h("p", { className: "AskList_numbers" }, g.numbers),
            h("blockquote", { className: "AskList_request" }, g.request),
            g.copied
              ? h("p", { className: "AskList_copied" }, g.copied)
              : h(Button, { variant: "secondary", onClick: g.onCopy }, g.copyLabel))))),
    done ? h("div", { className: "AskList_done" }, h(Button, { variant: "primary", size: "lg", onClick: done.onClick }, done.label)) : null);
