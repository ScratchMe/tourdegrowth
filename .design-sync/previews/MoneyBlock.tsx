import { CashWarning, DefinitionTrigger, MoneyBlock, WorthBars } from "tour-de-growth";

/*
 * The money on the board (design system extension 09, A20.d T2): right after
 * the diagnosis, one flat ruled block — the MRR and its ARR, what one new
 * customer is worth (the finding, the bars, the months), then the cash the
 * acquisition keeps tied up and whether it comes back.
 *
 * Every prop is the product's own: `moneyView` (app/[locale]/aarrr-funnel-
 * template/_engine/money-view.ts) run on the engine's fixtures with the
 * resolved copy, then handed to the block the way `BoardMoney` does. The
 * words a definition teaches carry the engine's « ? »; on the page it opens
 * a definition, here it is shown closed.
 */

/**
 * The film's SaaS (`filmState()`, `lib/engine/__tests__/fixtures.ts`), in French: a new
 * customer costs 1 900 € and brings back ~1 500 € of margin, so the loss is certain. It is
 * said once, in the finding's own sentence, named by an ink tag (never red), then drawn by the
 * bars, then said in months. The cash it ties up does not all come back, and there is no
 * warning: a certain loss speaks alone.
 */
export const Loss = () => (
  <div style={{ maxWidth: 760 }}>
    <MoneyBlock
      eyebrow={"L'argent · août 2026"}
      headingId="money-loss"
      figures={[
        { key: "mrr", label: "MRR", value: "48 000 €" },
        { key: "arr", label: <>{"ARR, le MRR × 12"}<span style={{ marginInlineStart: "var(--space-2)" }}><DefinitionTrigger term={"ARR"} label={"Définition : ARR"} /></span></>, value: "576 000 €" },
      ]}
      worth={{
        title: "Ce que vaut un nouveau client",
        tag: { label: "Perte", maybe: false },
        finding: "Chaque nouveau client coûte 1 900 € et rapporte ~1 500 € de marge : tu perds ~400 € sur chacun.",
        bars: <WorthBars cost={{ label: "Coûte", value: "1 900 €", amount: { lo: 1900, hi: 1900 } }} brings={{ label: "Rapporte", value: "~1 500 €", amount: { lo: 1500, hi: 1500 } }} gap={{ label: "il manque ~400 €", kind: "short" }} />,
        months: "Un client reste ~17 mois ; rembourser son coût en prendrait 21 mois : il part avant.",
      }}
      cash={{
        title: "Trésorerie",
        facts: [
          { key: "spend", label: "Dépensé en acquisition ce mois-ci", value: "93 480 €" },
          { key: "tied", label: <>{"Immobilisé à ce rythme"}<span style={{ marginInlineStart: "var(--space-2)" }}><DefinitionTrigger term={"trésorerie immobilisée"} label={"Définition : trésorerie immobilisée"} /></span></>, value: "~990 000 €" },
        ],
        line: "Et elle ne revient pas toute : les clients partent avant d'avoir remboursé.",
        assumptions: "Un plancher : la dépense de chaque mois revient régulièrement sur la durée du payback, la moitié est donc dehors à tout moment ; le churn et la rétrogradation ralentissent le retour et ne sont pas comptés. Facturation mensuelle.",
      }}
    />
  </div>
);

/**
 * The page's own example (`exampleState()`), in English: its margin is estimated (70–80 %), so
 * the LTV, the gap, the months and the cash are ranges with « ~ », two significant digits. No
 * tag: nothing is wrong. The « ? » after the ARR, the months after payback and « tied up » are
 * the engine's own definitions (`EngineTerm`, drawn here with the system's
 * `DefinitionTrigger`).
 */
export const Healthy = () => (
  <div style={{ maxWidth: 760 }}>
    <MoneyBlock
      eyebrow={"The money · August 2026"}
      headingId="money-healthy"
      figures={[
        { key: "mrr", label: "MRR", value: "€48,000" },
        { key: "arr", label: <>{"ARR, the MRR × 12"}<span style={{ marginInlineStart: "var(--space-2)" }}><DefinitionTrigger term={"ARR"} label={"Definition: ARR"} /></span></>, value: "€576,000" },
      ]}
      worth={{
        title: "What one new customer is worth",
        finding: "Each new customer costs €500 and brings back ~€3,000–€3,500 of margin: ~€2,500–€3,000 more than it costs.",
        bars: <WorthBars cost={{ label: "Costs", value: "€500", amount: { lo: 500, hi: 500 } }} brings={{ label: "Brings back", value: "~€3,000–€3,500", amount: { lo: 3024, hi: 3456 } }} gap={{ label: "~€2,500–€3,000 more", kind: "more" }} />,
        months: <>{"It pays back its cost in 5–6 months and stays ~36 months: ~30–31 months of margin after payback."}<span style={{ marginInlineStart: "var(--space-2)" }}><DefinitionTrigger term={"months after payback"} label={"Definition: months after payback"} /></span></>,
      }}
      cash={{
        title: "Cash",
        facts: [
          { key: "spend", label: "Spent on acquisition this month", value: "€21,000" },
          { key: "tied", label: <>{"Tied up at this pace"}<span style={{ marginInlineStart: "var(--space-2)" }}><DefinitionTrigger term={"cash tied up"} label={"Definition: cash tied up"} /></span></>, value: "~€55,000–€63,000" },
        ],
        line: "It all comes back, as customers pay back.",
        assumptions: "A floor: each month's spend comes back evenly over the payback, so half of it is out at any time; churn and contraction slow the return and are not counted. Monthly billing.",
      }}
    />
  </div>
);

