"use client";

import styles from "./ui.module.css";

/**
 * Une date, en `yyyy-mm-dd` — la forme que le schéma stocke partout
 * (`Pass.date`, `requestedOn`, `drawnOn`…). `<input type="date">` rend déjà
 * cette valeur telle quelle, donc rien à convertir : ce qui sort du champ est
 * ce qui part dans le fichier.
 */
export function DateInput({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  return <input id={id} className={styles.control} type="date" value={value} onChange={(event) => onChange(event.target.value)} />;
}
