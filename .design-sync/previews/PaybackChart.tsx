import { PaybackChart } from "tour-de-growth";

/*
 * One customer, month by month (design system extension 09, Q12): the
 * margin it brings back against what it cost, on the unit-economics slide's
 * 0–36 month axis. Ink only, never red.
 *
 * Every prop is the product's own: the `paybackChart` (or, in the hybrid,
 * `paybackCharts.plg` / `.slg`) that `buildDeck` (lib/engine/deck.ts,
 * deck-unit.ts) writes into the `unit-economics` slide, run on the engine's
 * fixtures with the resolved copy, passed the way `SlideUnitEconomics`
 * (900 × 330) and `SlideUnitBoth` (780 × 150, `size="sm"`) pass it. The
 * chart is drawn at its real size on the slide's 1 920 canvas — its type is
 * the slides' 18px-and-up scale — and the deck scales the whole slide on
 * screen from its parent (`DeckView`'s scaler). Here the 900px chart is
 * zoomed to 0.9 by its wrapper so it fits the card; the compact one is at
 * its real size. Each cell sits on the slide's paper (`--surface-page`, the
 * deck's default ground), which the labels' halo is painted in.
 */

/**
 * The film's SaaS (`filmState()`: a 1 900 € CAC, ~90 € of margin a month), in French — the
 * loss: the margin line stops at ~17 months, the dot where the customer leaves (« part vers
 * 17 mois »), short of the cost line; the bracket beside its end measures how short (« il
 * manque ~400 € »), and a dashed thread runs on to where it would have paid back, never
 * reached: « rembourserait à 21 mois », its tick down to the axis. The dotted 12 months on the
 * axis row situate, never judge.
 */
export const Loss = () => (
  <div style={{ background: "var(--surface-page)", padding: 16, zoom: 0.9 }}>
    <div style={{ width: 900 }}>
      <PaybackChart
        story="loss"
        monthlyMargin={[90, 90]}
        cac={[1900, 1900]}
        lifetime={[16.67, 16.67]}
        payback={[21.11, 21.11]}
        reference={12}
        width={900}
        height={330}
        labels={{
          start: "0",
          end: "36 mois",
          reference: "12 mois · repère couramment cité",
          cost: "ce que coûte un nouveau client",
          unknown: "",
          leaves: "part vers 17 mois",
          paysBack: "rembourserait à 21 mois",
          short: "il manque ~400 €",
          after: "les deux peuvent se croiser",
          time: "part vers 17 mois ; rembourserait à 21 mois",
        }}
        summary={"Un client, mois par mois : il rapporte ~90 € de marge par mois et part après environ 17 mois, à ~400 € des 1 900 € qu'il a coûté ; il aurait remboursé à 21 mois."}
        id="payback-loss"
      />
    </div>
  </div>
);

/**
 * The film's SaaS with churn at 2 % and a CAC of 2 900 € (`late()` of
 * `e2e/engine-deck-unit.spec.ts`), in English — it pays back, late: the line crosses the cost
 * line at the dot, « paid back: 32 months », and runs on to the 36-month cap (« counted to
 * 36 months, the cap »); the bracket under the cost line measures « ~4 months of margin
 * after », its label ending at the bracket's right end because the bracket is short.
 */
export const PaysBackLate = () => (
  <div style={{ background: "var(--surface-page)", padding: 16, zoom: 0.9 }}>
    <div style={{ width: 900 }}>
      <PaybackChart
        story="pays-back"
        monthlyMargin={[90, 90]}
        cac={[2900, 2900]}
        lifetime={[36, 36]}
        payback={[32.22, 32.22]}
        reference={12}
        width={900}
        height={330}
        labels={{
          start: "0",
          end: "36 months",
          reference: "12 months · commonly cited reference",
          cost: "what a new customer costs",
          unknown: "",
          leaves: "counted to 36 months, the cap",
          paysBack: "paid back: 32 months",
          short: "the two may cross",
          after: "~4 months of margin after",
          time: "paid back at 32 months, then ~4 months of margin",
        }}
        summary={"One customer, month by month: it brings back ~€90 of margin a month, pays back its €2,900 at 32 months and stays 36 months."}
        id="payback-late"
      />
    </div>
  </div>
);

/**
 * The page's own example (`exampleState()`: a 500 € CAC, its margin estimated, so 84 to 96 € a
 * month), in French: the line crosses the cost line at 5 to 6 months and climbs off the top of
 * the plot; its end, at the 36-month cap, is named top right. The crossing is too early for a
 * label beside it, so the time story rides the long bracket instead: « remboursé à 5 à 6 mois,
 * puis ~30 à 31 mois de marge » (`paysBackLabels`).
 */
