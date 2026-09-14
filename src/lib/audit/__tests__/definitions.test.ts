import { describe, expect, it } from "vitest";
import { definitionFor, missingDefinitionFields, normalizeDraft, upsertDefinition, type DefinitionDraft } from "../definitions";
import { definitionRef, registerDefinition, type Mission } from "../schema";
import { validateMission } from "../validate";
import { entry, fillRemaining, mission, pass, withPasses } from "./fixtures";

/**
 * AUDIT.md §3 — une `MetricDefinition` est immuable et adressée par
 * `id@version`. Ce que ce module décide, c'est QUELLE version écrire quand
 * l'auditeur ferme le formulaire ; les tests ci-dessous l'assertent contre le
 * comportement réel de `registerDefinition`, jamais en le redisant.
 */

/** Une mission vierge de toute définition — le fixture `mission()` en enregistre une par ligne. */
function bare(): Mission {
  return { ...mission(), definitions: {} };
}

function draft(overrides: Partial<DefinitionDraft> = {}): DefinitionDraft {
  return {
    metricId: "m01",
    unit: "euro",
    numeratorPopulation: "revenu récurrent normalisé du mois clos",
    denominatorPopulation: "sans objet (valeur absolue)",
    scope: "tout",
    ...overrides,
  };
}

describe("upsertDefinition — trois cas, dans cet ordre", () => {
  it("frappe la v1 quand la métrique n'a aucune définition", () => {
    const { mission: m, ref, bumped } = upsertDefinition(bare(), draft());
    expect(ref).toBe(definitionRef("m01", 1));
    expect(bumped).toBe(false);
    expect(m.definitions[ref]).toMatchObject({ id: "m01", version: 1, metricId: "m01" });
  });

  it("réutilise la référence quand le contenu est identique — rouvrir un formulaire sans rien changer ne crée pas de v2", () => {
    const first = upsertDefinition(bare(), draft());
    const second = upsertDefinition(first.mission, draft());
    expect(second.ref).toBe(first.ref);
    expect(second.bumped).toBe(false);
    expect(Object.keys(second.mission.definitions)).toEqual([definitionRef("m01", 1)]);
    // La mission n'est pas seulement équivalente : elle n'est pas réécrite.
    expect(second.mission).toBe(first.mission);
  });

  it("frappe la version suivante quand un axe change, et garde l'ancienne", () => {
    const first = upsertDefinition(bare(), draft());
    const second = upsertDefinition(first.mission, draft({ denominatorPopulation: "clients actifs au premier jour du mois" }));
    expect(second.ref).toBe(definitionRef("m01", 2));
    expect(second.bumped).toBe(true);
    expect(Object.keys(second.mission.definitions).sort()).toEqual([definitionRef("m01", 1), definitionRef("m01", 2)]);
    // L'immuabilité est le point : une observation qui référence m01@1 continue
    // de vouloir dire ce qu'elle voulait dire.
    expect(second.mission.definitions[first.ref]).toEqual(first.mission.definitions[first.ref]);
  });

  it("repart du maximum, pas du nombre de versions — une v3 suit une v2 même si la v1 a disparu", () => {
    let m = bare();
    m = upsertDefinition(m, draft()).mission;
    m = upsertDefinition(m, draft({ unit: "pourcentage" })).mission;
    const { [definitionRef("m01", 1)]: _removed, ...rest } = m.definitions;
    const third = upsertDefinition({ ...m, definitions: rest }, draft({ unit: "jours" }));
    expect(third.ref).toBe(definitionRef("m01", 3));
  });

  it("l'identité par défaut est le metricId, et un id explicite la remplace", () => {
    expect(upsertDefinition(bare(), draft()).ref).toBe("m01@1");
    expect(upsertDefinition(bare(), draft({ id: "mrr-normalise" })).ref).toBe("mrr-normalise@1");
  });

  it("deux définitions de métriques différentes ne se comptent pas l'une l'autre", () => {
    const first = upsertDefinition(bare(), draft());
    const second = upsertDefinition(first.mission, draft({ metricId: "m02" }));
    expect(second.ref).toBe(definitionRef("m02", 1));
    expect(second.bumped).toBe(false);
  });
});

describe("ce que la comparaison de contenu doit ignorer, et ce qu'elle doit voir", () => {
  /**
   * `registerDefinition` compare deux définitions par `JSON.stringify`, donc
   * l'ordre des clés compte pour LUI. Un formulaire produit l'ordre dans
   * lequel les champs ont été remplis : sans le tri de `contentOf`, rouvrir un
   * formulaire et le fermer sans rien changer lèverait une exception au lieu
   * de ne rien faire.
   */
  it("l'ordre de saisie des champs ne frappe pas de version", () => {
    const inOrder: DefinitionDraft = { metricId: "m01", unit: "euro", numeratorPopulation: "n", denominatorPopulation: "d", scope: "tout" };
    const reversed: DefinitionDraft = { scope: "tout", denominatorPopulation: "d", numeratorPopulation: "n", unit: "euro", metricId: "m01" };
    const first = upsertDefinition(bare(), inOrder);
    expect(() => upsertDefinition(first.mission, reversed)).not.toThrow();
    expect(upsertDefinition(first.mission, reversed).ref).toBe(first.ref);
  });

  it("un champ optionnel laissé vide par le formulaire vaut un champ absent", () => {
    const first = upsertDefinition(bare(), draft());
    const second = upsertDefinition(first.mission, { ...draft(), grossOrNet: undefined, attributionWindow: undefined });
    expect(second.ref).toBe(first.ref);
    expect(second.bumped).toBe(false);
  });

  it("vider un axe qui était rempli EST un changement", () => {
    const first = upsertDefinition(bare(), draft({ grossOrNet: "net" }));
    const second = upsertDefinition(first.mission, draft());
    expect(second.ref).toBe(definitionRef("m01", 2));
    expect(second.bumped).toBe(true);
  });
});

