// TODO: à relire — copie neuve (convention 6), rédigée par la session de code
import { ENGINE_HEADLINE } from "@/content/engine-share";
import type { Translatable } from "@/lib/i18n/translatable";
import type { Pillar } from "@/lib/scoring/pillars";
import type { CandidateId, LeverId, SlideTitleKey, ToolId, UnitInputId } from "@/lib/engine/types";
import type { ScenarioAssumption } from "@/lib/engine/scenario";
import type { SlgScenarioAssumption } from "@/lib/engine/slg-scenario";

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
 *   phrase written with its article: `subject` (« l'activation »), a
 *   peloton `unmeasured` phrase, `unitInput` (« la marge brute ») or
 *   `event` (« l'événement « a créé un projet » »). `lib/engine/phrases.ts`
 *   picks them, so a consumer never has to;
 * - where a value sits against its comparator — the team's target, the only
 *   one that names a stage (C1) — is `side`, chosen from the DIRECTION of the
 *   metric: churn, where lower is better, is « au-dessus de la cible » when
 *   it is behind it, never « sous »;
 * - a count that a noun agrees with has a `xOne` sibling, picked from the
 *   PRINTED number by the language's own rule — French takes the singular
 *   under 2 (« 1,5 payant »), English only for exactly 1;
 * - French never writes « de {month} » / « de {cohort} »: a month may start
 *   with a vowel (avril, août, octobre) and a template cannot elide;
 * - glyphs that can reach a slide stay inside the three fonts' coverage
 *   (§10.4): no arrow, no "≈", no minus sign U+2212, no superscript. Screen
 *   CTAs keep their "→" like everywhere else on the site.
 */

export const ENGINE_COPY = {
  meta: {
    /*
     * Plus « — Tour de Growth », added by the page: the whole `<title>` must
     * stay within SEARCH_TITLE_MAX (60, `lib/i18n/meta.ts`). The first
     * wording ran to 64 FR / 65 EN (review R13). Kept: the query itself
     * (« modèle de funnel AARRR » / "AARRR funnel template") first, and the
     * promise that the numbers stay local. A colon rather than a second em
     * dash, so the title does not read as three fragments. TODO: à relire.
     */
    title: { fr: "Modèle de funnel AARRR : chiffres en local", en: "AARRR funnel template: numbers kept local" },
    description: {
      fr: "Entre les chiffres de tes cinq étapes AARRR, vois où tu perds le plus de monde et exporte des slides pour ton CODIR. Rien n'est envoyé.",
      en: "Enter the numbers for your five AARRR stages, see where you lose the most people and export slides for your leadership meeting. Nothing is sent.",
    },
    // TODO: à relire (convention 6) — renommé le 2026-09-30 (A7.2, C2 : « Moteur de growth »).
    breadcrumb: { fr: "Moteur de growth", en: "Growth engine" },
  },

  page: {
    // The headline is `engine-share.ts`'s: the share image draws it too.
    eyebrow: ENGINE_HEADLINE.eyebrow,
    title: ENGINE_HEADLINE.title,
    positioning: {
      fr: "Ton Tour dit si tu mesures. Le moteur montre ce que disent tes chiffres.",
      en: "Your Tour tells you whether you measure. The engine shows what your numbers say.",
    },
    // TODO: à relire — réécrit le 2026-09-28 (audit du design kit) : le moteur collecte dix-sept
    // chiffres depuis le 2026-09-26 (expansion et rétrogradation), la page disait encore quinze.
    // TODO: à relire (convention 6) — réécrit le 2026-09-30 (A7.1, C1 : aucun repère ne désigne).
    // TODO: à relire (convention 6) — réécrit le 2026-10-01 (A7.3.c S3) : les chiffres de l'assisté.
    promise: {
      fr: "Dix-sept chiffres en libre-service, quinze en assisté : va les chercher, vois où ton moteur perd du monde et repars avec des slides prêtes pour ton CODIR. Tes chiffres ne sont comparés qu'à toi-même et à ta propre cible : les repères publiés sont là pour situer, jamais pour désigner une étape.",
      en: "Seventeen numbers for self-serve, fifteen for sales-assisted: go and get them, see where your engine loses people, and leave with slides ready for your leadership meeting. Your numbers are only compared with yourself and your own target: published references are there for context, never to name a stage.",
    },
    privacyTitle: { fr: "Rien de ce que tu saisis ne sort d'ici", en: "Nothing you enter leaves this page" },
    privacyBody: {
      fr: "Aucun chiffre ni aucun texte que tu saisis ne quitte ton navigateur. Pas de compte, pas de serveur : tout reste sur cet appareil, et tu peux le vérifier dans l'onglet Réseau de ton navigateur. La page compte ses visites, sans cookie — jamais ce que tu y écris.",
      en: "No number and no text you enter leaves your browser. No account, no server: everything stays on this device, and you can check it in your browser's Network tab. The page counts its visits, without cookies — never what you type.",
    },
    cta: { fr: "Entre tes chiffres →", en: "Enter your numbers →" },
    ctaNote: { fr: "Gratuit, sans compte. Tout reste sur ton appareil.", en: "Free, no sign-up. Everything stays on your device." },
    tourFirst: { fr: "Démarre ton Tour d'abord (3 min)", en: "Start your Tour first (3 min)" },
    // TODO: à relire (convention 6) — réécrit le 2026-10-01 (A7.3.c S3) : la liste compte les deux motions.
    noscript: {
      fr: "Le moteur a besoin de JavaScript pour enregistrer tes chiffres. La liste des chiffres, plus bas, se lit sans.",
      en: "The engine needs JavaScript to save your numbers. The list of numbers, further down, reads without it.",
    },
    // TODO: à relire — nouveau (2026-09-25, retours d'Antoine sur le moteur).
    durationTitle: { fr: "Combien de temps ça prend", en: "How long it takes" },
    // TODO: à relire (convention 6) — 2026-10-01 (A7.3.c S3) : durationIntro réécrit, durationIntroSlg neuf (une phrase par motion, comptées sur le catalogue).
    durationIntro: {
      fr: "Surtout, là où sont tes chiffres. Sur les dix-sept du libre-service, {quick} se lisent en cinq minutes, {hour} demandent environ une heure chacun et {ask} sont à demander à quelqu'un.",
      en: "Mostly, where your numbers are. Of the seventeen self-serve ones, {quick} take five minutes to read, {hour} take about an hour each and {ask} have to be asked of someone.",
    },
    // TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S3).
    durationIntroSlg: {
      fr: "Sur les quinze de l'assisté, {quick} se lisent en cinq minutes, {hour} demandent environ une heure chacun et {ask} sont à demander à quelqu'un.",
      en: "Of the fifteen sales-assisted ones, {quick} take five minutes to read, {hour} take about an hour each and {ask} have to be asked of someone.",
    },
    durationReadyLabel: { fr: "Tout est sous la main", en: "Everything is at hand" },
    // TODO: à relire (convention 6) — le 2026-10-02 (A18 T3.b) : le pas à pas, fondu dans le tableau, ne « garde » plus rien ; le moteur garde ce qui est enregistré (un chiffre tapé sans être enregistré ne vit qu'en mémoire, sheet-drafts.ts).
    durationReady: {
      fr: "Tu as accès à l'analytics, à la facturation et à la base produit : compte une demi-journée, en plusieurs fois si besoin. Ton moteur garde chaque chiffre que tu enregistres.",
      en: "You have access to analytics, billing and the product database: allow half a day, in several sittings if needed. Your engine keeps every number you save.",
    },
    durationAskLabel: { fr: "Il faut demander", en: "You have to ask" },
    durationAsk: {
      fr: "Une partie est chez la finance ou la data : compte une à deux semaines d'aller-retour, pour environ une heure de ton temps. Les demandes se copient toutes faites.",
      en: "Some of it sits with finance or data: allow one to two weeks of back and forth, for about an hour of your own time. The requests come ready to copy.",
    },
    durationTargetsLabel: { fr: "Pas encore de cible", en: "No target yet" },
    // TODO: à relire (convention 6) — réécrit le 2026-09-30 (A7.1, C1 : aucun repère ne désigne).
    durationTargets: {
      fr: "Ajoute une réunion d'équipe pour en poser, ou avance sans : tu verras tes chiffres, avec leur repère quand il en existe un, mais pas quelle étape freine.",
      en: "Add a team meeting to set some, or go ahead without: you'll see your numbers, with their reference where there is one, but not which stage holds you back.",
    },
    durationDeckLabel: { fr: "Les slides", en: "The slides" },
    durationDeck: { fr: "Un quart d'heure, une fois les chiffres là.", en: "A quarter of an hour, once the numbers are in." },
    // TODO: à relire (convention 6) — réécrit le 2026-10-01 (A7.3.c S3) : les fiches des deux motions.
    catalogueToggle: {
      fr: "Ouvrir les fiches : formule, où le trouver, piège",
      en: "Open the cards: formula, where to find it, trap",
    },
    // TODO: à relire (convention 6) — réécrit le 2026-10-01 (A7.3.c S3).
    catalogueTitle: { fr: "Les chiffres du moteur", en: "The engine's numbers" },
    // TODO: à relire — réécrit le 2026-09-28 : « trois par étape » ne valait plus pour Revenue (cinq).
    catalogueIntro: {
      fr: "Trois par étape, comme les trois questions du Tour, et cinq pour Revenue, qui porte aussi les mouvements du MRR. Pour chacun : sa formule, où le trouver, et le piège à connaître avant de le citer.",
      en: "Three per stage, like the Tour's three questions, and five for Revenue, which also carries the MRR movements. For each: its formula, where to find it, and the trap to know before quoting it.",
    },
    // TODO: à relire — réécrit le 2026-09-28 : la page en liste cinq depuis que NRR et GRR ont rejoint les trois.
    catalogueComputedTitle: { fr: "Et cinq chiffres calculés", en: "And five computed numbers" },
    catalogueVerified: { fr: "Recettes relues en {month}.", en: "Recipes checked in {month}." },
    faqTitle: { fr: "Questions fréquentes", en: "Frequently asked questions" },
    /**
     * TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S2, ENGINE.md §18.7 E0) : the catalogue
     * splits into one subsection per motion, and the link, laid on the page
     * by S3 (`page.tsx`).
     */
    catalogueTitlePlg: { fr: "Libre-service : {n} chiffres", en: "Self-serve: {n} numbers" },
    catalogueTitleSlg: { fr: "Assisté : {n} chiffres", en: "Sales-assisted: {n} numbers" },
    catalogueIntroSlg: {
      fr: "Trois par étape, deux pour Referral et quatre pour Revenue, qui porte aussi la marge de l'assisté. Les flux et les cohortes se lisent sur trois mois glissants : un mois compte trop peu d'affaires.",
      en: "Three per stage, two for Referral and four for Revenue, which also carries sales-assisted's margin. Flows and cohorts read over rolling three-month periods: one month has too few deals.",
    },
    catalogueComputedTitleSlg: { fr: "Et trois chiffres calculés", en: "And three computed numbers" },
    catalogueLinkTitle: { fr: "La liaison, si tu vends des deux façons", en: "The link, if you sell both ways" },
  },

  /**
   * TODO: à relire (convention 6) — neuf le 2026-10-02 (A18 T3.a, le retour 07 de Claude Design,
   * design/ds-extension-07-return/COPY.md) : le premier écran, une seule question (`EngineStart`) ; le
   * titre reste `setup.title`. `{n}`, `{quick}`, `{hour}`, `{ask}` valent au moins 2 pour chacune des
   * trois façons de vendre (testé), d'où le pluriel sans variante. `{month}`, `{cohort}` : un mois
   * formaté, après deux-points en français (jamais « de {month} », voir l'en-tête). « En euros » : la
   * devise par défaut (`DEFAULT_CURRENCY`), seule possible ici ; « Modifier » ouvre tous les réglages.
   */
  start: {
    legend: { fr: "Comment vends-tu ?", en: "How do you sell?" },
    ss: { fr: "Libre-service", en: "Self-serve" },
    ssNote: { fr: "On s'inscrit et on paie seul (PLG).", en: "People sign up and pay on their own (PLG)." },
    sa: { fr: "Assisté", en: "Sales-assisted" },
    saNote: { fr: "Un commercial signe les contrats (SLG).", en: "A salesperson signs the deals (SLG)." },
    both: { fr: "Les deux", en: "Both" },
    bothNote: { fr: "Deux moteurs, un total.", en: "Two engines, one total." },
    plan: {
      fr: "{n} chiffres : {quick} se lisent en cinq minutes, {hour} demandent environ une heure chacun, {ask} sont à demander à quelqu'un.",
      en: "{n} numbers: {quick} take five minutes, {hour} about an hour each, {ask} come from someone else.",
    },
    defaults: {
      fr: "Réglé pour un SaaS B2B, en euros. Mois des chiffres : {month} ; inscrits suivis : {cohort}.",
      en: "Set for a B2B SaaS, in euros, on {month}'s figures and {cohort}'s sign-ups.",
    },
    /** Sales-assisted alone follows no self-serve cohort: it reads three months, as the engine bar says (« juillet à septembre 2026 »). */
    defaultsSlg: { fr: "Réglé pour un SaaS B2B, en euros, sur trois mois de chiffres jusqu'à {month}.", en: "Set for a B2B SaaS, in euros, on three months of figures up to {month}." },
    change: { fr: "Modifier", en: "Change" },
    /** Not « Commence par ton premier chiffre » (the return): the « Cibles » screen comes first (C40). */
    go: { fr: "Commence →", en: "Start →" },
    example: { fr: "Voir un exemple rempli", en: "See a filled-in example" },
    import: { fr: "Importer un fichier (.json)", en: "Import a file (.json)" },
  },
  /**
   * TODO: à relire (convention 6) — neuf le 2026-10-02 (A18 T3.a) : l'écran « Cibles », gardé au début
   * et sautable par Antoine (C40, contre la reco du retour 07, qui ne les mettait que sur l'écran de
   * chaque chiffre et dans les Réglages). Les cases portent `targetsStart.targetFor`, venue du pas à pas (T3.b).
   */
  targetsStart: {
    title: { fr: "Ton équipe a-t-elle déjà des cibles ?", en: "Does your team already have targets?" },
    /**
     * Only these numbers take a target (C1): the other screens have no box.
     * TODO: à relire (convention 6) — « ou dans les Réglages » ajouté le 2026-10-02 (A18 T3.d), qui les y met.
     */
    lead: {
      fr: "Si oui, tape-les : ce sont elles qui nomment l'étape qui freine. Sinon, passe : tu pourras en fixer plus tard, sur l'écran de chacun de ces chiffres ou dans les Réglages.",
      en: "If so, type them in: they are what names the stage that holds you back. If not, skip: you can set them later, on each of these numbers' screens or in Settings.",
    },
    /** One label, true whether a target was typed or not: a label that changed on the box's blur changed under the pointer. */
    go: { fr: "Passe à ton premier chiffre →", en: "On to your first number →" },
    /** Each box's label: the step-by-step's, moved here unchanged (A18 T3.b); still to review with A18.d. */
    targetFor: { fr: "Cible pour {metric}", en: "Target for {metric}" },
  },

  setup: {
    title: { fr: "Avant de commencer", en: "Before you start" },
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
    // TODO: à relire — réécrit le 2026-09-25 (retour d'Antoine) : dire quel nom.
    // TODO: à relire (convention 6) — 2026-09-30 (C29) : « facultatif » sort du libellé, la prop `optional` le dessine (workbench.optional).
    companyLabel: { fr: "Nom de ton SaaS ou de ton entreprise", en: "Your SaaS or company name" },
    companyHint: {
      fr: "Il n'apparaît que sur tes slides, et reste sur cet appareil comme le reste.",
      en: "It only appears on your slides, and stays on this device like everything else.",
    },
    tourFound: {
      fr: "Tu as fait le Tour le {date} ({score}/100). On comparera ce que tu y as déclaré à ce que tu retrouves ici — on le lit, on ne le copie pas.",
      en: "You took the Tour on {date} ({score}/100). We'll compare what you declared there with what you find here — we read it, we don't copy it.",
    },
    tourLink: { fr: "Comparer avec ce Tour", en: "Compare with that Tour" },
    /** In the settings, under the Tour box once it is unticked: unlinking never erases the Tour (C8). */
    // TODO: à relire (convention 6) — nouveau (2026-09-30, A7.5, C8 : relier un Tour après coup).
    tourUnlinkHint: {
      fr: "Délier garde ton Tour sur cet appareil : tu pourras le relier de nouveau.",
      en: "Unlinking keeps your Tour on this device: you can link it again.",
    },
    /**
     * TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S2, ENGINE.md §18.1, C25 Q16) : the
     * type and the motions. The type is a closed list with one option open,
     * « Plus tard », never « Bientôt » (Q16); it replaced v1's « Ton modèle »
     * list with S3. The hint promises what the hybrid never
     * does: one against the other.
     */
    companyType: { fr: "Ton type d'entreprise", en: "Your type of company" },
    types: {
      b2bSaas: { fr: "SaaS B2B", en: "B2B SaaS" },
      consumerApp: { fr: "App grand public", en: "Consumer app" },
      marketplace: { fr: "Place de marché", en: "Marketplace" },
    },
    typeLater: { fr: "Plus tard : leur funnel n'a pas la même forme.", en: "Later: their funnel has a different shape." },
    motions: { fr: "Comment tu vends", en: "How you sell" },
    motionPlg: { fr: "Libre-service (PLG) : les clients s'inscrivent et paient seuls", en: "Self-serve (PLG): customers sign up and pay on their own" },
    motionSlg: { fr: "Assisté (SLG) : une équipe commerciale signe les contrats", en: "Sales-assisted (SLG): a sales team signs the contracts" },
    motionsHint: {
      fr: "Les deux ? Coche les deux : tu auras deux moteurs et leur total, jamais l'un contre l'autre.",
      en: "Both? Tick both: you get two engines and their total, never one against the other.",
    },
    motionsRequired: { fr: "Coche au moins une façon de vendre.", en: "Tick at least one way you sell." },
    /**
     * TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T4, §19.5.1, C32 Q9) : tools, toolsHint, toolFamily.
     * Optional, folded: nothing ticked changes nothing. The tools' own names are `tools`.
     */
    tools: { fr: "Tes outils", en: "Your tools" },
    toolsHint: {
      fr: "Facultatif. Coche ceux que ton équipe utilise : la fiche te les propose d'abord, et « À faire toi-même » se range par outil.",
      en: "Optional. Tick the ones your team uses: the sheet offers them first, and \"To do yourself\" is grouped by tool.",
    },
    toolFamily: {
      analytics: { fr: "Analytics produit", en: "Product analytics" },
      billing: { fr: "Facturation", en: "Billing" },
      crm: { fr: "CRM", en: "CRM" },
      ads: { fr: "Publicité", en: "Advertising" },
      other: { fr: "Autres", en: "Other" },
    },
    qualificationWindow: { fr: "Fenêtre de qualification", en: "Qualification window" },
    goLiveWindow: { fr: "Fenêtre de mise en production", en: "Go-live window" },
    /**
     * Read-only, under the month when sales-assisted is ticked: its periods,
     * computed (S4). `{flows}`, `{leads}` and `{customers}` carry their
     * preposition (`units.periodFrom`: « de juin à août 2026 »).
     */
    slgPeriods: {
      fr: "Assisté : les flux {flows} ; les leads {leads} (ils ont eu {q} jours) ; les nouveaux clients {customers} (ils ont eu {g} jours).",
      en: "Sales-assisted: flows {flows}; leads {leads} (they've had {q} days); new customers {customers} (they've had {g} days).",
    },
  },

  board: {
    smallCohort: {
      fr: "Petits effectifs : moins de 100 inscrits dans cette cohorte. Lis la direction, pas les décimales.",
      en: "Small numbers: fewer than 100 sign-ups in this cohort. Read the direction, not the decimals.",
    },
    toFill: { fr: "à renseigner", en: "to fill in" },
    // TODO: à relire — nouveau (2026-09-25, retours d'Antoine sur le moteur).
    settings: { fr: "Réglages", en: "Settings" },
    whatIfTitle: { fr: "Et si ?", en: "What if?" },
  },
  /**
   * TODO: à relire (convention 6) — neuf le 2026-10-02 (A18 T2.a, le retour 07 de Claude Design,
   * design/ds-extension-07-return/COPY.md) : la barre du moteur, sa ligne et son menu. `{name}` : le nom de
   * l'entreprise, sinon `unnamed` ; `{model}` : `workbench.modelShort` ; `{month}` : le mois affiché (pour
   * l'assisté seul, ses trois mois de flux).
   */
  bar: {
    line: { fr: "{name} · {model} · {month}", en: "{name} · {model} · {month}" },
    lineReadOnly: { fr: "{name} · {model} · {month} · lecture seule", en: "{name} · {model} · {month} · read-only" },
    lineCorrecting: { fr: "{name} · {model} · {month} · en correction", en: "{name} · {model} · {month} · being corrected" },
    unnamed: { fr: "Moteur sans nom", en: "Unnamed engine" },
    menu: { fr: "Moteur, mois et fichier", en: "Engine, month and file" },
    groupEngine: { fr: "Ce moteur", en: "This engine" },
    switch: { fr: "Changer ou ajouter un moteur", en: "Switch or add an engine" },
    rename: { fr: "Renommer", en: "Rename" },
    monthField: { fr: "Mois affiché", en: "Month shown" },
    groupFile: { fr: "Fichier", en: "File" },
  },
  /**
   * TODO: à relire (convention 6) — neuf le 2026-10-02 (A18 T2.a, le retour 07 de Claude Design) : la
   * prochaine étape, une seule action principale, choisie par `nextStepFor` (`_engine/next-step.ts`).
   * `{number}` : le nom d'un chiffre, en milieu de phrase ; `{role}` : `role.*` ; `{list}` : des noms de
   * chiffres joints ; `{ago}` : `today`, `yesterday` ou `daysAgo`.
   */
  next: {
    where: { fr: "Où tu en es", en: "Where you are" },
    since: { fr: "Dernière visite · {ago}", en: "Last visit · {ago}" },
    today: { fr: "aujourd'hui", en: "today" },
    yesterday: { fr: "hier", en: "yesterday" },
    daysAgo: { fr: "il y a {n} jours", en: "{n} days ago" },
    /** Ranks 4 and 6 (`next-step.ts`): why this number, by its effort. */
    leadQuick: { fr: "Les plus rapides d'abord : tu le trouves seul, en cinq minutes environ.", en: "The quickest first: this one you can find on your own, in about five minutes." },
    leadLong: { fr: "Plus de chiffre rapide : tu le trouves seul, en une heure environ.", en: "No quick number left: this one you can find on your own, in about an hour." },
    leadBuild: { fr: "Plus de chiffre rapide : celui-ci est à construire, compte plus d'une heure.", en: "No quick number left: this one needs building, count on more than an hour." },
    goNumber: { fr: "Passe au chiffre suivant : {number} →", en: "Go to the next number: {number} →" },
    /** Rank 5, one number to ask for: its screen, « Je le demande » open. */
    leadAskOne: { fr: "À demander à quelqu'un d'autre : {number}. Envoie la demande maintenant, remplis le reste en attendant.", en: "To ask someone else: {number}. Send the request now, fill in the rest while you wait." },
    /** The same when nothing is left to find alone: no « rest » to fill while waiting. */
    leadAskOneOnly: { fr: "À demander à quelqu'un d'autre : {number}. Envoie la demande maintenant.", en: "To ask someone else: {number}. Send the request now." },
    goAsk: { fr: "Demande à l'équipe {role} : {number} →", en: "Ask {role}: {number} →" },
    /** Rank 5, two or more: the requests, by role. `{n}` ≥ 2. */
    leadAskAll: { fr: "{n} chiffres viennent de quelqu'un d'autre : envoie les demandes maintenant, remplis le reste en attendant.", en: "{n} numbers come from someone else: send the requests now, fill in the rest while you wait." },
    /** The same when nothing is left to find alone: no « rest » to fill while waiting. */
    leadAskAllOnly: { fr: "{n} chiffres viennent de quelqu'un d'autre : envoie les demandes maintenant.", en: "{n} numbers come from someone else: send the requests now." },
    goRequests: { fr: "Demande tes {n} chiffres →", en: "Ask for your {n} numbers →" },
    skipRequests: { fr: "Taper d'abord le chiffre suivant", en: "Type the next number first" },
    /** Ranks 7 and 8: the slides. */
    leadWaiting: { fr: "Plus rien à taper : {n} chiffres demandés attendent leur réponse.", en: "Nothing left to type: {n} numbers you asked for are waiting for an answer." },
    leadWaitingOne: { fr: "Plus rien à taper : un chiffre demandé attend sa réponse.", en: "Nothing left to type: one number you asked for is waiting for an answer." },
    leadAnswered: { fr: "Chaque chiffre a une réponse.", en: "Every number has an answer." },
    verdictIsSlide: { fr: "Ton verdict, ci-dessus, est le titre de ta première slide.", en: "Your verdict above is the title of your first slide." },
    /** Rank 1: the device refused the last write (the lead is `storage.writeFailed`). */
    goSaveFile: { fr: "Sauvegarde ton moteur dans un fichier (.json) →", en: "Save your engine to a file (.json) →" },
    /** Rank 2: a past month on screen (the lead is `series.viewing` or `series.correcting`). */
    goBack: { fr: "Reviens à {month} →", en: "Go back to {month} →" },
    /** Rank 3: the next month can start (the lead is `series.ready`). */
    goMonth: { fr: "Démarre {month} →", en: "Start {month} →" },
    keepFilling: { fr: "Continuer à remplir {month}", en: "Keep filling {month}" },
    /** A request unanswered long enough to follow up, one line per role. */
    asked: { fr: "Demandé à l'équipe {role} {ago} : {list}, réponse pas encore saisie.", en: "Asked {role} {ago}: {list}, no answer typed yet." },
    followUp: { fr: "Relancer", en: "Follow up" },
    /** While the engine needs a backup: never saved, or changed since. */
    backup: { fr: "Jamais sauvegardé dans un fichier : Safari peut l'effacer après sept jours d'utilisation sans passage ici.", en: "Never saved to a file: Safari may erase it after seven days of use without a visit here." },
    backupChanged: { fr: "Modifié depuis ta sauvegarde du {date} : Safari peut l'effacer après sept jours d'utilisation sans passage ici.", en: "Changed since you saved it on {date}: Safari may erase it after seven days of use without a visit here." },
    /** At the board's end while the slides are not the next step. */
    slidesQuiet: { fr: "Prépare tes slides avec ce que tu as →", en: "Prepare your slides with what you have →" },
  },
  /**
   * TODO: à relire (convention 6) — neuf le 2026-10-02 (A18 T2.b, le retour 07 de Claude Design,
   * design/ds-extension-07-return/COPY.md) : « Tes chiffres », la liste par étape qui remplace les onglets
   * (C41), sa progression par ce qui reste, et l'en-tête de l'écran d'un chiffre ouvert depuis elle. `xOne`
   * sert aussi pour 0, comme le français le veut (« 0 sur 3 trouvé »).
   */
  list: {
    title: { fr: "Tes chiffres", en: "Your numbers" },
    found: { fr: "{n} sur {N} trouvés", en: "{n} of {N} found" },
    foundOne: { fr: "{n} sur {N} trouvé", en: "{n} of {N} found" },
    /** The stage a team target names (C1): its red said in words too. Was the tab's stamp. */
    holds: { fr: "Freine ici", en: "Holds you back" },
    /** What remains, first: never « fini » while a number has no answer. `{n}` ≥ 2. */
    toGo: { fr: "{n} à faire", en: "{n} to go" },
    lastOne: { fr: "Plus qu'un", en: "Last one to go" },
    noneToGo: { fr: "Plus rien à faire", en: "None to go" },
    countFound: { fr: "{n} trouvés", en: "{n} found" },
    countFoundOne: { fr: "1 trouvé", en: "1 found" },
    countEst: { fr: "{n} estimés", en: "{n} estimated" },
    countEstOne: { fr: "1 estimé", en: "1 estimated" },
    countAsked: { fr: "{n} demandés", en: "{n} asked" },
    countAskedOne: { fr: "1 demandé", en: "1 asked" },
    countCant: { fr: "{n} introuvables", en: "{n} can't be found" },
    countCantOne: { fr: "1 introuvable", en: "1 can't be found" },
    /** The marks: their list's name, a stage's (`{list}`: the status words, joined), and their legend. */
    marksLabel: { fr: "Tes chiffres, étape par étape", en: "Your numbers, stage by stage" },
    groupLabel: { fr: "{stage} : {list}", en: "{stage}: {list}" },
    legendLabel: { fr: "Ce que disent les marques", en: "What the marks mean" },
    /** A number's answer, as a row's tag and the legend say it. */
    status: {
      found: { fr: "Trouvé", en: "Found" },
      est: { fr: "Estimé", en: "Estimated" },
      asked: { fr: "Demandé", en: "Asked" },
      cant: { fr: "Introuvable", en: "Can't find" },
      todo: { fr: "À faire", en: "To do" },
      na: { fr: "Sans objet", en: "Not applicable" },
    },
    /** The number's screen, opened from the list: where it sits, and the way back to its row. */
    position: { fr: "{stage} · {i} sur {n}", en: "{stage} · {i} of {n}" },
    back: { fr: "← Tes chiffres", en: "← Your numbers" },
  },
  /**
   * TODO: à relire (convention 6) — neuf le 2026-10-02 (A18 T2.c, le retour 07 de Claude Design,
   * design/ds-extension-07-return/COPY.md) : « Et si ? » par un seul levier, devant le panneau complet.
   * `{lever}` : le nom d'un chiffre du catalogue, en étiquette (jamais sujet d'une phrase) ; `{today}` :
   * `scenario.leverToday` rempli ; `{from}`, `{to}` : des valeurs formatées ; `{n}` ≥ 2.
   */
  lever: {
    untouched: { fr: "Bouge le levier de l'étape qui freine, et vois ce qui suit.", en: "Move the lever of the stage that holds you back, and see what follows." },
    /** Two stages or more hold back as much (the `shared` diagnosis): the card's lever is one of theirs. */
    untouchedShared: { fr: "Bouge le levier d'une des étapes qui freinent, et vois ce qui suit.", en: "Move the lever of one of the stages that hold you back, and see what follows." },
    /** Fewer than two stages have a target: no stage can be named yet (C1). */
    untouchedNoStage: {
      fr: "Bouge un levier et vois ce qui suit. Avec des cibles sur au moins deux étapes, le levier de celle qui freine passe en premier.",
      en: "Move one lever and see what follows. With targets on at least two stages, the lever of the one that holds you back comes first.",
    },
    /** Nothing holds back, or a target names a stage none of whose numbers is a lever with a value: the first one typed, in the funnel's order. */
    untouchedOther: { fr: "Bouge un levier et vois ce qui suit.", en: "Move one lever and see what follows." },
    /** This lever unmoved, another moved in the full panel: the figures already count it. */
    untouchedWithOthers: { fr: "Bouge aussi ce levier, avec ceux que tu as déjà bougés.", en: "Move this lever too, with the ones you have already moved." },
    /** `{from}` may be a range (« 6 à 9 % »): never « de 6 à 9 % à 12 % ». */
    moved: { fr: "Et si : {lever}, {to} au lieu de {from}", en: "What if: {lever}, {to} instead of {from}" },
    /** The figures count the levers moved in the full panel too. */
    movedWithOthers: { fr: "Et si : {lever}, {to} au lieu de {from}, avec tes autres leviers", en: "What if: {lever}, {to} instead of {from}, with your other levers" },
    label: { fr: "{lever} ({today})", en: "{lever} ({today})" },
    /** The funnel is the month's: so is this figure, beside « MRR dans 12 mois ». */
    payingMonth: { fr: "Nouveaux payants par mois", en: "New paying customers a month" },
    /** Without the month's sign-up count, the funnel reads per 100 sign-ups: so does this figure. */
    payingPerHundred: { fr: "Nouveaux payants pour 100 inscrits", en: "New paying customers per 100 sign-ups" },
    all: { fr: "Vois les {n} leviers et ce que le calcul suppose →", en: "See the {n} levers and what the calculation assumes →" },
    allOne: { fr: "Vois ce que le calcul suppose →", en: "See what the calculation assumes →" },
    /** The full panel's summary, under the card: not « Et si ? » a second time. */
    panel: { fr: "Tous les leviers ensemble", en: "All the levers together" },
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
    // TODO: à relire (convention 6) — neuf le 2026-09-30 (A7.3.c S1, ENGINE.md §18.5).
    "slg.acq.lead-to-opp": { fr: "le passage des leads en opportunités", en: "lead-to-opportunity conversion" },
    "slg.act.go-live": { fr: "la mise en production", en: "go-live" },
    "slg.ret.renewal": { fr: "le renouvellement des contrats", en: "contract renewal" },
    "slg.ref.referred-share": { fr: "la part des opportunités recommandées", en: "the referred share of opportunities" },
    "slg.rev.win-rate": { fr: "le taux de closing", en: "the win rate" },
  } satisfies Record<CandidateId, Translatable>,
  /**
   * The activation event inside a sentence — what the catalogue's `{event}`
   * receives in formulas, recipes and requests. The user's own words are
   * quoted and introduced, never spliced in bare: « combien ont déclenché
   * l'événement « a créé un premier projet » » reads; « combien ont fait a créé
   * un premier projet » doesn't. `unnamed` before anyone has named it.
   */
  event: {
    named: { fr: "l'événement « {name} »", en: "the \"{name}\" event" },
    unnamed: { fr: "l'événement d'activation", en: "the activation event" },
  },
  /**
   * An input of the three computed figures after « il manque » / "missing:" —
   * with its article in French (« il manque la marge brute », never « il manque
   * marge brute »). Keyed by the only four ids `DERIVED_SHAPES` names as inputs.
   */
  unitInput: {
    "acq.cac": { fr: "le CAC", en: "CAC" },
    "rev.arpa": { fr: "l'ARPA mensuel", en: "monthly ARPA" },
    "rev.gross-margin": { fr: "la marge brute", en: "gross margin" },
    "ret.logo-churn": { fr: "le churn logo", en: "logo churn" },
    // TODO: à relire — nouveau (2026-09-26, expansion et rétrogradation).
    "rev.expansion": { fr: "l'expansion", en: "expansion" },
    "rev.contraction": { fr: "la rétrogradation", en: "contraction" },
    // TODO: à relire (convention 6) — neuf le 2026-09-30 (A7.3.c S1, ENGINE.md §18.5).
    "slg.acq.cac": { fr: "le CAC assisté", en: "sales-assisted CAC" },
    "slg.rev.acv": { fr: "l'ACV des nouveaux contrats", en: "new contracts' ACV" },
    "slg.rev.gross-margin": { fr: "la marge brute de l'assisté", en: "sales-assisted gross margin" },
    "slg.ret.renewal": { fr: "le renouvellement des contrats", en: "contract renewal" },
  } satisfies Record<UnitInputId, Translatable>,
  /**
   * Where a value sits against its comparator — the team's target (« la
   * cible », never « ta cible »: these reach a slide), the only one that
   * names a stage (C1, 2026-09-29). Physical, not good-or-bad: the code maps
   * a position to one of them through the metric's direction, so churn
   * behind its target is « au-dessus de la cible ». Gender-free on purpose,
   * so they follow any stage phrase: « le churn logo est au-dessus de la
   * cible ».
   */
  side: {
    underTarget: { fr: "sous la cible", en: "below the target" },
    overTarget: { fr: "au-dessus de la cible", en: "above the target" },
    atTarget: { fr: "à la cible", en: "at the target" },
    maybeUnderTarget: { fr: "peut-être sous la cible", en: "possibly below the target" },
    maybeOverTarget: { fr: "peut-être au-dessus de la cible", en: "possibly above the target" },
  },
  /**
   * What closing a gap is worth, as a phrase — the slide's « À côté » list and
   * the speaker note that compares a stage with the one named. Read from the
   * SAME `whatIf` chain the calculation prints, never recomputed.
   */
  worth: {
    newMrr: { fr: "{amount} de MRR nouveau par mois", en: "{amount} of new MRR a month" },
    retainedMrr: { fr: "{amount} de MRR préservé par mois", en: "{amount} of retained MRR a month" },
    customers: { fr: "{n} clients payants de plus par mois", en: "{n} more paying customers a month" },
    customersOne: { fr: "{n} client payant de plus par mois", en: "{n} more paying customer a month" },
    kept: { fr: "{n} clients gardés par mois", en: "{n} customers kept a month" },
    keptOne: { fr: "{n} client gardé par mois", en: "{n} customer kept a month" },
    perHundred: { fr: "{n} payants de plus pour 100 inscrits", en: "{n} more paying customers per 100 sign-ups" },
    perHundredOne: { fr: "{n} payant de plus pour 100 inscrits", en: "{n} more paying customer per 100 sign-ups" },
    lessThanOne: { fr: "moins d'un client de plus par mois", en: "less than one more customer a month" },
    /** Sales-assisted: its chains count a quarter (§18.5.3). The money keys above serve both: they say « par mois ». */
    // TODO: à relire (convention 6) — neuf le 2026-09-30 (A7.3.c S1, ENGINE.md §18.5) : customersQuarter(One), keptQuarter(One), perHundredLead/Win/Renewal(One), lessThanOneQuarter, lessThanOneKept.
    customersQuarter: { fr: "{n} nouveaux clients de plus par trimestre", en: "{n} more new customers a quarter" },
    customersQuarterOne: { fr: "{n} nouveau client de plus par trimestre", en: "{n} more new customer a quarter" },
    keptQuarter: { fr: "{n} contrats gardés de plus par trimestre", en: "{n} more contracts kept a quarter" },
    keptQuarterOne: { fr: "{n} contrat gardé de plus par trimestre", en: "{n} more contract kept a quarter" },
    /** Read on the relay's own 100, never a chain (§18.5.3); `{base}` is « leads » or « MQL ». */
    perHundredLead: { fr: "{n} opportunités de plus pour 100 {base}", en: "{n} more opportunities per 100 {base}" },
    perHundredLeadOne: { fr: "{n} opportunité de plus pour 100 {base}", en: "{n} more opportunity per 100 {base}" },
    perHundredWin: { fr: "{n} signatures de plus pour 100 opportunités conclues", en: "{n} more deals signed per 100 closed opportunities" },
    perHundredWinOne: { fr: "{n} signature de plus pour 100 opportunités conclues", en: "{n} more deal signed per 100 closed opportunities" },
    perHundredRenewal: { fr: "{n} contrats gardés de plus pour 100 contrats échus", en: "{n} more contracts kept per 100 up for renewal" },
    perHundredRenewalOne: { fr: "{n} contrat gardé de plus pour 100 contrats échus", en: "{n} more contract kept per 100 up for renewal" },
    lessThanOneQuarter: { fr: "moins d'un client de plus par trimestre", en: "less than one more customer a quarter" },
    lessThanOneKept: { fr: "moins d'un contrat gardé de plus par trimestre", en: "less than one more contract kept a quarter" },
  },

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
    // TODO: à relire (convention 6) — neuf le 2026-09-30 (A7.3.c S0, C25 Q9) : les rôles de la vente assistée.
    sales: { fr: "Commercial", en: "Sales" },
    "customer-success": { fr: "Customer Success", en: "Customer success" },
  },
  basis: {
    teamHunch: { fr: "Intuition d'équipe", en: "Team hunch" },
    oldNumber: { fr: "Un ancien chiffre", en: "An old number" },
    sample: { fr: "Un échantillon", en: "A sample" },
    other: { fr: "Autre", en: "Other" },
    // TODO: à relire (convention 6) — neuf le 2026-09-30 (A7.3.c S0, C25 Q4) : le repli d'une marge par motion.
    companyWide: { fr: "La marge globale de l'entreprise", en: "The company-wide margin" },
  },
  source: {
    someoneTold: { fr: "Quelqu'un me l'a donné", en: "Someone gave it to me" },
    other: { fr: "Autre", en: "Other" },
    /** « Autre » is a label; after « selon » / "according to", a source reads as a phrase. */
    otherInSentence: { fr: "une autre source", en: "another source" },
  },
  /** Display names of the tools a source can name. Proper nouns, except the three generic ones. */
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
    // TODO: à relire (convention 6) — neuf le 2026-09-30 (A7.3.c S0) : les outils de la vente assistée (§18.2).
    pipedrive: { fr: "Pipedrive", en: "Pipedrive" },
    "cs-platform": { fr: "Outil de Customer Success (Gainsight, Vitally, Planhat…)", en: "Customer success platform (Gainsight, Vitally, Planhat…)" },
  } satisfies Record<ToolId, Translatable>,

  /**
   * The numeric grammar `format.ts` needs, kept here so every word the reader sees is in one reviewable place.
   * French binds a unit to its number with U+00A0 (« 7 jours », « 2,6 fois », « T1 2027 »): a slide
   * title wraps wherever it likes, and a number alone at the end of a line reads as a different number.
   */
  units: {
    range: { fr: "{lo} à {hi}", en: "{lo}–{hi}" },
    perHundred: { fr: "{n} sur 100", en: "{n} in 100" },
    lessThanOnePerHundred: { fr: "moins de 1 sur 100 ({n} sur 1 000)", en: "fewer than 1 in 100 ({n} in 1,000)" },
    approx: { fr: "~{n}", en: "~{n}" },
    days: { fr: "{n} jours", en: "{n} days" },
    daysOne: { fr: "1 jour", en: "1 day" },
    hours: { fr: "{n} heures", en: "{n} hours" },
    hoursOne: { fr: "1 heure", en: "1 hour" },
    months: { fr: "{n} mois", en: "{n} months" },
    monthsOne: { fr: "1 mois", en: "1 month" },
    times: { fr: "{n} fois", en: "{n}×" },
    quarter: { fr: "T{q} {year}", en: "Q{q} {year}" },
    /**
     * TODO: à relire — nouveau (2026-09-26, slides « Et si »). A change,
     * signed (`format.ts#formatChange`). The minus is U+2013, the glyph the
     * copy already writes for a loss: U+2212 is in none of the slide fonts.
     */
    plus: { fr: "+{n}", en: "+{n}" },
    minus: { fr: "–{n}", en: "–{n}" },
    /**
     * TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S2, C25 Q2) :
     * a run of months, everything sales-assisted reads three (`format.ts#formatMonthRange`).
     * `{from}` drops its year when both ends share one: « juin à août 2026 ».
     * The prepositional forms open a period inside a sentence; French elides
     * before a vowel (« d'avril à juin 2026 »), which the code decides.
     */
    monthRange: { fr: "{from} à {to}", en: "{from} to {to}" },
    periodFrom: { fr: "de {range}", en: "from {range}" },
    periodFromElided: { fr: "d'{range}", en: "from {range}" },
    periodIn: { fr: "en {range}", en: "in {range}" },
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
    // TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T4, §19.5.3) : splitSource, denominatorSource.
    splitSource: { fr: "Le dénominateur vient d'un autre outil", en: "The denominator comes from another tool" },
    denominatorSource: { fr: "D'où vient le dénominateur ?", en: "Where does the denominator come from?" },
    variant: { fr: "Ce qui est compté", en: "What's counted" },
    channelName: { fr: "Nom du canal", en: "Channel name" },
    evidence: { fr: "Comment le sais-tu ?", en: "How do you know?" },
    // TODO: à relire (convention 6) — 2026-09-30 (C29) : « facultatif » sort du libellé, la prop `optional` le dessine (workbench.optional).
    definitionNote: { fr: "Ta définition", en: "Your definition" },
    definitionNoteHint: {
      fr: "Par exemple « actif = au moins un projet modifié ». Elle apparaît dans l'annexe des slides et dans les demandes que tu copies.",
      en: "For example \"active = at least one project edited\". It appears in the slides' appendix and in the requests you copy.",
    },
    low: { fr: "Au moins", en: "At least" },
    high: { fr: "Au plus", en: "At most" },
    basis: { fr: "Sur quoi repose l'estimation ?", en: "What is the estimate based on?" },
    // TODO: à relire (convention 6) — réécrit le 2026-10-01 (A15.3) : il disait l'erreur, il dit le geste.
    lowAboveHigh: { fr: "Échange les deux : le minimum dépasse le maximum.", en: "Swap the two: the minimum is above the maximum." },
    wideRange: {
      fr: "Une fourchette aussi large ne dit presque rien — et c'est déjà une information.",
      en: "A range this wide says almost nothing — and that is already information.",
    },
    whereTitle: { fr: "Où le trouver", en: "Where to find it" },
    trapTitle: { fr: "Le piège", en: "The trap" },
    alsoIn: { fr: "Aussi dans {tool} : {metrics}", en: "Also in {tool}: {metrics}" },
    reference: { fr: "Repère", en: "Reference" },
    referenceContext: {
      fr: "{range} · pour situer, sans désigner d'étape : {caveat}",
      en: "{range} · for context, never to name a stage: {caveat}",
    },
    noReference: { fr: "Pas de repère publiable : {reason}.", en: "No reference worth publishing: {reason}." },
    dependsOnEvent: {
      fr: "Il faut d'abord nommer l'événement d'activation : sans lui, ce taux ne veut rien dire.",
      en: "Name the activation event first: without it, this rate means nothing.",
    },
    note: { fr: "Note pour toi", en: "Note to self" },
    noteHint: { fr: "Jamais sur une slide.", en: "Never on a slide." },
    save: { fr: "Enregistrer", en: "Save" },
    tooLong: { fr: "{n} caractères au plus.", en: "{n} characters at most." },
    // TODO: à relire — nouveau (2026-09-25, retours d'Antoine sur le moteur).
    sharedHint: {
      fr: "Même nombre que pour {metrics} : le modifier ici le modifie partout.",
      en: "Same number as for {metrics}: changing it here changes it everywhere.",
    },
    offBase: { fr: "Compté sur {n}, pas sur ta base de {base}.", en: "Counted on {n}, not on your base of {base}." },
    /**
     * TODO: à relire (convention 6) — le 2026-10-02 (A18 T3.b, le retour 07, design/ds-extension-07-return/COPY.md) :
     * le pas à pas fondu dans le tableau, l'écran d'un chiffre mène au suivant. `saveNext` passe à l'impératif,
     * comme les autres flèches (en-tête du fichier) ; `saveLast` quand plus rien ne reste à trouver seul ni à
     * demander, hors les chiffres passés pour l'instant ; `skip` laisse « à faire » un chiffre qui l'est ;
     * `continue` après une demande copiée, qui est l'enregistrement. Écarts au retour : `saveLast` et `skip` à
     * l'impératif aussi (le retour : « Enregistrer et voir ton moteur → », « Passer pour l'instant ») ; `continue`
     * n'y est pas, la session l'a écrit.
     */
    saveNext: { fr: "Enregistre et continue →", en: "Save and continue →" },
    saveLast: { fr: "Enregistre et vois ton moteur →", en: "Save and see your engine →" },
    skip: { fr: "Passe pour l'instant", en: "Skip for now" },
    continue: { fr: "Continue →", en: "Continue →" },
    /**
     * TODO: à relire (convention 6) — neuf le 2026-10-02 (A18 T1, le retour 07 de Claude Design,
     * design/ds-extension-07-return/COPY.md) : l'écran d'un chiffre, le piège avant la valeur, les trois
     * autres réponses sous les cases, « Comment il se situe » en un objet, la définition et la note repliées.
     */
    trapLabel: { fr: "Le piège, avant de taper", en: "The trap, before you type" },
    writeDefinition: { fr: "Écrire ta définition", en: "Write your definition" },
    hybridTrapLabel: { fr: "Si tu vends des deux façons", en: "When you sell both ways" },
    answerLegend: { fr: "Pas de chiffre sous la main ?", en: "No figure to hand?" },
    /** The same over the three answers that are not numbers (the activation event, the churn cause, the referral mechanism): a name is not « un chiffre » (Antoine, 2026-09-26). */
    answerLegendAnswer: { fr: "Pas de réponse sous la main ?", en: "No answer to hand?" },
    answerBack: { fr: "← J'ai le chiffre, finalement", en: "← I have the figure after all" },
    /** The same over an answer that is not a number. */
    answerBackAnswer: { fr: "← J'ai la réponse, finalement", en: "← I have the answer after all" },
    askCopied: { fr: "Copiée le {date}. Ton moteur te rappellera de relancer.", en: "Copied on {date}. Your engine will remind you to follow it up." },
    whereYours: { fr: "ton outil", en: "your tool" },
    tourAnswer: { fr: "Dans le Tour, tu as répondu : « {answer} »", en: "In the Tour, you answered: \"{answer}\"" },
    compareTitle: { fr: "Comment il se situe", en: "How it compares" },
    compareYours: { fr: "Ton chiffre {value}", en: "Your figure {value}" },
    compareReference: { fr: "Repère {range}", en: "Reference {range}" },
    compareTarget: { fr: "La cible de ton équipe", en: "Your team's target" },
    compareTargetValue: { fr: "La cible de ton équipe {value}", en: "Your team's target {value}" },
    compareTargetHint: {
      fr: "Seule une cible désigne l'étape qui freine. Sans cible, le chiffre compte quand même.",
      en: "Only a target names the stage that holds you back. Without one, the figure still counts.",
    },
    compareNoTargetHere: { fr: "Ce chiffre situe ; il ne désigne pas d'étape.", en: "This number situates; it does not name a stage." },
    compareCaveat: { fr: "Pour situer, sans désigner d'étape : {caveat}", en: "For context, never to name a stage: {caveat}" },
    /** The chart in words, for a screen reader: `{target}` is `compareChartTarget` or `compareChartNoTarget`. */
    compareChart: { fr: "{name} : {value}. Repère {range}. {target}", en: "{name}: {value}. Reference {range}. {target}" },
    compareChartTarget: { fr: "Cible {value}.", en: "Target {value}." },
    compareChartNoTarget: { fr: "Pas de cible.", en: "No target." },
    compareChartNoValue: { fr: "pas encore de chiffre", en: "no figure yet" },
    /** The same, for a number with no published reference. */
    compareChartNoReference: { fr: "{name} : {value}. {target}", en: "{name}: {value}. {target}" },
    wordsSummary: { fr: "Ta définition et une note", en: "Your definition and a note" },
    /**
     * TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S2, ENGINE.md §18.7 E3, §18.4.6, C25
     * Q2-Q4) : the sales-assisted period, the company-wide margin, and the
     * self-serve traps that only hold in the hybrid.
     */
    /** A sales-assisted flow: its three months, with their preposition. */
    periodSlg: {
      fr: "Prends les trois mois {period} : un seul mois compte trop peu d'affaires.",
      en: "Take the three months {period}: a single month has too few deals.",
    },
    /** A sales-assisted cohort (leads, new customers): the three months that have had their window. */
    periodSlgCohort: {
      fr: "Prends les trois mois {period} : ceux d'après n'ont pas encore eu {n} jours.",
      en: "Take the three months {period}: the later ones haven't had {n} days yet.",
    },
    /** The two margin sheets, in the hybrid only (C25 Q4): saved as an estimate, counted approximate, never found. */
    companyWide: { fr: "Reprendre la marge globale", en: "Use the company-wide margin" },
    companyWideHint: {
      fr: "Elle sera comptée approximative : une marge globale n'est celle d'aucune des deux motions. Demande la marge par motion à la finance.",
      en: "It will count as approximate: a company-wide margin belongs to neither motion. Ask finance for the margin by motion.",
    },
    /** `{motion}`: `hybrid.motionAdjective`. */
    companyWidePrefilled: {
      fr: "Pré-remplie avec la marge globale déjà saisie côté {motion}.",
      en: "Prefilled with the company-wide margin already entered on the {motion} side.",
    },
    /** Five self-serve sheets gain a trap in the hybrid only (C25 Q3) — `phrases.ts#hybridTrapOf` says which, and when. */
    hybridTrap: {
      leaves: {
        fr: "Un compte passé à l'assisté n'est ni perdu, ni en baisse, ni en hausse : il quitte le libre-service. Si ton outil de facturation l'annule, retire-le des perdus.",
        en: "An account that moved to sales-assisted isn't lost, downgraded or expanded: it leaves self-serve. If your billing tool cancels it, take it out of the lost accounts.",
      },
      signedBySales: {
        fr: "Un compte signé par un commercial compte en assisté, même s'il est né ici.",
        en: "An account signed by a salesperson counts as sales-assisted, even if it started here.",
      },
    },
  },
  triage: {
    question: { fr: "Pourquoi ?", en: "Why?" },
    repair: { fr: "Le réparer prendrait", en: "Fixing it would take" },
    // TODO: à relire (convention 6) — 2026-09-30 (C29) : « facultatif » sort du libellé, la prop `optional` le dessine (workbench.optional).
    repairComment: { fr: "Précision", en: "Detail" },
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
    /**
     * The same request when everything asked for is an answer, not a number (the activation
     * event, the churn cause, the referral mechanism): « des chiffres bruts » would ask a
     * colleague for figures there are none of.
     */
    // TODO: à relire — nouveau (2026-09-26, retour d'Antoine).
    messageAnswers: {
      fr: "Bonjour — je prépare un point sur notre moteur de croissance. Pourrais-tu me dire :\n{list}\nQuelques mots suffisent. Merci !",
      en: "Hi — I'm preparing a review of our growth engine. Could you tell me:\n{list}\nA few words are enough. Thanks!",
    },
    item: { fr: "– {what} ({definition})", en: "– {what} ({definition})" },
    itemNoDefinition: { fr: "– {what}", en: "– {what}" },
    /** The hybrid: one request per role covers both motions, each motion's numbers under its heading (§18.7, E4). */
    // TODO: à relire (convention 6) — neuf le 2026-09-30 (A7.3.c S1, ENGINE.md §18.5).
    groupPlg: { fr: "Libre-service :", en: "Self-serve:" },
    groupSlg: { fr: "Assisté :", en: "Sales-assisted:" },
  },
  /**
   * TODO: à relire (convention 6) — le 2026-10-02 (A18 T3.c, le retour 07, design/ds-extension-07-return/COPY.md) :
   * les demandes en un écran (`AskList`), à la place de « À aller chercher » replié en bas du tableau, qui part.
   * `lead` est l'ancien `collect.hint`, inchangé. `{n}` ≥ 2 : l'écran ne s'ouvre que pour deux demandes ou plus
   * (une seule ouvre l'écran de son chiffre). `{date}` : `formatDate`. `doneBoard` quand rien ne reste à trouver
   * seul : le bouton mène au tableau. Écarts au retour : `doneBoard` n'y est pas, la session l'a écrit ; `done`
   * y dit « C'est envoyé, chiffre suivant → », passé à l'impératif comme les autres CTA à flèche (40 caractères).
   * Une carte copiée dit `sheet.askCopied`, la phrase de la fiche, plutôt qu'une clé de plus qui dirait la même chose.
   */
  asks: {
    title: { fr: "À demander ({n})", en: "To ask for ({n})" },
    lead: {
      fr: "Envoie les demandes aujourd'hui, remplis le reste en attendant les réponses.",
      en: "Send the requests today, and fill in the rest while you wait for answers.",
    },
    done: { fr: "C'est envoyé, passe au chiffre suivant →", en: "Sent, go to the next number →" },
    doneBoard: { fr: "C'est envoyé, vois ton moteur →", en: "Sent, see your engine →" },
  },

  /**
   * The collection screens' own chrome (P4) — labels and messages the spec's
   * §14 inventory did not list but the screens need: a visible label for
   * every control, a message for every refusal. TODO: à relire — copie neuve
   * (convention 6), rédigée par la session de code ; P3 may reword freely.
   */
  workbench: {
    choose: { fr: "Choisir…", en: "Choose…" },
    // TODO: à relire (convention 6) — réécrit le 2026-10-01 (A15.3) : un exemple de ce qu'il faut écrire, plutôt que « pas lisible ».
    notANumber: { fr: "Écris un nombre, par exemple 1 250 ou 18,5.", en: "Type a number, such as 1,250 or 18.5." },
    notAWholeNumber: { fr: "Un nombre entier : on compte des personnes.", en: "A whole number: these are people." },
    sourceRole: { fr: "Qui te l'a donné ?", en: "Who gave it to you?" },
    countsBack: { fr: "J'ai les deux comptes", en: "I have both counts" },
    durationUnit: { fr: "Unité", en: "Unit" },
    hours: { fr: "heures", en: "hours" },
    days: { fr: "jours", en: "days" },
    // TODO: à relire (convention 6) — ajouté le 2026-09-30 (A11.1) : l'unité d'une durée au singulier, « 1 jour ».
    day: { fr: "jour", en: "day" },
    // TODO: à relire (convention 6) — ajouté le 2026-09-30 (C29) : le mot que la prop `optional` dessine après un libellé.
    optional: { fr: "facultatif", en: "optional" },
    saved: { fr: "Enregistré", en: "Saved" },
    saveNeeds: { fr: "Pour enregistrer, il manque : {fields}", en: "To save, still missing: {fields}" },
    percentRange: { fr: "Un taux se situe entre 0 et 100 %.", en: "A rate sits between 0 and 100%." },
    // TODO: à relire (convention 6) — A15.10 (2026-10-01).
    countNegative: { fr: "Un compte ne peut pas être négatif.", en: "A count can't be negative." },
    // TODO: à relire (convention 6) — A15.3 (2026-10-01) : un montant ou une durée négatifs étaient dits « manquants ».
    amountNegative: { fr: "Un montant ne peut pas être négatif.", en: "An amount can't be negative." },
    // TODO: à relire (convention 6).
    durationNegative: { fr: "Une durée ne peut pas être négative.", en: "A duration can't be negative." },
    denominatorZero: { fr: "Le second compte ne peut pas valoir zéro.", en: "The second count can't be zero." },
    copyFailed: {
      fr: "La copie n'a pas marché dans ce navigateur : sélectionne le texte ci-dessous.",
      en: "Copying didn't work in this browser: select the text below.",
    },
    importOpen: { fr: "Ouvrir ce fichier", en: "Open this file" },
    noCompany: { fr: "Sans nom", en: "Unnamed" },
    /** The model as the engine bar's line says it (A18 T2.a) — the setup's labels are sentences, too long for a mono line. */
    modelShort: {
      selfserve: { fr: "libre-service", en: "self-serve" },
      // TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S2, §18.7).
      salesAssisted: { fr: "assisté", en: "sales-assisted" },
      hybrid: { fr: "libre-service et assisté", en: "self-serve and sales-assisted" },
    },
    /** The mark on the comparison strip's target line, written beside the track, never inside it (§8.3). */
    targetMark: { fr: "ta cible", en: "your target" },
    /** The source list's second group: the tools this number is not usually found in, still offered. */
    otherTools: { fr: "Autres outils", en: "Other tools" },
  },

  /**
   * TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S2, ENGINE.md
   * §18.6-§18.7). « Deux moteurs, un total »: the words that name a motion,
   * and the sentences the hybrid prints once. Never a comparative (§18.6.4):
   * `engine-copy.test.ts` sweeps this section, `total` and the hybrid's
   * slide titles for one. The order is fixed everywhere: self-serve, then
   * sales-assisted.
   */
  hybrid: {
    /** A heading or a label: the column eyebrows, the selector, the annex and slide groups. */
    motionName: {
      plg: { fr: "Libre-service", en: "Self-serve" },
      slg: { fr: "Assisté", en: "Sales-assisted" },
    },
    /** As a subject, with its article: « Décocher l'assisté ». */
    motionSubject: {
      plg: { fr: "le libre-service", en: "self-serve" },
      slg: { fr: "l'assisté", en: "sales-assisted" },
    },
    /** As an adjective or a mid-sentence label: « un client assisté », « côté libre-service », « assisté 10 sur 15 ». */
    motionAdjective: {
      plg: { fr: "libre-service", en: "self-serve" },
      slg: { fr: "assisté", en: "sales-assisted" },
    },
    /** After « le MRR »: « le MRR de l'assisté » / "sales-assisted MRR". */
    ofMotion: {
      plg: { fr: "du libre-service", en: "self-serve" },
      slg: { fr: "de l'assisté", en: "sales-assisted" },
    },
    /** The motion selector's accessible name: which motion's stages and what-ifs show below it. */
    selectorLabel: { fr: "Motion affichée : étapes et « Et si »", en: "Motion shown: stages and what-ifs" },
    /** A column's eyebrow over its diagnosis: `{verdict}` a `diagnosis` title, lower-cased by the code. */
    diagnosisEyebrow: { fr: "{motion} — {verdict}", en: "{motion} — {verdict}" },
    /** The fixed sentence under the two diagnoses and at the foot of the side-by-side slide (§18.6.4). */
    twoSegments: {
      fr: "Deux motions, deux segments : chacune se lit contre ses cibles, pas contre l'autre.",
      en: "Two motions, two segments: each is read against its own targets, not against the other.",
    },
    /** One motion's coverage in a line of both: the resume band, the import preview (« libre-service 11 sur 17 · assisté 10 sur 15 »). */
    motionCount: { fr: "{motion} {n} sur {N}", en: "{motion} {n} of {N}" },
    /** A motion unticked whose numbers are kept, in the import preview (§18.1.2). */
    motionCountHidden: { fr: "{motion} {n} sur {N} (masqué)", en: "{motion} {n} of {N} (hidden)" },
    /** The link (§18.6.3): the title of its closed group at the end of sales-assisted's list, and its position on its own screen (A18 T2.b). */
    linkBlock: { fr: "Liaison avec le libre-service", en: "Link with self-serve" },
  },
  /**
   * TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S2, ENGINE.md
   * §18.6.2-§18.6.3, §18.8.2). The band « Deux moteurs, un total » and the
   * `total` slide's body. A total is a SUM, and the total shown is the sum of
   * the parts shown (`total.ts#formatSum`): every line here can be redone
   * with a calculator.
   */
  total: {
    title: { fr: "Deux moteurs, un total", en: "Two engines, one total" },
    mrr: { fr: "MRR", en: "MRR" },
    newMrr: { fr: "Nouveau MRR du mois", en: "New MRR this month" },
    /** `{plg} + {slg} = {total}`: `total.formatSum`'s three strings, each part rounded to the common unit. */
    newMrrSum: { fr: "Nouveau MRR du mois : {plg} + {slg} = {total}", en: "New MRR this month: {plg} + {slg} = {total}" },
    mrr12Sum: { fr: "Dans 12 mois, au rythme actuel : {plg} + {slg} = {total}", en: "In 12 months, at the current pace: {plg} + {slg} = {total}" },
    /** A block's stage line: the stage its diagnosis names and where its slide is, or why none is named. */
    stageNamed: { fr: "{stage} (slide {i})", en: "{stage} (slide {i})" },
    stageLevel: { fr: "rien ne freine", en: "nothing holds it back" },
    stageNotEnough: { fr: "pas assez de cibles", en: "not enough targets" },
    /** `{period}`: the three months, bare (« juin à août 2026 »). */
    link: {
      fr: "{n} des {m} opportunités assistées viennent de comptes du libre-service ({period}).",
      en: "{n} of the {m} sales-assisted opportunities come from self-serve accounts ({period}).",
    },
    linkOne: {
      fr: "{n} des {m} opportunités assistées vient d'un compte du libre-service ({period}).",
      en: "{n} of the {m} sales-assisted opportunities comes from a self-serve account ({period}).",
    },
    linkNote: {
      fr: "Une part du pipeline, pas une attribution : on ne sait pas combien de ces comptes auraient signé sans le libre-service.",
      en: "A share of the pipeline, not an attribution: we don't know how many of these accounts would have signed without self-serve.",
    },
    /** The `total` slide's footer, rule S8 printed (C25 Q3). */
    footer: {
      fr: "MRR à fin {month} · un client compte dans la motion qui a signé son contrat en cours · sources : {tools}",
      en: "MRR at the end of {month} · a customer counts in the motion that signed their current contract · sources: {tools}",
    },
  },
  /**
   * TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S2, ENGINE.md
   * §18.5.1, §18.8.2). Sales-assisted's funnel in three relays, each on ITS
   * OWN base of 100: nothing here chains them (« x clients pour 100 leads »
   * is never printed). `{base}` is `findings.base` (« leads » or « MQL »).
   */
  relays: {
    ownBase: {
      fr: "Chaque grille a sa propre base de 100 : ce ne sont pas les mêmes personnes.",
      en: "Each grid has its own base of 100: they aren't the same people.",
    },
    /** Between two relays, on the compact column (§18.7). */
    newBase: { fr: "nouvelle base", en: "new base" },
    /**
     * The line above relay 1: `{label}` is `relays.label.leads` or `.mql`, `{months}` bare (« mai à juillet 2026 »).
     * The count follows its label, so « ~1 » needs no singular form.
     */
    upstream: { fr: "{label} par mois : ~{n} · {source} · {months}", en: "{label} a month: ~{n} · {source} · {months}" },
    /** `{label}`: `relays.label.leads` or `.mql`. */
    upstreamUnknown: { fr: "{label} par mois : non mesuré", en: "{label} a month: not measured" },
    /** Each grid's labels: its base of 100, then what the rate counts. */
    label: {
      leads: { fr: "Leads", en: "Leads" },
      mql: { fr: "MQL", en: "MQLs" },
      closedOpps: { fr: "Opportunités conclues", en: "Closed opportunities" },
      newCustomers: { fr: "Nouveaux clients", en: "New customers" },
      leadToOpp: { fr: "Devenus opportunités", en: "Became opportunities" },
      winRate: { fr: "Signées", en: "Signed" },
      goLive: { fr: "En production à {n} jours", en: "Live within {n} days" },
    },
    /** A grid's text equivalent: `{population}` a `findings.relayVerb`, `{period}` with its preposition. */
    aria: {
      fr: "{n} sur 100 {base} {population} — {status}, {source}, {period}",
      en: "{n} in 100 {base} {population} — {status}, {source}, {period}",
    },
    /** The `slg:peloton` title's clauses (§18.8.2), joined with « ; », the first capitalised by the code. */
    clauseLeadToOpp: { fr: "sur 100 {base}, {q} deviennent une opportunité", en: "out of 100 {base}, {q} become an opportunity" },
    clauseLeadToOppOne: { fr: "sur 100 {base}, {q} devient une opportunité", en: "out of 100 {base}, {q} becomes an opportunity" },
    clauseWinRate: { fr: "sur 100 opportunités conclues, {w} sont signées", en: "out of 100 closed opportunities, {w} are signed" },
    clauseWinRateOne: { fr: "sur 100 opportunités conclues, {w} est signée", en: "out of 100 closed opportunities, {w} is signed" },
    clauseGoLive: { fr: "sur 100 nouveaux clients, {g} sont en production à {n} jours", en: "out of 100 new customers, {g} are live within {n} days" },
    clauseGoLiveOne: { fr: "sur 100 nouveaux clients, {g} est en production à {n} jours", en: "out of 100 new customers, {g} is live within {n} days" },
    /** Between two known clauses of a title with a gap (« sur 100 leads, 15 deviennent… ; sur 100 nouveaux clients, 60… »). */
    // TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S3).
    clauseJoin: { fr: " ; ", en: "; " },
    /** The `slg:peloton` slide's footer: `{sources}`, each relay's. */
    slideFooter: { fr: "Chaque grille a sa propre base de 100 · {sources}", en: "Each grid has its own base of 100 · {sources}" },
  },

  /**
   * TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T3.2, §19.4, C32 Q8) : toute la couverture du pipeline.
   * A leading indicator under the relays: never a stage, never money, never
   * a published reference — only the team's own threshold says « sous ».
   * `{ratio}` and `{threshold}` are written with `ratio` (« 2,6× », « 3× »);
   * `{month}`: « juillet 2026 ». `coverage`, `coverageBelowSlide` and
   * `previousNote` go on the `slg:peloton` slide and in its notes, which never
   * say « tu »; `coverageBelow` and `noTarget` are the board's. In English,
   * « l'objectif » is the « goal »: « target » is the team's target (C1).
   */
  pipeline: {
    /** A coverage, and the threshold's unit in the settings: « 2,6× ». */
    ratio: { fr: "{n}×", en: "{n}×" },
    title: { fr: "Couverture du pipeline", en: "Pipeline coverage" },
    coverage: { fr: "Couverture : {ratio} l'objectif du trimestre", en: "Coverage: {ratio} the quarter's goal" },
    coverageBelow: { fr: "Couverture : {ratio} l'objectif du trimestre, sous ton seuil de {threshold}", en: "Coverage: {ratio} the quarter's goal, below your {threshold} threshold" },
    coverageBelowSlide: { fr: "Couverture : {ratio} l'objectif du trimestre, sous le seuil de l'équipe ({threshold})", en: "Coverage: {ratio} the quarter's goal, below the team's threshold ({threshold})" },
    previous: { fr: "En {month} : {ratio}", en: "In {month}: {ratio}" },
    /** The `slg:peloton` slide's speaker note: the month before's, kept off the slide's one line. */
    previousNote: { fr: "Couverture en {month} : {ratio}.", en: "Coverage in {month}: {ratio}." },
    openLabel: { fr: "Pipeline ouvert du trimestre (en ACV)", en: "Open pipeline this quarter (in ACV)" },
    openHint: {
      fr: "Les opportunités encore ouvertes ce mois-là, à la valeur annuelle de leurs contrats.",
      en: "Opportunities still open that month, at the annual value of their contracts.",
    },
    // TODO: à relire (convention 6) — retouché le 2026-10-02 (A18 T3.d) : l'anglais dit « in Settings », comme `targetsStart.lead`.
    noTarget: { fr: "Pour lire la couverture, ajoute l'objectif du trimestre dans les Réglages.", en: "To read the coverage, add the quarter's goal in Settings." },
    targetLabel: { fr: "Objectif de nouveaux contrats du trimestre (en ACV)", en: "New-contract goal for the quarter (in ACV)" },
    thresholdLabel: { fr: "Seuil de couverture de l'équipe", en: "Team coverage threshold" },
    /** The threshold box's unit, read out after the number (« 3 fois l'objectif »). */
    thresholdUnit: { fr: "fois l'objectif", en: "times the goal" },
    thresholdHint: {
      fr: "3 pour 3× l'objectif. Sans seuil, le moteur dit la couverture sans la juger.",
      en: "3 for 3× the goal. Without one, the engine states the coverage without judging it.",
    },
  },

  // --- Diagnosis and "what if" (§14.6) -------------------------------------
  diagnosis: {
    clear: { fr: "Une étape freine le moteur", en: "One stage holds the engine back" },
    shared: { fr: "{n} étapes freinent autant l'une que l'autre", en: "{n} stages hold it back about equally" },
    level: { fr: "Rien ne freine le moteur", en: "Nothing holds the engine back" },
    // TODO: à relire (convention 6) — réécrit le 2026-09-30 (A7.1, C1 : aucun repère ne désigne).
    notEnough: { fr: "Pas assez de cibles pour conclure", en: "Not enough targets to conclude" },
    belowTarget: { fr: "{value}, sous ta cible ({target})", en: "{value}, below your target ({target})" },
    /** Churn behind its target: lower is better, so behind is ABOVE. Picked by `phrases.ts#behindSentence`. */
    aboveTarget: { fr: "{value}, au-dessus de ta cible ({target})", en: "{value}, above your target ({target})" },
    notEnoughBody: {
      fr: "Fixe une cible sur au moins deux étapes : c'est ce qui permet de dire laquelle freine.",
      en: "Set a target on at least two stages: that's what lets us say which one holds you back.",
    },
    /** `{stage}` is a subject phrase, capitalised by the code; `{side}` a `side` phrase. */
    notEnoughBelow: {
      fr: "{stage} est {side}. Sans cible sur les autres étapes, impossible de dire si c'est la plus grosse fuite.",
      en: "{stage} sits {side}. Without targets on the other stages, we can't say whether it's the biggest leak.",
    },
    // TODO: à relire (convention 6) — réécrit le 2026-09-30 (A7.1, C1 : aucun repère ne désigne).
    levelBody: {
      fr: "Aucune étape n'est en retard sur sa cible : le levier est le volume ou le prix.",
      en: "No stage trails its target: the lever is volume or price.",
    },
    blindOne: {
      fr: "Sans chiffre pour {stages}, l'étape qui freine vraiment peut s'y cacher.",
      en: "With no number for {stages}, the stage really holding the engine back may be hiding there.",
    },
    /**
     * « s'y » rather than « dans l'une d'elles »: the list mixes « le taux d'inscription » and « la rétention », and « s'y » has no gender.
     * The blind line also reaches the leak slide, read out to a room: « the engine », never "you".
     */
    blind: {
      fr: "Sans chiffre pour {stages}, l'étape qui freine vraiment peut s'y cacher.",
      en: "With no number for {stages}, the stage really holding the engine back may be hiding in one of them.",
    },
    /** `{stages}`: catalogue names after the colon. No « sous »: churn can be one of them, and it trails its target by being ABOVE it. */
    unpriced: {
      fr: "Aussi en retard, sans montant calculable : {stages}",
      en: "Also behind, with no amount that can be computed: {stages}",
    },
    /**
     * Churn is behind but the ranking is by relative gap: the flows have no
     * amount (no ARPA, OR no monthly volume), so there is nothing to put
     * churn's money next to. « Sans ARPA » would be false half the time.
     */
    noArpa: {
      fr: "Sans montant commun, le churn ne se compare pas aux autres étapes.",
      en: "With no amount in common, churn can't be compared with the other stages.",
    },
    topOfFunnel: {
      fr: "La plus grosse perte en nombre est toujours en haut du funnel ; ce n'est pas ce qui désigne l'étape qui freine.",
      en: "The biggest loss in numbers is always at the top of the funnel; that's not what names the stage holding you back.",
    },
    /**
     * No stamp keys here: a position is worded by `phrases.ts#positionLabel`,
     * which picks from `side` by the metric's direction — on the board, the
     * sheet and the peloton slide alike. The direction-blind « Sous le repère »
     * keys went with that change; churn behind its target sits ABOVE it.
     */
    // TODO: à relire (convention 6) — réécrit le 2026-09-30 (A7.1, C1 : aucun repère ne désigne).
    noComparator: { fr: "sans cible · fixes-en une", en: "no target · set one" },
    // TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S2, ENGINE.md §18.5.2) : once, under sales-assisted's diagnosis.
    cycleNote: {
      fr: "Le cycle ne bouge pas l'argent dans ce calcul : le raccourcir avance les signatures sans en créer.",
      en: "The cycle doesn't move the money in this calculation: shortening it brings signatures forward without creating any.",
    },
  },
  whatIf: {
    today: { fr: "Aujourd'hui", en: "Today" },
    if: { fr: "Si", en: "If" },
    then: { fr: "Alors", en: "Then" },
    times: { fr: "× ARPA", en: "× ARPA" },
    todayFlow: { fr: "{rate}, soit {n} nouveaux payants par mois", en: "{rate}, i.e. {n} new paying customers a month" },
    todayFlowOne: { fr: "{rate}, soit {n} nouveau payant par mois", en: "{rate}, i.e. {n} new paying customer a month" },
    /** No monthly volume: the chain is read per 100 sign-ups, so « par mois » would be false. */
    todayPerHundred: { fr: "{rate}, soit {n} payants pour 100 inscrits", en: "{rate}, i.e. {n} paying customers per 100 sign-ups" },
    todayPerHundredOne: { fr: "{rate}, soit {n} payant pour 100 inscrits", en: "{rate}, i.e. {n} paying customer per 100 sign-ups" },
    ifFlow: { fr: "{stage} atteint {target}", en: "{stage} reaches {target}" },
    thenFlow: { fr: "{n} × {target}/{rate} = {m} (+{delta})", en: "{n} × {target}/{rate} = {m} (+{delta})" },
    /**
     * TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T3, §19.3.2) : the referred share's `then`, its
     * placeholders those of `thenFlow`. The others stay, the referred make up the new share: (1 − r) ÷ (1 − t).
     */
    thenReferral: { fr: "{n} × (100 – {rate})/(100 – {target}) = {m} (+{delta})", en: "{n} × (100 – {rate})/(100 – {target}) = {m} (+{delta})" },
    timesFlow: {
      fr: "{arpa} par client, soit {amount} de MRR ajouté chaque mois",
      en: "{arpa} per customer, i.e. {amount} of MRR added every month",
    },
    todayChurn: { fr: "{churn} de churn sur {base} clients payants", en: "{churn} churn on {base} paying customers" },
    thenChurn: {
      fr: "{base} × ({churn} – {target}) = {n} clients gardés par mois",
      en: "{base} × ({churn} – {target}) = {n} customers kept a month",
    },
    thenChurnOne: {
      fr: "{base} × ({churn} – {target}) = {n} client gardé par mois",
      en: "{base} × ({churn} – {target}) = {n} customer kept a month",
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
    targetTeam: { fr: "{value} (cible de l'équipe)", en: "{value} (team target)" },
  },
  /**
   * TODO: à relire (convention 6) — neuf le 2026-09-30 (A7.3.c S1, ENGINE.md §18.5.3).
   * The sales-assisted chain: a quarter counted, then a month. The labels
   * « Aujourd'hui », « Si », « Alors » and the `if` line are `whatIf`'s;
   * `{phrase}` names the rate after its value (« 24 % de closing »).
   */
  slgChain: {
    timesAcv: { fr: "× ACV ÷ 12", en: "× ACV ÷ 12" },
    timesArpa: { fr: "× ARPA assisté", en: "× sales-assisted ARPA" },
    phrase: {
      "slg.acq.lead-to-opp": { fr: "de passage en opportunité", en: "lead-to-opportunity" },
      "slg.rev.win-rate": { fr: "de closing", en: "win rate" },
      // TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T3, §19.3.2) : « 20 % d'opportunités recommandées ».
      "slg.ref.referred-share": { fr: "d'opportunités recommandées", en: "of opportunities referred" },
    },
    todayFlow: { fr: "{rate} {phrase}, soit {n} nouveaux clients sur 3 mois", en: "{rate} {phrase}, i.e. {n} new customers over 3 months" },
    todayFlowOne: { fr: "{rate} {phrase}, soit {n} nouveau client sur 3 mois", en: "{rate} {phrase}, i.e. {n} new customer over 3 months" },
    todayRenewal: {
      fr: "{rate} des contrats échus renouvelés, sur {d} contrats échus en 3 mois",
      en: "{rate} of contracts up for renewal renewed, out of {d} in 3 months",
    },
    todayRenewalOne: {
      fr: "{rate} des contrats échus renouvelés, sur {d} contrat échu en 3 mois",
      en: "{rate} of contracts up for renewal renewed, out of {d} in 3 months",
    },
    /** No count of new customers (or of contracts up for renewal): read on the relay's own 100, never a chain. */
    todayPerHundred: { fr: "{rate}, soit {n} sur 100 {base}", en: "{rate}, i.e. {n} in 100 {base}" },
    thenFlow: { fr: "{n} × {target}/{rate} = {m} (+{delta}) sur 3 mois", en: "{n} × {target}/{rate} = {m} (+{delta}) over 3 months" },
    thenPerHundred: { fr: "{n} × {target}/{rate} = {m} (+{delta}) sur 100 {base}", en: "{n} × {target}/{rate} = {m} (+{delta}) in 100 {base}" },
    /** TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T3, §19.3.2) : thenReferral and thenReferralPerHundred, the referred share's `then`, as `whatIf.thenReferral`. */
    thenReferral: {
      fr: "{n} × (100 – {rate})/(100 – {target}) = {m} (+{delta}) sur 3 mois",
      en: "{n} × (100 – {rate})/(100 – {target}) = {m} (+{delta}) over 3 months",
    },
    /** On 100 of today's {base}: `{m}` passes 100, so « pour 100 … aujourd'hui », never « sur 100 ». */
    thenReferralPerHundred: {
      fr: "{n} × (100 – {rate})/(100 – {target}) = {m} (+{delta}) pour 100 {base} aujourd'hui",
      en: "{n} × (100 – {rate})/(100 – {target}) = {m} (+{delta}) for every 100 {base} today",
    },
    thenRenewal: {
      fr: "{d} × ({target} – {rate}) = {kept} contrats gardés en plus sur 3 mois",
      en: "{d} × ({target} – {rate}) = {kept} more contracts kept over 3 months",
    },
    thenRenewalOne: {
      fr: "{d} × ({target} – {rate}) = {kept} contrat gardé en plus sur 3 mois",
      en: "{d} × ({target} – {rate}) = {kept} more contract kept over 3 months",
    },
    timesFlow: { fr: "{delta} × {acvMonthly} = {quarter} de MRR nouveau par trimestre", en: "{delta} × {acvMonthly} = {quarter} of new MRR per quarter" },
    timesRenewal: { fr: "{kept} × {arpa} = {quarter} de MRR préservé par trimestre", en: "{kept} × {arpa} = {quarter} of retained MRR per quarter" },
    perMonth: { fr: "soit {amount} par mois", en: "that is {amount} a month" },
    annual: {
      fr: "Soit {amount} de MRR de plus au bout d'un an (contrats annuels : aucun ne se renouvelle dans l'année).",
      en: "That's {amount} more MRR after a year (annual contracts: none comes up for renewal within the year).",
    },
    annualMonthly: {
      fr: "Soit {amount} de MRR de plus au bout d'un an, renouvellements mensuels compris.",
      en: "That's {amount} more MRR after a year, monthly renewals included.",
    },
    lessThanOne: { fr: "Moins d'un client de plus sur 3 mois.", en: "Less than one more customer over 3 months." },
    lessThanOneKept: { fr: "Moins d'un contrat gardé de plus sur 3 mois.", en: "Less than one more contract kept over 3 months." },
  },

  // --- Peloton and mirror (§14.7) ------------------------------------------
  /**
   * TODO: à relire — nouveau (2026-09-26, « Et si » cumulés). Each lever as
   * the subject of a sentence, with its article — the panel's rows and the
   * what-if slides' titles (« Si l'activation passait de 18 % à 24 % »).
   * ARPA names who pays it: the projection applies it to NEW customers.
   */
  leverSubject: {
    "acq.signup-rate": { fr: "le taux d'inscription", en: "the sign-up rate" },
    "ref.referred-share": { fr: "la part des inscrits recommandés", en: "the referred share of sign-ups" },
    "act.rate": { fr: "l'activation", en: "activation" },
    // TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T3, §19.3.1) : the day-30 lever.
    "ret.d30": { fr: "la rétention à J30", en: "day-30 retention" },
    "rev.paid-conversion": { fr: "la conversion en payant", en: "paid conversion" },
    "ret.logo-churn": { fr: "le churn logo", en: "logo churn" },
    "rev.contraction": { fr: "la rétrogradation", en: "contraction" },
    "rev.expansion": { fr: "l'expansion", en: "expansion" },
    "rev.arpa": { fr: "l'ARPA des nouveaux clients", en: "new customers' ARPA" },
    // TODO: à relire (convention 6) — neuf le 2026-09-30 (A7.3.c S0, §18.5.5 et C25 Q7) : les leviers de l'assisté, puis la liaison.
    "slg.acq.lead-to-opp": { fr: "le passage des leads en opportunités", en: "lead-to-opportunity conversion" },
    // TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T3, §19.3.2) : the referred-share lever.
    "slg.ref.referred-share": { fr: "la part des opportunités recommandées", en: "the referred share of opportunities" },
    "slg.rev.win-rate": { fr: "le taux de closing", en: "the win rate" },
    "slg.ret.renewal": { fr: "le renouvellement", en: "renewals" },
    "slg.rev.acv": { fr: "l'ACV des nouveaux contrats", en: "new contracts' ACV" },
    "link.pql-handoff": { fr: "le nombre d'opportunités venues du libre-service", en: "the number of opportunities from self-serve" },
  } satisfies Record<LeverId, Translatable>,
  /**
   * TODO: à relire — nouveau (2026-09-26). « Et si » cumulés : the panel
   * (all the levers at once, the funnel with its visitors, the growth
   * numbers) and the what-if slides read the same words.
   */
  scenario: {
    /** A difference of two rates is in points, never a percent of a percent (« +1 pt »). */
    points: { fr: "{n} pt", en: "{n} pt" },
    intro: { fr: "Bouge un ou plusieurs leviers : le funnel du mois et tes chiffres de croissance se recalculent ensemble, les effets se cumulent.", en: "Move one lever or several: the month's funnel and your growth numbers recompute together, and the effects add up." },
    leversTitle: { fr: "Les leviers", en: "The levers" },
    leverToday: { fr: "aujourd'hui {value}", en: "today {value}" },
    /** `{list}`: the levers not entered, lower-cased catalogue names joined by `grammar`. */
    unknownLevers: { fr: "Pas encore saisis, donc pas de curseur : {list}.", en: "Not entered yet, so no slider: {list}." },
    reset: { fr: "Remettre à aujourd'hui", en: "Back to today" },
    resetAll: { fr: "Tout remettre à aujourd'hui", en: "All back to today" },
    sliderLabel: { fr: "{lever}, cible testée", en: "{lever}, target under test" },
    funnelToday: { fr: "Ton funnel du mois, aujourd'hui", en: "Your month's funnel, today" },
    funnelIf: { fr: "Ton funnel du mois, avec tes « Et si »", en: "Your month's funnel, with your what-ifs" },
    visitors: { fr: "Visiteurs", en: "Visitors" },
    signups: { fr: "Inscrits", en: "Sign-ups" },
    referred: { fr: "dont recommandés", en: "of whom referred" },
    activated: { fr: "Activés", en: "Activated" },
    d30: { fr: "Actifs à J30", en: "Active at day 30" },
    paying: { fr: "Nouveaux payants", en: "New paying" },
    unknownStep: { fr: "inconnu", en: "unknown" },
    gained: { fr: "+{n} avec tes « Et si »", en: "+{n} with your what-ifs" },
    /** U+2212, the minus sign: StatTile.tsx asks for it, and a hyphen reads as a dash. */
    lost: { fr: "−{n} avec tes « Et si »", en: "−{n} with your what-ifs" },
    kpisTitle: { fr: "Tes chiffres de croissance", en: "Your growth numbers" },
    kpiToday: { fr: "aujourd'hui", en: "today" },
    kpiIf: { fr: "avec tes « Et si »", en: "with your what-ifs" },
    kpiMrr12: { fr: "MRR dans 12 mois", en: "MRR in 12 months" },
    kpiNewMrr: { fr: "Nouveau MRR par mois", en: "New MRR a month" },
    kpiNrr: { fr: "NRR mensuelle", en: "Monthly NRR" },
    kpiGrr: { fr: "GRR mensuelle", en: "Monthly GRR" },
    kpiCac: { fr: "CAC", en: "CAC" },
    kpiLtv: { fr: "LTV", en: "LTV" },
    kpiPayback: { fr: "CAC payback", en: "CAC payback" },
    kpiUnknown: { fr: "il manque {input}", en: "missing: {input}" },
    aloneTitle: { fr: "Ce que chaque levier rapporte seul, sur le MRR dans 12 mois", en: "What each lever brings on its own, on MRR in 12 months" },
    aloneRow: { fr: "{lever} : {from} → {to}", en: "{lever}: {from} → {to}" },
    together: { fr: "Ensemble : {total}, soit {extra} de plus que la somme des leviers pris seuls : c'est l'effet composé.", en: "Together: {total}, {extra} more than the sum of the levers taken alone: that's the compounding." },
    togetherNoExtra: { fr: "Ensemble : {total}.", en: "Together: {total}." },
    noneMoved: { fr: "Aucun levier bougé : le funnel et les chiffres sont ceux d'aujourd'hui.", en: "No lever moved: the funnel and the numbers are today's." },
    noLever: { fr: "Il faut au moins un chiffre saisi pour tester un « Et si ».", en: "You need at least one number entered to test a what-if." },
    /** A KPI tile says whether a change is good news in words, never by color alone (StatTile.tsx). */
    better: { fr: "mieux", en: "better" },
    worse: { fr: "moins bien", en: "worse" },
    /**
     * TODO: à relire — nouveau (2026-09-28, audit du design kit S-4) : les trois
     * clés announce, announceFigure et announceChanged. What a screen reader hears once a slider settles, and only then: the growth
     * numbers that moved, read once — never the seven tiles at every step.
     * `{sense}` is `better` or `worse` above.
     */
    announce: { fr: "{title}, {context} : {figures}.", en: "{title}, {context}: {figures}." },
    announceFigure: { fr: "{label} {value}", en: "{label} {value}" },
    announceChanged: { fr: "{label} {value} ({delta}, {sense})", en: "{label} {value} ({delta}, {sense})" },
    /** The funnel's dots: what each shape means. `range` reuses the peloton's « fourchette estimée ». */
    legendThere: { fr: "déjà là aujourd'hui", en: "there today" },
    legendGained: { fr: "en plus avec tes « Et si »", en: "added by your what-ifs" },
    legendLost: { fr: "en moins avec tes « Et si »", en: "lost to your what-ifs" },
    legendUnit: { fr: "Un rond = 1 % des inscrits d'aujourd'hui : au-delà de 100, la grille s'allonge.", en: "One dot = 1% of today's sign-ups: past 100, the grid grows." },
    perHundredNote: { fr: "Sans le nombre d'inscrits du mois, le funnel se lit pour 100 inscrits.", en: "Without the month's sign-up count, the funnel reads per 100 sign-ups." },
    /** A grid's text equivalent: `{label}` a step, `{value}` the projection, `{today}` today's count. */
    gridAria: { fr: "{label} : {value}, contre {today} aujourd'hui", en: "{label}: {value}, against {today} today" },
    /** The table of what each lever brings alone: its header cells. */
    aloneLever: { fr: "Levier", en: "Lever" },
    aloneGain: { fr: "MRR dans 12 mois", en: "MRR in 12 months" },
    assumptionsTitle: { fr: "Ce que le calcul suppose", en: "What the calculation assumes" },
    /** One sentence per rule of `lib/engine/scenario.ts`, printed only when it applied. */
    assumption: {
      "signup-same-visitors": { fr: "Le taux d'inscription s'applique aux mêmes visiteurs qu'aujourd'hui.", en: "The sign-up rate applies to the same visitors as today." },
      "referral-on-top": { fr: "Les inscrits recommandés s'ajoutent aux autres, qui restent les mêmes ; ils arrivent par des visiteurs qui s'inscrivent au taux d'aujourd'hui.", en: "Referred sign-ups come on top of the others, who stay the same; they arrive through visitors who sign up at today's rate." },
      "activation-drives-downstream": { fr: "Les actifs à J30 et les payants font partie des activés : ils suivent l'activation dans la même proportion, sans jamais la dépasser.", en: "Those active at day 30 and those paying are among the activated: they follow activation in the same proportion, never above it." },
      // TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T3, §19.3.1).
      "d30-drives-paying": {
        fr: "Quand la rétention à J30 bouge, ce sont les actifs à J30 que les payants suivent : ils en font partie, sans jamais dépasser leur nombre.",
        en: "When day-30 retention moves, paying customers follow those active at day 30: they are among them, never more than them.",
      },
      "arpa-new-customers": { fr: "Le nouvel ARPA s'applique aux nouveaux clients ; le MRR déjà là garde son prix.", en: "The new ARPA applies to new customers; the MRR already there keeps its price." },
      "same-spend": { fr: "À dépense égale : plus de payants font baisser le CAC dans la même proportion.", en: "Same spend: more paying customers lower the CAC in the same proportion." },
      "churn-as-revenue": { fr: "Le churn logo tient lieu de churn en revenu, comme si les clients partis payaient l'ARPA moyen.", en: "Logo churn stands in for revenue churn, as if the customers who left paid the average ARPA." },
      "contraction-unknown": { fr: "La rétrogradation n'est pas renseignée : comptée à 0.", en: "Contraction isn't entered: counted as 0." },
      "expansion-unknown": { fr: "L'expansion n'est pas renseignée : comptée à 0.", en: "Expansion isn't entered: counted as 0." },
      "twelve-months": { fr: "Sur 12 mois, au rythme de ce mois : la base retenue à la NRR chaque mois, plus le nouveau MRR du mois. Ni saisonnalité, ni saturation.", en: "Over 12 months, at this month's pace: the base retained at NRR each month, plus the month's new MRR. No seasonality, no saturation." },
    } satisfies Record<ScenarioAssumption, Translatable>,
    /**
     * TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S2, ENGINE.md §18.5.5, C25 Q7) :
     * the sales-assisted panel and the one line both panels share.
     */
    /** The link's slider, in WHOLE opportunities: its own label, not `sliderLabel`'s « cible testée ». */
    linkSlider: { fr: "Opportunités venues du libre-service, par trimestre", en: "Opportunities from self-serve, per quarter" },
    /** The hybrid's one line under both panels: a sum, never a comparison. */
    totalIn12: { fr: "MRR total dans 12 mois", en: "Total MRR in 12 months" },
    totalIn12Row: {
      fr: "{today} aujourd'hui, {projected} avec les « Et si » des deux panneaux",
      en: "{today} today, {projected} with the what-ifs of both panels",
    },
    kpiNrr12: { fr: "NRR sur douze mois", en: "12-month NRR" },
    kpiWon: { fr: "Nouveaux clients par trimestre", en: "New customers a quarter" },
    /** The sales-assisted panel's quarter, where self-serve shows its month's funnel. */
    quarterToday: { fr: "Ton trimestre, aujourd'hui", en: "Your quarter, today" },
    quarterIf: { fr: "Ton trimestre, avec tes « Et si »", en: "Your quarter, with your what-ifs" },
    opps: { fr: "Opportunités créées", en: "Opportunities created" },
    oppsFromSelfServe: { fr: "dont venues du libre-service", en: "of which from self-serve" },
    won: { fr: "Nouveaux clients", en: "New customers" },
    // TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S3, relu sur les captures) : quarterColumn, introSlg, noneMovedSlg.
    /** The quarter table's first column: what each row counts — not a lever, the link alone moves one of them. */
    quarterColumn: { fr: "Ce trimestre", en: "This quarter" },
    /** The panel's intro and its « nothing moved » line: sales-assisted has a quarter, not a month's funnel. */
    introSlg: {
      fr: "Bouge un ou plusieurs leviers : le trimestre et tes chiffres de croissance se recalculent ensemble, les effets se cumulent.",
      en: "Move one lever or several: the quarter and your growth numbers recompute together, and the effects add up.",
    },
    noneMovedSlg: { fr: "Aucun levier bougé : le trimestre et les chiffres sont ceux d'aujourd'hui.", en: "No lever moved: the quarter and the numbers are today's." },
    /** One sentence per rule of `lib/engine/slg-scenario.ts`, printed only when it applied. */
    slgAssumption: {
      "slg-lead-same-win-rate": { fr: "Les opportunités en plus se signent au même taux que les autres.", en: "The extra opportunities are signed at the same rate as the others." },
      // TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T3, §19.3.2).
      "slg-referral-on-top": {
        fr: "Les opportunités recommandées s'ajoutent aux autres, qui restent les mêmes, et se signent au même taux.",
        en: "Referred opportunities come on top of the others, which stay the same, and are signed at the same rate.",
      },
      "slg-win-same-closed": { fr: "Le nouveau taux de closing s'applique au même nombre d'opportunités conclues.", en: "The new win rate applies to the same number of closed opportunities." },
      "slg-acv-new-contracts": { fr: "Le nouvel ACV s'applique aux nouveaux contrats ; les contrats en cours gardent leur prix.", en: "The new ACV applies to new contracts; current contracts keep their price." },
      "slg-renewal-as-nrr": { fr: "Un point de renouvellement compte comme un point de NRR : les contrats sauvés valent la moyenne.", en: "A point of renewal counts as a point of NRR: the contracts saved are worth the average." },
      "slg-logos-for-revenue": { fr: "Sans NRR, le renouvellement des contrats en tient lieu, comme si chaque contrat valait la moyenne.", en: "Without the NRR, contract renewal stands in for it, as if every contract were worth the average." },
      "link-others-unchanged": { fr: "Les autres opportunités ne changent pas.", en: "The other opportunities don't change." },
      "link-same-win-rate": { fr: "Celles venues du libre-service se signent au même taux que les autres.", en: "Those from self-serve are signed at the same rate as the others." },
      "link-nothing-taken": { fr: "On ne sait pas combien de ces comptes auraient payé seuls : rien n'est retiré au libre-service.", en: "We don't know how many of these accounts would have paid on their own: nothing is taken from self-serve." },
      "slg-same-spend": { fr: "À dépense égale : plus de signatures font baisser le CAC assisté dans la même proportion.", en: "Same spend: more signatures lower the sales-assisted CAC in the same proportion." },
      "slg-twelve-months": {
        fr: "Sur 12 mois, au rythme de ce trimestre : la base retenue à la NRR, plus douze mois de nouveau MRR. Contrats annuels : aucun nouveau ne se renouvelle dans l'année.",
        en: "Over 12 months, at this quarter's pace: the base retained at the NRR, plus twelve months of new MRR. Annual contracts: none of the new ones comes up for renewal within the year.",
      },
    } satisfies Record<SlgScenarioAssumption, Translatable>,
  },
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
    /**
     * The same count as a slide's text line, next to « Activés · 18 sur 100 ». The
     * legend's bare « (6) » reads as a footnote once the bar is gone, and « {n}
     * venus » would have to agree with a count that can print « 1 » or « moins
     * de 1 sur 100 »: the phrase before the colon carries no agreement at all.
     */
    slideReferred: { fr: "par recommandation : {share}", en: "through a referral: {share}" },
    legendMeasured: { fr: "mesuré", en: "measured" },
    legendRange: { fr: "fourchette estimée", en: "estimated range" },
    legendUnknown: { fr: "non mesuré", en: "not measured" },
    // TODO: à relire — nouveau (2026-09-25, « les 100 inscrits, c'est une vue de l'esprit ? »).
    sameHundred: {
      fr: "Tes inscrits en {cohort} sont ramenés à 100 pour se lire en pourcentages : chaque colonne est comptée sur ces mêmes 100.",
      en: "Your {cohort} sign-ups are scaled to 100 so they read as percentages: every column is counted on those same 100.",
    },
    sameHundredCount: {
      fr: "Tes {n} inscrits en {cohort} sont ramenés à 100 pour se lire en pourcentages : chaque colonne est comptée sur ces mêmes 100. Pour changer ce nombre, change tes inscrits de la cohorte, pas le 100.",
      en: "Your {n} sign-ups from {cohort} are scaled to 100 so they read as percentages: every column is counted on those same 100. To change that number, change your cohort's sign-ups, not the 100.",
    },
    /** The slide's line: it is shown to a leadership meeting, so no « tes » (see the header). */
    slideSameHundred: {
      fr: "Chaque colonne est comptée sur les mêmes 100 inscrits.",
      en: "Every column is counted on the same 100 sign-ups.",
    },
    cohortOfCount: { fr: "{n} inscrits en {cohort}, ramenés à 100", en: "{n} sign-ups in {cohort}, scaled to 100" },
    aria: {
      fr: "{n} sur 100 inscrits {population} — {status}, {source}, inscrits en {cohort}",
      en: "{n} in 100 sign-ups {population} — {status}, {source}, {cohort} cohort",
    },
    tableCaption: { fr: "Le peloton, en chiffres", en: "The peloton, in numbers" },
    /** Clauses of the verdict title (§9.3, slide 1), joined with `grammar`. */
    clauseActivated: { fr: "{a} atteignent la première valeur", en: "{a} reach first value" },
    clauseActivatedOne: { fr: "{a} atteint la première valeur", en: "{a} reaches first value" },
    clauseD30: { fr: "{r} sont encore là à J30", en: "{r} are still active at day 30" },
    clauseD30One: { fr: "{r} est encore là à J30", en: "{r} is still active at day 30" },
    clausePaid: { fr: "{p} paient", en: "{p} pay" },
    clausePaidOne: { fr: "{p} paie", en: "{p} pays" },
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
    /**
     * A verdict next to its count (« 2 angles morts », « 1 angle mort ») and,
     * in the singular, on the one bridge it names. The general form is the
     * plural, the `One` key the singular — French takes it under 2, so a
     * count of 0 reads « 0 angle mort » (this file's header convention).
     * TODO: à relire — the `One` forms and « Cohérents » are new copy (convention 6).
     */
    blindSpot: { fr: "Angles morts", en: "Blind spots" },
    blindSpotOne: { fr: "Angle mort", en: "Blind spot" },
    blindSpotLight: { fr: "Angles morts légers", en: "Minor blind spots" },
    blindSpotLightOne: { fr: "Angle mort léger", en: "Minor blind spot" },
    coherent: { fr: "Cohérents", en: "Consistent" },
    coherentOne: { fr: "Cohérent", en: "Consistent" },
    better: { fr: "Mieux que déclaré", en: "Better than declared" },
    betterOne: { fr: "Mieux que déclaré", en: "Better than declared" },
    knownGap: { fr: "Lacunes connues", en: "Known gaps" },
    knownGapOne: { fr: "Lacune connue", en: "Known gap" },
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
    /**
     * A Tour is on this device and the engine is not linked to it (C8, ENGINE.md
     * §8.5): taken after the engine was started, or unticked by mistake. The
     * button links it, as the setup card's box does.
     */
    // TODO: à relire (convention 6) — nouveau (2026-09-30, A7.5, C8 : relier un Tour après coup).
    unlinked: {
      fr: "Tu as fait le Tour le {date} ({score}/100). Le relier compare ce que tu y as déclaré à ce que tu retrouves ici.",
      en: "You took the Tour on {date} ({score}/100). Linking it compares what you declared there with what you find here.",
    },
    // TODO: à relire (convention 6) — nouveau (2026-09-30, A7.5, C8 : relier un Tour après coup).
    unlinkedNoScore: {
      fr: "Tu as fait le Tour le {date}. Le relier compare ce que tu y as déclaré à ce que tu retrouves ici.",
      en: "You took the Tour on {date}. Linking it compares what you declared there with what you find here.",
    },
    // TODO: à relire (convention 6) — nouveau (2026-09-30, A7.5, C8 : relier un Tour après coup).
    link: { fr: "Relier ce Tour", en: "Link this Tour" },
  },

  /**
   * Words the visuals (P5) and the static page need that §14 didn't list.
   * TODO: à relire — copie neuve (convention 6). Kept in one block so the
   * content PR (P3) can fold it into its sections without hunting.
   */
  visual: {
    /** Under the sign-ups grid: the cohort those 100 people come from. */
    cohortOf: { fr: "inscrits en {cohort}", en: "{cohort} cohort" },
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
    mirrorCounts: { fr: "Sur les chiffres que le Tour te faisait déclarer", en: "Across the numbers the Tour asked you about" },
    /** Which Tour is read — the spec shows its date (§6.11): a result can be months old. */
    mirrorTakenAt: { fr: "Tour du {date} · {score}/100", en: "Tour taken {date} · {score}/100" },
    mirrorTakenAtNoScore: { fr: "Tour du {date}", en: "Tour taken {date}" },
    mirrorQuestion: { fr: "La question du Tour", en: "The Tour's question" },
    /** The static page (E0) prints the catalogue's formulas without a setup: generic words fill their placeholders. */
    staticEvent: { fr: "l'événement d'activation", en: "the activation event" },
    staticWindow: { fr: "n", en: "n" },
    /** Bracketed slots: « créés en [mois] » reads as a blank to fill, « créés en le mois » as a typo. */
    staticCohort: { fr: "[mois de cohorte]", en: "[cohort month]" },
    staticMonth: { fr: "[mois]", en: "[month]" },
    staticVariant: { fr: "la variante choisie", en: "the chosen variant" },
    // TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S2) : la période de trois mois de l'assisté, sans réglage.
    staticPeriod: { fr: "[sur trois mois]", en: "[over three months]" },
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
    // TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T6, §19.8, C32 Q14) : le fond blanc des slides.
    whiteTheme: { fr: "Fond blanc (pour un gabarit d'entreprise)", en: "White background (for a company slide template)" },
    showMirror: { fr: "Slide « Déclaré × mesuré »", en: "\"Declared × measured\" slide" },
    showMirrorHint: {
      fr: "Le Tour est une auto-évaluation : à montrer seulement si l'écart est ton argument.",
      en: "The Tour is a self-assessment: show it only if the gap is your argument.",
    },
    png: { fr: "Image (PNG)", en: "Image (PNG)" },
    pngHd: { fr: "Haute définition", en: "High definition" },
    copyImage: { fr: "Copier l'image", en: "Copy image" },
    // TODO: à relire (convention 6) — A15.11 (2026-10-01) : le bouton ouvre la fenêtre d'impression
    // (window.print), il ne télécharge rien ; le libellé dit maintenant le geste.
    pdf: { fr: "Imprimer ou enregistrer en PDF", en: "Print or save as PDF" },
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
    // TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S2, ENGINE.md §18.7 E5) : the hybrid's thumbnails under four headings, each motion's under `hybrid.motionName`.
    groupTotal: { fr: "Les deux moteurs", en: "Both engines" },
    groupEnd: { fr: "Pour conclure", en: "To conclude" },
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
  /**
   * The slide screen's own controls (P6), beyond the keys the spec listed in
   * §14.8. TODO: à relire — copie neuve (convention 6).
   */
  deckUi: {
    back: { fr: "Revenir au moteur", en: "Back to the engine" },
    settingsTitle: { fr: "Réglages des slides", en: "Slide settings" },
    exportsTitle: { fr: "Exporter", en: "Export" },
    imageCopied: { fr: "Image copiée", en: "Image copied" },
    copyFailed: {
      fr: "La copie n'a pas marché dans ce navigateur. Le PDF et l'image fonctionnent.",
      en: "Copying didn't work in this browser. The PDF and the image work.",
    },
    pngFileName: { fr: "moteur-{slide}-{month}.png", en: "engine-{slide}-{month}.png" },
    enlarge: { fr: "Agrandir l'aperçu", en: "Enlarge the preview" },
    shrink: { fr: "Réduire l'aperçu", en: "Shrink the preview" },
    excluded: { fr: "Pas dans les slides", en: "Not in the slides" },
    slidePosition: { fr: "Slide {i} sur {n}", en: "Slide {i} of {n}" },
    nothingMissing: { fr: "Rien ne manque.", en: "Nothing is missing." },
    askPreview: { fr: "Titre de la slide :", en: "Slide title:" },
    askCostNone: { fr: "Pas encore chiffré", en: "Not priced yet" },
    askCostTeamOption: { fr: "Une équipe", en: "A team" },
    askAmount: { fr: "Montant ({currency})", en: "Amount ({currency})" },
    askWeeks: { fr: "Semaines", en: "Weeks" },
    askPeople: { fr: "Personnes", en: "People" },
    askHorizonNone: { fr: "Pas d'échéance", en: "No deadline" },
    askSuccessNone: { fr: "Aucune", en: "None" },
    askTarget: { fr: "Cible visée", en: "Target" },
    askBullet: { fr: "Puce {n}", en: "Bullet {n}" },
    askMeasureFirstHint: {
      fr: "Trois au plus. Les moins chers à réparer sont cochés d'abord.",
      en: "Three at most. The cheapest to fix are checked first.",
    },
    askMeasureFirstEmpty: {
      fr: "Aucun chiffre introuvable : rien à mesurer d'abord.",
      en: "No missing number: nothing to measure first.",
    },
  },
  slide: {
    // TODO: à relire (convention 6) — renommé le 2026-09-30 (A7.2, C2 : « Moteur de growth »).
    kicker: {
      fr: "Moteur de growth · {company}{month} · données internes",
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
    /** Segments whose value is empty are dropped whole, separator included (`phrases.ts#fillSegments`). */
    // TODO: à relire (convention 6) — réécrit le 2026-09-30 (A7.1, C1) : le segment {caveat} est parti avec slide.leakCaveat.
    leakFooter: {
      fr: "Toutes choses égales par ailleurs · {assumption}",
      en: "All else being equal · {assumption}",
    },
    /** The footer's `{assumption}` when activation is named: a clause, lower-case, no full stop. */
    leakAssumption: { fr: "les payants sont supposés parmi les activés", en: "paying customers are assumed to be among the activated" },
    /**
     * TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S4, ENGINE.md §18.5.3) : the `slg:leak`
     * footer's `{assumption}`, one per priced sales-assisted stage — a clause, lower-case, no full stop.
     */
    slgLeakAssumption: {
      "slg.acq.lead-to-opp": { fr: "les opportunités en plus se signent au même taux que les autres", en: "the extra opportunities are signed at the same rate as the others" },
      "slg.rev.win-rate": { fr: "le même nombre d'opportunités conclues", en: "the same number of closed opportunities" },
      "slg.ret.renewal": { fr: "les contrats sauvés valent l'ARPA assisté", en: "the contracts saved are worth the sales-assisted ARPA" },
      // TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T3, §19.3.2).
      "slg.ref.referred-share": {
        fr: "les opportunités recommandées s'ajoutent aux autres et se signent au même taux",
        en: "the referred opportunities come on top of the others and are signed at the same rate",
      },
    },
    /**
     * TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T3, §19.3) : the `leak` footer's `{assumption}` for the two
     * self-serve stages priced since the complete engine — a clause, lower-case, no full stop, as `leakAssumption`.
     */
    plgLeakAssumption: {
      "ret.d30": { fr: "les payants sont supposés parmi les inscrits encore actifs à J30", en: "paying customers are assumed to be among the sign-ups still active at day 30" },
      "ref.referred-share": {
        fr: "les inscrits recommandés s'ajoutent aux autres et convertissent comme eux",
        en: "referred sign-ups come on top of the others and convert like them",
      },
    },
    /** The footer of a leak slide with no amount (C9): why there is none, in place of « toutes choses égales par ailleurs ». */
    // TODO: à relire (convention 6) — nouveau (2026-09-30, A7.6, C9).
    leakFooterUnpriced: {
      fr: "Sans montant : le moteur ne relie pas ce chiffre au MRR",
      en: "No amount: the engine doesn't link this number to MRR",
    },
    /** TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T3, §19.3.2) : a referred share's target past the ceiling. `{max}`: « 50 % ». */
    leakFooterCeiling: {
      fr: "Sans montant : au-delà d'une cible de {max}, le moteur ne chiffre plus la part des recommandations",
      en: "No amount: past a target of {max}, the engine no longer prices a referred share",
    },
    leakAside: { fr: "À côté", en: "Alongside" },
    /** A peloton column or a candidate nobody measured. Gender-free: it follows a label of either gender. */
    noNumber: { fr: "pas de chiffre", en: "no number" },
    cannotExclude: { fr: "pas de chiffre — impossible à exclure", en: "no number — can't be ruled out" },
    /** A candidate with no team target. No « fixes-en une »: a slide never gives the reader orders. */
    // TODO: à relire (convention 6) — réécrit le 2026-09-30 (A7.1, C1 : aucun repère ne désigne).
    noComparator: { fr: "sans cible d'équipe", en: "no team target" },
    unpricedShort: { fr: "sans montant calculable", en: "no amount can be computed" },
    /**
     * Why a number is missing, as a slide says it. The screen's `cause`
     * labels are the reader's own voice (« je n'y ai pas accès »); a slide is
     * read out by that reader to a room, so it says the fact, not « je ».
     */
    cause: {
      notTracked: { fr: "aucune mesure", en: "not tracked" },
      notComputed: { fr: "calcul jamais fait", en: "never computed" },
      noAccess: { fr: "accès manquant", en: "no access" },
      noDefinition: { fr: "pas de définition partagée", en: "no shared definition" },
    },
    /** `visibility`'s documented count: French takes the singular under 2 (« 0 chiffre sur 15 », « 1 chiffre sur 15 »). */
    documented: { fr: "{n} chiffres sur {N}", en: "{n} of {N} numbers" },
    documentedOne: { fr: "{n} chiffre sur {N}", en: "{n} of {N} numbers" },
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
    /** The ask's goal, built from what the team filled in: `{metric}` is a catalogue name, lower-cased by the code. */
    askGoal: { fr: "{metric} de {current} à {target}", en: "{metric} from {current} to {target}" },
    askGoalNoCurrent: { fr: "{metric} à {target}", en: "{metric} to {target}" },
    askGoalHorizon: { fr: "{goal} d'ici {horizon}", en: "{goal} by {horizon}" },
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
    /**
     * TODO: à relire — nouveau (2026-09-26). The what-if slides (one per lever
     * the team moved, one for all of them together): their two tables, their
     * column headings, and each row as the text export writes it. The panel's
     * own words (`scenario.*`) say « tes « Et si » »; a slide is read out to a
     * room, so it says « cet « Et si » » / « les « Et si » ».
     */
    whatIfKpis: { fr: "Les chiffres de croissance", en: "The growth numbers" },
    whatIfFunnel: { fr: "Le funnel du mois", en: "The month's funnel" },
    // TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S4) : the second table of a sales-assisted what-if slide.
    whatIfQuarter: { fr: "Le trimestre", en: "The quarter" },
    whatIfToday: { fr: "Aujourd'hui", en: "Today" },
    whatIfWithOne: { fr: "Avec cet « Et si »", en: "With this what-if" },
    whatIfWithAll: { fr: "Avec les « Et si »", en: "With the what-ifs" },
    whatIfChange: { fr: "Écart", en: "Change" },
    /** A figure the what-if leaves where it is: the change column says so in a word, never « 0 ». Gender-free in French. */
    whatIfStable: { fr: "stable", en: "unchanged" },
    whatIfRowOne: {
      fr: "{today} aujourd'hui, {projected} avec cet « Et si » ({change})",
      en: "{today} today, {projected} with this what-if ({change})",
    },
    whatIfRowAll: {
      fr: "{today} aujourd'hui, {projected} avec les « Et si » ({change})",
      en: "{today} today, {projected} with the what-ifs ({change})",
    },
    whatIfRowStable: { fr: "{today} aujourd'hui, stable", en: "{today} today, unchanged" },
    /** A change in NRR or GRR, in percentage points. French takes the singular under 2 (« 0,5 point »). */
    whatIfPoints: { fr: "{n} points", en: "{n} points" },
    whatIfPointsOne: { fr: "{n} point", en: "{n} point" },
    /**
     * A lever of the « together » slide, as the text export writes it. French
     * never writes « de {from} à {to} »: an estimate is a range (« 6 à 9 % »),
     * and « de 6 à 9 % à 12 % » can't be read.
     */
    whatIfLeverRow: { fr: "à {to} (aujourd'hui : {from}) · {gain}", en: "from {from} to {to} · {gain}" },
    /**
     * TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S2, ENGINE.md §18.8.1-§18.8.2) :
     * the chrome of a motion's slides, and the side-by-side unit economics.
     */
    /** A slide of one motion, in the hybrid: its kicker names the motion (`hybrid.motionAdjective`). */
    kickerMotion: {
      fr: "Moteur de growth · {company}{month} · {motion} · données internes",
      en: "Growth engine · {company}{month} · {motion} · internal data",
    },
    /** A sales-assisted slide's footer: `{flows}` and `{leads}` with their preposition (« de juin à août 2026 »). */
    footerSlg: { fr: "Flux assistés {flows} · leads {leads} · sources : {tools}", en: "Sales-assisted flows {flows} · leads {leads} · sources: {tools}" },
    unitRows: {
      cac: { fr: "CAC", en: "CAC" },
      payback: { fr: "Payback", en: "Payback" },
      basket: { fr: "Panier", en: "Revenue per customer" },
      lostInAYear: { fr: "Clients perdus sur un an", en: "Customers lost in a year" },
      ltvCac: { fr: "LTV:CAC", en: "LTV:CAC" },
    },
    unitBasketPlg: { fr: "ARPA {arpa} par mois", en: "ARPA {arpa} a month" },
    unitBasketSlg: { fr: "ACV {acv} par an ({monthly} par mois)", en: "ACV {acv} a year ({monthly} a month)" },
    /** Self-serve's churn annualised and compounded (C25 Q5): « ~26 % (2,5 % par mois, composé) ». */
    unitLostPlg: { fr: "{annual} ({monthly} par mois, composé)", en: "{annual} ({monthly} a month, compounded)" },
    unitLostSlg: { fr: "{rate} des contrats échus", en: "{rate} of contracts up for renewal" },
    unitLostSlgMonthly: { fr: "{rate} (contrats mensuels, composé)", en: "{rate} (monthly contracts, compounded)" },
    unitUncomputable: { fr: "incalculable — manque : {input}", en: "can't be computed — missing: {input}" },
    /** The footer when a margin is the company-wide one (C25 Q4): `{motion}` a `hybrid.motionSubject`. */
    unitCompanyWide: { fr: "marge globale reprise dans {motion}", en: "company-wide margin used for {motion}" },
    unitCompanyWideBoth: { fr: "marge globale reprise dans les deux motions", en: "company-wide margin used for both motions" },
    /** The appendix's third group, after each motion's (§18.8.2). */
    annexLink: { fr: "Liaison", en: "Link" },
    /**
     * TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T1, moteur-complet.md §19.2.5-§19.2.6) :
     * « Ce qui a bougé » — evolutionLeakStays, evolutionLeakBecomes, evolutionRow, evolutionRowToward,
     * evolutionRowStable, les cinq seriesApart et evolutionFooter, jusqu'à la fin de ce bloc.
     * `{leak}` closes its title, written with its own separator; `{stage}` is a stage with its article
     * (« l'activation »).
     */
    evolutionLeakStays: { fr: " ; {stage} reste la fuite", en: "; {stage} is still the leak" },
    evolutionLeakBecomes: { fr: " ; {stage} devient la fuite", en: "; {stage} is now the leak" },
    /**
     * One number, the month before then this one: « 18 %, puis 24 % (+6 points) ». No arrow: the slide fonts
     * don't draw one (§10.4) — a slide that wants it draws it, as the ask does.
     */
    evolutionRow: { fr: "{before}, puis {now} ({change})", en: "{before}, then {now} ({change})" },
    evolutionRowToward: { fr: "{before}, puis {now} ({change}, vers la cible)", en: "{before}, then {now} ({change}, toward the target)" },
    evolutionRowStable: { fr: "{now}, stable", en: "{now}, unchanged" },
    /** TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T2) : under a change on the slide, when it went the target's way — the words of `evolutionRowToward`, alone (one card with it). */
    evolutionToward: { fr: "vers la cible", en: "toward the target" },
    /** TODO: à relire (A14 T1) — why a number doesn't compare (§19.2.5). `{month}`: the month the reason is about. */
    seriesApart: {
      definitionChanged: { fr: "définition changée", en: "definition changed" },
      enteredDifferently: { fr: "saisi autrement d'un mois à l'autre", en: "entered differently from one month to the next" },
      notMeasured: { fr: "pas mesuré en {month}", en: "not measured in {month}" },
      estimated: { fr: "estimé en {month}", en: "estimated in {month}" },
      conflicting: { fr: "deux lectures en {month}", en: "two readings in {month}" },
    },
    // TODO: à relire (A14 T1) — the slide's footer: the comparison rule, said once.
    evolutionFooter: { fr: "Seuls les chiffres mesurés de la même façon les deux mois se comparent : même définition, même fenêtre, des comptes les deux fois ou un taux les deux fois.", en: "Only numbers measured the same way in both months are compared: same definition, same window, counts both times or a rate both times." },
  },
  /** One template per case and grammatical number (§9.3). `**…**` is the red accent. */
  slideTitles: {
    /** Each value is a filled `peloton.clause*` — the verb agreeing with its own count (« 1 paie », « 6 à 9 paient »). */
    pelotonComplete: {
      fr: "Sur 100 inscrits, {activated}, {d30} et **{paid}**.",
      en: "Out of 100 sign-ups, {activated}, {d30} and **{paid}**.",
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
    leakClearCustomersOne: {
      fr: "Ramener {stage} à {target} ajouterait **{n} client payant** par mois.",
      en: "Bringing {stage} to {target} would add **{n} paying customer** a month.",
    },
    /** Churn without ARPA: its chain counts customers KEPT, and the title says the same thing as its body. */
    leakClearKept: {
      fr: "Ramener {stage} à {target} garderait **{n} clients payants** de plus par mois.",
      en: "Bringing {stage} to {target} would keep **{n} more paying customers** a month.",
    },
    leakClearKeptOne: {
      fr: "Ramener {stage} à {target} garderait **{n} client payant** de plus par mois.",
      en: "Bringing {stage} to {target} would keep **{n} more paying customer** a month.",
    },
    leakClearPerHundred: {
      fr: "Ramener {stage} à {target} ajouterait **{n} payants pour 100 inscrits**.",
      en: "Bringing {stage} to {target} would add **{n} paying customers per 100 sign-ups**.",
    },
    leakClearPerHundredOne: {
      fr: "Ramener {stage} à {target} ajouterait **{n} payant pour 100 inscrits**.",
      en: "Bringing {stage} to {target} would add **{n} paying customer per 100 sign-ups**.",
    },
    /**
     * A stage the model can't price — go-live, a referred share past a 50 %
     * target (C9, 2026-09-29, ENGINE.md §9.3; since §19.3, day-30 retention
     * and a referred share up to 50 % are priced). `{stage}` is a subject
     * phrase capitalised by the code; `{value}` the measured value; `{target}`
     * `targetPhrase`'s words. No amount: the footer (`slide.leakFooterUnpriced`,
     * or `leakFooterCeiling` for a referred share) says why.
     */
    // TODO: à relire (convention 6) — nouveau (2026-09-30, A7.6, C9).
    leakClearUnpriced: {
      fr: "**{stage} freine le moteur** : {value}, pour {target}.",
      en: "**{stage} is holding the engine back**: {value}, against {target}.",
    },
    /** « En retard sur », not « sous »: the group can hold churn, which trails its target by being ABOVE it. */
    // TODO: à relire (convention 6) — réécrit le 2026-09-30 (A7.1, C1 : aucun repère ne désigne).
    leakShared: {
      fr: "**{n} étapes** sont en retard sur leur cible, sans que l'une pèse nettement plus : {list}.",
      en: "**{n} stages** trail their target, none clearly heavier: {list}.",
    },
    /** `{stage}`: a subject phrase, capitalised by the code; `{side}`: a `side` phrase, which knows churn's direction. */
    leakNotEnoughBelow: {
      fr: "**{stage} est {side}.** Sans cible sur les autres étapes, impossible de dire si c'est la plus grosse fuite.",
      en: "**{stage} sits {side}.** Without targets on the other stages, we can't say whether it's the biggest leak.",
    },
    // TODO: à relire (convention 6) — réécrit le 2026-09-30 (A7.1, C1 : aucun repère ne désigne).
    leakLevel: {
      fr: "Aucune étape n'est en retard sur sa cible : **le levier est le volume ou le prix**.",
      en: "No stage trails its target: **the lever is volume or price**.",
    },
    /** `{documented}` is `slide.documented` filled: « 0 chiffre sur 15 » agrees where « {n} chiffres » could not. */
    visibility: {
      fr: "On documente **{documented}**. Les {k} qui manquent se réparent {repair}.",
      en: "We document **{documented}**. The {k} missing ones take {repair} to fix.",
    },
    visibilityOne: {
      fr: "On documente **{documented}**. Celui qui manque se répare {repair}.",
      en: "We document **{documented}**. The missing one takes {repair} to fix.",
    },
    visibilityAllDocumented: {
      fr: "Les **{N} chiffres** du moteur sont documentés.",
      en: "All **{N} engine numbers** are documented.",
    },
    unitEconomics: {
      fr: "Un client rembourse son coût d'acquisition en **{m}** et rapporte **{x}** ce qu'il coûte.",
      en: "A customer pays back their acquisition cost in **{m}** and brings in **{x}** what they cost.",
    },
    /** `{input}`: `unitInput` phrases, with their article in French (« Il manque la marge brute. »). */
    unitEconomicsUnknown: {
      fr: "**On ne peut pas encore dire ce que rapporte un client.** Il manque {input}.",
      en: "**We can't yet say what a customer is worth.** Missing: {input}.",
    },
    mirror: {
      fr: "L'équipe déclare suivre **{k}** de ces chiffres ; on a pu en sortir **{m}**.",
      en: "The team says it tracks **{k}** of these numbers; we could pull **{m}**.",
    },
    /** `{goal}`: `slide.askGoal*` filled — only the parts the team wrote, so never « de  à  d'ici ». */
    ask: {
      fr: "Nous demandons **{what}** — objectif : {goal}.",
      en: "We're asking for **{what}** — goal: {goal}.",
    },
    askPlain: { fr: "Nous demandons **{what}**.", en: "We're asking for **{what}**." },
    askMeasureFirst: {
      fr: "Nous demandons **{cost}** pour mesurer d'abord ce qui manque ({metric}), avant de décider où investir.",
      en: "We're asking for **{cost}** to measure what's missing first ({metric}), before deciding where to invest.",
    },
    // TODO: à relire (convention 6). The page part is new (2026-09-29): the appendix now runs over two pages or more.
    annex: { fr: "Définitions et sources ({i}/{n})", en: "Definitions and sources ({i}/{n})" },
    // TODO: à relire — nouveau (2026-09-26).
    whatIfLever: { fr: "Si {stage} passait à {to} (aujourd'hui : {from}), le MRR dans 12 mois gagnerait **{gain}**.", en: "If {stage} went from {from} to {to}, MRR in 12 months would gain **{gain}**." },
    // TODO: à relire — nouveau (2026-09-26).
    whatIfLeverPlain: { fr: "**Et si {stage} passait à {to} ?** Aujourd'hui : {from}.", en: "**What if {stage} went from {from} to {to}?**" },
    // TODO: à relire — nouveau (2026-09-26).
    scenario: { fr: "Avec les {n} « Et si » ensemble, le MRR dans 12 mois gagnerait **{gain}**.", en: "With the {n} what-ifs together, MRR in 12 months would gain **{gain}**." },
    // TODO: à relire — nouveau (2026-09-26).
    scenarioPlain: { fr: "**Les {n} « Et si » ensemble.**", en: "**The {n} what-ifs together.**" },
    /**
     * TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S2, ENGINE.md §18.8.2) :
     * the total, the relays, the sales-assisted leak priced in customers, the
     * unit economics side by side. `{total}`, `{plg}` and `{slg}` are the
     * same strings as the body's first line (title = body).
     */
    total: { fr: "Le MRR atteint **{total}** : {plg} en libre-service, {slg} en assisté.", en: "MRR stands at **{total}**: {plg} self-serve, {slg} sales-assisted." },
    /** `{motion}`: `hybrid.ofMotion`. */
    totalUnknown: {
      fr: "**On ne peut pas encore additionner les deux moteurs** : le MRR {motion} n'est pas mesuré.",
      en: "**We can't add the two engines up yet**: {motion} MRR isn't measured.",
    },
    totalUnknownBoth: {
      fr: "**On ne peut pas encore additionner les deux moteurs** : aucun des deux MRR n'est mesuré.",
      en: "**We can't add the two engines up yet**: neither MRR is measured.",
    },
    /** Each value a filled `relays.clause*`, the first capitalised: the last relay carries the accent. */
    slgPelotonComplete: { fr: "{r1} ; {r2} ; **{r3}**.", en: "{r1}; {r2}; **{r3}**." },
    /**
     * « On ne mesure pas {stages} » rather than « {stages} n'est pas
     * mesurée »: the relays' stages mix genders (« le taux de closing », « la
     * mise en production ») and French would have to agree with each.
     */
    slgPelotonGap: {
      fr: "{clauses}. **Entre les deux, on ne voit rien : on ne mesure pas {stages}.**",
      en: "{clauses}. **In between, we see nothing: {stages} aren't measured.**",
    },
    slgPelotonGapOne: {
      fr: "{clauses}. **Entre les deux, on ne voit rien : on ne mesure pas {stages}.**",
      en: "{clauses}. **In between, we see nothing: {stages} isn't measured.**",
    },
    slgPelotonTailBreak: {
      fr: "{clauses}. **Au-delà, on ne sait pas les suivre : on ne mesure pas {stages}.**",
      en: "{clauses}. **Beyond that, we can't follow them: {stages} aren't measured.**",
    },
    slgPelotonTailBreakOne: {
      fr: "{clauses}. **Au-delà, on ne sait pas les suivre : on ne mesure pas {stages}.**",
      en: "{clauses}. **Beyond that, we can't follow them: {stages} isn't measured.**",
    },
    slgPelotonEmpty: {
      fr: "**On ne sait pas encore suivre 100 {base} jusqu'à la mise en production.**",
      en: "**We can't yet follow 100 {base} all the way to go-live.**",
    },
    /** Sales-assisted with no ACV: its chain counts new customers over a quarter (§18.5.3). With an amount, `leakClearMrr*` serve both motions. */
    slgLeakClearCustomers: {
      fr: "Ramener {stage} à {target} ajouterait **{n} nouveaux clients** par trimestre.",
      en: "Bringing {stage} to {target} would add **{n} new customers** a quarter.",
    },
    slgLeakClearCustomersOne: {
      fr: "Ramener {stage} à {target} ajouterait **{n} nouveau client** par trimestre.",
      en: "Bringing {stage} to {target} would add **{n} new customer** a quarter.",
    },
    /** Renewal with no sales-assisted ARPA: contracts KEPT. */
    slgLeakClearKept: {
      fr: "Ramener {stage} à {target} garderait **{n} contrats** de plus par trimestre.",
      en: "Bringing {stage} to {target} would keep **{n} more contracts** a quarter.",
    },
    slgLeakClearKeptOne: {
      fr: "Ramener {stage} à {target} garderait **{n} contrat** de plus par trimestre.",
      en: "Bringing {stage} to {target} would keep **{n} more contract** a quarter.",
    },
    /** No count to multiply: `{worth}` a `worth.perHundred*` phrase, read on the relay's own 100. */
    slgLeakClearPerHundred: {
      fr: "Ramener {stage} à {target} donnerait **{worth}**.",
      en: "Bringing {stage} to {target} would give **{worth}**.",
    },
    /** `{plg}`, `{slg}`: two paybacks with their unit (« 4 mois »). Self-serve first, always (§18.6.4). */
    unitEconomicsBoth: {
      fr: "Un client libre-service rembourse son coût d'acquisition en **{plg}**, un client assisté en **{slg}**.",
      en: "A self-serve customer pays back their acquisition cost in **{plg}**, a sales-assisted one in **{slg}**.",
    },
    /**
     * One payback computable: `{m}` it, `{input}` what the other side lacks, with its article (« il manque la
     * marge brute »). Two templates, not a `{known}` slot: self-serve is named first whichever side is known (§18.6.4).
     */
    unitEconomicsOneSidePlg: {
      fr: "Un client libre-service rembourse son coût d'acquisition en **{m}**. Côté assisté, **on ne peut pas encore le dire** : il manque {input}.",
      en: "A self-serve customer pays back their acquisition cost in **{m}**. On the sales-assisted side, **we can't say yet**. Missing: {input}.",
    },
    unitEconomicsOneSideSlg: {
      fr: "Côté libre-service, **on ne peut pas encore le dire** : il manque {input}. Un client assisté rembourse son coût d'acquisition en **{m}**.",
      en: "On the self-serve side, **we can't say yet**. Missing: {input}. A sales-assisted customer pays back their acquisition cost in **{m}**.",
    },
    unitEconomicsNoneMargins: {
      fr: "**On ne peut pas encore dire ce que rapporte un client** : la marge brute n'est mesurée dans aucune des deux motions.",
      en: "**We can't yet say what a customer is worth**: gross margin isn't measured for either motion.",
    },
    /** `{plg}`, `{slg}`: `unitInput` phrases, with their article. */
    unitEconomicsNoneDifferent: {
      fr: "**On ne peut pas encore dire ce que rapporte un client** : il manque {plg} en libre-service et {slg} en assisté.",
      en: "**We can't yet say what a customer is worth**: self-serve lacks {plg}, sales-assisted lacks {slg}.",
    },
    /**
     * TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T1, §19.2.6) : « Ce qui a bougé »,
     * décochée par défaut — evolution, evolutionOne, evolutionStill, evolutionApart. `{month}`: the
     * month before; `{leak}`: `slide.evolutionLeak*`, or ""; `{before}`, `{now}`: the two months.
     */
    evolution: { fr: "**{n} chiffres ont bougé** depuis {month}{leak}", en: "**{n} numbers moved** since {month}{leak}" },
    evolutionOne: { fr: "**{n} chiffre a bougé** depuis {month}{leak}", en: "**{n} number moved** since {month}{leak}" },
    evolutionStill: { fr: "**Rien n'a bougé** depuis {month}{leak}", en: "**Nothing moved** since {month}{leak}" },
    evolutionApart: { fr: "**{before} et {now} ne se comparent pas encore**", en: "**{before} and {now} don't compare yet**" },
  } satisfies Record<SlideTitleKey, Translatable>,
  /** Speaker notes (§9.4), pre-written against the classic objections. */
  notes: {
    compared: { fr: "Comparé à quoi ? — {comparator}.", en: "Compared with what? — {comparator}." },
    /** One per measured peloton column. The column's period IS its cohort month: said once. */
    source: {
      fr: "D'où vient ce chiffre ? — {metric} : {tool}, inscrits en {cohort}.",
      en: "Where does this number come from? — {metric}: {tool}, {cohort} cohort.",
    },
    seasonal: {
      fr: "Et si c'est saisonnier ? — Un seul mois est mesuré pour l'instant ; la comparaison d'un mois à l'autre viendra avec le suivant.",
      en: "What if it's seasonal? — Only one month is measured so far; the month-on-month comparison comes with the next one.",
    },
    /** TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T1, §19.2.6) : `seasonal` from the second month on. `{n}`: the months the engine holds. */
    series: {
      fr: "Et si c'est saisonnier ? — {n} mois sont suivis ; un écart ne se lit qu'entre deux mois mesurés de la même façon.",
      en: "What if it's seasonal? — {n} months are tracked; a change is only read between two months measured the same way.",
    },
    /** `{stage}`: a subject phrase; `{ranking}`: one of `ranking`, capitalised by the code. */
    whyNot: { fr: "Pourquoi pas {stage} ? — {ranking}.", en: "Why not {stage}? — {ranking}." },
    /** Why a stage is not the one the slide names — each a clause `whyNot` closes with a full stop. */
    ranking: {
      unknown: { fr: "pas de chiffre : impossible de l'exclure", en: "no number: it can't be ruled out" },
      // TODO: à relire (convention 6) — réécrit le 2026-09-30 (A7.1, C1 : aucun repère ne désigne).
      noComparator: {
        fr: "sans cible d'équipe, aucun classement possible",
        en: "no team target, so it can't be ranked",
      },
      maybe: { fr: "{side} : sa fourchette chevauche le seuil", en: "{side}: its range straddles the line" },
      belowWorth: {
        fr: "{side} aussi, mais l'écart vaut {worth}, contre {top}",
        en: "{side} too, but the gap is worth {worth}, against {top}",
      },
      belowUnpriced: { fr: "{side} aussi, sans montant calculable", en: "{side} too, with no amount that can be computed" },
      belowNoArpa: {
        fr: "{side} aussi, mais sans montant commun, le churn ne se compare pas aux autres étapes",
        en: "{side} too, but with no amount in common, churn can't be compared with the other stages",
      },
    },
    /** TODO: à relire — nouveau (2026-09-26). On every what-if slide: the projection is not a forecast. */
    whatIf: {
      fr: "Est-ce une prévision ? — Non : une projection au rythme de ce mois, qui ne tient que si les hypothèses en bas de la slide tiennent.",
      en: "Is this a forecast? — No: a projection at this month's pace, which only holds if the assumptions at the bottom of the slide hold.",
    },
    // TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S2, ENGINE.md §18.8.3) : the hybrid's and sales-assisted's objections.
    /** `{i}`, `{j}`: the two leak slides, self-serve's first. */
    whyNotCompare: {
      fr: "Pourquoi ne pas comparer les deux ? — Les deux motions vendent à des segments différents : chacune se lit contre ses cibles (slides {i} et {j}).",
      en: "Why not compare the two? — The two motions sell to different segments: each is read against its own targets (slides {i} and {j}).",
    },
    /** `{link}`: `total.link` filled. */
    selfServeFeeds: {
      fr: "Le libre-service alimente-t-il les ventes ? — {link} Ce n'est pas une attribution.",
      en: "Does self-serve feed sales? — {link} It isn't an attribution.",
    },
    /** The link's lever moved (C25 Q7): `{n}` signatures a quarter, formatted with its « ~ ». */
    selfServeLever: {
      fr: "Si le libre-service passait {to} opportunités aux commerciaux au lieu de {from}, l'assisté signerait {n} de plus par trimestre (slide {k}).",
      en: "If self-serve handed {to} opportunities to sales instead of {from}, sales-assisted would sign {n} more a quarter (slide {k}).",
    },
    whyThreeMonths: {
      fr: "Pourquoi trois mois ? — Un mois compte trop peu d'affaires ; trois mois lissent sans mélanger deux grilles tarifaires.",
      en: "Why three months? — One month has too few deals; three months smooth it out without mixing two price lists.",
    },
    /** `{c}`: the median cycle with its unit (« 45 jours »). */
    cycle: { fr: "Et le cycle ? — Cycle médian de {c}.", en: "What about the cycle? — Median cycle of {c}." },
    /** `slg-cycle-long` raised: the check's message says « ton », made for the screen; a note is read out to a room (§18.11). */
    cycleLong: {
      fr: "Et le cycle ? — Cycle médian de {c}, plus long que les trois mois de la fenêtre : le CAC du trimestre divise sa dépense par des clients venus des dépenses d'avant. C'est un ordre de grandeur.",
      en: "What about the cycle? — Median cycle of {c}, longer than the three-month window: this quarter's CAC divides its spend by customers from earlier spend. It's an order of magnitude.",
    },
    whoCountsWhere: {
      fr: "Qui compte où ? — Un client compte dans la motion qui a signé son contrat en cours. Un compte du libre-service signé par un commercial compte en assisté, et ce passage n'est pas un départ du libre-service.",
      en: "Who counts where? — A customer counts in the motion that signed their current contract. A self-serve account signed by a salesperson counts as sales-assisted, and that move isn't a self-serve departure.",
    },
    /** One per measured relay: its period is three months, said with its preposition. */
    sourceSlg: { fr: "D'où vient ce chiffre ? — {metric} : {tool}, {period}.", en: "Where does this number come from? — {metric}: {tool}, {period}." },
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
    /** Churn behind its comparator is ABOVE it (lower is better). */
    aboveComparator: { fr: "{metric} : {value}, au-dessus de {comparator}.", en: "{metric}: {value}, above {comparator}." },
    conflict: {
      fr: "{metric} : {a} selon {sourceA}, {b} selon {sourceB}.",
      en: "{metric}: {a} according to {sourceA}, {b} according to {sourceB}.",
    },
    unitEcon: {
      fr: "Impossible de dire en combien de mois un client rembourse son coût d'acquisition. Il manque {input}.",
      en: "We can't say how many months a customer takes to pay back their acquisition cost. Missing: {input}.",
    },
    reconcile: {
      fr: "Ta chaîne prédit ~{p} nouveaux payants en {month} ; ta facturation en compte {n}. Au moins une définition ne porte pas sur la même population.",
      en: "Your chain predicts ~{p} new paying customers in {month}; your billing counts {n}. At least one definition doesn't cover the same population.",
    },
    /** A small company can predict one payer: the noun agrees with `finding.count`, as printed. */
    reconcileOne: {
      fr: "Ta chaîne prédit ~{p} nouveau payant en {month} ; ta facturation en compte {n}. Au moins une définition ne porte pas sur la même population.",
      en: "Your chain predicts ~{p} new paying customer in {month}; your billing counts {n}. At least one definition doesn't cover the same population.",
    },
    smallCohort: {
      fr: "Moins de 100 inscrits dans la cohorte : chaque inscrit pèse plus d'un point de pourcentage.",
      en: "Fewer than 100 sign-ups in the cohort: each one weighs more than a percentage point.",
    },
    // TODO: à relire (convention 6) — neuf le 2026-09-30 (A7.3.c S1, ENGINE.md §18.5) : chainBreakRelay, relayVerb, base, smallSample(One).
    /** A sales-assisted relay nobody could pull: each relay has its own base of 100 (§18.5.1). */
    chainBreakRelay: { fr: "Sur 100 {base}, on ne sait pas dire combien {verb}.", en: "Out of 100 {base}, we can't say how many {verb}." },
    relayVerb: {
      leadToOpp: { fr: "deviennent une opportunité", en: "become an opportunity" },
      winRate: { fr: "sont signées", en: "are signed" },
      goLive: { fr: "sont en production à {n} jours", en: "are live within {n} days" },
    },
    /** What a sales-assisted rate is counted on, as a plural noun after a number. */
    base: {
      leads: { fr: "leads", en: "leads" },
      mql: { fr: "MQL", en: "MQLs" },
      closedOpps: { fr: "opportunités conclues", en: "closed opportunities" },
      newCustomers: { fr: "nouveaux clients", en: "new customers" },
      renewals: { fr: "contrats échus", en: "contracts up for renewal" },
      oppsCreated: { fr: "opportunités créées", en: "opportunities created" },
      customers: { fr: "clients assistés", en: "sales-assisted customers" },
    },
    smallSample: {
      fr: "Sur {d} {base}, un de plus ou de moins bouge le taux de {p} points : lis la direction.",
      en: "Out of {d} {base}, one more or less moves the rate by {p} points: read the direction.",
    },
    smallSampleOne: {
      fr: "Sur {d} {base}, un de plus ou de moins bouge le taux de {p} point : lis la direction.",
      en: "Out of {d} {base}, one more or less moves the rate by {p} point: read the direction.",
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
    reconcileGapOne: {
      fr: "Ta chaîne prédit ~{p} nouveau payant en {month} ; ta facturation en compte {n}. Au moins une définition ne porte pas sur la même population.",
      en: "Your chain predicts ~{p} new paying customer in {month}; your billing counts {n}. At least one definition doesn't cover the same population.",
    },
    // TODO: à relire (convention 6) — neuf le 2026-09-30 (A7.3.c S1, ENGINE.md §18.5) : slgCycleLong, slgAcvVsArpa, cacVariantsDiffer.
    slgCycleLong: {
      fr: "Ton cycle médian dépasse les trois mois de la fenêtre : le CAC du trimestre divise sa dépense par des clients venus des dépenses d'avant. Lis-le comme un ordre de grandeur.",
      en: "Your median cycle is longer than the three-month window: this quarter's CAC divides its spend by customers from earlier spend. Read it as an order of magnitude.",
    },
    slgAcvVsArpa: {
      fr: "Un nouveau contrat vaut {x} fois le panier moyen du portefeuille : hausse de prix, nouveau segment, ou deux définitions du revenu ?",
      en: "A new contract is worth {x} times the book's average: price rise, new segment, or two definitions of revenue?",
    },
    /** `{plg}` and `{slg}`: the two CACs' variants, lower-cased labels. */
    cacVariantsDiffer: {
      fr: "Les deux CAC ne comptent pas les mêmes dépenses : {plg} en libre-service, {slg} en assisté.",
      en: "The two CACs don't count the same spend: {plg} self-serve, {slg} sales-assisted.",
    },
    /** TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T4, §19.5.3) : twoTools. `{a}` and `{b}`: the two tools' names. */
    twoTools: {
      fr: "Numérateur ({a}) et dénominateur ({b}) viennent de deux outils : vérifie qu'ils comptent la même chose sur la même période.",
      en: "Numerator ({a}) and denominator ({b}) come from two tools: check they count the same thing over the same period.",
    },
    toCheck: { fr: "à vérifier", en: "to check" },
  },

  // --- Storage, file, resume, erase (§14.11) -------------------------------
  // TODO: à relire — nouveau (2026-09-25, retours d'Antoine) : les réglages modifiables après coup.
  settings: {
    title: { fr: "Tes réglages", en: "Your settings" },
    save: { fr: "Enregistrer les réglages", en: "Save settings" },
    cancel: { fr: "Annuler", en: "Cancel" },
    // TODO: à relire (convention 6) — retouché le 2026-10-02 (A18 T2.b) : l'anglais des quatre `*Reset` cite l'étiquette que la liste affiche, « To do » (le français disait déjà « à faire »).
    activationReset: {
      fr: "La fenêtre d'activation fait partie de la définition du taux d'activation : ton chiffre déjà saisi repassera « à faire », pour que tu le remesures sur {n} jours.",
      en: "The activation window is part of the activation rate's definition: the number you already entered will go back to \"to do\", so you can measure it again over {n} days.",
    },
    paidReset: {
      fr: "La fenêtre de paiement fait partie de la définition de la conversion en payant : ton chiffre déjà saisi repassera « à faire », pour que tu le remesures sur {n} jours.",
      en: "The payment window is part of the paid conversion's definition: the number you already entered will go back to \"to do\", so you can measure it again over {n} days.",
    },
    monthsChanged: {
      fr: "Tes chiffres déjà saisis portent sur les mois d'avant. Ils ne sont pas effacés : relis-les.",
      en: "The numbers you already entered are for the previous months. They are not erased: read them again.",
    },
    /**
     * TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S2, ENGINE.md §18.1.2) : ticking or
     * unticking a motion afterwards, where nothing is lost. `{motion}`:
     * `hybrid.motionSubject`, with its article. `{n}`: the numbers already
     * entered on that side.
     */
    motionOff: {
      fr: "Décocher {motion} le retire du tableau et des slides. Ses {n} chiffres, ses cibles et ses « Et si » restent sur cet appareil et dans ton fichier : recoche pour les retrouver.",
      en: "Unticking {motion} removes it from the board and the slides. Its {n} numbers, targets and what-ifs stay on this device and in your file: tick it again to get them back.",
    },
    motionOffOne: {
      fr: "Décocher {motion} le retire du tableau et des slides. Son chiffre, ses cibles et ses « Et si » restent sur cet appareil et dans ton fichier : recoche pour les retrouver.",
      en: "Unticking {motion} removes it from the board and the slides. Its number, targets and what-ifs stay on this device and in your file: tick it again to get them back.",
    },
    /** Nothing entered on that side yet: no « 0 chiffres » to keep. */
    motionOffNone: {
      fr: "Décocher {motion} le retire du tableau et des slides. Aucun chiffre n'y est encore saisi : rien ne se perd.",
      en: "Unticking {motion} removes it from the board and the slides. No number has been entered there yet: nothing is lost.",
    },
    motionOnSlg: {
      fr: "L'assisté commence vide : {n} chiffres à aller chercher. Ton libre-service ne change pas.",
      en: "Sales-assisted starts empty: {n} numbers to go and get. Your self-serve side doesn't change.",
    },
    motionOnPlg: {
      fr: "Le libre-service commence vide : {n} chiffres à aller chercher. Ton assisté ne change pas.",
      en: "Self-serve starts empty: {n} numbers to go and get. Your sales-assisted side doesn't change.",
    },
    motionBack: { fr: "On retrouve les {n} chiffres que tu avais saisis.", en: "Your {n} numbers are back." },
    motionBackOne: { fr: "On retrouve le chiffre que tu avais saisi.", en: "Your number is back." },
    /** The box left ticked is disabled, with this under it. */
    motionLast: { fr: "Il faut au moins une façon de vendre.", en: "You need at least one way you sell." },
    qualificationReset: {
      fr: "La fenêtre de qualification fait partie de la définition du passage des leads en opportunités : ton chiffre déjà saisi repassera « à faire », pour que tu le remesures sur {n} jours.",
      en: "The qualification window is part of the lead-to-opportunity rate's definition: the number you already entered will go back to \"to do\", so you can measure it again over {n} days.",
    },
    goLiveReset: {
      fr: "La fenêtre de mise en production fait partie de la définition du taux de mise en production : ton chiffre déjà saisi repassera « à faire », pour que tu le remesures sur {n} jours.",
      en: "The go-live window is part of the go-live rate's definition: the number you already entered will go back to \"to do\", so you can measure it again over {n} days.",
    },
    saved: { fr: "Réglages enregistrés.", en: "Settings saved." },
    /**
     * TODO: à relire (convention 6) — le 2026-10-02 (A18 T3.d, le retour 07, design/ds-extension-07-return/COPY.md) :
     * les Réglages reçoivent les cibles et les nombres partagés (« Ta base », partie avec le pas à pas en T3.b).
     * `{list}` : les chiffres qui utilisent le nombre, en milieu de phrase (`midSentence`), joints par `grammar`
     * (« A, B et C »). Écarts au retour : `sharedLead` et `wholeCount` n'y sont pas, la session les a écrits (le
     * premier reprend la définition que le glossaire donnera au terme avec T6, le second la garde d'A15.9 sur un
     * compte à zéro) ; `targetsLead` y dit « de chaque chiffre », ramené à « de chacun de ces chiffres » : seuls
     * ceux qui peuvent nommer une étape ont une case (la relecture de T3.a, sur `targetsStart.lead`).
     */
    lead: {
      fr: "Tout ici a une valeur par défaut. Change-la quand un chiffre le demande.",
      en: "Everything here has a default. Change it when a number asks for it.",
    },
    targets: { fr: "Cibles", en: "Targets" },
    targetsLead: {
      fr: "Les mêmes cases que sur l'écran de chacun de ces chiffres, toutes au même endroit, pour une équipe qui garde ses cibles dans un tableau.",
      en: "The same boxes as on each of these numbers' screens, all in one place, for a team that keeps its targets in a sheet.",
    },
    shared: { fr: "Nombres partagés", en: "Shared counts" },
    sharedLead: {
      fr: "Un nombre que plusieurs chiffres utilisent, saisi une fois : le modifier ici le modifie dans chacun d'eux.",
      en: "A count several numbers use, typed once: change it here and it changes in each of them.",
    },
    sharedHint: { fr: "Utilisé par {list}.", en: "Used by {list}." },
    wholeCount: { fr: "Un nombre entier plus grand que zéro.", en: "A whole number above zero." },
  },

  // TODO: à relire — nouveau (2026-09-25, retours d'Antoine) : l'exemple rempli.
  example: {
    bannerTitle: { fr: "Exemple : une appli SaaS fictive", en: "Example: a fictional SaaS app" },
    /** `{activation}` and `{churn}`: the fictional team's targets, formatted from `lib/engine/example.ts`. */
    // TODO: à relire (convention 6) — réécrit le 2026-09-30 (A7.1, C1 : aucun repère ne désigne).
    bannerBody: {
      fr: "Chiffres et cibles inventés, pour montrer le funnel et les slides une fois remplis : l'équipe fictive vise {activation} d'activation et {churn} de churn logo par mois. Rien n'est enregistré, et ça ne touche pas à ton moteur.",
      en: "Made-up numbers and targets, to show the funnel and the slides once filled in: the fictional team aims for {activation} activation and {churn} monthly logo churn. Nothing is saved, and it doesn't touch your engine.",
    },
    /**
     * The example in the motions the setup card ticked (A7.3.c S3, §18.7): its targets, read from
     * `lib/engine/example.ts`, the sales-assisted ones fictional too (§18.9).
     */
    // TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S3).
    bannerBodySlg: {
      fr: "Chiffres et cibles inventés, pour montrer les relais et les slides une fois remplis : l'équipe fictive vise {winRate} de closing et {renewal} de renouvellement des contrats. Rien n'est enregistré, et ça ne touche pas à ton moteur.",
      en: "Made-up numbers and targets, to show the relays and the slides once filled in: the fictional team aims for a {winRate} win rate and {renewal} contract renewal. Nothing is saved, and it doesn't touch your engine.",
    },
    // TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S3).
    bannerBodyHybrid: {
      fr: "Chiffres et cibles inventés, pour montrer les deux moteurs, leur total et les slides une fois remplis : l'équipe fictive vise {activation} d'activation et {churn} de churn logo par mois en libre-service, {winRate} de closing et {renewal} de renouvellement en assisté. Rien n'est enregistré, et ça ne touche pas à ton moteur.",
      en: "Made-up numbers and targets, to show the two engines, their total and the slides once filled in: the fictional team aims for {activation} activation and {churn} monthly logo churn self-serve, a {winRate} win rate and {renewal} renewal sales-assisted. Nothing is saved, and it doesn't touch your engine.",
    },
    back: { fr: "← Revenir", en: "← Back" },
    deck: { fr: "Voir les slides de l'exemple →", en: "See the example's slides →" },
    event: { fr: "a créé un premier projet", en: "created a first project" },
    channel: { fr: "Recherche naturelle", en: "Organic search" },
    company: { fr: "Exemple SaaS", en: "Example SaaS" },
    /** The hybrid example's words (§18.9.1): what « live » means, the main reason for non-renewal, the PQL threshold. */
    // TODO: à relire (convention 6) — neuf le 2026-09-30 (A7.3.c S1, ENGINE.md §18.5).
    liveEvent: { fr: "premier rapport partagé avec l'équipe du client", en: "first report shared with the customer's team" },
    lossCause: { fr: "départ du sponsor chez le client", en: "departure of the customer's sponsor" },
    pqlThreshold: { fr: "espace avec 3 membres actifs", en: "workspace with 3 active members" },
  },

  storage: {
    backupWarning: {
      fr: "Ton moteur n'existe que dans ce navigateur. Safari peut effacer les données d'un site après sept jours d'utilisation de Safari sans passage sur ce site : sauvegarde-le dans un fichier.",
      en: "Your engine only exists in this browser. Safari may erase a site's data after seven days of Safari use without a visit to that site: save it to a file.",
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
  // TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T5, §19.1.5) : plusieurs moteurs sur un appareil. `{name}` : le nom de l'entreprise, sinon `unnamed`.
  engines: {
    unnamed: { fr: "Moteur sans nom, créé le {date}", en: "Unnamed engine, created {date}" },
    upTo: { fr: "jusqu'à {month}", en: "up to {month}" },
    onScreen: { fr: "à l'écran", en: "on screen" },
    open: { fr: "Ouvrir", en: "Open" },
    new: { fr: "Nouveau moteur", en: "New engine" },
    full: { fr: "{max} moteurs au plus sur cet appareil : sauvegarde un moteur dans un fichier et supprime-le pour en créer un autre.", en: "{max} engines at most on this device: save one to a file and delete it to start another." },
    delete: { fr: "Supprimer ce moteur", en: "Delete this engine" },
    deleteTitle: { fr: "Supprimer « {name} » ?", en: "Delete \"{name}\"?" },
    deleteBody: { fr: "Ses chiffres quittent cet appareil, et les autres moteurs ne bougent pas. Sauvegarde-le d'abord dans un fichier si tu veux pouvoir le rouvrir.", en: "Its numbers leave this device, and the other engines don't move. Save it to a file first if you may want to reopen it." },
    deleteSaved: { fr: "Sauvegardé : le fichier est dans tes téléchargements.", en: "Saved: the file is in your downloads." },
    deleteConfirm: { fr: "Supprimer ce moteur", en: "Delete this engine" },
    cancel: { fr: "Annuler", en: "Cancel" },
  },
  // TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T5, §19.6) : « Saisie en tableau », le modèle CSV et son aperçu. `columns` : l'en-tête du modèle, relu au collage ; `reasons` : `{reason}` de `refused`.
  table: {
    title: { fr: "Saisie en tableau", en: "Enter as a table" },
    intro: { fr: "Télécharge le modèle, remplis-le dans ton tableur, puis colle-le ici. Rien ne s'écrit avant « Appliquer ».", en: "Download the template, fill it in your spreadsheet, then paste it here. Nothing is written until \"Apply\"." },
    download: { fr: "Télécharger le modèle", en: "Download the template" },
    fileName: { fr: "tdg-modele-{month}.csv", en: "tdg-template-{month}.csv" },
    pasteLabel: { fr: "Coller depuis un tableur", en: "Paste from a spreadsheet" },
    pasteHint: { fr: "Des colonnes copiées d'un tableur, ou un CSV. Chaque ligne se rattache à un chiffre par son id, sinon par son nom.", en: "Columns copied from a spreadsheet, or a CSV. Each row is matched to a number by its id, else by its name." },
    read: { fr: "Lire le tableau", en: "Read the table" },
    previewTitle: { fr: "Aperçu, avant d'écrire", en: "Preview, before writing" },
    line: { fr: "Ligne {line}", en: "Row {line}" },
    new: { fr: "Nouveau : {after}", en: "New: {after}" },
    changed: { fr: "Modifié : {before} → {after}", en: "Changed: {before} → {after}" },
    same: { fr: "Inchangé", en: "Unchanged" },
    refused: { fr: "Refusé : {reason}", en: "Refused: {reason}" },
    following: { fr: "{name} suit le compte partagé : {before} → {after}", en: "{name} follows the shared count: {before} → {after}" },
    empty: { fr: "Lignes sans chiffre, ignorées : {n}", en: "Rows with no number, skipped: {n}" },
    emptyOne: { fr: "1 ligne sans chiffre, ignorée", en: "1 row with no number, skipped" },
    nothing: { fr: "Aucun chiffre à appliquer.", en: "No number to apply." },
    apply: { fr: "Appliquer {n} chiffres", en: "Apply {n} numbers" },
    applyOne: { fr: "Appliquer 1 chiffre", en: "Apply 1 number" },
    cancel: { fr: "Annuler", en: "Cancel" },
    applied: { fr: "Tableau appliqué.", en: "Table applied." },
    columns: {
      id: { fr: "id", en: "id" },
      name: { fr: "chiffre", en: "number" },
      stage: { fr: "étape", en: "stage" },
      numerator: { fr: "numérateur", en: "numerator" },
      denominator: { fr: "dénominateur", en: "denominator" },
      value: { fr: "valeur", en: "value" },
      unit: { fr: "unité", en: "unit" },
      source: { fr: "source", en: "source" },
    },
    reasons: {
      unknown: { fr: "chiffre inconnu", en: "unknown number" },
      hidden: { fr: "ce chiffre n'est pas dans les façons de vendre cochées", en: "this number isn't in the ways of selling ticked" },
      duplicate: { fr: "ce chiffre est déjà sur une ligne plus haut", en: "this number is already on an earlier row" },
      unreadable: { fr: "nombre illisible", en: "unreadable number" },
      incomplete: { fr: "il faut le numérateur et le dénominateur", en: "both the numerator and the denominator are needed" },
      denominatorZero: { fr: "dénominateur nul", en: "zero denominator" },
      numGtDen: { fr: "plus de la part que du tout", en: "more of the part than of the whole" },
      negative: { fr: "nombre négatif", en: "negative number" },
      percentRange: { fr: "un pourcentage va de 0 à 100", en: "a percentage goes from 0 to 100" },
      text: { fr: "chiffre texte, à saisir dans sa fiche", en: "a text answer, to enter in its sheet" },
      sheet: { fr: "un choix à faire dans sa fiche", en: "a choice to make in its sheet" },
      shared: { fr: "{other} porte aussi ce compte, à une autre valeur plus haut", en: "{other} carries this count too, with another value on an earlier row" },
    },
  },
  // TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T6, §19.9) : les rappels en fichier calendrier. Jamais une valeur ni le nom de l'entreprise : `{role}` est un rôle, `{list}` les noms du catalogue.
  reminders: {
    request: { fr: "Me le rappeler", en: "Remind me" },
    requestTitle: { fr: "Relancer {role} : {n} chiffres du moteur", en: "Follow up with {role}: {n} engine numbers" },
    requestTitleOne: { fr: "Relancer {role} : 1 chiffre du moteur", en: "Follow up with {role}: 1 engine number" },
    requestDescription: { fr: "Demandés à {role} :\n{list}", en: "Asked of {role}:\n{list}" },
    requestDescriptionOne: { fr: "Demandé à {role} :\n{list}", en: "Asked of {role}:\n{list}" },
    month: { fr: "Me rappeler de démarrer {month}", en: "Remind me to start {month}" },
    monthTitle: { fr: "Démarrer {month} dans le moteur de growth", en: "Start {month} in the growth engine" },
    monthDescription: { fr: "Mois clos : {month}. Ses chiffres peuvent entrer dans ton moteur.", en: "Month over: {month}. Its numbers can go into your engine." },
    fileName: { fr: "tdg-rappel-{date}.ics", en: "tdg-reminder-{date}.ics" },
  },
  io: {
    importTitle: { fr: "Importer un moteur", en: "Import an engine" },
    importPreview: { fr: "{company} · {month} · {n} sur {N} chiffres trouvés", en: "{company} · {month} · {n} of {N} numbers found" },
    // TODO: à relire (convention 6) — retouché le 2026-10-01 (A14 T5) : « Remplacer celui de cet appareil » ne désignait plus un seul moteur ; le choix dit lequel.
    replace: { fr: "Remplacer", en: "Replace" },
    cancel: { fr: "Annuler", en: "Cancel" },
    warnings: { fr: "Fichier ouvert, avec des avertissements ({n}) :", en: "File opened, with warnings ({n}):" },
    unknownVersion: {
      fr: "Ce fichier vient d'une version plus récente du moteur : il ne peut pas être lu ici.",
      en: "This file comes from a newer version of the engine: it can't be read here.",
    },
    notEngine: { fr: "Ce fichier n'est pas un moteur Tour de Growth.", en: "This file isn't a Tour de Growth engine." },
    // TODO: à relire (convention 6) — neuf le 2026-09-30 (A7.3.c S0, §18.3.2) : le fichier v2 et la migration d'un v1.
    unsupportedSetup: {
      fr: "Ce fichier ne dit pas comment l'entreprise vend : il ne peut pas s'ouvrir.",
      en: "This file doesn't say how the company sells: it can't be opened.",
    },
    migrated: {
      fr: "Fichier d'une version précédente : il a été mis à jour, rien n'a changé dans tes chiffres.",
      en: "File from an earlier version: it's been updated, nothing changed in your numbers.",
    },
    fileName: { fr: "tdg-moteur-{month}.json", en: "tdg-engine-{month}.json" },
    // TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S2, ENGINE.md §18.1.2) : a file with both motions. `{counts}`: `hybrid.motionCount` (or `motionCountHidden`) per motion, joined with « · ».
    importPreviewMotions: { fr: "{company} · {month} · {counts}", en: "{company} · {month} · {counts}" },
    // TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T5, §19.7) : les trois choix à l'import et l'aperçu de la fusion.
    choiceLabel: { fr: "Que faire de ce fichier ?", en: "What to do with this file?" },
    add: { fr: "Ajouter comme nouveau moteur", en: "Add as a new engine" },
    replaceNamed: { fr: "Remplacer « {name} »", en: "Replace \"{name}\"" },
    merge: { fr: "Fusionner dans « {name} »", en: "Merge into \"{name}\"" },
    addFull: { fr: "{max} moteurs au plus sur cet appareil.", en: "{max} engines at most on this device." },
    replaceHint: { fr: "Les chiffres de « {name} » sur cet appareil sont remplacés par ceux du fichier.", en: "The numbers of \"{name}\" on this device are replaced by the file's." },
    mergeHint: { fr: "Mois par mois : un chiffre vide prend celui de l'autre, deux chiffres différents gardent le plus récent.", en: "Month by month: an empty number takes the other's, two different numbers keep the more recent." },
    mergeTitle: { fr: "Ce que la fusion change", en: "What the merge changes" },
    mergeNothing: { fr: "Rien : ce fichier ne dit rien que « {name} » ne dise déjà.", en: "Nothing: this file says nothing \"{name}\" doesn't already say." },
    monthAdded: { fr: "{month} : mois ajouté", en: "{month}: month added" },
    filled: { fr: "{month} · {name} : {after}, vide sur cet appareil", en: "{month} · {name}: {after}, empty on this device" },
    replaced: { fr: "{month} · {name} : {before} → {after}, plus récent dans le fichier", en: "{month} · {name}: {before} → {after}, more recent in the file" },
    targetFilled: { fr: "{month} · {name}, cible : {after}", en: "{month} · {name}, target: {after}" },
    countFilled: { fr: "{month} · {count} : {after}", en: "{month} · {count}: {after}" },
    pipelineFilled: { fr: "{month} · pipeline ouvert : {after}", en: "{month} · open pipeline: {after}" },
    closed: { fr: "{month} : mois clos le {date}, quand le mois suivant a démarré", en: "{month}: month closed on {date}, when the next month started" },
    addApply: { fr: "Ajouter", en: "Add" },
    mergeApply: { fr: "Fusionner", en: "Merge" },
    mergeRefused: {
      type: { fr: "Fusion impossible : le type d'entreprise n'est pas le même.", en: "Can't merge: the type of company isn't the same." },
      motions: { fr: "Fusion impossible : les façons de vendre cochées ne sont pas les mêmes.", en: "Can't merge: the ways of selling ticked aren't the same." },
      currency: { fr: "Fusion impossible : la devise n'est pas la même.", en: "Can't merge: the currency isn't the same." },
      windows: { fr: "Fusion impossible : les fenêtres ne sont pas les mêmes, donc les chiffres n'ont pas la même définition.", en: "Can't merge: the windows aren't the same, so the numbers don't share a definition." },
      months: { fr: "Fusion impossible : les deux réunis dépasseraient {max} mois.", en: "Can't merge: together they would hold more than {max} months." },
    },
    // TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T5, §19.7) : le nom d'un compte partagé dans une ligne de fusion (`countFilled`, `{count}`).
    sharedCount: {
      cohortSignups: { fr: "inscrits de la cohorte suivie", en: "sign-ups in the followed cohort" },
      monthSignups: { fr: "inscrits du mois", en: "sign-ups in the month" },
      mrrEnd: { fr: "MRR en fin de mois", en: "MRR at the month's end" },
      mrrStart: { fr: "MRR en début de mois", en: "MRR at the month's start" },
      slgOppsCreated: { fr: "opportunités créées sur trois mois", en: "opportunities created over three months" },
      slgDealsWon: { fr: "contrats gagnés sur trois mois", en: "deals won over three months" },
      slgCustomers: { fr: "clients assistés en fin de mois", en: "sales-assisted customers at the month's end" },
    },
  },
  /**
   * TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T2, moteur-complet.md §19.2.1-§19.2.5) :
   * the screens of the monthly series — every key of this group. `{month}`: a month, formatted
   * (« août 2026 »); `{change}`: a signed change, formatted; `{stage}`: a stage with its article;
   * `{list}`: stages joined (« l'activation et le churn logo »); `{max}`: the months an engine holds at most.
   */
  series: {
    /** The month selector, beside the engine's (§19.2.4). */
    monthLabel: { fr: "Mois", en: "Month" },
    /** A past month, read only: the band above the board. */
    viewing: { fr: "Tu regardes {month}, en lecture seule.", en: "You're looking at {month}, read-only." },
    correct: { fr: "Corriger ce mois", en: "Correct this month" },
    correcting: { fr: "Tu corriges {month} : les écarts du mois suivant se recalculent.", en: "You're correcting {month}: the next month's changes recompute." },
    doneCorrecting: { fr: "Terminer la correction", en: "Done correcting" },
    /** The flows' month is over (§19.2.1): the next month can start. */
    ready: { fr: "Mois clos : {month}. Ses chiffres peuvent commencer ; les cibles et les définitions suivent, les valeurs jamais.", en: "Month over: {month}. Its numbers can start; targets and definitions carry over, values never do." },
    /** `MAX_MONTHS` reached (§19.1.6). */
    full: { fr: "Ce moteur suit déjà {max} mois, son plafond : sauvegarde le fichier, puis démarre un nouveau moteur pour la suite.", en: "This engine already tracks {max} months, its limit: save the file, then start a new engine for what comes next." },
    /** On a number's row: how far it moved since the month before (§19.2.5). Signs and words, never a colour. */
    delta: { fr: "{change} depuis {month}", en: "{change} since {month}" },
    deltaToward: { fr: "{change} depuis {month}, vers ta cible", en: "{change} since {month}, toward your target" },
    stable: { fr: "stable depuis {month}", en: "unchanged since {month}" },
    /** The diagnosis, when the leak changed stage (§19.2.5). */
    previousLeak: { fr: "En {month}, la fuite était {stage}.", en: "In {month}, the leak was {stage}." },
    previousLeakShared: { fr: "En {month}, la fuite se partageait entre {list}.", en: "In {month}, the leak was shared between {list}." },
  },
  erase: {
    title: { fr: "Tout effacer", en: "Erase everything" },
    body: {
      fr: "Tes chiffres seront supprimés de cet appareil, et rien d'autre ne les garde. Sauvegarde-les d'abord si tu veux les retrouver.",
      en: "Your numbers will be deleted from this device, and nothing else keeps them. Save them first if you want them back.",
    },
    // TODO: à relire — réécrit le 2026-09-25 (retour d'Antoine) : le mot à retaper était dans un
    // libellé en capitales, on croyait devoir tout taper en majuscules. La consigne passe en texte
    // courant, et la casse n'est plus comparée.
    confirmLabel: { fr: "Confirmation", en: "Confirmation" },
    confirmPrompt: {
      fr: "Pour confirmer, tape « {word} » ci-dessous — majuscules ou minuscules, peu importe.",
      en: "To confirm, type \"{word}\" below — upper or lower case, it doesn't matter.",
    },
    fallbackWord: { fr: "EFFACER", en: "ERASE" },
    // TODO: à relire (convention 6) — neuf le 2026-10-01 (A14 T5, §19.1.5) : « Tout effacer » quand l'appareil tient plusieurs moteurs. `{n}` ≥ 2.
    bodyMany: { fr: "Les {n} moteurs de cet appareil seront supprimés, et rien d'autre ne les garde. Sauvegarde-les d'abord si tu veux les retrouver.", en: "The {n} engines on this device will be deleted, and nothing else keeps them. Save them first if you want them back." },
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
      // TODO: à relire (convention 6) — réécrit le 2026-09-30 (A7.1, C1 : aucun repère ne désigne).
      a: {
        fr: "Seulement d'ordres de grandeur déjà publiés et relus dans le glossaire du site, toujours affichés avec leur réserve. Aucun ne sert à désigner l'étape qui freine : un ordre de grandeur ne vaut pas pour toutes les entreprises. Seule ta propre cible le peut.",
        en: "Only from orders of magnitude already published and reviewed in the site's glossary, always shown with their caveat. None is used to name the stage holding you back: an order of magnitude doesn't hold for every company. Only your own target can do that.",
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
    // TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S2, ENGINE.md §18.7 E0).
    {
      q: { fr: "Et si on vend avec une équipe commerciale ?", en: "What if we sell through a sales team?" },
      a: {
        fr: "Coche « Assisté » au réglage : le moteur suit tes leads, tes opportunités, tes signatures, la mise en production et le renouvellement, sur trois mois glissants, avec tes propres cibles. Si tu vends aussi en libre-service, coche les deux : deux moteurs côte à côte et leur total, jamais l'un contre l'autre.",
        en: "Tick \"Sales-assisted\" in the setup: the engine follows your leads, opportunities, signatures, go-live and renewals, over rolling three-month periods, against your own targets. If you also sell self-serve, tick both: two engines side by side and their total, never one against the other.",
      },
    },
  ],
};
