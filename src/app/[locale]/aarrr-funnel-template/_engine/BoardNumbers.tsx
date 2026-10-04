"use client";

import { EngineProgress, NUMBER_STATUSES, type NumberStatus } from "@/components/engine/EngineProgress";
import { NumberList, type NumberRow } from "@/components/engine/NumberList";
import { LINK_METRIC_SHAPES, metricsOfStageIn, motionOfMetric, shapeOf, type MetricShape } from "@/lib/engine/catalog-shape";
import type { AnyDiagnosis } from "@/lib/engine/phrases";
import type { MetricId, Motion } from "@/lib/engine/types";
import { knownIn, statusOf } from "@/lib/engine/values";
import { displayInterval, unknownReason } from "./display";
import { listProgress, listStages, rowStatusOf, type ListProgress, type RowStatus } from "./number-list";
import { rowDelta } from "./series-view";
import { domId, fill, joinList, metricById, stageName } from "./text";
import type { EngineView } from "./view";

/** A motion's diagnosis — the one its list marks and its rows word. Self-serve's is the v1 field. */
export function diagnosisOf(view: EngineView, motion: Motion): AnyDiagnosis {
  return view.derived.motions.find((m) => m.motion === motion)?.diagnosis ?? view.derived.diagnosis;
}

/**
 * What a row says without opening anything: the number when there is one —
 * through the board's own formatter, so a row and a slide cannot print one
 * value two ways — or the words the person typed or picked. Why a number
 * can't be found is the row's note, not its value.
 */
function rowValue(shape: MetricShape, view: EngineView): { text: string; kind: "number" | "words" | "cause" } | null {
  const { state, strings, ctx } = view;
  const entry = state.snapshots[state.snapshots.length - 1]!.metrics[shape.id];
  if (entry?.status === "measured" && entry.value?.kind === "text") {
    // The person's own words, quoted as the catalogue quotes the activation event (text.ts#catalogFill).
    return { text: ctx.locale === "fr" ? `« ${entry.value.text} »` : `"${entry.value.text}"`, kind: "words" };
  }
  if (entry?.status === "measured" && entry.value?.kind === "choice") {
    const choice = entry.value.choice;
    const label = metricById(view.metrics, shape.id).choices?.find((c) => c.id === choice)?.label;
    return label ? { text: label, kind: "words" } : null;
  }
  // knownIn, not knownOf: a cohort number entered on a month younger than its window reads as
  // approximate (§6.3) — the same reading the peloton and the slides make.
  const known = knownIn(state, shape.id, ctx);
  if (known.kind === "known") {
    return { text: displayInterval(known.value, known.confidence, shape, state.setup.currency, ctx, strings), kind: "number" };
  }
  if (known.why === "todo" || known.why === "requested" || known.why === "not-applicable") return null;
  return { text: unknownReason(known, strings), kind: "cause" };
}

/** « 6 à faire », « Plus qu'un », « Plus rien à faire ». */
export function remainingText(remaining: number, view: EngineView): string {
  const l = view.strings.list;
  return remaining === 0 ? l.noneToGo : remaining === 1 ? l.lastOne : fill(l.toGo, { n: remaining });
}

/** « 7 trouvés · 2 estimés · 1 demandé · 3 introuvables », the zeros left out. */
function countsText(progress: ListProgress, view: EngineView): string {
  const l = view.strings.list;
  const part = (n: number, one: string, many: string) => (n === 0 ? null : n === 1 ? one : fill(many, { n }));
  return [
    part(progress.found, l.countFoundOne, l.countFound),
    part(progress.est, l.countEstOne, l.countEst),
    part(progress.asked, l.countAskedOne, l.countAsked),
    part(progress.cant, l.countCantOne, l.countCant),
  ]
    .filter(Boolean)
    .join(" · ");
}

/** Where a number sits, for its screen's header: « Activation · 2 sur 3 ». The link has its group's title. */
export function numberPosition(id: MetricId, view: EngineView): string {
  const { strings } = view;
  if (LINK_METRIC_SHAPES.some((s) => s.id === id)) return strings.hybrid.linkBlock;
  const shape = shapeOf(id);
  const inStage = metricsOfStageIn(shape.stage, motionOfMetric(id));
  return fill(strings.list.position, { stage: stageName(shape.stage), i: inStage.findIndex((s) => s.id === id) + 1, n: inStage.length });
}

