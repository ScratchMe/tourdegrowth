import type { ReactNode } from "react";
import styles from "./ui.module.css";

/**
 * A yes/no with its sentence beside it. The design system has no checkbox
 * (Segmented's prompt: "never for on/off — that is a checkbox, which this
 * system does not have"), so it lives here, local, like every engine input.
 */
export function CheckField({
  id,
  checked,
  onChange,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** The label — visible, and the control's accessible name. */
  children: ReactNode;
}) {
  return (
    <label className={styles.check} htmlFor={id}>
      <input id={id} className={styles.checkbox} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  );
}
