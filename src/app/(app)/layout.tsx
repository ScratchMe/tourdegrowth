import type { ReactNode } from "react";
import { resolveRequestLocale } from "@/lib/i18n/resolve-request-locale";
import { RootShell, rootMetadata } from "../root-shell";

export const metadata = rootMetadata;

/**
 * Root layout for the app routes — `/quiz`, `/r/<id>`, `/deep-dive/<id>`,
 * `/admin` (REVIEW.md R-24). The route group keeps the URLs unprefixed while
 * giving these pages a root layout of their own, separate from the content
 * pages'.
 *
 * These carry no locale prefix (`lib/i18n/routes.ts` explains why), so the
 * only way to know the request's language is the header the proxy sets. That
 * read is what keeps this subtree rendering on demand — which is correct
 * here: none of these pages is cacheable anyway. A quiz is a client flow, a
 * result is per-id Firestore data, and the admin dashboard is
 * `force-dynamic` by design.
 *
 * All four routes share THIS layout on purpose. Crossing a root layout forces
 * a full document load, and `/quiz` → `/r/<id>` → `/deep-dive/<id>` is the
 * product's main path: splitting it would turn every completion into a page
 * reload on the screen the whole funnel exists to reach.
 */
export default async function AppRootLayout({ children }: { children: ReactNode }) {
  const locale = await resolveRequestLocale();
  return <RootShell locale={locale}>{children}</RootShell>;
}
