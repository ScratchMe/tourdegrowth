"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type ReactNode,
} from "react";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import type { Locale } from "@/lib/i18n/locale";
import type { EngineStrings, ResolvedBridge, ResolvedDerived, ResolvedMetric } from "@/lib/engine/strings";
import type {
  DeckModel,
  DeckSlide,
  EngineAsk,
  EngineDeck,
  EngineDerived,
  EngineState,
  SanityId,
  SlideId,
} from "@/lib/engine/types";
import { AskForm } from "./AskForm";
import { askDefaults, isPristineAsk } from "./ask-defaults";
import { copyText } from "./copy-text";
import { canCopyImage, copyPng, downloadBlob, renderSlidePng } from "./export-png";
import { SLIDE_WIDTH, slideTitle, type SlideContext, type SlideProps } from "./SlideFrame";
import { SlideAnnex } from "./SlideAnnex";
import { SlideAsk } from "./SlideAsk";
import { SlideLeak } from "./SlideLeak";
import { SlideMirror } from "./SlideMirror";
import { SlidePeloton } from "./SlidePeloton";
import { SlideUnitEconomics } from "./SlideUnitEconomics";
import { SlideVisibility } from "./SlideVisibility";
import { fill } from "./slide-text";
import styles from "./deck.module.css";

/** What the island tells analytics — `engine_exported/<kind>` (§11). A copied image is a PNG export. */
export type DeckExportKind = "png" | "pdf" | "text";

export interface DeckViewProps {
  locale: Locale;
  strings: EngineStrings;
  metrics: ResolvedMetric[];
  derivedCopy: ResolvedDerived[];
  bridges: ResolvedBridge[];
  state: EngineState;
  derived: EngineDerived;
  /** `buildDeck(state, derived, …)` — every slide's title and lines, already formatted (lib/engine/deck.ts). */
  model: DeckModel;
  /** `deckMarkdown(model, strings)` — the "copy the text and notes" payload (§9.4). */
  markdown: string;
  /** The island persists; this screen only says what the deck settings became. */
  onDeckChange: (deck: EngineDeck) => void;
  onBack?: () => void;
  /** The island's own ".json" download (§4.3); the button is shown only when it is wired. */
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

const SANITY_KEY = {
  "num-gt-den": "numGtDen",
  "retained-gt-activated": "retainedGtActivated",
  "paid-gt-retained": "paidGtRetained",
  "churn-high": "churnHigh",
  "margin-odd": "marginOdd",
  "ttv-mean": "ttvMean",
  "cohort-mismatch": "cohortMismatch",
  "reconcile-gap": "reconcileGap",
} as const satisfies Record<SanityId, string>;

/**
 * The print sheet — engine spec §10.2.
 *
 * Global on purpose, and injected only while this screen is mounted: a CSS
 * Module may not hold a selector without a local class in it (`body *`
 * would be refused as impure), and a print rule that hid "everything but the
 * deck" living in globals.css would also hide every other page the day
 * someone printed it. Here it exists exactly as long as there is a deck to
 * print.
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
@page { size: ${SLIDE_WIDTH}px 1080px; margin: 0; }
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
  #engine-deck [data-print="viewport"] { width: ${SLIDE_WIDTH}px !important; height: 1080px !important; aspect-ratio: auto !important; overflow: hidden !important; border: 0 !important; box-shadow: none !important; }
  #engine-deck [data-print="scaler"] { transform: none !important; }
  #engine-deck, #engine-deck * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
`;

/** `ClipboardItem` exists on the client only; asking React for it this way keeps the server and first client render identical. */
const subscribeNever = () => () => {};
function useCanCopyImage(): boolean {
  return useSyncExternalStore(subscribeNever, canCopyImage, () => false);
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
 * lines, already formatted) or by the user (the ask); this screen places
 * them, lets the user choose which slides go, and exports — PDF through the
 * browser's own print, PNG through html-to-image loaded on the first click,
 * a copied image where the browser allows it, and the Markdown with the
 * speaker notes. Nothing here sends anything anywhere: every export is a
 * file or the clipboard, and the engine's boundary test forbids the calls
 * that would change that.
 */
export function DeckView({
  locale,
  strings,
  metrics,
  derivedCopy,
  bridges,
  state,
  derived,
  model,
  markdown,
  onDeckChange,
  onBack,
  onSaveJson,
  onExported,
}: DeckViewProps) {
  const t = strings.deck;
  const u = strings.deckUi;
  const uid = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const thumbs = useRef<Partial<Record<SlideId, HTMLElement | null>>>({});
  const [hd, setHd] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [enlarged, setEnlarged] = useState<SlideId | null>(null);
  const canCopy = useCanCopyImage();
  const deck = state.deck;
  const referenceMonth = state.snapshots[0]?.referenceMonth ?? "";

  // Arriving on this screen is a change of view: focus its heading, so a
  // screen reader says where it is and a keyboard starts from the top (R-19).
  useEffect(() => {
    heading.current?.focus();
  }, []);

  // The ask starts from what the engine can justify — the success metric the
  // diagnosis names, and the cheapest missing numbers checked (§7 E5) — but
  // only while nobody has touched it: a default must never overwrite a word
  // the user wrote. Once per mount.
  const prefilled = useRef(false);
  useEffect(() => {
    if (prefilled.current) return;
    prefilled.current = true;
    if (!isPristineAsk(deck.ask)) return;
    const defaults = askDefaults(state, derived);
    if (JSON.stringify(defaults) !== JSON.stringify(deck.ask)) onDeckChange({ ...deck, ask: defaults });
  }, [deck, state, derived, onDeckChange]);

  const context: SlideContext = { locale, strings, metrics, derivedCopy, bridges, state, derived, model };
  const shown = model.slides.filter((s) => s.present);
  const included = shown.filter((s) => s.included);
  const total = included.length;
  const lastIncluded = included[included.length - 1]?.id;
  const askSlide = model.slides.find((s) => s.id === "ask");
  const mirrorSlide = model.slides.find((s) => s.id === "mirror" && s.present);

  const setInclude = (id: SlideId, value: boolean) =>
    onDeckChange({ ...deck, include: { ...deck.include, [id]: value } });
  const setAsk = (ask: EngineAsk) => onDeckChange({ ...deck, ask });

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
        downloadBlob(blob, fill(u.pngFileName, { slide: slide.id, month: referenceMonth }));
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
    const ok = await copyText(markdown);
    setStatus(ok ? { text: t.textCopied, tone: "ok" } : { text: u.copyFailed, tone: "error" });
    if (ok) onExported?.("text");
  };

