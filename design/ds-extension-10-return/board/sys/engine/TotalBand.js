// TotalBand — design system extension 07, changed by extension 09. The
// hybrid's sum: two engines, one total, in a fixed order — and now what else
// adds up. Plain React, no JSX, so the board runs this very file.
import React from "react";
import { MetaLabel } from "tour-de-growth";

const h = React.createElement;

/**
 * Return 07 (Q18): on top of the hybrid board, once: the sum, never a
 * comparison (C4). Self-serve, then sales-assisted, always; the total set
 * off by a solid rule; no "+" or "=" (a disclosure's glyphs). The link
 * between the engines is the last line. Below it, ONE engine at a time.
 *
 * Extension 09 (Q4): `totals` — what adds up across the two engines, and
 * only that: the ARR, the MRR in 12 months at today's pace and the cash tied
 * up, each a sum. The LTV, the payback, the loss never add (each engine has
 * its own): they live in each engine's MoneyBlock, under the switch. The
 * per-engine ARR is not printed: it is the engine's MRR × 12, and the
 * board's question is the total.
 */
export const TotalBand = ({ eyebrow, title, engines, total, totals, link, headingId = "total-title" }) =>
  h("section", { className: "TotalBand_root", "aria-labelledby": headingId },
    h(MetaLabel, { size: "sm", tone: "muted", wide: true }, eyebrow),
    h("p", { id: headingId, className: "TotalBand_title" }, title),
    h("dl", { className: "TotalBand_sum", "aria-labelledby": headingId },
      engines.map((e) =>
        h("div", { key: e.id ?? String(e.label), className: "TotalBand_term" },
          h("dt", { className: "TotalBand_label" }, e.label),
          h("dd", { className: e.missing ? "TotalBand_value TotalBand_missing" : "TotalBand_value" }, e.value))),
      h("div", { className: "TotalBand_term TotalBand_total" },
        h("dt", { className: "TotalBand_label" }, total.label),
        h("dd", { className: "TotalBand_value" }, total.value))),
    totals
      ? h("dl", { className: "TotalBand_totals" },
          totals.map((t) =>
            h("div", { key: t.key ?? t.label, className: "TotalBand_term" },
              h("dt", { className: "TotalBand_label" }, t.label),
              h("dd", { className: "TotalBand_value" }, t.value))))
      : null,
    link ? h("p", { className: "TotalBand_link" }, link) : null);
