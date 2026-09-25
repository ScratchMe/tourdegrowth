import type { MetricShape } from "@/lib/engine/catalog-shape";
import type { EngineStrings } from "@/lib/engine/strings";
import type { Currency, ToolId } from "@/lib/engine/types";
import type { SourceChoice } from "./sheet-draft";
import type { SelectGroup, SelectOption } from "./_ui/Select";

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
): { options: SelectOption<Exclude<SourceChoice, "">>[]; groups: SelectGroup<Exclude<SourceChoice, "">>[] } {
  const usual = shape.sources.map((tool) => ({ id: `tool:${tool}` as const, label: strings.tools[tool] }));
  const rest = ALL_TOOLS.filter((tool) => !shape.sources.includes(tool)).map((tool) => ({
    id: `tool:${tool}` as const,
    label: strings.tools[tool],
  }));
  return {
    options: [...usual, { id: "person", label: strings.source.someoneTold }, { id: "other", label: strings.source.other }],
    groups: rest.length ? [{ label: strings.workbench.otherTools, options: rest }] : [],
  };
}

/** "€" / "$" / "£" / "CHF" — the symbol the reader's language writes, shown beside an amount box, never typed. */
export function currencySymbol(currency: Currency, locale: "en" | "fr"): string {
  const part = new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", { style: "currency", currency })
    .formatToParts(0)
    .find((p) => p.type === "currency");
  return part?.value ?? currency;
}
