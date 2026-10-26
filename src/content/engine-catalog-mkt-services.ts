// TODO: à relire — copie neuve (convention 6), §22 (A23 MKT-S)
import type { DeepPartialTranslatable } from "@/lib/i18n/translatable";
import type { MktDerivedId, MktMetricId, SourceRef } from "@/lib/engine/types";
import type { EngineCatalogEntry, EngineDerivedEntry } from "./engine-catalog"; // types only: erased, never a bundle edge

/**
 * engine-catalog-mkt-services.ts — the prose of the marketplace's nineteen numbers and six computed figures in the words of
 * "services" (engine spec §22.4.4 and §22.8.4, A23 MKT-S): « clients », « prestataires », « réservations », « profils ».
 * PARTIAL entries over `engine-catalog.ts`, keyed like its marketplace block: `mergeStrings` lays each on the "produits"
 * entry of the same id (`engine-props.ts`), so an entry holds only the fields whose words change. A field that holds none
 * of the words of "produits" is not here; `where` and `variants` are given whole when any of their labels or paths change
 * (`mergeStrings` replaces an array as a whole, so their `source` and `id` are repeated).
 *
 * Every name is the one of §22.4.4's table, and the two formulas of churn (`mkt.buy.churn`, `mkt.sell.churn`) are
 * §22.8.4's, word for word. The rest is the "produits" prose with the lexicon of §22.8.4 applied and nothing else, except
 * three places where the lexicon would change the sense or break the sentence — « un panier » (a paid order is not a basket:
 * the first order's trap), « le logiciel vendu seul » (software sold, not a sale of the marketplace) and « the first sale's »
 * (the window of the first booking received) — which are written out, each marked below. The prose keeps the limits of the
 * SaaS's (`engine-catalog.test.ts`, `catalogRules`): name ≤ 40, one-liner ≤ 110, formula ≤ 140, trap ≤ 200, request ≤ 160.
 * Server only, like `engine-catalog.ts`: the page resolves it to one language with the "produits" entry under it.
 */
const tool = (t: Extract<SourceRef, { kind: "tool" }>["tool"]): SourceRef => ({ kind: "tool", tool: t });
const role = (r: Extract<SourceRef, { kind: "person" }>["role"]): SourceRef => ({ kind: "person", role: r });

