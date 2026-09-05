import type { MetadataRoute } from "next";
import { GLOSSARY } from "@/content/glossary";
import { LOCALES } from "@/lib/i18n/locale";
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
const CONTENT_PATHS: { path: string; changeFrequency: "monthly" | "yearly"; priority: number }[] = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.8 },
  { path: "/glossary", changeFrequency: "monthly", priority: 0.6 },
  ...Object.keys(GLOSSARY).map((term) => ({
    path: `/glossary/${term}`,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  })),
];

export default function sitemap(): MetadataRoute.Sitemap {
  return CONTENT_PATHS.flatMap(({ path, changeFrequency, priority }) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}${localePath(locale, path)}`,
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}${localePath(l, path)}`])),
      },
    })),
  );
}
