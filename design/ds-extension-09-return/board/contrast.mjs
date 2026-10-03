// The contrast of every colour pair extension 09 adds, computed from the
// system's primitives (system-snapshot.css), translucent colours composed
// on their real ground — WCAG 2.x relative luminance. Run: node contrast.mjs
const P = {
  "paper-0": "#fbf9f2", "paper-1": "#e7e1d2", "ink-0": "#211c15", "ink-1": "#5b5346",
  "paint-red": "#d2402c", "paint-red-deep": "#a32e1f",
};
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const over = (fg, a, bg) => fg.map((c, i) => Math.round(c * a + bg[i] * (1 - a)));
const lum = (rgb) => {
  const [r, g, b] = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const c = (n) => hex(P[n]);
// --viz-grid: rgba(33, 28, 21, 0.14) — the gain wash between the curves.
const wash = over(c("ink-0"), 0.14, c("paper-1"));
const rows = [
  ["Text", "money figures, finding, months, cash line (--text-body)", "ink-0", "paper-1", 4.5],
  ["Text", "labels, assumptions, curve ticks, chart notes (--text-muted)", "ink-1", "paper-1", 4.5],
  ["Text", "slide tiles and table cells (--text-body on --surface-card)", "ink-0", "paper-0", 4.5],
  ["Text", "slide tile labels, table headers (--text-muted on card)", "ink-1", "paper-0", 4.5],
  ["Text", "the loss tag (--text-on-inverse on --surface-inverse)", "paper-0", "ink-0", 4.5],
  ["Text", "the warning's sentence (--text-body), beside its dashed red edge", "ink-0", "paper-1", 4.5],
  ["Mark", "curve, today's pace (--money-line-today) on the page", "ink-1", "paper-1", 3],
  ["Mark", "curve, today's pace, on the gain wash", "ink-1", wash, 3],
  ["Mark", "curve, with the what-ifs (--money-line-whatif) on the gain wash", "ink-0", wash, 3],
  ["Mark", "the gain wash's edge = the two lines (wash vs page)", wash, "paper-1", null],
  ["Mark", "WorthBars, LeverSum bars, PaybackChart lines (ink)", "ink-0", "paper-1", 3],
  ["Mark", "slide marks on the slide (ink on --surface-page)", "ink-0", "paper-1", 3],
  ["Mark", "cost guide, brackets, reference dotted line (--viz-axis)", "ink-1", "paper-1", 3],
  ["Mark", "range hatch and its edge (--viz-unknown)", "ink-1", "paper-1", 3],
  ["Mark", "dashed \"?\" box edge (--border-soft)", "ink-1", "paper-1", 3],
  ["Mark", "\"?\" disc ring on card (--border-hard)", "ink-0", "paper-0", 3],
  ["Mark", "the loss tag's fill against the page", "ink-0", "paper-1", 3],
  ["Mark", "the maybe tag's dashed outline (ink)", "ink-0", "paper-1", 3],
  ["Mark", "the warning's dashed red edge (--border-alert)", "paint-red", "paper-1", 3],
  ["Mark", "the slide tiles' edge (--border-hard) on the slide", "ink-0", "paper-1", 3],
];
const name = (x) => (Array.isArray(x) ? `rgb(${x.join(",")}) (ink-0 at 14% on paper-1)` : `--${x}`);
const val = (x) => (Array.isArray(x) ? x : c(x));
console.log("| Kind | Pair | Foreground | Ground | Ratio | Needs |\n|---|---|---|---|---|---|");
for (const [kind, pair, fg, bg, need] of rows) {
  const r = ratio(val(fg), val(bg));
  console.log(`| ${kind} | ${pair} | ${name(fg)} | ${name(bg)} | ${r.toFixed(2)}:1 | ${need ? `${need}:1 ${r >= need ? "✓" : "✗"}` : "(not a mark: the lines are)"} |`);
}
