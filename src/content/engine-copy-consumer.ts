// TODO: à relire — copie neuve (convention 6), §21 (A22 APP-3)
import type { DeepPartialTranslatable } from "@/lib/i18n/translatable";
import type { ENGINE_COPY } from "./engine-copy"; // type only: erased, never a bundle edge

/**
 * engine-copy-consumer.ts — the consumer app's overlay on `ENGINE_COPY` (engine spec §21.8, A22 APP-3): only the
 * leaves whose words change when the engine is an app's, each a whole `{ fr, en }` at the SAME path as in the base.
 * `mergeStrings` (`lib/engine/strings.ts`) lays it over the base in the island, so a screen or a slide reads one tree
 * and never asks which type it is on.
 *
 * Two sources, in the order of `engine-copy.ts`:
 * - the texts of §21.8.4 a, word for word, the agreement leaves (« Activées ») included;
 * - every other leaf the rule of §21.8.3 designates, rewritten from the SaaS string with the lexicon of §21.8.2, the
 *   French typography as the base string had it.
 * A leaf the lexicon cannot rewrite without changing the sense is not here: `APP_OVERLAY_SKIPPED`, in
 * `__tests__/engine-copy-consumer.test.ts`, names it with the reason, and an app shows the SaaS wording there until
 * Antoine rules (A22.d).
 *
 * Server only, like `engine-copy.ts`: the page resolves it with `resolveTree` (a partial tree is fine) and hands the
 * island `typeStrings`; the island never imports this file (`engine-boundary.test.ts`).
 */
