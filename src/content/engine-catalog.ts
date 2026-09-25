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
 * code.** First draft of the content PR (P3), for bon à tirer nº6.
 *
 * Writing rules this file keeps, each one held by a test in
 * `content/__tests__/engine-catalog.test.ts`:
 * - **Where to find it** names a report, never a menu we have not seen. Tool
 *   menus move and editions differ; when the exact path was not checked
 *   against the tool's own documentation (September 2026), the recipe
 *   describes the report generically ("the funnel report, with a conversion
 *   window") instead of inventing a path. Stripe's churn rate is called out
 *   because its definition differs from ours (30 rolling days, new
 *   subscribers in the base), not just its menu.
 * - **A caveat never carries its own numbers.** The range comes from the
 *   shape (`catalog-shape.ts`), itself copied from the approved glossary;
 *   any figure a caveat or a "no reference" reason does mention must appear
 *   in the linked glossary entry too, so two copies cannot drift apart.
 * - **What reaches a slide stays inside the three fonts** (spec §10.4):
 *   names, formulas, count labels, closed-list labels, caveats, reasons and
 *   the computed figures use Latin-1 plus – — ’ « » … € · × ÷ ± only. No
 *   arrows, no "≈", no minus sign U+2212 (an en dash stands in for it).
 * - **French never writes "de {month}"**: a month can start with a vowel
 *   (avril, août, octobre) and the template cannot elide. Months follow "en",
 *   "à fin", "au 1er" or a colon.
 *
 * Placeholders, filled on the client from the engine's setup and the entry:
 * `{month}` (the flows' month, formatted: « août 2026 » / "August 2026"),
 * `{cohort}` (the followed cohort, same format), `{n}` (a window in days),
 * `{event}` (the user's activation event, or `page.catalogueFill.event`
 * when none is set yet), `{variant}` (the CAC variant's label). Every string
 * of this file may carry any of the five, and a consumer fills all of them.
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
  // --- Acquisition -----------------------------------------------------------
  "acq.signup-rate": {
    name: { fr: "Taux d'inscription", en: "Sign-up rate" },
    oneLiner: {
      fr: "La part des visiteurs du mois qui créent un compte.",
      en: "The share of the month's visitors who create an account.",
    },
    formula: {
      fr: "inscrits du mois ÷ visiteurs uniques du mois",
      en: "sign-ups in the month ÷ unique visitors in the month",
    },
    inputs: {
      numerator: { fr: "Inscriptions en {month}", en: "Sign-ups in {month}" },
      denominator: { fr: "Visiteurs uniques en {month}", en: "Unique visitors in {month}" },
    },
    where: [
      {
        source: tool("ga4"),
        label: { fr: "GA4", en: "GA4" },
        path: {
          fr: "le rapport Acquisition de trafic sur le mois : la colonne Utilisateurs pour les visiteurs (pas Sessions)",
          en: "the Traffic acquisition report over the month: the Users column for visitors (not Sessions)",
        },
      },
      {
        source: tool("mixpanel"),
        label: { fr: "Mixpanel ou Amplitude", en: "Mixpanel or Amplitude" },
        path: {
          fr: "un entonnoir en deux étapes, page vue puis inscription, sur le mois",
          en: "a two-step funnel, page view then sign-up, over the month",
        },
      },
      {
        source: tool("product-db"),
        label: { fr: "Base produit", en: "Product database" },
        path: {
          fr: "les comptes créés sur le mois : le compte le plus fiable pour les inscrits",
          en: "the accounts created in the month: the most reliable count of sign-ups",
        },
      },
    ],
    trap: {
      fr: "Les visiteurs viennent de l'analytics, les inscrits souvent de ta base : les deux ne comptent pas les mêmes personnes (bloqueurs, appareils multiples). Écris-le dans ta définition.",
      en: "Visitors come from analytics, sign-ups often from your database: the two don't count the same people (blockers, several devices). Write it in your definition.",
    },
    request: {
      fr: "le nombre de visiteurs uniques et le nombre d'inscriptions en {month}",
      en: "the number of unique visitors and the number of sign-ups in {month}",
    },
    benchmarkCaveat: {
      fr: "pour du trafic payant froid, bien plus pour du trafic chaud ; ton trafic est un mélange, donc ce repère ne désigne jamais une étape qui freine",
      en: "for cold paid traffic, far higher for warm traffic; your traffic is a mix, so this reference never names the stage holding you back",
    },
  },
  "acq.top-channel-share": {
    name: { fr: "Part du premier canal", en: "Top channel share" },
    oneLiner: {
      fr: "La part de tes inscrits qui vient de ton canal principal.",
      en: "The share of your sign-ups that comes from your main channel.",
    },
    formula: {
      fr: "inscrits venus du premier canal ÷ inscrits du mois",
      en: "sign-ups from the top channel ÷ sign-ups in the month",
    },
    inputs: {
      numerator: { fr: "Inscrits du premier canal", en: "Sign-ups from the top channel" },
      denominator: { fr: "Inscrits en {month}", en: "Sign-ups in {month}" },
    },
    where: [
      {
        source: tool("ga4"),
        label: { fr: "GA4", en: "GA4" },
        path: {
          fr: "le rapport Acquisition d'utilisateurs, dimension « Groupe de canaux par défaut du premier utilisateur »",
          en: "the User acquisition report, dimension \"First user default channel group\"",
        },
      },
      {
        source: tool("hubspot"),
        label: { fr: "HubSpot", en: "HubSpot" },
        path: {
          fr: "les contacts créés en {month}, regroupés par leur source d'origine (propriété Original Traffic Source, ou Original Source selon ton compte)",
          en: "the contacts created in {month}, grouped by their original source (the Original Traffic Source property, or Original Source depending on your account)",
        },
      },
      {
        source: tool("salesforce"),
        label: { fr: "Salesforce", en: "Salesforce" },
        path: {
          fr: "les leads créés en {month}, regroupés par le champ Lead Source",
          en: "the leads created in {month}, grouped by the Lead Source field",
        },
      },
    ],
    trap: {
      fr: "Dans GA4, « Referral » veut dire site référent, pas recommandation d'un client ; et « Direct » ramasse tout ce qui n'a pas pu être attribué.",
      en: "In GA4, \"Referral\" means a referring website, not a customer's recommendation; and \"Direct\" collects everything that couldn't be attributed.",
    },
    request: {
      fr: "le nombre d'inscrits en {month}, ventilé par canal d'origine",
      en: "the number of sign-ups in {month}, broken down by original channel",
    },
    noReferenceReason: {
      fr: "aucun seuil de dépendance à un canal n'est publiable ; la part et le nom du canal suffisent à ouvrir la discussion",
      en: "no threshold of dependence on one channel is worth publishing; the share and the channel's name are enough to open the discussion",
    },
  },
  "acq.cac": {
    name: { fr: "CAC", en: "CAC" },
    oneLiner: {
      fr: "Ce que coûte, en moyenne, un nouveau client payant.",
      en: "What a new paying customer costs, on average.",
    },
    formula: {
      fr: "dépense d'acquisition du mois ÷ nouveaux clients payants du mois",
      en: "acquisition spend in the month ÷ new paying customers in the month",
    },
    inputs: {
      numerator: { fr: "Dépense d'acquisition en {month}", en: "Acquisition spend in {month}" },
      denominator: { fr: "Nouveaux clients payants en {month}", en: "New paying customers in {month}" },
    },
    where: [
      {
        source: tool("google-ads"),
        label: {
          fr: "Google Ads, Meta Ads Manager, LinkedIn Campaign Manager",
          en: "Google Ads, Meta Ads Manager, LinkedIn Campaign Manager",
        },
        path: {
          fr: "le montant dépensé en {month}, toutes campagnes confondues",
          en: "the amount spent in {month}, all campaigns together",
        },
      },
      {
        source: role("finance"),
        label: { fr: "Finance", en: "Finance" },
        path: {
          fr: "les salaires et les outils des équipes marketing et ventes, pour les variantes « + équipe » et « tout chargé »",
          en: "marketing and sales salaries and tools, for the \"+ team\" and \"fully loaded\" variants",
        },
      },
      {
        source: tool("stripe"),
        label: { fr: "Stripe ou Chargebee", en: "Stripe or Chargebee" },
        path: {
          fr: "les abonnements devenus payants en {month}, essais gratuits exclus",
          en: "the subscriptions that became paid in {month}, free trials excluded",
        },
      },
    ],
    trap: {
      fr: "La dépense d'un mois face aux clients du même mois suppose qu'on achète en moins d'un mois. Si ton cycle est plus long, décale la dépense et écris-le.",
      en: "A month's spend against the same month's customers assumes people buy within a month. If your cycle is longer, shift the spend and write it down.",
    },
    request: {
      fr: "la dépense d'acquisition en {month} ({variant}) et le nombre de nouveaux clients payants du même mois",
      en: "the acquisition spend in {month} ({variant}) and the number of new paying customers that same month",
    },
    noReferenceReason: {
      fr: "il n'y a pas de bon CAC dans l'absolu : il se juge contre ce qu'un client rapporte (payback, LTV:CAC)",
      en: "there is no good CAC in absolute terms: it is judged against what a customer brings in (payback, LTV:CAC)",
    },
    variants: [
      { id: "media-only", label: { fr: "Média seul", en: "Media only" } },
      { id: "plus-team", label: { fr: "+ équipe marketing", en: "+ marketing team" } },
      { id: "fully-loaded", label: { fr: "Tout chargé", en: "Fully loaded" } },
    ],
  },

  // --- Activation ------------------------------------------------------------
  "act.event": {
    name: { fr: "Événement d'activation", en: "Activation event" },
    oneLiner: {
      fr: "L'action qui montre qu'un inscrit a touché la valeur du produit.",
      en: "The action that shows a sign-up has reached the product's value.",
    },
    formula: {
      fr: "le nom de l'action, et le nombre de jours laissés pour la faire",
      en: "the action's name, and the number of days allowed to do it",
    },
    where: [
      {
        source: role("product"),
        label: { fr: "Produit", en: "Product" },
        path: {
          fr: "une décision de l'équipe produit, pas un chiffre qu'un outil sort tout seul",
          en: "a product team decision, not a number a tool gives you on its own",
        },
      },
    ],
    trap: {
      fr: "Une action choisie parce qu'elle est facile à compter n'est pas un moment de valeur. Celle qui compte distingue les inscrits qui restent de ceux qui partent.",
      en: "An action picked because it is easy to count is not a moment of value. The one that counts separates the sign-ups who stay from those who leave.",
    },
    request: {
      fr: "le nom de l'action qui marque la première valeur, et le nombre de jours qu'on laisse pour la faire",
      en: "the name of the action that marks first value, and the number of days allowed to do it",
    },
  },
  "act.rate": {
    name: { fr: "Taux d'activation", en: "Activation rate" },
    oneLiner: {
      fr: "La part des inscrits qui atteignent la première valeur à temps.",
      en: "The share of sign-ups who reach first value in time.",
    },
    formula: {
      fr: "inscrits de la cohorte ayant fait {event} sous {n} jours ÷ inscrits de la cohorte",
      en: "cohort sign-ups who did {event} within {n} days ÷ cohort sign-ups",
    },
    inputs: {
      numerator: { fr: "Activés sous {n} jours", en: "Activated within {n} days" },
      denominator: { fr: "Inscrits en {cohort}", en: "Sign-ups from {cohort}" },
    },
    where: [
      {
        source: tool("amplitude"),
        label: { fr: "Amplitude", en: "Amplitude" },
        path: {
          fr: "un graphique Funnel Analysis : inscription puis {event}, fenêtre de conversion de {n} jours",
          en: "a Funnel Analysis chart: sign-up then {event}, {n}-day conversion window",
        },
      },
      {
        source: tool("mixpanel"),
        label: { fr: "Mixpanel ou PostHog", en: "Mixpanel or PostHog" },
        path: {
          fr: "un entonnoir inscription puis {event}, avec une fenêtre de conversion de {n} jours",
          en: "a sign-up then {event} funnel, with a {n}-day conversion window",
        },
      },
      {
        source: tool("ga4"),
        label: { fr: "GA4", en: "GA4" },
        path: {
          fr: "une exploration de l'entonnoir (onglet Explorer), si {event} est envoyé à GA4",
          en: "a funnel exploration (Explore tab), if {event} is sent to GA4",
        },
      },
    ],
    trap: {
      fr: "Change l'action retenue et le taux peut varier du simple au double. Écris ta définition, et garde la même d'un mois à l'autre.",
      en: "Change the chosen action and the rate can double or halve. Write your definition down, and keep it from one month to the next.",
    },
    request: {
      fr: "pour les inscrits en {cohort}, combien ont fait {event} sous {n} jours, et combien d'inscrits au total",
      en: "for the sign-ups from {cohort}, how many did {event} within {n} days, and how many sign-ups in total",
    },
    benchmarkCaveat: {
      fr: "pour un onboarding SaaS, souvent plus bas en essai gratuit ; tout dépend de l'exigence de ton événement",
      en: "for SaaS onboarding, often lower for free trials; it all depends on how demanding your event is",
    },
  },
  "act.ttv": {
    name: { fr: "Time-to-value médian", en: "Median time to value" },
    oneLiner: {
      fr: "Le temps qu'il faut à un inscrit pour atteindre la première valeur.",
      en: "How long a sign-up takes to reach first value.",
    },
    formula: {
      fr: "médiane du délai entre l'inscription et {event}",
      en: "median time between sign-up and {event}",
    },
    where: [
      {
        source: tool("amplitude"),
        label: { fr: "Amplitude, Mixpanel ou PostHog", en: "Amplitude, Mixpanel or PostHog" },
        path: {
          fr: "l'entonnoir inscription puis {event}, affiché en temps de conversion plutôt qu'en taux",
          en: "the sign-up then {event} funnel, shown as time to convert rather than as a rate",
        },
      },
      {
        source: tool("ga4"),
        label: { fr: "GA4", en: "GA4" },
        path: {
          fr: "pas de médiane dans les rapports standards : à demander à la data, depuis l'export des événements",
          en: "no median in the standard reports: ask the data team, from the event export",
        },
      },
    ],
    trap: {
      fr: "Une moyenne baisse quand les traînards abandonnent, et ressemble alors à un progrès. Prends la médiane.",
      en: "An average drops when stragglers give up, and then looks like progress. Use the median.",
    },
    request: {
      fr: "le délai médian entre l'inscription et {event}, pour les inscrits en {cohort}",
      en: "the median time between sign-up and {event}, for the sign-ups from {cohort}",
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

  // --- Retention -------------------------------------------------------------
  "ret.d30": {
    name: { fr: "Rétention à J30", en: "Day-30 retention" },
    oneLiner: {
      fr: "La part des inscrits encore actifs un mois après leur inscription.",
      en: "The share of sign-ups still active a month after signing up.",
    },
    formula: {
      fr: "inscrits de la cohorte encore actifs 30 jours après l'inscription ÷ inscrits de la cohorte",
      en: "cohort sign-ups still active 30 days after signing up ÷ cohort sign-ups",
    },
    inputs: {
      numerator: { fr: "Actifs à J30", en: "Active at day 30" },
      denominator: { fr: "Inscrits en {cohort}", en: "Sign-ups from {cohort}" },
    },
    where: [
      {
        source: tool("amplitude"),
        label: { fr: "Amplitude", en: "Amplitude" },
        path: {
          fr: "un graphique Retention Analysis : événement de départ l'inscription, retour ton action d'usage",
          en: "a Retention Analysis chart: starting event sign-up, return event your usage action",
        },
      },
      {
        source: tool("mixpanel"),
        label: { fr: "Mixpanel ou PostHog", en: "Mixpanel or PostHog" },
        path: {
          fr: "un rapport de rétention sur la cohorte, lu au trentième jour",
          en: "a retention report on the cohort, read at day 30",
        },
      },
      {
        source: tool("ga4"),
        label: { fr: "GA4", en: "GA4" },
        path: {
          fr: "une exploration de cohortes (onglet Explorer), si l'usage y est envoyé",
          en: "a cohort exploration (Explore tab), if usage is sent there",
        },
      },
    ],
    trap: {
      fr: "« Actif » doit être écrit : une connexion n'est pas un usage. Et dis si J30 veut dire le trentième jour pile ou la semaine qui l'entoure : les outils font les deux.",
      en: "\"Active\" must be written down: a login isn't usage. And say whether day 30 means that exact day or the week around it: tools do both.",
    },
    request: {
      fr: "pour les inscrits en {cohort}, combien étaient encore actifs trente jours après leur inscription, et combien d'inscrits au total",
      en: "for the sign-ups from {cohort}, how many were still active thirty days after signing up, and how many sign-ups in total",
    },
    noReferenceReason: {
      fr: "les ordres de grandeur publiés portent sur les applis grand public ; en SaaS, compare la forme de ta courbe d'un mois à l'autre",
      en: "the published orders of magnitude are for consumer apps; in SaaS, compare the shape of your curve from one month to the next",
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
      en: "paying customers lost in the month ÷ paying customers at the start of the month",
    },
    inputs: {
      numerator: { fr: "Clients perdus en {month}", en: "Customers lost in {month}" },
      denominator: { fr: "Clients payants au 1er {month}", en: "Paying customers at the start of {month}" },
    },
    where: [
      {
        source: tool("stripe"),
        label: { fr: "Stripe", en: "Stripe" },
        path: {
          fr: "la page Billing overview, graphique « Subscriber churn rate » ; Stripe le calcule sur trente jours glissants, nouveaux abonnés compris : recompte-le au mois si tu peux",
          en: "the Billing overview page, \"Subscriber churn rate\" chart; Stripe computes it over thirty rolling days, new subscribers included: recount it by month if you can",
        },
      },
      {
        source: tool("chargebee"),
        label: { fr: "Chargebee", en: "Chargebee" },
        path: {
          fr: "les rapports de churn clients (RevenueStory, selon ton édition)",
          en: "the customer churn reports (RevenueStory, depending on your edition)",
        },
      },
      {
        source: tool("chartmogul"),
        label: { fr: "ChartMogul ou Baremetrics", en: "ChartMogul or Baremetrics" },
        path: {
          fr: "le graphique de churn clients, au mois",
          en: "the customer churn chart, by month",
        },
      },
    ],
    trap: {
      fr: "On compte des clients, pas du revenu : le churn en revenu est un autre chiffre. Et un churn mensuel au-dessus de trente pour cent est souvent un chiffre annuel.",
      en: "This counts customers, not revenue: revenue churn is another number. And a monthly churn above thirty percent is often an annual figure.",
    },
    request: {
      fr: "le nombre de clients payants au 1er {month} et le nombre de ceux perdus pendant le mois",
      en: "the number of paying customers at the start of {month} and the number lost during the month",
    },
    benchmarkCaveat: {
      fr: "pour des produits vendus aux petites entreprises ; les produits entreprise visent bien plus bas, les abonnements grand public tournent bien plus haut",
      en: "for products sold to small businesses; enterprise products aim much lower, consumer subscriptions run much higher",
    },
    naReasons: [{ id: "not-subscription", label: { fr: "Pas d'abonnement", en: "No subscription" } }],
  },
  "ret.churn-cause": {
    name: { fr: "Cause principale de churn", en: "Main churn cause" },
    oneLiner: {
      fr: "Pourquoi les clients partent, et comment tu le sais.",
      en: "Why customers leave, and how you know.",
    },
    formula: {
      fr: "la cause, et d'où elle vient : données, entretiens ou intuition",
      en: "the cause, and where it comes from: data, interviews or gut feel",
    },
    where: [
      {
        source: tool("hubspot"),
        label: { fr: "HubSpot ou Salesforce", en: "HubSpot or Salesforce" },
        path: {
          fr: "le champ de raison de perte des clients partis, s'il est rempli",
          en: "the loss-reason field of customers who left, if it is filled in",
        },
      },
      {
        source: role("support"),
        label: { fr: "Support", en: "Support" },
        path: {
          fr: "relire les derniers départs et les tickets qui les ont précédés",
          en: "read the latest cancellations and the tickets that came before them",
        },
      },
    ],
    trap: {
      fr: "Une intuition partagée par toute l'équipe reste une intuition. Dix départs relus valent mieux qu'une conviction.",
      en: "A hunch shared by the whole team is still a hunch. Ten cancellations read beat one conviction.",
    },
    request: {
      fr: "la raison de départ la plus fréquente sur les trois derniers mois, et d'où elle vient",
      en: "the most frequent reason for leaving over the last three months, and where it comes from",
    },
    choices: [
      { id: "data", label: { fr: "Par les données", en: "From data" } },
      { id: "interviews", label: { fr: "Par des entretiens", en: "From interviews" } },
      { id: "hunch", label: { fr: "Par intuition", en: "From gut feel" } },
    ],
  },

  // --- Referral --------------------------------------------------------------
  "ref.mechanism": {
    name: { fr: "Mécanisme de recommandation", en: "Referral mechanism" },
    oneLiner: {
      fr: "Ce qui permet à un utilisateur d'en amener un autre.",
      en: "What lets one user bring in another.",
    },
    formula: {
      fr: "aucun, en communication seulement, ou dans le produit",
      en: "none, in communication only, or in the product",
    },
    where: [
      {
        source: role("product"),
        label: { fr: "Produit", en: "Product" },
        path: {
          fr: "l'équipe produit sait s'il existe une invitation, un parrainage ou un partage dans le produit",
          en: "the product team knows whether there is an invite, a referral scheme or sharing in the product",
        },
      },
    ],
    trap: {
      fr: "Le bouche-à-oreille existe sans mécanisme : ne pas en avoir ne dispense pas de mesurer la part des inscrits recommandés.",
      en: "Word of mouth exists without a mechanism: not having one doesn't excuse you from measuring the referred share of sign-ups.",
    },
    request: {
      fr: "si le produit a un mécanisme d'invitation ou de parrainage, et où il se trouve",
      en: "whether the product has an invite or referral mechanism, and where it is",
    },
    choices: [
      { id: "none", label: { fr: "Aucun", en: "None" } },
      { id: "communication", label: { fr: "En communication seulement", en: "In communication only" } },
      { id: "product", label: { fr: "Dans le produit", en: "In the product" } },
    ],
  },
  "ref.referred-share": {
    name: { fr: "Part des inscrits recommandés", en: "Referred sign-up share" },
    oneLiner: {
      fr: "La part des inscrits amenés par un utilisateur.",
      en: "The share of sign-ups brought in by a user.",
    },
    formula: {
      fr: "inscrits arrivés par un utilisateur (code, lien d'invitation, réponse « comment nous as-tu connus ? ») ÷ inscrits de la cohorte",
      en: "sign-ups who came through a user (code, invite link, \"how did you hear about us?\" answer) ÷ cohort sign-ups",
    },
    inputs: {
      numerator: { fr: "Inscrits recommandés", en: "Referred sign-ups" },
      denominator: { fr: "Inscrits en {cohort}", en: "Sign-ups from {cohort}" },
    },
    where: [
      {
        source: tool("product-db"),
        label: { fr: "Outil de parrainage ou table d'invitations", en: "Referral tool or invitations table" },
        path: {
          fr: "les inscrits en {cohort} qui ont un parrain ou un code",
          en: "the sign-ups from {cohort} who have a referrer or a code",
        },
      },
      {
        source: tool("hubspot"),
        label: { fr: "HubSpot", en: "HubSpot" },
        path: {
          fr: "une propriété « comment nous avez-vous connus ? » remplie à l'inscription",
          en: "a \"how did you hear about us?\" property filled in at sign-up",
        },
      },
    ],
    trap: {
      fr: "La source « referral » de GA4 compte des sites qui envoient du trafic, pas des clients qui recommandent.",
      en: "GA4's \"referral\" source counts websites that send traffic, not customers who recommend you.",
    },
    request: {
      fr: "pour les inscrits en {cohort}, combien sont arrivés par un code, une invitation ou une recommandation déclarée",
      en: "for the sign-ups from {cohort}, how many came through a code, an invite or a stated recommendation",
    },
    noReferenceReason: {
      fr: "de presque rien à la majorité selon que le produit se voit ou non ; compare-toi à toi-même",
      en: "from almost none to a majority depending on whether other people see the product; compare with yourself",
    },
  },
  "ref.k-factor": {
    name: { fr: "Coefficient viral (K)", en: "Viral coefficient (K)" },
    oneLiner: {
      fr: "Le nombre de nouveaux inscrits que chaque inscrit amène, en moyenne.",
      en: "How many new sign-ups each sign-up brings in, on average.",
    },
    formula: {
      fr: "inscrits invités par la cohorte ÷ inscrits de la cohorte",
      en: "sign-ups invited by the cohort ÷ cohort sign-ups",
    },
    inputs: {
      numerator: { fr: "Inscrits invités par la cohorte", en: "Sign-ups invited by the cohort" },
      denominator: { fr: "Inscrits en {cohort}", en: "Sign-ups from {cohort}" },
    },
    where: [
      {
        source: tool("product-db"),
        label: { fr: "Table d'invitations", en: "Invitations table" },
        path: {
          fr: "les invités qui se sont inscrits, rattachés à la cohorte de celui qui les a invités",
          en: "the invitees who signed up, attached to the cohort of whoever invited them",
        },
      },
      {
        source: tool("mixpanel"),
        label: { fr: "Mixpanel ou Amplitude", en: "Mixpanel or Amplitude" },
        path: {
          fr: "si l'invitation y est suivie comme un événement, croisée avec la table d'invitations",
          en: "if the invite is tracked there as an event, joined with the invitations table",
        },
      },
    ],
    trap: {
      fr: "K se divise par tous les inscrits de la cohorte, pas seulement par ceux qui ont invité quelqu'un.",
      en: "K divides by every sign-up in the cohort, not just by those who invited someone.",
    },
    request: {
      fr: "pour les inscrits en {cohort}, le nombre de personnes inscrites grâce à leurs invitations",
      en: "for the sign-ups from {cohort}, the number of people who signed up through their invites",
    },
    benchmarkCaveat: {
      fr: "fourchette réaliste pour la plupart des produits ; un K durable au-dessus de 1 est rare et presque toujours temporaire",
      en: "the realistic range for most products; a sustained K above 1 is rare and almost always temporary",
    },
    naReasons: [{ id: "no-invite-mechanism", label: { fr: "Pas de mécanisme d'invitation", en: "No invite mechanism" } }],
  },

  // --- Revenue ---------------------------------------------------------------
  "rev.paid-conversion": {
    name: { fr: "Conversion en payant", en: "Paid conversion" },
    oneLiner: {
      fr: "La part des inscrits qui paient dans la fenêtre.",
      en: "The share of sign-ups who pay within the window.",
    },
    formula: {
      fr: "inscrits de la cohorte ayant payé sous {n} jours ÷ inscrits de la cohorte",
      en: "cohort sign-ups who paid within {n} days ÷ cohort sign-ups",
    },
    inputs: {
      numerator: { fr: "Payants sous {n} jours", en: "Paying within {n} days" },
      denominator: { fr: "Inscrits en {cohort}", en: "Sign-ups from {cohort}" },
    },
    where: [
      {
        source: role("data"),
        label: { fr: "Data", en: "Data" },
        path: {
          fr: "une jointure entre la base produit et Stripe ou Chargebee, sur l'identifiant client",
          en: "a join between the product database and Stripe or Chargebee, on the customer id",
        },
      },
      {
        source: tool("stripe"),
        label: { fr: "Stripe ou Chargebee", en: "Stripe or Chargebee" },
        path: {
          fr: "la date du premier paiement de chaque client, à rapprocher de sa date d'inscription",
          en: "each customer's first payment date, to match against their sign-up date",
        },
      },
      {
        source: tool("hubspot"),
        label: { fr: "HubSpot ou Salesforce", en: "HubSpot or Salesforce" },
        path: {
          fr: "les affaires gagnées de la cohorte, si un commercial intervient",
          en: "the cohort's won deals, if a salesperson is involved",
        },
      },
    ],
    trap: {
      fr: "Les taux qui circulent mélangent essai, freemium et carte bancaire demandée à l'inscription. Ne compare qu'à toi-même, d'un mois à l'autre.",
      en: "The rates that circulate mix trials, freemium and card-at-sign-up. Only compare with yourself, from one month to the next.",
    },
    request: {
      fr: "pour les inscrits en {cohort}, combien ont payé sous {n} jours, et combien d'inscrits au total",
      en: "for the sign-ups from {cohort}, how many paid within {n} days, and how many sign-ups in total",
    },
    noReferenceReason: {
      fr: "aucun taux publié ne porte sur la même base que le tien",
      en: "no published rate uses the same base as yours",
    },
    naReasons: [{ id: "no-free-tier", label: { fr: "Pas de version gratuite ni d'essai", en: "No free tier or trial" } }],
  },
  "rev.arpa": {
    name: { fr: "ARPA mensuel", en: "Monthly ARPA" },
    oneLiner: {
      fr: "Le revenu mensuel moyen d'un client payant.",
      en: "The average monthly revenue of a paying customer.",
    },
    formula: { fr: "MRR ÷ clients payants", en: "MRR ÷ paying customers" },
    inputs: {
      numerator: { fr: "MRR à fin {month}", en: "MRR at the end of {month}" },
      denominator: { fr: "Clients payants à fin {month}", en: "Paying customers at the end of {month}" },
    },
    where: [
      {
        source: tool("stripe"),
        label: { fr: "Stripe", en: "Stripe" },
        path: {
          fr: "la page Billing overview : le MRR et les abonnés actifs, ou directement l'ARPU qu'elle affiche",
          en: "the Billing overview page: MRR and active subscribers, or the ARPU it shows directly",
        },
      },
      {
        source: tool("chargebee"),
        label: { fr: "Chargebee", en: "Chargebee" },
        path: {
          fr: "le MRR et les clients actifs dans ses rapports d'abonnement",
          en: "MRR and active customers in its subscription reports",
        },
      },
      {
        source: tool("chartmogul"),
        label: { fr: "ChartMogul", en: "ChartMogul" },
        path: { fr: "le graphique ARPA, directement", en: "the ARPA chart, directly" },
      },
    ],
    trap: {
      fr: "Un ARPA qui monte pendant que le nombre de clients baisse, ce sont souvent les petits clients qui partent.",
      en: "An ARPA rising while the number of customers falls is often small customers leaving.",
    },
    request: {
      fr: "le MRR à fin {month} et le nombre de clients payants à la même date",
      en: "the MRR at the end of {month} and the number of paying customers on the same date",
    },
    noReferenceReason: {
      fr: "il varie de trois ordres de grandeur d'une catégorie de produit à l'autre",
      en: "it varies by three orders of magnitude from one product category to another",
    },
  },
  "rev.gross-margin": {
    name: { fr: "Marge brute", en: "Gross margin" },
    oneLiner: {
      fr: "Ce qu'il reste d'un paiement après le coût de servir le client.",
      en: "What is left of a payment after the cost of serving the customer.",
    },
    formula: {
      fr: "(revenu – coût direct de service : hébergement, frais de paiement, support) ÷ revenu",
      en: "(revenue – direct cost of service: hosting, payment fees, support) ÷ revenue",
    },
    inputs: {
      numerator: { fr: "Marge brute du mois", en: "Gross profit in the month" },
      denominator: { fr: "Revenu du mois", en: "Revenue in the month" },
    },
    where: [
      {
        source: role("finance"),
        label: { fr: "Finance", en: "Finance" },
        path: {
          fr: "le compte de résultat du dernier trimestre clos : le revenu, puis les coûts directs de service",
          en: "the income statement of the last closed quarter: revenue, then the direct cost of service",
        },
      },
    ],
    trap: {
      fr: "Prendre le revenu au lieu de la marge flatte le payback : c'est la marge qui rembourse le CAC.",
      en: "Using revenue instead of margin flatters the payback: margin is what pays the CAC back.",
    },
    request: {
      fr: "la marge brute du dernier trimestre clos, et ce que ses coûts directs comprennent",
      en: "the gross margin of the last closed quarter, and what its direct costs include",
    },
    benchmarkCaveat: {
      fr: "en SaaS ; bien moins dès qu'il y a de l'humain dans la livraison",
      en: "in SaaS; much lower as soon as people are part of the delivery",
    },
  },
};

export const ENGINE_DERIVED_CATALOG: Record<DerivedId, EngineDerivedEntry> = {
  "rev.ltv": {
    name: { fr: "LTV", en: "LTV" },
    formula: {
      fr: "ARPA × marge brute × durée de vie (1 ÷ churn mensuel, au plus 36 mois)",
      en: "ARPA × gross margin × lifetime (1 ÷ monthly churn, at most 36 months)",
    },
    uncomputable: { fr: "incalculable — il manque : {input}", en: "can't be computed — missing: {input}" },
    capNote: {
      fr: "durée de vie plafonnée à 36 mois : la plupart des praticiens plafonnent entre trois et cinq ans, on prend le bas",
      en: "lifetime capped at 36 months: most practitioners cap it between three and five years, we take the low end",
    },
  },
  "rev.cac-payback": {
    name: { fr: "CAC payback", en: "CAC payback" },
    formula: { fr: "CAC ÷ (ARPA × marge brute), en mois", en: "CAC ÷ (ARPA × gross margin), in months" },
    uncomputable: { fr: "incalculable — il manque : {input}", en: "can't be computed — missing: {input}" },
    caveat: {
      fr: "repère couramment cité, pas une loi : la vraie comparaison reste la trésorerie",
      en: "a commonly cited reference, not a law: the real comparison is still the cash in the bank",
    },
  },
  "rev.ltv-cac": {
    name: { fr: "LTV:CAC", en: "LTV:CAC" },
    formula: { fr: "LTV ÷ CAC", en: "LTV ÷ CAC" },
    uncomputable: { fr: "incalculable — il manque : {input}", en: "can't be computed — missing: {input}" },
    caveat: { fr: "un repère, pas une loi", en: "a rule of thumb, not a law" },
  },
};
