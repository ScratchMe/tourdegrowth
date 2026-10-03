// SlideWhatIf — design system extension 09. The body of the deck's "What
// if?" slides, with their curve: one lever, or the levers together.
// Plain React, no JSX. The slide's frame is the deck's own, unchanged; its
// title states the projected gain in ink, never in the accent red
// (constraint 1, README Q11).
import React from "react";
import { DataTable } from "tour-de-growth";

const h = React.createElement;

/**
 * Q11. Read alone, without its speaker:
 *
 * - `curve` (MrrCurve, slide size): the MRR month by month, at today's pace
 *   and with this what-if (or with the levers together) — the film's best
 *   moment, on paper;
 * - `figures`: one table, today | with this what-if | change — MRR in 12
 *   months, ARR in 12 months, new MRR a month, NRR, LTV:CAC, CAC payback,
 *   cash tied up. Its caption names it;
 * - `sum` (together only): LeverSum — each lever alone, each alone added
 *   up, together; `note`, under the table: what the levers do to each
 *   other, in one sentence (the compounding, as today's slide says it);
 * - `funnel` (one lever, only when the lever moves the month's funnel —
 *   activation, conversion): today's second table, kept. A lever that leaves
 *   the funnel as it is (churn, expansion) says so in one line instead of a
 *   table of "stable".
 */
export const SlideWhatIf = ({ curve, figures, sum, note, funnel, funnelNote }) =>
  h("div", { className: ["SlideWhatIf_root", sum ? "SlideWhatIf_together" : ""].filter(Boolean).join(" ") },
    h("div", { className: "SlideWhatIf_left" },
      curve,
      sum ?? null,
      funnelNote ? h("p", { className: "SlideWhatIf_note" }, funnelNote) : null),
    h("div", { className: "SlideWhatIf_right" },
      h(DataTable, { ...figures, size: "sm", className: "SlideWhatIf_table" }),
      note ? h("p", { className: "SlideWhatIf_sumNote" }, note) : null,
      funnel ? h(DataTable, { ...funnel, size: "sm", className: "SlideWhatIf_table" }) : null));
