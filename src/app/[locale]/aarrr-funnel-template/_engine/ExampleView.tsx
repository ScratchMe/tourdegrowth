"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import { Card } from "@/components/core/Card";
import { pelotonTitle } from "@/lib/engine/deck";
import { relaysTitle, totalTitle } from "@/lib/engine/deck-motions";
import { deriveEngine } from "@/lib/engine/derive";
import type { AppMonetization } from "@/lib/engine/app-model";
import { EXAMPLE_CONSUMER_TARGETS, EXAMPLE_SLG_TARGETS, EXAMPLE_TARGETS, EXAMPLE_TODAY_ISO, exampleEngine } from "@/lib/engine/example";
import { fillTemplate, formatPercent } from "@/lib/engine/format";
import { knownSharedCount } from "@/lib/engine/shared-counts";
import { isApp } from "@/lib/engine/business-type";
import { candidatesFor } from "@/lib/engine/scenario-of";
import { knownIn } from "@/lib/engine/values";
import type { EngineStrings, ResolvedBridge, ResolvedDerived, ResolvedMetric } from "@/lib/engine/strings";
import type { BusinessType, CandidateId, EngineDeck, Interval, Motion, MotionDerived } from "@/lib/engine/types";
import type { Locale } from "@/lib/i18n/locale";
import { Coverage } from "./Coverage";
import { DeckView } from "./deck/DeckView";
import { Diagnosis } from "./Diagnosis";
import { MotionColumns } from "./MotionColumns";
import { Peloton } from "./Peloton";
import { Relays } from "./Relays";
import { TotalBand } from "./TotalBand";
import { Verdict } from "./Verdict";
import styles from "./Screens.module.css";

/**
 * « Voir un exemple rempli » (Antoine, 2026-09-25: « vu le travail que ça
 * demande, il faut qu'on montre un exemple plausible de slides et funnel
 * remplis »): the spec's §6.0 example — the very data set every test checks —
 * drawn by the board's own components, then its slides in the real slide
 * screen. For an app (§21.9) the data set is the consumer app's, and every
 * word is the app's (`stringsFor`).
 *
 * Read-only by construction: nothing here reaches the store. The slide
 * choices someone makes on the example live in this component's memory and
 * vanish with it, and the person's own engine (if any) is never touched.
 */
