import { LeverCard, MrrCurve } from "tour-de-growth";

/*
 * « Et si ? » on the board through one lever (design system extension 07,
 * changed by extension 09): the lever of the stage that holds the engine back,
 * the MRR month by month (`MrrCurve`, composed inside the card as the board
 * does), the MRR and the ARR in twelve months, and, when it applies, the
 * one-customer line and the hybrid's total line. The full panel — every lever,
 * the three tables of `WhatIfFigures` — is one tap away.
 *
 * Every prop is the product's own: `BoardLever` (app/[locale]/aarrr-funnel-
 * template/_engine/BoardLever.tsx) run on the engine's fixtures with the
 * resolved copy — its title from `titleKey`, its lever from `cardLever`,
 * its curve, ARR, one-customer and total lines from `leverMoneyView`
 * (_engine/money-view.ts). Only the ids carry a suffix, so they stay unique on
 * a page of cells. The slider is static here (no `onChange`): on the board
 * it writes the what-if targets and the figures are recomputed.
 */

/**
 * The page's own example (`exampleState()`, `lib/engine/__tests__/fixtures.ts`), in French,
 * nothing moved: the card's lever is the activation rate, the stage the team's target names,
 * at today's 18 %. The curve draws today's pace alone, from 48 000 € to ~100 000 €; the two
 * figures are the MRR and the ARR in twelve months, no « aujourd'hui » line under them and no
 * « Remettre à aujourd'hui ». The slider is drawn at its value: on the board it writes the
 * what-if targets and every figure follows.
 */
export const Untouched = () => (
  <div style={{ maxWidth: 760 }}>
    <LeverCard
      eyebrow={"Et si ?"}
      title={"Bouge le levier de l'étape qui freine, et vois ce qui suit."}
      lever={{ id: "engine-lever-act-rate-untouched", label: "Taux d'activation (aujourd'hui 18 %)", min: 9, max: 54, step: 1, value: 18, valueText: "18 %" }}
      curve={<MrrCurve
        id="engine-lever-curve-plg-untouched"
        today={[
          [48000, 48000], [52824.62, 52824.62], [57627.58, 57627.58], [62409, 62409],
          [67168.96, 67168.96], [71907.56, 71907.56], [76624.89, 76624.89], [81321.07, 81321.07],
          [85996.16, 85996.16], [90650.28, 90650.28], [95283.52, 95283.52], [99895.96, 99895.96],
          [104487.71, 104487.71],
        ]}
        keys={{ today: "au rythme d'aujourd'hui", whatif: "avec tes « Et si »" }}
        start={"48 000 € aujourd'hui"}
        xLabels={["août 2026", "février 2027", "août 2027"]}
        summary={"Le MRR mois par mois, de 48 000 € aujourd'hui à ~100 000 € dans 12 mois au rythme actuel."}
      />}
      figures={[
        { key: "mrr12", label: "MRR dans 12 mois", value: "~100 000 €" },
        { key: "arr12", label: "ARR dans 12 mois", value: "~1 300 000 €" },
      ]}
      allLabel={"Vois les 8 leviers et ce que le calcul suppose →"}
      resetLabel={"Remettre à aujourd'hui"}
      headingId="lever-untouched"
    />
  </div>
);

/**
 * The same example in English with the activation rate moved from 18% to 24%: the title says
 * the move, the curve adds the what-if line above today's pace, each figure prints today's
 * value under it, and « Back to today » appears beside the link to the full panel. No
 * one-customer line: the example's customer already pays back.
 */
export const Moved = () => (
  <div style={{ maxWidth: 760 }}>
    <LeverCard
      eyebrow={"What if?"}
      title={"What if: Activation rate, 24% instead of 18%"}
      lever={{ id: "engine-lever-act-rate-moved", label: "Activation rate (today 18%)", min: 9, max: 54, step: 1, value: 24, valueText: "24%" }}
      curve={<MrrCurve
        id="engine-lever-curve-plg-moved"
        today={[
          [48000, 48000], [52824.62, 52824.62], [57627.58, 57627.58], [62409, 62409],
          [67168.96, 67168.96], [71907.56, 71907.56], [76624.89, 76624.89], [81321.07, 81321.07],
          [85996.16, 85996.16], [90650.28, 90650.28], [95283.52, 95283.52], [99895.96, 99895.96],
          [104487.71, 104487.71],
        ]}
        whatif={[
          [48000, 48000], [54504.62, 54504.62], [60980.04, 60980.04], [67426.41, 67426.41],
          [73843.86, 73843.86], [80232.51, 80232.51], [86592.49, 86592.49], [92923.94, 92923.94],
          [99226.97, 99226.97], [105501.72, 105501.72], [111748.32, 111748.32], [117966.88, 117966.88],
          [124157.54, 124157.54],
        ]}
        keys={{ today: "at today's pace", whatif: "with your what-ifs" }}
        start={"€48,000 today"}
        xLabels={["August 2026", "February 2027", "August 2027"]}
        summary={"The MRR month by month, from €48,000 today: ~€100,000 in 12 months at today's pace, ~€120,000 with your what-ifs."}
      />}
      figures={[
        { key: "mrr12", label: "MRR in 12 months", value: "~€120,000", today: "today ~€100,000" },
        { key: "arr12", label: "ARR in 12 months", value: "~€1,500,000", today: "today ~€1,300,000" },
      ]}
      allLabel={"See the 8 levers and what the calculation assumes →"}
      resetLabel={"Back to today"}
      moved
      headingId="lever-moved"
    />
  </div>
);

