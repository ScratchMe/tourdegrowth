"use client";

import styles from "./ui.module.css";

/** Une ligne de texte. Pour de la prose, `core/TextArea` du design system. */
export function TextInput({
  id,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <input
      id={id}
      className={styles.control}
      type="text"
      value={value}
      placeholder={placeholder}
      // Un seul champ, un seul écran, et l'écran existe pour être rempli :
      // l'auditeur l'a ouvert exprès. (Pas de directive eslint ici — la règle
      // jsx-a11y/no-autofocus n'est pas activée par la config Next, et une
      // directive inutile est un avertissement de lint, cf. R-06.)
      autoFocus={autoFocus}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
