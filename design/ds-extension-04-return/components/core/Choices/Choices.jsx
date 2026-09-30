import React, { useId } from "react";
import { Field } from "../Field/Field.jsx";

/**
 * Choices — pick one of a handful, as cards. A real radio group: a fieldset
 * whose visible legend is the question, native radios (arrow keys move
 * between options; nothing moves on until the form is saved), each drawn
 * with the system's one radio mark (Q11). Not AnswerOption generalised (Q12):
 * AnswerOption is a button that moves the quiz on after one tap.
 *
 * Nothing is chosen unless the caller says so: `value` is null by default.
 */
export const Choices = ({
  legend,
  options,
  value = null,
  onChange,
  columns = 1,
  hint,
  error,
  missing,
  optional,
  size = "md",
  name: nameProp,
  id,
}) => {
  const auto = useId().replace(/:/g, "");
  const name = nameProp ?? `choices-${auto}`;
  return (
    <Field
      group
      label={legend}
      hint={hint}
      error={error}
      missing={missing}
      optional={optional}
      size={size}
      id={id}
    >
      {({ id: groupId, status }) => (
        <div className={`Choices_root ${size === "sm" ? "Choices_sm" : "Choices_md"}`}>
          <div className={`Choices_list ${columns === 2 ? "Choices_cols2" : ""}`}>
            {options.map((o) => {
              const noteId = o.note || o.disabledNote ? `${groupId}-${o.value}-note` : undefined;
              return (
                <label
                  key={o.value}
                  className={`Choices_option ${o.disabled ? "Choices_disabled" : ""}`}
                >
                  <input
                    type="radio"
                    className="Choices_input"
                    name={name}
                    value={o.value}
                    checked={value === o.value}
                    disabled={o.disabled}
                    aria-describedby={noteId}
                    aria-invalid={status === "invalid" || undefined}
                    onChange={() => onChange(o.value)}
                  />
                  <span className="Choices_text">
                    <span>{o.label}</span>
                    {o.disabled && o.disabledNote ? (
                      <span id={noteId} className="Choices_note">
                        {o.disabledLead ? (
                          <span className="Choices_noteLead">{o.disabledLead} — </span>
                        ) : null}
                        {o.disabledNote}
                      </span>
                    ) : o.note ? (
                      <span id={noteId} className="Choices_note">
                        {o.note}
                      </span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </Field>
  );
};