/**
 * The film's SaaS with logo churn at 2 % and a CAC of 3 000 €, in French: a customer now pays
 * back, but in 33 months. With no runway typed in the Settings the warning measures the
 * payback against 30 months (C49), in the advice's dashed edge, never the red of the stage
 * that holds the engine back.
 */
export const Warning = () => (
  <div style={{ maxWidth: 760 }}>
    <MoneyBlock
      eyebrow={"L'argent · août 2026"}
      headingId="money-warning"
      figures={[
        { key: "mrr", label: "MRR", value: "48 000 €" },
        { key: "arr", label: <>{"ARR, le MRR × 12"}<span style={{ marginInlineStart: "var(--space-2)" }}><DefinitionTrigger term={"ARR"} label={"Définition : ARR"} /></span></>, value: "576 000 €" },
      ]}
      worth={{
        title: "Ce que vaut un nouveau client",
        finding: "Chaque nouveau client coûte 3 000 € et rapporte ~3 200 € de marge : ~240 € de plus que ce qu'il coûte.",
        bars: <WorthBars cost={{ label: "Coûte", value: "3 000 €", amount: { lo: 3000, hi: 3000 } }} brings={{ label: "Rapporte", value: "~3 200 €", amount: { lo: 3240, hi: 3240 } }} gap={{ label: "~240 € de plus", kind: "more" }} />,
        months: <>{"Il rembourse son coût en 33 mois et reste ~36 mois : ~3 mois de marge après le remboursement."}<span style={{ marginInlineStart: "var(--space-2)" }}><DefinitionTrigger term={"mois après remboursement"} label={"Définition : mois après remboursement"} /></span></>,
      }}
      cash={{
        title: "Trésorerie",
        facts: [
          { key: "spend", label: "Dépensé en acquisition ce mois-ci", value: "147 600 €" },
          { key: "tied", label: <>{"Immobilisé à ce rythme"}<span style={{ marginInlineStart: "var(--space-2)" }}><DefinitionTrigger term={"trésorerie immobilisée"} label={"Définition : trésorerie immobilisée"} /></span></>, value: "~2 500 000 €" },
        ],
        line: "Elle revient toute, au fil des remboursements.",
        warning: <CashWarning>{"Un client met 33 mois à rembourser son coût : 30 mois ou plus. Tu gagnes de l'argent, mais tard. Saisis ton runway dans les Réglages pour y comparer ton payback."}</CashWarning>,
        assumptions: "Un plancher : la dépense de chaque mois revient régulièrement sur la durée du payback, la moitié est donc dehors à tout moment ; le churn et la rétrogradation ralentissent le retour et ne sont pas comptés. Facturation mensuelle.",
      }}
    />
  </div>
);

/**
 * `noMarginState()`, in English: the gross margin is missing. No LTV, no payback, no cash
 * figure — never computed on revenue, which would flatter the engine. Each value is the
 * dashed, hatched « ? » with what is missing; the note says why.
 */
export const NoMargin = () => (
  <div style={{ maxWidth: 760 }}>
    <MoneyBlock
      eyebrow={"The money · August 2026"}
      headingId="money-no-margin"
      figures={[
        { key: "mrr", label: "MRR", value: "€48,000" },
        { key: "arr", label: <>{"ARR, the MRR × 12"}<span style={{ marginInlineStart: "var(--space-2)" }}><DefinitionTrigger term={"ARR"} label={"Definition: ARR"} /></span></>, value: "€576,000" },
      ]}
      worth={{
        title: "What one new customer is worth",
        finding: "We can't tell yet what a new customer brings back. Missing: gross margin.",
        bars: <WorthBars cost={{ label: "Costs", value: "€500", amount: { lo: 500, hi: 500 } }} brings={{ label: "Brings back", value: "?", amount: null, unknown: "missing: gross margin" }} />,
        note: "Without it, no LTV, no payback, no cash figure: computed on revenue, they would flatter your engine.",
      }}
      cash={{
        title: "Cash",
        facts: [
          { key: "spend", label: "Spent on acquisition this month", value: "€21,000" },
          { key: "tied", label: <>{"Tied up at this pace"}<span style={{ marginInlineStart: "var(--space-2)" }}><DefinitionTrigger term={"cash tied up"} label={"Definition: cash tied up"} /></span></>, value: null, missing: "missing: gross margin" },
        ],
        line: "No cash figure without a payback: it says when the spend comes back.",
      }}
    />
  </div>
);

