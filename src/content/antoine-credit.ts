import type { Translatable } from "@/lib/i18n/dictionary";

/**
 * antoine-credit.ts — Tour de Growth
 * Copy for the two Antoine Berthaud credit placements, at two deliberately
 * different intensities (SPEC-ADDENDUM-02.md §2). Both stay visible on a
 * publicly shared result too (§2.3) — this content doesn't distinguish
 * owner vs. visitor because ResultView never does either.
 */

export const ANTOINE_LINKS = {
  cv: "https://cv.antoine.berthaud.me",
  linkedin: "https://www.linkedin.com/in/antoine-berthaud-pm/",
};

/** §2.1 — Quick result screen, in the score card's footer. Sober on purpose: "un simple crédit de bas de page", never a bigger promotional element. Also shown on Deep dive results (§2.3) — this is additive to, not replaced by, the §2.2 card below. */
export const QUICK_CREDIT = {
  prefix: { fr: "Conçu par ", en: "Built by " },
  name: "Antoine Berthaud",
  suffix: { fr: ", Senior Growth PM", en: ", Senior Growth PM" },
} satisfies { prefix: Translatable; name: string; suffix: Translatable };

/** §2.2 — Deep dive result only, a real card just under Priority move. The user has just shown real engagement (25 answers, maybe free-text context too); this is the moment they're most receptive to "there's a person behind this, not just a tool". */
export const DEEP_DIVE_CREDIT = {
  eyebrow: { fr: "Qui a conçu cet outil", en: "Who built this" },
  bio: {
    fr: "Envie d'aller plus loin qu'une IA ne peut le faire ? Je suis Antoine, Senior Growth PM avec 10 ans d'expérience (AB Tasty, SNCF Connect & Tech...). ",
    en: "Want to go deeper than AI can? I'm Antoine, a Senior Growth PM with 10 years of experience (AB Tasty, SNCF Connect & Tech...). ",
  },
  cvLinkText: { fr: "Voir mon profil", en: "See my background" },
  linkedinLinkText: { fr: "Me contacter sur LinkedIn", en: "Connect on LinkedIn" },
} satisfies { eyebrow: Translatable; bio: Translatable; cvLinkText: Translatable; linkedinLinkText: Translatable };

/**
 * Site footer credit — added on Antoine's request (2026-09-05, on an SEO
 * consultant's recommendation), not part of SPEC-ADDENDUM-02.md §2's two
 * placements. Kept in this file anyway so every Antoine-credit string lives
 * in one place rather than drifting apart across three.
 *
 * Deliberately NOT the same sentence as `QUICK_CREDIT`: both appear on a
 * result page, and repeating "Built by Antoine Berthaud, Senior Growth PM"
 * twice within one screen reads as insistence rather than a credit. This one
 * says what the site *is* — which is a footer's job — and carries the link.
 *
 * The link text is the anchor text search engines read, so it names the role
 * rather than saying "here" or "my CV": that is the whole point of the
 * recommendation this implements.
 */
export const SITE_FOOTER_CREDIT = {
  prefix: { fr: "Un side project d'", en: "A side project by " },
  linkText: { fr: "Antoine Berthaud — Senior Growth PM", en: "Antoine Berthaud — Senior Growth PM" },
  suffix: { fr: ".", en: "." },
} satisfies { prefix: Translatable; linkText: Translatable; suffix: Translatable };
