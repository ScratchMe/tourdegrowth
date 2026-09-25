import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { fillTemplate } from "@/lib/engine/format";
import type { EngineStrings, ResolvedBridge, ResolvedDerived, ResolvedMetric } from "@/lib/engine/strings";
import type { DeckModel, DeckSlide, EngineCalcContext, EngineDerived, EngineState } from "@/lib/engine/types";
import type { Locale } from "@/lib/i18n/locale";
import { SlideText, segments } from "./slide-text";
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
  strings: EngineStrings;
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
function titleClass(title: string): string | undefined {
  return TITLE_STEPS.find((step) => title.length <= step.upTo)?.className ?? styles.slideTitleXLong;
}

/** The finished title of a slide, from its template key and its finished values (§9.3, D10: never edited). */
export function slideTitle(slide: DeckSlide, strings: EngineStrings): string {
  return fillTemplate(strings.slideTitles[slide.title.key], slide.title.values);
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
  children,
}: SlideProps & { footer?: string; children: ReactNode }) {
  const { strings, model, locale } = context;
  const title = slideTitle(slide, strings);
  const total = model.slides.filter((s) => s.included).length;
  const kicker = fillTemplate(strings.slide.kicker, model.kicker);
  const pill = fillTemplate(strings.slide.dataPill, {
    m: model.dataPill.measured,
    a: model.dataPill.approximate,
    x: model.dataPill.missing,
  });
  const sources = segments(footer ?? fillTemplate(strings.slide.footer, model.footer));
  const credit = model.footer.credit ?? "";
  const titleId = `slide-title-${slide.id}`;

  return (
    <div
      className={styles.slide}
      data-slide={slide.id}
      data-testid={`slide-${slide.id}`}
      // A slide is printed on paper whatever world the page around it is in.
      data-world="paper"
      lang={locale}
      role="group"
      aria-labelledby={titleId}
    >
      <header className={styles.slideTop}>
        <p className={styles.kicker}>{kicker}</p>
        <p className={styles.dataPill}>{pill}</p>
      </header>

      <h3 id={titleId} className={[styles.slideTitle, titleClass(title)].filter(Boolean).join(" ")}>
        <SlideText text={title} />
      </h3>

      <div className={styles.slideBody}>{children}</div>

      <footer className={styles.slideFoot}>
        <p className={styles.slideSources}>
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
