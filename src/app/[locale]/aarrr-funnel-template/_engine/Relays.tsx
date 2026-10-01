import { Fragment } from "react";
import { DotGrid, DotLegend } from "@/components/viz/DotGrid";
import type { Locale } from "@/lib/i18n/locale";
import type { EngineState, RelayColumn, Relays as RelaysModel, SlgDiagnosis } from "@/lib/engine/types";
import type { EngineStrings } from "@/lib/engine/strings";
import { formatMonthRange, formatNumber } from "@/lib/engine/format";
import { positionLabel } from "@/lib/engine/phrases";
import { leadBase } from "@/lib/engine/deck-motions";
import { columnGrid, columnNumeral, fill, numeralText, sourceLabel } from "./visual-model";
import styles from "./Relays.module.css";

export interface RelaysProps {
  relays: RelaysModel;
  state: EngineState;
  strings: EngineStrings;
  locale: Locale;
  /** The sales-assisted diagnosis: a relay it names is stamped, its dots take the one red. */
  diagnosis?: SlgDiagnosis | null;
  /** The hybrid's half-width column (§18.7): one row per relay, « nouvelle base » between them. */
  compact?: boolean;
  className?: string;
}

const LABEL_KEY: Record<RelayColumn["metric"], "leadToOpp" | "winRate" | "goLive"> = {
  "slg.acq.lead-to-opp": "leadToOpp",
  "slg.rev.win-rate": "winRate",
  "slg.act.go-live": "goLive",
};

/** 2 significant digits, the upstream-volume rule of §6.2 (« ~160 MQL par mois »). */
function twoSignificant(v: number): number {
  if (v <= 0) return 0;
  const magnitude = 10 ** (Math.floor(Math.log10(v)) - 1);
  return Math.round(v / magnitude) * magnitude;
}

/**
 * The sales-assisted funnel — engine spec §18.5.1, drawn in THREE RELAYS.
 *
 * The peloton counts every column on the same 100 sign-ups (D5); the
 * sales-assisted motion can't: the win rate is read on the quarter's closed
 * opportunities, not on a cohort of leads. So each relay is a grid on ITS
 * OWN base of 100 — leads (or MQLs), then closed opportunities, then new
 * customers — each with its own three months, and nothing multiplies them
 * into a chain: the legend says they aren't the same people, and in the
 * hybrid's compact column a rule and « nouvelle base » separate them.
 *
 * The marks are the peloton's (DS v3 §5.5): ink measured, hatched an
 * estimated range, the whole-grid « ? » for a relay nobody measures, and the
 * one red for a relay the diagnosis names, with its stamp in words.
 */
