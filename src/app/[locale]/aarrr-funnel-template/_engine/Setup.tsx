"use client";

import { useId, useState } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { METRIC_SHAPES, SLG_METRIC_SHAPES, TEXT_LIMITS, shapeOf } from "@/lib/engine/catalog-shape";
import type { EngineStrings } from "@/lib/engine/strings";
import type { Currency, EngineSetup, Motion, YearMonth } from "@/lib/engine/types";
import { SETUP_V2_DEFAULTS } from "@/lib/engine/types";
import type { StoredResult } from "@/lib/quiz/storage";
import { defaultReferenceMonth, defaultSpanEnd, matureCohortMonth, monthsBefore, nextMonth } from "@/lib/engine/cohort";
import { formatMonthRange } from "@/lib/engine/format";
import { fill, formatDate, formatMonth } from "./text";
import { Checkbox } from "@/components/core/Checkbox";
import { Choices } from "@/components/core/Choices";
import { DateField } from "@/components/core/DateField";
import { Field } from "@/components/core/Field";
import { Segmented } from "@/components/core/Segmented";
import { Select } from "@/components/core/Select";
import { TextField } from "@/components/core/TextField";
import { monthsEndingAt } from "@/lib/forms/date";
import styles from "./Screens.module.css";

const CURRENCIES: readonly Currency[] = ["EUR", "USD", "GBP", "CHF"];
const WINDOWS = [30, 60, 90] as const;
type Window = (typeof WINDOWS)[number];
const MOTIONS: readonly Motion[] = ["plg", "slg"];

export interface SetupChoice {
  setup: EngineSetup;
  referenceMonth: YearMonth;
  cohortMonth: YearMonth;
  /** The Tour result to compare with, when the person kept the box ticked. */
  tourResultId: string | null;
  /** How to fill it in (Antoine, 2026-09-25): one number at a time, or the whole board. */
  start: "steps" | "board";
}

/**
 * The setup card (spec §7 E1), one card ≤ 560 px at every width: the
 * model, the two months the numbers belong to, the currency and the two
 * windows that are part of the definitions, an optional name for the
 * slides, and — when a Tour with answers is on this device — whether to
 * compare with it.
 *
 * The cohort follows the payment window until the person picks one: "the
 * cohort you follow" is the last month whose sign-ups have all had the
 * longest window to pay, and a longer window pushes it back (§6.3). Once
 * chosen by hand it stays — a default that moved under a deliberate choice
 * would be worse than none.
 *
 * The Tour box says it READS the Tour and copies nothing (D13): only the
 * result's id is stored, and a Tour erased later simply unlinks.
 */
