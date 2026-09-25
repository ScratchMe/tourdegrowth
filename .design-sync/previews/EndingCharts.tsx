import { EndingCharts } from "tour-de-growth";

/*
 * December's two curves, on paper: churn per month and subscriber trust —
 * one series each, never a double axis; side by side on a desktop, stacked on
 * a phone. Each sits in a ChartFrame with its data table behind "See the
 * data" (closed in these stills). The year is a slot per month-end: a year
 * cut short keeps its twelve slots and leaves the unlived months empty — a
 * gap, never a zero. Each curve ends on the same string as its December cell.
 */

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const CHURN_COPY = {
  title: "Churn per month",
  caption: "The dotted line is the December target.",
  ariaLabel: "Monthly churn over the year",
  reference: "target 4.0%",
  ticks: ["3%", "5%", "7%", "9%"],
};
const TRUST_COPY = {
  title: "Subscriber trust, the counter nobody displayed",
  caption: "From 0 to 100. At 35 or below, people leave and tell everyone why.",
  ariaLabel: "Subscriber trust over the year",
  reference: "viral thread",
  ticks: ["25", "50", "75", "100"],
};

const DATA_LABELS = { toggle: "See the data", month: "Month", churn: "Churn", trust: "Trust" };

const box = { padding: 24, maxWidth: 900 } as const;

/** A dark year played to December: churn met the target, trust fell through the viral line. */
export const DarkYear = () => {
  const churn = [6.0, 5.8, 5.5, 5.2, 4.9, 4.6, 4.4, 4.3, 4.5, 5.2, 4.8, 4.4, 4.1];
  const trust = [60, 58, 55, 50, 46, 42, 38, 34, 30, 26, 22, 20, 18];
  const months = churn.map((_, i) => i);
  return (
    <div style={box}>
      <EndingCharts
        view={{
          churn: { values: churn, months, scale: { min: 2, max: 9, ticks: [3, 5, 7, 9] }, reference: 4.0, end: 0.041 },
          trust: { values: trust, months, scale: { min: 0, max: 100, ticks: [25, 50, 75, 100] }, reference: 35, end: 18 },
        }}
        figures={{ churn: "4.1%", trust: "18 / 100" }}
        churn={CHURN_COPY}
        trust={TRUST_COPY}
        monthInitials={MONTHS}
        data={{
          ...DATA_LABELS,
          rows: MONTH_NAMES.map((month, i) => ({
            id: `m${i + 1}`,
            month,
            churn: `${churn[i + 1]?.toFixed(1)}%`,
            trust: String(trust[i + 1]),
          })),
        }}
      />
    </div>
  );
};

/** A year cut short in June (fired): both lines stop, the rest of the year stays empty. */
export const CutShortInJune = () => {
  const churn = [6.0, 5.9, 5.8, 5.7, 5.6, 5.5, 5.4];
  const trust = [60, 62, 64, 66, 67, 68, 69];
  const months = churn.map((_, i) => i);
  return (
    <div style={box}>
      <EndingCharts
        view={{
          churn: { values: churn, months, scale: { min: 2, max: 9, ticks: [3, 5, 7, 9] }, reference: 4.0, end: 0.054 },
          trust: { values: trust, months, scale: { min: 0, max: 100, ticks: [25, 50, 75, 100] }, reference: 35, end: 69 },
        }}
        figures={{ churn: "5.4%", trust: "69 / 100" }}
        churn={CHURN_COPY}
        trust={TRUST_COPY}
        monthInitials={MONTHS}
        data={{
          ...DATA_LABELS,
          rows: MONTH_NAMES.slice(0, 6).map((month, i) => ({
            id: `m${i + 1}`,
            month,
            churn: `${churn[i + 1]?.toFixed(1)}%`,
            trust: String(trust[i + 1]),
          })),
        }}
      />
    </div>
  );
};