export function Relays({ relays, state, strings, locale, diagnosis, compact, className }: RelaysProps) {
  const r = strings.relays;
  const w = strings.peloton;
  const v = strings.visual;
  const named = new Set<string>(diagnosis && (diagnosis.state === "clear" || diagnosis.state === "shared") ? diagnosis.named : []);
  const leadLabel = relays.leadNoun === "mql" ? r.label.mql : r.label.leads;
  const baseLabels: Record<RelayColumn["base"], string> = {
    leads: leadLabel,
    "closed-opps": r.label.closedOpps,
    "new-customers": r.label.newCustomers,
  };

  const upstream = (() => {
    const perMonth = relays.leadsPerMonth;
    const first = relays.columns[0]!;
    if (!perMonth || !first.period) return fill(r.upstreamUnknown, { label: leadLabel });
    const lo = formatNumber(twoSignificant(perMonth.lo), locale);
    const hi = formatNumber(twoSignificant(perMonth.hi), locale);
    const n = lo === hi ? lo : strings.units.range.replace("{lo}", lo).replace("{hi}", hi);
    const source = first.source ? sourceLabel(first.source, strings) : strings.status.estimated.toLowerCase();
    return fill(r.upstream, { label: leadLabel, n, source, months: formatMonthRange(first.period, locale, strings.units) });
  })();

  const columns = relays.columns.map((column) => {
    const numeral = columnNumeral(column.perHundred);
    const text = numeralText(numeral, strings.units, v.lessThanOne);
    const rangeShown = numeral.kind === "value" && numeral.lo !== numeral.hi;
    const status = numeral.kind === "unknown" ? w.legendUnknown : rangeShown || column.confidence === "approximate" ? w.legendRange : w.legendMeasured;
    const label = fill(r.label[LABEL_KEY[column.metric]], { n: String(state.setup.goLiveWindowDays) });
    const period = column.period ? formatMonthRange(column.period, locale, strings.units) : "";
    const where = column.source ? sourceLabel(column.source, strings) : null;
    const source = numeral.kind === "unknown" ? w.legendUnknown : [where ?? w.legendRange, period].filter(Boolean).join(" · ");
    const base = [baseLabels[column.base], period].filter(Boolean).join(" · ");
    const at = diagnosis?.positions[column.metric];
    const stamp = named.has(column.metric) && at ? positionLabel(at.position, at.comparator, strings) : null;
    const population = label.charAt(0).toLowerCase() + label.slice(1);
    const baseNoun = column.base === "leads" ? leadBase(relays, strings) : column.base === "closed-opps" ? strings.findings.base.closedOpps : strings.findings.base.newCustomers;
    const aria =
      numeral.kind === "unknown"
        ? `${label} — ${w.legendUnknown}`
        : fill(r.aria, { n: text, base: baseNoun, population, status, source: where ?? w.legendRange, period });
    return { column, text, label, base, source, status, aria, stamp, grid: columnGrid(column.perHundred) };
  });

  return (
    <figure className={[styles.relays, compact ? styles.compact : "", className ?? ""].filter(Boolean).join(" ")} data-testid="engine-relays">
      <p className={styles.upstream} data-testid="relays-upstream">
        {/* An SVG, never a glyph: no arrow exists in Stardos Stencil (spec §10.4). */}
        <svg className={styles.arrow} viewBox="0 0 28 12" aria-hidden="true" focusable="false">
          <path d="M0 6 H25 M19 1 L26 6 L19 11" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span>{upstream}</span>
      </p>

      <div className={styles.columns}>
        {columns.map((c, i) => (
          <Fragment key={c.column.metric}>
            {compact && i > 0 ? (
              <p className={styles.newBase} aria-hidden="true">
                {r.newBase}
              </p>
            ) : null}
            <div className={styles.column} data-metric={c.column.metric} data-state={c.grid.kind}>
              <p className={styles.base}>{c.base}</p>
              <div className={styles.numeral} data-testid={`relays-numeral-${c.column.metric}`}>
                {c.text}
              </div>
              <div className={styles.label}>
                {c.label}
                {c.stamp ? (
                  <span className={styles.stamp} data-testid="relays-stamp">
                    {c.stamp}
                  </span>
                ) : null}
              </div>
              <DotGrid grid={c.grid} label={c.aria} highlighted={Boolean(c.stamp)} className={styles.grid} data-testid={`relays-grid-${c.column.metric}`} />
              <p className={styles.source}>{c.source}</p>
            </div>
          </Fragment>
        ))}
      </div>

      <p className={styles.ownBase} data-testid="relays-own-base">
        {r.ownBase}
      </p>

      <DotLegend
        aria-hidden
        items={[
          { mark: "filled", label: w.legendMeasured },
          { mark: "range", label: w.legendRange },
          { mark: "unknown", label: w.legendUnknown },
        ]}
      />

      {/* Hidden by a wrapper, as the peloton's table (a table box ignores `width: 1px`). */}
      <div className="tdg-visually-hidden">
        <table>
          <caption>{r.ownBase}</caption>
          <thead>
            <tr>
              <th scope="col">{v.tableColumn}</th>
              <th scope="col">{v.tableStatus}</th>
              <th scope="col">{v.tableSource}</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((c) => (
              <tr key={c.column.metric}>
                <th scope="row">{`${c.label} (${c.base})`}</th>
                <td>{c.text === "?" ? c.status : `${c.text} — ${c.status}`}</td>
                <td>{c.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
