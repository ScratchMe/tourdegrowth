"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ComponentType, type ReactNode } from "react";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import { buildDeck, deckMarkdown } from "@/lib/engine/deck";
import { fillTemplate } from "@/lib/engine/format";
import { sanityText } from "@/lib/engine/sentences";
import type { EngineStrings, ResolvedBridge, ResolvedDerived, ResolvedMetric } from "@/lib/engine/strings";
import type { DeckSlide, EngineAsk, EngineCalcContext, EngineDeck, EngineDerived, EngineState, SanityCheck, SlideId } from "@/lib/engine/types";
import { currentSnapshot } from "@/lib/engine/values";
import type { Locale } from "@/lib/i18n/locale";
import { AskForm } from "./AskForm";
import { askDefaults, isPristineAsk } from "./ask-defaults";
import { copyText } from "./copy-text";
import { canCopyImage, copyPng, downloadBlob, renderSlidePng } from "./export-png";
import { SLIDE_HEIGHT, SLIDE_WIDTH, slideTitle, type SlideContext, type SlideProps } from "./SlideFrame";
import { SlideAnnex } from "./SlideAnnex";
import { SlideAsk } from "./SlideAsk";
import { SlideLeak } from "./SlideLeak";
import { SlideMirror } from "./SlideMirror";
import { SlidePeloton } from "./SlidePeloton";
import { SlideUnitEconomics } from "./SlideUnitEconomics";
import { SlideVisibility } from "./SlideVisibility";
import styles from "./deck.module.css";

/** What the island tells analytics — `engine_exported/<kind>` (§11.6). A copied image counts as a PNG export. */
export type DeckExportKind = "png" | "pdf" | "text";

/**
 * What the island hands the slide screen. Everything is what the island
 * already holds once the board is on screen — the stored state, the derived
 * model computed from it, the calculation context — plus the resolved words.
 * The screen builds the deck model itself (`buildDeck`), because the ask it
 * shows may be a proposal that isn't stored yet (see `DeckView`).
 */
export interface DeckViewProps {
  locale: Locale;
  strings: EngineStrings;
  metrics: ResolvedMetric[];
  /** The three computed figures' prose (the unit-economics tiles, the mirror's LTV row). */
  derivedCopy: ResolvedDerived[];
  bridges: ResolvedBridge[];
  state: EngineState;
  /** `deriveEngine(state, ctx, tourResult, bridges, strings.units)` — the same object the board renders. */
  derived: EngineDerived;
  ctx: EngineCalcContext;
  /** The island persists: this screen only says what the deck settings became. */
  onDeckChange: (deck: EngineDeck) => void;
  onBack?: () => void;
  /** The island's own ".json" download (§4.3); the button shows only when it is wired. */
  onSaveJson?: () => void;
  onExported?: (kind: DeckExportKind) => void;
}

const SLIDES: Record<SlideId, ComponentType<SlideProps>> = {
  peloton: SlidePeloton,
  leak: SlideLeak,
  visibility: SlideVisibility,
  "unit-economics": SlideUnitEconomics,
  mirror: SlideMirror,
  ask: SlideAsk,
  annex: SlideAnnex,
};

/**
 * The print sheet — engine spec §10.2.
 *
 * Global on purpose, and in the document only while this screen is mounted:
 * a CSS Module may not hold a selector without a local class in it (`body *`
 * is refused as impure), and a print rule that hid "everything but the deck"
 * living in globals.css would also blank every other page the day someone
 * printed it. Here it exists exactly as long as there is a deck to print.
 *
 * Everything that is not the deck, or an ancestor of it, is removed; the
 * ancestors lose their box (padding, max-width, grid gaps) so the slides
 * start at the page's corner; inside the deck, anything marked
 * `data-print="off"` goes, each INCLUDED slide gets its own page, and the
 * scaler loses its transform — `!important` beats the inline style the
 * ResizeObserver wrote. `[hidden]` is restated because any element given a
 * display by these rules would otherwise ignore the attribute (CLAUDE.md,
 * lesson nº2). `print-color-adjust: exact` keeps the paper ground and the
 * peloton's dots: browsers drop backgrounds when printing by default.
 */