export function Setup({
  strings,
  locale,
  today,
  tour,
  onStart,
  onImport,
  onExample,
  initial,
  existing,
  linked,
  onCancel,
}: {
  strings: EngineStrings;
  locale: "en" | "fr";
  today: Date;
  tour: StoredResult | null;
  onStart: (choice: SetupChoice) => void;
  onImport?: () => void;
  /** « Voir un exemple rempli » — only offered before an engine exists, in the motions ticked (§18.7). */
  onExample?: (motions: Record<Motion, boolean>) => void;
  /**
   * Editing the settings of an engine that exists (Antoine, 2026-09-25: they
   * could not be changed without erasing everything). The card opens on them,
   * says what a change would reset, and saves or cancels.
   */
  initial?: { setup: EngineSetup; referenceMonth: YearMonth; cohortMonth: YearMonth };
  /** Which numbers a change of window would send back to "to fill in", and how many each motion keeps (§18.1.2). */
  existing?: { activation: boolean; paid: boolean; qualification: boolean; goLive: boolean; any: boolean; entered: Record<Motion, number> };
  /** In the settings: whether the engine is linked to a Tour now — the box opens on it (C8). */
  linked?: boolean;
  onCancel?: () => void;
}) {
  const s = strings.setup;
  const editing = Boolean(initial);
  const id = useId();
  const lastClosed = defaultReferenceMonth(today);
  const [currency, setCurrency] = useState<Currency>(initial?.setup.currency ?? "EUR");
  const [activation, setActivation] = useState<EngineSetup["activationWindowDays"]>(initial?.setup.activationWindowDays ?? 7);
  const [paid, setPaid] = useState<EngineSetup["paidWindowDays"]>(initial?.setup.paidWindowDays ?? 30);
  // Self-serve ticked, sales-assisted not, at a first visit (C25 Q16): the v1 behaviour.
  const [motions, setMotions] = useState<Record<Motion, boolean>>(() => ({ ...(initial?.setup.motions ?? SETUP_V2_DEFAULTS.motions) }));
  const [qualification, setQualification] = useState<Window>(initial?.setup.qualificationWindowDays ?? SETUP_V2_DEFAULTS.qualificationWindowDays);
  const [goLive, setGoLive] = useState<Window>(initial?.setup.goLiveWindowDays ?? SETUP_V2_DEFAULTS.goLiveWindowDays);
  const [referenceMonth, setReferenceMonth] = useState<YearMonth>(initial?.referenceMonth ?? lastClosed);
  const [chosenCohort, setChosenCohort] = useState<YearMonth | null>(initial?.cohortMonth ?? null);
  const [company, setCompany] = useState(initial?.setup.companyLabel ?? "");
  // A new engine offers the link ticked; the settings open on what is (C8).
  const [linkTour, setLinkTour] = useState(editing ? Boolean(linked) : true);
  const [tried, setTried] = useState(false);

  const cohortWindow = Math.max(30, paid);
  const cohortMonth = chosenCohort ?? matureCohortMonth(cohortWindow, today);
  const companyTooLong = company.length > TEXT_LIMITS.companyLabel;
  const noMotion = !motions.plg && !motions.slg;
  const ticked = MOTIONS.filter((m) => motions[m]);

  function setMotion(motion: Motion, on: boolean) {
    setMotions((was) => ({ ...was, [motion]: on }));
  }

  function start(how: SetupChoice["start"]) {
    setTried(true);
    // The group's message, focused at the send (R-19): the first box, so the error is read with its group.
    if (noMotion) {
      document.getElementById(`${id}-motion-plg`)?.focus();
      return;
    }
    if (companyTooLong) return;
    onStart({
      start: how,
      setup: {
        type: SETUP_V2_DEFAULTS.type,
        // A copy: the state's object is never the card's.
        motions: { ...motions },
        currency,
        activationWindowDays: activation,
        paidWindowDays: paid,
        qualificationWindowDays: qualification,
        goLiveWindowDays: goLive,
        ...(company.trim() ? { companyLabel: company.trim() } : {}),
      },
      referenceMonth,
      cohortMonth,
      tourResultId: tour && linkTour ? tour.id : null,
    });
  }

  const st = strings.settings;
  // What ticking or unticking a motion does, said BEFORE the save (§18.1.2): nothing is ever lost.
  const motionLines =
    editing && initial
      ? MOTIONS.flatMap((m) => {
          const was = initial.setup.motions[m];
          const is = motions[m];
          if (was === is) return [];
          const n = existing?.entered[m] ?? 0;
          const subject = strings.hybrid.motionSubject[m];
          if (was) return [n === 0 ? fill(st.motionOffNone, { motion: subject }) : fill(n === 1 ? st.motionOffOne : st.motionOff, { motion: subject, n })];
          if (n > 0) return [n === 1 ? st.motionBackOne : fill(st.motionBack, { n })];
          return [fill(m === "slg" ? st.motionOnSlg : st.motionOnPlg, { n: (m === "slg" ? SLG_METRIC_SHAPES : METRIC_SHAPES).length })];
        })
      : [];
  const resets = editing && initial
    ? [
        ...motionLines,
        motions.plg && activation !== initial.setup.activationWindowDays && existing?.activation ? fill(st.activationReset, { n: activation }) : null,
        motions.plg && paid !== initial.setup.paidWindowDays && existing?.paid ? fill(st.paidReset, { n: paid }) : null,
        motions.slg && qualification !== initial.setup.qualificationWindowDays && existing?.qualification ? fill(st.qualificationReset, { n: qualification }) : null,
        motions.slg && goLive !== initial.setup.goLiveWindowDays && existing?.goLive ? fill(st.goLiveReset, { n: goLive }) : null,
        (referenceMonth !== initial.referenceMonth || cohortMonth !== initial.cohortMonth) && existing?.any ? st.monthsChanged : null,
      ].filter((x): x is string => x !== null)
    : [];

  // Sales-assisted's three months, computed, read-only (§18.1.1, S4): the flows end at the flows' month, the
  // leads and the new customers at the last month whose cohort has had its whole window.
  const slgWindows = { ...SETUP_V2_DEFAULTS, qualificationWindowDays: qualification, goLiveWindowDays: goLive } as EngineSetup;
  const run = (to: YearMonth) => formatMonthRange({ from: monthsBefore(to, 2), to }, locale, strings.units, "from");
  const slgPeriods = fill(s.slgPeriods, {
    flows: run(referenceMonth),
    leads: run(defaultSpanEnd(shapeOf("slg.acq.lead-to-opp"), slgWindows, today)),
    customers: run(defaultSpanEnd(shapeOf("slg.act.go-live"), slgWindows, today)),
    q: qualification,
    g: goLive,
  });
  const windowChoice = (label: string, value: Window, onChange: (w: Window) => void) => (
    <Field group label={label}>
      {({ labelId }) => (
        <Segmented
          labelledBy={labelId}
          value={String(value) as "30" | "60" | "90"}
          options={WINDOWS.map((n) => ({ id: String(n) as "30" | "60" | "90", label: fill(s.windowDays, { n }) }))}
          onChange={(v) => onChange(Number(v) as Window)}
        />
      )}
    </Field>
  );

  const cohortHint = fill(s.cohortHint, {
    cohort: formatMonth(cohortMonth, locale),
    next: formatMonth(nextMonth(cohortMonth), locale),
    n: cohortWindow,
  });

  return (
    <Card elevation="flat" className={styles.setup} data-testid={editing ? "engine-settings" : "engine-setup"}>
      <h2 id="engine-setup-title" className={styles.panelTitle} tabIndex={-1}>
        {editing ? strings.settings.title : s.title}
      </h2>

      <Choices
        id={`${id}-type`}
        legend={s.companyType}
        value="b2b-saas"
        onChange={() => undefined}
        options={[
          { value: "b2b-saas", label: s.types.b2bSaas },
          // Shown, not hidden: saying which funnels are coming tells a consumer app why
          // the numbers below won't fit it yet. Dashed and at full contrast, never faded
          // (design system extension 04, Q18). « Plus tard », never « Bientôt » (C25 Q16).
          { value: "consumer-app", label: s.types.consumerApp, disabledNote: s.typeLater, disabled: true },
          { value: "marketplace", label: s.types.marketplace, disabledNote: s.typeLater, disabled: true },
        ]}
      />

      {/* How the company sells (§18.1.1): two boxes, at least one. Each motion's own settings unfold under its
          box; unticked, they are hidden, never reset. In the settings, the last box ticked can't be unticked. */}
      <Field group label={s.motions} hint={s.motionsHint} error={!editing && tried && noMotion ? s.motionsRequired : null}>
        {({ describedBy }) => (
          <div className={styles.motions} data-testid="engine-setup-motions">
            <div className={styles.motion}>
              <Checkbox
                id={`${id}-motion-plg`}
                label={s.motionPlg}
                checked={motions.plg}
                onChange={(on) => setMotion("plg", on)}
                disabled={editing && motions.plg && ticked.length === 1}
                disabledReason={st.motionLast}
                describedBy={describedBy}
                data-testid="engine-motion-plg"
              />
              {motions.plg ? (
                <div className={styles.motionSettings}>
                  <Field group label={s.activationWindow}>
                    {({ labelId }) => (
                      <Segmented
                        labelledBy={labelId}
                        value={String(activation) as "7" | "14" | "30"}
                        options={([7, 14, 30] as const).map((n) => ({ id: String(n) as "7" | "14" | "30", label: fill(s.windowDays, { n }) }))}
                        onChange={(v) => setActivation(Number(v) as EngineSetup["activationWindowDays"])}
                      />
                    )}
                  </Field>
                  <Field group label={s.paidWindow}>
                    {({ labelId }) => (
                      <Segmented
                        labelledBy={labelId}
                        value={String(paid) as "30" | "60" | "90"}
                        options={WINDOWS.map((n) => ({ id: String(n) as "30" | "60" | "90", label: fill(s.windowDays, { n }) }))}
                        onChange={(v) => setPaid(Number(v) as EngineSetup["paidWindowDays"])}
                      />
                    )}
                  </Field>
                </div>
              ) : null}
            </div>
            <div className={styles.motion}>
              <Checkbox
                id={`${id}-motion-slg`}
                label={s.motionSlg}
                checked={motions.slg}
                onChange={(on) => setMotion("slg", on)}
                disabled={editing && motions.slg && ticked.length === 1}
                disabledReason={st.motionLast}
                describedBy={describedBy}
                data-testid="engine-motion-slg"
              />
              {motions.slg ? (
                <div className={styles.motionSettings}>
                  {windowChoice(s.qualificationWindow, qualification, setQualification)}
                  {windowChoice(s.goLiveWindow, goLive, setGoLive)}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </Field>

      <div className={styles.setupGrid}>
        <DateField
          precision="month"
          id={`${id}-reference`}
          label={s.referenceMonth}
          hint={s.referenceMonthHint}
          value={referenceMonth}
          months={monthOptions(lastClosed, referenceMonth, locale)}
          onChange={(m) => m && setReferenceMonth(m)}
        />
        {/* The cohort followed is self-serve's (D7): sales-assisted reads three months, computed below. */}
        {motions.plg ? (
          <DateField
            precision="month"
            id={`${id}-cohort`}
            label={s.cohortMonth}
            hint={cohortHint}
            value={cohortMonth}
            months={monthOptions(lastClosed, cohortMonth, locale)}
            onChange={(m) => m && setChosenCohort(m)}
          />
        ) : null}
      </div>
      {motions.slg ? (
        <p className={styles.caveatLine} data-testid="engine-setup-slg-periods">
          {slgPeriods}
        </p>
      ) : null}

      {/* A three-letter code, so a box its size, not the column's (extension 04, Q18.11). */}
      <Select<Currency>
        id={`${id}-currency`}
        label={s.currency}
        fit="content"
        value={currency}
        options={CURRENCIES.map((c) => ({ value: c, label: c }))}
        onChange={(c) => c && setCurrency(c)}
      />


      <TextField
        id={`${id}-company`}
        label={s.companyLabel}
        optional={strings.workbench.optional}
        hint={s.companyHint}
        value={company}
        onChange={setCompany}
        maxLength={TEXT_LIMITS.companyLabel}
        error={tried && companyTooLong ? fill(strings.sheet.tooLong, { n: TEXT_LIMITS.companyLabel }) : null}
      />

      {/* Also in the settings since C8 (2026-09-29): a Tour taken after the engine was started, or
          a box unticked by mistake, could never be linked again. */}
      {tour ? (
        <div className={styles.tour} data-testid="engine-setup-tour">
          <Checkbox id={`${id}-tour`} label={s.tourLink} checked={linkTour} onChange={setLinkTour} />
          <p className={styles.tourText}>
            {fill(s.tourFound, { date: formatDate(tour.createdAt, locale), score: tour.total ?? "—" })}
          </p>
          {editing && !linkTour ? (
            <p className={styles.tourText} data-testid="engine-settings-unlink-hint">
              {s.tourUnlinkHint}
            </p>
          ) : null}
        </div>
      ) : null}

      {resets.length ? (
        <div className={styles.resets} role="status" data-testid="engine-settings-resets">
          {resets.map((line) => (
            <p key={line} className={styles.caveatLine}>
              {line}
            </p>
          ))}
        </div>
      ) : null}

      {editing ? (
        <div className={styles.panelActions}>
          <Button onClick={() => start("board")} data-testid="engine-settings-save">
            {strings.settings.save}
          </Button>
          <Button variant="quiet" onClick={onCancel} data-testid="engine-settings-cancel">
            {strings.settings.cancel}
          </Button>
        </div>
      ) : (
        <>
          <div className={styles.panelActions}>
            <Button onClick={() => start("steps")} data-testid="engine-setup-start">
              {s.startSteps}
            </Button>
            <Button variant="secondary" onClick={() => start("board")} data-testid="engine-setup-board">
              {s.startBoard}
            </Button>
          </div>
          <div className={styles.panelActions}>
            {onExample ? (
              <Button variant="quiet" onClick={() => onExample(noMotion ? SETUP_V2_DEFAULTS.motions : motions)} data-testid="engine-setup-example">
                {s.exampleLink}
              </Button>
            ) : null}
            {onImport ? (
              <Button variant="quiet" onClick={onImport} data-testid="engine-setup-import">
                {strings.actions.import}
              </Button>
            ) : null}
          </div>
        </>
      )}
    </Card>
  );
}

/**
 * The months offered: the eighteen closed ones up to `latest` — a cohort from
 * next year, or five years back, is a typo the list makes impossible — plus
 * `current` when an imported file holds an older one, so it is never
 * silently swapped for another.
 */
function monthOptions(latest: YearMonth, current: YearMonth, locale: "en" | "fr") {
  return monthsEndingAt(latest, 18, current).map((m) => ({ value: m, label: formatMonth(m, locale) }));
}
