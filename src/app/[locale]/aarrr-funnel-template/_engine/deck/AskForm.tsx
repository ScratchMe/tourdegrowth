"use client";

import { useId, useState } from "react";
import { Checkbox } from "@/components/core/Checkbox";
import { Choices } from "@/components/core/Choices";
import { Field } from "@/components/core/Field";
import { FieldRow } from "@/components/core/FieldRow";
import { NumberField, type NumberFieldProps } from "@/components/core/NumberField";
import { Select } from "@/components/core/Select";
import { TextField, type TextFieldProps } from "@/components/core/TextField";
import { TEXT_LIMITS, shapeOf } from "@/lib/engine/catalog-shape";
import { fillTemplate } from "@/lib/engine/format";
import { REPAIR_KEY } from "@/lib/engine/strings";
import type { EngineStrings, ResolvedMetric } from "@/lib/engine/strings";
import type { EngineAsk, EngineState, MetricId } from "@/lib/engine/types";
import { currentSnapshot } from "@/lib/engine/values";
import type { Locale } from "@/lib/i18n/locale";
import { percentUnit } from "../sources";
import { horizonOptions, missingByRepairCost, successMetrics } from "./ask-defaults";
import { SlideText } from "./slide-text";
import styles from "./deck.module.css";

type CostKind = "none" | "money" | "team";

export interface AskFormProps {
  locale: Locale;
  strings: EngineStrings;
  metrics: ResolvedMetric[];
  /** Read for the currency and the snapshot the form's choices hang on — never for the ask itself. */
  state: EngineState;
  /**
   * The ask the slides show right now. Not `state.deck.ask`: on a pristine
   * ask it is the engine's in-memory proposal (DeckView), which the form
   * must show — and edit from — before anything is stored.
   */
  ask: EngineAsk;
  /** The ask slide's finished title, from the model — the live preview (§7 E5). */
  titlePreview: string | null;
  /** The island persists; this component only says what changed. */
  onAskChange: (ask: EngineAsk) => void;
}

/**
 * A text field that keeps its draft while it has focus and hands it up on
 * blur (§4.3: writes happen when a field is validated, not per keystroke).
 *
 * Its caller keys it by the COMMITTED value, so a value that changes from
 * outside — the one-time defaults the deck screen writes into a pristine
 * ask (§7 E5) — resets the draft instead of being hidden behind a stale one.
 * (Found on screen: the success target arrived while the target field still
 * showed the empty draft it was mounted with.)
 *
 * The limit is soft (design system extension 04): what is typed past it
 * stays on screen with its count and message, and is not handed up — the
 * engine's own check would refuse the whole state over one long bullet. It
 * used to be a hard `maxlength`, which cut a pasted sentence mid-word.
 */
function DraftText({
  initial,
  onCommit,
  maxLength,
  tooLong,
  ...rest
}: { initial: string; onCommit: (value: string) => void; maxLength: number; tooLong: string } & Omit<
  TextFieldProps,
  "value" | "onChange" | "onBlur" | "maxLength" | "error"
>) {
  const [draft, setDraft] = useState(initial);
  const over = draft.length > maxLength;
  return (
    <TextField
      {...rest}
      value={draft}
      onChange={setDraft}
      maxLength={maxLength}
      error={over ? tooLong : undefined}
      onBlur={() => !over && draft !== initial && onCommit(draft)}
    />
  );
}

/**
 * The same for a number, read the way the reader writes it (« 26 000 »,
 * "26,000") by NumberField — the deck's own parser read "26,000" as 26.
 * `null` is "no value", which is not zero; a negative one is not handed up.
 */
function DraftNumber({
  initial,
  onCommit,
  ...rest
}: { initial: number | null; onCommit: (value: number | undefined) => void } & Omit<
  NumberFieldProps,
  "value" | "onChange" | "onBlur"
>) {
  const [value, setValue] = useState(initial);
  return (
    <NumberField
      {...rest}
      value={value}
      onChange={setValue}
      onBlur={() => value !== initial && onCommit(value !== null && value >= 0 ? value : undefined)}
    />
  );
}

