import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALE_COOKIE, isLocale, resolveLocale } from "@/lib/i18n/locale";
import { isLocalizableContentPath, localePath, splitLocalePath } from "@/lib/i18n/routes";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { GAME_PREVIEW_COOKIE, isGamePath, resolveGameAccess } from "@/lib/game/access";
import { ENGINE_PREVIEW_COOKIE, engineEnvFlag, isEnginePath, resolveEngineAccess } from "@/lib/engine/access";
import { constantTimeEqual } from "@/lib/constant-time";
import {
  OWNER_PREVIEW_PATH,
  PREVIEW_COOKIES,
  PREVIEW_FEATURES,
  hasOwnerPreview,
  ownerPreviewSecret,
  ownerPreviewToken,
  previewAction,
} from "@/lib/owner-preview";

export { constantTimeEqual };

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
    // Browsers send the credentials UTF-8 encoded; `atob` alone yields
    // Latin-1, so a password with an accent could never match (R2-22).
    const binary = atob(header.slice("Basic ".length));
    decoded = new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
  } catch {
    return false;
  }
  // "user:password" — username is ignored (a single shared password is
  // enough for a single-operator dashboard); split on the FIRST colon only,
  // so a password containing ":" isn't truncated.
  const password = decoded.slice(decoded.indexOf(":") + 1);
  return constantTimeEqual(password, expected);
}

/**
 * Read budget on `/r/<id>` — REVIEW-02.md R2-19. Every distinct id is one
 * Firestore read (the per-id cache can't help against a flood of fresh
 * ids), and until now nothing at all limited GETs: a loop over random UUIDs
 * could burn the free tier's daily reads and take every result page down
 * with it. Same in-memory, per-instance limiter as the POST routes (R-15),
 * with the same honesty about what it stops (the naive case) and not (a
 * distributed one).
 *
 * The numbers are deliberately loose, and the window short, because of who
 * else fetches these pages: LinkedIn's, X's and Slack's link unfurlers come
 * from a small set of shared IPs and fetch the page AND its image for every
 * share. A budget tight enough to feel like protection would 429 the very
 * crawler the growth loop depends on. `/r/sample` reads no Firestore and is
 * not counted.
 */
const RESULT_READ_LIMIT = { limit: 120, windowSeconds: 10 * 60 };

export function isResultReadPath(pathname: string): boolean {
  return pathname.startsWith("/r/") && !pathname.startsWith("/r/sample");
}

/**
 * `Vary: Accept-Language` on the one response the proxy authors itself: the
 * 307 that sends `/` (and the 308 of the pre-R-13 content URLs) to `/en` or
 * `/fr`.
 * Where it lands depends on the browser's language, absent `?lang=` or a
 * cookie — Google asks locale-adaptive responses to say so, and it is plain
 * HTTP correctness for any cache on the way (raised by a Search Console
 * "page with redirect" review, 2026-09-06).
 *
 * NOT on the pages that render in the reader's language (`/quiz`, `/r/<id>`,
 * `/deep-dive/<id>`, R-09), although they depend on it too: the App Router
 * renderer sets its own `Vary` (rsc, next-router-*) and REPLACES whatever a
 * `NextResponse.next()` or a `next.config` `headers()` rule put there —
 * both were tried and read back from a production build. Low cost: `/r` and
 * `/deep-dive` are noindex, `/quiz` is `no-store`. Never wanted on a
 * prefixed content page anyway: there the language is the URL, and a `Vary`
 * would fragment the CDN cache R-24 built, one copy per browser.
 */
const VARY_ACCEPT_LANGUAGE = "Accept-Language";

/**
 * SEO lot 5 (2026-09-28): a language redirect is never kept by a browser.
 * Its destination follows the cookie, and a browser cache is keyed on the URL
 * and the `Vary` headers — never on the cookie. Kept, the redirect of `/`
 * sent a French browser whose reader had chosen English back to `/fr`, and
 * `/fr` then rewrote the cookie: measured in Chromium against `next start`,
 * which sends a 308 with no `Cache-Control`, so the redirect is fresh forever.
 * Vercel happened to mask it in production (it adds `max-age=0,
 * must-revalidate`); saying it ourselves means the site no longer depends on
 * a host default. On the legacy content redirects too: their target follows
 * the same cookie.
 */
const REDIRECT_CACHE_CONTROL = "no-store";

function tooManyRequestsResponse(retryAfterSeconds: number): NextResponse {
  return new NextResponse("Too many requests.", {
    status: 429,
    headers: { "Retry-After": String(retryAfterSeconds) },
  });
}

function unauthorizedResponse(): NextResponse {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Tour de Growth admin"' },
  });
}

/**
 * `POST /admin/preview?game=on|off&engine=on|off` — the only way to open or
 * close a preview (`lib/owner-preview.ts`). Reached only once the admin gate
 * above has let the request through, so only the owner can mint the signed
 * cookie. POST, not GET: a toggle is an action, and a GET would be fired by
 * any link prefetch or unfurler that saw the URL. Answers 303 to the page, so
 * a reload never re-submits and the page reads the new cookies.
 */
