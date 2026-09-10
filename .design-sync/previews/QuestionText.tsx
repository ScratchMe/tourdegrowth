import * as React from "react";
import { QuestionCard, QuestionText } from "tour-de-growth";

/*
 * Question copy with its glossary trigger already placed. It looks up the
 * question's term in `content/question-glossary-terms.ts` and splits the
 * sentence on the exact anchor substring for that locale, so the "?" lands
 * right after the jargon rather than at the end of the line.
 *
 * The open popover is the CALLER's state — one at a time per screen, which is
 * why `openGlossaryId` comes in as a prop rather than living in here.
 */

const glossary = {
  glossaryCloseLabel: "Close",
  glossaryLabelTemplate: "Definition: {term}",
  glossaryMoreLabel: "Learn more →",
};

const Screen = ({
  questionId,
  text,
  locale = "en",
  labels = glossary,
}: {
  questionId: string;
  text: string;
  locale?: "en" | "fr";
  labels?: typeof glossary;
}) => {
  const [open, setOpen] = React.useState("");
  return (
    <div style={{ maxWidth: 560 }}>
      <QuestionCard>
        <QuestionText
          questionId={questionId}
          text={text}
          locale={locale}
          openGlossaryId={open}
          onOpenGlossaryChange={(id) => setOpen(id ?? "")}
          {...labels}
        />
      </QuestionCard>
    </div>
  );
};

/** A question with a term: the trigger appears right after "aha" moment. */
export const WithTerm = () => (
  <Screen questionId="act-1" text={'Have you defined a specific "aha" moment for new users?'} />
);

/** Another one — the anchor is mid-sentence here too. */
export const Churn = () => <Screen questionId="ret-3" text="Do you know your main cause of churn?" />;

/** A question with no glossary term renders as plain text, no trigger. */
export const NoTerm = () => (
  <Screen questionId="ret-1" text="Do you track a retention rate (D7/D30 or similar)?" />
);

/** French, where the anchor substring is different copy for the same term. */
export const French = () => (
  <Screen
    questionId="ret-3"
    locale="fr"
    text="Connais-tu ta principale cause de churn ?"
    labels={{
      glossaryCloseLabel: "Fermer",
      glossaryLabelTemplate: "Définition : {term}",
      glossaryMoreLabel: "En savoir plus →",
    }}
  />
);
