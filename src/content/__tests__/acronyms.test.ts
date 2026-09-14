import { describe, expect, it } from "vitest";
import { GLOSSARY } from "../glossary";
import { GLOSSARY_DEEP } from "../glossary-deep";
import { type GlossaryTermId } from "../glossary-terms";
import { LOCALES, type Locale } from "@/lib/i18n/locale";
import type { Translatable } from "@/lib/i18n/translatable";

/**
 * Tout acronyme affiché doit être développé sur la page qui l'affiche.
 *
 * Signalé par Antoine sur PQL, dont le titre français disait « lead qualifié
 * par le produit » — une TRADUCTION du sens, jamais l'expansion des lettres
 * (L-Q-P, pas P-Q-L). Un lecteur francophone qui cherche « PQL définition »
 * repartait sans savoir à quoi les trois lettres correspondent. Le balayage a
 * montré la même chose sur NRR/GRR, DAU/MAU et ARPU, plus quatre acronymes
 * (MQL, CSAT, WAU, ARR) développés nulle part sur le site.
 *
 * Le test vérifie donc les INITIALES, pas la présence d'une glose : c'est
 * précisément la distinction qui manquait. Un premier balayage plus permissif
 * (« une explication se trouve à proximité ») déclarait PQL correct.
 */

const EXPANSION: Partial<Record<GlossaryTermId, RegExp>> = {
  pql: /product.qualified lead/i,
  "nrr-grr": /net (?:and|et) gross revenue retention/i,
  "dau-mau": /daily (?:and|et) monthly active users/i,
  arpu: /average revenue per user/i,
  nps: /net promoter score/i,
  cac: /customer acquisition cost|co[ûu]t d'acquisition client/i,
  ltv: /lifetime value/i,
};

/** Les acronymes empruntés, et où ils doivent être développés. */
const BORROWED: [GlossaryTermId, string, RegExp][] = [
  ["pql", "MQL", /marketing.qualified lead|lead qualifié par le marketing/i],
  ["nps", "CSAT", /customer satisfaction score/i],
  ["dau-mau", "WAU", /weekly (?:over|active)|actifs hebdomadaires/i],
  ["revenue", "ARR", /annual recurring revenue|revenu récurrent annuel/i],
  ["revenue", "MRR", /monthly recurring revenue|revenu récurrent mensuel/i],
  ["arpu", "ARPPU", /per paying user|par utilisateur payant/i],
];

function textOf(node: unknown, locale: Locale): string {
  const bits: string[] = [];
  (function walk(v: unknown) {
    if (v == null) return;
    if (typeof v === "object" && "fr" in (v as object) && "en" in (v as object)) {
      bits.push(String((v as Translatable)[locale]));
      return;
    }
    if (Array.isArray(v)) return v.forEach(walk);
    if (typeof v === "object") Object.values(v as object).forEach(walk);
  })(node);
  return bits.join("\n");
}

/**
 * Tout ce que la page rend, et rien d'autre. `GLOSSARY[id]` reprend le titre
 * et la définition courte de `glossary-terms.ts` ET porte `extended` — le
 * paragraphe « En pratique », rendu AVANT les sections longues. Une première
 * version de ce test lisait `GLOSSARY_TERMS` + `GLOSSARY_DEEP` et ratait donc
 * `extended` : elle a échoué dès qu'un développé y a été placé, ce qui était
 * le bon signal et pas un faux positif.
 */
const pageOf = (id: GlossaryTermId) => ({ entry: GLOSSARY[id], deep: GLOSSARY_DEEP[id] });

describe("les acronymes du glossaire", () => {
  it("couvre un jeu de termes non vide — sinon ce fichier ne prouve rien", () => {
    expect(Object.keys(EXPANSION).length).toBeGreaterThanOrEqual(7);
    expect(BORROWED.length).toBeGreaterThanOrEqual(6);
  });

  for (const [id, expansion] of Object.entries(EXPANSION) as [GlossaryTermId, RegExp][]) {
    for (const locale of LOCALES) {
      it(`développe ${id} en ${locale}`, () => {
        expect(textOf(pageOf(id), locale)).toMatch(expansion);
      });
    }
  }

  for (const [id, acronym, expansion] of BORROWED) {
    for (const locale of LOCALES) {
      it(`développe ${acronym} là où ${id} l'emploie (${locale})`, () => {
        const text = textOf(pageOf(id), locale);
        // Un acronyme absent de la page n'a rien à y être développé.
        if (!new RegExp(`\\b${acronym}\\b`).test(text)) return;
        expect(text).toMatch(expansion);
      });
    }
  }
});
