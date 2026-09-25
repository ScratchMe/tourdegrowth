import type { DeepTranslatable, RetentionCopy } from "@/lib/game/copy";
import type { Translatable } from "@/lib/i18n/translatable";

/**
 * ---------------------------------------------------------------------------
 * « LE CÔTÉ OBSCUR », NIVEAU 1 « S'ILS REVIENNENT » — every string of the level.
 * ---------------------------------------------------------------------------
 *
 * GAME-BRIEF.md §8 and the implementation plan §3.4, §5. The page resolves
 * this tree to one language (`resolveLevelCopy`) and hands it to the island;
 * nothing in the browser imports this file.
 *
 * ## Where the French comes from
 *
 * The prototype (`design/game/prototype-s-ils-reviennent.html`), taken word
 * for word: Antoine validated that French over four iterations, so a string
 * lifted from it is NOT marked for review. Three kinds of change, and only
 * these, and each is marked `TODO: à relire` (convention 6):
 *
 * - **Corrections the plan lists**: R6 (the trust chart said « sous 40 »
 *   while the viral thread fires at 35 or less), R7 (« Effet caché » said the
 *   trust hit repeats every quarter; it applies once, on the day the card is
 *   picked), R15 (the prototype's footer and its « verrouillé · prototype »),
 *   and three statements of fact the prototype got wrong about a real brand
 *   or a law (Basic-Fit, the DSA, Adobe — review of 2026-09-25).
 * - **New strings** the finished game needs and the prototype never had
 *   (plan §5): « Comment se joue une année », the ringing call, the report's
 *   statuses and headers, the clippings, the timeline, the resume prompt,
 *   the chart references, the screen-reader announcements.
 * - **Templating**, which changes no word: a number the prototype
 *   concatenated becomes a `{placeholder}` the island fills with an
 *   already-formatted value. `game-retention.test.ts` (C11) extracts the
 *   prototype's own strings and checks that every unmarked French string here
 *   still reads the same, clause by clause — so « word for word » is a test,
 *   not a promise.
 *
 * Typography is the repo's, not the prototype's: U+00A0 before the high
 * punctuation marks, % and the euro sign, after the opening guillemet, and
 * inside digit groups (copy-typography.test.ts). No word changes for that,
 * which is why it is not marked either.
 *
 * ## The English
 *
 * Written, not translated (brief §8.2). « DG » is the CEO. French and EU law
 * keep their French names and get one clause of explanation for a reader
 * who has never heard of the DGCCRF. Euro amounts stay in euros; the two
 * American cases stay in dollars. The CEO keeps his voice: imperatives,
 * numbers, things left unsaid.
 *
 * The prototype had no English at all, so EVERY English string of this file
 * is new, including the ones whose French is unmarked below.
 * TODO: à relire — toute la version anglaise, premier jet de la session (2026-09-24).
 *
 * ## What stays fictional (brief §8.3)
 *
 * Flixo, its CEO, « un concurrent », the phone number 09 70 00 00 00, Léa and
 * Karim, and the newspapers of the clippings. A real brand appears in one
 * place only: the `cas` of the catalogue, from a whitelist (C6), about
 * something that already happened.
 *
 * ## House rule for the cards (brief §5.5, tested by C3 and C9)
 *
 * A name and a pitch describe the mechanism — never the effect, never the
 * intent. No percentage, no signed number, none of « lent », « rapide »,
 * « efficace », « honnête », « astuce », « faux », « piège » (nor their
 * English cousins), no sentence of consequence. The judgement comes in
 * December.
 */
const t = (fr: string, en: string): Translatable => ({ fr, en });

