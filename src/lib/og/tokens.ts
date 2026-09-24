/**
 * Design tokens for Satori (`next/og`), which renders in a pipeline entirely
 * separate from the app's CSS — no custom properties, no shared classes. It
 * needs literal colors, so these read them from the typed source
 * (`src/styles/tokens/tokens.ts`) instead of copying hex by hand: until DS v3
 * this file was a hand-kept copy to "re-sync if a token changes", which is
 * exactly the step nobody remembers. `token-sources.test.ts` also fails if a
 * literal color is ever written here again.
 *
 * Shared by both share images (`src/app/[locale]/opengraph-image.tsx` and
 * `lib/og/result-frame.tsx`) so the two can't drift from each other. The
 * names are the ones the images were written against (stone = paper,
 * red ink = the deep red text color); only their source changed.
 */
import { PRIMITIVES } from "@/styles/tokens/tokens";

export const OG_INK = PRIMITIVES["ink-0"];
export const OG_INK_SOFT = PRIMITIVES["ink-1"];
export const OG_STONE = PRIMITIVES["paper-1"];
export const OG_STONE_2 = PRIMITIVES["paper-2"];
export const OG_RED = PRIMITIVES["paint-red"];
export const OG_RED_INK = PRIMITIVES["paint-red-deep"];
export const OG_RED_SOFT = PRIMITIVES["paint-red-wash"];
export const OG_PAINT_WHITE = PRIMITIVES["paper-0"];

/** DESIGN-BRIEF.md §03 — the exact share frame, shared by every OG image. */
export const OG_SIZE = { width: 1200, height: 630 };
