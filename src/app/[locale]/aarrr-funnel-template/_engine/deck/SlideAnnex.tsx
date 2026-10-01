import { rowsOf, type DeckRows } from "./deck-rows";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { SlideText } from "./slide-text";
import styles from "./deck.module.css";

type AnnexRow = DeckRows["annex"];

/** The table's columns, in the order of `slide.annexCols` (§14.8); the row's `label` is the "Number" column. */
const COLUMNS = ["label", "formula", "window", "period", "source", "status", "confidence"] as const satisfies readonly (keyof AnnexRow)[];

/**
 * The appendix — "definitions and sources" (§9.3). Always in the deck: it is
 * what makes every number on the other slides re-explainable in ten seconds
 * — the formula, the window, the month or cohort, where it came from, its
 * status and how much to trust it. The user's own definition, when they
 * wrote one, sits under the formula; their private note never does (it is
 * "never on a slide", §4.1), and the model doesn't carry it.
 *
 * One page of it: the model cuts the appendix into as many pages as its
 * rows need at 18px (lib/engine/annex-pages.ts, 2026-09-29), each a slide
 * with its own title and number, and this draws the rows it was given.
 * Until then a long appendix took a 15px step to stay on one page.
 *
 * A real `<table>`: this is tabular data, and a slide exported to PDF keeps
 * its structure for anyone reading it with assistive technology. A cell the
 * model left empty (no window for a monthly flow, no source for a missing
 * number) prints a dash, so an empty cell never reads as a forgotten one.
 */
export function SlideAnnex({ slide, context }: SlideProps) {
  const { strings } = context;
  const rows = rowsOf(slide, "annex");
  const groupOf = (row: AnnexRow) => (row as AnnexRow & { group?: "plg" | "slg" | "link" }).group;
  const groupLabel = (group: "plg" | "slg" | "link") => (group === "link" ? strings.slide.annexLink : strings.hybrid.motionName[group]);

  return (
    <SlideFrame slide={slide} context={context}>
      <table className={styles.annex}>
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col} scope="col" data-column={col}>
                {strings.slide.annexCols[col === "label" ? "number" : col]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.flatMap((row, i) => {
            const group = groupOf(row);
            // The hybrid's groups (§18.8.2): a heading where a group starts, and again at the top of each page
            // (lib/engine/annex-pages.ts keeps the room for both).
            const heading =
              group && (i === 0 || groupOf(rows[i - 1]!) !== group) ? (
                <tr key={`group-${group}`} className={styles.annexGroup} data-testid={`slide-annex-group-${group}`}>
                  <th scope="colgroup" colSpan={COLUMNS.length}>
                    {groupLabel(group)}
                  </th>
                </tr>
              ) : null;
            return [
              heading,
              <tr key={row.id}>
                {COLUMNS.map((col) =>
                  col === "label" ? (
                    <th key={col} scope="row">
                      <SlideText text={row.label} accent={false} />
                    </th>
                  ) : (
                    <td key={col} data-column={col} data-empty={row[col] === "" || undefined}>
                      {row[col] === "" ? "—" : <SlideText text={row[col]} accent={false} />}
                      {col === "formula" && row.definition ? <span className={styles.annexDefinition}>{row.definition}</span> : null}
                    </td>
                  ),
                )}
              </tr>,
            ];
          })}
        </tbody>
      </table>
    </SlideFrame>
  );
}
