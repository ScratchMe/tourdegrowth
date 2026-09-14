import { createHash } from "node:crypto";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { primaryBottleneck, resolveBottleneck } from "@/lib/scoring/bottleneck";
import { resolveNextMove } from "@/lib/scoring/next-move";
import type { Pillar } from "@/lib/scoring/pillars";
import { SITE_DOMAIN_LABEL } from "@/lib/site";
import { getSampleNextMove, SAMPLE_RESULT } from "@/lib/submissions/sample";
import { stallSentence } from "@/lib/submissions/stall-sentence";
import type { Submission } from "@/lib/submissions/types";
import { toPillarViews } from "@/lib/submissions/view-model";

/**
 * The result's share image has a VERSIONED address — 2026-09-14.
 *
 * `/r/<id>/share/<token>.png`, where the token is a hash of everything the
 * picture renders. That is what lets the CDN cache each address as immutable:
 * the address turns over exactly when the picture would (a Deep dive
 * completing swaps the badge, so it mints a new token), and never otherwise.
 *
 * Why this exists. Since design system extension 03 the result page shows
 * its own share image, so every view of a result was a Satori render — the
 * single most expensive thing this app does per request (~185 ms of CPU
 * warm, 530 ms on a cold instance, measured 2026-09-14) — on an address that
 * carried `max-age=0, must-revalidate` and no ETag. A plain `s-maxage` on
 * that address was tried and reverted (adversarial review, 2026-09-10): the
 * owner who had just finished a Deep dive kept seeing the old badge, and
 * the metadata route is not ISR, so nothing could purge it. A token in the
 * path is the correct fix, and it also means giving up Next's
 * `opengraph-image.tsx` file convention for a route handler, since the
 * convention owns its own uncacheable URL.
 *
 * Server-only: hashes with `node:crypto` and resolves copy from the
 * dictionary. Never import from a Client Component — the address travels to
 * `ResultView` as a prop (`src/__tests__/client-bundles.test.ts` guards it).
 */

/** Bump when the frame itself changes — layout, fonts, colours — so every address already cached turns over. */
export const SHARE_IMAGE_VERSION = 1;

/**
 * The token the two legacy addresses rewrite to (`next.config.mjs`):
 * `/r/<id>/opengraph-image` from before the `(app)` route group and
 * `/r/<id>/opengraph-image-1u74ed` from inside it. Shares scraped under
 * either still resolve, and are cached briefly rather than as immutable,
 * because the picture behind them can still change.
 */
export const LEGACY_SHARE_TOKEN = "legacy";

export const SHARE_IMAGE_ALT = "Tour de Growth — AARRR growth check-up result";

/** Everything the frame draws, and nothing it does not. */
export interface ShareImageModel {
  total: number;
  /** The stage the action belongs to, and its score. Null when nothing is behind — see `lib/scoring/bottleneck.ts`. */
  bottleneck: { pillar: Pillar; score: number } | null;
  /**
   * The action, from `content/next-moves.ts` — NEVER the Deep dive's
   * `priorityAction`, even when one exists.
   *
   * Two reasons. The library caps at 144 characters, which is exactly what
   * the frame's card is sized for (five lines at Inter 600 28px in ~490px);
   * a Gemini sentence has no cap and would overflow or force the type down.
   * And a link preview is the one surface that must render identically for
   * everyone who sees it — deterministic beats personalised here.
   */
  nextMove: string;
  /** The AUTHOR's locale: a social crawler sends no cookies, so there is no reader to localise for (the asymmetry R-09 documented). */
  locale: Locale;
  roast: boolean;
  /** SPEC-ADDENDUM-01.md §2.6 — swaps the checkup badge's text, no other gabarit change. */
  deepDive: boolean;
}

