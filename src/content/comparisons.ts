import type { GlossaryTermId } from "./glossary-terms";
import type { Translatable } from "@/lib/i18n/translatable";
import { COMPARISON_TITLES, type ComparisonSlug } from "./comparison-index";

/**
 * comparisons.ts — le cluster « frameworks comparés » du plan de
 * distribution (`GROWTH-PLAN.md` vague 2.3).
 *
 * **TODO: à relire.** Premier jet de la session de code, comme les pages
 * longues du glossaire et les deux pages « porte ouverte » avant leur
 * validation. Ce sont des pages de fond qui portent le nom d'Antoine ; à
 * passer au prochain bon à tirer.
 *
 * **Pourquoi ces cinq-là.** Le concurrent le mieux placé sur « AARRR » en
 * anglais se classe précisément avec des pages « X vs Y » : la requête
 * comparative est le seul angle de ce sujet qui ne soit pas déjà saturé par
 * des définitions. Les cinq choisis sont les cinq cadres avec lesquels
 * AARRR est réellement confondu, et chacun l'est pour une raison
 * différente — c'est ce qui les empêche d'être quatre variantes du même
 * texte :
 *
 * - **North Star** : deux couches distinctes (une carte et une boussole) ;
 * - **RARRA** : les mêmes cinq étapes, dans un autre ordre ;
 * - **growth loops** : la même chose, dessinée en cercle plutôt qu'en ligne ;
 * - **OKR** : un modèle de mesure contre un rituel de décision ;
 * - **HEART** : la même lettre (Retention) pour deux questions — l'entreprise
 *   d'un côté, l'expérience d'une fonctionnalité de l'autre (audit SEO v1 §3.1,
 *   ajoutée le 2026-09-24).
 *
 * **Chaque page finit sur « mesure la tienne »**, ce qui est la seule chose
 * qu'un site adossé à un outil qui marche peut dire de plus qu'un article.
 *
 * **Aucun chiffre inventé.** Les seuls nombres cités sont des exemples de
 * calcul explicitement présentés comme tels, ou de l'arithmétique
 * vérifiable (la composition des taux d'un entonnoir). Les cadres sont
 * attribués à leurs auteurs quand c'est de notoriété publique, sans date
 * ni citation qu'on ne pourrait pas défendre.
 *
 * **Les slugs restent anglais dans les deux langues** (R2-16), et ils
 * portent la requête telle qu'elle se tape.
 */

// Slugs, ordre et titres vivent dans `comparison-index.ts`, que les pages qui
// ne font que LISTER le cluster importent sans tirer toute la prose d'ici.
export { COMPARISON_ORDER, type ComparisonSlug } from "./comparison-index";

/** Une ligne du tableau côte à côte. Quatre par page : au-delà, on relit une liste, plus une comparaison. */
export interface ComparisonRow {
  aspect: Translatable;
  aarrr: Translatable;
  other: Translatable;
}

export interface ComparisonSection {
  heading: Translatable;
  body: Translatable[];
}

export interface Comparison {
  /** Le nom de l'autre cadre — en-tête de colonne, et libellé des liens croisés. */
  other: Translatable;
  title: Translatable;
  metaTitle: Translatable;
  metaDescription: Translatable;
  /** La réponse en deux phrases, avant le tableau : la plupart des lecteurs ne liront que ça. */
  intro: Translatable;
  rows: ComparisonRow[];
  sections: ComparisonSection[];
  /** « Lequel utiliser, et quand » — la page doit trancher, pas renvoyer dos à dos. */
  verdict: Translatable;
  /** Les termes de glossaire vers lesquels cette page envoie (maillage, GROWTH-PLAN.md 2.4). */
  glossary: GlossaryTermId[];
}

