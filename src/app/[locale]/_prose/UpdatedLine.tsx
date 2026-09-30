import { MetaLabel } from "@/components/brand/MetaLabel";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { formatLongDate } from "@/lib/i18n/format-date";
import type { Locale } from "@/lib/i18n/locale";

/**
 * « Dernière mise à jour : 24 septembre 2026 » — the date line of the
 * articles and the glossary terms (GEO audit, A8.2, 2026-09-30).
 *
 * The audit found every one of these pages dated in its JSON-LD and its
 * sitemap entry, and none dated on the page: a reader, or an answer engine
 * quoting the page, had no way to tell a definition revised last week from
 * one written a year ago. The legal pages already printed this line; it is
 * the same line, in the same `MetaLabel`, with the day in a `<time>` so the
 * machine-readable value sits next to the one people read.
 *
 * `isoDay` is always the value the JSON-LD and the sitemap carry
 * (`content/updated-at.ts`), never a second copy. Kept out of
 * `src/components/` on purpose: it is page assembly, not a design-system
 * piece, and a new component there would need a design-sync preview.
 */
export function UpdatedLine({ locale, isoDay }: { locale: Locale; isoDay: string }) {
  return (
    <MetaLabel size="xs" uppercase={false} data-testid="updated-line">
      {tc(UI_STRINGS.prosePage.updatedAt, locale)} <time dateTime={isoDay}>{formatLongDate(isoDay, locale)}</time>
    </MetaLabel>
  );
}