export const RETENTION_CONTENT: DeepTranslatable<RetentionCopy> = {
  intro: {
    eyebrow: t(
      "Tour de Growth · le côté obscur · niveau « S'ils reviennent »",
      'Tour de Growth · the dark side · level "If they come back"',
    ),
    title: t("Une année chez Flixo", "A year at Flixo"),
    lead: t(
      "Tu es le PM growth de Flixo, une appli de streaming à 12,99 € par mois. Cent mille abonnés, et 6 % d'entre eux résilient chaque mois. Le board veut 4 % d'ici décembre. Chaque trimestre, le DG t'appelle en visio, puis tu as droit à deux actions, nommées comme on les nomme en réunion. Tu ne sauras ce qu'elles valent qu'une fois le trimestre passé. Le DG, lui, sait déjà ce qu'il veut.",
      "You're the growth PM at Flixo, a streaming app at €12.99 a month. A hundred thousand subscribers, and 6% of them cancel every month. The board wants 4% by December. Every quarter, the CEO calls you on video, then you get two actions, named the way people name them in meetings. You'll only find out what they're worth once the quarter is over. The CEO already knows what he wants.",
    ),
    // TODO: à relire — nouveau (plan §5, nº3) : remplace le tutoriel à halos écarté au §1.4.
    howTitle: t("Comment se joue une année", "How a year plays out"),
    howSteps: [
      {
        // TODO: à relire — nouveau (plan §5, nº3).
        title: t("Le DG t'appelle", "The CEO calls you"),
        text: t(
          "Chaque trimestre commence par une visio. Il dit ce qu'il veut, parfois comment l'obtenir.",
          "Every quarter starts with a video call. He says what he wants, sometimes how to get it.",
        ),
      },
      {
        // TODO: à relire — nouveau (plan §5, nº3).
        title: t("Tu choisis deux actions", "You pick two actions"),
        text: t(
          "Elles portent les noms qu'on leur donne en réunion. Aucune ne dit ce qu'elle rapporte.",
          "They carry the names people give them in meetings. None of them tells you what it pays.",
        ),
      },
      {
        // TODO: à relire — nouveau (plan §5, nº3).
        title: t("Trois mois passent", "Three months go by"),
        text: t(
          "Le dashboard bouge et le DG réagit. Certains compteurs n'y figurent pas : tu les verras en décembre.",
          "The dashboard moves and the CEO reacts. Some counters aren't on it: you'll see them in December.",
        ),
      },
    ],
  },

  zones: {
    navLabel: t("Les cinq zones de Tour de Growth", "The five zones of the Tour de Growth"),
    titles: [
      t("Comment les gens vous trouvent", "How people find you"),
      t("Comment ils comprennent ce que vous apportez", "How they understand what you bring"),
      t("S'ils reviennent", "If they come back"),
      t("S'ils vous recommandent", "If they recommend you"),
      t("Comment vous gagnez de l'argent", "How you make money"),
    ],
    // TODO: à relire — nouveau (décision 4 de l'orchestrateur : le nom d'étape du Tour ET le titre de la zone).
    current: t("{pillar} — {title}", "{pillar} — {title}"),
    // TODO: à relire — nouveau (plan §2.6, ZoneNav).
    soon: t("bientôt", "coming soon"),
    // TODO: à relire — nouveau (plan R13, ZoneNav compacte).
    position: t("Zone {n}/{total}", "Zone {n}/{total}"),
  },

  months: [
    t("janvier", "January"),
    t("février", "February"),
    t("mars", "March"),
    t("avril", "April"),
    t("mai", "May"),
    t("juin", "June"),
    t("juillet", "July"),
    t("août", "August"),
    t("septembre", "September"),
    t("octobre", "October"),
    t("novembre", "November"),
    t("décembre", "December"),
  ],
  monthInitials: [
    t("J", "J"),
    t("F", "F"),
    t("M", "M"),
    t("A", "A"),
    t("M", "M"),
    t("J", "J"),
    t("J", "J"),
    t("A", "A"),
    t("S", "S"),
    t("O", "O"),
    t("N", "N"),
    t("D", "D"),
  ],
  quarterPeriod: t("Trimestre {q} · {from} à {to}", "Quarter {q} · {from} to {to}"),

  // TODO: à relire — nouveau (plan §1.3, QuarterTimeline) : tout le bloc.
  timeline: {
    label: t("Ton année, trimestre par trimestre", "Your year, quarter by quarter"),
    quarter: t("T{q}", "Q{q}"),
    ranges: [t("janv.–mars", "Jan–Mar"), t("avr.–juin", "Apr–Jun"), t("juil.–sept.", "Jul–Sep"), t("oct.–déc.", "Oct–Dec")],
    december: t("Décembre", "December"),
    hit: t("atteint", "hit"),
    missed: t("manqué", "missed"),
  },

  dashboard: {
    label: t("Ton dashboard", "Your dashboard"),
    churn: t("Résiliations", "Churn"),
    churnUnit: t("par mois", "per month"),
    quarterTarget: t("objectif du trimestre : {target}", "quarter target: {target}"),
    boardTarget: t("objectif du board : {target}", "board target: {target}"),
    subs: t("Abonnés", "Subscribers"),
    monthEnd: t("{month}, fin de mois", "{month}, end of month"),
    mrr: t("Revenu mensuel", "Monthly revenue"),
    mrrDelta: t("{delta} vs janvier", "{delta} vs January"),
    patience: t("Patience du DG", "CEO's patience"),
    // TODO: à relire — nouveau (plan §2.6 : sous 35, dit en mots et pas seulement en couleur).
    patienceLow: t("à bout", "at breaking point"),
    trust: t("Confiance des abonnés", "Subscriber trust"),
    radar: t("Radar DGCCRF", "Regulator radar"),
    notOnDashboard: t("pas sur ton dashboard", "not on your dashboard"),
    // TODO: à relire — nouveau (plan §2.6, tuile cachée : le texte que lit un lecteur d'écran).
    hiddenValue: t("Masquée jusqu'en décembre", "Hidden until December"),
    // TODO: à relire — nouveau (plan §2.6).
    revealed: t("révélée en décembre", "revealed in December"),
    // TODO: à relire — nouveau (plan §1.3, deltas sur les tuiles).
    delta: t("{delta} ce trimestre", "{delta} this quarter"),
  },

  visio: {
    label: t("Visio avec le DG", "Video call with the CEO"),
    tag: t("DG · Flixo", "CEO · Flixo"),
    listen: t("Écouter le DG", "Listen to the CEO"),
    hangUp: t("Quitter la visio", "Leave the call"),
    hungUp: t("raccroché", "hung up"),
    ended: t("terminé", "ended"),
    // TODO: à relire — nouveau (plan §1.3, l'appel entrant entre deux trimestres).
    ringing: t("Le DG t'appelle", "The CEO is calling you"),
    // TODO: à relire — nouveau (plan §1.3).
    pickUp: t("Décrocher", "Pick up"),
    // TODO: à relire — nouveau (plan §1.3, brief §10).
    reread: t("Relire le message du DG", "Reread the CEO's message"),
  },

  boss: {
    t1: t(
      "Bonjour. Je vais être direct : le board veut 4 % de résiliations en décembre, et je leur ai promis. Fin mars, je veux voir 5,6 %. Pas 5,7. Tu as deux chantiers ce trimestre. Je ne veux pas savoir comment, je veux le chiffre.",
      "Morning. I'll be direct: the board wants churn at 4% by December, and I promised them. By the end of March I want to see 5.6%. Not 5.7. You have two projects this quarter. I don't want to know how. I want the number.",
    ),
    t2Hit: t(
      "{churn}, c'est bien. Mars, c'était l'échauffement. Fin juin, {target}.",
      "{churn}, that's good. March was the warm-up. End of June, {target}.",
    ),
    t2Miss: t(
      "Tu m'as fait mentir en comité. {churn} au lieu de 5,6. Ça n'arrivera pas deux fois. Fin juin, {target}.",
      "You made me look like a liar in front of the committee. {churn} instead of 5.6. It won't happen twice. End of June, {target}.",
    ),
    t3Hit: t(
      "On tient. La marche est plus haute maintenant : {target} fin septembre.",
      "We're holding. The next step is higher: {target} by the end of September.",
    ),
    t3Miss: t(
      "Deux trimestres ratés. Le board m'a demandé si tu étais la bonne personne. J'ai dit oui. Prouve-le : {target} fin septembre.",
      "Two quarters missed. The board asked me whether you were the right person. I said yes. Prove it: {target} by the end of September.",
    ),
    t4Hit: t(
      "Dernière ligne droite. 4 % fin décembre et on fête ça.",
      "Home stretch. 4% by the end of December and we celebrate.",
    ),
    t4Miss: t(
      "C'est ton dernier trimestre, tu le sais. 4 % en décembre, ou je présente quelqu'un d'autre au board en janvier.",
      "This is your last quarter, and you know it. 4% in December, or I introduce someone else to the board in January.",
    ),
    orderWrap: t(
      "Et ce trimestre, {order} Ce n'est pas une idée, c'est une demande.",
      "And this quarter, {order} That's not an idea. It's a request.",
    ),
    yearEnd: t("On fait le point en janvier.", "We'll take stock in January."),
    fired: t("On va s'arrêter là. Merci pour tout.", "We'll stop there. Thanks for everything."),
  },

  orders: {
    pdef: t(
      "tu mets la pause en avant, en gros, et le bouton résilier… disons, plus discret. Le concurrent le fait.",
      "you put the pause up front, big, and the cancel button… let's say, more discreet. The competition does it.",
    ),
    call: t(
      "on résilie par téléphone, du lundi au vendredi, comme le concurrent. Ses chiffres sont insolents.",
      "cancellations go through the phone, Monday to Friday, like the competition. Their numbers are outrageous.",
    ),
    bury: t(
      "tu enterres le bouton résilier dans les paramètres. Personne ne regarde en fin d'année.",
      "you bury the cancel button in the settings. Nobody looks at year end.",
    ),
    cascade: t(
      "avant de laisser partir quelqu'un, tu lui fais trois offres. Trois. Pas une.",
      "before you let anyone go, you make them three offers. Three. Not one.",
    ),
    notice: t(
      "un préavis de trente jours à la résiliation, avec un dernier prélèvement. C'est écrit quelque part dans les conditions, non ?",
      "thirty days' notice on every cancellation, with one last charge. It's written somewhere in the terms, isn't it?",
    ),
  },

  hand: {
    title: t("Trimestre {q} · tes deux actions", "Quarter {q} · your two actions"),
    count: t("{picked} / {max}", "{picked} / {max}"),
    order: t("Demandé par le DG", "Requested by the CEO"),
    // TODO: à relire — nouveau (plan §2.6 : l'état d'une carte cochée est dit en mots).
    chosen: t("Choisie", "Chosen"),
    production: t("En production : {cards}.", "In production: {cards}."),
    productionEmpty: t(
      "Rien en production pour l'instant. Le parcours actuel : un bouton, deux clics.",
      "Nothing in production yet. The current flow: one button, two clicks.",
    ),
    run: t("Lancer le trimestre", "Run the quarter"),
    hintInitial: t("Choisis deux actions.", "Pick two actions."),
    hintCallOpen: t("Le DG parle. Quitte la visio pour choisir.", "The CEO is talking. Leave the call to choose."),
    hintPick: t(
      "Choisis deux actions. Tu verras leur effet à la fin du trimestre.",
      "Pick two actions. You'll see their effect at the end of the quarter.",
    ),
    hintReady: t("Trois mois vont passer. Regarde les chiffres.", "Three months are about to pass. Watch the numbers."),
    yearInterrupted: t("Année interrompue", "Year cut short"),
    yearOver: t("Année terminée", "Year over"),
  },

  cards: {
    pause: {
      name: t("Offre de pause", "Pause offer"),
      pitch: t(
        "Trois mois sans prélèvement, proposés une fois sur la page de résiliation.",
        "Three months with no charge, offered once on the cancellation page.",
      ),
    },
    survey: {
      name: t("Questionnaire de sortie", "Exit survey"),
      pitch: t("Une question facultative aux abonnés qui résilient.", "One optional question for subscribers who cancel."),
    },
    onboard: {
      name: t("Chantier onboarding", "Onboarding project"),
      pitch: t("Retravailler la première semaine des nouveaux abonnés.", "Rework the first week of new subscribers."),
    },
    annual: {
      name: t("Offre annuelle", "Annual plan"),
      pitch: t("Douze mois pour le prix de dix, sur la page abonnement.", "Twelve months for the price of ten, on the subscription page."),
    },
    remind: {
      name: t("Rappel avant prélèvement", "Pre-billing reminder"),
      pitch: t("Un e-mail trois jours avant chaque échéance.", "An email three days before each renewal."),
    },
    reco: {
      name: t("Chantier recommandations", "Recommendations project"),
      pitch: t(
        "Retravailler ce que l'appli propose de regarder le soir.",
        "Rework what the app suggests watching in the evening.",
      ),
    },
    three: {
      name: t("Résiliation en trois clics", "Three-click cancellation"),
      pitch: t(
        "Un bouton sur la page abonnement, une confirmation, la date d'effet.",
        "A button on the subscription page, one confirmation, the date it takes effect.",
      ),
    },
    present: {
      name: t("Point données avec le DG", "Data review with the CEO"),
      pitch: t("Une réunion de trente minutes avec les chiffres du trimestre.", "A thirty-minute meeting with the quarter's numbers."),
    },
    clean: {
      name: t("Retrait des changements", "Rollback of the changes"),
      pitch: t("Revenir au parcours de résiliation d'origine.", "Go back to the original cancellation flow."),
    },
    bury: {
      name: t("Alléger la page abonnement", "Declutter the subscription page"),
      pitch: t(
        "Le lien « Résilier » passe dans Paramètres › Compte › Autres options.",
        'The "Cancel" link moves to Settings › Account › Other options.',
      ),
    },
    call: {
      name: t("Résiliation accompagnée", "Assisted cancellation"),
      pitch: t(
        "La résiliation se fait par téléphone, du lundi au vendredi, le matin.",
        "Cancellation happens by phone, Monday to Friday, in the morning.",
      ),
    },
    cascade: {
      name: t("Offres de rétention", "Retention offers"),
      pitch: t(
        "Trois offres successives présentées avant la confirmation.",
        "Three successive offers shown before the confirmation.",
      ),
    },
    shame: {
      name: t("Bouton de refus personnalisé", "Custom decline button"),
      pitch: t(
        "Le bouton pour décliner l'offre dit « Non merci, je préfère m'ennuyer ».",
        'The button to decline the offer says "No thanks, I\'d rather be bored".',
      ),
    },
    social: {
      name: t("Preuve sociale en sortie", "Social proof at exit"),
      pitch: t(
        "« Léa, Karim et 2 amis continuent sans vous », affiché au-dessus du bouton.",
        '"Léa, Karim and 2 friends are staying without you", shown above the button.',
      ),
    },
    notice: {
      name: t("Préavis contractuel", "Contractual notice"),
      pitch: t(
        "La résiliation prend effet trente jours après la demande.",
        "Cancellation takes effect thirty days after the request.",
      ),
    },
    pdef: {
      name: t("Pause mise en avant", "Pause up front"),
      pitch: t(
        "Le bouton principal devient « Mettre en pause ». Résilier passe en lien secondaire.",
        'The main button becomes "Pause". Cancel moves to a secondary link.',
      ),
    },
    streak: {
      name: t("Notifications de série", "Streak notifications"),
      pitch: t(
        "« Votre série de 12 soirs va s'arrêter », envoyé chaque soir.",
        '"Your 12-night streak is about to end", sent every evening.',
      ),
    },
  },

  patterns: {
    bury: {
      official: t("Obstruction", "Obstruction"),
      law: t(
        "Depuis le 1er juin 2023, un abonnement souscrit en ligne doit pouvoir être résilié en ligne, par un parcours direct et facile. C'est l'article L215-1-1 du Code de la consommation, la loi dite « des trois clics ».",
        'Since 1 June 2023, French law has required that a subscription taken out online can be cancelled online, through a direct and easy path. It is article L215-1-1 of the French Consumer Code, known as the "three-click" law.',
      ),
      // TODO: à relire — correction factuelle (revue du 2026-09-25) : la sanction de 2023
      // porte sur des manquements d'information, dont les conditions de résiliation
      // annoncées avant la souscription, pour une enquête (mars 2022-janvier 2023)
      // antérieure à L215-1-1. Pas sur un parcours de résiliation en ligne.
      cas: t(
        "Basic-Fit a écopé en 2023 de 68 500 € d'amende de la DGCCRF pour des faits antérieurs à cette loi, notamment des conditions de résiliation mal annoncées avant la souscription.",
        "Basic-Fit was fined €68,500 in 2023 by the DGCCRF, France's consumer protection authority, for conduct that predates this law, notably cancellation terms not properly disclosed before people subscribed.",
      ),
      tell: t(
        "Si tu cherches le bouton depuis plus de dix secondes, ce n'est pas toi. C'est voulu.",
        "If you've been looking for the button for more than ten seconds, it isn't you. It's on purpose.",
      ),
    },
    call: {
      official: t("Action forcée", "Forced action"),
      law: t(
        "Le même article impose une résiliation par voie électronique quand la souscription s'est faite en ligne. Le téléphone obligatoire est hors-jeu.",
        "The same article requires cancellation to be possible online whenever the subscription was taken out online. A mandatory phone call is out of bounds.",
      ),
      cas: t(
        "Aux États-Unis, Amazon a accepté en 2025 de payer 2,5 milliards de dollars, en partie pour son parcours de désabonnement Prime, baptisé en interne « Iliad », du nom d'une épopée qui n'en finit pas.",
        'In the United States, Amazon agreed in 2025 to pay $2.5 billion, partly over its Prime cancellation flow, known internally as "Iliad", after an epic that never ends.',
      ),
      tell: t(
        "On t'a vendu en un clic, on te retient au téléphone.",
        "They sold it to you in one click. They keep you on the phone.",
      ),
    },
    cascade: {
      official: t("Harcèlement d'interface", "Nagging"),
      // TODO: à relire — correction juridique (revue du 2026-09-25) : l'art. 25 du DSA
      // ne s'applique pas aux pratiques couvertes par la directive sur les pratiques
      // commerciales déloyales (25.2), donc pas à la résiliation d'un abonnement grand
      // public ; la demande répétée n'y figure qu'en exemple (considérant 67, 25.3.b).
      // La règle qui s'applique à Flixo est celle des pratiques agressives, L121-6.
      law: t(
        "Des sollicitations répétées et insistantes qui entravent l'exercice d'un droit, comme celui de résilier, sont une pratique commerciale agressive : article L121-6 du Code de la consommation. Pour les plateformes en ligne, le règlement européen DSA cite aussi en exemple le fait de redemander un choix déjà fait.",
        "Repeated and insistent solicitations that hinder the exercise of a right, such as the right to cancel, are an aggressive commercial practice under French law, article L121-6 of the Consumer Code. For online platforms, the EU's Digital Services Act also gives asking again for a choice already made as an example.",
      ),
      cas: t(
        "Le site deceptive.design en recense des dizaines d'exemples dans son hall of shame, Amazon et Google en tête.",
        "The site deceptive.design lists dozens of examples in its hall of shame, with Amazon and Google at the top.",
      ),
      tell: t("Chaque « Non merci » ouvre une nouvelle porte.", 'Every "No thanks" opens another door.'),
    },
    shame: {
      official: t("Confirmshaming", "Confirmshaming"),
      law: t(
        "Pas d'interdiction directe en France, mais la CNIL le classe parmi les designs trompeurs, et il pèse dans l'appréciation d'une pratique déloyale.",
        "Not banned outright in France, but the CNIL, France's data protection authority, lists it among deceptive designs, and it weighs when a practice is judged unfair.",
      ),
      cas: t(
        "C'est le dark pattern le plus documenté en ligne : le bouton de refus qui te fait passer pour un idiot.",
        "It is the most documented dark pattern online: the decline button that makes you look like a fool.",
      ),
      tell: t("Le bouton refuse à ta place, avec tes mots.", "The button says no for you, in words it puts in your mouth."),
    },
    social: {
      official: t("Fausse preuve sociale", "Fake social proof"),
      law: t(
        "Inventer des amis ou des chiffres pour influencer une décision est une pratique commerciale trompeuse, article L121-2 du Code de la consommation.",
        "Inventing friends or figures to sway a decision is a misleading commercial practice under French law, article L121-2 of the Consumer Code.",
      ),
      cas: t(
        "Les fausses jauges de stock et les faux compteurs de visiteurs font partie des pratiques que la DGCCRF contrôle sur les sites marchands.",
        "Fake stock gauges and fake visitor counters are among the practices the DGCCRF, France's consumer protection authority, checks on shopping sites.",
      ),
      tell: t(
        "Des prénoms que tu ne connais pas, des chiffres ronds qui tombent bien.",
        "First names you don't know, round numbers that land just right.",
      ),
    },
    notice: {
      official: t("Coût caché", "Hidden cost"),
      law: t(
        "Les conditions de résiliation, préavis compris, doivent être annoncées avant la souscription, pas au moment de partir. Article L221-5 du Code de la consommation.",
        "Cancellation terms, notice period included, must be stated before you subscribe, not when you try to leave. Article L221-5 of the French Consumer Code.",
      ),
      // TODO: à relire — correction factuelle (revue du 2026-09-25) : les 150 M$ du
      // communiqué du ministère de la Justice (13 mars 2026) sont 75 M$ d'amende
      // civile et 75 M$ de services gratuits, et des faits allégués, pas reconnus.
      cas: t(
        "Aux États-Unis, Adobe a conclu en 2026 un accord de 150 millions de dollars, pour moitié une amende civile et pour moitié des services gratuits, afin de clore des poursuites l'accusant d'avoir mal annoncé ses frais de résiliation anticipée.",
        "In the United States, Adobe agreed in 2026 to a $150 million settlement, half a civil penalty and half free services, to resolve claims that it had not properly disclosed its early termination fees.",
      ),
      tell: t("Un dernier prélèvement dont personne ne t'avait parlé.", "One last charge nobody had told you about."),
    },
    pdef: {
      official: t("Présélection et interférence visuelle", "Preselection and visual interference"),
      law: t(
        "La CNIL décrit ce détournement de l'attention dans ses ressources sur le design trompeur : le bouton mis en avant n'est pas celui que l'utilisateur cherche.",
        "The CNIL, France's data protection authority, describes this diversion of attention in its resources on deceptive design: the button pushed forward is not the one the user is looking for.",
      ),
      cas: t(
        "Proposer la pause avant la sortie est devenu la norme du streaming. La réactiver sans prévenir, c'est autre chose.",
        "Offering a pause before the exit has become the norm in streaming. Switching it back on without warning is something else.",
      ),
      tell: t("Le gros bouton n'est pas celui que tu cherches.", "The big button isn't the one you're looking for."),
    },
    streak: {
      official: t("Design addictif", "Addictive design"),
      law: t(
        "Le futur Digital Fairness Act européen, attendu fin 2026, vise explicitement les mécanismes addictifs, séries et notifications de culpabilisation compris. La France les cite déjà dans ses travaux sur les écrans des mineurs.",
        "The EU's upcoming Digital Fairness Act, expected at the end of 2026, explicitly targets addictive mechanisms, streaks and guilt-tripping notifications included. France already names them in its work on children and screens.",
      ),
      cas: t(
        "Les séries quotidiennes ont fait la fortune des applis d'apprentissage et de jeu. Elles marchent parce qu'elles reposent sur la peur de perdre, pas sur l'envie de revenir.",
        "Daily streaks made the fortune of learning and gaming apps. They work because they run on the fear of losing, not on the wish to come back.",
      ),
      tell: t(
        "L'appli te parle de ce que tu vas perdre, jamais de ce que tu vas trouver.",
        "The app talks about what you'll lose, never about what you'll find.",
      ),
    },
  },

  phone: {
    caption: t("L'écran de résiliation tel que les abonnés le voient", "The cancellation screen as subscribers see it"),
    appName: t("Flixo", "Flixo"),
    time: t("21:04", "21:04"),
    streakPush: t("Votre série de 12 soirs va s'arrêter ce soir.", "Your 12-night streak ends tonight."),
    crumbs: t("Compte › Mon abonnement", "Account › My subscription"),
    crumbsBuried: t(
      "Paramètres › Compte › Gérer mon abonnement › Autres options › Aide",
      "Settings › Account › Manage my subscription › Other options › Help",
    ),
    plan: t("Premium", "Premium"),
    planAnnual: t("Premium annuel", "Premium annual"),
    price: t("12,99 € par mois · prochain prélèvement le 3", "€12.99 a month · next charge on the 3rd"),
    priceAnnual: t("129,90 € par an · résiliable en ligne", "€129.90 a year · can be cancelled online"),
    social: t("Léa, Karim et 2 amis continuent sans vous.", "Léa, Karim and 2 friends are staying without you."),
    reminder: t("Rappel envoyé trois jours avant chaque prélèvement.", "Reminder sent three days before each charge."),
    number: t("09 70 00 00 00", "09 70 00 00 00"),
    call: t(
      "Pour résilier, appelez le {number} du lundi au vendredi, de 9 h à 12 h. Temps d'attente moyen : 23 min.",
      "To cancel, call {number} Monday to Friday, 9 am to noon. Average wait: 23 min.",
    ),
    pauseButton: t("Mettre en pause 3 mois", "Pause for 3 months"),
    cancelLink: t("ou résilier", "or cancel"),
    cancelLinkBuried: t("demander la résiliation", "request cancellation"),
    cancelButton: t("Résilier mon abonnement", "Cancel my subscription"),
    pauseOffer: t(
      "Envie d'une pause plutôt ? 3 mois sans prélèvement, vos réglages gardés.",
      "Fancy a break instead? 3 months with no charge, your settings kept.",
    ),
    pauseAccept: t("Mettre en pause", "Pause"),
    pauseDecline: t("Non, résilier", "No, cancel"),
    cascadeOffers: [
      t("Attendez ! 3 mois à −50 %", "Wait! 3 months at −50%"),
      t("Vous perdrez vos 214 films sauvegardés", "You'll lose your 214 saved films"),
      t("Dernière chance : 1 mois offert", "Last chance: 1 month free"),
    ],
    stay: t("Je reste", "I'll stay"),
    decline: t("Non merci", "No thanks"),
    declineShamed: t("Non merci, je préfère m'ennuyer", "No thanks, I'd rather be bored"),
    confirm: t("Vous êtes sûr ?", "Are you sure?"),
    survey: t("Pourquoi partez-vous ? Facultatif.", "Why are you leaving? Optional."),
    surveyAnswers: [t("Trop cher", "Too expensive"), t("Rien à regarder", "Nothing to watch"), t("Autre", "Other")],
    notice: t(
      "Votre résiliation prendra effet dans 30 jours. Un dernier prélèvement de 12,99 € sera effectué.",
      "Your cancellation will take effect in 30 days. One last charge of €12.99 will be made.",
    ),
    threeClicks: t(
      "Résiliation effective aujourd'hui. Aucun prélèvement le 3. Accès conservé jusqu'à la fin du mois.",
      "Cancellation effective today. No charge on the 3rd. Access kept until the end of the month.",
    ),
  },

  clicks: {
    count: t("{n} clics pour résilier", "{n} clicks to cancel"),
    infinite: t("∞ clics pour résilier", "∞ clicks to cancel"),
    lawSuffix: t("la loi attend un parcours direct", "the law expects a direct path"),
    phoneSuffix: t("il faut téléphoner", "you have to call"),
  },

  report: {
    churn: t("Résiliations", "Churn"),
    target: t("objectif {target}", "target {target}"),
    subs: t("Abonnés", "Subscribers"),
    mrr: t("Revenu", "Revenue"),
    patience: t("Patience du DG", "CEO's patience"),
    // TODO: à relire — nouveau (plan §2.6, QuarterReport : le statut dit en mots).
    statusHit: t("objectif atteint", "target hit"),
    // TODO: à relire — nouveau (plan §2.6).
    statusMissed: t("manqué de {gap} pt", "missed by {gap} pt"),
    // TODO: à relire — nouveau (plan §2.6).
    effectsHeading: t("Ce que tes actions ont fait", "What your actions did"),
    effectLine: t("{card} : {effect}", "{card}: {effect}"),
    // TODO: à relire — nouveau (plan §2.6, DgMail).
    mailHeader: t("De : DG · Objet : les chiffres de la semaine", "From: CEO · Subject: this week's numbers"),
    bossLine: t("Le DG : {line}", "The CEO: {line}"),
    // TODO: à relire — nouveau (plan §1.3, le rapport comme moment).
    next: t("Le DG t'appelle →", "The CEO is calling you →"),
    // TODO: à relire — nouveau (plan §1.3).
    toDecember: t("Voir le bilan de l'année →", "See the year's review →"),
  },

  effects: {
    insight: t("des réponses de sortie, et des chiffres à montrer au DG", "exit answers, and numbers to show the CEO"),
    presentInsight: t("le DG t'a donné du temps", "the CEO gave you time"),
    presentBlind: t("sans données, le DG a hoché la tête poliment", "with no data, the CEO nodded politely"),
    clean: t("astuces retirées, les résiliations remontent un peu", "tricks removed, churn creeps back up a little"),
    extra: t("un mois de plus facturé à chaque partant", "one more month billed to everyone who leaves"),
    down: t("−{pct} % de résiliations ce trimestre", "−{pct}% churn this quarter"),
    downRising: t(
      "−{pct} % de résiliations ce trimestre, l'effet monte encore",
      "−{pct}% churn this quarter, and the effect is still growing",
    ),
    up: t("+{pct} % de résiliations ce trimestre, moins de litiges", "+{pct}% churn this quarter, fewer disputes"),
    none: t("rien de visible ce trimestre", "nothing visible this quarter"),
  },

  events: {
    midMailMoving: t(
      "Message du DG, à mi-trimestre : « Ça bouge. Continue. »",
      'Message from the CEO, mid-quarter: "It\'s moving. Keep going."',
    ),
    midMailStalled: t(
      "Message du DG, à mi-trimestre : « Je vois les chiffres de la semaine. Ça ne bouge pas assez. »",
      'Message from the CEO, mid-quarter: "I can see this week\'s numbers. It isn\'t moving enough."',
    ),
    presentInsight: t(
      "Ta présentation au DG a tenu : des données, une courbe, une demande de temps. Il t'en donne.",
      "Your presentation to the CEO held up: data, a curve, a request for time. He gives you some.",
    ),
    presentBlind: t(
      "Ta présentation au DG : sans données, il a hoché la tête poliment.",
      "Your presentation to the CEO: with no data, he nodded politely.",
    ),
    control: t(
      "Contrôle de la DGCCRF, article dans la presse, amende de {fine}. Le DG te demande de tout retirer avant vendredi. {leavers} abonnés partent dans la foulée, en le racontant.",
      "An inspection by the DGCCRF, France's consumer protection authority, an article in the press, a fine of {fine}. The CEO asks you to take everything down by Friday. {leavers} subscribers leave on the spot, and tell everyone why.",
    ),
    reports: t(
      "Des dizaines de signalements sur SignalConso. Un journaliste pose des questions au service presse.",
      "Dozens of complaints on SignalConso, the French government's consumer reporting site. A journalist is asking the press office questions.",
    ),
    viral: t(
      "Un fil viral : « J'ai essayé de résilier Flixo, voici mes trois heures. » Les départs s'accélèrent.",
      'A viral thread: "I tried to cancel Flixo, here are my three hours." Cancellations speed up.',
    ),
    press: t(
      "Un article : « Flixo, l'appli qui laisse partir ses abonnés, et qui les voit revenir. » Les inscriptions montent.",
      'An article: "Flixo, the app that lets its subscribers leave, and sees them come back." Sign-ups climb.',
    ),
    competitor: t(
      "Un concurrent a lancé une offre agressive au printemps. Tout le monde a perdu des abonnés ce trimestre, toi compris.",
      "A competitor launched an aggressive offer in the spring. Everyone lost subscribers this quarter, you included.",
    ),
  },

  // TODO: à relire — nouveau (plan §2.6, EventClipping) : tout le bloc. Médias fictifs (brief §8.3) ;
  // SignalConso est la plateforme publique déjà nommée par l'événement lui-même.
  clippings: {
    control: {
      masthead: t("Le Courrier de l'éco", "The Business Courier"),
      headline: t("Flixo épinglé par la répression des fraudes", "Flixo caught out by the French consumer watchdog"),
    },
    reports: {
      masthead: t("SignalConso", "SignalConso"),
      headline: t("Les signalements contre Flixo s'accumulent", "Complaints against Flixo pile up"),
    },
    viral: { handle: t("@soiree_sans_fin", "@endless_evening") },
    press: {
      masthead: t("L'Écho des écrans", "The Screen Echo"),
      headline: t("Flixo, l'appli qui laisse partir", "Flixo, the app that lets you leave"),
    },
    competitor: {
      masthead: t("La Lettre du streaming", "The Streaming Letter"),
      headline: t("Offensive tarifaire au printemps", "A price offensive in the spring"),
    },
  },

  bossLines: {
    hit: t("« Bien joué. »", '"Well played."'),
    cover: t("« Je ne sais pas combien de temps je peux te couvrir. »", '"I don\'t know how much longer I can cover for you."'),
    missed: t("« Ce n'est pas ce qu'on avait dit. »", '"That\'s not what we agreed."'),
    obeyed: t("« Merci d'avoir fait ce que j'ai demandé. »", '"Thanks for doing what I asked."'),
    refused: t("« Tu n'as pas fait ce que j'ai demandé. Je l'ai noté. »", '"You didn\'t do what I asked. I\'ve made a note of it."'),
  },

  endings: {
    applause: {
      win: true,
      eyebrow: t("Décembre · applaudissements", "December · applause"),
      title: t("Tu as tenu. Et ça a marché.", "You held out. And it worked."),
      text: t(
        "Résiliations à {churn}, {subs} abonnés, une confiance à {trust} que personne ne mesurait, et pas un seul abonné n'a eu à appeler un numéro le lundi matin. Le DG t'a pressé trois fois. Tu as répondu avec des chiffres. C'est exactement le métier.",
        "Churn at {churn}, {subs} subscribers, trust at {trust} that nobody was measuring, and not one subscriber had to call a number on a Monday morning. The CEO pushed you three times. You answered with numbers. That is exactly the job.",
      ),
    },
    cleanMiss: {
      win: true,
      eyebrow: t("Décembre · droit dans tes bottes", "December · standing your ground"),
      title: t("Pas encore 4 %. Mais tout est propre.", "Not 4% yet. But everything is clean."),
      text: t(
        "Résiliations à {churn}, confiance à {trust}. La courbe descend encore, parce que les effets lents ne s'arrêtent pas en décembre. Le board voulait un chiffre, tu as construit une pente. Regarde la confiance : c'est elle qui fera le 4 % au printemps.",
        "Churn at {churn}, trust at {trust}. The curve is still going down, because slow effects don't stop in December. The board wanted a number; you built a slope. Look at trust: that's what will deliver the 4% in the spring.",
      ),
    },
    firedClean: {
      win: false,
      eyebrow: t("Licencié · mais propre", "Fired · but clean"),
      title: t("Viré. Sans une seule astuce.", "Fired. Without a single trick."),
      text: t(
        "La patience du DG est tombée à {patience} avant que tes effets lents n'arrivent. Tu es parti avec ton test A/B sous le bras et une confiance à {trust}. L'année suivante, ton remplaçant a fait ce que tu refusais. L'amende est arrivée en septembre. Le jeu ne récompense pas toujours ceux qui ont raison trop tôt. La vraie vie non plus. Rejoue, et présente tes données plus tôt.",
        "The CEO's patience fell to {patience} before your slow effects could arrive. You left with your A/B test under your arm and trust at {trust}. The next year, your replacement did what you had refused to do. The fine arrived in September. The game doesn't always reward people who are right too early. Neither does real life. Play again, and show your data sooner.",
      ),
    },
    firedDark: {
      win: false,
      eyebrow: t("Licencié", "Fired"),
      title: t("Viré, et pour rien.", "Fired, and for nothing."),
      text: t(
        "Tu as pris des astuces, et la patience du DG est quand même tombée à {patience}. Confiance à {trust}, radar à {radar}. Le labyrinthe ne t'a même pas sauvé ton poste : ce que le DG voulait, c'était le chiffre, tout de suite, et il ne se souvient pas de ce qu'il a demandé.",
        "You used tricks, and the CEO's patience still fell to {patience}. Trust at {trust}, radar at {radar}. The maze didn't even save your job: what the CEO wanted was the number, right now, and he doesn't remember what he asked for.",
      ),
    },
    fine: {
      win: false,
      eyebrow: t("Décembre · la révélation", "December · the reveal"),
      title: t("Voici ce que tu as fait.", "Here is what you did."),
      text: t(
        "Le radar est monté jusqu'au contrôle, l'amende est tombée, la presse a écrit. Résiliations à {churn}, confiance à {trust}. Les abonnés retenus de force au printemps sont partis à l'automne, en le racontant. Ce que tu as mis en production a des noms. Ils sont en dessous.",
        "The radar climbed all the way to an inspection, the fine landed, the press wrote about it. Churn at {churn}, trust at {trust}. The subscribers held back by force in the spring left in the autumn, and told everyone why. What you put into production has names. They are below.",
      ),
    },
    labyrinth: {
      win: false,
      eyebrow: t("Décembre · la révélation", "December · the reveal"),
      title: t("Le labyrinthe tient. Regarde ce qu'il coûte.", "The maze holds. Look at what it costs."),
      text: t(
        "Pas de contrôle cette année. Résiliations à {churn}, et une confiance à {trust} que ton dashboard ne t'a jamais montrée. Les gens que tu retiens ne reviennent pas, ne recommandent pas, et attendent le jour où ils sauront à qui écrire. Le radar est à {radar}. Il ne redescend pas tout seul.",
        "No inspection this year. Churn at {churn}, and trust at {trust} that your dashboard never showed you. The people you hold back don't come back, don't recommend you, and wait for the day they find out who to write to. The radar is at {radar}. It doesn't come down on its own.",
      ),
    },
    repentant: {
      win: false,
      eyebrow: t("Décembre · le repenti", "December · the repentant"),
      title: t("Tu as essayé, puis tu as nettoyé.", "You tried, then you cleaned up."),
      text: t(
        "Tu as mis des astuces en production, puis tu les as retirées. Résiliations à {churn}, confiance à {trust}, radar à {radar}. La confiance remonte plus lentement qu'elle ne tombe. C'est la seule règle du jeu qui est aussi celle de la vraie vie.",
        "You put tricks into production, then took them out. Churn at {churn}, trust at {trust}, radar at {radar}. Trust climbs back more slowly than it falls. It's the one rule of the game that is also a rule of real life.",
      ),
    },
  },

  december: {
    cells: {
      churn: t("Résiliations en décembre", "Churn in December"),
      trust: t("Confiance des abonnés", "Subscriber trust"),
      radar: t("Radar DGCCRF", "Regulator radar"),
      outOf: t("{value} / 100", "{value} / 100"),
    },
    // TODO: à relire — nouveau (plan §2.7 : la mention sous les cellules, pas seulement en pied de page).
    gameNumbers: t(
      "Chiffres du jeu : un modèle simple écrit dans le code, pas une étude.",
      "Game numbers: a simple model written in code, not a study.",
    ),
    churnChart: {
      title: t("Résiliations par mois", "Churn per month"),
      caption: t("La ligne pointillée est l'objectif de décembre.", "The dotted line is the December target."),
      label: t("Résiliations mensuelles sur l'année", "Monthly churn over the year"),
      // TODO: à relire — nouveau (plan §2.6, repère étiqueté sur la courbe).
      reference: t("objectif {target}", "target {target}"),
    },
    trustChart: {
      title: t(
        "Confiance des abonnés, le compteur que personne n'affichait",
        "Subscriber trust, the counter nobody displayed",
      ),
      // TODO: à relire — R6 corrigé : le prototype disait « Sous 40 » alors que le fil viral se déclenche à 35 ou moins (brief §5.8, point 6).
      caption: t(
        "De 0 à 100. À 35 ou moins, les gens partent en le racontant.",
        "From 0 to 100. At 35 or below, people leave and tell everyone why.",
      ),
      label: t("Confiance des abonnés sur l'année", "Subscriber trust over the year"),
      // TODO: à relire — nouveau (plan §2.6 : le repère à 35, nommé par ce qui s'y déclenche).
      reference: t("fil viral", "viral thread"),
    },
    // TODO: à relire — nouveau (plan §3.6, ChartFrame → DataTable) : le bouton et les en-têtes du tableau.
    dataToggle: t("Voir les données", "See the data"),
    table: {
      month: t("Mois", "Month"),
      churn: t("Résiliations", "Churn"),
      trust: t("Confiance", "Trust"),
    },
  },

  playbook: {
    eyebrow: t("Ce que tu as fait de propre", "What you did clean"),
    titleWin: t("Le playbook qui a marché", "The playbook that worked"),
    titleLose: t("Ce qui aurait pu suffire, avec du temps", "What could have been enough, given time"),
    refused: t("Ordres du DG refusés : {refused} sur {total}.", "CEO orders refused: {refused} out of {total}."),
    trust: t("confiance {trust}", "trust {trust}"),
    radar: t("radar {radar}", "radar {radar}"),
    closing: t(
      "Dans le jeu, chaque action honnête rapporte moins ce trimestre et davantage sur l'année, parce qu'elle fait monter un compteur que le dashboard n'affiche pas. Dans la vraie vie, c'est exactement le genre de chose qui se teste.",
      "In the game, every honest action pays less this quarter and more over the year, because it raises a counter the dashboard doesn't show. In real life, that's exactly the kind of thing you test.",
    ),
  },

  catalogue: {
    eyebrow: t("Le catalogue complet", "The full catalogue"),
    title: t("Les huit astuces de ce niveau, avec leurs vrais noms", "The eight tricks in this level, with their real names"),
    lead: t(
      "Celles que tu as utilisées, celles que tu as refusées, et celles qui ne te sont jamais passées sous la main. En réunion, elles portent des noms tranquilles. Voici les vrais, et ce que dit la loi.",
      "The ones you used, the ones you turned down, and the ones that never came your way. In meetings, they go by quiet names. Here are the real ones, and what the law says.",
    ),
    groupUsed: t("Celles que tu as utilisées", "The ones you used"),
    groupRefused: t("Celles que tu as refusées", "The ones you turned down"),
    groupUnseen: t("Celles qui ne te sont jamais passées sous la main", "The ones that never came your way"),
    statusActive: t("en production", "in production"),
    statusRemoved: t("retirée", "removed"),
    hiddenEffectLabel: t("Effet caché", "Hidden effect"),
    // TODO: à relire — R7 corrigé : l'effet s'applique une fois, au choix, pas « par trimestre où elle entre » (brief §5.8, dernier paragraphe) ; les signes viennent du formateur (U+2212).
    hiddenEffect: t(
      "Confiance {trust}, radar {radar}, une seule fois, le jour où elle entre en production. Les résiliations évitées s'érodent de 30 % après trois mois.",
      "Trust {trust}, radar {radar}, once, on the day it goes into production. The cancellations it prevents erode by 30% after three months.",
    ),
    lawLabel: t("Ce que dit la loi", "What the law says"),
    caseLabel: t("Un cas réel", "A real case"),
    tellLabel: t("Le repère", "How to spot it"),
  },

  share: {
    replay: t("Rejouer l'année", "Replay the year"),
    copy: t("Copier un lien avec ton résultat", "Copy a link with your result"),
    copied: t("Copié.", "Copied."),
    text: t(
      "Une année chez Flixo : {title} Résiliations à {churn}, confiance à {trust}. Et toi, tu tiendrais ? {url}",
      "A year at Flixo: {title} Churn at {churn}, trust at {trust}. Would you hold out? {url}",
    ),
  },

  nextLevel: {
    eyebrow: t("Niveau suivant", "Next level"),
    title: t(
      "« Comment les gens vous trouvent » : le compte à rebours, le prix qui gonfle, le faux stock",
      '"How people find you": the countdown timer, the creeping price, the fake stock',
    ),
    // TODO: à relire — R15 : « verrouillé · prototype » devient un simple « bientôt ».
    status: t("bientôt", "coming soon"),
  },

  // TODO: à relire — nouveau (brief §13.3 D, la boucle vers le Tour) ; le bouton reprend le CTA de la landing.
  tourLoop: {
    question: t("Où en est ta croissance ?", "Where does your growth stand?"),
    cta: t("Démarre ton Tour →", "Start your Tour →"),
  },

  // TODO: à relire — nouveau (brief §9.5 pour les trois premières, plan §2.6 ResumePrompt pour le reste) : tout le bloc.
  resume: {
    title: t("Reprendre l'année en cours ?", "Pick up the year where you left it?"),
    resume: t("Reprendre", "Resume"),
    restart: t("Recommencer", "Start over"),
    previously: t("Précédemment chez Flixo", "Previously at Flixo"),
    quarterLine: t("Trimestre {q} : {cards}. Résiliations à {churn}.", "Quarter {q}: {cards}. Churn at {churn}."),
    finished: t(
      "Ta dernière année chez Flixo s'est terminée ainsi : « {title} »",
      'Your last year at Flixo ended like this: "{title}"',
    ),
    review: t("Revoir le bilan", "See the review again"),
  },

  // TODO: à relire — R15 : le prototype disait « Prototype pour tester l'idée » et « écrit dans la page ».
  footer: {
    note: t(
      "Ce sont des chiffres du jeu : un modèle simple écrit dans le code, pas une étude. Les lois et les cas cités dans le catalogue sont publics.",
      "These are game numbers: a simple model written in code, not a study. The laws and cases cited in the catalogue are public.",
    ),
    codeLink: t("Lire le code du modèle", "Read the model's code"),
  },

  // TODO: à relire — nouveau (plan §3.5 : une région vivante unique, une annonce par événement) : tout le bloc.
  a11y: {
    handLabel: t("Tes actions du trimestre", "Your actions this quarter"),
    quarterEnd: t(
      "Fin du trimestre {q} : résiliations {churn}, objectif {target} {status}, patience {patience}.",
      "End of quarter {q}: churn {churn}, target {target} {status}, patience {patience}.",
    ),
    resumed: t("Année reprise au trimestre {q}.", "Year resumed at quarter {q}."),
  },
};
