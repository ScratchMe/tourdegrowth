// The contrast of every colour pair extension 10 draws on its new parts,
// computed from the system's primitives (system-snapshot.css, the live
// tokens), translucent colours composed on their real ground — WCAG 2.x
// relative luminance. Run: node board/contrast.mjs
// The marketplace adds no colour (tokens/marketplace.css): every pair below
// is the live system's, on the places the new components put it.
const P = {
  "paper-0": "#fbf9f2", "paper-1": "#e7e1d2", "ink-0": "#211c15", "ink-1": "#5b5346",
  "paint-red": "#d2402c", "paint-red-deep": "#a32e1f", "paint-red-action": "#cc3e2b",
};
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const over = (fg, a, bg) => fg.map((c, i) => Math.round(c * a + bg[i] * (1 - a)));
const lum = (rgb) => {
  const [r, g, b] = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const c = (n) => hex(P[n]);
// --border-divider: rgba(33, 28, 21, 0.22) — the dashed rules.
const divider = over(c("ink-0"), 0.22, c("paper-1"));
const dividerCard = over(c("ink-0"), 0.22, c("paper-0"));
const rows = [
  ["Text", "SideShown: label, side title (--text-body on the page)", "ink-0", "paper-1", 4.5],
  ["Text", "SideShown: the note (--text-muted on the page)", "ink-1", "paper-1", 4.5],
  ["Text", "Segmented: the side shown (--state-selected-text on --state-selected-bg)", "paper-0", "ink-0", 4.5],
  ["Text", "Segmented: the other side (--text-muted on the card)", "ink-1", "paper-0", 4.5],
  ["Text", "SideFunnel: figures, labels, base line, rates (--text-body on the card)", "ink-0", "paper-0", 4.5],
  ["Text", "SideFunnel: sources, base heading, rate labels (--text-muted on the card)", "ink-1", "paper-0", 4.5],
  ["Text", "SideFunnel: the leak's tag (--text-inverse on --surface-accent = --paint-red-action; bold 11px caps)", "paper-0", "paint-red-action", 4.5],
  ["Text", "SideNote: title and body (--text-body on the page)", "ink-0", "paper-1", 4.5],
  ["Text", "NumberList delta: the side (--text-muted, 11px bold, on the page)", "ink-1", "paper-1", 4.5],
  ["Text", "NumberList delta: the lead (--text-muted on the page)", "ink-1", "paper-1", 4.5],
  ["Text", "MrrCurve delta: the jump's note (--text-body on the page)", "ink-0", "paper-1", 4.5],
  ["Text", "SlideStreams: figures and names (--text-body on the slide's page)", "ink-0", "paper-1", 4.5],
  ["Text", "SlideStreams: column heads, the sides, the note (--text-muted)", "ink-1", "paper-1", 4.5],
  ["Text", "Slides: the side's line above the title (--text-body)", "ink-0", "paper-1", 4.5],
  ["Text", "The diagnosis' stage (--paint-red, 30px display) on the page", "paint-red", "paper-1", 3],
  ["Text", "The diagnosis' eyebrow (alert MetaLabel, --text-alert) on the page", "paint-red-deep", "paper-1", 4.5],
  ["Mark", "SideFunnel: the leak's dots (--viz-highlight) on the card", "paint-red", "paper-0", 3],
  ["Mark", "SideFunnel: measured dots, referred rings (--viz-ink) on the card", "ink-0", "paper-0", 3],
  ["Mark", "SideFunnel: empty dots' ring (--viz-axis) on the card", "ink-1", "paper-0", 3],
  ["Mark", "SideShown: the opening rule (--border-solid, ink) on the page", "ink-0", "paper-1", 3],
  ["Mark", "SideNote pending: the dashed edge (--border-soft) on the page", "ink-1", "paper-1", 3],
  ["Mark", "MrrCurve delta: the jump's ring (--money-line-whatif) on the gain wash", "ink-0", over(c("ink-0"), 0.14, c("paper-1")), 3],
  ["Mark", "SlideStreams: the total's rule (--border-hard)", "ink-0", "paper-1", 3],
  ["Mark", "NumberList: the leak stage's edge (--border-alert)", "paint-red", "paper-1", 3],
  ["Rule", "dashed dividers (--border-divider) on the page — decorative, not a mark", divider, "paper-1", null],
  ["Rule", "dashed dividers on the card — decorative", dividerCard, "paper-0", null],
];
const name = (x) => (Array.isArray(x) ? `rgb(${x.join(",")})` : `--${x}`);
const val = (x) => (Array.isArray(x) ? x : c(x));
console.log("| Kind | Pair | Foreground | Ground | Ratio | Needs |\n|---|---|---|---|---|---|");
let fail = 0;
for (const [kind, pair, fg, bg, need] of rows) {
  const r = ratio(val(fg), val(bg));
  if (need && r < need) fail += 1;
  console.log(`| ${kind} | ${pair} | ${name(fg)} | ${name(bg)} | ${r.toFixed(2)}:1 | ${need ? `${need}:1 ${r >= need ? "✓" : "✗"}` : "— (a divider, not information)"} |`);
}
console.log(`\n${fail ? `${fail} pair(s) below AA` : "Every pair passes AA."}`);
