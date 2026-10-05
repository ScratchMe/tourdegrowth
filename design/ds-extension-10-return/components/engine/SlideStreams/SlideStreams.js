// SlideStreams — design system extension 10. The marketplace's total slide:
// two streams added up, as a ledger. Plain React, no JSX.
import React from "react";

const h = React.createElement;

/**
 * Question 10. The one slide about both sides, and it is a sum (C70):
 * "two streams, one total". Not the hybrid's two cards facing each other
 * with an arrow between: an addition, read down — the commissions, the
 * sellers' subscriptions, then the total under a solid rule — once per
 * column (this month, new a month, in 12 months; with the what-ifs when any
 * moved). No "+" or "=": they are a disclosure's glyphs (return 07, as
 * TotalBand); the rule says "sum", as a ledger does.
 *
 * - `streams` is always the commissions, then the subscriptions: the
 *   order of the sum, never of their size. No bar, no share, no
 *   percentage of the total: any of them would rank the two.
 * - Every figure is set in the same face and size; the total's row alone
 *   is heavier and ruled, as a sum is.
 * - `note`: where each stream is read on its own (its side's slides).
 *
 * Drawn on the deck's 1 920 canvas (the slide's type tokens), scaled
 * whole on a phone.
 */
export const SlideStreams = ({ caption, columns, streams, total, note, className }) =>
  h("figure", { className: ["SlideStreams_root", className].filter(Boolean).join(" ") },
    h("table", { className: "SlideStreams_table" },
      caption ? h("caption", { className: "tdg-visually-hidden" }, caption) : null,
      h("thead", null,
        h("tr", null,
          h("td", { className: "SlideStreams_corner" }),
          columns.map((c) => h("th", { key: c.key, scope: "col", className: "SlideStreams_col" }, c.label)))),
      h("tbody", null,
        streams.map((s) =>
          h("tr", { key: s.id, className: "SlideStreams_stream" },
            h("th", { scope: "row", className: "SlideStreams_name" },
              h("span", { className: "SlideStreams_label" }, s.label,
                s.side ? h("span", { className: "SlideStreams_side" }, s.side) : null)),
            columns.map((c) => h("td", { key: c.key, className: "SlideStreams_value" }, s.values[c.key]))))),
      h("tfoot", null,
        h("tr", { className: "SlideStreams_total" },
          h("th", { scope: "row", className: "SlideStreams_name" },
            h("span", { className: "SlideStreams_label" }, total.label)),
          columns.map((c) => h("td", { key: c.key, className: "SlideStreams_value" }, total.values[c.key]))))),
    note ? h("figcaption", { className: "SlideStreams_note" }, note) : null);
