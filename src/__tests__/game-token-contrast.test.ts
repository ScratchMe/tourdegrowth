import { describe, expect, it } from "vitest";
import { DERIVED, SEMANTIC } from "@/styles/tokens/tokens";
import {
  type Role,
  assertRole,
  compose,
  declsOf,
  makeResolver,
  parseBlocks,
  parseColor,
  ratio,
  round2,
} from "./color-math";

/**
 * Game chunk G6 — every ratio the game plan states for its tokens (§2.3),
 * measured on game.css as it ships, inside the world each token is read in.
 *
 * The islands (--dg-*, --app-*) are illustration and a foreign app: what
 * matters on the face is the strokes that carry the expression against the
 * skin (≥ 3:1, WCAG 1.4.11), on the phone its text. The night additions are
 * measured in the night environment, the same one night-token-contrast uses.
 *
 * Two values the plan quoted did not survive measurement, and the tests pin
 * the measured ones (the comments in game.css say why):
 *   - the live dot "4.13 against the chip" was measured on a 60% chip; the
 *     chip is --visio-scrim, 72%: 4.24;
 *   - nothing else — the rest reproduces to the hundredth.
 */

const paper = parseBlocks("colors.css");
const night = parseBlocks("world-night.css");
const game = parseBlocks("game.css");

const GAME_ROOT = declsOf(game, ":root");
const GAME_NIGHT = declsOf(game, '[data-world="night"]');

const ENV = new Map<string, string>([
  ...declsOf(paper, ":root"),
  ...declsOf(night, ":root"),
  ...declsOf(paper, ":root,[data-world]"),
  ...declsOf(night, '[data-world="night"]'),
  ...GAME_ROOT,
  ...GAME_NIGHT,
]);
const literal = makeResolver(ENV);

type Pair = {
  fg: string;
  bg: string;
  /** A translucent `bg` is first composed on this ground (the scrim on the wall). */
  over?: string;
  alpha?: number;
  stated: number;
  role: Role;
  bar?: number;
  why: string;
};

function contrast({ fg, bg, over, alpha = 1 }: Pick<Pair, "fg" | "bg" | "over" | "alpha">): number {
  const base = over ? compose(parseColor(literal(over))) : undefined;
  const ground = compose(parseColor(literal(bg)), base);
  const f = parseColor(literal(fg));
  return ratio({ ...f, a: f.a * alpha }, ground);
}

const HIDDEN = Number(GAME_NIGHT.get("game-hidden-opacity"));

const PAIRS: Pair[] = [
  // --- The face: strokes against the skin ---
  { fg: "dg-skin", bg: "dg-wall", stated: 6.15, role: "mark", why: "the face against the call's wall" },
  { fg: "dg-hair", bg: "dg-skin", stated: 5.5, role: "mark", why: "hair and brows — the expression" },
  { fg: "dg-hair", bg: "dg-skin-angry", stated: 4.99, role: "mark", why: "brows, angry" },
  { fg: "dg-eye", bg: "dg-skin", stated: 6.91, role: "mark", why: "eyes" },
  { fg: "dg-eye", bg: "dg-skin-angry", stated: 6.28, role: "mark", why: "eyes, angry" },
  { fg: "dg-mouth", bg: "dg-skin", stated: 3.74, role: "mark", why: "the mouth" },
  { fg: "dg-mouth", bg: "dg-skin-angry", stated: 3.4, role: "mark", why: "the mouth, angry" },
  { fg: "#7a4a3a", bg: "dg-skin", stated: 2.94, role: "under", bar: 3, why: "the prototype's mouth, under 3:1" },
  { fg: "#7a4a3a", bg: "dg-skin-angry", stated: 2.67, role: "under", bar: 3, why: "…and worse angry" },
  { fg: "dg-suit", bg: "dg-wall", stated: 1.51, role: "decorative", why: "the suit is a silhouette" },

  // --- The call's chrome ---
  { fg: "text-body", bg: "visio-scrim", over: "dg-wall", stated: 17.2, role: "text", why: "subtitles on the band" },
  { fg: "visio-live", bg: "visio-scrim", over: "dg-wall", stated: 4.24, role: "mark", why: "the live dot on its chip" },

  // --- The phone ---
  { fg: "app-ink", bg: "app-bg", stated: 17.3, role: "text", why: "app text" },
  { fg: "app-muted", bg: "app-bg", stated: 5.65, role: "text", why: "app secondary text" },
  { fg: "app-muted", bg: "app-modal-bg", stated: 5.45, role: "text", why: "…in the mini-modal" },
  { fg: "app-faint", bg: "app-bg", stated: 4.74, role: "text", why: "'request cancellation', 11.5px" },
  { fg: "#9aa0a8", bg: "app-bg", stated: 2.64, role: "under", why: "the prototype's link (R8)" },
  { fg: "app-line", bg: "app-bg", stated: 1.24, role: "decorative", why: "app dividers" },
  { fg: "app-on-brand", bg: "app-brand", stated: 6.23, role: "text", why: "white on the app's button" },
  { fg: "app-brand", bg: "app-bg", stated: 6.23, role: "text", why: "the brand blue as text" },
  { fg: "app-danger-text", bg: "app-danger-bg", stated: 5.93, role: "text", why: "danger notice" },
  { fg: "app-warn-text", bg: "app-warn-bg", stated: 6.53, role: "text", why: "warn notice" },
  { fg: "#8a5f00", bg: "app-warn-bg", stated: 5.33, role: "text", why: "the prototype's warn: keepable, replaced anyway" },
  { fg: "app-ink", bg: "app-warn-bg", stated: 16.32, role: "text", why: "ink on the warn ground" },
  { fg: "app-ok-text", bg: "app-ok-bg", stated: 7.84, role: "text", why: "ok notice" },
  { fg: "app-social-text", bg: "app-social-bg", stated: 9.18, role: "text", why: "social proof" },
  { fg: "app-push-text", bg: "app-push-bg", stated: 17.74, role: "text", why: "push notification" },
  { fg: "phone-bezel", bg: "surface-page", stated: 1.06, role: "decorative", why: "bezel on the night: invisible alone…" },
  { fg: "phone-bezel-line", bg: "surface-page", stated: 3.99, role: "mark", why: "…so its outline carries the edge" },

  // --- The game's night additions ---
  { fg: "game-order-text", bg: "game-order-bg", stated: 4.65, role: "text", why: "'asked for by the CEO' badge" },
  { fg: "game-order-bg", bg: "surface-card", stated: 3.57, role: "mark", why: "the badge's edge on a card" },
  { fg: "game-order-on-selected", bg: "state-selected-bg", stated: 10.13, role: "text", why: "the badge on a ticked card" },
  { fg: "game-order-bg", bg: "state-selected-bg", stated: 2.63, role: "under", bar: 3, why: "why that variant exists" },
  {
    fg: "text-body",
    bg: "surface-card",
    alpha: HIDDEN,
    stated: 4.7,
    role: "decorative",
    why: "a dimmed value — never the real one (§2.7)",
  },
  { fg: "game-hover-border", bg: "surface-card", stated: 7.7, role: "mark", why: "night hover: the edge, not the shadow" },
];

