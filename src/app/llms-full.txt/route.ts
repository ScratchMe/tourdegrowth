import { buildLlmsFullTxt } from "@/lib/seo/llms-full";

/**
 * `/llms-full.txt` — CHANTIERS.md C27. The full English text of the articles
 * and the glossary (`lib/seo/llms-full.ts`), built once at build time and
 * served as a static file.
 */
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(buildLlmsFullTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
