// The growth engine's share image, 1200 × 630 — design brief 06.
//
// Written for Satori (next/og): every element is display:flex, placed by flex
// or by absolute position; every measure is in px; every colour is a token
// NAME resolved by c() (tokens.og.mjs) — the port writes the literal. No grid,
// no custom property, no filter.
//
// `h` is passed in, so the same tree renders through Satori (any
// `(type, props, ...children) => ({ type, props })`), React's createElement in
// the port, or the preview's DOM renderer.
import { c, OG_DERIVED } from "./tokens.og.mjs";
import { OG_STRINGS } from "./strings.og.mjs";
import { Stopwatch, StopwatchPicto } from "./Stopwatch.og.mjs";

export const OG_SIZE = { width: 1200, height: 630 };

const FONT = {
  display: "Stardos Stencil", // 700
  ui: "Inter",                // 500, 600
  mono: "IBM Plex Mono",      // 500, 600
};

export const engineShareImage = (h, locale) => {
  const t = OG_STRINGS[locale];
  const ultramarine = c("--space-ultramarine");

  const flex = (style, ...children) => h("div", { style: { display: "flex", ...style } }, ...children);

  // ── The frame shared by every share image (src/lib/og/): the border, the
  // ground and its lift, the wordmark, the road line, the domain badge. ───
  // The word space is a gap: Satori drops a trailing space inside a span.
  const wordmark = flex(
    { gap: 10, fontFamily: FONT.display, fontWeight: 700, fontSize: 34, letterSpacing: 0.68, lineHeight: 1, color: c("--ink-0") },
    h("span", null, t.wordmark[0]),
    h("span", { style: { color: c("--paint-red") } }, t.wordmark[1]),
  );

  // Q4: the space pill, as the result's « 1/3 · FLAT » — here ultramarine,
  // with the band's own pictogram, in capitals.
  const spacePill = flex(
    {
      alignItems: "center",
      gap: 10,
      height: 40,
      padding: "0 18px 0 14px",
      borderRadius: 999,
      backgroundColor: ultramarine,
      color: c("--paper-0"),
      fontFamily: FONT.mono,
      fontWeight: 600,
      fontSize: 16,
      letterSpacing: 1.3,
      textTransform: "uppercase",
    },
    StopwatchPicto(h, c("--paper-0"), 30),
    h("span", null, t.space),
  );

  const domainBadge = flex(
    {
      alignItems: "center",
      height: 48,
      padding: "0 18px",
      borderRadius: 6,
      backgroundColor: c("--paint-red-action"),
      color: c("--paper-0"),
      fontFamily: FONT.mono,
      fontWeight: 500,
      fontSize: 20,
    },
    t.domain,
  );

  const header = flex(
    { position: "absolute", left: 58, right: 58, top: 42, height: 52, alignItems: "center", justifyContent: "space-between" },
    flex({ alignItems: "center", gap: 20 }, wordmark, spacePill),
    domainBadge,
  );

  const roadLine = flex({
    position: "absolute",
    left: 0,
    right: 0,
    top: 120,
    height: 0,
    borderTop: `6px dashed ${c("--paper-3")}`,
  });

  // ── The words: eyebrow, title, one line, the promise. ───────────────────
  const eyebrow = flex(
    {
      position: "absolute",
      left: 58,
      top: 160,
      fontFamily: FONT.mono,
      fontWeight: 600,
      fontSize: 20,
      letterSpacing: 2.4,
      textTransform: "uppercase",
      color: ultramarine,
    },
    t.eyebrow,
  );

  // The page's H1, on two set lines. The engine's own word (« moteur » /
  // "engine") is in ultramarine: the space's colour, at display size.
  const titleLine = (parts) =>
    flex(
      { whiteSpace: "pre" },
      ...parts.map((part) =>
        h("span", { style: { color: part === t.titleAccent ? ultramarine : c("--ink-0") } }, part),
      ),
    );
  const title = flex(
    {
      position: "absolute",
      left: 56,
      top: 196,
      flexDirection: "column",
      fontFamily: FONT.display,
      fontWeight: 700,
      fontSize: 104,
      lineHeight: 1,
      letterSpacing: 2.08,
    },
    ...t.title.map(titleLine),
  );

  const line = flex(
    {
      position: "absolute",
      left: 58,
      top: 430,
      width: 640,
      fontFamily: FONT.ui,
      fontWeight: 500,
      fontSize: 28,
      lineHeight: 1.36,
      color: c("--ink-1"),
    },
    t.line,
  );

  // The promise, as the landing's tag is set: mono, capitals. A short
  // ultramarine rule leads it — the band's rule, not an icon.
  const promise = flex(
    {
      position: "absolute",
      left: 58,
      bottom: 50,
      alignItems: "center",
      gap: 14,
      fontFamily: FONT.mono,
      fontWeight: 600,
      fontSize: 17,
      letterSpacing: 1.4,
      textTransform: "uppercase",
      color: ultramarine,
    },
    flex({ width: 32, height: 0, borderTop: `3px solid ${ultramarine}` }),
    t.promise,
  );

  // ── The one mark: the stopwatch (Q2). ──────────────────────────────────
  const watch = flex({ position: "absolute", right: 72, top: 172 }, Stopwatch(h, 300));

  return flex(
    {
      position: "relative",
      width: OG_SIZE.width,
      height: OG_SIZE.height,
      backgroundColor: c("--paper-1"),
      backgroundImage: OG_DERIVED.groundLift,
      border: `2px solid ${c("--ink-0")}`,
    },
    roadLine,
    header,
    eyebrow,
    title,
    line,
    promise,
    watch,
  );
};
