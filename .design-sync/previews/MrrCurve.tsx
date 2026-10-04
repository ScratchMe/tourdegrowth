import type { CSSProperties } from "react";
import { MrrCurve } from "tour-de-growth";

/*
 * The MRR month by month (design system extension 09, Q8): thirteen points,
 * today's pace and, once a what-if moved, the pace with it. Both lines ink,
 * never red; a range (an estimate upstream) is a hatched band.
 *
 * Every prop is the product's own. On the board: `leverMoneyView(...).curve`
 * (app/[locale]/aarrr-funnel-template/_engine/money-view.ts), passed the way
 * `BoardLever` passes it into the « Et si » card — no `width`, so the curve
 * measures its column. On the slides: the `curve` `buildDeck` (lib/engine/
 * deck.ts) writes into a what-if or the « together » slide, passed the way
 * `SlideCurveCard` does (`medium="slide"`, 650 wide). Run on the engine's
 * fixtures with the resolved copy; the points are rounded to the cent. The
 * board's cells sit on the page's paper and the slides' on their curve card,
 * the grounds the product draws them on: the start label's halo is painted
 * in `--surface-page`.
 */

/**
 * The « Et si » card on the board, untouched, in French: the film's SaaS (`filmState()`),
 * today's pace alone, from « 48 000 € aujourd'hui », the curve's one figure (the MRR in twelve
 * months, ~80 000 €, is printed by the card under the curve, as real text — not drawn here).
 * Measured at the card's 720px, so its key sits at the line's end. `whatif` is `null`, as the
 * card passes it before anything moves.
 */
export const TodayOnly = () => (
  <div style={{ background: "var(--surface-page)", padding: 16 }}>
    <div style={{ maxWidth: 720 }}>
      <MrrCurve
        id="curve-today"
        today={[
          [48000, 48000],
          [51504, 51504],
          [54832.8, 54832.8],
          [57995.16, 57995.16],
          [60999.4, 60999.4],
          [63853.43, 63853.43],
          [66564.76, 66564.76],
          [69140.52, 69140.52],
          [71587.5, 71587.5],
          [73912.12, 73912.12],
          [76120.52, 76120.52],
          [78218.49, 78218.49],
          [80211.57, 80211.57],
        ]}
        whatif={null}
        keys={{ today: "au rythme d'aujourd'hui", whatif: "avec tes « Et si »" }}
        start={"48 000 € aujourd'hui"}
        xLabels={["août 2026", "février 2027", "août 2027"]}
        summary={"Le MRR mois par mois, de 48 000 € aujourd'hui à ~80 000 € dans 12 mois au rythme actuel."}
      />
    </div>
  </div>
);

/**
 * The same card, in English, with the film's three what-ifs moved (`FILM_LEVERS`: churn 6 →
 * 4 %, expansion 2 → 3 %, activation 18 → 24 %): « with your what-ifs » in the full ink, 3px,
 * over « at today's pace » in the axis ink, 2px, and the room between them washed — what the
 * what-ifs add. Both are projections, so neither is dashed; no figure but today's is printed
 * on the curve.
 */
export const WhatIfsMoved = () => (
  <div style={{ background: "var(--surface-page)", padding: 16 }}>
    <div style={{ maxWidth: 720 }}>
      <MrrCurve
        id="curve-moved"
        today={[
          [48000, 48000],
          [51504, 51504],
          [54832.8, 54832.8],
          [57995.16, 57995.16],
          [60999.4, 60999.4],
          [63853.43, 63853.43],
          [66564.76, 66564.76],
          [69140.52, 69140.52],
          [71587.5, 71587.5],
          [73912.12, 73912.12],
          [76120.52, 76120.52],
          [78218.49, 78218.49],
          [80211.57, 80211.57],
        ]}
        whatif={[
          [48000, 48000],
          [54912, 54912],
          [61685.76, 61685.76],
          [68324.04, 68324.04],
          [74829.56, 74829.56],
          [81204.97, 81204.97],
          [87452.87, 87452.87],
          [93575.82, 93575.82],
          [99576.3, 99576.3],
          [105456.77, 105456.77],
          [111219.64, 111219.64],
          [116867.25, 116867.25],
          [122401.9, 122401.9],
        ]}
        keys={{ today: "at today's pace", whatif: "with your what-ifs" }}
        start={"€48,000 today"}
        xLabels={["August 2026", "February 2027", "August 2027"]}
        summary={"The MRR month by month, from €48,000 today: ~€80,000 in 12 months at today's pace, ~€120,000 with your what-ifs."}
      />
    </div>
  </div>
);