export const ENGINE_CATALOG_MKT_SERVICES: Record<MktMetricId, DeepPartialTranslatable<EngineCatalogEntry>> = {
  "mkt.buy.signup-rate": {
    name: { fr: "Taux d'inscription des clients", en: "Client sign-up rate" },
    oneLiner: {
      fr: "La part des visiteurs du mois qui créent un compte client.",
      en: "The share of the month's visitors who create a client account.",
    },
    formula: {
      fr: "comptes clients créés dans le mois ÷ visiteurs uniques du mois",
      en: "client accounts created in the month ÷ unique visitors in the month",
    },
    inputs: {
      numerator: { fr: "Inscrits clients en {month}", en: "Client sign-ups in {month}" },
      denominator: { fr: "Visiteurs uniques côté clients en {month}", en: "Unique client-side visitors in {month}" },
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
          fr: "un entonnoir en deux étapes, page vue puis inscription d'un client, sur le mois",
          en: "a two-step funnel, page view then client sign-up, over the month",
        },
      },
      {
        source: tool("product-db"),
        label: { fr: "Base produit", en: "Product database" },
        path: {
          fr: "les comptes clients créés sur le mois",
          en: "the client accounts created in the month",
        },
      },
    ],
    trap: {
      fr: "Si on peut réserver sans compte, compte une première réservation avec une adresse e-mail neuve comme une inscription. Les prestataires inscrits n'entrent pas ici.",
      en: "If people can book without an account, count a first booking with a new email address as a sign-up. Provider sign-ups don't belong here.",
    },
    request: {
      fr: "le nombre de visiteurs uniques et le nombre de comptes clients créés en {month}",
      en: "the number of unique visitors and of client accounts created in {month}",
    },
  },
  "mkt.buy.cac": {
    name: { fr: "CAC client", en: "Client CAC" },
    oneLiner: {
      fr: "Ce que coûte, en moyenne, un nouveau client.",
      en: "What a new client costs, on average.",
    },
    formula: {
      fr: "dépense d'acquisition côté clients du mois ÷ nouveaux clients du mois (première réservation)",
      en: "client-side acquisition spend in the month ÷ new clients in the month (first booking)",
    },
    inputs: {
      numerator: { fr: "Dépense d'acquisition des clients en {month}", en: "Client acquisition spend in {month}" },
      denominator: { fr: "Nouveaux clients en {month}", en: "New clients in {month}" },
    },
    where: [
      {
        source: tool("google-ads"),
        label: { fr: "Google Ads, Meta Ads Manager", en: "Google Ads, Meta Ads Manager" },
        path: {
          fr: "le montant dépensé en {month} pour les campagnes qui visent les clients",
          en: "the amount spent in {month} on the campaigns aimed at clients",
        },
      },
      {
        source: role("finance"),
        label: { fr: "Finance", en: "Finance" },
        path: {
          fr: "les salaires et les outils des équipes marketing, pour les variantes « + équipe » et « tout chargé »",
          en: "marketing salaries and tools, for the \"+ team\" and \"fully loaded\" variants",
        },
      },
      {
        source: tool("product-db"),
        label: { fr: "Base de réservations", en: "Bookings database" },
        path: {
          fr: "les clients dont la première réservation a eu lieu en {month}",
          en: "the clients whose first booking was in {month}",
        },
      },
    ],
    trap: {
      fr: "La dépense pour recruter des prestataires n'entre pas ici : elle a son propre chiffre. Un nouveau client est quelqu'un qui réserve pour la première fois, pas quelqu'un qui s'inscrit.",
      en: "Spend to recruit providers doesn't belong here: it has its own number. A new client is someone who books for the first time, not someone who signs up.",
    },
    request: {
      fr: "la dépense d'acquisition côté clients en {month} ({variant}) et le nombre de nouveaux clients du même mois",
      en: "the client-side acquisition spend in {month} ({variant}) and the number of new clients that same month",
    },
    noReferenceReason: {
      fr: "il se juge contre ce qu'un client rapporte (payback, LTV:CAC), pas dans l'absolu",
      en: "it is judged against what a client brings in (payback, LTV:CAC), not in absolute terms",
    },
  },
  "mkt.sell.cac": {
    name: { fr: "Coût d'un prestataire actif", en: "Cost per active provider" },
    oneLiner: {
      fr: "Ce que coûte, en moyenne, un prestataire qui reçoit sa première réservation.",
      en: "What a provider who receives a first booking costs, on average.",
    },
    formula: {
      fr: "dépense pour recruter des prestataires du mois ÷ prestataires qui ont reçu leur première réservation dans le mois",
      en: "spend to recruit providers in the month ÷ providers who received their first booking in the month",
    },
    inputs: {
      denominator: { fr: "Nouveaux prestataires actifs en {month}", en: "New active providers in {month}" },
    },
    where: [
      {
        source: tool("hubspot"),
        label: { fr: "HubSpot ou ton CRM", en: "HubSpot or your CRM" },
        path: {
          fr: "les prestataires recrutés par l'équipe et le temps passé, si l'offre se recrute à la main",
          en: "the providers recruited by the team and the time spent, if supply is recruited by hand",
        },
      },
      {
        source: tool("spreadsheet"),
        label: { fr: "Finance", en: "Finance" },
        path: {
          fr: "les salaires de l'équipe offre et les campagnes qui visent les prestataires",
          en: "the supply team's salaries and the campaigns aimed at providers",
        },
      },
    ],
    trap: {
      fr: "Il se lit à côté du CAC client, jamais contre lui : les deux côtés ne se remplacent pas.",
      en: "It is read next to the client CAC, never against it: one side doesn't replace the other.",
    },
    request: {
      fr: "la dépense pour recruter des prestataires en {month} ({variant}) et le nombre de prestataires qui ont reçu leur première réservation ce mois-là",
      en: "the spend to recruit providers in {month} ({variant}) and the number of providers who received their first booking that month",
    },
    noReferenceReason: {
      fr: "il se juge contre ce que rapporte un prestataire abonné, quand tes prestataires paient un abonnement ; sinon, il se suit sans se rembourser",
      en: "it is judged against what a paid provider brings in, when your providers pay a subscription; otherwise it is followed without being paid back",
    },
  },
  "mkt.sell.signup-rate": {
    name: { fr: "Taux d'inscription des prestataires", en: "Provider sign-up rate" },
    oneLiner: {
      fr: "La part des visiteurs de ta page prestataires qui créent un compte prestataire.",
      en: "The share of your provider page's visitors who create a provider account.",
    },
    formula: {
      fr: "comptes prestataires créés dans le mois ÷ visiteurs uniques de la page prestataires du mois",
      en: "provider accounts created in the month ÷ unique visitors to the provider page in the month",
    },
    inputs: {
      numerator: { fr: "Prestataires inscrits en {month}", en: "Provider sign-ups in {month}" },
      denominator: { fr: "Visiteurs de la page prestataires en {month}", en: "Provider page visitors in {month}" },
    },
    where: [
      {
        source: tool("ga4"),
        label: { fr: "GA4", en: "GA4" },
        path: {
          fr: "les visiteurs uniques de ta page pour devenir prestataire, et l'événement de création d'un compte prestataire, sur le mois",
          en: "the unique visitors to your become-a-provider page, and the provider account creation event, over the month",
        },
      },
      {
        source: tool("product-db"),
        label: { fr: "Base produit", en: "Product database" },
        path: {
          fr: "les comptes prestataires créés sur le mois",
          en: "the provider accounts created in the month",
        },
      },
    ],
    trap: {
      fr: "Sans page à part pour les prestataires, divise par tous les visiteurs du mois et écris-le : le taux sera bas, mais comparable d'un mois à l'autre.",
      en: "With no separate page for providers, divide by all the month's visitors and write it down: the rate will be low, but comparable month to month.",
    },
    request: {
      fr: "le nombre de visiteurs de la page prestataires et le nombre de comptes prestataires créés en {month}",
      en: "the number of provider page visitors and of provider accounts created in {month}",
    },
    noReferenceReason: {
      fr: "il dépend de ce que tu offres aux prestataires et de l'endroit où tu les recrutes ; suis-le contre ta propre cible",
      en: "it depends on what you offer providers and where you recruit them; follow it against your own target",
    },
  },
  "mkt.buy.first-order": {
    name: { fr: "Première réservation", en: "First booking" },
    oneLiner: {
      fr: "La part des inscrits qui font une première réservation à temps.",
      en: "The share of sign-ups who make a first booking in time.",
    },
    formula: {
      fr: "inscrits clients de la cohorte ayant fait une première réservation sous {n} jours ÷ inscrits clients de la cohorte",
      en: "cohort client sign-ups who made a first booking within {n} days ÷ cohort client sign-ups",
    },
    inputs: {
      numerator: { fr: "Première réservation sous {n} jours", en: "First booking within {n} days" },
      denominator: { fr: "Inscrits clients en {cohort}", en: "Client sign-ups from {cohort}" },
    },
    where: [
      {
        source: tool("product-db"),
        label: { fr: "Base de réservations", en: "Bookings database" },
        path: {
          fr: "les inscrits en {cohort} et la date de leur première réservation payée",
          en: "the sign-ups from {cohort} and the date of their first paid booking",
        },
      },
      {
        source: tool("amplitude"),
        label: { fr: "Amplitude ou Mixpanel", en: "Amplitude or Mixpanel" },
        path: {
          fr: "un entonnoir inscription puis réservation payée, avec une fenêtre de conversion de {n} jours",
          en: "a funnel from sign-up to paid booking, with a conversion window of {n} days",
        },
      },
    ],
    // Written out: the lexicon would read « pas un panier » as « pas un montant de la réservation », which says something else. A services marketplace has no basket; the unpaid state is the request sent, which the sentence names next.
    trap: {
      fr: "Compte une réservation payée, pas une demande envoyée. Une réservation annulée ou remboursée en entier ne compte pas.",
      en: "Count a paid booking, not a request sent. A booking cancelled or refunded in full doesn't count.",
    },
    request: {
      fr: "pour les inscrits clients en {cohort}, combien ont fait une première réservation payée sous {n} jours, et combien d'inscrits au total",
      en: "for the client sign-ups from {cohort}, how many made a first paid booking within {n} days, and how many sign-ups in total",
    },
  },
  "mkt.sell.first-sale": {
    name: { fr: "Première réservation reçue", en: "First booking received" },
    oneLiner: {
      fr: "La part des prestataires inscrits qui reçoivent une première réservation à temps.",
      en: "The share of provider sign-ups who receive a first booking in time.",
    },
    formula: {
      fr: "prestataires inscrits de la cohorte ayant reçu une première réservation sous {n} jours ÷ prestataires inscrits de la cohorte",
      en: "cohort provider sign-ups who received a first booking within {n} days ÷ cohort provider sign-ups",
    },
    inputs: {
      numerator: { fr: "Première réservation reçue sous {n} jours", en: "First booking received within {n} days" },
      denominator: { fr: "Prestataires inscrits en {cohort}", en: "Provider sign-ups from {cohort}" },
    },
    where: [
      {
        source: tool("product-db"),
        label: { fr: "Base produit", en: "Product database" },
        path: {
          fr: "les prestataires inscrits en {cohort} et la date de leur première réservation reçue payée",
          en: "the providers who signed up in {cohort} and the date of their first paid booking received",
        },
      },
    ],
    trap: {
      fr: "Un prestataire qui publie sans être réservé n'est pas activé : c'est la réservation reçue qui compte, pas le profil.",
      en: "A provider who lists without getting booked isn't activated: the booking received counts, not the profile.",
    },
    request: {
      fr: "pour les prestataires inscrits en {cohort}, combien ont reçu une première réservation payée sous {n} jours, et combien de prestataires inscrits au total",
      en: "for the providers who signed up in {cohort}, how many received a first paid booking within {n} days, and how many provider sign-ups in total",
    },
  },
  "mkt.liq.fill-rate": {
    oneLiner: {
      fr: "La part des demandes qui trouvent une offre et aboutissent à une réservation.",
      en: "The share of requests that find supply and end in a booking.",
    },
    formula: {
      fr: "demandes qui aboutissent à une réservation ÷ demandes du mois ({variant})",
      en: "requests that end in a booking ÷ requests in the month ({variant})",
    },
    where: [
      {
        source: tool("product-db"),
        label: { fr: "Base produit", en: "Product database" },
        path: {
          fr: "les demandes, réservations ou missions publiées en {month}, et celles qui ont abouti à une réservation",
          en: "the requests, bookings or jobs posted in {month}, and those that ended in a booking",
        },
      },
      {
        source: tool("amplitude"),
        label: { fr: "Amplitude ou Mixpanel", en: "Amplitude or Mixpanel" },
        path: {
          fr: "les sessions avec une recherche et une fiche consultée, et celles qui se terminent par une réservation",
          en: "the sessions with a search and a profile viewed, and those that end in a booking",
        },
      },
    ],
    trap: {
      fr: "Écris ce qu'est une demande. Avec des recherches, ne compte que celles où quelqu'un a regardé un profil : une recherche vide n'est pas une demande.",
      en: "Write down what a request is. With searches, only count those where someone looked at a profile: an empty search isn't a request.",
    },
    request: {
      fr: "le nombre de demandes en {month} ({variant}) et le nombre de celles qui ont abouti à une réservation",
      en: "the number of requests in {month} ({variant}) and how many ended in a booking",
    },
    variants: [
      { id: "requests", label: { fr: "Demandes envoyées : réservation, devis…", en: "Requests sent: booking, quote…" } },
      { id: "searches", label: { fr: "Recherches avec un profil consulté", en: "Searches with a profile viewed" } },
    ],
  },
  "mkt.buy.repeat": {
    name: { fr: "Deuxième réservation", en: "Second booking" },
    oneLiner: {
      fr: "La part des inscrits qui reviennent réserver une deuxième fois à temps.",
      en: "The share of sign-ups who come back for a second booking in time.",
    },
    formula: {
      fr: "inscrits clients de la cohorte ayant fait au moins deux réservations sous {n} jours ÷ inscrits clients de la cohorte",
      en: "cohort client sign-ups who made at least two bookings within {n} days ÷ cohort client sign-ups",
    },
    inputs: {
      numerator: { fr: "Deux réservations sous {n} jours", en: "Two bookings within {n} days" },
      denominator: { fr: "Inscrits clients en {cohort}", en: "Client sign-ups from {cohort}" },
    },
    where: [
      {
        source: tool("product-db"),
        label: { fr: "Base de réservations", en: "Bookings database" },
        path: {
          fr: "les inscrits en {cohort} qui ont au moins deux réservations payées dans les {n} jours qui suivent leur inscription",
          en: "the sign-ups from {cohort} with at least two paid bookings in the {n} days after signing up",
        },
      },
      {
        source: tool("amplitude"),
        label: { fr: "Amplitude", en: "Amplitude" },
        path: {
          fr: "un graphique Retention Analysis, retour une réservation payée, lu sur {n} jours",
          en: "a Retention Analysis chart, return event a paid booking, read over {n} days",
        },
      },
    ],
    trap: {
      fr: "La fenêtre court depuis l'inscription, pas depuis la première réservation : c'est ce qui garde les deux colonnes sur les mêmes 100 inscrits.",
      en: "The window runs from sign-up, not from the first booking: that is what keeps both columns on the same 100 sign-ups.",
    },
    request: {
      fr: "pour les inscrits clients en {cohort}, combien ont fait au moins deux réservations payées sous {n} jours, et combien d'inscrits au total",
      en: "for the client sign-ups from {cohort}, how many made at least two paid bookings within {n} days, and how many sign-ups in total",
    },
    noReferenceReason: {
      fr: "la fréquence de réservation d'une catégorie à l'autre va de la semaine à l'année ; compare-toi à toi-même",
      en: "booking frequency ranges from weekly to yearly across categories; compare with yourself",
    },
  },
  "mkt.buy.churn": {
    name: { fr: "Churn mensuel des clients", en: "Monthly client churn" },
    oneLiner: {
      fr: "La part des clients actifs qui cessent de l'être dans le mois.",
      en: "The share of active clients who stop being active in the month.",
    },
    formula: {
      fr: "clients sortis des actifs dans le mois ÷ clients actifs au 1er du mois (actif : au moins une réservation sur les 12 derniers mois)",
      en: "clients who left the active base in the month ÷ active clients at the start of the month (active: at least one booking in 12 months)",
    },
    inputs: {
      numerator: { fr: "Clients sortis en {month}", en: "Clients who left in {month}" },
      denominator: { fr: "Clients actifs au 1er {month}", en: "Active clients at the start of {month}" },
    },
    where: [
      {
        source: tool("product-db"),
        label: { fr: "Base de réservations", en: "Bookings database" },
        path: {
          fr: "les clients actifs au 1er {month} dont la dernière réservation atteint ses 12 mois pendant le mois sans nouvelle réservation",
          en: "the clients active at the start of {month} whose last booking turns 12 months old during the month with no new booking",
        },
      },
    ],
    trap: {
      fr: "Sans liste des départs, déduis-le : actifs au 1er + nouveaux clients – actifs à fin de mois, divisé par les actifs au 1er. Un client revenu après un an compte comme resté.",
      en: "Without a list of who left, derive it: active at the start + new clients – active at month end, divided by active at the start. A client back after a year counts as kept.",
    },
    request: {
      fr: "le nombre de clients actifs (au moins une réservation sur 12 mois) au 1er {month}, et le nombre de ceux qui ne l'étaient plus à la fin du mois",
      en: "the number of active clients (at least one booking in 12 months) at the start of {month}, and how many were no longer active at month end",
    },
    noReferenceReason: {
      fr: "il dépend de la fréquence de réservation de ta catégorie ; suis-le contre ta propre cible",
      en: "it depends on how often your category books; follow it against your own target",
    },
  },
  "mkt.sell.churn": {
    name: { fr: "Churn mensuel des prestataires", en: "Monthly provider churn" },
    oneLiner: {
      fr: "La part des prestataires actifs qui cessent de l'être dans le mois.",
      en: "The share of active providers who stop being active in the month.",
    },
    formula: {
      fr: "prestataires sortis des actifs dans le mois ÷ prestataires actifs au 1er du mois (actif : réservé au moins une fois en 12 mois)",
      en: "providers who left the active base in the month ÷ active providers at the start of the month (active: booked at least once in 12 months)",
    },
    inputs: {
      numerator: { fr: "Prestataires sortis en {month}", en: "Providers who left in {month}" },
      denominator: { fr: "Prestataires actifs au 1er {month}", en: "Active providers at the start of {month}" },
    },
    where: [
      {
        source: tool("product-db"),
        label: { fr: "Base produit", en: "Product database" },
        path: {
          fr: "les prestataires actifs au 1er {month} et ceux dont la dernière réservation reçue atteint ses 12 mois sans nouvelle réservation reçue",
          en: "the providers active at the start of {month} and those whose last booking received turns 12 months old with no new booking received",
        },
      },
    ],
    trap: {
      fr: "Un prestataire qui ferme son compte et un prestataire qui ne reçoit plus de réservation partent tous les deux : compte les deux.",
      en: "A provider who closes their account and a provider who no longer gets booked both leave: count both.",
    },
    request: {
      fr: "le nombre de prestataires actifs au 1er {month}, et le nombre de ceux qui ne l'étaient plus à la fin du mois",
      en: "the number of active providers at the start of {month}, and how many were no longer active at month end",
    },
    noReferenceReason: {
      fr: "il dépend de la fréquence de réservation de ta catégorie ; suis-le contre ta propre cible",
      en: "it depends on how often your category books; follow it against your own target",
    },
  },
  "mkt.sell.paid-churn": {
    name: { fr: "Churn mensuel des prestataires abonnés", en: "Monthly paid provider churn" },
    oneLiner: {
      fr: "La part des prestataires abonnés qui arrêtent leur abonnement dans le mois.",
      en: "The share of paid providers who end their subscription in the month.",
    },
    formula: {
      fr: "prestataires abonnés perdus dans le mois ÷ prestataires abonnés au 1er du mois",
      en: "paid providers lost in the month ÷ paid providers at the start of the month",
    },
    inputs: {
      numerator: { fr: "Abonnés perdus en {month}", en: "Paid providers lost in {month}" },
      denominator: { fr: "Prestataires abonnés au 1er {month}", en: "Paid providers at the start of {month}" },
    },
    where: [
      {
        source: tool("stripe"),
        label: { fr: "Stripe Billing", en: "Stripe Billing" },
        path: {
          fr: "les abonnements prestataires annulés dans le mois, et les abonnés au 1er",
          en: "the provider subscriptions cancelled in the month, and the subscribers at the start",
        },
      },
      {
        source: tool("product-db"),
        label: { fr: "Base produit", en: "Product database" },
        path: {
          fr: "les abonnements prestataires actifs au 1er {month} et ceux qui ne l'étaient plus à la fin",
          en: "the provider subscriptions active at the start of {month} and those no longer active at the end",
        },
      },
    ],
    trap: {
      fr: "Un prestataire qui arrête son abonnement mais reçoit encore des réservations n'a pas quitté la place de marché : il compte ici, pas dans le churn des prestataires.",
      en: "A provider who ends their subscription but still gets booked hasn't left the marketplace: they count here, not in provider churn.",
    },
    request: {
      fr: "le nombre de prestataires abonnés au 1er {month} et le nombre de ceux qui ont arrêté leur abonnement pendant le mois",
      en: "the number of paid providers at the start of {month} and how many ended their subscription during the month",
    },
  },
  "mkt.buy.referred-share": {
    name: { fr: "Part des clients recommandés", en: "Referred client share" },
    oneLiner: {
      fr: "La part des inscrits clients amenés par un utilisateur.",
      en: "The share of client sign-ups brought in by a user.",
    },
    formula: {
      fr: "inscrits clients via un utilisateur (parrainage, lien partagé, « comment nous avez-vous connus ? ») ÷ inscrits clients de la cohorte",
      en: "client sign-ups who came through a user (referral, shared link, \"how did you hear about us?\") ÷ cohort client sign-ups",
    },
    inputs: {
      numerator: { fr: "Inscrits clients recommandés", en: "Referred client sign-ups" },
      denominator: { fr: "Inscrits clients en {cohort}", en: "Client sign-ups from {cohort}" },
    },
    where: [
      {
        source: tool("product-db"),
        label: { fr: "Outil de parrainage ou base produit", en: "Referral tool or product database" },
        path: {
          fr: "les inscrits en {cohort} qui ont un parrain, un code ou un lien partagé par un prestataire ou un client",
          en: "the sign-ups from {cohort} with a referrer, a code or a link shared by a provider or a client",
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
      fr: "Un prestataire qui partage son profil amène des clients : c'est de la recommandation, compte-la. La source « referral » de GA4 n'en est pas.",
      en: "A provider who shares their profile brings clients: that is referral, count it. GA4's \"referral\" source isn't.",
    },
    request: {
      fr: "pour les inscrits clients en {cohort}, combien sont arrivés par un parrainage, un lien partagé ou une recommandation déclarée",
      en: "for the client sign-ups from {cohort}, how many came through a referral, a shared link or a stated recommendation",
    },
  },
  "mkt.rev.take-rate": {
    where: [
      {
        source: tool("stripe"),
        label: { fr: "Stripe Connect", en: "Stripe Connect" },
        path: {
          fr: "le volume des paiements du mois et les frais que la plateforme a prélevés",
          en: "the month's payment volume and the fees the platform collected",
        },
      },
      {
        source: tool("spreadsheet"),
        label: { fr: "Finance", en: "Finance" },
        path: {
          fr: "le chiffre d'affaires de commissions du mois et le volume qui l'a produit",
          en: "the month's commission revenue and the volume that produced it",
        },
      },
      {
        source: tool("product-db"),
        label: { fr: "Base de réservations", en: "Bookings database" },
        path: {
          fr: "la somme des réservations payées du mois et la commission de chacune",
          en: "the sum of the month's paid bookings and each one's commission",
        },
      },
    ],
    trap: {
      fr: "Écris ce que ton GMV compte (livraison, taxes). Un remboursement retire sa réservation des deux côtés. Les abonnements des prestataires ont leur propre chiffre.",
      en: "Write down what your GMV counts (shipping, taxes). A refund takes its booking off both sides. Provider subscriptions have their own number.",
    },
  },
  "mkt.rev.aov": {
    name: { fr: "Montant moyen d'une réservation", en: "Average booking value" },
    oneLiner: {
      fr: "Ce que vaut, en moyenne, une réservation.",
      en: "What a booking is worth, on average.",
    },
    formula: {
      fr: "volume d'affaires du mois ÷ réservations du mois",
      en: "gross merchandise value in the month ÷ bookings in the month",
    },
    inputs: {
      denominator: { fr: "Réservations en {month}", en: "Bookings in {month}" },
    },
    where: [
      {
        source: tool("product-db"),
        label: { fr: "Base de réservations", en: "Bookings database" },
        path: {
          fr: "la somme et le nombre des réservations payées du mois",
          en: "the sum and the number of the month's paid bookings",
        },
      },
      {
        source: tool("stripe"),
        label: { fr: "Stripe Connect", en: "Stripe Connect" },
        path: {
          fr: "le volume et le nombre des paiements du mois",
          en: "the month's payment volume and count",
        },
      },
    ],
    request: {
      fr: "le volume d'affaires (GMV) et le nombre de réservations payées en {month}",
      en: "the gross merchandise value (GMV) and the number of paid bookings in {month}",
    },
    noReferenceReason: {
      fr: "il dépend entièrement de ce qui est réservé chez toi",
      en: "it depends entirely on what gets booked on your marketplace",
    },
  },
  "mkt.rev.frequency": {
    name: { fr: "Fréquence de réservation", en: "Booking frequency" },
    oneLiner: {
      fr: "Le nombre moyen de réservations d'un client actif dans le mois.",
      en: "The average number of bookings an active client makes in the month.",
    },
    formula: {
      fr: "réservations du mois ÷ clients actifs à fin de mois (actif : au moins une réservation sur 12 mois)",
      en: "bookings in the month ÷ active clients at month end (active: at least one booking in 12 months)",
    },
    inputs: {
      numerator: { fr: "Réservations en {month}", en: "Bookings in {month}" },
      denominator: { fr: "Clients actifs à fin {month}", en: "Active clients at the end of {month}" },
    },
    where: [
      {
        source: tool("product-db"),
        label: { fr: "Base de réservations", en: "Bookings database" },
        path: {
          fr: "le nombre de réservations payées du mois, et le nombre de clients avec au moins une réservation sur les 12 derniers mois à la fin du mois",
          en: "the number of paid bookings in the month, and the number of clients with at least one booking in the last 12 months at month end",
        },
      },
    ],
    trap: {
      fr: "Elle se lit sur les clients actifs sur 12 mois, pas sur ceux du mois : 0,3 veut dire qu'un client actif réserve à peu près une fois tous les trois mois.",
      en: "It is read on clients active over 12 months, not on the month's: 0.3 means an active client books about once every three months.",
    },
    request: {
      fr: "le nombre de réservations payées en {month} et le nombre de clients actifs (au moins une réservation sur 12 mois) à la fin du mois",
      en: "the number of paid bookings in {month} and the number of active clients (at least one booking in 12 months) at month end",
    },
    noReferenceReason: {
      fr: "la fréquence de réservation d'une catégorie à l'autre va de la semaine à l'année ; compare-toi à toi-même",
      en: "booking frequency ranges from weekly to yearly across categories; compare with yourself",
    },
  },
  "mkt.rev.gross-margin": {
    oneLiner: {
      fr: "Ce qu'il reste du revenu net après le coût direct de chaque réservation.",
      en: "What is left of net revenue after the direct cost of each booking.",
    },
    formula: {
      fr: "(revenu net – coûts directs : frais de paiement, assurance, support des réservations, remboursements à ta charge) ÷ revenu net",
      en: "(net revenue – direct costs: payment fees, insurance, booking support, refunds you bear) ÷ net revenue",
    },
    where: [
      {
        source: role("finance"),
        label: { fr: "Finance", en: "Finance" },
        path: {
          fr: "le compte de résultat du dernier trimestre clos : le revenu net, puis les coûts directs des réservations",
          en: "the income statement of the last closed quarter: net revenue, then the direct cost of bookings",
        },
      },
    ],
  },
  "mkt.sell.paid-conversion": {
    name: { fr: "Conversion en prestataire abonné", en: "Provider subscription conversion" },
    oneLiner: {
      fr: "La part des prestataires inscrits qui prennent un abonnement à temps.",
      en: "The share of provider sign-ups who take a subscription in time.",
    },
    formula: {
      fr: "prestataires inscrits de la cohorte abonnés sous {n} jours ÷ prestataires inscrits de la cohorte",
      en: "cohort provider sign-ups subscribed within {n} days ÷ cohort provider sign-ups",
    },
    inputs: {
      denominator: { fr: "Prestataires inscrits en {cohort}", en: "Provider sign-ups from {cohort}" },
    },
    where: [
      {
        source: tool("stripe"),
        label: { fr: "Stripe Billing", en: "Stripe Billing" },
        path: {
          fr: "les premiers paiements d'abonnement des prestataires inscrits en {cohort}, sous {n} jours",
          en: "the first subscription payments of the providers who signed up in {cohort}, within {n} days",
        },
      },
      {
        source: tool("product-db"),
        label: { fr: "Base produit", en: "Product database" },
        path: {
          fr: "les prestataires inscrits en {cohort} et la date de leur premier paiement d'abonnement",
          en: "the providers who signed up in {cohort} and the date of their first subscription payment",
        },
      },
    ],
    // Written out (English only): the lexicon would give "the first booking received's", which does not read. The French is the lexicon's.
    trap: {
      fr: "Un essai gratuit n'est pas un abonnement : compte le premier paiement. La fenêtre est celle de la première réservation reçue : les deux se lisent sur les mêmes prestataires inscrits.",
      en: "A free trial isn't a subscription: count the first payment. The window is that of the first booking received: both are read on the same provider sign-ups.",
    },
    request: {
      fr: "pour les prestataires inscrits en {cohort}, combien ont payé un premier abonnement sous {n} jours, et combien de prestataires inscrits au total",
      en: "for the providers who signed up in {cohort}, how many paid a first subscription within {n} days, and how many provider sign-ups in total",
    },
    noReferenceReason: {
      fr: "elle dépend de ce que l'abonnement apporte au prestataire ; compare-toi à toi-même",
      en: "it depends on what the subscription gives the provider; compare with yourself",
    },
  },
  "mkt.sell.arpa": {
    name: { fr: "Revenu mensuel par prestataire abonné", en: "Monthly revenue per paid provider" },
    oneLiner: {
      fr: "Ce que paie en moyenne un prestataire abonné, par mois.",
      en: "What a paid provider pays on average, per month.",
    },
    formula: {
      fr: "MRR des abonnements prestataires ÷ prestataires abonnés",
      en: "providers' subscription MRR ÷ paid providers",
    },
    inputs: {
      numerator: { fr: "MRR prestataires à fin {month}", en: "Provider MRR at the end of {month}" },
      denominator: { fr: "Prestataires abonnés à fin {month}", en: "Paid providers at the end of {month}" },
    },
    where: [
      {
        source: tool("stripe"),
        label: { fr: "Stripe Billing", en: "Stripe Billing" },
        path: {
          fr: "le MRR et les abonnés actifs, filtrés sur les produits d'abonnement des prestataires",
          en: "MRR and active subscribers, filtered to the providers' subscription products",
        },
      },
      {
        source: tool("product-db"),
        label: { fr: "Base produit", en: "Product database" },
        path: {
          fr: "les abonnements prestataires actifs à fin {month} et leur prix mensuel",
          en: "the active provider subscriptions at the end of {month} and their monthly price",
        },
      },
    ],
    request: {
      fr: "le MRR des abonnements prestataires à fin {month} et le nombre de prestataires abonnés à la même date",
      en: "the providers' subscription MRR at the end of {month} and the number of paid providers on the same date",
    },
  },
  "mkt.sell.gross-margin": {
    name: { fr: "Marge sur les abonnements prestataires", en: "Margin on provider subscriptions" },
    oneLiner: {
      fr: "Ce qu'il reste des abonnements des prestataires après ce qu'ils coûtent à servir.",
      en: "What is left of the providers' subscriptions after what they cost to serve.",
    },
    formula: {
      fr: "(MRR prestataires – coûts directs : outils fournis aux prestataires, support, frais de paiement) ÷ MRR prestataires",
      en: "(provider MRR – direct costs: tools provided to providers, support, payment fees) ÷ provider MRR",
    },
    inputs: {
      denominator: { fr: "MRR prestataires à fin {month}", en: "Provider MRR at the end of {month}" },
    },
    where: [
      {
        source: role("finance"),
        label: { fr: "Finance", en: "Finance" },
        path: {
          fr: "le compte de résultat du dernier trimestre clos : le chiffre d'affaires des abonnements prestataires, puis leurs coûts directs",
          en: "the income statement of the last closed quarter: the provider subscription revenue, then its direct costs",
        },
      },
    ],
    trap: {
      fr: "Ce n'est pas la marge des commissions : un abonnement coûte peu à servir, une réservation coûte ses frais de paiement. Chaque flux a sa marge.",
      en: "This isn't the commissions' margin: a subscription costs little to serve, a booking costs its payment fees. Each stream has its own margin.",
    },
    request: {
      fr: "la marge sur les abonnements prestataires du dernier trimestre clos, et ce que ses coûts directs comprennent",
      en: "the margin on provider subscriptions of the last closed quarter, and what its direct costs include",
    },
    // Written out: « vendu » and "sold" are here the ordinary word for software, not a sale of the marketplace, so « réservé » would be wrong. « proposé » / "offered" keeps the sense.
    noReferenceReason: {
      fr: "les repères de marge publiés portent sur le logiciel proposé seul, pas sur l'abonnement d'une place de marché",
      en: "the published margin references are for software offered on its own, not for a marketplace's subscription",
    },
  },
};

export const ENGINE_DERIVED_CATALOG_MKT_SERVICES: Record<MktDerivedId, DeepPartialTranslatable<EngineDerivedEntry>> = {
  "mkt.rev.ltv": {
    name: { fr: "LTV client", en: "Client LTV" },
    formula: {
      fr: "fréquence × montant moyen d'une réservation × commission × marge × durée de vie (1 ÷ churn mensuel des clients, au plus 36 mois)",
      en: "frequency × average booking value × take rate × margin × lifetime (1 ÷ monthly client churn, at most 36 months)",
    },
  },
  "mkt.rev.cac-payback": {
    name: { fr: "CAC payback client", en: "Client CAC payback" },
    formula: {
      fr: "CAC client ÷ (fréquence × montant moyen d'une réservation × commission × marge), en mois",
      en: "client CAC ÷ (frequency × average booking value × take rate × margin), in months",
    },
  },
  "mkt.rev.ltv-cac": {
    name: { fr: "LTV:CAC client", en: "Client LTV:CAC" },
    formula: {
      fr: "LTV client ÷ CAC client",
      en: "client LTV ÷ client CAC",
    },
  },
  "mkt.sell.ltv": {
    name: { fr: "LTV prestataire abonné", en: "Paid provider LTV" },
    formula: {
      fr: "revenu par prestataire abonné × marge × durée de vie (1 ÷ churn mensuel des prestataires abonnés, au plus 36 mois)",
      en: "revenue per paid provider × margin × lifetime (1 ÷ monthly paid provider churn, at most 36 months)",
    },
  },
  "mkt.sell.cac-payback": {
    name: { fr: "Payback d'un prestataire abonné", en: "Paid provider payback" },
    formula: {
      fr: "(coût d'un prestataire actif × première réservation reçue ÷ conversion en abonné) ÷ (revenu par prestataire abonné × marge), en mois",
      en: "(cost per active provider × first booking received ÷ subscription conversion) ÷ (revenue per paid provider × margin), in months",
    },
  },
  "mkt.sell.ltv-cac": {
    name: { fr: "LTV:CAC prestataire abonné", en: "Paid provider LTV:CAC" },
    formula: {
      fr: "LTV prestataire abonné ÷ coût d'un prestataire abonné",
      en: "paid provider LTV ÷ cost per paid provider",
    },
  },
};
