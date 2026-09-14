import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/content/copy-library";
import type { Answers } from "@/lib/scoring/compute";
import { TOUR_DEFINITION_ID, TOUR_METRIC_ID, buildTourEntry, tourDefinition } from "../tour-entry";
import { definitionRef, registerDefinition } from "../schema";
import { validateMission } from "../validate";
import { entry, fillRemaining, mission, pass, withPasses } from "./fixtures";

const TODAY = "2026-09-14";
const allAnswered = (index: 0 | 1 | 2): Answers => Object.fromEntries(QUESTIONS.map((q) => [q.id, index])) as Answers;

describe("buildTourEntry — rien tant que le Tour n'est pas complet", () => {
  it("rend null sur un Tour partiel, quelle que soit la part remplie", () => {
    expect(buildTourEntry({}, QUESTIONS, "tout", TODAY)).toBeNull();
    const fourteen = { ...allAnswered(0) } as Partial<Answers>;
    delete fourteen[QUESTIONS.at(-1)!.id];
    expect(Object.keys(fourteen)).toHaveLength(14);
    expect(buildTourEntry(fourteen, QUESTIONS, "tout", TODAY)).toBeNull();
  });

  it("rend la ligne et son score aux 15 réponses", () => {
    const built = buildTourEntry(allAnswered(0), QUESTIONS, "tout", TODAY);
    expect(built?.total).toBe(100);
    expect(buildTourEntry(allAnswered(2), QUESTIONS, "tout", TODAY)?.total).toBe(0);
  });
});

/**
 * La raison d'être de ce module : `m19` est produite par l'audit, donc rien
 * ne la saisit — et le validateur exige d'une ligne mesurée une définition
 * ENREGISTRÉE et une observation valuée. La produire sans l'une des deux
 * ferait refuser précisément la ligne que l'outil produit le mieux.
 */
describe("la ligne produite passe le validateur", () => {
  const withTour = (answers: Partial<Answers>) => {
    const built = buildTourEntry(answers, QUESTIONS, "tout", TODAY);
    if (!built) return null;
    const m = registerDefinition({ ...mission(), definitions: {} }, built.definition);
    return validateMission(withPasses(m, fillRemaining(m, pass(m, [built.entry]), "absent")));
  };

  it("mesurée, avec sa définition et son observation valuée", () => {
    const result = withTour(allAnswered(1));
    expect(result?.ok ? [] : result?.errors).toEqual([]);
  });

  it("un score de zéro reste une valeur — pas une absence", () => {
    const built = buildTourEntry(allAnswered(2), QUESTIONS, "tout", TODAY)!;
    expect(built.entry.observations[0]!.value).toBe(0);
    expect(withTour(allAnswered(2))?.ok).toBe(true);
  });

  it("sans sa définition enregistrée, le validateur la refuse — c'est pourquoi le module la fournit", () => {
    const built = buildTourEntry(allAnswered(0), QUESTIONS, "tout", TODAY)!;
    const m = { ...mission(), definitions: {} };
    const result = validateMission(withPasses(m, fillRemaining(m, pass(m, [built.entry]), "absent")));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.includes("is not registered"))).toBe(true);
  });

  it("la référence pointe vers la définition rendue", () => {
    const built = buildTourEntry(allAnswered(0), QUESTIONS, "tout", TODAY)!;
    expect(built.entry.definitionRef).toBe(definitionRef(TOUR_DEFINITION_ID, 1));
    expect(built.definition.id).toBe(TOUR_DEFINITION_ID);
    expect(built.definition.metricId).toBe(TOUR_METRIC_ID);
  });

  it("le périmètre de la définition est celui de la mission, jamais une valeur inventée", () => {
    expect(tourDefinition("France uniquement").scope).toBe("France uniquement");
  });
});

describe("ce qui est conservé et ce qui est remplacé", () => {
  it("re-remplir le Tour remplace l'observation plutôt que d'en empiler une seconde", () => {
    const first = buildTourEntry(allAnswered(0), QUESTIONS, "tout", TODAY)!;
    const second = buildTourEntry(allAnswered(1), QUESTIONS, "tout", "2026-09-20", first.entry)!;
    expect(second.entry.observations).toHaveLength(1);
    expect(second.entry.observations[0]!.value).toBe(35);
    expect(second.entry.observations[0]!.id).toBe(first.entry.observations[0]!.id);
  });

  it("le travail de l'auditeur sur cette ligne survit : seule la valeur est produite", () => {
    const existing = entry(TOUR_METRIC_ID, "absent", {
      decisionAtStake: "Par quoi commencer le trimestre.",
      tracking: { routedTo: "Growth" },
    });
    const built = buildTourEntry(allAnswered(0), QUESTIONS, "tout", TODAY, existing)!;
    expect(built.entry.decisionAtStake).toBe("Par quoi commencer le trimestre.");
    expect(built.entry.tracking?.routedTo).toBe("Growth");
    // …mais le statut et la valeur sont bien écrasés par le Tour.
    expect(built.entry.status).toBe("measured");
    expect(built.entry.absentCause).toBeUndefined();
  });

  it("une photo, pas un intervalle : la période est un point à la date du jour", () => {
    const built = buildTourEntry(allAnswered(0), QUESTIONS, "tout", TODAY)!;
    const observation = built.entry.observations[0]!;
    expect(observation.periodType).toBe("point");
    expect(observation.periodStart).toBe(TODAY);
    expect(observation.periodEnd).toBe(TODAY);
    expect(observation.asOf).toBe(TODAY);
    // Tiré par l'auditeur lui-même : il n'y a aucun intermédiaire.
    expect(observation.sourceKind).toBe("raw-extract-self");
  });
});
