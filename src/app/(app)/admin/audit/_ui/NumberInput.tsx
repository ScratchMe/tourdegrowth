"use client";

import styles from "./ui.module.css";

/**
 * Un nombre. `value` est `null` quand la case est vide — distinct de zéro,
 * qui est une vraie valeur (« 0 client venu d'une recommandation » est un
 * constat, pas une absence de saisie). `<input type="number">` rend `""` pour
 * les deux, donc la conversion se fait ici et une seule fois.
 */
export function NumberInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
}) {
  return (
    <input
      id={id}
      className={styles.control}
      type="number"
      inputMode="decimal"
      value={value === null ? "" : String(value)}
      placeholder={placeholder}
      onChange={(event) => {
        const raw = event.target.value;
        if (raw.trim() === "") return onChange(null);
        const parsed = Number(raw);
        onChange(Number.isFinite(parsed) ? parsed : null);
      }}
    />
  );
}
