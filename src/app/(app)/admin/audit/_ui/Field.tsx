"use client";

import type { ReactNode } from "react";
import styles from "./ui.module.css";

/**
 * _ui/ — les primitives de saisie de `/admin/audit`, LOCALES à la route.
 *
 * Le design system n'a aucun `<input>` : `core/TextArea` se décrit comme
 * « the system's only text input ». La saisie d'un diagnostic a besoin d'un
 * champ texte, d'un nombre, d'une date et d'un sélecteur par vocabulaire
 * fermé (sept statuts, quatre causes, six sortes de source…). Passer par un
 * brief Claude Design coûterait un aller-retour de plusieurs jours pour un
 * outil à UN utilisateur qui n'est pas une surface produit
 * (AUDIT-PLAN.md §3.3, décision 1).
 *
 * Donc : construits aux tokens seuls, dans un dossier `_ui` — le `_` en fait
 * un dossier privé pour Next, jamais routé —, **jamais ajoutés à
 * `src/components/` ni synchronisés vers Claude Design**. Le jour où un de
 * ces champs doit apparaître dans le produit, il repasse par un brief.
 */
export function Field({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint ? <p className={styles.hint}>{hint}</p> : null}
    </div>
  );
}
