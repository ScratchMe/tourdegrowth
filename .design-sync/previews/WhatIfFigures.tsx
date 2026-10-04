import { WhatIfFigures } from "tour-de-growth";

/*
 * The full « Et si ? » panel's figures (design system extension 09): three
 * short tables by meaning — growth, one new customer, cash — with today, with
 * the what-ifs and the change. The MRR and the ARR in twelve months are not
 * here: they are the lever card's, right above the panel.
 *
 * Every prop is the product's own: `whatIfFigureGroups` (app/[locale]/
 * aarrr-funnel-template/_engine/whatif-figures.ts) run on the engine's
 * fixtures with the resolved copy, handed to the tables the way `Figures`
 * (_engine/WhatIfPanel.tsx, also used by SlgWhatIfPanel.tsx) does — the
 * column names from `scenario.col*`, the narrow « today » line from
 * `scenario.leverToday`, filled in place. Each cell is set at the width the
 * product gives it: the figures' column of the opened panel on the board, or
 * a phone.
 */

/**
 * The page's own example (`exampleState()`, `lib/engine/__tests__/fixtures.ts`), in French,
 * the activation rate moved from 18 % to 24 %, in the figures' column of the opened panel on
 * the board (~610px): four columns, today, with the what-ifs, and the change with its sign and
 * its sense in words, in bold ink. What the lever does not move reads « stable »; the month's
 * spend is a fact and never moves.
 */
export const OneLever = () => (
  <div style={{ maxWidth: 610 }}>
    <WhatIfFigures
      groups={[
        {
          id: "growth",
          title: "Croissance",
          rows: [
            { id: "newMrr", label: "Nouveau MRR par mois", today: "~5 000 €", whatif: "~6 700 €", change: "+1 700 € · mieux" },
            { id: "nrr", label: "NRR mensuelle", today: "100 %", whatif: "100 %", change: "stable" },
            { id: "grr", label: "GRR mensuelle", today: "96 %", whatif: "96 %", change: "stable" },
          ],
        },
        {
          id: "customer",
          title: "Un nouveau client",
          rows: [
            { id: "cac", label: "CAC", today: "~500 €", whatif: "~380 €", change: "−130 € · mieux" },
            { id: "ltv", label: "LTV", today: "~3 000 € à 3 500 €", whatif: "~3 000 € à 3 500 €", change: "stable" },
            { id: "ltvCac", label: "LTV:CAC", today: "6 à 6,9 fois", whatif: "8,1 à 9,2 fois", change: "+2,2 · mieux" },
            { id: "gap", label: "Par nouveau client", today: "~2 520 € à 2 960 € de plus", whatif: "~2 650 € à 3 080 € de plus", change: "+130 € · mieux" },
            { id: "payback", label: "CAC payback", today: "5 à 6 mois", whatif: "4 mois", change: "−1 mois · mieux" },
            { id: "after", label: "Mois après remboursement", today: "~30 à 31 mois", whatif: "~32 mois", change: "+1 mois · mieux" },
          ],
        },
        {
          id: "cash",
          title: "Trésorerie",
          rows: [
            { id: "spend", label: "Dépensé en acquisition par mois", today: "21 000 €", whatif: "21 000 €", change: "stable" },
            { id: "cash", label: "Trésorerie immobilisée", today: "~55 000 € à 63 000 €", whatif: "~41 000 € à 47 000 €", change: "−15 000 € · mieux" },
          ],
        },
      ]}
      moved
      columns={{ figure: "Chiffre", today: "Aujourd'hui", whatif: "Avec tes « Et si »", change: "Écart" }}
      todayLine={(value) => "aujourd'hui {value}".replace("{value}", String(value))}
    />
  </div>
);

/**
 * The film's SaaS (`filmState()`), in English, with the film's three levers (`FILM_LEVERS`:
 * churn 6% → 4%, expansion 2% → 3%, activation 18% → 24%): its new customer leaves before
 * paying back today (« leaves ~4 months early ») and stays ~9 months after payback with the what-ifs;
 * « Per new customer » goes from « ~€400 short » to « ~€830 more ».
 */
