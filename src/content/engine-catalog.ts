// TODO: à relire — copie neuve (convention 6), rédigée par la session de code
import type { Translatable } from "@/lib/i18n/translatable";
import type { DerivedId, MetricId, SourceRef } from "@/lib/engine/types";

/**
 * engine-catalog.ts — the PROSE of the growth engine's fifteen numbers and
 * three computed ones (engine spec §5, §14.13). Server only: the page
 * resolves it to one language with `resolveTree` and hands the island plain
 * strings, so neither language's catalogue ever ships to the browser. The
 * SHAPE (units, bounds, references, sources) lives in
 * `lib/engine/catalog-shape.ts`; a test pins that both carry the same ids.
 *
 * **TODO: à relire — copie neuve (convention 6), rédigée par la session de
 * code.** Provisional wording taken from the spec, to be rewritten and
 * checked by the content PR (P3) and then by Antoine (bon à tirer nº6). The
 * menu paths of the tools move: they are phrased conditionally ("depending
 * on your plan") and the page shows `ENGINE_CATALOG_VERSION`.
 *
 * Placeholders, filled on the client from the engine's setup: `{month}` (the
 * flows' month), `{cohort}` (the followed cohort), `{n}` (a window in days),
 * `{event}` (the user's activation event), `{variant}` (the CAC variant).
 */

export interface EngineCatalogEntry {
  name: Translatable;
  oneLiner: Translatable;
  formula: Translatable;
  trap: Translatable;
  /** Labels of the two counts, for a rate or a ratio entered as counts. */
  inputs?: { numerator: Translatable; denominator: Translatable };
  /** ≤ 3 places to find it: which tool (or role), then the path. */
  where: { source: SourceRef; label: Translatable; path: Translatable }[];
  /** What to pull, for the copied request (§6.13). Never a value. */
  request: Translatable;
  /** Why no reference is published — mutually exclusive with `benchmarkCaveat`. */
  noReferenceReason?: Translatable;
  /** The caveat printed next to a reference, every time it is shown. */
  benchmarkCaveat?: Translatable;
  variants?: { id: string; label: Translatable }[];
  naReasons?: { id: string; label: Translatable }[];
  choices?: { id: string; label: Translatable }[];
}

export interface EngineDerivedEntry {
  name: Translatable;
  formula: Translatable;
  /** "can't be computed — missing: {input}". Never a 0. */
  uncomputable: Translatable;
  capNote?: Translatable;
  caveat?: Translatable;
}

const tool = (t: Extract<SourceRef, { kind: "tool" }>["tool"]): SourceRef => ({ kind: "tool", tool: t });
const role = (r: Extract<SourceRef, { kind: "person" }>["role"]): SourceRef => ({ kind: "person", role: r });

