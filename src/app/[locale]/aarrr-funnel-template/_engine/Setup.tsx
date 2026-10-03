"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { METRIC_SHAPES, SLG_METRIC_SHAPES, TEXT_LIMITS, shapeOf } from "@/lib/engine/catalog-shape";
import type { EngineStrings } from "@/lib/engine/strings";
import type { Currency, EngineSetup, MetricId, Motion, SharedCount, ToolId, YearMonth } from "@/lib/engine/types";
import { SETUP_TOOLS, TOOL_FAMILIES, teamTools } from "@/lib/engine/tools";
import { SETUP_V2_DEFAULTS } from "@/lib/engine/types";
import type { StoredResult } from "@/lib/quiz/storage";
import { defaultReferenceMonth, defaultSpanEnd, matureCohortMonth, monthsBefore, nextMonth } from "@/lib/engine/cohort";
import { formatMonthRange } from "@/lib/engine/format";
import { RUNWAY_MAX_MONTHS } from "@/lib/engine/money";
import { domId, fill, formatDate, formatMonth } from "./text";
import { Checkbox } from "@/components/core/Checkbox";
import { Disclosure } from "@/components/core/Disclosure";
import { Choices } from "@/components/core/Choices";
import { DateField } from "@/components/core/DateField";
import { Field } from "@/components/core/Field";
import { NumberField } from "@/components/core/NumberField";
import { Segmented } from "@/components/core/Segmented";
import { Select } from "@/components/core/Select";
import { TextField } from "@/components/core/TextField";
import { monthsEndingAt } from "@/lib/forms/date";
import { isUnreadableNumber } from "@/lib/forms/number";
import { moneyUnit, percentUnit, wordUnit } from "./sources";
import { DEFAULT_CURRENCY, DEFAULT_WINDOWS } from "./start";
import { EngineTerm } from "./EngineTerm";
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
  /** In the settings (A18 T3.d): the targets and the shared counts changed, written with the rest (`withSettingsNumbers`). */
  numbers?: { targets: Partial<Record<MetricId, number | null>>; base: Partial<Record<SharedCount, number>> };
}

/**
 * What the settings show of the numbers (A18 T3.d), labelled by the caller,
 * which has the catalogue: the targets, one group per motion ticked (`title`
 * only in the hybrid), and the shared counts (`settingsSharedCounts`).
 */
export interface SettingsNumbers {
  targets: { motion: Motion; title: string | null; boxes: { id: MetricId; label: string; hint: string; value: number | null }[] }[];
  shared: { count: SharedCount; label: string; hint: string; value: number | null }[];
}

