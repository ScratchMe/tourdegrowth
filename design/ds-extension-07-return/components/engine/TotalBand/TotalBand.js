// TotalBand — design system extension 07. The hybrid's sum: two engines, one
// total, in a fixed order. Plain React, no JSX.
import React from "react";
import { Card, MetaLabel } from "tour-de-growth";

const h = React.createElement;

/**
 * Q18. On top of the hybrid board, once: the sum, never a comparison (C4).
 * The engines come in the order of `engines` — self-serve, then
 * sales-assisted, always — whatever their values; no bar, no share, nothing
 * that ranks. The link between them (opportunities from self-serve) is the
 * last line. Below it, the board shows ONE engine at a time (Segmented),
 * never two columns face to face. No "+" or "=" between the figures (those
 * glyphs are a disclosure's, constraint 8): the total is set off by a solid
 * rule, as a sum is in an account.
 */
export const TotalBand = ({ eyebrow, title, engines, total, link, headingId = "total-title" }) =>
  h(Card, { elevation: "flat", tone: "paper", className: "TotalBand_root" },
    h(MetaLabel, { size: "sm", tone: "muted", wide: true }, eyebrow),
    h("p", { id: headingId, className: "TotalBand_title" }, title),
    h("dl", { className: "TotalBand_sum", "aria-labelledby": headingId },
      engines.map((e) =>
        h("div", { key: e.label, className: "TotalBand_term" },
          h("dt", { className: "TotalBand_label" }, e.label),
          h("dd", { className: "TotalBand_value" }, e.value))),
      h("div", { className: "TotalBand_term TotalBand_total" },
        h("dt", { className: "TotalBand_label" }, total.label),
        h("dd", { className: "TotalBand_value" }, total.value))),
    link ? h("p", { className: "TotalBand_link" }, link) : null);
