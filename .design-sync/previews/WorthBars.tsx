import { WorthBars } from "tour-de-growth";

/*
 * What one new customer costs and what it brings back in margin, two ink
 * bars on one scale (design system extension 09, Q3). On the board it is the
 * picture in « Ce que vaut un nouveau client », inside MoneyBlock, under the
 * finding's sentence.
 *
 * Every prop is the product's own: `moneyView(...).worth.bars`
 * (app/[locale]/aarrr-funnel-template/_engine/money-view.ts) run on the
 * engine's fixtures with the resolved copy, spread into the component the
 * way `BoardMoney` does (`<WorthBars {...m.worth.bars} />`). Each cell is
 * the width the block gives it: the engine's 720px measure.
 */

/**
 * The film's SaaS (`filmState()`, `lib/engine/__tests__/fixtures.ts`), in French: a new
 * customer costs 1 900 € and brings back ~1 500 € of margin. The margin bar stops short of the
 * dashed line where the cost ends, and the bracket under it measures the loss, named in words:
 * « il manque ~400 € ».
 */
export const Short = () => (
  <div style={{ maxWidth: 720 }}>
    <WorthBars
      cost={{ label: "Coûte", value: "1 900 €", amount: { lo: 1900, hi: 1900 } }}
      brings={{ label: "Rapporte", value: "~1 500 €", amount: { lo: 1500, hi: 1500 } }}
      gap={{ label: "il manque ~400 €", kind: "short" }}
    />
  </div>
);

/**
 * The page's own example (`exampleState()`), in English: its gross margin is estimated
 * (70–80 %), so what a customer brings back is a range, ~€3,000–€3,500 — solid to its low end,
 * hatched to its high end. The bracket measures how far past the cost it reaches,
 * « ~€2,500–€3,000 more ».
 */
export const More = () => (
  <div style={{ maxWidth: 720 }}>
    <WorthBars
      cost={{ label: "Costs", value: "€500", amount: { lo: 500, hi: 500 } }}
      brings={{ label: "Brings back", value: "~€3,000–€3,500", amount: { lo: 3024, hi: 3456 } }}
      gap={{ label: "~€2,500–€3,000 more", kind: "more" }}
    />
  </div>
);

/**
 * The film's SaaS with its churn estimated at 4 to 6 %, in French: the margin's range
 * (~1 500 € à 2 300 €) straddles the 1 900 € cost, so the loss is only possible. No bracket:
 * the gap says « les deux peuvent se croiser ».
 */
export const Maybe = () => (
  <div style={{ maxWidth: 720 }}>
    <WorthBars
      cost={{ label: "Coûte", value: "1 900 €", amount: { lo: 1900, hi: 1900 } }}
      brings={{ label: "Rapporte", value: "~1 500 € à 2 300 €", amount: { lo: 1500, hi: 2250 } }}
      gap={{ label: "les deux peuvent se croiser", kind: "maybe" }}
    />
  </div>
);

/**
 * `noMarginState()`, in English: the gross margin is missing, so what a customer brings back
 * is not computed — never on revenue. The cost is known and drawn; across the margin's track,
 * the dashed, hatched « ? » box, and under it what is missing. Never an empty bar: it would
 * read as zero.
 */
export const Unknown = () => (
  <div style={{ maxWidth: 720 }}>
    <WorthBars
      cost={{ label: "Costs", value: "€500", amount: { lo: 500, hi: 500 } }}
      brings={{ label: "Brings back", value: "?", amount: null, unknown: "missing: gross margin" }}
    />
  </div>
);

/**
 * The film's SaaS with churn at 2 % (counted 36 months) and its CAC estimated at 2 500 to
 * 3 000 €, in French: now the cost is the range — hatched from 2 500 € to 3 000 € — and the
 * dashed guide sits at its high end. The margin, a fact (~3 200 €), reaches past every reading
 * of it: « ~240 € à 740 € de plus ».
 */
export const CostRange = () => (
  <div style={{ maxWidth: 720 }}>
    <WorthBars
      cost={{ label: "Coûte", value: "~2 500 € à 3 000 €", amount: { lo: 2500, hi: 3000 } }}
      brings={{ label: "Rapporte", value: "~3 200 €", amount: { lo: 3240, hi: 3240 } }}
      gap={{ label: "~240 € à 740 € de plus", kind: "more" }}
    />
  </div>
);
