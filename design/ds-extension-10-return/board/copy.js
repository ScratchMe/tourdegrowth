// Every string extension 10 adds or changes, in English and French and in
// both vocabularies (C65): "products" (buyers, sellers, orders, listings)
// and "services" (clients, providers, bookings, profiles) — with the
// screens it sits on, and the ported strings the screens draw around them
// (status `kept`). COPY.md is generated from this file (board/make-copy.mjs),
// so the board and Antoine's review sheet cannot drift.
//
// An entry: { en, fr } in the products vocabulary, { enS, frS } in the
// services one (absent: the same words). Status:
//   given    — brief 10's words (spec §22.8.5), used as written;
//   new      — does not exist today;
//   changed  — replaces a string of the engine, given in `was`;
//   kept     — today's string, drawn for context only.
// `why`: the reason, when a string departs from the given words or from
// the plain substitution of one vocabulary's words for the other's.
//
// French: "tu" on screens, « on » / « nous » on slides. Stage names stay in
// English. `frTypo` puts the narrow no-break space before : ; ? ! and inside
// « », and groups figures. Figures arrive in {placeholders} already
// formatted (board/fmt.js). **…** marks the words a sentence stresses: bold
// ink, never red (red is the leak's).

import { COPY as COPY07, frTypo } from "./copy07.js";

export { frTypo };

const s = (en, fr, on, status = "new", more = {}) => ({ en, fr, on, status, ...more });
// With the services words.
const v = (en, fr, enS, frS, on, status = "new", more = {}) => ({ en, fr, enS, frS, on, status, ...more });

