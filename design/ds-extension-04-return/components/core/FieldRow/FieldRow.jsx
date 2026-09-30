import React, { useId } from "react";

/**
 * FieldRow — two fields that are one statement: "26 000 out of 120 000",
 * "from 20 to 40 %". From a 480px container the two sit side by side and
 * their boxes share one line however their labels wrap (subgrid); below it
 * they stack, with the joiner between them, so a French label or a long
 * message never squeezes into half a phone.
 *
 * `error` is a message about the pair ("The minimum is above the maximum."),
 * set under the whole row; each field keeps its own message for itself.
 */
export const FieldRow = ({ joiner, error, children }) => {
  const id = `row-${useId().replace(/:/g, "")}`;
  const [first, second] = React.Children.toArray(children);
  return (
    <div className="FieldRow_root" role="group" aria-describedby={error ? `${id}-message` : undefined}>
      <div className="FieldRow_grid">
        {first}
        {joiner ? <span className="FieldRow_joiner">{joiner}</span> : null}
        {second}
      </div>
      {error ? (
        <p id={`${id}-message`} className="Field_message Field_messageInvalid FieldRow_message">
          {error}
        </p>
      ) : null}
    </div>
  );
};
