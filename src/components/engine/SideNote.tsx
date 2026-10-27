import type { ReactNode } from "react";
import { MetaLabel } from "@/components/brand/MetaLabel";
import styles from "./SideNote.module.css";

export interface SideNoteProps {
  /** "absent": no frame, ink; "pending": the system's dashed edge (dashed = not yet). Never red. */
  kind?: "absent" | "pending";
  /** The part's own eyebrow, kept so the board's structure stays: « L'argent · août 2026 ». */
  eyebrow?: ReactNode;
  /** « Les vendeurs ne paient pas : l'offre ne rapporte rien en direct ». */
  title: ReactNode;
  /** One or two short paragraphs: what the side does instead, or what is needed. */
  children?: ReactNode;
  /** One quiet Button: « Fixer les cibles des vendeurs → », « … Coche-le dans les réglages ». */
  action?: ReactNode;
  headingId?: string;
  className?: string;
  "data-testid"?: string;
}

/**
 * What a side says where a part is absent — design system extension 10 (Q11).
 * Supply without the subscriptions has no money, one funnel column and often
 * « not enough targets »: it must not look broken or empty. The part keeps
 * its place and its heading, and says why in a full sentence, with the one
 * thing that would change it.
 *
 * - `kind="absent"`: absent by design — nothing is missing, nothing to do. No
 *   frame, ink only, the part's own eyebrow and a full sentence: what the
 *   side does instead. An optional quiet `action` when a setting would change
 *   it;
 * - `kind="pending"`: not yet — the diagnosis needs team targets. The
 *   system's dashed edge (dashed = not yet), never red: nothing holds the
 *   side back that a target names. Its `action` leads to the targets.
 *
 * Never a « ? » box (a « ? » is a figure that cannot be computed; here there
 * is none), never a zero, never an empty card, never a comparison with the
 * other side. It writes no word of its own: the title, the body and the
 * action all come through its props.
 */
export function SideNote({ kind = "absent", eyebrow, title, children, action, headingId, className, "data-testid": testId }: SideNoteProps) {
  return (
    <section
      className={[styles.root, kind === "pending" ? styles.pending : styles.absent, className ?? ""].filter(Boolean).join(" ")}
      aria-labelledby={headingId}
      data-kind={kind}
      data-testid={testId}
    >
      {eyebrow ? (
        <MetaLabel size="sm" tone="muted" wide>
          {eyebrow}
        </MetaLabel>
      ) : null}
      <h3 id={headingId} className={styles.title}>
        {title}
      </h3>
      {children ? <div className={styles.body}>{children}</div> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </section>
  );
}
