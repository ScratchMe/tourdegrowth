import styles from "./ui.module.css";

export interface SelectOption<Id extends string> {
  id: Id;
  label: string;
}

export interface SelectGroup<Id extends string> {
  /** Rendered as an `<optgroup>` label: read by screen readers, not selectable. */
  label: string;
  options: readonly SelectOption<Id>[];
}

/**
 * A closed vocabulary past three values — below that, `core/Segmented`
 * (its own prompt: "two, at most three. Past that it is a list, not a
 * control"). Always a native `<select>`: keyboard, type-to-search and screen
 * readers work without a line written for them.
 *
 * `placeholder` renders an empty first option and makes `""` a legal value:
 * a source nobody has chosen yet is NOT the first tool in the list, and
 * pre-selecting one would write a provenance the person never gave.
 *
 * `groups` follow the flat `options` — the source list puts the tools a
 * number usually comes from first, and the rest under their own heading,
 * rather than hiding the rest.
 */
export function Select<Id extends string>({
  id,
  value,
  options,
  groups,
  onChange,
  placeholder,
  describedBy,
  invalid,
}: {
  id: string;
  value: Id | "";
  options: readonly SelectOption<Id>[];
  groups?: readonly SelectGroup<Id>[];
  onChange: (id: Id | "") => void;
  placeholder?: string;
  describedBy?: string;
  invalid?: boolean;
}) {
  return (
    <select
      id={id}
      className={styles.control}
      value={value}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      onChange={(event) => onChange(event.target.value as Id | "")}
    >
      {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
      {groups?.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
