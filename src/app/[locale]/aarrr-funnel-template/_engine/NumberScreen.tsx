"use client";

import { Button } from "@/components/core/Button";
import { EngineProgress } from "@/components/engine/EngineProgress";
import type { MetricId } from "@/lib/engine/types";
import { numberPosition, numberRemaining } from "./BoardNumbers";
import { MetricSheet } from "./MetricSheet";
import type { EngineActions, EngineView } from "./view";
import styles from "./Screens.module.css";

/**
 * A number's own screen, opened from the board's list (design system
 * extension 07, A18 T2.b): the sheet is the screen — its card, its heading,
 * where the number sits (« Activation · 2 sur 3 ») and what remains
 * (« 6 à faire ») — and « ← Tes chiffres » brings the person back to its row.
 * It replaced a row that unfolded the whole sheet in place, 1,667 px for one
 * number on a phone.
 *
 * Since A18 T3.b it is also the step-by-step, folded into the board: saving
 * leads to the next step (« Enregistre et continue → »), « Passe pour
 * l'instant » leaves the number « à faire » and goes on. A closed month being
 * corrected opens its numbers here too, written back into that month, and
 * only saves: `view` and `actions` are the board's.
 */
export function NumberScreen({
  id,
  view,
  actions,
  onBack,
  next,
  onSkip,
}: {
  id: MetricId;
  view: EngineView;
  actions: EngineActions;
  onBack: () => void;
  /** « Enregistre et continue → » (A18 T3.b): saving leads to the next step. Absent on a past month corrected. */
  next?: { label: string; onSaved: () => void };
  /** « Passe pour l'instant »: the number stays « à faire », and the journey goes on without it. */
  onSkip?: () => void;
}) {
  return (
    <div className={styles.numberScreen} data-testid="engine-number" data-metric={id}>
      <div>
        <Button variant="quiet" onClick={onBack} data-testid="engine-number-back">
          {view.strings.list.back}
        </Button>
      </div>
      <MetricSheet
        key={id}
        id={id}
        view={view}
        actions={actions}
        screen={{
          position: numberPosition(id, view),
          headingId: "engine-number-title",
          progress: <EngineProgress size="sm" remaining={numberRemaining(id, view)} data-testid="engine-number-progress" />,
        }}
        next={next}
        extraActions={
          onSkip ? (
            <Button variant="quiet" onClick={onSkip} data-testid="engine-number-skip">
              {view.strings.sheet.skip}
            </Button>
          ) : null
        }
      />
    </div>
  );
}
