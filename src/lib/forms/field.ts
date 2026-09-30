/*
 * The rules a form field follows whatever it holds — design system extension
 * 04 (design/ds-extension-04-return/components/core/Field). Pure, so the
 * components stay thin and the rules are tested once.
 */

/** What a field is saying: nothing, "this cannot be saved as it is", or "still to fill in, saves anyway". */
export type FieldStatus = "invalid" | "missing" | undefined;

/** Invalid blocks the save and missing does not, so when a caller passes both, invalid wins. */
export function fieldStatus({ error, missing }: { error?: unknown; missing?: unknown }): FieldStatus {
  if (error) return "invalid";
  if (missing) return "missing";
  return undefined;
}

/**
 * A one-line field shows its soft-limit count from this share of the limit
 * (extension 04, Q5): a count nobody reads until it matters does not spend a
 * line, and "0/60" on an empty field said nothing. A multi-line field
 * (TextArea) always shows its count. Kept here rather than as a CSS token:
 * no stylesheet could read it.
 */
export const COUNT_REVEAL = 0.8;

export function shouldShowCount(count: number, max: number | undefined): boolean {
  return max !== undefined && count >= Math.ceil(max * COUNT_REVEAL);
}

/**
 * The ids a control is described by, in the order they are read: the message
 * first (it is why the person is back on this field), then the hint, then
 * the count. Empty parts drop out; nothing at all is `undefined`, never "".
 */
export function describedByIds(...ids: (string | undefined | null | false)[]): string | undefined {
  const kept = ids.filter((id): id is string => typeof id === "string" && id !== "");
  return kept.length ? kept.join(" ") : undefined;
}