export const ENGINE_COPY_CONSUMER: DeepPartialTranslatable<typeof ENGINE_COPY> = {
  setup: {
    referenceMonthHint: {
      fr: "Visiteurs de la fiche, installations, dépense, churn et revenu par abonné de ce mois-là. Par défaut : le dernier mois terminé.",
      en: "Store page visitors, installs, spend, churn and revenue per subscriber for that month. Default: the last full month.",
    },
    cohortHint: {
      fr: "On suit les installations en {cohort} : celles installées en {next} n'ont pas encore eu {n} jours.",
      en: "We follow the installs from {cohort}: those from {next} haven't had {n} days yet.",
    },
  },
  board: {
    pelotonTitle: { fr: "Pour 100 installations", en: "Per 100 installs" },
    smallCohort: {
      fr: "Petits effectifs : moins de 100 installations dans cette cohorte. Lis la direction, pas les décimales.",
      en: "Small numbers: fewer than 100 installs in this cohort. Read the direction, not the decimals.",
    },
  },
  lever: {
    arr12: { fr: "Revenu annualisé dans 12 mois", en: "Annualised revenue in 12 months" },
    curveSummary: {
      fr: "Le revenu mois par mois, de {start} aujourd'hui à {today} dans 12 mois au rythme actuel.",
      en: "Revenue month by month, from {start} today to {today} in 12 months at today's pace.",
    },
    curveSummaryWhatif: {
      fr: "Le revenu mois par mois, depuis {start} aujourd'hui : {today} dans 12 mois au rythme actuel, {whatif} {key}.",
      en: "The revenue month by month, from {start} today: {today} in 12 months at today's pace, {whatif} {key}.",
    },
    worthOut: {
      fr: "Une installation : plus de perte. Elle rapporte {ltv} pour {cac} : {gap} de plus.",
      en: "One install: no longer a loss. It brings back {ltv} for {cac}: {gap} more.",
    },
    worthMaybe: {
      fr: "Une installation : plus de perte certaine. Elle rapporte {ltv} pour {cac} : les deux fourchettes se chevauchent.",
      en: "One install: no longer a certain loss. It brings back {ltv} for {cac}: the two ranges overlap.",
    },
    worthLess: {
      fr: "Une installation : toujours une perte, de {gap} au lieu de {before}.",
      en: "One install: still a loss, of {gap} instead of {before}.",
    },
    worthStill: {
      fr: "Une installation : toujours une perte de {gap}. Ce levier ne change ni ce que rapporte une installation ni ce qu'elle coûte.",
      en: "One install: still a loss of {gap}. This lever changes neither what an install brings back nor what it costs.",
    },
    worthStillMany: {
      fr: "Une installation : toujours une perte de {gap}. Tes « Et si » ne changent ni ce que rapporte une installation ni ce qu'elle coûte.",
      en: "One install: still a loss of {gap}. Your what-ifs change neither what an install brings back nor what it costs.",
    },
  },
  money: {
    mrr: { fr: "Revenu du mois", en: "Revenue this month" },
    arr: { fr: "Revenu annualisé, le revenu du mois × 12", en: "Annualised revenue, the month's revenue × 12" },
    worthTitle: { fr: "Ce que vaut une installation", en: "What an install is worth" },
    healthy: {
      fr: "Chaque installation coûte {cac} et rapporte {ltv} de marge en 36 mois : {gap} de plus que ce qu'elle coûte.",
      en: "Each install costs {cac} and brings back {ltv} of margin over 36 months: {gap} more than it costs.",
    },
    noLtv: {
      fr: "On ne peut pas encore dire ce que rapporte une installation : il manque {input}.",
      en: "We can't yet say what an install brings back: {input} is missing.",
    },
    noCac: {
      fr: "Une installation rapporte {ltv} de marge en 36 mois ; ce qu'elle coûte, on ne le sait pas encore : il manque {input}.",
      en: "An install brings back {ltv} of margin over 36 months; what it costs, we don't know yet: {input} is missing.",
    },
    noMarginNote: {
      fr: "Sans elle, ni valeur d'une installation ni remboursement : calculés sur le chiffre d'affaires, ils flatteraient ton app.",
      en: "Without it, no install value and no payback: computed on revenue, they would flatter your app.",
    },
    warnRunway: {
      fr: "Une installation met {payback} à rembourser son coût, plus que ton runway ({n}) : tu gagnes de l'argent, mais peut-être après la fin de ta trésorerie.",
      en: "An install takes {payback} to pay back its cost, longer than your runway ({n}): you make money, but maybe after your cash runs out.",
    },
    warnRunwayMaybe: {
      fr: "Une installation met {payback} à rembourser son coût : peut-être plus que ton runway ({n}).",
      en: "An install takes {payback} to pay back its cost: maybe longer than your runway ({n}).",
    },
    warnFloor: {
      fr: "Une installation met {payback} à rembourser son coût : {n} ou plus. Tu gagnes de l'argent, mais tard. Saisis ton runway dans les Réglages pour y comparer ce remboursement.",
      en: "An install takes {payback} to pay back its cost: {n} or more. You make money, but late. Enter your runway in the Settings to compare this payback with it.",
    },
    warnFloorMaybe: {
      fr: "Une installation met {payback} à rembourser son coût : peut-être {n} ou plus. Saisis ton runway dans les Réglages pour y comparer ce remboursement.",
      en: "An install takes {payback} to pay back its cost: maybe {n} or more. Enter your runway in the Settings to compare this payback with it.",
    },
  },
  subject: {
    "acq.signup-rate": { fr: "le taux d'installation", en: "the install rate" },
    "rev.paid-conversion": { fr: "la conversion en abonné", en: "subscriber conversion" },
    "ref.referred-share": { fr: "la part des installations recommandées", en: "the referred share of installs" },
  },
  unitInput: {
    "acq.cac": { fr: "le coût par installation", en: "cost per install" },
    "rev.arpa": { fr: "le revenu mensuel par abonné", en: "monthly revenue per subscriber" },
  },
  worth: {
    newMrr: { fr: "{amount} de revenu nouveau par mois", en: "{amount} of new revenue a month" },
    retainedMrr: { fr: "{amount} de revenu préservé par mois", en: "{amount} of retained revenue a month" },
    customers: { fr: "{n} abonnés payants de plus par mois", en: "{n} more paying subscribers a month" },
    customersOne: { fr: "{n} abonné payant de plus par mois", en: "{n} more paying subscriber a month" },
    kept: { fr: "{n} abonnés gardés par mois", en: "{n} subscribers kept a month" },
    keptOne: { fr: "{n} abonné gardé par mois", en: "{n} subscriber kept a month" },
    perHundred: { fr: "{n} abonnés de plus pour 100 installations", en: "{n} more paying subscribers per 100 installs" },
    perHundredOne: { fr: "{n} abonné de plus pour 100 installations", en: "{n} more paying subscriber per 100 installs" },
    lessThanOne: { fr: "moins d'un abonné de plus par mois", en: "less than one more subscriber a month" },
  },
  sheet: {
    cohortToUse: {
      fr: "Prends les installations en {cohort} : celles installées en {next} n'ont pas encore eu {n} jours.",
      en: "Use the installs from {cohort}: those from {next} haven't had {n} days yet.",
    },
  },
  whatIf: {
    times: { fr: "× revenu par abonné", en: "× revenue per subscriber" },
    todayFlow: { fr: "{rate}, soit {n} nouveaux abonnés par mois", en: "{rate}, i.e. {n} new subscribers a month" },
    todayFlowOne: { fr: "{rate}, soit {n} nouvel abonné par mois", en: "{rate}, i.e. {n} new subscriber a month" },
    todayPerHundred: { fr: "{rate}, soit {n} abonnés pour 100 installations", en: "{rate}, i.e. {n} subscribers per 100 installs" },
    todayPerHundredOne: { fr: "{rate}, soit {n} abonné pour 100 installations", en: "{rate}, i.e. {n} subscriber per 100 installs" },
    timesFlow: {
      fr: "{arpa} par abonné, soit {amount} d'abonnements ajoutés chaque mois",
      en: "{arpa} per subscriber, i.e. {amount} of subscriptions added every month",
    },
    todayChurn: { fr: "{churn} de churn sur {base} abonnés payants", en: "{churn} churn on {base} paying subscribers" },
    thenChurn: {
      fr: "{base} × ({churn} – {target}) = {n} abonnés gardés par mois",
      en: "{base} × ({churn} – {target}) = {n} subscribers kept a month",
    },
    thenChurnOne: {
      fr: "{base} × ({churn} – {target}) = {n} abonné gardé par mois",
      en: "{base} × ({churn} – {target}) = {n} subscriber kept a month",
    },
    timesChurn: {
      fr: "{arpa} par abonné, soit {amount} d'abonnements préservés chaque mois",
      en: "{arpa} per subscriber, i.e. {amount} of subscriptions kept every month",
    },
    annual: {
      fr: "Soit {amount} de revenu de plus au bout d'un an, churn compris.",
      en: "That's {amount} more revenue after a year, churn included.",
    },
    lessThanOne: { fr: "Moins d'un abonné de plus par mois.", en: "Less than one more subscriber a month." },
  },
  leverSubject: {
    "acq.signup-rate": { fr: "le taux d'installation", en: "the install rate" },
    "ref.referred-share": { fr: "la part des installations recommandées", en: "the referred share of installs" },
    "rev.paid-conversion": { fr: "la conversion en abonné", en: "subscriber conversion" },
    "rev.arpa": { fr: "le revenu par abonné des nouveaux abonnés", en: "new subscribers' revenue per subscriber" },
  },
  scenario: {
    visitors: { fr: "Visiteurs de la fiche", en: "Store page visitors" },
    signups: { fr: "Installations", en: "Installs" },
    referred: { fr: "dont recommandées", en: "of which referred" },
    activated: { fr: "Activées", en: "Activated" },
    d30: { fr: "Actives à J30", en: "Active at day 30" },
    paying: { fr: "Nouveaux abonnés", en: "New subscribers" },
    kpiMrr12: { fr: "Revenu dans 12 mois", en: "Revenue in 12 months" },
    kpiNewMrr: { fr: "Nouveau revenu par mois", en: "New revenue a month" },
    kpiNrr: { fr: "NRR mensuelle des abonnements", en: "Subscriptions' monthly NRR" },
    kpiGrr: { fr: "GRR mensuelle des abonnements", en: "Subscriptions' monthly GRR" },
    kpiCac: { fr: "Coût par installation", en: "Cost per install" },
    kpiLtv: { fr: "Valeur sur 36 mois", en: "36-month value" },
    kpiPayback: { fr: "Remboursement d'une installation", en: "Install payback" },
    figuresCustomer: { fr: "Une installation", en: "One install" },
    rowLtvCac: { fr: "Valeur sur 12 mois ÷ coût", en: "12-month value ÷ cost" },
    rowGap: { fr: "Par installation, sur 36 mois", en: "Per install, over 36 months" },
    aloneTitle: {
      fr: "Ce que chaque levier rapporte seul, sur le revenu dans 12 mois",
      en: "What each lever brings alone, on revenue in 12 months",
    },
    legendUnit: {
      fr: "Un rond = 1 % des installations d'aujourd'hui : au-delà de 100, la grille s'allonge.",
      en: "One dot = 1% of today's installs: past 100, the grid grows.",
    },
    perHundredNote: {
      fr: "Sans le nombre d'installations du mois, le funnel se lit pour 100 installations.",
      en: "Without the month's install count, the funnel reads per 100 installs.",
    },
    assumption: {
      "signup-same-visitors": {
        fr: "Le taux d'installation s'applique aux mêmes visiteurs de la fiche qu'aujourd'hui.",
        en: "The install rate applies to the same store page visitors as today.",
      },
      "activation-drives-downstream": {
        fr: "Les installations actives à J30 et celles qui s'abonnent font partie des installations activées : elles suivent l'activation dans la même proportion, sans jamais la dépasser.",
        en: "Installs active at day 30 and those that subscribe are among the activated installs: they follow activation in the same proportion, never above it.",
      },
      "d30-drives-paying": {
        fr: "Quand la rétention à J30 bouge, ce sont les actifs à J30 que les abonnés suivent : ils en font partie, sans jamais dépasser leur nombre.",
        en: "When day-30 retention moves, paying subscribers follow those active at day 30: they are among them, never more than them.",
      },
      "arpa-new-customers": {
        fr: "Le nouveau revenu par abonné s'applique aux nouveaux abonnés ; les abonnements déjà là gardent leur prix.",
        en: "The new revenue per subscriber applies to new subscribers; the subscriptions already there keep their price.",
      },
      "churn-as-revenue": {
        fr: "Le churn des abonnés tient lieu de churn en revenu, comme si les abonnés partis payaient le revenu moyen.",
        en: "Subscriber churn stands in for revenue churn, as if the subscribers who left paid the average revenue.",
      },
      "twelve-months": {
        fr: "Sur 12 mois, au rythme de ce mois : les abonnements gardés à leur NRR chaque mois, plus les nouveaux abonnements du mois. Ni saisonnalité, ni saturation.",
        en: "Over 12 months, at this month's pace: the subscriptions kept at their NRR each month, plus the month's new subscriptions. No seasonality, no saturation.",
      },
    },
  },
  peloton: {
    upstream: {
      fr: "~{n} visiteurs de la fiche pour 100 installations · {source} · {month}",
      en: "~{n} store page visitors per 100 installs · {source} · {month}",
    },
    signups: { fr: "Installations", en: "Installs" },
    activated: { fr: "Activées", en: "Activated" },
    d30: { fr: "Actives à J30", en: "Active at day 30" },
    paid: { fr: "Abonnées à J{n}", en: "Subscribed by day {n}" },
    legendReferred: { fr: "venues par recommandation ({n})", en: "came through a referral ({n})" },
    sameHundred: {
      fr: "Tes installations en {cohort} sont ramenées à 100 pour se lire en pourcentages : chaque colonne est comptée sur ces mêmes 100.",
      en: "Your {cohort} installs are scaled to 100 so they read as percentages: every column is counted on those same 100.",
    },
    sameHundredCount: {
      fr: "Tes {n} installations en {cohort} sont ramenées à 100 pour se lire en pourcentages : chaque colonne est comptée sur ces mêmes 100. Pour changer ce nombre, change tes installations de la cohorte, pas le 100.",
      en: "Your {n} installs from {cohort} are scaled to 100 so they read as percentages: every column is counted on those same 100. To change that number, change your cohort's installs, not the 100.",
    },
    slideSameHundred: {
      fr: "Chaque colonne est comptée sur les mêmes 100 installations.",
      en: "Every column is counted on the same 100 installs.",
    },
    cohortOfCount: { fr: "{n} installations en {cohort}, ramenées à 100", en: "{n} installs in {cohort}, scaled to 100" },
    aria: {
      fr: "{n} sur 100 installations {population} — {status}, {source}, installations en {cohort}",
      en: "{n} in 100 installs {population} — {status}, {source}, {cohort} cohort",
    },
    unmeasured: {
      paid: { fr: "la conversion en abonné", en: "subscriber conversion" },
    },
  },
  terms: {
    cohort: {
      definition: {
        fr: "Les installations d'un même mois, suivies sur les jours qui suivent. L'activation et le paiement se lisent sur une cohorte assez ancienne pour que chacune de ses installations ait eu toute la fenêtre : la cohorte suivie, dans les Réglages.",
        en: "The installs of one month, followed over the days after. Activation and payment are read on a cohort old enough for every install to have had the whole window: the cohort you follow, in Settings.",
      },
    },
    window: {
      definition: {
        fr: "Le nombre de jours qu'a une installation pour qu'une action compte : s'activer en 7 jours, payer en 30. Elle se règle dans Réglages.",
        en: "How many days an install has for an action to count: activate within 7 days, pay within 30. Change it in Settings.",
      },
    },
    sharedCount: {
      definition: {
        fr: "Un nombre que plusieurs chiffres utilisent, comme les installations du mois. Saisi une fois : le modifier dans un chiffre le modifie dans les autres, sauf celui qu'il rendrait impossible : il garde sa base, et son écran le dit.",
        en: "A count several numbers use, like the month's installs. Typed once: change it in one number and it changes in the others, except one it would make impossible: that one keeps its own base, and its screen says so.",
      },
    },
    arr: {
      term: { fr: "revenu annualisé", en: "annualised revenue" },
      definition: {
        fr: "Ton revenu annuel, extrapolé de ton revenu mensuel : le revenu × 12, comme si rien ne changeait pendant un an. Ce n'est pas un revenu acquis : avec des contrats au mois, des résiliations le font baisser dès le mois suivant.",
        en: "Your annual revenue, extrapolated from your monthly revenue: the revenue × 12, as if nothing changed for a year. It isn't guaranteed revenue: on monthly contracts, cancellations bring it down the very next month.",
      },
    },
    runway: {
      definition: {
        fr: "Tes mois de trésorerie : le nombre de mois que couvre ta trésorerie au rythme actuel des dépenses. Facultatif : le moteur le compare seulement au remboursement, pour te prévenir. Il reste sur cet appareil.",
        en: "Your months of cash: how many months your cash lasts at today's spending. Optional: the engine only compares it with the payback, to warn you. It stays on this device.",
      },
    },
  },
  visual: {
    cohortOf: { fr: "installations en {cohort}", en: "{cohort} cohort" },
    upstreamUnknown: {
      fr: "Visiteurs de la fiche pour 100 installations : non mesuré",
      en: "Store page visitors for 100 installs: not measured",
    },
    tablePerHundred: { fr: "Sur 100 installations", en: "Out of 100 installs" },
  },
  slide: {
    footer: {
      fr: "Installations en {cohort} · flux : {month} · sources : {tools}",
      en: "{cohort} installs · {month} flows · sources: {tools}",
    },
    leakAssumption: { fr: "les abonnés sont supposés parmi les activées", en: "paying subscribers are assumed to be among the activated" },
    plgLeakAssumption: {
      "ret.d30": {
        fr: "les abonnés sont supposés parmi les installations encore actives à J30",
        en: "subscribers are assumed to be among the installs still active at day 30",
      },
      "ref.referred-share": {
        fr: "les installations recommandées s'ajoutent aux autres et convertissent comme elles",
        en: "referred installs come on top of the others and convert like them",
      },
    },
    leakFooterUnpriced: {
      fr: "Sans montant : le moteur ne relie pas ce chiffre au revenu",
      en: "No amount: the engine doesn't link this number to revenue",
    },
    unitRetention: {
      fr: "GRR {grr} · NRR {nrr} des abonnements par mois — approximatives : le churn des abonnés tient lieu de churn en revenu, comme si les abonnés partis payaient le revenu moyen.",
      en: "Subscriptions' monthly GRR {grr} · NRR {nrr} — approximate: subscriber churn stands in for revenue churn, as if the subscribers who left paid the average revenue.",
    },
    unitWarnRunway: {
      fr: "Une installation met {payback} à rembourser son coût, plus que notre runway ({n}) : nous gagnons de l'argent, mais peut-être après la fin de notre trésorerie.",
      en: "An install takes {payback} to pay back its cost, longer than our runway ({n}): we make money, but maybe after our cash runs out.",
    },
    unitWarnRunwayMaybe: {
      fr: "Une installation met {payback} à rembourser son coût : peut-être plus que notre runway ({n}).",
      en: "An install takes {payback} to pay back its cost: maybe longer than our runway ({n}).",
    },
    unitWarnFloor: {
      fr: "Une installation met {payback} à rembourser son coût : {n} ou plus. Nous gagnons de l'argent, mais tard.",
      en: "An install takes {payback} to pay back its cost: {n} or more. We make money, but late.",
    },
    unitWarnFloorMaybe: {
      fr: "Une installation met {payback} à rembourser son coût : peut-être {n} ou plus.",
      en: "An install takes {payback} to pay back its cost: maybe {n} or more.",
    },
    chartCost: { fr: "ce que coûte une installation", en: "what an install costs" },
  },
  slideTitles: {
    pelotonComplete: {
      fr: "Sur 100 installations, {activated}, {d30} et **{paid}**.",
      en: "Out of 100 installs, {activated}, {d30} and **{paid}**.",
    },
    pelotonGap: {
      fr: "Sur 100 installations, {clauses}. **Entre les deux, on ne voit rien : {stages} ne sont pas mesurées.**",
      en: "Out of 100 installs, {clauses}. **In between, we see nothing: {stages} aren't measured.**",
    },
    pelotonGapOne: {
      fr: "Sur 100 installations, {clauses}. **Entre les deux, on ne voit rien : {stages} n'est pas mesurée.**",
      en: "Out of 100 installs, {clauses}. **In between, we see nothing: {stages} isn't measured.**",
    },
    pelotonTailBreak: {
      fr: "Sur 100 installations, {clauses}. **Au-delà, on ne sait pas les suivre : {stages} ne sont pas mesurées.**",
      en: "Out of 100 installs, {clauses}. **Beyond that, we can't follow them: {stages} aren't measured.**",
    },
    pelotonTailBreakOne: {
      fr: "Sur 100 installations, {clauses}. **Au-delà, on ne sait pas les suivre : {stages} n'est pas mesurée.**",
      en: "Out of 100 installs, {clauses}. **Beyond that, we can't follow them: {stages} isn't measured.**",
    },
    pelotonEmpty: {
      fr: "**On ne sait pas encore suivre 100 installations jusqu'au paiement.**",
      en: "**We can't yet follow 100 installs all the way to payment.**",
    },
    leakClearMrrNew: {
      fr: "Ramener {stage} à {target} vaudrait **{amount} de revenu nouveau** chaque mois.",
      en: "Bringing {stage} to {target} would be worth **{amount} of new revenue** every month.",
    },
    leakClearMrrRetained: {
      fr: "Ramener {stage} à {target} vaudrait **{amount} de revenu préservé** chaque mois.",
      en: "Bringing {stage} to {target} would be worth **{amount} of retained revenue** every month.",
    },
    leakClearCustomers: {
      fr: "Ramener {stage} à {target} ajouterait **{n} abonnés payants** par mois.",
      en: "Bringing {stage} to {target} would add **{n} paying subscribers** a month.",
    },
    leakClearCustomersOne: {
      fr: "Ramener {stage} à {target} ajouterait **{n} abonné payant** par mois.",
      en: "Bringing {stage} to {target} would add **{n} paying subscriber** a month.",
    },
    leakClearKept: {
      fr: "Ramener {stage} à {target} garderait **{n} abonnés payants** de plus par mois.",
      en: "Bringing {stage} to {target} would keep **{n} more paying subscribers** a month.",
    },
    leakClearKeptOne: {
      fr: "Ramener {stage} à {target} garderait **{n} abonné payant** de plus par mois.",
      en: "Bringing {stage} to {target} would keep **{n} more paying subscriber** a month.",
    },
    leakClearPerHundred: {
      fr: "Ramener {stage} à {target} ajouterait **{n} abonnés pour 100 installations**.",
      en: "Bringing {stage} to {target} would add **{n} subscribers per 100 installs**.",
    },
    leakClearPerHundredOne: {
      fr: "Ramener {stage} à {target} ajouterait **{n} abonné pour 100 installations**.",
      en: "Bringing {stage} to {target} would add **{n} subscriber per 100 installs**.",
    },
    unitEconomics: {
      fr: "Une installation rembourse son coût en **{m}** et rapporte **{x}** ce qu'elle coûte en un an.",
      en: "An install pays back its cost in **{m}** and brings in **{x}** what it costs within a year.",
    },
    unitEconomicsUnknown: {
      fr: "**On ne peut pas encore dire ce que rapporte une installation.** Il manque {input}.",
      en: "**We can't yet say what an install is worth.** Missing: {input}.",
    },
    unitEconomicsLoss: {
      fr: "Chaque installation nous coûte {cac} et en rapporte {ltv} en 36 mois : **on perd {gap} sur chacune**.",
      en: "Each install costs us {cac} and brings back {ltv} over 36 months: **we lose {gap} on each one**.",
    },
    whatIfLever: {
      fr: "Si {stage} passait à {to} (aujourd'hui : {from}), le revenu dans 12 mois gagnerait **{gain}**.",
      en: "If {stage} went to {to} (today: {from}), revenue in 12 months would gain **{gain}**.",
    },
    scenario: {
      fr: "Avec les {n} « Et si » ensemble, le revenu dans 12 mois gagnerait **{gain}**.",
      en: "With the {n} what-ifs together, revenue in 12 months would gain **{gain}**.",
    },
  },
  notes: {
    source: {
      fr: "D'où vient ce chiffre ? — {metric} : {tool}, installations en {cohort}.",
      en: "Where does this number come from? — {metric}: {tool}, {cohort} cohort.",
    },
  },
  findings: {
    chainBreak: {
      fr: "Sur 100 installations, on ne sait pas dire combien {verb}.",
      en: "Out of 100 installs, we can't say how many {verb}.",
    },
    unitEcon: {
      fr: "Impossible de dire en combien de mois une installation rembourse son coût d'acquisition. Il manque {input}.",
      en: "We can't say how many months an install takes to pay back its acquisition cost. Missing: {input}.",
    },
    unitEconLoss: {
      fr: "Chaque installation coûte {cac} et rapporte {ltv} de marge en 36 mois : tu perds {gap} sur chacune.",
      en: "Each install costs {cac} and brings back {ltv} of margin over 36 months: you lose {gap} on each one.",
    },
    unitEconLossMaybe: {
      fr: "Une installation coûte {cac} et rapporte {ltv} de marge en 36 mois : elle ne rembourse peut-être pas ce qu'elle coûte.",
      en: "An install costs {cac} and brings back {ltv} of margin over 36 months: it may not pay back what it costs.",
    },
    smallCohort: {
      fr: "Moins de 100 installations dans la cohorte : chaque installation pèse plus d'un point de pourcentage.",
      en: "Fewer than 100 installs in the cohort: each one weighs more than a percentage point.",
    },
  },
  sanity: {
    paidGtRetained: {
      fr: "Plus d'abonnés que d'actifs à J30 : paiement annuel d'avance, ou définition d'« actif » trop étroite ?",
      en: "More paying subscribers than users active at day 30: annual prepayment, or a definition of \"active\" that's too narrow?",
    },
  },
  settings: {
    paidReset: {
      fr: "La fenêtre de paiement fait partie de la définition de la conversion en abonné : ton chiffre déjà saisi repassera « à faire », pour que tu le remesures sur {n} jours.",
      en: "The payment window is part of the subscriber conversion's definition: the number you already entered will go back to \"to do\", so you can measure it again over {n} days.",
    },
    windowHint: {
      fr: "La fenêtre : le nombre de jours qu'a une installation pour que ça compte.",
      en: "The window: how many days an install has for it to count.",
    },
    runwayHint: {
      fr: "Sert seulement à te prévenir quand une installation met plus longtemps à rembourser son coût.",
      en: "Only used to warn you when an install takes longer to pay back its cost.",
    },
  },
  io: {
    sharedCount: {
      cohortSignups: { fr: "installations de la cohorte suivie", en: "installs in the followed cohort" },
      monthSignups: { fr: "installations du mois", en: "installs in the month" },
    },
  },
};
