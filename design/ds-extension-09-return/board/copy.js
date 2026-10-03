// Every string extension 09 adds or changes, French and English, with the
// screens it sits on — and the ported strings the screens draw around them
// (status `kept`, as the production build prints them on brief 09's
// screenshots). COPY.md is generated from this file (board/make-copy.mjs),
// so the board and Antoine's review sheet cannot drift.
//
// Status:
//   new      — does not exist today;
//   changed  — replaces today's string, given in `was`;
//   kept     — today's string (A18, as ported), drawn for context only;
//   example  — the output of a function that stays (a verdict, a slide's
//              title), drawn with the screens' data: not new copy.
//
// French: "tu" on screens, « on » / « nous » on slides (presented to a
// meeting). Stage names stay in English. `frTypo` puts the narrow no-break
// space (U+202F) before : ; ? ! and inside « », and groups figures.
//
// Figures arrive in {placeholders} already formatted (board/fmt.js): the
// euro after the figure in French, before it in English; two significant
// digits and "~" for anything projected or estimated.

import { COPY as COPY07, frTypo } from "./r07/copy07.js";

export { frTypo };

const s = (en, fr, on, status = "new", was) => ({ en, fr, on, status, was });

export const COPY = {
  // ── The board around the money (A18, as ported) ───────────────────────
  "bar.line": s("Unnamed engine · Self-serve · {month}", "Moteur sans nom · Libre-service · {month}", ["board-*", "whatif-*"], "kept"),
  "bar.lineBoth": s("Unnamed engine · Self-serve and sales-assisted · {month}", "Moteur sans nom · Libre-service et assisté · {month}", ["hybrid-*"], "kept"),
  "bar.neverSaved": s("Never saved", "Jamais sauvegardé", ["board-*", "hybrid-*"], "kept"),
  "bar.menu": s("Engine, month and file", "Moteur, mois et fichier", ["board-*", "hybrid-*"], "kept"),
  "next.since": s("Last visit · today", "Dernière visite · aujourd'hui", ["board-*"], "kept"),
  "next.waiting": s("Nothing left to type: one number you asked for is waiting for an answer.", "Plus rien à taper : un chiffre demandé attend sa réponse.", ["board-*"], "kept"),
  "next.go.slides": s("Prepare your slides →", "Prépare tes slides →", ["board-*"], "kept"),
  "next.verdictIsSlide": s("Your verdict above is the title of your first slide.", "Ton verdict, ci-dessus, est le titre de ta première slide.", ["board-*"], "kept"),
  "next.backup": s(
    "Never saved to a file: Safari may erase it after seven days of use without a visit here.",
    "Jamais sauvegardé dans un fichier : Safari peut l'effacer après sept jours d'utilisation sans passage ici.",
    ["board-*"], "kept"),
  "next.saveNow": s("Save (.json)", "Sauvegarder (.json)", ["board-*"], "kept"),
  "next.hybrid": s("No more quick number: you find it yourself, in about an hour.", "Plus de chiffre rapide : tu le trouves seul, en une heure environ.", ["hybrid-*"], "kept"),
  "next.go.hybrid": s("Next number: time to production →", "Chiffre suivant : délai de mise en production →", ["hybrid-*"], "kept"),
  "diag.eyebrow": s("One stage holds the engine back", "Une étape freine le moteur", ["board-*", "hybrid-ss"], "kept"),
  "diag.number": s("Monthly logo churn", "Churn logo mensuel", ["board-*", "hybrid-ss"], "kept"),
  "diag.value": s("{value}, above your target ({target})", "{value}, au-dessus de ta cible ({target})", ["board-*", "hybrid-ss"], "kept"),
  "diag.hiding": s(
    "With no number for day-30 retention, the stage really holding the engine back may be hiding there.",
    "Sans chiffre pour la rétention à J30, l'étape qui freine vraiment le moteur s'y cache peut-être.",
    ["board-*", "hybrid-ss"], "kept"),
  "diag.top": s(
    "The biggest loss in numbers is always at the top of the funnel; that's not what names the stage holding you back.",
    "La plus grosse perte en nombre est toujours en haut du funnel ; ce n'est pas elle qui désigne l'étape qui freine.",
    ["board-*", "hybrid-ss"], "kept"),
  "peloton.title": s("Per 100 sign-ups", "Pour 100 inscrits", ["board-*", "hybrid-ss"], "kept"),
  "peloton.lead": s("~3,200 visitors a month for 100 sign-ups · GA4 · August 2026", "~3 200 visiteurs par mois pour 100 inscrits · GA4 · août 2026", ["board-*", "hybrid-ss"], "kept"),
  "peloton.c1": s("Sign-ups", "Inscrits", ["board-*"], "kept"),
  "peloton.c2": s("Activated", "Activés", ["board-*"], "kept"),
  "peloton.c3": s("Active at day 30", "Actifs à J30", ["board-*"], "kept"),
  "peloton.c4": s("Paying by day 30", "Payants à J30", ["board-*"], "kept"),
  "peloton.s1": s("800 sign-ups in July 2026, scaled to 100", "800 inscrits en juillet 2026, ramenés à 100", ["board-*"], "kept"),
  "peloton.s2": s("Amplitude · July 2026", "Amplitude · juillet 2026", ["board-*"], "kept"),
  "peloton.s3": s("not measured", "non mesuré", ["board-*"], "kept"),
  "peloton.s4": s("GA4 · July 2026", "GA4 · juillet 2026", ["board-*"], "kept"),
  "list.title": s("Your numbers", "Tes chiffres", ["board-*"], "kept"),
  "list.computed": s("Computed from yours ({n})", "Calculés à partir des tiens ({n})", ["board-*"], "kept"),
  "tour.title": s("The Tour and your numbers", "Le Tour et tes chiffres", ["board-*"], "kept"),

  // ── The money, on the board (MoneyBlock) ──────────────────────────────
  "money.eyebrow": s("The money · {month}", "L'argent · {month}", ["board-*", "cash-*", "hybrid-*"]),
  "money.mrr": s("MRR", "MRR", ["board-*", "cash-*"]),
  "money.arr": s("ARR, the MRR × 12", "ARR, le MRR × 12", ["board-*", "cash-*"]),
  "worth.title": s("What one new customer is worth", "Ce que vaut un nouveau client", ["board-*", "cash-*", "hybrid-*"]),
  "worth.tag.loss": s("Loss", "Perte", ["board-loss", "hybrid-ss"]),
  "worth.tag.maybe": s("Maybe a loss", "Perte possible", ["board-maybe"]),
  "worth.loss": s(
    "Each new customer costs {cac} and brings back {ltv} of margin: you lose {gap} on each one.",
    "Chaque nouveau client coûte {cac} et rapporte {ltv} de marge : tu perds {gap} sur chacun.",
    ["board-loss", "hybrid-ss"]),
  "worth.maybe": s(
    "A new customer costs {cac} and brings back {ltv} of margin: it may not pay back what it costs.",
    "Un nouveau client coûte {cac} et rapporte {ltv} de marge : il ne rembourse peut-être pas ce qu'il coûte.",
    ["board-maybe"]),
  "worth.maybeWhy": s(
    "The range comes from your monthly logo churn, estimated at {range}: pin it down and the engine will tell.",
    "La fourchette vient de ton churn logo mensuel, estimé {range} : précise-le et le moteur tranchera.",
    ["board-maybe"]),
  "worth.healthy": s(
    "Each new customer costs {cac} and brings back {ltv} of margin: {gap} more than it costs.",
    "Chaque nouveau client coûte {cac} et rapporte {ltv} de marge : {gap} de plus que ce qu'il coûte.",
    ["board-healthy", "cash-*", "hybrid-sa"]),
  "worth.none": s(
    "We can't tell yet what a new customer brings back: the gross margin is missing.",
    "On ne peut pas encore dire ce que rapporte un nouveau client : il manque la marge brute.",
    ["board-nomargin"]),
  "worth.noneNote": s(
    "Without it, no LTV, no payback, no cash figure: computed on revenue, they would flatter your engine.",
    "Sans elle, pas de LTV, pas de payback, pas de trésorerie : calculés sur le chiffre d'affaires, ils flatteraient ton moteur.",
    ["board-nomargin"]),
  "worth.costs": s("Costs", "Coûte", ["board-*", "cash-*", "hybrid-*"]),
  "worth.brings": s("Brings back", "Rapporte", ["board-*", "cash-*", "hybrid-*"]),
  "worth.short": s("{gap} short", "il manque {gap}", ["board-loss", "hybrid-ss", "whatif-three", "whatif-expansion"]),
  "worth.more": s("{gap} more", "{gap} de plus", ["board-healthy", "cash-*", "hybrid-sa", "whatif-three"]),
  "worth.overlap": s("the two may cross", "les deux peuvent se croiser", ["board-maybe"]),
  "worth.missing": s("missing: gross margin", "il manque la marge brute", ["board-nomargin", "slide-unit-nomargin"]),
  "worth.monthsLoss": s(
    "A customer stays {life}; paying back its cost would take {payback}: it leaves before.",
    "Un client reste {life} ; rembourser son coût en prendrait {payback} : il part avant.",
    ["board-loss", "hybrid-ss"]),
  "worth.monthsMaybe": s(
    "A customer stays {life}; paying back its cost takes {payback}: it may leave before.",
    "Un client reste {life} ; rembourser son coût en prend {payback} : il peut partir avant.",
    ["board-maybe"]),
  "worth.monthsHealthy": s(
    "It pays back its cost in {payback} and stays {life}: {after} of margin after payback.",
    "Il rembourse son coût en {payback} et reste {life} : {after} de marge après le remboursement.",
    ["board-healthy", "cash-*", "hybrid-sa"]),

  "cash.title": s("Cash", "Trésorerie", ["board-*", "cash-*", "hybrid-*", "whatif-three"]),
  "cash.spend": s("Spent on acquisition this month", "Dépensé en acquisition ce mois-ci", ["board-*", "cash-*", "hybrid-*"]),
  "cash.tied": s("Tied up at this pace", "Immobilisé à ce rythme", ["board-*", "cash-*", "hybrid-*"]),
  "cash.lineLoss": s(
    "And it does not all come back: customers leave before they pay back.",
    "Et elle ne revient pas toute : les clients partent avant d'avoir remboursé.",
    ["board-loss", "hybrid-ss"]),
  "cash.lineMaybe": s(
    "Whether it all comes back depends on your churn: customers may leave before they pay back.",
    "Qu'elle revienne toute dépend de ton churn : les clients peuvent partir avant d'avoir remboursé.",
    ["board-maybe"]),
  "cash.lineHealthy": s(
    "It all comes back, as customers pay back.",
    "Elle revient toute, au fil des remboursements.",
    ["board-healthy", "cash-*", "hybrid-sa"]),
  "cash.lineNone": s(
    "No cash figure without the margin: the payback is what says when the spend comes back.",
    "Pas de trésorerie sans la marge : c'est le payback qui dit quand la dépense revient.",
    ["board-nomargin"]),
  "cash.assumptions": s(
    "A floor: each month's spend comes back evenly over the payback, so half of it is out at any time; churn and contraction slow the return and are not counted. Monthly billing.",
    "Un plancher : la dépense de chaque mois revient régulièrement sur la durée du payback, la moitié est donc dehors à tout moment ; le churn et la rétrogradation ralentissent le retour et ne sont pas comptés. Facturation mensuelle.",
    ["board-*", "cash-*", "hybrid-*"]),
  "cash.assumptionsAnnual": s(
    "A floor: each month's spend comes back evenly over the payback, so half of it is out at any time; non-renewals slow the return and are not counted. Monthly billing assumed: a year paid up front comes back sooner.",
    "Un plancher : la dépense de chaque mois revient régulièrement sur la durée du payback, la moitié est donc dehors à tout moment ; les non-renouvellements ralentissent le retour et ne sont pas comptés. Facturation mensuelle supposée : une année payée d'avance revient plus tôt.",
    ["hybrid-sa"]),
  "cash.warn": s(
    "Paying back a customer takes {payback}, longer than {limit}: you make money, but maybe after your cash runs out.",
    "Rembourser un client prend {payback}, plus que {limit} : tu gagnes de l'argent, mais peut-être après la fin de ta trésorerie.",
    ["cash-runway"]),
  "cash.warnMaybe": s(
    "Paying back a customer takes {payback}: maybe longer than {limit}.",
    "Rembourser un client prend {payback} : peut-être plus que {limit}.",
    ["cash-maybe"]),
  "cash.limit.runway": s("your runway ({n} months)", "ton runway ({n} mois)", ["cash-runway", "cash-maybe"]),
  "cash.limit.target": s("your payback target ({n} months)", "ta cible de payback ({n} mois)", ["cash-runway"]),

  // The three words the money teaches (EngineTerm, one open at a time).
  "term.cashTied.title": s("Cash tied up", "Trésorerie immobilisée", ["board-*", "cash-*"]),
  "term.cashTied.body": s(
    "What your acquisition keeps out of the bank at any time. Each month you spend to win new customers; each of them pays that back over the payback. At a steady pace, half a payback's worth of spend is out. A floor: churn and contraction slow the return.",
    "Ce que ton acquisition garde hors de la banque à tout moment. Chaque mois, tu dépenses pour gagner des clients ; chacun te le rembourse sur la durée du payback. À rythme constant, la moitié de cette dépense est dehors. Un plancher : le churn et la rétrogradation ralentissent le retour.",
    ["board-*", "cash-*"]),
  "term.after.title": s("Months after payback", "Mois après remboursement", ["board-healthy", "cash-*"]),
  "term.after.body": s(
    "How long a customer keeps paying once its acquisition cost is paid back: its lifetime minus the payback. Below zero, it leaves before paying back: that is the loss, said in months.",
    "Combien de temps un client continue de payer une fois son coût d'acquisition remboursé : sa durée de vie moins le payback. Sous zéro, il part avant d'avoir remboursé : c'est la perte, dite en mois.",
    ["board-healthy", "cash-*"]),
  "term.runway.title": s("Runway", "Runway", ["settings-runway"]),
  "term.runway.body": s(
    "How many months your cash lasts at today's spending. Optional: the engine only compares it with the payback, to warn you. It stays on this device.",
    "Le nombre de mois que couvre ta trésorerie au rythme actuel des dépenses. Facultatif : le moteur le compare seulement au payback, pour te prévenir. Il reste sur cet appareil.",
    ["settings-runway"]),

  // ── Settings: the runway, if C49 picks it ─────────────────────────────
  "settings.title": s("Settings", "Réglages", ["settings-runway"], "kept"),
  "settings.cash": s("Cash", "Trésorerie", ["settings-runway"]),
  "settings.runway": s("Runway, in months", "Runway, en mois", ["settings-runway"]),
  "settings.runwayHint": s(
    "Optional. Only used to warn you when paying back a customer takes longer.",
    "Facultatif. Sert seulement à te prévenir quand rembourser un client prend plus longtemps.",
    ["settings-runway"]),
  "settings.months": s("months", "mois", ["settings-runway"]),
  "settings.save": s("Save settings", "Enregistrer les réglages", ["settings-runway"], "kept"),

  // ── What if? — LeverCard ──────────────────────────────────────────────
  "whatif.title": s("What if?", "Et si ?", ["whatif-*", "board-*"], "kept"),
  "whatif.untouched": s(
    "Move the lever of the stage that holds you back, and see what follows.",
    "Bouge le levier de l'étape qui freine, et vois ce qui suit.",
    ["whatif-untouched", "board-*"], "kept"),
  "whatif.moved": s("What if: {lever}, {to} instead of {from}, with your other levers", "Et si : {lever}, {to} au lieu de {from}, avec tes autres leviers", ["whatif-churn", "whatif-three"], "kept"),
  "whatif.movedThree": s("What if: your three levers, together", "Et si : tes trois leviers, ensemble", ["whatif-three"]),
  "whatif.lever": s("{lever} (today {value})", "{lever} (aujourd'hui {value})", ["whatif-*", "board-*"], "kept"),
  "whatif.mrr12": s("MRR in 12 months", "MRR dans 12 mois", ["whatif-*", "board-*", "hybrid-*"], "kept"),
  "whatif.arr12": s("ARR in 12 months", "ARR dans 12 mois", ["whatif-*", "board-*", "hybrid-*"], "changed", "New paying customers a month (moves to the panel)"),
  "whatif.today": s("today {value}", "aujourd'hui {value}", ["whatif-*"], "kept"),
  "whatif.all": s("See all 8 levers and what the calculation assumes →", "Vois les 8 leviers et ce que le calcul suppose →", ["whatif-*", "board-*"], "kept"),
  "whatif.reset": s("Back to today", "Remettre à aujourd'hui", ["whatif-churn", "whatif-three"], "kept"),
  "whatif.worthOut": s(
    "One new customer: no longer a loss. It brings back {ltv} for {cac}: {gap} more.",
    "Un nouveau client : plus de perte. Il rapporte {ltv} pour {cac} : {gap} de plus.",
    ["whatif-churn", "whatif-three"]),
  "whatif.worthStill": s(
    "One new customer: still a loss of {gap}. {lever} changes neither what a customer brings back nor what it costs.",
    "Un nouveau client : toujours une perte de {gap}. {lever} ne change ni ce que rapporte un client ni ce qu'il coûte.",
    ["whatif-expansion"]),
  "whatif.totalBoth": s(
    "Both engines in 12 months: {whatif} of MRR with this what-if (today {today}).",
    "Les deux moteurs dans 12 mois : {whatif} de MRR avec cet « Et si » (aujourd'hui {today}).",
    ["hybrid-ss"]),

  // The curve (MrrCurve).
  "curve.today": s("at today's pace", "au rythme d'aujourd'hui", ["whatif-*", "board-*", "slide-whatif-one", "slide-together", "hybrid-*"]),
  "curve.whatif": s("with your what-ifs", "avec tes « Et si »", ["whatif-churn", "whatif-three", "whatif-expansion"]),
  "curve.whatifSlide": s("with this what-if", "avec cet « Et si »", ["slide-whatif-one"]),
  "curve.togetherSlide": s("with the 3 what-ifs", "avec les 3 « Et si »", ["slide-together"]),
  "curve.start": s("{mrr} today", "{mrr} aujourd'hui", ["whatif-*", "board-*", "slide-whatif-one", "slide-together", "hybrid-*"]),
  "curve.summary": s(
    "The MRR month by month, from {start} today to {today} in 12 months at today's pace.",
    "Le MRR mois par mois, de {start} aujourd'hui à {today} dans 12 mois au rythme actuel.",
    ["whatif-*", "board-*"]),
  "curve.summaryWhatif": s(
    "The MRR month by month, from {start} today: {today} in 12 months at today's pace, {whatif} with your what-ifs.",
    "Le MRR mois par mois, depuis {start} aujourd'hui : {today} dans 12 mois au rythme actuel, {whatif} avec tes « Et si ».",
    ["whatif-*"]),

  // ── What if? — the full panel ─────────────────────────────────────────
  "panel.intro": s(
    "Move one lever or several: the month's funnel and your growth numbers recompute together, and the effects add up.",
    "Bouge un ou plusieurs leviers : le funnel du mois et tes chiffres de croissance se recalculent ensemble, les effets se cumulent.",
    ["whatif-three", "whatif-expansion"], "kept"),
  "panel.untouchedNote": s(
    "No lever moved: the funnel and the figures are today's.",
    "Aucun levier bougé : le funnel et les chiffres sont ceux d'aujourd'hui.",
    ["whatif-panel"], "kept"),
  "fmt.points": s("{n} pt", "{n} points", ["whatif-*", "slide-whatif-one", "slide-together"], "kept"),
  "panel.levers": s("The levers", "Les leviers", ["whatif-three", "whatif-expansion"], "kept"),
  "panel.allBack": s("All back to today", "Tout remettre à aujourd'hui", ["whatif-three", "whatif-expansion"], "kept"),
  "panel.figures": s("Your growth figures", "Tes chiffres de croissance", ["whatif-three", "whatif-expansion"], "kept"),
  "panel.group.growth": s("Growth", "Croissance", ["whatif-three", "whatif-expansion"]),
  "panel.group.customer": s("One new customer", "Un nouveau client", ["whatif-three", "whatif-expansion"]),
  "panel.group.cash": s("Cash", "Trésorerie", ["whatif-three", "whatif-expansion"]),
  "panel.col.figure": s("Figure", "Chiffre", ["whatif-three", "whatif-expansion"]),
  "panel.col.today": s("Today", "Aujourd'hui", ["whatif-three", "whatif-expansion", "slide-whatif-one", "slide-together"], "kept"),
  "panel.col.whatif": s("With your what-ifs", "Avec tes « Et si »", ["whatif-three", "whatif-expansion"], "kept"),
  "panel.col.change": s("Change", "Écart", ["whatif-three", "whatif-expansion", "slide-whatif-one", "slide-together"], "kept"),
  "row.mrr12": s("MRR in 12 months", "MRR dans 12 mois", ["whatif-*", "slide-whatif-one", "slide-together"], "kept"),
  "row.arr12": s("ARR in 12 months", "ARR dans 12 mois", ["whatif-*", "slide-whatif-one", "slide-together"]),
  "row.newMrr": s("New MRR a month", "Nouveau MRR par mois", ["whatif-*", "slide-whatif-one", "slide-together"], "kept"),
  "row.nrr": s("Monthly NRR", "NRR mensuelle", ["whatif-*", "slide-*"], "kept"),
  "row.grr": s("Monthly GRR", "GRR mensuelle", ["whatif-*", "slide-*"], "kept"),
  "row.cac": s("CAC", "CAC", ["whatif-*", "slide-*"], "kept"),
  "row.ltv": s("LTV", "LTV", ["whatif-*", "slide-*"], "kept"),
  "row.ratio": s("LTV:CAC", "LTV:CAC", ["whatif-*", "slide-*"], "kept"),
  "row.gap": s("Per new customer", "Par nouveau client", ["whatif-*"]),
  "row.payback": s("CAC payback", "CAC payback", ["whatif-*", "slide-*"], "kept"),
  "row.after": s("Months after payback", "Mois après remboursement", ["whatif-*", "slide-unit-*"]),
  "row.spend": s("Spent on acquisition a month", "Dépensé en acquisition par mois", ["whatif-*"]),
  "row.cash": s("Cash tied up", "Trésorerie immobilisée", ["whatif-*", "slide-*"]),
  "row.leavesFirst": s("leaves first", "part avant", ["whatif-*", "slide-unit-loss"]),
  "row.stable": s("stable", "stable", ["whatif-*", "slide-whatif-one", "slide-together"], "kept"),
  "sum.title": s("What each lever brings on its own, on MRR in 12 months", "Ce que chaque levier rapporte seul, sur le MRR dans 12 mois", ["whatif-three", "slide-together"], "kept"),
  "sum.lever": s("{lever}: {from} → {to}", "{lever} : {from} → {to}", ["whatif-three", "slide-together"], "kept"),
  "sum.oneByOne": s("Each alone, added up", "Chacun seul, additionnés", ["whatif-three", "slide-together"]),
  "sum.together": s("Together", "Ensemble", ["whatif-three", "slide-together"], "kept"),
  "sum.extra": s(
    "Together they bring {extra} more than each alone, added up: each lever works on what the others add. That's compounding.",
    "Ensemble, ils rapportent {extra} de plus que chacun seul, additionnés : chaque levier agit sur ce que les autres ajoutent. C'est l'effet composé.",
    ["whatif-three", "slide-together"], "changed",
    "Together: +€42,000, i.e. ~€4,400 more than the sum of the levers alone: that's compounding."),
  "panel.assumptions": s("What the calculation assumes", "Ce que le calcul suppose", ["whatif-three", "whatif-expansion"], "kept"),
  "panel.assumeCash": s(
    "Cash tied up: the month's acquisition spend × the payback ÷ 2. Each month's spend comes back evenly over the payback; churn and contraction, which slow it, are not counted (a floor), unless expansion outpaces them. Monthly billing. The same spend with the what-ifs: more payers make each one cheaper.",
    "Trésorerie immobilisée : la dépense d'acquisition du mois × le payback ÷ 2. La dépense de chaque mois revient régulièrement sur le payback ; le churn et la rétrogradation, qui la ralentissent, ne sont pas comptés (un plancher), sauf si l'expansion les dépasse. Facturation mensuelle. Même dépense avec les « Et si » : plus de payants rendent chacun moins cher.",
    ["whatif-three", "whatif-expansion"]),
  "panel.assumeLtv": s(
    "LTV: the monthly margin over a customer's counted lifetime (1 ÷ churn, capped at 36 months), on today's ARPA: expansion is not in it.",
    "LTV : la marge mensuelle sur la durée de vie comptée d'un client (1 ÷ churn, plafonnée à 36 mois), à l'ARPA d'aujourd'hui : l'expansion n'y entre pas.",
    ["whatif-three", "whatif-expansion"]),

  // ── The hybrid: TotalBand ─────────────────────────────────────────────
  "total.eyebrow": s("Two engines, one total", "Deux moteurs, un total", ["hybrid-*"], "kept"),
  "total.title": s("MRR reaches {total}: {ss} in self-serve, {sa} sales-assisted.", "Le MRR atteint {total} : {ss} en libre-service, {sa} en assisté.", ["hybrid-*"], "kept"),
  "total.ss": s("MRR self-serve", "MRR libre-service", ["hybrid-*"], "kept"),
  "total.sa": s("MRR sales-assisted", "MRR assisté", ["hybrid-*"], "kept"),
  "total.total": s("MRR total", "MRR total", ["hybrid-*"], "kept"),
  "total.arr": s("ARR total", "ARR total", ["hybrid-*"]),
  "total.mrr12": s("MRR in 12 months at today's pace", "MRR dans 12 mois au rythme actuel", ["hybrid-*"]),
  "total.cash": s("Cash tied up, total", "Trésorerie immobilisée totale", ["hybrid-*"]),
  "total.link": s(
    "31 opportunities came from self-serve (June to August 2026). A share of the pipeline, not an attribution: we don't know how many of these accounts would have signed without self-serve.",
    "31 opportunités sont venues du libre-service (juin à août 2026). Une part du pipeline, pas une attribution : on ne sait pas combien de ces comptes auraient signé sans le libre-service.",
    ["hybrid-*"], "kept"),
  "hybrid.shown": s("Engine shown", "Moteur affiché", ["hybrid-*"], "kept"),
  "hybrid.ss": s("Self-serve", "Libre-service", ["hybrid-*"], "kept"),
  "hybrid.sa": s("Sales-assisted", "Assisté", ["hybrid-*"], "kept"),
  "sa.lever": s("Renewal rate", "Taux de renouvellement", ["hybrid-sa"], "kept"),
  "sa.untouched": s(
    "Move the lever of the stage that holds you back, and see what follows.",
    "Bouge le levier de l'étape qui freine, et vois ce qui suit.",
    ["hybrid-sa"], "kept"),
  "sa.months": s(
    "A customer stays {life} (the count stops at 36): its renewals come up once a year.",
    "Un client reste {life} (le compte s'arrête à 36) : ses renouvellements reviennent une fois par an.",
    ["hybrid-sa"]),
  "sa.curve": s(
    "Annual contracts come up for renewal evenly over the year: the base moves in a straight line.",
    "Les contrats annuels arrivent à renouvellement régulièrement dans l'année : la base avance en ligne droite.",
    ["hybrid-sa"]),

  // ── The slides ────────────────────────────────────────────────────────
  "slide.header": s("Growth engine · August 2026 · internal data", "Moteur de growth · août 2026 · données internes", ["slide-*"], "kept"),
  "slide.badge": s("Data: measured {m} · approximate {a} · not found {n}", "Données : mesurées {m} · approximatives {a} · introuvables {n}", ["slide-*"], "kept"),
  "slide.sources": s("Sign-ups in July 2026 · flows: August 2026 · sources: GA4, Amplitude, product database and Stripe", "Inscrits en juillet 2026 · flux : août 2026 · sources : GA4, Amplitude, Base produit et Stripe", ["slide-*"], "kept"),
  "slide.unit.titleLoss": s(
    "Each new customer costs us {cac} and brings back {ltv}: we lose {gap} on each one.",
    "Chaque nouveau client nous coûte {cac} et en rapporte {ltv} : on perd {gap} sur chacun.",
    ["slide-unit-loss", "deck-order"], "changed",
    "A customer pays back its acquisition cost in 21 months and brings back 0.79 times what it costs. (21 months and 0.79 in red)"),
  "slide.unit.titleHealthy": s(
    "A customer pays back its acquisition cost in {payback} and brings back {ratio} times what it costs.",
    "Un client rembourse son coût d'acquisition en {payback} et rapporte {ratio} fois ce qu'il coûte.",
    ["slide-unit-healthy"], "example"),
  "slide.unit.titleNone": s(
    "We can't say yet what a customer brings back. The gross margin is missing.",
    "On ne peut pas encore dire ce que rapporte un client. Il manque la marge brute.",
    ["slide-unit-nomargin"], "kept"),
  "slide.unit.titleBoth": s(
    "Self-serve: we lose {gapSs} on each new customer. Sales-assisted: paid back in {paybackSa}.",
    "Libre-service : on perd {gapSs} par nouveau client. Assisté : remboursé en {paybackSa}.",
    ["slide-unit-both"]),
  "slide.chart.cost": s("what a new customer costs", "ce que coûte un nouveau client", ["slide-unit-*"]),
  "slide.chart.leaves": s("leaves at ~{life} months", "part vers {life} mois", ["slide-unit-*"]),
  "slide.chart.wouldPayBack": s("would pay back at {payback} months", "rembourserait à {payback} mois", ["slide-unit-loss", "slide-unit-both"]),
  "slide.chart.paysBack": s("paid back: {payback} months", "remboursé : {payback} mois", ["slide-unit-healthy", "slide-unit-both"]),
  "slide.chart.short": s("{gap} short", "il manque {gap}", ["slide-unit-loss", "slide-unit-both"]),
  "slide.chart.after": s("~{after} months of margin after", "~{after} mois de marge après", ["slide-unit-healthy", "slide-unit-both"]),
  "slide.chart.timeLoss": s("leaves at ~{life} months; would pay back at {payback}", "part vers {life} mois ; rembourserait à {payback} mois", ["slide-unit-both"]),
  "slide.chart.timeHealthy": s("paid back at {payback} months, then ~{after} months of margin", "remboursé à {payback} mois, puis ~{after} mois de marge", ["slide-unit-both"]),
  "slide.chart.reference": s("12 months · a commonly cited reference", "12 mois · repère couramment cité", ["slide-unit-*"], "kept"),
  "slide.chart.months": s("0|12|24|36 months", "0|12|24|36 mois", ["slide-unit-*"], "kept"),
  "slide.chart.summaryLoss": s(
    "One customer, month by month: it brings back {mm} of margin a month and leaves after about {life} months, {gap} short of the {cac} it cost; it would have paid back at {payback} months.",
    "Un client, mois par mois : il rapporte {mm} de marge par mois et part après environ {life} mois, à {gap} des {cac} qu'il a coûté ; il aurait remboursé à {payback} mois.",
    ["slide-unit-loss"]),
  "slide.chart.summaryHealthy": s(
    "One customer, month by month: it brings back {mm} of margin a month, pays back its {cac} at {payback} months and stays {life}.",
    "Un client, mois par mois : il rapporte {mm} de marge par mois, rembourse ses {cac} à {payback} mois et reste {life}.",
    ["slide-unit-healthy"]),
  "slide.chart.summaryNone": s(
    "One customer, month by month: its cost is known ({cac}), what it brings back is not: the gross margin is missing.",
    "Un client, mois par mois : son coût est connu ({cac}), ce qu'il rapporte non : il manque la marge brute.",
    ["slide-unit-nomargin"]),
  "slide.tile.leavesBefore": s("leaves ~{n} months before paying back", "part ~{n} mois avant d'avoir remboursé", ["slide-unit-loss"]),
  "slide.tile.notAllBack": s("does not all come back", "ne revient pas toute", ["slide-unit-loss", "slide-unit-both"]),
  "slide.tile.floor": s("a floor · monthly billing", "un plancher · facturation mensuelle", ["slide-unit-healthy", "slide-unit-both"]),
  "slide.tile.reference": s("an often-cited reference: about 3:1", "repère souvent cité : environ 3:1", ["slide-unit-*"]),
  "slide.tile.missing": s("missing: gross margin", "il manque la marge brute", ["slide-unit-nomargin"], "changed", "can't be computed: the gross margin is missing / incalculable — il manque la marge brute"),
  "slide.retention": s(
    "Monthly GRR {grr} · NRR {nrr} — approximate: logo churn stands in for revenue churn, as if lost customers paid the average ARPA.",
    "GRR mensuelle {grr} · NRR {nrr} — approximatives : le churn logo tient lieu de churn en revenu, comme si les clients partis payaient l'ARPA moyen.",
    ["slide-unit-*"], "changed", "two tiles (GRR, NRR) with the same note under each"),
  "slide.unit.assume": s(
    "Cash tied up: a month's acquisition spend × the payback ÷ 2 — a floor, monthly billing.",
    "Trésorerie immobilisée : la dépense d'acquisition du mois × le payback ÷ 2 — un plancher, facturation mensuelle.",
    ["slide-unit-*"]),
  "slide.whatif.titleOne": s(
    "If logo churn fell to {to} ({from} today), MRR in 12 months would gain {gain}.",
    "Si le churn logo passait à {to} (aujourd'hui {from}), le MRR dans 12 mois gagnerait {gain}.",
    ["slide-whatif-one"], "example"),
  "slide.whatif.titleTogether": s(
    "With the 3 what-ifs together, MRR in 12 months would gain {gain}.",
    "Avec les 3 « Et si » ensemble, le MRR dans 12 mois gagnerait {gain}.",
    ["slide-together"], "example"),
  "slide.whatif.figures": s("Growth figures", "Les chiffres de croissance", ["slide-whatif-one", "slide-together"], "kept"),
  "slide.whatif.with": s("With this what-if", "Avec cet « Et si »", ["slide-whatif-one"], "kept"),
  "slide.whatif.withAll": s("With the what-ifs", "Avec les « Et si »", ["slide-together"], "kept"),
  "slide.whatif.funnelStill": s("This lever leaves the month's funnel as it is.", "Ce levier laisse le funnel du mois tel quel.", ["slide-whatif-one"], "changed", "the table “The month's funnel”, all rows “stable”"),
  "slide.whatif.assume": s(
    "Logo churn stands in for revenue churn, as if lost customers paid the average ARPA. Over 12 months at this month's pace: the base kept by the NRR each month, plus the month's new MRR. No seasonality, no saturation.",
    "Le churn logo tient lieu de churn en revenu, comme si les clients partis payaient l'ARPA moyen. Sur 12 mois, au rythme de ce mois : la base retenue à la NRR chaque mois, plus le nouveau MRR du mois. Ni saisonnalité, ni saturation.",
    ["slide-whatif-one", "slide-together"], "kept"),
  "slide.bothNote": s(
    "Self-serve: monthly GRR {grr} · NRR {nrr}, approximate (logo churn). Sales-assisted: renewal {renewal} a year. Cash tied up: a month's spend × the payback ÷ 2 — a floor, monthly billing. Dotted, at 12 months: a commonly cited reference.",
    "Libre-service : GRR {grr} · NRR {nrr} par mois, approximatives (churn logo). Assisté : renouvellement {renewal} par an. Trésorerie immobilisée : dépense du mois × payback ÷ 2, un plancher, facturation mensuelle. Pointillé à 12 mois : repère couramment cité.",
    ["slide-unit-both"]),
  "deck.title": s("The deck, when the loss is certain", "Le deck, quand la perte est certaine", ["deck-order"], "board"),
  "deck.s1": s("The funnel — your verdict", "Le funnel — ton verdict", ["deck-order"], "board"),
  "deck.s2": s("Unit economics — the loss", "Unit economics — la perte", ["deck-order"], "board"),
  "deck.s3": s("The stage that holds you back", "L'étape qui freine", ["deck-order"], "board"),
  "deck.moved": s("moved up from № 8: the loss is certain", "remonte du № 8 : la perte est certaine", ["deck-order"], "board"),
  "deck.rest": s("Then the other slides, in today's order", "Puis les autres slides, dans l'ordre d'aujourd'hui", ["deck-order"], "board"),
  "deck.s4": s("What if? — one lever, then together", "Et si ? — un levier, puis ensemble", ["deck-order"], "board"),

  // ── The page (EngineLanding) ──────────────────────────────────────────
  "landing.eyebrow": s("The engine", "Le moteur", ["arrival"], "kept"),
  "landing.h1": s("Your growth engine", "Ton moteur de growth", ["arrival"], "kept"),
  "landing.lede": s(
    "Your Tour tells you whether you measure. The engine shows what your numbers say.",
    "Ton Tour dit si tu mesures. Le moteur montre ce que disent tes chiffres.",
    ["arrival"], "kept"),
  "landing.positioning": s(
    "Seventeen numbers in self-serve, fifteen sales-assisted: go and get them, see where your engine loses people and what each new customer earns you, and leave with slides for your leadership meeting, your board or your investors. Your numbers are compared only with yourself and your own target: published references are there to situate, never to name a stage.",
    "Dix-sept chiffres en libre-service, quinze en assisté : va les chercher, vois où ton moteur perd du monde et ce que te rapporte chaque nouveau client, et repars avec des slides pour ton CODIR, ton board ou tes investisseurs. Tes chiffres ne sont comparés qu'à toi-même et à ta propre cible : les repères publiés sont là pour situer, jamais pour désigner une étape.",
    ["arrival"], "changed",
    "Seventeen numbers in self-serve, fifteen sales-assisted: go and get them, see where your engine loses people and leave with slides ready for your leadership meeting. Your numbers are compared only with yourself and your own target: published references are there to situate, never to name a stage. / FR: « … et repars avec des slides prêtes pour ton CODIR. … »"),
  "landing.promiseTitle": s("Nothing you enter leaves this page", "Rien de ce que tu saisis ne sort d'ici", ["arrival"], "kept"),
  "landing.promiseBody": s(COPY07["landing.promiseBody"].en, COPY07["landing.promiseBody"].fr, ["arrival"], "kept"),
  "landing.promiseLine": s(COPY07["landing.promiseLine"].en, COPY07["landing.promiseLine"].fr, ["arrival"], "kept"),
  "landing.cta": s("Enter your numbers →", "Entre tes chiffres →", ["arrival"], "kept"),
  "landing.ctaNote": s(COPY07["landing.ctaNote"].en, COPY07["landing.ctaNote"].fr, ["arrival"], "kept"),
};

export const translator = (lang) => (key, vars = {}) => {
  const entry = COPY[key] ?? COPY07[key];
  if (!entry) return `‹${key}›`;
  let text = entry[lang];
  for (const [k, v] of Object.entries(vars)) {
    text = text.replace(new RegExp(`\\{${k}:([^|}]*)\\|([^}]*)\\}`, "g"), (_, one, other) => (Number(v) <= 1 ? one : other));
    text = text.split(`{${k}}`).join(String(v));
  }
  return lang === "fr" ? frTypo(text) : text;
};
