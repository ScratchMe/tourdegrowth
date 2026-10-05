"use client";

import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { Button } from "@/components/core/Button";
import { Choices } from "@/components/core/Choices";
import { Disclosure } from "@/components/core/Disclosure";
import { Field } from "@/components/core/Field";
import { FieldRow } from "@/components/core/FieldRow";
import { NumberField } from "@/components/core/NumberField";
import { Select } from "@/components/core/Select";
import { TextArea } from "@/components/core/TextArea";
import { AnswerSwitch, type OtherAnswer } from "@/components/engine/AnswerSwitch";
import { HowItCompares } from "@/components/engine/HowItCompares";
import { NumberSheet } from "@/components/engine/NumberSheet";
import { TrapNote } from "@/components/engine/TrapNote";
import { WhereToFind } from "@/components/engine/WhereToFind";
import { isUnreadableNumber } from "@/lib/forms/number";
import { TEXT_LIMITS, motionOfMetric, shapeOf, shapesOf, type MetricShape } from "@/lib/engine/catalog-shape";
import { displayShapeOf } from "@/lib/engine/business-type";
import { BASIS_KEY, EFFORT_KEY, ROLE_KEY, SHEET_BASES, type ResolvedMetric } from "@/lib/engine/strings";
import type { CandidateId, Interval, MetricEntry, MetricId, RoleId } from "@/lib/engine/types";
import { isImmature, nextMonth, periodRangeOf, windowDaysOf } from "@/lib/engine/cohort";
import { comparatorOf } from "@/lib/engine/diagnose";
import { formatInterval, formatMonthRange, formatNumber, roundDisplay } from "@/lib/engine/format";
import { isRequestStale } from "@/lib/engine/request";
import { blockingCheck } from "@/lib/engine/sanity";
import { TRAPS_ASKING_DEFINITION, hybridTrapOf, isCandidate as isCandidateId, numbered, positionIn, positionLabel, statusQuestionOf } from "@/lib/engine/phrases";
import { smallSampleOf } from "@/lib/engine/relays";
import { proposedFromBefore } from "@/lib/engine/series";
import { slgBaseNoun } from "@/lib/engine/sentences";
import { teamTools } from "@/lib/engine/tools";
import { knownIn } from "@/lib/engine/values";
import { knownSharedCount, sharedCountAt, sharedWith } from "@/lib/engine/shared-counts";
import { MissingTriage } from "./MissingTriage";
import { RequestCopy } from "./RequestCopy";
import { draftFromEntry, entryFromDraft, isWideRange, withProposals, type DraftProblem, type SheetDraft, type SheetMode } from "./sheet-draft";
import { isRule, missingLabel, ruleMessage } from "./sheet-problems";
import { draftKey, dropDraft, keepDraft, keptDraft } from "./sheet-drafts";
import { moneyUnit, percentUnit, wordUnit, type NumberUnit } from "./sources";
import { catalogFill, daysBetween, domId, fill, formatDate, formatMonth, joinList, metricById, midSentence, sourceLabel } from "./text";
import { EngineTerm } from "./EngineTerm";
import { ValueEditor } from "./ValueEditor";
import type { EngineActions, EngineView } from "./view";
import styles from "./Sheet.module.css";

const ROLES = Object.keys(ROLE_KEY) as RoleId[];

/** The three other answers and the modes they write (sheet-draft.ts): « je l'ai » is the boxes themselves. */
const ANSWER_OF: Record<SheetMode, OtherAnswer | null> = { have: null, estimate: "estimate", ask: "ask", cantFind: "cant" };
const MODE_OF: Record<OtherAnswer, SheetMode> = { estimate: "estimate", ask: "ask", cant: "cantFind" };

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

/** What the sheet is, when it is the whole screen (a number opened from the board's list, or reached by continuing): where the number sits, and its heading. */
export interface SheetScreen {
  position: ReactNode;
  headingId: string;
  headingRef?: Ref<HTMLHeadingElement>;
  /** The header's right: what remains (EngineProgress sm, « 6 à faire »). */
  progress?: ReactNode;
}

