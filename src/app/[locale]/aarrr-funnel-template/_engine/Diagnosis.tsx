import type { Locale } from "@/lib/i18n/locale";
import type { CandidateId, Diagnosis as DiagnosisModel, Interval, MetricId } from "@/lib/engine/types";
import type { EngineStrings, ResolvedMetric } from "@/lib/engine/strings";
import { CANDIDATE_IDS, shapeOf } from "@/lib/engine/catalog-shape";
import { formatInterval, formatPercent, joinList } from "./format-stub";
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
  const list = (items: string[]) => joinList(items, strings.grammar);

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
    if (c.kind === "target") return fill(d.belowTarget, { value: formatted, target: formatPercent(c.lo, locale) });
    return fill(d.belowReference, {
      value: formatted,
      range: formatInterval({ lo: c.lo, hi: c.hi }, "percent", ctx, strings.units),
    });
  };

  const named = diagnosis.state === "clear" || diagnosis.state === "shared" ? diagnosis.named : [];

  // `not-enough` with one candidate below: say which, and say why it can't be ranked.
  const notEnoughBelow =
    diagnosis.state === "not-enough"
      ? (Object.entries(diagnosis.positions) as [CandidateId, DiagnosisModel["positions"][CandidateId]][]).find(
          ([, p]) => p.position === "below",
        )?.[0]
      : undefined;

  // `{stages}` sits mid-sentence (« Sans chiffre pour {stages}, … »): each unmeasured number as
  // the SUBJECT phrase, article included and lower-case — « la rétention à J30 », « le churn
  // logo » — never its capitalised catalogue name, which read « pour La rétention à J30 ».
  // Every id the diagnosis can call blind is a candidate (diagnose.ts BLIND_WATCH).
  const blindSubjects = diagnosis.blind.map((id) =>
    (CANDIDATE_IDS as readonly string[]).includes(id) ? strings.subject[id as CandidateId] : nameOf(id),
  );
  const blindSentence = blindSubjects.length
    ? fill(blindSubjects.length === 1 ? d.blindOne : d.blind, { stages: list(blindSubjects) })
    : null;

  const churnBelow = diagnosis.positions["ret.logo-churn"]?.position === "below";

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
        <p className={styles.body}>
          {notEnoughBelow ? fill(d.notEnoughBelow, { stage: nameOf(notEnoughBelow) }) : d.notEnoughBody}
        </p>
      ) : null}

      {diagnosis.belowUnpriced.length ? (
        <p className={styles.note}>{fill(d.unpriced, { stages: list(diagnosis.belowUnpriced.map(nameOf)) })}</p>
      ) : null}
      {diagnosis.basis === "relative-gap" && churnBelow ? <p className={styles.note}>{d.noArpa}</p> : null}

      {blindSentence ? (
        <p className={styles.blind} data-testid="diagnosis-blind">
          {blindSentence}
        </p>
      ) : null}

      <p className={styles.fixed}>{d.topOfFunnel}</p>
    </section>
  );
}
