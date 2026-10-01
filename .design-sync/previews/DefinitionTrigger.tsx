import { DefinitionTrigger, StageScore, StageScores } from "tour-de-growth";

/*
 * The "?" that opens a definition. On its own it is deliberately tiny — it
 * has to sit inside a line of question copy or a row of the score sheet without
 * pushing anything around, so it is sized to the text it interrupts.
 *
 * It does not own the popover. Whether one is open is the caller's state
 * (one at a time per screen) — see GlossaryTerm for the two of them wired
 * together, which is how the product always uses it.
 *
 * Questions: content/copy-library.ts, split on the anchor the way
 * QuestionText splits them (content/question-glossary-terms.ts); terms:
 * content/glossary-terms.ts; labels: dictionary.ts (`glossary`).
 */

const line = { font: "17px/1.5 Inter, sans-serif", margin: 0 } as const;

/** Inline in a sentence, right after its term — which is where six of the fifteen questions put it. */
export const Inline = () => (
  <p style={line}>
    {"Have you defined a specific \"aha\" moment"}
    <DefinitionTrigger term={"\"Aha\" moment"} label={"Definition: \"Aha\" moment"} />
    {" for new users?"}
  </p>
);

/*
 * A solid ring at rest — a real edge, the sign of a control (design system
 * extension 05, C35: everywhere, the quiz included; it was dashed, which in
 * this system means « not yet » and read as a loading spinner). `open` drives
 * aria-expanded and the inverse fill, the system's one language for « this
 * one ». Side by side, each captioned with what changes. Hover (pointer only)
 * turns it body ink. (For the trigger with the panel it opens, see
 * GlossaryTerm.)
 */
export const Open = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <p style={line}>
      Closed <DefinitionTrigger term="Churn" /> — a solid muted ring, aria-expanded=false
    </p>
    <p style={line}>
      Open <DefinitionTrigger term="Churn" open /> — the inverse fill, aria-expanded=true
    </p>
  </div>
);

/**
 * `tone` matches the surrounding text: `muted` on a neutral row, `alert` on
 * the stalling stage's red wash — an ink-coloured "?" there would read as a
 * different element. Scores are the product's sample result
 * (lib/submissions/sample.ts).
 */
export const Tones = () => (
  <StageScores label="Score per stage, out of 20" style={{ maxWidth: 420 }}>
    <StageScore stage="Acquisition" score={18}>
      <DefinitionTrigger term="Acquisition" label="Definition: Acquisition" tone="muted" />
    </StageScore>
    <StageScore stage="Retention" score={8} tone="alert">
      <DefinitionTrigger term="Retention" label="Definition: Retention" tone="alert" />
    </StageScore>
  </StageScores>
);

/** `label` overrides the whole accessible name — the caller localizes it. Here in French, on ret-3. */
export const Localized = () => (
  <p style={line}>
    {"Connais-tu ta principale cause de churn"}
    <DefinitionTrigger term="Churn" label="Définition : Churn" />
    {" ?"}
  </p>
);
