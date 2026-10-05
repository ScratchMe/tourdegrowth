// SideFunnel — design system extension 10. One side of a marketplace as a
// funnel: its sign-ups brought back to 100, the stages counted on those same
// 100, the monthly rates that are not columns, and — on the demand side —
// liquidity on a base of its own. Plain React, no JSX, so the board runs
// this very file.
import React from "react";
import { Card, DotGrid, Tag } from "tour-de-growth";

const h = React.createElement;
const cx = (...c) => c.filter(Boolean).join(" ");

/**
 * Questions 3 and 4. The peloton's grammar (100 dots, a column per stage
 * counted on the same 100, the referred as rings, the upstream line), kept
 * whole, for one side at a time:
 *
 * - `columns`: the 100 sign-ups, then each stage counted on those same 100
 *   (demand: first order, second order; supply: first sale, subscribed —
 *   or the first sale alone without the subscriptions). A column `holds`
 *   when the side's diagnosis names it (a team target): its dots red
 *   (DotGrid `highlighted`) and the alert Tag — the side's one red. A
 *   range is DotGrid's hatch; an unmeasured stage its "?" box.
 * - `base`: a second base of 100 that is not the same people — liquidity,
 *   counted on 100 searches (or requests): the fill rate. It sits after a
 *   rule, under its own heading, so it never reads as a fourth stage of the
 *   sign-ups. Drawn on demand only (it is a demand stage, priced on new
 *   buyers); supply points to it in `aside`.
 * - `rates` (under `ratesTitle`, « Chaque mois »): what happens every
 *   month and is not a column — supply's two churns (active sellers, paid
 *   sellers). A line of figures under the columns, never dots: a monthly
 *   rate counted on 100 sign-ups would lie. A rate a target names as the
 *   leak would take the diagnosis edge (`holds`).
 * - `aside`: one line that says where this side shows when it earns
 *   nothing directly (supply without the subscriptions: in the fill rate).
 *
 * One side only, ever (C70): the component has no prop for the other side,
 * no shared axis, no second series. `medium="slide"` draws it on the
 * deck's 1 920 canvas, without the card (the slide is the frame).
 */
export const SideFunnel = ({
  title,
  upstream,
  columns,
  base,
  rates,
  ratesTitle,
  aside,
  note,
  legend,
  medium = "screen",
  headingId = "side-funnel",
  className,
  "data-testid": testId,
}) => {
  const slide = medium === "slide";
  // `kicker`: the base's heading, set inside the column's head so that its
  // grid starts on the same line as the others'.
  const column = (c, kicker) =>
    h("figure", { key: c.id, className: cx("SideFunnel_col", c.holds && "SideFunnel_holds") },
      h("div", { className: "SideFunnel_text" },
        kicker ?? null,
        h("p", { className: "SideFunnel_n" }, c.n),
        h("p", { className: "SideFunnel_label" },
          c.label,
          c.holds ? [" ", h(Tag, { key: "t", tone: "alert", className: "SideFunnel_tag" }, c.holds.label)] : null)),
      h(DotGrid, { grid: c.grid, label: c.ariaLabel ?? `${c.n} ${typeof c.label === "string" ? c.label : ""}`, highlighted: !!c.holds, medium }),
      c.source ? h("figcaption", { className: "SideFunnel_source" }, c.source) : null);

  const body = [
    upstream ? h("p", { key: "up", className: "SideFunnel_upstream" }, h("span", { className: "SideFunnel_arrow", "aria-hidden": "true" }, "→"), " ", upstream) : null,
    h("div", { key: "cols", className: cx("SideFunnel_cols", base && "SideFunnel_withBase") },
      h("div", { className: "SideFunnel_same", style: { "--side-funnel-cols": columns.length } }, columns.map((c) => column(c))),
      base
        ? h("section", { className: "SideFunnel_base", "aria-labelledby": `${headingId}-base` },
            column(base.column, h("h3", { id: `${headingId}-base`, className: "SideFunnel_baseTitle" }, base.title)),
            base.line ? h("p", { className: "SideFunnel_baseLine" }, base.line) : null)
        : null),
    rates && rates.length
      ? h("div", { key: "rates", className: "SideFunnel_rates" },
          ratesTitle ? h("p", { className: "SideFunnel_ratesTitle" }, ratesTitle) : null,
          h("dl", { className: "SideFunnel_rateList" },
            rates.map((r) =>
              h("div", { key: r.id, className: cx("SideFunnel_rate", r.holds && "SideFunnel_rateHolds") },
                h("dt", { className: "SideFunnel_rateLabel" }, r.label),
                h("dd", { className: "SideFunnel_rateValue" }, r.value),
                r.note ? h("dd", { className: "SideFunnel_rateNote" }, r.note) : null))))
      : null,
    aside ? h("p", { key: "aside", className: "SideFunnel_aside" }, aside) : null,
    note || legend
      ? h("div", { key: "foot", className: "SideFunnel_foot" },
          note ? h("p", { className: "SideFunnel_note" }, note) : null,
          legend
            ? h("ul", { className: cx("DotGrid_legend", slide && "DotGrid_legendSlide", "SideFunnel_legend") },
                legend.map((l) =>
                  h("li", { key: l.kind },
                    h("span", { className: cx("DotGrid_swatch", l.kind === "unknown" ? "DotGrid_unknownSwatch" : `DotGrid_${l.kind}`), "aria-hidden": "true" }),
                    l.label)))
            : null)
      : null,
  ];

  if (slide) {
    return h("section", { className: cx("SideFunnel_root", "SideFunnel_slide", className), "aria-label": typeof title === "string" ? title : undefined, "data-testid": testId }, body);
  }
  return h(Card, { elevation: "raised", tone: "paper", className: cx("SideFunnel_root", className), "data-testid": testId },
    h("section", { className: "SideFunnel_inner", "aria-labelledby": headingId },
      h("h2", { id: headingId, className: "SideFunnel_title" }, title),
      body));
};
