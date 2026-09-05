import { headers } from "next/headers";
import { LOCALE_HEADER } from "@/proxy";
import { isLocale, DEFAULT_LOCALE, type Locale } from "./locale";

/**
 * The request's effective locale, as resolved once by the proxy — REVIEW.md
 * R-13.
 *
 * The proxy is the only place that knows the full picture (a locale prefix in
 * the URL beats `?lang=`, which beats the cookie, which beats
 * `Accept-Language`), so it computes the answer and forwards it as a header
 * rather than every page re-deriving it and risking a different result.
 *
 * Localized pages should prefer their own `locale` route param, which is the
 * URL itself; this is for app pages (`/quiz`, `/r/<id>`, …), which carry no
 * prefix, and for `generateMetadata` on either.
 */
export async function resolveRequestLocale(): Promise<Locale> {
  const value = (await headers()).get(LOCALE_HEADER);
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
