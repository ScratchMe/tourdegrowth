import type { MetadataRoute } from "next";
import { COMPARISON_ORDER } from "@/content/comparison-index";
import { GLOSSARY } from "@/content/glossary";
import { PRIVACY, TERMS } from "@/content/legal";
import { CONTENT_UPDATED_AT, GLOSSARY_UPDATED_AT } from "@/content/updated-at";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/locale";
import { localePath } from "@/lib/i18n/routes";
import { SITE_URL } from "@/lib/site";

/**
 * SPEC-ADDENDUM-02.md §3.3/§3.4, extended by REVIEW.md R-13: every indexable
 * page now exists once per language, so the sitemap lists both and declares
 * them as alternates of each other.
 *
 * Individual result pages (`/r/<id>`) stay out, as before — see `robots.ts`
 * and `r/[id]/page.tsx`'s `noindex`. Listing thousands of near-identical
 * auto-generated pages is the opposite of what a sitemap is for.
 */
const CONTENT_PATHS: { path: string; changeFrequency: "monthly" | "yearly"; priority: number; lastModified: string }[] = [
  { path: "/", changeFrequency: "monthly", priority: 1, lastModified: CONTENT_UPDATED_AT["/"]! },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.8, lastModified: CONTENT_UPDATED_AT["/how-it-works"]! },
  { path: "/about", changeFrequency: "monthly", priority: 0.7, lastModified: CONTENT_UPDATED_AT["/about"]! },
  // Les deux pages « porte ouverte » (GROWTH-PLAN.md vague 2.1) : priorité
  // au niveau de `/how-it-works`, puisqu'elles existent pour être le premier
  // contact de quelqu'un qui cherche l'outil sans le connaître.
  {
    path: "/growth-audit-checklist",
    changeFrequency: "monthly",
    priority: 0.8,
    lastModified: CONTENT_UPDATED_AT["/growth-audit-checklist"]!,
  },
  {
    path: "/startup-growth-diagnostic",
    changeFrequency: "monthly",
    priority: 0.8,
    lastModified: CONTENT_UPDATED_AT["/startup-growth-diagnostic"]!,
  },
  // Le cluster « frameworks comparés » (GROWTH-PLAN.md vague 2.3) : même
  // priorité que les pages « porte ouverte », pour la même raison — ce sont
  // des premiers contacts de quelqu'un qui cherche le sujet, pas l'outil.
  ...COMPARISON_ORDER.map((slug) => ({
    path: `/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
    lastModified: CONTENT_UPDATED_AT[`/${slug}`]!,
  })),
  { path: "/glossary", changeFrequency: "monthly", priority: 0.6, lastModified: CONTENT_UPDATED_AT["/glossary"]! },
  // The legal pages carry their own date — it is printed on the page, so the
  // sitemap reads the same value rather than a second copy that could drift.
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3, lastModified: PRIVACY.updatedAt },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3, lastModified: TERMS.updatedAt },
  ...Object.entries(GLOSSARY).map(([term, entry]) => ({
    path: `/glossary/${term}`,
    changeFrequency: "yearly" as const,
    priority: 0.5,
    lastModified: entry.updatedAt ?? GLOSSARY_UPDATED_AT,
  })),
];

/**
 * `lastModified` is the one field here Google actually reads (REVIEW-02.md
 * R2-08); `changeFrequency` and `priority` are kept for other consumers but
 * have been ignored by Google for years. `x-default` mirrors the `<head>`
 * alternates (`lib/i18n/routes.ts`), so the two never disagree.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return CONTENT_PATHS.flatMap(({ path, changeFrequency, priority, lastModified }) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}${localePath(locale, path)}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: {
          ...Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}${localePath(l, path)}`])),
          "x-default": `${SITE_URL}${localePath(DEFAULT_LOCALE, path)}`,
        },
      },
    })),
  );
}
