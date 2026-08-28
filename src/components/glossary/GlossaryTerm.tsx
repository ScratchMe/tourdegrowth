"use client";

import { GLOSSARY, type GlossaryTermId } from "@/content/glossary";
import { tc } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { DefinitionPopover } from "./DefinitionPopover";
import { DefinitionTrigger } from "./DefinitionTrigger";
import styles from "./GlossaryTerm.module.css";

export interface GlossaryTermProps {
  id: GlossaryTermId;
  locale: Locale;
  /** App/screen-wide "which popover is open" state — only one open at a time (SPEC-ADDENDUM-01.md §1.2). */
  openId: string | null;
  onOpenChange: (id: string | null) => void;
  tone?: "muted" | "ink" | "alert";
  closeLabel: string;
  /** e.g. "Definition: {term}" / "Définition : {term}" — {term} is replaced with the resolved term. */
  labelTemplate: string;
}

/**
 * A glossary term's "?" trigger plus its definition popover, wired together.
 * Renders BOTH the anchored (desktop) and docked (mobile) popover variants
 * when open and lets CSS pick one per viewport — DefinitionTrigger.prompt.md:
 * "Below 640px always use docked, a 280px anchored panel overflows one side
 * of a 390px screen no matter how it is positioned." No JS viewport
 * detection, so no hydration mismatch risk (same pattern the app already
 * uses elsewhere for breakpoint-dependent rendering).
 */
export function GlossaryTerm({ id, locale, openId, onOpenChange, tone = "muted", closeLabel, labelTemplate }: GlossaryTermProps) {
  const entry = GLOSSARY[id];
  const term = tc(entry.term, locale);
  const definition = tc(entry.definition, locale);
  const open = openId === id;
  const label = labelTemplate.replace("{term}", term);

  return (
    <span className={styles.anchor}>
      <DefinitionTrigger
        term={term}
        label={label}
        open={open}
        tone={tone}
        onClick={() => onOpenChange(open ? null : id)}
      />
      {open ? (
        <>
          <span className={styles.anchoredWrap}>
            <DefinitionPopover placement="anchored" term={term} definition={definition} onClose={() => onOpenChange(null)} />
          </span>
          <span className={styles.dockedWrap}>
            <DefinitionPopover
              placement="docked"
              term={term}
              definition={definition}
              closeLabel={closeLabel}
              onClose={() => onOpenChange(null)}
            />
          </span>
        </>
      ) : null}
    </span>
  );
}
