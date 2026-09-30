import React, { useId } from "react";

const cx = (...c) => c.filter(Boolean).join(" ");

/**
 * Checkbox — yes / no, with its sentence as its visible label. The whole row
 * is the target, 44px tall. A list of them is a Field `group` (a fieldset
 * with a legend) holding plain rows split by the dashed rule — never cards
 * (Q14): cards are for choosing one; a list of independent yeses is not.
 */
export const Checkbox = ({
  label,
  checked,
  onChange,
  hint,
  invalid = false,
  disabled = false,
  disabledReason,
  size = "sm",
  id: idProp,
  name,
  describedBy,
}) => {
  const auto = useId().replace(/:/g, "");
  const id = idProp ?? `check-${auto}`;
  const note = disabled && disabledReason ? disabledReason : hint;
  const noteId = note ? `${id}-hint` : undefined;
  return (
    <label
      htmlFor={id}
      className={cx(
        "Checkbox_row",
        size === "md" && "Checkbox_md",
        invalid && "Checkbox_invalid",
        disabled && "Checkbox_disabled",
      )}
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        className="Checkbox_input"
        checked={checked}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={[noteId, describedBy].filter(Boolean).join(" ") || undefined}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="Checkbox_text">
        <span>{label}</span>
        {note ? (
          <span id={noteId} className="Checkbox_hint">
            {note}
          </span>
        ) : null}
      </span>
    </label>
  );
};
