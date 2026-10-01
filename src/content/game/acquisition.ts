import type { AcquisitionCopy, DeepTranslatable } from "@/lib/game/copy";
import type { Translatable } from "@/lib/i18n/translatable";
import { RETENTION_CONTENT } from "./retention";

/**
 * ---------------------------------------------------------------------------
 * « LE CÔTÉ OBSCUR », NIVEAU 2 « COMMENT LES GENS VOUS TROUVENT » — every string of the level.
 * ---------------------------------------------------------------------------
 *
 * GAME-BRIEF.md §17, validated by Antoine on 2026-10-01 (C30). The page
 * resolves this tree to one language (`resolveLevelCopy`) and hands it to
 * the island; nothing in the browser imports this file.
 *
 * TODO: à relire — tout ce que ce fichier écrit lui-même, en français comme
 * en anglais : premier jet de la session (2026-10-01, CHANTIERS.md A12.c),
 * d'après les premiers jets du §17. Aucune phrase ici ne vient d'un prototype.
 *
 * ## What comes from level 1, by reference
 *
 * The same CEO, the same desk, the same year: what level 1 already says in
 * words that fit any level — the months, the timeline, the video call, the
 * quarter's news, the CEO's one-liners, the playbook, the loop back to the
 * Tour, the footer — is level 1's own object, not a copy of it. A correction
 * made there lands here, and nothing here asks to be reviewed twice. Only
 * what names the shop, its number or its law is written below.
 *
 * ## The English
 *
 * Written, not translated, under level 1's rules: « DG » is the CEO, French
 * and EU law keep their French names with one clause of explanation, euro
 * amounts stay in euros, the one American case stays in dollars. A
 * « transaction pénale » is a criminal settlement, offered with the
 * prosecutor's agreement — never a fine.
 *
 * ## What stays fictional (brief §8.3)
 *
 * Pédalix, its CEO, the Pédalix Ville 7, the partner brand Ferlune, the
 * creator @deux_roues_et_moi, « une grande enseigne de sport », and the
 * newspapers of the clippings. « Urbain 7 », the spec's first name for the
 * bike, was too close to a real « Urban 7 » (searched on 2026-10-01). A real
 * brand appears in one place only: the `cas` of the catalogue, from the
 * level's whitelist (Booking.com, Expedia, Temu, Shein, Fashion Nova —
 * GAME-BRIEF §17.9, C30 Q4), about something that already happened.
 *
 * ## House rule for the cards (brief §5.5, tested by C3 and C9)
 *
 * A name and a pitch describe the mechanism — never the effect, never the
 * intent. No percentage, no signed number, none of « lent », « rapide »,
 * « efficace », « honnête », « astuce », « faux », « piège » (nor their
 * English cousins), no sentence of consequence. The judgement comes in
 * December.
 *
 * ## Typography
 *
 * U+00A0 before the high punctuation marks, % and the euro sign, after the
 * opening guillemet, and inside digit groups — tested here by C12, since the
 * repo's typography guard sees only the punctuation.
 */
const t = (fr: string, en: string): Translatable => ({ fr, en });

const L1 = RETENTION_CONTENT;

