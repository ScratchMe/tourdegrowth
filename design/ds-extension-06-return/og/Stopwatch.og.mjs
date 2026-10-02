// The engine's stopwatch (brand/Stopwatch), redrawn for Satori as inline SVG:
// the same parts as the component — hard shadow, stem, buttons, ultramarine
// bezel, card face, ticks, the run so far as a wedge, the hand, the hub —
// with every colour resolved by token name. Satori draws an inline <svg> with
// <circle>, <path>, <rect> and <line> as they are.
import { c, OG_DERIVED } from "./tokens.og.mjs";

const CX = 150;
const CY = 168;
const FACE = 112;          // the face's radius
const BEZEL = 122;         // the ultramarine ring, outside the face's ink line
const RUN = 0.38;          // the run so far, as a share of the dial
const HAND = 0.38;         // where the hand points (the end of the run)

const polar = (r, turn) => {
  const a = (turn - 0.25) * 2 * Math.PI;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
};
const f = (n) => n.toFixed(2);

const wedgePath = () => {
  const [x0, y0] = polar(FACE - 4, 0);
  const [x1, y1] = polar(FACE - 4, RUN);
  const large = RUN > 0.5 ? 1 : 0;
  return `M${CX},${CY} L${f(x0)},${f(y0)} A${FACE - 4},${FACE - 4} 0 ${large} 1 ${f(x1)},${f(y1)} Z`;
};

const ticks = () => {
  const out = [];
  for (let i = 0; i < 60; i += 1) {
    const major = i % 5 === 0;
    const [x0, y0] = polar(major ? FACE - 22 : FACE - 12, i / 60);
    const [x1, y1] = polar(FACE - 5, i / 60);
    out.push({ x0, y0, x1, y1, major });
  }
  return out;
};

/** The stopwatch, `size` px wide (the drawing is 300 × 310). */
export const Stopwatch = (h, size = 300) => {
  const ink = c("--ink-0");
  const accent = c("--space-ultramarine");
  const face = c("--paper-0");
  const [hx, hy] = polar(FACE - 26, HAND);
  return h(
    "svg",
    { width: size, height: Math.round((size * 310) / 300), viewBox: "0 0 300 310" },
    // the hard shadow under the case (Stopwatch_shadow)
    h("circle", { cx: CX + 8, cy: CY + 8, r: BEZEL + 4, fill: ink }),
    // the stem and the crown button on top, the lap button at 2 o'clock
    h("rect", { x: CX - 9, y: 22, width: 18, height: 26, fill: ink }),
    h("rect", { x: CX - 26, y: 6, width: 52, height: 22, rx: 6, fill: accent, stroke: ink, "stroke-width": 2.5 }),
    h("rect", { x: 236, y: 46, width: 30, height: 18, rx: 5, fill: accent, stroke: ink, "stroke-width": 2.5, transform: `rotate(40 251 55)` }),
    // the bezel, then the face inside it
    h("circle", { cx: CX, cy: CY, r: BEZEL, fill: accent, stroke: ink, "stroke-width": 3 }),
    h("circle", { cx: CX, cy: CY, r: FACE, fill: face, stroke: ink, "stroke-width": 3 }),
    // the run so far
    h("path", { d: wedgePath(), fill: OG_DERIVED.stopwatchWedge }),
    // the ticks
    ...ticks().map((t) =>
      h("line", {
        x1: f(t.x0), y1: f(t.y0), x2: f(t.x1), y2: f(t.y1),
        stroke: ink, "stroke-width": t.major ? 3.5 : 1.4, "stroke-linecap": "round",
      }),
    ),
    // the hand and its hub
    h("line", { x1: CX, y1: CY, x2: f(hx), y2: f(hy), stroke: ink, "stroke-width": 5, "stroke-linecap": "round" }),
    h("circle", { cx: CX, cy: CY, r: 11, fill: accent, stroke: ink, "stroke-width": 2.5 }),
  );
};

/** The space band's pictogram, 34 × 22: three speed lines and a small stopwatch. In the pill, in the pill's text colour. */
export const StopwatchPicto = (h, color, width = 30) =>
  h(
    "svg",
    { width, height: Math.round((width * 22) / 34), viewBox: "0 0 34 22" },
    h("line", { x1: 2, y1: 9, x2: 10, y2: 9, stroke: color, "stroke-width": 2.2, "stroke-linecap": "round" }),
    h("line", { x1: 4, y1: 13.5, x2: 11, y2: 13.5, stroke: color, "stroke-width": 2.2, "stroke-linecap": "round" }),
    h("line", { x1: 2, y1: 18, x2: 10, y2: 18, stroke: color, "stroke-width": 2.2, "stroke-linecap": "round" }),
    h("circle", { cx: 22, cy: 13, r: 7.5, fill: "none", stroke: color, "stroke-width": 2.4 }),
    h("rect", { x: 19.5, y: 1.5, width: 5, height: 3, rx: 1, fill: color }),
    h("line", { x1: 22, y1: 4.5, x2: 22, y2: 5.5, stroke: color, "stroke-width": 2.4 }),
    h("line", { x1: 22, y1: 13, x2: 25, y2: 10, stroke: color, "stroke-width": 2.2, "stroke-linecap": "round" }),
    h("line", { x1: 28.5, y1: 5.5, x2: 30.5, y2: 3.5, stroke: color, "stroke-width": 2.4, "stroke-linecap": "round" }),
  );
