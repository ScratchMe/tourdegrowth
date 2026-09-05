import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALE_COOKIE, isLocale, resolveLocale } from "@/lib/i18n/locale";
import { isLocalizableContentPath, localePath, splitLocalePath } from "@/lib/i18n/routes";

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Gate on `/admin/*` (the Firestore-backed growth dashboard, see
 * `lib/submissions/growth-stats.ts`) — SPEC.md never scoped in a user
 * account system, so a full auth system would be overkill for a single
 * operator, but leaving real submission volume/K-factor numbers on an
 * unauthenticated route is a real exposure, not a hypothetical one. HTTP
 * Basic Auth checked against a single password in `ADMIN_DASHBOARD_PASSWORD`
 * (set in `.env.local` locally, in Vercel's project env vars in
 * production) — fails CLOSED if that var isn't configured at all, rather
 * than accidentally leaving the route open in an environment where no one
 * remembered to set it.
 */
export function isAuthorizedForAdmin(request: NextRequest): boolean {
  const expected = process.env.ADMIN_DASHBOARD_PASSWORD;
  if (!expected) return false;

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;

  let decoded: string;
  try {
    decoded = atob(header.slice("Basic ".length));
  } catch {
    return false;
  }
  // "user:password" — username is ignored (a single shared password is
  // enough for a single-operator dashboard); split on the FIRST colon only,
  // so a password containing ":" isn't truncated.
  const password = decoded.slice(decoded.indexOf(":") + 1);
  return password === expected;
}

function unauthorizedResponse(): NextResponse {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Tour de Growth admin"' },
  });
}

/**
 * The header the root layout reads to know the request's language — REVIEW.md
 * R-13. It exists because `<html lang>` lives in the root layout, which
 * cannot see the URL: without this, `/fr/glossary/cac` would be served with
 * whatever `lang` the visitor's cookie happened to say.
 */
export const LOCALE_HEADER = "x-tdg-locale";

/**
 * Resolves `?lang=` into the locale cookie, per SPEC.md §5/§8 ("`?lang=`
 * prioritaire dans l'URL"), AND resolves the request's effective locale for
 * everything downstream (R-13).
 *
 * Priority: a locale prefix in the URL wins outright — on a localized page
 * the address IS the language, and a stale cookie must never override it.
 * Everywhere else (app pages, which carry no prefix) the old order applies:
 * `?lang=` > cookie > `Accept-Language`.
 *
 * Content URLs published before R-13 (`/`, `/how-it-works`, `/glossary/...`)
 * are redirected 308 to their localized form, so nothing already linked or
 * indexed breaks.
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
  if (request.nextUrl.pathname.startsWith("/admin") && !isAuthorizedForAdmin(request)) {
    return unauthorizedResponse();
  }

  const { pathname } = request.nextUrl;
  const queryLang = request.nextUrl.searchParams.get("lang");
  const fromUrl = splitLocalePath(pathname);

  const locale =
    fromUrl?.locale ??
    resolveLocale({
      queryLang,
      cookieLocale: request.cookies.get(LOCALE_COOKIE)?.value ?? null,
      acceptLanguage: request.headers.get("accept-language"),
    });

  // A pre-R-13 content URL: send it to its localized address, query string
  // intact (a shared `/?ref=<id>` must still carry its referral through).
  if (!fromUrl && isLocalizableContentPath(pathname)) {
    const target = request.nextUrl.clone();
    target.pathname = localePath(locale, pathname);
    return NextResponse.redirect(target, 308);
  }

  // A locale prefix in the URL is as explicit a choice as `?lang=`, so it is
  // persisted the same way — otherwise a reader who switched to French and
  // then pressed "Démarre ton Tour" would land on an English questionnaire,
  // since `/quiz` carries no prefix of its own.
  const explicitChoice = fromUrl?.locale ?? (isLocale(queryLang) ? queryLang : null);
  if (explicitChoice) {
    request.cookies.set(LOCALE_COOKIE, explicitChoice);
  }

  // The root layout can't read the URL, so hand it the answer.
  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, locale);

  const response = NextResponse.next({ request: { headers } });

  if (explicitChoice) {
    response.cookies.set(LOCALE_COOKIE, explicitChoice, {
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
