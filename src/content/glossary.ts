import type { Translatable } from "@/lib/i18n/dictionary";
import { GLOSSARY_TERMS, type GlossaryTermId } from "./glossary-terms";

/**
 * glossary.ts — Tour de Growth
 * The SERVER-side glossary: everything `/glossary/[term]` renders. Each
 * entry spreads its `term`/`definition` from `glossary-terms.ts` — the short
 * popover copy, which is the only part the browser ever needs — and adds
 * the long-form fields on top. REVIEW-02.md R2-14: before the split, the
 * client component behind every "?" trigger imported THIS file, so the full
 * `extended` prose of all 15 terms shipped to `/quiz` and `/r/<id>` to show
 * two sentences. Nothing under `src/components` may import this module.
 *
 * `extended`/`related` were added later (growth-plan Phase 2, 2026-08-29)
 * for `/glossary/[term]`'s standalone SEO page only — a longer, practical
 * explainer plus 2-3 related terms for internal linking. Written here rather
 * than in the handoff bundle, and reviewed and approved by Antoine on
 * 2026-09-06, so it now has the same standing as the rest of this file.
 */

export type { GlossaryTermId } from "./glossary-terms";

export interface GlossaryEntry {
  /** Some terms have a different display form per locale (e.g. "aha moment" / "moment « aha »"); most are identical in both. */
  term: Translatable;
  definition: Translatable;
  /** Longer practical explainer — /glossary/[term] only, never the popover. */
  extended: Translatable;
  /** 2-3 related terms, rendered as internal links at the bottom of /glossary/[term]. */
  related: GlossaryTermId[];
  /**
   * `/glossary/[term]`'s meta description when `definition` is the wrong
   * length for a search snippet (REVIEW-02.md R2-06/R2-08): the definition
   * is calibrated for the popover, and a snippet wants 70-160 characters.
   * Only set where the definition falls outside that — the test enforces it.
   */
  metaDescription?: Translatable;
  /** When this term's long-form copy last changed (sitemap `lastmod`); falls back to `GLOSSARY_UPDATED_AT`. */
  updatedAt?: string;
}

