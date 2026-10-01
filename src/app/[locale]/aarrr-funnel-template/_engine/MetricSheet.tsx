"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/core/Button";
import { Choices } from "@/components/core/Choices";
import { Field } from "@/components/core/Field";
import { FieldRow } from "@/components/core/FieldRow";
import { NumberField } from "@/components/core/NumberField";
import { isUnreadableNumber } from "@/lib/forms/number";
import { Select } from "@/components/core/Select";
import { Tag } from "@/components/core/Tag";
import { TextArea } from "@/components/core/TextArea";
import { TEXT_LIMITS, motionOfMetric, shapeOf, shapesOf, type MetricShape } from "@/lib/engine/catalog-shape";
import { BASIS_KEY, EFFORT_KEY, ROLE_KEY, SHEET_BASES, STATUS_KEY, type ResolvedMetric } from "@/lib/engine/strings";
import type { CandidateId, MetricEntry, MetricId, RoleId } from "@/lib/engine/types";
import { isImmature, nextMonth, periodRangeOf, windowDaysOf } from "@/lib/engine/cohort";
import { comparatorOf } from "@/lib/engine/diagnose";
import { formatInterval, formatMonthRange, formatNumber, roundDisplay } from "@/lib/engine/format";
import { isRequestStale } from "@/lib/engine/request";
import { blockingCheck } from "@/lib/engine/sanity";
import { hybridTrapOf, isCandidate as isCandidateId, numbered, positionIn, positionLabel, statusQuestionOf } from "@/lib/engine/phrases";
import { smallSampleOf } from "@/lib/engine/relays";
import { slgBaseNoun } from "@/lib/engine/sentences";
import { knownIn } from "@/lib/engine/values";
import { SHARED_COUNTS, knownSharedCount, sharedCountAt } from "@/lib/engine/shared-counts";
import { ComparisonStrip } from "./ComparisonStrip";
import { MissingTriage } from "./MissingTriage";
import { RequestCopy } from "./RequestCopy";
import { draftFromEntry, entryFromDraft, isWideRange, type DraftProblem, type SheetDraft, type SheetMode } from "./sheet-draft";
import { isRule, missingLabel, ruleMessage } from "./sheet-problems";
import { draftKey, dropDraft, keepDraft, keptDraft } from "./sheet-drafts";
import { moneyUnit, percentUnit, wordUnit, type NumberUnit } from "./sources";
import { catalogFill, daysBetween, domId, fill, formatMonth, joinList, metricById, midSentence, sourceLabel } from "./text";
import { ValueEditor } from "./ValueEditor";
import type { EngineActions, EngineView } from "./view";
import styles from "./Sheet.module.css";

const ROLES = Object.keys(ROLE_KEY) as RoleId[];

/** The unit inside a bound's or a target's box, placed by the page's language — a duration's word in the number's grammatical number (A11.1). */
function unitOf(shape: MetricShape, view: EngineView, value: number | null): NumberUnit {
  if (shape.unit === "percent") return percentUnit(view.ctx.locale);
  if (shape.unit === "money") return moneyUnit(view.state.setup.currency, view.ctx.locale);
  if (shape.unit === "duration") {
    const w = view.strings.workbench;
    return wordUnit({ one: w.day, other: w.days }, view.ctx.locale, value);
  }
  return {};
}

/**
 * The sheet of one number (spec §7 E3), in the spec's order: what it is and
 * how to compute it, which cohort to take, WHERE YOU ARE with it (nothing
 * pre-selected — a number nobody has looked at is "to fill in"), the answer
 * that status asks for, where to find it and its trap, its reference and
 * the team's target, what the Tour said about it, and a private note.
 *
 * The form is `sheet-draft.ts`; this component only lays it out. "Save" is
 * refused only for what the entry cannot mean (§6.9, D11) — everything
 * merely odd is saved and shown "to check" elsewhere — and it names what is
 * missing rather than reddening boxes before anyone has tried.
 */
