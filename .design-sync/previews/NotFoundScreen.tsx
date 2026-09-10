import { NotFoundScreen } from "tour-de-growth";

/*
 * The whole 404 page, footer included — a dead link is a real entry point,
 * and the one thing it must not be is a cul-de-sac.
 *
 * Copy comes in as `Translatable` ({ en, fr }) rather than resolved strings:
 * the screen is rendered from two different places with two different
 * eyebrows, and both need both languages.
 *
 * It is never the `fault` tone. A reader who mistyped an address is lost, not
 * broken, and red would blame them for it.
 */

const UNKNOWN_PAGE = {
  eyebrow: { en: "Detour", fr: "Détour" },
  title: { en: "This page doesn't exist.", fr: "Cette page n'existe pas." },
  body: {
    en: "The address may be mistyped, or the page may have moved. Everything else is still where you left it.",
    fr: "L'adresse est peut-être mal recopiée, ou la page a changé de place. Le reste est là où tu l'as laissé.",
  },
  cta: { en: "Back to Tour de Growth →", fr: "Retour à Tour de Growth →" },
};

const LOST_RESULT = {
  eyebrow: { en: "Lost result", fr: "Résultat introuvable" },
  title: { en: "No result at this address.", fr: "Aucun résultat à cette adresse." },
  body: {
    en: "This link may have been mistyped, or the result it pointed to is gone. Your own Tour takes three minutes.",
    fr: "Ce lien a peut-être été mal recopié, ou le résultat qu'il désignait n'existe plus. Ton propre Tour prend trois minutes.",
  },
  cta: { en: "Start your Tour →", fr: "Démarre ton Tour →" },
};

/** An address that names nothing. */
export const UnknownPage = () => <NotFoundScreen locale="en" {...UNKNOWN_PAGE} />;

/** A shared result id that names nothing — same screen, its own eyebrow and copy. */
export const LostResult = () => <NotFoundScreen locale="en" {...LOST_RESULT} />;

/** In French, resolved from the same objects. */
export const French = () => <NotFoundScreen locale="fr" {...UNKNOWN_PAGE} />;
