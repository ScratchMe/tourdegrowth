import type { AuditCatalogRow } from "@/content/audit-catalog";
import type { Locale } from "@/lib/i18n/locale";
import type { Answers } from "@/lib/scoring/compute";
import type { AuditProfileModel } from "./profiles";

/**
 * schema.ts — le modèle de données de l'instrument d'audit growth (AUDIT.md).
 *
 * Tout ce module est pur et tourne dans le navigateur : une mission est un
 * fichier JSON sur l'appareil d'Antoine, jamais un document Firestore
 * (contrainte juridique : les chiffres d'un employeur ne touchent pas la base
 * du side project — `content/legal.ts` promet « aucun nom d'entreprise »).
 * `src/__tests__/audit-boundary.test.ts` empêche `lib/audit/**` d'importer
 * Firebase, Gemini ou l'analytics.
 *
 * Les cinq décisions irrattrapables une fois le schéma figé, toutes prises ici :
 *
 * 1. Une valeur est une SÉRIE (`Entry.observations[]`), jamais un scalaire —
 *    un NRR de 105 % stable et un NRR de 105 % qui descend de 120 % sont deux
 *    entreprises. Et une mission est une série de PASSES : « la couverture est
 *    passée de 16/24 à 21/24 » est la seule phrase qui prouve que l'instrument
 *    a servi (Antoine, q8 : « une photo appelée à devenir une série »).
 * 2. Un CONSTAT (`Finding`) est un objet distinct de la métrique, qui
 *    référence N valeurs : les constats qui valent quelque chose lient deux
 *    ou trois lignes (CAC qui monte + activation qui baisse).
 * 3. La PROSE est dans le JSON (`Finding`, `Pass.brief`) : sans ça, le
 *    readout est édité à la main dès la première mission et la régénération,
 *    le diff entre passes et la purge tombent tous les trois.
 * 4. Le CATALOGUE est versionné et EMBARQUÉ dans chaque mission, pas
 *    référencé : si la grille change entre deux missions, chacune reste
 *    lisible sur le catalogue qui l'a produite.
 * 5. Chaque absence porte un COÛT DE RÉPARATION sur une échelle fermée avec
 *    commentaire (q10) : c'est ce qui ordonne le readout — « nommer un
 *    propriétaire = une réunion », « instrumenter l'événement = un trimestre ».
 *
 * Les identifiants sont en anglais comme partout dans `src/` ; le contenu et
 * les libellés sont en français (q9 : interface en français, langue du
 * livrable en champ de mission).
 */

export const AUDIT_SCHEMA_VERSION = 1 as const;

/** Le plafond de lignes « headline » hors action prioritaire (q7 — une constante, jamais un réglage). */
export const HEADLINE_CAP = 8;
/** Budget de mots du bloc de tête du build lecture (§4.1 du readout). */
export const BRIEF_WORD_BUDGET = 400;

// ---------------------------------------------------------------------------
// Vocabulaires fermés. Chaque `as const` est aussi la liste que le validateur
// et l'UI de saisie lisent — une valeur qui n'est pas ici n'existe pas.
// ---------------------------------------------------------------------------

/** q1 : les deux modes existent, `no-mandate` est le défaut (« plus de latitude »). */
export const MANDATES = ["mandated", "no-mandate"] as const;
export type Mandate = (typeof MANDATES)[number];
export const DEFAULT_MANDATE: Mandate = "no-mandate";

export const VALUE_STATUSES = [
  "measured",
  "estimated",
  "reported-without-definition",
  "contested",
  "absent",
  "not-accessible",
  "not-applicable",
] as const;
export type ValueStatus = (typeof VALUE_STATUSES)[number];

/** Uniquement quand `status === "absent"`. `type-not-established` est le défaut : on ne devine jamais un type d'absence qu'on n'a pas vérifié. */
export const ABSENT_CAUSES = ["not-instrumented", "not-computed", "not-reliable", "type-not-established"] as const;
export type AbsentCause = (typeof ABSENT_CAUSES)[number];
export const DEFAULT_ABSENT_CAUSE: AbsentCause = "type-not-established";

