import { ImageResponse } from "next/og";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { loadOgFonts } from "@/lib/og/fonts";
import {
  OG_INK as INK,
  OG_INK_SOFT as INK_SOFT,
  OG_PAINT_WHITE as PAINT_WHITE,
  OG_RED as RED,
  OG_RED_INK as RED_INK,
  OG_SIZE,
  OG_STONE as STONE,
} from "@/lib/og/tokens";
import type { Pillar } from "@/lib/scoring/pillars";
import { getCachedSubmissionById } from "@/lib/submissions/cached-repository";
import { isValidSubmissionId } from "@/lib/submissions/referral";
import { getSampleNextMove, SAMPLE_RESULT } from "@/lib/submissions/sample";
import { primaryBottleneck, resolveBottleneck } from "@/lib/scoring/bottleneck";
import { stallSentence } from "@/lib/submissions/stall-sentence";
import { resolveNextMove } from "@/lib/scoring/next-move";
import { SITE_DOMAIN_LABEL } from "@/lib/site";

// DESIGN-BRIEF.md §03 — "highest care". Exact 1200x630 frame, Stardos
// Stencil embedded (never a system fallback — the stencil numeral IS the
// image). Fonts and colour tokens live in `src/lib/og/` since the landing
// page got a share image of its own: one copy, two images.

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Tour de Growth — AARRR growth check-up result";

interface OgData {
  total: number;
  /** The stage the action belongs to, and its score. Null when nothing is behind — see `lib/scoring/bottleneck.ts`. */
  bottleneck: { pillar: Pillar; score: number } | null;
  /**
   * The action, from `content/next-moves.ts` — NEVER the Deep dive's
   * `priorityAction`, even when one exists.
   *
   * Two reasons. The library caps at 144 characters, which is exactly what
   * this card is sized for (five lines at Inter 600 28px in ~490px); a
   * Gemini sentence has no cap and would overflow or force the type down.
   * And a link preview is the one surface that must render identically for
   * everyone who sees it — deterministic beats personalised here.
   */
  nextMove: string;
  locale: Locale;
  roast: boolean;
  /** SPEC-ADDENDUM-01.md §2.6 — swaps the checkup badge's text, no other gabarit change. */
  deepDive: boolean;
}

/** Shared by both branches so the sample cannot drift from the real path. */
function bottleneckOf(pillars: { pillar: Pillar; score: number }[]) {
  const view = resolveBottleneck(pillars);
  const pillar = primaryBottleneck(view);
  return pillar ? { pillar, score: view.pillars[0]!.score } : null;
}

