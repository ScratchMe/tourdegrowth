// TODO: à relire — copie neuve (convention 6), §22 (A23 MKT-5)
import type { DeepPartialTranslatable } from "@/lib/i18n/translatable";
import type { ENGINE_COPY } from "./engine-copy"; // type only: erased, never a bundle edge

/**
 * engine-copy-marketplace.ts — the marketplace's overlays on `ENGINE_COPY`, in the words of "products" (engine spec
 * §22.8, A23 MKT-5): only the leaves whose words change when the engine is a marketplace's, each a whole `{ fr, en }` at
 * the SAME path as in the base. `marketplaceStrings` (`lib/engine/strings.ts`) lays them over the base in the island, in
 * the order of §22.8.1, so a screen or a slide reads one tree and never asks which type it is on.
 *
 * Three layers, because a marketplace has two sides and each says "client" and "MRR" its own way (D15):
 * - `common` (C105): the six leaves a marketplace reads in EVERY set, the neutral one included (the setup card, the
 *   Settings, a number's screen), written for both sides at once (§22.8.5 c bis);
 * - `demand`: the buyers' words ("acheteur", "revenu net"); `supply`: the sellers' ("vendeur abonné", "MRR des
 *   abonnements", "vendeur inscrit"), in the lexicon of §22.8.2.
 * Each side holds, word for word, the leaves of §22.8.5 c (the second table, the brief 10's, included whether the
 * rule designates them or not), and every other leaf the rule of §22.8.3 designates, rewritten from the SaaS string
 * with the lexicon. A leaf the lexicon cannot rewrite without changing the sense is not here: `MKT_OVERLAY_SKIPPED`, in
 * `__tests__/mkt-words.ts`, names it with the reason, and that side shows the SaaS wording there until Antoine rules
 * (A23.d). The "services" words are MKT-S's (`engine-copy-mkt-services.ts`).
 *
 * Server only, like `engine-copy.ts`: the page resolves it with `resolveTree` (a partial tree is fine) and hands the
 * island `typeStrings.marketplace`; the island never imports this file (`engine-boundary.test.ts`).
 */
type Overlay = DeepPartialTranslatable<typeof ENGINE_COPY>;

