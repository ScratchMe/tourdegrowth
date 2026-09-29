import { ImageResponse } from "next/og";
import type { OgFonts } from "@/lib/og/fonts";
import type { ShareImageModel, ShareImageStrings } from "@/lib/og/share-image";
import {
  OG_INK as INK,
  OG_INK_SOFT as INK_SOFT,
  OG_PAINT_WHITE as PAINT_WHITE,
  OG_RED as RED,
  OG_RED_ACTION as RED_ACTION,
  OG_RED_INK as RED_INK,
  OG_RED_SOFT as RED_SOFT,
  OG_SIZE,
  OG_STONE as STONE,
  OG_STONE_2 as STONE_2,
} from "@/lib/og/tokens";
import { stageProfile } from "@/lib/viz/stage-profile";

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
//
// Design I + B (retained by Antoine on 2026-09-28, SHARE_IMAGE_VERSION 2):
// I's layout — wordmark, big score on the left, the action in a dashed red
// card, the hook and the address at the bottom — with B's signs: the score
// stands on a kilometre marker, the stage profile runs under the action, and
// the space's pill (« 1/3 · PLAINE », the band's kicker) sits beside the wordmark.

/** The right column: 1200 − 2 × 56 of padding − the marker's 300 − 44 of gap. */
const PROFILE_W = 744;
const PROFILE_H = 190;
/**
 * Room above the highest climb for its flag — 50, not the mockup's 36: with
 * every stage at 0/20, five flags at 36 touched the action card's shadow —
 * and the road's line, with the labels under it.
 */
const PROFILE_BOX = { width: PROFILE_W, height: PROFILE_H, top: 50, base: 162, floor: 3 };

/** The Tour's pictogram, the band's (`brand/SpaceBand`): a flat stage and its finish flag. */
const TOUR_PICTO = [
  { d: "M1 20.5H33", stroke: true, width: 2.2 },
  { d: "M1 19V15.2C5 14.2 8 15.6 12 14.8S20 13.9 24 14.6 30 14.2 33 14.4V19Z", stroke: false, width: 0 },
  { d: "M28.6 14V4.2", stroke: true, width: 1.8 },
  { d: "M28.6 4.4H33V8.6H28.6Z", stroke: false, width: 0 },
];

