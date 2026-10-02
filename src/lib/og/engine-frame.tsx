import { ImageResponse } from "next/og";
import { STOPWATCH, STOPWATCH_STROKES, STOPWATCH_WEDGE_SHARE } from "@/components/brand/stopwatch-geometry";
import type { EngineShareText } from "@/lib/og/engine-share-text";
import type { OgFonts } from "@/lib/og/fonts";
import { OgPicto } from "@/lib/og/picto";
import {
  OG_INK as INK,
  OG_INK_SOFT as INK_SOFT,
  OG_PAINT_WHITE as PAPER,
  OG_RED as RED,
  OG_RED_ACTION as RED_ACTION,
  OG_SIZE,
  OG_STONE as STONE,
  OG_STONE_3 as STONE_3,
  OG_ULTRAMARINE as ULTRAMARINE,
} from "@/lib/og/tokens";

/**
 * The growth engine's share image — design brief 06, ported from Claude
 * Design's return (`design/ds-extension-06-return/og/`), one per language.
 *
 * Paper with its lift, the frame every share image shares (2px ink border,
 * the wordmark, the dashed road line, the domain badge), and the engine's
 * ultramarine in three places: the space's pill beside the wordmark, the
 * engine's own word in the title, and the stopwatch on the right. No figure
 * of anyone's, and no peloton: in a feed the example's numbers would read as
 * the sharer's (the return's answer 2).
 *
 * Every measure is the return's. Two things are not its drawing but the
 * product's own, on purpose (`JOURNAL.md`, T6.2): the stopwatch is the page's
 * (`stopwatch-geometry.ts`, the shapes `brand/Stopwatch` paints) and the
 * pill's pictogram is the band's (`space-pictos.ts`) — the return redrew both
 * by hand, and a redraw is a second emblem the day either one moves.
 *
 * Feed-size rule (checked downscaled to 320px wide): the title, the wordmark
 * and the stopwatch are what must read; the line and the promise go quiet.
 * Every string drawn comes from `engine-share-text.ts`, which `fonts.test.ts`
 * also reads: adding text to this image means adding it there.
 */

/**
 * The page's ground lift (`--ground-lift`, shape.css) as Satori can draw it:
 * a circle rather than the CSS's ellipse, and an explicit transparent white,
 * because Satori blends `transparent` through black and greys the lift.
 */
const GROUND_LIFT = "radial-gradient(circle at 12% -10%, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0) 60%)";