export const COPY = {
  // ── Shared: the engine bar, the next step ─────────────────────────────
  "bar.line": s("Unnamed engine · Marketplace · {month}", "Moteur sans nom · Place de marché · {month}", ["board-*", "total-*"], "new",
    { why: "The type in the engine line, as « Libre-service » is today." }),
  "bar.neverSaved": s("Never saved", "Jamais enregistré", ["board-*", "total-*"], "kept"),
  "bar.menu": s("Engine, month and file", "Moteur, mois et fichier", ["board-*", "total-*"], "kept"),
  "bar.settings": s("Settings", "Réglages", ["board-*", "total-*"], "kept"),
  "next.since": s("Last visit · today", "Dernière visite · aujourd'hui", ["board-*", "total-*"], "kept"),
  "next.complete": s("Nothing left to type, on either side.", "Plus rien à taper, d'un côté comme de l'autre.", ["board-*", "total-*"], "new",
    { why: "Today's « Plus rien à taper » for two sides: the step is the engine's, not a side's (README, question 2)." }),
  "next.go.slides": s("Prepare your slides →", "Prépare tes slides →", ["board-*", "total-*"], "kept"),
  "next.totalIsSlide": s("The total above is the title of your first slide.", "Le total, ci-dessus, est le titre de ta première slide.", ["board-*", "total-moved"], "changed",
    { was: "Your verdict above is the title of your first slide. / Ton verdict, ci-dessus, est le titre de ta première slide." }),
  "next.buyersIsSlide": v(
    "Your buyers' verdict, below, is the title of your first slide.",
    "Le verdict des acheteurs, plus bas, est le titre de ta première slide.",
    "Your clients' verdict, below, is the title of your first slide.",
    "Le verdict des clients, plus bas, est le titre de ta première slide.",
    ["board-supply-nosubs", "board-demand-nosubs", "total-nosubs"], "new",
    { why: "Without the subscriptions there is no total slide: the deck opens on the buyers' funnel (README, question 10)." }),
  "next.backup": s(
    "Never saved to a file: Safari may erase it after seven days of use without a visit here.",
    "Jamais enregistré dans un fichier : Safari peut l'effacer après sept jours d'utilisation sans passage ici.",
    ["board-*", "total-*"], "kept"),
  "next.saveNow": s("Save (.json)", "Enregistrer (.json)", ["board-*", "total-*"], "kept"),

  // ── Shared: the total (TotalBand) ─────────────────────────────────────
  "total.eyebrow": s("Two streams, one total", "Deux flux, un total", ["board-demand", "board-supply", "board-services*", "board-demand-nomargin", "total-moved"], "given"),
  "total.title": v(
    "The marketplace brings in **{total}** a month: {demand} in commissions, {supply} in sellers' subscriptions.",
    "La place de marché rapporte **{total}** par mois : {demand} de commissions, {supply} d'abonnements des vendeurs.",
    "The marketplace brings in **{total}** a month: {demand} in commissions, {supply} in providers' subscriptions.",
    "La place de marché rapporte **{total}** par mois : {demand} de commissions, {supply} d'abonnements des prestataires.",
    ["board-demand", "board-supply", "board-services*", "board-demand-nomargin", "total-moved", "slide-total"], "given"),
  "total.demand": s("Commissions (net revenue)", "Commissions (revenu net)", ["board-demand", "board-supply", "board-services*", "total-moved", "slide-total"], "given"),
  "total.supply": v("Sellers' subscriptions", "Abonnements des vendeurs", "Providers' subscriptions", "Abonnements des prestataires",
    ["board-demand", "board-supply", "board-services*", "total-moved", "slide-total"], "given"),
  "total.total": s("Total a month", "Total par mois", ["board-demand", "board-supply", "board-services*", "total-moved", "slide-total"], "given"),
  "total.annual": s("Total, annualised", "Total annualisé", ["board-demand", "board-supply", "board-services*", "total-moved"], "new",
    { why: "TotalBand's `totals` (extension 09): what adds up across the two streams, and only that." }),
  "total.fresh": s("New a month", "Nouveau chaque mois", ["board-demand", "board-supply", "board-services*", "total-moved"]),
  "total.in12": s("In 12 months at today's pace", "Dans 12 mois au rythme actuel", ["board-demand", "board-supply", "board-services*"], "new",
    { was: "MRR in 12 months at today's pace / MRR dans 12 mois au rythme actuel (the hybrid)" }),
  "total.in12Moved": s("In 12 months with your what-ifs, both sides", "Dans 12 mois avec tes « Et si », des deux côtés", ["total-moved"]),
  "total.todayLine": s(
    "At today's pace: {today} in 12 months. The what-ifs of both sides add up here, and only here.",
    "Au rythme actuel : {today} dans 12 mois. Les « Et si » des deux côtés s'additionnent ici, et seulement ici.",
    ["total-moved"]),

  // ── The side selector (SideShown) ─────────────────────────────────────
  "side.label": s("Side shown", "Côté affiché", ["board-*", "total-*"], "given"),
  "side.demand": s("Demand", "Demande", ["board-*", "total-*"], "given"),
  "side.supply": s("Supply", "Offre", ["board-*", "total-*"], "given"),
  "side.title.demand": v("Demand: the buyers", "La demande : les acheteurs", "Demand: the clients", "La demande : les clients",
    ["board-demand*", "board-services", "total-*", "slide-demand-*", "slide-services-funnel"], "given",
    { why: "Also the side's line above each of its slides' titles (question 10)." }),
  "side.title.supply": v("Supply: the sellers", "L'offre : les vendeurs", "Supply: the providers", "L'offre : les prestataires",
    ["board-supply*", "board-services-supply", "slide-supply-*"], "given"),
  "side.note": s(
    "Two sides, two readings: each is read against its own targets, never against the other.",
    "Deux côtés, deux lectures : chacun se lit contre ses propres cibles, jamais contre l'autre.",
    ["board-*", "total-*"], "new",
    { was: "Two engines, two segments: each is read against its own targets, not against the other. (the hybrid)" }),

  // ── A side's verdict (the funnel's title, on the board and the slide) ──
  "verdict.demand": v(
    "Out of 100 buyer sign-ups, {first} place a first order and **{second} place a second one**.",
    "Sur 100 inscrits côté acheteurs, {first} passent une première commande et **{second} en passent une deuxième**.",
    "Out of 100 client sign-ups, {first} make a first booking and **{second} make a second one**.",
    "Sur 100 inscrits côté clients, {first} font une première réservation et **{second} en font une deuxième**.",
    ["board-demand*", "board-services", "slide-demand-funnel", "slide-services-funnel"], "given",
    { why: "Services: the verb changes with the noun (« passer une commande », « faire une réservation »): a word swap would read « passent une première réservation »." }),
  "verdict.supply": v(
    "Out of 100 seller sign-ups, {first} make a first sale and **{subs} subscribe**.",
    "Sur 100 vendeurs inscrits, {first} font une première vente et **{subs} s'abonnent**.",
    "Out of 100 provider sign-ups, {first} do a first job and **{subs} subscribe**.",
    "Sur 100 prestataires inscrits, {first} réalisent une première prestation et **{subs} s'abonnent**.",
    ["board-supply", "board-services-supply", "slide-supply-funnel"], "given",
    { why: "Services: « première vente » would become « première réservation » — the clients' word. A provider's first is a job done: « première prestation » / \"first job\"." }),
  "verdict.supplyNoSubs": v(
    "Out of 100 seller sign-ups, **{first} make a first sale**.",
    "Sur 100 vendeurs inscrits, **{first} font une première vente**.",
    "Out of 100 provider sign-ups, **{first} do a first job**.",
    "Sur 100 prestataires inscrits, **{first} réalisent une première prestation**.",
    ["board-supply-nosubs", "slide-supply-nosubs"]),

  // ── A side's diagnosis ────────────────────────────────────────────────
  "diag.eyebrow.demand": v("One stage holds the buyers back", "Une étape freine les acheteurs", "One stage holds the clients back", "Une étape freine les clients",
    ["board-demand*", "board-services"], "changed", { was: "One stage holds the engine back / Une étape freine le moteur" }),
  "diag.eyebrow.supply": v("One stage holds the sellers back", "Une étape freine les vendeurs", "One stage holds the providers back", "Une étape freine les prestataires",
    ["board-supply", "board-services-supply"], "changed", { was: "One stage holds the engine back / Une étape freine le moteur" }),
  "diag.value.below": s("{value}, below your target ({target})", "{value}, sous ta cible ({target})", ["board-demand*", "board-supply", "board-services*"], "kept"),
  "diag.worth.demand": s(
    "Bringing the fill rate to {target} would be worth **{worth} of new net revenue** every month.",
    "Ramener le taux de service à {target} vaudrait **{worth} de revenu net nouveau** chaque mois.",
    ["board-demand*", "board-services", "slide-demand-leak"], "given",
    { why: "The given words print « 468 € »; the engine prints a projection at two significant digits with « ~ » (the self-serve leak slide reads « ~600 € »): we draw « ~470 € ». Antoine decides." }),
  "diag.worth.supply": s(
    "Bringing subscription conversion to {target} would be worth **{worth} of new subscription MRR** every month.",
    "Ramener la conversion à l'abonnement à {target} vaudrait **{worth} de MRR d'abonnement nouveau** chaque mois.",
    ["board-supply", "board-services-supply", "slide-supply-leak"], "new",
    { why: "The demand's sentence, in supply's words (\"MRR\" reads \"subscription MRR\", §22.8.5)." }),
  "diag.aside.demand": v(
    "Beside it: the first order, {value} for a target of {target}, would be worth {worth}.",
    "À côté : la première commande, {value} pour une cible de {target}, vaudrait {worth}.",
    "Beside it: the first booking, {value} for a target of {target}, would be worth {worth}.",
    "À côté : la première réservation, {value} pour une cible de {target}, vaudrait {worth}.",
    ["board-demand*", "board-services"]),
  "diag.aside.supply": v(
    "Beside it: paid seller churn, {value} for {target}, would keep {worth} of subscription MRR a month. The first sale, {fs} for {fsTarget}, is named without an amount: it is priced only through the subscriptions.",
    "À côté : le churn des vendeurs payants, {value} pour {target}, préserverait {worth} de MRR d'abonnement par mois. La première vente, {fs} pour {fsTarget}, est nommée sans montant : elle ne se chiffre qu'à travers les abonnements.",
    "Beside it: paid provider churn, {value} for {target}, would keep {worth} of subscription MRR a month. The first job, {fs} for {fsTarget}, is named without an amount: it is priced only through the subscriptions.",
    "À côté : le churn des prestataires payants, {value} pour {target}, préserverait {worth} de MRR d'abonnement par mois. La première prestation, {fs} pour {fsTarget}, est nommée sans montant : elle ne se chiffre qu'à travers les abonnements.",
    ["board-supply", "board-services-supply"], "new", { why: "C67: the first sale is named, unpriced." }),
  "diag.top": s(
    "The biggest loss in numbers is always at the top of the funnel; that's not what names the stage holding you back.",
    "La plus grosse perte en nombre est toujours en haut du funnel ; ce n'est pas elle qui désigne l'étape qui freine.",
    ["board-demand*", "board-supply", "board-services*"], "kept"),

  // ── Supply without the subscriptions (SideNote) ───────────────────────
  "note.targets.title": v(
    "Not enough targets to name what holds the sellers back",
    "Pas assez de cibles pour nommer ce qui freine les vendeurs",
    "Not enough targets to name what holds the providers back",
    "Pas assez de cibles pour nommer ce qui freine les prestataires",
    ["board-supply-nosubs"]),
  "note.targets.body": v(
    "On the sellers' side, one stage alone has a team target: the first sale ({target}; it is at {value}). That is too few to name the stage that holds them back.",
    "Côté vendeurs, une seule étape a une cible d'équipe : la première vente ({target} ; elle est à {value}). C'est trop peu pour désigner l'étape qui les freine.",
    "On the providers' side, one stage alone has a team target: the first job ({target}; it is at {value}). That is too few to name the stage that holds them back.",
    "Côté prestataires, une seule étape a une cible d'équipe : la première prestation ({target} ; elle est à {value}). C'est trop peu pour désigner l'étape qui les freine.",
    ["board-supply-nosubs"], "new", { why: "No rule stated in figures (\"two targets\"): the engine's rule (§22.6) stays the engine's." }),
  "note.targets.action": v("Set the sellers' targets →", "Fixer les cibles des vendeurs →", "Set the providers' targets →", "Fixer les cibles des prestataires →", ["board-supply-nosubs"]),
  "note.money.title": v(
    "Sellers don't pay: supply earns nothing directly",
    "Les vendeurs ne paient pas : l'offre ne rapporte rien en direct",
    "Providers don't pay: supply earns nothing directly",
    "Les prestataires ne paient pas : l'offre ne rapporte rien en direct",
    ["board-supply-nosubs"]),
  "note.money.body": v(
    "All of the marketplace's revenue is the commissions, on the demand side. What sellers do shows in the fill rate (below, with their funnel).",
    "Tout le revenu de la place de marché, ce sont les commissions, côté demande. Ce que font les vendeurs se lit dans le taux de service (plus bas, avec leur funnel).",
    "All of the marketplace's revenue is the commissions, on the demand side. What providers do shows in the fill rate (below, with their funnel).",
    "Tout le revenu de la place de marché, ce sont les commissions, côté demande. Ce que font les prestataires se lit dans le taux de service (plus bas, avec leur funnel).",
    ["board-supply-nosubs"]),
  "note.money.whatif": v(
    "No money on this side, so no “What if?” either: the sellers' levers are the subscription's.",
    "Pas d'argent de ce côté, donc pas de « Et si » non plus : les leviers des vendeurs sont ceux de l'abonnement.",
    "No money on this side, so no “What if?” either: the providers' levers are the subscription's.",
    "Pas d'argent de ce côté, donc pas de « Et si » non plus : les leviers des prestataires sont ceux de l'abonnement.",
    ["board-supply-nosubs"]),
  "note.money.action": v(
    "Do your sellers pay a subscription? Tick it in the settings",
    "Tes vendeurs paient un abonnement ? Coche-le dans les réglages",
    "Do your providers pay a subscription? Tick it in the settings",
    "Tes prestataires paient un abonnement ? Coche-le dans les réglages",
    ["board-supply-nosubs"]),

  // ── A side's money (MoneyBlock) ───────────────────────────────────────
  "money.eyebrow": s("The money · {month}", "L'argent · {month}", ["board-*", "total-nosubs"], "kept"),
  "money.net": s("Net revenue", "Revenu net", ["board-demand-nosubs", "board-supply-nosubs", "total-nosubs"], "given",
    { why: "On demand, \"MRR\" reads \"net revenue\" (§22.8.5)." }),
  "money.netAnnual": s("Net revenue, annualised", "Revenu net annualisé", ["board-demand*", "board-services", "total-nosubs"]),
  "money.gmv": v("Gross merchandise value (GMV)", "Volume d'affaires (GMV)", "Gross booking value (GMV)", "Volume d'affaires (GMV)",
    ["board-demand*", "board-services", "total-nosubs"], "new",
    { why: "Services: \"merchandise\" does not fit a booking; the French « volume d'affaires » fits both." }),
  "money.subAnnual": s("Subscription MRR, annualised", "MRR d'abonnement annualisé", ["board-supply", "board-services-supply"]),
  "worth.title.demand": v("What one new buyer is worth", "Ce que vaut un nouvel acheteur", "What one new client is worth", "Ce que vaut un nouveau client",
    ["board-demand*", "board-services"], "changed", { was: "What one new customer is worth / Ce que vaut un nouveau client" }),
  "worth.title.supply": v("What one new paid seller is worth", "Ce que vaut un nouveau vendeur payant", "What one new paid provider is worth", "Ce que vaut un nouveau prestataire payant",
    ["board-supply", "board-services-supply"], "changed", { was: "What one new customer is worth / Ce que vaut un nouveau client" }),
  "worth.healthy.demand": v(
    "Each new buyer costs {cost} and brings back {ltv} of margin on the commissions: {gap} more than they cost.",
    "Chaque nouvel acheteur coûte {cost} et rapporte {ltv} de marge sur les commissions : {gap} de plus que ce qu'il coûte.",
    "Each new client costs {cost} and brings back {ltv} of margin on the commissions: {gap} more than they cost.",
    "Chaque nouveau client coûte {cost} et rapporte {ltv} de marge sur les commissions : {gap} de plus que ce qu'il coûte.",
    ["board-demand", "board-services", "board-demand-nosubs"], "changed",
    { was: "Each new customer costs {cac} and brings back {ltv} of margin: {gap} more than it costs." }),
  "worth.healthy.supply": v(
    "Each new paid seller costs {cost} and brings back {ltv} of margin on the subscription: {gap} more than they cost.",
    "Chaque nouveau vendeur payant coûte {cost} et rapporte {ltv} de marge sur l'abonnement : {gap} de plus que ce qu'il coûte.",
    "Each new paid provider costs {cost} and brings back {ltv} of margin on the subscription: {gap} more than they cost.",
    "Chaque nouveau prestataire payant coûte {cost} et rapporte {ltv} de marge sur l'abonnement : {gap} de plus que ce qu'il coûte.",
    ["board-supply", "board-services-supply"], "changed",
    { was: "Each new customer costs {cac} and brings back {ltv} of margin: {gap} more than it costs." }),
  "worth.none.demand": v(
    "We can't tell yet what a new buyer brings back: the margin on net revenue is missing.",
    "On ne peut pas encore dire ce que rapporte un nouvel acheteur : il manque la marge sur le revenu net.",
    "We can't tell yet what a new client brings back: the margin on net revenue is missing.",
    "On ne peut pas encore dire ce que rapporte un nouveau client : il manque la marge sur le revenu net.",
    ["board-demand-nomargin"], "changed", { was: "…: the gross margin is missing." }),
  "worth.noneNote.demand": s(
    "Without it, no LTV, no payback, no cash figure — and never the subscriptions' margin in its place: each stream has its own.",
    "Sans elle, pas de LTV, pas de payback, pas de trésorerie — et jamais la marge des abonnements à sa place : chaque flux a la sienne.",
    ["board-demand-nomargin"], "changed",
    { was: "Without it, no LTV, no payback, no cash figure: computed on revenue, they would flatter your engine.", why: "Constraint 5, said where it applies." }),
  "worth.costs": s("Costs", "Coûte", ["board-*"], "kept"),
  "worth.brings": s("Brings back", "Rapporte", ["board-*"], "kept"),
  "worth.more": s("{gap} more", "{gap} de plus", ["board-*"], "kept"),
  "worth.missing.demand": s("missing: margin on net revenue", "il manque la marge sur le revenu net", ["board-demand-nomargin", "whatif-demand-nomargin"], "changed",
    { was: "missing: gross margin / il manque la marge brute" }),
  "worth.months.demand": v(
    "A buyer pays back their cost in {payback} and stays {life}: {after} of margin after payback",
    "Un acheteur rembourse son coût en {payback} et reste {life} : {after} de marge après le remboursement",
    "A client pays back their cost in {payback} and stays {life}: {after} of margin after payback",
    "Un client rembourse son coût en {payback} et reste {life} : {after} de marge après le remboursement",
    ["board-demand", "board-services", "board-demand-nosubs"], "changed",
    { was: "It pays back its cost in {payback} and stays {life}: {after} of margin after payback." }),
  "worth.months.supply": v(
    "A paid seller pays back their cost in {payback} and stays {life}: {after} of margin after payback",
    "Un vendeur payant rembourse son coût en {payback} et reste {life} : {after} de marge après le remboursement",
    "A paid provider pays back their cost in {payback} and stays {life}: {after} of margin after payback",
    "Un prestataire payant rembourse son coût en {payback} et reste {life} : {after} de marge après le remboursement",
    ["board-supply", "board-services-supply"], "changed",
    { was: "It pays back its cost in {payback} and stays {life}: {after} of margin after payback." }),
  "worth.perBuyer": v(
    "One active buyer brings in {per} of net revenue a month: {freq} orders × {aov} × {take} commission.",
    "Un acheteur actif rapporte {per} de revenu net par mois : {freq} commande × {aov} × {take} de commission.",
    "One active client brings in {per} of net revenue a month: {freq} bookings × {aov} × {take} commission.",
    "Un client actif rapporte {per} de revenu net par mois : {freq} réservation × {aov} × {take} de commission.",
    ["board-demand*", "board-services"], "new",
    { why: "What one active buyer brings, said once, as the product that makes it (the brief, question 3)." }),
  "worth.costExplained": v(
    "The cost of a paid seller is computed: {cpa} per active seller × {fs} first sale ÷ {conv} subscription conversion = {cost} — one paid seller for every {n} active ones.",
    "Le coût d'un vendeur payant est calculé : {cpa} par vendeur actif × {fs} de première vente ÷ {conv} de conversion à l'abonnement = {cost} — un vendeur payant pour {n} actifs.",
    "The cost of a paid provider is computed: {cpa} per active provider × {fs} first job ÷ {conv} subscription conversion = {cost} — one paid provider for every {n} active ones.",
    "Le coût d'un prestataire payant est calculé : {cpa} par prestataire actif × {fs} de première prestation ÷ {conv} de conversion à l'abonnement = {cost} — un prestataire payant pour {n} actifs.",
    ["board-supply", "board-services-supply", "slide-supply-unit"], "new", { why: "The brief, question 3: the cost of a paid seller, explained." }),
  "cash.title": s("Cash", "Trésorerie", ["board-*"], "kept"),
  "cash.spend": s("Spent on acquisition this month", "Dépensé en acquisition ce mois-ci", ["board-*"], "kept"),
  "cash.tied": s("Tied up at this pace", "Immobilisé à ce rythme", ["board-*"], "kept"),
  "cash.line.demand": v("It all comes back, as buyers pay back.", "Elle revient toute, au fil des remboursements des acheteurs.",
    "It all comes back, as clients pay back.", "Elle revient toute, au fil des remboursements des clients.",
    ["board-demand", "board-services"], "changed", { was: "It all comes back, as customers pay back." }),
  "cash.line.supply": v("It all comes back, as paid sellers pay back.", "Elle revient toute, au fil des remboursements des vendeurs payants.",
    "It all comes back, as paid providers pay back.", "Elle revient toute, au fil des remboursements des prestataires payants.",
    ["board-supply", "board-services-supply"], "changed", { was: "It all comes back, as customers pay back." }),
  "cash.lineNone.demand": s(
    "No cash figure without the margin on net revenue: the payback is what says when the spend comes back.",
    "Pas de trésorerie sans la marge sur le revenu net : c'est le payback qui dit quand la dépense revient.",
    ["board-demand-nomargin"], "changed", { was: "No cash figure without the margin: …" }),
  "cash.assumptions": s(
    "A floor: each month's spend comes back evenly over the payback, so half of it is out at any time; churn slows the return and is not counted.",
    "Un plancher : la dépense de chaque mois revient régulièrement sur la durée du payback, la moitié est donc dehors à tout moment ; le churn ralentit le retour et n'est pas compté.",
    ["board-demand", "board-supply", "board-services*"], "changed",
    { was: "…; churn and contraction slow the return and are not counted. Monthly billing.", why: "A marketplace has no contraction; a commission is taken on each order, not billed monthly." }),

  // ── "What if?" — the card (LeverCard) and the curve (MrrCurve) ─────────
  "whatif.title": s("What if?", "Et si ?", ["whatif-*", "board-*"], "kept"),
  "whatif.untouched": s("Move the lever of the stage that holds you back, and see what follows.", "Bouge le levier de l'étape qui freine, et vois ce qui suit.", ["whatif-*", "board-*"], "kept"),
  "whatif.movedThree": s("What if: your three levers, together", "Et si : tes trois leviers, ensemble", ["whatif-demand-moved"], "kept"),
  "whatif.moved": s("What if: {lever}, {to} instead of {from}", "Et si : {lever}, {to} au lieu de {from}", ["whatif-supply-moved"], "kept"),
  "whatif.lever": s("{lever} (today {value})", "{lever} (aujourd'hui {value})", ["whatif-*", "board-*"], "kept"),
  "whatif.net12": s("Net revenue in 12 months", "Revenu net dans 12 mois", ["whatif-demand*", "board-demand*", "board-services"], "changed",
    { was: "MRR in 12 months / MRR dans 12 mois" }),
  "whatif.netAnnual12": s("Annualised, in 12 months", "Annualisé, dans 12 mois", ["whatif-*", "board-demand*", "board-supply", "board-services*"], "changed",
    { was: "ARR in 12 months / ARR dans 12 mois" }),
  "whatif.sub12": s("Subscription MRR in 12 months", "MRR d'abonnement dans 12 mois", ["whatif-supply*", "board-supply", "board-services-supply"], "changed",
    { was: "MRR in 12 months / MRR dans 12 mois" }),
  "whatif.today": s("today {value}", "aujourd'hui {value}", ["whatif-*"], "kept"),
  "whatif.all.demand": s("See all 8 levers and what the calculation assumes →", "Vois les 8 leviers et ce que le calcul suppose →", ["whatif-demand*", "board-demand*", "board-services"], "kept"),
  "whatif.all.supply": s("See all 3 levers and what the calculation assumes →", "Vois les 3 leviers et ce que le calcul suppose →", ["whatif-supply*", "board-supply", "board-services-supply"], "changed",
    { was: "See all 8 levers…" }),
  "whatif.reset": s("Back to today", "Remettre à aujourd'hui", ["whatif-*-moved"], "kept"),
  "curve.today": s("at today's pace", "au rythme d'aujourd'hui", ["whatif-*", "board-*", "slide-*-whatif"], "kept"),
  "curve.whatif": s("with your what-ifs", "avec tes « Et si »", ["whatif-*-moved"], "kept"),
  "curve.whatifSlide": s("with our what-ifs", "avec nos « Et si »", ["slide-*-whatif"], "new"),
  "curve.start": s("{value} today", "{value} aujourd'hui", ["whatif-*", "board-*", "slide-*-whatif"], "kept"),
  "curve.step.demand": s(
    "Month 1: the take rate goes to {take} on every order from next month — {step} more net revenue a month on today's buyers alone.",
    "Mois 1 : la commission passe à {take} sur chaque commande dès le mois prochain — {step} de revenu net en plus par mois sur les seuls acheteurs d'aujourd'hui.",
    ["whatif-demand-moved", "slide-demand-whatif"], "new",
    { enS: "Month 1: the take rate goes to {take} on every booking from next month — {step} more net revenue a month on today's clients alone.",
      frS: "Mois 1 : la commission passe à {take} sur chaque réservation dès le mois prochain — {step} de revenu net en plus par mois sur les seuls clients d'aujourd'hui.",
      why: "Question 8: why the curve jumps at month 1, said under it with the curve's own mark (MrrCurve.delta.md)." }),
  "curve.summary": s(
    "{what} month by month, from {start} today to {today} in 12 months at today's pace.",
    "{what} mois par mois, de {start} aujourd'hui à {today} dans 12 mois au rythme actuel.",
    ["whatif-*", "board-*"], "changed", { was: "The MRR month by month, …" }),
  "curve.summaryWhatif": s(
    "{what} month by month, from {start} today: {today} in 12 months at today's pace, {whatif} with your what-ifs.",
    "{what} mois par mois, depuis {start} aujourd'hui : {today} dans 12 mois au rythme actuel, {whatif} avec tes « Et si ».",
    ["whatif-*-moved"], "changed", { was: "The MRR month by month, …" }),
  "curve.what.demand": s("Net revenue", "Le revenu net", ["whatif-demand*"]),
  "curve.what.supply": s("Subscription MRR", "Le MRR d'abonnement", ["whatif-supply*"]),

  // ── "What if?" — the panel ────────────────────────────────────────────
  "panel.intro": v(
    "Move one lever or several: the buyers' funnel and figures recompute together, and the effects add up. The sellers' levers are on their side.",
    "Bouge un ou plusieurs leviers : le funnel et les chiffres des acheteurs se recalculent ensemble, les effets se cumulent. Les leviers des vendeurs sont de leur côté.",
    "Move one lever or several: the clients' funnel and figures recompute together, and the effects add up. The providers' levers are on their side.",
    "Bouge un ou plusieurs leviers : le funnel et les chiffres des clients se recalculent ensemble, les effets se cumulent. Les leviers des prestataires sont de leur côté.",
    ["whatif-demand*"], "changed", { was: "Move one lever or several: the month's funnel and your growth numbers recompute together, and the effects add up." }),
  "panel.intro.supply": v(
    "Move one lever or several: the sellers' subscriptions recompute, and the effects add up. The buyers' levers are on their side.",
    "Bouge un ou plusieurs leviers : les abonnements des vendeurs se recalculent, les effets se cumulent. Les leviers des acheteurs sont de leur côté.",
    "Move one lever or several: the providers' subscriptions recompute, and the effects add up. The clients' levers are on their side.",
    "Bouge un ou plusieurs leviers : les abonnements des prestataires se recalculent, les effets se cumulent. Les leviers des clients sont de leur côté.",
    ["whatif-supply*"]),
  "panel.levers": s("The levers", "Les leviers", ["whatif-*"], "kept"),
  "panel.allBack": s("All back to today", "Tout remettre à aujourd'hui", ["whatif-*-moved"], "kept"),
  "panel.figures": s("The figures", "Les chiffres", ["whatif-*"], "changed", { was: "Your growth figures / Tes chiffres de croissance" }),
  "panel.untouchedNote": s("No lever moved: the figures are today's.", "Aucun levier bougé : les chiffres sont ceux d'aujourd'hui.", ["whatif-demand", "whatif-supply"], "kept"),
  "panel.group.growth.demand": s("Net revenue", "Revenu net", ["whatif-demand*"], "changed", { was: "Growth / Croissance" }),
  "panel.group.growth.supply": s("Subscription MRR", "MRR d'abonnement", ["whatif-supply*"], "changed", { was: "Growth / Croissance" }),
  "panel.group.unit.demand": v("One new buyer", "Un nouvel acheteur", "One new client", "Un nouveau client", ["whatif-demand*"], "changed", { was: "One new customer / Un nouveau client" }),
  "panel.group.unit.supply": v("One new paid seller", "Un nouveau vendeur payant", "One new paid provider", "Un nouveau prestataire payant", ["whatif-supply*"], "changed", { was: "One new customer / Un nouveau client" }),
  "panel.group.cash": s("Cash", "Trésorerie", ["whatif-*"], "kept"),
  "panel.col.figure": s("Figure", "Chiffre", ["whatif-*"], "kept"),
  "panel.col.today": s("Today", "Aujourd'hui", ["whatif-*", "slide-*-whatif"], "kept"),
  "panel.col.whatif": s("With your what-ifs", "Avec tes « Et si »", ["whatif-*-moved"], "kept"),
  "panel.col.change": s("Change", "Écart", ["whatif-*-moved", "slide-*-whatif"], "kept"),
  "row.fresh.demand": s("New net revenue a month", "Revenu net nouveau par mois", ["whatif-demand*", "slide-demand-whatif"], "changed", { was: "New MRR a month / Nouveau MRR par mois" }),
  "row.fresh.supply": s("New subscription MRR a month", "MRR d'abonnement nouveau par mois", ["whatif-supply*", "slide-supply-whatif"], "changed", { was: "New MRR a month / Nouveau MRR par mois" }),
  "row.new.demand": v("New buyers a month", "Nouveaux acheteurs par mois", "New clients a month", "Nouveaux clients par mois", ["whatif-demand*"], "new"),
  "row.new.supply": v("New paid sellers a month", "Nouveaux vendeurs payants par mois", "New paid providers a month", "Nouveaux prestataires payants par mois", ["whatif-supply*"], "new"),
  "row.net12": s("Net revenue in 12 months", "Revenu net dans 12 mois", ["slide-demand-whatif"], "changed", { was: "MRR in 12 months" }),
  "row.sub12": s("Subscription MRR in 12 months", "MRR d'abonnement dans 12 mois", ["slide-supply-whatif"], "changed", { was: "MRR in 12 months" }),
  "row.cost.demand": v("Cost of a buyer (CAC)", "Coût d'un acheteur (CAC)", "Cost of a client (CAC)", "Coût d'un client (CAC)", ["whatif-demand*", "slide-demand-*"], "changed", { was: "CAC" }),
  "row.cost.supply": v("Cost of a paid seller", "Coût d'un vendeur payant", "Cost of a paid provider", "Coût d'un prestataire payant", ["whatif-supply*", "slide-supply-*"], "new",
    { why: "Not a CAC typed: derived (cost per active seller × first sale ÷ conversion)." }),
  "row.ltv": s("LTV", "LTV", ["whatif-*", "slide-*"], "kept"),
  "row.ratio": s("LTV:CAC", "LTV:CAC", ["whatif-*", "slide-*"], "kept"),
  "row.gap.demand": v("Per new buyer", "Par nouvel acheteur", "Per new client", "Par nouveau client", ["whatif-demand*"], "changed", { was: "Per new customer" }),
  "row.gap.supply": v("Per new paid seller", "Par nouveau vendeur payant", "Per new paid provider", "Par nouveau prestataire payant", ["whatif-supply*"], "changed", { was: "Per new customer" }),
  "row.payback": s("Payback", "Payback", ["whatif-*", "slide-*"], "changed", { was: "CAC payback", why: "Supply's cost is not a CAC typed." }),
  "row.after": s("Months after payback", "Mois après remboursement", ["whatif-*", "slide-*"], "kept"),
  "row.spend": s("Spent on acquisition a month", "Dépensé en acquisition par mois", ["whatif-*"], "kept"),
  "row.cash": s("Cash tied up", "Trésorerie immobilisée", ["whatif-*", "slide-*"], "kept"),
  "row.stable": s("stable", "stable", ["whatif-*", "slide-*"], "kept"),
  "row.more": s("{gap} more", "{gap} de plus", ["whatif-*"], "kept"),
  "sum.title.demand": s("What each lever brings on its own, on net revenue in 12 months", "Ce que chaque levier rapporte seul, sur le revenu net dans 12 mois", ["whatif-demand-moved", "slide-demand-whatif"], "changed",
    { was: "…, on MRR in 12 months / …, sur le MRR dans 12 mois" }),
  "sum.lever": s("{lever}: {from} → {to}", "{lever} : {from} → {to}", ["whatif-demand-moved", "slide-demand-whatif"], "kept"),
  "sum.oneByOne": s("Each alone, added up", "Chacun seul, additionnés", ["whatif-demand-moved", "slide-demand-whatif"], "kept"),
  "sum.together": s("Together", "Ensemble", ["whatif-demand-moved", "slide-demand-whatif"], "kept"),
  "sum.extra": s(
    "Together they bring {extra} more than each alone, added up: each lever works on what the others add. That's compounding.",
    "Ensemble, ils rapportent {extra} de plus que chacun seul, additionnés : chaque levier agit sur ce que les autres ajoutent. C'est l'effet composé.",
    ["whatif-demand-moved", "slide-demand-whatif"], "kept"),
  "panel.assumptions": s("What the calculation assumes", "Ce que le calcul suppose", ["whatif-*"], "kept"),
  "panel.assume.demand": v(
    "Net revenue: active buyers × orders a month × average order value × take rate, kept at (1 − buyer churn) each month, plus the month's new buyers (sign-ups × first order × the fill rate's effect). The fill rate is priced on new buyers only: a minimum. A money lever (frequency, order value, take rate) applies to every buyer from next month. LTV: the commissions' margin a month over a buyer's counted lifetime (1 ÷ churn, capped at 36 months).",
    "Revenu net : acheteurs actifs × commandes par mois × panier moyen × taux de commission, gardé à (1 − churn acheteurs) chaque mois, plus les nouveaux acheteurs du mois (inscrits × première commande × l'effet du taux de service). Le taux de service n'est chiffré que sur les nouveaux acheteurs : c'est un minimum. Un levier d'argent (fréquence, panier, commission) s'applique à chaque acheteur dès le mois prochain. LTV : la marge des commissions par mois sur la durée de vie comptée d'un acheteur (1 ÷ churn, plafonnée à 36 mois).",
    "Net revenue: active clients × bookings a month × average booking value × take rate, kept at (1 − client churn) each month, plus the month's new clients (sign-ups × first booking × the fill rate's effect). The fill rate is priced on new clients only: a minimum. A money lever (frequency, booking value, take rate) applies to every client from next month. LTV: the commissions' margin a month over a client's counted lifetime (1 ÷ churn, capped at 36 months).",
    "Revenu net : clients actifs × réservations par mois × montant moyen × taux de commission, gardé à (1 − churn clients) chaque mois, plus les nouveaux clients du mois (inscrits × première réservation × l'effet du taux de service). Le taux de service n'est chiffré que sur les nouveaux clients : c'est un minimum. Un levier d'argent (fréquence, montant, commission) s'applique à chaque client dès le mois prochain. LTV : la marge des commissions par mois sur la durée de vie comptée d'un client (1 ÷ churn, plafonnée à 36 mois).",
    ["whatif-demand*"], "new"),
  "panel.assume.supply": v(
    "Subscription MRR: paid sellers × price, kept at (1 − paid seller churn) each month, plus the month's new paid sellers (seller sign-ups × conversion). A new price applies to every paid seller from next month. The cost of a paid seller: cost per active seller × first sale ÷ conversion; the same spend with the what-ifs. LTV: the subscriptions' margin a month over a paid seller's counted lifetime (1 ÷ churn, capped at 36 months).",
    "MRR d'abonnement : vendeurs payants × prix, gardé à (1 − churn des vendeurs payants) chaque mois, plus les nouveaux vendeurs payants du mois (vendeurs inscrits × conversion). Un nouveau prix s'applique à chaque vendeur payant dès le mois prochain. Le coût d'un vendeur payant : coût par vendeur actif × première vente ÷ conversion ; même dépense avec les « Et si ». LTV : la marge des abonnements par mois sur la durée de vie comptée d'un vendeur payant (1 ÷ churn, plafonnée à 36 mois).",
    "Subscription MRR: paid providers × price, kept at (1 − paid provider churn) each month, plus the month's new paid providers (provider sign-ups × conversion). A new price applies to every paid provider from next month. The cost of a paid provider: cost per active provider × first job ÷ conversion; the same spend with the what-ifs. LTV: the subscriptions' margin a month over a paid provider's counted lifetime (1 ÷ churn, capped at 36 months).",
    "MRR d'abonnement : prestataires payants × prix, gardé à (1 − churn des prestataires payants) chaque mois, plus les nouveaux prestataires payants du mois (prestataires inscrits × conversion). Un nouveau prix s'applique à chaque prestataire payant dès le mois prochain. Le coût d'un prestataire payant : coût par prestataire actif × première prestation ÷ conversion ; même dépense avec les « Et si ». LTV : la marge des abonnements par mois sur la durée de vie comptée d'un prestataire payant (1 ÷ churn, plafonnée à 36 mois).",
    ["whatif-supply*"], "new"),

  // ── The levers' names (the card, the panel, the slides) ───────────────
  "lever.signupRate": v("Buyer sign-up rate", "Taux d'inscription acheteurs", "Client sign-up rate", "Taux d'inscription clients", ["whatif-demand*"], "new"),
  "lever.referred": s("Referred share", "Part des inscrits recommandés", ["whatif-demand*"], "new"),
  "lever.firstOrder": v("First order", "Première commande", "First booking", "Première réservation", ["whatif-demand*", "slide-demand-whatif"], "new"),
  "lever.fillRate": s("Fill rate", "Taux de service", ["whatif-demand*", "board-demand*", "slide-demand-*"], "new"),
  "lever.churn": v("Monthly buyer churn", "Churn mensuel des acheteurs", "Monthly client churn", "Churn mensuel des clients", ["whatif-demand*"], "new"),
  "lever.frequency": v("Orders a month", "Commandes par mois", "Bookings a month", "Réservations par mois", ["whatif-demand*"], "new"),
  "lever.aov": v("Average order value", "Panier moyen", "Average booking value", "Montant moyen d'une réservation", ["whatif-demand*"], "new",
    { why: "Services: « panier » is a shopping word; a booking has an amount." }),
  "lever.takeRate": s("Take rate", "Taux de commission", ["whatif-demand*", "slide-demand-whatif"], "new"),
  "lever.conversion": s("Subscription conversion", "Conversion à l'abonnement", ["whatif-supply*", "board-supply", "slide-supply-*"], "new"),
  "lever.paidChurn": v("Monthly paid seller churn", "Churn mensuel des vendeurs payants", "Monthly paid provider churn", "Churn mensuel des prestataires payants", ["whatif-supply*"], "new"),
  "lever.price": s("Subscription price", "Prix de l'abonnement", ["whatif-supply*"], "new"),
  "funnel.title.demand": v("Per 100 buyer sign-ups", "Pour 100 inscrits côté acheteurs", "Per 100 client sign-ups", "Pour 100 inscrits côté clients", ["board-demand*", "board-services"], "changed",
    { was: "Per 100 sign-ups / Pour 100 inscrits" }),
  "funnel.title.supply": v("Per 100 seller sign-ups", "Pour 100 vendeurs inscrits", "Per 100 provider sign-ups", "Pour 100 prestataires inscrits", ["board-supply*", "board-services-supply"], "changed",
    { was: "Per 100 sign-ups / Pour 100 inscrits" }),
  "funnel.upstream.demand": s("~{visitors} visitors a month for 100 sign-ups · GA4 · {month}", "~{visitors} visiteurs par mois pour 100 inscrits · GA4 · {month}", ["board-demand*", "board-services", "slide-demand-funnel", "slide-services-funnel"], "kept"),
  "funnel.upstream.supply": v(
    "~{visitors} visitors to the sellers' page for 100 seller sign-ups · GA4 · {month}",
    "~{visitors} visiteurs de la page vendeurs pour 100 vendeurs inscrits · GA4 · {month}",
    "~{visitors} visitors to the providers' page for 100 provider sign-ups · GA4 · {month}",
    "~{visitors} visiteurs de la page prestataires pour 100 prestataires inscrits · GA4 · {month}",
    ["board-supply*", "board-services-supply", "slide-supply-*"], "new"),
  "funnel.signups.demand": v("Buyer sign-ups", "Inscrits", "Client sign-ups", "Inscrits", ["board-demand*", "board-services", "slide-demand-funnel", "slide-services-funnel"], "kept"),
  "funnel.signups.supply": v("Seller sign-ups", "Vendeurs inscrits", "Provider sign-ups", "Prestataires inscrits", ["board-supply*", "board-services-supply", "slide-supply-*"], "new"),
  "funnel.firstOrder": v("First order within {n} days", "Première commande sous {n} jours", "First booking within {n} days", "Première réservation sous {n} jours",
    ["board-demand*", "board-services", "slide-demand-funnel", "slide-services-funnel"], "given"),
  "funnel.secondOrder": v("Second order within {n} days", "Deuxième commande sous {n} jours", "Second booking within {n} days", "Deuxième réservation sous {n} jours",
    ["board-demand*", "board-services", "slide-demand-funnel", "slide-services-funnel"], "given"),
  "funnel.firstSale": v("First sale within {n} days", "Première vente sous {n} jours", "First job within {n} days", "Première prestation sous {n} jours",
    ["board-supply*", "board-services-supply", "slide-supply-*"], "given", { why: "Services: see the supply verdict." }),
  "funnel.subscribed": s("Subscribed within {n} days", "Abonnés sous {n} jours", ["board-supply", "board-services-supply", "slide-supply-funnel"], "given"),
  "funnel.underTarget": s("Below target", "Sous la cible", ["board-demand*", "board-supply", "board-services*", "slide-*-funnel"], "kept"),
  "funnel.src.signups": s("{n} sign-ups in {cohort}, brought back to 100", "{n} inscrits en {cohort}, ramenés à 100", ["board-*", "slide-*-funnel"], "kept"),
  "funnel.src.backoffice": s("Back office · {cohort}", "Back-office · {cohort}", ["board-*", "slide-*-funnel"], "new"),
  "funnel.src.analytics": s("Amplitude · {cohort}", "Amplitude · {cohort}", ["board-*", "slide-*-funnel"], "kept"),
  "funnel.liquidity": s("Liquidity · out of 100 {kind}", "Liquidité · sur 100 {kind}", ["board-demand*", "board-services", "slide-demand-funnel", "slide-services-funnel"], "new",
    { why: "The fill rate is counted on another base than the sign-ups: its heading says which, and its kind (searches or requests)." }),
  "funnel.fill": s("Fill rate", "Taux de service", ["board-demand*", "board-services", "slide-demand-funnel", "slide-services-funnel"], "new"),
  "funnel.fillLine": v(
    "Fill rate: {fill} of {kind} end in an order",
    "Taux de service : {fill} des {kind} aboutissent à une commande",
    "Fill rate: {fill} of {kind} end in a booking",
    "Taux de service : {fill} des {kind} aboutissent à une réservation",
    ["board-demand*", "board-services", "slide-demand-funnel", "slide-services-funnel"], "given"),
  "funnel.kind.searches": s("searches", "recherches", ["board-demand*", "slide-demand-funnel"], "new"),
  "funnel.kind.requests": s("requests sent", "demandes envoyées", ["board-services", "slide-services-funnel"], "new",
    { why: "« demandes » alone sits under « Demande » (the side): « 100 demandes » next to « Côté affiché : Demande » reads as the side. « Demandes envoyées » names a request." }),
  "funnel.rates": s("Every month", "Chaque mois", ["board-supply*", "board-services-supply", "slide-supply-funnel"], "new"),
  "funnel.sellerChurn": v("Active sellers who leave", "Vendeurs actifs qui partent", "Active providers who leave", "Prestataires actifs qui partent",
    ["board-supply*", "board-services-supply", "slide-supply-funnel"], "new"),
  "funnel.paidChurn": v("Paid sellers who cancel", "Vendeurs payants qui résilient", "Paid providers who cancel", "Prestataires payants qui résilient",
    ["board-supply", "board-services-supply", "slide-supply-funnel"], "new"),
  "funnel.rateTargetOnly": s("target {target}", "cible {target}", ["board-supply", "board-services-supply", "slide-supply-funnel"], "new"),
  "funnel.liquidityAside": v(
    "Their work shows in the fill rate, on the demand side: {fill} of {kind} end in an order.",
    "Leur travail se lit dans le taux de service, côté demande : {fill} des {kind} aboutissent à une commande.",
    "Their work shows in the fill rate, on the demand side: {fill} of {kind} end in a booking.",
    "Leur travail se lit dans le taux de service, côté demande : {fill} des {kind} aboutissent à une réservation.",
    ["board-supply*", "board-services-supply"], "new"),
  "funnel.note.demand": v(
    "Your {n} buyer sign-ups of {cohort} are brought back to 100 to read as percentages: each column is counted on those same 100. The fill rate is counted on 100 {kind}: another base, not the same people.",
    "Tes {n} inscrits côté acheteurs de {cohort} sont ramenés à 100 pour se lire en pourcentages : chaque colonne est comptée sur ces mêmes 100. Le taux de service se compte sur 100 {kind} : une autre base, pas les mêmes personnes.",
    "Your {n} client sign-ups of {cohort} are brought back to 100 to read as percentages: each column is counted on those same 100. The fill rate is counted on 100 {kind}: another base, not the same people.",
    "Tes {n} inscrits côté clients de {cohort} sont ramenés à 100 pour se lire en pourcentages : chaque colonne est comptée sur ces mêmes 100. Le taux de service se compte sur 100 {kind} : une autre base, pas les mêmes personnes.",
    ["board-demand*", "board-services"], "changed", { was: "Your 800 sign-ups in July 2026 are brought back to 100 to read as percentages: each column is counted on those same 100. …" }),
  "funnel.note.supply": v(
    "Your {n} seller sign-ups of {cohort} are brought back to 100: each column is counted on those same 100. The churns are monthly rates, not columns.",
    "Tes {n} vendeurs inscrits de {cohort} sont ramenés à 100 : chaque colonne est comptée sur ces mêmes 100. Les churns sont des taux mensuels, pas des colonnes.",
    "Your {n} provider sign-ups of {cohort} are brought back to 100: each column is counted on those same 100. The churns are monthly rates, not columns.",
    "Tes {n} prestataires inscrits de {cohort} sont ramenés à 100 : chaque colonne est comptée sur ces mêmes 100. Les churns sont des taux mensuels, pas des colonnes.",
    ["board-supply*", "board-services-supply"], "new"),
  "legend.referred": s("came through a referral ({n})", "venus par recommandation ({n})", ["board-demand*", "board-services", "slide-demand-funnel"], "kept"),
  "legend.measured": s("measured", "mesuré", ["board-*", "slide-*-funnel"], "kept"),
  "list.title": s("Your numbers", "Tes chiffres", ["board-*"], "kept"),
  "list.lead": s(
    "Both sides, one list by stage. The stage flagged is the one the side shown names.",
    "Les deux côtés, une liste par étape. L'étape signalée est celle que nomme le côté affiché.",
    ["board-*"], "new", { why: "The list is shared; its one red follows the selector (README, question 9)." }),
  "list.holds": s("Holds you back", "Te freine", ["board-*"], "kept"),
  "list.found": s("{found} of {n} found", "{found} sur {n} trouvés", ["board-*"], "kept"),
  "list.side.buyers": v("Buyers", "Acheteurs", "Clients", "Clients", ["board-*"], "given"),
  "list.side.sellers": v("Sellers", "Vendeurs", "Providers", "Prestataires", ["board-*"], "given"),
  "list.side.liquidity": s("Liquidity", "Liquidité", ["board-*"], "given"),
  "status.found": s("found", "trouvé", ["board-*"], "kept"),
  "status.est": s("estimated", "estimé", ["board-*"], "kept"),
  "status.asked": s("asked", "demandé", ["board-*"], "kept"),
  "status.cant": s("can't be found", "introuvable", ["board-*"], "kept"),
  "status.todo": s("to do", "à faire", ["board-*"], "kept"),
  "progress.noneToGo": s("Nothing left to type", "Plus rien à taper", ["board-*"], "kept"),
  "progress.counts": s("{found} found · {est} estimated · {asked} asked", "{found} trouvés · {est} estimé · {asked} demandé", ["board-*"], "kept"),
  "progress.legendLabel": s("What the marks mean", "Ce que disent les marques", ["board-*"], "kept"),
  "tour.title": s("The Tour and your numbers", "Le Tour et tes chiffres", ["board-*"], "kept"),

  // The numbers' names (the list; NUMBERS in fixture.js).
  "num.mk:buyer-sign-up-rate": v("Buyer sign-up rate", "Taux d'inscription acheteurs", "Client sign-up rate", "Taux d'inscription clients", ["board-*"]),
  "num.mk:buyer-cac": v("Buyer CAC", "CAC acheteur", "Client CAC", "CAC client", ["board-*"]),
  "num.mk:cost-per-active-seller": v("Cost per active seller", "Coût par vendeur actif", "Cost per active provider", "Coût par prestataire actif", ["board-*"]),
  "num.mk:seller-sign-up-rate": v("Seller sign-up rate", "Taux d'inscription vendeurs", "Provider sign-up rate", "Taux d'inscription prestataires", ["board-*"]),
  "num.mk:first-order": v("First order (30 days)", "Première commande (30 jours)", "First booking (30 days)", "Première réservation (30 jours)", ["board-*"]),
  "num.mk:first-sale": v("First sale (60 days)", "Première vente (60 jours)", "First job (60 days)", "Première prestation (60 jours)", ["board-*"]),
  "num.mk:fill-rate": v("Fill rate (searches)", "Taux de service (recherches)", "Fill rate (requests sent)", "Taux de service (demandes envoyées)", ["board-*"]),
  "num.mk:second-order": v("Second order (90 days)", "Deuxième commande (90 jours)", "Second booking (90 days)", "Deuxième réservation (90 jours)", ["board-*"]),
  "num.mk:buyer-churn": v("Monthly buyer churn", "Churn mensuel des acheteurs", "Monthly client churn", "Churn mensuel des clients", ["board-*"]),
  "num.mk:seller-churn": v("Monthly seller churn", "Churn mensuel des vendeurs", "Monthly provider churn", "Churn mensuel des prestataires", ["board-*"]),
  "num.mk:paid-seller-churn": v("Monthly paid seller churn", "Churn mensuel des vendeurs payants", "Monthly paid provider churn", "Churn mensuel des prestataires payants", ["board-*"]),
  "num.mk:referred-share": s("Referred share", "Part des inscrits recommandés", ["board-*"]),
  "num.mk:take-rate": s("Take rate", "Taux de commission", ["board-*"]),
  "num.mk:net-revenue-margin": s("Margin on net revenue", "Marge sur le revenu net", ["board-*"]),
  "num.mk:aov": v("Average order value", "Panier moyen", "Average booking value", "Montant moyen d'une réservation", ["board-*"]),
  "num.mk:order-frequency": v("Orders a month (per active buyer)", "Commandes par mois (par acheteur actif)", "Bookings a month (per active client)", "Réservations par mois (par client actif)", ["board-*"]),
  "num.mk:subscription-conversion": s("Subscription conversion", "Conversion à l'abonnement", ["board-*"]),
  "num.mk:revenue-per-paid-seller": v("Revenue per paid seller", "Revenu par vendeur payant", "Revenue per paid provider", "Revenu par prestataire payant", ["board-*"]),
  "num.mk:subscription-margin": s("Margin on seller subscriptions", "Marge sur les abonnements des vendeurs", ["board-*"], "new",
    { enS: "Margin on provider subscriptions", frS: "Marge sur les abonnements des prestataires" }),

  // ── The glossary's "?" (C72), the engine's definitions ────────────────
  "term.gmv.title": v("GMV (gross merchandise value)", "Volume d'affaires (GMV)", "GMV (gross booking value)", "Volume d'affaires (GMV)", ["board-demand*", "board-services"]),
  "term.gmv.body": v(
    "The total value of the orders placed on the marketplace in the month, before your commission. It is not your revenue: your revenue is the share you keep, the net revenue (GMV × take rate).",
    "La valeur totale des commandes passées sur la place de marché dans le mois, avant ta commission. Ce n'est pas ton revenu : ton revenu, c'est la part que tu gardes, le revenu net (volume d'affaires × taux de commission).",
    "The total value of the bookings made on the marketplace in the month, before your commission. It is not your revenue: your revenue is the share you keep, the net revenue (GMV × take rate).",
    "La valeur totale des réservations faites sur la place de marché dans le mois, avant ta commission. Ce n'est pas ton revenu : ton revenu, c'est la part que tu gardes, le revenu net (volume d'affaires × taux de commission).",
    ["board-demand*", "board-services", "term-gmv"]),
  "term.takeRate.title": s("Take rate", "Taux de commission", ["board-*"]),
  "term.takeRate.body": v(
    "The share of each order the marketplace keeps. GMV × take rate = net revenue: on the demand side, it plays the part MRR plays in a SaaS.",
    "La part de chaque commande que la place de marché garde. Volume d'affaires × taux de commission = revenu net : côté demande, il joue le rôle du MRR d'un SaaS.",
    "The share of each booking the marketplace keeps. GMV × take rate = net revenue: on the demand side, it plays the part MRR plays in a SaaS.",
    "La part de chaque réservation que la place de marché garde. Volume d'affaires × taux de commission = revenu net : côté demande, il joue le rôle du MRR d'un SaaS.",
    ["board-*", "term-take"]),
  "term.liquidity.title": s("Liquidity", "Liquidité", ["board-demand*", "board-services"]),
  "term.liquidity.body": v(
    "How well your marketplace brings the two sides together. The engine reads it in one figure, the fill rate: the share of searches (or requests) that end in an order. It is counted on the demand side and priced on new buyers only, so its worth is a minimum.",
    "La capacité de ta place de marché à faire se rencontrer les deux côtés. Le moteur la lit en un chiffre, le taux de service : la part des recherches (ou des demandes) qui aboutissent à une commande. Elle se compte côté demande et ne se chiffre que sur les nouveaux acheteurs : sa valeur est un minimum.",
    "How well your marketplace brings the two sides together. The engine reads it in one figure, the fill rate: the share of searches (or requests) that end in a booking. It is counted on the demand side and priced on new clients only, so its worth is a minimum.",
    "La capacité de ta place de marché à faire se rencontrer les deux côtés. Le moteur la lit en un chiffre, le taux de service : la part des recherches (ou des demandes) qui aboutissent à une réservation. Elle se compte côté demande et ne se chiffre que sur les nouveaux clients : sa valeur est un minimum.",
    ["board-demand*", "board-services", "term-liquidity"]),
  "term.netRevenue.title": s("Net revenue", "Revenu net", ["board-demand*", "board-services", "term-net"], "new", { why: "Proposed, beyond C72's three: the word that replaces MRR on demand. Its \"?\" sits in demand's money, not in the total band: the board's first screen keeps today's controls." }),
  "term.netRevenue.body": v(
    "What the marketplace keeps from the orders: GMV × take rate, or active buyers × what one active buyer brings a month. The engine projects it as it projects an MRR.",
    "Ce que la place de marché garde des commandes : volume d'affaires × taux de commission, ou acheteurs actifs × ce que rapporte un acheteur actif par mois. Le moteur le projette comme un MRR.",
    "What the marketplace keeps from the bookings: GMV × take rate, or active clients × what one active client brings a month. The engine projects it as it projects an MRR.",
    "Ce que la place de marché garde des réservations : volume d'affaires × taux de commission, ou clients actifs × ce que rapporte un client actif par mois. Le moteur le projette comme un MRR.",
    ["board-*", "term-net"], "new"),
  "term.cashTied.title": s("Cash tied up", "Trésorerie immobilisée", ["board-*"], "kept"),
  "term.cashTied.body": v(
    "What your acquisition keeps out of the bank at any time. Each month you spend to win new buyers (or paid sellers); each of them pays that back over the payback. At a steady pace, half a payback's worth of spend is out. A floor: churn slows the return.",
    "Ce que ton acquisition garde hors de la banque à tout moment. Chaque mois, tu dépenses pour gagner des acheteurs (ou des vendeurs payants) ; chacun te le rembourse sur la durée du payback. À rythme constant, la moitié de cette dépense est dehors. Un plancher : le churn ralentit le retour.",
    "What your acquisition keeps out of the bank at any time. Each month you spend to win new clients (or paid providers); each of them pays that back over the payback. At a steady pace, half a payback's worth of spend is out. A floor: churn slows the return.",
    "Ce que ton acquisition garde hors de la banque à tout moment. Chaque mois, tu dépenses pour gagner des clients (ou des prestataires payants) ; chacun te le rembourse sur la durée du payback. À rythme constant, la moitié de cette dépense est dehors. Un plancher : le churn ralentit le retour.",
    ["board-*"], "changed", { was: "…to win new customers; … A floor: churn and contraction slow the return.", why: "A marketplace has buyers and paid sellers, and no contraction." }),
  "term.after.title": s("Months after payback", "Mois après remboursement", ["board-*"], "kept"),
  "term.after.body": v(
    "How long a buyer (or a paid seller) keeps bringing margin once their cost is paid back: their lifetime minus the payback. Below zero, they leave before paying back: that is the loss, said in months.",
    "Combien de temps un acheteur (ou un vendeur payant) continue de rapporter une fois son coût remboursé : sa durée de vie moins le payback. Sous zéro, il part avant d'avoir remboursé : c'est la perte, dite en mois.",
    "How long a client (or a paid provider) keeps bringing margin once their cost is paid back: their lifetime minus the payback. Below zero, they leave before paying back: that is the loss, said in months.",
    "Combien de temps un client (ou un prestataire payant) continue de rapporter une fois son coût remboursé : sa durée de vie moins le payback. Sous zéro, il part avant d'avoir remboursé : c'est la perte, dite en mois.",
    ["board-*"], "changed", { was: "How long a customer keeps paying once its acquisition cost is paid back: …" }),
  "term.close": s("Close", "Fermer", ["term-*"], "kept"),
  "term.label": s("Definition: {term}", "Définition : {term}", ["term-*"], "kept"),

  // ── The slides ────────────────────────────────────────────────────────
  "slide.header": s("Growth engine · {month} · internal data", "Moteur de growth · {month} · données internes", ["slide-*", "deck-order"], "kept"),
  "slide.badge": s("Data: measured {m} · approximate {a} · not found {n}", "Données : mesurées {m} · approximatives {a} · introuvables {n}", ["slide-*"], "kept"),
  "slide.sources.demand": v(
    "Buyer sign-ups in {cohort} · flows: {month} · sources: GA4, Amplitude, back office",
    "Inscrits acheteurs en {cohort} · flux : {month} · sources : GA4, Amplitude, back-office",
    "Client sign-ups in {cohort} · flows: {month} · sources: GA4, Amplitude, back office",
    "Inscrits clients en {cohort} · flux : {month} · sources : GA4, Amplitude, back-office",
    ["slide-demand-*", "slide-services-funnel"], "changed", { was: "Sign-ups in July 2026 · flows: August 2026 · sources: …" }),
  "slide.sources.supply": v(
    "Seller sign-ups in {cohort} · flows: {month} · sources: GA4, back office, Stripe",
    "Vendeurs inscrits en {cohort} · flux : {month} · sources : GA4, back-office, Stripe",
    "Provider sign-ups in {cohort} · flows: {month} · sources: GA4, back office, Stripe",
    "Prestataires inscrits en {cohort} · flux : {month} · sources : GA4, back-office, Stripe",
    ["slide-supply-*"], "changed", { was: "Sign-ups in July 2026 · …" }),
  "slide.sources.total": s(
    "Net revenue: back office · subscriptions: Stripe · {month} · in 12 months: at today's pace, each side's own loop",
    "Revenu net : back-office · abonnements : Stripe · {month} · dans 12 mois : au rythme actuel, la boucle de chaque côté",
    ["slide-total"], "new"),
  "slide.leak.calc": s("The calculation", "Le calcul", ["slide-*-leak"], "kept"),
  "slide.leak.today": s("Today", "Aujourd'hui", ["slide-*-leak"], "kept"),
  "slide.leak.if": s("If", "Si", ["slide-*-leak"], "kept"),
  "slide.leak.then": s("Then", "Alors", ["slide-*-leak"], "kept"),
  "slide.leak.each": s("× each", "× chacun", ["slide-*-leak"], "new"),
  "slide.leak.beside": s("Beside it", "À côté", ["slide-*-leak"], "kept"),
  "slide.leak.todayDemand": v(
    "fill rate {fill}: {signups} sign-ups × {first} first order → {buyers} new buyers a month",
    "taux de service {fill} : {signups} inscrits × {first} de première commande → {buyers} nouveaux acheteurs par mois",
    "fill rate {fill}: {signups} sign-ups × {first} first booking → {buyers} new clients a month",
    "taux de service {fill} : {signups} inscrits × {first} de première réservation → {buyers} nouveaux clients par mois",
    ["slide-demand-leak"]),
  "slide.leak.ifDemand": s("the fill rate reached {target} (the team's target)", "le taux de service atteignait {target} (cible de l'équipe)", ["slide-demand-leak"]),
  "slide.leak.thenDemand": v("{buyers} × {target} ÷ {fill} = {after} new buyers a month", "{buyers} × {target} ÷ {fill} = {after} nouveaux acheteurs par mois",
    "{buyers} × {target} ÷ {fill} = {after} new clients a month", "{buyers} × {target} ÷ {fill} = {after} nouveaux clients par mois", ["slide-demand-leak"]),
  "slide.leak.eachDemand": v("{per} of net revenue a month per active buyer", "{per} de revenu net par mois et par acheteur actif",
    "{per} of net revenue a month per active client", "{per} de revenu net par mois et par client actif", ["slide-demand-leak"]),
  "slide.leak.resultDemand": v(
    "So {worth} of new net revenue every month — a minimum: the fill rate is priced on new buyers only.",
    "Soit {worth} de revenu net nouveau chaque mois — un minimum : le taux de service n'est chiffré que sur les nouveaux acheteurs.",
    "So {worth} of new net revenue every month — a minimum: the fill rate is priced on new clients only.",
    "Soit {worth} de revenu net nouveau chaque mois — un minimum : le taux de service n'est chiffré que sur les nouveaux clients.",
    ["slide-demand-leak"]),
  "slide.leak.todaySupply": v("conversion {conv}: {signups} seller sign-ups a month → {paid} new paid sellers", "conversion {conv} : {signups} vendeurs inscrits par mois → {paid} nouveaux vendeurs payants",
    "conversion {conv}: {signups} provider sign-ups a month → {paid} new paid providers", "conversion {conv} : {signups} prestataires inscrits par mois → {paid} nouveaux prestataires payants", ["slide-supply-leak"]),
  "slide.leak.ifSupply": s("conversion reached {target} (the team's target)", "la conversion atteignait {target} (cible de l'équipe)", ["slide-supply-leak"]),
  "slide.leak.thenSupply": v("{signups} × {target} = {after} new paid sellers a month", "{signups} × {target} = {after} nouveaux vendeurs payants par mois",
    "{signups} × {target} = {after} new paid providers a month", "{signups} × {target} = {after} nouveaux prestataires payants par mois", ["slide-supply-leak"]),
  "slide.leak.eachSupply": s("{price} subscription a month", "{price} d'abonnement par mois", ["slide-supply-leak"]),
  "slide.leak.resultSupply": s("So {worth} of new subscription MRR every month.", "Soit {worth} de MRR d'abonnement nouveau chaque mois.", ["slide-supply-leak"]),
  "slide.leak.titleDemand": s(
    "Bringing the fill rate to {target} (the team's target) would be worth **{worth} of new net revenue** every month.",
    "Ramener le taux de service à {target} (cible de l'équipe) vaudrait **{worth} de revenu net nouveau** chaque mois.",
    ["slide-demand-leak"], "given"),
  "slide.leak.titleSupply": s(
    "Bringing subscription conversion to {target} (the team's target) would be worth **{worth} of new subscription MRR** every month.",
    "Ramener la conversion à l'abonnement à {target} (cible de l'équipe) vaudrait **{worth} de MRR d'abonnement nouveau** chaque mois.",
    ["slide-supply-leak"]),
  "slide.leak.besideFirst": v("First order", "Première commande", "First booking", "Première réservation", ["slide-demand-leak"]),
  "slide.leak.besideWorth": s("{value} for {target} · {worth} a month", "{value} pour {target} · {worth} par mois", ["slide-*-leak"]),
  "slide.leak.noTarget": s("no team target", "sans cible d'équipe", ["slide-*-leak"], "kept"),
  "slide.leak.besideKept": s("{value} for {target} · {worth} of subscription MRR kept a month", "{value} pour {target} · {worth} de MRR d'abonnement préservé par mois", ["slide-supply-leak"]),
  "slide.leak.besideNamed": s("{value} for {target} · named, without an amount", "{value} pour {target} · nommée, sans montant", ["slide-supply-leak"]),
  "slide.whatif.titleDemand": s(
    "With our three what-ifs, net revenue in 12 months would gain **{gain}**.",
    "Avec nos trois « Et si », le revenu net dans 12 mois gagnerait **{gain}**.",
    ["slide-demand-whatif"], "changed", { was: "With the 3 what-ifs together, MRR in 12 months would gain {gain}." }),
  "slide.whatif.titleSupply": s(
    "If subscription conversion reached {to} ({from} today), subscription MRR in 12 months would gain **{gain}**.",
    "Si la conversion à l'abonnement passait à {to} (aujourd'hui {from}), le MRR d'abonnement dans 12 mois gagnerait **{gain}**.",
    ["slide-supply-whatif"], "changed", { was: "If logo churn fell to {to} ({from} today), MRR in 12 months would gain {gain}." }),
  "slide.whatif.with": s("With our what-ifs", "Avec nos « Et si »", ["slide-*-whatif"], "kept"),
  "slide.whatif.figures": s("The figures", "Les chiffres", ["slide-*-whatif"], "changed", { was: "Growth figures / Les chiffres de croissance" }),
  "slide.whatif.assumeDemand": s(
    "Over 12 months at this month's pace: today's net revenue kept at (1 − buyer churn) each month, plus the month's new buyers. A money lever applies to every buyer from next month. No seasonality, no saturation.",
    "Sur 12 mois, au rythme de ce mois : le revenu net d'aujourd'hui gardé à (1 − churn acheteurs) chaque mois, plus les nouveaux acheteurs du mois. Un levier d'argent s'applique à chaque acheteur dès le mois prochain. Ni saisonnalité, ni saturation.",
    ["slide-demand-whatif"], "changed", { was: "Logo churn stands in for revenue churn, … No seasonality, no saturation.",
      enS: "Over 12 months at this month's pace: today's net revenue kept at (1 − client churn) each month, plus the month's new clients. A money lever applies to every client from next month. No seasonality, no saturation.",
      frS: "Sur 12 mois, au rythme de ce mois : le revenu net d'aujourd'hui gardé à (1 − churn clients) chaque mois, plus les nouveaux clients du mois. Un levier d'argent s'applique à chaque client dès le mois prochain. Ni saisonnalité, ni saturation." }),
  "slide.whatif.assumeSupply": v(
    "Over 12 months at this month's pace: today's subscription MRR kept at (1 − paid seller churn) each month, plus the month's new paid sellers. No seasonality, no saturation.",
    "Sur 12 mois, au rythme de ce mois : le MRR d'abonnement d'aujourd'hui gardé à (1 − churn des vendeurs payants) chaque mois, plus les nouveaux vendeurs payants du mois. Ni saisonnalité, ni saturation.",
    "Over 12 months at this month's pace: today's subscription MRR kept at (1 − paid provider churn) each month, plus the month's new paid providers. No seasonality, no saturation.",
    "Sur 12 mois, au rythme de ce mois : le MRR d'abonnement d'aujourd'hui gardé à (1 − churn des prestataires payants) chaque mois, plus les nouveaux prestataires payants du mois. Ni saisonnalité, ni saturation.",
    ["slide-supply-whatif"], "changed", { was: "Logo churn stands in for revenue churn, …" }),
  "slide.unit.titleDemand": v(
    "A buyer pays back their acquisition cost in **{payback}** and brings back {ratio} times what they cost.",
    "Un acheteur rembourse son coût d'acquisition en **{payback}** et rapporte {ratio} fois ce qu'il coûte.",
    "A client pays back their acquisition cost in **{payback}** and brings back {ratio} times what they cost.",
    "Un client rembourse son coût d'acquisition en **{payback}** et rapporte {ratio} fois ce qu'il coûte.",
    ["slide-demand-unit"], "changed", { was: "A customer pays back its acquisition cost in {payback} and brings back {ratio} times what it costs." }),
  "slide.unit.titleSupply": v(
    "A paid seller pays back their cost in **{payback}** and brings back {ratio} times what they cost.",
    "Un vendeur payant rembourse son coût en **{payback}** et rapporte {ratio} fois ce qu'il coûte.",
    "A paid provider pays back their cost in **{payback}** and brings back {ratio} times what they cost.",
    "Un prestataire payant rembourse son coût en **{payback}** et rapporte {ratio} fois ce qu'il coûte.",
    ["slide-supply-unit"], "changed", { was: "A customer pays back its acquisition cost in {payback} and brings back {ratio} times what it costs." }),
  "slide.chart.cost.demand": v("what a new buyer costs", "ce que coûte un nouvel acheteur", "what a new client costs", "ce que coûte un nouveau client", ["slide-demand-unit"], "changed", { was: "what a new customer costs" }),
  "slide.chart.cost.supply": v("what a new paid seller costs", "ce que coûte un nouveau vendeur payant", "what a new paid provider costs", "ce que coûte un nouveau prestataire payant", ["slide-supply-unit"], "changed", { was: "what a new customer costs" }),
  "slide.chart.leaves": s("leaves at ~{life} months", "part vers {life} mois", ["slide-*-unit"], "kept"),
  "slide.chart.paysBack": s("paid back: {payback} months", "remboursé : {payback} mois", ["slide-*-unit"], "kept"),
  "slide.chart.after": s("~{after} months of margin after", "~{after} mois de marge après", ["slide-*-unit"], "kept"),
  "slide.chart.months": s("0|12|24|36 months", "0|12|24|36 mois", ["slide-*-unit"], "kept"),
  "slide.chart.summary": s(
    "One {unit}, month by month: brings back {mm} of margin a month, pays back their {cost} at {payback} months and stays {life}.",
    "Un {unit}, mois par mois : rapporte {mm} de marge par mois, rembourse ses {cost} à {payback} mois et reste {life}.",
    ["slide-*-unit"], "changed", { was: "One customer, month by month: …" }),
  "slide.tile.floor": s("a floor", "un plancher", ["slide-*-unit"], "changed", { was: "a floor · monthly billing" }),
  "slide.tile.derived": s("computed: {cpa} × {fs} ÷ {conv}", "calculé : {cpa} × {fs} ÷ {conv}", ["slide-supply-unit"], "new"),
  "slide.tile.marginRange": s("margin estimated at {range}", "marge estimée à {range}", ["slide-demand-unit"], "new"),
  "slide.unit.assume.demand": s(
    "Margin: the commissions' own ({margin}), never the subscriptions'. Cash tied up: a month's acquisition spend × the payback ÷ 2 — a floor.",
    "Marge : celle des commissions ({margin}), jamais celle des abonnements. Trésorerie immobilisée : la dépense d'acquisition du mois × le payback ÷ 2 — un plancher.",
    ["slide-demand-unit"], "changed", { was: "Cash tied up: a month's acquisition spend × the payback ÷ 2 — a floor, monthly billing." }),
  "slide.unit.assume.supply": s(
    "Margin: the subscriptions' own ({margin}), never the commissions'. Cash tied up: a month's acquisition spend × the payback ÷ 2 — a floor.",
    "Marge : celle des abonnements ({margin}), jamais celle des commissions. Trésorerie immobilisée : la dépense d'acquisition du mois × le payback ÷ 2 — un plancher.",
    ["slide-supply-unit"], "changed", { was: "Cash tied up: a month's acquisition spend × the payback ÷ 2 — a floor, monthly billing." }),
  "slide.total.col.month": s("This month", "Ce mois-ci", ["slide-total"]),
  "slide.total.col.fresh": s("New a month", "Nouveau chaque mois", ["slide-total"]),
  "slide.total.col.in12": s("In 12 months, today's pace", "Dans 12 mois, rythme actuel", ["slide-total"]),
  "slide.total.col.in12Moved": s("In 12 months, with our what-ifs", "Dans 12 mois, avec nos « Et si »", ["slide-total"]),
  "slide.total.side.demand": v("the buyers · slides 2–5", "les acheteurs · slides 2 à 5", "the clients · slides 2–5", "les clients · slides 2 à 5", ["slide-total"]),
  "slide.total.side.supply": v("the sellers · slides 6–9", "les vendeurs · slides 6 à 9", "the providers · slides 6–9", "les prestataires · slides 6 à 9", ["slide-total"]),
  "slide.total.note": s(
    "A sum, never a comparison: each stream is read on its own side's slides, against its own targets.",
    "Une somme, jamais une comparaison : chaque flux se lit sur les slides de son côté, contre ses propres cibles.",
    ["slide-total"]),

  // ── The deck's order (board only: the strip) ──────────────────────────
  "deck.title": s("The deck of a marketplace", "Le deck d'une place de marché", ["deck-order"], "board"),
  "deck.lead": s(
    "One side after the other, never facing: the total first (a sum), then the buyers' four slides, then the sellers' four. Each side's slides name their side in their top line.",
    "Un côté après l'autre, jamais face à face : le total d'abord (une somme), puis les quatre slides des acheteurs, puis les quatre des vendeurs. Chaque slide d'un côté le nomme dans sa ligne du haut.",
    ["deck-order"], "board"),
  "deck.group.total": s("Two streams, one total", "Deux flux, un total", ["deck-order"], "board"),
  "deck.group.demand": v("Demand: the buyers", "La demande : les acheteurs", "Demand: the clients", "La demande : les clients", ["deck-order"], "board"),
  "deck.group.supply": v("Supply: the sellers", "L'offre : les vendeurs", "Supply: the providers", "L'offre : les prestataires", ["deck-order"], "board"),
  "deck.funnel": s("The funnel — the side's verdict", "Le funnel — le verdict du côté", ["deck-order"], "board"),
  "deck.leak": s("The stage that holds it back", "L'étape qui freine", ["deck-order"], "board"),
  "deck.whatif": s("What if? — its levers", "Et si ? — ses leviers", ["deck-order"], "board"),
  "deck.unit": s("Unit economics", "Unit economics", ["deck-order"], "board"),
  "deck.total": s("The total — the marketplace's title", "Le total — le titre de la place de marché", ["deck-order"], "board"),
  "deck.nosubs": s(
    "Without the subscriptions: no total slide (one stream is not a sum) — the buyers' four, then the sellers' funnel alone; their leak waits for targets.",
    "Sans les abonnements : pas de slide du total (un seul flux n'est pas une somme) — les quatre des acheteurs, puis le funnel des vendeurs seul ; leur fuite attend des cibles.",
    ["deck-order"], "board"),
  "deck.rest": s("Then the numbers and the sources, as today", "Puis les chiffres et les sources, comme aujourd'hui", ["deck-order"], "board"),
};

/**
 * `translator(lang, vocab)`: a key and its variables → the string, in that
 * language and vocabulary ("products" by default). {k:one|other} picks a
 * plural by the variable's value.
 */
export const translator = (lang, vocab = "products") => (key, vars = {}) => {
  const entry = COPY[key] ?? COPY07[key];
  if (!entry) return `‹${key}›`;
  let text = vocab === "services" ? entry[`${lang}S`] ?? entry[lang] : entry[lang];
  for (const [k, val] of Object.entries(vars)) {
    text = text.replace(new RegExp(`\\{${k}:([^|}]*)\\|([^}]*)\\}`, "g"), (_, one, other) => (Number(val) <= 1 ? one : other));
    text = text.split(`{${k}}`).join(String(val));
  }
  return lang === "fr" ? frTypo(text) : text;
};
