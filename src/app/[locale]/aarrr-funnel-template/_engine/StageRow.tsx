import { metricsOfStage, shapeOf } from "@/lib/engine/catalog-shape";
import { STATUS_KEY, type EngineStrings, type ResolvedMetric } from "@/lib/engine/strings";
import type { CandidateId, Diagnosis, EngineCalcContext, EngineState } from "@/lib/engine/types";
import type { Pillar } from "@/lib/scoring/pillars";
import { displayInterval, unknownReason } from "./display";
import { knownOf } from "./engine-api";
import { pillOf, type PillKind } from "./keys";
import { metricById, stageName } from "./text";
import styles from "./Board.module.css";
import ui from "./_ui/ui.module.css";

const PILL_CLASS: Record<PillKind, string> = {
  found: styles.pillFound!,
  approximate: styles.pillApprox!,
  missing: styles.pillMissing!,
  inProgress: styles.pillProgress!,
  notApplicable: styles.pillNa!,
};

/**
 * One AARRR stage on the board (spec §8.2): `[stage + three status pills] ·
 * [comparator in words] · [the ★ number + its name]`.
 *
 * No gauge in the row, on purpose: the stages' rates live in different
 * decades (3 % against 18 %), and five bars on five domains invite the eye
 * to compare lengths that mean nothing side by side — the comparison strip,
 * with its bounds written, lives in the drawer (§8.3).
 *
 * Every state is said in words as well as drawn (WCAG 1.4.1): the pills are
 * `aria-hidden` and doubled by a hidden sentence naming each number and its
 * status, and a row below its reference says so in text on top of its red
 * edge. The whole row is ONE button — `aria-expanded` and `aria-controls`
 * the drawer — so the stage opens from the keyboard with Enter, and the
 * drawer knows which row to hand focus back to.
 */
export function StageRow({
  stage,
  index,
  state,
  diagnosis,
  expanded,
  drawerId,
  onToggle,
  metrics,
  strings,
  ctx,
}: {
  stage: Pillar;
  index: number;
  state: EngineState;
  diagnosis: Diagnosis;
  expanded: boolean;
  drawerId: string;
  onToggle: () => void;
  metrics: ResolvedMetric[];
  strings: EngineStrings;
  ctx: EngineCalcContext;
}) {
  const snapshot = state.snapshots[state.snapshots.length - 1]!;
  const shapes = metricsOfStage(stage);
  const star = shapes[0]!;
  const starMetric = metricById(metrics, star.id);
  const known = knownOf(snapshot.metrics[star.id], shapeOf(star.id), ctx);
  // Every ★ is one of the six candidates, so it always has a position.
  const position = diagnosis.positions[star.id as CandidateId];

  let comparator: string | null = null;
  let tone: "below" | "maybe" | null = null;
  if (known.kind === "known" && position) {
    switch (position.position) {
      case "below":
        tone = "below";
        comparator = position.comparator?.kind === "target" ? strings.diagnosis.stampTarget : strings.diagnosis.stampReference;
        break;
      case "maybe-below":
        tone = "maybe";
        comparator = strings.diagnosis.maybeBelowShort;
        break;
      case "within":
        comparator = strings.diagnosis.within;
        break;
      case "above":
        comparator = strings.diagnosis.above;
        break;
      case "no-comparator":
        comparator = strings.diagnosis.noComparator;
        break;
    }
  }

  const value =
    known.kind === "known"
      ? displayInterval(known.value, known.confidence, star, state.setup.currency, ctx, strings)
      : known.why === "todo" || known.why === "not-applicable"
        ? "—"
        : "?";
  const valueLabel = known.kind === "known" ? starMetric.name : unknownReason(known, strings);

  const statuses = shapes.map((s) => ({ shape: s, status: snapshot.metrics[s.id]?.status ?? "todo" }));
  const summary = statuses.map(({ shape, status }) => `${metricById(metrics, shape.id).name} — ${strings.status[STATUS_KEY[status]]}`).join(" · ");

  return (
    <button
      type="button"
      id={`engine-row-${stage}`}
      data-testid={`engine-row-${stage}`}
      className={[styles.row, tone === "below" ? styles.rowBelow : "", tone === "maybe" ? styles.rowMaybe : "", expanded ? styles.rowOpen : ""]
        .filter(Boolean)
        .join(" ")}
      aria-expanded={expanded}
      aria-controls={drawerId}
      onClick={onToggle}
    >
      <span className={styles.rowStage}>
        <span className={styles.rowIndex} aria-hidden="true">
          {index}
        </span>
        <span className={styles.rowName}>{stageName(stage)}</span>
      </span>
      <span className={styles.rowValue} data-unknown={known.kind === "unknown" && value === "?" ? "true" : undefined}>
        {value}
      </span>
      <span className={styles.pills} aria-hidden="true">
        {statuses.map(({ shape, status }) => (
          <span key={shape.id} className={[styles.pill, PILL_CLASS[pillOf(status)]].join(" ")} />
        ))}
      </span>
      <span className={styles.rowLabel}>{valueLabel}</span>
      {comparator ? (
        <span className={[styles.rowComparator, tone === "below" ? styles.rowComparatorBelow : ""].filter(Boolean).join(" ")}>
          {comparator}
        </span>
      ) : null}
      <span className={ui.srOnly}>{summary}</span>
    </button>
  );
}
