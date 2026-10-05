// Board stand-in for the synced LeverSum (components/engine/LeverSum, the live
// system, 2026-10-04): its markup and class names, so the live CSS draws
// it (system-snapshot.css). Unchanged by extension 10. Not ported.
import React from "react";

const h = React.createElement;

const pct = (x, top) => `${Math.max(0, Math.min(100, (x / top) * 100))}%`;

/**
 * Q9. Today: a table and one sentence ("Together: +€42,000 — €4,400 more
 * than the sum of the levers alone"). Here, the same figures as lengths on
 * one scale, all ink:
 *
 *   each lever alone     ████████ +€18,000   (one row per lever)
 *   each alone, added up ████|███|██ ~€38,000 (the solo bars end to end)
 *   together             █████████████ +€42,000
 *                                     └┘ ~€4,400 more: the levers multiply
 *
 * The bracket over the end of "together" measures what the levers do to
 * each other — it is never a colour. A lever that brings nothing on MRR in
 * 12 months has a zero-length bar and its figure "+€0" — there is no such
 * case among the film's three.
 *
 * Rows are real text (label, value); the bars are decoration. `size`:
 * "screen" (the panel; stacks on a phone) or "slide" (a fixed canvas).
 */
export const LeverSum = ({ title, rows, sum, together, extra, size = "screen" }) => {
  const top = Math.max(together.amount, sum.amount, ...rows.map((r) => r.amount)) || 1;
  let acc = 0;
  return h("figure", { className: `LeverSum_root LeverSum_${size}` },
    h("figcaption", { className: "LeverSum_title" }, title),
    h("dl", { className: "LeverSum_list" },
      rows.map((r) =>
        h("div", { key: r.id ?? r.label, className: "LeverSum_row" },
          h("dt", { className: "LeverSum_label" }, r.label),
          h("dd", { className: "LeverSum_track", "aria-hidden": "true" }, h("span", { className: "LeverSum_bar", style: { width: pct(r.amount, top) } })),
          h("dd", { className: "LeverSum_value" }, r.value))),
      h("div", { className: "LeverSum_row LeverSum_rowSum" },
        h("dt", { className: "LeverSum_label" }, sum.label),
        h("dd", { className: "LeverSum_track", "aria-hidden": "true" },
          rows.map((r) => {
            const left = acc;
            acc += r.amount;
            return h("span", { key: r.id ?? r.label, className: "LeverSum_bar LeverSum_segment", style: { left: pct(left, top), width: pct(r.amount, top) } });
          })),
        h("dd", { className: "LeverSum_value" }, sum.value)),
      h("div", { className: "LeverSum_row LeverSum_rowTogether" },
        h("dt", { className: "LeverSum_label" }, together.label),
        h("dd", { className: "LeverSum_track", "aria-hidden": "true" },
          h("span", { className: "LeverSum_bar", style: { width: pct(together.amount, top) } }),
          together.amount > sum.amount
            ? h("span", { className: "LeverSum_bracket", style: { left: pct(sum.amount, top), width: pct(together.amount - sum.amount, top) } })
            : null),
        h("dd", { className: "LeverSum_value" }, together.value))),
    extra ? h("p", { className: "LeverSum_extra" }, extra) : null);
};
