// Board stand-in for the synced PaybackChart (components/engine/
// PaybackChart, the live system: drawn on the slide's 1 920 canvas, the
// `reference` optional). Unchanged by extension 10: the marketplace passes
// `reference: null` (C73, no reference at all) — no dotted tick, no label.
// Not ported.
import React from "react";

const h = React.createElement;

const mid = (r) => (r[0] + r[1]) / 2;

/**
 * Q12. Replaces the unit-economics slide's 0–36 month bar ("the payback on
 * a bar with the 12-month tick"). Same axis, now with money on it:
 *
 * - the horizontal ink line is what one new customer cost (the CAC);
 * - the rising ink line is the margin it has brought back, month after
 *   month, until it leaves (its counted lifetime, capped at 36 months);
 * - the customer pays back where the rising line reaches the cost line.
 *   If it leaves first, the line stops short: a bracket measures how short
 *   ("~€400 short") — the loss, as money and as time in one picture — and
 *   a dashed thread (dashed: never reached) shows where it would have paid
 *   back had it stayed;
 * - if it pays back, a bracket under the axis measures the months of
 *   margin after payback;
 * - 12 months, "a commonly cited reference", is a dotted, labelled tick: it
 *   situates, never judges (constraint 2);
 * - no margin: the rising line is the dashed, hatched "?" box, with what is
 *   missing (constraint 3); the cost line stays, it is known.
 *
 * Ink only, no red. Drawn at its real size (`width` × `height`), so its
 * type never scales; `summary` says it in words for a screen reader.
 */