/**
 * The card of the sales-assisted engine (`salesAssistedState()`), in French, untouched: its
 * annual contracts come up for renewal evenly through the year, so its MRR runs in a straight
 * line (the card says so in a line of its own, not drawn here). Its projection is a range, so
 * the line is a band between its low and high paths, hatched, edged by both.
 */
export const SalesAssisted = () => (
  <div style={{ background: "var(--surface-page)", padding: 16 }}>
    <div style={{ maxWidth: 720 }}>
      <MrrCurve
        id="curve-slg"
        today={[
          [180000, 180000],
          [192600, 193200],
          [205200, 206400],
          [217800, 219600],
          [230400, 232800],
          [243000, 246000],
          [255600, 259200],
          [268200, 272400],
          [280800, 285600],
          [293400, 298800],
          [306000, 312000],
          [318600, 325200],
          [331200, 338400],
        ]}
        whatif={null}
        keys={{ today: "au rythme d'aujourd'hui", whatif: "avec tes « Et si »" }}
        start={"180 000 € aujourd'hui"}
        xLabels={["août 2026", "février 2027", "août 2027"]}
        summary={"Le MRR mois par mois, de 180 000 € aujourd'hui à ~330 000 € à 340 000 € dans 12 mois au rythme actuel."}
      />
    </div>
  </div>
);

/**
 * The card on a 390px phone, in French, the film's three what-ifs moved: measured at the 350px
 * its 20px gutters leave — under `compactBelow` (520px) — the curve lays its two keys under
 * the plot, as a legend, each with its line.
 */
export const Phone = () => (
  <div style={{ background: "var(--surface-page)", padding: "16px 20px", width: 390, boxSizing: "border-box" }}>
    <MrrCurve
      id="curve-phone"
      today={[
        [48000, 48000],
        [51504, 51504],
        [54832.8, 54832.8],
        [57995.16, 57995.16],
        [60999.4, 60999.4],
        [63853.43, 63853.43],
        [66564.76, 66564.76],
        [69140.52, 69140.52],
        [71587.5, 71587.5],
        [73912.12, 73912.12],
        [76120.52, 76120.52],
        [78218.49, 78218.49],
        [80211.57, 80211.57],
      ]}
      whatif={[
        [48000, 48000],
        [54912, 54912],
        [61685.76, 61685.76],
        [68324.04, 68324.04],
        [74829.56, 74829.56],
        [81204.97, 81204.97],
        [87452.87, 87452.87],
        [93575.82, 93575.82],
        [99576.3, 99576.3],
        [105456.77, 105456.77],
        [111219.64, 111219.64],
        [116867.25, 116867.25],
        [122401.9, 122401.9],
      ]}
      keys={{ today: "au rythme d'aujourd'hui", whatif: "avec tes « Et si »" }}
      start={"48 000 € aujourd'hui"}
      xLabels={["août 2026", "février 2027", "août 2027"]}
      summary={"Le MRR mois par mois, depuis 48 000 € aujourd'hui : ~80 000 € dans 12 mois au rythme actuel, ~120 000 € avec tes « Et si »."}
    />
  </div>
);

/** The deck's curve card (`.curveCard`): its ground, its padding, and its halo (A21.4). */
const SLIDE_CARD = {
  background: "var(--surface-card)",
  padding: "14px 24px",
  width: 698,
  boxSizing: "border-box",
  "--chart-halo": "var(--surface-card)",
} as CSSProperties;