/**
 * The film's SaaS with its churn estimated at 4 to 6 %, in French: the two ranges overlap, so
 * the loss is only possible. The tag is dashed, the gap reads « the two may cross », and the
 * note says where the ranges come from.
 */
export const MaybeLoss = () => (
  <div style={{ maxWidth: 760 }}>
    <MoneyBlock
      eyebrow={"L'argent · août 2026"}
      headingId="money-maybe"
      figures={[
        { key: "mrr", label: "MRR", value: "48 000 €" },
        { key: "arr", label: <>{"ARR, le MRR × 12"}<span style={{ marginInlineStart: "var(--space-2)" }}><DefinitionTrigger term={"ARR"} label={"Définition : ARR"} /></span></>, value: "576 000 €" },
      ]}
      worth={{
        title: "Ce que vaut un nouveau client",
        tag: { label: "Perte possible", maybe: true },
        finding: "Un nouveau client coûte 1 900 € et rapporte ~1 500 € à 2 300 € de marge : il ne rembourse peut-être pas ce qu'il coûte.",
        bars: <WorthBars cost={{ label: "Coûte", value: "1 900 €", amount: { lo: 1900, hi: 1900 } }} brings={{ label: "Rapporte", value: "~1 500 € à 2 300 €", amount: { lo: 1500, hi: 2250 } }} gap={{ label: "les deux peuvent se croiser", kind: "maybe" }} />,
        months: "Un client reste ~17 à 25 mois ; rembourser son coût en prend 21 mois : il peut partir avant.",
        note: "Les fourchettes viennent de tes chiffres estimés : précise-les et le moteur tranchera.",
      }}
      cash={{
        title: "Trésorerie",
        facts: [
          { key: "spend", label: "Dépensé en acquisition ce mois-ci", value: "93 480 €" },
          { key: "tied", label: <>{"Immobilisé à ce rythme"}<span style={{ marginInlineStart: "var(--space-2)" }}><DefinitionTrigger term={"trésorerie immobilisée"} label={"Définition : trésorerie immobilisée"} /></span></>, value: "~990 000 €" },
        ],
        line: "Qu'elle revienne toute n'est pas sûr : les clients peuvent partir avant d'avoir remboursé.",
        assumptions: "Un plancher : la dépense de chaque mois revient régulièrement sur la durée du payback, la moitié est donc dehors à tout moment ; le churn et la rétrogradation ralentissent le retour et ne sont pas comptés. Facturation mensuelle.",
      }}
    />
  </div>
);

/**
 * `hybridLossState()`, sales-assisted side, in English: inside the hybrid the block carries no
 * MRR and no ARR of its own — the total band above adds the two engines up. This engine pays
 * back: a new contract costs €19,000 and brings back ~€54,000 of margin over a lifetime
 * counted from its renewals and capped at 36 months.
 */
export const InTheHybrid = () => (
  <div style={{ maxWidth: 760 }}>
    <MoneyBlock
      eyebrow={"The money · August 2026"}
      headingId="money-hybrid"
      figures={null}
      worth={{
        title: "What one new customer is worth",
        finding: "Each new customer costs €19,000 and brings back ~€54,000 of margin: ~€35,000 more than it costs.",
        bars: <WorthBars cost={{ label: "Costs", value: "€19,000", amount: { lo: 19000, hi: 19000 } }} brings={{ label: "Brings back", value: "~€54,000", amount: { lo: 54000, hi: 54000 } }} gap={{ label: "~€35,000 more", kind: "more" }} />,
        months: <>{"It pays back its cost in 13 months and stays ~36 months: ~23 months of margin after payback."}<span style={{ marginInlineStart: "var(--space-2)" }}><DefinitionTrigger term={"months after payback"} label={"Definition: months after payback"} /></span></>,
        note: "Its renewals come up once a year, and the lifetime is capped at 36 months.",
      }}
      cash={{
        title: "Cash",
        facts: [
          { key: "spend", label: "Spent on acquisition this month", value: "€114,000" },
          { key: "tied", label: <>{"Tied up at this pace"}<span style={{ marginInlineStart: "var(--space-2)" }}><DefinitionTrigger term={"cash tied up"} label={"Definition: cash tied up"} /></span></>, value: "~€720,000" },
        ],
        line: "It all comes back, as customers pay back.",
        assumptions: "Each month's spend comes back evenly over the payback, so half of it is out at any time. The 12-month NRR may exceed 100%: it shortens the return, and this figure is no longer a floor. Monthly billing assumed: a year paid up front comes back sooner.",
      }}
    />
  </div>
);
