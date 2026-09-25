import type { ReactNode, Ref } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import type { Locale } from "@/lib/i18n/locale";
import type { EngineStrings, ResolvedBridge, ResolvedDerived, ResolvedMetric } from "@/lib/engine/strings";
import type { DeckModel, DeckSlide, EngineDerived, EngineState } from "@/lib/engine/types";
import { lineOf } from "./deck-lines";
import { SlideText, fill } from "./slide-text";
import styles from "./deck.module.css";

/** A slide is laid out at projector size and scaled for the screen by its PARENT, never by itself (§10.2). */
export const SLIDE_WIDTH = 1920;
export const SLIDE_HEIGHT = 1080;

/**
 * Everything a slide may read. The model says what to print; the rest is for
 * the visuals (the peloton's dots are counts, not text) and for mapping ids
 * to labels. Nothing here is a place to format a number — see deck-lines.ts.
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
}

export interface SlideProps {
  slide: DeckSlide;
  context: SlideContext;
}

/** Past this many characters a title runs to a fourth line at 78px on a 1600px measure, so it takes the 62px step (measured on the §6.0 example). */
const LONG_TITLE = 110;

/** The finished title of a slide, from its template key and its finished values (§9.3, D10: never edited). */
export function slideTitle(slide: DeckSlide, strings: EngineStrings): string {
  return fill(strings.slideTitles[slide.title.key], slide.title.values);
}

/**
 * The frame every slide shares — engine spec §9.1: the kicker and the data
 * pill on top, one sentence of title carrying the number, the body, and a
 * footer with the sources on the left and, on the right, the wordmark, the
 * domain (when the credit is kept) and the page number.
 *
 * The kicker says "internal data" on every slide: a slide travels without
 * the meeting it was shown in, and whoever forwards it should see that.
 * The data pill counts measured, approximate and missing numbers on every
 * slide too — a number on a wall should never hide how much of the engine
 * it stands on.
 */
export function SlideFrame({
  slide,
  context,
  children,
  frameRef,
}: SlideProps & { children: ReactNode; frameRef?: Ref<HTMLDivElement> }) {
  const { strings, model, state, locale } = context;
  const title = slideTitle(slide, strings);
  const total = model.slides.filter((s) => s.present && s.included).length;
  const kicker = fill(strings.slide.kicker, model.kicker);
  const pill = fill(strings.slide.dataPill, {
    m: model.dataPill.measured,
    a: model.dataPill.approximate,
    x: model.dataPill.missing,
  });
  const footer = lineOf(slide, "footer")?.text ?? fill(strings.slide.footer, model.footer);
  const titleId = `slide-title-${slide.id}`;

  return (
    <div
      ref={frameRef}
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

      <h3 id={titleId} className={[styles.slideTitle, title.length > LONG_TITLE ? styles.slideTitleLong : ""].join(" ")}>
        <SlideText text={title} />
      </h3>

      <div className={styles.slideBody}>{children}</div>

      <footer className={styles.slideFoot}>
        <p className={styles.slideSources}>
          <SlideText text={footer} accent={false} />
        </p>
        <div className={styles.slideSign}>
          {state.deck.showSiteCredit ? (
            <>
              <Wordmark size="sm" className={styles.slideWordmark} />
              <span className={styles.slideDomain}>{strings.slide.credit}</span>
            </>
          ) : null}
          {slide.index !== null ? (
            <span className={styles.pageNumber}>
              {slide.index}/{total}
            </span>
          ) : null}
        </div>
      </footer>
    </div>
  );
}
