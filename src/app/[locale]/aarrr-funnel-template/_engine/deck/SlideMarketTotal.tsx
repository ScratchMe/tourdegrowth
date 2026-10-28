import { SlideStreams } from "@/components/engine/SlideStreams";
import { rowOf, rowsOf } from "./deck-rows";
import { SlideFrame, type SlideProps } from "./SlideFrame";

/**
 * `mktTotal` — « Deux flux, un total » (engine spec §22.6.2, §22.12 MKT-8, C103), a marketplace's first slide when its sellers pay a
 * subscription. Its title is the total of the two streams (`mktTotal`, the board's band's own sentence); its body is `SlideStreams`,
 * a ledger read down: the commissions' net revenue, the sellers' subscriptions, then the total under a solid rule, for this month,
 * new a month, in 12 months at today's pace — and, once a « Et si » moved on either side, in 12 months with them.
 *
 * A SUM, never two cards face to face: no bar, no share, no « + » or « = », no curve (its end is the « Dans 12 mois » of the last
 * column). Under each stream's name, where it is read on its own (« les acheteurs, slides 2 à 5 »). Every word is the model's
 * (`streams` rows, `footer`), but the three columns' names, which are the neutral set's (`mkt.total`): this slide belongs to no side.
 */
export function SlideMarketTotal({ slide, context }: SlideProps) {
  const t = context.strings.mkt.total;
  const streams = rowsOf(slide, "streams");
  const footer = rowOf(slide, "footer")?.text;
  const demand = streams.find((row) => row.id === "demand");
  const supply = streams.find((row) => row.id === "supply");
  const total = streams.find((row) => row.id === "total");
  // The fourth column exists once a « Et si » moved, on either side.
  const moved = streams.some((row) => row.in12Moved !== "");
  const columns = [
    { key: "month", label: t.colMonth },
    { key: "fresh", label: t.newLabel },
    { key: "in12", label: t.in12Label },
    ...(moved ? [{ key: "in12Moved", label: t.colIn12Moved }] : []),
  ];
  const cells = (row: (typeof streams)[number]) => ({ month: row.month, fresh: row.fresh, in12: row.in12, in12Moved: row.in12Moved });

  return (
    <SlideFrame slide={slide} context={context} footer={footer}>
      {demand && supply && total ? (
        <SlideStreams
          caption={t.title}
          columns={columns}
          streams={[
            { id: "demand", label: demand.label, side: demand.side || undefined, values: cells(demand) },
            { id: "supply", label: supply.label, side: supply.side || undefined, values: cells(supply) },
          ]}
          total={{ label: total.label, values: cells(total) }}
          note={total.note || undefined}
          data-testid="slide-streams"
        />
      ) : null}
    </SlideFrame>
  );
}
