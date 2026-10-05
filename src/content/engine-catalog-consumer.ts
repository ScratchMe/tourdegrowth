// TODO: à relire — copie neuve (convention 6), §21 (A22 APP-2)
import type { EngineCatalogEntry, EngineDerivedEntry } from "./engine-catalog";
import type { PlgMetricId, SourceRef } from "@/lib/engine/types";

/**
 * engine-catalog-consumer.ts — the prose of the fifteen self-serve numbers a consumer app shows, in the app's own
 * words (engine spec §21.4.6, A22 APP-2), and of the two computed figures it keeps from the SaaS (GRR and NRR). Whole
 * entries, not overrides, so every rule `engine-catalog.test.ts` holds for the SaaS catalogue holds for these too
 * (`catalogRules`). The app's own six numbers and four figures are in `engine-catalog.ts`, keyed like the others.
 * Server only, like that file: the page resolves it to one language (`typeCatalogs`) and hands the island plain strings.
 *
 * The writing rules of `engine-catalog.ts` apply unchanged. What the spec says to copy from the SaaS entry is copied
 * as it is; what the app says differently is the spec's text, its French typography set (§23.8).
 */

const tool = (t: Extract<SourceRef, { kind: "tool" }>["tool"]): SourceRef => ({ kind: "tool", tool: t });
const role = (r: Extract<SourceRef, { kind: "person" }>["role"]): SourceRef => ({ kind: "person", role: r });

/** The fifteen self-serve numbers an app shows (§21.1 D2: acq.cac and rev.gross-margin never show). */
export type ConsumerPlgMetricId = Exclude<PlgMetricId, "acq.cac" | "rev.gross-margin">;

