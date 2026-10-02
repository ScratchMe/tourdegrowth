// Generated from design/ds-extension-07/CATALOGUE.md: its English and French
// halves parsed and matched entry by entry (41 numbers). Not rewritten: every
// string is the page's own, in both languages. Do not edit by hand.
export const CATALOGUE = [
 {
  "id": "ss:sign-up-rate",
  "section": "ss",
  "stage": "Acquisition",
  "main": true,
  "en": {
   "name": "Sign-up rate",
   "def": "The share of the month's visitors who create an account.",
   "formula": "sign-ups in the month ÷ unique visitors in the month",
   "where": [
    {
     "tool": "GA4",
     "path": "the month's total Users (the Users metric; add it to the Traffic acquisition report if it isn't there), not Sessions"
    },
    {
     "tool": "Mixpanel or Amplitude",
     "path": "a two-step funnel, page view then sign-up, over the month"
    },
    {
     "tool": "Product database",
     "path": "the accounts created in the month: the most reliable count of sign-ups"
    }
   ],
   "trap": "Visitors come from analytics, sign-ups often from your database: the two don't count the same people (blockers, several devices). Write it in your definition.",
   "ref": "2–5% · for context, never to name a stage: for cold paid traffic, far higher for warm traffic; your traffic is a mix",
   "effort": "On your own, 5 min"
  },
  "fr": {
   "name": "Taux d'inscription",
   "def": "La part des visiteurs du mois qui créent un compte.",
   "formula": "inscrits du mois ÷ visiteurs uniques du mois",
   "where": [
    {
     "tool": "GA4",
     "path": "le total Utilisateurs du mois (la métrique Utilisateurs, à ajouter au rapport Acquisition de trafic si elle n'y est pas), pas Sessions"
    },
    {
     "tool": "Mixpanel ou Amplitude",
     "path": "un entonnoir en deux étapes, page vue puis inscription, sur le mois"
    },
    {
     "tool": "Base produit",
     "path": "les comptes créés sur le mois : le compte le plus fiable pour les inscrits"
    }
   ],
   "trap": "Les visiteurs viennent de l'analytics, les inscrits souvent de ta base : les deux ne comptent pas les mêmes personnes (bloqueurs, appareils multiples). Écris-le dans ta définition.",
   "ref": "2 à 5 % · pour situer, sans désigner d'étape : pour du trafic payant froid, bien plus pour du trafic chaud ; ton trafic est un mélange",
   "effort": "Seul, 5 min"
  }
 },
 {
  "id": "ss:top-channel-share",
  "section": "ss",
  "stage": "Acquisition",
  "main": false,
  "en": {
   "name": "Top channel share",
   "def": "The share of your sign-ups that comes from your main channel.",
   "formula": "sign-ups from the top channel ÷ sign-ups in the month",
   "where": [
    {
     "tool": "GA4",
     "path": "the User acquisition report, dimension \"First user default channel group\""
    },
    {
     "tool": "HubSpot",
     "path": "the contacts created in [month], grouped by their original source (the Original Traffic Source property, or Original Source depending on your account)"
    },
    {
     "tool": "Salesforce",
     "path": "the leads created in [month], grouped by the Lead Source field"
    }
   ],
   "trap": "In GA4, \"Referral\" means a referring website, not a customer's recommendation; and \"Direct\" groups visits that arrived with no known source (bookmark, typed address, link without a referrer).",
   "ref": "No reference worth publishing: no threshold of dependence on one channel is worth publishing; the share and the channel's name are enough to open the discussion.",
   "effort": "On your own, ~1 h"
  },
  "fr": {
   "name": "Part du premier canal",
   "def": "La part de tes inscrits qui vient de ton canal principal.",
   "formula": "inscrits venus du premier canal ÷ inscrits du mois",
   "where": [
    {
     "tool": "GA4",
     "path": "le rapport Acquisition d'utilisateurs, dimension « Groupe de canaux par défaut pour le premier utilisateur »"
    },
    {
     "tool": "HubSpot",
     "path": "les contacts créés en [mois], regroupés par leur source d'origine (propriété Original Traffic Source, ou Original Source selon ton compte)"
    },
    {
     "tool": "Salesforce",
     "path": "les leads créés en [mois], regroupés par le champ Lead Source"
    }
   ],
   "trap": "Dans GA4, « Referral » veut dire site référent, pas recommandation d'un client ; et « Direct » regroupe les visites arrivées sans source connue (favori, adresse tapée, lien sans référent).",
   "ref": "Pas de repère publiable : aucun seuil de dépendance à un canal n'est publiable ; la part et le nom du canal suffisent à ouvrir la discussion.",
   "effort": "Seul, ~1 h"
  }
 },
 {
  "id": "ss:cac",
  "section": "ss",
  "stage": "Acquisition",
  "main": false,
  "en": {
   "name": "CAC",
   "def": "What a new paying customer costs, on average.",
   "formula": "acquisition spend in the month ÷ new paying customers in the month",
   "where": [
    {
     "tool": "Google Ads, Meta Ads Manager, LinkedIn Campaign Manager",
     "path": "the amount spent in [month], all campaigns together"
    },
    {
     "tool": "Finance",
     "path": "marketing and sales salaries and tools, for the \"+ team\" and \"fully loaded\" variants"
    },
    {
     "tool": "Stripe or Chargebee",
     "path": "the subscriptions that became paid in [month], free trials excluded"
    }
   ],
   "trap": "A month's spend against the same month's customers assumes people buy within a month. If your cycle is longer, shift the spend and write it down.",
   "ref": "No reference worth publishing: there is no good CAC in absolute terms: it is judged against what a customer brings in (payback, LTV:CAC).",
   "effort": "Ask someone"
  },
  "fr": {
   "name": "CAC",
   "def": "Ce que coûte, en moyenne, un nouveau client payant.",
   "formula": "dépense d'acquisition du mois ÷ nouveaux clients payants du mois",
   "where": [
    {
     "tool": "Google Ads, Meta Ads Manager, LinkedIn Campaign Manager",
     "path": "le montant dépensé en [mois], toutes campagnes confondues"
    },
    {
     "tool": "Finance",
     "path": "les salaires et les outils des équipes marketing et ventes, pour les variantes « + équipe » et « tout chargé »"
    },
    {
     "tool": "Stripe ou Chargebee",
     "path": "les abonnements devenus payants en [mois], essais gratuits exclus"
    }
   ],
   "trap": "La dépense d'un mois face aux clients du même mois suppose qu'on achète en moins d'un mois. Si ton cycle est plus long, décale la dépense et écris-le.",
   "ref": "Pas de repère publiable : il n'y a pas de bon CAC dans l'absolu : il se juge contre ce qu'un client rapporte (payback, LTV:CAC).",
   "effort": "À demander"
  }
 },
 {
  "id": "ss:activation-rate",
  "section": "ss",
  "stage": "Activation",
  "main": true,
  "en": {
   "name": "Activation rate",
   "def": "The share of sign-ups who reach first value in time.",
   "formula": "cohort sign-ups who triggered the activation event within n days ÷ cohort sign-ups",
   "where": [
    {
     "tool": "Amplitude",
     "path": "a Funnel Analysis chart: sign-up then the activation event, n-day conversion window"
    },
    {
     "tool": "Mixpanel or PostHog",
     "path": "a funnel from sign-up to the activation event, with a conversion window of n days"
    },
    {
     "tool": "GA4",
     "path": "a funnel exploration (Explore tab), if the activation event is sent to GA4"
    }
   ],
   "trap": "Change the chosen action and the rate can double or halve. Write your definition down, and keep it from one month to the next.",
   "ref": "20–40% · for context, never to name a stage: for SaaS onboarding, often lower for free trials; it all depends on how demanding the chosen event is",
   "effort": "On your own, ~1 h"
  },
  "fr": {
   "name": "Taux d'activation",
   "def": "La part des inscrits qui atteignent la première valeur à temps.",
   "formula": "inscrits de la cohorte ayant déclenché l'événement d'activation sous n jours ÷ inscrits de la cohorte",
   "where": [
    {
     "tool": "Amplitude",
     "path": "un graphique Funnel Analysis : inscription puis l'événement d'activation, fenêtre de conversion de n jours"
    },
    {
     "tool": "Mixpanel ou PostHog",
     "path": "un entonnoir inscription puis l'événement d'activation, avec une fenêtre de conversion de n jours"
    },
    {
     "tool": "GA4",
     "path": "une exploration de l'entonnoir (onglet Explorer), si l'événement d'activation est envoyé à GA4"
    }
   ],
   "trap": "Change l'action retenue et le taux peut varier du simple au double. Écris ta définition, et garde la même d'un mois à l'autre.",
   "ref": "20 à 40 % · pour situer, sans désigner d'étape : pour un onboarding SaaS, souvent plus bas en essai gratuit ; tout dépend de l'exigence de l'événement retenu",
   "effort": "Seul, ~1 h"
  }
 },
 {
  "id": "ss:activation-event",
  "section": "ss",
  "stage": "Activation",
  "main": false,
  "en": {
   "name": "Activation event",
   "def": "The action that shows a sign-up has reached the product's value.",
   "formula": "the action's name, and the number of days allowed to do it",
   "where": [
    {
     "tool": "Product",
     "path": "a product team decision, not a number a tool gives you on its own"
    }
   ],
   "trap": "An action picked because it is easy to count is not a moment of value. The one that counts separates the sign-ups who stay from those who leave.",
   "ref": null,
   "effort": "On your own, 5 min"
  },
  "fr": {
   "name": "Événement d'activation",
   "def": "L'action qui montre qu'un inscrit a touché la valeur du produit.",
   "formula": "le nom de l'action, et le nombre de jours laissés pour la faire",
   "where": [
    {
     "tool": "Produit",
     "path": "une décision de l'équipe produit, pas un chiffre qu'un outil sort tout seul"
    }
   ],
   "trap": "Une action choisie parce qu'elle est facile à compter n'est pas un moment de valeur. Celle qui compte distingue les inscrits qui restent de ceux qui partent.",
   "ref": null,
   "effort": "Seul, 5 min"
  }
 },
 {
  "id": "ss:median-time-to-value",
  "section": "ss",
  "stage": "Activation",
  "main": false,
  "en": {
   "name": "Median time to value",
   "def": "How long a sign-up takes to reach first value.",
   "formula": "median time between sign-up and the activation event",
   "where": [
    {
     "tool": "Amplitude, Mixpanel or PostHog",
     "path": "the sign-up then the activation event funnel, shown as time to convert rather than as a rate"
    },
    {
     "tool": "GA4",
     "path": "no median in the standard reports: ask the data team, from the event export"
    }
   ],
   "trap": "An average drops when stragglers give up, and then looks like progress. Use the median.",
   "ref": "No reference worth publishing: \"within the first session\" is an often-quoted ambition, not a measured norm.",
   "effort": "On your own, ~1 h"
  },
  "fr": {
   "name": "Time-to-value médian",
   "def": "Le temps qu'il faut à un inscrit pour atteindre la première valeur.",
   "formula": "médiane du délai entre l'inscription et l'événement d'activation",
   "where": [
    {
     "tool": "Amplitude, Mixpanel ou PostHog",
     "path": "l'entonnoir inscription puis l'événement d'activation, affiché en temps de conversion plutôt qu'en taux"
    },
    {
     "tool": "GA4",
     "path": "pas de médiane dans les rapports standards : à demander à la data, depuis l'export des événements"
    }
   ],
   "trap": "Une moyenne baisse quand les traînards abandonnent, et ressemble alors à un progrès. Prends la médiane.",
   "ref": "Pas de repère publiable : « dès la première session » est une ambition souvent citée, pas une norme mesurée.",
   "effort": "Seul, ~1 h"
  }
 },
 {
  "id": "ss:day-30-retention",
  "section": "ss",
  "stage": "Retention",
  "main": true,
  "en": {
   "name": "Day-30 retention",
   "def": "The share of sign-ups still active a month after signing up.",
   "formula": "cohort sign-ups still active 30 days after signing up ÷ cohort sign-ups",
   "where": [
    {
     "tool": "Amplitude",
     "path": "a Retention Analysis chart: starting event sign-up, return event your usage action"
    },
    {
     "tool": "Mixpanel or PostHog",
     "path": "a retention report on the cohort, read at day 30"
    },
    {
     "tool": "GA4",
     "path": "a cohort exploration (Explore tab), if usage is sent there"
    }
   ],
   "trap": "\"Active\" must be written down: a login isn't usage. And say whether day 30 means that exact day or the week around it: tools do both.",
   "ref": "No reference worth publishing: the published orders of magnitude are for consumer apps; in SaaS, compare the shape of your curve from one month to the next.",
   "effort": "On your own, ~1 h"
  },
  "fr": {
   "name": "Rétention à J30",
   "def": "La part des inscrits encore actifs un mois après leur inscription.",
   "formula": "inscrits de la cohorte encore actifs 30 jours après l'inscription ÷ inscrits de la cohorte",
   "where": [
    {
     "tool": "Amplitude",
     "path": "un graphique Retention Analysis : événement de départ l'inscription, retour ton action d'usage"
    },
    {
     "tool": "Mixpanel ou PostHog",
     "path": "un rapport de rétention sur la cohorte, lu au trentième jour"
    },
    {
     "tool": "GA4",
     "path": "une exploration de cohortes (onglet Explorer), si l'usage y est envoyé"
    }
   ],
   "trap": "« Actif » doit être écrit : une connexion n'est pas un usage. Et dis si J30 veut dire le trentième jour pile ou la semaine qui l'entoure : les outils font les deux.",
   "ref": "Pas de repère publiable : les ordres de grandeur publiés portent sur les applis grand public ; en SaaS, compare la forme de ta courbe d'un mois à l'autre.",
   "effort": "Seul, ~1 h"
  }
 },
 {
  "id": "ss:monthly-logo-churn",
  "section": "ss",
  "stage": "Retention",
  "main": false,
  "en": {
   "name": "Monthly logo churn",
   "def": "The share of paying customers who leave in the month.",
   "formula": "paying customers lost in the month ÷ paying customers at the start of the month",
   "where": [
    {
     "tool": "Stripe",
     "path": "the Billing overview page, \"Subscriber churn rate\" chart; Stripe computes it over thirty rolling days, new subscribers included: recount it by month if you can"
    },
    {
     "tool": "Chargebee",
     "path": "the customer churn reports (RevenueStory, depending on your edition)"
    },
    {
     "tool": "ChartMogul or Baremetrics",
     "path": "the customer churn chart, by month"
    }
   ],
   "trap": "This counts customers, not revenue: revenue churn is another number. And a monthly churn above thirty percent is often an annual figure.",
   "ref": "1–2% · for context, never to name a stage: for high-ticket B2B SaaS; low-ticket products run much higher, enterprise contracts much lower",
   "effort": "On your own, 5 min"
  },
  "fr": {
   "name": "Churn logo mensuel",
   "def": "La part des clients payants qui partent dans le mois.",
   "formula": "clients payants perdus dans le mois ÷ clients payants au 1er du mois",
   "where": [
    {
     "tool": "Stripe",
     "path": "la page Billing overview, graphique « Subscriber churn rate » ; Stripe le calcule sur trente jours glissants, nouveaux abonnés compris : recompte-le au mois si tu peux"
    },
    {
     "tool": "Chargebee",
     "path": "les rapports de churn clients (RevenueStory, selon ton édition)"
    },
    {
     "tool": "ChartMogul ou Baremetrics",
     "path": "le graphique de churn clients, au mois"
    }
   ],
   "trap": "On compte des clients, pas du revenu : le churn en revenu est un autre chiffre. Et un churn mensuel au-dessus de trente pour cent est souvent un chiffre annuel.",
   "ref": "1 à 2 % · pour situer, sans désigner d'étape : pour le SaaS B2B à panier élevé ; les petits paniers tournent bien plus haut, les contrats entreprise bien plus bas",
   "effort": "Seul, 5 min"
  }
 },
 {
  "id": "ss:main-churn-cause",
  "section": "ss",
  "stage": "Retention",
  "main": false,
  "en": {
   "name": "Main churn cause",
   "def": "Why customers leave, and how you know.",
   "formula": "the cause, and where it comes from: data, interviews or gut feel",
   "where": [
    {
     "tool": "HubSpot or Salesforce",
     "path": "the loss-reason field of customers who left, if it is filled in"
    },
    {
     "tool": "Support",
     "path": "read the latest cancellations and the tickets that came before them"
    }
   ],
   "trap": "A hunch shared by the whole team is still a hunch. Ten cancellations read beat one conviction.",
   "ref": null,
   "effort": "Ask someone"
  },
  "fr": {
   "name": "Cause principale de churn",
   "def": "Pourquoi les clients partent, et comment tu le sais.",
   "formula": "la cause, et d'où elle vient : données, entretiens ou intuition",
   "where": [
    {
     "tool": "HubSpot ou Salesforce",
     "path": "le champ de raison de perte des clients partis, s'il est rempli"
    },
    {
     "tool": "Support",
     "path": "relire les derniers départs et les tickets qui les ont précédés"
    }
   ],
   "trap": "Une intuition partagée par toute l'équipe reste une intuition. Dix départs relus valent mieux qu'une conviction.",
   "ref": null,
   "effort": "À demander"
  }
 },
 {
  "id": "ss:referred-sign-up-share",
  "section": "ss",
  "stage": "Referral",
  "main": true,
  "en": {
   "name": "Referred sign-up share",
   "def": "The share of sign-ups brought in by a user.",
   "formula": "sign-ups who came through a user (code, invite link, \"how did you hear about us?\" answer) ÷ cohort sign-ups",
   "where": [
    {
     "tool": "Referral tool or invitations table",
     "path": "the sign-ups from [cohort month] who have a referrer or a code"
    },
    {
     "tool": "HubSpot",
     "path": "a \"how did you hear about us?\" property filled in at sign-up"
    }
   ],
   "trap": "GA4's \"referral\" source counts websites that send traffic, not customers who recommend you.",
   "ref": "No reference worth publishing: from almost none to a majority depending on whether other people see the product; compare with yourself.",
   "effort": "On your own, ~1 h"
  },
  "fr": {
   "name": "Part des inscrits recommandés",
   "def": "La part des inscrits amenés par un utilisateur.",
   "formula": "inscrits arrivés par un utilisateur (code, lien d'invitation, réponse « comment nous as-tu connus ? ») ÷ inscrits de la cohorte",
   "where": [
    {
     "tool": "Outil de parrainage ou table d'invitations",
     "path": "les inscrits en [mois de cohorte] qui ont un parrain ou un code"
    },
    {
     "tool": "HubSpot",
     "path": "une propriété « comment nous avez-vous connus ? » remplie à l'inscription"
    }
   ],
   "trap": "La source « referral » de GA4 compte des sites qui envoient du trafic, pas des clients qui recommandent.",
   "ref": "Pas de repère publiable : de presque rien à la majorité selon que le produit se voit ou non ; compare-toi à toi-même.",
   "effort": "Seul, ~1 h"
  }
 },
 {
  "id": "ss:referral-mechanism",
  "section": "ss",
  "stage": "Referral",
  "main": false,
  "en": {
   "name": "Referral mechanism",
   "def": "What lets one user bring in another.",
   "formula": "none, in communication only, or in the product",
   "where": [
    {
     "tool": "Product",
     "path": "the product team knows whether there is an invite, a referral scheme or sharing in the product"
    }
   ],
   "trap": "Word of mouth exists without a mechanism: not having one doesn't excuse you from measuring the referred share of sign-ups.",
   "ref": null,
   "effort": "On your own, 5 min"
  },
  "fr": {
   "name": "Mécanisme de recommandation",
   "def": "Ce qui permet à un utilisateur d'en amener un autre.",
   "formula": "aucun, en communication seulement, ou dans le produit",
   "where": [
    {
     "tool": "Produit",
     "path": "l'équipe produit sait s'il existe une invitation, un parrainage ou un partage dans le produit"
    }
   ],
   "trap": "Le bouche-à-oreille existe sans mécanisme : ne pas en avoir ne dispense pas de mesurer la part des inscrits recommandés.",
   "ref": null,
   "effort": "Seul, 5 min"
  }
 },
 {
  "id": "ss:viral-coefficient-k",
  "section": "ss",
  "stage": "Referral",
  "main": false,
  "en": {
   "name": "Viral coefficient (K)",
   "def": "How many new sign-ups each sign-up brings in, on average.",
   "formula": "sign-ups invited by the cohort ÷ cohort sign-ups",
   "where": [
    {
     "tool": "Invitations table",
     "path": "the invitees who signed up, attached to the cohort of whoever invited them"
    },
    {
     "tool": "Mixpanel or Amplitude",
     "path": "if the invite is tracked there as an event, joined with the invitations table"
    }
   ],
   "trap": "K divides by every sign-up in the cohort, not just by those who invited someone.",
   "ref": "0.15–0.5 · for context, never to name a stage: the realistic range for most products; a sustained K above 1 is rare and almost always temporary",
   "effort": "Ask someone"
  },
  "fr": {
   "name": "Coefficient viral (K)",
   "def": "Le nombre de nouveaux inscrits que chaque inscrit amène, en moyenne.",
   "formula": "inscrits invités par la cohorte ÷ inscrits de la cohorte",
   "where": [
    {
     "tool": "Table d'invitations",
     "path": "les invités qui se sont inscrits, rattachés à la cohorte de celui qui les a invités"
    },
    {
     "tool": "Mixpanel ou Amplitude",
     "path": "si l'invitation y est suivie comme un événement, croisée avec la table d'invitations"
    }
   ],
   "trap": "K se divise par tous les inscrits de la cohorte, pas seulement par ceux qui ont invité quelqu'un.",
   "ref": "0,15 à 0,5 · pour situer, sans désigner d'étape : fourchette réaliste pour la plupart des produits ; un K durable au-dessus de 1 est rare et presque toujours temporaire",
   "effort": "À demander"
  }
 },
 {
  "id": "ss:paid-conversion",
  "section": "ss",
  "stage": "Revenue",
  "main": true,
  "en": {
   "name": "Paid conversion",
   "def": "The share of sign-ups who pay within the window.",
   "formula": "cohort sign-ups who paid within n days ÷ cohort sign-ups",
   "where": [
    {
     "tool": "Data",
     "path": "a join between the product database and Stripe or Chargebee, on the customer id"
    },
    {
     "tool": "Stripe or Chargebee",
     "path": "each customer's first payment date, to match against their sign-up date"
    },
    {
     "tool": "HubSpot or Salesforce",
     "path": "the cohort's won deals, if a salesperson is involved"
    }
   ],
   "trap": "The rates that circulate mix trials, freemium and card-at-sign-up. Only compare with yourself, from one month to the next.",
   "ref": "No reference worth publishing: no published rate uses the same base as yours.",
   "effort": "Ask someone"
  },
  "fr": {
   "name": "Conversion en payant",
   "def": "La part des inscrits qui paient dans la fenêtre.",
   "formula": "inscrits de la cohorte ayant payé sous n jours ÷ inscrits de la cohorte",
   "where": [
    {
     "tool": "Data",
     "path": "une jointure entre la base produit et Stripe ou Chargebee, sur l'identifiant client"
    },
    {
     "tool": "Stripe ou Chargebee",
     "path": "la date du premier paiement de chaque client, à rapprocher de sa date d'inscription"
    },
    {
     "tool": "HubSpot ou Salesforce",
     "path": "les affaires gagnées de la cohorte, si un commercial intervient"
    }
   ],
   "trap": "Les taux qui circulent mélangent essai, freemium et carte bancaire demandée à l'inscription. Ne compare qu'à toi-même, d'un mois à l'autre.",
   "ref": "Pas de repère publiable : aucun taux publié ne porte sur la même base que le tien.",
   "effort": "À demander"
  }
 },
 {
  "id": "ss:monthly-arpa",
  "section": "ss",
  "stage": "Revenue",
  "main": false,
  "en": {
   "name": "Monthly ARPA",
   "def": "The average monthly revenue of a paying customer.",
   "formula": "MRR ÷ paying customers",
   "where": [
    {
     "tool": "Stripe",
     "path": "the Billing overview page: MRR and active subscribers, or the ARPU it shows directly"
    },
    {
     "tool": "Chargebee",
     "path": "MRR and active customers in its subscription reports"
    },
    {
     "tool": "ChartMogul",
     "path": "the ARPA chart, directly"
    }
   ],
   "trap": "An ARPA rising while the number of customers falls is often small customers leaving.",
   "ref": "No reference worth publishing: it varies by three orders of magnitude from one product category to another.",
   "effort": "On your own, 5 min"
  },
  "fr": {
   "name": "ARPA mensuel",
   "def": "Le revenu mensuel moyen d'un client payant.",
   "formula": "MRR ÷ clients payants",
   "where": [
    {
     "tool": "Stripe",
     "path": "la page Billing overview : le MRR et les abonnés actifs, ou directement l'ARPU qu'elle affiche"
    },
    {
     "tool": "Chargebee",
     "path": "le MRR et les clients actifs dans ses rapports d'abonnement"
    },
    {
     "tool": "ChartMogul",
     "path": "le graphique ARPA, directement"
    }
   ],
   "trap": "Un ARPA qui monte pendant que le nombre de clients baisse, ce sont souvent les petits clients qui partent.",
   "ref": "Pas de repère publiable : il varie de trois ordres de grandeur d'une catégorie de produit à l'autre.",
   "effort": "Seul, 5 min"
  }
 },
 {
  "id": "ss:gross-margin",
  "section": "ss",
  "stage": "Revenue",
  "main": false,
  "en": {
   "name": "Gross margin",
   "def": "What is left of a payment after the cost of serving the customer.",
   "formula": "(revenue – direct cost of service: hosting, payment fees, support) ÷ revenue",
   "where": [
    {
     "tool": "Finance",
     "path": "the income statement of the last closed quarter: revenue, then the direct cost of service"
    }
   ],
   "trap": "Using revenue instead of margin flatters the payback: margin is what pays the CAC back.",
   "ref": "70–85% · for context, never to name a stage: in SaaS; much lower as soon as people are part of the delivery",
   "effort": "Ask someone"
  },
  "fr": {
   "name": "Marge brute",
   "def": "Ce qu'il reste d'un paiement après le coût de servir le client.",
   "formula": "(revenu – coût direct de service : hébergement, frais de paiement, support) ÷ revenu",
   "where": [
    {
     "tool": "Finance",
     "path": "le compte de résultat du dernier trimestre clos : le revenu, puis les coûts directs de service"
    }
   ],
   "trap": "Prendre le revenu au lieu de la marge flatte le payback : c'est la marge qui rembourse le CAC.",
   "ref": "70 à 85 % · pour situer, sans désigner d'étape : en SaaS ; bien moins dès qu'il y a de l'humain dans la livraison",
   "effort": "À demander"
  }
 },
 {
  "id": "ss:monthly-expansion",
  "section": "ss",
  "stage": "Revenue",
  "main": false,
  "en": {
   "name": "Monthly expansion",
   "def": "The revenue customers already on board add in the month: upgrades, seats, add-ons.",
   "formula": "expansion MRR in the month ÷ MRR at the start of the month",
   "where": [
    {
     "tool": "Stripe",
     "path": "the Billing overview page: the month's MRR movements, the \"expansion\" line"
    },
    {
     "tool": "Chargebee",
     "path": "the MRR movement reports (RevenueStory, depending on your edition)"
    },
    {
     "tool": "ChartMogul or Baremetrics",
     "path": "the MRR movements chart, by month"
    }
   ],
   "trap": "New customers' MRR is not expansion: only customers already paying at the start of the month count.",
   "ref": "No reference worth publishing: the room for expansion depends on the pricing model: large with seats, small with a flat price.",
   "effort": "On your own, ~1 h"
  },
  "fr": {
   "name": "Expansion mensuelle",
   "def": "Le revenu que les clients déjà là ajoutent dans le mois : montées en gamme, sièges, options.",
   "formula": "MRR d'expansion du mois ÷ MRR au 1er du mois",
   "where": [
    {
     "tool": "Stripe",
     "path": "la page Billing overview : les mouvements de MRR du mois, ligne « expansion »"
    },
    {
     "tool": "Chargebee",
     "path": "les rapports de mouvements de MRR (RevenueStory, selon ton édition)"
    },
    {
     "tool": "ChartMogul ou Baremetrics",
     "path": "le graphique des mouvements de MRR, au mois"
    }
   ],
   "trap": "Le MRR des nouveaux clients n'est pas de l'expansion : seuls comptent ceux qui payaient déjà au 1er du mois.",
   "ref": "Pas de repère publiable : la place pour l'expansion dépend du modèle de prix : forte avec des sièges, faible avec un prix fixe.",
   "effort": "Seul, ~1 h"
  }
 },
 {
  "id": "ss:monthly-contraction",
  "section": "ss",
  "stage": "Revenue",
  "main": false,
  "en": {
   "name": "Monthly contraction",
   "def": "The revenue customers who stay take away in the month: a cheaper plan, fewer seats.",
   "formula": "MRR lost to downgrades in the month ÷ MRR at the start of the month",
   "where": [
    {
     "tool": "Stripe",
     "path": "the Billing overview page: the month's MRR movements, the \"contraction\" line"
    },
    {
     "tool": "Chargebee",
     "path": "the MRR movement reports (RevenueStory, depending on your edition)"
    },
    {
     "tool": "ChartMogul or Baremetrics",
     "path": "the MRR movements chart, by month"
    }
   ],
   "trap": "A customer who leaves is not a downgrade: their MRR is churn, counted separately.",
   "ref": "No reference worth publishing: it depends on the pricing model as much as on the product: no order of magnitude fits everyone.",
   "effort": "On your own, ~1 h"
  },
  "fr": {
   "name": "Rétrogradation mensuelle",
   "def": "Le revenu que les clients qui restent retirent dans le mois : offre moins chère, sièges en moins.",
   "formula": "MRR perdu en rétrogradations dans le mois ÷ MRR au 1er du mois",
   "where": [
    {
     "tool": "Stripe",
     "path": "la page Billing overview : les mouvements de MRR du mois, ligne « contraction »"
    },
    {
     "tool": "Chargebee",
     "path": "les rapports de mouvements de MRR (RevenueStory, selon ton édition)"
    },
    {
     "tool": "ChartMogul ou Baremetrics",
     "path": "le graphique des mouvements de MRR, au mois"
    }
   ],
   "trap": "Un client qui part n'est pas une rétrogradation : son MRR relève du churn, compté à part.",
   "ref": "Pas de repère publiable : elle dépend du modèle de prix autant que du produit : aucun ordre de grandeur ne vaut pour tous.",
   "effort": "Seul, ~1 h"
  }
 },
 {
  "id": "ss:ltv",
  "section": "ss",
  "stage": "Computed",
  "main": false,
  "en": {
   "name": "LTV",
   "def": null,
   "formula": "ARPA × gross margin × lifetime (1 ÷ monthly churn, at most 36 months)",
   "where": [],
   "trap": "lifetime capped at 36 months: many practitioners cap it between three and five years, we take the low end",
   "ref": null,
   "effort": null
  },
  "fr": {
   "name": "LTV",
   "def": null,
   "formula": "ARPA × marge brute × durée de vie (1 ÷ churn mensuel, au plus 36 mois)",
   "where": [],
   "trap": "durée de vie plafonnée à 36 mois : beaucoup de praticiens plafonnent entre trois et cinq ans, on prend le bas",
   "ref": null,
   "effort": null
  }
 },
 {
  "id": "ss:cac-payback",
  "section": "ss",
  "stage": "Computed",
  "main": false,
  "en": {
   "name": "CAC payback",
   "def": null,
   "formula": "CAC ÷ (ARPA × gross margin), in months",
   "where": [],
   "trap": null,
   "ref": "12–24 months · for context, never to name a stage: a commonly cited reference, not a law: the real comparison is still the cash in the bank",
   "effort": null
  },
  "fr": {
   "name": "CAC payback",
   "def": null,
   "formula": "CAC ÷ (ARPA × marge brute), en mois",
   "where": [],
   "trap": null,
   "ref": "12 à 24 mois · pour situer, sans désigner d'étape : repère couramment cité, pas une loi : la vraie comparaison reste la trésorerie",
   "effort": null
  }
 },
 {
  "id": "ss:ltv-cac",
  "section": "ss",
  "stage": "Computed",
  "main": false,
  "en": {
   "name": "LTV:CAC",
   "def": null,
   "formula": "LTV ÷ CAC",
   "where": [],
   "trap": null,
   "ref": "3 · for context, never to name a stage: a rule of thumb, not a law",
   "effort": null
  },
  "fr": {
   "name": "LTV:CAC",
   "def": null,
   "formula": "LTV ÷ CAC",
   "where": [],
   "trap": null,
   "ref": "3 · pour situer, sans désigner d'étape : un repère, pas une loi",
   "effort": null
  }
 },
 {
  "id": "ss:monthly-grr",
  "section": "ss",
  "stage": "Computed",
  "main": false,
  "en": {
   "name": "Monthly GRR",
   "def": null,
   "formula": "100% – churn – contraction, on the MRR at the start of the month",
   "where": [],
   "trap": null,
   "ref": null,
   "effort": null
  },
  "fr": {
   "name": "GRR mensuelle",
   "def": null,
   "formula": "100 % – churn – rétrogradation, sur le MRR du 1er du mois",
   "where": [],
   "trap": null,
   "ref": null,
   "effort": null
  }
 },
 {
  "id": "ss:monthly-nrr",
  "section": "ss",
  "stage": "Computed",
  "main": false,
  "en": {
   "name": "Monthly NRR",
   "def": null,
   "formula": "100% – churn – contraction + expansion, on the MRR at the start of the month",
   "where": [],
   "trap": null,
   "ref": null,
   "effort": null
  },
  "fr": {
   "name": "NRR mensuelle",
   "def": null,
   "formula": "100 % – churn – rétrogradation + expansion, sur le MRR du 1er du mois",
   "where": [],
   "trap": null,
   "ref": null,
   "effort": null
  }
 },
 {
  "id": "sa:lead-to-opportunity-rate",
  "section": "sa",
  "stage": "Acquisition",
  "main": true,
  "en": {
   "name": "Lead-to-opportunity rate",
   "def": "The share of a period's leads that become a qualified opportunity.",
   "formula": "leads created [over three months] that became a qualified opportunity within n days ÷ leads created [over three months]",
   "where": [
    {
     "tool": "HubSpot",
     "path": "the contacts created over the period, with the date they entered the Opportunity lifecycle stage: an export, then those who got there within n days"
    },
    {
     "tool": "Salesforce",
     "path": "a leads report with conversion details: created over the period, converted within n days (converted date minus created date)"
    },
    {
     "tool": "Pipedrive",
     "path": "the leads inbox: the period's leads converted into a deal; otherwise, an export"
    }
   ],
   "trap": "\"Lead\" has no shared definition: imported contacts or webinar sign-ups drag the rate down. Write down what counts as a lead, and as an opportunity.",
   "ref": "No reference worth publishing: the rate depends entirely on what the company calls a lead.",
   "effort": "On your own, ~1 h"
  },
  "fr": {
   "name": "Passage des leads en opportunités",
   "def": "La part des leads d'une période qui deviennent une opportunité qualifiée.",
   "formula": "leads créés [sur trois mois] devenus une opportunité qualifiée sous n jours ÷ leads créés [sur trois mois]",
   "where": [
    {
     "tool": "HubSpot",
     "path": "les contacts créés sur la période, avec leur date d'entrée dans l'étape Opportunité du cycle de vie : un export, puis ceux arrivés sous n jours"
    },
    {
     "tool": "Salesforce",
     "path": "un rapport de leads avec leur conversion : créés sur la période, convertis sous n jours (date de conversion moins date de création)"
    },
    {
     "tool": "Pipedrive",
     "path": "la boîte de réception des leads : ceux de la période convertis en affaire ; sinon, un export"
    }
   ],
   "trap": "« Lead » n'a pas de définition commune : des contacts importés ou des inscrits à un webinar font chuter le taux. Écris ce qui compte comme lead, et comme opportunité.",
   "ref": "Pas de repère publiable : le taux dépend entièrement de ce que l'entreprise appelle un lead.",
   "effort": "Seul, ~1 h"
  }
 },
 {
  "id": "sa:sales-assisted-cac",
  "section": "sa",
  "stage": "Acquisition",
  "main": false,
  "en": {
   "name": "Sales-assisted CAC",
   "def": "What a new customer signed by the sales team costs, on average.",
   "formula": "sales and marketing spend [over three months] ÷ new sales-assisted customers signed [over three months]",
   "where": [
    {
     "tool": "Finance",
     "path": "the quarter's sales and marketing spend, loaded salaries included for the \"fully loaded\" variant"
    },
    {
     "tool": "HubSpot, Salesforce or Pipedrive",
     "path": "the new-customer deals won over the period: the number it divides by"
    },
    {
     "tool": "Ad platforms",
     "path": "the period's media cost, for the \"media only\" variant"
    }
   ],
   "trap": "If the median cycle runs past three months, this quarter's customers come from earlier spend. In a hybrid, split the shared spend by a key, and write it down.",
   "ref": "No reference worth publishing: there is no good CAC in absolute terms: it is judged against what a customer brings in (payback, LTV:CAC).",
   "effort": "Ask someone"
  },
  "fr": {
   "name": "CAC assisté",
   "def": "Ce que coûte, en moyenne, un nouveau client signé par l'équipe commerciale.",
   "formula": "dépense ventes et marketing [sur trois mois] ÷ nouveaux clients assistés signés [sur trois mois]",
   "where": [
    {
     "tool": "Finance",
     "path": "la dépense ventes et marketing du trimestre, salaires chargés compris pour la variante « tout chargé »"
    },
    {
     "tool": "HubSpot, Salesforce ou Pipedrive",
     "path": "les affaires « nouveau client » gagnées sur la période : le nombre qui divise"
    },
    {
     "tool": "Régies publicitaires",
     "path": "le coût média de la période, pour la variante « média seul »"
    }
   ],
   "trap": "Si le cycle médian dépasse trois mois, les clients signés ce trimestre viennent des dépenses d'avant. En hybride, répartis la dépense commune selon une clé, et écris-la.",
   "ref": "Pas de repère publiable : il n'y a pas de bon CAC dans l'absolu : il se juge contre ce qu'un client rapporte (payback, LTV:CAC).",
   "effort": "À demander"
  }
 },
 {
  "id": "sa:median-sales-cycle",
  "section": "sa",
  "stage": "Acquisition",
  "main": false,
  "en": {
   "name": "Median sales cycle",
   "def": "How long it takes to sign a deal, from opportunity to contract.",
   "formula": "median days between an opportunity's creation and its signature, over the new-customer deals won [over three months]",
   "where": [
    {
     "tool": "Salesforce",
     "path": "a report of the opportunities won over the period, with their age in days: an export, then the median"
    },
    {
     "tool": "HubSpot",
     "path": "the deals won, from create date to close date: an export, then the median, since the reports give averages"
    },
    {
     "tool": "Pipedrive",
     "path": "deal duration in the reports is an average: the median comes from an export"
    }
   ],
   "trap": "One 400-day deal moves the average by weeks: use the median. And an opportunity created late, after the demo, shortens the cycle on paper.",
   "ref": "No reference worth publishing: the cycle depends on the deal size and on who signs at the customer: it is followed quarter to quarter.",
   "effort": "On your own, ~1 h"
  },
  "fr": {
   "name": "Cycle de vente médian",
   "def": "Le temps qu'il faut pour signer une affaire, de l'opportunité au contrat.",
   "formula": "médiane des jours entre la création de l'opportunité et sa signature, sur les affaires « nouveau client » gagnées [sur trois mois]",
   "where": [
    {
     "tool": "Salesforce",
     "path": "un rapport des opportunités gagnées sur la période, avec leur ancienneté en jours : un export, puis la médiane"
    },
    {
     "tool": "HubSpot",
     "path": "les transactions gagnées, de la date de création à la date de fermeture : un export, puis la médiane, car les rapports donnent des moyennes"
    },
    {
     "tool": "Pipedrive",
     "path": "la durée des affaires dans les rapports est une moyenne : la médiane se calcule sur un export"
    }
   ],
   "trap": "Une affaire à 400 jours déplace la moyenne de plusieurs semaines : prends la médiane. Et une opportunité créée tard, après la démo, raccourcit le cycle sur le papier.",
   "ref": "Pas de repère publiable : le cycle dépend du ticket et de qui signe chez le client : il se suit d'un trimestre à l'autre.",
   "effort": "Seul, ~1 h"
  }
 },
 {
  "id": "sa:go-live-rate",
  "section": "sa",
  "stage": "Activation",
  "main": true,
  "en": {
   "name": "Go-live rate",
   "def": "The share of new customers live within the set time after signature.",
   "formula": "new customers signed [over three months] live within n days ÷ new customers signed [over three months]",
   "where": [
    {
     "tool": "Customer success platform",
     "path": "each account's onboarding stage and its date: Gainsight, Vitally or Planhat keep it"
    },
    {
     "tool": "HubSpot or Salesforce",
     "path": "an onboarding pipeline, or a \"live\" date field on the account, if there is one"
    },
    {
     "tool": "Customer success spreadsheet",
     "path": "often the only place the date is written down"
    }
   ],
   "trap": "Counting deployed accounts instead of live ones doubles the rate. And read the mature cohort: a customer signed less than n days ago hasn't had its window.",
   "ref": "No reference worth publishing: go-live depends on what the offer needs set up: it is followed against its own target.",
   "effort": "Ask someone"
  },
  "fr": {
   "name": "Mise en production",
   "def": "La part des nouveaux clients en production dans le délai fixé après la signature.",
   "formula": "nouveaux clients signés [sur trois mois] en production sous n jours ÷ nouveaux clients signés [sur trois mois]",
   "where": [
    {
     "tool": "Outil de Customer Success",
     "path": "l'étape d'onboarding de chaque compte et sa date : Gainsight, Vitally ou Planhat la gardent"
    },
    {
     "tool": "HubSpot ou Salesforce",
     "path": "un pipeline d'onboarding, ou un champ date « en production » sur le compte, s'il existe"
    },
    {
     "tool": "Tableur du Customer Success",
     "path": "souvent le seul endroit où la date est notée"
    }
   ],
   "trap": "Compter les comptes déployés plutôt qu'en production double le taux. Et lis la cohorte mûre : un client signé il y a moins de n jours n'a pas eu sa fenêtre.",
   "ref": "Pas de repère publiable : la mise en production dépend de ce que l'offre demande d'installer : elle se suit contre sa propre cible.",
   "effort": "À demander"
  }
 },
 {
  "id": "sa:what-live-means",
  "section": "sa",
  "stage": "Activation",
  "main": false,
  "en": {
   "name": "What \"live\" means",
   "def": "The concrete result that shows a customer got what they bought.",
   "formula": "the result that counts as \"live\", and the number of days allowed to reach it after signature",
   "where": [
    {
     "tool": "Customer success and product",
     "path": "a decision to make together: what a live customer does that a merely deployed account doesn't"
    }
   ],
   "trap": "\"Deployed\" isn't \"live\": an account delivered that nobody uses doesn't renew.",
   "ref": null,
   "effort": "On your own, 5 min"
  },
  "fr": {
   "name": "Ce que « en production » veut dire",
   "def": "Le résultat concret qui prouve qu'un client a obtenu ce qu'il a acheté.",
   "formula": "le résultat qui compte comme « en production », et le nombre de jours laissés pour l'atteindre après la signature",
   "where": [
    {
     "tool": "Customer Success et produit",
     "path": "une décision à prendre ensemble : ce que fait un client en production, et que ne fait pas un compte seulement déployé"
    }
   ],
   "trap": "« Déployé » n'est pas « en production » : un compte livré que personne n'utilise ne renouvelle pas.",
   "ref": null,
   "effort": "Seul, 5 min"
  }
 },
 {
  "id": "sa:time-to-go-live",
  "section": "sa",
  "stage": "Activation",
  "main": false,
  "en": {
   "name": "Time to go-live",
   "def": "The time, in days, from signature to go-live.",
   "formula": "median days from signature to go-live, for the customers signed [over three months] who got there",
   "where": [
    {
     "tool": "Customer success platform",
     "path": "each account's signature date and onboarding end date"
    },
    {
     "tool": "HubSpot or Salesforce",
     "path": "the signature date and the \"live\" date, if they exist"
    },
    {
     "tool": "Onboarding spreadsheet",
     "path": "both dates, account by account"
    }
   ],
   "trap": "Median, and only over those who got there: the others are in the go-live rate.",
   "ref": "No reference worth publishing: it depends on what the offer needs set up.",
   "effort": "On your own, ~1 h"
  },
  "fr": {
   "name": "Délai de mise en production",
   "def": "Le temps, en jours, entre la signature et la mise en production.",
   "formula": "médiane des jours entre la signature et la mise en production, pour les clients signés [sur trois mois] qui y sont arrivés",
   "where": [
    {
     "tool": "Outil de Customer Success",
     "path": "la date de signature et la date de fin d'onboarding de chaque compte"
    },
    {
     "tool": "HubSpot ou Salesforce",
     "path": "la date de signature et la date « en production », si elles existent"
    },
    {
     "tool": "Tableur d'onboarding",
     "path": "les deux dates, compte par compte"
    }
   ],
   "trap": "Médiane, et seulement sur ceux qui y sont arrivés : les autres sont dans le taux de mise en production.",
   "ref": "Pas de repère publiable : il dépend de ce que l'offre demande d'installer.",
   "effort": "Seul, ~1 h"
  }
 },
 {
  "id": "sa:contract-renewal-rate",
  "section": "sa",
  "stage": "Retention",
  "main": true,
  "en": {
   "name": "Contract renewal rate",
   "def": "The share of contracts up for renewal that renew, counted in customers.",
   "formula": "contracts renewed ÷ contracts up for renewal [over three months], in customers, not in money",
   "where": [
    {
     "tool": "HubSpot, Salesforce or Pipedrive",
     "path": "a renewals pipeline: won ÷ closed over the period"
    },
    {
     "tool": "Stripe or Chargebee",
     "path": "the subscriptions whose term ended in the period, and their status today"
    },
    {
     "tool": "Customer success",
     "path": "the quarter's list of renewal dates, when the CRM doesn't keep it"
    }
   ],
   "trap": "Auto-renewal isn't \"won\": count the cancellations received before the term ends. A multi-year contract not yet up for renewal stays out.",
   "ref": "No reference worth publishing: the glossary quotes a monthly churn, not a renewal rate: converting it would assume monthly contracts.",
   "effort": "On your own, ~1 h"
  },
  "fr": {
   "name": "Renouvellement des contrats",
   "def": "La part des contrats arrivés à échéance qui se renouvellent, comptés en clients.",
   "formula": "contrats renouvelés ÷ contrats arrivés à échéance [sur trois mois], en clients et non en euros",
   "where": [
    {
     "tool": "HubSpot, Salesforce ou Pipedrive",
     "path": "un pipeline de renouvellements : gagnées ÷ closes sur la période"
    },
    {
     "tool": "Stripe ou Chargebee",
     "path": "les abonnements dont l'échéance tombait sur la période, et leur statut aujourd'hui"
    },
    {
     "tool": "Customer Success",
     "path": "la liste des échéances du trimestre, quand le CRM ne la tient pas"
    }
   ],
   "trap": "La tacite reconduction ne se « gagne » pas : compte les résiliations reçues avant l'échéance. Un contrat pluriannuel qui n'arrive pas à échéance sort du compte.",
   "ref": "Pas de repère publiable : le glossaire cite un churn mensuel, pas un taux de renouvellement : le convertir supposerait des contrats mensuels.",
   "effort": "Seul, ~1 h"
  }
 },
 {
  "id": "sa:12-month-nrr",
  "section": "sa",
  "stage": "Retention",
  "main": false,
  "en": {
   "name": "12-month NRR",
   "def": "What last year's sales-assisted customers are worth today, in revenue.",
   "formula": "today's ARR from the sales-assisted customers already there twelve months ago ÷ their ARR twelve months ago",
   "where": [
    {
     "tool": "ChartMogul",
     "path": "net revenue retention by cohort, depending on the plan"
    },
    {
     "tool": "Finance",
     "path": "the board reporting"
    },
    {
     "tool": "Salesforce",
     "path": "the sum of active contracts per account at two dates, if contracts live there"
    }
   ],
   "trap": "Published alone, it hides the loss: an NRR above 100% can rest on a base that loses one customer in five. Read it with the renewal rate.",
   "ref": "110–130% · for context, never to name a stage: considered solid in B2B SaaS, context and not a target",
   "effort": "Ask someone"
  },
  "fr": {
   "name": "NRR sur douze mois",
   "def": "Ce que valent aujourd'hui, en revenu, les clients assistés d'il y a un an.",
   "formula": "ARR aujourd'hui des clients assistés déjà là il y a douze mois ÷ leur ARR il y a douze mois",
   "where": [
    {
     "tool": "ChartMogul",
     "path": "la rétention nette de revenu par cohorte, selon l'offre"
    },
    {
     "tool": "Finance",
     "path": "le reporting au board"
    },
    {
     "tool": "Salesforce",
     "path": "la somme des contrats actifs par compte à deux dates, si les contrats y vivent"
    }
   ],
   "trap": "Publiée seule, elle cache la perte : une NRR au-dessus de 100 % peut tenir sur une base qui perd un client sur cinq. Lis-la avec le renouvellement.",
   "ref": "110 à 130 % · pour situer, sans désigner d'étape : considérée comme solide en SaaS B2B, du contexte et non une cible",
   "effort": "À demander"
  }
 },
 {
  "id": "sa:main-reason-for-non-renewal",
  "section": "sa",
  "stage": "Retention",
  "main": false,
  "en": {
   "name": "Main reason for non-renewal",
   "def": "The reason that comes up most when a customer doesn't renew.",
   "formula": "the reason, and how we know it: data, interviews or gut feel",
   "where": [
    {
     "tool": "HubSpot, Salesforce or Pipedrive",
     "path": "the lost reason on lost renewals, often a custom field"
    },
    {
     "tool": "Customer success",
     "path": "go through the latest departures with the team"
    }
   ],
   "trap": "\"Price\" is the quickest box to tick. Cross the stated reason with usage over the 90 days before.",
   "ref": null,
   "effort": "Ask someone"
  },
  "fr": {
   "name": "Cause principale de non-renouvellement",
   "def": "La raison qui revient le plus quand un client ne renouvelle pas.",
   "formula": "la cause, et comment on la sait : données, entretiens ou intuition",
   "where": [
    {
     "tool": "HubSpot, Salesforce ou Pipedrive",
     "path": "la raison de perte des renouvellements perdus, souvent un champ personnalisé"
    },
    {
     "tool": "Customer Success",
     "path": "relire les derniers départs avec l'équipe"
    }
   ],
   "trap": "« Le prix » est la case la plus rapide à cocher. Croise la raison déclarée avec l'usage des 90 jours d'avant.",
   "ref": null,
   "effort": "À demander"
  }
 },
 {
  "id": "sa:referred-opportunities",
  "section": "sa",
  "stage": "Referral",
  "main": true,
  "en": {
   "name": "Referred opportunities",
   "def": "The share of opportunities brought in by a customer or a partner.",
   "formula": "opportunities created [over three months] that came from a referral ÷ opportunities created [over three months]",
   "where": [
    {
     "tool": "Salesforce",
     "path": "the lead or opportunity source: its referral and partner values"
    },
    {
     "tool": "HubSpot",
     "path": "a deal source property, often one to create: the original source doesn't know about referrals"
    },
    {
     "tool": "The sales team",
     "path": "where their last ten opportunities came from: often faster and more accurate"
    }
   ],
   "trap": "A zero almost always means \"nobody counted it\". And a web tool's \"referral\" source counts websites, not people.",
   "ref": "No reference worth publishing: from almost none to the majority depending on the product: the only reference is its own number.",
   "effort": "On your own, ~1 h"
  },
  "fr": {
   "name": "Opportunités recommandées",
   "def": "La part des opportunités amenées par un client ou un partenaire.",
   "formula": "opportunités créées [sur trois mois] venues d'une recommandation ÷ opportunités créées [sur trois mois]",
   "where": [
    {
     "tool": "Salesforce",
     "path": "la source du lead ou de l'opportunité : ses valeurs recommandation et partenaire"
    },
    {
     "tool": "HubSpot",
     "path": "une propriété de source de la transaction, souvent à créer : la source d'origine ne connaît pas les recommandations"
    },
    {
     "tool": "Les commerciaux",
     "path": "l'origine de leurs dix dernières opportunités : souvent plus vite et plus juste"
    }
   ],
   "trap": "Un zéro veut presque toujours dire « personne ne l'a compté ». Et la source « referral » d'un outil web compte des sites, pas des personnes.",
   "ref": "Pas de repère publiable : de presque rien à la majorité selon le produit : la seule référence est son propre chiffre.",
   "effort": "Seul, ~1 h"
  }
 },
 {
  "id": "sa:reference-customers",
  "section": "sa",
  "stage": "Referral",
  "main": false,
  "en": {
   "name": "Reference customers",
   "def": "The share of sales-assisted customers who agree to be named or take a call.",
   "formula": "sales-assisted customers with a written agreement under twelve months old ÷ sales-assisted customers at the end of [month]",
   "where": [
    {
     "tool": "Marketing or customer success",
     "path": "the references spreadsheet, with each agreement's date"
    },
    {
     "tool": "HubSpot, Salesforce or Pipedrive",
     "path": "a \"reference customer\" property on the company, if the team created one"
    }
   ],
   "trap": "The logos on the website count customers who left and agreements never renewed.",
   "ref": "No reference worth publishing: an agreement to be named depends on each customer.",
   "effort": "Ask someone"
  },
  "fr": {
   "name": "Clients références",
   "def": "La part des clients assistés d'accord pour être cités ou prendre un appel.",
   "formula": "clients assistés avec un accord écrit de moins de douze mois ÷ clients assistés à fin [mois]",
   "where": [
    {
     "tool": "Marketing ou Customer Success",
     "path": "le tableur des références, avec la date de chaque accord"
    },
    {
     "tool": "HubSpot, Salesforce ou Pipedrive",
     "path": "une propriété « client référence » sur la société, si l'équipe l'a créée"
    }
   ],
   "trap": "Les logos du site comptent des clients partis et des accords jamais renouvelés.",
   "ref": "Pas de repère publiable : un accord de citation dépend de chaque client.",
   "effort": "À demander"
  }
 },
 {
  "id": "sa:win-rate",
  "section": "sa",
  "stage": "Revenue",
  "main": true,
  "en": {
   "name": "Win rate",
   "def": "The share of closed opportunities that are won.",
   "formula": "new-customer opportunities won ÷ new-customer opportunities closed (won + lost) [over three months]",
   "where": [
    {
     "tool": "Salesforce",
     "path": "the new-customer opportunities closed over the period: won ÷ closed"
    },
    {
     "tool": "HubSpot",
     "path": "the new-business deals closed over the period: won ÷ (won + lost)"
    },
    {
     "tool": "Pipedrive",
     "path": "deal conversion over the period, in the reports"
    }
   ],
   "trap": "Dead deals never marked \"lost\" inflate the rate, and a \"no decision\" is a loss. Sales to existing customers don't belong here.",
   "ref": "No reference worth publishing: the rate depends on deal size and on what counts as an opportunity: it is followed against its own target.",
   "effort": "On your own, 5 min"
  },
  "fr": {
   "name": "Taux de closing",
   "def": "La part des opportunités conclues qui se signent.",
   "formula": "opportunités « nouveau client » gagnées ÷ opportunités « nouveau client » conclues (gagnées + perdues) [sur trois mois]",
   "where": [
    {
     "tool": "Salesforce",
     "path": "les opportunités « nouveau client » closes sur la période : gagnées ÷ closes"
    },
    {
     "tool": "HubSpot",
     "path": "les transactions « nouvelle affaire » fermées sur la période : gagnées ÷ (gagnées + perdues)"
    },
    {
     "tool": "Pipedrive",
     "path": "la conversion des affaires sur la période, dans les rapports"
    }
   ],
   "trap": "Les affaires mortes jamais passées « perdues » gonflent le taux, et un « sans décision » est une perte. Les ventes aux clients existants n'ont rien à faire ici.",
   "ref": "Pas de repère publiable : le taux dépend du ticket et de ce qui compte comme opportunité : il se suit contre sa propre cible.",
   "effort": "Seul, 5 min"
  }
 },
 {
  "id": "sa:new-contract-acv",
  "section": "sa",
  "stage": "Revenue",
  "main": false,
  "en": {
   "name": "New-contract ACV",
   "def": "What a new signed contract is worth per year, on average.",
   "formula": "annual value of the new-customer contracts signed [over three months], onboarding fees excluded ÷ number of those contracts",
   "where": [
    {
     "tool": "HubSpot",
     "path": "the ACV property on won deals, otherwise their amount"
    },
    {
     "tool": "Salesforce",
     "path": "the amount on won opportunities: check it covers one year, not the whole term"
    },
    {
     "tool": "Finance",
     "path": "the contracts signed over the period"
    }
   ],
   "trap": "An amount covering a three-year contract triples the ACV, and onboarding isn't recurring. An average gets pulled by one big deal: look at the median too.",
   "ref": "No reference worth publishing: ACV spans several orders of magnitude from one category to another: no reference holds for all.",
   "effort": "On your own, 5 min"
  },
  "fr": {
   "name": "ACV des nouveaux contrats",
   "def": "Ce que vaut par an, en moyenne, un nouveau contrat signé.",
   "formula": "valeur annuelle des contrats « nouveau client » signés [sur trois mois], hors mise en service ÷ nombre de ces contrats",
   "where": [
    {
     "tool": "HubSpot",
     "path": "la propriété ACV des transactions gagnées, sinon leur montant"
    },
    {
     "tool": "Salesforce",
     "path": "le montant des opportunités gagnées : vérifie qu'il porte une année, pas toute la durée"
    },
    {
     "tool": "Finance",
     "path": "les contrats signés sur la période"
    }
   ],
   "trap": "Un montant qui porte trois ans de contrat triple l'ACV, et la mise en service n'est pas récurrente. Une moyenne se laisse tirer par un gros contrat : regarde aussi la médiane.",
   "ref": "Pas de repère publiable : l'ACV couvre plusieurs ordres de grandeur d'une catégorie à l'autre : aucun repère ne vaut pour tous.",
   "effort": "Seul, 5 min"
  }
 },
 {
  "id": "sa:sales-assisted-arpa",
  "section": "sa",
  "stage": "Revenue",
  "main": false,
  "en": {
   "name": "Sales-assisted ARPA",
   "def": "A sales-assisted customer's average monthly revenue.",
   "formula": "MRR of the sales-assisted customers at the end of [month] ÷ sales-assisted customers at the end of [month]",
   "where": [
    {
     "tool": "Stripe, Chargebee or ChartMogul",
     "path": "MRR and customers filtered on sales-assisted customers: a segment, a plan, a property"
    },
    {
     "tool": "Finance",
     "path": "sales-assisted ARR ÷ 12, and the number of sales-assisted customers"
    }
   ],
   "trap": "In a hybrid, a customer counts in the one motion that signed their current contract: a self-serve customer moved over by a salesperson counts here.",
   "ref": "No reference worth publishing: three orders of magnitude separate categories: no reference holds for all.",
   "effort": "On your own, 5 min"
  },
  "fr": {
   "name": "ARPA assisté",
   "def": "Le revenu mensuel moyen d'un client assisté.",
   "formula": "MRR des clients assistés à fin [mois] ÷ clients assistés à fin [mois]",
   "where": [
    {
     "tool": "Stripe, Chargebee ou ChartMogul",
     "path": "le MRR et les clients filtrés sur les clients assistés : un segment, un plan, une propriété"
    },
    {
     "tool": "Finance",
     "path": "l'ARR assisté ÷ 12, et le nombre de clients assistés"
    }
   ],
   "trap": "En hybride, un client compte dans la seule motion qui a signé son contrat en cours : un client du libre-service passé par un commercial compte ici.",
   "ref": "Pas de repère publiable : trois ordres de grandeur séparent les catégories : aucun repère ne vaut pour tous.",
   "effort": "Seul, 5 min"
  }
 },
 {
  "id": "sa:sales-assisted-gross-margin",
  "section": "sa",
  "stage": "Revenue",
  "main": false,
  "en": {
   "name": "Sales-assisted gross margin",
   "def": "What is left of sales-assisted revenue after the cost of serving those customers, onboarding included.",
   "formula": "(sales-assisted revenue – cost to serve it, onboarding and customer success included) ÷ sales-assisted revenue, [over three months]",
   "where": [
    {
     "tool": "Finance",
     "path": "the income statement by offer or segment, when it keeps one; otherwise the company-wide margin as a fallback"
    }
   ],
   "trap": "A company-wide margin flatters sales-assisted when its offer includes onboarding: ask finance for the margin by motion.",
   "ref": "No reference worth publishing: onboarding and customer success weigh differently in every offer.",
   "effort": "Ask someone"
  },
  "fr": {
   "name": "Marge brute de l'assisté",
   "def": "Ce qu'il reste du revenu assisté après le coût de servir ces clients, mise en service comprise.",
   "formula": "(revenu assisté – coût pour le servir, mise en service et Customer Success compris) ÷ revenu assisté, [sur trois mois]",
   "where": [
    {
     "tool": "Finance",
     "path": "le compte de résultat par offre ou par segment, quand elle le tient ; sinon, la marge globale en repli"
    }
   ],
   "trap": "Une marge globale flatte l'assisté quand son offre comprend de la mise en service : demande la marge par motion à la finance.",
   "ref": "Pas de repère publiable : la mise en service et le Customer Success pèsent différemment dans chaque offre.",
   "effort": "À demander"
  }
 },
 {
  "id": "sa:sales-assisted-ltv",
  "section": "sa",
  "stage": "Computed",
  "main": false,
  "en": {
   "name": "Sales-assisted LTV",
   "def": null,
   "formula": "ACV ÷ 12 × sales-assisted gross margin × lifetime (from the renewal rate, at most 36 months)",
   "where": [],
   "trap": "lifetime capped at 36 months, as in self-serve: many practitioners cap it between three and five years, we take the low end",
   "ref": null,
   "effort": null
  },
  "fr": {
   "name": "LTV assistée",
   "def": null,
   "formula": "ACV ÷ 12 × marge brute de l'assisté × durée de vie (tirée du renouvellement, au plus 36 mois)",
   "where": [],
   "trap": "durée de vie plafonnée à 36 mois, comme en libre-service : beaucoup de praticiens plafonnent entre trois et cinq ans, on prend le bas",
   "ref": null,
   "effort": null
  }
 },
 {
  "id": "sa:sales-assisted-cac-payback",
  "section": "sa",
  "stage": "Computed",
  "main": false,
  "en": {
   "name": "Sales-assisted CAC payback",
   "def": null,
   "formula": "sales-assisted CAC ÷ (ACV ÷ 12 × sales-assisted gross margin), in months",
   "where": [],
   "trap": null,
   "ref": "12–24 months · for context, never to name a stage: a commonly cited reference, not a law: the real comparison is still the cash in the bank",
   "effort": null
  },
  "fr": {
   "name": "CAC payback assisté",
   "def": null,
   "formula": "CAC assisté ÷ (ACV ÷ 12 × marge brute de l'assisté), en mois",
   "where": [],
   "trap": null,
   "ref": "12 à 24 mois · pour situer, sans désigner d'étape : repère couramment cité, pas une loi : la vraie comparaison reste la trésorerie",
   "effort": null
  }
 },
 {
  "id": "sa:sales-assisted-ltv-cac",
  "section": "sa",
  "stage": "Computed",
  "main": false,
  "en": {
   "name": "Sales-assisted LTV:CAC",
   "def": null,
   "formula": "sales-assisted LTV ÷ sales-assisted CAC",
   "where": [],
   "trap": null,
   "ref": "3 · for context, never to name a stage: a rule of thumb, not a law",
   "effort": null
  },
  "fr": {
   "name": "LTV:CAC assisté",
   "def": null,
   "formula": "LTV assistée ÷ CAC assisté",
   "where": [],
   "trap": null,
   "ref": "3 · pour situer, sans désigner d'étape : un repère, pas une loi",
   "effort": null
  }
 },
 {
  "id": "link:opportunities-from-self-serve",
  "section": "link",
  "stage": "Link",
  "main": false,
  "en": {
   "name": "Opportunities from self-serve",
   "def": "The share of sales-assisted opportunities that started from a self-serve account.",
   "formula": "opportunities created [over three months] from a self-serve account ÷ opportunities created [over three months]",
   "where": [
    {
     "tool": "HubSpot",
     "path": "the deal source, or a \"PQL\" property set by the product integration"
    },
    {
     "tool": "Salesforce",
     "path": "the lead source, or a campaign dedicated to PQLs"
    },
    {
     "tool": "Data",
     "path": "a product database × CRM join on the company's domain"
    }
   ],
   "trap": "A share of the pipeline, not an attribution: the account may already have talked to a salesperson. And it doesn't add up with the referred share.",
   "ref": "No reference worth publishing: the only reference worth having is the team's own base rate.",
   "effort": "On your own, ~1 h"
  },
  "fr": {
   "name": "Opportunités venues du libre-service",
   "def": "La part des opportunités assistées nées d'un compte du libre-service.",
   "formula": "opportunités créées [sur trois mois] à partir d'un compte du libre-service ÷ opportunités créées [sur trois mois]",
   "where": [
    {
     "tool": "HubSpot",
     "path": "la source de la transaction, ou une propriété « PQL » posée par l'intégration produit"
    },
    {
     "tool": "Salesforce",
     "path": "la source du lead, ou une campagne dédiée aux PQL"
    },
    {
     "tool": "Données",
     "path": "la jointure base produit × CRM sur le domaine de l'entreprise"
    }
   ],
   "trap": "Une part du pipeline, pas une attribution : le compte avait peut-être déjà parlé à un commercial. Et elle ne s'additionne pas à la part recommandée.",
   "ref": "Pas de repère publiable : la seule référence qui vaille est le taux de base de l'équipe.",
   "effort": "Seul, ~1 h"
  }
 }
];
