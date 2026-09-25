import { METRIC_SHAPES } from "@/lib/engine/catalog-shape";
import { STATUS_KEY } from "@/lib/engine/strings";
import type { MetricStatus } from "@/lib/engine/types";
import { PILLARS, type Pillar } from "@/lib/scoring/pillars";
import { rowsOf } from "./deck-rows";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { SlideText } from "./slide-text";
import styles from "./deck.module.css";

/**
 * A pip per number, shaped by its status — never by colour alone (WCAG
 * 1.4.1): solid = found, hatched = approximate, dashed = missing, outline =
 * in progress, a dash = not applicable. Same vocabulary as the board's stage
 * rows (§8.2), so a reader who learned it there reads it here.
 */
const PIP: Record<MetricStatus, string | undefined> = {
  measured: styles.pipFound,
  estimated: styles.pipApprox,
  conflicting: styles.pipApprox,
  missing: styles.pipMissing,
  todo: styles.pipPending,
  requested: styles.pipPending,
  "not-applicable": styles.pipNa,
};

const LEGEND: readonly MetricStatus[] = ["measured", "estimated", "missing", "requested", "not-applicable"];

/** A number's stage, from its id — structure, not words (the catalogue shape is pure). */
const STAGE_OF: ReadonlyMap<string, Pillar> = new Map(METRIC_SHAPES.map((s) => [s.id, s.stage]));

/**
 * Slide 3 — "what we can see, what we can't" (§9.3). It doubles as the
 * evidence slide, so it is always in the deck: on the left the fifteen
 * numbers, five stages by three, each with its status pip and its name; on
 * the right what is not documented yet, quickest to slowest to repair, each
 * with its cause and the ROLE that holds it — never a person.
 *
 * Every word comes from the model's rows: a `metric` row's name and status
 * label, a `missing` row's name (`label`) and its finished line (`text`,
 * « aucune mesure · Data · un sprint »). What the slide derives is structure
 * only — the stage each number sits under, read from its `id` through the
 * catalogue shape, and the pip, read back from the status label through the
 * same closed vocabulary that wrote it.
 */
export function SlideVisibility({ slide, context }: SlideProps) {
  const { strings } = context;
  const seen = rowsOf(slide, "metric");
  const missing = rowsOf(slide, "missing");
  const statusOf = (label: string): MetricStatus =>
    (Object.keys(STATUS_KEY) as MetricStatus[]).find((status) => strings.status[STATUS_KEY[status]] === label) ?? "todo";
  const byStage = (stage: Pillar) => seen.filter((row) => STAGE_OF.get(row.id) === stage);

  return (
    <SlideFrame slide={slide} context={context}>
      <div className={styles.visibility}>
        <section className={styles.visibilitySeen}>
          <h4 className={styles.cardEyebrow}>{strings.slide.visibilityLeft}</h4>
          <ul className={styles.stageList}>
            {PILLARS.map((stage) => (
              <li key={stage} className={styles.stageRow}>
                <span className={styles.stageName}>{strings.stages[stage]}</span>
                <ul className={styles.stageMetrics}>
                  {byStage(stage).map((row) => {
                    const status = statusOf(row.status);
                    return (
                      <li key={row.id} className={styles.stageMetric} data-status={status}>
                        <span className={[styles.pip, PIP[status]].filter(Boolean).join(" ")} aria-hidden="true" />
                        <span className={styles.stageMetricName}>
                          <SlideText text={row.metric} accent={false} />
                        </span>
                        <span className="tdg-visually-hidden">{row.status}</span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
          <ul className={styles.pipLegend} aria-hidden="true">
            {LEGEND.map((status) => (
              <li key={status}>
                <span className={[styles.pip, PIP[status]].filter(Boolean).join(" ")} />
                {strings.status[STATUS_KEY[status]]}
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.visibilityMissing}>
          <h4 className={styles.cardEyebrow}>{strings.slide.visibilityRight}</h4>
          {missing.length > 0 ? (
            <ol className={styles.missingList}>
              {missing.map((row) => (
                <li key={row.id} className={styles.missingRow}>
                  <span className={styles.missingName}>
                    <SlideText text={row.label} accent={false} />
                  </span>
                  <span className={styles.missingMeta}>
                    <SlideText text={row.text} accent={false} />
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.nothingMissing}>{strings.deckUi.nothingMissing}</p>
          )}
        </section>
      </div>
    </SlideFrame>
  );
}