export const ENGINE_CATALOG: Record<MetricId, EngineCatalogEntry> = {
  "acq.signup-rate": {
    name: { fr: "Taux d'inscription", en: "Sign-up rate" },
    oneLiner: { fr: "La part des visiteurs du mois qui créent un compte.", en: "The share of the month's visitors who create an account." },
    formula: { fr: "inscrits du mois ÷ visiteurs uniques du mois", en: "sign-ups in the month ÷ unique visitors in the month" },
    inputs: {
      numerator: { fr: "Inscriptions du mois", en: "Sign-ups in the month" },
      denominator: { fr: "Visiteurs uniques du mois", en: "Unique visitors in the month" },
    },
    where: [
      {
        source: tool("ga4"),
        label: { fr: "GA4", en: "GA4" },
        path: {
          fr: "Rapports › Acquisition › Acquisition de trafic, colonne Utilisateurs (pas Sessions)",
          en: "Reports › Acquisition › Traffic acquisition, the Users column (not Sessions)",
        },
      },
      {
        source: tool("amplitude"),
        label: { fr: "Mixpanel ou Amplitude", en: "Mixpanel or Amplitude" },
        path: { fr: "un entonnoir Page vue → Inscription sur le mois", en: "a Page view → Sign-up funnel over the month" },
      },
      {
        source: tool("product-db"),
        label: { fr: "Base produit", en: "Product database" },
        path: {
          fr: "les comptes créés sur le mois, plus fiable pour le numérateur",
          en: "accounts created in the month, more reliable for the numerator",
        },
      },
    ],
    trap: {
      fr: "Numérateur et dénominateur viennent souvent de deux outils qui ne comptent pas pareil : dis-le dans ta définition.",
      en: "Numerator and denominator often come from two tools that count differently: say so in your definition.",
    },
    request: {
      fr: "le nombre de visiteurs uniques et le nombre d'inscriptions sur {month}",
      en: "the number of unique visitors and the number of sign-ups in {month}",
    },
    benchmarkCaveat: {
      fr: "pour du trafic payant froid, bien plus pour du trafic chaud — ton trafic est un mélange, donc ce repère ne désigne pas de frein",
      en: "for cold paid traffic, far higher for warm traffic — your traffic is a mix, so this reference never names a bottleneck",
    },
  },
  "acq.top-channel-share": {
    name: { fr: "Part du premier canal", en: "Top channel share" },
    oneLiner: { fr: "Combien de tes inscrits viennent de ton meilleur canal.", en: "How many of your sign-ups come from your best channel." },
    formula: { fr: "inscrits venus du premier canal ÷ inscrits du mois", en: "sign-ups from the top channel ÷ sign-ups in the month" },
    inputs: {
      numerator: { fr: "Inscrits du premier canal", en: "Sign-ups from the top channel" },
      denominator: { fr: "Inscrits du mois", en: "Sign-ups in the month" },
    },
    where: [
      {
        source: tool("ga4"),
        label: { fr: "GA4", en: "GA4" },
        path: {
          fr: "Acquisition d'utilisateurs, dimension Groupe de canaux par défaut du premier utilisateur",
          en: "User acquisition, dimension First user default channel group",
        },
      },
      {
        source: tool("hubspot"),
        label: { fr: "HubSpot", en: "HubSpot" },
        path: { fr: "propriété Source d'origine des contacts créés sur le mois", en: "the Original Source property of contacts created in the month" },
      },
      {
        source: tool("salesforce"),
        label: { fr: "Salesforce", en: "Salesforce" },
        path: { fr: "champ Lead Source", en: "the Lead Source field" },
      },
    ],
    trap: {
      fr: "Dans GA4, « Referral » veut dire « site référent », pas « recommandation d'un client ».",
      en: "In GA4, \"Referral\" means \"referring site\", not \"a customer's recommendation\".",
    },
    request: { fr: "le nombre d'inscrits de {month} par canal d'origine", en: "the number of {month} sign-ups by original channel" },
    noReferenceReason: {
      fr: "aucun seuil de dépendance n'est publiable ; la part et le nom du canal suffisent à ouvrir la discussion",
      en: "no dependency threshold is worth publishing; the share and the channel's name are enough to open the discussion",
    },
  },
  "acq.cac": {
    name: { fr: "CAC", en: "CAC" },
    oneLiner: { fr: "Ce que coûte un nouveau client payant.", en: "What a new paying customer costs." },
    formula: {
      fr: "dépense d'acquisition du mois ÷ nouveaux clients payants du mois",
      en: "acquisition spend in the month ÷ new paying customers in the month",
    },
    inputs: {
      numerator: { fr: "Dépense d'acquisition du mois", en: "Acquisition spend in the month" },
      denominator: { fr: "Nouveaux clients payants du mois", en: "New paying customers in the month" },
    },
    where: [
      {
        source: tool("google-ads"),
        label: { fr: "Google Ads, Meta Ads Manager, LinkedIn Campaign Manager", en: "Google Ads, Meta Ads Manager, LinkedIn Campaign Manager" },
        path: { fr: "le coût du mois, toutes campagnes", en: "the month's cost, all campaigns" },
      },
      {
        source: role("finance"),
        label: { fr: "Finance", en: "Finance" },
        path: {
          fr: "la masse salariale ventes et marketing, pour la variante « tout chargé »",
          en: "sales and marketing payroll, for the \"fully loaded\" variant",
        },
      },
      {
        source: tool("stripe"),
        label: { fr: "Stripe ou Chargebee", en: "Stripe or Chargebee" },
        path: {
          fr: "les abonnements créés et payés dans le mois, hors essais",
          en: "subscriptions created and paid in the month, trials excluded",
        },
      },
    ],
    trap: {
      fr: "Dépense du mois ÷ clients du mois est faux dès que le cycle de vente dépasse un mois : dis-le.",
      en: "This month's spend ÷ this month's customers is wrong as soon as the sales cycle is longer than a month: say so.",
    },
    request: {
      fr: "la dépense d'acquisition de {month} ({variant}) et le nombre de nouveaux clients payants du mois",
      en: "{month}'s acquisition spend ({variant}) and the number of new paying customers that month",
    },
    noReferenceReason: {
      fr: "il n'y a pas de bon CAC dans l'absolu — il se juge contre ce qu'un client rapporte (payback, LTV:CAC)",
      en: "there's no good CAC in absolute terms — it's judged against what a customer brings in (payback, LTV:CAC)",
    },
    variants: [
      { id: "media-only", label: { fr: "Média seul", en: "Media only" } },
      { id: "plus-team", label: { fr: "+ équipe marketing", en: "+ marketing team" } },
      { id: "fully-loaded", label: { fr: "Tout chargé", en: "Fully loaded" } },
    ],
  },
  "act.event": {
    name: { fr: "Événement d'activation", en: "Activation event" },
    oneLiner: {
      fr: "L'action qui prouve qu'un inscrit a touché la valeur du produit.",
      en: "The action that proves a sign-up has reached the product's value.",
    },
    formula: { fr: "le nom de l'action, et sa fenêtre en jours", en: "the action's name, and its window in days" },
    where: [
      {
        source: role("product"),
        label: { fr: "Produit", en: "Product" },
        path: {
          fr: "c'est une décision de l'équipe produit, pas un chiffre d'outil",
          en: "it's a product team decision, not a tool figure",
        },
      },
    ],
    trap: {
      fr: "Un événement choisi parce qu'il est facile à compter n'est pas un moment de valeur.",
      en: "An event picked because it's easy to count isn't a moment of value.",
    },
    request: {
      fr: "le nom de l'événement qui marque la première valeur, et sa fenêtre",
      en: "the name of the event that marks first value, and its window",
    },
  },
  "act.rate": {
    name: { fr: "Taux d'activation", en: "Activation rate" },
    oneLiner: {
      fr: "La part des inscrits qui atteignent la première valeur à temps.",
      en: "The share of sign-ups who reach first value in time.",
    },
    formula: {
      fr: "inscrits de la cohorte ayant fait {event} sous {n} jours ÷ inscrits de la cohorte",
      en: "cohort sign-ups who did {event} within {n} days ÷ cohort sign-ups",
    },
    inputs: {
      numerator: { fr: "Activés sous {n} jours", en: "Activated within {n} days" },
      denominator: { fr: "Inscrits de {cohort}", en: "{cohort} sign-ups" },
    },
    where: [
      {
        source: tool("amplitude"),
        label: { fr: "Amplitude", en: "Amplitude" },
        path: {
          fr: "Funnel Analysis, Inscription → {event}, fenêtre de conversion {n} jours",
          en: "Funnel Analysis, Sign-up → {event}, {n}-day conversion window",
        },
      },
      {
        source: tool("mixpanel"),
        label: { fr: "Mixpanel", en: "Mixpanel" },
        path: { fr: "rapport Funnels, conversion window de {n} jours", en: "Funnels report, {n}-day conversion window" },
      },
      {
        source: tool("ga4"),
        label: { fr: "GA4", en: "GA4" },
        path: {
          fr: "Explorer › Exploration de l'entonnoir, si l'événement est envoyé",
          en: "Explore › Funnel exploration, if the event is sent",
        },
      },
    ],
    trap: {
      fr: "Change l'événement et le taux change d'un facteur trois : écris ta définition.",
      en: "Change the event and the rate moves threefold: write your definition down.",
    },
    request: {
      fr: "pour la cohorte des inscrits de {cohort}, combien ont fait {event} sous {n} jours, et la taille de la cohorte",
      en: "for the {cohort} sign-up cohort, how many did {event} within {n} days, and the cohort size",
    },
    benchmarkCaveat: {
      fr: "pour un onboarding SaaS, souvent plus bas en essai gratuit ; dépend entièrement de l'exigence de ton événement",
      en: "for SaaS onboarding, often lower for free trials; depends entirely on how demanding your event is",
    },
  },
  "act.ttv": {
    name: { fr: "Time-to-value médian", en: "Median time to value" },
    oneLiner: {
      fr: "Combien de temps il faut à un inscrit pour atteindre la première valeur.",
      en: "How long a sign-up takes to reach first value.",
    },
    formula: { fr: "médiane du délai entre l'inscription et {event}", en: "median delay between sign-up and {event}" },
    where: [
      {
        source: tool("amplitude"),
        label: { fr: "Amplitude ou Mixpanel", en: "Amplitude or Mixpanel" },
        path: { fr: "la vue « time to convert » de l'entonnoir", en: "the funnel's \"time to convert\" view" },
      },
      {
        source: tool("ga4"),
        label: { fr: "GA4", en: "GA4" },
        path: { fr: "pas de médiane native : à demander à la data", en: "no native median: ask the data team" },
      },
    ],
    trap: {
      fr: "Une moyenne baisse quand les traînards abandonnent : prends la médiane.",
      en: "An average drops when stragglers give up: use the median.",
    },
    request: {
      fr: "le délai médian entre l'inscription et {event}, cohorte de {cohort}",
      en: "the median delay between sign-up and {event}, {cohort} cohort",
    },
    noReferenceReason: {
      fr: "« dès la première session » est une ambition souvent citée, pas une norme mesurée",
      en: "\"within the first session\" is an often-quoted ambition, not a measured norm",
    },
    variants: [
      { id: "median", label: { fr: "Médiane", en: "Median" } },
      { id: "mean", label: { fr: "Moyenne", en: "Average" } },
    ],
  },
  "ret.d30": {
    name: { fr: "Rétention à J30", en: "Day-30 retention" },
    oneLiner: { fr: "La part des inscrits encore actifs un mois après.", en: "The share of sign-ups still active a month later." },
    formula: {
      fr: "inscrits de la cohorte encore actifs 30 jours après l'inscription ÷ inscrits de la cohorte",
      en: "cohort sign-ups still active 30 days after signing up ÷ cohort sign-ups",
    },
    inputs: {
      numerator: { fr: "Actifs à J30", en: "Active at day 30" },
      denominator: { fr: "Inscrits de {cohort}", en: "{cohort} sign-ups" },
    },
    where: [
      {
        source: tool("amplitude"),
        label: { fr: "Amplitude", en: "Amplitude" },
        path: { fr: "Retention Analysis, événement de départ Inscription", en: "Retention Analysis, starting event Sign-up" },
      },
      {
        source: tool("mixpanel"),
        label: { fr: "Mixpanel", en: "Mixpanel" },
        path: { fr: "rapport Retention", en: "Retention report" },
      },
      {
        source: tool("ga4"),
        label: { fr: "GA4", en: "GA4" },
        path: { fr: "Explorer › Exploration de cohortes", en: "Explore › Cohort exploration" },
      },
    ],
    trap: {
      fr: "« Actif » doit être écrit : une connexion n'est pas un usage.",
      en: "\"Active\" must be written down: a login isn't usage.",
    },
    request: {
      fr: "pour la cohorte des inscrits de {cohort}, combien étaient encore actifs 30 jours après leur inscription, et la taille de la cohorte",
      en: "for the {cohort} sign-up cohort, how many were still active 30 days after signing up, and the cohort size",
    },
    noReferenceReason: {
      fr: "les ordres de grandeur publiés portent sur les applis grand public ; en SaaS, la forme de la courbe compte plus que le niveau",
      en: "the published orders of magnitude are for consumer apps; in SaaS, the curve's shape matters more than its level",
    },
  },
  "ret.logo-churn": {
    name: { fr: "Churn logo mensuel", en: "Monthly logo churn" },
    oneLiner: {
      fr: "La part des clients payants qui partent dans le mois.",
      en: "The share of paying customers who leave in the month.",
    },
    formula: {
      fr: "clients payants perdus dans le mois ÷ clients payants au 1er du mois",
      en: "paying customers lost in the month ÷ paying customers on the 1st",
    },
    inputs: {
      numerator: { fr: "Clients perdus en {month}", en: "Customers lost in {month}" },
      denominator: { fr: "Clients payants au 1er {month}", en: "Paying customers on {month} 1" },
    },
    where: [
      {
        source: tool("stripe"),
        label: { fr: "Stripe", en: "Stripe" },
        path: {
          fr: "Billing, vue d'ensemble, churn des abonnés (selon ton offre)",
          en: "Billing, overview, subscriber churn (depending on your plan)",
        },
      },
      {
        source: tool("chargebee"),
        label: { fr: "Chargebee", en: "Chargebee" },
        path: { fr: "RevenueStory (selon l'édition)", en: "RevenueStory (depending on edition)" },
      },
      {
        source: tool("chartmogul"),
        label: { fr: "ChartMogul ou Baremetrics", en: "ChartMogul or Baremetrics" },
        path: { fr: "churn clients", en: "customer churn" },
      },
    ],
    trap: {
      fr: "Un churn mensuel au-dessus de 30 % est souvent un chiffre annuel : vérifie.",
      en: "A monthly churn above 30% is often an annual figure: check.",
    },
    request: {
      fr: "le nombre de clients payants au 1er {month} et le nombre de clients perdus dans le mois",
      en: "the number of paying customers on {month} 1 and the number lost during the month",
    },
    benchmarkCaveat: {
      fr: "pour des produits vendus aux petites entreprises ; les produits entreprise visent bien plus bas, les abonnements grand public tournent bien plus haut",
      en: "for products sold to small businesses; enterprise products aim much lower, consumer subscriptions run much higher",
    },
    naReasons: [{ id: "not-subscription", label: { fr: "Pas d'abonnement", en: "No subscription" } }],
  },
  "ret.churn-cause": {
    name: { fr: "Cause principale de churn", en: "Main churn cause" },
    oneLiner: { fr: "Pourquoi les clients partent, et comment tu le sais.", en: "Why customers leave, and how you know." },
    formula: {
      fr: "la cause, et sa source : données, entretiens ou intuition",
      en: "the cause, and its source: data, interviews or gut feel",
    },
    where: [
      {
        source: tool("hubspot"),
        label: { fr: "HubSpot ou Salesforce", en: "HubSpot or Salesforce" },
        path: { fr: "le champ raison de perte", en: "the loss-reason field" },
      },
      {
        source: role("support"),
        label: { fr: "Support", en: "Support" },
        path: { fr: "relire les derniers départs", en: "read the latest cancellations" },
      },
    ],
    trap: {
      fr: "Une intuition partagée par toute l'équipe reste une intuition.",
      en: "A hunch shared by the whole team is still a hunch.",
    },
    request: {
      fr: "la raison la plus fréquente des départs de ces trois derniers mois, et d'où elle vient",
      en: "the most frequent reason for cancellations over the last three months, and where it comes from",
    },
    choices: [
      { id: "data", label: { fr: "Par les données", en: "From data" } },
      { id: "interviews", label: { fr: "Par des entretiens", en: "From interviews" } },
      { id: "hunch", label: { fr: "Par intuition", en: "From gut feel" } },
    ],
  },
  "ref.mechanism": {
    name: { fr: "Mécanisme de recommandation", en: "Referral mechanism" },
    oneLiner: { fr: "Ce qui permet à un utilisateur d'en amener un autre.", en: "What lets one user bring in another." },
    formula: {
      fr: "aucun, en communication seulement, ou dans le produit",
      en: "none, in communication only, or in the product",
    },
    where: [
      {
        source: role("product"),
        label: { fr: "Produit", en: "Product" },
        path: { fr: "l'équipe produit", en: "the product team" },
      },
    ],
    trap: {
      fr: "Le bouche-à-oreille existe sans mécanisme : ne pas en avoir ne dispense pas de mesurer la part recommandée.",
      en: "Word of mouth exists without a mechanism: not having one doesn't excuse you from measuring the referred share.",
    },
    request: {
      fr: "si le produit a un mécanisme d'invitation ou de parrainage, et où il vit",
      en: "whether the product has an invite or referral mechanism, and where it lives",
    },
    choices: [
      { id: "none", label: { fr: "Aucun", en: "None" } },
      { id: "communication", label: { fr: "En communication seulement", en: "In communication only" } },
      { id: "product", label: { fr: "Dans le produit", en: "In the product" } },
    ],
  },
  "ref.referred-share": {
    name: { fr: "Part des inscrits recommandés", en: "Referred sign-up share" },
    oneLiner: { fr: "La part des inscrits amenés par un utilisateur.", en: "The share of sign-ups brought in by a user." },
    formula: {
      fr: "inscrits arrivés par un utilisateur (code, lien d'invitation, réponse « comment nous as-tu connus ? ») ÷ inscrits de la cohorte",
      en: "sign-ups who came through a user (code, invite link, \"how did you hear about us?\" answer) ÷ cohort sign-ups",
    },
    inputs: {
      numerator: { fr: "Inscrits recommandés", en: "Referred sign-ups" },
      denominator: { fr: "Inscrits de {cohort}", en: "{cohort} sign-ups" },
    },
    where: [
      {
        source: tool("product-db"),
        label: { fr: "Outil de parrainage ou table d'invitations", en: "Referral tool or invitations table" },
        path: { fr: "les inscrits avec un parrain", en: "sign-ups with a referrer" },
      },
      {
        source: tool("hubspot"),
        label: { fr: "HubSpot", en: "HubSpot" },
        path: { fr: "la propriété « comment nous avez-vous connus »", en: "the \"how did you hear about us\" property" },
      },
    ],
    trap: {
      fr: "La source « referral » de GA4 compte des sites, pas des recommandations.",
      en: "GA4's \"referral\" source counts websites, not recommendations.",
    },
    request: {
      fr: "pour la cohorte de {cohort}, combien d'inscrits sont arrivés par un code, une invitation ou une recommandation déclarée",
      en: "for the {cohort} cohort, how many sign-ups came through a code, an invite or a declared recommendation",
    },
    noReferenceReason: {
      fr: "de presque zéro à la majorité selon que le produit se voit ou non : compare-toi à toi-même",
      en: "from nearly zero to a majority depending on whether the product is visible to others: compare with yourself",
    },
  },
  "ref.k-factor": {
    name: { fr: "Coefficient viral (K)", en: "Viral coefficient (K)" },
    oneLiner: { fr: "Combien de nouveaux inscrits chaque utilisateur amène.", en: "How many new sign-ups each user brings in." },
    formula: { fr: "inscrits invités par la cohorte ÷ taille de la cohorte", en: "sign-ups invited by the cohort ÷ cohort size" },
    inputs: {
      numerator: { fr: "Inscrits invités par la cohorte", en: "Sign-ups invited by the cohort" },
      denominator: { fr: "Inscrits de {cohort}", en: "{cohort} sign-ups" },
    },
    where: [
      {
        source: tool("mixpanel"),
        label: { fr: "Mixpanel ou Amplitude", en: "Mixpanel or Amplitude" },
        path: { fr: "avec la table d'invitations", en: "with the invitations table" },
      },
    ],
    trap: {
      fr: "K se divise par tous les utilisateurs, pas seulement ceux qui ont partagé.",
      en: "K divides by every user, not just those who shared.",
    },
    request: {
      fr: "pour la cohorte de {cohort}, le nombre d'inscrits amenés par ses invitations",
      en: "for the {cohort} cohort, the number of sign-ups its invitations brought in",
    },
    benchmarkCaveat: {
      fr: "fourchette réaliste pour la plupart des produits ; un K durable au-dessus de 1 est rare et temporaire",
      en: "realistic range for most products; a sustained K above 1 is rare and temporary",
    },
    naReasons: [{ id: "no-invite-mechanism", label: { fr: "Pas de mécanisme d'invitation", en: "No invite mechanism" } }],
  },
  "rev.paid-conversion": {
    name: { fr: "Conversion inscrit → payant", en: "Sign-up to paid conversion" },
    oneLiner: { fr: "La part des inscrits qui paient dans la fenêtre.", en: "The share of sign-ups who pay within the window." },
    formula: {
      fr: "inscrits de la cohorte ayant payé sous {n} jours ÷ inscrits de la cohorte",
      en: "cohort sign-ups who paid within {n} days ÷ cohort sign-ups",
    },
    inputs: {
      numerator: { fr: "Payants sous {n} jours", en: "Paying within {n} days" },
      denominator: { fr: "Inscrits de {cohort}", en: "{cohort} sign-ups" },
    },
    where: [
      {
        source: role("data"),
        label: { fr: "Data", en: "Data" },
        path: {
          fr: "une jointure entre la base produit et Stripe ou Chargebee sur l'identifiant client",
          en: "a join between the product database and Stripe or Chargebee on the customer id",
        },
      },
      {
        source: tool("hubspot"),
        label: { fr: "HubSpot ou Salesforce", en: "HubSpot or Salesforce" },
        path: {
          fr: "les affaires gagnées de la cohorte, si une vente intervient",
          en: "the cohort's won deals, if sales is involved",
        },
      },
    ],
    trap: {
      fr: "Les chiffres qui circulent mélangent essai, freemium et carte à l'inscription : ne compare qu'à toi-même.",
      en: "The numbers that circulate mix trials, freemium and card-at-sign-up: compare only with yourself.",
    },
    request: {
      fr: "pour la cohorte des inscrits de {cohort}, combien ont payé sous {n} jours, et la taille de la cohorte",
      en: "for the {cohort} sign-up cohort, how many paid within {n} days, and the cohort size",
    },
    noReferenceReason: {
      fr: "aucun taux publié ne porte sur la même base que le tien",
      en: "no published rate uses the same base as yours",
    },
    naReasons: [{ id: "no-free-tier", label: { fr: "Pas de version gratuite ni d'essai", en: "No free tier or trial" } }],
  },
  "rev.arpa": {
    name: { fr: "ARPA mensuel", en: "Monthly ARPA" },
    oneLiner: { fr: "Le revenu mensuel moyen d'un client payant.", en: "The average monthly revenue of a paying customer." },
    formula: { fr: "MRR ÷ clients payants", en: "MRR ÷ paying customers" },
    inputs: {
      numerator: { fr: "MRR de {month}", en: "{month} MRR" },
      denominator: { fr: "Clients payants", en: "Paying customers" },
    },
    where: [
      {
        source: tool("stripe"),
        label: { fr: "Stripe", en: "Stripe" },
        path: { fr: "Billing, MRR et clients actifs", en: "Billing, MRR and active customers" },
      },
      {
        source: tool("chargebee"),
        label: { fr: "Chargebee", en: "Chargebee" },
        path: { fr: "le rapport MRR", en: "the MRR report" },
      },
      {
        source: tool("chartmogul"),
        label: { fr: "ChartMogul", en: "ChartMogul" },
        path: { fr: "ARPA", en: "ARPA" },
      },
    ],
    trap: {
      fr: "Un ARPA qui monte pendant que la base baisse, ce sont souvent les petits clients qui partent.",
      en: "An ARPA rising while the base shrinks is usually small customers leaving.",
    },
    request: {
      fr: "le MRR de fin {month} et le nombre de clients payants",
      en: "{month}'s closing MRR and the number of paying customers",
    },
    noReferenceReason: {
      fr: "il varie de trois ordres de grandeur entre catégories",
      en: "it varies by three orders of magnitude between categories",
    },
  },
  "rev.gross-margin": {
    name: { fr: "Marge brute", en: "Gross margin" },
    oneLiner: { fr: "Ce qu'il reste d'un paiement après le coût de le servir.", en: "What's left of a payment after the cost of serving it." },
    formula: {
      fr: "(revenu − coût direct de service : hébergement, frais de paiement, support) ÷ revenu",
      en: "(revenue − direct cost of service: hosting, payment fees, support) ÷ revenue",
    },
    inputs: {
      numerator: { fr: "Marge brute du mois", en: "Gross profit in the month" },
      denominator: { fr: "Revenu du mois", en: "Revenue in the month" },
    },
    where: [
      {
        source: role("finance"),
        label: { fr: "Finance", en: "Finance" },
        path: { fr: "le compte de résultat du mois", en: "the month's income statement" },
      },
    ],
    trap: {
      fr: "Prendre le revenu au lieu de la marge flatte le payback : c'est la marge qui rembourse le CAC.",
      en: "Using revenue instead of margin flatters the payback: margin is what pays the CAC back.",
    },
    request: {
      fr: "la marge brute du dernier trimestre clos, et ce qu'elle inclut",
      en: "gross margin for the last closed quarter, and what it includes",
    },
    benchmarkCaveat: {
      fr: "en SaaS ; bien moins dès qu'il y a de la prestation humaine",
      en: "in SaaS; much lower as soon as there's human delivery",
    },
  },
};

