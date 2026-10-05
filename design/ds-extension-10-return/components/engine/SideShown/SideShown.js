// SideShown — design system extension 10. The marketplace's side selector,
// and the heading of the side it shows. Plain React, no JSX.
import React from "react";
import { Segmented } from "tour-de-growth";

const h = React.createElement;

/**
 * Questions 1 and 2. The hybrid's "Engine shown", for the two sides of a
 * marketplace (C70): one side at a time, never both. Everything under it,
 * down to the next rule, belongs to the side it shows — its verdict, its
 * diagnosis, its money, its "What if?", its funnel. Everything above it is
 * shared: the engine bar, the total, the next step.
 *
 * - `sides` is always demand then supply, whatever their figures: a fixed
 *   order is not a ranking, and the selector never reorders.
 * - It starts on demand (the brief's recommendation, kept): commissions
 *   exist in every marketplace, subscriptions only when the box is ticked.
 * - `title` is the shown side's heading — « La demande : les acheteurs » —
 *   the words the side is read in (the vocabulary, C65). The selector names
 *   the side, the title names its people.
 * - `note`: the one line that says the two sides are read apart.
 *
 * Its buttons are the system's Segmented (44px targets). Nothing else on
 * it: no figure, no badge per side — a figure next to each option would put
 * the two sides face to face.
 */
export const SideShown = ({
  label,
  sides,
  value,
  onChange,
  title,
  note,
  headingId = "side-shown",
  className,
  "data-testid": testId,
}) =>
  h("section", { className: ["SideShown_root", className].filter(Boolean).join(" "), "aria-labelledby": `${headingId}-title`, "data-testid": testId },
    h("div", { className: "SideShown_control" },
      h("span", { id: `${headingId}-label`, className: "SideShown_label" }, label),
      h(Segmented, { labelledBy: `${headingId}-label`, value, onChange, options: sides })),
    h("h2", { id: `${headingId}-title`, className: "SideShown_title" }, title),
    note ? h("p", { className: "SideShown_note" }, note) : null);
