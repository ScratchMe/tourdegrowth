import type { ReactNode } from "react";
import { MetaLabel } from "@/components/brand/MetaLabel";
import styles from "./TrapNote.module.css";

export interface TrapNoteProps {
  /** « Le piège, avant de taper » / "The trap, before you type". A string: it also names the note for a screen reader. */
  label: string;
  /** The trap's text, word for word from the catalogue: the expertise is not rewritten. */
  children: ReactNode;
  /** When both motions are ticked: the hybrid trap, under its own label (« Si tu vends des deux façons »). */
  hybrid?: { label: ReactNode; text: ReactNode };
  /** At most one quiet Button: « Écrire ta définition », when the trap asks for one. */
  action?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

/**
 * The number's trap, shown before the value it changes — design system
 * extension 07 (brief 07 Q8). Every trap of the catalogue is about what to
 * put in the box (which count, which period, which tool's definition), so it
 * stands open just above the value instead of folded after it.
 *
 * Advice, so a dashed red edge (`--engine-advice-edge`): never a wash, never
 * a solid red edge (those are a diagnosis), never a card. One per number;
 * the hybrid's trap joins the same note under its own label. The number's
 * screen (`MetricSheet`) is its one call site.
 */
export function TrapNote({ label, children, hybrid, action, className, "data-testid": testId }: TrapNoteProps) {
  return (
    <aside className={[styles.root, className ?? ""].filter(Boolean).join(" ")} aria-label={label} data-testid={testId}>
      <MetaLabel size="xs" tone="muted">
        {label}
      </MetaLabel>
      <p className={styles.text}>{children}</p>
      {hybrid ? (
        <div className={styles.hybrid} data-testid={testId ? `${testId}-hybrid` : undefined}>
          <MetaLabel size="xs" tone="muted">
            {hybrid.label}
          </MetaLabel>
          <p className={styles.text}>{hybrid.text}</p>
        </div>
      ) : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </aside>
  );
}
