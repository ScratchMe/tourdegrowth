# COPY — brief 09, the engine's money

*Every new or changed string of design system extension 09, French and
English side by side, with the screen it sits on. Generated from
`board/copy.js` by `board/make-copy.mjs`: the board draws these very
strings. For Antoine's review (the bon à tirer) before anything ships.*

- **Screens** are the board's ids (`board.html?screen=…`); `board-*`
  means every board state, `slide-unit-*` every unit-economics slide.
- **French typography**: the strings carry U+202F (narrow no-break space)
  before « : ; ? ! » and inside « », and in grouped figures (« 48 000 € »).
  `tu` on screens, « on » / « nous » on slides. Stage names stay in English.
- `{…}` are slots the engine fills, already formatted (board/fmt.js): the
  euro after the figure in French, before it in English; two significant
  digits and "~" for anything projected or estimated; facts to the unit;
  a range "€1,500–2,300" / « 1 500 à 2 300 € »; an unknown "?".
- French uses the engine's own word for contraction, « rétrogradation ».

## To review: 92 strings (85 new, 7 changed)

### The money on the board (MoneyBlock)

| Key | Screen | English | Français | Today |
|---|---|---|---|---|
| `money.eyebrow` | board-*, cash-*, hybrid-* | The money · {month} | L'argent · {month} | **new** |
| `money.mrr` | board-*, cash-* | MRR | MRR | **new** |
| `money.arr` | board-*, cash-* | ARR, the MRR × 12 | ARR, le MRR × 12 | **new** |
| `worth.title` | board-*, cash-*, hybrid-* | What one new customer is worth | Ce que vaut un nouveau client | **new** |
| `worth.tag.loss` | board-loss, hybrid-ss | Loss | Perte | **new** |
| `worth.tag.maybe` | board-maybe | Maybe a loss | Perte possible | **new** |
| `worth.loss` | board-loss, hybrid-ss | Each new customer costs {cac} and brings back {ltv} of margin: you lose {gap} on each one. | Chaque nouveau client coûte {cac} et rapporte {ltv} de marge : tu perds {gap} sur chacun. | **new** |
| `worth.maybe` | board-maybe | A new customer costs {cac} and brings back {ltv} of margin: it may not pay back what it costs. | Un nouveau client coûte {cac} et rapporte {ltv} de marge : il ne rembourse peut-être pas ce qu'il coûte. | **new** |
| `worth.maybeWhy` | board-maybe | The range comes from your monthly logo churn, estimated at {range}: pin it down and the engine will tell. | La fourchette vient de ton churn logo mensuel, estimé {range} : précise-le et le moteur tranchera. | **new** |
| `worth.healthy` | board-healthy, cash-*, hybrid-sa | Each new customer costs {cac} and brings back {ltv} of margin: {gap} more than it costs. | Chaque nouveau client coûte {cac} et rapporte {ltv} de marge : {gap} de plus que ce qu'il coûte. | **new** |
| `worth.none` | board-nomargin | We can't tell yet what a new customer brings back: the gross margin is missing. | On ne peut pas encore dire ce que rapporte un nouveau client : il manque la marge brute. | **new** |
| `worth.noneNote` | board-nomargin | Without it, no LTV, no payback, no cash figure: computed on revenue, they would flatter your engine. | Sans elle, pas de LTV, pas de payback, pas de trésorerie : calculés sur le chiffre d'affaires, ils flatteraient ton moteur. | **new** |
| `worth.costs` | board-*, cash-*, hybrid-* | Costs | Coûte | **new** |
| `worth.brings` | board-*, cash-*, hybrid-* | Brings back | Rapporte | **new** |
| `worth.short` | board-loss, hybrid-ss, whatif-three, whatif-expansion | {gap} short | il manque {gap} | **new** |
| `worth.more` | board-healthy, cash-*, hybrid-sa, whatif-three | {gap} more | {gap} de plus | **new** |
| `worth.overlap` | board-maybe | the two may cross | les deux peuvent se croiser | **new** |
| `worth.missing` | board-nomargin, slide-unit-nomargin | missing: gross margin | il manque la marge brute | **new** |
| `worth.monthsLoss` | board-loss, hybrid-ss | A customer stays {life}; paying back its cost would take {payback}: it leaves before. | Un client reste {life} ; rembourser son coût en prendrait {payback} : il part avant. | **new** |
| `worth.monthsMaybe` | board-maybe | A customer stays {life}; paying back its cost takes {payback}: it may leave before. | Un client reste {life} ; rembourser son coût en prend {payback} : il peut partir avant. | **new** |
| `worth.monthsHealthy` | board-healthy, cash-*, hybrid-sa | It pays back its cost in {payback} and stays {life}: {after} of margin after payback. | Il rembourse son coût en {payback} et reste {life} : {after} de marge après le remboursement. | **new** |