/**
 * "What you're asking for" — the slide the user writes (D10, §7 E5, §9.3
 * slide 6). Text fields keep a local draft and are handed up on blur, never
 * on every keystroke (§4.3: writes happen when a field is validated); choices
 * and checkboxes are handed up on change, since a click IS the validation.
 *
 * Deliberately not a `<form>`: nothing here is ever submitted anywhere, and
 * the engine's boundary test forbids the element outright (rule 3) so that no
 * future edit can turn a field into a request.
 */
export function AskForm({ locale, strings, metrics, state, ask, titlePreview, onAskChange }: AskFormProps) {
  const uid = useId();
  const t = strings.ask;
  const u = strings.deckUi;
  const nameOf = (id: MetricId) => metrics.find((m) => m.id === id)?.name ?? id;

  const [amount, setAmount] = useState<number | null>(ask.cost?.kind === "money" ? ask.cost.amount : null);
  const [weeks, setWeeks] = useState<number | null>(ask.cost?.kind === "team" ? ask.cost.weeks : null);
  const [people, setPeople] = useState<number | null>(ask.cost?.kind === "team" ? ask.cost.people : null);
  const [costKind, setCostKind] = useState<CostKind>(ask.cost?.kind ?? "none");

  const update = (patch: Partial<EngineAsk>) => onAskChange({ ...ask, ...patch });

  // Empty is "no value", which is not zero; a negative cost is not one either.
  const usable = (n: number | null) => (n !== null && n >= 0 ? n : undefined);
  const commitCost = (kind: CostKind) => {
    if (kind === "none") return update({ cost: undefined });
    if (kind === "money") {
      const value = usable(amount);
      return update({ cost: value === undefined ? undefined : { kind: "money", amount: value } });
    }
    const w = usable(weeks);
    const p = usable(people);
    update({ cost: w === undefined || p === undefined ? undefined : { kind: "team", weeks: w, people: p } });
  };

  const currencySymbol =
    // The page's language, not the browser's: the label must match the slide it previews.
    new Intl.NumberFormat(locale, { style: "currency", currency: state.setup.currency })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? state.setup.currency;

  const snapshot = currentSnapshot(state);
  const quarters = horizonOptions(snapshot.referenceMonth);
  const horizonValue = ask.horizon ? `${ask.horizon.year}-${ask.horizon.quarter}` : "";
  const missing = missingByRepairCost(state);
  const entries = snapshot.metrics;
  const full = ask.measureFirst.length >= TEXT_LIMITS.askMeasureFirst;
  const tooLong = (n: number) => fillTemplate(strings.sheet.tooLong, { n });

  return (
    <section className={styles.askForm} aria-labelledby={`${uid}-title`} data-testid="deck-ask-form">
      <h3 id={`${uid}-title`} className={styles.panelTitle}>
        {t.title}
      </h3>

      {titlePreview ? (
        <p className={styles.askPreview} data-testid="deck-ask-preview">
          <span className={styles.askPreviewLabel}>{u.askPreview}</span>{" "}
          {/* The ask's title is never the verdict nor the diagnosis: its figure in ink (C53). */}
          <SlideText text={titlePreview} accent={false} />
        </p>
      ) : null}

      <DraftText
        key={ask.what}
        size="sm"
        id={`${uid}-what`}
        label={t.what}
        maxLength={TEXT_LIMITS.askWhat}
        tooLong={tooLong(TEXT_LIMITS.askWhat)}
        initial={ask.what}
        onCommit={(value) => update({ what: value.trim() })}
        data-testid="deck-ask-what"
      />

      {/*
        Choices, not the DS Segmented control: three French options in one
        compact track measured 367px inside a 342px card at 390px (the deck
        screen scrolled sideways). Rows of real radios stay in their column at
        every width.
      */}
      <Choices<CostKind>
        size="sm"
        id={`${uid}-cost`}
        legend={t.cost}
        value={costKind}
        options={[
          { value: "none", label: u.askCostNone },
          { value: "money", label: t.costMoney },
          { value: "team", label: u.askCostTeamOption },
        ]}
        onChange={(kind) => {
          setCostKind(kind);
          commitCost(kind);
        }}
      />
      {costKind === "money" ? (
        // The currency is in the label already: no sign inside the box as well.
        <NumberField
          size="sm"
          id={`${uid}-amount`}
          label={fillTemplate(u.askAmount, { currency: currencySymbol })}
          value={amount}
          onChange={setAmount}
          onBlur={() => commitCost("money")}
          locale={locale}
          parseError={strings.workbench.notANumber}
          data-testid="deck-ask-amount"
        />
      ) : null}
      {costKind === "team" ? (
        // « Weeks » and « People » name themselves: a pair with no joiner.
        <FieldRow>
          <NumberField
            size="sm"
            id={`${uid}-weeks`}
            label={u.askWeeks}
            value={weeks}
            onChange={setWeeks}
            onBlur={() => commitCost("team")}
            locale={locale}
            digits={4}
            parseError={strings.workbench.notANumber}
          />
          <NumberField
            size="sm"
            id={`${uid}-people`}
            label={u.askPeople}
            value={people}
            onChange={setPeople}
            onBlur={() => commitCost("team")}
            locale={locale}
            digits={4}
            parseError={strings.workbench.notANumber}
          />
        </FieldRow>
      ) : null}

      <Select
        size="sm"
        id={`${uid}-horizon`}
        label={t.horizon}
        value={horizonValue}
        placeholder={u.askHorizonNone}
        options={quarters.map((q) => ({
          value: `${q.year}-${q.quarter}`,
          label: fillTemplate(strings.units.quarter, { q: q.quarter, year: q.year }),
        }))}
        onChange={(value) => {
          if (!value) return update({ horizon: undefined });
          const [year, quarter] = value.split("-").map(Number);
          update({ horizon: { year: year!, quarter: quarter as 1 | 2 | 3 | 4 } });
        }}
      />

      <Select<MetricId>
        size="sm"
        id={`${uid}-metric`}
        label={t.successMetric}
        value={ask.successMetric ?? ""}
        placeholder={u.askSuccessNone}
        options={successMetrics(state.setup).map((id) => ({ value: id, label: nameOf(id) }))}
        onChange={(value) => update({ successMetric: value || undefined })}
      />
      {/* Every metric offered here is a rate, typed "20" for 20 % — never "0.2": the % is in the box. */}
      {ask.successMetric ? (
        <DraftNumber
          key={String(ask.successTarget ?? "")}
          size="sm"
          id={`${uid}-target`}
          label={u.askTarget}
          initial={ask.successTarget ?? null}
          onCommit={(successTarget) => update({ successTarget })}
          locale={locale}
          digits={5}
          {...(shapeOf(ask.successMetric).unit === "percent" ? percentUnit(locale) : {})}
          parseError={strings.workbench.notANumber}
          data-testid="deck-ask-target"
        />
      ) : null}

      <Field group size="sm" id={`${uid}-bullets`} label={t.bullets}>
        <div className={styles.bullets}>
        {[0, 1, 2].map((i) => (
          <DraftText
            // Position and committed text: an emptied bullet compacts the list, and the fields follow it.
            key={`${i}:${ask.bullets[i] ?? ""}`}
            size="sm"
            id={`${uid}-bullet-${i + 1}`}
            label={fillTemplate(u.askBullet, { n: i + 1 })}
            maxLength={TEXT_LIMITS.askBullet}
            tooLong={tooLong(TEXT_LIMITS.askBullet)}
            initial={ask.bullets[i] ?? ""}
            onCommit={(value) =>
              update({
                bullets: [0, 1, 2]
                  .map((j) => (j === i ? value : (ask.bullets[j] ?? "")).trim())
                  .filter(Boolean),
              })
            }
            data-testid={`deck-ask-bullet-${i + 1}`}
          />
        ))}
        </div>
      </Field>

      <Field
        group
        size="sm"
        id={`${uid}-measure`}
        label={t.measureFirst}
        hint={missing.length > 0 ? u.askMeasureFirstHint : u.askMeasureFirstEmpty}
      >
        {missing.map((id) => {
          const checked = ask.measureFirst.includes(id);
          const repair = entries[id]?.missing?.repair;
          return (
            <Checkbox
              key={id}
              id={`${uid}-measure-${id.replace(/\./g, "-")}`}
              label={<SlideText text={nameOf(id)} accent={false} />}
              hint={repair ? strings.repair[REPAIR_KEY[repair]] : undefined}
              checked={checked}
              // Three at most: the group's hint says so, the fourth box waits.
              disabled={!checked && full}
              onChange={() =>
                update({
                  measureFirst: checked ? ask.measureFirst.filter((m) => m !== id) : [...ask.measureFirst, id],
                })
              }
            />
          );
        })}
      </Field>
    </section>
  );
}
