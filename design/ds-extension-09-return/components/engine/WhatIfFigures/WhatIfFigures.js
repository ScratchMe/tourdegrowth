// WhatIfFigures — design system extension 09. The full "What if?" panel's
// figures: today, with the what-ifs, and the change, as three short tables
// by meaning. Plain React, no JSX, so the board runs this very file.
import React from "react";
import { DataTable, MetaLabel } from "tour-de-growth";

const h = React.createElement;

/**
 * Q9. Replaces the panel's seven StatTiles (MRR in 12 months, new MRR, NRR,
 * GRR, CAC, LTV, payback) and adds what the money needs, in three groups,
 * each a DataTable (the system's, `sm`):
 *
 * 1. Growth — new MRR a month, NRR, GRR (the MRR and ARR in 12 months are
 *    LeverCard's, which stays open right above the panel: once per surface);
 * 2. One new customer — CAC, LTV, LTV:CAC, per new customer (the gap), CAC
 *    payback, months after payback;
 * 3. Cash — the month's acquisition spend (it never moves: same spend), the
 *    cash it keeps tied up.
 *
 * Columns: the figure, today, with your what-ifs, the change. Untouched,
 * one value column (`moved={false}`): the panel shows today's figures, as
 * today. A figure that cannot be computed prints "?" and its row says what
 * is missing — never 0.
 *
 * Tables, not tiles: twelve tiles would be six rows of cards, 540px; three
 * tables read across, today against the what-if, in about 420px, and a
 * table is the medium that holds a "today | what-if | change" comparison.
 * The change carries its sign (U+2212 for minus) and no colour: a projection
 * the reader set up is nobody's verdict (StatTile's `neutral`).
 *
 * On a phone (under 760px) the "today" column folds into the what-if cell,
 * as a second line ("today ~€80,000", `todayLine`): three columns hold at
 * 320px without a horizontal scroll, and nothing is lost.
 */
export const WhatIfFigures = ({ title, label, groups, columns, moved, todayLine = (v) => v }) =>
  h("div", { className: "WhatIfFigures_root" },
    h("div", { className: "WhatIfFigures_head" },
      h("h3", { className: "WhatIfFigures_title" }, title),
      label ? h(MetaLabel, { size: "xs", tone: "muted", wide: true }, label) : null),
    groups.map((g) =>
      h(DataTable, {
        key: g.id,
        caption: g.title,
        size: "sm",
        className: moved ? "WhatIfFigures_table WhatIfFigures_moved" : "WhatIfFigures_table",
        columns: moved
          ? [
              { key: "figure", header: columns.figure },
              { key: "today", header: columns.today, numeric: true },
              { key: "whatif", header: columns.whatif, numeric: true },
              { key: "change", header: columns.change, numeric: true },
            ]
          : [
              { key: "figure", header: columns.figure },
              { key: "today", header: columns.today, numeric: true },
            ],
        rows: g.rows.map((r) => ({
          id: r.id,
          cells: {
            figure: r.label,
            today: r.today,
            whatif: moved ? [r.whatif, h("span", { key: "today", className: "WhatIfFigures_todayLine" }, todayLine(r.today))] : r.whatif,
            change: r.change,
          },
        })),
      })));