export const ThreeLevers = () => (
  <div style={{ maxWidth: 610 }}>
    <WhatIfFigures
      groups={[
        {
          id: "growth",
          title: "Growth",
          rows: [
            { id: "newMrr", label: "New MRR a month", today: "~€5,900", whatif: "~€7,900", change: "+€2,000 · better" },
            { id: "nrr", label: "Monthly NRR", today: "95%", whatif: "98%", change: "+3 pt · better" },
            { id: "grr", label: "Monthly GRR", today: "93%", whatif: "95%", change: "+2 pt · better" },
          ],
        },
        {
          id: "customer",
          title: "One new customer",
          rows: [
            { id: "cac", label: "CAC", today: "~€1,900", whatif: "~€1,400", change: "−€480 · better" },
            { id: "ltv", label: "LTV", today: "~€1,500", whatif: "~€2,300", change: "+€750 · better" },
            { id: "ltvCac", label: "LTV:CAC", today: "0.79×", whatif: "1.6×", change: "+0.79 · better" },
            { id: "gap", label: "Per new customer", today: "~€400 short", whatif: "~€830 more", change: "+€1,200 · better" },
            { id: "payback", label: "CAC payback", today: "21 months", whatif: "16 months", change: "−5 months · better" },
            { id: "after", label: "Months after payback", today: "leaves ~4 months early", whatif: "~9 months", change: "+14 months · better" },
          ],
        },
        {
          id: "cash",
          title: "Cash",
          rows: [
            { id: "spend", label: "Spent on acquisition a month", today: "€93,480", whatif: "€93,480", change: "unchanged" },
            { id: "cash", label: "Cash tied up", today: "~€990,000", whatif: "~€740,000", change: "−€250,000 · better" },
          ],
        },
      ]}
      moved
      columns={{ figure: "Figure", today: "Today", whatif: "With your what-ifs", change: "Change" }}
      todayLine={(value) => "today {value}".replace("{value}", String(value))}
    />
  </div>
);

/**
 * The film's SaaS in French with nothing moved: one value column, today's figures, as the
 * panel opens. The customer is a loss (« il manque ~400 € ») and « part ~4 mois avant »: below
 * zero, the months after payback say by how many months the customer leaves first (A21.2).
 */
export const Untouched = () => (
  <div style={{ maxWidth: 610 }}>
    <WhatIfFigures
      groups={[
        {
          id: "growth",
          title: "Croissance",
          rows: [
            { id: "newMrr", label: "Nouveau MRR par mois", today: "~5 900 €" },
            { id: "nrr", label: "NRR mensuelle", today: "95 %" },
            { id: "grr", label: "GRR mensuelle", today: "93 %" },
          ],
        },
        {
          id: "customer",
          title: "Un nouveau client",
          rows: [
            { id: "cac", label: "CAC", today: "~1 900 €" },
            { id: "ltv", label: "LTV", today: "~1 500 €" },
            { id: "ltvCac", label: "LTV:CAC", today: "0,79 fois" },
            { id: "gap", label: "Par nouveau client", today: "il manque ~400 €" },
            { id: "payback", label: "CAC payback", today: "21 mois" },
            { id: "after", label: "Mois après remboursement", today: "part ~4 mois avant" },
          ],
        },
        {
          id: "cash",
          title: "Trésorerie",
          rows: [
            { id: "spend", label: "Dépensé en acquisition par mois", today: "93 480 €" },
            { id: "cash", label: "Trésorerie immobilisée", today: "~990 000 €" },
          ],
        },
      ]}
      moved={false}
      columns={{ figure: "Chiffre", today: "Aujourd'hui", whatif: "Avec tes « Et si »", change: "Écart" }}
      todayLine={(value) => "aujourd'hui {value}".replace("{value}", String(value))}
    />
  </div>
);

/**
 * `noMarginState()`, in English, the activation rate moved from 18% to 24%: without a gross
 * margin no LTV, no payback, no cash figure. Each of those rows is « ? » in every column —
 * never a 0 — and says what is missing under its name (« missing: gross margin »); the CAC and
 * the new MRR still move.
 */
export const NoMargin = () => (
  <div style={{ maxWidth: 610 }}>
    <WhatIfFigures
      groups={[
        {
          id: "growth",
          title: "Growth",
          rows: [
            { id: "newMrr", label: "New MRR a month", today: "~€5,000", whatif: "~€6,700", change: "+€1,700 · better" },
            { id: "nrr", label: "Monthly NRR", today: "100%", whatif: "100%", change: "unchanged" },
            { id: "grr", label: "Monthly GRR", today: "96%", whatif: "96%", change: "unchanged" },
          ],
        },
        {
          id: "customer",
          title: "One new customer",
          rows: [
            { id: "cac", label: "CAC", today: "~€500", whatif: "~€380", change: "−€130 · better" },
            { id: "ltv", label: "LTV", today: "?", whatif: "?", change: "?", missing: "missing: gross margin" },
            { id: "ltvCac", label: "LTV:CAC", today: "?", whatif: "?", change: "?", missing: "missing: gross margin" },
            { id: "gap", label: "Per new customer", today: "?", whatif: "?", change: "?", missing: "missing: gross margin" },
            { id: "payback", label: "CAC payback", today: "?", whatif: "?", change: "?", missing: "missing: gross margin" },
            { id: "after", label: "Months after payback", today: "?", whatif: "?", change: "?", missing: "missing: gross margin" },
          ],
        },
        {
          id: "cash",
          title: "Cash",
          rows: [
            { id: "spend", label: "Spent on acquisition a month", today: "€21,000", whatif: "€21,000", change: "unchanged" },
            { id: "cash", label: "Cash tied up", today: "?", whatif: "?", change: "?", missing: "missing: gross margin" },
          ],
        },
      ]}
      moved
      columns={{ figure: "Figure", today: "Today", whatif: "With your what-ifs", change: "Change" }}
      todayLine={(value) => "today {value}".replace("{value}", String(value))}
    />
  </div>
);

