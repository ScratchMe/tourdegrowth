"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { Choices, type ChoiceOption } from "@/components/core/Choices";
import styles from "./EngineStart.module.css";

export type StartMotion = "ss" | "sa" | "both";

export interface EngineStartProps {
  /** « Avant de commencer ». */
  title: ReactNode;
  /** « Comment vends-tu ? » */
  legend: ReactNode;
  /** Libre-service · Assisté · Les deux, each with its one-line note. « Les deux » sets both motions. */
  options: readonly ChoiceOption<StartMotion>[];
  /** Default `ss`: self-serve, the v1 default. */
  motion: StartMotion;
  onMotionChange: (motion: StartMotion) => void;
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
 * import are quiet. Flat: on a first visit the page's raised card is the
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
      <Choices<StartMotion> legend={legend} options={options} value={motion} onChange={onMotionChange} size="md" name="engine-motion" id={testId ? `${testId}-motion` : undefined} />
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