const NORTH_STAR: Comparison = {
  other: { en: "North Star metric", fr: "North Star metric" },
  title: COMPARISON_TITLES["aarrr-vs-north-star-metric"],
  // TODO: à relire — audit SEO v1 (2026-09-24), §1.3 : 62 et 68 caractères, coupés dans un résultat de recherche.
  metaTitle: {
    en: "AARRR vs North Star metric — a map and a compass",
    fr: "AARRR ou North Star metric — une carte et une boussole",
  },
  metaDescription: {
    en: "AARRR is a five-stage map; a North Star is one number the company steers by. They sit at different layers, and each one's failure mode is the other one's job.",
    fr: "AARRR est une carte en cinq étapes ; la North Star, le chiffre unique que l'entreprise suit. Deux couches, et le défaut de l'une est le travail de l'autre.",
  },
  intro: {
    en: "These two are not alternatives, and treating them as one is the most common mistake on this topic. AARRR is a map of five stages a customer passes through; a North Star metric is a single number the whole company steers by. A map tells you where the problem is. A compass tells you whether you are heading the right way. You need both, and the order you adopt them in matters.",
    fr: "Ces deux-là ne sont pas des alternatives, et les traiter comme telles est l'erreur la plus courante sur ce sujet. AARRR est une carte des cinq étapes que traverse un client ; la North Star metric est le chiffre unique que toute l'entreprise suit. Une carte dit où est le problème. Une boussole dit si on va dans la bonne direction. Il faut les deux, et l'ordre dans lequel on les adopte n'est pas indifférent.",
  },
  rows: [
    {
      aspect: { en: "What it is", fr: "Ce que c'est" },
      aarrr: { en: "A five-stage map of the customer journey", fr: "Une carte en cinq étapes du parcours client" },
      other: { en: "One number the whole company steers by", fr: "Un chiffre unique que toute l'entreprise suit" },
    },
    {
      aspect: { en: "What it answers", fr: "Ce à quoi ça répond" },
      aarrr: { en: "Where is the problem?", fr: "Où est le problème ?" },
      other: { en: "Are we winning?", fr: "Est-ce qu'on gagne ?" },
    },
    {
      aspect: { en: "How many numbers", fr: "Combien de chiffres" },
      aarrr: { en: "Five stage scores, plus the inputs behind each", fr: "Cinq scores d'étape, plus les entrées derrière chacun" },
      other: { en: "One, decomposed into two or three factors", fr: "Un seul, décomposé en deux ou trois facteurs" },
    },
    {
      aspect: { en: "What it cannot do", fr: "Ce que ça ne peut pas faire" },
      aarrr: { en: "Rank the five stages for you", fr: "Classer les cinq étapes à ta place" },
      other: { en: "Tell you which lever moves it", fr: "Dire quel levier le fait bouger" },
    },
  ],
  sections: [
    {
      heading: { en: "They sit at different layers", fr: "Elles ne sont pas à la même couche" },
      body: [
        {
          en: "AARRR describes the path a customer takes: found you, got set up, came back, told someone, paid. A North Star describes the value they got out of it. A well-chosen North Star almost always lives inside one of the five stages, and rarely inside Acquisition — nights booked, teams past two thousand messages, hours spent listening are all measures of what happened after someone arrived, not of how many arrived.",
          fr: "AARRR décrit le chemin que prend un client : il t'a trouvé, il s'est installé, il est revenu, il en a parlé, il a payé. La North Star décrit la valeur qu'il en a tirée. Une bonne North Star se loge presque toujours dans une des cinq étapes, et rarement dans l'Acquisition — des nuits réservées, des équipes ayant dépassé deux mille messages, des heures d'écoute mesurent toutes ce qui s'est passé après l'arrivée de quelqu'un, pas le nombre d'arrivées.",
        },
        {
          en: "Which stage it lands in tells you what kind of business you are. A North Star in Activation says your risk is that people never get started. One in Retention says your risk is that they leave. One in Revenue says the product works and the model is the open question. That reading is free, and it is the first thing a five-stage map buys you once you have picked the number.",
          fr: "L'étape dans laquelle elle atterrit dit quel genre d'entreprise tu es. Une North Star dans l'Activation dit que ton risque est que les gens ne démarrent jamais. Dans la Retention, que ton risque est qu'ils partent. Dans le Revenue, que le produit marche et que la question ouverte est le modèle. Cette lecture ne coûte rien, et c'est la première chose qu'une carte en cinq étapes t'apporte une fois le chiffre choisi.",
        },
      ],
    },
    {
      heading: { en: "What each one does badly on its own", fr: "Ce que chacune fait mal toute seule" },
      body: [
        {
          en: "AARRR without a North Star gives you five dashboards and no priority. Every stage looks like it deserves attention, because every stage always has something wrong with it, and the team ends up doing a little of all five. The map is complete and the compass is missing.",
          fr: "AARRR sans North Star donne cinq tableaux de bord et aucune priorité. Chaque étape a l'air de mériter du travail, parce qu'il y a toujours quelque chose à réparer dans chaque étape, et l'équipe finit par faire un peu des cinq. La carte est complète, la boussole manque.",
        },
        {
          en: "A North Star without a map gives you a number that goes up while the thing underneath it rots. The textbook version is weekly active users climbing on the back of paid acquisition while each new cohort's retention curve settles lower than the last. The tell is simple and worth checking on your own team: ask who can name the input that moved the number last month. If nobody can, the number is a scoreboard, not a compass.",
          fr: "Une North Star sans carte donne un chiffre qui monte pendant que ce qu'il y a dessous pourrit. La version d'école est le nombre d'actifs hebdomadaires qui grimpe grâce à de l'acquisition payante pendant que la courbe de rétention de chaque nouvelle cohorte se stabilise plus bas que la précédente. Le test est simple et vaut d'être fait chez toi : demande qui sait nommer l'entrée qui a fait bouger le chiffre le mois dernier. Si personne ne peut, le chiffre est un tableau d'affichage, pas une boussole.",
        },
      ],
    },
    {
      heading: { en: "Using them together", fr: "Les utiliser ensemble" },
      body: [
        {
          en: "Map first, then compass. You cannot pick a North Star before you know which stage carries your value, and the fastest way to find out is to score all five and look at which one is holding the others back. A number picked before that is a number picked from the room's opinion.",
          fr: "La carte d'abord, la boussole ensuite. On ne peut pas choisir une North Star avant de savoir quelle étape porte la valeur, et le plus rapide pour le découvrir est de noter les cinq et de regarder laquelle retient les autres. Un chiffre choisi avant ça est un chiffre choisi à l'opinion de la réunion.",
        },
        {
          en: "Then the two lock together. A North Star decomposes into breadth, frequency and depth — how many people, how often, how much each time — and each of those three factors is driven by a different stage. Breadth is Acquisition and Activation. Frequency is Retention. Depth is Revenue. Once you can name which factor is flat, you know which stage the next quarter belongs to, without a meeting.",
          fr: "Ensuite les deux s'emboîtent. Une North Star se décompose en étendue, fréquence et profondeur — combien de personnes, à quelle fréquence, combien à chaque fois — et chacun de ces trois facteurs est porté par une étape différente. L'étendue, c'est l'Acquisition et l'Activation. La fréquence, c'est la Retention. La profondeur, c'est le Revenue. Dès que tu sais nommer le facteur qui stagne, tu sais à quelle étape appartient le trimestre suivant, sans réunion.",
        },
      ],
    },
  ],
  verdict: {
    en: "Use both, in that order. If you have neither, start with the map: it is the cheaper of the two to get wrong, and it is what tells you where a defensible North Star can even live. If you have a North Star and no map, the useful next hour is not another debate about the number — it is finding out which of the five stages is quietly capping it.",
    fr: "Prends les deux, dans cet ordre. Si tu n'as ni l'une ni l'autre, commence par la carte : c'est la moins coûteuse à se tromper, et c'est elle qui dit où une North Star défendable peut se loger. Si tu as une North Star et pas de carte, l'heure utile n'est pas un débat de plus sur le chiffre — c'est de découvrir laquelle des cinq étapes le plafonne en silence.",
  },
  glossary: ["north-star-metric", "aarrr", "activation", "retention"],
};