export const ACQUISITION_CONTENT: DeepTranslatable<AcquisitionCopy> = {
  months: L1.months,
  monthInitials: L1.monthInitials,
  quarterPeriod: L1.quarterPeriod,
  timeline: L1.timeline,

  dashboard: {
    label: L1.dashboard.label,
    metric: t("Nouveaux clients", "New customers"),
    metricUnit: t("par mois", "per month"),
    quarterTarget: L1.dashboard.quarterTarget,
    boardTarget: L1.dashboard.boardTarget,
    customers: t("Clients au fichier", "Customers on file"),
    monthEnd: L1.dashboard.monthEnd,
    revenue: t("Chiffre d'affaires mensuel", "Monthly revenue"),
    revenueDelta: L1.dashboard.revenueDelta,
    patience: L1.dashboard.patience,
    patienceLow: L1.dashboard.patienceLow,
    trust: t("Confiance des clients", "Customer trust"),
    radar: L1.dashboard.radar,
    notOnDashboard: L1.dashboard.notOnDashboard,
    hiddenValue: L1.dashboard.hiddenValue,
    revealed: L1.dashboard.revealed,
    delta: L1.dashboard.delta,
  },

  visio: { ...L1.visio, tag: t("DG · Pédalix", "CEO · Pédalix") },

  boss: {
    t1: t(
      "Bonjour. Nouvelle boîte, même promesse : le board veut 3 000 nouveaux clients par mois en décembre, et je leur ai promis. Fin mars, je veux en voir 2 150. Pas 2 100. Tu as deux chantiers ce trimestre. Je ne veux pas savoir comment, je veux le chiffre.",
      "Morning. New company, same promise: the board wants 3,000 new customers a month by December, and I promised them. By the end of March I want to see 2,150. Not 2,100. You have two projects this quarter. I don't want to know how. I want the number.",
    ),
    t2Hit: L1.boss.t2Hit,
    t2Miss: t(
      "Tu m'as fait mentir en comité. {metric} au lieu de 2 150. Ça n'arrivera pas deux fois. Fin juin, {target}.",
      "You made me look like a liar in front of the committee. {metric} instead of 2,150. It won't happen twice. End of June, {target}.",
    ),
    t3Hit: L1.boss.t3Hit,
    t3Miss: L1.boss.t3Miss,
    t4Hit: t(
      "Dernière ligne droite. 3 000 fin décembre et on fête ça.",
      "Home stretch. 3,000 by the end of December and we celebrate.",
    ),
    t4Miss: t(
      "C'est ton dernier trimestre, tu le sais. 3 000 en décembre, ou je présente quelqu'un d'autre au board en janvier.",
      "This is your last quarter, and you know it. 3,000 in December, or I introduce someone else to the board in January.",
    ),
    orderWrap: L1.boss.orderWrap,
    yearEnd: L1.boss.yearEnd,
    fired: L1.boss.fired,
  },

  orders: {
    stock: t(
      "tu affiches le stock sur les fiches. « Plus que trois », ça fait bouger les gens. Le concurrent le fait.",
      'you show the stock on the product pages. "Only three left" gets people moving. The competition does it.',
    ),
    anchor: t(
      "on affiche un prix de référence barré sur toute la gamme. Le prix conseillé du fabricant, ça existe, non ?",
      "we show a struck-through reference price across the range. The manufacturer's recommended price exists, doesn't it?",
    ),
    reviews: t(
      "tu mets les bons avis en avant. Les mauvais, on les modère.",
      "you put the good reviews up front. The bad ones, we moderate.",
    ),
    countdown: t(
      "un compteur sur les offres. Trois heures, et ça repart. Personne ne revient vérifier.",
      "a timer on the offers. Three hours, then it starts again. Nobody comes back to check.",
    ),
    teaser: t(
      "on affiche le prix sans les frais. Les frais, on les montre au panier, comme tout le monde.",
      "we show the price without the fees. The fees, we show in the basket, like everyone does.",
    ),
  },

  hand: {
    ...L1.hand,
    unlocked: t("Débloqué par la question d'origine", "Unlocked by the where-from question"),
    productionEmpty: t(
      "Rien en production pour l'instant. La fiche actuelle : une photo, un prix, la livraison au panier.",
      "Nothing in production yet. The current product page: one photo, one price, delivery in the basket.",
    ),
  },

  cards: {
    delivery: {
      name: t("Livraison annoncée", "Delivery shown upfront"),
      pitch: t(
        "La date et le coût de livraison s'affichent sur la fiche, avant le panier.",
        "The delivery date and cost show on the product page, before the basket.",
      ),
    },
    origin: {
      name: t("Question d'origine", "Where-from question"),
      pitch: t(
        "Une question facultative après chaque première commande : « Comment nous avez-vous connus ? »",
        'One optional question after every first order: "How did you hear about us?"',
      ),
    },
    guides: {
      name: t("Guides de choix", "Buying guides"),
      pitch: t(
        "Des guides pour choisir sa taille de cadre, son vélo selon le trajet, son budget.",
        "Guides to choosing a frame size, a bike for the commute, a budget.",
      ),
    },
    specs: {
      name: t("Fiches complètes", "Complete product pages"),
      pitch: t(
        "Photos sous tous les angles, dimensions, poids et compatibilités sur chaque fiche.",
        "Photos from every angle, dimensions, weight and compatibility on every page.",
      ),
    },
    present: L1.cards.present,
    allin: {
      name: t("Prix livré", "Delivered price"),
      pitch: t(
        "Le prix de la fiche comprend la livraison et tous les frais.",
        "The price on the page includes delivery and every fee.",
      ),
    },
    compare: {
      name: t("Comparatif ouvert", "Open comparison"),
      pitch: t(
        "Un tableau compare nos vélos de ville à ceux de trois concurrents, prix livrés compris.",
        "A table compares our city bikes with three competitors', delivered prices included.",
      ),
    },
    verified: {
      name: t("Avis vérifiés", "Verified reviews"),
      pitch: t(
        "Seuls les acheteurs peuvent laisser un avis, et la fiche dit combien sont vérifiés.",
        "Only buyers can leave a review, and the page says how many are verified.",
      ),
    },
    clean: {
      name: L1.cards.clean.name,
      pitch: t(
        "Revenir aux fiches, aux prix et au classement d'origine.",
        "Go back to the original pages, prices and ranking.",
      ),
    },
    stock: {
      name: t("Indicateur de stock", "Stock indicator"),
      pitch: t(
        "Un badge « Plus que 3 en stock » sur les fiches des modèles mis en avant.",
        'An "Only 3 left in stock" badge on the pages of the featured models.',
      ),
    },
    reviews: {
      name: t("Avis mis en avant", "Featured reviews"),
      pitch: t(
        "Les avis cinq étoiles passent en tête ; ceux sous quatre étoiles attendent une modération.",
        "Five-star reviews go to the top; those under four stars wait for moderation.",
      ),
    },
    countdown: {
      name: t("Compteur d'offre", "Offer timer"),
      pitch: t(
        "Un compte à rebours de trois heures sur les offres, relancé à chaque visite.",
        "A three-hour countdown on offers, restarted at every visit.",
      ),
    },
    watchers: {
      name: t("Alerte d'activité", "Activity alert"),
      pitch: t(
        "« 12 personnes regardent ce vélo », affiché près du bouton d'achat.",
        '"12 people are looking at this bike", shown next to the buy button.',
      ),
    },
    anchor: {
      name: t("Prix de référence", "Reference price"),
      pitch: t(
        "Le prix conseillé du fabricant s'affiche barré au-dessus du prix de vente.",
        "The manufacturer's recommended price shows struck through above the selling price.",
      ),
    },
    native: {
      name: t("Partenariats créateurs", "Creator partnerships"),
      pitch: t(
        "Des créateurs vélo reçoivent un vélo et une rémunération, et le montrent comme le leur dans leurs vidéos.",
        "Cycling creators get a bike and a fee, and show it as their own in their videos.",
      ),
    },
    teaser: {
      name: t("Prix d'appel", "Headline price"),
      pitch: t(
        "Le prix de la fiche s'affiche hors frais de service ; les frais apparaissent au panier.",
        "The page shows the price before the service fee; the fee appears in the basket.",
      ),
    },
    sponsored: {
      name: t("Classement partenaires", "Partner ranking"),
      pitch: t(
        "Les modèles des marques partenaires remontent en tête des résultats de recherche du site.",
        "Models from partner brands move to the top of the site's search results.",
      ),
    },
  },

  // GAME-BRIEF §17.9: checked against the primary sources on 2026-09-30, and
  // again for this wording (JOURNAL.md, A12.c). The legal review of the
  // catalogue stays Antoine's (CHANTIERS.md D9). A commitment or a
  // notification is never told as a sanction.
  patterns: {
    stock: {
      official: t("Fausse rareté", "Fake scarcity"),
      law: t(
        "Affirmer faussement qu'un produit ne sera disponible que très peu de temps, pour pousser à décider tout de suite, fait partie des pratiques commerciales trompeuses interdites en toutes circonstances : article L121-4 du Code de la consommation. Un faux stock trompe aussi sur la disponibilité du produit (article L121-2), et la DGCCRF range les faux stocks parmi les dark patterns illicites.",
        "Falsely claiming that a product will only be available for a very short time, to push for an immediate decision, is one of the misleading commercial practices banned in all circumstances under French law, article L121-4 of the Consumer Code. A fake stock also misleads about the product's availability (article L121-2), and the DGCCRF, France's consumer protection authority, lists fake stocks among unlawful dark patterns.",
      ),
      cas: t(
        "En 2019, Booking.com s'est engagé auprès de la Commission européenne et des autorités de consommation à préciser qu'une « dernière chambre disponible » ne l'est que sur son propre site.",
        'In 2019, Booking.com committed to the European Commission and consumer authorities to make clear that a "last room available" is only the last one on its own site.',
      ),
      tell: t(
        "Un stock qui reste à trois pendant trois semaines n'est pas un stock.",
        "A stock that stays at three for three weeks isn't a stock.",
      ),
    },
    reviews: {
      official: t("Faux avis", "Fake reviews"),
      law: t(
        "Diffuser de faux avis de consommateurs, ou déformer de vrais avis pour promouvoir un produit, est interdit en toutes circonstances, comme affirmer que des avis viennent d'acheteurs sans l'avoir vérifié : article L121-4 du Code de la consommation. Le site doit aussi dire si ses avis sont contrôlés, et comment (article L111-7-2).",
        "Publishing fake consumer reviews, or distorting real ones to promote a product, is banned in all circumstances under French law, as is claiming that reviews come from buyers without checking: article L121-4 of the Consumer Code. A site must also say whether its reviews are checked, and how (article L111-7-2).",
      ),
      cas: t(
        "Aux États-Unis, Fashion Nova a payé 4,2 millions de dollars en 2022 pour clore les accusations de la FTC, l'autorité fédérale de la consommation : l'enseigne aurait bloqué pendant quatre ans la publication des avis de moins de quatre étoiles.",
        "In the United States, Fashion Nova paid $4.2 million in 2022 to settle charges by the FTC, the federal consumer protection agency, that it had blocked reviews under four stars from being posted for four years.",
      ),
      tell: t(
        "Que des cinq étoiles, jamais une critique : quelqu'un a trié.",
        "Nothing but five stars, never a complaint: someone sorted them.",
      ),
    },
    countdown: {
      official: t("Fausse urgence", "Fake urgency"),
      law: t(
        "Le même article que la fausse rareté : annoncer faussement une offre limitée dans le temps, pour pousser à décider tout de suite, est interdit en toutes circonstances (article L121-4 du Code de la consommation). La DGCCRF cite en exemple un compte à rebours qui recommence indéfiniment.",
        "The same article as fake scarcity: falsely announcing a time-limited offer, to push for an immediate decision, is banned in all circumstances under French law (article L121-4 of the Consumer Code). The DGCCRF, France's consumer protection authority, gives a countdown that starts over and over again as an example.",
      ),
      cas: t(
        "En novembre 2024, la Commission européenne et les autorités de consommation ont notifié à Temu des pratiques qu'elles jugeaient illicites, dont de fausses dates limites d'achat. Une notification ouvre une procédure : ce n'est pas une sanction.",
        "In November 2024, the European Commission and consumer authorities notified Temu of practices they considered unlawful, including fake purchase deadlines. A notification opens a procedure: it is not a sanction.",
      ),
      tell: t(
        "Recharge la page : si le compteur repart, il n'y a pas d'offre.",
        "Reload the page: if the timer starts again, there is no offer.",
      ),
    },
    watchers: {
      official: t("Fausse preuve sociale", "Fake social proof"),
      law: t(
        "Aucune des pratiques interdites en toutes circonstances ne la nomme : c'est une pratique commerciale trompeuse, article L121-2 du Code de la consommation. La DGCCRF range la fausse activité, du type « X personnes regardent ce produit », parmi les dark patterns illicites.",
        'None of the practices banned in all circumstances names it: it is a misleading commercial practice under French law, article L121-2 of the Consumer Code. The DGCCRF, France\'s consumer protection authority, lists fake activity, of the "X people are looking at this product" kind, among unlawful dark patterns.',
      ),
      cas: t(
        "En 2019, six sites de réservation d'hôtels, dont Booking.com et Expedia, se sont engagés devant l'autorité britannique de la concurrence à préciser, quand ils disent que d'autres regardent le même hôtel, que ces personnes cherchent peut-être d'autres dates.",
        "In 2019, six hotel booking sites, including Booking.com and Expedia, committed to the UK competition authority to make clear, when they say others are looking at the same hotel, that those people may be searching for other dates.",
      ),
      tell: t(
        "Douze personnes regardent toujours. À trois heures du matin aussi.",
        "Twelve people are always looking. At three in the morning too.",
      ),
    },
    anchor: {
      official: t("Faux prix barré", "Fake reference price"),
      law: t(
        "Un prix barré doit être le prix le plus bas pratiqué par le vendeur dans les trente jours qui précèdent la réduction : article L112-1-1 du Code de la consommation. Sinon, c'est une pratique commerciale trompeuse, un délit que la DGCCRF règle souvent par une transaction pénale, avec l'accord du parquet.",
        "Under French law, a struck-through price must be the lowest price the seller charged in the thirty days before the reduction: article L112-1-1 of the Consumer Code. Otherwise it is a misleading commercial practice, a criminal offence the DGCCRF, France's consumer protection authority, often settles with a criminal settlement agreed by the prosecutor.",
      ),
      cas: t(
        "En 2025, Shein a accepté une transaction de 40 millions d'euros proposée par la DGCCRF avec l'accord du parquet de Paris : 57 % des réductions contrôlées n'en étaient pas, et 11 % cachaient une hausse de prix.",
        "In 2025, Shein accepted a €40 million settlement offered by the DGCCRF with the agreement of the Paris prosecutor: 57% of the reductions checked were not reductions at all, and 11% hid a price rise.",
      ),
      tell: t(
        "Un prix barré se vérifie : c'est le plus bas des trente derniers jours, pas un prix conseillé.",
        "A struck-through price can be checked: it's the lowest of the last thirty days, not a recommended price.",
      ),
    },
    native: {
      official: t("Publicité déguisée", "Disguised advertising"),
      law: t(
        "Faire passer pour un contenu éditorial une promotion qu'on a payée, sans le dire clairement, est interdit en toutes circonstances : article L121-4 du Code de la consommation. Depuis la loi du 9 juin 2023, un créateur payé doit afficher clairement l'intention commerciale de sa publication, par « publicité » ou « collaboration commerciale ».",
        'Passing off a paid promotion as editorial content, without saying so clearly, is banned in all circumstances under French law, article L121-4 of the Consumer Code. Since the law of 9 June 2023, a paid creator must clearly display the commercial intent of a post, with "advertising" or "commercial collaboration".',
      ),
      cas: t(
        "En 2023, la DGCCRF a indiqué que 60 % de la soixantaine d'influenceurs qu'elle avait contrôlés depuis 2021 étaient en anomalie, notamment pour ne pas avoir signalé clairement le caractère commercial de leurs publications.",
        "In 2023, the DGCCRF, France's consumer protection authority, reported that 60% of the sixty or so influencers it had checked since 2021 were in breach, notably for not clearly flagging the commercial nature of their posts.",
      ),
      tell: t(
        "Un vélo qu'on te montre sans dire qui l'a payé est une publicité.",
        "A bike shown to you without saying who paid for it is an advert.",
      ),
    },
    teaser: {
      official: t("Frais cachés", "Hidden fees"),
      law: t(
        "Le prix toutes taxes comprises et les frais de livraison sont des informations substantielles : les taire, ou ne les donner qu'à contretemps, est une omission trompeuse (article L121-3 du Code de la consommation). Le prix affiché doit être la somme effectivement payée ; seuls les frais de livraison peuvent être indiqués à part, à condition d'être annoncés.",
        "Under French law, the price including all taxes and the delivery costs are material information: leaving them out, or giving them too late, is a misleading omission (article L121-3 of the Consumer Code). The displayed price must be the sum actually paid; only delivery costs may be shown separately, provided they are announced.",
      ),
      cas: t(
        "En 2019, Booking.com s'est engagé auprès de la Commission européenne à afficher clairement le prix total, frais et taxes inévitables compris.",
        "In 2019, Booking.com committed to the European Commission to clearly display the total price, unavoidable fees and taxes included.",
      ),
      tell: t(
        "Le vrai prix est celui du dernier écran. Compare celui-là.",
        "The real price is the one on the last screen. Compare that one.",
      ),
    },
    sponsored: {
      official: t("Classement payé non signalé", "Undisclosed paid ranking"),
      law: t(
        "Donner des résultats de recherche sans indiquer clairement qu'un tiers a payé pour être mieux classé est interdit en toutes circonstances : article L121-4 du Code de la consommation.",
        "Showing search results without clearly saying that someone paid for a better ranking is banned in all circumstances under French law, article L121-4 of the Consumer Code.",
      ),
      cas: t(
        "En 2019, Booking.com s'est engagé auprès de la Commission européenne à dire si les paiements des hôteliers influencent leur place dans les résultats. La même année, les sites de réservation contrôlés par l'autorité britannique de la concurrence ont pris le même engagement sur les commissions.",
        "In 2019, Booking.com committed to the European Commission to say whether hotels' payments affect their place in the results. The same year, the booking sites checked by the UK competition authority made the same commitment about commissions.",
      ),
      tell: t(
        "En tête de liste ne veut pas dire meilleur : cherche la mention « sponsorisé ».",
        'Top of the list doesn\'t mean best: look for the word "sponsored".',
      ),
    },
  },

  phone: {
    caption: t("Le parcours d'achat tel que les visiteurs le voient", "The path to purchase as visitors see it"),
    appName: t("Pédalix", "Pédalix"),
    time: t("21:04", "21:04"),
    video: t("Mon vélo de tous les jours", "My everyday bike"),
    videoBy: t("@deux_roues_et_moi", "@deux_roues_et_moi"),
    search: t("Résultats pour « vélo de ville »", 'Results for "city bike"'),
    resultTop: t("Pédalix Ville 7", "Pédalix Ville 7"),
    resultSponsored: t("Ferlune C3", "Ferlune C3"),
    resultMeta: t("48 résultats · triés par pertinence", "48 results · sorted by relevance"),
    compared: t("Comparé à 3 sites, prix livrés", "Compared with 3 sites, delivered prices"),
    product: t("Pédalix Ville 7", "Pédalix Ville 7"),
    productKind: t("Vélo de ville électrique", "Electric city bike"),
    photos: t("12 photos · taille, poids, compatibilités", "12 photos · size, weight, compatibility"),
    price: t("1 290 €", "€1,290"),
    priceStruck: t("1 590 €", "€1,590"),
    discount: t("−19 %", "−19%"),
    priceAllIn: t("1 319 € livré", "€1,319 delivered"),
    rating: t("4,1 ★ · 38 avis", "4.1 ★ · 38 reviews"),
    ratingSorted: t("4,9 ★ · 1 204 avis", "4.9 ★ · 1,204 reviews"),
    verified: t("dont 31 vérifiés (achat prouvé)", "31 of them verified (proof of purchase)"),
    countdown: t("Offre valable encore 02:59:41", "Offer ends in 02:59:41"),
    stock: t("Plus que 3 en stock", "Only 3 left in stock"),
    watchers: t("12 personnes regardent ce vélo", "12 people are looking at this bike"),
    delivery: t("Livré le mardi 14 · 29 €", "Delivered on Tuesday the 14th · €29"),
    guide: t("Quelle taille de cadre pour vous ?", "Which frame size is right for you?"),
    basketTitle: t("Panier", "Basket"),
    basketDelivery: t("Livraison 29 €", "Delivery €29"),
    basketDeliveryIncluded: t("Livraison incluse", "Delivery included"),
    basketFees: t("Frais de service 19 €", "Service fee €19"),
    total: t("Total 1 319 €", "Total €1,319"),
    totalWithFees: t("Total 1 338 €", "Total €1,338"),
    origin: t("Comment nous avez-vous connus ? Facultatif.", "How did you hear about us? Optional."),
    originAnswers: [
      t("Bouche-à-oreille", "Word of mouth"),
      t("Moteur de recherche", "Search engine"),
      t("Autre", "Other"),
    ],
  },

  basket: {
    extra: t("+{amount} au panier", "+{amount} in the basket"),
    none: t("0 € de plus qu'annoncé", "€0 more than shown"),
    feesSuffix: t("des frais obligatoires hors du prix affiché", "mandatory fees outside the displayed price"),
  },

  report: {
    ...L1.report,
    metric: t("Nouveaux clients", "New customers"),
    customers: t("Clients au fichier", "Customers on file"),
    revenue: t("Chiffre d'affaires", "Revenue"),
    driversHeading: t("Pourquoi les nouveaux clients ont bougé : {delta}", "Why new customers moved: {delta}"),
    drivers: {
      ...L1.report.drivers,
      word: t("Ce que tes clients disent de Pédalix", "What your customers say about Pédalix"),
      market: t("Les prix cassés d'une grande enseigne", "A big chain's price cuts"),
    },
  },

  journal: L1.journal,

  effects: {
    insight: L1.effects.insight,
    present: L1.effects.present,
    clean: t("astuces retirées, les nouveaux clients baissent un peu", "tricks removed, new customers dip a little"),
    gain: t("+{pct} % de nouveaux clients ce trimestre", "+{pct}% new customers this quarter"),
    gainRising: t(
      "+{pct} % de nouveaux clients ce trimestre, l'effet monte encore",
      "+{pct}% new customers this quarter, and the effect is still growing",
    ),
    loss: t(
      "−{pct} % de nouveaux clients ce trimestre, des acheteurs mieux informés",
      "−{pct}% new customers this quarter, better-informed buyers",
    ),
    none: L1.effects.none,
  },

  events: {
    midMailMoving: L1.events.midMailMoving,
    midMailStalled: L1.events.midMailStalled,
    present: L1.events.present,
    surveyAnswers: t(
      "Les réponses sont arrivées : 4 nouveaux clients sur 10 sont venus par le bouche-à-oreille, 3 sur 10 par un moteur de recherche. Tes prochains chantiers viseront plus juste, et tu as enfin de quoi montrer au DG : « Point données avec le DG » est débloqué.",
      'The answers are in: 4 new customers in 10 came by word of mouth, 3 in 10 through a search engine. Your next projects will aim better, and you finally have something to show the CEO: "Data review with the CEO" is unlocked.',
    ),
    control: t(
      "Contrôle de la DGCCRF sur le site, article dans la presse, transaction de {fine} proposée avec l'accord du parquet. Le DG te demande de tout retirer avant vendredi. {leavers} clients demandent la suppression de leur compte.",
      "An inspection of the site by the DGCCRF, France's consumer protection authority, an article in the press, and a criminal settlement of {fine} offered with the prosecutor's agreement. The CEO asks you to take everything down by Friday. {leavers} customers ask for their accounts to be deleted.",
    ),
    reports: L1.events.reports,
    viral: t(
      "Un fil viral sur un forum de cyclistes : « Pédalix, je ne leur fais plus confiance, voici pourquoi. » Les visiteurs repartent sans commander.",
      'A viral thread on a cycling forum: "Pédalix, I don\'t trust them any more, here\'s why." Visitors leave without ordering.',
    ),
    press: t(
      "Un magazine vélo cite Pédalix en exemple d'une boutique qui ne force pas la main. Les visiteurs arrivent d'eux-mêmes.",
      "A cycling magazine cites Pédalix as a shop that doesn't push people into buying. Visitors come of their own accord.",
    ),
    competitor: t(
      "Une grande enseigne de sport a cassé ses prix sur les vélos au printemps. Tout le monde a perdu des clients ce trimestre, toi compris.",
      "A big sports chain slashed its bike prices in the spring. Everyone lost customers this quarter, you included.",
    ),
  },

  // Fictional media (brief §8.3); SignalConso is the public platform the
  // event itself names.
  clippings: {
    control: {
      masthead: L1.clippings.control.masthead,
      headline: t("Pédalix épinglé par la répression des fraudes", "Pédalix caught out by the French consumer watchdog"),
    },
    reports: {
      masthead: L1.clippings.reports.masthead,
      headline: t("Les signalements contre Pédalix s'accumulent", "Complaints against Pédalix pile up"),
    },
    viral: { handle: t("@roue_libre", "@freewheeling") },
    press: {
      masthead: t("La Gazette du guidon", "The Handlebar Gazette"),
      headline: t("Pédalix, la boutique qui ne force pas la main", "Pédalix, the shop that doesn't push"),
    },
    competitor: {
      masthead: t("La Lettre du commerce", "The Retail Letter"),
      headline: t("Les prix des vélos cassés au printemps", "Bike prices slashed for spring"),
    },
    why: L1.clippings.why,
  },

  news: {
    ...L1.news,
    stamps: { ...L1.news.stamps, fine: t("Transaction · {fine}", "Settlement · {fine}") },
  },

  bossLines: L1.bossLines,

  endings: {
    applause: {
      win: true,
      eyebrow: L1.endings.applause.eyebrow,
      title: L1.endings.applause.title,
      text: t(
        "{metric} nouveaux clients en décembre, {customers} clients au fichier, une confiance à {trust} que personne ne mesurait. Pas un prix barré inventé, pas un avis trié. Le DG t'a pressé trois fois. Tu as répondu avec des chiffres. C'est exactement le métier.",
        "{metric} new customers in December, {customers} customers on file, trust at {trust} that nobody was measuring. Not one made-up struck-through price, not one sorted review. The CEO pushed you three times. You answered with numbers. That is exactly the job.",
      ),
    },
    cleanMiss: {
      win: true,
      eyebrow: L1.endings.cleanMiss.eyebrow,
      title: t("Pas encore 3 000. Mais tout est propre.", "Not 3,000 yet. But everything is clean."),
      text: t(
        "{metric} nouveaux clients, confiance à {trust}. La courbe monte encore, parce que les effets lents ne s'arrêtent pas en décembre. Le board voulait un chiffre, tu as construit une pente. Regarde la confiance : c'est elle qui fera les 3 000 au printemps.",
        "{metric} new customers, trust at {trust}. The curve is still climbing, because slow effects don't stop in December. The board wanted a number; you built a slope. Look at trust: that's what will deliver the 3,000 in the spring.",
      ),
    },
    firedClean: {
      win: false,
      eyebrow: L1.endings.firedClean.eyebrow,
      title: L1.endings.firedClean.title,
      text: t(
        "La patience du DG est tombée à {patience} avant que tes effets lents n'arrivent. Confiance à {trust}. L'année suivante, ton remplaçant a barré les prix. Le jeu ne récompense pas toujours ceux qui ont raison trop tôt. La vraie vie non plus. Rejoue, et présente tes données plus tôt.",
        "The CEO's patience fell to {patience} before your slow effects could arrive. Trust at {trust}. The next year, your replacement struck through the prices. The game doesn't always reward people who are right too early. Neither does real life. Play again, and show your data sooner.",
      ),
    },
    firedDark: {
      win: false,
      eyebrow: L1.endings.firedDark.eyebrow,
      title: L1.endings.firedDark.title,
      text: t(
        "Tu as pris des astuces, et la patience du DG est quand même tombée à {patience}. Confiance à {trust}, radar à {radar}. Ce que le DG voulait, c'était le chiffre, tout de suite, et il ne se souvient pas de ce qu'il a demandé.",
        "You used tricks, and the CEO's patience still fell to {patience}. Trust at {trust}, radar at {radar}. What the CEO wanted was the number, right now, and he doesn't remember what he asked for.",
      ),
    },
    fine: {
      win: false,
      eyebrow: L1.endings.fine.eyebrow,
      title: L1.endings.fine.title,
      text: t(
        "Le radar est monté jusqu'au contrôle, la transaction a été signée, la presse a écrit. {metric} nouveaux clients en décembre, confiance à {trust}. Les clients pressés au printemps ne sont pas revenus, et ils l'ont raconté. Ce que tu as mis en production a des noms. Ils sont en dessous.",
        "The radar climbed all the way to an inspection, the settlement was signed, the press wrote about it. {metric} new customers in December, trust at {trust}. The customers rushed in the spring didn't come back, and they told everyone why. What you put into production has names. They are below.",
      ),
    },
    labyrinth: {
      win: false,
      eyebrow: L1.endings.labyrinth.eyebrow,
      title: t("La vitrine tient. Regarde ce qu'elle coûte.", "The shop window holds. Look at what it costs."),
      text: t(
        "Pas de contrôle cette année. {metric} nouveaux clients, et une confiance à {trust} que ton dashboard ne t'a jamais montrée. Les clients que tu as pressés commandent moins la deuxième fois. Le radar est à {radar}. Il ne redescend pas tout seul.",
        "No inspection this year. {metric} new customers, and trust at {trust} that your dashboard never showed you. The customers you rushed order less the second time. The radar is at {radar}. It doesn't come down on its own.",
      ),
    },
    repentant: {
      win: false,
      eyebrow: L1.endings.repentant.eyebrow,
      title: L1.endings.repentant.title,
      text: t(
        "Tu as mis des astuces en production, puis tu les as retirées. {metric} nouveaux clients, confiance à {trust}, radar à {radar}. La confiance remonte plus lentement qu'elle ne tombe. C'est la seule règle du jeu qui est aussi celle de la vraie vie.",
        "You put tricks into production, then took them out. {metric} new customers, trust at {trust}, radar at {radar}. Trust climbs back more slowly than it falls. It's the one rule of the game that is also a rule of real life.",
      ),
    },
  },

  december: {
    cells: {
      metric: t("Nouveaux clients en {month}", "New customers in {month}"),
      trust: t("Confiance des clients", "Customer trust"),
      radar: L1.december.cells.radar,
      outOf: L1.december.cells.outOf,
    },
    gameNumbers: L1.december.gameNumbers,
    metricChart: {
      title: t("Nouveaux clients par mois", "New customers per month"),
      caption: L1.december.metricChart.caption,
      label: t("Nouveaux clients sur l'année, mois par mois", "New customers over the year, month by month"),
      reference: L1.december.metricChart.reference,
    },
    trustChart: {
      title: t(
        "Confiance des clients, le compteur que personne n'affichait",
        "Customer trust, the counter nobody displayed",
      ),
      caption: t(
        "De 0 à 100. À 35 ou moins, les clients le racontent, et les visiteurs repartent.",
        "From 0 to 100. At 35 or below, customers talk, and visitors leave.",
      ),
      label: t("Confiance des clients sur l'année", "Customer trust over the year"),
      reference: L1.december.trustChart.reference,
    },
    trend: L1.december.trend,
    dataToggle: L1.december.dataToggle,
    table: { ...L1.december.table, metric: t("Nouveaux clients", "New customers") },
  },

  playbook: L1.playbook,

  catalogue: {
    ...L1.catalogue,
    hiddenEffect: t(
      "Confiance {trust}, radar {radar}, une seule fois, le jour où elle entre en production. Les clients qu'elle amène baissent de 30 % après trois mois.",
      "Trust {trust}, radar {radar}, once, on the day it goes into production. The customers it brings in drop by 30% after three months.",
    ),
  },

  share: {
    ...L1.share,
    text: t(
      "Une année chez Pédalix : {title} {metric} nouveaux clients, confiance à {trust}. Et toi, tu tiendrais ? {url}",
      "A year at Pédalix: {title} {metric} new customers, trust at {trust}. Would you hold out? {url}",
    ),
  },

  // Antoine, 2026-10-01: the two levels point at each other, each « jouable »
  // — the only next level that exists (docs/decisions.md C31).
  nextLevel: {
    eyebrow: t("L'autre niveau", "The other level"),
    title: t(
      "« S'ils reviennent » : la pause mise en avant, le bouton enterré, la résiliation par téléphone",
      '"If they come back": the pause pushed up front, the buried button, cancelling by phone',
    ),
    status: t("jouable", "playable"),
  },

  tourLoop: L1.tourLoop,

  resume: {
    ...L1.resume,
    previously: t("Précédemment chez Pédalix", "Previously at Pédalix"),
    quarterLine: t("Trimestre {q} : {cards}. {metric} nouveaux clients.", "Quarter {q}: {cards}. {metric} new customers."),
    finished: t(
      "Ta dernière année chez Pédalix s'est terminée ainsi : « {title} »",
      'Your last year at Pédalix ended like this: "{title}"',
    ),
  },

  footer: L1.footer,

  a11y: {
    ...L1.a11y,
    quarterEnd: t(
      "Fin du trimestre {q} : nouveaux clients {metric}, objectif {target} {status}, patience {patience}.",
      "End of quarter {q}: new customers {metric}, target {target} {status}, patience {patience}.",
    ),
  },
};