/** The copy the frame draws, resolved once — the token hashes it, so a copy change turns the address over without anyone bumping a version. */
export interface ShareImageStrings {
  badge: string;
  scoreLabel: string;
  nextMoveLabel: string;
  /** `RETENTION · 8/20` beside the action label; null when nothing is behind. */
  bottleneckLabel: string | null;
  /** The bottom hook — names the stalling stage, or says nothing is stalling (the Bottleneck block's honesty rule). */
  stall: string;
  whereDoesYours: string;
  domain: string;
}

export function shareImageStrings(model: ShareImageModel): ShareImageStrings {
  const { locale } = model;
  return {
    badge: model.roast
      ? tc(UI_STRINGS.og.roastBadge, locale)
      : tc(model.deepDive ? UI_STRINGS.og.checkupBadgeDeepDive : UI_STRINGS.og.checkupBadge, locale),
    scoreLabel: tc(UI_STRINGS.og.scoreLabel, locale),
    nextMoveLabel: tc(UI_STRINGS.result.nextMoveLabel, locale),
    bottleneckLabel: model.bottleneck
      ? `${tc(UI_STRINGS.pillars[model.bottleneck.pillar], locale).toUpperCase()} · ${model.bottleneck.score}/20`
      : null,
    stall: stallSentence(locale, model.bottleneck?.pillar ?? null),
    whereDoesYours: tc(UI_STRINGS.og.whereDoesYours, locale),
    domain: SITE_DOMAIN_LABEL,
  };
}

/** Shared by both models so the sample cannot drift from the real path. */
function bottleneckOf(pillars: readonly { pillar: Pillar; score: number }[]): ShareImageModel["bottleneck"] {
  const view = resolveBottleneck(pillars);
  const pillar = primaryBottleneck(view);
  return pillar ? { pillar, score: view.pillars[0]!.score } : null;
}

export function shareImageModel(submission: Submission): ShareImageModel {
  // Through the narrowing (REVIEW-02.md R2-24): the model is hashed and
  // rendered, never serialised to a client, but `rawPoints` has no business
  // in a hash input either — a token that changed with the raw points would
  // leak them through the address.
  const pillars = toPillarViews(submission.pillars);
  return {
    total: submission.total,
    bottleneck: bottleneckOf(pillars),
    nextMove: resolveNextMove(submission.locale, pillars, submission.weakestPillar, submission.answers),
    locale: submission.locale,
    roast: submission.tone === "roast",
    deepDive: submission.deepDive !== null,
  };
}

/** `/r/sample` — fixed to English, never enriched (SPEC.md §12). */
export function sampleShareImageModel(): ShareImageModel {
  return {
    total: SAMPLE_RESULT.total,
    bottleneck: bottleneckOf(SAMPLE_RESULT.pillars),
    nextMove: getSampleNextMove("en"),
    locale: "en",
    roast: false,
    deepDive: false,
  };
}

/** Twelve hex characters of SHA-256 over the version, the model and the resolved copy. */
export function shareImageToken(model: ShareImageModel): string {
  const input = JSON.stringify({ v: SHARE_IMAGE_VERSION, model, strings: shareImageStrings(model) });
  return createHash("sha256").update(input).digest("hex").slice(0, 12);
}

export function shareImagePath(id: string, token: string): string {
  return `/r/${id}/share/${token}.png`;
}

/** The address the page declares in `og:image` and shows in its share block: one render, one cache entry. */
export function shareImageSrc(id: string, model: ShareImageModel): string {
  return shareImagePath(id, shareImageToken(model));
}

const TOKEN_SEGMENT = /^([a-f0-9]{12}|legacy)\.png$/;

/**
 * The `[token]` route segment, or null for anything that is not a share
 * image address — twelve hex characters or the legacy token, always `.png`
 * (the extension is what the Save link downloads under, and what a scraper
 * expects an image URL to end with).
 */
export function parseShareToken(segment: string): string | null {
  const match = TOKEN_SEGMENT.exec(segment);
  return match ? match[1]! : null;
}
