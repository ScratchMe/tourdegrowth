import { ABOUT } from "@/content/about";
import { COMPARISON_ORDER, COMPARISONS } from "@/content/comparisons";
import { ENGINE_COPY } from "@/content/engine-copy";
import { GAME_META } from "@/content/game/meta";
import { GLOSSARY_TERMS } from "@/content/glossary-terms";
import { HOW_IT_WORKS } from "@/content/how-it-works";
import { PRIVACY, TERMS } from "@/content/legal";
import { CHECKLIST, DIAGNOSTIC } from "@/content/open-door";
import { ENGINE_PATH, isEngineOpenAtBuild } from "@/lib/engine/access";
import { gameSitemapPaths, isGameOpenAtBuild } from "@/lib/game/build-flag";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import type { Translatable } from "@/lib/i18n/translatable";
import { SITE_URL } from "@/lib/site";
import { LLMS_SUMMARY, llmsUrl } from "./llms-shared";

/**
 * `/llms.txt` — CHANTIERS.md C27, decided by Antoine on 2026-09-30: a short
 * index for language models (llmstxt.org), generated from what the pages
 * already say, plus `/llms-full.txt` for the full text (`llms-full.ts`).
 *
 * **Generated, never written by hand**: every title and description is the
 * page's own (its H1 and its meta description), so the file cannot say
 * something the site does not. **Its scope is the sitemap's**, flags
 * included — no `/r/…`, no admin, no game or engine while they are closed —
 * and `llms.test.ts` compares the two path by path.
 *
 * **In English, with both addresses.** The format has one file per site; the
 * English page comes first (it is also the `x-default`), the French one next
 * to it.
 */

// TODO: à relire (convention 6) — copie neuve (C27, 2026-09-30).
const LLMS_INTRO =
  "Every page exists in English and in French: each page link below is the English page, with the French one next to it. The score is deterministic and explained on the How it works page; AI only writes the optional Deep dive, never a point of the score.";

// TODO: à relire (convention 6) — copie neuve (C27, 2026-09-30) : les titres de section, le libellé du lien français et le lien vers le texte intégral.
const HEADINGS = {
  start: "Start here",
  optional: "Optional",
  frenchLink: "French",
  fullText: "Full text of the articles and the glossary",
  fullTextNote: "In English, in one Markdown file.",
};

export interface LlmsLink {
  /** Without its locale prefix, as the sitemap writes it. */
  path: string;
  title: Translatable;
  description: Translatable;
}

export interface LlmsSection {
  heading: string;
  links: LlmsLink[];
}

/** " — Tour de Growth" ends the game's titles; the link text does not need the brand twice. */
const withoutBrand = (text: Translatable): Translatable => ({
  en: text.en.replace(/ — Tour de Growth$/, ""),
  fr: text.fr.replace(/ — Tour de Growth$/, ""),
});

/**
 * The game's pages, only when open at build — the sitemap's rule. Each level
 * reads its title from `GAME_META` under its slug; a level with no entry there
 * has no title to give and fails loudly rather than being listed blank.
 */
function gameLinks(): LlmsLink[] {
  return gameSitemapPaths(isGameOpenAtBuild()).map((path) => {
    const key = path === "/game" ? "hub" : path.replace("/game/", "");
    const meta = (GAME_META as Record<string, { title: Translatable; description: Translatable }>)[key];
    if (!meta) throw new Error(`llms.txt: no GAME_META entry for ${path}`);
    return { path, title: withoutBrand(meta.title), description: meta.description };
  });
}

/** Every section of `/llms.txt`, in reading order. The paths are the sitemap's, and only them. */
export function llmsSections(): LlmsSection[] {
  const sections: LlmsSection[] = [
    {
      heading: HEADINGS.start,
      links: [
        { path: "/", title: { en: "Tour de Growth", fr: "Tour de Growth" }, description: UI_STRINGS.landing.subtitle },
        { path: "/how-it-works", title: HOW_IT_WORKS.title, description: HOW_IT_WORKS.metaDescription },
        { path: "/growth-audit-checklist", title: CHECKLIST.title, description: CHECKLIST.metaDescription },
        { path: "/startup-growth-diagnostic", title: DIAGNOSTIC.title, description: DIAGNOSTIC.metaDescription },
        { path: "/about", title: ABOUT.title, description: ABOUT.metaDescription },
      ],
    },
    {
      heading: tc(UI_STRINGS.glossaryPage.comparedWithLabel, "en"),
      links: COMPARISON_ORDER.map((slug) => ({
        path: `/${slug}`,
        title: COMPARISONS[slug].title,
        description: COMPARISONS[slug].metaDescription,
      })),
    },
    {
      heading: tc(UI_STRINGS.glossaryPage.indexTitle, "en"),
      links: [
        { path: "/glossary", title: UI_STRINGS.glossaryPage.indexTitle, description: UI_STRINGS.meta.glossaryDescription },
        ...Object.entries(GLOSSARY_TERMS).map(([id, entry]) => ({
          path: `/glossary/${id}`,
          title: entry.term,
          description: entry.definition,
        })),
      ],
    },
  ];

  if (isEngineOpenAtBuild()) {
    sections.push({
      heading: tc(ENGINE_COPY.meta.breadcrumb, "en"),
      links: [{ path: ENGINE_PATH, title: ENGINE_COPY.meta.title, description: ENGINE_COPY.meta.description }],
    });
  }
  const game = gameLinks();
  if (game.length > 0) sections.push({ heading: tc(GAME_META.hub.breadcrumb, "en"), links: game });

  sections.push({
    heading: HEADINGS.optional,
    links: [
      { path: "/privacy", title: PRIVACY.title, description: PRIVACY.metaDescription },
      { path: "/terms", title: TERMS.title, description: TERMS.metaDescription },
    ],
  });
  return sections;
}

/** Collapses the line breaks a description never has on the page, so one link stays one Markdown line. */
const oneLine = (text: string): string => text.replace(/\s+/g, " ").trim();

function linkLine({ path, title, description }: LlmsLink): string {
  return `- [${oneLine(title.en)}](${llmsUrl("en", path)}) ([${HEADINGS.frenchLink}](${llmsUrl("fr", path)})): ${oneLine(description.en)}`;
}

/** The whole of `/llms.txt`: an H1, a one-paragraph summary as a quote, then one H2 per section (llmstxt.org). */
export function buildLlmsTxt(): string {
  const lines = ["# Tour de Growth", "", `> ${LLMS_SUMMARY}`, "", LLMS_INTRO, ""];
  for (const section of llmsSections()) {
    lines.push(`## ${section.heading}`, "", ...section.links.map(linkLine));
    if (section.heading === HEADINGS.optional) {
      lines.push(`- [${HEADINGS.fullText}](${SITE_URL}/llms-full.txt): ${HEADINGS.fullTextNote}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
