"use client";

import { Button } from "@/components/core/Button";
import { windowDaysOf } from "@/lib/engine/cohort";
import { shapeOf } from "@/lib/engine/catalog-shape";
import { EFFORT_KEY, ROLE_KEY } from "@/lib/engine/strings";
import type { MetricId } from "@/lib/engine/types";
import type { CollectPlan } from "./collect";
import { RequestCopy } from "./RequestCopy";
import { catalogFill, daysBetween, domId, fill, metricById } from "./text";
import type { EngineActions, EngineView } from "./view";
import styles from "./Screens.module.css";

/**
 * "To go and get" (spec §7 E4) — the collection, planned rather than
 * listed: what you can pull yourself now, and one message per person for
 * the rest, so the requests go out today and come back while you fill the
 * others in. "To ask for" comes first in the DOM: those are the slowest to
 * return, and on a phone the lists stack in reading order.
 */
export function CollectHub({ plan, view, actions }: { plan: CollectPlan; view: EngineView; actions: EngineActions }) {
  const { strings, ctx } = view;
  const snapshot = view.state.snapshots[view.state.snapshots.length - 1]!;
  const name = (id: MetricId) => metricById(view.metrics, id).name;

  if (plan.count === 0) {
    return (
      <section className={styles.collect} aria-labelledby="engine-collect-title" data-testid="engine-collect">
        <h3 id="engine-collect-title" className={styles.sectionTitle}>
          {strings.collect.title}
        </h3>
        <p className={styles.lead}>{strings.collect.empty}</p>
      </section>
    );
  }

  return (
    <section className={styles.collect} aria-labelledby="engine-collect-title" data-testid="engine-collect">
      <h3 id="engine-collect-title" className={styles.sectionTitle}>
        {strings.collect.title}
      </h3>
      <p className={styles.lead}>{strings.collect.hint}</p>
      <div className={styles.collectColumns}>
        {plan.ask.length ? (
          <div className={styles.collectColumn} data-testid="engine-collect-ask">
            <h4 className={styles.columnTitle}>{strings.collect.ask}</h4>
            {plan.ask.map((group) => (
              <div key={group.role} className={styles.roleGroup} data-testid={`engine-collect-role-${group.role}`}>
                <h5 className={styles.roleTitle}>{strings.role[ROLE_KEY[group.role]]}</h5>
                <ul className={styles.items}>
                  {[...group.stale, ...group.requested.filter((id) => !group.stale.includes(id)), ...group.toAsk].map((id) => {
                    const entry = snapshot.metrics[id];
                    const since = entry?.request?.remindedAt ?? entry?.request?.requestedAt;
                    return (
                      <li key={id} className={styles.item}>
                        <span className={styles.itemName}>{name(id)}</span>
                        {group.stale.includes(id) && since ? (
                          <span className={styles.itemStale}>{fill(strings.request.stale, { n: daysBetween(since, ctx.today) })}</span>
                        ) : entry?.status === "requested" ? (
                          <span className={styles.itemMeta}>{strings.status.requested}</span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                <div className={styles.groupActions}>
                  {/* Mounted even once emptied, so a copy's confirmation (or its fallback text) outlives the list it emptied. */}
                  <RequestCopy
                    key={`ask-${group.role}`}
                    role={group.role}
                    ids={group.toAsk}
                    label={group.toAsk.length === 1 ? strings.request.copy : fill(strings.request.copyGroup, { n: group.toAsk.length })}
                    view={view}
                    onCopied={() => actions.markRequested(group.toAsk, group.role)}
                  />
                  <RequestCopy
                    key={`remind-${group.role}`}
                    role={group.role}
                    ids={group.stale}
                    label={strings.request.remind}
                    view={view}
                    variant="quiet"
                    onCopied={() => actions.markReminded(group.stale)}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {plan.byTool?.length ? (
          // The team's tools ticked (§19.5.2): each number under the first of them its `where` cites, with that tool's path.
          <div className={styles.collectColumn} data-testid="engine-collect-self">
            <h4 className={styles.columnTitle}>{strings.collect.self}</h4>
            <p className={styles.itemMeta}>{strings.collect.byToolHint}</p>
            {plan.byTool.map((group) => (
              <div key={group.tool} className={styles.roleGroup} data-testid={`engine-collect-tool-${group.tool}`}>
                <h5 className={styles.roleTitle}>{strings.tools[group.tool]}</h5>
                <ul className={styles.items}>
                  {group.ids.map((id) => {
                    const metric = metricById(view.metrics, id);
                    const raw = metric.where.find((w) => w.source.kind === "tool" && w.source.tool === group.tool)?.path;
                    // The sheet's own filling ({event}, {n}, {cohort}, {period}): the same path, word for word.
                    const shape = shapeOf(id);
                    const path = raw
                      ? catalogFill(raw, {
                          state: view.state,
                          locale: ctx.locale,
                          strings,
                          metrics: view.metrics,
                          windowDays: shape.window ? windowDaysOf(shape, view.state.setup) : null,
                          period: { id, today: ctx.today },
                        })
                      : null;
                    return (
                      <li key={id} className={styles.item}>
                        <span className={styles.itemName}>
                          {name(id)}
                          {path ? <span className={styles.itemPath}>{path}</span> : null}
                        </span>
                        <Button variant="quiet" onClick={() => actions.openMetric(id)} data-testid={`engine-fill-${domId(id)}`}>
                          {strings.collect.fill}
                          <span className="tdg-visually-hidden"> — {name(id)}</span>
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        ) : plan.self.length ? (
          <div className={styles.collectColumn} data-testid="engine-collect-self">
            <h4 className={styles.columnTitle}>{strings.collect.self}</h4>
            {plan.self.map((group) => (
              <div key={group.effort} className={styles.roleGroup}>
                <h5 className={styles.roleTitle}>{strings.effort[EFFORT_KEY[group.effort]]}</h5>
                <ul className={styles.items}>
                  {group.ids.map((id) => (
                    <li key={id} className={styles.item}>
                      <span className={styles.itemName}>{name(id)}</span>
                      <Button variant="quiet" onClick={() => actions.openMetric(id)} data-testid={`engine-fill-${domId(id)}`}>
                        {strings.collect.fill}
                        {/* Five "Fill in" buttons read alike in a screen reader's list of controls: each names its number. */}
                        <span className="tdg-visually-hidden"> — {name(id)}</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
