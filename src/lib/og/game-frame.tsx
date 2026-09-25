import type { ReactNode } from "react";
import { ImageResponse } from "next/og";
import type { OgFonts } from "@/lib/og/fonts";
import type { GameHubShareText } from "@/lib/og/game-hub-share-text";
import type { GameLevelShareText } from "@/lib/og/game-level-share-text";
import {
  OG_NIGHT_0,
  OG_NIGHT_1,
  OG_NIGHT_2,
  OG_NIGHT_AMBER,
  OG_NIGHT_BAD,
  OG_NIGHT_LINE,
  OG_NIGHT_MUTED,
  OG_NIGHT_TEXT,
  OG_PAINT_WHITE,
  OG_RED,
  OG_SIZE,
} from "@/lib/og/tokens";
import { SITE_DOMAIN_LABEL } from "@/lib/site";

/**
 * The share images of « Le côté obscur » (plan §3.9, chantier G4b): the hub
 * and level 1. Same 1200×630 frame as every other share image of the site
 * (DESIGN-BRIEF.md §03 — 2px border, wordmark top left, domain badge), but in
 * the NIGHT world (plan §2): the game is Flixo's office, and a preview that
 * looked like the Tour's paper would promise a questionnaire.
 *
 * The night world's own rules, applied by hand because Satori reads no
 * `data-world` rebinding:
 * - Red is never TEXT at night (3.76:1 on the panel): the "GROWTH" of the
 *   wordmark takes the night's red text colour, the brand-red fill stays for
 *   the domain badge, whose label sits on its own fill as the primary button
 *   does in both worlds.
 * - A component's edge is the night line (≥ 3:1 on all three grounds).
 * - A hidden value is never drawn, not even blurred (plan §2.7, and Satori has
 *   no blur anyway): the tile shows a solid block and says why.
 *
 * Feed-size rule (checked downscaled to 320px wide): the title, the wordmark
 * and the churn figure are what must survive — nothing else is sized to
 * compete with them.
 *
 * Every string drawn here comes from `game-hub-share-text.ts` or
 * `game-level-share-text.ts`, which `fonts.test.ts` also reads: adding text
 * to these images means adding it there, never inline here.
 */

// The night ground's lamp, same geometry as its CSS counterpart (world-night.css,
// --ground-lift): a faint lamp of the night text top left, a deeper shade bottom
// right. Literal rgba because Satori has no custom properties; the base colour
// comes from the typed tokens.
const NIGHT_GROUND = `radial-gradient(circle at 16% 12%, rgba(243,239,228,0.06), transparent 42%), radial-gradient(circle at 88% 74%, rgba(0,0,0,0.35), transparent 46%), ${OG_NIGHT_0}`;
// The road line of the paper images, redrawn in the night text at low alpha:
// decorative, the same place on every share image of the site.
const ROAD_LINE = "rgba(243,239,228,0.07)";

function GameFrame({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        padding: "44px 56px",
        border: `2px solid ${OG_NIGHT_LINE}`,
        background: NIGHT_GROUND,
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 96,
          left: 0,
          width: "100%",
          height: 0,
          borderTop: `8px dashed ${ROAD_LINE}`,
          display: "flex",
        }}
      />

      {/* top row: wordmark + domain */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", fontFamily: "Stardos Stencil", fontSize: 30, color: OG_NIGHT_TEXT }}>
          TOUR DE&nbsp;<span style={{ color: OG_NIGHT_BAD }}>GROWTH</span>
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
            padding: "10px 18px",
            whiteSpace: "nowrap",
          }}
        >
          {SITE_DOMAIN_LABEL}
        </div>
      </div>

      {/* middle: the kicker in the key-figure amber, the title in the stencil */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontFamily: "IBM Plex Mono",
            fontWeight: 600,
            fontSize: 20,
            letterSpacing: 3,
            color: OG_NIGHT_AMBER,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 14,
            fontFamily: "Stardos Stencil",
            fontSize: 84,
            lineHeight: 1.0,
            letterSpacing: 2,
            color: OG_NIGHT_TEXT,
            maxWidth: 1060,
          }}
        >
          {title}
        </div>
      </div>

      {children}
    </div>
  );
}

const MONO_LABEL = {
  display: "flex",
  fontFamily: "IBM Plex Mono",
  fontWeight: 500,
  fontSize: 16,
  letterSpacing: 2,
} as const;

