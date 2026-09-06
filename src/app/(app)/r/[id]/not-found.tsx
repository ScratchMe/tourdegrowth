import { NotFoundScreen } from "@/components/brand/NotFoundScreen";
import { UI_STRINGS } from "@/lib/i18n/dictionary";
import { resolveRequestLocale } from "@/lib/i18n/resolve-request-locale";

// Not the DESIGN-BRIEF.md §06c error screen (that's the "calculation
// failed" state, step 9) — this is a plain "no submission at this id"
// 404, e.g. a mistyped or since-deleted result link.
export default async function ResultNotFound() {
  const locale = await resolveRequestLocale();
  const t = UI_STRINGS.result;

  return (
    <NotFoundScreen
      locale={locale}
      eyebrow={t.notFoundEyebrow}
      title={t.notFoundTitle}
      body={t.notFoundBody}
      cta={t.notFoundCta}
    />
  );
}
