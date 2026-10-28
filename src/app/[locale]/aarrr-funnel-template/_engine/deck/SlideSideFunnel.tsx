import { SideFunnel } from "@/components/engine/SideFunnel";
import { mktFunnelView } from "../mkt-view";
import { rowOf } from "./deck-rows";
import { SlideFrame, slideStrings, slideTitle, type SlideProps } from "./SlideFrame";

/**
 * `mktFunnelDemand` and `mktFunnelSupply` — one side of a marketplace as a funnel (engine spec §22.6.2, §22.12 MKT-8, C103). The
 * title is the side's verdict (« Sur 100 inscrits côté acheteurs, 20 passent une première commande et **5 en passent une
 * deuxième**. », `mktFunnelTitle`, the board's own sentence), and the body is `SideFunnel` on the deck's 1 920 canvas: the 100
 * sign-ups and each stage counted on the same 100, the referred as rings, the upstream line with the legend on its right, the
 * buyers' liquidity on its own base of 100 after a rule, the sellers' two churns as monthly rates at the columns' right.
 *
 * The funnel is DRAWN from `mktFunnelView`, the function the board's funnel is drawn from: the screen and the slide cannot say one
 * side two ways. The `column` and `sideFunnel` rows of the slide are the same figures as the text export says them. Never a « ? »
 * glossary button on a slide (nothing on it can be clicked in a PDF or a PNG): the liquidity's heading is its words alone.
 */
export function SlideSideFunnel({ slide, context }: SlideProps) {
  const { state, derived, ctx, metrics, derivedCopy } = context;
  const side = slide.side;
  const strings = slideStrings(slide, context);
  const footer = rowOf(slide, "footer")?.text;
  if (!side) return <SlideFrame slide={slide} context={context} footer={footer}>{null}</SlideFrame>;

  const { base, title: _screenTitle, ...funnel } = mktFunnelView({ state, derived, ctx, strings, metrics, derivedCopy }, side, "slide");
  return (
    <SlideFrame slide={slide} context={context} footer={footer}>
      <SideFunnel
        {...funnel}
        // The slide's title is the verdict above it; the funnel's own is the screen's. Its accessible name is the verdict without its stress marks.
        title={slideTitle(slide, strings).replace(/\*\*/g, "")}
        base={base ? { title: base.title, column: base.column, line: base.line } : undefined}
        medium="slide"
        headingId={`slide-funnel-${side}`}
        data-testid={`slide-side-funnel-${side}`}
      />
    </SlideFrame>
  );
}