export const ENGINE_DERIVED_CATALOG: Record<DerivedId, EngineDerivedEntry> = {
  "rev.ltv": {
    name: { fr: "LTV", en: "LTV" },
    formula: {
      fr: "ARPA × marge brute × min(1 ÷ churn mensuel, 36)",
      en: "ARPA × gross margin × min(1 ÷ monthly churn, 36)",
    },
    uncomputable: { fr: "incalculable — manque : {input}", en: "can't be computed — missing: {input}" },
    capNote: {
      fr: "durée de vie plafonnée à 36 mois : la plupart des praticiens plafonnent à trois à cinq ans ; on prend le bas",
      en: "lifetime capped at 36 months: most practitioners cap it at three to five years; we take the low end",
    },
  },
  "rev.cac-payback": {
    name: { fr: "CAC payback", en: "CAC payback" },
    formula: { fr: "CAC ÷ (ARPA × marge brute), en mois", en: "CAC ÷ (ARPA × gross margin), in months" },
    uncomputable: { fr: "incalculable — manque : {input}", en: "can't be computed — missing: {input}" },
    caveat: { fr: "la vraie comparaison est ta trésorerie", en: "the real comparison is your runway" },
  },
  "rev.ltv-cac": {
    name: { fr: "LTV:CAC", en: "LTV:CAC" },
    formula: { fr: "LTV ÷ CAC", en: "LTV ÷ CAC" },
    uncomputable: { fr: "incalculable — manque : {input}", en: "can't be computed — missing: {input}" },
    caveat: { fr: "un repère, pas une loi", en: "a rule of thumb, not a law" },
  },
};