  const checks = model.checks;

  return (
    <section id="engine-deck" className={styles.deckView} aria-labelledby={`${uid}-title`} data-testid="engine-deck">
      <style>{PRINT_CSS}</style>

      <div className={styles.deckHead} data-print="off">
        {onBack ? (
          <Button variant="quiet" onClick={onBack} data-testid="deck-back">
            {u.back}
          </Button>
        ) : null}
        <h2 id={`${uid}-title`} ref={heading} tabIndex={-1} className={styles.deckTitle}>
          {t.title}
        </h2>
        <p className={styles.deckNote}>{t.containsData}</p>
      </div>

      {checks.length > 0 ? (
        <div data-print="off">
          <Callout tone="caveat" data-testid="deck-checks">
            <p className={styles.checksTitle}>
              {checks.length === 1 ? t.checksOne : fill(t.checks, { n: checks.length })}
            </p>
            <ul className={styles.checksList}>
              {checks.map((check, i) => (
                <li key={`${check.id}-${i}`}>{fill(strings.sanity[SANITY_KEY[check.id]], check.values)}</li>
              ))}
            </ul>
          </Callout>
        </div>
      ) : null}

      <div className={styles.deckPanels} data-print="off">
        <section className={styles.panel} aria-labelledby={`${uid}-settings`}>
          <h3 id={`${uid}-settings`} className={styles.panelTitle}>
            {u.settingsTitle}
          </h3>
          {state.setup.companyLabel ? (
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={deck.showCompany}
                onChange={(e) => onDeckChange({ ...deck, showCompany: e.target.checked })}
                data-testid="deck-show-company"
              />
              <span>{t.showCompany}</span>
            </label>
          ) : null}
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={deck.showSiteCredit}
              onChange={(e) => onDeckChange({ ...deck, showSiteCredit: e.target.checked })}
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

        <section className={styles.panel} aria-labelledby={`${uid}-exports`}>
          <h3 id={`${uid}-exports`} className={styles.panelTitle}>
            {u.exportsTitle}
          </h3>
          <div className={styles.exportActions}>
            <Button onClick={exportPdf} disabled={total === 0} data-testid="deck-pdf">
              {t.pdf}
            </Button>
            <Button variant="secondary" onClick={exportText} data-testid="deck-copy-text">
              {t.copyText}
            </Button>
            {onSaveJson ? (
              <Button variant="quiet" onClick={onSaveJson} data-testid="deck-save-json">
                {strings.actions.save}
              </Button>
            ) : null}
          </div>
          <p className={styles.fieldHint}>{t.pdfMobile}</p>
          <label className={styles.check}>
            <input type="checkbox" checked={hd} onChange={(e) => setHd(e.target.checked)} data-testid="deck-hd" />
            <span>{t.pngHd}</span>
          </label>
          <p className={styles.fieldHint}>{t.otherLanguageHint}</p>
          <p
            className={styles.status}
            role="status"
            aria-live="polite"
            data-tone={status?.tone}
            data-testid="deck-status"
          >
            {status?.text ?? ""}
          </p>
        </section>
      </div>

      {askSlide ? (
        <div data-print="off">
          <AskForm
            strings={strings}
            metrics={metrics}
            state={state}
            titlePreview={slideTitle(askSlide, strings)}
            onAskChange={setAsk}
          />
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
                  {slide.index !== null ? fill(u.slidePosition, { i: slide.index, n: total }) : u.excluded}
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
