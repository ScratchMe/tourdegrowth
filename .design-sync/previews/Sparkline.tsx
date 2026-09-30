import { Sparkline } from "tour-de-growth";

/*
 * One series over time, drawn by hand — no chart library. Ink line, one end
 * marker, the last value written next to it. The scale is the caller's and is
 * never fitted to the data, so a small change cannot pass for a cliff.
 *
 * The years are the game's own: reference paths of
 * `lib/game/__tests__/paths.ts` played through the reducer, drawn the way
 * December's `EndingCharts` draws them — a slot for 1 January, then one per
 * month under its initial, the 2–9 % churn scale, the board's 4 % target —
 * with the tick labels, end label and text equivalent `decemberContent`
 * writes for that year.
 */

const MONTHS = ["", "J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
/** Path « clean miss »: churn from 6.0 % on 1 January to 4.2 % in December, just above the target. */
const CLEAN_MISS = [6, 6, 6, 6, 5.74, 5.74, 5.622, 4.997, 4.997, 4.997, 4.154, 4.154, 4.154];
const box = { maxWidth: 520 } as const;

/** The full year, with the board's target as a labelled dashed red line — the red dash never speaks alone. */
export const WithReference = () => (
  <div style={box}>
    <Sparkline
      values={CLEAN_MISS}
      min={2}
      max={9}
      ticks={[3, 5, 7, 9]}
      formatTick={(v) => `${v}%`}
      reference={{ value: 4, label: "target 4.0%" }}
      xLabels={MONTHS}
      endLabel="4.2%"
      ariaLabel="Monthly churn over the year: 6.0% on January 1st, 4.2% at the end of December; lowest 4.2%, highest 6.0%."
    />
  </div>
);

/**
 * `null` is a month never played: a gap in the line, never a zero. Path D,
 * in French: fired at the end of June, so the year stops there and the end
 * label states June's value.
 */
export const NotYetPlayed = () => (
  <div style={box}>
    <Sparkline
      values={[6, 6.06, 6.06, 6.06, 6.158, 6.158, 6.158, null, null, null, null, null, null]}
      min={2}
      max={9}
      ticks={[3, 5, 7, 9]}
      formatTick={(v) => `${v} %`}
      reference={{ value: 4, label: "objectif 4,0 %" }}
      xLabels={MONTHS}
      endLabel="6,2 %"
      ariaLabel="Résiliations mensuelles sur l'année : 6,0 % le 1er janvier, 6,2 % fin juin ; au plus bas 6,0 %, au plus haut 6,2 %."
    />
  </div>
);

/**
 * A value past the scale sits on the edge and the end marker turns hollow;
 * the end label still states the real value. Path C — every order obeyed,
 * an inspection, then a viral thread — takes churn to 10.1 % in October and
 * ends at 9.1 %, drawn here on the prototype's fixed 2–9 % scale. That is
 * the case that made the game stretch its own scale (`chartScale` in
 * lib/game/view.ts now takes this year to 11 %).
 */
export const OutOfRange = () => (
  <div style={box}>
    <Sparkline
      values={[6, 4.98, 4.98, 5.286, 4.631, 4.631, 5.013, 5.977, 5.477, 5.04, 10.066, 9.566, 9.066]}
      min={2}
      max={9}
      ticks={[3, 5, 7, 9]}
      formatTick={(v) => `${v}%`}
      reference={{ value: 4, label: "target 4.0%" }}
      xLabels={MONTHS}
      endLabel="9.1%"
      ariaLabel="Monthly churn over the year: 6.0% on January 1st, 9.1% at the end of December; lowest 4.6%, highest 10.1%."
    />
  </div>
);

/** `sm` is 64px tall, inline next to a figure — no ticks, no month initials, just the shape and the last value. The clean-miss year again. */
export const Small = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, maxWidth: 360 }}>
    <span style={{ font: "var(--meta-sm)", textTransform: "uppercase" }}>Churn</span>
    <div style={{ flex: 1 }}>
      <Sparkline
        size="sm"
        values={CLEAN_MISS}
        min={2}
        max={9}
        endLabel="4.2%"
        ariaLabel="Monthly churn over the year: 6.0% on January 1st, 4.2% at the end of December; lowest 4.2%, highest 6.0%."
      />
    </div>
  </div>
);
