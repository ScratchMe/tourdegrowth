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
