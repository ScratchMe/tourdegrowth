import type { Locale } from "@/lib/i18n/locale";
import type { CandidateId, Diagnosis as DiagnosisModel, Interval, MetricId } from "@/lib/engine/types";
import type { EngineStrings, ResolvedMetric } from "@/lib/engine/strings";
import { shapeOf } from "@/lib/engine/catalog-shape";
import {
  behindSentence,
  blindSentence as blindSentenceOf,
  churnWithoutCommonAmount,
  notEnoughBelowSentence,
  unpricedSentence,
} from "@/lib/engine/phrases";
import { formatInterval, formatPercent } from "@/lib/engine/format";
import { fill, stageLabel } from "./visual-model";
import styles from "./Diagnosis.module.css";

export interface DiagnosisProps {
  diagnosis: DiagnosisModel;
  strings: EngineStrings;
  locale: Locale;
  /** The fifteen numbers' names, to say WHICH number of a stage is below its comparator. */
  metrics: ResolvedMetric[];
  /**
   * The candidates' known values, in percent. `Diagnosis` carries a position
   * and a comparator but not the value itself; the board has it (`knownOf`),
   * and the comparator sentence has to print it.
   */
  values: Partial<Record<CandidateId, Interval>>;
  className?: string;
}

/**
 * The diagnosis block — engine spec §8.4 (D18).
 *
 * The grammar of `result/Bottleneck` — mono eyebrow, the stage name in
 * stencil, the sentence that qualifies it — without reusing it: Bottleneck
 * takes pillar scores out of 20, and the engine deals in rates and money.
 * Faking scores to fit its props would be exactly the kind of number that
 * cannot be re-explained in ten seconds.
 *
 * **The eyebrow and the names come from the same `Diagnosis` object**, so
 * "one stage holds the engine back" can never sit over two names. A stage is
 * red only when the diagnosis names it (`clear`/`shared`); `level` and
 * `not-enough` stay ink — red is a diagnosis, and neither state is one. The
 * blind line is always printed when a ★ is unmeasured: an unknown is a
 * finding, and the real bottleneck may be hiding there.
 */
export function Diagnosis({ diagnosis, strings, locale, metrics, values, className }: DiagnosisProps) {
  const d = strings.diagnosis;
  // Formatting reads the language only, never the clock: a fixed date keeps
  // this component free of `Date.now()` (the engine's time is injected).
  const ctx = { locale, today: new Date(0) };
  const nameOf = (id: MetricId) => metrics.find((m) => m.id === id)?.name ?? id;

  const eyebrow =
    diagnosis.state === "clear"
      ? d.clear
      : diagnosis.state === "shared"
        ? fill(d.shared, { n: String(diagnosis.named.length) })
        : diagnosis.state === "level"
          ? d.level
          : d.notEnough;

  const comparatorSentence = (id: CandidateId): string | null => {
    const position = diagnosis.positions[id];
    const value = values[id];
    if (!position?.comparator || !value) return null;
    const c = position.comparator;
    const formatted = formatInterval(value, "percent", ctx, strings.units);
    // The sentence picks « sous » or « au-dessus » from the metric's direction: churn behind its comparator sits ABOVE it.
    const comparatorText =
      c.kind === "target" ? formatPercent(c.lo, locale) : formatInterval({ lo: c.lo, hi: c.hi }, "percent", ctx, strings.units);
    return behindSentence(c, formatted, comparatorText, strings);
  };

  const named = diagnosis.state === "clear" || diagnosis.state === "shared" ? diagnosis.named : [];

  // The sentences are built in `lib/engine/phrases.ts`, shared with the slides: a stage mid-sentence is a
  // phrase with its article (« Sans chiffre pour la rétention à J30 », never « pour La rétention »), and where
  // a value sits follows the metric's direction.
  // `not-enough` with one candidate behind: say which, where it sits, and why it can't be ranked.
  const notEnoughBelow = notEnoughBelowSentence(diagnosis, strings, metrics);
  const blindSentence = blindSentenceOf(diagnosis.blind, strings, metrics);
  const unpriced = unpricedSentence(diagnosis, strings, metrics);

  return (
    <section
      className={[styles.diagnosis, className ?? ""].filter(Boolean).join(" ")}
      data-testid="engine-diagnosis"
      data-state={diagnosis.state}
    >
      <p className={[styles.eyebrow, named.length ? styles.eyebrowNamed : ""].filter(Boolean).join(" ")}>
        {eyebrow}
      </p>

      {named.length ? (
        <ul className={styles.names}>
          {named.map((id) => (
            <li key={id} className={styles.name} data-testid={`diagnosis-named-${id}`}>
              <span className={styles.stage}>{stageLabel(shapeOf(id).stage)}</span>
              <span className={styles.metric}>{nameOf(id)}</span>
              {comparatorSentence(id) ? <span className={styles.sentence}>{comparatorSentence(id)}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}

      {diagnosis.state === "level" ? <p className={styles.body}>{d.levelBody}</p> : null}
      {diagnosis.state === "not-enough" ? (
        <p className={styles.body}>{notEnoughBelow ?? d.notEnoughBody}</p>
      ) : null}

      {unpriced ? <p className={styles.note}>{unpriced}</p> : null}
      {churnWithoutCommonAmount(diagnosis) ? <p className={styles.note}>{d.noArpa}</p> : null}

      {blindSentence ? (
        <p className={styles.blind} data-testid="diagnosis-blind">
          {blindSentence}
        </p>
      ) : null}

      <p className={styles.fixed}>{d.topOfFunnel}</p>
    </section>
  );
}
