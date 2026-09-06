"use client";

import { tc } from "@/lib/i18n/translatable";
import type { Locale } from "@/lib/i18n/locale";
import { GlossaryTerm } from "@/components/glossary/GlossaryTerm";
import { QUESTION_GLOSSARY_TERMS } from "@/content/question-glossary-terms";

export interface QuestionTextProps {
  questionId: string;
  text: string;
  locale: Locale;
  openGlossaryId: string | null;
  onOpenGlossaryChange: (id: string | null) => void;
  glossaryCloseLabel: string;
  glossaryLabelTemplate: string;
  glossaryMoreLabel: string;
}

/**
 * Renders a question's text, inserting an inline glossary "?" trigger right
 * after its jargon term when the question is one of the six listed in
 * SPEC-ADDENDUM-01.md §1.2 (content/question-glossary-terms.ts). Falls back
 * to plain text for every other question — most of them have no jargon term
 * at all.
 */
export function QuestionText({
  questionId,
  text,
  locale,
  openGlossaryId,
  onOpenGlossaryChange,
  glossaryCloseLabel,
  glossaryLabelTemplate,
  glossaryMoreLabel,
}: QuestionTextProps) {
  const glossaryTerm = QUESTION_GLOSSARY_TERMS[questionId];
  if (!glossaryTerm) return <>{text}</>;

  const anchor = tc(glossaryTerm.anchor, locale);
  const index = text.indexOf(anchor);
  if (index === -1) return <>{text}</>;

  const before = text.slice(0, index + anchor.length);
  const after = text.slice(index + anchor.length);

  return (
    <>
      {before}
      <GlossaryTerm
        id={glossaryTerm.termId}
        locale={locale}
        openId={openGlossaryId}
        onOpenChange={onOpenGlossaryChange}
        closeLabel={glossaryCloseLabel}
        labelTemplate={glossaryLabelTemplate}
        moreLabel={glossaryMoreLabel}
      />
      {after}
    </>
  );
}
