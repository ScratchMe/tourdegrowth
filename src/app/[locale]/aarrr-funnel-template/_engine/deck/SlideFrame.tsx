import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { fillTemplate } from "@/lib/engine/format";
import { fillSegments } from "@/lib/engine/phrases";
import { isSellingMotion } from "@/lib/engine/setup-type";
import type { EngineStrings, ResolvedBridge, ResolvedDerived, ResolvedMetric } from "@/lib/engine/strings";
import type { DeckModel, DeckSlide, EngineCalcContext, EngineDerived, EngineState, MktSide } from "@/lib/engine/types";
import { titleAccent } from "@/lib/engine/title-accent";
import type { Locale } from "@/lib/i18n/locale";
import { SlideText } from "./slide-text";
import styles from "./deck.module.css";

/** A slide is laid out at projector size and scaled for the screen by its PARENT, never by itself (§10.2). */
export const SLIDE_WIDTH = 1920;
export const SLIDE_HEIGHT = 1080;

/**
 * Everything a slide may read. The model (`buildDeck`) says what to print;
 * the rest is for the visuals — the peloton's dots are counts drawn from
 * intervals, the timeline is a position — and for mapping an id to its
 * label. Nothing here is a place to format a number (see deck-rows.ts).
 */
export interface SlideContext {
  locale: Locale;
  /** The neutral set: what a slide that belongs to no side reads (the common slides, the marketplace's total). */
  strings: EngineStrings;
  /**
   * A marketplace's words for one side (`marketplaceStrings(…, side)`, §22.8.1): a slide about a side reads these, not `strings`
   * (`slideStrings`). Without a marketplace it is `strings` for both.
   */
  stringsForSide: (side: MktSide) => EngineStrings;
  metrics: ResolvedMetric[];
  derivedCopy: ResolvedDerived[];
  bridges: ResolvedBridge[];
  state: EngineState;
  derived: EngineDerived;
  model: DeckModel;
  ctx: EngineCalcContext;
}

export interface SlideProps {
  slide: DeckSlide;
  context: SlideContext;
}

/**
 * Title lengths, in characters (accent marks included), past which the
 * title takes a smaller step so the body keeps its room under it. Measured
 * on the rendered §6.0 slides in both languages: at the full size, a
 * 95-character title (visibility, French) already took three lines and
 * pushed the last "what's missing" card into the footer; one step down, the
 * longest data titles (peloton ~140, leak ~116) hold in three lines with the
 * body clear of the footer. Only a long ask — up to 120 characters of the
 * user's own words inside its template — needs the third step.
 */
const TITLE_STEPS = [
  { upTo: 72, className: "" },
  { upTo: 150, className: styles.slideTitleLong },
] as const;

// A CSS module's class lookup is `string | undefined` under noUncheckedIndexedAccess.
// A marketplace side's slide never takes the full size: with its side's title above and its two-line footer it has ~70px less
// than the SaaS's, and the titles of its twelve slides (short ones, « Sur 100 vendeurs inscrits, 30 font une première vente. »,
// and long ones) read at one size (A23 MKT-8, measured on the funnels, the leak and the « Et si »).
function titleClass(title: string, side: boolean): string | undefined {
  const steps = side ? TITLE_STEPS.slice(1) : TITLE_STEPS;
  return steps.find((step) => title.length <= step.upTo)?.className ?? styles.slideTitleXLong;
}

/** The finished title of a slide, from its template key and its finished values (§9.3, D10: never edited). */
export function slideTitle(slide: DeckSlide, strings: EngineStrings): string {
  return fillTemplate(strings.slideTitles[slide.title.key], slide.title.values);
}

/**
 * The words a slide reads (§22.8.1, MKT-R finding 45): a marketplace's side slide reads that side's, because its title is a
 * template the side's layer rewrites (`leakClearMrrNew` says « revenu net » for the buyers and « MRR des abonnements » for the
 * sellers) and is resolved here, at render, with one set of strings. Every other slide reads the neutral set.
 */
export function slideStrings(slide: DeckSlide, context: SlideContext): EngineStrings {
  return slide.side ? context.stringsForSide(slide.side) : context.strings;
}

