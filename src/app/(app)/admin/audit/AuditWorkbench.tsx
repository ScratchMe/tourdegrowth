"use client";

/**
 * AuditWorkbench — l'îlot client de `/admin/audit`.
 *
 * Vide à dessein dans cette étape (AUDIT-PLAN.md §3.4/1.1) : ce fichier est
 * le POINT DE DÉPART de la marche transitive d'`audit-boundary.test.ts`.
 * Poser la garde avant le premier écran, c'est ce qui empêche le catalogue
 * (39 lignes de prose française) et `copy-library.ts` d'entrer dans le
 * bundle du navigateur au moment où l'écran sera écrit — la leçon de R2-14,
 * où trois chemins d'import distincts ramenaient le dictionnaire une fois
 * qu'on croyait l'avoir sorti.
 *
 * La règle que la garde applique : cet îlot ne peut atteindre AUCUN module
 * de `content/` par un import de valeur. Le Server Component (`page.tsx`,
 * étape 1.2) résout catalogue, fiches de glossaire et questions du Tour via
 * `lib/audit/server.ts`, et passe le résultat en props — même discipline
 * que `ResultView` avec ses verdicts (R-09).
 */
export function AuditWorkbench() {
  return null;
}
