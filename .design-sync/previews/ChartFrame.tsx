import { ChartFrame, NightSurface, Sparkline } from "tour-de-growth";

/*
 * The frame around every chart: a title that states the insight (never
 * "Monthly churn"), the chart, a legend only when there are two marks or
 * more, a quiet source line, and "See the data" — the same numbers as a
 * DataTable, which is the chart's text equivalent. Not a card: no border, no
 * shadow, so it sits on whatever surface the screen gives it.
 *
 * The year is the retention level's (content/game/retention.ts).
 */

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEAR = [6.0, 5.9, 5.7, 5.5, 5.3, 5.2, 4.9, 4.7, 4.5, 4.2, 4.1, 4.1];
const box = { maxWidth: 560 } as const;

const data = {
  label: "See the data",
  columns: [
    { key: "month", header: "Month" },
    { key: "churn", header: "Churn", numeric: true },
  ],
  rows: YEAR.map((v, i) => ({ id: String(i), cells: { month: NAMES[i] ?? "", churn: `${v.toFixed(1)}%` } })),
};

/** Ready: title sentence, unit, the chart, its legend, its source, and the data one click away. */
export const Ready = () => (
  <div style={box}>
    <ChartFrame
      id="churn-year"
      title="Churn fell all year and stopped just above target"
      subtitle="Monthly churn, January to December"
      unit="% of subscribers"
      source="Game numbers: a simple model written in code, not a study."
      legend={[
        { label: "Monthly churn", mark: "line" },
        { label: "December target", mark: "reference" },
      ]}
      data={data}
    >
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
    </ChartFrame>
  </div>
);

/**
 * Empty: the chart is replaced, the frame and its title are not — an empty
 * chart still says what it would have shown. No "See the data": there is none.
 */
export const Empty = () => (
  <div style={box}>
    <ChartFrame
      id="trust-empty"
      title="Confiance des abonnés, le compteur que personne n'affichait"
      unit="de 0 à 100"
      state={{ kind: "empty", message: "Rien à tracer avant la fin du premier trimestre : lance-le pour voir la courbe." }}
    />
  </div>
);

/** Error: our failure, said in words, with a retry when something can be retried. */
export const ErrorState = () => (
  <div style={box}>
    <ChartFrame
      id="churn-error"
      title="Churn per month"
      state={{
        kind: "error",
        message: "The year's figures could not be loaded, so there is nothing to draw.",
        retry: { label: "Try again", onRetry: () => {} },
      }}
    />
  </div>
);

/** The same frame at night: it reads the semantic tokens only, so nothing changes but the world. */
export const AtNight = () => (
  <NightSurface as="div" style={{ padding: 24 }}>
    <div style={box}>
      <ChartFrame id="churn-night" title="Churn fell under 5% in July" unit="% of subscribers" data={data}>
        <Sparkline
          values={[...YEAR.slice(0, 7), null, null, null, null, null]}
          min={3}
          max={7}
          ticks={[3, 5, 7]}
          formatTick={(v) => `${v}%`}
          reference={{ value: 4, label: "board target 4%" }}
          xLabels={MONTHS}
          endLabel="4.9%"
          ariaLabel="Churn: from 6.0% in January to 4.9% in July; the board target is 4%"
        />
      </ChartFrame>
    </div>
  </NightSurface>
);