### The cash and its warning (MoneyBlock, CashWarning)

| Key | Screen | English | Français | Today |
|---|---|---|---|---|
| `cash.title` | board-*, cash-*, hybrid-*, whatif-three | Cash | Trésorerie | **new** |
| `cash.spend` | board-*, cash-*, hybrid-* | Spent on acquisition this month | Dépensé en acquisition ce mois-ci | **new** |
| `cash.tied` | board-*, cash-*, hybrid-* | Tied up at this pace | Immobilisé à ce rythme | **new** |
| `cash.lineLoss` | board-loss, hybrid-ss | And it does not all come back: customers leave before they pay back. | Et elle ne revient pas toute : les clients partent avant d'avoir remboursé. | **new** |
| `cash.lineMaybe` | board-maybe | Whether it all comes back depends on your churn: customers may leave before they pay back. | Qu'elle revienne toute dépend de ton churn : les clients peuvent partir avant d'avoir remboursé. | **new** |
| `cash.lineHealthy` | board-healthy, cash-*, hybrid-sa | It all comes back, as customers pay back. | Elle revient toute, au fil des remboursements. | **new** |
| `cash.lineNone` | board-nomargin | No cash figure without the margin: the payback is what says when the spend comes back. | Pas de trésorerie sans la marge : c'est le payback qui dit quand la dépense revient. | **new** |
| `cash.assumptions` | board-*, cash-*, hybrid-* | A floor: each month's spend comes back evenly over the payback, so half of it is out at any time; churn and contraction slow the return and are not counted. Monthly billing. | Un plancher : la dépense de chaque mois revient régulièrement sur la durée du payback, la moitié est donc dehors à tout moment ; le churn et la rétrogradation ralentissent le retour et ne sont pas comptés. Facturation mensuelle. | **new** |
| `cash.assumptionsAnnual` | hybrid-sa | A floor: each month's spend comes back evenly over the payback, so half of it is out at any time; non-renewals slow the return and are not counted. Monthly billing assumed: a year paid up front comes back sooner. | Un plancher : la dépense de chaque mois revient régulièrement sur la durée du payback, la moitié est donc dehors à tout moment ; les non-renouvellements ralentissent le retour et ne sont pas comptés. Facturation mensuelle supposée : une année payée d'avance revient plus tôt. | **new** |
| `cash.warn` | cash-runway | Paying back a customer takes {payback}, longer than {limit}: you make money, but maybe after your cash runs out. | Rembourser un client prend {payback}, plus que {limit} : tu gagnes de l'argent, mais peut-être après la fin de ta trésorerie. | **new** |
| `cash.warnMaybe` | cash-maybe | Paying back a customer takes {payback}: maybe longer than {limit}. | Rembourser un client prend {payback} : peut-être plus que {limit}. | **new** |
| `cash.limit.runway` | cash-runway, cash-maybe | your runway ({n} months) | ton runway ({n} mois) | **new** |
| `cash.limit.target` | cash-runway | your payback target ({n} months) | ta cible de payback ({n} mois) | **new** |

### Settings: the runway (C49)

| Key | Screen | English | Français | Today |
|---|---|---|---|---|
| `settings.cash` | settings-runway | Cash | Trésorerie | **new** |
| `settings.runway` | settings-runway | Runway, in months | Runway, en mois | **new** |
| `settings.runwayHint` | settings-runway | Optional. Only used to warn you when paying back a customer takes longer. | Facultatif. Sert seulement à te prévenir quand rembourser un client prend plus longtemps. | **new** |
| `settings.months` | settings-runway | months | mois | **new** |

### What if? — the card (LeverCard, MrrCurve)

