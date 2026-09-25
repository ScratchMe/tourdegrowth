import { metricsOfStage, shapeOf } from "@/lib/engine/catalog-shape";
import { CAUSE_KEY, REPAIR_KEY, ROLE_KEY, STATUS_KEY } from "@/lib/engine/strings";
import type { MetricEntry, MetricId, MetricStatus, RepairScale } from "@/lib/engine/types";
import { PILLARS } from "@/lib/scoring/pillars";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { SlideText } from "./slide-text";
import styles from "./deck.module.css";

/** Quickest first: the order a leadership meeting can act on (§9.3, slide 3). */
const REPAIR_ORDER: readonly RepairScale[] = ["meeting", "afternoon", "sprint", "quarter"];

/**
 * A pip per number, shaped by its status — never by colour alone (WCAG
 * 1.4.1): solid = found, hatched = approximate, dashed red = missing,
 * outline = in progress, a dash = not applicable. Same vocabulary as the
 * board's stage rows (§8.2), so a reader who learned it there reads it here.
 */
const PIP: Record<MetricStatus, string> = {
  measured: "pipFound",
  estimated: "pipApprox",
  conflicting: "pipApprox",
  missing: "pipMissing",
  todo: "pipPending",
  requested: "pipPending",
  "not-applicable": "pipNa",
};

const pipClass = (status: MetricStatus) => `${styles.pip} ${styles[PIP[status]]}`;

function entryOf(entries: Partial<Record<MetricId, MetricEntry>>, id: MetricId): MetricEntry | undefined {
  return entries[id];
}

/**
 * Slide 3 — "what we can see, what we can't" (§9.3). It doubles as the
 * evidence slide, so it is always in the deck: on the left the fifteen
 * numbers, five stages by three, each with its status pip and its name; on
 * the right the missing ones, sorted quickest to slowest to repair, each with
 * its cause and the ROLE that holds it — never a person.
 *
 * Nothing here is a number to format: statuses, names, causes and repair
 * scales are all vocabulary, read straight from the state and mapped to their
 * labels. The one count on the slide is in its title, which the model wrote.
 */
export function SlideVisibility({ slide, context }: SlideProps) {
  const { strings, metrics, state } = context;
  const entries = state.snapshots[0]?.metrics ?? {};
  const nameOf = (id: MetricId) => metrics.find((m) => m.id === id)?.name ?? id;
  const statusOf = (id: MetricId): MetricStatus => entryOf(entries, id)?.status ?? "todo";

  const missing = metrics
    .map((m, catalogueIndex) => ({ id: m.id, catalogueIndex, entry: entryOf(entries, m.id) }))
    .filter((m) => m.entry?.status === "missing" && m.entry.missing)
    .sort(
      (a, b) =>
        REPAIR_ORDER.indexOf(a.entry!.missing!.repair) - REPAIR_ORDER.indexOf(b.entry!.missing!.repair) ||
        a.catalogueIndex - b.catalogueIndex,
    );

  const legend: MetricStatus[] = ["measured", "estimated", "missing", "todo", "not-applicable"];

  return (
    <SlideFrame slide={slide} context={context}>
      <div className={styles.visibility}>
        <section className={styles.visibilitySeen}>
          <h4 className={styles.cardEyebrow}>{strings.slide.visibilityLeft}</h4>
          <ul className={styles.stageList}>
            {PILLARS.map((stage) => (
              <li key={stage} className={styles.stageRow}>
                <span className={styles.stageName}>{stage}</span>
                <ul className={styles.stageMetrics}>
                  {metricsOfStage(stage).map((shape) => {
                    const status = statusOf(shape.id);
                    return (
                      <li key={shape.id} className={styles.stageMetric} data-status={status}>
                        <span className={pipClass(status)} aria-hidden="true" />
                        <span className={styles.stageMetricName}><SlideText text={nameOf(shape.id)} accent={false} /></span>
                        <span className="tdg-visually-hidden">{strings.status[STATUS_KEY[status]]}</span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
          <ul className={styles.pipLegend} aria-hidden="true">
            {legend.map((status) => (
              <li key={status}>
                <span className={pipClass(status)} />
                {strings.status[STATUS_KEY[status]]}
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.visibilityMissing}>
          <h4 className={styles.cardEyebrow}>{strings.slide.visibilityRight}</h4>
          {missing.length > 0 ? (
            <ol className={styles.missingList}>
              {missing.map(({ id, entry }) => {
                const m = entry!.missing!;
                const role = m.ownerRole ?? shapeOf(id).defaultRole;
                return (
                  <li key={id} className={styles.missingRow}>
                    <span className={styles.missingName}><SlideText text={nameOf(id)} accent={false} /></span>
                    <span className={styles.missingMeta}>
                      {strings.repair[REPAIR_KEY[m.repair]]} · {strings.cause[CAUSE_KEY[m.cause]]} ·{" "}
                      {strings.role[ROLE_KEY[role]]}
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className={styles.nothingMissing}>{strings.deckUi.nothingMissing}</p>
          )}
        </section>
      </div>
    </SlideFrame>
  );
}
