/**
 * Helpers shared by `engine-catalog.test.ts` and `engine-copy.test.ts`, so the
 * two files cannot disagree on what a placeholder is or which glyphs a slide
 * can print. Not a test file itself (vitest only collects `*.test.ts`).
 */

/** `{name}` tokens of a template, sorted and deduplicated. */
export function placeholdersOf(template: string): string[] {
  return [...new Set([...template.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!))].sort();
}

/** Replaces every `{name}` for which a value is given; unknown ones stay, so a test can see them. */
export function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => values[name] ?? whole);
}

/**
 * Engine spec §10.4, measured in Chromium on the build: Stardos Stencil, Inter
 * and IBM Plex Mono all carry printable Latin-1 (which includes « » · × ÷ ±
 * and U+00A0) plus – — ’ … €. Anything else — an arrow, "≈", "≤", "✓", the
 * minus sign U+2212, a superscript « ʳᵉ », the narrow no-break space U+202F —
 * is missing from at least one of them and prints as an empty box on a slide.
 */
const ALLOWED = /^[ -~ -ÿ–—’…€]$/u;

/** The characters of `text` a slide cannot print, each listed once. */
export function glyphOffenders(text: string): string[] {
  return [...new Set([...text].filter((ch) => !ALLOWED.test(ch)))].map(
    (ch) => `${ch} (U+${ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")})`,
  );
}