async function ownerPreviewResponse(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.redirect(new URL(OWNER_PREVIEW_PATH, request.url), 303);
  // Non-null here: the admin gate already failed closed without it.
  const secret = ownerPreviewSecret();
  for (const feature of PREVIEW_FEATURES) {
    const action = previewAction(request.nextUrl.searchParams.get(feature));
    if (action === "on" && secret) {
      response.cookies.set(PREVIEW_COOKIES[feature], await ownerPreviewToken(feature, secret), {
        path: "/",
        maxAge: ONE_YEAR,
        sameSite: "lax",
        httpOnly: true,
        secure: request.nextUrl.protocol === "https:",
      });
    }
    if (action === "off") response.cookies.delete(PREVIEW_COOKIES[feature]);
  }
  return response;
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
 * Content URLs published before R-13 (`/how-it-works`, `/glossary/...`) are
 * redirected 308 to their localized form, so nothing already linked or
 * indexed breaks; `/` itself is a 307, since its target is the visitor's
 * language (SEO lot 5).
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
export async function proxy(request: NextRequest): Promise<NextResponse> {
  if (request.nextUrl.pathname.startsWith("/admin") && !isAuthorizedForAdmin(request)) {
    return unauthorizedResponse();
  }

  if (request.nextUrl.pathname === OWNER_PREVIEW_PATH && request.method === "POST") {
    return ownerPreviewResponse(request);
  }

  if (isResultReadPath(request.nextUrl.pathname)) {
    const verdict = rateLimit(clientKey(request, "result-read"), RESULT_READ_LIMIT);
    if (!verdict.allowed) return tooManyRequestsResponse(verdict.retryAfterSeconds);
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
  //
  // `/` is a 307, not a 308 (SEO lot 5, 2026-09-28): its target is the
  // visitor's language, which changes, so the redirect is not a permanent
  // move. The legacy content addresses stay 308 — they did move for good,
  // and Google has already treated them that way since R-13.
  if (!fromUrl && isLocalizableContentPath(pathname)) {
    const target = request.nextUrl.clone();
    target.pathname = localePath(locale, pathname);
    const redirect = NextResponse.redirect(target, pathname === "/" ? 307 : 308);
    // Where it lands depends on the browser's language (absent `?lang=` or
    // a cookie): say so, for Google and for any cache on the way.
    redirect.headers.set("Vary", VARY_ACCEPT_LANGUAGE);
    redirect.headers.set("Cache-Control", REDIRECT_CACHE_CONTROL);
    return redirect;
  }

  // A locale prefix in the URL is as explicit a choice as `?lang=`, so it is
  // persisted the same way — otherwise a reader who switched to French and
  // then pressed "Démarre ton Tour" would land on an English questionnaire,
  // since `/quiz` carries no prefix of its own.
  //
  // Only a NAVIGATION persists it (2026-09-29). The page a reader is leaving
  // keeps prefetching its own links while the next document loads: a French
  // reader who pressed « EN » got `tdg_locale=en` from `/en`, then the
  // in-flight `next/link` prefetches of `/fr/…` from the page left behind
  // wrote `fr` back, and typing the address again landed on `/fr`.
  // Reproduced in Chromium (6 runs in 40); the `locale-routing.spec.ts:320`
  // flake.
  //
  // Not by `next-router-prefetch`: Next strips its router headers (`rsc`,
  // `next-router-prefetch`…) from the request before the proxy sees it
  // (`proxy.md`, « RSC requests and rewrites ») — a first version keyed on
  // it passed its unit tests and changed nothing at runtime. `Sec-Fetch-Mode`
  // reaches the proxy: a document load, or a browser prerender that may be
  // activated as one, is `navigate`; every `next/link` fetch, prefetch or
  // soft navigation, is `cors`. Soft navigations never change the language
  // — the only link across languages is the switcher, plain `<a>` elements
  // on purpose (`LocaleSwitcher.tsx`). No header at all (an old browser, a
  // script) is taken as a navigation, which is the behaviour before this.
  const currentCookie = request.cookies.get(LOCALE_COOKIE)?.value ?? null;
  const chosen = fromUrl?.locale ?? (isLocale(queryLang) ? queryLang : null);
  const fetchMode = request.headers.get("sec-fetch-mode");
  const navigation = fetchMode === null || fetchMode === "navigate";
  // Only write when it actually changes. Content pages are prerendered and
  // CDN-cacheable since R-24, and re-sending an identical `Set-Cookie` on
  // every one of their responses is both pointless and the kind of header
  // that makes caches nervous.
  const explicitChoice = chosen && chosen !== currentCookie && navigation ? chosen : null;
  if (explicitChoice) {
    request.cookies.set(LOCALE_COOKIE, explicitChoice);
  }

  // The game's flag (GAME-BRIEF.md 13.1) and the growth engine's (engine
  // spec §11.2): open for everybody when the variable is exactly "true", open
  // for the owner's browser alone when it carries the signed preview cookie
  // (`lib/owner-preview.ts`), closed for everyone else. Each on its own
  // cookie, and each signature namespaced to its feature, so a game preview
  // never opens the engine. The pages stay prerendered either way — closing
  // one is a rewrite, not a dynamic render.
  const gameClosed =
    fromUrl !== null &&
    isGamePath(fromUrl.rest) &&
    resolveGameAccess({
      env: process.env.GAME_ENABLED,
      ownerPreview: await hasOwnerPreview("game", request.cookies.get(GAME_PREVIEW_COOKIE)?.value),
    }) === "closed";
  const engineClosed =
    fromUrl !== null &&
    isEnginePath(fromUrl.rest) &&
    resolveEngineAccess({
      env: engineEnvFlag(),
      ownerPreview: await hasOwnerPreview("engine", request.cookies.get(ENGINE_PREVIEW_COOKIE)?.value),
    }) === "closed";

  // The root layout can't read the URL, so hand it the answer.
  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, locale);

  // A closed game or engine page is rewritten to an address no route
  // matches, under the same language prefix: the reader gets the localized
  // 404 with a 404 status, and the pages themselves stay prerendered (13.2).
  const unavailable = gameClosed ? "/game-unavailable" : engineClosed ? "/engine-unavailable" : null;
  const response = unavailable
    ? NextResponse.rewrite(new URL(localePath(locale, unavailable), request.url), {
        request: { headers },
      })
    : NextResponse.next({ request: { headers } });

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
