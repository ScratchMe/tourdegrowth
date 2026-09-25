import type { Locale } from "@/lib/i18n/locale";
import type { Diagnosis, Peloton as PelotonModel, PelotonColumn, YearMonth } from "@/lib/engine/types";
import type { EngineStrings } from "@/lib/engine/strings";
import { formatNumber } from "./format-stub";
import {
  columnGrid,
  columnNumeral,
  fill,
  monthLabel,
  numeralText,
  signupsGrid,
  sourceLabel,
  type GridModel,
} from "./visual-model";
import styles from "./Peloton.module.css";

export interface PelotonProps {
  peloton: PelotonModel;
  strings: EngineStrings;
  locale: Locale;
  /** The followed cohort (the snapshot's `cohortMonth`): the 100 sign-ups every column counts. */
  cohortMonth: YearMonth;
  /** Part of the paid column's label: « Payants à J30 ». */
  paidWindowDays: number;
  /** When the diagnosis names a peloton column, that column is stamped and its dots take the one red. */
  diagnosis?: Diagnosis | null;
  className?: string;
}

type ColumnKey = "activated" | "d30" | "paid";
const COLUMN_KEY: Record<PelotonColumn["metric"], ColumnKey> = {
  "act.rate": "activated",
  "ret.d30": "d30",
  "rev.paid-conversion": "paid",
};

/** 2 significant digits, the upstream-volume rule of §6.2 (« ~3 200 visiteurs »). */
function twoSignificant(v: number): number {
  if (v <= 0) return 0;
  const magnitude = 10 ** (Math.floor(Math.log10(v)) - 1);
  return Math.round(v / magnitude) * magnitude;
}

/**
 * The peloton — engine spec §8.1, the engine's main visual.
 *
 * Four columns, **every one counted on the same 100 sign-ups** (D5): there
 * is no bar proportional to a head count between stages and no chain that
 * multiplies rates measured on different bases — the three prototypes that
 * drew one lied, and the spec's own mock did too. Each column reads, top to
 * bottom, numeral → label → 10 × 10 grid → source: the numeral ABOVE the
 * grid, never under it, where the mock had it touching the dots.
 *
 * Marks follow the data-viz doctrine (DS v3 §5.5): ink for what is
 * measured, a hatch for an estimated range, an outline for the rest, and a
 * whole-grid hatch with a « ? » on its own paper disk for a column nobody
 * measures — a shape of its own, so "not measured" can never read as zero.
 * The one red is the bottleneck's: the column the diagnosis names takes it
 * on its dots and carries the stamp, which says it in words as well.
 *
 * Text equivalent: every grid is a `role="img"` with a full sentence, and a
 * visually hidden table repeats the four columns (number, status, source).
 */
