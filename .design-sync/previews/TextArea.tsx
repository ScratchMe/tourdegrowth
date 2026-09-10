import * as React from "react";
import { QuestionCard, TextArea } from "tour-de-growth";

/*
 * The only text input in the system, so it is also the shape any future field
 * should follow. `label` is REQUIRED in the type on purpose: the visible
 * prompt sits in the QuestionCard above rather than in a <label>, so without
 * it the field would have no accessible name at all (REVIEW.md R-19).
 *
 * `maxLength` is a soft cap — the counter turns over and the border goes red,
 * but typing is never blocked. Real enforcement is server-side, in two
 * independent places (SPEC-ADDENDUM-02 §1.4).
 */

const PROMPT = "Anything else about your business we should know?";

const Field = ({ initial }: { initial: string }) => {
  const [value, setValue] = React.useState(initial);
  return (
    <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 14 }}>
      <QuestionCard size="desktop">{PROMPT}</QuestionCard>
      <TextArea value={value} onChange={setValue} maxLength={500} label={PROMPT} />
    </div>
  );
};

/** Empty — and submitting it empty IS how you skip this screen; there is no Skip button. */
export const Empty = () => <Field initial="" />;

/** Filled, well under the cap. */
export const Filled = () => (
  <Field initial="We sell scheduling software to independent physiotherapists. Most churn happens in the first month, and we have never worked out why." />
);

/** Over the cap: red border, red counter, and the text still types. */
export const OverLimit = () => (
  <Field
    initial={
      "We sell scheduling software to independent physiotherapists. Most churn happens in the first month, and we have never worked out why. " +
      "Acquisition is mostly word of mouth from two physio schools, which we cannot scale, and we have never measured what a customer costs us. " +
      "Pricing is one flat plan we set three years ago and have not revisited since, though several customers have asked for a team tier. " +
      "We have no referral mechanism at all beyond people telling each other in the staff room."
    }
  />
);