/**
 * The sales-assisted panel of the hybrid (`hybridLossState()`, whose sales-assisted margin is
 * 75%), in English, its win rate moved from 24% to 30%: the growth table counts the quarter's
 * new customers in place of the GRR, and the NRR is the twelve-month one, a range.
 */
export const SalesAssisted = () => (
  <div style={{ maxWidth: 610 }}>
    <WhatIfFigures
      groups={[
        {
          id: "growth",
          title: "Growth",
          rows: [
            { id: "newMrr", label: "New MRR a month", today: "~€12,000", whatif: "~€15,000", change: "+€3,000 · better" },
            { id: "nrr", label: "12-month NRR", today: "104–108%", whatif: "104–108%", change: "unchanged" },
            { id: "won", label: "New customers a quarter", today: "18", whatif: "23", change: "+5 · better" },
          ],
        },
        {
          id: "customer",
          title: "One new customer",
          rows: [
            { id: "cac", label: "CAC", today: "~€19,000", whatif: "~€15,000", change: "−€3,800 · better" },
            { id: "ltv", label: "LTV", today: "~€54,000", whatif: "~€54,000", change: "unchanged" },
            { id: "ltvCac", label: "LTV:CAC", today: "2.8×", whatif: "3.6×", change: "+0.71 · better" },
            { id: "gap", label: "Per new customer", today: "~€35,000 more", whatif: "~€39,000 more", change: "+€3,800 · better" },
            { id: "payback", label: "CAC payback", today: "13 months", whatif: "10 months", change: "−3 months · better" },
            { id: "after", label: "Months after payback", today: "~23 months", whatif: "~26 months", change: "+3 months · better" },
          ],
        },
        {
          id: "cash",
          title: "Cash",
          rows: [
            { id: "spend", label: "Spent on acquisition a month", today: "€114,000", whatif: "€114,000", change: "unchanged" },
            { id: "cash", label: "Cash tied up", today: "~€720,000", whatif: "~€580,000", change: "−€140,000 · better" },
          ],
        },
      ]}
      moved
      columns={{ figure: "Figure", today: "Today", whatif: "With your what-ifs", change: "Change" }}
      todayLine={(value) => "today {value}".replace("{value}", String(value))}
    />
  </div>
);

/**
 * The film's SaaS in French, the activation rate moved from 18 % to 24 %, at a phone's width
 * (358px): under 520px the component's own container query folds the « Aujourd'hui » column
 * into the what-if cell as a second line (« aujourd'hui ~5 900 € »), so three columns hold
 * without a horizontal scroll. The customer stops leaving first: « part ~4 mois avant » → ~1 mois.
 */
export const Phone = () => (
  <div style={{ maxWidth: 358 }}>
    <WhatIfFigures
      groups={[
        {
          id: "growth",
          title: "Croissance",
          rows: [
            { id: "newMrr", label: "Nouveau MRR par mois", today: "~5 900 €", whatif: "~7 900 €", change: "+2 000 € · mieux" },
            { id: "nrr", label: "NRR mensuelle", today: "95 %", whatif: "95 %", change: "stable" },
            { id: "grr", label: "GRR mensuelle", today: "93 %", whatif: "93 %", change: "stable" },
          ],
        },
        {
          id: "customer",
          title: "Un nouveau client",
          rows: [
            { id: "cac", label: "CAC", today: "~1 900 €", whatif: "~1 400 €", change: "−480 € · mieux" },
            { id: "ltv", label: "LTV", today: "~1 500 €", whatif: "~1 500 €", change: "stable" },
            { id: "ltvCac", label: "LTV:CAC", today: "0,79 fois", whatif: "1,1 fois", change: "+0,26 · mieux" },
            { id: "gap", label: "Par nouveau client", today: "il manque ~400 €", whatif: "~75 € de plus", change: "+480 € · mieux" },
            { id: "payback", label: "CAC payback", today: "21 mois", whatif: "16 mois", change: "−5 mois · mieux" },
            { id: "after", label: "Mois après remboursement", today: "part ~4 mois avant", whatif: "~1 mois", change: "+5 mois · mieux" },
          ],
        },
        {
          id: "cash",
          title: "Trésorerie",
          rows: [
            { id: "spend", label: "Dépensé en acquisition par mois", today: "93 480 €", whatif: "93 480 €", change: "stable" },
            { id: "cash", label: "Trésorerie immobilisée", today: "~990 000 €", whatif: "~740 000 €", change: "−250 000 € · mieux" },
          ],
        },
      ]}
      moved
      columns={{ figure: "Chiffre", today: "Aujourd'hui", whatif: "Avec tes « Et si »", change: "Écart" }}
      todayLine={(value) => "aujourd'hui {value}".replace("{value}", String(value))}
    />
  </div>
);