/**
 * The film's SaaS (`filmState()`), in French, whose new customer is a loss, with its monthly
 * logo churn moved from 6 % to 5 %: the card's lever is the churn. The one-customer line
 * speaks because the board shows a certain loss and a what-if moved it: still a loss, ~100 €
 * instead of ~400 €.
 */
export const LossSmaller = () => (
  <div style={{ maxWidth: 760 }}>
    <LeverCard
      eyebrow={"Et si ?"}
      title={"Et si : Churn logo mensuel, 5 % au lieu de 6 %"}
      lever={{ id: "engine-lever-ret-logo-churn-loss-smaller", label: "Churn logo mensuel (aujourd'hui 6 %)", min: 0, max: 12, step: 0.1, value: 5, valueText: "5 %" }}
      curve={<MrrCurve
        id="engine-lever-curve-plg-loss-smaller"
        today={[
          [48000, 48000], [51504, 51504], [54832.8, 54832.8], [57995.16, 57995.16],
          [60999.4, 60999.4], [63853.43, 63853.43], [66564.76, 66564.76], [69140.52, 69140.52],
          [71587.5, 71587.5], [73912.12, 73912.12], [76120.52, 76120.52], [78218.49, 78218.49],
          [80211.57, 80211.57],
        ]}
        whatif={[
          [48000, 48000], [51984, 51984], [55808.64, 55808.64], [59480.29, 59480.29],
          [63005.08, 63005.08], [66388.88, 66388.88], [69637.32, 69637.32], [72755.83, 72755.83],
          [75749.6, 75749.6], [78623.61, 78623.61], [81382.67, 81382.67], [84031.36, 84031.36],
          [86574.11, 86574.11],
        ]}
        keys={{ today: "au rythme d'aujourd'hui", whatif: "avec tes « Et si »" }}
        start={"48 000 € aujourd'hui"}
        xLabels={["août 2026", "février 2027", "août 2027"]}
        summary={"Le MRR mois par mois, depuis 48 000 € aujourd'hui : ~80 000 € dans 12 mois au rythme actuel, ~87 000 € avec tes « Et si »."}
      />}
      figures={[
        { key: "mrr12", label: "MRR dans 12 mois", value: "~87 000 €", today: "aujourd'hui ~80 000 €" },
        { key: "arr12", label: "ARR dans 12 mois", value: "~1 000 000 €", today: "aujourd'hui ~960 000 €" },
      ]}
      worth={"Un nouveau client : toujours une perte, de ~100 € au lieu de ~400 €."}
      allLabel={"Vois les 8 leviers et ce que le calcul suppose →"}
      resetLabel={"Remettre à aujourd'hui"}
      moved
      headingId="lever-loss-smaller"
    />
  </div>
);

/**
 * The sales-assisted engine on its own (`salesAssistedState()`), in English, nothing moved:
 * the card's lever is the win rate at 24%. Its MRR in twelve months is a range, so the curve
 * is a hatched band and the figures print « ~€330,000–€340,000 ». Its contracts renew once a
 * year, so the one-customer slot carries why the line is straight; five levers in the full
 * panel.
 */
export const SalesAssisted = () => (
  <div style={{ maxWidth: 760 }}>
    <LeverCard
      eyebrow={"What if?"}
      title={"Move the lever of the stage that holds you back, and see what follows."}
      lever={{ id: "engine-lever-slg-rev-win-rate-sales-assisted", label: "Win rate (today 24%)", min: 12, max: 72, step: 1, value: 24, valueText: "24%" }}
      curve={<MrrCurve
        id="engine-lever-curve-slg-sales-assisted"
        today={[
          [180000, 180000], [192600, 193200], [205200, 206400], [217800, 219600],
          [230400, 232800], [243000, 246000], [255600, 259200], [268200, 272400],
          [280800, 285600], [293400, 298800], [306000, 312000], [318600, 325200],
          [331200, 338400],
        ]}
        keys={{ today: "at today's pace", whatif: "with your what-ifs" }}
        start={"€180,000 today"}
        xLabels={["August 2026", "February 2027", "August 2027"]}
        summary={"The MRR month by month, from €180,000 today to ~€330,000–€340,000 in 12 months at today's pace."}
      />}
      figures={[
        { key: "mrr12", label: "MRR in 12 months", value: "~€330,000–€340,000" },
        { key: "arr12", label: "ARR in 12 months", value: "~€4,000,000–€4,100,000" },
      ]}
      worth={"Annual contracts come up for renewal evenly over the year: the base moves in a straight line."}
      allLabel={"See the 5 levers and what the calculation assumes →"}
      resetLabel={"Back to today"}
      headingId="lever-sales-assisted"
    />
  </div>
);

