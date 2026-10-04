import { EngineLanding, Stopwatch } from "tour-de-growth";

/*
 * Everything above the tool on the engine's page (design system extension
 * 07, A18 T4), for both visits from ONE prerendered HTML: a returning reader
 * gets the short version by CSS alone, under `data-engine="known"`, so
 * nothing jumps under their eyes. The promise comes before the call to
 * action and never folds: a card on a first visit, a line on return.
 *
 * Every prop is the product's own: the page itself (app/[locale]/aarrr-
 * funnel-template/page.tsx) called for each locale, and the <EngineLanding>
 * it renders read back — `strings.page` from `resolveEngineProps`, with the
 * page's own mapping (the lede is `page.positioning`, the positioning is
 * `page.promise`). Its phone form (a 40px title, the card's mobile padding)
 * is a 760px media query on the window, wider than this card's capture
 * viewport, so a still cannot draw it: a narrow wrapper would show the
 * desktop title squeezed, so there is no phone cell.
 */

/**
 * The page's first visit, in French (nothing on the device): the ultramarine eyebrow, the H1
 * at hero size, the lede and the positioning, then the privacy promise as the one raised card
 * — solid ultramarine on its own shadow, BEFORE the call to action and never folded — then
 * « Entre tes chiffres → », drawn secondary (the page's one primary is the start card's,
 * below), with its note. The page passes its Stopwatch as `aside`: it stands beside the intro
 * on a window 1100px wide or more, and is hidden on a narrower one, as at this card's 900px.
 */
export const FirstVisit = () => (
  <EngineLanding
    eyebrow={"Le moteur"}
    title={"Ton moteur de growth"}
    lede={"Ton Tour dit si tu mesures. Le moteur montre ce que disent tes chiffres."}
    positioning={"Dix-sept chiffres en libre-service, quinze en assisté : va les chercher, vois où ton moteur perd du monde et ce que te rapporte chaque nouveau client, et repars avec des slides pour ton CODIR, ton board ou tes investisseurs. Tes chiffres ne sont comparés qu'à toi-même et à ta propre cible : les repères publiés sont là pour situer, jamais pour désigner une étape."}
    promiseTitle={"Rien de ce que tu saisis ne sort d'ici"}
    promiseBody={"Aucun chiffre ni aucun texte que tu saisis ne quitte ton navigateur. Pas de compte, pas de serveur : tout reste sur cet appareil, et tu peux le vérifier dans l'onglet Réseau de ton navigateur. La page compte ses visites, sans cookie — jamais ce que tu y écris."}
    promiseLine={"Rien de ce que tu saisis ne sort d'ici : ton moteur ne vit que dans ce navigateur."}
    cta={"Entre tes chiffres →"}
    ctaNote={"Gratuit, sans compte. Tout reste sur ton appareil."}
    aside={<Stopwatch />}
  />
);

/**
 * The same HTML for a returning reader, in French: `data-engine="known"` on an ancestor (on
 * the page, <html>, set before the first paint by `engineKnownScript` when the device holds an
 * engine) turns it into the short version by CSS alone — the eyebrow, the H1 at a section's
 * size, the promise in one line behind an ultramarine rule (« Rien de ce que tu saisis ne sort
 * d'ici : ton moteur ne vit que dans ce navigateur. »); on the page the tool follows. The
 * lede, the positioning, the card, the call to action and the stopwatch stay in the HTML,
 * hidden.
 */
export const Returning = () => (
  <div data-engine="known">
    <EngineLanding
      eyebrow={"Le moteur"}
      title={"Ton moteur de growth"}
      lede={"Ton Tour dit si tu mesures. Le moteur montre ce que disent tes chiffres."}
      positioning={"Dix-sept chiffres en libre-service, quinze en assisté : va les chercher, vois où ton moteur perd du monde et ce que te rapporte chaque nouveau client, et repars avec des slides pour ton CODIR, ton board ou tes investisseurs. Tes chiffres ne sont comparés qu'à toi-même et à ta propre cible : les repères publiés sont là pour situer, jamais pour désigner une étape."}
      promiseTitle={"Rien de ce que tu saisis ne sort d'ici"}
      promiseBody={"Aucun chiffre ni aucun texte que tu saisis ne quitte ton navigateur. Pas de compte, pas de serveur : tout reste sur cet appareil, et tu peux le vérifier dans l'onglet Réseau de ton navigateur. La page compte ses visites, sans cookie — jamais ce que tu y écris."}
      promiseLine={"Rien de ce que tu saisis ne sort d'ici : ton moteur ne vit que dans ce navigateur."}
      cta={"Entre tes chiffres →"}
      ctaNote={"Gratuit, sans compte. Tout reste sur ton appareil."}
      aside={<Stopwatch />}
    />
  </div>
);

/**
 * The first visit in English, the page's own words: « Your growth engine », the promise
 * « Nothing you enter leaves this page », the call to action « Enter your numbers → ». Same
 * composition as the French; the stopwatch is hidden at this card's width.
 */
export const FirstVisitEnglish = () => (
  <EngineLanding
    eyebrow={"The engine"}
    title={"Your growth engine"}
    lede={"Your Tour tells you whether you measure. The engine shows what your numbers say."}
    positioning={"Seventeen numbers for self-serve, fifteen for sales-assisted: go and get them, see where your engine loses people and what each new customer earns you, and leave with slides for your leadership meeting, your board or your investors. Your numbers are only compared with yourself and your own target: published references are there for context, never to name a stage."}
    promiseTitle={"Nothing you enter leaves this page"}
    promiseBody={"No number and no text you enter leaves your browser. No account, no server: everything stays on this device, and you can check it in your browser's Network tab. The page counts its visits, without cookies — never what you type."}
    promiseLine={"Nothing you enter leaves this page: your engine lives in this browser only."}
    cta={"Enter your numbers →"}
    ctaNote={"Free, no sign-up. Everything stays on your device."}
    aside={<Stopwatch />}
  />
);
