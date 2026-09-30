import { buildLlmsTxt } from "@/lib/seo/llms";

/**
 * `/llms.txt` — CHANTIERS.md C27. Built once at build time from the pages'
 * own titles and descriptions (`lib/seo/llms.ts`), like the sitemap, and
 * served as a static file: the game's and the engine's build flags decide
 * what it lists, exactly as they decide what the sitemap lists.
 */
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(buildLlmsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
