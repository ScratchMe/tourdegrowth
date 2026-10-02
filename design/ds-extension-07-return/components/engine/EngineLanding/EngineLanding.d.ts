import * as React from 'react';

/**
 * EngineLanding — design system extension 07.
 * Everything above the tool on /aarrr-funnel-template, for both visits, from
 * ONE prerendered HTML. `[data-engine=known]` on an ancestor (normally
 * <html>, set before first paint by `engineKnownScript`) turns it into the
 * returning reader's version by CSS alone.
 */
export interface EngineLandingProps {
  /** "The engine" / « Le moteur ». */
  eyebrow: React.ReactNode;
  /** The page's H1: "Your growth engine" / « Ton moteur de growth ». Always in the HTML. */
  title: React.ReactNode;
  /** First visit only (hidden by CSS for a returning reader, still in the HTML). */
  lede?: React.ReactNode;
  /** First visit only, as `lede`. */
  positioning?: React.ReactNode;
  /** The privacy promise's title and body: a raised card before the call to action. Never folded. */
  promiseTitle: React.ReactNode;
  promiseBody: React.ReactNode;
  /** The promise in one line, for a returning reader (shown instead of the card, never folded). */
  promiseLine: React.ReactNode;
  /** "Enter your numbers →" — an anchor to the tool, drawn secondary: the page's one primary is the start card's (EngineStart), which shares the first visit's screens with it. Hidden for a returning reader (NextStep holds the primary). */
  cta: React.ReactNode;
  /** Default "#engine": the tool's id. */
  ctaHref?: string;
  ctaNote?: React.ReactNode;
  /** The page's Stopwatch (desktop, first visit only). Decorative: aria-hidden. */
  aside?: React.ReactNode;
  /** Returning only: the text of the tool's reserved place while the engine is read ("Opening your engine…"). The app unmounts it when the board renders. */
  reserve?: React.ReactNode;
}

export declare const EngineLanding: React.ComponentType<EngineLandingProps>;

/** The inline <head> script: marks <html data-engine="known"> when the storage key exists. Reads no value, sends nothing. */
export declare function engineKnownScript(storageKey: string): string;