/** Cause système d'une absence, liste fermée — aucun champ libre, pour qu'un livrable ne nomme jamais une personne. */
export const SYSTEM_CAUSES = [
  "no-owner",
  "tool-does-not-emit",
  "definition-never-settled",
  "data-exists-nobody-queries",
  "collection-stopped",
] as const;
export type SystemCause = (typeof SYSTEM_CAUSES)[number];

/** q10 : échelle fermée du coût de réparation, avec de quoi commenter. */
export const REPAIR_SCALES = ["meeting", "afternoon", "sprint", "quarter"] as const;
export type RepairScale = (typeof REPAIR_SCALES)[number];
export interface RepairCost {
  scale: RepairScale;
  comment?: string;
}

/** ORDONNÉ du plus fiable au moins fiable ; l'index est le rang. */
export const SOURCE_KINDS = [
  "raw-extract-self",
  "export-by-other",
  "aggregated-report",
  "homemade-spreadsheet",
  "stated-orally",
  "interested-party",
] as const;
export type SourceKind = (typeof SOURCE_KINDS)[number];

export const OBTAINED_HOW = ["self-service", "export-received", "oral", "dashboard-capture"] as const;
export type ObtainedHow = (typeof OBTAINED_HOW)[number];

/** Distinct de la difficulté technique : le CAC chargé est trivial à calculer et politiquement bloqué. */
export const MANDATE_LEVELS = ["none", "peer", "director", "exec"] as const;
export type MandateLevel = (typeof MANDATE_LEVELS)[number];

export const CRITERION_KINDS = ["public-benchmark", "argued-threshold", "internal-trend"] as const;
export type CriterionKind = (typeof CRITERION_KINDS)[number];

/** Les quatre gaps (document de l'expert, §6), adoptés comme cadre de restitution. */
export const GAPS = ["capability", "evidence", "decision", "learning"] as const;
export type Gap = (typeof GAPS)[number];

export const PERIOD_TYPES = ["month", "quarter", "year", "rolling-12m", "point"] as const;
export type PeriodType = (typeof PERIOD_TYPES)[number];

export const ACV_BANDS = ["lt-5k", "5k-25k", "25k-100k", "100k-250k", "gt-250k", "not-applicable"] as const;
export type AcvBand = (typeof ACV_BANDS)[number];

export const CONTRACT_TERMS = ["monthly", "annual", "multi-year", "transactional"] as const;
export type ContractTerm = (typeof CONTRACT_TERMS)[number];

export const CONFIDENCE_LEVELS = ["high", "medium", "low"] as const;
export type Confidence = (typeof CONFIDENCE_LEVELS)[number];

// ---------------------------------------------------------------------------
// La mission
// ---------------------------------------------------------------------------

export interface MissionProfile {
  model: AuditProfileModel;
  acvBand: AcvBand;
  contractTerm: ContractTerm;
}

export interface MissionHeader {
  /** Purgé par `purgeMission` — la seule chose qui identifie l'entreprise. */
  company: string;
  mandate: Mandate;
  profile: MissionProfile;
  /** Entité, ligne de produit, région. Écrire « tout » plutôt que laisser vide. */
  scope: string;
  currency: string;
  /** q9 : la langue du livrable est un champ de mission ; l'outil, lui, est en français. */
  deliverableLocale: Locale;
  /** q3 : montrer ou non le score du Tour dans le livrable direction est un arbitrage par mission. */
  showTourScore: boolean;
}

/** Une copie du catalogue au moment de la création — jamais une référence. */
export interface EmbeddedCatalog {
  version: string;
  rows: AuditCatalogRow[];
}

export interface Mission {
  schemaVersion: typeof AUDIT_SCHEMA_VERSION;
  id: string;
  createdAt: string;
  header: MissionHeader;
  catalog: EmbeddedCatalog;
  /** Enregistrements de définition IMMUABLES, indexés par `definitionId@version`. */
  definitions: Record<string, MetricDefinition>;
  passes: Pass[];
  /**
   * Posé par `purgeMission` : les absolus ont été retirés. Le validateur
   * relâche alors exactement deux règles (une valeur mesurée sans observation
   * valuée, un seuil argumenté sans son argument) — un fichier purgé se
   * recharge pour montrer sa structure, jamais pour produire un readout.
   */
  purged?: true;
}

