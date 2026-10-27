// TODO: à relire — copie neuve (convention 6), §22 (A23 MKT-S)
import type { DeepPartialTranslatable } from "@/lib/i18n/translatable";
import type { ENGINE_COPY } from "./engine-copy"; // type only: erased, never a bundle edge

/**
 * engine-copy-mkt-services.ts — the marketplace's overlays on `ENGINE_COPY`, in the words of "services" (engine spec §22.8,
 * A23 MKT-S): a marketplace of services says « clients », « prestataires », « réservations » and « profils » where one of
 * products says « acheteurs », « vendeurs », « commandes » and « annonces ». The same three layers as
 * `engine-copy-marketplace.ts`, and the same mechanism: `marketplaceStrings` (`lib/engine/strings.ts`) lays them over the
 * words of "products", in the order of §22.8.1 (the "products" common sheet, the side's, then these: `common`, then the
 * side's).
 *
 * - `common`: every leaf the neutral set reads that holds a word of "produits" — the marketplace's own `mkt.*` and the
 *   phrases of its numbers (`subject`, `leverSubject`, `unitInput`, `io.sharedCount.mkt*`, `findings.verbMkt`), and the six
 *   leaves of C105. Written once: the neutral set reads it, and each side reads it before its own sheet.
 * - `demand` and `supply`: the leaves each side's "produits" sheet wrote with « acheteur » or « vendeur abonné », rewritten
 *   with the lexicon of §22.8.4. Two sheets, never one: a leaf both sides would write alike would be in `common`, and none is.
 *
 * Each leaf is the "produits" text of the same path with the lexicon of §22.8.4 applied and nothing else: the accords
 * follow (« nouvel acheteur » is « nouveau client », « une annonce consultée » is « un profil consulté »), the rest of
 * the sentence is the "produits" one, typography included; one sentence takes its words from the subject of the lever it
 * speaks of instead (`mkt.assumption.money-levers-all-buyers`: « le montant moyen d'une réservation »). Three leaves of the
 * neutral set are left as they are, named exceptions of the test: `io.unsupportedSetup` (its « vend » is shown before anyone
 * knows the offering), and `io.mergeRefused.motions` and `table.reasons.hidden` (the SaaS's « les façons de vendre cochées »,
 * wrong for any marketplace, « produits » included: a copy decision for the bon à tirer, `docs/engine/a23d-a-regarder.md`).
 * The test of §22.8.3, point 5, holds that no other leaf outside its excluded paths keeps a word of "produits".
 *
 * Server only, like `engine-copy.ts`: the page resolves it with `resolveTree` and hands the island
 * `typeStrings.marketplace.services`; the island never imports this file (`engine-boundary.test.ts`).
 */
type Overlay = DeepPartialTranslatable<typeof ENGINE_COPY>;

