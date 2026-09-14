import type { Translatable } from "@/lib/i18n/translatable";

/**
 * open-door.ts — les deux pages « porte ouverte » du plan de distribution
 * (`GROWTH-PLAN.md` vague 2.1).
 *
 * **TODO: à relire.** Premier jet de la session de code, comme les pages
 * longues du glossaire avant leur validation. Ce sont des pages de fond qui
 * portent le nom d'Antoine ; à passer au prochain bon à tirer.
 *
 * **Deux pages, pas deux traductions l'une de l'autre.** Le plan les
 * désignait par deux requêtes vides trouvées dans les SERP — « growth audit
 * checklist / template » en anglais, « diagnostic croissance startup
 * gratuit » en français. Les livrer comme une seule page bilingue ferait
 * deux quasi-doublons, ce qui vaut moins que rien en référencement. Elles
 * répondent donc à deux INTENTIONS différentes, chacune dans les deux
 * langues :
 *
 * - **la checklist** est l'ARTEFACT : les quinze points, ce à quoi ressemble
 *   une bonne réponse, ce que coûte son absence, et comment se noter à la
 *   main. Quelqu'un qui cherche un « template » veut la liste, pas un
 *   article sur les listes.
 * - **le diagnostic** est la MÉTHODE : ce qu'un diagnostic de croissance est
 *   et n'est pas, dans quel ordre regarder, et pourquoi mesurer des
 *   pratiques n'est pas mesurer des résultats. Quelqu'un qui cherche
 *   « diagnostic croissance startup » veut savoir comment s'y prendre.
 *
 * **Les quinze points ne sont pas recopiés ici.** La page les rend depuis
 * `content/copy-library.ts`, comme `/about` le fait déjà : une seconde copie
 * dériverait, et la page prétendrait alors décrire un questionnaire qui
 * n'existe plus.
 *
 * **Le slug reste anglais dans les deux langues.** R2-16 a tranché contre
 * les slugs localisés (coût élevé, gain faible, et une URL publiée ne meurt
 * jamais ici) ; le contenu pèse de toute façon bien plus qu'un slug.
 */

export interface OpenDoorSection {
  heading: Translatable;
  body: Translatable[];
}

export interface OpenDoorPage {
  title: Translatable;
  intro: Translatable;
  metaTitle: Translatable;
  metaDescription: Translatable;
  sections: OpenDoorSection[];
  /** Le libellé du CTA vers `/quiz`, et la phrase qui l'accompagne. */
  ctaLead: Translatable;
  ctaLabel: Translatable;
}

