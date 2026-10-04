import type { ReactNode } from "react";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import styles from "./NextStep.module.css";

export interface NextStepLine {
  text: ReactNode;
  /** plain (default) · pending: a request out, a month to start — dashed edge · advice: the backup missing — dashed red edge. */
  tone?: "plain" | "pending" | "advice";
  /** One quiet Button: « Relancer », « Sauvegarder (.json) ». */
  action?: ReactNode;
  "data-testid"?: string;
}

export interface NextStepProps {
  /**
   * « Dernière visite · il y a 12 jours » on a return; « Où tu en es » otherwise. A string: it also names the lines.
   * A past month's read-only state is said by `EngineBar`'s line, not here.
   */
  eyebrow: string;
  /** Why the primary is the primary, in one sentence. */
  lead?: ReactNode;
  /** `advice` when the reason is a risk (the device refused to save). */
  leadTone?: "advice";
  /** Read out the moment it appears (`role="alert"`): the refused save, which the person did not ask for. */
  announce?: boolean;
  /** THE action of the screen (Button primary, lg), chosen by `nextStepFor`. */
  primary: { label: ReactNode; onClick: () => void; "data-testid"?: string };
  /** At most one quiet alternative: « Continuer août 2026 », « Corriger ce mois ». */
  secondary?: ReactNode;
  /** What else waits, under a rule. */
  lines?: NextStepLine[];
  headingId?: string;
  "data-testid"?: string;
  /** Which step it shows (`nextStepFor`'s kind), for the engine's specs. */
  "data-step"?: string;
}

/**
 * The board's « since last time » and its ONE primary action — design
 * system extension 07 (brief 07 Q2, Q3). It replaces the dashed bands
 * (next month, resume, backup) and the « refused to save » line with one
 * card under the verdict, read in this order: the reason, the action, then
 * what else waits. Reason and action come first so that at 390px the
 * verdict and the primary fit the first screen.
 *
 * One primary per screen; a line's action is quiet. Dashed edges only for
 * « not yet » (pending) and, in red, for advice; never a red wash: nothing
 * here is a diagnosis. Flat: the board's raised card stays the peloton.
 */
export function NextStep({
  eyebrow,
  lead,
  leadTone,
  announce,
  primary,
  secondary,
  lines = [],
  headingId = "engine-next",
  "data-testid": testId,
  "data-step": stepKind,
}: NextStepProps) {
  return (
    <Card elevation="flat" tone="paper" className={styles.root} data-testid={testId} data-step={stepKind}>
      <MetaLabel as="h2" size="sm" tone="muted" id={headingId}>
        {eyebrow}
      </MetaLabel>
      {lead ? (
        // Keyed by whether it is announced: an alert is read when it is inserted, not when an existing line changes.
        <p
          key={announce ? "alert" : "lead"}
          className={[styles.lead, leadTone === "advice" ? styles.advice : ""].filter(Boolean).join(" ")}
          role={announce ? "alert" : undefined}
          data-testid={testId ? `${testId}-lead` : undefined}
        >
          {lead}
        </p>
      ) : null}
      <div className={styles.actions}>
        <Button variant="primary" size="lg" onClick={primary.onClick} className={styles.primary} data-testid={primary["data-testid"]}>
          {primary.label}
        </Button>
        {secondary ? <span className={styles.secondary}>{secondary}</span> : null}
      </div>
      {lines.length > 0 ? (
        <ul className={styles.lines} aria-label={eyebrow}>
          {lines.map((line, i) => (
            // A fixed set per state, in a fixed order: the index is the line's identity.
            <li key={i} className={[styles.line, line.tone && line.tone !== "plain" ? styles[line.tone] : ""].filter(Boolean).join(" ")} data-testid={line["data-testid"]}>
              <span className={styles.text}>{line.text}</span>
              {line.action ? <span className={styles.lineAction}>{line.action}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
