"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { Checkbox } from "@/components/core/Checkbox";
import { Choices, type ChoiceOption } from "@/components/core/Choices";
import { Field } from "@/components/core/Field";
import styles from "./EngineStart.module.css";

/** The start card's one question: how the company sells, or, once the app type is open, that it is a consumer app. */
export type StartChoice = "ss" | "sa" | "both" | "app";

/** The three ways a consumer app earns; the ticked ones are `AppMonetization`'s three booleans. */
export type StartEarnsId = "subscriptions" | "purchases" | "ads";

export interface EngineStartProps {
  /** « Avant de commencer ». */
  title: ReactNode;
  /** « Comment vends-tu ? » */
  legend: ReactNode;
  /** Libre-service · Assisté · Les deux, each with its one-line note. « Les deux » sets both motions. With the app type open, a fourth: the app. */
  options: readonly ChoiceOption<StartChoice>[];
  /** Default `ss`: self-serve, the v1 default. */
  motion: StartChoice;
  onMotionChange: (motion: StartChoice) => void;
  /** §21.6.1: the app's three ways of earning, shown when `motion === "app"`. Absent: nothing shows, the card of a SaaS. */
  earns?: {
    legend: ReactNode;
    options: readonly { id: StartEarnsId; label: ReactNode }[];
    value: Readonly<Record<StartEarnsId, boolean>>;
    onChange: (next: Record<StartEarnsId, boolean>) => void;
    /** `start.appEarnsNone`, set by the caller after a click on « Commencer » with nothing ticked. */
    error?: ReactNode;
  };
  /** The counts by effort for the chosen motion: « 17 chiffres : 5 se lisent en cinq minutes… ». */
  plan: ReactNode;
  /** Every other default in one sentence: company type, currency, the month and the cohort. */
  defaults: ReactNode;
  /** « Modifier » — every setting, before the engine exists. */
  changeLabel: ReactNode;
  onChange: () => void;
  /** The screen's one primary. */
  startLabel: ReactNode;
  onStart: () => void;
  /** « Voir un exemple rempli » (quiet). */
  exampleLabel?: ReactNode;
  onExample?: () => void;
  /** « Importer un fichier (.json) » (quiet). */
  importLabel?: ReactNode;
  onImport?: () => void;
  /** « Annuler »: another engine's start, the engine on screen still there to go back to. */
  cancelLabel?: ReactNode;
  onCancel?: () => void;
  headingId?: string;
  "data-testid"?: string;
}

/**
 * The first visit's only setup screen — design system extension 07 (brief 07
 * Q4, Q5). One question, how you sell, answered by default (self-serve):
 * it decides which numbers exist. Every other default is said in one
 * sentence, with « Modifier ». One primary way in; the example and the
 * import are quiet. With the app type open it is a fourth answer, and
 * choosing it opens its three ways of earning (`earns`, §21.6.1). Flat: on a first visit the page's raised card is the
 * privacy promise above it.
 *
 * The heading takes the focus when a person comes here from another screen
 * (R-19): it is focusable, never focused on first paint by this component.
 */
export function EngineStart({
  title,
  legend,
  options,
  motion,
  onMotionChange,
  earns,
  plan,
  defaults,
  changeLabel,
  onChange,
  startLabel,
  onStart,
  exampleLabel,
  onExample,
  importLabel,
  onImport,
  cancelLabel,
  onCancel,
  headingId = "engine-start-title",
  "data-testid": testId,
}: EngineStartProps) {
  const quiet = [
    exampleLabel && onExample ? { label: exampleLabel, onClick: onExample, id: "example" } : null,
    importLabel && onImport ? { label: importLabel, onClick: onImport, id: "import" } : null,
    cancelLabel && onCancel ? { label: cancelLabel, onClick: onCancel, id: "cancel" } : null,
  ].filter((x) => x !== null);
  return (
    <Card elevation="flat" className={styles.root} data-testid={testId}>
      <h2 id={headingId} className={styles.title} tabIndex={-1}>
        {title}
      </h2>
      <Choices<StartChoice> legend={legend} options={options} value={motion} onChange={onMotionChange} size="md" name="engine-motion" id={testId ? `${testId}-motion` : undefined} />
      {earns ? (
        // The motion group's pattern in the setup card: a legend, plain rows, the message under them.
        <Field group label={earns.legend} error={earns.error ? <span data-testid={testId ? `${testId}-earns-error` : undefined}>{earns.error}</span> : null}>
          {({ describedBy }) => (
            <div className={styles.earns} data-testid={testId ? `${testId}-earns` : undefined}>
              {earns.options.map((option) => (
                <Checkbox
                  key={option.id}
                  label={option.label}
                  checked={earns.value[option.id]}
                  onChange={(on) => earns.onChange({ ...earns.value, [option.id]: on })}
                  describedBy={describedBy}
                  data-testid={testId ? `${testId}-earns-${option.id}` : undefined}
                />
              ))}
            </div>
          )}
        </Field>
      ) : null}
      <p className={styles.plan} aria-live="polite" data-testid={testId ? `${testId}-plan` : undefined}>
        {plan}
      </p>
      <p className={styles.defaults}>
        <span data-testid={testId ? `${testId}-defaults` : undefined}>{defaults}</span>{" "}
        <Button variant="quiet" size="sm" onClick={onChange} data-testid={testId ? `${testId}-change` : undefined}>
          {changeLabel}
        </Button>
      </p>
      <div className={styles.actions}>
        <Button size="lg" onClick={onStart} className={styles.go} data-testid={testId ? `${testId}-go` : undefined}>
          {startLabel}
        </Button>
        {quiet.length ? (
          <div className={styles.ways}>
            {quiet.map((way) => (
              <Button key={way.id} variant="quiet" onClick={way.onClick} data-testid={testId ? `${testId}-${way.id}` : undefined}>
                {way.label}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
