import type { Translatable } from "@/lib/i18n/translatable";

/**
 * The checks of GAME-BRIEF §7.1 série C that hold for every level's copy —
 * one implementation, so level 2 is held to exactly level 1's rules
 * (`game-retention.test.ts`, `game-acquisition.test.ts`). Not a test file:
 * its name has no `.test`, so Vitest only runs it through its importers.
 */

export type Leaf = { path: string; value: Translatable };

/** Every translatable of the tree, with its dotted path. A bare string anywhere is a failure of its own (C2). */
export function walk(node: unknown, path = "", leaves: Leaf[] = [], bare: string[] = []): { leaves: Leaf[]; bare: string[] } {
  if (typeof node === "string") {
    bare.push(path);
  } else if (Array.isArray(node)) {
    node.forEach((child, i) => walk(child, path ? `${path}.${i}` : String(i), leaves, bare));
  } else if (node !== null && typeof node === "object") {
    const record = node as Record<string, unknown>;
    const keys = Object.keys(record);
    if (keys.length === 2 && typeof record.fr === "string" && typeof record.en === "string") {
      leaves.push({ path, value: record as Translatable });
    } else {
      for (const key of keys) walk(record[key], path ? `${path}.${key}` : key, leaves, bare);
    }
  }
  return { leaves, bare };
}

export function sorted(values: Iterable<string>): string[] {
  return [...values].sort();
}

// ---------------------------------------------------------------------------
// C3, C9 — the cards describe, they never judge (brief §5.5).
// ---------------------------------------------------------------------------

/** Word boundaries that understand accents: JavaScript's \b does not, even with the u flag. */
const word = (alternatives: string) => new RegExp(`(?<![\\p{L}])(?:${alternatives})(?![\\p{L}])`, "iu");

const FORBIDDEN = {
  fr: word("lente?s?|rapides?|efficaces?|honnêtes?|astuces?|faux|fausses?|pièges?|certains partiront|ils n'existent pas"),
  en: word("slow(?:ly)?|fast|quick(?:ly)?|effective|efficient|honest|tricks?|fake|traps?|some will leave|(?:don't|do not) exist"),
};
const PERCENT = /%/;
/** A signed number: + − or - right before a digit, not inside a word like « e-mail » or « L215-1-1 ». */
const SIGNED = /(?<![\p{L}\d])[+\-−]\s?\d/u;

export function judgementIn(text: string, locale: "fr" | "en"): string | null {
  if (PERCENT.test(text)) return "a percentage";
  if (SIGNED.test(text)) return "a signed number";
  const hit = text.match(FORBIDDEN[locale]);
  return hit ? `the word « ${hit[0]} »` : null;
}

// ---------------------------------------------------------------------------
// C6 — real brands, only in the catalogue's cases (brief §8.3).
// ---------------------------------------------------------------------------

export const CAPITALISED = /(?<![\p{L}'-])\p{Lu}[\p{L}'’.-]*\p{L}|(?<![\p{L}'-])\p{Lu}/gu;
export const DOMAIN = /\b[a-z]+\.[a-z]{2,}\b/g;

// ---------------------------------------------------------------------------
// C8 — the placeholders are a contract with the island.
// ---------------------------------------------------------------------------

const PLACEHOLDER = /\{([a-zA-Z]+)\}/g;

export function placeholders(text: string): string[] {
  return sorted(new Set([...text.matchAll(PLACEHOLDER)].map((m) => m[1]!)));
}

/** Every regex metacharacter escaped, so a path pattern matches literally except its `*`. */
export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function templatePatternFor(templates: Readonly<Record<string, readonly string[]>>, path: string): string | undefined {
  return Object.keys(templates).find((pattern) =>
    new RegExp(`^${escapeRegExp(pattern).replace(/\\\*/g, "[^.]+")}$`).test(path),
  );
}

/** The same contract `format.ts#fill` enforces: every placeholder must be supplied. */
export function fillStrict(template: string, vars: Record<string, string>): string {
  return template.replace(PLACEHOLDER, (_, name: string) => {
    if (!(name in vars)) throw new Error(`no value for {${name}}`);
    return vars[name]!;
  });
}

/** Every template's problems against the contract: undeclared, a missing value, a brace left over. */
export function templateProblems(leaves: Leaf[], templates: Readonly<Record<string, readonly string[]>>): string[] {
  const problems: string[] = [];
  for (const { path, value } of leaves.filter(({ value }) => value.fr.includes("{") || value.en.includes("{"))) {
    const pattern = templatePatternFor(templates, path);
    if (!pattern) {
      problems.push(`${path}: not a declared template`);
      continue;
    }
    const vars = Object.fromEntries(templates[pattern]!.map((name) => [name, "X"]));
    for (const locale of ["fr", "en"] as const) {
      try {
        const filled = fillStrict(value[locale], vars);
        if (/[{}]/.test(filled)) problems.push(`${path} ${locale}: a brace survives filling`);
      } catch (err) {
        problems.push(`${path} ${locale}: ${(err as Error).message}`);
      }
    }
  }
  return problems;
}

// ---------------------------------------------------------------------------
// C10 — the decimal separator of the right language (La Bataille's « −1.0 Md€ »).
// ---------------------------------------------------------------------------

export const FR_POINT = /\d\.\d/;
/** A comma between digits that is not a thousands separator (followed by exactly three digits). */
export const EN_COMMA = /\d,(?!\d{3}(?!\d))\d/;