export const CHECKLIST: OpenDoorPage = {
  title: {
    fr: "Checklist d'audit growth : les 15 points",
    en: "Growth audit checklist: the 15 points",
  },
  metaTitle: {
    fr: "Checklist d'audit growth — 15 points, gratuite, sans inscription",
    en: "Growth audit checklist — 15 points, free, no signup",
  },
  metaDescription: {
    fr: "Les quinze questions d'un audit growth AARRR, avec ce à quoi ressemble une bonne réponse et ce que coûte son absence. À travailler sur papier, ou en trois minutes dans la version interactive.",
    en: "The fifteen questions of an AARRR growth audit, with what a good answer looks like and what its absence costs. Work through it on paper, or take the interactive version in three minutes.",
  },
  intro: {
    fr: "Quinze questions, trois par étape du cadre AARRR. Elles ne mesurent pas tes résultats — elles mesurent si tu peux les voir. C'est une distinction qui décide de tout le reste : une équipe qui ne fait pas et une équipe qui fait sans pouvoir le prouver ont le même tableau de bord vide, et deux plans d'action opposés.",
    en: "Fifteen questions, three per stage of the AARRR framework. They don't measure your results — they measure whether you can see them. That distinction decides everything downstream: a team that isn't doing the work and a team doing it without being able to prove it have the same empty dashboard and two opposite action plans.",
  },
  sections: [
    {
      heading: { fr: "Comment s'en servir", en: "How to use it" },
      body: [
        {
          fr: "Réponds aux quinze en une seule fois, sans aller chercher les chiffres. Ce que tu sais de mémoire est précisément ce qui compte : une métrique qu'il faut une demi-journée pour reconstituer n'est pas une métrique que ton équipe pilote.",
          en: "Answer all fifteen in one sitting, without going to look anything up. What you know off the top of your head is exactly what counts: a metric that takes half a day to reconstruct is not a metric your team steers by.",
        },
        {
          fr: "Trois réponses possibles par question, et une seule règle : la réponse haute demande que ce soit à la fois en place ET suivi. « On a un canal principal » sans chiffre en face n'est pas la réponse haute — c'est celle du milieu, et l'écart entre les deux est tout le sujet.",
          en: "Three possible answers per question, and one rule: the top answer requires the thing to be both in place AND measured. « We have a main channel » with no number behind it is not the top answer — it's the middle one, and the gap between the two is the whole point.",
        },
      ],
    },
    {
      heading: { fr: "Se noter à la main", en: "Scoring it by hand" },
      body: [
        {
          fr: "Vingt points pour la réponse haute, sept pour celle du milieu, zéro pour la basse. Additionne les trois points d'une étape (soixante au maximum), ramène à vingt, arrondis à l'entier — puis additionne les cinq scores DÉJÀ arrondis pour le total sur cent. Arrondir à la fin donnerait un total qui ne correspond pas aux cinq chiffres affichés au-dessus.",
          en: "Twenty points for the top answer, seven for the middle, zero for the low one. Add up a stage's three points (sixty at most), scale to twenty, round to the nearest whole number — then add the five ALREADY-ROUNDED stage scores for the total out of a hundred. Rounding at the end would give a total that doesn't match the five numbers shown above it.",
        },
        {
          fr: "Le sept du milieu n'est pas la moitié de vingt, et c'est voulu : une chose en place mais non mesurée vaut mieux que rien, et beaucoup moins que la même chose sous surveillance. Le barème dit ça plutôt que de le laisser à l'interprétation.",
          en: "The middle seven is not half of twenty, and that's deliberate: something in place but unmeasured beats nothing, and is worth far less than the same thing under watch. The scale says that rather than leaving it to interpretation.",
        },
      ],
    },
    {
      heading: { fr: "Ce que le score ne dit pas", en: "What the score does not tell you" },
      body: [
        {
          fr: "Il mesure des pratiques déclarées, pas une performance. Une entreprise rentable peut sortir à quarante, et une équipe très outillée sans clients peut sortir à quatre-vingts. Ce que le chiffre attrape, c'est l'étape où tu pilotes à l'aveugle — et c'est cette étape-là qui limite tout ce qui est en aval.",
          en: "It measures declared practices, not performance. A profitable company can score forty, and a heavily instrumented team with no customers can score eighty. What the number catches is the stage where you're flying blind — and that stage caps everything downstream of it.",
        },
        {
          fr: "Deux biais de comparabilité à connaître avant de citer ton score : l'étape Referral donne mécaniquement un score très bas à tout produit vendu en assisté, et la question sur le CAC récompense davantage un chiffre récité qu'un aveu d'incertitude. Les deux se neutralisent en lisant l'étape plutôt que le total.",
          en: "Two comparability biases to know before quoting your score: the Referral stage mechanically scores very low for anything sold through a sales team, and the CAC question rewards a recited number more than an honest admission of uncertainty. Both are neutralised by reading the stage rather than the total.",
        },
      ],
    },
  ],
  ctaLead: {
    fr: "La même checklist, en trois minutes, avec le score calculé et l'étape qui te freine nommée :",
    en: "The same checklist, in three minutes, with the score worked out and the stage that's holding you back named:",
  },
  ctaLabel: { fr: "Faire le Tour →", en: "Take the Tour →" },
};

