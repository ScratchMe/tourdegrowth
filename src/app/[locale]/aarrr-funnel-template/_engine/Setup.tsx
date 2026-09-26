"use client";

import { useId, useState } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { TEXT_LIMITS } from "@/lib/engine/catalog-shape";
import type { EngineStrings } from "@/lib/engine/strings";
import type { Currency, EngineSetup, YearMonth } from "@/lib/engine/types";
import type { StoredResult } from "@/lib/quiz/storage";
import { defaultReferenceMonth, matureCohortMonth, nextMonth } from "@/lib/engine/cohort";
import { fill, formatDate, formatMonth } from "./text";
import { CheckField } from "./_ui/CheckField";
import { Choices } from "./_ui/Choices";
import { describedBy, Field } from "./_ui/Field";
import { MonthField } from "./_ui/MonthField";
import { SegmentedField } from "./_ui/SegmentedField";
import { Select } from "./_ui/Select";
import { TextField } from "./_ui/TextField";
import styles from "./Screens.module.css";

const CURRENCIES: readonly Currency[] = ["EUR", "USD", "GBP", "CHF"];

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
  onCancel,
}: {
  strings: EngineStrings;
  locale: "en" | "fr";
  today: Date;
  tour: StoredResult | null;
  onStart: (choice: SetupChoice) => void;
  onImport?: () => void;
  /** « Voir un exemple rempli » — only offered before an engine exists. */
  onExample?: () => void;
  /**
   * Editing the settings of an engine that exists (Antoine, 2026-09-25: they
   * could not be changed without erasing everything). The card opens on them,
   * says what a change would reset, and saves or cancels.
   */
  initial?: { setup: EngineSetup; referenceMonth: YearMonth; cohortMonth: YearMonth };
  /** Which numbers a change of window would send back to "to fill in". */
  existing?: { activation: boolean; paid: boolean; any: boolean };
  onCancel?: () => void;
}) {
  const s = strings.setup;
  const editing = Boolean(initial);
  const id = useId();
  const lastClosed = defaultReferenceMonth(today);
  const [currency, setCurrency] = useState<Currency>(initial?.setup.currency ?? "EUR");
  const [activation, setActivation] = useState<EngineSetup["activationWindowDays"]>(initial?.setup.activationWindowDays ?? 7);
  const [paid, setPaid] = useState<EngineSetup["paidWindowDays"]>(initial?.setup.paidWindowDays ?? 30);
  const [referenceMonth, setReferenceMonth] = useState<YearMonth>(initial?.referenceMonth ?? lastClosed);
  const [chosenCohort, setChosenCohort] = useState<YearMonth | null>(initial?.cohortMonth ?? null);
  const [company, setCompany] = useState(initial?.setup.companyLabel ?? "");
  const [linkTour, setLinkTour] = useState(true);
  const [tried, setTried] = useState(false);

  const cohortWindow = Math.max(30, paid);
  const cohortMonth = chosenCohort ?? matureCohortMonth(cohortWindow, today);
  const companyTooLong = company.length > TEXT_LIMITS.companyLabel;

  function start(how: SetupChoice["start"]) {
    setTried(true);
    if (companyTooLong) return;
    onStart({
      start: how,
      setup: {
        profile: "selfserve",
        currency,
        activationWindowDays: activation,
        paidWindowDays: paid,
        ...(company.trim() ? { companyLabel: company.trim() } : {}),
      },
      referenceMonth,
      cohortMonth,
      tourResultId: tour && linkTour ? tour.id : null,
    });
  }

  const resets = editing && initial
    ? [
        activation !== initial.setup.activationWindowDays && existing?.activation ? fill(strings.settings.activationReset, { n: activation }) : null,
        paid !== initial.setup.paidWindowDays && existing?.paid ? fill(strings.settings.paidReset, { n: paid }) : null,
        (referenceMonth !== initial.referenceMonth || cohortMonth !== initial.cohortMonth) && existing?.any ? strings.settings.monthsChanged : null,
      ].filter((x): x is string => x !== null)
    : [];

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
        name={`${id}-model`}
        legend={s.model}
        value="selfserve"
        onChange={() => undefined}
        options={[
          { id: "selfserve", label: s.models.selfserve },
          // Shown, not hidden: saying which funnels are coming tells a sales-led
          // team why the fifteen numbers below won't fit them yet.
          { id: "sales-led", label: s.models.salesLed, note: s.modelSoon, disabled: true },
          { id: "consumer-app", label: s.models.consumerApp, note: s.modelSoon, disabled: true },
          { id: "marketplace", label: s.models.marketplace, note: s.modelSoon, disabled: true },
        ]}
      />

      <div className={styles.setupGrid}>
        <Field label={s.referenceMonth} hint={s.referenceMonthHint} htmlFor={`${id}-reference`}>
          <MonthField
            id={`${id}-reference`}
            value={referenceMonth}
            latest={lastClosed}
            format={(m) => formatMonth(m, locale)}
            onChange={setReferenceMonth}
            describedBy={describedBy(`${id}-reference`, { hint: s.referenceMonthHint })}
          />
        </Field>
        <Field label={s.cohortMonth} hint={cohortHint} htmlFor={`${id}-cohort`}>
          <MonthField
            id={`${id}-cohort`}
            value={cohortMonth}
            latest={lastClosed}
            format={(m) => formatMonth(m, locale)}
            onChange={setChosenCohort}
            describedBy={describedBy(`${id}-cohort`, { hint: cohortHint })}
          />
        </Field>
      </div>

      <Field label={s.currency} htmlFor={`${id}-currency`}>
        <Select<Currency>
          id={`${id}-currency`}
          value={currency}
          options={CURRENCIES.map((c) => ({ id: c, label: c }))}
          onChange={(c) => c && setCurrency(c)}
        />
      </Field>

      <SegmentedField
        label={s.activationWindow}
        value={String(activation) as "7" | "14" | "30"}
        options={([7, 14, 30] as const).map((n) => ({ id: String(n) as "7" | "14" | "30", label: fill(s.windowDays, { n }) }))}
        onChange={(v) => setActivation(Number(v) as EngineSetup["activationWindowDays"])}
      />
      <SegmentedField
        label={s.paidWindow}
        value={String(paid) as "30" | "60" | "90"}
        options={([30, 60, 90] as const).map((n) => ({ id: String(n) as "30" | "60" | "90", label: fill(s.windowDays, { n }) }))}
        onChange={(v) => setPaid(Number(v) as EngineSetup["paidWindowDays"])}
      />

      <Field
        label={s.companyLabel}
        hint={s.companyHint}
        htmlFor={`${id}-company`}
        error={tried && companyTooLong ? fill(strings.sheet.tooLong, { n: TEXT_LIMITS.companyLabel }) : null}
      >
        <TextField
          id={`${id}-company`}
          value={company}
          onChange={setCompany}
          limit={TEXT_LIMITS.companyLabel}
          describedBy={describedBy(`${id}-company`, { hint: s.companyHint })}
        />
      </Field>

      {tour && !editing ? (
        <div className={styles.tour} data-testid="engine-setup-tour">
          <CheckField id={`${id}-tour`} checked={linkTour} onChange={setLinkTour}>
            {s.tourLink}
          </CheckField>
          <p className={styles.tourText}>
            {fill(s.tourFound, { date: formatDate(tour.createdAt, locale), score: tour.total ?? "—" })}
          </p>
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
              <Button variant="quiet" onClick={onExample} data-testid="engine-setup-example">
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