/**
 * The frame every slide shares — engine spec §9.1: the kicker and the data
 * pill on top, one sentence of title carrying the number, the body, and a
 * footer with the sources on the left and, on the right, the wordmark, the
 * domain (when the credit is kept) and the page number.
 *
 * The kicker says "internal data" on every slide: a slide travels without
 * the meeting it was shown in, and whoever forwards it should see that. The
 * data pill counts measured, approximate and missing numbers on every slide
 * too — a number on a wall should never hide how much of the engine it
 * stands on.
 */
export function SlideFrame({
  slide,
  context,
  footer,
  footerDense = false,
  children,
}: SlideProps & { footer?: string; footerDense?: boolean; children: ReactNode }) {
  const { model, locale } = context;
  const strings = slideStrings(slide, context);
  const title = slideTitle(slide, strings);
  const total = model.slides.filter((s) => s.included).length;
  // In the hybrid, a motion's slide wears that motion's chrome: its name in the kicker, its own count, its own months (§18.8.1).
  // A marketplace's has the one kicker and pill of the deck: its side is named above its title, not in its header line.
  const own = slide.motion && isSellingMotion(slide.motion) ? model.byMotion?.[slide.motion] : undefined;
  const kicker = own?.kicker ?? fillTemplate(strings.slide.kicker, model.kicker);
  const counts = own?.dataPill ?? model.dataPill;
  const pill = fillTemplate(strings.slide.dataPill, {
    m: counts.measured,
    a: counts.approximate,
    x: counts.missing,
  });
  // The model finishes every footer (an empty slot dropped whole, never « sources : » left dangling).
  const sources = footer ?? own?.footer ?? model.footer.text ?? fillSegments(strings.slide.footer, model.footer);
  const credit = model.footer.credit ?? "";
  const titleId = `slide-title-${slide.id}`;

  return (
    <div
      className={styles.slide}
      data-slide={slide.id}
      data-motion={slide.motion}
      data-side={slide.side}
      data-testid={`slide-${slide.id}`}
      // A slide is printed on paper whatever world the page around it is in.
      data-world="paper"
      // « Fond blanc » (§19.8, A14 T6): the deck's choice, on every slide — so the PNG and the PDF of one slide follow it.
      data-theme={context.state.deck.theme === "white" ? "white" : "paper"}
      lang={locale}
      role="group"
      aria-labelledby={titleId}
    >
      <header className={styles.slideTop}>
        <p className={styles.kicker}>{kicker}</p>
        <p className={styles.dataPill}>{pill}</p>
      </header>

      {/* The side a slide is about, in ink, above its title: every slide of a side says whose numbers it holds (C70, C103). */}
      {slide.side ? (
        <p className={styles.slideSide} data-testid={`slide-side-${slide.id}`}>
          {strings.mkt.side[slide.side === "demand" ? "demandTitle" : "supplyTitle"]}
        </p>
      ) : null}

      <h3 id={titleId} className={[styles.slideTitle, titleClass(title, slide.side !== undefined)].filter(Boolean).join(" ")}>
        {/* Red only for the verdict and the diagnosis; every other figure in ink (C53). */}
        <SlideText text={title} accent={titleAccent(slide.title.key) === "red"} />
      </h3>

      <div className={styles.slideBody}>{children}</div>

      <footer className={[styles.slideFoot, footerDense ? styles.slideFootDense : ""].filter(Boolean).join(" ")}>
        <p className={[styles.slideSources, footerDense ? styles.slideSourcesDense : ""].filter(Boolean).join(" ")}>
          <SlideText text={sources} accent={false} />
        </p>
        <div className={styles.slideSign}>
          {credit ? (
            <>
              <Wordmark size="sm" className={styles.slideWordmark} />
              <span className={styles.slideDomain}>{credit}</span>
            </>
          ) : null}
          {slide.index !== null ? (
            <span className={styles.pageNumber} data-testid={`slide-page-${slide.id}`}>
              {slide.index}/{total}
            </span>
          ) : null}
        </div>
      </footer>
    </div>
  );
}
