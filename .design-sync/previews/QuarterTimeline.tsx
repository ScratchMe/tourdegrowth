import { NightSurface, QuarterTimeline } from "tour-de-growth";

/*
 * The year at a glance: four quarters and December. The system's solid /
 * dashed grammar, moved to the night — a played quarter is solid, the
 * current one takes the night's selection colour, what is still to come is
 * dashed. A played quarter prints the churn it ended on and a WORD (hit /
 * missed); the colour only repeats it.
 */

const box = { padding: 24, maxWidth: 760 } as const;

/** Mid-year: two quarters played (one missed, one hit), the third current. */
export const MidYear = () => (
  <NightSurface as="div" style={box}>
    <QuarterTimeline
      label="Your year, quarter by quarter"
      segments={[
        { key: "q1", title: "Q1", range: "Jan–Mar", status: "done", result: { value: "5.7%", word: "missed", hit: false } },
        { key: "q2", title: "Q2", range: "Apr–Jun", status: "done", result: { value: "5.0%", word: "hit", hit: true } },
        { key: "q3", title: "Q3", range: "Jul–Sep", status: "current" },
        { key: "q4", title: "Q4", range: "Oct–Dec", status: "upcoming" },
        { key: "december", title: "December", status: "upcoming" },
      ]}
    />
  </NightSurface>
);

/** The year played out, in French — December is the current segment. */
export const YearOverFrench = () => (
  <NightSurface as="div" style={box}>
    <QuarterTimeline
      label="Ton année, trimestre par trimestre"
      segments={[
        { key: "q1", title: "T1", range: "janv.–mars", status: "done", result: { value: "5,7 %", word: "manqué", hit: false } },
        { key: "q2", title: "T2", range: "avr.–juin", status: "done", result: { value: "5,0 %", word: "atteint", hit: true } },
        { key: "q3", title: "T3", range: "juil.–sept.", status: "done", result: { value: "4,4 %", word: "atteint", hit: true } },
        { key: "q4", title: "T4", range: "oct.–déc.", status: "done", result: { value: "4,3 %", word: "manqué", hit: false } },
        { key: "december", title: "Décembre", status: "current" },
      ]}
    />
  </NightSurface>
);
