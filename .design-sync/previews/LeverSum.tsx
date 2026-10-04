import { LeverSum } from "tour-de-growth";

/*
 * The compounding, readable (design system extension 09, Q9): what each
 * lever brings alone on the MRR in twelve months, the solo gains end to
 * end, what they bring together — lengths on one scale, all ink — and the
 * bracket over what the whole adds.
 *
 * Every prop is the product's own. In the panel: `leverSumView`
 * (app/[locale]/aarrr-funnel-template/_engine/whatif-figures.ts), passed the
 * way `WhatIfPanel` does once two levers moved. On the slide: the
 * `leverSum` `buildDeck` (lib/engine/deck.ts) writes into the « together »
 * slide, with `scenario.aloneTitle` as its title, passed the way
 * `SlideScenario` does. Run on the film's SaaS (`filmState()`) with the
 * resolved copy; the bars' amounts are rounded to the cent.
 */

/**
 * The full « Et si » panel (`WhatIfPanel`), in French, two of the film's levers moved
 * (`filmState()`, churn 6 → 4 %, expansion 2 → 3 %): each alone, the two solo bars end to end
 * on « Chacun seul, additionnés », then « Ensemble », a little longer — the bracket over its
 * end measures what the levers do to each other, and the sentence under it names it: the
 * compounding. The cell is the board's width, on the page's paper: the hairline between the
 * solo bars is that paper.
 */
export const TwoLevers = () => (
  <div style={{ background: "var(--surface-page)", padding: 16 }}>
    <div style={{ maxWidth: 1040 }}>
      <LeverSum
        title={"Ce que chaque levier rapporte seul, sur le MRR dans 12 mois"}
        rows={[
          { id: "ret.logo-churn", label: "Churn logo mensuel : 6 % → 4 %", value: "+13 000 €", amount: 13344.69 },
          { id: "rev.expansion", label: "Expansion mensuelle : 2 % → 3 %", value: "+6 400 €", amount: 6362.54 },
        ]}
        sum={{ id: "sum", label: "Chacun seul, additionnés", value: "~20 000 €", amount: 19707.23 }}
        together={{ id: "together", label: "Ensemble", value: "+21 000 €", amount: 21006.46 }}
        extra={"Ensemble, ils rapportent ~1 300 € de plus que chacun seul, additionnés : chaque levier agit sur ce que les autres ajoutent. C'est l'effet composé."}
      />
    </div>
  </div>
);

/**
 * The same panel in English with the film's three levers (`FILM_LEVERS`: activation 18 → 24 %,
 * churn 6 → 4 %, expansion 2 → 3 %), in lever order: +€18,000, +€13,000, +€6,400 alone,
 * ~€38,000 added up, +€42,000 together — « ~€4,400 more » than each alone, added up.
 */
export const ThreeLevers = () => (
  <div style={{ background: "var(--surface-page)", padding: 16 }}>
    <div style={{ maxWidth: 1040 }}>
      <LeverSum
        title={"What each lever brings on its own, on MRR in 12 months"}
        rows={[
          { id: "act.rate", label: "Activation rate: 18% → 24%", value: "+€18,000", amount: 18091.43 },
          { id: "ret.logo-churn", label: "Monthly logo churn: 6% → 4%", value: "+€13,000", amount: 13344.69 },
          { id: "rev.expansion", label: "Monthly expansion: 2% → 3%", value: "+€6,400", amount: 6362.54 },
        ]}
        sum={{ id: "sum", label: "Each alone, added up", value: "~€38,000", amount: 37798.66 }}
        together={{ id: "together", label: "Together", value: "+€42,000", amount: 42190.34 }}
        extra={"Together they bring ~€4,400 more than each alone, added up: each lever works on what the others add. That's compounding."}
      />
    </div>
  </div>
);

/**
 * The « together » slide (`SlideScenario`, `buildDeck`'s `leverSum`), in French, the three
 * levers — the slide draws them only under four. `medium="slide"`: the deck's type, the title
 * as a table head, no sentence (the slide's right column says it); the stage names are the
 * slide's short ones (« L'activation »). The deck passes each label through the island's
 * `SlideText`, which draws the → as a small SVG arrow (a typed → is in none of the slide
 * fonts, engine spec §10.4); that helper is not in the system, so here the → is the typed
 * character, in a fallback face. The cell is the slide's lever card: its ground
 * (`--surface-card`) and padding, 660px inside on the 1 920 canvas, unscaled.
 */
export const OnTheSlide = () => (
  <div style={{ background: "var(--surface-card)", padding: "18px 26px", width: 712, boxSizing: "border-box" }}>
    <LeverSum
      medium="slide"
      title={"Ce que chaque levier rapporte seul, sur le MRR dans 12 mois"}
      rows={[
        { id: "act.rate", label: "L'activation : 18 % → 24 %", value: "+18 000 €", amount: 18091.43 },
        { id: "ret.logo-churn", label: "Le churn logo : 6 % → 4 %", value: "+13 000 €", amount: 13344.69 },
        { id: "rev.expansion", label: "L'expansion : 2 % → 3 %", value: "+6 400 €", amount: 6362.54 },
      ]}
      sum={{ id: "sum", label: "Chacun seul, additionnés", value: "~38 000 €", amount: 37798.66 }}
      together={{ id: "together", label: "Ensemble", value: "+42 000 €", amount: 42190.34 }}
    />
  </div>
);

/**
 * The same slide in English with two levers moved (churn and expansion): two solo bars, the
 * sum, together. The deck passes each label through the island's `SlideText`, which draws the
 * → as a small SVG arrow (a typed → is in none of the slide fonts, engine spec §10.4); that
 * helper is not in the system, so here the → is the typed character, in a fallback face.
 */
export const TwoOnTheSlide = () => (
  <div style={{ background: "var(--surface-card)", padding: "18px 26px", width: 712, boxSizing: "border-box" }}>
    <LeverSum
      medium="slide"
      title={"What each lever brings on its own, on MRR in 12 months"}
      rows={[
        { id: "ret.logo-churn", label: "Logo churn: 6% → 4%", value: "+€13,000", amount: 13344.69 },
        { id: "rev.expansion", label: "Expansion: 2% → 3%", value: "+€6,400", amount: 6362.54 },
      ]}
      sum={{ id: "sum", label: "Each alone, added up", value: "~€20,000", amount: 19707.23 }}
      together={{ id: "together", label: "Together", value: "+€21,000", amount: 21006.46 }}
    />
  </div>
);
