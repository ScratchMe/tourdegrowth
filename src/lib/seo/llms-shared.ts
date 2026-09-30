import { localePath } from "@/lib/i18n/routes";
import { SITE_URL } from "@/lib/site";

/**
 * What `/llms.txt` (`llms.ts`) and `/llms-full.txt` (`llms-full.ts`) share,
 * kept apart so that neither route pulls the other's content modules
 * (`content-fan-in.test.ts`: the cost is counted per route).
 */

// TODO: à relire (convention 6) — copie neuve (C27, 2026-09-30) : l'en-tête des deux fichiers.
export const LLMS_SUMMARY =
  "A free, 3-minute AARRR growth check-up: fifteen questions, a score out of 100 computed by fixed rules, and the stage holding growth back when the answers single one out. In English and French, no account needed.";

/** The absolute address of a page in one language, as the sitemap and the `<link rel=alternate>` write it. */
export const llmsUrl = (locale: "en" | "fr", path: string): string => `${SITE_URL}${localePath(locale, path)}`;
