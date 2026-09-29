"use client";

import { GLOSSARY_TERMS, type GlossaryTermId } from "@/content/glossary-terms";
import { tc } from "@/lib/i18n/translatable";
import type { Locale } from "@/lib/i18n/locale";
import { localePath } from "@/lib/i18n/routes";
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
  /** Link text for the term's own page, e.g. "Learn more →" — REVIEW-02.md R2-13. */
  moreLabel: string;
}

/**
 * A glossary term's "?" trigger plus its definition popover, wired together.
 * ONE popover when open (`placement="auto"`, audit du kit §6, CHANTIERS.md A4,
 * 2026-09-29), in the top layer, and CSS picks its shape per viewport —
 * DefinitionTrigger.prompt.md: "Below 640px always use docked, a 280px
 * anchored panel overflows one side of a 390px screen no matter how it is
 * positioned." Above that it hangs under this trigger, which carries the
 * anchor name while its popover is open. No JS viewport detection, so no
 * hydration mismatch risk; and no longer two copies rendered at once.
 */
export function GlossaryTerm({
  id,
  locale,
  openId,
  onOpenChange,
  tone = "muted",
  closeLabel,
  labelTemplate,
  moreLabel,
}: GlossaryTermProps) {
  const entry = GLOSSARY_TERMS[id];
  const term = tc(entry.term, locale);
  const definition = tc(entry.definition, locale);
  const open = openId === id;
  const label = labelTemplate.replace("{term}", term);
  const more = { href: localePath(locale, `/glossary/${id}`), label: moreLabel };

  return (
    <span className={styles.anchor}>
      <DefinitionTrigger
        term={term}
        label={label}
        open={open}
        tone={tone}
        className={open ? styles.anchorOpen : undefined}
        onClick={() => onOpenChange(open ? null : id)}
      />
      {open ? (
        <DefinitionPopover
          placement="auto"
          term={term}
          definition={definition}
          more={more}
          closeLabel={closeLabel}
          onClose={() => onOpenChange(null)}
        />
      ) : null}
    </span>
  );
}
