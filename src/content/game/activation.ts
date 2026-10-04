import type { ActivationCopy, DeepTranslatable } from "@/lib/game/copy";
import type { Translatable } from "@/lib/i18n/translatable";
import { RETENTION_CONTENT } from "./retention";

/**
 * ---------------------------------------------------------------------------
 * « LE CÔTÉ OBSCUR », NIVEAU « COMMENT ILS COMPRENNENT CE QUE VOUS APPORTEZ » (ACTIVATION) — every string of the level.
 * ---------------------------------------------------------------------------
 *
 * GAME-BRIEF.md §18 (`docs/game/activation.md`), its questions answered by
 * Antoine on 2026-10-04 (C78 to C81, and C77 for the CNIL's fines told
 * without the firm's name). The page resolves this tree to one language
 * (`resolveLevelCopy`) and hands it to the island; nothing in the browser
 * imports this file.
 *
 * TODO: à relire — 2026-10-04 (A24.ACT-1) : tout ce que ce fichier écrit lui-même, en français comme
 * en anglais : premier jet de la session, d'après la spécification du §18
 * (`docs/game/activation.md`). Aucune phrase ici ne vient d'un prototype.
 *
 * ## What comes from level 1, by reference
 *
 * The same CEO, the same desk, the same year: what level 1 already says in
 * words that fit any level — the months, the timeline, the video call, the
 * quarter's news (its « Amende » stamp included: a CNIL fine is a fine), the
 * CEO's one-liners, the playbook, the loop back to the Tour, the footer — is
 * level 1's own object, not a copy of it. A correction made there lands here,
 * and nothing here asks to be reviewed twice. Only what names Quandi, its
 * sign-up or its law is written below.
 *
 * ## The English
 *
 * Written, not translated, under level 1's rules: « DG » is the CEO, French
 * and EU law keep their French names with one clause of explanation (the CNIL
 * is "France's data protection authority"), euro amounts stay in euros, the
 * one American case stays in dollars. The CNIL's fines are told without the
 * name of the firm (C77): « un moteur de recherche », « un courtier en
 * données de neuf salariés ». An administrative fine is a fine, imposed by
 * the CNIL's sanctions committee; the FTC's agreement with Twitter is a
 * settlement, never a fine.
 *
 * ## What stays fictional (brief §8.3)
 *
 * Quandi, its CEO, the freelancers' group of @independant_et_fier /
 * @freelance_and_proud, and the newspapers of the clippings: La Lettre des
 * indépendants, Indépendants Magazine, La Lettre du logiciel. A real brand
 * appears in one place only: the `cas` of the catalogue, from the level's
 * whitelist (Google, Twitter — GAME-BRIEF §18.9), about something that
 * already happened. « Créneo », the spec's first name for the company, is
 * taken by two booking platforms (searched on 2026-10-04); « Quandi » shows
 * on no product. The trademark check stays Antoine's (CHANTIERS.md D9).
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

export const ACTIVATION_CONTENT: DeepTranslatable<ActivationCopy> = {
  months: L1.months,
  monthInitials: L1.monthInitials,
  quarterPeriod: L1.quarterPeriod,
  timeline: L1.timeline,

  dashboard: {
    label: L1.dashboard.label,
    metric: t("Activation", "Activation"),
    metricUnit: t("des inscrits, sous 7 jours", "of sign-ups, within 7 days"),
    quarterTarget: L1.dashboard.quarterTarget,
    boardTarget: L1.dashboard.boardTarget,
    customers: t("Utilisateurs actifs", "Active users"),
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

  visio: { ...L1.visio, tag: t("DG · Quandi", "CEO · Quandi") },

  boss: {
    t1: t(
      "Bonjour. Nouvelle boîte, même promesse : le board veut 45 % d'activation en décembre, et je leur ai promis. Fin mars, je veux voir 32,3 %. Pas 32,2. Tu as deux chantiers ce trimestre. Je ne veux pas savoir comment, je veux le chiffre.",
      "Morning. New company, same promise: the board wants 45% activation by December, and I promised them. By the end of March I want to see 32.3%. Not 32.2. You have two projects this quarter. I don't want to know how. I want the number.",
    ),
    t2Hit: L1.boss.t2Hit,
    t2Miss: t(
      "Tu m'as fait mentir en comité. {metric} au lieu de 32,3 %. Ça n'arrivera pas deux fois. Fin juin, {target}.",
      "You made me look like a liar in front of the committee. {metric} instead of 32.3%. It won't happen twice. End of June, {target}.",
    ),
    t3Hit: L1.boss.t3Hit,
    t3Miss: L1.boss.t3Miss,
    t4Hit: t(
      "Dernière ligne droite. 45 % fin décembre et on fête ça.",
      "Home stretch. 45% by the end of December and we celebrate.",
    ),
    t4Miss: t(
      "C'est ton dernier trimestre, tu le sais. 45 % en décembre, ou je présente quelqu'un d'autre au board en janvier.",
      "This is your last quarter, and you know it. 45% in December, or I introduce someone else to the board in January.",
    ),
    orderWrap: L1.boss.orderWrap,
    yearEnd: L1.boss.yearEnd,
    fired: L1.boss.fired,
  },

  orders: {
    bundle: t(
      "tu demandes toutes les autorisations au premier lancement. Contacts, agenda, notifications, tout d'un coup. Après, plus personne ne dit oui.",
      "you ask for every permission on first launch. Contacts, calendar, notifications, all at once. Later on, nobody says yes.",
    ),
    banner: t(
      "tu refais le bandeau des cookies. Un gros « Tout accepter », et le refus plus loin. Sans consentement, on ne mesure rien et on ne relance personne.",
      'you redo the cookie banner. A big "Accept all", and refusing further in. Without consent we can\'t measure anything or follow up with anyone.',
    ),
    phone: t(
      "on demande un numéro de mobile à l'inscription. Pour la sécurité, et un SMS fait publier plus qu'un e-mail.",
      "we ask for a mobile number at sign-up. For security, and a text gets people publishing more than an email does.",
    ),
    prechecked: t(
      "la case des conseils et offres, tu la coches d'avance. Les gens ne décochent pas.",
      "the tips-and-offers box, you tick it in advance. People don't untick.",
    ),
    partners: t(
      "on transmet les coordonnées des inscrits à nos partenaires. Une banque nous paie pour chaque contact, et c'est dans les conditions.",
      "we pass sign-ups' details on to our partners. A bank pays us for every contact, and it's in the terms.",
    ),
  },

  hand: {
    ...L1.hand,
    unlocked: t("Débloqué par les appels", "Unlocked by the calls"),
    productionEmpty: t(
      "Rien en production pour l'instant. L'inscription actuelle : un e-mail, un mot de passe, un métier, puis un planning vide.",
      "Nothing in production yet. The current sign-up: an email, a password, a trade, then an empty schedule.",
    ),
  },

  cards: {
    demo: {
      name: t("Démo sans compte", "Demo without an account"),
      pitch: t(
        "Un planning d'exemple qu'on peut modifier avant de créer un compte.",
        "A sample schedule you can edit before creating an account.",
      ),
    },
    calls: {
      name: t("Appels aux inscrits", "Calls with sign-ups"),
      pitch: t(
        "Dix appels de vingt minutes avec des inscrits qui n'ont encore rien publié.",
        "Ten twenty-minute calls with sign-ups who haven't published anything yet.",
      ),
    },
    checklist: {
      name: t("Premiers pas", "First steps"),
      pitch: t(
        "Une liste de trois étapes sur l'écran d'accueil : un client, un créneau, la publication. Elle se ferme d'un geste.",
        "A three-step list on the home screen: a client, a slot, publishing. It closes with one tap.",
      ),
    },
    import: {
      name: t("Import assisté", "Guided import"),
      pitch: t(
        "Reprendre son ancien agenda, en ligne ou depuis un fichier, en un seul écran.",
        "Bring over your old calendar, online or from a file, on a single screen.",
      ),
    },
    present: L1.cards.present,
    refuse: {
      name: t("Refus en un clic", "One-click refusal"),
      pitch: t(
        "Sur le bandeau des cookies, « Tout refuser » à côté de « Tout accepter », de la même taille.",
        'On the cookie banner, "Reject all" next to "Accept all", the same size.',
      ),
    },
    welcome: {
      name: t("E-mail de bienvenue", "Welcome email"),
      pitch: t(
        "Un seul e-mail, le lendemain de l'inscription : le planning en cours et un modèle adapté au métier.",
        "A single email, the day after sign-up: the schedule in progress and a template for the trade.",
      ),
    },
    minimal: {
      name: t("Inscription minimale", "Minimal sign-up"),
      pitch: t(
        "L'inscription ne demande que l'e-mail, avec un lien de connexion ; le métier attend, et le numéro devient facultatif.",
        "Sign-up asks only for an email, with a sign-in link; the trade can wait, and the phone number becomes optional.",
      ),
    },
    clean: {
      name: L1.cards.clean.name,
      pitch: t(
        "Revenir à l'inscription, au bandeau et aux demandes d'autorisation d'origine.",
        "Go back to the original sign-up, banner and permission requests.",
      ),
    },
    bundle: {
      name: t("Autorisations au démarrage", "Permissions at launch"),
      pitch: t(
        "Au premier lancement, un écran de l'appli demande d'un coup contacts, agenda, notifications et position, avec un seul bouton « Autoriser ».",
        'On first launch, an in-app screen asks for contacts, calendar, notifications and location at once, with a single "Allow" button.',
      ),
    },
    phone: {
      name: t("Numéro obligatoire", "Mandatory number"),
      pitch: t(
        "Un numéro de mobile est demandé à l'inscription pour sécuriser le compte ; il sert aussi aux relances par SMS.",
        "A mobile number is required at sign-up to secure the account; it is also used for text reminders.",
      ),
    },
    prechecked: {
      name: t("Cases préremplies", "Pre-filled boxes"),
      pitch: t(
        "À l'inscription, « Recevoir nos conseils et offres » est déjà cochée.",
        'At sign-up, "Receive our tips and offers" is already ticked.',
      ),
    },
    analysis: {
      name: t("Écran d'analyse", "Analysis screen"),
      pitch: t(
        "Après l'inscription, une barre de progression de douze secondes : « Nous préparons votre planning sur mesure… »",
        'After sign-up, a twelve-second progress bar: "We\'re preparing your tailored schedule…"',
      ),
    },
    banner: {
      name: t("Bandeau optimisé", "Optimised banner"),
      pitch: t(
        "« Tout accepter » en bouton, « Personnaliser » en lien ; le refus est sur le deuxième écran.",
        '"Accept all" as a button, "Customise" as a link; refusing is on the second screen.',
      ),
    },
    pixels: {
      name: t("E-mails suivis", "Tracked emails"),
      pitch: t(
        "Chaque e-mail porte un pixel qui enregistre qui l'ouvre et à quelle heure ; les relances partent à cette heure-là.",
        "Every email carries a pixel that records who opens it and at what time; the follow-ups go out at that hour.",
      ),
    },
    partners: {
      name: t("Partage partenaires", "Partner sharing"),
      pitch: t(
        "Sous « Créer mon compte » : « En créant mon compte, j'accepte que mes coordonnées soient transmises à nos partenaires. »",
        'Under "Create my account": "By creating my account, I agree that my details may be passed on to our partners."',
      ),
    },
    tour: {
      name: t("Visite guidée", "Guided tour"),
      pitch: t(
        "Des info-bulles guident le premier planning ; elles restent tant qu'il n'est pas publié.",
        "Tooltips guide the first schedule; they stay until it is published.",
      ),
    },
  },

  // GAME-BRIEF §18.9: checked on 2026-10-04 against the primary sources when
  // they were readable (cnil.fr, Légifrance, the Conseil d'État, the CJEU's
  // press release, the FTC, the CNIL's Cahier IP nº 6 and its recommendation on
  // tracking pixels, the EDPB guidelines). The legal review of the catalogue
  // stays Antoine's (CHANTIERS.md D9). A commitment, a settlement, a
  // recommendation or a ruling of interpretation is never told as a sanction;
  // the CNIL's fines are told without the firm's name (C77).
  patterns: {
    bundle: {
      official: t("Consentement en bloc", "Bundled consent"),
      law: t(
        "Un consentement doit être libre, spécifique et éclairé : quand plusieurs usages sont demandés, chacun doit l'être à part (RGPD, articles 4 et 7). Pour les contacts, l'agenda ou la position stockés sur le téléphone, l'article 82 de la loi Informatique et Libertés s'ajoute, et la CNIL recommande de demander chaque accès au moment où il sert.",
        "Consent must be free, specific and informed: when several uses are asked for, each one must be asked for separately (GDPR, articles 4 and 7). For contacts, calendar or location stored on the phone, French law adds article 82 of the Data Protection Act, and the CNIL recommends asking for each access at the moment it is needed.",
      ),
      cas: t(
        "En 2019, la CNIL a infligé 50 millions d'euros à Google, notamment pour un consentement recueilli d'un bloc pour toutes les finalités. Le Conseil d'État a confirmé la sanction en 2020 : un tel consentement « ne peut être regardé comme éclairé ».",
        'In 2019, the CNIL fined Google €50 million, notably for consent collected in one block for every purpose. France\'s Council of State upheld the fine in 2020: such consent "cannot be regarded as informed".',
      ),
      tell: t(
        "Chaque accès se demande à part, au moment où l'appli en a besoin.",
        "Each access gets asked for separately, when the app actually needs it.",
      ),
    },
    phone: {
      official: t("Chantage à la sécurité", "Safety blackmail"),
      law: t(
        "Une donnée collectée pour une finalité ne peut pas servir à une autre qui lui est incompatible : RGPD, article 5. La CNIL en donne l'exemple : un numéro présenté comme servant à l'authentification, qui sert en réalité à la prospection.",
        "Data collected for one purpose cannot be used for another, incompatible one: GDPR, article 5. The CNIL gives this very example: a phone number presented as being for authentication, actually used for marketing.",
      ),
      cas: t(
        "Aux États-Unis, Twitter a accepté en 2022 de payer 150 millions de dollars pour clore des poursuites de la FTC, l'autorité fédérale de la consommation : des numéros de téléphone et des adresses e-mail, demandés pour sécuriser les comptes, avaient servi à cibler de la publicité.",
        "In the United States, Twitter agreed in 2022 to pay $150 million to settle charges by the FTC, the federal consumer protection agency: phone numbers and email addresses requested to secure accounts had been used to target advertising.",
      ),
      tell: t(
        "Un numéro donné pour ta sécurité ne doit jamais servir à te relancer.",
        "A number you gave for your security should never be used to chase you.",
      ),
    },
    prechecked: {
      official: t("Réglage intrusif par défaut", "Deceptive snugness"),
      law: t(
        "Une case cochée d'avance n'est jamais un consentement : RGPD, considérant 32. Une offre en rapport avec leur métier aurait pu s'envoyer à des indépendants sans case, avec un simple droit de s'y opposer ; mais Quandi a choisi de demander un accord, et un accord se donne par un geste.",
        "A box ticked in advance is never consent: GDPR, recital 32. An offer related to their trade could have been sent to freelancers without any box, with a simple right to object; but Quandi chose to ask for agreement, and agreement is given by an action.",
      ),
      cas: t(
        "En 2019, la Cour de justice de l'Union européenne a jugé, à propos des cookies d'un jeu-concours en ligne, qu'une case cochée d'avance ne vaut pas consentement.",
        "In 2019, the Court of Justice of the European Union ruled, in a case about an online competition's cookies, that a box ticked in advance is not consent.",
      ),
      tell: t(
        "Une case cochée d'avance n'a jamais valu un oui.",
        "A box ticked in advance has never meant yes.",
      ),
    },
    analysis: {
      official: t("Illusion de travail", "Labor illusion"),
      law: t(
        "Aucune règle ne la nomme. Mais faire croire qu'un service accomplit un travail qu'il ne fait pas trompe sur ses qualités : article L121-2 du Code de la consommation, que l'article L121-5 étend aux pratiques qui visent les professionnels. C'est l'affaire de la DGCCRF, pas de la CNIL.",
        "No rule names it. But making people believe a service does work it doesn't do misleads them about its qualities: article L121-2 of the French Consumer Code, which article L121-5 extends to practices aimed at professionals. That's for the DGCCRF, France's consumer protection authority, not the CNIL.",
      ),
      cas: t(
        "En 2011, deux chercheurs de la Harvard Business School ont montré qu'un service qui montre son travail pendant l'attente paraît plus précieux. Les barres de progression qui ne calculent rien imitent ce travail.",
        "In 2011, two Harvard Business School researchers showed that a service that shows its work while you wait seems more valuable. Progress bars that compute nothing imitate that work.",
      ),
      tell: t(
        "Si l'attente ne calcule rien, elle sert à te faire croire quelque chose.",
        "If the wait isn't computing anything, it's there to make you believe something.",
      ),
    },
    banner: {
      official: t("Rallonger le parcours", "Longer than necessary"),
      law: t(
        "Déposer des cookies de mesure ou de publicité demande l'accord de l'utilisateur : article 82 de la loi Informatique et Libertés. La CNIL précise que refuser doit être aussi simple qu'accepter, sur le même écran, par exemple avec deux boutons « Tout accepter » et « Tout refuser » de même format.",
        'Placing measurement or advertising cookies requires the user\'s agreement under French law, article 82 of the Data Protection Act. The CNIL, France\'s data protection authority, specifies that refusing must be as easy as accepting, on the same screen, for example with "Accept all" and "Reject all" buttons in the same format.',
      ),
      cas: t(
        "En décembre 2021, la CNIL a infligé une amende de 150 millions d'euros à un moteur de recherche et de 60 millions à un réseau social : refuser les cookies y demandait plusieurs clics, les accepter un seul.",
        "In December 2021, the CNIL fined a search engine €150 million and a social network €60 million: refusing cookies took several clicks there, accepting them took one.",
      ),
      tell: t(
        "Si refuser te demande plus de clics qu'accepter, ce n'est pas un vrai choix.",
        "If saying no takes more clicks than saying yes, it isn't a real choice.",
      ),
    },
    pixels: {
      official: t("Pixel espion", "Tracking pixel"),
      law: t(
        "Un pixel qui enregistre qui ouvre un e-mail, et quand, est un traceur : il demande l'accord du destinataire (article 82 de la loi Informatique et Libertés). Seule une mesure réduite, la date de la dernière ouverture, peut s'en passer, pour vérifier que les e-mails arrivent.",
        "A pixel that records who opens an email, and when, is a tracker: it needs the recipient's agreement (article 82 of the French Data Protection Act). Only a reduced measure, the date of the last opening, can do without it, to check that emails are getting through.",
      ),
      cas: t(
        "En avril 2026, la CNIL a publié sa recommandation sur les pixels de suivi dans les e-mails : mesurer les ouvertures pour optimiser les envois demande un accord. Ce n'est pas une sanction, c'est la règle telle que la CNIL la lit.",
        "In April 2026, the CNIL published its recommendation on tracking pixels in emails: measuring openings to optimise mailings requires agreement. It is not a sanction; it is the rule as the CNIL reads it.",
      ),
      tell: t(
        "Savoir quand tu ouvres un e-mail, c'est un traceur : il faut ton accord.",
        "Knowing when you open an email is tracking: it needs your agreement.",
      ),
    },
    partners: {
      official: t("Consentement de dernière minute", "Last-minute consent"),
      law: t(
        "Un consentement n'est pas libre quand un service est subordonné à un traitement dont il n'a pas besoin (RGPD, article 7). Transmettre des coordonnées à des partenaires demande un accord à part, qu'on peut refuser sans perdre son compte.",
        "Consent is not free when a service is made conditional on processing it doesn't need (GDPR, article 7). Passing details on to partners needs a separate agreement, one you can refuse without losing your account.",
      ),
      cas: t(
        "En mai 2025, la CNIL a infligé 80 000 euros à un courtier en données de neuf salariés, notamment pour avoir transmis des adresses à ses partenaires sans le consentement des personnes.",
        "In May 2025, the CNIL fined a data broker with nine employees €80,000, notably for passing addresses on to its partners without people's consent.",
      ),
      tell: t(
        "Si refuser le partage t'empêche de t'inscrire, ton accord n'est pas libre.",
        "If refusing to share stops you signing up, your agreement isn't free.",
      ),
    },
    tour: {
      official: t("Harcèlement d'interface", "Nagging"),
      law: t(
        "Aucune loi ne l'interdit à un outil comme Quandi. Le règlement européen sur les services numériques interdit de redemander un choix déjà fait, mais il ne vise que les plateformes en ligne, et pas les petites.",
        "No law forbids it for a tool like Quandi. The EU's Digital Services Act bans asking again for a choice already made, but it only covers online platforms, and not small ones.",
      ),
      cas: t(
        "En 2022, l'OCDE l'a rangée dans sa classification des dark patterns : des demandes répétées de faire ce que l'entreprise préfère.",
        "In 2022, the OECD listed it in its classification of dark patterns: repeated requests to do what the company prefers.",
      ),
      tell: t(
        "Une aide qu'on ne peut pas fermer n'aide plus : elle pousse.",
        "Help you can't close isn't helping any more: it's pushing.",
      ),
    },
  },

  phone: {
    caption: t(
      "L'arrivée sur l'appli telle qu'un indépendant la voit",
      "Arriving on the app as a freelancer sees it",
    ),
    appName: t("Quandi", "Quandi"),
    time: t("08:12", "08:12"),
    permissions: t(
      "Pour bien démarrer, Quandi a besoin de vos contacts, de votre agenda, de vos notifications et de votre position.",
      "To get started, Quandi needs your contacts, your calendar, your notifications and your location.",
    ),
    permissionsAllow: t("Autoriser", "Allow"),
    bannerText: t("Cookies de mesure d'audience", "Audience measurement cookies"),
    bannerTextNudged: t(
      "Nous utilisons des cookies pour améliorer votre expérience.",
      "We use cookies to improve your experience.",
    ),
    bannerAccept: t("Accepter", "Accept"),
    bannerContinue: t("Continuer sans accepter", "Continue without accepting"),
    bannerAcceptAll: t("Tout accepter", "Accept all"),
    bannerRejectAll: t("Tout refuser", "Reject all"),
    bannerCustomise: t("Personnaliser", "Customise"),
    demo: t(
      "Essayer sans compte : un planning d'exemple à modifier",
      "Try it without an account: a sample schedule to edit",
    ),
    signupTitle: t("Créer mon compte", "Create my account"),
    fields: t("E-mail · Mot de passe · Métier", "Email · Password · Trade"),
    fieldsMinimal: t("E-mail · lien de connexion envoyé par e-mail", "Email · sign-in link sent by email"),
    phoneRequired: t(
      "Mobile (obligatoire) · pour sécuriser votre compte",
      "Mobile (required) · to secure your account",
    ),
    phoneOptional: t("Mobile (facultatif)", "Mobile (optional)"),
    prechecked: t("☑ Recevoir nos conseils et offres", "☑ Receive our tips and offers"),
    partners: t(
      "En créant mon compte, j'accepte que mes coordonnées soient transmises à nos partenaires.",
      "By creating my account, I agree that my details may be passed on to our partners.",
    ),
    submit: t("Créer mon compte", "Create my account"),
    analysis: t("Nous préparons votre planning sur mesure… 64 %", "We're preparing your tailored schedule… 64%"),
    homeEmpty: t("Votre planning est vide.", "Your schedule is empty."),
    homeCreate: t("Créer un premier créneau", "Create a first slot"),
    checklist: t(
      "Premiers pas · 1 Ajouter un client · 2 Créer un créneau · 3 Publier",
      "First steps · 1 Add a client · 2 Create a slot · 3 Publish",
    ),
    checklistClose: t("Fermer", "Close"),
    importer: t("Reprendre votre ancien agenda", "Bring over your old calendar"),
    tour: t(
      "Étape 1 sur 7 · Créez votre premier créneau · Suivant",
      "Step 1 of 7 · Create your first slot · Next",
    ),
    push: t(
      "Vous n'avez pas encore ouvert notre e-mail. Il contient votre planning.",
      "You haven't opened our email yet. It has your schedule in it.",
    ),
    welcome: t(
      "E-mail de demain : votre planning en cours et un modèle pour votre métier",
      "Tomorrow's email: your schedule in progress and a template for your trade",
    ),
    calls: t(
      "Vingt minutes au téléphone ? Dites-nous ce qui vous a arrêté. Facultatif.",
      "Twenty minutes on the phone? Tell us what stopped you. Optional.",
    ),
    callsAnswers: [
      t("Pas su par où commencer", "Didn't know where to start"),
      t("Un agenda à reprendre", "A calendar to bring over"),
      t("Autre", "Other"),
    ],
  },

  cookies: {
    easy: t("Refuser les cookies : 1 clic", "Refusing cookies: 1 click"),
    hidden: t("Refuser les cookies : 3 clics", "Refusing cookies: 3 clicks"),
    lawSuffix: t("le refus doit être aussi simple que l'accord", "refusing must be as easy as agreeing"),
  },

  report: {
    ...L1.report,
    metric: t("Activation", "Activation"),
    customers: t("Utilisateurs actifs", "Active users"),
    driversHeading: t("Pourquoi l'activation a bougé : {delta}", "Why activation moved: {delta}"),
    drivers: {
      ...L1.report.drivers,
      word: t("Ce que tes utilisateurs disent de Quandi", "What your users say about Quandi"),
      market: t("L'offre gratuite d'un concurrent", "A competitor's free plan"),
    },
  },

  journal: L1.journal,

  effects: {
    insight: L1.effects.insight,
    present: L1.effects.present,
    clean: t("astuces retirées, l'activation baisse un peu", "tricks removed, activation dips a little"),
    gain: t("+{pct} % d'inscrits activés ce trimestre", "+{pct}% activated sign-ups this quarter"),
    gainRising: t(
      "+{pct} % d'inscrits activés ce trimestre, l'effet monte encore",
      "+{pct}% activated sign-ups this quarter, and the effect is still growing",
    ),
    loss: t(
      "−{pct} % d'inscrits activés ce trimestre, des inscrits qui choisissent ce qu'ils donnent",
      "−{pct}% activated sign-ups this quarter, sign-ups who choose what they give",
    ),
    none: L1.effects.none,
  },

  events: {
    midMailMoving: L1.events.midMailMoving,
    midMailStalled: L1.events.midMailStalled,
    present: L1.events.present,
    surveyAnswers: t(
      "Les appels sont faits : 4 inscrits sur 10 n'ont « pas su par où commencer », 3 sur 10 avaient « un agenda à reprendre ». Tes prochains chantiers viseront plus juste, et tu as enfin de quoi montrer au DG : « Point données avec le DG » est débloqué.",
      'The calls are done: 4 sign-ups in 10 "didn\'t know where to start", 3 in 10 had "a calendar to bring over". Your next projects will aim better, and you finally have something to show the CEO: "Data review with the CEO" is unlocked.',
    ),
    control: t(
      "Contrôle de la CNIL, article dans la presse, amende administrative de {fine} prononcée par sa formation restreinte. Le DG te demande de tout retirer avant vendredi. {leavers} utilisateurs suppriment leur compte.",
      "An inspection by the CNIL, France's data protection authority, an article in the press, and an administrative fine of {fine} imposed by its sanctions committee. The CEO asks you to take everything down by Friday. {leavers} users delete their accounts.",
    ),
    reports: t(
      "Des dizaines de plaintes déposées auprès de la CNIL. Un journaliste pose des questions au service presse.",
      "Dozens of complaints filed with the CNIL. A journalist is asking the press office questions.",
    ),
    viral: t(
      "Un fil viral dans un groupe d'indépendants : « Quandi, je ne leur confie plus rien, voici pourquoi. » Les inscrits repartent sans rien publier.",
      'A viral thread in a freelancers\' group: "Quandi, I don\'t trust them with anything any more, here\'s why." Sign-ups leave without publishing anything.',
    ),
    press: t(
      "Un magazine pour indépendants cite Quandi en exemple d'un outil qui ne force pas la main. Les inscrits arrivent en sachant ce qu'ils viennent chercher.",
      "A magazine for freelancers cites Quandi as a tool that doesn't push people around. Sign-ups arrive knowing what they came for.",
    ),
    competitor: t(
      "Un concurrent a lancé une offre gratuite à vie au printemps. Des curieux se sont inscrits partout sans rien publier, chez toi aussi.",
      "A competitor launched a free-for-life plan in the spring. Curious people signed up everywhere without publishing anything, with you too.",
    ),
  },

  // Fictional media (brief §8.3). No event names a card (a clipping is about
  // what the radar saw, not about what was played).
  clippings: {
    control: {
      masthead: L1.clippings.control.masthead,
      headline: t("Quandi sanctionné par la CNIL", "Quandi fined by France's data protection watchdog"),
    },
    reports: {
      masthead: t("La Lettre des indépendants", "The Freelancer's Letter"),
      headline: t("Les plaintes contre Quandi s'accumulent", "Complaints against Quandi pile up"),
    },
    viral: { handle: t("@independant_et_fier", "@freelance_and_proud") },
    press: {
      masthead: t("Indépendants Magazine", "Freelancer Magazine"),
      headline: t("Quandi, l'outil qui ne force pas la main", "Quandi, the tool that doesn't push"),
    },
    competitor: {
      masthead: t("La Lettre du logiciel", "The Software Letter"),
      headline: t("Le gratuit à vie arrive dans la planification", "Free for life comes to scheduling tools"),
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
        "Les plaintes arrivent à la CNIL : ton radar CNIL, la tuile masquée de ton tableau de bord, approche du seuil du contrôle. Chaque nouvelle astuce l'en rapproche.",
        "Complaints are reaching the CNIL: your regulator radar, the hidden tile on your dashboard, is nearing the inspection threshold. Every new trick brings it closer.",
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
        "Activation à {metric} en décembre, {customers} utilisateurs actifs, une confiance à {trust} que personne ne mesurait. Pas une case cochée d'avance, pas un refus caché. Le DG t'a pressé trois fois. Tu as répondu avec des chiffres. C'est exactement le métier.",
        "Activation at {metric} in December, {customers} active users, trust at {trust} that nobody was measuring. Not one box ticked in advance, not one hidden refusal. The CEO pushed you three times. You answered with numbers. That is exactly the job.",
      ),
    },
    cleanMiss: {
      win: true,
      eyebrow: L1.endings.cleanMiss.eyebrow,
      title: t("Pas encore 45 %. Mais tout est propre.", "Not 45% yet. But everything is clean."),
      text: t(
        "Activation à {metric}, confiance à {trust}. La courbe monte encore, parce que les effets lents ne s'arrêtent pas en décembre. Le board voulait un chiffre, tu as construit une pente. Regarde la confiance : c'est elle qui fera les 45 % au printemps.",
        "Activation at {metric}, trust at {trust}. The curve is still climbing, because slow effects don't stop in December. The board wanted a number; you built a slope. Look at trust: that's what will deliver the 45% in the spring.",
      ),
    },
    firedClean: {
      win: false,
      eyebrow: L1.endings.firedClean.eyebrow,
      title: L1.endings.firedClean.title,
      text: t(
        "La patience du DG est tombée à {patience} avant que tes effets lents n'arrivent. Confiance à {trust}. L'année suivante, ton remplaçant a caché le refus des cookies. Le jeu ne récompense pas toujours ceux qui ont raison trop tôt. La vraie vie non plus. Rejoue, et présente tes données plus tôt.",
        "The CEO's patience fell to {patience} before your slow effects could arrive. Trust at {trust}. The next year, your replacement hid the cookie refusal. The game doesn't always reward people who are right too early. Neither does real life. Play again, and show your data sooner.",
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
        "Le radar est monté jusqu'au contrôle, l'amende est tombée, la presse a écrit. Activation à {metric} en décembre, confiance à {trust}. Les inscrits que tu as pressés ont fermé leur compte, et ils l'ont raconté. Ce que tu as mis en production a des noms. Ils sont en dessous.",
        "The radar climbed all the way to an inspection, the fine landed, the press wrote about it. Activation at {metric} in December, trust at {trust}. The sign-ups you pushed closed their accounts, and told everyone why. What you put into production has names. They are below.",
      ),
    },
    labyrinth: {
      win: false,
      eyebrow: L1.endings.labyrinth.eyebrow,
      title: t("L'inscription tient. Regarde ce qu'elle coûte.", "The sign-up holds. Look at what it costs."),
      text: t(
        "Pas de contrôle cette année. Activation à {metric}, et une confiance à {trust} que ton dashboard ne t'a jamais montrée. Les utilisateurs que tu as pressés partent plus vite qu'ils ne sont venus. Le radar est à {radar}. Il ne redescend pas tout seul.",
        "No inspection this year. Activation at {metric}, and trust at {trust} that your dashboard never showed you. The users you pushed leave faster than they came. The radar is at {radar}. It doesn't come down on its own.",
      ),
    },
    repentant: {
      win: false,
      eyebrow: L1.endings.repentant.eyebrow,
      title: L1.endings.repentant.title,
      text: t(
        "Tu as mis des astuces en production, puis tu les as retirées. Activation à {metric}, confiance à {trust}, radar à {radar}. La confiance remonte plus lentement qu'elle ne tombe. C'est la seule règle du jeu qui est aussi celle de la vraie vie.",
        "You put tricks into production, then took them out. Activation at {metric}, trust at {trust}, radar at {radar}. Trust climbs back more slowly than it falls. It's the one rule of the game that is also a rule of real life.",
      ),
    },
  },

  december: {
    cells: {
      metric: t("Activation en {month}", "Activation in {month}"),
      trust: t("Confiance des utilisateurs", "User trust"),
      radar: t("Radar CNIL", "Regulator radar"),
      outOf: L1.december.cells.outOf,
    },
    gameNumbers: L1.december.gameNumbers,
    metricChart: {
      title: t("Activation par mois", "Activation per month"),
      caption: L1.december.metricChart.caption,
      label: t(
        "Activation des inscrits sur l'année, mois par mois",
        "Sign-up activation over the year, month by month",
      ),
      reference: L1.december.metricChart.reference,
    },
    trustChart: {
      title: t(
        "Confiance des utilisateurs, le compteur que personne n'affichait",
        "User trust, the counter nobody displayed",
      ),
      caption: t(
        "De 0 à 100. À 35 ou moins, les utilisateurs le racontent, et les inscrits repartent.",
        "From 0 to 100. At 35 or below, users talk, and sign-ups leave.",
      ),
      label: t("Confiance des utilisateurs sur l'année", "User trust over the year"),
      reference: L1.december.trustChart.reference,
    },
    trend: L1.december.trend,
    dataToggle: L1.december.dataToggle,
    table: { ...L1.december.table, metric: t("Activation", "Activation") },
  },

  playbook: L1.playbook,

  catalogue: {
    ...L1.catalogue,
    hiddenEffect: t(
      "Confiance {trust}, radar {radar}, une seule fois, le jour où elle entre en production. Les inscrits qu'elle fait publier baissent de 30 % après trois mois.",
      "Trust {trust}, radar {radar}, once, on the day it goes into production. The sign-ups it gets publishing drop by 30% after three months.",
    ),
  },

  share: {
    ...L1.share,
    text: t(
      "Une année chez Quandi : {title} Activation à {metric}, confiance à {trust}. Et toi, tu tiendrais ? {url}",
      "A year at Quandi: {title} Activation at {metric}, trust at {trust}. Would you hold out? {url}",
    ),
  },

  // Level 1's, by reference (C75, A24.T0): « Niveau suivant » / « jouable » says
  // as much at five levels as at two, and the title comes from the level the
  // block points at (`LEVEL_TEASERS`, content/game/hub.ts).
  nextLevel: L1.nextLevel,

  tourLoop: L1.tourLoop,

  resume: {
    ...L1.resume,
    previously: t("Précédemment chez Quandi", "Previously at Quandi"),
    quarterLine: t(
      "Trimestre {q} : {cards}. Activation à {metric}.",
      "Quarter {q}: {cards}. Activation at {metric}.",
    ),
    finished: t(
      "Ta dernière année chez Quandi s'est terminée ainsi : « {title} »",
      'Your last year at Quandi ended like this: "{title}"',
    ),
  },

  footer: L1.footer,

  a11y: {
    ...L1.a11y,
    quarterEnd: t(
      "Fin du trimestre {q} : activation {metric}, objectif {target} {status}, patience {patience}.",
      "End of quarter {q}: activation {metric}, target {target} {status}, patience {patience}.",
    ),
  },
};