/** Une passe = un passage de l'audit, daté. La première est la photo ; les suivantes font la série. */
export interface Pass {
  id: string;
  /** Date d'arrêté de la passe (ISO date). */
  date: string;
  label?: string;
  /**
   * Les 15 réponses du Tour telles que l'AUDITEUR les remplit au fil des
   * entretiens (ligne m19) — jamais une auto-évaluation envoyée à l'équipe.
   * Partiel tant que les entretiens ne sont pas finis ; le score n'existe
   * qu'une fois les 15 présentes (`tourScore`).
   */
  tourAnswers: Partial<Answers>;
  entries: Entry[];
  findings: Finding[];
  /** Le bloc de tête du build lecture : constat principal, UNE action, la preuve. Jamais la méthode. */
  brief: Brief;
}

export interface Brief {
  mainFinding: string;
  priorityAction: string;
  proof: string;
}

// ---------------------------------------------------------------------------
// Les définitions — immuables, adressées par version
// ---------------------------------------------------------------------------

export interface MetricDefinition {
  id: string;
  version: number;
  metricId: string;
  /** Obligatoire, jamais déduite du nom de la métrique. */
  unit: string;
  numeratorPopulation: string;
  /** Qui est compté au dénominateur, et à quel instant — l'axe qui a produit le bug K-factor de ce repo (R2-01). */
  denominatorPopulation: string;
  grossOrNet?: string;
  cohortOrSnapshot?: "cohort" | "snapshot";
  /** Pour toute rétention : exactement au jour N / au jour N ou après / par plage. */
  countingRule?: string;
  /** Un réglage par défaut de l'outil que personne n'a choisi. */
  toolDefault?: boolean;
  attributionModel?: string;
  attributionWindow?: string;
  costsIncluded?: string[];
  costsExcluded?: string[];
  /** Plafond de durée de vie retenu, pour toute valeur projetée. */
  horizon?: string;
  /** Écrire « tout » plutôt que laisser vide. */
  scope: string;
}

export function definitionRef(id: string, version: number): string {
  return `${id}@${version}`;
}

export function parseDefinitionRef(ref: string): { id: string; version: number } | null {
  const match = /^(.+)@(\d+)$/.exec(ref);
  if (!match) return null;
  return { id: match[1]!, version: Number(match[2]) };
}

/**
 * Enregistre une définition. Une référence déjà présente avec un contenu
 * différent est refusée : toucher un axe frappe une nouvelle version, jamais
 * une édition en place. Ré-enregistrer le même contenu est un no-op.
 */
export function registerDefinition(mission: Mission, definition: MetricDefinition): Mission {
  const ref = definitionRef(definition.id, definition.version);
  const existing = mission.definitions[ref];
  if (existing) {
    if (JSON.stringify(existing) !== JSON.stringify(definition)) {
      throw new Error(`Definition ${ref} already exists with different content; bump the version instead`);
    }
    return mission;
  }
  return { ...mission, definitions: { ...mission.definitions, [ref]: definition } };
}

// ---------------------------------------------------------------------------
// Les valeurs
// ---------------------------------------------------------------------------

export interface Matrix {
  columns: string[];
  rows: { label: string; n: number; cells: (number | null)[] }[];
}

export type ObservationValue = number | string | boolean | Matrix | null;

export interface Observation {
  id: string;
  periodStart: string;
  periodEnd: string;
  periodType: PeriodType;
  value: ObservationValue;
  /** Le système nommé : Stripe, Salesforce, tableur de la finance. */
  sourceSystem?: string;
  sourceKind: SourceKind;
  obtainedHow: ObtainedHow;
  /** Un RÔLE, jamais un nom. */
  providedByRole?: string;
  /** La date à laquelle le chiffre a été tiré, DISTINCTE de `periodEnd`. */
  asOf: string;
  /** Jours entre la clôture de la période et le moment où le chiffre ne bouge plus. */
  freshnessLagDays?: number;
  /** Une autre observation du même créneau, d'une autre source, qui ne dit pas la même chose. Deux MRR qui divergent EST le constat. */
  contradicts?: string;
}

