"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { CANDIDATE_IDS, METRIC_SHAPES } from "@/lib/engine/catalog-shape";
import { knownSharedCount } from "@/lib/engine/shared-counts";
import type { MetricId, SharedCount } from "@/lib/engine/types";
import { MetricSheet } from "./MetricSheet";
import { STEP_PHASES, NUMBER_COUNT, nextPosition, phaseOf, previousPosition, type StepPhase, type StepPosition } from "./steps-model";
import { catalogFill, fill, metricById } from "./text";
import type { EngineActions, EngineView } from "./view";
import { WhatIfPanel } from "./WhatIfPanel";
import { describedBy, Field } from "./_ui/Field";
import { NumberField } from "./_ui/NumberField";
import styles from "./Steps.module.css";

/**
 * The step-by-step (Antoine, 2026-09-25): the same engine as the board, one
 * thing on screen at a time, in the big steps he named — the targets the
 * team already has, then the numbers with their definitions (the base first,
 * then one number per screen), then « et si » on the whole funnel, then the
 * slides. The board stays for whoever knows the tool or comes back to change
 * one number (« Voir le tableau complet », at every step).
 *
 * Nothing here writes differently from the board: the same `actions`, the
 * same sheet (`MetricSheet variant="step"`). A number skipped stays « à
 * faire », exactly as if nobody had opened it.
 */
export function Steps({
  view,
  actions,
  initial,
  onBoard,
  onDeck,
  onSave,
}: {
  view: EngineView;
  actions: EngineActions;
  initial: StepPosition;
  onBoard: () => void;
  onDeck: () => void;
  onSave: () => void;
}) {
  const s = view.strings.steps;
  const [position, setPosition] = useState<StepPosition>(initial);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  // The heading takes the focus when a PERSON moved (R-19) — never on arrival.
  useEffect(() => {
    if (moved.current) heading.current?.focus();
  }, [position]);

  const go = (next: StepPosition) => {
    moved.current = true;
    setPosition(next);
  };
  const next = () => go(nextPosition(position));
  const back = () => go(previousPosition(position));
  const current = phaseOf(position);
  const phaseLabel: Record<StepPhase, string> = {
    targets: s.phaseTargets,
    numbers: s.phaseNumbers,
    whatif: s.phaseWhatIf,
    deck: s.phaseDeck,
  };

  return (
    <section className={styles.steps} data-testid="engine-steps" data-phase={position.phase} aria-labelledby="engine-steps-title">
      <header className={styles.head}>
        <nav aria-label={s.label}>
          <ol className={styles.phases}>
            {STEP_PHASES.map((phase, i) => (
              <li
                key={phase}
                className={[styles.phase, phase === current ? styles.current : ""].filter(Boolean).join(" ")}
                aria-current={phase === current ? "step" : undefined}
              >
                <span className={styles.phaseNumber}>{i + 1}</span>
                {phaseLabel[phase]}
              </li>
            ))}
          </ol>
        </nav>
        <Button variant="quiet" onClick={onBoard} data-testid="engine-steps-board">
          {s.toBoard}
        </Button>
      </header>

      {position.phase === "targets" ? (
        <Card elevation="flat" className={styles.card}>
          <h2 id="engine-steps-title" ref={heading} tabIndex={-1} className={styles.title}>
            {s.targetsTitle}
          </h2>
          <p className={styles.lead}>{s.targetsIntro}</p>
          <div className={styles.targets}>
            {CANDIDATE_IDS.map((id) => (
              <TargetInput key={id} id={id} view={view} actions={actions} />
            ))}
          </div>
          <div className={styles.nav}>
            <Button onClick={next} data-testid="engine-steps-next">
              {s.continue}
            </Button>
          </div>
        </Card>
      ) : null}

      {position.phase === "base" ? <BaseStep view={view} actions={actions} heading={heading} onBack={back} onNext={next} /> : null}

      {position.phase === "number" ? (
        <NumberStep index={position.index} view={view} actions={actions} heading={heading} onBack={back} onNext={next} />
      ) : null}

      {position.phase === "whatif" ? (
        <div className={styles.whatif}>
          <h2 id="engine-steps-title" ref={heading} tabIndex={-1} className={styles.title}>
            {s.whatIfTitle}
          </h2>
          <WhatIfPanel view={view} />
          <div className={styles.nav}>
            <Button variant="quiet" onClick={back}>
              {s.back}
            </Button>
            <Button onClick={next} data-testid="engine-steps-next">
              {s.continue}
            </Button>
          </div>
        </div>
      ) : null}

      {position.phase === "done" ? (
        <Card elevation="flat" className={styles.card} data-testid="engine-steps-done">
          <h2 id="engine-steps-title" ref={heading} tabIndex={-1} className={styles.title}>
            {s.doneTitle}
          </h2>
          <p className={styles.lead}>{s.doneBody}</p>
          <div className={styles.nav}>
            <Button onClick={onDeck} data-testid="engine-steps-deck">
              {view.strings.actions.deck}
            </Button>
            <Button variant="secondary" onClick={onSave}>
              {view.strings.actions.save}
            </Button>
            <Button variant="quiet" onClick={onBoard}>
              {s.toBoard}
            </Button>
          </div>
        </Card>
      ) : null}
    </section>
  );
}

