/**
 * Reads what a person types as a number, the way they write it in their
 * language: "26 000" and "26 000" (NBSP, U+202F) and "26’000" in French,
 * "26,000" in English. French writes the decimal with a comma, English with a
 * point — so a comma is a group separator in English and a decimal one in
 * French, and nothing else is guessed. Returns null for anything that is not
 * a finite number once the separators are gone.
 */
export function parseTypedNumber(raw: string, locale: "en" | "fr"): number | null {
  let s = raw.trim().replace(/[\s  ’']/g, "");
  if (s === "") return null;
  if (locale === "fr") s = s.replace(",", ".");
  else s = s.replace(/,/g, "");
  if (!/^-?\d*\.?\d+$/.test(s) && !/^-?\d+\.?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/*
 * Grouping AS YOU TYPE (Antoine, 2026-09-26: an MRR of 2 000 000 typed as
 * "2000000" stayed "2000000" on screen, and seven zeros in a row don't read).
 *
 * The rule is narrow on purpose: the field only ever inserts or removes
 * GROUP separators, and rewrites the decimal separator to the language's own.
 * Digits, the sign and the decimal separator — the characters that carry the
 * number — are never added, removed or reordered, which is what makes the
 * caret easy to put back: count them before the caret, find the same count
 * in the new text.
 */

/** What a person may type as a group separator: any space, an apostrophe, and in English the comma. */
const GROUP_CHARS: Record<"en" | "fr", RegExp> = {
  fr: /[\s  ’']/g,
  en: /[\s  ’',]/g,
};

/**
 * What the field writes back. U+00A0 in French, not Intl's U+202F: the same
 * rule as the field's own display of a stored value and as the engine's
 * formatter (§6.2), so a number reads the same typed or reloaded.
 */
const GROUP_OUT: Record<"en" | "fr", string> = { fr: " ", en: "," };
const DECIMAL_OUT: Record<"en" | "fr", string> = { fr: ",", en: "." };

/** The decimal separator `parseTypedNumber` accepts: French takes a comma or a point, English only a point. */
function isDecimalChar(c: string, locale: "en" | "fr"): boolean {
  return locale === "fr" ? c === "," || c === "." : c === ".";
}

/** A character that carries the number — a digit, the sign, the decimal separator — as opposed to grouping. */
function isSignificant(c: string, locale: "en" | "fr"): boolean {
  return (c >= "0" && c <= "9") || c === "-" || isDecimalChar(c, locale);
}

/**
 * The typed text, grouped the way the reader writes it: "2000000" → "2 000 000"
 * (NBSP) in French, "2,000,000" in English. A decimal separator being typed
 * stays ("1234," → "1 234,"): it is half a number, not a mistake to clean up.
 * Text the field cannot read is returned untouched, so the "not a readable
 * number" message is about what the person actually typed.
 */
export function groupTypedNumber(raw: string, locale: "en" | "fr"): string {
  if (parseTypedNumber(raw, locale) === null) return raw;
  const bare = raw.replace(GROUP_CHARS[locale], "");
  const negative = bare.startsWith("-");
  const body = negative ? bare.slice(1) : bare;
  const sep = [...body].findIndex((c) => isDecimalChar(c, locale));
  const whole = sep === -1 ? body : body.slice(0, sep);
  const fraction = sep === -1 ? null : body.slice(sep + 1);
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_OUT[locale]);
  return `${negative ? "-" : ""}${grouped}${fraction === null ? "" : `${DECIMAL_OUT[locale]}${fraction}`}`;
}

/** How many number-carrying characters sit before `caret` in `text`. */
export function significantBefore(text: string, caret: number, locale: "en" | "fr"): number {
  let count = 0;
  for (const c of text.slice(0, Math.max(0, caret))) if (isSignificant(c, locale)) count += 1;
  return count;
}

/**
 * The caret position right after the `count`-th number-carrying character of
 * `text`. `skipGroups` also steps over the separators that follow: a forward
 * delete that removed only a separator would otherwise put the caret back in
 * front of it, and the next Delete would remove the same separator again —
 * forever.
 */
export function caretAfterSignificant(text: string, count: number, locale: "en" | "fr", skipGroups = false): number {
  let i = 0;
  let seen = 0;
  while (i < text.length && seen < count) {
    if (isSignificant(text[i]!, locale)) seen += 1;
    i += 1;
  }
  if (skipGroups) while (i < text.length && !isSignificant(text[i]!, locale)) i += 1;
  return i;
}

/**
 * One keystroke's worth of regrouping: the new text, and where the caret goes
 * so the person keeps typing where they were — not at the end, where a
 * browser leaves it when a field's value is replaced. `caret` is null when
 * the browser gave no selection; it then stays null.
 */
export function regroupTypedNumber(
  raw: string,
  caret: number | null,
  locale: "en" | "fr",
  direction: "backward" | "forward" = "backward",
): { text: string; caret: number | null } {
  const text = groupTypedNumber(raw, locale);
  if (caret === null) return { text, caret: null };
  if (text === raw) return { text, caret };
  return { text, caret: caretAfterSignificant(text, significantBefore(raw, caret, locale), locale, direction === "forward") };
}
