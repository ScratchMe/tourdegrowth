"use client";

import { useState } from "react";
import { Tag } from "@/components/core/Tag";
import { metricsOfStage } from "@/lib/engine/catalog-shape";
import { STATUS_KEY } from "@/lib/engine/strings";
import type { MetricId } from "@/lib/engine/types";
import type { Pillar } from "@/lib/scoring/pillars";
import { pillOf } from "./keys";
import { MetricSheet } from "./MetricSheet";
import { domId, fill, metricById, stageName } from "./text";
import type { EngineActions, EngineView } from "./view";
import styles from "./Board.module.css";
import ui from "./_ui/ui.module.css";

/**
 * The drawer of one stage (spec §7 E3): its three numbers, the ★ first and
 * open, the two others closed — one click each, because a drawer that opens
 * three forms at once is a page, not a drawer.
 *
 * Rendered right after its row in the DOM, so on a phone it unfolds UNDER
 * the row it belongs to (no modal, no bottom sheet), and a keyboard user
 * tabs from the row straight into it; from 960px up the board's grid lifts
 * it into the sticky right-hand column (Board.module.css).
 *
 * The title takes focus when the drawer is opened by a person (R-19), never
 * on the first paint of the board; `initiallyOpen` lets "Fill in" from the
 * collect list and "Continue" from the resume band land on the right number.
 */
export function StageDrawer({
  id,
  stage,
  index,
  view,
  actions,
  initiallyOpen,
  onClose,
}: {
  id: string;
  stage: Pillar;
  index: number;
  view: EngineView;
  actions: EngineActions;
  initiallyOpen: MetricId | null;
  /** Absent in the wide layout, where the drawer is always there and a row click switches it. */
  onClose?: () => void;
}) {
  const { strings } = view;
  const shapes = metricsOfStage(stage);
  const snapshot = view.state.snapshots[view.state.snapshots.length - 1]!;
  const [open, setOpen] = useState<ReadonlySet<MetricId>>(
    () => new Set([shapes[0]!.id, ...(initiallyOpen ? [initiallyOpen] : [])]),
  );
  const toggle = (metricId: MetricId) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(metricId)) next.delete(metricId);
      else next.add(metricId);
      return next;
    });

  return (
    <section id={id} className={styles.drawer} aria-labelledby={`${id}-title`} data-testid="engine-drawer" data-stage={stage}>
      <div className={styles.drawerHead}>
        <p className={styles.drawerEyebrow}>{fill(strings.sheet.stageEyebrow, { i: index, stage: stageName(stage) })}</p>
        <h3 id={`${id}-title`} className={styles.drawerTitle} tabIndex={-1}>
          {stageName(stage)}
        </h3>
        {onClose ? (
          <button type="button" className={[ui.linkButton, styles.drawerClose].join(" ")} onClick={onClose} data-testid="engine-drawer-close">
            {strings.sheet.close}
          </button>
        ) : null}
      </div>

      {shapes.map((shape) => {
        const metric = metricById(view.metrics, shape.id);
        const status = snapshot.metrics[shape.id]?.status ?? "todo";
        const isOpen = open.has(shape.id);
        const bodyId = `engine-metric-body-${domId(shape.id)}`;
        const kind = pillOf(status);
        return (
          <div key={shape.id} className={styles.metric}>
            <h4 className={styles.metricHeading}>
              <button
                type="button"
                id={`engine-metric-${domId(shape.id)}`}
                className={styles.metricToggle}
                aria-expanded={isOpen}
                aria-controls={bodyId}
                onClick={() => toggle(shape.id)}
                data-testid={`engine-metric-${domId(shape.id)}`}
              >
                <span className={styles.metricName}>{metric.name}</span>
                {/* Ink for found, outline for the rest — never the red tag: its 11px label on the
                    road-paint red is 4.42:1, under AA for text this small (R-22). */}
                <Tag tone={kind === "found" ? "ink" : "outline"} className={styles.metricStatus}>
                  {strings.status[STATUS_KEY[status]]}
                </Tag>
                <span className={styles.metricMarker} aria-hidden="true" data-open={isOpen ? "true" : "false"} />
              </button>
            </h4>
            {isOpen ? (
              <div id={bodyId} className={styles.metricBody}>
                <MetricSheet id={shape.id} view={view} actions={actions} />
              </div>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