const PRINT_CSS = `
@page { size: ${SLIDE_WIDTH}px ${SLIDE_HEIGHT}px; margin: 0; }
@media print {
  html, body { margin: 0 !important; padding: 0 !important; min-height: 0 !important; height: auto !important; background: none !important; }
  body *:not(:has(#engine-deck)):not(#engine-deck):not(#engine-deck *) { display: none !important; }
  body *:has(#engine-deck) { display: block !important; margin: 0 !important; padding: 0 !important; border: 0 !important; width: auto !important; max-width: none !important; min-height: 0 !important; box-shadow: none !important; background: none !important; transform: none !important; }
  #engine-deck { display: block !important; margin: 0 !important; padding: 0 !important; width: ${SLIDE_WIDTH}px !important; max-width: none !important; }
  #engine-deck [data-print="off"], #engine-deck [hidden] { display: none !important; }
  #engine-deck [data-print="thumbs"] { display: block !important; margin: 0 !important; padding: 0 !important; }
  #engine-deck [data-print="thumb"] { display: block !important; margin: 0 !important; padding: 0 !important; border: 0 !important; box-shadow: none !important; background: none !important; break-inside: avoid; break-after: page; }
  #engine-deck [data-print="thumb"][data-last="true"] { break-after: auto; }
  #engine-deck [data-print="thumb"][data-included="false"] { display: none !important; }
  #engine-deck [data-print="viewport"] { width: ${SLIDE_WIDTH}px !important; height: ${SLIDE_HEIGHT}px !important; aspect-ratio: auto !important; overflow: hidden !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
  #engine-deck [data-print="scaler"] { transform: none !important; }
  #engine-deck, #engine-deck * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
`;

/** `ClipboardItem` exists on the client only; asking React for it this way keeps the server and first client render identical. */
const subscribeNever = () => () => {};
function useCanCopyImage(): boolean {
  return useSyncExternalStore(subscribeNever, canCopyImage, () => false);
}

const PDF_HINT_ID = "engine-deck-pdf-hint";
/** The width under which deck.module.css shows the PDF's phone warning (`.fieldHint.phoneOnly`). */
const PHONE_QUERY = "(max-width: 760px)";
function subscribePhone(onChange: () => void) {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
/**
 * Whether the phone warning is on screen. The CSS decides what is shown; this
 * only keeps `aria-describedby` in step with it — a description is read even
 * from a hidden element, and on a computer "more reliable from a computer"
 * would describe the button as the opposite of what the reader is doing.
 */
function usePhone(): boolean {
  return useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE_QUERY).matches, () => false);
}

/**
 * One slide at projector size inside a box sized for the screen (§10.2).
 *
 * The scale is written on the PARENT of the slide, never on the slide: the
 * PNG export renders the slide node itself, and a node that carries its own
 * transform comes out of html-to-image transformed. The factor is measured,
 * not declared — CSS can't divide one length by another — and written
 * straight to the element, so a resize never re-renders the slide.
 */
function ScaledSlide({ children }: { children: ReactNode }) {
  const viewport = useRef<HTMLDivElement>(null);
  const scaler = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const box = viewport.current;
    const inner = scaler.current;
    if (!box || !inner) return;
    const apply = () => {
      inner.style.transform = `scale(${box.clientWidth / SLIDE_WIDTH})`;
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={viewport} className={styles.viewport} data-print="viewport">
      <div ref={scaler} className={styles.scaler} data-print="scaler">
        {children}
      </div>
    </div>
  );
}

type Status = { text: string; tone: "ok" | "error" } | null;

/**
 * E5 — the slide screen (engine spec §7 E5, §9, §10).
 *
 * Every word on a slide was written by `lib/engine/deck.ts` (titles and
 * rows, already formatted) or by the user (the ask); this screen places
 * them, lets the user choose which slides go, and exports — PDF through the
 * browser's own print, PNG through html-to-image loaded on the first click,
 * a copied image where the browser allows it, and the Markdown with the
 * speaker notes. Nothing here sends anything anywhere: every export is a
 * file or the clipboard, and the engine's boundary test forbids the calls
 * that would change that.
 *
 * The ask starts from what the engine can justify (§7 E5): the stage the
 * diagnosis names and its target, the cheapest missing numbers checked. That
 * proposal lives in memory and is what the slides show until the user edits
 * the ask — then the whole ask, proposal included, is handed to the island
 * to store. Opening the screen never writes: a visit that changes the stored
 * engine would raise the "not saved since" band for nothing.
 */