/**
 * The hybrid with the film's self-serve half (`hybridLossState()`), in French, self-serve
 * shown under « Moteur affiché », its churn moved from 6 % to 4 %: the loss is gone (« plus de
 * perte »), and under a dashed hairline the hybrid's total line adds both engines' MRR in
 * twelve months, with the what-ifs and today — a sum, never a comparison.
 */
export const Hybrid = () => (
  <div style={{ maxWidth: 760 }}>
    <LeverCard
      eyebrow={"Et si ?"}
      title={"Et si : Churn logo mensuel, 4 % au lieu de 6 %"}
      lever={{ id: "engine-lever-ret-logo-churn-hybrid", label: "Churn logo mensuel (aujourd'hui 6 %)", min: 0, max: 12, step: 0.1, value: 4, valueText: "4 %" }}
      curve={<MrrCurve
        id="engine-lever-curve-plg-hybrid"
        today={[
          [48000, 48000], [51504, 51504], [54832.8, 54832.8], [57995.16, 57995.16],
          [60999.4, 60999.4], [63853.43, 63853.43], [66564.76, 66564.76], [69140.52, 69140.52],
          [71587.5, 71587.5], [73912.12, 73912.12], [76120.52, 76120.52], [78218.49, 78218.49],
          [80211.57, 80211.57],
        ]}
        whatif={[
          [48000, 48000], [52464, 52464], [56794.08, 56794.08], [60994.26, 60994.26],
          [65068.43, 65068.43], [69020.38, 69020.38], [72853.77, 72853.77], [76572.15, 76572.15],
          [80178.99, 80178.99], [83677.62, 83677.62], [87071.29, 87071.29], [90363.15, 90363.15],
          [93556.26, 93556.26],
        ]}
        keys={{ today: "au rythme d'aujourd'hui", whatif: "avec tes « Et si »" }}
        start={"48 000 € aujourd'hui"}
        xLabels={["août 2026", "février 2027", "août 2027"]}
        summary={"Le MRR mois par mois, depuis 48 000 € aujourd'hui : ~80 000 € dans 12 mois au rythme actuel, ~94 000 € avec tes « Et si »."}
      />}
      figures={[
        { key: "mrr12", label: "MRR dans 12 mois", value: "~94 000 €", today: "aujourd'hui ~80 000 €" },
        { key: "arr12", label: "ARR dans 12 mois", value: "~1 100 000 €", today: "aujourd'hui ~960 000 €" },
      ]}
      worth={"Un nouveau client : plus de perte. Il rapporte ~2 300 € pour 1 900 € : ~350 € de plus."}
      total={"Les deux moteurs dans 12 mois : ~425 000 € à 432 000 € de MRR avec tes « Et si » (aujourd'hui ~411 000 € à 418 000 €)."}
      allLabel={"Vois les 8 leviers et ce que le calcul suppose →"}
      resetLabel={"Remettre à aujourd'hui"}
      moved
      headingId="lever-hybrid"
    />
  </div>
);

/**
 * The example in English with its monthly ARPA not typed yet: the MRR can't be projected, so
 * there is no curve, and each figure is what is missing, in words (« missing: monthly ARPA »),
 * set quieter, never a numeral. « See the 7 levers »: the ARPA's own lever has no value, so it
 * leaves the count.
 */
export const Missing = () => (
  <div style={{ maxWidth: 760 }}>
    <LeverCard
      eyebrow={"What if?"}
      title={"Move the lever of the stage that holds you back, and see what follows."}
      lever={{ id: "engine-lever-act-rate-missing", label: "Activation rate (today 18%)", min: 9, max: 54, step: 1, value: 18, valueText: "18%" }}
      figures={[
        { key: "mrr12", label: "MRR in 12 months", value: "missing: monthly ARPA", unknown: true },
        { key: "arr12", label: "ARR in 12 months", value: "missing: monthly ARPA", unknown: true },
      ]}
      allLabel={"See the 7 levers and what the calculation assumes →"}
      resetLabel={"Back to today"}
      headingId="lever-missing"
    />
  </div>
);
