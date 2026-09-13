import { applicableRows, type Entry, type Mission, type Pass } from "./schema";

/**
 * coverage.ts — les trois compteurs, la métrique de tête de l'instrument.
 *
 * « Documenté » / « l'entreprise ne l'a pas » / « je n'y ai pas eu accès »,
 * toujours affichés ensemble et en fraction (« 16 documentées sur 24 »),
 * jamais en pourcentage nu.
 *
 * Le dénominateur est TOUJOURS le nombre de lignes du catalogue embarqué qui
 * s'appliquent au profil (`appliesTo`). Rien de ce qui se saisit ne le
 * change : un refus d'accès baisse « documenté », comme il doit. C'est le
 * correctif structurel du défaut que les trois grilles de départ partageaient
 * et que ce repo a déjà payé une fois (R2-01, le K-factor qui ne pouvait pas
 * descendre sous 1) : un taux de couverture dont les refus sortaient du
 * dénominateur montait quand la finance disait non.
 *
 * Le test à rejouer à chaque évolution de ce calcul : sa pire valeur
 * (0 documenté) est-elle atteignable ? Elle l'est, et un test le vérifie.
 *
 * `pending` est un quatrième compteur qui n'existe que PENDANT une passe : une
 * ligne applicable sans entrée n'est ni documentée ni absente, elle n'a pas
 * été examinée. Un readout ne se génère pas tant qu'il en reste
 * (`isReadoutReady`). Une entrée `not-applicable` posée par erreur sur une
 * ligne applicable compte aussi comme pending : le validateur la refuse, et
 * les compteurs ne doivent jamais la laisser gonfler « documenté ».
 */
export interface Coverage {
  denominator: number;
  /** Lignes mesurées ou estimées, plus ½ point par ligne communiquée sans définition. */
  documented: number;
  /**
   * Lignes absentes (toutes causes) ou contestées, plus l'autre ½ point d'une
   * ligne communiquée sans définition : le chiffre existe (moitié présence),
   * personne ne peut le reconstruire (moitié absence). C'est ce qui garde la
   * somme des compteurs égale au dénominateur — et c'est la lecture honnête
   * du cas modal en entreprise financée.
   */
  companyLacks: number;
  /** Lignes non accessibles. */
  noAccess: number;
  /** Lignes applicables pas encore examinées. Doit valoir 0 pour un readout. */
  pending: number;
}

/** Le seuil d'escalade : sous un tiers de lignes documentées, le titre bascule sur « ne peut pas conclure ». */
export const REFUSAL_FRACTION = 1 / 3;

export function computeCoverage(pass: Pass, mission: Mission): Coverage {
  const rows = applicableRows(mission.catalog, mission.header.profile.model);
  const byMetric = new Map<string, Entry>(pass.entries.map((entry) => [entry.metricId, entry]));
  const coverage: Coverage = { denominator: rows.length, documented: 0, companyLacks: 0, noAccess: 0, pending: 0 };

  for (const row of rows) {
    const entry = byMetric.get(row.id);
    switch (entry?.status) {
      case "measured":
      case "estimated":
        coverage.documented += 1;
        break;
      case "reported-without-definition":
        coverage.documented += 0.5;
        coverage.companyLacks += 0.5;
        break;
      case "absent":
      case "contested":
        coverage.companyLacks += 1;
        break;
      case "not-accessible":
        coverage.noAccess += 1;
        break;
      default:
        // No entry yet, or a hand-entered not-applicable on an applicable row.
        coverage.pending += 1;
    }
  }
  return coverage;
}

export function isReadoutReady(coverage: Coverage): boolean {
  return coverage.pending === 0 && coverage.denominator > 0;
}

/**
 * La règle d'escalade du §4.1 : si moins d'un tiers des lignes applicables
 * sont documentées, le constat principal est l'absence elle-même. C'est le
 * seul titre qui rend l'absence aussi forte qu'un mauvais score.
 */
export function shouldRefuseToConclude(coverage: Coverage): boolean {
  return coverage.denominator > 0 && coverage.documented < coverage.denominator * REFUSAL_FRACTION;
}

/** « 16 documentées sur 24 » — la seule forme dans laquelle ce chiffre s'imprime. Les demi-points s'écrivent « 16,5 ». */
export function formatFraction(count: number, denominator: number): string {
  const n = Number.isInteger(count) ? String(count) : count.toFixed(1).replace(".", ",");
  return `${n} sur ${denominator}`;
}
