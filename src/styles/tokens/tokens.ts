/**
 * The color tokens as typed data — the same values colors.css declares,
 * for the places CSS custom properties cannot reach: Satori (`next/og`, via
 * `lib/og/tokens.ts`), anything rendered to an image or a slide, and the
 * contrast test that asserts every ratio the design system promises.
 *
 * DS v3 (M-8). Not a generator: colors.css stays hand-written, because it
 * carries the reasoning next to each value. What keeps the two from
 * drifting is `src/__tests__/token-sources.test.ts`, which parses
 * colors.css and fails on the first declaration that disagrees with this
 * file, in either direction. Change a color here AND there, in one commit.
 *
 * The three maps are the three blocks of colors.css (see its header):
 * PRIMITIVES are raw values, SEMANTIC are the paper world's bindings (a
 * literal or a reference to a primitive — the layer a world rebinds),
 * DERIVED are built from semantic tokens and redeclared per world. Values
 * are spelled exactly as in the CSS — `var(--x)` for a reference — so the
 * equality test compares strings, not interpretations.
 *
 * Paper world only. The night world is its own file and its own map.
 */

type Hex = `#${string}`;
type Rgba = `rgba(${string})`;
type Ref = `var(--${string})`;
export type ColorValue = Hex | Rgba | Ref;

export const PRIMITIVES = {
  "paper-0": "#fbf9f2",
  "paper-1": "#e7e1d2",
  "paper-2": "#ded6c2",
  "paper-3": "#cfc7b4",
  "ink-0": "#211c15",
  "ink-1": "#5b5346",
  "paint-red": "#d2402c",
  "paint-red-action": "#cc3e2b",
  "paint-red-deep": "#a32e1f",
  "paint-red-wash": "#f3d9d2",
  "ink-faint": "rgba(33, 28, 21, 0.65)",
} as const satisfies Record<string, Hex | Rgba>;

export const SEMANTIC = {
  "surface-page": "var(--paper-1)",
  "surface-card": "var(--paper-0)",
  "surface-sunken": "var(--paper-2)",
  "surface-desk": "var(--paper-3)",
  "surface-alert": "var(--paint-red-wash)",
  "surface-inverse": "var(--ink-0)",

  "text-body": "var(--ink-0)",
  "text-muted": "var(--ink-1)",
  "text-inverse": "var(--paper-0)",
  "text-on-inverse": "var(--paper-0)",
  "text-alert": "var(--paint-red-deep)",
  "text-link": "var(--paint-red-deep)",
  "text-link-hover": "var(--ink-0)",
  "text-faint": "var(--ink-faint)",

  "border-hard": "var(--ink-0)",
  "border-soft": "var(--ink-1)",
  "border-alert": "var(--paint-red)",
  "border-divider": "rgba(33, 28, 21, 0.22)",

  "accent-mark": "var(--paint-red)",
  "shadow-color": "var(--ink-0)",
  "texture-ink": "rgba(33, 28, 21, 0.055)",

  "state-bad-text": "var(--paint-red-deep)",
  "state-good-text": "#1f6b3f",
  "state-warn-text": "#7a5200",

  "action-primary-bg": "var(--paint-red-action)",
  "action-primary-text": "var(--paper-0)",
  "action-secondary-text": "var(--ink-0)",

  "focus-ring": "var(--ink-0)",
  "focus-ring-invert": "var(--paint-red)",

  "field-border-alert": "var(--paint-red)",

  // Data-viz, paper world (DS v3 §5.5).
  "viz-ink": "var(--ink-0)",
  "viz-axis": "var(--ink-1)",
  "viz-grid": "rgba(33, 28, 21, 0.14)",
  "viz-highlight": "var(--paint-red)",
  "viz-highlight-text": "var(--paint-red-deep)",
  "viz-unknown": "var(--ink-1)",
  "viz-cat-1": "#1f5f8b",
  "viz-cat-2": "#1c6e57",
  "viz-cat-3": "#855500",
  "viz-cat-4": "#8a3f6e",
  "viz-cat-5": "var(--ink-0)",
  "viz-seq-1": "#f1ebdc",
  "viz-seq-2": "#d8ccb0",
  "viz-seq-3": "#b2a283",
  "viz-seq-4": "#7f705a",
  "viz-seq-5": "#4a4034",
  "viz-seq-1-text": "var(--ink-0)",
  "viz-seq-2-text": "var(--ink-0)",
  "viz-seq-3-text": "var(--ink-0)",
  "viz-seq-4-text": "var(--paper-0)",
  "viz-seq-5-text": "var(--paper-0)",
} as const satisfies Record<string, ColorValue>;

export const DERIVED = {
  "field-bg": "var(--surface-card)",
  "field-placeholder": "var(--text-muted)",
  "state-selected-bg": "var(--surface-inverse)",
  "state-selected-text": "var(--text-on-inverse)",
} as const satisfies Record<string, Ref>;

export const COLOR_TOKENS = { ...PRIMITIVES, ...SEMANTIC, ...DERIVED };
export type ColorToken = keyof typeof COLOR_TOKENS;

/**
 * Follows `var(--x)` references down to the literal a token paints with.
 * Throws on an unknown name or a cycle rather than returning something
 * plausible: a wrong color in a PNG is silent, an exception is not.
 */
export function resolveColor(name: ColorToken): Hex | Rgba {
  const seen = new Set<string>();
  let current: string = name;
  for (;;) {
    if (seen.has(current)) throw new Error(`Token cycle through --${current}`);
    seen.add(current);
    const value = (COLOR_TOKENS as Record<string, string>)[current];
    if (value === undefined) throw new Error(`Unknown color token --${current}`);
    const next = /^var\(--([a-z0-9-]+)\)$/.exec(value)?.[1];
    if (next === undefined) return value as Hex | Rgba;
    current = next;
  }
}
