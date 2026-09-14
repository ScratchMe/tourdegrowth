import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/content/copy-library";
import type { Answers } from "@/lib/scoring/compute";
import { PILLARS } from "@/lib/scoring/pillars";
import { buildRestitution, RESTITUTION_PILLARS } from "../restitution";
import { applicableRows } from "../schema";
import { entry, mission, pass } from "./fixtures";

/** L'index de l'option à 20 points d'une question du Tour. */
function twentyPointIndex(questionId: string): 0 | 1 | 2 {
  const question = QUESTIONS.find((q) => q.id === questionId)!;
  return question.options.findIndex((o) => o.points === 20) as 0 | 1 | 2;
}
function zeroPointIndex(questionId: string): 0 | 1 | 2 {
  const question = QUESTIONS.find((q) => q.id === questionId)!;
  return question.options.findIndex((o) => o.points === 0) as 0 | 1 | 2;
}

/** `m09` est le CAC : pilier acquisition, `tourQuestionId: "acq-3"`, tous profils. */
const CAC = "m09";

describe("le croisement méthode × réalité, ligne par ligne", () => {
  it("l'équipe déclare mesurer son CAC et rien ne le documente : angle mort", () => {
    const m = mission();
    const answers: Partial<Answers> = { "acq-3": twentyPointIndex("acq-3") };
    const p = { ...pass(m, [entry(CAC, "absent")]), tourAnswers: answers };

    const view = buildRestitution(m, p, QUESTIONS);
    expect(view.blindSpots.map((item) => item.row.id)).toEqual([CAC]);
    expect(view.counts["blind-spot"]).toBe(1);
  });

  it("la même absence, mais l'équipe le sait : un écart connu, pas un angle mort", () => {
    const m = mission();
    const answers: Partial<Answers> = { "acq-3": zeroPointIndex("acq-3") };
    const p = { ...pass(m, [entry(CAC, "absent")]), tourAnswers: answers };

    const view = buildRestitution(m, p, QUESTIONS);
    expect(view.blindSpots).toEqual([]);
    expect(view.groups.flatMap((g) => g.rows).find((item) => item.row.id === CAC)?.quadrant).toBe("known-gap");
  });

  /**
   * Le point qui sépare cet écran du score : un angle mort est un croisement
   * QUESTION par QUESTION. Une seule réponse suffit à en révéler un, alors
   * que le score attend les 15. Les lier ferait attendre la fin des
   * entretiens pour voir ce qui se voyait dès le premier.
   */
  it("une seule réponse du Tour suffit — le score, lui, en attend quinze", () => {
    const m = mission();
    const p = { ...pass(m, [entry(CAC, "absent")]), tourAnswers: { "acq-3": twentyPointIndex("acq-3") } };
    expect(Object.keys(p.tourAnswers)).toHaveLength(1);
    expect(buildRestitution(m, p, QUESTIONS).blindSpots).toHaveLength(1);
  });

  it("sans aucune réponse du Tour, aucun angle mort ne peut être établi", () => {
    const m = mission();
    const p = pass(m, [entry(CAC, "absent")]);
    expect(p.tourAnswers).toEqual({});
    expect(buildRestitution(m, p, QUESTIONS).blindSpots).toEqual([]);
  });
});

describe("le regroupement", () => {
  it("les étapes sont dans l'ordre canonique AARRR, et ce qui les traverse vient après", () => {
    expect(RESTITUTION_PILLARS).toEqual([...PILLARS, "transverse"]);
    const m = mission();
    const view = buildRestitution(m, pass(m), QUESTIONS);
    const order = view.groups.map((g) => g.pillar);
    expect(order).toEqual(RESTITUTION_PILLARS.filter((pillar) => order.includes(pillar)));
  });

  it("chaque ligne applicable apparaît une fois et une seule", () => {
    const m = mission();
    const view = buildRestitution(m, pass(m), QUESTIONS);
    const seen = view.groups.flatMap((g) => g.rows.map((item) => item.row.id));
    const expected = applicableRows(m.catalog, m.header.profile.model).map((row) => row.id);
    expect([...seen].sort()).toEqual([...expected].sort());
    expect(new Set(seen).size).toBe(seen.length);
  });

  it("les angles morts sont en tête ET restent dans leur pilier — c'est une mise en avant, pas un déplacement", () => {
    const m = mission();
    const p = { ...pass(m, [entry(CAC, "absent")]), tourAnswers: { "acq-3": twentyPointIndex("acq-3") } };
    const view = buildRestitution(m, p, QUESTIONS);
    expect(view.blindSpots.map((i) => i.row.id)).toEqual([CAC]);
    expect(view.groups.find((g) => g.pillar === "acquisition")?.rows.some((i) => i.row.id === CAC)).toBe(true);
  });

  it("un pilier sans ligne applicable ne laisse pas de titre vide", () => {
    const m = mission();
    const view = buildRestitution(m, pass(m), QUESTIONS);
    expect(view.groups.every((group) => group.rows.length > 0)).toBe(true);
  });

  it("les compteurs somment exactement les lignes applicables", () => {
    const m = mission();
    const p = pass(m, [entry(CAC, "absent"), entry("m01", "measured")]);
    const view = buildRestitution(m, p, QUESTIONS);
    const total = Object.values(view.counts).reduce((sum, n) => sum + n, 0);
    expect(total).toBe(applicableRows(m.catalog, m.header.profile.model).length);
    // Ce qui n'a pas d'entrée est « pas encore examiné », jamais une absence.
    expect(view.counts.pending).toBe(total - 2);
  });
});
