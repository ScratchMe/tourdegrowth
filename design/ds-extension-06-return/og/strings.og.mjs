// Every string drawn on the engine's share image, per language, and its alt
// text. All of it goes to the engine's proofing sheet. Marked NEW: words that
// do not exist on the page today.
//
// French house rules: « tu »; a no-break space (U+00A0) before « : ; ? ! »
// and inside « »; « étape » only for the five AARRR stages — the spaces are
// « 2/3 · Contre-la-montre », never an « étape ».
const NB = " ";

export const OG_STRINGS = {
  fr: {
    wordmark: ["TOUR DE", "GROWTH"],                  // the frame's, unchanged
    space: "2/3 · Contre-la-montre",                  // the band's, drawn in capitals
    domain: "tourdegrowth.com",                       // the frame's, unchanged
    eyebrow: "Le moteur",                             // the page's eyebrow, drawn in capitals
    title: [["Ton ", "moteur"], ["de growth"]],       // the page's H1, on two lines; [1] of the first line in ultramarine
    titleAccent: "moteur",
    line: `Tape tes chiffres du mois${NB}: il montre où ton funnel perd le plus de monde.`, // NEW
    promise: "Tes chiffres restent dans ton navigateur", // NEW, replaces « Rien de ce que tu saisis ne sort d'ici » off the page
    alt: `Tour de Growth, 2/3 · contre-la-montre${NB}: «${NB}Ton moteur de growth${NB}». Un chronomètre à la lunette bleu outremer. Tape tes chiffres du mois${NB}: il montre où ton funnel perd le plus de monde. Tes chiffres restent dans ton navigateur. tourdegrowth.com`,
  },
  en: {
    wordmark: ["TOUR DE", "GROWTH"],
    space: "2/3 · Time trial",
    domain: "tourdegrowth.com",
    eyebrow: "The engine",
    title: [["Your growth"], ["engine"]],
    titleAccent: "engine",
    line: "Type in this month's numbers: it shows where your funnel loses the most people.", // NEW
    promise: "Your numbers stay in your browser",     // NEW, replaces "Nothing you enter leaves this page" off the page
    alt: "Tour de Growth, 2/3 · time trial: \"Your growth engine\". A stopwatch with an ultramarine bezel. Type in this month's numbers: it shows where your funnel loses the most people. Your numbers stay in your browser. tourdegrowth.com",
  },
};