describe("normalizeDraft — ce qu'un formulaire produit et que le schéma n'a pas", () => {
  it("retire les chaînes vides, les tableaux vides, et rogne le reste", () => {
    const normalized = normalizeDraft({ ...draft({ unit: "  euro  " }), grossOrNet: "", costsIncluded: [], costsExcluded: ["  salaires  ", ""] });
    expect(normalized.unit).toBe("euro");
    expect("grossOrNet" in normalized).toBe(false);
    expect("costsIncluded" in normalized).toBe(false);
    expect(normalized.costsExcluded).toEqual(["salaires"]);
  });

  it("garde les booléens, y compris false — un défaut d'outil explicitement écarté est une information", () => {
    expect(normalizeDraft(draft({ toolDefault: false })).toolDefault).toBe(false);
  });

  /**
   * Le vrai enjeu de la normalisation : c'est ELLE qui fait tenir la règle
   * « rouvrir un formulaire sans rien changer ne frappe pas de version ».
   * Un champ optionnel rendu en `""` par un `<input>` vide n'existe pas dans
   * la définition enregistrée.
   */
  it("une espace de trop ou un champ optionnel vide ne frappe pas de version", () => {
    const first = upsertDefinition(bare(), draft());
    const second = upsertDefinition(first.mission, { ...draft({ unit: " euro " }), grossOrNet: "", horizon: "   " });
    expect(second.ref).toBe(first.ref);
    expect(second.bumped).toBe(false);
  });
});

describe("missingDefinitionFields — ce qui manque pour enregistrer", () => {
  it("nomme les champs requis vides, dans l'ordre du formulaire", () => {
    expect(missingDefinitionFields(draft())).toEqual([]);
    expect(missingDefinitionFields({ metricId: "m01", unit: "", numeratorPopulation: "  ", denominatorPopulation: "d", scope: "" })).toEqual([
      "unit",
      "numeratorPopulation",
      "scope",
    ]);
  });

  it("les champs qu'il exige sont ceux que le validateur exige — sinon l'écran laisserait enregistrer un fichier refusé à l'export", () => {
    const complete = draft();
    for (const field of missingDefinitionFields({ metricId: "m01", unit: "", numeratorPopulation: "", denominatorPopulation: "", scope: "" })) {
      const { mission: m, ref } = upsertDefinition(bare(), { ...complete, [field]: "" });
      const p = fillRemaining(m, pass(m, [entry("m01", "measured", { definitionRef: ref })]), "absent");
      const result = validateMission(withPasses(m, p));
      expect(result.ok ? [] : result.errors).toContainEqual(expect.stringContaining(field));
    }
  });
});

describe("le contrat avec le reste du schéma", () => {
  it("la mission rendue est celle que registerDefinition défend — écraser la version frappée avec un autre contenu est refusé", () => {
    const { mission: m, ref } = upsertDefinition(bare(), draft());
    const posted = m.definitions[ref]!;
    expect(() => registerDefinition(m, posted)).not.toThrow();
    expect(() => registerDefinition(m, { ...posted, unit: "pourcentage" })).toThrow(/bump the version/);
  });

  it("la référence rendue est acceptée par le validateur sur une entrée mesurée", () => {
    const base = bare();
    const { mission: m, ref } = upsertDefinition(base, draft());
    const measured = entry("m01", "measured", { definitionRef: ref });
    const p = fillRemaining(m, pass(m, [measured]), "absent");
    const result = validateMission(withPasses(m, p));
    expect(result.ok ? [] : result.errors).toEqual([]);
  });

  it("une référence non enregistrée est bien refusée — sinon le test ci-dessus ne prouverait rien", () => {
    const m = bare();
    const measured = entry("m01", "measured", { definitionRef: "m01@7" });
    const p = fillRemaining(m, pass(m, [measured]), "absent");
    const result = validateMission(withPasses(m, p));
    expect(result.ok ? [] : result.errors).toContainEqual(expect.stringContaining("m01@7 is not registered"));
  });
});

describe("definitionFor — jamais une exception sur une référence cassée", () => {
  it("rend la définition référencée", () => {
    const { mission: m, ref } = upsertDefinition(bare(), draft());
    expect(definitionFor(m, ref)).toMatchObject({ id: "m01", version: 1 });
  });

  it("rend undefined sur une référence absente, malformée ou vide", () => {
    const { mission: m } = upsertDefinition(bare(), draft());
    expect(definitionFor(m, undefined)).toBeUndefined();
    expect(definitionFor(m, "")).toBeUndefined();
    expect(definitionFor(m, "m01")).toBeUndefined();
    expect(definitionFor(m, "m01@deux")).toBeUndefined();
    expect(definitionFor(m, "m01@9")).toBeUndefined();
  });
});
