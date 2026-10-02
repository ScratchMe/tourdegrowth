import { BY_PATH, FILES, reachable, resolveSpecifier, valueImports } from "./helpers/import-graph";
import { describe, expect, it } from "vitest";

/**
 * Le pendant serveur de `client-bundles.test.ts` (REVIEW-02.md R2-14).
 *
 * Ce garde-là ne regarde que les Client Components. Il ne dit rien du coût
 * qui domine réellement la facture Vercel : **le stockage de fonction se
 * compte par ROUTE**, et Turbopack émet un chunk SSR par groupe de routes.
 * Un module de contenu qu'une seule page rend, mais qu'un module partagé
 * importe, est donc recopié dans le bundle de CHAQUE route qui traverse ce
 * module partagé.
 *
 * C'est ce qui est arrivé deux fois, sans qu'aucun test ne bouge :
 *
 * 1. `content/glossary.ts` importait `content/glossary-deep.ts` (300 Ko de
 *    prose longue) rien que pour exposer un champ `deep` que seule la page
 *    de terme lisait. Les 300 Ko partaient donc dans les six chunks SSR.
 * 2. `lib/seo/jsonld.tsx` — importé par les neuf familles de pages de
 *    contenu — portait un helper `CRUMBS` qui tirait sept modules de
 *    contenu pour construire des fils d'Ariane page par page.
 *
 * Le test mesure l'ATTEINTE, pas le style d'import : pour chaque module de
 * contenu volumineux, combien de points d'entrée de route le rejoignent en
 * suivant les imports de valeur. Une borne par module, avec la raison. Un
 * `import type` n'est pas une arête — TypeScript l'efface. La marche elle-même
 * vit dans `helpers/import-graph.ts`, partagée avec `game-bundles.test.ts`.
 */

/** Ce que Next compile en fonction : les fichiers de convention de l'App Router. */
const ENTRY_POINTS = FILES.map((f) => f.path).filter(
  (p) =>
    p.startsWith("app/") &&
    /\/(page|layout|route|sitemap|robots|error|global-error|not-found|global-not-found|opengraph-image)\.tsx?$/.test(p),
);

const REACHERS = new Map(ENTRY_POINTS.map((e) => [e, reachable(e)]));

function reachersOf(module: string): string[] {
  return ENTRY_POINTS.filter((e) => REACHERS.get(e)!.has(module)).sort();
}

/**
 * Bornes, avec la raison de chacune. Les chiffres sont ceux mesurés le
 * 2026-09-15 ; ce sont des plafonds, pas des objectifs — les dépasser est
 * une décision (une page de plus rend vraiment ce contenu), jamais un
 * accident de refactor.
 *
 * **`/llms.txt` et `/llms-full.txt` (C27, 2026-09-30) sont prérendus en statique, mais
 * leur code rejoint quand même le bundle de fonction de `robots.txt` et du sitemap** :
 * mesuré par `vercel build` hors ligne (VERCEL.md §1.2), +386 Ko sur ce bundle,
 * dont 284 Ko pour le chunk du glossaire long. Sous le seuil de /livrer §0 (~1 Mo).
 */
