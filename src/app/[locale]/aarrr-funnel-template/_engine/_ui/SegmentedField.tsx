import { Segmented, type SegmentedOption } from "@/components/core/Segmented";
import styles from "./ui.module.css";

/**
 * `core/Segmented` with its label shown. The design system's control names
 * itself for screen readers only (`aria-label`), which is right in a header
 * and wrong in a form: the rule this route keeps (see `Field`) is that every
 * control's name is VISIBLE. The same string is passed as the group's
 * accessible name, so what is seen and what is announced cannot drift.
 */
export function SegmentedField<Id extends string>({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint?: string;
  value: Id;
  options: readonly SegmentedOption<Id>[];
  onChange: (id: Id) => void;
}) {
  return (
    <div className={styles.field}>
      <span className={styles.label} aria-hidden="true">
        {label}
      </span>
      <Segmented options={options} value={value} label={label} onChange={onChange} />
      {hint ? <p className={styles.hint}>{hint}</p> : null}
    </div>
  );
}
