import { DataTable } from "tour-de-growth";

/*
 * The ruled table: one solid rule under the header, dashed rows, no zebra,
 * no cell borders, figures in tabular mono. It is also the text equivalent
 * of every chart — a ChartFrame opens one behind "See the data".
 *
 * Cells are shown as the caller formatted them, which is why a sortable
 * column carries a raw `sort` key too: "12,400" sorts before "9,800" as text.
 */

const MONTHS = [
  ["jan", "January", 6.0, 70],
  ["feb", "February", 5.9, 68],
  ["mar", "March", 5.7, 65],
  ["apr", "April", 5.5, 63],
  ["may", "May", 5.3, 61],
  ["jun", "June", 5.2, 58],
] as const;

/** Plain: a caption, a row header, numeric columns right-aligned. */
export const Plain = () => (
  <div style={{ maxWidth: 480 }}>
    <DataTable
      caption="Churn and subscriber trust, first half of the year"
      columns={[
        { key: "month", header: "Month" },
        { key: "churn", header: "Churn", numeric: true },
        { key: "trust", header: "Trust", numeric: true },
      ]}
      rows={MONTHS.map(([id, month, churn, trust]) => ({
        id,
        cells: { month, churn: `${churn.toFixed(1)}%`, trust: String(trust) },
      }))}
    />
  </div>
);

/**
 * Sortable columns show a ↕ until clicked; the order is announced with
 * `aria-sort` on the header. A row without a value (—) stays last in both
 * directions. Click "Pages vues" in the live card.
 */
export const Sortable = () => (
  <div style={{ maxWidth: 520 }}>
    <DataTable
      caption="Pages du glossaire les plus lues ce mois-ci"
      columns={[
        { key: "page", header: "Page", sortable: true },
        { key: "views", header: "Pages vues", numeric: true, sortable: true },
        { key: "share", header: "Part", numeric: true, sortable: true },
      ]}
      rows={[
        { id: "cac", cells: { page: "CAC", views: { text: "12 400", sort: 12400 }, share: { text: "31 %", sort: 31 } } },
        { id: "ltv", cells: { page: "LTV", views: { text: "9 800", sort: 9800 }, share: { text: "24 %", sort: 24 } } },
        { id: "churn", cells: { page: "Churn", views: { text: "7 150", sort: 7150 }, share: { text: "18 %", sort: 18 } } },
        { id: "nps", cells: { page: "NPS", views: { text: "—", sort: null }, share: { text: "—", sort: null } } },
      ]}
    />
  </div>
);

/**
 * `sm` with `captionHidden` is how it sits inside a chart's disclosure: the
 * caption is the chart's title sentence, read by screen readers, not printed
 * twice.
 */
export const InsideAChart = () => (
  <div style={{ maxWidth: 360 }}>
    <DataTable
      size="sm"
      captionHidden
      caption="Churn fell every month of the autumn"
      columns={[
        { key: "month", header: "Month" },
        { key: "churn", header: "Churn", numeric: true },
      ]}
      rows={[
        { id: "sep", cells: { month: "September", churn: "4.5%" } },
        { id: "oct", cells: { month: "October", churn: "4.2%" } },
        { id: "nov", cells: { month: "November", churn: "4.1%" } },
      ]}
    />
  </div>
);