export interface Criterion {
  kind: CriterionKind;
  value?: number;
  source?: string;
  population?: string;
  n?: number;
  year?: number;
  definition?: string;
  /** q5 : un seuil de praticien est admis s'il est argumenté ; le validateur l'exige pour `argued-threshold`. */
  justification?: string;
}

export interface Exposure {
  /** Uniquement des chiffres fournis par l'entreprise (budget, volume, ticket moyen), jamais un taux estimé. */
  inputs: { label: string; value: number; source: string }[];
  calculation: string;
  range: string;
}

/** Métadonnées de pilotage — servent à savoir quoi relancer, ne s'impriment JAMAIS dans un constat. */
export interface Tracking {
  requestedOn?: string;
  chasedOn?: string;
  receivedOn?: string;
  mandateLevel?: MandateLevel;
  /** L'interlocuteur à qui la ligne appartient, pour sa coupe personnelle. */
  routedTo?: string;
}

export interface Entry {
  metricId: string;
  /** Obligatoire, jamais nullable, jamais défauté. */
  status: ValueStatus;
  absentCause?: AbsentCause;
  /** Rempli depuis l'`appliesTo` du catalogue, jamais saisi : c'est ce qui empêche le dénominateur de devenir une opinion. */
  notApplicableReason?: string;
  /** `definitionId@version`. Requis dès qu'il y a une valeur. */
  definitionRef?: string;
  observations: Observation[];
  /** L'écart entre la convention canonique (le glossaire, q4) et celle que l'entreprise applique. Souvent un constat en soi. */
  canonicalDeviation?: string;
  criterion?: Criterion;
  /** Vide = la ligne n'entre pas dans la grille des constats. */
  decisionAtStake?: string;
  exposure?: Exposure;
  ownerRole?: string;
  lastReviewedInADecision?: string;
  systemCause?: SystemCause;
  /** q10 — requis quand `status === "absent"`. */
  repairCost?: RepairCost;
  tracking?: Tracking;
}

// ---------------------------------------------------------------------------
// Les constats — un objet distinct, qui référence N valeurs
// ---------------------------------------------------------------------------

/** Le « Decision Ledger » de l'expert (§14), rangé sur le constat qu'il documente. */
export interface Ledger {
  problem: string;
  evidence: string;
  hypothesis: string;
  decision: string;
  expected: string;
  actual?: string;
  learning?: string;
  next?: string;
}

export interface Finding {
  id: string;
  title: string;
  /** Les valeurs sur lesquelles le constat repose — au moins une, souvent deux ou trois. */
  refs: { metricId: string; passId?: string }[];
  gap: Gap;
  /** Format 5C : Criteria, Condition, Cause (liste fermée), Consequence, Corrective action. */
  criteria: string;
  condition: string;
  cause: SystemCause;
  consequence: string;
  correctiveAction: string;
  ledger: Ledger;
  /** Marque la ligne pour le livrable direction. Plafonné à `HEADLINE_CAP`, hors priorité. */
  headline: boolean;
  /** L'action prioritaire — exclusive par construction : en marquer une seconde démarque la première (`setPriority`). */
  priority: boolean;
  /** Remplis EN ENTRETIEN, pas à la rédaction. Vides, ils s'impriment tels quels. */
  agreedAction?: { action: string; ownerRole?: string; date?: string };
}

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

export function applicableRows(catalog: EmbeddedCatalog, model: AuditProfileModel): AuditCatalogRow[] {
  return catalog.rows.filter((row) => row.appliesTo.includes(model));
}

export function catalogRow(catalog: EmbeddedCatalog, metricId: string): AuditCatalogRow | undefined {
  return catalog.rows.find((row) => row.id === metricId);
}

/** La raison rendue pour une ligne hors profil — construite depuis le catalogue, jamais saisie. */
export function notApplicableReasonFor(row: AuditCatalogRow, model: AuditProfileModel): string {
  return `Hors profil « ${model} » : cette ligne s'applique à ${row.appliesTo.join(", ")}.`;
}

/**
 * Une mission neuve, avec un catalogue embarqué — une COPIE, jamais une
 * référence : deux missions se comparent sur le catalogue qui les a
 * produites, pas sur celui du jour.
 *
 * `catalog` est un paramètre et non une lecture directe de
 * `AUDIT_CATALOG` : ce module doit rester sans dépendance au contenu pour
 * que l'îlot de `/admin/audit` ne l'embarque pas (AUDIT-PLAN.md §3.4/1.1).
 * Le Server Component appelle `snapshotCatalog()` de `./server` et passe le
 * résultat en props. `id`/`createdAt` sont injectés pour la même raison de
 * pureté.
 */
