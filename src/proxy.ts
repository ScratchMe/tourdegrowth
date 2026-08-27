import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n/locale";

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Resolves `?lang=` into the locale cookie, per SPEC.md §5/§8 ("`?lang=`
 * prioritaire dans l'URL"). Runs before every page request so the root
 * layout renders the right language on the very first response — no
 * client-side flash of the wrong locale.
 *
 * Named `proxy` (not `middleware`) — Next.js 16 renamed the file convention;
 * `middleware.ts` / `export function middleware` are silently ignored now.
 *
 * The tricky bit: a cookie set on the outgoing response is not visible to
 * `cookies()` in Server Components rendered for *this same* request — it
 * only takes effect on the *next* request. So when `?lang=` is present we
 * also rewrite the incoming request's Cookie header (via `request.cookies`)
 * and forward those headers into `NextResponse.next()`, which is the
 * documented way to make a proxy-set cookie visible immediately downstream
 * in the same request.
 */
export function proxy(request: NextRequest) {
  const queryLang = request.nextUrl.searchParams.get("lang");

  if (isLocale(queryLang)) {
    request.cookies.set(LOCALE_COOKIE, queryLang);
  }

  const response = NextResponse.next({ request: { headers: request.headers } });

  if (isLocale(queryLang)) {
    response.cookies.set(LOCALE_COOKIE, queryLang, {
      path: "/",
      maxAge: ONE_YEAR,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
