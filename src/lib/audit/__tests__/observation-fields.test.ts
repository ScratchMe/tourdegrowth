import { describe, expect, it } from "vitest";
import { AUDIT_CATALOG } from "@/content/audit-catalog";
import { OBSERVATION_GAPS, VALUE_EDITORS, observationGaps, valueEditorFor, type ValueEditor } from "../observation-fields";
import { VALUE_STATUSES } from "../schema";
import { validateMission } from "../validate";
import { entry, fillRemaining, mission, observation, pass, withPasses } from "./fixtures";

/**
 * Comme `entry-fields.test.ts` : ce qui est tenu ici n'est pas « les bonnes
 * cases sont à l'écran » mais « ce que l'écran RÉCLAME est ce que le
 * validateur EXIGERA ». Les deux se prouvent en faisant tourner le validateur
 * plutôt qu'en redisant sa règle.
 */
describe("valueEditorFor — six formes, quatre éditeurs", () => {
  it("couvre toutes les formes que le catalogue emploie réellement", () => {
    const shapes = new Set(AUDIT_CATALOG.map((row) => row.valueShape));
    // Six formes employées : si le catalogue en ajoute une, le `switch` ne
    // compile plus, et ce test dit laquelle.
    expect(shapes.size).toBe(6);
    for (const shape of shapes) expect(VALUE_EDITORS).toContain(valueEditorFor(shape));
  });

  it("chaque ligne du catalogue reçoit un éditeur, et les quatre servent", () => {
    const used = new Map<ValueEditor, number>();
    for (const row of AUDIT_CATALOG) {
      const editor = valueEditorFor(row.valueShape);
      used.set(editor, (used.get(editor) ?? 0) + 1);
    }
    expect([...used.keys()].sort()).toEqual([...VALUE_EDITORS].sort());
    // Le regroupement de la décision 5 : couple + distribution + composite
    // partagent l'éditeur « ligne ». C'est le plus employé des quatre, ce qui
    // est la raison de ne pas l'avoir écrit trois fois.
    const rowShapes = AUDIT_CATALOG.filter((r) => ["couple", "distribution", "composite"].includes(r.valueShape));
    expect(used.get("row")).toBe(rowShapes.length);
    expect(used.get("row")).toBeGreaterThan(used.get("number") ?? 0);
  });
});

describe("observationGaps — ce qui manque, et rien de plus", () => {
  it("ne rend que des manques de la liste fermée, pour tous les statuts", () => {
    for (const status of VALUE_STATUSES) {
      for (const gap of observationGaps(status, [])) expect(OBSERVATION_GAPS).toContain(gap);
    }
  });

  /**
   * La règle du validateur, exercée et non redite : une ligne mesurée sans
   * aucune observation VALUÉE est refusée, et une observation sans valeur —
   * « demandé, pas encore reçu » — est légitime mais ne suffit pas.
   */
  it("réclame une valeur exactement là où le validateur en réclame une", () => {
    const m = mission();
    const noValue = entry("m01", "measured", { observations: [observation(null)] });
    const result = validateMission(withPasses(m, fillRemaining(m, pass(m, [noValue]), "absent")));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.includes("at least one observation with a value"))).toBe(true);

    expect(observationGaps("measured", [observation(null)])).toEqual(["needs-value"]);
    expect(observationGaps("measured", [observation(42)])).toEqual([]);
    expect(observationGaps("estimated", [])).toEqual(["needs-value"]);
  });

  it("réclame un second chiffre exactement là où le validateur en réclame un", () => {
    const m = mission();
    const alone = entry("m01", "contested", { observations: [observation(1_200_000, { id: "a" })] });
    const result = validateMission(withPasses(m, fillRemaining(m, pass(m, [alone]), "absent")));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.includes("at least two observations"))).toBe(true);

    expect(observationGaps("contested", [observation(1, { id: "a" })])).toEqual(["needs-second"]);
    expect(observationGaps("contested", [observation(1, { id: "a" }), observation(2, { id: "b" })])).toEqual([]);
  });

  /**
   * Un désaccord entre deux chiffres est le constat lui-même : ni l'un ni
   * l'autre n'a à être « la » valeur, donc `contested` ne réclame jamais de
   * valeur non nulle — deux observations en attente restent un désaccord
   * documenté. Vérifié contre le validateur, qui ne l'exige pas non plus.
   */
  it("un contesté ne réclame pas de valeur, seulement deux observations", () => {
    expect(observationGaps("contested", [observation(null, { id: "a" }), observation(null, { id: "b" })])).toEqual([]);
    const m = mission();
    const both = entry("m01", "contested", { observations: [observation(null, { id: "a" }), observation(null, { id: "b" })] });
    const result = validateMission(withPasses(m, fillRemaining(m, pass(m, [both]), "absent")));
    expect(result.ok ? [] : result.errors).toEqual([]);
  });

  it("ne réclame rien d'une ligne absente, hors profil ou inaccessible", () => {
    for (const status of ["absent", "not-applicable", "not-accessible", "reported-without-definition"] as const) {
      expect(observationGaps(status, [])).toEqual([]);
    }
  });
});
