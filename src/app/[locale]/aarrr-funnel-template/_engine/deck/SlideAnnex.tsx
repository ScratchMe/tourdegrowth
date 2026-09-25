import { linesOf } from "./deck-lines";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { SlideText } from "./slide-text";
import styles from "./deck.module.css";

const COLUMNS = ["name", "formula", "window", "period", "source", "status", "confidence"] as const;
const HEADER_KEY = {
  name: "number",
  formula: "formula",
  window: "window",
  period: "period",
  source: "source",
  status: "status",
  confidence: "confidence",
} as const;

/** Past this many rows the table steps its type down so the whole appendix stays on one page. */
const DENSE_ROWS = 12;

/**
 * The appendix — "definitions and sources" (§9.3). Always in the deck: it is
 * what makes every number on the other slides re-explainable in ten seconds
 * — the formula, the window, the month or cohort, where it came from, its
 * status and how much to trust it. The user's own definition, when they wrote
 * one, sits under the formula; their private note never does (it is "never on
 * a slide", §4.1).
 *
 * A real `<table>`: this is tabular data, and a slide exported to PDF keeps
 * its structure for anyone reading it with assistive technology.
 */
export function SlideAnnex({ slide, context }: SlideProps) {
  const { strings } = context;
  const rows = linesOf(slide, "row");
  const dense = rows.length > DENSE_ROWS;

  return (
    <SlideFrame slide={slide} context={context}>
      <table className={[styles.annex, dense ? styles.annexDense : ""].join(" ")}>
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col} scope="col">
                {strings.slide.annexCols[HEADER_KEY[col]]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.metric}>
              {COLUMNS.map((col) =>
                col === "name" ? (
                  <th key={col} scope="row">
                    <SlideText text={row.name} accent={false} />
                  </th>
                ) : (
                  <td key={col} data-column={col}>
                    <SlideText text={row[col]} accent={false} />
                    {col === "formula" && row.definition ? (
                      <span className={styles.annexDefinition}>{row.definition}</span>
                    ) : null}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </SlideFrame>
  );
}
