"use client";

import { TEXT_LIMITS, type MetricShape } from "@/lib/engine/catalog-shape";
import { CAUSE_KEY, REPAIR_KEY, ROLE_KEY, type ResolvedMetric } from "@/lib/engine/strings";
import type { MissingCause, RepairScale, RoleId } from "@/lib/engine/types";
import { proposedRepair, type DraftProblem, type ReadingDraft, type SheetDraft, type SourceChoice, type TriageAnswer } from "./sheet-draft";
import { isRule, ruleMessage } from "./sheet-problems";
import { currencySymbol, sourceOptions } from "./sources";
import { RequestCopy } from "./RequestCopy";
import type { EngineView } from "./view";
import { Choices, type Choice } from "./_ui/Choices";
import { Field } from "./_ui/Field";
import { NumberField } from "./_ui/NumberField";
import { Select } from "./_ui/Select";
import { TextField } from "./_ui/TextField";
import styles from "./Sheet.module.css";
import ui from "./_ui/ui.module.css";

const CAUSES: readonly MissingCause[] = ["not-tracked", "not-computed", "no-access", "no-definition"];
const REPAIRS = Object.keys(REPAIR_KEY) as RepairScale[];
const ROLES = Object.keys(ROLE_KEY) as RoleId[];

/**
 * "I can't find it" (E3bis): one question — why? — and six closed answers,
 * each of which becomes a status AND a finding. A number nobody can find is
 * not an empty box to hide: it is what the deck's visibility slide is made
 * of, with what fixing it would cost on the audit's closed scale.
 *
 * The proposed cost follows the answer (the E3bis table) and stays
 * editable. "It doesn't apply to us" is offered only where the catalogue
 * has a closed reason for it — a stage where "not applicable" would be an
 * excuse rather than a fact never gets the option.
 */
export function MissingTriage({
  idPrefix,
  draft,
  update,
  shape,
  metric,
  view,
  problems,
  onRequested,
}: {
  idPrefix: string;
  draft: SheetDraft;
  update: (patch: Partial<SheetDraft>) => void;
  shape: MetricShape;
  metric: ResolvedMetric;
  view: EngineView;
  problems: readonly DraftProblem[];
  onRequested: (role: RoleId) => void;
}) {
  const { strings } = view;
  const t = strings.triage;
  const locale = view.ctx.locale;
  const rule = (p: DraftProblem) => (problems.includes(p) && isRule(p) ? ruleMessage(p, metric, strings, locale) : null);

  const answers: Choice<TriageAnswer>[] = [
    ...CAUSES.map((cause) => ({ id: cause, label: strings.cause[CAUSE_KEY[cause]] })),
    { id: "conflicting", label: strings.cause.conflicting },
    ...(metric.naReasons?.length ? [{ id: "not-applicable" as const, label: strings.cause.notApplicable }] : []),
  ];

  const isMissing = draft.triage !== null && draft.triage !== "conflicting" && draft.triage !== "not-applicable";
  const ownerRole = draft.ownerRole || shape.defaultRole;

  return (
    <div className={styles.editor} data-testid="engine-triage">
      <Choices
        name={`${idPrefix}-triage`}
        legend={t.question}
        value={draft.triage}
        options={answers}
        onChange={(triage) => update({ triage, repair: proposedRepair(triage, shape) })}
      />

      {isMissing ? (
        <>
          <Choices
            name={`${idPrefix}-repair`}
            legend={t.repair}
            value={draft.repair}
            options={REPAIRS.map((r) => ({ id: r, label: strings.repair[REPAIR_KEY[r]] }))}
            onChange={(repair) => update({ repair })}
            columns={2}
          />
          <Field label={t.repairComment} htmlFor={`${idPrefix}-repair-comment`} error={rule("comment-too-long")}>
            <TextField
              id={`${idPrefix}-repair-comment`}
              value={draft.repairComment}
              onChange={(repairComment) => update({ repairComment })}
              limit={TEXT_LIMITS.repairComment}
            />
          </Field>
        </>
      ) : null}

      {draft.triage === "no-access" ? (
        <>
          <Field label={t.owner} htmlFor={`${idPrefix}-owner`}>
            <Select<RoleId>
              id={`${idPrefix}-owner`}
              value={ownerRole}
              options={ROLES.map((role) => ({ id: role, label: strings.role[ROLE_KEY[role]] }))}
              onChange={(role) => role && update({ ownerRole: role })}
            />
          </Field>
          <RequestCopy
            role={ownerRole}
            ids={[shape.id]}
            label={strings.request.copy}
            view={view}
            variant="quiet"
            onCopied={() => onRequested(ownerRole)}
          />
        </>
      ) : null}

      {draft.triage === "no-definition" ? (
        <a className={styles.definitionLink} href={metric.glossaryHref} target="_blank" rel="noopener">
          {strings.sheet.definition}
        </a>
      ) : null}

      {draft.triage === "conflicting" ? (
        <div className={styles.readings}>
          <ReadingFields
            idPrefix={`${idPrefix}-a`}
            legend={t.readingA}
            reading={draft.readingA}
            onChange={(readingA) => update({ readingA })}
            invalid={problems.includes("reading-a")}
            shape={shape}
            metric={metric}
            view={view}
          />
          <ReadingFields
            idPrefix={`${idPrefix}-b`}
            legend={t.readingB}
            reading={draft.readingB}
            onChange={(readingB) => update({ readingB })}
            invalid={problems.includes("reading-b")}
            shape={shape}
            metric={metric}
            view={view}
          />
        </div>
      ) : null}

      {draft.triage === "not-applicable" && metric.naReasons?.length ? (
        <Choices
          name={`${idPrefix}-na`}
          legend={t.naReason}
          value={draft.naReason || null}
          options={metric.naReasons.map((r) => ({ id: r.id, label: r.label }))}
          onChange={(naReason) => update({ naReason })}
        />
      ) : null}
    </div>
  );
}