export const DIAGNOSTIC: OpenDoorPage = {
  title: {
    fr: "Diagnostic de croissance d'une startup : la méthode",
    en: "Startup growth diagnostic: the method",
  },
  metaTitle: {
    fr: "Diagnostic croissance startup — la méthode, gratuite",
    en: "Startup growth diagnostic — the method, free",
  },
  metaDescription: {
    fr: "Comment mener un diagnostic de croissance en une semaine : par quoi commencer, dans quel ordre regarder les cinq étapes, et pourquoi mesurer des pratiques n'est pas mesurer des résultats.",
    en: "How to run a growth diagnostic in a week: where to start, what order to look at the five stages in, and why measuring practices is not the same as measuring results.",
  },
  intro: {
    fr: "Un diagnostic de croissance n'est pas un tableau de bord de plus. Un tableau de bord répond à « où en est-on ? » ; un diagnostic répond à « qu'est-ce qui nous empêche d'aller plus vite, et comment le sait-on ? ». La différence tient en un mot : un diagnostic doit pouvoir se tromper.",
    en: "A growth diagnostic is not another dashboard. A dashboard answers « where are we? »; a diagnostic answers « what is stopping us going faster, and how do we know? ». The difference comes down to one word: a diagnostic has to be able to be wrong.",
  },
  sections: [
    {
      heading: { fr: "Commence par ce que personne ne peut montrer", en: "Start with what nobody can show you" },
      body: [
        {
          fr: "Le premier jour d'un diagnostic ne se passe pas dans les données : il se passe à demander cinq chiffres et à noter lesquels arrivent. Un chiffre qu'on te donne en deux minutes et un chiffre qui demande une semaine ne disent pas la même chose sur l'entreprise, même s'ils ont la même valeur.",
          en: "Day one of a diagnostic isn't spent in the data: it's spent asking for five numbers and writing down which ones arrive. A number you get in two minutes and a number that takes a week say different things about the company, even when they're identical.",
        },
        {
          fr: "Trois raisons possibles à une absence, et elles appellent trois plans différents : l'événement n'est pas instrumenté, il l'est mais personne ne le calcule, ou il est calculé de trois façons qui ne s'accordent pas. La troisième est la plus coûteuse et la plus courante — et c'est la seule qui ressemble à une réussite vue de loin.",
          en: "Three possible reasons for an absence, and each calls for a different plan: the event isn't instrumented, it is but nobody computes it, or it's computed three different ways that don't agree. The third is the most expensive and the most common — and it's the only one that looks like success from a distance.",
        },
      ],
    },
    {
      heading: { fr: "L'ordre dans lequel regarder", en: "The order to look in" },
      body: [
        {
          fr: "Les cinq étapes se multiplient : dix pour cent de mieux à quatre d'entre elles vaut environ quarante-six pour cent de plus au bout, pas quarante. C'est aussi ce qui rend l'ordre décisif — réparer l'acquisition d'un produit que personne ne garde revient à remplir plus vite un seau percé.",
          en: "The five stages multiply: ten percent better at four of them is worth roughly forty-six percent more at the end, not forty. That's also what makes the order decisive — fixing acquisition on a product nobody keeps is filling a leaky bucket faster.",
        },
        {
          fr: "La règle pratique : remonte depuis la fin. Regarde d'abord si ceux qui paient restent, puis si ceux qui s'inscrivent arrivent à la valeur, et seulement ensuite d'où viennent les inscriptions. C'est l'inverse de l'ordre du sigle, et c'est l'ordre dans lequel les corrections se paient.",
          en: "The practical rule: work backwards. Look first at whether the people who pay stay, then at whether the people who sign up reach value, and only then at where the signups come from. That's the reverse of the acronym's order, and it's the order in which fixes pay off.",
        },
      ],
    },
    {
      heading: { fr: "Mesurer des pratiques, pas des résultats", en: "Measuring practices, not results" },
      body: [
        {
          fr: "Comparer ton churn au churn médian d'un rapport public est presque toujours une fausse précision : la médiane porte sur des entreprises dont tu ne connais ni le segment, ni la définition employée, ni la fenêtre. Deux entreprises peuvent publier le même taux en comptant deux choses différentes.",
          en: "Comparing your churn to the median in a public report is nearly always false precision: the median covers companies whose segment, definition and window you don't know. Two companies can publish the same rate while counting two different things.",
        },
        {
          fr: "Les pratiques, elles, se comparent : « suis-tu ton taux d'activation ? » a la même réponse chez tout le monde, quelle que soit la définition retenue. C'est pour ça qu'un diagnostic de pratiques se tient d'une entreprise à l'autre là où un diagnostic de résultats ne se tient pas — et c'est ce que les quinze questions mesurent.",
          en: "Practices, on the other hand, do compare: « do you track your activation rate? » has the same answer everywhere, whatever definition is used. That's why a diagnostic of practices holds up from one company to the next where a diagnostic of results does not — and it's what the fifteen questions measure.",
        },
      ],
    },
    {
      heading: { fr: "Terminer sur une action, pas sur un constat", en: "End on an action, not a finding" },
      body: [
        {
          fr: "Un diagnostic qui s'arrête au constat ne change rien. La dernière page doit porter UNE action, celle qui déverrouille l'étape la plus faible — pas une liste de douze recommandations dont personne ne saura par laquelle commencer.",
          en: "A diagnostic that stops at the finding changes nothing. The last page has to carry ONE action, the one that unlocks the weakest stage — not a list of twelve recommendations nobody will know where to start with.",
        },
        {
          fr: "Et cette action doit être vérifiable dans un délai court. « Améliorer la rétention » n'en est pas une ; « poser un événement d'activation et lire la cohorte de la semaine prochaine » en est une, parce qu'on saura dans huit jours si elle a été faite.",
          en: "And that action has to be checkable within a short window. « Improve retention » isn't one; « instrument an activation event and read next week's cohort » is, because in eight days you'll know whether it happened.",
        },
      ],
    },
  ],
  ctaLead: {
    fr: "Les quinze questions de la méthode, en trois minutes, avec l'étape qui te freine nommée et une action à mener :",
    en: "The method's fifteen questions, in three minutes, with the stage that's holding you back named and one action to take:",
  },
  ctaLabel: { fr: "Faire le Tour →", en: "Take the Tour →" },
};
