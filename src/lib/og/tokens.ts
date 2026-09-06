/**
 * Design tokens copied by hand for Satori (`next/og`), which renders in a
 * pipeline entirely separate from the app's CSS — no custom properties, no
 * shared classes. Source of truth: `src/app/globals.css` and
 * `design/ds-extension-01-return/tokens/colors.css`; re-sync here if a token
 * changes. Shared by every `opengraph-image.tsx` so the two images can't
 * drift from each other.
 */
export const OG_INK = "#211c15";
export const OG_INK_SOFT = "#5b5346";
export const OG_STONE = "#e7e1d2";
export const OG_STONE_2 = "#ded6c2";
export const OG_RED = "#d2402c";
export const OG_RED_INK = "#a32e1f";
export const OG_RED_SOFT = "#f3d9d2";
export const OG_PAINT_WHITE = "#fbf9f2";

/** DESIGN-BRIEF.md §03 — the exact share frame, shared by every OG image. */
export const OG_SIZE = { width: 1200, height: 630 };
