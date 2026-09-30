import type { FieldStatus } from "@/lib/forms/field";
import styles from "./Field.module.css";
import selectStyles from "./Select.module.css";

/*
 * The parts of Field's sheet that other primitives draw with — design system
 * extension 04. One box for every one-line control (TextField, NumberField)
 * and the classes FieldRow lays a Field's own parts out with, kept in Field's
 * sheet so the controls cannot drift apart again. Not a component: the
 * design sync reads components from their own files.
 */

/** The box classes of the shared field box, for a control drawn in it. */
export const fieldBox = {
  box: styles.box,
  control: styles.control,
  affix: styles.affix,
  invalid: styles.boxInvalid,
  missing: styles.boxMissing,
  disabled: styles.boxDisabled,
  content: styles.content,
} as const;

/** The classes of a box in a status: invalid (3px red edge), missing (dashed), disabled (sunken). */
export function boxStatusClasses(status: FieldStatus, disabled = false): string {
  return [
    status === "invalid" ? styles.boxInvalid : "",
    status === "missing" ? styles.boxMissing : "",
    disabled ? styles.boxDisabled : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** The classes FieldRow lays out with — they name a Field's own parts, so they live in its sheet. */
export const fieldRow = {
  row: styles.row,
  grid: styles.rowGrid,
  joiner: styles.joiner,
  message: [styles.message, styles.messageInvalid, styles.rowMessage].join(" "),
} as const;

/** The classes of the native select drawn as a field, in a status. Shared with DateField's parts. */
export function selectClasses({
  status,
  empty,
  size,
  fit,
}: {
  status: FieldStatus;
  empty: boolean;
  size: "sm" | "md";
  fit: "fill" | "content";
}): string {
  return [
    selectStyles.control,
    size === "sm" ? selectStyles.sm : "",
    fit === "content" ? selectStyles.content : "",
    status === "invalid" ? selectStyles.invalid : "",
    status === "missing" ? selectStyles.missing : "",
    empty ? selectStyles.empty : "",
  ]
    .filter(Boolean)
    .join(" ");
}