/**
 * The screen of one number (spec §7 E3), laid out as the simpler engine's
 * NumberSheet (design system extension 07, A18 T1): one question, and its
 * knowledge attached to what it explains. In order: what it is and how to
 * compute it, what the Tour said, the TRAP (open, before the value: it
 * changes what one types), where to find it (folded, its summary naming the
 * tools), the VALUE — the boxes are the question, the three other answers
 * one tap under them — how it compares (the reference, the team's target and
 * the verdict as one object), then the definition and a note, folded.
 *
 * The form is `sheet-draft.ts`; this component only lays it out, and writes
 * what it wrote before. Nothing is chosen for the person: a save with no
 * other answer chosen is read as the value boxes, so it names the boxes still
 * empty rather than an answer to pick. "Save" is refused only for what the
 * entry cannot mean (§6.9, D11) — everything merely odd is saved and shown
 * "to check" elsewhere.
 */
export function MetricSheet({
  id,
  view,
  actions,
  next,
  screen,
  extraActions,
}: {
  id: MetricId;
  view: EngineView;
  actions: EngineActions;
  /**
   * Saving moves on (A18 T3.b, the step-by-step folded into the board): the
   * primary says where — « Enregistre et continue → », or « … et vois ton
   * moteur → » for the last — and `onSaved` goes there. A copied request is
   * the save of « Je le demande »: « Continue → » then moves on. Absent (a
   * past month corrected), the sheet only saves.
   */
  next?: { label: string; onSaved: () => void };
  /** The sheet is the whole screen (a number opened from the board's list, or reached by continuing): it carries the card and the heading. */
  screen?: SheetScreen;
  /** Quiet actions after the save: « Passe pour l'instant ». */
  extraActions?: ReactNode;
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
  // number's counts starts from it, and the line under the boxes says so.
  const shared = sharedSides(id, snapshot, view.metrics);
  // An unsaved draft comes back when the sheet is remounted (A15.12), in its own month (A14 T2).
  const key = draftKey(id, entry, snapshot.referenceMonth);
  const [draft, setDraft] = useState<SheetDraft>(() => {
    const kept = keptDraft(key);
    if (kept) return kept;
    // A new month offers the month before's definition and source, never its value (§19.2.2).
    const d = withProposals(draftFromEntry(entry, shape), proposedFromBefore(view.state, id));
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
  const sheetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (refusals === 0) return;
    const root = sheetRef.current;
    const first = root?.querySelector<HTMLElement>('[aria-invalid="true"]') ?? root?.querySelector<HTMLElement>("[data-save-problems]");
    first?.focus();
  }, [refusals]);
  // Every refusal reads the same to the person — the device kept nothing, save a file — whether
  // it was the quota, storage switched off, or a store another tab left unreadable.
  const [outcome, setOutcome] = useState<"saved" | "failed" | null>(null);
  // « Ta définition et une note », folded; the trap's « Écrire ta définition » opens it and
  // moves the focus to the definition — the person asked for that move.
  const [wordsOpen, setWordsOpen] = useState(false);
  const [toDefinition, setToDefinition] = useState(0);
  useEffect(() => {
    if (toDefinition === 0) return;
    document.getElementById(`${prefix}-definition`)?.focus();
  }, [toDefinition, prefix]);
  const update = (patch: Partial<SheetDraft>) => {
    setDraft((current) => {
      const next = { ...current, ...patch };
      keepDraft(key, next);
      return next;
    });
    setOutcome(null);
  };
  // Typing in the boxes is the answer « je l'ai »: nothing to pick first.
  const updateValue = (patch: Partial<SheetDraft>) => update(draft.mode === "have" ? patch : { ...patch, mode: "have" });

  // No other answer chosen: the boxes are the question, and a save reads them.
  const answered: SheetDraft = draft.mode === null ? { ...draft, mode: "have" } : draft;
  // Recomputed from the draft on every render once a save was tried, so a
  // problem disappears the moment it is fixed — never a stale red line.
  const problems: DraftProblem[] = attempted ? entryFromDraft(answered, shape, ctx.today.toISOString(), options).problems : [];
  const rules = problems.filter(isRule);
  const wordsProblem = problems.includes("definition-too-long") || problems.includes("note-too-long");

  function save() {
    setAttempted(true);
    const nowIso = new Date().toISOString();
    const built = entryFromDraft(answered, shape, nowIso, options);
    // The engine's own guard, on top of the form's: the same impossibility
    // (more of the part than of the whole) must block here and in an import.
    if (!built.entry || blockingCheck(built.entry, shape, locale)) {
      // A text too long sits in the folded words: open them, so the focus can land on it.
      if (built.problems.includes("definition-too-long") || built.problems.includes("note-too-long")) setWordsOpen(true);
      setRefusals((n) => n + 1);
      return;
    }
    const result = actions.saveEntry(id, built.entry);
    if (result.ok) dropDraft(key);
    setOutcome(result.ok ? "saved" : "failed");
    if (result.ok) next?.onSaved();
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

  const words = shape.unit === "text" || shape.unit === "choice";
  const others: { value: OtherAnswer; label: string }[] = [
    // A name or a mechanism cannot be "somewhere between": no estimate for words.
    ...(words ? [] : [{ value: "estimate" as const, label: strings.sheet.canEstimate }]),
    { value: "ask", label: strings.sheet.willAsk },
    { value: "cant", label: strings.sheet.cantFind },
  ];
  const answer = draft.mode ? ANSWER_OF[draft.mode] : null;

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
  const hybridTrap = hybridTrapOf(id, state.setup.motions);
  // The company-wide margin, in the hybrid only, on the two margin sheets (C25 Q4).
  const marginSheet = hybrid && (id === "rev.gross-margin" || id === "slg.rev.gross-margin");
  const otherMargin = id === "rev.gross-margin" ? snapshot.metrics["slg.rev.gross-margin"] : snapshot.metrics["rev.gross-margin"];
  const companyWideElsewhere = companyWide(otherMargin);
  const target = snapshot.targets[id];
  // The reference the engine's type shows (§21.4.3): an app has the retention's and none of the SaaS ones.
  const bench = displayShapeOf(id, state.setup.type).benchmark;

  // Which months to count: the denominator's hint when it is a cohort, a line otherwise (design system extension 07).
  const period = range
    ? shape.flow === "cohort" && windowDays !== null
      ? fill(strings.sheet.periodSlgCohort, { period: formatMonthRange(range, locale, strings.units, "from"), n: windowDays })
      : fill(strings.sheet.periodSlg, { period: formatMonthRange(range, locale, strings.units, "from") })
    : shape.flow === "cohort" && windowDays !== null
      ? fill(strings.sheet.cohortToUse, {
          cohort: formatMonth(snapshot.cohortMonth, locale),
          next: formatMonth(nextMonth(snapshot.cohortMonth), locale),
          n: windowDays,
        }) + (isImmature(snapshot.cohortMonth, windowDays, ctx.today) ? ` ${strings.sheet.immatureCohort}` : "")
      : null;
  // Self-serve's cohort numbers carry « cohorte »'s « ? » on their months (A18 T6): the word they are first read with.
  const cohortTerm = !range && shape.flow === "cohort" && windowDays !== null;
  const periodHint = period ? (
    <span data-testid="engine-sheet-period">
      {period}
      {cohortTerm ? <EngineTerm id="cohort" strings={strings} /> : null}
    </span>
  ) : null;
  const periodOnDenominator = shape.flow === "cohort";

  const bridge = view.bridges.find((b) => b.metric === id);
  const answerIndex = bridge ? view.tourResult?.answers?.[bridge.questionId] : undefined;
  const declared = bridge && answerIndex !== undefined ? bridge.options[answerIndex] : undefined;

  const requestedAt = entry?.request?.remindedAt ?? entry?.request?.requestedAt;
  const stale = isRequestStale(entry, ctx.today);

  // Where to find it: the catalogue's places, the tool named once; the team's own tools first.
  const team = teamTools(state.setup.tools, state.setup.type);
  const places = metric.where.map((w) => ({
    tool: w.label || sourceLabel(w.source, strings),
    path: fillCatalog(w.path),
    yours: w.source.kind === "tool" && team.includes(w.source.tool),
  }));
  // "Also in Stripe: ARPA, churn" — the other numbers that sit in the same
  // tool, among the ones this setup asks for (§18.2.1).
  const shown = new Set<MetricId>(shapesOf(state.setup).map((s) => s.id));
  const alsoIn = metric.where
    .filter((w) => w.source.kind === "tool")
    .map((w) => {
      const tool = w.source.kind === "tool" ? w.source.tool : null;
      const others = view.metrics.filter((m) => m.id !== id && shown.has(m.id) && m.where.some((o) => o.source.kind === "tool" && o.source.tool === tool));
      return { tool, others };
    })
    .filter((x): x is { tool: NonNullable<typeof x.tool>; others: ResolvedMetric[] } => x.tool !== null && x.others.length > 0);
  const [alsoBefore = ""] = strings.sheet.alsoIn.split("{metrics}");

  // How it compares: one chart for a number, in the display unit the catalogue's reference and the target use.
  const numeric = !words;
  const unitWords = strings.units;
  const currency = state.setup.currency;
  const show = (i: Interval) => formatInterval(i, shape.unit, ctx, unitWords, { currency });
  const knownValue = known.kind === "known" ? known.value : null;
  const figure = knownValue && knownValue.lo === knownValue.hi ? knownValue.lo : null;
  const band = bench ? ([bench.lo, bench.hi] as const) : undefined;
  const benchText = bench ? formatInterval({ lo: bench.lo, hi: bench.hi }, shape.unit === "percent" ? "percent" : "ratio", ctx, unitWords) : null;
  const top = Math.max(band ? band[1] * 2 : 0, (target ?? 0) * 1.5, (knownValue?.hi ?? 0) * 1.25) || 10;
  const valueText = knownValue ? show(knownValue) : null;
  const targetText = target !== undefined ? show({ lo: target, hi: target }) : null;
  const sentence = positionLabel(position ?? "unknown", comparator, strings);
  // C1: a verdict only against the team's target, stamped only when it is clear; « peut-être sous » is said in words.
  const verdict =
    comparator && valueText && sentence && (position === "below" || position === "within" || position === "above")
      ? { tone: position === "below" ? ("below" as const) : ("ok" as const), label: sentence }
      : null;
  const chartLabel = fill(benchText ? strings.sheet.compareChart : strings.sheet.compareChartNoReference, {
    name: metric.name,
    value: valueText ?? strings.sheet.compareChartNoValue,
    range: benchText ?? "",
    target: targetText ? fill(strings.sheet.compareChartTarget, { value: targetText }) : strings.sheet.compareChartNoTarget,
  });

  // The company's margin, offered on both margin sheets in the hybrid whatever the answer shown (C25 Q4): above the answers.
  const companyWideOffer =
    marginSheet && draft.basis !== "company-wide" ? (
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
    ) : null;

  const value = (
    <>
      {shape.dependsOn === "act.event" && !eventMeasured ? <p className={styles.caveat}>{strings.sheet.dependsOnEvent}</p> : null}
      {!periodOnDenominator && periodHint ? <p className={styles.caveat}>{periodHint}</p> : null}
      <ValueEditor
        idPrefix={prefix}
        draft={answered}
        update={updateValue}
        shape={shape}
        metric={filledMetric}
        view={view}
        problems={problems}
        shared={sharedLine(shared, view)}
        periodHint={periodOnDenominator ? periodHint : undefined}
      />
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
    </>
  );

  const editor =
    draft.mode === "estimate" ? (
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
    ) : draft.mode === "ask" ? (
      <div className={styles.editor} data-testid="engine-ask">
        <Select<RoleId>
          size="sm"
          id={`${prefix}-role`}
          label={strings.request.role}
          value={draft.requestRole}
          options={ROLES.map((role) => ({ value: role, label: strings.role[ROLE_KEY[role]] }))}
          onChange={(role) => role && update({ requestRole: role })}
        />
        {entry?.status === "requested" && requestedAt ? (
          <p className={stale ? styles.error : styles.caveat} data-testid="engine-request-status">
            {stale
              ? fill(strings.request.stale, { n: daysBetween(requestedAt, ctx.today) })
              : fill(strings.sheet.askCopied, { date: formatDate(requestedAt, locale) })}
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
    ) : draft.mode === "cantFind" ? (
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
    ) : null;

  const compare =
    bench || isCandidate ? (
      <HowItCompares
        title={strings.sheet.compareTitle}
        value={numeric ? figure : null}
        domain={[0, top]}
        band={numeric ? band : undefined}
        target={numeric && isCandidate ? (target ?? null) : null}
        chartLabel={chartLabel}
        legend={[
          ...(valueText ? [{ kind: "value" as const, label: fill(strings.sheet.compareYours, { value: valueText }) }] : []),
          ...(benchText
            ? [
                {
                  kind: "band" as const,
                  label: (
                    <>
                      {fill(strings.sheet.compareReference, { range: benchText })}
                      <EngineTerm id="reference" strings={strings} />
                    </>
                  ),
                },
              ]
            : []),
          ...(isCandidate && targetText ? [{ kind: "target" as const, label: fill(strings.sheet.compareTargetValue, { value: targetText }) }] : []),
        ]}
        caveat={
          bench
            ? fill(strings.sheet.compareCaveat, { caveat: metric.benchmarkCaveat ?? "" })
            : fill(strings.sheet.noReference, { reason: metric.noReferenceReason ?? "" })
        }
        verdict={verdict}
        note={
          !isCandidate ? (
            strings.sheet.compareNoTargetHere
          ) : !verdict && comparator && valueText && sentence && position !== "no-comparator" ? (
            <span data-testid="engine-position">{sentence}</span>
          ) : null
        }
        targetField={
          isCandidate ? (
            <TargetField id={id} prefix={prefix} target={target} unitFor={(v) => unitOf(shape, view, v)} view={view} actions={actions} />
          ) : null
        }
        data-testid="engine-reference"
      />
    ) : null;

  return (
    <div ref={sheetRef} className={styles.sheet} data-testid={`engine-sheet-${domId(id)}`}>
      <NumberSheet
        framed={Boolean(screen)}
        name={screen ? metric.name : undefined}
        headingId={screen?.headingId}
        headingRef={screen?.headingRef}
        position={screen?.position}
        progress={screen?.progress}
        effort={strings.effort[EFFORT_KEY[shape.effort]]}
        definitionLabel={strings.sheet.definition}
        definitionHref={metric.glossaryHref}
        definition={fillCatalog(metric.oneLiner)}
        formulaLabel={strings.sheet.formula}
        formula={fillCatalog(metric.formula)}
        tour={
          declared ? <span data-testid="engine-declared">{fill(strings.sheet.tourAnswer, { answer: declared.label })}</span> : null
        }
        trap={
          <TrapNote
            label={strings.sheet.trapLabel}
            hybrid={hybridTrap ? { label: strings.sheet.hybridTrapLabel, text: strings.sheet.hybridTrap[hybridTrap] } : undefined}
            action={
              TRAPS_ASKING_DEFINITION.includes(id) ? (
                <Button
                  variant="quiet"
                  size="sm"
                  aria-controls={`${prefix}-words`}
                  onClick={() => {
                    setWordsOpen(true);
                    setToDefinition((n) => n + 1);
                  }}
                  data-testid={`engine-write-definition-${domId(id)}`}
                >
                  {strings.sheet.writeDefinition}
                </Button>
              ) : null
            }
            data-testid="engine-trap"
          >
            {fillCatalog(metric.trap)}
          </TrapNote>
        }
        where={
          places.length ? (
            <WhereToFind
              label={strings.sheet.whereTitle}
              tools={places}
              yoursLabel={strings.sheet.whereYours}
              open={team.length > 0 && places.some((p) => p.yours)}
              also={alsoIn.map(({ tool, others }) => ({
                tool,
                label: fill(alsoBefore, { tool: strings.tools[tool] }),
                items: others.map((other) => ({ id: other.id, label: midSentence(other.name, locale) })),
              }))}
              onOpenNumber={(other) => actions.openMetric(other as MetricId)}
              data-testid="engine-where"
            />
          ) : null
        }
        answer={
          <>
            {companyWideOffer}
            <AnswerSwitch
              legend={statusQuestionOf(id, strings)}
              options={others}
              answer={answer}
              onAnswer={(a) => update({ mode: MODE_OF[a] })}
              value={value}
              editor={editor}
              backLabel={words ? strings.sheet.answerBackAnswer : strings.sheet.answerBack}
              onBack={() => update({ mode: "have" })}
              legendId={`${prefix}-answers`}
              data-testid={`engine-answer-${domId(id)}`}
            />
          </>
        }
        compare={compare}
        words={
          <Disclosure
            summary={strings.sheet.wordsSummary}
            id={`${prefix}-words`}
            open={wordsOpen || wordsProblem}
            onOpenChange={setWordsOpen}
            data-testid={`engine-words-${domId(id)}`}
          >
            <div className={styles.words}>
              <Field
                size="sm"
                id={`${prefix}-definition`}
                label={strings.sheet.definitionNote}
                optional={strings.workbench.optional}
                hint={strings.sheet.definitionNoteHint}
                error={problems.includes("definition-too-long") ? fill(strings.sheet.tooLong, { n: TEXT_LIMITS.definitionNote }) : null}
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
              <Field
                size="sm"
                id={`${prefix}-note`}
                label={strings.sheet.note}
                optional={strings.workbench.optional}
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
            </div>
          </Disclosure>
        }
        // Enter in a box saves, as on any form (A15.20) — except a request, which the copy saves.
        onSubmit={draft.mode === "ask" ? undefined : save}
        actions={
          <>
            {/* The copy button of « Je le demande » is that answer's save: the request is what gets recorded. */}
            {draft.mode === "ask" ? (
              // « Continue » once the request is copied — its save; before, the ways on are the copy and « Passe ».
              next && entry?.status === "requested" ? (
                <Button onClick={next.onSaved} data-testid={`engine-continue-${domId(id)}`}>
                  {strings.sheet.continue}
                </Button>
              ) : null
            ) : (
              <Button variant={next ? "primary" : "secondary"} onClick={save} data-testid={`engine-save-${domId(id)}`}>
                {next ? next.label : strings.sheet.save}
              </Button>
            )}
            {extraActions}
          </>
        }
        footer={
          <>
            {draft.mode !== "ask" ? (
              <p className={styles.saved} role="status" aria-live="polite" data-testid={`engine-saved-${domId(id)}`}>
                {outcome === "saved" ? strings.workbench.saved : ""}
              </p>
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
          </>
        }
      />
    </div>
  );
}

/**
 * The team's target — written on blur, not on the sheet's save: a team can
 * know where it wants a stage to be before it has the number, and a target is
 * what lets the diagnosis name a bottleneck at all (D8). Asked here, where the
 * value is in front of the person (brief 07 Q12), as in Settings.
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
      label={view.strings.sheet.compareTarget}
      optional={view.strings.workbench.optional}
      hint={
        <>
          {view.strings.sheet.compareTargetHint}
          <EngineTerm id="target" strings={view.strings} />
        </>
      }
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
 * it — named in the line under the boxes, so « changing it here changes it
 * everywhere » says where. Only the numbers the view can name (`metrics`):
 * a SaaS view does not carry the app's.
 */
function sharedSides(
  id: MetricId,
  snapshot: EngineView["state"]["snapshots"][number],
  metrics: EngineView["metrics"],
): Partial<Record<"numerator" | "denominator", { value: number | null; others: MetricId[] }>> {
  const out: Partial<Record<"numerator" | "denominator", { value: number | null; others: MetricId[] }>> = {};
  const named = new Set<MetricId>(metrics.map((m) => m.id));
  for (const side of ["numerator", "denominator"] as const) {
    const count = sharedCountAt(id, side);
    if (!count) continue;
    const known = knownSharedCount(snapshot, count);
    out[side] = {
      value: known?.value ?? null,
      others: sharedWith(id, side, named),
    };
  }
  return out;
}

/** The one line under the boxes: no number shares both of its counts (shared-counts.ts). */
function sharedLine(shared: ReturnType<typeof sharedSides>, view: EngineView): string | undefined {
  const others = shared.numerator?.others ?? shared.denominator?.others;
  if (!others?.length) return undefined;
  const names = others.map((m) => midSentence(metricById(view.metrics, m).name, view.ctx.locale));
  return fill(view.strings.sheet.sharedHint, { metrics: joinList(names, view.strings.grammar) });
}

/** A margin entered as the company's (C25 Q4): its bounds, to prefill the other motion's sheet with. */
function companyWide(entry: MetricEntry | undefined): { low: number; high: number } | null {
  return entry?.status === "estimated" && entry.estimate?.basis === "company-wide" ? { low: entry.estimate.low, high: entry.estimate.high } : null;
}
