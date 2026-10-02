"use client";

import type { ReactNode } from "react";
import { Disclosure } from "@/components/core/Disclosure";
import { Tag } from "@/components/core/Tag";
import styles from "./WhereToFind.module.css";

export interface WhereToFindProps {
  /** « Où le trouver » / "Where to find it". */
  label: ReactNode;
  /** From the catalogue, in its order, the tool named once. `yours`: one of the team's tools (Settings) — listed first, tagged. */
  tools: { tool: string; path: ReactNode; yours?: boolean }[];
  /** « Aussi dans GA4 : » and the other numbers that tool gives. */
  also?: { tool: string; label: ReactNode; items: { id: string; label: ReactNode }[] }[];
  /** The tag on the team's own tools: « ton outil ». */
  yoursLabel?: ReactNode;
  /** Open on first render — only for a number the team's tools fill. Folded otherwise. */
  open?: boolean;
  /** Opens another number's screen, from « Aussi dans ». */
  onOpenNumber?: (id: string) => void;
  className?: string;
  "data-testid"?: string;
}

/**
 * Each tool and the path in it, one tap away — design system extension 07
 * (brief 07 Q8). Folded by default, and its summary names the tools
 * (« Où le trouver · GA4 · Mixpanel ou Amplitude · Base produit »), so a
 * person sees whether it is worth opening without opening it. Open: tool,
 * then path, word for word from the catalogue; the team's own tools first,
 * tagged; then « Aussi dans GA4 : », the other numbers that tool gives.
 *
 * The trap is not in here any more: it is a TrapNote, above the value. The
 * links to other numbers are ink, not the red of a link, so the screen's
 * only reds stay the trap's advice and a diagnosis.
 */
export function WhereToFind({ label, tools, also = [], yoursLabel, open, onOpenNumber, className, "data-testid": testId }: WhereToFindProps) {
  // Stable: the catalogue's order holds within each group.
  const ordered = [...tools].sort((a, b) => Number(Boolean(b.yours)) - Number(Boolean(a.yours)));
  const summary = (
    <span className={styles.summary}>
      <span>{label}</span>
      <span className={styles.tools}>{ordered.map((t) => t.tool).join(" · ")}</span>
    </span>
  );
  return (
    <Disclosure summary={summary} size="md" defaultOpen={open} className={className} data-testid={testId}>
      <dl className={styles.list}>
        {ordered.map((t, i) => (
          // Two places can share a label (two people of the same role): the index keeps the key unique.
          <div key={`${i}-${t.tool}`} className={styles.entry}>
            <dt className={styles.tool}>
              {t.tool}
              {t.yours && yoursLabel ? <Tag tone="neutral">{yoursLabel}</Tag> : null}
            </dt>
            <dd className={styles.path}>{t.path}</dd>
          </div>
        ))}
      </dl>
      {also.map((a) => (
        <div key={a.tool} className={styles.also}>
          <span>{a.label}</span>
          <ul className={styles.alsoList}>
            {a.items.map((item) => (
              <li key={item.id}>
                <button type="button" className={styles.link} onClick={onOpenNumber ? () => onOpenNumber(item.id) : undefined}>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Disclosure>
  );
}
