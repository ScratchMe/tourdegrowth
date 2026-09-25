import * as React from "react";
import { AnswerOption, QuestionCard } from "tour-de-growth";

/*
 * One of the three answers to a quiz question. Three, always — the content
 * library defines exactly three options per question (20 / 7 / 0 points).
 *
 * NEVER label an option with its score. Scoring stays invisible during the
 * questionnaire: showing the points would change the answers. (The score
 * breakdown on the result page does show them — that screen's whole purpose
 * is explaining the arithmetic after the fact.)
 */

const OPTIONS = [
  "Yes, tracked and reviewed regularly",
  "We can pull it, but rarely look",
  "No",
];

const stack = { display: "flex", flexDirection: "column", gap: 10, maxWidth: 560 } as const;

/** Nothing chosen yet — the state every question opens in. */
export const Unselected = () => (
  <div style={stack}>
    {OPTIONS.map((o) => (
      <AnswerOption key={o}>{o}</AnswerOption>
    ))}
  </div>
);

/**
 * After an answer, or after going back to a question already answered.
 * Selected is the inverse fill with its own text (`--state-selected-*`), the
 * one selection language of the whole product — a ticked game card is the
 * same state at night. Hover is a different thing and never touches the
 * fill: it only lifts the hard shadow (see Interactive), and it is off on
 * touch screens, where a stuck hover would pass for a choice.
 */
export const Selected = () => (
  <div style={stack}>
    {OPTIONS.map((o, i) => (
      <AnswerOption key={o} selected={i === 1}>
        {o}
      </AnswerOption>
    ))}
  </div>
);

/**
 * Live, so the hit area and the two treatments can be felt rather than read:
 * hover an option (shadow only), then click it (the fill inverts).
 */
export const Interactive = () => {
  const [chosen, setChosen] = React.useState<number | null>(null);
  return (
    <div style={stack}>
      <QuestionCard>Do you track a retention rate (D7/D30 or similar)?</QuestionCard>
      {OPTIONS.map((o, i) => (
        <AnswerOption key={o} selected={chosen === i} onClick={() => setChosen(i)}>
          {o}
        </AnswerOption>
      ))}
    </div>
  );
};

/** `mobile` is 16px instead of 17px — padding and hit height do not change. */
export const Mobile = () => (
  <div style={{ ...stack, maxWidth: 320 }}>
    {OPTIONS.map((o, i) => (
      <AnswerOption key={o} size="mobile" selected={i === 1}>
        {o}
      </AnswerOption>
    ))}
  </div>
);