const RARRA: Comparison = {
  other: { en: "RARRA", fr: "RARRA" },
  title: COMPARISON_TITLES["aarrr-vs-rarra"],
  metaTitle: {
    en: "AARRR vs RARRA — the same five stages, a different order",
    fr: "AARRR ou RARRA — les mêmes cinq étapes, dans un autre ordre",
  },
  metaDescription: {
    en: "RARRA puts retention first. Not a different model — the same five stages reordered. The argument is about where to start, and your own numbers settle it.",
    fr: "RARRA met la rétention en premier. Pas un autre modèle : les mêmes cinq étapes réordonnées. Le débat porte sur par où commencer, et tes chiffres le tranchent.",
  },
  intro: {
    en: "Same five stages, different order, and the order is the entire argument. AARRR lists them in the order a customer moves through them. RARRA lists them in the order a team should fix them, putting Retention first on the grounds that pouring acquisition into a product nobody keeps is filling a bucket with a hole in it. Nobody added or removed a stage — so the disagreement is about sequencing, and sequencing is an empirical question.",
    fr: "Les mêmes cinq étapes, dans un autre ordre, et l'ordre est tout le débat. AARRR les liste dans l'ordre où un client les traverse. RARRA les liste dans l'ordre où une équipe devrait les réparer, en mettant la Retention en tête au motif que verser de l'acquisition dans un produit que personne ne garde revient à remplir un seau percé. Personne n'a ajouté ni retiré d'étape — le désaccord porte donc sur l'ordre, et l'ordre est une question empirique.",
  },
  rows: [
    {
      aspect: { en: "The five stages", fr: "Les cinq étapes" },
      aarrr: {
        en: "Acquisition, Activation, Retention, Referral, Revenue",
        fr: "Acquisition, Activation, Retention, Referral, Revenue",
      },
      other: {
        en: "Retention, Activation, Referral, Revenue, Acquisition",
        fr: "Retention, Activation, Referral, Revenue, Acquisition",
      },
    },
    {
      aspect: { en: "What the order means", fr: "Ce que l'ordre veut dire" },
      aarrr: { en: "The order a customer passes through", fr: "L'ordre dans lequel un client passe" },
      other: { en: "The order a team should work in", fr: "L'ordre dans lequel une équipe devrait travailler" },
    },
    {
      aspect: { en: "Where it comes from", fr: "D'où ça vient" },
      aarrr: {
        en: "Dave McClure's startup metrics talk, as a way to describe a funnel end to end",
        fr: "La présentation de Dave McClure sur les métriques de startup, pour décrire un entonnoir de bout en bout",
      },
      other: {
        en: "A reframing for mobile apps, where installs are bought and most of them never come back",
        fr: "Un recadrage pour les applis mobiles, où les installations s'achètent et où la plupart ne reviennent jamais",
      },
    },
    {
      aspect: { en: "What it assumes", fr: "Ce que ça suppose" },
      aarrr: { en: "That you have users moving through it", fr: "Que des utilisateurs le traversent déjà" },
      other: { en: "That you already have a cohort big enough to measure", fr: "Que tu as déjà une cohorte assez grosse pour être mesurée" },
    },
  ],
  sections: [
    {
      heading: { en: "The argument is with a misreading, not with the model", fr: "Le débat porte sur une mauvaise lecture, pas sur le modèle" },
      body: [
        {
          en: "Every criticism RARRA makes of AARRR is a criticism of how AARRR gets used: as a to-do list read top to bottom, which puts acquisition first by accident of the acronym. The original framing never claimed to be a work order — it described the path, which really does start with someone finding you. Read as a description, AARRR says nothing about where to spend Monday.",
          fr: "Toutes les critiques que RARRA adresse à AARRR visent la façon dont AARRR est utilisé : comme une liste de tâches lue de haut en bas, ce qui met l'acquisition en premier par accident de l'acronyme. Le cadre d'origine n'a jamais prétendu être un ordre de travail — il décrivait le chemin, qui commence effectivement par quelqu'un qui te trouve. Lu comme une description, AARRR ne dit rien de ce qu'il faut faire lundi matin.",
        },
        {
          en: "That is why the two cannot really contradict each other. RARRA is a claim about priority dressed as a claim about structure, and the structure it borrows is the one it is arguing with. Anyone who says they have switched from AARRR to RARRA has changed what they work on first, not what they measure.",
          fr: "C'est pour ça que les deux ne peuvent pas vraiment se contredire. RARRA est une affirmation sur la priorité habillée en affirmation sur la structure, et la structure qu'il emprunte est celle qu'il conteste. Quelqu'un qui dit être passé d'AARRR à RARRA a changé ce sur quoi il travaille en premier, pas ce qu'il mesure.",
        },
      ],
    },
    {
      heading: { en: "When retention-first is right, and when it is not", fr: "Quand commencer par la rétention est juste, et quand ça ne l'est pas" },
      body: [
        {
          en: "The case is strongest where acquisition is expensive and the product is free. An app paying for every install and losing three quarters of them inside a week is buying water for a bucket with a hole in it, and no amount of channel optimisation fixes the hole. In that setting, retention-first is not a doctrine, it is arithmetic.",
          fr: "L'argument est le plus fort quand l'acquisition est chère et le produit gratuit. Une appli qui paie chaque installation et en perd les trois quarts en une semaine achète de l'eau pour un seau percé, et aucune optimisation de canal ne rebouche le trou. Dans ce contexte, commencer par la rétention n'est pas une doctrine, c'est de l'arithmétique.",
        },
        {
          en: "It is weakest at the very beginning, and in anything sold rather than self-served. You cannot measure retention on a cohort of zero, and a product with fifty users has a retention curve made mostly of noise — the earlier honest signal there is activation. And a tool sold on an annual contract produces its first real renewal number a year after you needed it; starting with retention there means starting with a number you will not have for four quarters.",
          fr: "L'argument est le plus faible tout au début, et dans tout ce qui se vend plutôt que de se distribuer en self-serve. On ne mesure pas une rétention sur une cohorte de zéro, et un produit à cinquante utilisateurs a une courbe de rétention faite surtout de bruit — le signal honnête plus tôt, là, c'est l'activation. Et un outil vendu en contrat annuel ne produit son premier vrai chiffre de renouvellement qu'un an après le moment où il aurait servi ; commencer par la rétention y revient à commencer par un chiffre qu'on n'aura pas avant quatre trimestres.",
        },
      ],
    },
    {
      heading: { en: "Let the numbers pick the order", fr: "Laisse les chiffres choisir l'ordre" },
      body: [
        {
          en: "The defensible version of RARRA's point is not \"always start with retention\". It is \"do not start with acquisition by default\". The way to settle which stage actually goes first is to measure all five and start with the weakest — which is neither acronym's order, and is the answer both of them are gesturing at.",
          fr: "La version défendable de l'argument de RARRA n'est pas « commence toujours par la rétention ». C'est « ne commence pas par l'acquisition par défaut ». La façon de trancher quelle étape passe réellement en premier est de mesurer les cinq et de commencer par la plus faible — ce qui n'est l'ordre d'aucun des deux acronymes, et c'est la réponse que tous les deux désignent.",
        },
        {
          en: "It matters because the stages multiply rather than add: ten percent better at four of them is worth about forty-six percent more at the end, not forty. A weak stage does not subtract from the result, it scales everything downstream of it — which is exactly why the order is worth arguing about, and exactly why the argument should be settled with your numbers rather than with someone else's app.",
          fr: "Ça compte parce que les étapes se multiplient au lieu de s'additionner : dix pour cent de mieux sur quatre d'entre elles vaut environ quarante-six pour cent de plus au bout, pas quarante. Une étape faible ne se soustrait pas du résultat, elle met à l'échelle tout ce qui vient après — ce qui est précisément pourquoi l'ordre mérite qu'on en discute, et précisément pourquoi la discussion devrait se trancher sur tes chiffres et pas sur l'appli de quelqu'un d'autre.",
        },
      ],
    },
  ],
  verdict: {
    en: "Use AARRR to describe the journey: everyone knows it, and it is the right chronology. Borrow RARRA's instinct to resist acquisition-first reflexes. Then let your own five scores pick the stage you actually work on, because neither acronym knows whether your activation is at sixty percent or your retention is at thirty.",
    fr: "Utilise AARRR pour décrire le parcours : tout le monde le connaît, et c'est la bonne chronologie. Emprunte à RARRA son réflexe de résistance à l'acquisition d'abord. Puis laisse tes cinq scores choisir l'étape sur laquelle tu travailles vraiment, parce qu'aucun des deux acronymes ne sait si ton activation est à soixante pour cent ou ta rétention à trente.",
  },
  glossary: ["retention", "activation", "aarrr", "cohort-analysis"],
};

