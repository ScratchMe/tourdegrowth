import type { Translatable } from "@/lib/i18n/translatable";
import type { GlossaryTermId } from "./glossary-terms";

/**
 * glossary-deep.ts — Tour de Growth
 * The long-form sections of `/glossary/[term]` — REVIEW-02.md R2-11. The
 * whole English glossary weighed 1,402 words, about one "CAC" page of the
 * glossaries that actually rank (formula, worked example, benchmark, how to
 * improve, FAQ; 600-1,500 words each). Search Console agreed: indexed, on
 * the right queries, in position 70-95.
 *
 * SERVER-SIDE ONLY, like `glossary.ts` (`src/__tests__/client-bundles.test.ts`
 * guards both): nothing here may reach the popover or any client bundle.
 * `definition` stays untouched in `glossary-terms.ts` — it feeds the popover.
 *
 * The angle nobody else has: every term is tied to the Tour question that
 * measures it (`inTheTour.questionId`, rendered from `copy-library.ts` so
 * the wording can't drift) and to the score band it lands you in. That is
 * the one thing a glossary attached to a working tool can say.
 *
 * Delivered in five batches of three, as REVIEW-02.md planned, starting with
 * the most commercially searched terms; every term has one now, which the
 * `Record` type (not `Partial`) enforces for any term added later. Facts are the widely cited ones (the 3:1
 * LTV:CAC rule of thumb, CAC payback under 12 months for SMB SaaS, monthly
 * churn compounding), always with their caveat, never a made-up statistic.
 *
 * Relu et validé par Antoine (2026-09-09), avec quatre retouches appliquées
 * le jour même (acquisition, aha-moment, north-star-metric, revenue — voir
 * `updatedAt` dans glossary.ts). Écrit en cinq lots (R2-11) : cac, ltv, churn ;
 * retention, activation, viral-coefficient ; acquisition, referral, revenue ;
 * aarrr, aha-moment, onboarding ; growth-loop, north-star-metric,
 * upsell-cross-sell. Premier jet
 * de la session de code : c'est de la copie de fond qui porte le nom
 * d'Antoine, à relire ligne à ligne.
 */

export interface DeepGlossaryContent {
  /** The formula, written out, then each term explained. */
  formula: {
    expression: Translatable;
    terms: { symbol: Translatable; meaning: Translatable }[];
    note?: Translatable;
  };
  /** A worked, numeric example: the thing every ranking glossary has and this one didn't. */
  example: { title: Translatable; steps: Translatable[]; takeaway: Translatable };
  /** Orders of magnitude with their caveat — never one number presented as "the" benchmark. */
  benchmark: Translatable[];
  /** 3-5 concrete levers. */
  howToImprove: Translatable[];
  /** Which Tour question measures this, what each answer is worth, and what the band means. */
  inTheTour: { questionId: string; body: Translatable };
  /** 3-5 questions people actually type into a search box. */
  faq: { question: Translatable; answer: Translatable }[];
}

const t = (en: string, fr: string): Translatable => ({ en, fr });

