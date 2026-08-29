import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n/locale";

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
  if (request.nextUrl.pathname.startsWith("/admin") && !isAuthorizedForAdmin(request)) {
    return unauthorizedResponse();
  }

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