/**
 * What remains, for a number's screen's header (« 6 à faire »): in its own engine — and in the hybrid, in both,
 * since « Enregistre et continue » walks from one engine's numbers to the other's. Counted in the number's engine
 * alone, the hybrid's margin sheet said « Plus rien à faire » over a button that led on to a sales-assisted number
 * (A21.8).
 */
export function numberRemaining(id: MetricId, view: EngineView): string {
  const snapshot = view.state.snapshots[view.state.snapshots.length - 1]!;
  const { plg, slg } = view.state.setup.motions;
  const motions: Motion[] = plg && slg ? ["plg", "slg"] : [motionOfMetric(id)];
  const remaining = motions.reduce((n, motion) => n + listProgress(listStages(snapshot, diagnosisOf(view, motion), motion)).remaining, 0);
  return remainingText(remaining, view);
}

/**
 * « Tes chiffres » on the board (design system extension 07, C41, A18 T2.b):
 * every number of the engine on screen, by stage, one row each, that opens
 * the number's own screen. In the hybrid, the engine the selector shows; the
 * link between the two sits in a closed group at the end of sales-assisted's
 * list (it is optional, and neither engine's number).
 *
 * A closed month read only: the rows say their value and their change, and
 * open nothing.
 */
export function BoardNumbers({
  view,
  motion,
  readOnly,
  onOpen,
}: {
  view: EngineView;
  motion: Motion;
  readOnly: boolean;
  onOpen: (id: MetricId) => void;
}) {
  const { strings, state } = view;
  const l = strings.list;
  const snapshot = state.snapshots[state.snapshots.length - 1]!;
  const stages = listStages(snapshot, diagnosisOf(view, motion), motion);
  const progress = listProgress(stages);
  const word = (status: NumberStatus) => l.status[status];

  const row = (id: MetricId, status: RowStatus): NumberRow => {
    const shape = shapeOf(id);
    const value = rowValue(shape, view);
    // Its change since the month before (§19.2.5): a sign and words, never a colour.
    const delta = rowDelta(id, view);
    const note = [value?.kind === "cause" ? value.text : null, delta].filter(Boolean).join(" · ");
    return {
      id,
      name: metricById(view.metrics, id).name,
      value: value && value.kind !== "cause" ? value.text : undefined,
      valueKind: value?.kind === "words" ? "words" : "number",
      status,
      statusLabel: status === "found" ? undefined : l.status[status],
      note: note || undefined,
      onOpen: readOnly ? undefined : () => onOpen(id),
      elementId: `engine-metric-${domId(id)}`,
      "data-testid": `engine-metric-${domId(id)}`,
    };
  };

  const { plg, slg } = state.setup.motions;
  const link = motion === "slg" && plg && slg ? LINK_METRIC_SHAPES[0]! : null;

  return (
    <NumberList
      title={l.title}
      progress={
        <EngineProgress
          remaining={remainingText(progress.remaining, view)}
          counts={countsText(progress, view) || undefined}
          groups={stages.map((s) => ({
            id: s.stage,
            label: fill(l.groupLabel, { stage: stageName(s.stage), list: joinList(s.marks.map((m) => word(m).toLowerCase()), strings.grammar) }),
            marks: s.marks,
          }))}
          label={l.marksLabel}
          legend={NUMBER_STATUSES.map((status) => ({ status, label: word(status) }))}
          legendLabel={l.legendLabel}
          data-testid="engine-progress"
        />
      }
      stages={stages.map((s) => ({
        id: s.stage,
        name: stageName(s.stage),
        holdsBack: s.holdsBack,
        holdsLabel: l.holds,
        foundLabel: fill(s.found <= 1 ? l.foundOne : l.found, { n: s.found, N: s.applicable }),
        marks: s.marks,
        rows: s.rows.map((r) => row(r.id, r.status)),
      }))}
      extra={
        link
          ? {
              title: strings.hybrid.linkBlock,
              rows: [row(link.id, rowStatusOf(statusOf(snapshot.metrics[link.id])))],
              "data-testid": "engine-link-block",
            }
          : undefined
      }
      data-testid="engine-numbers"
    />
  );
}