export function Peloton({ peloton, strings, locale, cohortMonth, paidWindowDays, diagnosis, className }: PelotonProps) {
  const w = strings.peloton;
  const v = strings.visual;
  const cohort = monthLabel(cohortMonth, locale);

  const named = new Set(diagnosis && (diagnosis.state === "clear" || diagnosis.state === "shared") ? diagnosis.named : []);
  const stampOf = (metric: PelotonColumn["metric"]): string | null => {
    if (!named.has(metric) || !diagnosis) return null;
    return diagnosis.positions[metric]?.comparator?.kind === "target"
      ? strings.diagnosis.stampTarget
      : strings.diagnosis.stampReference;
  };

  const referred = peloton.referredPerHundred ? columnNumeral(peloton.referredPerHundred) : null;
  const referredText = referred ? numeralText(referred, strings.units, v.lessThanOne) : null;

  const labels: Record<ColumnKey, string> = {
    activated: w.activated,
    d30: w.d30,
    paid: fill(w.paid, { n: String(paidWindowDays) }),
  };

  const upstream = (() => {
    const visitors = peloton.visitorsPerHundred;
    if (!visitors) return v.upstreamUnknown;
    const lo = formatNumber(twoSignificant(visitors.lo), locale);
    const hi = formatNumber(twoSignificant(visitors.hi), locale);
    const n = lo === hi ? lo : strings.units.range.replace("{lo}", lo).replace("{hi}", hi);
    const source = peloton.upstreamSource ? sourceLabel(peloton.upstreamSource, strings) : strings.status.estimated.toLowerCase();
    const month = peloton.upstreamPeriod ? monthLabel(peloton.upstreamPeriod, locale) : "";
    return fill(w.upstream, { n, source, month });
  })();

  const columns = peloton.columns.map((col) => {
    const key = COLUMN_KEY[col.metric];
    const numeral = columnNumeral(col.perHundred);
    const text = numeralText(numeral, strings.units, v.lessThanOne);
    const range = numeral.kind === "value" && numeral.lo !== numeral.hi;
    const status =
      numeral.kind === "unknown" ? w.legendUnknown : range || col.confidence === "approximate" ? w.legendRange : w.legendMeasured;
    const where = col.source ? sourceLabel(col.source, strings) : null;
    const period = col.period ? monthLabel(col.period, locale) : null;
    const source = numeral.kind === "unknown" ? w.legendUnknown : [where ?? w.legendRange, period].filter(Boolean).join(" · ");
    const population = labels[key].charAt(0).toLowerCase() + labels[key].slice(1);
    const aria =
      numeral.kind === "unknown"
        ? `${labels[key]} — ${w.legendUnknown}`
        : fill(w.aria, { n: text, population, status, source: where ?? w.legendRange, cohort: period ?? cohort });
    return { col, key, text, grid: columnGrid(col.perHundred), source, status, aria, stamp: stampOf(col.metric) };
  });

  const signupsAria = referredText
    ? `${w.signups} — 100, ${fill(w.legendReferred, { n: referredText })}`
    : `${w.signups} — 100`;

  return (
    <figure className={[styles.peloton, className ?? ""].filter(Boolean).join(" ")} data-testid="engine-peloton">
      <p className={styles.upstream} data-testid="peloton-upstream">
        <svg className={styles.arrow} viewBox="0 0 28 12" aria-hidden="true" focusable="false">
          <path d="M0 6 H25 M19 1 L26 6 L19 11" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span>{upstream}</span>
      </p>

      <div className={styles.columns}>
        <Column
          numeral="100"
          label={w.signups}
          grid={signupsGrid(peloton.referredPerHundred)}
          aria={signupsAria}
          source={fill(v.cohortOf, { cohort })}
          metric="signups"
        />
        {columns.map((c) => (
          <Column
            key={c.col.metric}
            numeral={c.text}
            label={labels[c.key]}
            grid={c.grid}
            aria={c.aria}
            source={c.source}
            stamp={c.stamp}
            metric={c.col.metric}
          />
        ))}
      </div>

      <p className={styles.sameHundred}>{w.sameHundred}</p>

      <ul className={styles.legend} aria-hidden="true">
        {referredText ? (
          <li>
            <span className={`${styles.swatch} ${styles.referred}`} />
            {fill(w.legendReferred, { n: referredText })}
          </li>
        ) : null}
        <li>
          <span className={`${styles.swatch} ${styles.filled}`} />
          {w.legendMeasured}
        </li>
        <li>
          <span className={`${styles.swatch} ${styles.range}`} />
          {w.legendRange}
        </li>
        <li>
          <span className={`${styles.swatch} ${styles.unknownSwatch}`} />
          {w.legendUnknown}
        </li>
      </ul>

      {/* Hidden by a WRAPPER, not on the table itself: a table box sizes to
          its content and ignores `width: 1px` / `overflow: hidden`, so the
          utility on <table> left a 657px invisible box that scrolled a
          390px page sideways (measured, not supposed). */}
      <div className="tdg-visually-hidden">
      <table>
        <caption>{w.tableCaption}</caption>
        <thead>
          <tr>
            <th scope="col">{v.tableColumn}</th>
            <th scope="col">{v.tablePerHundred}</th>
            <th scope="col">{v.tableStatus}</th>
            <th scope="col">{v.tableSource}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">{w.signups}</th>
            <td>100</td>
            <td>{referredText ? fill(w.legendReferred, { n: referredText }) : w.legendMeasured}</td>
            <td>{fill(v.cohortOf, { cohort })}</td>
          </tr>
          {columns.map((c) => (
            <tr key={c.col.metric}>
              <th scope="row">{labels[c.key]}</th>
              <td>{c.text}</td>
              <td>{c.status}</td>
              <td>{c.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  );
}

interface ColumnProps {
  numeral: string;
  label: string;
  grid: GridModel;
  aria: string;
  source: string;
  stamp?: string | null;
  metric: string;
}

function Column({ numeral, label, grid, aria, source, stamp, metric }: ColumnProps) {
  const unknown = grid.kind === "unknown";
  const highlighted = Boolean(stamp);
  return (
    <div
      className={[styles.column, highlighted ? styles.highlighted : ""].filter(Boolean).join(" ")}
      data-metric={metric}
      data-state={unknown ? "unknown" : "known"}
    >
      <div className={styles.numeral} data-testid={`peloton-numeral-${metric}`}>
        {numeral}
      </div>
      <div className={styles.label}>
        {label}
        {stamp ? (
          <span className={styles.stamp} data-testid="peloton-stamp">
            {stamp}
          </span>
        ) : null}
      </div>
      <div
        role="img"
        aria-label={aria}
        className={[styles.grid, unknown ? styles.unknownGrid : ""].filter(Boolean).join(" ")}
        data-testid={`peloton-grid-${metric}`}
      >
        {unknown ? (
          <span className={styles.unknownMark} aria-hidden="true">
            ?
          </span>
        ) : (
          grid.dots.map((dot, i) => (
            <span key={i} className={`${styles.dot} ${styles[dot]}`} data-dot={dot} aria-hidden="true" />
          ))
        )}
      </div>
      <p className={styles.source}>{source}</p>
    </div>
  );
}