/** Color tokens of game.css with no ratio of their own, and why. */
const UNMEASURED: Record<string, string> = {
  "dg-shirt": "a collar, read against the suit it sits in: shape, not signal",
  "dg-tie": "a quiet echo of the brand, decorative",
  "dg-shelf-1": "backdrop",
  "dg-shelf-2": "backdrop",
  "dg-shelf-3": "backdrop",
  "visio-halo-angry": "an inner glow, decorative",
  "app-danger-line": "notice border, decorative (the notice is carried by its text)",
  "app-warn-line": "notice border, decorative",
  "app-social-avatar": "an avatar dot, decorative",
};

const isColor = (v: string) => /^(#[0-9a-f]{6}|rgba\(|var\(--(night|paper|ink|paint-red)[a-z0-9-]*\)$)/i.test(v);

describe("every stated game-token contrast ratio holds", () => {
  it.each(PAIRS)("--$fg on $bg is $stated:1 ($why)", (pair) => {
    const value = contrast(pair);
    expect(round2(value)).toBe(pair.stated);
    expect(assertRole(value, pair.role, pair.bar)).toBeNull();
  });

  it("reads the hidden-tile opacity from game.css, not from a copy", () => {
    expect(HIDDEN).toBe(0.5);
  });

  it("measures every color token of game.css, or says why not", () => {
    const measured = new Set(PAIRS.flatMap((p) => [p.fg, p.bg, p.over]));
    const colors = [...GAME_ROOT, ...GAME_NIGHT].filter(([, v]) => isColor(v)).map(([k]) => k);
    expect(colors.length).toBeGreaterThan(35);
    for (const n of colors) {
      expect(measured.has(n) || n in UNMEASURED, `--${n} has no stated ratio and no reason`).toBe(true);
    }
    for (const n of Object.keys(UNMEASURED)) expect(colors, `stale exemption --${n}`).toContain(n);
  });
});

describe("game.css keeps its islands out of the worlds", () => {
  const SEMANTIC_NAMES = new Set([...Object.keys(SEMANTIC), ...Object.keys(DERIVED)]);
  const refs = (v: string) => [...v.matchAll(/var\(--([a-z0-9-]+)\)/g)].map((m) => m[1] ?? "");

  it("is the islands, the night additions, then type/motion/layout — in that order", () => {
    expect(game.map((b) => b.selector)).toEqual([":root", '[data-world="night"]', ":root"]);
  });

  it(":root tokens never read a semantic token — they would freeze at paper inside the night", () => {
    // A var() resolves where it is declared: a --dg-shirt built on
    // --text-body at :root would be ink on the night's collar.
    for (const [name, value] of GAME_ROOT) {
      for (const r of refs(value)) expect(SEMANTIC_NAMES.has(r), `--${name} → --${r}`).toBe(false);
    }
  });

  it("rebinds no token of the design system — the game only adds names", () => {
    // Also the tripwire for --dur-reveal: the day motion.css adopts it, it
    // must leave this file rather than be declared twice.
    const files = ["colors.css", "world-night.css", "shape.css", "typography.css", "spacing.css", "motion.css"];
    const dsNames = new Set(files.flatMap((f) => parseBlocks(f).flatMap((b) => [...b.decls.keys()])));
    expect(dsNames.size).toBeGreaterThan(150);
    for (const name of [...GAME_ROOT.keys(), ...GAME_NIGHT.keys()]) expect(dsNames.has(name), `--${name}`).toBe(false);
  });
});