export const ENGINE_CATALOG_CONSUMER: Record<ConsumerPlgMetricId, EngineCatalogEntry> = {
  "acq.signup-rate": {
    name: { fr: "Taux d'installation", en: "Install rate" },
    oneLiner: {
      fr: "La part des visiteurs de ta fiche qui installent l'app.",
      en: "The share of your store page's visitors who install the app.",
    },
    formula: {
      fr: "premières installations du mois ÷ visiteurs uniques de ta fiche App Store ou Google Play du mois",
      en: "first-time installs in the month ÷ unique visitors to your App Store or Google Play page in the month",
    },
    inputs: {
      numerator: { fr: "Installations en {month}", en: "Installs in {month}" },
      denominator: { fr: "Visiteurs de la fiche en {month}", en: "Store page visitors in {month}" },
    },
    where: [
      {
        source: tool("app-store-connect"),
        label: { fr: "App Store Connect", en: "App Store Connect" },
        path: {
          fr: "Analytics : la métrique Product Page Views (vues uniques de la fiche) et la métrique First-Time Downloads, sur le mois",
          en: "Analytics: the Product Page Views metric (unique views of your page) and the First-Time Downloads metric, over the month",
        },
      },
      {
        source: tool("play-console"),
        label: { fr: "Google Play Console", en: "Google Play Console" },
        path: {
          fr: "Grow users, Store performance, Conversion analysis : Store listing visitors et Store listing acquisitions sur le mois",
          en: "Grow users, Store performance, Conversion analysis: Store listing visitors and Store listing acquisitions over the month",
        },
      },
      {
        source: tool("appsflyer"),
        label: { fr: "AppsFlyer ou Adjust", en: "AppsFlyer or Adjust" },
        path: {
          fr: "les installations du mois, toutes sources ; les visiteurs de la fiche viennent des stores",
          en: "the month's installs, all sources; store page visitors come from the stores",
        },
      },
    ],
    trap: {
      fr: "La « Conversion Rate » d'App Store Connect porte sur les impressions, pas sur les visiteurs de la fiche. Additionne les deux stores dans les deux comptes, ou fais un moteur par store.",
      en: "App Store Connect's \"Conversion Rate\" is on impressions, not page visitors. Add both stores up in both counts, or keep one engine per store.",
    },
    request: {
      fr: "le nombre de visiteurs uniques de la fiche et le nombre de premières installations en {month}, App Store et Google Play additionnés",
      en: "the number of unique store page visitors and of first-time installs in {month}, App Store and Google Play added up",
    },
    noReferenceReason: {
      fr: "la conversion d'une fiche dépend de la catégorie et de la part de visiteurs venus d'une pub ; suis-la contre ta propre cible",
      en: "a page's conversion depends on the category and on the share of visitors who came from an ad; follow it against your own target",
    },
  },
  "acq.top-channel-share": {
    name: { fr: "Part de la première source", en: "Top source share" },
    oneLiner: {
      fr: "La part de tes installations qui vient de ta source principale.",
      en: "The share of your installs that comes from your main source.",
    },
    formula: {
      fr: "installations venues de la première source ÷ installations du mois",
      en: "installs from the top source ÷ installs in the month",
    },
    inputs: {
      numerator: { fr: "Installations de la première source", en: "Installs from the top source" },
      denominator: { fr: "Installations en {month}", en: "Installs in {month}" },
    },
    where: [
      {
        source: tool("app-store-connect"),
        label: { fr: "App Store Connect", en: "App Store Connect" },
        path: {
          fr: "Analytics : First-Time Downloads ventilées par type de source (recherche dans l'App Store, navigation, référent web, référent app)",
          en: "Analytics: First-Time Downloads broken down by source type (App Store search, browse, web referrer, app referrer)",
        },
      },
      {
        source: tool("play-console"),
        label: { fr: "Google Play Console", en: "Google Play Console" },
        path: {
          fr: "Conversion analysis, filtrée par source de trafic",
          en: "Conversion analysis, filtered by traffic source",
        },
      },
      {
        source: tool("appsflyer"),
        label: { fr: "AppsFlyer ou Adjust", en: "AppsFlyer or Adjust" },
        path: {
          fr: "les installations du mois par media source, organiques compris",
          en: "the month's installs by media source, organic included",
        },
      },
    ],
    trap: {
      fr: "Quelqu'un qui voit une pub puis cherche l'app compte en « recherche ». Sur iOS, les pubs s'attribuent par un cadre d'Apple agrégé et en retard : lis les sources payantes dans ton outil d'attribution.",
      en: "Someone who sees an ad then searches for the app counts as \"search\". On iOS, ads are attributed through an aggregated, delayed Apple framework: read paid sources in your attribution tool.",
    },
    request: {
      fr: "le nombre d'installations en {month}, ventilé par source",
      en: "the number of installs in {month}, broken down by source",
    },
    noReferenceReason: {
      fr: "aucun seuil de dépendance à un canal n'est publiable ; la part et le nom du canal suffisent à ouvrir la discussion",
      en: "no threshold of dependence on one channel is worth publishing; the share and the channel's name are enough to open the discussion",
    },
  },
  "act.event": {
    name: { fr: "Événement d'activation", en: "Activation event" },
    oneLiner: {
      fr: "L'action qui montre qu'une installation devient un usage.",
      en: "The action that shows an install has turned into use.",
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
      fr: "Ouvrir l'app n'est pas un moment de valeur. Celui qui compte distingue les installations qui restent de celles qui partent : une première séance terminée, un premier contenu créé.",
      en: "Opening the app isn't a moment of value. The one that counts separates the installs that stay from those that leave: a first session completed, a first piece of content created.",
    },
    request: {
      fr: "le nom de l'action qui marque la première valeur, et le nombre de jours qu'on laisse pour la faire",
      en: "the name of the action that marks first value, and the number of days allowed to do it",
    },
  },
  "act.rate": {
    name: { fr: "Taux d'activation", en: "Activation rate" },
    oneLiner: {
      fr: "La part des installations qui atteignent la première valeur à temps.",
      en: "The share of installs that reach first value in time.",
    },
    formula: {
      fr: "installations de la cohorte ayant déclenché {event} sous {n} jours ÷ installations de la cohorte",
      en: "cohort installs that triggered {event} within {n} days ÷ cohort installs",
    },
    inputs: {
      numerator: { fr: "Activées sous {n} jours", en: "Activated within {n} days" },
      denominator: { fr: "Installations en {cohort}", en: "Installs from {cohort}" },
    },
    where: [
      {
        source: tool("ga4"),
        label: { fr: "GA4 (Firebase)", en: "GA4 (Firebase)" },
        path: {
          fr: "une exploration de l'entonnoir (onglet Explorer) : first_open puis {event}, sous {n} jours",
          en: "a funnel exploration (Explore tab): first_open then {event}, within {n} days",
        },
      },
      {
        source: tool("amplitude"),
        label: { fr: "Amplitude", en: "Amplitude" },
        path: {
          fr: "un graphique Funnel Analysis : première ouverture puis {event}, fenêtre de conversion de {n} jours",
          en: "a Funnel Analysis chart: first open then {event}, {n}-day conversion window",
        },
      },
      {
        source: tool("mixpanel"),
        label: { fr: "Mixpanel", en: "Mixpanel" },
        path: {
          fr: "un entonnoir première ouverture puis {event}, avec une fenêtre de conversion de {n} jours",
          en: "a funnel from first open to {event}, with a conversion window of {n} days",
        },
      },
    ],
    trap: {
      fr: "Sans compte, l'app compte des appareils : une personne qui réinstalle ou change de téléphone compte deux fois. Écris-le dans ta définition.",
      en: "Without accounts, the app counts devices: someone who reinstalls or changes phones counts twice. Write it in your definition.",
    },
    request: {
      fr: "pour les installations en {cohort}, combien ont déclenché {event} sous {n} jours, et combien d'installations au total",
      en: "for the installs from {cohort}, how many triggered {event} within {n} days, and how many installs in total",
    },
    noReferenceReason: {
      fr: "les ordres de grandeur publiés portent sur l'onboarding SaaS ; suis ce taux contre ta propre cible",
      en: "the published orders of magnitude are for SaaS onboarding; follow this rate against your own target",
    },
  },
  "act.ttv": {
    name: { fr: "Time-to-value médian", en: "Median time to value" },
    oneLiner: {
      fr: "Le temps qu'il faut à une installation pour atteindre la première valeur.",
      en: "How long an install takes to reach first value.",
    },
    formula: {
      fr: "médiane du délai entre la première ouverture et {event}",
      en: "median time between first open and {event}",
    },
    where: [
      {
        source: tool("ga4"),
        label: { fr: "GA4 (Firebase)", en: "GA4 (Firebase)" },
        path: {
          fr: "pas de médiane dans les rapports standards : à demander à la data, depuis l'export des événements",
          en: "no median in the standard reports: ask the data team, from the event export",
        },
      },
      {
        source: tool("amplitude"),
        label: { fr: "Amplitude ou Mixpanel", en: "Amplitude or Mixpanel" },
        path: {
          fr: "l'entonnoir première ouverture puis {event}, affiché en temps de conversion",
          en: "the first open then {event} funnel, shown as time to convert",
        },
      },
    ],
    trap: {
      fr: "Une moyenne baisse quand les traînards abandonnent, et ressemble alors à un progrès. Prends la médiane.",
      en: "An average drops when stragglers give up, and then looks like progress. Use the median.",
    },
    request: {
      fr: "le délai médian entre la première ouverture et {event}, pour les installations en {cohort}",
      en: "the median time between first open and {event}, for the installs from {cohort}",
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
    oneLiner: {
      fr: "La part des installations encore actives un mois après.",
      en: "The share of installs still active a month later.",
    },
    formula: {
      fr: "installations de la cohorte encore actives 30 jours après la première ouverture ÷ installations de la cohorte",
      en: "cohort installs still active 30 days after first open ÷ cohort installs",
    },
    inputs: {
      numerator: { fr: "Actives à J30", en: "Active at day 30" },
      denominator: { fr: "Installations en {cohort}", en: "Installs from {cohort}" },
    },
    where: [
      {
        source: tool("ga4"),
        label: { fr: "GA4 (Firebase)", en: "GA4 (Firebase)" },
        path: {
          fr: "une exploration de cohortes (onglet Explorer), cohorte par date de première ouverture, lue au jour 30",
          en: "a cohort exploration (Explore tab), cohort by first-open date, read at day 30",
        },
      },
      {
        source: tool("amplitude"),
        label: { fr: "Amplitude", en: "Amplitude" },
        path: {
          fr: "un graphique Retention Analysis : événement de départ la première ouverture, retour ton action d'usage",
          en: "a Retention Analysis chart: starting event first open, return event your usage action",
        },
      },
      {
        source: tool("mixpanel"),
        label: { fr: "Mixpanel", en: "Mixpanel" },
        path: {
          fr: "un rapport de rétention sur la cohorte, lu au trentième jour",
          en: "a retention report on the cohort, read at day 30",
        },
      },
    ],
    trap: {
      fr: "« Actif » doit être écrit : une connexion n'est pas un usage. Et dis si J30 veut dire le trentième jour pile ou la semaine qui l'entoure : les outils font les deux.",
      en: "\"Active\" must be written down: a login isn't usage. And say whether day 30 means that exact day or the week around it: tools do both.",
    },
    request: {
      fr: "pour les installations en {cohort}, combien étaient encore actives trente jours après la première ouverture, et combien d'installations au total",
      en: "for the installs from {cohort}, how many were still active thirty days after first open, and how many installs in total",
    },
    benchmarkCaveat: {
      fr: "pour les applis mobiles grand public, qui tombent souvent sous 10 % à J90 ; compare-toi dans ta catégorie",
      en: "for consumer mobile apps, which often fall below 10% by day 90; compare within your category",
    },
  },
  "ret.logo-churn": {
    name: { fr: "Churn mensuel des abonnés", en: "Monthly subscriber churn" },
    oneLiner: {
      fr: "La part des abonnés payants qui partent dans le mois.",
      en: "The share of paying subscribers who leave in the month.",
    },
    formula: {
      fr: "abonnés payants perdus dans le mois ÷ abonnés payants au 1er du mois",
      en: "paying subscribers lost in the month ÷ paying subscribers at the start of the month",
    },
    inputs: {
      numerator: { fr: "Abonnés perdus en {month}", en: "Subscribers lost in {month}" },
      denominator: { fr: "Abonnés payants au 1er {month}", en: "Paying subscribers at the start of {month}" },
    },
    where: [
      {
        source: tool("revenuecat"),
        label: { fr: "RevenueCat", en: "RevenueCat" },
        path: {
          fr: "le graphique Churn, au mois : il compte des abonnements, pas des personnes",
          en: "the Churn chart, by month: it counts subscriptions, not people",
        },
      },
      {
        source: tool("stripe"),
        label: { fr: "Stripe", en: "Stripe" },
        path: {
          fr: "pour les abonnements vendus sur le web : le graphique « Subscriber churn rate », recompté au mois",
          en: "for subscriptions sold on the web: the \"Subscriber churn rate\" chart, recounted by month",
        },
      },
    ],
    trap: {
      fr: "Un essai qui ne convertit pas n'est pas un abonné perdu. Et un abonnement annuel ne part qu'à son échéance : un mois calme peut précéder un mois de renouvellements annuels.",
      en: "A trial that doesn't convert isn't a lost subscriber. And an annual subscription only leaves when it is due: a quiet month can come before a month of annual renewals.",
    },
    request: {
      fr: "le nombre d'abonnés payants au 1er {month} et le nombre de ceux perdus pendant le mois, essais exclus",
      en: "the number of paying subscribers at the start of {month} and the number lost during the month, trials excluded",
    },
    noReferenceReason: {
      fr: "les repères publiés portent sur le SaaS B2B ; une app grand public tourne bien plus haut, et l'écart entre formules mensuelles et annuelles change tout",
      en: "the published references are for B2B SaaS; a consumer app runs much higher, and the mix of monthly and annual plans changes everything",
    },
    naReasons: [
      { id: "not-subscription", label: { fr: "Pas d'abonnement", en: "No subscription" } },
    ],
  },
  "ret.churn-cause": {
    name: { fr: "Cause principale de churn", en: "Main churn cause" },
    oneLiner: {
      fr: "Pourquoi les utilisateurs partent, et comment tu le sais.",
      en: "Why users leave, and how you know.",
    },
    formula: {
      fr: "la cause, et d'où elle vient : données, entretiens ou intuition",
      en: "the cause, and where it comes from: data, interviews or gut feel",
    },
    where: [
      {
        source: tool("revenuecat"),
        label: { fr: "RevenueCat", en: "RevenueCat" },
        path: {
          fr: "le graphique Play Store Cancel Reasons, pour Android ; Apple ne transmet pas de raison",
          en: "the Play Store Cancel Reasons chart, for Android; Apple doesn't pass on a reason",
        },
      },
      {
        source: role("support"),
        label: { fr: "Support", en: "Support" },
        path: {
          fr: "relire les avis du store et les messages des derniers départs",
          en: "read the store reviews and the messages of the latest cancellations",
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
        path: {
          fr: "l'équipe produit sait s'il existe une invitation, un parrainage ou un partage dans le produit",
          en: "the product team knows whether there is an invite, a referral scheme or sharing in the product",
        },
      },
    ],
    trap: {
      fr: "Le bouche-à-oreille existe sans mécanisme : ne pas en avoir ne dispense pas de mesurer la part des installations recommandées.",
      en: "Word of mouth exists without a mechanism: not having one doesn't excuse you from measuring the referred share of installs.",
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
    name: { fr: "Part des installations recommandées", en: "Referred install share" },
    oneLiner: {
      fr: "La part des installations amenées par un utilisateur.",
      en: "The share of installs brought in by a user.",
    },
    formula: {
      fr: "installations arrivées par un utilisateur (lien de partage, code offert, invitation) ÷ installations de la cohorte",
      en: "installs that came through a user (share link, gift code, invite) ÷ cohort installs",
    },
    inputs: {
      numerator: { fr: "Installations recommandées", en: "Referred installs" },
      denominator: { fr: "Installations en {cohort}", en: "Installs from {cohort}" },
    },
    where: [
      {
        source: tool("product-db"),
        label: { fr: "Base produit ou outil de parrainage", en: "Product database or referral tool" },
        path: {
          fr: "les installations en {cohort} rattachées à un code ou à un lien de partage",
          en: "the installs from {cohort} attached to a code or a share link",
        },
      },
      {
        source: tool("appsflyer"),
        label: { fr: "AppsFlyer ou Adjust", en: "AppsFlyer or Adjust" },
        path: {
          fr: "les installations venues des liens d'invitation ou de partage, si tu les y suis",
          en: "the installs that came through invite or share links, if you track them there",
        },
      },
    ],
    trap: {
      fr: "Les installations « organiques » des stores mélangent recherche, bouche-à-oreille et effet des pubs : elles ne sont pas une mesure de la recommandation.",
      en: "The stores' \"organic\" installs mix search, word of mouth and the effect of ads: they don't measure referral.",
    },
    request: {
      fr: "pour les installations en {cohort}, combien sont arrivées par un code, un lien de partage ou une invitation",
      en: "for the installs from {cohort}, how many came through a code, a share link or an invite",
    },
    noReferenceReason: {
      fr: "de presque rien à la majorité selon que le produit se voit ou non ; compare-toi à toi-même",
      en: "from almost none to a majority depending on whether other people see the product; compare with yourself",
    },
  },
  "ref.k-factor": {
    name: { fr: "Coefficient viral (K)", en: "Viral coefficient (K)" },
    oneLiner: {
      fr: "Le nombre de nouvelles installations que chaque installation amène, en moyenne.",
      en: "How many new installs each install brings in, on average.",
    },
    formula: {
      fr: "installations invitées par la cohorte ÷ installations de la cohorte",
      en: "installs invited by the cohort ÷ cohort installs",
    },
    inputs: {
      numerator: { fr: "Installations invitées par la cohorte", en: "Installs invited by the cohort" },
      denominator: { fr: "Installations en {cohort}", en: "Installs from {cohort}" },
    },
    where: [
      {
        source: tool("product-db"),
        label: { fr: "Table d'invitations", en: "Invitations table" },
        path: {
          fr: "les invités qui ont installé, rattachés à la cohorte de celui qui les a invités",
          en: "the invitees who installed, attached to the cohort of whoever invited them",
        },
      },
      {
        source: tool("amplitude"),
        label: { fr: "Amplitude ou Mixpanel", en: "Amplitude or Mixpanel" },
        path: {
          fr: "si l'invitation y est suivie comme un événement, croisée avec la table d'invitations",
          en: "if the invite is tracked there as an event, joined with the invitations table",
        },
      },
    ],
    trap: {
      fr: "K se divise par toutes les installations de la cohorte, pas seulement par celles qui ont invité quelqu'un.",
      en: "K divides by every install in the cohort, not just by those that invited someone.",
    },
    request: {
      fr: "pour les installations en {cohort}, le nombre de personnes qui ont installé grâce à leurs invitations",
      en: "for the installs from {cohort}, the number of people who installed through their invites",
    },
    benchmarkCaveat: {
      fr: "fourchette réaliste pour la plupart des produits ; un K durable au-dessus de 1 est rare et presque toujours temporaire",
      en: "the realistic range for most products; a sustained K above 1 is rare and almost always temporary",
    },
    naReasons: [
      { id: "no-invite-mechanism", label: { fr: "Pas de mécanisme d'invitation", en: "No invite mechanism" } },
    ],
  },
  "rev.paid-conversion": {
    name: { fr: "Conversion en abonné", en: "Subscriber conversion" },
    oneLiner: {
      fr: "La part des installations qui deviennent des abonnés payants dans la fenêtre.",
      en: "The share of installs that become paying subscribers within the window.",
    },
    formula: {
      fr: "installations de la cohorte devenues abonnés payants sous {n} jours ÷ installations de la cohorte",
      en: "cohort installs that became paying subscribers within {n} days ÷ cohort installs",
    },
    inputs: {
      numerator: { fr: "Abonnés payants sous {n} jours", en: "Paying subscribers within {n} days" },
      denominator: { fr: "Installations en {cohort}", en: "Installs from {cohort}" },
    },
    where: [
      {
        source: tool("revenuecat"),
        label: { fr: "RevenueCat", en: "RevenueCat" },
        path: {
          fr: "le graphique Conversion to Paying, sur la cohorte : sa cohorte part de la première ouverture avec RevenueCat, pas toujours de l'installation",
          en: "the Conversion to Paying chart, on the cohort: its cohort starts at the first open with RevenueCat, not always at the install",
        },
      },
      {
        source: role("data"),
        label: { fr: "Data", en: "Data" },
        path: {
          fr: "une jointure entre les premières ouvertures et les premiers paiements, sur l'identifiant de l'utilisateur",
          en: "a join between first opens and first payments, on the user id",
        },
      },
    ],
    trap: {
      fr: "Un essai gratuit d'une semaine tient dans la fenêtre de 30 jours ; un essai d'un mois demande la fenêtre de 60. Un essai démarré n'est pas un abonné : compte le premier paiement.",
      en: "A one-week free trial fits the 30-day window; a one-month trial needs the 60-day window. A started trial isn't a subscriber: count the first payment.",
    },
    request: {
      fr: "pour les installations en {cohort}, combien sont devenues des abonnés payants sous {n} jours, et combien d'installations au total",
      en: "for the installs from {cohort}, how many became paying subscribers within {n} days, and how many installs in total",
    },
    noReferenceReason: {
      fr: "aucun taux publié ne porte sur la même base que le tien : essai ou non, paywall à l'ouverture ou plus tard",
      en: "no published rate uses the same base as yours: trial or not, paywall at first open or later",
    },
    naReasons: [
      { id: "no-free-tier", label: { fr: "App payante à l'installation", en: "Paid app at install" } },
    ],
  },
  "rev.arpa": {
    name: { fr: "Revenu mensuel par abonné", en: "Monthly revenue per subscriber" },
    oneLiner: {
      fr: "Le revenu mensuel moyen d'un abonné payant.",
      en: "The average monthly revenue of a paying subscriber.",
    },
    formula: { fr: "MRR ÷ abonnés payants", en: "MRR ÷ paying subscribers" },
    inputs: {
      numerator: { fr: "MRR à fin {month}", en: "MRR at the end of {month}" },
      denominator: { fr: "Abonnés payants à fin {month}", en: "Paying subscribers at the end of {month}" },
    },
    where: [
      {
        source: tool("revenuecat"),
        label: { fr: "RevenueCat", en: "RevenueCat" },
        path: {
          fr: "les graphiques Monthly Recurring Revenue et Active Subscriptions, à fin {month}, en vue Revenue (avant commission)",
          en: "the Monthly Recurring Revenue and Active Subscriptions charts, at the end of {month}, in the Revenue view (before commission)",
        },
      },
      {
        source: tool("stripe"),
        label: { fr: "Stripe", en: "Stripe" },
        path: {
          fr: "pour le web : la page Billing overview, MRR et abonnés actifs",
          en: "for the web: the Billing overview page, MRR and active subscribers",
        },
      },
    ],
    trap: {
      fr: "Prends le MRR avant commission : RevenueCat appelle « Proceeds » le montant après commission et taxes. Un abonnement annuel compte pour un douzième de son prix chaque mois.",
      en: "Take MRR before commission: RevenueCat calls the amount after commission and taxes \"Proceeds\". An annual plan counts for a twelfth of its price each month.",
    },
    request: {
      fr: "le MRR à fin {month}, avant commission des stores, et le nombre d'abonnés payants à la même date",
      en: "the MRR at the end of {month}, before the stores' commission, and the number of paying subscribers on the same date",
    },
    noReferenceReason: {
      fr: "il varie de trois ordres de grandeur d'une catégorie de produit à l'autre",
      en: "it varies by three orders of magnitude from one product category to another",
    },
  },
  "rev.expansion": {
    // APP-2 GAP (spec 21.4.6): the Stripe place's path has no English in the spec. Stand-in: the SaaS entry's English.
    name: { fr: "Expansion mensuelle", en: "Monthly expansion" },
    oneLiner: {
      fr: "Le revenu que les abonnés déjà là ajoutent dans le mois : passage à l'offre famille ou premium.",
      en: "The revenue existing subscribers add in the month: moving to a family or premium plan.",
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
        source: tool("revenuecat"),
        label: { fr: "RevenueCat", en: "RevenueCat" },
        path: {
          fr: "les changements de produit du mois vers une offre plus chère, dans les événements d'abonnement",
          en: "the month's product changes to a dearer plan, in the subscription events",
        },
      },
      {
        source: tool("stripe"),
        label: { fr: "Stripe", en: "Stripe" },
        path: {
          fr: "pour le web : les mouvements de MRR du mois, ligne « expansion »",
          en: "the Billing overview page: the month's MRR movements, the \"expansion\" line",
        },
      },
    ],
    trap: {
      fr: "Les nouveaux abonnés ne sont pas de l'expansion. Et passer d'un abonnement mensuel à un annuel moins cher par mois fait baisser le MRR : c'est une rétrogradation, pas une expansion.",
      en: "New subscribers aren't expansion. And moving from a monthly plan to an annual one that costs less per month lowers the MRR: that is contraction, not expansion.",
    },
    request: {
      fr: "le MRR au 1er {month} et le MRR ajouté par les abonnés déjà là, sans les nouveaux",
      en: "the MRR at the start of {month} and the MRR added by existing subscribers, without new ones",
    },
    noReferenceReason: {
      fr: "la place pour l'expansion dépend de ta gamme : forte avec une offre famille, nulle avec un seul plan",
      en: "the room for expansion depends on your range: large with a family plan, none with a single plan",
    },
    naReasons: [
      { id: "not-subscription", label: { fr: "Un seul plan", en: "A single plan" } },
    ],
  },
  "rev.contraction": {
    // APP-2 GAP (spec 21.4.6): the spec only says « comme rev.expansion, ligne « rétrogradation » / "contraction" » for `where` and
    // `request`. Stand-in: the SaaS entry's own strings. To be replaced by the spec's text once it gives it.
    name: { fr: "Rétrogradation mensuelle", en: "Monthly contraction" },
    oneLiner: {
      fr: "Le revenu que les abonnés qui restent retirent dans le mois : offre moins chère, passage à l'annuel.",
      en: "The revenue staying subscribers take away in the month: a cheaper plan, a move to annual.",
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
        source: tool("revenuecat"),
        label: { fr: "RevenueCat", en: "RevenueCat" },
        path: {
          fr: "la page Billing overview : les mouvements de MRR du mois, ligne « contraction »",
          en: "the Billing overview page: the month's MRR movements, the \"contraction\" line",
        },
      },
      {
        source: tool("stripe"),
        label: { fr: "Stripe", en: "Stripe" },
        path: {
          fr: "la page Billing overview : les mouvements de MRR du mois, ligne « contraction »",
          en: "the Billing overview page: the month's MRR movements, the \"contraction\" line",
        },
      },
    ],
    trap: {
      fr: "Un abonné parti n'est pas une rétrogradation : il est dans le churn.",
      en: "A subscriber who left isn't contraction: they're in the churn.",
    },
    request: {
      fr: "le MRR au 1er {month} et le MRR perdu en rétrogradations pendant le mois, sans les résiliations",
      en: "the MRR at the start of {month} and the MRR lost to downgrades during the month, without cancellations",
    },
    noReferenceReason: {
      fr: "la place pour l'expansion dépend de ta gamme : forte avec une offre famille, nulle avec un seul plan",
      en: "the room for expansion depends on your range: large with a family plan, none with a single plan",
    },
    naReasons: [
      { id: "not-subscription", label: { fr: "Un seul plan", en: "A single plan" } },
    ],
  },
};

/** The two self-serve computed figures an app shows (with subscriptions). */
export const ENGINE_DERIVED_CATALOG_CONSUMER: Record<"rev.grr" | "rev.nrr", EngineDerivedEntry> = {
  "rev.grr": {
    name: { fr: "GRR mensuelle", en: "Monthly GRR" },
    formula: {
      fr: "100 % – churn – rétrogradation, sur le MRR du 1er du mois",
      en: "100% – churn – contraction, on the MRR at the start of the month",
    },
    uncomputable: { fr: "incalculable — il manque {input}", en: "can't be computed — missing: {input}" },
    caveat: {
      fr: "approximative : le churn des abonnés tient lieu de churn en revenu, comme si les abonnés partis payaient le revenu moyen",
      en: "approximate: subscriber churn stands in for revenue churn, as if the subscribers who left paid the average revenue",
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
      fr: "approximative : le churn des abonnés tient lieu de churn en revenu, comme si les abonnés partis payaient le revenu moyen",
      en: "approximate: subscriber churn stands in for revenue churn, as if the subscribers who left paid the average revenue",
    },
  },
};
