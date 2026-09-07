import type { Translatable } from "@/lib/i18n/translatable";

/**
 * metrics.ts — Tour de Growth
 * Copy for `/metrics` (REVIEW-02.md R2-28): the tool's own AARRR, in public.
 * SPEC.md §1 sets the project's job as "démontrer par la preuve plutôt que
 * par la description"; a page of real numbers is the most direct form of that.
 *
 * The tone rule for this page: state the figure, say what it does not prove,
 * and never round in the flattering direction. A K-factor under 1 shown
 * plainly is what makes the rest believable — hiding it would cost exactly
 * the credibility the page exists to earn.
 *
 * TODO: à relire (REVIEW-02) — premier jet de la session de code, comme
 * about.ts et glossary-deep.ts.
 */
const t = (fr: string, en: string): Translatable => ({ fr, en });

export const METRICS = {
  title: t("Les chiffres de Tour de Growth", "Tour de Growth in numbers"),
  metaDescription: t(
    "Combien de Tours ont été faits, comment les scores se répartissent, combien de gens vont plus loin, et si l'outil se propage. Les vrais chiffres, à jour.",
    "How many Tours have been taken, how the scores fall, how many people go further, and whether the tool spreads. The real numbers, kept current.",
  ),
  intro: t(
    "Cet outil existe pour montrer une façon de travailler la croissance plutôt que pour la raconter. Il serait malvenu qu'il garde ses propres chiffres pour lui. Voici donc son entonnoir, tel qu'il est — y compris quand il n'est pas flatteur.",
    "This tool exists to show a way of working on growth rather than to describe one. It would sit badly with that to keep its own numbers private. So here is its funnel, as it stands — including where it isn't flattering.",
  ),
  freshness: t("Mis à jour au plus tard toutes les heures.", "Refreshed at most once an hour."),

  tooEarlyTitle: t("Trop tôt pour des ratios", "Too early for ratios"),
  tooEarly: t(
    "En dessous de {min} Tours, un taux ne dit rien : un seul partage qui convertit fait bouger le coefficient viral de plusieurs points. Les compteurs bruts sont ci-dessous ; les ratios apparaîtront quand ils voudront dire quelque chose.",
    "Below {min} Tours a rate says nothing: a single share that converts moves the viral coefficient by several points. The raw counters are below; the ratios will appear when they mean something.",
  ),

  toursLabel: t("Tours complétés", "Tours completed"),
  toursHelp: t("Depuis la mise en ligne.", "Since launch."),
  last30Label: t("Sur les 30 derniers jours", "In the last 30 days"),
  averageLabel: t("Score moyen", "Average score"),
  averageHelp: t("Sur 100, tous Tours confondus.", "Out of 100, across every Tour."),
  distributionTitle: t("Comment les scores se répartissent", "How the scores fall"),
  distributionHelp: t(
    "Une moyenne cache l'essentiel : elle ne dit pas si l'outil rencontre surtout des produits en difficulté ou surtout des produits en bonne santé.",
    "An average hides the interesting part: it doesn't say whether the tool mostly meets struggling products or mostly healthy ones.",
  ),
  deepDiveLabel: t("Vont jusqu'au Deep dive", "Go on to the Deep dive"),
  deepDiveHelp: t(
    "Dix questions de plus, après avoir déjà eu leur score. C'est la mesure d'activation de l'outil lui-même.",
    "Ten more questions, after already having their score. It is the tool's own activation metric.",
  ),
  kFactorLabel: t("Coefficient viral (K)", "Viral coefficient (K)"),
  kFactorHelp: t(
    "Tours issus du lien de quelqu'un d'autre, divisés par tous les Tours. Au-dessus de 1, la croissance s'auto-entretiendrait ; presque personne n'y arrive, et un chiffre en dessous est la norme, pas un aveu.",
    "Tours that came from someone else's link, divided by all Tours. Above 1, growth would sustain itself; almost nobody gets there, and a figure below it is the norm, not a confession.",
  ),
  referredLabel: t("dont issus d'un partage", "of which came from a share"),

  caveatsTitle: t("Ce que ces chiffres ne disent pas", "What these numbers don't say"),
  caveats: [
    t(
      "Le coefficient viral sous-compte : un lien recopié à la main perd la référence qui permet de l'attribuer. Le vrai chiffre est un peu au-dessus de celui affiché.",
      "The viral coefficient undercounts: a link copied by hand loses the reference that attributes it. The real figure is a little above the one shown.",
    ),
    t(
      "Le score moyen dit ce que déclarent les gens qui font le Tour, pas l'état réel de leur croissance. C'est une auto-évaluation, et elle attire sans doute plutôt des équipes qui se savent perfectibles.",
      "The average score reflects what the people who take the Tour declare, not the real state of their growth. It is a self-assessment, and it probably attracts teams who already suspect they have work to do.",
    ),
    t(
      "Rien ici ne concerne une personne en particulier : ce sont des comptes et des ratios sur l'ensemble. Ce qui est enregistré, et ce qui ne l'est pas, est détaillé dans la politique de confidentialité.",
      "Nothing here is about any one person: these are counts and ratios over the whole. What is recorded, and what is not, is set out in the privacy policy.",
    ),
  ],
  methodTitle: t("D'où viennent ces chiffres", "Where these numbers come from"),
  method: t(
    "Ils sont calculés directement sur les résultats enregistrés, par le même code que le tableau de bord privé — la page publique n'en montre qu'une partie choisie, jamais un chiffre reconstruit pour l'occasion. Le code est ouvert : la fonction qui les calcule s'appelle summarizeSubmissions.",
    "They are computed straight from the stored results, by the same code as the private dashboard — the public page shows a chosen subset of it, never a figure rebuilt for the occasion. The code is open: the function that computes them is called summarizeSubmissions.",
  ),
  cta: t("Fais ton propre Tour →", "Take your own Tour →"),
} satisfies Record<string, unknown>;
