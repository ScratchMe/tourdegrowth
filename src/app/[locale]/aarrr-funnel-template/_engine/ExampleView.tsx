"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import { Card } from "@/components/core/Card";
import { SideShown } from "@/components/engine/SideShown";
import { TotalBand as StreamsBand } from "@/components/engine/TotalBand";
import { pelotonTitle } from "@/lib/engine/deck";
import { relaysTitle, totalTitle } from "@/lib/engine/deck-motions";
import { deriveEngine } from "@/lib/engine/derive";
import { EXAMPLE_CONSUMER_TARGETS, EXAMPLE_MKT_TARGETS, EXAMPLE_SLG_TARGETS, EXAMPLE_TARGETS, EXAMPLE_TODAY_ISO, exampleEngine } from "@/lib/engine/example";
import { fillTemplate, formatPercent } from "@/lib/engine/format";
import { knownSharedCount } from "@/lib/engine/shared-counts";
import { isApp } from "@/lib/engine/business-type";
import { isMarketplace } from "@/lib/engine/setup-type";
import { candidatesFor } from "@/lib/engine/scenario-of";
import { knownIn } from "@/lib/engine/values";
import type { EngineStrings, ResolvedBridge, ResolvedDerived, ResolvedMetric } from "@/lib/engine/strings";
import type { BusinessType, CandidateId, EngineDeck, Interval, LeverId, MktSide, Motion, MotionDerived, SlideTitle } from "@/lib/engine/types";
import type { Locale } from "@/lib/i18n/locale";
import { Coverage } from "./Coverage";
import { DeckView } from "./deck/DeckView";
import { Diagnosis } from "./Diagnosis";
import { MarketSide } from "./MarketSide";
import { mktTotalView } from "./mkt-view";
import { MotionColumns } from "./MotionColumns";
import { Peloton } from "./Peloton";
import { Relays } from "./Relays";
import { TotalBand } from "./TotalBand";
import { Verdict } from "./Verdict";
import type { EngineView } from "./view";
import styles from "./Screens.module.css";

/**
 * « Voir un exemple rempli » (Antoine, 2026-09-25: « vu le travail que ça
 * demande, il faut qu'on montre un exemple plausible de slides et funnel
 * remplis »): the spec's §6.0 example — the very data set every test checks —
 * drawn by the board's own components, then its slides in the real slide
 * screen. For an app (§21.9) the data set is the consumer app's, earning from
 * its three ways whatever the start card ticks (§21.6.1), and every word is
 * the app's (`stringsFor`). For a marketplace (§22.10) it is the second-hand
 * furniture one, in the words of "products" and with the sellers paying a
 * subscription whatever the start card ticks: its board is the marketplace's
 * own (the total, « Côté affiché », one side's board), drawn by the very
 * components of the real board, and its two sides each read their own words.
 *
 * Read-only by construction: nothing here reaches the store. The slide
 * choices someone makes on the example, and the « Et si » sliders of a
 * marketplace's sides, live in this component's memory and vanish with it,
 * and the person's own engine (if any) is never touched.
 */
