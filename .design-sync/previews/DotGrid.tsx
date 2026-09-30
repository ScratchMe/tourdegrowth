import { DotGrid, DotLegend, type DotMark } from "tour-de-growth";

/*
 * The funnel as counts: every grid is the same 100 sign-ups, so a column is a
 * count, never a length. Numbers are the growth engine's §6.0 example
 * (lib/engine/__tests__/fixtures.ts): 12 of the sign-ups came referred, 18
 * reach first value, nobody measures day-30 retention, 6 to 9 pay.
 */

const run = (...parts: [DotMark, number][]): DotMark[] => parts.flatMap(([mark, n]) => Array<DotMark>(n).fill(mark));
const row = { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 200px))", gap: 32, alignItems: "start" } as const;
const caption = { font: "var(--meta-xs)", color: "var(--text-muted)", margin: "8px 0 0" } as const;

/** The peloton: sign-ups with the referred ones ringed, the stalled stage in the one red, an unknown panel, an estimate. */
export const Peloton = () => (
  <div style={{ display: "grid", gap: 24 }}>
    <div style={row}>
      <figure style={{ margin: 0 }}>
        <DotGrid grid={{ kind: "known", dots: run(["referred", 12], ["filled", 88]) }} label="Sign-ups — 100, of which 12 referred" />
        <p style={caption}>Sign-ups · 12 referred</p>
      </figure>
      <figure style={{ margin: 0 }}>
        <DotGrid highlighted grid={{ kind: "known", dots: run(["filled", 18], ["empty", 82]) }} label="18 of the 100 sign-ups reach first value — below the reference, measured, Amplitude" />
        <p style={caption}>Activated · below the reference</p>
      </figure>
      <figure style={{ margin: 0 }}>
        <DotGrid grid={{ kind: "unknown", dots: [] }} label="Active at day 30 — not measured" />
        <p style={caption}>Active at day 30 · not measured</p>
      </figure>
      <figure style={{ margin: 0 }}>
        <DotGrid grid={{ kind: "known", dots: run(["filled", 6], ["range", 3], ["empty", 91]) }} label="6 to 9 of the 100 sign-ups pay, estimated" />
        <p style={caption}>Paying · 6 to 9, estimated</p>
      </figure>
    </div>
    <DotLegend
      aria-hidden
      items={[
        { mark: "referred", label: "came through a referral (12)" },
        { mark: "filled", label: "measured" },
        { mark: "range", label: "estimated range" },
        { mark: "unknown", label: "not measured" },
      ]}
    />
  </div>
);

/** « Et si »: what the what-ifs add grows the grid past 100, row by row; what they lose is struck through, never a gap. */
export const WhatIf = () => (
  <div style={{ display: "grid", gap: 24 }}>
    <div style={row}>
      <DotGrid grid={{ kind: "known", dots: run(["filled", 100], ["gained", 16], ["gainedRange", 4]) }} label="Sign-ups: 100 today, 116 to 120 with the what-ifs" />
      <DotGrid grid={{ kind: "known", dots: run(["filled", 18], ["gained", 6], ["empty", 76]) }} label="Activated: 18 today, 24 with the what-ifs" />
      <DotGrid grid={{ kind: "known", dots: run(["filled", 40], ["lost", 3], ["empty", 57]) }} label="Retained: 43 today, 40 with the what-ifs" />
    </div>
    <DotLegend
      items={[
        { mark: "filled", label: "there today" },
        { mark: "gained", label: "added by your what-ifs" },
        { mark: "lost", label: "lost to your what-ifs" },
        { mark: "range", label: "estimated range" },
      ]}
    />
  </div>
);

/** On a 1920px slide: 200px grids, the slide's heavier outline, 20px swatches in the slide's meta type. */
export const Slide = () => (
  <div style={{ display: "grid", gap: 24 }}>
    <div style={{ ...row, gridTemplateColumns: "repeat(2, 200px)" }}>
      <DotGrid medium="slide" highlighted grid={{ kind: "known", dots: run(["filled", 18], ["empty", 82]) }} label="18 of the 100 sign-ups reach first value" />
      <DotGrid medium="slide" grid={{ kind: "unknown", dots: [] }} label="Active at day 30 — not measured" />
    </div>
    <DotLegend
      aria-hidden
      medium="slide"
      items={[
        { mark: "filled", label: "measured" },
        { mark: "unknown", label: "not measured" },
      ]}
    />
  </div>
);
