import React, { useId } from "react";

const cx = (...c) => c.filter(Boolean).join(" ");

/** Which message wins when a caller passes both: invalid blocks the save, missing does not. */
export const fieldStatus = ({ error, missing }) =>
  error ? "invalid" : missing ? "missing" : undefined;

/** Class for a box (or a native <select>/<textarea> drawn as one) in a status. */
export const boxStatusClass = (status, disabled) =>
  cx(
    status === "invalid" && "Field_boxInvalid",
    status === "missing" && "Field_boxMissing",
    disabled && "Field_boxDisabled",
  );

/** Shows a one-line field's soft-limit count once it is close to the limit. */
export const shouldShowCount = (count, max, reveal = 0.8) =>
  max != null && count >= Math.ceil(max * reveal);

/**
 * Field — the visible label, the hint and the message around one control, or
 * the legend around a group of them (`group`).
 *
 * Every control in a form gets its visible label from Field (Q15). The
 * primitives (TextField, NumberField, Select, DateField, Choices) render their
 * own Field; wrap anything else — TextArea, Segmented — with a render prop:
 *
 *   <Field label="Your definition" optional="optional">
 *     {(p) => <TextArea id={p.id} aria-describedby={p.describedBy} … />}
 *   </Field>
 */
export const Field = ({
  label,
  hint,
  error,
  missing,
  optional,
  counter,
  size = "md",
  fit = "fill",
  group = false,
  labelId: labelIdProp,
  id: idProp,
  className,
  children,
}) => {
  const auto = useId().replace(/:/g, "");
  const id = idProp ?? `field-${auto}`;
  const labelId = labelIdProp ?? `${id}-label`;
  const hintId = hint ? `${id}-hint` : undefined;
  const status = fieldStatus({ error, missing });
  const message = error || missing;
  const messageId = message ? `${id}-message` : undefined;
  const counterId = counter ? `${id}-count` : undefined;
  // The message is read first: it is the reason the person is back here.
  const describedBy = [messageId, hintId, counterId].filter(Boolean).join(" ") || undefined;

  const control =
    typeof children === "function"
      ? children({ id, labelId, describedBy, status, invalid: status === "invalid" })
      : children;

  const labelContent = (
    <>
      {label}
      {optional ? <span className="Field_optional">{optional}</span> : null}
    </>
  );

  const counterEl = counter ? (
    <span
      id={counterId}
      className={cx("Field_counter", counter.over && "Field_counterOver")}
      aria-label={counter.label}
    >
      {counter.count}/{counter.max}
    </span>
  ) : null;

  const after = (
    <div className="Field_after">
      {message ? (
        <p
          id={messageId}
          className={cx(
            "Field_message",
            status === "invalid" ? "Field_messageInvalid" : "Field_messageMissing",
          )}
        >
          {message}
        </p>
      ) : null}
      {hint ? (
        <p id={hintId} className="Field_hint">
          {hint}
        </p>
      ) : null}
    </div>
  );

  const frame = cx(
    "Field_field",
    size === "sm" ? "Field_sm" : "Field_md",
    fit === "content" && "Field_content",
    className,
  );

  if (group) {
    return (
      <fieldset className={cx(frame, "Field_fieldset")} aria-describedby={describedBy}>
        <legend className="Field_legend">
          <span className="Field_labelRow">
            <span id={labelId} className="Field_label">
              {labelContent}
            </span>
            {counterEl}
          </span>
        </legend>
        <div className="Field_groupBody">
          {control}
          {after}
        </div>
      </fieldset>
    );
  }

  return (
    <div className={frame}>
      <div className="Field_labelRow">
        <label id={labelId} htmlFor={id} className="Field_label">
          {labelContent}
        </label>
        {counterEl}
      </div>
      {control}
      {after}
    </div>
  );
};
