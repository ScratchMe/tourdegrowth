"use client";

import type { MouseEvent, ReactNode, Ref } from "react";
import styles from "./FormSummary.module.css";

export interface FormSummaryItem {
  /** The field's control id: its link moves focus there. */
  targetId: string;
  /** The field's label, as shown. */
  label: ReactNode;
  /** The field's own message, repeated after a dash. Optional for a missing field. */
  message?: ReactNode;
  /** `invalid` blocks the save; `missing` does not. */
  kind: "invalid" | "missing";
}

export interface FormSummaryProps {
  /** A title that counts: "3 things before this saves" / « 3 choses avant d'enregistrer ». */
  title: ReactNode;
  /** One sentence on what happens if they save anyway. */
  lead?: ReactNode;
  items: readonly FormSummaryItem[];
  /** Focus it when a save is refused, so the reason is read. */
  ref?: Ref<HTMLDivElement>;
}

/**
 * What stands between the person and saving — design system extension 04.
 * It sits just above the save button, never far from it: a title that counts,
 * a sentence on what saving anyway would do, and one line per field, each a
 * link that moves focus into that field. Invalid lines block the save,
 * missing lines do not; with only missing lines the frame is dashed, « not
 * yet », and not red. Every field still shows its own message: this is the
 * index, not the only place the reason is written. Never raised, never a
 * Callout, never a second primary action.
 */
export function FormSummary({ title, lead, items, ref }: FormSummaryProps) {
  const missingOnly = items.every((item) => item.kind === "missing");
  const focusField = (targetId: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById(targetId);
    if (!el) return;
    event.preventDefault();
    el.focus();
    el.scrollIntoView({ block: "center" });
  };
  return (
    <div ref={ref} tabIndex={-1} className={[styles.root, missingOnly ? styles.missingOnly : ""].filter(Boolean).join(" ")}>
      <p className={styles.title}>{title}</p>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.targetId} className={styles.item}>
            <span>
              <a className={styles.link} href={`#${item.targetId}`} onClick={focusField(item.targetId)}>
                {item.label}
              </a>
              {item.message ? <span className={styles.kind}> — {item.message}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