export const PaysBackEarly = () => (
  <div style={{ background: "var(--surface-page)", padding: 16, zoom: 0.9 }}>
    <div style={{ width: 900 }}>
      <PaybackChart
        story="pays-back"
        monthlyMargin={[84, 96]}
        cac={[500, 500]}
        lifetime={[36, 36]}
        payback={[5.21, 5.95]}
        reference={12}
        width={900}
        height={330}
        labels={{
          start: "0",
          end: "36 mois",
          reference: "12 mois · repère couramment cité",
          cost: "ce que coûte un nouveau client",
          unknown: "",
          leaves: "compté jusqu'à 36 mois, le plafond",
          paysBack: "remboursé : 5 à 6 mois",
          short: "les deux peuvent se croiser",
          after: "~30 à 31 mois de marge après",
          time: "remboursé à 5 à 6 mois, puis ~30 à 31 mois de marge",
        }}
        summary={"Un client, mois par mois : il rapporte ~84 € à 96 € de marge par mois, rembourse ses 500 € à 5 à 6 mois et reste 36 mois."}
        id="payback-early"
      />
    </div>
  </div>
);

/**
 * `noMarginState()`, in English: no gross margin, so no margin line. The cost line stays — the
 * CAC is known — and under it the dashed, hatched « ? » box says what is missing: « missing:
 * gross margin ».
 */
export const Unknown = () => (
  <div style={{ background: "var(--surface-page)", padding: 16, zoom: 0.9 }}>
    <div style={{ width: 900 }}>
      <PaybackChart
        story="unknown"
        monthlyMargin={null}
        cac={[500, 500]}
        lifetime={null}
        payback={null}
        reference={12}
        width={900}
        height={330}
        labels={{
          start: "0",
          end: "36 months",
          reference: "12 months · commonly cited reference",
          cost: "what a new customer costs",
          unknown: "missing: gross margin",
          leaves: "",
          paysBack: "",
          short: "the two may cross",
          after: "the two may cross",
          time: "",
        }}
        summary={"One customer, month by month: its cost is known (€500), what it brings back is not. Missing: gross margin."}
        id="payback-unknown"
      />
    </div>
  </div>
);

/**
 * The hybrid's unit-economics slide (`hybridLossState()`, `SlideUnitBoth`), self-serve's
 * column, in French: `size="sm"`, 780 × 150, at its real size. No cost label (the tiles above
 * say it) and no « 36 mois » (the slide's footer says the cap): the months go in one line on
 * the axis row, « part vers 17 mois ; rembourserait à 21 mois », and the plot keeps its marks
 * and the money gap, « il manque ~400 € ».
 */
export const CompactLoss = () => (
  <div style={{ background: "var(--surface-page)", padding: 16 }}>
    <div style={{ width: 780 }}>
      <PaybackChart
        story="loss"
        monthlyMargin={[90, 90]}
        cac={[1900, 1900]}
        lifetime={[16.67, 16.67]}
        payback={[21.11, 21.11]}
        reference={12}
        width={780}
        height={150}
        labels={{
          start: "0",
          end: "36 mois",
          reference: "12 mois · repère couramment cité",
          cost: "ce que coûte un nouveau client",
          unknown: "",
          leaves: "part vers 17 mois",
          paysBack: "rembourserait à 21 mois",
          short: "il manque ~400 €",
          after: "les deux peuvent se croiser",
          time: "part vers 17 mois ; rembourserait à 21 mois",
        }}
        summary={"Un client, mois par mois : il rapporte ~90 € de marge par mois et part après environ 17 mois, à ~400 € des 1 900 € qu'il a coûté ; il aurait remboursé à 21 mois."}
        id="payback-plg"
        size="sm"
      />
    </div>
  </div>
);

/**
 * The same slide's other column, sales-assisted, in English (a €19,000 CAC, €1,500 of margin a
 * month): the line crosses the cost line at the dot and runs on to the cap, the bracket under
 * the cost line marks the months after, and the axis row reads « paid back at 13 months, then
 * ~23 months of margin ». On the slide this column stands beside the self-serve one, never on
 * the same axis.
 */
export const CompactPaysBack = () => (
  <div style={{ background: "var(--surface-page)", padding: 16 }}>
    <div style={{ width: 780 }}>
      <PaybackChart
        story="pays-back"
        monthlyMargin={[1500, 1500]}
        cac={[19000, 19000]}
        lifetime={[36, 36]}
        payback={[12.67, 12.67]}
        reference={12}
        width={780}
        height={150}
        labels={{
          start: "0",
          end: "36 months",
          reference: "12 months · commonly cited reference",
          cost: "what a new customer costs",
          unknown: "",
          leaves: "counted to 36 months, the cap",
          paysBack: "paid back: 13 months",
          short: "the two may cross",
          after: "~23 months of margin after",
          time: "paid back at 13 months, then ~23 months of margin",
        }}
        summary={"One customer, month by month: it brings back ~€1,500 of margin a month, pays back its €19,000 at 13 months and stays 36 months."}
        id="payback-slg"
        size="sm"
      />
    </div>
  </div>
);