/**
 * A what-if slide (`SlideWhatIf`), in English: the deck's `curve` for the churn lever alone (6
 * → 4 %, of `FILM_LEVERS`), « with this what-if » against today's pace. `medium="slide"`, 650
 * × 250 — tall, because churn leaves the month's funnel as it is: the deck's type (18px and
 * up), the keys in a legend under the plot. Shown at its real size on the curve card's ground
 * (`--surface-card`), whose padding the cell keeps. The card also sets `--chart-halo` to its
 * own ground, as the deck's curve card does (A21.4): the start label's halo is invisible.
 */
export const OnASlide = () => (
  <div style={SLIDE_CARD}>
    <MrrCurve
      medium="slide"
      width={650}
      height={250}
      id="curve-slide"
      today={[
        [48000, 48000],
        [51504, 51504],
        [54832.8, 54832.8],
        [57995.16, 57995.16],
        [60999.4, 60999.4],
        [63853.43, 63853.43],
        [66564.76, 66564.76],
        [69140.52, 69140.52],
        [71587.5, 71587.5],
        [73912.12, 73912.12],
        [76120.52, 76120.52],
        [78218.49, 78218.49],
        [80211.57, 80211.57],
      ]}
      whatif={[
        [48000, 48000],
        [52464, 52464],
        [56794.08, 56794.08],
        [60994.26, 60994.26],
        [65068.43, 65068.43],
        [69020.38, 69020.38],
        [72853.77, 72853.77],
        [76572.15, 76572.15],
        [80178.99, 80178.99],
        [83677.62, 83677.62],
        [87071.29, 87071.29],
        [90363.15, 90363.15],
        [93556.26, 93556.26],
      ]}
      keys={{ today: "at today's pace", whatif: "with this what-if" }}
      start={"€48,000 today"}
      xLabels={["August 2026", "February 2027", "August 2027"]}
      summary={"The MRR month by month, from €48,000 today: ~€80,000 in 12 months at today's pace, ~€94,000 with this what-if."}
    />
  </div>
);

/**
 * The « together » slide (`SlideScenario`, three levers, under four), in French: the curve
 * with all three what-ifs, « avec les 3 « Et si » », at the lower height the slide gives it
 * above the drawn levers (650 × 135), on the curve card's ground.
 */
export const OnTheScenarioSlide = () => (
  <div style={SLIDE_CARD}>
    <MrrCurve
      medium="slide"
      width={650}
      height={135}
      id="curve-scenario"
      today={[
        [48000, 48000],
        [51504, 51504],
        [54832.8, 54832.8],
        [57995.16, 57995.16],
        [60999.4, 60999.4],
        [63853.43, 63853.43],
        [66564.76, 66564.76],
        [69140.52, 69140.52],
        [71587.5, 71587.5],
        [73912.12, 73912.12],
        [76120.52, 76120.52],
        [78218.49, 78218.49],
        [80211.57, 80211.57],
      ]}
      whatif={[
        [48000, 48000],
        [54912, 54912],
        [61685.76, 61685.76],
        [68324.04, 68324.04],
        [74829.56, 74829.56],
        [81204.97, 81204.97],
        [87452.87, 87452.87],
        [93575.82, 93575.82],
        [99576.3, 99576.3],
        [105456.77, 105456.77],
        [111219.64, 111219.64],
        [116867.25, 116867.25],
        [122401.9, 122401.9],
      ]}
      keys={{ today: "au rythme d'aujourd'hui", whatif: "avec les 3 « Et si »" }}
      start={"48 000 € aujourd'hui"}
      xLabels={["août 2026", "février 2027", "août 2027"]}
      summary={"Le MRR mois par mois, depuis 48 000 € aujourd'hui : ~80 000 € dans 12 mois au rythme actuel, ~120 000 € avec les 3 « Et si »."}
    />
  </div>
);