export const GLOSSARY: Record<GlossaryTermId, GlossaryEntry> = {
  aarrr: {
    ...GLOSSARY_TERMS.aarrr,
    extended: {
      fr: "Dave McClure (500 Startups) a présenté ce cadre en 2007 pour répondre à un problème simple : les fondateurs suivaient trop de métriques sans savoir lesquelles comptaient vraiment à chaque étape. L'ordre n'est pas arbitraire — c'est un entonnoir. Un produit qui dépense en acquisition alors que son activation fuit remplit un seau percé : chaque euro dépensé en amont perd de la valeur en aval. La plupart des équipes découvrent qu'un seul pilier tire toute la note vers le bas ; c'est exactement ce que ce test calcule, pilier par pilier, plutôt que de donner une impression générale.",
      en: "Dave McClure (500 Startups) introduced this framework in 2007 to solve a simple problem: founders were tracking too many metrics without knowing which ones mattered at which stage. The order isn't arbitrary — it's a funnel. A product spending on acquisition while activation leaks is filling a leaky bucket: every euro spent upstream loses value downstream. Most teams find that one single pillar is dragging the whole score down; that's exactly what this test calculates, pillar by pillar, instead of giving one vague overall impression.",
    },
    related: ["acquisition", "activation", "north-star-metric"],
  },
  acquisition: {
    ...GLOSSARY_TERMS.acquisition,
    extended: {
      fr: "L'acquisition couvre tous les canaux par lesquels quelqu'un arrive chez toi pour la première fois : SEO, publicité payante, bouche-à-oreille, contenu, communautés, partenariats. Le piège classique : juger un canal uniquement sur le volume qu'il apporte, sans se demander s'il est reproductible et si son coût est connu (voir CAC). Un canal qui a bien marché une fois par chance n'est pas une stratégie d'acquisition, c'est un coup de chance. Et l'acquisition seule ne dit rien de la santé du produit — un pic de nouveaux visiteurs qui n'activent jamais n'est qu'un chiffre de vanité.",
      en: "Acquisition covers every channel through which someone finds you for the first time: SEO, paid ads, word of mouth, content, communities, partnerships. The classic trap: judging a channel purely on volume, without asking whether it's repeatable and whether its cost is even known (see CAC). A channel that worked once by luck isn't an acquisition strategy, it's a lucky break. And acquisition alone says nothing about product health — a spike of new visitors who never activate is just a vanity number.",
    },
    related: ["cac", "growth-loop", "activation", "aarrr"],
    // TODO: à relire (REVIEW-02) — R2-08. The English definition is 55
    // characters, too short for a search snippet; the French one is fine.
    metaDescription: {
      fr: "La façon dont de nouveaux utilisateurs ou clients découvrent ton produit pour la première fois.",
      en: "Acquisition: how new users or customers first discover your product — the channels that bring a stranger to your door, and whether you measure them.",
    },
  },
  activation: {
    ...GLOSSARY_TERMS.activation,
    extended: {
      fr: "La plupart des équipes confondent activation et inscription. Ce sont deux choses différentes : l'inscription est une action administrative, l'activation est le moment où l'utilisateur comprend enfin pourquoi il est là (voir Moment « aha »). Bien définir son activation demande de regarder, parmi les utilisateurs qui reviennent des mois plus tard, quelle action ils ont tous faite tôt — c'est souvent contre-intuitif, rarement la première chose qu'on montre dans l'onboarding. Une activation mal définie fausse tout le reste : on optimise le mauvais moment du parcours.",
      en: "Most teams confuse activation with sign-up. They're two different things: sign-up is an administrative action, activation is the moment the user finally understands why they're there (see Aha moment). Defining activation correctly means looking at users who are still around months later and finding the one early action they all took — it's often counter-intuitive, rarely the first thing shown in onboarding. A poorly defined activation moment skews everything downstream: you end up optimizing the wrong point in the journey.",
    },
    related: ["aha-moment", "onboarding", "retention", "aarrr"],
  },
  retention: {
    ...GLOSSARY_TERMS.retention,
    extended: {
      fr: "La retention se lit sur une courbe, pas sur un seul chiffre : le signe à chercher, c'est qu'elle finisse par s'aplatir plutôt que de continuer à descendre vers zéro (une courbe qui se stabilise dit que le produit a trouvé un usage régulier pour un noyau d'utilisateurs). C'est aussi le pilier le plus rentable à réparer avant de pousser l'acquisition : faire grandir un entonnoir qui fuit revient à courir plus vite sur un tapis roulant. L'inverse de la retention, c'est le churn — les deux se lisent toujours ensemble.",
      en: "Retention is read as a curve, not a single number: the sign to look for is that it eventually flattens rather than sliding toward zero (a curve that stabilizes means the product found regular use with a core of users). It's also the highest-leverage pillar to fix before pushing acquisition harder — growing a leaking funnel is just running faster on a treadmill. The inverse of retention is churn — the two are always read together.",
    },
    related: ["churn", "ltv", "onboarding", "aarrr"],
  },
  referral: {
    ...GLOSSARY_TERMS.referral,
    extended: {
      fr: "Le referral existe avec ou sans programme de parrainage formel — un utilisateur satisfait qui en parle spontanément à un collègue compte tout autant. Ce qui distingue un produit à fort referral, c'est qu'il devient moins cher à faire grandir avec le temps : chaque nouvel utilisateur en amène d'autres, contrairement à l'acquisition payante dont le coût reste stable (voir CAC). Un score NPS élevé est souvent le signal précoce qu'un mécanisme de referral, une fois construit, aura un vrai effet — un mauvais NPS prédit l'inverse, quel que soit le mécanisme.",
      en: "Referral exists with or without a formal referral program — a happy user who spontaneously tells a colleague counts just as much. What sets a high-referral product apart is that it gets cheaper to grow over time: every new user brings in others, unlike paid acquisition where the cost stays flat (see CAC). A high NPS score is often the early signal that a referral mechanism, once built, will actually work — a poor NPS predicts the opposite, whatever the mechanism.",
    },
    related: ["viral-coefficient", "growth-loop", "cac", "aarrr"],
  },
  revenue: {
    ...GLOSSARY_TERMS.revenue,
    extended: {
      fr: "Ce pilier ne juge pas le montant encaissé, mais si le modèle de revenu a été réellement testé face à de vrais clients — beaucoup de produits ont un plan de monétisation « pour plus tard » qui n'a jamais rencontré une carte bancaire. Une référence souvent citée dans le SaaS est un ratio LTV:CAC autour de 3:1 comme seuil de viabilité (voir LTV et CAC) — à prendre comme repère directionnel, pas comme une règle absolue selon ton marché. L'upsell et le cross-sell sont les deux leviers les plus rapides une fois le modèle de base validé.",
      en: "This pillar doesn't judge how much money comes in, but whether the revenue model has actually been tested against real customers — plenty of products have a monetization plan for \"later\" that has never met a credit card. A commonly cited SaaS rule of thumb is an LTV:CAC ratio around 3:1 as a viability threshold (see LTV and CAC) — treat it as a directional benchmark, not an absolute rule for every market. Upsell and cross-sell are the fastest levers once the base model is validated.",
    },
    related: ["cac", "ltv", "upsell-cross-sell", "aarrr"],
  },
  "aha-moment": {
    ...GLOSSARY_TERMS["aha-moment"],
    extended: {
      fr: "L'exemple le plus cité vient de Facebook : les équipes croissance avaient trouvé qu'un nouvel utilisateur qui atteignait 7 amis en 10 jours restait presque toujours par la suite — ce seuil précis est devenu leur boussole d'onboarding pendant des années. Trouver son propre moment « aha » demande de regarder en arrière, pas en avant : quelle action, faite tôt, les utilisateurs qui sont restés ont-ils tous en commun ? C'est rarement la fonctionnalité la plus mise en avant dans l'interface — souvent une action secondaire que personne ne pousse assez.",
      en: "The most-cited example comes from Facebook: growth teams found that a new user who reached 7 friends in 10 days almost always stuck around afterward — that specific threshold became their onboarding compass for years. Finding your own aha moment means looking backward, not forward: what early action do all the users who stayed have in common? It's rarely the most prominently featured part of the interface — often a secondary action nobody pushes hard enough.",
    },
    related: ["activation", "onboarding", "retention"],
  },
  cac: {
    ...GLOSSARY_TERMS.cac,
    extended: {
      fr: "Le calcul de base : dépenses totales de vente et marketing sur une période, divisées par le nombre de nouveaux clients obtenus sur cette même période. Le piège le plus fréquent est d'oublier d'y inclure les salaires de l'équipe commerciale/marketing et le coût des outils — un CAC qui ne compte que la pub payante est presque toujours sous-estimé. Le CAC n'a de sens qu'à côté de la LTV : un CAC bas sur un produit à faible valeur peut coûter plus cher qu'un CAC élevé sur un produit à forte rétention.",
      en: "The basic calculation: total sales and marketing spend over a period, divided by the number of new customers acquired in that same period. The most common trap is forgetting to include sales/marketing salaries and tool costs — a CAC that only counts paid ad spend is almost always underestimated. CAC only means something next to LTV: a low CAC on a low-value product can end up costing more than a high CAC on a highly retentive one.",
    },
    related: ["ltv", "revenue", "acquisition"],
  },
  ltv: {
    ...GLOSSARY_TERMS.ltv,
    extended: {
      fr: "Une estimation courante en SaaS : revenu mensuel moyen par client, divisé par le taux de churn mensuel. Un churn de 5 %/mois donne mécaniquement une durée de vie moyenne de 20 mois — ce qui montre à quel point la LTV dépend directement de la retention, pas seulement du prix. Augmenter son prix sans travailler la retention gonfle la LTV sur le papier sans rien changer à la réalité si les clients partent toujours aussi vite. C'est pour ça que ce pilier et Retention se lisent toujours ensemble, jamais isolément.",
      en: "A common SaaS estimate: average monthly revenue per customer, divided by the monthly churn rate. A 5%/month churn rate mechanically implies an average 20-month lifetime — which shows how directly LTV depends on retention, not just price. Raising your price without working on retention inflates LTV on paper without changing anything in reality if customers still leave just as fast. That's why this pillar and Retention are always read together, never in isolation.",
    },
    related: ["cac", "churn", "revenue"],
  },
  churn: {
    ...GLOSSARY_TERMS.churn,
    extended: {
      fr: "Deux churns à distinguer : le churn logo (nombre de clients perdus) et le churn revenu (montant perdu) — un client qui downgrade sans partir compte dans le second, pas dans le premier. Une autre distinction utile : le churn volontaire (le client décide de partir) contre le churn involontaire (un paiement qui échoue), ce dernier se corrige souvent avec de la simple mécanique de facturation. Le meilleur signe de santé qu'une équipe SaaS puisse viser est un « churn négatif » : l'expansion revenue des clients existants (upsell) dépasse ce que le churn fait perdre.",
      en: "Two churns worth telling apart: logo churn (number of customers lost) and revenue churn (amount lost) — a customer who downgrades without leaving counts in the second, not the first. Another useful split: voluntary churn (the customer decides to leave) vs. involuntary churn (a failed payment) — the latter is often fixed with plain billing mechanics. The strongest health signal a SaaS team can aim for is \"negative churn\": expansion revenue from existing customers (upsell) outpacing what churn takes away.",
    },
    related: ["retention", "ltv", "upsell-cross-sell"],
  },
  "viral-coefficient": {
    ...GLOSSARY_TERMS["viral-coefficient"],
    extended: {
      fr: "Formule standard, souvent notée K : nombre moyen d'invitations envoyées par utilisateur, multiplié par leur taux de conversion. K > 1 veut dire que chaque utilisateur en amène plus d'un autre en moyenne — la croissance s'auto-alimente sans dépenser plus en acquisition. En pratique, K > 1 durable est rare et précieux ; la plupart des produits visent plutôt un K qui réduit sensiblement le CAC effectif sans prétendre à la viralité pure. Ce tableau de bord Growth calcule d'ailleurs son propre K-factor en continu, exactement selon cette formule, sur les vraies analyses complétées.",
      en: "Standard formula, often written K: the average number of invitations sent per user, multiplied by their conversion rate. K > 1 means each user brings in more than one other on average — growth that feeds itself without spending more on acquisition. In practice, a sustained K > 1 is rare and valuable; most products instead aim for a K that meaningfully lowers effective CAC without claiming pure virality. This tool's own growth dashboard computes its K-factor continuously, using exactly this formula, on real completed analyses.",
    },
    related: ["referral", "growth-loop", "north-star-metric"],
    // TODO: à relire (REVIEW-02) — R2-08. The French definition runs to 164
    // characters; search engines cut around 160.
    metaDescription: {
      fr: "Le nombre moyen de nouveaux utilisateurs qu'un utilisateur existant amène par le partage — au-dessus de 1, la croissance s'auto-alimente.",
      en: "The average number of new users an existing user brings in through sharing — a coefficient above 1 means growth that feeds itself.",
    },
  },
  onboarding: {
    ...GLOSSARY_TERMS.onboarding,
    extended: {
      fr: "L'onboarding est le chemin, l'activation est la destination — les deux se confondent souvent à tort. L'erreur la plus fréquente est de tout expliquer d'un coup dès la première visite plutôt que de révéler les choses progressivement, au moment où l'utilisateur en a réellement besoin. Un bon onboarding se mesure à une seule question : combien de temps sépare l'inscription du moment « aha » — plus ce délai est court, mieux le parcours est calibré.",
      en: "Onboarding is the path, activation is the destination — the two are often wrongly treated as the same thing. The most common mistake is explaining everything at once on the first visit instead of revealing things progressively, right when the user actually needs them. A good onboarding is measured by one question: how much time separates sign-up from the aha moment — the shorter that gap, the better calibrated the path.",
    },
    related: ["activation", "aha-moment", "retention"],
  },
  "upsell-cross-sell": {
    ...GLOSSARY_TERMS["upsell-cross-sell"],
    extended: {
      fr: "Les deux sont des leviers d'expansion revenue — la manière la plus fiable de faire du « churn négatif » (voir Churn), parce qu'il est presque toujours moins cher de vendre plus à un client déjà convaincu que d'en acquérir un nouveau. Le timing compte plus que la technique : proposer un upsell avant que le client n'ait atteint son moment « aha » sur l'offre de base se lit comme de l'agressivité commerciale, pas comme de la valeur ajoutée.",
      en: "Both are expansion-revenue levers — the most reliable way to achieve \"negative churn\" (see Churn), because it's almost always cheaper to sell more to an already-convinced customer than to acquire a new one. Timing matters more than technique: pitching an upsell before the customer has reached their aha moment on the base plan reads as pushy sales, not added value.",
    },
    related: ["revenue", "churn", "ltv"],
  },
  "growth-loop": {
    ...GLOSSARY_TERMS["growth-loop"],
    extended: {
      fr: "Un entonnoir classique se termine à la conversion ; une boucle de croissance, elle, réinjecte la sortie comme entrée du cycle suivant. C'est exactement le mécanisme de ce test : chaque résultat partagé (voir Referral) amène potentiellement un nouveau visiteur, qui complète à son tour son propre test et le partage. On distingue généralement trois familles de boucles : les boucles de contenu (le contenu généré attire du trafic organique), les boucles virales (le partage amène directement de nouveaux utilisateurs) et les boucles payantes (le revenu généré finance l'acquisition suivante).",
      en: "A classic funnel ends at conversion; a growth loop instead feeds its output back in as the next cycle's input. That's exactly this tool's own mechanism: every shared result (see Referral) potentially brings in a new visitor, who in turn completes their own test and shares it. Growth teams generally group loops into three families: content loops (generated content pulls in organic traffic), viral loops (sharing directly brings in new users), and paid loops (revenue generated funds the next round of acquisition).",
    },
    related: ["referral", "viral-coefficient", "acquisition"],
  },
  "north-star-metric": {
    ...GLOSSARY_TERMS["north-star-metric"],
    extended: {
      fr: "Les exemples les plus connus : Airbnb a longtemps suivi les « nuits réservées » plutôt que le nombre d'inscriptions, Facebook a suivi les utilisateurs actifs mensuels plutôt que le nombre de comptes créés. Le point commun : dans les deux cas, la métrique capture de la valeur réellement délivrée, pas une action facile à gonfler artificiellement. Une bonne North Star Metric doit répondre à une question simple : si elle grimpe sans que rien d'autre ne bouge, est-ce que l'entreprise va vraiment mieux ? Si la réponse n'est pas clairement oui, ce n'est pas la bonne métrique.",
      en: "The best-known examples: Airbnb tracked \"nights booked\" for years rather than sign-ups, Facebook tracked monthly active users rather than accounts created. The common thread: in both cases the metric captures value actually delivered, not an easily-inflated vanity action. A good North Star Metric has to answer one simple question: if it goes up and nothing else changes, is the business actually better off? If the answer isn't a clear yes, it's the wrong metric.",
    },
    related: ["aarrr", "retention", "activation"],
  },
};
