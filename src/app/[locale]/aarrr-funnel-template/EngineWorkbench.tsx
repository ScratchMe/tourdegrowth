"use client";

import { useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n/locale";
import type { EngineStrings, ResolvedBridge, ResolvedDerived, ResolvedMetric } from "@/lib/engine/strings";

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
export function EngineWorkbench({ locale }: EngineWorkbenchProps) {
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  return <div data-testid="engine-workbench" data-state={hydrated ? "ready" : "ssr"} data-locale={locale} />;
}