| Key | Screen | English | Français | Today |
|---|---|---|---|---|
| `whatif.movedThree` | whatif-three | What if: your three levers, together | Et si : tes trois leviers, ensemble | **new** |
| `whatif.arr12` | whatif-*, board-*, hybrid-* | ARR in 12 months | ARR dans 12 mois | *was* New paying customers a month (moves to the panel) |
| `whatif.worthOut` | whatif-churn, whatif-three | One new customer: no longer a loss. It brings back {ltv} for {cac}: {gap} more. | Un nouveau client : plus de perte. Il rapporte {ltv} pour {cac} : {gap} de plus. | **new** |
| `whatif.worthStill` | whatif-expansion | One new customer: still a loss of {gap}. {lever} changes neither what a customer brings back nor what it costs. | Un nouveau client : toujours une perte de {gap}. {lever} ne change ni ce que rapporte un client ni ce qu'il coûte. | **new** |
| `whatif.totalBoth` | hybrid-ss | Both engines in 12 months: {whatif} of MRR with this what-if (today {today}). | Les deux moteurs dans 12 mois : {whatif} de MRR avec cet « Et si » (aujourd'hui {today}). | **new** |
| `curve.today` | whatif-*, board-*, slide-whatif-one, slide-together, hybrid-* | at today's pace | au rythme d'aujourd'hui | **new** |
| `curve.whatif` | whatif-churn, whatif-three, whatif-expansion | with your what-ifs | avec tes « Et si » | **new** |
| `curve.whatifSlide` | slide-whatif-one | with this what-if | avec cet « Et si » | **new** |
| `curve.togetherSlide` | slide-together | with the 3 what-ifs | avec les 3 « Et si » | **new** |
| `curve.start` | whatif-*, board-*, slide-whatif-one, slide-together, hybrid-* | {mrr} today | {mrr} aujourd'hui | **new** |
| `curve.summary` | whatif-*, board-* | The MRR month by month, from {start} today to {today} in 12 months at today's pace. | Le MRR mois par mois, de {start} aujourd'hui à {today} dans 12 mois au rythme actuel. | **new** |
| `curve.summaryWhatif` | whatif-* | The MRR month by month, from {start} today: {today} in 12 months at today's pace, {whatif} with your what-ifs. | Le MRR mois par mois, depuis {start} aujourd'hui : {today} dans 12 mois au rythme actuel, {whatif} avec tes « Et si ». | **new** |

### What if? — the panel (WhatIfFigures, LeverSum)

| Key | Screen | English | Français | Today |
|---|---|---|---|---|
| `panel.group.growth` | whatif-three, whatif-expansion | Growth | Croissance | **new** |
| `panel.group.customer` | whatif-three, whatif-expansion | One new customer | Un nouveau client | **new** |
| `panel.group.cash` | whatif-three, whatif-expansion | Cash | Trésorerie | **new** |
| `panel.col.figure` | whatif-three, whatif-expansion | Figure | Chiffre | **new** |
| `row.arr12` | whatif-*, slide-whatif-one, slide-together | ARR in 12 months | ARR dans 12 mois | **new** |
| `row.gap` | whatif-* | Per new customer | Par nouveau client | **new** |
| `row.after` | whatif-*, slide-unit-* | Months after payback | Mois après remboursement | **new** |
| `row.spend` | whatif-* | Spent on acquisition a month | Dépensé en acquisition par mois | **new** |
| `row.cash` | whatif-*, slide-* | Cash tied up | Trésorerie immobilisée | **new** |
| `row.leavesFirst` | whatif-*, slide-unit-loss | leaves first | part avant | **new** |
| `sum.oneByOne` | whatif-three, slide-together | Each alone, added up | Chacun seul, additionnés | **new** |
| `sum.extra` | whatif-three, slide-together | Together they bring {extra} more than each alone, added up: each lever works on what the others add. That's compounding. | Ensemble, ils rapportent {extra} de plus que chacun seul, additionnés : chaque levier agit sur ce que les autres ajoutent. C'est l'effet composé. | *was* Together: +€42,000, i.e. ~€4,400 more than the sum of the levers alone: that's compounding. |
| `panel.assumeCash` | whatif-three, whatif-expansion | Cash tied up: the month's acquisition spend × the payback ÷ 2. Each month's spend comes back evenly over the payback; churn and contraction, which slow it, are not counted (a floor), unless expansion outpaces them. Monthly billing. The same spend with the what-ifs: more payers make each one cheaper. | Trésorerie immobilisée : la dépense d'acquisition du mois × le payback ÷ 2. La dépense de chaque mois revient régulièrement sur le payback ; le churn et la rétrogradation, qui la ralentissent, ne sont pas comptés (un plancher), sauf si l'expansion les dépasse. Facturation mensuelle. Même dépense avec les « Et si » : plus de payants rendent chacun moins cher. | **new** |
| `panel.assumeLtv` | whatif-three, whatif-expansion | LTV: the monthly margin over a customer's counted lifetime (1 ÷ churn, capped at 36 months), on today's ARPA: expansion is not in it. | LTV : la marge mensuelle sur la durée de vie comptée d'un client (1 ÷ churn, plafonnée à 36 mois), à l'ARPA d'aujourd'hui : l'expansion n'y entre pas. | **new** |

### The hybrid (TotalBand)

| Key | Screen | English | Français | Today |
|---|---|---|---|---|
| `total.arr` | hybrid-* | ARR total | ARR total | **new** |
| `total.mrr12` | hybrid-* | MRR in 12 months at today's pace | MRR dans 12 mois au rythme actuel | **new** |
| `total.cash` | hybrid-* | Cash tied up, total | Trésorerie immobilisée totale | **new** |
| `sa.months` | hybrid-sa | A customer stays {life} (the count stops at 36): its renewals come up once a year. | Un client reste {life} (le compte s'arrête à 36) : ses renouvellements reviennent une fois par an. | **new** |
| `sa.curve` | hybrid-sa | Annual contracts come up for renewal evenly over the year: the base moves in a straight line. | Les contrats annuels arrivent à renouvellement régulièrement dans l'année : la base avance en ligne droite. | **new** |

### The slides (SlideUnitEconomics, PaybackChart, SlideWhatIf)

| Key | Screen | English | Français | Today |
|---|---|---|---|---|
| `slide.unit.titleLoss` | slide-unit-loss, deck-order | Each new customer costs us {cac} and brings back {ltv}: we lose {gap} on each one. | Chaque nouveau client nous coûte {cac} et en rapporte {ltv} : on perd {gap} sur chacun. | *was* A customer pays back its acquisition cost in 21 months and brings back 0.79 times what it costs. (21 months and 0.79 in red) |
| `slide.unit.titleBoth` | slide-unit-both | Self-serve: we lose {gapSs} on each new customer. Sales-assisted: paid back in {paybackSa}. | Libre-service : on perd {gapSs} par nouveau client. Assisté : remboursé en {paybackSa}. | **new** |
| `slide.chart.cost` | slide-unit-* | what a new customer costs | ce que coûte un nouveau client | **new** |
| `slide.chart.leaves` | slide-unit-* | leaves at ~{life} months | part vers {life} mois | **new** |
| `slide.chart.wouldPayBack` | slide-unit-loss, slide-unit-both | would pay back at {payback} months | rembourserait à {payback} mois | **new** |
| `slide.chart.paysBack` | slide-unit-healthy, slide-unit-both | paid back: {payback} months | remboursé : {payback} mois | **new** |
| `slide.chart.short` | slide-unit-loss, slide-unit-both | {gap} short | il manque {gap} | **new** |
| `slide.chart.after` | slide-unit-healthy, slide-unit-both | ~{after} months of margin after | ~{after} mois de marge après | **new** |
| `slide.chart.timeLoss` | slide-unit-both | leaves at ~{life} months; would pay back at {payback} | part vers {life} mois ; rembourserait à {payback} mois | **new** |
| `slide.chart.timeHealthy` | slide-unit-both | paid back at {payback} months, then ~{after} months of margin | remboursé à {payback} mois, puis ~{after} mois de marge | **new** |
| `slide.chart.summaryLoss` | slide-unit-loss | One customer, month by month: it brings back {mm} of margin a month and leaves after about {life} months, {gap} short of the {cac} it cost; it would have paid back at {payback} months. | Un client, mois par mois : il rapporte {mm} de marge par mois et part après environ {life} mois, à {gap} des {cac} qu'il a coûté ; il aurait remboursé à {payback} mois. | **new** |
| `slide.chart.summaryHealthy` | slide-unit-healthy | One customer, month by month: it brings back {mm} of margin a month, pays back its {cac} at {payback} months and stays {life}. | Un client, mois par mois : il rapporte {mm} de marge par mois, rembourse ses {cac} à {payback} mois et reste {life}. | **new** |
| `slide.chart.summaryNone` | slide-unit-nomargin | One customer, month by month: its cost is known ({cac}), what it brings back is not: the gross margin is missing. | Un client, mois par mois : son coût est connu ({cac}), ce qu'il rapporte non : il manque la marge brute. | **new** |
| `slide.tile.leavesBefore` | slide-unit-loss | leaves ~{n} months before paying back | part ~{n} mois avant d'avoir remboursé | **new** |
| `slide.tile.notAllBack` | slide-unit-loss, slide-unit-both | does not all come back | ne revient pas toute | **new** |
| `slide.tile.floor` | slide-unit-healthy, slide-unit-both | a floor · monthly billing | un plancher · facturation mensuelle | **new** |
| `slide.tile.reference` | slide-unit-* | an often-cited reference: about 3:1 | repère souvent cité : environ 3:1 | **new** |
| `slide.tile.missing` | slide-unit-nomargin | missing: gross margin | il manque la marge brute | *was* can't be computed: the gross margin is missing / incalculable — il manque la marge brute |
| `slide.retention` | slide-unit-* | Monthly GRR {grr} · NRR {nrr} — approximate: logo churn stands in for revenue churn, as if lost customers paid the average ARPA. | GRR mensuelle {grr} · NRR {nrr} — approximatives : le churn logo tient lieu de churn en revenu, comme si les clients partis payaient l'ARPA moyen. | *was* two tiles (GRR, NRR) with the same note under each |
| `slide.unit.assume` | slide-unit-* | Cash tied up: a month's acquisition spend × the payback ÷ 2 — a floor, monthly billing. | Trésorerie immobilisée : la dépense d'acquisition du mois × le payback ÷ 2 — un plancher, facturation mensuelle. | **new** |
| `slide.whatif.funnelStill` | slide-whatif-one | This lever leaves the month's funnel as it is. | Ce levier laisse le funnel du mois tel quel. | *was* the table “The month's funnel”, all rows “stable” |
| `slide.bothNote` | slide-unit-both | Self-serve: monthly GRR {grr} · NRR {nrr}, approximate (logo churn). Sales-assisted: renewal {renewal} a year. Cash tied up: a month's spend × the payback ÷ 2 — a floor, monthly billing. Dotted, at 12 months: a commonly cited reference. | Libre-service : GRR {grr} · NRR {nrr} par mois, approximatives (churn logo). Assisté : renouvellement {renewal} par an. Trésorerie immobilisée : dépense du mois × payback ÷ 2, un plancher, facturation mensuelle. Pointillé à 12 mois : repère couramment cité. | **new** |

### The page's first screen (C52)

| Key | Screen | English | Français | Today |
|---|---|---|---|---|
| `landing.positioning` | arrival | Seventeen numbers in self-serve, fifteen sales-assisted: go and get them, see where your engine loses people and what each new customer earns you, and leave with slides for your leadership meeting, your board or your investors. Your numbers are compared only with yourself and your own target: published references are there to situate, never to name a stage. | Dix-sept chiffres en libre-service, quinze en assisté : va les chercher, vois où ton moteur perd du monde et ce que te rapporte chaque nouveau client, et repars avec des slides pour ton CODIR, ton board ou tes investisseurs. Tes chiffres ne sont comparés qu'à toi-même et à ta propre cible : les repères publiés sont là pour situer, jamais pour désigner une étape. | *was* Seventeen numbers in self-serve, fifteen sales-assisted: go and get them, see where your engine loses people and leave with slides ready for your leadership meeting. Your numbers are compared only with yourself and your own target: published references are there to situate, never to name a stage. / FR: « … et repars avec des slides prêtes pour ton CODIR. … » |

## The three words the money teaches: 3 new definitions

For the engine's "?" (EngineTerm, return 07's five words as ported: one
definition open at a time), where each word is first needed (README, Q14).
ARR is already in the glossary: its label says it ("ARR, the MRR × 12") and
it gets no new "?".

| Term | Where its "?" sits | English | Français |
|---|---|---|---|
| Cash tied up / Trésorerie immobilisée | board-*, cash-* (the cash part: “Tied up at this pace ?”) | What your acquisition keeps out of the bank at any time. Each month you spend to win new customers; each of them pays that back over the payback. At a steady pace, half a payback's worth of spend is out. A floor: churn and contraction slow the return. | Ce que ton acquisition garde hors de la banque à tout moment. Chaque mois, tu dépenses pour gagner des clients ; chacun te le rembourse sur la durée du payback. À rythme constant, la moitié de cette dépense est dehors. Un plancher : le churn et la rétrogradation ralentissent le retour. |
| Months after payback / Mois après remboursement | board-healthy, cash-* (the line “…of margin after payback ?”), shown only when the customer pays back | How long a customer keeps paying once its acquisition cost is paid back: its lifetime minus the payback. Below zero, it leaves before paying back: that is the loss, said in months. | Combien de temps un client continue de payer une fois son coût d'acquisition remboursé : sa durée de vie moins le payback. Sous zéro, il part avant d'avoir remboursé : c'est la perte, dite en mois. |
| Runway / Runway | settings-runway (the runway field's hint) | How many months your cash lasts at today's spending. Optional: the engine only compares it with the payback, to warn you. It stays on this device. | Le nombre de mois que couvre ta trésorerie au rythme actuel des dépenses. Facultatif : le moteur le compare seulement au payback, pour te prévenir. Il reste sur cet appareil. |

## Outputs of functions that stay (not new copy)

The slides' titles that today's functions already write, drawn with the
screens' data, and the healthy title's figures. Listed so nobody mistakes
them for new copy.

| Key | Screen | English | Français |
|---|---|---|---|
| `slide.unit.titleHealthy` | slide-unit-healthy | A customer pays back its acquisition cost in {payback} and brings back {ratio} times what it costs. | Un client rembourse son coût d'acquisition en {payback} et rapporte {ratio} fois ce qu'il coûte. |
| `slide.whatif.titleOne` | slide-whatif-one | If logo churn fell to {to} ({from} today), MRR in 12 months would gain {gain}. | Si le churn logo passait à {to} (aujourd'hui {from}), le MRR dans 12 mois gagnerait {gain}. |
| `slide.whatif.titleTogether` | slide-together | With the 3 what-ifs together, MRR in 12 months would gain {gain}. | Avec les 3 « Et si » ensemble, le MRR dans 12 mois gagnerait {gain}. |

## The board's own labels (the deck-order screen; not product copy)

| Key | English | Français |
|---|---|---|
| `deck.title` | The deck, when the loss is certain | Le deck, quand la perte est certaine |
| `deck.s1` | The funnel — your verdict | Le funnel — ton verdict |
| `deck.s2` | Unit economics — the loss | Unit economics — la perte |
| `deck.s3` | The stage that holds you back | L'étape qui freine |
| `deck.moved` | moved up from № 8: the loss is certain | remonte du № 8 : la perte est certaine |
| `deck.rest` | Then the other slides, in today's order | Puis les autres slides, dans l'ordre d'aujourd'hui |
| `deck.s4` | What if? — one lever, then together | Et si ? — un levier, puis ensemble |

## Kept as they are today: 91 strings

Drawn on the board for context, unchanged (A18, as on brief 09's
screenshots). Where a screenshot did not show today's exact wording, the
board writes the closest it could and the app keeps its own.

| Key | English | Français |
|---|---|---|
| `bar.line` | Unnamed engine · Self-serve · {month} | Moteur sans nom · Libre-service · {month} |
| `bar.lineBoth` | Unnamed engine · Self-serve and sales-assisted · {month} | Moteur sans nom · Libre-service et assisté · {month} |
| `bar.neverSaved` | Never saved | Jamais sauvegardé |
| `bar.menu` | Engine, month and file | Moteur, mois et fichier |
| `next.since` | Last visit · today | Dernière visite · aujourd'hui |
| `next.waiting` | Nothing left to type: one number you asked for is waiting for an answer. | Plus rien à taper : un chiffre demandé attend sa réponse. |
| `next.go.slides` | Prepare your slides → | Prépare tes slides → |
| `next.verdictIsSlide` | Your verdict above is the title of your first slide. | Ton verdict, ci-dessus, est le titre de ta première slide. |
| `next.backup` | Never saved to a file: Safari may erase it after seven days of use without a visit here. | Jamais sauvegardé dans un fichier : Safari peut l'effacer après sept jours d'utilisation sans passage ici. |
| `next.saveNow` | Save (.json) | Sauvegarder (.json) |
| `next.hybrid` | No more quick number: you find it yourself, in about an hour. | Plus de chiffre rapide : tu le trouves seul, en une heure environ. |
| `next.go.hybrid` | Next number: time to production → | Chiffre suivant : délai de mise en production → |
| `diag.eyebrow` | One stage holds the engine back | Une étape freine le moteur |
| `diag.number` | Monthly logo churn | Churn logo mensuel |
| `diag.value` | {value}, above your target ({target}) | {value}, au-dessus de ta cible ({target}) |
| `diag.hiding` | With no number for day-30 retention, the stage really holding the engine back may be hiding there. | Sans chiffre pour la rétention à J30, l'étape qui freine vraiment le moteur s'y cache peut-être. |
| `diag.top` | The biggest loss in numbers is always at the top of the funnel; that's not what names the stage holding you back. | La plus grosse perte en nombre est toujours en haut du funnel ; ce n'est pas elle qui désigne l'étape qui freine. |
| `peloton.title` | Per 100 sign-ups | Pour 100 inscrits |
| `peloton.lead` | ~3,200 visitors a month for 100 sign-ups · GA4 · August 2026 | ~3 200 visiteurs par mois pour 100 inscrits · GA4 · août 2026 |
| `peloton.c1` | Sign-ups | Inscrits |
| `peloton.c2` | Activated | Activés |
| `peloton.c3` | Active at day 30 | Actifs à J30 |
| `peloton.c4` | Paying by day 30 | Payants à J30 |
| `peloton.s1` | 800 sign-ups in July 2026, scaled to 100 | 800 inscrits en juillet 2026, ramenés à 100 |
| `peloton.s2` | Amplitude · July 2026 | Amplitude · juillet 2026 |
| `peloton.s3` | not measured | non mesuré |
| `peloton.s4` | GA4 · July 2026 | GA4 · juillet 2026 |
| `list.title` | Your numbers | Tes chiffres |
| `list.computed` | Computed from yours ({n}) | Calculés à partir des tiens ({n}) |
| `tour.title` | The Tour and your numbers | Le Tour et tes chiffres |
| `settings.title` | Settings | Réglages |
| `settings.save` | Save settings | Enregistrer les réglages |
| `whatif.title` | What if? | Et si ? |
| `whatif.untouched` | Move the lever of the stage that holds you back, and see what follows. | Bouge le levier de l'étape qui freine, et vois ce qui suit. |
| `whatif.moved` | What if: {lever}, {to} instead of {from}, with your other levers | Et si : {lever}, {to} au lieu de {from}, avec tes autres leviers |
| `whatif.lever` | {lever} (today {value}) | {lever} (aujourd'hui {value}) |
| `whatif.mrr12` | MRR in 12 months | MRR dans 12 mois |
| `whatif.today` | today {value} | aujourd'hui {value} |
| `whatif.all` | See all 8 levers and what the calculation assumes → | Vois les 8 leviers et ce que le calcul suppose → |
| `whatif.reset` | Back to today | Remettre à aujourd'hui |
| `panel.intro` | Move one lever or several: the month's funnel and your growth numbers recompute together, and the effects add up. | Bouge un ou plusieurs leviers : le funnel du mois et tes chiffres de croissance se recalculent ensemble, les effets se cumulent. |
| `panel.untouchedNote` | No lever moved: the funnel and the figures are today's. | Aucun levier bougé : le funnel et les chiffres sont ceux d'aujourd'hui. |
| `fmt.points` | {n} pt | {n} points |
| `panel.levers` | The levers | Les leviers |
| `panel.allBack` | All back to today | Tout remettre à aujourd'hui |
| `panel.figures` | Your growth figures | Tes chiffres de croissance |
| `panel.col.today` | Today | Aujourd'hui |
| `panel.col.whatif` | With your what-ifs | Avec tes « Et si » |
| `panel.col.change` | Change | Écart |
| `row.mrr12` | MRR in 12 months | MRR dans 12 mois |
| `row.newMrr` | New MRR a month | Nouveau MRR par mois |
| `row.nrr` | Monthly NRR | NRR mensuelle |
| `row.grr` | Monthly GRR | GRR mensuelle |
| `row.cac` | CAC | CAC |
| `row.ltv` | LTV | LTV |
| `row.ratio` | LTV:CAC | LTV:CAC |
| `row.payback` | CAC payback | CAC payback |
| `row.stable` | stable | stable |
| `sum.title` | What each lever brings on its own, on MRR in 12 months | Ce que chaque levier rapporte seul, sur le MRR dans 12 mois |
| `sum.lever` | {lever}: {from} → {to} | {lever} : {from} → {to} |
| `sum.together` | Together | Ensemble |
| `panel.assumptions` | What the calculation assumes | Ce que le calcul suppose |
| `total.eyebrow` | Two engines, one total | Deux moteurs, un total |
| `total.title` | MRR reaches {total}: {ss} in self-serve, {sa} sales-assisted. | Le MRR atteint {total} : {ss} en libre-service, {sa} en assisté. |
| `total.ss` | MRR self-serve | MRR libre-service |
| `total.sa` | MRR sales-assisted | MRR assisté |
| `total.total` | MRR total | MRR total |
| `total.link` | 31 opportunities came from self-serve (June to August 2026). A share of the pipeline, not an attribution: we don't know how many of these accounts would have signed without self-serve. | 31 opportunités sont venues du libre-service (juin à août 2026). Une part du pipeline, pas une attribution : on ne sait pas combien de ces comptes auraient signé sans le libre-service. |
| `hybrid.shown` | Engine shown | Moteur affiché |
| `hybrid.ss` | Self-serve | Libre-service |
| `hybrid.sa` | Sales-assisted | Assisté |
| `sa.lever` | Renewal rate | Taux de renouvellement |
| `sa.untouched` | Move the lever of the stage that holds you back, and see what follows. | Bouge le levier de l'étape qui freine, et vois ce qui suit. |
| `slide.header` | Growth engine · August 2026 · internal data | Moteur de growth · août 2026 · données internes |
| `slide.badge` | Data: measured {m} · approximate {a} · not found {n} | Données : mesurées {m} · approximatives {a} · introuvables {n} |
| `slide.sources` | Sign-ups in July 2026 · flows: August 2026 · sources: GA4, Amplitude, product database and Stripe | Inscrits en juillet 2026 · flux : août 2026 · sources : GA4, Amplitude, Base produit et Stripe |
| `slide.unit.titleNone` | We can't say yet what a customer brings back. The gross margin is missing. | On ne peut pas encore dire ce que rapporte un client. Il manque la marge brute. |
| `slide.chart.reference` | 12 months · a commonly cited reference | 12 mois · repère couramment cité |
| `slide.chart.months` | 0\|12\|24\|36 months | 0\|12\|24\|36 mois |
| `slide.whatif.figures` | Growth figures | Les chiffres de croissance |
| `slide.whatif.with` | With this what-if | Avec cet « Et si » |
| `slide.whatif.withAll` | With the what-ifs | Avec les « Et si » |
| `slide.whatif.assume` | Logo churn stands in for revenue churn, as if lost customers paid the average ARPA. Over 12 months at this month's pace: the base kept by the NRR each month, plus the month's new MRR. No seasonality, no saturation. | Le churn logo tient lieu de churn en revenu, comme si les clients partis payaient l'ARPA moyen. Sur 12 mois, au rythme de ce mois : la base retenue à la NRR chaque mois, plus le nouveau MRR du mois. Ni saisonnalité, ni saturation. |
| `landing.eyebrow` | The engine | Le moteur |
| `landing.h1` | Your growth engine | Ton moteur de growth |
| `landing.lede` | Your Tour tells you whether you measure. The engine shows what your numbers say. | Ton Tour dit si tu mesures. Le moteur montre ce que disent tes chiffres. |
| `landing.promiseTitle` | Nothing you enter leaves this page | Rien de ce que tu saisis ne sort d'ici |
| `landing.promiseBody` | No number and no text you type leaves your browser. No account, no server: everything stays on this device, and you can check it in your browser's Network tab. The page counts its visits, without a cookie — never what you write in it. | Aucun chiffre ni aucun texte que tu saisis ne quitte ton navigateur. Pas de compte, pas de serveur : tout reste sur cet appareil, et tu peux le vérifier dans l'onglet Réseau de ton navigateur. La page compte ses visites, sans cookie — jamais ce que tu y écris. |
| `landing.promiseLine` | Nothing you enter leaves this page: your engine lives in this browser only. | Rien de ce que tu saisis ne sort d'ici : ton moteur ne vit que dans ce navigateur. |
| `landing.cta` | Enter your numbers → | Entre tes chiffres → |
| `landing.ctaNote` | Free, no account. Everything stays on your device. | Gratuit, sans compte. Tout reste sur ton appareil. |
