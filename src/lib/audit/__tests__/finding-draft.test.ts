import { describe, expect, it } from "vitest";
import { briefBudget, buildFinding, draftOf, emptyDraft, missingFindingFields } from "../finding-draft";
import { canMarkHeadline, headlineCount, isPromotable, setPriority } from "../findings";
import { BRIEF_WORD_BUDGET, HEADLINE_CAP, type Finding } from "../schema";
import { validateMission } from "../validate";
import { entry, fillRemaining, finding, mission, pass, withPasses } from "./fixtures";

const filled = (overrides: Partial<ReturnType<typeof emptyDraft>> = {}) => ({
  ...emptyDraft("f1", ["m01"]),
  gap: "evidence" as const,
  cause: "definition-never-settled" as const,
  ...overrides,
});

describe("ce qui bloque l'enregistrement d'un constat", () => {
  it("rien tant qu'il n'y a ni valeur référencée, ni écart, ni cause", () => {
    expect(missingFindingFields(emptyDraft("f1", []))).toEqual(["refs", "gap", "cause"]);
    expect(buildFinding(emptyDraft("f1", []))).toBeNull();
  });

  /**
   * Un constat sans référence est une opinion. Le validateur le refuse
   * (`a finding references at least one value`) ; le formulaire doit donc le
   * refuser avant, sinon l'erreur se découvre à l'export.
   */
  it("une valeur référencée ne suffit pas, mais son absence suffit à bloquer", () => {
    expect(missingFindingFields(filled({ refs: [] }))).toEqual(["refs"]);
    expect(buildFinding(filled({ refs: [] }))).toBeNull();
    expect(buildFinding(filled())).not.toBeNull();
  });

  /**
   * L'écart et la cause bloquent parce que ce sont des vocabulaires FERMÉS :
   * il n'existe pas de « vide » valide, et les défauter écrirait à la place
   * de l'auditeur une phrase qui s'imprimera dans un livrable.
   */
  it("l'écart et la cause bloquent chacun pour soi — jamais défautés", () => {
    expect(missingFindingFields(filled({ gap: undefined }))).toEqual(["gap"]);
    expect(missingFindingFields(filled({ cause: undefined }))).toEqual(["cause"]);
  });

  it("le reste du 5C et le Ledger partent vides plutôt que d'interdire d'enregistrer", () => {
    const built = buildFinding(filled())!;
    expect(built.criteria).toBe("");
    expect(built.ledger.problem).toBe("");
    // …et le fichier reste valide : il dit ce qui reste à faire.
    const m = mission();
    const result = validateMission(withPasses(m, fillRemaining(m, { ...pass(m), findings: [built] }, "absent")));
    expect(result.ok ? [] : result.errors).toEqual([]);
  });
});

describe("ce que buildFinding n'écrit jamais", () => {
  /**
   * `actual` / `learning` / `next` se remplissent à la passe SUIVANTE, quand
   * on sait ce qui s'est passé. Les poser vides maintenant en ferait des
   * champs à remplir à la rédaction, l'inverse de leur usage.
   */
  it("les trois champs de retour du Ledger restent absents", () => {
    const built = buildFinding(filled())!;
    expect(built.ledger).not.toHaveProperty("actual");
    expect(built.ledger).not.toHaveProperty("learning");
    expect(built.ledger).not.toHaveProperty("next");
  });

  it("une action convenue vide n'est pas écrite — un objet vide promettrait un accord qui n'a pas eu lieu", () => {
    expect(buildFinding(filled({ agreedAction: { action: "   " } }))).not.toHaveProperty("agreedAction");
    const built = buildFinding(filled({ agreedAction: { action: " Trancher la base du MRR ", ownerRole: " " } }))!;
    expect(built.agreedAction).toEqual({ action: "Trancher la base du MRR" });
  });
});

describe("rouvrir un constat", () => {
  it("le brouillon rend exactement ce qui était enregistré", () => {
    const original = finding("f1", { agreedAction: { action: "Publier la définition", ownerRole: "Head of Data" } });
    expect(buildFinding(draftOf(original))).toEqual(original);
  });
});