/**
 * Every setting of an engine, on one card: the Settings of an engine that
 * exists, and — before one exists — what « Modifier » opens from the start
 * screen (A18 T3.a), which asks only how the company sells. Since A18 T3.a
 * the start screen is the way in; this card was the setup (spec §7 E1).
 *
 * One card ≤ 560 px at every width: the
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
  startMotions,
  initial,
  existing,
  linked,
  after,
  onCancel,
  focusCompany,
  numbers,
}: {
  strings: EngineStrings;
  locale: "en" | "fr";
  today: Date;
  tour: StoredResult | null;
  onStart: (choice: SetupChoice) => void;
  /** Before an engine exists: the answer the start screen had chosen, which the card opens on. */
  startMotions?: Record<Motion, boolean>;
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
  /**
   * The monthly series (A14 T2, §19.1.6): the month before's flows. The month
   * being filled must stay after it, so the earlier months are not offered.
   */
  after?: YearMonth;
  onCancel?: () => void;
  /** « Renommer », from the engine bar's menu (A18 T2.a): the focus goes to the company's name, the field the person came to change. */
  focusCompany?: boolean;
  /** In the settings (A18 T3.d): the targets and the shared counts, saved with the rest, dropped by « Annuler ». */
  numbers?: SettingsNumbers;
}) {
  const s = strings.setup;
  const editing = Boolean(initial);
  const id = useId();
  // On arrival: neither changes while the card is on screen, so the person's one move is made once.
  useEffect(() => {
    if (focusCompany) document.getElementById(`${id}-company`)?.focus();
  }, [focusCompany, id]);
  const lastClosed = defaultReferenceMonth(today);
  // The defaults the start screen says in its sentence (`start.ts`): one source for both.
  const [currency, setCurrency] = useState<Currency>(initial?.setup.currency ?? DEFAULT_CURRENCY);
  const [activation, setActivation] = useState<EngineSetup["activationWindowDays"]>(initial?.setup.activationWindowDays ?? DEFAULT_WINDOWS.activationWindowDays);
  const [paid, setPaid] = useState<EngineSetup["paidWindowDays"]>(initial?.setup.paidWindowDays ?? DEFAULT_WINDOWS.paidWindowDays);
  // Before an engine exists, the start screen's answer (self-serve by default, C25 Q16: the v1 behaviour).
  const [motions, setMotions] = useState<Record<Motion, boolean>>(() => ({ ...(initial?.setup.motions ?? startMotions ?? SETUP_V2_DEFAULTS.motions) }));
  const [qualification, setQualification] = useState<Window>(initial?.setup.qualificationWindowDays ?? SETUP_V2_DEFAULTS.qualificationWindowDays);
  const [goLive, setGoLive] = useState<Window>(initial?.setup.goLiveWindowDays ?? SETUP_V2_DEFAULTS.goLiveWindowDays);
  const [referenceMonth, setReferenceMonth] = useState<YearMonth>(initial?.referenceMonth ?? lastClosed);
  const [chosenCohort, setChosenCohort] = useState<YearMonth | null>(initial?.cohortMonth ?? null);
  const [company, setCompany] = useState(initial?.setup.companyLabel ?? "");
  // Sales-assisted pipeline coverage (§19.4, A14 T3.2): the quarter's target and the team's threshold, both optional.
  const [quarterTarget, setQuarterTarget] = useState<number | null>(initial?.setup.pipeline?.quarterTarget ?? null);
  const [threshold, setThreshold] = useState<number | null>(initial?.setup.pipeline?.threshold ?? null);
  // The team's runway (A20.d T5, C49), optional, in the settings only: the long-payback warning holds the payback
  // against it, and against the 30-month floor without it. Per company: both motions face the same runway.
  const [runway, setRunway] = useState<number | null>(initial?.setup.runwayMonths ?? null);
  // The team's tools (§19.5.1, A14 T4), optional; a tool the setup doesn't offer that a file brought is kept, unread.
  const [tools, setTools] = useState<ToolId[]>(() => teamTools(initial?.setup.tools));
  const keptTools = (initial?.setup.tools ?? []).filter((t) => !SETUP_TOOLS.includes(t));
  // A new engine offers the link ticked; the settings open on what is (C8).
  const [linkTour, setLinkTour] = useState(editing ? Boolean(linked) : true);
  const [tried, setTried] = useState(false);
  // The targets and the shared counts (A18 T3.d), held here until « Enregistrer les réglages », like every other field.
  const targetBoxes = numbers?.targets.flatMap((g) => g.boxes) ?? [];
  const [targets, setTargets] = useState<Partial<Record<MetricId, number | null>>>(() => Object.fromEntries(targetBoxes.map((b) => [b.id, b.value])));
  const [shared, setShared] = useState<Partial<Record<SharedCount, number | null>>>(() => Object.fromEntries((numbers?.shared ?? []).map((c) => [c.count, c.value])));
  // A shared count typed at zero or below, or erased, stops the save with its message, as a number's own box would (A15.9).
  const [notPositive, setNotPositive] = useState<SharedCount | null>(null);

  const cohortWindow = Math.max(30, paid);
  const cohortMonth = chosenCohort ?? matureCohortMonth(cohortWindow, today);
  const companyTooLong = company.length > TEXT_LIMITS.companyLabel;
  // validate.ts's guard, said in the box: above 0, up to twenty years.
  const runwayOut = runway !== null && (runway <= 0 || runway > RUNWAY_MAX_MONTHS);
  const noMotion = !motions.plg && !motions.slg;
  const ticked = MOTIONS.filter((m) => motions[m]);

  function setMotion(motion: Motion, on: boolean) {
    setMotions((was) => ({ ...was, [motion]: on }));
  }

  function start() {
    setTried(true);
    // The group's message, focused at the send (R-19): the first box, so the error is read with its group.
    if (noMotion) {
      document.getElementById(`${id}-motion-plg`)?.focus();
      return;
    }
    if (companyTooLong) return;
    // A box holding text it cannot read stops the save, the focus on it: it writes nothing (A15.2), and the
    // card would close on it unseen. A shared count must be a whole number above zero.
    const unread = [
      ...targetBoxes.map((b) => ({ el: `${id}-target-${b.id}`, integer: false })),
      { el: `${id}-runway`, integer: false },
      ...(numbers?.shared ?? []).map((c) => ({ el: `${id}-shared-${c.count}`, integer: true })),
    ]
      .map(({ el, integer }) => ({ box: document.getElementById(el) as HTMLInputElement | null, integer }))
      .find(({ box, integer }) => box !== null && isUnreadableNumber(box.value, locale, integer));
    if (unread?.box) {
      unread.box.focus();
      return;
    }
    if (runwayOut) {
      document.getElementById(`${id}-runway`)?.focus();
      return;
    }
    const zero = (numbers?.shared ?? []).find((c) => {
      const n = shared[c.count] ?? null;
      return (n === null && c.value !== null) || (n !== null && n <= 0);
    });
    if (zero) {
      setNotPositive(zero.count);
      document.getElementById(`${id}-shared-${zero.count}`)?.focus();
      return;
    }
    const changedTargets = Object.fromEntries(
      targetBoxes.filter((b) => (targets[b.id] ?? null) !== b.value).map((b) => [b.id, targets[b.id] ?? null]),
    ) as Partial<Record<MetricId, number | null>>;
    const changedBase = Object.fromEntries(
      (numbers?.shared ?? []).flatMap((c) => {
        const n = shared[c.count] ?? null;
        return n !== null && n !== c.value ? [[c.count, n]] : [];
      }),
    ) as Partial<Record<SharedCount, number>>;
    const pipeline = {
      ...(quarterTarget !== null && quarterTarget > 0 ? { quarterTarget } : {}),
      ...(threshold !== null && threshold > 0 ? { threshold } : {}),
    };
    onStart({
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
        // The tools ticked here, plus any a file brought that the setup doesn't offer: never dropped (§19.5).
        ...(tools.length + keptTools.length > 0 ? { tools: [...teamTools(tools), ...keptTools] } : {}),
        ...(Object.keys(pipeline).length > 0 ? { pipeline } : {}),
        // Kept across a save: the setup is rebuilt here, and a runway left out would be erased.
        ...(runway !== null ? { runwayMonths: runway } : {}),
      },
      referenceMonth,
      cohortMonth,
      tourResultId: tour && linkTour ? tour.id : null,
      ...(numbers ? { numbers: { targets: changedTargets, base: changedBase } } : {}),
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
      {editing ? <p className={styles.lead}>{st.lead}</p> : null}

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
                  {/* « fenêtre »'s « ? » under the first window it names (A18 T6): in the hint, never in the group's label. */}
                  <Field
                    group
                    label={s.activationWindow}
                    hint={
                      <>
                        {st.windowHint}
                        <EngineTerm id="window" strings={strings} />
                      </>
                    }
                  >
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
                  {/* Pipeline coverage (§19.4): in the settings only, where the relays' card sends the reader. */}
                  {editing ? (
                    <>
                      <NumberField
                        size="sm"
                        id={`${id}-pipeline-target`}
                        data-testid="engine-setup-pipeline-target"
                        label={strings.pipeline.targetLabel}
                        optional={strings.workbench.optional}
                        value={quarterTarget}
                        onChange={setQuarterTarget}
                        locale={locale}
                        {...moneyUnit(currency, locale)}
                        parseError={strings.workbench.notANumber}
                      />
                      <NumberField
                        size="sm"
                        id={`${id}-pipeline-threshold`}
                        data-testid="engine-setup-pipeline-threshold"
                        label={strings.pipeline.thresholdLabel}
                        hint={strings.pipeline.thresholdHint}
                        optional={strings.workbench.optional}
                        value={threshold}
                        onChange={setThreshold}
                        locale={locale}
                        suffix={strings.pipeline.ratio.replace("{n}", "").trim()}
                        unitName={strings.pipeline.thresholdUnit}
                        parseError={strings.workbench.notANumber}
                      />
                    </>
                  ) : null}
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
          months={monthOptions(lastClosed, referenceMonth, locale).filter((m) => after === undefined || m.value > after)}
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
        <p className={styles.periodsLine} data-testid="engine-setup-slg-periods">
          {slgPeriods}
        </p>
      ) : null}

      {/* The targets and the shared counts (A18 T3.d): what the start's « Cibles » and the step-by-step's base asked,
          in one place. Only the motions ticked when the card opened: a motion ticked here starts empty. */}
      {numbers && numbers.targets.length > 0 ? (
        <section className={styles.settingsGroup} aria-labelledby={`${id}-targets-title`} data-testid="engine-settings-targets">
          <h3 id={`${id}-targets-title`} className={styles.settingsGroupTitle}>
            {st.targets}
            <EngineTerm id="target" strings={strings} />
          </h3>
          <p className={styles.periodsLine}>{st.targetsLead}</p>
          {numbers.targets.map((group) => (
            <div key={group.motion} className={styles.settingsBoxes}>
              {group.title ? <h4 className={styles.toolFamilyTitle}>{group.title}</h4> : null}
              {group.boxes.map((b) => (
                <NumberField
                  key={b.id}
                  size="sm"
                  id={`${id}-target-${b.id}`}
                  data-testid={`engine-settings-target-${domId(b.id)}`}
                  label={b.label}
                  hint={b.hint}
                  optional={strings.workbench.optional}
                  value={targets[b.id] ?? null}
                  onChange={(v) => setTargets((was) => ({ ...was, [b.id]: v }))}
                  locale={locale}
                  digits={5}
                  {...percentUnit(locale)}
                  parseError={strings.workbench.notANumber}
                />
              ))}
            </div>
          ))}
        </section>
      ) : null}
      {numbers && numbers.shared.length > 0 ? (
        <section className={styles.settingsGroup} aria-labelledby={`${id}-shared-title`} data-testid="engine-settings-shared">
          <h3 id={`${id}-shared-title`} className={styles.settingsGroupTitle}>
            {st.shared}
            <EngineTerm id="sharedCount" strings={strings} />
          </h3>
          <p className={styles.periodsLine}>{st.sharedLead}</p>
          {numbers.shared.map((c) => (
            <NumberField
              key={c.count}
              size="sm"
              id={`${id}-shared-${c.count}`}
              data-testid={`engine-settings-shared-${c.count}`}
              label={c.label}
              hint={c.hint}
              value={shared[c.count] ?? null}
              onChange={(v) => setShared((was) => ({ ...was, [c.count]: v }))}
              locale={locale}
              integer
              digits={9}
              error={notPositive === c.count && !((shared[c.count] ?? 0) > 0) ? st.wholeCount : undefined}
              parseError={st.wholeCount}
            />
          ))}
        </section>
      ) : null}

      {/* The runway (A20.d T5, C49): in the settings only, where the long-payback warning sends the reader. The word stays
          « runway », its « ? » says « tes mois de trésorerie » (Antoine) — in the hint, never inside the <label>. */}
      {editing ? (
        <section className={styles.settingsGroup} aria-labelledby={`${id}-cash-title`} data-testid="engine-settings-cash">
          <h3 id={`${id}-cash-title`} className={styles.settingsGroupTitle}>
            {st.cash}
          </h3>
          <NumberField
            size="sm"
            id={`${id}-runway`}
            data-testid="engine-settings-runway"
            label={st.runway}
            optional={strings.workbench.optional}
            hint={
              <>
                {st.runwayHint} <EngineTerm id="runway" strings={strings} />
              </>
            }
            value={runway}
            onChange={setRunway}
            locale={locale}
            digits={3}
            {...wordUnit({ one: st.runwayMonth, other: st.runwayMonths }, locale, runway)}
            error={tried && runwayOut ? fill(st.runwayRange, { max: RUNWAY_MAX_MONTHS }) : undefined}
            parseError={strings.workbench.notANumber}
          />
        </section>
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

      {/* The team's tools (§19.5.1): optional and folded — nothing ticked changes nothing. */}
      <Disclosure summary={s.tools} size="sm" data-testid="engine-setup-tools">
        <p className={styles.periodsLine}>{s.toolsHint}</p>
        {TOOL_FAMILIES.map(({ family, tools: offered }) => (
          <fieldset key={family} className={styles.toolFamily}>
            <legend className={styles.toolFamilyTitle}>{s.toolFamily[family]}</legend>
            {offered.map((tool) => (
              <Checkbox
                key={tool}
                id={`${id}-tool-${tool}`}
                label={strings.tools[tool]}
                checked={tools.includes(tool)}
                onChange={(on) => setTools((was) => (on ? [...was, tool] : was.filter((t) => t !== tool)))}
                data-testid={`engine-setup-tool-${tool}`}
              />
            ))}
          </fieldset>
        ))}
      </Disclosure>

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

      <div className={styles.panelActions}>
        <Button onClick={start} data-testid={editing ? "engine-settings-save" : "engine-setup-start"}>
          {editing ? strings.settings.save : strings.start.go}
        </Button>
        <Button variant="quiet" onClick={onCancel} data-testid={editing ? "engine-settings-cancel" : "engine-setup-cancel"}>
          {strings.settings.cancel}
        </Button>
      </div>
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