/**
 * One of two readings that disagree — a value and where it came from. Both
 * are kept, never averaged: the disagreement IS the finding, and the board
 * reads a conflict as the range between them.
 */
function ReadingFields({
  idPrefix,
  legend,
  reading,
  onChange,
  invalid,
  shape,
  metric,
  view,
}: {
  idPrefix: string;
  legend: string;
  reading: ReadingDraft;
  onChange: (reading: ReadingDraft) => void;
  invalid: boolean;
  shape: MetricShape;
  metric: ResolvedMetric;
  view: EngineView;
}) {
  const { strings } = view;
  const locale = view.ctx.locale;
  const w = strings.workbench;
  const set = (patch: Partial<ReadingDraft>) => onChange({ ...reading, ...patch });
  const src = sourceOptions(shape, strings);
  const shortcut = shape.valueKinds.includes("rate") ? "rate" : shape.valueKinds.includes("amount") ? "amount" : null;
  const money = shape.unit === "money";

  return (
    <fieldset className={[ui.fieldset, styles.reading, invalid ? styles.readingInvalid : ""].filter(Boolean).join(" ")}>
      <legend className={ui.legend}>{legend}</legend>
      <div className={styles.readingBody}>
        {reading.kind === "ratio" ? (
          <div className={styles.counts}>
            <Field label={metric.inputs?.numerator ?? metric.name} htmlFor={`${idPrefix}-num`}>
              <NumberField
                id={`${idPrefix}-num`}
                value={reading.numerator}
                onChange={(numerator) => set({ numerator })}
                locale={locale}
                integer={!money}
                unit={money ? currencySymbol(view.state.setup.currency, locale) : undefined}
                invalidMessage={money ? w.notANumber : w.notAWholeNumber}
              />
            </Field>
            <span className={styles.over} aria-hidden="true">
              {strings.sheet.over}
            </span>
            <Field label={metric.inputs?.denominator ?? metric.name} htmlFor={`${idPrefix}-den`}>
              <NumberField
                id={`${idPrefix}-den`}
                value={reading.denominator}
                onChange={(denominator) => set({ denominator })}
                locale={locale}
                integer
                invalidMessage={w.notAWholeNumber}
              />
            </Field>
          </div>
        ) : reading.kind === "rate" ? (
          <Field label={metric.name} htmlFor={`${idPrefix}-rate`}>
            <NumberField
              id={`${idPrefix}-rate`}
              value={reading.percent}
              onChange={(percent) => set({ percent })}
              locale={locale}
              unit="%"
              invalidMessage={w.notANumber}
            />
          </Field>
        ) : (
          <Field label={metric.name} htmlFor={`${idPrefix}-amount`}>
            <NumberField
              id={`${idPrefix}-amount`}
              value={reading.amount}
              onChange={(amount) => set({ amount })}
              locale={locale}
              unit={currencySymbol(view.state.setup.currency, locale)}
              invalidMessage={w.notANumber}
            />
          </Field>
        )}
        {shortcut ? (
          <button
            type="button"
            className={ui.linkButton}
            onClick={() => set({ kind: reading.kind === "ratio" ? shortcut : "ratio" })}
          >
            {reading.kind === "ratio" ? (shortcut === "rate" ? strings.sheet.rateOnly : strings.sheet.amountOnly) : w.countsBack}
          </button>
        ) : null}
        <Field label={strings.sheet.source} htmlFor={`${idPrefix}-source`}>
          <Select<Exclude<SourceChoice, "">>
            id={`${idPrefix}-source`}
            value={reading.source}
            placeholder={w.choose}
            options={src.options}
            groups={src.groups}
            onChange={(source) => set({ source })}
          />
        </Field>
        {reading.source === "person" ? (
          <Field label={w.sourceRole} htmlFor={`${idPrefix}-source-role`}>
            <Select<RoleId>
              id={`${idPrefix}-source-role`}
              value={reading.sourceRole}
              options={ROLES.map((role) => ({ id: role, label: strings.role[ROLE_KEY[role]] }))}
              onChange={(role) => role && set({ sourceRole: role })}
            />
          </Field>
        ) : null}
      </div>
    </fieldset>
  );
}