const GROWTH_LOOPS: Comparison = {
  other: { en: "Growth loops", fr: "Growth loops" },
  title: COMPARISON_TITLES["aarrr-vs-growth-loops"],
  // TODO: à relire — audit SEO v1 (2026-09-24), §1.3 : 69 et 77 caractères, coupés dans un résultat de recherche.
  metaTitle: {
    en: "AARRR vs growth loops — a funnel is a loop missing an edge",
    fr: "AARRR ou growth loops — un entonnoir est une boucle ouverte",
  },
  metaDescription: {
    en: "A funnel is a line, a loop is a circle. But a loop runs through the same five stages — it refuses to stop at the end. Diagnose with one, plan with the other.",
    fr: "Un entonnoir est une ligne, une boucle un cercle. Mais une boucle traverse les mêmes cinq étapes. Diagnostique avec l'un, planifie avec l'autre.",
  },
  intro: {
    en: "A funnel is a line and a loop is a circle, and the difference is not cosmetic: a funnel treats new users as something you buy, a loop treats them as something the product produces. But you do not choose between them. A growth loop runs through the same five stages AARRR already names — it just draws the edge that AARRR leaves out, the one where Referral feeds Acquisition.",
    fr: "Un entonnoir est une ligne, une boucle est un cercle, et la différence n'est pas cosmétique : un entonnoir traite les nouveaux utilisateurs comme quelque chose qu'on achète, une boucle comme quelque chose que le produit fabrique. Mais on ne choisit pas entre les deux. Une growth loop traverse les mêmes cinq étapes qu'AARRR nomme déjà — elle dessine seulement l'arête qu'AARRR omet, celle où le Referral alimente l'Acquisition.",
  },
  rows: [
    {
      aspect: { en: "Shape", fr: "Forme" },
      aarrr: { en: "Linear: input at the top, customers at the bottom", fr: "Linéaire : l'entrée en haut, les clients en bas" },
      other: { en: "Circular: the output becomes the next input", fr: "Circulaire : la sortie devient l'entrée suivante" },
    },
    {
      aspect: { en: "What it is good at", fr: "Ce que ça fait bien" },
      aarrr: { en: "Diagnosis — where do people drop out?", fr: "Le diagnostic — où les gens décrochent-ils ?" },
      other: { en: "Strategy — what compounds?", fr: "La stratégie — qu'est-ce qui compose ?" },
    },
    {
      aspect: { en: "What it hides", fr: "Ce que ça cache" },
      aarrr: { en: "That the last stage feeds the first one", fr: "Que la dernière étape alimente la première" },
      other: { en: "That every step in the circle has a conversion rate", fr: "Que chaque étape du cercle a un taux de conversion" },
    },
    {
      aspect: { en: "The number it produces", fr: "Le chiffre que ça produit" },
      aarrr: { en: "A rate per stage, and a drop-off between each", fr: "Un taux par étape, et une déperdition entre chacune" },
      other: { en: "A coefficient: how many new users each user brings", fr: "Un coefficient : combien de nouveaux chaque utilisateur amène" },
    },
  ],
  sections: [
    {
      heading: { en: "A loop is a funnel with the last edge drawn in", fr: "Une boucle est un entonnoir dont on a dessiné la dernière arête" },
      body: [
        {
          en: "AARRR already contains the feedback. Referral is the stage where existing users produce new ones, and new users are Acquisition's input — so the circle is there, drawn as a straight line with the ends not joined up. Drawing it straight is the whole complaint, and it is a fair one: a picture that ends at the bottom of the page invites you to think the only way to refill the top is to pay for it.",
          fr: "AARRR contient déjà la rétroaction. Le Referral est l'étape où les utilisateurs existants en produisent de nouveaux, et les nouveaux utilisateurs sont l'entrée de l'Acquisition — le cercle est donc là, dessiné en ligne droite dont on n'a pas joint les bouts. Le dessiner droit est tout le reproche, et il est fondé : une image qui s'arrête en bas de page invite à croire que la seule façon de remplir le haut est de payer.",
        },
        {
          en: "Which is why the two are not rivals. Reforge popularised loops precisely against funnel-shaped thinking, not against funnel-shaped measurement — and the loops people draw are always made of steps that any funnel would recognise. The useful move is not to abandon one for the other; it is to keep measuring the stages and start asking which of them produces its own input.",
          fr: "C'est pour ça que les deux ne sont pas rivaux. Reforge a popularisé les boucles précisément contre une pensée en entonnoir, pas contre une mesure en entonnoir — et les boucles qu'on dessine sont toujours faites d'étapes que n'importe quel entonnoir reconnaîtrait. Le bon geste n'est pas d'abandonner l'un pour l'autre : c'est de continuer à mesurer les étapes et de commencer à demander laquelle produit sa propre entrée.",
        },
      ],
    },
    {
      heading: { en: "What each one gets wrong alone", fr: "Ce que chacun rate tout seul" },
      body: [
        {
          en: "Loop-thinking without funnel measurement names loops that do not close. \"Users invite users\" is a loop on a whiteboard and a coefficient of five hundredths in the data, which is a discount on paid acquisition rather than a growth engine. The whiteboard version is never wrong about the shape — it is wrong about the size, and only the stage rates can tell you which.",
          fr: "Penser en boucles sans mesurer l'entonnoir fait nommer des boucles qui ne se referment pas. « Les utilisateurs invitent des utilisateurs » est une boucle au tableau blanc et un coefficient de cinq centièmes dans les données, ce qui est une remise sur l'acquisition payante et pas un moteur de croissance. La version tableau blanc ne se trompe jamais sur la forme — elle se trompe sur la taille, et seuls les taux d'étape peuvent dire laquelle.",
        },
        {
          en: "Funnel-thinking without loops leaves you with a business where every new customer costs roughly what the last one cost, forever. That is a perfectly viable company. It is also a company whose growth is a line in the budget rather than a property of the product, which is a different thing to own and a much more expensive one to scale.",
          fr: "Penser en entonnoir sans boucle laisse une entreprise où chaque nouveau client coûte à peu près ce qu'a coûté le précédent, indéfiniment. C'est une entreprise parfaitement viable. C'est aussi une entreprise dont la croissance est une ligne au budget plutôt qu'une propriété du produit, ce qui n'est pas la même chose à posséder et coûte beaucoup plus cher à faire grandir.",
        },
      ],
    },
    {
      heading: { en: "How to tell whether your loop closes", fr: "Comment savoir si ta boucle se referme" },
      body: [
        {
          en: "A loop is only worth naming once each of its steps has a number: what share of users take the sharing action, how many people see each share, and what share of those come back through the door. Multiply the three. Above one, the loop grows on its own. Below one — which is where nearly every real loop sits — it dampens, and its honest description is that it lowers your effective acquisition cost rather than replacing it.",
          fr: "Une boucle ne mérite d'être nommée qu'une fois que chacune de ses étapes a un chiffre : quelle part des utilisateurs fait le geste de partage, combien de personnes voient chaque partage, et quelle part de celles-ci franchit la porte. Multiplie les trois. Au-dessus de un, la boucle croît toute seule. En dessous — où se situe presque toute vraie boucle — elle s'amortit, et sa description honnête est qu'elle abaisse ton coût d'acquisition effectif plutôt qu'elle ne le remplace.",
        },
        {
          en: "This site is its own worked example, and it is deliberately small. A result page is shared, the link preview carries a score, someone opens it, and the page offers that reader their own Tour — with the sharer credited on the link. Three steps, three measurable rates, one coefficient at the end. Remove any one of the three and the circle becomes a funnel again, which is the most useful thing loop-thinking teaches.",
          fr: "Ce site est son propre exemple, et il est volontairement petit. Une page de résultat est partagée, l'aperçu du lien porte un score, quelqu'un l'ouvre, et la page propose à ce lecteur son propre Tour — avec le partageur crédité sur le lien. Trois étapes, trois taux mesurables, un coefficient au bout. Retire l'une des trois et le cercle redevient un entonnoir, ce qui est la chose la plus utile que la pensée en boucles enseigne.",
        },
      ],
    },
  ],
  verdict: {
    en: "Measure with the funnel, plan with the loop. Draw the loop you think you have, then go and find the three rates that make it up — if you cannot produce them, what you have is an intention rather than a loop, and the funnel is still the honest picture of your growth.",
    fr: "Mesure avec l'entonnoir, planifie avec la boucle. Dessine la boucle que tu crois avoir, puis va chercher les trois taux qui la composent — si tu ne peux pas les produire, ce que tu as est une intention et pas une boucle, et l'entonnoir reste l'image honnête de ta croissance.",
  },
  glossary: ["growth-loop", "viral-coefficient", "referral", "aarrr"],
};

