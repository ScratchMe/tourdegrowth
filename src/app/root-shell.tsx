import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Stardos_Stencil } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/locale";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

/**
 * The chrome every page shares, extracted so that the app can have TWO root
 * layouts — REVIEW.md R-24.
 *
 * Why two: `<html lang>` must match the page's actual language, and a root
 * layout cannot see the URL. Content pages carry their language in the URL
 * (`/fr/glossary/cac`), so theirs comes from the route param and nothing
 * needs reading at request time — which is the whole point, since a layout
 * that reads `headers()` makes every route beneath it render on demand. App
 * pages (`/quiz`, `/r/<id>`, …) carry no prefix, so theirs still comes from
 * the header the proxy sets, and stays dynamic.
 *
 * Everything below the `<html lang>` line is identical between the two, and
 * living here rather than being copied twice is what keeps them from
 * drifting apart silently.
 */

// SPEC.md §8: GoatCounter — free, cookie-less pageview analytics, "already in
// place elsewhere" (Antoine's other sites). Site code comes from
// NEXT_PUBLIC_GOATCOUNTER_CODE (tourdegrowth.goatcounter.com in .env.local);
// kept as an env var rather than hardcoded so local/preview builds without
// it configured just skip the script tag — no broken request, no console
// noise, no consent banner to build either way (GoatCounter sets no
// cookies, hence no banner requirement).
const GOATCOUNTER_CODE = process.env.NEXT_PUBLIC_GOATCOUNTER_CODE;

// Three type roles, no more — see DESIGN-BRIEF.md "Typography". Variable
// names match the design system v2 tokens (tokens/typography.css) exactly —
// `--font-ui` (renamed from the original `--font-body`), `--font-mono`,
// `--font-display` — so components can reference the token names directly,
// no bridging alias needed. next/font self-hosts each family at build time,
// which is also the fix the DS bundle's README asks for under "Known gaps"
// (it shipped referencing the Google Fonts CDN because no binaries were
// supplied) — no separate CDN <link>/@import is needed here.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const stardos = Stardos_Stencil({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-display",
  display: "swap",
});

/** Exported by BOTH root layouts — see the note above about drift. */
export const rootMetadata: Metadata = {
  // Needed for Next.js to resolve absolute OG/canonical URLs correctly
  // (was missing — silent build warning until SPEC-ADDENDUM-02.md's SEO
  // pass made it worth fixing alongside everything else here).
  metadataBase: new URL(SITE_URL),
  title: "Tour de Growth",
  description: "A guided AARRR growth check-up — scored, explained, and built to share.",
  // SPEC-ADDENDUM-02.md §4 — SVG first (crisp at any size, what modern
  // browsers prefer), PNGs as the fallback chain for tab-icon contexts that
  // don't support SVG. No favicon.ico: none was delivered, and every
  // browser new enough to be in this product's audience accepts an SVG or
  // PNG <link rel="icon">.
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export function RootShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${plexMono.variable} ${stardos.variable}`}>
        <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
        {GOATCOUNTER_CODE ? (
          <Script
            data-goatcounter={`https://${GOATCOUNTER_CODE}.goatcounter.com/count`}
            src="https://gc.zgo.at/count.js"
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