export const ENGINE_COPY_MKT: { common: Overlay; demand: Overlay; supply: Overlay } = {
  /** C105 (§22.8.5 c bis): read in every set of a marketplace, written for both sides at once. */
  common: {
    setup: {
      referenceMonthHint: {
        fr: "Visiteurs, inscriptions, dépense et churn des deux côtés, commandes et revenu net de ce mois-là. Par défaut : le dernier mois terminé.",
        en: "Visitors, sign-ups, spend and churn on both sides, orders and net revenue for that month. Default: the last full month.",
      },
      cohortHint: {
        fr: "On suit les acheteurs et les vendeurs inscrits en {cohort} : ceux inscrits en {next} n'ont pas encore eu {n} jours.",
        en: "We follow the buyers and sellers who signed up in {cohort}: those from {next} haven't had {n} days yet.",
      },
    },
    terms: {
      cohort: {
        definition: {
          fr: "Les acheteurs ou les vendeurs inscrits un même mois, suivis sur les jours qui suivent. La première commande, la deuxième et la première vente se lisent sur une cohorte assez ancienne pour que chacun ait eu toute la fenêtre : la cohorte suivie, dans les Réglages.",
          en: "The buyers or sellers who signed up in one month, followed over the days after. The first order, the second one and the first sale are read on a cohort old enough for each of them to have had the whole window: the cohort you follow, in Settings.",
        },
      },
      window: {
        definition: {
          fr: "Le nombre de jours qu'a un inscrit pour qu'une action compte : commander en 30 jours, commander une deuxième fois en 90, vendre en 60. Elle se règle dans Réglages.",
          en: "How many days a sign-up has for an action to count: order within 30 days, order a second time within 90, sell within 60. Change it in Settings.",
        },
      },
    },
    settings: {
      windowHint: {
        fr: "La fenêtre : le nombre de jours qu'a un acheteur ou un vendeur, depuis son inscription, pour que ça compte.",
        en: "The window: how many days a buyer or seller has, from signing up, for it to count.",
      },
      runwayHint: {
        fr: "Sert seulement à te prévenir quand un acheteur ou un vendeur abonné met plus longtemps à rembourser son coût.",
        en: "Only used to warn you when a buyer or a paid seller takes longer to pay back their cost.",
      },
    },
  },
  /** The buyers: the demand side of §22.8.2, and §22.8.5 c, demand column. */
  demand: {
    lever: {
      arr12: { fr: "Revenu net annualisé dans 12 mois", en: "Annualised net revenue in 12 months" },
      curveSummary: {
        fr: "Le revenu net mois par mois, de {start} aujourd'hui à {today} dans 12 mois au rythme actuel.",
        en: "The net revenue month by month, from {start} today to {today} in 12 months at today's pace.",
      },
      curveSummaryWhatif: {
        fr: "Le revenu net mois par mois, depuis {start} aujourd'hui : {today} dans 12 mois au rythme actuel, {whatif} {key}.",
        en: "The net revenue month by month, from {start} today: {today} in 12 months at today's pace, {whatif} {key}.",
      },
      worthOut: {
        fr: "Un nouvel acheteur : plus de perte. Il rapporte {ltv} pour {cac} : {gap} de plus.",
        en: "One new buyer: no longer a loss. It brings back {ltv} for {cac}: {gap} more.",
      },
      worthMaybe: {
        fr: "Un nouvel acheteur : plus de perte certaine. Il rapporte {ltv} pour {cac} : les deux fourchettes se chevauchent.",
        en: "One new buyer: no longer a certain loss. It brings back {ltv} for {cac}: the two ranges overlap.",
      },
      worthLess: { fr: "Un nouvel acheteur : toujours une perte, de {gap} au lieu de {before}.", en: "One new buyer: still a loss, of {gap} instead of {before}." },
      worthStill: {
        fr: "Un nouvel acheteur : toujours une perte de {gap}. Ce levier ne change ni ce que rapporte un acheteur ni ce qu'il coûte.",
        en: "One new buyer: still a loss of {gap}. This lever changes neither what a buyer brings back nor what it costs.",
      },
      worthStillMany: {
        fr: "Un nouvel acheteur : toujours une perte de {gap}. Tes « Et si » ne changent ni ce que rapporte un acheteur ni ce qu'il coûte.",
        en: "One new buyer: still a loss of {gap}. Your what-ifs change neither what a buyer brings back nor what it costs.",
      },
    },
    money: {
      mrr: { fr: "Revenu net", en: "Net revenue" },
      arr: { fr: "Revenu net annualisé, le revenu net × 12", en: "Annualised net revenue, net revenue × 12" },
      worthTitle: { fr: "Ce que vaut un nouvel acheteur", en: "What one new buyer is worth" },
      healthy: {
        fr: "Chaque nouvel acheteur coûte {cac} et rapporte {ltv} de marge : {gap} de plus que ce qu'il coûte.",
        en: "Each new buyer costs {cac} and brings back {ltv} of margin: {gap} more than it costs.",
      },
      noLtv: {
        fr: "On ne peut pas encore dire ce que rapporte un nouvel acheteur : il manque {input}.",
        en: "We can't tell yet what a new buyer brings back. Missing: {input}.",
      },
      noCac: {
        fr: "Un nouvel acheteur rapporte {ltv} de marge ; ce qu'il coûte, on ne le sait pas encore : il manque {input}.",
        en: "A new buyer brings back {ltv} of margin; what it costs isn't known yet. Missing: {input}.",
      },
      noMarginNote: {
        fr: "Sans elle, pas de LTV, pas de payback, pas de trésorerie : aucune autre marge ne la remplace.",
        en: "Without it, no LTV, no payback, no cash figure: no other margin stands in for it.",
      },
      monthsLoss: {
        fr: "Un acheteur reste {life} ; rembourser son coût en prendrait {payback} : il part avant.",
        en: "A buyer stays {life}; paying back its cost would take {payback}: it leaves before.",
      },
      monthsMaybe: {
        fr: "Un acheteur reste {life} ; rembourser son coût en prend {payback} : il peut partir avant.",
        en: "A buyer stays {life}; paying back its cost takes {payback}: it may leave before.",
      },
      lineLoss: {
        fr: "Et elle ne revient pas toute : les acheteurs partent avant d'avoir remboursé.",
        en: "And it does not all come back: buyers leave before they pay back.",
      },
      lineMaybe: {
        fr: "Qu'elle revienne toute n'est pas sûr : les acheteurs peuvent partir avant d'avoir remboursé.",
        en: "Whether it all comes back isn't certain: buyers may leave before they pay back.",
      },
      lineHealthy: { fr: "Elle revient toute, au fil des remboursements.", en: "It all comes back, as buyers pay back." },
      warnRunway: {
        fr: "Un acheteur met {payback} à rembourser son coût, plus que ton runway ({n}) : tu gagnes de l'argent, mais peut-être après la fin de ta trésorerie.",
        en: "A buyer takes {payback} to pay back its cost, longer than your runway ({n}): you make money, but maybe after your cash runs out.",
      },
      warnRunwayMaybe: {
        fr: "Un acheteur met {payback} à rembourser son coût : peut-être plus que ton runway ({n}).",
        en: "A buyer takes {payback} to pay back its cost: maybe longer than your runway ({n}).",
      },
      warnFloor: {
        fr: "Un acheteur met {payback} à rembourser son coût : {n} ou plus. Tu gagnes de l'argent, mais tard. Saisis ton runway dans les Réglages pour y comparer ton payback.",
        en: "A buyer takes {payback} to pay back its cost: {n} or more. You make money, but late. Type your runway in Settings to hold your payback against it.",
      },
      warnFloorMaybe: {
        fr: "Un acheteur met {payback} à rembourser son coût : peut-être {n} ou plus. Saisis ton runway dans les Réglages pour y comparer ton payback.",
        en: "A buyer takes {payback} to pay back its cost: maybe {n} or more. Type your runway in Settings to hold your payback against it.",
      },
    },
    worth: {
      newMrr: { fr: "{amount} de revenu net nouveau par mois", en: "{amount} of new net revenue a month" },
      retainedMrr: { fr: "{amount} de revenu net préservé par mois", en: "{amount} of retained net revenue a month" },
      customers: { fr: "{n} acheteurs de plus par mois", en: "{n} more buyers a month" },
      customersOne: { fr: "{n} acheteur de plus par mois", en: "{n} more buyer a month" },
      kept: { fr: "{n} acheteurs gardés par mois", en: "{n} buyers kept a month" },
      keptOne: { fr: "{n} acheteur gardé par mois", en: "{n} buyer kept a month" },
      perHundred: { fr: "{n} acheteurs de plus pour 100 inscrits", en: "{n} more buyers per 100 sign-ups" },
      perHundredOne: { fr: "{n} acheteur de plus pour 100 inscrits", en: "{n} more buyer per 100 sign-ups" },
      lessThanOne: { fr: "moins d'un acheteur de plus par mois", en: "less than one more buyer a month" },
    },
    diagnosis: {
      clear: { fr: "Une étape freine les acheteurs", en: "One stage holds the buyers back" },
      shared: { fr: "{n} étapes freinent les acheteurs autant l'une que l'autre", en: "{n} stages hold the buyers back about equally" },
      level: { fr: "Rien ne freine les acheteurs", en: "Nothing holds the buyers back" },
      notEnough: { fr: "Pas assez de cibles pour nommer ce qui freine les acheteurs", en: "Not enough targets to name what holds the buyers back" },
    },
    whatIf: {
      times: { fr: "× revenu net par acheteur actif", en: "× net revenue per active buyer" },
      todayFlow: { fr: "{rate}, soit {n} nouveaux acheteurs par mois", en: "{rate}, i.e. {n} new buyers a month" },
      todayFlowOne: { fr: "{rate}, soit {n} nouvel acheteur par mois", en: "{rate}, i.e. {n} new buyer a month" },
      todayPerHundred: { fr: "{rate}, soit {n} acheteurs pour 100 inscrits", en: "{rate}, i.e. {n} buyers per 100 sign-ups" },
      todayPerHundredOne: { fr: "{rate}, soit {n} acheteur pour 100 inscrits", en: "{rate}, i.e. {n} buyer per 100 sign-ups" },
      timesFlow: { fr: "{arpa} par acheteur, soit {amount} de revenu net ajouté chaque mois", en: "{arpa} per buyer, i.e. {amount} of net revenue added every month" },
      todayChurn: { fr: "{churn} de churn sur {base} acheteurs actifs", en: "{churn} churn on {base} active buyers" },
      thenChurn: { fr: "{base} × ({churn} – {target}) = {n} acheteurs gardés par mois", en: "{base} × ({churn} – {target}) = {n} buyers kept a month" },
      thenChurnOne: { fr: "{base} × ({churn} – {target}) = {n} acheteur gardé par mois", en: "{base} × ({churn} – {target}) = {n} buyer kept a month" },
      timesChurn: { fr: "{arpa} par acheteur, soit {amount} de revenu net préservé chaque mois", en: "{arpa} per buyer, i.e. {amount} of net revenue kept every month" },
      annual: { fr: "Soit {amount} de revenu net de plus au bout d'un an, churn compris.", en: "That's {amount} more net revenue after a year, churn included." },
      lessThanOne: { fr: "Moins d'un acheteur de plus par mois.", en: "Less than one more buyer a month." },
    },
    scenario: {
      intro: {
        fr: "Bouge un ou plusieurs leviers : le funnel et les chiffres des acheteurs se recalculent ensemble, les effets se cumulent.",
        en: "Move one lever or several: the buyers' funnel and figures recompute together, and the effects add up.",
      },
      paying: { fr: "Nouveaux acheteurs", en: "New buyers" },
      kpiMrr12: { fr: "Revenu net dans 12 mois", en: "Net revenue in 12 months" },
      kpiNewMrr: { fr: "Nouveau revenu net par mois", en: "New net revenue a month" },
      figuresCustomer: { fr: "Un nouvel acheteur", en: "One new buyer" },
      rowGap: { fr: "Par nouvel acheteur", en: "Per new buyer" },
      assumeLtv: {
        fr: "LTV : la marge mensuelle sur la durée de vie comptée d'un acheteur (1 ÷ churn des acheteurs, plafonnée à 36 mois), au revenu net par acheteur actif d'aujourd'hui.",
        en: "LTV: the monthly margin over a buyer's counted lifetime (1 ÷ buyer churn, capped at 36 months), on today's net revenue per active buyer.",
      },
      assumeCash: {
        fr: "Trésorerie immobilisée : la dépense d'acquisition du mois × le payback ÷ 2. La dépense de chaque mois revient régulièrement sur le payback ; le churn, qui la ralentit, n'est pas compté (un plancher). Même dépense avec les « Et si » : plus de nouveaux acheteurs rendent chacun moins cher.",
        en: "Cash tied up: the month's acquisition spend × the payback ÷ 2. Each month's spend comes back evenly over the payback; churn, which slows it, is not counted (a floor). The same spend with the what-ifs: more new buyers make each one cheaper.",
      },
      aloneTitle: { fr: "Ce que chaque levier rapporte seul, sur le revenu net dans 12 mois", en: "What each lever brings on its own, on net revenue in 12 months" },
      assumption: {
        "same-spend": {
          fr: "À dépense égale : plus de nouveaux acheteurs font baisser le CAC dans la même proportion.",
          en: "Same spend: more new buyers lower the CAC in the same proportion.",
        },
        "twelve-months": {
          fr: "Sur 12 mois, au rythme de ce mois : le revenu net gardé chaque mois au rythme du churn des acheteurs, plus le revenu net nouveau du mois. Ni saisonnalité, ni saturation.",
          en: "Over 12 months, at this month's pace: the net revenue kept each month at the buyer churn's pace, plus the month's new net revenue. No seasonality, no saturation.",
        },
      },
    },
    terms: {
      arr: {
        term: { fr: "revenu net annualisé", en: "annualised net revenue" },
      },
      cashTied: {
        definition: {
          fr: "Ce que ton acquisition garde hors de la banque à tout moment. Chaque mois, tu dépenses pour gagner des acheteurs ; chacun te le rembourse sur la durée du payback. À rythme constant, la moitié de la dépense d'un payback est dehors. Un plancher : le churn ralentit le retour.",
          en: "What your acquisition keeps out of the bank at any time. Each month you spend to win new buyers; each of them pays that back over the payback. At a steady pace, half a payback's worth of spend is out. A floor: churn slows the return.",
        },
      },
      afterPayback: {
        definition: {
          fr: "Combien de temps un acheteur continue de rapporter de la marge une fois son coût d'acquisition remboursé : sa durée de vie moins le payback. Sous zéro, il part avant d'avoir remboursé : c'est la perte, dite en mois.",
          en: "How long a buyer keeps bringing in margin once their acquisition cost is paid back: their lifetime minus the payback. Below zero, they leave before paying back: that is the loss, said in months.",
        },
      },
    },
    slide: {
      leakFooterUnpriced: { fr: "Sans montant : le moteur ne relie pas ce chiffre au revenu net", en: "No amount: the engine doesn't link this number to net revenue" },
      unitFloor: { fr: "un plancher", en: "a floor" },
      unitWarnRunway: {
        fr: "Un acheteur met {payback} à rembourser son coût, plus que notre runway ({n}) : nous gagnons de l'argent, mais peut-être après la fin de notre trésorerie.",
        en: "A buyer takes {payback} to pay back its cost, longer than our runway ({n}): we make money, but maybe after our cash runs out.",
      },
      unitWarnRunwayMaybe: {
        fr: "Un acheteur met {payback} à rembourser son coût : peut-être plus que notre runway ({n}).",
        en: "A buyer takes {payback} to pay back its cost: maybe longer than our runway ({n}).",
      },
      unitWarnFloor: {
        fr: "Un acheteur met {payback} à rembourser son coût : {n} ou plus. Nous gagnons de l'argent, mais tard.",
        en: "A buyer takes {payback} to pay back its cost: {n} or more. We make money, but late.",
      },
      unitWarnFloorMaybe: {
        fr: "Un acheteur met {payback} à rembourser son coût : peut-être {n} ou plus.",
        en: "A buyer takes {payback} to pay back its cost: maybe {n} or more.",
      },
      unitAssume: {
        fr: "Trésorerie immobilisée : la dépense d'acquisition du mois × le payback ÷ 2 — un plancher. La marge est celle des commissions.",
        en: "Cash tied up: the month's acquisition spend × the payback ÷ 2 — a floor. The margin is the commissions' own.",
      },
      chartCost: { fr: "ce que coûte un nouvel acheteur", en: "what a new buyer costs" },
      chartSummaryLoss: {
        fr: "Un acheteur, mois par mois : il rapporte {mm} de marge par mois et part après environ {life}, à {gap} des {cac} qu'il a coûté ; il aurait remboursé à {payback}.",
        en: "One buyer, month by month: it brings back {mm} of margin a month and leaves after about {life}, {gap} short of the {cac} it cost; it would have paid back at {payback}.",
      },
      chartSummaryHealthy: {
        fr: "Un acheteur, mois par mois : il rapporte {mm} de marge par mois, rembourse ses {cac} à {payback} et reste {life}.",
        en: "One buyer, month by month: it brings back {mm} of margin a month, pays back its {cac} at {payback} and stays {life}.",
      },
      chartSummaryMaybe: {
        fr: "Un acheteur, mois par mois : il rapporte {mm} de marge par mois et reste {life} ; rembourser ses {cac} prend {payback} : il peut partir avant.",
        en: "One buyer, month by month: it brings back {mm} of margin a month and stays {life}; paying back its {cac} takes {payback}: it may leave before.",
      },
      chartSummaryNone: {
        fr: "Un acheteur, mois par mois : son coût est connu ({cac}), ce qu'il rapporte non : il manque {input}.",
        en: "One buyer, month by month: its cost is known ({cac}), what it brings back is not. Missing: {input}.",
      },
    },
    slideTitles: {
      leakClearMrrNew: {
        fr: "Ramener {stage} à {target} vaudrait **{amount} de revenu net nouveau** chaque mois.",
        en: "Bringing {stage} to {target} would be worth **{amount} of new net revenue** every month.",
      },
      leakClearMrrRetained: {
        fr: "Ramener {stage} à {target} vaudrait **{amount} de revenu net préservé** chaque mois.",
        en: "Bringing {stage} to {target} would be worth **{amount} of retained net revenue** every month.",
      },
      leakClearCustomers: {
        fr: "Ramener {stage} à {target} ajouterait **{n} nouveaux acheteurs** par mois.",
        en: "Bringing {stage} to {target} would add **{n} new buyers** a month.",
      },
      leakClearCustomersOne: {
        fr: "Ramener {stage} à {target} ajouterait **{n} nouvel acheteur** par mois.",
        en: "Bringing {stage} to {target} would add **{n} new buyer** a month.",
      },
      leakClearKept: {
        fr: "Ramener {stage} à {target} garderait **{n} acheteurs actifs** de plus par mois.",
        en: "Bringing {stage} to {target} would keep **{n} more active buyers** a month.",
      },
      leakClearKeptOne: {
        fr: "Ramener {stage} à {target} garderait **{n} acheteur actif** de plus par mois.",
        en: "Bringing {stage} to {target} would keep **{n} more active buyer** a month.",
      },
      leakClearPerHundred: {
        fr: "Ramener {stage} à {target} ajouterait **{n} acheteurs pour 100 inscrits**.",
        en: "Bringing {stage} to {target} would add **{n} buyers per 100 sign-ups**.",
      },
      leakClearPerHundredOne: {
        fr: "Ramener {stage} à {target} ajouterait **{n} acheteur pour 100 inscrits**.",
        en: "Bringing {stage} to {target} would add **{n} buyer per 100 sign-ups**.",
      },
      unitEconomics: {
        fr: "Un acheteur rembourse son coût d'acquisition en **{m}** et rapporte **{x}** ce qu'il coûte.",
        en: "A buyer pays back their acquisition cost in **{m}** and brings in **{x}** what they cost.",
      },
      unitEconomicsUnknown: {
        fr: "**On ne peut pas encore dire ce que rapporte un acheteur.** Il manque {input}.",
        en: "**We can't yet say what a buyer is worth.** Missing: {input}.",
      },
      unitEconomicsLoss: {
        fr: "Chaque nouvel acheteur nous coûte {cac} et en rapporte {ltv} : **on perd {gap} sur chacun**.",
        en: "Each new buyer costs us {cac} and brings back {ltv}: **we lose {gap} on each one**.",
      },
      whatIfLever: {
        fr: "Si {stage} passait à {to} (aujourd'hui : {from}), le revenu net dans 12 mois gagnerait **{gain}**.",
        en: "If {stage} went from {from} to {to}, net revenue in 12 months would gain **{gain}**.",
      },
      scenario: {
        fr: "Avec les {n} « Et si » ensemble, le revenu net dans 12 mois gagnerait **{gain}**.",
        en: "With the {n} what-ifs together, net revenue in 12 months would gain **{gain}**.",
      },
    },
    findings: {
      unitEcon: {
        fr: "Impossible de dire en combien de mois un acheteur rembourse son coût d'acquisition. Il manque {input}.",
        en: "We can't say how many months a buyer takes to pay back their acquisition cost. Missing: {input}.",
      },
      unitEconLoss: {
        fr: "Chaque nouvel acheteur coûte {cac} et rapporte {ltv} de marge : tu perds {gap} sur chacun.",
        en: "Each new buyer costs {cac} and brings back {ltv} of margin: you lose {gap} on each one.",
      },
      unitEconLossMaybe: {
        fr: "Un nouvel acheteur coûte {cac} et rapporte {ltv} de marge : il ne rembourse peut-être pas ce qu'il coûte.",
        en: "A new buyer costs {cac} and brings back {ltv} of margin: it may not pay back what it costs.",
      },
      reconcile: {
        fr: "Ta chaîne prédit ~{p} nouveaux acheteurs en {month} ; ton CAC acheteur en compte {n}. Au moins une définition ne porte pas sur la même population.",
        en: "Your chain predicts ~{p} new buyers in {month}; your buyer CAC counts {n}. At least one definition doesn't cover the same population.",
      },
      reconcileOne: {
        fr: "Ta chaîne prédit ~{p} nouvel acheteur en {month} ; ton CAC acheteur en compte {n}. Au moins une définition ne porte pas sur la même population.",
        en: "Your chain predicts ~{p} new buyer in {month}; your buyer CAC counts {n}. At least one definition doesn't cover the same population.",
      },
    },
    sanity: {
      reconcileGap: {
        fr: "Ta chaîne prédit ~{p} nouveaux acheteurs en {month} ; ton CAC acheteur en compte {n}. Au moins une définition ne porte pas sur la même population.",
        en: "Your chain predicts ~{p} new buyers in {month}; your buyer CAC counts {n}. At least one definition doesn't cover the same population.",
      },
      reconcileGapOne: {
        fr: "Ta chaîne prédit ~{p} nouvel acheteur en {month} ; ton CAC acheteur en compte {n}. Au moins une définition ne porte pas sur la même population.",
        en: "Your chain predicts ~{p} new buyer in {month}; your buyer CAC counts {n}. At least one definition doesn't cover the same population.",
      },
    },
  },
  /** The sellers: the supply side of §22.8.2, and §22.8.5 c, supply column. */
  supply: {
    board: {
      smallCohort: {
        fr: "Petits effectifs : moins de 100 vendeurs inscrits dans cette cohorte. Lis la direction, pas les décimales.",
        en: "Small numbers: fewer than 100 seller sign-ups in this cohort. Read the direction, not the decimals.",
      },
    },
    lever: {
      arr12: { fr: "ARR des abonnements dans 12 mois", en: "Subscription ARR in 12 months" },
      curveSummary: {
        fr: "Le MRR des abonnements mois par mois, de {start} aujourd'hui à {today} dans 12 mois au rythme actuel.",
        en: "The subscription MRR month by month, from {start} today to {today} in 12 months at today's pace.",
      },
      curveSummaryWhatif: {
        fr: "Le MRR des abonnements mois par mois, depuis {start} aujourd'hui : {today} dans 12 mois au rythme actuel, {whatif} {key}.",
        en: "The subscription MRR month by month, from {start} today: {today} in 12 months at today's pace, {whatif} {key}.",
      },
      worthOut: {
        fr: "Un nouveau vendeur abonné : plus de perte. Il rapporte {ltv} pour {cac} : {gap} de plus.",
        en: "One new paid seller: no longer a loss. It brings back {ltv} for {cac}: {gap} more.",
      },
      worthMaybe: {
        fr: "Un nouveau vendeur abonné : plus de perte certaine. Il rapporte {ltv} pour {cac} : les deux fourchettes se chevauchent.",
        en: "One new paid seller: no longer a certain loss. It brings back {ltv} for {cac}: the two ranges overlap.",
      },
      worthLess: {
        fr: "Un nouveau vendeur abonné : toujours une perte, de {gap} au lieu de {before}.",
        en: "One new paid seller: still a loss, of {gap} instead of {before}.",
      },
      worthStill: {
        fr: "Un nouveau vendeur abonné : toujours une perte de {gap}. Ce levier ne change ni ce que rapporte un vendeur abonné ni ce qu'il coûte.",
        en: "One new paid seller: still a loss of {gap}. This lever changes neither what a paid seller brings back nor what it costs.",
      },
      worthStillMany: {
        fr: "Un nouveau vendeur abonné : toujours une perte de {gap}. Tes « Et si » ne changent ni ce que rapporte un vendeur abonné ni ce qu'il coûte.",
        en: "One new paid seller: still a loss of {gap}. Your what-ifs change neither what a paid seller brings back nor what it costs.",
      },
    },
    money: {
      mrr: { fr: "MRR des abonnements", en: "Subscription MRR" },
      arr: { fr: "ARR des abonnements, leur MRR × 12", en: "Subscription ARR, their MRR × 12" },
      worthTitle: { fr: "Ce que vaut un nouveau vendeur abonné", en: "What one new paid seller is worth" },
      healthy: {
        fr: "Chaque nouveau vendeur abonné coûte {cac} et rapporte {ltv} de marge : {gap} de plus que ce qu'il coûte.",
        en: "Each new paid seller costs {cac} and brings back {ltv} of margin: {gap} more than it costs.",
      },
      noLtv: {
        fr: "On ne peut pas encore dire ce que rapporte un nouveau vendeur abonné : il manque {input}.",
        en: "We can't tell yet what a new paid seller brings back. Missing: {input}.",
      },
      noCac: {
        fr: "Un nouveau vendeur abonné rapporte {ltv} de marge ; ce qu'il coûte, on ne le sait pas encore : il manque {input}.",
        en: "A new paid seller brings back {ltv} of margin; what it costs isn't known yet. Missing: {input}.",
      },
      noMarginNote: {
        fr: "Sans elle, pas de LTV, pas de payback, pas de trésorerie, et jamais la marge des commissions à sa place : chaque flux a la sienne.",
        en: "Without it, no LTV, no payback, no cash figure, and never the commissions' margin in its place: each stream has its own.",
      },
      monthsLoss: {
        fr: "Un vendeur abonné reste {life} ; rembourser son coût en prendrait {payback} : il part avant.",
        en: "A paid seller stays {life}; paying back its cost would take {payback}: it leaves before.",
      },
      monthsMaybe: {
        fr: "Un vendeur abonné reste {life} ; rembourser son coût en prend {payback} : il peut partir avant.",
        en: "A paid seller stays {life}; paying back its cost takes {payback}: it may leave before.",
      },
      lineLoss: {
        fr: "Et elle ne revient pas toute : les vendeurs abonnés partent avant d'avoir remboursé.",
        en: "And it does not all come back: paid sellers leave before they pay back.",
      },
      lineMaybe: {
        fr: "Qu'elle revienne toute n'est pas sûr : les vendeurs abonnés peuvent partir avant d'avoir remboursé.",
        en: "Whether it all comes back isn't certain: paid sellers may leave before they pay back.",
      },
      lineHealthy: { fr: "Elle revient toute, au fil des remboursements.", en: "It all comes back, as paid sellers pay back." },
      warnRunway: {
        fr: "Un vendeur abonné met {payback} à rembourser son coût, plus que ton runway ({n}) : tu gagnes de l'argent, mais peut-être après la fin de ta trésorerie.",
        en: "A paid seller takes {payback} to pay back its cost, longer than your runway ({n}): you make money, but maybe after your cash runs out.",
      },
      warnRunwayMaybe: {
        fr: "Un vendeur abonné met {payback} à rembourser son coût : peut-être plus que ton runway ({n}).",
        en: "A paid seller takes {payback} to pay back its cost: maybe longer than your runway ({n}).",
      },
      warnFloor: {
        fr: "Un vendeur abonné met {payback} à rembourser son coût : {n} ou plus. Tu gagnes de l'argent, mais tard. Saisis ton runway dans les Réglages pour y comparer ton payback.",
        en: "A paid seller takes {payback} to pay back its cost: {n} or more. You make money, but late. Type your runway in Settings to hold your payback against it.",
      },
      warnFloorMaybe: {
        fr: "Un vendeur abonné met {payback} à rembourser son coût : peut-être {n} ou plus. Saisis ton runway dans les Réglages pour y comparer ton payback.",
        en: "A paid seller takes {payback} to pay back its cost: maybe {n} or more. Type your runway in Settings to hold your payback against it.",
      },
    },
    worth: {
      newMrr: { fr: "{amount} de nouveau MRR des abonnements par mois", en: "{amount} of new subscription MRR a month" },
      retainedMrr: { fr: "{amount} de MRR des abonnements préservé par mois", en: "{amount} of retained subscription MRR a month" },
      customers: { fr: "{n} vendeurs abonnés de plus par mois", en: "{n} more paid sellers a month" },
      customersOne: { fr: "{n} vendeur abonné de plus par mois", en: "{n} more paid seller a month" },
      kept: { fr: "{n} vendeurs abonnés gardés par mois", en: "{n} paid sellers kept a month" },
      keptOne: { fr: "{n} vendeur abonné gardé par mois", en: "{n} paid seller kept a month" },
      perHundred: { fr: "{n} vendeurs abonnés de plus pour 100 vendeurs inscrits", en: "{n} more paid sellers per 100 seller sign-ups" },
      perHundredOne: { fr: "{n} vendeur abonné de plus pour 100 vendeurs inscrits", en: "{n} more paid seller per 100 seller sign-ups" },
      lessThanOne: { fr: "moins d'un vendeur abonné de plus par mois", en: "less than one more paid seller a month" },
    },
    sheet: {
      cohortToUse: {
        fr: "Prends les vendeurs inscrits en {cohort} : les vendeurs inscrits en {next} n'ont pas encore eu {n} jours.",
        en: "Use the seller sign-ups from {cohort}: those from {next} haven't had {n} days yet.",
      },
    },
    diagnosis: {
      clear: { fr: "Une étape freine les vendeurs", en: "One stage holds the sellers back" },
      shared: { fr: "{n} étapes freinent les vendeurs autant l'une que l'autre", en: "{n} stages hold the sellers back about equally" },
      level: { fr: "Rien ne freine les vendeurs", en: "Nothing holds the sellers back" },
      notEnough: { fr: "Pas assez de cibles pour nommer ce qui freine les vendeurs", en: "Not enough targets to name what holds the sellers back" },
    },
    whatIf: {
      times: { fr: "× revenu par vendeur abonné", en: "× revenue per paid seller" },
      todayFlow: { fr: "{rate}, soit {n} nouveaux vendeurs abonnés par mois", en: "{rate}, i.e. {n} new paid sellers a month" },
      todayFlowOne: { fr: "{rate}, soit {n} nouveau vendeur abonné par mois", en: "{rate}, i.e. {n} new paid seller a month" },
      todayPerHundred: { fr: "{rate}, soit {n} vendeurs abonnés pour 100 vendeurs inscrits", en: "{rate}, i.e. {n} paid sellers per 100 seller sign-ups" },
      todayPerHundredOne: { fr: "{rate}, soit {n} vendeur abonné pour 100 vendeurs inscrits", en: "{rate}, i.e. {n} paid seller per 100 seller sign-ups" },
      timesFlow: {
        fr: "{arpa} par vendeur abonné, soit {amount} de MRR des abonnements ajouté chaque mois",
        en: "{arpa} per paid seller, i.e. {amount} of subscription MRR added every month",
      },
      todayChurn: { fr: "{churn} de churn sur {base} vendeurs abonnés", en: "{churn} churn on {base} paid sellers" },
      thenChurn: { fr: "{base} × ({churn} – {target}) = {n} vendeurs abonnés gardés par mois", en: "{base} × ({churn} – {target}) = {n} paid sellers kept a month" },
      thenChurnOne: { fr: "{base} × ({churn} – {target}) = {n} vendeur abonné gardé par mois", en: "{base} × ({churn} – {target}) = {n} paid seller kept a month" },
      timesChurn: {
        fr: "{arpa} par vendeur abonné, soit {amount} de MRR des abonnements préservé chaque mois",
        en: "{arpa} per paid seller, i.e. {amount} of subscription MRR kept every month",
      },
      annual: {
        fr: "Soit {amount} de MRR des abonnements de plus au bout d'un an, churn compris.",
        en: "That's {amount} more subscription MRR after a year, churn included.",
      },
      lessThanOne: { fr: "Moins d'un vendeur abonné de plus par mois.", en: "Less than one more paid seller a month." },
    },
    scenario: {
      intro: {
        fr: "Bouge un ou plusieurs leviers : les abonnements des vendeurs se recalculent, les effets se cumulent. Les leviers des acheteurs sont de leur côté.",
        en: "Move one lever or several: the sellers' subscriptions recompute, and the effects add up. The buyers' levers are on their side.",
      },
      visitors: { fr: "Visiteurs de la page vendeurs", en: "Seller page visitors" },
      signups: { fr: "Vendeurs inscrits", en: "Seller sign-ups" },
      paying: { fr: "Nouveaux vendeurs abonnés", en: "New paid sellers" },
      kpiMrr12: { fr: "MRR des abonnements dans 12 mois", en: "Subscription MRR in 12 months" },
      kpiNewMrr: { fr: "Nouveau MRR des abonnements par mois", en: "New subscription MRR a month" },
      kpiCac: { fr: "Coût d'un vendeur abonné", en: "Cost per paid seller" },
      kpiPayback: { fr: "Payback", en: "Payback" },
      figuresCustomer: { fr: "Un nouveau vendeur abonné", en: "One new paid seller" },
      rowLtvCac: { fr: "LTV:CAC", en: "LTV:CAC" },
      rowGap: { fr: "Par nouveau vendeur abonné", en: "Per new paid seller" },
      assumeLtv: {
        fr: "LTV : la marge mensuelle sur la durée de vie comptée d'un vendeur abonné (1 ÷ churn des vendeurs abonnés, plafonnée à 36 mois), au revenu par vendeur abonné d'aujourd'hui.",
        en: "LTV: the monthly margin over a paid seller's counted lifetime (1 ÷ paid seller churn, capped at 36 months), on today's revenue per paid seller.",
      },
      assumeCash: {
        fr: "Trésorerie immobilisée : la dépense d'acquisition du mois × le payback ÷ 2. La dépense de chaque mois revient régulièrement sur le payback ; le churn, qui la ralentit, n'est pas compté (un plancher). Même dépense avec les « Et si » : plus de vendeurs abonnés rendent chacun moins cher.",
        en: "Cash tied up: the month's acquisition spend × the payback ÷ 2. Each month's spend comes back evenly over the payback; churn, which slows it, is not counted (a floor). The same spend with the what-ifs: more paid sellers make each one cheaper.",
      },
      aloneTitle: {
        fr: "Ce que chaque levier rapporte seul, sur le MRR des abonnements dans 12 mois",
        en: "What each lever brings on its own, on subscription MRR in 12 months",
      },
      legendUnit: {
        fr: "Un rond = 1 % des vendeurs inscrits d'aujourd'hui : au-delà de 100, la grille s'allonge.",
        en: "One dot = 1% of today's seller sign-ups: past 100, the grid grows.",
      },
      perHundredNote: {
        fr: "Sans le nombre de vendeurs inscrits du mois, le funnel se lit pour 100 vendeurs inscrits.",
        en: "Without the month's seller sign-up count, the funnel reads per 100 seller sign-ups.",
      },
      assumption: {
        "signup-same-visitors": {
          fr: "Le taux d'inscription s'applique aux mêmes visiteurs de la page vendeurs qu'aujourd'hui.",
          en: "The seller sign-up rate applies to the same seller page visitors as today.",
        },
        "same-spend": {
          fr: "À dépense égale : plus de vendeurs abonnés font baisser le coût d'un vendeur abonné dans la même proportion.",
          en: "Same spend: more paid sellers lower the cost per paid seller in the same proportion.",
        },
        "twelve-months": {
          fr: "Sur 12 mois, au rythme de ce mois : le MRR des abonnements gardé chaque mois au rythme du churn des vendeurs abonnés, plus le nouveau MRR des abonnements du mois. Ni saisonnalité, ni saturation.",
          en: "Over 12 months, at this month's pace: the subscription MRR kept each month at the paid seller churn's pace, plus the month's new subscription MRR. No seasonality, no saturation.",
        },
      },
    },
    terms: {
      sharedCount: {
        definition: {
          fr: "Un nombre que plusieurs chiffres utilisent, comme les vendeurs inscrits du mois. Saisi une fois : le modifier dans un chiffre le modifie dans les autres, sauf celui qu'il rendrait impossible : il garde sa base, et son écran le dit.",
          en: "A count several numbers use, like the month's seller sign-ups. Typed once: change it in one number and it changes in the others, except one it would make impossible: that one keeps its own base, and its screen says so.",
        },
      },
      arr: {
        term: { fr: "ARR des abonnements", en: "subscription ARR" },
        definition: {
          fr: "Ton revenu annuel, extrapolé de ton revenu mensuel : le MRR des abonnements × 12, comme si rien ne changeait pendant un an. Ce n'est pas un revenu acquis : avec des contrats au mois, des résiliations le font baisser dès le mois suivant.",
          en: "Your annual revenue, extrapolated from your monthly revenue: the subscription MRR × 12, as if nothing changed for a year. It isn't guaranteed revenue: on monthly contracts, cancellations bring it down the very next month.",
        },
      },
      cashTied: {
        definition: {
          fr: "Ce que ton acquisition garde hors de la banque à tout moment. Chaque mois, tu dépenses pour gagner des vendeurs abonnés ; chacun te le rembourse sur la durée du payback. À rythme constant, la moitié de la dépense d'un payback est dehors. Un plancher : le churn ralentit le retour.",
          en: "What your acquisition keeps out of the bank at any time. Each month you spend to win new paid sellers; each of them pays that back over the payback. At a steady pace, half a payback's worth of spend is out. A floor: churn slows the return.",
        },
      },
      afterPayback: {
        definition: {
          fr: "Combien de temps un vendeur abonné continue de rapporter de la marge une fois son coût d'acquisition remboursé : sa durée de vie moins le payback. Sous zéro, il part avant d'avoir remboursé : c'est la perte, dite en mois.",
          en: "How long a paid seller keeps bringing in margin once their acquisition cost is paid back: their lifetime minus the payback. Below zero, they leave before paying back: that is the loss, said in months.",
        },
      },
    },
    visual: {
      cohortOf: { fr: "vendeurs inscrits en {cohort}", en: "{cohort} cohort" },
      upstreamUnknown: { fr: "Visiteurs de la page vendeurs pour 100 vendeurs inscrits : non mesuré", en: "Seller page visitors for 100 seller sign-ups: not measured" },
      tablePerHundred: { fr: "Sur 100 vendeurs inscrits", en: "Out of 100 seller sign-ups" },
    },
    slide: {
      footer: { fr: "Vendeurs inscrits en {cohort} · flux : {month} · sources : {tools}", en: "{cohort} seller sign-ups · {month} flows · sources: {tools}" },
      leakFooterUnpriced: {
        fr: "Sans montant : le moteur ne relie pas ce chiffre au MRR des abonnements",
        en: "No amount: the engine doesn't link this number to subscription MRR",
      },
      unitFloor: { fr: "un plancher", en: "a floor" },
      unitWarnRunway: {
        fr: "Un vendeur abonné met {payback} à rembourser son coût, plus que notre runway ({n}) : nous gagnons de l'argent, mais peut-être après la fin de notre trésorerie.",
        en: "A paid seller takes {payback} to pay back its cost, longer than our runway ({n}): we make money, but maybe after our cash runs out.",
      },
      unitWarnRunwayMaybe: {
        fr: "Un vendeur abonné met {payback} à rembourser son coût : peut-être plus que notre runway ({n}).",
        en: "A paid seller takes {payback} to pay back its cost: maybe longer than our runway ({n}).",
      },
      unitWarnFloor: {
        fr: "Un vendeur abonné met {payback} à rembourser son coût : {n} ou plus. Nous gagnons de l'argent, mais tard.",
        en: "A paid seller takes {payback} to pay back its cost: {n} or more. We make money, but late.",
      },
      unitWarnFloorMaybe: {
        fr: "Un vendeur abonné met {payback} à rembourser son coût : peut-être {n} ou plus.",
        en: "A paid seller takes {payback} to pay back its cost: maybe {n} or more.",
      },
      unitAssume: {
        fr: "Trésorerie immobilisée : la dépense d'acquisition du mois × le payback ÷ 2 — un plancher. La marge est celle des abonnements, jamais celle des commissions.",
        en: "Cash tied up: the month's acquisition spend × the payback ÷ 2 — a floor. The margin is the subscriptions' own, never the commissions'.",
      },
      chartCost: { fr: "ce que coûte un nouveau vendeur abonné", en: "what a new paid seller costs" },
      chartSummaryLoss: {
        fr: "Un vendeur abonné, mois par mois : il rapporte {mm} de marge par mois et part après environ {life}, à {gap} des {cac} qu'il a coûté ; il aurait remboursé à {payback}.",
        en: "One paid seller, month by month: it brings back {mm} of margin a month and leaves after about {life}, {gap} short of the {cac} it cost; it would have paid back at {payback}.",
      },
      chartSummaryHealthy: {
        fr: "Un vendeur abonné, mois par mois : il rapporte {mm} de marge par mois, rembourse ses {cac} à {payback} et reste {life}.",
        en: "One paid seller, month by month: it brings back {mm} of margin a month, pays back its {cac} at {payback} and stays {life}.",
      },
      chartSummaryMaybe: {
        fr: "Un vendeur abonné, mois par mois : il rapporte {mm} de marge par mois et reste {life} ; rembourser ses {cac} prend {payback} : il peut partir avant.",
        en: "One paid seller, month by month: it brings back {mm} of margin a month and stays {life}; paying back its {cac} takes {payback}: it may leave before.",
      },
      chartSummaryNone: {
        fr: "Un vendeur abonné, mois par mois : son coût est connu ({cac}), ce qu'il rapporte non : il manque {input}.",
        en: "One paid seller, month by month: its cost is known ({cac}), what it brings back is not. Missing: {input}.",
      },
    },
    slideTitles: {
      leakClearMrrNew: {
        fr: "Ramener {stage} à {target} vaudrait **{amount} de nouveau MRR des abonnements** chaque mois.",
        en: "Bringing {stage} to {target} would be worth **{amount} of new subscription MRR** every month.",
      },
      leakClearMrrRetained: {
        fr: "Ramener {stage} à {target} vaudrait **{amount} de MRR des abonnements préservé** chaque mois.",
        en: "Bringing {stage} to {target} would be worth **{amount} of retained subscription MRR** every month.",
      },
      leakClearCustomers: {
        fr: "Ramener {stage} à {target} ajouterait **{n} vendeurs abonnés** par mois.",
        en: "Bringing {stage} to {target} would add **{n} paid sellers** a month.",
      },
      leakClearCustomersOne: {
        fr: "Ramener {stage} à {target} ajouterait **{n} vendeur abonné** par mois.",
        en: "Bringing {stage} to {target} would add **{n} paid seller** a month.",
      },
      leakClearKept: {
        fr: "Ramener {stage} à {target} garderait **{n} vendeurs abonnés** de plus par mois.",
        en: "Bringing {stage} to {target} would keep **{n} more paid sellers** a month.",
      },
      leakClearKeptOne: {
        fr: "Ramener {stage} à {target} garderait **{n} vendeur abonné** de plus par mois.",
        en: "Bringing {stage} to {target} would keep **{n} more paid seller** a month.",
      },
      leakClearPerHundred: {
        fr: "Ramener {stage} à {target} ajouterait **{n} vendeurs abonnés pour 100 vendeurs inscrits**.",
        en: "Bringing {stage} to {target} would add **{n} paid sellers per 100 seller sign-ups**.",
      },
      leakClearPerHundredOne: {
        fr: "Ramener {stage} à {target} ajouterait **{n} vendeur abonné pour 100 vendeurs inscrits**.",
        en: "Bringing {stage} to {target} would add **{n} paid seller per 100 seller sign-ups**.",
      },
      unitEconomics: {
        fr: "Un vendeur abonné rembourse son coût d'acquisition en **{m}** et rapporte **{x}** ce qu'il coûte.",
        en: "A paid seller pays back their acquisition cost in **{m}** and brings in **{x}** what they cost.",
      },
      unitEconomicsUnknown: {
        fr: "**On ne peut pas encore dire ce que rapporte un vendeur abonné.** Il manque {input}.",
        en: "**We can't yet say what a paid seller is worth.** Missing: {input}.",
      },
      unitEconomicsLoss: {
        fr: "Chaque nouveau vendeur abonné nous coûte {cac} et en rapporte {ltv} : **on perd {gap} sur chacun**.",
        en: "Each new paid seller costs us {cac} and brings back {ltv}: **we lose {gap} on each one**.",
      },
      whatIfLever: {
        fr: "Si {stage} passait à {to} (aujourd'hui : {from}), le MRR des abonnements dans 12 mois gagnerait **{gain}**.",
        en: "If {stage} went from {from} to {to}, subscription MRR in 12 months would gain **{gain}**.",
      },
      scenario: {
        fr: "Avec les {n} « Et si » ensemble, le MRR des abonnements dans 12 mois gagnerait **{gain}**.",
        en: "With the {n} what-ifs together, subscription MRR in 12 months would gain **{gain}**.",
      },
    },
    notes: {
      source: {
        fr: "D'où vient ce chiffre ? — {metric} : {tool}, vendeurs inscrits en {cohort}.",
        en: "Where does this number come from? — {metric}: {tool}, {cohort} cohort.",
      },
    },
    findings: {
      chainBreak: { fr: "Sur 100 vendeurs inscrits, on ne sait pas dire combien {verb}.", en: "Out of 100 seller sign-ups, we can't say how many {verb}." },
      unitEcon: {
        fr: "Impossible de dire en combien de mois un vendeur abonné rembourse son coût d'acquisition. Il manque {input}.",
        en: "We can't say how many months a paid seller takes to pay back their acquisition cost. Missing: {input}.",
      },
      unitEconLoss: {
        fr: "Chaque nouveau vendeur abonné coûte {cac} et rapporte {ltv} de marge : tu perds {gap} sur chacun.",
        en: "Each new paid seller costs {cac} and brings back {ltv} of margin: you lose {gap} on each one.",
      },
      unitEconLossMaybe: {
        fr: "Un nouveau vendeur abonné coûte {cac} et rapporte {ltv} de marge : il ne rembourse peut-être pas ce qu'il coûte.",
        en: "A new paid seller costs {cac} and brings back {ltv} of margin: it may not pay back what it costs.",
      },
      reconcile: {
        fr: "Ta chaîne prédit ~{p} nouveaux vendeurs abonnés en {month} ; ta facturation en compte {n}. Au moins une définition ne porte pas sur la même population.",
        en: "Your chain predicts ~{p} new paid sellers in {month}; your billing counts {n}. At least one definition doesn't cover the same population.",
      },
      reconcileOne: {
        fr: "Ta chaîne prédit ~{p} nouveau vendeur abonné en {month} ; ta facturation en compte {n}. Au moins une définition ne porte pas sur la même population.",
        en: "Your chain predicts ~{p} new paid seller in {month}; your billing counts {n}. At least one definition doesn't cover the same population.",
      },
      smallCohort: {
        fr: "Moins de 100 vendeurs inscrits dans la cohorte : chaque vendeur inscrit pèse plus d'un point de pourcentage.",
        en: "Fewer than 100 seller sign-ups in the cohort: each one weighs more than a percentage point.",
      },
    },
    sanity: {
      reconcileGap: {
        fr: "Ta chaîne prédit ~{p} nouveaux vendeurs abonnés en {month} ; ta facturation en compte {n}. Au moins une définition ne porte pas sur la même population.",
        en: "Your chain predicts ~{p} new paid sellers in {month}; your billing counts {n}. At least one definition doesn't cover the same population.",
      },
      reconcileGapOne: {
        fr: "Ta chaîne prédit ~{p} nouveau vendeur abonné en {month} ; ta facturation en compte {n}. Au moins une définition ne porte pas sur la même population.",
        en: "Your chain predicts ~{p} new paid seller in {month}; your billing counts {n}. At least one definition doesn't cover the same population.",
      },
    },
    io: {
      sharedCount: {
        cohortSignups: { fr: "vendeurs inscrits de la cohorte suivie", en: "seller sign-ups in the followed cohort" },
        monthSignups: { fr: "vendeurs inscrits du mois", en: "seller sign-ups in the month" },
      },
    },
  },
};