const OKR: Comparison = {
  other: { en: "OKR", fr: "OKR" },
  title: COMPARISON_TITLES["aarrr-vs-okr"],
  metaTitle: {
    en: "AARRR vs OKR — a measurement model and a decision ritual",
    fr: "AARRR ou OKR — un modèle de mesure et un rituel de décision",
  },
  metaDescription: {
    en: "AARRR tells you what is true; OKR decides what to do about it and who owns it. Each one's classic failure is the other one's job. Here is how to chain them.",
    fr: "AARRR dit ce qui est vrai ; OKR décide quoi en faire et qui le porte. Le défaut classique de chacun est le travail de l'autre. Voici comment les enchaîner.",
  },
  intro: {
    en: "This is the largest category error of the four. AARRR is a measurement model — it tells you what is true about the business. OKR is a goal-setting ritual — it decides what to do about it, who owns it, and by when. They sit at different layers, and each one's classic failure mode is precisely the other one's job.",
    fr: "C'est la plus grosse erreur de catégorie des quatre. AARRR est un modèle de mesure — il dit ce qui est vrai de l'entreprise. OKR est un rituel de fixation d'objectifs — il décide quoi en faire, qui le porte et pour quand. Ils ne sont pas à la même couche, et le défaut classique de chacun est précisément le travail de l'autre.",
  },
  rows: [
    {
      aspect: { en: "What it is", fr: "Ce que c'est" },
      aarrr: { en: "A model for measuring", fr: "Un modèle pour mesurer" },
      other: { en: "A cadence for deciding", fr: "Une cadence pour décider" },
    },
    {
      aspect: { en: "What it produces", fr: "Ce que ça produit" },
      aarrr: { en: "Five stage scores and a weakest stage", fr: "Cinq scores d'étape et une étape la plus faible" },
      other: { en: "An objective, its key results, and an owner", fr: "Un objectif, ses résultats clés, et un responsable" },
    },
    {
      aspect: { en: "How often", fr: "À quelle fréquence" },
      aarrr: { en: "Quarterly is plenty — practices move slowly", fr: "Une fois par trimestre suffit — les pratiques bougent lentement" },
      other: { en: "Set quarterly, reviewed weekly", fr: "Fixés au trimestre, revus chaque semaine" },
    },
    {
      aspect: { en: "Its classic failure", fr: "Son défaut classique" },
      aarrr: { en: "A finding nobody owns", fr: "Un constat que personne ne porte" },
      other: { en: "A key result picked from opinion", fr: "Un résultat clé choisi à l'opinion" },
    },
  ],
  sections: [
    {
      heading: { en: "AARRR is where key results come from", fr: "AARRR est l'endroit d'où viennent les résultats clés" },
      body: [
        {
          en: "An OKR set without a diagnostic picks its key results from whoever argued best in the room. A diagnostic replaces that with the stage that measures worst — and, more importantly, it supplies the baseline, which is the part every planning meeting skips. \"Raise activation to forty-five percent\" is not a key result if nobody wrote down that it sits at thirty-four today: without the starting number, nobody can tell at the end whether the quarter worked or whether the target was always going to be met.",
          fr: "Un OKR fixé sans diagnostic choisit ses résultats clés chez celui qui a le mieux argumenté dans la pièce. Un diagnostic remplace ça par l'étape qui mesure le plus mal — et surtout, il fournit le point de départ, la partie que toute réunion de planification saute. « Monter l'activation à quarante-cinq pour cent » n'est pas un résultat clé si personne n'a noté qu'elle est à trente-quatre aujourd'hui : sans le chiffre de départ, personne ne pourra dire à la fin si le trimestre a marché ou si la cible était acquise d'avance.",
        },
        {
          en: "It also stops the most common OKR defect, the output wearing an outcome's clothes. \"Ship the new onboarding\" is work, and a team can complete it in full while activation does not move. \"Activation from thirty-four to forty-five\" is a result, and it is the only one of the two that can fail in a way that teaches you something. A diagnostic hands you outcomes because it measures states, not deliveries.",
          fr: "Il arrête aussi le défaut d'OKR le plus courant : la production déguisée en résultat. « Livrer le nouvel onboarding » est un travail, et une équipe peut l'achever intégralement sans que l'activation bouge. « L'activation de trente-quatre à quarante-cinq » est un résultat, et c'est le seul des deux qui peut échouer d'une façon qui apprend quelque chose. Un diagnostic donne des résultats parce qu'il mesure des états, pas des livraisons.",
        },
      ],
    },
    {
      heading: { en: "OKR is where a finding gets an owner and a date", fr: "OKR est l'endroit où un constat reçoit un responsable et une date" },
      body: [
        {
          en: "A diagnostic that ends in a deck changes nothing, and that is the failure mode of every audit ever run. Five scores and a weakest stage are a true description of the company that no calendar, no budget and no person is attached to. The ritual is what attaches them, and the ritual is the boring half nobody writes articles about.",
          fr: "Un diagnostic qui finit en présentation ne change rien, et c'est le défaut de tous les audits jamais menés. Cinq scores et une étape la plus faible sont une description vraie de l'entreprise à laquelle aucun calendrier, aucun budget et aucune personne n'est rattaché. Le rituel est ce qui les rattache, et le rituel est la moitié ennuyeuse dont personne n'écrit d'articles.",
        },
        {
          en: "The shape that works is narrow: one objective, which is the weakest stage; two or three key results, which are that stage's own metrics with a baseline and a target; one owner. Five objectives is not an ambitious quarter, it is a list of wishes — and it is what a team writes when it has no diagnostic to tell it which one matters.",
          fr: "La forme qui marche est étroite : un objectif, qui est l'étape la plus faible ; deux ou trois résultats clés, qui sont les métriques propres à cette étape avec un point de départ et une cible ; un responsable. Cinq objectifs n'est pas un trimestre ambitieux, c'est une liste de vœux — et c'est ce qu'une équipe écrit quand aucun diagnostic ne lui dit lequel compte.",
        },
      ],
    },
    {
      heading: { en: "The calendar that connects them", fr: "Le calendrier qui les relie" },
      body: [
        {
          en: "Run the diagnostic in the week before the planning meeting, not after it. Done after, it becomes a justification exercise for objectives already chosen, which is worse than not running it — it lends evidence to a decision that did not use any.",
          fr: "Mène le diagnostic la semaine qui précède la réunion de planification, pas après. Fait après, il devient un exercice de justification d'objectifs déjà choisis, ce qui est pire que de ne pas le mener — il prête des preuves à une décision qui n'en a pas utilisé.",
        },
        {
          en: "Then re-run it a quarter later against the same questions. The delta is the honest measure of whether the objective did anything, and it is a measure the team cannot argue with, because the questions did not change between the two readings. That is also the cheapest thing on this page to put in place: the second run costs the same three minutes as the first.",
          fr: "Puis refais-le un trimestre plus tard avec les mêmes questions. L'écart est la mesure honnête de ce que l'objectif a produit, et c'est une mesure que l'équipe ne peut pas contester, parce que les questions n'ont pas changé entre les deux lectures. C'est aussi la chose la moins chère à mettre en place de toute cette page : la seconde passe coûte les mêmes trois minutes que la première.",
        },
      ],
    },
  ],
  verdict: {
    en: "Not alternatives, and not even in tension. Diagnostic in the week before planning; one objective out of the weakest stage; key results that are that stage's metrics, with the baseline written down; the same questions again next quarter. If you have to drop one of the two, drop neither — drop the four extra objectives.",
    fr: "Ni des alternatives, ni même en tension. Le diagnostic la semaine avant la planification ; un objectif tiré de l'étape la plus faible ; des résultats clés qui sont les métriques de cette étape, avec le point de départ écrit noir sur blanc ; les mêmes questions au trimestre suivant. S'il faut renoncer à l'un des deux, ne renonce à aucun — renonce aux quatre objectifs en trop.",
  },
  glossary: ["north-star-metric", "activation", "aarrr", "retention"],
};

