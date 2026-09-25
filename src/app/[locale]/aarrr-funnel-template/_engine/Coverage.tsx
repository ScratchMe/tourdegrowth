import type { EngineStrings } from "@/lib/engine/strings";
import type { Coverage as CoverageData } from "@/lib/engine/types";
import { fill } from "./text";
import styles from "./Board.module.css";

/**
 * The coverage line (§7 E2.3) — always FRACTIONS and counts, never a
 * percentage of completion: "9 of 15 numbers found" says how much is left to
 * fetch, "60 %" says nothing a person can act on (§6.4, the audit's rule).
 *
 * The chips sum to the denominator by construction (found + approximate +
 * in progress + missing), so the line can be checked by eye. The in-progress
 * chip reads "requested" when every number in progress has been asked for —
 * the spec's example line — and "in progress" as soon as one is still to
 * fill in, because calling a number nobody has touched "requested" would be
 * false.
 */
export function Coverage({ coverage, strings }: { coverage: CoverageData; strings: EngineStrings }) {
  const t = strings.coverage;
  const N = coverage.denominator;
  const chip = (n: number, many: string, one: string) => (n === 1 ? fill(one, { N }) : fill(many, { n, N }));
  const inProgress =
    coverage.todo === 0 ? chip(coverage.requested, t.requested, t.requestedOne) : fill(t.inProgress, { n: coverage.inProgress });

  return (
    <ul className={styles.coverage} data-testid="engine-coverage">
      <li className={`${styles.chip} ${styles.chipFound}`}>{chip(coverage.found, t.found, t.foundOne)}</li>
      {coverage.approximate > 0 ? (
        <li className={`${styles.chip} ${styles.chipApprox}`}>{chip(coverage.approximate, t.approximate, t.approximateOne)}</li>
      ) : null}
      {coverage.inProgress > 0 ? <li className={`${styles.chip} ${styles.chipProgress}`}>{inProgress}</li> : null}
      {coverage.missing > 0 ? (
        <li className={`${styles.chip} ${styles.chipMissing}`}>{chip(coverage.missing, t.missing, t.missingOne)}</li>
      ) : null}
    </ul>
  );
}
