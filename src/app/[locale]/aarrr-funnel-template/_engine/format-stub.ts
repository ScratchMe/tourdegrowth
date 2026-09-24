import type { Currency, EngineCalcContext, Interval } from "@/lib/engine/types";
import type { EngineStrings } from "@/lib/engine/strings";
import type { MetricShape } from "@/lib/engine/catalog-shape";

/**
 * P5 STUB — FOR P7 TO REPLACE WITH A RE-EXPORT.
 *
 * The visuals were built in parallel with the pure engine (P1), which owns
 * `src/lib/engine/format.ts` — "one function per kind of number, used by the
 * screen, the slides and the text export" (engine spec §6.2). That module
 * did not exist on this chunk's base, so this file implements the SAME
 * contract signatures (engine-contracts.md, `format.ts`) closely enough to
 * render and screenshot. Integration replaces the body of this file with
 *
 *   export { formatNumber, formatPercent, formatMoney, formatInterval } from "@/lib/engine/format";
 *
 * and nothing else changes: every visual imports from here and nowhere
 * else, so the swap is one file. It is deliberately NOT at the contract's
 * path — an add/add conflict there could keep this stub over P1's tested
 * module without anybody noticing.
 */

/** U+202F is absent from Stardos Stencil and IBM Plex Mono (spec §10.4): always U+00A0. */
const nbsp = (s: string) => s.replace(/[  ]/g, " ");

export function formatNumber(v: number, locale: "en" | "fr"): string {
  return nbsp(new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", { maximumFractionDigits: 2 }).format(v));
}

/** Two significant digits; whole numbers from 10 up (§6.2: 18 %, 3,2 %, 0,42 %). */
function percentDigits(v: number, locale: "en" | "fr"): string {
  const options: Intl.NumberFormatOptions =
    Math.abs(v) >= 10 ? { maximumFractionDigits: 0 } : { maximumSignificantDigits: 2 };
  return nbsp(new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", options).format(v));
}

export function formatPercent(v: number, locale: "en" | "fr"): string {
  return locale === "fr" ? `${percentDigits(v, locale)} %` : `${percentDigits(v, locale)}%`;
}

export function formatMoney(v: number, currency: Currency, locale: "en" | "fr"): string {
  return nbsp(
    new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(v),
  );
}

const fillRange = (template: string, lo: string, hi: string) => template.replace("{lo}", lo).replace("{hi}", hi);

/**
 * A range whose bounds format to the same string collapses to one value
 * (§6.2) — "6 à 9", never "18 à 18". The unit is printed once, after the
 * range: "6 à 9 %", not "6 % à 9 %".
 */
export function formatInterval(
  i: Interval,
  unit: MetricShape["unit"],
  ctx: EngineCalcContext,
  words: EngineStrings["units"],
): string {
  const { locale } = ctx;
  const num = (v: number) => (unit === "percent" ? percentDigits(v, locale) : formatNumber(v, locale));
  const lo = num(i.lo);
  const hi = num(i.hi);
  const body = lo === hi ? lo : fillRange(words.range, lo, hi);
  if (unit === "percent") return locale === "fr" ? `${body} %` : `${body}%`;
  return body;
}

/** "a", "a et b", "a, b et c" — the list grammar of the copy, never string surgery at the call site. */
export function joinList(items: string[], words: EngineStrings["grammar"]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(words.listSeparator)}${words.and}${items[items.length - 1]}`;
}
