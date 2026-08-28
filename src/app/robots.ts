import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * SPEC-ADDENDUM-02.md §3.3/§3.4. Deliberately does NOT disallow `/r/` here:
 * individual result pages are kept out of the index via a `noindex` meta
 * tag on that route instead (see `r/[id]/page.tsx`'s generateMetadata) —
 * blocking the crawl in robots.txt would stop Google from ever seeing that
 * tag, and shared results do get real inbound links from the product's own
 * growth loop.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
