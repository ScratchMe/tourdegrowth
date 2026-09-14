import { AUDIT_PROFILE_MODELS } from "./profiles";
import { LOCALES } from "@/lib/i18n/locale";
import {
  ABSENT_CAUSES,
  ACV_BANDS,
  AUDIT_SCHEMA_VERSION,
  CONTRACT_TERMS,
  CRITERION_KINDS,
  GAPS,
  HEADLINE_CAP,
  MANDATES,
  MANDATE_LEVELS,
  OBTAINED_HOW,
  PERIOD_TYPES,
  REPAIR_SCALES,
  SOURCE_KINDS,
  SYSTEM_CAUSES,
  VALUE_STATUSES,
  catalogRow,
  type Mission,
} from "./schema";

/**
 * validate.ts — le validateur d'un fichier de mission.
 *
 * Deux rôles. Le premier est celui de `isAnswersShape` dans `quiz/storage.ts` :
 * un JSON importé depuis un disque est une entrée non fiable, et un fichier
 * qu'on ne comprend pas ne doit pas planter l'outil. Le second est le seul
 * endroit où les RÈGLES du schéma sont appliquées — celles qu'un formulaire
 * peut contourner et qu'un test peut vérifier :
 *
 * - `non applicable` ne se saisit pas : une entrée `not-applicable` sur une
 *   ligne que le catalogue embarqué déclare applicable est refusée. C'est ce
 *   qui empêche le dénominateur des compteurs de devenir une opinion.
 * - une absence a toujours une cause (le défaut est posé par `normalizeEntry`,
 *   pas ici : le validateur refuse, il ne devine pas) et un coût de réparation ;
 * - une valeur mesurée ou estimée a au moins une observation avec une valeur,
 *   et une définition qui résout dans `mission.definitions` ;
 * - `contested` porte au moins deux observations ;
 * - un seuil argumenté (q5) porte sa justification ;
 * - l'action prioritaire est unique par passe et les `headline` ne dépassent
 *   pas `HEADLINE_CAP` hors priorité ;
 * - chaque constat référence des lignes du catalogue embarqué.
 *
 * Retourne des chemins lisibles plutôt qu'une exception : l'UI d'import les
 * affiche tels quels.
 */

export type ValidationResult = { ok: true; mission: Mission } | { ok: false; errors: string[] };

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string";
const isNonEmpty = (v: unknown): v is string => isStr(v) && v.trim() !== "";
const isBool = (v: unknown): v is boolean => typeof v === "boolean";
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const oneOf = <T extends string>(list: readonly T[], v: unknown): v is T => isStr(v) && (list as readonly string[]).includes(v);