/** A team target for one of the numbers that can name the stage holding you back — written on blur, like the sheet's. */
function TargetInput({ id, view, actions }: { id: MetricId; view: EngineView; actions: EngineActions }) {
  const snapshot = view.state.snapshots[view.state.snapshots.length - 1]!;
  const target = snapshot.targets[id];
  const [value, setValue] = useState<number | null>(target ?? null);
  const metric = metricById(view.metrics, id);
  const fieldId = `engine-step-target-${id.replace(/\./g, "-")}`;
  return (
    <div
      onBlur={() => {
        if ((value ?? undefined) !== target) actions.setTarget(id, value);
      }}
    >
      <Field label={fill(view.strings.steps.targetFor, { metric: metric.name })} hint={metric.oneLiner} htmlFor={fieldId}>
        <NumberField
          id={fieldId}
          value={value}
          onChange={setValue}
          locale={view.ctx.locale}
          unit="%"
          describedBy={describedBy(fieldId, { hint: metric.oneLiner })}
          invalidMessage={view.strings.workbench.notANumber}
        />
      </Field>
    </div>
  );
}

/** « Ta base » — the counts several numbers share, typed once (shared-counts.ts). */
function BaseStep({
  view,
  actions,
  heading,
  onBack,
  onNext,
}: {
  view: EngineView;
  actions: EngineActions;
  heading: React.RefObject<HTMLHeadingElement | null>;
  onBack: () => void;
  onNext: () => void;
}) {
  const s = view.strings.steps;
  const snapshot = view.state.snapshots[view.state.snapshots.length - 1]!;
  const [cohort, setCohort] = useState<number | null>(knownSharedCount(snapshot, "cohortSignups")?.value ?? null);
  const [month, setMonth] = useState<number | null>(knownSharedCount(snapshot, "monthSignups")?.value ?? null);
  const fillCatalog = (text: string) =>
    catalogFill(text, { state: view.state, locale: view.ctx.locale, strings: view.strings, metrics: view.metrics, windowDays: null });
  const cohortLabel = fillCatalog(metricById(view.metrics, "act.rate").inputs?.denominator ?? "");
  const monthLabel = fillCatalog(metricById(view.metrics, "acq.signup-rate").inputs?.numerator ?? "");
  const cohortHint = fillCatalog(s.baseCohortHint);
  const monthHint = fillCatalog(s.baseMonthHint);

  function save() {
    const pairs: [SharedCount, number | null][] = [
      ["cohortSignups", cohort],
      ["monthSignups", month],
    ];
    const changed: Partial<Record<SharedCount, number>> = {};
    for (const [count, n] of pairs) {
      if (n !== null && Number.isInteger(n) && n > 0 && n !== knownSharedCount(snapshot, count)?.value) changed[count] = n;
    }
    if (Object.keys(changed).length > 0) actions.setBase(changed);
    onNext();
  }

  return (
    <Card elevation="flat" className={styles.card} data-testid="engine-steps-base">
      <h2 id="engine-steps-title" ref={heading} tabIndex={-1} className={styles.title}>
        {s.baseTitle}
      </h2>
      <p className={styles.lead}>{s.baseIntro}</p>
      <div className={styles.targets}>
        <Field label={cohortLabel} hint={cohortHint} htmlFor="engine-base-cohort">
          <NumberField
            id="engine-base-cohort"
            value={cohort}
            onChange={setCohort}
            locale={view.ctx.locale}
            integer
            describedBy={describedBy("engine-base-cohort", { hint: cohortHint })}
            invalidMessage={view.strings.workbench.notAWholeNumber}
          />
        </Field>
        <Field label={monthLabel} hint={monthHint} htmlFor="engine-base-month">
          <NumberField
            id="engine-base-month"
            value={month}
            onChange={setMonth}
            locale={view.ctx.locale}
            integer
            describedBy={describedBy("engine-base-month", { hint: monthHint })}
            invalidMessage={view.strings.workbench.notAWholeNumber}
          />
        </Field>
      </div>
      <div className={styles.nav}>
        <Button variant="quiet" onClick={onBack}>
          {s.back}
        </Button>
        <Button onClick={save} data-testid="engine-steps-next">
          {s.continue}
        </Button>
      </div>
    </Card>
  );
}

/** One number per screen: the board's own sheet, and « passer » for what isn't at hand. */
function NumberStep({
  index,
  view,
  actions,
  heading,
  onBack,
  onNext,
}: {
  index: number;
  view: EngineView;
  actions: EngineActions;
  heading: React.RefObject<HTMLHeadingElement | null>;
  onBack: () => void;
  onNext: () => void;
}) {
  const s = view.strings.steps;
  const shape = METRIC_SHAPES[index]!;
  const metric = metricById(view.metrics, shape.id);
  return (
    <Card elevation="flat" className={styles.card} data-testid="engine-steps-number" data-metric={shape.id}>
      <p className={styles.eyebrow}>
        {fill(s.numberOf, { i: index + 1, n: NUMBER_COUNT, stage: view.strings.stages[shape.stage] })}
      </p>
      <h2 id="engine-steps-title" ref={heading} tabIndex={-1} className={styles.title}>
        {metric.name}
      </h2>
      <MetricSheet key={shape.id} id={shape.id} view={view} actions={actions} variant="step" onSaved={onNext} />
      <div className={styles.nav}>
        <Button variant="quiet" onClick={onBack} data-testid="engine-steps-back">
          {s.back}
        </Button>
        <Button variant="quiet" onClick={onNext} data-testid="engine-steps-skip">
          {s.skip}
        </Button>
      </div>
    </Card>
  );
}
