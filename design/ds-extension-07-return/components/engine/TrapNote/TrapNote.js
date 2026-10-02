// TrapNote — design system extension 07. The trap, shown before the value it
// changes. Plain React, no JSX.
import React from "react";
import { MetaLabel } from "tour-de-growth";

const h = React.createElement;

/**
 * The number's trap, from the catalogue, word for word — open by default,
 * just above the value, because it changes what one types (Q8). Drawn as
 * advice: a dashed red edge (constraint 5), never a wash. When both motions
 * are ticked, `hybrid` adds the hybrid trap under its own label.
 *
 * `action` is the one quiet button a trap can carry: when the trap tells
 * you to write something in your definition, "Write your definition" opens
 * the sheet's "Your definition and a note".
 */
export const TrapNote = ({ label, children, hybrid, action }) =>
  h("aside", { className: "TrapNote_root", "aria-label": label },
    h(MetaLabel, { size: "xs", tone: "muted" }, label),
    h("p", { className: "TrapNote_text" }, children),
    hybrid
      ? h("div", { className: "TrapNote_hybrid" },
          h(MetaLabel, { size: "xs", tone: "muted" }, hybrid.label),
          h("p", { className: "TrapNote_text" }, hybrid.text))
      : null,
    action ? h("div", { className: "TrapNote_action" }, action) : null);
