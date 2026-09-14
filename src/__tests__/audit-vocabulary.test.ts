import { readFileSync, globSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AUDIT_CATALOG } from "@/content/audit-catalog";
import { TIER_EXPLANATION, TIER_GLOSS, TIER_SCALE } from "../app/(app)/admin/audit/labels";

/**
 * Les codes de l'instrument d'audit ne s'affichent jamais seuls.
 *
 * Signalé par Antoine le 2026-09-14, deux fois dans la même heure : « ACV,
 * c'est bien pour Annual Contract Value ? », puis « il faut aussi que tu
 * expliques les T1, T2, etc., les M7, M12, etc. » Il avait raison les deux
 * fois, et la seconde décrit une classe, pas un cas : l'échelle T0-T4 ne
 * vivait que dans un commentaire de `content/audit-catalog.ts`, et le pilier
 * s'affichait BRUT (`revenue`) sur les cartes de la collecte et dans
 * l'en-tête de l'éditeur, alors qu'`AUDIT_PILLAR_LABELS` existait et servait
 * partout ailleurs.
 *
 * L'invariant tenu ici : un fichier qui rend un code rend aussi sa table de
 * libellés. C'est ce que le typage ne peut pas voir — `row.tier` est un
 * `string` parfaitement valide, et l'écran l'affiche tel quel.
 *
 * Ce que ce test ne remplace pas : la vérification à l'écran, et le contrôle
 * de non-vacuité l'a PROUVÉ plutôt que suggéré. En remettant le pilier brut
 * sur la carte, la règle `.pillar` tombe bien — mais en remettant le palier
 * brut, ce fichier passe QUAND MÊME, parce que la légende dépliable, dans le
 * même fichier, importe `TIER_GLOSS` de son côté. Ce sont donc les specs de
 * `e2e/audit-rows.spec.ts` qui portent la glose du palier ; celles-ci sont un
 * filet pour la classe, pas la garantie.
 */
const ROUTE = join(process.cwd(), "src/app/(app)/admin/audit");

/** Rendu en enfant de JSX — pas en `key=`, pas en `data-testid=`. */
function rendersField(source: string, field: string): boolean {
  return new RegExp(String.raw`(?<!=)\{\s*[\w.$]+\.${field}\s*\}`).test(source);
}

const RULES: { field: string; labelTable: string }[] = [
  { field: "tier", labelTable: "TIER_GLOSS" },
  { field: "pillar", labelTable: "AUDIT_PILLAR_LABELS" },
  { field: "status", labelTable: "VALUE_STATUS_LABELS" },
];

function routeFiles(): string[] {
  return globSync(`${ROUTE}/**/*.tsx`);
}

describe("the audit instrument's on-screen vocabulary", () => {
  it("scans a route that actually exists — otherwise this test proves nothing", () => {
    const files = routeFiles();
    expect(files.length).toBeGreaterThan(10);
    // And at least one file really does render one of these codes, or the
    // rule below would be satisfied by an empty set.
    const rendering = files.filter((f) => {
      const source = readFileSync(f, "utf8");
      return RULES.some((rule) => rendersField(source, rule.field));
    });
    expect(rendering.length).toBeGreaterThan(0);
  });

  for (const { field, labelTable } of RULES) {
    it(`a screen that shows a raw .${field} also carries ${labelTable}`, () => {
      const offenders: string[] = [];
      for (const file of routeFiles()) {
        const source = readFileSync(file, "utf8");
        if (rendersField(source, field) && !source.includes(labelTable)) {
          offenders.push(file.replace(process.cwd() + "/", ""));
        }
      }
      expect(offenders, `these render .${field} without ${labelTable}:\n${offenders.join("\n")}`).toEqual([]);
    });
  }

  it("the tier scale is complete, ordered by cost, and every tier is used by the catalogue", () => {
    // Ascending cost — the order a scale is explained in. The collect list
    // sorts the other way (most expensive first), which is the work order.
    expect(TIER_SCALE).toEqual(["T0", "T1", "T2", "T3", "T4"]);
    for (const tier of TIER_SCALE) {
      expect(TIER_GLOSS[tier].length, tier).toBeGreaterThan(0);
      expect(TIER_EXPLANATION[tier].length, tier).toBeGreaterThan(40);
      // A tier nobody uses would be dead vocabulary on screen.
      expect(AUDIT_CATALOG.some((row) => row.tier === tier), `no catalogue row is ${tier}`).toBe(true);
    }
  });

  /**
   * The card says T2 and the fiche's cost line must not open with T3. This
   * is the agreement that would actually mislead — the two sit two
   * centimetres apart on the row editor.
   *
   * It replaces a first version of this test that compared each gloss to the
   * WORDS of the cost strings. That one failed, and it was right to: "une
   * session" was false for several T2 rows (a board pack already written, a
   * set of conventions to read alone). The gloss is now "quelques heures",
   * which holds across the whole set — but the lesson is that word-level
   * agreement between a five-word gloss and 39 lines of free prose is a
   * coincidence detector, not an invariant.
   */
  it("every row's cost line opens with the row's own tier", () => {
    for (const row of AUDIT_CATALOG) {
      expect(row.cost.startsWith(row.tier), `${row.id} is ${row.tier} but its cost line reads "${row.cost.slice(0, 40)}…"`).toBe(true);
    }
  });
});
