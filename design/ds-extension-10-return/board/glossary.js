// The definitions the engine's "?" opens on the marketplace's screens (in
// the app: EngineTerm, one definition open at a time). C72's three words —
// GMV, take rate, liquidity — and the one this return proposes (net
// revenue). Their text is COPY's `term.*`, so COPY.md carries them for
// review. An id with "@services" reads the services vocabulary. Board only:
// the board's GlossaryTerm reads this.
import { COPY, frTypo } from "./copy.js";

const entry = (key, services) => {
  const pick = (k, lang) => (services ? COPY[k][`${lang}S`] ?? COPY[k][lang] : COPY[k][lang]);
  return {
    en: { term: pick(`term.${key}.title`, "en"), definition: pick(`term.${key}.body`, "en") },
    fr: { term: frTypo(pick(`term.${key}.title`, "fr")), definition: frTypo(pick(`term.${key}.body`, "fr")) },
  };
};

export const GLOSSARY = Object.fromEntries(
  ["gmv", "takeRate", "liquidity", "netRevenue", "cashTied", "after"].flatMap((k) => [[k, entry(k, false)], [`${k}@services`, entry(k, true)]]),
);
