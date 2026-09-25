import { Sparkline } from "tour-de-growth";

/*
 * One series over time, drawn by hand — no chart library. Ink line, one end
 * marker, the last value written next to it. The scale is the caller's and is
 * never fitted to the data, so a small change cannot pass for a cliff.
 *
 * The year is the retention level's (content/game/retention.ts): monthly
 * churn from 6.0% in January, a board target of 4% by December.
 */

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const YEAR = [6.0, 5.9, 5.7, 5.5, 5.3, 5.2, 4.9, 4.7, 4.5, 4.2, 4.1, 4.1];
const pct = (v: number) => `${v.toFixed(1)}%`;
const box = { maxWidth: 520 } as const;

/** The full year, with the objective as a labelled dashed red line — the red dash never speaks alone. */
export const WithReference = () => (
  <div style={box}>
    <Sparkline
      values={YEAR}
      min={3}
      max={7}
      ticks={[3, 4, 5, 6, 7]}
      formatTick={(v) => `${v}%`}
      reference={{ value: 4, label: "target 4%" }}
      xLabels={MONTHS}
      endLabel="4.1%"
      ariaLabel="Churn: from 6.0% in January to 4.1% in December, just above the 4% target"
    />
  </div>
);

/**
 * `null` is a month not played yet: a gap in the line, never a zero. Mid-year,
 * the line stops at June and the end label states June's value.
 */
export const NotYetPlayed = () => (
  <div style={box}>
    <Sparkline
      values={[...YEAR.slice(0, 6), null, null, null, null, null, null]}
      min={3}
      max={7}
      ticks={[3, 4, 5, 6, 7]}
      formatTick={(v) => `${v} %`}
      reference={{ value: 4, label: "objectif 4 %" }}
      xLabels={MONTHS}
      endLabel="5,2 %"
      ariaLabel="Résiliations : de 6,0 % en janvier à 5,2 % en juin, l'objectif de décembre est 4 %"
    />
  </div>
);

/**
 * A value past the scale sits on the edge and the end marker turns hollow;
 * the end label still states the real value. Here trust collapses below the
 * floor of a scale that was chosen before anyone knew it would.
 */
export const OutOfRange = () => (
  <div style={box}>
    <Sparkline
      values={[70, 66, 61, 55, 49, 44, 38, 33, 28, 24, 21, 18]}
      min={20}
      max={80}
      ticks={[20, 35, 50, 65, 80]}
      reference={{ value: 35, label: "viral thread" }}
      xLabels={MONTHS}
      endLabel="18"
      ariaLabel="Subscriber trust: from 70 in January to 18 in December, under the viral-thread threshold of 35 since August"
    />
  </div>
);

/** `sm` is 64px tall, inline next to a figure — no ticks, no month initials, just the shape and the last value. */
export const Small = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, maxWidth: 360 }}>
    <span style={{ font: "var(--meta-sm)", textTransform: "uppercase" }}>Churn</span>
    <div style={{ flex: 1 }}>
      <Sparkline
        size="sm"
        values={YEAR}
        min={3}
        max={7}
        endLabel={pct(4.1)}
        ariaLabel="Churn: from 6.0% in January to 4.1% in December"
      />
    </div>
  </div>
);
