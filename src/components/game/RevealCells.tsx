import { StatTile } from "@/components/viz/StatTile";
import styles from "./RevealCells.module.css";

/**
 * December's three figures, formatted ONCE by the island and handed to both
 * the cells and the curves (EndingCharts reads `metric` and `trust` as its
 * end-of-curve labels). The prototype formatted the cell and the end of the
 * curve separately and printed « 4,0 % » beside « 3,99 % » (plan R5); one
 * object read in two places cannot disagree with itself.
 */
export interface DecemberFigures {
  /** The level's number in December, as its tile prints it: « 4,1 % », « 3 000 ». */
  metric: string;
  /** « 83 / 100 » — `december.cells.outOf` filled with the trust. */
  trust: string;
  /** « 0 / 100 ». */
  radar: string;
}

export interface RevealCellsProps {
  figures: DecemberFigures;
  /** `december.cells.metric`, `.trust`, `.radar`. */
  labels: { metric: string; trust: string; radar: string };
  /** `december.gameNumbers` — the honesty line, right under the numbers it qualifies (plan §2.7). */
  note: string;
  /**
   * Lifts the blur off the two figures the dashboard never showed, once, on
   * the way into December. Not when a finished year is reopened.
   */
  revealing?: boolean;
}

/**
 * The reveal — GAME-BRIEF §5.11 point 2.
 *
 * Three paper tiles: the level's number in December, and the two counters
 * the night dashboard kept blurred all year. Trust and radar arrive with the
 * de-blur gesture of the tile they used to be (`StatTile revealing`); the
 * number was never hidden, so it simply is there.
 */
export function RevealCells({ figures, labels, note, revealing = false }: RevealCellsProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.cells}>
        <StatTile label={labels.metric} value={figures.metric} data-testid="game-reveal-metric" />
        <StatTile label={labels.trust} value={figures.trust} revealing={revealing} data-testid="game-reveal-trust" />
        <StatTile label={labels.radar} value={figures.radar} revealing={revealing} data-testid="game-reveal-radar" />
      </div>
      <p className={styles.note}>{note}</p>
    </div>
  );
}
