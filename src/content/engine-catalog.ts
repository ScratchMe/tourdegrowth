// TODO: à relire — copie neuve (convention 6), rédigée par la session de code
import type { Translatable } from "@/lib/i18n/translatable";
import type { DerivedId, MetricId, SourceRef } from "@/lib/engine/types";

/**
 * engine-catalog.ts — the PROSE of the growth engine's numbers and computed
 * figures (engine spec §5, §14.13): self-serve's seventeen and five,
 * sales-assisted's fifteen and three, and the hybrid's link (§18.4, A7.3.c
 * S2). Both records are keyed by every id the types know, so a number
 * without its prose does not compile. Server only: the page
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
 * `{cohort}` (the followed cohort, same format), `{period}` (the months a
 * sales-assisted number covers, WITH its preposition: « de mai à juillet
 * 2026 », « d'août à octobre 2026 », "from May to July 2026", or « en août
 * 2026 » for a single month — so a template writes « leads créés {period} »,
 * never « sur {period} »), `{n}` (a window in days),
 * `{event}` (a whole noun phrase with its article — `event.named`, the
 * user's own words quoted: « l'événement « a créé un premier projet » », or
 * `event.unnamed` before anyone has named it — so a template writes « ayant
 * déclenché {event} », never « ayant fait {event} »), `{variant}` (the CAC
 * variant's label, lower-cased mid-sentence). Every string of this file may
 * carry any of the six; `lib/engine/phrases.ts#catalogueValues` fills all
 * of them, for the requests, the annex and the sheet alike.
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

/** The prose of every number: self-serve's seventeen, sales-assisted's fifteen (A7.3.c S2), and the link. */
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
      // « Inscrits », as the top channel's denominator says it: the same count, typed once
      // (shared-counts.ts, 2026-09-25), must read the same in both places.
      numerator: { fr: "Inscrits en {month}", en: "Sign-ups in {month}" },
      denominator: { fr: "Visiteurs uniques en {month}", en: "Unique visitors in {month}" },
    },
    where: [
      {
        source: tool("ga4"),
        label: { fr: "GA4", en: "GA4" },
        path: {
          fr: "le total Utilisateurs du mois (la métrique Utilisateurs, à ajouter au rapport Acquisition de trafic si elle n'y est pas), pas Sessions",
          en: "the month's total Users (the Users metric; add it to the Traffic acquisition report if it isn't there), not Sessions",
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
    // TODO: à relire (convention 6) — réécrit le 2026-09-30 (A7.1, C1) : plus aucun repère ne désigne, le « jamais » isolait celui-ci.
    benchmarkCaveat: {
      fr: "pour du trafic payant froid, bien plus pour du trafic chaud ; ton trafic est un mélange",
      en: "for cold paid traffic, far higher for warm traffic; your traffic is a mix",
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
          fr: "le rapport Acquisition d'utilisateurs, dimension « Groupe de canaux par défaut pour le premier utilisateur »",
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
      fr: "Dans GA4, « Referral » veut dire site référent, pas recommandation d'un client ; et « Direct » regroupe les visites arrivées sans source connue (favori, adresse tapée, lien sans référent).",
      en: "In GA4, \"Referral\" means a referring website, not a customer's recommendation; and \"Direct\" groups visits that arrived with no known source (bookmark, typed address, link without a referrer).",
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
      fr: "inscrits de la cohorte ayant déclenché {event} sous {n} jours ÷ inscrits de la cohorte",
      en: "cohort sign-ups who triggered {event} within {n} days ÷ cohort sign-ups",
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
          // No article before {n}: the static catalogue page fills it with the letter "n", and "a n-day" is wrong.
          en: "a funnel from sign-up to {event}, with a conversion window of {n} days",
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
      fr: "pour les inscrits en {cohort}, combien ont déclenché {event} sous {n} jours, et combien d'inscrits au total",
      en: "for the sign-ups from {cohort}, how many triggered {event} within {n} days, and how many sign-ups in total",
    },
    benchmarkCaveat: {
      fr: "pour un onboarding SaaS, souvent plus bas en essai gratuit ; tout dépend de l'exigence de l'événement retenu",
      en: "for SaaS onboarding, often lower for free trials; it all depends on how demanding the chosen event is",
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
    // TODO: à relire (convention 6) — réécrit le 2026-09-30 (A7.1, C1) : 1-2 % vaut pour le SaaS B2B à panier élevé.
    benchmarkCaveat: {
      fr: "pour le SaaS B2B à panier élevé ; les petits paniers tournent bien plus haut, les contrats entreprise bien plus bas",
      en: "for high-ticket B2B SaaS; low-ticket products run much higher, enterprise contracts much lower",
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
      // TODO: à relire — dénominateur = le MRR du mois depuis 2026-09-26 (base commune avec l'ARPA).
      numerator: { fr: "Marge brute sur ce MRR", en: "Gross profit on that MRR" },
      denominator: { fr: "MRR à fin {month}", en: "MRR at the end of {month}" },
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
  // TODO: à relire — nouveau (2026-09-26) : les deux mouvements de MRR que NRR et GRR demandent.
  "rev.expansion": {
    name: { fr: "Expansion mensuelle", en: "Monthly expansion" },
    oneLiner: {
      fr: "Le revenu que les clients déjà là ajoutent dans le mois : montées en gamme, sièges, options.",
      en: "The revenue customers already on board add in the month: upgrades, seats, add-ons.",
    },
    formula: {
      fr: "MRR d'expansion du mois ÷ MRR au 1er du mois",
      en: "expansion MRR in the month ÷ MRR at the start of the month",
    },
    inputs: {
      numerator: { fr: "MRR d'expansion en {month}", en: "Expansion MRR in {month}" },
      denominator: { fr: "MRR au 1er {month}", en: "MRR at the start of {month}" },
    },
    where: [
      {
        source: tool("stripe"),
        label: { fr: "Stripe", en: "Stripe" },
        path: {
          fr: "la page Billing overview : les mouvements de MRR du mois, ligne « expansion »",
          en: "the Billing overview page: the month's MRR movements, the \"expansion\" line",
        },
      },
      {
        source: tool("chargebee"),
        label: { fr: "Chargebee", en: "Chargebee" },
        path: {
          fr: "les rapports de mouvements de MRR (RevenueStory, selon ton édition)",
          en: "the MRR movement reports (RevenueStory, depending on your edition)",
        },
      },
      {
        source: tool("chartmogul"),
        label: { fr: "ChartMogul ou Baremetrics", en: "ChartMogul or Baremetrics" },
        path: {
          fr: "le graphique des mouvements de MRR, au mois",
          en: "the MRR movements chart, by month",
        },
      },
    ],
    trap: {
      fr: "Le MRR des nouveaux clients n'est pas de l'expansion : seuls comptent ceux qui payaient déjà au 1er du mois.",
      en: "New customers' MRR is not expansion: only customers already paying at the start of the month count.",
    },
    request: {
      fr: "le MRR au 1er {month} et le MRR d'expansion du mois, sans les nouveaux clients",
      en: "the MRR at the start of {month} and the month's expansion MRR, without new customers",
    },
    noReferenceReason: {
      fr: "la place pour l'expansion dépend du modèle de prix : forte avec des sièges, faible avec un prix fixe",
      en: "the room for expansion depends on the pricing model: large with seats, small with a flat price",
    },
    naReasons: [{ id: "not-subscription", label: { fr: "Pas d'abonnement", en: "No subscription" } }],
  },
  "rev.contraction": {
    name: { fr: "Rétrogradation mensuelle", en: "Monthly contraction" },
    oneLiner: {
      fr: "Le revenu que les clients qui restent retirent dans le mois : offre moins chère, sièges en moins.",
      en: "The revenue customers who stay take away in the month: a cheaper plan, fewer seats.",
    },
    formula: {
      fr: "MRR perdu en rétrogradations dans le mois ÷ MRR au 1er du mois",
      en: "MRR lost to downgrades in the month ÷ MRR at the start of the month",
    },
    inputs: {
      numerator: { fr: "MRR perdu en rétrogradations en {month}", en: "MRR lost to downgrades in {month}" },
      denominator: { fr: "MRR au 1er {month}", en: "MRR at the start of {month}" },
    },
    where: [
      {
        source: tool("stripe"),
        label: { fr: "Stripe", en: "Stripe" },
        path: {
          fr: "la page Billing overview : les mouvements de MRR du mois, ligne « contraction »",
          en: "the Billing overview page: the month's MRR movements, the \"contraction\" line",
        },
      },
      {
        source: tool("chargebee"),
        label: { fr: "Chargebee", en: "Chargebee" },
        path: {
          fr: "les rapports de mouvements de MRR (RevenueStory, selon ton édition)",
          en: "the MRR movement reports (RevenueStory, depending on your edition)",
        },
      },
      {
        source: tool("chartmogul"),
        label: { fr: "ChartMogul ou Baremetrics", en: "ChartMogul or Baremetrics" },
        path: {
          fr: "le graphique des mouvements de MRR, au mois",
          en: "the MRR movements chart, by month",
        },
      },
    ],
    trap: {
      fr: "Un client qui part n'est pas une rétrogradation : son MRR relève du churn, compté à part.",
      en: "A customer who leaves is not a downgrade: their MRR is churn, counted separately.",
    },
    request: {
      fr: "le MRR au 1er {month} et le MRR perdu en rétrogradations pendant le mois, sans les résiliations",
      en: "the MRR at the start of {month} and the MRR lost to downgrades during the month, without cancellations",
    },
    noReferenceReason: {
      fr: "elle dépend du modèle de prix autant que du produit : aucun ordre de grandeur ne vaut pour tous",
      en: "it depends on the pricing model as much as on the product: no order of magnitude fits everyone",
    },
    naReasons: [{ id: "not-subscription", label: { fr: "Pas d'abonnement", en: "No subscription" } }],
  },

  // --- Sales-assisted (A7.3.c S2, ENGINE.md §18.4) ---------------------------
  // TODO: à relire (convention 6) — neuf le 2026-10-01 : les quinze chiffres de l'assisté, puis la liaison.
  "slg.acq.lead-to-opp": {
    name: { fr: "Passage des leads en opportunités", en: "Lead-to-opportunity rate" },
    oneLiner: { fr: "La part des leads d'une période qui deviennent une opportunité qualifiée.", en: "The share of a period's leads that become a qualified opportunity." },
    formula: { fr: "leads créés {period} devenus une opportunité qualifiée sous {n} jours ÷ leads créés {period}", en: "leads created {period} that became a qualified opportunity within {n} days ÷ leads created {period}" },
    inputs: { numerator: { fr: "Leads devenus opportunités sous {n} jours", en: "Leads turned opportunities within {n} days" }, denominator: { fr: "Leads créés {period}", en: "Leads created {period}" } },
    where: [
      { source: tool("hubspot"), label: { fr: "HubSpot", en: "HubSpot" }, path: { fr: "les contacts créés sur la période, avec leur date d'entrée dans l'étape Opportunité du cycle de vie : un export, puis ceux arrivés sous {n} jours", en: "the contacts created over the period, with the date they entered the Opportunity lifecycle stage: an export, then those who got there within {n} days" } },
      { source: tool("salesforce"), label: { fr: "Salesforce", en: "Salesforce" }, path: { fr: "un rapport de leads avec leur conversion : créés sur la période, convertis sous {n} jours (date de conversion moins date de création)", en: "a leads report with conversion details: created over the period, converted within {n} days (converted date minus created date)" } },
      { source: tool("pipedrive"), label: { fr: "Pipedrive", en: "Pipedrive" }, path: { fr: "la boîte de réception des leads : ceux de la période convertis en affaire ; sinon, un export", en: "the leads inbox: the period's leads converted into a deal; otherwise, an export" } },
    ],
    trap: { fr: "« Lead » n'a pas de définition commune : des contacts importés ou des inscrits à un webinar font chuter le taux. Écris ce qui compte comme lead, et comme opportunité.", en: "\"Lead\" has no shared definition: imported contacts or webinar sign-ups drag the rate down. Write down what counts as a lead, and as an opportunity." },
    request: { fr: "les leads créés {period}, et combien sont devenus une opportunité qualifiée sous {n} jours", en: "the leads created {period}, and how many became a qualified opportunity within {n} days" },
    noReferenceReason: { fr: "le taux dépend entièrement de ce que l'entreprise appelle un lead", en: "the rate depends entirely on what the company calls a lead" },
    variants: [
      { id: "all-leads", label: { fr: "Tous les leads", en: "All leads" } },
      { id: "mql", label: { fr: "MQL seulement", en: "MQLs only" } },
    ],
  },
  "slg.acq.cac": {
    name: { fr: "CAC assisté", en: "Sales-assisted CAC" },
    oneLiner: { fr: "Ce que coûte, en moyenne, un nouveau client signé par l'équipe commerciale.", en: "What a new customer signed by the sales team costs, on average." },
    formula: { fr: "dépense ventes et marketing {period} ÷ nouveaux clients assistés signés {period}", en: "sales and marketing spend {period} ÷ new sales-assisted customers signed {period}" },
    inputs: { numerator: { fr: "Dépense ventes et marketing {period}", en: "Sales and marketing spend {period}" }, denominator: { fr: "Affaires « nouveau client » gagnées {period}", en: "New-customer deals won {period}" } },
    where: [
      { source: role("finance"), label: { fr: "Finance", en: "Finance" }, path: { fr: "la dépense ventes et marketing du trimestre, salaires chargés compris pour la variante « tout chargé »", en: "the quarter's sales and marketing spend, loaded salaries included for the \"fully loaded\" variant" } },
      { source: tool("hubspot"), label: { fr: "HubSpot, Salesforce ou Pipedrive", en: "HubSpot, Salesforce or Pipedrive" }, path: { fr: "les affaires « nouveau client » gagnées sur la période : le nombre qui divise", en: "the new-customer deals won over the period: the number it divides by" } },
      { source: tool("google-ads"), label: { fr: "Régies publicitaires", en: "Ad platforms" }, path: { fr: "le coût média de la période, pour la variante « média seul »", en: "the period's media cost, for the \"media only\" variant" } },
    ],
    trap: { fr: "Si le cycle médian dépasse trois mois, les clients signés ce trimestre viennent des dépenses d'avant. En hybride, répartis la dépense commune selon une clé, et écris-la.", en: "If the median cycle runs past three months, this quarter's customers come from earlier spend. In a hybrid, split the shared spend by a key, and write it down." },
    request: { fr: "la dépense ventes et marketing {period} ({variant}) et le nombre d'affaires « nouveau client » gagnées sur la même période", en: "the sales and marketing spend {period} ({variant}) and the number of new-customer deals won over the same period" },
    noReferenceReason: { fr: "il n'y a pas de bon CAC dans l'absolu : il se juge contre ce qu'un client rapporte (payback, LTV:CAC)", en: "there is no good CAC in absolute terms: it is judged against what a customer brings in (payback, LTV:CAC)" },
    variants: [
      { id: "media-only", label: { fr: "Média seul", en: "Media only" } },
      { id: "plus-team", label: { fr: "+ équipe marketing", en: "+ marketing team" } },
      { id: "fully-loaded", label: { fr: "Tout chargé", en: "Fully loaded" } },
    ],
  },
  "slg.acq.cycle": {
    name: { fr: "Cycle de vente médian", en: "Median sales cycle" },
    oneLiner: { fr: "Le temps qu'il faut pour signer une affaire, de l'opportunité au contrat.", en: "How long it takes to sign a deal, from opportunity to contract." },
    formula: { fr: "médiane des jours entre la création de l'opportunité et sa signature, sur les affaires « nouveau client » gagnées {period}", en: "median days between an opportunity's creation and its signature, over the new-customer deals won {period}" },
    where: [
      { source: tool("salesforce"), label: { fr: "Salesforce", en: "Salesforce" }, path: { fr: "un rapport des opportunités gagnées sur la période, avec leur ancienneté en jours : un export, puis la médiane", en: "a report of the opportunities won over the period, with their age in days: an export, then the median" } },
      { source: tool("hubspot"), label: { fr: "HubSpot", en: "HubSpot" }, path: { fr: "les transactions gagnées, de la date de création à la date de fermeture : un export, puis la médiane, car les rapports donnent des moyennes", en: "the deals won, from create date to close date: an export, then the median, since the reports give averages" } },
      { source: tool("pipedrive"), label: { fr: "Pipedrive", en: "Pipedrive" }, path: { fr: "la durée des affaires dans les rapports est une moyenne : la médiane se calcule sur un export", en: "deal duration in the reports is an average: the median comes from an export" } },
    ],
    trap: { fr: "Une affaire à 400 jours déplace la moyenne de plusieurs semaines : prends la médiane. Et une opportunité créée tard, après la démo, raccourcit le cycle sur le papier.", en: "One 400-day deal moves the average by weeks: use the median. And an opportunity created late, after the demo, shortens the cycle on paper." },
    request: { fr: "la médiane, en jours, entre la création et la signature des affaires « nouveau client » gagnées {period}", en: "the median, in days, between creation and signature of the new-customer deals won {period}" },
    noReferenceReason: { fr: "le cycle dépend du ticket et de qui signe chez le client : il se suit d'un trimestre à l'autre", en: "the cycle depends on the deal size and on who signs at the customer: it is followed quarter to quarter" },
    variants: [
      { id: "median", label: { fr: "Médiane", en: "Median" } },
      { id: "mean", label: { fr: "Moyenne", en: "Average" } },
    ],
  },
  "slg.act.live-event": {
    name: { fr: "Ce que « en production » veut dire", en: "What \"live\" means" },
    oneLiner: { fr: "Le résultat concret qui prouve qu'un client a obtenu ce qu'il a acheté.", en: "The concrete result that shows a customer got what they bought." },
    formula: { fr: "le résultat qui compte comme « en production », et le nombre de jours laissés pour l'atteindre après la signature", en: "the result that counts as \"live\", and the number of days allowed to reach it after signature" },
    where: [
      { source: role("customer-success"), label: { fr: "Customer Success et produit", en: "Customer success and product" }, path: { fr: "une décision à prendre ensemble : ce que fait un client en production, et que ne fait pas un compte seulement déployé", en: "a decision to make together: what a live customer does that a merely deployed account doesn't" } },
    ],
    trap: { fr: "« Déployé » n'est pas « en production » : un compte livré que personne n'utilise ne renouvelle pas.", en: "\"Deployed\" isn't \"live\": an account delivered that nobody uses doesn't renew." },
    request: { fr: "ce qui compte, chez nous, comme un client « en production », et le délai qu'on se donne pour y arriver ({n} jours aujourd'hui)", en: "what counts, for us, as a \"live\" customer, and the time we allow to get there ({n} days today)" },
  },
  "slg.act.go-live": {
    name: { fr: "Mise en production", en: "Go-live rate" },
    oneLiner: { fr: "La part des nouveaux clients en production dans le délai fixé après la signature.", en: "The share of new customers live within the set time after signature." },
    formula: { fr: "nouveaux clients signés {period} en production sous {n} jours ÷ nouveaux clients signés {period}", en: "new customers signed {period} live within {n} days ÷ new customers signed {period}" },
    inputs: { numerator: { fr: "Clients en production sous {n} jours", en: "Customers live within {n} days" }, denominator: { fr: "Nouveaux clients signés {period}", en: "New customers signed {period}" } },
    where: [
      { source: tool("cs-platform"), label: { fr: "Outil de Customer Success", en: "Customer success platform" }, path: { fr: "l'étape d'onboarding de chaque compte et sa date : Gainsight, Vitally ou Planhat la gardent", en: "each account's onboarding stage and its date: Gainsight, Vitally or Planhat keep it" } },
      { source: tool("hubspot"), label: { fr: "HubSpot ou Salesforce", en: "HubSpot or Salesforce" }, path: { fr: "un pipeline d'onboarding, ou un champ date « en production » sur le compte, s'il existe", en: "an onboarding pipeline, or a \"live\" date field on the account, if there is one" } },
      { source: tool("spreadsheet"), label: { fr: "Tableur du Customer Success", en: "Customer success spreadsheet" }, path: { fr: "souvent le seul endroit où la date est notée", en: "often the only place the date is written down" } },
    ],
    trap: { fr: "Compter les comptes déployés plutôt qu'en production double le taux. Et lis la cohorte mûre : un client signé il y a moins de {n} jours n'a pas eu sa fenêtre.", en: "Counting deployed accounts instead of live ones doubles the rate. And read the mature cohort: a customer signed less than {n} days ago hasn't had its window." },
    request: { fr: "les nouveaux clients signés {period}, et combien étaient « en production » sous {n} jours après la signature", en: "the new customers signed {period}, and how many were \"live\" within {n} days of signature" },
    noReferenceReason: { fr: "la mise en production dépend de ce que l'offre demande d'installer : elle se suit contre sa propre cible", en: "go-live depends on what the offer needs set up: it is followed against its own target" },
  },
  "slg.act.time-to-live": {
    name: { fr: "Délai de mise en production", en: "Time to go-live" },
    oneLiner: { fr: "Le temps, en jours, entre la signature et la mise en production.", en: "The time, in days, from signature to go-live." },
    formula: { fr: "médiane des jours entre la signature et la mise en production, pour les clients signés {period} qui y sont arrivés", en: "median days from signature to go-live, for the customers signed {period} who got there" },
    where: [
      { source: tool("cs-platform"), label: { fr: "Outil de Customer Success", en: "Customer success platform" }, path: { fr: "la date de signature et la date de fin d'onboarding de chaque compte", en: "each account's signature date and onboarding end date" } },
      { source: tool("hubspot"), label: { fr: "HubSpot ou Salesforce", en: "HubSpot or Salesforce" }, path: { fr: "la date de signature et la date « en production », si elles existent", en: "the signature date and the \"live\" date, if they exist" } },
      { source: tool("spreadsheet"), label: { fr: "Tableur d'onboarding", en: "Onboarding spreadsheet" }, path: { fr: "les deux dates, compte par compte", en: "both dates, account by account" } },
    ],
    trap: { fr: "Médiane, et seulement sur ceux qui y sont arrivés : les autres sont dans le taux de mise en production.", en: "Median, and only over those who got there: the others are in the go-live rate." },
    request: { fr: "la médiane, en jours, entre la signature et la mise en production, pour les clients signés {period}", en: "the median, in days, from signature to go-live, for the customers signed {period}" },
    noReferenceReason: { fr: "il dépend de ce que l'offre demande d'installer", en: "it depends on what the offer needs set up" },
    variants: [
      { id: "median", label: { fr: "Médiane", en: "Median" } },
      { id: "mean", label: { fr: "Moyenne", en: "Average" } },
    ],
  },
  "slg.ret.renewal": {
    name: { fr: "Renouvellement des contrats", en: "Contract renewal rate" },
    oneLiner: { fr: "La part des contrats arrivés à échéance qui se renouvellent, comptés en clients.", en: "The share of contracts up for renewal that renew, counted in customers." },
    formula: { fr: "contrats renouvelés ÷ contrats arrivés à échéance {period}, en clients et non en euros", en: "contracts renewed ÷ contracts up for renewal {period}, in customers, not in money" },
    inputs: { numerator: { fr: "Contrats renouvelés", en: "Contracts renewed" }, denominator: { fr: "Contrats arrivés à échéance {period}", en: "Contracts up for renewal {period}" } },
    where: [
      { source: tool("salesforce"), label: { fr: "HubSpot, Salesforce ou Pipedrive", en: "HubSpot, Salesforce or Pipedrive" }, path: { fr: "un pipeline de renouvellements : gagnées ÷ closes sur la période", en: "a renewals pipeline: won ÷ closed over the period" } },
      { source: tool("stripe"), label: { fr: "Stripe ou Chargebee", en: "Stripe or Chargebee" }, path: { fr: "les abonnements dont l'échéance tombait sur la période, et leur statut aujourd'hui", en: "the subscriptions whose term ended in the period, and their status today" } },
      { source: role("customer-success"), label: { fr: "Customer Success", en: "Customer success" }, path: { fr: "la liste des échéances du trimestre, quand le CRM ne la tient pas", en: "the quarter's list of renewal dates, when the CRM doesn't keep it" } },
    ],
    trap: { fr: "La tacite reconduction ne se « gagne » pas : compte les résiliations reçues avant l'échéance. Un contrat pluriannuel qui n'arrive pas à échéance sort du compte.", en: "Auto-renewal isn't \"won\": count the cancellations received before the term ends. A multi-year contract not yet up for renewal stays out." },
    request: { fr: "les contrats arrivés à échéance {period}, et combien ont été renouvelés, en nombre de clients", en: "the contracts up for renewal {period}, and how many renewed, in number of customers" },
    noReferenceReason: { fr: "le glossaire cite un churn mensuel, pas un taux de renouvellement : le convertir supposerait des contrats mensuels", en: "the glossary quotes a monthly churn, not a renewal rate: converting it would assume monthly contracts" },
    variants: [
      { id: "annual", label: { fr: "Contrats annuels", en: "Annual contracts" } },
      { id: "monthly", label: { fr: "Contrats mensuels", en: "Monthly contracts" } },
    ],
    naReasons: [
      { id: "no-renewal-yet", label: { fr: "Aucune échéance encore passée", en: "No contract has come up yet" } },
    ],
  },
  "slg.ret.nrr": {
    name: { fr: "NRR sur douze mois", en: "12-month NRR" },
    oneLiner: { fr: "Ce que valent aujourd'hui, en revenu, les clients assistés d'il y a un an.", en: "What last year's sales-assisted customers are worth today, in revenue." },
    formula: { fr: "ARR aujourd'hui des clients assistés déjà là il y a douze mois ÷ leur ARR il y a douze mois", en: "today's ARR from the sales-assisted customers already there twelve months ago ÷ their ARR twelve months ago" },
    inputs: { numerator: { fr: "ARR aujourd'hui de ces clients", en: "Those customers' ARR today" }, denominator: { fr: "Leur ARR il y a douze mois", en: "Their ARR twelve months ago" } },
    where: [
      { source: tool("chartmogul"), label: { fr: "ChartMogul", en: "ChartMogul" }, path: { fr: "la rétention nette de revenu par cohorte, selon l'offre", en: "net revenue retention by cohort, depending on the plan" } },
      { source: role("finance"), label: { fr: "Finance", en: "Finance" }, path: { fr: "le reporting au board", en: "the board reporting" } },
      { source: tool("salesforce"), label: { fr: "Salesforce", en: "Salesforce" }, path: { fr: "la somme des contrats actifs par compte à deux dates, si les contrats y vivent", en: "the sum of active contracts per account at two dates, if contracts live there" } },
    ],
    trap: { fr: "Publiée seule, elle cache la perte : une NRR au-dessus de 100 % peut tenir sur une base qui perd un client sur cinq. Lis-la avec le renouvellement.", en: "Published alone, it hides the loss: an NRR above 100% can rest on a base that loses one customer in five. Read it with the renewal rate." },
    request: { fr: "l'ARR des clients assistés déjà là il y a douze mois, aujourd'hui et il y a douze mois", en: "the ARR of the sales-assisted customers already there twelve months ago, today and twelve months ago" },
    benchmarkCaveat: { fr: "considérée comme solide en SaaS B2B, du contexte et non une cible", en: "considered solid in B2B SaaS, context and not a target" },
  },
  "slg.ret.loss-cause": {
    name: { fr: "Cause principale de non-renouvellement", en: "Main reason for non-renewal" },
    oneLiner: { fr: "La raison qui revient le plus quand un client ne renouvelle pas.", en: "The reason that comes up most when a customer doesn't renew." },
    formula: { fr: "la cause, et comment on la sait : données, entretiens ou intuition", en: "the reason, and how we know it: data, interviews or gut feel" },
    where: [
      { source: tool("hubspot"), label: { fr: "HubSpot, Salesforce ou Pipedrive", en: "HubSpot, Salesforce or Pipedrive" }, path: { fr: "la raison de perte des renouvellements perdus, souvent un champ personnalisé", en: "the lost reason on lost renewals, often a custom field" } },
      { source: role("customer-success"), label: { fr: "Customer Success", en: "Customer success" }, path: { fr: "relire les derniers départs avec l'équipe", en: "go through the latest departures with the team" } },
    ],
    trap: { fr: "« Le prix » est la case la plus rapide à cocher. Croise la raison déclarée avec l'usage des 90 jours d'avant.", en: "\"Price\" is the quickest box to tick. Cross the stated reason with usage over the 90 days before." },
    request: { fr: "la raison qui revient le plus dans les non-renouvellements des derniers mois, et d'où on la tient", en: "the reason that comes up most in recent non-renewals, and where we get it from" },
    choices: [
      { id: "data", label: { fr: "Par les données", en: "From data" } },
      { id: "interviews", label: { fr: "Par des entretiens", en: "From interviews" } },
      { id: "hunch", label: { fr: "Par intuition", en: "From gut feel" } },
    ],
  },
  "slg.ref.referred-share": {
    name: { fr: "Opportunités recommandées", en: "Referred opportunities" },
    oneLiner: { fr: "La part des opportunités amenées par un client ou un partenaire.", en: "The share of opportunities brought in by a customer or a partner." },
    formula: { fr: "opportunités créées {period} venues d'une recommandation ÷ opportunités créées {period}", en: "opportunities created {period} that came from a referral ÷ opportunities created {period}" },
    inputs: { numerator: { fr: "Opportunités venues d'une recommandation", en: "Opportunities from a referral" }, denominator: { fr: "Opportunités créées {period}", en: "Opportunities created {period}" } },
    where: [
      { source: tool("salesforce"), label: { fr: "Salesforce", en: "Salesforce" }, path: { fr: "la source du lead ou de l'opportunité : ses valeurs recommandation et partenaire", en: "the lead or opportunity source: its referral and partner values" } },
      { source: tool("hubspot"), label: { fr: "HubSpot", en: "HubSpot" }, path: { fr: "une propriété de source de la transaction, souvent à créer : la source d'origine ne connaît pas les recommandations", en: "a deal source property, often one to create: the original source doesn't know about referrals" } },
      { source: role("sales"), label: { fr: "Les commerciaux", en: "The sales team" }, path: { fr: "l'origine de leurs dix dernières opportunités : souvent plus vite et plus juste", en: "where their last ten opportunities came from: often faster and more accurate" } },
    ],
    trap: { fr: "Un zéro veut presque toujours dire « personne ne l'a compté ». Et la source « referral » d'un outil web compte des sites, pas des personnes.", en: "A zero almost always means \"nobody counted it\". And a web tool's \"referral\" source counts websites, not people." },
    request: { fr: "les opportunités créées {period}, et combien venaient d'une recommandation ({variant})", en: "the opportunities created {period}, and how many came from a referral ({variant})" },
    noReferenceReason: { fr: "de presque rien à la majorité selon le produit : la seule référence est son propre chiffre", en: "from almost none to the majority depending on the product: the only reference is its own number" },
    variants: [
      { id: "customers", label: { fr: "Clients seulement", en: "Customers only" } },
      { id: "customers-and-partners", label: { fr: "Clients et partenaires", en: "Customers and partners" } },
    ],
  },
  "slg.ref.referenceable": {
    name: { fr: "Clients références", en: "Reference customers" },
    oneLiner: { fr: "La part des clients assistés d'accord pour être cités ou prendre un appel.", en: "The share of sales-assisted customers who agree to be named or take a call." },
    formula: { fr: "clients assistés avec un accord écrit de moins de douze mois ÷ clients assistés à fin {month}", en: "sales-assisted customers with a written agreement under twelve months old ÷ sales-assisted customers at the end of {month}" },
    inputs: { numerator: { fr: "Clients d'accord pour être cités", en: "Customers who agree to be named" }, denominator: { fr: "Clients assistés à fin {month}", en: "Sales-assisted customers at the end of {month}" } },
    where: [
      { source: tool("spreadsheet"), label: { fr: "Marketing ou Customer Success", en: "Marketing or customer success" }, path: { fr: "le tableur des références, avec la date de chaque accord", en: "the references spreadsheet, with each agreement's date" } },
      { source: tool("hubspot"), label: { fr: "HubSpot, Salesforce ou Pipedrive", en: "HubSpot, Salesforce or Pipedrive" }, path: { fr: "une propriété « client référence » sur la société, si l'équipe l'a créée", en: "a \"reference customer\" property on the company, if the team created one" } },
    ],
    trap: { fr: "Les logos du site comptent des clients partis et des accords jamais renouvelés.", en: "The logos on the website count customers who left and agreements never renewed." },
    request: { fr: "le nombre de clients assistés ayant donné un accord écrit, de moins de douze mois, pour être cités ou prendre un appel", en: "the number of sales-assisted customers with a written agreement, under twelve months old, to be named or take a call" },
    noReferenceReason: { fr: "un accord de citation dépend de chaque client", en: "an agreement to be named depends on each customer" },
  },
  "slg.rev.win-rate": {
    name: { fr: "Taux de closing", en: "Win rate" },
    oneLiner: { fr: "La part des opportunités conclues qui se signent.", en: "The share of closed opportunities that are won." },
    formula: { fr: "opportunités « nouveau client » gagnées ÷ opportunités « nouveau client » conclues (gagnées + perdues) {period}", en: "new-customer opportunities won ÷ new-customer opportunities closed (won + lost) {period}" },
    inputs: { numerator: { fr: "Affaires « nouveau client » gagnées {period}", en: "New-customer deals won {period}" }, denominator: { fr: "Opportunités conclues {period}", en: "Opportunities closed {period}" } },
    where: [
      { source: tool("salesforce"), label: { fr: "Salesforce", en: "Salesforce" }, path: { fr: "les opportunités « nouveau client » closes sur la période : gagnées ÷ closes", en: "the new-customer opportunities closed over the period: won ÷ closed" } },
      { source: tool("hubspot"), label: { fr: "HubSpot", en: "HubSpot" }, path: { fr: "les transactions « nouvelle affaire » fermées sur la période : gagnées ÷ (gagnées + perdues)", en: "the new-business deals closed over the period: won ÷ (won + lost)" } },
      { source: tool("pipedrive"), label: { fr: "Pipedrive", en: "Pipedrive" }, path: { fr: "la conversion des affaires sur la période, dans les rapports", en: "deal conversion over the period, in the reports" } },
    ],
    trap: { fr: "Les affaires mortes jamais passées « perdues » gonflent le taux, et un « sans décision » est une perte. Les ventes aux clients existants n'ont rien à faire ici.", en: "Dead deals never marked \"lost\" inflate the rate, and a \"no decision\" is a loss. Sales to existing customers don't belong here." },
    request: { fr: "les opportunités « nouveau client » conclues {period}, et combien ont été gagnées", en: "the new-customer opportunities closed {period}, and how many were won" },
    noReferenceReason: { fr: "le taux dépend du ticket et de ce qui compte comme opportunité : il se suit contre sa propre cible", en: "the rate depends on deal size and on what counts as an opportunity: it is followed against its own target" },
  },
  "slg.rev.acv": {
    name: { fr: "ACV des nouveaux contrats", en: "New-contract ACV" },
    oneLiner: { fr: "Ce que vaut par an, en moyenne, un nouveau contrat signé.", en: "What a new signed contract is worth per year, on average." },
    formula: { fr: "valeur annuelle des contrats « nouveau client » signés {period}, hors mise en service ÷ nombre de ces contrats", en: "annual value of the new-customer contracts signed {period}, onboarding fees excluded ÷ number of those contracts" },
    inputs: { numerator: { fr: "Valeur annuelle de ces contrats", en: "Annual value of those contracts" }, denominator: { fr: "Affaires « nouveau client » gagnées {period}", en: "New-customer deals won {period}" } },
    where: [
      { source: tool("hubspot"), label: { fr: "HubSpot", en: "HubSpot" }, path: { fr: "la propriété ACV des transactions gagnées, sinon leur montant", en: "the ACV property on won deals, otherwise their amount" } },
      { source: tool("salesforce"), label: { fr: "Salesforce", en: "Salesforce" }, path: { fr: "le montant des opportunités gagnées : vérifie qu'il porte une année, pas toute la durée", en: "the amount on won opportunities: check it covers one year, not the whole term" } },
      { source: role("finance"), label: { fr: "Finance", en: "Finance" }, path: { fr: "les contrats signés sur la période", en: "the contracts signed over the period" } },
    ],
    trap: { fr: "Un montant qui porte trois ans de contrat triple l'ACV, et la mise en service n'est pas récurrente. Une moyenne se laisse tirer par un gros contrat : regarde aussi la médiane.", en: "An amount covering a three-year contract triples the ACV, and onboarding isn't recurring. An average gets pulled by one big deal: look at the median too." },
    request: { fr: "la valeur annuelle des contrats « nouveau client » signés {period}, hors mise en service, et leur nombre", en: "the annual value of the new-customer contracts signed {period}, onboarding excluded, and how many there were" },
    noReferenceReason: { fr: "l'ACV couvre plusieurs ordres de grandeur d'une catégorie à l'autre : aucun repère ne vaut pour tous", en: "ACV spans several orders of magnitude from one category to another: no reference holds for all" },
  },
  "slg.rev.arpa": {
    name: { fr: "ARPA assisté", en: "Sales-assisted ARPA" },
    oneLiner: { fr: "Le revenu mensuel moyen d'un client assisté.", en: "A sales-assisted customer's average monthly revenue." },
    formula: { fr: "MRR des clients assistés à fin {month} ÷ clients assistés à fin {month}", en: "MRR of the sales-assisted customers at the end of {month} ÷ sales-assisted customers at the end of {month}" },
    inputs: { numerator: { fr: "MRR assisté à fin {month}", en: "Sales-assisted MRR at the end of {month}" }, denominator: { fr: "Clients assistés à fin {month}", en: "Sales-assisted customers at the end of {month}" } },
    where: [
      { source: tool("stripe"), label: { fr: "Stripe, Chargebee ou ChartMogul", en: "Stripe, Chargebee or ChartMogul" }, path: { fr: "le MRR et les clients filtrés sur les clients assistés : un segment, un plan, une propriété", en: "MRR and customers filtered on sales-assisted customers: a segment, a plan, a property" } },
      { source: role("finance"), label: { fr: "Finance", en: "Finance" }, path: { fr: "l'ARR assisté ÷ 12, et le nombre de clients assistés", en: "sales-assisted ARR ÷ 12, and the number of sales-assisted customers" } },
    ],
    trap: { fr: "En hybride, un client compte dans la seule motion qui a signé son contrat en cours : un client du libre-service passé par un commercial compte ici.", en: "In a hybrid, a customer counts in the one motion that signed their current contract: a self-serve customer moved over by a salesperson counts here." },
    request: { fr: "le MRR des clients assistés à fin {month}, et leur nombre", en: "the MRR of the sales-assisted customers at the end of {month}, and how many there are" },
    noReferenceReason: { fr: "trois ordres de grandeur séparent les catégories : aucun repère ne vaut pour tous", en: "three orders of magnitude separate categories: no reference holds for all" },
  },
  "slg.rev.gross-margin": {
    name: { fr: "Marge brute de l'assisté", en: "Sales-assisted gross margin" },
    oneLiner: { fr: "Ce qu'il reste du revenu assisté après le coût de servir ces clients, mise en service comprise.", en: "What is left of sales-assisted revenue after the cost of serving those customers, onboarding included." },
    formula: { fr: "(revenu assisté – coût pour le servir, mise en service et Customer Success compris) ÷ revenu assisté, {period}", en: "(sales-assisted revenue – cost to serve it, onboarding and customer success included) ÷ sales-assisted revenue, {period}" },
    inputs: { numerator: { fr: "Marge brute assistée {period}", en: "Sales-assisted gross profit {period}" }, denominator: { fr: "Revenu assisté {period}", en: "Sales-assisted revenue {period}" } },
    where: [
      { source: role("finance"), label: { fr: "Finance", en: "Finance" }, path: { fr: "le compte de résultat par offre ou par segment, quand elle le tient ; sinon, la marge globale en repli", en: "the income statement by offer or segment, when it keeps one; otherwise the company-wide margin as a fallback" } },
    ],
    trap: { fr: "Une marge globale flatte l'assisté quand son offre comprend de la mise en service : demande la marge par motion à la finance.", en: "A company-wide margin flatters sales-assisted when its offer includes onboarding: ask finance for the margin by motion." },
    request: { fr: "la marge brute de l'activité assistée {period}, mise en service et Customer Success compris dans les coûts", en: "the gross margin of the sales-assisted business {period}, onboarding and customer success included in the costs" },
    noReferenceReason: { fr: "la mise en service et le Customer Success pèsent différemment dans chaque offre", en: "onboarding and customer success weigh differently in every offer" },
  },

  // --- The hybrid's link (§18.4.8, C25 Q7) -----------------------------------
  // TODO: à relire (convention 6) — neuf le 2026-10-01.
  "link.pql-handoff": {
    name: { fr: "Opportunités venues du libre-service", en: "Opportunities from self-serve" },
    oneLiner: { fr: "La part des opportunités assistées nées d'un compte du libre-service.", en: "The share of sales-assisted opportunities that started from a self-serve account." },
    formula: { fr: "opportunités créées {period} à partir d'un compte du libre-service ÷ opportunités créées {period}", en: "opportunities created {period} from a self-serve account ÷ opportunities created {period}" },
    inputs: { numerator: { fr: "Opportunités venues du libre-service", en: "Opportunities from self-serve" }, denominator: { fr: "Opportunités créées {period}", en: "Opportunities created {period}" } },
    where: [
      { source: tool("hubspot"), label: { fr: "HubSpot", en: "HubSpot" }, path: { fr: "la source de la transaction, ou une propriété « PQL » posée par l'intégration produit", en: "the deal source, or a \"PQL\" property set by the product integration" } },
      { source: tool("salesforce"), label: { fr: "Salesforce", en: "Salesforce" }, path: { fr: "la source du lead, ou une campagne dédiée aux PQL", en: "the lead source, or a campaign dedicated to PQLs" } },
      { source: tool("product-db"), label: { fr: "Données", en: "Data" }, path: { fr: "la jointure base produit × CRM sur le domaine de l'entreprise", en: "a product database × CRM join on the company's domain" } },
    ],
    trap: { fr: "Une part du pipeline, pas une attribution : le compte avait peut-être déjà parlé à un commercial. Et elle ne s'additionne pas à la part recommandée.", en: "A share of the pipeline, not an attribution: the account may already have talked to a salesperson. And it doesn't add up with the referred share." },
    // The PQL's definition, when the team wrote one, follows in brackets: the noun it defines ends the sentence.
    request: { fr: "les opportunités assistées créées {period}, et combien venaient d'un compte du libre-service qualifié, un PQL", en: "the sales-assisted opportunities created {period}, and how many came from a qualified self-serve account, a PQL" },
    noReferenceReason: { fr: "la seule référence qui vaille est le taux de base de l'équipe", en: "the only reference worth having is the team's own base rate" },
  },
};

export const ENGINE_DERIVED_CATALOG: Record<DerivedId, EngineDerivedEntry> = {
  "rev.ltv": {
    name: { fr: "LTV", en: "LTV" },
    formula: {
      fr: "ARPA × marge brute × durée de vie (1 ÷ churn mensuel, au plus 36 mois)",
      en: "ARPA × gross margin × lifetime (1 ÷ monthly churn, at most 36 months)",
    },
    uncomputable: { fr: "incalculable — il manque {input}", en: "can't be computed — missing: {input}" },
    capNote: {
      fr: "durée de vie plafonnée à 36 mois : beaucoup de praticiens plafonnent entre trois et cinq ans, on prend le bas",
      en: "lifetime capped at 36 months: many practitioners cap it between three and five years, we take the low end",
    },
  },
  "rev.cac-payback": {
    name: { fr: "CAC payback", en: "CAC payback" },
    formula: { fr: "CAC ÷ (ARPA × marge brute), en mois", en: "CAC ÷ (ARPA × gross margin), in months" },
    uncomputable: { fr: "incalculable — il manque {input}", en: "can't be computed — missing: {input}" },
    caveat: {
      fr: "repère couramment cité, pas une loi : la vraie comparaison reste la trésorerie",
      en: "a commonly cited reference, not a law: the real comparison is still the cash in the bank",
    },
  },
  "rev.ltv-cac": {
    name: { fr: "LTV:CAC", en: "LTV:CAC" },
    formula: { fr: "LTV ÷ CAC", en: "LTV ÷ CAC" },
    uncomputable: { fr: "incalculable — il manque {input}", en: "can't be computed — missing: {input}" },
    caveat: { fr: "un repère, pas une loi", en: "a rule of thumb, not a law" },
  },
  // TODO: à relire — nouveau (2026-09-26).
  "rev.grr": {
    name: { fr: "GRR mensuelle", en: "Monthly GRR" },
    formula: {
      fr: "100 % – churn – rétrogradation, sur le MRR du 1er du mois",
      en: "100% – churn – contraction, on the MRR at the start of the month",
    },
    uncomputable: { fr: "incalculable — il manque {input}", en: "can't be computed — missing: {input}" },
    caveat: {
      fr: "approximative : le churn logo tient lieu de churn en revenu, comme si les clients partis payaient l'ARPA moyen",
      en: "approximate: logo churn stands in for revenue churn, as if the customers who left paid the average ARPA",
    },
  },
  "rev.nrr": {
    name: { fr: "NRR mensuelle", en: "Monthly NRR" },
    formula: {
      fr: "100 % – churn – rétrogradation + expansion, sur le MRR du 1er du mois",
      en: "100% – churn – contraction + expansion, on the MRR at the start of the month",
    },
    uncomputable: { fr: "incalculable — il manque {input}", en: "can't be computed — missing: {input}" },
    caveat: {
      fr: "approximative : le churn logo tient lieu de churn en revenu, comme si les clients partis payaient l'ARPA moyen",
      en: "approximate: logo churn stands in for revenue churn, as if the customers who left paid the average ARPA",
    },
  },
  // --- Sales-assisted (§18.4.7) ---------------------------------------------
  // TODO: à relire (convention 6) — neuf le 2026-10-01 (A7.3.c S2).
  "slg.rev.ltv": {
    name: { fr: "LTV assistée", en: "Sales-assisted LTV" },
    formula: { fr: "ACV ÷ 12 × marge brute de l'assisté × durée de vie (tirée du renouvellement, au plus 36 mois)", en: "ACV ÷ 12 × sales-assisted gross margin × lifetime (from the renewal rate, at most 36 months)" },
    uncomputable: { fr: "incalculable — il manque {input}", en: "can't be computed — missing: {input}" },
    capNote: {
      fr: "durée de vie plafonnée à 36 mois, comme en libre-service : beaucoup de praticiens plafonnent entre trois et cinq ans, on prend le bas",
      en: "lifetime capped at 36 months, as in self-serve: many practitioners cap it between three and five years, we take the low end",
    },
  },
  "slg.rev.cac-payback": {
    name: { fr: "CAC payback assisté", en: "Sales-assisted CAC payback" },
    formula: { fr: "CAC assisté ÷ (ACV ÷ 12 × marge brute de l'assisté), en mois", en: "sales-assisted CAC ÷ (ACV ÷ 12 × sales-assisted gross margin), in months" },
    uncomputable: { fr: "incalculable — il manque {input}", en: "can't be computed — missing: {input}" },
    caveat: { fr: "repère couramment cité, pas une loi : la vraie comparaison reste la trésorerie", en: "a commonly cited reference, not a law: the real comparison is still the cash in the bank" },
  },
  "slg.rev.ltv-cac": {
    name: { fr: "LTV:CAC assisté", en: "Sales-assisted LTV:CAC" },
    formula: { fr: "LTV assistée ÷ CAC assisté", en: "sales-assisted LTV ÷ sales-assisted CAC" },
    uncomputable: { fr: "incalculable — il manque {input}", en: "can't be computed — missing: {input}" },
    caveat: { fr: "un repère, pas une loi", en: "a rule of thumb, not a law" },
  },
};
