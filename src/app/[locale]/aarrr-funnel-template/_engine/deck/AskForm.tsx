"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { TEXT_LIMITS } from "@/lib/engine/catalog-shape";
import { REPAIR_KEY } from "@/lib/engine/strings";
import type { EngineStrings, ResolvedMetric } from "@/lib/engine/strings";
import type { EngineAsk, EngineState, MetricId } from "@/lib/engine/types";
import { SUCCESS_METRICS, horizonOptions, missingByRepairCost } from "./ask-defaults";
import { SlideText, fill } from "./slide-text";
import styles from "./deck.module.css";

type CostKind = "none" | "money" | "team";

export interface AskFormProps {
  strings: EngineStrings;
  metrics: ResolvedMetric[];
  state: EngineState;
  /** The ask slide's finished title, from the model — the live preview (§7 E5). */
  titlePreview: string | null;
  /** The island persists; this component only says what changed. */
  onAskChange: (ask: EngineAsk) => void;
}

/**
 * A labelled field. The label is a real `<label for>`: `core/TextArea`'s
 * accessible-only name has left three fields of the audit instrument
 * nameless on screen (CLAUDE.md, audit 1.3a/1.4/1.6), and a field in a form
 * is read by sighted users too.
 */
function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel} htmlFor={id}>
        {label}
      </label>
      {children}
      {hint ? <p className={styles.fieldHint}>{hint}</p> : null}
    </div>
  );
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
 */
function DraftInput({
  initial,
  onCommit,
  ...rest
}: { initial: string; onCommit: (value: string) => void } & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "onBlur"
>) {
  const [draft, setDraft] = useState(initial);
  return (
    <input
      {...rest}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => draft !== initial && onCommit(draft)}
    />
  );
}

