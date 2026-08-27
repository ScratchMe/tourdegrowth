/**
 * Locale resolution — pure, framework-agnostic logic shared by the Edge
 * middleware (query param → cookie) and the root layout (cookie/header →
 * initial render). Kept dependency-free on purpose so it is trivially unit
 * testable without mocking Next.js request/response objects.
 */

export type Locale = "en" | "fr";

export const LOCALES: readonly Locale[] = ["en", "fr"];
export const DEFAULT_LOCALE: Locale = "en";

/** Name of the cookie that persists the user's resolved locale across visits. */
export const LOCALE_COOKIE = "tdg_locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "fr";
}

/**
 * Picks a locale out of an `Accept-Language` header's first entry.
 * Anything unrecognized (or absent) falls back to {@link DEFAULT_LOCALE}.
 */
export function parseAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  const primary = header.split(",")[0]?.trim().slice(0, 2).toLowerCase();
  return isLocale(primary) ? primary : DEFAULT_LOCALE;
}

/**
 * Resolves the effective locale for a request.
 * Priority, per SPEC.md §5 / §8: `?lang=` in the URL, then the persisted
 * cookie (previous visit), then browser `Accept-Language`, then the default.
 */
export function resolveLocale(params: {
  queryLang?: string | null;
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  if (isLocale(params.queryLang)) return params.queryLang;
  if (isLocale(params.cookieLocale)) return params.cookieLocale;
  return parseAcceptLanguage(params.acceptLanguage);
}
