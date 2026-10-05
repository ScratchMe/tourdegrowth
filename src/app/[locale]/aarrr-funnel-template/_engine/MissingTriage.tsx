"use client";

import { Button } from "@/components/core/Button";
import { Choices, type ChoiceOption } from "@/components/core/Choices";
import { Field } from "@/components/core/Field";
import { FieldRow } from "@/components/core/FieldRow";
import { NumberField } from "@/components/core/NumberField";
import { Select } from "@/components/core/Select";
import { TextField } from "@/components/core/TextField";
import { TEXT_LIMITS, type MetricShape } from "@/lib/engine/catalog-shape";
import { displayShapeOf } from "@/lib/engine/business-type";
import { CAUSE_KEY, REPAIR_KEY, ROLE_KEY, type ResolvedMetric } from "@/lib/engine/strings";
import type { RepairScale, RoleId } from "@/lib/engine/types";
import {
  proposedRepair,
  triageAnswersFor,
  type DraftProblem,
  type ReadingDraft,
  type SheetDraft,
  type SourceChoice,
  type TriageAnswer,
} from "./sheet-draft";
import { isRule, missingLabel, ruleMessage } from "./sheet-problems";
import { moneyUnit, percentUnit, sourceOptions } from "./sources";
import { RequestCopy } from "./RequestCopy";
import { fill } from "./text";
import type { EngineView } from "./view";
import styles from "./Sheet.module.css";
import { teamTools } from "@/lib/engine/tools";

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
  const need = (p: DraftProblem) =>
    problems.includes(p) ? fill(strings.workbench.saveNeeds, { fields: missingLabel(p, metric, strings) }) : null;

  // Which answers a metric offers is decided in sheet-draft.ts (no « deux chiffres » for an answer).
  const answers: ChoiceOption<TriageAnswer>[] = triageAnswersFor(shape, Boolean(metric.naReasons?.length)).map((id) => ({
    value: id,
    label: id === "conflicting" ? strings.cause.conflicting : id === "not-applicable" ? strings.cause.notApplicable : strings.cause[CAUSE_KEY[id]],
  }));

  const isMissing = draft.triage !== null && draft.triage !== "conflicting" && draft.triage !== "not-applicable";
  const ownerRole = draft.ownerRole || shape.defaultRole;

  return (
    <div className={styles.editor} data-testid="engine-triage">
      <Choices
        size="sm"
        id={`${idPrefix}-triage`}
        legend={t.question}
        error={need("triage")}
        value={draft.triage}
        options={answers}
        onChange={(triage) => update({ triage, repair: proposedRepair(triage, shape) })}
      />

      {isMissing ? (
        <>
          <Choices
            size="sm"
            id={`${idPrefix}-repair`}
            legend={t.repair}
            value={draft.repair}
            options={REPAIRS.map((r) => ({ value: r, label: strings.repair[REPAIR_KEY[r]] }))}
            onChange={(repair) => update({ repair })}
            columns={2}
          />
          <TextField
            size="sm"
            id={`${idPrefix}-repair-comment`}
            label={t.repairComment}
            optional={strings.workbench.optional}
            error={rule("comment-too-long")}
            value={draft.repairComment}
            onChange={(repairComment) => update({ repairComment })}
            maxLength={TEXT_LIMITS.repairComment}
          />
        </>
      ) : null}

      {draft.triage === "no-access" ? (
        <>
          <Select<RoleId>
            size="sm"
            id={`${idPrefix}-owner`}
            label={t.owner}
            value={ownerRole}
            options={ROLES.map((role) => ({ value: role, label: strings.role[ROLE_KEY[role]] }))}
            onChange={(role) => role && update({ ownerRole: role })}
          />
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
            error={need("reading-a")}
            shape={shape}
            metric={metric}
            view={view}
          />
          <ReadingFields
            idPrefix={`${idPrefix}-b`}
            legend={t.readingB}
            reading={draft.readingB}
            onChange={(readingB) => update({ readingB })}
            error={need("reading-b")}
            shape={shape}
            metric={metric}
            view={view}
          />
        </div>
      ) : null}

      {draft.triage === "not-applicable" && metric.naReasons?.length ? (
        <Choices
          size="sm"
          id={`${idPrefix}-na`}
          legend={t.naReason}
          error={need("na-reason")}
          value={draft.naReason || null}
          options={metric.naReasons.map((r) => ({ value: r.id, label: r.label }))}
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
  error,
  shape,
  metric,
  view,
}: {
  idPrefix: string;
  legend: string;
  reading: ReadingDraft;
  onChange: (reading: ReadingDraft) => void;
  /** What this reading still lacks, once a save was tried. */
  error: string | null;
  shape: MetricShape;
  metric: ResolvedMetric;
  view: EngineView;
}) {
  const { strings } = view;
  const locale = view.ctx.locale;
  const w = strings.workbench;
  const set = (patch: Partial<ReadingDraft>) => onChange({ ...reading, ...patch });
  const type = view.state.setup.type;
  const src = sourceOptions(displayShapeOf(shape.id, type), strings, teamTools(view.state.setup.tools, type));
  const shortcut = shape.valueKinds.includes("rate") ? "rate" : shape.valueKinds.includes("amount") ? "amount" : null;
  const money = shape.unit === "money";

  return (
    <Field group size="sm" label={legend} error={error} className={styles.reading}>
      <div className={styles.readingBody}>
        {reading.kind === "ratio" ? (
          <FieldRow joiner={strings.sheet.over}>
            <NumberField
              size="sm"
              id={`${idPrefix}-num`}
              label={metric.inputs?.numerator ?? metric.name}
              value={reading.numerator}
              onChange={(numerator) => set({ numerator })}
              locale={locale}
              integer={!money}
              {...(money ? moneyUnit(view.state.setup.currency, locale) : {})}
              parseError={money ? w.notANumber : w.notAWholeNumber}
            />
            <NumberField
              size="sm"
              id={`${idPrefix}-den`}
              label={metric.inputs?.denominator ?? metric.name}
              value={reading.denominator}
              onChange={(denominator) => set({ denominator })}
              locale={locale}
              integer
              parseError={w.notAWholeNumber}
            />
          </FieldRow>
        ) : reading.kind === "rate" ? (
          <NumberField
            size="sm"
            id={`${idPrefix}-rate`}
            label={metric.name}
            value={reading.percent}
            onChange={(percent) => set({ percent })}
            locale={locale}
            digits={5}
            {...percentUnit(locale)}
            parseError={w.notANumber}
          />
        ) : (
          <NumberField
            size="sm"
            id={`${idPrefix}-amount`}
            label={metric.name}
            value={reading.amount}
            onChange={(amount) => set({ amount })}
            locale={locale}
            {...moneyUnit(view.state.setup.currency, locale)}
            parseError={w.notANumber}
          />
        )}
        {shortcut ? (
          <Button
            variant="quiet"
            size="sm"
            className={styles.textAction}
            onClick={() => set({ kind: reading.kind === "ratio" ? shortcut : "ratio" })}
          >
            {reading.kind === "ratio" ? (shortcut === "rate" ? strings.sheet.rateOnly : strings.sheet.amountOnly) : w.countsBack}
          </Button>
        ) : null}
        <Select<Exclude<SourceChoice, "">>
          size="sm"
          id={`${idPrefix}-source`}
          label={strings.sheet.source}
          value={reading.source}
          placeholder={w.choose}
          options={src}
          onChange={(source) => set({ source })}
        />
        {reading.source === "person" ? (
          <Select<RoleId>
            size="sm"
            id={`${idPrefix}-source-role`}
            label={w.sourceRole}
            value={reading.sourceRole}
            options={ROLES.map((role) => ({ value: role, label: strings.role[ROLE_KEY[role]] }))}
            onChange={(role) => role && set({ sourceRole: role })}
          />
        ) : null}
      </div>
    </Field>
  );
}
