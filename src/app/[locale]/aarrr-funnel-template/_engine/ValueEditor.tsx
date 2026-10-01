"use client";

import { useState } from "react";
import { Button } from "@/components/core/Button";
import { TEXT_LIMITS, type MetricShape } from "@/lib/engine/catalog-shape";
import { ROLE_KEY, type ResolvedMetric } from "@/lib/engine/strings";
import type { RoleId } from "@/lib/engine/types";
import { formatMoney, formatNumber, formatPercent } from "@/lib/engine/format";
import type { DraftProblem, SheetDraft, SourceChoice } from "./sheet-draft";
import { Choices } from "@/components/core/Choices";
import { Field } from "@/components/core/Field";
import { FieldRow } from "@/components/core/FieldRow";
import { NumberField } from "@/components/core/NumberField";
import { Segmented } from "@/components/core/Segmented";
import { Select } from "@/components/core/Select";
import { TextField } from "@/components/core/TextField";
import { isRule, missingLabel, ruleMessage } from "./sheet-problems";
import { moneyUnit, percentUnit, sourceOptions } from "./sources";
import { fill, midSentence } from "./text";
import type { EngineView } from "./view";
import styles from "./Sheet.module.css";

const ROLES = Object.keys(ROLE_KEY) as RoleId[];

/**
 * "I have it" (§7 E3): the number as COUNTS first (D6) — "144 out of 800"
 * can be recounted, "18 %" does not say of what — with the rate computed
 * live underneath, then where it came from.
 *
 * The rate-only and amount-only shortcuts stay one click away, and say what
 * they cost: without both counts the number is marked approximate. Every
 * number is typed the way the reader writes it ("26 000", "26,000") and
 * read back by `parseTypedNumber`, never by a `type="number"` box that would
 * silently drop what it cannot parse.
 */
