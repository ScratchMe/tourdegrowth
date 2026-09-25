"use client";

import { Button } from "@/components/core/Button";
import { ROLE_KEY } from "@/lib/engine/strings";
import type { MetricId } from "@/lib/engine/types";
import { cheapestTodo, type CollectPlan } from "./collect";
import { RequestCopy } from "./RequestCopy";
import { daysBetween, fill, metricById, midSentence } from "./text";
import type { EngineActions, EngineView } from "./view";
import styles from "./Screens.module.css";

/**
 * The band a returning person sees first (spec §7 E6): how far they got,
 * how long ago, and what is waiting on someone else — with two ways back
 * in. "Continue" opens the cheapest number still to fill, NEVER "the last
 * screen visited": one source of truth, the stored statuses, the same rule
 * as the Tour's resume. "Follow up" re-copies the oldest group's request.
 *
 * Composed from three short pieces rather than `resume.band`'s one sentence:
 * that template bakes in "{days} days" and a pending clause, which reads
 * "1 days" the day after and has nothing to say when nothing is pending —
 * reported to P3 as a copy gap rather than patched by string surgery here.
 */
export function ResumeBand({
  returningFrom,
  plan,
  view,
  actions,
}: {
  returningFrom: string;
  plan: CollectPlan;
  view: EngineView;
  actions: EngineActions;
}) {
  const { strings, ctx, derived } = view;
  const snapshot = view.state.snapshots[view.state.snapshots.length - 1]!;
  const cov = derived.coverage;
  const days = daysBetween(returningFrom, ctx.today);
  const staleGroup = plan.ask.find((g) => g.stale.length > 0);
  const next: MetricId | null = cheapestTodo(snapshot);

  const found = cov.found === 1 ? fill(strings.coverage.foundOne, { N: cov.denominator }) : fill(strings.coverage.found, { n: cov.found, N: cov.denominator });
  const visit = days === 0 ? null : days === 1 ? strings.workbench.lastVisitOne : fill(strings.workbench.lastVisit, { n: days });
  const pending = staleGroup
    ? fill(staleGroup.stale.length === 1 ? strings.resume.pendingRequestsOne : strings.resume.pendingRequests, {
        n: staleGroup.stale.length,
        role: strings.role[ROLE_KEY[staleGroup.role]],
        metric: midSentence(metricById(view.metrics, staleGroup.stale[0]!).name, ctx.locale),
      })
    : null;

  return (
    <div className={styles.resume} data-testid="engine-resume">
      <p className={styles.resumeText}>{[found, visit, pending].filter(Boolean).join(" · ")}</p>
      <div className={styles.resumeActions}>
        {next ? (
          <Button variant="secondary" onClick={() => actions.openMetric(next)} data-testid="engine-resume-continue">
            {strings.resume.continue}
          </Button>
        ) : null}
        {/* Kept mounted once the follow-up empties the stale list, so its confirmation stays (see RequestCopy). */}
        <RequestCopy
          role={staleGroup?.role ?? "data"}
          ids={staleGroup?.stale ?? []}
          label={staleGroup ? fill(strings.resume.remind, { role: strings.role[ROLE_KEY[staleGroup.role]] }) : ""}
          view={view}
          variant="quiet"
          onCopied={() => staleGroup && actions.markReminded(staleGroup.stale)}
        />
      </div>
    </div>
  );
}
