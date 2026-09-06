import { ImageResponse } from "next/og";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { loadOgFonts } from "@/lib/og/fonts";
import { OG_INK, OG_INK_SOFT, OG_PAINT_WHITE, OG_RED, OG_SIZE, OG_STONE, OG_STONE_2 } from "@/lib/og/tokens";
import { PILLARS } from "@/lib/scoring/pillars";
import { SITE_DOMAIN_LABEL } from "@/lib/site";

/**
 * Share image of the content pages (landing, How it works, glossary) — the
 * one a LinkedIn or Slack preview of `/fr` or `/en` shows. Until now only
 * result pages had one; a share of the landing came out as a bare link.
 *
 * Same frame as the result image (DESIGN-BRIEF.md §03: 1200×630, 2px ink
 * border, stone ground, the dashed road line), with the landing's own
 * content in the middle instead of a score: the hero headline in the display
 * stencil with its red accent (`--display-hero`, screen 01), the subtitle,
 * and the five pillar chips. Feed-size rule kept in mind: at ~320px wide the
 * headline, the red accent and the wordmark are what must survive — nothing
 * else competes with them.
 *
 * One image per language, chosen by the `[locale]` segment: a crawler sends
 * no cookie, so the URL is the only language signal it gives us.
 */
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateImageMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  return [{ id: resolved, size, contentType, alt: tc(UI_STRINGS.meta.shareImageAlt, resolved) }];
}

export default async function LandingShareImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  const fonts = await loadOgFonts();
  const t = UI_STRINGS.landing;

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
            {tc(t.bibTag, resolved)}
          </div>
        </div>

        {/* middle: the hero headline (screen 01) and its subtitle */}
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
            <span style={{ marginRight: 28 }}>{tc(t.h1Line1, resolved)}</span>
            {tc(t.h1Line2, resolved) ? <span style={{ marginRight: 28 }}>{tc(t.h1Line2, resolved).trim()}</span> : null}
            <span style={{ color: OG_RED }}>{tc(t.h1Accent, resolved)}</span>
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
            {tc(t.subtitle, resolved)}
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
                {tc(UI_STRINGS.pillars[pillar], resolved)}
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
    { ...size, fonts },
  );
}
