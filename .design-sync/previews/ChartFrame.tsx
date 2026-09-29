import { ChartFrame, NightSurface, Sparkline } from "tour-de-growth";

/*
 * The frame around every chart: a title, the chart, a legend only when two
 * marks need one, a quiet source line, and "See the data" — the same numbers
 * as a DataTable, which is the chart's text equivalent. Not a card: no
 * border, no shadow, so it sits on whatever surface the screen gives it.
 *
 * The one frame the product draws today is December's churn chart in the
 * game (`EndingCharts`): its title, its caption as the subtitle, the curve,
 * and the table behind « See the data ». It carries no legend — the target is
 * labelled on its own line and the caption says what it is — and no unit, the
 * ticks carry the %. The year below is reference path « clean miss »
 * (lib/game/__tests__/paths.ts) played through the reducer, with the strings
 * `decemberContent` writes for it.
 *
 * Its title « Churn per month » is a label, where `ChartFrameProps.title`
 * asks for a sentence that states the insight ("Churn fell under target in
 * October"). The game departs from the rule there; a new chart should not.
 */

const MONTHS = ["", "J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const CHURN = [6, 6, 6, 6, 5.74, 5.74, 5.622, 4.997, 4.997, 4.997, 4.154, 4.154, 4.154];
const TABLE = [
  ["January", "6.0%"],
  ["February", "6.0%"],
  ["March", "6.0%"],
  ["April", "5.7%"],
  ["May", "5.7%"],
  ["June", "5.6%"],
  ["July", "5.0%"],
  ["August", "5.0%"],
  ["September", "5.0%"],
  ["October", "4.2%"],
  ["November", "4.2%"],
  ["December", "4.2%"],
] as const;
const box = { maxWidth: 560 } as const;

const data = {
  label: "See the data",
  columns: [
    { key: "month", header: "Month" },
    { key: "churn", header: "Churn", numeric: true },
  ],
  rows: TABLE.map(([month, churn], i) => ({ id: String(i + 1), cells: { month, churn } })),
  rowHeader: "month",
};

const churnChart = (id: string) => (
  <ChartFrame
    id={id}
    title="Churn per month"
    subtitle="The dotted line is the December target."
    source="Game numbers: a simple model written in code, not a study."
    data={data}
  >
    <Sparkline
      values={CHURN}
      min={2}
      max={9}
      ticks={[3, 5, 7, 9]}
      formatTick={(v) => `${v}%`}
      reference={{ value: 4, label: "target 4.0%" }}
      xLabels={MONTHS}
      endLabel="4.2%"
      ariaLabel="Monthly churn over the year: 6.0% on January 1st, 4.2% at the end of December; lowest 4.2%, highest 6.0%."
    />
  </ChartFrame>
);

/**
 * Ready: title, subtitle, the chart, a source line, and the data one click
 * away — the table is a closed disclosure, so only its summary shows here.
 * The source line is the game's own note (`december.gameNumbers`), which the
 * game prints once under its December figures rather than in this frame.
 */
export const Ready = () => <div style={box}>{churnChart("churn-year")}</div>;

/**
 * Empty: the chart is replaced, the frame and its title are not — an empty
 * chart still says what it would have shown. No "See the data": there is
 * none. The game never draws this state (its curves only appear once the
 * year is played), so the words are borrowed from it, in French: the trust
 * chart's title and caption, and the note its dashboard gives the hidden
 * trust tile.
 */
export const Empty = () => (
  <div style={box}>
    <ChartFrame
      id="trust-empty"
      title="Confiance des abonnés, le compteur que personne n'affichait"
      subtitle="De 0 à 100. À 35 ou moins, les gens partent en le racontant."
      state={{ kind: "empty", message: "Masquée jusqu'en décembre" }}
    />
  </div>
);

/**
 * Error: our failure, said in words, with a retry when something can be
 * retried. No screen shows this today (the game computes its year in the
 * browser); the message and the retry are the result page's error screen's
 * (`ERROR_SCREEN_STRINGS`).
 */
export const ErrorState = () => (
  <div style={box}>
    <ChartFrame
      id="churn-error"
      title="Churn per month"
      state={{
        kind: "error",
        message: "Something broke on our end — try again in a moment.",
        retry: { label: "Try again", onRetry: () => {} },
      }}
    />
  </div>
);

/** The same frame at night: it reads the semantic tokens only, so nothing changes but the world. */
export const AtNight = () => (
  <NightSurface as="div" style={{ padding: 24 }}>
    <div style={box}>{churnChart("churn-night")}</div>
  </NightSurface>
);