export const PaybackChart = ({
  monthlyMargin,
  cac,
  lifetime,
  payback,
  width = 520,
  height = 220,
  labels,
  summary,
  id = "payback",
  compact = false,
  size = "md",
  reference = null,
}) => {
  if (size === "sm") compact = true;
  // The slide's type (--slide-meta, 18px on the 1 920 canvas): the labels'
  // offsets grow with it.
  const k = 1.7;
  const L = 8;
  const R = width - 12;
  const T = 18 * k;
  const B = height - 30 * k;
  const xMax = 36;
  const known = monthlyMargin && lifetime;
  const lifeHi = lifetime ? Math.min(lifetime[1], xMax) : xMax;
  // The scale: the margin a customer brings back over its life, or the
  // cost, whichever is higher — but never more than 3.4 times the cost, so
  // the cost line keeps room under it for its labels; a margin line that
  // runs higher leaves the plot at its top (clipped), its end said in words.
  const top = Math.min(Math.max(cac[1], known ? monthlyMargin[1] * lifeHi : cac[1] * 1.6) * 1.12, cac[1] * 3.4);
  const x = (m) => L + (Math.min(m, xMax) / xMax) * (R - L);
  const y = (v) => B - (v / top) * (B - T);
  const costY = y(mid(cac));
  const mm = known ? mid(monthlyMargin) : null;
  const lifeLo = lifetime ? Math.min(lifetime[0], xMax) : null;
  const pb = payback ? mid(payback) : null;
  const leavesFirst = known && pb != null && pb > lifeLo;

  const parts = [];
  // Axis and the months.
  parts.push(h("line", { key: "axis", x1: L, x2: R, y1: B, y2: B, className: "PaybackChart_axis" }));
  // The axis says 0, the reference at 12 and 36 months (the cap): the
  // reference's label sits on the axis, where today's slide puts it — never
  // inside the plot, where it would have to fight the lines for room.
  parts.push(h("text", { key: "m0", x: x(0), y: B + 18 * k, className: "PaybackChart_tick", textAnchor: "start" }, labels.months[0]));
  parts.push(h("text", { key: "m36", x: x(36), y: B + 18 * k, className: "PaybackChart_tick", textAnchor: "end" }, labels.months[3]));
  // The reference: situates only (constraint 2).
  if (reference != null) parts.push(h("line", { key: "ref", x1: x(reference), x2: x(reference), y1: T, y2: B + 4, className: "PaybackChart_reference" }));
  // `compact` (the hybrid's two columns): the axis row says the time story
  // in one line instead ("leaves at ~17 months; would pay back at 21"), the
  // reference's label goes in the slide's note, and the plot keeps only its
  // marks and the money gap.
  parts.push(compact
    ? h("text", { key: "time", x: (x(0) + x(36)) / 2, y: B + 18 * k, className: "PaybackChart_label PaybackChart_strong", textAnchor: "middle" }, labels.time)
    : reference != null ? h("text", { key: "refText", x: x(reference), y: B + 18 * k, className: "PaybackChart_tick", textAnchor: "middle" }, labels.reference) : null);
  // What it cost.
  if (cac[1] > cac[0]) {
    parts.push(h("rect", { key: "cacBand", x: L, width: R - L, y: y(cac[1]), height: y(cac[0]) - y(cac[1]), fill: `url(#${id}-hatch)`, className: "PaybackChart_band" }));
  }
  parts.push(h("line", { key: "cac", x1: L, x2: R, y1: costY, y2: costY, className: "PaybackChart_cost" }));
  // Its label (none in the hybrid's narrow columns: the tile above says it).
  // Above the line, where the payback's own label is not: at the left (the
  // margin line starts at the bottom there), or at the right when the
  // payback comes early.
  const costRight = pb != null && x(pb) < 700;
  if (labels.cost) parts.push(h("text", { key: "cacText", x: costRight ? R : L, y: costY - 8 * k, className: "PaybackChart_label PaybackChart_halo", textAnchor: costRight ? "end" : "start" }, labels.cost));

  if (!known) {
    // The margin is unknown: the "?" box.
    const bx = x(0) + 1;
    const bw = x(xMax) - bx;
    parts.push(h("rect", { key: "unk", x: bx, y: costY + 14 * k, width: bw, height: B - costY - 22 * k, rx: 4, className: "PaybackChart_unknown", fill: `url(#${id}-unknown)` }));
    const cx = bx + bw / 2;
    const cy = costY + 14 * k + (B - costY - 22 * k) / 2;
    parts.push(h("circle", { key: "unkMark", cx, cy, r: 14 * k, className: "PaybackChart_unknownMark" }));
    parts.push(h("text", { key: "unkQ", x: cx, y: cy + 5 * k, className: "PaybackChart_question", textAnchor: "middle" }, "?"));
    parts.push(h("text", { key: "unkText", x: cx + 22 * k, y: cy + 4 * k, className: "PaybackChart_label PaybackChart_strong PaybackChart_halo", textAnchor: "start" }, labels.unknown));
  } else {
    const endLo = mm * lifeLo;
    // The margin brought back until it leaves.
    parts.push(h("polyline", { key: "margin", points: `${x(0)},${y(0)} ${x(lifeLo)},${y(endLo)}`, className: "PaybackChart_margin", clipPath: `url(#${id}-plot)` }));
    if (lifetime[1] > lifetime[0]) {
      // A lifetime range: the line's reach, thinner, to its high end.
      parts.push(h("polyline", { key: "marginRange", points: `${x(lifeLo)},${y(endLo)} ${x(lifeHi)},${y(mm * lifeHi)}`, className: "PaybackChart_marginRange" }));
    }
    if (y(endLo) >= T) parts.push(h("circle", { key: "leaves", cx: x(lifeLo), cy: y(endLo), r: 4.5 * k, className: "PaybackChart_dot" }));
    if (leavesFirst) {
      // Never reached: where it would have paid back.
      parts.push(h("polyline", { key: "thread", points: `${x(lifeLo)},${y(endLo)} ${x(pb)},${costY}`, className: "PaybackChart_thread" }));
      parts.push(h("line", { key: "pbTick", x1: x(pb), x2: x(pb), y1: costY, y2: B, className: "PaybackChart_thread" }));
      if (!compact) parts.push(h("text", { key: "pbText", x: x(pb) + 6 * k, y: costY + 18 * k, className: "PaybackChart_note PaybackChart_halo" }, labels.paysBack));
      // How short.
      const bxr = x(lifeLo) - 10 * k;
      parts.push(h("path", { key: "short", d: `M ${bxr + 6} ${costY} H ${bxr} V ${y(endLo)} H ${bxr + 6}`, className: "PaybackChart_bracket" }));
      parts.push(h("text", { key: "shortText", x: bxr - 6, y: (costY + y(endLo)) / 2 + 4 * k, className: "PaybackChart_label PaybackChart_strong PaybackChart_halo", textAnchor: "end" }, labels.short));
      if (!compact) parts.push(h("text", { key: "leavesText", x: x(lifeLo), y: y(endLo) + 20 * k, className: "PaybackChart_note PaybackChart_halo", textAnchor: "middle" }, labels.leaves));
    } else {
      // It pays back: the crossing, then the months of margin after, as a
      // bracket under the cost line (the margin line is above it there).
      parts.push(h("circle", { key: "pb", cx: x(pb), cy: costY, r: 4.5 * k, className: "PaybackChart_dot" }));
      if (!compact) parts.push(h("text", { key: "pbText", x: x(pb) - 8 * k, y: costY - 8 * k, className: "PaybackChart_note PaybackChart_halo", textAnchor: "end" }, labels.paysBack));
      const by = costY + 12 * k;
      parts.push(h("path", { key: "after", d: `M ${x(pb)} ${by - 6} V ${by} H ${x(lifeLo)} V ${by - 6}`, className: "PaybackChart_bracket" }));
      if (!compact) parts.push(h("text", { key: "afterText", x: (x(pb) + x(lifeLo)) / 2, y: by + 16 * k, className: "PaybackChart_label PaybackChart_strong PaybackChart_halo", textAnchor: "middle" }, labels.after));
      // Where it leaves: just left of the line's end, level with it (the
      // line comes up from below; the top left carries the reference).
      const endY = Math.max(y(endLo), T);
      // Close to the payback, the departure is said after its dot.
      const close = x(lifeLo) - x(pb) < 320;
      if (!compact) parts.push(h("text", { key: "leavesText", x: close ? x(lifeLo) + 10 * k : x(lifeLo) - 10 * k, y: close ? endY - 6 * k : endY + 4 * k, className: "PaybackChart_note PaybackChart_halo", textAnchor: close ? "start" : "end" }, labels.leaves));
    }
  }

  return h("figure", { className: "PaybackChart_root" },
    h("svg", { width, height, viewBox: `0 0 ${width} ${height}`, className: "PaybackChart_svg", "aria-hidden": "true", focusable: "false" },
      h("defs", null,
        h("clipPath", { id: `${id}-plot` }, h("rect", { x: 0, y: T - 2, width, height: height - T })),
        h("pattern", { id: `${id}-hatch`, patternUnits: "userSpaceOnUse", width: 6, height: 6, patternTransform: "rotate(45)" },
          h("rect", { width: 2, height: 6, className: "PaybackChart_hatch" })),
        h("pattern", { id: `${id}-unknown`, patternUnits: "userSpaceOnUse", width: 6, height: 6, patternTransform: "rotate(45)" },
          h("rect", { width: 2, height: 6, className: "PaybackChart_hatch" }))),
      parts),
    h("figcaption", { className: "tdg-visually-hidden" }, summary));
};