export function ValueEditor({
  idPrefix,
  draft,
  update,
  shape,
  metric,
  view,
  problems,
  sharedHints,
}: {
  idPrefix: string;
  draft: SheetDraft;
  update: (patch: Partial<SheetDraft>) => void;
  shape: MetricShape;
  metric: ResolvedMetric;
  view: EngineView;
  /** Only after a save was attempted — nothing turns red before the person has had a chance. */
  problems: readonly DraftProblem[];
  /** « Même nombre que pour … » under a count several numbers share (shared-counts.ts). */
  sharedHints?: { numerator?: string; denominator?: string };
}) {
  const { strings, ctx, state } = view;
  const locale = ctx.locale;
  const w = strings.workbench;
  const has = (p: DraftProblem) => problems.includes(p);
  const rule = (p: DraftProblem) => (has(p) && isRule(p) ? ruleMessage(p, metric, strings, locale) : null);
  // A piece the save still needs, said under its own field as well as in the
  // sheet's line under the button — which stays the index of them all.
  const need = (p: DraftProblem) => (has(p) ? fill(w.saveNeeds, { fields: missingLabel(p, metric, strings) }) : null);
  const currency = state.setup.currency;

  const numberInvalid = w.notANumber;
  // A cost per customer counts money over people; a margin or an MRR
  // movement, money over money (A15.8). Only people are whole numbers.
  const moneyNumerator = shape.unit === "money" || shape.amounts === true;
  const moneyDenominator = shape.amounts === true;

  // A rule a single value breaks — a rate outside 0–100, a negative amount
  // or duration — is said when the box is left, not only at the save
  // (A15.3): the person is still looking at it. A piece still missing waits
  // for the save, as before.
  const [left, setLeft] = useState<Partial<Record<"rate" | "amount" | "duration", true>>>({});
  const leave = (field: "rate" | "amount" | "duration") => () => setLeft((was) => (was[field] ? was : { ...was, [field]: true }));
  const outOfRange = draft.percent !== null && (draft.percent < 0 || draft.percent > 100);
  const early = {
    rate: left.rate && outOfRange ? w.percentRange : null,
    amount: left.amount && draft.amount !== null && draft.amount < 0 ? w.amountNegative : null,
    duration: left.duration && draft.durationValue !== null && draft.durationValue < 0 ? w.durationNegative : null,
  };

  const kindToggle = (() => {
    if (shape.unit === "percent" && shape.valueKinds.includes("rate")) {
      return draft.kind === "ratio"
        ? { label: strings.sheet.rateOnly, to: "rate" as const }
        : { label: w.countsBack, to: "ratio" as const };
    }
    if (shape.unit === "money" && shape.valueKinds.includes("amount")) {
      return draft.kind === "ratio"
        ? { label: strings.sheet.amountOnly, to: "amount" as const }
        : { label: w.countsBack, to: "ratio" as const };
    }
    return null;
  })();

  const live = (() => {
    if (draft.kind !== "ratio" || draft.numerator === null || draft.denominator === null || draft.denominator === 0) return null;
    if (shape.bounded && draft.numerator > draft.denominator) return null;
    const q = draft.numerator / draft.denominator;
    if (shape.unit === "percent") {
      return fill(strings.sheet.live, {
        rate: formatPercent(q * 100, locale),
        n: formatNumber(Math.round(q * 100), locale),
        population: midSentence(metric.inputs?.denominator ?? "", locale),
      });
    }
    if (shape.unit === "money") return formatMoney(Math.round(q * 100) / 100, currency, locale);
    return formatNumber(Math.round(q * 100) / 100, locale);
  })();

  const src = sourceOptions(shape, strings);
  const needsSource = draft.kind !== "text" && draft.kind !== "choice";
  const numGtDen = rule("num-gt-den");

  return (
    <div className={styles.editor} data-testid="engine-value-editor">
      {draft.kind === "ratio" ? (
        // One statement, « 144 out of 800 »: the boxes share a line however
        // the labels and the shared-count hints wrap (FieldRow's subgrid), and
        // a rule about the pair is the row's, not one box's.
        <FieldRow
          joiner={strings.sheet.over}
          error={numGtDen ? <span data-testid="engine-live">{numGtDen}</span> : (rule("count-negative") ?? undefined)}
        >
          <NumberField
            size="sm"
            id={`${idPrefix}-num`}
            label={metric.inputs?.numerator ?? metric.name}
            hint={sharedHints?.numerator}
            error={need("numerator")}
            value={draft.numerator}
            onChange={(numerator) => update({ numerator })}
            locale={locale}
            integer={!moneyNumerator}
            {...(moneyNumerator ? moneyUnit(currency, locale) : {})}
            parseError={moneyNumerator ? numberInvalid : w.notAWholeNumber}
          />
          <NumberField
            size="sm"
            id={`${idPrefix}-den`}
            label={metric.inputs?.denominator ?? metric.name}
            hint={sharedHints?.denominator}
            error={rule("denominator-zero") ?? need("denominator")}
            value={draft.denominator}
            onChange={(denominator) => update({ denominator })}
            locale={locale}
            integer={!moneyDenominator}
            {...(moneyDenominator ? moneyUnit(currency, locale) : {})}
            parseError={moneyDenominator ? numberInvalid : w.notAWholeNumber}
          />
        </FieldRow>
      ) : null}
      {draft.kind === "ratio" && live && !numGtDen ? (
        <p className={styles.live} data-testid="engine-live" aria-live="polite">
          {live}
        </p>
      ) : null}

      {draft.kind === "rate" ? (
        <NumberField
          size="sm"
          id={`${idPrefix}-rate`}
          label={metric.name}
          hint={strings.sheet.rateOnlyHint}
          error={rule("percent-range") ?? early.rate ?? need("percent")}
          value={draft.percent}
          onChange={(percent) => update({ percent })}
          onBlur={leave("rate")}
          locale={locale}
          digits={5}
          {...percentUnit(locale)}
          parseError={numberInvalid}
        />
      ) : null}

      {draft.kind === "amount" ? (
        <NumberField
          size="sm"
          id={`${idPrefix}-amount`}
          label={metric.name}
          hint={strings.sheet.rateOnlyHint}
          error={rule("amount-negative") ?? early.amount ?? need("amount")}
          value={draft.amount}
          onChange={(amount) => update({ amount })}
          onBlur={leave("amount")}
          locale={locale}
          {...moneyUnit(currency, locale)}
          parseError={numberInvalid}
        />
      ) : null}

      {draft.kind === "duration" ? (
        <div className={styles.duration}>
          <NumberField
            size="sm"
            id={`${idPrefix}-duration`}
            label={metric.name}
            error={rule("duration-negative") ?? early.duration ?? need("duration")}
            value={draft.durationValue}
            onChange={(durationValue) => update({ durationValue })}
            onBlur={leave("duration")}
            locale={locale}
            digits={5}
            parseError={numberInvalid}
          />
          <Field group size="sm" label={w.durationUnit}>
            {({ labelId }) => (
              <Segmented
                labelledBy={labelId}
                value={draft.durationUnit}
                options={[
                  { id: "hours", label: w.hours },
                  { id: "days", label: w.days },
                ]}
                onChange={(durationUnit) => update({ durationUnit })}
              />
            )}
          </Field>
          {metric.variants?.length ? (
            <Field group size="sm" label={strings.sheet.variant}>
              {({ labelId }) => (
                <Segmented
                  labelledBy={labelId}
                  value={draft.statistic}
                  options={metric.variants!.map((v) => ({ id: v.id as "median" | "mean", label: v.label }))}
                  onChange={(statistic) => update({ statistic })}
                />
              )}
            </Field>
          ) : null}
        </div>
      ) : null}

      {draft.kind === "text" ? (
        <TextField
          size="sm"
          id={`${idPrefix}-text`}
          label={metric.name}
          error={rule("text-too-long") ?? need("text")}
          value={draft.text}
          onChange={(text) => update({ text })}
          maxLength={TEXT_LIMITS.value}
        />
      ) : null}
      {draft.kind === "text" && metric.choices?.length ? (
        <Choices
          size="sm"
          id={`${idPrefix}-evidence`}
          legend={strings.sheet.evidence}
          error={need("evidence")}
          value={draft.evidence || null}
          options={metric.choices.map((c) => ({ value: c.id as "data" | "interviews" | "hunch", label: c.label }))}
          onChange={(evidence) => update({ evidence })}
        />
      ) : null}

      {draft.kind === "choice" && metric.choices?.length ? (
        <Choices
          size="sm"
          id={`${idPrefix}-choice`}
          legend={metric.name}
          error={need("choice")}
          value={draft.choice || null}
          options={metric.choices.map((c) => ({ value: c.id, label: c.label }))}
          onChange={(choice) => update({ choice })}
        />
      ) : null}

      {kindToggle ? (
        <Button variant="quiet" size="sm" className={styles.textAction} onClick={() => update({ kind: kindToggle.to })}>
          {kindToggle.label}
        </Button>
      ) : null}

      {needsSource ? (
        <Select<Exclude<SourceChoice, "">>
          size="sm"
          id={`${idPrefix}-source`}
          label={strings.sheet.source}
          error={need("source")}
          value={draft.source}
          placeholder={w.choose}
          options={src}
          onChange={(source) => update({ source })}
        />
      ) : null}
      {needsSource && draft.source === "person" ? (
        <Select<RoleId>
          size="sm"
          id={`${idPrefix}-source-role`}
          label={w.sourceRole}
          value={draft.sourceRole}
          options={ROLES.map((role) => ({ value: role, label: strings.role[ROLE_KEY[role]] }))}
          onChange={(role) => role && update({ sourceRole: role })}
        />
      ) : null}

      {metric.variants?.length && draft.kind !== "duration" ? (
        <Choices
          size="sm"
          id={`${idPrefix}-variant`}
          legend={strings.sheet.variant}
          error={need("variant")}
          value={draft.variant || null}
          options={metric.variants.map((v) => ({ value: v.id, label: v.label }))}
          onChange={(variant) => update({ variant })}
        />
      ) : null}

      {shape.id === "acq.top-channel-share" ? (
        <TextField
          size="sm"
          id={`${idPrefix}-label`}
          label={strings.sheet.channelName}
          error={rule("label-too-long")}
          value={draft.label}
          onChange={(label) => update({ label })}
          maxLength={TEXT_LIMITS.label}
        />
      ) : null}
    </div>
  );
}
