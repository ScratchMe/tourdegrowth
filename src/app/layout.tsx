import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Stardos_Stencil } from "next/font/google";
import { cookies, headers } from "next/headers";
import type { ReactNode } from "react";
import { LOCALE_COOKIE, resolveLocale } from "@/lib/i18n/locale";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import "./globals.css";

// Three type roles, no more — see DESIGN-BRIEF.md "Typography".
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
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

export const metadata: Metadata = {
  title: "Tour de Growth",
  description: "A guided AARRR growth check-up — scored, explained, and built to share.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // The middleware has already folded `?lang=` into this cookie for the
  // current request (see middleware.ts) — see resolveLocale() for the
  // full priority order. cookies()/headers() are async since Next.js 15.
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
  const locale = resolveLocale({
    queryLang: null,
    cookieLocale: cookieStore.get(LOCALE_COOKIE)?.value ?? null,
    acceptLanguage: headerList.get("accept-language"),
  });

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${plexMono.variable} ${stardos.variable}`}>
        <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
