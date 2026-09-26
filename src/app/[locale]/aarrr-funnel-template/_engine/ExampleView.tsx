"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import { Card } from "@/components/core/Card";
import { pelotonTitle } from "@/lib/engine/deck";
import { deriveEngine } from "@/lib/engine/derive";
import { EXAMPLE_TODAY_ISO, exampleEngine } from "@/lib/engine/example";
import { knownSharedCount } from "@/lib/engine/shared-counts";
import { CANDIDATE_IDS } from "@/lib/engine/catalog-shape";
import { knownIn } from "@/lib/engine/values";
import type { EngineStrings, ResolvedBridge, ResolvedDerived, ResolvedMetric } from "@/lib/engine/strings";
import type { CandidateId, EngineDeck, Interval } from "@/lib/engine/types";
import type { Locale } from "@/lib/i18n/locale";
import { Coverage } from "./Coverage";
import { DeckView } from "./deck/DeckView";
import { Diagnosis } from "./Diagnosis";
import { Peloton } from "./Peloton";
import { Verdict } from "./Verdict";
import styles from "./Screens.module.css";

/**
 * « Voir un exemple rempli » (Antoine, 2026-09-25: « vu le travail que ça
 * demande, il faut qu'on montre un exemple plausible de slides et funnel
 * remplis »): the spec's §6.0 example — the very data set every test checks —
 * drawn by the board's own components, then its slides in the real slide
 * screen.
 *
 * Read-only by construction: nothing here reaches the store. The slide
 * choices someone makes on the example live in this component's memory and
 * vanish with it, and the person's own engine (if any) is never touched.
 */
export function ExampleView({
  locale,
  strings,
  metrics,
  derivedCopy,
  bridges,
  onBack,
}: {
  locale: Locale;
  strings: EngineStrings;
  metrics: ResolvedMetric[];
  derivedCopy: ResolvedDerived[];
  bridges: ResolvedBridge[];
  onBack: () => void;
}) {
  const e = strings.example;
  const [deck, setDeck] = useState<EngineDeck | null>(null);
  const [showDeck, setShowDeck] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const opened = useRef(false);

  const { state, ctx, derived, verdict } = useMemo(() => {
    const base = exampleEngine({ event: e.event, channel: e.channel, company: e.company });
    const ctx = { today: new Date(EXAMPLE_TODAY_ISO), locale };
    const derived = deriveEngine(base, ctx, null, bridges, strings.units);
    return { state: base, ctx, derived, verdict: pelotonTitle(base, derived.peloton, strings, metrics, ctx) };
  }, [e.event, e.channel, e.company, locale, bridges, strings, metrics]);

  useEffect(() => {
    if (!showDeck && opened.current) heading.current?.focus();
    opened.current = true;
  }, [showDeck]);

  const withDeck = deck ? { ...state, deck } : state;

  if (showDeck) {
    return (
      <div className={styles.panel} data-testid="engine-example-deck">
        <Callout tone="caveat">
          <p>
            <strong>{e.bannerTitle}</strong> — {e.bannerBody}
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
  // As the board does: the diagnosis prints each named stage's value next to its comparator.
  const values: Partial<Record<CandidateId, Interval>> = {};
  for (const id of CANDIDATE_IDS) {
    const known = knownIn(state, id, ctx);
    if (known.kind === "known") values[id] = known.value;
  }
  return (
    <div className={styles.panel} data-testid="engine-example">
      <Callout tone="caveat">
        <h2 id="engine-example-title" ref={heading} tabIndex={-1} className={styles.exampleTitle}>
          {e.bannerTitle}
        </h2>
        <p>{e.bannerBody}</p>
      </Callout>
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