async function loadOgData(id: string): Promise<OgData | null> {
  if (id === "sample") {
    return {
      total: SAMPLE_RESULT.total,
      bottleneck: bottleneckOf(SAMPLE_RESULT.pillars),
      nextMove: getSampleNextMove("en"),
      locale: "en",
      roast: false,
      deepDive: false, // SPEC.md §12: the sample is never enriched
    };
  }

  // REVIEW-02.md R2-19: an id that cannot be ours is a 404 before it is a read.
  if (!isValidSubmissionId(id)) return null;

  const submission = await getCachedSubmissionById(id);
  // REVIEW.md R-14: a dead link used to render a real-looking "0/100" frame,
  // so a mistyped or deleted result previewed as a genuine, terrible score.
  // `null` here becomes a 404 below — no image is better than a false one.
  if (!submission) return null;

  return {
    total: submission.total,
    bottleneck: bottleneckOf(submission.pillars),
    // The AUTHOR's locale, like everything else in this image: a social
    // crawler doesn't send the sharer's cookies, so there is no reader to
    // localise for (the asymmetry R-09 documented).
    nextMove: resolveNextMove(
      submission.locale,
      submission.pillars,
      submission.weakestPillar,
      submission.answers,
    ),
    locale: submission.locale,
    roast: submission.tone === "roast",
    deepDive: submission.deepDive !== null,
  };
}

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [data, fonts] = await Promise.all([loadOgData(id), loadOgFonts()]);
  if (!data) return new Response(null, { status: 404 });
  const { total, bottleneck, nextMove, locale, roast, deepDive } = data;
  const accent = roast ? RED : INK;

  // No stage is behind, so the hook cannot name one — the same honesty rule
  // the Bottleneck block applies on the page itself.
  const bottomSentence = stallSentence(locale, bottleneck?.pillar ?? null);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
          padding: "48px 56px",
          border: `2px solid ${accent}`,
          background: STONE,
          position: "relative",
          overflow: "hidden",
          fontFamily: "Inter",
        }}
      >
        {/* decorative road line */}
        <div
          style={{
            position: "absolute",
            top: 96,
            left: 0,
            width: "100%",
            height: 0,
            borderTop: `8px dashed rgba(33,28,21,0.10)`,
            display: "flex",
          }}
        />

        {/* top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontFamily: "Stardos Stencil", fontSize: 28, color: INK }}>
            TOUR DE&nbsp;<span style={{ color: RED }}>GROWTH</span>
          </div>
          {roast ? (
            <div
              style={{
                display: "flex",
                fontFamily: "IBM Plex Mono",
                fontWeight: 600,
                fontSize: 16,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: PAINT_WHITE,
                background: RED,
                borderRadius: 4,
                padding: "8px 16px",
              }}
            >
              {tc(UI_STRINGS.og.roastBadge, locale)}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                fontFamily: "IBM Plex Mono",
                fontWeight: 500,
                fontSize: 16,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: INK_SOFT,
                background: PAINT_WHITE,
                border: `2px dashed ${INK_SOFT}`,
                borderRadius: 4,
                padding: "8px 16px",
              }}
            >
              {tc(deepDive ? UI_STRINGS.og.checkupBadgeDeepDive : UI_STRINGS.og.checkupBadge, locale)}
            </div>
          )}
        </div>

        {/* middle row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontFamily: "IBM Plex Mono",
                fontWeight: 500,
                fontSize: 19,
                textTransform: "uppercase",
                letterSpacing: 2,
                color: INK_SOFT,
                marginBottom: 8,
              }}
            >
              {tc(UI_STRINGS.og.scoreLabel, locale)}
            </div>
            {/* 12px of air: the stencil digits sit taller than the 0.85 line box
                and were touching the label above once the font actually loaded. */}
            <div style={{ display: "flex", alignItems: "baseline", marginTop: 12 }}>
              <div style={{ display: "flex", fontFamily: "Stardos Stencil", fontSize: 268, lineHeight: 0.85, color: INK }}>
                {total}
              </div>
              <div style={{ display: "flex", fontFamily: "Stardos Stencil", fontSize: 76, color: INK_SOFT, marginLeft: 10 }}>
                /100
              </div>
            </div>
          </div>

          {/* Design system extension 03 §3 — the five pillar rows leave, the
              next move takes their place. Five scores are the least
              shareable thing on this image: they are re-derivable from the
              page and nobody reposts a table. An action is a reason to post.

              Same "dashed red is advice" grammar as `PriorityMove` on the
              page, so a reader who clicks through recognises it. Sized for
              the library's 144-character cap: five lines at Inter 600
              28px/1.3 in this column. Do not shrink the type to fit a longer
              sentence — cap the sentence. */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              marginLeft: 48,
              background: PAINT_WHITE,
              border: `3px dashed ${RED}`,
              borderRadius: 12,
              padding: "26px 30px",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "IBM Plex Mono",
                fontWeight: 600,
                fontSize: 17,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: RED_INK,
              }}
            >
              <span>{tc(UI_STRINGS.result.nextMoveLabel, locale)}</span>
              {bottleneck ? (
                <span style={{ color: INK_SOFT }}>
                  {tc(UI_STRINGS.pillars[bottleneck.pillar], locale).toUpperCase()} · {bottleneck.score}/20
                </span>
              ) : null}
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: 28,
                lineHeight: 1.3,
                marginTop: 14,
                color: INK,
              }}
            >
              {nextMove}
            </div>
          </div>
        </div>

        {/* bottom row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Inter", fontWeight: 600, fontSize: 30, maxWidth: 640, lineHeight: 1.25 }}>
            <span style={{ color: INK }}>{bottomSentence}</span>
            <span style={{ color: INK_SOFT }}>{tc(UI_STRINGS.og.whereDoesYours, locale)}</span>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "IBM Plex Mono",
              fontWeight: 500,
              fontSize: 19,
              color: PAINT_WHITE,
              background: RED,
              borderRadius: 5,
              padding: "12px 18px",
              whiteSpace: "nowrap",
            }}
          >
            {SITE_DOMAIN_LABEL}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
