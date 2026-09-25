import type { Locale } from "./locale";
import { DEFAULT_LOCALE } from "./locale";

/** A piece of UI copy provided in both supported languages. */
export type Translatable = Record<Locale, string>;

/**
 * `tc` = "translate content": picks the string for the active locale.
 *
 * In its own module since REVIEW-02.md R2-14. It used to live next to
 * `UI_STRINGS` in `dictionary.ts`, so any Client Component that imported
 * `tc` to translate a prop it was handed also shipped the entire bilingual
 * dictionary to the browser — the glossary "?" trigger and the question
 * text did exactly that. Client code that only translates should import
 * from HERE; `dictionary.ts` re-exports both names so server code needn't
 * change.
 */
export function tc(entry: Translatable, locale: Locale): string {
  return entry[locale] ?? entry[DEFAULT_LOCALE];
}

/**
 * The shape of a bilingual tree once a language is picked: every
 * `{ en, fr }` leaf becomes a `string`, everything else keeps its shape.
 * Arrays stay arrays, numbers and booleans stay what they are.
 *
 * Any object carrying a string `en` AND a string `fr` counts as a leaf — the
 * same rule `copy-typography.test.ts` uses to tell French from English, so
 * the type, the runtime and the typography scan cannot disagree on what a
 * translatable is.
 */
export type Resolved<T> = T extends { en: string; fr: string }
  ? string
  : T extends string | number | boolean | null | undefined
    ? T
    : T extends readonly (infer U)[]
      ? Resolved<U>[]
      : { [K in keyof T]: Resolved<T[K]> };

function isTranslatableLeaf(value: object): value is Translatable {
  const record = value as Record<string, unknown>;
  return typeof record.en === "string" && typeof record.fr === "string";
}

/**
 * Resolves a whole content tree to one language, recursively — engine spec
 * §4.4. A Server Component calls it once and hands the result to a client
 * island as props, so the island never imports the bilingual module and
 * never ships the other language to the browser.
 *
 * Pure: builds new objects and arrays, never mutates the tree it reads —
 * content modules are shared by every render of every page.
 */
export function resolveTree<T>(tree: T, locale: Locale): Resolved<T> {
  return resolveNode(tree, locale) as Resolved<T>;
}

function resolveNode(node: unknown, locale: Locale): unknown {
  if (node === null || typeof node !== "object") return node;
  if (Array.isArray(node)) return node.map((child) => resolveNode(child, locale));
  if (isTranslatableLeaf(node)) return tc(node, locale);
  return Object.fromEntries(Object.entries(node).map(([key, child]) => [key, resolveNode(child, locale)]));
}