export const ENGINE_COPY_MKT_SERVICES: { common: Overlay; demand: Overlay; supply: Overlay } = {
  /** What the neutral set reads and each side reads first: the marketplace's own leaves and the six of C105, in the words of services. */
  common: {
    setup: {
      referenceMonthHint: {
        fr: "Visiteurs, inscriptions, dépense et churn des deux côtés, réservations et revenu net de ce mois-là. Par défaut : le dernier mois terminé.",
        en: "Visitors, sign-ups, spend and churn on both sides, bookings and net revenue for that month. Default: the last full month.",
      },
      cohortHint: {
        fr: "On suit les clients et les prestataires inscrits en {cohort} : ceux inscrits en {next} n'ont pas encore eu {n} jours.",
        en: "We follow the clients and providers who signed up in {cohort}: those from {next} haven't had {n} days yet.",
      },
      // TODO: à relire (convention 6) — neuf le 2026-10-27 (A23 MKT-6, §22.8.4, §22.8.5 a) : la carte de réglage en « services ».
      mktSides: {
        fr: "Une place de marché a deux côtés : les clients et les prestataires.",
        en: "A marketplace has two sides: clients and providers.",
      },
      firstOrderWindow: { fr: "Première réservation sous", en: "First booking within" },
      repeatWindow: { fr: "Deuxième réservation sous", en: "Second booking within" },
      firstSaleWindow: { fr: "Première réservation reçue sous", en: "First booking received within" },
    },
    subject: {
      "mkt.buy.signup-rate": { fr: "le taux d'inscription des clients", en: "the client sign-up rate" },
      "mkt.buy.first-order": { fr: "la première réservation", en: "the first booking" },
      "mkt.buy.repeat": { fr: "la deuxième réservation", en: "the second booking" },
      "mkt.buy.churn": { fr: "le churn des clients", en: "client churn" },
      "mkt.sell.signup-rate": { fr: "le taux d'inscription des prestataires", en: "the provider sign-up rate" },
      "mkt.sell.first-sale": { fr: "la première réservation reçue", en: "the first booking received" },
      "mkt.sell.paid-conversion": { fr: "la conversion en prestataire abonné", en: "provider subscription conversion" },
      "mkt.sell.churn": { fr: "le churn des prestataires", en: "provider churn" },
      "mkt.sell.paid-churn": { fr: "le churn des prestataires abonnés", en: "paid provider churn" },
    },
    unitInput: {
      "mkt.rev.frequency": { fr: "la fréquence de réservation", en: "booking frequency" },
      "mkt.rev.aov": { fr: "le montant moyen d'une réservation", en: "average booking value" },
      "mkt.buy.churn": { fr: "le churn des clients", en: "client churn" },
      "mkt.buy.cac": { fr: "le CAC client", en: "client CAC" },
      "mkt.sell.arpa": { fr: "le revenu par prestataire abonné", en: "revenue per paid provider" },
      "mkt.sell.gross-margin": { fr: "la marge sur les abonnements prestataires", en: "margin on provider subscriptions" },
      "mkt.sell.paid-churn": { fr: "le churn des prestataires abonnés", en: "paid provider churn" },
      "mkt.sell.cac": { fr: "le coût d'un prestataire actif", en: "cost per active provider" },
      "mkt.sell.first-sale": { fr: "la première réservation reçue", en: "first booking received" },
      "mkt.sell.paid-conversion": { fr: "la conversion en prestataire abonné", en: "provider subscription conversion" },
    },
    leverSubject: {
      "mkt.buy.signup-rate": { fr: "le taux d'inscription des clients", en: "the client sign-up rate" },
      "mkt.buy.first-order": { fr: "la première réservation", en: "the first booking" },
      "mkt.buy.churn": { fr: "le churn des clients", en: "client churn" },
      "mkt.rev.frequency": { fr: "la fréquence de réservation", en: "booking frequency" },
      "mkt.rev.aov": { fr: "le montant moyen d'une réservation", en: "the average booking value" },
      "mkt.sell.paid-conversion": { fr: "la conversion en prestataire abonné", en: "provider subscription conversion" },
      "mkt.sell.paid-churn": { fr: "le churn des prestataires abonnés", en: "paid provider churn" },
      "mkt.sell.arpa": { fr: "le prix de l'abonnement des prestataires", en: "the provider subscription price" },
    },
    mkt: {
      side: {
        demandTitle: { fr: "La demande : les clients", en: "Demand: the clients" },
        supplyTitle: { fr: "L'offre : les prestataires", en: "Supply: the providers" },
        buy: { fr: "Clients", en: "Clients" },
        sell: { fr: "Prestataires", en: "Providers" },
      },
      funnel: {
        sellerUpstream: {
          fr: "~{n} visiteurs de la page prestataires pour 100 prestataires inscrits · {source} · {month}",
          en: "~{n} provider page visitors for 100 provider sign-ups · {source} · {month}",
        },
        sellerSignups: { fr: "Prestataires inscrits", en: "Provider sign-ups" },
        first: { fr: "Première réservation sous {n} jours", en: "First booking within {n} days" },
        repeat: { fr: "Deuxième réservation sous {n} jours", en: "Second booking within {n} days" },
        firstSale: { fr: "Première réservation reçue sous {n} jours", en: "First booking received within {n} days" },
        sellerSameHundred: {
          fr: "Tes prestataires inscrits en {cohort} sont ramenés à 100 pour se lire en pourcentages : chaque colonne est comptée sur ces mêmes 100.",
          en: "Your {cohort} provider sign-ups are scaled to 100 so they read as percentages: every column is counted on those same 100.",
        },
        slideSellerSameHundred: {
          fr: "Chaque colonne est comptée sur les mêmes 100 prestataires inscrits.",
          en: "Every column is counted on the same 100 provider sign-ups.",
        },
        clauseFirst: { fr: "{a} font une première réservation", en: "{a} make a first booking" },
        clauseFirstOne: { fr: "{a} fait une première réservation", en: "{a} makes a first booking" },
        // « en passent une deuxième » is the order's verb too (§22.8.4: passer une commande, faire une réservation), though the rule of point 5 holds no word of it.
        clauseRepeat: { fr: "{r} en font une deuxième", en: "{r} make a second one" },
        clauseRepeatOne: { fr: "{r} en fait une deuxième", en: "{r} makes a second one" },
        clauseFirstSale: { fr: "{a} reçoivent une première réservation", en: "{a} receive a first booking" },
        clauseFirstSaleOne: { fr: "{a} reçoit une première réservation", en: "{a} receives a first booking" },
        unmeasured: {
          first: { fr: "la première réservation", en: "first booking" },
          repeat: { fr: "la deuxième réservation", en: "second booking" },
          firstSale: { fr: "la première réservation reçue", en: "first booking received" },
        },
        fillRequests: { fr: "Taux de service : {fill} des demandes envoyées aboutissent à une réservation", en: "Fill rate: {fill} of requests sent end in a booking" },
        fillSearches: { fr: "Taux de service : {fill} des recherches aboutissent à une réservation", en: "Fill rate: {fill} of searches end in a booking" },
        churn: { fr: "Churn des prestataires : {c} par mois", en: "Provider churn: {c} a month" },
        paidChurn: { fr: "Churn des prestataires abonnés : {c} par mois", en: "Paid provider churn: {c} a month" },
        newBuyers: { fr: "Nouveaux clients", en: "New clients" },
        newPaidSellers: { fr: "Nouveaux prestataires abonnés", en: "New paid providers" },
      },
      money: {
        perBuyer: { fr: "Revenu net par client actif et par mois", en: "Net revenue per active client a month" },
        perSeller: { fr: "Revenu par prestataire abonné et par mois", en: "Revenue per paid provider a month" },
        sellerCost: { fr: "Coût d'un prestataire abonné", en: "Cost per paid provider" },
        sellerCostNote: {
          fr: "Le coût d'un prestataire actif × la première réservation reçue ÷ la conversion en abonné, sur la même cohorte.",
          en: "The cost per active provider × first booking received ÷ subscription conversion, on the same cohort.",
        },
        supplyNone: {
          fr: "Tes prestataires ne paient pas d'abonnement : l'offre ne rapporte rien en direct",
          en: "Your providers pay no subscription: supply brings in nothing directly",
        },
      },
      total: {
        supply: { fr: "Abonnements des prestataires", en: "Provider subscriptions" },
      },
      assumption: {
        "fill-new-buyers-only": {
          fr: "Un meilleur taux de service ne compte que pour les nouveaux clients : l'effet sur les clients déjà là n'est pas compté, c'est un minimum.",
          en: "A better fill rate only counts for new clients: the effect on existing clients isn't counted, so this is a minimum.",
        },
        "new-buyer-spends-average": { fr: "Un nouveau client dépense comme le client actif moyen.", en: "A new client spends like the average active client." },
        // The lever it speaks of is the average booking value (`leverSubject["mkt.rev.aov"]`), not a basket: the sentence takes that subject.
        "money-levers-all-buyers": {
          fr: "Une fréquence, un montant moyen par réservation ou une commission qui changent jouent sur tous les clients, dès le mois suivant.",
          en: "A change in frequency, average booking value or take rate applies to every client, from the next month.",
        },
        "price-all-paid-sellers": {
          fr: "Un prix d'abonnement qui change joue sur tous les prestataires abonnés, dès le mois suivant.",
          en: "A change in subscription price applies to every paid provider, from the next month.",
        },
        "active-twelve-months": {
          fr: "Un client est actif s'il a réservé dans les 12 derniers mois ; ses départs sont le churn des clients.",
          en: "A client is active if they booked in the last 12 months; their departures are the client churn.",
        },
        "supply-priced-by-subscriptions": {
          fr: "L'offre ne se chiffre que par ses abonnements : convertir un prestataire, garder un abonné. La première réservation reçue et le départ d'un prestataire actif sont nommés, sans montant.",
          en: "Supply is priced only through its subscriptions: converting a provider, keeping a subscriber. The first booking received and an active provider leaving are named, without an amount.",
        },
      },
    },
    terms: {
      cohort: {
        definition: {
          fr: "Les clients ou les prestataires inscrits un même mois, suivis sur les jours qui suivent. La première réservation, la deuxième et la première réservation reçue se lisent sur une cohorte assez ancienne pour que chacun ait eu toute la fenêtre : la cohorte suivie, dans les Réglages.",
          en: "The clients or providers who signed up in one month, followed over the days after. The first booking, the second one and the first booking received are read on a cohort old enough for each of them to have had the whole window: the cohort you follow, in Settings.",
        },
      },
      window: {
        definition: {
          fr: "Le nombre de jours qu'a un inscrit pour qu'une action compte : réserver en 30 jours, réserver une deuxième fois en 90, être réservé en 60. Elle se règle dans Réglages.",
          en: "How many days a sign-up has for an action to count: book within 30 days, book a second time within 90, get booked within 60. Change it in Settings.",
        },
      },
    },
    findings: {
      verbMkt: {
        first: { fr: "font une première réservation", en: "make a first booking" },
        repeat: { fr: "en font une deuxième", en: "make a second one" },
        firstSale: { fr: "reçoivent une première réservation", en: "receive a first booking" },
      },
    },
    sanity: {
      mktRepeatGtFirst: {
        fr: "Plus de deuxièmes réservations que de premières : les deux chiffres portent-ils sur la même cohorte et la même fenêtre ?",
        en: "More second bookings than first ones: do both numbers cover the same cohort and window?",
      },
    },
    settings: {
      windowHint: {
        fr: "La fenêtre : le nombre de jours qu'a un client ou un prestataire, depuis son inscription, pour que ça compte.",
        en: "The window: how many days a client or provider has, from signing up, for it to count.",
      },
      runwayHint: {
        fr: "Sert seulement à te prévenir quand un client ou un prestataire abonné met plus longtemps à rembourser son coût.",
        en: "Only used to warn you when a client or a paid provider takes longer to pay back their cost.",
      },
      // TODO: à relire (convention 6) — neuf le 2026-10-27 (A23 MKT-6, §22.8.4, §22.8.5 a) : les Réglages en « services » — le sujet des abonnements,
      // et les quatre avertissements (« commande » devient « réservation », « première vente » « première réservation reçue »).
      streamSubject: {
        sellerSubscriptions: { fr: "Les abonnements des prestataires", en: "Provider subscriptions" },
      },
      firstOrderReset: {
        fr: "La fenêtre de première réservation fait partie de la définition de la première réservation : ton chiffre déjà saisi repassera « à faire », pour que tu le remesures sur {n} jours.",
        en: "The first-booking window is part of the first booking's definition: the number you already entered will go back to \"to do\", so you can measure it again over {n} days.",
      },
      repeatReset: {
        fr: "La fenêtre de deuxième réservation fait partie de la définition de la deuxième réservation : ton chiffre déjà saisi repassera « à faire », pour que tu le remesures sur {n} jours.",
        en: "The second-booking window is part of the second booking's definition: the number you already entered will go back to \"to do\", so you can measure it again over {n} days.",
      },
      firstSaleReset: {
        fr: "La fenêtre de première réservation reçue fait partie de la définition de la première réservation reçue : ton chiffre déjà saisi repassera « à faire », pour que tu le remesures sur {n} jours.",
        en: "The first-booking-received window is part of the definition of the first booking received: the number you already entered will go back to \"to do\", so you can measure it again over {n} days.",
      },
      firstSalePaidReset: {
        fr: "La fenêtre de première réservation reçue fait partie de la définition de la première réservation reçue et de celle de la conversion en abonné : ce que tu as déjà saisi repassera « à faire », pour que tu le remesures sur {n} jours.",
        en: "The first-booking-received window is part of the definitions of the first booking received and of the subscription conversion: what you already entered will go back to \"to do\", so you can measure it again over {n} days.",
      },
    },
    io: {
      sharedCount: {
        mktCohortSignups: { fr: "inscrits côté clients de la cohorte suivie", en: "client sign-ups in the followed cohort" },
        mktOrders: { fr: "réservations du mois", en: "bookings in the month" },
        mktSellerCohortSignups: { fr: "prestataires inscrits de la cohorte suivie", en: "provider sign-ups in the followed cohort" },
        mktSellerMrrEnd: { fr: "MRR des abonnements prestataires en fin de mois", en: "provider subscription MRR at the month's end" },
      },
    },
  },
  /** The clients: the demand side's leaves of §22.8.4, `acheteur` read « client ». */
  demand: {
    lever: {
      worthOut: {
        fr: "Un nouveau client : plus de perte. Il rapporte {ltv} pour {cac} : {gap} de plus.",
        en: "One new client: no longer a loss. They bring back {ltv} for {cac}: {gap} more.",
      },
      worthMaybe: {
        fr: "Un nouveau client : plus de perte certaine. Il rapporte {ltv} pour {cac} : les deux fourchettes se chevauchent.",
        en: "One new client: no longer a certain loss. They bring back {ltv} for {cac}: the two ranges overlap.",
      },
      worthLess: { fr: "Un nouveau client : toujours une perte, de {gap} au lieu de {before}.", en: "One new client: still a loss, of {gap} instead of {before}." },
      worthStill: {
        fr: "Un nouveau client : toujours une perte de {gap}. Ce levier ne change ni ce que rapporte un client ni ce qu'il coûte.",
        en: "One new client: still a loss of {gap}. This lever changes neither what a client brings back nor what they cost.",
      },
      worthStillMany: {
        fr: "Un nouveau client : toujours une perte de {gap}. Tes « Et si » ne changent ni ce que rapporte un client ni ce qu'il coûte.",
        en: "One new client: still a loss of {gap}. Your what-ifs change neither what a client brings back nor what they cost.",
      },
    },
    money: {
      worthTitle: { fr: "Ce que vaut un nouveau client", en: "What one new client is worth" },
      healthy: {
        fr: "Chaque nouveau client coûte {cac} et rapporte {ltv} de marge : {gap} de plus que ce qu'il coûte.",
        en: "Each new client costs {cac} and brings back {ltv} of margin: {gap} more than they cost.",
      },
      noLtv: {
        fr: "On ne peut pas encore dire ce que rapporte un nouveau client : il manque {input}.",
        en: "We can't tell yet what a new client brings back. Missing: {input}.",
      },
      noCac: {
        fr: "Un nouveau client rapporte {ltv} de marge ; ce qu'il coûte, on ne le sait pas encore : il manque {input}.",
        en: "A new client brings back {ltv} of margin; what they cost isn't known yet. Missing: {input}.",
      },
      monthsLoss: {
        fr: "Un client reste {life} ; rembourser son coût en prendrait {payback} : il part avant.",
        en: "A client stays {life}; paying back their cost would take {payback}: they leave before.",
      },
      monthsMaybe: {
        fr: "Un client reste {life} ; rembourser son coût en prend {payback} : il peut partir avant.",
        en: "A client stays {life}; paying back their cost takes {payback}: they may leave before.",
      },
      lineLoss: {
        fr: "Et elle ne revient pas toute : les clients partent avant d'avoir remboursé.",
        en: "And it does not all come back: clients leave before they pay back.",
      },
      lineMaybe: {
        fr: "Qu'elle revienne toute n'est pas sûr : les clients peuvent partir avant d'avoir remboursé.",
        en: "Whether it all comes back isn't certain: clients may leave before they pay back.",
      },
      lineHealthy: { fr: "Elle revient toute, au fil des remboursements.", en: "It all comes back, as clients pay back." },
      warnRunway: {
        fr: "Un client met {payback} à rembourser son coût, plus que ton runway ({n}) : tu gagnes de l'argent, mais peut-être après la fin de ta trésorerie.",
        en: "A client takes {payback} to pay back their cost, longer than your runway ({n}): you make money, but maybe after your cash runs out.",
      },
      warnRunwayMaybe: {
        fr: "Un client met {payback} à rembourser son coût : peut-être plus que ton runway ({n}).",
        en: "A client takes {payback} to pay back their cost: maybe longer than your runway ({n}).",
      },
      warnFloor: {
        fr: "Un client met {payback} à rembourser son coût : {n} ou plus. Tu gagnes de l'argent, mais tard. Saisis ton runway dans les Réglages pour y comparer ton payback.",
        en: "A client takes {payback} to pay back their cost: {n} or more. You make money, but late. Type your runway in Settings to hold your payback against it.",
      },
      warnFloorMaybe: {
        fr: "Un client met {payback} à rembourser son coût : peut-être {n} ou plus. Saisis ton runway dans les Réglages pour y comparer ton payback.",
        en: "A client takes {payback} to pay back their cost: maybe {n} or more. Type your runway in Settings to hold your payback against it.",
      },
    },
    worth: {
      customers: { fr: "{n} clients de plus par mois", en: "{n} more clients a month" },
      customersOne: { fr: "{n} client de plus par mois", en: "{n} more client a month" },
      kept: { fr: "{n} clients gardés par mois", en: "{n} clients kept a month" },
      keptOne: { fr: "{n} client gardé par mois", en: "{n} client kept a month" },
      perHundred: { fr: "{n} clients de plus pour 100 inscrits", en: "{n} more clients per 100 sign-ups" },
      perHundredOne: { fr: "{n} client de plus pour 100 inscrits", en: "{n} more client per 100 sign-ups" },
      lessThanOne: { fr: "moins d'un client de plus par mois", en: "less than one more client a month" },
    },
    diagnosis: {
      clear: { fr: "Une étape freine les clients", en: "One stage holds the clients back" },
      shared: { fr: "{n} étapes freinent les clients autant l'une que l'autre", en: "{n} stages hold the clients back about equally" },
      level: { fr: "Rien ne freine les clients", en: "Nothing holds the clients back" },
      notEnough: { fr: "Pas assez de cibles pour nommer ce qui freine les clients", en: "Not enough targets to name what holds the clients back" },
    },
    whatIf: {
      times: { fr: "× revenu net par client actif", en: "× net revenue per active client" },
      todayFlow: { fr: "{rate}, soit {n} nouveaux clients par mois", en: "{rate}, i.e. {n} new clients a month" },
      todayFlowOne: { fr: "{rate}, soit {n} nouveau client par mois", en: "{rate}, i.e. {n} new client a month" },
      todayPerHundred: { fr: "{rate}, soit {n} clients pour 100 inscrits", en: "{rate}, i.e. {n} clients per 100 sign-ups" },
      todayPerHundredOne: { fr: "{rate}, soit {n} client pour 100 inscrits", en: "{rate}, i.e. {n} client per 100 sign-ups" },
      timesFlow: { fr: "{arpa} par client, soit {amount} de revenu net ajouté chaque mois", en: "{arpa} per client, i.e. {amount} of net revenue added every month" },
      todayChurn: { fr: "{churn} de churn sur {base} clients actifs", en: "{churn} churn on {base} active clients" },
      thenChurn: { fr: "{base} × ({churn} – {target}) = {n} clients gardés par mois", en: "{base} × ({churn} – {target}) = {n} clients kept a month" },
      thenChurnOne: { fr: "{base} × ({churn} – {target}) = {n} client gardé par mois", en: "{base} × ({churn} – {target}) = {n} client kept a month" },
      timesChurn: { fr: "{arpa} par client, soit {amount} de revenu net préservé chaque mois", en: "{arpa} per client, i.e. {amount} of net revenue kept every month" },
      lessThanOne: { fr: "Moins d'un client de plus par mois.", en: "Less than one more client a month." },
    },
    scenario: {
      intro: {
        fr: "Bouge un ou plusieurs leviers : le funnel et les chiffres des clients se recalculent ensemble, les effets se cumulent.",
        en: "Move one lever or several: the clients' funnel and figures recompute together, and the effects add up.",
      },
      paying: { fr: "Nouveaux clients", en: "New clients" },
      figuresCustomer: { fr: "Un nouveau client", en: "One new client" },
      rowGap: { fr: "Par nouveau client", en: "Per new client" },
      assumeLtv: {
        fr: "LTV : la marge mensuelle sur la durée de vie comptée d'un client (1 ÷ churn des clients, plafonnée à 36 mois), au revenu net par client actif d'aujourd'hui.",
        en: "LTV: the monthly margin over a client's counted lifetime (1 ÷ client churn, capped at 36 months), on today's net revenue per active client.",
      },
      assumeCash: {
        fr: "Trésorerie immobilisée : la dépense d'acquisition du mois × le payback ÷ 2. La dépense de chaque mois revient régulièrement sur le payback ; le churn, qui la ralentit, n'est pas compté (un plancher). Même dépense avec les « Et si » : plus de nouveaux clients rendent chacun moins cher.",
        en: "Cash tied up: the month's acquisition spend × the payback ÷ 2. Each month's spend comes back evenly over the payback; churn, which slows it, is not counted (a floor). The same spend with the what-ifs: more new clients make each one cheaper.",
      },
      assumption: {
        "same-spend": {
          fr: "À dépense égale : plus de nouveaux clients font baisser le CAC dans la même proportion.",
          en: "Same spend: more new clients lower the CAC in the same proportion.",
        },
        "twelve-months": {
          fr: "Sur 12 mois, au rythme de ce mois : le revenu net gardé chaque mois au rythme du churn des clients, plus le revenu net nouveau du mois. Ni saisonnalité, ni saturation.",
          en: "Over 12 months, at this month's pace: the net revenue kept each month at the client churn's pace, plus the month's new net revenue. No seasonality, no saturation.",
        },
      },
    },
    terms: {
      cashTied: {
        definition: {
          fr: "Ce que ton acquisition garde hors de la banque à tout moment. Chaque mois, tu dépenses pour gagner des clients ; chacun te le rembourse sur la durée du payback. À rythme constant, la moitié de la dépense d'un payback est dehors. Un plancher : le churn ralentit le retour.",
          en: "What your acquisition keeps out of the bank at any time. Each month you spend to win new clients; each of them pays that back over the payback. At a steady pace, half a payback's worth of spend is out. A floor: churn slows the return.",
        },
      },
      afterPayback: {
        definition: {
          fr: "Combien de temps un client continue de rapporter de la marge une fois son coût d'acquisition remboursé : sa durée de vie moins le payback. Sous zéro, il part avant d'avoir remboursé : c'est la perte, dite en mois.",
          en: "How long a client keeps bringing in margin once their acquisition cost is paid back: their lifetime minus the payback. Below zero, they leave before paying back: that is the loss, said in months.",
        },
      },
    },
    slide: {
      unitWarnRunway: {
        fr: "Un client met {payback} à rembourser son coût, plus que notre runway ({n}) : nous gagnons de l'argent, mais peut-être après la fin de notre trésorerie.",
        en: "A client takes {payback} to pay back their cost, longer than our runway ({n}): we make money, but maybe after our cash runs out.",
      },
      unitWarnRunwayMaybe: {
        fr: "Un client met {payback} à rembourser son coût : peut-être plus que notre runway ({n}).",
        en: "A client takes {payback} to pay back their cost: maybe longer than our runway ({n}).",
      },
      unitWarnFloor: {
        fr: "Un client met {payback} à rembourser son coût : {n} ou plus. Nous gagnons de l'argent, mais tard.",
        en: "A client takes {payback} to pay back their cost: {n} or more. We make money, but late.",
      },
      unitWarnFloorMaybe: {
        fr: "Un client met {payback} à rembourser son coût : peut-être {n} ou plus.",
        en: "A client takes {payback} to pay back their cost: maybe {n} or more.",
      },
      chartCost: { fr: "ce que coûte un nouveau client", en: "what a new client costs" },
      chartSummaryLoss: {
        fr: "Un client, mois par mois : il rapporte {mm} de marge par mois et part après environ {life}, à {gap} des {cac} qu'il a coûté ; il aurait remboursé à {payback}.",
        en: "One client, month by month: they bring back {mm} of margin a month and leave after about {life}, {gap} short of the {cac} they cost; they would have paid back at {payback}.",
      },
      chartSummaryHealthy: {
        fr: "Un client, mois par mois : il rapporte {mm} de marge par mois, rembourse ses {cac} à {payback} et reste {life}.",
        en: "One client, month by month: they bring back {mm} of margin a month, pay back their {cac} at {payback} and stay {life}.",
      },
      chartSummaryMaybe: {
        fr: "Un client, mois par mois : il rapporte {mm} de marge par mois et reste {life} ; rembourser ses {cac} prend {payback} : il peut partir avant.",
        en: "One client, month by month: they bring back {mm} of margin a month and stay {life}; paying back their {cac} takes {payback}: they may leave before.",
      },
      chartSummaryNone: {
        fr: "Un client, mois par mois : son coût est connu ({cac}), ce qu'il rapporte non : il manque {input}.",
        en: "One client, month by month: their cost is known ({cac}), what they bring back is not. Missing: {input}.",
      },
    },
    slideTitles: {
      leakClearCustomers: {
        fr: "Ramener {stage} à {target} ajouterait **{n} nouveaux clients** par mois.",
        en: "Bringing {stage} to {target} would add **{n} new clients** a month.",
      },
      leakClearCustomersOne: {
        fr: "Ramener {stage} à {target} ajouterait **{n} nouveau client** par mois.",
        en: "Bringing {stage} to {target} would add **{n} new client** a month.",
      },
      leakClearKept: {
        fr: "Ramener {stage} à {target} garderait **{n} clients actifs** de plus par mois.",
        en: "Bringing {stage} to {target} would keep **{n} more active clients** a month.",
      },
      leakClearKeptOne: {
        fr: "Ramener {stage} à {target} garderait **{n} client actif** de plus par mois.",
        en: "Bringing {stage} to {target} would keep **{n} more active client** a month.",
      },
      leakClearPerHundred: {
        fr: "Ramener {stage} à {target} ajouterait **{n} clients pour 100 inscrits**.",
        en: "Bringing {stage} to {target} would add **{n} clients per 100 sign-ups**.",
      },
      leakClearPerHundredOne: {
        fr: "Ramener {stage} à {target} ajouterait **{n} client pour 100 inscrits**.",
        en: "Bringing {stage} to {target} would add **{n} client per 100 sign-ups**.",
      },
      unitEconomics: {
        fr: "Un client rembourse son coût d'acquisition en **{m}** et rapporte **{x}** ce qu'il coûte.",
        en: "A client pays back their acquisition cost in **{m}** and brings in **{x}** what they cost.",
      },
      unitEconomicsUnknown: {
        fr: "**On ne peut pas encore dire ce que rapporte un client.** Il manque {input}.",
        en: "**We can't yet say what a client is worth.** Missing: {input}.",
      },
      unitEconomicsLoss: {
        fr: "Chaque nouveau client nous coûte {cac} et en rapporte {ltv} : **on perd {gap} sur chacun**.",
        en: "Each new client costs us {cac} and brings back {ltv}: **we lose {gap} on each one**.",
      },
    },
    findings: {
      unitEcon: {
        fr: "Impossible de dire en combien de mois un client rembourse son coût d'acquisition. Il manque {input}.",
        en: "We can't say how many months a client takes to pay back their acquisition cost. Missing: {input}.",
      },
      unitEconLoss: {
        fr: "Chaque nouveau client coûte {cac} et rapporte {ltv} de marge : tu perds {gap} sur chacun.",
        en: "Each new client costs {cac} and brings back {ltv} of margin: you lose {gap} on each one.",
      },
      unitEconLossMaybe: {
        fr: "Un nouveau client coûte {cac} et rapporte {ltv} de marge : il ne rembourse peut-être pas ce qu'il coûte.",
        en: "A new client costs {cac} and brings back {ltv} of margin: they may not pay back what they cost.",
      },
      reconcile: {
        fr: "Ta chaîne prédit ~{p} nouveaux clients en {month} ; ton CAC client en compte {n}. Au moins une définition ne porte pas sur la même population.",
        en: "Your chain predicts ~{p} new clients in {month}; your client CAC counts {n}. At least one definition doesn't cover the same population.",
      },
      reconcileOne: {
        fr: "Ta chaîne prédit ~{p} nouveau client en {month} ; ton CAC client en compte {n}. Au moins une définition ne porte pas sur la même population.",
        en: "Your chain predicts ~{p} new client in {month}; your client CAC counts {n}. At least one definition doesn't cover the same population.",
      },
    },
    sanity: {
      reconcileGap: {
        fr: "Ta chaîne prédit ~{p} nouveaux clients en {month} ; ton CAC client en compte {n}. Au moins une définition ne porte pas sur la même population.",
        en: "Your chain predicts ~{p} new clients in {month}; your client CAC counts {n}. At least one definition doesn't cover the same population.",
      },
      reconcileGapOne: {
        fr: "Ta chaîne prédit ~{p} nouveau client en {month} ; ton CAC client en compte {n}. Au moins une définition ne porte pas sur la même population.",
        en: "Your chain predicts ~{p} new client in {month}; your client CAC counts {n}. At least one definition doesn't cover the same population.",
      },
    },
  },
  /** The providers: the supply side's leaves of §22.8.4, `vendeur abonné` read « prestataire abonné », « vendeur inscrit » « prestataire inscrit ». */
  supply: {
    board: {
      smallCohort: {
        fr: "Petits effectifs : moins de 100 prestataires inscrits dans cette cohorte. Lis la direction, pas les décimales.",
        en: "Small numbers: fewer than 100 provider sign-ups in this cohort. Read the direction, not the decimals.",
      },
    },
    lever: {
      worthOut: {
        fr: "Un nouveau prestataire abonné : plus de perte. Il rapporte {ltv} pour {cac} : {gap} de plus.",
        en: "One new paid provider: no longer a loss. They bring back {ltv} for {cac}: {gap} more.",
      },
      worthMaybe: {
        fr: "Un nouveau prestataire abonné : plus de perte certaine. Il rapporte {ltv} pour {cac} : les deux fourchettes se chevauchent.",
        en: "One new paid provider: no longer a certain loss. They bring back {ltv} for {cac}: the two ranges overlap.",
      },
      worthLess: {
        fr: "Un nouveau prestataire abonné : toujours une perte, de {gap} au lieu de {before}.",
        en: "One new paid provider: still a loss, of {gap} instead of {before}.",
      },
      worthStill: {
        fr: "Un nouveau prestataire abonné : toujours une perte de {gap}. Ce levier ne change ni ce que rapporte un prestataire abonné ni ce qu'il coûte.",
        en: "One new paid provider: still a loss of {gap}. This lever changes neither what a paid provider brings back nor what they cost.",
      },
      worthStillMany: {
        fr: "Un nouveau prestataire abonné : toujours une perte de {gap}. Tes « Et si » ne changent ni ce que rapporte un prestataire abonné ni ce qu'il coûte.",
        en: "One new paid provider: still a loss of {gap}. Your what-ifs change neither what a paid provider brings back nor what they cost.",
      },
    },
    money: {
      worthTitle: { fr: "Ce que vaut un nouveau prestataire abonné", en: "What one new paid provider is worth" },
      healthy: {
        fr: "Chaque nouveau prestataire abonné coûte {cac} et rapporte {ltv} de marge : {gap} de plus que ce qu'il coûte.",
        en: "Each new paid provider costs {cac} and brings back {ltv} of margin: {gap} more than they cost.",
      },
      noLtv: {
        fr: "On ne peut pas encore dire ce que rapporte un nouveau prestataire abonné : il manque {input}.",
        en: "We can't tell yet what a new paid provider brings back. Missing: {input}.",
      },
      noCac: {
        fr: "Un nouveau prestataire abonné rapporte {ltv} de marge ; ce qu'il coûte, on ne le sait pas encore : il manque {input}.",
        en: "A new paid provider brings back {ltv} of margin; what they cost isn't known yet. Missing: {input}.",
      },
      monthsLoss: {
        fr: "Un prestataire abonné reste {life} ; rembourser son coût en prendrait {payback} : il part avant.",
        en: "A paid provider stays {life}; paying back their cost would take {payback}: they leave before.",
      },
      monthsMaybe: {
        fr: "Un prestataire abonné reste {life} ; rembourser son coût en prend {payback} : il peut partir avant.",
        en: "A paid provider stays {life}; paying back their cost takes {payback}: they may leave before.",
      },
      lineLoss: {
        fr: "Et elle ne revient pas toute : les prestataires abonnés partent avant d'avoir remboursé.",
        en: "And it does not all come back: paid providers leave before they pay back.",
      },
      lineMaybe: {
        fr: "Qu'elle revienne toute n'est pas sûr : les prestataires abonnés peuvent partir avant d'avoir remboursé.",
        en: "Whether it all comes back isn't certain: paid providers may leave before they pay back.",
      },
      lineHealthy: { fr: "Elle revient toute, au fil des remboursements.", en: "It all comes back, as paid providers pay back." },
      warnRunway: {
        fr: "Un prestataire abonné met {payback} à rembourser son coût, plus que ton runway ({n}) : tu gagnes de l'argent, mais peut-être après la fin de ta trésorerie.",
        en: "A paid provider takes {payback} to pay back their cost, longer than your runway ({n}): you make money, but maybe after your cash runs out.",
      },
      warnRunwayMaybe: {
        fr: "Un prestataire abonné met {payback} à rembourser son coût : peut-être plus que ton runway ({n}).",
        en: "A paid provider takes {payback} to pay back their cost: maybe longer than your runway ({n}).",
      },
      warnFloor: {
        fr: "Un prestataire abonné met {payback} à rembourser son coût : {n} ou plus. Tu gagnes de l'argent, mais tard. Saisis ton runway dans les Réglages pour y comparer ton payback.",
        en: "A paid provider takes {payback} to pay back their cost: {n} or more. You make money, but late. Type your runway in Settings to hold your payback against it.",
      },
      warnFloorMaybe: {
        fr: "Un prestataire abonné met {payback} à rembourser son coût : peut-être {n} ou plus. Saisis ton runway dans les Réglages pour y comparer ton payback.",
        en: "A paid provider takes {payback} to pay back their cost: maybe {n} or more. Type your runway in Settings to hold your payback against it.",
      },
    },
    worth: {
      customers: { fr: "{n} prestataires abonnés de plus par mois", en: "{n} more paid providers a month" },
      customersOne: { fr: "{n} prestataire abonné de plus par mois", en: "{n} more paid provider a month" },
      kept: { fr: "{n} prestataires abonnés gardés par mois", en: "{n} paid providers kept a month" },
      keptOne: { fr: "{n} prestataire abonné gardé par mois", en: "{n} paid provider kept a month" },
      perHundred: { fr: "{n} prestataires abonnés de plus pour 100 prestataires inscrits", en: "{n} more paid providers per 100 provider sign-ups" },
      perHundredOne: { fr: "{n} prestataire abonné de plus pour 100 prestataires inscrits", en: "{n} more paid provider per 100 provider sign-ups" },
      lessThanOne: { fr: "moins d'un prestataire abonné de plus par mois", en: "less than one more paid provider a month" },
    },
    sheet: {
      cohortToUse: {
        fr: "Prends les prestataires inscrits en {cohort} : les prestataires inscrits en {next} n'ont pas encore eu {n} jours.",
        en: "Use the provider sign-ups from {cohort}: those from {next} haven't had {n} days yet.",
      },
    },
    diagnosis: {
      clear: { fr: "Une étape freine les prestataires", en: "One stage holds the providers back" },
      shared: { fr: "{n} étapes freinent les prestataires autant l'une que l'autre", en: "{n} stages hold the providers back about equally" },
      level: { fr: "Rien ne freine les prestataires", en: "Nothing holds the providers back" },
      notEnough: { fr: "Pas assez de cibles pour nommer ce qui freine les prestataires", en: "Not enough targets to name what holds the providers back" },
    },
    whatIf: {
      times: { fr: "× revenu par prestataire abonné", en: "× revenue per paid provider" },
      todayFlow: { fr: "{rate}, soit {n} nouveaux prestataires abonnés par mois", en: "{rate}, i.e. {n} new paid providers a month" },
      todayFlowOne: { fr: "{rate}, soit {n} nouveau prestataire abonné par mois", en: "{rate}, i.e. {n} new paid provider a month" },
      todayPerHundred: { fr: "{rate}, soit {n} prestataires abonnés pour 100 prestataires inscrits", en: "{rate}, i.e. {n} paid providers per 100 provider sign-ups" },
      todayPerHundredOne: { fr: "{rate}, soit {n} prestataire abonné pour 100 prestataires inscrits", en: "{rate}, i.e. {n} paid provider per 100 provider sign-ups" },
      timesFlow: {
        fr: "{arpa} par prestataire abonné, soit {amount} de MRR des abonnements ajouté chaque mois",
        en: "{arpa} per paid provider, i.e. {amount} of subscription MRR added every month",
      },
      todayChurn: { fr: "{churn} de churn sur {base} prestataires abonnés", en: "{churn} churn on {base} paid providers" },
      thenChurn: { fr: "{base} × ({churn} – {target}) = {n} prestataires abonnés gardés par mois", en: "{base} × ({churn} – {target}) = {n} paid providers kept a month" },
      thenChurnOne: { fr: "{base} × ({churn} – {target}) = {n} prestataire abonné gardé par mois", en: "{base} × ({churn} – {target}) = {n} paid provider kept a month" },
      timesChurn: {
        fr: "{arpa} par prestataire abonné, soit {amount} de MRR des abonnements préservé chaque mois",
        en: "{arpa} per paid provider, i.e. {amount} of subscription MRR kept every month",
      },
      lessThanOne: { fr: "Moins d'un prestataire abonné de plus par mois.", en: "Less than one more paid provider a month." },
    },
    scenario: {
      intro: {
        fr: "Bouge un ou plusieurs leviers : les abonnements des prestataires se recalculent, les effets se cumulent. Les leviers des clients sont de leur côté.",
        en: "Move one lever or several: the providers' subscriptions recompute, and the effects add up. The clients' levers are on their side.",
      },
      visitors: { fr: "Visiteurs de la page prestataires", en: "Provider page visitors" },
      signups: { fr: "Prestataires inscrits", en: "Provider sign-ups" },
      paying: { fr: "Nouveaux prestataires abonnés", en: "New paid providers" },
      kpiCac: { fr: "Coût d'un prestataire abonné", en: "Cost per paid provider" },
      figuresCustomer: { fr: "Un nouveau prestataire abonné", en: "One new paid provider" },
      rowGap: { fr: "Par nouveau prestataire abonné", en: "Per new paid provider" },
      assumeLtv: {
        fr: "LTV : la marge mensuelle sur la durée de vie comptée d'un prestataire abonné (1 ÷ churn des prestataires abonnés, plafonnée à 36 mois), au revenu par prestataire abonné d'aujourd'hui.",
        en: "LTV: the monthly margin over a paid provider's counted lifetime (1 ÷ paid provider churn, capped at 36 months), on today's revenue per paid provider.",
      },
      assumeCash: {
        fr: "Trésorerie immobilisée : la dépense d'acquisition du mois × le payback ÷ 2. La dépense de chaque mois revient régulièrement sur le payback ; le churn, qui la ralentit, n'est pas compté (un plancher). Même dépense avec les « Et si » : plus de prestataires abonnés rendent chacun moins cher.",
        en: "Cash tied up: the month's acquisition spend × the payback ÷ 2. Each month's spend comes back evenly over the payback; churn, which slows it, is not counted (a floor). The same spend with the what-ifs: more paid providers make each one cheaper.",
      },
      legendUnit: {
        fr: "Un rond = 1 % des prestataires inscrits d'aujourd'hui : au-delà de 100, la grille s'allonge.",
        en: "One dot = 1% of today's provider sign-ups: past 100, the grid grows.",
      },
      perHundredNote: {
        fr: "Sans le nombre de prestataires inscrits du mois, le funnel se lit pour 100 prestataires inscrits.",
        en: "Without the month's provider sign-up count, the funnel reads per 100 provider sign-ups.",
      },
      assumption: {
        "signup-same-visitors": {
          fr: "Le taux d'inscription des prestataires s'applique aux mêmes visiteurs de la page prestataires qu'aujourd'hui.",
          en: "The provider sign-up rate applies to the same provider page visitors as today.",
        },
        "same-spend": {
          fr: "À dépense égale : plus de prestataires abonnés font baisser le coût d'un prestataire abonné dans la même proportion.",
          en: "Same spend: more paid providers lower the cost per paid provider in the same proportion.",
        },
        "twelve-months": {
          fr: "Sur 12 mois, au rythme de ce mois : le MRR des abonnements gardé chaque mois au rythme du churn des prestataires abonnés, plus le nouveau MRR des abonnements du mois. Ni saisonnalité, ni saturation.",
          en: "Over 12 months, at this month's pace: the subscription MRR kept each month at the paid provider churn's pace, plus the month's new subscription MRR. No seasonality, no saturation.",
        },
      },
    },
    terms: {
      sharedCount: {
        definition: {
          fr: "Un nombre que plusieurs chiffres utilisent, comme les prestataires inscrits du mois. Saisi une fois : le modifier dans un chiffre le modifie dans les autres, sauf celui qu'il rendrait impossible : il garde sa base, et son écran le dit.",
          en: "A count several numbers use, like the month's provider sign-ups. Typed once: change it in one number and it changes in the others, except one it would make impossible: that one keeps its own base, and its screen says so.",
        },
      },
      cashTied: {
        definition: {
          fr: "Ce que ton acquisition garde hors de la banque à tout moment. Chaque mois, tu dépenses pour gagner des prestataires abonnés ; chacun te le rembourse sur la durée du payback. À rythme constant, la moitié de la dépense d'un payback est dehors. Un plancher : le churn ralentit le retour.",
          en: "What your acquisition keeps out of the bank at any time. Each month you spend to win new paid providers; each of them pays that back over the payback. At a steady pace, half a payback's worth of spend is out. A floor: churn slows the return.",
        },
      },
      afterPayback: {
        definition: {
          fr: "Combien de temps un prestataire abonné continue de rapporter de la marge une fois son coût d'acquisition remboursé : sa durée de vie moins le payback. Sous zéro, il part avant d'avoir remboursé : c'est la perte, dite en mois.",
          en: "How long a paid provider keeps bringing in margin once their acquisition cost is paid back: their lifetime minus the payback. Below zero, they leave before paying back: that is the loss, said in months.",
        },
      },
    },
    visual: {
      cohortOf: { fr: "prestataires inscrits en {cohort}", en: "{cohort} cohort" },
      upstreamUnknown: {
        fr: "Visiteurs de la page prestataires pour 100 prestataires inscrits : non mesuré",
        en: "Provider page visitors for 100 provider sign-ups: not measured",
      },
      tablePerHundred: { fr: "Sur 100 prestataires inscrits", en: "Out of 100 provider sign-ups" },
    },
    slide: {
      footer: { fr: "Prestataires inscrits en {cohort} · flux : {month} · sources : {tools}", en: "{cohort} provider sign-ups · {month} flows · sources: {tools}" },
      unitWarnRunway: {
        fr: "Un prestataire abonné met {payback} à rembourser son coût, plus que notre runway ({n}) : nous gagnons de l'argent, mais peut-être après la fin de notre trésorerie.",
        en: "A paid provider takes {payback} to pay back their cost, longer than our runway ({n}): we make money, but maybe after our cash runs out.",
      },
      unitWarnRunwayMaybe: {
        fr: "Un prestataire abonné met {payback} à rembourser son coût : peut-être plus que notre runway ({n}).",
        en: "A paid provider takes {payback} to pay back their cost: maybe longer than our runway ({n}).",
      },
      unitWarnFloor: {
        fr: "Un prestataire abonné met {payback} à rembourser son coût : {n} ou plus. Nous gagnons de l'argent, mais tard.",
        en: "A paid provider takes {payback} to pay back their cost: {n} or more. We make money, but late.",
      },
      unitWarnFloorMaybe: {
        fr: "Un prestataire abonné met {payback} à rembourser son coût : peut-être {n} ou plus.",
        en: "A paid provider takes {payback} to pay back their cost: maybe {n} or more.",
      },
      chartCost: { fr: "ce que coûte un nouveau prestataire abonné", en: "what a new paid provider costs" },
      chartSummaryLoss: {
        fr: "Un prestataire abonné, mois par mois : il rapporte {mm} de marge par mois et part après environ {life}, à {gap} des {cac} qu'il a coûté ; il aurait remboursé à {payback}.",
        en: "One paid provider, month by month: they bring back {mm} of margin a month and leave after about {life}, {gap} short of the {cac} they cost; they would have paid back at {payback}.",
      },
      chartSummaryHealthy: {
        fr: "Un prestataire abonné, mois par mois : il rapporte {mm} de marge par mois, rembourse ses {cac} à {payback} et reste {life}.",
        en: "One paid provider, month by month: they bring back {mm} of margin a month, pay back their {cac} at {payback} and stay {life}.",
      },
      chartSummaryMaybe: {
        fr: "Un prestataire abonné, mois par mois : il rapporte {mm} de marge par mois et reste {life} ; rembourser ses {cac} prend {payback} : il peut partir avant.",
        en: "One paid provider, month by month: they bring back {mm} of margin a month and stay {life}; paying back their {cac} takes {payback}: they may leave before.",
      },
      chartSummaryNone: {
        fr: "Un prestataire abonné, mois par mois : son coût est connu ({cac}), ce qu'il rapporte non : il manque {input}.",
        en: "One paid provider, month by month: their cost is known ({cac}), what they bring back is not. Missing: {input}.",
      },
    },
    slideTitles: {
      leakClearCustomers: {
        fr: "Ramener {stage} à {target} ajouterait **{n} prestataires abonnés** par mois.",
        en: "Bringing {stage} to {target} would add **{n} paid providers** a month.",
      },
      leakClearCustomersOne: {
        fr: "Ramener {stage} à {target} ajouterait **{n} prestataire abonné** par mois.",
        en: "Bringing {stage} to {target} would add **{n} paid provider** a month.",
      },
      leakClearKept: {
        fr: "Ramener {stage} à {target} garderait **{n} prestataires abonnés** de plus par mois.",
        en: "Bringing {stage} to {target} would keep **{n} more paid providers** a month.",
      },
      leakClearKeptOne: {
        fr: "Ramener {stage} à {target} garderait **{n} prestataire abonné** de plus par mois.",
        en: "Bringing {stage} to {target} would keep **{n} more paid provider** a month.",
      },
      leakClearPerHundred: {
        fr: "Ramener {stage} à {target} ajouterait **{n} prestataires abonnés pour 100 prestataires inscrits**.",
        en: "Bringing {stage} to {target} would add **{n} paid providers per 100 provider sign-ups**.",
      },
      leakClearPerHundredOne: {
        fr: "Ramener {stage} à {target} ajouterait **{n} prestataire abonné pour 100 prestataires inscrits**.",
        en: "Bringing {stage} to {target} would add **{n} paid provider per 100 provider sign-ups**.",
      },
      unitEconomics: {
        fr: "Un prestataire abonné rembourse son coût d'acquisition en **{m}** et rapporte **{x}** ce qu'il coûte.",
        en: "A paid provider pays back their acquisition cost in **{m}** and brings in **{x}** what they cost.",
      },
      unitEconomicsUnknown: {
        fr: "**On ne peut pas encore dire ce que rapporte un prestataire abonné.** Il manque {input}.",
        en: "**We can't yet say what a paid provider is worth.** Missing: {input}.",
      },
      unitEconomicsLoss: {
        fr: "Chaque nouveau prestataire abonné nous coûte {cac} et en rapporte {ltv} : **on perd {gap} sur chacun**.",
        en: "Each new paid provider costs us {cac} and brings back {ltv}: **we lose {gap} on each one**.",
      },
    },
    notes: {
      source: {
        fr: "D'où vient ce chiffre ? — {metric} : {tool}, prestataires inscrits en {cohort}.",
        en: "Where does this number come from? — {metric}: {tool}, {cohort} cohort.",
      },
    },
    findings: {
      chainBreak: { fr: "Sur 100 prestataires inscrits, on ne sait pas dire combien {verb}.", en: "Out of 100 provider sign-ups, we can't say how many {verb}." },
      unitEcon: {
        fr: "Impossible de dire en combien de mois un prestataire abonné rembourse son coût d'acquisition. Il manque {input}.",
        en: "We can't say how many months a paid provider takes to pay back their acquisition cost. Missing: {input}.",
      },
      unitEconLoss: {
        fr: "Chaque nouveau prestataire abonné coûte {cac} et rapporte {ltv} de marge : tu perds {gap} sur chacun.",
        en: "Each new paid provider costs {cac} and brings back {ltv} of margin: you lose {gap} on each one.",
      },
      unitEconLossMaybe: {
        fr: "Un nouveau prestataire abonné coûte {cac} et rapporte {ltv} de marge : il ne rembourse peut-être pas ce qu'il coûte.",
        en: "A new paid provider costs {cac} and brings back {ltv} of margin: they may not pay back what they cost.",
      },
      reconcile: {
        fr: "Ta chaîne prédit ~{p} nouveaux prestataires abonnés en {month} ; ta facturation en compte {n}. Au moins une définition ne porte pas sur la même population.",
        en: "Your chain predicts ~{p} new paid providers in {month}; your billing counts {n}. At least one definition doesn't cover the same population.",
      },
      reconcileOne: {
        fr: "Ta chaîne prédit ~{p} nouveau prestataire abonné en {month} ; ta facturation en compte {n}. Au moins une définition ne porte pas sur la même population.",
        en: "Your chain predicts ~{p} new paid provider in {month}; your billing counts {n}. At least one definition doesn't cover the same population.",
      },
      smallCohort: {
        fr: "Moins de 100 prestataires inscrits dans la cohorte : chaque prestataire inscrit pèse plus d'un point de pourcentage.",
        en: "Fewer than 100 provider sign-ups in the cohort: each one weighs more than a percentage point.",
      },
    },
    sanity: {
      reconcileGap: {
        fr: "Ta chaîne prédit ~{p} nouveaux prestataires abonnés en {month} ; ta facturation en compte {n}. Au moins une définition ne porte pas sur la même population.",
        en: "Your chain predicts ~{p} new paid providers in {month}; your billing counts {n}. At least one definition doesn't cover the same population.",
      },
      reconcileGapOne: {
        fr: "Ta chaîne prédit ~{p} nouveau prestataire abonné en {month} ; ta facturation en compte {n}. Au moins une définition ne porte pas sur la même population.",
        en: "Your chain predicts ~{p} new paid provider in {month}; your billing counts {n}. At least one definition doesn't cover the same population.",
      },
    },
    io: {
      sharedCount: {
        cohortSignups: { fr: "prestataires inscrits de la cohorte suivie", en: "provider sign-ups in the followed cohort" },
        monthSignups: { fr: "prestataires inscrits du mois", en: "provider sign-ups in the month" },
      },
    },
  },
};
