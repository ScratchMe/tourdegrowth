import { Card } from "@/components/core/Card";
import { candidatesOf } from "@/lib/engine/catalog-shape";
import { knownSharedCount } from "@/lib/engine/shared-counts";
import type { CandidateId, Interval, MotionDerived } from "@/lib/engine/types";
import { knownIn } from "@/lib/engine/values";
import { Coverage } from "./Coverage";
import { Diagnosis } from "./Diagnosis";
import { Peloton } from "./Peloton";
import { PipelineBand } from "./PipelineBand";
import { Relays } from "./Relays";
import type { EngineActions, EngineView } from "./view";
import styles from "./Board.module.css";
import { previousLeakLine } from "./series-view";

type PlgDerived = Extract<MotionDerived, { motion: "plg" }>;
type SlgDerived = Extract<MotionDerived, { motion: "slg" }>;

/**
 * The hybrid's two motions side by side (engine spec §18.7 E2, Q10, Q12):
 * each column its motion's name, its coverage chips, its diagnosis — the
 * motion named in its eyebrow — and its funnel in the compact format. Then
 * the fixed sentence under the two diagnoses (§18.6.4, rule 4).
 *
 * Self-serve on the left (first, on a phone), whatever the values: the order
 * is fixed and says nothing. The columns share their row tracks, so neither
 * one's height reads as a size. No amount here (Q12): a leak's money exists
 * only on its own slide.
 */
export function MotionColumns({ view, actions, readOnly }: { view: EngineView; actions?: EngineActions; readOnly?: boolean }) {
  const { strings, state, ctx, derived } = view;
  const plgD = derived.motions.find((m): m is PlgDerived => m.motion === "plg");
  const slgD = derived.motions.find((m): m is SlgDerived => m.motion === "slg");
  if (!plgD || !slgD) return null;
  const snapshot = state.snapshots[state.snapshots.length - 1]!;
  const values: Partial<Record<CandidateId, Interval>> = {};
  for (const id of [...candidatesOf("plg"), ...candidatesOf("slg")]) {
    const known = knownIn(state, id, ctx);
    if (known.kind === "known") values[id] = known.value;
  }

  return (
    <>
      <div className={styles.motionColumns} data-testid="engine-motion-columns">
        <section className={styles.motionColumn} data-testid="engine-column-plg" aria-labelledby="engine-column-plg-title">
          <h2 id="engine-column-plg-title" className={styles.motionEyebrow}>
            {strings.hybrid.motionName.plg}
          </h2>
          <Coverage coverage={plgD.coverage} strings={strings} />
          <Diagnosis diagnosis={plgD.diagnosis} strings={strings} locale={ctx.locale} metrics={view.metrics} values={values} motionName={strings.hybrid.motionName.plg} previous={previousLeakLine(view, "plg")} />
          <Card elevation="flat" className={styles.pelotonCard} data-testid="engine-board-peloton">
            <Peloton
              peloton={plgD.peloton}
              strings={strings}
              locale={ctx.locale}
              cohortMonth={snapshot.cohortMonth}
              paidWindowDays={state.setup.paidWindowDays}
              diagnosis={plgD.diagnosis}
              cohortSignups={knownSharedCount(snapshot, "cohortSignups")?.value ?? null}
              compact
            />
          </Card>
        </section>
        <section className={styles.motionColumn} data-testid="engine-column-slg" aria-labelledby="engine-column-slg-title">
          <h2 id="engine-column-slg-title" className={styles.motionEyebrow}>
            {strings.hybrid.motionName.slg}
          </h2>
          <Coverage coverage={slgD.coverage} strings={strings} />
          <Diagnosis diagnosis={slgD.diagnosis} strings={strings} locale={ctx.locale} metrics={view.metrics} values={values} motionName={strings.hybrid.motionName.slg} previous={previousLeakLine(view, "slg")} />
          <Card elevation="flat" className={styles.pelotonCard} data-testid="engine-board-relays">
            <Relays relays={slgD.relays} state={state} strings={strings} locale={ctx.locale} diagnosis={slgD.diagnosis} compact />
            {actions ? <PipelineBand key={snapshot.id} view={view} actions={actions} readOnly={readOnly} /> : null}
          </Card>
        </section>
      </div>
      <p className={styles.twoSegments} data-testid="engine-two-segments">
        {strings.hybrid.twoEngines}
      </p>
    </>
  );
}
