// MrrCurve — design system extension 09. The MRR, month by month: 13 points,
// today first, the MRR in 12 months last — at today's pace, and with the
// what-ifs. Plain React, no JSX, so the board runs this very file.
import React from "react";

const h = React.createElement;

const mid = (p) => (p[0] + p[1]) / 2;
const isRange = (pts) => pts.some((p) => Math.abs(p[1] - p[0]) > 1e-6);

/**
 * Q8. A line, not bars: thirteen points of one quantity over time, and two
 * of them to compare. Both lines are ink — a projection is never red
 * (constraint 1):
 *
 * - "at today's pace": the axis ink, 2px;
 * - "with your what-ifs": the full ink, 3px, and the room between the two
 *   lines in the grid's wash — that room is what the what-ifs add;
 * - a range (an estimate upstream): the band between the low and the high
 *   path, hatched as the system hatches an estimate, edged by both paths;
 * - each line is named at its end (desktop) or in a key under the plot
 *   (`compact`, a phone). The figures themselves are NOT printed on the
 *   curve: LeverCard prints the MRR in 12 months once, under it.
 *
 * Drawn at its real width (`width`, the column's: 720, or 342 on a phone)
 * so its type never scales. The SVG is decoration; `summary` says it in
 * words for a screen reader, and the figures under it are real text.
 */
export const MrrCurve = ({
  today,
  whatif,
  width = 720,
  height = 200,
  compact = false,
  keys,
  start,
  xLabels,
  summary,
  size = "screen",
  id = "mrr-curve",
}) => {
  const keyRoom = compact ? 0 : size === "slide" ? 150 : 168;
  const L = 2;
  const R = width - keyRoom - 10;
  const T = 26;
  const B = height - 26;
  const all = [...today, ...(whatif ?? [])];
  let lo = Math.min(...all.map((p) => p[0]));
  let hi = Math.max(...all.map((p) => p[1]));
  if (hi - lo < 1) hi = lo + 1;
  // Room under the lowest point for today's figure, which sits under the
  // start when the MRR grows (over it when it shrinks).
  const rising = mid(today[12]) >= mid(today[0]);
  lo -= (hi - lo) * (rising ? 0.2 : 0.08);
  hi += (hi - lo) * (rising ? 0.06 : 0.2);
  const x = (i) => L + (i * (R - L)) / 12;
  const y = (v) => B - ((v - lo) / (hi - lo)) * (B - T);
  const path = (pts, k) => pts.map((p, i) => `${x(i).toFixed(1)},${y(k(p)).toFixed(1)}`).join(" ");
  const bandPoly = (pts) => {
    const top = pts.map((p, i) => `${x(i).toFixed(1)},${y(p[1]).toFixed(1)}`);
    const bottom = pts.map((p, i) => `${x(i).toFixed(1)},${y(p[0]).toFixed(1)}`).reverse();
    return [...top, ...bottom].join(" ");
  };

  const drawLine = (pts, kind) => {
    const cls = kind === "whatif" ? "MrrCurve_whatif" : "MrrCurve_today";
    if (isRange(pts)) {
      return h("g", { key: kind, className: cls },
        h("polygon", { points: bandPoly(pts), className: "MrrCurve_band", fill: `url(#${id}-hatch)` }),
        h("polyline", { points: path(pts, (p) => p[1]), className: "MrrCurve_line MrrCurve_edge" }),
        h("polyline", { points: path(pts, (p) => p[0]), className: "MrrCurve_line MrrCurve_edge" }));
    }
    return h("g", { key: kind, className: cls },
      h("polyline", { points: path(pts, mid), className: "MrrCurve_line" }),
      h("circle", { cx: x(12), cy: y(mid(pts[12])), r: 4, className: "MrrCurve_dot" }));
  };

  // The room between the two lines: what the what-ifs add.
  const gain = whatif
    ? h("polygon", {
        className: "MrrCurve_gain",
        points: [
          ...whatif.map((p, i) => `${x(i).toFixed(1)},${y(p[0]).toFixed(1)}`),
          ...today.map((p, i) => `${x(i).toFixed(1)},${y(p[1]).toFixed(1)}`).reverse(),
        ].join(" "),
      })
    : null;

  // The keys at the lines' ends, pushed apart if they would touch.
  let yW = whatif ? y(mid(whatif[12])) : null;
  let yT = y(mid(today[12]));
  if (yW != null && Math.abs(yW - yT) < 20) {
    const m = (yW + yT) / 2;
    yW = m - 10;
    yT = m + 10;
  }
  const keyX = R + 12;

  return h("figure", { className: ["MrrCurve_root", compact ? "MrrCurve_compact" : "", size === "slide" ? "MrrCurve_slide" : ""].filter(Boolean).join(" ") },
    h("svg", { className: "MrrCurve_svg", width, height, viewBox: `0 0 ${width} ${height}`, "aria-hidden": "true", focusable: "false" },
      h("defs", null,
        h("pattern", { id: `${id}-hatch`, patternUnits: "userSpaceOnUse", width: 6, height: 6, patternTransform: "rotate(45)" },
          h("rect", { width: 2, height: 6, className: "MrrCurve_hatch" }))),
      // Today's level, as a faint rule: the curve reads as a gain from it.
      h("line", { x1: L, x2: R, y1: y(mid(today[0])), y2: y(mid(today[0])), className: "MrrCurve_level" }),
      gain,
      drawLine(today, "today"),
      whatif ? drawLine(whatif, "whatif") : null,
      h("circle", { cx: x(0), cy: y(mid(today[0])), r: 4, className: "MrrCurve_start" }),
      h("text", { x: x(0) + 8, y: y(mid(today[0])) + (rising ? 18 : -10), className: "MrrCurve_tick MrrCurve_startLabel MrrCurve_halo", textAnchor: "start" }, start),
      xLabels
        ? [
            h("text", { key: "x0", x: x(0), y: height - 6, className: "MrrCurve_tick", textAnchor: "start" }, xLabels[0]),
            h("text", { key: "x6", x: x(6), y: height - 6, className: "MrrCurve_tick", textAnchor: "middle" }, xLabels[1]),
            h("text", { key: "x12", x: x(12), y: height - 6, className: "MrrCurve_tick", textAnchor: "end" }, xLabels[2]),
          ]
        : null,
      !compact && whatif ? h("text", { x: keyX, y: yW + 4, className: "MrrCurve_key MrrCurve_keyWhatif" }, keys.whatif) : null,
      !compact ? h("text", { x: keyX, y: yT + 4, className: "MrrCurve_key MrrCurve_keyToday" }, keys.today) : null),
    compact
      ? h("ul", { className: "MrrCurve_legend", "aria-hidden": "true" },
          whatif ? h("li", { className: "MrrCurve_legendItem MrrCurve_legendWhatif" }, keys.whatif) : null,
          h("li", { className: "MrrCurve_legendItem MrrCurve_legendToday" }, keys.today))
      : null,
    h("figcaption", { className: "tdg-visually-hidden" }, summary));
};
