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
 * TODO: à relire (REVIEW-02) — R2-11, les cinq lots : cac, ltv, churn ;
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
          "Publicité et sponsoring : 18 000 €. Outils marketing et freelances : 6 000 €. Deux personnes ventes et marketing, charges comprises : 36 000 €. Total : 60 000 €.",
        ),
        t("New paying customers over the quarter: 120.", "Nouveaux clients payants sur le trimestre : 120."),
        t("CAC = 60,000 ÷ 120 = €500 per customer.", "CAC = 60 000 ÷ 120 = 500 € par client."),
        t(
          "Counting ads alone would have given 18,000 ÷ 120 = €150 — a third of the real number. That gap is the most common CAC mistake.",
          "Ne compter que la pub aurait donné 18 000 ÷ 120 = 150 € — le tiers du vrai chiffre. Cet écart est l'erreur de CAC la plus fréquente.",
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
          "Non. Le CPA (coût par acquisition) mesure en général le coût d'une action dans un canal — un lead, une inscription, une installation — et c'est la plateforme publicitaire qui le rapporte. Le CAC mesure le coût d'un client payant, sur tout ce que tu as dépensé. Un CPA de 10 € à l'inscription avec 5 % de passage au payant, c'est un CAC de 200 € avant d'ajouter le moindre salaire.",
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
            "La part de ce revenu qui reste après le coût direct de service du client — hébergement, support, frais de paiement. L'ignorer surestime la LTV : une activité à 20 % de marge et une à 80 % ne valent pas la même chose par client.",
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
          "Les clients paient 50 € par mois en moyenne ; la marge brute est de 80 %, donc chaque mois vaut 40 €.",
        ),
        t(
          "With 5% monthly churn, expected lifetime is 1 ÷ 0.05 = 20 months. LTV = 40 × 20 = €800.",
          "Avec 5 % de churn mensuel, la durée de vie attendue est 1 ÷ 0,05 = 20 mois. LTV = 40 × 20 = 800 €.",
        ),
        t(
          "With 2% monthly churn, lifetime becomes 50 months. LTV = 40 × 50 = €2,000.",
          "Avec 2 % de churn mensuel, la durée de vie passe à 50 mois. LTV = 40 × 50 = 2 000 €.",
        ),
        t(
          "Against the €500 CAC from the CAC example: 1.6:1 in the first case, 4:1 in the second. Same product, same price, same acquisition — retention alone decides whether the business works.",
          "Face au CAC de 500 € de l'exemple sur le CAC : 1,6:1 dans le premier cas, 4:1 dans le second. Même produit, même prix, même acquisition — la rétention seule décide si l'entreprise fonctionne.",
        ),
      ],
      takeaway: t(
        "Note what the 2% case implies: 50 months is more than four years. Most practitioners cap lifetime at three to five years, because a model that pays you back in year six is a model you cannot verify yet.",
        "Regarde ce qu'implique le cas à 2 % : 50 mois, c'est plus de quatre ans. La plupart des praticiens plafonnent la durée de vie à trois à cinq ans, parce qu'un modèle qui te rembourse la sixième année est un modèle que tu ne peux pas encore vérifier.",
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
        "\"Do you know your LTV, even roughly?\" is the second Revenue question. \"A solid estimate\" scores 20, \"a very rough guess\" 7, \"no idea\" 0, averaged with your pricing and expansion answers into the Revenue stage score. Revenue is often the pillar founders score lowest on — not because they don't charge, but because they have never connected what they charge to how long people stay.",
        "« Connais-tu ta LTV, même grossièrement ? » est la deuxième question Revenue. « Une estimation solide » vaut 20, « une estimation très approximative » 7, « aucune idée » 0, la moyenne avec tes réponses sur le pricing et l'expansion donnant le score de l'étape Revenue. Revenue est souvent le pilier où les fondateurs scorent le plus bas — non pas qu'ils ne facturent pas, mais parce qu'ils n'ont jamais relié ce qu'ils facturent au temps que les gens restent.",
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
        "Churn et rétention sont les deux faces d'un même chiffre : 5 % de churn mensuel, c'est 95 % de rétention mensuelle. La rétention se lit en général par cohorte dans le temps (J7, J30, mois 6) ; le churn se lit en général comme un taux par période. Mêmes clients, deux lectures.",
      ),
    },
    example: {
      title: t("One month, three churns", "Un mois, trois churns"),
      steps: [
        t(
          "Start of month: 400 customers, €20,000 MRR. During the month: 12 cancel (€600 MRR), 8 downgrade (−€400 MRR), 15 upgrade (+€900 MRR).",
          "Début de mois : 400 clients, 20 000 € de MRR. Pendant le mois : 12 résilient (600 € de MRR), 8 rétrogradent (−400 € de MRR), 15 montent en gamme (+900 € de MRR).",
        ),
        t("Logo churn: 12 ÷ 400 = 3%.", "Churn logo : 12 ÷ 400 = 3 %."),
        t("Gross revenue churn: (600 + 400) ÷ 20,000 = 5%.", "Churn revenu brut : (600 + 400) ÷ 20 000 = 5 %."),
        t(
          "Net revenue churn: (600 + 400 − 900) ÷ 20,000 = 0.5%. Had upgrades brought €1,200 instead of €900, net churn would be −1%: negative churn, a revenue base growing on its own.",
          "Churn revenu net : (600 + 400 − 900) ÷ 20 000 = 0,5 %. Si les montées en gamme avaient rapporté 1 200 € au lieu de 900 €, le churn net serait de −1 % : du churn négatif, une base de revenu qui grandit toute seule.",
        ),
      ],
      takeaway: t(
        "Three true numbers for one month, from 3% to 0.5%. Whoever reports \"our churn is X\" without saying which one is either simplifying — or choosing the flattering one.",
        "Trois chiffres vrais pour un même mois, de 3 % à 0,5 %. Qui annonce « notre churn est de X » sans dire lequel simplifie — ou choisit le plus flatteur.",
      ),
    },
    benchmark: [
      t(
        "Commonly cited ranges for B2B SaaS: around 1-2% monthly logo churn is considered healthy for products sold to small businesses; enterprise products aim for single-digit annual churn, because their customers are fewer and each loss is large. B2C subscriptions routinely run far higher and live off re-acquisition.",
        "Fourchettes couramment citées en SaaS B2B : autour de 1-2 % de churn logo mensuel est considéré comme sain pour des produits vendus aux petites entreprises ; les produits entreprise visent un churn annuel à un chiffre, parce que leurs clients sont moins nombreux et que chaque perte pèse lourd. Les abonnements B2C tournent couramment bien plus haut et vivent de réacquisition.",
      ),
      t(
        "Small monthly numbers compound: 3% a month is not 36% a year but 1 − 0.97¹² ≈ 31% — a third of the customer base gone every year. Read monthly churn in years before deciding it's fine.",
        "Les petits chiffres mensuels se composent : 3 % par mois, ce n'est pas 36 % par an mais 1 − 0,97¹² ≈ 31 % — un tiers de la base client qui disparaît chaque année. Lis ton churn mensuel à l'échelle de l'année avant de décider que ça va.",
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
          "Pas en multipliant par douze. Churn annuel = 1 − (1 − churn mensuel)¹². À 2 % par mois, ça donne 1 − 0,98¹² ≈ 21,5 %, pas 24 % ; à 5 %, ≈ 46 %, pas 60 %. L'écart grandit avec le taux, et la version multipliée surestime toujours.",
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
        "Rétention et churn décrivent les mêmes clients de deux côtés : 95 % de rétention mensuelle, c'est 5 % de churn mensuel. La rétention se lit comme une courbe sur la vie d'une cohorte ; le churn comme un taux par période. La rétention pour comprendre le produit, le churn pour piloter l'activité.",
      ),
    },
    example: {
      title: t("Two cohorts, same D30, opposite futures", "Deux cohortes, même J30, avenirs opposés"),
      steps: [
        t(
          "Cohort A: 1,000 sign-ups. Active on D1: 600. D7: 380. D30: 250. D60: 245. D90: 242.",
          "Cohorte A : 1 000 inscrits. Actifs à J1 : 600. J7 : 380. J30 : 250. J60 : 245. J90 : 242.",
        ),
        t(
          "Cohort B: 1,000 sign-ups. D1: 700. D7: 450. D30: 250. D60: 150. D90: 90.",
          "Cohorte B : 1 000 inscrits. J1 : 700. J7 : 450. J30 : 250. J60 : 150. J90 : 90.",
        ),
        t(
          "Both report \"25% D30 retention\". A's curve flattens at about 24%: a quarter of the people who tried it made it a habit. B's keeps sliding: it will reach zero, just slowly.",
          "Les deux annoncent « 25 % de rétention à J30 ». La courbe de A s'aplatit vers 24 % : un quart des gens qui ont essayé en ont fait une habitude. Celle de B continue de glisser : elle atteindra zéro, juste lentement.",
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
        "Les fourchettes varient énormément selon la catégorie, donc compare dans la tienne. Ordres de grandeur couramment cités : les applis mobiles grand public gardent souvent 20-30 % d'une cohorte à J30 et moins de 10 % à J90 ; le SaaS se lit en mois, et 97-99 % de rétention client mensuelle est la fourchette habituellement qualifiée de saine pour des produits vendus aux petites entreprises, plus haut encore en entreprise.",
      ),
      t(
        "The shape matters more than the level: a curve that flattens at 10% describes a real product with a small core; a curve at 40% still heading down at month three describes a novelty. Investors read the flattening before they read the number.",
        "La forme compte plus que le niveau : une courbe qui s'aplatit à 10 % décrit un vrai produit avec un petit noyau ; une courbe à 40 % encore en baisse au troisième mois décrit une nouveauté. Les investisseurs lisent l'aplatissement avant de lire le chiffre.",
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
        "The first Retention question is the simplest and the most discriminating: \"Do you track a retention rate (D7/D30 or similar)?\" — 20 for tracked and reviewed regularly, 7 for \"we can pull it, but rarely look\", 0 for no. It is averaged with the re-engagement mechanism and the cause of churn. Retention is the pillar whose weak band (0-9) costs the most elsewhere: LTV, an affordable CAC and referral all sit downstream of it.",
        "La première question Retention est la plus simple et la plus discriminante : « Suis-tu un taux de rétention (J7/J30 ou équivalent) ? » — 20 pour suivi et revu régulièrement, 7 pour « on peut le sortir, mais on regarde rarement », 0 pour non. Elle fait moyenne avec le mécanisme de réengagement et la cause du churn. Retention est le pilier dont la bande faible (0-9) coûte le plus ailleurs : la LTV, un CAC supportable et le parrainage sont tous en aval.",
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
          "Mêmes clients, signe opposé, angle différent. La rétention suit une cohorte dans le temps et se dessine en courbe ; le churn est la part perdue sur une période et se cite en taux. 90 % de rétention mensuelle et 10 % de churn mensuel sont un seul fait. La rétention pour savoir si le produit fonctionne, le churn pour savoir ce que l'activité perd ce mois-ci.",
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
          "Un outil de gestion de projet regarde les utilisateurs encore actifs au troisième mois et se demande ce qu'ils ont tous fait la première semaine. 82 % avaient invité au moins un collègue ; parmi ceux partis le premier mois, 11 %.",
        ),
        t(
          "Aha moment: \"first teammate invited\". Window: 7 days. Definition written down, event instrumented.",
          "Moment « aha » : « premier collègue invité ». Fenêtre : 7 jours. Définition écrite, événement instrumenté.",
        ),
        t(
          "Last month: 2,400 sign-ups, 552 invited someone within a week. Activation rate = 552 ÷ 2,400 = 23%.",
          "Le mois dernier : 2 400 inscrits, 552 ont invité quelqu'un dans la semaine. Taux d'activation = 552 ÷ 2 400 = 23 %.",
        ),
        t(
          "The onboarding used to end on a tour of features. It now ends on the invite screen. Next month: 31%. Same acquisition spend, a third more users who might stay.",
          "L'onboarding se terminait sur une visite des fonctionnalités. Il se termine maintenant sur l'écran d'invitation. Le mois suivant : 31 %. Même dépense d'acquisition, un tiers d'utilisateurs en plus susceptibles de rester.",
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
        "Il n'y a pas de taux d'activation universel : le chiffre dépend entièrement de l'exigence de ton moment « aha ». Les ordres de grandeur couramment cités pour un onboarding SaaS se situent entre 20 % et 40 % des inscrits — souvent plus bas pour les essais gratuits, plus haut pour les produits sur invitation. Compare d'un mois à l'autre, pas à un tableau.",
      ),
      t(
        "Time-to-value is the companion metric: how long the median user takes to reach the moment. Minutes for a consumer app, a day or two for a team tool, weeks for software that needs data imported. Halving it usually does more for retention than any feature.",
        "Le time-to-value est la métrique compagne : combien de temps l'utilisateur médian met à atteindre le moment. Des minutes pour une appli grand public, un jour ou deux pour un outil d'équipe, des semaines pour un logiciel qui demande d'importer des données. Le diviser par deux fait en général plus pour la rétention que n'importe quelle fonctionnalité.",
      ),
      t(
        "Activation is the cheapest pillar to move: it happens inside a flow you fully control, with users who already chose to come. A ten-point gain here is worth more than a ten-point gain in sign-up conversion, because every activated user carries into retention.",
        "L'activation est le pilier le moins cher à faire bouger : ça se passe dans un parcours que tu contrôles entièrement, avec des utilisateurs qui ont déjà choisi de venir. Dix points gagnés ici valent plus que dix points de conversion à l'inscription, parce que chaque utilisateur activé se prolonge dans la rétention.",
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
          "No, and confusing the two is the most expensive mistake in this pillar. Sign-up conversion is visitors → accounts; it lives on the landing page and measures the promise. Activation is accounts → people who got the value; it lives in the product and measures whether the promise was kept. You can double the first while the second stays flat, and the business won't move.",
          "Non, et confondre les deux est l'erreur la plus coûteuse de ce pilier. La conversion à l'inscription, c'est visiteurs → comptes ; elle se joue sur la page d'accueil et mesure la promesse. L'activation, c'est comptes → personnes qui ont obtenu la valeur ; elle se joue dans le produit et mesure si la promesse a été tenue. Tu peux doubler la première pendant que la seconde reste plate, et l'activité ne bougera pas.",
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
            "La part de ces expositions qui deviennent un nouvel utilisateur — pas un clic, un utilisateur. Un résultat partagé qui fait 100 vues et 4 nouvelles inscriptions convertit à 4 %.",
          ),
        },
        {
          symbol: t("K", "K"),
          meaning: t(
            "New users each existing user brings, on average. K = 0.3 means every 100 users bring 30 more, who bring 9, who bring about 3 — a finite boost of about 43%. K > 1 means the chain never ends on its own.",
            "Le nombre de nouveaux utilisateurs que chaque utilisateur existant amène, en moyenne. K = 0,3 veut dire que 100 utilisateurs en amènent 30, qui en amènent 9, qui en amènent environ 3 — un gain fini d'environ 43 %. K > 1 veut dire que la chaîne ne s'arrête jamais d'elle-même.",
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
          "1 000 utilisateurs. 20 % partagent une fois ; chaque partage est vu par 15 personnes en moyenne : 1 000 × 0,2 × 15 = 3 000 expositions, soit 3 par utilisateur.",
        ),
        t("5% of exposures become a user: K = 3 × 0.05 = 0.15.", "5 % des expositions deviennent un utilisateur : K = 3 × 0,05 = 0,15."),
        t(
          "Total users the loop eventually yields from those 1,000: 1,000 ÷ (1 − 0.15) ≈ 1,176. Referral added 17.6% on top of whatever acquisition paid for.",
          "Total d'utilisateurs que la boucle finit par produire à partir de ces 1 000 : 1 000 ÷ (1 − 0,15) ≈ 1 176. Le parrainage a ajouté 17,6 % à ce que l'acquisition a payé.",
        ),
        t(
          "Double the share of users who share (40%) and K becomes 0.3: 1,000 ÷ 0.7 ≈ 1,429, +43%. At a €500 CAC, that loop is worth about €215 of acquisition per paid user.",
          "Double la part d'utilisateurs qui partagent (40 %) et K passe à 0,3 : 1 000 ÷ 0,7 ≈ 1 429, +43 %. À 500 € de CAC, cette boucle vaut environ 215 € d'acquisition par utilisateur payé.",
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
        "\"Do you measure a viral coefficient or equivalent?\" is the third Referral question — 20 for tracked, 7 for vaguely aware of it, 0 for never measured — after whether a sharing mechanism exists in the product and whether customers actually use it. Referral is the pillar many teams score lowest on, and the one where a 0 is most often honest: the mechanism was never built, so there was nothing to measure.",
        "« Mesures-tu un coefficient viral ou équivalent ? » est la troisième question Referral — 20 pour suivi, 7 pour vaguement conscient de son existence, 0 pour jamais mesuré — après l'existence d'un mécanisme de partage dans le produit et son usage réel par les clients. Referral est le pilier où beaucoup d'équipes scorent le plus bas, et celui où un 0 est le plus souvent honnête : le mécanisme n'a jamais été construit, donc il n'y avait rien à mesurer.",
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
          "Le taux de parrainage est la part d'utilisateurs qui parrainent au moins une personne ; c'est une entrée. K multiplie le nombre d'expositions créées par les utilisateurs par la part qui convertit, sur tous les utilisateurs — c'est la sortie. Un taux de parrainage de 40 % avec des invitations qui ne convertissent jamais donne un K proche de zéro.",
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
        "Multiply the three and you get the channel's yield; divide the channel's cost by that yield and you get its CAC. Acquisition is the pillar where a single blended number hides the most: the whole point is to know this per channel.",
        "Multiplie les trois et tu as le rendement du canal ; divise le coût du canal par ce rendement et tu as son CAC. L'acquisition est le pilier où un chiffre mixte cache le plus de choses : tout l'intérêt est de connaître ça par canal.",
      ),
    },
    example: {
      title: t("Two channels, one flattering average", "Deux canaux, une moyenne flatteuse"),
      steps: [
        t(
          "Paid social: 20,000 visitors a month, 3% sign up (600), 8% of those become customers (48). Cost: €12,000. CAC: €250.",
          "Social payant : 20 000 visiteurs par mois, 3 % s'inscrivent (600), 8 % d'entre eux deviennent clients (48). Coût : 12 000 €. CAC : 250 €.",
        ),
        t(
          "Founder-written articles and SEO: 4,000 visitors, 9% sign up (360), 20% become customers (72). Cost: two days of writing a month, say €2,000 of time. CAC: €28.",
          "Articles écrits par le fondateur et SEO : 4 000 visiteurs, 9 % s'inscrivent (360), 20 % deviennent clients (72). Coût : deux jours d'écriture par mois, disons 2 000 € de temps. CAC : 28 €.",
        ),
        t(
          "Blended: 24,000 visitors, 960 sign-ups, 120 customers, €14,000 — a €117 CAC that describes neither channel.",
          "Mixte : 24 000 visiteurs, 960 inscrits, 120 clients, 14 000 € — un CAC de 117 € qui ne décrit aucun des deux canaux.",
        ),
        t(
          "The channel with a sixth of the traffic brings 60% of the customers, at a ninth of the cost. Without per-channel numbers, the obvious next move — \"more ads, traffic is up\" — is exactly wrong.",
          "Le canal qui fait un sixième du trafic amène 60 % des clients, pour un neuvième du coût. Sans chiffres par canal, le geste évident — « plus de pub, le trafic monte » — est exactement le mauvais.",
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
        "La plupart des produits qui réussissent tirent l'essentiel de leur croissance d'un ou deux canaux, pas de dix — l'observation derrière la méthode « Bullseye » popularisée par Traction (Weinberg et Mares) : tester beaucoup à bas coût, puis concentrer. Un tableur de neuf canaux à 5 % chacun est un symptôme, pas une stratégie.",
      ),
      t(
        "Paid channels scale fast and get more expensive as they scale; organic channels (content, SEO, community, referral) start slow and get cheaper. Early on, paid buys you learning; over time, only the compounding channels keep CAC in check.",
        "Les canaux payants passent vite à l'échelle et renchérissent en grandissant ; les canaux organiques (contenu, SEO, communauté, parrainage) démarrent lentement et deviennent moins chers. Au début, le payant achète de l'apprentissage ; à terme, seuls les canaux qui composent tiennent le CAC.",
      ),
      t(
        "Landing-page sign-up rates are commonly quoted in the 2-5% range for cold paid traffic and well above that for warm traffic (a shared link, a recommendation). If a channel converts far below its peers, the problem is usually the fit between the promise made there and the page, not the page itself.",
        "Les taux d'inscription d'une page d'accueil se citent couramment entre 2 et 5 % pour du trafic payant froid, et bien au-dessus pour du trafic chaud (un lien partagé, une recommandation). Si un canal convertit très en dessous des autres, le problème est en général l'accord entre la promesse faite là-bas et la page, pas la page elle-même.",
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
        "Répare l'activation avant de faire grandir l'acquisition. Doubler le trafic vers un produit qui active 10 % des inscrits double le gaspillage ; réparer l'activation d'abord rend chaque canal suivant moins cher.",
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
          "Un outil de reporting remarque dans son questionnaire d'inscription que 30 % des nouveaux utilisateurs disent « un collègue m'a montré un rapport ». Rien dans le produit ne soutient ça : les rapports sont des PDF envoyés à la main.",
        ),
        t(
          "It adds a shareable link on every report, with a rich preview and a \"make your own\" button — and a reference on the link so arrivals can be counted.",
          "Il ajoute un lien partageable sur chaque rapport, avec un aperçu riche et un bouton « faites le vôtre » — et une référence sur le lien pour compter les arrivées.",
        ),
        t(
          "Three months later: 1,000 new users a month, 410 traced to a shared report. Referral share: 41%, up from an estimated 30% — and now measured instead of surveyed.",
          "Trois mois plus tard : 1 000 nouveaux utilisateurs par mois, 410 attribués à un rapport partagé. Part du parrainage : 41 %, contre 30 % estimés — et maintenant mesurée au lieu d'être déclarée.",
        ),
        t(
          "At the tool's €120 blended CAC, those 410 users are worth about €49,000 of acquisition a month — for a share button placed where people were already sharing.",
          "Au CAC mixte de 120 € de l'outil, ces 410 utilisateurs valent environ 49 000 € d'acquisition par mois — pour un bouton de partage placé là où les gens partageaient déjà.",
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
        "The three Referral questions climb one ladder: does a sharing or referral mechanism exist in the product (20 / 7 if it only lives in your communication / 0); is it actually used by customers, meaningfully; and is a viral coefficient or equivalent measured. It is the pillar where a 0/20 stage is common and, unlike the others, often a decision rather than a blind spot — many good products simply never built one. The Tour's own share button, and the \"take your own Tour\" link on every shared result, are its answer to the first question.",
        "Les trois questions Referral gravissent une même échelle : un mécanisme de partage ou de parrainage existe-t-il dans le produit (20 / 7 s'il ne vit que dans ta communication / 0) ; est-il réellement utilisé par les clients, de façon significative ; et un coefficient viral ou équivalent est-il mesuré. C'est le pilier où une étape à 0/20 est courante et, contrairement aux autres, souvent une décision plutôt qu'un angle mort — beaucoup de bons produits n'en ont simplement jamais construit. Le bouton de partage du Tour, et le lien « fais ton propre Tour » sur chaque résultat partagé, sont sa réponse à la première question.",
      ),
    },
    faq: [
      {
        question: t("Is referral the same as word of mouth?", "Le parrainage, c'est le bouche-à-oreille ?"),
        answer: t(
          "Word of mouth is referral you can't see: recommendations made in conversations, without a link or a code. Referral as a growth pillar is the effort to make that behaviour easier, more frequent and measurable. A product with strong word of mouth and no mechanism is leaving its cheapest channel unmanaged.",
          "Le bouche-à-oreille est du parrainage que tu ne vois pas : des recommandations faites en conversation, sans lien ni code. Le parrainage comme pilier de croissance, c'est l'effort pour rendre ce comportement plus facile, plus fréquent et mesurable. Un produit avec un fort bouche-à-oreille et aucun mécanisme laisse son canal le moins cher sans pilotage.",
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
            "Des clients existants qui paient plus : montées en gamme, sièges ajoutés, usage, modules vendus en complément. Le terme qu'un playbook d'expansion existe pour faire grandir — et celui qui peut rendre le churn revenu net négatif.",
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
        "Pricing sets the size of every term. A price chosen \"a bit arbitrarily\" is the single most common unforced error in this pillar: it caps new MRR, leaves no room for expansion, and is almost never revisited because changing it feels risky. Testing it is what the Tour's first Revenue question asks about.",
        "Le pricing fixe la taille de chaque terme. Un prix choisi « un peu arbitrairement » est l'erreur non forcée la plus courante de ce pilier : il plafonne le nouveau MRR, ne laisse aucune place à l'expansion, et n'est presque jamais revu parce que le changer paraît risqué. Le tester, c'est ce que demande la première question Revenue du Tour.",
      ),
    },
    example: {
      title: t("The same month, read as a revenue pillar", "Le même mois, lu comme un pilier Revenue"),
      steps: [
        t(
          "Start of month: €20,000 MRR from 400 customers (€50 average). New customers: 40 at €50 = +€2,000.",
          "Début de mois : 20 000 € de MRR pour 400 clients (50 € en moyenne). Nouveaux clients : 40 à 50 € = +2 000 €.",
        ),
        t(
          "Expansion: 15 customers move from the €50 plan to the €110 one, +€900. Contraction: 8 downgrade, −€400. Churn: 12 cancel, −€600.",
          "Expansion : 15 clients passent de l'offre à 50 € à celle à 110 €, +900 €. Contraction : 8 rétrogradent, −400 €. Churn : 12 résilient, −600 €.",
        ),
        t(
          "End of month: 20,000 + 2,000 + 900 − 400 − 600 = €21,900. Growth: +9.5%. Net revenue retention on the existing base: (20,000 + 900 − 400 − 600) ÷ 20,000 = 99.5%.",
          "Fin de mois : 20 000 + 2 000 + 900 − 400 − 600 = 21 900 €. Croissance : +9,5 %. Rétention nette de revenu sur la base existante : (20 000 + 900 − 400 − 600) ÷ 20 000 = 99,5 %.",
        ),
        t(
          "Now suppose pricing had been tested and the upper plan priced at €130 instead of €110: the same 15 upgrades bring +€1,200, NRR reaches 101%, and the business grows even in a month with zero new customers.",
          "Suppose maintenant que le pricing ait été testé et l'offre supérieure fixée à 130 € au lieu de 110 € : les mêmes 15 montées en gamme rapportent +1 200 €, la NRR atteint 101 %, et l'activité grandit même un mois sans aucun nouveau client.",
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
        "La rétention nette de revenu est le chiffre que les investisseurs SaaS lisent en premier : au-dessus de 100 %, la base existante grandit toute seule ; les meilleures entreprises B2B affichent 110-130 %, portées par l'expansion. Sous 90 %, la croissance doit courir plus vite qu'une base qui fuit.",
      ),
      t(
        "The LTV:CAC rule of thumb of about 3:1 lives in this pillar too — it is where price, margin and lifetime meet the cost of acquisition. Scoring the pillar on \"has the model been tested?\" rather than on the amount is deliberate: the amount follows from the terms above, not the reverse.",
        "La règle empirique LTV:CAC d'environ 3:1 vit aussi dans ce pilier — c'est là que prix, marge et durée de vie rencontrent le coût d'acquisition. Noter le pilier sur « le modèle a-t-il été testé ? » plutôt que sur le montant est délibéré : le montant découle des termes ci-dessus, pas l'inverse.",
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
          "MRR is monthly recurring revenue: the subscription income you can expect next month if nothing changes, excluding one-off fees. ARR is MRR × 12, used for annual contracts and fundraising. Revenue, in accounting terms, is what was actually recognised in a period, one-offs included. Growth teams steer on MRR because it moves fast enough to learn from.",
          "Le MRR est le revenu récurrent mensuel : ce que les abonnements rapporteront le mois prochain si rien ne change, hors frais ponctuels. L'ARR est le MRR × 12, utilisé pour les contrats annuels et les levées de fonds. Le chiffre d'affaires, au sens comptable, est ce qui a réellement été reconnu sur une période, ponctuels compris. Les équipes growth pilotent au MRR parce qu'il bouge assez vite pour en apprendre quelque chose.",
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
            "Ce qui est l'intérêt pratique de tout le modèle : 10 % de mieux à chacune de quatre étapes ne fait pas +40 % à la fin mais 1,1⁴ ≈ +46 %, et une étape à zéro rend toutes les autres inutiles.",
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
          "10 000 visiteurs acquis. 25 % s'activent (2 500). 40 % d'entre eux sont encore actifs au troisième mois (1 000). 10 % d'entre eux paient (100 clients).",
        ),
        t(
          "Option A, the reflex: double acquisition to 20,000 visitors. Result: 200 customers, at double the acquisition cost.",
          "Option A, le réflexe : doubler l'acquisition à 20 000 visiteurs. Résultat : 200 clients, pour le double du coût d'acquisition.",
        ),
        t(
          "Option B: leave acquisition alone, take activation from 25% to 35% and retention from 40% to 50% — two onboarding and product changes. 10,000 × 0.35 × 0.5 × 0.1 = 175 customers, at zero extra acquisition cost.",
          "Option B : ne pas toucher à l'acquisition, passer l'activation de 25 à 35 % et la rétention de 40 à 50 % — deux changements d'onboarding et de produit. 10 000 × 0,35 × 0,5 × 0,1 = 175 clients, pour zéro coût d'acquisition en plus.",
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
          "Acquisition, Activation, Rétention, Referral (parrainage), Revenue (revenu) : les cinq étapes qu'un utilisateur traverse, de la première fois qu'il entend parler d'un produit au moment où il paie et en amène d'autres. Dave McClure l'a forgé en 2007 sous le nom de « pirate metrics » parce que l'acronyme sonne comme un cri de pirate. Certaines versions mettent Revenue avant Referral ; l'ordre des deux dernières compte moins que l'idée que chaque étape est une part de la précédente.",
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
            "Retained: still active after your natural cycle × 3 (month three for a weekly tool). Churned: gone by the end of month one. The middle is noise; leave it out of the comparison.",
            "Fidèles : encore actifs après ton cycle naturel × 3 (le troisième mois pour un outil hebdomadaire). Partis : disparus à la fin du premier mois. Le milieu est du bruit ; laisse-le hors de la comparaison.",
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
          "Facebook, vers 2008 : les utilisateurs qui atteignaient 7 amis en 10 jours restaient bien mieux que les autres. Le chiffre a été trouvé dans les données, pas choisi ; tout l'onboarding a ensuite été plié vers « retrouve des gens que tu connais ».",
        ),
        t(
          "A two-person invoicing app, today: 800 sign-ups over a quarter. Retained at month three: 140. Churned in month one: 480.",
          "Une appli de facturation à deux personnes, aujourd'hui : 800 inscrits sur un trimestre. Fidèles au troisième mois : 140. Partis le premier mois : 480.",
        ),
        t(
          "Candidate \"created an invoice in week 1\": 78% of retained, 35% of churned — lift 2.2. Candidate \"sent an invoice to a real client in week 1\": 64% of retained, 6% of churned — lift 10.7.",
          "Candidate « a créé une facture en semaine 1 » : 78 % des fidèles, 35 % des partis — levier 2,2. Candidate « a envoyé une facture à un vrai client en semaine 1 » : 64 % des fidèles, 6 % des partis — levier 10,7.",
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
        "Les exemples connus sont des seuils, pas des fonctionnalités : les 7 amis en 10 jours de Facebook, les 2 000 messages envoyés par une équipe chez Slack, un fichier dans un dossier sur un appareil chez Dropbox. Chacun est précoce, comptable, et un indicateur de « cette chose fait maintenant partie de ma façon de travailler ».",
      ),
      t(
        "How many users reach it is the activation rate; how long it takes them is time-to-value. Both belong on the same chart, because a moment reached by 60% of users in three weeks and one reached by 35% in ten minutes describe very different onboardings.",
        "Combien d'utilisateurs l'atteignent, c'est le taux d'activation ; combien de temps ils mettent, c'est le time-to-value. Les deux ont leur place sur le même graphique, parce qu'un moment atteint par 60 % des utilisateurs en trois semaines et un atteint par 35 % en dix minutes décrivent des onboardings très différents.",
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
        "Reconçois l'onboarding à rebours depuis lui : chaque écran rapproche l'utilisateur du moment ou disparaît. Les états vides, les données d'exemple et les modèles existent pour raccourcir le chemin qui y mène.",
      ),
      t(
        "Revisit it once a year or when the product changes shape. A moment that fit a single-player tool stops fitting once teams become the customer.",
        "Revois-le une fois par an ou quand le produit change de forme. Un moment qui allait à un outil solo ne va plus quand les équipes deviennent le client.",
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
          "Moment « aha » d'un outil d'analytics : le premier graphique construit sur les données de l'utilisateur. Avant : inscription → formulaire de profil en 5 étapes → visite du produit (9 infobulles) → tableau de bord vide → « connecter une source » enfoui dans les réglages. Time-to-value médian : 4,5 jours. Activation : 22 %.",
        ),
        t(
          "Change 1: the first screen after sign-up is \"connect a source\", with a sample dataset one click away for those who can't yet. Change 2: the tour is removed; the two tooltips that mattered move onto the chart builder itself. Change 3: the profile form is asked for later, when the user invites a colleague.",
          "Changement 1 : le premier écran après l'inscription est « connecter une source », avec un jeu de données d'exemple à un clic pour ceux qui ne peuvent pas encore. Changement 2 : la visite est retirée ; les deux infobulles qui comptaient migrent sur le constructeur de graphique lui-même. Changement 3 : le formulaire de profil est demandé plus tard, quand l'utilisateur invite un collègue.",
        ),
        t(
          "After one month of cohorts: median time-to-value 38 minutes. Activation: 41%.",
          "Après un mois de cohortes : time-to-value médian 38 minutes. Activation : 41 %.",
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
          "Suppose que 20 % des Tours soient partagés, qu'une page partagée soit lue par 12 personnes, et que 6 % des lecteurs lancent le leur : 0,2 × 12 × 0,06 = 0,144 nouveau Tour par Tour. Multiplicateur 0,144 ; chaque centaine de Tours venue de l'extérieur en produit finalement environ 117.",
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
        "Le test d'une bonne North Star tient en une question : si ce chiffre double et que rien d'autre ne change, l'entreprise va-t-elle clairement mieux ? Les inscriptions échouent (elles pourraient toutes partir). Les nuits réservées réussissent. « Équipes actives par semaine » aussi, pour un outil de collaboration — tant qu'« actif » veut dire faire la chose qui a de la valeur.",
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
          "Décomposée : 1 200 comptes qui envoient × 1,8 rapport par semaine × 3,1 destinataires chacun. Trois équipes, trois entrées : l'onboarding porte la première, le produit la deuxième, le partage la troisième.",
        ),
        t(
          "Two quarters later, revenue grows 30% — and the North Star had shown it a quarter earlier, when sending accounts crossed 1,500 while revenue was still flat.",
          "Deux trimestres plus tard, le revenu croît de 30 % — et la North Star l'avait montré un trimestre plus tôt, quand les comptes qui envoient ont passé 1 500 alors que le revenu était encore plat.",
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
          "La North Star est la mesure durable de valeur que l'entreprise optimise ; les OKR sont des engagements trimestriels à faire bouger des métriques d'entrée précises en dessous. Un bon OKR nomme une entrée (taux d'activation de 23 % à 30 %) et peut expliquer, en une phrase, comment il fait bouger l'étoile. Les OKR qui ne le peuvent pas sont de l'activité déguisée en résultat.",
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
          "Un outil de projet avec une offre à 50 € (5 sièges) et une à 110 € (15 sièges). 400 clients, 20 000 € de MRR. Jusqu'ici, les montées en gamme arrivent quand un client atteint la limite de sièges et trouve la page de tarifs tout seul.",
        ),
        t(
          "Playbook, three lines: (1) at 4 of 5 seats used and at least 30 days of activity, show an in-app note explaining the next tier — never before day 30; (2) at 5 of 5, the founder sends one personal email; (3) any account that added a second project type gets offered the reporting module.",
          "Playbook, trois lignes : (1) à 4 sièges sur 5 utilisés et au moins 30 jours d'activité, afficher une note dans l'app expliquant le palier suivant — jamais avant le 30ᵉ jour ; (2) à 5 sur 5, le fondateur envoie un e-mail personnel ; (3) tout compte qui a ajouté un second type de projet se voit proposer le module de reporting.",
        ),
        t(
          "Before: about 8 upgrades a month, +€480. After a quarter: 15 upgrades (+€900) and 6 module sales at €30 (+€180). Expansion rate: from 2.4% to 5.4% of opening MRR.",
          "Avant : environ 8 montées en gamme par mois, +480 €. Après un trimestre : 15 montées (+900 €) et 6 ventes de module à 30 € (+180 €). Taux d'expansion : de 2,4 % à 5,4 % du MRR de départ.",
        ),
        t(
          "Gross revenue churn that month: 5%. Net revenue churn went from +2.6% to −0.4%: the existing base now grows by itself, before counting a single new customer.",
          "Churn revenu brut ce mois-là : 5 %. Le churn revenu net est passé de +2,6 % à −0,4 % : la base existante grandit maintenant toute seule, avant de compter le moindre nouveau client.",
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
        "Les meilleures entreprises SaaS B2B affichent une rétention nette de revenu de 110-130 %, c'est-à-dire une expansion qui dépasse le churn de 10 à 30 points par an ; sous 100 %, chaque année commence avec une base plus petite que la précédente. L'expansion est là où l'essentiel de cet écart se fait.",
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
