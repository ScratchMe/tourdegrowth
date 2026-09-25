import type { EngineStrings } from "./strings";
import type { Currency, EngineCalcContext, Interval, YearMonth } from "./types";

/**
 * format.ts — the honesty line (engine spec §6.2).
 *
 * ONE function per kind of number, used by the board, the slides and the
 * text export alike, so the same figure can never be printed two ways — the
 * failure the CODIR prototype showed ("+2 à +3 k€" in a title over
 * "+1 400 à +2 600 €" in its body). Words come in as arguments (the
 * `units` and `grammar` slices of the resolved copy); nothing here reads
 * content, and nothing reads the clock.
 *
 * Rounding happens ONCE, in the `round*` functions, and `Intl` only prints
 * the already-rounded value. That is what lets `impact.ts` build its "what
 * if" chain from the numbers the reader actually sees: `roundDisplay(18.04)`
 * is the 18 printed on screen, not a value Intl rounded on its own terms.
 *
 * Glyphs (§10.4): French `Intl` groups digits with U+202F, which Stardos
 * Stencil and IBM Plex Mono don't carry — it would print as a hole on a
 * slide. Every output is normalised to U+00A0, and U+2212 (the minus some
 * locales use) to "-". A test sweeps outputs from 10⁻⁴ to 10⁷ for any glyph
 * outside the fonts' whitelist.
 */

export type Locale = EngineCalcContext["locale"];
export type UnitWords = EngineStrings["units"];
export type GrammarWords = EngineStrings["grammar"];

const NBSP = " ";

function intlLocale(locale: Locale): string {
  return locale === "fr" ? "fr-FR" : "en-US";
}

/** The two glyph substitutions every output goes through (see header). */
function normalise(s: string): string {
  return s.replace(/ /g, NBSP).replace(/−/g, "-");
}

/** Fills `{name}` placeholders; an unknown placeholder is left as written, so a missing value shows instead of vanishing. */
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => (name in values ? String(values[name]) : whole));
}

// --- Rounding: the one place a number loses precision -----------------------

/**
 * `digits` significant digits, half away from zero, on the number AS
 * WRITTEN; 0 stays 0. `toPrecision` is not enough: 3.15 is stored as
 * 3.1499…, so it prints "3.1" — and a reader who checks the slide with a
 * calculator rounds 3.15 to 3.2. The relative nudge (10⁻¹²) is far below any
 * figure this engine can carry and far above binary representation error.
 */
export function roundSignificant(v: number, digits = 2): number {
  if (v === 0 || !Number.isFinite(v)) return v;
  const shift = digits - 1 - Math.floor(Math.log10(Math.abs(v)));
  const scaled = Math.abs(v) * 10 ** shift;
  const whole = Math.round(scaled * (1 + 1e-12));
  // Divide by an exact power of ten, or multiply by one: never by an inexact 0.01.
  const magnitude = shift >= 0 ? whole / 10 ** shift : whole * 10 ** -shift;
  return Math.sign(v) * magnitude;
}

/**
 * What a displayed rate or plain ratio stands for (§6.2): an integer from 10
 * up, two significant digits below — "18 %", "3,2 %", "0,42 %". With
 * `noDecimals` (a cohort under 100 sign-ups, §6.2 "petits effectifs"), an
 * integer at every size: each sign-up weighs more than a point, so a
 * decimal would claim a precision the count doesn't have.
 */
export function roundDisplay(v: number, opts: { noDecimals?: boolean } = {}): number {
  if (opts.noDecimals || Math.abs(v) >= 10) return Math.round(v);
  return roundSignificant(v, 2);
}

/** A money amount as the user typed it: kept to the cent. */
export function roundMoney(v: number): number {
  return Math.round(v * 100) / 100;
}

// --- Plain numbers -----------------------------------------------------------

function printNumber(v: number, locale: Locale, maximumFractionDigits = 10): string {
  // `+ 0` turns -0 into 0: "-0" is not a number anyone should read.
  return normalise(new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits }).format(v + 0));
}

/** Grouped, at most two decimals: counts and amounts as entered. */
export function formatNumber(v: number, locale: Locale): string {
  return printNumber(Math.round(v * 100) / 100, locale);
}