const BUDGETS: { module: string; max: number; why: string }[] = [
  {
    module: "content/glossary-deep.ts",
    max: 2,
    why: "300 Ko de prose longue : la page de terme la rend, et le texte intégral de /llms-full.txt (C27, 2026-09-30). Elle a été dans six chunks.",
  },
  {
    module: "content/glossary.ts",
    max: 3,
    why: "La copie `extended` : la page de terme la rend, le sitemap lit `updatedAt`, /llms-full.txt la recopie (C27). Tout le reste passe par content/glossary-terms.ts.",
  },
  {
    module: "content/legal.ts",
    max: 4,
    why: "Les deux pages légales, le sitemap (qui lit leur `updatedAt`) et /llms.txt (leur titre et leur description, C27).",
  },
  {
    module: "content/comparisons.ts",
    max: 7,
    why: "Les cinq pages du cluster (HEART ajoutée par l'audit SEO v1 §3.1), et /llms.txt et /llms-full.txt (C27 : la description et le texte de chaque comparaison). Qui ne fait que LISTER le cluster (/how-it-works, le terme AARRR, le sitemap) lit content/comparison-index.ts — ~40 Ko de prose en moins sur chacune, 48 routes pour le seul glossaire.",
  },
  // Le moteur de growth (spec du moteur §10.3) : sa prose ne sert qu'à sa
  // propre page, qui la résout au build et la passe à l'îlot en props.
  // Atteinte par une deuxième route, elle partirait dans une fonction de plus
  // — et comptée par route (VERCEL.md §2.2).
  {
    module: "content/engine-catalog.ts",
    max: 1,
    why: "La prose des dix-sept chiffres : seule /{locale}/aarrr-funnel-template la rend.",
  },
  {
    module: "content/engine-copy.ts",
    max: 2,
    why: "Toute la copie d'interface du moteur : sa page la résout, et /llms.txt lit son titre et sa description quand le moteur est ouvert au build (C27).",
  },
  {
    module: "content/engine-share.ts",
    max: 3,
    why: "Le titre du moteur et les mots de son image de partage (T6.2) : la page et /llms.txt par engine-copy.ts, et l'image elle-même — qui n'atteint QUE ce module-là de la copie du moteur, et pas engine-copy.ts.",
  },
  {
    module: "content/copy-library.ts",
    max: 13,
    why:
      "Les quinze questions du Tour : onze routes les citaient au 2026-09-15 ; la page du moteur est la douzième (spec du moteur §10.3), pour les huit questions du pont Tour × moteur — une décision, pas un contournement. /llms-full.txt est la treizième (C27) : la checklist et les termes y impriment les quinze questions.",
  },
  // Le jeu (plan §3.4). Chaque module de texte du jeu a sa ligne dès qu'une
  // route l'atteint : l'encart du résultat depuis G5b, le texte du niveau
  // depuis que son image de partage l'atteint (G4b).
  {
    module: "content/game/entry.ts",
    max: 1,
    why: "L'encart du jeu sur la page de résultat (chantier G5b) : `r/[id]/page.tsx` seule le résout et n'en passe que les chaînes. Atteint ailleurs, il partirait dans une fonction de plus.",
  },
  {
    module: "content/game/meta.ts",
    max: 7,
    why: "Titres, descriptions, intro des niveaux : le hub, les deux pages de niveau, leurs trois images OG (chantier G4b), et /llms.txt quand le jeu est ouvert (C27). Pas le sitemap, qui ne lit que des chemins et des dates. 5 avant le niveau 2 (A12.f, 2026-10-01).",
  },
  {
    module: "content/game/hub.ts",
    max: 4,
    why: "Le hub, les deux pages de niveau dont la navigation des zones reprend les cinq questions, et l'image de partage du hub qui dessine les cinq zones (chantier G4b). Écart au plan (qui disait 1) : une seconde copie des zones dériverait. Les images des NIVEAUX ne l'atteignent pas, et ne doivent pas.",
  },
  {
    module: "content/game/retention.ts",
    max: 4,
    why: "Les 49 Ko de texte du niveau 1 : sa page (îlot, G8a) et son image de partage, qui reprend les libellés du dashboard (G4b) ; et, depuis A12.f (2026-10-01), la page et l'image du niveau 2, dont la copie reprend par référence ce que le niveau 1 dit de toute année (A12.c). Jamais l'image du hub.",
  },
  {
    module: "content/game/acquisition.ts",
    max: 2,
    why: "Le texte du niveau 2 (A12.c) : sa page et son image de partage, rien d'autre. Jamais la page ni l'image du niveau 1 : leurs entrées ne lui demandent rien (game-level-share-text.ts reçoit le niveau en paramètre).",
  },
];

describe("fan-in de contenu côté serveur (le coût se compte par route)", () => {
  it("le balayage trouve bien des points d'entrée — sinon tout ce qui suit passe à vide", () => {
    expect(ENTRY_POINTS.length).toBeGreaterThanOrEqual(30);
    expect(ENTRY_POINTS).toContain("app/[locale]/glossary/[term]/page.tsx");
  });

  it("chaque module de contenu volumineux reste dans son budget de routes", () => {
    for (const { module, max, why } of BUDGETS) {
      expect(BY_PATH.has(module), `${module} introuvable — déplacé ou renommé ?`).toBe(true);
      const reachers = reachersOf(module);
      expect(reachers.length, `${module} — ${why}\nAtteint par :\n  ${reachers.join("\n  ")}`).toBeLessThanOrEqual(max);
      // Non-vacuité : un budget sur un module que plus personne n'atteint ne
      // prouve rien. Chaque module listé doit être rendu quelque part.
      expect(reachers.length, `${module} n'est plus atteint par aucune route`).toBeGreaterThan(0);
    }
  });

  it("le module JSON-LD, traversé par toutes les pages de contenu, ne tire aucun contenu propre à une page", () => {
    // La leçon de `CRUMBS` : un helper partagé reçoit les données de la page
    // en PARAMÈTRE. Dès qu'il les importe lui-même, son poids se multiplie
    // par le nombre de routes qui le traversent. `glossary-terms` (12 Ko,
    // terme + définition courte) et `about` (le nœud Person) sont les deux
    // seules exceptions : les schémas les émettent sur chaque page.
    const jsonld = BY_PATH.get("lib/seo/jsonld.tsx");
    expect(jsonld, "lib/seo/jsonld.tsx introuvable").toBeDefined();
    const pulled = valueImports(jsonld!)
      .map((spec) => resolveSpecifier("lib/seo/jsonld.tsx", spec))
      .filter((p): p is string => !!p && p.startsWith("content/"));
    expect(pulled.sort()).toEqual(["content/about.ts", "content/antoine-credit.ts", "content/glossary-terms.ts"]);
  });
});
