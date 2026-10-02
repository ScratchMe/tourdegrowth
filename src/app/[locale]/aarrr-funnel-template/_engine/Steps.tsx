"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { NumberField } from "@/components/core/NumberField";
import { isUnreadableNumber } from "@/lib/forms/number";
import { candidatesOf } from "@/lib/engine/catalog-shape";
import { totalIn12 } from "@/lib/engine/deck-motions";
import { isAnswerMetric } from "@/lib/engine/phrases";
import { knownSharedCount } from "@/lib/engine/shared-counts";
import type { MetricId, SharedCount } from "@/lib/engine/types";
import { MetricSheet } from "./MetricSheet";
import { SlgWhatIfPanel } from "./SlgWhatIfPanel";
import {
  STEP_PHASES,
  nextGroupStart,
  nextPosition,
  numberPlace,
  numberSequence,
  phaseOf,
  previousPosition,
  type StepPhase,
  type StepPosition,
} from "./steps-model";
import { percentUnit } from "./sources";
import { catalogFill, fill, metricById } from "./text";
import type { EngineActions, EngineView } from "./view";
import { WhatIfPanel } from "./WhatIfPanel";
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
  const motions = view.state.setup.motions;
  const hybrid = motions.plg && motions.slg;
  const next = () => go(nextPosition(position, motions));
  const back = () => go(previousPosition(position, motions));
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
          {/* One screen, one group per motion ticked, self-serve first (§18.7); the group headings only in the hybrid. */}
          {(["plg", "slg"] as const)
            .filter((m) => motions[m])
            .map((m) => (
              <div key={m} className={styles.targets} data-testid={`engine-steps-targets-${m}`}>
                {hybrid ? <h3 className={styles.groupTitle}>{view.strings.hybrid.motionName[m]}</h3> : null}
                {candidatesOf(m).map((id) => (
                  <TargetInput key={id} id={id} view={view} actions={actions} />
                ))}
              </div>
            ))}
          <div className={styles.nav}>
            <Button onClick={next} data-testid="engine-steps-next">
              {s.continue}
            </Button>
          </div>
        </Card>
      ) : null}

      {position.phase === "base" && (position.motion ?? "plg") === "plg" ? <BaseStep view={view} actions={actions} heading={heading} onBack={back} onNext={next} /> : null}
      {position.phase === "base" && position.motion === "slg" ? <SlgBaseStep view={view} actions={actions} heading={heading} onBack={back} onNext={next} /> : null}

      {position.phase === "number" ? (
        <NumberStep
          index={position.index}
          view={view}
          actions={actions}
          heading={heading}
          onBack={back}
          onNext={next}
          onSkipGroup={() => {
            const start = nextGroupStart(position.index, motions);
            go(start === null ? { phase: "whatif" } : { phase: "number", index: start });
          }}
        />
      ) : null}

      {position.phase === "whatif" ? (
        <div className={styles.whatif}>
          <h2 id="engine-steps-title" ref={heading} tabIndex={-1} className={styles.title}>
            {s.whatIfTitle}
          </h2>
          {/* Both panels in the hybrid, self-serve first, and the one line that adds them (§18.5.5). */}
          {motions.plg ? <WhatIfPanel view={view} onChange={actions.setWhatIf} /> : null}
          {motions.slg ? <SlgWhatIfPanel view={view} onChange={actions.setWhatIf} /> : null}
          {hybrid ? <TotalIn12Line view={view} /> : null}
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
  return (
    <NumberField
      id={`engine-step-target-${id.replace(/\./g, "-")}`}
      label={fill(view.strings.steps.targetFor, { metric: metric.name })}
      hint={metric.oneLiner}
      value={value}
      onChange={setValue}
      onBlur={(event) => {
        // An unreadable box stays on screen with its message and writes
        // nothing: the stored target is not erased by a typo (A15.2).
        if (isUnreadableNumber(event.target.value, view.ctx.locale)) return;
        if ((value ?? undefined) !== target) actions.setTarget(id, value);
      }}
      locale={view.ctx.locale}
      digits={5}
      {...percentUnit(view.ctx.locale)}
      parseError={view.strings.workbench.notANumber}
    />
  );
}

/**
 * What a base step must not drop in silence (A15.9): a count typed but not
 * readable as a whole number, or not above zero. Both used to be skipped and
 * the step went on, so the person never saw the count was not kept. The text
 * is read from the box itself: its value is `null` both empty and unreadable.
 */
function firstUnkept(fields: { id: string; value: number | null }[], locale: "en" | "fr"): { id: string; notPositive: boolean } | null {
  for (const f of fields) {
    const raw = (document.getElementById(f.id) as HTMLInputElement | null)?.value ?? "";
    if (isUnreadableNumber(raw, locale, true)) return { id: f.id, notPositive: false };
    if (f.value !== null && f.value <= 0) return { id: f.id, notPositive: true };
  }
  return null;
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

  const [notPositive, setNotPositive] = useState<string | null>(null);

  function save() {
    const stop = firstUnkept(
      [
        { id: "engine-base-cohort", value: cohort },
        { id: "engine-base-month", value: month },
      ],
      view.ctx.locale,
    );
    if (stop) {
      setNotPositive(stop.notPositive ? stop.id : null);
      document.getElementById(stop.id)?.focus();
      return;
    }
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
        <NumberField
          id="engine-base-cohort"
          label={cohortLabel}
          error={notPositive === "engine-base-cohort" && (cohort === null || cohort <= 0) ? s.countPositive : undefined}
          hint={cohortHint}
          value={cohort}
          onChange={setCohort}
          locale={view.ctx.locale}
          integer
          parseError={view.strings.workbench.notAWholeNumber}
        />
        <NumberField
          id="engine-base-month"
          label={monthLabel}
          error={notPositive === "engine-base-month" && (month === null || month <= 0) ? s.countPositive : undefined}
          hint={monthHint}
          value={month}
          onChange={setMonth}
          locale={view.ctx.locale}
          integer
          parseError={view.strings.workbench.notAWholeNumber}
        />
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
  onSkipGroup,
}: {
  index: number;
  view: EngineView;
  actions: EngineActions;
  heading: React.RefObject<HTMLHeadingElement | null>;
  onBack: () => void;
  onNext: () => void;
  /** « Passer à l'assisté → » / « Passer aux « Et si » → » (§18.7): past the rest of this motion's numbers. */
  onSkipGroup: () => void;
}) {
  const s = view.strings.steps;
  const motions = view.state.setup.motions;
  const shape = numberSequence(motions)[index]!;
  const place = numberPlace(index, motions);
  // Numbered within its motion — « Assisté · chiffre 4 sur 15 », never « 21 sur 32 » — once there is more than self-serve.
  const motionLabel = place.group === "link" ? view.strings.hybrid.linkBlock : view.strings.hybrid.motionName[place.group];
  const single = !motions.slg;
  const values = { i: place.i, n: place.n, stage: view.strings.stages[shape.stage], motion: motionLabel };
  const answer = isAnswerMetric(shape.id);
  const skip = motions.plg && motions.slg && place.group === "plg" ? s.skipToSlg : place.group !== "plg" ? s.skipToWhatIf : null;
  return (
    // The sheet is the screen (design system extension 07): it carries the card, the heading and the actions.
    <div className={styles.number} data-testid="engine-steps-number" data-metric={shape.id}>
      <MetricSheet
        key={shape.id}
        id={shape.id}
        view={view}
        actions={actions}
        variant="step"
        onSaved={onNext}
        screen={{
          // « Chiffre 4 sur 15 » over the activation event would call a name a number (Antoine, 2026-09-26).
          position: fill(single ? (answer ? s.answerOf : s.numberOf) : answer ? s.answerOfMotion : s.numberOfMotion, values),
          headingId: "engine-steps-title",
          headingRef: heading,
        }}
        extraActions={
          <>
            <Button variant="quiet" onClick={onBack} data-testid="engine-steps-back">
              {s.back}
            </Button>
            <Button variant="quiet" onClick={onNext} data-testid="engine-steps-skip">
              {s.skip}
            </Button>
            {skip ? (
              <Button variant="quiet" onClick={onSkipGroup} data-testid="engine-steps-skip-group">
                {skip}
              </Button>
            ) : null}
          </>
        }
      />
    </div>
  );
}

/**
 * Sales-assisted's base (§18.7, S6): the three counts several of its numbers
 * share, all on the same three months — the opportunities created, the
 * new-customer deals won, the sales-assisted customers at the flows' month
 * end. Typed once here, reused everywhere, as self-serve's sign-ups.
 */
function SlgBaseStep({
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
  const [opps, setOpps] = useState<number | null>(knownSharedCount(snapshot, "slgOppsCreated")?.value ?? null);
  const [deals, setDeals] = useState<number | null>(knownSharedCount(snapshot, "slgDealsWon")?.value ?? null);
  const [customers, setCustomers] = useState<number | null>(knownSharedCount(snapshot, "slgCustomers")?.value ?? null);
  // Each label is the count's catalogue label, filled with ITS number's three months: one count, one wording.
  const fillFor = (id: MetricId, text: string) =>
    catalogFill(text, { state: view.state, locale: view.ctx.locale, strings: view.strings, metrics: view.metrics, windowDays: null, period: { id, today: view.ctx.today } });
  const fields: { id: string; count: SharedCount; label: string; hint: string; value: number | null; set: (n: number | null) => void }[] = [
    {
      id: "engine-base-slg-opps",
      count: "slgOppsCreated",
      label: fillFor("slg.ref.referred-share", metricById(view.metrics, "slg.ref.referred-share").inputs?.denominator ?? ""),
      hint: fillFor("slg.ref.referred-share", s.baseOppsHint),
      value: opps,
      set: setOpps,
    },
    {
      id: "engine-base-slg-deals",
      count: "slgDealsWon",
      label: fillFor("slg.rev.win-rate", metricById(view.metrics, "slg.rev.win-rate").inputs?.numerator ?? ""),
      hint: fillFor("slg.rev.win-rate", s.baseDealsHint),
      value: deals,
      set: setDeals,
    },
    {
      id: "engine-base-slg-customers",
      count: "slgCustomers",
      label: fillFor("slg.rev.arpa", metricById(view.metrics, "slg.rev.arpa").inputs?.denominator ?? ""),
      hint: fillFor("slg.rev.arpa", s.baseCustomersHint),
      value: customers,
      set: setCustomers,
    },
  ];

  const [notPositive, setNotPositive] = useState<string | null>(null);

  function save() {
    const stop = firstUnkept(fields, view.ctx.locale);
    if (stop) {
      setNotPositive(stop.notPositive ? stop.id : null);
      document.getElementById(stop.id)?.focus();
      return;
    }
    const changed: Partial<Record<SharedCount, number>> = {};
    for (const f of fields) {
      const n = f.value;
      if (n !== null && Number.isInteger(n) && n > 0 && n !== knownSharedCount(snapshot, f.count)?.value) changed[f.count] = n;
    }
    if (Object.keys(changed).length > 0) actions.setBase(changed);
    onNext();
  }

  return (
    <Card elevation="flat" className={styles.card} data-testid="engine-steps-base-slg">
      <h2 id="engine-steps-title" ref={heading} tabIndex={-1} className={styles.title}>
        {s.baseTitleSlg}
      </h2>
      <p className={styles.lead}>{s.baseIntroSlg}</p>
      <div className={styles.targets}>
        {fields.map((f) => (
          <NumberField
            key={f.id}
            id={f.id}
            label={f.label}
            hint={f.hint}
            error={notPositive === f.id && (f.value === null || f.value <= 0) ? s.countPositiveSlg : undefined}
            value={f.value}
            onChange={f.set}
            locale={view.ctx.locale}
            integer
            parseError={view.strings.workbench.notAWholeNumber}
          />
        ))}
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

/** The hybrid's total MRR in twelve months, both panels' what-ifs added (§18.5.5) — a sum, never a comparison. */
function TotalIn12Line({ view }: { view: EngineView }) {
  const { strings, state, ctx } = view;
  const line = totalIn12(state, strings, ctx);
  if (!line) return null;
  const value = line.projected ? fill(strings.scenario.totalIn12Row, { today: line.today, projected: line.projected }) : line.today;
  return (
    <p className={styles.lead} data-testid="engine-total-in12">
      <strong>{strings.scenario.totalIn12}</strong> · {value}
    </p>
  );
}