export function MetricSheet({
  id,
  view,
  actions,
  variant = "board",
  onSaved,
}: {
  id: MetricId;
  view: EngineView;
  actions: EngineActions;
  /**
   * `step`: one number per screen in the step-by-step (Antoine, 2026-09-25).
   * The team target is asked on the step before, so it is not repeated here,
   * and saving moves on (`onSaved`).
   */
  variant?: "board" | "step";
  onSaved?: () => void;
}) {
  const { strings, ctx, state } = view;
  const locale = ctx.locale;
  const shape = shapeOf(id);
  const metric = metricById(view.metrics, id);
  const snapshot = state.snapshots[state.snapshots.length - 1]!;
  const entry = snapshot.metrics[id];
  const prefix = `engine-${domId(id)}`;
  const options = {
    hasVariants: Boolean(metric.variants?.length) && shape.id !== "act.ttv",
    hasChoices: Boolean(metric.choices?.length),
    hasNaReasons: Boolean(metric.naReasons?.length),
  };

  // A count several numbers share is typed once (shared-counts.ts): an empty side of this
  // number's counts starts from it, and the field says so.
  const shared = sharedSides(id, snapshot);
  // An unsaved draft comes back when the sheet is remounted (A15.12).
  const key = draftKey(id, entry);
  const [draft, setDraft] = useState<SheetDraft>(() => {
    const kept = keptDraft(key);
    if (kept) return kept;
    const d = draftFromEntry(entry, shape);
    if (d.kind !== "ratio") return d;
    return {
      ...d,
      numerator: d.numerator ?? shared.numerator?.value ?? null,
      denominator: d.denominator ?? shared.denominator?.value ?? null,
    };
  });
  const [attempted, setAttempted] = useState(false);
  // A refused save moves the focus to the first field it names (A15.3): its
  // label and its message are read out with it, where a line under the
  // button, outside any live region, said nothing to a screen reader. Counted,
  // so a second refusal moves it again.
  const [refusals, setRefusals] = useState(0);
  const sheetRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (refusals === 0) return;
    const root = sheetRef.current;
    const first = root?.querySelector<HTMLElement>('[aria-invalid="true"]') ?? root?.querySelector<HTMLElement>("[data-save-problems]");
    first?.focus();
  }, [refusals]);
  // Every refusal reads the same to the person — the device kept nothing, save a file — whether
  // it was the quota, storage switched off, or a store another tab left unreadable.
  const [outcome, setOutcome] = useState<"saved" | "failed" | null>(null);
  // Folded by default, even on a number still to fill in: where to find it and its trap are
  // read when needed, not scrolled past every time (Antoine, 2026-09-25).
  const [whereOpen, setWhereOpen] = useState(false);
  const update = (patch: Partial<SheetDraft>) => {
    setDraft((current) => {
      const next = { ...current, ...patch };
      keepDraft(key, next);
      return next;
    });
    setOutcome(null);
  };

  // Recomputed from the draft on every render once a save was tried, so a
  // problem disappears the moment it is fixed — never a stale red line.
  const problems: DraftProblem[] = attempted ? entryFromDraft(draft, shape, ctx.today.toISOString(), options).problems : [];
  const rules = problems.filter(isRule);

  function save() {
    setAttempted(true);
    const nowIso = new Date().toISOString();
    const built = entryFromDraft(draft, shape, nowIso, options);
    // The engine's own guard, on top of the form's: the same impossibility
    // (more of the part than of the whole) must block here and in an import.
    if (!built.entry || blockingCheck(built.entry, shape, locale)) {
      setRefusals((n) => n + 1);
      return;
    }
    const result = actions.saveEntry(id, built.entry);
    if (result.ok) dropDraft(key);
    setOutcome(result.ok ? "saved" : "failed");
    if (result.ok) onSaved?.();
  }

  // null, not 0, when the definition has no window: the sheet then prints no cohort line at all.
  const windowDays = shape.window ? windowDaysOf(shape, state.setup) : null;
  const variantLabel = metric.variants?.find((v) => v.id === (entry?.variant ?? draft.variant))?.label;
  const fillCatalog = (text: string) =>
    catalogFill(text, { state, locale, strings, metrics: view.metrics, windowDays, variantLabel, period: { id, today: ctx.today } });
  // The count labels carry the same placeholders as the formula ({n},
  // {cohort}, {event}): resolved once here, so the value editor and the two
  // conflicting readings never print a raw "{n}" as a field label.
  const filledMetric = metric.inputs
    ? { ...metric, inputs: { numerator: fillCatalog(metric.inputs.numerator), denominator: fillCatalog(metric.inputs.denominator) } }
    : metric;
  const missing = [...new Set(problems.filter((p) => !isRule(p)).map((p) => missingLabel(p, filledMetric, strings)))];
  // What the save still needs, said under the field itself too; the line under the button stays the index.
  const need = (p: DraftProblem) =>
    problems.includes(p) ? fill(strings.workbench.saveNeeds, { fields: missingLabel(p, filledMetric, strings) }) : null;

  const modes: { value: SheetMode; label: string }[] = [
    { value: "have", label: strings.sheet.haveIt },
    // A name or a mechanism cannot be "somewhere between": no estimate for words.
    ...(shape.unit === "text" || shape.unit === "choice" ? [] : [{ value: "estimate" as const, label: strings.sheet.canEstimate }]),
    { value: "ask", label: strings.sheet.willAsk },
    { value: "cantFind", label: strings.sheet.cantFind },
  ];

  const eventMeasured = snapshot.metrics["act.event"]?.status === "measured";
  const isCandidate = isCandidateId(id);
  // knownIn grades a cohort number entered on an immature month as approximate (§6.3),
  // exactly as the board row and the peloton read it — one number, one reading.
  const known = knownIn(state, id, ctx);
  const comparator = isCandidate ? comparatorOf(state, id as CandidateId) : undefined;
  // Its own motion's diagnosis: a sales-assisted rate sits against sales-assisted's targets (§18.5.2).
  const motionDiagnosis = view.derived.motions.find((m) => m.motion === motionOfMetric(id))?.diagnosis ?? view.derived.diagnosis;
  const position = isCandidate ? positionIn(motionDiagnosis, id as CandidateId)?.position : undefined;
  const hybrid = state.setup.motions.plg && state.setup.motions.slg;
  // Three months for everything sales-assisted (C25 Q2), « de juin à août 2026 » — and the link, read on the same opportunities.
  const range = shape.span > 1 ? periodRangeOf(shape, entry, snapshot, state.setup, ctx.today) : null;
  // « Sur 25 opportunités conclues, un de plus ou de moins bouge le taux de 4 points » (§18.5.1).
  const sample = shape.scope === "slg" ? smallSampleOf(snapshot, id) : null;
  const trap = hybridTrapOf(id, state.setup.motions);
  // The company-wide margin, in the hybrid only, on the two margin sheets (C25 Q4).
  const marginSheet = hybrid && (id === "rev.gross-margin" || id === "slg.rev.gross-margin");
  const otherMargin = id === "rev.gross-margin" ? snapshot.metrics["slg.rev.gross-margin"] : snapshot.metrics["rev.gross-margin"];
  const companyWideElsewhere = companyWide(otherMargin);
  const target = snapshot.targets[id];
  const bench = shape.benchmark;
  // The strip is decorative; this sentence is what it says, in words — said
  // physically, so churn behind its reference reads « au-dessus » (P7a).
  const positionText = known.kind !== "known" || !position ? null : positionLabel(position, comparator, strings);
  const formatBound = (v: number) => formatInterval({ lo: v, hi: v }, shape.unit === "percent" ? "percent" : "ratio", ctx, strings.units);

  const bridge = view.bridges.find((b) => b.metric === id);
  const answerIndex = bridge ? view.tourResult?.answers?.[bridge.questionId] : undefined;
  const declared = bridge && answerIndex !== undefined ? bridge.options[answerIndex] : undefined;

  const requestedAt = entry?.request?.remindedAt ?? entry?.request?.requestedAt;
  const stale = isRequestStale(entry, ctx.today);

  // "Also in Stripe: ARPA, churn" — the other numbers that sit in the same
  // tool, among the ones this setup asks for (§18.2.1).
  const shown = new Set<MetricId>(shapesOf(state.setup.motions).map((s) => s.id));
  const alsoIn = metric.where
    .filter((w) => w.source.kind === "tool")
    .map((w) => {
      const tool = w.source.kind === "tool" ? w.source.tool : null;
      const others = view.metrics.filter((m) => m.id !== id && shown.has(m.id) && m.where.some((o) => o.source.kind === "tool" && o.source.tool === tool));
      return { tool, others };
    })
    .filter((x): x is { tool: NonNullable<typeof x.tool>; others: ResolvedMetric[] } => x.tool !== null && x.others.length > 0);
  const [alsoBefore = ""] = strings.sheet.alsoIn.split("{metrics}");

  return (
    // A form, so Enter in a box saves, as on any other form (A15.20, Jakob's
    // law, decided by Antoine on 2026-10-01). Nothing is sent anywhere: the
    // submit is the sheet's own save, on this device. The Save button is the
    // form's one submit; every other Button is `type="button"` by default.
    <form
      ref={sheetRef}
      className={styles.sheet}
      data-testid={`engine-sheet-${domId(id)}`}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <div className={styles.meta}>
        <Tag tone="outline">{strings.effort[EFFORT_KEY[shape.effort]]}</Tag>
        <a className={styles.definitionLink} href={metric.glossaryHref} target="_blank" rel="noopener">
          {strings.sheet.definition}
        </a>
      </div>
      <p className={styles.oneLiner}>{fillCatalog(metric.oneLiner)}</p>

      <div className={styles.formulaBlock}>
        <span className={styles.metaLabel}>{strings.sheet.formula}</span>
        <p className={styles.formula}>{fillCatalog(metric.formula)}</p>
      </div>

      {range ? (
        <p className={styles.cohort} data-testid="engine-sheet-period">
          {shape.flow === "cohort" && windowDays !== null
            ? fill(strings.sheet.periodSlgCohort, { period: formatMonthRange(range, locale, strings.units, "from"), n: windowDays })
            : fill(strings.sheet.periodSlg, { period: formatMonthRange(range, locale, strings.units, "from") })}
        </p>
      ) : shape.flow === "cohort" && windowDays !== null ? (
        <p className={styles.cohort}>
          {fill(strings.sheet.cohortToUse, {
            cohort: formatMonth(snapshot.cohortMonth, locale),
            next: formatMonth(nextMonth(snapshot.cohortMonth), locale),
            n: windowDays,
          })}
          {isImmature(snapshot.cohortMonth, windowDays, ctx.today) ? ` ${strings.sheet.immatureCohort}` : ""}
        </p>
      ) : null}

      {shape.dependsOn === "act.event" && !eventMeasured ? <p className={styles.caveat}>{strings.sheet.dependsOnEvent}</p> : null}

      {sample ? (
        <p className={styles.caveat} data-testid="engine-small-sample-sheet">
          {/* The finding's own sentence and number: « 4 points », « 0,8 point ». */}
          {fill(strings.findings[numbered("smallSample", { lo: roundDisplay(sample.points), hi: roundDisplay(sample.points) }, locale)], {
            d: formatNumber(sample.denominator, locale),
            base: slgBaseNoun(id, state, strings),
            p: formatInterval({ lo: sample.points, hi: sample.points }, "ratio", ctx, strings.units),
          })}
        </p>
      ) : null}

      {marginSheet && draft.basis !== "company-wide" ? (
        <div className={styles.saveRow}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              // Saved as an estimate on the company's margin: approximate, never found (C25 Q4).
              update({
                mode: "estimate",
                basis: "company-wide",
                low: draft.low ?? companyWideElsewhere?.low ?? null,
                high: draft.high ?? companyWideElsewhere?.high ?? null,
              })
            }
            data-testid={`engine-company-wide-${domId(id)}`}
          >
            {strings.sheet.companyWide}
          </Button>
        </div>
      ) : null}
      <Choices
        size="sm"
        id={`${prefix}-mode`}
        legend={statusQuestionOf(id, strings)}
        value={draft.mode}
        options={modes}
        onChange={(mode) => update({ mode })}
        columns={2}
      />

      {draft.mode === "have" ? (
        <>
          <ValueEditor
            idPrefix={prefix}
            draft={draft}
            update={update}
            shape={shape}
            metric={filledMetric}
            view={view}
            problems={problems}
            sharedHints={{
              numerator: shared.numerator ? sharedHint(shared.numerator.others, view) : undefined,
              denominator: shared.denominator ? sharedHint(shared.denominator.others, view) : undefined,
            }}
          />
          <DefinitionNote prefix={prefix} draft={draft} update={update} view={view} error={problems.includes("definition-too-long")} />
        </>
      ) : null}

      {draft.mode === "estimate" ? (
        <div className={styles.editor} data-testid="engine-estimate">
          {/* « At least » / « At most » name themselves: a pair with no joiner,
              and the rule about the two belongs to the row. */}
          <FieldRow
            error={
              draft.low !== null && draft.high !== null && draft.low > draft.high
                ? strings.sheet.lowAboveHigh
                : problems.includes("percent-range")
                  ? strings.workbench.percentRange
                  : undefined
            }
          >
            <NumberField
              size="sm"
              id={`${prefix}-low`}
              label={strings.sheet.low}
              error={need("low")}
              value={draft.low}
              onChange={(low) => update({ low })}
              locale={locale}
              {...unitOf(shape, view, draft.low)}
              parseError={strings.workbench.notANumber}
            />
            <NumberField
              size="sm"
              id={`${prefix}-high`}
              label={strings.sheet.high}
              error={need("high")}
              value={draft.high}
              onChange={(high) => update({ high })}
              locale={locale}
              {...unitOf(shape, view, draft.high)}
              parseError={strings.workbench.notANumber}
            />
          </FieldRow>
          {draft.low !== null && draft.high !== null && draft.low > draft.high ? null : isWideRange(draft.low, draft.high) ? (
            <p className={styles.caveat} data-testid="engine-wide-range">
              {strings.sheet.wideRange}
            </p>
          ) : null}
          {draft.basis === "company-wide" ? (
            // The company's margin stands in for this motion's: said, with what it costs, never offered as a basis to pick.
            <div data-testid="engine-company-wide">
              <p className={styles.metaLabel}>{strings.basis.companyWide}</p>
              <p className={styles.caveat}>{strings.sheet.companyWideHint}</p>
              {companyWideElsewhere ? (
                <p className={styles.caveat}>
                  {fill(strings.sheet.companyWidePrefilled, { motion: strings.hybrid.motionAdjective[id === "rev.gross-margin" ? "slg" : "plg"] })}
                </p>
              ) : null}
            </div>
          ) : (
            <Choices
              size="sm"
              id={`${prefix}-basis`}
              legend={strings.sheet.basis}
              error={need("basis")}
              value={draft.basis || null}
              options={SHEET_BASES.map((b) => ({ value: b, label: strings.basis[BASIS_KEY[b]] }))}
              onChange={(basis) => update({ basis })}
              columns={2}
            />
          )}
        </div>
      ) : null}

      {draft.mode === "ask" ? (
        <div className={styles.editor} data-testid="engine-ask">
          <Select<RoleId>
            size="sm"
            id={`${prefix}-role`}
            label={strings.request.role}
            value={draft.requestRole}
            options={ROLES.map((role) => ({ value: role, label: strings.role[ROLE_KEY[role]] }))}
            onChange={(role) => role && update({ requestRole: role })}
          />
          <DefinitionNote prefix={prefix} draft={draft} update={update} view={view} error={problems.includes("definition-too-long")} />
          {entry?.status === "requested" && requestedAt ? (
            <p className={stale ? styles.error : styles.caveat}>
              {stale
                ? fill(strings.request.stale, { n: daysBetween(requestedAt, ctx.today) })
                : `${strings.status.requested} · ${strings.role[ROLE_KEY[entry.request?.role ?? draft.requestRole]]}`}
            </p>
          ) : null}
          <RequestCopy
            role={draft.requestRole}
            ids={[id]}
            label={entry?.status === "requested" ? strings.request.remind : strings.request.copy}
            view={withDefinition(view, id, draft.definitionNote)}
            onCopied={() => {
              if (entry?.status === "requested") {
                actions.markReminded([id]);
                return;
              }
              // The copy IS the request: it writes `requested`, stamped now,
              // with the definition just typed — so the message and the
              // stored entry say the same thing.
              const built = entryFromDraft({ ...draft, mode: "ask" }, shape, new Date().toISOString(), options);
              if (built.entry) actions.saveEntry(id, built.entry);
            }}
          />
        </div>
      ) : null}

      {draft.mode === "cantFind" ? (
        <MissingTriage
          idPrefix={prefix}
          draft={draft}
          update={update}
          shape={shape}
          metric={filledMetric}
          view={view}
          problems={problems}
          onRequested={(role) => actions.markRequested([id], role)}
        />
      ) : null}

      <div className={styles.where}>
        <button
          type="button"
          className={styles.whereToggle}
          aria-expanded={whereOpen}
          aria-controls={`${prefix}-where`}
          onClick={() => setWhereOpen((open) => !open)}
        >
          {strings.sheet.whereTitle}
        </button>
        {whereOpen ? (
          <div id={`${prefix}-where`} className={styles.whereBody}>
            <ul className={styles.whereList}>
              {metric.where.map((w) => (
                <li key={`${w.label}-${w.path}`}>
                  <span className={styles.whereSource}>{sourceLabel(w.source, strings) || w.label}</span>
                  {w.label && w.label !== sourceLabel(w.source, strings) ? <span> · {w.label}</span> : null}
                  <span className={styles.wherePath}>{fillCatalog(w.path)}</span>
                </li>
              ))}
            </ul>
            <p className={styles.trap}>
              <span className={styles.metaLabel}>{strings.sheet.trapTitle}</span> {fillCatalog(metric.trap)}
            </p>
            {/* Five self-serve sheets have a second trap in the hybrid, and only there (C25 Q3, §18.4.6). */}
            {trap ? (
              <p className={styles.trap} data-testid="engine-hybrid-trap">
                <span className={styles.metaLabel}>{strings.sheet.hybridTrapTitle}</span> {strings.sheet.hybridTrap[trap]}
              </p>
            ) : null}
            {alsoIn.map(({ tool, others }) => (
              <p key={tool} className={styles.alsoIn}>
                {fill(alsoBefore, { tool: strings.tools[tool] })}
                {others.map((other, i) => (
                  <span key={other.id}>
                    {i > 0 ? (i === others.length - 1 ? strings.grammar.and : strings.grammar.listSeparator) : null}
                    <button type="button" className={styles.inlineLink} onClick={() => actions.openMetric(other.id)}>
                      {midSentence(other.name, locale)}
                    </button>
                  </span>
                ))}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      {bench || isCandidate ? (
        <div className={styles.reference} data-testid="engine-reference">
          <span className={styles.metaLabel}>{strings.sheet.reference}</span>
          {shape.unit === "percent" ? (
            <ComparisonStrip
              value={known.kind === "known" ? known.value : null}
              below={position === "below"}
              reference={bench ? { lo: bench.lo, hi: bench.hi } : undefined}
              target={target}
              formatBound={formatBound}
              strings={strings}
            />
          ) : null}
          <p className={styles.referenceText}>
            {bench
              ? fill(strings.sheet.referenceContext, {
                  range: formatInterval({ lo: bench.lo, hi: bench.hi }, shape.unit === "percent" ? "percent" : "ratio", ctx, strings.units),
                  caveat: metric.benchmarkCaveat ?? "",
                })
              : fill(strings.sheet.noReference, { reason: metric.noReferenceReason ?? "" })}
          </p>
          {isCandidate && variant === "board" ? (
            <TargetField id={id} prefix={prefix} target={target} unitFor={(value) => unitOf(shape, view, value)} view={view} actions={actions} />
          ) : null}
          {positionText ? (
            <p className={[styles.position, position === "below" ? styles.positionBelow : ""].filter(Boolean).join(" ")} data-testid="engine-position">
              {positionText}
            </p>
          ) : null}
        </div>
      ) : null}

      {declared ? (
        <p className={styles.declared} data-testid="engine-declared">
          {fill(strings.sheet.declaredAtTour, {
            answer: declared.label,
            points: declared.points,
            found: midSentence(strings.status[STATUS_KEY[entry?.status ?? "todo"]], locale),
          })}
        </p>
      ) : null}

      <Field
        size="sm"
        id={`${prefix}-note`}
        label={strings.sheet.note}
        hint={strings.sheet.noteHint}
        error={problems.includes("note-too-long") ? ruleMessage("note-too-long", filledMetric, strings, locale) : null}
      >
        {({ id: noteId, describedBy, invalid }) => (
          <TextArea
            id={noteId}
            value={draft.note}
            onChange={(note) => update({ note })}
            maxLength={TEXT_LIMITS.note}
            invalid={invalid}
            aria-describedby={describedBy}
            rows={3}
          />
        )}
      </Field>

      {/* The copy button of "I'll ask for it" is that mode's save: the request is what gets recorded. */}
      {variant === "step" && draft.mode === "ask" ? (
        <div className={styles.saveRow}>
          <Button onClick={() => onSaved?.()} data-testid={`engine-continue-${domId(id)}`}>
            {strings.steps.continue}
          </Button>
        </div>
      ) : null}
      {draft.mode !== "ask" ? (
        <div className={styles.saveRow}>
          <Button
            type="submit"
            variant={variant === "step" ? "primary" : "secondary"}
            disabled={draft.mode === null}
            data-testid={`engine-save-${domId(id)}`}
          >
            {variant === "step" ? strings.sheet.saveNext : strings.sheet.save}
          </Button>
          <p className={styles.saved} role="status" aria-live="polite" data-testid={`engine-saved-${domId(id)}`}>
            {outcome === "saved" ? strings.workbench.saved : ""}
          </p>
        </div>
      ) : null}
      {missing.length ? (
        <p className={styles.error} data-testid="engine-save-needs" data-save-problems tabIndex={-1}>
          {fill(strings.workbench.saveNeeds, { fields: joinList(missing, strings.grammar) })}
        </p>
      ) : null}
      {rules
        .filter((p) => p !== "num-gt-den" && p !== "denominator-zero")
        .map((p) => (
          <p key={p} className={styles.error} data-save-problems tabIndex={-1}>
            {ruleMessage(p, filledMetric, strings, locale)}
          </p>
        ))}
      {outcome === "failed" ? (
        <p className={styles.error} role="alert">
          {strings.storage.writeFailed}
        </p>
      ) : null}
    </form>
  );
}

/** "Your definition" — the line that travels with the number into the copied request and the deck's appendix. */
function DefinitionNote({
  prefix,
  draft,
  update,
  view,
  error,
}: {
  prefix: string;
  draft: SheetDraft;
  update: (patch: Partial<SheetDraft>) => void;
  view: EngineView;
  error: boolean;
}) {
  const { strings } = view;
  return (
    <Field
      size="sm"
      id={`${prefix}-definition`}
      label={strings.sheet.definitionNote}
      optional={strings.workbench.optional}
      hint={strings.sheet.definitionNoteHint}
      error={error ? fill(strings.sheet.tooLong, { n: TEXT_LIMITS.definitionNote }) : null}
    >
      {({ id: definitionId, describedBy, invalid }) => (
        <TextArea
          id={definitionId}
          value={draft.definitionNote}
          onChange={(definitionNote) => update({ definitionNote })}
          maxLength={TEXT_LIMITS.definitionNote}
          invalid={invalid}
          aria-describedby={describedBy}
          rows={2}
        />
      )}
    </Field>
  );
}

/**
 * "Your target" — written on blur, not on the sheet's save: a team can know
 * where it wants a stage to be before it has the number, and a target is
 * what lets the diagnosis name a bottleneck at all (D8).
 */
function TargetField({
  id,
  prefix,
  target,
  unitFor,
  view,
  actions,
}: {
  id: MetricId;
  prefix: string;
  target: number | undefined;
  unitFor: (value: number | null) => NumberUnit;
  view: EngineView;
  actions: EngineActions;
}) {
  const [value, setValue] = useState<number | null>(target ?? null);
  return (
    <NumberField
      size="sm"
      id={`${prefix}-target`}
      label={view.strings.sheet.target}
      optional={view.strings.workbench.optional}
      hint={view.strings.sheet.targetHint}
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
      {...unitFor(value)}
      parseError={view.strings.workbench.notANumber}
    />
  );
}

/** The view a request is built from, with the definition as it is typed right now — so the message carries it before the save does. */
function withDefinition(view: EngineView, id: MetricId, definitionNote: string): EngineView {
  const snapshots = view.state.snapshots;
  const last = snapshots[snapshots.length - 1]!;
  const entry = last.metrics[id] ?? { status: "todo" as const, updatedAt: view.ctx.today.toISOString() };
  const patched = { ...last, metrics: { ...last.metrics, [id]: { ...entry, definitionNote: definitionNote.trim() || undefined } } };
  return { ...view, state: { ...view.state, snapshots: [...snapshots.slice(0, -1), patched] } };
}

/**
 * The shared counts on each side of this number's counts: the value already
 * typed (the base, or another number's entry) and the other numbers that use
 * it — named in the hint, so « changing it here changes it everywhere » says
 * where.
 */
function sharedSides(
  id: MetricId,
  snapshot: EngineView["state"]["snapshots"][number],
): Partial<Record<"numerator" | "denominator", { value: number | null; others: MetricId[] }>> {
  const out: Partial<Record<"numerator" | "denominator", { value: number | null; others: MetricId[] }>> = {};
  for (const side of ["numerator", "denominator"] as const) {
    const count = sharedCountAt(id, side);
    if (!count) continue;
    const known = knownSharedCount(snapshot, count);
    out[side] = {
      value: known?.value ?? null,
      others: SHARED_COUNTS[count].map((slot) => slot.metric).filter((m) => m !== id),
    };
  }
  return out;
}

function sharedHint(others: MetricId[], view: EngineView): string {
  const names = others.map((m) => midSentence(metricById(view.metrics, m).name, view.ctx.locale));
  return fill(view.strings.sheet.sharedHint, { metrics: joinList(names, view.strings.grammar) });
}

/** A margin entered as the company's (C25 Q4): its bounds, to prefill the other motion's sheet with. */
function companyWide(entry: MetricEntry | undefined): { low: number; high: number } | null {
  return entry?.status === "estimated" && entry.estimate?.basis === "company-wide" ? { low: entry.estimate.low, high: entry.estimate.high } : null;
}
