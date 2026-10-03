// The definitions the engine's "?" opens on the screens of extension 09 (in
// the app: EngineTerm, return 07's five words, ported — one definition open
// at a time). The three words the money adds; their text is COPY's
// `term.*`, so COPY.md carries them for review. ARR is already in the
// glossary: it gets no "?" of its own here (its label says what it is,
// "ARR, the MRR × 12"). Board only: the board's GlossaryTerm reads this.
import { COPY, frTypo } from "./copy.js";

const entry = (key) => ({
  en: { term: COPY[`term.${key}.title`].en, definition: COPY[`term.${key}.body`].en },
  fr: { term: frTypo(COPY[`term.${key}.title`].fr), definition: frTypo(COPY[`term.${key}.body`].fr) },
});

export const GLOSSARY = {
  cashTied: entry("cashTied"),
  after: entry("after"),
  runway: entry("runway"),
};
