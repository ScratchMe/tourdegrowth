import type { MetadataRoute } from "next";
import { AI_ANSWER_AGENTS, AI_TRAINING_AGENTS } from "@/lib/seo/ai-agents";
import { SITE_URL } from "@/lib/site";

/**
 * SPEC-ADDENDUM-02.md §3.3/§3.4. Deliberately does NOT disallow `/r/` here:
 * individual result pages are kept out of the index via a `noindex` meta
 * tag on that route instead (see `r/[id]/page.tsx`'s generateMetadata) —
 * blocking the crawl in robots.txt would stop Google from ever seeing that
 * tag, and shared results do get real inbound links from the product's own
 * growth loop.
 *
 * **The AI robots are named, not left to `*`** (C26). They get exactly what
 * everyone gets, so naming them changes nothing for a crawler; it makes the
 * file say that letting them in is a choice rather than a default, and it
 * gives the next session one obvious place to change its mind. A robot named
 * nowhere still falls under `*`. `robots.test.ts` keeps any `Disallow` out of
 * these groups unless that test is changed too.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: [...AI_TRAINING_AGENTS], allow: "/" },
      { userAgent: [...AI_ANSWER_AGENTS], allow: "/" },
      { userAgent: "*", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
