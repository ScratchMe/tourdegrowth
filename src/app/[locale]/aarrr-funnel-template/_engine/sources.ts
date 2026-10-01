import type { MetricShape } from "@/lib/engine/catalog-shape";
import type { EngineStrings } from "@/lib/engine/strings";
import type { Currency, ToolId } from "@/lib/engine/types";
import type { SourceChoice } from "./sheet-draft";
import type { SelectOption, SelectOptionGroup } from "@/components/core/Select";

/**
 * Every tool, in the order the « Autres outils » list shows them. A `Record`
 * that `satisfies` every `ToolId`, read by its keys: a tool added to the type
 * is a compile error here, not a tool this list forgets — the gap Pipedrive
 * and the customer-success platform fell into, never offered under « Autres
 * outils » until A14 T0 (engine spec §19.0).
 */
const TOOL_ORDER = {
  ga4: true,
  mixpanel: true,
  amplitude: true,
  posthog: true,
  stripe: true,
  chargebee: true,
  chartmogul: true,
  hubspot: true,
  salesforce: true,
  pipedrive: true,
  "google-ads": true,
  "meta-ads": true,
  "linkedin-ads": true,
  "app-store-connect": true,
  "play-console": true,
  "product-db": true,
  spreadsheet: true,
  "cs-platform": true,
} as const satisfies Record<ToolId, true>;
export const ALL_TOOLS = Object.keys(TOOL_ORDER) as ToolId[];

/**
 * The "where does it come from?" list (§7 E3): the tools this number is
 * usually found in first, then "someone gave it to me" and "other", then
 * every other tool under its own heading — offered, not hidden, because a
 * team that reads its sign-up rate in Amplitude is not wrong, only unusual.
 */
export function sourceOptions(
  shape: MetricShape,
  strings: EngineStrings,
): (SelectOption<Exclude<SourceChoice, "">> | SelectOptionGroup<Exclude<SourceChoice, "">>)[] {
  const usual = shape.sources.map((tool) => ({ value: `tool:${tool}` as const, label: strings.tools[tool] }));
  const rest = ALL_TOOLS.filter((tool) => !shape.sources.includes(tool)).map((tool) => ({
    value: `tool:${tool}` as const,
    label: strings.tools[tool],
  }));
  return [
    ...usual,
    { value: "person", label: strings.source.someoneTold },
    { value: "other", label: strings.source.other },
    ...(rest.length ? [{ label: strings.workbench.otherTools, options: rest }] : []),
  ];
}

/** "€" / "$" / "£" / "CHF" — the symbol the reader's language writes, shown in an amount box, never typed. */
export function currencySymbol(currency: Currency, locale: "en" | "fr"): string {
  const part = new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", { style: "currency", currency })
    .formatToParts(0)
    .find((p) => p.type === "currency");
  return part?.value ?? currency;
}

/**
 * Where a NumberField's unit goes and what a screen reader hears for it
 * (design system extension 04, NumberField: the caller places the unit by
 * language). The sign sits inside the box and is hidden from screen readers;
 * `unitName` is what they hear instead — taken from `Intl`, so no word of it
 * is copy to write or to review.
 */
export interface NumberUnit {
  prefix?: string;
  suffix?: string;
  unitName?: string;
}

const intlLocale = (locale: "en" | "fr") => (locale === "fr" ? "fr-FR" : "en-GB");

/** "%" in English, "30 %" with its no-break space in French: the unit carries its own space, the box adds none (C28). */
export function percentUnit(locale: "en" | "fr"): NumberUnit {
  return { suffix: locale === "fr" ? "\u00a0%" : "%", unitName: unitWord("percent", locale) };
}

/**
 * A word that follows the number, after a no-break space, in the number's
 * grammatical number: « 1 jour », « 3 jours », "1 day", "0 days" (A11.1: the
 * engine's own example read « 1 jours »). `Intl.PluralRules` decides, so
 * French's singular below 2 comes with it. Shown, and read as it is shown.
 */
export function wordUnit(words: { one: string; other: string }, locale: "en" | "fr", value: number | null): NumberUnit {
  const word = value !== null && new Intl.PluralRules(intlLocale(locale)).select(value) === "one" ? words.one : words.other;
  return { suffix: `\u00a0${word}`, unitName: word };
}

/**
 * "€26,000" in English, « 26 000 € » in French: the sign where the reader's
 * language writes it, with the space it writes between them — `Intl`'s own
 * literal, a no-break space in French, none before "€" in English. The box
 * adds none (C28, 2026-09-30).
 */
export function moneyUnit(currency: Currency, locale: "en" | "fr"): NumberUnit {
  const parts = new Intl.NumberFormat(intlLocale(locale), { style: "currency", currency }).formatToParts(2);
  const at = parts.findIndex((p) => p.type === "currency");
  const first = at < parts.findIndex((p) => p.type === "integer");
  const beside = parts[first ? at + 1 : at - 1];
  const space = beside?.type === "literal" ? beside.value : "";
  const symbol = currencySymbol(currency, locale);
  const name = new Intl.NumberFormat(intlLocale(locale), { style: "currency", currency, currencyDisplay: "name" })
    .formatToParts(2)
    .find((p) => p.type === "currency")?.value;
  return { ...(first ? { prefix: symbol + space } : { suffix: space + symbol }), unitName: name ?? currency };
}

function unitWord(unit: "percent", locale: "en" | "fr"): string | undefined {
  return new Intl.NumberFormat(intlLocale(locale), { style: "unit", unit, unitDisplay: "long" })
    .formatToParts(2)
    .find((p) => p.type === "unit")?.value;
}
