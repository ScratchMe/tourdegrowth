"use client";

import styles from "./ui.module.css";

export interface SelectOption<Id extends string> {
  id: Id;
  label: string;
}

/**
 * Un vocabulaire fermé de plus de trois valeurs. En dessous, `core/Segmented`
 * du design system — son propre prompt le dit : « Two, at most three. Past
 * that it is a list, not a control. »
 *
 * Toujours un `<select>` natif : le clavier, la recherche par frappe et les
 * lecteurs d'écran marchent sans qu'on écrive une ligne pour ça, et un outil
 * à un utilisateur n'a aucune raison de payer une liste déroulante maison.
 */
export function Select<Id extends string>({
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  value: Id;
  options: readonly SelectOption<Id>[];
  onChange: (id: Id) => void;
}) {
  return (
    <select id={id} className={styles.control} value={value} onChange={(event) => onChange(event.target.value as Id)}>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