export function DeckView({
  locale,
  strings,
  metrics,
  derivedCopy,
  bridges,
  state,
  derived,
  ctx,
  onDeckChange,
  onBack,
  onSaveJson,
  onExported,
}: DeckViewProps) {
  const t = strings.deck;
  const u = strings.deckUi;
  const heading = useRef<HTMLHeadingElement>(null);
  const thumbs = useRef<Partial<Record<SlideId, HTMLElement | null>>>({});
  const [hd, setHd] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [enlarged, setEnlarged] = useState<SlideId | null>(null);
  const canCopy = useCanCopyImage();
  const phone = usePhone();

  // Proposed once per visit, from the state the screen opened on.
  const [proposal] = useState<EngineAsk | null>(() => (isPristineAsk(state.deck.ask) ? askDefaults(state, derived) : null));
  const [askTouched, setAskTouched] = useState(false);
  const ask = proposal && !askTouched && isPristineAsk(state.deck.ask) ? proposal : state.deck.ask;
  const deck: EngineDeck = useMemo(() => ({ ...state.deck, ask }), [state.deck, ask]);
  const model = useMemo(
    // With the prose: without it the computed figures and the Tour bridges are written with empty labels.
    () => buildDeck({ ...state, deck }, derived, strings, metrics, ctx, { derived: derivedCopy, bridges }),
    [state, deck, derived, strings, metrics, ctx, derivedCopy, bridges],
  );

  // Arriving on this screen is a change of view: focus its heading, so a
  // screen reader says where it is and a keyboard starts from the top (R-19).
  useEffect(() => {
    heading.current?.focus();
  }, []);

  const context: SlideContext = { locale, strings, metrics, derivedCopy, bridges, state: { ...state, deck }, derived, model, ctx };
  const shown = model.slides.filter((s) => s.present);
  const included = shown.filter((s) => s.included);
  const lastIncluded = included[included.length - 1]?.id;
  const askSlide = model.slides.find((s) => s.id === "ask");
  const mirrorSlide = model.slides.find((s) => s.id === "mirror" && s.present);
  const referenceMonth = currentSnapshot(state).referenceMonth;

  const change = (next: Partial<EngineDeck>) => onDeckChange({ ...state.deck, ...next });
  const setInclude = (id: SlideId, value: boolean) => change({ include: { ...state.deck.include, [id]: value } });
  const setAsk = (next: EngineAsk) => {
    setAskTouched(true);
    change({ ask: next });
  };

  const slideNode = (id: SlideId) => thumbs.current[id]?.querySelector<HTMLElement>("[data-slide]") ?? null;

  const exportPng = async (slide: DeckSlide, mode: "download" | "copy") => {
    const node = slideNode(slide.id);
    if (!node) return;
    setBusy(`${mode}-${slide.id}`);
    setStatus(null);
    try {
      const blob = await renderSlidePng(node, { hd });
      if (mode === "copy") {
        await copyPng(blob);
        setStatus({ text: u.imageCopied, tone: "ok" });
      } else {
        downloadBlob(blob, fillTemplate(u.pngFileName, { slide: slide.id, month: referenceMonth }));
      }
      onExported?.("png");
    } catch {
      setStatus({ text: mode === "copy" ? u.copyFailed : t.pngFailed, tone: "error" });
    } finally {
      setBusy(null);
    }
  };

  const exportPdf = async () => {
    setStatus(null);
    // A page printed before its webfonts arrive is printed in the fallback
    // face — and embeds it (§10.4).
    await document.fonts.ready;
    window.print();
    onExported?.("pdf");
  };

  const exportText = async () => {
    const ok = await copyText(deckMarkdown(model, strings));
    setStatus(ok ? { text: t.textCopied, tone: "ok" } : { text: u.copyFailed, tone: "error" });
    if (ok) onExported?.("text");
  };

  // The check's sentence is the engine's (`sanityText`: its counts carried
  // formatted by the check itself, its noun agreeing with them). `num-gt-den`
  // says "the first count" without naming the number, and a screen listing
  // several checks must say which: its name leads, as a label — a dash rather
  // than a colon, so the line reads right in both languages without a
  // typography rule here.
  const checkText = (check: SanityCheck) => {
    const message = sanityText(check, strings, locale);
    const name = check.id === "num-gt-den" ? metrics.find((m) => m.id === check.metrics[0])?.name : undefined;
    return name ? `${name} — ${message}` : message;
  };

  return (
    <section id="engine-deck" className={styles.deckView} aria-labelledby="engine-deck-title" data-testid="engine-deck">
      <style>{PRINT_CSS}</style>

      <div className={styles.deckHead} data-print="off">
        <h2 id="engine-deck-title" ref={heading} tabIndex={-1} className={styles.deckTitle}>
          {t.title}
        </h2>
        <p className={styles.deckNote}>{t.containsData}</p>
        {onBack ? (
          <Button variant="quiet" onClick={onBack} data-testid="engine-deck-back">
            {u.back}
          </Button>
        ) : null}
      </div>

      {model.checks.length > 0 ? (
        <div data-print="off">
          <Callout tone="caveat" data-testid="deck-checks">
            <p className={styles.checksTitle}>
              {model.checks.length === 1 ? t.checksOne : fillTemplate(t.checks, { n: model.checks.length })}
            </p>
            <ul className={styles.checksList}>
              {model.checks.map((check, i) => (
                <li key={`${check.id}-${i}`}>{checkText(check)}</li>
              ))}
            </ul>
          </Callout>
        </div>
      ) : null}

      <div className={styles.deckPanels} data-print="off">
        <section className={styles.panel} aria-labelledby="engine-deck-settings">
          <h3 id="engine-deck-settings" className={styles.panelTitle}>
            {u.settingsTitle}
          </h3>
          {state.setup.companyLabel ? (
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={state.deck.showCompany}
                onChange={(e) => change({ showCompany: e.target.checked })}
                data-testid="deck-show-company"
              />
              <span>{t.showCompany}</span>
            </label>
          ) : null}
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={state.deck.showSiteCredit}
              onChange={(e) => change({ showSiteCredit: e.target.checked })}
              data-testid="deck-show-credit"
            />
            <span>{t.showCredit}</span>
          </label>
          {mirrorSlide ? (
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={mirrorSlide.included}
                onChange={(e) => setInclude("mirror", e.target.checked)}
                data-testid="deck-show-mirror"
              />
              <span>
                {t.showMirror}
                <span className={styles.checkHint}>{t.showMirrorHint}</span>
              </span>
            </label>
          ) : null}
        </section>

        <section className={styles.panel} aria-labelledby="engine-deck-exports">
          <h3 id="engine-deck-exports" className={styles.panelTitle}>
            {u.exportsTitle}
          </h3>
          <div className={styles.exportActions}>
            {/* The phone warning is about the PDF, so it sits under that button and describes it —
                read under both buttons, it could pass for a note about the copied text. */}
            <div className={styles.exportPdf}>
              <Button
                onClick={exportPdf}
                disabled={included.length === 0}
                aria-describedby={phone ? PDF_HINT_ID : undefined}
                data-testid="deck-pdf"
              >
                {t.pdf}
              </Button>
              <p id={PDF_HINT_ID} className={`${styles.fieldHint} ${styles.phoneOnly}`} data-testid="deck-pdf-hint">
                {t.pdfMobile}
              </p>
            </div>
            <Button variant="secondary" onClick={exportText} data-testid="deck-copy-text">
              {t.copyText}
            </Button>
            {onSaveJson ? (
              <Button variant="quiet" onClick={onSaveJson} data-testid="deck-save-json">
                {strings.actions.save}
              </Button>
            ) : null}
          </div>
          <label className={styles.check}>
            <input type="checkbox" checked={hd} onChange={(e) => setHd(e.target.checked)} data-testid="deck-hd" />
            <span>{t.pngHd}</span>
          </label>
          <p className={styles.fieldHint}>{t.otherLanguageHint}</p>
          <p className={styles.status} role="status" aria-live="polite" data-tone={status?.tone} data-testid="deck-status">
            {status?.text ?? ""}
          </p>
        </section>
      </div>

      {askSlide ? (
        <div data-print="off">
          <AskForm locale={locale} strings={strings} metrics={metrics} state={state} ask={ask} titlePreview={slideTitle(askSlide, strings)} onAskChange={setAsk} />
        </div>
      ) : null}

      <ol className={styles.thumbs} data-print="thumbs">
        {shown.map((slide) => {
          const Slide = SLIDES[slide.id];
          const isEnlarged = enlarged === slide.id;
          return (
            <li
              key={slide.id}
              ref={(el) => {
                thumbs.current[slide.id] = el;
              }}
              className={styles.thumb}
              data-print="thumb"
              data-included={slide.included ? "true" : "false"}
              data-last={slide.id === lastIncluded ? "true" : undefined}
              data-enlarged={isEnlarged || undefined}
              data-testid={`deck-thumb-${slide.id}`}
            >
              <div className={styles.thumbHead} data-print="off">
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={slide.included}
                    onChange={(e) => setInclude(slide.id, e.target.checked)}
                    data-testid={`deck-include-${slide.id}`}
                  />
                  <span>{t.include}</span>
                </label>
                <span className={styles.thumbPosition}>
                  {slide.index !== null ? fillTemplate(u.slidePosition, { i: slide.index, n: included.length }) : u.excluded}
                </span>
              </div>

              <ScaledSlide>
                <Slide slide={slide} context={context} />
              </ScaledSlide>

              <div className={styles.thumbActions} data-print="off">
                <Button
                  variant="secondary"
                  onClick={() => exportPng(slide, "download")}
                  loading={busy === `download-${slide.id}`}
                  disabled={busy !== null}
                  data-testid={`deck-png-${slide.id}`}
                >
                  {t.png}
                </Button>
                {canCopy ? (
                  <Button
                    variant="quiet"
                    onClick={() => exportPng(slide, "copy")}
                    loading={busy === `copy-${slide.id}`}
                    disabled={busy !== null}
                    data-testid={`deck-copy-image-${slide.id}`}
                  >
                    {t.copyImage}
                  </Button>
                ) : null}
                <Button
                  variant="quiet"
                  className={styles.enlarge}
                  onClick={() => setEnlarged(isEnlarged ? null : slide.id)}
                  aria-pressed={isEnlarged}
                >
                  {isEnlarged ? u.shrink : u.enlarge}
                </Button>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

