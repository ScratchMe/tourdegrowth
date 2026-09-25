"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { deriveEngine } from "@/lib/engine/derive";
import { loadEngine, saveEngine } from "@/lib/engine/storage";
import type { EngineStrings, ResolvedBridge, ResolvedDerived, ResolvedMetric } from "@/lib/engine/strings";
import type { EngineState } from "@/lib/engine/types";
import type { Locale } from "@/lib/i18n/locale";
import { loadStoredResults } from "@/lib/quiz/storage";
import { DeckView } from "./_engine/deck/DeckView";

/**
 * The props contract of the growth engine's island — engine spec §4.4.
 * Everything arrives resolved to the page's language; the island imports no
 * content module and no dictionary (`engine-boundary.test.ts`), so it ships
 * one language's strings and none of the copy it doesn't render.
 */
export interface EngineWorkbenchProps {
  locale: Locale;
  /** `ENGINE_COPY` resolved (§14). */
  strings: EngineStrings;
  /** The fifteen numbers' prose, in catalogue order (`METRIC_SHAPES`). */
  metrics: ResolvedMetric[];
  /** The three computed figures (§5.7). */
  derived: ResolvedDerived[];
  /** The eight Tour bridges, question text and options in the Tour's order (§6.11). */
  bridges: ResolvedBridge[];
}

const noopSubscribe = () => () => {};

/**
 * The engine's client island — a SKELETON (P0). It proves the page can
 * prerender with the island mounted and that the props contract compiles;
 * the state machine (`view: "setup" | "board" | "collect" | "deck"`), the
 * reads and writes of `localStorage` and every screen arrive with P4-P6.
 *
 * `data-state` flips from "ssr" to "ready" once hydrated, read through
 * `useSyncExternalStore` rather than a mount effect: the server snapshot is
 * the empty state, identical to the first client render, which is the
 * hydration rule every screen of the engine has to keep (step 4's lesson,
 * spec R15). End-to-end helpers wait on it before touching anything.
 */
export function EngineWorkbench(props: EngineWorkbenchProps) {
  const { locale } = props;
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  return (
    <div data-testid="engine-workbench" data-state={hydrated ? "ready" : "ssr"} data-locale={locale}>
      {hydrated ? <DeckMount {...props} /> : null}
    </div>
  );
}

/**
 * P6 MOUNT POINT — the slide screen, until P4's island replaces this file.
 * P4 owns the board, the state machine and every write; the integrator
 * swaps this component for its `screen === "deck"` branch rendering
 * `<DeckView … onBack={openBoard} onSaveJson={exportJson} />` (DeckView owns
 * the section, its heading and its back button). Here it only reads the
 * stored engine once and shows its deck, so the slides can be exercised
 * end to end before the board exists.
 *
 * Mounted after hydration only, so reading `localStorage` in the state
 * initialisers is safe: there is no server render of this component to
 * mismatch (step 4's lesson).
 */
function DeckMount({ locale, strings, metrics, derived: derivedCopy, bridges }: EngineWorkbenchProps) {
  const [state, setState] = useState<EngineState | null>(() => {
    const result = loadEngine();
    return result.kind === "ok" ? result.state : null;
  });
  // The day the screen was opened, not each render's: a deck exported at
  // 23:59 and one at 00:01 must not say two different things.
  const [ctx] = useState(() => ({ today: new Date(), locale }));
  const [tourResults] = useState(() => loadStoredResults());

  const derived = useMemo(() => {
    if (!state) return null;
    const tourResult = state.tourLink ? (tourResults.find((r) => r.id === state.tourLink?.resultId) ?? null) : null;
    return deriveEngine(state, ctx, tourResult, bridges, strings.units);
  }, [state, ctx, tourResults, bridges, strings.units]);

  if (!state || !derived) return null;
  return (
    <DeckView
      locale={locale}
      strings={strings}
      metrics={metrics}
      derivedCopy={derivedCopy}
      bridges={bridges}
      state={state}
      derived={derived}
      ctx={ctx}
      onDeckChange={(deck) => {
        const next = { ...state, deck, updatedAt: new Date().toISOString() };
        // A failed write keeps the change on screen; P4's island is the one that shows the failure band.
        saveEngine(next);
        setState(next);
      }}
    />
  );
}
