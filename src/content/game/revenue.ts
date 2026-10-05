import type { DeepTranslatable, RevenueCopy } from "@/lib/game/copy";
import type { Translatable } from "@/lib/i18n/translatable";
import { RETENTION_CONTENT } from "./retention";

// TODO: à relire — 2026-10-05 (A24.REV-1) : tout ce que ce fichier écrit lui-même, en français comme en anglais : premier jet de la session, d'après la spécification du §20 (`docs/game/revenue.md`). Aucune phrase ici ne vient d'un prototype.
/**
 * ---------------------------------------------------------------------------
 * « LE CÔTÉ OBSCUR », NIVEAU « COMMENT VOUS GAGNEZ DE L'ARGENT » (REVENUE) — every string of the level.
 * ---------------------------------------------------------------------------
 *
 * GAME-BRIEF.md §20 (`docs/game/revenue.md`), its questions answered by
 * Antoine on 2026-10-04 (C87 to C91). The page resolves this tree to one
 * language (`resolveLevelCopy`) and hands it to the island; nothing in the
 * browser imports this file.
 *
 * ## What comes from level 1, by reference
 *
 * The same CEO, the same desk, the same year, and the same authority: the
 * DGCCRF is level 1's own, so what level 1 already says in words that fit any
 * level — the months, the timeline, the video call, the CEO's one-liners, the
 * playbook, the loop back to the Tour, the footer, and, because the regulator
 * is the same, its radar, its reports and the « why » of an inspection — is
 * level 1's own object, not a copy of it. A correction made there lands here,
 * and nothing here asks to be reviewed twice. The news is level 1's too, but for
 * the stamp of the inspection (« Contrôle · {fine} », C89: « Sanctions » would
 * file the settlement among the sanctions, and « Transaction et amende » does
 * not fit on one line at 390 px). Only what names Gainix, its plans, its gems
 * or its law is written below.
 *
 * ## The English
 *
 * Written, not translated, under level 1's rules: « DG » is the CEO, French
 * and EU law keep their French names with one clause of explanation (the DGCCRF
 * is "France's consumer protection authority"), euro amounts stay in euros,
 * the American cases stay in dollars. The inspection ends in two procedures,
 * told as two (C89): a « transaction pénale » is a criminal settlement, offered
 * with the prosecutor's agreement, and an « amende administrative » an
 * administrative fine. Each case keeps its own nature: the FTC's agreements are
 * settlements ("to settle"), Epic Games' an order, Tinder's commitments and
 * Star Stable's a procedure — never a sanction it was not.
 *
 * ## What stays fictional (brief §8.3)
 *
 * Gainix, its CEO, Coach+, the Marathon outfit, the Sprint chest, the handle
 * @cardio_du_dimanche / @sunday_runner, and the newspapers of the clippings: Le
 * Mag du sport, La Lettre du fitness. A real brand appears in one place only:
 * the `cas` of the catalogue, from the level's whitelist (ebookers.com, Genshin
 * Impact, SFAM, Tinder, Instacart, Epic Games, Fortnite, ABCmouse, Star Stable
 * — GAME-BRIEF §20.9), about something that already happened. « Gainix » shows
 * on no product (searched on 2026-10-04: only Gainax, an animation studio,
 * exists); the INPI check stays Antoine's (CHANTIERS.md D9).
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

export const REVENUE_CONTENT: DeepTranslatable<RevenueCopy> = {
  months: L1.months,
  monthInitials: L1.monthInitials,
  quarterPeriod: L1.quarterPeriod,
  timeline: L1.timeline,

  dashboard: {
    label: L1.dashboard.label,
    metric: t("Revenu par utilisateur", "Revenue per user"),
    metricUnit: t("actif, par mois", "active, per month"),
    quarterTarget: L1.dashboard.quarterTarget,
    boardTarget: L1.dashboard.boardTarget,
    customers: t("Utilisateurs actifs", "Active users"),
    monthEnd: L1.dashboard.monthEnd,
    revenue: L1.dashboard.revenue,
    revenueDelta: L1.dashboard.revenueDelta,
    patience: L1.dashboard.patience,
    patienceLow: L1.dashboard.patienceLow,
    trust: t("Confiance des utilisateurs", "User trust"),
    radar: L1.dashboard.radar,
    notOnDashboard: L1.dashboard.notOnDashboard,
    hiddenValue: L1.dashboard.hiddenValue,
    revealed: L1.dashboard.revealed,
    delta: L1.dashboard.delta,
  },

  visio: {
    ...L1.visio,
    tag: t("DG · Gainix", "CEO · Gainix"),
  },

  boss: {
    t1: t(
      "Bonjour. Nouvelle boîte, même promesse : le board veut 6 € de revenu par utilisateur en décembre, et je leur ai promis. Fin mars, je veux voir 4,30 €. Pas 4,20 €. Tu as deux chantiers ce trimestre. Je ne veux pas savoir comment, je veux le chiffre.",
      "Morning. New company, same promise: the board wants €6 of revenue per user by December, and I promised them. By the end of March I want to see €4.30. Not €4.20. You have two projects this quarter. I don't want to know how. I want the number.",
    ),
    t2Hit: L1.boss.t2Hit,
    t2Miss: t(
      "Tu m'as fait mentir en comité. {metric} au lieu de 4,30 €. Ça n'arrivera pas deux fois. Fin juin, {target}.",
      "You made me look like a liar in front of the committee. {metric} instead of €4.30. It won't happen twice. End of June, {target}.",
    ),
    t3Hit: L1.boss.t3Hit,
    t3Miss: L1.boss.t3Miss,
    t4Hit: t("Dernière ligne droite. 6 € fin décembre et on fête ça.", "Home stretch. €6 by the end of December and we celebrate."),
    t4Miss: t(
      "C'est ton dernier trimestre, tu le sais. 6 € en décembre, ou je présente quelqu'un d'autre au board en janvier.",
      "This is your last quarter, and you know it. €6 in December, or I introduce someone else to the board in January.",
    ),
    orderWrap: L1.boss.orderWrap,
    yearEnd: L1.boss.yearEnd,
    fired: L1.boss.fired,
  },

  orders: {
    addon: t(
      "l'option Coach+, tu la coches d'avance à la souscription. Ceux qui n'en veulent pas la décocheront.",
      "the Coach+ add-on, you tick it in advance at sign-up. People who don't want it will untick it.",
    ),
    trial: t(
      "l'essai passe à quatorze jours, avec la carte à l'entrée, et il bascule sur l'annuel. Pas de rappel : un rappel, c'est une résiliation.",
      "the trial goes to fourteen days, card upfront, and it switches to the yearly plan. No reminder: a reminder is a cancellation.",
    ),
    lootbox: t(
      "des coffres à gemmes, au contenu au hasard. Tous les jeux le font, et les gens adorent ouvrir.",
      "gem chests, with random contents. Every game does it, and people love opening them.",
    ),
    hiddensub: t(
      "le programme 8 semaines, on l'affiche à 9,99 €. Le mensuel, c'est écrit sous le bouton.",
      "the 8-week programme, we show it at €9.99. The monthly part is written under the button.",
    ),
    renewal: t(
      "l'annuel se renouvelle tout seul. Pas d'e-mail avant : ça réveille les gens.",
      "the yearly plan renews on its own. No email beforehand: it wakes people up.",
    ),
  },

  hand: {
    ...L1.hand,
    unlocked: t("Débloqué par la question au paiement", "Unlocked by the checkout question"),
    productionEmpty: t(
      "Rien en production pour l'instant. L'offre actuelle : sept jours d'essai, puis 7,99 € par mois, et une boutique de gemmes.",
      "Nothing in production yet. The current offer: a seven-day trial, then €7.99 a month, and a gem shop.",
    ),
  },

  cards: {
    fullprice: {
      name: t("Prix complet affiché", "Full price shown"),
      pitch: t(
        "Sur l'écran des offres, le prix annuel s'affiche en entier, avant son équivalent mensuel.",
        "On the plans screen, the yearly price shows in full, before its monthly equivalent.",
      ),
    },
    checkout: {
      name: t("Question au paiement abandonné", "Abandoned-checkout question"),
      pitch: t(
        "Une question facultative à ceux qui quittent l'écran de paiement : « Qu'est-ce qui t'a arrêté ? »",
        'One optional question for people who leave the payment screen: "What held you back?"',
      ),
    },
    downgrade: {
      name: t("Offre adaptée", "Right-sized plan"),
      pitch: t(
        "Quand l'usage baisse, l'appli propose de passer au plan Essentiel, moins cher.",
        "When usage drops, the app suggests moving to the cheaper Essential plan.",
      ),
    },
    programs: {
      name: t("Programmes de coachs", "Coach programmes"),
      pitch: t(
        "Des programmes conçus avec des coachs diplômés, vendus à l'unité, au prix affiché.",
        "Programmes designed with qualified coaches, sold one by one, at the price shown.",
      ),
    },
    present: L1.cards.present,
    trialmail: {
      name: t("Rappel de fin d'essai", "Trial-end reminder"),
      pitch: t(
        "Un e-mail et une notification trois jours avant la fin de l'essai, avec le prix et un lien pour arrêter.",
        "An email and a notification three days before the trial ends, with the price and a link to stop.",
      ),
    },
    roundpacks: {
      name: t("Packs au compte rond", "Round packs"),
      pitch: t(
        "Les packs de gemmes correspondent exactement aux prix des tenues, et chaque tenue dit son prix en euros.",
        "Gem packs match the outfit prices exactly, and every outfit shows its price in euros.",
      ),
    },
    renewmail: {
      name: t("Renouvellement annoncé", "Renewal notice"),
      pitch: t(
        "Un e-mail un mois avant chaque échéance annuelle, avec la date limite pour arrêter.",
        "An email a month before each yearly renewal, with the deadline to stop it.",
      ),
    },
    clean: {
      name: L1.cards.clean.name,
      pitch: t("Revenir aux offres, au paiement et à la boutique d'origine.", "Go back to the original plans, checkout and shop."),
    },
    addon: {
      name: t("Coach+ par défaut", "Coach+ by default"),
      pitch: t(
        "À la souscription, l'option « Coach+, 2,99 € par mois » est déjà cochée sous l'offre choisie.",
        'At sign-up, the "Coach+, €2.99 a month" option is already ticked under the chosen plan.',
      ),
    },
    lootbox: {
      name: t("Coffres à récompenses", "Reward chests"),
      pitch: t(
        "Des coffres à 300 gemmes, au contenu tiré au hasard : tenues rares, bonus de défis.",
        "Chests at 300 gems, with contents drawn at random: rare outfits, challenge boosts.",
      ),
    },
    hiddensub: {
      name: t("Programme 8 semaines", "8-week programme"),
      pitch: t(
        "Un programme affiché « 9,99 € » ; sous le bouton, en petit : « puis 9,99 € par mois ».",
        'A programme shown at "€9.99"; under the button, in small print: "then €9.99 a month".',
      ),
    },
    pricing: {
      name: t("Prix ajusté", "Adjusted price"),
      pitch: t(
        "Le prix de l'abonnement affiché varie selon le modèle de téléphone et l'historique d'achat.",
        "The subscription price shown varies with the phone model and the purchase history.",
      ),
    },
    trial: {
      name: t("Essai converti", "Converting trial"),
      pitch: t(
        "Essai gratuit de 14 jours, carte demandée à l'entrée ; il devient un abonnement annuel à 59,99 €, sans rappel.",
        "A 14-day free trial, card required upfront; it becomes a €59.99 yearly subscription, with no reminder.",
      ),
    },
    express: {
      name: t("Achat express", "Express purchase"),
      pitch: t(
        "Un seul appui achète une tenue, sur le bouton où l'on appuie pour la voir en aperçu.",
        "A single tap buys an outfit, on the button you press to preview it.",
      ),
    },
    renewal: {
      name: t("Reconduction automatique", "Automatic renewal"),
      pitch: t(
        "L'abonnement annuel se renouvelle sans e-mail avant l'échéance.",
        "The yearly subscription renews with no email before the renewal date.",
      ),
    },
    gems: {
      name: t("Packs de gemmes", "Gem packs"),
      pitch: t(
        "Les gemmes se vendent par 500, 1 200 ou 2 600 ; la tenue Marathon coûte 800 gemmes.",
        "Gems come in packs of 500, 1,200 or 2,600; the Marathon outfit costs 800 gems.",
      ),
    },
  },

  // GAME-BRIEF §20.9: checked on 2026-10-04 by a research agent against the
  // Code de la consommation consolidated on 2026-10-01 (re-read by the session
  // for L121-17, L132-22, L215-1, L221-5 I 11°, L221-14, L241-3 and L242-10), the
  // Commission's guidance on directive 2005/29 (2021), the Commission's and the
  // FTC's press releases, the CPC network's key principles on virtual currencies,
  // the 2019 ministerial answer on loot boxes and the Dutch ruling of 2022. The
  // DGCCRF's own pages were blocked: what comes from them is flagged below. The
  // legal review of the catalogue stays Antoine's (CHANTIERS.md D9). A
  // commitment, a settlement, an order or a procedure is never told as a
  // sanction. Two cases are taken elsewhere and avoided here: Amazon Prime and
  // Adobe (level 1). The « Sources » line of each trick, as the spec gives it
  // (not copy: nothing below is shown to the player):
  //
  // addon — C. consom. L121-17 et L132-22 (15 000 € au plus pour une société ; relus) ; CJUE, 19
  // juillet 2012, C-112/11, ebookers.com Deutschland (titre du JO de l'UE lu : obligation d'un
  // intermédiaire de faire accepter les suppléments facultatifs « sur la base d'un consentement
  // », dont le prix d'une assurance annulation ; dispositif à relire). L'arrêt porte sur le
  // transport aérien (règlement 1008/2008, article 23) : le texte le dit « à propos d'une
  // assurance annulation proposée par une agence de voyages », sans en faire une règle générale.
  //
  // lootbox — réponse ministérielle à la question écrite nº 14570, JO du 12 mars 2019 (lue) ;
  // guidance de la Commission sur la directive 2005/29, 2021, §4.2.9 (lue) ; FTC, communiqué du
  // 17 janvier 2025 (lu : une proposition d'accord, son approbation n'a pas été vérifiée). Le
  // cadre « JONUM » de la loi du 21 mai 2024 ne vise que les objets revendables : une tenue
  // d'avatar n'en est pas un. Aux Pays-Bas, il n'y a jamais eu d'amende de 10 M€ contre EA : une
  // astreinte, annulée par le Conseil d'État le 9 mars 2022 ; la Belgique a donné en 2018 une
  // interprétation, pas un jugement. Ne citer ni l'une ni l'autre.
  //
  // hiddensub — communiqué de la DGCCRF du 14 juin 2019, lu dans sa reprise (lemondedudroit.fr) :
  // la page de la DGCCRF était bloquée, à relire ; la DGCCRF n'a pas publié le montant (le
  // chiffre de la presse n'est pas à citer). Ne pas nommer l'enseigne qui distribuait l'offre :
  // elle n'était pas mise en cause.
  //
  // pricing — C. consom. L221-5 I 11° et L242-10 (75 000 € au plus pour une société ; relus) ;
  // Commission européenne, IP/24/1344 du 7 mars 2024 (lu). Ne pas citer Orbitz (2012, non
  // vérifié, et pas illégal).
  //
  // trial — C. consom. L221-5, L221-14, L121-3 (relus ; recherche « essai » et « gratuit » dans
  // tout le Code, sans résultat) ; FTC, communiqué du 18 décembre 2025 (lu) : un accord
  // transactionnel, l'ordonnance signée n'a pas été vérifiée. Le Digital Fairness Act, qui
  // pourrait créer une obligation de rappel, n'est pas encore proposé : ne pas le citer comme une
  // loi.
  //
  // express — C. consom. L221-14 alinéa 2 et L242-10 (relus) ; FTC, communiqué du 14 mars 2023
  // (lu : une ordonnance administrative sur consentement, des remboursements, pas une amende).
  // Les 275 M$ de la COPPA sont une autre affaire : ne pas les additionner.
  //
  // renewal — C. consom. L215-1 et L241-3 (relus : aucune amende, des intérêts au taux légal) ;
  // FTC, communiqué du 2 septembre 2020 (lu). Repli sans paiement : les engagements de Microsoft
  // auprès de la CMA sur les abonnements Xbox (26 janvier 2022), « not an admission ».
  //
  // gems — principes clés du réseau CPC sur les monnaies virtuelles dans les jeux, 21 mars 2025,
  // principe 3 (« Offering in-game virtual currencies only in bundles mismatching the value of
  // purchasable in-game digital content », lu) ; Commission européenne, IP/25/831 (lu ; aucune
  // issue publiée). L'action contre neuf éditeurs du 30 septembre 2026 n'est confirmée que par la
  // presse : ne pas la citer.
  patterns: {
    addon: {
      official: t("Option pré-cochée", "Pre-ticked add-on"),
      law: t(
        "Avant tout contrat, le vendeur doit obtenir l'accord exprès du consommateur pour chaque paiement qui s'ajoute au prix principal : une option payante cochée d'avance n'en est pas un, et le consommateur peut se faire rembourser (article L121-17 du Code de la consommation). Le manquement est puni d'une amende administrative.",
        "Before any contract, the seller must get the consumer's express agreement for every payment added to the main price: a paid option ticked in advance is not that, and the consumer can get a refund under French law (article L121-17 of the Consumer Code). The breach carries an administrative fine.",
      ),
      cas: t(
        "En 2012, la Cour de justice de l'Union européenne a jugé, à propos d'une assurance annulation proposée par l'agence de voyages en ligne ebookers.com, qu'un supplément de prix facultatif doit être choisi activement par le client, jamais coché à sa place.",
        "In 2012, the Court of Justice of the European Union ruled, in a case about cancellation insurance offered by the online travel agency ebookers.com, that an optional price supplement must be actively chosen by the customer, never ticked for them.",
      ),
      tell: t(
        "Une option déjà cochée est celle qu'on veut te vendre : décoche avant de payer.",
        "An option already ticked is the one they want to sell you: untick it before you pay.",
      ),
    },
    lootbox: {
      official: t("Coffre à butin payant", "Paid loot box"),
      law: t(
        "Pas d'interdiction en France : un coffre payant n'est une loterie interdite (article L322-1 du Code de la sécurité intérieure) que s'il fait espérer un gain réel, comme de l'argent ou un objet revendable. Sinon, le droit de la consommation s'applique, et la Commission européenne demande d'afficher les chances de gain avant l'achat.",
        "Not banned in France: a paid chest is only a prohibited lottery (article L322-1 of the French Internal Security Code) if it holds out the hope of a real gain, such as money or a resellable item. Otherwise consumer law applies, and the European Commission asks for the odds of winning to be shown before purchase.",
      ),
      cas: t(
        "En janvier 2025, l'éditeur de Genshin Impact a accepté de payer 20 millions de dollars pour clore les accusations de la FTC, notamment sur des coffres payants dont les chances et le coût réel étaient mal présentés, vendus aussi à des adolescents. L'accord a été soumis à un juge fédéral.",
        "In January 2025, the publisher of Genshin Impact agreed to pay $20 million to settle the FTC's allegations, notably about paid chests whose odds and real cost were poorly presented, sold to teenagers among others. The settlement was submitted to a federal judge.",
      ),
      tell: t(
        "Un coffre payant au hasard : demande les chances avant de payer.",
        "A paid chest at random: ask for the odds before you pay.",
      ),
    },
    hiddensub: {
      official: t("Abonnement caché", "Hidden subscription"),
      law: t(
        "Présenter un abonnement comme un achat unique trompe sur la nature et le prix du service : c'est une pratique commerciale trompeuse, un délit (articles L121-2 et L121-3 du Code de la consommation). Et juste avant la commande, le prix et la durée doivent être rappelés de façon lisible (article L221-14).",
        "Presenting a subscription as a one-off purchase misleads about the nature and price of the service: it is a misleading commercial practice, a criminal offence under French law (articles L121-2 and L121-3 of the Consumer Code). And just before the order, the price and duration must be restated legibly (article L221-14).",
      ),
      cas: t(
        "En 2019, la SFAM a accepté une transaction proposée par la DGCCRF avec l'accord du parquet de Paris : sous couvert d'une offre de remboursement, des clients avaient souscrit, sans toujours le savoir, une assurance payante.",
        "In 2019, SFAM accepted a settlement offered by the DGCCRF, France's consumer protection authority, with the agreement of the Paris prosecutor: under cover of a refund offer, customers had signed up, not always knowingly, for a paid insurance policy.",
      ),
      tell: t(
        "Un prix sans « par mois » peut cacher un abonnement : lis sous le bouton.",
        'A price without "a month" can hide a subscription: read under the button.',
      ),
    },
    pricing: {
      official: t("Prix personnalisé non signalé", "Undisclosed personalised pricing"),
      law: t(
        "Quand un prix est personnalisé par une décision automatisée, le vendeur doit le dire avant le contrat (article L221-5 du Code de la consommation, 11°). Personnaliser n'est pas interdit ; le cacher l'est, sous peine d'une amende administrative.",
        "When a price is personalised by an automated decision, the seller must say so before the contract under French law (article L221-5 of the Consumer Code, point 11). Personalising isn't banned; hiding it is, on pain of an administrative fine.",
      ),
      cas: t(
        "En mars 2024, Tinder s'est engagé auprès de la Commission européenne et des autorités de consommation à dire quand ses remises sont personnalisées par des moyens automatisés. Ce sont des engagements, pas une sanction.",
        "In March 2024, Tinder committed to the European Commission and consumer authorities to say when its discounts are personalised by automated means. These are commitments, not a sanction.",
      ),
      tell: t("Si le prix change selon ton téléphone, on doit te le dire.", "If the price changes with your phone, they have to tell you."),
    },
    trial: {
      official: t("Continuité forcée", "Forced continuity"),
      law: t(
        "Aucune loi française n'impose de rappel avant la fin d'un essai gratuit. Mais le prix, la durée et le renouvellement doivent être annoncés avant la souscription et rappelés juste avant la commande (articles L221-5 et L221-14 du Code de la consommation) ; les rendre illisibles est une omission trompeuse (article L121-3).",
        "No French law requires a reminder before a free trial ends. But the price, the duration and the renewal must be stated before sign-up and restated just before the order (articles L221-5 and L221-14 of the French Consumer Code); making them illegible is a misleading omission (article L121-3).",
      ),
      cas: t(
        "Aux États-Unis, Instacart a accepté en décembre 2025 de rembourser 60 millions de dollars à ses clients pour clore une action de la FTC : l'inscription à l'essai gratuit de son abonnement ne disait pas assez qu'il deviendrait payant à la fin.",
        "In the United States, Instacart agreed in December 2025 to refund $60 million to customers to settle an FTC lawsuit: signing up for its subscription's free trial didn't make clear enough that it would become paid at the end.",
      ),
      tell: t(
        "Si l'essai gratuit exige ta carte, note le jour où il devient payant.",
        "If the free trial wants your card, write down the day it starts charging.",
      ),
    },
    express: {
      official: t("Achat involontaire", "Unintended purchase"),
      law: t(
        "Le bouton qui valide une commande doit dire clairement qu'elle oblige à payer : « commande avec obligation de paiement », ou une formule sans ambiguïté (article L221-14 du Code de la consommation). Un achat d'un seul appui n'est pas interdit ; le confondre avec un aperçu l'est.",
        'The button that confirms an order must say clearly that it means paying: "order with obligation to pay", or an unambiguous equivalent, under French law (article L221-14 of the Consumer Code). One-tap buying isn\'t banned; mixing it up with a preview is.',
      ),
      cas: t(
        "En 2023, Epic Games a accepté de verser 245 millions de dollars de remboursements, dans une ordonnance de la FTC : les boutons de Fortnite faisaient acheter d'un seul appui, parfois en voulant seulement réveiller le jeu ou voir un objet.",
        "In 2023, Epic Games agreed to pay $245 million in refunds under an FTC order: Fortnite's buttons made people buy with a single press, sometimes when they only meant to wake the game or look at an item.",
      ),
      tell: t(
        "Le bouton qui fait payer doit le dire, pas ressembler à « voir ».",
        'The button that charges you has to say so, not look like "view".',
      ),
    },
    renewal: {
      official: t("Reconduction tacite sans information", "Silent auto-renewal"),
      law: t(
        "Pour un abonnement à durée fixe qui se renouvelle tout seul, le prestataire doit prévenir par écrit, entre trois mois et un mois avant l'échéance, avec la date limite pour arrêter (article L215-1 du Code de la consommation, loi Chatel). Sinon, l'abonné peut résilier gratuitement à tout moment, et il est remboursé. Pas d'amende : la sanction, c'est l'abonné qui la prend.",
        "For a fixed-term subscription that renews on its own, the provider must warn in writing, between three months and one month before the renewal date, with the deadline to stop, under French law (article L215-1 of the Consumer Code, the Chatel law). Otherwise the subscriber can cancel free of charge at any time, and gets refunded. No fine: the subscriber is the one who imposes the penalty.",
      ),
      cas: t(
        "Aux États-Unis, l'éditeur d'ABCmouse a accepté en 2020 de payer 10 millions de dollars pour clore les accusations de la FTC : ses formules à prix réduit de douze mois se renouvelaient indéfiniment sans que les clients en soient prévenus.",
        "In the United States, the publisher of ABCmouse agreed in 2020 to pay $10 million to settle FTC charges: its discounted twelve-month plans renewed indefinitely without customers being told.",
      ),
      tell: t(
        "Pas d'e-mail avant la reconduction annuelle ? Tu peux résilier quand tu veux.",
        "No email before the yearly renewal? You can cancel whenever you like.",
      ),
    },
    gems: {
      official: t("Monnaie virtuelle opaque", "Opaque virtual currency"),
      law: t(
        "Aucune règle française ne vise les monnaies virtuelles, mais le prix doit se lire en euros, clairement, avant l'achat (articles L221-5 et L121-2 du Code de la consommation). Les autorités de consommation européennes demandent de ne pas vendre de monnaie par paquets qui ne correspondent pas aux prix des objets.",
        "No French rule targets virtual currencies, but the price must be readable in euros, clearly, before purchase (articles L221-5 and L121-2 of the French Consumer Code). European consumer authorities ask traders not to sell currency in bundles that don't match the prices of the items.",
      ),
      cas: t(
        "En mars 2025, les autorités de consommation européennes ont ouvert une action contre l'éditeur du jeu Star Stable, notamment sur sa monnaie virtuelle. C'est une procédure, pas une sanction.",
        "In March 2025, European consumer authorities opened an action against the publisher of the game Star Stable, notably over its virtual currency. It is a procedure, not a sanction.",
      ),
      tell: t(
        "S'il te reste toujours des gemmes, les packs sont calibrés pour ça.",
        "If you always have gems left over, the packs are designed that way.",
      ),
    },
  },

  phone: {
    caption: t("L'abonnement et la boutique tels que les utilisateurs les voient", "The subscription and the shop as users see them"),
    appName: t("Gainix", "Gainix"),
    time: t("07:02", "07:02"),
    offerBase: t("Essai gratuit 7 jours, puis 7,99 € par mois", "7-day free trial, then €7.99 a month"),
    offerTrial: t("14 jours gratuits · carte bancaire demandée", "14 days free · card required"),
    offerTrialSmall: t("puis 59,99 € par an", "then €59.99 a year"),
    fullPrice: t("Annuel : 59,99 € par an, soit 5,00 € par mois", "Yearly: €59.99 a year, that's €5.00 a month"),
    plansTitle: t("Les formules", "Plans"),
    monthly: t("Mensuel : 7,99 € par mois", "Monthly: €7.99 a month"),
    monthlyPersonal: t("Mensuel : 8,49 € par mois", "Monthly: €8.49 a month"),
    addon: t("☑ Coach+ · 2,99 € par mois", "☑ Coach+ · €2.99 a month"),
    trialReminder: t("Rappel envoyé 3 jours avant la fin de l'essai", "Reminder sent 3 days before the trial ends"),
    programme: t("Programme 8 semaines · 9,99 €", "8-week programme · €9.99"),
    programmeSmall: t("puis 9,99 € par mois, sans engagement", "then €9.99 a month, cancel at any time"),
    coaching: t("Programmes de coachs · 14,99 € l'unité", "Coach programmes · €14.99 each"),
    downgrade: t("Tu t'entraînes moins ? Passe au plan Essentiel à 3,99 €", "Training less? Switch to the Essential plan at €3.99"),
    shopTitle: t("Boutique de gemmes", "Gem shop"),
    shopItem: t("Tenue Marathon · 800 gemmes", "Marathon outfit · 800 gems"),
    packsRound: t("Packs : 400 · 800 · 1 600 gemmes", "Packs: 400 · 800 · 1,600 gems"),
    packsOdd: t("Packs : 500 · 1 200 · 2 600 gemmes", "Packs: 500 · 1,200 · 2,600 gems"),
    euros: t("soit 7,99 € la tenue", "that's €7.99 for the outfit"),
    chest: t("Coffre Sprint · 300 gemmes · contenu au hasard", "Sprint chest · 300 gems · random contents"),
    express: t("Achat en un appui : toucher une tenue l'achète", "One-tap buying: touching an outfit buys it"),
    renewalPlain: t("Abonnement annuel · prochaine échéance le 3 mars", "Yearly subscription · next renewal on 3 March"),
    renewalSilent: t("Renouvelé automatiquement le 3 mars · 59,99 € prélevés", "Renewed automatically on 3 March · €59.99 charged"),
    renewalNotice: t(
      "E-mail du 3 février : renouvellement le 3 mars, date limite pour arrêter le 2 mars",
      "Email of 3 February: renews on 3 March, deadline to stop on 2 March",
    ),
    checkoutQuestion: t(
      "Paiement interrompu ? Dis-nous ce qui t'a arrêté. Facultatif.",
      "Stopped at checkout? Tell us what held you back. Optional.",
    ),
    checkoutAnswers: [
      t("Trop cher pour ce que c'est", "Too expensive for what it is"),
      t("Essayer un programme d'abord", "Try a programme first"),
      t("Autre", "Other"),
    ],
  },

  charge: {
    amount: t("Prélevé à la fin de l'essai : {amount}", "Charged when the trial ends: {amount}"),
    silentSuffix: t("sans rappel avant le prélèvement", "with no reminder before the charge"),
    addonSuffix: t("dont une option cochée d'avance", "including an add-on ticked in advance"),
  },

  report: {
    ...L1.report,
    metric: t("Revenu par utilisateur", "Revenue per user"),
    customers: t("Utilisateurs actifs", "Active users"),
    driversHeading: t("Pourquoi le revenu par utilisateur a bougé : {delta}", "Why revenue per user moved: {delta}"),
    drivers: {
      ...L1.report.drivers,
      word: t("Ce que tes utilisateurs disent de Gainix", "What your users say about Gainix"),
      market: t("L'abonnement à moitié prix d'une grande appli", "A big app's half-price subscription"),
    },
  },

  journal: L1.journal,

  effects: {
    insight: L1.effects.insight,
    present: L1.effects.present,
    clean: t("astuces retirées, le revenu par utilisateur baisse un peu", "tricks removed, revenue per user dips a little"),
    gain: t("+{pct} % de revenu par utilisateur ce trimestre", "+{pct}% revenue per user this quarter"),
    gainRising: t(
      "+{pct} % de revenu par utilisateur ce trimestre, l'effet monte encore",
      "+{pct}% revenue per user this quarter, and the effect is still growing",
    ),
    loss: t(
      "−{pct} % de revenu par utilisateur ce trimestre, des paiements que les gens ont voulus",
      "−{pct}% revenue per user this quarter, payments people actually meant",
    ),
    none: L1.effects.none,
  },

  events: {
    midMailMoving: L1.events.midMailMoving,
    midMailStalled: L1.events.midMailStalled,
    present: L1.events.present,
    surveyAnswers: t(
      "Les réponses sont arrivées : 4 personnes sur 10 qui quittent le paiement répondent « trop cher pour ce que c'est », 3 sur 10 veulent « essayer un programme d'abord ». Tes prochains chantiers viseront plus juste, et tu as enfin de quoi montrer au DG : « Point données avec le DG » est débloqué.",
      'The answers are in: 4 in 10 people who leave the checkout answer "too expensive for what it is", 3 in 10 want to "try a programme first". Your next projects will aim better, and you finally have something to show the CEO: "Data review with the CEO" is unlocked.',
    ),
    control: t(
      "Contrôle de la DGCCRF, article dans la presse : une transaction pénale proposée avec l'accord du parquet, et une amende administrative, {fine} au total. Le DG te demande de tout retirer avant vendredi. {leavers} utilisateurs ferment leur compte.",
      "An inspection by the DGCCRF, France's consumer protection authority, and an article in the press: a criminal settlement offered with the prosecutor's agreement, and an administrative fine, {fine} in all. The CEO asks you to take everything down by Friday. {leavers} users close their accounts.",
    ),
    reports: L1.events.reports,
    viral: t(
      "Un fil viral : « Gainix, j'ai supprimé ma carte de l'appli, voici pourquoi. » Les utilisateurs n'achètent plus rien.",
      'A viral thread: "Gainix, I removed my card from the app, here\'s why." Users stop buying anything.',
    ),
    press: t(
      "Un magazine de sport cite Gainix en exemple d'une appli qui ne force pas la main. Les utilisateurs paient plus volontiers ce qu'ils ont choisi.",
      "A sports magazine cites Gainix as an app that doesn't push people around. Users pay more willingly for what they chose.",
    ),
    competitor: t(
      "Une grande appli de sport a divisé son abonnement par deux au printemps. Tout le monde a dû faire des remises, toi compris.",
      "A big fitness app halved its subscription in the spring. Everyone had to offer discounts, you included.",
    ),
  },

  // Fictional media (brief §8.3). No event names a card (a clipping is about
  // what the radar saw, not about what was played). The inspection and the
  // reports are the DGCCRF's, as on level 1: its masthead and its « why » are
  // level 1's own.
  clippings: {
    control: {
      masthead: L1.clippings.control.masthead,
      headline: t("Gainix épinglé par la répression des fraudes", "Gainix caught out by the French consumer watchdog"),
    },
    reports: {
      masthead: L1.clippings.reports.masthead,
      headline: t("Les signalements contre Gainix s'accumulent", "Complaints against Gainix pile up"),
    },
    viral: {
      handle: t("@cardio_du_dimanche", "@sunday_runner"),
    },
    press: {
      masthead: t("Le Mag du sport", "Sport Mag"),
      headline: t("Gainix, l'appli qui ne force pas la main", "Gainix, the app that doesn't push"),
    },
    competitor: {
      masthead: t("La Lettre du fitness", "The Fitness Letter"),
      headline: t("L'abonnement à moitié prix gagne le sport", "Half-price subscriptions hit fitness apps"),
    },
    why: L1.clippings.why,
  },

  // Level 1's, but for the stamp of the inspection: « Contrôle » (C89, spec §20.10
  // Q3), because « Sanctions » would file the settlement among the sanctions.
  news: {
    ...L1.news,
    stamps: {
      ...L1.news.stamps,
      fine: t("Contrôle · {fine}", "Inspection · {fine}"),
    },
  },

  bossLines: L1.bossLines,

  endings: {
    applause: {
      win: true,
      eyebrow: L1.endings.applause.eyebrow,
      title: L1.endings.applause.title,
      text: t(
        "Revenu par utilisateur à {metric} en décembre, {customers} utilisateurs actifs, une confiance à {trust} que personne ne mesurait. Pas une option cochée d'avance, pas un essai qui se change en abonnement en silence. Le DG t'a pressé trois fois. Tu as répondu avec des chiffres. C'est exactement le métier.",
        "Revenue per user at {metric} in December, {customers} active users, trust at {trust} that nobody was measuring. Not one add-on ticked in advance, not one trial quietly turning into a subscription. The CEO pushed you three times. You answered with numbers. That is exactly the job.",
      ),
    },
    cleanMiss: {
      win: true,
      eyebrow: L1.endings.cleanMiss.eyebrow,
      title: t("Pas encore 6 €. Mais tout est propre.", "Not €6 yet. But everything is clean."),
      text: t(
        "Revenu par utilisateur à {metric}, confiance à {trust}. La courbe monte encore, parce que les effets lents ne s'arrêtent pas en décembre. Le board voulait un chiffre, tu as construit une pente. Regarde la confiance : c'est elle qui fera les 6 € au printemps.",
        "Revenue per user at {metric}, trust at {trust}. The curve is still climbing, because slow effects don't stop in December. The board wanted a number; you built a slope. Look at trust: that's what will deliver the €6 in the spring.",
      ),
    },
    firedClean: {
      win: false,
      eyebrow: L1.endings.firedClean.eyebrow,
      title: L1.endings.firedClean.title,
      text: t(
        "La patience du DG est tombée à {patience} avant que tes effets lents n'arrivent. Confiance à {trust}. L'année suivante, ton remplaçant a fait payer les essais sans prévenir. Le jeu ne récompense pas toujours ceux qui ont raison trop tôt. La vraie vie non plus. Rejoue, et présente tes données plus tôt.",
        "The CEO's patience fell to {patience} before your slow effects could arrive. Trust at {trust}. The next year, your replacement charged for trials without warning. The game doesn't always reward people who are right too early. Neither does real life. Play again, and show your data sooner.",
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
        "Le radar est monté jusqu'au contrôle, la transaction a été signée et l'amende est tombée, la presse a écrit. Revenu par utilisateur à {metric} en décembre, confiance à {trust}. Ceux qui avaient payé plus qu'ils ne le voulaient ont demandé à être remboursés, et ils l'ont raconté. Ce que tu as mis en production a des noms. Ils sont en dessous.",
        "The radar climbed all the way to an inspection, the settlement was signed and the fine landed, the press wrote about it. Revenue per user at {metric} in December, trust at {trust}. The people who had paid more than they meant to asked for their money back, and told everyone why. What you put into production has names. They are below.",
      ),
    },
    labyrinth: {
      win: false,
      eyebrow: L1.endings.labyrinth.eyebrow,
      title: t("La caisse tient. Regarde ce qu'elle coûte.", "The till holds. Look at what it costs."),
      text: t(
        "Pas de contrôle cette année. Revenu par utilisateur à {metric}, et une confiance à {trust} que ton dashboard ne t'a jamais montrée. Les utilisateurs que tu as pressés partent plus vite qu'ils ne sont venus. Le radar est à {radar}. Il ne redescend pas tout seul.",
        "No inspection this year. Revenue per user at {metric}, and trust at {trust} that your dashboard never showed you. The users you pushed leave faster than they came. The radar is at {radar}. It doesn't come down on its own.",
      ),
    },
    repentant: {
      win: false,
      eyebrow: L1.endings.repentant.eyebrow,
      title: L1.endings.repentant.title,
      text: t(
        "Tu as mis des astuces en production, puis tu les as retirées. Revenu par utilisateur à {metric}, confiance à {trust}, radar à {radar}. La confiance remonte plus lentement qu'elle ne tombe. C'est la seule règle du jeu qui est aussi celle de la vraie vie.",
        "You put tricks into production, then took them out. Revenue per user at {metric}, trust at {trust}, radar at {radar}. Trust climbs back more slowly than it falls. It's the one rule of the game that is also a rule of real life.",
      ),
    },
  },

  december: {
    cells: {
      metric: t("Revenu par utilisateur en {month}", "Revenue per user in {month}"),
      trust: t("Confiance des utilisateurs", "User trust"),
      radar: L1.december.cells.radar,
      outOf: L1.december.cells.outOf,
    },
    gameNumbers: L1.december.gameNumbers,
    metricChart: {
      title: t("Revenu par utilisateur, par mois", "Revenue per user, per month"),
      caption: L1.december.metricChart.caption,
      label: t("Revenu par utilisateur actif sur l'année, mois par mois", "Revenue per active user over the year, month by month"),
      reference: L1.december.metricChart.reference,
    },
    trustChart: {
      title: t("Confiance des utilisateurs, le compteur que personne n'affichait", "User trust, the counter nobody displayed"),
      caption: t(
        "De 0 à 100. À 35 ou moins, les utilisateurs le racontent, et plus personne n'achète.",
        "From 0 to 100. At 35 or below, users talk, and nobody buys any more.",
      ),
      label: t("Confiance des utilisateurs sur l'année", "User trust over the year"),
      reference: L1.december.trustChart.reference,
    },
    trend: L1.december.trend,
    dataToggle: L1.december.dataToggle,
    table: {
      ...L1.december.table,
      metric: t("Revenu par utilisateur", "Revenue per user"),
    },
  },

  playbook: L1.playbook,

  catalogue: {
    ...L1.catalogue,
    hiddenEffect: t(
      "Confiance {trust}, radar {radar}, une seule fois, le jour où elle entre en production. Le revenu qu'elle rapporte baisse de 30 % après trois mois.",
      "Trust {trust}, radar {radar}, once, on the day it goes into production. The revenue it brings in drops by 30% after three months.",
    ),
  },

  share: {
    ...L1.share,
    text: t(
      "Une année chez Gainix : {title} Revenu par utilisateur à {metric}, confiance à {trust}. Et toi, tu tiendrais ? {url}",
      "A year at Gainix: {title} Revenue per user at {metric}, trust at {trust}. Would you hold out? {url}",
    ),
  },

  // Level 1's, by reference (C75, A24.T0): « Niveau suivant » / « jouable » says
  // as much at five levels as at two, and the title comes from the level the
  // block points at (`LEVEL_TEASERS`, content/game/hub.ts).
  nextLevel: L1.nextLevel,

  tourLoop: L1.tourLoop,

  resume: {
    ...L1.resume,
    previously: t("Précédemment chez Gainix", "Previously at Gainix"),
    quarterLine: t("Trimestre {q} : {cards}. Revenu par utilisateur à {metric}.", "Quarter {q}: {cards}. Revenue per user at {metric}."),
    finished: t("Ta dernière année chez Gainix s'est terminée ainsi : « {title} »", 'Your last year at Gainix ended like this: "{title}"'),
  },

  footer: L1.footer,

  a11y: {
    ...L1.a11y,
    quarterEnd: t(
      "Fin du trimestre {q} : revenu par utilisateur {metric}, objectif {target} {status}, patience {patience}.",
      "End of quarter {q}: revenue per user {metric}, target {target} {status}, patience {patience}.",
    ),
  },
};