/** `--space-engine-accent` at a share, the `color-mix` of the stopwatch's wedge in CSS. */
function withAlpha(hex: string, share: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${share})`;
}

/** The page's stopwatch, painted with the literals its CSS resolves to on paper. */
function OgStopwatch({ width }: { width: number }) {
  const line = { stroke: INK, fill: "none", strokeLinecap: "round" as const };
  const button = { fill: ULTRAMARINE, stroke: INK, strokeWidth: STOPWATCH_STROKES.button };
  return (
    <svg width={width} height={Math.round((width * 310) / 300)} viewBox={STOPWATCH.viewBox}>
      <circle {...STOPWATCH.shadow} fill={INK} />
      <rect {...STOPWATCH.crown} {...button} />
      <rect {...STOPWATCH.stem} fill={INK} />
      <rect {...STOPWATCH.lap} {...button} />
      <circle {...STOPWATCH.face} fill={PAPER} stroke={INK} strokeWidth={STOPWATCH_STROKES.face} />
      <circle {...STOPWATCH.bezel} fill="none" stroke={ULTRAMARINE} strokeWidth={STOPWATCH_STROKES.bezel} />
      <path d={STOPWATCH.wedge} fill={withAlpha(ULTRAMARINE, STOPWATCH_WEDGE_SHARE)} />
      <path d={STOPWATCH.minor} {...line} strokeWidth={STOPWATCH_STROKES.minor} />
      <path d={STOPWATCH.major} {...line} strokeWidth={STOPWATCH_STROKES.major} />
      <path d={STOPWATCH.hand} {...line} strokeWidth={STOPWATCH_STROKES.hand} />
      <circle {...STOPWATCH.hub} {...button} />
    </svg>
  );
}

export function renderEngineShareImage(text: EngineShareText, fonts: OgFonts): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: OG_SIZE.width,
          height: OG_SIZE.height,
          backgroundColor: STONE,
          backgroundImage: GROUND_LIFT,
          border: `2px solid ${INK}`,
        }}
      >
        {/* the road line, under the header */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            left: 0,
            right: 0,
            top: 120,
            height: 0,
            borderTop: `6px dashed ${STONE_3}`,
          }}
        />

        {/* the header: the wordmark and the space's pill; the domain badge */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            left: 58,
            right: 58,
            top: 42,
            height: 52,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* The word space is a gap: Satori drops a trailing space inside a span. */}
            <div
              style={{
                display: "flex",
                gap: 10,
                fontFamily: "Stardos Stencil",
                fontWeight: 700,
                fontSize: 34,
                letterSpacing: 0.68,
                lineHeight: 1,
                color: INK,
              }}
            >
              <span>TOUR DE</span>
              <span style={{ color: RED }}>GROWTH</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                height: 40,
                padding: "0 18px 0 14px",
                borderRadius: 999,
                backgroundColor: ULTRAMARINE,
                color: PAPER,
                fontFamily: "IBM Plex Mono",
                fontWeight: 600,
                fontSize: 16,
                letterSpacing: 1.3,
              }}
            >
              <OgPicto space="engine" color={PAPER} width={30} height={19} />
              <span>{text.space}</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 48,
              padding: "0 18px",
              borderRadius: 6,
              backgroundColor: RED_ACTION,
              color: PAPER,
              fontFamily: "IBM Plex Mono",
              fontWeight: 500,
              fontSize: 20,
            }}
          >
            {text.domain}
          </div>
        </div>

        {/* the words: eyebrow, title, one line, the promise */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            left: 58,
            top: 160,
            fontFamily: "IBM Plex Mono",
            fontWeight: 600,
            fontSize: 20,
            letterSpacing: 2.4,
            color: ULTRAMARINE,
          }}
        >
          {text.eyebrow}
        </div>

        <div
          style={{
            position: "absolute",
            display: "flex",
            left: 56,
            top: 196,
            flexDirection: "column",
            fontFamily: "Stardos Stencil",
            fontWeight: 700,
            fontSize: 104,
            lineHeight: 1,
            letterSpacing: 2.08,
          }}
        >
          {text.title.map((line, index) => (
            // `pre`, so the space closing a run is drawn: the runs of a line are its words.
            <div key={index} style={{ display: "flex", whiteSpace: "pre" }}>
              {line.map((segment, at) => (
                <span key={at} style={{ color: segment.accent ? ULTRAMARINE : INK }}>
                  {at < line.length - 1 ? `${segment.text} ` : segment.text}
                </span>
              ))}
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            display: "flex",
            left: 58,
            top: 430,
            width: 640,
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: 28,
            lineHeight: 1.36,
            color: INK_SOFT,
          }}
        >
          {text.line}
        </div>

        {/* The promise, set as the landing's tag is: mono capitals, led by the band's short rule. */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            left: 58,
            bottom: 50,
            alignItems: "center",
            gap: 14,
            fontFamily: "IBM Plex Mono",
            fontWeight: 600,
            fontSize: 17,
            letterSpacing: 1.4,
            color: ULTRAMARINE,
          }}
        >
          <div style={{ display: "flex", width: 32, height: 0, borderTop: `3px solid ${ULTRAMARINE}` }} />
          {text.promise}
        </div>

        {/* the one mark: the stopwatch */}
        <div style={{ position: "absolute", display: "flex", right: 72, top: 172 }}>
          <OgStopwatch width={300} />
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
