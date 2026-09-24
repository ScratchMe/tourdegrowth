import type { ReactNode } from "react";
import styles from "./ui.module.css";

/**
 * _ui/ — the growth engine's input primitives, LOCAL to this route (spec
 * D17). The design system has no `<input>` beyond `TextArea`; a Claude Design
 * brief would delay the engine by days, and importing `/admin/audit/_ui`
 * would couple two features through another route's private folder. So:
 * rebuilt here on the audit's model (copied, not imported), on tokens only,
 * never promoted to `src/components/` without a brief (v1.1 if the engine
 * finds its public).
 *
 * `Field` is the rule the audit learned three times (1.3a, 1.4, 1.6): a
 * control without a VISIBLE label is anonymous to half the people using it,
 * and `TextArea`'s `label` is an accessible name only. Every control of the
 * engine sits in a `Field`, or in a `Choices` fieldset that carries its own
 * visible legend — never bare.
 */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  /** A short instruction, always shown. */
  hint?: string;
  /** Shown in the alert colour and announced with the control. */
  error?: string | null;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint ? (
        <p className={styles.hint} id={`${htmlFor}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className={styles.error} id={`${htmlFor}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** The `aria-describedby` a control inside a `Field` points at, so its hint and error are read with it. */
export function describedBy(id: string, parts: { hint?: string; error?: string | null }): string | undefined {
  const ids = [parts.hint ? `${id}-hint` : null, parts.error ? `${id}-error` : null].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}
