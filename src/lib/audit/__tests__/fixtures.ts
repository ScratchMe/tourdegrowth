import type { AuditProfileModel } from "@/lib/audit/profiles";
import { snapshotCatalog } from "../server";
import {
  applicableRows,
  definitionRef,
  newMission,
  newPass,
  registerDefinition,
  type Entry,
  type Finding,
  type MetricDefinition,
  type Mission,
  type MissionHeader,
  type Observation,
  type Pass,
  type ValueStatus,
} from "../schema";

/**
 * Shared fixtures for the audit tests. One realistic b2b-selfserve mission
 * (24 applicable rows — the "16 sur 24" of the design notes is this profile),
 * built through the same constructors the app will use, never by hand.
 */

export function header(overrides: Partial<MissionHeader> = {}): MissionHeader {
  return {
    company: "Acme Analytics",
    mandate: "no-mandate",
    profile: { model: "b2b-selfserve", acvBand: "5k-25k", contractTerm: "annual" },
    scope: "tout",
    currency: "EUR",
    deliverableLocale: "fr",
    showTourScore: false,
    ...overrides,
  };
}

export function definition(metricId: string, id = metricId, version = 1): MetricDefinition {
  return {
    id,
    version,
    metricId,
    unit: "euro",
    numeratorPopulation: "revenu récurrent normalisé du mois clos",
    denominatorPopulation: "sans objet (valeur absolue)",
    scope: "tout",
  };
}

export function observation(value: Observation["value"], overrides: Partial<Observation> = {}): Observation {
  return {
    id: overrides.id ?? `obs-${Math.abs(hash(JSON.stringify([value, overrides.periodEnd ?? "2026-08-31"])))}`,
    periodStart: "2026-08-01",
    periodEnd: "2026-08-31",
    periodType: "month",
    value,
    sourceSystem: "Stripe",
    sourceKind: "raw-extract-self",
    obtainedHow: "self-service",
    asOf: "2026-09-05",
    ...overrides,
  };
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

export function entry(metricId: string, status: ValueStatus, overrides: Partial<Entry> = {}): Entry {
  const base: Entry = { metricId, status, observations: [] };
  if (status === "absent") {
    base.absentCause = "not-instrumented";
    base.repairCost = { scale: "quarter", comment: "l'événement n'existe pas dans le schéma analytics" };
  }
  if (status === "measured" || status === "estimated") {
    base.definitionRef = definitionRef(metricId, 1);
    base.observations = [observation(42)];
  }
  if (status === "contested") {
    base.definitionRef = definitionRef(metricId, 1);
    base.observations = [
      observation(1_200_000, { id: "a", sourceSystem: "Stripe" }),
      observation(1_050_000, { id: "b", sourceSystem: "tableur finance", sourceKind: "homemade-spreadsheet", contradicts: "a" }),
    ];
  }
  if (status === "not-applicable") {
    base.notApplicableReason = "Hors profil";
  }
  return { ...base, ...overrides };
}

export function finding(id: string, overrides: Partial<Finding> = {}): Finding {
  return {
    id,
    title: `Constat ${id}`,
    refs: [{ metricId: "m01" }],
    gap: "evidence",
    criteria: "GRR sous 85 % rend la moitié de chaque euro d'acquisition perdue d'avance (repère praticien).",
    condition: "GRR à 81 % sur la cohorte d'août 2025, facturation, arrêté au 5 septembre.",
    cause: "definition-never-settled",
    consequence: "≈ 240 k€ d'ARR exposés sur 12 mois (base : MRR × churn revenu constaté).",
    correctiveAction: "Trancher la base du MRR en séance et publier la définition.",
    ledger: {
      problem: "Deux MRR coexistent.",
      evidence: "Stripe et le tableur finance divergent de 12 %.",
      hypothesis: "La base (facturé vs reconnu) n'a jamais été tranchée.",
      decision: "Retenir le MRR normalisé.",
      expected: "Un seul chiffre au prochain comité.",
    },
    headline: false,
    priority: false,
    ...overrides,
  };
}

/** A mission with one definition registered for every core row that a test may mark measured. */
export function mission(model: AuditProfileModel = "b2b-selfserve", overrides: Partial<MissionHeader> = {}): Mission {
  let m = newMission({
    id: "mission-1",
    createdAt: "2026-09-13T10:00:00.000Z",
    header: header({ profile: { model, acvBand: "5k-25k", contractTerm: "annual" }, ...overrides }),
    catalog: snapshotCatalog(),
  });
  for (const row of m.catalog.rows) m = registerDefinition(m, definition(row.id));
  return m;
}

/** A pass seeded by `newPass`, plus the given entries. */
export function pass(m: Mission, entries: Entry[] = [], id = "pass-1", date = "2026-09-13"): Pass {
  const p = newPass(m, { id, date });
  return { ...p, entries: [...p.entries, ...entries] };
}

/** Fill every applicable row that has no entry yet with the given status — the "end of the pass" helper. */
export function fillRemaining(m: Mission, p: Pass, status: ValueStatus): Pass {
  const have = new Set(p.entries.map((e) => e.metricId));
  const extra = applicableRows(m.catalog, m.header.profile.model)
    .filter((row) => !have.has(row.id))
    .map((row) => entry(row.id, status));
  return { ...p, entries: [...p.entries, ...extra] };
}

export function withPasses(m: Mission, ...passes: Pass[]): Mission {
  return { ...m, passes };
}
