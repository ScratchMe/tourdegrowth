import { EndingCharts } from "tour-de-growth";

/*
 * December's two curves, on paper: churn per month and subscriber trust —
 * one series each, never a double axis; side by side on a desktop, stacked on
 * a phone. Each sits in a ChartFrame with its data table behind "See the
 * data" (closed in these stills). The year is a slot per month-end: a year
 * cut short keeps its twelve slots and leaves the unlived months empty — a
 * gap, never a zero. Each curve ends on the same string as its December cell.
 *
 * Every prop is what the island builds (`decemberContent` in
 * game/retention/island-view.ts) from a reference year played to its end.
 */

const box = { padding: 24, maxWidth: 880 } as const;

/**
 * Reference year C, the dark one, played to December: churn dips under 5%,
 * then the Q3 inspection takes every trick down and it jumps past 10% before
 * ending at 9.1%, far above the dotted 4.0% target; trust falls through the
 * viral line at 35 and ends at 27. The churn scale grows to 11% to hold it.
 */
export const DarkYear = () => (
  <div style={box}>
    <EndingCharts
      view={{"churn": {"values": [6, 4.98, 4.98, 5.286, 4.63116, 4.63116, 5.01276, 5.977, 5.477, 5.04, 10.066, 9.566, 9.066], "months": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], "scale": {"min": 2, "max": 11, "ticks": [3, 5, 7, 9, 11]}, "reference": 4, "end": 0.09066}, "trust": {"values": [60, 51, 51, 51, 38, 38, 38, 25, 25, 25, 27, 27, 27], "months": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], "scale": {"min": 0, "max": 100, "ticks": [25, 50, 75, 100]}, "reference": 35, "end": 27}}}
      figures={{"churn": "9.1%", "trust": "27 / 100", "radar": "1 / 100"}}
      churn={{"title": "Churn per month", "caption": "The dotted line is the December target.", "ariaLabel": "Monthly churn over the year: 6.0% on January 1st, 9.1% at the end of December; lowest 4.6%, highest 10.1%.", "reference": "target 4.0%", "ticks": ["3%", "5%", "7%", "9%", "11%"]}}
      trust={{"title": "Subscriber trust, the counter nobody displayed", "caption": "From 0 to 100. At 35 or below, people leave and tell everyone why.", "ariaLabel": "Subscriber trust over the year: 60 on January 1st, 27 at the end of December; lowest 25, highest 60.", "reference": "viral thread", "ticks": ["25", "50", "75", "100"]}}
      monthInitials={["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]}
      data={{"toggle": "See the data", "month": "Month", "churn": "Churn", "trust": "Trust", "rows": [{"id": "1", "month": "January", "churn": "5.0%", "trust": "51"}, {"id": "2", "month": "February", "churn": "5.0%", "trust": "51"}, {"id": "3", "month": "March", "churn": "5.3%", "trust": "51"}, {"id": "4", "month": "April", "churn": "4.6%", "trust": "38"}, {"id": "5", "month": "May", "churn": "4.6%", "trust": "38"}, {"id": "6", "month": "June", "churn": "5.0%", "trust": "38"}, {"id": "7", "month": "July", "churn": "6.0%", "trust": "25"}, {"id": "8", "month": "August", "churn": "5.5%", "trust": "25"}, {"id": "9", "month": "September", "churn": "5.0%", "trust": "25"}, {"id": "10", "month": "October", "churn": "10.1%", "trust": "27"}, {"id": "11", "month": "November", "churn": "9.6%", "trust": "27"}, {"id": "12", "month": "December", "churn": "9.1%", "trust": "27"}]}}
    />
  </div>
);

/**
 * Reference year D, fired at the end of June: an honest player with nothing
 * strong enough, churn 6.0% → 6.2% while trust climbs to 73. Both lines stop
 * at June; July to December stay empty.
 */
export const CutShortInJune = () => (
  <div style={box}>
    <EndingCharts
      view={{"churn": {"values": [6, 6.06, 6.06, 6.06, 6.158, 6.158, 6.158], "months": [0, 1, 2, 3, 4, 5, 6], "scale": {"min": 2, "max": 9, "ticks": [3, 5, 7, 9]}, "reference": 4, "end": 0.06158}, "trust": {"values": [60, 70, 70, 70, 73, 73, 73], "months": [0, 1, 2, 3, 4, 5, 6], "scale": {"min": 0, "max": 100, "ticks": [25, 50, 75, 100]}, "reference": 35, "end": 73}}}
      figures={{"churn": "6.2%", "trust": "73 / 100", "radar": "0 / 100"}}
      churn={{"title": "Churn per month", "caption": "The dotted line is the December target.", "ariaLabel": "Monthly churn over the year: 6.0% on January 1st, 6.2% at the end of June; lowest 6.0%, highest 6.2%.", "reference": "target 4.0%", "ticks": ["3%", "5%", "7%", "9%"]}}
      trust={{"title": "Subscriber trust, the counter nobody displayed", "caption": "From 0 to 100. At 35 or below, people leave and tell everyone why.", "ariaLabel": "Subscriber trust over the year: 60 on January 1st, 73 at the end of June; lowest 60, highest 73.", "reference": "viral thread", "ticks": ["25", "50", "75", "100"]}}
      monthInitials={["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]}
      data={{"toggle": "See the data", "month": "Month", "churn": "Churn", "trust": "Trust", "rows": [{"id": "1", "month": "January", "churn": "6.1%", "trust": "70"}, {"id": "2", "month": "February", "churn": "6.1%", "trust": "70"}, {"id": "3", "month": "March", "churn": "6.1%", "trust": "70"}, {"id": "4", "month": "April", "churn": "6.2%", "trust": "73"}, {"id": "5", "month": "May", "churn": "6.2%", "trust": "73"}, {"id": "6", "month": "June", "churn": "6.2%", "trust": "73"}]}}
    />
  </div>
);
