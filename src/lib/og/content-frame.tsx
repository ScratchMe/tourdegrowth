import { ImageResponse } from "next/og";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import type { OgFonts } from "@/lib/og/fonts";
import { OG_INK, OG_INK_SOFT, OG_PAINT_WHITE, OG_RED, OG_SIZE, OG_STONE, OG_STONE_2 } from "@/lib/og/tokens";
import { PILLARS } from "@/lib/scoring/pillars";
import { SITE_DOMAIN_LABEL } from "@/lib/site";

/** One run of the headline; `accent` paints it in the brand red, like the landing's "stall?". */
export interface HeadlineSegment {
  text: string;
  accent?: boolean;
}

/**
 * The share frame of every page that is not a result — the landing and its
 * content subtree (`src/app/[locale]/opengraph-image.tsx`) and `/quiz`
 * (`src/app/(app)/quiz/share/[locale]/route.ts`).
 *
 * Same frame as the result image (DESIGN-BRIEF.md §03: 1200×630, 2px ink
 * border, stone ground, the dashed road line); only the middle changes from
 * one page to the other — a headline in the display stencil and one line
 * under it. Extracted when `/quiz` needed its own image (SEO audit v1 §1.1)
 * rather than copied: two copies of this frame would drift the first time a
 * token or the pillar row changed, and the pillar row is exactly what makes
 * the two images read as the same product in a feed.
 *
 * Feed-size rule kept in mind: at ~320px wide the headline, the red accent
 * and the wordmark are what must survive — nothing else competes with them.
 * Every string drawn here is also listed in `fonts.test.ts`, which checks the
 * subset fonts cover it.
 */
export function renderContentShareImage(
  locale: Locale,
  { headline, subtitle }: { headline: HeadlineSegment[]; subtitle: string },
  fonts: OgFonts,
): ImageResponse {
  const t = UI_STRINGS.landing;
  const last = headline.length - 1;

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
          border: `2px solid ${OG_INK}`,
          background: `radial-gradient(at 12% 10%, rgba(255,255,255,0.5), transparent 55%), radial-gradient(at 92% 86%, rgba(0,0,0,0.06), transparent 55%), ${OG_STONE}`,
          position: "relative",
          overflow: "hidden",
          fontFamily: "Inter",
        }}
      >
        {/* decorative road line — same place as on the result image */}
        <div
          style={{
            position: "absolute",
            top: 96,
            left: 0,
            width: "100%",
            height: 0,
            borderTop: "8px dashed rgba(33,28,21,0.10)",
            display: "flex",
          }}
        />

        {/* top row: wordmark + bib tag */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontFamily: "Stardos Stencil", fontSize: 28, color: OG_INK }}>
            TOUR DE&nbsp;<span style={{ color: OG_RED }}>GROWTH</span>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "IBM Plex Mono",
              fontWeight: 500,
              fontSize: 16,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: OG_INK_SOFT,
              background: OG_PAINT_WHITE,
              border: `2px dashed ${OG_INK_SOFT}`,
              borderRadius: 4,
              padding: "8px 16px",
            }}
          >
            {tc(t.bibTag, locale)}
          </div>
        </div>

        {/* middle: the headline in the display stencil, and one line under it */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontFamily: "Stardos Stencil",
              fontSize: 104,
              lineHeight: 1.0,
              letterSpacing: 2,
              color: OG_INK,
            }}
          >
            {headline.map((segment, index) => (
              <span
                key={index}
                style={{
                  ...(index < last ? { marginRight: 28 } : {}),
                  ...(segment.accent ? { color: OG_RED } : {}),
                }}
              >
                {segment.text}
              </span>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 27,
              lineHeight: 1.35,
              color: OG_INK_SOFT,
              maxWidth: 820,
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* bottom row: the five pillars + domain */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 10 }}>
            {PILLARS.map((pillar) => (
              <div
                key={pillar}
                style={{
                  display: "flex",
                  fontFamily: "IBM Plex Mono",
                  fontWeight: 500,
                  fontSize: 18,
                  color: OG_INK_SOFT,
                  background: OG_STONE_2,
                  border: `2px dashed ${OG_INK_SOFT}`,
                  borderRadius: 4,
                  padding: "7px 14px",
                }}
              >
                {tc(UI_STRINGS.pillars[pillar], locale)}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "IBM Plex Mono",
              fontWeight: 500,
              fontSize: 19,
              color: OG_PAINT_WHITE,
              background: OG_RED,
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
    { ...OG_SIZE, fonts },
  );
}