export function validateMission(value: unknown): ValidationResult {
  const errors: string[] = [];
  const fail = (path: string, message: string) => errors.push(`${path}: ${message}`);

  if (!isObj(value)) return { ok: false, errors: ["mission: not an object"] };
  if (value.schemaVersion !== AUDIT_SCHEMA_VERSION) fail("schemaVersion", `expected ${AUDIT_SCHEMA_VERSION}`);
  if (!isNonEmpty(value.id)) fail("id", "required");
  if (!isNonEmpty(value.createdAt)) fail("createdAt", "required");
  if (value.purged !== undefined && value.purged !== true) fail("purged", "either absent or exactly true");
  /** A purged file has had its values removed on purpose; two rules that ask for them are relaxed, nothing else. */
  const purged = value.purged === true;

  // --- header ---------------------------------------------------------------
  const header = value.header;
  if (!isObj(header)) {
    fail("header", "required");
  } else {
    if (!isStr(header.company)) fail("header.company", "required (may be empty after a purge)");
    if (!oneOf(MANDATES, header.mandate)) fail("header.mandate", `one of ${MANDATES.join(", ")}`);
    if (!isStr(header.scope)) fail("header.scope", "required — write « tout » rather than leaving it out");
    if (!isNonEmpty(header.currency)) fail("header.currency", "required");
    if (!oneOf(LOCALES, header.deliverableLocale)) fail("header.deliverableLocale", `one of ${LOCALES.join(", ")}`);
    if (!isBool(header.showTourScore)) fail("header.showTourScore", "boolean required (q3)");
    const profile = header.profile;
    if (!isObj(profile)) {
      fail("header.profile", "required");
    } else {
      if (!oneOf(AUDIT_PROFILE_MODELS, profile.model)) fail("header.profile.model", `one of ${AUDIT_PROFILE_MODELS.join(", ")}`);
      if (!oneOf(ACV_BANDS, profile.acvBand)) fail("header.profile.acvBand", `one of ${ACV_BANDS.join(", ")}`);
      if (!oneOf(CONTRACT_TERMS, profile.contractTerm)) fail("header.profile.contractTerm", `one of ${CONTRACT_TERMS.join(", ")}`);
    }
  }

  // --- catalog (embedded, not referenced) ----------------------------------
  const catalog = value.catalog;
  const rowIds = new Set<string>();
  if (!isObj(catalog) || !isNonEmpty(catalog.version) || !Array.isArray(catalog.rows) || catalog.rows.length === 0) {
    fail("catalog", "an embedded catalog with a version and rows is required");
  } else {
    catalog.rows.forEach((row, i) => {
      if (!isObj(row) || !isNonEmpty(row.id) || !Array.isArray(row.appliesTo) || row.appliesTo.length === 0) {
        fail(`catalog.rows[${i}]`, "id and a non-empty appliesTo are required");
        return;
      }
      if (rowIds.has(row.id)) fail(`catalog.rows[${i}]`, `duplicate id ${row.id}`);
      rowIds.add(row.id);
    });
  }

  // --- definitions ----------------------------------------------------------
  const definitions = value.definitions;
  const definitionRefs = new Set<string>();
  if (!isObj(definitions)) {
    fail("definitions", "required (may be empty)");
  } else {
    for (const [ref, def] of Object.entries(definitions)) {
      if (!isObj(def) || !isNonEmpty(def.id) || !isNum(def.version) || !isNonEmpty(def.metricId)) {
        fail(`definitions.${ref}`, "id, version and metricId are required");
        continue;
      }
      if (`${def.id}@${def.version}` !== ref) fail(`definitions.${ref}`, `key must equal ${def.id}@${def.version}`);
      for (const field of ["unit", "numeratorPopulation", "denominatorPopulation", "scope"] as const) {
        if (!isNonEmpty(def[field])) fail(`definitions.${ref}.${field}`, "required");
      }
      definitionRefs.add(ref);
    }
  }

  // --- passes ---------------------------------------------------------------
  const model = isObj(header) && isObj(header.profile) && oneOf(AUDIT_PROFILE_MODELS, header.profile.model) ? header.profile.model : null;
  const embedded = isObj(catalog) && Array.isArray(catalog.rows) ? (value.catalog as Mission["catalog"]) : null;

  if (!Array.isArray(value.passes)) {
    fail("passes", "required (may be empty)");
  } else {
    const passIds = new Set<string>();
    value.passes.forEach((pass, p) => {
      const at = `passes[${p}]`;
      if (!isObj(pass)) return fail(at, "not an object");
      if (!isNonEmpty(pass.id)) fail(`${at}.id`, "required");
      else if (passIds.has(pass.id)) fail(`${at}.id`, `duplicate ${pass.id}`);
      else passIds.add(pass.id);
      if (!isNonEmpty(pass.date)) fail(`${at}.date`, "required");
      if (!isObj(pass.tourAnswers)) fail(`${at}.tourAnswers`, "required (may be empty)");
      else {
        for (const [q, a] of Object.entries(pass.tourAnswers)) {
          if (a !== 0 && a !== 1 && a !== 2) fail(`${at}.tourAnswers.${q}`, "answer index must be 0, 1 or 2");
        }
      }
      if (!isObj(pass.brief) || !isStr(pass.brief.mainFinding) || !isStr(pass.brief.priorityAction) || !isStr(pass.brief.proof)) {
        fail(`${at}.brief`, "mainFinding, priorityAction and proof are required strings (may be empty)");
      }

      // entries
      if (!Array.isArray(pass.entries)) {
        fail(`${at}.entries`, "required");
      } else {
        const seen = new Set<string>();
        pass.entries.forEach((entry, e) => {
          const ep = `${at}.entries[${e}]`;
          if (!isObj(entry)) return fail(ep, "not an object");
          if (!isNonEmpty(entry.metricId)) return fail(`${ep}.metricId`, "required");
          if (seen.has(entry.metricId)) fail(ep, `duplicate entry for ${entry.metricId}`);
          seen.add(entry.metricId);
          if (rowIds.size > 0 && !rowIds.has(entry.metricId)) fail(`${ep}.metricId`, `${entry.metricId} is not in the embedded catalog`);
          if (!oneOf(VALUE_STATUSES, entry.status)) return fail(`${ep}.status`, `one of ${VALUE_STATUSES.join(", ")}`);

          const row = embedded ? catalogRow(embedded, entry.metricId) : undefined;
          const applies = row && model ? row.appliesTo.includes(model) : null;
          if (entry.status === "not-applicable") {
            if (applies === true) fail(`${ep}.status`, "not-applicable cannot be entered by hand on a row the catalog says applies to this profile");
            if (!isNonEmpty(entry.notApplicableReason)) fail(`${ep}.notApplicableReason`, "required, taken from the catalog");
          } else if (applies === false) {
            fail(`${ep}.status`, `row ${entry.metricId} does not apply to profile ${model}; only not-applicable is allowed`);
          }

          if (entry.status === "absent") {
            if (!oneOf(ABSENT_CAUSES, entry.absentCause)) fail(`${ep}.absentCause`, `required when absent — one of ${ABSENT_CAUSES.join(", ")} (normalizeEntry sets the default)`);
            if (!isObj(entry.repairCost) || !oneOf(REPAIR_SCALES, entry.repairCost.scale)) fail(`${ep}.repairCost`, `required when absent (q10) — scale one of ${REPAIR_SCALES.join(", ")}`);
          } else if (entry.absentCause !== undefined) {
            fail(`${ep}.absentCause`, "only allowed when status is absent");
          }
          if (entry.repairCost !== undefined && (!isObj(entry.repairCost) || !oneOf(REPAIR_SCALES, entry.repairCost.scale))) {
            fail(`${ep}.repairCost.scale`, `one of ${REPAIR_SCALES.join(", ")}`);
          }
          if (entry.systemCause !== undefined && !oneOf(SYSTEM_CAUSES, entry.systemCause)) fail(`${ep}.systemCause`, `one of ${SYSTEM_CAUSES.join(", ")}`);

          // observations
          const observations = entry.observations;
          if (!Array.isArray(observations)) {
            fail(`${ep}.observations`, "required (may be empty)");
          } else {
            const obsIds = new Set<string>();
            observations.forEach((obs, o) => {
              const op = `${ep}.observations[${o}]`;
              if (!isObj(obs)) return fail(op, "not an object");
              if (!isNonEmpty(obs.id)) fail(`${op}.id`, "required");
              else if (obsIds.has(obs.id)) fail(`${op}.id`, `duplicate ${obs.id}`);
              else obsIds.add(obs.id);
              if (!isNonEmpty(obs.periodStart) || !isNonEmpty(obs.periodEnd)) fail(`${op}.period`, "periodStart and periodEnd are required");
              if (!oneOf(PERIOD_TYPES, obs.periodType)) fail(`${op}.periodType`, `one of ${PERIOD_TYPES.join(", ")}`);
              if (!oneOf(SOURCE_KINDS, obs.sourceKind)) fail(`${op}.sourceKind`, `one of ${SOURCE_KINDS.join(", ")}`);
              if (!oneOf(OBTAINED_HOW, obs.obtainedHow)) fail(`${op}.obtainedHow`, `one of ${OBTAINED_HOW.join(", ")}`);
              if (!isNonEmpty(obs.asOf)) fail(`${op}.asOf`, "required — the date the figure was pulled, distinct from periodEnd");
              if (!("value" in obs)) fail(`${op}.value`, "required (null when there is none)");
            });
            const withValue = observations.filter((obs) => isObj(obs) && obs.value !== null && obs.value !== undefined);
            if (!purged && (entry.status === "measured" || entry.status === "estimated") && withValue.length === 0) {
              fail(`${ep}.observations`, `${entry.status} requires at least one observation with a value`);
            }
            if (entry.status === "contested" && observations.length < 2) {
              fail(`${ep}.observations`, "contested keeps both figures side by side: at least two observations");
            }
          }

          if (entry.status === "measured" || entry.status === "estimated" || entry.status === "contested") {
            if (!isNonEmpty(entry.definitionRef)) fail(`${ep}.definitionRef`, `required when ${entry.status}`);
            else if (!definitionRefs.has(entry.definitionRef)) fail(`${ep}.definitionRef`, `${entry.definitionRef} is not registered in mission.definitions`);
          }

          // criterion
          const criterion = entry.criterion;
          if (criterion !== undefined) {
            if (!isObj(criterion) || !oneOf(CRITERION_KINDS, criterion.kind)) fail(`${ep}.criterion.kind`, `one of ${CRITERION_KINDS.join(", ")}`);
            else if (!purged && criterion.kind === "argued-threshold" && !isNonEmpty(criterion.justification)) {
              fail(`${ep}.criterion.justification`, "an argued threshold carries its argument (q5)");
            }
          }

          if (entry.tracking !== undefined) {
            if (!isObj(entry.tracking)) fail(`${ep}.tracking`, "not an object");
            else if (entry.tracking.mandateLevel !== undefined && !oneOf(MANDATE_LEVELS, entry.tracking.mandateLevel)) {
              fail(`${ep}.tracking.mandateLevel`, `one of ${MANDATE_LEVELS.join(", ")}`);
            }
          }
        });
      }

      // findings
      if (!Array.isArray(pass.findings)) {
        fail(`${at}.findings`, "required (may be empty)");
      } else {
        let priorities = 0;
        let headlines = 0;
        const findingIds = new Set<string>();
        pass.findings.forEach((finding, f) => {
          const fp = `${at}.findings[${f}]`;
          if (!isObj(finding)) return fail(fp, "not an object");
          if (!isNonEmpty(finding.id)) fail(`${fp}.id`, "required");
          else if (findingIds.has(finding.id)) fail(`${fp}.id`, `duplicate ${finding.id}`);
          else findingIds.add(finding.id);
          if (!isStr(finding.title)) fail(`${fp}.title`, "required");
          if (!oneOf(GAPS, finding.gap)) fail(`${fp}.gap`, `one of ${GAPS.join(", ")}`);
          if (!oneOf(SYSTEM_CAUSES, finding.cause)) fail(`${fp}.cause`, `one of ${SYSTEM_CAUSES.join(", ")} — a closed list, never free text`);
          for (const field of ["criteria", "condition", "consequence", "correctiveAction"] as const) {
            if (!isStr(finding[field])) fail(`${fp}.${field}`, "required string");
          }
          if (!isObj(finding.ledger)) fail(`${fp}.ledger`, "required");
          else {
            for (const field of ["problem", "evidence", "hypothesis", "decision", "expected"] as const) {
              if (!isStr(finding.ledger[field])) fail(`${fp}.ledger.${field}`, "required string");
            }
          }
          if (!Array.isArray(finding.refs) || finding.refs.length === 0) fail(`${fp}.refs`, "a finding references at least one value");
          else {
            finding.refs.forEach((ref, r) => {
              if (!isObj(ref) || !isNonEmpty(ref.metricId)) fail(`${fp}.refs[${r}]`, "metricId required");
              else if (rowIds.size > 0 && !rowIds.has(ref.metricId)) fail(`${fp}.refs[${r}].metricId`, `${ref.metricId} is not in the embedded catalog`);
            });
          }
          if (!isBool(finding.headline) || !isBool(finding.priority)) fail(fp, "headline and priority must be booleans");
          if (finding.priority === true) priorities += 1;
          else if (finding.headline === true) headlines += 1;
        });
        if (priorities > 1) fail(`${at}.findings`, `${priorities} priority findings; the priority action is exclusive`);
        if (headlines > HEADLINE_CAP) fail(`${at}.findings`, `${headlines} headline findings; the cap is ${HEADLINE_CAP}`);
      }
    });
  }

  return errors.length === 0 ? { ok: true, mission: value as unknown as Mission } : { ok: false, errors };
}
