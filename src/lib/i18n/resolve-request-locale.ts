import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, resolveLocale, type Locale } from "./locale";

/**
 * Resolves the request's locale from Server Components/`generateMetadata`
 * (cookie set by the proxy from `?lang=`, then `Accept-Language`, then the
 * default — see `resolveLocale`). Was duplicated verbatim across
 * `not-found.tsx`, `/r/sample`'s branch of `r/[id]/page.tsx`, and
 * `/how-it-works` before the glossary pages (SPEC-ADDENDUM-02.md §3.1)
 * added two more call sites — consolidated here rather than copied a
 * fourth and fifth time.
 */
export async function resolveRequestLocale(): Promise<Locale> {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
  return resolveLocale({
    queryLang: null,
    cookieLocale: cookieStore.get(LOCALE_COOKIE)?.value ?? null,
    acceptLanguage: headerList.get("accept-language"),
  });
}
