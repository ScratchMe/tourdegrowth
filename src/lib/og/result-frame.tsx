import { ImageResponse } from "next/og";
import type { OgFonts } from "@/lib/og/fonts";
import type { ShareImageModel, ShareImageStrings } from "@/lib/og/share-image";
import {
  OG_INK as INK,
  OG_INK_SOFT as INK_SOFT,
  OG_PAINT_WHITE as PAINT_WHITE,
  OG_RED as RED,
  OG_RED_INK as RED_INK,
  OG_SIZE,
  OG_STONE as STONE,
} from "@/lib/og/tokens";

// DESIGN-BRIEF.md §03 — "highest care". Exact 1200x630 frame, Stardos
// Stencil embedded (never a system fallback — the stencil numeral IS the
// image). Fonts and colour tokens live in `src/lib/og/` since the landing
// page got a share image of its own: one copy, two images.
//
// This used to be `src/app/(app)/r/[id]/opengraph-image.tsx`. It moved here,
// unchanged in what it draws, the day the address got a version token
// (`share-image.ts`): the file convention owns an uncacheable URL, a route
// handler can serve a cacheable one. `src/lib/og/fonts.test.ts` lists every
// string this frame draws — adding text here means adding it there.

export function renderResultShareImage(
  model: ShareImageModel,
  strings: ShareImageStrings,
  fonts: OgFonts,
  headers: Record<string, string>,
): ImageResponse {
  const { total, roast, nextMove } = model;
  const accent = roast ? RED : INK;

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
              {strings.badge}
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
              {strings.badge}
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
              {strings.scoreLabel}
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
              <span>{strings.nextMoveLabel}</span>
              {strings.bottleneckLabel ? <span style={{ color: INK_SOFT }}>{strings.bottleneckLabel}</span> : null}
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
            <span style={{ color: INK }}>{strings.stall}</span>
            <span style={{ color: INK_SOFT }}>{strings.whereDoesYours}</span>
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
            {strings.domain}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts, headers },
  );
}
