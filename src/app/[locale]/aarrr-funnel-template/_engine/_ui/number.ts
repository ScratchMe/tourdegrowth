/**
 * Reads what a person types as a number, the way they write it in their
 * language: "26 000" and "26 000" (NBSP, U+202F) and "26’000" in French,
 * "26,000" in English. French writes the decimal with a comma, English with a
 * point — so a comma is a group separator in English and a decimal one in
 * French, and nothing else is guessed. Returns null for anything that is not
 * a finite number once the separators are gone.
 */
export function parseTypedNumber(raw: string, locale: "en" | "fr"): number | null {
  let s = raw.trim().replace(/[\s\u00A0\u202F’']/g, "");
  if (s === "") return null;
  if (locale === "fr") s = s.replace(",", ".");
  else s = s.replace(/,/g, "");
  if (!/^-?\d*\.?\d+$/.test(s) && !/^-?\d+\.?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
