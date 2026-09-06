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
 * Batches of three, as REVIEW-02.md planned: this file starts with the three
 * most commercially searched terms. Facts are the widely cited ones (the 3:1
 * LTV:CAC rule of thumb, CAC payback under 12 months for SMB SaaS, monthly
 * churn compounding), always with their caveat, never a made-up statistic.
 *
 * TODO: à relire (REVIEW-02) — R2-11, lot 1 (cac, ltv, churn) et lot 2
 * (retention, activation, viral-coefficient). Premier jet
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

export const GLOSSARY_DEEP: Partial<Record<GlossaryTermId, DeepGlossaryContent>> = {
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
};
