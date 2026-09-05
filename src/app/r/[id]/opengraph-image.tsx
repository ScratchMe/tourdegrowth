import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "next/og";
import { tc } from "@/lib/i18n/dictionary";
import { UI_STRINGS } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import type { Pillar } from "@/lib/scoring/pillars";
import { getCachedSubmissionById } from "@/lib/submissions/cached-repository";
import { SAMPLE_RESULT } from "@/lib/submissions/sample";
import { SITE_DOMAIN_LABEL } from "@/lib/site";

// DESIGN-BRIEF.md §03 — "highest care". Exact 1200x630 frame, Stardos
// Stencil embedded (never a system fallback — the stencil numeral IS the
// image). This is a Satori render, a separate pipeline from the rest of
// the app's CSS: every value below is a literal copy of a design token,
// not a shared variable, and must be kept in sync by hand if a token
// changes (see globals.css for the source of truth).

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Tour de Growth — AARRR growth check-up result";

const INK = "#211c15";
const INK_SOFT = "#5b5346";
const STONE = "#e7e1d2";
const STONE_2 = "#ded6c2";
const RED = "#d2402c";
const RED_INK = "#a32e1f";
const RED_SOFT = "#f3d9d2";
const PAINT_WHITE = "#fbf9f2";

async function loadFonts() {
  // `fetch(new URL(...))` is the pattern Next.js docs show for this, but
  // plain Node.js `fetch` doesn't support `file://` URLs ("not implemented
  // yet") — reading the bytes directly with `fs` works in every runtime
  // this route actually runs in (Node.js, not Edge).
  //
  // Files are .ttf, not the .woff2 Google Fonts actually serves — Satori's
  // font parser rejects woff2 ("Unsupported OpenType signature wOF2").
  // Converted once with `wawoff2` and committed as static assets (see
  // CLAUDE.md) rather than re-fetching+converting on every request.
  const load = (file: string) => readFile(fileURLToPath(new URL(`./fonts/${file}`, import.meta.url)));
  const [stardos, interLatin, mono500, mono600] = await Promise.all([
    load("stardos-stencil-700.ttf"),
    load("inter-latin.ttf"),
    load("ibm-plex-mono-500.ttf"),
    load("ibm-plex-mono-600.ttf"),
  ]);
  return [
    { name: "Stardos Stencil", data: stardos, weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: interLatin, weight: 600 as const, style: "normal" as const },
    { name: "Inter", data: interLatin, weight: 500 as const, style: "normal" as const },
    { name: "IBM Plex Mono", data: mono500, weight: 500 as const, style: "normal" as const },
    { name: "IBM Plex Mono", data: mono600, weight: 600 as const, style: "normal" as const },
  ];
}

interface OgData {
  total: number;
  pillars: { pillar: Pillar; score: number }[];
  weakestPillar: Pillar;
  locale: Locale;
  roast: boolean;
  /** SPEC-ADDENDUM-01.md §2.6 — swaps the checkup badge's text, no other gabarit change. */
  deepDive: boolean;
}

async function loadOgData(id: string): Promise<OgData | null> {
  if (id === "sample") {
    return {
      total: SAMPLE_RESULT.total,
      pillars: SAMPLE_RESULT.pillars,
      weakestPillar: SAMPLE_RESULT.weakestPillar,
      locale: "en",
      roast: false,
      deepDive: false, // SPEC.md §12: the sample is never enriched
    };
  }

  const submission = await getCachedSubmissionById(id);
  // REVIEW.md R-14: a dead link used to render a real-looking "0/100" frame,
  // so a mistyped or deleted result previewed as a genuine, terrible score.
  // `null` here becomes a 404 below — no image is better than a false one.
  if (!submission) return null;

  return {
    total: submission.total,
    pillars: submission.pillars,
    weakestPillar: submission.weakestPillar,
    locale: submission.locale,
    roast: submission.tone === "roast",
    deepDive: submission.deepDive !== null,
  };
}

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [data, fonts] = await Promise.all([loadOgData(id), loadFonts()]);
  if (!data) return new Response(null, { status: 404 });
  const { total, pillars, weakestPillar, locale, roast, deepDive } = data;
  const accent = roast ? RED : INK;

  const weakestLabel = tc(UI_STRINGS.pillars[weakestPillar], locale);
  const bottomSentence = tc(UI_STRINGS.og.stallSentenceTemplate, locale).replace("{pillar}", weakestLabel);

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
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <div style={{ display: "flex", fontFamily: "Stardos Stencil", fontSize: 268, lineHeight: 0.85, color: INK }}>
                {total}
              </div>
              <div style={{ display: "flex", fontFamily: "Stardos Stencil", fontSize: 76, color: INK_SOFT, marginLeft: 10 }}>
                /100
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 400,
              gap: 9,
              paddingBottom: 14,
            }}
          >
            {pillars.map((p) => {
              const weak = p.pillar === weakestPillar;
              const label = tc(UI_STRINGS.pillars[p.pillar], locale);
              return (
                <div
                  key={p.pillar}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: "IBM Plex Mono",
                    fontWeight: 500,
                    fontSize: 20,
                    color: weak ? RED_INK : INK_SOFT,
                    background: weak ? RED_SOFT : STONE_2,
                    border: weak ? `2px solid ${RED}` : `2px dashed ${INK_SOFT}`,
                    borderRadius: 4,
                    padding: "8px 16px",
                  }}
                >
                  <span>{label}</span>
                  <span style={{ fontWeight: 600 }}>{String(p.score).padStart(2, "0")}</span>
                </div>
              );
            })}
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
