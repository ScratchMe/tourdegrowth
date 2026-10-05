// SideNote — design system extension 10. What a side says where a part is
// absent: by design (supply earns nothing directly), or not yet (too few
// team targets to name what holds the side back). Plain React, no JSX.
import React from "react";
import { MetaLabel } from "tour-de-growth";

const h = React.createElement;

/**
 * Question 11. Supply without the subscriptions has no money, one funnel
 * column, and often "not enough targets". It must not look broken or empty:
 * the part keeps its place and its heading, and says why in words.
 *
 * - `kind="absent"`: absent by design — nothing is missing, nothing to do.
 *   No frame, ink only, the part's own eyebrow (« L'argent · août 2026 »)
 *   and a full sentence: what the side does instead. An optional quiet
 *   `action` (a Button quiet) when a setting would change it.
 * - `kind="pending"`: not yet — the diagnosis needs team targets. The
 *   system's dashed edge (dashed = not yet), never red: nothing holds the
 *   side back that a target names. Its `action` leads to the targets.
 *
 * Never a "?" box: a "?" is a figure that cannot be computed (constraint
 * 4); here there is no figure to compute.
 */
export const SideNote = ({
  kind = "absent",
  eyebrow,
  title,
  children,
  action,
  headingId,
  className,
  "data-testid": testId,
}) =>
  h("section", {
    className: ["SideNote_root", kind === "pending" ? "SideNote_pending" : "SideNote_absent", className].filter(Boolean).join(" "),
    "aria-labelledby": headingId,
    "data-testid": testId,
  },
    eyebrow ? h(MetaLabel, { as: "p", size: "sm", tone: "muted", wide: true }, eyebrow) : null,
    h("h3", { id: headingId, className: "SideNote_title" }, title),
    children ? h("div", { className: "SideNote_body" }, children) : null,
    action ? h("div", { className: "SideNote_action" }, action) : null);