// TODO: à relire — audit SEO v1 (2026-09-24), §3.1 : cinquième page du cluster, premier jet de la session de code (titres, descriptions, tableau, sections et verdict).
const HEART: Comparison = {
  other: { en: "HEART", fr: "HEART" },
  title: COMPARISON_TITLES["aarrr-vs-heart"],
  metaTitle: {
    en: "AARRR vs HEART — a business funnel and a UX scorecard",
    fr: "AARRR ou HEART — un entonnoir et une grille d'expérience",
  },
  metaDescription: {
    en: "AARRR measures where the business funnel leaks; HEART measures whether the experience is good. Both track retention, but not the same way. When to use which.",
    fr: "AARRR mesure où l'entonnoir de l'entreprise fuit ; HEART, si l'expérience est bonne. Les deux suivent la rétention, mais pas de la même façon. Lequel choisir.",
  },
  intro: {
    en: "These two get compared because both are five-letter acronyms with Retention in the middle, and that is about all they share. AARRR asks whether the business grows, stage by stage, from a first visit to a payment. HEART, published by a Google research team, asks whether the experience of using a product is any good — Happiness, Engagement, Adoption, Retention, Task success. Same users, two different questions, and a team usually needs the first answer before the second one is worth asking.",
    fr: "Ces deux-là sont comparés parce que ce sont deux acronymes de cinq lettres avec la Retention au milieu, et c'est à peu près tout ce qu'ils partagent. AARRR demande si l'entreprise grandit, étape par étape, de la première visite au paiement. HEART, publié par une équipe de recherche de Google, demande si l'expérience d'utilisation d'un produit est bonne — Happiness, Engagement, Adoption, Retention, Task success. Les mêmes utilisateurs, deux questions différentes, et une équipe a généralement besoin de la première réponse avant que la seconde vaille la peine d'être posée.",
  },
  rows: [
    {
      aspect: { en: "What it measures", fr: "Ce que ça mesure" },
      aarrr: { en: "Whether the business grows, stage by stage", fr: "Si l'entreprise grandit, étape par étape" },
      other: { en: "Whether the experience is good, for one product or feature", fr: "Si l'expérience est bonne, pour un produit ou une fonctionnalité" },
    },
    {
      aspect: { en: "The unit", fr: "L'unité de mesure" },
      aarrr: { en: "A customer moving through the funnel", fr: "Un client qui traverse l'entonnoir" },
      other: { en: "A user doing a task in the product", fr: "Un utilisateur qui accomplit une tâche dans le produit" },
    },
    {
      aspect: { en: "Where it comes from", fr: "D'où ça vient" },
      aarrr: {
        en: "Dave McClure's startup metrics talk, built for founders and investors",
        fr: "La présentation de Dave McClure sur les métriques de startup, pour les fondateurs et les investisseurs",
      },
      other: {
        en: "A Google research team (Kerry Rodden and colleagues), built for UX teams",
        fr: "Une équipe de recherche de Google (Kerry Rodden et ses collègues), pour les équipes UX",
      },
    },
    {
      aspect: { en: "What it cannot see", fr: "Ce que ça ne voit pas" },
      aarrr: { en: "Why a stage is weak from the user's side", fr: "Pourquoi une étape est faible du point de vue de l'utilisateur" },
      other: { en: "Whether a better experience earns any money", fr: "Si une meilleure expérience rapporte de l'argent" },
    },
  ],
  sections: [
    {
      heading: { en: "Two different questions about the same users", fr: "Deux questions différentes sur les mêmes utilisateurs" },
      body: [
        {
          en: "AARRR is written from the company's side of the table. Each stage is a step in a revenue story — a visitor becomes a user, a user becomes a regular, a regular brings someone else and eventually pays. A stage is weak when that story stalls, whatever the reason. The model does not ask whether people enjoy the product; it asks whether they come back and whether the business can count on it.",
          fr: "AARRR est écrit du côté de l'entreprise. Chaque étape est un moment d'une histoire de revenu — un visiteur devient utilisateur, un utilisateur devient un habitué, un habitué en amène un autre et finit par payer. Une étape est faible quand cette histoire cale, quelle qu'en soit la raison. Le modèle ne se demande pas si les gens aiment le produit ; il se demande s'ils reviennent et si l'entreprise peut compter dessus.",
        },
        {
          en: "HEART is written from the user's side. It was designed to give UX teams something better than page views to argue with, and it comes with a small process, Goals-Signals-Metrics: state what the product should achieve for a user, find the behaviour that would show it, then pick the number. It is usually applied to one product or one feature at a time — a new editor, a checkout flow — rather than to the whole company. That is its strength: it can tell apart two versions of a screen that AARRR would score exactly the same.",
          fr: "HEART est écrit du côté de l'utilisateur. Il a été conçu pour donner aux équipes UX mieux que des pages vues pour argumenter, et il vient avec une petite méthode, Goals-Signals-Metrics : dire ce que le produit doit accomplir pour un utilisateur, trouver le comportement qui le montrerait, puis choisir le chiffre. On l'applique en général à un produit ou à une fonctionnalité à la fois — un nouvel éditeur, un tunnel de paiement — plutôt qu'à toute l'entreprise. C'est sa force : il sait distinguer deux versions d'un écran qu'AARRR noterait exactement pareil.",
        },
      ],
    },
    {
      heading: { en: "Where they overlap: retention, measured two ways", fr: "Là où ils se recouvrent : la rétention, mesurée deux fois" },
      body: [
        {
          en: "Retention is the one letter the two share, and it is the source of most of the confusion. In AARRR it means customers who keep using the product and keep paying for it, read as cohort curves over months. In HEART it usually means users who come back to a specific product or feature, read over days or weeks. A team can have a feature with excellent HEART retention inside a business with poor AARRR retention: the people who use the new report love it, and most accounts still churn before they ever find it.",
          fr: "La Retention est la seule lettre que les deux partagent, et c'est la source de la plupart des confusions. Dans AARRR, elle désigne les clients qui continuent d'utiliser le produit et de le payer, lus en courbes de cohortes sur des mois. Dans HEART, elle désigne le plus souvent les utilisateurs qui reviennent à un produit ou à une fonctionnalité précise, lus sur des jours ou des semaines. Une équipe peut avoir une fonctionnalité à l'excellente rétention HEART dans une entreprise à la rétention AARRR médiocre : ceux qui utilisent le nouveau rapport l'adorent, et la plupart des comptes partent quand même avant de l'avoir trouvé.",
        },
        {
          en: "Adoption and Activation look alike too, and differ in the same way. HEART's Adoption counts new users of a feature; AARRR's Activation asks whether a new customer reached the moment the product becomes worth keeping. The first is a count, the second is a threshold, and a launch can move the count without moving the threshold at all. When the two frameworks disagree on the same word, the disagreement is information: it usually means the feature and the business are not being measured on the same population.",
          fr: "Adoption et Activation se ressemblent aussi, et divergent de la même façon. L'Adoption de HEART compte les nouveaux utilisateurs d'une fonctionnalité ; l'Activation d'AARRR demande si un nouveau client a atteint le moment où le produit vaut d'être gardé. La première est un décompte, la seconde un seuil, et un lancement peut faire bouger le décompte sans toucher au seuil. Quand les deux cadres ne sont pas d'accord sur le même mot, le désaccord est une information : il signifie en général que la fonctionnalité et l'entreprise ne sont pas mesurées sur la même population.",
        },
      ],
    },
    {
      heading: { en: "The funnel picks the stage, HEART inspects it", fr: "L'entonnoir désigne l'étape, HEART l'inspecte" },
      body: [
        {
          en: "Used together, the two nest rather than compete. AARRR works at the level of the business and answers where growth stalls. Once it has named a stage, say Activation, HEART is a good way to look inside it: which task in the first session fails, how long it takes, whether the people who finish it are happier than those who give up. Task success and Happiness in particular have no equivalent in AARRR, and they are exactly what a team needs once it knows which stage to fix.",
          fr: "Utilisés ensemble, les deux s'emboîtent plutôt qu'ils ne s'opposent. AARRR travaille au niveau de l'entreprise et dit où la croissance cale. Une fois qu'il a désigné une étape, disons l'Activation, HEART est un bon moyen de regarder à l'intérieur : quelle tâche de la première session échoue, combien de temps elle prend, si ceux qui la terminent sont plus satisfaits que ceux qui abandonnent. Task success et Happiness, en particulier, n'ont aucun équivalent dans AARRR, et c'est exactement ce dont une équipe a besoin une fois qu'elle sait quelle étape réparer.",
        },
        {
          en: "The reverse order wastes effort. A HEART scorecard for every feature, built before anyone knows which stage of the business is weak, produces a lot of honest measurement about screens that were never the problem. The questionnaire on this site does the first half of the job: it names the stage in three minutes, from fifteen questions about practices rather than about screens. What it cannot do is watch your users — that is the part HEART is built for.",
          fr: "L'ordre inverse gaspille des efforts. Une grille HEART pour chaque fonctionnalité, construite avant que quiconque sache quelle étape de l'entreprise est faible, produit beaucoup de mesures honnêtes sur des écrans qui n'ont jamais été le problème. Le questionnaire de ce site fait la première moitié du travail : il désigne l'étape en trois minutes, à partir de quinze questions sur les pratiques plutôt que sur les écrans. Ce qu'il ne peut pas faire, c'est observer tes utilisateurs — c'est la partie pour laquelle HEART est fait.",
        },
      ],
    },
  ],
  verdict: {
    en: "Different layers, not rivals. Use AARRR to find the stage where growth stalls, then use HEART, with its Goals-Signals-Metrics discipline, to measure the experience inside that stage. If a team has time for only one this quarter and has never diagnosed its funnel, it should start with AARRR: a perfect UX scorecard on the wrong stage is still the wrong stage.",
    fr: "Des couches différentes, pas des rivaux. Utilise AARRR pour trouver l'étape où la croissance cale, puis HEART, avec sa discipline Goals-Signals-Metrics, pour mesurer l'expérience à l'intérieur de cette étape. Si une équipe n'a le temps que pour l'un des deux ce trimestre et n'a jamais diagnostiqué son entonnoir, qu'elle commence par AARRR : une grille UX parfaite sur la mauvaise étape reste la mauvaise étape.",
  },
  glossary: ["retention", "activation", "nps", "aarrr"],
};

export const COMPARISONS: Record<ComparisonSlug, Comparison> = {
  "aarrr-vs-north-star-metric": NORTH_STAR,
  "aarrr-vs-rarra": RARRA,
  "aarrr-vs-growth-loops": GROWTH_LOOPS,
  "aarrr-vs-okr": OKR,
  "aarrr-vs-heart": HEART,
};

export function isComparisonSlug(value: string): value is ComparisonSlug {
  return Object.hasOwn(COMPARISONS, value);
}