describe("la rareté est structurelle, pas une consigne", () => {
  const list = (count: number, marked: number): Finding[] =>
    Array.from({ length: count }, (_, i) => finding(`f${i}`, { headline: i < marked }));

  it("le neuvième headline est refusé — le plafond est une constante", () => {
    expect(HEADLINE_CAP).toBe(8);
    const eight = list(12, HEADLINE_CAP);
    expect(headlineCount(eight)).toBe(HEADLINE_CAP);
    expect(canMarkHeadline(eight, "f8")).toBe(false);
    const seven = list(12, HEADLINE_CAP - 1);
    expect(canMarkHeadline(seven, "f8")).toBe(true);
  });

  it("deux priorités sont impossibles : en marquer une seconde démarque la première", () => {
    const after = setPriority(setPriority(list(3, 0), "f0"), "f1");
    expect(after.filter((f) => f.priority).map((f) => f.id)).toEqual(["f1"]);
    // La première reste un headline : elle a été jugée importante, seule
    // l'exclusivité de la priorité lui est retirée.
    expect(after.find((f) => f.id === "f0")?.headline).toBe(true);
    expect(after.find((f) => f.id === "f1")?.headline).toBe(true);
  });

  it("une priorité ne compte pas contre le plafond des headlines", () => {
    const withPriority = setPriority(list(12, HEADLINE_CAP), "f9");
    expect(headlineCount(withPriority)).toBe(HEADLINE_CAP);
    // Et le fichier passe : le validateur compte de la même façon.
    const m = mission();
    const result = validateMission(withPasses(m, fillRemaining(m, { ...pass(m), findings: withPriority }, "absent")));
    expect(result.ok ? [] : result.errors).toEqual([]);
  });
});

describe("ce qui peut devenir un constat", () => {
  it("il faut un repère ET une décision en jeu — un nombre seul reste un nombre", () => {
    expect(isPromotable(entry("m01", "measured"))).toBe(false);
    expect(
      isPromotable(entry("m01", "measured", { criterion: { kind: "internal-trend", value: 10 } })),
    ).toBe(false);
    expect(
      isPromotable(
        entry("m01", "measured", { criterion: { kind: "internal-trend", value: 10 }, decisionAtStake: "Le budget du trimestre." }),
      ),
    ).toBe(true);
  });

  it("une décision en jeu faite d'espaces ne compte pas", () => {
    expect(
      isPromotable(entry("m01", "measured", { criterion: { kind: "internal-trend", value: 10 }, decisionAtStake: "   " })),
    ).toBe(false);
  });
});

describe("le budget du bloc de tête", () => {
  const words = (n: number) => Array.from({ length: n }, (_, i) => `mot${i}`).join(" ");

  it("compte les trois champs ensemble — le budget porte sur le bloc", () => {
    const result = briefBudget({ mainFinding: words(10), priorityAction: words(5), proof: words(3) });
    expect(result.words).toBe(18);
    expect(result.budget).toBe(BRIEF_WORD_BUDGET);
    expect(result.over).toBe(false);
    expect(result.overflow).toBe("");
  });

  it("montre ce qui basculerait en annexe plutôt que de couper", () => {
    const result = briefBudget({ mainFinding: words(BRIEF_WORD_BUDGET), priorityAction: "un deux trois", proof: "" });
    expect(result.words).toBe(BRIEF_WORD_BUDGET + 3);
    expect(result.over).toBe(true);
    expect(result.overflow).toBe("un deux trois");
  });

  it("un bloc vide vaut zéro, pas un mot", () => {
    expect(briefBudget({ mainFinding: "", priorityAction: "   ", proof: "" }).words).toBe(0);
  });

  it("exactement au budget, rien ne bascule", () => {
    const result = briefBudget({ mainFinding: words(BRIEF_WORD_BUDGET), priorityAction: "", proof: "" });
    expect(result.words).toBe(BRIEF_WORD_BUDGET);
    expect(result.over).toBe(false);
    expect(result.overflow).toBe("");
  });
});
