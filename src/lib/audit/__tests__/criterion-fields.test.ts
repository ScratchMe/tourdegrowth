import { describe, expect, it } from "vitest";
import { CRITERION_FIELD_GROUPS, criterionFieldGroups, missingCriterionFields, weakProvenance } from "../criterion-fields";
import { CRITERION_KINDS } from "../schema";
import { validateMission } from "../validate";
import { entry, fillRemaining, mission, observation, pass, withPasses } from "./fixtures";

/**
 * La seule règle que le validateur porte sur un repère est l'argument d'un
 * seuil argumenté (q5). Ce test l'exerce plutôt que de la redire, et vérifie
 * que le reste du module reste bien du CONSEIL — un repère public sans
 * provenance est signalé, jamais refusé.
 */
describe("criterionFieldGroups", () => {
  it("couvre les trois sortes, et ne rend que des groupes connus", () => {
    for (const kind of CRITERION_KINDS) {
      const groups = criterionFieldGroups(kind);
      expect(groups.length, kind).toBeGreaterThan(0);
      for (const group of groups) expect(CRITERION_FIELD_GROUPS).toContain(group);
    }
  });

  it("l'argument n'est demandé que par le seuil argumenté", () => {
    expect(criterionFieldGroups("argued-threshold")).toContain("argument");
    expect(criterionFieldGroups("public-benchmark")).not.toContain("argument");
    expect(criterionFieldGroups("internal-trend")).not.toContain("argument");
  });

  it("la provenance n'est demandée que par le repère public — se comparer à soi-même n'a pas de source externe", () => {
    expect(criterionFieldGroups("public-benchmark")).toContain("provenance");
    expect(criterionFieldGroups("internal-trend")).not.toContain("provenance");
  });
});

describe("missingCriterionFields — exactement ce que le validateur refuse", () => {
  const withCriterion = (criterion: Parameters<typeof missingCriterionFields>[0]) => {
    const m = mission();
    const measured = entry("m01", "measured", { observations: [observation(42)], criterion });
    return validateMission(withPasses(m, fillRemaining(m, pass(m, [measured]), "absent")));
  };

  it("un seuil argumenté sans argument est refusé, et le module le dit", () => {
    const result = withCriterion({ kind: "argued-threshold", value: 85 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.includes("criterion.justification"))).toBe(true);
    expect(missingCriterionFields({ kind: "argued-threshold", value: 85 })).toEqual(["justification"]);
  });

  it("avec son argument, il passe", () => {
    const criterion = { kind: "argued-threshold" as const, value: 85, justification: "Sous 85 %, la moitié de chaque euro d'acquisition est perdue d'avance." };
    expect(withCriterion(criterion).ok).toBe(true);
    expect(missingCriterionFields(criterion)).toEqual([]);
  });

  it("un argument fait d'espaces ne compte pas", () => {
    expect(missingCriterionFields({ kind: "argued-threshold", value: 85, justification: "   " })).toEqual(["justification"]);
  });

  /**
   * La distinction que ce module existe pour tenir : la provenance est du
   * conseil. Un repère public sans source n'est PAS refusé par le
   * validateur, donc l'écran ne doit pas prétendre le contraire.
   */
  it("un repère public sans provenance est signalé mais jamais refusé", () => {
    const criterion = { kind: "public-benchmark" as const, value: 3 };
    expect(withCriterion(criterion).ok).toBe(true);
    expect(missingCriterionFields(criterion)).toEqual([]);
    expect(weakProvenance(criterion)).toEqual(["source", "population", "year"]);
  });

  it("la provenance complète ne signale rien, et une tendance interne n'en a pas à signaler", () => {
    expect(weakProvenance({ kind: "public-benchmark", value: 3, source: "OpenView 2026", population: "SaaS B2B 1-10 M$ ARR", year: 2026 })).toEqual([]);
    expect(weakProvenance({ kind: "internal-trend", value: 3 })).toEqual([]);
  });
});
