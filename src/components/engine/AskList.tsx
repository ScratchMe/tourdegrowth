"use client";

import type { ReactNode } from "react";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import styles from "./AskList.module.css";

export interface AskGroup {
  /** The role's id: the group's key and test id. */
  id: string;
  /** « Finance », « Data », « Succès client »… */
  role: ReactNode;
  /** The numbers asked of that role, by name. */
  numbers: ReactNode;
  /** The request, as it will be copied. */
  request: ReactNode;
  /** Once copied: « Copiée le 24 septembre. Ton moteur te rappellera de relancer. », on a dashed edge (pending). */
  copied?: ReactNode;
  /**
   * The copy control (secondary). The engine's own, not a bare button: the
   * clipboard can refuse, and its fallback shows the text to select by hand.
   */
  action?: ReactNode;
  "data-testid"?: string;
}

export interface AskListProps {
  /** « À demander (5) ». */
  title: ReactNode;
  /** « Envoie les demandes aujourd'hui, remplis le reste en attendant les réponses. » */
  lead: ReactNode;
  groups: readonly AskGroup[];
  /** The screen's one primary: « C'est envoyé, passe au chiffre suivant → ». */
  done?: { label: ReactNode; onClick: () => void; "data-testid"?: string };
  headingId?: string;
  "data-testid"?: string;
}

/**
 * The requests, in one step — design system extension 07 (brief 07 Q11).
 * The numbers that come from someone else, grouped by who has them: one
 * card per role, its request shown as it will be copied. Copying stamps
 * each of that role's numbers with the request and its date. A copied
 * request says its date on a dashed edge: pending, never a colour.
 *
 * Copy is the only way out of the device for a request, and the person does
 * it: nothing is sent. « À faire toi-même » is not here: it is the list of
 * numbers itself, in the order the next step follows.
 *
 * The heading takes the focus when a person comes here (R-19); it is
 * focusable, never in the Tab order.
 */
export function AskList({ title, lead, groups, done, headingId = "engine-asks-title", "data-testid": testId }: AskListProps) {
  return (
    <section className={styles.root} aria-labelledby={headingId} data-testid={testId}>
      <h2 id={headingId} className={styles.title} tabIndex={-1}>
        {title}
      </h2>
      <p className={styles.lead}>{lead}</p>
      <ul className={styles.groups}>
        {groups.map((g) => (
          <li key={g.id} data-testid={g["data-testid"]}>
            <Card elevation="flat" className={styles.card}>
              <MetaLabel as="h3" size="sm" tone="muted">
                {g.role}
              </MetaLabel>
              <p className={styles.numbers}>{g.numbers}</p>
              <blockquote className={styles.request}>{g.request}</blockquote>
              {g.copied ? <p className={styles.copied}>{g.copied}</p> : null}
              {g.action}
            </Card>
          </li>
        ))}
      </ul>
      {done ? (
        <div className={styles.done}>
          <Button size="lg" onClick={done.onClick} className={styles.doneButton} data-testid={done["data-testid"]}>
            {done.label}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
