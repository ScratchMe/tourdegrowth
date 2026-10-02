"use client";

import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { candidatesOf } from "@/lib/engine/catalog-shape";
import { isUnreadableNumber } from "@/lib/forms/number";
import { TargetInput } from "./TargetInput";
import { domId } from "./text";
import type { EngineActions, EngineView } from "./view";
import styles from "./Steps.module.css";

/**
 * « Cibles », right after the start (C40: kept by Antoine, against the
 * return's recommendation, for a team that has its targets at hand). Every
 * box is optional and the screen is passed in one press, with one label
 * whether a target was typed or not (a label that changed when a box was
 * left changed under the pointer: the copy review of A18 T3.a). The same
 * boxes are on these numbers' own screens and, from A18 T3.d, in the
 * Settings. A box holding text it cannot read stops the move, its message
 * shown and the focus on it: it writes nothing (A15.2), and leaving the
 * screen would drop it unseen.
 *
 * One group per motion ticked, self-serve first; the group headings only in
 * the hybrid (§18.7). The heading takes the focus on arrival: the person
 * pressed « Commence » to get here (R-19).
 */
export function TargetsStart({ view, actions, onNext }: { view: EngineView; actions: EngineActions; onNext: () => void }) {
  const t = view.strings.targetsStart;
  const motions = view.state.setup.motions;
  const hybrid = motions.plg && motions.slg;
  const ids = (["plg", "slg"] as const).filter((m) => motions[m]).flatMap((m) => candidatesOf(m));

  function next() {
    const unread = ids
      .map((id) => document.getElementById(`engine-step-target-${domId(id)}`) as HTMLInputElement | null)
      .find((box) => box !== null && isUnreadableNumber(box.value, view.ctx.locale));
    if (unread) {
      unread.focus();
      return;
    }
    onNext();
  }

  return (
    <Card elevation="flat" className={styles.card} data-testid="engine-targets-start">
      <h2 id="engine-targets-title" tabIndex={-1} className={styles.title}>
        {t.title}
      </h2>
      <p className={styles.lead}>{t.lead}</p>
      {(["plg", "slg"] as const)
        .filter((m) => motions[m])
        .map((m) => (
          <div key={m} className={styles.targets} data-testid={`engine-targets-start-${m}`}>
            {hybrid ? <h3 className={styles.groupTitle}>{view.strings.hybrid.motionName[m]}</h3> : null}
            {candidatesOf(m).map((id) => (
              <TargetInput key={id} id={id} view={view} actions={actions} />
            ))}
          </div>
        ))}
      <div className={styles.nav}>
        <Button onClick={next} data-testid="engine-targets-next">
          {t.go}
        </Button>
      </div>
    </Card>
  );
}
