# COPY — brief 10, the marketplace

*Every new, changed or given string of design system extension 10, in
English and French and in both vocabularies — "products" (buyers, sellers,
orders, listings) and "services" (clients, providers, bookings, profiles),
C65 — with the screen it sits on. Generated from `board/copy.js` by
`board/make-copy.mjs`: the board draws these very strings (add
`&vocab=services` to any screen). For Antoine's review (the bon à tirer)
before anything ships.*

- **Status**: *given* — brief 10's words (§22.8.5), used as written;
  *new* — does not exist today; *changed* — replaces today's string (in
  "Today"); *kept* — today's string, listed at the end for context.
- **Services**: "=" when the services string is the products one, word for
  word. Where it differs, it is written out in full: French changes the verb
  with the noun (« passer une commande », « faire une réservation »), so no
  string is built by swapping words.
- **Screens** are the board's ids (`board.html?screen=…`); `board-*` means
  every board state, `slide-demand-*` every demand slide.
- **French typography**: the strings carry U+202F (narrow no-break space)
  before « : ; ? ! » and inside « », and in grouped figures (« 32 854 € »).
  `tu` on screens, « on » / « nous » on slides. Stage names stay in English.
- `{…}` are slots the engine fills, already formatted (board/fmt.js): the
  euro after the figure in French, before it in English; two significant
  digits and "~" for anything projected; facts to the unit; an unknown "?".
