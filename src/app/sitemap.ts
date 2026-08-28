import type { MetadataRoute } from "next";
import { GLOSSARY } from "@/content/glossary";
import { SITE_URL } from "@/lib/site";

/**
 * SPEC-ADDENDUM-02.md §3.3/§3.4: only the static, always-indexable pages —
 * landing, How it works, and every glossary page. Individual result pages
 * (`/r/<id>`) are deliberately excluded (see `robots.ts`'s comment and
 * `r/[id]/page.tsx`'s `noindex`) — listing thousands of near-identical,
 * auto-generated pages in a sitemap would be the opposite of what a
 * sitemap is for.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/how-it-works`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/glossary`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const glossaryRoutes: MetadataRoute.Sitemap = Object.keys(GLOSSARY).map((term) => ({
    url: `${SITE_URL}/glossary/${term}`,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...glossaryRoutes];
}
