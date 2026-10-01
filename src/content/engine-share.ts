import type { Translatable } from "@/lib/i18n/translatable";

/**
 * engine-share.ts — the engine's headline, and the words of its share image
 * (design brief 06, `design/ds-extension-06-return/`).
 *
 * Its own module, apart from `engine-copy.ts`, for the content fan-in
 * (`content-fan-in.test.ts`, VERCEL.md §2.2): the image route
 * (`aarrr-funnel-template/opengraph-image.tsx`) must not take the engine's
 * whole interface copy into its function for the sake of five lines. The
 * headline lives HERE and `engine-copy.ts` reads it, so the page's H1 and the
 * title drawn on the image are one string, not two kept equal.
 *
 * Server only, like `engine-copy.ts`: the island never reads it.
 */

export const ENGINE_HEADLINE = {
  // TODO: à relire (convention 6) — déplacé d'engine-copy.ts par T6.2, mots inchangés (bon à tirer nº8).
  eyebrow: { fr: "Le moteur", en: "The engine" },
  // TODO: à relire (convention 6) — renommé le 2026-09-30 (A7.2, C2 : « Moteur de growth »).
  title: { fr: "Ton moteur de growth", en: "Your growth engine" },
} as const satisfies Record<string, Translatable>;

/**
 * TODO: à relire — copie neuve (convention 6), écrite par Claude Design au
 * retour du brief 06 (2026-10-01) et portée telle quelle. Rien ici n'est
 * approuvé : tout va au bon à tirer du moteur (A14.d).
 */
export const ENGINE_SHARE = {
  /**
   * The H1 on the image's two set lines: this is the first, the rest of the
   * H1 is the second (`engine-share-text.ts` cuts it, and fails the build if
   * the H1 no longer starts with it).
   */
  titleFirstLine: { fr: "Ton moteur", en: "Your growth" },
  /** The engine's own word in the title, drawn in its ultramarine. */
  titleAccent: { fr: "moteur", en: "engine" },
  /** One line that says it is a tool you fill, for a stranger who has not taken the Tour. */
  line: {
    fr: "Tape tes chiffres du mois : il montre où ton funnel perd le plus de monde.",
    en: "Type in this month's numbers: it shows where your funnel loses the most people.",
  },
  /**
   * The page's promise, said so that it holds on an image in a feed: « Rien
   * de ce que tu saisis ne sort d'ici » points at the image there.
   */
  promise: { fr: "Tes chiffres restent dans ton navigateur", en: "Your numbers stay in your browser" },
  /**
   * The image's alt text, built from what it draws so the two cannot drift:
   * `{space}` is the pill in lower case, `{title}` the H1, `{line}` and
   * `{promise}` the two lines above, `{domain}` the badge.
   */
  alt: {
    fr: "Tour de Growth, {space} : « {title} ». Un chronomètre à la lunette bleu outremer. {line} {promise}. {domain}",
    en: 'Tour de Growth, {space}: "{title}". A stopwatch with an ultramarine bezel. {line} {promise}. {domain}',
  },
} as const satisfies Record<string, Translatable>;
