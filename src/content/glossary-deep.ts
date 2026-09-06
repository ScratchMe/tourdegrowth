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
 * TODO: à relire (REVIEW-02) — R2-11, lot 1 (cac, ltv, churn). Premier jet
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
};
