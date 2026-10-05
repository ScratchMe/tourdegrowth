import type { DeepTranslatable, ReferralCopy } from "@/lib/game/copy";
import type { Translatable } from "@/lib/i18n/translatable";
import { RETENTION_CONTENT } from "./retention";

// TODO: à relire — 2026-10-05 (A24.REF-1) : tout ce que ce fichier écrit lui-même, en français comme en anglais : premier jet de la session, d'après la spécification du §19 (`docs/game/referral.md`). Aucune phrase ici ne vient d'un prototype.
/**
 * ---------------------------------------------------------------------------
 * « LE CÔTÉ OBSCUR », NIVEAU « S'ILS VOUS RECOMMANDENT » (REFERRAL) — every string of the level.
 * ---------------------------------------------------------------------------
 *
 * GAME-BRIEF.md §19 (`docs/game/referral.md`), its questions answered by
 * Antoine on 2026-10-04 (C82 to C86, and C77 for the CNIL's fines told
 * without the firm's name). The page resolves this tree to one language
 * (`resolveLevelCopy`) and hands it to the island; nothing in the browser
 * imports this file.
 *
 * ## What comes from level 1, by reference
 *
 * The same CEO, the same desk, the same year: what level 1 already says in
 * words that fit any level — the months, the timeline, the video call, the
 * quarter's news (its « Amende » stamp included: a CNIL fine is a fine), the
 * CEO's one-liners, the playbook, the loop back to the Tour, the footer — is
 * level 1's own object, not a copy of it. A correction made there lands here,
 * and nothing here asks to be reviewed twice. Only what names Partix, its
 * invitations or its law is written below.
 *
 * ## The English
 *
 * Written, not translated, under level 1's rules: « DG » is the CEO, French
 * and EU law keep their French names with one clause of explanation (the CNIL
 * is "France's data protection authority"), euro amounts stay in euros, the
 * foreign cases stay in the currency of their country (dollars for Tagged and
 * LinkedIn, Australian dollars for Meriton). The CNIL's fines are told without
 * the name of the firm (C77): « une société de marketing ». An administrative
 * fine is a fine, imposed by the CNIL's sanctions committee; the agreements of
 * Tagged and LinkedIn are settlements, never fines (« to settle »), the
 * German court's ruling against Facebook an injunction, the UK advertising
 * regulator's ruling a ruling, and WhatsApp's fine a decision it is
 * challenging in court.
 *
 * ## What stays fictional (brief §8.3)
 *
 * Partix, its CEO, Thomas and Léa, the handle @coloc_en_paix /
 * @peaceful_flatshare, and the newspapers of the clippings: L'Écho des applis,
 * Le Fil tech, La Lettre des applis. A real brand appears in one place only:
 * the `cas` of the catalogue, from the level's whitelist (Clubhouse, Tagged,
 * FarmVille, Facebook, LinkedIn, WhatsApp, Beer52, Meriton — GAME-BRIEF §19.9),
 * about something that already happened. « Partix » shows on no product of the
 * sector (searched on 2026-10-04); the trademark check stays Antoine's
 * (CHANTIERS.md D9). The word « store » is a common noun here, never a brand.
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

export const REFERRAL_CONTENT: DeepTranslatable<ReferralCopy> = {
  months: L1.months,
  monthInitials: L1.monthInitials,
  quarterPeriod: L1.quarterPeriod,
  timeline: L1.timeline,

  dashboard: {
    label: L1.dashboard.label,
    metric: t("Coefficient viral", "Viral coefficient"),
    metricUnit: t("par nouvel utilisateur", "per new user"),
    quarterTarget: L1.dashboard.quarterTarget,
    boardTarget: L1.dashboard.boardTarget,
    customers: t("Utilisateurs", "Users"),
    monthEnd: L1.dashboard.monthEnd,
    revenue: L1.dashboard.revenue,
    revenueDelta: L1.dashboard.revenueDelta,
    patience: L1.dashboard.patience,
    patienceLow: L1.dashboard.patienceLow,
    trust: t("Confiance des utilisateurs", "User trust"),
    radar: t("Radar CNIL", "Regulator radar"),
    notOnDashboard: L1.dashboard.notOnDashboard,
    hiddenValue: L1.dashboard.hiddenValue,
    revealed: L1.dashboard.revealed,
    delta: L1.dashboard.delta,
  },

  visio: {
    ...L1.visio,
    tag: t("DG · Partix", "CEO · Partix"),
  },

  boss: {
    t1: t(
      "Bonjour. Nouvelle boîte, même promesse : le board veut un coefficient viral de 0,60 en décembre, et je leur ai promis. Fin mars, je veux voir 0,43. Pas 0,42. Tu as deux chantiers ce trimestre. Je ne veux pas savoir comment, je veux le chiffre.",
      "Morning. New company, same promise: the board wants a viral coefficient of 0.60 by December, and I promised them. By the end of March I want to see 0.43. Not 0.42. You have two projects this quarter. I don't want to know how. I want the number.",
    ),
    t2Hit: L1.boss.t2Hit,
    t2Miss: t(
      "Tu m'as fait mentir en comité. {metric} au lieu de 0,43. Ça n'arrivera pas deux fois. Fin juin, {target}.",
      "You made me look like a liar in front of the committee. {metric} instead of 0.43. It won't happen twice. End of June, {target}.",
    ),
    t3Hit: L1.boss.t3Hit,
    t3Miss: L1.boss.t3Miss,
    t4Hit: t(
      "Dernière ligne droite. 0,60 fin décembre et on fête ça.",
      "Home stretch. 0.60 by the end of December and we celebrate.",
    ),
    t4Miss: t(
      "C'est ton dernier trimestre, tu le sais. 0,60 en décembre, ou je présente quelqu'un d'autre au board en janvier.",
      "This is your last quarter, and you know it. 0.60 in December, or I introduce someone else to the board in January.",
    ),
    orderWrap: L1.boss.orderWrap,
    yearEnd: L1.boss.yearEnd,
    fired: L1.boss.fired,
  },

  orders: {
    contacts: t(
      "on demande le carnet d'adresses dès l'inscription, et tous les contacts cochés à l'écran d'invitation. Décocher, c'est leur affaire.",
      "we ask for the address book at sign-up, and every contact ticked on the invitation screen. Unticking is their business.",
    ),
    autoinvite: t(
      "les invitations partent toutes seules, au nom de l'utilisateur, avec deux relances. Personne n'invite ses amis à la main.",
      "invitations go out on their own, in the user's name, with two follow-ups. Nobody invites their friends by hand.",
    ),
    bigshare: t(
      "après chaque dépense, un gros bouton « Continuer » qui invite le groupe et les contacts suggérés. « Passer », en petit. Les gens appuient sur le gros bouton.",
      'after every expense, a big "Continue" button that invites the group and the suggested contacts. "Skip", in small print. People tap the big button.',
    ),
    fakeinvite: t(
      "dès que quelqu'un s'inscrit, ses contacts reçoivent un message à son nom : « il t'attend ». Ça marche mieux qu'une pub.",
      'as soon as someone signs up, their contacts get a message in their name: "they\'re waiting for you". It works better than an ad.',
    ),
    bonus: t(
      "on affiche 10 € de bonus en gros. Les conditions, dans l'aide. On ne paie que ceux qui les remplissent.",
      "we show a €10 bonus in big letters. The conditions go in the help pages. We only pay the ones who meet them.",
    ),
  },

  hand: {
    ...L1.hand,
    unlocked: t("Débloqué par la question aux invités", "Unlocked by the question for guests"),
    productionEmpty: t(
      "Rien en production pour l'instant. L'écran d'invitation actuel : choisir dans ses contacts, un message tout fait.",
      "Nothing in production yet. The current invitation screen: pick from your contacts, a ready-made message.",
    ),
  },

  cards: {
    fairbonus: {
      name: t("Parrainage détaillé", "Detailed referral"),
      pitch: t(
        "5 € pour chacun, versés dès la première dépense partagée ; les conditions tiennent sur l'écran d'invitation.",
        "€5 each, paid on the first shared expense; the conditions fit on the invitation screen.",
      ),
    },
    guests: {
      name: t("Question aux invités", "Question for guests"),
      pitch: t(
        "Une question facultative aux invités qui ne s'inscrivent pas : « Qu'est-ce qui t'a retenu ? »",
        'One optional question for guests who don\'t sign up: "What held you back?"',
      ),
    },
    recap: {
      name: t("Récap partageable", "Shareable recap"),
      pitch: t(
        "Le récap d'un week-end, qui doit quoi à qui, lisible sans installer l'appli.",
        "A weekend's recap, who owes what to whom, readable without installing the app.",
      ),
    },
    guestpage: {
      name: t("Page de l'invité", "Guest page"),
      pitch: t(
        "L'invité voit le groupe et sa part avant de créer un compte.",
        "Guests see the group and their share before creating an account.",
      ),
    },
    present: L1.cards.present,
    chosen: {
      name: t("Invitation choisie", "Chosen invitation"),
      pitch: t(
        "On choisit chaque contact à inviter, et le message se modifie avant l'envoi.",
        "You pick each contact to invite, and the message can be edited before sending.",
      ),
    },
    grouplink: {
      name: t("Lien de groupe", "Group link"),
      pitch: t(
        "Un lien d'invitation par groupe, à envoyer où l'on veut.",
        "One invitation link per group, to send wherever you like.",
      ),
    },
    nobook: {
      name: t("Carnet facultatif", "Optional address book"),
      pitch: t(
        "L'appli marche sans accès aux contacts ; les numéros des non-inscrits ne sont pas gardés.",
        "The app works without access to contacts; non-users' numbers aren't kept.",
      ),
    },
    clean: {
      name: L1.cards.clean.name,
      pitch: t(
        "Revenir à l'écran d'invitation, aux messages et au parrainage d'origine.",
        "Go back to the original invitation screen, messages and referral offer.",
      ),
    },
    contacts: {
      name: t("Retrouver mes amis", "Find my friends"),
      pitch: t(
        "L'appli demande le carnet d'adresses pour retrouver les amis ; à l'écran d'invitation, tous les contacts sont cochés.",
        "The app asks for the address book to find friends; on the invitation screen, every contact is ticked.",
      ),
    },
    bigshare: {
      name: t("Bouton Continuer", "Continue button"),
      pitch: t(
        "Après chaque dépense ajoutée, un gros bouton « Continuer » invite le groupe et douze contacts suggérés ; « passer » est un lien gris.",
        'After each expense is added, a big "Continue" button invites the group and twelve suggested contacts; "skip" is a grey link.',
      ),
    },
    fakeinvite: {
      name: t("Invitation personnalisée", "Personalised invitation"),
      pitch: t(
        "Quand quelqu'un s'inscrit, ses contacts reçoivent « Thomas t'attend sur Partix ».",
        'When someone signs up, their contacts receive "Thomas is waiting for you on Partix".',
      ),
    },
    unlock: {
      name: t("Fonctions à débloquer", "Unlockable features"),
      pitch: t(
        "L'export du récap et les rappels de remboursement se débloquent à trois amis invités.",
        "Exporting the recap and repayment reminders unlock at three friends invited.",
      ),
    },
    autoinvite: {
      name: t("Invitations automatiques", "Automatic invitations"),
      pitch: t(
        "À l'inscription, une invitation part vers chaque contact au nom de l'utilisateur, avec deux relances.",
        "At sign-up, an invitation goes out to every contact in the user's name, with two follow-ups.",
      ),
    },
    shadow: {
      name: t("Suggestions d'amis", "Friend suggestions"),
      pitch: t(
        "Les numéros des contacts non inscrits sont gardés ; l'appli suggère qui inviter et leur propose de rejoindre.",
        "Non-users' numbers from the address books are kept; the app suggests who to invite and asks them to join.",
      ),
    },
    bonus: {
      name: t("Bonus de parrainage", "Referral bonus"),
      pitch: t(
        "« 10 € pour toi, 10 € pour ton ami » en tête de l'écran ; les conditions sont dans l'aide.",
        '"€10 for you, €10 for your friend" at the top of the screen; the conditions are in the help pages.',
      ),
    },
    reviewgate: {
      name: t("Demande d'avis ciblée", "Targeted review prompt"),
      pitch: t(
        "« Tu aimes Partix ? » : « Oui » mène à la note dans le store, « Pas vraiment » à un formulaire interne.",
        '"Enjoying Partix?": "Yes" leads to the store rating, "Not really" to an internal form.',
      ),
    },
  },

  // GAME-BRIEF §19.9: checked on 2026-10-04 against the primary sources when
  // they were readable (garanteprivacy.it, bundesgerichtshof.de, the ruling in
  // Perkins v. LinkedIn, asa.org.uk, accc.gov.au, cnil.fr, Légifrance, the App
  // Store's rules of 8 June 2026 and Google Play's, Gray et al. 2018). The legal
  // review of the catalogue stays Antoine's (CHANTIERS.md D9). A commitment, a
  // settlement, a recommendation or a ruling is never told as a sanction; the
  // CNIL's fines are told without the firm's name (C77).
  patterns: {
    contacts: {
      official: t("Aspiration du carnet d'adresses", "Address book leeching"),
      law: t(
        "L'appli qui récupère un carnet d'adresses traite les données de personnes qui n'ont rien demandé : il lui faut une base légale (RGPD, article 6), et elle doit les informer (article 14). La CNIL recommande de supprimer les contacts dès la recherche d'amis terminée, et les règles de l'App Store interdisent de cocher tous les contacts d'avance.",
        "An app that collects an address book processes data about people who asked for nothing: it needs a legal basis (GDPR, article 6), and it must inform them (article 14). The CNIL, France's data protection authority, recommends deleting the contacts as soon as the friend search is over, and the App Store's rules forbid ticking every contact in advance.",
      ),
      cas: t(
        "En 2022, l'autorité italienne de protection des données a infligé 2 millions d'euros à l'éditeur de Clubhouse, qui collectait les carnets d'adresses de ses utilisateurs sans informer les personnes qui y figuraient.",
        "In 2022, Italy's data protection authority fined the publisher of Clubhouse €2 million for collecting its users' address books without informing the people listed in them.",
      ),
      tell: t(
        "Si tous tes contacts sont cochés d'avance, c'est l'appli qui invite, pas toi.",
        "If all your contacts are ticked in advance, it's the app inviting, not you.",
      ),
    },
    bigshare: {
      official: t("Fausse hiérarchie", "False hierarchy"),
      law: t(
        "Un gros bouton qui partage, à côté d'un petit lien gris qui passe, oriente le choix : la CNIL juge qu'un accord obtenu ainsi n'est pas libre (RGPD, articles 4 et 7).",
        "A big button that shares, next to a small grey link that skips, steers the choice: the CNIL considers that agreement obtained that way isn't free (GDPR, articles 4 and 7).",
      ),
      cas: t(
        "En mai 2025, la CNIL a infligé 900 000 euros à une société de marketing : ses formulaires mettaient en valeur de gros boutons d'acceptation, à côté de liens de refus minuscules qui se confondaient avec le texte.",
        "In May 2025, the CNIL fined a marketing company €900,000: its forms highlighted big accept buttons, next to tiny refusal links that blended into the text.",
      ),
      tell: t(
        "Gros bouton pour partager, petit lien gris pour refuser : le choix est orienté.",
        "Big button to share, small grey link to say no: the choice is being steered.",
      ),
    },
    fakeinvite: {
      official: t("Faux message d'activité", "Fake activity message"),
      law: t(
        "Donner l'impression qu'un message vient d'un ami, quand il vient de l'entreprise, fait partie des pratiques trompeuses interdites en toutes circonstances : se présenter faussement comme un consommateur (article L121-4 du Code de la consommation). Un message de prospection ne doit pas non plus cacher pour le compte de qui il est envoyé (article L34-5 du Code des postes et des communications électroniques).",
        "Making a message look as if it comes from a friend, when it comes from the company, is one of the misleading practices banned in all circumstances under French law: falsely presenting oneself as a consumer (article L121-4 of the Consumer Code). A marketing message must not hide on whose behalf it is sent either (article L34-5 of the Postal and Electronic Communications Code).",
      ),
      cas: t(
        "En 2009, le réseau social Tagged a accepté de payer 500 000 dollars pour clore les poursuites de l'État de New York, sans reconnaître sa responsabilité : ses e-mails, maquillés pour sembler venir des membres eux-mêmes, annonçaient des photos partagées qui n'existaient pas.",
        "In 2009, the social network Tagged agreed to pay $500,000 to settle New York State's case, without admitting liability: its emails, disguised to look as if members had sent them, announced shared photos that didn't exist.",
      ),
      tell: t(
        "Si l'ami cité n'a rien fait, le message vient de l'appli, pas de lui.",
        "If the friend named didn't do anything, the message comes from the app, not from them.",
      ),
    },
    unlock: {
      official: t("Pyramide sociale", "Social pyramid"),
      law: t(
        "Aucune règle ne l'interdit en soi : les règles de l'App Store interdisent d'exiger une note ou un avis pour accéder à une fonction, pas une invitation. Mais chaque invitation envoyée reste de la prospection, avec ses règles.",
        "No rule bans it as such: the App Store's rules forbid requiring a rating or a review to unlock a feature, not an invitation. But every invitation sent is still marketing, with its own rules.",
      ),
      cas: t(
        "En 2018, des chercheurs de l'université Purdue l'ont décrite à partir de FarmVille, où certains objectifs restaient inaccessibles sans amis recrutés dans le jeu.",
        "In 2018, researchers at Purdue University described it using FarmVille, where some goals stayed out of reach without friends recruited into the game.",
      ),
      tell: t(
        "Une fonction qui se débloque en recrutant des amis te fait travailler pour l'appli.",
        "A feature that unlocks when you recruit friends has you working for the app.",
      ),
    },
    autoinvite: {
      official: t("Spam d'amis", "Friend spam"),
      law: t(
        "Envoyer des messages de promotion par SMS ou par e-mail à des personnes qui n'ont rien accepté est interdit (article L34-5 du Code des postes et des communications électroniques). Pour le parrainage, la CNIL précise que les coordonnées d'un ami ne servent qu'une fois : les relances automatiques en sortent.",
        "Sending promotional texts or emails to people who agreed to nothing is prohibited under French law (article L34-5 of the Postal and Electronic Communications Code). For referrals, the CNIL specifies that a friend's details can be used only once: automatic follow-ups fall outside that.",
      ),
      cas: t(
        "En 2016, la Cour fédérale de justice allemande a interdit à Facebook ses e-mails d'invitation « Trouver des amis » : même déclenchés par l'utilisateur, ils étaient une publicité de Facebook. Aux États-Unis, LinkedIn a accepté de verser 13 millions de dollars pour clore une action collective sur ses invitations et leurs relances.",
        'In 2016, Germany\'s Federal Court of Justice barred Facebook\'s "Find friends" invitation emails: even when triggered by the user, they were Facebook\'s advertising. In the United States, LinkedIn agreed to pay $13 million to settle a class action over its invitations and their follow-ups.',
      ),
      tell: t(
        "Une invitation que tu n'as pas écrite part quand même en ton nom.",
        "An invitation you didn't write still goes out in your name.",
      ),
    },
    shadow: {
      official: t("Profils fantômes", "Shadow profiles"),
      law: t(
        "Garder les numéros de personnes qui ne se sont jamais inscrites demande de les informer (RGPD, article 14) et de ne garder que le nécessaire (article 5). La CNIL demande de supprimer les contacts une fois la recherche d'amis faite, et les règles de l'App Store interdisent d'en faire une base pour soi.",
        "Keeping the numbers of people who never signed up requires informing them (GDPR, article 14) and keeping only what is needed (article 5). The CNIL asks for contacts to be deleted once the friend search is done, and the App Store's rules forbid building a database of them for yourself.",
      ),
      cas: t(
        "En 2021, l'autorité irlandaise de protection des données a infligé 225 millions d'euros à WhatsApp, notamment pour n'avoir pas informé les non-utilisateurs dont les numéros figuraient dans les carnets d'adresses. WhatsApp conteste la décision en justice.",
        "In 2021, Ireland's data protection authority fined WhatsApp €225 million, notably for not informing non-users whose numbers appeared in address books. WhatsApp is challenging the decision in court.",
      ),
      tell: t(
        "Tes amis jamais inscrits ont peut-être déjà une fiche chez l'appli.",
        "Your friends who never signed up may already have a file at the app.",
      ),
    },
    bonus: {
      official: t("Conditions cachées", "Hidden information"),
      law: t(
        "Des conditions qui changent la valeur d'une offre sont une information essentielle : les cacher dans l'aide, ou les donner trop tard, est une pratique commerciale trompeuse (articles L121-2 et L121-3 du Code de la consommation).",
        "Conditions that change what an offer is worth are essential information: hiding them in the help pages, or giving them too late, is a misleading commercial practice under French law (articles L121-2 and L121-3 of the Consumer Code).",
      ),
      cas: t(
        "En 2024, l'autorité britannique de la publicité a donné tort à Beer52 : son offre de parrainage promettait une caisse gratuite, à condition, écrit seulement dans les conditions générales, que l'ami en paie une deuxième au prix fort.",
        "In 2024, the UK's advertising regulator ruled against Beer52: its referral offer promised a free case, on condition, written only in the terms and conditions, that the friend paid full price for a second one.",
      ),
      tell: t(
        "Bonus en gros, conditions dans l'aide : c'est l'aide qui dit vrai.",
        "Bonus in big letters, conditions in the help pages: the help pages tell the truth.",
      ),
    },
    reviewgate: {
      official: t("Avis filtrés", "Review gating"),
      law: t(
        "Aucun texte français ne vise expressément ce tri en amont, mais les règles des deux stores l'interdisent : il faut passer par leur demande d'avis officielle, sans question avant. Une note gonflée ainsi peut aussi tromper ceux qui la lisent (article L121-2 du Code de la consommation).",
        "No French text expressly targets this upstream sorting, but both app stores' rules forbid it: the official review prompt must be used, with no question before it. A rating inflated this way can also mislead the people who read it (article L121-2 of the French Consumer Code).",
      ),
      cas: t(
        "En 2018, la justice australienne a condamné le groupe hôtelier Meriton à 3 millions de dollars australiens : il retirait des invitations à laisser un avis les clients susceptibles d'en écrire un mauvais.",
        "In 2018, an Australian court ordered the hotel group Meriton to pay A$3 million: it had kept guests likely to write a bad review out of the invitations to leave one.",
      ),
      tell: t(
        "Si seuls les contents sont envoyés vers le store, la note ment.",
        "If only happy users get sent to the store, the rating lies.",
      ),
    },
  },

  phone: {
    caption: t(
      "L'invitation telle que Thomas l'envoie et que Léa la reçoit",
      "The invitation as Thomas sends it and Léa receives it",
    ),
    appName: t("Partix", "Partix"),
    time: t("19:30", "19:30"),
    group: t("Week-end à Biarritz · 6 personnes · 1 284 €", "Weekend in Biarritz · 6 people · €1,284"),
    continueExpense: t("Dépense ajoutée · Restaurant · 186 €", "Expense added · Restaurant · €186"),
    continueButton: t("Continuer", "Continue"),
    continueFine: t("en invitant le groupe et 12 contacts suggérés", "inviting the group and 12 suggested contacts"),
    continueSkip: t("passer", "skip"),
    bonusLoud: t("10 € pour toi, 10 € pour ton ami", "€10 for you, €10 for your friend"),
    bonusLoudFine: t("*voir conditions", "*see conditions"),
    bonusClear: t("5 € chacun dès sa première dépense partagée", "€5 each on their first shared expense"),
    bonusClearTerms: t("Une fois par ami · versé sous 48 h", "Once per friend · paid within 48 hours"),
    locked: t(
      "Export PDF et rappels : invite 3 amis pour les débloquer (0/3)",
      "PDF export and reminders: invite 3 friends to unlock them (0/3)",
    ),
    inviteTitle: t("Inviter des amis", "Invite friends"),
    inviteBase: t("Choisir dans tes contacts", "Pick from your contacts"),
    invitePreselected: t("214 contacts sélectionnés", "214 contacts selected"),
    inviteChosen: t("2 contacts choisis · message modifiable", "2 contacts picked · editable message"),
    groupLink: t("Ou partager le lien du groupe", "Or share the group link"),
    autoSent: t(
      "Invitations envoyées à tes 214 contacts · 2 relances prévues",
      "Invitations sent to your 214 contacts · 2 follow-ups scheduled",
    ),
    reviewQuestion: t("Tu aimes Partix ?", "Enjoying Partix?"),
    reviewYes: t("Oui → noter l'appli dans le store", "Yes → rate the app in the store"),
    reviewNo: t("Pas vraiment → nous écrire", "Not really → write to us"),
    recap: t(
      "Récap du week-end, lisible sans l'appli : Léa doit 46 € à Thomas",
      "Weekend recap, readable without the app: Léa owes Thomas €46",
    ),
    guestDivider: t("Ce que reçoit Léa", "What Léa receives"),
    guestMessage: t(
      "Thomas t'invite dans le groupe « Week-end à Biarritz » sur Partix.",
      'Thomas is inviting you to the "Weekend in Biarritz" group on Partix.',
    ),
    guestMessagePersonalised: t(
      "Thomas t'attend sur Partix ! 3 de tes amis y sont déjà.",
      "Thomas is waiting for you on Partix! 3 of your friends are already there.",
    ),
    guestShadow: t("4 de tes contacts utilisent Partix. Rejoins-les.", "4 of your contacts use Partix. Join them."),
    guestPage: t("Voir le groupe et ta part sans installer l'appli", "See the group and your share without installing the app"),
    guestQuestion: t(
      "Pas encore inscrite ? Qu'est-ce qui t'a retenue ? Facultatif.",
      "Not signed up yet? What held you back? Optional.",
    ),
    guestAnswers: [
      t("Pas besoin d'une appli de plus", "No need for one more app"),
      t("Voir le groupe d'abord", "See the group first"),
      t("Autre", "Other"),
    ],
    noBook: t("Partix marche sans tes contacts.", "Partix works without your contacts."),
    noBookNumbers: t("Les numéros des non-inscrits ne sont pas gardés.", "Non-users' numbers aren't kept."),
  },

  sent: {
    none: t("0 message envoyé au nom de Thomas", "0 messages sent in Thomas's name"),
    some: t("{n} messages envoyés au nom de Thomas", "{n} messages sent in Thomas's name"),
    suffix: t("des messages qu'il n'a pas écrits", "messages he didn't write"),
  },

  report: {
    ...L1.report,
    metric: t("Coefficient viral", "Viral coefficient"),
    customers: t("Utilisateurs", "Users"),
    driversHeading: t("Pourquoi le coefficient viral a bougé : {delta}", "Why the viral coefficient moved: {delta}"),
    drivers: {
      ...L1.report.drivers,
      word: t("Ce que tes utilisateurs disent de Partix", "What your users say about Partix"),
      market: t("Le parrainage à 5 € d'une appli concurrente", "A rival app's €5 referral offer"),
    },
  },

  journal: L1.journal,

  effects: {
    insight: L1.effects.insight,
    present: L1.effects.present,
    clean: t("astuces retirées, le coefficient viral baisse un peu", "tricks removed, the viral coefficient dips a little"),
    gain: t("+{pct} % d'invitations acceptées ce trimestre", "+{pct}% accepted invitations this quarter"),
    gainRising: t(
      "+{pct} % d'invitations acceptées ce trimestre, l'effet monte encore",
      "+{pct}% accepted invitations this quarter, and the effect is still growing",
    ),
    loss: t(
      "−{pct} % d'invitations acceptées ce trimestre, des invitations que les gens ont choisies",
      "−{pct}% accepted invitations this quarter, invitations people actually chose",
    ),
    none: L1.effects.none,
  },

  events: {
    midMailMoving: L1.events.midMailMoving,
    midMailStalled: L1.events.midMailStalled,
    present: L1.events.present,
    surveyAnswers: t(
      "Les réponses des invités sont arrivées : 4 sur 10 n'avaient « pas besoin d'une appli de plus », 3 sur 10 voulaient « voir le groupe d'abord ». Tes prochains chantiers viseront plus juste, et tu as enfin de quoi montrer au DG : « Point données avec le DG » est débloqué.",
      'The guests\' answers are in: 4 in 10 had "no need for one more app", 3 in 10 wanted to "see the group first". Your next projects will aim better, and you finally have something to show the CEO: "Data review with the CEO" is unlocked.',
    ),
    control: t(
      "Contrôle de la CNIL, article dans la presse, amende administrative de {fine} prononcée par sa formation restreinte. Le DG te demande de tout retirer avant vendredi. {leavers} utilisateurs suppriment leur compte.",
      "An inspection by the CNIL, France's data protection authority, an article in the press, and an administrative fine of {fine} imposed by its sanctions committee. The CEO asks you to take everything down by Friday. {leavers} users delete their accounts.",
    ),
    reports: t(
      "Des centaines d'avis à une étoile dans les stores, et des plaintes déposées auprès de la CNIL. Un journaliste pose des questions au service presse.",
      "Hundreds of one-star reviews in the app stores, and complaints filed with the CNIL. A journalist is asking the press office questions.",
    ),
    viral: t(
      "Un fil viral : « Partix, j'ai désinstallé, voici pourquoi. » Les invités ne s'inscrivent plus.",
      'A viral thread: "Partix, I uninstalled it, here\'s why." Guests stop signing up.',
    ),
    press: t(
      "Un média tech cite Partix en exemple d'une appli qui ne force pas la main. Les utilisateurs invitent leurs amis d'eux-mêmes.",
      "A tech outlet cites Partix as an app that doesn't push people around. Users invite their friends of their own accord.",
    ),
    competitor: t(
      "Une appli concurrente a offert 5 € par parrainage au printemps. Tout le monde a perdu des invitations ce trimestre, toi compris.",
      "A rival app offered €5 a referral in the spring. Everyone lost invitations this quarter, you included.",
    ),
  },

  // Fictional media (brief §8.3). No event names a card (a clipping is about
  // what the radar saw, not about what was played).
  clippings: {
    control: {
      masthead: L1.clippings.control.masthead,
      headline: t("Partix sanctionné par la CNIL", "Partix fined by France's data protection watchdog"),
    },
    reports: {
      masthead: t("L'Écho des applis", "The App Echo"),
      headline: t("Les avis à une étoile contre Partix s'accumulent", "One-star reviews of Partix pile up"),
    },
    viral: {
      handle: t("@coloc_en_paix", "@peaceful_flatshare"),
    },
    press: {
      masthead: t("Le Fil tech", "The Tech Wire"),
      headline: t("Partix, l'appli qui ne force pas la main", "Partix, the app that doesn't push"),
    },
    competitor: {
      masthead: t("La Lettre des applis", "The App Letter"),
      headline: t("Les parrainages à 5 € se multiplient", "€5 referrals are everywhere"),
    },
    why: {
      controlHeading: L1.clippings.why.controlHeading,
      controlRadar: t(
        "Chaque astuce mise en production a fait monter le radar CNIL, la tuile masquée de ton tableau de bord. Ce trimestre, il a franchi le seuil du contrôle.",
        "Every trick you put into production pushed up the regulator radar, the hidden tile on your dashboard. This quarter it crossed the inspection threshold.",
      ),
      controlRemoved: L1.clippings.why.controlRemoved,
      controlNone: L1.clippings.why.controlNone,
      reportsHeading: L1.clippings.why.reportsHeading,
      reports: t(
        "Les avis des stores et les plaintes arrivent à la CNIL : ton radar CNIL, la tuile masquée de ton tableau de bord, approche du seuil du contrôle. Chaque nouvelle astuce l'en rapproche.",
        "Store reviews and complaints are reaching the CNIL: your regulator radar, the hidden tile on your dashboard, is nearing the inspection threshold. Every new trick brings it closer.",
      ),
    },
  },

  // Level 1's, whole: its « Amende · {fine} » stamp is the right one here too.
  news: L1.news,

  bossLines: L1.bossLines,

  endings: {
    applause: {
      win: true,
      eyebrow: L1.endings.applause.eyebrow,
      title: L1.endings.applause.title,
      text: t(
        "Coefficient viral à {metric} en décembre, {customers} utilisateurs, une confiance à {trust} que personne ne mesurait. Pas un message envoyé à la place de quelqu'un, pas un contact coché d'avance. Le DG t'a pressé trois fois. Tu as répondu avec des chiffres. C'est exactement le métier.",
        "Viral coefficient at {metric} in December, {customers} users, trust at {trust} that nobody was measuring. Not one message sent in someone else's name, not one contact ticked in advance. The CEO pushed you three times. You answered with numbers. That is exactly the job.",
      ),
    },
    cleanMiss: {
      win: true,
      eyebrow: L1.endings.cleanMiss.eyebrow,
      title: t("Pas encore 0,60. Mais tout est propre.", "Not 0.60 yet. But everything is clean."),
      text: t(
        "Coefficient viral à {metric}, confiance à {trust}. La courbe monte encore, parce que les effets lents ne s'arrêtent pas en décembre. Le board voulait un chiffre, tu as construit une pente. Regarde la confiance : c'est elle qui fera le 0,60 au printemps.",
        "Viral coefficient at {metric}, trust at {trust}. The curve is still climbing, because slow effects don't stop in December. The board wanted a number; you built a slope. Look at trust: that's what will deliver the 0.60 in the spring.",
      ),
    },
    firedClean: {
      win: false,
      eyebrow: L1.endings.firedClean.eyebrow,
      title: L1.endings.firedClean.title,
      text: t(
        "La patience du DG est tombée à {patience} avant que tes effets lents n'arrivent. Confiance à {trust}. L'année suivante, ton remplaçant a fait écrire à tous les contacts sans demander. Le jeu ne récompense pas toujours ceux qui ont raison trop tôt. La vraie vie non plus. Rejoue, et présente tes données plus tôt.",
        "The CEO's patience fell to {patience} before your slow effects could arrive. Trust at {trust}. The next year, your replacement had every contact messaged without asking. The game doesn't always reward people who are right too early. Neither does real life. Play again, and show your data sooner.",
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
        "Le radar est monté jusqu'au contrôle, l'amende est tombée, la presse a écrit. Coefficient viral à {metric} en décembre, confiance à {trust}. Les amis invités de force ont désinstallé, et ils l'ont raconté. Ce que tu as mis en production a des noms. Ils sont en dessous.",
        "The radar climbed all the way to an inspection, the fine landed, the press wrote about it. Viral coefficient at {metric} in December, trust at {trust}. The friends invited by force uninstalled, and told everyone why. What you put into production has names. They are below.",
      ),
    },
    labyrinth: {
      win: false,
      eyebrow: L1.endings.labyrinth.eyebrow,
      title: t("Les invitations tiennent. Regarde ce qu'elles coûtent.", "The invitations hold. Look at what they cost."),
      text: t(
        "Pas de contrôle cette année. Coefficient viral à {metric}, et une confiance à {trust} que ton dashboard ne t'a jamais montrée. Les utilisateurs que tu as pressés partent plus vite qu'ils ne sont venus. Le radar est à {radar}. Il ne redescend pas tout seul.",
        "No inspection this year. Viral coefficient at {metric}, and trust at {trust} that your dashboard never showed you. The users you pushed leave faster than they came. The radar is at {radar}. It doesn't come down on its own.",
      ),
    },
    repentant: {
      win: false,
      eyebrow: L1.endings.repentant.eyebrow,
      title: L1.endings.repentant.title,
      text: t(
        "Tu as mis des astuces en production, puis tu les as retirées. Coefficient viral à {metric}, confiance à {trust}, radar à {radar}. La confiance remonte plus lentement qu'elle ne tombe. C'est la seule règle du jeu qui est aussi celle de la vraie vie.",
        "You put tricks into production, then took them out. Viral coefficient at {metric}, trust at {trust}, radar at {radar}. Trust climbs back more slowly than it falls. It's the one rule of the game that is also a rule of real life.",
      ),
    },
  },

  december: {
    cells: {
      metric: t("Coefficient viral en {month}", "Viral coefficient in {month}"),
      trust: t("Confiance des utilisateurs", "User trust"),
      radar: t("Radar CNIL", "Regulator radar"),
      outOf: L1.december.cells.outOf,
    },
    gameNumbers: L1.december.gameNumbers,
    metricChart: {
      title: t("Coefficient viral par mois", "Viral coefficient per month"),
      caption: L1.december.metricChart.caption,
      label: t("Coefficient viral sur l'année, mois par mois", "Viral coefficient over the year, month by month"),
      reference: L1.december.metricChart.reference,
    },
    trustChart: {
      title: t("Confiance des utilisateurs, le compteur que personne n'affichait", "User trust, the counter nobody displayed"),
      caption: t(
        "De 0 à 100. À 35 ou moins, les utilisateurs le racontent, et les invités ne viennent plus.",
        "From 0 to 100. At 35 or below, users talk, and guests stop coming.",
      ),
      label: t("Confiance des utilisateurs sur l'année", "User trust over the year"),
      reference: L1.december.trustChart.reference,
    },
    trend: L1.december.trend,
    dataToggle: L1.december.dataToggle,
    table: {
      ...L1.december.table,
      metric: t("Coefficient viral", "Viral coefficient"),
    },
  },

  playbook: L1.playbook,

  catalogue: {
    ...L1.catalogue,
    hiddenEffect: t(
      "Confiance {trust}, radar {radar}, une seule fois, le jour où elle entre en production. Les invitations qu'elle fait accepter baissent de 30 % après trois mois.",
      "Trust {trust}, radar {radar}, once, on the day it goes into production. The invitations it gets accepted drop by 30% after three months.",
    ),
  },

  share: {
    ...L1.share,
    text: t(
      "Une année chez Partix : {title} Coefficient viral à {metric}, confiance à {trust}. Et toi, tu tiendrais ? {url}",
      "A year at Partix: {title} Viral coefficient at {metric}, trust at {trust}. Would you hold out? {url}",
    ),
  },

  // Level 1's, by reference (C75, A24.T0): « Niveau suivant » / « jouable » says
  // as much at five levels as at two, and the title comes from the level the
  // block points at (`LEVEL_TEASERS`, content/game/hub.ts).
  nextLevel: L1.nextLevel,

  tourLoop: L1.tourLoop,

  resume: {
    ...L1.resume,
    previously: t("Précédemment chez Partix", "Previously at Partix"),
    quarterLine: t("Trimestre {q} : {cards}. Coefficient viral à {metric}.", "Quarter {q}: {cards}. Viral coefficient at {metric}."),
    finished: t(
      "Ta dernière année chez Partix s'est terminée ainsi : « {title} »",
      'Your last year at Partix ended like this: "{title}"',
    ),
  },

  footer: L1.footer,

  a11y: {
    ...L1.a11y,
    quarterEnd: t(
      "Fin du trimestre {q} : coefficient viral {metric}, objectif {target} {status}, patience {patience}.",
      "End of quarter {q}: viral coefficient {metric}, target {target} {status}, patience {patience}.",
    ),
  },
};