/** Parses a typed number; empty is "no value", which is not zero. */
function parseNumber(raw: string): number | undefined {
  if (raw.trim() === "") return undefined;
  const n = Number(raw.replace(",", ".").replace(/\s/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
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
export function AskForm({ strings, metrics, state, titlePreview, onAskChange }: AskFormProps) {
  const uid = useId();
  const ask = state.deck.ask;
  const t = strings.ask;
  const u = strings.deckUi;
  const nameOf = (id: MetricId) => metrics.find((m) => m.id === id)?.name ?? id;

  const [amount, setAmount] = useState(ask.cost?.kind === "money" ? String(ask.cost.amount) : "");
  const [weeks, setWeeks] = useState(ask.cost?.kind === "team" ? String(ask.cost.weeks) : "");
  const [people, setPeople] = useState(ask.cost?.kind === "team" ? String(ask.cost.people) : "");
  const [costKind, setCostKind] = useState<CostKind>(ask.cost?.kind ?? "none");

  const update = (patch: Partial<EngineAsk>) => onAskChange({ ...ask, ...patch });

  const commitCost = (kind: CostKind, next: { amount?: string; weeks?: string; people?: string } = {}) => {
    if (kind === "none") return update({ cost: undefined });
    if (kind === "money") {
      const value = parseNumber(next.amount ?? amount);
      return update({ cost: value === undefined ? undefined : { kind: "money", amount: value } });
    }
    const w = parseNumber(next.weeks ?? weeks);
    const p = parseNumber(next.people ?? people);
    update({ cost: w === undefined || p === undefined ? undefined : { kind: "team", weeks: w, people: p } });
  };

  const currencySymbol =
    new Intl.NumberFormat(undefined, { style: "currency", currency: state.setup.currency })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? state.setup.currency;

  const quarters = horizonOptions(state.snapshots[0]?.referenceMonth ?? "2026-01");
  const horizonValue = ask.horizon ? `${ask.horizon.year}-${ask.horizon.quarter}` : "";
  const missing = missingByRepairCost(state);
  const entries = state.snapshots[0]?.metrics ?? {};
  const full = ask.measureFirst.length >= TEXT_LIMITS.askMeasureFirst;

  return (
    <section className={styles.askForm} aria-labelledby={`${uid}-title`} data-testid="deck-ask-form">
      <h3 id={`${uid}-title`} className={styles.panelTitle}>
        {t.title}
      </h3>

      {titlePreview ? (
        <p className={styles.askPreview} data-testid="deck-ask-preview">
          <span className={styles.askPreviewLabel}>{u.askPreview}</span>{" "}
          <SlideText text={titlePreview} />
        </p>
      ) : null}

      <Field id={`${uid}-what`} label={t.what}>
        <DraftInput
          key={ask.what}
          id={`${uid}-what`}
          className={styles.control}
          type="text"
          maxLength={TEXT_LIMITS.askWhat}
          initial={ask.what}
          onCommit={(value) => update({ what: value.trim() })}
          data-testid="deck-ask-what"
        />
      </Field>

      {/*
        Radios, not the DS Segmented control: three French options in one
        compact track measured 367px inside a 342px card at 390px (the deck
        screen scrolled sideways). A wrapping group of real radios stays in
        its column at every width and needs no new component.
      */}
      <fieldset className={styles.checkGroup}>
        <legend className={styles.fieldLabel}>{t.cost}</legend>
        <div className={styles.radioRow}>
          {(
            [
              ["none", u.askCostNone],
              ["money", t.costMoney],
              ["team", u.askCostTeamOption],
            ] as const
          ).map(([kind, label]) => (
            <label key={kind} className={styles.check}>
              <input
                type="radio"
                name={`${uid}-cost`}
                value={kind}
                checked={costKind === kind}
                onChange={() => {
                  setCostKind(kind);
                  commitCost(kind);
                }}
                data-testid={`deck-ask-cost-${kind}`}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        {costKind === "money" ? (
          <Field id={`${uid}-amount`} label={fill(u.askAmount, { currency: currencySymbol })}>
            <input
              id={`${uid}-amount`}
              className={styles.control}
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onBlur={() => commitCost("money")}
            />
          </Field>
        ) : null}
        {costKind === "team" ? (
          <div className={styles.inlineFields}>
            <Field id={`${uid}-weeks`} label={u.askWeeks}>
              <input
                id={`${uid}-weeks`}
                className={styles.control}
                inputMode="numeric"
                value={weeks}
                onChange={(e) => setWeeks(e.target.value)}
                onBlur={() => commitCost("team")}
              />
            </Field>
            <Field id={`${uid}-people`} label={u.askPeople}>
              <input
                id={`${uid}-people`}
                className={styles.control}
                inputMode="numeric"
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                onBlur={() => commitCost("team")}
              />
            </Field>
          </div>
        ) : null}
      </fieldset>

      <Field id={`${uid}-horizon`} label={t.horizon}>
        <select
          id={`${uid}-horizon`}
          className={styles.control}
          value={horizonValue}
          onChange={(e) => {
            if (!e.target.value) return update({ horizon: undefined });
            const [year, quarter] = e.target.value.split("-").map(Number);
            update({ horizon: { year: year!, quarter: quarter as 1 | 2 | 3 | 4 } });
          }}
        >
          <option value="">{u.askHorizonNone}</option>
          {quarters.map((q) => (
            <option key={`${q.year}-${q.quarter}`} value={`${q.year}-${q.quarter}`}>
              {fill(strings.units.quarter, { q: q.quarter, year: q.year })}
            </option>
          ))}
        </select>
      </Field>

      <div className={styles.inlineFields}>
        <Field id={`${uid}-metric`} label={t.successMetric}>
          <select
            id={`${uid}-metric`}
            className={styles.control}
            value={ask.successMetric ?? ""}
            onChange={(e) =>
              update({ successMetric: (e.target.value || undefined) as MetricId | undefined })
            }
          >
            <option value="">{u.askSuccessNone}</option>
            {SUCCESS_METRICS.map((id) => (
              <option key={id} value={id}>
                {nameOf(id)}
              </option>
            ))}
          </select>
        </Field>
        {ask.successMetric ? (
          <Field id={`${uid}-target`} label={u.askTarget}>
            <DraftInput
              key={String(ask.successTarget ?? "")}
              id={`${uid}-target`}
              className={styles.control}
              inputMode="decimal"
              initial={ask.successTarget === undefined ? "" : String(ask.successTarget)}
              onCommit={(value) => update({ successTarget: parseNumber(value) })}
              data-testid="deck-ask-target"
            />
          </Field>
        ) : null}
      </div>

      <div className={styles.field} role="group" aria-labelledby={`${uid}-bullets`}>
        <span className={styles.fieldLabel} id={`${uid}-bullets`}>
          {t.bullets}
        </span>
        {[0, 1, 2].map((i) => (
          <DraftInput
            // Position and committed text: an emptied bullet compacts the list, and the fields follow it.
            key={`${i}:${ask.bullets[i] ?? ""}`}
            className={styles.control}
            type="text"
            maxLength={TEXT_LIMITS.askBullet}
            aria-label={fill(u.askBullet, { n: i + 1 })}
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

      <fieldset className={styles.checkGroup}>
        <legend className={styles.fieldLabel}>{t.measureFirst}</legend>
        {missing.length > 0 ? (
          <>
            <p className={styles.fieldHint}>{u.askMeasureFirstHint}</p>
            {missing.map((id) => {
              const checked = ask.measureFirst.includes(id);
              const repair = entries[id]?.missing?.repair;
              return (
                <label key={id} className={styles.check}>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!checked && full}
                    onChange={() =>
                      update({
                        measureFirst: checked ? ask.measureFirst.filter((m) => m !== id) : [...ask.measureFirst, id],
                      })
                    }
                  />
                  <span>
                    <SlideText text={nameOf(id)} accent={false} />
                    {repair ? <span className={styles.checkMeta}> · {strings.repair[REPAIR_KEY[repair]]}</span> : null}
                  </span>
                </label>
              );
            })}
          </>
        ) : (
          <p className={styles.fieldHint}>{u.askMeasureFirstEmpty}</p>
        )}
      </fieldset>
    </section>
  );
}
