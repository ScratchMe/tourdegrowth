// The colours the engine's share image uses, BY TOKEN NAME, with the literal
// value each resolves to on paper today (tour-de-growth tokens, 2026-10-02).
// Satori reads no CSS custom property: the port writes these literals into
// opengraph-image.tsx. Nothing else in og/ holds a colour value.
export const OG_TOKENS = {
  // primitives the frame shares with every share image (src/lib/og/)
  "--paper-1": "#e7e1d2",            // the ground (= --surface-page)
  "--paper-0": "#fbf9f2",            // card, the stopwatch's face, text on fills
  "--paper-3": "#cfc7b4",            // the road line (= --surface-desk)
  "--ink-0": "#211c15",              // border, text, the stopwatch's lines
  "--ink-1": "#5b5346",              // the line under the title (= --text-muted)
  "--paint-red": "#d2402c",          // « GROWTH » in the wordmark (display size)
  "--paint-red-action": "#cc3e2b",   // the domain badge's fill
  // the engine's space
  "--space-ultramarine": "#1d3f8f",  // = --space-engine-accent, --space-engine-bg
};

// Derived values the frame needs, each written as its recipe so the port
// computes it the same way.
export const OG_DERIVED = {
  // --ground-lift on paper, as the landing's and the result's images use it
  // (Satori: an explicit transparent white, not `transparent`, which it blends through black.)
  groundLift: "radial-gradient(circle at 12% -10%, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0) 60%)",
  // the Stopwatch's wedge: --space-engine-accent at 14% (color-mix in the CSS)
  stopwatchWedge: "rgba(29, 63, 143, 0.14)",
};

/** Resolve a token name to its literal. Throws on an unknown name, so a typo cannot ship a black box. */
export const c = (name) => {
  const value = OG_TOKENS[name];
  if (!value) throw new Error(`Unknown token ${name}`);
  return value;
};