/** The hub: the five zones of the Tour, the one level that can be played lit, the four others dark. */
export function renderGameHubShareImage(text: GameHubShareText, fonts: OgFonts): ImageResponse {
  return new ImageResponse(
    (
      <GameFrame kicker={text.kicker} title={text.title}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ ...MONO_LABEL, color: OG_NIGHT_MUTED, marginBottom: 14 }}>{text.zonesLabel}</div>
          <div style={{ display: "flex", gap: 12 }}>
            {text.zones.map((zone) => (
              <div
                key={zone.pillar}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  width: 208,
                  height: 176,
                  boxSizing: "border-box",
                  padding: "16px 16px 14px",
                  borderRadius: 6,
                  // The open zone: amber edge on the raised panel. The closed ones:
                  // a dashed night line — and the word "soon", never the dash alone.
                  background: zone.open ? OG_NIGHT_2 : OG_NIGHT_1,
                  border: zone.open ? `3px solid ${OG_NIGHT_AMBER}` : `2px dashed ${OG_NIGHT_LINE}`,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      display: "flex",
                      fontFamily: "IBM Plex Mono",
                      fontWeight: 600,
                      fontSize: 16,
                      letterSpacing: 1,
                      color: zone.open ? OG_NIGHT_AMBER : OG_NIGHT_MUTED,
                    }}
                  >
                    {zone.name}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      marginTop: 8,
                      fontFamily: "Inter",
                      fontWeight: zone.open ? 600 : 500,
                      fontSize: 17,
                      lineHeight: 1.3,
                      color: zone.open ? OG_NIGHT_TEXT : OG_NIGHT_MUTED,
                    }}
                  >
                    {zone.question}
                  </div>
                </div>
                <div
                  style={{
                    ...MONO_LABEL,
                    fontSize: 14,
                    fontWeight: zone.open ? 600 : 500,
                    color: zone.open ? OG_NIGHT_AMBER : OG_NIGHT_MUTED,
                  }}
                >
                  {zone.state}
                </div>
              </div>
            ))}
          </div>
        </div>
      </GameFrame>
    ),
    { ...OG_SIZE, fonts },
  );
}

/**
 * Level 1: the dashboard's three tiles — churn with its figure, then the two
 * counters the dashboard does not show (plan §3.9) — and the line that says
 * where they are.
 */
export function renderGameLevelShareImage(text: GameLevelShareText, fonts: OgFonts): ImageResponse {
  return new ImageResponse(
    (
      <GameFrame kicker={text.kicker} title={text.title}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", gap: 16 }}>
            {text.tiles.map((tile, index) => {
              const shown = tile.value !== undefined;
              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: 352,
                    height: 132,
                    boxSizing: "border-box",
                    padding: "16px 20px",
                    borderRadius: 6,
                    background: OG_NIGHT_1,
                    border: shown ? `2px solid ${OG_NIGHT_LINE}` : `2px dashed ${OG_NIGHT_LINE}`,
                  }}
                >
                  <div style={{ ...MONO_LABEL, color: OG_NIGHT_MUTED }}>{tile.label}</div>
                  {shown ? (
                    <div style={{ display: "flex", alignItems: "baseline", marginTop: 10 }}>
                      <div
                        style={{
                          display: "flex",
                          fontFamily: "Stardos Stencil",
                          fontSize: 60,
                          lineHeight: 1.0,
                          color: OG_NIGHT_AMBER,
                        }}
                      >
                        {tile.value}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          marginLeft: 12,
                          fontFamily: "IBM Plex Mono",
                          fontWeight: 500,
                          fontSize: 16,
                          color: OG_NIGHT_MUTED,
                        }}
                      >
                        {tile.unit}
                      </div>
                    </div>
                  ) : (
                    // The value itself is never rendered, not even dimmed: a solid
                    // block, and the reason in words at full opacity.
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 12,
                        height: 58,
                        borderRadius: 4,
                        background: OG_NIGHT_2,
                        fontFamily: "IBM Plex Mono",
                        fontWeight: 500,
                        fontSize: 15,
                        color: OG_NIGHT_MUTED,
                      }}
                    >
                      {text.hidden}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontFamily: "Inter",
              fontWeight: 500,
              // One line in both languages, across the full width of the tile
              // row: at 23px in 1000px each left one word alone on a second
              // line. It is the quiet line — not a feed-size element.
              fontSize: 20,
              lineHeight: 1.35,
              color: OG_NIGHT_MUTED,
            }}
          >
            {text.sentence}
          </div>
        </div>
      </GameFrame>
    ),
    { ...OG_SIZE, fonts },
  );
}