export function newMission(input: {
  id: string;
  createdAt: string;
  header: MissionHeader;
  catalog: EmbeddedCatalog;
}): Mission {
  return {
    schemaVersion: AUDIT_SCHEMA_VERSION,
    id: input.id,
    createdAt: input.createdAt,
    header: input.header,
    catalog: input.catalog,
    definitions: {},
    passes: [],
  };
}

/**
 * Une passe neuve. Seules les lignes hors profil reçoivent une entrée
 * (`not-applicable`, raison tirée du catalogue). Les lignes applicables n'en
 * ont AUCUNE tant que l'auditeur ne s'est pas prononcé : un statut n'est
 * jamais défauté, et une ligne pas encore examinée compte comme « en
 * attente » dans les compteurs, pas comme absente ni comme documentée.
 */
export function newPass(mission: Mission, input: { id: string; date: string; label?: string }): Pass {
  const model = mission.header.profile.model;
  const entries: Entry[] = mission.catalog.rows
    .filter((row) => !row.appliesTo.includes(model))
    .map((row) => ({
      metricId: row.id,
      status: "not-applicable",
      notApplicableReason: notApplicableReasonFor(row, model),
      observations: [],
    }));
  return {
    id: input.id,
    date: input.date,
    ...(input.label ? { label: input.label } : {}),
    tourAnswers: {},
    entries,
    findings: [],
    brief: { mainFinding: "", priorityAction: "", proof: "" },
  };
}

/**
 * Normalise une entrée avant enregistrement : une absence sans cause reçoit
 * `type-not-established` (on ne devine pas), et une cause d'absence sur un
 * autre statut est retirée. Rien d'autre n'est deviné.
 */
export function normalizeEntry(entry: Entry): Entry {
  if (entry.status === "absent") {
    return entry.absentCause ? entry : { ...entry, absentCause: DEFAULT_ABSENT_CAUSE };
  }
  if (entry.absentCause) {
    const { absentCause: _dropped, ...rest } = entry;
    return rest;
  }
  return entry;
}

/** L'observation la plus récente (par fin de période, puis par date de tirage). */
export function latestObservation(entry: Entry): Observation | undefined {
  return [...entry.observations].sort((a, b) =>
    a.periodEnd === b.periodEnd ? b.asOf.localeCompare(a.asOf) : b.periodEnd.localeCompare(a.periodEnd),
  )[0];
}

/**
 * La confiance est DÉRIVÉE, jamais saisie — une confiance notée au ressenti
 * est un champ que personne ne peut défendre en réunion. Elle lit la source
 * et la complétude de la définition : un extrait brut avec une définition
 * complète est `high` ; un chiffre entendu en réunion est `low` quoi qu'il
 * arrive ; entre les deux, `medium`.
 *
 * Le paramètre est volontairement RÉDUIT aux quatre champs lus : l'écran de
 * saisie veut la confiance d'une observation pendant que la définition est
 * encore un brouillon, et un brouillon n'a pas de version. Exiger une
 * `MetricDefinition` entière obligerait à en fabriquer une avec un numéro de
 * version faux, qui finirait par fuir quelque part.
 */
export function confidenceOf(
  observation: Observation,
  definition: Pick<MetricDefinition, "unit" | "numeratorPopulation" | "denominatorPopulation" | "scope"> | undefined,
): Confidence {
  const rank = SOURCE_KINDS.indexOf(observation.sourceKind);
  const complete =
    definition !== undefined &&
    definition.unit.trim() !== "" &&
    definition.numeratorPopulation.trim() !== "" &&
    definition.denominatorPopulation.trim() !== "" &&
    definition.scope.trim() !== "";
  if (rank >= SOURCE_KINDS.indexOf("stated-orally") || observation.obtainedHow === "oral") return "low";
  if (rank <= SOURCE_KINDS.indexOf("export-by-other") && complete) return "high";
  return "medium";
}
