import { AnswerOption, MetaLabel, QuestionCard, QuestionText, StageProgress } from "tour-de-growth";

/*
 * The question itself. It is the loud card of the quiz screen (the hero
 * shadow, 8px) — the one loud surface, the way ScoreDisplay is on a result —
 * so there is never a raised card next to it.
 *
 * Its children may contain an inline glossary trigger (see QuestionText);
 * six of the fifteen questions carry one. Questions and answers:
 * content/copy-library.ts; the stage caption: dictionary.ts
 * (`quiz.stageLabelTemplate`).
 */

/** `md`: 34px question in 40px 44px padding. */
export const Medium = () => (
  <div style={{ maxWidth: 560 }}>
    <QuestionCard>{"Do you track a retention rate (D7/D30 or similar)?"}</QuestionCard>
  </div>
);

/** `sm`: 25px in 24px 22px. Below 760px the `md` size shrinks to this on its own. */
export const Small = () => (
  <div style={{ maxWidth: 320 }}>
    <QuestionCard size="sm">{"Do you track a retention rate (D7/D30 or similar)?"}</QuestionCard>
  </div>
);

/**
 * In place, as the quiz page mounts it: the stage bar and its caption, the
 * question through QuestionText (ret-3 carries a glossary trigger), and the
 * three answers.
 */
export const InContext = () => (
  <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 16 }}>
    <StageProgress current={3} total={5} aria-label="Stage 3 of 5 — Retention" />
    <MetaLabel>{"Stage 3 of 5 — Retention"}</MetaLabel>
    <QuestionCard>
      <QuestionText
        questionId="ret-3"
        text="Do you know your main cause of churn?"
        locale="en"
        openGlossaryId={null}
        onOpenGlossaryChange={() => {}}
        glossaryCloseLabel="Close"
        glossaryLabelTemplate={"Definition: {term}"}
        glossaryMoreLabel="Learn more →"
      />
    </QuestionCard>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <AnswerOption>{"Yes, backed by data or interviews"}</AnswerOption>
      <AnswerOption>{"A hunch, not confirmed"}</AnswerOption>
      <AnswerOption>{"No idea"}</AnswerOption>
    </div>
  </div>
);

/** The longest French question without a glossary term (ref-1), which is where the card's line height gets tested. */
export const French = () => (
  <div style={{ maxWidth: 560 }}>
    <QuestionCard>{"Ton produit a-t-il un mécanisme de partage ou de parrainage ?"}</QuestionCard>
  </div>
);
