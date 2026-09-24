import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
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
 * `import type` n'est pas une arête — TypeScript l'efface.
 */
const SRC = join(process.cwd(), "src");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

const FILES = walk(SRC).map((full) => ({
  path: relative(SRC, full).replaceAll("\\", "/"),
  source: readFileSync(full, "utf8"),
}));
const BY_PATH = new Map(FILES.map((f) => [f.path, f.source]));

/** Les imports qui survivent à la compilation — `import type` est effacé. */
function valueImports(source: string): string[] {
  return [...source.matchAll(/(^|\n)\s*(?:import|export)(\s+type)?\s[^;]*?from\s+["']([^"']+)["']/g)]
    .filter((m) => !m[2])
    .map((m) => m[3]!);
}

function resolveSpecifier(fromPath: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = spec.slice(2);
  else if (spec.startsWith(".")) {
    const dir = fromPath.split("/").slice(0, -1);
    for (const part of spec.split("/")) {
      if (part === ".") continue;
      else if (part === "..") dir.pop();
      else dir.push(part);
    }
    base = dir.join("/");
  } else return null; // un paquet — hors de notre arbre
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
    if (BY_PATH.has(candidate)) return candidate;
  }
  return null;
}

function reachable(entry: string): Set<string> {
  const seen = new Set<string>();
  const queue = [entry];
  while (queue.length) {
    const current = queue.pop()!;
    if (seen.has(current)) continue;
    seen.add(current);
    const source = BY_PATH.get(current);
    if (!source) continue;
    for (const spec of valueImports(source)) {
      const resolved = resolveSpecifier(current, spec);
      if (resolved && !seen.has(resolved)) queue.push(resolved);
    }
  }
  return seen;
}

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
 */
const BUDGETS: { module: string; max: number; why: string }[] = [
  {
    module: "content/glossary-deep.ts",
    max: 1,
    why: "300 Ko de prose longue : seule la page de terme la rend. Elle a été dans six chunks.",
  },
  {
    module: "content/glossary.ts",
    max: 2,
    why: "La copie `extended` : la page de terme la rend, le sitemap lit `updatedAt`. Tout le reste passe par content/glossary-terms.ts.",
  },
  {
    module: "content/legal.ts",
    max: 3,
    why: "Les deux pages légales et le sitemap (qui lit leur `updatedAt`).",
  },
  {
    module: "content/comparisons.ts",
    max: 6,
    why: "Les quatre pages du cluster, /how-it-works qui les liste, le sitemap.",
  },
  // Le moteur de croissance (spec du moteur §10.3) : sa prose ne sert qu'à sa
  // propre page, qui la résout au build et la passe à l'îlot en props.
  // Atteinte par une deuxième route, elle partirait dans une fonction de plus
  // — et comptée par route (VERCEL.md §2.2).
  {
    module: "content/engine-catalog.ts",
    max: 1,
    why: "La prose des quinze chiffres : seule /{locale}/aarrr-funnel-template la rend.",
  },
  {
    module: "content/engine-copy.ts",
    max: 1,
    why: "Toute la copie d'interface du moteur : seule sa page la résout.",
  },
  {
    module: "content/copy-library.ts",
    max: 12,
    why:
      "Les quinze questions du Tour : onze routes les citaient au 2026-09-15 ; la page du moteur est la douzième (spec du moteur §10.3), pour les huit questions du pont Tour × moteur — une décision, pas un contournement.",
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