export function ExampleView({
  locale,
  stringsFor,
  type,
  monetization,
  metrics,
  derivedCopy,
  bridges,
  motions = { plg: true, slg: false },
  onBack,
}: {
  locale: Locale;
  /** The words of a type (§21.8.1): the example reads those of its own, whatever engine is on screen. */
  stringsFor: (type: BusinessType) => EngineStrings;
  /** The type of the example shown (§21.9): the SaaS's §6.0, or the consumer app's §21.9.1. */
  type: BusinessType;
  /** What the app earns from, as the start card had it ticked (§21.6.1); the example's three ways when absent. Read by an app only. */
  monetization?: AppMonetization;
  /** The catalogue of the example's type (`metricsFor`), likewise `derivedCopy`. */
  metrics: ResolvedMetric[];
  derivedCopy: ResolvedDerived[];
  bridges: ResolvedBridge[];
  /** The motions the setup card had ticked (§18.7): the example shows THOSE — the hybrid's §18.9 when both. */
  motions?: Record<Motion, boolean>;
  onBack: () => void;
}) {
  const strings = stringsFor(type);
  const e = strings.example;
  const app = isApp({ type });
  const [deck, setDeck] = useState<EngineDeck | null>(null);
  const [showDeck, setShowDeck] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const opened = useRef(false);

  const { plg: withPlg, slg: withSlg } = motions;
  const { state, ctx, derived, verdict } = useMemo(() => {
    const words = app
      ? { event: e.eventApp, channel: e.channelApp, company: e.companyApp, churnCause: e.churnCauseApp }
      : { event: e.event, channel: e.channel, company: e.company, liveEvent: e.liveEvent, lossCause: e.lossCause, pqlThreshold: e.pqlThreshold };
    const base = exampleEngine(words, { plg: withPlg, slg: withSlg }, type, monetization);
    const ctx = { today: new Date(EXAMPLE_TODAY_ISO), locale };
    const derived = deriveEngine(base, ctx, null, bridges, strings.units);
    const relays = derived.motions.find((m): m is Extract<MotionDerived, { motion: "slg" }> => m.motion === "slg");
    // The first slide's title, as on the board: the total, the relays, or the peloton.
    const verdict =
      withPlg && withSlg && derived.total
        ? totalTitle(derived.total, base, strings, ctx)
        : !withPlg && relays
          ? relaysTitle(base, relays.relays, strings, metrics, ctx)
          : pelotonTitle(base, derived.peloton, strings, metrics, ctx);
    return { state: base, ctx, derived, verdict };
  }, [e.event, e.channel, e.company, e.liveEvent, e.lossCause, e.pqlThreshold, e.eventApp, e.channelApp, e.companyApp, e.churnCauseApp, app, type, monetization, withPlg, withSlg, locale, bridges, strings, metrics]);

  useEffect(() => {
    if (!showDeck && opened.current) heading.current?.focus();
    opened.current = true;
  }, [showDeck]);

  const withDeck = deck ? { ...state, deck } : state;
  // Whose targets they are, read from the data so the banner cannot drift from what the diagnosis used.
  const targets = {
    activation: formatPercent(EXAMPLE_TARGETS["act.rate"]!, locale),
    churn: formatPercent(EXAMPLE_TARGETS["ret.logo-churn"]!, locale),
    winRate: formatPercent(EXAMPLE_SLG_TARGETS["slg.rev.win-rate"]!, locale),
    renewal: formatPercent(EXAMPLE_SLG_TARGETS["slg.ret.renewal"]!, locale),
  };
  // An app's three targets (§21.9.1), read the same way.
  const appTargets = {
    d30: formatPercent(EXAMPLE_CONSUMER_TARGETS["ret.d30"]!, locale),
    paid: formatPercent(EXAMPLE_CONSUMER_TARGETS["rev.paid-conversion"]!, locale),
    retention: formatPercent(EXAMPLE_CONSUMER_TARGETS["app.ret.active-retention"]!, locale),
  };
  const bannerTitle = app ? e.bannerTitleApp : e.bannerTitle;
  const bannerBody = app
    ? fillTemplate(e.bannerBodyApp, appTargets)
    : fillTemplate(withPlg && withSlg ? e.bannerBodyHybrid : withSlg ? e.bannerBodySlg : e.bannerBody, targets);

  if (showDeck) {
    return (
      <div className={styles.panel} data-testid="engine-example-deck">
        <Callout tone="caveat">
          <p>
            <strong>{bannerTitle}</strong> — {bannerBody}
          </p>
        </Callout>
        <DeckView
          locale={locale}
          strings={strings}
          metrics={metrics}
          derivedCopy={derivedCopy}
          bridges={bridges}
          state={withDeck}
          derived={derived}
          ctx={ctx}
          onDeckChange={setDeck}
          onBack={() => setShowDeck(false)}
        />
      </div>
    );
  }

  const snapshot = state.snapshots[0]!;
  // The board's own pieces, on a view with no actions: nothing here can write.
  const view = { state, derived, strings, metrics, derivedCopy, bridges, ctx, tourResult: null, tourOnDevice: false, deviceTour: null };
  const relays = derived.motions.find((m): m is Extract<MotionDerived, { motion: "slg" }> => m.motion === "slg");
  // As the board does: the diagnosis prints each named stage's value next to its comparator.
  const values: Partial<Record<CandidateId, Interval>> = {};
  for (const id of [...candidatesFor(state.setup, "plg"), ...candidatesFor(state.setup, "slg")]) {
    const known = knownIn(state, id, ctx);
    if (known.kind === "known") values[id] = known.value;
  }
  return (
    <div className={styles.panel} data-testid="engine-example">
      <Callout tone="caveat">
        <h2 id="engine-example-title" ref={heading} tabIndex={-1} className={styles.exampleTitle}>
          {bannerTitle}
        </h2>
        <p>{bannerBody}</p>
      </Callout>
      {withPlg && withSlg ? (
        <>
          <TotalBand view={view} verdict={verdict} />
          <MotionColumns view={view} />
        </>
      ) : withSlg && relays ? (
        <>
          <Verdict title={verdict} strings={strings} />
          <Coverage coverage={derived.coverage} strings={strings} />
          <Diagnosis diagnosis={relays.diagnosis} strings={strings} locale={locale} metrics={metrics} values={values} />
          <Card elevation="raised">
            <Relays relays={relays.relays} state={state} strings={strings} locale={locale} diagnosis={relays.diagnosis} />
          </Card>
        </>
      ) : (
        <>
          <Verdict title={verdict} strings={strings} />
          <Coverage coverage={derived.coverage} strings={strings} />
          <Diagnosis diagnosis={derived.diagnosis} strings={strings} locale={locale} metrics={metrics} values={values} />
          <Card elevation="raised">
            <Peloton
              peloton={derived.peloton}
              strings={strings}
              locale={locale}
              cohortMonth={snapshot.cohortMonth}
              paidWindowDays={state.setup.paidWindowDays}
              diagnosis={derived.diagnosis}
              cohortSignups={knownSharedCount(snapshot, "cohortSignups")?.value ?? null}
            />
          </Card>
        </>
      )}
      <div className={styles.panelActions}>
        <Button onClick={() => setShowDeck(true)} data-testid="engine-example-deck-open">
          {e.deck}
        </Button>
        <Button variant="quiet" onClick={onBack} data-testid="engine-example-back">
          {e.back}
        </Button>
      </div>
    </div>
  );
}
