import type { MetricShape } from "@/lib/engine/catalog-shape";
import type { EngineStrings } from "@/lib/engine/strings";
import type { Currency, ToolId } from "@/lib/engine/types";
import type { SourceChoice } from "./sheet-draft";
import type { SelectOption, SelectOptionGroup } from "@/components/core/Select";

const ALL_TOOLS = [
  "ga4",
  "mixpanel",
  "amplitude",
  "posthog",
  "stripe",
  "chargebee",
  "chartmogul",
  "hubspot",
  "salesforce",
  "google-ads",
  "meta-ads",
  "linkedin-ads",
  "app-store-connect",
  "play-console",
  "product-db",
  "spreadsheet",
] as const satisfies readonly ToolId[];

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

/** "%" in English, "30 %" with its no-break space in French. */
export function percentUnit(locale: "en" | "fr"): NumberUnit {
  return { suffix: locale === "fr" ? "\u00a0%" : "%", unitName: unitWord("percent", locale) };
}

/** A word that follows the number ("days" / « jours »): shown, and read as it is shown. */
export function wordUnit(word: string): NumberUnit {
  return { suffix: word, unitName: word };
}

/** "€26,000" in English, « 26 000 € » in French: the sign where the reader's language writes it. */
export function moneyUnit(currency: Currency, locale: "en" | "fr"): NumberUnit {
  const parts = new Intl.NumberFormat(intlLocale(locale), { style: "currency", currency }).formatToParts(2);
  const first = parts.findIndex((p) => p.type === "currency") < parts.findIndex((p) => p.type === "integer");
  const symbol = currencySymbol(currency, locale);
  const name = new Intl.NumberFormat(intlLocale(locale), { style: "currency", currency, currencyDisplay: "name" })
    .formatToParts(2)
    .find((p) => p.type === "currency")?.value;
  return { ...(first ? { prefix: symbol } : { suffix: symbol }), unitName: name ?? currency };
}

function unitWord(unit: "percent", locale: "en" | "fr"): string | undefined {
  return new Intl.NumberFormat(intlLocale(locale), { style: "unit", unit, unitDisplay: "long" })
    .formatToParts(2)
    .find((p) => p.type === "unit")?.value;
}
