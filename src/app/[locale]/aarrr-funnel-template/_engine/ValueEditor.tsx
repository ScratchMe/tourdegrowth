"use client";

import { TEXT_LIMITS, type MetricShape } from "@/lib/engine/catalog-shape";
import { ROLE_KEY, type ResolvedMetric } from "@/lib/engine/strings";
import type { RoleId } from "@/lib/engine/types";
import { formatMoney, formatNumber, formatPercent } from "@/lib/engine/format";
import type { DraftProblem, SheetDraft, SourceChoice } from "./sheet-draft";
import { isRule, ruleMessage } from "./sheet-problems";
import { currencySymbol, sourceOptions } from "./sources";
import { fill, midSentence } from "./text";
import type { EngineView } from "./view";
import { Choices } from "./_ui/Choices";
import { describedBy, Field } from "./_ui/Field";
import { NumberField } from "./_ui/NumberField";
import { SegmentedField } from "./_ui/SegmentedField";
import { Select } from "./_ui/Select";
import { TextField } from "./_ui/TextField";
import styles from "./Sheet.module.css";
import ui from "./_ui/ui.module.css";

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
  const currency = state.setup.currency;

  const numberInvalid = w.notANumber;

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
  const numId = `${idPrefix}-num`;
  const denId = `${idPrefix}-den`;

  return (
    <div className={styles.editor} data-testid="engine-value-editor">
      {draft.kind === "ratio" ? (
        <div className={styles.counts}>
          <Field label={metric.inputs?.numerator ?? metric.name} htmlFor={numId} hint={sharedHints?.numerator}>
            <NumberField
              id={numId}
              value={draft.numerator}
              onChange={(numerator) => update({ numerator })}
              locale={locale}
              integer={shape.unit !== "money"}
              unit={shape.unit === "money" ? currencySymbol(currency, locale) : undefined}
              describedBy={describedBy(numId, { hint: sharedHints?.numerator })}
              invalidMessage={shape.unit === "money" ? numberInvalid : w.notAWholeNumber}
            />
          </Field>
          <span className={styles.over} aria-hidden="true">
            {strings.sheet.over}
          </span>
          <Field
            label={metric.inputs?.denominator ?? metric.name}
            htmlFor={denId}
            hint={sharedHints?.denominator}
            error={rule("denominator-zero")}
          >
            <NumberField
              id={denId}
              value={draft.denominator}
              onChange={(denominator) => update({ denominator })}
              locale={locale}
              integer
              describedBy={describedBy(denId, { hint: sharedHints?.denominator, error: rule("denominator-zero") })}
              invalidMessage={w.notAWholeNumber}
            />
          </Field>
        </div>
      ) : null}
      {draft.kind === "ratio" && (live || rule("num-gt-den")) ? (
        <p className={rule("num-gt-den") ? ui.error : styles.live} data-testid="engine-live" aria-live="polite">
          {rule("num-gt-den") ?? live}
        </p>
      ) : null}

      {draft.kind === "rate" ? (
        <Field label={metric.name} hint={strings.sheet.rateOnlyHint} htmlFor={`${idPrefix}-rate`} error={rule("percent-range")}>
          <NumberField
            id={`${idPrefix}-rate`}
            value={draft.percent}
            onChange={(percent) => update({ percent })}
            locale={locale}
            unit="%"
            describedBy={describedBy(`${idPrefix}-rate`, { hint: strings.sheet.rateOnlyHint, error: rule("percent-range") })}
            invalidMessage={numberInvalid}
          />
        </Field>
      ) : null}

      {draft.kind === "amount" ? (
        <Field label={metric.name} hint={strings.sheet.rateOnlyHint} htmlFor={`${idPrefix}-amount`}>
          <NumberField
            id={`${idPrefix}-amount`}
            value={draft.amount}
            onChange={(amount) => update({ amount })}
            locale={locale}
            unit={currencySymbol(currency, locale)}
            describedBy={describedBy(`${idPrefix}-amount`, { hint: strings.sheet.rateOnlyHint })}
            invalidMessage={numberInvalid}
          />
        </Field>
      ) : null}

      {draft.kind === "duration" ? (
        <div className={styles.duration}>
          <Field label={metric.name} htmlFor={`${idPrefix}-duration`}>
            <NumberField
              id={`${idPrefix}-duration`}
              value={draft.durationValue}
              onChange={(durationValue) => update({ durationValue })}
              locale={locale}
              invalidMessage={numberInvalid}
            />
          </Field>
          <SegmentedField
            label={w.durationUnit}
            value={draft.durationUnit}
            options={[
              { id: "hours", label: w.hours },
              { id: "days", label: w.days },
            ]}
            onChange={(durationUnit) => update({ durationUnit })}
          />
          {metric.variants?.length ? (
            <SegmentedField
              label={strings.sheet.variant}
              value={draft.statistic}
              options={metric.variants.map((v) => ({ id: v.id as "median" | "mean", label: v.label }))}
              onChange={(statistic) => update({ statistic })}
            />
          ) : null}
        </div>
      ) : null}

      {draft.kind === "text" ? (
        <Field label={metric.name} htmlFor={`${idPrefix}-text`} error={rule("text-too-long")}>
          <TextField id={`${idPrefix}-text`} value={draft.text} onChange={(text) => update({ text })} limit={TEXT_LIMITS.value} />
        </Field>
      ) : null}
      {draft.kind === "text" && metric.choices?.length ? (
        <Choices
          name={`${idPrefix}-evidence`}
          legend={strings.sheet.evidence}
          value={draft.evidence || null}
          options={metric.choices.map((c) => ({ id: c.id as "data" | "interviews" | "hunch", label: c.label }))}
          onChange={(evidence) => update({ evidence })}
        />
      ) : null}

      {draft.kind === "choice" && metric.choices?.length ? (
        <Choices
          name={`${idPrefix}-choice`}
          legend={metric.name}
          value={draft.choice || null}
          options={metric.choices.map((c) => ({ id: c.id, label: c.label }))}
          onChange={(choice) => update({ choice })}
        />
      ) : null}

      {kindToggle ? (
        <button type="button" className={ui.linkButton} onClick={() => update({ kind: kindToggle.to })}>
          {kindToggle.label}
        </button>
      ) : null}

      {needsSource ? (
        <Field label={strings.sheet.source} htmlFor={`${idPrefix}-source`}>
          <Select<Exclude<SourceChoice, "">>
            id={`${idPrefix}-source`}
            value={draft.source}
            placeholder={w.choose}
            options={src.options}
            groups={src.groups}
            invalid={has("source")}
            onChange={(source) => update({ source })}
          />
        </Field>
      ) : null}
      {needsSource && draft.source === "person" ? (
        <Field label={w.sourceRole} htmlFor={`${idPrefix}-source-role`}>
          <Select<RoleId>
            id={`${idPrefix}-source-role`}
            value={draft.sourceRole}
            options={ROLES.map((role) => ({ id: role, label: strings.role[ROLE_KEY[role]] }))}
            onChange={(role) => role && update({ sourceRole: role })}
          />
        </Field>
      ) : null}

      {metric.variants?.length && draft.kind !== "duration" ? (
        <Choices
          name={`${idPrefix}-variant`}
          legend={strings.sheet.variant}
          value={draft.variant || null}
          options={metric.variants.map((v) => ({ id: v.id, label: v.label }))}
          onChange={(variant) => update({ variant })}
        />
      ) : null}

      {shape.id === "acq.top-channel-share" ? (
        <Field label={strings.sheet.channelName} htmlFor={`${idPrefix}-label`} error={rule("label-too-long")}>
          <TextField id={`${idPrefix}-label`} value={draft.label} onChange={(label) => update({ label })} limit={TEXT_LIMITS.label} />
        </Field>
      ) : null}
    </div>
  );
}
