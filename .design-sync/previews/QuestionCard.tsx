import { AnswerOption, QuestionCard, StageProgress } from "tour-de-growth";

/*
 * The question itself. It is the `raised` card of the quiz screen — the one
 * loud surface, the way ScoreDisplay is on a result — so there is never a
 * second raised card next to it.
 *
 * Its children may contain an inline glossary trigger (see GlossaryTerm);
 * six of the fifteen questions carry one.
 */

/** Desktop: 28px question in 30px 32px padding. */
export const Desktop = () => (
  <div style={{ maxWidth: 560 }}>
    <QuestionCard>Do you track a retention rate (D7/D30 or similar)?</QuestionCard>
  </div>
);

/** Mobile: 22px in 22px 20px. Below 760px the desktop size shrinks to this on its own. */
export const Mobile = () => (
  <div style={{ maxWidth: 320 }}>
    <QuestionCard size="mobile">Do you track a retention rate (D7/D30 or similar)?</QuestionCard>
  </div>
);

/** In place: progress, question, answers — the whole quiz screen is these three. */
export const InContext = () => (
  <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 16 }}>
    <StageProgress current={3} total={5} label="Stage 3 of 5" aria-label="Stage 3 of 5" />
    <QuestionCard>Do you know your main cause of churn?</QuestionCard>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <AnswerOption>Yes, backed by data or interviews</AnswerOption>
      <AnswerOption>A hunch, not confirmed</AnswerOption>
      <AnswerOption>No idea</AnswerOption>
    </div>
  </div>
);

/** A longer French question, which is where the card's line height gets tested. */
export const French = () => (
  <div style={{ maxWidth: 560 }}>
    <QuestionCard>Connais-tu le coût d'acquisition d'un client sur ton principal canal ?</QuestionCard>
  </div>
);