export function ExampleView({
  locale,
  stringsFor,
  type,
  metrics,
  derivedCopy,
  bridges,
  motions = { plg: true, slg: false },
  onBack,
}: {
  locale: Locale;
  /**
   * The words of a type (§21.8.1): the example reads those of its own, whatever engine is on screen. The marketplace's also
   * depend on its offering and on a side (§22.8.1, the signature the island's `stringsFor` has): its example is in "products",
   * asks the neutral set for its bar, band and banner, and each side's for what that side shows.
   */
  stringsFor: (type: BusinessType, offering?: "products" | "services", side?: MktSide | null) => EngineStrings;
  /** The type of the example shown (§21.9, §22.10): the SaaS's §6.0, the consumer app's §21.9.1 or the marketplace's §22.10.1. */
  type: BusinessType;
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
  const marketplace = isMarketplace({ type });
  const [deck, setDeck] = useState<EngineDeck | null>(null);
  const [showDeck, setShowDeck] = useState(false);
  // A marketplace's « Côté affiché » (the demand first, as on the board) and the « Et si » its sliders test: both in memory only.
  const [side, setSide] = useState<MktSide>("demand");
  const [whatIf, setWhatIf] = useState<Partial<Record<LeverId, number>>>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const opened = useRef(false);

  const { plg: withPlg, slg: withSlg } = motions;
  const { state, ctx, derived, verdict } = useMemo(() => {
    // No entry of the marketplace's example has a free text (§22.10.1): its only word is the company the slides print.
    const words = marketplace
      ? { event: "", channel: "", company: e.companyMkt }
      : app
        ? { event: e.eventApp, channel: e.channelApp, company: e.companyApp, churnCause: e.churnCauseApp }
        : { event: e.event, channel: e.channel, company: e.company, liveEvent: e.liveEvent, lossCause: e.lossCause, pqlThreshold: e.pqlThreshold };
    const base = exampleEngine(words, { plg: withPlg, slg: withSlg }, type);
    const ctx = { today: new Date(EXAMPLE_TODAY_ISO), locale };
    const derived = deriveEngine(base, ctx, null, bridges, strings.units);
    const relays = derived.motions.find((m): m is Extract<MotionDerived, { motion: "slg" }> => m.motion === "slg");
    // The first slide's title, as on the board: the total, the relays, or the peloton. A marketplace has none here (null): its
    // headline is its band's, drawn by `MarketExample` from the same derived object.
    const verdict: SlideTitle | null = marketplace
      ? null
      : withPlg && withSlg && derived.total
        ? totalTitle(derived.total, base, strings, ctx)
        : !withPlg && relays
          ? relaysTitle(base, relays.relays, strings, metrics, ctx)
          : pelotonTitle(base, derived.peloton, strings, metrics, ctx);
    return { state: base, ctx, derived, verdict };
  }, [e.event, e.channel, e.company, e.liveEvent, e.lossCause, e.pqlThreshold, e.eventApp, e.channelApp, e.companyApp, e.churnCauseApp, e.companyMkt, app, marketplace, type, withPlg, withSlg, locale, bridges, strings, metrics]);

  useEffect(() => {
    if (!showDeck && opened.current) heading.current?.focus();
    opened.current = true;
  }, [showDeck]);

  // What the marketplace's sliders test is part of the state the board and the slides read, as it is on the real board.
  const tested = useMemo(() => (marketplace ? { ...state, whatIf } : state), [marketplace, state, whatIf]);
  const withDeck = deck ? { ...tested, deck } : tested;
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
  // A marketplace's five (§22.10.1): the buyers' two, then the sellers' three, read the same way.
  const mktTargets = {
    firstOrder: formatPercent(EXAMPLE_MKT_TARGETS["mkt.buy.first-order"]!, locale),
    fillRate: formatPercent(EXAMPLE_MKT_TARGETS["mkt.liq.fill-rate"]!, locale),
    firstSale: formatPercent(EXAMPLE_MKT_TARGETS["mkt.sell.first-sale"]!, locale),
    paidConversion: formatPercent(EXAMPLE_MKT_TARGETS["mkt.sell.paid-conversion"]!, locale),
    paidChurn: formatPercent(EXAMPLE_MKT_TARGETS["mkt.sell.paid-churn"]!, locale),
  };
  const bannerTitle = marketplace ? e.bannerTitleMkt : app ? e.bannerTitleApp : e.bannerTitle;
  const bannerBody = marketplace
    ? fillTemplate(e.bannerBodyMkt, mktTargets)
    : app
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
          // A marketplace's side slides are worded with that side's words (§22.8.1), as in the island's own deck.
          stringsBySide={marketplace ? { demand: stringsFor(type, "products", "demand"), supply: stringsFor(type, "products", "supply") } : undefined}
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
  const view = { state: tested, derived, strings, metrics, derivedCopy, bridges, ctx, tourResult: null, tourOnDevice: false, deviceTour: null };
  const relays = derived.motions.find((m): m is Extract<MotionDerived, { motion: "slg" }> => m.motion === "slg");
  // As the board does: the diagnosis prints each named stage's value next to its comparator. A marketplace's sides do it themselves.
  const values: Partial<Record<CandidateId, Interval>> = {};
  if (!marketplace) {
    for (const id of [...candidatesFor(state.setup, "plg"), ...candidatesFor(state.setup, "slg")]) {
      const known = knownIn(state, id, ctx);
      if (known.kind === "known") values[id] = known.value;
    }
  }
  return (
    <div className={styles.panel} data-testid="engine-example">
      <Callout tone="caveat">
        <h2 id="engine-example-title" ref={heading} tabIndex={-1} className={styles.exampleTitle}>
          {bannerTitle}
        </h2>
        <p>{bannerBody}</p>
      </Callout>
      {verdict === null ? (
        <MarketExample view={view} stringsFor={(side) => stringsFor(type, "products", side)} side={side} onSide={setSide} onWhatIf={setWhatIf} />
      ) : withPlg && withSlg ? (
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

const nothing = () => {};

/**
 * A marketplace example's board (§22.6.2, §22.10): the band of the two streams, the coverage, « Côté affiché » and the side it
 * shows, drawn by the very pieces of the real board (`Board.tsx#MarketBoard`) on a view with no action. What the real board adds
 * around them (the bar, the next step, the list of numbers, the table entry) all write or navigate, so the example leaves them
 * out, as the SaaS's does. The sliders of a side write to `onWhatIf`, the example's own memory; the two buttons a side can show
 * (its targets, its settings) cannot appear on this data set, and do nothing if they did.
 */
function MarketExample({
  view,
  stringsFor,
  side,
  onSide,
  onWhatIf,
}: {
  view: EngineView;
  /** The words of a side (§22.8.1): what that side shows reads them; the band, the coverage and the selector read the view's neutral set. */
  stringsFor: (side: MktSide) => EngineStrings;
  side: MktSide;
  onSide: (side: MktSide) => void;
  onWhatIf: (targets: Partial<Record<LeverId, number>>) => void;
}) {
  const { strings } = view;
  const band = mktTotalView(view);
  return (
    <>
      {band ? (
        <StreamsBand
          eyebrow={band.eyebrow}
          title={band.title}
          headingId="engine-verdict"
          engines={band.engines.map((engine) => ({
            id: engine.id,
            label: engine.label,
            value: <span data-testid={`engine-total-mrr-${engine.id}`}>{engine.value}</span>,
            missing: engine.missing,
            "data-testid": `engine-total-${engine.id}`,
          }))}
          total={{ label: band.total.label, value: band.total.value, missing: band.total.missing, "data-testid": "engine-total-sum" }}
          totals={band.totals}
          link={band.line ? <p data-testid="engine-total-link">{band.line}</p> : null}
          data-testid="mkt-total"
        />
      ) : null}
      <Coverage coverage={view.derived.coverage} strings={strings} />
      <SideShown
        label={strings.mkt.side.selector}
        sides={[
          { id: "demand", label: strings.mkt.side.demand },
          { id: "supply", label: strings.mkt.side.supply },
        ]}
        value={side}
        onChange={onSide}
        title={side === "demand" ? strings.mkt.side.demandTitle : strings.mkt.side.supplyTitle}
        note={strings.mkt.side.note}
        headingId="engine-side"
        data-testid="engine-side-selector"
      />
      <MarketSide
        key={side}
        view={{ ...view, strings: stringsFor(side) }}
        side={side}
        past={false}
        verdictId={band ? "engine-motion-verdict" : "engine-verdict"}
        onWhatIf={onWhatIf}
        onTargets={nothing}
        onSettings={nothing}
      />
    </>
  );
}