export function renderResultShareImage(
  model: ShareImageModel,
  strings: ShareImageStrings,
  fonts: OgFonts,
  headers: Record<string, string>,
): ImageResponse {
  const { total, roast, nextMove } = model;
  const accent = roast ? RED : INK;
  const profile = stageProfile(model.profile, 20, PROFILE_BOX);
  const mono = (size: number, extra: Record<string, string | number> = {}) => ({
    display: "flex",
    fontFamily: "IBM Plex Mono",
    fontWeight: 600,
    fontSize: size,
    textTransform: "uppercase" as const,
    ...extra,
  });

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
          padding: "40px 56px 38px",
          border: `2px solid ${accent}`,
          background: STONE,
          position: "relative",
          overflow: "hidden",
          fontFamily: "Inter",
        }}
      >
        {/* top row: the wordmark and the space's pill; the badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", fontFamily: "Stardos Stencil", fontSize: 30, color: INK }}>
              TOUR DE&nbsp;<span style={{ color: RED }}>GROWTH</span>
            </div>
            {/* The band's ink, the pictogram its only red: a mark, never text. */}
            <div
              style={{
                ...mono(13, { letterSpacing: 1.6, color: PAINT_WHITE }),
                alignItems: "center",
                marginLeft: 20,
                padding: "7px 14px 7px 10px",
                background: INK,
                border: `2px solid ${INK}`,
                borderRadius: 999,
              }}
            >
              <svg width={30} height={19} viewBox="0 0 34 22" style={{ marginRight: 10 }}>
                {TOUR_PICTO.map((part) =>
                  part.stroke ? (
                    <path key={part.d} d={part.d} stroke={RED} strokeWidth={part.width} fill="none" />
                  ) : (
                    <path key={part.d} d={part.d} fill={RED} />
                  ),
                )}
              </svg>
              {strings.space}
            </div>
          </div>
          <div
            style={{
              ...mono(15, { letterSpacing: 1.8 }),
              padding: "10px 18px",
              borderRadius: 999,
              border: `2px solid ${roast ? RED_ACTION : INK}`,
              background: roast ? RED_ACTION : PAINT_WHITE,
              color: roast ? PAINT_WHITE : INK,
            }}
          >
            {strings.badge}
          </div>
        </div>

        {/* middle row: the marker; the action over the profile */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              width: 300,
              paddingBottom: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 232,
                paddingBottom: 20,
                background: PAINT_WHITE,
                border: `3px solid ${INK}`,
                borderTopLeftRadius: 116,
                borderTopRightRadius: 116,
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
                boxShadow: `8px 8px 0 ${INK}`,
              }}
            >
              {/* The red head carries the label: white on the action red, 4.65. */}
              <div
                style={{
                  ...mono(14, { letterSpacing: 2, color: PAINT_WHITE }),
                  alignSelf: "stretch",
                  height: 113,
                  alignItems: "flex-end",
                  justifyContent: "center",
                  textAlign: "center",
                  lineHeight: 1.35,
                  padding: "0 36px 14px",
                  background: RED_ACTION,
                  borderBottom: `3px solid ${INK}`,
                  borderTopLeftRadius: 113,
                  borderTopRightRadius: 113,
                }}
              >
                {strings.scoreLabel}
              </div>
              <div
                style={{
                  display: "flex",
                  fontFamily: "Stardos Stencil",
                  fontSize: 128,
                  lineHeight: 0.86,
                  marginTop: 20,
                  paddingLeft: 8,
                  color: INK,
                }}
              >
                {total}
              </div>
              <div
                style={{
                  ...mono(21, { letterSpacing: 1.2, color: INK_SOFT }),
                  marginTop: 12,
                  padding: "9px 18px 0",
                  borderTop: `3px solid ${INK}`,
                }}
              >
                /100
              </div>
            </div>
            <div
              style={{
                display: "flex",
                position: "absolute",
                left: 6,
                right: 0,
                bottom: 0,
                height: 10,
                borderRadius: 10,
                background: INK,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginLeft: 44, width: PROFILE_W }}>
            {/* Design system extension 03 §3 — the action, not the five rows:
                an action is a reason to post. Same "dashed red is advice"
                grammar as `PriorityMove` on the page. Sized for the library's
                144-character cap: the longest entry holds three lines at
                Inter 600 27px in this column, in both languages (rendered
                2026-09-29). Do not shrink the type to fit a longer sentence —
                cap the sentence. */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background: PAINT_WHITE,
                border: `3px dashed ${RED}`,
                borderRadius: 18,
                padding: "22px 30px 24px",
                boxShadow: `7px 7px 0 ${RED}`,
              }}
            >
              <div style={{ ...mono(15, { letterSpacing: 1.8 }), justifyContent: "space-between" }}>
                <span style={{ color: RED_INK }}>{strings.nextMoveLabel}</span>
                {strings.bottleneckLabel ? <span style={{ color: INK }}>{strings.bottleneckLabel}</span> : null}
              </div>
              <div
                style={{
                  display: "flex",
                  fontFamily: "Inter",
                  fontWeight: 600,
                  fontSize: 27,
                  lineHeight: 1.25,
                  letterSpacing: -0.3,
                  marginTop: 12,
                  color: INK,
                }}
              >
                {nextMove}
              </div>
            </div>

            {/* The stage profile: the same geometry as the page's
                (`lib/viz/stage-profile.ts`), at this frame's pixels. The
                labels are HTML over the SVG, as on the page. */}
            <div style={{ display: "flex", position: "relative", width: PROFILE_W, height: PROFILE_H, marginTop: 6 }}>
              <svg
                width={PROFILE_W}
                height={PROFILE_H}
                viewBox={`0 0 ${PROFILE_W} ${PROFILE_H}`}
                style={{ position: "absolute", left: 0, top: 0 }}
              >
                <path d={profile.area} fill={STONE_2} />
                {profile.columns.map((c) => (c.hot ? <path key={`a${c.x0}`} d={c.area} fill={RED_SOFT} /> : null))}
                <path d={profile.ridge} fill="none" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
                {profile.columns.map((c) =>
                  c.hot ? (
                    <path
                      key={`r${c.x0}`}
                      d={c.ridge}
                      fill="none"
                      stroke={RED}
                      strokeWidth={4.5}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  ) : null,
                )}
                <path d={`M0 ${PROFILE_BOX.base}H${PROFILE_W}`} stroke={INK} strokeWidth={3} />
                {profile.columns.slice(1).map((c) => (
                  <path key={`t${c.x0}`} d={`M${c.x0} ${PROFILE_BOX.base}V${PROFILE_BOX.base + 6}`} stroke={INK} strokeWidth={2} />
                ))}
                {profile.columns.map((c) =>
                  c.hot ? (
                    <path key={`s${c.x0}`} d={`M${c.peakX} ${c.peakY - 4}V${c.peakY - 20}`} stroke={RED_ACTION} strokeWidth={2.5} />
                  ) : null,
                )}
              </svg>
              {profile.columns.map((c) =>
                c.hot ? (
                  <div
                    key={`f${c.x0}`}
                    style={{
                      ...mono(15, { letterSpacing: 1.2, color: PAINT_WHITE }),
                      position: "absolute",
                      left: c.peakX - 28,
                      top: c.peakY - 46,
                      width: 56,
                      height: 26,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 13,
                      background: RED_ACTION,
                    }}
                  >
                    {strings.profileFlag}
                  </div>
                ) : null,
              )}
              {profile.columns.map((c, i) => (
                <div
                  key={`l${c.x0}`}
                  style={{
                    ...mono(13, { letterSpacing: 1, color: c.hot ? RED_INK : INK_SOFT }),
                    position: "absolute",
                    left: c.x0,
                    width: c.x1 - c.x0,
                    top: PROFILE_BOX.base + 10,
                    justifyContent: "center",
                  }}
                >
                  {strings.profileLabels[i]}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* bottom row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Inter", fontWeight: 600, fontSize: 27, maxWidth: 760, lineHeight: 1.25 }}>
            <span style={{ color: INK }}>{strings.stall}</span>
            <span style={{ color: INK_SOFT }}>{strings.whereDoesYours}</span>
          </div>
          <div
            style={{
              ...mono(19, { textTransform: "none", color: PAINT_WHITE }),
              padding: "13px 20px",
              background: RED_ACTION,
              border: `2px solid ${INK}`,
              borderRadius: 12,
              boxShadow: `4px 4px 0 ${INK}`,
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
