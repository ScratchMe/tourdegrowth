/**
 * Reaching an element by the LOCAL name of its CSS-module class (`value`,
 * `quiet`, `secondary`…), the one name that is ours, and never by the shape a
 * tool gives that name in production.
 *
 * Why these two functions exist: Next 16.4.0 shortened the class names
 * Turbopack writes (vercel/next.js#97944, "Turbopack: shorten CSS module class
 * names", the pattern `[hash]_[local]`). `Button-module__G1PnAW__quiet` became
 * `G1PnAW_quiet`, with the same hash. Fifty-one specs read the old shape
 * (`[class*="Button-module__"][class*="__quiet"]`, `toHaveClass(/__secondary/)`)
 * and went red with no error but « element(s) not found »; the release notes
 * call it a « Misc Change », and there is no setting to bring the old names
 * back in production (the old ones are kept in dev, where no spec runs).
 *
 * The rule, kept by `src/__tests__/e2e-class-names.test.ts`: no spec reads a
 * module prefix (the file's name in the class), a `__` separator, or an
 * attribute selector on `class` of its own. A spec asks for a local name here,
 * and this file is the only place that knows how a name is written. A shape
 * that comes after this one then changes one function, not sixty selectors.
 *
 * Both functions match a TOKEN that ends in `_<local>`: the old shape
 * (`X-module__hash__value`) and the new one (`hash_value`), and neither
 * `valueLarge` nor `figureValue`, which end in other words.
 */

/** A local class name is a camelCase identifier; anything else would be spliced into a selector. */
function checked(local: string): string {
  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(local)) throw new Error(`moduleClass: "${local}" is not a local class name`);
  return local;
}

/**
 * A CSS selector for the elements carrying the local class `local`: the token
 * is the last one of the attribute, or is followed by another. Compound, so it
 * composes after a tag (`a${moduleClass("link")}`), inside `:not(…)`, and with
 * a parent before it, and it is plain CSS, so `querySelectorAll` takes it too.
 */
export function moduleClass(local: string): string {
  const name = checked(local);
  return `:is([class$="_${name}"], [class*="_${name} "])`;
}

/** The same token as a regular expression, for `toHaveClass`, which tests the whole attribute. */
export function moduleClassRe(local: string): RegExp {
  return new RegExp(`_${checked(local)}(?:\\s|$)`);
}
