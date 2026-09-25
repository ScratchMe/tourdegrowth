// TODO: à relire — copie neuve (convention 6), rédigée par la session de code
import type { Translatable } from "@/lib/i18n/translatable";
import type { Pillar } from "@/lib/scoring/pillars";
import type { CandidateId, SlideTitleKey, ToolId } from "@/lib/engine/types";

/**
 * engine-copy.ts — every interface string of the growth engine (engine spec
 * §14): the page, the setup card, the board, the drawer and sheet, triage,
 * requests, diagnosis, "what if", peloton, mirror, the slide screen and the
 * slides' chrome and titles, findings, sanity checks, storage, FAQ.
 *
 * Server only. The page resolves it once with `resolveTree(ENGINE_COPY,
 * locale)` and hands the island an `EngineStrings` object — the island never
 * imports this file, and `engine-boundary.test.ts` walks its imports to keep
 * it that way. Content fan-in: this module is reached by that one page only.
 *
 * **TODO: à relire — copie neuve (convention 6), rédigée par la session de
 * code.** First draft of the content PR (P3). Nothing here is approved: the
 * whole file goes to bon à tirer nº6, rebuilt from `grep -rn "TODO: à
 * relire" src/`.
 *
 * Voice: the copy review's entry copy (§4.3) and its terminology sheet (§2).
 * « tu » on screen; « nous » / « on » on a slide, which the user presents to
 * their leadership meeting (so nothing that reaches a slide says « ta
 * cible »). « Étape » for the reader, never « pilier ». The engine is never
 * called a « diagnostic » — the word belongs to the Tour. « CODIR » in
 * French, "leadership meeting" in English. Arrow CTAs are imperatives with
 * « ton » / "your".
 *
 * Conventions the templates follow, so their consumers can rely on them
 * (each one is a test in `content/__tests__/engine-copy.test.ts`):
 * - `{name}` placeholders are filled with values ALREADY formatted by
 *   `lib/engine/format.ts` — a template never formats a number itself; the
 *   same placeholders exist in both languages;
 * - `**…**` marks the red accent of a slide title: balanced, at most two;
 * - grammatical number is a separate key: `xOne` is the singular form, `x`
 *   the general one (`coverage.found` / `coverage.foundOne`); where no `One`
 *   key exists, the wording is built so a count of 1 reads right
 *   (« trouvés : 1 »);
 * - a metric's catalogue NAME (capitalised, no article: « Marge brute ») is
 *   only ever used as a label — after a colon or in parentheses — so French
 *   never has to agree with it; inside a sentence the templates take a
 *   `subject` phrase (« l'activation ») or a peloton `unmeasured` phrase,
 *   both written with their article;
 * - French never writes « de {month} » / « de {cohort} »: a month may start
 *   with a vowel (avril, août, octobre) and a template cannot elide;
 * - glyphs that can reach a slide stay inside the three fonts' coverage
 *   (§10.4): no arrow, no "≈", no minus sign U+2212, no superscript. Screen
 *   CTAs keep their "→" like everywhere else on the site.
 */