- **Stressed words**: the words between double asterisks in a string are the
  ones a sentence stresses, as the brief's given copy marks them: bold ink
  on the board and the slides, never red (red is the leak's, one per side).

## To review: 193 strings (23 given, 113 new, 57 changed) — 104 with their own services words

### Shared: the engine bar and the next step

| Key | Status | Screen | English (products) | English (services) | Français (produits) | Français (services) | Today / why |
|---|---|---|---|---|---|---|---|
| `bar.line` | new | board-*, total-* | Unnamed engine · Marketplace · {month} | = | Moteur sans nom · Place de marché · {month} | = | The type in the engine line, as « Libre-service » is today. |
| `next.complete` | new | board-*, total-* | Nothing left to type, on either side. | = | Plus rien à taper, d'un côté comme de l'autre. | = | Today's « Plus rien à taper » for two sides: the step is the engine's, not a side's (README, question 2). |
| `next.totalIsSlide` | changed | board-*, total-moved | The total above is the title of your first slide. | = | Le total, ci-dessus, est le titre de ta première slide. | = | was: Your verdict above is the title of your first slide. / Ton verdict, ci-dessus, est le titre de ta première slide. |
| `next.buyersIsSlide` | new | board-supply-nosubs, board-demand-nosubs, total-nosubs | Your buyers' verdict, below, is the title of your first slide. | Your clients' verdict, below, is the title of your first slide. | Le verdict des acheteurs, plus bas, est le titre de ta première slide. | Le verdict des clients, plus bas, est le titre de ta première slide. | Without the subscriptions there is no total slide: the deck opens on the buyers' funnel (README, question 10). |

### Shared: the total (TotalBand)

| Key | Status | Screen | English (products) | English (services) | Français (produits) | Français (services) | Today / why |
|---|---|---|---|---|---|---|---|
| `total.eyebrow` | given | board-demand, board-supply, board-services*, board-demand-nomargin, total-moved | Two streams, one total | = | Deux flux, un total | = |  |
| `total.title` | given | board-demand, board-supply, board-services*, board-demand-nomargin, total-moved, slide-total | The marketplace brings in **{total}** a month: {demand} in commissions, {supply} in sellers' subscriptions. | The marketplace brings in **{total}** a month: {demand} in commissions, {supply} in providers' subscriptions. | La place de marché rapporte **{total}** par mois : {demand} de commissions, {supply} d'abonnements des vendeurs. | La place de marché rapporte **{total}** par mois : {demand} de commissions, {supply} d'abonnements des prestataires. |  |
| `total.demand` | given | board-demand, board-supply, board-services*, total-moved, slide-total | Commissions (net revenue) | = | Commissions (revenu net) | = |  |
| `total.supply` | given | board-demand, board-supply, board-services*, total-moved, slide-total | Sellers' subscriptions | Providers' subscriptions | Abonnements des vendeurs | Abonnements des prestataires |  |
| `total.total` | given | board-demand, board-supply, board-services*, total-moved, slide-total | Total a month | = | Total par mois | = |  |
| `total.annual` | new | board-demand, board-supply, board-services*, total-moved | Total, annualised | = | Total annualisé | = | TotalBand's `totals` (extension 09): what adds up across the two streams, and only that. |
| `total.fresh` | new | board-demand, board-supply, board-services*, total-moved | New a month | = | Nouveau chaque mois | = |  |
| `total.in12` | new | board-demand, board-supply, board-services* | In 12 months at today's pace | = | Dans 12 mois au rythme actuel | = | was: MRR in 12 months at today's pace / MRR dans 12 mois au rythme actuel (the hybrid) |
| `total.in12Moved` | new | total-moved | In 12 months with your what-ifs, both sides | = | Dans 12 mois avec tes « Et si », des deux côtés | = |  |
| `total.todayLine` | new | total-moved | At today's pace: {today} in 12 months. The what-ifs of both sides add up here, and only here. | = | Au rythme actuel : {today} dans 12 mois. Les « Et si » des deux côtés s'additionnent ici, et seulement ici. | = |  |

### The side selector (SideShown)

| Key | Status | Screen | English (products) | English (services) | Français (produits) | Français (services) | Today / why |
|---|---|---|---|---|---|---|---|
| `side.label` | given | board-*, total-* | Side shown | = | Côté affiché | = |  |
| `side.demand` | given | board-*, total-* | Demand | = | Demande | = |  |
| `side.supply` | given | board-*, total-* | Supply | = | Offre | = |  |
| `side.title.demand` | given | board-demand*, board-services, total-*, slide-demand-*, slide-services-funnel | Demand: the buyers | Demand: the clients | La demande : les acheteurs | La demande : les clients | Also the side's line above each of its slides' titles (question 10). |
| `side.title.supply` | given | board-supply*, board-services-supply, slide-supply-* | Supply: the sellers | Supply: the providers | L'offre : les vendeurs | L'offre : les prestataires |  |
| `side.note` | new | board-*, total-* | Two sides, two readings: each is read against its own targets, never against the other. | = | Deux côtés, deux lectures : chacun se lit contre ses propres cibles, jamais contre l'autre. | = | was: Two engines, two segments: each is read against its own targets, not against the other. (the hybrid) |

### A side's verdict

| Key | Status | Screen | English (products) | English (services) | Français (produits) | Français (services) | Today / why |
|---|---|---|---|---|---|---|---|
| `verdict.demand` | given | board-demand*, board-services, slide-demand-funnel, slide-services-funnel | Out of 100 buyer sign-ups, {first} place a first order and **{second} place a second one**. | Out of 100 client sign-ups, {first} make a first booking and **{second} make a second one**. | Sur 100 inscrits côté acheteurs, {first} passent une première commande et **{second} en passent une deuxième**. | Sur 100 inscrits côté clients, {first} font une première réservation et **{second} en font une deuxième**. | Services: the verb changes with the noun (« passer une commande », « faire une réservation »): a word swap would read « passent une première réservation ». |
| `verdict.supply` | given | board-supply, board-services-supply, slide-supply-funnel | Out of 100 seller sign-ups, {first} make a first sale and **{subs} subscribe**. | Out of 100 provider sign-ups, {first} do a first job and **{subs} subscribe**. | Sur 100 vendeurs inscrits, {first} font une première vente et **{subs} s'abonnent**. | Sur 100 prestataires inscrits, {first} réalisent une première prestation et **{subs} s'abonnent**. | Services: « première vente » would become « première réservation » — the clients' word. A provider's first is a job done: « première prestation » / "first job". |
| `verdict.supplyNoSubs` | new | board-supply-nosubs, slide-supply-nosubs | Out of 100 seller sign-ups, **{first} make a first sale**. | Out of 100 provider sign-ups, **{first} do a first job**. | Sur 100 vendeurs inscrits, **{first} font une première vente**. | Sur 100 prestataires inscrits, **{first} réalisent une première prestation**. |  |

### A side's diagnosis

| Key | Status | Screen | English (products) | English (services) | Français (produits) | Français (services) | Today / why |
|---|---|---|---|---|---|---|---|
| `diag.eyebrow.demand` | changed | board-demand*, board-services | One stage holds the buyers back | One stage holds the clients back | Une étape freine les acheteurs | Une étape freine les clients | was: One stage holds the engine back / Une étape freine le moteur |
| `diag.eyebrow.supply` | changed | board-supply, board-services-supply | One stage holds the sellers back | One stage holds the providers back | Une étape freine les vendeurs | Une étape freine les prestataires | was: One stage holds the engine back / Une étape freine le moteur |
| `diag.worth.demand` | given | board-demand*, board-services, slide-demand-leak | Bringing the fill rate to {target} would be worth **{worth} of new net revenue** every month. | = | Ramener le taux de service à {target} vaudrait **{worth} de revenu net nouveau** chaque mois. | = | The given words print « 468 € »; the engine prints a projection at two significant digits with « ~ » (the self-serve leak slide reads « ~600 € »): we draw « ~470 € ». Antoine decides. |
| `diag.worth.supply` | new | board-supply, board-services-supply, slide-supply-leak | Bringing subscription conversion to {target} would be worth **{worth} of new subscription MRR** every month. | = | Ramener la conversion à l'abonnement à {target} vaudrait **{worth} de MRR d'abonnement nouveau** chaque mois. | = | The demand's sentence, in supply's words ("MRR" reads "subscription MRR", §22.8.5). |
| `diag.aside.demand` | new | board-demand*, board-services | Beside it: the first order, {value} for a target of {target}, would be worth {worth}. | Beside it: the first booking, {value} for a target of {target}, would be worth {worth}. | À côté : la première commande, {value} pour une cible de {target}, vaudrait {worth}. | À côté : la première réservation, {value} pour une cible de {target}, vaudrait {worth}. |  |
| `diag.aside.supply` | new | board-supply, board-services-supply | Beside it: paid seller churn, {value} for {target}, would keep {worth} of subscription MRR a month. The first sale, {fs} for {fsTarget}, is named without an amount: it is priced only through the subscriptions. | Beside it: paid provider churn, {value} for {target}, would keep {worth} of subscription MRR a month. The first job, {fs} for {fsTarget}, is named without an amount: it is priced only through the subscriptions. | À côté : le churn des vendeurs payants, {value} pour {target}, préserverait {worth} de MRR d'abonnement par mois. La première vente, {fs} pour {fsTarget}, est nommée sans montant : elle ne se chiffre qu'à travers les abonnements. | À côté : le churn des prestataires payants, {value} pour {target}, préserverait {worth} de MRR d'abonnement par mois. La première prestation, {fs} pour {fsTarget}, est nommée sans montant : elle ne se chiffre qu'à travers les abonnements. | C67: the first sale is named, unpriced. |

### Supply without the subscriptions (SideNote)

| Key | Status | Screen | English (products) | English (services) | Français (produits) | Français (services) | Today / why |
|---|---|---|---|---|---|---|---|
| `note.targets.title` | new | board-supply-nosubs | Not enough targets to name what holds the sellers back | Not enough targets to name what holds the providers back | Pas assez de cibles pour nommer ce qui freine les vendeurs | Pas assez de cibles pour nommer ce qui freine les prestataires |  |
| `note.targets.body` | new | board-supply-nosubs | On the sellers' side, one stage alone has a team target: the first sale ({target}; it is at {value}). That is too few to name the stage that holds them back. | On the providers' side, one stage alone has a team target: the first job ({target}; it is at {value}). That is too few to name the stage that holds them back. | Côté vendeurs, une seule étape a une cible d'équipe : la première vente ({target} ; elle est à {value}). C'est trop peu pour désigner l'étape qui les freine. | Côté prestataires, une seule étape a une cible d'équipe : la première prestation ({target} ; elle est à {value}). C'est trop peu pour désigner l'étape qui les freine. | No rule stated in figures ("two targets"): the engine's rule (§22.6) stays the engine's. |
| `note.targets.action` | new | board-supply-nosubs | Set the sellers' targets → | Set the providers' targets → | Fixer les cibles des vendeurs → | Fixer les cibles des prestataires → |  |
| `note.money.title` | new | board-supply-nosubs | Sellers don't pay: supply earns nothing directly | Providers don't pay: supply earns nothing directly | Les vendeurs ne paient pas : l'offre ne rapporte rien en direct | Les prestataires ne paient pas : l'offre ne rapporte rien en direct |  |
| `note.money.body` | new | board-supply-nosubs | All of the marketplace's revenue is the commissions, on the demand side. What sellers do shows in the fill rate (below, with their funnel). | All of the marketplace's revenue is the commissions, on the demand side. What providers do shows in the fill rate (below, with their funnel). | Tout le revenu de la place de marché, ce sont les commissions, côté demande. Ce que font les vendeurs se lit dans le taux de service (plus bas, avec leur funnel). | Tout le revenu de la place de marché, ce sont les commissions, côté demande. Ce que font les prestataires se lit dans le taux de service (plus bas, avec leur funnel). |  |
| `note.money.whatif` | new | board-supply-nosubs | No money on this side, so no “What if?” either: the sellers' levers are the subscription's. | No money on this side, so no “What if?” either: the providers' levers are the subscription's. | Pas d'argent de ce côté, donc pas de « Et si » non plus : les leviers des vendeurs sont ceux de l'abonnement. | Pas d'argent de ce côté, donc pas de « Et si » non plus : les leviers des prestataires sont ceux de l'abonnement. |  |
| `note.money.action` | new | board-supply-nosubs | Do your sellers pay a subscription? Tick it in the settings | Do your providers pay a subscription? Tick it in the settings | Tes vendeurs paient un abonnement ? Coche-le dans les réglages | Tes prestataires paient un abonnement ? Coche-le dans les réglages |  |

### A side's money (MoneyBlock)

| Key | Status | Screen | English (products) | English (services) | Français (produits) | Français (services) | Today / why |
|---|---|---|---|---|---|---|---|
| `money.net` | given | board-demand-nosubs, board-supply-nosubs, total-nosubs | Net revenue | = | Revenu net | = | On demand, "MRR" reads "net revenue" (§22.8.5). |
| `money.netAnnual` | new | board-demand*, board-services, total-nosubs | Net revenue, annualised | = | Revenu net annualisé | = |  |
| `money.gmv` | new | board-demand*, board-services, total-nosubs | Gross merchandise value (GMV) | Gross booking value (GMV) | Volume d'affaires (GMV) | = | Services: "merchandise" does not fit a booking; the French « volume d'affaires » fits both. |
| `money.subAnnual` | new | board-supply, board-services-supply | Subscription MRR, annualised | = | MRR d'abonnement annualisé | = |  |
| `worth.title.demand` | changed | board-demand*, board-services | What one new buyer is worth | What one new client is worth | Ce que vaut un nouvel acheteur | Ce que vaut un nouveau client | was: What one new customer is worth / Ce que vaut un nouveau client |
| `worth.title.supply` | changed | board-supply, board-services-supply | What one new paid seller is worth | What one new paid provider is worth | Ce que vaut un nouveau vendeur payant | Ce que vaut un nouveau prestataire payant | was: What one new customer is worth / Ce que vaut un nouveau client |
| `worth.healthy.demand` | changed | board-demand, board-services, board-demand-nosubs | Each new buyer costs {cost} and brings back {ltv} of margin on the commissions: {gap} more than they cost. | Each new client costs {cost} and brings back {ltv} of margin on the commissions: {gap} more than they cost. | Chaque nouvel acheteur coûte {cost} et rapporte {ltv} de marge sur les commissions : {gap} de plus que ce qu'il coûte. | Chaque nouveau client coûte {cost} et rapporte {ltv} de marge sur les commissions : {gap} de plus que ce qu'il coûte. | was: Each new customer costs {cac} and brings back {ltv} of margin: {gap} more than it costs. |
| `worth.healthy.supply` | changed | board-supply, board-services-supply | Each new paid seller costs {cost} and brings back {ltv} of margin on the subscription: {gap} more than they cost. | Each new paid provider costs {cost} and brings back {ltv} of margin on the subscription: {gap} more than they cost. | Chaque nouveau vendeur payant coûte {cost} et rapporte {ltv} de marge sur l'abonnement : {gap} de plus que ce qu'il coûte. | Chaque nouveau prestataire payant coûte {cost} et rapporte {ltv} de marge sur l'abonnement : {gap} de plus que ce qu'il coûte. | was: Each new customer costs {cac} and brings back {ltv} of margin: {gap} more than it costs. |
| `worth.none.demand` | changed | board-demand-nomargin | We can't tell yet what a new buyer brings back: the margin on net revenue is missing. | We can't tell yet what a new client brings back: the margin on net revenue is missing. | On ne peut pas encore dire ce que rapporte un nouvel acheteur : il manque la marge sur le revenu net. | On ne peut pas encore dire ce que rapporte un nouveau client : il manque la marge sur le revenu net. | was: …: the gross margin is missing. |
| `worth.noneNote.demand` | changed | board-demand-nomargin | Without it, no LTV, no payback, no cash figure — and never the subscriptions' margin in its place: each stream has its own. | = | Sans elle, pas de LTV, pas de payback, pas de trésorerie — et jamais la marge des abonnements à sa place : chaque flux a la sienne. | = | was: Without it, no LTV, no payback, no cash figure: computed on revenue, they would flatter your engine. — Constraint 5, said where it applies. |
| `worth.missing.demand` | changed | board-demand-nomargin, whatif-demand-nomargin | missing: margin on net revenue | = | il manque la marge sur le revenu net | = | was: missing: gross margin / il manque la marge brute |
| `worth.months.demand` | changed | board-demand, board-services, board-demand-nosubs | A buyer pays back their cost in {payback} and stays {life}: {after} of margin after payback | A client pays back their cost in {payback} and stays {life}: {after} of margin after payback | Un acheteur rembourse son coût en {payback} et reste {life} : {after} de marge après le remboursement | Un client rembourse son coût en {payback} et reste {life} : {after} de marge après le remboursement | was: It pays back its cost in {payback} and stays {life}: {after} of margin after payback. |
| `worth.months.supply` | changed | board-supply, board-services-supply | A paid seller pays back their cost in {payback} and stays {life}: {after} of margin after payback | A paid provider pays back their cost in {payback} and stays {life}: {after} of margin after payback | Un vendeur payant rembourse son coût en {payback} et reste {life} : {after} de marge après le remboursement | Un prestataire payant rembourse son coût en {payback} et reste {life} : {after} de marge après le remboursement | was: It pays back its cost in {payback} and stays {life}: {after} of margin after payback. |
| `worth.perBuyer` | new | board-demand*, board-services | One active buyer brings in {per} of net revenue a month: {freq} orders × {aov} × {take} commission. | One active client brings in {per} of net revenue a month: {freq} bookings × {aov} × {take} commission. | Un acheteur actif rapporte {per} de revenu net par mois : {freq} commande × {aov} × {take} de commission. | Un client actif rapporte {per} de revenu net par mois : {freq} réservation × {aov} × {take} de commission. | What one active buyer brings, said once, as the product that makes it (the brief, question 3). |
| `worth.costExplained` | new | board-supply, board-services-supply, slide-supply-unit | The cost of a paid seller is computed: {cpa} per active seller × {fs} first sale ÷ {conv} subscription conversion = {cost} — one paid seller for every {n} active ones. | The cost of a paid provider is computed: {cpa} per active provider × {fs} first job ÷ {conv} subscription conversion = {cost} — one paid provider for every {n} active ones. | Le coût d'un vendeur payant est calculé : {cpa} par vendeur actif × {fs} de première vente ÷ {conv} de conversion à l'abonnement = {cost} — un vendeur payant pour {n} actifs. | Le coût d'un prestataire payant est calculé : {cpa} par prestataire actif × {fs} de première prestation ÷ {conv} de conversion à l'abonnement = {cost} — un prestataire payant pour {n} actifs. | The brief, question 3: the cost of a paid seller, explained. |
| `cash.line.demand` | changed | board-demand, board-services | It all comes back, as buyers pay back. | It all comes back, as clients pay back. | Elle revient toute, au fil des remboursements des acheteurs. | Elle revient toute, au fil des remboursements des clients. | was: It all comes back, as customers pay back. |
| `cash.line.supply` | changed | board-supply, board-services-supply | It all comes back, as paid sellers pay back. | It all comes back, as paid providers pay back. | Elle revient toute, au fil des remboursements des vendeurs payants. | Elle revient toute, au fil des remboursements des prestataires payants. | was: It all comes back, as customers pay back. |
| `cash.lineNone.demand` | changed | board-demand-nomargin | No cash figure without the margin on net revenue: the payback is what says when the spend comes back. | = | Pas de trésorerie sans la marge sur le revenu net : c'est le payback qui dit quand la dépense revient. | = | was: No cash figure without the margin: … |
| `cash.assumptions` | changed | board-demand, board-supply, board-services* | A floor: each month's spend comes back evenly over the payback, so half of it is out at any time; churn slows the return and is not counted. | = | Un plancher : la dépense de chaque mois revient régulièrement sur la durée du payback, la moitié est donc dehors à tout moment ; le churn ralentit le retour et n'est pas compté. | = | was: …; churn and contraction slow the return and are not counted. Monthly billing. — A marketplace has no contraction; a commission is taken on each order, not billed monthly. |

### “What if?” — the card (LeverCard, MrrCurve)

| Key | Status | Screen | English (products) | English (services) | Français (produits) | Français (services) | Today / why |
|---|---|---|---|---|---|---|---|
| `whatif.net12` | changed | whatif-demand*, board-demand*, board-services | Net revenue in 12 months | = | Revenu net dans 12 mois | = | was: MRR in 12 months / MRR dans 12 mois |
| `whatif.netAnnual12` | changed | whatif-*, board-demand*, board-supply, board-services* | Annualised, in 12 months | = | Annualisé, dans 12 mois | = | was: ARR in 12 months / ARR dans 12 mois |
| `whatif.sub12` | changed | whatif-supply*, board-supply, board-services-supply | Subscription MRR in 12 months | = | MRR d'abonnement dans 12 mois | = | was: MRR in 12 months / MRR dans 12 mois |
| `whatif.all.supply` | changed | whatif-supply*, board-supply, board-services-supply | See all 3 levers and what the calculation assumes → | = | Vois les 3 leviers et ce que le calcul suppose → | = | was: See all 8 levers… |
| `curve.whatifSlide` | new | slide-*-whatif | with our what-ifs | = | avec nos « Et si » | = |  |
| `curve.step.demand` | new | whatif-demand-moved, slide-demand-whatif | Month 1: the take rate goes to {take} on every order from next month — {step} more net revenue a month on today's buyers alone. | Month 1: the take rate goes to {take} on every booking from next month — {step} more net revenue a month on today's clients alone. | Mois 1 : la commission passe à {take} sur chaque commande dès le mois prochain — {step} de revenu net en plus par mois sur les seuls acheteurs d'aujourd'hui. | Mois 1 : la commission passe à {take} sur chaque réservation dès le mois prochain — {step} de revenu net en plus par mois sur les seuls clients d'aujourd'hui. | Question 8: why the curve jumps at month 1, said under it with the curve's own mark (MrrCurve.delta.md). |
| `curve.summary` | changed | whatif-*, board-* | {what} month by month, from {start} today to {today} in 12 months at today's pace. | = | {what} mois par mois, de {start} aujourd'hui à {today} dans 12 mois au rythme actuel. | = | was: The MRR month by month, … |
| `curve.summaryWhatif` | changed | whatif-*-moved | {what} month by month, from {start} today: {today} in 12 months at today's pace, {whatif} with your what-ifs. | = | {what} mois par mois, depuis {start} aujourd'hui : {today} dans 12 mois au rythme actuel, {whatif} avec tes « Et si ». | = | was: The MRR month by month, … |
| `curve.what.demand` | new | whatif-demand* | Net revenue | = | Le revenu net | = |  |
| `curve.what.supply` | new | whatif-supply* | Subscription MRR | = | Le MRR d'abonnement | = |  |

### “What if?” — the panel (WhatIfFigures, LeverSum)

| Key | Status | Screen | English (products) | English (services) | Français (produits) | Français (services) | Today / why |
|---|---|---|---|---|---|---|---|
| `panel.intro` | changed | whatif-demand* | Move one lever or several: the buyers' funnel and figures recompute together, and the effects add up. The sellers' levers are on their side. | Move one lever or several: the clients' funnel and figures recompute together, and the effects add up. The providers' levers are on their side. | Bouge un ou plusieurs leviers : le funnel et les chiffres des acheteurs se recalculent ensemble, les effets se cumulent. Les leviers des vendeurs sont de leur côté. | Bouge un ou plusieurs leviers : le funnel et les chiffres des clients se recalculent ensemble, les effets se cumulent. Les leviers des prestataires sont de leur côté. | was: Move one lever or several: the month's funnel and your growth numbers recompute together, and the effects add up. |
| `panel.intro.supply` | new | whatif-supply* | Move one lever or several: the sellers' subscriptions recompute, and the effects add up. The buyers' levers are on their side. | Move one lever or several: the providers' subscriptions recompute, and the effects add up. The clients' levers are on their side. | Bouge un ou plusieurs leviers : les abonnements des vendeurs se recalculent, les effets se cumulent. Les leviers des acheteurs sont de leur côté. | Bouge un ou plusieurs leviers : les abonnements des prestataires se recalculent, les effets se cumulent. Les leviers des clients sont de leur côté. |  |
| `panel.figures` | changed | whatif-* | The figures | = | Les chiffres | = | was: Your growth figures / Tes chiffres de croissance |
| `panel.group.growth.demand` | changed | whatif-demand* | Net revenue | = | Revenu net | = | was: Growth / Croissance |
| `panel.group.growth.supply` | changed | whatif-supply* | Subscription MRR | = | MRR d'abonnement | = | was: Growth / Croissance |
| `panel.group.unit.demand` | changed | whatif-demand* | One new buyer | One new client | Un nouvel acheteur | Un nouveau client | was: One new customer / Un nouveau client |
| `panel.group.unit.supply` | changed | whatif-supply* | One new paid seller | One new paid provider | Un nouveau vendeur payant | Un nouveau prestataire payant | was: One new customer / Un nouveau client |
| `row.fresh.demand` | changed | whatif-demand*, slide-demand-whatif | New net revenue a month | = | Revenu net nouveau par mois | = | was: New MRR a month / Nouveau MRR par mois |
| `row.fresh.supply` | changed | whatif-supply*, slide-supply-whatif | New subscription MRR a month | = | MRR d'abonnement nouveau par mois | = | was: New MRR a month / Nouveau MRR par mois |
| `row.new.demand` | new | whatif-demand* | New buyers a month | New clients a month | Nouveaux acheteurs par mois | Nouveaux clients par mois |  |
| `row.new.supply` | new | whatif-supply* | New paid sellers a month | New paid providers a month | Nouveaux vendeurs payants par mois | Nouveaux prestataires payants par mois |  |
| `row.net12` | changed | slide-demand-whatif | Net revenue in 12 months | = | Revenu net dans 12 mois | = | was: MRR in 12 months |
| `row.sub12` | changed | slide-supply-whatif | Subscription MRR in 12 months | = | MRR d'abonnement dans 12 mois | = | was: MRR in 12 months |
| `row.cost.demand` | changed | whatif-demand*, slide-demand-* | Cost of a buyer (CAC) | Cost of a client (CAC) | Coût d'un acheteur (CAC) | Coût d'un client (CAC) | was: CAC |
| `row.cost.supply` | new | whatif-supply*, slide-supply-* | Cost of a paid seller | Cost of a paid provider | Coût d'un vendeur payant | Coût d'un prestataire payant | Not a CAC typed: derived (cost per active seller × first sale ÷ conversion). |
| `row.gap.demand` | changed | whatif-demand* | Per new buyer | Per new client | Par nouvel acheteur | Par nouveau client | was: Per new customer |
| `row.gap.supply` | changed | whatif-supply* | Per new paid seller | Per new paid provider | Par nouveau vendeur payant | Par nouveau prestataire payant | was: Per new customer |
| `row.payback` | changed | whatif-*, slide-* | Payback | = | Payback | = | was: CAC payback — Supply's cost is not a CAC typed. |
| `sum.title.demand` | changed | whatif-demand-moved, slide-demand-whatif | What each lever brings on its own, on net revenue in 12 months | = | Ce que chaque levier rapporte seul, sur le revenu net dans 12 mois | = | was: …, on MRR in 12 months / …, sur le MRR dans 12 mois |
| `panel.assume.demand` | new | whatif-demand* | Net revenue: active buyers × orders a month × average order value × take rate, kept at (1 − buyer churn) each month, plus the month's new buyers (sign-ups × first order × the fill rate's effect). The fill rate is priced on new buyers only: a minimum. A money lever (frequency, order value, take rate) applies to every buyer from next month. LTV: the commissions' margin a month over a buyer's counted lifetime (1 ÷ churn, capped at 36 months). | Net revenue: active clients × bookings a month × average booking value × take rate, kept at (1 − client churn) each month, plus the month's new clients (sign-ups × first booking × the fill rate's effect). The fill rate is priced on new clients only: a minimum. A money lever (frequency, booking value, take rate) applies to every client from next month. LTV: the commissions' margin a month over a client's counted lifetime (1 ÷ churn, capped at 36 months). | Revenu net : acheteurs actifs × commandes par mois × panier moyen × taux de commission, gardé à (1 − churn acheteurs) chaque mois, plus les nouveaux acheteurs du mois (inscrits × première commande × l'effet du taux de service). Le taux de service n'est chiffré que sur les nouveaux acheteurs : c'est un minimum. Un levier d'argent (fréquence, panier, commission) s'applique à chaque acheteur dès le mois prochain. LTV : la marge des commissions par mois sur la durée de vie comptée d'un acheteur (1 ÷ churn, plafonnée à 36 mois). | Revenu net : clients actifs × réservations par mois × montant moyen × taux de commission, gardé à (1 − churn clients) chaque mois, plus les nouveaux clients du mois (inscrits × première réservation × l'effet du taux de service). Le taux de service n'est chiffré que sur les nouveaux clients : c'est un minimum. Un levier d'argent (fréquence, montant, commission) s'applique à chaque client dès le mois prochain. LTV : la marge des commissions par mois sur la durée de vie comptée d'un client (1 ÷ churn, plafonnée à 36 mois). |  |
| `panel.assume.supply` | new | whatif-supply* | Subscription MRR: paid sellers × price, kept at (1 − paid seller churn) each month, plus the month's new paid sellers (seller sign-ups × conversion). A new price applies to every paid seller from next month. The cost of a paid seller: cost per active seller × first sale ÷ conversion; the same spend with the what-ifs. LTV: the subscriptions' margin a month over a paid seller's counted lifetime (1 ÷ churn, capped at 36 months). | Subscription MRR: paid providers × price, kept at (1 − paid provider churn) each month, plus the month's new paid providers (provider sign-ups × conversion). A new price applies to every paid provider from next month. The cost of a paid provider: cost per active provider × first job ÷ conversion; the same spend with the what-ifs. LTV: the subscriptions' margin a month over a paid provider's counted lifetime (1 ÷ churn, capped at 36 months). | MRR d'abonnement : vendeurs payants × prix, gardé à (1 − churn des vendeurs payants) chaque mois, plus les nouveaux vendeurs payants du mois (vendeurs inscrits × conversion). Un nouveau prix s'applique à chaque vendeur payant dès le mois prochain. Le coût d'un vendeur payant : coût par vendeur actif × première vente ÷ conversion ; même dépense avec les « Et si ». LTV : la marge des abonnements par mois sur la durée de vie comptée d'un vendeur payant (1 ÷ churn, plafonnée à 36 mois). | MRR d'abonnement : prestataires payants × prix, gardé à (1 − churn des prestataires payants) chaque mois, plus les nouveaux prestataires payants du mois (prestataires inscrits × conversion). Un nouveau prix s'applique à chaque prestataire payant dès le mois prochain. Le coût d'un prestataire payant : coût par prestataire actif × première prestation ÷ conversion ; même dépense avec les « Et si ». LTV : la marge des abonnements par mois sur la durée de vie comptée d'un prestataire payant (1 ÷ churn, plafonnée à 36 mois). |  |

### The levers' names (card, panel, slides)

| Key | Status | Screen | English (products) | English (services) | Français (produits) | Français (services) | Today / why |
|---|---|---|---|---|---|---|---|
| `lever.signupRate` | new | whatif-demand* | Buyer sign-up rate | Client sign-up rate | Taux d'inscription acheteurs | Taux d'inscription clients |  |
| `lever.referred` | new | whatif-demand* | Referred share | = | Part des inscrits recommandés | = |  |
| `lever.firstOrder` | new | whatif-demand*, slide-demand-whatif | First order | First booking | Première commande | Première réservation |  |
| `lever.fillRate` | new | whatif-demand*, board-demand*, slide-demand-* | Fill rate | = | Taux de service | = |  |
| `lever.churn` | new | whatif-demand* | Monthly buyer churn | Monthly client churn | Churn mensuel des acheteurs | Churn mensuel des clients |  |
| `lever.frequency` | new | whatif-demand* | Orders a month | Bookings a month | Commandes par mois | Réservations par mois |  |
| `lever.aov` | new | whatif-demand* | Average order value | Average booking value | Panier moyen | Montant moyen d'une réservation | Services: « panier » is a shopping word; a booking has an amount. |
| `lever.takeRate` | new | whatif-demand*, slide-demand-whatif | Take rate | = | Taux de commission | = |  |
| `lever.conversion` | new | whatif-supply*, board-supply, slide-supply-* | Subscription conversion | = | Conversion à l'abonnement | = |  |
| `lever.paidChurn` | new | whatif-supply* | Monthly paid seller churn | Monthly paid provider churn | Churn mensuel des vendeurs payants | Churn mensuel des prestataires payants |  |
| `lever.price` | new | whatif-supply* | Subscription price | = | Prix de l'abonnement | = |  |

### The funnels (SideFunnel)

| Key | Status | Screen | English (products) | English (services) | Français (produits) | Français (services) | Today / why |
|---|---|---|---|---|---|---|---|
| `funnel.title.demand` | changed | board-demand*, board-services | Per 100 buyer sign-ups | Per 100 client sign-ups | Pour 100 inscrits côté acheteurs | Pour 100 inscrits côté clients | was: Per 100 sign-ups / Pour 100 inscrits |
| `funnel.title.supply` | changed | board-supply*, board-services-supply | Per 100 seller sign-ups | Per 100 provider sign-ups | Pour 100 vendeurs inscrits | Pour 100 prestataires inscrits | was: Per 100 sign-ups / Pour 100 inscrits |
| `funnel.upstream.supply` | new | board-supply*, board-services-supply, slide-supply-* | ~{visitors} visitors to the sellers' page for 100 seller sign-ups · GA4 · {month} | ~{visitors} visitors to the providers' page for 100 provider sign-ups · GA4 · {month} | ~{visitors} visiteurs de la page vendeurs pour 100 vendeurs inscrits · GA4 · {month} | ~{visitors} visiteurs de la page prestataires pour 100 prestataires inscrits · GA4 · {month} |  |
| `funnel.signups.supply` | new | board-supply*, board-services-supply, slide-supply-* | Seller sign-ups | Provider sign-ups | Vendeurs inscrits | Prestataires inscrits |  |
| `funnel.firstOrder` | given | board-demand*, board-services, slide-demand-funnel, slide-services-funnel | First order within {n} days | First booking within {n} days | Première commande sous {n} jours | Première réservation sous {n} jours |  |
| `funnel.secondOrder` | given | board-demand*, board-services, slide-demand-funnel, slide-services-funnel | Second order within {n} days | Second booking within {n} days | Deuxième commande sous {n} jours | Deuxième réservation sous {n} jours |  |
| `funnel.firstSale` | given | board-supply*, board-services-supply, slide-supply-* | First sale within {n} days | First job within {n} days | Première vente sous {n} jours | Première prestation sous {n} jours | Services: see the supply verdict. |
| `funnel.subscribed` | given | board-supply, board-services-supply, slide-supply-funnel | Subscribed within {n} days | = | Abonnés sous {n} jours | = |  |
| `funnel.src.backoffice` | new | board-*, slide-*-funnel | Back office · {cohort} | = | Back-office · {cohort} | = |  |
| `funnel.liquidity` | new | board-demand*, board-services, slide-demand-funnel, slide-services-funnel | Liquidity · out of 100 {kind} | = | Liquidité · sur 100 {kind} | = | The fill rate is counted on another base than the sign-ups: its heading says which, and its kind (searches or requests). |
| `funnel.fill` | new | board-demand*, board-services, slide-demand-funnel, slide-services-funnel | Fill rate | = | Taux de service | = |  |
| `funnel.fillLine` | given | board-demand*, board-services, slide-demand-funnel, slide-services-funnel | Fill rate: {fill} of {kind} end in an order | Fill rate: {fill} of {kind} end in a booking | Taux de service : {fill} des {kind} aboutissent à une commande | Taux de service : {fill} des {kind} aboutissent à une réservation |  |
| `funnel.kind.searches` | new | board-demand*, slide-demand-funnel | searches | = | recherches | = |  |
| `funnel.kind.requests` | new | board-services, slide-services-funnel | requests sent | = | demandes envoyées | = | « demandes » alone sits under « Demande » (the side): « 100 demandes » next to « Côté affiché : Demande » reads as the side. « Demandes envoyées » names a request. |
| `funnel.rates` | new | board-supply*, board-services-supply, slide-supply-funnel | Every month | = | Chaque mois | = |  |
| `funnel.sellerChurn` | new | board-supply*, board-services-supply, slide-supply-funnel | Active sellers who leave | Active providers who leave | Vendeurs actifs qui partent | Prestataires actifs qui partent |  |
| `funnel.paidChurn` | new | board-supply, board-services-supply, slide-supply-funnel | Paid sellers who cancel | Paid providers who cancel | Vendeurs payants qui résilient | Prestataires payants qui résilient |  |
| `funnel.rateTargetOnly` | new | board-supply, board-services-supply, slide-supply-funnel | target {target} | = | cible {target} | = |  |
| `funnel.liquidityAside` | new | board-supply*, board-services-supply | Their work shows in the fill rate, on the demand side: {fill} of {kind} end in an order. | Their work shows in the fill rate, on the demand side: {fill} of {kind} end in a booking. | Leur travail se lit dans le taux de service, côté demande : {fill} des {kind} aboutissent à une commande. | Leur travail se lit dans le taux de service, côté demande : {fill} des {kind} aboutissent à une réservation. |  |
| `funnel.note.demand` | changed | board-demand*, board-services | Your {n} buyer sign-ups of {cohort} are brought back to 100 to read as percentages: each column is counted on those same 100. The fill rate is counted on 100 {kind}: another base, not the same people. | Your {n} client sign-ups of {cohort} are brought back to 100 to read as percentages: each column is counted on those same 100. The fill rate is counted on 100 {kind}: another base, not the same people. | Tes {n} inscrits côté acheteurs de {cohort} sont ramenés à 100 pour se lire en pourcentages : chaque colonne est comptée sur ces mêmes 100. Le taux de service se compte sur 100 {kind} : une autre base, pas les mêmes personnes. | Tes {n} inscrits côté clients de {cohort} sont ramenés à 100 pour se lire en pourcentages : chaque colonne est comptée sur ces mêmes 100. Le taux de service se compte sur 100 {kind} : une autre base, pas les mêmes personnes. | was: Your 800 sign-ups in July 2026 are brought back to 100 to read as percentages: each column is counted on those same 100. … |
| `funnel.note.supply` | new | board-supply*, board-services-supply | Your {n} seller sign-ups of {cohort} are brought back to 100: each column is counted on those same 100. The churns are monthly rates, not columns. | Your {n} provider sign-ups of {cohort} are brought back to 100: each column is counted on those same 100. The churns are monthly rates, not columns. | Tes {n} vendeurs inscrits de {cohort} sont ramenés à 100 : chaque colonne est comptée sur ces mêmes 100. Les churns sont des taux mensuels, pas des colonnes. | Tes {n} prestataires inscrits de {cohort} sont ramenés à 100 : chaque colonne est comptée sur ces mêmes 100. Les churns sont des taux mensuels, pas des colonnes. |  |

### “Your numbers” (NumberList, side delta)

| Key | Status | Screen | English (products) | English (services) | Français (produits) | Français (services) | Today / why |
|---|---|---|---|---|---|---|---|
| `list.lead` | new | board-* | Both sides, one list by stage. The stage flagged is the one the side shown names. | = | Les deux côtés, une liste par étape. L'étape signalée est celle que nomme le côté affiché. | = | The list is shared; its one red follows the selector (README, question 9). |
| `list.side.buyers` | given | board-* | Buyers | Clients | Acheteurs | Clients |  |
| `list.side.sellers` | given | board-* | Sellers | Providers | Vendeurs | Prestataires |  |
| `list.side.liquidity` | given | board-* | Liquidity | = | Liquidité | = |  |

### The numbers' names (19, 14 without the subscriptions)

| Key | Status | Screen | English (products) | English (services) | Français (produits) | Français (services) | Today / why |
|---|---|---|---|---|---|---|---|
| `num.mk:buyer-sign-up-rate` | new | board-* | Buyer sign-up rate | Client sign-up rate | Taux d'inscription acheteurs | Taux d'inscription clients |  |
| `num.mk:buyer-cac` | new | board-* | Buyer CAC | Client CAC | CAC acheteur | CAC client |  |
| `num.mk:cost-per-active-seller` | new | board-* | Cost per active seller | Cost per active provider | Coût par vendeur actif | Coût par prestataire actif |  |
| `num.mk:seller-sign-up-rate` | new | board-* | Seller sign-up rate | Provider sign-up rate | Taux d'inscription vendeurs | Taux d'inscription prestataires |  |
| `num.mk:first-order` | new | board-* | First order (30 days) | First booking (30 days) | Première commande (30 jours) | Première réservation (30 jours) |  |
| `num.mk:first-sale` | new | board-* | First sale (60 days) | First job (60 days) | Première vente (60 jours) | Première prestation (60 jours) |  |
| `num.mk:fill-rate` | new | board-* | Fill rate (searches) | Fill rate (requests sent) | Taux de service (recherches) | Taux de service (demandes envoyées) |  |
| `num.mk:second-order` | new | board-* | Second order (90 days) | Second booking (90 days) | Deuxième commande (90 jours) | Deuxième réservation (90 jours) |  |
| `num.mk:buyer-churn` | new | board-* | Monthly buyer churn | Monthly client churn | Churn mensuel des acheteurs | Churn mensuel des clients |  |
| `num.mk:seller-churn` | new | board-* | Monthly seller churn | Monthly provider churn | Churn mensuel des vendeurs | Churn mensuel des prestataires |  |
| `num.mk:paid-seller-churn` | new | board-* | Monthly paid seller churn | Monthly paid provider churn | Churn mensuel des vendeurs payants | Churn mensuel des prestataires payants |  |
| `num.mk:referred-share` | new | board-* | Referred share | = | Part des inscrits recommandés | = |  |
| `num.mk:take-rate` | new | board-* | Take rate | = | Taux de commission | = |  |
| `num.mk:net-revenue-margin` | new | board-* | Margin on net revenue | = | Marge sur le revenu net | = |  |
| `num.mk:aov` | new | board-* | Average order value | Average booking value | Panier moyen | Montant moyen d'une réservation |  |
| `num.mk:order-frequency` | new | board-* | Orders a month (per active buyer) | Bookings a month (per active client) | Commandes par mois (par acheteur actif) | Réservations par mois (par client actif) |  |
| `num.mk:subscription-conversion` | new | board-* | Subscription conversion | = | Conversion à l'abonnement | = |  |
| `num.mk:revenue-per-paid-seller` | new | board-* | Revenue per paid seller | Revenue per paid provider | Revenu par vendeur payant | Revenu par prestataire payant |  |
| `num.mk:subscription-margin` | new | board-* | Margin on seller subscriptions | Margin on provider subscriptions | Marge sur les abonnements des vendeurs | Marge sur les abonnements des prestataires |  |

### The words taught: the glossary's “?” (C72)

| Key | Status | Screen | English (products) | English (services) | Français (produits) | Français (services) | Today / why |
|---|---|---|---|---|---|---|---|
| `term.gmv.title` | new | board-demand*, board-services | GMV (gross merchandise value) | GMV (gross booking value) | Volume d'affaires (GMV) | = |  |
| `term.gmv.body` | new | board-demand*, board-services, term-gmv | The total value of the orders placed on the marketplace in the month, before your commission. It is not your revenue: your revenue is the share you keep, the net revenue (GMV × take rate). | The total value of the bookings made on the marketplace in the month, before your commission. It is not your revenue: your revenue is the share you keep, the net revenue (GMV × take rate). | La valeur totale des commandes passées sur la place de marché dans le mois, avant ta commission. Ce n'est pas ton revenu : ton revenu, c'est la part que tu gardes, le revenu net (volume d'affaires × taux de commission). | La valeur totale des réservations faites sur la place de marché dans le mois, avant ta commission. Ce n'est pas ton revenu : ton revenu, c'est la part que tu gardes, le revenu net (volume d'affaires × taux de commission). |  |
| `term.takeRate.title` | new | board-* | Take rate | = | Taux de commission | = |  |
| `term.takeRate.body` | new | board-*, term-take | The share of each order the marketplace keeps. GMV × take rate = net revenue: on the demand side, it plays the part MRR plays in a SaaS. | The share of each booking the marketplace keeps. GMV × take rate = net revenue: on the demand side, it plays the part MRR plays in a SaaS. | La part de chaque commande que la place de marché garde. Volume d'affaires × taux de commission = revenu net : côté demande, il joue le rôle du MRR d'un SaaS. | La part de chaque réservation que la place de marché garde. Volume d'affaires × taux de commission = revenu net : côté demande, il joue le rôle du MRR d'un SaaS. |  |
| `term.liquidity.title` | new | board-demand*, board-services | Liquidity | = | Liquidité | = |  |
| `term.liquidity.body` | new | board-demand*, board-services, term-liquidity | How well your marketplace brings the two sides together. The engine reads it in one figure, the fill rate: the share of searches (or requests) that end in an order. It is counted on the demand side and priced on new buyers only, so its worth is a minimum. | How well your marketplace brings the two sides together. The engine reads it in one figure, the fill rate: the share of searches (or requests) that end in a booking. It is counted on the demand side and priced on new clients only, so its worth is a minimum. | La capacité de ta place de marché à faire se rencontrer les deux côtés. Le moteur la lit en un chiffre, le taux de service : la part des recherches (ou des demandes) qui aboutissent à une commande. Elle se compte côté demande et ne se chiffre que sur les nouveaux acheteurs : sa valeur est un minimum. | La capacité de ta place de marché à faire se rencontrer les deux côtés. Le moteur la lit en un chiffre, le taux de service : la part des recherches (ou des demandes) qui aboutissent à une réservation. Elle se compte côté demande et ne se chiffre que sur les nouveaux clients : sa valeur est un minimum. |  |
| `term.netRevenue.title` | new | board-demand*, board-services, term-net | Net revenue | = | Revenu net | = | Proposed, beyond C72's three: the word that replaces MRR on demand. Its "?" sits in demand's money, not in the total band: the board's first screen keeps today's controls. |
| `term.netRevenue.body` | new | board-*, term-net | What the marketplace keeps from the orders: GMV × take rate, or active buyers × what one active buyer brings a month. The engine projects it as it projects an MRR. | What the marketplace keeps from the bookings: GMV × take rate, or active clients × what one active client brings a month. The engine projects it as it projects an MRR. | Ce que la place de marché garde des commandes : volume d'affaires × taux de commission, ou acheteurs actifs × ce que rapporte un acheteur actif par mois. Le moteur le projette comme un MRR. | Ce que la place de marché garde des réservations : volume d'affaires × taux de commission, ou clients actifs × ce que rapporte un client actif par mois. Le moteur le projette comme un MRR. |  |
| `term.cashTied.body` | changed | board-* | What your acquisition keeps out of the bank at any time. Each month you spend to win new buyers (or paid sellers); each of them pays that back over the payback. At a steady pace, half a payback's worth of spend is out. A floor: churn slows the return. | What your acquisition keeps out of the bank at any time. Each month you spend to win new clients (or paid providers); each of them pays that back over the payback. At a steady pace, half a payback's worth of spend is out. A floor: churn slows the return. | Ce que ton acquisition garde hors de la banque à tout moment. Chaque mois, tu dépenses pour gagner des acheteurs (ou des vendeurs payants) ; chacun te le rembourse sur la durée du payback. À rythme constant, la moitié de cette dépense est dehors. Un plancher : le churn ralentit le retour. | Ce que ton acquisition garde hors de la banque à tout moment. Chaque mois, tu dépenses pour gagner des clients (ou des prestataires payants) ; chacun te le rembourse sur la durée du payback. À rythme constant, la moitié de cette dépense est dehors. Un plancher : le churn ralentit le retour. | was: …to win new customers; … A floor: churn and contraction slow the return. — A marketplace has buyers and paid sellers, and no contraction. |
| `term.after.body` | changed | board-* | How long a buyer (or a paid seller) keeps bringing margin once their cost is paid back: their lifetime minus the payback. Below zero, they leave before paying back: that is the loss, said in months. | How long a client (or a paid provider) keeps bringing margin once their cost is paid back: their lifetime minus the payback. Below zero, they leave before paying back: that is the loss, said in months. | Combien de temps un acheteur (ou un vendeur payant) continue de rapporter une fois son coût remboursé : sa durée de vie moins le payback. Sous zéro, il part avant d'avoir remboursé : c'est la perte, dite en mois. | Combien de temps un client (ou un prestataire payant) continue de rapporter une fois son coût remboursé : sa durée de vie moins le payback. Sous zéro, il part avant d'avoir remboursé : c'est la perte, dite en mois. | was: How long a customer keeps paying once its acquisition cost is paid back: … |

### The slides

| Key | Status | Screen | English (products) | English (services) | Français (produits) | Français (services) | Today / why |
|---|---|---|---|---|---|---|---|
| `slide.sources.demand` | changed | slide-demand-*, slide-services-funnel | Buyer sign-ups in {cohort} · flows: {month} · sources: GA4, Amplitude, back office | Client sign-ups in {cohort} · flows: {month} · sources: GA4, Amplitude, back office | Inscrits acheteurs en {cohort} · flux : {month} · sources : GA4, Amplitude, back-office | Inscrits clients en {cohort} · flux : {month} · sources : GA4, Amplitude, back-office | was: Sign-ups in July 2026 · flows: August 2026 · sources: … |
| `slide.sources.supply` | changed | slide-supply-* | Seller sign-ups in {cohort} · flows: {month} · sources: GA4, back office, Stripe | Provider sign-ups in {cohort} · flows: {month} · sources: GA4, back office, Stripe | Vendeurs inscrits en {cohort} · flux : {month} · sources : GA4, back-office, Stripe | Prestataires inscrits en {cohort} · flux : {month} · sources : GA4, back-office, Stripe | was: Sign-ups in July 2026 · … |
| `slide.sources.total` | new | slide-total | Net revenue: back office · subscriptions: Stripe · {month} · in 12 months: at today's pace, each side's own loop | = | Revenu net : back-office · abonnements : Stripe · {month} · dans 12 mois : au rythme actuel, la boucle de chaque côté | = |  |
| `slide.leak.each` | new | slide-*-leak | × each | = | × chacun | = |  |
| `slide.leak.todayDemand` | new | slide-demand-leak | fill rate {fill}: {signups} sign-ups × {first} first order → {buyers} new buyers a month | fill rate {fill}: {signups} sign-ups × {first} first booking → {buyers} new clients a month | taux de service {fill} : {signups} inscrits × {first} de première commande → {buyers} nouveaux acheteurs par mois | taux de service {fill} : {signups} inscrits × {first} de première réservation → {buyers} nouveaux clients par mois |  |
| `slide.leak.ifDemand` | new | slide-demand-leak | the fill rate reached {target} (the team's target) | = | le taux de service atteignait {target} (cible de l'équipe) | = |  |
| `slide.leak.thenDemand` | new | slide-demand-leak | {buyers} × {target} ÷ {fill} = {after} new buyers a month | {buyers} × {target} ÷ {fill} = {after} new clients a month | {buyers} × {target} ÷ {fill} = {after} nouveaux acheteurs par mois | {buyers} × {target} ÷ {fill} = {after} nouveaux clients par mois |  |
| `slide.leak.eachDemand` | new | slide-demand-leak | {per} of net revenue a month per active buyer | {per} of net revenue a month per active client | {per} de revenu net par mois et par acheteur actif | {per} de revenu net par mois et par client actif |  |
| `slide.leak.resultDemand` | new | slide-demand-leak | So {worth} of new net revenue every month — a minimum: the fill rate is priced on new buyers only. | So {worth} of new net revenue every month — a minimum: the fill rate is priced on new clients only. | Soit {worth} de revenu net nouveau chaque mois — un minimum : le taux de service n'est chiffré que sur les nouveaux acheteurs. | Soit {worth} de revenu net nouveau chaque mois — un minimum : le taux de service n'est chiffré que sur les nouveaux clients. |  |
| `slide.leak.todaySupply` | new | slide-supply-leak | conversion {conv}: {signups} seller sign-ups a month → {paid} new paid sellers | conversion {conv}: {signups} provider sign-ups a month → {paid} new paid providers | conversion {conv} : {signups} vendeurs inscrits par mois → {paid} nouveaux vendeurs payants | conversion {conv} : {signups} prestataires inscrits par mois → {paid} nouveaux prestataires payants |  |
| `slide.leak.ifSupply` | new | slide-supply-leak | conversion reached {target} (the team's target) | = | la conversion atteignait {target} (cible de l'équipe) | = |  |
| `slide.leak.thenSupply` | new | slide-supply-leak | {signups} × {target} = {after} new paid sellers a month | {signups} × {target} = {after} new paid providers a month | {signups} × {target} = {after} nouveaux vendeurs payants par mois | {signups} × {target} = {after} nouveaux prestataires payants par mois |  |
| `slide.leak.eachSupply` | new | slide-supply-leak | {price} subscription a month | = | {price} d'abonnement par mois | = |  |
| `slide.leak.resultSupply` | new | slide-supply-leak | So {worth} of new subscription MRR every month. | = | Soit {worth} de MRR d'abonnement nouveau chaque mois. | = |  |
| `slide.leak.titleDemand` | given | slide-demand-leak | Bringing the fill rate to {target} (the team's target) would be worth **{worth} of new net revenue** every month. | = | Ramener le taux de service à {target} (cible de l'équipe) vaudrait **{worth} de revenu net nouveau** chaque mois. | = |  |
| `slide.leak.titleSupply` | new | slide-supply-leak | Bringing subscription conversion to {target} (the team's target) would be worth **{worth} of new subscription MRR** every month. | = | Ramener la conversion à l'abonnement à {target} (cible de l'équipe) vaudrait **{worth} de MRR d'abonnement nouveau** chaque mois. | = |  |
| `slide.leak.besideFirst` | new | slide-demand-leak | First order | First booking | Première commande | Première réservation |  |
| `slide.leak.besideWorth` | new | slide-*-leak | {value} for {target} · {worth} a month | = | {value} pour {target} · {worth} par mois | = |  |
| `slide.leak.besideKept` | new | slide-supply-leak | {value} for {target} · {worth} of subscription MRR kept a month | = | {value} pour {target} · {worth} de MRR d'abonnement préservé par mois | = |  |
| `slide.leak.besideNamed` | new | slide-supply-leak | {value} for {target} · named, without an amount | = | {value} pour {target} · nommée, sans montant | = |  |
| `slide.whatif.titleDemand` | changed | slide-demand-whatif | With our three what-ifs, net revenue in 12 months would gain **{gain}**. | = | Avec nos trois « Et si », le revenu net dans 12 mois gagnerait **{gain}**. | = | was: With the 3 what-ifs together, MRR in 12 months would gain {gain}. |
| `slide.whatif.titleSupply` | changed | slide-supply-whatif | If subscription conversion reached {to} ({from} today), subscription MRR in 12 months would gain **{gain}**. | = | Si la conversion à l'abonnement passait à {to} (aujourd'hui {from}), le MRR d'abonnement dans 12 mois gagnerait **{gain}**. | = | was: If logo churn fell to {to} ({from} today), MRR in 12 months would gain {gain}. |
| `slide.whatif.figures` | changed | slide-*-whatif | The figures | = | Les chiffres | = | was: Growth figures / Les chiffres de croissance |
| `slide.whatif.assumeDemand` | changed | slide-demand-whatif | Over 12 months at this month's pace: today's net revenue kept at (1 − buyer churn) each month, plus the month's new buyers. A money lever applies to every buyer from next month. No seasonality, no saturation. | Over 12 months at this month's pace: today's net revenue kept at (1 − client churn) each month, plus the month's new clients. A money lever applies to every client from next month. No seasonality, no saturation. | Sur 12 mois, au rythme de ce mois : le revenu net d'aujourd'hui gardé à (1 − churn acheteurs) chaque mois, plus les nouveaux acheteurs du mois. Un levier d'argent s'applique à chaque acheteur dès le mois prochain. Ni saisonnalité, ni saturation. | Sur 12 mois, au rythme de ce mois : le revenu net d'aujourd'hui gardé à (1 − churn clients) chaque mois, plus les nouveaux clients du mois. Un levier d'argent s'applique à chaque client dès le mois prochain. Ni saisonnalité, ni saturation. | was: Logo churn stands in for revenue churn, … No seasonality, no saturation. |
| `slide.whatif.assumeSupply` | changed | slide-supply-whatif | Over 12 months at this month's pace: today's subscription MRR kept at (1 − paid seller churn) each month, plus the month's new paid sellers. No seasonality, no saturation. | Over 12 months at this month's pace: today's subscription MRR kept at (1 − paid provider churn) each month, plus the month's new paid providers. No seasonality, no saturation. | Sur 12 mois, au rythme de ce mois : le MRR d'abonnement d'aujourd'hui gardé à (1 − churn des vendeurs payants) chaque mois, plus les nouveaux vendeurs payants du mois. Ni saisonnalité, ni saturation. | Sur 12 mois, au rythme de ce mois : le MRR d'abonnement d'aujourd'hui gardé à (1 − churn des prestataires payants) chaque mois, plus les nouveaux prestataires payants du mois. Ni saisonnalité, ni saturation. | was: Logo churn stands in for revenue churn, … |
| `slide.unit.titleDemand` | changed | slide-demand-unit | A buyer pays back their acquisition cost in **{payback}** and brings back {ratio} times what they cost. | A client pays back their acquisition cost in **{payback}** and brings back {ratio} times what they cost. | Un acheteur rembourse son coût d'acquisition en **{payback}** et rapporte {ratio} fois ce qu'il coûte. | Un client rembourse son coût d'acquisition en **{payback}** et rapporte {ratio} fois ce qu'il coûte. | was: A customer pays back its acquisition cost in {payback} and brings back {ratio} times what it costs. |
| `slide.unit.titleSupply` | changed | slide-supply-unit | A paid seller pays back their cost in **{payback}** and brings back {ratio} times what they cost. | A paid provider pays back their cost in **{payback}** and brings back {ratio} times what they cost. | Un vendeur payant rembourse son coût en **{payback}** et rapporte {ratio} fois ce qu'il coûte. | Un prestataire payant rembourse son coût en **{payback}** et rapporte {ratio} fois ce qu'il coûte. | was: A customer pays back its acquisition cost in {payback} and brings back {ratio} times what it costs. |
| `slide.chart.cost.demand` | changed | slide-demand-unit | what a new buyer costs | what a new client costs | ce que coûte un nouvel acheteur | ce que coûte un nouveau client | was: what a new customer costs |
| `slide.chart.cost.supply` | changed | slide-supply-unit | what a new paid seller costs | what a new paid provider costs | ce que coûte un nouveau vendeur payant | ce que coûte un nouveau prestataire payant | was: what a new customer costs |
| `slide.chart.summary` | changed | slide-*-unit | One {unit}, month by month: brings back {mm} of margin a month, pays back their {cost} at {payback} months and stays {life}. | = | Un {unit}, mois par mois : rapporte {mm} de marge par mois, rembourse ses {cost} à {payback} mois et reste {life}. | = | was: One customer, month by month: … |
| `slide.tile.floor` | changed | slide-*-unit | a floor | = | un plancher | = | was: a floor · monthly billing |
| `slide.tile.derived` | new | slide-supply-unit | computed: {cpa} × {fs} ÷ {conv} | = | calculé : {cpa} × {fs} ÷ {conv} | = |  |
| `slide.tile.marginRange` | new | slide-demand-unit | margin estimated at {range} | = | marge estimée à {range} | = |  |
| `slide.unit.assume.demand` | changed | slide-demand-unit | Margin: the commissions' own ({margin}), never the subscriptions'. Cash tied up: a month's acquisition spend × the payback ÷ 2 — a floor. | = | Marge : celle des commissions ({margin}), jamais celle des abonnements. Trésorerie immobilisée : la dépense d'acquisition du mois × le payback ÷ 2 — un plancher. | = | was: Cash tied up: a month's acquisition spend × the payback ÷ 2 — a floor, monthly billing. |
| `slide.unit.assume.supply` | changed | slide-supply-unit | Margin: the subscriptions' own ({margin}), never the commissions'. Cash tied up: a month's acquisition spend × the payback ÷ 2 — a floor. | = | Marge : celle des abonnements ({margin}), jamais celle des commissions. Trésorerie immobilisée : la dépense d'acquisition du mois × le payback ÷ 2 — un plancher. | = | was: Cash tied up: a month's acquisition spend × the payback ÷ 2 — a floor, monthly billing. |
| `slide.total.col.month` | new | slide-total | This month | = | Ce mois-ci | = |  |
| `slide.total.col.fresh` | new | slide-total | New a month | = | Nouveau chaque mois | = |  |
| `slide.total.col.in12` | new | slide-total | In 12 months, today's pace | = | Dans 12 mois, rythme actuel | = |  |
| `slide.total.col.in12Moved` | new | slide-total | In 12 months, with our what-ifs | = | Dans 12 mois, avec nos « Et si » | = |  |
| `slide.total.side.demand` | new | slide-total | the buyers · slides 2–5 | the clients · slides 2–5 | les acheteurs · slides 2 à 5 | les clients · slides 2 à 5 |  |
| `slide.total.side.supply` | new | slide-total | the sellers · slides 6–9 | the providers · slides 6–9 | les vendeurs · slides 6 à 9 | les prestataires · slides 6 à 9 |  |
| `slide.total.note` | new | slide-total | A sum, never a comparison: each stream is read on its own side's slides, against its own targets. | = | Une somme, jamais une comparaison : chaque flux se lit sur les slides de son côté, contre ses propres cibles. | = |  |

## Board only — not copy

The deck's order is drawn on the board as a strip; these strings are the strip's, never the app's.

| Key | English | Français |
|---|---|---|
| `deck.title` | The deck of a marketplace | Le deck d'une place de marché |
| `deck.lead` | One side after the other, never facing: the total first (a sum), then the buyers' four slides, then the sellers' four. Each side's slides name their side in their top line. | Un côté après l'autre, jamais face à face : le total d'abord (une somme), puis les quatre slides des acheteurs, puis les quatre des vendeurs. Chaque slide d'un côté le nomme dans sa ligne du haut. |
| `deck.group.total` | Two streams, one total | Deux flux, un total |
| `deck.group.demand` | Demand: the buyers (services: Demand: the clients) | La demande : les acheteurs (services : La demande : les clients) |
| `deck.group.supply` | Supply: the sellers (services: Supply: the providers) | L'offre : les vendeurs (services : L'offre : les prestataires) |
| `deck.funnel` | The funnel — the side's verdict | Le funnel — le verdict du côté |
| `deck.leak` | The stage that holds it back | L'étape qui freine |
| `deck.whatif` | What if? — its levers | Et si ? — ses leviers |
| `deck.unit` | Unit economics | Unit economics |
| `deck.total` | The total — the marketplace's title | Le total — le titre de la place de marché |
| `deck.nosubs` | Without the subscriptions: no total slide (one stream is not a sum) — the buyers' four, then the sellers' funnel alone; their leak waits for targets. | Sans les abonnements : pas de slide du total (un seul flux n'est pas une somme) — les quatre des acheteurs, puis le funnel des vendeurs seul ; leur fuite attend des cibles. |
| `deck.rest` | Then the numbers and the sources, as today | Puis les chiffres et les sources, comme aujourd'hui |

## Kept — today's strings, drawn for context (83)

Unchanged, listed so the screens can be read in full. In both vocabularies unless written out.

| Key | English | Français |
|---|---|---|
| `bar.neverSaved` | Never saved | Jamais enregistré |
| `bar.menu` | Engine, month and file | Moteur, mois et fichier |
| `bar.settings` | Settings | Réglages |
| `next.since` | Last visit · today | Dernière visite · aujourd'hui |
| `next.go.slides` | Prepare your slides → | Prépare tes slides → |
| `next.backup` | Never saved to a file: Safari may erase it after seven days of use without a visit here. | Jamais enregistré dans un fichier : Safari peut l'effacer après sept jours d'utilisation sans passage ici. |
| `next.saveNow` | Save (.json) | Enregistrer (.json) |
| `diag.value.below` | {value}, below your target ({target}) | {value}, sous ta cible ({target}) |
| `diag.top` | The biggest loss in numbers is always at the top of the funnel; that's not what names the stage holding you back. | La plus grosse perte en nombre est toujours en haut du funnel ; ce n'est pas elle qui désigne l'étape qui freine. |
| `money.eyebrow` | The money · {month} | L'argent · {month} |
| `worth.costs` | Costs | Coûte |
| `worth.brings` | Brings back | Rapporte |
| `worth.more` | {gap} more | {gap} de plus |
| `cash.title` | Cash | Trésorerie |
| `cash.spend` | Spent on acquisition this month | Dépensé en acquisition ce mois-ci |
| `cash.tied` | Tied up at this pace | Immobilisé à ce rythme |
| `whatif.title` | What if? | Et si ? |
| `whatif.untouched` | Move the lever of the stage that holds you back, and see what follows. | Bouge le levier de l'étape qui freine, et vois ce qui suit. |
| `whatif.movedThree` | What if: your three levers, together | Et si : tes trois leviers, ensemble |
| `whatif.moved` | What if: {lever}, {to} instead of {from} | Et si : {lever}, {to} au lieu de {from} |
| `whatif.lever` | {lever} (today {value}) | {lever} (aujourd'hui {value}) |
| `whatif.today` | today {value} | aujourd'hui {value} |
| `whatif.all.demand` | See all 8 levers and what the calculation assumes → | Vois les 8 leviers et ce que le calcul suppose → |
| `whatif.reset` | Back to today | Remettre à aujourd'hui |
| `curve.today` | at today's pace | au rythme d'aujourd'hui |
| `curve.whatif` | with your what-ifs | avec tes « Et si » |
| `curve.start` | {value} today | {value} aujourd'hui |
| `panel.levers` | The levers | Les leviers |
| `panel.allBack` | All back to today | Tout remettre à aujourd'hui |
| `panel.untouchedNote` | No lever moved: the figures are today's. | Aucun levier bougé : les chiffres sont ceux d'aujourd'hui. |
| `panel.group.cash` | Cash | Trésorerie |
| `panel.col.figure` | Figure | Chiffre |
| `panel.col.today` | Today | Aujourd'hui |
| `panel.col.whatif` | With your what-ifs | Avec tes « Et si » |
| `panel.col.change` | Change | Écart |
| `row.ltv` | LTV | LTV |
| `row.ratio` | LTV:CAC | LTV:CAC |
| `row.after` | Months after payback | Mois après remboursement |
| `row.spend` | Spent on acquisition a month | Dépensé en acquisition par mois |
| `row.cash` | Cash tied up | Trésorerie immobilisée |
| `row.stable` | stable | stable |
| `row.more` | {gap} more | {gap} de plus |
| `sum.lever` | {lever}: {from} → {to} | {lever} : {from} → {to} |
| `sum.oneByOne` | Each alone, added up | Chacun seul, additionnés |
| `sum.together` | Together | Ensemble |
| `sum.extra` | Together they bring {extra} more than each alone, added up: each lever works on what the others add. That's compounding. | Ensemble, ils rapportent {extra} de plus que chacun seul, additionnés : chaque levier agit sur ce que les autres ajoutent. C'est l'effet composé. |
| `panel.assumptions` | What the calculation assumes | Ce que le calcul suppose |
| `funnel.upstream.demand` | ~{visitors} visitors a month for 100 sign-ups · GA4 · {month} | ~{visitors} visiteurs par mois pour 100 inscrits · GA4 · {month} |
| `funnel.signups.demand` | Buyer sign-ups (services: Client sign-ups) | Inscrits |
| `funnel.underTarget` | Below target | Sous la cible |
| `funnel.src.signups` | {n} sign-ups in {cohort}, brought back to 100 | {n} inscrits en {cohort}, ramenés à 100 |
| `funnel.src.analytics` | Amplitude · {cohort} | Amplitude · {cohort} |
| `legend.referred` | came through a referral ({n}) | venus par recommandation ({n}) |
| `legend.measured` | measured | mesuré |
| `list.title` | Your numbers | Tes chiffres |
| `list.holds` | Holds you back | Te freine |
| `list.found` | {found} of {n} found | {found} sur {n} trouvés |
| `status.found` | found | trouvé |
| `status.est` | estimated | estimé |
| `status.asked` | asked | demandé |
| `status.cant` | can't be found | introuvable |
| `status.todo` | to do | à faire |
| `progress.noneToGo` | Nothing left to type | Plus rien à taper |
| `progress.counts` | {found} found · {est} estimated · {asked} asked | {found} trouvés · {est} estimé · {asked} demandé |
| `progress.legendLabel` | What the marks mean | Ce que disent les marques |
| `tour.title` | The Tour and your numbers | Le Tour et tes chiffres |
| `term.cashTied.title` | Cash tied up | Trésorerie immobilisée |
| `term.after.title` | Months after payback | Mois après remboursement |
| `term.close` | Close | Fermer |
| `term.label` | Definition: {term} | Définition : {term} |
| `slide.header` | Growth engine · {month} · internal data | Moteur de growth · {month} · données internes |
| `slide.badge` | Data: measured {m} · approximate {a} · not found {n} | Données : mesurées {m} · approximatives {a} · introuvables {n} |
| `slide.leak.calc` | The calculation | Le calcul |
| `slide.leak.today` | Today | Aujourd'hui |
| `slide.leak.if` | If | Si |
| `slide.leak.then` | Then | Alors |
| `slide.leak.beside` | Beside it | À côté |
| `slide.leak.noTarget` | no team target | sans cible d'équipe |
| `slide.whatif.with` | With our what-ifs | Avec nos « Et si » |
| `slide.chart.leaves` | leaves at ~{life} months | part vers {life} mois |
| `slide.chart.paysBack` | paid back: {payback} months | remboursé : {payback} mois |
| `slide.chart.after` | ~{after} months of margin after | ~{after} mois de marge après |
| `slide.chart.months` | 0\|12\|24\|36 months | 0\|12\|24\|36 mois |
