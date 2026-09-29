import { createHash } from "node:crypto";
import { SITE_URL } from "@/lib/site";
import { OG_INK, OG_PAINT_WHITE, OG_RED_ACTION } from "./tokens";

/**
 * The embeddable badge — `GROWTH-PLAN.md` 3.1 (CHANTIERS.md A3.1,
 * 2026-09-29): « Tour de Growth · 74/100 », shields-style, for a README.
 *
 * It says what the share image already says and nothing more: the total. No
 * stage, no tone, no answer, no id in the picture. A README badge is a
 * permanent, anonymous link back to the result — whose visitor CTA already
 * carries `?ref=` — so it works for the sharing loop on its own.
 *
 * On a VERSIONED address, like the share image (`share-image.ts`, VERCEL.md
 * §1.8): `/r/<id>/badge/<token>.svg`, the token a hash of everything drawn.
 * A result's total never changes, so a README's address is good for a year
 * on the CDN, and a repeat view costs the origin nothing — the reason
 * FIRESTORE.md §1.3 gives for caching a public read. When the frame changes,
 * bump BADGE_VERSION: the old addresses still answer, with the new picture,
 * cached briefly.
 *
 * No font file: the text is set in the reader's Verdana (the family every
 * shields badge uses), and `textLength` fits each run to the width measured
 * here, so a substitute face cannot overflow its box. The colours are the
 * share image's, from the typed tokens: white on ink, white on the red fill
 * made for small white text (4.65:1, colors.css R-22).
 *
 * Server-only (`node:crypto`): the address reaches the page as a prop.
 */

/** Bump when the drawing changes — layout, colours, text — so every address already cached turns over. */
export const BADGE_VERSION = 1;

/** The brand, in both languages: a name is not translated. */
export const BADGE_LABEL = "Tour de Growth";

export function badgeMessage(total: number): string {
  return `${total}/100`;
}

/**
 * What the badge says, and what a screen reader and the Markdown's alt say
 * for it: the brand and the total, the same in both languages.
 */
// TODO: à relire (convention 6).
export function badgeAlt(total: number): string {
  return `${BADGE_LABEL} · ${badgeMessage(total)}`;
}

/**
 * Verdana at 11px, per glyph (the widths shields.io measures with). Anything
 * missing counts as the widest lower-case letter, so a width is never short.
 */
const VERDANA_11: Record<string, number> = {
  " ": 3.87,
  "/": 4.87,
  "0": 7,
  "1": 7,
  "2": 7,
  "3": 7,
  "4": 7,
  "5": 7,
  "6": 7,
  "7": 7,
  "8": 7,
  "9": 7,
  G: 7.75,
  T: 6.72,
  d: 6.85,
  e: 6.55,
  h: 7.02,
  o: 6.66,
  r: 4.71,
  t: 4.3,
  u: 7.02,
  w: 9.01,
};
const FALLBACK_GLYPH = 9.01;
const PADDING = 6;
const HEIGHT = 20;

export function textWidth(text: string): number {
  return [...text].reduce((sum, ch) => sum + (VERDANA_11[ch] ?? FALLBACK_GLYPH), 0);
}

const round = (n: number) => Math.round(n * 10) / 10;

/**
 * A total the badge may draw: an integer from 0 to 100, the scoring engine's.
 * Checked, not assumed — the total comes out of Firestore, which the code
 * reads without validating it, and this is the one place a stored field
 * becomes markup on our own origin, cached for a year (security review of
 * A3, 2026-09-29).
 */
export function isBadgeTotal(total: unknown): total is number {
  return typeof total === "number" && Number.isInteger(total) && total >= 0 && total <= 100;
}

/** The badge, as an SVG document. Throws on anything but a total the engine can produce. */
export function renderBadgeSvg(total: number): string {
  if (!isBadgeTotal(total)) throw new Error("renderBadgeSvg: total must be an integer from 0 to 100");
  const label = BADGE_LABEL;
  const message = badgeMessage(total);
  const labelText = round(textWidth(label));
  const messageText = round(textWidth(message));
  const labelWidth = round(labelText + 2 * PADDING);
  const messageWidth = round(messageText + 2 * PADDING);
  const width = round(labelWidth + messageWidth);
  const alt = badgeAlt(total);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${HEIGHT}" role="img" aria-label="${alt}">`,
    `<title>${alt}</title>`,
    `<clipPath id="r"><rect width="${width}" height="${HEIGHT}" rx="3" fill="#fff"/></clipPath>`,
    `<g clip-path="url(#r)"><rect width="${labelWidth}" height="${HEIGHT}" fill="${OG_INK}"/><rect x="${labelWidth}" width="${messageWidth}" height="${HEIGHT}" fill="${OG_RED_ACTION}"/></g>`,
    `<g fill="${OG_PAINT_WHITE}" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">`,
    `<text x="${round(labelWidth / 2)}" y="14" textLength="${labelText}" lengthAdjust="spacingAndGlyphs">${label}</text>`,
    `<text x="${round(labelWidth + messageWidth / 2)}" y="14" textLength="${messageText}" lengthAdjust="spacingAndGlyphs" font-weight="bold">${message}</text>`,
    `</g></svg>`,
  ].join("");
}

/** Twelve hex characters of a hash over everything the badge draws. */
export function badgeToken(total: number): string {
  return createHash("sha256").update(JSON.stringify({ v: BADGE_VERSION, svg: renderBadgeSvg(total) })).digest("hex").slice(0, 12);
}

export function badgePath(id: string, total: number): string {
  return `/r/${id}/badge/${badgeToken(total)}.svg`;
}

const TOKEN_SEGMENT = /^([a-f0-9]{12})\.svg$/;

/** The `[token]` route segment's token, or null for anything that is not a badge address. */
export function parseBadgeToken(segment: string): string | null {
  return TOKEN_SEGMENT.exec(segment)?.[1] ?? null;
}

/**
 * The line an owner pastes into a README: the badge, linking to the result.
 * Absolute, on the canonical domain — a README is read on GitHub, not here.
 */
export function badgeMarkdown(id: string, total: number): string {
  return `[![${badgeAlt(total)}](${SITE_URL}${badgePath(id, total)})](${SITE_URL}/r/${id})`;
}
