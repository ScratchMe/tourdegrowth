import styles from "./ui.module.css";

/**
 * One line of text. For prose, `core/TextArea` inside a `Field`.
 *
 * The limit is a SOFT one, like `TextArea`'s: the count is shown and turns to
 * the alert colour past it, typing is never blocked — the save refuses, and
 * says why. A hard `maxLength` would silently cut a pasted definition
 * mid-word, which the person would only discover on a slide.
 */
export function TextField({
  id,
  value,
  onChange,
  limit,
  describedBy,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  limit?: number;
  describedBy?: string;
  placeholder?: string;
}) {
  const over = limit !== undefined && value.length > limit;
  const counterId = `${id}-count`;
  return (
    <>
      <input
        id={id}
        className={[styles.control, over ? styles.controlOver : ""].filter(Boolean).join(" ")}
        type="text"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        aria-invalid={over || undefined}
        aria-describedby={[describedBy, limit !== undefined ? counterId : null].filter(Boolean).join(" ") || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {limit !== undefined ? (
        <span id={counterId} className={[styles.counter, over ? styles.counterOver : ""].filter(Boolean).join(" ")}>
          {value.length}/{limit}
        </span>
      ) : null}
    </>
  );
}
