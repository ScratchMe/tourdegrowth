/**
 * profiles.ts — les quatre profils de mission de l'instrument d'audit.
 *
 * Ce module n'importe RIEN, et c'est sa raison d'être. `AUDIT_PROFILE_MODELS`
 * est la seule valeur que `validate.ts` avait besoin de lire dans le
 * catalogue ; l'y laisser voulait dire qu'un îlot client important
 * `lib/audit` embarquait les 65 Ko de prose française du catalogue dans son
 * bundle, sans qu'aucune garde ne le voie (`audit-boundary.test.ts` ne
 * regardait que les imports directs — R2-14 a déjà coûté trois découvertes
 * de ce genre).
 *
 * Le catalogue importe le TYPE d'ici ; `lib/audit` importe la valeur d'ici.
 * Rien ne circule dans l'autre sens.
 *
 * Plus fins que `SegmentModel` (R2-26) parce qu'un B2B vendu par des
 * commerciaux et un B2B self-serve ne mesurent ni l'activation ni la
 * rétention avec les mêmes lignes.
 */
export const AUDIT_PROFILE_MODELS = ["b2b-assiste", "b2b-selfserve", "b2c", "marketplace"] as const;

export type AuditProfileModel = (typeof AUDIT_PROFILE_MODELS)[number];