/** A rate in percent: "25 %" (U+00A0 before the sign) in French, "25%" in English. */
export function formatPercent(v: number, locale: Locale, opts: { noDecimals?: boolean } = {}): string {
  return printNumber(roundDisplay(v, opts), locale) + percentSuffix(locale);
}

function percentSuffix(locale: Locale): string {
  return locale === "fr" ? `${NBSP}%` : "%";
}

/** A plain ratio (the viral coefficient K, LTV:CAC): same significant-digit rule as a rate, no sign. */
export function formatRatio(v: number, locale: Locale): string {
  return printNumber(roundDisplay(v), locale);
}

/** An amount as entered, grouped: "21 000 €" / "€21,000"; cents only when there are some. */
export function formatMoney(v: number, currency: Currency, locale: Locale): string {
  const rounded = roundMoney(v);
  const fractionDigits = Number.isInteger(rounded) ? 0 : 2;
  return normalise(
    new Intl.NumberFormat(intlLocale(locale), {
      style: "currency",
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(rounded + 0),
  );
}

/** A derived amount: two significant digits and "~" — "~600 €", "~6 300 €". */
export function formatApproxMoney(v: number, currency: Currency, locale: Locale, words: UnitWords): string {
  return fillTemplate(words.approx, { n: formatMoney(roundSignificant(v, 2), currency, locale) });
}

/** An upstream volume: two significant digits and "~" — "~3 200". */
export function formatApproxNumber(v: number, locale: Locale, words: UnitWords): string {
  return fillTemplate(words.approx, { n: printNumber(roundSignificant(v, 2), locale) });
}

// --- Ranges ------------------------------------------------------------------

/** Two formatted bounds, or one when they print the same (§6.2 "égales après arrondi ⇒ une seule valeur"). */
function range(lo: string, hi: string, words: UnitWords): string {
  return lo === hi ? lo : fillTemplate(words.range, { lo, hi });
}

/**
 * An interval in the metric's unit. A percent range carries its sign once
 * ("6 à 9 %", "6–9%"); a money range repeats the currency on each bound
 * ("21 000 € à 25 000 €"), which is how amounts are read aloud.
 */
export function formatInterval(
  i: Interval,
  unit: "percent" | "money" | "ratio" | "duration" | "text" | "choice",
  ctx: EngineCalcContext,
  words: UnitWords,
  opts: { currency?: Currency; noDecimals?: boolean } = {},
): string {
  const { locale } = ctx;
  switch (unit) {
    case "percent": {
      const lo = printNumber(roundDisplay(i.lo, opts), locale);
      const hi = printNumber(roundDisplay(i.hi, opts), locale);
      return range(lo, hi, words) + percentSuffix(locale);
    }
    case "money": {
      const currency = opts.currency ?? "EUR";
      return range(formatMoney(i.lo, currency, locale), formatMoney(i.hi, currency, locale), words);
    }
    case "ratio":
      return range(formatRatio(i.lo, locale), formatRatio(i.hi, locale), words);
    case "duration":
      return formatDurationInterval(i, "days", ctx, words);
    default:
      // A text or a choice has no interval: asking for one is a caller's bug, not a value to print.
      throw new Error(`formatInterval: a ${unit} metric has no numeric value`);
  }
}

/** An approximate count range: "~49 à 74" is written by the template; this gives "49 à 74". */
export function formatCountInterval(i: Interval, ctx: EngineCalcContext, words: UnitWords): string {
  return range(printNumber(Math.round(i.lo), ctx.locale), printNumber(Math.round(i.hi), ctx.locale), words);
}

/** A derived amount range, each bound at two significant digits, one "~" for the whole: "~490 à 740 €". */
export function formatApproxMoneyInterval(i: Interval, currency: Currency, ctx: EngineCalcContext, words: UnitWords): string {
  const lo = formatMoney(roundSignificant(i.lo, 2), currency, ctx.locale);
  const hi = formatMoney(roundSignificant(i.hi, 2), currency, ctx.locale);
  return fillTemplate(words.approx, { n: range(lo, hi, words) });
}

// --- Durations -----------------------------------------------------------------

function roundDuration(v: number): number {
  // "entier + unité" — but a positive duration never prints as 0.
  const whole = Math.round(v);
  return whole === 0 && v > 0 ? roundSignificant(v, 1) : whole;
}

const DURATION_KEYS = {
  days: ["days", "daysOne"],
  hours: ["hours", "hoursOne"],
  months: ["months", "monthsOne"],
} as const;

/** "3 jours", "1 jour", "4 mois" — the singular key when the printed number is exactly 1. */
export function formatDuration(v: number, unit: "days" | "hours" | "months", ctx: EngineCalcContext, words: UnitWords): string {
  const n = roundDuration(v);
  const [plural, one] = DURATION_KEYS[unit];
  return n === 1 ? words[one] : fillTemplate(words[plural], { n: printNumber(n, ctx.locale) });
}

/** "1 à 3 jours" / "1–3 days": one unit for the whole range. */
export function formatDurationInterval(i: Interval, unit: "days" | "hours" | "months", ctx: EngineCalcContext, words: UnitWords): string {
  const lo = roundDuration(i.lo);
  const hi = roundDuration(i.hi);
  if (lo === hi) return formatDuration(i.lo, unit, ctx, words);
  const [plural] = DURATION_KEYS[unit];
  return fillTemplate(words[plural], { n: range(printNumber(lo, ctx.locale), printNumber(hi, ctx.locale), words) });
}

// --- The peloton's unit: people out of the same 100 sign-ups -----------------

/**
 * A rate read as people out of 100 (§6.2 « Pour 100 »): whole people, per
 * bound — "18", "6 à 9". Under half a person the count would round to a
 * false 0, so it says "fewer than 1 in 100 (4 in 1,000)" instead.
 */
export function formatPerHundredCount(percent: Interval, ctx: EngineCalcContext, words: UnitWords): string {
  if (percent.hi > 0 && percent.hi < 0.5) {
    const perThousand = range(
      printNumber(Math.round(percent.lo * 10), ctx.locale),
      printNumber(Math.round(percent.hi * 10), ctx.locale),
      words,
    );
    return fillTemplate(words.lessThanOnePerHundred, { n: perThousand });
  }
  return formatCountInterval(percent, ctx, words);
}

/** "18 sur 100" / "18 in 100" — or the "fewer than 1 in 100" sentence, which already says "100". */
export function formatPerHundred(percent: Interval, ctx: EngineCalcContext, words: UnitWords): string {
  const count = formatPerHundredCount(percent, ctx, words);
  if (percent.hi > 0 && percent.hi < 0.5) return count;
  return fillTemplate(words.perHundred, { n: count });
}

// --- Dates, lists, case ------------------------------------------------------

/** "juillet 2026" / "July 2026". Read as a calendar month, never shifted by a time zone. */
export function formatMonth(month: YearMonth, locale: Locale): string {
  const [year, m] = month.split("-").map(Number) as [number, number];
  return normalise(
    new Intl.DateTimeFormat(intlLocale(locale), { month: "long", year: "numeric", timeZone: "UTC" }).format(
      new Date(Date.UTC(year, m - 1, 1)),
    ),
  );
}

/**
 * "1er octobre 2026" / "October 1, 2026", from a local calendar date.
 * French writes the first of a month as an ordinal (« le 1er octobre »,
 * never « le 1 octobre »), which Intl doesn't. Plain letters, not the
 * superscript "ᵉʳ": the slides' fonts don't carry it (§10.4).
 */
export function formatDay(date: Date, locale: Locale): string {
  const day = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const text = normalise(
    new Intl.DateTimeFormat(intlLocale(locale), { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(day),
  );
  return locale === "fr" && day.getUTCDate() === 1 ? text.replace(/^1(?=\s)/, "1er") : text;
}

/** "a", "a et b", "a, b et c" — the separators are copy, so English gets no Oxford comma unless the copy adds one. */
export function joinList(items: string[], words: GrammarWords): string {
  if (items.length <= 1) return items[0] ?? "";
  return items.slice(0, -1).join(words.listSeparator) + words.and + items[items.length - 1];
}

/** First letter up, for a phrase that opens a sentence. */
export function capitalise(s: string): string {
  return s.charAt(0).toLocaleUpperCase() + s.slice(1);
}

/** First letter down, for a name used mid-sentence — unless it opens an acronym ("CAC", "ARPA"). */
export function lowerFirst(s: string): string {
  if (s.length > 1 && s.charAt(1) === s.charAt(1).toLocaleUpperCase() && /\p{Lu}/u.test(s.charAt(1))) return s;
  return s.charAt(0).toLocaleLowerCase() + s.slice(1);
}