export const ENGINE_COPY = {
  meta: {
    title: { fr: "Modèle de funnel AARRR — tes chiffres, en local", en: "AARRR funnel template — your numbers, kept local" },
    description: {
      fr: "Entre les chiffres de tes cinq étapes AARRR, vois où tu perds le plus de monde et exporte des slides pour ton CODIR. Rien n'est envoyé.",
      en: "Enter the numbers for your five AARRR stages, see where you lose the most people and export slides for your leadership meeting. Nothing is sent.",
    },
    breadcrumb: { fr: "Moteur de croissance", en: "Growth engine" },
  },

  page: {
    eyebrow: { fr: "Le moteur", en: "The engine" },
    title: { fr: "Ton moteur de croissance", en: "Your growth engine" },
    positioning: {
      fr: "Ton Tour dit si tu mesures. Le moteur montre ce que disent tes chiffres.",
      en: "Your Tour tells you whether you measure. The engine shows what your numbers say.",
    },
    promise: {
      fr: "Quinze chiffres, trois par étape : va les chercher, vois où ton moteur perd du monde et repars avec des slides prêtes pour ton CODIR. Tes chiffres ne sont comparés qu'à toi-même et à ta propre cible, sauf deux repères publiés que la page nomme.",
      en: "Fifteen numbers, three per stage: go and get them, see where your engine loses people, and leave with slides ready for your leadership meeting. Your numbers are only compared with yourself and your own target, apart from two published references the page names.",
    },
    privacyTitle: { fr: "Rien de ce que tu saisis ne sort d'ici", en: "Nothing you enter leaves this page" },
    privacyBody: {
      fr: "Aucun chiffre ni aucun texte que tu saisis ne quitte ton navigateur. Pas de compte, pas de serveur : tout reste sur cet appareil, et tu peux le vérifier dans l'onglet Réseau de ton navigateur. La page compte ses visites, sans cookie — jamais ce que tu y écris.",
      en: "No number and no text you enter leaves your browser. No account, no server: everything stays on this device, and you can check it in your browser's Network tab. The page counts its visits, without cookies — never what you type.",
    },
    cta: { fr: "Entre tes chiffres →", en: "Enter your numbers →" },
    ctaNote: { fr: "Gratuit, sans compte. Tout reste sur ton appareil.", en: "Free, no sign-up. Everything stays on your device." },
    tourFirst: { fr: "Démarre ton Tour d'abord (3 min)", en: "Start your Tour first (3 min)" },
    noscript: {
      fr: "Le moteur a besoin de JavaScript pour enregistrer tes chiffres. La liste des quinze chiffres, plus bas, se lit sans.",
      en: "The engine needs JavaScript to save your numbers. The list of fifteen numbers, further down, reads without it.",
    },
    catalogueTitle: { fr: "Les quinze chiffres", en: "The fifteen numbers" },
    catalogueIntro: {
      fr: "Trois par étape, comme les trois questions du Tour. Pour chacun : sa formule, où le trouver, et le piège à connaître avant de le citer.",
      en: "Three per stage, like the Tour's three questions. For each: its formula, where to find it, and the trap to know before quoting it.",
    },
    catalogueComputedTitle: { fr: "Et trois chiffres calculés", en: "And three computed numbers" },
    catalogueVerified: { fr: "Recettes relues en {month}.", en: "Recipes checked in {month}." },
    /**
     * What the static list prints in the catalogue's placeholders, before the
     * reader has set anything up. Words, not sample values: a made-up « août »
     * on a public page would read as a fact.
     */
    catalogueFill: {
      month: { fr: "le mois", en: "the month" },
      cohort: { fr: "la cohorte", en: "the cohort" },
      n: { fr: "N", en: "N" },
      event: { fr: "l'événement d'activation", en: "the activation event" },
      variant: { fr: "variante choisie", en: "chosen variant" },
    },
    faqTitle: { fr: "Questions fréquentes", en: "Frequently asked questions" },
  },

  setup: {
    title: { fr: "Avant de commencer", en: "Before you start" },
    model: { fr: "Ton modèle", en: "Your model" },
    models: {
      selfserve: { fr: "SaaS ou produit web en libre-service (essai ou freemium)", en: "SaaS or web product, self-serve (trial or freemium)" },
      salesLed: { fr: "B2B avec une équipe commerciale", en: "B2B with a sales team" },
      consumerApp: { fr: "App grand public", en: "Consumer app" },
      marketplace: { fr: "Place de marché", en: "Marketplace" },
    },
    modelSoon: {
      fr: "Bientôt — leur funnel n'a pas la même forme.",
      en: "Coming soon — their funnel has a different shape.",
    },
    referenceMonth: { fr: "Mois des flux", en: "Month for flows" },
    referenceMonthHint: {
      fr: "Visiteurs, inscriptions, dépense, churn et ARPA de ce mois-là. Par défaut : le dernier mois terminé.",
      en: "Visitors, sign-ups, spend, churn and ARPA for that month. Default: the last full month.",
    },
    cohortMonth: { fr: "Cohorte suivie", en: "Cohort you follow" },
    cohortHint: {
      fr: "On suit les inscrits en {cohort} : ceux inscrits en {next} n'ont pas encore eu {n} jours.",
      en: "We follow the sign-ups from {cohort}: those from {next} haven't had {n} days yet.",
    },
    currency: { fr: "Devise", en: "Currency" },
    activationWindow: { fr: "Fenêtre d'activation", en: "Activation window" },
    paidWindow: { fr: "Fenêtre de paiement", en: "Payment window" },
    windowDays: { fr: "{n} jours", en: "{n} days" },
    companyLabel: { fr: "Nom affiché sur les slides (facultatif)", en: "Name shown on the slides (optional)" },
    companyHint: { fr: "Il reste sur cet appareil, comme le reste.", en: "It stays on this device, like everything else." },
    tourFound: {
      fr: "Tu as fait le Tour le {date} ({score}/100). On comparera ce que tu y as déclaré à ce que tu retrouves ici — on le lit, on ne le copie pas.",
      en: "You took the Tour on {date} ({score}/100). We'll compare what you declared there with what you find here — we read it, we don't copy it.",
    },
    tourLink: { fr: "Comparer avec ce Tour", en: "Compare with that Tour" },
    start: { fr: "Lance ton moteur →", en: "Start your engine →" },
  },

  board: {
    eyebrow: {
      fr: "Ton moteur de croissance · {model} · cohorte : {cohort} · flux : {month}",
      en: "Your growth engine · {model} · {cohort} cohort · {month} flows",
    },
    tabEngine: { fr: "Le moteur", en: "The engine" },
    tabCollect: { fr: "À aller chercher ({n})", en: "To go and get ({n})" },
    smallCohort: {
      fr: "Petits effectifs : moins de 100 inscrits dans cette cohorte. Lis la direction, pas les décimales.",
      en: "Small numbers: fewer than 100 sign-ups in this cohort. Read the direction, not the decimals.",
    },
    stageRowOpen: { fr: "Ouvrir l'étape {stage}", en: "Open the {stage} stage" },
    pillsSummary: {
      fr: "trouvés : {found} · introuvables : {missing} · en cours : {inProgress}",
      en: "found: {found} · missing: {missing} · in progress: {inProgress}",
    },
    toFill: { fr: "à renseigner", en: "to fill in" },
  },

  coverage: {
    found: { fr: "{n} chiffres sur {N} trouvés", en: "{n} of {N} numbers found" },
    foundOne: { fr: "1 chiffre sur {N} trouvé", en: "1 of {N} numbers found" },
    approximate: { fr: "{n} approximatifs", en: "{n} approximate" },
    approximateOne: { fr: "1 approximatif", en: "1 approximate" },
    inProgress: { fr: "{n} en cours", en: "{n} in progress" },
    requested: { fr: "{n} demandés", en: "{n} requested" },
    requestedOne: { fr: "1 demandé", en: "1 requested" },
    missing: { fr: "{n} introuvables", en: "{n} missing" },
    missingOne: { fr: "1 introuvable", en: "1 missing" },
  },

  actions: {
    deck: { fr: "Prépare tes slides →", en: "Prepare your slides →" },
    save: { fr: "Sauvegarder (.json)", en: "Save (.json)" },
    import: { fr: "Importer un fichier", en: "Import a file" },
    erase: { fr: "Tout effacer", en: "Erase everything" },
  },

  // --- Names the island cannot import from anywhere else --------------------
  /**
   * The five stage names, as the Tour prints them: not translated, and
   * « Retention » without an accent — a stage NAME, not the common noun
   * (copy review §2). The island cannot read the dictionary (R2-14).
   */
  stages: {
    acquisition: { fr: "Acquisition", en: "Acquisition" },
    activation: { fr: "Activation", en: "Activation" },
    retention: { fr: "Retention", en: "Retention" },
    referral: { fr: "Referral", en: "Referral" },
    revenue: { fr: "Revenue", en: "Revenue" },
  } satisfies Record<Pillar, Translatable>,
  /**
   * Each candidate as the subject of a sentence, with its article — what
   * `{stage}` receives in « Ramener {stage} à {target} », `{stages}` in the
   * blind and unpriced lines, and the "what if" line. Lower-case: a template
   * never starts a sentence with it.
   */
  subject: {
    "acq.signup-rate": { fr: "le taux d'inscription", en: "the sign-up rate" },
    "act.rate": { fr: "l'activation", en: "activation" },
    "ret.d30": { fr: "la rétention à J30", en: "day-30 retention" },
    "rev.paid-conversion": { fr: "la conversion en payant", en: "paid conversion" },
    "ref.referred-share": { fr: "la part des inscrits recommandés", en: "the referred share of sign-ups" },
    "ret.logo-churn": { fr: "le churn logo", en: "logo churn" },
  } satisfies Record<CandidateId, Translatable>,

  // --- Closed vocabularies (§14.4) -----------------------------------------
  status: {
    todo: { fr: "À renseigner", en: "To fill in" },
    requested: { fr: "Demandé", en: "Requested" },
    measured: { fr: "Trouvé", en: "Found" },
    estimated: { fr: "Estimé", en: "Estimated" },
    conflicting: { fr: "Deux chiffres", en: "Two numbers" },
    missing: { fr: "Introuvable", en: "Missing" },
    notApplicable: { fr: "Sans objet", en: "Not applicable" },
  },
  effort: {
    self5: { fr: "Seul, 5 min", en: "On your own, 5 min" },
    self1h: { fr: "Seul, ~1 h", en: "On your own, ~1 h" },
    ask: { fr: "À demander", en: "Ask someone" },
    build: { fr: "À construire", en: "Needs building" },
  },
  repair: {
    meeting: { fr: "une réunion", en: "a meeting" },
    afternoon: { fr: "une après-midi", en: "an afternoon" },
    sprint: { fr: "un sprint", en: "a sprint" },
    quarter: { fr: "un trimestre", en: "a quarter" },
  },
  cause: {
    notTracked: { fr: "On ne le mesure pas", en: "We don't measure it" },
    notComputed: { fr: "Ça existe, mais personne ne l'a calculé", en: "It exists, but nobody has computed it" },
    noAccess: { fr: "Ça existe, mais je n'y ai pas accès", en: "It exists, but I have no access to it" },
    noDefinition: { fr: "Personne n'est d'accord sur la définition", en: "Nobody agrees on the definition" },
    conflicting: { fr: "J'ai deux chiffres qui ne collent pas", en: "I have two numbers that don't match" },
    notApplicable: { fr: "Ça ne s'applique pas à nous", en: "It doesn't apply to us" },
  },
  role: {
    finance: { fr: "Finance", en: "Finance" },
    data: { fr: "Data", en: "Data" },
    product: { fr: "Produit", en: "Product" },
    marketing: { fr: "Marketing", en: "Marketing" },
    revops: { fr: "RevOps", en: "RevOps" },
    support: { fr: "Support", en: "Support" },
  },
  basis: {
    teamHunch: { fr: "Intuition d'équipe", en: "Team hunch" },
    oldNumber: { fr: "Un ancien chiffre", en: "An old number" },
    sample: { fr: "Un échantillon", en: "A sample" },
    other: { fr: "Autre", en: "Other" },
  },
  source: {
    someoneTold: { fr: "Quelqu'un me l'a donné", en: "Someone gave it to me" },
    other: { fr: "Autre", en: "Other" },
  },
  /** Display names of the tools a source can name. Proper nouns, except the two generic ones. */
  tools: {
    ga4: { fr: "GA4", en: "GA4" },
    mixpanel: { fr: "Mixpanel", en: "Mixpanel" },
    amplitude: { fr: "Amplitude", en: "Amplitude" },
    posthog: { fr: "PostHog", en: "PostHog" },
    stripe: { fr: "Stripe", en: "Stripe" },
    chargebee: { fr: "Chargebee", en: "Chargebee" },
    chartmogul: { fr: "ChartMogul", en: "ChartMogul" },
    hubspot: { fr: "HubSpot", en: "HubSpot" },
    salesforce: { fr: "Salesforce", en: "Salesforce" },
    "google-ads": { fr: "Google Ads", en: "Google Ads" },
    "meta-ads": { fr: "Meta Ads", en: "Meta Ads" },
    "linkedin-ads": { fr: "LinkedIn Ads", en: "LinkedIn Ads" },
    "app-store-connect": { fr: "App Store Connect", en: "App Store Connect" },
    "play-console": { fr: "Google Play Console", en: "Google Play Console" },
    "product-db": { fr: "Base produit", en: "Product database" },
    spreadsheet: { fr: "Tableur", en: "Spreadsheet" },
  } satisfies Record<ToolId, Translatable>,

  /** The numeric grammar `format.ts` needs, kept here so every word the reader sees is in one reviewable place. */
  units: {
    range: { fr: "{lo} à {hi}", en: "{lo}–{hi}" },
    perHundred: { fr: "{n} sur 100", en: "{n} in 100" },
    lessThanOnePerHundred: { fr: "moins de 1 sur 100 ({n} sur 1 000)", en: "fewer than 1 in 100 ({n} in 1,000)" },
    approx: { fr: "~{n}", en: "~{n}" },
    days: { fr: "{n} jours", en: "{n} days" },
    daysOne: { fr: "1 jour", en: "1 day" },
    hours: { fr: "{n} heures", en: "{n} hours" },
    hoursOne: { fr: "1 heure", en: "1 hour" },
    months: { fr: "{n} mois", en: "{n} months" },
    monthsOne: { fr: "1 mois", en: "1 month" },
    times: { fr: "{n} fois", en: "{n}×" },
    quarter: { fr: "T{q} {year}", en: "Q{q} {year}" },
  },

  grammar: {
    and: { fr: " et ", en: " and " },
    listSeparator: { fr: ", ", en: ", " },
  },

  // --- Drawer, sheet, triage, request, collect (§14.5) ---------------------
  sheet: {
    stageEyebrow: { fr: "Étape {i} / 5 · {stage}", en: "Stage {i} / 5 · {stage}" },
    definition: { fr: "Définition →", en: "Definition →" },
    formula: { fr: "Formule", en: "Formula" },
    cohortToUse: {
      fr: "Prends les inscrits en {cohort} : ceux inscrits en {next} n'ont pas encore eu {n} jours.",
      en: "Use the sign-ups from {cohort}: those from {next} haven't had {n} days yet.",
    },
    immatureCohort: {
      fr: "Cette cohorte n'a pas encore eu toute sa fenêtre : le chiffre sera marqué approximatif.",
      en: "This cohort hasn't had its full window yet: the number will be marked approximate.",
    },
    statusQuestion: { fr: "Où en es-tu avec ce chiffre ?", en: "Where are you with this number?" },
    haveIt: { fr: "Je l'ai", en: "I have it" },
    canEstimate: { fr: "Je peux l'estimer", en: "I can estimate it" },
    willAsk: { fr: "Je le demande", en: "I'll ask for it" },
    cantFind: { fr: "Je ne le trouve pas", en: "I can't find it" },
    over: { fr: "sur", en: "out of" },
    live: { fr: "{rate}, soit {n} sur 100 {population}", en: "{rate}, i.e. {n} in 100 {population}" },
    rateOnly: { fr: "Je n'ai que le taux", en: "I only have the rate" },
    rateOnlyHint: {
      fr: "Sans les deux comptes, le chiffre sera marqué approximatif : on ne peut pas le recompter.",
      en: "Without both counts, the number will be marked approximate: it can't be recounted.",
    },
    amountOnly: { fr: "Je n'ai que le montant", en: "I only have the amount" },
    source: { fr: "D'où vient ce chiffre ?", en: "Where does it come from?" },
    variant: { fr: "Ce qui est compté", en: "What's counted" },
    channelName: { fr: "Nom du canal", en: "Channel name" },
    evidence: { fr: "Comment le sais-tu ?", en: "How do you know?" },
    definitionNote: { fr: "Ta définition (facultatif)", en: "Your definition (optional)" },
    definitionNoteHint: {
      fr: "Par exemple « actif = au moins un projet modifié ». Elle apparaît dans l'annexe des slides et dans les demandes que tu copies.",
      en: "For example \"active = at least one project edited\". It appears in the slides' appendix and in the requests you copy.",
    },
    low: { fr: "Au moins", en: "At least" },
    high: { fr: "Au plus", en: "At most" },
    basis: { fr: "Sur quoi repose l'estimation ?", en: "What is the estimate based on?" },
    lowAboveHigh: { fr: "Le minimum dépasse le maximum.", en: "The minimum is above the maximum." },
    wideRange: {
      fr: "Une fourchette aussi large ne dit presque rien — et c'est déjà une information.",
      en: "A range this wide says almost nothing — and that is already information.",
    },
    whereTitle: { fr: "Où le trouver", en: "Where to find it" },
    trapTitle: { fr: "Le piège", en: "The trap" },
    alsoIn: { fr: "Aussi dans {tool} : {metrics}", en: "Also in {tool}: {metrics}" },
    reference: { fr: "Repère", en: "Reference" },
    referenceDesignates: {
      fr: "{range} · ordre de grandeur couramment cité, {caveat}",
      en: "{range} · commonly cited order of magnitude, {caveat}",
    },
    referenceContext: {
      fr: "{range} · pour situer, sans désigner d'étape : {caveat}",
      en: "{range} · for context, never to name a stage: {caveat}",
    },
    noReference: { fr: "Pas de repère publiable : {reason}.", en: "No reference worth publishing: {reason}." },
    target: { fr: "Ta cible (facultatif)", en: "Your target (optional)" },
    targetHint: {
      fr: "Une cible d'équipe sert de repère : c'est elle qui permet de dire quelle étape freine.",
      en: "A team target acts as the reference: it is what lets us say which stage holds you back.",
    },
    dependsOnEvent: {
      fr: "Il faut d'abord nommer l'événement d'activation : sans lui, ce taux ne veut rien dire.",
      en: "Name the activation event first: without it, this rate means nothing.",
    },
    declaredAtTour: {
      fr: "Au Tour : « {answer} » ({points} pts). Ici : {found}.",
      en: "In the Tour: \"{answer}\" ({points} pts). Here: {found}.",
    },
    note: { fr: "Note pour toi", en: "Note to self" },
    noteHint: { fr: "Jamais sur une slide.", en: "Never on a slide." },
    save: { fr: "Enregistrer", en: "Save" },
    close: { fr: "Fermer", en: "Close" },
    tooLong: { fr: "{n} caractères au plus.", en: "{n} characters at most." },
  },
  triage: {
    question: { fr: "Pourquoi ?", en: "Why?" },
    repair: { fr: "Le réparer prendrait", en: "Fixing it would take" },
    repairComment: { fr: "Précision (facultatif)", en: "Detail (optional)" },
    owner: { fr: "Qui l'a ?", en: "Who has it?" },
    readingA: { fr: "Premier chiffre", en: "First number" },
    readingB: { fr: "Second chiffre", en: "Second number" },
    naReason: { fr: "Pourquoi ça ne s'applique pas ?", en: "Why doesn't it apply?" },
  },
  request: {
    role: { fr: "À qui le demander ?", en: "Who to ask?" },
    copy: { fr: "Copier la demande", en: "Copy the request" },
    copyGroup: { fr: "Copier une seule demande ({n} chiffres)", en: "Copy one request ({n} numbers)" },
    copied: { fr: "Demande copiée", en: "Request copied" },
    remind: { fr: "Relancer", en: "Follow up" },
    stale: { fr: "à relancer · demandé il y a {n} jours", en: "follow up · asked {n} days ago" },
    message: {
      fr: "Bonjour — je prépare un point sur notre moteur de croissance. Pourrais-tu me sortir :\n{list}\nDes chiffres bruts me suffisent, sans mise en forme. Merci !",
      en: "Hi — I'm preparing a review of our growth engine. Could you pull:\n{list}\nRaw numbers are enough, no formatting needed. Thanks!",
    },
    item: { fr: "– {what} ({definition})", en: "– {what} ({definition})" },
    itemNoDefinition: { fr: "– {what}", en: "– {what}" },
  },
  collect: {
    title: { fr: "À aller chercher", en: "To go and get" },
    self: { fr: "À faire toi-même", en: "To do yourself" },
    ask: { fr: "À demander", en: "To ask for" },
    hint: {
      fr: "Envoie les demandes aujourd'hui, remplis le reste en attendant les réponses.",
      en: "Send the requests today, and fill in the rest while you wait for answers.",
    },
    fill: { fr: "Renseigner", en: "Fill in" },
    empty: { fr: "Plus rien à aller chercher.", en: "Nothing left to go and get." },
  },

  // --- Diagnosis and "what if" (§14.6) -------------------------------------
  diagnosis: {
    clear: { fr: "Une étape freine le moteur", en: "One stage holds the engine back" },
    shared: { fr: "{n} étapes freinent autant l'une que l'autre", en: "{n} stages hold it back about equally" },
    level: { fr: "Rien ne freine le moteur", en: "Nothing holds the engine back" },
    notEnough: { fr: "Pas assez de repères pour conclure", en: "Not enough references to conclude" },
    belowReference: {
      fr: "{value}, sous l'ordre de grandeur couramment cité ({range})",
      en: "{value}, below the commonly cited range ({range})",
    },
    belowTarget: { fr: "{value}, sous ta cible ({target})", en: "{value}, below your target ({target})" },
    maybeBelow: {
      fr: "{value} : peut-être sous le repère ({range})",
      en: "{value}: possibly below the reference ({range})",
    },
    notEnoughBody: {
      fr: "Fixe une cible sur au moins deux étapes : c'est ce qui permet de dire laquelle freine.",
      en: "Set a target on at least two stages: that's what lets us say which one holds you back.",
    },
    notEnoughBelow: {
      fr: "Sous son repère : {stage}. Sans cible sur les autres étapes, impossible de dire si c'est la plus grosse fuite.",
      en: "Below its reference: {stage}. Without targets on the other stages, we can't say whether it's the biggest leak.",
    },
    levelBody: {
      fr: "Aucune étape n'est sous sa cible ni sous son repère : le levier est le volume ou le prix.",
      en: "No stage is below its target or its reference: the lever is volume or price.",
    },
    blindOne: {
      fr: "Sans chiffre pour {stages}, l'étape qui freine vraiment peut s'y cacher.",
      en: "With no number for {stages}, the stage really holding you back may be hiding there.",
    },
    blind: {
      fr: "Sans chiffre pour {stages}, l'étape qui freine vraiment peut se cacher dans l'une d'elles.",
      en: "With no number for {stages}, the stage really holding you back may be hiding in one of them.",
    },
    unpriced: {
      fr: "Aussi sous la cible, sans montant calculé : {stages}",
      en: "Also below target, with no amount computed: {stages}",
    },
    noArpa: {
      fr: "Sans ARPA, le churn ne se compare pas aux autres étapes.",
      en: "Without ARPA, churn can't be compared with the other stages.",
    },
    topOfFunnel: {
      fr: "La plus grosse perte en nombre est toujours en haut du funnel ; ce n'est pas ce qui désigne l'étape qui freine.",
      en: "The biggest loss in numbers is always at the top of the funnel; that's not what names the stage holding you back.",
    },
    stampReference: { fr: "Sous le repère", en: "Below reference" },
    stampTarget: { fr: "Sous la cible", en: "Below target" },
    maybeBelowShort: { fr: "peut-être sous le repère", en: "possibly below the reference" },
    within: { fr: "dans le repère", en: "within the reference" },
    above: { fr: "au-dessus du repère", en: "above the reference" },
    noComparator: { fr: "sans repère · fixe une cible", en: "no reference · set a target" },
  },
  whatIf: {
    title: { fr: "Et si · toutes choses égales par ailleurs", en: "What if · all else being equal" },
    today: { fr: "Aujourd'hui", en: "Today" },
    if: { fr: "Si", en: "If" },
    then: { fr: "Alors", en: "Then" },
    times: { fr: "× ARPA", en: "× ARPA" },
    todayFlow: { fr: "{rate}, soit {n} nouveaux payants par mois", en: "{rate}, i.e. {n} new paying customers a month" },
    ifFlow: { fr: "{stage} atteint {target}", en: "{stage} reaches {target}" },
    thenFlow: { fr: "{n} × {target}/{rate} = {m} (+{delta})", en: "{n} × {target}/{rate} = {m} (+{delta})" },
    timesFlow: {
      fr: "{arpa} par client, soit {amount} de MRR ajouté chaque mois",
      en: "{arpa} per customer, i.e. {amount} of MRR added every month",
    },
    todayChurn: { fr: "{churn} de churn sur {base} clients payants", en: "{churn} churn on {base} paying customers" },
    thenChurn: {
      fr: "{base} × ({churn} – {target}) = {n} clients gardés par mois",
      en: "{base} × ({churn} – {target}) = {n} customers kept a month",
    },
    timesChurn: {
      fr: "{arpa} par client, soit {amount} de MRR préservé chaque mois",
      en: "{arpa} per customer, i.e. {amount} of MRR kept every month",
    },
    annual: {
      fr: "Soit {amount} de MRR de plus au bout d'un an, churn compris.",
      en: "That's {amount} more MRR after a year, churn included.",
    },
    lessThanOne: { fr: "Moins d'un client de plus par mois.", en: "Less than one more customer a month." },
    assumptionActivation: {
      fr: "Hypothèse : les payants sont parmi les activés.",
      en: "Assumption: paying customers are among the activated.",
    },
    multiplication: {
      fr: "Dans un funnel, les taux se multiplient : +20 % sur n'importe quelle étape donne +20 % de clients. Ce qui distingue les étapes, c'est leur écart à la cible.",
      en: "In a funnel, rates multiply: +20% at any stage gives +20% customers. What sets stages apart is their gap to target.",
    },
    notForecast: { fr: "Un calcul, pas une prévision.", en: "A calculation, not a forecast." },
    targetReference: {
      fr: "{value} (bas de l'ordre de grandeur couramment cité)",
      en: "{value} (low end of the commonly cited range)",
    },
    targetTeam: { fr: "{value} (cible de l'équipe)", en: "{value} (team target)" },
    slider: { fr: "Cible à tester pour {stage}", en: "Target to try for {stage}" },
  },

  // --- Peloton and mirror (§14.7) ------------------------------------------
  peloton: {
    upstream: {
      fr: "~{n} visiteurs du mois pour 100 inscrits · {source} · {month}",
      en: "~{n} visitors a month for 100 sign-ups · {source} · {month}",
    },
    signups: { fr: "Inscrits", en: "Sign-ups" },
    activated: { fr: "Activés", en: "Activated" },
    d30: { fr: "Actifs à J30", en: "Active at day 30" },
    paid: { fr: "Payants à J{n}", en: "Paying by day {n}" },
    legendReferred: { fr: "venus par recommandation ({n})", en: "came through a referral ({n})" },
    legendMeasured: { fr: "mesuré", en: "measured" },
    legendRange: { fr: "fourchette estimée", en: "estimated range" },
    legendUnknown: { fr: "non mesuré", en: "not measured" },
    sameHundred: {
      fr: "Chaque colonne est comptée sur les mêmes 100 inscrits.",
      en: "Every column is counted on the same 100 sign-ups.",
    },
    aria: {
      fr: "{n} sur 100 inscrits {population} — {status}, {source}, inscrits en {cohort}",
      en: "{n} in 100 sign-ups {population} — {status}, {source}, {cohort} cohort",
    },
    tableCaption: { fr: "Le peloton, en chiffres", en: "The peloton, in numbers" },
    /** Clauses of the verdict title (§9.3, slide 1), joined with `grammar`. */
    clauseActivated: { fr: "{a} atteignent la première valeur", en: "{a} reach first value" },
    clauseD30: { fr: "{r} sont encore là à J30", en: "{r} are still active at day 30" },
    clausePaid: { fr: "{p} paient", en: "{p} pay" },
    /**
     * A column's stage as the subject of "… isn't measured". All three are
     * feminine on purpose: the slide titles agree « mesurée(s) » with them.
     */
    unmeasured: {
      activated: { fr: "l'activation", en: "activation" },
      d30: { fr: "la rétention à J30", en: "day-30 retention" },
      paid: { fr: "la conversion en payant", en: "paid conversion" },
    },
  },
  mirror: {
    title: {
      fr: "Ce que tu as déclaré au Tour × ce que tu retrouves ici",
      en: "What you declared in the Tour × what you find here",
    },
    blindSpot: { fr: "Angles morts", en: "Blind spots" },
    blindSpotLight: { fr: "Angles morts légers", en: "Minor blind spots" },
    coherent: { fr: "Cohérent", en: "Consistent" },
    better: { fr: "Mieux que déclaré", en: "Better than declared" },
    knownGap: { fr: "Lacunes connues", en: "Known gaps" },
    card: {
      fr: "Au Tour : « {answer} » ({points} pts). Ici : {found}.",
      en: "In the Tour: \"{answer}\" ({points} pts). Here: {found}.",
    },
    noTour: {
      fr: "Démarre ton Tour pour comparer ce que ton équipe déclare à ce que tu trouves.",
      en: "Start your Tour to compare what your team declares with what you find.",
    },
    gone: {
      fr: "Le résultat du Tour relié n'est plus sur cet appareil : la comparaison est retirée.",
      en: "The linked Tour result is no longer on this device: the comparison is removed.",
    },
  },

  /**
   * Words the visuals (P5) and the static page need that §14 didn't list.
   * TODO: à relire — copie neuve (convention 6). Kept in one block so the
   * content PR (P3) can fold it into its sections without hunting.
   */
  visual: {
    /** Under the sign-ups grid: the cohort those 100 people come from. */
    cohortOf: { fr: "cohorte de {cohort}", en: "{cohort} cohort" },
    upstreamUnknown: {
      fr: "Visiteurs pour 100 inscrits : non mesuré",
      en: "Visitors for 100 sign-ups: not measured",
    },
    /** The numeral of a column measured but rounded under 1 in 100 — never « 0 », which would be a measurement. */
    lessThanOne: { fr: "moins de 1", en: "fewer than 1" },
    tableColumn: { fr: "Colonne", en: "Column" },
    tablePerHundred: { fr: "Sur 100 inscrits", en: "Out of 100 sign-ups" },
    tableStatus: { fr: "Statut", en: "Status" },
    tableSource: { fr: "Source", en: "Source" },
    whatIfMove: { fr: "Déplace le curseur pour tester une cible.", en: "Move the slider to try a target." },
    mirrorCounts: { fr: "Sur les chiffres que le Tour te faisait déclarer", en: "Across the numbers the Tour asked you about" },
    /** Which Tour is read — the spec shows its date (§6.11): a result can be months old. */
    mirrorTakenAt: { fr: "Tour du {date} · {score}/100", en: "Tour taken {date} · {score}/100" },
    mirrorTakenAtNoScore: { fr: "Tour du {date}", en: "Tour taken {date}" },
    mirrorQuestion: { fr: "La question du Tour", en: "The Tour's question" },
    /** The static page (E0) prints the catalogue's formulas without a setup: generic words fill their placeholders. */
    staticEvent: { fr: "l'événement d'activation", en: "the activation event" },
    staticWindow: { fr: "n", en: "n" },
    staticCohort: { fr: "la cohorte", en: "the cohort" },
    staticMonth: { fr: "le mois", en: "the month" },
    staticVariant: { fr: "la variante choisie", en: "the chosen variant" },
    primaryNumber: { fr: "Le chiffre de l'étape", en: "The stage's number" },
    effort: { fr: "Effort", en: "Effort" },
    tourTitle: { fr: "Pas encore fait le Tour ?", en: "Haven't taken the Tour yet?" },
  },

  // --- Slide screen, slide chrome, slide titles (§14.8, §9.3) --------------
  deck: {
    title: { fr: "Tes slides", en: "Your slides" },
    include: { fr: "Inclure", en: "Include" },
    checks: { fr: "{n} points à vérifier avant de projeter", en: "{n} things to check before presenting" },
    checksOne: { fr: "1 point à vérifier avant de projeter", en: "1 thing to check before presenting" },
    containsData: {
      fr: "Ces fichiers contiennent les chiffres que tu as saisis : ils sortent de ton navigateur dès que tu les télécharges ou les copies.",
      en: "These files contain the numbers you entered: they leave your browser as soon as you download or copy them.",
    },
    showCompany: { fr: "Nom de l'entreprise sur les slides", en: "Company name on the slides" },
    showCredit: { fr: "Mention tourdegrowth.com", en: "tourdegrowth.com credit" },
    showMirror: { fr: "Slide « Déclaré × mesuré »", en: "\"Declared × measured\" slide" },
    showMirrorHint: {
      fr: "Le Tour est une auto-évaluation : à montrer seulement si l'écart est ton argument.",
      en: "The Tour is a self-assessment: show it only if the gap is your argument.",
    },
    png: { fr: "Image (PNG)", en: "Image (PNG)" },
    pngHd: { fr: "Haute définition", en: "High definition" },
    copyImage: { fr: "Copier l'image", en: "Copy image" },
    pdf: { fr: "Télécharger le PDF", en: "Download the PDF" },
    pdfMobile: { fr: "Plus fiable depuis un ordinateur.", en: "More reliable from a computer." },
    copyText: { fr: "Copier le texte et les notes", en: "Copy the text and notes" },
    textCopied: { fr: "Texte copié", en: "Text copied" },
    pngFailed: {
      fr: "L'image n'a pas pu être créée dans ce navigateur. Le PDF, lui, fonctionne.",
      en: "The image couldn't be created in this browser. The PDF works.",
    },
    otherLanguageHint: {
      fr: "Pour des slides en anglais, passe la page en EN : tes chiffres te suivent.",
      en: "For slides in French, switch the page to FR: your numbers follow you.",
    },
  },
  ask: {
    title: { fr: "Ce que tu demandes", en: "What you're asking for" },
    what: { fr: "Quoi (120 caractères)", en: "What (120 characters)" },
    cost: { fr: "Ce que ça coûte", en: "What it costs" },
    costMoney: { fr: "Un montant", en: "An amount" },
    costTeam: { fr: "équipe de {people}, {weeks} sem.", en: "team of {people}, {weeks} wk" },
    horizon: { fr: "D'ici", en: "By" },
    successMetric: { fr: "Comment nous saurons", en: "How we'll know" },
    bullets: { fr: "Ce que ça finance (3 puces au plus)", en: "What it funds (3 bullets at most)" },
    measureFirst: { fr: "Ce qu'il faut d'abord mesurer", en: "What to measure first" },
  },
  slide: {
    kicker: {
      fr: "Moteur de croissance · {company}{month} · données internes",
      en: "Growth engine · {company}{month} · internal data",
    },
    dataPill: {
      fr: "Données : mesurées {m} · approximatives {a} · introuvables {x}",
      en: "Data: {m} measured · {a} approximate · {x} missing",
    },
    footer: {
      fr: "Inscrits en {cohort} · flux : {month} · sources : {tools}",
      en: "{cohort} sign-ups · {month} flows · sources: {tools}",
    },
    credit: { fr: "tourdegrowth.com", en: "tourdegrowth.com" },
    leakFooter: {
      fr: "Toutes choses égales par ailleurs · {assumption} · {caveat}",
      en: "All else being equal · {assumption} · {caveat}",
    },
    leakAside: { fr: "À côté", en: "Alongside" },
    withinReference: { fr: "dans le repère", en: "within the reference" },
    cannotExclude: { fr: "non mesuré — ne peut pas être exclu", en: "not measured — can't be ruled out" },
    calcTitle: { fr: "Le calcul", en: "The calculation" },
    visibilityLeft: { fr: "Ce qu'on voit", en: "What we can see" },
    visibilityRight: {
      fr: "Ce qui manque, du plus rapide au plus long à réparer",
      en: "What's missing, quickest to slowest to fix",
    },
    repairBetween: { fr: "entre {min} et {max}", en: "between {min} and {max}" },
    repairSingle: { fr: "en {repair}", en: "{repair}" },
    unitCap: { fr: "durée de vie plafonnée à 36 mois", en: "lifetime capped at 36 months" },
    unitReference: { fr: "repère couramment cité", en: "commonly cited reference" },
    askFunds: { fr: "Ce que ça finance", en: "What it funds" },
    askKnow: { fr: "Comment nous saurons", en: "How we'll know" },
    askMeasure: { fr: "Ce qu'il faut d'abord mesurer", en: "What to measure first" },
    askCheckpoint: {
      fr: "relevé mensuel, premier point le {date}",
      en: "monthly reading, first checkpoint on {date}",
    },
    annexTitle: { fr: "Définitions et sources", en: "Definitions and sources" },
    annexCols: {
      number: { fr: "Chiffre", en: "Number" },
      formula: { fr: "Formule", en: "Formula" },
      window: { fr: "Fenêtre", en: "Window" },
      period: { fr: "Période", en: "Period" },
      source: { fr: "Source", en: "Source" },
      status: { fr: "Statut", en: "Status" },
      confidence: { fr: "Confiance", en: "Confidence" },
    },
    confidence: {
      solid: { fr: "solide", en: "solid" },
      approximate: { fr: "approximatif", en: "approximate" },
      unknown: { fr: "inconnu", en: "unknown" },
    },
    tourFooter: { fr: "Tour de Growth : {score}/100, {date}", en: "Tour de Growth: {score}/100, {date}" },
  },
  /** One template per case and grammatical number (§9.3). `**…**` is the red accent. */
  slideTitles: {
    pelotonComplete: {
      fr: "Sur 100 inscrits, {a} atteignent la première valeur, {r} sont encore là à J30 et **{p} paient**.",
      en: "Out of 100 sign-ups, {a} reach first value, {r} are still active at day 30 and **{p} pay**.",
    },
    pelotonGap: {
      fr: "Sur 100 inscrits, {clauses}. **Entre les deux, on ne voit rien : {stages} ne sont pas mesurées.**",
      en: "Out of 100 sign-ups, {clauses}. **In between, we see nothing: {stages} aren't measured.**",
    },
    pelotonGapOne: {
      fr: "Sur 100 inscrits, {clauses}. **Entre les deux, on ne voit rien : {stages} n'est pas mesurée.**",
      en: "Out of 100 sign-ups, {clauses}. **In between, we see nothing: {stages} isn't measured.**",
    },
    pelotonTailBreak: {
      fr: "Sur 100 inscrits, {clauses}. **Au-delà, on ne sait pas les suivre : {stages} ne sont pas mesurées.**",
      en: "Out of 100 sign-ups, {clauses}. **Beyond that, we can't follow them: {stages} aren't measured.**",
    },
    pelotonTailBreakOne: {
      fr: "Sur 100 inscrits, {clauses}. **Au-delà, on ne sait pas les suivre : {stages} n'est pas mesurée.**",
      en: "Out of 100 sign-ups, {clauses}. **Beyond that, we can't follow them: {stages} isn't measured.**",
    },
    pelotonEmpty: {
      fr: "**On ne sait pas encore suivre 100 inscrits jusqu'au paiement.**",
      en: "**We can't yet follow 100 sign-ups all the way to payment.**",
    },
    leakClearMrrNew: {
      fr: "Ramener {stage} à {target} vaudrait **{amount} de MRR nouveau** chaque mois.",
      en: "Bringing {stage} to {target} would be worth **{amount} of new MRR** every month.",
    },
    leakClearMrrRetained: {
      fr: "Ramener {stage} à {target} vaudrait **{amount} de MRR préservé** chaque mois.",
      en: "Bringing {stage} to {target} would be worth **{amount} of retained MRR** every month.",
    },
    leakClearCustomers: {
      fr: "Ramener {stage} à {target} ajouterait **{n} clients payants** par mois.",
      en: "Bringing {stage} to {target} would add **{n} paying customers** a month.",
    },
    leakClearPerHundred: {
      fr: "Ramener {stage} à {target} ajouterait **{n} payants pour 100 inscrits**.",
      en: "Bringing {stage} to {target} would add **{n} paying customers per 100 sign-ups**.",
    },
    leakShared: {
      fr: "**{n} étapes** sont sous leur cible sans que l'une pèse nettement plus : {list}.",
      en: "**{n} stages** sit below their target, none clearly heavier: {list}.",
    },
    leakNotEnoughBelow: {
      fr: "**Sous son repère : {stage}.** Sans cible sur les autres étapes, impossible de dire si c'est la plus grosse fuite.",
      en: "**Below its reference: {stage}.** Without targets on the other stages, we can't say whether it's the biggest leak.",
    },
    leakLevel: {
      fr: "Aucune étape n'est sous sa cible ni sous son repère : **le levier est le volume ou le prix**.",
      en: "No stage sits below its target or its reference: **the lever is volume or price**.",
    },
    visibility: {
      fr: "On documente **{n} chiffres sur {N}**. Les {k} qui manquent se réparent {repair}.",
      en: "We document **{n} of {N} numbers**. The {k} missing ones take {repair} to fix.",
    },
    visibilityOne: {
      fr: "On documente **{n} chiffres sur {N}**. Celui qui manque se répare {repair}.",
      en: "We document **{n} of {N} numbers**. The missing one takes {repair} to fix.",
    },
    visibilityAllDocumented: {
      fr: "Les **{N} chiffres** du moteur sont documentés.",
      en: "All **{N} engine numbers** are documented.",
    },
    unitEconomics: {
      fr: "Un client rembourse son coût d'acquisition en **{m}** et rapporte **{x}** ce qu'il coûte.",
      en: "A customer pays back their acquisition cost in **{m}** and brings in **{x}** what they cost.",
    },
    unitEconomicsUnknown: {
      fr: "**On ne peut pas encore dire ce que rapporte un client.** Il manque : {input}.",
      en: "**We can't yet say what a customer is worth.** Missing: {input}.",
    },
    mirror: {
      fr: "L'équipe déclare suivre **{k}** de ces chiffres ; on a pu en sortir **{m}**.",
      en: "The team says it tracks **{k}** of these numbers; we could pull **{m}**.",
    },
    ask: {
      fr: "Nous demandons **{what}** — objectif : {metric} de {current} à {target} d'ici {horizon}.",
      en: "We're asking for **{what}** — goal: {metric} from {current} to {target} by {horizon}.",
    },
    askMeasureFirst: {
      fr: "Nous demandons **{cost}** pour mesurer d'abord ce qui manque ({metric}), avant de décider où investir.",
      en: "We're asking for **{cost}** to measure what's missing first ({metric}), before deciding where to invest.",
    },
    annex: { fr: "Définitions et sources", en: "Definitions and sources" },
  } satisfies Record<SlideTitleKey, Translatable>,
  /** Speaker notes (§9.4), pre-written against the classic objections. */
  notes: {
    compared: { fr: "Comparé à quoi ? — {comparator}.", en: "Compared with what? — {comparator}." },
    source: {
      fr: "D'où vient ce chiffre ? — {tool}, {period}, inscrits en {cohort}.",
      en: "Where does this number come from? — {tool}, {period}, {cohort} cohort.",
    },
    seasonal: {
      fr: "Et si c'est saisonnier ? — Un seul mois est mesuré pour l'instant ; la comparaison d'un mois à l'autre viendra avec le suivant.",
      en: "What if it's seasonal? — Only one month is measured so far; the month-on-month comparison comes with the next one.",
    },
    whyNot: { fr: "Pourquoi pas {stage} ? — {ranking}.", en: "Why not {stage}? — {ranking}." },
  },

  // --- Findings and sanity checks (§14.9, §14.10) --------------------------
  /**
   * Findings never assert a cause (spec §6.10): they say what is measured
   * and what isn't, never why. `{metric}` is a catalogue NAME, so it only
   * ever opens a line as a label.
   */
  findings: {
    chainBreak: {
      fr: "Sur 100 inscrits, on ne sait pas dire combien {verb}.",
      en: "Out of 100 sign-ups, we can't say how many {verb}.",
    },
    verb: {
      activated: { fr: "atteignent la première valeur", en: "reach first value" },
      d30: { fr: "sont encore là à J30", en: "are still active at day 30" },
      paid: { fr: "paient", en: "pay" },
    },
    noDefinition: {
      fr: "{metric} : pas de définition partagée. Tout chiffre qu'on en donnerait serait l'opinion de quelqu'un.",
      en: "{metric}: no shared definition. Any number given for it would be someone's opinion.",
    },
    blindSpot: {
      fr: "{metric} : le Tour dit que ce chiffre est suivi, mais on n'a pas pu le sortir.",
      en: "{metric}: the Tour says this number is tracked, but we couldn't pull it.",
    },
    belowComparator: { fr: "{metric} : {value}, sous {comparator}.", en: "{metric}: {value}, below {comparator}." },
    conflict: {
      fr: "{metric} : {a} selon {sourceA}, {b} selon {sourceB}.",
      en: "{metric}: {a} according to {sourceA}, {b} according to {sourceB}.",
    },
    unitEcon: {
      fr: "Impossible de dire en combien de mois un client rembourse son coût d'acquisition. Il manque : {input}.",
      en: "We can't say how many months a customer takes to pay back their acquisition cost. Missing: {input}.",
    },
    reconcile: {
      fr: "Ta chaîne prédit ~{p} nouveaux payants en {month} ; ta facturation en compte {n}. Au moins une définition ne porte pas sur la même population.",
      en: "Your chain predicts ~{p} new paying customers in {month}; your billing counts {n}. At least one definition doesn't cover the same population.",
    },
    smallCohort: {
      fr: "Moins de 100 inscrits dans la cohorte : chaque inscrit pèse plus d'un point de pourcentage.",
      en: "Fewer than 100 sign-ups in the cohort: each one weighs more than a percentage point.",
    },
    hiddenKnowledge: {
      fr: "{metric} : ton Tour disait que ce chiffre n'était pas suivi, et tu l'as pourtant trouvé.",
      en: "{metric}: your Tour said this number wasn't tracked, and yet you found it.",
    },
  },
  sanity: {
    numGtDen: {
      fr: "Le premier compte ({num}) dépasse le second ({den}) : l'un des deux n'est pas le bon.",
      en: "The first count ({num}) is larger than the second ({den}): one of the two isn't the right one.",
    },
    retainedGtActivated: {
      fr: "Plus d'actifs à J30 que d'activés : ta définition de l'activation est peut-être trop stricte.",
      en: "More users active at day 30 than activated ones: your definition of activation may be too strict.",
    },
    paidGtRetained: {
      fr: "Plus de payants que d'actifs à J30 : paiement annuel d'avance, ou définition d'« actif » trop étroite ?",
      en: "More paying customers than users active at day 30: annual prepayment, or a definition of \"active\" that's too narrow?",
    },
    churnHigh: { fr: "C'est bien un churn mensuel, et pas annuel ?", en: "Is that really a monthly churn, not an annual one?" },
    marginOdd: { fr: "Vérifie ce qui est compté dans les coûts directs.", en: "Check what's counted in direct costs." },
    ttvMean: {
      fr: "Une moyenne baisse quand les traînards abandonnent : prends la médiane.",
      en: "An average drops when stragglers give up: use the median.",
    },
    cohortMismatch: {
      fr: "Les colonnes du peloton ne portent pas sur la même cohorte.",
      en: "The peloton's columns don't cover the same cohort.",
    },
    reconcileGap: {
      fr: "Ta chaîne prédit ~{p} nouveaux payants en {month} ; ta facturation en compte {n}. Au moins une définition ne porte pas sur la même population.",
      en: "Your chain predicts ~{p} new paying customers in {month}; your billing counts {n}. At least one definition doesn't cover the same population.",
    },
    toCheck: { fr: "à vérifier", en: "to check" },
  },

  // --- Storage, file, resume, erase (§14.11) -------------------------------
  storage: {
    backupWarning: {
      fr: "Ton moteur n'existe que dans ce navigateur. Safari peut effacer les données d'un site que tu n'as pas ouvert depuis sept jours : sauvegarde-le dans un fichier.",
      en: "Your engine only exists in this browser. Safari may erase the data of a site you haven't opened for seven days: save it to a file.",
    },
    neverExported: { fr: "Jamais sauvegardé", en: "Never saved" },
    lastExported: { fr: "Dernière sauvegarde : {date}", en: "Last saved: {date}" },
    writeFailed: {
      fr: "Impossible d'enregistrer sur cet appareil. Sauvegarde ta saisie dans un fichier pour ne rien perdre.",
      en: "Can't save on this device. Save your entries to a file so you lose nothing.",
    },
    unreadable: {
      fr: "Les données enregistrées sur cet appareil sont illisibles. Reprends depuis un fichier sauvegardé.",
      en: "The data saved on this device can't be read. Start again from a saved file.",
    },
  },
  io: {
    importTitle: { fr: "Importer un moteur", en: "Import an engine" },
    importPreview: { fr: "{company} · {month} · {n} sur {N} chiffres trouvés", en: "{company} · {month} · {n} of {N} numbers found" },
    replace: { fr: "Remplacer celui de cet appareil", en: "Replace the one on this device" },
    cancel: { fr: "Annuler", en: "Cancel" },
    warnings: { fr: "Fichier ouvert, avec des avertissements ({n}) :", en: "File opened, with warnings ({n}):" },
    unknownVersion: {
      fr: "Ce fichier vient d'une version plus récente du moteur : il ne peut pas être lu ici.",
      en: "This file comes from a newer version of the engine: it can't be read here.",
    },
    notEngine: { fr: "Ce fichier n'est pas un moteur Tour de Growth.", en: "This file isn't a Tour de Growth engine." },
    fileName: { fr: "tdg-moteur-{month}.json", en: "tdg-engine-{month}.json" },
  },
  resume: {
    band: {
      fr: "Tu as trouvé {n} chiffres sur {N}. Depuis ta dernière visite, il y a {days} jours : {pending}.",
      en: "You've found {n} of {N} numbers. Since your last visit, {days} days ago: {pending}.",
    },
    /** `days === 1`. */
    bandOne: {
      fr: "Tu as trouvé {n} chiffres sur {N}. Depuis ta visite d'hier : {pending}.",
      en: "You've found {n} of {N} numbers. Since your visit yesterday: {pending}.",
    },
    /** `days === 0`. */
    bandToday: {
      fr: "Tu as trouvé {n} chiffres sur {N}. Depuis ta visite de tout à l'heure : {pending}.",
      en: "You've found {n} of {N} numbers. Since your visit earlier today: {pending}.",
    },
    pendingRequests: {
      fr: "{n} demandes à relancer ({role}, {metric})",
      en: "{n} requests to follow up ({role}, {metric})",
    },
    pendingRequestsOne: {
      fr: "1 demande à relancer ({role}, {metric})",
      en: "1 request to follow up ({role}, {metric})",
    },
    continue: { fr: "Reprendre", en: "Continue" },
    remind: { fr: "Relancer : {role}", en: "Follow up: {role}" },
  },
  erase: {
    title: { fr: "Tout effacer", en: "Erase everything" },
    body: {
      fr: "Tes chiffres seront supprimés de cet appareil, et rien d'autre ne les garde. Sauvegarde-les d'abord si tu veux les retrouver.",
      en: "Your numbers will be deleted from this device, and nothing else keeps them. Save them first if you want them back.",
    },
    confirmLabel: { fr: "Tape « {word} » pour confirmer", en: "Type \"{word}\" to confirm" },
    fallbackWord: { fr: "EFFACER", en: "ERASE" },
    confirm: { fr: "Effacer définitivement", en: "Erase permanently" },
  },

  // --- Page FAQ (§14.12), rendered statically for readers without JS -------
  faq: [
    {
      q: { fr: "Mes chiffres sont-ils envoyés quelque part ?", en: "Are my numbers sent anywhere?" },
      a: {
        fr: "Non. Ils sont enregistrés dans le stockage local de ton navigateur, sur cet appareil, et aucune requête ne les transporte. Ils n'en sortent que par un fichier que tu télécharges ou un texte que tu copies toi-même. La page compte ses visites, sans cookie, jamais ce que tu y saisis.",
        en: "No. They're stored in your browser's local storage, on this device, and no request carries them. They only leave through a file you download or a text you copy yourself. The page counts its visits, without cookies, never what you enter.",
      },
    },
    {
      q: { fr: "Pourquoi des comptes plutôt que des pourcentages ?", en: "Why counts rather than percentages?" },
      a: {
        fr: "Parce qu'un pourcentage sans sa base ne se vérifie pas. « 144 sur 800 » se recompte ; « 18 % » ne dit pas de quoi. Si tu n'as que le taux, tu peux l'entrer quand même : il sera marqué approximatif.",
        en: "Because a percentage without its base can't be checked. \"144 out of 800\" can be recounted; \"18%\" doesn't say of what. If you only have the rate, you can still enter it: it will be marked approximate.",
      },
    },
    {
      q: { fr: "D'où viennent les repères ?", en: "Where do the references come from?" },
      a: {
        fr: "Seulement d'ordres de grandeur déjà publiés et relus dans le glossaire du site, toujours affichés avec leur réserve. Deux seulement servent à désigner l'étape qui freine : l'activation et le churn logo. Les autres étapes n'ont pas de repère fiable ; ta propre cible sert alors de référence.",
        en: "Only from orders of magnitude already published and reviewed in the site's glossary, always shown with their caveat. Only two are used to name the stage holding you back: activation and logo churn. The other stages have no reliable reference; your own target then serves as one.",
      },
    },
    {
      q: { fr: "Que faire d'un chiffre introuvable ?", en: "What do I do with a number I can't find?" },
      a: {
        fr: "Le dire. Un chiffre introuvable est un constat : l'outil te demande pourquoi et ce que coûterait de le réparer, puis le met sur une slide. C'est souvent l'argument le plus solide à porter devant ton CODIR.",
        en: "Say so. A number you can't find is a finding: the tool asks why and what fixing it would cost, then puts it on a slide. It is often the strongest point you can bring to your leadership meeting.",
      },
    },
    {
      q: { fr: "En quoi est-ce différent du Tour ?", en: "How is this different from the Tour?" },
      a: {
        fr: "Le Tour mesure en trois minutes si ton équipe suit ses chiffres, sans te demander aucun chiffre. Le moteur te fait aller les chercher, et confronte les deux si tu as fait le Tour sur cet appareil.",
        en: "The Tour measures in three minutes whether your team tracks its numbers, without asking for any number. The engine has you go and get them, and compares the two if you took the Tour on this device.",
      },
    },
  ],
};
