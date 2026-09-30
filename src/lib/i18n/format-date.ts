import type { Locale } from "./locale";

/**
 * A calendar day (`"2026-09-30"`) as a long date in the reader's language:
 * « 30 septembre 2026 », "September 30, 2026". Read in UTC on purpose: the
 * value is a day, not an instant, and a build running in another time zone
 * must not print the day before. Pure, so a Server Component and a test get
 * the same string.
 */
export function formatLongDate(isoDay: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${isoDay}T00:00:00Z`),
  );
}