export const GLOSSARY_DEEP: Record<GlossaryTermId, DeepGlossaryContent> = {
  // ——— GROWTH-PLAN.md wave 2.2, lot 1 (2026-09-14) ———
  // Each of these four is a child of a page that already earns impressions
  // (activation, cac, revenue, retention), and each reuses that parent's
  // worked example rather than inventing its own set of numbers: the shared
  // month — 400 customers, €20,000 MRR, 12 cancellations, 8 downgrades, 15
  // upgrades — is the same one `churn`, `revenue` and `upsell-cross-sell`
  // already walk through, read here as a pair of retention rates.
  nps: {
    formula: {
      expression: t(
        "NPS = (% of promoters, who answered 9-10) − (% of detractors, who answered 0-6). Passives, at 7-8, count for nothing",
        "NPS = (% de promoteurs, qui ont répondu 9-10) − (% de détracteurs, qui ont répondu 0-6). Les passifs, à 7-8, comptent pour rien",
      ),
      terms: [
        {
          symbol: t("The question", "La question"),
          meaning: t(
            "\"How likely are you to recommend us, from 0 to 10?\" — one question, always the same wording, always at the same moment in the lifecycle. Change any of the three and the series before and after are not comparable.",
            "« Quelle est la probabilité que tu nous recommandes, de 0 à 10 ? » — une question, toujours la même formulation, toujours au même moment du cycle de vie. Change l'un des trois et les séries avant et après ne sont plus comparables.",
          ),
        },
        {
          symbol: t("The buckets", "Les paniers"),
          meaning: t(
            "Three groups from eleven answers, which throws away most of the information on purpose. A 7 and a 0 are both \"not a promoter\", and only one of them is a person about to leave.",
            "Trois groupes à partir de onze réponses, ce qui jette volontairement l'essentiel de l'information. Un 7 et un 0 sont tous deux « pas un promoteur », et un seul des deux est une personne sur le point de partir.",
          ),
        },
        {
          symbol: t("The response rate", "Le taux de réponse"),
          meaning: t(
            "The number that has to be published beside the score and almost never is. A score computed on 10% of your users describes the 10% who felt strongly enough to answer.",
            "Le chiffre qui doit être publié à côté du score et qui ne l'est presque jamais. Un score calculé sur 10 % de tes utilisateurs décrit les 10 % qui avaient assez d'avis pour répondre.",
          ),
        },
      ],
      note: t(
        "This is a measure of stated intent, not of referrals made. Someone can answer 10 and never refer a single person; the viral coefficient counts what actually happened. Treating this score as a referral metric is the most common way it gets misused.",
        "C'est une mesure d'intention déclarée, pas de parrainages réalisés. Quelqu'un peut répondre 10 et ne jamais recommander une seule personne ; le coefficient viral, lui, compte ce qui s'est réellement passé. Prendre ce score pour une métrique de parrainage est la façon la plus courante de le détourner.",
      ),
    },
    example: {
      title: t("The same score, two opposite companies", "Le même score, deux entreprises opposées"),
      steps: [
        t(
          "Company A: 45% promoters, 35% passives, 20% detractors. NPS = 45 − 20 = +25.",
          "Entreprise A : 45 % de promoteurs, 35 % de passifs, 20 % de détracteurs. NPS = 45 − 20 = +25.",
        ),
        t(
          "Company B: 30% promoters, 65% passives, 5% detractors. NPS = 30 − 5 = +25. Identical score, and nothing else about them is.",
          "Entreprise B : 30 % de promoteurs, 65 % de passifs, 5 % de détracteurs. NPS = 30 − 5 = +25. Score identique, et rien d'autre chez elles ne l'est.",
        ),
        t(
          "A has real enthusiasm and a real problem: a fifth of respondents are unhappy enough to say so, and they are worth interviewing this week. B has neither — two thirds of people are indifferent, which is a harder situation and produces no complaint to act on.",
          "A a un enthousiasme réel et un problème réel : un cinquième des répondants sont assez mécontents pour le dire, et ils valent un entretien cette semaine. B n'a ni l'un ni l'autre — deux tiers des gens sont indifférents, ce qui est une situation plus difficile et ne produit aucune plainte sur laquelle agir.",
        ),
        t(
          "And the trap underneath both: 200 answers out of 2,000 users surveyed is a 10% response rate, and the 1,800 who ignored it are not neutral — disengaged users answer surveys least. The score describes the people still paying attention.",
          "Et le piège sous les deux : 200 réponses pour 2 000 utilisateurs sollicités, c'est 10 % de taux de réponse, et les 1 800 qui l'ont ignoré ne sont pas neutres — ce sont les utilisateurs désengagés qui répondent le moins aux enquêtes. Le score décrit les gens qui font encore attention.",
        ),
      ],
      takeaway: t(
        "The score is a summary of a distribution you already have, and the distribution is where the decisions are. Keep the three percentages and the response rate next to the number, and it becomes useful; publish the number alone and it becomes a target to optimise.",
        "Le score est le résumé d'une distribution que tu as déjà, et c'est dans la distribution que sont les décisions. Garde les trois pourcentages et le taux de réponse à côté du chiffre, et il devient utile ; publie le chiffre seul et il devient une cible à optimiser.",
      ),
    },
    benchmark: [
      t(
        "Industry tables of \"good NPS\" are widely quoted and worth very little, because the score depends heavily on how and when you ask. Two companies surveying at different lifecycle moments are comparing survey designs as much as products.",
        "Les tableaux sectoriels de « bon NPS » sont très cités et valent peu de chose, parce que le score dépend fortement de la façon et du moment où l'on demande. Deux entreprises qui interrogent à des moments différents du cycle de vie comparent autant des méthodes d'enquête que des produits.",
      ),
      t(
        "The defensible use is your own trend, with the question, the timing and the channel all held constant. Change any one of them and you have started a new series, whatever the chart says.",
        "L'usage défendable est ta propre tendance, à question, moment et canal constants. Change l'un des trois et tu as commencé une nouvelle série, quoi qu'en dise le graphique.",
      ),
      t(
        "A response rate under about 10% makes the score mostly a measure of who answers. That is not a reason to drop the survey — it is a reason to publish the rate, so the number is read with the weight it deserves.",
        "Un taux de réponse sous les 10 % environ fait du score surtout une mesure de qui répond. Ce n'est pas une raison d'abandonner l'enquête — c'est une raison de publier le taux, pour que le chiffre soit lu avec le poids qu'il mérite.",
      ),
    ],
    howToImprove: [
      t(
        "Publish the response rate and the three percentages next to the score, every time. This is the cheapest change on the list and it prevents the two failure modes above at once.",
        "Publie le taux de réponse et les trois pourcentages à côté du score, à chaque fois. C'est le changement le moins cher de cette liste et il évite les deux modes d'échec ci-dessus d'un coup.",
      ),
      t(
        "Read the free-text answers and treat the score as the index, not the finding. The sentence a detractor wrote is worth more than the fact that they were one.",
        "Lis les réponses libres et traite le score comme l'index, pas comme la trouvaille. La phrase qu'a écrite un détracteur vaut plus que le fait qu'il en était un.",
      ),
      t(
        "Ask at a consistent moment in the lifecycle — thirty days after activation, say — rather than to everyone at once. A campaign sent to your whole base mixes people who signed up yesterday with people who have used the product for three years.",
        "Interroge à un moment constant du cycle de vie — trente jours après l'activation, par exemple — plutôt que tout le monde d'un coup. Une campagne envoyée à toute la base mélange des gens inscrits hier et des gens qui utilisent le produit depuis trois ans.",
      ),
      t(
        "Do not use it as a referral metric. If what you want to know is whether people recommend you, count the referrals: the viral coefficient measures the act, this measures the intention, and the gap between the two is often the whole story.",
        "Ne l'utilise pas comme métrique de parrainage. Si ce que tu veux savoir est si les gens te recommandent, compte les parrainages : le coefficient viral mesure l'acte, celui-ci mesure l'intention, et l'écart entre les deux est souvent toute l'histoire.",
      ),
    ],
    inTheTour: {
      questionId: "ref-2",
      body: t(
        "The Tour asks whether your sharing or referral mechanism is actually used by customers — 20 points for yes and measured, 7 for a little, 0 for not really. That question and this score are not the same thing, and the difference is the point: a high NPS says people would recommend you, while this asks whether they did. A team quoting a strong score and answering 0 here has measured an intention and never built the path for it to become an act, which is a fixable problem and a very common one.",
        "Le Tour demande si ton mécanisme de partage ou de parrainage est réellement utilisé par les clients — 20 points pour oui et mesuré, 7 pour un peu, 0 pour pas vraiment. Cette question et ce score ne sont pas la même chose, et la différence est tout l'intérêt : un NPS élevé dit que les gens te recommanderaient, celle-ci demande s'ils l'ont fait. Une équipe qui cite un bon score et répond 0 ici a mesuré une intention sans jamais construire le chemin pour qu'elle devienne un acte, ce qui est un problème réparable et très courant.",
      ),
    },
    faq: [
      {
        question: t("What is a good NPS?", "C'est quoi un bon NPS ?"),
        answer: t(
          "The question has no answer that survives leaving your own survey, because the score moves with the wording, the timing and the channel far more than most people expect. The version worth asking is whether this quarter beats the last one with all three held constant — and whether the detractors are saying the same thing they said then.",
          "La question n'a pas de réponse qui survive à la sortie de ta propre enquête, parce que le score bouge avec la formulation, le moment et le canal bien plus que la plupart des gens ne l'imaginent. La version qui vaut la peine d'être posée est : ce trimestre bat-il le précédent, les trois étant constants — et les détracteurs disent-ils la même chose qu'alors ?",
        ),
      },
      {
        question: t("Does NPS predict referrals?", "Le NPS prédit-il les parrainages ?"),
        answer: t(
          "Weakly, and it is worth saying plainly. It measures whether someone says they would recommend you, which is a different act from recommending you — the second needs an occasion, a mechanism and a reason, and a product can score well and provide none of the three. Measure the referrals themselves if that is the question.",
          "Faiblement, et ça mérite d'être dit clairement. Il mesure si quelqu'un dit qu'il te recommanderait, ce qui est un acte différent de te recommander — le second demande une occasion, un mécanisme et une raison, et un produit peut bien scorer sans fournir aucun des trois. Mesure les parrainages eux-mêmes si c'est la question.",
        ),
      },
      {
        question: t("NPS or CSAT?", "NPS ou CSAT ?"),
        answer: t(
          "CSAT — customer satisfaction score — asks about one interaction that just happened and is the better tool for judging a support reply or a feature. NPS asks about the relationship as a whole and is the better tool for a trend across quarters. They are not competitors, and running both is common — the mistake is using either to judge what the other was built for.",
          "Le CSAT, pour customer satisfaction score, porte sur une interaction qui vient d'avoir lieu et convient mieux pour juger une réponse du support ou une fonctionnalité. Le NPS porte sur la relation dans son ensemble et convient mieux pour une tendance d'un trimestre à l'autre. Ce ne sont pas des concurrents, et faire les deux est courant — l'erreur est d'utiliser l'un pour juger ce pour quoi l'autre a été construit.",
        ),
      },
      {
        question: t("How often should I ask?", "À quelle fréquence faut-il demander ?"),
        answer: t(
          "Rarely enough that answering does not become a chore — twice a year for the same person is plenty, and a rolling survey to a different slice each month gives a continuous series without asking anyone twice. Asking quarterly at scale mostly trains your users to dismiss the dialog.",
          "Assez rarement pour que répondre ne devienne pas une corvée — deux fois par an pour la même personne suffit largement, et une enquête tournante sur une tranche différente chaque mois donne une série continue sans solliciter personne deux fois. Demander chaque trimestre à tout le monde entraîne surtout tes utilisateurs à fermer la fenêtre.",
        ),
      },
    ],
  },

  cac: {
    formula: {
      expression: t(
        "CAC = (sales + marketing spend over a period) ÷ (new customers won in that same period)",
        "CAC = (dépenses ventes + marketing sur une période) ÷ (nouveaux clients gagnés sur cette même période)",
      ),
      terms: [
        {
          symbol: t("Spend", "Dépenses"),
          meaning: t(
            "Everything it cost to win those customers: ads, tools, agencies, content, and the salaries of the people doing the selling and the marketing.",
            "Tout ce qu'il a coûté pour gagner ces clients : publicité, outils, agences, contenu, et les salaires des personnes qui vendent et qui font le marketing.",
          ),
        },
        {
          symbol: t("New customers", "Nouveaux clients"),
          meaning: t(
            "Paying customers who signed up in the period — not leads, not free sign-ups, unless free is your product.",
            "Les clients payants arrivés sur la période — pas les leads, pas les inscriptions gratuites, sauf si le gratuit est ton produit.",
          ),
        },
        {
          symbol: t("Period", "Période"),
          meaning: t(
            "A month or a quarter: long enough for the spend and the customers it produced to land in the same window. Sales cycles longer than that need a lag (see the FAQ).",
            "Un mois ou un trimestre : assez long pour que la dépense et les clients qu'elle produit tombent dans la même fenêtre. Un cycle de vente plus long demande un décalage (voir la FAQ).",
          ),
        },
      ],
      note: t(
        "Two useful variants: blended CAC (all channels, all customers, organic ones included) and paid CAC (paid spend ÷ customers attributed to paid). Blended flatters you; paid tells you what one more euro buys.",
        "Deux variantes utiles : le CAC mixte (tous canaux, tous clients, organiques compris) et le CAC payant (dépenses payantes ÷ clients attribués au payant). Le mixte te flatte ; le payant te dit ce qu'un euro de plus achète.",
      ),
    },
    example: {
      title: t("A B2B SaaS over one quarter", "Un SaaS B2B sur un trimestre"),
      steps: [
        t(
          "Ads and sponsorships: €18,000. Marketing tools and freelancers: €6,000. Two people on sales and marketing, fully loaded: €36,000. Total: €60,000.",
          "Publicité et sponsoring : 18 000 €. Outils marketing et freelances : 6 000 €. Deux personnes ventes et marketing, charges comprises : 36 000 €. Total : 60 000 €.",
        ),
        t("New paying customers over the quarter: 120.", "Nouveaux clients payants sur le trimestre : 120."),
        t("CAC = 60,000 ÷ 120 = €500 per customer.", "CAC = 60 000 ÷ 120 = 500 € par client."),
        t(
          "Counting ads alone would have given 18,000 ÷ 120 = €150 — a third of the real number. That gap is the most common CAC mistake.",
          "Ne compter que la pub aurait donné 18 000 ÷ 120 = 150 € — le tiers du vrai chiffre. Cet écart est l'erreur de CAC la plus fréquente.",
        ),
      ],
      takeaway: t(
        "€500 is neither good nor bad on its own. If those customers pay €50 a month and stay two years, it's excellent; if they pay €20 and leave within six months, it's a business that loses money on every sale.",
        "500 €, ce n'est ni bien ni mal en soi. Si ces clients paient 50 € par mois et restent deux ans, c'est excellent ; s'ils paient 20 € et partent en six mois, c'est une entreprise qui perd de l'argent à chaque vente.",
      ),
    },
    benchmark: [
      t(
        "There is no good CAC in absolute terms — only a CAC relative to what a customer brings back. The rule of thumb most SaaS investors quote is an LTV:CAC ratio of about 3:1: below it, growth eats margin; far above it, you are probably under-investing in acquisition.",
        "Il n'y a pas de bon CAC dans l'absolu — seulement un CAC relatif à ce qu'un client rapporte. La règle empirique que citent la plupart des investisseurs SaaS est un ratio LTV:CAC d'environ 3:1 : en dessous, la croissance mange la marge ; très au-dessus, tu sous-investis probablement en acquisition.",
      ),
      t(
        "The more actionable number is CAC payback: how many months of gross margin it takes to earn the CAC back. Commonly cited targets are under 12 months for SaaS sold to small businesses, and up to 18-24 months in enterprise sales, where contracts are larger and longer.",
        "Le chiffre le plus actionnable est le CAC payback : combien de mois de marge brute il faut pour rembourser le CAC. Les cibles couramment citées sont moins de 12 mois pour un SaaS vendu aux petites entreprises, jusqu'à 18-24 mois en vente entreprise, où les contrats sont plus gros et plus longs.",
      ),
      t(
        "Paid CAC drifts upward over time on almost every channel: the cheapest audiences get won first, and auction prices rise. A CAC that stays flat while spend doubles is the exception, not the baseline.",
        "Le CAC payant dérive vers le haut avec le temps sur presque tous les canaux : les audiences les moins chères sont gagnées en premier, et les enchères montent. Un CAC stable pendant que la dépense double est l'exception, pas la norme.",
      ),
    ],
    howToImprove: [
      t(
        "Fix activation and retention before spending more on acquisition: lower churn raises LTV, which makes the same CAC affordable — often the cheapest \"CAC improvement\" there is.",
        "Corrige l'activation et la rétention avant de dépenser plus en acquisition : un churn plus bas fait monter la LTV, ce qui rend le même CAC supportable — souvent la « baisse de CAC » la moins chère qui existe.",
      ),
      t(
        "Measure CAC per channel, not just blended. One channel usually hides another: a €150 SEO CAC and a €900 paid-social CAC average out to a number that describes neither.",
        "Mesure le CAC par canal, pas seulement en mixte. Un canal en cache souvent un autre : un CAC SEO à 150 € et un CAC social payant à 900 € font une moyenne qui ne décrit ni l'un ni l'autre.",
      ),
      t(
        "Work the conversion rate between the spend and the customer — landing page, sign-up flow, sales follow-up. Halving the drop-off after the click halves the CAC without touching the media budget.",
        "Travaille le taux de conversion entre la dépense et le client — page d'atterrissage, parcours d'inscription, relance commerciale. Diviser par deux la perte après le clic divise le CAC par deux sans toucher au budget média.",
      ),
      t(
        "Build the channels that compound — content, referral, product-led loops — whose cost per customer falls as they grow, unlike paid media, whose cost rises.",
        "Construis les canaux qui composent — contenu, parrainage, boucles portées par le produit — dont le coût par client baisse en grandissant, à l'inverse du média payant, dont le coût monte.",
      ),
    ],
    inTheTour: {
      questionId: "acq-3",
      body: t(
        "The Tour doesn't ask what your CAC is — it asks whether you know it. \"A solid number\" scores 20 on this question, \"a rough estimate\" 7, \"no idea\" 0, and the Acquisition stage score out of 20 averages this with your two other acquisition answers. A stage under 10 usually means the channel exists but nobody has priced it; that is where the Tour's verdict starts.",
        "Le Tour ne demande pas ton CAC — il demande si tu le connais. « Un chiffre solide » vaut 20 sur cette question, « une estimation grossière » 7, « aucune idée » 0, et le score de l'étape Acquisition sur 20 fait la moyenne avec tes deux autres réponses d'acquisition. Une étape sous 10 veut généralement dire que le canal existe mais que personne ne l'a chiffré ; c'est là que le verdict du Tour commence.",
      ),
    },
    faq: [
      {
        question: t("Is CAC the same as CPA?", "Le CAC, c'est la même chose que le CPA ?"),
        answer: t(
          "No. CPA (cost per acquisition) usually measures the cost of one action inside a channel — a lead, a sign-up, an install — and is reported by the ad platform. CAC measures the cost of one paying customer, across everything you spent. A €10 CPA on sign-ups with a 5% free-to-paid conversion is a €200 CAC before you add a single salary.",
          "Non. Le CPA (coût par acquisition) mesure en général le coût d'une action dans un canal — un lead, une inscription, une installation — et c'est la plateforme publicitaire qui le rapporte. Le CAC mesure le coût d'un client payant, sur tout ce que tu as dépensé. Un CPA de 10 € à l'inscription avec 5 % de passage au payant, c'est un CAC de 200 € avant d'ajouter le moindre salaire.",
        ),
      },
      {
        question: t("Should salaries count in CAC?", "Faut-il compter les salaires dans le CAC ?"),
        answer: t(
          "Yes — at least the share of the time spent winning new customers. Leaving them out is how a €500 CAC gets reported as €150. If the same people also look after existing customers, split their time and count only the acquisition share: an estimate is fine, zero is not.",
          "Oui — au moins la part du temps passée à gagner de nouveaux clients. Les oublier, c'est ainsi qu'un CAC de 500 € se retrouve annoncé à 150 €. Si les mêmes personnes s'occupent aussi des clients existants, répartis leur temps et ne compte que la part acquisition : une estimation convient, zéro non.",
        ),
      },
      {
        question: t(
          "How do I compute CAC when my sales cycle is three months long?",
          "Comment calculer le CAC quand mon cycle de vente dure trois mois ?",
        ),
        answer: t(
          "Lag the customers, not the spend: divide this quarter's spend by the customers who signed in the following quarter, or by the cohort that entered as leads this quarter and eventually closed. Either beats dividing today's spend by today's customers, which for a long cycle mostly measures last quarter's marketing.",
          "Décale les clients, pas la dépense : divise la dépense de ce trimestre par les clients signés le trimestre suivant, ou par la cohorte entrée comme leads ce trimestre et finalement convertie. L'un ou l'autre vaut mieux que diviser la dépense d'aujourd'hui par les clients d'aujourd'hui, qui pour un cycle long mesure surtout le marketing du trimestre précédent.",
        ),
      },
    ],
  },

  "cac-payback": {
    formula: {
      expression: t(
        "CAC payback (months) = CAC ÷ (monthly revenue per customer × gross margin)",
        "CAC payback (mois) = CAC ÷ (revenu mensuel par client × marge brute)",
      ),
      terms: [
        {
          symbol: t("CAC", "CAC"),
          meaning: t(
            "The fully loaded cost of winning one customer — ads, tools, agencies, content and the salaries of the people selling and marketing. Leaving the salaries out is the most common mistake.",
            "Le coût complet d'acquisition d'un client — publicité, outils, agences, contenu et les salaires des personnes qui vendent et font le marketing. Oublier les salaires est l'erreur la plus fréquente.",
          ),
        },
        {
          symbol: t("Gross margin", "Marge brute"),
          meaning: t(
            "What is left of the customer's payment after the direct cost of serving them: hosting, payment fees, support, any usage-based cost. Typically 70-85% in SaaS, much lower in anything with human delivery.",
            "Ce qu'il reste du paiement du client après le coût direct de sa livraison : hébergement, frais de paiement, support, tout coût lié à l'usage. En général 70-85 % en SaaS, bien moins dès qu'il y a de l'humain dans la livraison.",
          ),
        },
        {
          symbol: t("Monthly revenue per customer", "Revenu mensuel par client"),
          meaning: t(
            "What one customer pays per month. For annual contracts, use the monthly equivalent for the calculation and read the FAQ on prepayment, which changes the cash answer completely.",
            "Ce qu'un client paie par mois. Pour un contrat annuel, utilise l'équivalent mensuel pour le calcul et lis la FAQ sur le prépaiement, qui change complètement la réponse côté trésorerie.",
          ),
        },
      ],
      note: t(
        "Using revenue instead of gross margin is the version that flatters you, and it is the version most often quoted in a board deck. Margin is what actually pays the CAC back; revenue has the hosting bill still to pay out of it.",
        "Utiliser le revenu au lieu de la marge brute est la version qui flatte, et c'est celle qu'on cite le plus souvent en comité. C'est la marge qui rembourse réellement le CAC ; le revenu, lui, doit encore payer la facture d'hébergement.",
      ),
    },
    example: {
      title: t("The same €500 customer, followed forward", "Le même client à 500 €, suivi dans le temps"),
      steps: [
        t(
          "CAC of €500: €60,000 of quarterly spend for 120 new customers.",
          "CAC de 500 € : 60 000 € de dépenses trimestrielles pour 120 nouveaux clients.",
        ),
        t(
          "The customer pays €50 a month at 80% gross margin, so €40 a month actually comes back. Payback = 500 ÷ 40 = 12.5 months.",
          "Le client paie 50 € par mois à 80 % de marge brute, donc 40 € par mois reviennent réellement. Payback = 500 ÷ 40 = 12,5 mois.",
        ),
        t(
          "Computed on revenue instead of margin: 500 ÷ 50 = 10 months. Two and a half months of difference, entirely produced by which number you divide by.",
          "Calculé sur le revenu au lieu de la marge : 500 ÷ 50 = 10 mois. Deux mois et demi d'écart, entièrement produits par le choix du diviseur.",
        ),
        t(
          "At 3% monthly churn the average customer stays about 33 months (1 ÷ 0.03). So after payback there are roughly 20 months of margin left: 20 × €40 = €820 of profit per customer, and an LTV:CAC of about 2.6:1 — under the 3:1 most investors quote.",
          "À 3 % de churn mensuel, un client reste environ 33 mois (1 ÷ 0,03). Il reste donc à peu près 20 mois de marge après le remboursement : 20 × 40 € = 820 € de profit par client, et un LTV:CAC d'environ 2,6:1 — sous le 3:1 que citent la plupart des investisseurs.",
        ),
      ],
      takeaway: t(
        "Payback and LTV:CAC were computed from the same three numbers and say different things. Payback says when the cash comes back; LTV:CAC says whether it was worth it at all. A company short on cash is bound by the first long before the second.",
        "Payback et LTV:CAC ont été calculés à partir des trois mêmes chiffres et disent des choses différentes. Le payback dit quand la trésorerie revient ; le LTV:CAC dit si ça valait le coup. Une entreprise à court de trésorerie est contrainte par le premier bien avant le second.",
      ),
    },
    benchmark: [
      t(
        "The targets most commonly quoted: under 12 months for SaaS sold to small businesses, and 18-24 months in enterprise sales, where contracts are larger and longer and the money is usually collected up front. Both are rules of thumb from a decade of venture-funded SaaS, not laws.",
        "Les cibles les plus couramment citées : moins de 12 mois pour un SaaS vendu aux petites entreprises, 18-24 mois en vente entreprise, où les contrats sont plus gros, plus longs et généralement encaissés d'avance. Deux règles empiriques issues d'une décennie de SaaS financé, pas des lois.",
      ),
      t(
        "The comparison that decides whether a payback is survivable is with your runway, not with a benchmark. A 14-month payback is fine with three years of cash and fatal with nine months of it — the same number, two different companies.",
        "La comparaison qui décide si un payback est tenable est celle avec ta trésorerie, pas avec une référence. Un payback de 14 mois va très bien avec trois ans de cash et se révèle fatal avec neuf mois — le même chiffre, deux entreprises différentes.",
      ),
      t(
        "A payback longer than the average customer lifetime is not a slow business, it is a business that loses money on every sale. That check takes one division and is skipped surprisingly often.",
        "Un payback plus long que la durée de vie moyenne d'un client n'est pas une entreprise lente, c'est une entreprise qui perd de l'argent à chaque vente. Cette vérification tient en une division et se saute étonnamment souvent.",
      ),
    ],
    howToImprove: [
      t(
        "Bill annually, with a discount if needed. Collecting twelve months up front can take payback to the day of signature — the strongest lever on this number, and the only one that works without changing the product or the funnel.",
        "Facture à l'année, avec une remise s'il le faut. Encaisser douze mois d'avance peut ramener le payback au jour de la signature — le levier le plus fort sur ce chiffre, et le seul qui marche sans toucher au produit ni au tunnel.",
      ),
      t(
        "Work the margin before the price: a support cost or an infrastructure bill cut in half moves the denominator just as surely as a price rise, and nobody churns over it.",
        "Travaille la marge avant le prix : un coût de support ou une facture d'infrastructure divisé par deux déplace le dénominateur aussi sûrement qu'une hausse de prix, et personne ne résilie à cause de ça.",
      ),
      t(
        "Compute payback per channel, not blended. The blended number is an average over channels that often differ by a factor of five, and it hides both the channel to stop and the one to pour into.",
        "Calcule le payback par canal, pas en mixte. Le chiffre mixte est une moyenne sur des canaux qui diffèrent souvent d'un facteur cinq, et il masque à la fois le canal à arrêter et celui où appuyer.",
      ),
      t(
        "Shorten the sales cycle. Time between the spend and the first payment is dead money that the formula does not show, and a cycle cut from ten weeks to four is worth more than most pricing changes.",
        "Raccourcis le cycle de vente. Le temps entre la dépense et le premier paiement est de l'argent mort que la formule ne montre pas, et un cycle ramené de dix semaines à quatre vaut plus que la plupart des changements de prix.",
      ),
    ],
    inTheTour: {
      questionId: "acq-3",
      body: t(
        "The Tour asks whether you know your CAC at all, even roughly — worth 20 points, against 7 for an order of magnitude and 0 for no idea. Payback is the next question after that one, and it is why the Tour asks: a CAC on its own is a number, a CAC next to a monthly margin is a decision about whether to spend more next month. Teams that answer 0 here are usually not bad at arithmetic; they have simply never put the two figures side by side.",
        "Le Tour demande si tu connais ton CAC, même approximativement — 20 points, contre 7 pour un ordre de grandeur et 0 pour aucune idée. Le payback est la question suivante, et c'est pour ça que le Tour pose celle-là : un CAC seul est un chiffre, un CAC à côté d'une marge mensuelle est une décision sur le fait de dépenser plus le mois prochain. Les équipes qui répondent 0 ne sont en général pas mauvaises en arithmétique ; elles n'ont simplement jamais mis les deux chiffres côte à côte.",
      ),
    },
    faq: [
      {
        question: t("CAC payback or LTV:CAC — which one should I watch?", "CAC payback ou LTV:CAC — lequel suivre ?"),
        answer: t(
          "Both, and they answer different questions. LTV:CAC is a forecast: it depends on a churn rate projected years out, which is the least reliable number a young company owns. Payback is a date, built from figures you already have. When the two disagree, the date is the one your bank account will respect.",
          "Les deux, et ils répondent à des questions différentes. Le LTV:CAC est une prévision : il dépend d'un taux de churn projeté sur des années, le chiffre le moins fiable que possède une jeune entreprise. Le payback est une date, construite sur des chiffres que tu as déjà. Quand les deux divergent, c'est la date que ton compte en banque respectera.",
        ),
      },
      {
        question: t("Should I use gross margin or revenue?", "Marge brute ou revenu ?"),
        answer: t(
          "Gross margin. Revenue has not yet paid for hosting, payment processing or support, so a payback computed on it claims money back that is already spent. Whichever you pick, write it down next to the number: most disagreements about payback turn out to be two people using two formulas.",
          "La marge brute. Le revenu n'a pas encore payé l'hébergement, les frais de paiement ni le support, donc un payback calculé dessus réclame un argent déjà dépensé. Quel que soit ton choix, écris-le à côté du chiffre : la plupart des désaccords sur le payback sont deux personnes qui utilisent deux formules.",
        ),
      },
      {
        question: t("What changes if customers prepay a year?", "Qu'est-ce qui change si les clients paient un an d'avance ?"),
        answer: t(
          "The cash payback can drop to zero — the money is in the bank before the CAC invoice clears — while the accounting payback is unchanged. Both are true and they are used for different decisions: cash payback for how fast you can reinvest, accounting payback for whether the unit economics work.",
          "Le payback trésorerie peut tomber à zéro — l'argent est encaissé avant même que la facture de CAC ne soit réglée — pendant que le payback comptable ne bouge pas. Les deux sont vrais et servent à des décisions différentes : le premier pour savoir à quelle vitesse réinvestir, le second pour savoir si l'économie unitaire tient.",
        ),
      },
      {
        question: t("Does payback include the sales cycle?", "Le payback inclut-il le cycle de vente ?"),
        answer: t(
          "The standard formula does not, which is fine for self-serve and misleading for anything with a long cycle. If three months pass between the spend and the first euro collected, add them: a 12-month payback that is really 15 is the kind of gap that only shows up as an unexplained cash shortfall.",
          "La formule standard ne l'inclut pas, ce qui va très bien en self-serve et trompe dès que le cycle est long. Si trois mois s'écoulent entre la dépense et le premier euro encaissé, ajoute-les : un payback de 12 mois qui en fait 15 est le genre d'écart qui n'apparaît que comme un trou de trésorerie inexpliqué.",
        ),
      },
    ],
  },

  ltv: {
    formula: {
      expression: t(
        "LTV = average monthly revenue per customer × gross margin ÷ monthly churn rate",
        "LTV = revenu mensuel moyen par client × marge brute ÷ taux de churn mensuel",
      ),
      terms: [
        {
          symbol: t("Average monthly revenue", "Revenu mensuel moyen"),
          meaning: t(
            "Per account (ARPA) in B2B, per user (ARPU) in B2C. Use what a customer actually pays, after discounts.",
            "Par compte (ARPA) en B2B, par utilisateur (ARPU) en B2C. Prends ce qu'un client paie réellement, remises déduites.",
          ),
        },
        {
          symbol: t("Gross margin", "Marge brute"),
          meaning: t(
            "The share of that revenue left after the direct cost of serving the customer — hosting, support, payment fees. Skipping it overstates LTV: a 20% margin business and an 80% margin business are not worth the same per customer.",
            "La part de ce revenu qui reste après le coût direct de service du client — hébergement, support, frais de paiement. L'ignorer surestime la LTV : une activité à 20 % de marge et une à 80 % ne valent pas la même chose par client.",
          ),
        },
        {
          symbol: t("Monthly churn", "Churn mensuel"),
          meaning: t(
            "The share of customers lost per month. 1 ÷ churn is the expected lifetime in months, so the whole formula reads \"monthly margin × months they stay\".",
            "La part de clients perdus par mois. 1 ÷ churn est la durée de vie attendue en mois, donc toute la formule se lit « marge mensuelle × nombre de mois de présence ».",
          ),
        },
      ],
      note: t(
        "This is the simple, constant-churn version. It assumes churn stays flat forever, which it never does — early months lose more customers than later ones. Good enough to make decisions with; not good enough to raise money on without a cohort-based check (see the FAQ).",
        "C'est la version simple, à churn constant. Elle suppose un churn plat pour toujours, ce qui n'arrive jamais — les premiers mois perdent plus de clients que les suivants. Assez bonne pour décider ; pas assez pour lever des fonds sans une vérification par cohortes (voir la FAQ).",
      ),
    },
    example: {
      title: t("The same SaaS, two churn rates", "Le même SaaS, deux taux de churn"),
      steps: [
        t(
          "Customers pay €50 a month on average; gross margin is 80%, so each month is worth €40.",
          "Les clients paient 50 € par mois en moyenne ; la marge brute est de 80 %, donc chaque mois vaut 40 €.",
        ),
        t(
          "With 5% monthly churn, expected lifetime is 1 ÷ 0.05 = 20 months. LTV = 40 × 20 = €800.",
          "Avec 5 % de churn mensuel, la durée de vie attendue est 1 ÷ 0,05 = 20 mois. LTV = 40 × 20 = 800 €.",
        ),
        t(
          "With 2% monthly churn, lifetime becomes 50 months. LTV = 40 × 50 = €2,000.",
          "Avec 2 % de churn mensuel, la durée de vie passe à 50 mois. LTV = 40 × 50 = 2 000 €.",
        ),
        t(
          "Against the €500 CAC from the CAC example: 1.6:1 in the first case, 4:1 in the second. Same product, same price, same acquisition — retention alone decides whether the business works.",
          "Face au CAC de 500 € de l'exemple sur le CAC : 1,6:1 dans le premier cas, 4:1 dans le second. Même produit, même prix, même acquisition — la rétention seule décide si l'entreprise fonctionne.",
        ),
      ],
      takeaway: t(
        "Note what the 2% case implies: 50 months is more than four years. Most practitioners cap lifetime at three to five years, because a model that pays you back in year six is a model you cannot verify yet.",
        "Regarde ce qu'implique le cas à 2 % : 50 mois, c'est plus de quatre ans. La plupart des praticiens plafonnent la durée de vie à trois à cinq ans, parce qu'un modèle qui te rembourse la sixième année est un modèle que tu ne peux pas encore vérifier.",
      ),
    },
    benchmark: [
      t(
        "LTV:CAC around 3:1 is the most quoted SaaS rule of thumb. It is a rough guide, not a law: a 3:1 ratio with a 30-month payback can still sink a company that runs out of cash in month 12.",
        "Un LTV:CAC autour de 3:1 est la règle empirique la plus citée en SaaS. C'est un repère, pas une loi : un 3:1 avec un payback de 30 mois peut encore couler une entreprise à court de trésorerie au douzième mois.",
      ),
      t(
        "Lifetimes differ by an order of magnitude between segments: consumer apps often lose most users within weeks, SMB SaaS keeps customers for one to three years, enterprise contracts run five or more. Compare your LTV to your segment, never to \"SaaS\" in general.",
        "Les durées de vie varient d'un ordre de grandeur selon les segments : les applis grand public perdent souvent la plupart de leurs utilisateurs en quelques semaines, un SaaS PME garde ses clients un à trois ans, les contrats entreprise durent cinq ans ou plus. Compare ta LTV à ton segment, jamais au « SaaS » en général.",
      ),
      t(
        "With less than a year of data, your churn — and therefore your LTV — is a guess. Say so. A \"very rough\" LTV labelled as such beats a precise-looking number built on three months of cohorts.",
        "Avec moins d'un an de données, ton churn — et donc ta LTV — est une supposition. Dis-le. Une LTV « très approximative » annoncée comme telle vaut mieux qu'un chiffre d'apparence précise construit sur trois mois de cohortes.",
      ),
    ],
    howToImprove: [
      t(
        "Cut churn first: every point of monthly churn removed lengthens every customer's lifetime at once. It is the lever with the largest effect on LTV, and the only one that also lowers your effective CAC.",
        "Réduis d'abord le churn : chaque point de churn mensuel retiré allonge d'un coup la durée de vie de tous les clients. C'est le levier au plus grand effet sur la LTV, et le seul qui baisse aussi ton CAC effectif.",
      ),
      t(
        "Grow revenue per customer over time — upsell, cross-sell, usage-based tiers — so that a customer's monthly value rises as they stay instead of staying flat.",
        "Fais grandir le revenu par client dans le temps — upsell, cross-sell, paliers à l'usage — pour que la valeur mensuelle d'un client monte avec l'ancienneté au lieu de rester plate.",
      ),
      t(
        "Protect gross margin: a support process or an infrastructure cost that scales with customers eats LTV silently. Margin is the term of the formula founders most often forget.",
        "Protège la marge brute : un process de support ou un coût d'infrastructure qui grandit avec le nombre de clients ronge la LTV en silence. La marge est le terme de la formule que les fondateurs oublient le plus souvent.",
      ),
      t(
        "Segment before you optimise: compute LTV by acquisition channel and by plan. The blended number hides the segment that is actually profitable — and the one that is not.",
        "Segmente avant d'optimiser : calcule la LTV par canal d'acquisition et par offre. Le chiffre mixte cache le segment réellement rentable — et celui qui ne l'est pas.",
      ),
    ],
    inTheTour: {
      questionId: "rev-2",
      body: t(
        // TODO: à relire — revue de copie v1 (2026-09-24), fiche terminologique : « étape »/"stage" pour le lecteur, « pilier »/"pillar" réservé au code.
        "\"Do you know your LTV, even roughly?\" is the second Revenue question. \"A solid estimate\" scores 20, \"a very rough guess\" 7, \"no idea\" 0, averaged with your pricing and expansion answers into the Revenue stage score. Revenue is often the stage founders score lowest on — not because they don't charge, but because they have never connected what they charge to how long people stay.",
        "« Connais-tu ta LTV, même grossièrement ? » est la deuxième question Revenue. « Une estimation solide » vaut 20, « une estimation très approximative » 7, « aucune idée » 0, la moyenne avec tes réponses sur le pricing et l'expansion donnant le score de l'étape Revenue. Revenue est souvent l'étape où les fondateurs scorent le plus bas — non pas qu'ils ne facturent pas, mais parce qu'ils n'ont jamais relié ce qu'ils facturent au temps que les gens restent.",
      ),
    },
    faq: [
      {
        question: t("LTV or CLV — is there a difference?", "LTV ou CLV, quelle différence ?"),
        answer: t(
          "No. Customer lifetime value (CLV or CLTV) and lifetime value (LTV) are the same idea with different initials; marketing literature tends to say CLV, SaaS and startup circles say LTV. What matters is whether the number is revenue-based or margin-based — always check which one you're being shown.",
          "Aucune. Customer lifetime value (CLV ou CLTV) et lifetime value (LTV) désignent la même idée avec des initiales différentes ; la littérature marketing dit plutôt CLV, le monde SaaS et startup dit LTV. Ce qui compte, c'est de savoir si le chiffre est calculé sur le revenu ou sur la marge — vérifie toujours lequel on te montre.",
        ),
      },
      {
        question: t("How do I estimate LTV with no churn data yet?", "Comment estimer la LTV sans données de churn ?"),
        answer: t(
          "Borrow, then replace. Take the churn of comparable products in your segment as a placeholder, label the resulting LTV as an assumption, and set a date to replace it with your own cohorts. What you must not do is skip the number: a plan without an LTV assumption is a plan that hasn't decided how much a customer is allowed to cost.",
          "Emprunte, puis remplace. Prends le churn de produits comparables dans ton segment comme valeur provisoire, étiquette la LTV obtenue comme une hypothèse, et fixe une date pour la remplacer par tes propres cohortes. Ce qu'il ne faut pas faire, c'est sauter le chiffre : un plan sans hypothèse de LTV est un plan qui n'a pas décidé combien un client a le droit de coûter.",
        ),
      },
      {
        question: t(
          "Why compute LTV with cohorts instead of the formula?",
          "Pourquoi calculer la LTV par cohortes plutôt qu'avec la formule ?",
        ),
        answer: t(
          "Because churn isn't constant. A cohort view follows the customers who started in a given month and adds up what they actually paid over time; it captures the early cliff (many leave in month one or two) and the long flat tail (those who survive stay for years). The formula averages those two behaviours into one number that describes neither. Use the formula to start, cohorts to decide.",
          "Parce que le churn n'est pas constant. Une vue par cohortes suit les clients arrivés un mois donné et additionne ce qu'ils ont réellement payé au fil du temps ; elle capture la falaise du début (beaucoup partent au premier ou au deuxième mois) et la longue traîne plate (ceux qui survivent restent des années). La formule moyenne ces deux comportements en un chiffre qui ne décrit ni l'un ni l'autre. La formule pour commencer, les cohortes pour décider.",
        ),
      },
    ],
  },

  "nrr-grr": {
    formula: {
      expression: t(
        "NRR = (starting MRR + expansion − contraction − churn) ÷ starting MRR, and GRR = the same line without the expansion term",
        "NRR = (MRR de départ + expansion − contraction − churn) ÷ MRR de départ, et GRR = la même ligne sans le terme d'expansion",
      ),
      terms: [
        {
          symbol: t("Starting MRR", "MRR de départ"),
          meaning: t(
            "What the customers you already had at the start of the period were paying. New customers won during the period are excluded from both formulas — including them is the single most common way an NRR gets quoted at 140%.",
            "Ce que payaient les clients déjà présents au début de la période. Les nouveaux clients gagnés pendant la période sont exclus des deux formules — les inclure est de loin la façon la plus fréquente d'annoncer une NRR à 140 %.",
          ),
        },
        {
          symbol: t("Expansion", "Expansion"),
          meaning: t(
            "Upgrades, extra seats, usage above a plan, modules bought — money from customers who were already there. It appears in NRR and never in GRR, which is the entire difference between the two.",
            "Montées en gamme, sièges supplémentaires, usage au-dessus d'un forfait, modules achetés — de l'argent venu de clients déjà présents. Il apparaît dans la NRR et jamais dans la GRR, ce qui est toute la différence entre les deux.",
          ),
        },
        {
          symbol: t("Contraction and churn", "Contraction et churn"),
          meaning: t(
            "Contraction is a customer who stays and pays less; churn is a customer who leaves. Both are losses, they have different cures, and lumping them together hides which one you have.",
            "La contraction est un client qui reste et paie moins ; le churn est un client qui part. Les deux sont des pertes, elles se soignent différemment, et les confondre masque laquelle tu as.",
          ),
        },
      ],
      note: t(
        "GRR can never exceed 100% — it only subtracts. NRR can, and that is why it is the number quoted in fundraising decks. Reading them as a pair is the point: GRR is the state of the bucket, NRR is the bucket plus the tap.",
        "La GRR ne peut jamais dépasser 100 % — elle ne fait que soustraire. La NRR le peut, et c'est pour ça qu'elle est le chiffre cité en levée de fonds. Les lire en couple est tout l'intérêt : la GRR est l'état du seau, la NRR le seau plus le robinet.",
      ),
    },
    example: {
      title: t("One month, read twice", "Un mois, lu deux fois"),
      steps: [
        t(
          "Start of month: 400 customers, €20,000 MRR. During it: 12 cancel (−€600), 8 downgrade (−€400), 15 upgrade (+€900).",
          "Début de mois : 400 clients, 20 000 € de MRR. Pendant le mois : 12 résilient (−600 €), 8 rétrogradent (−400 €), 15 montent en gamme (+900 €).",
        ),
        t(
          "GRR = (20,000 − 400 − 600) ÷ 20,000 = 95%. Five points of the base leaked, and nothing in this figure can ever offset that.",
          "GRR = (20 000 − 400 − 600) ÷ 20 000 = 95 %. Cinq points de la base ont fui, et rien dans ce chiffre ne peut compenser ça.",
        ),
        t(
          "NRR = (20,000 + 900 − 400 − 600) ÷ 20,000 = 99.5%. Expansion closed four and a half of those five points.",
          "NRR = (20 000 + 900 − 400 − 600) ÷ 20 000 = 99,5 %. L'expansion a refermé quatre points et demi sur les cinq.",
        ),
        t(
          "An expansion playbook — the upgrade offered the moment an account hits its seat limit, instead of waiting for it to find the pricing page — takes that month's expansion from €900 to €1,080. NRR becomes (20,000 + 1,080 − 400 − 600) ÷ 20,000 = 100.4% — above the line at last. GRR is still 95%: not one customer was saved.",
          "Un playbook d'expansion — la montée en gamme proposée au moment où un compte atteint sa limite de sièges, au lieu d'attendre qu'il trouve la page de tarifs — fait passer l'expansion de ce mois de 900 € à 1 080 €. La NRR devient (20 000 + 1 080 − 400 − 600) ÷ 20 000 = 100,4 % — au-dessus de la barre, enfin. La GRR est toujours de 95 % : pas un client n'a été sauvé.",
        ),
      ],
      takeaway: t(
        "That last line is why the two are quoted together. An NRR just over 100% looks like a business whose base grows on its own; the GRR next to it says the base is still leaking 5% a month and a handful of growing accounts is paying for the ones walking out. Both statements are true, and only one of them is in the deck.",
        "Cette dernière ligne est la raison pour laquelle on cite les deux ensemble. Une NRR juste au-dessus de 100 % ressemble à une base qui grandit toute seule ; la GRR à côté dit que la base fuit toujours de 5 % par mois et qu'une poignée de comptes en croissance paie pour ceux qui s'en vont. Les deux affirmations sont vraies, et une seule est dans le deck.",
      ),
    },
    benchmark: [
      t(
        "The figures most often quoted for B2B SaaS: NRR of 110-130% is considered strong, and above 120% is the enterprise territory where seat growth inside big accounts does the work. Under 100% is normal and perfectly healthy in self-serve and SMB, where there is structurally less room to expand.",
        "Les chiffres les plus souvent cités en SaaS B2B : une NRR de 110-130 % est considérée comme solide, et au-dessus de 120 % on est sur le terrain de l'entreprise, où la croissance en sièges dans les gros comptes fait le travail. Sous 100 %, c'est normal et parfaitement sain en self-serve et en PME, où il y a structurellement moins de place pour l'expansion.",
      ),
      t(
        "GRR is commonly quoted at 85-95% annually in B2B, and the number matters more than NRR for judging the product itself: nothing a sales team does can raise GRR, only the product and the service can.",
        "La GRR est couramment citée à 85-95 % par an en B2B, et ce chiffre compte davantage que la NRR pour juger le produit lui-même : rien de ce que fait une équipe commerciale ne peut monter la GRR, seuls le produit et le service le peuvent.",
      ),
      t(
        "A pricing model with nowhere to grow — one flat plan, everything unlimited — caps NRR at GRR by construction. That is a pricing decision showing up as a retention number, and it is usually taken by accident.",
        "Un modèle de prix sans place pour grandir — une offre unique, tout illimité — plafonne la NRR au niveau de la GRR par construction. C'est une décision de pricing qui ressort en chiffre de rétention, et elle est en général prise par accident.",
      ),
    ],
    howToImprove: [
      t(
        "Read GRR first, always. Expansion can outrun a leak for a few quarters and never for a few years, and a team that only watches NRR finds out at the moment the biggest account stops growing.",
        "Lis la GRR en premier, toujours. L'expansion peut distancer une fuite quelques trimestres et jamais quelques années, et une équipe qui ne regarde que la NRR l'apprend au moment où le plus gros compte cesse de grandir.",
      ),
      t(
        "Segment both by cohort size. One account doubling can carry a whole month's NRR, which means the headline number describes that one account rather than your customer base.",
        "Segmente les deux par taille de compte. Un seul compte qui double peut porter la NRR d'un mois entier, ce qui veut dire que le chiffre global décrit ce compte-là plutôt que ta base de clients.",
      ),
      t(
        "Split contraction from churn in the reporting. They are the same subtraction and opposite problems: contraction usually means the pricing tiers are wrong, churn usually means the product or the onboarding is.",
        "Sépare contraction et churn dans le reporting. C'est la même soustraction et deux problèmes opposés : la contraction signale en général un mauvais découpage des offres, le churn un problème de produit ou d'onboarding.",
      ),
      t(
        "Measure both on the same cohort definition and the same period length, month after month. An NRR computed annually and a GRR computed monthly are not a pair, they are two unrelated numbers printed next to each other.",
        "Mesure les deux sur la même définition de cohorte et la même durée, mois après mois. Une NRR annuelle et une GRR mensuelle ne forment pas un couple, ce sont deux chiffres sans rapport imprimés côte à côte.",
      ),
    ],
    inTheTour: {
      questionId: "rev-3",
      body: t(
        "The Tour asks whether you have an expansion playbook — 20 points for a systematic one, 7 for \"some ideas, nothing systematic\", 0 for none. NRR is the number that answers it from the other end: a team with no playbook has an NRR pinned to its GRR, and usually does not know either figure. The 7-point answer is the interesting one, because ideas never show up on the expansion line — which is exactly what the gap between these two rates measures.",
        "Le Tour demande si tu as un playbook d'expansion — 20 points pour un playbook systématique, 7 pour « quelques idées, rien de systématique », 0 pour aucun. La NRR est le chiffre qui répond par l'autre bout : une équipe sans playbook a une NRR collée à sa GRR, et ne connaît en général ni l'une ni l'autre. La réponse à 7 points est la plus intéressante, parce que des idées n'apparaissent jamais sur la ligne d'expansion — ce que mesure précisément l'écart entre ces deux taux.",
      ),
    },
    faq: [
      {
        question: t("Is NRR the same as net dollar retention?", "NRR et net dollar retention, c'est pareil ?"),
        answer: t(
          "Yes. Net revenue retention, net dollar retention and NDR are the same calculation under three names, and you will meet all three in the same funding round. Net revenue retention is the version that survives a change of currency.",
          "Oui. Net revenue retention, net dollar retention et NDR sont le même calcul sous trois noms, et tu croiseras les trois dans la même levée. « Rétention nette de revenu » est la version qui survit à un changement de devise.",
        ),
      },
      {
        question: t("Can NRR be above 100% while the business shrinks?", "La NRR peut-elle dépasser 100 % pendant que l'entreprise rétrécit ?"),
        answer: t(
          "Yes, and it happens more often than the metric's reputation suggests. Lose half your customers, have the survivors double their spend, and NRR reads perfectly healthy on a base that has halved in headcount. That is why logo churn belongs next to it, and why GRR is the honest half of the pair.",
          "Oui, et ça arrive plus souvent que la réputation de la métrique ne le laisse croire. Perds la moitié de tes clients, que les survivants doublent leur dépense, et la NRR affiche une santé parfaite sur une base qui a fondu de moitié en nombre de comptes. C'est pour ça que le churn logo doit figurer à côté, et que la GRR est la moitié honnête du couple.",
        ),
      },
      {
        question: t("Should new customers be included?", "Faut-il inclure les nouveaux clients ?"),
        answer: t(
          "No, and this is the mistake to watch for when reading someone else's number. Both rates measure what an existing base does over time; adding new customers turns them into a growth rate wearing a retention label, which can read well above 100% for a business losing every cohort it wins.",
          "Non, et c'est l'erreur à guetter en lisant le chiffre de quelqu'un d'autre. Les deux taux mesurent ce que devient une base existante ; y ajouter les nouveaux clients en fait un taux de croissance déguisé en rétention, qui peut afficher bien plus de 100 % pour une entreprise qui perd chaque cohorte qu'elle gagne.",
        ),
      },
      {
        question: t("Monthly or annual?", "Mensuel ou annuel ?"),
        answer: t(
          "Annual is the convention for comparison, monthly is what you steer with. Careful with the conversion: a monthly NRR of 99.5% is not an annual 99.5% — compounded over twelve months it is about 94%. Rates compound, they do not add.",
          "L'annuel est la convention pour comparer, le mensuel est ce avec quoi on pilote. Attention à la conversion : une NRR mensuelle de 99,5 % n'est pas une NRR annuelle de 99,5 % — composée sur douze mois, elle vaut environ 94 %. Les taux se composent, ils ne s'additionnent pas.",
        ),
      },
    ],
  },

  churn: {
    formula: {
      expression: t(
        "Churn rate = customers lost during a period ÷ customers at the start of that period",
        "Taux de churn = clients perdus pendant une période ÷ clients au début de cette période",
      ),
      terms: [
        {
          symbol: t("Customers lost", "Clients perdus"),
          meaning: t(
            "Those who were customers at the start and aren't at the end. Don't count the ones who signed up and left within the same period — that's a different problem (activation), and it distorts the rate.",
            "Ceux qui étaient clients au début et ne le sont plus à la fin. Ne compte pas ceux qui sont arrivés et repartis dans la même période — c'est un autre problème (l'activation), et ça fausse le taux.",
          ),
        },
        {
          symbol: t("Start of period", "Début de période"),
          meaning: t(
            "The denominator is the opening count, not the average or the closing one. Using the closing count during fast growth makes churn look lower than it is.",
            "Le dénominateur est l'effectif d'ouverture, pas la moyenne ni l'effectif de clôture. Prendre la clôture en pleine croissance rapide fait paraître le churn plus bas qu'il n'est.",
          ),
        },
        {
          symbol: t("Revenue churn", "Churn revenu"),
          meaning: t(
            "Same formula with revenue instead of customers: MRR lost (cancellations + downgrades) ÷ MRR at the start. Net revenue churn also subtracts expansion from existing customers, and can go negative.",
            "Même formule avec du revenu à la place des clients : MRR perdu (résiliations + rétrogradations) ÷ MRR de départ. Le churn revenu net soustrait aussi l'expansion des clients existants, et peut devenir négatif.",
          ),
        },
      ],
      note: t(
        "Churn and retention are two faces of one number: 5% monthly churn is 95% monthly retention. Retention is usually read by cohort over time (D7, D30, month 6); churn is usually read as a rate per period. Same customers, two views.",
        "Churn et rétention sont les deux faces d'un même chiffre : 5 % de churn mensuel, c'est 95 % de rétention mensuelle. La rétention se lit en général par cohorte dans le temps (J7, J30, mois 6) ; le churn se lit en général comme un taux par période. Mêmes clients, deux lectures.",
      ),
    },
    example: {
      title: t("One month, three churns", "Un mois, trois churns"),
      steps: [
        t(
          "Start of month: 400 customers, €20,000 MRR. During the month: 12 cancel (€600 MRR), 8 downgrade (−€400 MRR), 15 upgrade (+€900 MRR).",
          "Début de mois : 400 clients, 20 000 € de MRR. Pendant le mois : 12 résilient (600 € de MRR), 8 rétrogradent (−400 € de MRR), 15 montent en gamme (+900 € de MRR).",
        ),
        t("Logo churn: 12 ÷ 400 = 3%.", "Churn logo : 12 ÷ 400 = 3 %."),
        t("Gross revenue churn: (600 + 400) ÷ 20,000 = 5%.", "Churn revenu brut : (600 + 400) ÷ 20 000 = 5 %."),
        t(
          "Net revenue churn: (600 + 400 − 900) ÷ 20,000 = 0.5%. Had upgrades brought €1,200 instead of €900, net churn would be −1%: negative churn, a revenue base growing on its own.",
          "Churn revenu net : (600 + 400 − 900) ÷ 20 000 = 0,5 %. Si les montées en gamme avaient rapporté 1 200 € au lieu de 900 €, le churn net serait de −1 % : du churn négatif, une base de revenu qui grandit toute seule.",
        ),
      ],
      takeaway: t(
        "Three true numbers for one month, from 3% to 0.5%. Whoever reports \"our churn is X\" without saying which one is either simplifying — or choosing the flattering one.",
        "Trois chiffres vrais pour un même mois, de 3 % à 0,5 %. Qui annonce « notre churn est de X » sans dire lequel simplifie — ou choisit le plus flatteur.",
      ),
    },
    benchmark: [
      t(
        "Commonly cited ranges for B2B SaaS: around 1-2% monthly logo churn is considered healthy for products sold to small businesses; enterprise products aim for single-digit annual churn, because their customers are fewer and each loss is large. B2C subscriptions routinely run far higher and live off re-acquisition.",
        "Fourchettes couramment citées en SaaS B2B : autour de 1-2 % de churn logo mensuel est considéré comme sain pour des produits vendus aux petites entreprises ; les produits entreprise visent un churn annuel à un chiffre, parce que leurs clients sont moins nombreux et que chaque perte pèse lourd. Les abonnements B2C tournent couramment bien plus haut et vivent de réacquisition.",
      ),
      t(
        "Small monthly numbers compound: 3% a month is not 36% a year but 1 − 0.97¹² ≈ 31% — a third of the customer base gone every year. Read monthly churn in years before deciding it's fine.",
        "Les petits chiffres mensuels se composent : 3 % par mois, ce n'est pas 36 % par an mais 1 − 0,97¹² ≈ 31 % — un tiers de la base client qui disparaît chaque année. Lis ton churn mensuel à l'échelle de l'année avant de décider que ça va.",
      ),
      t(
        "The best SaaS businesses report negative net revenue churn — existing customers grow faster than the lost ones shrink the base. It is rare, and it is the single strongest signal that a product has become indispensable.",
        "Les meilleures entreprises SaaS affichent un churn revenu net négatif — les clients existants grandissent plus vite que les partants ne réduisent la base. C'est rare, et c'est le signal le plus fort qu'un produit est devenu indispensable.",
      ),
    ],
    howToImprove: [
      t(
        "Find the cause before the fix. Exit interviews, a one-question cancellation survey, and a look at what churned customers did in their first two weeks usually name the top reason within a month. Guessing produces features nobody was leaving over.",
        "Trouve la cause avant le correctif. Des entretiens de départ, un questionnaire de résiliation à une question, et un regard sur ce que les clients partis ont fait pendant leurs deux premières semaines nomment en général la première raison en un mois. Deviner produit des fonctionnalités pour lesquelles personne ne partait.",
      ),
      t(
        "Separate voluntary from involuntary churn. Failed payments, expired cards and billing errors can be a quarter or more of churn in subscription businesses, and they are fixed with payment retries and card updaters, not with product work.",
        "Sépare le churn volontaire de l'involontaire. Paiements échoués, cartes expirées et erreurs de facturation peuvent représenter un quart du churn ou plus dans un modèle par abonnement, et ça se corrige avec des relances de paiement et une mise à jour automatique des cartes, pas avec du produit.",
      ),
      t(
        "Fix the first two weeks. Most customers who churn at month three decided at week two: they never reached the moment where the product paid off. Onboarding is a retention lever wearing an activation costume.",
        "Répare les deux premières semaines. La plupart des clients qui partent au troisième mois ont décidé à la deuxième semaine : ils n'ont jamais atteint le moment où le produit leur a rapporté quelque chose. L'onboarding est un levier de rétention déguisé en activation.",
      ),
      t(
        "Build a reason to come back — a weekly report, an alert, a shared artefact — so the product re-enters the customer's week on its own instead of waiting to be remembered.",
        "Construis une raison de revenir — un rapport hebdomadaire, une alerte, un livrable partagé — pour que le produit revienne de lui-même dans la semaine du client au lieu d'attendre qu'on se souvienne de lui.",
      ),
    ],
    inTheTour: {
      questionId: "ret-3",
      body: t(
        "Two Retention questions touch churn. \"Do you track a retention rate?\" measures whether you can see it; \"Do you know your main cause of churn?\" measures whether you understand it — 20 points for a cause backed by data or interviews, 7 for a hunch, 0 for none. A team that tracks the rate but can't name the cause typically lands in the 10-15 band: the dashboard exists, the diagnosis doesn't.",
        "Deux questions Retention touchent au churn. « Suis-tu un taux de rétention ? » mesure si tu le vois ; « Connais-tu ta principale cause de churn ? » mesure si tu le comprends — 20 points pour une cause confirmée par de la donnée ou des entretiens, 7 pour une intuition, 0 pour rien. Une équipe qui suit le taux mais ne sait pas nommer la cause atterrit typiquement dans la bande 10-15 : le tableau de bord existe, le diagnostic non.",
      ),
    },
    faq: [
      {
        question: t(
          "How do I convert monthly churn to annual churn?",
          "Comment convertir un churn mensuel en churn annuel ?",
        ),
        answer: t(
          "Not by multiplying by twelve. Annual churn = 1 − (1 − monthly churn)¹². At 2% monthly that is 1 − 0.98¹² ≈ 21.5%, not 24%; at 5% it is ≈ 46%, not 60%. The gap grows with the rate, and the multiplied version always overstates.",
          "Pas en multipliant par douze. Churn annuel = 1 − (1 − churn mensuel)¹². À 2 % par mois, ça donne 1 − 0,98¹² ≈ 21,5 %, pas 24 % ; à 5 %, ≈ 46 %, pas 60 %. L'écart grandit avec le taux, et la version multipliée surestime toujours.",
        ),
      },
      {
        question: t("What is negative churn?", "C'est quoi, le churn négatif ?"),
        answer: t(
          "Net revenue churn below zero: over a period, the extra revenue from existing customers who upgraded or bought more exceeds the revenue lost to cancellations and downgrades. The customer base can shrink in logos while growing in revenue. It requires a pricing model with room to grow — seats, usage, tiers — and it is the reason \"expansion playbook\" is one of the Tour's Revenue questions.",
          "Un churn revenu net sous zéro : sur une période, le revenu supplémentaire des clients existants qui ont monté en gamme ou acheté plus dépasse le revenu perdu en résiliations et rétrogradations. La base peut rétrécir en nombre de clients tout en grandissant en revenu. Ça demande un modèle de prix avec de la place pour grandir — sièges, usage, paliers — et c'est la raison pour laquelle le « playbook d'expansion » est l'une des questions Revenue du Tour.",
        ),
      },
      {
        question: t(
          "Is a churned customer who comes back still churn?",
          "Un client parti qui revient, c'est encore du churn ?",
        ),
        answer: t(
          "Count the churn when it happens and the return as a reactivation, separately. Netting them out hides both stories: why they left, and how you won them back — the second being a channel worth knowing. Most subscription analytics tools report reactivations on their own line for exactly this reason.",
          "Compte le churn au moment où il se produit et le retour comme une réactivation, séparément. Les compenser cache les deux sujets : pourquoi ils sont partis, et comment tu les as regagnés — le second étant un canal qui mérite d'être connu. La plupart des outils d'analyse d'abonnement rapportent les réactivations sur leur propre ligne pour exactement cette raison.",
        ),
      },
    ],
  },
  retention: {
    formula: {
      expression: t(
        "Retention (day N) = users still active on day N ÷ users who started on day 0",
        "Rétention (jour N) = utilisateurs encore actifs au jour N ÷ utilisateurs arrivés au jour 0",
      ),
      terms: [
        {
          symbol: t("Cohort", "Cohorte"),
          meaning: t(
            "The users who started in the same window — a day, a week, a month. Retention is always a property of a cohort; a single \"retention rate\" with no cohort behind it mixes people who signed up yesterday with people who have been around for a year.",
            "Les utilisateurs arrivés dans la même fenêtre — un jour, une semaine, un mois. La rétention est toujours la propriété d'une cohorte ; un « taux de rétention » unique sans cohorte derrière mélange ceux qui se sont inscrits hier avec ceux qui sont là depuis un an.",
          ),
        },
        {
          symbol: t("Active", "Actif"),
          meaning: t(
            "Whatever counts as using the product for real: a session, a key action, a paid renewal. Pick the definition that matches your natural frequency of use — daily for a messaging app, weekly for a project tool, monthly for accounting software — or the curve will lie in both directions.",
            "Ce qui compte comme un vrai usage : une session, une action clé, un renouvellement payé. Choisis la définition qui correspond à ta fréquence naturelle d'usage — quotidienne pour une messagerie, hebdomadaire pour un outil de projet, mensuelle pour un logiciel de comptabilité — sinon la courbe ment dans les deux sens.",
          ),
        },
        {
          symbol: t("Day N", "Jour N"),
          meaning: t(
            "D1, D7 and D30 are the usual checkpoints for consumer products; week 4 or month 3 for B2B. What matters is the shape between the checkpoints, not any one of them.",
            "J1, J7 et J30 sont les repères habituels en grand public ; semaine 4 ou mois 3 en B2B. Ce qui compte, c'est la forme de la courbe entre les repères, pas l'un d'eux en particulier.",
          ),
        },
      ],
      note: t(
        "Retention and churn describe the same customers from two sides: 95% monthly retention is 5% monthly churn. Retention is read as a curve over a cohort's life; churn as a rate per period. Use retention to understand the product, churn to run the business.",
        "Rétention et churn décrivent les mêmes clients de deux côtés : 95 % de rétention mensuelle, c'est 5 % de churn mensuel. La rétention se lit comme une courbe sur la vie d'une cohorte ; le churn comme un taux par période. La rétention pour comprendre le produit, le churn pour piloter l'activité.",
      ),
    },
    example: {
      title: t("Two cohorts, same D30, opposite futures", "Deux cohortes, même J30, avenirs opposés"),
      steps: [
        t(
          "Cohort A: 1,000 sign-ups. Active on D1: 600. D7: 380. D30: 250. D60: 245. D90: 242.",
          "Cohorte A : 1 000 inscrits. Actifs à J1 : 600. J7 : 380. J30 : 250. J60 : 245. J90 : 242.",
        ),
        t(
          "Cohort B: 1,000 sign-ups. D1: 700. D7: 450. D30: 250. D60: 150. D90: 90.",
          "Cohorte B : 1 000 inscrits. J1 : 700. J7 : 450. J30 : 250. J60 : 150. J90 : 90.",
        ),
        t(
          "Both report \"25% D30 retention\". A's curve flattens at about 24%: a quarter of the people who tried it made it a habit. B's keeps sliding: it will reach zero, just slowly.",
          "Les deux annoncent « 25 % de rétention à J30 ». La courbe de A s'aplatit vers 24 % : un quart des gens qui ont essayé en ont fait une habitude. Celle de B continue de glisser : elle atteindra zéro, juste lentement.",
        ),
        t(
          "A can now spend on acquisition — every 1,000 new users adds about 240 lasting ones. B would be filling a bucket with no bottom; its problem is the product, not the funnel.",
          "A peut maintenant dépenser en acquisition — chaque millier de nouveaux utilisateurs ajoute environ 240 durables. B remplirait un seau sans fond ; son problème est le produit, pas l'entonnoir.",
        ),
      ],
      takeaway: t(
        "One number cannot tell A from B. The curve can — and the flattening is the single most important thing a retention chart has to show you.",
        "Un chiffre seul ne distingue pas A de B. La courbe, si — et l'aplatissement est la chose la plus importante qu'un graphique de rétention ait à te montrer.",
      ),
    },
    benchmark: [
      t(
        "Ranges vary enormously by category, so compare within yours. Widely cited orders of magnitude: consumer mobile apps often keep 20-30% of a cohort at D30 and single digits by D90; SaaS is read in months, and 97-99% monthly customer retention is the range usually called healthy for small-business products, higher again in enterprise.",
        "Les fourchettes varient énormément selon la catégorie, donc compare dans la tienne. Ordres de grandeur couramment cités : les applis mobiles grand public gardent souvent 20-30 % d'une cohorte à J30 et moins de 10 % à J90 ; le SaaS se lit en mois, et 97-99 % de rétention client mensuelle est la fourchette habituellement qualifiée de saine pour des produits vendus aux petites entreprises, plus haut encore en entreprise.",
      ),
      t(
        "The shape matters more than the level: a curve that flattens at 10% describes a real product with a small core; a curve at 40% still heading down at month three describes a novelty. Investors read the flattening before they read the number.",
        "La forme compte plus que le niveau : une courbe qui s'aplatit à 10 % décrit un vrai produit avec un petit noyau ; une courbe à 40 % encore en baisse au troisième mois décrit une nouveauté. Les investisseurs lisent l'aplatissement avant de lire le chiffre.",
      ),
      t(
        "Retention compounds into everything downstream: it sets LTV, decides which CAC is affordable, and is the precondition for referral — nobody recommends a product they stopped using.",
        "La rétention se répercute sur tout l'aval : elle fixe la LTV, décide quel CAC est supportable, et conditionne le parrainage — personne ne recommande un produit qu'il a cessé d'utiliser.",
      ),
    ],
    howToImprove: [
      t(
        "Measure it by cohort first. A retention rate you \"can pull but rarely look at\" is not a retention rate; a weekly cohort chart on the wall changes what the team ships.",
        "Mesure-la par cohorte d'abord. Un taux de rétention qu'on « peut sortir mais qu'on regarde rarement » n'est pas un taux de rétention ; un graphique de cohortes hebdomadaire affiché au mur change ce que l'équipe livre.",
      ),
      t(
        "Move the aha moment earlier. Most of the D1-D7 drop is people who never experienced the value; every day cut between sign-up and that moment lifts the whole curve.",
        "Avance le moment « aha ». L'essentiel de la chute J1-J7, ce sont des gens qui n'ont jamais vécu la valeur ; chaque jour gagné entre l'inscription et ce moment relève toute la courbe.",
      ),
      t(
        "Give the product a reason to be reopened: a recurring output (a report, a digest, an alert) or a stored asset that grows with use. Re-engagement emails help only if there is something to come back to.",
        "Donne au produit une raison d'être rouvert : une sortie récurrente (un rapport, un résumé, une alerte) ou un actif stocké qui grandit avec l'usage. Les e-mails de réengagement n'aident que s'il y a quelque chose à retrouver.",
      ),
      t(
        "Talk to the people who left at week two and to the people who stayed at month six. The gap between the two conversations is your roadmap.",
        "Parle aux gens partis à la deuxième semaine et à ceux restés au sixième mois. L'écart entre les deux conversations, c'est ta feuille de route.",
      ),
      t(
        "Segment the curve — by acquisition channel, by plan, by use case. A flat average often hides one segment that retains beautifully and one that never had a chance.",
        "Segmente la courbe — par canal d'acquisition, par offre, par cas d'usage. Une moyenne plate cache souvent un segment qui retient très bien et un autre qui n'a jamais eu sa chance.",
      ),
    ],
    inTheTour: {
      questionId: "ret-1",
      body: t(
        // TODO: à relire — revue de copie v1 (2026-09-24), fiche terminologique : « étape »/"stage" pour le lecteur, « pilier »/"pillar" réservé au code.
        "The first Retention question is the simplest and the most discriminating: \"Do you track a retention rate (D7/D30 or similar)?\" — 20 for tracked and reviewed regularly, 7 for \"we can pull it, but rarely look\", 0 for no. It is averaged with the re-engagement mechanism and the cause of churn. Retention is the stage whose weak band (0-9) costs the most elsewhere: LTV, an affordable CAC and referral all sit downstream of it.",
        "La première question Retention est la plus simple et la plus discriminante : « Suis-tu un taux de rétention (J7/J30 ou équivalent) ? » — 20 pour suivi et revu régulièrement, 7 pour « on peut le sortir, mais on regarde rarement », 0 pour non. Elle fait moyenne avec le mécanisme de réengagement et la cause du churn. Retention est l'étape dont la bande faible (0-9) coûte le plus ailleurs : la LTV, un CAC supportable et le parrainage sont tous en aval.",
      ),
    },
    faq: [
      {
        question: t(
          "What's the difference between retention and churn?",
          "Quelle différence entre rétention et churn ?",
        ),
        answer: t(
          "Same customers, opposite sign, different lens. Retention follows a cohort over time and is drawn as a curve; churn is the share lost in a period and is quoted as a rate. 90% monthly retention and 10% monthly churn are one fact. Use retention when you want to know whether the product works, churn when you want to know what the business loses this month.",
          "Mêmes clients, signe opposé, angle différent. La rétention suit une cohorte dans le temps et se dessine en courbe ; le churn est la part perdue sur une période et se cite en taux. 90 % de rétention mensuelle et 10 % de churn mensuel sont un seul fait. La rétention pour savoir si le produit fonctionne, le churn pour savoir ce que l'activité perd ce mois-ci.",
        ),
      },
      {
        question: t(
          "Which retention metric should I track — D1, D7 or D30?",
          "Quelle rétention suivre — J1, J7 ou J30 ?",
        ),
        answer: t(
          "The one that matches how often the product should be used, then one checkpoint later. A daily-use product lives or dies on D1 and D7; a weekly tool should look at week 1 and week 4; monthly software at month 1 and month 3. Tracking D1 on a product people need once a month produces a terrifying chart that means nothing.",
          "Celle qui correspond à la fréquence à laquelle le produit devrait être utilisé, puis un repère plus loin. Un produit d'usage quotidien vit ou meurt sur J1 et J7 ; un outil hebdomadaire se regarde à la semaine 1 et à la semaine 4 ; un logiciel mensuel au mois 1 et au mois 3. Suivre J1 sur un produit dont on a besoin une fois par mois produit un graphique terrifiant qui ne veut rien dire.",
        ),
      },
      {
        question: t("What does \"the curve flattens\" actually mean?", "Ça veut dire quoi, « la courbe s'aplatit » ?"),
        answer: t(
          "That from some point on, the share of a cohort still active stops falling: the users who remain have made the product part of their routine, and losing them takes a different cause than losing the early quitters. A curve that never flattens means nobody has formed a habit yet — a product problem that no amount of acquisition fixes.",
          "Qu'à partir d'un certain point, la part d'une cohorte encore active cesse de baisser : les utilisateurs qui restent ont intégré le produit à leur routine, et les perdre demande une autre cause que celle qui a fait partir les premiers. Une courbe qui ne s'aplatit jamais veut dire que personne n'a encore pris l'habitude — un problème de produit qu'aucune acquisition ne corrige.",
        ),
      },
    ],
  },

  activation: {
    formula: {
      expression: t(
        "Activation rate = users who reached the aha moment within the activation window ÷ users who signed up",
        "Taux d'activation = utilisateurs ayant atteint le moment « aha » dans la fenêtre d'activation ÷ utilisateurs inscrits",
      ),
      terms: [
        {
          symbol: t("Aha moment", "Moment « aha »"),
          meaning: t(
            "The first time the user gets the value they came for — a defined, observable action, not a feeling. \"Created a first project and invited a teammate\", not \"understood the product\".",
            "La première fois que l'utilisateur obtient la valeur pour laquelle il est venu — une action définie et observable, pas un sentiment. « A créé un premier projet et invité un collègue », pas « a compris le produit ».",
          ),
        },
        {
          symbol: t("Activation window", "Fenêtre d'activation"),
          meaning: t(
            "How long after sign-up the moment still counts — a session, a day, a week. Without a window, a user who activates after six months inflates a rate that was supposed to describe onboarding.",
            "Combien de temps après l'inscription le moment compte encore — une session, un jour, une semaine. Sans fenêtre, un utilisateur qui s'active au bout de six mois gonfle un taux censé décrire l'onboarding.",
          ),
        },
        {
          symbol: t("Signed up", "Inscrits"),
          meaning: t(
            "The denominator is everyone who created an account in the period, including those who left after thirty seconds. Excluding them is the most common way an activation rate gets flattered.",
            "Le dénominateur, c'est tous ceux qui ont créé un compte sur la période, y compris ceux partis au bout de trente secondes. Les exclure est la façon la plus courante de flatter un taux d'activation.",
          ),
        },
      ],
      note: t(
        "Sign-up is not activation. A sign-up rate measures the promise of your landing page; an activation rate measures whether the product kept it. Teams that report the first as if it were the second optimise the wrong screen for months.",
        "S'inscrire n'est pas s'activer. Un taux d'inscription mesure la promesse de ta page d'accueil ; un taux d'activation mesure si le produit l'a tenue. Les équipes qui rapportent le premier comme s'il était le second optimisent le mauvais écran pendant des mois.",
      ),
    },
    example: {
      title: t("Finding the moment, then measuring it", "Trouver le moment, puis le mesurer"),
      steps: [
        t(
          "A project-management tool looks at the users still active at month three and asks what they all did in their first week. 82% of them had invited at least one teammate; among users who churned in month one, 11% had.",
          "Un outil de gestion de projet regarde les utilisateurs encore actifs au troisième mois et se demande ce qu'ils ont tous fait la première semaine. 82 % avaient invité au moins un collègue ; parmi ceux partis le premier mois, 11 %.",
        ),
        t(
          "Aha moment: \"first teammate invited\". Window: 7 days. Definition written down, event instrumented.",
          "Moment « aha » : « premier collègue invité ». Fenêtre : 7 jours. Définition écrite, événement instrumenté.",
        ),
        t(
          "Last month: 2,400 sign-ups, 552 invited someone within a week. Activation rate = 552 ÷ 2,400 = 23%.",
          "Le mois dernier : 2 400 inscrits, 552 ont invité quelqu'un dans la semaine. Taux d'activation = 552 ÷ 2 400 = 23 %.",
        ),
        t(
          "The onboarding used to end on a tour of features. It now ends on the invite screen. Next month: 31%. Same acquisition spend, a third more users who might stay.",
          "L'onboarding se terminait sur une visite des fonctionnalités. Il se termine maintenant sur l'écran d'invitation. Le mois suivant : 31 %. Même dépense d'acquisition, un tiers d'utilisateurs en plus susceptibles de rester.",
        ),
      ],
      takeaway: t(
        "Correlation, not proof: inviting a teammate doesn't cause retention — wanting to use the tool with a team does. But the action is the earliest visible trace of that intent, which is exactly what an activation metric is for.",
        "Corrélation, pas preuve : inviter un collègue ne cause pas la rétention — vouloir utiliser l'outil en équipe, si. Mais l'action est la première trace visible de cette intention, et c'est exactement à ça que sert une métrique d'activation.",
      ),
    },
    benchmark: [
      t(
        "There is no universal activation rate: the number depends entirely on how demanding your aha moment is. Commonly cited orders of magnitude for SaaS onboarding sit between 20% and 40% of sign-ups — often lower for free trials, higher for invite-only products. Compare month to month, not to a table.",
        "Il n'y a pas de taux d'activation universel : le chiffre dépend entièrement de l'exigence de ton moment « aha ». Les ordres de grandeur couramment cités pour un onboarding SaaS se situent entre 20 % et 40 % des inscrits — souvent plus bas pour les essais gratuits, plus haut pour les produits sur invitation. Compare d'un mois à l'autre, pas à un tableau.",
      ),
      t(
        "Time-to-value is the companion metric: how long the median user takes to reach the moment. Minutes for a consumer app, a day or two for a team tool, weeks for software that needs data imported. Halving it usually does more for retention than any feature.",
        "Le time-to-value est la métrique compagne : combien de temps l'utilisateur médian met à atteindre le moment. Des minutes pour une appli grand public, un jour ou deux pour un outil d'équipe, des semaines pour un logiciel qui demande d'importer des données. Le diviser par deux fait en général plus pour la rétention que n'importe quelle fonctionnalité.",
      ),
      t(
        // TODO: à relire — revue de copie v1 (2026-09-24), fiche terminologique : « étape »/"stage" pour le lecteur, « pilier »/"pillar" réservé au code.
        "Activation is the cheapest stage to move: it happens inside a flow you fully control, with users who already chose to come. A ten-point gain here is worth more than a ten-point gain in sign-up conversion, because every activated user carries into retention.",
        "L'activation est l'étape la moins chère à faire bouger : ça se passe dans un parcours que tu contrôles entièrement, avec des utilisateurs qui ont déjà choisi de venir. Dix points gagnés ici valent plus que dix points de conversion à l'inscription, parce que chaque utilisateur activé se prolonge dans la rétention.",
      ),
    ],
    howToImprove: [
      t(
        "Define the moment from evidence, not from the roadmap: look at who stayed and what they did early. If the answer surprises you, that's a good sign — the obvious feature is rarely it.",
        "Définis le moment à partir des preuves, pas de la feuille de route : regarde qui est resté et ce qu'ils ont fait tôt. Si la réponse te surprend, c'est bon signe — la fonctionnalité évidente l'est rarement.",
      ),
      t(
        "Cut everything between sign-up and that moment that isn't strictly necessary: the profile form, the feature tour, the empty dashboard. Ask for what you need when you need it.",
        "Retire tout ce qui sépare l'inscription de ce moment sans être strictement nécessaire : le formulaire de profil, la visite guidée, le tableau de bord vide. Demande ce dont tu as besoin au moment où tu en as besoin.",
      ),
      t(
        "Instrument the moment as an event and put the rate on a weekly chart. An activation rate nobody sees does not improve.",
        "Instrumente le moment comme un événement et mets le taux sur un graphique hebdomadaire. Un taux d'activation que personne ne voit ne s'améliore pas.",
      ),
      t(
        "Iterate the onboarding on data, not instinct: one change at a time, one week of cohorts each. \"Tweaked a little, informally\" is what the Tour scores at 7 for a reason.",
        "Itère l'onboarding sur des données, pas à l'instinct : un changement à la fois, une semaine de cohortes à chaque fois. « Ajusté un peu, à l'instinct » vaut 7 points dans le Tour pour une raison.",
      ),
    ],
    inTheTour: {
      questionId: "act-1",
      body: t(
        "All three Activation questions are about the same moment: whether you have defined it (20 if you measure it, 7 if it exists unmeasured, 0 if not), whether you know what share of users reach it, and whether the onboarding that leads there has been iterated on real data. \"We have one, but don't measure it\" on all three lands the stage at 7 — the weak band — a typical way for a product with a genuinely good idea to score poorly here.",
        "Les trois questions Activation portent sur le même moment : l'as-tu défini (20 si tu le mesures, 7 s'il existe sans être mesuré, 0 sinon), sais-tu quelle part d'utilisateurs l'atteint, et l'onboarding qui y mène a-t-il été itéré sur de vraies données. « On en a un, mais on ne le mesure pas » sur les trois met l'étape à 7 — la bande faible — une façon typique, pour un produit avec une vraie bonne idée, de mal scorer ici.",
      ),
    },
    faq: [
      {
        question: t(
          "Isn't activation just the sign-up conversion rate?",
          "L'activation, ce n'est pas simplement le taux de conversion à l'inscription ?",
        ),
        answer: t(
          // TODO: à relire — revue de copie v1 (2026-09-24), fiche terminologique : « étape »/"stage" pour le lecteur, « pilier »/"pillar" réservé au code.
          "No, and confusing the two is the most expensive mistake in this stage. Sign-up conversion is visitors → accounts; it lives on the landing page and measures the promise. Activation is accounts → people who got the value; it lives in the product and measures whether the promise was kept. You can double the first while the second stays flat, and the business won't move.",
          "Non, et confondre les deux est l'erreur la plus coûteuse de cette étape. La conversion à l'inscription, c'est visiteurs → comptes ; elle se joue sur la page d'accueil et mesure la promesse. L'activation, c'est comptes → personnes qui ont obtenu la valeur ; elle se joue dans le produit et mesure si la promesse a été tenue. Tu peux doubler la première pendant que la seconde reste plate, et l'activité ne bougera pas.",
        ),
      },
      {
        question: t("How do I find my aha moment?", "Comment trouver mon moment « aha » ?"),
        answer: t(
          "Backwards. Take the users who are still active after three months and the users who left in the first month, and compare what each group did in their first week: the actions heavily over-represented among the stayers are your candidates. Then pick the earliest one you can plausibly get most new users to do. Facebook's \"7 friends in 10 days\" is the famous example; yours will be smaller and more specific.",
          "À l'envers. Prends les utilisateurs encore actifs après trois mois et ceux partis le premier mois, et compare ce que chaque groupe a fait la première semaine : les actions nettement surreprésentées chez ceux qui restent sont tes candidates. Puis choisis la plus précoce que tu peux raisonnablement faire faire à la plupart des nouveaux. Les « 7 amis en 10 jours » de Facebook sont l'exemple célèbre ; le tien sera plus petit et plus spécifique.",
        ),
      },
      {
        question: t(
          "Can a product have more than one activation metric?",
          "Un produit peut-il avoir plusieurs métriques d'activation ?",
        ),
        answer: t(
          "It can have several segments with different moments — a solo user and a team admin rarely get value from the same action — but each segment should have one. A single product with three activation metrics for the same user usually means nobody has decided which one matters, and the onboarding tries to do all three.",
          "Il peut avoir plusieurs segments avec des moments différents — un utilisateur seul et un administrateur d'équipe obtiennent rarement la valeur par la même action — mais chaque segment devrait en avoir une. Un même produit avec trois métriques d'activation pour le même utilisateur veut en général dire que personne n'a décidé laquelle compte, et l'onboarding essaie de faire les trois.",
        ),
      },
    ],
  },

  "cohort-analysis": {
    formula: {
      expression: t(
        "Retention(cohort C, period n) = (members of C still active in period n) ÷ (size of C at period 0)",
        "Rétention(cohorte C, période n) = (membres de C encore actifs en période n) ÷ (taille de C en période 0)",
      ),
      terms: [
        {
          symbol: t("Cohort", "Cohorte"),
          meaning: t(
            "Everyone who arrived in the same window — the January sign-ups, the users from one campaign. What defines a cohort is when its members started, which is what makes two of them comparable at the same age.",
            "Tous ceux arrivés sur la même fenêtre — les inscrits de janvier, les utilisateurs d'une campagne. Ce qui définit une cohorte, c'est le moment où ses membres ont commencé, et c'est ce qui rend deux cohortes comparables au même âge.",
          ),
        },
        {
          symbol: t("Period n", "Période n"),
          meaning: t(
            "Age, not date. Period 1 for the January cohort is February and for the April cohort is May — reading them side by side means reading them at the same age, not in the same month.",
            "L'âge, pas la date. La période 1 de la cohorte de janvier est février, celle de la cohorte d'avril est mai — les lire côte à côte, c'est les lire au même âge, pas au même mois.",
          ),
        },
        {
          symbol: t("Still active", "Encore actif"),
          meaning: t(
            "Whatever \"using the product\" means for you, defined once and never changed mid-analysis. Logging in is the weakest version; the action your product exists for is the useful one.",
            "Ce que « utiliser le produit » veut dire chez toi, défini une fois et jamais changé en cours d'analyse. La connexion est la version la plus faible ; l'action pour laquelle ton produit existe est la version utile.",
          ),
        },
      ],
      note: t(
        "The same arithmetic works on revenue, on orders, on anything per cohort. Retention is just the version everybody draws first, because its shape is the one that answers whether the product works at all.",
        "La même arithmétique marche sur le revenu, sur les commandes, sur n'importe quoi par cohorte. La rétention n'est que la version que tout le monde trace en premier, parce que sa forme répond à la question de savoir si le produit fonctionne.",
      ),
    },
    example: {
      title: t("Two cohorts, the same D30, opposite businesses", "Deux cohortes, le même J30, deux entreprises opposées"),
      steps: [
        t(
          "January cohort: 25% still active at D30, 22% at D60, 21% at D90, 21% at D120. The curve flattens.",
          "Cohorte de janvier : 25 % encore actifs à J30, 22 % à J60, 21 % à J90, 21 % à J120. La courbe s'aplatit.",
        ),
        t(
          "April cohort: 25% at D30, 17% at D60, 11% at D90, 6% at D120. The curve slides toward zero.",
          "Cohorte d'avril : 25 % à J30, 17 % à J60, 11 % à J90, 6 % à J120. La courbe glisse vers zéro.",
        ),
        t(
          "A single blended \"retention rate of 25%\" describes both of them exactly, and hides the only thing that matters: one product keeps a fifth of everyone it ever acquires, the other keeps nobody and is running on new sign-ups.",
          "Un unique « taux de rétention de 25 % » décrit les deux exactement, et masque la seule chose qui compte : un produit garde un cinquième de tous ceux qu'il acquiert, l'autre ne garde personne et tourne sur les nouvelles inscriptions.",
        ),
        t(
          "The flattening level is the number you can multiply: at 1,000 sign-ups a month, the January cohort adds about 210 durable users every month, and they stack. The April cohort adds a spike that is gone by spring.",
          "Le niveau où la courbe s'aplatit est le chiffre qu'on peut multiplier : à 1 000 inscriptions par mois, la cohorte de janvier ajoute environ 210 utilisateurs durables chaque mois, et ils s'empilent. Celle d'avril ajoute un pic disparu au printemps.",
        ),
      ],
      takeaway: t(
        "Nothing here needed a new measurement — the same events, grouped by arrival date instead of averaged, turned one meaningless number into a decision about whether to spend on acquisition at all.",
        "Rien ici n'a demandé une nouvelle mesure — les mêmes événements, groupés par date d'arrivée au lieu d'être moyennés, ont transformé un chiffre sans signification en une décision sur le fait de dépenser en acquisition.",
      ),
    },
    benchmark: [
      t(
        "The signal to look for is the shape, not the level: a curve that flattens at all means a group of users found a lasting reason to stay, and that is the closest thing to a measurable product-market-fit signal. A curve still falling at period six has not found it yet, whatever height it starts from.",
        "Le signal à chercher est la forme, pas le niveau : une courbe qui s'aplatit, quelle qu'en soit la hauteur, veut dire qu'un groupe d'utilisateurs a trouvé une raison durable de rester, et c'est ce qui ressemble le plus à un signal mesurable d'adéquation produit-marché. Une courbe encore en chute à la sixième période ne l'a pas trouvée.",
      ),
      t(
        "Levels vary so widely by category that comparing them across products is close to meaningless: a daily-use consumer app flattening at 20-30% by month three is often cited as strong, while a B2B tool bought by a company would be in trouble at that level. Compare your cohorts to each other, not to someone else's chart.",
        "Les niveaux varient tellement d'une catégorie à l'autre que les comparer entre produits n'a presque aucun sens : une application grand public à usage quotidien qui s'aplatit à 20-30 % au troisième mois est souvent citée comme solide, là où un outil B2B acheté par une entreprise serait en difficulté à ce niveau. Compare tes cohortes entre elles, pas au graphique de quelqu'un d'autre.",
      ),
      t(
        "A cohort small enough that one user is worth more than a percentage point is not a cohort, it is an anecdote with a chart. Below roughly a hundred members, read the direction and ignore the decimals.",
        "Une cohorte assez petite pour qu'un seul utilisateur vaille plus d'un point de pourcentage n'est pas une cohorte, c'est une anecdote avec un graphique. En dessous d'une centaine de membres, lis la direction et ignore les décimales.",
      ),
    ],
    howToImprove: [
      t(
        "Plot by sign-up cohort before anything else. A single blended line is an average over groups that can be moving in opposite directions, and it is the default in most dashboards.",
        "Trace par cohorte d'inscription avant toute chose. Une ligne globale unique est une moyenne sur des groupes qui peuvent aller en sens opposés, et c'est ce que proposent par défaut la plupart des tableaux de bord.",
      ),
      t(
        "Follow at least six periods. A flattening cannot show in three, and three periods is exactly long enough to mistake a slow slide for a plateau.",
        "Suis au moins six périodes. Un aplatissement ne peut pas apparaître en trois, et trois périodes suffisent exactement à confondre une glissade lente avec un plateau.",
      ),
      t(
        "Cut cohorts by acquisition channel too, not only by date. Two channels with the same CAC and different curves are two different decisions, and the blended view makes them look like one.",
        "Découpe aussi les cohortes par canal d'acquisition, pas seulement par date. Deux canaux au même CAC et aux courbes différentes sont deux décisions différentes, que la vue globale fait passer pour une seule.",
      ),
      t(
        "Mark your product changes on the chart. A cohort that behaves differently is only informative if you can say what was different about the product it met.",
        "Marque tes changements de produit sur le graphique. Une cohorte qui se comporte différemment n'apprend quelque chose que si tu peux dire ce qui était différent dans le produit qu'elle a rencontré.",
      ),
    ],
    inTheTour: {
      questionId: "ret-1",
      body: t(
        "The Tour asks whether you track a retention rate at all — D7, D30 or similar — for 20 points, against 7 for watching it loosely and 0 for not tracking it. Cohorts are what turns that yes into something usable: a team can answer 20 with one blended figure and still be unable to say whether the product is getting better or worse, because a blended rate mixes the cohort that arrived last week with the one that arrived last year. If you track a rate but have never plotted it by cohort, you are closer to the 7-point answer than the score suggests.",
        "Le Tour demande si tu suis un taux de rétention — J7, J30 ou équivalent — pour 20 points, contre 7 si tu le regardes de loin et 0 si tu ne le suis pas. Les cohortes sont ce qui transforme ce oui en quelque chose d'exploitable : une équipe peut répondre 20 avec un chiffre global unique et rester incapable de dire si le produit s'améliore ou se dégrade, parce qu'un taux global mélange la cohorte arrivée la semaine dernière et celle de l'an dernier. Si tu suis un taux sans jamais l'avoir tracé par cohorte, tu es plus proche de la réponse à 7 points que la note ne le laisse croire.",
      ),
    },
    faq: [
      {
        question: t("What is the difference between a cohort and a segment?", "Quelle différence entre une cohorte et un segment ?"),
        answer: t(
          "A cohort is defined by when its members arrived; a segment by what they are — country, plan, company size. They answer different questions and are strongest together: segmenting cohorts is how you find out that the curve only flattens for one type of customer, which is usually the most useful finding in the whole exercise.",
          "Une cohorte est définie par le moment où ses membres sont arrivés ; un segment par ce qu'ils sont — pays, offre, taille d'entreprise. Ils répondent à des questions différentes et se combinent très bien : segmenter des cohortes est la façon de découvrir que la courbe ne s'aplatit que pour un type de client, ce qui est en général la trouvaille la plus utile de tout l'exercice.",
        ),
      },
      {
        question: t("Weekly or monthly cohorts?", "Cohortes hebdomadaires ou mensuelles ?"),
        answer: t(
          "Match your product's natural usage cycle, and pick the grain that gives you cohorts big enough to read. A daily tool wants weekly cohorts; something used at month-end can only be read monthly, and reading it weekly produces a sawtooth that looks like a retention problem and is a calendar.",
          "Suis le cycle d'usage naturel de ton produit, et choisis la maille qui donne des cohortes assez grandes pour être lues. Un outil quotidien veut des cohortes hebdomadaires ; un outil utilisé en fin de mois ne se lit qu'au mois, et le lire à la semaine produit une dent de scie qui ressemble à un problème de rétention et n'est qu'un calendrier.",
        ),
      },
      {
        question: t("What does a flattening curve actually mean?", "Que veut dire concrètement une courbe qui s'aplatit ?"),
        answer: t(
          "That a share of each cohort stopped leaving. Those users found a reason to stay that does not wear off, and their number is what acquisition multiplies. It is the difference between a product that accumulates users and one that rents them.",
          "Qu'une part de chaque cohorte a cessé de partir. Ces utilisateurs ont trouvé une raison de rester qui ne s'use pas, et leur nombre est ce que l'acquisition multiplie. C'est la différence entre un produit qui accumule des utilisateurs et un produit qui les loue.",
        ),
      },
      {
        question: t("How big does a cohort need to be?", "Quelle taille minimale pour une cohorte ?"),
        answer: t(
          "Big enough that losing one member does not move the line by a visible amount — around a hundred is the usual floor. Below that, widen the window rather than chase precision: two months of sign-ups read together beat four weekly cohorts that each swing ten points on noise.",
          "Assez grande pour que perdre un membre ne déplace pas la courbe de façon visible — une centaine est le plancher habituel. En dessous, élargis la fenêtre plutôt que de chercher la précision : deux mois d'inscriptions lus ensemble valent mieux que quatre cohortes hebdomadaires qui oscillent chacune de dix points sur du bruit.",
        ),
      },
    ],
  },

  // ——— wave 2.2, lot 2 (2026-09-14) ———
  "dau-mau": {
    formula: {
      expression: t(
        "DAU/MAU = (average daily active users over the month) ÷ (monthly active users) — and the ratio × 30 = days used per month",
        "DAU/MAU = (moyenne des utilisateurs actifs quotidiens sur le mois) ÷ (utilisateurs actifs mensuels) — et le ratio × 30 = jours d'usage par mois",
      ),
      terms: [
        {
          symbol: t("DAU", "DAU"),
          meaning: t(
            "The average of your daily active counts across the month, not one good Tuesday. A single day is a sample of one, and the day you happen to look is rarely representative.",
            "La moyenne de tes comptes quotidiens sur le mois, pas un bon mardi. Un jour unique est un échantillon de un, et celui où tu regardes est rarement représentatif.",
          ),
        },
        {
          symbol: t("MAU", "MAU"),
          meaning: t(
            "Unique users active at least once over the month, each counted once however often they came. Counting them per visit turns the ratio into nonsense.",
            "Les utilisateurs uniques actifs au moins une fois dans le mois, comptés une seule fois quelle que soit leur fréquence. Les compter par visite rend le ratio absurde.",
          ),
        },
        {
          symbol: t("Active", "Actif"),
          meaning: t(
            "The same definition on both sides of the division, and something more demanding than opening the app. A ratio built on \"opened\" measures notifications, not usage.",
            "La même définition des deux côtés de la division, et quelque chose de plus exigeant qu'ouvrir l'application. Un ratio construit sur « a ouvert » mesure les notifications, pas l'usage.",
          ),
        },
      ],
      note: t(
        "The multiplication is the part worth remembering: a ratio of 0.2 is not an abstract score, it is six days out of thirty. Stating it that way is usually enough to settle whether the number is good, because a team knows what its product is for.",
        "La multiplication est ce qu'il faut retenir : un ratio de 0,2 n'est pas une note abstraite, c'est six jours sur trente. Le dire ainsi suffit en général à trancher si le chiffre est bon, parce qu'une équipe sait à quoi sert son produit.",
      ),
    },
    example: {
      title: t("A ratio that describes nobody", "Un ratio qui ne décrit personne"),
      steps: [
        t(
          "50,000 MAU, DAU averaging 10,000 over the month. DAU/MAU = 0.20, so the average user shows up six days out of thirty.",
          "50 000 MAU, des DAU à 10 000 en moyenne sur le mois. DAU/MAU = 0,20, donc l'utilisateur moyen vient six jours sur trente.",
        ),
        t(
          "Split the base and there is no such user. 8,000 people open it about 22 days a month; the other 42,000 open it about 3.",
          "Découpe la base et cet utilisateur n'existe pas. 8 000 personnes l'ouvrent environ 22 jours par mois ; les 42 000 autres, environ 3.",
        ),
        t(
          "Check the arithmetic: (8,000 × 22) + (42,000 × 3) = 302,000 user-days, ÷ 30 = about 10,000 DAU. The same 0.20, from two populations that share nothing.",
          "Vérifie l'arithmétique : (8 000 × 22) + (42 000 × 3) = 302 000 jours-utilisateurs, ÷ 30 = environ 10 000 DAU. Le même 0,20, produit par deux populations qui n'ont rien en commun.",
        ),
        t(
          "The two groups need opposite decisions. The 8,000 are a daily habit to protect and to learn from; the 42,000 are either a weekly product misread as a daily one, or a group that never found the habit at all — and only looking at what they do differently answers which.",
          "Les deux groupes appellent des décisions opposées. Les 8 000 sont une habitude quotidienne à protéger et dont il faut s'inspirer ; les 42 000 sont soit un produit hebdomadaire lu comme quotidien, soit un groupe qui n'a jamais trouvé l'habitude — et seul l'examen de ce qu'ils font différemment le dira.",
        ),
      ],
      takeaway: t(
        "Same lesson as cohort analysis, on a different axis: cohorts split by when people arrived, this splits by how often they come. Both exist because an average over a mixed population describes the average and nobody in it.",
        "Même leçon que l'analyse de cohortes, sur un autre axe : les cohortes découpent par date d'arrivée, ceci découpe par fréquence. Les deux existent parce qu'une moyenne sur une population mélangée décrit la moyenne et personne dedans.",
      ),
    },
    benchmark: [
      t(
        "The threshold most often quoted is 20% for consumer social products, with 50%+ treated as exceptional — figures that come from a category where daily use is the whole point. Quoting them at a product not meant to be opened daily is comparing ambitions, not performance.",
        "Le seuil le plus souvent cité est 20 % pour les produits sociaux grand public, 50 % et plus étant considéré comme exceptionnel — des chiffres issus d'une catégorie où l'usage quotidien est toute la raison d'être. Les citer pour un produit qui n'est pas fait pour être ouvert tous les jours compare des ambitions, pas des performances.",
      ),
      t(
        "A payroll tool at 0.05 — a day and a half a month — is not failing; it is being used exactly when payroll runs. The first question is never \"is the ratio high\" but \"should this product be opened daily at all\", and answering it honestly retires the metric for a good share of B2B software.",
        "Un outil de paie à 0,05 — un jour et demi par mois — n'échoue pas ; il est utilisé exactement quand la paie tombe. La première question n'est jamais « le ratio est-il élevé » mais « ce produit doit-il être ouvert tous les jours », et y répondre honnêtement met la métrique de côté pour une bonne part des logiciels B2B.",
      ),
      t(
        "For a weekly-cycle product, WAU/MAU — weekly over monthly active users — is the same idea at the right grain and is far more readable. Reading a weekly product on a daily ratio produces a number that is always low and never actionable.",
        "Pour un produit à cycle hebdomadaire, WAU/MAU — les actifs hebdomadaires sur les mensuels — est la même idée à la bonne maille et se lit bien mieux. Lire un produit hebdomadaire sur un ratio quotidien produit un chiffre toujours bas et jamais actionnable.",
      ),
    ],
    howToImprove: [
      t(
        "Decide first whether daily use is the right ambition. Half the effort spent lifting this ratio is spent making people open something they had no reason to open, which shows up later as churn.",
        "Décide d'abord si l'usage quotidien est la bonne ambition. La moitié de l'effort dépensé à monter ce ratio sert à faire ouvrir quelque chose que personne n'avait de raison d'ouvrir, ce qui ressort plus tard en churn.",
      ),
      t(
        "Segment the ratio rather than averaging it, and look at what the frequent group does that the others do not. That behaviour, not the ratio, is the thing to design for.",
        "Segmente le ratio au lieu de le moyenner, et regarde ce que le groupe fréquent fait et que les autres ne font pas. C'est ce comportement, pas le ratio, qu'il faut concevoir.",
      ),
      t(
        "Read the ratio and MAU together, always. A rising ratio with a falling MAU is not an improvement: it is casual users leaving, which mechanically raises the average frequency of those who stay.",
        "Lis le ratio et les MAU ensemble, toujours. Un ratio qui monte pendant que les MAU baissent n'est pas une amélioration : ce sont les utilisateurs occasionnels qui partent, ce qui remonte mécaniquement la fréquence moyenne de ceux qui restent.",
      ),
      t(
        "Tie frequency to a real trigger in the user's week — a report that lands, a queue that fills, a teammate who acts — rather than to a notification. A trigger that exists outside your product survives someone turning notifications off.",
        "Rattache la fréquence à un déclencheur réel dans la semaine de l'utilisateur — un rapport qui arrive, une file qui se remplit, un coéquipier qui agit — plutôt qu'à une notification. Un déclencheur qui existe hors de ton produit survit à quelqu'un qui coupe les notifications.",
      ),
    ],
    inTheTour: {
      questionId: "ret-1",
      body: t(
        "The Tour asks whether you track a retention rate at all, for 20 points. DAU/MAU is the companion figure: retention says whether people come back at all, this says how often. They fail in opposite ways, which is why neither replaces the other — retention can look healthy on users who return once a month, and the ratio can look healthy on a shrinking core of enthusiasts. A team answering 20 here and never having multiplied its ratio by 30 is holding a number it has not yet read.",
        "Le Tour demande si tu suis un taux de rétention, pour 20 points. Le DAU/MAU est le chiffre compagnon : la rétention dit si les gens reviennent, celui-ci dit à quelle fréquence. Les deux échouent de façons opposées, et c'est pourquoi aucun ne remplace l'autre — une rétention peut sembler saine sur des utilisateurs qui reviennent une fois par mois, et le ratio peut sembler sain sur un noyau d'enthousiastes qui rétrécit. Une équipe qui répond 20 ici sans jamais avoir multiplié son ratio par 30 tient un chiffre qu'elle n'a pas encore lu.",
      ),
    },
    faq: [
      {
        question: t("What is a good DAU/MAU ratio?", "C'est quoi un bon ratio DAU/MAU ?"),
        answer: t(
          "Multiply it by 30 and ask whether that many days a month is what your product is for. A messaging app at 12 days is struggling; an invoicing tool at 12 days is being used far more than its job requires. The benchmark lives in the product's purpose, not in a table.",
          "Multiplie-le par 30 et demande-toi si ce nombre de jours par mois correspond à ce que fait ton produit. Une messagerie à 12 jours est en difficulté ; un outil de facturation à 12 jours est utilisé bien plus que son travail ne l'exige. La référence est dans la vocation du produit, pas dans un tableau.",
        ),
      },
      {
        question: t("Is DAU/MAU a retention metric?", "Le DAU/MAU est-il une métrique de rétention ?"),
        answer: t(
          "Not quite — it measures frequency inside a month, retention measures survival across months. A cohort can retain beautifully at a low frequency, and a high ratio can sit on a base that halves every quarter. Read the cohort curve for survival and this for intensity.",
          "Pas tout à fait — il mesure la fréquence à l'intérieur d'un mois, la rétention mesure la survie d'un mois à l'autre. Une cohorte peut très bien se retenir à faible fréquence, et un ratio élevé peut reposer sur une base qui fond de moitié chaque trimestre. Lis la courbe de cohorte pour la survie, celui-ci pour l'intensité.",
        ),
      },
      {
        question: t("Should I use WAU/MAU instead?", "Faut-il plutôt utiliser WAU/MAU ?"),
        answer: t(
          "If the natural cycle of your product is a week, yes, and the choice matters more than the precision of either. Pick the grain that matches the rhythm you are actually asking people to adopt, then keep it — switching grains mid-year produces a step change that looks like a result.",
          "Si le cycle naturel de ton produit est la semaine, oui, et ce choix compte plus que la précision de l'un ou l'autre. Prends la maille qui correspond au rythme que tu demandes réellement d'adopter, puis garde-la — changer de maille en cours d'année produit une marche qui ressemble à un résultat.",
        ),
      },
      {
        question: t("Can the ratio rise while the business gets worse?", "Le ratio peut-il monter pendant que l'entreprise va moins bien ?"),
        answer: t(
          "Routinely, and it is the trap to know. Lose your casual users and the ones left are by definition the frequent ones, so the ratio climbs on a shrinking base. That is why it is never quoted alone: the absolute MAU next to it is what says whether the climb was earned.",
          "Couramment, et c'est le piège à connaître. Perds tes utilisateurs occasionnels et ceux qui restent sont par définition les plus fréquents, donc le ratio grimpe sur une base qui rétrécit. C'est pour ça qu'on ne le cite jamais seul : le nombre de MAU à côté est ce qui dit si la hausse a été méritée.",
        ),
      },
    ],
  },

  "viral-coefficient": {
    formula: {
      expression: t(
        "K = invitations sent per user × conversion rate of those invitations",
        "K = invitations envoyées par utilisateur × taux de conversion de ces invitations",
      ),
      terms: [
        {
          symbol: t("Invitations per user", "Invitations par utilisateur"),
          meaning: t(
            "Every exposure a user creates: an explicit invite, a shared link, a public artefact someone else sees. Count them per existing user over a fixed period — and count the users who send zero, which is most of them.",
            "Chaque exposition qu'un utilisateur crée : une invitation explicite, un lien partagé, un livrable public que quelqu'un d'autre voit. Compte-les par utilisateur existant sur une période fixe — et compte les utilisateurs qui n'en envoient aucune, c'est-à-dire la majorité.",
          ),
        },
        {
          symbol: t("Conversion rate", "Taux de conversion"),
          meaning: t(
            "The share of those exposures that become a new user — not a click, a user. A shared result that gets 100 views and 4 new sign-ups converts at 4%.",
            "La part de ces expositions qui deviennent un nouvel utilisateur — pas un clic, un utilisateur. Un résultat partagé qui fait 100 vues et 4 nouvelles inscriptions convertit à 4 %.",
          ),
        },
        {
          symbol: t("K", "K"),
          meaning: t(
            "New users each existing user brings, on average. K = 0.3 means every 100 users bring 30 more, who bring 9, who bring about 3 — a finite boost of about 43%. K > 1 means the chain never ends on its own.",
            "Le nombre de nouveaux utilisateurs que chaque utilisateur existant amène, en moyenne. K = 0,3 veut dire que 100 utilisateurs en amènent 30, qui en amènent 9, qui en amènent environ 3 — un gain fini d'environ 43 %. K > 1 veut dire que la chaîne ne s'arrête jamais d'elle-même.",
          ),
        },
      ],
      note: t(
        "The second number that matters is cycle time: how long from a user joining to their invitees joining. K = 0.5 with a one-day cycle outgrows K = 0.8 with a two-month cycle for a long while. Most \"viral\" products won on cycle time, not on K.",
        "Le second chiffre qui compte est le temps de cycle : combien de temps entre l'arrivée d'un utilisateur et celle de ses invités. K = 0,5 avec un cycle d'un jour dépasse longtemps K = 0,8 avec un cycle de deux mois. La plupart des produits « viraux » ont gagné sur le temps de cycle, pas sur K.",
      ),
    },
    example: {
      title: t("What a K below 1 still buys you", "Ce qu'un K inférieur à 1 rapporte quand même"),
      steps: [
        t(
          "1,000 users. 20% of them share once; each share is seen by 15 people on average: 1,000 × 0.2 × 15 = 3,000 exposures, i.e. 3 per user.",
          "1 000 utilisateurs. 20 % partagent une fois ; chaque partage est vu par 15 personnes en moyenne : 1 000 × 0,2 × 15 = 3 000 expositions, soit 3 par utilisateur.",
        ),
        t("5% of exposures become a user: K = 3 × 0.05 = 0.15.", "5 % des expositions deviennent un utilisateur : K = 3 × 0,05 = 0,15."),
        t(
          "Total users the loop eventually yields from those 1,000: 1,000 ÷ (1 − 0.15) ≈ 1,176. Referral added 17.6% on top of whatever acquisition paid for.",
          "Total d'utilisateurs que la boucle finit par produire à partir de ces 1 000 : 1 000 ÷ (1 − 0,15) ≈ 1 176. Le parrainage a ajouté 17,6 % à ce que l'acquisition a payé.",
        ),
        t(
          "Double the share of users who share (40%) and K becomes 0.3: 1,000 ÷ 0.7 ≈ 1,429, +43%. At a €500 CAC, that loop is worth about €215 of acquisition per paid user.",
          "Double la part d'utilisateurs qui partagent (40 %) et K passe à 0,3 : 1 000 ÷ 0,7 ≈ 1 429, +43 %. À 500 € de CAC, cette boucle vaut environ 215 € d'acquisition par utilisateur payé.",
        ),
      ],
      takeaway: t(
        "You don't need K > 1 for referral to matter. You need to know your K, because it is the multiplier on every euro of acquisition — and a multiplier nobody measures gets optimised by nobody.",
        "Tu n'as pas besoin de K > 1 pour que le parrainage compte. Tu as besoin de connaître ton K, parce que c'est le multiplicateur de chaque euro d'acquisition — et un multiplicateur que personne ne mesure n'est optimisé par personne.",
      ),
    },
    benchmark: [
      t(
        "A sustained K above 1 is rare and almost always temporary — the handful of famous cases (early social networks, some messaging and collaboration tools) had a product that was useless alone. For most products, 0.15-0.5 is the realistic range, and a reliable 0.3 is a serious competitive advantage.",
        "Un K durable au-dessus de 1 est rare et presque toujours temporaire — la poignée de cas célèbres (les premiers réseaux sociaux, certains outils de messagerie et de collaboration) avaient un produit inutile tout seul. Pour la plupart des produits, 0,15-0,5 est la fourchette réaliste, et un 0,3 fiable est un vrai avantage concurrentiel.",
      ),
      t(
        "K is not stable over time: it falls as you saturate the network your early users belong to, and it differs by channel of arrival — users who came through a share tend to share more themselves.",
        "K n'est pas stable dans le temps : il baisse à mesure que tu satures le réseau de tes premiers utilisateurs, et il diffère selon le canal d'arrivée — les utilisateurs venus par un partage ont tendance à partager davantage eux-mêmes.",
      ),
      t(
        "Watch the denominator: a K computed only on users who shared at least once is not a K, it's a share conversion rate. The formula divides by every user, silent majority included.",
        "Attention au dénominateur : un K calculé seulement sur les utilisateurs qui ont partagé au moins une fois n'est pas un K, c'est un taux de conversion des partages. La formule divise par tous les utilisateurs, majorité silencieuse comprise.",
      ),
    ],
    howToImprove: [
      t(
        "Put the share where the value is, not in a menu: the moment a user gets a result worth showing is the moment to offer the share. A referral button on the settings page measures nothing but its own irrelevance.",
        "Mets le partage là où est la valeur, pas dans un menu : le moment où un utilisateur obtient un résultat qui vaut d'être montré est le moment de proposer le partage. Un bouton de parrainage dans les réglages ne mesure que sa propre inutilité.",
      ),
      t(
        "Make what gets shared worth receiving. The conversion half of K depends on what the invitee sees: a rich preview, a personal result, a concrete reason to try it themselves — not a generic \"X invited you\".",
        "Fais en sorte que ce qui est partagé vaille d'être reçu. La moitié conversion de K dépend de ce que l'invité voit : un aperçu riche, un résultat personnel, une raison concrète d'essayer à son tour — pas un « X vous a invité » générique.",
      ),
      t(
        "Shorten the cycle: the faster an invitee becomes a user who shares, the more each K is worth. Remove every step between the shared link and the invitee's own first value.",
        "Raccourcis le cycle : plus vite un invité devient un utilisateur qui partage, plus chaque K rapporte. Retire chaque étape entre le lien partagé et la première valeur de l'invité.",
      ),
      t(
        "Instrument attribution before optimising anything: a reference parameter on every shared link, first touch, deduplicated for self-referrals. Without it you will be tuning a number you can't see.",
        "Instrumente l'attribution avant d'optimiser quoi que ce soit : un paramètre de référence sur chaque lien partagé, premier contact, dédoublonné des auto-parrainages. Sans ça, tu régleras un chiffre que tu ne vois pas.",
      ),
    ],
    inTheTour: {
      questionId: "ref-3",
      body: t(
        // TODO: à relire — revue de copie v1 (2026-09-24), fiche terminologique : « étape »/"stage" pour le lecteur, « pilier »/"pillar" réservé au code.
        "\"Do you measure a viral coefficient or equivalent?\" is the third Referral question — 20 for tracked, 7 for vaguely aware of it, 0 for never measured — after whether a sharing mechanism exists in the product and whether customers actually use it. Referral is the stage many teams score lowest on, and the one where a 0 is most often honest: the mechanism was never built, so there was nothing to measure.",
        "« Mesures-tu un coefficient viral ou équivalent ? » est la troisième question Referral — 20 pour suivi, 7 pour vaguement conscient de son existence, 0 pour jamais mesuré — après l'existence d'un mécanisme de partage dans le produit et son usage réel par les clients. Referral est l'étape où beaucoup d'équipes scorent le plus bas, et celui où un 0 est le plus souvent honnête : le mécanisme n'a jamais été construit, donc il n'y avait rien à mesurer.",
      ),
    },
    faq: [
      {
        question: t("What is a good viral coefficient?", "C'est quoi, un bon coefficient viral ?"),
        answer: t(
          "Above 1, growth would be self-sustaining — and almost nobody sustains that. In practice a good K is one you measure, that is above zero, and that you can move: 0.2 to 0.4 is a strong result for most products, and turns every paid customer into 1.25 to 1.7 customers. Judge it by what it does to your effective CAC, not by whether it crosses 1.",
          "Au-dessus de 1, la croissance s'auto-entretiendrait — et presque personne ne tient ça. En pratique, un bon K est un K que tu mesures, supérieur à zéro, et que tu peux faire bouger : 0,2 à 0,4 est un résultat solide pour la plupart des produits, et transforme chaque client payé en 1,25 à 1,7 clients. Juge-le à ce qu'il fait à ton CAC effectif, pas à son passage au-dessus de 1.",
        ),
      },
      {
        question: t(
          "Viral coefficient or referral rate — what's the difference?",
          "Coefficient viral ou taux de parrainage, quelle différence ?",
        ),
        answer: t(
          "The referral rate is the share of users who refer at least one person; it is one input. K multiplies how many exposures users create by how many of those convert, over all users — it is the output. A 40% referral rate with invitations that never convert gives a K near zero.",
          "Le taux de parrainage est la part d'utilisateurs qui parrainent au moins une personne ; c'est une entrée. K multiplie le nombre d'expositions créées par les utilisateurs par la part qui convertit, sur tous les utilisateurs — c'est la sortie. Un taux de parrainage de 40 % avec des invitations qui ne convertissent jamais donne un K proche de zéro.",
        ),
      },
      {
        question: t(
          "How does Tour de Growth measure its own K?",
          "Comment Tour de Growth mesure-t-il son propre K ?",
        ),
        answer: t(
          "Directly rather than through the formula: every shared result link carries a reference to the result it came from, and a Tour started from such a link is counted as referred — first touch, ignoring people re-taking their own Tour. K is then referred Tours divided by all Tours. It undercounts (a link copied by hand loses the reference), which is the honest direction to be wrong in.",
          "Directement plutôt que par la formule : chaque lien de résultat partagé porte une référence au résultat dont il vient, et un Tour commencé depuis un tel lien est compté comme parrainé — premier contact, en ignorant les gens qui refont leur propre Tour. K est alors le nombre de Tours parrainés divisé par tous les Tours. Ça sous-compte (un lien recopié à la main perd la référence), et c'est la bonne direction dans laquelle se tromper.",
        ),
      },
    ],
  },
  acquisition: {
    formula: {
      expression: t(
        "New paying customers from a channel = visitors it sends × sign-up rate (visitor → sign-up) × conversion rate (sign-up → paying customer)",
        "Nouveaux clients payants d'un canal = visiteurs qu'il envoie × taux d'inscription (visiteur → inscrit) × taux de conversion (inscrit → client payant)",
      ),
      terms: [
        {
          symbol: t("Visitors it sends", "Visiteurs qu'il envoie"),
          meaning: t(
            "Counted per channel, which means attribution: a tagged link (utm_source) on everything you publish, a \"how did you hear about us?\" field for the channels tags can't see. Untagged traffic is the largest channel of most early products, and it is not a channel — it is ignorance.",
            "Comptés par canal, donc avec attribution : un lien tagué (utm_source) sur tout ce que tu publies, un champ « comment nous as-tu connus ? » pour les canaux que les tags ne voient pas. Le trafic non tagué est le premier canal de la plupart des jeunes produits, et ce n'est pas un canal — c'est de l'ignorance.",
          ),
        },
        {
          symbol: t("Sign-up rate (visitor → sign-up)", "Taux d'inscription (visiteur → inscrit)"),
          meaning: t(
            "The share of visitors who create an account, per channel — nothing more: a sign-up is not yet an active user, and not yet a customer. It measures how well the landing page keeps the promise the channel made: the same page converts differently for someone arriving from a friend's link and from a cold ad.",
            "La part des visiteurs qui créent un compte, par canal — rien de plus : un inscrit n'est pas encore un utilisateur actif, ni un client. Il mesure si la page d'accueil tient la promesse que le canal a faite : la même page convertit différemment pour quelqu'un qui arrive du lien d'un ami et d'une publicité froide.",
          ),
        },
        {
          symbol: t("Conversion rate (sign-up → paying customer)", "Taux de conversion (inscrit → client payant)"),
          meaning: t(
            "The share of sign-ups who end up paying. \"Customer\" here means paying, not merely active: an active user is what activation measures; a customer is what makes a channel's cost worth it — which is why CAC below is a cost per customer, not per sign-up. This step is the part acquisition doesn't own — activation and pricing do — yet the only one that turns a channel's volume into revenue. A channel that brings thousands of sign-ups who never activate is a cost, not a source.",
            "La part des inscrits qui finissent par payer. « Client » veut dire ici payant, pas seulement actif : l'utilisateur actif, c'est ce que mesure l'activation ; le client, c'est ce qui rentabilise le coût d'un canal — d'où le CAC plus bas, un coût par client et non par inscrit. Cette étape est la partie qui n'appartient pas à l'acquisition — mais à l'activation et au pricing — et pourtant la seule qui transforme le volume d'un canal en revenu. Un canal qui amène des milliers d'inscrits qui ne s'activent jamais est un coût, pas une source.",
          ),
        },
      ],
      note: t(
        // TODO: à relire — revue de copie v1 (2026-09-24), fiche terminologique : « étape »/"stage" pour le lecteur, « pilier »/"pillar" réservé au code.
        "Multiply the three and you get the channel's yield; divide the channel's cost by that yield and you get its CAC. Acquisition is the stage where a single blended number hides the most: the whole point is to know this per channel.",
        "Multiplie les trois et tu as le rendement du canal ; divise le coût du canal par ce rendement et tu as son CAC. L'acquisition est l'étape où un chiffre mixte cache le plus de choses : tout l'intérêt est de connaître ça par canal.",
      ),
    },
    example: {
      title: t("Two channels, one flattering average", "Deux canaux, une moyenne flatteuse"),
      steps: [
        t(
          "Paid social: 20,000 visitors a month, 3% sign up (600), 8% of those become customers (48). Cost: €12,000. CAC: €250.",
          "Social payant : 20 000 visiteurs par mois, 3 % s'inscrivent (600), 8 % d'entre eux deviennent clients (48). Coût : 12 000 €. CAC : 250 €.",
        ),
        t(
          "Founder-written articles and SEO: 4,000 visitors, 9% sign up (360), 20% become customers (72). Cost: two days of writing a month, say €2,000 of time. CAC: €28.",
          "Articles écrits par le fondateur et SEO : 4 000 visiteurs, 9 % s'inscrivent (360), 20 % deviennent clients (72). Coût : deux jours d'écriture par mois, disons 2 000 € de temps. CAC : 28 €.",
        ),
        t(
          "Blended: 24,000 visitors, 960 sign-ups, 120 customers, €14,000 — a €117 CAC that describes neither channel.",
          "Mixte : 24 000 visiteurs, 960 inscrits, 120 clients, 14 000 € — un CAC de 117 € qui ne décrit aucun des deux canaux.",
        ),
        t(
          "The channel with a sixth of the traffic brings 60% of the customers, at a ninth of the cost. Without per-channel numbers, the obvious next move — \"more ads, traffic is up\" — is exactly wrong.",
          "Le canal qui fait un sixième du trafic amène 60 % des clients, pour un neuvième du coût. Sans chiffres par canal, le geste évident — « plus de pub, le trafic monte » — est exactement le mauvais.",
        ),
      ],
      takeaway: t(
        "A primary channel is not the one with the most visitors. It is the one whose economics you understand well enough to double.",
        "Un canal principal n'est pas celui qui a le plus de visiteurs. C'est celui dont tu comprends assez bien l'économie pour le doubler.",
      ),
    },
    benchmark: [
      t(
        "Most successful products get the bulk of their growth from one or two channels, not ten — the observation behind the \"Bullseye\" method popularised by Traction (Weinberg and Mares): test many cheaply, then concentrate. A spreadsheet of nine channels each bringing 5% is a symptom, not a strategy.",
        "La plupart des produits qui réussissent tirent l'essentiel de leur croissance d'un ou deux canaux, pas de dix — l'observation derrière la méthode « Bullseye » popularisée par Traction (Weinberg et Mares) : tester beaucoup à bas coût, puis concentrer. Un tableur de neuf canaux à 5 % chacun est un symptôme, pas une stratégie.",
      ),
      t(
        "Paid channels scale fast and get more expensive as they scale; organic channels (content, SEO, community, referral) start slow and get cheaper. Early on, paid buys you learning; over time, only the compounding channels keep CAC in check.",
        "Les canaux payants passent vite à l'échelle et renchérissent en grandissant ; les canaux organiques (contenu, SEO, communauté, parrainage) démarrent lentement et deviennent moins chers. Au début, le payant achète de l'apprentissage ; à terme, seuls les canaux qui composent tiennent le CAC.",
      ),
      t(
        "Landing-page sign-up rates are commonly quoted in the 2-5% range for cold paid traffic and well above that for warm traffic (a shared link, a recommendation). If a channel converts far below its peers, the problem is usually the fit between the promise made there and the page, not the page itself.",
        "Les taux d'inscription d'une page d'accueil se citent couramment entre 2 et 5 % pour du trafic payant froid, et bien au-dessus pour du trafic chaud (un lien partagé, une recommandation). Si un canal convertit très en dessous des autres, le problème est en général l'accord entre la promesse faite là-bas et la page, pas la page elle-même.",
      ),
    ],
    howToImprove: [
      t(
        "Instrument attribution before anything else: tag every link you control, ask new users how they found you, and reconcile the two monthly. You cannot pick a primary channel you can't see.",
        "Instrumente l'attribution avant tout : tague chaque lien que tu contrôles, demande aux nouveaux comment ils t'ont trouvé, et rapproche les deux chaque mois. Tu ne peux pas choisir un canal principal que tu ne vois pas.",
      ),
      t(
        "Run cheap, time-boxed tests on several channels with the same success metric — customers, not clicks — and compare them honestly. \"We've tried a second one informally\" is what the Tour scores at 7 because informal tests can't be compared.",
        "Fais des tests courts et peu coûteux sur plusieurs canaux avec la même mesure de succès — des clients, pas des clics — et compare-les honnêtement. « On en a essayé un second, sans grande rigueur » vaut 7 points dans le Tour parce qu'un test informel ne se compare pas.",
      ),
      t(
        "Match the landing page to the channel: the headline that works for someone arriving from a technical forum is not the one for someone arriving from a friend's shared result.",
        "Accorde la page d'accueil au canal : le titre qui marche pour quelqu'un qui arrive d'un forum technique n'est pas celui pour quelqu'un qui arrive du résultat partagé d'un ami.",
      ),
      t(
        "Fix activation before scaling acquisition. Doubling traffic into a product that activates 10% of sign-ups doubles the waste; fixing activation first makes every later channel cheaper.",
        "Répare l'activation avant de faire grandir l'acquisition. Doubler le trafic vers un produit qui active 10 % des inscrits double le gaspillage ; réparer l'activation d'abord rend chaque canal suivant moins cher.",
      ),
      t(
        "Invest in one compounding channel early, even while paid does the volume: content, a community, a product-led loop. It is the only thing that makes year-three CAC lower than year-one CAC.",
        "Investis tôt dans un canal qui compose, même pendant que le payant fait le volume : du contenu, une communauté, une boucle portée par le produit. C'est la seule chose qui rend le CAC de la troisième année plus bas que celui de la première.",
      ),
    ],
    inTheTour: {
      questionId: "acq-1",
      body: t(
        "Acquisition is the first stage of the Tour, and its three questions follow the logic above: is there a primary channel, identified and measured (20 / 7 for \"we have one, but don't track it closely\" / 0 for \"it's scattered\"); has more than one channel been tested, with real comparison; and is the CAC known. A team with real traffic but \"scattered\" channels usually scores in the weak band here — not for lack of growth, for lack of knowing where it comes from.",
        "Acquisition est la première étape du Tour, et ses trois questions suivent la logique ci-dessus : y a-t-il un canal principal, identifié et mesuré (20 / 7 pour « on en a un, mais pas suivi de près » / 0 pour « c'est dispersé ») ; plus d'un canal a-t-il été testé, avec une vraie comparaison ; et le CAC est-il connu. Une équipe avec du vrai trafic mais des canaux « dispersés » atterrit en général dans la bande faible ici — non par manque de croissance, mais faute de savoir d'où elle vient.",
      ),
    },
    faq: [
      {
        question: t("What counts as an acquisition channel?", "Qu'est-ce qui compte comme un canal d'acquisition ?"),
        answer: t(
          "Any repeatable way people first find you that you can name, measure and invest in: search (SEO), paid ads on a given platform, content, a community, partnerships, events, cold outreach, app stores, referral from existing users. \"Word of mouth\" is an outcome of the others, not a channel you can buy more of — unless you build a referral mechanism, at which point it becomes one.",
          "Toute façon reproductible dont les gens te découvrent, que tu peux nommer, mesurer et où tu peux investir : la recherche (SEO), la publicité sur une plateforme donnée, le contenu, une communauté, des partenariats, des événements, la prospection à froid, les magasins d'applications, le parrainage par les utilisateurs existants. Le « bouche-à-oreille » est un résultat des autres, pas un canal dont on peut acheter davantage — sauf si tu construis un mécanisme de parrainage, auquel cas il en devient un.",
        ),
      },
      {
        question: t("Should I focus on one channel or diversify?", "Un seul canal ou plusieurs ?"),
        answer: t(
          "Concentrate first, diversify later. Early on, one channel that works and that you understand beats five you half-run; spreading a small team across many channels usually means none gets the iteration it needs. Diversify once the primary channel is measured, saturating or getting expensive — and treat the second channel as a new experiment, not a copy of the first.",
          "Concentre d'abord, diversifie ensuite. Au début, un canal qui marche et que tu comprends vaut mieux que cinq à moitié pilotés ; répartir une petite équipe sur beaucoup de canaux veut en général dire qu'aucun ne reçoit l'itération dont il a besoin. Diversifie quand le canal principal est mesuré, sature ou renchérit — et traite le second canal comme une nouvelle expérience, pas comme une copie du premier.",
        ),
      },
      {
        question: t("How is acquisition different from marketing?", "Quelle différence entre acquisition et marketing ?"),
        answer: t(
          "Acquisition is the measured part of marketing: the specific channels that bring new users, each with a cost and a yield. Brand, positioning and messaging shape how well every channel converts, but they are not channels themselves. In the AARRR frame, acquisition ends where activation starts — the moment someone who found you actually gets value.",
          "L'acquisition est la partie mesurée du marketing : les canaux précis qui amènent de nouveaux utilisateurs, chacun avec un coût et un rendement. La marque, le positionnement et le message conditionnent la conversion de chaque canal, mais ne sont pas des canaux en eux-mêmes. Dans le cadre AARRR, l'acquisition s'arrête là où l'activation commence — le moment où quelqu'un qui t'a trouvé obtient réellement de la valeur.",
        ),
      },
    ],
  },

  referral: {
    formula: {
      expression: t(
        "Referral share = new users who arrived through an existing user ÷ all new users in the period",
        "Part du parrainage = nouveaux utilisateurs arrivés par un utilisateur existant ÷ tous les nouveaux utilisateurs de la période",
      ),
      terms: [
        {
          symbol: t("Arrived through an existing user", "Arrivés par un utilisateur existant"),
          meaning: t(
            "Anyone whose first visit traces back to a user: a referral code, a shared link with a reference, an invitation, or \"a colleague told me\" in the sign-up survey. Attribution is the whole difficulty — most referral happens in conversations you can't see.",
            "Toute personne dont la première visite remonte à un utilisateur : un code de parrainage, un lien partagé avec une référence, une invitation, ou un « un collègue m'en a parlé » dans le questionnaire d'inscription. L'attribution est toute la difficulté — l'essentiel du parrainage se passe dans des conversations que tu ne vois pas.",
          ),
        },
        {
          symbol: t("All new users", "Tous les nouveaux utilisateurs"),
          meaning: t(
            "Including the paid and organic ones. The share tells you how much of your growth is free and self-generated; it is the number that should rise as the product matures.",
            "Payants et organiques compris. La part te dit quelle proportion de ta croissance est gratuite et auto-générée ; c'est le chiffre qui doit monter à mesure que le produit mûrit.",
          ),
        },
        {
          symbol: t("Viral coefficient (K)", "Coefficient viral (K)"),
          meaning: t(
            "The other lens on the same phenomenon: how many new users each existing user brings. Referral share reads the funnel from the outside; K reads it from the user's side. Both are needed, and the Tour asks about both.",
            "L'autre lecture du même phénomène : combien de nouveaux utilisateurs chaque utilisateur existant amène. La part du parrainage lit l'entonnoir de l'extérieur ; K le lit du côté de l'utilisateur. Les deux sont nécessaires, et le Tour demande les deux.",
          ),
        },
      ],
      note: t(
        "Referral exists whether or not you built anything for it. What a referral mechanism does is make the invisible conversations visible and easier — a link worth sending, a reason to send it, a way to count it.",
        "Le parrainage existe que tu aies construit quelque chose pour lui ou non. Ce qu'un mécanisme de parrainage fait, c'est rendre les conversations invisibles visibles et plus faciles — un lien qui vaut d'être envoyé, une raison de l'envoyer, un moyen de le compter.",
      ),
    },
    example: {
      title: t("Building the mechanism where the value already is", "Construire le mécanisme là où la valeur est déjà"),
      steps: [
        t(
          "A reporting tool notices in its sign-up survey that 30% of new users say \"a colleague showed me a report\". Nothing in the product supports that: reports are PDFs emailed by hand.",
          "Un outil de reporting remarque dans son questionnaire d'inscription que 30 % des nouveaux utilisateurs disent « un collègue m'a montré un rapport ». Rien dans le produit ne soutient ça : les rapports sont des PDF envoyés à la main.",
        ),
        t(
          "It adds a shareable link on every report, with a rich preview and a \"make your own\" button — and a reference on the link so arrivals can be counted.",
          "Il ajoute un lien partageable sur chaque rapport, avec un aperçu riche et un bouton « faites le vôtre » — et une référence sur le lien pour compter les arrivées.",
        ),
        t(
          "Three months later: 1,000 new users a month, 410 traced to a shared report. Referral share: 41%, up from an estimated 30% — and now measured instead of surveyed.",
          "Trois mois plus tard : 1 000 nouveaux utilisateurs par mois, 410 attribués à un rapport partagé. Part du parrainage : 41 %, contre 30 % estimés — et maintenant mesurée au lieu d'être déclarée.",
        ),
        t(
          "At the tool's €120 blended CAC, those 410 users are worth about €49,000 of acquisition a month — for a share button placed where people were already sharing.",
          "Au CAC mixte de 120 € de l'outil, ces 410 utilisateurs valent environ 49 000 € d'acquisition par mois — pour un bouton de partage placé là où les gens partageaient déjà.",
        ),
      ],
      takeaway: t(
        "The mechanism didn't create the referral; the product's value did. It made an existing behaviour easier and countable — which is what most \"viral features\" that work actually do.",
        "Le mécanisme n'a pas créé le parrainage ; la valeur du produit l'a fait. Il a rendu un comportement existant plus facile et comptable — ce que font la plupart des « fonctionnalités virales » qui marchent.",
      ),
    },
    benchmark: [
      t(
        "Referral share varies from near zero (B2B tools used alone, in private) to a majority of growth (products whose output is inherently shown to others). A commonly cited signal that a mechanism is worth building is a high Net Promoter Score: people already recommending you in words will use a link if you give them one.",
        "La part du parrainage va de presque zéro (outils B2B utilisés seul, en privé) à la majorité de la croissance (produits dont la sortie est par nature montrée à d'autres). Un signal couramment cité qu'un mécanisme vaut d'être construit est un Net Promoter Score élevé : des gens qui te recommandent déjà en paroles utiliseront un lien si tu leur en donnes un.",
      ),
      t(
        "Incentivised programmes (\"give €20, get €20\", made famous by Dropbox's extra storage and Uber's ride credits) work when the incentive is the product itself or something close to it; cash for a product people don't love mostly buys low-quality sign-ups.",
        "Les programmes incitatifs (« donnez 20 €, recevez 20 € », rendus célèbres par l'espace de stockage offert par Dropbox et les crédits de course d'Uber) marchent quand l'incitation est le produit lui-même ou quelque chose de proche ; de l'argent pour un produit que les gens n'aiment pas achète surtout des inscriptions de mauvaise qualité.",
      ),
      t(
        "Referred users are usually worth more than average: they arrive pre-qualified by someone who knows them, activate faster and refer more in turn. That is why referral share matters beyond the CAC it saves.",
        "Les utilisateurs parrainés valent en général plus que la moyenne : ils arrivent préqualifiés par quelqu'un qui les connaît, s'activent plus vite et parrainent davantage à leur tour. C'est pourquoi la part du parrainage compte au-delà du CAC qu'elle économise.",
      ),
    ],
    howToImprove: [
      t(
        "Find where sharing already happens — a survey question, support tickets, exports — and build the mechanism there, not in a menu nobody opens.",
        "Trouve là où le partage se produit déjà — une question d'enquête, les tickets de support, les exports — et construis le mécanisme là, pas dans un menu que personne n'ouvre.",
      ),
      t(
        "Give people something worth sending: a result, a report, a personal artefact with a rich preview. A referral code is a favour asked; a shared result is a gift given.",
        "Donne aux gens quelque chose qui vaut d'être envoyé : un résultat, un rapport, un livrable personnel avec un aperçu riche. Un code de parrainage est un service demandé ; un résultat partagé est un cadeau fait.",
      ),
      t(
        "Make the recipient's first step trivial: land them on the thing that was shared, then on their own first value — not on a sign-up wall.",
        "Rends le premier pas du destinataire trivial : fais-le atterrir sur ce qui a été partagé, puis sur sa propre première valeur — pas sur un mur d'inscription.",
      ),
      t(
        "Count it. A reference on every shared link, first-touch attribution, and a monthly look at referral share and K. \"Only in communication, not the product\" scores 7 in the Tour because a mechanism outside the product can't be measured or improved.",
        "Compte-le. Une référence sur chaque lien partagé, une attribution au premier contact, et un regard mensuel sur la part du parrainage et sur K. « Seulement en communication, pas dans le produit » vaut 7 dans le Tour parce qu'un mécanisme hors du produit ne se mesure ni ne s'améliore.",
      ),
    ],
    inTheTour: {
      questionId: "ref-1",
      body: t(
        // TODO: à relire — revue de copie v1 (2026-09-24), fiche terminologique : « étape »/"stage" pour le lecteur, « pilier »/"pillar" réservé au code.
        "The three Referral questions climb one ladder: does a sharing or referral mechanism exist in the product (20 / 7 if it only lives in your communication / 0); is it actually used by customers, meaningfully; and is a viral coefficient or equivalent measured. It is the stage where a 0/20 is common and, unlike the others, often a decision rather than a blind spot — many good products simply never built one. The Tour's own share button, and the \"take your own Tour\" link on every shared result, are its answer to the first question.",
        "Les trois questions Referral gravissent une même échelle : un mécanisme de partage ou de parrainage existe-t-il dans le produit (20 / 7 s'il ne vit que dans ta communication / 0) ; est-il réellement utilisé par les clients, de façon significative ; et un coefficient viral ou équivalent est-il mesuré. C'est l'étape où un 0/20 est courant et, contrairement aux autres, souvent une décision plutôt qu'un angle mort — beaucoup de bons produits n'en ont simplement jamais construit. Le bouton de partage du Tour, et le lien « fais ton propre Tour » sur chaque résultat partagé, sont sa réponse à la première question.",
      ),
    },
    faq: [
      {
        question: t("Is referral the same as word of mouth?", "Le parrainage, c'est le bouche-à-oreille ?"),
        answer: t(
          // TODO: à relire — revue de copie v1 (2026-09-24), fiche terminologique : « étape »/"stage" pour le lecteur, « pilier »/"pillar" réservé au code.
          "Word of mouth is referral you can't see: recommendations made in conversations, without a link or a code. Referral as a growth stage is the effort to make that behaviour easier, more frequent and measurable. A product with strong word of mouth and no mechanism is leaving its cheapest channel unmanaged.",
          "Le bouche-à-oreille est du parrainage que tu ne vois pas : des recommandations faites en conversation, sans lien ni code. Le parrainage comme étape de croissance, c'est l'effort pour rendre ce comportement plus facile, plus fréquent et mesurable. Un produit avec un fort bouche-à-oreille et aucun mécanisme laisse son canal le moins cher sans pilotage.",
        ),
      },
      {
        question: t("Do referral programmes need an incentive?", "Un programme de parrainage a-t-il besoin d'une récompense ?"),
        answer: t(
          "Not necessarily, and the wrong one hurts. If the product's output is worth showing (a result, a design, a report), the share itself is the incentive and a reward mostly adds noise. Incentives make sense when the value is private and the ask is a favour — and they work best when paid in product (storage, credits, features) rather than cash.",
          "Pas forcément, et la mauvaise fait du mal. Si la sortie du produit vaut d'être montrée (un résultat, un design, un rapport), le partage est sa propre incitation et une récompense ajoute surtout du bruit. Les incitations ont du sens quand la valeur est privée et que la demande est un service — et elles marchent mieux payées en produit (stockage, crédits, fonctionnalités) qu'en argent.",
        ),
      },
      {
        question: t(
          "What's the difference between referral and a growth loop?",
          "Quelle différence entre parrainage et boucle de croissance ?",
        ),
        answer: t(
          "Referral is one kind of growth loop — the viral one, where a user brings the next user. Growth loops also include content loops (what users create attracts search traffic) and paid loops (revenue funds the next round of acquisition). Referral is usually the cheapest loop to start, because it runs on a behaviour that already exists.",
          "Le parrainage est une sorte de boucle de croissance — la boucle virale, où un utilisateur amène le suivant. Les boucles de croissance comprennent aussi les boucles de contenu (ce que les utilisateurs créent attire du trafic de recherche) et les boucles payantes (le revenu finance l'acquisition suivante). Le parrainage est en général la boucle la moins chère à lancer, parce qu'elle repose sur un comportement qui existe déjà.",
        ),
      },
    ],
  },

  revenue: {
    formula: {
      expression: t(
        "MRR next month = MRR this month + new + expansion − contraction − churned",
        "MRR du mois prochain = MRR de ce mois + nouveau + expansion − contraction − résilié",
      ),
      terms: [
        {
          symbol: t("New MRR", "Nouveau MRR"),
          meaning: t(
            "What new customers add: the output of acquisition and activation, priced. The only term most early teams look at.",
            "Ce que les nouveaux clients ajoutent : la sortie de l'acquisition et de l'activation, une fois tarifée. Le seul terme que la plupart des jeunes équipes regardent.",
          ),
        },
        {
          symbol: t("Expansion MRR", "MRR d'expansion"),
          meaning: t(
            "Existing customers paying more: upgrades, added seats, usage, cross-sold modules. The term an expansion playbook exists to grow — and the one that can make net revenue churn negative.",
            "Des clients existants qui paient plus : montées en gamme, sièges ajoutés, usage, modules vendus en complément. La composante de l'identité qu'un playbook d'expansion existe pour faire grandir — et celle qui peut rendre le churn revenu net négatif.",
          ),
        },
        {
          symbol: t("Contraction and churned MRR", "MRR de contraction et résilié"),
          meaning: t(
            "Downgrades and cancellations. Together with expansion they form net revenue retention (NRR): what last year's customers pay this year, as a share of what they paid then.",
            "Rétrogradations et résiliations. Avec l'expansion, ils forment la rétention nette de revenu (NRR) : ce que les clients de l'an dernier paient cette année, en part de ce qu'ils payaient alors.",
          ),
        },
      ],
      note: t(
        // TODO: à relire — revue de copie v1 (2026-09-24), fiche terminologique : « étape »/"stage" pour le lecteur, « pilier »/"pillar" réservé au code.
        "Pricing sets the size of every term. A price chosen \"a bit arbitrarily\" is the single most common unforced error in this stage: it caps new MRR, leaves no room for expansion, and is almost never revisited because changing it feels risky. Testing it is what the Tour's first Revenue question asks about.",
        "Le pricing fixe la taille de chaque terme. Un prix choisi « un peu arbitrairement » est l'erreur non forcée la plus courante de cette étape : il plafonne le nouveau MRR, ne laisse aucune place à l'expansion, et n'est presque jamais revu parce que le changer paraît risqué. Le tester, c'est ce que demande la première question Revenue du Tour.",
      ),
    },
    example: {
      // TODO: à relire — revue de copie v1 (2026-09-24), fiche terminologique : « étape »/"stage" pour le lecteur, « pilier »/"pillar" réservé au code.
      title: t("The same month, read as the Revenue stage", "Le même mois, lu comme l'étape Revenue"),
      steps: [
        t(
          "Start of month: €20,000 MRR from 400 customers (€50 average). New customers: 40 at €50 = +€2,000.",
          "Début de mois : 20 000 € de MRR pour 400 clients (50 € en moyenne). Nouveaux clients : 40 à 50 € = +2 000 €.",
        ),
        t(
          "Expansion: 15 customers move from the €50 plan to the €110 one, +€900. Contraction: 8 downgrade, −€400. Churn: 12 cancel, −€600.",
          "Expansion : 15 clients passent de l'offre à 50 € à celle à 110 €, +900 €. Contraction : 8 rétrogradent, −400 €. Churn : 12 résilient, −600 €.",
        ),
        t(
          "End of month: 20,000 + 2,000 + 900 − 400 − 600 = €21,900. Growth: +9.5%. Net revenue retention on the existing base: (20,000 + 900 − 400 − 600) ÷ 20,000 = 99.5%.",
          "Fin de mois : 20 000 + 2 000 + 900 − 400 − 600 = 21 900 €. Croissance : +9,5 %. Rétention nette de revenu sur la base existante : (20 000 + 900 − 400 − 600) ÷ 20 000 = 99,5 %.",
        ),
        t(
          "Now suppose pricing had been tested and the upper plan priced at €130 instead of €110: the same 15 upgrades bring +€1,200, NRR reaches 101%, and the business grows even in a month with zero new customers.",
          "Suppose maintenant que le pricing ait été testé et l'offre supérieure fixée à 130 € au lieu de 110 € : les mêmes 15 montées en gamme rapportent +1 200 €, la NRR atteint 101 %, et l'activité grandit même un mois sans aucun nouveau client.",
        ),
      ],
      takeaway: t(
        "Revenue is not \"how much came in\". It is whether each of these five terms is known, and whether the two you control most directly — price and expansion — have ever been tested rather than assumed.",
        "Le revenu, ce n'est pas « combien est rentré ». C'est si chacun de ces cinq termes est connu, et si les deux que tu contrôles le plus directement — le prix et l'expansion — ont un jour été testés plutôt que supposés.",
      ),
    },
    benchmark: [
      t(
        "Net revenue retention is the number SaaS investors read first: above 100% means the existing base grows on its own; the best B2B companies report 110-130%, driven by expansion. Below 90%, growth has to outrun a leaking base.",
        "La rétention nette de revenu est le chiffre que les investisseurs SaaS lisent en premier : au-dessus de 100 %, la base existante grandit toute seule ; les meilleures entreprises B2B affichent 110-130 %, portées par l'expansion. Sous 90 %, la croissance doit courir plus vite qu'une base qui fuit.",
      ),
      t(
        // TODO: à relire — revue de copie v1 (2026-09-24), fiche terminologique : « étape »/"stage" pour le lecteur, « pilier »/"pillar" réservé au code.
        "The LTV:CAC rule of thumb of about 3:1 lives in this stage too — it is where price, margin and lifetime meet the cost of acquisition. Scoring the stage on \"has the model been tested?\" rather than on the amount is deliberate: the amount follows from the terms above, not the reverse.",
        "La règle empirique LTV:CAC d'environ 3:1 vit aussi dans cette étape — c'est là que prix, marge et durée de vie rencontrent le coût d'acquisition. Noter l'étape sur « le modèle a-t-il été testé ? » plutôt que sur le montant est délibéré : le montant découle des termes ci-dessus, pas l'inverse.",
      ),
      t(
        "Pricing changes are less dangerous than they feel: most price increases on a product people rely on lose a small share of customers and gain far more in revenue, and grandfathering existing customers removes most of the risk. The costly move is never testing.",
        "Les changements de prix sont moins dangereux qu'ils n'en ont l'air : la plupart des hausses sur un produit dont les gens dépendent perdent une petite part de clients et gagnent bien plus en revenu, et maintenir l'ancien tarif aux clients existants retire l'essentiel du risque. Le geste coûteux, c'est de ne jamais tester.",
      ),
    ],
    howToImprove: [
      t(
        "Test the price against alternatives — two landing pages, two plans, a cohort at a new price — instead of choosing it once and defending it forever. Willingness-to-pay interviews with ten customers beat a competitor grid.",
        "Teste le prix face à des alternatives — deux pages, deux offres, une cohorte à un nouveau tarif — au lieu de le choisir une fois et de le défendre pour toujours. Dix entretiens de disposition à payer valent mieux qu'une grille de concurrents.",
      ),
      t(
        "Build a pricing model with room to grow: seats, usage, tiers, add-ons. Expansion MRR only exists if there is somewhere for a happy customer to go.",
        "Construis un modèle de prix avec de la place pour grandir : sièges, usage, paliers, options. Le MRR d'expansion n'existe que s'il y a quelque part où un client satisfait peut aller.",
      ),
      t(
        "Write the expansion playbook down: which signal (usage near a limit, a second team, a feature request) triggers which offer, made by whom, when. \"Some ideas, not systematic\" is the 7-point answer because ideas don't compound.",
        "Écris le playbook d'expansion : quel signal (usage proche d'une limite, une seconde équipe, une demande de fonctionnalité) déclenche quelle offre, faite par qui, quand. « Quelques idées, rien de systématique » vaut 7 points parce que des idées ne composent pas.",
      ),
      t(
        "Track the five terms of the MRR identity monthly, per plan. Revenue that is only read as a total hides which of the five is quietly going wrong.",
        "Suis les cinq termes de l'identité du MRR chaque mois, par offre. Un revenu lu seulement en total cache lequel des cinq est en train de dérailler en silence.",
      ),
    ],
    inTheTour: {
      questionId: "rev-1",
      body: t(
        "Revenue is the fifth stage of the Tour, and its questions are about knowledge, not amounts: has the pricing model been tested, not just chosen (20 for tested against alternatives, 7 for chosen with some reasoning, 0 for picked arbitrarily); is the LTV known, even roughly; and is there an expansion playbook, active and used. A product that charges real money but answers 7 to all three lands in the weak band — the score is not about what you earn but about whether the model behind it has ever met reality.",
        "Revenue est la cinquième étape du Tour, et ses questions portent sur la connaissance, pas sur les montants : le modèle de pricing a-t-il été testé, pas juste choisi (20 pour testé face à des alternatives, 7 pour choisi avec une logique, 0 pour choisi un peu arbitrairement) ; la LTV est-elle connue, même grossièrement ; et existe-t-il un playbook d'expansion, actif et utilisé. Un produit qui facture de l'argent réel mais répond 7 aux trois atterrit dans la bande faible — le score ne dit pas ce que tu gagnes, mais si le modèle derrière a un jour rencontré la réalité.",
      ),
    },
    faq: [
      {
        question: t(
          "Why does the Tour score Revenue on testing rather than on revenue itself?",
          "Pourquoi le Tour note-t-il Revenue sur le test plutôt que sur le revenu lui-même ?",
        ),
        answer: t(
          "Because the amount is a lagging output of the other four stages, while the model is a decision you own. Two products with the same MRR can be in opposite situations: one with a tested price, a known LTV and an expansion path, the other with an arbitrary price it dares not touch. The second will hit a wall the first won't — and the number wouldn't have told you.",
          "Parce que le montant est une sortie retardée des quatre autres étapes, alors que le modèle est une décision qui t'appartient. Deux produits au même MRR peuvent être dans des situations opposées : l'un avec un prix testé, une LTV connue et un chemin d'expansion, l'autre avec un prix arbitraire qu'il n'ose pas toucher. Le second frappera un mur que le premier évitera — et le chiffre ne te l'aurait pas dit.",
        ),
      },
      {
        question: t("What's the difference between MRR, ARR and revenue?", "Quelle différence entre MRR, ARR et chiffre d'affaires ?"),
        answer: t(
          "MRR is monthly recurring revenue: the subscription income you can expect next month if nothing changes, excluding one-off fees. ARR, annual recurring revenue, is MRR × 12, used for annual contracts and fundraising. Revenue, in accounting terms, is what was actually recognised in a period, one-offs included. Growth teams steer on MRR because it moves fast enough to learn from.",
          "Le MRR est le revenu récurrent mensuel : ce que les abonnements rapporteront le mois prochain si rien ne change, hors frais ponctuels. L'ARR, le revenu récurrent annuel, est le MRR × 12, utilisé pour les contrats annuels et les levées de fonds. Le chiffre d'affaires, au sens comptable, est ce qui a réellement été reconnu sur une période, ponctuels compris. Les équipes growth pilotent au MRR parce qu'il bouge assez vite pour en apprendre quelque chose.",
        ),
      },
      {
        question: t("When should a free product start charging?", "Quand un produit gratuit devrait-il commencer à facturer ?"),
        answer: t(
          "Earlier than feels comfortable — because the first price test teaches you more about value than any survey, and because a user base built on free is harder to convert later than one that always knew a paid tier existed. Charging a small number of customers a real price beats charging nobody: it answers the pricing question the Tour asks with evidence instead of reasoning.",
          "Plus tôt que ce qui paraît confortable — parce que le premier test de prix t'apprend plus sur la valeur que n'importe quelle enquête, et parce qu'une base construite sur le gratuit est plus dure à convertir ensuite qu'une base qui a toujours su qu'un palier payant existait. Facturer un vrai prix à un petit nombre de clients vaut mieux que ne facturer personne : ça répond à la question de pricing du Tour avec des preuves plutôt qu'avec une logique.",
        ),
      },
    ],
  },
  aarrr: {
    formula: {
      expression: t(
        "Paying, retained customers = acquired × activation rate × retention rate × paying rate — and referral feeds the first term with K × the last",
        "Clients payants et fidèles = acquis × taux d'activation × taux de rétention × taux de passage au payant — et le parrainage réalimente le premier terme avec K × le dernier",
      ),
      terms: [
        {
          symbol: t("Each stage is a rate", "Chaque étape est un taux"),
          meaning: t(
            "Acquisition is the only absolute number; every other stage is the share of the previous one that made it through. That is why the framework is drawn as a funnel, and why a weak stage late in the funnel wastes everything spent before it.",
            "L'acquisition est le seul nombre absolu ; chaque autre étape est la part de la précédente qui est passée. C'est pour ça que le cadre se dessine en entonnoir, et qu'une étape faible en bas gaspille tout ce qui a été dépensé avant.",
          ),
        },
        {
          symbol: t("The stages multiply", "Les étapes se multiplient"),
          meaning: t(
            "Which is the practical point of the whole model: a 10% improvement at each of four stages is not +40% at the end but 1.1⁴ ≈ +46%, and a stage at zero makes every other stage worthless.",
            "Ce qui est l'intérêt pratique de tout le modèle : 10 % de mieux à chacune de quatre étapes ne fait pas +40 % à la fin mais 1,1⁴ ≈ +46 %, et une étape à zéro rend toutes les autres inutiles.",
          ),
        },
        {
          symbol: t("Referral closes the loop", "Le parrainage referme la boucle"),
          meaning: t(
            "The one stage that feeds back into the top: each retained customer brings K more acquired ones. It is listed last but changes the economics of the first.",
            "La seule étape qui réalimente le haut : chaque client fidèle amène K nouveaux acquis. Elle est listée en dernier mais change l'économie de la première.",
          ),
        },
      ],
      note: t(
        "The order was named by Dave McClure in 2007 as \"Startup Metrics for Pirates\" — the acronym is the joke, the funnel is the point. Variants swap the last two (Revenue before Referral) or add Awareness in front (AAARRR); the arithmetic is the same.",
        "L'ordre a été nommé par Dave McClure en 2007 sous le titre « Startup Metrics for Pirates » — l'acronyme est la blague, l'entonnoir est le fond. Des variantes intervertissent les deux dernières (Revenue avant Referral) ou ajoutent Awareness devant (AAARRR) ; l'arithmétique est la même.",
      ),
    },
    example: {
      title: t("Where a founder's month actually goes", "Où passe réellement le mois d'un fondateur"),
      steps: [
        t(
          "10,000 visitors acquired. 25% activate (2,500). 40% of those are still active at month three (1,000). 10% of those pay (100 customers).",
          "10 000 visiteurs acquis. 25 % s'activent (2 500). 40 % d'entre eux sont encore actifs au troisième mois (1 000). 10 % d'entre eux paient (100 clients).",
        ),
        t(
          "Option A, the reflex: double acquisition to 20,000 visitors. Result: 200 customers, at double the acquisition cost.",
          "Option A, le réflexe : doubler l'acquisition à 20 000 visiteurs. Résultat : 200 clients, pour le double du coût d'acquisition.",
        ),
        t(
          "Option B: leave acquisition alone, take activation from 25% to 35% and retention from 40% to 50% — two onboarding and product changes. 10,000 × 0.35 × 0.5 × 0.1 = 175 customers, at zero extra acquisition cost.",
          "Option B : ne pas toucher à l'acquisition, passer l'activation de 25 à 35 % et la rétention de 40 à 50 % — deux changements d'onboarding et de produit. 10 000 × 0,35 × 0,5 × 0,1 = 175 clients, pour zéro coût d'acquisition en plus.",
        ),
        t(
          "Then double acquisition: 350 customers. The same spend that bought 200 in option A buys 350 after B — because the funnel was fixed before it was fed.",
          "Puis double l'acquisition : 350 clients. La même dépense qui achetait 200 clients en option A en achète 350 après B — parce que l'entonnoir a été réparé avant d'être alimenté.",
        ),
      ],
      takeaway: t(
        "The framework's real instruction is an order of operations: measure all five, find the weakest, fix it, then pour. Which is also, stage by stage, what the Tour scores.",
        "La vraie consigne du cadre est un ordre des opérations : mesurer les cinq, trouver la plus faible, la réparer, puis alimenter. Ce qui est aussi, étape par étape, ce que le Tour note.",
      ),
    },
    benchmark: [
      t(
        "There is no benchmark for \"AARRR\" as a whole — each stage has its own (see CAC, activation, retention, viral coefficient, revenue). What is consistent across companies is the shape of the problem: one or two stages dragging the rest, rarely all five weak at once.",
        "Il n'y a pas de benchmark pour « AARRR » en bloc — chaque étape a le sien (voir CAC, activation, rétention, coefficient viral, revenu). Ce qui est constant d'une entreprise à l'autre, c'est la forme du problème : une ou deux étapes qui tirent le reste vers le bas, rarement les cinq faibles à la fois.",
      ),
      t(
        "The stage most often neglected in early-stage products is retention: it is the slowest to measure (cohorts have to age), the least visible at a launch, and the one every other stage depends on. Acquisition is the most often over-invested, for the opposite reasons.",
        "L'étape la plus souvent négligée dans un produit jeune est la rétention : la plus lente à mesurer (il faut que les cohortes vieillissent), la moins visible à un lancement, et celle dont toutes les autres dépendent. L'acquisition est la plus souvent sur-investie, pour les raisons inverses.",
      ),
      t(
        "A useful sanity check: can you name one number per stage, today, from memory? Teams that can are rare; the Tour's fifteen questions are, in effect, that check in three minutes.",
        "Un test de bon sens utile : peux-tu citer un chiffre par étape, aujourd'hui, de mémoire ? Les équipes qui le peuvent sont rares ; les quinze questions du Tour sont, en pratique, ce test en trois minutes.",
      ),
    ],
    howToImprove: [
      t(
        "Put one metric per stage on a single page and look at it weekly. Not fifteen dashboards — five numbers, one funnel.",
        "Mets une métrique par étape sur une seule page et regarde-la chaque semaine. Pas quinze tableaux de bord — cinq chiffres, un entonnoir.",
      ),
      t(
        "Work the weakest stage first, even when it is the least exciting. Fixing retention before acquisition feels slow; it is the only order in which the arithmetic works.",
        "Travaille d'abord l'étape la plus faible, même quand c'est la moins excitante. Réparer la rétention avant l'acquisition paraît lent ; c'est le seul ordre dans lequel l'arithmétique fonctionne.",
      ),
      t(
        "Define each stage's metric in a sentence anyone in the team can repeat: what counts as activated, what counts as retained, what counts as referred. Most disagreements about growth are disagreements about definitions.",
        "Définis la métrique de chaque étape en une phrase que n'importe qui dans l'équipe peut répéter : ce qui compte comme activé, comme fidèle, comme parrainé. La plupart des désaccords sur la croissance sont des désaccords de définition.",
      ),
      t(
        "Re-run the diagnosis every quarter. The weakest stage moves: fix activation and retention becomes the bottleneck, fix retention and acquisition is suddenly worth scaling.",
        "Refais le diagnostic chaque trimestre. L'étape la plus faible se déplace : répare l'activation et la rétention devient le goulot, répare la rétention et l'acquisition mérite soudain d'être mise à l'échelle.",
      ),
    ],
    inTheTour: {
      questionId: "acq-1",
      body: t(
        "The Tour is this framework turned into fifteen questions: three per stage, each worth 20, 7 or 0, averaged into a stage score out of 20, the five summed into a score out of 100. The first question opens the Acquisition stage; the last closes Revenue. What the result page shows first is not the total but the weakest stage — because that, not the sum, is what the framework tells you to work on.",
        "Le Tour est ce cadre transformé en quinze questions : trois par étape, chacune valant 20, 7 ou 0, moyennées en un score d'étape sur 20, les cinq additionnés en un score sur 100. La première question ouvre l'étape Acquisition ; la dernière ferme Revenue. Ce que la page de résultat montre en premier n'est pas le total mais l'étape la plus faible — parce que c'est elle, pas la somme, que le cadre te dit de travailler.",
      ),
    },
    faq: [
      {
        question: t("What does AARRR stand for?", "Que veut dire AARRR ?"),
        answer: t(
          "Acquisition, Activation, Retention, Referral, Revenue: the five stages a user goes through, from first hearing of a product to paying for it and bringing others. Dave McClure coined it in 2007 as \"pirate metrics\" because the acronym sounds like one. Some versions put Revenue before Referral; the order of the last two matters less than the idea that each stage is a share of the previous one.",
          // TODO: à relire — revue de copie v1 (2026-09-24) : nom d'étape « Retention » sans accent, comme partout ailleurs (R2-12) ; l'accent reste au nom commun.
          "Acquisition, Activation, Retention, Referral (parrainage), Revenue (revenu) : les cinq étapes qu'un utilisateur traverse, de la première fois qu'il entend parler d'un produit au moment où il paie et en amène d'autres. Dave McClure l'a forgé en 2007 sous le nom de « pirate metrics » parce que l'acronyme sonne comme un cri de pirate. Certaines versions mettent Revenue avant Referral ; l'ordre des deux dernières compte moins que l'idée que chaque étape est une part de la précédente.",
        ),
      },
      {
        question: t(
          "Is AARRR still relevant, or has it been replaced by growth loops?",
          "AARRR est-il encore pertinent, ou remplacé par les boucles de croissance ?",
        ),
        answer: t(
          "Both are true. Loops describe how the output of one cycle feeds the next (a shared result brings a new user who shares); AARRR describes the stages inside each cycle. You need the funnel to find where users drop and the loop to understand why growth compounds — or doesn't. Teams that dropped the funnel for loops usually rediscover it the first time they ask \"where exactly are we losing people?\".",
          "Les deux sont vrais. Les boucles décrivent comment la sortie d'un cycle alimente le suivant (un résultat partagé amène un nouvel utilisateur qui partage) ; AARRR décrit les étapes à l'intérieur de chaque cycle. Il faut l'entonnoir pour trouver où les utilisateurs décrochent et la boucle pour comprendre pourquoi la croissance compose — ou pas. Les équipes qui ont abandonné l'entonnoir pour les boucles le redécouvrent en général la première fois qu'elles demandent « où exactement perd-on des gens ? ».",
        ),
      },
      {
        question: t(
          "How do I apply AARRR to a B2B product with a sales team?",
          "Comment appliquer AARRR à un produit B2B avec une équipe commerciale ?",
        ),
        answer: t(
          "The stages hold; the units change. Acquisition becomes qualified leads by channel, activation becomes the first real use inside the customer's team (not the signed contract), retention becomes renewal and usage depth, referral becomes references and expansion into sister teams, revenue becomes net revenue retention. The trap is to let the CRM's stages replace the user's: a closed deal is a revenue event, not an activation.",
          "Les étapes tiennent ; les unités changent. L'acquisition devient les leads qualifiés par canal, l'activation le premier vrai usage dans l'équipe du client (pas le contrat signé), la rétention le renouvellement et la profondeur d'usage, le parrainage les références et l'extension aux équipes voisines, le revenu la rétention nette de revenu. Le piège est de laisser les étapes du CRM remplacer celles de l'utilisateur : un contrat signé est un événement de revenu, pas une activation.",
        ),
      },
    ],
  },

  "aha-moment": {
    formula: {
      expression: t(
        "Lift of a candidate action = share of retained users who did it in week 1 ÷ share of churned users who did it in week 1",
        "Levier d'une action candidate = part des utilisateurs fidèles qui l'ont faite en semaine 1 ÷ part des utilisateurs partis qui l'ont faite en semaine 1",
      ),
      terms: [
        {
          symbol: t("Candidate action", "Action candidate"),
          meaning: t(
            "Any early, observable event: created a project, invited someone, imported data, hit a threshold (7 friends, 3 reports, 1 payment). Test several; the winner is rarely the feature the team is proudest of.",
            "Tout événement précoce et observable : a créé un projet, invité quelqu'un, importé des données, franchi un seuil (7 amis, 3 rapports, 1 paiement). Teste plusieurs ; la gagnante est rarement la fonctionnalité dont l'équipe est la plus fière.",
          ),
        },
        {
          symbol: t("Retained vs. churned", "Fidèles vs partis"),
          meaning: t(
            "Retained: still active after three of your natural cycles (week three for a weekly tool). Churned: gone before the end of the first one. The middle is noise; leave it out of the comparison.",
            "Fidèles : encore actifs après trois de tes cycles naturels (la troisième semaine pour un outil hebdomadaire). Partis : disparus avant la fin du premier. Le milieu est du bruit ; laisse-le hors de la comparaison.",
          ),
        },
        {
          symbol: t("Lift", "Levier"),
          meaning: t(
            "A lift of 1 means the action doesn't distinguish the two groups. A lift of 5 or more, on an action a majority of retained users did, is a strong candidate. Pick the earliest strong one you can plausibly get most new users to do.",
            "Un levier de 1 veut dire que l'action ne distingue pas les deux groupes. Un levier de 5 ou plus, sur une action qu'une majorité des fidèles a faite, est une candidate solide. Choisis la plus précoce que tu peux raisonnablement faire faire à la plupart des nouveaux.",
          ),
        },
      ],
      note: t(
        "This finds correlation, not cause. Users who invite a teammate in week one don't stay because they invited someone; they invited someone because they already intended to use the tool with their team. The action is a visible proxy for that intent — which is exactly what you need to measure and to design onboarding towards.",
        "Ça trouve une corrélation, pas une cause. Les utilisateurs qui invitent un collègue la première semaine ne restent pas parce qu'ils ont invité quelqu'un ; ils l'ont invité parce qu'ils avaient déjà l'intention d'utiliser l'outil en équipe. L'action est un indicateur visible de cette intention — exactement ce qu'il faut mesurer et vers quoi concevoir l'onboarding.",
      ),
    },
    example: {
      title: t("The famous one, and a small one", "Le célèbre, et un petit"),
      steps: [
        t(
          "Facebook, around 2008: users who reached 7 friends within 10 days retained far better than those who didn't. The number was found in the data, not chosen; the whole onboarding was then bent towards \"find people you know\".",
          "Facebook, vers 2008 : les utilisateurs qui atteignaient 7 amis en 10 jours restaient bien mieux que les autres. Le chiffre a été trouvé dans les données, pas choisi ; tout l'onboarding a ensuite été réorienté vers « retrouve des gens que tu connais ».",
        ),
        t(
          "A two-person invoicing app, today: 800 sign-ups over a quarter. Retained at month three: 140. Churned in month one: 480.",
          "Une appli de facturation à deux personnes, aujourd'hui : 800 inscrits sur un trimestre. Fidèles au troisième mois : 140. Partis le premier mois : 480.",
        ),
        t(
          "Candidate \"created an invoice in week 1\": 78% of retained, 35% of churned — lift 2.2. Candidate \"sent an invoice to a real client in week 1\": 64% of retained, 6% of churned — lift 10.7.",
          "Candidate « a créé une facture en semaine 1 » : 78 % des fidèles, 35 % des partis — levier 2,2. Candidate « a envoyé une facture à un vrai client en semaine 1 » : 64 % des fidèles, 6 % des partis — levier 10,7.",
        ),
        t(
          "Aha moment: first invoice sent, not created. The onboarding stops ending on a beautifully formatted draft and starts ending on \"send it\". The activation rate is now something worth tracking.",
          "Moment « aha » : première facture envoyée, pas créée. L'onboarding cesse de se terminer sur un brouillon bien mis en forme et se termine sur « envoie-la ». Le taux d'activation devient une chose qui vaut d'être suivie.",
        ),
      ],
      takeaway: t(
        "Creating something is the demo; using it for real is the moment. Most products' true aha is one step later than where their onboarding stops.",
        "Créer quelque chose, c'est la démo ; s'en servir pour de vrai, c'est le moment. Le vrai « aha » de la plupart des produits est une étape plus loin que là où leur onboarding s'arrête.",
      ),
    },
    benchmark: [
      t(
        "The well-known examples are thresholds, not features: Facebook's 7 friends in 10 days, Slack's 2,000 messages sent by a team, Dropbox's one file in one folder on one device. Each is early, countable, and a proxy for \"this thing is now part of how I work\".",
        "Les exemples connus sont des seuils, pas des fonctionnalités : les 7 amis en 10 jours de Facebook, les 2 000 messages envoyés par une équipe chez Slack, un fichier dans un dossier sur un appareil chez Dropbox. Chacun est précoce, comptable, et un indicateur de « cette chose fait maintenant partie de ma façon de travailler ».",
      ),
      t(
        "How many users reach it is the activation rate; how long it takes them is time-to-value. Both belong on the same chart, because a moment reached by 60% of users in three weeks and one reached by 35% in ten minutes describe very different onboardings.",
        "Combien d'utilisateurs l'atteignent, c'est le taux d'activation ; combien de temps ils mettent, c'est le time-to-value. Les deux ont leur place sur le même graphique, parce qu'un moment atteint par 60 % des utilisateurs en trois semaines et un atteint par 35 % en dix minutes décrivent des onboardings très différents.",
      ),
      t(
        "A moment that fewer than a fifth of retained users ever reached is not their aha moment, however much the team wishes it were. The data has to nominate it.",
        "Un moment que moins d'un cinquième des utilisateurs fidèles ont atteint n'est pas leur moment « aha », quoi qu'en souhaite l'équipe. Ce sont les données qui doivent le désigner.",
      ),
    ],
    howToImprove: [
      t(
        "Find it before you optimise anything: the comparison above takes an afternoon with an analytics export. Guessing it costs months of onboarding work pointed at the wrong screen.",
        "Trouve-le avant d'optimiser quoi que ce soit : la comparaison ci-dessus prend un après-midi avec un export d'analytics. Le deviner coûte des mois d'onboarding pointés sur le mauvais écran.",
      ),
      t(
        "Write it as one sentence with a number and a deadline — \"sent one invoice to a real client within 7 days\" — and put that sentence where the whole team sees it.",
        "Écris-le en une phrase avec un chiffre et une échéance — « a envoyé une facture à un vrai client sous 7 jours » — et mets cette phrase là où toute l'équipe la voit.",
      ),
      t(
        "Redesign onboarding backwards from it: every screen either moves the user towards the moment or gets cut. Empty states, sample data and templates exist to shorten the path to it.",
        "Reconçois l'onboarding à rebours depuis lui : chaque écran soit rapproche l'utilisateur du moment « aha », soit disparaît. Les états vides, les données d'exemple et les modèles existent pour raccourcir le chemin qui y mène.",
      ),
      t(
        "Revisit it once a year or when the product changes shape. A moment that fit a single-player tool stops fitting once teams become the customer.",
        "Revois-le une fois par an ou quand le produit change de forme. Un moment « aha » défini pour un outil individuel cesse d'être le bon le jour où le client devient une équipe.",
      ),
    ],
    inTheTour: {
      questionId: "act-1",
      body: t(
        "\"Have you defined a specific aha moment for new users?\" opens the Activation stage: 20 if it is defined and measured, 7 if it exists but isn't measured, 0 if not really. The two questions after it — what share of users reach it, has onboarding been iterated on data — cannot be answered well if this one scores 0, which is why an undefined moment usually drags the whole stage into the weak band.",
        "« As-tu défini un moment \"aha\" précis pour tes nouveaux utilisateurs ? » ouvre l'étape Activation : 20 s'il est défini et mesuré, 7 s'il existe sans être mesuré, 0 si pas vraiment. Les deux questions suivantes — quelle part d'utilisateurs l'atteint, l'onboarding a-t-il été itéré sur des données — ne peuvent pas être bien répondues si celle-ci vaut 0, et c'est pour ça qu'un moment non défini tire en général toute l'étape dans la bande faible.",
      ),
    },
    faq: [
      {
        question: t("Is the aha moment the same as activation?", "Le moment « aha », c'est la même chose que l'activation ?"),
        answer: t(
          "The aha moment is the event; activation is the stage, and the activation rate is the share of new users who reach that event within a window. Defining the moment is what makes activation measurable at all — without it, \"activated\" means whatever the last person to build a dashboard decided.",
          "Le moment « aha » est l'événement ; l'activation est l'étape, et le taux d'activation est la part des nouveaux utilisateurs qui atteignent cet événement dans une fenêtre. Définir le moment est ce qui rend l'activation mesurable tout court — sans lui, « activé » veut dire ce que la dernière personne à avoir construit un tableau de bord a décidé.",
        ),
      },
      {
        question: t(
          "What if I don't have enough users to find it in the data?",
          "Et si je n'ai pas assez d'utilisateurs pour le trouver dans les données ?",
        ),
        answer: t(
          "Then find it in conversations. Ask ten users who stayed what made them decide to keep using the product, and ten who left what they were hoping for; the stayers' answers converge on an event much faster than you'd expect. Write it down as a hypothesis, instrument it, and confirm it with data once the cohorts exist.",
          "Alors trouve-le dans les conversations. Demande à dix utilisateurs restés ce qui leur a fait décider de continuer, et à dix partis ce qu'ils espéraient ; les réponses de ceux qui restent convergent vers un événement bien plus vite qu'on ne le croit. Écris-le comme une hypothèse, instrumente-le, et confirme-le avec des données dès que les cohortes existent.",
        ),
      },
      {
        question: t(
          "Can the aha moment be a feeling rather than an action?",
          "Le moment « aha » peut-il être une sensation plutôt qu'une action ?",
        ),
        answer: t(
          "It can be experienced as one — \"oh, that's what this is for\" — but it has to be defined as an action to be of any use, because you can only measure and design towards things you can observe. Pick the action that most reliably accompanies the feeling. Half of the work is precisely that translation.",
          "Il peut être vécu comme tel — « ah, c'est à ça que ça sert » — mais il doit être défini comme une action pour servir à quelque chose, parce qu'on ne peut mesurer et concevoir que vers ce qu'on observe. Choisis l'action qui accompagne le plus fiablement la sensation. La moitié du travail, c'est précisément cette traduction.",
        ),
      },
    ],
  },

  "time-to-value": {
    formula: {
      expression: t(
        "Time to value = the MEDIAN of (timestamp of the activation event − timestamp of sign-up), over the users who reached it",
        "Time to value = la MÉDIANE de (horodatage de l'événement d'activation − horodatage de l'inscription), sur les utilisateurs qui l'ont atteint",
      ),
      terms: [
        {
          symbol: t("Median, not mean", "Médiane, pas moyenne"),
          meaning: t(
            "A handful of users who activate six weeks late drag a mean far past anything a real person experiences. The median is the time half your activating users beat, which is a sentence you can act on.",
            "Une poignée d'utilisateurs qui activent six semaines plus tard tirent une moyenne bien au-delà de ce que vit une personne réelle. La médiane est le délai que la moitié de tes activateurs battent, et c'est une phrase sur laquelle on peut agir.",
          ),
        },
        {
          symbol: t("The activation event", "L'événement d'activation"),
          meaning: t(
            "The same one your activation rate uses — two different events make the two numbers impossible to read together, which is the whole reason to have both.",
            "Le même que celui de ton taux d'activation — deux événements différents rendent les deux chiffres impossibles à lire ensemble, ce qui est toute la raison d'en avoir deux.",
          ),
        },
        {
          symbol: t("Users who reached it", "Ceux qui l'ont atteint"),
          meaning: t(
            "Users who never activate have no time to measure, so they are excluded by construction. That exclusion is the metric's dangerous edge, and the reason the activation rate has to be published next to it.",
            "Ceux qui n'activent jamais n'ont pas de délai à mesurer, donc ils sont exclus par construction. Cette exclusion est précisément ce qui rend la métrique dangereuse, et la raison pour laquelle le taux d'activation doit être publié à côté.",
          ),
        },
      ],
      note: t(
        "Never quote this number alone. Time to value computed only on activators improves when your slowest users give up — the metric gets better precisely because the product got worse, and nothing inside the figure shows it.",
        "Ne cite jamais ce chiffre seul. Un time to value calculé sur les seuls activateurs s'améliore quand tes utilisateurs les plus lents abandonnent — la métrique progresse précisément parce que le produit a régressé, et rien dans le chiffre ne le montre.",
      ),
    },
    example: {
      title: t("The quarter the number improved by getting worse", "Le trimestre où le chiffre s'est amélioré en se dégradant"),
      steps: [
        t(
          "1,000 sign-ups. 340 activate: 200 within the first hour, 80 within a week (about 3.5 days each), 60 spread over the following two months (about six weeks each).",
          "1 000 inscriptions. 340 activent : 200 dans la première heure, 80 dans la semaine (environ 3,5 jours chacun), 60 étalés sur les deux mois suivants (environ six semaines chacun).",
        ),
        t(
          "Mean time to value: (200 × 0.5h + 80 × 84h + 60 × 1,000h) ÷ 340 ≈ 197 hours, about 8 days. Median: the 170th and 171st values, both inside the first hour.",
          "Time to value moyen : (200 × 0,5 h + 80 × 84 h + 60 × 1 000 h) ÷ 340 ≈ 197 heures, soit environ 8 jours. Médiane : les 170ᵉ et 171ᵉ valeurs, toutes deux dans la première heure.",
        ),
        t(
          "Two numbers, same data, and they describe different companies. The mean describes the 60 stragglers; the median describes what a typical activating user actually lives through.",
          "Deux chiffres, les mêmes données, et ils décrivent deux entreprises différentes. La moyenne décrit les 60 traînards ; la médiane décrit ce que vit réellement un utilisateur qui active.",
        ),
        t(
          "Next quarter, nothing is fixed and the 60 stragglers simply stop bothering. Activation falls from 34% to 28%. Mean time to value: (200 × 0.5 + 80 × 84) ÷ 280 ≈ 24 hours — an eightfold \"improvement\", reported the same week the product lost sixty activations.",
          "Le trimestre suivant, rien n'est corrigé et les 60 traînards cessent simplement d'insister. L'activation tombe de 34 % à 28 %. Time to value moyen : (200 × 0,5 + 80 × 84) ÷ 280 ≈ 24 heures — une « amélioration » d'un facteur huit, annoncée la semaine où le produit a perdu soixante activations.",
        ),
      ],
      takeaway: t(
        "The median would have barely moved, because the median never depended on the stragglers. Using it, and printing the activation rate beside it, is what makes this number safe to steer by — a rule that costs nothing and prevents exactly one very expensive kind of report.",
        "La médiane, elle, aurait à peine bougé, parce qu'elle n'a jamais dépendu des traînards. L'utiliser, et imprimer le taux d'activation à côté, est ce qui rend ce chiffre sûr à piloter — une règle qui ne coûte rien et évite exactement un genre de rapport très coûteux.",
      ),
    },
    benchmark: [
      t(
        "The ambition usually quoted for self-serve products is first value inside the first session, on the theory that a user who leaves without getting anything rarely comes back for a second try. It is an ambition, not a measured norm, and it does not transfer to products that need a data migration or an integration.",
        "L'ambition couramment citée pour un produit en self-serve est une première valeur dès la première session, au motif qu'un utilisateur qui repart sans rien obtenir revient rarement pour un second essai. C'est une ambition, pas une norme mesurée, et elle ne se transpose pas aux produits qui demandent une migration de données ou une intégration.",
      ),
      t(
        "Where setup genuinely takes days, the number to watch is the trend on your own cohorts, not the absolute. A tool that went from nine days to four has done something real; a tool at four days is neither good nor bad until you know where it started.",
        "Là où la mise en place prend réellement des jours, le chiffre à suivre est la tendance sur tes propres cohortes, pas l'absolu. Un outil passé de neuf jours à quatre a fait quelque chose de réel ; un outil à quatre jours n'est ni bon ni mauvais tant qu'on ne sait pas d'où il part.",
      ),
      t(
        "In B2B the largest component is usually not work but waiting — on credentials, on a colleague, on an approval. That share is worth measuring separately, because it responds to completely different fixes than the interface does.",
        "En B2B, la plus grosse composante n'est en général pas du travail mais de l'attente — des identifiants, un collègue, une validation. Cette part mérite d'être mesurée à part, parce qu'elle répond à des correctifs complètement différents de ceux de l'interface.",
      ),
    ],
    howToImprove: [
      t(
        "Use the median, and publish the activation rate immediately next to it. Two numbers, always together, or the pair can be gamed by attrition alone.",
        "Utilise la médiane, et publie le taux d'activation juste à côté. Deux chiffres, toujours ensemble, sinon le couple se truque par la seule attrition.",
      ),
      t(
        "Measure it per step, not end to end. The total tells you there is a delay; the steps tell you whether it is your form or someone else's calendar.",
        "Mesure-le par étape, pas de bout en bout. Le total te dit qu'il y a un délai ; les étapes te disent s'il vient de ton formulaire ou du calendrier de quelqu'un d'autre.",
      ),
      t(
        "Remove waits before removing clicks. Three screens cost a minute; waiting on a colleague for database credentials costs three days, and no amount of interface polish touches it.",
        "Supprime les attentes avant de supprimer les clics. Trois écrans coûtent une minute ; attendre les identifiants d'un collègue coûte trois jours, et aucun polissage d'interface n'y change rien.",
      ),
      t(
        "Let value land before setup finishes — sample data, a prefilled example, a result computed on a partial import. The point is that the user sees what the product does before they have finished paying the price of admission.",
        "Fais arriver la valeur avant la fin de la mise en place — des données d'exemple, un cas prérempli, un résultat calculé sur un import partiel. L'idée est que l'utilisateur voie ce que fait le produit avant d'avoir fini de payer le droit d'entrée.",
      ),
    ],
    inTheTour: {
      questionId: "act-3",
      body: t(
        "The Tour asks whether your onboarding has been tested or iterated on at least once — 20 points for yes, 7 for \"a bit\", 0 for never touched. Time to value is how you would know whether an iteration worked: without it, \"we improved onboarding\" is a statement about effort rather than about outcome. Teams answering 7 have usually changed something and have no before-and-after, which is the cheapest gap on this list to close — the timestamps needed are already in the database.",
        "Le Tour demande si ton onboarding a été testé ou itéré au moins une fois — 20 points pour oui, 7 pour « un peu », 0 pour jamais touché. Le time to value est ce qui permettrait de savoir si une itération a marché : sans lui, « on a amélioré l'onboarding » est une affirmation sur l'effort, pas sur le résultat. Les équipes qui répondent 7 ont en général changé quelque chose sans avoir d'avant-après, et c'est le trou le moins cher de cette liste à combler — les horodatages nécessaires sont déjà en base.",
      ),
    },
    faq: [
      {
        question: t("Median or mean?", "Médiane ou moyenne ?"),
        answer: t(
          "Median, for two reasons. It resists the long tail of users who activate weeks later, and it stays stable when that tail changes size — which the worked example above shows is the difference between a metric you can steer by and one that rewards attrition.",
          "La médiane, pour deux raisons. Elle résiste à la longue traîne des utilisateurs qui activent des semaines plus tard, et elle reste stable quand cette traîne change de taille — ce qui, comme le montre l'exemple ci-dessus, fait la différence entre une métrique pilotable et une métrique qui récompense l'attrition.",
        ),
      },
      {
        question: t("What if most users never activate?", "Et si la plupart des utilisateurs n'activent jamais ?"),
        answer: t(
          "Then time to value is the second problem and the activation rate is the first. A fast median over a small share of users describes a good experience that almost nobody has. Fix the share, then the speed.",
          "Alors le time to value est le second problème et le taux d'activation le premier. Une médiane rapide sur une petite part d'utilisateurs décrit une bonne expérience que presque personne ne vit. Répare la part, puis la vitesse.",
        ),
      },
      {
        question: t("Is it the same as onboarding length?", "Est-ce la même chose que la durée de l'onboarding ?"),
        answer: t(
          "No, and the gap between them is often the finding. Onboarding length is how long your flow takes; time to value is how long the user waits for something worth having. A four-step onboarding finished in two minutes still has a six-day time to value if value only arrives once a colleague approves an integration.",
          "Non, et l'écart entre les deux est souvent la trouvaille. La durée de l'onboarding, c'est le temps que prend ton parcours ; le time to value, c'est le temps que l'utilisateur attend avant d'obtenir quelque chose qui vaut la peine. Un onboarding en quatre étapes bouclé en deux minutes garde un time to value de six jours si la valeur n'arrive qu'une fois qu'un collègue a validé une intégration.",
        ),
      },
      {
        question: t("Does a shorter time to value always mean a better product?", "Un time to value plus court veut-il toujours dire un meilleur produit ?"),
        answer: t(
          "No — it can also mean the goalposts moved. Redefine the activation event as something shallower and the number drops overnight without a single user being better served. Freeze the event, publish the activation rate beside it, and the improvement is real or it is visible.",
          "Non — ça peut aussi vouloir dire que les poteaux ont bougé. Redéfinis l'événement d'activation comme quelque chose de plus superficiel et le chiffre chute du jour au lendemain sans qu'un seul utilisateur soit mieux servi. Fige l'événement, publie le taux d'activation à côté, et l'amélioration est réelle ou bien elle se voit.",
        ),
      },
    ],
  },

  onboarding: {
    formula: {
      expression: t(
        "Time-to-value = median time between sign-up and the aha moment (and activation rate = the share who get there at all)",
        "Time-to-value = temps médian entre l'inscription et le moment « aha » (et taux d'activation = la part qui y arrive tout court)",
      ),
      terms: [
        {
          symbol: t("Median, not mean", "Médiane, pas moyenne"),
          meaning: t(
            "A few users who take three months would drag a mean to nonsense. The median tells you what the typical new user lives through — and the 75th percentile tells you what the slow half does.",
            "Quelques utilisateurs qui mettent trois mois tireraient une moyenne vers l'absurde. La médiane dit ce que vit le nouvel utilisateur typique — et le 75ᵉ percentile ce que fait la moitié lente.",
          ),
        },
        {
          symbol: t("Sign-up", "Inscription"),
          meaning: t(
            "The start of the clock is account creation, not first visit: onboarding owns what happens after someone decided to try, not before.",
            "Le chrono part à la création du compte, pas à la première visite : l'onboarding est responsable de ce qui se passe après que quelqu'un a décidé d'essayer, pas avant.",
          ),
        },
        {
          symbol: t("Aha moment", "Moment « aha »"),
          meaning: t(
            "The end of the clock — the defined action from the Activation stage. An onboarding without a defined destination cannot be measured, only redesigned on taste.",
            "La fin du chrono — l'action définie de l'étape Activation. Un onboarding sans destination définie ne peut pas se mesurer, seulement se redessiner au goût.",
          ),
        },
      ],
      note: t(
        "Onboarding is the path; activation is the destination. The two are confused constantly, and the confusion has a cost: teams measure \"completed the onboarding flow\" (clicked through the tour) instead of \"reached the value\", and optimise a tutorial nobody needed.",
        "L'onboarding est le chemin ; l'activation est la destination. Les deux sont confondus en permanence, et la confusion a un coût : les équipes mesurent « a terminé le parcours d'onboarding » (a cliqué à travers la visite) au lieu de « a atteint la valeur », et optimisent un tutoriel dont personne n'avait besoin.",
      ),
    },
    example: {
      title: t("Cutting a path in half without adding a feature", "Raccourcir le chemin de moitié sans ajouter de fonctionnalité"),
      steps: [
        t(
          "An analytics tool's aha moment: the first chart built on the user's own data. Before: sign-up → 5-step profile form → product tour (9 tooltips) → empty dashboard → \"connect a data source\" buried in settings. Median time-to-value: 4.5 days. Activation: 22%.",
          "Moment « aha » d'un outil d'analytics : le premier graphique construit sur les données de l'utilisateur. Avant : inscription → formulaire de profil en 5 étapes → visite du produit (9 infobulles) → tableau de bord vide → « connecter une source » enfoui dans les réglages. Time-to-value médian : 4,5 jours. Activation : 22 %.",
        ),
        t(
          "Change 1: the first screen after sign-up is \"connect a source\", with a sample dataset one click away for those who can't yet. Change 2: the tour is removed; the two tooltips that mattered move onto the chart builder itself. Change 3: the profile form is asked for later, when the user invites a colleague.",
          "Changement 1 : le premier écran après l'inscription est « connecter une source », avec un jeu de données d'exemple à un clic pour ceux qui ne peuvent pas encore. Changement 2 : la visite est retirée ; les deux infobulles qui comptaient migrent sur le constructeur de graphique lui-même. Changement 3 : le formulaire de profil est demandé plus tard, quand l'utilisateur invite un collègue.",
        ),
        t(
          "After one month of cohorts: median time-to-value 38 minutes. Activation: 41%.",
          "Après un mois de cohortes : time-to-value médian 38 minutes. Activation : 41 %.",
        ),
        t(
          "Nothing was added. Three things were removed or moved. The product didn't change; the distance between the door and the value did.",
          "Rien n'a été ajouté. Trois choses ont été retirées ou déplacées. Le produit n'a pas changé ; la distance entre la porte et la valeur, si.",
        ),
      ],
      takeaway: t(
        "Most onboarding work that pays is subtraction. The question to ask of every step is not \"is this useful?\" but \"does the user need this before the moment, or could it wait?\".",
        "L'essentiel du travail d'onboarding qui rapporte est de la soustraction. La question à poser à chaque étape n'est pas « est-ce utile ? » mais « l'utilisateur en a-t-il besoin avant le moment, ou ça peut attendre ? ».",
      ),
    },
    benchmark: [
      t(
        "Time-to-value should match the product's cycle: minutes for consumer apps, within the first session for most SaaS, a day or two when real data has to be connected, longer only when a human has to be involved — and then the onboarding's job is to make that human show up fast.",
        "Le time-to-value devrait suivre le cycle du produit : des minutes en grand public, dans la première session pour la plupart des SaaS, un jour ou deux quand de vraies données doivent être connectées, plus long seulement quand un humain doit intervenir — et alors le travail de l'onboarding est de faire venir cet humain vite.",
      ),
      t(
        "Drop-off in the first session is the largest single loss in most funnels: it is common for half or more of sign-ups never to return after day one. Every step removed between sign-up and value moves that number.",
        "La perte pendant la première session est la plus grosse perte unique de la plupart des entonnoirs : il est courant que la moitié des inscrits ou plus ne reviennent jamais après le premier jour. Chaque étape retirée entre l'inscription et la valeur fait bouger ce chiffre.",
      ),
      t(
        "Product tours and coach marks are among the most-skipped elements in software; the value of guidance lies in showing up at the moment of need, inside the task, not in a sequence up front.",
        "Les visites guidées et les infobulles de démarrage sont parmi les éléments les plus sautés des logiciels ; la valeur d'une aide, c'est d'apparaître au moment du besoin, dans la tâche, pas en séquence au début.",
      ),
    ],
    howToImprove: [
      t(
        "Start from the aha moment and count backwards: list every screen between it and sign-up, then justify each one. Cut what can't be justified, defer what can wait.",
        "Pars du moment « aha » et compte à rebours : liste chaque écran entre lui et l'inscription, puis justifie chacun. Coupe ce qui ne se justifie pas, reporte ce qui peut attendre.",
      ),
      t(
        "Replace empty states with a starting point: sample data, a template, an import. An empty dashboard is the most common place a new user quietly leaves.",
        "Remplace les états vides par un point de départ : des données d'exemple, un modèle, un import. Un tableau de bord vide est l'endroit le plus courant où un nouvel utilisateur s'en va sans bruit.",
      ),
      t(
        "Ask for information when it becomes useful, not at the door. Name, company, role, team size can all wait until the product needs them for something the user wants.",
        "Demande les informations quand elles deviennent utiles, pas à la porte. Nom, entreprise, rôle, taille d'équipe peuvent tous attendre que le produit en ait besoin pour quelque chose que l'utilisateur veut.",
      ),
      t(
        "Watch five new users go through it — recordings or a live session. You will find the step that loses people faster than any funnel chart will show it.",
        "Regarde cinq nouveaux utilisateurs le traverser — enregistrements ou session en direct. Tu trouveras l'étape qui perd les gens plus vite que n'importe quel graphique d'entonnoir ne la montrera.",
      ),
      t(
        "Iterate on cohorts, one change at a time. \"Never touched since launch\" is the 0-point answer in the Tour because an onboarding is a hypothesis about your users, and hypotheses age.",
        "Itère sur des cohortes, un changement à la fois. « Jamais retouché depuis le lancement » vaut 0 point dans le Tour parce qu'un onboarding est une hypothèse sur tes utilisateurs, et les hypothèses vieillissent.",
      ),
    ],
    inTheTour: {
      questionId: "act-3",
      body: t(
        "\"Has your onboarding been tested or iterated on at least once?\" is the third Activation question — 20 for iterated on real data, 7 for tweaked a little, informally, 0 for never touched since launch. It sits after the two questions that make iteration possible (a defined moment, a measured share who reach it): an onboarding can only be improved towards a destination someone has named.",
        "« Ton onboarding a-t-il été testé ou itéré au moins une fois ? » est la troisième question Activation — 20 pour itéré sur de vraies données, 7 pour ajusté un peu, à l'instinct, 0 pour jamais retouché depuis le lancement. Elle vient après les deux questions qui rendent l'itération possible (un moment défini, une part mesurée qui l'atteint) : un onboarding ne peut être amélioré que vers une destination que quelqu'un a nommée.",
      ),
    },
    faq: [
      {
        question: t(
          "What's the difference between onboarding and activation?",
          "Quelle différence entre onboarding et activation ?",
        ),
        answer: t(
          "Onboarding is everything you build between sign-up and the first value: screens, emails, defaults, sample data. Activation is whether — and how fast — users reach that value. One is the design, the other is the measurement. Good onboarding is judged only by activation; it has no score of its own.",
          "L'onboarding, c'est tout ce que tu construis entre l'inscription et la première valeur : écrans, e-mails, réglages par défaut, données d'exemple. L'activation, c'est si — et à quelle vitesse — les utilisateurs atteignent cette valeur. L'un est la conception, l'autre la mesure. Un bon onboarding ne se juge qu'à l'activation ; il n'a pas de score propre.",
        ),
      },
      {
        question: t("Should onboarding include a product tour?", "L'onboarding doit-il inclure une visite guidée du produit ?"),
        answer: t(
          "Rarely as a sequence up front. Guidance works when it appears at the moment a user is about to need it, inside the task; a tour before the user has any task teaches things they'll have forgotten by the time they matter. If you keep one, make it skippable, three steps at most, and measure whether people who skip it activate less — they usually don't.",
          "Rarement en séquence au début. Une aide fonctionne quand elle apparaît au moment où l'utilisateur va en avoir besoin, dans la tâche ; une visite avant que l'utilisateur ait la moindre tâche enseigne des choses oubliées au moment où elles comptent. Si tu en gardes une, rends-la sautable, trois étapes au plus, et mesure si ceux qui la sautent s'activent moins — en général non.",
        ),
      },
      {
        question: t("How long should onboarding take?", "Combien de temps doit durer l'onboarding ?"),
        answer: t(
          "As long as the path to the first value requires, and not a screen more. The right question isn't duration but distance: how many decisions and how much typing stand between the account and the moment. Measure time-to-value, then remove steps until the median stops dropping.",
          "Le temps que demande le chemin vers la première valeur, et pas un écran de plus. La bonne question n'est pas la durée mais la distance : combien de décisions et de saisie séparent le compte du moment. Mesure le time-to-value, puis retire des étapes jusqu'à ce que la médiane cesse de baisser.",
        ),
      },
    ],
  },
  // ——— wave 2.2, lot 3 (2026-09-14) — closes the batch ———
  "product-led-growth": {
    formula: {
      expression: t(
        "Self-serve share = (customers who reached paid without talking to anyone) ÷ (all new customers in the period)",
        "Part self-serve = (clients arrivés au payant sans avoir parlé à personne) ÷ (tous les nouveaux clients de la période)",
      ),
      terms: [
        {
          symbol: t("Without talking to anyone", "Sans avoir parlé à personne"),
          meaning: t(
            "No demo, no discovery call, no negotiated quote. A support ticket does not count as a conversation — helping someone who is already buying is not selling to them.",
            "Pas de démo, pas d'appel de découverte, pas de devis négocié. Un ticket au support ne compte pas comme une conversation — aider quelqu'un qui achète déjà, ce n'est pas lui vendre.",
          ),
        },
        {
          symbol: t("Customers, and revenue", "Clients, et revenu"),
          meaning: t(
            "Compute the share twice, once by customer count and once by revenue. The two answers are usually far apart, and the gap between them is the finding.",
            "Calcule la part deux fois, une fois en nombre de clients et une fois en revenu. Les deux réponses sont en général très éloignées, et l'écart entre elles est la trouvaille.",
          ),
        },
        {
          symbol: t("Period", "Période"),
          meaning: t(
            "A quarter is usually the right window: long enough to absorb a single large deal, short enough to notice the motion drifting from one quarter to the next.",
            "Un trimestre est en général la bonne fenêtre : assez longue pour absorber un gros contrat isolé, assez courte pour voir le modèle dériver d'un trimestre à l'autre.",
          ),
        },
      ],
      note: t(
        "Product-led growth is a distribution model, not a quality bar. It works where a product can deliver value before a conversation — which is a property of the product and of who buys it, not of how much the team wants it to be true.",
        "Le product-led growth est un modèle de distribution, pas un gage de qualité. Il fonctionne là où un produit peut délivrer de la valeur avant une conversation — ce qui est une propriété du produit et de qui l'achète, pas de l'envie qu'en a l'équipe.",
      ),
    },
    example: {
      title: t("A company that calls itself product-led", "Une entreprise qui se dit product-led"),
      steps: [
        t(
          "200 new customers in a quarter. 150 booked a demo from the pricing page; 50 signed up and paid without ever talking to anyone.",
          "200 nouveaux clients sur un trimestre. 150 ont réservé une démo depuis la page de tarifs ; 50 se sont inscrits et ont payé sans jamais parler à personne.",
        ),
        t(
          "Self-serve share by customer count: 50 ÷ 200 = 25%. Already less product-led than the company describes itself, but defensible as a motion being built.",
          "Part self-serve en nombre de clients : 50 ÷ 200 = 25 %. Déjà moins product-led que l'entreprise ne se décrit, mais défendable comme un modèle en construction.",
        ),
        t(
          "Now by revenue. The 50 self-serve customers average €40 a month (€2,000 MRR); the 150 sales-led average €400 (€60,000 MRR). Self-serve share of revenue: 2,000 ÷ 62,000 ≈ 3%.",
          "Maintenant en revenu. Les 50 clients self-serve paient 40 € par mois en moyenne (2 000 € de MRR) ; les 150 vendus paient 400 € (60 000 € de MRR). Part self-serve du revenu : 2 000 ÷ 62 000 ≈ 3 %.",
        ),
        t(
          "25% and 3% describe the same quarter, and only one of them should drive the decision. If the question is \"should we invest in the product as a sales channel\", the answer has to be weighed against the 97% of revenue the other motion currently brings.",
          "25 % et 3 % décrivent le même trimestre, et un seul des deux doit porter la décision. Si la question est « faut-il investir dans le produit comme canal de vente », la réponse doit être pesée contre les 97 % de revenu que l'autre modèle apporte aujourd'hui.",
        ),
      ],
      takeaway: t(
        "Neither number makes the company good or bad — a sales-led business with a free trial is a perfectly sound business. What the two numbers settle is which one it is, which is a question that has to be answered before deciding where the next year of engineering goes.",
        "Aucun des deux chiffres ne rend l'entreprise bonne ou mauvaise — une entreprise vendue par des commerciaux avec un essai gratuit est une entreprise parfaitement saine. Ce que les deux chiffres tranchent, c'est laquelle des deux elle est, et cette question doit être réglée avant de décider où va la prochaine année d'ingénierie.",
      ),
    },
    benchmark: [
      t(
        "The pattern most often cited is that product-led companies show both a lower acquisition cost and a lower average contract value. Both, which is why neither figure judges the model on its own: the number that does is CAC payback, where the two effects meet.",
        "Le schéma le plus souvent cité est que les entreprises product-led affichent à la fois un coût d'acquisition plus bas et un panier moyen plus bas. Les deux baissent ensemble, et c'est pourquoi aucun des deux chiffres ne juge le modèle seul : celui qui le fait est le CAC payback, là où les deux effets se rencontrent.",
      ),
      t(
        "The model needs a product whose value is visible before a conversation and a buyer who is allowed to buy alone. Sell something that requires a security review and a procurement process and no amount of onboarding polish makes the motion self-serve — that is a constraint of the market, not a failure of execution.",
        "Le modèle demande un produit dont la valeur est visible avant une conversation et un acheteur autorisé à acheter seul. Vends quelque chose qui exige une revue de sécurité et un processus d'achat, et aucun polissage d'onboarding ne rendra le modèle self-serve — c'est une contrainte du marché, pas un échec d'exécution.",
      ),
      t(
        "Running both motions on the same segment without deciding which one owns it is the common failure, and it shows up as sales people being paid on deals the product had already closed.",
        "Faire tourner les deux modèles sur le même segment sans décider lequel en a la charge est l'échec courant, et ça se voit quand des commerciaux sont payés sur des contrats que le produit avait déjà conclus.",
      ),
    ],
    howToImprove: [
      t(
        "Measure the self-serve share both ways before claiming the model, and publish both. One number is a slogan; two are a diagnosis.",
        "Mesure la part self-serve des deux façons avant de revendiquer le modèle, et publie les deux. Un chiffre est un slogan ; deux sont un diagnostic.",
      ),
      t(
        "Make value land before the conversation would have happened. That is the time-to-value question, and in a product-led motion it is not a comfort feature — it is the sales call.",
        "Fais arriver la valeur avant le moment où la conversation aurait eu lieu. C'est la question du time to value, et dans un modèle product-led ce n'est pas un confort — c'est l'entretien de vente.",
      ),
      t(
        "Put the expansion trigger inside the product rather than in a calendar: a usage threshold that fires an offer is the product doing the selling, which is what the model means in practice.",
        "Mets le déclencheur d'expansion dans le produit plutôt que dans un calendrier : un seuil d'usage qui déclenche une offre, c'est le produit qui vend, ce que le modèle veut dire concrètement.",
      ),
      t(
        "Decide which motion owns which segment and write it down. Self-serve under a size, sales-led above it, and no overlap — the overlap is where both teams claim the same customer and neither owns the experience.",
        "Décide quel modèle a la charge de quel segment, et écris-le. Self-serve en dessous d'une taille, vendu au-dessus, et pas de recouvrement — le recouvrement est l'endroit où les deux équipes revendiquent le même client et où personne ne tient l'expérience.",
      ),
    ],
    inTheTour: {
      questionId: "acq-1",
      body: t(
        "The Tour asks whether you have a primary acquisition channel that is identified and measured, for 20 points. It is a pointed question for a product-led team, because the honest answer is often \"the product\" — and a channel you cannot point at is a channel you cannot measure. Teams claiming the model and answering 7 here usually have a free tier and no idea what share of revenue comes through it, which is exactly the figure this page asks for.",
        "Le Tour demande si tu as un canal d'acquisition principal identifié et mesuré, pour 20 points. C'est une question directe pour une équipe product-led, parce que la réponse honnête est souvent « le produit » — et un canal qu'on ne peut pas désigner est un canal qu'on ne peut pas mesurer. Les équipes qui revendiquent le modèle et répondent 7 ici ont en général un palier gratuit et aucune idée de la part de revenu qui passe par lui, c'est-à-dire exactement le chiffre que cette page réclame.",
      ),
    },
    faq: [
      {
        question: t("How do I know if I am actually product-led?", "Comment savoir si je suis réellement product-led ?"),
        answer: t(
          "Compute the self-serve share by revenue for last quarter. Not by sign-ups, not by customer count — by revenue. Most companies that describe themselves this way find a number well under a third, which does not make them wrong to aim for it, only wrong to plan as though they had arrived.",
          "Calcule la part self-serve en revenu sur le dernier trimestre. Pas en inscriptions, pas en nombre de clients — en revenu. La plupart des entreprises qui se décrivent ainsi trouvent un chiffre bien sous le tiers, ce qui ne leur donne pas tort de viser le modèle, seulement de bâtir leurs plans comme si elles y étaient déjà.",
        ),
      },
      {
        question: t("Do I need a free tier?", "Faut-il un palier gratuit ?"),
        answer: t(
          "You need a way for someone to reach value before paying, which a free tier, a trial, or a genuinely useful demo environment can all provide. The free tier is the most common form and the most expensive one — it commits you to serving users who may never pay, and that cost belongs in your gross margin.",
          "Il te faut un moyen d'atteindre la valeur avant de payer, ce qu'un palier gratuit, un essai ou un environnement de démonstration réellement utile peuvent tous fournir. Le palier gratuit est la forme la plus courante et la plus coûteuse — il t'engage à servir des utilisateurs qui ne paieront peut-être jamais, et ce coût appartient à ta marge brute.",
        ),
      },
      {
        question: t("Is product-led growth cheaper?", "Le product-led growth coûte-t-il moins cher ?"),
        answer: t(
          "Per customer, usually yes; per euro of revenue, not necessarily, because the contracts are smaller. The comparison that settles it is CAC payback, which folds both effects into one number. A motion with a €200 CAC and a €20 monthly margin pays back in ten months; one with a €5,000 CAC and a €900 margin pays back in six.",
          "Par client, en général oui ; par euro de revenu, pas nécessairement, parce que les contrats sont plus petits. La comparaison qui tranche est le CAC payback, qui rassemble les deux effets en un seul chiffre. Un modèle à 200 € de CAC et 20 € de marge mensuelle se rembourse en dix mois ; un modèle à 5 000 € de CAC et 900 € de marge, en six.",
        ),
      },
      {
        question: t("Can both motions coexist?", "Les deux modèles peuvent-ils coexister ?"),
        answer: t(
          "Routinely, and most companies that grow past a certain size end up running both. What does not work is running them on the same customers without a rule: the rule can be company size, plan, or geography, but there has to be one, written down, or the two motions spend their time re-selling each other's customers.",
          "Couramment, et la plupart des entreprises qui dépassent une certaine taille finissent par faire tourner les deux. Ce qui ne marche pas, c'est de les faire tourner sur les mêmes clients sans règle : la règle peut être la taille d'entreprise, l'offre ou la géographie, mais il en faut une, écrite, sinon les deux modèles passent leur temps à revendre les clients l'un de l'autre.",
        ),
      },
    ],
  },

  "growth-loop": {
    formula: {
      expression: t(
        "Next cycle's input = this cycle's users × share who take the loop action × conversion of what that action produces",
        "Entrée du cycle suivant = utilisateurs de ce cycle × part qui fait l'action de boucle × conversion de ce que cette action produit",
      ),
      terms: [
        {
          symbol: t("Loop action", "Action de boucle"),
          meaning: t(
            "What a user does that creates the next user's entry point: shares a result (viral loop), publishes something search engines index (content loop), pays money that funds ads (paid loop). If nothing a user does creates an entry point for someone else, you have a funnel, not a loop.",
            "Ce qu'un utilisateur fait qui crée le point d'entrée du suivant : partager un résultat (boucle virale), publier quelque chose que les moteurs indexent (boucle de contenu), payer de l'argent qui finance de la publicité (boucle payante). Si rien de ce qu'un utilisateur fait ne crée un point d'entrée pour quelqu'un d'autre, tu as un entonnoir, pas une boucle.",
          ),
        },
        {
          symbol: t("Conversion", "Conversion"),
          meaning: t(
            "How much of what the action produces becomes a new user: readers of a shared page who start their own, searchers who land on a user-generated page and sign up, ad impressions bought with revenue that convert.",
            "Quelle part de ce que l'action produit devient un nouvel utilisateur : les lecteurs d'une page partagée qui lancent la leur, les chercheurs qui atterrissent sur une page créée par un utilisateur et s'inscrivent, les impressions publicitaires achetées avec le revenu qui convertissent.",
          ),
        },
        {
          symbol: t("Cycle time", "Temps de cycle"),
          meaning: t(
            "How long one turn takes — from a user entering to the users they generate entering. A loop with a lower ratio but a daily cycle outgrows a stronger loop that turns monthly.",
            "Combien de temps prend un tour — de l'entrée d'un utilisateur à l'entrée de ceux qu'il génère. Une boucle au ratio plus faible mais au cycle quotidien dépasse une boucle plus forte qui tourne chaque mois.",
          ),
        },
      ],
      note: t(
        "The ratio output ÷ input is the loop's multiplier; for the viral loop it is exactly K. Above 1, the loop is self-sustaining; below 1 — the usual case — it multiplies whatever you feed it from outside, which is still the cheapest growth there is.",
        "Le ratio sortie ÷ entrée est le multiplicateur de la boucle ; pour la boucle virale, c'est exactement K. Au-dessus de 1, la boucle s'auto-entretient ; en dessous — le cas habituel — elle multiplie ce que tu lui donnes de l'extérieur, ce qui reste la croissance la moins chère qui existe.",
      ),
    },
    example: {
      title: t("This site's own loop, with the real mechanics", "La boucle de ce site, avec sa vraie mécanique"),
      steps: [
        t(
          "Input: someone takes the Tour. Loop action: they share their result page — a link with a preview image showing their score.",
          "Entrée : quelqu'un fait le Tour. Action de boucle : il partage sa page de résultat — un lien avec une image d'aperçu montrant son score.",
        ),
        t(
          "Conversion: a reader of that page clicks \"take your own Tour\" (the link carries a reference to the result that brought them) and completes fifteen questions. They are now an input, and the cycle turns.",
          "Conversion : un lecteur de cette page clique sur « fais ton propre Tour » (le lien porte une référence au résultat qui l'a amené) et répond aux quinze questions. Il est maintenant une entrée, et le cycle tourne.",
        ),
        t(
          "Suppose 20% of Tours are shared, a shared page is read by 12 people, and 6% of readers start their own: 0.2 × 12 × 0.06 = 0.144 new Tours per Tour. Multiplier 0.144; every 100 Tours from outside eventually yield about 117.",
          "Suppose que 20 % des Tours soient partagés, qu'une page partagée soit lue par 12 personnes, et que 6 % des lecteurs lancent le leur : 0,2 × 12 × 0,06 = 0,144 nouveau Tour par Tour. Multiplicateur 0,144 ; chaque centaine de Tours venue de l'extérieur en produit finalement environ 117.",
        ),
        t(
          "Cycle time is hours, not months: a result is shared the day it is created, and read within days. That is why even a modest multiplier matters here — it compounds fast.",
          "Le temps de cycle se compte en heures, pas en mois : un résultat est partagé le jour où il est créé, et lu dans les jours qui suivent. C'est pour ça qu'un multiplicateur modeste compte ici — il compose vite.",
        ),
      ],
      takeaway: t(
        "A loop is designed, not discovered: the preview image, the visitor's call to action and the reference on the link are each one term of the formula. Remove any of them and the loop is a funnel again.",
        "Une boucle se conçoit, elle ne se découvre pas : l'image d'aperçu, l'appel à l'action pour le visiteur et la référence sur le lien sont chacun un terme de la formule. Retire l'un d'eux et la boucle redevient un entonnoir.",
      ),
    },
    benchmark: [
      t(
        "Three families, three speeds. Viral loops (a user brings a user) turn in hours or days; content loops (user-generated pages that rank — public profiles, reviews, Q&A) take months to build and then run for years; paid loops (revenue funds acquisition) turn as fast as your payback period. Most durable companies run at least two.",
        "Trois familles, trois vitesses. Les boucles virales (un utilisateur amène un utilisateur) tournent en heures ou en jours ; les boucles de contenu (des pages créées par les utilisateurs qui rangent — profils publics, avis, questions-réponses) prennent des mois à construire puis tournent pendant des années ; les boucles payantes (le revenu finance l'acquisition) tournent à la vitesse de ton délai de remboursement. La plupart des entreprises durables en font tourner au moins deux.",
      ),
      t(
        "A loop multiplier above 1 is as rare as a viral coefficient above 1 — they are the same thing for the viral family. The realistic goal is a loop that turns a €500 CAC into an effective €350, not one that removes acquisition spend altogether.",
        "Un multiplicateur de boucle au-dessus de 1 est aussi rare qu'un coefficient viral au-dessus de 1 — c'est la même chose pour la famille virale. L'objectif réaliste est une boucle qui transforme un CAC de 500 € en 350 € effectifs, pas une boucle qui supprime toute dépense d'acquisition.",
      ),
      t(
        "Loops decay: the network saturates, the content ages, the ad auction gets pricier. A loop that ran at 0.3 last year and 0.15 today is telling you where the next product work is.",
        "Les boucles s'usent : le réseau sature, le contenu vieillit, l'enchère publicitaire renchérit. Une boucle qui tournait à 0,3 l'an dernier et à 0,15 aujourd'hui te dit où est le prochain travail produit.",
      ),
    ],
    howToImprove: [
      t(
        "Draw it. One box per step, from a user entering to the next user entering, with a number on each arrow. If you can't draw it, you don't have one yet.",
        "Dessine-la. Une case par étape, de l'entrée d'un utilisateur à l'entrée du suivant, avec un chiffre sur chaque flèche. Si tu ne peux pas la dessiner, tu n'en as pas encore une.",
      ),
      t(
        "Instrument the arrow you can't see. Usually it's conversion: who arrived through the loop's output, and did they become an input? A reference on every shared link and first-touch attribution answer that.",
        "Instrumente la flèche que tu ne vois pas. En général c'est la conversion : qui est arrivé par la sortie de la boucle, et est-il devenu une entrée ? Une référence sur chaque lien partagé et une attribution au premier contact y répondent.",
      ),
      t(
        "Work the weakest arrow, not the whole loop. Doubling the share who share when readers never convert doubles nothing; fixing what the reader sees first might.",
        "Travaille la flèche la plus faible, pas toute la boucle. Doubler la part qui partage quand les lecteurs ne convertissent jamais ne double rien ; corriger ce que le lecteur voit en premier, peut-être.",
      ),
      t(
        "Shorten the cycle before raising the ratio: getting an invitee to their own first value the same day is worth more than a small gain in share rate.",
        "Raccourcis le cycle avant de monter le ratio : amener un invité à sa propre première valeur le jour même vaut plus qu'un petit gain de taux de partage.",
      ),
      t(
        "Add a second family when the first plateaus: a viral loop plus a content loop (public results, glossary pages) reach different people at different speeds.",
        "Ajoute une seconde famille quand la première plafonne : une boucle virale plus une boucle de contenu (résultats publics, pages de glossaire) atteignent des gens différents à des vitesses différentes.",
      ),
    ],
    inTheTour: {
      questionId: "ref-1",
      body: t(
        "The Tour has no \"growth loop\" question because a loop is not a stage — it is what the Referral stage becomes when it is built into the product. The first Referral question asks exactly that: is there a sharing or referral mechanism in the product (20), only in your communication (7), or none (0)? A loop that exists \"in communication\" — a newsletter asking people to recommend you — has no action inside the product to run on, and cannot turn.",
        "Le Tour n'a pas de question « boucle de croissance » parce qu'une boucle n'est pas une étape — c'est ce que l'étape Referral devient quand elle est construite dans le produit. La première question Referral demande exactement ça : y a-t-il un mécanisme de partage ou de parrainage dans le produit (20), seulement dans ta communication (7), ou rien (0) ? Une boucle qui existe « en communication » — une newsletter qui demande de te recommander — n'a aucune action dans le produit sur laquelle tourner, et ne peut pas tourner.",
      ),
    },
    faq: [
      {
        question: t("Growth loop vs. funnel — which one should I use?", "Boucle de croissance ou entonnoir, lequel utiliser ?"),
        answer: t(
          "Both, for different questions. The funnel (AARRR) tells you where people drop between arriving and paying; the loop tells you whether the people who stay create the next arrivals. A team with only a funnel keeps buying the top; a team with only a loop can't tell which stage is leaking. Draw the funnel inside the loop.",
          "Les deux, pour des questions différentes. L'entonnoir (AARRR) te dit où les gens décrochent entre l'arrivée et le paiement ; la boucle te dit si ceux qui restent créent les arrivées suivantes. Une équipe qui n'a qu'un entonnoir achète sans cesse le haut ; une équipe qui n'a qu'une boucle ne sait pas quelle étape fuit. Dessine l'entonnoir à l'intérieur de la boucle.",
        ),
      },
      {
        question: t("What are the main types of growth loop?", "Quels sont les principaux types de boucle de croissance ?"),
        answer: t(
          "Viral (a user brings a user — invitations, shared artefacts, collaboration), content (what users create gets indexed and found — profiles, reviews, public documents), paid (revenue from customers funds the acquisition of the next ones), and sometimes sales (a customer becomes a reference that closes the next). The famous product-led companies usually combine a viral loop with a content loop.",
          "Virale (un utilisateur amène un utilisateur — invitations, livrables partagés, collaboration), de contenu (ce que les utilisateurs créent est indexé et trouvé — profils, avis, documents publics), payante (le revenu des clients finance l'acquisition des suivants), et parfois commerciale (un client devient une référence qui ferme le suivant). Les entreprises product-led célèbres combinent en général une boucle virale et une boucle de contenu.",
        ),
      },
      {
        question: t("Can a B2B tool have a growth loop?", "Un outil B2B peut-il avoir une boucle de croissance ?"),
        answer: t(
          "Yes, and the most common one is collaboration: the product is more useful with a colleague in it, so users invite colleagues, who invite theirs. Document tools, design tools and messaging all grew on it. The weaker B2B version is the output loop — reports, dashboards or links that get sent outside the team and carry the product's name.",
          "Oui, et la plus courante est la collaboration : le produit est plus utile avec un collègue dedans, donc les utilisateurs invitent des collègues, qui invitent les leurs. Les outils de documents, de design et de messagerie ont tous grandi dessus. La version B2B plus faible est la boucle de sortie — des rapports, tableaux de bord ou liens envoyés hors de l'équipe et qui portent le nom du produit.",
        ),
      },
    ],
  },

  arpu: {
    formula: {
      expression: t(
        "ARPU = (revenue over a period) ÷ (average active users over that period) — and ARPPU = the same revenue ÷ PAYING users only",
        "ARPU = (revenu d'une période) ÷ (moyenne des utilisateurs actifs sur cette période) — et l'ARPPU = le même revenu ÷ les seuls utilisateurs PAYANTS",
      ),
      terms: [
        {
          symbol: t("Revenue", "Revenu"),
          meaning: t(
            "Decide once whether this is recurring revenue only or everything, and never switch. Mixing a one-off setup fee into one month makes that month's ARPU a spike nobody can explain a quarter later.",
            "Décide une fois s'il s'agit du seul revenu récurrent ou de tout, et n'en change plus. Mélanger des frais de mise en place ponctuels dans un mois fait de l'ARPU de ce mois un pic que personne ne saura expliquer un trimestre plus tard.",
          ),
        },
        {
          symbol: t("Users", "Utilisateurs"),
          meaning: t(
            "Active users, not registered ones. Dividing by everyone who ever created an account produces a number that falls every month by construction, and says nothing about anything.",
            "Les utilisateurs actifs, pas les inscrits. Diviser par tous ceux qui ont un jour créé un compte produit un chiffre qui baisse chaque mois par construction, et ne dit rien de rien.",
          ),
        },
        {
          symbol: t("Which of the two", "Laquelle des deux"),
          meaning: t(
            "ARPU answers \"what is a new sign-up worth\", which is what you compare acquisition spend against. ARPPU answers \"what is a customer worth\", which is what you compare a price change against. Both get called ARPU, in different decks, on the same week.",
            "L'ARPU répond à « combien vaut une nouvelle inscription », ce que l'on compare à une dépense d'acquisition. L'ARPPU répond à « combien vaut un client », ce que l'on compare à un changement de prix. Les deux se font appeler ARPU, dans des documents différents, la même semaine.",
          ),
        },
      ],
      note: t(
        "ARPU is a rate, LTV is a total: LTV ≈ ARPU × gross margin × average lifetime. A customer at €50 a month with an 80% margin who stays 33 months is worth about €1,320 — a total built from exactly this rate.",
        "L'ARPU est un taux, la LTV est un total : LTV ≈ ARPU × marge brute × durée de vie moyenne. Un client à 50 € par mois avec 80 % de marge qui reste 33 mois vaut environ 1 320 € — un total construit précisément à partir de ce taux.",
      ),
    },
    example: {
      title: t("Two numbers, twenty-five times apart", "Deux chiffres, vingt-cinq fois d'écart"),
      steps: [
        t(
          "A freemium tool: 100,000 active users, 4,000 of whom pay. Monthly revenue: €80,000.",
          "Un outil freemium : 100 000 utilisateurs actifs, dont 4 000 paient. Revenu mensuel : 80 000 €.",
        ),
        t(
          "ARPU = 80,000 ÷ 100,000 = €0.80. ARPPU = 80,000 ÷ 4,000 = €20. Same month, same revenue, and a factor of twenty-five between the two.",
          "ARPU = 80 000 ÷ 100 000 = 0,80 €. ARPPU = 80 000 ÷ 4 000 = 20 €. Le même mois, le même revenu, et un facteur vingt-cinq entre les deux.",
        ),
        t(
          "Now lift conversion from 4% to 5% without touching the price: 5,000 payers × €20 = €100,000. ARPU goes from €0.80 to €1.00, up 25%. ARPPU has not moved at all.",
          "Fais maintenant passer la conversion de 4 % à 5 % sans toucher au prix : 5 000 payants × 20 € = 100 000 €. L'ARPU passe de 0,80 € à 1,00 €, soit +25 %. L'ARPPU, lui, n'a pas bougé d'un centime.",
        ),
        t(
          "Raise the price by 25% instead, with conversion unchanged: ARPPU goes to €25 and ARPU to €1.00 as well. Two completely different projects, identical in one number and distinguishable only by the other.",
          "Augmente plutôt le prix de 25 %, à conversion inchangée : l'ARPPU passe à 25 € et l'ARPU à 1,00 € lui aussi. Deux projets complètement différents, identiques sur un chiffre et distinguables uniquement par l'autre.",
        ),
      ],
      takeaway: t(
        "Quoting one of them without saying which is how a conversion win and a price rise end up reported as the same result. Say which, every time, and put the user count next to it.",
        "Citer l'un des deux sans dire lequel est la façon dont un gain de conversion et une hausse de prix finissent rapportés comme le même résultat. Dis lequel, à chaque fois, et mets le nombre d'utilisateurs à côté.",
      ),
    },
    benchmark: [
      t(
        "ARPU varies by three orders of magnitude across categories — cents a month for a consumer app, thousands for enterprise software — so a cross-company comparison compares business models rather than performance. There is no useful table here.",
        "L'ARPU varie de trois ordres de grandeur d'une catégorie à l'autre — quelques centimes par mois pour une application grand public, des milliers pour un logiciel d'entreprise — donc une comparaison inter-entreprises compare des modèles économiques et non des performances. Il n'y a pas de tableau utile ici.",
      ),
      t(
        "The comparison that means something is your own trend, decomposed. An ARPU up 10% can be a price rise, a conversion win, or simply a mix shift toward larger customers — three different results reported by one number, and only the decomposition tells them apart.",
        "La comparaison qui a du sens est ta propre tendance, décomposée. Un ARPU en hausse de 10 % peut être une hausse de prix, un gain de conversion, ou simplement un glissement du mix vers de plus gros clients — trois résultats différents rapportés par un seul chiffre, et seule la décomposition les distingue.",
      ),
      t(
        "A rising ARPU on a falling user count is usually small users churning, not a win. It is the same mechanical trap as the DAU/MAU ratio, and it is why neither is ever quoted without the denominator beside it.",
        "Un ARPU qui monte sur un nombre d'utilisateurs qui baisse, ce sont en général les petits utilisateurs qui partent, pas une victoire. C'est le même piège mécanique que le ratio DAU/MAU, et c'est pourquoi ni l'un ni l'autre ne se cite sans son dénominateur à côté.",
      ),
    ],
    howToImprove: [
      t(
        "Say which of the two you mean, in the label, every time. \"ARPU (paying)\" costs one word and settles most of the arguments this metric causes.",
        "Dis laquelle des deux tu utilises, dans l'intitulé, à chaque fois. « ARPU (payants) » coûte un mot et règle la plupart des désaccords que cette métrique provoque.",
      ),
      t(
        "Decompose every movement into price, mix and conversion before reporting it. A number that moved for three reasons at once is not a result yet.",
        "Décompose chaque variation en prix, mix et conversion avant de la rapporter. Un chiffre qui a bougé pour trois raisons à la fois n'est pas encore un résultat.",
      ),
      t(
        "Segment it. A blended ARPU over a base that contains both a €9 plan and a €900 plan describes neither, and the segment-level numbers are the ones a pricing decision actually needs.",
        "Segmente-le. Un ARPU global sur une base qui contient à la fois une offre à 9 € et une à 900 € ne décrit ni l'une ni l'autre, et ce sont les chiffres par segment dont une décision de pricing a réellement besoin.",
      ),
      t(
        "Publish it next to the active user count, always — the pair is what makes a rise readable as growth rather than as attrition.",
        "Publie-le à côté du nombre d'utilisateurs actifs, toujours — c'est le couple qui rend une hausse lisible comme de la croissance plutôt que comme de l'attrition.",
      ),
    ],
    inTheTour: {
      questionId: "rev-2",
      body: t(
        "The Tour asks whether you know your LTV, even roughly — 20 points for yes, 7 for an order of magnitude, 0 for no. ARPU is the first of the three inputs, and the easiest: most teams who cannot answer the LTV question could compute their ARPU this afternoon, because the revenue and the user count are both already in a dashboard. What is usually missing is the average lifetime, which needs a churn rate — which is why the 0-point answer here so often travels with a 0 on the retention questions.",
        "Le Tour demande si tu connais ta LTV, même approximativement — 20 points pour oui, 7 pour un ordre de grandeur, 0 pour non. L'ARPU est la première des trois entrées, et la plus facile : la plupart des équipes qui ne savent pas répondre à la question de la LTV pourraient calculer leur ARPU cet après-midi, parce que le revenu et le nombre d'utilisateurs sont déjà tous les deux dans un tableau de bord. Ce qui manque en général, c'est la durée de vie moyenne, qui demande un taux de churn — et c'est pourquoi la réponse à 0 point voyage si souvent avec un 0 sur les questions de rétention.",
      ),
    },
    faq: [
      {
        question: t("ARPU or ARPPU — which should I use?", "ARPU ou ARPPU — lequel utiliser ?"),
        answer: t(
          "Whichever matches the decision. Judging acquisition spend needs ARPU, because you pay to acquire sign-ups and only some of them convert. Judging a price change needs ARPPU, because free users are not affected by it. Using the wrong one makes a freemium product look either unaffordable to acquire or implausibly lucrative.",
          "Celui qui correspond à la décision. Juger une dépense d'acquisition demande l'ARPU, parce qu'on paie pour acquérir des inscriptions dont une partie seulement convertit. Juger un changement de prix demande l'ARPPU, parce que les utilisateurs gratuits n'en sont pas affectés. Prendre le mauvais fait passer un produit freemium soit pour inabordable à acquérir, soit pour invraisemblablement lucratif.",
        ),
      },
      {
        question: t("What is the difference with LTV?", "Quelle différence avec la LTV ?"),
        answer: t(
          "ARPU is per period, LTV is over a lifetime: multiply ARPU by gross margin and by the average number of periods a customer stays. That makes ARPU the reliable half of the pair — it is measured, while the lifetime is projected, and the projection is where most LTV disagreements actually live.",
          "L'ARPU est par période, la LTV sur une durée de vie : multiplie l'ARPU par la marge brute et par le nombre moyen de périodes pendant lesquelles un client reste. Ce qui fait de l'ARPU la moitié fiable du couple — il est mesuré, là où la durée de vie est projetée, et c'est dans cette projection que vivent la plupart des désaccords sur la LTV.",
        ),
      },
      {
        question: t("Does a rising ARPU mean the business is growing?", "Un ARPU en hausse veut-il dire que l'entreprise grandit ?"),
        answer: t(
          "Not on its own. Lose your smallest users and the average of those remaining rises without a single euro being added. Read it with the active user count and with total revenue: growth is all three moving the right way, and ARPU alone can move the right way while the other two do not.",
          "Pas en soi. Perds tes plus petits utilisateurs et la moyenne de ceux qui restent monte sans qu'un euro ait été ajouté. Lis-le avec le nombre d'utilisateurs actifs et le revenu total : la croissance, c'est les trois qui vont dans le bon sens, et l'ARPU seul peut y aller pendant que les deux autres non.",
        ),
      },
      {
        question: t("Monthly or annual?", "Mensuel ou annuel ?"),
        answer: t(
          "Monthly for steering, and stated as such. Where contracts are annual, the monthly equivalent is the comparable figure, and mixing an annual ARPU into a monthly series produces a twelve-fold step that reads like a spectacular quarter.",
          "Mensuel pour piloter, et annoncé comme tel. Là où les contrats sont annuels, l'équivalent mensuel est le chiffre comparable, et mélanger un ARPU annuel dans une série mensuelle produit une marche d'un facteur douze qui se lit comme un trimestre spectaculaire.",
        ),
      },
    ],
  },

  "north-star-metric": {
    formula: {
      expression: t(
        "North Star Metric = users who get value × how often they get it × how much value each time — one number, three input levers",
        "North Star Metric = utilisateurs qui obtiennent de la valeur × fréquence à laquelle ils l'obtiennent × valeur à chaque fois — un chiffre, trois leviers d'entrée",
      ),
      terms: [
        {
          symbol: t("Value delivered, not activity", "Valeur délivrée, pas activité"),
          meaning: t(
            "The metric counts a moment where the user got what they came for — a night booked, a message read by a teammate, a report sent — never a proxy that can be inflated without anyone being better off (page views, sign-ups, sessions).",
            "La métrique compte un moment où l'utilisateur a obtenu ce pour quoi il est venu — une nuit réservée, un message lu par un collègue, un rapport envoyé — jamais un indicateur gonflable sans que personne ne s'en porte mieux (pages vues, inscriptions, sessions).",
          ),
        },
        {
          symbol: t("Input metrics", "Métriques d'entrée"),
          meaning: t(
            "The three factors are what teams actually work on: breadth (more users reaching the moment — activation), frequency (retention), depth (engagement or monetisation). The North Star is the output; nobody moves it directly.",
            "Les trois facteurs sont ce sur quoi les équipes travaillent vraiment : l'étendue (plus d'utilisateurs atteignant le moment — activation), la fréquence (rétention), la profondeur (engagement ou monétisation). La North Star est la sortie ; personne ne la fait bouger directement.",
          ),
        },
        {
          symbol: t("Leading, not lagging", "Avancée, pas retardée"),
          meaning: t(
            "Revenue is a result of value delivered months earlier; the North Star should move before revenue does, so that it predicts it. If your North Star is revenue, you're reading the rear-view mirror.",
            "Le revenu est le résultat d'une valeur délivrée des mois plus tôt ; la North Star doit bouger avant le revenu, pour le prédire. Si ta North Star est le revenu, tu lis le rétroviseur.",
          ),
        },
      ],
      note: t(
        "The test of a good North Star is a single question: if this number doubles and nothing else changes, is the business clearly better off? Sign-ups fail it (they could all churn). Nights booked passes it. So does \"weekly active teams\" for a collaboration tool — as long as \"active\" means doing the valuable thing.",
        "Le test d'une bonne North Star tient en une question : si ce chiffre double et que rien d'autre ne change, l'entreprise va-t-elle clairement mieux ? Le « nombre d'inscriptions » ne fonctionne pas : tous ces inscrits pourraient churner le lendemain. Les « nuits réservées » fonctionnent. « Équipes actives par semaine » fonctionne aussi, pour un outil de collaboration — tant qu'« actif » veut dire faire la chose qui a de la valeur.",
      ),
    },
    example: {
      title: t("Choosing one for a B2B reporting tool", "En choisir une pour un outil de reporting B2B"),
      steps: [
        t(
          "Candidates: sign-ups per week (fails the test — they could all churn), reports created (closer, but a draft nobody reads is not value), monthly revenue (lags by months and says nothing about why).",
          "Candidates : inscriptions par semaine (échoue au test — elles pourraient toutes partir), rapports créés (plus proche, mais un brouillon que personne ne lit n'est pas de la valeur), revenu mensuel (en retard de plusieurs mois et muet sur le pourquoi).",
        ),
        t(
          "Chosen: reports sent to at least one recipient per week. It is the aha moment repeated; it requires a retained user; a team that sends more is a team getting more value.",
          "Retenue : rapports envoyés à au moins un destinataire par semaine. C'est le moment « aha » répété ; ça demande un utilisateur fidèle ; une équipe qui en envoie plus est une équipe qui obtient plus de valeur.",
        ),
        t(
          "Decomposed: 1,200 sending accounts × 1.8 reports a week × 3.1 recipients each. Three teams, three inputs: onboarding owns the first, product owns the second, sharing owns the third.",
          "Décomposée : 1 200 comptes qui envoient × 1,8 rapport par semaine × 3,1 destinataires chacun. Trois équipes, trois entrées : l'onboarding porte la première, le produit la deuxième, le partage la troisième.",
        ),
        t(
          "Two quarters later, revenue grows 30% — and the North Star had shown it a quarter earlier, when sending accounts crossed 1,500 while revenue was still flat.",
          "Deux trimestres plus tard, le revenu croît de 30 % — et la North Star l'avait montré un trimestre plus tôt, quand les comptes qui envoient ont passé 1 500 alors que le revenu était encore plat.",
        ),
      ],
      takeaway: t(
        "A North Star doesn't replace the AARRR stages; it names which moment in them the whole company is optimising for. The stages then tell you where that moment is being lost.",
        "Une North Star ne remplace pas les étapes AARRR ; elle nomme quel moment, parmi elles, toute l'entreprise optimise. Les étapes disent ensuite où ce moment se perd.",
      ),
    },
    benchmark: [
      t(
        "The canonical examples: Airbnb's nights booked, Facebook's monthly (then daily) active users, Spotify's time spent listening, Slack's messages sent within teams, WhatsApp's messages sent. Each counts value received, and each was picked over a vanity alternative the company could have reported instead.",
        "Les exemples canoniques : les nuits réservées d'Airbnb, les utilisateurs actifs mensuels (puis quotidiens) de Facebook, le temps d'écoute de Spotify, les messages envoyés au sein des équipes chez Slack, les messages envoyés chez WhatsApp. Chacun compte de la valeur reçue, et chacun a été choisi contre une alternative de vanité que l'entreprise aurait pu afficher à la place.",
      ),
      t(
        "One is the right number of North Stars. Two \"North Stars\" means the company hasn't decided; five means it has a dashboard. Teams keep their own input metrics underneath — that is the point of the decomposition.",
        "Une, c'est le bon nombre de North Star. Deux « North Star » veulent dire que l'entreprise n'a pas décidé ; cinq, qu'elle a un tableau de bord. Les équipes gardent leurs métriques d'entrée en dessous — c'est le but de la décomposition.",
      ),
      t(
        "It changes as the business does: a marketplace's North Star at launch (listings created) is not its North Star at scale (transactions completed). Revisit it when the constraint moves, not every quarter.",
        "Elle change avec l'activité : la North Star d'une place de marché au lancement (annonces créées) n'est pas celle qu'elle a à l'échelle (transactions réalisées). Revois-la quand la contrainte se déplace, pas à chaque trimestre.",
      ),
    ],
    howToImprove: [
      t(
        "Start from the aha moment and ask what its repetition looks like: the North Star is usually that moment, counted across all users over a period.",
        "Pars du moment « aha » et demande-toi à quoi ressemble sa répétition : la North Star est en général ce moment, compté sur tous les utilisateurs sur une période.",
      ),
      t(
        "Run the doubling test on every candidate — \"if this doubles and nothing else moves, are we better off?\" — and discard the ones that fail, however convenient to report.",
        "Fais passer le test du doublement à chaque candidate — « si ça double et que rien d'autre ne bouge, on va mieux ? » — et écarte celles qui échouent, aussi pratiques soient-elles à afficher.",
      ),
      t(
        "Decompose it into three or four input metrics and give each one an owner. A North Star nobody can move is a slogan.",
        "Décompose-la en trois ou quatre métriques d'entrée et donne un responsable à chacune. Une North Star que personne ne peut faire bouger est un slogan.",
      ),
      t(
        "Put it at the top of the one page the team looks at weekly, with the AARRR stage metrics underneath. The star says where you're going; the stages say what's in the way.",
        "Mets-la en haut de la page que l'équipe regarde chaque semaine, avec les métriques des étapes AARRR en dessous. L'étoile dit où tu vas ; les étapes disent ce qui est sur le chemin.",
      ),
    ],
    inTheTour: {
      questionId: "act-2",
      body: t(
        "The Tour doesn't ask what your North Star is — but two of its questions are the ones a North Star is built from: \"Do you know what percentage of users reach that moment?\" (Activation: 20 for tracked precisely, 7 for a rough sense, 0 for no visibility) and \"Do you track a retention rate?\" (Retention). A team that answers 20 to both has the breadth and frequency terms of the formula above; the North Star is one multiplication away. A team that answers 0 to both cannot have one, whatever its slide says.",
        "Le Tour ne demande pas ta North Star — mais deux de ses questions sont celles dont une North Star se construit : « Sais-tu quel pourcentage d'utilisateurs atteint ce moment ? » (Activation : 20 pour suivi précisément, 7 pour une intuition approximative, 0 pour aucune visibilité) et « Suis-tu un taux de rétention ? » (Retention). Une équipe qui répond 20 aux deux a les termes d'étendue et de fréquence de la formule ci-dessus ; la North Star est à une multiplication de là. Une équipe qui répond 0 aux deux ne peut pas en avoir une, quoi qu'en dise sa slide.",
      ),
    },
    faq: [
      {
        question: t("Is revenue a good North Star Metric?", "Le revenu est-il une bonne North Star ?"),
        answer: t(
          "Almost never, for two reasons: it lags value by months, so it can't guide this quarter's work, and it can rise while users get less value (price increases, aggressive upsells) — right up until it collapses. Revenue is the goal; the North Star is the value creation that produces it. Businesses whose value moment is the payment itself (a marketplace's transaction) are the exception, and even they count transactions, not euros.",
          "Presque jamais, pour deux raisons : il est en retard de plusieurs mois sur la valeur, donc il ne peut pas guider le travail du trimestre, et il peut monter pendant que les utilisateurs reçoivent moins de valeur (hausses de prix, upsells agressifs) — jusqu'à ce qu'il s'effondre. Le revenu est l'objectif ; la North Star est la création de valeur qui le produit. Les activités dont le moment de valeur est le paiement lui-même (la transaction d'une place de marché) sont l'exception, et même elles comptent des transactions, pas des euros.",
        ),
      },
      {
        question: t("North Star Metric vs. OKRs — how do they fit together?", "North Star et OKR, comment ça s'articule ?"),
        answer: t(
          "The North Star is the long-lived measure of value the company optimises; OKRs are quarterly commitments to move specific input metrics beneath it. A good OKR names an input (activation rate from 23% to 30%) and can explain, in one sentence, how it moves the star. OKRs that can't are activity dressed as outcomes.",
          "La North Star est la mesure durable de valeur que l'entreprise optimise ; les OKR sont des engagements trimestriels à faire bouger des métriques d'entrée précises en dessous. Un bon OKR nomme une entrée (taux d'activation de 23 % à 30 %) et peut expliquer, en une phrase, comment il fait bouger l'étoile. Les OKR qui ne le peuvent pas sont de l'activité déguisée en résultat.",
        ),
      },
      {
        question: t(
          "Can a small startup have a North Star, or is it a scale-up thing?",
          "Une petite startup peut-elle avoir une North Star, ou c'est un truc de scale-up ?",
        ),
        answer: t(
          "It's more useful early, when the temptation to chase every number is strongest. A three-person team with one metric that means value — and a habit of asking whether each week's work moved it — makes better decisions than one with a full dashboard. It just needs an aha moment defined first, which is also the first Activation question of the Tour.",
          "C'est plus utile tôt, quand la tentation de courir après tous les chiffres est la plus forte. Une équipe de trois avec une métrique qui veut dire « valeur » — et l'habitude de se demander si le travail de la semaine l'a fait bouger — décide mieux qu'une équipe avec un tableau de bord complet. Il faut juste un moment « aha » défini d'abord, ce qui est aussi la première question Activation du Tour.",
        ),
      },
    ],
  },

  pql: {
    formula: {
      expression: t(
        "PQL lift = (conversion rate of users above the threshold) ÷ (conversion rate of users below it) — and the threshold is only useful if the list it produces is one a human can work",
        "Lift du PQL = (taux de conversion des utilisateurs au-dessus du seuil) ÷ (taux de conversion de ceux en dessous) — et le seuil n'est utile que si la liste qu'il produit est travaillable par un humain",
      ),
      terms: [
        {
          symbol: t("Threshold", "Seuil"),
          meaning: t(
            "A behaviour inside the product — invited a teammate, imported real data, hit a plan limit — not a company size or a job title. That is the whole difference from an MQL, and it is the reason the number means anything.",
            "Un comportement dans le produit — a invité un coéquipier, a importé de vraies données, a atteint une limite d'offre — pas une taille d'entreprise ni un intitulé de poste. C'est toute la différence avec un MQL, et la raison pour laquelle le chiffre veut dire quelque chose.",
          ),
        },
        {
          symbol: t("Lift", "Lift"),
          meaning: t(
            "How much better the qualified group converts than the unqualified one. A threshold with a lift near 1 is not qualifying anybody, it is drawing a line through the middle of your users.",
            "À quel point le groupe qualifié convertit mieux que le groupe non qualifié. Un seuil au lift proche de 1 ne qualifie personne, il trace une ligne au milieu de tes utilisateurs.",
          ),
        },
        {
          symbol: t("List size", "Taille de la liste"),
          meaning: t(
            "How many users cross the threshold in a period. The forgotten half of the definition: a threshold can have a beautiful lift and still qualify more people than anyone could ever contact.",
            "Combien d'utilisateurs franchissent le seuil sur une période. La moitié oubliée de la définition : un seuil peut avoir un lift magnifique et qualifier quand même plus de gens que personne ne pourra jamais contacter.",
          ),
        },
      ],
      note: t(
        "Both halves have to hold. Optimising for lift alone produces thresholds so rare they qualify four people a quarter; optimising for volume produces a list indistinguishable from \"everyone who signed up\".",
        "Les deux moitiés doivent tenir. Optimiser le seul lift produit des seuils si rares qu'ils qualifient quatre personnes par trimestre ; optimiser le volume produit une liste impossible à distinguer de « tous ceux qui se sont inscrits ».",
      ),
    },
    example: {
      title: t("Two thresholds, the same lift, one of them useless", "Deux seuils, le même lift, un seul utilisable"),
      steps: [
        t(
          "5,000 free sign-ups in a quarter, 300 of whom convert to paid: a 6% baseline.",
          "5 000 inscriptions gratuites sur un trimestre, dont 300 passent au payant : une base de 6 %.",
        ),
        t(
          "Threshold A, \"invited a teammate\": 900 users qualify and 135 convert (15%); the other 4,100 produce 165 conversions (4.0%). Lift = 15 ÷ 4.0 ≈ 3.7×.",
          "Seuil A, « a invité un coéquipier » : 900 utilisateurs qualifient et 135 convertissent (15 %) ; les 4 100 autres produisent 165 conversions (4,0 %). Lift = 15 ÷ 4,0 ≈ 3,7×.",
        ),
        t(
          "Threshold B, \"logged in three times\": 3,200 qualify and 260 convert (8.1%); the other 1,800 produce 40 conversions (2.2%). Lift = 8.1 ÷ 2.2 ≈ 3.7× — identical.",
          "Seuil B, « s'est connecté trois fois » : 3 200 qualifient et 260 convertissent (8,1 %) ; les 1 800 autres produisent 40 conversions (2,2 %). Lift = 8,1 ÷ 2,2 ≈ 3,7× — identique.",
        ),
        t(
          "Same lift, and only one of them is a list. A is 900 people a quarter converting at 15%: about ten contacts a day, each with better-than-even odds of being worth the call. B is 3,200 people at 8%, which is a mailing list with extra steps.",
          "Le même lift, et une seule des deux est une liste. A, c'est 900 personnes par trimestre qui convertissent à 15 % : une dizaine de contacts par jour, chacun avec une chance sérieuse d'en valoir la peine. B, c'est 3 200 personnes à 8 %, autrement dit une liste de diffusion avec des étapes en plus.",
        ),
      ],
      takeaway: t(
        "Lift alone would have rated these two thresholds identically. The second axis — how many people it qualifies, and at what density — is what separates a signal a team can act on from one it will quietly stop opening after three weeks.",
        "Le lift seul aurait noté ces deux seuils à égalité. Le second axe — combien de personnes le seuil qualifie, et à quelle densité — est ce qui sépare un signal sur lequel une équipe peut agir d'un signal qu'elle cessera discrètement d'ouvrir au bout de trois semaines.",
      ),
    },
    benchmark: [
      t(
        "The claim you will meet everywhere is that PQLs convert several times better than MQLs. It is true and the comparison is rigged: a PQL has used the product, an MQL downloaded a PDF. Quoting the ratio proves nothing about your thresholds, because it would hold for almost any behavioural threshold at all.",
        "L'affirmation qu'on croise partout est que les PQL convertissent plusieurs fois mieux que les MQL. C'est vrai et la comparaison est biaisée : un PQL a utilisé le produit, un MQL a téléchargé un PDF. Citer ce rapport ne prouve rien sur tes seuils, parce qu'il tiendrait pour presque n'importe quel seuil comportemental.",
      ),
      t(
        "The only benchmark worth holding is your own baseline conversion rate, measured before any threshold exists. Without it there is no lift to compute, which is why this is the one number to get first.",
        "La seule référence qui vaille est ton propre taux de conversion de base, mesuré avant qu'un seuil n'existe. Sans lui il n'y a pas de lift à calculer, et c'est pour ça que c'est le premier chiffre à obtenir.",
      ),
      t(
        "A threshold that stops working is normal rather than alarming: it means the product changed and the behaviour that used to be a strong signal became routine. Re-deriving it quarterly is maintenance, not a sign the first one was wrong.",
        "Un seuil qui cesse de fonctionner est normal plutôt qu'alarmant : le produit a changé et le comportement qui était un signal fort est devenu banal. Le recalculer chaque trimestre est de l'entretien, pas le signe que le premier était mauvais.",
      ),
    ],
    howToImprove: [
      t(
        "Derive the threshold from data, never from a workshop. Take the users who converted, look at what they did in their first two weeks that the others did not, and test each candidate behaviour for lift and list size.",
        "Dérive le seuil des données, jamais d'un atelier. Prends les utilisateurs qui ont converti, regarde ce qu'ils ont fait dans leurs deux premières semaines que les autres n'ont pas fait, et teste chaque comportement candidat sur le lift et la taille de liste.",
      ),
      t(
        "Check both axes before adopting one, as the example above shows. Write down the lift AND the quarterly count next to every candidate.",
        "Vérifie les deux axes avant d'en adopter un, comme le montre l'exemple ci-dessus. Note le lift ET le nombre trimestriel à côté de chaque candidat.",
      ),
      t(
        "Keep it to a single behaviour a person can read in one sentence. A score built from seven weighted signals cannot be argued with, cannot be debugged, and gets ignored the first time it is wrong.",
        "Garde un comportement unique qu'une personne peut lire en une phrase. Un score construit sur sept signaux pondérés ne se discute pas, ne se débogue pas, et se fait ignorer la première fois qu'il se trompe.",
      ),
      t(
        "Decide what happens when someone crosses it, before you start counting. A PQL nobody contacts and no in-app offer greets is a database column, not a growth mechanism.",
        "Décide de ce qui se passe quand quelqu'un le franchit, avant de commencer à compter. Un PQL que personne ne contacte et qu'aucune offre dans l'app n'accueille est une colonne de base de données, pas un mécanisme de croissance.",
      ),
    ],
    inTheTour: {
      questionId: "act-2",
      body: t(
        "The Tour asks whether you know the percentage of users who reach your activation moment, for 20 points. A PQL threshold is that same measurement pointed at a commercial decision: both ask which behaviour separates the users who got it from the ones who did not, and a team that can answer 20 already owns most of the work. The order matters — defining a PQL before knowing your activation event usually produces a threshold chosen for how easy it is to query rather than for what it predicts.",
        "Le Tour demande si tu connais le pourcentage d'utilisateurs qui atteignent ton moment d'activation, pour 20 points. Un seuil de PQL est cette même mesure pointée vers une décision commerciale : les deux cherchent quel comportement sépare ceux qui ont compris de ceux qui n'ont pas compris, et une équipe qui répond 20 a déjà fait l'essentiel du travail. L'ordre compte — définir un PQL avant de connaître son événement d'activation produit en général un seuil choisi pour sa facilité d'extraction plutôt que pour ce qu'il prédit.",
      ),
    },
    faq: [
      {
        question: t("PQL or MQL?", "PQL ou MQL ?"),
        answer: t(
          "They answer different questions and can coexist. An MQL says someone showed interest in the category; a PQL says someone got value from your product. If you have a free tier or a trial, the second is available to you and is far more predictive — the user has already done the thing a demo would have tried to convince them to do.",
          "Ils répondent à des questions différentes et peuvent coexister. Un MQL dit que quelqu'un s'est intéressé à la catégorie ; un PQL dit que quelqu'un a tiré de la valeur de ton produit. Si tu as un palier gratuit ou un essai, le second t'est accessible et prédit bien mieux — l'utilisateur a déjà fait ce qu'une démo aurait essayé de le convaincre de faire.",
        ),
      },
      {
        question: t("How do I choose the threshold?", "Comment choisir le seuil ?"),
        answer: t(
          "Backwards, from your converted users. List what they did early that non-converters did not, then compute lift and list size for each candidate. Three or four candidates is usually enough to find one that is both predictive and workable, and the exercise takes an afternoon with a database.",
          "À l'envers, en partant de tes clients convertis. Liste ce qu'ils ont fait tôt et que les non-convertis n'ont pas fait, puis calcule le lift et la taille de liste pour chaque candidat. Trois ou quatre candidats suffisent en général pour en trouver un à la fois prédictif et travaillable, et l'exercice prend un après-midi avec une base de données.",
        ),
      },
      {
        question: t("Do I need a sales team to use PQLs?", "Faut-il une équipe commerciale pour utiliser les PQL ?"),
        answer: t(
          "No. The threshold can trigger an in-app offer, an email, or a change in what the product shows — all of which scale without anyone picking up a phone. A sales team lets you use a smaller, higher-lift threshold, but the mechanism works without one.",
          "Non. Le seuil peut déclencher une offre dans l'app, un e-mail, ou un changement dans ce que le produit affiche — autant de choses qui passent à l'échelle sans que personne décroche un téléphone. Une équipe commerciale permet d'utiliser un seuil plus rare et à plus fort lift, mais le mécanisme fonctionne sans elle.",
        ),
      },
      {
        question: t("How many PQLs should we have?", "Combien de PQL faut-il avoir ?"),
        answer: t(
          "As many as whoever acts on them can actually handle, which is a capacity question rather than a marketing one. Set the threshold so the weekly list matches the follow-up you can genuinely do; a threshold producing three times that capacity is producing a backlog and a false sense of pipeline.",
          "Autant que ce que peut réellement traiter la personne qui agit dessus, ce qui est une question de capacité et non de marketing. Règle le seuil pour que la liste hebdomadaire corresponde au suivi que tu peux honnêtement assurer ; un seuil qui produit le triple de cette capacité produit un arriéré et une fausse impression de pipeline.",
        ),
      },
    ],
  },

  "upsell-cross-sell": {
    formula: {
      expression: t(
        "Expansion rate = MRR added by existing customers in the period (upgrades, added seats, extra modules) ÷ MRR at the start of the period",
        "Taux d'expansion = MRR ajouté par les clients existants sur la période (montées en gamme, sièges ajoutés, modules en plus) ÷ MRR de début de période",
      ),
      terms: [
        {
          symbol: t("Upsell", "Upsell"),
          meaning: t(
            "The same customer paying more for more of the same: a higher tier, more seats, more usage. It rides on a pricing model that has room above the plan the customer chose.",
            "Le même client qui paie plus pour plus de la même chose : un palier supérieur, plus de sièges, plus d'usage. Ça repose sur un modèle de prix qui a de la place au-dessus de l'offre choisie par le client.",
          ),
        },
        {
          symbol: t("Cross-sell", "Cross-sell"),
          meaning: t(
            "The same customer buying something adjacent: a second module, a companion product, a service. It rides on knowing which customers have the adjacent problem — which means usage data, not a list of everyone.",
            "Le même client qui achète quelque chose d'adjacent : un second module, un produit compagnon, un service. Ça repose sur le fait de savoir quels clients ont le problème adjacent — donc des données d'usage, pas la liste de tout le monde.",
          ),
        },
        {
          symbol: t("Against churn", "Face au churn"),
          meaning: t(
            "Expansion rate minus gross revenue churn is net revenue churn; when expansion wins, net churn is negative and the base grows without a single new customer. That comparison is the whole reason this lever exists.",
            "Le taux d'expansion moins le churn revenu brut donne le churn revenu net ; quand l'expansion l'emporte, le churn net est négatif et la base grandit sans un seul nouveau client. Cette comparaison est toute la raison d'être de ce levier.",
          ),
        },
      ],
      note: t(
        "It is almost always cheaper to sell more to a customer who already trusts you than to acquire one who doesn't — the cost of an expansion is a conversation, the cost of a new customer is a CAC. But the timing rule is absolute: no offer before the customer has reached their aha moment on what they already pay for. An upsell pitched to someone who hasn't got value yet reads as a sales tactic, and is remembered as one.",
        "Il est presque toujours moins cher de vendre plus à un client qui te fait déjà confiance que d'en acquérir un qui ne te connaît pas — le coût d'une expansion est une conversation, le coût d'un nouveau client est un CAC. Mais la règle de timing est absolue : aucune offre avant que le client ait atteint son moment « aha » sur ce qu'il paie déjà. Un upsell proposé à quelqu'un qui n'a pas encore obtenu de valeur se lit comme une technique de vente, et reste en mémoire comme telle.",
      ),
    },
    example: {
      title: t("A playbook, written down", "Un playbook, écrit noir sur blanc"),
      steps: [
        t(
          "A project tool with a €50 plan (5 seats) and a €110 plan (15 seats). 400 customers, €20,000 MRR. Until now, upgrades happen when a customer hits the seat limit and finds the pricing page on their own.",
          "Un outil de projet avec une offre à 50 € (5 sièges) et une à 110 € (15 sièges). 400 clients, 20 000 € de MRR. Jusqu'ici, les montées en gamme arrivent quand un client atteint la limite de sièges et trouve la page de tarifs tout seul.",
        ),
        t(
          "Playbook, three lines: (1) at 4 of 5 seats used and at least 30 days of activity, show an in-app note explaining the next tier — never before day 30; (2) at 5 of 5, the founder sends one personal email; (3) any account that added a second project type gets offered the reporting module.",
          "Playbook, trois lignes : (1) à 4 sièges sur 5 utilisés et au moins 30 jours d'activité, afficher une note dans l'app expliquant le palier suivant — jamais avant le 30ᵉ jour ; (2) à 5 sur 5, le fondateur envoie un e-mail personnel ; (3) tout compte qui a ajouté un second type de projet se voit proposer le module de reporting.",
        ),
        t(
          "Before: about 8 upgrades a month, +€480. After a quarter: 15 upgrades (+€900) and 6 module sales at €30 (+€180). Expansion rate: from 2.4% to 5.4% of opening MRR.",
          "Avant : environ 8 montées en gamme par mois, +480 €. Après un trimestre : 15 montées (+900 €) et 6 ventes de module à 30 € (+180 €). Taux d'expansion : de 2,4 % à 5,4 % du MRR de départ.",
        ),
        t(
          "Gross revenue churn that month: 5%. Net revenue churn went from +2.6% to −0.4%: the existing base now grows by itself, before counting a single new customer.",
          "Churn revenu brut ce mois-là : 5 %. Le churn revenu net est passé de +2,6 % à −0,4 % : la base existante grandit maintenant toute seule, avant de compter le moindre nouveau client.",
        ),
      ],
      takeaway: t(
        "Nothing in the playbook is clever. What changed is that the offer now happens at a signal, after value, every time — instead of whenever a customer stumbles onto the pricing page.",
        "Rien dans le playbook n'est malin. Ce qui a changé, c'est que l'offre arrive maintenant sur un signal, après la valeur, à chaque fois — au lieu de quand un client tombe par hasard sur la page de tarifs.",
      ),
    },
    benchmark: [
      t(
        "The best B2B SaaS companies report net revenue retention of 110-130%, which means expansion outruns churn by 10-30 points a year; below 100%, every year starts with a smaller base than the last. Expansion is where most of that gap is made.",
        "Les meilleures entreprises SaaS B2B affichent une rétention nette de revenu de 110-130 %, c'est-à-dire une expansion qui dépasse le churn de 10 à 30 points par an ; sous 100 %, chaque année commence avec une base plus petite que la précédente. L'expansion est là où l'essentiel de cet écart se fait.",
      ),
      t(
        "A commonly cited pattern: winning an expansion from an existing customer costs a fraction of winning a new one — figures of a quarter to a third of the CAC are often quoted, and the exact number matters less than the direction.",
        "Un schéma couramment cité : gagner une expansion chez un client existant coûte une fraction de ce que coûte un nouveau client — on cite souvent le quart au tiers du CAC, et le chiffre exact compte moins que la direction.",
      ),
      t(
        "Pricing models without room to grow (one flat plan, unlimited everything) make expansion structurally impossible. That is a pricing decision, and it is usually taken by accident.",
        "Les modèles de prix sans place pour grandir (une offre unique, tout illimité) rendent l'expansion structurellement impossible. C'est une décision de pricing, et elle est en général prise par accident.",
      ),
    ],
    howToImprove: [
      t(
        "Give the pricing somewhere to go: tiers, seats, usage or modules. No amount of playbook fixes a single flat plan.",
        "Donne au pricing quelque part où aller : paliers, sièges, usage ou modules. Aucun playbook ne répare une offre unique et plate.",
      ),
      t(
        "Define the signals — usage near a limit, a second team, a feature request, a support question about something the next tier does — and trigger the offer from them, never from a calendar.",
        "Définis les signaux — usage proche d'une limite, une seconde équipe, une demande de fonctionnalité, une question au support sur quelque chose que le palier suivant fait — et déclenche l'offre depuis eux, jamais depuis un calendrier.",
      ),
      t(
        "Gate every offer on value already received: a minimum tenure, the aha moment reached, or an activity threshold. The fastest way to lose an expansion is to ask for it too early.",
        "Conditionne chaque offre à de la valeur déjà reçue : une ancienneté minimale, le moment « aha » atteint, ou un seuil d'activité. Le moyen le plus rapide de perdre une expansion est de la demander trop tôt.",
      ),
      t(
        "Make the upgrade the path of least resistance: one click from the place where the limit was hit, with the price and the difference in plain words.",
        "Fais de la montée en gamme le chemin de moindre résistance : un clic depuis l'endroit où la limite a été atteinte, avec le prix et la différence en mots simples.",
      ),
      t(
        "Track expansion MRR as its own line, monthly, next to churn. \"Some ideas, not systematic\" is the Tour's 7-point answer because ideas don't show up on that line.",
        "Suis le MRR d'expansion sur sa propre ligne, chaque mois, à côté du churn. « Quelques idées, rien de systématique » est la réponse à 7 points du Tour parce que des idées n'apparaissent pas sur cette ligne.",
      ),
    ],
    inTheTour: {
      questionId: "rev-3",
      body: t(
        "\"Do you have an expansion playbook (upsell/cross-sell)?\" is the third and last question of the Tour — 20 for active and used, 7 for some ideas, not systematic, 0 for nothing. It closes the Revenue stage after pricing and LTV because it is the lever that turns both into growth without new acquisition. Answering 0 here is common and rarely fatal on its own; a 0 here next to a 0 on retention is the combination the whole Tour exists to point out.",
        "« As-tu un playbook d'expansion (upsell/cross-sell) ? » est la troisième et dernière question du Tour — 20 pour actif et utilisé, 7 pour quelques idées, rien de systématique, 0 pour rien. Elle ferme l'étape Revenue après le pricing et la LTV parce que c'est le levier qui transforme les deux en croissance sans nouvelle acquisition. Répondre 0 ici est courant et rarement fatal en soi ; un 0 ici à côté d'un 0 en rétention est la combinaison que tout le Tour existe pour pointer.",
      ),
    },
    faq: [
      {
        question: t("What's the difference between upsell and cross-sell?", "Quelle différence entre upsell et cross-sell ?"),
        answer: t(
          "Upsell: more of the same thing — a bigger plan, more seats, more usage. Cross-sell: a different thing — a second module, an add-on, a service. Upsell is driven by the customer's own growth and needs a pricing model with tiers; cross-sell is driven by adjacent problems and needs usage data to know who has them. Most companies should do the first before the second.",
          "Upsell : plus de la même chose — une offre plus grande, plus de sièges, plus d'usage. Cross-sell : une chose différente — un second module, une option, un service. L'upsell est porté par la croissance du client lui-même et demande un modèle à paliers ; le cross-sell est porté par des problèmes adjacents et demande des données d'usage pour savoir qui les a. La plupart des entreprises devraient faire le premier avant le second.",
        ),
      },
      {
        question: t("When is the right moment to propose an upgrade?", "Quel est le bon moment pour proposer une montée en gamme ?"),
        answer: t(
          "After value, at a signal. After value means the customer has reached the aha moment on what they already pay for — a minimum tenure or an activity threshold is the practical proxy. At a signal means the trigger is something they did (approached a limit, added a team, asked about a feature), not something on your calendar. Both conditions, every time.",
          "Après la valeur, sur un signal. Après la valeur veut dire que le client a atteint le moment « aha » sur ce qu'il paie déjà — une ancienneté minimale ou un seuil d'activité en est l'indicateur pratique. Sur un signal veut dire que le déclencheur est quelque chose qu'il a fait (s'approcher d'une limite, ajouter une équipe, poser une question sur une fonctionnalité), pas quelque chose dans ton calendrier. Les deux conditions, à chaque fois.",
        ),
      },
      {
        question: t("How does expansion relate to negative churn?", "Quel rapport entre expansion et churn négatif ?"),
        answer: t(
          "Directly: net revenue churn = gross revenue churn − expansion. When expansion in a period exceeds what cancellations and downgrades removed, net churn is negative and the existing base grows on its own. Expansion is the only lever that can make that happen — retention work can bring gross churn towards zero, but never below it.",
          "Direct : churn revenu net = churn revenu brut − expansion. Quand l'expansion d'une période dépasse ce que les résiliations et rétrogradations ont retiré, le churn net est négatif et la base existante grandit toute seule. L'expansion est le seul levier qui peut produire ça — le travail de rétention peut ramener le churn brut vers zéro, jamais en dessous.",
        ),
      },
    ],
  },
};
