import { TotalBand } from "tour-de-growth";

/*
 * « Deux moteurs, un total » (design system extension 07, changed by
 * extension 09): the hybrid board's sum, once, at its top — each engine's MRR
 * in a fixed order, the total set off by a rule (a sum, never a comparison,
 * no « + » nor « = »), then the line of what else adds up and the link.
 *
 * Every prop is the product's own: the island's `TotalBand` (app/[locale]/
 * aarrr-funnel-template/_engine/TotalBand.tsx: `totalBlocks`, `formatSum`,
 * `totalIn12`, `addBoth`, `linkSentence`, `titleText`) run on the
 * engine's fixtures with the resolved copy — on the board (`Board.tsx`) and
 * in the example (`ExampleView.tsx`). Each engine's figure is passed as its
 * text: the island wraps it in a bare test-hook span. Only `headingId` is
 * suffixed so it stays unique on a page of cells.
 *
 * « Moteur affiché », the selector under the band on the board, is not part of
 * it (a `Field` around a `Segmented`). The phone layout — the two engines
 * side by side over their total, the totals two by two — is chosen by a 760px
 * media query on the window, which a card wider than that cannot draw.
 */

/**
 * The hybrid board (`hybridLossState()`, `lib/engine/__tests__/fixtures.ts`: the §18.9 hybrid
 * with the film's self-serve half and a sales-assisted margin of 75%), in French: the title is
 * the `total` slide's, set plain (the band drops the slide's accent marks); each engine's MRR,
 * self-serve then sales-assisted, and the total set off by a solid rule. Under a dashed
 * hairline, the three things that add up — the ARR, the MRR in twelve months at today's pace,
 * the cash tied up — then the link, said as a share of the pipeline, never an attribution.
 */
export const Board = () => (
  <div style={{ maxWidth: 760 }}>
    <TotalBand
      eyebrow={"Deux moteurs, un total"}
      title={"Le MRR atteint 228 000 € : 48 000 € en libre-service, 180 000 € en assisté."}
      headingId="total-board"
      engines={[
        { id: "plg", label: "MRR libre-service", value: "48 000 €" },
        { id: "slg", label: "MRR assisté", value: "180 000 €" },
      ]}
      total={{ label: "MRR total", value: "228 000 €" }}
      totals={[
        { key: "arr", label: "ARR total", value: "2 736 000 €" },
        { key: "mrr12", label: "MRR dans 12 mois au rythme actuel", value: "~411 000 € à 418 000 €" },
        { key: "cash", label: "Trésorerie immobilisée totale", value: "~1 700 000 €" },
      ]}
      link={
        <div>
          <p>{"31 opportunités sont venues du libre-service (juin à août 2026)."}</p>
          <p>{"Une part du pipeline, pas une attribution : on ne sait pas combien de ces comptes auraient signé sans le libre-service."}</p>
        </div>
      }
    />
  </div>
);

/**
 * The page's example with both motions ticked (`ExampleView`: `exampleEngine` with the
 * example's own words, on its own day), in English. Its sales-assisted gross margin is missing
 * (asked of finance), so that engine has no cash figure and the total cash tied up drops out
 * of the line: a partial total is no total. Two terms remain.
 */
export const Example = () => (
  <div style={{ maxWidth: 760 }}>
    <TotalBand
      eyebrow={"Two engines, one total"}
      title={"MRR stands at €228,000: €48,000 self-serve, €180,000 sales-assisted."}
      headingId="total-example"
      engines={[
        { id: "plg", label: "Self-serve MRR", value: "€48,000" },
        { id: "slg", label: "Sales-assisted MRR", value: "€180,000" },
      ]}
      total={{ label: "Total MRR", value: "€228,000" }}
      totals={[
        { key: "arr", label: "Total ARR", value: "€2,736,000" },
        { key: "mrr12", label: "MRR in 12 months at today's pace", value: "~€430,000–€440,000" },
      ]}
      link={
        <div>
          <p>{"31 opportunities came from self-serve (June to August 2026)."}</p>
          <p>{"A share of the pipeline, not an attribution: we don't know how many of these accounts would have signed without self-serve."}</p>
        </div>
      }
    />
  </div>
);

/**
 * The §18.9 hybrid (`hybridState()`) with the sales-assisted MRR not typed, in French: no
 * total. The title is the slide's « on ne peut pas encore additionner » sentence naming the
 * missing part — red on the slide, plain here: at the band's size the red would not read at AA
 * — the sales-assisted engine and the total read « pas de chiffre » (`missing`: in the text face,
 * muted, never the figures' face), and the line of what adds up is gone. The link still prints: it does not need the MRR.
 */
export const TotalUnknown = () => (
  <div style={{ maxWidth: 760 }}>
    <TotalBand
      eyebrow={"Deux moteurs, un total"}
      title={"On ne peut pas encore additionner les deux moteurs : le MRR de l'assisté n'est pas mesuré."}
      headingId="total-unknown"
      engines={[
        { id: "plg", label: "MRR libre-service", value: "48 000 €" },
        { id: "slg", label: "MRR assisté", value: "pas de chiffre", missing: true },
      ]}
      total={{ label: "MRR total", value: "pas de chiffre", missing: true }}
      link={
        <div>
          <p>{"31 opportunités sont venues du libre-service (juin à août 2026)."}</p>
          <p>{"Une part du pipeline, pas une attribution : on ne sait pas combien de ces comptes auraient signé sans le libre-service."}</p>
        </div>
      }
    />
  </div>
);
