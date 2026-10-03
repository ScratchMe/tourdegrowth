// SlideUnitEconomics — design system extension 09. The body of the deck's
// unit-economics slide: one customer, month by month, and its six figures —
// for one engine, or for the two engines of a hybrid side by side.
// Plain React, no JSX. The slide's frame (header, title, footer) is the
// deck's own, unchanged; only its title's colour rule changes (README, Q12).
import React from "react";

const h = React.createElement;

const tile = (t) =>
  h("div", { key: t.key ?? t.label, className: ["SlideUnit_tile", t.value === "?" ? "SlideUnit_tileUnknown" : "", t.wide ? "SlideUnit_tileWide" : ""].filter(Boolean).join(" ") },
    h("p", { className: "SlideUnit_tileLabel" }, t.label),
    h("p", { className: "SlideUnit_tileValue" }, t.value),
    t.note ? h("p", { className: "SlideUnit_tileNote" }, t.note) : null);

/**
 * Q12. Read alone, without its speaker. The six figures first, in one row
 * (as today's slide opens on its tiles), then the picture that explains
 * them, with what it assumes beside it:
 *
 * - `chart` (PaybackChart): where the payback and the lifetime meet — the
 *   slide's 0–36 month bar, now carrying the money;
 * - `tiles`: CAC, LTV, LTV:CAC, CAC payback, months after payback (or
 *   "leaves ~4 months before"), cash tied up (with "does not all come
 *   back" when the customer leaves first). An unknown is a dashed tile with
 *   "?" and what is missing;
 * - `retention`: GRR and NRR, one line under the tiles (they explain the
 *   lifetime; their approximation is printed with them);
 * - `warning`: the long-payback warning (CashWarning), when it applies;
 * - `assume`: what the cash figure assumes, one line in the slide's note
 *   type (a floor, monthly billing) — printed with the figure, as every
 *   "What if?" assumption is.
 *
 * `engines` (hybrid): two columns, self-serve then sales-assisted, each with
 * its own chart and tiles — side by side, never summed: the LTV, the
 * payback, the loss belong to one engine.
 */
export const SlideUnitEconomics = ({ chart, tiles, retention, warning, assume, engines }) =>
  engines
    ? h("div", { className: "SlideUnit_root SlideUnit_both" },
        engines.map((e) =>
          h("section", { key: e.name, className: "SlideUnit_engine" },
            h("h3", { className: "SlideUnit_engineName" }, e.name),
            h("div", { className: "SlideUnit_tiles SlideUnit_tilesCompact" }, e.tiles.map(tile)),
            e.chart,
            e.line ? h("p", { className: "SlideUnit_line" }, e.line) : null)),
        assume ? h("p", { className: "SlideUnit_note SlideUnit_noteBoth" }, assume) : null)
    : h("div", { className: "SlideUnit_root" },
        h("div", { className: "SlideUnit_tiles" }, tiles.map(tile)),
        h("div", { className: "SlideUnit_lower" },
          h("div", { className: "SlideUnit_chart" }, chart),
          h("div", { className: "SlideUnit_side" },
            retention ? h("p", { className: "SlideUnit_line" }, retention) : null,
            warning ?? null,
            assume ? h("p", { className: "SlideUnit_note" }, assume) : null)));
