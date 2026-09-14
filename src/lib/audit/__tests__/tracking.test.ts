import { describe, expect, it } from "vitest";
import { CHASE_STATES, OVERDUE_DAYS, UNASSIGNED_GROUP, chaseState, daysBetween, groupForCollect, groupKey, toChase } from "../tracking";
import type { Entry } from "../schema";
import { entry, observation } from "./fixtures";

const TODAY = "2026-09-14";
const track = (metricId: string, tracking: Entry["tracking"]): Entry => entry(metricId, "absent", { tracking });

describe("chaseState", () => {
  it("ne rend que des états connus, quelle que soit l'entrée", () => {
    for (const tracking of [undefined, {}, { requestedOn: "2026-09-01" }, { requestedOn: "2026-09-01", receivedOn: "2026-09-03" }]) {
      expect(CHASE_STATES).toContain(chaseState(tracking, TODAY));
    }
  });

  it("reçu l'emporte sur tout le reste — même une demande très ancienne", () => {
    expect(chaseState({ requestedOn: "2026-01-01", receivedOn: "2026-09-10" }, TODAY)).toBe("received");
  });

  it("rien demandé n'est pas la même chose qu'en attente", () => {
    expect(chaseState(undefined, TODAY)).toBe("not-requested");
    expect(chaseState({ mandateLevel: "director" }, TODAY)).toBe("not-requested");
  });

  it("la bascule en retard est à OVERDUE_DAYS, des deux côtés", () => {
    const requested = (daysAgo: number) => {
      const date = new Date(Date.parse(TODAY) - daysAgo * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      return chaseState({ requestedOn: date }, TODAY);
    };
    expect(requested(OVERDUE_DAYS - 1)).toBe("waiting");
    expect(requested(OVERDUE_DAYS)).toBe("overdue");
  });

  /**
   * La règle qui compte : l'horloge repart à la relance. Sans ça, une ligne
   * dont on vient de s'occuper resterait en tête de la liste d'actions et
   * l'auditeur relancerait deux fois le même interlocuteur.
   */
  it("une relance récente remet le compteur à zéro", () => {
    const old = { requestedOn: "2026-08-01" };
    expect(chaseState(old, TODAY)).toBe("overdue");
    expect(chaseState({ ...old, chasedOn: "2026-09-13" }, TODAY)).toBe("waiting");
    // Une relance elle-même ancienne ne protège plus.
    expect(chaseState({ ...old, chasedOn: "2026-08-20" }, TODAY)).toBe("overdue");
  });

  it("une date illisible ou dans le futur n'invente pas un retard", () => {
    expect(chaseState({ requestedOn: "pas une date" }, TODAY)).toBe("waiting");
    expect(chaseState({ requestedOn: "2026-12-01" }, TODAY)).toBe("waiting");
  });

  it("daysBetween rend null plutôt que NaN sur une entrée absente ou illisible", () => {
    expect(daysBetween(undefined, TODAY)).toBeNull();
    expect(daysBetween("bientôt", TODAY)).toBeNull();
    expect(daysBetween("2026-09-07", TODAY)).toBe(7);
  });
});

describe("toChase — une liste d'actions, pas un inventaire", () => {
  it("ne garde que les retards, la plus ancienne demande d'abord", () => {
    const entries = [
      track("m01", { requestedOn: "2026-09-13" }), // en attente
      track("m02", { requestedOn: "2026-08-01" }), // le plus ancien
      track("m04", { requestedOn: "2026-09-01" }), // en retard, plus récent
      track("m05", { requestedOn: "2026-01-01", receivedOn: "2026-09-02" }), // reçu
      track("m07", undefined), // jamais demandé
    ];
    expect(toChase(entries, TODAY).map((e) => e.metricId)).toEqual(["m02", "m04"]);
  });

  it("ne rend rien quand tout est reçu ou frais", () => {
    expect(toChase([track("m01", { requestedOn: "2026-09-13" }), track("m02", { receivedOn: "2026-09-12" })], TODAY)).toEqual([]);
  });
});

describe("groupForCollect — par interlocuteur, sinon par système source", () => {
  it("préfère l'interlocuteur au système, parce qu'une collecte se prépare par réunion", () => {
    const e = entry("m01", "measured", { tracking: { routedTo: "DAF" }, observations: [observation(1, { sourceSystem: "Stripe" })] });
    expect(groupKey(e)).toBe("DAF");
  });

  it("retombe sur le système source quand personne n'est nommé", () => {
    expect(groupKey(entry("m01", "measured", { observations: [observation(1, { sourceSystem: "Stripe" })] }))).toBe("Stripe");
  });

  it("« non attribué » quand il n'y a ni l'un ni l'autre", () => {
    expect(groupKey(entry("m01", "absent"))).toBe(UNASSIGNED_GROUP);
  });

  it("les groupes nommés passent en premier, par ordre alphabétique, et « non attribué » ferme la marche", () => {
    const groups = groupForCollect([
      entry("m01", "absent"),
      entry("m02", "measured", { tracking: { routedTo: "Growth" }, observations: [] }),
      entry("m04", "measured", { tracking: { routedTo: "DAF" }, observations: [] }),
      entry("m05", "absent"),
    ]);
    expect(groups.map((g) => g.key)).toEqual(["DAF", "Growth", UNASSIGNED_GROUP]);
    expect(groups.at(-1)!.entries.map((e) => e.metricId)).toEqual(["m01", "m05"]);
  });

  it("aucune entrée n'est perdue ni dupliquée par le groupement", () => {
    const entries = [entry("m01", "absent"), entry("m02", "measured", { tracking: { routedTo: "DAF" }, observations: [] }), entry("m04", "absent")];
    const flat = groupForCollect(entries).flatMap((g) => g.entries.map((e) => e.metricId));
    expect(flat.sort()).toEqual(["m01", "m02", "m04"]);
  });
});
